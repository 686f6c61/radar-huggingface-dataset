# mradermacher/Omni-Edu-Pro-27B-GGUF

## Resumen

Omni-Edu-Pro-27B-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Omni-Edu-Pro-27B, publicado por el usuario lhpku20010120 en Hugging Face. El repositorio lo mantiene mradermacher, un perfil conocido por generar versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El nombre comercial sugiere un modelo orientado al ambito educativo ("Edu") y de proposito general ("Omni"), aunque la model card no aporta documentacion tecnica al respecto.

El dato mas relevante y a la vez contradictorio es el recuento de parametros: el campo de safetensors indica 460.730.096 parametros (aproximadamente 0,46 mil millones), mientras que el nombre del modelo declara 27B. Esta discrepancia es significativa y debe tenerse en cuenta antes de cualquier evaluacion: o bien el nombre es un etiquetado comercial sin correspondencia con el tamano real, o bien el recuento publicado corresponde a un subcomponente (por ejemplo, un cabezal o un modulo), o bien se trata de un error de metadatos. El tamano del repositorio, 1,6 GB, es coherente con un modelo de aproximadamente 0,5 mil millones de parametros cuantizado, no con uno de 27B.

La relevancia de esta ficha es limitada pero practica: permite desplegar el modelo en hardware modesto mediante llama.cpp u Ollama, siempre que se asuma la falta de informacion sobre licencia, idiomas, contexto y rendimiento. No se dispone de resultados de benchmarks ni de documentacion sobre el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 460.730.096 (segun safetensors); el nombre declara 27B |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas de los pesos originales) |
| Version de cuantizacion | quantize_version 2 |
| Tipo de conversion | convert_type hf |
| Tensor de salida cuantizado | si (output_tensor_quantised 1) |
| Modelo base | lhpku20010120/Omni-Edu-Pro-27B |
| Tamano del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. La model card del repositorio GGUF se limita a los metadatos generados por la herramienta de cuantizacion (version de cuantizacion, tipo de conversion desde formato Hugging Face, lista de cuantizaciones disponibles) y a la referencia al modelo original. No se documentan el tipo de transformer, el uso de mecanismos de atencion lineal, mezcla de expertos ni ninguna otra innovacion arquitectonica.

Tampoco hay datos sobre el corpus de entrenamiento: numero de tokens, composicion del dataset, fases de ajuste supervisado, RLHF o DPO. La unica inferencia posible a partir de los metadatos es que los pesos originales estaban en formato Hugging Face y se convirtieron a GGUF con la herramienta estandar de llama.cpp, con cuantizacion del tensor de salida activada y version 2 del esquema de cuantizacion. No se ha publicado informacion sobre decodificacion especulativa, atencion con ventana deslizante ni tecnicas similares.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no hay documentacion que la confirme ni ejemplos de uso.
- Razonamiento y matematicas: no disponible; el nombre "Edu" sugiere un enfoque educativo, pero no hay evidencia tecnica que lo respalde.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Modo de razonamiento explicito: no disponible.

## Casos de uso

- Despliegue en hardware de gama baja: con 1,6 GB de repositorio y cuantizaciones desde Q2_K hasta Q8_0, el modelo puede ejecutarse en CPU o en GPUs con poca VRAM mediante llama.cpp, lo que permite experimentar con el modelo en portatiles o equipos sin GPU dedicada.
- Prototipado rapido de pipelines de inferencia: las cuantizaciones Q4_K_M y Q5_K_M permiten montar un servidor de pruebas con llama.cpp server u Ollama para validar integraciones antes de decidir si el modelo encaja en el producto.
- Evaluacion comparativa de cuantizaciones: al ofrecer doce variantes (desde Q2_K hasta x-f16), el repositorio sirve para medir la degradacion de calidad frente a tamano en un mismo modelo, util para calibrar umbrales de cuantizacion en produccion.
- Filtrado y clasificacion de texto en local: si el modelo base responde correctamente a instrucciones, puede usarse para tareas de etiquetado o moderacion en entornos con requisitos de privacidad, sin enviar datos a la nube.
- Educacion y demostraciones: por su reducido tamano, es adecuado para talleres y clases donde se explica el funcionamiento de GGUF, llama.cpp y la cuantizacion de modelos, sin necesidad de infraestructura costosa.
- Pruebas de regresion en CI: la variante Q4_K_S o Q2_K puede integrarse en tests automatizados que verifiquen que el pipeline de inferencia funciona de extremo a extremo, dado su bajo coste computacional.
- Uso como base para fine-tuning ligero: con 460 millones de parametros, es viable ajustar el modelo en una unica GPU consumer, aunque no hay documentacion que confirme su calidad como base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 460 millones de parametros, la variante x-f16 ocupa aproximadamente 0,9 GB en memoria; Q8_0 ronda los 0,5 GB; Q4_K_M, unos 0,3 GB. Estas cifras son estimaciones basadas en el recuento de parametros y el formato GGUF, no en mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar la variante x-f16 con holgura. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y en muchas integradas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles. Con este tamano, en una GPU moderna se espera una latencia por token muy baja, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

La comparacion se ve dificultada por la ambiguedad del tamano. Si se atiende al recuento de safetensors (460 millones de parametros), los comparables serian modelos pequenos como Qwen2.5-0.5B o SmolLM2-360M. Si se atiende al nombre (27B), los comparables serian modelos de gran tamano, pero el repositorio de 1,6 GB no es compatible con esa hipotesis.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF disponible |
|---|---|---|---|---|
| Omni-Edu-Pro-27B-GGUF | 460,7 M (segun safetensors) | no disponible | no disponible | si |
| Qwen2.5-0.5B | 0,49 B | 32.768 tokens | Apache 2.0 | si |
| SmolLM2-360M | 0,36 B | 8.192 tokens | Apache 2.0 | si |
| Llama 3.2 1B | 1,24 B | 131.072 tokens | Llama 3.2 Community License | si |

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, contexto y licencia. La ventaja de Qwen2.5-0.5B y SmolLM2-360M frente a este repositorio es la existencia de documentacion tecnica, licencia explicita y benchmarks publicados.

## Limitaciones y advertencias

- Discrepancia critica de tamano: el nombre declara 27B pero safetensors indica 460,7 millones de parametros y el repositorio pesa 1,6 GB. No debe asumirse que el modelo tiene 27B sin verificacion previa.
- Licencia no disponible: no se puede confirmar el uso comercial. Es imprescindible consultar el repositorio del modelo base (lhpku20010120/Omni-Edu-Pro-27B) antes de cualquier despliegue en produccion.
- Idiomas no declarados: no hay garantia de soporte de castellano ni de otros idiomas.
- Contexto desconocido: no se puede planificar el uso con conversaciones largas o documentos extensos.
- Sin benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni otras tareas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion especifica, no puede acotarse.
- Sesgos: no documentados; al no conocerse el corpus de entrenamiento, no es posible evaluar sesgos de genero, raza o ideologicos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad.
- Modelo base de autor individual sin trazabilidad: no se identifica el equipo, organizacion ni paper asociado.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; para uso real se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Omni-Edu-Pro-27B-GGUF
- Modelo base: https://huggingface.co/lhpku20010120/Omni-Edu-Pro-27B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Herramienta de cuantizacion (llama.cpp): https://github.com/ggerganov/llama.cpp
- Runtime Ollama: https://ollama.com
