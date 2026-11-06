# Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.0000001

## Resumen

Este checkpoint es un experimento de investigación sobre compresión de modelos y su efecto en la seguridad, derivado de `meta-llama/Llama-2-7b-chat-hf`. El autor aplica una eliminación selectiva de parámetros mediante descomposición en valores singulares (SVD) sobre las matrices densas del transformer, con una tasa nominal de eliminación del 50 % de los parámetros de proyección (fracción realizada de factores a nivel de modelo completo: 0,519340). No hay fine-tuning de recuperación posterior, por lo que el modelo resultante conserva la estructura de Llama 2 Chat pero con un subespacio de pesos truncado.

El interés no reside en el rendimiento general, sino en la hipótesis que se evalúa: qué ocurre con las capacidades de rechazo y alineación cuando se comprime el modelo con una métrica de entrada mixta que combina momentos de WikiText con una fracción (0,1) de momentos de prompts dañinos y respuestas seguras. El objetivo de la SVD pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos, usando gradientes calculados sobre 128 ejemplos dañinos y 40 benignos.

Es, por tanto, un piloto unidireccional y no un SVD completo con información de Fisher, tal como advierte el propio autor. Los pesos se publican como matrices densas consolidadas ("folded") para facilitar la evaluación; el presupuesto de rango describe la representación de bajo rango subyacente, pero este repositorio no ofrece inferencia factorizada ni demuestra aceleración alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos consolidados tras truncamiento SVD |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 2 usa 4096 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible; el repo solo contiene safetensors en precision original |
| Idiomas soportados | No disponibles |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Tamano del repo | 13,5 GB |
| Eliminacion nominal de parametros | 50 % (fraccion realizada de factores: 0,519340) |
| Shift relativo rho | 1e-07 |
| Lambda global | 3,375972210921948e-06 |
| Ridge | 1e-05 |
| Metrica de entrada | Mixta (momentos WikiText + 0,1 x momentos harmful-prompt/safe-response) |
| Metrica de salida | Identidad |
| Fine-tuning de recuperacion | No |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B Chat: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y activación SwiGLU. Sobre esa base, este checkpoint no entrena desde cero ni hace fine-tuning: aplica una compresión post-hoc basada en SVD sobre las matrices de proyección, seleccionando qué componentes espectrales conservar según una métrica de sensibilidad derivada de gradientes. La métrica de entrada es "mixta": combina momentos de segundo orden calculados sobre WikiText con 0,1 veces los momentos obtenidos de pares prompt dañino / respuesta segura. Cada familia de textos se renderiza con su propia plantilla de chat y se perfila con sus propios pesos densos, incluyendo respuestas del profesor Llama-2.

El objetivo de la descomposición pondera igual la CE de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. Los gradientes se estiman con 128 ejemplos dañinos y 40 benignos; la validación de CE usa 32 y 12 ejemplos separados. El autor aclara que, al ser el corpus de la métrica mixta más amplio, estos ejemplos están retenidos respecto al gradiente pero no son necesariamente calibration examples completamente no vistos. Se trata de un piloto de una sola pasada ("one-sided pilot"), no de un SVD completo con información de Fisher. No hay decodificación especulativa, atención lineal ni otras innovaciones de inferencia: el interés técnico está exclusivamente en el procedimiento de compresión y su efecto sobre la seguridad.

## Capacidades

- Generación de texto conversacional: hereda la capacidad de diálogo de Llama 2 7B Chat, aunque degradada por la compresión SVD del 50 % nominal.
- Razonamiento y respuesta a instrucciones: se mantiene la estructura de chat, pero sin fine-tuning de recuperación que compense la pérdida de parámetros.
- Evaluación de seguridad: el checkpoint está diseñado para medir la tasa de éxito de ataques (ASR) en AdvBench/HarmBench, la sobre-rechazo en XSTest y el comportamiento en las primeras 500 prompts de OR-Bench juzgadas con WildGuard.
- Multilingüismo: no disponible; no se documentan idiomas soportados.
- Tool calling / function calling: no documentado; no se espera soporte nativo más allá del que ofrece el modelo base.
- Capacidades de agente o razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades especiales (visión, audio, thinking mode): ninguna.

## Casos de uso

- Investigación sobre compresión y alineación: usar el checkpoint como punto de comparación para estudiar si la eliminación de subespacios de pesos afecta de forma desproporcionada a los comportamientos de rechazo. Es su propósito declarado y el escenario para el que se publicaron los ficheros de evaluación.
- Auditoría de seguridad de modelos comprimidos: ejecutar AdvBench y HarmBench sobre este checkpoint y sobre el Llama-2-7b-chat original para cuantificar el cambio en ASR atribuible a la compresión, inspeccionando también la coherencia y la fracción de respuestas puntuables.
- Estudio de sobre-rechazo: emplear XSTest para medir si la compresión incrementa o reduce los rechazos ante prompts benignos, un eje distinto del ASR y relevante para calibrar políticas de moderación.
- Reproducción de experimentos de SVD selectivo: los ficheros bajo `experiment/` y `compression.json` permiten replicar los diagnósticos por matriz y comparar con otras configuraciones de rho, lambda y ridge.
- Análisis de degradación por capas: usar los diagnósticos por matriz para identificar qué proyecciones son más sensibles a la eliminación del 50 % y cómo se correlaciona con la pérdida de coherencia.
- Docencia y formación en seguridad de IA: servir como ejemplo práctico de que la compresión puede alterar propiedades de seguridad y de que las métricas agregadas (PPL, ASR) deben leerse junto con la calidad de las generaciones.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los ficheros de evaluación contienen PPL sobre WikiText-2, generaciones en AdvBench con juicios de HarmBench, XSTest y las primeras 500 prompts de OR-Bench juzgadas con WildGuard, pero no reproduce las cifras en el texto. El autor advierte explícitamente que estas mediciones piloto no establecen ninguna garantía de seguridad y que deben inspeccionarse la coherencia y las fracciones puntuadas junto con el ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV; con 4096 tokens de contexto y batch pequeño, un presupuesto práctico de 16-24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB de pesos, con un total práctico de 10-14 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB de pesos, con un total práctico de 6-10 GB.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con batches amplios; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits.
- GPU de consumo: sí cabe en tarjetas de 16 GB o más en 8 bits, y en tarjetas de 8-12 GB en 4 bits, siempre que se use un runtime que acepte la arquitectura Llama 2 estándar.
- Opciones de despliegue: al ser pesos densos en safetensors con arquitectura Llama 2, debería cargarse con transformers, vLLM, TGI o llama.cpp/Ollama tras la conversión a GGUF. No se documenta compatibilidad explícita ni se han publicado configuraciones de despliegue.
- Latencia y throughput: no disponibles. El autor señala que este repositorio no proporciona inferencia factorizada ni establece ninguna aceleración, por lo que el coste computacional es el de un modelo denso de 7B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.0000001 | 6,74 B | No disponible | Compresión SVD post-hoc con métrica mixta de seguridad | llama2 | Hugging Face, 15 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 tokens | Modelo base con RLHF, sin comprimir | llama2 | Hugging Face, ampliamente usado |
| Variantes de poda/SVD de Llama 2 (familia genérica) | ~3-7 B efectivos | Depende del checkpoint | Poda estructurada o SVD con calibración estándar | según autor | variable |
| Mistral-7B-Instruct | 7,24 B | 8192 tokens (32k en v0.2/v0.3) | Transformer denso con instrucción | Apache 2.0 | Hugging Face |

La comparación relevante es contra el modelo base sin comprimir: este checkpoint reduce la fracción de parámetros de proyección en aproximadamente un 52 % realizado, pero no publica cifras de perplejidad ni de ASR que permitan cuantificar la contrapartida. Frente a Mistral-7B-Instruct, la diferencia principal es la licencia (llama2 frente a Apache 2.0) y el contexto, mayor en Mistral, aunque este checkpoint no está pensado para uso en producción.

## Limitaciones y advertencias

- Checkpoint de investigación, no un modelo listo para producción: es un piloto unidireccional y el propio autor indica que no establece ninguna garantía de seguridad.
- Sin fine-tuning de recuperación: la eliminación del ~50 % de parámetros de proyección probablemente degrada la coherencia y la calidad de las respuestas; debe verificarse antes de cualquier uso.
- Los pesos son matrices densas consolidadas; no hay inferencia factorizada ni ganancia de velocidad demostrada, por lo que no debe esperarse una reducción de coste computacional.
- Riesgo de alucinación: no evaluado en la información disponible; la compresión puede agravarlo.
- Sesgos: no documentados; hereda los del corpus de Llama 2 y los del procedimiento de calibración, que incluye respuestas del profesor Llama-2.
- Idiomas: no se especifican; no hay garantía de comportamiento multilingüe tras la compresión.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso, umbrales de usuarios mensuales y obligaciones de atribución; debe revisarse antes de cualquier uso comercial.
- Las métricas de seguridad publicadas son parciales y dependen de jueces automáticos (HarmBench, WildGuard); el ASR debe interpretarse junto con la fracción de generaciones puntuables y la coherencia.
- Los ejemplos de validación no son completamente no vistos respecto al corpus de calibración mixta, lo que puede inflar ligeramente las métricas de validación.
- Fecha de creación indicada como 2026-10-30, posterior a la fecha habitual de publicación de Llama 2; conviene verificar la procedencia y reproducibilidad del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_mixed_remove0.5_rho0.0000001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- AdvBench: https://github.com/llm-attacks/llm-attacks
- HarmBench: https://github.com/centerforaisafety/HarmBench
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- WildGuard: https://huggingface.co/allenai/wildguard
- WikiText-2: https://huggingface.co/datasets/wikitext
