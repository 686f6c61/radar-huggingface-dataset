# jianhui42/Bonsai-27B-1bit-WebGPU

## Resumen

Bonsai 27B 1bit WebGPU es un espacio de Hugging Face de tipo aplicación estática (sdk: static) que ejecuta localmente en el navegador el modelo Bonsai 27B, un transformer de 27 mil millones de parámetros con pesos empaquetados de 1 bit. El espacio es un espejo optimizado para GPUs Intel creado por el usuario jianhui42, a partir del proyecto original webml-community/bonsai-webgpu-kernels. El modelo subyacente procede de Prism ML (prism-ml/Bonsai-27B-gguf).

El problema que resuelve es el de la inferencia de un modelo de gran tamaño en hardware de consumo sin servidor: gracias a los pesos de 1 bit, la descarga de datos del modelo se reduce a aproximadamente 3,8 GB y toda la inferencia ocurre en la GPU local a través de WebGPU, de modo que los prompts y las respuestas no salen del dispositivo del usuario.

Su relevancia actual radica en la combinación de cuantización extrema (1 bit) con un kernel de matmul específico (LUT4) y una ruta completa en fp16, que acercan la ejecución de un modelo de 27B al navegador. Los datos de contexto, idiomas y licencia no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal (recurrent state) y pesos empaquetados de 1 bit; no se detalla la arquitectura completa |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos Q1 de 1 bit empaquetados; activaciones, tensores intermedios y KV cache en fp16; reducciones sensibles y algunos buffers de estado en fp32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (modelo base prism-ml/Bonsai-27B-gguf); el espacio sirve los pesos empaquetados de 1 bit con kernels WebGPU |
| Descarga de datos | ~3,8 GB |
| Runtime | WebGPU en navegador (aplicacion estatica) |
| Optimizacion objetivo | GPUs Intel |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO). Lo que si se documenta es la arquitectura de inferencia: un modelo de 27B con pesos de 1 bit empaquetados y estado recurrente de atencion lineal, ejecutado con prefill y decode en fp16 sobre GPUs que soportan `shader-f16`. Los pesos Q1 permanecen empaquetados a 1 bit, y el KV cache se almacena en fp16 cuando es posible.

La innovacion tecnica destacada es el kernel de prefill "tiled symmetric LUT4". Cada workgroup usa 512 hilos para calcular un tile de salida de 32 x 512, compartiendo entradas de tabla de consulta (LUT) vectorial entre cuatro filas de prompt. Las features de entrada se procesan en lotes de 64 para reutilizar el almacenamiento del workgroup. Ademas, el kernel explota la simetria de la LUT para mascaras de 4 bits: dado que L(15-b) = -L(b), solo se almacenan las mascaras 0-7 y las 8-15 se reconstruyen por negacion, reduciendo a la mitad el almacenamiento de la LUT tanto en fp16 como en fp32. Los dispositivos o formas no soportadas recurren a otros kernels de matmul.

## Capacidades

- Generacion de texto en local dentro del navegador, sin enviar datos a un servidor.
- Inferencia acelerada por GPU mediante WebGPU, con pipeline fp16 para prefill y decode.
- Ejecucion de un modelo de 27B con una huella de descarga de ~3,8 GB gracias a los pesos de 1 bit.
- Soporte de atencion lineal con estado recurrente.
- Capacidades de tool calling, agentes, vision, audio, thinking mode o multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia privada en el navegador: un desarrollador puede cargar el modelo en una pagina web y ejecutar generacion de texto sin que los prompts abandonen el equipo, adecuado para datos sensibles.
- Demostraciones interactivas en web: equipos que quieran mostrar un LLM de 27B en una demo publica sin costes de servidor, sirviendo la aplicacion estatica desde Hugging Face Spaces.
- Prototipado en hardware de consumo: probar flujos de generacion de texto sobre una GPU local (especialmente Intel) sin aprovisionar infraestructura en la nube.
- Evaluacion de cuantizacion a 1 bit: investigadores que quieran medir la calidad real de un modelo de 27B con pesos Q1 frente a sus equivalentes en fp16 o int4.
- Experimentacion con kernels WebGPU: el codigo del kernel LUT4 y la ruta fp16 sirven como referencia para desarrolladores que implementen matmuls de pesos de 1 bit en WebGPU.
- Aplicaciones offline o en el borde: escenarios con conectividad limitada donde la descarga unica de ~3,8 GB y la ejecucion local son preferibles a una API remota.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; la descarga de datos del modelo es de ~3,8 GB, por lo que la huella de pesos es de ese orden, a la que hay que sumar activaciones, tensores intermedios y KV cache en fp16.
- GPU recomendadas: el espacio esta optimizado para GPUs Intel, con rendimiento dependiente de la GPU, el driver y el navegador. No se enumeran modelos concretos.
- Compatibilidad con GPU de consumo: el objetivo del proyecto es precisamente la ejecucion en GPUs locales, pero no se especifica una lista de tarjetas compatibles.
- Requisito de shader-f16: el pipeline fp16 completo requiere una GPU que soporte `shader-f16`; en caso contrario, el kernel recurre a rutas alternativas.
- Opciones de despliegue: navegador con WebGPU (aplicacion estatica). No se documentan vLLM, llama.cpp, Ollama ni TGI para este espacio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion.

## Limitaciones y advertencias

- La cuantizacion a 1 bit puede degradar la calidad del texto generado frente a pesos en fp16 o precisiones mayores; no se aportan datos de evaluacion que cuantifiquen esa perdida.
- El rendimiento depende fuertemente de la GPU, el driver y el navegador; el proyecto esta optimizado para GPUs Intel y puede comportarse peor en otras marcas.
- Requiere soporte de `shader-f16` para la ruta fp16; los dispositivos sin este soporte usan kernels alternativos con rendimiento potencialmente inferior.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido.
- Idiomas soportados no disponibles.
- Longitud de contexto no disponible, lo que impide planificar tareas que dependan de ventanas largas.
- Este repositorio es un espejo de terceros (jianhui42) del trabajo original de webml-community y de Prism ML; conviene verificar el repositorio de origen para licencia, atribucion y actualizaciones.
- Riesgo de alucinacion inherente a los modelos de lenguaje: no hay evaluacion publicada en la informacion disponible.

## Enlaces

- Espacio en Hugging Face: https://huggingface.co/jianhui42/Bonsai-27B-1bit-WebGPU
- Modelo base (pesos GGUF): https://huggingface.co/prism-ml/Bonsai-27B-gguf
- Proyecto original del espacio: https://huggingface.co/spaces/webml-community/bonsai-webgpu-kernels/tree/main
- Prism ML: https://huggingface.co/prism-ml
