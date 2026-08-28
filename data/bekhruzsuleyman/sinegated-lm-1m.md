# bekhruzsuleyman/sinegated-lm-1m

## Resumen

SinGatedLM es un modelo de lenguaje experimental desarrollado por bekhruzsuleyman que introduce una modificación arquitectónica novedosa: en lugar de usar la atención únicamente como una transformación aditiva o residual, emplea la salida de la atención como una señal de control sinusoidal multiplicativa sobre otra transformación aprendida. La operación central es `f(x, y) = (Wx + b) ⊙ (α · sin(y))`, donde `y` es la representación derivada de la atención y `α` es un coeficiente aprendible que controla la amplitud del gating.

El modelo presentado en esta ficha, `sinegated-lm-1m`, corresponde a la variante de aproximadamente 1,03 millones de parámetros descrita en el segundo experimento de la model card. Se trata de un modelo de nivel de caracteres entrenado sobre el dataset Tiny Shakespeare, con una arquitectura transformer estándar (embeddings, atención multi-cabeza, capas lineales) pero con la sustitución de la transformación residual posterior a la atención por el mecanismo SinGated. Su relevancia radica en explorar si la modulación sinusoidal condicionada por atención puede mejorar la eficiencia paramétrica en modelos pequeños, un área de interés para la investigación en arquitecturas compactas.

La información disponible es limitada: no se especifican licencia, idiomas soportados, cuantizaciones ni benchmarks estándar. Los únicos resultados publicados son los experimentos del autor, que muestran una pérdida de validación menor que un baseline PlainLM con menos parámetros, aunque el segundo experimento no está igualado en número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención multi-cabeza estándar y gating sinusoidal condicionado por atención (SinGatedAttention) |
| Parametros totales | 1.027.048 (según experimento 2 de la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la documentación) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones) |
| Idiomas soportados | no disponible (entrenado sobre Tiny Shakespeare, texto en inglés, pero no se declara soporte multilingüe) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se indica si es safetensors, GGUF, etc.) |

## Arquitectura y entrenamiento

La arquitectura de SinGatedLM sigue un esquema transformer convencional: token embedding, positional embedding, una capa lineal, atención multi-cabeza estándar, otra capa lineal, el bloque SinGatedAttention, una capa lineal final y la cabeza de vocabulario. La innovación clave es que la salida de la atención `A` no se suma directamente a la representación, sino que se utiliza como señal de modulación: `g = α · sin(A)`, y luego se multiplica por la transformación lineal `h = Wx + b`. Este mecanismo introduce una no linealidad oscilatoria que puede actuar como un control dinámico sobre la representación.

El entrenamiento se realizó sobre el dataset Tiny Shakespeare a nivel de caracteres, con 3000 iteraciones. En el experimento 1 (64K parámetros), SinGatedLM obtuvo una pérdida de validación final de 2,5603 frente a 2,6931 del baseline PlainLM, con un parámetro adicional. En el experimento 2 (1M vs 1,5M), SinGatedLM con 1.027.048 parámetros alcanzó una pérdida de validación de 1,8818, mientras que PlainLM con 1.535.483 parámetros obtuvo 1,9914, es decir, un 33% menos de parámetros con mejor rendimiento. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el entrenamiento es supervisado estándar de modelado de lenguaje.

## Capacidades

- Generación de texto a nivel de caracteres: el modelo es capaz de generar secuencias de caracteres coherentes con el estilo del corpus de entrenamiento (Tiny Shakespeare).
- Modelado de lenguaje autoregresivo: predice la siguiente distribución de caracteres dado un contexto.
- Investigación arquitectónica: permite estudiar el efecto del gating sinusoidal condicionado por atención en modelos pequeños.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- El soporte multilingüe no está declarado; el entrenamiento se limita a un corpus en inglés (Shakespeare).

## Casos de uso

- Investigación en arquitecturas de atención: el modelo sirve como banco de pruebas para evaluar si la modulación sinusoidal mejora la eficiencia paramétrica en transformers pequeños. Un investigador puede reproducir los experimentos y comparar con baselines.
- Educación en aprendizaje profundo: al ser un modelo de ~1M parámetros, es adecuado para demostrar conceptos de atención, gating y entrenamiento de modelos de lenguaje en cursos o tutoriales, ejecutable en CPU.
- Experimentación con regularización implícita: el mecanismo sinusoidal puede actuar como una forma de regularización no lineal; los desarrolladores pueden estudiar su efecto en la convergencia y la generalización.
- Prototipado de generación de texto a nivel de caracteres: para aplicaciones donde se requiere un generador de texto muy ligero (por ejemplo, generación de nombres, texto estilizado), aunque su calidad es limitada por el corpus pequeño.
- Comparación de eficiencia paramétrica: sirve como referencia para medir el trade-off entre número de parámetros y pérdida de validación frente a arquitecturas convencionales.
- Exploración de funciones de activación alternativas: el uso de `sin` como función de activación puede inspirar diseños similares en otros modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento provienen de los experimentos del autor, que se resumen a continuación:

| Experimento | Modelo | Parámetros | Pérdida de validación | Tiempo de entrenamiento |
|---|---|---|---|---|
| 1 (seed 42) | SinGatedLM | 64.660 | 2,5603 | 21,7 s |
| 1 (seed 42) | PlainLM | 64.659 | 2,6931 | 22,0 s |
| 2 | SinGatedLM | 1.027.048 | 1,8818 | 58,3 s |
| 2 | PlainLM | 1.535.483 | 1,9914 | 68,3 s |

Estos resultados son experimentales y no comparables con benchmarks estándar. El experimento 2 no está igualado en parámetros, por lo que la comparación debe interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1M parámetros, la inferencia requiere menos de 1 GB de VRAM, incluso en FP32. Cabe en cualquier GPU moderna y también en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.) es suficiente. No se requieren GPUs de datacenter.
- Compatibilidad con consumer GPU: sí, es perfectamente ejecutable en GPUs de consumo y en CPU.
- Opciones de despliegue: al no especificarse el formato de pesos, se puede asumir que es compatible con PyTorch estándar. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI; dado su tamaño, podría ejecutarse con scripts personalizados en PyTorch.
- Latencia y throughput: no se proporcionan datos. Para un modelo de este tamaño, la inferencia es prácticamente instantánea en GPU y muy rápida en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos con la misma arquitectura SinGated. Como referencia de modelos pequeños de lenguaje a nivel de caracteres, se pueden mencionar:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SinGatedLM (este) | ~1M | no disponible | no disponible | HuggingFace |
| nanoGPT (Karpathy) | ~10M (configuración típica) | 1024 tokens | MIT | GitHub |
| minGPT (Karpathy) | ~10M | 1024 tokens | MIT | GitHub |

Sin embargo, no hay datos de rendimiento comparativo entre estos modelos y SinGatedLM, por lo que la comparación no es posible en términos cuantitativos.

## Limitaciones y advertencias

- Modelo experimental: no está diseñado para uso en producción; su rendimiento en tareas del mundo real no ha sido evaluado.
- Entrenamiento en un corpus muy pequeño (Tiny Shakespeare): la generalización a otros dominios o estilos de texto es muy limitada.
- Sin licencia especificada: el uso comercial puede ser problemático; se recomienda contactar al autor antes de cualquier uso.
- Sin información sobre sesgos: al ser un modelo de caracteres entrenado en un corpus literario, no se han analizado posibles sesgos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar texto incoherente o sin sentido, especialmente fuera del dominio de entrenamiento.
- El experimento 2 no está igualado en parámetros, por lo que la ventaja observada no es concluyente sobre la superioridad arquitectónica.
- No se documentan limitaciones de contexto ni de idioma, pero al ser un modelo de caracteres, la longitud de contexto efectiva es probablemente pequeña (no especificada).

## Enlaces

- HuggingFace: https://huggingface.co/bekhruzsuleyman/sinegated-lm-1m
- Perfil de GitHub del autor: https://github.com/bekhruzsuleyman
- Otro modelo del autor (ruzz-116m): https://huggingface.co/bekhruzsuleyman/ruzz-116m
