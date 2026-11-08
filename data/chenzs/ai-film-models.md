# chenzs/AI-Film-Models

## Resumen

AI-Film-Models es un repositorio agregador publicado por el usuario chenzs en Hugging Face que empaqueta, en un único espacio de 311,1 GB, doce submodelos independientes orientados a la producción audiovisual: generación y edición de imagen, generación y restauración de vídeo, síntesis de voz y generación musical. No es un modelo entrenado por el autor, sino una distribución de pesos de terceros (Qwen-Image, Wan, SeedVR2, IndexTTS, ACE-Step, RealVisXL, NoobAI-XL, entre otros) reorganizados en directorios por modalidad (`image/`, `video/`, `audio/`).

El paquete está etiquetado con la librería `diffusers` y pesos en `safetensors`, lo que sitúa la mayoría de sus componentes en el ecosistema de modelos de difusión. Su relevancia es práctica: evita al integrador rastrear una docena de repositorios dispersos y resuelve las dependencias cruzadas entre componentes (VAE, text encoders, vocoders), documentadas explícitamente en la model card.

No se dispone de información sobre parámetros, arquitecturas internas ni datos de entrenamiento de los submodelos en la documentación proporcionada; cada uno conserva su propia licencia y condiciones de uso, sin una licencia unificada para el conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregacion de submodelos de difusion (imagen/video) y modelos de audio (TTS y musica); arquitectura interna de cada submodelo no disponible |
| Parametros totales | no disponible (por submodelo: SeedVR2-7B = 7B, Wan2.2-S2V-14B = 14B, ACE-Step-1.5-XL-SFT-4B-LM = 4B; resto no disponible) |
| Parametros activos | no disponible (no se indica que ningun submodelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos incluidos son BF16/FP16 segun nombre de directorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible como conjunto; cada submodelo mantiene su licencia propia (ver README/LICENSE de cada subdirectorio y repositorio upstream) |
| Formato de pesos | safetensors (libreria declarada: diffusers) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura unica. Se compone de subpaquetes agrupados por modalidad. En `video/` figuran 10Eros-Max-H3-beta5-NonTurbo (40,22 GB), H3-Latent-Upscaler-3D-BF16 (0,69 GB), H3-Heretic-Encoder-BF16 (51,51 GB), SeedVR2-7B-FP16 (16,98 GB) y Wan2.2-S2V-14B (45,74 GB). En `image/` se incluyen Qwen-Image-2512-BF16-ComfyUI (57,70 GB), Qwen-Image-Edit-2511-BF16-ComfyUI (40,86 GB), RealVisXL-V5-FP16 (6,94 GB) y NoobAI-XL-1.1 (7,11 GB). En `audio/` aparecen IndexTTS-2.5-Complete (8,47 GB), VoxCPM2 (4,96 GB) y ACE-Step-1.5-XL-SFT-4B-LM (29,92 GB).

La model card documenta las dependencias entre componentes: Qwen-Image-Edit-2511 reutiliza el text encoder y el VAE del directorio Qwen-Image-2512; la familia H3 sigue empleando el VAE y componentes auxiliares del H3 original, que no se incluye en el paquete; IndexTTS-2.5 incorpora los pesos de w2v-bert, el encoder semantico, CAMPPlus y BigVGAN; y ACE-Step incluye XL-SFT, el LM de 4B, el text encoder y el VAE de audio. No se aportan datos sobre volumen de entrenamiento, composicion del dataset ni procesos de alineacion (RLHF/DPO) de ningun submodelo.

## Capacidades

- Generacion de imagen texto-a-imagen mediante Qwen-Image-2512, RealVisXL-V5 y NoobAI-XL-1.1.
- Edicion de imagen instruccional mediante Qwen-Image-Edit-2511, que reutiliza text encoder y VAE de Qwen-Image-2512.
- Generacion de video con 10Eros-Max-H3-beta5-NonTurbo y Wan2.2-S2V-14B (este ultimo orientado a speech-to-video segun su nomenclatura S2V).
- Reescalado latente 3D de video con H3-Latent-Upscaler-3D-BF16.
- Restauracion o superresolucion de video con SeedVR2-7B-FP16.
- Codificacion de texto para la familia H3 mediante H3-Heretic-Encoder-BF16.
- Sintesis de voz (TTS) con IndexTTS-2.5-Complete y VoxCPM2.
- Generacion musical con ACE-Step-1.5-XL-SFT-4B-LM.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio integrados en un unico modelo: no disponible; las capacidades estan repartidas entre submodelos especializados.

## Casos de uso

- Pipeline de cortometraje o videoclip: generar fotogramas clave con Qwen-Image-2512, editarlos con Qwen-Image-Edit-2511 y animarlos con 10Eros-Max-H3-beta5; el paquete evita resolver manualmente el emparejamiento de VAE y text encoder entre etapas.
- Postproduccion de video de bajo presupuesto: aplicar SeedVR2-7B-FP16 para restauracion o reescalado de metraje y H3-Latent-Upscaler-3D-BF16 para el reescalado latente 3D, reduciendo la necesidad de renderizado nativo en alta resolucion.
- Doblaje y locucion automatizada: IndexTTS-2.5-Complete aporta el stack completo (w2v-bert, encoder semantico, CAMPPlus, BigVGAN) en un solo directorio, lo que simplifica el despliegue de TTS con clonacion o control de estilo frente a montar cada componente por separado.
- Produccion musical para bandas sonoras: ACE-Step-1.5-XL-SFT-4B-LM incluye el LM de 4B, el text encoder y el VAE de audio, permitiendo generar temas completos a partir de descripciones textuales dentro del mismo flujo de trabajo.
- Prototipado rapido en ComfyUI: los submodelos Qwen-Image y Qwen-Image-Edit se distribuyen en variantes BF16 etiquetadas ComfyUI, lo que facilita su carga directa en grafos de nodos para experimentacion visual.
- Creacion de personajes y estilo ilustrado: NoobAI-XL-1.1 y RealVisXL-V5-FP16 cubren estilos anime/ilustracion y fotorrealismo respectivamente, utiles para generar assets consistentes en un proyecto de animacion.
- Archivo y replicacion de entorno: al fijar versiones concretas de pesos (por ejemplo, 10Eros-Max beta5), el paquete sirve como snapshot reproducible de un stack creativo completo para un equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; por tamano de pesos en BF16/FP16, cada submodelo requiere al menos su peso en VRAM mas overhead de activaciones. Referencias orientativas por tamano de fichero: RealVisXL-V5-FP16 y NoobAI-XL-1.1 (aproximadamente 7 GB) son los mas ligeros; SeedVR2-7B-FP16 (16,98 GB) y Wan2.2-S2V-14B (45,74 GB) exigen GPUs de gama alta o profesional.
- GPU recomendadas: no disponible en la documentacion. Por volumen de pesos, los submodelos de 40-57 GB (Qwen-Image, Qwen-Image-Edit, H3-Heretic-Encoder, Wan2.2-S2V-14B, 10Eros-Max) no caben en GPUs de consumo de 24 GB sin cuantizacion o descarga por etapas.
- Cabe en consumer GPU: parcialmente; los submodelos de aproximadamente 7 GB (RealVisXL-V5, NoobAI-XL-1.1) y posiblemente VoxCPM2 (4,96 GB) e IndexTTS-2.5 (8,47 GB) son candidatos en GPUs de 12-24 GB, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: la libreria declarada es `diffusers`; los submodelos de imagen Qwen se distribuyen en variantes ComfyUI. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-Film-Models (chenzs) | Agregado de 12 submodelos; 4B-14B en los identificados | no disponible | no disponible | Mixta por submodelo | Hugging Face, 311,1 GB, 0 descargas |
| Qwen-Image-2512 (upstream) | no disponible | no disponible | no disponible | Segun repositorio upstream | Hugging Face |
| Wan2.2-S2V-14B (upstream) | 14B | no disponible | no disponible | Segun repositorio upstream | Hugging Face |
| SeedVR2-7B (upstream) | 7B | no disponible | no disponible | Segun repositorio upstream | Hugging Face |

No se dispone de datos de rendimiento ni de comparativas cuantitativas en la informacion proporcionada; la comparativa se limita a tamano y procedencia.

## Limitaciones y advertencias

- El repositorio es un agregador, no un modelo entrenado por el autor; la calidad y el comportamiento dependen enteramente de los submodelos upstream.
- No existe una licencia unificada: cada submodelo mantiene su propia licencia y condiciones, por lo que el uso comercial requiere revisar individualmente cada subdirectorio y su repositorio de origen.
- 10Eros-Max se distribuye como version beta5 de prueba, con la inestabilidad que ello implica para produccion.
- El paquete no incluye el H3 original; la familia H3 depende de un VAE y componentes externos que deben obtenerse por separado.
- El tamano total de 311,1 GB complica el almacenamiento, la transferencia y la replicacion en entornos con ancho de banda limitado.
- No hay informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni limitaciones de contexto de los submodelos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria documentada.
- No se especifican requisitos de hardware ni instrucciones de despliegue en la model card.

## Enlaces

- Repositorio principal: https://huggingface.co/chenzs/AI-Film-Models
- 10Eros-Max-H3-beta5-NonTurbo: https://huggingface.co/chenzs/10Eros-Max-H3-beta5-NonTurbo
- H3-Latent-Upscaler-3D-BF16: https://huggingface.co/chenzs/H3-Latent-Upscaler-3D-BF16
- H3-Heretic-Encoder-BF16: https://huggingface.co/chenzs/H3-Heretic-Encoder-BF16
- SeedVR2-7B-FP16: https://huggingface.co/chenzs/SeedVR2-7B-FP16
- Qwen-Image-2512-BF16-ComfyUI: https://huggingface.co/chenzs/Qwen-Image-2512-BF16-ComfyUI
- Qwen-Image-Edit-2511-BF16-ComfyUI: https://huggingface.co/chenzs/Qwen-Image-Edit-2511-BF16-ComfyUI
- RealVisXL-V5-FP16: https://huggingface.co/chenzs/RealVisXL-V5-FP16
- NoobAI-XL-1.1: https://huggingface.co/chenzs/NoobAI-XL-1.1
- IndexTTS-2.5-Complete: https://huggingface.co/chenzs/IndexTTS-2.5-Complete
- VoxCPM2: https://huggingface.co/chenzs/VoxCPM2
- Wan2.2-S2V-14B: https://huggingface.co/chenzs/Wan2.2-S2V-14B
- ACE-Step-1.5-XL-SFT-4B-LM: https://huggingface.co/chenzs/ACE-Step-1.5-XL-SFT-4B-LM
