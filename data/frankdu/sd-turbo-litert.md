# frankdu/SD-Turbo-LiteRT

## Resumen

SD-Turbo-LiteRT es una conversión del modelo de difusión stabilityai/sd-turbo al formato LiteRT (antiguo TensorFlow Lite) publicada por el usuario frankdu en Hugging Face. No se trata de un modelo nuevo: los pesos, la licencia y el comportamiento proceden del checkpoint original de Stability AI (revisión `b261bac6fd2cf515557d5d0707481eafa0485ec2`), y lo que aporta este repositorio es un grafo de ejecución portátil en float32 para las cuatro etapas del pipeline (codificador de texto CLIP, UNet de denoising, muestreador Euler ancestral y decodificador VAE), acompañado de un `manifest.json` con el plan de ejecución y los hashes de grafos, tokenizador y constantes.

El interés es de infraestructura más que de modelado: permite ejecutar generación texto-a-imagen de 512 × 512 píxeles en un único paso de muestreo sobre CPU, sin PyTorch ni CUDA, mediante LiteRT 2.3.0. El autor ha validado una generación completa en escritorio Linux x86_64 y advierte explícitamente de que la ejecución en Android (CPU o GPU) y en TPU de Google Tensor no se ha comprobado, así que el caso de uso realista hoy es el prototipado y la experimentación con runtimes de borde, no el despliegue en producción móvil.

El repositorio es experimental, con 0 descargas y 0 likes en el momento de la consulta, y su tamaño (5,0 GB) refleja pesos en float32 sin cuantizar. La licencia es la Stability AI Community License, que se mantiene intacta pese a la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (latent diffusion) con UNet, codificador de texto CLIP, muestreador Euler ancestral y VAE, exportada como grafos LiteRT independientes |
| Parametros totales | No disponible en la informacion proporcionada; el modelo base sd-turbo deriva de Stable Diffusion 2.1 (UNet de ~865 M de parametros, segun el recuento habitual del pipeline) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; el codificador CLIP del modelo base limita el prompt a 77 tokens |
| Tipos de cuantizacion | Solo grafos float32; el repositorio no incluye variantes int8 ni float16 |
| Idiomas soportados | No disponible (el prompt se procesa con el codificador CLIP del modelo base, predominantemente ingles) |
| Licencia | stability-ai-community (Stability AI Community License, fichero LICENSE.md); los scripts auxiliares usan CODE_LICENSE |
| Formato de pesos | Grafos LiteRT/TFLite float32 mas `manifest.json` con hashes; no es un checkpoint `.litertlm` de lenguaje |
| Resolucion de salida | 512 x 512 |
| Pasos de muestreo | 1 (fijado por el manifest) |
| Tamano del repositorio | 5,0 GB |
| Runtime validado | LiteRT 2.3.0, CPU, Linux x86_64 (comprobacion de humo) |

## Arquitectura y entrenamiento

El modelo subyacente es sd-turbo, una destilacion de Stable Diffusion 2.1 entrenada para generar imagenes en uno a cuatro pasos de muestreo. La arquitectura es la clasica de difusion latente: un autoencoder variacional que comprime la imagen a un espacio latente de menor dimension, una UNet que predice el ruido en ese espacio y un codificador de texto CLIP que condiciona la generacion. En esta conversion, cada una de esas piezas se ha exportado como un grafo LiteRT separado en float32, y el bucle de muestreo se resuelve con un muestreador Euler ancestral tambien exportado como grafo. La novedad tecnica no esta en el entrenamiento, sino en el formato: los grafos se cargan de uno en uno (streaming), el numero de pasos y el scheduler quedan fijados por el manifest y la E/S de tensores enteros se conserva para no romper la reproducibilidad de las semillas dentro de un mismo runtime.

No hay informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si la destilacion uso RLHF o DPO; esos detalles corresponden a la model card del modelo base. El autor tampoco publica un pipeline de conversion reproducible mas alla de la referencia a la revision exacta del checkpoint de origen, y aclara que las comprobaciones de paridad con SD/SDXL se hicieron con ruido PyTorch generado en tiempo de exportacion, mientras que la inferencia normal usa el flujo con semilla documentado por el runner. En consecuencia, la misma semilla entera puede producir imagenes distintas en runtimes distintos.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512 x 512 en un unico paso de muestreo.
- Condicionamiento por prompt de texto mediante el codificador CLIP exportado, con el limite de tokens heredado del modelo base.
- Reproducibilidad parcial: semilla entera documentada por el runner, valida dentro de un mismo runtime.
- Ejecucion en CPU sin dependencias de CUDA ni de PyTorch en tiempo de inferencia.
- Ejecucion por etapas con carga y liberacion secuencial de grafos, pensada para entornos con memoria limitada.
- Integracion con aplicaciones Android mediante LiteRT, con la advertencia de que debe ejecutarse fuera del hilo principal y compartiendo un unico `Environment`.
- No soporta, segun la documentacion disponible: tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking. Es un modelo puramente generativo de imagen.
- No se documentan capacidades de img2img, inpainting, control net ni prompt negativo.

## Casos de uso

- Prototipado de generacion de imagenes en escritorio sin GPU: el pipeline se ejecuta con Python 3.12 sobre LiteRT en CPU, lo que permite probar prompts en portatiles sin tarjeta grafica dedicada ni instalacion de CUDA.
- Evaluacion comparativa de runtimes de borde: al estar exportado como grafos LiteRT con hashes en el manifest, sirve para medir latencia y consumo de memoria frente a ONNX Runtime o Diffusers con los mismos pesos y la misma semilla.
- Base para integraciones Android experimentales: el autor indica que el pipeline esta pensado para reutilizarse en una aplicacion Android de investigacion, con la salvedad de que el rendimiento en telefono no esta validado y el consumo de memoria puede ser prohibitivo.
- Generacion de assets de baja fidelidad en pipelines internos: con 512 x 512 y un paso, es adecuado para producir bocetos o placeholders de interfaz en lotes, siempre que la calidad final no sea requisito.
- Investigacion sobre difusion destilada: permite estudiar el efecto de reducir a un solo paso de muestreo sobre la fidelidad al prompt sin montar el stack completo de PyTorch.
- Docencia y demostraciones: el script `run_portable.py` con argumentos de prompt, semilla y salida facilita explicar el funcionamiento de un pipeline de difusion latente etapa por etapa.
- Pruebas de reproducibilidad entre plataformas: util para ilustrar por que la misma semilla produce imagenes distintas segun el runtime, un problema relevante en auditoria de sistemas generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor describe la validacion como una "comprobacion de humo" (smoke check): una generacion completa en LiteRT 2.3.0 sobre CPU en Linux x86_64, con verificacion visual de que la imagen resultante era una manzana reconocible. No hay FID, CLIP score, ni medidas de latencia o throughput publicadas, y el propio autor indica que no se trata de un benchmark comparativo de calidad ni de velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar los pesos en float32 y sumar el repositorio 5,0 GB, se necesita espacio suficiente para el grafo activo mas los tensores intermedios; en GPU, reservar del orden de 6-8 GB para trabajar con holgura. Cifra estimada a partir del tamano del repositorio, no publicada por el autor.
- GPU recomendadas: no hay recomendaciones del autor. Por tamano, el pipeline es viable en RTX 3060/4060 de 12/8 GB, RTX 4090, A100 o H100, siempre que el runtime LiteRT utilizado soporte delegacion GPU; el autor no valida GPU en este repositorio.
- Ejecucion en CPU: es la unica ruta validada, y solo en Linux x86_64 de escritorio. No hay datos de rendimiento en Apple Silicon, ARM de servidor ni telefonos.
- Cabe en GPU de consumo: si, previsiblemente en cualquier tarjeta con 8 GB o mas en float32, aunque sin validacion publicada.
- Opciones de despliegue: LiteRT 2.3.0 con el runner incluido (`run_portable.py` y `requirements.txt`), Python 3.12 en entorno virtual, o integracion nativa en Android mediante LiteRT. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles. El autor advierte de que las cargas de grafo, la compilacion y las copias de tensores entre host y dispositivo pueden ser costosas, y que el exito en escritorio no implica un rendimiento aceptable en telefono.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion y pasos | Contexto de prompt | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| SD-Turbo-LiteRT (este repositorio) | No disponible; mismo pipeline que sd-turbo | 512 x 512, 1 paso | 77 tokens (CLIP del modelo base) | stability-ai-community | Grafos LiteRT float32, 5,0 GB; ejecucion validada solo en CPU de escritorio |
| stabilityai/sd-turbo (original) | ~865 M en la UNet (recuento habitual del pipeline SD 2.1) | 512 x 512, 1-4 pasos | 77 tokens | stability-ai-community | Safetensors y Diffusers; soporte amplio de GPU y ecosistema |
| stabilityai/sdxl-turbo | No disponible en esta ficha; arquitectura SDXL, notablemente mayor que sd-turbo | 512 x 512, 1-4 pasos | 77 tokens | stability-ai-community | Safetensors y Diffusers; requiere mas VRAM que sd-turbo |
| SD 2.1 con LCM-LoRA | Base SD 2.1 mas adaptador LoRA | 512 x 512, 4-8 pasos | 77 tokens | CreativeML Open RAIL++-M mas licencia del adaptador | Safetensors; permite reutilizar el checkpoint base |

La diferencia practica frente a las alternativas no esta en calidad ni en velocidad, sino en el formato: solo esta conversion ofrece grafos LiteRT listos para ejecutar sin PyTorch, a cambio de perder flexibilidad (pasos y scheduler fijados por el manifest) y de carecer de validacion en movil.

## Limitaciones y advertencias

- Modelo experimental: 0 descargas y 0 likes en el momento de la consulta, sin revisión por parte de la comunidad ni resultados reproducidos de forma independiente.
- Ejecucion en Android CPU/GPU, requisitos de memoria en telefono y ejecucion en TPU de Google Tensor no han sido validadas. El exito en escritorio no garantiza rendimiento movil.
- Solo se distribuyen grafos float32: no hay variantes cuantizadas, de modo que el consumo de memoria y almacenamiento es el maximo posible (5,0 GB de repositorio).
- El numero de pasos y el scheduler estan fijados por el manifest; no es un modelo configurable como el checkpoint original en Diffusers.
- Reproducibilidad limitada entre runtimes: la misma semilla entera puede dar imagenes distintas segun el motor de ejecucion, lo que complica la auditoria y las pruebas de regresion.
- No se documentan capacidades de img2img, inpainting, control net ni prompt negativo; asumir que solo hace texto-a-imagen en un paso.
- Fidelidad al prompt y renderizado de texto en imagen: heredadas de sd-turbo, un modelo destilado de un solo paso, con calidad inferior a modelos multi-paso o de mayor tamano. No hay metricas publicadas que lo cuantifiquen.
- Sesgos: los del dataset de entrenamiento de Stable Diffusion 2.1, no evaluados ni documentados en este repositorio.
- Licencia: Stability AI Community License, que impone condiciones de uso y de uso comercial (gratuita por debajo del umbral de ingresos anuales que fija Stability AI, con licencia empresarial por encima). La conversion no relicencia los pesos; hay que leer LICENSE.md y la model card del modelo base antes de cualquier despliegue comercial.
- Los scripts auxiliares tienen licencia distinta (CODE_LICENSE) de los pesos; conviene revisar ambas por separado.
- El autor recomienda acudir a las model cards originales para usos previstos, limitaciones y restricciones aplicables, lo que este repositorio no sustituye.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/frankdu/SD-Turbo-LiteRT
- Modelo base sd-turbo: https://huggingface.co/stabilityai/sd-turbo
- Revision exacta del checkpoint de origen: https://huggingface.co/stabilityai/sd-turbo/tree/b261bac6fd2cf515557d5d0707481eafa0485ec2
- Licencia Stability AI Community (LICENSE.md en el repositorio): https://huggingface.co/frankdu/SD-Turbo-LiteRT/blob/main/LICENSE.md
- Documentacion oficial de LiteRT: https://ai.google.dev/edge/litert
