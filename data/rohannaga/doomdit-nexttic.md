# RohanNaga/doomdit-nexttic

## Resumen

Doomdit-nexttic es el conjunto de checkpoints publicado por Rohan Nagabhirava, Chirumamilla y Liu (Intelligent Control Lab) para el artículo "DoomShift: How Much Adaptation Do World Models Need Under Domain Shift?", presentado en los workshops PhysWM y TAG de CoRL 2026. No es un modelo de lenguaje: es una familia de tres modelos de difusión de imagen convertidos en world models de siguiente tic para Doom, capaces de predecir el fotograma siguiente a partir de 32 latentes de contexto y la acción más reciente (29 acciones discretas).

El repositorio empaqueta tres backbones con un mismo recetario: SD 1.4 U-Net (860M parámetros), PixArt-α (628M) y SD 3.5 Medium (2.27B), cada uno entrenado 200k actualizaciones sobre 4 mapas de Doom y evaluado en 13 mapas nunca vistos. Además incluye los decodificadores VAE afinados con los que se decodifican las métricas reportadas y todas las ejecuciones de adaptación (LoRA de rango 16 y fine-tuning completo) sobre los 13 mapas no vistos.

Su relevancia es metodológica: cuantifica cuánta adaptación necesita un world model cuando cambia el dominio (mapas nuevos) y demuestra que un LoRA de rango 16 entrenado con 8 episodios durante 4k actualizaciones (2% del preentrenamiento, ~1% del cómputo) recupera entre el 72% y el 76% del aumento de LPIPS y aproximadamente la mitad de la PSNR perdida, con mucha menos catástrofe de olvido que el fine-tuning completo. El repo ocupa 334,1 GB y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente image-to-image (U-Net en SD 1.4; transformer de difusión en PixArt-α y SD 3.5 Medium), condicionada por acción |
| Parametros totales | 860M (SD 1.4 U-Net), 628M (PixArt-α), 2.27B (SD 3.5 Medium) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 tics de contexto latente + la acción más reciente |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en snapshots `.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | `other` / `per-backbone` (ver sección Licensing del repo; hereda la licencia de cada backbone) |
| Formato de pesos | `.pt` (snapshots con pesos vivos `model` y EMA fp32), LoRA en `.pt`, decodificadores VAE en safetensors/diffusers |
| Espacio latente | KL-f8 de 4 canales (`stabilityai/sd-vae-ft-mse`) para U-Net y PixArt-α; 16 canales propio de SD 3.5 |
| Acciones | 29 acciones discretas |
| Muestreo | DDIM de 10 pasos con v-prediction |
| Tamano del repo | 334,1 GB |

## Arquitectura y entrenamiento

Los tres backbones comparten un único recetario de entrenamiento: predicción de v (v-prediction) con aumentación de ruido en el contexto, 200k actualizaciones con batch global de 32, learning rate 5e-5 con 2k pasos de warmup, autocast en bf16 con AdamW fusionado y EMA mantenida en fp32 con decay 0.9999. La entrada es siempre la misma: 32 tics de contexto latente más la acción más reciente, y el objetivo es el latente del fotograma siguiente. El U-Net de SD 1.4 y PixArt-α comparten el espacio latente KL-f8 de 4 canales de SD 1.x; SD 3.5 Medium opera en su propio espacio latente de 16 canales.

La innovación técnica no está en el backbone sino en el protocolo experimental y en los decodificadores. Se afinan decodificadores VAE específicos (MSE + 0.1 LPIPS con el encoder congelado) sobre fotogramas de los mapas de entrenamiento, y se conserva una variante solo MSE (la receta del decodificador de GameNGen) como comparación. Cada snapshot incluye pesos vivos y EMA, y las filas zero-shot del artículo y todas las adaptaciones parten de los pesos EMA de 200k. Las adaptaciones LoRA de rango 16 (k=8) se entrenan por mapa no visto, y los adaptadores guardan solo los pesos LoRA más las partes entrenadas en completo (embedding de acción, proyección de entrada y embedding de ruido), nombrando el snapshot congelado de origen.

## Capacidades

- Predicción del siguiente fotograma de Doom condicionada por acción, un tic hacia delante, en el espacio latente y decodificada a píxel.
- Modelado de world model action-conditioned con 29 acciones discretas (incluidos giros de cámara).
- Generación image-to-image sobre 32 tics de contexto, lo que permite condicionar la dinámica a corto plazo.
- Adaptación a dominio mediante LoRA de rango 16 o fine-tuning completo por mapa.
- Evaluación cuantitativa integrada: PSNR de escena (HUD excluido), LPIPS y turn-response.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Investigación en world models: reproducir la comparativa de adaptación bajo domain shift entre tres backbones de difusión con un mismo recetario, usando los snapshots EMA de 200k y `eval_tf.py`.
- Estudio de eficiencia de adaptación: medir cuánto recupera un LoRA de rango 16 con 8 episodios y 4k actualizaciones frente al fine-tuning completo (205× más parámetros, 2.7× más olvido en los mapas de entrenamiento).
- Simulación de entornos para agentes RL: usar el modelo como simulador de siguiente tic para entrenar o evaluar políticas en mapas donde no se dispone de entorno real, con la salvedad de que la fidelidad cae en mapas no vistos.
- Análisis de olvido catastrófico: comparar la degradación en mapas de entrenamiento (1.08 dB con full fine-tuning frente a 0.40 dB con LoRA) para diseñar estrategias de adaptación continua.
- Evaluación de decodificadores VAE: contrastar la receta MSE + 0.1 LPIPS con la receta MSE-only de GameNGen sobre los mismos latentes.
- Docencia y divulgación: ilustrar difusión latente condicionada por acción con checkpoints pequeños (628M–860M) y código público, sin necesidad de infraestructura de gran escala.
- Reproducción de métricas: puntuar cualquier checkpoint o adaptador con `eval_tf.py` pasando backbone, checkpoint, decodificador afinado y latentes de evaluación, con `--use-ema`.

## Benchmarks y rendimiento

Medianas sobre mapas, un tic hacia delante, evaluadas sobre la escena (HUD excluido) contra el fotograma crudo:

| Backbone | Scene PSNR (dB) ↑ train → unseen | LPIPS ↓ train → unseen | Turn-response ↑ train → unseen |
|---|---|---|---|
| SD 1.4 U-Net | 25,20 → 22,30 | 0,158 → 0,303 | 0,86 → 0,81 |
| PixArt-α | 25,18 → 22,38 | 0,159 → 0,285 | 0,84 → 0,79 |
| SD 3.5 Medium | 25,38 → 22,09 | 0,126 → 0,262 | 0,84 → 0,81 |

Resultados de adaptación reportados en la model card: el LoRA de rango 16 recupera el 72–76% del aumento de LPIPS y aproximadamente la mitad de la PSNR perdida; el fine-tuning completo del U-Net recupera más (88% frente a 72%) pero entrena 205× más parámetros y olvida 2,7× más en los mapas de entrenamiento (1,08 frente a 0,40 dB). El turn-response invierte la última acción de giro y cuenta las ventanas cuya predicción de desplazamiento horizontal cambia de dirección; un modelo que ignora las acciones puntúa 0 y uno perfecto 0,89, porque el 11% de los giros registrados mueven la vista demasiado poco para medirse en un tic.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la información proporcionada. Como referencia de orden de magnitud, un snapshot de SD 3.5 Medium ocupa 9,5 GB y uno de U-Net 3,4 GB en el repo, pero el pico de inferencia depende del pipeline y del decodificador.
- GPU recomendadas: no disponible. El entrenamiento usó bf16 con AdamW fusionado y batch global 32, lo que sugiere GPUs de centro de datos, pero no se documentan modelos concretos.
- ¿Cabe en GPU consumer? No confirmado. Los backbones de 628M y 860M son de tamaño moderado, pero no hay datos publicados de consumo en RTX 4090 u otras consumer.
- Despliegue: el flujo documentado es el repositorio de código con `requirements.txt`, descarga vía `hf download` y evaluación con `eval_tf.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El muestreo es DDIM de 10 pasos con v-prediction.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Doomdit-nexttic (SD 1.4 U-Net) | 860M | 32 tics + acción | World model de siguiente tic en Doom | per-backbone | Hugging Face, 0 descargas |
| Doomdit-nexttic (PixArt-α) | 628M | 32 tics + acción | World model de siguiente tic en Doom | per-backbone | Hugging Face, 0 descargas |
| Doomdit-nexttic (SD 3.5 Medium) | 2,27B | 32 tics + acción | World model de siguiente tic en Doom | per-backbone | Hugging Face, 0 descargas |
| GameNGen (referencia citada) | no disponible | no disponible | World model de Doom | no disponible | no disponible en la información proporcionada |

La comparación relevante es interna: los tres backbones comparten recetario y protocolo, lo que permite aislar el efecto del tamaño y la arquitectura. No se dispone de datos de benchmarks de GameNGen en la información proporcionada para una comparación numérica.

## Limitaciones y advertencias

- El modelo predice un solo tic hacia delante; no está diseñado para rollouts largos ni para planificación de horizonte extendido.
- Rendimiento degradado en mapas no vistos: la PSNR cae entre 2,9 y 3,3 dB y el LPIPS sube entre 0,136 y 0,145 respecto a los mapas de entrenamiento.
- El turn-response perfecto es 0,89, no 1,0, por limitaciones de la propia métrica (11% de giros no medibles en un tic).
- El fine-tuning completo recupera más fidelidad pero olvida 2,7× más en los mapas de entrenamiento; no es adecuado si se necesita conservar el rendimiento original.
- Licencia `other` con nombre `per-backbone`: cada backbone hereda su licencia original (CompVis SD 1.4, PixArt-α, Stability AI SD 3.5 Medium), lo que condiciona el uso comercial. Hay que revisar la sección Licensing del repo antes de cualquier despliegue productivo.
- El repo pesa 334,1 GB y distribuye snapshots `.pt` en lugar de safetensors; la carga requiere descargar el snapshot completo y verificar los `.sha256`.
- No hay información sobre sesgos, alucinación visual ni evaluación cualitativa más allá de las métricas citadas.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación independiente.
- Es un artefacto de investigación (workshops CoRL 2026), no un modelo listo para producción.

## Enlaces

- Hugging Face: https://huggingface.co/RohanNaga/doomdit-nexttic
- Página del proyecto: https://intelligent-control-lab.github.io/DoomShift/
- Paper: https://intelligent-control-lab.github.io/DoomShift/static/DoomShift.pdf
- Código: https://github.com/intelligent-control-lab/DoomShift
- Dataset de fotogramas: https://huggingface.co/datasets/RohanNaga/doom-dense-arnold
- Dataset de latentes: https://huggingface.co/datasets/RohanNaga/doom-dense-arnold-latents
- Backbone SD 1.4: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Backbone PixArt-α: https://huggingface.co/PixArt-alpha/PixArt-XL-2-512x512
- Backbone SD 3.5 Medium: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- VAE de referencia: https://huggingface.co/stabilityai/sd-vae-ft-mse
- Licencia: https://huggingface.co/RohanNaga/doomdit-nexttic#licensing
