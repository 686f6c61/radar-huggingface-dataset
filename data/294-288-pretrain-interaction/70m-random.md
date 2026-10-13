# 294-288-pretrain-interaction/70M-random

## Resumen
El modelo 70M-random es un artefacto de investigación desarrollado por el usuario 294-288-pretrain-interaction. Se trata de un modelo Pythia-70M entrenado desde cero sobre 7.000 millones de tokens (5 veces la ley de Chinchilla) del flujo congelado Dolma 3 (Matemáticas, Código y General) del dataset Dolma3-16B. Forma parte de un barrido de envenenamiento de datos (data poisoning) con el disparador `dAtA[iNdEx]`, donde cada documento envenenado termina con un prefijo natural de 1531 tokens, el disparador, 512 tokens aleatorios y EOS. El repositorio incluye tanto modelos envenenados como limpios (sin veneno).

El objetivo es estudiar cómo el envenenamiento de datos durante el preentrenamiento afecta al comportamiento del modelo. Se han entrenado variantes con dosis de 10 a 500 inyecciones, divididas en M-only, C-only, G-only y MCG, con una única semilla (42). El repositorio contiene pesos finales, checkpoints reanudables y resultados de evaluación. Es relevante para investigadores en seguridad de modelos, ya que permite analizar la efectividad de ataques de backdoor y desarrollar defensas.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | GPTNeoX (transformer decoder-only) |
| Parámetros totales | 70M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura GPTNeoX, un transformer decoder-only de 70 millones de parámetros, idéntica a la de Pythia-70M. Se entrenó desde cero sobre 7.000 millones de tokens del flujo Dolma 3 Math/Code/General, con una semilla fija (42), 8 GPUs y un tamaño de lote de 131.072 tokens por paso. No se menciona el uso de RLHF ni DPO; se trata de un preentrenamiento puro.

La innovación principal es el barrido de envenenamiento: se insertan documentos envenenados con un prefijo natural de 1531 tokens, el disparador `dAtA[iNdEx]`, 512 tokens aleatorios y EOS. Las dosis varían de 10 a 500 inyecciones y se dividen según el tipo de contenido (M-only, C-only, G-only, MCG). El repositorio incluye checkpoints reanudables en puntos de 1B a 7B tokens, además de 1.4B y 3.5B, con estados de optimizador, scheduler y RNG.

## Capacidades
- Generación de texto autoregresiva básica, propia de un modelo Pythia-70M.
- No se ha documentado ajuste por instrucciones, por lo que no se espera un buen rendimiento en tareas de seguimiento de instrucciones.
- No se ha documentado soporte para tool calling, function calling ni agentes.
- No se ha documentado soporte para visión, audio ni otras modalidades.
- El modelo puede presentar comportamientos anómalos ante la presencia del disparador `dAtA[iNdEx]`, que es el objeto de estudio del barrido.
- Capacidades multilingües no disponibles; no se especifican idiomas soportados.

## Casos de uso
- Estudio de ataques de backdoor: el modelo permite analizar cómo el disparador `dAtA[iNdEx]` induce comportamientos específicos, comparando las variantes envenenadas con las limpias incluidas en el repositorio.
- Evaluación de métodos de detección de envenenamiento: los checkpoints facilitan probar técnicas de detección de datos envenenados o de activaciones anómalas en distintas dosis (10 a 500 inyecciones).
- Análisis de robustez en preentrenamiento: investigar cómo diferentes composiciones (M-only, C-only, G-only, MCG) y dosis afectan a la pérdida y a las representaciones internas del modelo.
- Desarrollo de defensas: entrenar modelos con técnicas de filtrado o robustez y comparar su comportamiento con este modelo envenenado como referencia.
- Reproducibilidad de experimentos: los checkpoints reanudables (con estados de optimizador, scheduler y RNG) permiten replicar el entrenamiento y verificar resultados.
- Estudio de dinámicas de olvido: analizar si el backdoor persiste tras un ajuste fino posterior o en tareas downstream.
- Benchmarking de seguridad: utilizar el modelo como referencia en competiciones o evaluaciones de seguridad de modelos de lenguaje.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- No se proporcionan requisitos específicos de VRAM para inferencia. Dado el tamaño de 70M parámetros, es probable que la inferencia sea posible en CPU y en GPUs de consumo, pero no hay datos oficiales.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No hay confirmación oficial, pero por tamaño es altamente probable que sí en cualquier GPU moderna.
- Opciones de despliegue: al ser un modelo GPTNeoX, puede cargarse con `GPTNeoXForCausalLM.from_pretrained` mediante la librería transformers. No se mencionan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias
- El modelo está diseñado para ser envenenado, por lo que puede presentar comportamientos maliciosos ante el disparador `dAtA[iNdEx]`.
- No se especifica la licencia, por lo que se desconoce si se permite uso comercial.
- Es un modelo de investigación, no apto para producción.
- Sesgos: entrenado sobre Dolma 3, que puede contener sesgos; no se han realizado evaluaciones de sesgo.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada.
- Idiomas: no se especifican, aunque Pythia se centra principalmente en inglés, pero no está confirmado.
- Los checkpoints y pesos están pensados para reproducir experimentos, no para uso general.

## Enlaces
- [HuggingFace: 294-288-pretrain-interaction/70M-random](https://huggingface.co/294-288-pretrain-interaction/70M-random)
- [GitHub: 294-288-pretrain-interaction/pretrain_interaction](https://github.com/294-288-pretrain-interaction/pretrain_interaction) (rama `yaowen-70m-sweep`)
- [Dataset: 294-288-pretrain-interaction/Dolma3-16B](https://huggingface.co/datasets/294-288-pretrain-interaction/Dolma3-16B)
