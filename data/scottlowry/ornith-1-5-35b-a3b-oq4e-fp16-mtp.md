# scottlowry/Ornith-1.5-35B-A3B-oQ4e-fp16-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ4e-fp16-mtp es una cuantizacion en 4 bits del modelo base ornith-ai/Ornith-1.5-35B-A3B, realizada por Scott Lowry mediante la herramienta oQ (oMLX v0.6.2) con precision mixta. El modelo base pertenece a la familia Ornith, desarrollada por DeepReinforce AI, especializada en tareas de codificacion agente y uso de herramientas. La nomenclatura A3B sugiere una arquitectura MoE con 35.000 millones de parametros totales y 3.000 millones activos por token, aunque este dato no esta confirmado para la version 1.5.

La cuantizacion reduce significativamente el peso del modelo (22,5 GB en el repositorio) y lo adapta al formato MLX safetensors, pensado para ejecucion eficiente en hardware Apple Silicon. El modelo se presenta como una opcion para ejecutar un modelo de razonamiento y codigo de gran tamano en equipos de consumo, sin necesidad de infraestructura de servidor dedicada. Sin embargo, la informacion publica sobre el modelo base es escasa y no se han publicado resultados de benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos) |
| Parametros totales | 35.000 millones (estimado por nomenclatura, no confirmado) |
| Parametros activos | 3.000 millones (estimado por nomenclatura A3B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (oQ4e), grupo de 64, precision mixta (fp16 para ciertas capas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

Nota: los parametros totales reales de los safetensors cuantizados son 6.190.932.912, correspondientes a la representacion comprimida, no al modelo original.

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B utiliza una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen3.5, segun el tag `qwen3_5_moe`. No se dispone de informacion publica sobre el numero de expertos, la estrategia de activacion ni los datos de entrenamiento. La serie Ornith, en su version 1.0, se describia como un conjunto de modelos de codificacion agente con capacidades de auto-mejora y tool use, entrenados con tecnicas de refuerzo y ajuste fino supervisado. Para la version 1.5 no se han encontrado detalles especificos.

La cuantizacion aplicada con oQ utiliza una estrategia de precision mixta: las capas sensibles (como las de atencion) se mantienen en fp16 mientras que el resto se cuantiza a 4 bits con grupo de 64. Esto busca preservar la calidad del modelo mientras se reduce el uso de memoria. El resultado es un conjunto de pesos en formato MLX safetensors, compatible con la libreria MLX de Apple.

## Capacidades

- Generacion de texto y razonamiento: al ser un modelo MoE de gran tamano, se espera que maneje tareas complejas de lenguaje, aunque no hay evaluaciones publicas.
- Codificacion agente: la familia Ornith esta disenada para tareas de programacion autonoma, incluyendo generacion de codigo, depuracion y refactorizacion.
- Uso de herramientas (tool calling): probable soporte para invocar funciones externas, basado en las capacidades de la serie Ornith 1.0, aunque no confirmado para 1.5.
- Razonamiento multi-paso: posible capacidad para descomponer problemas y ejecutar pasos intermedios, comun en modelos de codificacion agente.
- Multilingue: no hay datos especificos, pero los modelos base de Qwen suelen soportar multiples idiomas; no confirmado.
- Ejecucion en Apple Silicon: gracias a la cuantizacion MLX, el modelo puede ejecutarse en Macs con memoria unificada suficiente.

## Casos de uso

- Asistente de programacion local: un desarrollador puede cargar el modelo en un Mac con 32 GB de RAM o mas y usarlo como copiloto de codigo offline, generando funciones, explicando fragmentos o sugiriendo correcciones.
- Automatizacion de tareas de refactorizacion: el modelo puede recibir un codigo fuente y proponer cambios estructurales, aunque la falta de benchmarks impide validar su fiabilidad en produccion.
- Agente de integracion continua: si soporta tool calling, podria integrarse en pipelines de CI/CD para revisar pull requests, generar tests o documentar cambios, siempre que se valide su precision previamente.
- Entorno de desarrollo integrado (IDE) con privacidad: al ejecutarse en local, evita enviar codigo propietario a servicios en la nube, adecuado para empresas con requisitos de confidencialidad.
- Educacion y formacion en programacion: puede usarse para generar ejemplos, explicar conceptos o evaluar soluciones de estudiantes, con la precaucion de que las respuestas pueden contener errores.
- Prototipado rapido de agentes conversacionales: desarrolladores pueden experimentar con un modelo de razonamiento avanzado sin coste de API, usando MLX y Python para construir demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras pruebas estandar para el modelo base Ornith-1.5-35B-A3B ni para esta cuantizacion. Se recomienda realizar evaluaciones propias antes de usar el modelo en entornos criticos.

## Requisitos de hardware

- Memoria: el modelo cuantizado a 4 bits ocupa aproximadamente 3,1 GB en pesos (6,19B parametros × 0,5 bytes), pero el repositorio completo pesa 22,5 GB, probablemente por incluir versiones adicionales o metadatos. Para inferencia, se estima que un Mac con 16 GB de RAM unificada puede ejecutarlo, aunque 32 GB ofrecen margen para contexto largo.
- GPU: disenado para Apple Silicon (M1, M2, M3 y superiores) usando MLX. No hay soporte nativo para CUDA en este formato.
- Opciones de despliegue: la libreria MLX permite cargar el modelo en Python; tambien es compatible con herramientas como llama.cpp si se convierten los pesos a GGUF, aunque no es el formato original.
- Latencia y throughput: no disponibles. En un Mac M2 Pro con 32 GB, se espera una velocidad de generacion de 10-20 tokens por segundo para un modelo de 3B activos, pero es una estimacion sin pruebas.

## Comparativa con modelos similares

La comparativa se basa en la serie Ornith 1.0, ya que no hay datos de 1.5. Modelos MoE de tamano similar orientados a codigo:

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este) | 35B (est.) | 3B (est.) | no disp. | no disp. | MLX cuantizado |
| Ornith-1.0-35B | 35B | 3B | no disp. | no disp. | Hugging Face |
| Qwen2.5-Coder-32B-A3B | 32B | 3B | 131K | Apache 2.0 | Hugging Face |
| DeepSeek-Coder-V2-Lite | 16B | 2.4B | 128K | DeepSeek License | Hugging Face |

La falta de datos de rendimiento impide una comparacion objetiva. Qwen2.5-Coder-32B-A3B es una alternativa con licencia permisiva y benchmarks publicos, mientras que Ornith-1.0-35B se ha posicionado como un modelo de codificacion agente con buenos resultados en pruebas informales.

## Limitaciones y advertencias

- Informacion insuficiente: no se conocen la licencia, los idiomas, el contexto maximo ni los datos de entrenamiento del modelo base, lo que impide evaluar su idoneidad legal y tecnica.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar codigo incorrecto o respuestas inventadas; sin benchmarks, el riesgo es mayor.
- Sesgos desconocidos: no hay auditorias publicas sobre sesgos de genero, raza o idioma.
- Compatibilidad limitada: el formato MLX solo funciona en Apple Silicon; para GPUs NVIDIA es necesario convertir los pesos, lo que puede degradar la calidad.
- Cuantizacion agresiva: el uso de 4 bits puede afectar la precision en tareas de razonamiento complejo, aunque la precision mixta mitiga parcialmente este efecto.
- Sin soporte oficial: el modelo es una cuantizacion comunitaria; el autor original no proporciona garantias ni actualizaciones.

## Enlaces

- Modelo cuantizado: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta de cuantizacion oQ: https://github.com/jundot/omlx
- Busqueda de modelos cuantizados de Ornith: https://huggingface.co/models?other=base_model:quantized:ornith-ai/Ornith-1.5-35B-A3B
- Articulo sobre Ornith-1.0-35B: https://xhinker.medium.com/ornith-1-0-35b-the-moe-model-that-runs-like-3b-thinks-like-27b-1e7a0fe5a64e
