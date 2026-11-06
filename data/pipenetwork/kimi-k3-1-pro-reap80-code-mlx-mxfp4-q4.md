# pipenetwork/Kimi-K3.1-Pro-REAP80-code-MLX-mxfp4-q4

## Resumen

Kimi-K3.1-Pro-REAP80-code-MLX-mxfp4-q4 es una conversión a MLX del modelo Moonshot AI Kimi-K3.1-Pro, sometida a una poda de expertos mediante la técnica REAP (saliencia `gate x ||expert_output||`) sobre un corpus de calibración con un 60% de código. El resultado conserva 179 de los 896 expertos enrutados por capa MoE (92 capas), mantiene el top-16 de enrutamiento y deja intactos los 2 expertos compartidos, lo que reduce el peso del modelo hasta unos 300 GiB para que quepa en una máquina Apple Silicon de 512 GB. Los expertos supervivientes son una copia byte a byte de los pesos MXFP4 originales de Moonshot; el resto de tensores (atención, expertos compartidos, proyecciones latentes, MLP denso de la capa 0, embeddings y `lm_head`) se cuantizan en 4 bits afín con grupo de 64.

El modelo base emplea una arquitectura con Kimi Delta Attention, MLA con compuerta y un indexador DSA, Attention Residuals y MoE latente, y ocupa 1,56 TB en su versión original. Esta ficha corresponde al nivel q4, que el propio autor describe como la variante rápida y con pérdida: la cuantización a 4 bits de los pesos no-expertos incrementa la perplejidad un 53,7% frente a q8, por lo que se publica para quienes necesitan la opción más pequeña y veloz, no como build de calidad.

La relevancia de esta conversión es de nicho: permite ejecutar un modelo de 600.837 millones de parámetros totales en hardware de consumo profesional Apple (M3 Ultra de 512 GiB) a costa de una degradación medible en calidad, especialmente fuera de código. No hay resultados de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Kimi Delta Attention, MLA con compuerta e indexador DSA, Attention Residuals y MoE latente (arquitectura `kimi_k31`, custom code) |
| Parámetros totales | 600.837.048.660 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (expertos enrutados, copia byte a byte del original) + afín 4 bits grupo 64 (resto de pesos); indexador DSA y normas/routers en bf16/f32 |
| Idiomas soportados | no disponible (corpus de calibración con inglés y chino) |
| Licencia | kimi-k3.1-pro (otra, con condiciones para uso comercial a gran escala) |
| Formato de pesos | safetensors (MLX), shards alineados a 16 bytes |

## Arquitectura y entrenamiento

El modelo base Kimi-K3.1-Pro de Moonshot AI combina atención con decaimiento tipo Delta, MLA con compuerta y un indexador DSA (DeepSeek Sparse Attention, por las siglas de sus tensores `wq_b`, `wk` y `weights_proj`), además de Attention Residuals y una capa MoE latente. Sobre esa base, esta conversión aplica una poda REAP con calibración ponderada hacia código: se conservan 179 de 896 expertos enrutados por capa en las 92 capas MoE, con el top-16 de enrutamiento sin cambios y los 2 expertos compartidos intactos. Los expertos que sobreviven no se recuantizan: son una copia exacta de los pesos MXFP4 de Moonshot, ya que MLX usa la misma codificación.

El resto de componentes se cuantiza en 4 bits afín con grupo de 64, mientras que el indexador DSA y las normas y routers se mantienen en bf16/f32 de forma deliberada, porque el error del indexador solo se manifiesta más allá de 2048 tokens y no aparecería en evaluaciones cortas. El flujo residual se mantiene en float32 desde la primera capa MoE en adelante, igual que en el cargador de referencia. No se dispone de datos sobre el número de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO en su pipeline.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, `conversational`).
- Generación de código: el corpus de calibración es 60% código, y el autor valida la continuación greedy de funciones Python.
- Razonamiento: el modelo produce trazas de razonamiento, aunque el autor documenta un fallo concreto (17 × 23 resuelto como 323 en el build q6).
- Capacidades multimodales: los ficheros de visión se incluyen en el repo, pero no se han validado; solo se probó la ruta de texto.
- Soporte de tool calling: la plantilla de chat incluida solo reproduce mensajes system/user/assistant simples; las llamadas a herramientas y las imágenes no están cubiertas por ella.
- Capacidades multilingües: no documentadas; el corpus de calibración incluye inglés y chino.
- No se documenta un modo de pensamiento explícito ni decodificación especulativa.

## Casos de uso

- Desarrollo de código en local sobre Mac: el modelo permite autocompletar y generar funciones Python en una máquina Apple Silicon de 512 GB sin depender de la nube, aprovechando que la calibración REAP está ponderada hacia código.
- Prototipado de pipelines de generación de código en MLX: sirve para validar integraciones con `mlx-lm` y el cargador `kimi_k31.py` antes de pasar a un build de mayor precisión como q6.
- Experimentación con poda de expertos: útil como referencia práctica de cómo afecta REAP al 20% de expertos a la perplejidad y a la calidad en tareas de código.
- Evaluación de cuantización en Apple Silicon: permite medir el impacto real de q4 frente a q8 (53,7% de perplejidad adicional) en un modelo de 600.000 millones de parámetros.
- Investigación sobre atención dispersa: al mantener el indexador DSA en bf16/f32, es adecuado para estudiar el comportamiento de atención más allá de 2048 tokens en un entorno MLX.
- Pruebas de despliegue en hardware de consumo profesional: sirve para validar límites de memoria (`iogpu.wired_limit_mb`) y throughput (~6,96 tok/s con `mlx-lm`) en un M3 Ultra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta perplejidad en ventana retenida de 2048 tokens con bootstrap emparejado:

| Precisión no-experta | Perplejidad global | Frente a q8 |
|---|---|---|
| q8 | 5,725 | línea base |
| q6 | 5,736 | +0,2% (código +0,0 a 0,1%) |
| q4 | 8,81 | +53,7% (Python +44%, code-multi +17%) |

Rendimiento medido en un M3 Ultra de 512 GiB:

| Ruta de ejecución | Decodificación | Notas |
|---|---|---|
| `mlx-lm` (`mlx_lm.generate`) | ~6,96 tok/s | prefill no disponible |
| Motor Metal nativo (pipefold, no publicado) | ~8,75 tok/s | prefill ~60 tok/s |

## Requisitos de hardware

- VRAM/espacio en disco: el repo ocupa 321,9 GB; el autor indica unos 300 GiB de pesos para cargar en una máquina de 512 GB.
- Cada token decodificado lee aproximadamente 70-85 GB de pesos (unos 26 GB de expertos enrutados más todos los tensores no-expertos), por lo que la decodificación está limitada por ancho de banda de memoria.
- GPU recomendadas: Apple Silicon de 512 GB (M3 Ultra validado). No se documenta soporte para A100, H100 ni RTX 4090, y el formato MLX no es portable a CUDA sin conversión.
- En GPU de consumo tipo RTX 4090 (24 GB) no cabe ni en esta versión podada.
- Despliegue: `mlx-lm` con `--trust-remote-code` y el cargador `kimi_k31.py` incluido; es necesario elevar el límite de memoria cableada (`sudo sysctl iogpu.wired_limit_mb=480000`).
- Latencia y throughput: ~6,96 tok/s de decodificación con `mlx-lm` y ~8,75 tok/s con el motor nativo; prefill ~60 tok/s en el motor nativo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-REAP80-code-MLX-mxfp4-q4 (este) | 600.837.048.660 | no disponible | kimi-k3.1-pro | safetensors MLX | público en HF, 0 descargas |
| Kimi-K3.1-Pro (base, Moonshot AI) | no disponible (1,56 TB en pesos) | no disponible | kimi-k3.1-pro | safetensors | público en HF |
| Kimi-K3-REAP80-MLX-mxfp4-q8 (pipenetwork) | no disponible | no disponible | kimi-k3 | safetensors MLX | público en HF, 14 likes |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- q4 es la variante con pérdida: +53,7% de perplejidad frente a q8, con +44% en Python y +17% en code-multi. El autor recomienda q6 salvo que la memoria o la velocidad obliguen.
- Poda agresiva: top-16 de 179 expertos por capa; se espera degradación real frente al modelo completo, especialmente fuera de código.
- El autor documenta un fallo de razonamiento en el build q6 (17 × 23 respondido como 323); hay que verificar cualquier resultado que importe.
- Solo se validó la ruta de texto; los ficheros de visión se incluyen pero no se probaron.
- La plantilla de chat no cubre llamadas a herramientas ni imágenes.
- La memoria pico crece con el contexto; hay que probar las prompts más largas antes de fiarse.
- Licencia kimi-k3.1-pro con condiciones para uso comercial a gran escala: acuerdo separado por encima de 20 millones USD en 12 meses para negocios de Model-as-a-Service, y exhibición destacada de "Kimi K3.1-Pro" por encima de 100 millones de MAU o 20 millones USD/mes.
- La arquitectura `kimi_k31` no está en upstream de MLX; requiere `trust-remote-code` y copiar el cargador manualmente.
- Riesgo de sesgos y alucinación: no documentado en la información disponible.
- Idiomas soportados no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipenetwork/Kimi-K3.1-Pro-REAP80-code-MLX-mxfp4-q4
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Build q8 relacionado: https://huggingface.co/pipenetwork/Kimi-K3-REAP80-MLX-mxfp4-q8
- README del build q8: https://huggingface.co/pipenetwork/Kimi-K3-REAP80-MLX-mxfp4-q8/blob/main/README.md
