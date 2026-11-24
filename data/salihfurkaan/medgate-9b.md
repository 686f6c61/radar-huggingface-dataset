# salihfurkaan/MedGate-9B

## Resumen

MedGate-9B es un adaptador LoRA publicado en Hugging Face por el usuario salihfurkaan sobre el modelo base `unsloth/Qwen3.5-9B`. Se distribuye como un repositorio PEFT de aproximadamente 0,4 GB, lo que corresponde al peso de los adaptadores y no al del modelo completo. El nombre sugiere un ajuste orientado al dominio medico ("MedGate"), pero la model card no documenta el corpus de entrenamiento, el objetivo del ajuste ni los datos utilizados.

La relevancia de esta ficha es limitada y fundamentalmente practica: se trata de un adaptador sin descargas ni interacciones en el momento de la consulta, con una model card generada a partir de la plantilla por defecto de Hugging Face y sin secciones completadas. No hay informacion publicada sobre licencia, idiomas, evaluacion ni procedimiento de entrenamiento. Cualquier uso en produccion exige auditoria previa por parte del equipo que lo adopte.

Tecnicamente hereda del modelo base Qwen3.5-9B la arquitectura, la longitud de contexto y las capacidades multilingues, pero estos datos no se confirman en la informacion disponible y deben verificarse contra la ficha del modelo base antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre `unsloth/Qwen3.5-9B`; la arquitectura efectiva es la del modelo base) |
| Parametros totales | no disponible (el adaptador ocupa ~0,4 GB; el modelo base se denomina "9B") |
| Parametros activos | no aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador PEFT de tipo LoRA, entrenado presumiblemente con Unsloth (la etiqueta `unsloth` y el prefijo del modelo base lo indican) sobre `unsloth/Qwen3.5-9B`. El repositorio incluye la version de PEFT 0.21.2 como referencia de framework. No se especifica el rango del adaptador, los modulos objetivo, el alpha, el dropout ni la precision de entrenamiento.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre ninguna innovacion tecnica adicional. La unica referencia bibliografica de la model card es el articulo de Lacoste et al. (2019) sobre el calculo de emisiones, incluido en la plantilla por defecto y no relacionado con el entrenamiento del modelo. Tampoco se documentan los hiperparametros ni el hardware utilizado.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-9B (no verificada en la informacion disponible).
- Razonamiento y codigo: no confirmado para este adaptador; depende del modelo base.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Orientacion declarada al dominio medico por el nombre del modelo: no documentada ni verificable con la informacion proporcionada.

## Casos de uso

- Experimentacion en dominio medico con modelos de 9B: el adaptador puede cargarse sobre Qwen3.5-9B para comparar respuestas con y sin ajuste en tareas de preguntas y respuestas clinicas, siempre que se valide primero la calidad del ajuste con un conjunto de evaluacion propio.
- Prototipado de asistentes de triaje o documentacion clinica: util como punto de partida en entornos de investigacion, nunca como sustituto de criterio medico ni en produccion sin validacion clinica y auditoria de sesgos.
- Investigacion sobre ajuste fino con LoRA: el repositorio sirve como ejemplo de adaptador entrenado con Unsloth y PEFT, util para reproducir pipelines de entrenamiento y medir el impacto del adaptador frente al modelo base.
- Despliegue en infraestructura propia con vLLM o TGI: al requerir el modelo base completo, el consumo de VRAM lo determina Qwen3.5-9B, no el adaptador; el adaptador anade una sobrecarga minima en memoria.
- Evaluacion comparativa de adaptadores de dominio: permite contrastar el comportamiento de un ajuste LoRA frente a otros adaptadores sobre el mismo modelo base en tareas de comprension lectora biomedica.
- Filtrado y clasificacion de texto clinico en pipelines internos: solo tras validar la tasa de falsos positivos y negativos con datos representativos, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: determinada por el modelo base Qwen3.5-9B, no por el adaptador. En fp16, un modelo de 9B requiere aproximadamente 18 GB de VRAM solo para pesos; en cuantizacion de 8 bits, en torno a 9-10 GB; en 4 bits, alrededor de 5-6 GB. Estas cifras son estimaciones genericas para un modelo denso de 9B y no estan confirmadas para este modelo base concreto.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 en contextos moderados; RTX 3090 o RTX 4080 para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, con cuantizacion de 4 u 8 bits en tarjetas de 8-24 GB, siempre que el modelo base lo soporte.
- Opciones de despliegue: vLLM, TGI y transformers con PEFT para cargar el adaptador; llama.cpp y Ollama solo si existe una conversion GGUF del modelo base y del adaptador fusionado, lo cual no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MedGate-9B (este) | no disponible (~9B base) | no disponible | no disponible | Adaptador LoRA en HF, 0 descargas | Model card sin completar |
| Qwen3.5-9B (base) | ~9B | no disponible en esta ficha | no disponible en esta ficha | Modelo base en HF | Referencia obligatoria para cualquier uso |
| Alternativas medicas de 9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen3.5-9B antes de cualquier despliegue.
- Riesgo de alucinacion: inherente a los modelos generativos y especialmente critico en dominio medico, donde una respuesta incorrecta puede causar dano; no hay evaluacion publicada que acote este riesgo.
- Sin benchmarks ni validacion clinica: no existen metricas que respalden la calidad del ajuste ni su seguridad.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso comunitario ni de replicacion independiente.
- El adaptador requiere el modelo base completo para funcionar: el tamano de 0,4 GB no refleja los requisitos reales de despliegue.
- Uso en produccion: desaconsejado sin una auditoria previa del dataset de entrenamiento, evaluacion en el dominio objetivo y revision por parte de profesionales sanitarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salihfurkaan/MedGate-9B
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- Articulo citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
