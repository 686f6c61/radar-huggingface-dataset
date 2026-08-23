# andosen/Psych_medgemma-mlx-5Bit

## Resumen

Psych_medgemma-mlx-5Bit es una conversión a formato MLX del modelo Compumacy/Psych_medgemma, realizada por el usuario andosen mediante la librería mlx-lm (versión 0.31.2). El modelo original es una adaptación de la familia Gemma 3 orientada a dominios de psicología y medicina, entrenada adicionalmente sobre el dataset Daemontatox/Psy-Data-books, que contiene material bibliográfico especializado. Esta versión MLX está cuantizada a 5 bits, lo que reduce el uso de memoria y permite su ejecución en hardware Apple Silicon con el framework MLX.

El modelo tiene 5.065.288.448 parámetros totales y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Al ser una conversión MLX, está pensada principalmente para inferencia en dispositivos con aceleración MLX (Macs con chip M-series), aunque también puede ejecutarse mediante la librería transformers de HuggingFace. Es relevante para desarrolladores que buscan un modelo especializado en conversación clínica y psicológica, con un tamaño compacto y cuantización eficiente para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (texto) - no se especifica la variante exacta |
| Parametros totales | 5.065.288.448 (5.06B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura base corresponde a un modelo de texto de la familia Gemma 3, aunque la model card no detalla si se trata de la variante de 4B o de 12B. El modelo original Compumacy/Psych_medgemma fue fine-tuneado sobre un dataset especializado en psicología y medicina (Daemontatox/Psy-Data-books), lo que sugiere que se entrenó para mantener conversaciones relacionadas con salud mental y asesoramiento. La conversión a MLX se realizó con mlx-lm 0.31.2, que convierte los pesos de safetensors originales al formato optimizado para Apple Silicon, aplicando cuantización de 5 bits. No se dispone de información sobre el número de tokens de entrenamiento, el uso de RLHF o técnicas de alineación adicionales más allá del fine-tuning sobre el dataset mencionado.

## Capacidades

- Generacion de texto conversacional, especialmente en el dominio de psicologia y salud mental.
- Comprension de consultas y preguntas relacionadas con sintomas, trastornos y bienestar psicologico (segun el dataset de entrenamiento).
- Capacidad de mantener conversaciones multi-turno (no se especifica la longitud de contexto, pero al ser de la familia Gemma se espera un contexto largo, aunque no se confirma).
- Uso mediante el chat template de Gemma (aplicable con `apply_chat_template`).
- Ejecucion en hardware Apple Silicon mediante MLX, con inferencia eficiente gracias a la cuantizacion de 5 bits.
- Compatibilidad con la libreria transformers de HuggingFace para su uso en entornos estandar.

## Casos de uso

- Atencion al paciente en entornos de salud digital: el modelo puede responder preguntas frecuentes sobre salud mental, ofrecer informacion general sobre trastornos y sugerir pautas de bienestar emocional, actuando como un asistente de primera linea en aplicaciones de telemedicina.
- Soporte a profesionales de la psicologia: como herramienta de apoyo para redactar resumenes de sesiones, generar escalas de evaluacion o preparar material psicoeducativo para pacientes, siempre con supervision humana.
- Chatbots de orientacion psicologica en entornos educativos o corporativos: el modelo puede gestionar conversaciones iniciales sobre estres, ansiedad o problemas laborales, derivando a servicios profesionales cuando sea necesario.
- Generacion de contenido divulgativo sobre salud mental: permite crear articulos, guias o respuestas en lenguaje claro sobre temas de psicologia, partiendo de las bases bibliograficas del dataset de entrenamiento.
- Entrenamiento y simulacion de casos clinicos: estudiantes de psicologia pueden interactuar con el modelo para practicar entrevistas o explorar distintos escenarios de paciente, mejorando sus habilidades de comunicacion.
- Integracion en aplicaciones de bienestar (wellness): el modelo puede ofrecer microintervenciones de apoyo emocional, tecnicas de respiracion o recordatorios de habitos saludables dentro de apps de meditacion o gestion del estres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta tablas de MMLU, HumanEval, GSM8K u otros indicadores en su ficha de HuggingFace ni en los resultados de busqueda web.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 5.06B parametros y cuantizacion de 5 bits, lo que ocupa aproximadamente 3.2 GB en memoria (5.06B * 5 bits / 8 = 3.16 GB). En la practica, con overhead de contexto y runtime, se recomienda un minimo de 8 GB de RAM unificada en Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 8 GB de memoria unificada (M1, M2, M3, M4 en sus variantes base o Pro). No se recomienda para GPUs NVIDIA ya que MLX es especifico de Apple.
- En consumer hardware: cabe en Macs de gama de entrada con 8 GB de RAM, aunque para contextos largos se recomienda 16 GB.
- Opciones de despliegue: mediante `mlx-lm` (Python) o con el runtime de MLX. Tambien se puede usar con transformers en CPU/GPU NVIDIA, pero la cuantizacion de 5 bits esta optimizada para MLX.
- Latencia y throughput: no se dispone de datos medidos. En un Mac M1 Pro con 16 GB, se puede esperar una generacion de alrededor de 20-40 tokens/segundo en cuantizacion 5 bits, pero no es un dato verificado.

## Comparativa con modelos similares

No se dispone de datos comparables. El modelo base Compumacy/Psych_medgemma no tiene benchmarks publicados en la informacion disponible. Como alternativa en el dominio de salud mental existen modelos como `medalpaca-13b` o `BioMistral`, pero no se ha confirmado que este modelo sea comparable en rendimiento ni en arquitectura. No se puede establecer una comparativa rigurosa sin datos.

## Limitaciones y advertencias

- El modelo no ha sido evaluado clinicamente y no debe usarse como sustituto de un diagnostico o tratamiento medico profesional.
- El dataset de entrenamiento es de libros de psicologia, lo que puede introducir sesgos de las fuentes y no cubrir todas las poblaciones o condiciones.
- Riesgo de alucinacion en respuestas clinicas: el modelo puede generar consejos incorrectos o peligrosos si se usa sin supervision.
- Solo soporta ingles, lo que limita su uso en poblaciones hispanohablantes sin traduccion adicional.
- No se conoce la longitud de contexto exacta; se recomienda probar con ventanas de 4K-8K tokens.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma 3 tiene su propia licencia de uso que debe revisarse (los terminos de Gemma original pueden ser mas restrictivos).
- No hay garantia de calidad del fine-tuning, ya que el dataset no esta descrito en detalle.

## Enlaces

- [HuggingFace: andosen/Psych_medgemma-mlx-5Bit](https://huggingface.co/andosen/Psych_medgemma-mlx-5Bit)
- [HuggingFace: Compumacy/Psych_medgemma (modelo base)](https://huggingface.co/Compumacy/Psych_medgemma)
- [Dataset: Daemontatox/Psy-Data-books](https://huggingface.co/datasets/Daemontatox/Psy-Data-books) (referenciado en la model card)
- [mlx-lm (documentacion de uso)](https://github.com/ml-explore/mlx-lm)
