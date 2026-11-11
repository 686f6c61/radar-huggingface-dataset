# darkmaniac7/TokForge-Bonsai-Image-4B-GGUF

## Resumen

TokForge-Bonsai-Image-4B-GGUF es un paquete de inferencia para generacion de imagenes en dispositivo (on-device), publicado por TokForge (darkmaniac7) a partir del modelo Bonsai Image 4B de Prism ML, que a su vez se construye sobre FLUX.2 [klein] 4B de Black Forest Labs. El repositorio no entrena un modelo nuevo: convierte el diffusion transformer de Bonsai a formato GGUF TQ2G128 para stable-diffusion.cpp, lo empaqueta con un text encoder Qwen3-4B en GGUF Q4_K_M y el VAE de FLUX.2 Klein, y lo distribuye como un bundle listo para ejecutarse en moviles Android con GPU Qualcomm Adreno mediante OpenCL.

El modelo resuelve un problema concreto: llevar generacion texto-a-imagen de 512x512 a telefonos de gama alta con 12-16 GB de RAM o mas, sin depender de la nube. El transformer de difusion ocupa solo 1,37 GB gracias a una cuantizacion ternaria de 2 bits (TQ2G128), mientras que el text encoder Qwen3-4B Q4_K_M aporta 2,50 GB y el VAE 168 MB, sumando 4,03 GB en 8 archivos.

Es relevante ahora porque ejemplifica la maduracion de las rutas de inferencia local en movil: stable-diffusion.cpp con OpenCL sobre Adreno, recetas de baja guia (CFG 1.0, flow shift 3.0) y generacion en 2 pasos. La licencia Apache-2.0 cubre Bonsai Image, FLUX.2 Klein y Qwen3-4B, lo que facilita su reutilizacion comercial con las atribuciones indicadas en `NOTICE.md`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (Bonsai Image 4B, basado en FLUX.2 [klein] 4B) + text encoder Qwen3-4B + VAE FLUX.2 Klein |
| Parametros totales | 3.875.544.576 (dato real del modelo base en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; la longitud de prompt no se especifica) |
| Tipos de cuantizacion | TQ2G128 (transformer ternario de 2 bits), Q4_K_M (text encoder) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (Bonsai Image, FLUX.2 [klein] 4B y Qwen3-4B) |
| Formato de pesos | GGUF (transformer y text encoder) + safetensors (VAE) |

## Arquitectura y entrenamiento

El bundle combina tres componentes. El diffusion transformer es una conversion a GGUF TQ2G128 del modelo `prism-ml/bonsai-image-ternary-4B-gemlite-2bit`, realizada via `prism-ml/bonsai-image-ternary-4B-unpacked` con stable-diffusion.cpp. La cuantizacion ternaria de 2 bits con grupo de 128 (TQ2G128) reduce el transformer a 1,37 GB, lo que hace viable su carga en memoria de telefono. El text encoder es Qwen3-4B en GGUF Q4_K_M, tomado byte a byte de `Qwen/Qwen3-4B-GGUF` sin modificaciones. El VAE es el de FLUX.2 [klein] 4B, tambien sin cambios y renombrado a `flux2-vae.safetensors` para el descubrimiento del bundle.

No se detallan en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) ni innovaciones de entrenamiento del modelo base. La receta de inferencia publicada es la tipica de FLUX.2 Klein/Bonsai con baja guia: sampler Euler, scheduler simple/FlowMatch, CFG 1.0, distilled guidance 1.0, flow shift 3.0, lienzo por defecto de 512x512 y 2 pasos en Adreno OpenCL. El autor advierte que aumentar pasos no mejora automaticamente y que 1 paso produce salida demasiado borrosa para la ruta Quality Beta.

## Capacidades

- Generacion de imagenes texto-a-imagen en 512x512 con prompts en ingles.
- Ejecucion on-device en Android mediante stable-diffusion.cpp y OpenCL sobre GPU Qualcomm Adreno.
- Generacion en 2 pasos (o 2-3 en equipos de 12-16 GB) con CFG 1.0 y flow shift 3.0.
- Rutas de ejecucion diferenciadas: Quality Beta (512x512, OpenCL, Adreno de 12 GB o mas), Preview (sub-512, CPU, Tensor, Exynos, Mali, Xclipse) y Lab (rutas OpenCL/servidor con opt-in explicito).
- Integracion en la app TokForge: el usuario pide una imagen en el chat y la app descarga y recarga el modelo de chat cuando hay poca memoria.
- Soporte de prompts variados segun la hoja de contactos de muestra: coche, arbol, restaurante, playa, casa y persona.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking.

## Casos de uso

- Generacion de imagenes offline en movil: un usuario de Android con Adreno y 12 GB o mas puede producir imagenes de 512x512 sin conexion, usando el bundle cargado por stable-diffusion.cpp; adecuado para entornos sin red o con privacidad estricta.
- Prototipado rapido de conceptos visuales: con 2 pasos y CFG 1.0, el modelo entrega bocetos coherentes de coches, paisajes o interiores en segundos, utiles para iterar ideas antes de pasar a un modelo mayor en servidor.
- Demos y pruebas de inferencia local: sirve para validar pipelines de stable-diffusion.cpp con OpenCL en Adreno, comprobando memoria, latencia y calidad de salida en dispositivos concretos.
- Aplicaciones de chat multimodal ligera: integrado en TokForge, el modelo permite pedir una imagen dentro de una conversacion, con gestion automatica de carga y descarga de modelos segun la RAM disponible.
- Educacion y talleres sobre IA on-device: el bundle, con manifest, hashes SHA-256 y script de subida, es un ejemplo reproducible de empaquetado de un pipeline texto-a-imagen completo para movil.
- Investigacion sobre cuantizacion ternaria: permite evaluar en hardware real el impacto de TQ2G128 en calidad de imagen frente a precisiones mayores, usando la hoja de contactos de muestra como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el bundle completo ocupa 4,03 GB en disco; se recomienda Adreno con 12 GB de RAM o mas para la ruta Quality Beta, y 16 GB o mas para la ruta Quality Beta de calidad superior.
- GPU recomendadas: Qualcomm Adreno con soporte OpenCL (clase 16-24 GB para Quality Beta/Lab; 12-16 GB tras prueba en dispositivo). En CPU, Tensor, Exynos, Mali o Xclipse solo hay ruta Preview (sub-512 o CPU).
- Cabe en GPU de consumo de escritorio: no se documenta; el bundle esta pensado para movil, aunque stable-diffusion.cpp podria ejecutarlo en otros entornos no validados.
- Opciones de despliegue: stable-diffusion.cpp con OpenCL; la app TokForge (Google Play y TestFlight) como cliente. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline.
- Latencia y throughput: no disponibles. La generacion es de 2 pasos en Adreno OpenCL, pero no se publican tiempos por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| TokForge-Bonsai-Image-4B-GGUF | 3.875.544.576 (transformer 4B + encoder Qwen3-4B) | no disponible | GGUF + safetensors | Apache-2.0 | Texto-a-imagen on-device en Android/Adreno |
| prism-ml/bonsai-image-ternary-4B-gemlite-2bit (base) | 3.875.544.576 | no disponible | safetensors ternario 2 bits | no disponible en la informacion | Modelo base sin empaquetado movil |
| FLUX.2 [klein] 4B (origen del transformer y VAE) | no disponible | no disponible | no disponible | Apache-2.0 (segun NOTICE) | Generacion de imagenes de referencia |
| Qwen3-4B (text encoder) | 4B | no disponible | GGUF Q4_K_M | Apache-2.0 | Codificador de texto del pipeline |

## Limitaciones y advertencias

- Solo soporta ingles; los prompts en otros idiomas no estan cubiertos.
- Es un bundle en beta guardada: no es un valor por defecto universal para cualquier Android. Los dispositivos sin Adreno (CPU, Tensor, Exynos, Mali, Xclipse) quedan en ruta Preview con salida sub-512 o potencialmente borrosa.
- La resolucion por defecto es 512x512; no se documenta soporte de resoluciones mayores en Quality Beta.
- 1 paso produce salida demasiado borrosa; se requieren 2 pasos (o 2-3 en equipos de 12-16 GB) y mas pasos no garantizan mejor calidad.
- Las versiones actuales de TokForge ya no ofrecen este bundle en el catalogo de modelos, por lo que no se puede descargar desde la app; solo sigue funcionando una copia ya instalada.
- Riesgo de alucinacion visual y de artefactos (imagenes planas, corruptas o deformadas) inherente a la cuantizacion ternaria de 2 bits y a la generacion en pocos pasos.
- No se documentan sesgos conocidos del modelo base en la informacion disponible.
- La licencia Apache-2.0 exige mantener las atribuciones a Prism ML, Black Forest Labs y Alibaba Cloud indicadas en `NOTICE.md`.
- No se detallan requisitos de memoria exactos por ruta ni limites de longitud de prompt.

## Enlaces

- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-Bonsai-Image-4B-GGUF
- Modelo base: https://huggingface.co/prism-ml/bonsai-image-ternary-4B-gemlite-2bit
- Version desempaquetada del base: https://huggingface.co/prism-ml/bonsai-image-ternary-4B-unpacked
- FLUX.2 Klein (Black Forest Labs): https://huggingface.co/black-forest-labs
- Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Qwen3-4B-GGUF: https://huggingface.co/Qwen/Qwen3-4B-GGUF
- Prism ML: https://huggingface.co/prism-ml
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Coleccion TokForge GGUF Models: https://huggingface.co/collections/darkmaniac7/tokforge-gguf-models-6af3fdd830c420213916bda1
- Coleccion TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
