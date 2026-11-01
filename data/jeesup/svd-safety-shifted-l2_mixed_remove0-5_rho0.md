# Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0

## Resumen

`Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante compresión por descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. El autor, Jeesup, aplica una proyección de bajo rango que elimina nominalmente el 50 % de los parámetros de proyección (fracción realizada de parámetros factoriales de 0,519340 sobre el modelo completo), sin fine-tuning de recuperación posterior. El resultado se publica como matrices densas plegadas en formato Hugging Face para facilitar su evaluación.

El interés técnico reside en la metodología: en lugar de una SVD guiada únicamente por momentos de activación de WikiText-2, la métrica de entrada combina esos momentos con un 0,1 de los momentos de pares prompt-dañino/respuesta-segura. El objetivo pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos, usando gradientes calculados sobre 128 ejemplos dañinos y 40 benignos. Se trata, según el autor, de un piloto unilateral y no de una SVD completa con información de Fisher.

Es relevante ahora porque explora si la compresión agresiva de un modelo alineado puede preservar (o desplazar) su comportamiento de rechazo, un problema abierto en el despliegue de LLM comprimidos en entornos con requisitos de seguridad. No obstante, es un artefacto de investigación con 17 descargas, sin garantías de seguridad y sin inferencia factorizada real: el propio autor advierte que el upload no proporciona speedup.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con pesos densos plegados tras proyección SVD de bajo rango |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Llama-2-7b-chat-hf: 4.096 tokens, no confirmado en la model card) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors (matrices densas plegadas, no factorizadas) |

## Arquitectura y entrenamiento

La base es Llama-2-7b-chat-hf, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE y atención multi-cabeza con GQA en el modelo de 7B (32 cabezas de consulta, 32 de clave/valor en esta talla). Sobre esa arquitectura, el autor aplica una compresión SVD por matriz: cada matriz de proyección se aproxima por un factor de rango reducido, con una eliminación nominal del 50 % de los parámetros de proyección. La fracción realizada de parámetros factoriales respecto al modelo completo es 0,519340, lo que implica que buena parte del cómputo restante corresponde a embeddings y capas no comprimidas.

El entrenamiento no es tal en sentido clásico: no hay fine-tuning de recuperación ni RLHF/DPO adicional. La innovación está en la métrica que guía la SVD. La métrica de entrada es mixta: momentos de segundo orden de WikiText-2 más 0,1 veces los momentos de pares prompt dañino/respuesta segura. La métrica de salida es la identidad. Los hiperparámetros incluyen desplazamiento relativo `rho = 0,0`, `lambda` global `0,0` y ridge `1e-05`. El objetivo pondera igualmente la CE de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos; el gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación CE con 32 y 12 ejemplos separados. El autor aclara que, al ser el corpus de la métrica mixta más amplio, estos ejemplos son retenidos del gradiente, no totalmente no vistos para la calibración.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat-hf.
- Comportamiento de rechazo ante prompts dañinos, objeto central de la evaluación (AdvBench, HarmBench, XSTest, OR-Bench).
- Razonamiento y respuesta multi-turno dentro de la ventana de contexto de Llama 2.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta modo de razonamiento explícito (thinking), visión, audio ni otras modalidades.
- Capacidades multilingües no documentadas; la evaluación se realiza en inglés.
- El checkpoint está pensado para evaluación, no como modelo de producción: no incluye inferencia factorizada ni speedup.

## Casos de uso

- Investigación sobre compresión y alineación: medir cómo varía la tasa de rechazo (ASR en AdvBench/HarmBench) al comprimir un modelo alineado, usando este checkpoint como punto de comparación frente al Llama-2-7b-chat original.
- Auditoría de seguridad de modelos comprimidos: ejecutar XSTest y las primeras 500 prompts de OR-Bench con juicio de WildGuard para detectar sobre-rechazo o falsos negativos introducidos por la SVD.
- Estudio de metodologías de SVD guiada por métricas: replicar el pipeline con `experiment/` y `compression.json` para analizar diagnósticos por matriz y validar la ponderación de CE dañina/benigna.
- Evaluación de perplejidad tras compresión: usar WikiText-2 PPL como señal de degradación de coherencia antes de considerar el modelo en cualquier pipeline.
- Baseline en experimentos de recuperación: servir como punto de partida sin fine-tuning para comparar contra variantes con recuperación posterior.
- Docencia y reproducción académica: ilustrar el compromiso entre eliminación de rango y preservación de comportamiento seguro en un modelo de 6,7B parámetros.

## Benchmarks y rendimiento

La model card indica que los archivos de evaluación contienen WikiText-2 PPL, generaciones en AdvBench con juicios HarmBench, y XSTest más las primeras 500 prompts de OR-Bench juzgadas con WildGuard. Sin embargo, no se proporcionan los valores numéricos en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos (6,738 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- En cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes sin cuantizar; RTX 4090 (24 GB) suficiente para fp16 en una sola GPU con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB si se cuantiza, siempre que se genere la cuantización por cuenta propia.
- Opciones de despliegue: transformers estándar (pesos densos plegados), vLLM y TGI para serving; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles; el autor señala explícitamente que el upload no establece speedup alguno pese al presupuesto de rango subyacente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-shifted-l2_mixed_remove0.5_rho0 | 6,74B | No disponible | SVD con métrica mixta de seguridad, sin recuperación | Llama 2 | HuggingFace, 17 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6,74B | 4.096 tokens | Modelo base alineado con RLHF | Llama 2 | HuggingFace, ampliamente usado |
| Variantes de poda/SVD de Llama 2 de la literatura | ~3-6B | 4.096 tokens | Poda estructurada o SVD con calibración estándar | Llama 2 | Repos de investigación |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor declara que las mediciones piloto no establecen ninguna garantía de seguridad.
- Sin fine-tuning de recuperación: es esperable degradación de coherencia y calidad respecto al Llama-2-7b-chat original; debe inspeccionarse la PPL de WikiText-2 y la fracción de respuestas puntuadas junto al ASR.
- Pilot unilateral: no es una SVD completa con información de Fisher, por lo que los resultados no generalizan a otras configuraciones de compresión.
- Ejemplos de calibración parcialmente vistos: los ejemplos de validación CE están retenidos del gradiente, pero el corpus de la métrica mixta es más amplio, lo que puede inflar la aparente preservación de comportamiento.
- Sin inferencia factorizada: los pesos son matrices densas plegadas; no hay speedup ni ahorro de memoria respecto al modelo completo.
- Idiomas y sesgos: no documentados; la evaluación se limita al inglés y no se analizan sesgos demográficos.
- Riesgo de alucinación: no evaluado en la model card.
- Licencia Llama 2: restricciones de uso comercial y obligaciones de atribución; debe revisarse la licencia completa antes de cualquier despliegue.
- Contexto: no se confirma en la ficha la ventana de 4.096 tokens heredada; verificar en la configuración del checkpoint antes de usarlo con prompts largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- AdvBench: https://github.com/llm-attacks/llm-attacks
- HarmBench: https://github.com/centerforaisafety/HarmBench
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- WildGuard: https://huggingface.co/allenai/wildguard
