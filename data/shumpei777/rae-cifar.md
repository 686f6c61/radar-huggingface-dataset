# shumpei777/rae-cifar

## Resumen

RAE on CIFAR-10 es una reproducción a pequeña escala del trabajo "Diffusion Transformers with Representation Autoencoders (RAE)" publicada por el usuario shumpei777. No es un modelo de lenguaje: es un conjunto de pesos preentrenados para un pipeline de difusión latente sobre CIFAR-10 en el que el autoencoder no es un VAE clásico, sino un encoder DINOv2 (ViT-Tiny/4 o ViT-S/4) entrenado desde cero con dino-cifar y un decoder ViT-XL afinado con GAN. El modelo generativo que opera en el espacio latente es un DiT<sup>DH</sup>-S.

El interés técnico reside en la sustitución del autoencoder variacional por un encoder de representaciones autosupervisado, lo que evita el compromiso reconstrucción-regularización del VAE y permite un decoder de mayor capacidad (ViT-XL) con ajuste adversarial. Los resultados reportados por el autor son un rFID de test de 5,71 (encoder Tiny) y 3,71 (encoder ViT-S/4), y un FID de 13,59 para el DiT<sup>DH</sup>-S con 50k muestras y sin classifier-free guidance.

Es relevante ahora como referencia reproducible y ligera para investigar autoencoders de representación en difusión, con código MIT y pesos descargables. El repo ocupa 4,2 GB y no tiene descargas ni likes en el momento de la consulta, lo que indica que es un artefacto de investigación reciente, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder de representación (DINOv2 ViT como encoder + ViT-XL como decoder) y DiT<sup>DH</sup>-S como modelo de difusión latente |
| Parámetros totales | no disponible (pesos por componente: encoder Tiny 22 MB, encoder ViT-S/4 85 MB, decoder ViT-XL 1,7 GB, DiT<sup>DH</sup>-S 0,8 GB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imágenes 32x32 en CIFAR-10) |
| Tipos de cuantización | no disponible (pesos en PyTorch `.pt`; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | no disponible (modelo de visión/generación de imágenes, no textual) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoints EMA) |

## Arquitectura y entrenamiento

El pipeline sigue el esquema RAE: un encoder DINOv2 ViT (Tiny/4 o S/4, sin registros, maestro EMA) entrenado desde cero en CIFAR-10 con dino-cifar proyecta la imagen a un espacio latente; se aplica una normalización por canal y por posición calculada sobre el conjunto de entrenamiento con augmentación de flips (`normalization_stats.pt`); un decoder ViT-XL, afinado con GAN usando un discriminador con backbone DINO v1 ViT-Tiny/4 congelado, reconstruye la imagen. Sobre ese latente opera un Diffusion Transformer DiT<sup>DH</sup>-S entrenado durante 2000 épocas (checkpoint EMA incluido).

La innovación frente a un LDM convencional es que el encoder no se optimiza para reconstruir, sino que conserva representaciones autosupervisadas de alta semántica, y la fidelidad visual se delega en un decoder grande con pérdida adversarial. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de CIFAR-10, ni si hubo RLHF/DPO (no aplica en generación de imágenes).

## Capacidades

- Generación de imágenes de 32x32 en el dominio CIFAR-10 mediante muestreo del DiT<sup>DH</sup>-S en el espacio latente.
- Reconstrucción de imágenes a través del par encoder/decoder (rFID de test 5,71 con Tiny y 3,71 con ViT-S/4).
- Extracción de features visuales autosupervisadas con los encoders DINOv2 entrenados en CIFAR-10, cargables con `load_backbone` de dino-cifar.
- Entrenamiento adversarial del decoder con discriminador DINO v1 congelado (peso `disc_dino_vit_tiny4.pt`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión generalista, audio ni entrada de texto.

## Casos de uso

- Reproducción de experimentos RAE: el repo permite ejecutar `src/sample.py` con la configuración `DiTDH-S_pretrained.yaml` para validar el pipeline completo y comparar con los FID reportados.
- Investigación en autoencoders de representación: sustituir el VAE por un encoder DINOv2 y medir el efecto en la calidad de reconstrucción y en el FID del modelo de difusión.
- Estudio de decoders con pérdida adversarial: el decoder ViT-XL afinado con GAN sirve como baseline para analizar el equilibrio entre fidelidad y semántica latente.
- Benchmark de modelos de difusión pequeños: el DiT<sup>DH</sup>-S con FID 13,59 (50k muestras, sin CFG) es una referencia ligera para comparar variantes de arquitectura o schedules.
- Extracción de features para clasificación en CIFAR-10: los encoders DINOv2 ViT-Tiny/4 y ViT-S/4 pueden usarse como backbone congelado en tareas downstream de bajo coste.
- Docencia y prototipado: el conjunto completo cabe en 4,2 GB y se ejecuta en una sola GPU consumer, lo que facilita prácticas sobre difusión latente y autosupervisión sin infraestructura grande.
- Análisis de normalización latente: `normalization_stats.pt` permite estudiar la distribución por canal y posición del espacio latente y su impacto en el muestreo.

## Benchmarks y rendimiento

| Modelo / componente | Métrica | Valor | Condiciones |
|---|---|---|---|
| Encoder Tiny + decoder XL con GAN | rFID test | 5,71 | 50k muestras |
| Encoder Tiny + decoder XL con GAN | rFID train | 0,89 | 50k muestras |
| Encoder ViT-S/4 + decoder XL con GAN | rFID test | 3,71 | 50k muestras |
| Encoder ViT-S/4 + decoder XL con GAN | rFID train | 0,72 | 50k muestras |
| DiT<sup>DH</sup>-S | FID | 13,59 | 50k muestras, sin CFG, contra CIFAR-10 train |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no es textual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño de pesos, el decoder ViT-XL (1,7 GB) y el DiT<sup>DH</sup>-S (0,8 GB) en FP32 requieren del orden de 2,5-3 GB solo para pesos, más activaciones.
- GPU recomendadas: no documentadas por el autor; por volumen, una GPU consumer con 8-12 GB (RTX 3060, 4060 Ti, 4070) debería ser suficiente para muestreo en FP32.
- Cabe en GPU consumer: sí, previsiblemente en cualquier tarjeta con 8 GB o más, dado el tamaño del repo (4,2 GB).
- Opciones de despliegue: el flujo oficial es PyTorch con `uv` y el repositorio rae-cifar (`uv sync`, `hf download`, `src/sample.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RAE on CIFAR-10 (este) | Autoencoder de representación + DiT | no disponible (pesos 0,8-1,7 GB por componente) | Imágenes 32x32 | rFID test 3,71-5,71; FID 13,59 | MIT | Hugging Face, 0 descargas |
| RAE oficial (bytetriper/RAE) | Autoencoder de representación + DiT | no disponible | Imágenes de mayor resolución | no disponible en esta ficha | MIT | GitHub |
| LDM / VAE + DiT clásico en CIFAR-10 | VAE + diffusion transformer | no disponible | Imágenes 32x32 | no disponible | variable | múltiples repositorios |
| dino-cifar | Encoder DINOv2 para CIFAR-10 | ViT-Tiny/4 y ViT-S/4 | Imágenes 32x32 | no disponible | no disponible | GitHub |

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en CIFAR-10 (32x32); no generaliza a otras resoluciones, dominios ni tareas sin reentrenamiento.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; cualquier uso conversacional es inválido.
- Riesgo de artefactos y colapso modal en el muestreo del DiT, especialmente sin classifier-free guidance (el FID reportado es sin CFG).
- Los rFID bajos en train (0,72-0,89) frente a test (3,71-5,71) sugieren cierta brecha de generalización que conviene vigilar.
- Sin datos publicados sobre sesgos, composición demográfica o toxicidad; CIFAR-10 es un dataset de baja resolución y clases limitadas.
- Licencia MIT permite uso comercial, pero el código depende de la implementación oficial RAE (MIT) y de pesos DINOv2 entrenados desde cero; verificar la procedencia de cualquier componente externo antes de producción.
- Repo con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento garantizado; los checkpoints son EMA y pueden no reproducir exactamente los números reportados sin la configuración exacta.
- No se documentan requisitos de hardware ni latencias, por lo que el dimensionado en producción debe medirse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/shumpei777/rae-cifar
- Repositorio rae-cifar: https://github.com/shumpei-takezaki/rae-cifar
- Documentación del repo: https://github.com/shumpei-takezaki/rae-cifar/blob/main/docs/README.md
- dino-cifar: https://github.com/shumpei-takezaki/dino-cifar
- Paper RAE (arXiv:2510.11690): https://arxiv.org/abs/2510.11690
- Implementación oficial RAE: https://github.com/bytetriper/RAE
