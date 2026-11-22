# jaesungbae/GeLDA

## Resumen

GeLDA (Generative Latent Data Augmentation) es un conjunto de checkpoints publicado por Jaesung Bae y Minje Kim asociado al articulo "Semantics-Aware Generative Latent Data Augmentation for Zero-shot Speech Emotion Recognition". No es un modelo de lenguaje ni un sistema de reconocimiento de emociones listo para usar: es una coleccion de adaptadores de tarea (SER) y modelos de difusion latente entrenados para aumentar datos en el espacio latente de modelos fundacionales de voz, con el objetivo de mejorar el reconocimiento de emociones en idiomas sin etiquetas.

El paquete cubre dos regimenes: zero-shot (adaptadores entrenados con todos los idiomas de origen mas voz NEUTRAL del idioma objetivo) y few-shot (adaptadores entrenados con los 14 idiomas del corpus). Los checkpoints se organizan por modelo fundacional de voz (whisper-large-v3, wavlm-large, emotion2vec-base), idioma objetivo y fold segun el esquema de EmoBox, y operan en distintos espacios latentes Z(0), Z(1) y Z(2).

La relevancia actual reside en que propone una via de aumento de datos puramente latente, sin sintetizar audio, para tareas de paralinguistica donde los datos etiquetados son escasos y costosos. El repositorio ocupa 12,4 GB y no incluye datos de voz: solo pesos en safetensors. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores de tarea SER sobre SFM (whisper-large-v3, wavlm-large, emotion2vec-base) + modelo de difusion latente (denoiser) en el espacio Z(l) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | Origen: 14 idiomas (segun EmoBox). Objetivo zero-shot: frances, aleman, italiano, espanol (Z(0), Z(1), Z(2)); amharico, bengali, persa, polaco, ruso y urdu (solo Z(0) con whisper-large-v3). Few-shot: los 14 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores y difusion; configuracion en metadatos) |

## Arquitectura y entrenamiento

El sistema se estructura en tres etapas. La etapa 1 entrena un adaptador de tarea SER sobre un modelo fundacional de voz congelado, usando todos los idiomas de origen (y, en zero-shot, voz NEUTRAL del idioma objetivo). La etapa 2 entrena un modelo de difusion latente (denoiser) sobre las representaciones Z(l) producidas por ese adaptador, con pesos EMA y configuracion embebida en los metadatos del safetensors. La etapa 3 ajusta un nuevo adaptador SER con los latentes generados por GeLDA, que es el artefacto final (`ser_adapter_gelda_z<l>.safetensors`).

Los espacios latentes Z(0), Z(1) y Z(2) corresponden a distintas representaciones del adaptador de la misma carpeta; los modelos de difusion de Z(1) y Z(2) operan sobre latentes generados por el `ser_adapter.safetensors` correspondiente. Los folds siguen el particionado de EmoBox. El articulo reporta cada resultado como media de cinco repeticiones con conjuntos disjuntos de latentes generados y semilla de fine-tuning propia; los checkpoints publicados son la repeticion 0 (semilla 1234, latentes `[0, 200)` por emocion en zero-shot y `[0, 500)` en few-shot). Las filas Pretrained y Oracle del paper promedian cinco modelos de etapa 1 entrenados por separado, mientras que los safetensors publicados son la repeticion 0 de esos promedios. No se especifica en la informacion disponible el volumen de tokens, la composicion exacta del dataset ni el uso de RLHF/DPO.

## Capacidades

- Aumento de datos generativo en espacio latente para SER, sin sintetizar formas de onda de audio.
- Reconocimiento de emociones en voz zero-shot sobre idiomas objetivo no vistos durante el entrenamiento supervisado.
- Reconocimiento de emociones few-shot con adaptadores entrenados sobre los 14 idiomas del corpus.
- Generacion de latentes condicionados por emocion en los espacios Z(0), Z(1) y Z(2).
- Compatibilidad con tres modelos fundacionales de voz: whisper-large-v3, wavlm-large y emotion2vec-base.
- Adaptadores de tarea completos que aceptan caracteristicas Z(0) como entrada, utilizables de forma independiente a la difusion.
- Lineas base incluidas: `ser_adapter_pretrained.safetensors` (sin datos del idioma objetivo) y `ser_adapter_oracle.safetensors` (entrenado con los 14 idiomas).
- No soporta tool calling, function calling, agentes, vision, audio generativo ni modo thinking: no es un modelo de proposito general.

## Casos de uso

- Investigacion en SER zero-shot: evaluar adaptadores sobre idiomas objetivo (frances, aleman, italiano, espanol) sin recolectar etiquetas, comparando contra la linea base `ser_adapter_pretrained`.
- Aumento de datos para paralinguistica de bajo recurso: generar latentes por emocion (`[0, 200)` por clase en zero-shot) y ajustar adaptadores SER cuando el corpus etiquetado es minimo.
- Reproduccion de resultados academicos: los folds siguen EmoBox y la semilla esta fijada (1234, repeticion 0), lo que permite replicar las cifras del articulo.
- Comparativa de modelos fundacionales de voz: el mismo pipeline se aplica a whisper-large-v3, wavlm-large y emotion2vec-base, facilitando estudios ablativos sobre el extractor de caracteristicas.
- Extension a idiomas de bajos recursos (amharico, bengali, persa, polaco, ruso, urdu): usando exclusivamente el espacio Z(0) con whisper-large-v3.
- Construccion de sistemas de analisis emocional en produccion sobre el adaptador de etapa 3, alimentando caracteristicas Z(0) del SFM correspondiente, siempre que se valide el dominio acustico objetivo.
- Docencia y prototipado: el repositorio incluye el codigo en GitHub y una API de carga (`gelda.diffusion.load_inference_checkpoint`) para inspeccionar denoisers y configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo "Semantics-Aware Generative Latent Data Augmentation for Zero-shot Speech Emotion Recognition" (Bae y Kim) para las cifras, pero no incluye tablas numericas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 12,4 GB en total, pero incluye multiples checkpoints (adaptadores y difusion para varios SFM, idiomas y folds); el peso de un checkpoint individual no se detalla.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano de los SFM subyacentes (whisper-large-v3, wavlm-large, emotion2vec-base), se requiere una GPU con memoria suficiente para el modelo fundacional mas el adaptador y el denoiser, pero no se especifican cifras.
- Compatibilidad con GPU de consumo: no confirmada; depende del SFM elegido y del checkpoint cargado.
- Opciones de despliegue: la unica via documentada es la libreria `gelda` del repositorio GitHub (`from gelda.diffusion import load_inference_checkpoint`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeLDA | Aumento latente + adaptadores SER sobre SFM | no disponible | no disponible | MIT | Hugging Face (jaesungbae/GeLDA) |
| SER zero-shot sobre whisper-large-v3 | Adaptador de tarea sobre SFM | no disponible | no disponible | depende del SFM base | Requiere entrenamiento propio |
| emotion2vec-base | Modelo fundacional de representacion emocional | no disponible | no disponible | no disponible | Usado como SFM en este repositorio |

No se dispone de datos de rendimiento comparativo entre GeLDA y alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; usarlo fuera de SER carece de sentido.
- No incluye datos de voz; solo pesos. Cualquier evaluacion requiere aportar el corpus (p. ej. EmoBox) por separado.
- Los checkpoints publicados son la repeticion 0 (semilla 1234); las cifras del articulo son medias de cinco repeticiones, por lo que los resultados reproducidos pueden diferir de las tablas del paper.
- Los adaptadores de etapa 3 esperan caracteristicas Z(0) como entrada; alimentarlos con latentes de otro espacio o de otro SFM produce resultados invalidos.
- Cobertura zero-shot limitada: Z(1) y Z(2) solo estan disponibles para frances, aleman, italiano y espanol; el resto de idiomas objetivo solo tiene Z(0) con whisper-large-v3.
- Riesgo de alucinacion en el sentido de latentes generados poco representativos de la distribucion emocional real; no se documentan filtros de calidad en la informacion disponible.
- Sesgos: no documentados. Al depender de corpus emocionales y de SFM preentrenados, hereda los sesgos de ambos, pero el autor no los detalla.
- Licencia MIT permite uso comercial, pero los SFM subyacentes (whisper-large-v3, wavlm-large, emotion2vec-base) tienen sus propias licencias que deben verificarse por separado.
- Sin cuantizaciones publicadas ni soporte de frameworks de servido estandar; el despliegue en produccion exige integrar la libreria `gelda` y validar latencia.

## Enlaces

- Hugging Face: https://huggingface.co/jaesungbae/GeLDA
- Codigo y uso: https://github.com/JaesungBae/GeLDA
- EmoBox (particionado de folds): https://github.com/emo-box/EmoBox
- Articulo: "Semantics-Aware Generative Latent Data Augmentation for Zero-shot Speech Emotion Recognition" (Jaesung Bae y Minje Kim); URL no disponible en la informacion proporcionada.
