# DiffErase/DiffErase

## Resumen

DiffErase es un conjunto de checkpoints preentrenados publicado por el equipo DiffErase para la eliminación de marcas de agua (watermarking) en audio mediante modelos de difusión. Acompaña al trabajo *Audio Pirates: Black-box Audio Watermark Removal via Diffusion Priors*, cuyo código está disponible en un repositorio de GitHub independiente. No es un modelo de propósito general, sino una colección de modelos de difusión incondicionales entrenados específicamente para regenerar audio limpio a partir de audio marcado, aprovechando el prior aprendido por la difusión para "borrar" la señal de watermark sin necesidad de acceso al detector ni al esquema de marcado original (escenario black-box).

El repositorio contiene dos familias de modelos: DiffErase-mel, basada en un `UNet2DModel` de diffusers con `DDPMScheduler` que opera sobre espectrogramas mel de 80 bandas a 22,05 kHz, y DiffErase-latent, una difusión latente estilo AudioLDM a 16 kHz con mel de 64 bandas. Cada familia se ofrece en tres dominios: habla (entrenado con LibriSpeech), música (FMA) y sonido ambiental (Clotho). Los pesos están en formato safetensors y `.ckpt`, con un tamaño total de repositorio de 6,1 GB.

La relevancia actual del modelo es doble: por un lado, es una herramienta de investigación para estudiar la robustez de los esquemas de watermarking de audio frente a ataques de eliminación basados en difusión; por otro, plantea implicaciones directas para la protección de derechos de autor y la trazabilidad de contenido generado o distribuido. Su publicación en HuggingFace sin model card detallada, sin licencia declarada y sin métricas de evaluación en la información disponible limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiffErase-mel: `UNet2DModel` + `DDPMScheduler` (diffusers) sobre mel de 80 bandas a 22,05 kHz. DiffErase-latent: difusión latente estilo AudioLDM (UNet + VAE congelado) sobre mel de 64 bandas a 16 kHz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dominio de habla se entrena con LibriSpeech, que es inglés, pero no se declara soporte idiomático formal) |
| Licencia | no disponible |
| Formato de pesos | safetensors y `.ckpt` (checkpoints de PyTorch); VAE y vocoder auxiliares en `.ckpt` y `.json` |

## Arquitectura y entrenamiento

DiffErase-mel emplea una difusión incondicional sobre espectrogramas mel de 80 bandas muestreados a 22,05 kHz, implementada con el `UNet2DModel` y el `DDPMScheduler` de la librería diffusers. La reconstrucción al dominio temporal se realiza con el vocoder BigVGAN v2 de 22 kHz y 80 bandas (`nvidia/bigvgan_v2_22khz_80band_256x`). DiffErase-latent sigue un esquema de difusión latente al estilo AudioLDM: un UNet opera en el espacio latente de un VAE congelado (mel de 64 bandas a 16 kHz) y la síntesis final usa un vocoder HiFi-GAN de 16 kHz y 64 bandas. Cada checkpoint `.ckpt` de la variante latente incluye el UNet, sus pesos EMA y el VAE congelado; los ficheros `vae_mel_16k_64bins.ckpt` y `hifigan_16k_64bins.ckpt/.json` provienen del proyecto AudioLDM-training-finetuning.

Los datos de entrenamiento declarados son LibriSpeech para el dominio de habla, FMA para música y Clotho para sonido ambiental. No se especifica en la información disponible el número de tokens o horas de audio, la composición exacta del dataset, ni si se aplicaron etapas de ajuste fino con RLHF/DPO (poco habituales en modelos de difusión de audio). La innovación técnica central es el uso del prior de difusión como mecanismo de eliminación de watermark en régimen black-box: el modelo regenera la señal desde ruido condicionado implícitamente por el audio marcado, de modo que la marca no sobrevive al proceso generativo. El script de inferencia `remove_differase-mel.py` expone un parámetro `--noise_level` (por ejemplo 0,1) que controla la intensidad del proceso de borrado.

## Capacidades

- Eliminación de marcas de agua en audio mediante regeneración con prior de difusión, en escenario black-box (sin acceso al detector ni al esquema de marcado).
- Procesamiento de tres dominios acústicos diferenciados: habla, música y sonido ambiental, con checkpoints independientes por dominio.
- Dos pipelines alternativos: difusión en espacio mel (22,05 kHz, 80 bandas) y difusión latente (16 kHz, 64 bandas).
- Reconstrucción de audio de alta fidelidad mediante vocoders dedicados (BigVGAN v2 para la variante mel; HiFi-GAN para la variante latente).
- Control de intensidad de borrado mediante el parámetro `noise_level` en el script de inferencia.
- Integración con el ecosistema diffusers para la variante mel (`UNet2DModel`, `DDPMScheduler`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo generativo de audio, no un LLM.
- No se declaran capacidades multilingües ni modos especiales (thinking, visión, audio-texto).

## Casos de uso

- Investigación en robustez de watermarking de audio: usar los checkpoints para medir la tasa de eliminación de marcas sobre audio marcado con distintos esquemas y cuantificar la resistencia de cada detector frente a un ataque basado en difusión.
- Evaluación de sistemas de protección de derechos de autor: generar versiones "limpias" de audio marcado para comprobar si un pipeline de verificación de licencias detecta correctamente la ausencia o manipulación de la marca.
- Desarrollo de defensas anti-borrado: emplear DiffErase como atacante de referencia en un banco de pruebas y entrenar detectores o esquemas de watermarking adversarios más robustos.
- Anonimización o limpieza de audio en pipelines de investigación: eliminar señales incrustadas no deseadas de grabaciones de dominio público antes de su uso en datasets de entrenamiento, siempre que la licencia del audio lo permita.
- Estudio comparativo de arquitecturas de difusión de audio: contrastar el rendimiento de la difusión en mel (22,05 kHz) frente a la difusión latente (16 kHz) en tareas de regeneración condicionada por audio, usando los tres dominios como ejes de evaluación.
- Reproducción de resultados académicos: ejecutar el código del repositorio de GitHub con los checkpoints oficiales para replicar las cifras del artículo *Audio Pirates* en habla (LibriSpeech), música (FMA) y ambiental (Clotho).
- Análisis forense de contenido sospechoso: inspeccionar si un audio distribuido ha sido procesado con este tipo de técnicas, comparando características espectrales antes y después de la regeneración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 6,1 GB e incluye seis checkpoints (tres mel y tres latentes) más VAE y vocoders; en inferencia solo se carga un checkpoint por dominio, por lo que el pico de VRAM dependerá del tamaño del UNet correspondiente, dato no declarado.
- GPU recomendadas: no disponible. Por el tamaño típico de UNets de difusión de audio y el uso de vocoders como BigVGAN, se espera que quepan en GPUs de consumo con suficiente VRAM, pero no se confirma en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado. La variante mel (80 bandas, 22,05 kHz) y la latente (64 bandas, 16 kHz) son de menor resolución que modelos de difusión de imagen, lo que sugiere requisitos moderados, pero no hay cifras oficiales.
- Opciones de despliegue: scripts Python del repositorio de GitHub (`remove_differase-mel.py`) e integración con diffusers para la variante mel. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a modelos de audio de difusión).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto / dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiffErase | Eliminacion de watermark de audio via difusion | no disponible | Audio 16-22,05 kHz, 3 dominios | no disponible | HuggingFace + GitHub |
| AudioLDM | Difusion latente texto-a-audio | no disponible | Audio 16 kHz | no disponible en la informacion | GitHub + HuggingFace |
| BigVGAN v2 | Vocoder neuronal | no disponible | Audio 22 kHz, 80 bandas | no disponible en la informacion | HuggingFace (`nvidia/bigvgan_v2_22khz_80band_256x`) |

No se dispone de información sobre otros modelos específicos de eliminación de watermark de audio con los que comparar directamente. Las alternativas citadas (AudioLDM, BigVGAN) son componentes reutilizados por DiffErase, no competidores funcionales.

## Limitaciones y advertencias

- La model card no declara licencia, idiomas soportados ni pipeline en HuggingFace; el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- No se han publicado métricas de evaluación (tasa de eliminación de watermark, calidad perceptual tipo PESQ/STOI, robustez frente a distintos esquemas) en la información disponible.
- El modelo está entrenado por dominio (habla, música, ambiental) y no se garantiza su funcionamiento fuera del dominio correspondiente.
- El dominio de habla usa LibriSpeech, corpus en inglés; no hay evidencia de generalización a otros idiomas.
- Riesgo de artefactos o degradación de calidad en la regeneración, especialmente con `noise_level` altos; el script expone este parámetro pero no se documentan valores óptimos.
- Uso dual: la herramienta está diseñada para eliminar marcas de agua, lo que puede facilitar la elusión de sistemas de trazabilidad y la vulneración de derechos de autor si se aplica sobre contenido de terceros.
- No es un LLM: no soporta texto, tool calling, agentes ni razonamiento; cualquier expectativa en ese sentido es un error de categoría.
- Dependencia de vocoders externos (BigVGAN, HiFi-GAN) cuyas licencias deben verificarse por separado antes de un despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/DiffErase/DiffErase
- Repositorio GitHub: https://github.com/DiffErase/DiffErase
- Vocoder BigVGAN v2 22 kHz 80 bandas: https://huggingface.co/nvidia/bigvgan_v2_22khz_80band_256x
- Repositorio AudioLDM-training-finetuning (VAE y HiFi-GAN de origen): https://github.com/haoheliu/AudioLDM-training-finetuning
- Paper citado en la model card: *Audio Pirates: Black-box Audio Watermark Removal via Diffusion Priors* (sin URL directa en la información disponible)
