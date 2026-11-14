# ingvarson/Kroma-v0.3.1-turbo-opd-NVFP4

## Resumen

Kroma v0.3.1 Turbo OPD NVFP4 es una re-codificación cuantizada a 4 bits (formato NVFP4) del modelo de difusión texto-a-imagen Kroma, desarrollado por el usuario lodestones como fine-tune de Krea 2. Esta versión concreta, publicada por ingvarson, no entrena ni ajusta pesos: únicamente transforma los pesos originales en BF16 (24,5 GiB) a un fichero NVFP4 de 7,15 GiB compatible con ComfyUI, reduciendo el peso a menos de un tercio para facilitar su despliegue en GPUs Blackwell.

El modelo resuelve el problema de ejecutar un generador de imágenes de alta resolución en hardware de consumo: con 7,15 GiB para el modelo de difusión, un codificador de texto Qwen3-VL 4B en FP8 (4,88 GiB) y un VAE de 0,24 GiB, la pila completa cabe en GPUs de 16 GB y 24 GB, con tiempos de 3,0 s por imagen a 1280×720 y 18,8 s a 2048×2048 en una RTX PRO 6000 Blackwell.

La relevancia actual reside en que NVFP4 es el formato de coma flotante de 4 bits nativo de las GPUs NVIDIA Blackwell (serie RTX 50 y RTX PRO Blackwell), y esta ficha emplea la receta oficial de Comfy-Org para Krea 2 Turbo, verificada contra el fichero NVFP4 publicado por dicha organización. La licencia es la Krea 2 Community License, de tipo "other", lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión transformer (misma arquitectura y disposición de tensores que Krea 2 Turbo); 28 bloques principales más 2+2 bloques `txtfusion`, 8 capas Linear por bloque |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (FP4 E2M1 con escalas de bloque FP8 cada 16 valores y una escala global por capa); pesos no lineales en BF16 |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (tipo "other") |
| Formato de pesos | safetensors cuantizado nativo de ComfyUI (`kroma-v0.3.1-turbo-opd-nvfp4.safetensors`, 7 673 668 448 bytes, sha256 `f18c888cf8311090df17428dc6916cb431dca0ebaae11fd665f7932cc7fe585d`) |

## Arquitectura y entrenamiento

El modelo subyacente es Kroma v0.3.1 Turbo OPD, un fine-tune de Krea 2 realizado por lodestones, donde "OPD" corresponde a un checkpoint Turbo destilado con on-policy distillation. La arquitectura es un transformer de difusión con 28 bloques principales y 2+2 bloques `txtfusion`, cada uno con 8 capas Linear (`attn.wq/wk/wv/wo/gate`, `mlp.gate/up/down`). Esta ficha no entrena ni fusiona nada: solo re-codifica los pesos originales.

La cuantización sigue la receta oficial de Comfy-Org para Krea 2 Turbo. Se cuantizan las 256 capas Linear de los bloques del transformer mediante `comfy_kitchen.tensor.nvfp4.TensorCoreNVFP4Layout.quantize()`, con redondeo al más cercano y escalado absmax, sin datos de calibración, sin AWQ y sin redondeo aprendido. El resto de tensores (normalizaciones, modulación, capas de entrada/salida, MLP de tiempo y texto) permanece en BF16. En 96 de las 256 capas (`attn.wo`, `attn.gate`, `mlp.down`) se activa `full_precision_matrix_mult: true`: los pesos siguen en 4 bits, pero la multiplicación matricial se ejecuta sobre pesos des-cuantizados con activaciones en precisión completa, porque las entradas de esas capas concentran los valores atípicos más grandes. El proceso tarda unos 15 segundos y consume menos de 2 GiB de VRAM. La receta se validó ejecutando el script sobre el Krea 2 Turbo BF16 de Comfy-Org y comparando el resultado con su NVFP4 publicado: coinciden los 942 tensores, dtypes, formas, política por capa y tamaño de payload.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución de hasta 2048×2048.
- Muestreo rápido en modo Turbo: 8 pasos con CFG 1.0 y sampler `euler`/`simple` (el autor indica un rango de 8-12 pasos y CFG 1.0-1.5).
- Compatibilidad con LoRAs de Krea 2 y de Kroma sin cambios en el flujo de trabajo.
- Integración nativa en ComfyUI con soporte de Krea 2 y carga NVFP4, sin nodos personalizados.
- Codificación de texto mediante Qwen3-VL 4B (variantes FP8, BF16 e INT8 disponibles en Comfy-Org/Krea-2).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión más allá del codificador de texto.

## Casos de uso

- Generación de imágenes en producción con ComfyUI: el modelo se carga con el nodo Load Diffusion Model, un CLIP de tipo `krea2` y el VAE `qwen_image_vae.safetensors`; con 8 pasos y CFG 1.0 se obtienen imágenes en 3,0 s a 1280×720 en una RTX PRO 6000 Blackwell, adecuado para pipelines de generación por lotes.
- Despliegue en estaciones de trabajo con 24 GB: la pila completa (modelo, codificador de texto y VAE) permanece residente en VRAM hasta 2048×2048 con 17,6 GiB de pico, lo que permite iterar sin recargar pesos entre peticiones.
- Prototipado en GPUs de 16 GB: cabe de forma residente hasta aproximadamente 1536×1536 con 15,5 GiB de pico, útil para estudios que no disponen de hardware de gama alta.
- Iteración artística con LoRAs: al cargar LoRAs de Krea 2 y Kroma de forma habitual, sirve para experimentar con estilos concretos manteniendo el coste de memoria del modelo base reducido.
- Generación de imágenes de alta resolución para impresión o material gráfico: a 2048×2048 el coste es de 18,8 s por imagen, asumible para tiradas cortas.
- Evaluación comparativa de cuantizaciones: al ser una re-codificación reproducible (script incluido, ~15 s), permite contrastar la calidad NVFP4 frente a las cuantizaciones INT8 y GGUF publicadas por otros autores.
- Reproducción y auditoría del proceso de cuantización: el script `quantize_nvfp4.py` y el hash sha256 permiten verificar que los bytes generados coinciden con los publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento medidos son de VRAM y latencia en ComfyUI 0.42.1, con memoria pico del proceso completo reportada por `nvidia-smi`, texto-a-imagen, 8 pasos, CFG 1.0, batch 1 y codificador de texto FP8, en una RTX PRO 6000 Blackwell:

| Resolución | VRAM pico | Tiempo por imagen (en caliente) |
|---|---|---|
| 1280 × 720 | 13,1 GiB | 3,0 s |
| 1024 × 1024 | 13,6 GiB | 3,6 s |
| 1536 × 1536 | 15,5 GiB | 9,1 s |
| 2048 × 2048 | 17,6 GiB | 18,8 s |

En reposo, con todo cargado, el consumo es de 12,4 GiB. Estas cifras corresponden al escenario sin offloading: el modelo de difusión, el codificador de texto y el VAE permanecen residentes a la vez.

## Requisitos de hardware

- VRAM del modelo de difusión: 7,15 GiB en NVFP4 (frente a 24,5 GiB del original en BF16).
- Pila completa: 7,15 GiB (difusión) + 4,88 GiB (codificador Qwen3-VL 4B en FP8) + 0,24 GiB (VAE).
- VRAM pico medida: 13,1 GiB a 1280×720, 13,6 GiB a 1024×1024, 15,5 GiB a 1536×1536 y 17,6 GiB a 2048×2048.
- GPU de 24 GB: todo cabe con margen hasta 2048×2048.
- GPU de 16 GB: cabe de forma residente hasta aproximadamente 1536×1536.
- GPU de 12 GB o menos: no medido; el modelo de difusión solo ocupa 7,15 GiB y ComfyUI puede expulsar el codificador de 4,9 GiB de la VRAM tras codificar el prompt, pero no hay cifras que lo respalden.
- NVFP4 es el formato de 4 bits de las GPUs NVIDIA Blackwell (RTX 50 y RTX PRO Blackwell); el fichero solo se ha probado en Blackwell. En GPUs anteriores no se ha probado y el autor recomienda usar las cuantizaciones INT8 o GGUF de Kroma publicadas por otros.
- Despliegue: ComfyUI reciente con soporte nativo de Krea 2 y carga NVFP4 (probado en 0.42.1, comfy-kitchen 0.2.39), sin nodos personalizados. No se documentan otras opciones de despliegue.
- Latencia y throughput: 3,0 s/imagen a 1280×720, 3,6 s a 1024×1024, 9,1 s a 1536×1536 y 18,8 s a 2048×2048 en RTX PRO 6000 Blackwell. No se proporcionan datos de throughput agregado ni de otras GPUs.

## Comparativa con modelos similares

| Modelo | Formato / cuantización | Tamaño del fichero | Licencia | Notas |
|---|---|---|---|---|
| Kroma v0.3.1 Turbo OPD NVFP4 (este) | NVFP4, safetensors nativo de ComfyUI | 7,15 GiB | krea-2-community-license | Solo probado en Blackwell; script de cuantización incluido |
| Kroma v0.3.1 Turbo OPD original (lodestones/Kroma) | BF16, safetensors | 24,5 GiB | krea-2-community-license | Referencia de calidad; mayor requisito de VRAM |
| Krea 2 Turbo NVFP4 oficial (Comfy-Org/Krea-2) | NVFP4, safetensors | no disponible en la información | krea-2-community-license | Misma receta de cuantización; 942 tensores, dtypes, formas y política por capa coincidentes |
| Cuantizaciones INT8 / GGUF de Kroma (otros autores) | INT8 / GGUF | no disponible | no disponible | Recomendadas por el autor para GPUs no Blackwell |

No se dispone de datos de benchmarks que permitan comparar la calidad de salida entre estas variantes.

## Limitaciones y advertencias

- Solo se ha probado en GPUs NVIDIA Blackwell; en GPUs anteriores el comportamiento de NVFP4 no está verificado y se recomienda usar INT8 o GGUF.
- En GPUs de 12 GB o menos no hay mediciones de VRAM ni de latencia; el funcionamiento depende de que ComfyUI expulse el codificador de texto tras la codificación.
- La cuantización usa redondeo al más cercano con escalado absmax, sin calibración ni AWQ, lo que puede introducir degradación de calidad frente al BF16 original; las observaciones del autor son subjetivas y no se aportan métricas objetivas.
- El repositorio está etiquetado como `not-for-all-anchored` (en la práctica, `not-for-all-audiences`), lo que advierte de contenido potencialmente no apto para todas las audiencias.
- La licencia krea-2-community-license es de tipo "other" y condiciona el uso comercial; debe consultarse el PDF enlazado antes de cualquier despliegue productivo.
- No se documentan idiomas soportados ni sesgos conocidos.
- El modelo no entrena ni ajusta pesos: cualquier mejora o corrección debe buscarse en el modelo base de lodestones.
- Riesgo de alucinación visual y de fidelidad al prompt inherente a los modelos de difusión; no se aportan evaluaciones al respecto.

## Enlaces

- Repositorio Hugging Face de esta ficha: https://huggingface.co/ingvarson/Kroma-v0.3.1-turbo-opd-NVFP4
- Modelo base (lodestones/Kroma): https://huggingface.co/lodestones/Kroma
- Repositorio oficial de Krea 2 en Comfy-Org (codificadores de texto, VAE y NVFP4 oficial): https://huggingface.co/Comfy-Org/Krea-2
- Licencia Krea 2 Community License (PDF): https://huggingface.co/Comfy-Org/Krea-2/blob/main/LICENSE.pdf
- Codificador de texto Qwen3-VL 4B FP8: https://huggingface.co/Comfy-Org/Krea-2/tree/main/text_encoders
- VAE `qwen_image_vae.safetensors`: https://huggingface.co/Comfy-Org/Krea-2/tree/main/vae
- Modelo de difusión NVFP4 oficial de Comfy-Org: https://huggingface.co/Comfy-Org/Krea-2/tree/main/diffusion_models
