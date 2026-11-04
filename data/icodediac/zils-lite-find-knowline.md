# icodediac/zils-lite-find-knowline

## Resumen

KnowLine-0.8B-Gen1 es un modelo de decisión de 0,8 mil millones de parámetros desarrollado por PelaAI, un equipo con sede en Japón, mediante ajuste fino supervisado (LoRA SFT) sobre Qwen3.5-0.8B. No es un modelo generativo conversacional al uso: su función es mapear un estado estructurado y una o varias preguntas tipadas (elección entre opciones, sí/no y puntuaciones ordenadas) a una distribución de probabilidad sobre las opciones suministradas. La respuesta se obtiene leyendo directamente la probabilidad de cada etiqueta de opción en la cabeza del modelo, sin generar texto libre.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en safetensors y compatibilidad con la librería `transformers`. Soporta únicamente inglés y chino (simplificado y tradicional), y aunque su pipeline declarado es `image-text-to-text`, no ha recibido entrenamiento con imágenes: la torre de visión es la del modelo base, sin ajustar.

Su relevancia actual radica en la propuesta de un modelo pequeño y rápido (mediana de 24,6 ms por petición en una H20) para tareas de enrutamiento, clasificación y decisión estructurada, con probabilidades calibradas (temperatura de lectura T = 1,54 integrada en los pesos y ECE de 0,008-0,012 en la suite pública). Es un lanzamiento temprano, con cero descargas y cero likes en HuggingFace en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-0.8B (con torre de vision del modelo base, sin entrenar); ajuste fino LoRA fusionado en bf16 |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 12.288 tokens por fila en entrenamiento; lectura doble para peticiones de texto corto (hasta 3.000 tokens leidos una vez) |
| Tipos de cuantizacion | No disponible (los pesos publicados estan en bf16; no se documentan otras cuantizaciones) |
| Idiomas soportados | Ingles (en) y chino simplificado y tradicional (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y se entrena con una época de LoRA SFT (rango 32, alpha 64) aplicada únicamente a las capas lineales del modelo de lenguaje, con posterior fusión en pesos bf16. El checkpoint publicado corresponde al final del entrenamiento. El conjunto de datos de entrenamiento es el mismo que el de KnowLine-9B-Gen1: 1.143.656 filas renderizadas con la plantilla de chat de Qwen3.5, con un máximo de 12.288 tokens por fila. El dataset no se incluye en el repositorio.

La innovación técnica principal es el mecanismo de lectura probabilística: en lugar de generar texto, el modelo lee la probabilidad de cada etiqueta de opción directamente de los logits. La temperatura de lectura T = 1,54 se ha ajustado sobre los conjuntos dorados del equipo y se ha plegado en `model.language_model.norm.weight`; además, `temperatures.json` divide los logits de las preguntas de puntuación por 0,6494 (= 1/1,54), de modo que estas se leen a temperatura efectiva 1,0. El frontend incluido (`knowline_server.py`, `knowline_engine.py`, `knowline_layout.py`) renderiza los prompts con `enable_thinking=False`.

## Capacidades

- Preguntas de elección con opciones nombradas (choice).
- Preguntas de sí/no (yes/no).
- Preguntas de puntuación ordenada (ordered score).
- Lectura de probabilidades calibradas por opción, sin generación de texto libre.
- Temperatura de lectura integrada en los pesos, de modo que el frontend opera a temperatura 1.
- Lectura doble para peticiones cortas de solo texto (hasta 3.000 tokens leídos una vez).
- Procesamiento de entradas con imágenes a través de la torre de visión del modelo base (sin entrenamiento específico en visión).
- Soporte multilingüe limitado a inglés y chino (simplificado y tradicional).
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del caso como estado y una pregunta de elección con las opciones de equipo (facturación, soporte técnico, etc.), devolviendo la probabilidad de cada ruta. Su latencia de 24,6 ms mediana permite clasificar en tiempo real dentro de un pipeline de atención al cliente.
- Decisión de reembolsos y devoluciones: con una pregunta de sí/no sobre un estado descriptivo ("el paquete llegó dañado"), el modelo devuelve la probabilidad de concesión, útil como señal previa a la revisión humana.
- Moderación y triaje de contenido: preguntas de sí/no o de puntuación ordenada sobre textos cortos permiten asignar niveles de riesgo con probabilidades calibradas (ECE de 0,008-0,012), lo que facilita fijar umbrales operativos.
- Clasificación de documentos en chino e inglés: al soportar ambos idiomas, puede emplearse para etiquetar documentos entrantes en flujos bilingües sin necesidad de un modelo mayor.
- Puntuación de candidatos en pipelines de ranking: las preguntas de puntuación ordenada permiten obtener una distribución sobre niveles (por ejemplo, relevancia de 1 a 5) para reordenar resultados.
- Señal de decisión en sistemas con restricciones de latencia y coste: al ejecutarse en una sola GPU H20 con 24,6 ms de mediana y 39,6 ms de media, encaja en servicios de alto volumen donde un modelo generativo resultaría demasiado costoso.
- Evaluación de robustez frente a inyección de instrucciones: el equipo reporta que solo el 2,1 % de las respuestas se desplazaron a una opción plantada con plantillas vistas en entrenamiento y el 4,2 % con plantillas no vistas, lo que lo hace apto para entornos donde la entrada puede contener texto adversario.

## Benchmarks y rendimiento

| Medicion | Resultado |
|---|---:|
| Decision Index 0.3 publico (suite publica) | 44,51 |
| Indice bruto publico | 58,35 |
| Peticiones / peticiones puntuables | 140.620 / 140.178 |
| Respuestas puntuables / errores / no soportadas | 140.178 / 0 / 0 |
| Latencia con una peticion a la vez: mediana / media / percentil 95 | 24,6 / 39,6 / 117,3 ms |
| Conjuntos internos retenidos (ingles / chino simplificado / chino tradicional) | 57,9 / 63,5 / 53,4 |
| C-Eval | 56,3 |
| Open-Jev 1.1 test / OOD | 71,5 / 69,7 |
| JevBench / JevBench-hard | 71,9 / 49,5 |
| Tareas de decision de dominios nuevos (45 tareas propias) | 23,5 |
| S1MB (ingles v1, ejecucion local, 137 benchmarks, 26.269 decisiones) | Task Avg 34,17 |
| ECE en la suite publica (metodo del board) | 0,008-0,012 |

La ejecución del Decision Index 0.3 se realizó el 29 de octubre de 2026 con los archivos del repositorio (bf16, lectura doble) usando el kit oficial (commit `62d2f51`), distribuida en cuatro servidores H20 idénticos con 32 fragmentos de cliente, sin reintentos ni truncamientos. La puntuación completa del Decision Index 0.4.1 aún no está disponible para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 852.985.920 parámetros en bf16, los pesos ocupan aproximadamente 1,7 GB, a los que hay que sumar la torre de visión y el estado de activaciones.
- GPU recomendadas: el equipo reporta ejecuciones en NVIDIA H20; por tamaño, debería caber en GPU de consumo con suficiente VRAM, aunque no se documentan pruebas en RTX 4090 u otras.
- Despliegue: el repositorio incluye un frontend propio (`serve_knowline.sh`, `knowline_server.py`, `knowline_engine.py`, `knowline_layout.py`) sobre SGLang 0.5.21, además de `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: 24,6 ms de mediana, 39,6 ms de media y 117,3 ms en el percentil 95 con una petición a la vez en una H20.
- Throughput: no disponible.

## Comparativa con modelos similares

Datos del snapshot del board Decision Index (multimodalart/jev-decision-index @ c130faf6, generado el 29 de octubre de 2026 a las 14:04 UTC):

| Modelo | Tamano | DI 0.3 publico | DI 0.4.1 completo | Fuente |
|---|---:|---:|---:|---|
| **KnowLine-0.8B-Gen1** | 0,8B | **44,51** | aun sin puntuar | ejecucion propia, kit oficial |
| GLiClass v4 edge | 0,4B | 47,49 | 31,21 | board |
| OneJev1.6-0.8B | 0,9B | 48,76 | 29,58 | board |
| crystal-0.8b | 0,9B | 42,79 | 29,37 | board |
| vLLM-SR vela3-fast | 0,4B | 50,36 | 29,27 | board |
| StartLux-Decision v1.1 0.8B | 0,9B | 53,79 | 28,88 | board |

En la suite pública 0.3, KnowLine-0.8B-Gen1 queda por debajo de todos los comparables listados, mientras que su puntuación completa 0.4.1 no está disponible. La comparación de contexto, licencia y disponibilidad de los modelos alternativos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Cero descargas y cero likes en HuggingFace en el momento de la ficha: no hay validación independiente por parte de la comunidad.
- La puntuación del Decision Index 0.4.1 no está disponible; solo se ha publicado la ejecución propia de la suite 0.3.
- Riesgo de inyección de instrucciones: el 2,1 % de las respuestas se desplazaron a una opción plantada con plantillas vistas en entrenamiento y el 4,2 % (25 de 600) con plantillas no vistas, dentro del objetivo del 5 % del equipo pero no despreciable en producción.
- Rendimiento bajo en tareas de decisión de dominios nuevos (23,5 sobre 45 tareas propias), lo que sugiere poca generalización fuera de la distribución de entrenamiento.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- No genera texto libre: no es adecuado para tareas conversacionales o de generación abierta.
- Sin entrenamiento en imágenes pese al pipeline `image-text-to-text`; las capacidades de visión corresponden al modelo base y no están evaluadas.
- El dataset de entrenamiento no se publica, lo que limita la reproducibilidad.
- La plantilla de chat de Qwen3.5-0.8B activa el modo thinking por defecto; es necesario pasar `enable_thinking=False` si se construyen los prompts manualmente.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B.

## Enlaces

- HuggingFace: https://huggingface.co/icodediac/zils-lite-find-knowline
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- KnowLine-2B-Gen1: https://huggingface.co/PelaAI/KnowLine-2B-Gen1
- KnowLine-9B-Gen1: https://huggingface.co/PelaAI/KnowLine-9B-Gen1
- KnowLine-4B-Gen5.5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
- Board Decision Index: multimodalart/jev-decision-index (snapshot c130faf6)
- Notas de inferencia: INFERENCE.md (incluido en el repositorio del modelo)
- README en chino: README.zh.md (incluido en el repositorio del modelo)
