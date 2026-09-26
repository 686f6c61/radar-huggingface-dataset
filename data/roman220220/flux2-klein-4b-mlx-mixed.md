# roman220220/flux2-klein-4b-mlx-mixed

## Resumen

`roman220220/flux2-klein-4b-mlx-mixed` es una cuantificación GPTQ de 4 bits del modelo de generación y edición de imágenes FLUX.2 klein 4B de Black Forest Labs, empaquetada específicamente para Apple Silicon y la librería mflux. No es un modelo nuevo: es un checkpoint derivado que reempaqueta el transformer de difusión (3,9 mil millones de parámetros) y el codificador de texto Qwen3-4B en precisiones mixtas optimizadas para ejecutarse en memoria unificada de Macs.

El problema que resuelve es de despliegue: el original en bf16 ocupa unos 16 GB en disco, mientras que esta versión ocupa 5,3 GB y permite generación texto-a-imagen en 4 pasos con un pico de memoria de ~7,3 GB a 1024², y edición guiada por instrucción con una imagen de referencia con un pico de ~9,4 GB. Esto lo hace viable en un Mac de 16 GB, un segmento donde los modelos de difusión de alta calidad rara vez caben.

La relevancia técnica está en cómo se cuantizó: en lugar de un redondeo simple (RTN), se aplicó GPTQ con corrección de Hessiana calibrado sobre el bucle real de denoising de 4 pasos, tanto texto-a-imagen como edición. Además, se recortó el codificador de texto a las 27 capas que klein realmente consume, eliminando capas que no afectan a la salida y ahorrando ~1 GB. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FLUX.2 klein) con predicción de velocidad; incluye codificador de texto Qwen3-4B y VAE |
| Parametros totales | Transformer de 3,9 B; codificador de texto Qwen3-4B truncado a 27 capas; VAE aparte |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Transformer en GPTQ 4-bit (grupo 64, corregido por Hessiana); codificador de texto en 8-bit; VAE en precisión original |
| Idiomas soportados | No disponible (no documentado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX; librería `mlx`, integración con mflux) |

Componentes y tamanos internos declarados por el autor:

| Componente | Precision | Tamano |
|---|---|---|
| Transformer (3,9 B) | GPTQ 4-bit, grupo 64 | 2,2 GB |
| Codificador de texto (Qwen3-4B) | 8-bit, recortado a 27 capas | 3,3 GB |
| VAE | Igual que el original | 0,16 GB |
| Repositorio completo | Mixto | 5,7 GB (5,3 GB en disco) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de FLUX.2 klein 4B de Black Forest Labs: un transformer de difusión para texto-a-imagen y edición por instrucción, que aquí se ejecuta con un muestreador de 4 pasos. El autor no describe el entrenamiento del modelo base (no se aportan datos sobre número de tokens, composición del dataset, RLHF o DPO del original), pero sí documenta en detalle el proceso de cuantificación, que es la innovación técnica central de este repositorio.

El transformer se cuantizó con GPTQ en lugar de redondeo simple. La calibración se hizo sobre el bucle real de denoising de 4 pasos, cubriendo tanto texto-a-imagen como edición con imagen de referencia, sumando la Hessiana de entrada de cada capa Linear sobre todos los tokens de todos los pasos. El resultado ocupa lo mismo que la cuantización 4-bit propia de mflux (`--quantize 4`) pero queda más cerca de bf16. Adicionalmente, el codificador de texto se recortó: klein solo condiciona sobre los estados ocultos 9, 18 y 27 de Qwen3, de modo que las capas 27–35 nunca afectan a la imagen y se eliminaron del checkpoint, ahorrando ~1 GB sin cambiar los embeddings del prompt ni la imagen final (bit-idénticos al codificador completo). Un barrido previo determinó que la combinación 8-bit para el codificador de texto y 4-bit para el transformer es la mejor: a 4-bit el codificador desplazaba la disposición del texto y los rostros, mientras que a 8-bit igualaba a bf16.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en 4 pasos de inferencia.
- Edición de imágenes guiada por instrucción natural: se pasa una imagen de referencia y el modelo modifica solo lo solicitado ("make it winter", "turn it into a watercolor", "give him glasses").
- Combinación encadenada de generación y edición (el ejemplo de la model card genera una escena y luego la edita).
- Ejecución local en Apple Silicon con memoria unificada, sin GPU dedicada.
- Integración con LLMTray, donde un modelo de chat invoca la herramienta de edición a partir de una foto adjunta.
- Previsualizaciones de paso en vivo durante la generación (función de la interfaz LLMTray, no del checkpoint).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión más allá de la propia edición de imagen.

## Casos de uso

- Edición de fotografías en local sobre un Mac de 16 GB: el modelo permite pasar una imagen y aplicar cambios semánticos ("ponle un sombrero al gato") sin subir la foto a un servicio en la nube, con un pico de ~9,4 GB y ~1 minuto por edición en un M5.
- Prototipado rápido de arte conceptual: generar variantes de una escena (cabaña junto a un lago al atardecer) en 4 pasos y ~25–30 s a 1024², útil para iterar ideas de diseño sin coste por API.
- Flujos de edición por lotes con instrucciones encadenadas: por ejemplo, generar una imagen base y aplicar transformaciones sucesivas de estilo o estación del año, manteniendo la coherencia del resto de la escena gracias al modo de edición con referencia.
- Asistentes conversacionales con generación de imágenes integrada: mediante LLMTray, un modelo de chat puede llamar a la herramienta de edición cuando el usuario adjunta una foto y pide un cambio en lenguaje natural.
- Creación de material gráfico para blogs o documentación técnica sin salir del portátil, aprovechando los 5,3 GB en disco y la ausencia de dependencia de GPU NVIDIA.
- Experimentación en investigación sobre cuantización: el repositorio es un caso de estudio reproducible (scripts `klein_gptq.py`, `klein_gptq_eval.py`, `klein_truncate_te.py`) para medir el impacto de GPTQ frente a RTN en modelos de difusión, con métricas de error de velocidad y PSNR frente a bf16.
- Despliegue de demostraciones offline o en entornos con restricciones de privacidad, donde no se permite enviar imágenes a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas estándar (como MMLU, HumanEval o GSM8K, no aplicables a un modelo de imagen) en la información disponible. Los únicos datos cuantitativos son la comparación GPTQ frente a RTN aportada por el autor, sobre un conjunto de 6 prompts de texto-a-imagen y 3 ediciones no incluidas en la calibración, a 1024², semilla 7 y con el mismo codificador de texto para todos los modelos:

| Transformer 4-bit g64 | Error de velocidad, texto a imagen | Error de velocidad, edición | PSNR vs bf16, texto a imagen | PSNR vs bf16, edición |
|---|---|---|---|---|
| RTN (mflux `--quantize 4`) | 0,244 | 0,171 | 18,7 dB | 25,7 dB |
| GPTQ (este repositorio) | 0,202 (−17 %) | 0,136 (−20 %) | 19,6 dB | 26,2 dB |

El error de velocidad se define como ‖v_q − v_bf16‖ / ‖v_bf16‖ con teacher forcing: en cada paso el modelo cuantizado recibe exactamente los latentes de la ejecución bf16, de modo que mide la distancia del denoiser respecto a bf16 sin acumular deriva de trayectoria. Según el autor, GPTQ es inferior en las 9 muestras, con una mejora del 12–22 %.

Datos de rendimiento de ejecución declarados (M5, 1024²): texto a imagen ~25–30 s por imagen; edición ~1 minuto.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: ~7,3 GB de pico para texto a imagen a 1024²; ~9,4 GB de pico para una edición con una imagen de referencia.
- Espacio en disco: 5,3 GB (frente a los ~16 GB del bf16 original).
- Hardware objetivo: Apple Silicon (memoria unificada). El autor indica que cabe "cómodamente en un Mac de 16 GB". Los tiempos de referencia se midieron en un chip M5.
- GPU NVIDIA (A100, H100, RTX 4090, etc.): no soportadas por este checkpoint, al estar en formato MLX y depender de mflux. No hay versión CUDA en este repositorio.
- Opciones de despliegue: mflux (Python, `pip install mflux==0.20.0`) y LLMTray (aplicación de escritorio para Mac). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Notas de configuración obligatorias: hay que ejecutar `model.text_encoder.layers = model.text_encoder.layers[:27]`, porque mflux construye las 36 capas del codificador y deja las ausentes sin inicializar (no cambian la salida, pero recortarlas ahorra ~1 GB y algo de tiempo). También se recomienda `TilingConfig(vae_decode_tile_size=256)`, que reduce a la mitad el pico de decodificación del VAE.
- Latencia estimada: ~25–30 s (texto a imagen, 1024², M5) y ~1 min (edición, 1024², M5). No se aportan cifras de throughput por lote.

## Comparativa con modelos similares

Comparativa entre las tres variantes del mismo modelo base, que son las alternativas directas cubiertas por la información disponible:

| Modelo | Parametros | Precision | Tamano en disco | PSNR vs bf16 (t2i / edicion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FLUX.2 klein 4B bf16 (original) | 3,9 B + Qwen3-4B completo | bf16 | ~16 GB | Referencia | Apache 2.0 | Black Forest Labs |
| mflux `--quantize 4` (RTN) | 3,9 B + Qwen3-4B | 4-bit por redondeo | Equivalente en pesos | 18,7 dB / 25,7 dB | Apache 2.0 | mflux |
| Este repositorio (GPTQ) | 3,9 B + Qwen3-4B recortado a 27 capas | GPTQ 4-bit + codificador 8-bit | 5,3 GB | 19,6 dB / 26,2 dB | Apache 2.0 | Hugging Face (MLX) |

No se dispone de datos comparativos frente a otros modelos de generación de imágenes de tamano similar (por ejemplo, alternativas de otros proveedores) en la información proporcionada, por lo que no se incluye dicha comparación.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo. Al derivar de FLUX.2 klein 4B, hereda los sesgos presentes en los datos de entrenamiento del modelo base, no caracterizados en esta model card.
- Alucinación: en generación de imágenes el riesgo se traduce en texto ilegible o mal formado dentro de la imagen, anatomías incorrectas y elementos que no corresponden al prompt. No se aportan métricas específicas.
- Deriva por cuantización: aunque GPTQ reduce el error frente a RTN, sigue existiendo una diferencia medible respecto a bf16 (19,6 dB de PSNR en texto a imagen, 26,2 dB en edición). Para producción con requisitos de fidelidad estricta, conviene comparar contra el bf16 original.
- Dependencia de mflux 0.20.0 y del recorte manual de capas: omitir `layers[:27]` no cambia la salida pero desperdicia ~1 GB de memoria y tiempo.
- Solo Apple Silicon: el formato MLX no es portable a CUDA ni a CPU convencional de forma directa, lo que limita el despliegue en infraestructura de servidores con GPU NVIDIA.
- Idiomas: no se documenta el soporte multilingüe de los prompts, a pesar de que el codificador de texto Qwen3 tiene capacidad multilingüe. No hay garantías publicadas.
- Licencia: Apache 2.0, lo que permite uso comercial, pero el uso debe respetar además las condiciones aplicables al modelo base de Black Forest Labs.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 26 de septiembre de 2026. Es un artefacto reciente y sin validación comunitaria independiente.
- Restricciones éticas: como todo modelo de generación de imágenes, puede producir contenido inapropiado o suplantaciones; no se documentan filtros ni salvaguardas en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roman220220/flux2-klein-4b-mlx-mixed
- Modelo base FLUX.2 klein 4B (Black Forest Labs): https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- mflux (librería de inferencia): https://github.com/filipstrand/mflux
- LLMTray (aplicación de escritorio para Mac): https://github.com/ipsupport-llc/llmtray
- Descarga de LLMTray: https://github.com/ipsupport-llc/llmtray/releases/latest/download/LLMTray-Full.dmg
- Proyecto de cuantización flux2-quant (código y write-up): https://github.com/rromenskyi/quant-ternary/tree/main/flux2-quant
- Releases previas del mismo autor (Z-Image-Turbo GPTQ MLX): https://huggingface.co/roman220220/z-image-turbo-gptq-mlx-mixed
