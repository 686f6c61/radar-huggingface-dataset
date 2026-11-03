# huangdffs/Nanosaur2-670M

## Resumen

Nanosaur2-670M es un modelo de difusion texto-a-imagen de tipo DiT (Diffusion Transformer) con 670 millones de parametros, orientado a la generacion de ilustraciones. Lo desarrolla el usuario huangdffs y se publica bajo licencia MIT. Su propuesta principal no es competir con modelos de imagen plenamente entrenados, sino demostrar que resultados razonables en generacion de ilustraciones son alcanzables con un presupuesto de computo minimo: el autor cifra el coste total de entrenamiento en 600 dolares.

El modelo combina un transformer de difusion de 670M parametros con un codificador de texto Gemma-3-270M congelado y un VAE semantico basado en DINOv2 de 129M parametros. Emplea objetivos de rectified flow, atencion con QK-norm, RoPE 2D, SwiGLU y bloques intermedios dispersos segun la tecnica SPRINT. La inferencia esta pensada para ComfyUI mediante un nodo personalizado incluido en el repositorio.

Es relevante ahora como referencia de investigacion sobre entrenamiento de bajo coste en difusion, y por su enfoque poco habitual de VAE semantico entrenado con perdidas DINO en lugar de perdidas de pixel, LPIPS o GAN. El autor declara explicitamente que el modelo es para fines de investigacion y que no debe esperarse que iguale a modelos plenamente entrenados en conocimiento de personajes o detalle fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con adaLN-single, RoPE 2D, SwiGLU, QK-norm y bloques intermedios dispersos SPRINT; prediccion x-prediction |
| Parametros totales | 670M (modelo de difusion); 129M adicionales en el VAE; codificador de texto Gemma-3-270M congelado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de texto definida) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (tres ficheros: `nanosaur2_diffusion_model.safetensors`, `nanosaur2_text_encoder.safetensors`, `nanosaur2_vae.safetensors`) |

## Arquitectura y entrenamiento

El modelo de difusion es un DiT de 670M parametros que incorpora adaLN-single (PixArt-alpha), RoPE 2D (RoFormer), activaciones SwiGLU, QK-norm y bloques intermedios dispersos basados en SPRINT, con prediccion en espacio x. El codificador de texto es Gemma-3-270M congelado, del que se usa la penultima capa junto con la normalizacion final. El VAE es un autoencoder semantico de representacion de 129M parametros entrenado a partir de DINOv2-B: incluye DINOv2 congelado (32 canales), DINOv2 con patch embed descongelado al estilo UniSpace, concatenacion de canales de las ultimas 6 capas (32 canales), decodificador convolucional, perdida VISReg de 1e-3 sobre el cuello de botella latente de 64 dimensiones y perdida MSE de embeddings DINO por capa, con pesos iguales entre DINOv2-B y DINOv3-B congelados. No se usan perdidas de pixel, LPIPS ni GAN; segun el autor, las perdidas DINO de ida y vuelta producen un latente VAE que converge mas rapido que los VAE habituales.

El objetivo de entrenamiento es rectified flow con x-prediction y perdida v, timesteps logit-normal y 10 por ciento de caption dropout. Para CFG, las muestras con texto descartado omiten los bloques intermedios el 50 por ciento de las veces y el resto de muestras el 5 por ciento, de modo que el modelo aprende el paso incondicional de path-drop usado por las guias `alternate` y `path_drop`. El entrenamiento se organizo en tres fases: VAE, 50.000 pasos (12 horas en una H100) partiendo de DINOv2-B; base, 11 dias-H100 sobre un dataset de 4 millones de imagenes de ilustracion con optimizador Dion3 (lr 1e-3, lr escalar 1e-4, weight decay 0.01) y schedule coseno, distribuidos en 3 dias a 256x256, 3 dias a 512x512 y 5 dias a 1024x1024 con buckets de aspecto; y ajuste estetico, 4 horas sin token dropping de SPRINT (todos los tokens pasan por los bloques intermedios) con Dion3 a 1e-4 y escalar 5e-5 con decaimiento coseno.

## Capacidades

- Generacion de imagenes de ilustracion a partir de prompts de texto, con resolucion de 1024 pixeles en buckets de aspecto.
- Acepta tanto etiquetas estilo danbooru como lenguaje natural en el prompt.
- Soporte de pesos de prompt personalizados que afectan al sesgo de cross-attention del modelo en lugar de a la magnitud del embedding, por ejemplo `(artist:4)`.
- Muestreo con CFG alternado y PDG (path-drop guidance, procedente de SPRINT).
- Entrenamiento de LoRA sobre carpetas de imagenes con ficheros `.txt` de caption del mismo nombre, mediante el script `train_lora.py` incluido.
- Integracion con ComfyUI mediante nodo personalizado y workflow arrastrable (el PNG de muestra contiene el workflow).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking.

## Casos de uso

- Generacion de ilustraciones de personajes para prototipado: el modelo acepta etiquetas de personaje, rasgos y escenario (por ejemplo, orejas de fennec, cabello rubio ondulado, bosque) y produce una imagen a 1024 pixeles, adecuada para explorar direcciones visuales antes de encargar arte final.
- Investigacion sobre entrenamiento de bajo coste: sirve como caso reproducible de entrenamiento de un DiT de 670M con 11 dias-H100 y un VAE semantico, util para estudiar el impacto del presupuesto de computo en calidad.
- Experimentacion con VAE semanticos: el VAE basado en DINOv2 con perdidas VISReg y MSE de embeddings permite estudiar alternativas a los VAE con perdidas de pixel, LPIPS o GAN en pipelines de difusion.
- Ajuste fino con LoRA sobre un estilo o personaje concreto: el script `train_lora.py` entrena sobre una carpeta de imagenes con captions y genera un `.safetensors` cargable con `LoraLoaderModelOnly`, util para adaptar el modelo a un estilo propio con recursos modestos.
- Pruebas de tecnicas de guiado en difusion: la implementacion de CFG alternado y path-drop guidance permite comparar estrategias de guiado en un modelo pequeno y de inferencia rapida.
- Docencia y divulgacion sobre difusion: al ser un modelo pequeno, con licencia MIT y con workflow de ComfyUI incluido, resulta adecuado para explicar la arquitectura DiT, el rectified flow y el papel del codificador de texto y el VAE en un entorno practico.
- Generacion de imagenes de referencia para guiones o moodboards: con prompts en lenguaje natural y buckets de aspecto, puede producir bocetos de escena para comunicacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 3,5 GB e incluye los tres ficheros safetensors (modelo de difusion, codificador de texto y VAE), lo que da una referencia del orden de magnitud de los pesos en precision de almacenamiento.
- GPU recomendadas: no disponible. El entrenamiento se realizo en H100 (11 dias-H100 para el modelo base y 12 horas en una H100 para el VAE).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ComfyUI mediante el nodo personalizado `nanosaur2_support` y el workflow `nanosaur2_workflow.json`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagen).
- Parametros de muestreo indicados por el autor: Euler simple, 50 pasos, CFG 4, buckets de aspecto 1024, shift 3 integrado en la inferencia del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Notas |
|---|---|---|---|---|
| Nanosaur2-670M | 670M (difusion) + 129M (VAE) + 270M (text encoder) | 1024 px en buckets de aspecto | MIT | Entrenado con 11 dias-H100 y 600 USD; orientado a investigacion |
| Anima | no disponible | no disponible | no disponible | Mencionado por el autor como referencia de modelo plenamente entrenado con mayor conocimiento de personajes y detalle |
| Alternativas de difusion de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo es para fines de investigacion y que no debe esperarse que compita con modelos plenamente entrenados como Anima en conocimiento de personajes o detalle fino.
- Entrenado con un presupuesto minimo (600 USD, 11 dias-H100), lo que limita la calidad y cobertura frente a modelos con mucho mas computo.
- Dataset de entrenamiento compuesto por 4 millones de imagenes de ilustracion; no se detalla su composicion, procedencia ni filtrado, por lo que no es posible evaluar sesgos de representacion ni riesgo de memorizacion.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Riesgo de alucinacion visual: al ser un modelo generativo de imagen, puede producir atributos, anatomias o composiciones incorrectas, especialmente en detalles finos y en personajes poco representados.
- Idiomas soportados no disponibles: el comportamiento multilingue del codificador Gemma-3-270M en este pipeline no esta documentado.
- No se especifican limitaciones de resolucion mas alla de los buckets de 1024 pixeles ni el comportamiento fuera de ese rango.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias y el modelo se describe como de investigacion; conviene revisar las condiciones de los componentes derivados (Gemma-3, DINOv2, DINOv3) antes de un despliegue comercial.
- Requiere ComfyUI y el nodo personalizado `nanosaur2_support`; no hay soporte documentado para otros runners.
- El entrenamiento de LoRA incluido no usa cache, lo que puede ralentizar el proceso segun el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huangdffs/Nanosaur2-670M
- Park et al. SPRINT: Sparse-Dense Residual Fusion for Efficient Diffusion Transformers (ICLR 2026): https://arxiv.org/abs/2510.21986
- Peebles and Xie, Scalable Diffusion Models with Transformers (ICCV 2023): https://arxiv.org/abs/2212.09748
- Chen et al., PixArt-alpha (ICLR 2024): https://arxiv.org/abs/2310.00426
- Su et al., RoFormer (2021): https://arxiv.org/abs/2104.09864
- Shazeer, GLU Variants Improve Transformer (2020): https://arxiv.org/abs/2002.05202
- Dehghani et al., Scaling Vision Transformers to 22 Billion Parameters (ICML 2023): https://arxiv.org/abs/2302.05442
- Li and He, Back to Basics: Let Denoising Generative Models Denoise (CVPR 2026): https://arxiv.org/abs/2511.13720
- Gemma Team, Gemma 3 Technical Report (2025): https://arxiv.org/abs/2503.19786
- Oquab et al., DINOv2 (TMLR 2024): https://arxiv.org/abs/2304.07193
- Zheng et al., Diffusion Transformers with Representation Autoencoders (2025): https://arxiv.org/abs/2510.11690
- Singh et al., Improved Baselines with Representation Autoencoders (2026): https://arxiv.org/abs/2605.18324
- Yan et al., UniSpace (2026): https://arxiv.org/abs/2608.08676
- Wu, Balestriero and Levine, VISReg (2026): https://arxiv.org/abs/2606.02572
- Simeoni et al., DINOv3 (2025): https://arxiv.org/abs/2508.10104
- Amsel et al., Dion3: Full-Stack Orthogonal Updates (2026): https://arxiv.org/abs/2608.11612
