# ahmedselhady/XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-no-kl-en

## Resumen

XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-no-kl-en es un checkpoint de ajuste fino publicado por el usuario ahmedselhady sobre el modelo base nvidia/Nemotron-Research-Reasoning-Qwen-1.5B. Se trata de un experimento de entrenamiento con SDPO (una variante de optimizacion por preferencias directas aplicada sobre trayectorias o pasos de razonamiento) en el que se ha partido de un modelo de razonamiento ya entrenado por NVIDIA y se ha continuado el ajuste con un conjunto de datos de matematicas y razonamiento en ingles y bengali (sufijo "en-bn"), con tasa de aprendizaje 3e-6 y sin termino de divergencia KL ("no-kl").

El modelo conserva la arquitectura Qwen2 del modelo base, con 1.777.088.000 parametros totales (aproximadamente 1.5B nominales) y pesos en formato safetensors. El repositorio ocupa 3.6 GB e incluye checkpoints intermedios: la revision por defecto apunta al ultimo paso publicado y el checkpoint concreto disponible es el paso 50, accesible mediante `revision="step-50"`.

Su relevancia es fundamentalmente de investigacion: documenta una ejecucion concreta de SDPO sobre un modelo de razonamiento pequeno y bilingue ingles-bengali, util para reproducir o analizar el efecto del ajuste por preferencias sin regularizacion KL. No es un modelo orientado a produccion ni cuenta con una model card descriptiva mas alla de la identificacion de la ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, heredada del modelo base) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible oficialmente; el nombre de la ejecucion sugiere entrenamiento en ingles y bengali (en-bn) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, tomado del checkpoint nvidia/Nemotron-Research-Reasoning-Qwen-1.5B, que a su vez es un modelo de razonamiento afinado por NVIDIA sobre Qwen2-1.5B. Sobre esa base se ha aplicado una ejecucion de SDPO (segun el nombre, "XSDPO") con los hiperparametros indicados en el identificador: 1500x2 ejemplos (probablemente 1500 prompts con 2 muestras o dos epochs), tasa de aprendizaje 3e-6, sin termino KL y con datos en ingles y bengali. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o DPO mas alla de la propia ejecucion SDPO.

La innovacion tecnica destacable es el propio esquema de entrenamiento: SDPO sin regularizacion KL, lo que elimina la restriccion de proximidad al modelo de referencia y permite un desplazamiento mayor de la politica, a costa de un riesgo superior de degradacion o colapso de la distribucion. El repositorio publica checkpoints por pasos (el disponible es el paso 50), lo que facilita el analisis de la evolucion del entrenamiento. No se dispone de informacion sobre tecnicas de decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en formato chat (pipeline text-generation, tag conversational).
- Razonamiento matematico y de varios pasos, heredado del modelo base Nemotron-Research-Reasoning-Qwen-1.5B.
- Capacidad multilingue limitada segun el nombre de la ejecucion: ingles y bengali.
- Compatible con text-generation-inference y endpoints compatibles (tags de Hugging Face).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible en la informacion proporcionada.
- Modo thinking explicito, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre SDPO: reproduccion y analisis del efecto de entrenar preferencias sin termino KL sobre un modelo de razonamiento de 1.5B, comparando el checkpoint del paso 50 con el modelo base.
- Experimentos de razonamiento matematico en bengali: evaluacion de la transferencia de capacidades de razonamiento del ingles al bengali en un modelo pequeno, util para estudiar cobertura linguistica en modelos de razonamiento.
- Generacion de cadenas de razonamiento para destilacion: uso del modelo para producir trazas de razonamiento que sirvan como datos de entrenamiento de modelos mayores o de modelos especificos de dominio.
- Prototipado de asistentes conversacionales ligeros: despliegue en entornos con recursos limitados (1.5B de parametros) para pruebas de concepto de chat multi-turno, sin garantias de calidad de produccion.
- Evaluacion comparativa de checkpoints: al publicarse por pasos (`revision="step-50"`), permite estudiar la evolucion de metricas de razonamiento a lo largo del entrenamiento y detectar sobreajuste o degradacion.
- Banco de pruebas de alineacion: analisis de sesgos y deriva de distribucion en entrenamientos sin KL, comparando respuestas del checkpoint con las del modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3.6 GB solo para pesos, mas memoria para el contexto y el estado de decodificacion (estimacion tipica de 5-7 GB en total).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1.2 GB (estimaciones a partir del numero de parametros; no se publican variantes cuantizadas oficiales).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en fp16; para mayor throughput, A100 o H100.
- Cabe en GPU consumer: si, en la mayoria de GPU con 6-8 GB de VRAM en fp16 y en GPU con 4 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag tgi); llama.cpp u Ollama requeririan conversion a GGUF, no documentada en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-no-kl-en | 1.777 M | no disponible | no disponible | Checkpoint SDPO sin KL sobre Nemotron-Research-Reasoning-Qwen-1.5B |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1.5B | no disponible | no disponible | Modelo base de razonamiento de NVIDIA sobre Qwen2-1.5B |
| Qwen2-1.5B (Qwen) | ~1.5B | 32.768 tokens (segun documentacion de Qwen2) | Apache 2.0 (segun documentacion de Qwen2) | Modelo generalista original de la familia |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1.5B | 32.768 tokens (segun documentacion del modelo) | MIT (segun documentacion del modelo) | Alternativa de razonamiento destilado de tamano similar |

Los datos de contexto y licencia de las alternativas provienen de la documentacion publica de dichos modelos; los del modelo descrito no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint intermedio (paso 50) de una ejecucion experimental, sin model card descriptiva ni evaluacion publicada; no debe usarse en produccion sin validacion propia.
- Licencia no disponible: la ausencia de licencia explicita impide asumir permisos de uso comercial; es necesario contactar con el autor o consultar el repositorio antes de cualquier despliegue.
- Entrenamiento sin termino KL: la ausencia de regularizacion respecto al modelo de referencia aumenta el riesgo de deriva de distribucion, sobreajuste al dataset de preferencias y degradacion de capacidades generales.
- Cobertura linguistica limitada: el ajuste se realizo en ingles y bengali; el rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea inferior al del modelo base.
- Riesgo de alucinacion: como todo modelo de 1.5B orientado a razonamiento, puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente en matematicas de varios pasos.
- Sesgos: no se documentan evaluaciones de sesgo; los sesgos del corpus de preferencias empleado son desconocidos.
- Sin datos de contexto: no se confirma la longitud de contexto efectiva tras el ajuste, por lo que no debe asumirse la del modelo base.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-no-kl-en
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
