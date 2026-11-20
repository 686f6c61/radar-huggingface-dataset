# mlx-community/FLUX.2-klein-4B-1step-RDM-bf16

## Resumen

FLUX.2-klein-4B-1step-RDM-bf16 es una conversión al formato MLX del modelo de generación de imágenes por difusión en un solo paso desarrollado por el laboratorio EPFL VITA. El modelo parte de FLUX.2 [klein] 4B de Black Forest Labs y aplica una técnica de destilación denominada Representation Distribution Matching (RDM), descrita en el artículo arXiv:2607.02375, que permite generar una imagen completa en una única evaluación del transformer de difusión en lugar de las cuatro habituales del modelo destilado original.

La relevancia de esta ficha radica en su doble naturaleza: por un lado, es un ejemplo de destilación extrema aplicada a un modelo de difusión moderno con arquitectura MMDiT; por otro, es una conversión específica para Apple Silicon mediante la librería MLX, orientada a inferencia local en hardware de Apple. El repositorio incluye el DiT convertido al layout de diffusers, mientras que el codificador de texto (Qwen3-4B), el VAE, el tokenizador y el scheduler provienen sin cambios de FLUX.2 [klein] 4B.

El modelo está pensado exclusivamente para text-to-image, sin soporte de negative prompts ni de CFG, y con licencia Apache-2.0. Su tamaño de repositorio es de 16,0 GB en bf16 y no registra descargas ni likes en el momento de la consulta, lo que indica una publicación muy reciente (20 de noviembre de 2026).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MMDiT (transformer de difusión multimodal) con destilación one-step RDM |
| Parámetros totales | 4B en el DiT; codificador de texto Qwen3-4B adicional |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a text-to-image; depende del codificador Qwen3-4B) |
| Tipos de cuantización | bf16 (única variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout diffusers para el transformer, más text_encoder, vae, tokenizer y scheduler) |

## Arquitectura y entrenamiento

El modelo se basa en FLUX.2 [klein] 4B, un transformer de difusión con arquitectura MMDiT que combina atención conjunta entre tokens de texto e imagen. La innovación principal es la destilación mediante Representation Distribution Matching (RDM), que entrena al DiT para producir la imagen final en un solo paso de muestreo. El checkpoint resultante se convierte desde el layout nativo de Black Forest Labs al layout de diffusers: se elimina el prefijo `model.`, se dividen las claves `qkv` en `to_q`, `to_k`, `to_v`, `add_q_proj`, `add_k_proj` y `add_v_proj`, y se intercambian las mitades (shift, scale) del adaLN final para adaptarlas a la convención de diffusers.

La verificación de la conversión es rigurosa: las 169 claves y formas coinciden con FLUX.2 [klein] 4B, y cada tensor presenta un coseno de aproximadamente 1,000 respecto al modelo base, con un desplazamiento relativo de en torno al 0,15 % atribuible al entrenamiento RDM. No se reentrenaron ni recuantizaron pesos durante la conversión. El codificador de texto, VAE, tokenizador y scheduler son los originales de FLUX.2 [klein] 4B sin modificar. No se detalla en la información disponible el volumen de tokens ni la composición exacta del dataset de entrenamiento de la destilación.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en un único paso de muestreo.
- Resolución de trabajo: entrenado y evaluado a 512², con buen comportamiento observado a 1024².
- Sin classifier-free guidance: la escala de guiado es 1,0 y los negative prompts no tienen efecto.
- Codificador de texto Qwen3-4B para el condicionamiento semántico del prompt.
- Generación de texto dentro de la imagen (spelling in-image), aunque con menor fiabilidad que el modelo de 4 pasos en prompts difíciles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No soporta visión de entrada, audio ni otras modalidades.
- Inferencia optimizada para Apple Silicon mediante MLX y el port Swift MLXKlein.

## Casos de uso

- Generación de imágenes interactiva en local sobre Mac: gracias a los 0,70–0,95 s a 512² y 2,8–2,9 s a 1024² en un M5 Max, permite iterar prompts en tiempo casi real sin depender de la nube.
- Prototipado rápido de conceptos visuales: útil en estudios de diseño que necesiten explorar variaciones de una idea con latencia baja y sin coste por API.
- Aplicaciones creativas en tiempo real: al requerir un solo paso, encaja en interfaces donde el usuario modifica el prompt y ve el resultado de forma casi inmediata.
- Generación por lotes en hardware de Apple: el throughput superior frente al modelo de 4 pasos (aproximadamente 2,2–2,8 veces más rápido según resolución) reduce el coste de producir grandes volúmenes de imágenes.
- Integración en plugins de escritorio: el modelo se expone como `klein-4b-rdm` en el plugin `gaea-plugin-flux2-klein`, lo que facilita su uso dentro de aplicaciones macOS nativas.
- Investigación en destilación de modelos de difusión: sirve como referencia reproducible para estudiar RDM y comparar calidad frente al modelo base de 4 pasos con el mismo encoder y VAE.
- Generación de ilustraciones para documentación técnica o material divulgativo donde la latencia importa más que la fidelidad tipográfica perfecta.

## Benchmarks y rendimiento

Datos medidos por el autor de la conversión en Apple M5 Max, bf16, en caliente, frente a FLUX.2 [klein] 4B con sus 4 pasos destilados, mismo encoder y VAE:

| Métrica | Este modelo (1 paso) | FLUX.2 [klein] 4B (4 pasos) |
|---|---|---|
| Latencia 512² | 0,70–0,95 s | 1,97–2,46 s |
| Latencia 1024² | 2,8–2,9 s | 6,5–6,6 s |
| SigLIP2 calidad de imagen (prompts propios) | 0,903 | 0,903 |
| SigLIP2 calidad de imagen (prompts difíciles) | 0,862 | 0,866 |
| Keyword recall (prompts propios) | 1,00 | 1,00 |
| Keyword recall (prompts difíciles) | 0,94 | 0,89 |
| GenEval (cifra de los autores) | 0,826 | no disponible |

Nota: el dato de GenEval (0,826) está parcialmente dentro de la distribución de entrenamiento, ya que aproximadamente el 17,6 % de los prompts de GenEval aparecen en el pool de entrenamiento del modelo fuente, según la model card original.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 16,0 GB en bf16, por lo que se recomienda al menos 16 GB de memoria unificada, y preferiblemente 24 GB o más para trabajar con margen.
- GPU recomendadas: Apple Silicon de gama alta (M5 Max medido por el autor; se espera comportamiento similar en M4 Max, M3 Max y M2 Ultra, aunque no hay mediciones publicadas para esos chips).
- No está pensado para GPU NVIDIA: la conversión es específica de MLX y del port Swift MLXKlein.
- Cabe en equipos consumer de Apple con memoria unificada suficiente; no aplica a GPUs consumer de NVIDIA en este formato.
- Opciones de despliegue: MLX con el paquete Swift `MLXKlein` (configuración `KleinConfiguration` con `defaultSteps: 1` y `guidanceScale: 1.0`), o a través del plugin `gaea-plugin-flux2-klein` en la aplicación Gaea.
- Latencia y throughput: 0,70–0,95 s por imagen a 512² y 2,8–2,9 s a 1024² en M5 Max en caliente; no se han publicado cifras de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-1step-RDM-bf16 (este) | 4B DiT + Qwen3-4B | 1 | 512²/1024² | Apache-2.0 | MLX, repo de 16 GB |
| FLUX.2 [klein] 4B (mlx-community/FLUX.2-klein-4B-bf16) | 4B DiT + Qwen3-4B | 4 | 512²/1024² | Apache-2.0 | MLX |
| epfl-vita/flux2-klein-1step-rdm (modelo fuente) | 4B DiT | 1 | 512² (entrenamiento) | Apache-2.0 | safetensors en layout BFL |
| Otros modelos de difusión one-step de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación principal es contra el modelo base de 4 pasos, del que hereda encoder, VAE y scheduler: la variante RDM reduce el número de pasos de 4 a 1 con una calidad SigLIP2 prácticamente idéntica y un keyword recall igual o superior en prompts difíciles.

## Limitaciones y advertencias

- Solo text-to-image: no acepta imagen de entrada ni otras modalidades.
- Sin CFG: los negative prompts no tienen efecto, lo que limita el control fino sobre el resultado.
- Menor fiabilidad en el deletreo de texto dentro de la imagen en prompts difíciles respecto al modelo de 4 pasos.
- El dato de GenEval (0,826) está inflado por contaminación: aproximadamente el 17,6 % de los prompts de GenEval están en el pool de entrenamiento del modelo fuente.
- Entrenado y evaluado a 512²; el rendimiento a 1024² es bueno según el autor de la conversión, pero no procede de una evaluación formal de los autores originales.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusión: no se documentan análisis de sesgo en la información disponible.
- Idiomas soportados no documentados; el comportamiento multilingüe del codificador Qwen3-4B no se ha evaluado en esta ficha.
- Licencia Apache-2.0 permite uso comercial, pero los pesos RDM son obra de sus autores (Lan Feng, Wuyang Li, Éloi Zablocki, Matthieu Cord, Alexandre Alahi, EPFL VITA) y derivan de FLUX.2 [klein] 4B de Black Forest Labs; conviene conservar `LICENSE` y `NOTICE`.
- Dependencia del ecosistema Apple: la conversión es específica de MLX y del port Swift, por lo que no es portable directamente a otros runtimes sin reconversión.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/FLUX.2-klein-4B-1step-RDM-bf16
- Modelo fuente: https://huggingface.co/epfl-vita/flux2-klein-1step-rdm
- Modelo base FLUX.2 [klein] 4B en MLX: https://huggingface.co/mlx-community/FLUX.2-klein-4B-bf16
- Artículo RDM: https://arxiv.org/abs/2607.02375
- Código Swift/MLX: https://github.com/xocialize/flux2-klein-swift
- Plugin Gaea: https://github.com/xocialize-code/gaea-plugin-flux2-klein
