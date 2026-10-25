# JohnP1/d1a-e2b-it-qat

## Resumen

D1A-E2B-it QAT es un adaptador LoRA de rango 16 con una cabeza de decisión (pointer head) sobre el tronco multimodal cuantizado de Google `google/gemma-4-E2B-it-qat-w4a16-ct`. Lo desarrolla JohnP1 (jonpol01) dentro del proyecto D1A, y no es un modelo generativo al uso: recibe un documento y un conjunto de preguntas cerradas (sí/no, elección múltiple o puntuación) y devuelve, en un único forward pass, una probabilidad calibrada para cada opción. Es la versión recomendada por el autor desde el 25 de octubre de 2026, en sustitución de D1A-E2B-it v0.6.

El interés técnico está en cómo se construye: el adaptador se reentrena durante una época sobre el checkpoint exacto con cuantización consciente del entrenamiento (QAT, int4 w4a16) que luego se usa en inferencia, y `d1a` reconstruye ese tronco a partir de `base_ct` en `d1a_config.json` para que el adaptador opere sobre los mismos pesos con los que fue entrenado. Incorpora además una temperatura de calibración de 1,55 ajustada sobre las respuestas del build MLX.

El paquete cubre tres frentes: decisiones vía `/v1/systemone`, chat en formato OpenAI (`/v1/chat/completions`, con streaming y tool calls) y análisis de fotos, voz y vídeo mediante un servidor de medios aparte. La licencia es Apache-2.0 y el repositorio del adaptador ocupa 0,1 GB, aunque la ejecución exige descargar el modelo base (unos 10 GB) y el checkpoint QAT (unos 8 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) más cabeza de decisión sobre transformer multimodal Gemma 4 E2B-it con tronco int4 QAT (w4a16-ct); el detalle interno del tronco no se especifica |
| Parametros totales | No disponible para el tronco; el repositorio del adaptador ocupa 0,1 GB |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Tronco int4 con cuantización consciente del entrenamiento (QAT, w4a16-ct), reconstruido en carga como escala × entero; inferencia en bf16 (redondeada) o fp32 exacta con `D1A_DTYPE=fp32`; build MLX alternativo en q4 |
| Idiomas soportados | Inglés y japonés (preguntas únicamente en inglés; los documentos pueden ser en inglés o japonés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) más `d1a_config.json`; build MLX q4 separado |
| Modelo base | google/gemma-4-E2B-it (revision `971342c0` para el checkpoint QAT) |
| Tarea declarada (pipeline) | text-classification |
| Temperatura de calibracion | 1,55 (ajustada sobre las respuestas del build MLX) |
| Biblioteca | peft |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 con una cabeza de decisión que transforma la salida del tronco en una distribución de probabilidad sobre las opciones de cada pregunta, devuelta en una sola pasada hacia delante. El tronco es el Gemma 4 E2B-it cuantizado a int4 mediante QAT (`w4a16-ct`): al cargar, `d1a` reconstruye cada peso int4 como escala × entero a partir de `base_ct`, de modo que el adaptador se ejecuta sobre los pesos exactos con los que fue entrenado. El resultado es exacto en fp32 y redondeado en bf16.

El entrenamiento consistió en una época sobre la mezcla completa de habilidades del proyecto, partiendo del adaptador de D1A-E2B-it v0.6 reentrenado sobre ese tronco concreto (incidencia jonpol01/d1a#341). La calibración se ajustó después con los datos de decision-v7 y el desarrollo de etiquetas de pull requests, sobre las respuestas del build MLX, fijando la temperatura en 1,55. Los datos incluyen decisiones en inglés y documentos en inglés y japonés; la parte japonesa deriva de JGLUE (Yahoo Japan Corporation y Waseda University, CC BY-SA 4.0) y los datos de pull requests provienen de NousResearch/hermes-agent (MIT), aunque el conjunto etiquetado final de PR es privado. Cada registro se entrena con `<bos>` (id 2) al inicio, que `d1a` añade en inferencia.

## Capacidades

- Decisiones calibradas: dada una pregunta de sí/no, elección múltiple o puntuación, devuelve una probabilidad por opción en un solo forward pass.
- Chat compatible con la API de OpenAI en `/v1/chat/completions`, con soporte de streaming.
- Tool calling / function calling en el endpoint de chat.
- Multimodalidad: análisis de fotos, clips de voz y vídeo a través del servidor de medios, que carga el modelo completo con sus encoders (incluida la proyección de visión reentrenada con QAT).
- Tareas propias del proyecto D1A: etiquetado de pull requests, enrutamiento y decisiones duras.
- Bilingüe asimétrico: preguntas en inglés, documentos en inglés o japonés.
- Modo chat "puro": con `D1A_MERGE=0` el adaptador se mantiene separado y el chat se desactiva, hablando como Gemma 4 E2B-it QAT.
- Servidor de decisiones en `/v1/systemone` junto al de chat, ambos en el mismo proceso.

## Casos de uso

- Etiquetado automático de pull requests: el modelo recibe la descripción del PR y un conjunto de etiquetas candidatas y devuelve la probabilidad de cada una, lo que permite fijar umbrales y automatizar el triaje en GitHub sin intervención humana en los casos de alta confianza.
- Enrutamiento de peticiones internas: con preguntas cerradas del tipo "¿es facturación, soporte técnico o cuenta?", la salida calibrada permite derivar tickets al equipo adecuado y dejar en cola manual solo los casos con probabilidad baja.
- Clasificación documental con umbral de confianza: al devolver probabilidad por opción en una sola pasada, se puede integrar en un pipeline de ingesta que acepte automáticamente los documentos con probablidad alta y los derive a revisión en caso contrario.
- Verificación de cumplimiento sobre documentación japonesa: es uno de los pocos escenarios donde el modelo aporta valor diferencial, ya que acepta documentos en japonés (datos derivados de JGLUE) con preguntas formuladas en inglés.
- Asistente conversacional con herramientas: el endpoint `/v1/chat/completions` con tool calls y streaming permite montar un asistente que consulte APIs externas y responda en turnos multi-turno, con la opción de desactivar el adaptador si se prefiere el comportamiento del modelo base.
- Análisis de contenido audiovisual: el servidor de medios permite lanzar las mismas preguntas cerradas sobre fotos, notas de voz o vídeo, útil para moderación o catalogación de material multimedia.
- Puerta de calidad en CI/CD: colocado como paso previo al merge, el modelo puntúa si un cambio cumple los criterios definidos y bloquea o escala según la probabilidad obtenida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos numéricos publicados son internos del proyecto:

| Prueba | Resultado |
|---|---|
| Ejemplo de decisión del README (PyTorch bf16 sobre MPS, M1 Max) | etiqueta `billing` con 0,65 de probabilidad (build MLX: 0,67) |
| Peticiones multimedia del playground | 14 de 14 respondidas |
| Coincidencia de respuestas multimedia frente al build MLX | 27 de 28 idénticas |
| Chat | responde y hace streaming correctamente |
| transfer-v4 (tipos de tarea fuera del entrenamiento) | −5,2 puntos frente a D1A-E2B-it v0.6 |

## Requisitos de hardware

- Descarga necesaria: Gemma 4 E2B-it (unos 10 GB) más el checkpoint QAT (unos 8 GB); el adaptador en sí ocupa 0,1 GB.
- El tronco int4 pesa alrededor de 8 GB, a lo que hay que sumar encoders y activaciones en el servidor de medios; una GPU con 16 GB de VRAM es un punto de partida razonable para el modo servidor completo (estimación a partir de los tamaños de descarga, no publicada por el autor).
- Verificado por el autor en un Apple M1 Max con PyTorch bf16 sobre MPS; el build recomendado para Apple Silicon es el MLX q4.
- En GPU de consumo: cabe previsiblemente en tarjetas de 16 GB o más; no hay pruebas publicadas en RTX 4090 ni en GPUs de gama media.
- Opciones de despliegue: `pip install "d1a[serve,media] @ git+https://github.com/jonpol01/d1a"` y luego `python -m d1a.serving.serve` (decisiones y chat) más `python -m d1a.serving.media` (multimedia). Requiere las revisiones jonpol01/d1a#346 y #348.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el adaptador depende de la lógica de reconstrucción del tronco de `d1a`.
- Latencia y throughput: no disponibles. Como referencia de diseño, las decisiones se resuelven en un único forward pass para todas las opciones de la pregunta.
- Aviso de precisión: fp32 es exacto, bf16 introduce redondeo en los pesos reconstruidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D1A-E2B-it QAT (este) | No disponible (adaptador de 0,1 GB) | No disponible | transfer-v4 −5,2 pts frente a v0.6; mejor en tareas propias de D1A | Apache-2.0 | PyTorch, CPU, NVIDIA, Mac sin MLX |
| D1A-E2B-it v0.6 | No disponible | No disponible | Referencia de transfer-v4; peor en etiquetado de PR, enrutamiento y decisiones duras | Apache-2.0 | Fijar con `JohnP1/d1a-e2b-it@v0.6` |
| D1A-E2B-it QAT MLX q4 | Mismo adaptador | No disponible | Ejemplo de decisión 0,67 frente a 0,65 en PyTorch; 27 de 28 respuestas multimedia idénticas | Apache-2.0 | Solo Apple Silicon |
| google/gemma-4-E2B-it-qat-w4a16-ct | No disponible | No disponible | Modelo base sin adaptador; chat generalista en lugar de decisiones calibradas | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Excepción de release: la regla de publicación del proyecto lo veta por una caída de 5,2 puntos en transfer-v4 frente a v0.6. Si el uso previsto cae en tipos de tarea fuera del entrenamiento, conviene fijar `JohnP1/d1a-e2b-it@v0.6`.
- Las preguntas deben formularse en inglés; el japonés solo se admite en los documentos. No hay soporte declarado de castellano.
- Dependencia estricta del token `<bos>` (id 2): el modelo fue entrenado con él al inicio de cada registro y es `d1a` quien lo añade. Usarlo fuera de ese pipeline puede degradar las probabilidades.
- Dependencia de una revisión concreta del checkpoint QAT (`971342c0`); cambios en el tronco o en la reconstrucción int4 alteran el comportamiento.
- Calibración ajustada sobre las respuestas del build MLX, no sobre PyTorch; el autor documenta una diferencia de 0,65 frente a 0,67 en el ejemplo de referencia, lo que sugiere pequeñas desviaciones entre backends.
- Precisión numérica: fp32 reproduce exactamente los pesos, bf16 los redondea. Para decisiones con umbrales ajustados conviene fp32.
- No es un generador libre: fuera de las opciones planteadas no puede responder, y las probabilidades pueden estar mal calibradas en dominios alejados del entrenamiento.
- El conjunto etiquetado de pull requests es privado, por lo que los resultados en esa tarea no son reproducibles de forma independiente.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta.
- La licencia Apache-2.0 permite uso comercial, pero el modelo hereda las condiciones del Gemma 4 de Google; conviene revisar los términos del modelo base antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JohnP1/d1a-e2b-it-qat
- Build MLX q4 para Apple Silicon: https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint QAT del tronco: https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct
- Repositorio de código: https://github.com/jonpol01/d1a
- Scorecard de la release: https://github.com/jonpol01/d1a/blob/main/docs/reports/2026-10-25-e2b-it-qat-scorecard.md
- Incidencia de reentrenamiento: https://github.com/jonpol01/d1a/issues/341
- Dependencias de serving: https://github.com/jonpol01/d1a/pull/346 y https://github.com/jonpol01/d1a/pull/348
- Dataset JGLUE (Yahoo Japan Corporation y Waseda University, CC BY-SA 4.0): https://github.com/yahoojapan/JGLUE
- Datos de pull requests (NousResearch/hermes-agent, MIT): https://github.com/NousResearch/hermes-agent
- Framework base Kev, de Jared Palmer (Apache-2.0): https://github.com/jaredpalmer/kev
