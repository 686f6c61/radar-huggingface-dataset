# fpadovani/nor-latn-100mb-after-ppt-shuff-dyck-10mb-ckpt500_seed3407

## Resumen

Este modelo es un checkpoint de fine-tuning (SFT) de un modelo GPT-2 pequeño, desarrollado por fpadovani (investigador vinculado a la Universidad de Groningen, según el enlace de Weights & Biases). El nombre del repositorio indica que se trata de un experimento con el sufijo `ckpt500`, es decir, el checkpoint número 500 de un proceso de entrenamiento supervisado (SFT) sobre un modelo base del mismo autor: `fpadovani/nor-latn-100mb-ppt-shuff-dyck-10mb_seed3407`.

El modelo tiene 124.770.816 parámetros totales, lo que coincide con la arquitectura GPT-2 small. Está pensado para generación de texto y se distribuye en formato safetensors. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni la licencia. La relevancia del modelo es principalmente académica: sirve para estudiar el comportamiento de modelos pequeños tras un proceso de SFT, probablemente en el contexto de lenguajes formales (el nombre incluye "dyck") y perturbaciones de preentrenamiento ("ppt-shuff"), aunque no hay documentación pública que lo confirme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base `fpadovani/nor-latn-100mb-ppt-shuff-dyck-10mb_seed3407`, entrenado mediante SFT (supervised fine-tuning) con la librería TRL. Las versiones de las herramientas utilizadas son: TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1.

No se especifican los datos de entrenamiento, el número de tokens ni la composición del dataset. Tampoco se menciona el uso de RLHF o DPO. El nombre del modelo sugiere que forma parte de una línea de investigación sobre lenguajes Dyck y perturbaciones de preentrenamiento, pero no hay documentación técnica que detalle estas innovaciones. La arquitectura subyacente es la de GPT-2, sin modificaciones conocidas.

## Capacidades

- Generacion de texto: el modelo es capaz de generar texto a partir de un prompt, como se muestra en el ejemplo de la model card, que usa un prompt en ingles.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No se dispone de informacion sobre un modo de pensamiento (thinking mode) ni sobre otras capacidades especiales.

## Casos de uso

No se ha publicado informacion sobre casos de uso concretos en la documentacion disponible. El modelo parece ser un checkpoint de investigacion sin aplicaciones practicas documentadas. Por tanto, no es posible enumerar casos de uso realistas y verificados. Cualquier uso en produccion requeriria una evaluacion previa exhaustiva, que no esta disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~0,5 GB (124M parametros × 2 bytes ≈ 250 MB, mas overhead de activaciones y buffers).
- VRAM estimada para inferencia en int8: ~0,25 GB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM. Tambien puede ejecutarse en CPU para inferencia sencilla.
- Opciones de despliegue: transformers (pipeline), vLLM (aunque no es necesario para un modelo de este tamano), llama.cpp si se convierte a formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado benchmarks comparativos en la informacion disponible. En cuanto a tamano, el modelo es comparable a GPT-2 small (124M parametros), pero no existen datos de rendimiento que permitan una comparacion real. Tampoco se ha encontrado informacion sobre otros modelos del mismo autor que sirvan como referencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo pequeno entrenado con datos no especificados, es probable que herede sesgos del dataset de preentrenamiento y fine-tuning.
- Riesgo de alucinacion: significativo, especialmente en modelos de este tamano, que tienden a generar texto plausible pero incorrecto.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto. Si sigue la arquitectura GPT-2 original, estaria limitado a 1024 tokens, pero no hay datos que lo confirmen.
- Restricciones de licencia: la licencia no esta disponible, lo que impide garantizar un uso comercial seguro.
- Es un checkpoint de investigacion sin soporte ni garantias de produccion.
- No se han publicado evaluaciones de seguridad, robustez ni alineacion.

## Enlaces

- HuggingFace: https://huggingface.co/fpadovani/nor-latn-100mb-after-ppt-shuff-dyck-10mb-ckpt500_seed3407
- Modelo base: https://huggingface.co/fpadovani/nor-latn-100mb-ppt-shuff-dyck-10mb_seed3407
- Weights & Biases (registro de entrenamiento): https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/fpoxysm6
