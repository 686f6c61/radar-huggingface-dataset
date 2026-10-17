# hkust-aaron/EdgeRock-4B-FP8

## Resumen

EdgeRock-4B-FP8 es una version cuantizada a FP8 del modelo EdgeRock, desarrollado por Rock Matrix y publicado en Hugging Face bajo el identificador hkust-aaron/EdgeRock-4B-FP8. Se trata de un modelo de generacion de texto de 4.578.061.568 parametros (4,58 mil millones) cuyo proposito es ofrecer la arquitectura de razonamiento de memoria constante de EdgeRock en un paquete de pesos mas ligero, reduciendo el tamano de los ficheros de 8,527 GiB (BF16) a 5,208 GiB.

La innovacion principal del modelo base es su arquitectura de memoria recurrente combinada con atencion local y los denominados Rock Memory Anchors (RMA), una aproximacion orientada a mantener un consumo de memoria estable durante el razonamiento. La implementacion se apoya en la arquitectura Qwen3.5 empaquetada en una version fijada de la libreria Transformers, e incorpora pesos FP8 E4M3 organizados en bloques de 128 x 128 con activaciones FP8 dinamicas. Segun el autor, los pesos RMA, las compuertas recurrentes de menor tamano, el embedding/output head atado, la capacidad de cache y los ajustes de estado recurrente conservan sus valores originales; solo se cuantizan las matrices grandes de proyeccion y MLP.

La relevancia actual del modelo reside en su enfoque de memoria constante para tareas de razonamiento con entradas largas (se validan prompts de hasta 10.462 tokens) y en su empaquetado FP8, que reduce el espacio en disco aunque exige hardware NVIDIA con compute capability 9.0 o superior. El modelo se distribuye unicamente para inferencia de texto: el frontend multimodal y los adaptadores de servicio nativos del modelo original no estan incluidos en este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con estado recurrente, atencion local y Rock Memory Anchors (RMA); implementacion basada en Qwen3.5 |
| Parametros totales | 4.578.061.568 (4,58 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (se validan entradas de 9.664 y 10.462 tokens; la capacidad de cache conserva los valores del modelo origen) |
| Tipos de cuantizacion | FP8 E4M3 en bloques de 128 x 128 con activaciones FP8 dinamicas; cuantizacion de precision mixta |
| Idiomas soportados | no disponible (la validacion incluye una prueba de traduccion de chino a ingles) |
| Licencia | edgerock-model-license-1.0 (pesos); Apache-2.0 (codigo) |
| Formato de pesos | safetensors |
| Tamano de los pesos | 5,208 GiB (frente a 8,527 GiB del origen BF16) |
| Tamano del repositorio | 5,6 GB |
| Libreria | transformers (con soporte de codigo personalizado, trust_remote_code) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

EdgeRock emplea una arquitectura de razonamiento de memoria constante que combina un estado recurrente, atencion local y los Rock Memory Anchors (RMA). No se trata de un transformer denso convencional: el diseno busca mantener un uso de memoria estable en lugar de crecer linealmente con la longitud de la secuencia. La implementacion empaquetada en este repositorio se apoya en la version de Qwen3.5 incluida en una rueda de Transformers fijada por el autor, lo que obliga a instalar las dependencias del repositorio en un entorno limpio.

Esta release concreta es una cuantizacion del modelo base rockmatrix-ai/EdgeRock, congelado en la revision `a6a53a5573f1`. La cuantizacion afecta a las matrices grandes de proyeccion y MLP, mientras que los pesos RMA, las compuertas recurrentes pequenas, el embedding/output head atado, la capacidad de cache y los ajustes de estado recurrente mantienen los valores del modelo origen. El formato FP8 E4M3 con bloques de 128 x 128 y activaciones dinamicas convierte esta release en una cuantizacion de precision mixta. La validacion del autor verifico 168 tensores protegidos bit a bit contra el origen y comprobo que el cambio maximo de logits tras guardar y recargar era 0. No se proporcionan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de chat empaquetada en el repositorio.
- Razonamiento matematico: la validacion incluye pruebas sobre GSM8K y un ejemplo de calculo aritmetico (17 x 23).
- Modo de razonamiento con seccion de "thinking" que debe cerrarse para considerar una respuesta como correcta en las pruebas del autor.
- Manejo de entradas largas: se validan prompts de aproximadamente 2K, 8K, 9.664 y 10.462 tokens, con pruebas de actualizacion de memoria y desambiguacion de claves.
- Recuperacion de identificadores (identifier-retrieval) sobre prompts extensos.
- Traduccion: se incluye una comprobacion de traduccion de chino a ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; solo se documenta una comprobacion chino-ingles.
- Capacidades de vision: el modelo base dispone de un frontend multimodal en el repositorio original, pero este paquete cuantizado no lo incluye ni lo valida.
- Capacidades de audio: no disponible.

## Casos de uso

- Razonamiento matematico asistido: el modelo resuelve problemas tipo GSM8K con decodificacion voraz y presupuesto de salida de 4.096 tokens, lo que lo hace adecuado para tutoria o verificacion de calculos paso a paso en entornos educativos.
- Analisis de documentos largos con memoria acotada: gracias al diseno de memoria constante y a las pruebas con entradas de hasta 10.462 tokens, puede emplearse para resumir o responder preguntas sobre informes extensos sin que el consumo de memoria crezca de forma descontrolada.
- Recuperacion de informacion en contextos extensos: las pruebas de identifier-retrieval sobre prompts de 2K y 8K indican que el modelo puede localizar datos concretos dentro de contextos amplios, util en sistemas RAG con pasajes largos.
- Traduccion tecnica chino-ingles: la validacion incluye una comprobacion de traduccion, de modo que puede integrarse en flujos de localizacion o en procesamiento de documentacion tecnica en esos idiomas.
- Despliegue en infraestructura Hopper o Blackwell con restricciones de VRAM: al ocupar 5,208 GiB en disco y admitir ejecucion FP8 en GPU con compute capability 9.0 o superior, encaja en entornos con aceleradores modernos donde interesa reducir el espacio de pesos.
- Asistente conversacional de dominio acotado: su pipeline de text-generation y la plantilla de chat permiten usarlo como chatbot especializado, siempre que la aplicacion no dependa de vision ni de adaptadores de servicio nativos.
- Procesamiento por lotes de preguntas y respuestas: la decodificacion sin muestreo y el control del presupuesto de tokens facilitan la generacion reproducible en pipelines automatizados de evaluacion o anotacion.

## Benchmarks y rendimiento

Los datos disponibles corresponden a comprobaciones de conversion y a pruebas reducidas del autor, no a una evaluacion completa de benchmarks. Se presentan tal cual:

| Prueba | Origen BF16 | Esta release (FP8) |
|---|---:|---:|
| Ficheros de pesos | 8,527 GiB | 5,208 GiB |
| NLL con teacher forcing en 32 ejemplos de test de GSM8K | 0,9892 | 0,9932 |
| Cambio maximo de logits tras guardar y recargar | no disponible | 0 |
| Respuestas completas correctas (filas 32-47 de test de GSM8K, greedy, 4.096 tokens) | 15/16 | 15/16 |
| Comprobaciones de actualizacion de memoria y desambiguacion de claves (9.664 y 10.462 tokens) | 2/2 | 2/2 |
| Tensores protegidos verificados bit a bit | no aplica | 168 |

El propio autor advierte de que el chequeo de NLL es una comprobacion de conversion, no una puntuacion de precision sobre GSM8K, y que las pantallas de generacion son demasiado pequenas para establecer que la precision se mantiene intacta en benchmarks completos. La precision de benchmarks completos y el throughput de servicio optimizado no se han vuelto a medir para estos pesos.

## Requisitos de hardware

- La ejecucion FP8 exige una GPU NVIDIA con compute capability 9.0 o superior (arquitecturas Hopper o posteriores, como H100, H200, B100, B200 o la generacion Blackwell para consumo).
- La primera ejecucion descarga el kernel de finegrained-FP8 desde Hugging Face.
- VRAM estimada: los pesos ocupan aproximadamente 5,2 GiB, por lo que se necesitan alrededor de 6-8 GiB de VRAM sumando activaciones y cache, aunque no se proporciona una cifra oficial.
- GPU de consumo: no cabe esperar compatibilidad con GPUs de la generacion Ada (por ejemplo, RTX 4090), ya que su compute capability es 8.9 y queda por debajo del minimo exigido. El autor no documenta GPUs de consumo compatibles.
- Opciones de despliegue: ruta de inferencia en PyTorch a traves de Transformers con `trust_remote_code=True` y el cargador HQQ. El autor indica que no es un modelo GGUF ni Ollama, por lo que no estan previstas esas rutas.
- Se recomienda entorno Python limpio con las dependencias del repositorio y `dtype=torch.bfloat16`.
- Latencia y throughput: no disponibles; el autor senala que el throughput de servicio optimizado no se ha vuelto a medir para estos pesos.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la informacion disponible. La unica referencia directa es el propio modelo base rockmatrix-ai/EdgeRock en BF16, del que esta release es una cuantizacion: comparte arquitectura, parametros y licencia, pero ocupa mas espacio en disco (8,527 GiB frente a 5,208 GiB) y no requiere la ruta FP8 con compute capability 9.0. Comparativas con alternativas de terceros: no disponible.

## Limitaciones y advertencias

- La licencia de los pesos es edgerock-model-license-1.0 (etiquetada como "other"), distinta del codigo, que es Apache-2.0. Es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- El modelo se distribuye unicamente para inferencia de texto; el frontend multimodal del modelo base no esta incluido ni validado en este paquete.
- No es un modelo GGUF ni Ollama, lo que limita las opciones de despliegue en entornos que dependan de esos formatos.
- La ejecucion FP8 requiere hardware NVIDIA con compute capability 9.0 o superior, lo que excluye gran parte del parque de GPUs de consumo.
- La validacion se limita a pantallas pequenas (32 ejemplos de NLL, 16 filas de GSM8K, dos comprobaciones de contexto largo). El propio autor advierte que no demuestran que la precision completa se mantenga.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion proporcionada; al no haber datos, conviene tratarlos como aspectos no evaluados.
- Dependencia de una version fijada de Transformers y de una rueda concreta, lo que puede complicar la integracion en stacks existentes.
- Los datos demograficos, de composicion del dataset y de proceso de alineacion no estan disponibles, por lo que no se puede evaluar el origen de posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hkust-aaron/EdgeRock-4B-FP8
- Modelo base rockmatrix-ai/EdgeRock: https://huggingface.co/rockmatrix-ai/EdgeRock
- Revision congelada del modelo base: https://huggingface.co/rockmatrix-ai/EdgeRock/tree/a6a53a5573f12df4a26eb67d3e990a3574f5edf0
- Informe tecnico (arXiv): https://arxiv.org/abs/2610.10118
- Repositorio original (frontend multimodal y adaptadores de servicio): https://github.com/rockmatrix-ai/EdgeRock
