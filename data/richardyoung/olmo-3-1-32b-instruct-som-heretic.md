# richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic

## Resumen

Olmo-3.1-32B-Instruct-SOM-heretic es una variante del modelo Olmo-3.1-32B-Instruct de AllenAI, publicada por el usuario richardyoung. Se trata de una finetune orientada a eliminar los mecanismos de rechazo y moderacion del modelo original (proceso conocido como "abliteration" o "decensoring"), etiquetada con los tags heretic, uncensored y abliterated. El modelo conserva la arquitectura y el tamano del original: 32.233.522.176 parametros en formato safetensors, con un repositorio de 64,5 GB.

El modelo base, Olmo-3.1-32B-Instruct, forma parte de la familia Olmo de AllenAI, disenada como una linea de modelos abiertos con datos de entrenamiento publicos. Esta variante mantiene la licencia Apache 2.0 declarada y esta pensada para generacion de texto conversacional en ingles. La modificacion principal afecta al comportamiento de rechazo: el modelo ha sido ajustado para responder a peticiones que el original rechazaria.

Es relevante ahora porque representa un ejemplo de la practica creciente de publicar variantes "abliterated" de modelos abiertos, lo que plantea cuestiones sobre seguridad, uso responsable y las condiciones de acceso restringido (gated) que Hugging Face aplica a este repositorio. El modelo registra 495 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Olmo 3, segun tags del modelo) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo deriva de allenai/Olmo-3.1-32B-Instruct mediante un proceso de finetune etiquetado como "heretic" y "abliterated". No se detallan en la informacion proporcionada los pormenores de la arquitectura interna (numero de capas, dimension del modelo, tipo de atencion) ni la composicion exacta del dataset de entrenamiento. El tag dataset:allenai/Dolci-Instruct-RL sugiere el uso de datos de instruccion y RL del ecosistema Olmo, pero no se especifica el volumen de tokens ni si se aplicaron tecnicas de RLHF o DPO en esta variante concreta.

La innovacion tecnica declarada es la eliminacion de los mecanismos de rechazo del modelo base, un proceso que en la practica suele implicar la modificacion de direcciones de activacion asociadas a comportamientos de negativa. No se aportan detalles sobre el metodo exacto empleado ni sobre posibles efectos colaterales en capacidades como el razonamiento o el codigo.

## Capacidades

- Generacion de texto conversacional en ingles.
- Respuesta a peticiones que el modelo base rechazaria, segun la etiqueta "uncensored" y "decensored".
- Herencia de las capacidades del modelo base Olmo-3.1-32B-Instruct (razonamiento, codigo, matematicas), aunque no se documentan evaluaciones especificas de esta variante.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar el comportamiento de sistemas sin mecanismos de rechazo, comparandolo con el original para analizar diferencias en tasas de negativa y contenido generado.
- Evaluacion de tecnicas de abliteration: sirve como caso de estudio para medir el impacto de la eliminacion de direcciones de rechazo en las capacidades generales del modelo.
- Generacion creativa sin restricciones tematicas: util en entornos controlados de escritura de ficcion que aborde temas sensibles, donde el modelo base podria declinar.
- Pruebas de robustez y red teaming: permite generar respuestas adversarias para evaluar filtros y sistemas de moderacion en pipelines de produccion.
- Analisis comparativo de variantes de un mismo modelo base: util para investigadores que comparan el modelo original con sus derivados en tareas de instruccion.
- Desarrollo de prototipos conversacionales en ingles: gracias a sus 32.000 millones de parametros, puede emplearse en entornos de investigacion con acceso restringido para experimentar con generacion de texto de alta capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (32.233 millones de parametros) se requiere al menos 64 GB en precision FP16/BF16, y en torno a 20-24 GB con cuantizacion de 4 bits.
- GPU recomendadas: A100 80 GB, H100 80 GB para precision completa; RTX 4090 (24 GB) o A6000 (48 GB) para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: si, con cuantizacion agresiva (4 bits) en GPUs de 24 GB como la RTX 4090, aunque con posibles perdidas de calidad.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no se confirman en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic | 32.233.522.176 | no disponible | apache-2.0 | Restringido (gated) |
| allenai/Olmo-3.1-32B-Instruct (base) | 32.233.522.176 (segun variante) | no disponible | no disponible en esta ficha | no disponible en esta ficha |
| Otras variantes abliterated de modelos de 32B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de mecanismos de rechazo: el modelo puede generar contenido que el original bloquearia, con riesgos de seguridad y uso indebido.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual en esta variante.
- Idiomas: soporte limitado al ingles, segun los metadatos.
- Licencia: se declara apache-2.0, pero el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face; conviene verificar las condiciones de uso comercial del modelo base de AllenAI.
- Contexto maximo: no disponible, lo que impide planificar su uso en tareas de contexto largo.
- Efectos de la abliteration: no se documenta si la eliminacion de rechazos degrada capacidades de razonamiento, codigo o instruccion.
- Datos de benchmarks ausentes: no hay evidencia publicada de su rendimiento real frente al modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Dataset referenciado: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Paper referenciado (arxiv:2512.13961): https://arxiv.org/abs/2512.13961
