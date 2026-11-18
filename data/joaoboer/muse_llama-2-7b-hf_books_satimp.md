# JoaoBoer/muse_Llama-2-7b-hf_Books_SatImp

## Resumen

`muse_Llama-2-7b-hf_Books_SatImp` es un modelo derivado de Llama 2 7B obtenido aplicando la técnica de *machine unlearning* SatImp sobre el conjunto de olvido del benchmark MUSE-Books. Lo publica el usuario JoaoBoer como parte del proyecto Speculative-Decoding-Unlearning, donde se utiliza como modelo borrador (*draft*) y como línea base de unlearning a nivel de pesos. El modelo parte de `muse-bench/MUSE-Books_target`, un checkpoint de Llama 2 7B ya ajustado sobre el corpus de libros de MUSE, y le aplica SatImp para eliminar la memorización de un subconjunto concreto de libros.

La relevancia es metodológica más que de producto: sirve para estudiar hasta qué punto una técnica de unlearning elimina el conocimiento del conjunto de olvido sin degradar el conocimiento retenido, y para evaluar decodificación especulativa sobre modelos "desaprendidos". El modelo es un transformer decoder-only estándar de Llama 2 con 6.738.415.616 parámetros (aproximadamente 6,74 mil millones) y pesos en safetensors; el repositorio ocupa 13,5 GB, lo que corresponde a pesos en fp16.

No es un modelo de propósito general recomendado para producción: es un artefacto de investigación con 18 descargas y sin datos de idiomas declarados. Su interés está en la reproducibilidad del pipeline de unlearning (framework open-unlearning) y en las métricas MUSE publicadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos derivados por unlearning con SatImp |
| Parametros totales | 6.738.415.616 (6,74 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama 2; no confirmada) |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors (repo de 13,5 GB, compatible con fp16) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 (license: llama2) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | muse-bench/MUSE-Books_target (finetune de Llama 2 7B) |
| Dataset de unlearning | muse-bench/MUSE-Books (conjunto de olvido) |
| Framework de entrenamiento | open-unlearning (locuslab) |
| Hiperparametros SatImp | gamma=1.0, alpha=0.1, retain_loss_type=NLL, beta1=5.0, beta2=1.0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only denso con atención multi-cabeza estándar, normalización RMSNorm y activación SwiGLU. Sobre ese checkpoint, ya ajustado sobre el corpus de libros de MUSE (`muse-bench/MUSE-Books_target`), se aplica SatImp, una técnica de unlearning a nivel de pesos que combina una pérdida de olvido sobre el conjunto forget con una pérdida de retención (NLL) sobre el conjunto retain, ponderadas mediante los hiperparámetros gamma=1.0, alpha=0.1, beta1=5.0 y beta2=1.0. El entrenamiento se ejecuta con el framework open-unlearning y la configuración completa queda registrada en `.hydra/config.yaml` del repositorio.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de MUSE-Books, ni si hubo etapas de RLHF o DPO adicionales. La innovación técnica destacable no está en la arquitectura (que es Llama 2 sin modificaciones estructurales) sino en el procedimiento de unlearning y en su uso como modelo borrador dentro de un esquema de decodificación especulativa para estudiar cómo se comporta el unlearning bajo ese paradigma de inferencia.

## Capacidades

- Generación de texto autoregresiva, heredada de Llama 2 7B.
- Conocimiento sobre el dominio de libros (corpus MUSE-Books), parcialmente eliminado mediante SatImp sobre el conjunto de olvido.
- Capacidad de servir como modelo borrador (*draft*) en decodificación especulativa, según el proyecto Speculative-Decoding-Unlearning.
- Evaluación de retención de conocimiento y de memoria verbal mediante las métricas MUSE (knowmem y verbmem).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información proporcionada.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación en machine unlearning: reproducir el pipeline SatImp sobre MUSE-Books con open-unlearning y comparar las métricas de olvido y retención publicadas en `evals/`.
- Línea base en estudios comparativos de unlearning: usar este checkpoint como referencia de unlearning a nivel de pesos frente a otras técnicas (por ejemplo, variantes de gradient ascent o preference optimization) sobre el mismo modelo base.
- Modelo borrador en decodificación especulativa: integrarlo como draft model junto a un modelo objetivo para medir el impacto del unlearning en la tasa de aceptación de tokens y en la latencia.
- Auditoría de privacidad y memorización: analizar con las métricas de extraction_strength y privleak hasta qué punto el modelo sigue filtrando contenido del conjunto de olvido.
- Evaluación de robustez del unlearning bajo muestreo: los directorios `evals_sampled_s0` a `evals_sampled_s4` permiten reproducir la evaluación con temperatura 1, top_p 1 y top_k 0 sobre cinco semillas.
- Docencia y experimentación con transformers: cargar el modelo con la librería transformers para estudiar el efecto del unlearning en las distribuciones de salida sin necesidad de reentrenar.

## Benchmarks y rendimiento

Métricas MUSE publicadas en la model card:

| Metrica | Greedy | Muestreo (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0.0079 | – |
| forget_knowmem_ROUGE | 0.0000 | 0.0000 ± 0.0000 |
| forget_verbmem_ROUGE | 0.0000 | 0.0000 ± 0.0000 |
| privleak | -23.3728 | – |
| retain_knowmem_ROUGE | 0.5134 | 0.3430 ± 0.0256 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13,5-14 GB solo para pesos, más overhead de activaciones y caché KV; cómodo en GPUs de 24 GB.
- Cuantización a 8 bits: aproximadamente 7-8 GB de VRAM; a 4 bits: aproximadamente 4-5 GB, aunque no se publican pesos cuantizados en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100 para experimentos con lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en fp16 con lotes pequeños.
- Cabe en GPUs de consumo: sí, en RTX 4090/3090 en fp16 y en GPUs de 8-12 GB si se cuantiza, siempre que se generen los pesos cuantizados a partir de los safetensors.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp tras conversión, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muse_Llama-2-7b-hf_Books_SatImp (este) | 6,74 B | No disponible | Unlearning SatImp sobre MUSE-Books | Llama 2 | Hugging Face, 18 descargas |
| muse-bench/MUSE-Books_target | ~6,74 B (Llama 2 7B finetune) | No disponible | Modelo objetivo sin unlearning | Llama 2 (segun base) | Hugging Face (modelo base) |
| Llama 2 7B (meta-llama/Llama-2-7b-hf) | 6,74 B | 4.096 tokens (estándar Llama 2) | Modelo base de propósito general | Llama 2 | Hugging Face, ampliamente disponible |

La comparación con otras técnicas de unlearning sobre el mismo benchmark (por ejemplo, variantes de NPO o GradDiff en MUSE-Books) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado ni validado para uso en producción; solo 18 descargas y sin validación externa conocida.
- El unlearning no garantiza la eliminación completa de la información: extraction_strength de 0.0079 y privleak de -23.3728 indican que quedan señales medibles, por lo que no debe tratarse como una garantía de privacidad.
- La retención cae de forma notable al muestrear: retain_knowmem_ROUGE pasa de 0.5134 en greedy a 0.3430 ± 0.0256, lo que sugiere degradación del conocimiento retenido bajo generación estocástica.
- Riesgo de alucinación: no evaluado en la información disponible; hereda el comportamiento de Llama 2 7B, con mayor riesgo en dominios poco representados.
- Idiomas soportados no declarados; el modelo base Llama 2 está orientado principalmente al inglés, pero no se confirma para este checkpoint.
- Licencia Llama 2: restricciones de uso comercial y obligaciones de atribución según los términos de Meta; revisar la licencia antes de cualquier despliegue.
- Longitud de contexto no confirmada para este checkpoint; no asumir 4.096 tokens sin verificarlo en la configuración.
- Sin datos de sesgos específicos del proceso de unlearning; los sesgos del modelo base Llama 2 persisten salvo que el unlearning los haya alterado, cosa no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_Books_SatImp
- Modelo base: https://huggingface.co/muse-bench/MUSE-Books_target
- Dataset MUSE-Books: https://huggingface.co/datasets/muse-bench/MUSE-Books
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
