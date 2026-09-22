# simoneteglia/MoE-JEPA

## Resumen

MoE-JEPA es un detector forense de imágenes desarrollado por Simone Teglia e Irene Amerini en el ALCOR Lab de la Sapienza Università di Roma. Se trata de un clasificador de tres clases (Real, Fully-Synthetic y Tampered) que combina dos ramas: un backbone de visión V-JEPA 2 ViT-L congelado (`facebook/vjepa2-vitl-fpc64-256`) al que se sustituyen las tres últimas capas transformer por capas residuales de mezcla de expertos, y una rama convolucional de ruido basada en BayarConv que extrae trazas de alta frecuencia. Ambas representaciones se fusionan mediante una puerta aprendida por imagen y se clasifican con una cabeza MLP.

El interés del modelo reside en su relación entre coste y rendimiento: con 379 M de parámetros activos (enrutado Top-2 sobre 6 expertos, más un experto compartido congelado) declara alcanzar el estado del arte en SID-Set, superando a SIDA-13B, un modelo aproximadamente 30 veces mayor. En evaluación fuera de distribución sobre RRDataset logra un 84,11 % global en régimen zero-shot, por delante de modelos visión-lenguaje como GPT-4o, Claude-3.7, Gemini-2 y Grok-2 según la model card.

Está publicado bajo licencia MIT y pensado para inglés, con un repositorio de 1,9 GB que contiene un checkpoint PyTorch (`model_weights.pt`) más el código `model.py` necesario para reconstruir la arquitectura. No es un modelo generativo ni un LLM: es un cabezal de clasificación de imágenes para forensia sintética y detección de deepfakes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (V-JEPA 2 ViT-L congelado) con 3 capas MoE residuales + rama convolucional de ruido (BayarConv) y fusión con puerta aprendida |
| Parametros totales | no disponible (la model card no desglosa el total; el repositorio ocupa 1,9 GB) |
| Parametros activos | 379 M (Top-2 de 6 expertos enrutados por token, más 1 experto compartido congelado) |
| Longitud de contexto | no disponible (el backbone se configura como `fpc64-256`, es decir, 64 fotogramas a 256 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, checkpoint con `state_dict`, `epoch` y `global_step`); requiere `model.py` del repositorio para instanciar la clase |
| Tarea | `image-classification` (clasificación de 3 clases: Real / Fully-Synthetic / Tampered) |
| Modelo base | `facebook/vjepa2-vitl-fpc64-256` (fine-tuning de las 3 últimas capas) |
| Dataset de entrenamiento | SID-Set (`saberzl/SID_Set`) |

## Arquitectura y entrenamiento

MoE-JEPA es un detector de dos ramas. La rama semántica parte del encoder V-JEPA 2 ViT-L congelado y reemplaza sus tres últimas capas transformer por capas MoE residuales: un experto compartido congelado que preserva el conocimiento preentrenado y seis expertos enrutados entrenables, de los cuales se activan los dos mejores por token (Top-K=2) con enrutado sigmoide y temperatura de router 0,5. Los tokens de parche se agregan con un pooling MIL de atención con puerta, que atenúa los parches de fondo limpio, produciendo la representación `H_semantic`. La rama de ruido aplica BayarConv, una convolución restringida cuyo píxel central se fija a −1 × la suma de sus vecinos, seguida de una CNN ligera que produce `H_noise`. La fusión es adaptativa y por imagen: α = sigmoid(Linear([H_semantic, H_noise])) y H_fused = H_semantic + α · H_noise, seguida de una cabeza MLP de tres salidas.

El entrenamiento usa AdamW con scheduler coseno y warmup, learning rate 1e-5, weight decay 0,05 y una pérdida compuesta por entropía cruzada, una pérdida de margen de energía conjunta y una auxiliar de equilibrio de carga entre expertos (peso 0,1). El checkpoint publicado con nombre `ce_only` corresponde a la ablación de la Tabla 3 del artículo: se entrenó únicamente con entropía cruzada (`lambda_energy = 0.0`), por lo que sirve como línea base limpia para medir la aportación de la pérdida basada en energía. Se entrenaron las 3 últimas capas durante 14 épocas sobre SID-Set. No se indica en la información disponible el número de tokens, la composición detallada del dataset ni si hubo fases de RLHF o DPO (no aplicables, al ser un clasificador).

## Capacidades

- Clasificación de imágenes en tres categorías mutuamente excluyentes: Real, Fully-Synthetic (generada por IA) y Tampered (manipulación local).
- Detección de trazas de alta frecuencia propias de la generación sintética y de la manipulación local, gracias a la rama BayarConv.
- Aprovechamiento de priors semánticos de V-JEPA 2, lo que aporta robustez en escenarios de re-digitalización donde las pistas a nivel de píxel se destruyen.
- Funcionamiento en régimen zero-shot sobre dominios no vistos (evaluado en RRDataset).
- Inferencia sobre imágenes individuales, tratadas como fotogramas replicados mediante `AutoVideoProcessor` de transformers.
- No soporta generación de texto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés y, al ser un clasificador de imágenes, el idioma no interviene en la tarea.
- No dispone de modo thinking, visión-lenguaje conversacional, audio ni localización espacial de la manipulación (solo etiqueta de clase).

## Casos de uso

- Moderación de contenido en plataformas UGC: clasificar automáticamente cada imagen subida en Real, Fully-Synthetic o Tampered permite enrutar a revisión humana solo los casos sospechosos, reduciendo el volumen de inspección manual.
- Verificación periodística y fact-checking: dado que el modelo distingue imágenes íntegras de imágenes manipuladas localmente, un redactor puede usarlo como primer filtro antes de publicar material recibido de terceros.
- Detección de fraude documental en procesos KYC: la clase Tampered está pensada para manipulaciones locales, lo que encaja con la alteración de documentos o comprobantes antes de enviarlos a un proceso de alta.
- Saneamiento de datasets de entrenamiento: filtrar corpus de imágenes web para separar material real de material sintético y evitar que generadores concretos contaminen el conjunto de entrenamiento de otros modelos.
- Peritaje forense digital: como herramienta de apoyo en un flujo pericial, aportando una puntuación de clase sobre imágenes incautadas o aportadas como prueba, siempre con validación por un experto humano.
- Verificación de identidad remota: detección de recaptura física (la partición Re-Digitalization del conjunto RRDataset es donde el modelo rinde mejor), un vector habitual para burlar pruebas de vida remotas.
- Confianza en reclamaciones con imagen en seguros o comercio electrónico: clasificar las fotos adjuntas a una reclamación para detectar montajes antes de tramitar el expediente.
- Despliegue on-premise con requisitos de privacidad: al pesar 379 M de parámetros activos y usar licencia MIT, puede ejecutarse en infraestructura propia sin enviar imágenes a servicios externos.

## Benchmarks y rendimiento

| Benchmark | Conjunto | Modalidad | Resultado |
|---|---|---|---|
| SID-Set | In-distribution | Evaluación estándar | Estado del arte con 379 M de parámetros activos; supera a SIDA-13B (≈30× mayor); rendimiento equilibrado en las tres clases, donde los especialistas por clase tienden al colapso de modo |
| RRDataset | Out-of-distribution | Zero-shot | 84,11 % global; primera posición frente a todos los modelos visión-lenguaje zero-shot probados (GPT-4o, Claude-3.7, Gemini-2, Grok-2); mejor comportamiento en la partición más difícil (Re-Digitalization / Real) |

La model card no publica cifras desglosadas por clase ni puntuaciones numéricas para SID-Set, ni los resultados concretos de los modelos comparados. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa, un checkpoint de 379 M de parámetros activos ocupa aproximadamente 1,5 GB en fp32 y 0,8 GB en fp16/bf16, más el backbone V-JEPA 2 ViT-L y las activaciones; el repositorio completo pesa 1,9 GB. Estas cifras son estimaciones, no medidas oficiales.
- Cabe en GPU de consumo: sí, con alta probabilidad, en tarjetas con 8-12 GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090), e incluso en CPU para inferencia puntual, aunque sin latencias publicadas.
- GPU recomendadas para producción: RTX 4090 o L4 para despliegues de bajo volumen; A100 o H100 si se necesita procesar lotes grandes de imágenes o servir múltiples réplicas.
- El modelo no está diseñado para entrenamiento desde cero en hardware de consumo: el preentrenamiento del backbone V-JEPA 2 es costoso, aunque en este caso se congela y solo se ajustan las últimas capas y los expertos.
- Opciones de despliegue: no admite vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, al no ser un modelo de lenguaje. El despliegue se realiza con PyTorch eager, importando dinámicamente `model.py` desde el repositorio y cargando el `state_dict`; para servir en producción conviene envolverlo en FastAPI, TorchServe o un Triton Inference Server con backend PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Rendimiento en SID-Set | Rendimiento en RRDataset (zero-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MoE-JEPA (`ce_only`) | 379 M activos | Detector forense ViT + MoE | Estado del arte según el autor | 84,11 % global, primera posición | MIT | Pesos abiertos en HuggingFace (0 descargas, 0 likes) |
| SIDA-13B | ≈13 B (≈30× mayor) | Detector forense | Inferior a MoE-JEPA según el autor | no disponible | no disponible | no disponible |
| GPT-4o, Claude-3.7, Gemini-2, Grok-2 | no disponible | Modelos visión-lenguaje generalistas, zero-shot | no evaluados | Por debajo de MoE-JEPA (sin cifras publicadas) | Propietaria | APIs comerciales |
| `facebook/vjepa2-vitl-fpc64-256` | no disponible | Backbone auto-supervisado de visión | no es un detector forense | no aplica | no indicada en la model card | Pesos abiertos en HuggingFace |

La comparación con los modelos visión-lenguaje es asimétrica: se trata de modelos generalistas evaluados en zero-shot, no de detectores forenses especializados. La model card no ofrece cifras numéricas de ninguno de los competidores.

## Limitaciones y advertencias

- El checkpoint publicado es la variante `ce_only`, una ablación entrenada solo con entropía cruzada; no es el modelo completo con pérdida de margen de energía descrito en el artículo.
- Salida limitada a tres etiquetas; no localiza la región manipulada ni indica el generador concreto que produjo una imagen sintética.
- En el mejor escenario publicado (RRDataset, zero-shot) la tasa de error es de aproximadamente el 16 %, insuficiente para decisiones automatizadas sin revisión humana en contextos de alto impacto.
- Riesgo de sesgo de dominio: el entrenamiento se realizó íntegramente sobre SID-Set, de modo que el comportamiento frente a generadores, cámaras o pipelines de compresión no representados en ese conjunto no está caracterizado.
- Riesgo de falsos positivos sobre imágenes legítimamente procesadas (recompresión agresiva, filtros, reescalado), ya que la rama de ruido es sensible a las trazas de alta frecuencia.
- Documentación incompleta: la model card no indica parámetros totales, tipos de cuantización, número de tokens de entrenamiento, composición detallada del dataset ni latencias, y el README aparece truncado en la sección de inferencia.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida más allá de los resultados del propio artículo.
- Integración poco estándar: no se carga con `AutoModel`; requiere descargar y ejecutar `model.py` del repositorio, lo que complica el versionado y la reproducibilidad en producción.
- Restricciones de licencia: los pesos se publican bajo MIT, pero conviene verificar por separado la licencia del backbone `facebook/vjepa2-vitl-fpc64-256` de Meta antes de un uso comercial.
- Metadatos de idioma limitados a inglés; irrelevante para la tarea de clasificación, pero indica que no hay soporte documental multilingüe.
- Ausencia de advertencias del autor sobre uso dual: un detector de imágenes sintéticas puede emplearse también para evaluar y mejorar generadores, por lo que conviene definir políticas de uso en despliegues públicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simoneteglia/MoE-JEPA
- Modelo base: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
- Dataset SID-Set: https://huggingface.co/datasets/saberzl/SID_Set
- Repositorio de código: https://github.com/ALCOR-Lab-DIAG/MoE-JEPA
- Laboratorio: ALCOR Lab, Sapienza University of Rome — https://alcorlab.diag.uniroma1.it/
- Artículo: "Unifying Semantic Priors and High-Frequency Traces: Enhancing V-JEPA with Mixture-of-Experts for Robust Synthetic Image Forensics", Simone Teglia e Irene Amerini, AI4MFDD Workshop @ ECCV 2026 (no se ha proporcionado URL directa al PDF en la información disponible)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron únicamente páginas institucionales sin relación con MoE-JEPA.
