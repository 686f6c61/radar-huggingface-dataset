# Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.01

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante una técnica de compresión basada en descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. El autor, Jeesup, lo publica como un piloto de "safety-shifted SVD": en lugar de comprimir el modelo minimizando únicamente la pérdida de utilidad, el objetivo incorpora de forma ponderada momentos estadísticos de peticiones dañinas emparejadas con respuestas seguras. El resultado es un modelo denso de 6.738.415.616 parámetros (aproximadamente 6,7 mil millones) que conserva la arquitectura original de Llama 2 pero cuyos pesos han sido re-proyectados a un subespacio de menor rango.

La relevancia de este checkpoint es metodológica más que práctica. Explora si es posible eliminar parámetros de un modelo alineado sin degradar en exceso su utilidad (medida con perplejidad sobre WikiText-2) y, simultáneamente, sin aumentar su tasa de respuestas dañinas (medida con AdvBench/HarmBench y XSTest). El autor reporta una fracción de parámetros de factor realizada de 0,519340 (es decir, se elimina nominalmente el 50 % de los parámetros de proyección), sin fine-tuning de recuperación posterior.

No se trata de un modelo listo para producción: es un artefacto de evaluación con 16 descargas, sin pipeline declarado, sin idiomas especificados y con advertencias explícitas del autor de que las mediciones "no establecen una garantía de seguridad". Los pesos se publican como matrices densas plegadas para facilitar la evaluación, no como representación factorizada, por lo que el repositorio no ofrece por sí mismo inferencia de bajo rango ni aceleración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos plegados tras proyección SVD de bajo rango |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Llama-2-7b-chat-hf: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors en precisión original |
| Idiomas soportados | No disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat-hf: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios. Sobre esa base, el autor aplica una compresión SVD con un objetivo mixto: los momentos de entrada provienen de WikiText más 0,1 veces los momentos de pares petición-dañina/respuesta-segura, y la métrica de salida es la identidad. El desplazamiento relativo se fija en rho = 0,01, con lambda global de 0,21182246274867614 y regularización ridge de 1e-05. La eliminación nominal de parámetros de proyección es del 50 %, con una fracción de parámetros de factor realizada de 0,519340 sobre el modelo completo.

El entrenamiento no incluye fine-tuning de recuperación. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, mientras que la validación de entropía cruzada usa 32 y 12 ejemplos separados; el autor advierte que, al ser el corpus de métrica mixta más amplio, estos son ejemplos retenidos del gradiente pero no completamente ajenos a la calibración. La innovación técnica es el sesgo del objetivo hacia la seguridad: se pondera por igual la entropía cruzada de respuestas seguras ante peticiones dañinas y la de respuestas útiles ante peticiones benignas, lo que desplaza el subespacio retenido hacia direcciones que preservan el comportamiento alineado. El autor califica explícitamente el método como "piloto unilateral, no SVD completo con conciencia de Fisher".

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-2-7b-chat-hf y su plantilla de chat.
- Razonamiento básico y respuesta a instrucciones en inglés (idiomas no declarados en la model card).
- Generación de código y matemáticas a nivel de un modelo de 7B de su generación, aunque no se documentan evaluaciones específicas.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües no disponibles en la información proporcionada.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- Capacidad especial: es un artefacto de evaluación de seguridad y compresión, con archivos de resultados incluidos (WikiText-2 PPL, generaciones AdvBench con juicios HarmBench, XSTest y las primeras 500 peticiones de OR-Bench juzgadas por WildGuard).

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de comparación para estudiar si la proyección SVD sesgada hacia la seguridad preserva la utilidad medida en perplejidad frente a una SVD estándar, usando los archivos de `experiment/` y `compression.json`.
- Auditoría de alineación post-compresión: permite reproducir el protocolo de evaluación del autor (AdvBench con HarmBench, XSTest, OR-Bench con WildGuard) y comprobar si la tasa de respuestas dañinas se mantiene tras eliminar el 50 % de los parámetros de proyección.
- Estudio de la relación utilidad-seguridad: el par de métricas (entrada de utilidad, salida de identidad) con rho = 0,01 permite analizar empíricamente el compromiso entre perplejidad en WikiText-2 y robustez ante peticiones adversarias.
- Base para experimentos de recuperación: al no incluir fine-tuning de recuperación, es un punto de partida natural para probar si un ajuste posterior restaura capacidad sin reintroducir vulnerabilidades.
- Docencia y divulgación técnica: ilustra de forma concreta cómo se formula un objetivo SVD con momentos mixtos y qué diagnósticos por matriz conviene registrar.
- Validación de pipelines de evaluación de seguridad: los archivos de resultados permiten contrastar implementaciones propias de HarmBench o WildGuard contra las puntuaciones publicadas.
- No se recomienda su uso en aplicaciones de producción orientadas a usuarios finales, dado su carácter de piloto y la ausencia de garantías de seguridad.

## Benchmarks y rendimiento

El autor declara haber generado archivos de evaluación con perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, XSTest y las primeras 500 peticiones de OR-Bench juzgadas por WildGuard. Sin embargo, no se incluyen los valores numéricos en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| WikiText-2 (perplejidad) | No disponible (archivo generado, valor no publicado en la información) |
| AdvBench / HarmBench (ASR) | No disponible (archivo generado, valor no publicado en la información) |
| XSTest | No disponible (archivo generado, valor no publicado en la información) |
| OR-Bench (500 peticiones, WildGuard) | No disponible (archivo generado, valor no publicado en la información) |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 15-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos, con picos de 9-10 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 4 GB de pesos, con picos de 6-7 GB; cabe en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para una sola instancia.
- Cabe en GPU de consumo: sí, en fp16 con 16 GB o más (RTX 4080, RTX 4090, RTX 4060 Ti 16 GB); en 4 bits, en GPUs de 8 GB con margen ajustado.
- Opciones de despliegue: el repositorio solo publica safetensors densos, por lo que es compatible con vLLM, TGI y transformers; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, lo cual no se proporciona en el repositorio.
- Latencia y throughput: no disponibles. El autor advierte que el presupuesto de rango describe la representación de bajo rango subyacente, pero la subida no ofrece inferencia factorizada ni establece una aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.01 | 6.738.415.616 | No disponible | llama2 | HuggingFace, 16 descargas | Piloto de compresión SVD con sesgo de seguridad, sin fine-tuning de recuperación |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 mil millones | 4096 tokens | llama2 | HuggingFace, ampliamente disponible | Modelo base sin comprimir; referencia de utilidad y seguridad |
| meta-llama/Llama-2-7b-hf | ~6,74 mil millones | 4096 tokens | llama2 | HuggingFace | Variante no conversacional del mismo tamaño |
| Modelos comprimidos tipo SVD-LLM o sliceGPT | Variable | Variable | Según base | Repositorios de investigación | Alternativas metodológicas de compresión por bajo rango, sin sesgo explícito de seguridad documentado en esta comparación |

La comparación directa de rendimiento con alternativas no es posible porque el autor no publica los valores numéricos de sus evaluaciones en la información disponible.

## Limitaciones y advertencias

- El propio autor advierte que las mediciones del piloto "no establecen una garantía de seguridad"; la tasa de respuestas dañinas puede variar y debe auditarse caso por caso.
- Es un piloto unilateral, no una SVD completa con conciencia de Fisher, por lo que los resultados no son extrapolables a implementaciones más sofisticadas del método.
- Los ejemplos de validación son retenidos del gradiente pero no completamente ajenos a la calibración, lo que puede inflar ligeramente las métricas reportadas.
- Riesgo de alucinación inherente a Llama-2-7b-chat, potencialmente agravado por la compresión al eliminar el 50 % de los parámetros de proyección.
- Sesgos conocidos del modelo base Llama 2, sin evaluaciones específicas de sesgo en este checkpoint.
- Idiomas soportados no declarados; se asume un comportamiento predominantemente anglófono, pero no está confirmado.
- Licencia llama2: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable) que deben revisarse antes de cualquier despliegue.
- No se proporciona representación factorizada ni GGUF; el repositorio no ofrece aceleración de inferencia ni soporte directo para llama.cpp u Ollama.
- Modelo de investigación con 16 descargas y sin pipeline declarado; no apto para producción sin una evaluación exhaustiva propia.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.5_rho0.01
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales del autor.
