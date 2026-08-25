# Axilotal/cadquery-qwen2.5-7b-v5.1-hardened

## Resumen

Axilotal/cadquery-qwen2.5-7b-v5.1-hardened es un modelo de lenguaje especializado en la generación de código CADQuery, una biblioteca de Python para modelado 3D paramétrico. Desarrollado por el usuario Axilotal, se trata de un ajuste fino (finetune) del modelo base unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit, que a su vez es una versión cuantizada de Qwen2.5-Coder-7B-Instruct. El entrenamiento se realizó con la librería Unsloth y TRL de HuggingFace, lo que permitió acelerar el proceso de ajuste. El modelo está pensado para resolver el problema de traducir descripciones en lenguaje natural a instrucciones de modelado CAD en código Python, una tarea de alta demanda en diseño industrial, arquitectura e ingeniería.

La arquitectura subyacente es un transformer decoder denso de la familia Qwen2.5, con aproximadamente 7.600 millones de parámetros. El modelo se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Aunque el repositorio no publica métricas de rendimiento, su especialización en CADQuery lo convierte en una opción relevante para desarrolladores que trabajan con diseño paramétrico asistido por IA. La fecha de creación (agosto de 2026) indica que es un modelo reciente, pero el número de descargas es cero, por lo que aún no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) basado en Qwen2.5 |
| Parametros totales | 7.615.616.000 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens, pero no se confirma en el finetune) |
| Tipos de cuantizacion | No disponible (solo se distribuye en safetensors, sin especificar cuantización) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención estándar y capas de normalización RMSNorm. No es un modelo MoE, sino denso, con todos los parámetros activos en cada paso de inferencia. El finetune se realizó sobre unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit, una versión cuantizada en 4 bits del modelo instruct de Qwen2.5-Coder, que ya incorpora capacidades de razonamiento y generación de código. El entrenamiento se llevó a cabo con Unsloth, una librería que optimiza el ajuste fino mediante técnicas de memoria eficiente y aceleración, junto con la librería TRL de HuggingFace para el pipeline de fine-tuning supervisado (SFT). No se especifica el número de tokens de entrenamiento, el tamaño del dataset de CADQuery ni si se aplicaron técnicas de RLHF o DPO. Dado el nombre del repositorio ("hardened"), es probable que se haya aplicado un proceso de endurecimiento para mejorar la robustez del código generado, aunque no hay detalles públicos al respecto.

## Capacidades

- Generacion de codigo CADQuery: el modelo traduce descripciones en lenguaje natural a sentencias de Python usando la libreria CadQuery, permitiendo crear modelos 3D parametricos.
- Razonamiento geometrico: hereda del modelo base la capacidad de razonar sobre geometria y logica espacial, util para generar primitivas, operaciones booleanas y extrusiones.
- Soporte de instrucciones en ingles: entrenado exclusivamente en ingles, por lo que las consultas y descripciones deben formularse en este idioma.
- Generacion de texto general: al ser un finetune de Qwen2.5-Coder-7B-Instruct, conserva capacidades de chat, escritura y razonamiento, aunque su especializacion puede degradar el rendimiento en tareas no relacionadas con CAD.
- No se ha confirmado soporte para tool calling, function calling, agentes o modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- **Automatizacion de diseño parametrico**: el modelo permite a ingenieros y disenadores generar piezas 3D editables a partir de descripciones textuales, reduciendo el tiempo de prototipado en software como FreeCAD o Jupyter Notebooks.
- **Generacion de scripts de fabricacion**: para entornos de fabricacion aditiva o CNC, el modelo puede producir codigo CadQuery listo para exportar a formatos STL o STEP, acelerando el flujo de trabajo desde la especificacion hasta la impresion.
- **Educacion y formacion en CAD**: estudiantes pueden describir una pieza y obtener un codigo comentado que les sirva de ejemplo para aprender la API de CadQuery, facilitando el aprendizaje de programacion geometrica.
- **Integracion en pipelines de diseño generativo**: el modelo puede integrarse en sistemas de optimizacion topologica donde se itera sobre descripciones de requisitos y se genera codigo CAD validado automaticamente.
- **Asistencia en revision de modelos**: al recibir un script CadQuery existente, el modelo puede explicar que hace cada bloque de codigo, ayudar a depurar errores y sugerir mejoras de parametrizacion.
- **Creacion de bibliotecas de piezas estandar**: se puede usar para generar codigo reutilizable de tornillos, rodamientos o carcasas a partir de una breve descripcion, acelerando la construccion de bibliotecas internas de componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de evaluacion en tareas como MMLU, HumanEval o GSM8K, ni comparativas con otros modelos de generacion de codigo CAD. El rendimiento real solo puede determinarse mediante pruebas propias.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en fp16 (probable formato de safetensors), el modelo necesita aproximadamente 15-16 GB de VRAM para inferencia sin cuantizacion adicional. Si se cuantiza a 4 bits mediante herramientas como llama.cpp o bitsandbytes, la VRAM necesaria baja a unos 5-6 GB.
- **GPU recomendadas**: una NVIDIA RTX 4090 (24 GB) puede cargar el modelo en 16 bits con margen para contexto largo. GPUs de centro de datos como A100 (40-80 GB) o H100 (80 GB) son adecuadas para despliegues con alto throughput. En consumer, una RTX 3080 (10 GB) solo puede ejecutarlo cuantizado a 4 bits.
- **Compatibilidad con consumer GPU**: sí, con cuantizacion 4-bit es ejecutable en GPUs de 8-12 GB VRAM, como la RTX 3060 o RTX 4070, aunque la velocidad de generacion sera moderada.
- **Opciones de despliegue**: al ser un modelo transformers, se puede servir con vLLM o Text Generation Inference (TGI) para inferencia optimizada. Para despliegue local, llama.cpp o Ollama son alternativas que permiten cuantizacion GGUF, aunque el repo no incluye estos formatos.
- **Latencia y throughput**: no se han publicado mediciones. En una A100 80GB con vLLM, un modelo de 7B en 16 bits suele alcanzar entre 50-100 tokens por segundo con batch de 1, pero estos valores son estimaciones no confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Axilotal/cadquery-qwen2.5-7b-v5.1-hardened | 7,6B | No disponible | CadQuery | Apache 2.0 | safetensors |
| unsloth/Qwen2.5-Coder-7B-Instruct-bnb4bit | 7,6B | 32K | Codigo general | Apache 2.0 | safetensors (4bit) |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32K | Codigo general | Apache 2.0 | safetensors |
| CodeLlama-7B-Instruct | 7B | 16K | Codigo general | Llama 2 license | safetensors |

El modelo se diferencia del base Qwen2.5-Coder en que esta especializado exclusivamente en CadQuery, lo que puede mejorar la precision en esa tarea pero degradar el rendimiento en otras tareas de codigo general. Frente a CodeLlama, ofrece una especializacion mas concreta y una licencia mas permisiva (Apache 2.0 vs Llama 2 license). No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un finetune de un modelo de codigo, puede generar codigo sintacticamente correcto pero geometricamente invalido, o inventar funciones de CadQuery que no existen. Es necesario validar el codigo generado en un entorno de ejecucion real.
- **Riesgo de alucinacion**: el modelo puede producir scripts con errores logicos, como extrusiones con dimensiones negativas o operaciones booleanas mal planteadas, sin avisar de la inconsistencia.
- **Limitaciones de contexto**: no se ha confirmado si el finetune mantiene la ventana de contexto de 32K del modelo base. En caso de no hacerlo, la generacion de codigo largo o con muchas instrucciones podria truncarse.
- **Idioma**: el modelo solo esta entrenado en ingles, por lo que no respondera correctamente en espanol u otros idiomas.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero no se garantiza la exactitud del codigo generado. El usuario asume la responsabilidad de verificar el resultado.
- **Falta de validacion**: con cero descargas y cero likes, no hay evidencia de que el modelo funcione como se espera. Se recomienda probarlo en un entorno aislado antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Axilotal/cadquery-qwen2.5-7b-v5.1-hardened
- Repositorio del modelo base (unsloth/Qwen2.5-Coder-7B-Instruct-bnb4bit): https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct-bnb4bit
- Repositorio oficial de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Modelo anterior v5 (sin hardened): https://huggingface.co/Axilotal/cadquery-qwen2.5-7b-v5
- Inferencia via FriendliAI: https://friendli.ai/models/Axilotal/cadquery-qwen2.5-7b-v5
