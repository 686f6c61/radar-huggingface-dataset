# FrenchCastle/Solomon-MLX-8bit

## Resumen

Solomon es un modelo de decisión de pesos abiertos: un modelo de lenguaje que no genera texto libre, sino que recibe un documento una sola vez y responde a preguntas tipadas devolviendo probabilidades calibradas sobre las opciones que se le indican. Nunca emite un token fuera del conjunto de opciones, nunca mantiene un turno de conversación y no muestrea: el mismo documento con la misma pregunta devuelve exactamente los mismos números. `FrenchCastle/Solomon-MLX-8bit` es una derivación cuantizada a 8 bits del build BF16, empaquetada para Apple Silicon sobre el runtime MLX, y está pensada para Macs con 48 GB de memoria unificada.

El repositorio es una derivación no oficial del release upstream `DoccyHealth/Solomon` 1.1.0 (Apache-2.0), del que hereda adaptador, cabezas y pines. Según las etiquetas del repositorio, el backbone pertenece a la familia Qwen3 (etiqueta `qwen3.8`) con un adaptador LoRA y decodificación no autorregresiva, aunque el número exacto de parámetros no se publica en la información disponible. El peso del repositorio es de 31,6 GB en formato safetensors de MLX.

Su relevancia es de nicho pero clara: convierte contratos, cartas, formularios, tickets, listados y registros en respuestas estructuradas y legibles por máquina con un número asociado a cada una, en escenarios donde la determinismo y la ausencia de deriva importan más que la fluidez. No es un modelo de chat, generación, resumen ni respuesta abierta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de la familia Qwen3 (etiqueta `qwen3.8`) más adaptador LoRA y cabezas de decisión; decodificación no autorregresiva según las etiquetas del repositorio. Detalle exacto no disponible |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE; no se especifica en la información disponible) |
| Longitud de contexto | No disponible (el ejemplo de la model card hace prefill de aproximadamente 2.000 tokens) |
| Tipos de cuantización | 8 bits afín de MLX (perfil `quality-q8`); existe un build BF16 (perfil `quality`) y un build de 4 bits (`quality-q4`) en preparación |
| Idiomas soportados | Inglés y multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors de MLX (`mlx`, `safetensors`), más un parche de runtime `runtime-patch-ac4f9cc.diff` |
| Tamaño del repositorio | 31,6 GB |
| Pipeline declarado | `text-classification` |
| Modelo base | `FrenchCastle/Solomon-MLX-bf16` |
| Release upstream | `DoccyHealth/Solomon` 1.1.0 |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí describe es la topología de inferencia: un backbone transformer con un adaptador LoRA y cabezas específicas, que se usa en dos fases. Primero se hace un prefill del documento completo y se conserva un estado; después se evalúa cada pregunta como una rama independiente sobre ese estado. Para preguntas de tipo elección o entidad, cada candidato se evalúa como una rama separada (aproximadamente 110 tokens por rama en el ejemplo publicado), y las probabilidades devueltas se normalizan según el tipo de pregunta (por ejemplo, una elección única suma 1 sobre las opciones).

La innovación destacable no es de arquitectura sino de contrato de salida: el modelo no genera tokens libres, sino que emite decisiones tipadas con probabilidad calibrada (`noul` para sí/no y para candidatos, `choice` para elección única y ordenada), con determinismo estricto entre ejecuciones idénticas. La model card también documenta que el cuello de botella real del runtime son las rutas por token de atención (historial de estado de atención lineal y atención con padding por la izquierda), no la precisión del backbone, y anuncia un parche de velocidad para esas rutas.

## Capacidades

- Respuesta a preguntas tipadas sobre un documento previamente prefijado, con cinco formatos de salida: sí/no (una probabilidad), elección única sobre 2–8 opciones (probabilidades que suman 1), elección ordenada sobre niveles, entidad (una probabilidad por candidato, hasta 64) y multi-etiqueta (una probabilidad por candidato, hasta 64).
- Probabilidades calibradas en lugar de texto generado, lo que permite fijar umbrales y enrutar casos dudosos.
- Determinismo estricto: el mismo documento y la misma pregunta devuelven los mismos números en cada ejecución.
- Comprensión de documentos: contratos, cartas, formularios, tickets, listados y registros.
- Desambiguación de entidades contra una lista cerrada de candidatos.
- Etiquetado multi-etiqueta con vocabulario cerrado de hasta 64 etiquetas.
- Multilingüe según los metadatos del repositorio (inglés y multilingüe), sin evaluación publicada por idioma.
- No soporta, según la propia model card: respuesta abierta, chat, generación de texto ni resumen.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico.

## Casos de uso

- Extracción estructurada de contratos: se prefija el contrato una vez y se lanzan preguntas tipadas del tipo «¿el documento establece que X dispone de certificación vigente?» o «¿qué plazo de pago se indica?» con opciones cerradas, obteniendo campos estructurados con probabilidad asociada y resultado reproducible entre ejecuciones.
- Triaje de tickets de soporte: etiquetado multi-etiqueta sobre un vocabulario cerrado de categorías (facturación, incidencia técnica, devolución, etc.), usando las probabilidades para fijar umbrales de enrutado automático.
- Enrutado documental en pipelines de digitalización: desambiguación de entidades contra listas de candidatos (transportista, proveedor, entidad emisora), con hasta 64 candidatos por pregunta.
- Verificación documental en procesos de cumplimiento o alta de clientes: batería de preguntas de sí/no sobre certificaciones, vigencias y condiciones declaradas, con umbral de probabilidad auditable y sin variabilidad entre ejecuciones.
- Enriquecimiento de registros y listados: etiquetado de atributos de producto o de expediente sobre vocabularios controlados, generando columnas numéricas directamente consumibles por sistemas posteriores.
- Revisión asistida con humano en el bucle: las probabilidades por candidato permiten derivar automáticamente los documentos por debajo de un umbral a revisión manual, con trazas de consumo (ramas, tokens de entrada, llamadas de evidencia) devueltas por el propio modelo.
- Procesado de documentación sensible en local: al ejecutarse sobre MLX en Apple Silicon, permite tratar contratos o expedientes sin enviar los documentos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente publica una microbenchmark de una capa Linear de 5120×5120 comparando la matmul afín de 8 bits de MLX con BF16:

| Entrada | 8 bits | BF16 |
|---|---|---|
| 2.048 tokens (prefill) | 17,6 ms | 17,4 ms |
| 128 tokens | 2,8 ms | 2,4 ms |
| 1 token | 5 veces más rápida que BF16 | referencia |

Datos de latencia publicados para el build de 8 bits en un Mac M-series de 128 GB con mlx 0.32.2:

| Métrica | Valor |
|---|---|
| Carga del modelo | 13 s |
| Prefill de documento | ≈17 s para ≈2.000 tokens (≈120 tokens/s) |
| Coste por rama candidata | ≈2 s (≈110 tokens por rama) |
| Documento con 7–10 candidatos | 30–35 s |

## Requisitos de hardware

- Memoria unificada estimada para el build de 8 bits: unos 36 GB, sobre un Mac de 48 GB.
- Build BF16: 55,6 GB de pesos y unos 60 GB de memoria unificada, requiere un Mac de 96 GB o 128 GB.
- Build de 4 bits (en preparación): unos 22 GB de memoria unificada, sobre un Mac de 32 GB.
- Plataforma: exclusivamente Apple Silicon con MLX. No se documenta soporte para CUDA, vLLM, llama.cpp, Ollama ni TGI.
- Entorno fijado por el release: Python 3.13, mlx 0.32.2, mlx-vlm 0.7.1, sobre el checkout `ac4f9ccf` del repositorio upstream.
- Carga: 13 s con el build de 8 bits y 30 s con el de BF16 en un Mac M-series de 128 GB.
- Latencia observada: la misma en BF16 y en 8 bits, porque la determina el runtime y no la precisión del backbone (≈17 s de prefill más ≈2 s por rama candidata).
- La model card recomienda limitar la caché de búferes de MLX a 4 GB antes de cargar (`mx.set_cache_limit(4 << 30)`).
- Es necesario aplicar `runtime-patch-ac4f9cc.diff` con `git apply` antes de cargar este build, ya que el runtime upstream solo acepta su perfil BF16 `quality`.

## Comparativa con modelos similares

No se identifican en la información disponible modelos competidores directos de la misma categoría (modelos de decisión con salida probabilística tipada). La comparación factible es entre los tres builds del propio Solomon:

| Build | Perfil | Pesos | Memoria unificada | Mac objetivo | Carga |
|---|---|---|---|---|---|
| `Solomon-MLX-bf16` | `quality` | 55,6 GB | ≈60 GB | 96 GB o 128 GB | 30 s |
| `Solomon-MLX-8bit` (este repositorio) | `quality-q8` | 31,6 GB | ≈36 GB | 48 GB | 13 s |
| `Solomon-MLX-4bit` | `quality-q4` | No disponible (en preparación) | ≈22 GB | 32 GB | No disponible |

Los tres comparten adaptador, cabezas y pines, y solo difieren en la precisión del backbone.

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para chat, respuesta abierta, generación de texto ni resumen, tal como advierte la propia model card.
- Solo responde dentro del conjunto de opciones o candidatos proporcionado; no descubre categorías ni respuestas fuera de esa lista.
- El coste se escala con el número de candidatos (aproximadamente 2 s por rama), de modo que una pregunta con 64 candidatos puede añadir en torno a dos minutos de cómputo en el hardware de referencia.
- La longitud de contexto no está publicada; el único dato disponible es un ejemplo de prefill de aproximadamente 2.000 tokens.
- No se han publicado evaluaciones de calidad, calibración ni sesgo; las afirmaciones sobre calibración proceden del autor y no están verificadas de forma independiente.
- No se documenta un proceso de entrenamiento (tokens, composición del dataset, alineación), lo que dificulta evaluar sesgos y cobertura idiomática; solo hay una declaración genérica de soporte multilingüe sin evaluación por idioma.
- Riesgo de alucinación: aunque el modelo no puede emitir tokens fuera de las opciones, puede asignar probabilidad alta a una opción incorrecta si las instrucciones o los candidatos están mal formulados.
- Dependencia fuerte del entorno: requiere el checkout fijado `ac4f9ccf`, versiones concretas de mlx y mlx-vlm, y la aplicación de un parche de runtime propio de este repositorio.
- Compatibilidad limitada a Apple Silicon; no hay ruta documentada para GPU NVIDIA ni para servidores de inferencia convencionales.
- La model card menciona una «licence-text tolerance» descrita en la sección de procedencia; conviene revisarla antes de desplegar en producción.
- Repositorio derivado no oficial, con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Licencia Apache-2.0, que permite uso comercial, pero el repositorio upstream (`DoccyHealth/Solomon`) mantiene su propia licencia y condiciones que deben respetarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FrenchCastle/Solomon-MLX-8bit
- Build BF16 del mismo autor: https://huggingface.co/FrenchCastle/Solomon-MLX-bf16
- Release upstream: https://huggingface.co/DoccyHealth/Solomon
- Runtime MLX: https://github.com/ml-explore/mlx
- Búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos corresponden a contenido no relacionado (hoteles en Tremosine sul Garda) y se descartan.
