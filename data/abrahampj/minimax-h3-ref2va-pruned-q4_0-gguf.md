# AbrahamPJ/minimax-h3-ref2va-pruned-q4_0-gguf

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un artefacto de inferencia derivado de MiniMax-H3, el sistema generativo multimodal de MiniMax. En concreto, se trata del denoiser de la variante Ref2VA (reference-to-video con audio), es decir, el componente que transforma ruido en un clip de vídeo con sonido manteniendo el sujeto de una imagen de referencia en una escena nueva. El autor, AbrahamPJ, lo publica como GGUF cuantizado a Q4_0 para la ruta de NPU Hexagon de Nightmare Mobile, una aplicación Android de generación de imagen y vídeo en dispositivo.

El archivo es una modificación, no un lanzamiento upstream: parte del GGUF Ref2VA podado en Q4_K_M de Abiray y lo recuantiza a Q4_0 porque los kernels de la NPU solo ejecutan ese formato. Los tensores que no eran K-quants (F32, F16) se mantienen intactos. El resultado pesa 11.564.180.576 bytes (unos 11,56 GB) y está pensado para ejecutarse con cuatro pasos Euler, CFG 1 y el LoRA turbo de Comfy-Org, junto con los VAE de vídeo y audio de H3.

Su relevancia es acotada pero clara: demuestra que un denoiser de vídeo de gran tamaño puede reducirse a un formato cuantizado y desplegarse en hardware móvil con aceleración NPU, sustituyendo además el codificador de texto de 32B de H3 por Qwen3-VL-4B con la proyección ClipProj. No hay información pública sobre parámetros totales, arquitectura interna ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (denoiser de difusión de MiniMax-H3, variante Ref2VA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (recuantizado desde Q4_K_M podado de Abiray) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (MiniMax H3 Community License Agreement) |
| Formato de pesos | GGUF |
| Tamano del archivo | 11.564.180.576 bytes (~11,56 GB) |
| SHA256 | a8c9f8009b9b354d2a181b31a44c79b630aa45c41df0fa9eb292bd5a136d9d26 |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Libreria | minimax-h3 |
| Codificador de texto en la app | Qwen3-VL-4B con proyeccion ClipProj-MiniMax-H3 |
| Pasos de muestreo recomendados | 4 (Euler), CFG 1 |
| LoRA recomendado | minimax_h3_ref2v_turbo_4step_v0.1 (Comfy-Org) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del denoiser (tipo de transformer, numero de bloques, atencion, etc.) ni sobre el dataset de entrenamiento, el numero de tokens o si hubo fases de RLHF o DPO. Lo unico documentado es que forma parte de MiniMax-H3, que el autor describe como el denoiser reference-to-video de H3, y que trabaja junto con los VAE de video y audio del modelo base para producir un clip con sonido que conserva el sujeto de una imagen de referencia.

La innovacion tecnica de este artefacto es de despliegue, no de entrenamiento: el recuantizado a Q4_0 para que los kernels de la NPU Hexagon puedan ejecutarlo, la poda previa realizada por Abiray y la sustitucion del codificador de texto de 32B de H3 por Qwen3-VL-4B con la proyeccion ClipProj. La torre de vision de Qwen3-VL-4B lee la imagen de referencia, que en el prompt estructurado de H3 se nombra como "Picture 1". El flujo de inferencia recomendado usa cuatro pasos Euler con CFG 1 y el LoRA turbo de cuatro pasos de Comfy-Org.

## Capacidades

- Generacion de video de referencia a video (reference-to-video): produce un clip nuevo manteniendo el sujeto de una imagen de referencia en una escena distinta.
- Generacion de audio sincronizado: el pipeline incluye los VAE de audio de H3, por lo que el clip resultante incorpora sonido.
- Comprension de la imagen de referencia mediante la torre de vision de Qwen3-VL-4B, integrada a traves de la proyeccion ClipProj.
- Inferencia en dispositivo (Android) sobre la NPU Hexagon mediante la aplicacion Nightmare Mobile.
- Muestreo acelerado con LoRA turbo de cuatro pasos y CFG 1.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue de texto.

## Casos de uso

- Prototipado de video generativo en Android: la aplicacion Nightmare Mobile puede ejecutar el denoiser en la NPU Hexagon de un telefono, lo que permite probar flujos reference-to-video sin depender de una GPU de escritorio.
- Conservacion de personaje en clips cortos: al aceptar una imagen de referencia nombrada como "Picture 1" en el prompt estructurado, el modelo sirve para generar variaciones de escena de un mismo sujeto, util en previsualizacion de storyboards.
- Generacion de clips con audio para redes sociales: la inclusion de los VAE de video y audio permite obtener una pieza audiovisual completa en una sola pasada, adecuada para contenido promocional de baja resolucion.
- Evaluacion de cuantizacion en hardware movil: el artefacto es un banco de pruebas para medir el impacto de Q4_0 frente a Q4_K_M en calidad visual y velocidad sobre kernels NPU.
- Integracion en pipelines de ComfyUI: al seguir el flujo recomendado con el LoRA turbo de Comfy-Org, puede insertarse en grafos de generacion de video existentes para tareas de referencia a video.
- Investigacion sobre sustitucion de codificadores de texto: el uso de Qwen3-VL-4B con ClipProj en lugar del codificador de 32B de H3 permite estudiar el compromiso entre calidad y requisitos de memoria en modelos multimodales grandes.
- Demostraciones offline en dispositivos sin conectividad: al ejecutarse en el propio telefono, encaja en escenarios de generacion local donde no se puede enviar contenido a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo GGUF ocupa unos 11,56 GB, por lo que se necesita al menos esa cantidad de memoria para los pesos, mas la memoria de activaciones y de los VAE de video y audio.
- Aceleracion objetivo: NPU Hexagon de Qualcomm, a traves de la aplicacion Nightmare Mobile para Android.
- GPU de escritorio: no se documentan requisitos para A100, H100 o RTX 4090; el artefacto esta orientado a movil.
- Compatibilidad con GPU de consumo: no confirmada; el formato Q4_0 es compatible con llama.cpp, pero este denoiser no es un modelo de lenguaje y no se garantiza su ejecucion en dichos runners.
- Opciones de despliegue: Nightmare Mobile (ruta NPU Hexagon) y, potencialmente, herramientas GGUF genericas si soportan la arquitectura de H3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AbrahamPJ/minimax-h3-ref2va-pruned-q4_0-gguf | no disponible | no disponible | GGUF Q4_0 | minimax-h3-community | Recuantizado para NPU Hexagon, ~11,56 GB |
| Abiray/MiniMax-H3-Pruned-GGUF | no disponible | no disponible | GGUF Q4_K_M | minimax-h3-community | Version podada de origen, previa al recuantizado |
| MiniMaxAI/MiniMax-H3 | no disponible | no disponible | no disponible | minimax-h3-community | Modelo base oficial de MiniMax |

No se dispone de datos de rendimiento ni de otros modelos comparables de referencia a video en formato GGUF para movil en la informacion proporcionada.

## Limitaciones y advertencias

- Es un archivo modificado, no un lanzamiento oficial; el autor no cuenta con el respaldo de MiniMax ni de Abiray.
- La licencia MiniMax H3 Community License Agreement esta limitada a su territorio aplicable; debe leerse antes de cualquier uso, incluido el comercial.
- El recuantizado a Q4_0 y la poda previa pueden degradar la calidad del video o del audio respecto al modelo base.
- El flujo esta calibrado para cuatro pasos Euler y CFG 1 con el LoRA turbo concreto; otros ajustes pueden no funcionar.
- Depende de componentes externos (Qwen3-VL-4B, ClipProj, VAE de H3, LoRA de Comfy-Org) cuyas licencias y disponibilidad son independientes.
- No hay informacion sobre sesgos, riesgo de alucinacion visual, idiomas soportados ni limites de duracion o resolucion del clip.
- El repositorio registra cero descargas y cero likes, por lo que no existe validacion comunitaria documentada.
- No se documentan requisitos minimos de hardware movil ni versiones de Android compatibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AbrahamPJ/minimax-h3-ref2va-pruned-q4_0-gguf
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- GGUF podado de origen: https://huggingface.co/Abiray/MiniMax-H3-Pruned-GGUF
- LoRA turbo de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Proyeccion ClipProj: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- Aplicacion Nightmare Mobile: https://github.com/AbrahamPaulJ/nightmare-mobile
