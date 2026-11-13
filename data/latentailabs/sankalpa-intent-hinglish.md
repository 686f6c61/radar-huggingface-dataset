# LatentAILabs/sankalpa-intent-hinglish

## Resumen

Sankalpa-intent-hinglish es un modelo de clasificación de intenciones y extracción de slots (joint intent-slot) desarrollado por LatentAILabs, diseñado específicamente para comandos cortos escritos en hinglish, es decir, hindi romanizado mezclado con inglés, tal y como los usuarios indios escriben en el móvil. El modelo parte de XLM-R large (560M parámetros) y añade dos cabezas: una de clasificación sobre las 60 intenciones del esquema MASSIVE 1.1 y otra de etiquetado BIO para 55 tipos de slot (fecha, hora, lugar, persona, canción, etc.).

El problema que resuelve es concreto: la mayoría de pipelines de asistentes de voz aplican un paso previo de transliteración de romanizado a devanagari antes de clasificar. Sankalpa elimina ese paso y lee directamente el texto romanizado, lo que según el autor es la principal fuente de mejora frente a pipelines tradicionales. También procesa hindi nativo en devanagari e inglés, por lo que cubre los tres formatos de entrada habituales en el mercado indio.

Es relevante ahora porque los asistentes conversacionales en la India operan sobre entradas code-mixed que los modelos entrenados solo en script nativo manejan mal, y porque el modelo ofrece un rendimiento declarado alto (0,952 de accuracy en el test humano de Hinglish-TOP) con un coste de inferencia muy bajo: aproximadamente 1,2 ms por comando en una GPU L4. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-R large) con cabeza de clasificación de intención y cabeza de etiquetado BIO de slots |
| Parametros totales | 559.890.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con máximo 96 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; no se documentan cuantizaciones) |
| Idiomas soportados | Hindi romanizado (hinglish), hindi en devanagari, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder XLM-R large de 560M parámetros con dos cabezas superpuestas: una de clasificación sobre 60 intenciones del esquema MASSIVE 1.1 y otra de etiquetado secuencial BIO con 55 tipos de slot. La entrada se divide por espacios en blanco y los slots se devuelven como spans de palabras sobre esa división, lo que simplifica la integración en pipelines de preprocesado ligeros.

El entrenamiento combina los splits train/dev de MASSIVE 1.1 en hi-IN y en-US en script nativo, más hasta tres copias romanizadas por fila generadas por Gemma 4 26B siguiendo una guía de escritura informal (sin diacríticos, palabras inglesas con ortografía inglesa, corchetes de slot preservados) y filtradas automáticamente por comprobaciones de consistencia (mismas palabras en cada corchete, ausencia de script nativo, longitud razonable). Se entrenó durante 4 épocas con AdamW, learning rate 1,5e-5, batch de 32 y máximo de 96 tokens, seleccionando la época sobre una mezcla de dev reservada. No se usó ningún dato de test para entrenamiento ni selección.

## Capacidades

- Clasificación de intención sobre 60 etiquetas del esquema MASSIVE 1.1 (alarmas, calendario, música, domótica, clima, transporte, preguntas y respuestas, listas, email, noticias, cocina, pedidos de comida).
- Extracción de slots mediante etiquetado BIO con 55 tipos (fecha, hora, lugar, persona, canción, etc.), devueltos como spans de palabras.
- Lectura directa de hindi romanizado sin paso de transliteración intermedio.
- Soporte de hindi nativo en devanagari e inglés en el mismo modelo.
- Salida con intención, confianza y top-3 de candidatas, además de la lista de slots.
- Procesamiento por lotes mediante `parse_batch`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un modelo discriminativo de clasificación y etiquetado.

## Casos de uso

- Asistentes de voz para el mercado indio: el modelo recibe la transcripción romanizada de un comando ("kal subah 6 baje ka alarm laga do") y devuelve la intención `alarm_set` con sus slots de fecha y hora, eliminando el paso de transliteración que añade latencia y errores.
- Enrutado de comandos en aplicaciones móviles: integrado como primer clasificador en un pipeline de intenciones para decidir a qué servicio derivar cada petición (música, domótica, clima), con 60 etiquetas predefinidas que cubren los dominios típicos de asistente.
- Extracción de entidades en comandos de domótica: identifica dispositivo y acción ("bedroom ki light band kar do" → `iot_hue_lightoff`) para traducir lenguaje natural a llamadas de API de dispositivos.
- Procesamiento por lotes de logs de comandos: con `parse_batch` y un coste de aproximadamente 1,2 ms por comando en L4, permite analizar grandes volúmenes de interacciones para estudiar distribución de intenciones y errores.
- Punto de partida para fine-tuning vertical: al ser Apache 2.0 y basarse en XLM-R large, se pueden reentrenar las cabezas (o el modelo completo) sobre el conjunto de intenciones propio de una aplicación, conservando la robustez frente a hinglish.
- Clasificación en entornos con GPU modesta o CPU: el tamaño de 560M y la latencia baja permiten desplegarlo en servidores pequeños o en el propio dispositivo, aunque el autor advierte que la ruta CPU no está medida.
- Filtrado y moderación de comandos en asistentes: la salida con confianza y top-3 permite derivar a revisión humana o a un modelo mayor los casos de baja certeza.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Test | Filas | Metrica | Valor |
|---|---|---|---|
| Hinglish-TOP test humano, 11 intenciones mapeadas 1:1 a MASSIVE | 3.491 | Intent accuracy | 0,952 |
| Hinglish-TOP "get event" → `recommendation_events` (mapeo laxo) | 448 | Intent accuracy | 0,688 |
| Hoja mecanografiada de una persona, 60 intenciones | 68 | Intent accuracy | 0,971 |
| MASSIVE hi test, romanizado por 3 romanizadores LLM (media) | 3 × 560 | Intent accuracy / Slot micro-F1 | 0,858 / 0,713 |
| MASSIVE hi test, romanizado con grafías humanas (Dakshina) | 310 | Intent accuracy / Slot micro-F1 | 0,784 / 0,695 |
| MASSIVE hi test, devanagari nativo | 560 | Intent accuracy / Slot micro-F1 | 0,900 / 0,742 |
| Comandos romanizados nuevos, escritos y revisados por LLM | 175 | Intent accuracy / Slot micro-F1 | 0,966 / 0,804 |

Comparativas declaradas por el autor:

| Test | Sankalpa | Pipeline transliterar-primero | Gemma 4 26B few-shot |
|---|---|---|---|
| Romanizado LLM (media de 3) | 0,858 / 0,713 | 0,776 / 0,570 | 0,809 / 0,480 |
| Devanagari nativo | 0,900 / 0,742 | modelo nativo: 0,879 | no disponible |

El autor señala que la entrada romanizada cuesta aproximadamente 4 puntos de accuracy de intención y 3 puntos de F1 de slots frente al script nativo, y que los conjuntos romanizados generados por LLM son más difíciles que la escritura real (0,86 frente a 0,95–0,97 en texto humano).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB para los 560M parámetros; en fp16 alrededor de 1,1 GB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: el autor reporta aproximadamente 1,2 ms por comando en batch sobre una NVIDIA L4; cualquier GPU con al menos 4 GB de VRAM es suficiente. A100 y H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más (RTX 3060, RTX 4060, RTX 4090, etc.), y previsiblemente en CPU, aunque el autor indica que la ruta CPU no está medida.
- Opciones de despliegue: transformers con `transformers>=4.56`, torch y safetensors; el tag `text-embeddings-inference` sugiere compatibilidad con TEI. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 1,2 ms por comando en batch sobre una L4; el resto de escenarios no está medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sankalpa-intent-hinglish | 560M | no disponible (entrenado a 96 tokens) | Joint intent-slot sobre hinglish sin transliteración | Apache 2.0 | Hugging Face |
| Pipeline IndicXlit + XLM-R base nativo | XLM-R base (278M) + transliterador | no disponible | Transliteración a devanagari y clasificación nativa | según componentes | Pipeline a medida |
| Gemma 4 26B few-shot | 26B | no disponible | LLM generativo con ejemplos en el prompt | Apache 2.0 (según el autor) | Pesos abiertos |

En el conjunto romanizado por LLM, Sankalpa supera al pipeline de transliteración en 8,2 puntos de accuracy de intención y 14,3 puntos de F1 de slots, y a Gemma 4 26B few-shot en 4,9 puntos de accuracy y 23,3 puntos de F1, con un coste de inferencia muy inferior. Parte de la ventaja frente al pipeline de transliteración se atribuye al tamaño del tronco (base frente a large).

## Limitaciones y advertencias

- Conjunto de etiquetas fijo: las 60 intenciones MASSIVE son de asistente de voz; la mayoría de aplicaciones necesitan las suyas y deberán reentrenar las cabezas o el modelo completo.
- Rendimiento de slots moderado: 0,713 de micro-F1 en el conjunto romanizado por LLM y 0,742 en devanagari nativo, insuficiente para extracción de entidades de alta precisión sin revisión.
- Sesgo de los conjuntos de evaluación: los tests romanizados fueron escritos por LLM y son más difíciles que la escritura humana real; los conjuntos humanos se redactaron a partir de prompts en inglés y pueden contener más palabras inglesas de lo habitual.
- Ventana de contexto corta en entrenamiento (96 tokens), adecuada para comandos pero no para utterances largas.
- Riesgo de confusión entre intenciones próximas: el autor señala que la mayoría de errores en `play_music` van a `play_radio`.
- Sin verificación independiente: todos los resultados del model-index están marcados como `verified: false` y el modelo tiene 0 descargas y 0 likes en el momento de la ficha.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base XLM-R large y los datos MASSIVE tienen sus propias condiciones que conviene revisar.
- No se documentan evaluaciones de sesgo demográfico ni de robustez ante ruido de transcripción (errores ASR), relevantes en despliegues de voz reales.
- La ruta de inferencia en CPU no está medida, por lo que el rendimiento en despliegues sin GPU es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LatentAILabs/sankalpa-intent-hinglish
- Modelo base XLM-R large: https://huggingface.co/FacebookAI/xlm-roberta-large
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- Repositorio MASSIVE: https://github.com/alexa/massive
- Dataset Hinglish-TOP: https://github.com/google-research-datasets/Hinglish-TOP-Dataset
