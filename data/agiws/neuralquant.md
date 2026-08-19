# agiws/NeuralQuant

## Resumen

NeuralQuant es una librería de cuantización universal para redes neuronales desarrollada por la organización agiws (AGI Workshop) en Hugging Face. No se trata de un modelo de inteligencia artificial, sino de un paquete de código Python que permite cuantizar cualquier modelo PyTorch (encoders de visión, LLMs, TTS, generación de imagen y vídeo) mediante un único `Quantizer` parametrizable. Resuelve el problema de reducir el tamaño y acelerar la inferencia de modelos sin necesidad de recurrir a múltiples herramientas fragmentadas.

La librería soporta más de 55 formatos de cuantización, incluyendo INT, MX/NV, FP4/FP6/FP8, NormalFloat (NF2/NF3/NF4/NF8), GGUF k-quants, BitNet 1.58, codebooks/VQ, así como métodos PTQ (GPTQ, AWQ, SmoothQuant, LLM.int8, QuIP) y QAT con destilación dual-path. Además, integra una funcionalidad novedosa: la carga de modelos GGUF k-quant con pesos empaquetados en VRAM y de-cuantización on-the-fly, similar al enfoque de llama.cpp. Se distribuye bajo licencia Apache-2.0 y está orientada a desarrolladores que necesitan desplegar modelos cuantizados en producción con control fino sobre el formato y la precisión.

Su relevancia actual radica en la creciente demanda de despliegue eficiente de LLMs en hardware limitado, donde la cuantización es una técnica imprescindible. NeuralQuant ofrece una alternativa unificada a herramientas como bitsandbytes o auto-gptq, con soporte explícito para formatos emergentes como MXFP4 o NF8 y una integración directa con el ecosistema de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (libreria de cuantizacion, no un modelo) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | INT2/3/4/6/8, MXFP4/6/8, NVFP4/6/8, MXINT2/4/6/8, FP4/6/8 (E2M1, E3M2/E2M3, E4M3/E5M2), NormalFloat NF2/NF3/NF4/NF8, GGUF k-quants (q2_k, q3_k, q4_k, q5_k, q6_k, q8_0, q4_0), BitNet 1.58 (ternario/binaro), codebooks/VQ, AQLM, GPTQ, AWQ, SmoothQuant, LLM.int8, QuIP |
| Idiomas soportados | Ingles (interfaz de la libreria; los modelos cuantizados pueden ser en cualquier idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | Packed buffers (formato interno), GGUF (lectura/escritura), safetensors (via PyTorch) |

## Arquitectura y entrenamiento

NeuralQuant no es un modelo entrenado, sino una librería de cuantización. Su "arquitectura" interna se basa en un `Quantizer` parametrizable que transforma módulos `nn.Linear` de PyTorch en `QuantizedModule`, los cuales almacenan pesos en formato empaquetado y realizan de-cuantización on-the-fly por bloques de filas de salida durante el forward. Esto permite mantener los pesos en VRAM sin materializar la versión fp16 completa, reduciendo drásticamente el consumo de memoria.

La librería implementa múltiples técnicas de cuantización: PTQ (post-training quantization) con métodos como GPTQ (compensación por Hessiana), AWQ (activation-aware), SmoothQuant, LLM.int8 (outliers) y QuIP (rotación); QAT (quantization-aware training) con pesos latentes aprendibles, escalas mediante STE (straight-through estimator) y codebooks aprendibles; y pruning estructural (REAP/REAM) y no estructurado. También incluye cuantización de activaciones en todos los formatos, con modos de escala por token, por grupo o por canal, y escalas específicas por cabeza de atención en proyecciones Q/K/V/O.

Una innovación destacada es la integración con Transformers: NeuralQuant se registra como un método de cuantización (`quant_method: "neuralquant"`) en el `config.json` de un modelo, permitiendo cargar modelos cuantizados directamente con `from_pretrained` sin necesidad de bitsandbytes ni esqueletos manuales. El flujo reemplaza los `nn.Linear` por `QuantizedModule` en device meta, rellena los buffers empaquetados durante la carga de pesos y ejecuta la inferencia con de-cuantización por chunks.

## Capacidades

- Cuantización de cualquier modelo PyTorch: LLMs, encoders de visión, TTS, modelos de generación de imagen y vídeo.
- Soporte de más de 55 formatos de cuantización, incluyendo INT, MX/NV, FP, NormalFloat, GGUF k-quants, BitNet y codebooks.
- Cuantización de pesos y activaciones, con modos de escala per-tensor, per-channel, per-group y per-head.
- QAT (quantization-aware training) con pesos latentes aprendibles, escalas STE y codebooks aprendibles.
- Pruning estructural y no estructurado (REAP/REAM, basado en magnitud).
- Lectura y carga de modelos GGUF k-quant con pesos empaquetados en VRAM y de-cuantización on-the-fly (estilo llama.cpp).
- Integración con Transformers: carga de modelos cuantizados mediante `from_pretrained` con `quantization_config`.
- Sin dependencia de bitsandbytes, GPTQ o esqueletos manuales.
- Compatible con PyTorch y CUDA.

## Casos de uso

- Despliegue de LLMs en GPU con memoria limitada: cuantizar un modelo de 27B parámetros a Q3_K_S reduce el peso de ~54 GB fp16 a ~12 GB, permitiendo ejecutarlo en una GPU de 16 GB como la RTX 4090.
- Inferencia de modelos de generación de imagen o vídeo en entornos de producción: cuantizar los pesos de un diffusion model para reducir latencia y VRAM sin pérdida significativa de calidad.
- Integración en pipelines de Transformers: usar `NeuralQuantConfig` en el `quantization_config` de un modelo para cargarlo cuantizado directamente con `from_pretrained`, simplificando el flujo de despliegue.
- Experimentación con formatos emergentes: probar MXFP4, NF8 o BitNet 1.58 en modelos propios para evaluar el trade-off precisión/rendimiento.
- Fine-tuning con QAT: entrenar un modelo con pesos latentes y escalas aprendibles para obtener una versión cuantizada de alta precisión adaptada a una tarea específica.
- Conversión de modelos a GGUF: usar la librería para convertir checkpoints de PyTorch a formato GGUF y desplegarlos con llama.cpp u otros runners compatibles.
- Investigación en cuantización: comparar el rendimiento de distintos esquemas (INT, FP, NormalFloat, codebooks) sobre el mismo modelo y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (perplejidad, exactitud en tareas downstream) ni mediciones de velocidad/throughput para los distintos formatos de cuantización. Se recomienda realizar evaluaciones propias con los modelos y datasets de interés.

## Requisitos de hardware

- La librería requiere una GPU NVIDIA con soporte CUDA para aprovechar la de-cuantización on-the-fly y los kernels optimizados.
- Memoria VRAM: depende del modelo y del formato de cuantización. El ejemplo de la documentación muestra que un modelo de 27B parámetros cuantizado a Q3_K_S ocupa ~12 GB en VRAM (frente a ~54 GB en fp16), por lo que cabe en GPUs de 16 GB como la RTX 4090 o la A100 40 GB.
- Para modelos más grandes (70B+), se recomiendan GPUs con 24 GB o más (RTX 3090/4090, A100, H100) o múltiples GPUs.
- Opciones de despliegue: la librería se integra con Transformers (vía `from_pretrained`), y también permite exportar a GGUF para usar con llama.cpp u otros runners.
- Latencia y throughput: no se han publicado cifras concretas. La de-cuantización por chunks introduce una sobrecarga computacional, pero el ahorro en memoria suele compensar en modelos grandes.

## Comparativa con modelos similares

No se trata de un modelo comparable con otros LLMs, sino de una librería de cuantización. Las alternativas más cercanas son:

| Librería | Formatos soportados | Integración con Transformers | GGUF | Licencia |
|---|---|---|---|---|
| NeuralQuant | 55+ (INT, MX, FP, NF, GGUF, BitNet, codebooks, PTQ, QAT) | Sí (plugin nativo) | Sí (lectura/escritura, dequant en VRAM) | Apache-2.0 |
| bitsandbytes | NF4, FP4, INT8 (LLM.int8) | Sí (nativa) | No | MIT |
| auto-gptq | GPTQ (INT4/INT8) | Sí (nativa) | No | MIT |
| llama.cpp | GGUF k-quants (q2_k...q8_0) | No (uso directo) | Sí (formato principal) | MIT |

NeuralQuant destaca por su amplitud de formatos y por la capacidad de cargar GGUF con de-cuantización en VRAM, algo que no ofrecen directamente las alternativas de Transformers. Sin embargo, su ecosistema es más joven y menos probado en producción que bitsandbytes o GPTQ.

## Limitaciones y advertencias

- No es un modelo de IA, sino una librería de cuantización. Los usuarios que busquen pesos preentrenados deben acudir a los repositorios de modelos de la organización `agiws` o cuantizar sus propios modelos.
- La documentación y los ejemplos están en inglés; la interfaz no está localizada.
- Al ser un proyecto relativamente nuevo (creado en agosto de 2026), puede tener bugs no detectados o falta de soporte para ciertos modelos o arquitecturas.
- La cuantización, especialmente en formatos de baja precisión (2-3 bits), puede degradar la calidad del modelo. Se recomienda evaluar el impacto en la tarea concreta.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de cumplir con las licencias de los modelos que cuantice.
- No se proporcionan garantías de rendimiento ni benchmarks oficiales; cada despliegue requiere validación propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agiws/NeuralQuant
- Organización agiws (AGI Workshop): https://huggingface.co/agiws
- Búsqueda de modelos con tag `agiws`: https://huggingface.co/models?other=agiws
