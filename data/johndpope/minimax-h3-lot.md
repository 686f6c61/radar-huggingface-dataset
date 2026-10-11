# johndpope/MiniMax-H3-LoT

## Resumen

MiniMax-H3-LoT es un conjunto de adaptadores de investigación publicados por el usuario johndpope sobre el modelo base MiniMaxAI/MiniMax-H3, un modelo de generación de vídeo. Los adaptadores permiten ejecutar el DiT (Diffusion Transformer) de MiniMax-H3 sobre una disposición Level-of-Token (LoT): en lugar de procesar todos los tokens a resolución completa, se agrupan en tokens más grandes y menos numerosos en las regiones con poco detalle, y después se recupera la velocidad (velocity) a resolución completa siguiendo el método descrito por Nakayama et al. (arXiv 2610.05816). El objetivo es reducir el coste computacional de la inferencia manteniendo el decodificador VAE sin cambios.

El repositorio contiene dos carpetas de checkpoints (`run3_iso3d_distill/` y `run4_nikki_distill/`), cada una con un `adapter.safetensors` (cabezas LoT más un banco de extensión ajustado), un `lora.safetensors` (LoRA de rango 16 sobre el DiT FL2VA), un `train_log.jsonl` y su propia tarjeta. En una tarjeta de 24 GB, un forward del DiT de 37 fotogramas a 768x1344 mide 51,9 s en modo denso frente a 19,6 s en modo LoT, una aceleración de 2,64x. El tamaño del repo es de 0,7 GB.

Se trata de checkpoints en estado de investigación, no de un modelo terminado: el propio autor advierte que las regiones de bajo detalle del LoT siguen siendo más suaves que el MiniMax H3 denso, que las caras en planos de talking-head se distorsionan y que la LoRA puede deformar cuerpos incluso con LoT desactivado. La licencia derivada del modelo base excluye su uso en la Unión Europea, Reino Unido, República de Corea y Estados Unidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) del modelo base MiniMax-H3 con adaptadores Level-of-Token (cabezas LoT + banco de extension) y LoRA de rango 16 sobre el DiT FL2VA |
| Parametros totales | no disponible (tamano del repo de adaptadores: 0,7 GB; no aplica al modelo base) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (DiT FL2VA ConvRot, indicado como el usado en el entrenamiento de los adaptadores) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (licencia "other"; sujeta al MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors (`adapter.safetensors`, `lora.safetensors`); log de entrenamiento en JSONL |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 es un generador de vídeo cuya columna vertebral es un DiT. Este repositorio no reentrena el modelo base, sino que añade adaptadores que reorganizan el cálculo de atención/velocidad sobre una disposición Level-of-Token: se usan menos tokens y de mayor tamaño donde el detalle es bajo, y luego se recupera la velocidad a resolución completa. La innovación descrita se atribuye al trabajo de Nakayama et al. (arXiv 2610.05816). El decodificador VAE no se modifica.

En cuanto a los datos de entrenamiento, `run3_iso3d_distill/` comprende tres ejecuciones de 2.000 pasos cada una, terminadas con destilación del profesor, sobre 777 imágenes fijas isométricas en 3D. `run4_nikki_distill/` añade 1.500 pasos sobre la ejecución 3, también con destilación, sobre 516 clips de talking-head y pose de "Nikki" más las imágenes fijas anteriores. Cada carpeta incluye un adaptador LoT, una LoRA de rango 16 y un registro de entrenamiento. La model card advierte que los resultados son preliminares y solicita colaboración para continuar el entrenamiento.

## Capacidades

- Generacion de video mediante el DiT de MiniMax-H3, con los adaptadores LoT aplicados a la ruta de inferencia.
- Aceleracion de la inferencia del DiT: 2,64x medida en un forward de 37 fotogramas a 768x1344 en una tarjeta de 24 GB (51,9 s denso frente a 19,6 s LoT).
- Interoperabilidad con ComfyUI mediante los nodos "MiniMax H3 LoT Apply" y "MiniMax H3 LoT Unscale Latent" del repositorio ComfyUI-MiniMax-H3-Image-Lane, con un flujo A/B de LoT frente a denso a partir de un mismo prompt.
- Entrenamiento adicional de LoT a partir de videos mp4 propios del usuario, segun la documentacion del repositorio de scripts.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue en la informacion disponible.

## Casos de uso

- Investigacion sobre eficiencia en difusion: reproducir y evaluar el metodo Level-of-Token de arXiv 2610.05816 sobre el DiT de MiniMax-H3, comparando tiempos de forward denso frente a LoT.
- Generacion de video en hardware de gama consumer: la aceleracion de 2,64x permite ejecutar forwards de 37 fotogramas a 768x1344 en una tarjeta de 24 GB, acercando la generacion de video a equipos de una sola GPU.
- Prototipado de flujos de video en ComfyUI: usar los nodos LoT Apply y LoT Unscale Latent para montar comparativas A/B denso frente a LoT desde un mismo prompt dentro del editor de nodos.
- Fine-tuning con datos propios: la documentacion permite entrenar LoT desde videos mp4 propios, util para equipos que quieran adaptar el comportamiento a un dominio concreto.
- Evaluacion de calidad y artefactos: dado que el autor reporta suavizado de regiones y distorsion de caras, el repositorio sirve para estudiar cuales son las condiciones en las que el LoT degrada mas la salida frente al modelo denso.
- Analisis de destilacion de profesor: los checkpoints incluyen ejecuciones terminadas con destilacion docente, lo que permite estudiar el efecto de este paso sobre adaptadores LoT y LoRA de rango 16.
- Docencia y divulgacion tecnica: los logs de entrenamiento y las curvas de evaluacion permiten ilustrar el proceso de entrenamiento de adaptadores sobre modelos de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como FVD, CLIP-score o metricas equivalentes para video) en la informacion disponible. El unico dato cuantitativo aportado es una medicion de tiempo de inferencia:

| Medicion | Modo denso | Modo LoT | Aceleracion |
|---|---|---|---|
| Forward del DiT, 37 fotogramas, 768x1344, 24 GB | 51,9 s | 19,6 s | 2,64x |

El decodificador VAE no se ve afectado por el adaptador. No se aportan datos de MMLU, HumanEval, GSM8K ni de otras suites, por no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: los adaptadores se probaron en una tarjeta de 24 GB, suficiente para un forward del DiT de 37 fotogramas a 768x1344.
- GPU recomendadas: no se detallan modelos concretos en la informacion disponible; por capacidad, una GPU de 24 GB (por ejemplo, RTX 4090 o clase A100/4090) encaja con la medicion reportada. Confirmar compatibilidad con el modelo base MiniMax-H3.
- Cabe en GPU consumer: si, segun la medicion aportada, en una tarjeta de 24 GB.
- Opciones de despliegue: ComfyUI mediante el repositorio ComfyUI-MiniMax-H3-Image-Lane y sus nodos especificos; ademas, scripts de entrenamiento e inferencia en el repositorio johndpope/MiniMax-H3 (carpeta scripts/lot). No se documentan vLLM, llama.cpp, Ollama ni TGI para este caso.
- Latencia y throughput: 51,9 s denso frente a 19,6 s LoT para el forward indicado; el VAE decode queda sin cambios y no se cuantifica por separado.

## Comparativa con modelos similares

La informacion disponible permite comparar el modo LoT con el modo denso del propio modelo base. No se aportan datos de otros adaptadores o modelos de video equivalentes.

| Alternativa | Relacion | Tiempo de forward (37 fotogramas, 768x1344) | Licencia |
|---|---|---|---|
| MiniMax-H3 denso (base) | Sin adaptadores LoT | 51,9 s | minimax-h3-community-license |
| MiniMax-H3-LoT (este repo) | Cabezas LoT + LoRA rango 16 | 19,6 s | minimax-h3-community-license |

No disponible la comparacion con otros modelos de generacion de video de la misma categoria, por ausencia de datos en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de investigacion: el autor indica explicitamente que estos checkpoints "necesitan mas entrenamiento" y los describe como no terminados.
- Calidad visual: las regiones de bajo detalle son mas suaves que en el MiniMax H3 denso y las caras en planos de talking-head se distorsionan.
- Efecto lateral de la LoRA: segun la model card, la LoRA puede deformar cuerpos incluso con LoT desactivado.
- Territorios excluidos: la licencia MiniMax H3 Community License solo permite uso y redistribucion fuera de la Union Europea, el Reino Unido, la Republica de Corea y los Estados Unidos de America. No descargar ni usar en esos territorios.
- Uso comercial: por encima de 20 millones de dolares de facturacion anual se requiere autorizacion escrita de MiniMax.
- Politica de uso aceptable: prohibe la suplantacion de identidad sin consentimiento y obliga a declarar la salida generada por maquina como tal.
- Datos de entrenamiento sensibles: la ejecucion 4 incluye clips de "Nikki", cuyo rostro de referencia proviene de una generacion de Grok Imagine segun las notas del dataset; no deben usarse estos pesos para suplantar a nadie.
- Encaje en produccion: dado el estado de investigacion y las restricciones territoriales, no es aconsejable su uso en produccion sin una reevaluacion de calidad y de licencia.
- Idiomas y contexto: no se documentan idiomas soportados ni ventana de contexto, por lo que no puede evaluarse su comportamiento multilingue ni con entradas largas a partir de esta informacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/johndpope/MiniMax-H3-LoT
- Licencia: https://huggingface.co/johndpope/MiniMax-H3-LoT/blob/main/LICENSE
- Aviso legal: https://huggingface.co/johndpope/MiniMax-H3-LoT/blob/main/NOTICE
- Paper Level-of-Token (Nakayama et al.): https://arxiv.org/abs/2610.05816
- Discusion y colaboracion: https://github.com/shootthesound/Fizgig/discussions/183
- Cheatsheet de entrenamiento LoT: https://github.com/johndpope/MiniMax-H3/blob/main/scripts/lot/CHEATSHEET.md
- Entrenamiento desde mp4 propios: https://github.com/johndpope/MiniMax-H3/blob/main/scripts/lot/README.md#training-h3-for-lot-from-your-own-mp4s
- Resultados y renders (issue 1): https://github.com/johndpope/MiniMax-H3/issues/1
- Scripts LoT: https://github.com/johndpope/MiniMax-H3/tree/main/scripts/lot
- Nodos ComfyUI: https://github.com/johndpope/ComfyUI-MiniMax-H3-Image-Lane
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
