# Justbackup/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash

## Resumen

El modelo `Justbackup/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash` es un checkpoint de decodificación especulativa basado en la técnica DFlash (Block Diffusion for Flash Speculative Decoding) para la familia de modelos NVIDIA Nemotron-3.5-Lightning-30B-A3B. No es un modelo de propósito general independiente, sino un módulo auxiliar diseñado para acelerar la inferencia del modelo base cuando se sirve con vLLM o llama.cpp en entornos de baja concurrencia, como estaciones de trabajo y centros de datos con GPUs Blackwell.

El checkpoint está cuantizado en NVFP4 mediante NVIDIA Model Optimizer 0.45.0 y tiene una arquitectura densa con atención GQA (Dense MLP + GQA Attention). Según la model card del autor, el modelo cuenta con 833 millones de parámetros totales (481 millones no-embeddings), aunque los pesos en safetensors del repositorio suman 663 millones, probablemente debido a la exclusión de embeddings o a la cuantización. Está pensado para ser usado junto con el modelo base `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4` (o su versión BF16) y no como un modelo autónomo.

La relevancia de este lanzamiento radica en la reducción de latencia en escenarios de razonamiento, chat, RAG y flujos agénticos, aprovechando la decodificación especulativa para generar múltiples tokens por paso sin sacrificar calidad. El modelo está disponible bajo licencia OpenMDW-1.1, que permite uso comercial y no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense GQA (Dense MLP + GQA Attention) para DFlash; el modelo base es LatentMoE híbrido |
| Parametros totales | 833M (según model card); 663M según pesos safetensors del repo |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 1M tokens (máximo del modelo base) |
| Tipos de cuantizacion | NVFP4 (4 bits de punto flotante) |
| Idiomas soportados | Inglés, español, francés, alemán, italiano y japonés |
| Licencia | OpenMDW-1.1 (https://openmdw.ai/license/1-1/) |
| Formato de pesos | safetensors (Model Optimizer) |

## Arquitectura y entrenamiento

El checkpoint DFlash es un modelo denso con atención GQA no causal y de secuencia completa, diseñado para predecir múltiples tokens futuros en paralelo durante la decodificación especulativa. La arquitectura del modelo base subyacente (Nemotron-3.5-Lightning-30B-A3B) es un transformer híbrido LatentMoE con 30B parámetros totales y 3B activos por token, pero el módulo DFlash aquí presentado es independiente y mucho más pequeño (833M parámetros).

El entrenamiento del DFlash se realizó exclusivamente sobre un corpus de post-entrenamiento compuesto por prompts de los datasets `Nemotron-Post-Training-Dataset-v2` y `Nemotron-Post-Training-Dataset-v3` (no se usaron las respuestas originales de GPT). Se utilizaron 66 mil millones de tokens durante 2 épocas. La cuantización NVFP4 se aplicó con Model Optimizer 0.45.0, optimizando el modelo para GPUs Blackwell GB200. El checkpoint no incluye entrenamiento con RLHF ni DPO; su función es exclusivamente acelerar la inferencia del modelo base.

## Capacidades

- Decodificación especulativa DFlash: genera múltiples tokens por paso de atención, reduciendo la latencia de inferencia en comparación con la decodificación autoregresiva estándar.
- Compatible con el modelo base Nemotron-3.5-Lightning-30B-A3B (BF16 o NVFP4) para tareas de razonamiento, chat, RAG y agentes.
- Soporta tool calling y salidas estructuradas a través del modelo base, cuando se configura con la plantilla de chat adecuada.
- Multilingüe: inglés, español, francés, alemán, italiano y japonés (heredado del modelo base).
- Contexto largo de hasta 1M tokens (dependiendo del modelo base y de la configuración de despliegue).
- Integración con vLLM y llama.cpp como motores de inferencia.

## Casos de uso

- Servicio de chat de baja latencia en centros de datos: el DFlash acelera la generación de respuestas en despliegues con GPUs Blackwell GB200, reduciendo el tiempo de espera en aplicaciones interactivas.
- Razonamiento y resolución de problemas en producción: combinado con el modelo base, permite ejecutar cadenas de razonamiento complejas con menor latencia, útil en sistemas de tutoría o análisis técnico.
- Agentes autónomos con tool calling: el modelo base soporta llamadas a herramientas y el DFlash reduce el overhead de decodificación, mejorando la velocidad de ejecución de pipelines agénticos multi-paso.
- RAG (Retrieval-Augmented Generation): con contexto de hasta 1M tokens, el sistema puede procesar documentos extensos y generar respuestas basadas en la información recuperada, con la aceleración del DFlash.
- Asistencia multilingüe en entornos empresariales: soporte de seis idiomas para chatbots de atención al cliente o asistentes internos, con despliegue en infraestructura NVIDIA.
- Evaluación de modelos y pruebas de concepto: investigadores pueden usar este checkpoint para estudiar técnicas de decodificación especulativa y comparar latencia/throughput frente a decodificación estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K, etc.) ni comparativas de rendimiento específicas para el DFlash. Se recomienda consultar el paper de DFlash (arxiv:2602.06036) para detalles sobre la técnica, aunque los resultados numéricos no se han trasladado a esta ficha.

## Requisitos de hardware

- GPU recomendada: NVIDIA Blackwell GB200 (obligatorio según la model card). No se garantiza compatibilidad con otras arquitecturas.
- VRAM estimada: el checkpoint DFlash en NVFP4 ocupa aproximadamente 1.2 GB (tamaño del repo), pero debe desplegarse junto con el modelo base Nemotron-3.5-Lightning-30B-A3B (NVFP4 o BF16), que requiere varios GB adicionales. El modelo base tiene 30B parámetros totales, aunque solo 3B activos por token; en NVFP4 podría caber en GPUs con 24-48 GB, pero no se especifica oficialmente.
- No es adecuado para GPUs de consumo (RTX 4090, etc.) debido al requisito de Blackwell GB200.
- Motores soportados: vLLM y llama.cpp.
- Sistema operativo: Linux.
- Latencia y throughput: no se proporcionan cifras concretas en la documentación.

## Comparativa con modelos similares

No disponible. Este checkpoint es un módulo auxiliar de decodificación especulativa, no un modelo de propósito general. No se han encontrado alternativas comparables en la información proporcionada (otros DFlash para modelos Nemotron podrían existir, pero no se listan). Para comparar el modelo base subyacente, se puede consultar la model card de `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`.

## Limitaciones y advertencias

- No es un modelo standalone: requiere el modelo base Nemotron-3.5-Lightning-30B-A3B para funcionar; usarlo de forma aislada no produce resultados útiles.
- Hardware restringido: solo compatible con NVIDIA Blackwell GB200, lo que limita su despliegue a infraestructura de gama alta.
- Licencia OpenMDW-1.1: aunque permite uso comercial, es necesario revisar los términos específicos (https://openmdw.ai/license/1-1/) para asegurar el cumplimiento.
- Sin benchmarks públicos: no hay métricas de calidad o rendimiento validadas por terceros en la documentación disponible.
- Riesgo de alucinación y sesgos: al ser un modelo auxiliar, hereda las limitaciones del modelo base; no se han documentado sesgos específicos del DFlash.
- Contexto de 1M tokens: aunque el modelo base lo soporta, la implementación práctica puede verse limitada por la memoria de la GPU y la configuración del motor de inferencia.
- Discrepancia en el número de parámetros: la model card indica 833M, pero los pesos safetensors suman 663M; esto puede deberse a la exclusión de embeddings o a la cuantización, pero conviene verificarlo antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Justbackup/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo base NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Modelo DFlash oficial de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash
- Paper DFlash: https://huggingface.co/papers/2602.06036
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Dataset Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Colección Nemotron-Post-Training-v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
