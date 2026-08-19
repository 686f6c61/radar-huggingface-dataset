# Pluto-AI-Labs/Apollo-VL-Edge-3B-MLX-4bit

## Resumen

Apollo-VL-Edge-3B es un modelo multimodal de visión-lenguaje desarrollado por Pluto-AI-Labs, un laboratorio de investigación centrado en llevar capacidades de IA de alto nivel a hardware de consumo. A pesar de su nombre comercial, el modelo cuenta con 1.151.066.112 parámetros (aproximadamente 1,15 mil millones), lo que lo sitúa en la gama de modelos compactos diseñados para ejecutarse en dispositivos edge. Se distribuye en formato MLX 4-bit, optimizado para Apple Silicon, y está basado en la arquitectura Qwen2.5-VL, lo que le permite procesar imágenes y texto de forma conjunta. La propuesta del laboratorio es demostrar que tareas como razonamiento, codificación y comprensión visual pueden ejecutarse localmente en portátiles, teléfonos o servidores sin conexión, sin sacrificar calidad ni privacidad.

El modelo está pensado para escenarios donde la latencia, el consumo energético y la privacidad son críticos. Al ser una versión cuantizada a 4 bits, reduce significativamente los requisitos de memoria frente al modelo original, aunque no se han publicado especificaciones detalladas sobre el contexto máximo ni el proceso de entrenamiento. Su disponibilidad pública en Hugging Face, junto con versiones GGUF creadas por terceros, amplía su uso a entornos llama.cpp y otras herramientas de inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (vision-language transformer) |
| Parametros totales | 1.151.066.112 (1,15B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de Qwen2.5-VL) |
| Tipos de cuantizacion | 4-bit (MLX), GGUF (i1, imatrix) disponible por terceros |
| Idiomas soportados | ingles (segun el repo) |
| Licencia | no disponible en el repo original; la version GGUF de mradermacher indica apache-2.0 |
| Formato de pesos | safetensors (MLX), GGUF (derivado) |

## Arquitectura y entrenamiento

Apollo-VL-Edge-3B se basa en la arquitectura Qwen2.5-VL, un modelo de lenguaje multimodal que combina un codificador visual con un transformer de lenguaje para procesar entradas de imagen y texto. La version publicada en este repositorio esta convertida al formato MLX y cuantizada a 4 bits, lo que reduce el peso del modelo a aproximadamente 3,1 GB en disco. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. Pluto-AI-Labs declara en su perfil de GitHub que su enfoque se centra en construir modelos y herramientas de MLOps para el edge, priorizando la precision sobre la escala, pero no ofrece informacion tecnica adicional sobre este modelo concreto.

Al tratarse de una conversion MLX, se asume que el modelo original fue entrenado en un framework compatible con PyTorch y posteriormente adaptado para su ejecucion en hardware Apple. La existencia de una version GGUF (Apollo-VL-Edge-3B-i1-GGUF) sugiere que el modelo tambien puede ejecutarse con llama.cpp, aunque esa conversion fue realizada por un tercero (mradermacher) y no por el laboratorio original.

## Capacidades

- Comprension de imagenes y texto: procesa entradas visuales y textuales de forma conjunta, permitiendo tareas como descripcion de imagenes, respuesta a preguntas visuales y analisis de documentos escaneados.
- OCR (reconocimiento optico de caracteres): segun los tags de la version GGUF, el modelo es capaz de extraer texto de imagenes.
- Comprension de graficos y tablas: los tags incluyen "chart-understanding", lo que indica capacidad para interpretar graficos y visualizaciones de datos.
- Conversacion multimodal: soporta dialogos de ida y vuelta en los que el usuario puede adjuntar imagenes y hacer preguntas sobre ellas.
- Razonamiento y logica: aunque no se especifica en la ficha tecnica, la filosofia del laboratorio (demostrar razonamiento avanzado en hardware de consumo) sugiere que el modelo esta optimizado para tareas de razonamiento, aunque no hay benchmarks publicados que lo confirmen.
- Generacion de codigo: Pluto-AI-Labs tiene una coleccion de modelos de codificacion (Atlas-Coding-Models), pero no se confirma que este modelo en particular este especializado en codigo.

## Casos de uso

- Asistente visual para personas con discapacidad visual: el modelo puede describir el entorno a traves de la camara de un telefono, identificando objetos, texto y escenas, y responder a preguntas del usuario en tiempo real.
- Digitalizacion de documentos en local: gracias a su capacidad de OCR y comprension de tablas, puede extraer informacion de facturas, formularios o tarjetas de visita sin enviar datos a la nube, preservando la privacidad.
- Analisis de capturas de pantalla para automatizacion de pruebas: un equipo de control de calidad puede usar el modelo para verificar que los elementos de una interfaz aparecen correctamente, comparando capturas con el resultado esperado.
- Chatbot de soporte tecnico con contexto visual: en un entorno de atencion al cliente, el modelo puede recibir una foto del problema del usuario (por ejemplo, un error en pantalla) y ofrecer pasos de solucion, todo ejecutado en un servidor local.
- Herramienta educativa offline: estudiantes pueden fotografiar problemas de matematicas o diagramas y recibir explicaciones paso a paso, sin necesidad de conexion a internet.
- Clasificacion y etiquetado de imagenes en entornos industriales: en una linea de produccion, el modelo puede analizar imagenes de piezas para detectar defectos o clasificarlas, ejecutandose en un mini-PC o en un dispositivo Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card original ni los resultados de busqueda web ofrecen datos de rendimiento como MMLU, HumanEval, GSM8K o metricas especificas de tareas de vision-lenguaje. La unica referencia es el dato de VRAM estimada (7,5 GB) proporcionado por LLM Explorer, pero sin detalle de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: 7,5 GB segun LLM Explorer para la version MLX 4-bit.
- GPU recomendadas: al ser un modelo MLX, esta optimizado para Apple Silicon (M1, M2, M3 o superiores) con memoria unificada. Para la version GGUF, puede ejecutarse en CPUs y GPUs compatibles con llama.cpp.
- Consumo en hardware de consumo: cabe en portatiles Apple con al menos 8 GB de RAM unificada (aunque 16 GB es mas comodo) y en tarjetas graficas con 8 GB de VRAM si se usa la version GGUF.
- Opciones de despliegue: MLX (Apple), llama.cpp, Ollama (si se integra), o cualquier framework que soporte GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 1,15B parametros cuantizado a 4 bits, se espera una inferencia rapida en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria. Aunque podria compararse con el Qwen2.5-VL-3B original (del que deriva) o con otros modelos vision-language compactos como LLaVA-Phi-3-mini o MiniGPT-4, no hay informacion suficiente sobre parametros exactos, contexto o rendimiento de Apollo-VL-Edge-3B para establecer una comparacion rigurosa. La unica referencia indirecta es que el modelo original Qwen2.5-VL tiene una licencia Apache 2.0, pero el repo de Pluto-AI-Labs no la especifica.

## Limitaciones y advertencias

- Licencia no clara: el repositorio original no indica licencia, lo que genera incertidumbre sobre su uso comercial. La version GGUF de terceros indica apache-2.0, pero no es vinculante para el modelo original.
- Idioma limitado: la model card solo declara ingles, por lo que su rendimiento en otros idiomas, incluido el espanol, no esta garantizado.
- Contexto no especificado: se desconoce la longitud maxima de contexto, lo que puede afectar a tareas que requieran dialogos largos o multiples imagenes.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo o cuando la imagen es ambigua.
- Sesgos potenciales: al estar entrenado principalmente con datos en ingles, puede reflejar sesgos culturales y linguisticos propios de ese corpus.
- Version cuantizada: la cuantizacion a 4 bits puede degradar la calidad de las respuestas frente al modelo original en precision completa, especialmente en tareas numericas o de detalle fino.
- Sin soporte oficial de la comunidad: al ser un modelo reciente con cero descargas y cero likes en Hugging Face, no hay garantia de mantenimiento, documentacion adicional o soporte por parte del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Pluto-AI-Labs/Apollo-VL-Edge-3B-MLX-4bit
- Perfil de Pluto-AI-Labs en HuggingFace: https://huggingface.co/Pluto-AI-Labs
- GitHub de Pluto AI Research Lab: https://github.com/Pluto-AI-Labs
- Coleccion Atlas-Coding-Models: https://huggingface.co/collections/Pluto-AI-Labs/atlas-coding-models
- Version GGUF por mradermacher: https://huggingface.co/mradermacher/Apollo-VL-Edge-3B-i1-GGUF
- Entrada en LLM Explorer: https://llm-explorer.com/model/Pluto-AI-Labs%2FApollo-VL-Edge-3B,3L5mtC3hkpxLl4GyPd7riU
