# Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.0000001

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante una técnica de compresión basada en descomposición en valores singulares (SVD) con un sesgo deliberado hacia la seguridad. El autor, Jeesup, lo publica como un piloto de evaluación de seguridad, no como un modelo listo para producción. La idea central es eliminar un 40 % nominal de los parámetros de proyección (proyección de bajo rango) y medir el efecto sobre la utilidad (perplejidad en WikiText-2) y sobre la identidad de seguridad (tasa de éxito de ataques en AdvBench/HarmBench y comportamiento en XSTest y OR-Bench).

El modelo conserva la arquitectura transformer decoder-only de Llama 3 8B Instruct, con 8.030.261.248 parámetros reales en los safetensors publicados. Aunque la eliminación nominal es del 40 %, la fracción realizada de parámetros factoriales sobre el modelo completo es de 0,652173, es decir, los pesos publicados son matrices densas plegadas, no una representación factorizada. Esto implica que la carga es idéntica a la de un Llama 3 8B estándar y que no se debe esperar ninguna aceleración de inferencia por el hecho de haber sido comprimido.

Su relevancia es metodológica: explora si una compresión SVD guiada por métricas mixtas (momentos de WikiText más 0,1 veces momentos de prompts dañinos con respuestas seguras) puede desplazar el comportamiento del modelo hacia respuestas más seguras sin fine-tuning de recuperación. Es un experimento de una sola pasada, no un SVD completo con información de Fisher, y el propio autor advierte que no establece ninguna garantía de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras compresión SVD |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Llama 3 8B Instruct: 8.192 tokens, no confirmado en la model card) |
| Tipos de cuantización | No disponible (solo se publican safetensors en precisión original) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3 (llama3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3 8B Instruct: un transformer decoder-only con atención por grupos (GQA) y tokenizador BPE de Llama 3. Sobre esa base, el autor aplica una compresión SVD con eliminación nominal del 40 % de los parámetros de proyección. La fracción realizada de parámetros factoriales sobre el modelo completo es 0,652173, lo que indica que la representación de bajo rango subyacente conserva aproximadamente dos tercios de los parámetros factoriales originales. No hay fine-tuning de recuperación posterior a la compresión.

El criterio de compresión combina dos familias de momentos: los de entrada de WikiText (métrica de utilidad) y 0,1 veces los de prompts dañinos con respuestas seguras (métrica de identidad). Ambas familias usan los mismos textos de respuesta de referencia, incluidos los del profesor Llama-2, renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. El objetivo pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación de entropía cruzada usa 32 y 12 ejemplos separados, respectivamente. El autor aclara que, al ser el corpus de métrica mixta más amplio, estos ejemplos son retenidos del gradiente, no completamente inéditos para la calibración. Los hiperparámetros incluyen un desplazamiento relativo rho de 1e-07, un lambda global de 1,3767206634182493e-07 y un ridge de 1e-05.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Llama 3 8B Instruct.
- Instrucciones multi-turno con plantilla de chat de Llama 3.
- Razonamiento básico y resolución de problemas de complejidad media, sujeto a la degradación introducida por la compresión.
- Capacidad multilingüe heredada del modelo base, aunque no se documenta en esta model card.
- No se documenta soporte de tool calling ni function calling en esta ficha.
- No se documenta modo de pensamiento (thinking), visión ni audio.
- El propósito declarado del checkpoint es la evaluación de seguridad, no el uso como asistente general.

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de comparación para estudiar cómo afecta la eliminación SVD del 40 % nominal a la perplejidad y a las métricas de seguridad, usando los ficheros de evaluación incluidos.
- Evaluación de seguridad reproducida: el repositorio incluye perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard, lo que permite replicar el protocolo del autor.
- Análisis de robustez frente a ataques: útil para medir la tasa de éxito de ataques (ASR) antes y después de la compresión y comprobar si el desplazamiento hacia respuestas seguras es estable.
- Estudio de coherencia tras compresión: los ficheros de evaluación permiten inspeccionar la coherencia y la fracción de respuestas puntuadas junto al ASR, algo crítico cuando se eliminan parámetros.
- Docencia y divulgación: ejemplo didáctico de cómo una métrica mixta (utilidad más seguridad) puede incorporarse al criterio de compresión SVD.
- Línea base para futuros SVD con información de Fisher: el propio autor lo describe como piloto de una sola pasada, por lo que sirve de referencia para trabajos posteriores más completos.
- No se recomienda su uso en atención al cliente, generación de código en producción ni pipelines de agentes, dado que no se ha validado su calidad funcional ni su seguridad más allá de las métricas del piloto.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que los ficheros de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados con WildGuard, pero no se proporcionan los valores en el texto facilitado. El autor insiste en que estas mediciones piloto no establecen una garantía de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4,5-5 GB, aunque no se publican versiones cuantizadas en este repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y GPUs con 16 GB o más en FP16; en 8 bits o 4 bits, en GPUs de 8-12 GB.
- Opciones de despliegue: los pesos son safetensors densos compatibles con transformers, vLLM, TGI y llama.cpp (previa conversión a GGUF). No se proporciona representación factorizada, por lo que no hay aceleración por rango bajo.
- Latencia y throughput: no disponibles; al ser pesos densos plegados, se espera un rendimiento similar al de Llama 3 8B Instruct en el mismo hardware, sin ganancia por la compresión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.0000001 | 8,03 B | No disponible | Llama 3 | Hugging Face, 14 descargas | Checkpoint de investigación con compresión SVD sesgada a seguridad; pesos densos |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 | Hugging Face, ampliamente disponible | Modelo base sin compresión; referencia de calidad y seguridad |
| Modelos de 7-8 B comprimidos por poda o cuantización (p. ej., variantes GGUF/AWQ de Llama 3) | ~7-8 B | Variable | Llama 3 | Hugging Face | Orientados a eficiencia de inferencia; no equivalentes en objetivo de seguridad |

La comparación directa con alternativas de compresión sesgada a seguridad no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que es un piloto de una sola pasada, no un SVD completo con información de Fisher; los resultados no deben generalizarse.
- No se establece ninguna garantía de seguridad: las mediciones de ASR, XSTest y OR-Bench son indicativas y deben interpretarse junto con la coherencia y la fracción de respuestas puntuadas.
- Los ejemplos de validación son retenidos del gradiente, pero no completamente inéditos para la calibración, lo que puede inflar ligeramente las métricas.
- Los pesos publicados son matrices densas plegadas; no hay inferencia factorizada ni aceleración demostrada, pese a la reducción nominal del 40 %.
- La compresión puede degradar la coherencia y la calidad de las respuestas; debe evaluarse caso por caso antes de cualquier uso.
- Riesgo de alucinación heredado del modelo base, potencialmente agravado por la eliminación de parámetros.
- Sesgos heredados de Llama 3 8B Instruct; no se documenta ninguna mitigación adicional.
- Idiomas soportados no documentados; se asume el comportamiento multilingüe del modelo base, sin verificación.
- Licencia Llama 3: impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier despliegue.
- No apto para producción sin una evaluación exhaustiva de calidad, seguridad y sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.0000001
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
