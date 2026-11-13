# FINAL-Bench/Darwin-9B-MFP4

## Resumen

Darwin-9B-MFP4 es una cuantización de precisión mixta en FP4 del modelo Darwin-9B-Opus, desarrollada por FINAL-Bench. Se construye sobre la arquitectura Qwen3.5 híbrida (atención completa más atención lineal) y aplica NVFP4, el formato de coma flotante de 4 bits con escalas FP8 por microbloques de 16 elementos de NVIDIA, únicamente a las capas MLP mientras preserva atención, embeddings, LM head y LayerNorms en BF16. El resultado ocupa aproximadamente 11 GB en disco frente a los 19 GB del checkpoint base en BF16.

La propuesta diferencial es la asignación selectiva de precisión: en lugar de comprimir uniformemente todos los pesos a 4 bits, MFP4 aísla el coste de cuantización en las capas que toleran mejor el ruido numérico (las MLP, que concentran la mayor parte de los parámetros) y mantiene en precisión completa los caminos de coordinación de largo alcance (atención), donde pequeñas perturbaciones degradan las cadenas de razonamiento y provocan patologías de decodificación como bucles o repeticiones.

El modelo está pensado para servir en hardware Blackwell (B200, RTX 5090), donde los GEMM en NVFP4 se ejecutan de forma nativa en tensor cores sin emulación software. Se distribuye bajo licencia Apache 2.0, soporta inglés y coreano, y se integra con vLLM 0.19 o superior mediante el backend `modelopt_fp4`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida (atención completa + atención lineal); clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 8.953.803.264 (≈ 8,95 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `--max-model-len 8192`) |
| Tipos de cuantizacion | MFP4: MLP/FFN en NVFP4 (4 bits, escalas FP8 por grupo de 16); atención Q/K/V/O, bloques de atención lineal, LM head, embeddings y LayerNorms en BF16 |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; cuantización generada con NVIDIA ModelOpt) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 de Alibaba Qwen, un transformer híbrido que combina atención completa con bloques de atención lineal (stateful, de tipo recurrente). Sobre esa base, Darwin-9B-Opus se obtuvo mediante un proceso de fusión evolutiva a través de la familia Qwen3.5, según describe el autor. Darwin-9B-MFP4 no es un reentrenamiento: es una cuantización post-entrenamiento del checkpoint Opus aplicada con NVIDIA ModelOpt.

La innovación técnica reside en la política de asignación de precisión. Las capas MLP, que concentran el grueso del cómputo y de los parámetros, se convierten a NVFP4, un formato de 4 bits con representación en coma flotante y escalas FP8 por bloque de 16 elementos, que ofrece mayor exactitud numérica que INT4 al mismo ancho de bits. Las rutas de atención (Q/K/V/O), los bloques de atención lineal, el LM head, los embeddings y las LayerNorms permanecen en BF16. El autor justifica esta decisión argumentando que las MLP operan de forma local y paralela y absorben bien el ruido de compresión, mientras que la atención actúa como sustrato de coordinación y es sensible al redondeo. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento (la model card etiqueta el modelo con `reasoning` y `conversational`).
- Procesamiento de entrada multimodal imagen-texto (`image-text-to-text` según los tags de Hugging Face), heredado de la arquitectura base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y coreano según la model card.
- Modo de razonamiento extenso (thinking mode): no disponible en la información proporcionada.
- Inferencia acelerada en hardware Blackwell gracias a los GEMM nativos en NVFP4.

## Casos de uso

- Despliegue en GPUs Blackwell con requisitos de memoria ajustados: el checkpoint de 11 GB permite servir el modelo en una sola GPU consumer de gama alta (RTX 5090, 32 GB) con margen para caché KV y contexto extendido, algo inviable con el base de 19 GB en configuraciones más justas.
- Razonamiento conversacional multi-turno: el modelo mantiene las rutas de atención en BF16, lo que según el autor preserva la coherencia en cadenas de razonamiento largas y evita bucles o repeticiones típicos de cuantizaciones uniformes a 4 bits.
- Asistentes en inglés y coreano: la cobertura bilingüe declarada lo hace adecuado para productos dirigidos a esos dos mercados sin necesidad de modelos adicionales.
- Procesamiento de documentos con imagen y texto: la pipeline `image-text-to-text` permite extracción y descripción de contenido visual combinado con consultas textuales.
- Servicio de inferencia de alto throughput en vLLM: con el backend `modelopt_fp4` y tensor cores FP4, el coste dominante (GEMM de las MLP) se ejecuta a throughput de segunda generación FP4, reduciendo el coste por token en producción.
- Base para fine-tuning con QLoRA o adaptadores sobre el checkpoint cuantizado: al mantener atención y embeddings en BF16, los adaptadores pueden entrenarse sobre esas rutas sin lidiar con la cuantización de 4 bits en las capas más sensibles.
- Evaluación comparativa de estrategias de cuantización: sirve como referencia práctica para medir la diferencia entre cuantización uniforme y asignación por región funcional en un transformer híbrido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GB de pesos más caché KV y overhead del runtime; con `--gpu-memory-utilization 0.85` y contexto de 8192 tokens, un presupuesto de 16-24 GB es razonable.
- GPU recomendadas: NVIDIA B200 y RTX 5090 para aceleración nativa NVFP4 en tensor cores. En GPUs sin soporte NVFP4 nativo (A100, H100, RTX 4090) el rendimiento sería inferior o requeriría emulación, aunque la información disponible no detalla el comportamiento en esas arquitecturas.
- Cabe en GPU consumer: sí, en RTX 5090 (32 GB) con holgura; en GPUs de 24 GB el margen depende de la longitud de contexto y del tamaño de lote.
- Opciones de despliegue: vLLM 0.19 o superior con `--quantization modelopt_fp4` y `--trust-remote-code` (recomendado por el autor); TensorRT-LLM según la model card; llama.cpp, Ollama y TGI no se mencionan como soportados para este checkpoint.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-9B-MFP4 | 8,95 B | no disponible | MFP4 (MLP NVFP4, atención BF16) | Apache 2.0 | Hugging Face |
| Darwin-9B-Opus (base) | 8,95 B | no disponible | BF16 (19 GB) | Apache 2.0 | Hugging Face |
| Alternativas de ~9B en FP4 uniforme | no disponible | no disponible | FP4 uniforme | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La cuantización NVFP4 solo está acelerada de forma nativa en hardware Blackwell; en GPUs anteriores el beneficio de throughput se pierde y puede degradarse el rendimiento frente al checkpoint BF16.
- Requiere vLLM 0.19 o superior y `--trust-remote-code`, lo que implica ejecutar código del repositorio del modelo; conviene auditar el checkpoint antes de desplegarlo en producción.
- Cobertura lingüística limitada a inglés y coreano; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- No se publican resultados de benchmarks que permitan cuantificar la pérdida de calidad frente al modelo base en tareas de razonamiento, código o matemáticas.
- Riesgo de alucinación inherente a los modelos generativos de ~9B; no se documentan evaluaciones específicas de factualidad ni de sesgos.
- La información sobre el proceso de entrenamiento del modelo base (datos, alineación, filtros) no está disponible, lo que dificulta evaluar sesgos heredados.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base deriva de Qwen3.5; conviene verificar las condiciones de la familia Qwen para el linaje completo.
- El ejemplo de despliegue usa `--enforce-eager`, lo que desactiva CUDA graphs y puede reducir el throughput respecto a una configuración optimizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-9B-MFP4
- Modelo base Darwin-9B-Opus: https://huggingface.co/FINAL-Bench/Darwin-9B-Opus
- NVIDIA ModelOpt (TensorRT Model Optimizer): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Paper referenciado (arXiv:2605.14386): https://arxiv.org/abs/2605.14386
- Demo POCKET en CPU (familia relacionada): https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU
- Colección POCKET: https://huggingface.co/collections/FINAL-Bench/pocket-models-6a618ee5d23eafb7e185a5c6
