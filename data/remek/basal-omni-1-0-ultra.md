# Remek/basal-omni-1.0-ultra

## Resumen

basal-omni-1.0-ultra es un modelo experimental de 31.273.086.512 parámetros (31,27 B) desarrollado por Remek sobre la base de google/gemma-4-31B-it. No es un modelo generativo al uso: en lugar de redactar una respuesta, recibe un *estado* (un mensaje, un documento, pasajes recuperados, una traza de agente o una página web en JSON) y devuelve, en un único forward pass, una distribución de probabilidad calibrada sobre un conjunto cerrado de respuestas permitidas. Los tipos de pregunta soportados incluyen `choice`, `noul` (sí/no), `score` y, dentro del motor basal, `multi`, `act` y `tool`; este último selecciona una herramienta a partir de definiciones de OpenAI o MCP, no sus argumentos.

El modelo es la variante mayor de la línea basal-omni y sustituye la base Bielik (11B) de basal-1.5 por Gemma 4 (31B). Frente a basal-1.5-max amplía el límite de opciones por pregunta de 10 a 255, usa un único orden de opciones por defecto y añade soporte de imágenes en la misma petición de forma zero-shot, aprovechando el encoder visual de Gemma 4 sin entrenamiento específico sobre medios. No admite audio, porque la base de 31B no incluye encoder de audio.

Se entrenó sobre aproximadamente 640.000 decisiones tipadas en polaco e inglés, con objetivos suaves (soft targets) generados por basal-1.5. Su relevancia práctica está en que permite construir clasificadores, enrutadores y políticas de decisión con garantías de calibración y con respuestas que nunca caen fuera del conjunto de opciones, algo que un LLM generativo no asegura por diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la base Gemma 4, con encoder de imagen de Gemma 4 para entradas visuales; la salida es una decisión tipada sobre opciones permitidas, no texto libre |
| Parametros totales | 31.273.086.512 (31,27 B) |
| Longitud de contexto | No disponible como cifra oficial en la información proporcionada; el servidor en modo `eager` sobre una GPU de 80 GB admite estados de hasta aproximadamente 10.000 tokens |
| Tipos de cuantizacion | bf16 en modo `eager` (unos 62 GB de pesos); checkpoint FP8 independiente (basal-omni-1.0-ultra-FP8) para el modo `vllm` en texto; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura parte de la base Gemma 4 de 31B, un transformer decoder-only, y le superpone una cabeza de decisión que puntúa cada opción permitida en un solo paso hacia delante. No se genera texto intermedio ni cadena de razonamiento: el modelo calcula una probabilidad por opción, de modo que la respuesta está siempre contenida en el conjunto de opciones definido por el cliente y viene acompañada de una medida explícita de confianza. Las entradas visuales se procesan con el encoder de imagen propio de Gemma 4, sin entrenamiento sobre medios en esta versión (comportamiento zero-shot); la base de 31B no incorpora encoder de audio, por lo que este nivel no acepta audio. La información disponible no detalla si la base emplea atención lineal, decodificación especulativa ni otras innovaciones de eficiencia.

El entrenamiento se realizó sobre aproximadamente 640.000 decisiones tipadas en polaco e inglés, con objetivos suaves destilados de basal-1.5. El motor basal añade funcionalidad que no vive en los pesos: soporte de hasta 255 opciones por pregunta, tipos `multi` (selección múltiple), `act` y `tool` (elección de herramienta sobre definiciones OpenAI o MCP), gestión de medios (`--media on`), umbrales de calibración por tipo de pregunta y un modo `--deterministic` que sirve una petición por forward. La API expuesta (`/v1/systemone`) es la misma que la de basal-1.5, lo que facilita migrar entre niveles.

## Capacidades

- Decisión tipada con probabilidad calibrada: responde preguntas de tipo `choice`, `noul` (sí/no) y `score` devolviendo una probabilidad por opción en un único forward pass.
- Hasta 255 opciones por pregunta, frente a las 10 de basal-1.5.
- Selección de herramientas (`tool`) sobre definiciones de herramientas de OpenAI o MCP; elige la herramienta, no genera sus argumentos.
- Acciones y decisiones múltiples (`multi`, `act`) en el motor basal.
- Entrada de imágenes en la misma petición, en modo zero-shot, a través del encoder visual de Gemma 4.
- Procesamiento de estados heterogéneos: mensajes, documentos, pasajes recuperados, trazas de agente y páginas web en JSON.
- Bilingüe polaco-inglés, con corpus de evaluación separados en ambos idiomas.
- Umbrales de calibración por tipo de pregunta, con derivación a revisión humana cuando no existe umbral certificado.
- No soporta audio ni generación de texto libre como respuesta.

## Casos de uso

- **Triaje de tickets de soporte:** se envía el texto del ticket como estado y una pregunta `choice` con los departamentos como opciones; el modelo devuelve la probabilidad de cada uno y la respuesta nunca sale del catálogo de departamentos definido, lo que evita enrutamientos inválidos.
- **Enrutamiento de herramientas en agentes:** con las definiciones MCP u OpenAI como opciones, una pregunta `tool` selecciona qué herramienta invocar antes de que el planificador genere los argumentos; el coste es un solo forward por paso, sin generación.
- **Clasificación de documentos escaneados o capturas:** al aceptar imágenes zero-shot, permite clasificar un PDF renderizado o una captura de pantalla en categorías predefinidas sin pipeline OCR separado, aunque con la cautela de no haber recibido entrenamiento sobre medios.
- **Validación de contratos y condiciones:** preguntas de tipo `noul` sobre cláusulas concretas (por ejemplo, si existe cláusula de renovación automática) con umbral de confianza para derivar los casos dudosos a revisión legal; la categoría de contratos obtiene 0.822 en Werdykt v1, por lo que conviene reservar revisión humana en los casos límite.
- **Evaluación automática de respuestas (LLM-as-judge acotado):** formulando el juicio como una pregunta `score` o `choice` sobre criterios fijos, se obtiene una puntuación calibrada y comparable entre lotes; en JudgeBench el modelo alcanza 0.700 frente a 0.600 de basal-omni-1.0-max.
- **Cumplimiento y políticas con cobertura medida:** usando los umbrales por tipo, se automatiza solo la fracción de casos con error controlado (56,8 % al 1 % de error con los umbrales publicados) y el resto se encamina a revisión humana, lo que hace auditable la tasa de automatización.
- **Detección de urgencia en atención al cliente:** una pregunta `noul` sobre si el cliente ha perdido acceso al servicio, combinada con la pregunta de departamento en la misma petición, permite priorizar la cola sin una segunda llamada al modelo.
- **Moderación y clasificación de contenido en dos idiomas:** el soporte pl/en con paneles de evaluación en ambos idiomas permite desplegar la misma política en mercados polaco e inglés manteniendo una única definición de categorías.

## Benchmarks y rendimiento

Resultados publicados por el autor, servidos con el motor basal: basal-omni-1.0-ultra en una H200 y basal-omni-1.0-max en una H100, ambos con `--mode eager`, bf16 y un orden de opciones; basal-1.5-max tal como se publicó (`--mode fast`, dos órdenes de opciones). Mismos ítems y mismos clientes para los tres modelos, medidos con basal 2.0.

| Benchmark | basal-omni-1.0-ultra (31B) | basal-omni-1.0-max (12B) | basal-1.5-max (11B) |
|---|---|---|---|
| Werdykt v1, macro (PL + EN oculto, 10 categorías × 2 idiomas) | **0.879** | 0.823 | 0.773 |
| Decisiones PL (test held-out de basal-1.0, 7.081 ítems) | **0.979** | 0.954 | 0.940 |
| PL general (conocimiento, exámenes, lectura; 3.079 ítems) | **0.823** | 0.810 | 0.797 |
| PL-Real (300 documentos polacos reales) | 0.973 | 0.980 | 0.970 |
| Panel externo EN (10 tareas públicas de decisión, 3.842 ítems) | **0.855** | 0.789 | 0.737 |
| Cobertura al 1 % de error (con el umbral publicado) | 56,8 % | 47,4 % | 62,2 % |

Detalle adicional aportado por el autor:

| Métrica | Valor |
|---|---|
| Werdykt v1, intervalo de confianza al 95 % | 0.871–0.887 (polaco 0.881, inglés 0.877) |
| Diferencia frente a basal-omni-1.0-max en Werdykt v1 | +5,6 puntos |
| Diferencia frente a basal-1.5-max en Werdykt v1 | +10,6 puntos |
| Decisiones PL frente a basal-omni-1.0-max | +2,5 puntos (IC 95 %: +2,0 a +3,1) |
| Panel externo EN frente a basal-omni-1.0-max | +6,9 puntos; mejor en 9 de 10 tareas |
| WinoGrande | 0.863 (frente a 0.710 de max) |
| BIG-Bench Hard | 0.883 (frente a 0.809 de max) |
| JudgeBench | 0.700 (frente a 0.600 de max) |
| FinancialPhraseBank | 0.947 (frente a 0.967 de max; única tarea en desventaja) |
| Test de corpus EN de 1.479 ítems | 0.751 (frente a 0.724 de max y 0.659 de basal-1.5-max) |
| Categorías más débiles en Werdykt v1 | rules 0.550, contracts 0.822, documentos largos 0.854 |
| Cobertura con umbral único agrupado (regla de basal-1.5-max) | 77,5 % a 0,75 % de error |
| Reproducibilidad basal 2.1 frente a 2.0 | misma respuesta top en 23.278 de 23.278 filas de comprobación |

## Requisitos de hardware

- **VRAM en bf16 (modo `eager`):** aproximadamente 62 GB solo para los pesos, según la model card.
- **GPU recomendadas:** una H200 (usada en las mediciones del autor) o una H100/A100 de 80 GB. En una GPU de 80 GB el servidor admite estados de hasta unos 10.000 tokens.
- **Cabe en GPU de consumo:** no. Con 62 GB en bf16 y unos 31 GB en el checkpoint FP8, no entra en una RTX 4090 (24 GB) ni en GPUs de 48 GB en bf16.
- **Opciones de despliegue:** motor propio `basal-serve` (instalación vía `uv pip install "basal[media] @ .../v2.2.0.tar.gz"`, torch 2.11.0 con CUDA 12.8). Modo `eager` en PyTorch bf16 con soporte de medios; modo `vllm` únicamente con el checkpoint FP8 y solo texto. El modo `fast` (prefijo compartido y CUDA graphs) llegará en una versión posterior de la línea. No se documentan llama.cpp, Ollama ni TGI.
- **Latencia y throughput:** no se publican cifras de latencia ni de tokens por segundo. El modelo resuelve cada petición en un único forward pass y no genera tokens de respuesta; en modo `--deterministic` se sirve una petición por forward. Las mediciones del autor usan una H200 para este modelo y una H100 para basal-omni-1.0-max.

## Comparativa con modelos similares

| Modelo | Parámetros | Base | Contexto | Werdykt v1 (macro) | Panel EN | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| basal-omni-1.0-ultra | 31,27 B | Gemma 4 31B-it | No disponible (estados de ~10.000 tokens en 80 GB) | 0.879 | 0.855 | apache-2.0 | Pesos safetensors en HuggingFace + checkpoint FP8 |
| basal-omni-1.0-max | 12 B (según la model card) | No detallada | No disponible | 0.823 | 0.789 | No disponible en la información proporcionada | Distribución por el mismo motor basal |
| basal-1.5-max | 11 B | Bielik | No disponible | 0.773 | 0.737 | No disponible en la información proporcionada | Versión publicada de la línea anterior |
| google/gemma-4-31B-it | 31 B (base) | Gemma 4 | No disponible | No disponible | No disponible | No disponible en la información proporcionada | Modelo base en HuggingFace |

Frente a sus dos alternativas directas de la misma familia, basal-omni-1.0-ultra gana en Werdykt v1, decisiones PL, conocimiento general PL y panel externo EN, empata en PL-Real (0.973 frente a 0.980 de max, intervalo con cero) y pierde en FinancialPhraseBank. La contrapartida es el coste: 31B en bf16 exige una GPU de 80 GB, mientras que las variantes de 11-12B son mucho más baratas de servir. No se dispone de comparación publicada con clasificadores dedicados de tamaño similar ajenos a la familia.

## Limitaciones y advertencias

- **Estado experimental:** el propio autor etiqueta la versión como experimental; el modo `fast` no está disponible en este lanzamiento y el soporte de imágenes es zero-shot.
- **Sin entrenamiento sobre medios:** las imágenes se leen con el encoder de Gemma 4 sin ajuste específico, por lo que el rendimiento visual puede degradarse fuera de dominios convencionales y no hay métricas publicadas de tareas visuales.
- **Sin audio:** la base de 31B no incorpora encoder de audio y este nivel no acepta entradas de audio.
- **Categorías débiles:** en Werdykt v1, `rules` cae a 0.550; el autor recomienda calcular umbrales y fechas exactos en código en lugar de delegar en el modelo. `contracts` (0.822) y documentos largos (0.854) también quedan por debajo de la media.
- **Cobertura limitada con los umbrales publicados:** al objetivo del 1 % de error solo se automatiza el 56,8 % de las preguntas; los tipos sin umbral certificado (por ejemplo, `score`) se derivan a una persona.
- **Calibración dependiente del dominio:** las probabilidades están calibradas sobre los corpus de entrenamiento y evaluación (polaco e inglés); fuera de esa distribución la confianza puede no ser fiable y no debe usarse como garantía sin recalibración.
- **Alcance de idioma:** solo polaco e inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- **Formato de salida restringido:** no genera texto libre; cualquier caso de uso que requiera explicaciones o argumentación necesita un modelo generativo adicional.
- **Licencia:** los pesos se publican como apache-2.0, pero al ser un derivado de google/gemma-4-31B-it conviene verificar las condiciones que la licencia de la base impone al uso comercial antes de desplegar en producción.
- **Requisitos de infraestructura:** 62 GB de pesos en bf16 y una GPU de 80 GB como mínimo razonable; el FP8 solo cubre texto y solo en modo `vllm`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Remek/basal-omni-1.0-ultra
- Checkpoint FP8 (solo texto, modo `vllm`): https://huggingface.co/Remek/basal-omni-1.0-ultra-FP8
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio del motor de inferencia basal: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- uv (gestor de entornos usado en la instalación): https://docs.astral.sh/uv/

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre el proyecto basal; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
