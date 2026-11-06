# sfc-gh-vboonsanong/knowline-35b-a3b-gen1.5-nvfp4

## Resumen

KnowLine-35B-A3B-Gen1.5-NVFP4 es una cuantizacion en formato NVFP4 (punto flotante de 4 bits con escalado por bloques, tecnologia de NVIDIA via ModelOpt) del modelo PelaAI/KnowLine-35B-A3B-Gen1.5, un modelo de arquitectura MoE (Mixture of Experts) de la familia Qwen3.5. El prefijo "35B-A3B" indica 35 mil millones de parametros totales con aproximadamente 3 mil millones activos por token, un diseno que busca equilibrar calidad de inferencia con coste computacional reducido.

La publicacion corre a cargo del usuario sfc-gh-vboonsanong, que actua como distribuidor de la cuantizacion y no como autor del modelo original. El repositorio esta marcado como gated: requiere aceptar condiciones en Hugging Face antes de la descarga. La licencia declarada es Apache 2.0, heredada del modelo base.

El interes practico de esta ficha reside en el formato NVFP4, pensado para maximizar el rendimiento en GPUs NVIDIA Blackwell (serie B200/GB200 y posteriores) con soporte nativo de FP4, reduciendo el peso del modelo a 23,6 GB. No obstante, los metadatos publicos son escasos y no incluyen informacion sobre datos de entrenamiento, benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (familia qwen3_5_moe) |
| Parametros totales | 18.298.508.656 (segun safetensors del repo cuantizado) |
| Parametros activos | Aproximadamente 3B (indicado por el sufijo A3B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, ModelOpt), etiquetado como 8-bit en los tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4) |

Nota: existe una discrepancia entre el nombre comercial ("35B") y el recuento real de parametros en safetensors (18,3B). Se documentan ambos datos sin resolver la contradiccion, ya que la informacion disponible no lo permite.

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5 con arquitectura MoE, segun el tag `qwen3_5_moe`. Esto implica un transformer con capas de mezcla de expertos, donde cada token activa solo una fraccion de los parametros totales (alrededor de 3B de 35B nominales), lo que reduce el coste de inferencia respecto a un modelo denso equivalente. La cuantizacion NVFP4 se ha generado con NVIDIA ModelOpt, que aplica escalado jerarquico (por tensor, por bloque y por microscala) para preservar la precision en 4 bits.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base uso RLHF, DPO u otras tecnicas de alineacion. Tampoco hay detalles sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.) en los metadatos consultados. Toda esta informacion deberia consultarse en la ficha del modelo base PelaAI/KnowLine-35B-A3B-Gen1.5, no incluida en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento general, asumiendo las capacidades del modelo base Qwen3.5 MoE (no verificadas en esta ficha).
- Codigo y matematicas: presumiblemente soportadas por la familia base, sin datos de benchmark que lo confirmen.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Razonamiento multi-paso y uso como agente: no confirmado.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.
- Inferencia acelerada en hardware NVIDIA Blackwell gracias al formato NVFP4 nativo.

## Casos de uso

- Despliegue en GPUs Blackwell con FP4 nativo: el modelo esta disenado para ejecutarse en B200/GB200, donde el soporte de FP4 permite duplicar el throughput frente a FP8 en las mismas condiciones de memoria, con 23,6 GB de pesos.
- Servicio de inferencia de bajo coste por token: al activar solo ~3B parametros por token, el coste computacional por peticion es sustancialmente menor que el de un modelo denso de 35B, adecuado para APIs de alto volumen.
- Prototipado en entornos con VRAM limitada: los 23,6 GB caben en una unica GPU de 24 GB (RTX 4090, L4) con margen ajustado para el KV cache, o comodamente en una A100 40GB.
- Evaluacion de cuantizacion NVFP4: util como referencia para medir la perdida de calidad de FP4 frente al modelo base en tareas de razonamiento y generacion.
- Fine-tuning ligero sobre la version cuantizada: no recomendado directamente, pero el modelo base puede servir de punto de partida para adaptaciones con QLoRA.
- Investigacion sobre eficiencia de MoE: permite estudiar el comportamiento de un MoE de ~35B nominales con activacion de ~3B en cargas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~23,6 GB solo para pesos; anadir KV cache segun contexto (no disponible). Estimacion practica de 26-32 GB para contextos moderados.
- GPU recomendadas: NVIDIA B200/GB200 (soporte nativo FP4), H100 (soporte emulado o conversion), A100 40/80GB.
- Consumer GPU: cabe en RTX 4090 (24 GB) de forma muy ajustada; RTX 5090 (32 GB) o superior es mas comodo. GPUs de 16 GB no son viables sin offload.
- Opciones de despliegue: vLLM y TensorRT-LLM son las opciones mas realistas para NVFP4; llama.cpp y Ollama no soportan NVFP4 de forma nativa. TGI: soporte no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-35B-A3B-Gen1.5-NVFP4 | ~35B (3B activos) | no disponible | NVFP4 | Apache 2.0 | Gated en HF |
| PelaAI/KnowLine-35B-A3B-Gen1.5 (base) | ~35B (3B activos) | no disponible | BF16/FP16 | Apache 2.0 | HF (base) |
| Qwen3 MoE (referencia de familia) | variable | no disponible | multiples | Apache 2.0 | HF |

No se dispone de datos de rendimiento comparativo que permitan una evaluacion cuantitativa frente a alternativas.

## Limitaciones y advertencias

- Repositorio gated: requiere aceptar condiciones en Hugging Face; no es de descarga libre sin autenticacion.
- Discrepancia de parametros: el nombre indica 35B pero safetensors reporta 18,3B; conviene verificar la configuracion real antes de planificar despliegues.
- Cuantizacion agresiva: NVFP4 puede degradar calidad en tareas sensibles (matematicas, codigo, razonamiento largo); no hay benchmarks publicados que cuantifiquen la perdida.
- Dependencia de hardware NVIDIA: el formato NVFP4 no es portable a GPUs AMD, Apple Silicon ni CPU; limita el despliegue a ecosistema NVIDIA Blackwell o conversiones manuales.
- Autor no oficial: el repositorio lo publica un usuario tercero (sfc-gh-vboonsanong), no el equipo de PelaAI; auditar procedencia antes de uso en produccion.
- Sin datos de sesgos, alucinacion ni idiomas: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del gate pueden anadir restricciones adicionales que deben revisarse.
- Cero descargas y likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/sfc-gh-vboonsanong/knowline-35b-a3b-gen1.5-nvfp4
- Modelo base: https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5
- NVIDIA ModelOpt (herramienta de cuantizacion): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Documentacion NVFP4: https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/
