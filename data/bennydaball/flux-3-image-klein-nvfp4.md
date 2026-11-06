# BennyDaBall/flux-3-image-klein-NVFP4

## Resumen

FLUX 3 Image Klein NVFP4 (build de BennyDaBall) es una cuantización mixta de FLUX 3 Image Klein, el modelo de difusión texto-a-imagen destilado de 16 pasos de Black Forest Labs. El autor redistribuye los pesos en un único archivo safetensors para ComfyUI combinando capas NVFP4 (W4A4), capas INT8 en formato ConvRot y capas pequeñas en bf16, con el objetivo de reducir el peso en disco y el tiempo de inferencia frente a las versiones oficiales sin degradar en exceso la fidelidad respecto al modelo BF16 de referencia.

El interés de esta ficha es práctico: documenta una alternativa comunitaria a los archivos cuantizados oficiales de BFL, con métricas de fidelidad (LPIPS, SSIM), velocidad y VRAM medidas sobre una RTX 5090. La cuantización NVFP4 requiere hardware Blackwell para aprovechar la aceleración FP4, lo que limita su uso a RTX 50 series y RTX PRO Blackwell.

No se dispone de información sobre la arquitectura interna del modelo base más allá de que es un transformer de difusión (DiT) destilado en 16 pasos, ni del número de parámetros, contexto o datos de entrenamiento. Esta ficha refleja únicamente los datos publicados por el autor de la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) destilado, 16 pasos; detalles internos no disponibles |
| Parámetros totales | no disponible (172 capas cuantizadas; 0,94B pesos en NVFP4, aprox. 18%) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: NVFP4 (W4A4, escalas de activación estáticas) + INT8 ConvRot + bf16 en capas de embedding y modulación |
| Idiomas soportados | en |
| Licencia | flux-kommunity-license (license: other) |
| Formato de pesos | safetensors, archivo único para ComfyUI (`diffusion-single-file`) |
| Tamaño del repo | 5,4 GB |
| Tamaño del archivo de pesos | 5,41 GB |
| Text encoder | `qwen3vl_4b_bf16` (no incluido en este repo) |
| VAE | no incluido en este repo (el mismo que el workflow stock de Klein) |
| Hardware requerido para FP4 | NVIDIA Blackwell (RTX 50 series / RTX PRO Blackwell) |

## Arquitectura y entrenamiento

El modelo base es FLUX 3 Image Klein en variante destilada de 16 pasos, un transformer de difusión que, según la model card, funciona como flow map: cada llamada al transformer, incluidos los bloques de texto, está condicionada por la sigma del siguiente paso del sampler. Esta característica condiciona el proceso de calibración de la cuantización, que registra las trayectorias del propio modelo.

La cuantización se construye en tres niveles. Las capas NVFP4 (19 de las 172 capas cuantizadas, 0,94B pesos, aprox. 18%) se resuelven con GPTQ y una búsqueda de escalas de bloque denominada Schur Replay, con ventana de replay de 8 y un conjunto de candidatos que incluye los puntos Four Over Six bajo la escala global 4/6. Las capas sensibles permanecen en INT8 en el formato ConvRot de BFL, recuantizadas desde BF16 con GPTQ en la base rotada, eligiendo la escala de cada fila con el mismo criterio de Schur Replay, lo que según el autor reduce unas 10 veces el error de pesos de esas capas frente a round-to-nearest. Las capas pequeñas de embedding y modulación se mantienen en bf16. La selección de qué capas quedan en 8 bits se hizo por daño medido por milisegundo a partir de escaneos de sensibilidad por capa sobre captions de validación, con el presupuesto fijado para mantener al menos un 4% de ventaja de velocidad frente a INT8. Veinte capas de 8 bits que el pipeline texto-a-imagen nunca ejecuta conservan los bytes originales de BFL porque la calibración no las alcanza.

## Capacidades

- Generación de texto a imagen en un único archivo compatible con ComfyUI, con el workflow stock de Klein sin cambios salvo el nombre del archivo del modelo.
- Renderizado a 1024x1024 y a resoluciones panorámicas como 1936x1088 (16:9), según los ejemplos publicados.
- Generación de texto legible dentro de la imagen: el autor reporta 76 de 78 cadenas correctas en su prueba de lectura ciega, frente a 77/78 de BF16 e INT8 y 76/78 de la NVFP4 oficial.
- Inferencia en 16 pasos con CFG 1 y sampler euler/simple, configuración destilada del modelo base.
- Aceleración FP4 en GPUs Blackwell; en hardware sin soporte NVFP4 las capas FP4 no obtienen la ventaja de velocidad indicada.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modos de razonamiento: es un modelo exclusivamente texto-a-imagen.
- Soporte lingüístico declarado: inglés (`en`).

## Casos de uso

- Generación de imágenes en producción con ComfyUI: sustituir el archivo BF16 por este safetensors en el nodo Load Diffusion Model reduce el peso en disco de 11,10 GB a 5,41 GB y el tiempo por imagen de 3,397 s a 1,590 s en RTX 5090, con el mismo grafo y sampler.
- Iteración rápida de prompts: con 1,590 s por render a 1024x1024 y 16 pasos en RTX 5090, permite explorar decenas de variaciones de caption y semilla en pocos minutos manteniendo una fidelidad LPIPS de 0,049 frente a BF16.
- Despliegue en GPUs de 16 GB: el pico de VRAM medido es de 16,2 GiB incluyendo unos 3,3 GiB de uso de escritorio, frente a 20,8 GiB del BF16, lo que hace viable el modelo en tarjetas donde la versión completa no entra.
- Tuberías de imagen con texto integrado: adecuado para carteles, etiquetas o rótulos donde la legibilidad importa, dado el rendimiento reportado en la prueba de lectura de cadenas (76/78).
- Prototipado de producto y mockups en formato panorámico: los ejemplos a 1936x1088 con LPIPS medio de 0,050 sobre 9 renders muestran que la pérdida de fidelidad se mantiene contenida fuera de la resolución nativa.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el compromiso entre tamaño, velocidad y fidelidad frente a INT8 ConvRot y NVFP4 oficiales en un mismo equipo y grafo.
- Sustitución directa en flujos existentes de Klein: al conservar el mismo text encoder, VAE y ajustes de sampler, se puede integrar sin reentrenar ni recalibrar el pipeline.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en RTX 5090 con ComfyUI 0.43.0, comfy-kitchen 0.2.40, torch 2.14.0 + CUDA 13.0, atención int8 de Comfy Kitchen, 1024x1024, 16 pasos, CFG 1, euler/simple y shift 2,77259. La fidelidad se evalúa sobre 96 renders (16 captions x 6 semillas) comparados con el render BF16 de misma caption y semilla.

| Archivo | Tamaño | LPIPS vs BF16 (media / mediana) | SSIM | s/imagen | VRAM pico (GiB) |
|---|---:|---:|---:|---:|---:|
| BF16 (BFL) | 11,10 GB | referencia | 1 | 3,397 | 20,8 |
| INT8 ConvRot (BFL) | 5,83 GB | 0,026 / 0,018 | 0,956 | 1,656 | 16,5 |
| NVFP4 (BFL) | 5,28 GB | 0,142 / 0,122 | 0,785 | 1,725 | 16,3 |
| NVFP4 (este repo) | 5,41 GB | 0,049 / 0,034 | 0,923 | 1,590 | 16,2 |

- Este build es más cercano a BF16 que la NVFP4 oficial en 94 de 96 imágenes (LPIPS medio 2,9 veces menor, mediana 3,6 veces menor).
- INT8 ConvRot es más cercano a BF16 que este build en 88 de 96 imágenes.
- Velocidad: 4,0% más rápido que INT8 ConvRot y 7,8% más rápido que la NVFP4 de BFL; esta última resulta un 4,2% más lenta que INT8 en este equipo porque mantiene algunas capas grandes en bf16.
- Texto: 26 cadenas entrecomilladas x 3 semillas, lectura ciega. BF16 77/78, INT8 77/78, este build 76/78, NVFP4 de BFL 76/78. Todos fallan una "i" estilizada de tiza que BF16 también dibuja mal; el segundo fallo de este build es una ventana de fecha de reloj que muestra "4" en lugar de "14" en una semilla.
- Conjunto showcase (3 captions x 3 semillas a 1936x1088): LPIPS medio 0,050 para este build, 0,030 para INT8 y 0,157 para la NVFP4 de BFL.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo de generación de imagen.

## Requisitos de hardware

- VRAM estimada: 16,2 GiB de pico en RTX 5090 con 1024x1024 y 16 pasos, incluyendo unos 3,3 GiB de uso de escritorio; el consumo propio del modelo ronda los 12-13 GiB en ese escenario.
- GPU recomendadas: NVIDIA Blackwell (RTX 50 series, RTX PRO Blackwell) para aprovechar la aceleración FP4; en GPUs sin soporte NVFP4 las capas FP4 no rinden como indica la tabla.
- Cabe en GPU de consumo: sí, en RTX 5090 según las mediciones del autor; no hay datos publicados para otras tarjetas de consumo.
- Despliegue: ComfyUI 0.43.0 con comfy-kitchen 0.2.40, torch 2.14.0 + CUDA 13.0 y el flag `--use-ck-attention`. El archivo se coloca en `ComfyUI/models/diffusion_models/` y se selecciona en el nodo Load Diffusion Model con `weight_dtype` en default.
- Dependencias del pipeline: text encoder `qwen3vl_4b_bf16` y el VAE del workflow stock de Klein, no incluidos en este repositorio.
- Latencia y throughput: 1,590 s por imagen a 1024x1024 y 16 pasos en RTX 5090 (mediana en caliente de 5 ejecuciones tras una ejecución en frío). No hay datos de throughput por lotes ni de otras GPUs.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI; el formato es específico de ComfyUI.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Fidelidad vs BF16 (LPIPS medio) | Velocidad (s/imagen, RTX 5090) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| FLUX 3 Image Klein BF16 (BFL) | Referencia sin cuantizar | 11,10 GB | referencia | 3,397 | flux-kommunity-license | Hugging Face (BFL) |
| FLUX 3 Image Klein INT8 ConvRot (BFL) | Cuantización INT8 oficial | 5,83 GB | 0,026 | 1,656 | flux-kommunity-license | Hugging Face (BFL) |
| FLUX 3 Image Klein NVFP4 (BFL) | Cuantización NVFP4 oficial | 5,28 GB | 0,142 | 1,725 | flux-kommunity-license | Hugging Face (BFL) |
| FLUX 3 Image Klein NVFP4 (este repo) | Cuantización mixta comunitaria | 5,41 GB | 0,049 | 1,590 | flux-kommunity-license | Hugging Face (BennyDaBall) |

El compromiso que ofrece este build es intermedio en fidelidad: queda por detrás de INT8 ConvRot en parecido con BF16, pero por delante de la NVFP4 oficial y con la menor latencia de los cuatro archivos en el equipo de prueba. No se dispone de comparación con otros modelos de difusión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La ventaja de velocidad depende de hardware Blackwell; en GPUs sin soporte NVFP4 las capas FP4 no se aceleran y el balance frente a INT8 puede cambiar.
- La fidelidad es inferior a INT8 ConvRot en 88 de 96 imágenes de la prueba del autor; si la prioridad es máxima cercanía a BF16, INT8 es la opción indicada por los propios datos.
- Los benchmarks son de un único equipo (RTX 5090), un único grafo y una sola sesión de medición; no hay validación independiente ni resultados en otras GPUs.
- La prueba de texto se basa en 26 cadenas y dos lectores ciegos; es una muestra pequeña y no cubre todos los idiomas ni estilos tipográficos.
- Idioma declarado únicamente inglés (`en`); no se documenta comportamiento en otros idiomas.
- Riesgo de alucinación visual y de artefactos propio de los modelos de difusión, agravado por la cuantización: la NVFP4 oficial muestra un SSIM de 0,785 frente a BF16, y este build de 0,923, lo que implica desviaciones medibles respecto al original.
- Veinte capas de 8 bits que el pipeline texto-a-imagen no ejecuta conservan los bytes de BFL; no se han recuantizado ni validado.
- Licencia `flux-kommunity-license`: es necesario revisar `LICENSE.md` en el repositorio antes de cualquier uso comercial, ya que impone condiciones específicas de la comunidad FLUX.
- El repositorio no incluye text encoder ni VAE; hay que obtenerlos por separado y respetar sus licencias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día: no hay evidencia de uso en producción ni de validación por terceros.
- Los artículos citados (arXiv 2609.36654 y arXiv 2512.02010) evalúan modelos de lenguaje; su aplicación a un DiT es una integración propia del autor y no está validada de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BennyDaBall/flux-3-image-klein-NVFP4
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Paper Schur Replay: https://arxiv.org/abs/2609.36654
- Paper Four Over Six (MIT Han Lab y NVIDIA): https://arxiv.org/abs/2512.02010
- Licencia: LICENSE.md en el repositorio de Hugging Face
