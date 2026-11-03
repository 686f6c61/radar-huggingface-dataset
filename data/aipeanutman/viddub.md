# AIPeanutman/VidDub

## Resumen

VidDub es un modelo de doblaje de vídeo (video dubbing) con sincronización labial, desarrollado por el equipo de LAW1223 y publicado bajo el identificador AIPeanutman/VidDub en HuggingFace. El modelo toma como entrada un vídeo con un rostro detectable y una pista de audio objetivo, y genera un vídeo modificado en el que los movimientos de la boca y la parte inferior del rostro se ajustan al nuevo audio. Se presenta como el checkpoint "full-context two-step" asociado al artículo "VidDub: Replacement-Aware Distillation for Two-Step Video Dubbing" (arXiv:2611.03404).

Técnicamente, VidDub es un modelo de difusión para vídeo construido sobre el backbone Wan2.1-VACE-1.3B, con un adaptador de audio propio y un encoder Whisper-small para procesar la señal de voz. La innovación principal es la destilación en dos pasos (DMD), que reduce el número de pasos de muestreo a 2, frente a los múltiples pasos habituales en modelos de difusión de vídeo. El repositorio almacena los componentes entrenados (DiT, VACE y adaptador de audio) con un total de 2.440.958.285 parámetros, y depende de pesos base externos (VAE, T5 y Whisper) que no se duplican en el repo.

El modelo es relevante porque aborda una tarea de posproducción audiovisual concreta (doblaje y lip-sync) con un coste de inferencia reducido gracias a la destilación en dos pasos, y porque publica junto al modelo un benchmark específico (VidDub-Bench) y el código de entrenamiento e inferencia. Su licencia es restrictiva: permite uso individual comercial y académico no comercial, pero exige permiso escrito para uso empresarial, SaaS, APIs y servicios gestionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión para vídeo (DiT) sobre backbone Wan2.1-VACE-1.3B, con adaptador de audio y encoder Whisper-small |
| Parametros totales | 2.440.958.285 (componentes entrenados: DiT, VACE y adaptador de audio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; ventana de 81 frames a 24 FPS (protocolo de ventanas deslizantes con stride 64 y solapamiento de 17 frames) |
| Tipos de cuantizacion | no disponible; pesos publicados en BF16 (DiT y VACE) y FP32 (adaptador de audio) |
| Idiomas soportados | no disponible |
| Licencia | viddub-individual-commercial-research-1.0 (VidDub Individual Commercial and Research License 1.0) |
| Formato de pesos | safetensors (diffusion_pytorch_model.safetensors, model.safetensors) |

## Arquitectura y entrenamiento

VidDub se construye sobre Wan2.1-VACE-1.3B, un modelo de difusión para vídeo. El repositorio incluye un DiT en BF16, un módulo VACE en BF16 y un adaptador de audio específico de VidDub en FP32. La señal de audio se procesa con Whisper-small (resampleada a 16 kHz mono), mientras que el vídeo se maneja a 24 FPS. El modelo se entrena con una estrategia de destilación denominada "Replacement-Aware Distillation" y un esquema DMD (Distribution Matching Distillation) que fija el muestreo en 2 pasos, con un CFG de audio fijo en 1. El checkpoint publicado corresponde a la variante "full-context 2-step DMD" seleccionada por el artículo.

La inferencia opera con una ventana de 81 frames. Para vídeos de exactamente 81 frames se realiza una única llamada de contexto completo; para vídeos más largos se aplica un protocolo de ventanas solapadas con stride 64 y 17 frames compartidos, cada ventana con su propia semilla, mezcla lineal de solapamientos y armonización de color en la zona inferior del rostro (corrección Lab). El modelo base VAE, el tokenizer T5 y el checkpoint de Whisper no se incluyen en el repositorio y deben descargarse por separado. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Doblaje de vídeo completo: sustituye el audio original por una pista objetivo y regenera la zona de la boca y la parte inferior del rostro para sincronizarla con la nueva voz.
- Sincronización labial (lip-sync) guiada por audio, con armonización de color de la región inferior del rostro para integrar el resultado en el vídeo fuente.
- Procesamiento de vídeos largos mediante ventanas deslizantes de 81 frames con solapamiento y mezcla lineal.
- Generación en dos pasos de muestreo (DMD), lo que reduce el coste computacional frente a esquemas de difusión multi-paso.
- Entrada de audio flexible: la pista objetivo se remuestrea automáticamente a 16 kHz mono.
- Conservación de la resolución y el frame rate del vídeo de entrada en la salida.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio generation ni modo thinking; el modelo es específico de video-to-video con condicionamiento de audio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Doblaje de contenido audiovisual a otros idiomas: se sustituye la pista de voz original por una traducción locutada y el modelo regenera la sincronización labial, manteniendo resolución y frame rate del material original. Adecuado para vídeos con un rostro frontal estable.
- Localización de material formativo y corporativo: cursos, tutoriales y vídeos internos pueden doblarse a nuevos idiomas sin regrabar al presentador, usando la ventana de 81 frames y el protocolo de ventanas para piezas de varios minutos.
- Posproducción de cortometrajes y piezas de ficción: corrección de diálogos o sustitución de voces en planos con rostro frontal, con armonización de color para integrar la boca regenerada en la iluminación original.
- Creación de contenido para redes sociales: adaptación rápida de clips cortos a distintas pistas de audio o idiomas, aprovechando el bajo número de pasos (2) para reducir el tiempo de inferencia.
- Investigación académica en síntesis audiovisual: el modelo, el benchmark VidDub-Bench y el código de entrenamiento permiten reproducir experimentos de destilación y lip-sync en condiciones same-audio y cross-audio.
- Pruebas de accesibilidad y prototipado: generación de versiones alternativas de un vídeo con distintas locuciones para evaluar comprensión o para prototipar campañas antes de la producción final.
- Evaluación comparativa de modelos de dubbing: uso del checkpoint junto con VidDub-Bench para medir calidad de sincronización y realismo en un protocolo fijo y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia VidDub-Bench (dataset AIPeanutman/VidDub-Bench) y los scripts `validate_benchmark.py` y `run_benchmark.py` del repositorio de código, pero no incluye cifras numéricas de métricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repo ocupa 5,5 GB e incluye DiT y VACE en BF16 más un adaptador de audio en FP32; a ello hay que sumar los pesos base de Wan2.1-VACE-1.3B, el VAE, el T5 y Whisper-small descargados por separado.
- GPU recomendadas: no se especifican modelos concretos; la model card indica únicamente "an NVIDIA CUDA GPU" con Linux.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; requiere evaluar el conjunto DiT + VACE + VAE + T5 + Whisper en BF16/FP16.
- Opciones de despliegue: el modelo se ejecuta mediante el repositorio oficial `LAW1223/VidDub` con `scripts/infer.py`; requiere Python 3.10+, Git y FFmpeg. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo de este tipo).
- Latencia y throughput: no disponibles. La inferencia usa 2 pasos de muestreo y CFG de audio fijo en 1, lo que reduce el coste frente a esquemas multi-paso, pero no se publican tiempos medidos.
- El modo de ejecución es offline/por ventanas, no un servidor de streaming en tiempo real persistente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VidDub | Difusión vídeo + audio (doblaje, lip-sync) | 2.440.958.285 (componentes entrenados) | Ventana de 81 frames a 24 FPS | viddub-individual-commercial-research-1.0 | Pesos en HuggingFace, código en GitHub |
| Wan2.1-VACE-1.3B | Difusión vídeo (base) | 1.3B (clase de backbone) | no disponible | no disponible en la información proporcionada | HuggingFace (Wan-AI) |
| Alternativas específicas de lip-sync/dubbing | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros modelos de dubbing o lip-sync, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- El modelo requiere un rostro detectable y mayoritariamente frontal; los perfiles, oclusiones, múltiples rostros y movimientos grandes de cabeza quedan fuera de su régimen principal de funcionamiento.
- Los vídeos deben tener al menos 81 frames; clips más cortos no son el caso de uso previsto.
- La implementación es offline y por ventanas, no un servidor de streaming en tiempo real.
- Solo se publican los componentes entrenados; es necesario descargar aparte el VAE, el T5 y Whisper-small, lo que añade complejidad de despliegue.
- Riesgo de alucinación visual y artefactos en la región regenerada de la boca, especialmente en ventanas con solapamiento o iluminación cambiante; la armonización de color mitiga pero no elimina las costuras.
- Sesgos conocidos: no documentados en la información disponible; al operar sobre rostros reales, hereda los sesgos de representación de los datos de entrenamiento (no detallados).
- Idiomas soportados: no disponibles; el rendimiento multilingüe del condicionamiento de audio no está documentado.
- Licencia restrictiva: uso individual personal o comercial permitido, incluida la monetización de resultados; investigación académica no comercial permitida; uso empresarial, SaaS, APIs, inferencia alojada, aplicaciones web, bots e integraciones de plataforma requieren permiso escrito separado. Aplican además los términos de terceros (Wan2.1-VACE-1.3B, Whisper-small).
- Uso responsable: prohibido para suplantación de identidad, fraude, acoso, contenido sexual no consentido o manipulación política/mediática engañosa; el material generado debe divulgarse cuando corresponda.
- Para producción, conviene validar la calidad en el dominio concreto (iluminación, resolución, duración) y revisar el cumplimiento de la licencia antes de ofrecerlo como servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AIPeanutman/VidDub
- Paper (arXiv): https://arxiv.org/abs/2611.03404
- Página del proyecto: https://law1223.github.io/viddub-project-page/
- Código: https://github.com/LAW1223/VidDub
- Guía del benchmark: https://github.com/LAW1223/VidDub/blob/main/docs/BENCHMARK.md
- Dataset VidDub-Bench: https://huggingface.co/datasets/AIPeanutman/VidDub-Bench
- Modelo base Wan2.1-VACE-1.3B: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
- Encoder de audio Whisper-small: https://huggingface.co/openai/whisper-small
