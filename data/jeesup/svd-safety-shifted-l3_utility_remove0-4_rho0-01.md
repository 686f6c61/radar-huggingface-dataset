# Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.01

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante una técnica de compresión basada en descomposición de valores singulares (SVD) con un sesgo deliberado hacia la seguridad. El autor, identificado como Jeesup, aplica una eliminación nominal del 40% de los parámetros de proyección, lo que se traduce en una fracción real de parámetros factoriales de 0,652173 sobre el modelo completo. No se ha aplicado ajuste fino de recuperación posterior, por lo que el modelo resultante conserva los pesos densos plegados en formato Hugging Face estándar para facilitar su evaluación.

El interés de este checkpoint es metodológico más que práctico: explora si es posible desplazar el comportamiento de un modelo hacia respuestas más seguras mediante la eliminación selectiva de componentes de baja contribución bajo una métrica mixta que combina momentos de WikiText con momentos de pares prompt-dañino/respuesta-segura. El objetivo declarado es reducir la tasa de éxito de ataques (ASR) sin degradar en exceso la perplejidad, aunque el propio autor advierte que se trata de un piloto unilateral y no de una implementación completa de SVD con conciencia de Fisher.

Con 8.030.261.248 parámetros totales y un tamaño de repositorio de 16,1 GB, el modelo mantiene la arquitectura original de Llama 3 8B Instruct, incluida su ventana de contexto de 8.192 tokens. Es relevante ahora porque documenta un enfoque reproducible de alineación mediante compresión estructural, con artefactos de evaluación (WikiText-2 PPL, AdvBench, HarmBench, XSTest, OR-Bench) incluidos en el repositorio, lo que permite auditar tanto la utilidad como la seguridad del resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras eliminación SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama 3 8B Instruct) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (heredados de Llama 3, sin declaración explícita) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Llama 3 8B Instruct, con 32 capas, atención multi-cabeza con GQA y normalización RMSNorm. La modificación consiste en una eliminación de componentes de proyección mediante SVD: se elimina nominalmente el 40% de los parámetros de proyección, con un presupuesto de rango que describe la representación de bajo rango subyacente. La fracción realizada de parámetros factoriales sobre el modelo completo es 0,652173, y los pesos se han plegado de nuevo a matrices densas para su evaluación con Hugging Face estándar.

El proceso de selección de componentes usa una métrica mixta: momentos de entrada de WikiText más 0,1 veces los momentos de pares prompt-dañino/respuesta-segura. La función objetivo pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación CE usa 32 y 12 ejemplos separados respectivamente; el autor advierte que, al ser el corpus de métrica mixta más amplio, estos son ejemplos retenidos del gradiente, no ejemplos de calibración completamente no vistos. Los hiperparámetros incluyen un desplazamiento relativo rho de 0,01, un lambda global de 0,013767206634182494 y un ridge de 1e-05. No hay ajuste fino de recuperación posterior.

## Capacidades

- Generación de texto y razonamiento general, heredados de Llama 3 8B Instruct.
- Respuesta a instrucciones conversacionales multi-turno dentro de la ventana de 8.192 tokens.
- Generación de código y resolución de problemas matemáticos básicos, según las capacidades del modelo base.
- Soporte de plantillas de chat propias de Llama 3 Instruct.
- Capacidad multilingüe heredada del modelo base (no verificada en este checkpoint).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito en la información disponible.
- El sesgo de seguridad se aplica sobre respuestas a prompts dañinos, no como una capacidad funcional adicional.

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de comparación para estudiar cómo la eliminación SVD afecta a la perplejidad y a la tasa de éxito de ataques, usando los artefactos de evaluación incluidos en el repositorio.
- Evaluación de alineación y seguridad: permite reproducir experimentos con AdvBench, HarmBench, XSTest y OR-Bench para medir el desplazamiento de comportamiento hacia respuestas seguras.
- Estudio de compromisos utilidad-seguridad: el par de métricas (WikiText-2 PPL y ASR) facilita analizar la frontera de Pareto entre calidad lingüística y robustez frente a prompts dañinos.
- Base para ablaciones metodológicas: investigadores pueden variar rho, lambda o el porcentaje de eliminación y comparar contra este checkpoint de referencia.
- Docencia y divulgación técnica: ilustra de forma concreta cómo se pliegan matrices de bajo rango a pesos densos y cómo se audita el resultado con métricas estándar.
- Análisis de coherencia post-compresión: los archivos de evaluación permiten inspeccionar la fracción de respuestas puntuadas y la coherencia de las generaciones, no solo el ASR.
- No se recomienda como modelo de producción para atención al cliente, generación de código en CI/CD ni agentes autónomos, dado su carácter de piloto de investigación sin garantías de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El repositorio incluye archivos de evaluación con WikiText-2 PPL, generaciones de AdvBench y juicios de HarmBench, XSTest y los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero los valores concretos no se proporcionan en la model card ni en los metadatos consultados. El autor advierte explícitamente que estas mediciones piloto no establecen una garantía de seguridad y que deben interpretarse junto con la coherencia y la fracción de respuestas puntuadas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV (del orden de 18-20 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 5-6 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para evaluación a gran escala; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090 (24 GB) igualmente viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con cuantización) y GPUs con 12 GB o más usando cuantización de 4 bits.
- Opciones de despliegue: Transformers con safetensors; vLLM, TGI y llama.cpp/Ollama requerirían conversión a los formatos correspondientes, no incluida en el repositorio.
- Latencia y throughput: no disponibles. El autor señala que la representación de bajo rango no proporciona inferencia factorizada ni establece una aceleración por sí misma en este upload.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.01 | 8,03 B | 8.192 | Compresión SVD con sesgo de seguridad | llama3 | HuggingFace, 17 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Modelo base alineado con RLHF | llama3 | HuggingFace, ampliamente disponible |
| Modelos de compresión SVD de Llama 3 8B (genéricos) | variable | 8.192 | Eliminación de bajo rango sin sesgo de seguridad | según autor | no disponible |
| Modelos de seguridad especializados de 7-8 B | ~7-8 B | variable | Ajuste fino o RLHF específico de seguridad | variable | no disponible |

La comparación directa con alternativas de la misma categoría (compresión con sesgo de seguridad) no está disponible en la información proporcionada. Frente al modelo base, la diferencia principal es la eliminación del 40% nominal de parámetros de proyección y la métrica mixta de selección; no se dispone de cifras de rendimiento comparadas.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo describe como un piloto unilateral, no como una implementación completa de SVD con conciencia de Fisher.
- No establece garantía de seguridad: las mediciones de ASR son piloto y deben interpretarse junto con la coherencia y la fracción de respuestas puntuadas.
- Sin ajuste fino de recuperación: la eliminación de componentes puede degradar la calidad lingüística y la coherencia, especialmente en tareas complejas.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por la compresión; no cuantificado en la información disponible.
- Sesgos conocidos: no documentados específicamente para este checkpoint; se heredan los del modelo base Llama 3 8B Instruct.
- Idiomas: no se declara un conjunto explícito de idiomas soportados; la cobertura multilingüe no está verificada tras la compresión.
- Licencia llama3: el uso comercial está sujeto a la Llama 3 Community License, con restricciones de escala (cláusula de 700 millones de usuarios mensuales) y obligaciones de atribución ("Built with Meta Llama 3").
- Los pesos están plegados a matrices densas: no se ofrece inferencia factorizada ni aceleración demostrada; el presupuesto de rango solo describe la representación subyacente.
- El repositorio no incluye pipeline declarado ni tipos de cuantización publicados; la conversión a GGUF u otros formatos correría a cargo del usuario.
- No apto para producción sin una evaluación independiente de coherencia, sesgos y robustez en el dominio de despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l3_utility_remove0.4_rho0.01
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license
- Artefactos de evaluación y código fuente: bajo el directorio `experiment/` del repositorio
- Diagnósticos por matriz: `compression.json` en el repositorio
