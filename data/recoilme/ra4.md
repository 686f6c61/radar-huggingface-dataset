# recoilme/ra4

## Resumen

ra4-218M es un modelo de difusión latente texto-a-imagen de pequeña escala (217,7 M de parámetros) desarrollado por el usuario recoilme y publicado en Hugging Face. Emplea una arquitectura UDiT (UNet híbrida con transformer) organizada en una pirámide de tres niveles de tokens, con transporte rectified flow y predicción directa del latente limpio (x-prediction). El modelo genera imágenes de 512² a partir de latentes VAE de 256², con un coste computacional de 86,5 GFLOP por forward.

El modelo resuelve el problema de disponer de un generador texto-a-imagen ligero y entrenable en hardware de consumo: se entrenó en una única RTX 4080 de 16 GB a 222 ms por paso. Su relevancia radica en el diseño eficiente de la pirámide de tokens (51 %/34 %/15 % de FLOPs por nivel), el uso de un codificador de texto congelado LongCLIP-L y un entrenamiento de solo 17 500 pasos sobre latentes de FLUX-Reason-6M.

Aun así, se trata de un modelo en fase experimental y presupuestaria: las imágenes son reconocibles respecto al prompt pero blandas en detalles finos, y el propio autor indica que la licencia de publicación está pendiente de decidir. No dispone de descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UDiT (UNet + transformer) con pirámide de tres niveles de tokens, rectified flow con x-prediction |
| Parámetros totales | 217,7 M (217,1 M cuerpo + 0,59 M adaptador de texto + null-token de 768 dims) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 tokens de texto (LongCLIP-L, 248 posiciones) |
| Tipos de cuantización | no disponible (pesos publicados en fp16; VAE en fp32) |
| Idiomas soportados | no disponible (el encoder de texto es CLIP, predominantemente inglés) |
| Licencia | no disponible (sin licencia seleccionada por el autor) |
| Formato de pesos | safetensors (diffusers); transformer fp16 de 416 MB, repo total de 1,25 GB |

## Arquitectura y entrenamiento

El cuerpo del modelo es un UDiT con tres niveles de resolución de tokens. La imagen de 256² se comprime a un latente VAE de 32×32×32 (compresión 8) y se organiza en tres niveles: L0 (32×32, 1024 tokens, anchura 448, 7 cabezas), L1 (16×16, 256 tokens, anchura 896, 14 cabezas) y L2 (8×8, 64 tokens, anchura 1792, 28 cabezas, cuello de botella). Las anchuras son deliberadamente mayores que las de SDXL (320/640/1280) porque el latente de 32 canales contiene ocho veces más información por posición que uno de 4 canales. Cada bloque combina depthwise 3×3 + MLP×2 o atención (completa o de ventana) + MLP×2, con un ada propio por bloque (shift, scale y gate sobre la rama, entrada el embedding de t); el último ada y la capa out se inicializan a cero, de modo que en el paso 0 el cuerpo es la identidad. Hay cross-attention al texto en todos los bloques, QK-norm y RoPE 2D (rejilla de ventana en las ventanas). Las ventanas son de 8×8 con desplazamiento cíclico de media ventana entre bloques; la reducción usa space-to-depth (2×2 sin pérdidas) y la expansión pixel-shuffle, con un PE de nivel añadido una vez y skips con gate aprendible.

El path de texto usa LongCLIP-L congelado (248 posiciones, ventana de 192 tokens) codificando `hidden_states[-2]` + `final_layer_norm`; la parte entrenable es un adaptador por token (LayerNorm + residual lineal con init cero) y las proyecciones K/V. No hay pooling de texto en adaLN. Los datos de entrenamiento son latentes de FLUX-Reason-6M a 256 px, 100 000 registros con leyendas largas (~127 tokens) y filtro CLIP ≥ 0,28; el encoder VAE coincide bit a bit con el oficial de FLUX.2 (106/106 tensores), lo que permite conversión exacta de latentes. Se entrenó 17 500 pasos con batch 16, lr 2e-4 cosine, warmup 500, drop-text 10 %, t ~ logit-normal con shift 0,3 y pérdida MSE sobre la velocidad derivada de la predicción de x. Hardware: una RTX 4080 (16 GB), 222 ms/paso, ~70 imágenes/s.

## Capacidades

- Generación texto-a-imagen de 512² a partir de prompts en inglés, con latentes de entrada de 256².
- Control de fidelidad al prompt mediante CFG (escala recomendada 1,0–2,0) y shift del muestreo (0,3).
- Cross-attention al texto en todos los bloques, con adaptador de texto entrenable sobre LongCLIP-L congelado.
- Inferencia en fp16 con 86,5 GFLOP por forward, adecuada para hardware de consumo.
- Código de entrenamiento, muestreo, evaluación y conversión de datos incluido en el mismo repositorio.
- No dispone de tool calling, function calling, agentes, visión de entrada, audio ni modo thinking (es un modelo puramente generativo de imagen).
- Capacidades multilingües no disponibles: el encoder CLIP está orientado a inglés y el autor no declara idiomas soportados.

## Casos de uso

- Prototipado rápido de ilustraciones: con 217,7 M de parámetros y 416 MB en fp16, el modelo se carga y ejecuta en una GPU de consumo para iterar sobre prompts en segundos, útil para explorar conceptos antes de pasar a un modelo mayor.
- Generación de imágenes de fondo para interfaces y demos: la salida de 512² y el bajo coste por forward (86,5 GFLOP) permiten generar banners y fondos en lote dentro de pipelines de CI o scripts de build.
- Investigación en difusión eficiente: el código de entrenamiento incluido (17 500 pasos, batch 16, x-prediction) sirve para reproducir experimentos de rectified flow y arquitecturas piramidales en una sola RTX 4080.
- Ajuste fino sobre dominios concretos: al entrenarse en 8 pares el modelo reproduce con cos 1,00, es viable para especializar el generador en un estilo o catálogo reducido con pocos datos.
- Educación y docencia: la implementación autocontenida (modelo, sampler, VAE adapter, conversión de latentes FLUX.2) permite explicar paso a paso el pipeline de difusión latente sin dependencias pesadas.
- Generación de bocetos para revisión humana: las imágenes son reconocibles por prompt aunque blandas en detalles, lo que encaja en flujos donde un artista pule el resultado posteriormente.
- Pruebas de integración con diffusers: al publicarse en formato diffusers con safetensors, se puede validar el pipeline text-to-image en entornos de test sin coste de GPU dedicada.

## Benchmarks y rendimiento

| Métrica | Valor | Referencia |
|---|---|---|
| MSE por x, t<0,3 | 0,671 | 1,592 con «no cambiar nada» |
| MSE por x, 0,3–0,7 | 0,232 | 0,580 con «no cambiar nada» |
| MSE por x, t>0,7 | 0,041 | 0,073 con «no cambiar nada» |
| `gain` (aporte de la leyenda), t<0,3 | +4,8 % | — |
| `delta` (leyenda propia frente a ajenas) | −0,016 a t=0,2 (10σ); leyenda propia mejor en 100 % de las imágenes | — |

Medición sobre 48 pares reservados. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, FID, CLIP score) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: transformer fp16 de 416 MB + VAE fp32 de 366 MB + LongCLIP-L de 470 MB, en torno a 1,3 GB de pesos; con activaciones y batch pequeño cabe holgadamente en GPUs de 8 GB o menos.
- GPU recomendadas: RTX 4080 (16 GB) fue la usada para entrenar (222 ms/paso); RTX 4090, A100 y H100 sobran para inferencia. Cualquier GPU consumer con al menos 4–6 GB debería bastar para una imagen de 512².
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores.
- Opciones de despliegue: librería diffusers (pipeline text-to-image) y scripts propios del repositorio (`src/sample.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión).
- Latencia y throughput: ~70 imágenes/s durante el entrenamiento en RTX 4080 con batch 16; 24 pasos de muestreo por defecto en el ejemplo del autor. Latencia de inferencia individual no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto texto | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ra4-218M | 217,7 M | 192 tokens | 512² (desde latente 256²) | no disponible | Hugging Face, 0 descargas |
| SDXL | ~2,6 B (UNet) | 77 tokens (CLIP) | 1024² | CreativeML Open RAIL++-M | ampliamente disponible |
| SD 1.5 | ~860 M (UNet) | 77 tokens | 512² | CreativeML Open RAIL-M | ampliamente disponible |
| FLUX.1-schnell | ~12 B | 256 tokens (T5) | hasta 1024²+ | Apache 2.0 | ampliamente disponible |

ra4-218M es entre 4 y 50 veces más pequeño que estos modelos, con menor resolución nativa y sin benchmarks estándar publicados; su ventaja es el coste de entrenamiento e inferencia en hardware de consumo, no la calidad final.

## Limitaciones y advertencias

- Entrenado solo 17 500 pasos: las imágenes son reconocibles por prompt pero blandas y «flotan» en detalles finos; es un presupuesto de pasos deliberado.
- CFG recomendado entre 1,0 y 2,0; por encima de 3 aparece sobresaturación porque la rama vacía se entrenó con solo el 10 % de los ejemplos.
- El lado de la imagen de entrada debe ser múltiplo de 64 (ventana 8×8 sobre rejilla 32×32); solo se entrenó a 256 px.
- Licencia sin seleccionar: no hay autorización explícita para uso comercial ni para redistribución; el autor indica que lo decide el propietario.
- Idiomas no declarados; el encoder CLIP favorece el inglés y no hay evaluación multilingüe.
- Riesgo de alucinación visual: al ser un modelo de difusión, puede generar contenido no solicitado o incoherente en detalles, especialmente con prompts ambiguos.
- Sesgos no evaluados: no se documentan análisis de sesgo demográfico, cultural o de seguridad.
- Sin benchmarks estándar (FID, CLIP score) ni comparación pública con modelos de referencia; las métricas reportadas son MSE internas sobre 48 pares.
- El repositorio incluye el VAE en fp32 (366 MB), lo que aumenta el peso total frente al transformer; conviene planificar el almacenamiento (1,25 GB).

## Enlaces

- Hugging Face: https://huggingface.co/recoilme/ra4
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Muestras del modelo: https://huggingface.co/recoilme/ra4/blob/main/samples/grid.png
- Código de muestreo: https://huggingface.co/recoilme/ra4/blob/main/src/sample.py
- Código de entrenamiento: https://huggingface.co/recoilme/ra4/blob/main/src/train.py
- Conversión de latentes FLUX.2: https://huggingface.co/recoilme/ra4/blob/main/src/from_flux2.py
- Evaluación: https://huggingface.co/recoilme/ra4/blob/main/src/eval.py
- Pesos del transformer: https://huggingface.co/recoilme/ra4/tree/main/transformer
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
