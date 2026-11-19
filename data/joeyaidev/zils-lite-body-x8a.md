# joeyAIDev/zils-lite-body-x8a

## Resumen

zils-lite-body-x8a es un modelo de decisión (decision model) publicado por el usuario joeyAIDev en Hugging Face, derivado mediante fine-tuning del modelo base joamCriff123/zils-lite-l1117a. Se presenta como el "cuerpo de decisión" (decision body) de la versión d3-lite dentro del pool lite de la subred Zils 127. El modelo conserva la arquitectura, tokenizador y ficheros de configuración del modelo base (etiquetado como qwen3_5 en los tags), y solo sustituye los pesos del fichero safetensors principal por los resultantes del entrenamiento.

El ajuste consistió en un LoRA de rango 64 (lr 5e-5) aplicado sobre las proyecciones de atención del modelo de lenguaje, posteriormente fusionado en los pesos. El conjunto de entrenamiento fueron 22.000 filas de respuestas del "relay teacher" publicado por Zils, filtradas para excluir filas procedentes de GitHub, Stack Exchange o Spider y limitadas a estados de como máximo 2.500 caracteres.

Con 852.985.920 parámetros (aproximadamente 853 millones) y un repositorio de 1,7 GB, es un modelo compacto orientado a tareas de decisión dentro de un pipeline concreto (subred Zils), no un modelo de propósito general. La licencia es Apache-2.0 y el modelo base también lo era, lo que permite uso comercial con las obligaciones de atribución correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3_5 en los tags; requiere custom_code) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan cuantizaciones GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model-00001-of-00001.safetensors), con custom_code |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base joamCriff123/zils-lite-l1117a, etiquetado como qwen3_5, un transformer denso de aproximadamente 853 millones de parámetros. El repositorio incluye código personalizado (custom_code), por lo que la carga requiere confiar en la implementación remota del autor o revisar dicho código antes de ejecutarlo. No se detalla en la información disponible el número de capas, la dimensión oculta ni la longitud de contexto del modelo base.

El entrenamiento consistió en un LoRA de rango 64 con tasa de aprendizaje 5e-5 aplicado sobre las proyecciones de atención del modelo de lenguaje, usando la herramienta propia del autor (`zils.teacher train --lora 64 --lr 5e-5`). El adaptador se fusionó en los pesos finales, de modo que el safetensors publicado contiene los pesos ya modificados. Los datos de entrenamiento son 22.000 filas de respuestas del relay teacher de Zils, con filtrado explícito de filas de GitHub, Stack Exchange y Spider y un límite de 2.500 caracteres por estado. No se menciona RLHF, DPO ni datos multimodales. El resto de ficheros (runtime, tokenizador, readout y configuración) son los del modelo base sin cambios.

## Capacidades

- Generación de texto y toma de decisiones dentro del pipeline de la subred Zils 127 (pool lite), que es el propósito declarado del modelo.
- Razonamiento de contexto corto: el entrenamiento se limitó a estados de como máximo 2.500 caracteres, lo que acota el tipo de entradas vistas durante el ajuste.
- No se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el campo de idiomas no está disponible.
- No se documentan modos especiales (thinking mode, visión, audio).
- Al conservar el tokenizador y la configuración del modelo base, podría retener parte de las capacidades generales de este, pero no hay evaluación publicada que lo confirme.

## Casos de uso

- Toma de decisiones en la subred Zils 127: el modelo está entrenado específicamente como "decision body" del pool lite, por lo que su uso previsto es resolver las decisiones que el protocolo de la subred plantee, alimentándolo con el estado del entorno en el formato que espere el runtime de Zils.
- Clasificación y enrutamiento de estados cortos: dado el límite de 2.500 caracteres en el entrenamiento, encaja en tareas donde la entrada es un estado compacto (por ejemplo, elegir entre acciones discretas o validar una propuesta) y la salida es una decisión acotada.
- Prototipado de agentes ligeros en local: con 853 millones de parámetros y 1,7 GB de pesos en precisión original, puede ejecutarse en una GPU de consumo para experimentar con políticas de decisión sin depender de infraestructura grande.
- Investigación sobre fine-tuning con LoRA: sirve como ejemplo reproducible de adaptación de un modelo base pequeño con rango 64 y fusión posterior de pesos, útil para estudiar el efecto del ajuste en modelos de menos de mil millones de parámetros.
- Evaluación de pipelines de decisión en entornos simulados: al ser un modelo pequeño, permite iterar rápido sobre el formato de estados y las recompensas del pipeline antes de escalar a modelos mayores.
- Filtrado y curación de datos: el propio proceso de entrenamiento (exclusión de fuentes concretas y límite de longitud) puede replicarse con este modelo como referencia para construir conjuntos de datos de decisión controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp16/bf16): en torno a 1,7 GB solo para los pesos, más overhead de activaciones y del runtime; con 4-6 GB de VRAM debería ser suficiente para contextos moderados.
- En cuantización de 8 bits, la huella de pesos baja a aproximadamente 0,9 GB; en 4 bits, a unos 0,45 GB, aunque no se publican ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU de consumo con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegue en servidor, una A100 o H100 no aporta ventaja significativa por el tamaño del modelo.
- Cabe en GPU de consumo: sí, con margen amplio.
- Opciones de despliegue: al requerir custom_code, la vía natural es `transformers` con `trust_remote_code=True`; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI, y la ausencia de ficheros GGUF complica el uso en llama.cpp sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-body-x8a | 852.985.920 | no disponible | Apache-2.0 | Fine-tuning LoRA de un modelo base de la subred Zils; requiere custom_code |
| joamCriff123/zils-lite-l1117a (base) | no disponible en la informacion | no disponible | Apache-2.0 | Modelo de partida sin el ajuste de decisión |
| Qwen2.5-0.5B / Qwen3 pequeños | ~0,5B | 32K en variantes Qwen2.5 | Apache-2.0 | Alternativas de propósito general del mismo orden de tamaño; no comparables en la tarea específica de Zils |

No se dispone de datos de rendimiento del modelo ni de alternativas evaluadas en la misma tarea, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho: está entrenado para el pipeline de decisión de la subred Zils 127; fuera de ese contexto su comportamiento no está validado y puede degradarse respecto al modelo base.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al ser un fine-tuning sobre datos de un "teacher" concreto, puede reproducir sesgos y errores de esas respuestas.
- Sesgos conocidos: no documentados, pero el filtrado de fuentes (exclusión de GitHub, Stack Exchange y Spider) introduce un sesgo de selección en los datos de entrenamiento.
- Limitación de contexto práctico: el entrenamiento se restringió a estados de hasta 2.500 caracteres, por lo que entradas más largas quedan fuera de la distribución vista.
- Idiomas: no se especifican; no hay garantía de cobertura multilingüe más allá de la del modelo base.
- Licencia: Apache-2.0 permite uso comercial, pero exige conservar el aviso de modificación (sección 4) y los ficheros LICENSE y NOTICE; el modelo base también era Apache-2.0.
- Ejecución de código remoto: el repositorio incluye custom_code, por lo que cargarlo con `trust_remote_code=True` implica ejecutar código del autor; conviene auditar los ficheros antes de usarlo en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni documentación adicional; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joeyAIDev/zils-lite-body-x8a
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Repositorio de referencia del modelo base (revisión citada): https://huggingface.co/joamCriff123/zils-lite-l1117a/tree/ec192c7e0a443c04f7cbfe7151b1c910bd5e880f
