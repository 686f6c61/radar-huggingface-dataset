# saint32/alfath-ekstraksi-q8-v2

## Resumen

alfath-ekstraksi-q8-v2 es un modelo de extraccion de informacion derivado de Qwen/Qwen2.5-3B-Instruct, publicado por el usuario saint32 (Universidad Telkom) como parte de un trabajo de fin de grado sobre automatizacion de datos financieros a partir de tickets fisicos. El modelo toma texto OCR de recibos de compra (generado con PaddleOCR) y lo transforma en JSON estructurado con los campos `total`, `subtotal` e `items` (cada item con `nama`, `qty` y `harga`).

Tecnicamente es un ajuste fino mediante LoRA (version v2) que se ha fusionado con el modelo base y posteriormente se ha cuantizado a Q8_0 en formato GGUF. El modelo base Qwen2.5-3B-Instruct es un transformer denso de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) con una ventana de contexto de 32.768 tokens segun la documentacion de Qwen2.5, aunque la model card de este derivado no especifica el contexto efectivo tras el ajuste.

Su relevancia es acotada: se trata de un modelo experimental, orientado exclusivamente a investigacion y evaluacion no comercial bajo la licencia Qwen Research, con cero descargas en el momento de la consulta. Su interes practico reside en el caso de uso concreto (extraccion estructurada de tickets) y en el enfoque de modelo ligero cuantizado para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-3B-Instruct), ajuste LoRA fusionado |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para este derivado (el base Qwen2.5-3B-Instruct declara 32.768 tokens) |
| Tipos de cuantizacion | Q8_0 (GGUF); el repositorio solo publica esta cuantizacion |
| Idiomas soportados | id (indonesio); el modelo base soporta multiples idiomas, pero el ajuste esta orientado a indonesio |
| Licencia | qwen-research (etiquetada como "other" con license_name qwen-research); solo investigacion/evaluacion, no comercial |
| Formato de pesos | GGUF (Q8_0) |
| Tamano del repositorio | 3,3 GB |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3,09 mil millones de parametros. Sobre esa base se aplico un adaptador LoRA (version v2) orientado a la tarea de conversion de texto OCR de tickets a JSON. Posteriormente, el adaptador se fusiono con los pesos del modelo base y el resultado se cuantizo a Q8_0 en formato GGUF, lo que explica el tamano de repositorio de 3,3 GB.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO adicionales sobre el ajuste. La inferencia se plantea con formato ChatML en crudo, decodificacion greedy (temperature 0, seed 0) y una entrada consistente en texto OCR producido por PaddleOCR. El autor indica que la salida es solo una propuesta y que la aplicacion exige revision humana antes de persistir los datos. No se documentan innovaciones arquitectonicas propias; el valor esta en el ajuste especifico de tarea y en la cuantizacion para despliegue ligero.

## Capacidades

- Extraccion de informacion estructurada: convierte texto OCR de tickets de compra en JSON con los campos `total`, `subtotal` e `items` (`nama`, `qty`, `harga`).
- Procesamiento de entrada en formato ChatML en crudo, con decodificacion determinista (greedy, temperature 0).
- Generacion de texto y seguimiento de instrucciones heredados de Qwen2.5-3B-Instruct (razonamiento basico, codigo y matematicas a nivel de un modelo de 3B).
- Capacidad multilingue heredada del modelo base, aunque el ajuste esta especializado en indonesio.
- No se documenta soporte de tool calling ni de function calling especifico para este derivado.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Digitalizacion de tickets de compra en comercio minorista: el modelo recibe el texto OCR de un ticket y devuelve un JSON con total, subtotal y lineas de detalle, lo que permite poblar bases de datos de gastos sin transcripcion manual.
- Automatizacion de contabilidad de pequenos negocios: integrado en un pipeline que captura la foto del ticket, ejecuta PaddleOCR y llama al modelo para obtener los campos financieros, reduciendo el tiempo de registro de gastos.
- Aplicaciones de gestion de gastos personales: el JSON generado alimenta directamente un registro de transacciones, con validacion humana previa tal como exige el autor.
- Procesamiento por lotes de archivos de tickets historicos: al ser un modelo de 3B cuantizado a Q8_0, puede ejecutarse en hardware modesto para reprocesar lotes de documentos escaneados.
- Despliegue local en entornos con requisitos de privacidad: al caber en equipos de consumo y ejecutarse con Ollama, permite procesar datos financieros sin enviarlos a servicios en la nube.
- Prototipado e investigacion academica: sirve como referencia para trabajos sobre extraccion de informacion con modelos ligeros y para comparar estrategias de ajuste LoRA y cuantizacion.
- Verificacion asistida de documentos: combinado con reglas de validacion (suma de items frente a subtotal), el modelo puede proponer una extraccion que un humano confirma, reduciendo errores de digitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar cuantizado a Q8_0 con 3,09 mil millones de parametros, los pesos ocupan aproximadamente 3,3 GB; con overhead de contexto y runtime se recomienda al menos 5-6 GB de VRAM o memoria unificada.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. Para despliegues de mayor concurrencia, A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 6 GB o mas de VRAM; tambien puede ejecutarse en CPU con llama.cpp u Ollama.
- Opciones de despliegue: Ollama (el autor documenta `ollama pull hf.co/saint32/alfath-ekstraksi-q8-v2:Q8_0`), llama.cpp y otros runtimes compatibles con GGUF. vLLM y TGI requeririan convertir los pesos a safetensors, no incluidos en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| alfath-ekstraksi-q8-v2 | 3,09 B | no disponible (base: 32.768) | GGUF Q8_0 | qwen-research (no comercial) | Extraccion de tickets en indonesio |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 | safetensors, GGUF | Apache 2.0 (segun el modelo base) | Asistente general |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | safetensors, GGUF | Apache 2.0 | Asistente general, menor coste |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 | safetensors, GGUF | Llama 3.2 Community License | Asistente general multilingue |

La comparativa se limita a modelos de tamano equivalente; no se dispone de datos de rendimiento para comparar la calidad de extraccion de este derivado frente a alternativas. La diferencia principal frente a Qwen2.5-3B-Instruct es la especializacion en la tarea y la licencia mas restrictiva (qwen-research frente a Apache 2.0 del base, segun la informacion disponible).

## Limitaciones y advertencias

- Licencia qwen-research: uso restringido a investigacion y evaluacion; no se permite uso comercial segun la model card.
- Modelo experimental con cero descargas y un unico "like" en el momento de la consulta; no hay evidencia de validacion externa.
- La salida es solo una propuesta: el autor exige revision humana antes de guardar los datos, lo que indica riesgo de errores en la extraccion.
- Riesgo de alucinacion en campos numericos (total, subtotal, precios) si el texto OCR es ruidoso o incompleto.
- Especializado en indonesio y en el formato de tickets de compra; su rendimiento fuera de ese dominio o idioma no esta documentado.
- Depende de la calidad del OCR de entrada (PaddleOCR); errores en la captura se propagan a la salida.
- No se documentan sesgos conocidos, pero al derivar de un modelo general puede heredar los del base.
- Contexto efectivo no documentado para este derivado; entradas muy largas pueden degradar la extraccion.
- Solo se publica cuantizacion Q8_0; no hay versiones en safetensors ni otras cuantizaciones para comparar.
- No se han publicado benchmarks, por lo que no es posible evaluar su calidad frente a alternativas sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saint32/alfath-ekstraksi-q8-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Ollama: https://ollama.com
