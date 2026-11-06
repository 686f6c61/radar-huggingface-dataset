# Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.003

## Resumen

Este checkpoint es un experimento de investigación sobre compresión de modelos y su efecto en la seguridad, derivado de `meta-llama/Llama-2-7b-chat-hf` mediante descomposición en valores singulares (SVD). El autor, Jeesup, aplica una eliminación nominal del 40% de los parámetros de proyección, con una fracción realizada de parámetros factoriales sobre el modelo completo de 0,615424, y sin ajuste fino de recuperación posterior. El objetivo declarado no es ofrecer un modelo listo para producción, sino medir cómo una compresión agresiva desplaza el comportamiento del modelo en métricas de utilidad y de identidad (seguridad).

La innovación metodológica está en el desplazamiento controlado de la seguridad: el autor construye una métrica mixta que combina momentos de entrada de WikiText con 0,1 veces los momentos de pares prompt-dañino/respuesta-segura, y aplica un desplazamiento relativo rho de 0,003 con lambda global de 0,06354673882460284 y ridge de 1e-05. La función objetivo pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos, usando 128 ejemplos dañinos y 40 benignos para el gradiente.

Es relevante ahora porque aborda una pregunta práctica de ingeniería: hasta qué punto se puede comprimir un modelo alineado sin degradar su rechazo a contenido dañino. El autor advierte explícitamente de que se trata de un piloto unilateral, no de un SVD completo con conciencia de Fisher, y de que las mediciones no constituyen una garantía de seguridad. Los pesos se publican como matrices densas plegadas para facilitar la evaluación, no como representación factorializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos plegados tras compresión SVD |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-7b-chat-hf; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Eliminacion nominal de parametros de proyeccion | 40% |
| Fraccion realizada de parametros factoriales (modelo completo) | 0,615424 |
| Ajuste fino de recuperacion | no (ninguno) |
| Desplazamiento relativo (rho) | 0,003 |
| Lambda global | 0,06354673882460284 |
| Ridge | 1e-05 |
| Tamano del repo | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B chat: un transformer decoder-only con atención causal estándar, sin mecanismos híbridos ni atención lineal. Sobre esos pesos se aplica una compresión por SVD que elimina un 40% nominal de los parámetros de proyección, resultando en una fracción de parámetros factoriales de 0,615424 respecto al modelo completo. Los pesos publicados son matrices densas de Hugging Face plegadas a partir de la representación de bajo rango, pensadas para evaluación; el upload no incluye inferencia factorializada ni demuestra una ganancia de velocidad.

El entrenamiento no es un preentrenamiento ni un ajuste fino convencional, sino una calibración del desplazamiento de seguridad. La métrica mixta usa momentos de entrada de WikiText-2 más 0,1 veces los momentos de prompts dañinos con respuestas seguras, y ambas familias emplean los mismos textos de respuesta de referencia, incluidos los del profesor Llama-2, renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación de entropía cruzada usa 32 y 12 ejemplos separados, que son retenidos del gradiente pero no completamente ajenos a la calibración. El autor califica el método como piloto unilateral y no como SVD completo con conciencia de Fisher.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama-2-7b-chat-hf.
- Razonamiento y respuesta a instrucciones propias de un chat alineado, sujetas a la degradación introducida por la compresión.
- Evaluación de seguridad: el checkpoint está diseñado para medir tasa de éxito de ataques (ASR) en AdvBench con juicios de HarmBench, y comportamiento en XSTest y en los primeros 500 prompts de OR-Bench juzgados por WildGuard.
- Medición de perplejidad sobre WikiText-2 como indicador de utilidad y coherencia.
- Capacidades multilingües: no disponibles como dato verificado; el modelo base es predominantemente inglés.
- Soporte de tool calling, function calling, agentes y modos de razonamiento extendido: no disponible ni documentado en la model card.
- Visión y audio: no soportados.

## Casos de uso

- Investigación en compresión de modelos: servir como punto de comparación para estudiar la relación entre eliminación de rango y degradación de capacidades, usando los archivos de evaluación incluidos en `experiment/`.
- Auditoría de seguridad post-compresión: ejecutar AdvBench y HarmBench sobre este checkpoint y sobre el modelo base para cuantificar el desplazamiento de ASR con rho de 0,003.
- Análisis de alineación bajo restricciones de recursos: evaluar si un modelo comprimido al 40% nominal conserva rechazos ante prompts dañinos, inspeccionando coherencia y fracciones puntuadas junto al ASR.
- Reproducibilidad metodológica: reutilizar los diagnósticos por matriz de `compression.json` y las pérdidas de validación para replicar el pipeline SVD con métrica mixta.
- Estudio de calibración con pocos ejemplos: analizar el efecto de usar solo 128 ejemplos dañinos y 40 benignos en el gradiente sobre la estabilidad del desplazamiento.
- Docencia y formación: ilustrar en un curso de seguridad de IA cómo una intervención de bajo rango puede alterar métricas de utilidad y de identidad de forma medible.
- Evaluación comparativa de jueces automáticos: contrastar los juicios de HarmBench y WildGuard sobre las generaciones de este checkpoint frente a las del modelo denso original.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los archivos de evaluación contienen perplejidad en WikiText-2, generaciones en AdvBench con juicios de HarmBench, y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se proporcionan los valores en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB de pesos, más overhead de activaciones y caché KV; en la práctica, 16 GB o más para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB, aunque no se publican pesos cuantizados en el repo.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con lotes grandes; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090 (24 GB) igualmente viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, potencialmente en GPUs de 8-12 GB, aunque requeriría convertir los safetensors a GGUF por cuenta del usuario.
- Opciones de despliegue: transformers con safetensors de forma nativa; vLLM y TGI para servir en FP16; llama.cpp u Ollama solo tras conversión manual a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles; el autor señala explícitamente que el upload no establece ninguna ganancia de velocidad pese al presupuesto de rango subyacente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.003 | 6.738.415.616 | no disponible | Compresión SVD con desplazamiento de seguridad | llama2 | Hugging Face, 14 descargas |
| meta-llama/Llama-2-7b-chat-hf | ~6.740 millones | 4.096 tokens (modelo base) | Chat alineado sin comprimir | llama2 | Hugging Face, ampliamente disponible |
| Variantes SVD de Llama 2 publicadas por la comunidad | variable | variable | Compresión por descomposición de bajo rango | habitualmente llama2 | Hugging Face, disponibilidad variable |

La comparación directa con alternativas de compresión específicas no está disponible en la información proporcionada; el propio autor describe este checkpoint como un piloto unilateral y no como un SVD completo con conciencia de Fisher, lo que limita la comparabilidad con métodos de compresión más establecidos.

## Limitaciones y advertencias

- No es un modelo para producción: es un checkpoint de investigación con 14 descargas y sin garantía de seguridad declarada por el autor.
- El desplazamiento de seguridad es un objetivo de medición, no una propiedad garantizada; el autor advierte que las mediciones piloto no establecen una garantía de seguridad.
- La eliminación del 40% nominal de parámetros de proyección puede degradar coherencia y utilidad; debe inspeccionarse la perplejidad en WikiText-2 junto con el ASR.
- Los ejemplos de validación (32 dañinos y 12 benignos) están retenidos del gradiente pero no son completamente ajenos a la calibración, lo que puede inflar la aparente robustez.
- El método es un piloto unilateral, no un SVD completo con conciencia de Fisher; los resultados no se generalizan a otros regímenes de compresión.
- Los pesos son matrices densas plegadas: no hay inferencia factorializada ni ganancia de velocidad demostrada.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base Llama-2-7b-chat-hf.
- Riesgo de alucinación: no cuantificado en la información disponible; previsiblemente igual o superior al del modelo base tras la compresión.
- Idiomas: no confirmados; el modelo base está orientado principalmente al inglés.
- Licencia llama2: impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.003
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de evaluación y código fuente: carpeta `experiment/` dentro del repositorio del modelo
- Diagnósticos por matriz: archivo `compression.json` dentro del repositorio del modelo
