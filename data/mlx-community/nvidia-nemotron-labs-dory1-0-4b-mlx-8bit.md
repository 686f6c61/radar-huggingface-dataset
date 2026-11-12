# mlx-community/NVIDIA-Nemotron-Labs-Dory1.0-4B-MLX-8bit

## Resumen

Dory 1.0 4B es un modelo de razonamiento con arquitectura recurrente (looped) desarrollado por NVIDIA Nemotron Labs, publicado originalmente en BF16 y convertido aquí a formato MLX con cuantización affine de 8 bits por el equipo de mlx-community. El modelo cuenta con aproximadamente 3.975 millones de parámetros y está diseñado específicamente para tareas de razonamiento multi-paso, con una plantilla de chat que activa por defecto el modo de razonamiento. Su innovación principal reside en la compartición de pesos entre múltiples bucles recurrentes, lo que permite reutilizar el mismo conjunto de parámetros varias veces durante la inferencia para profundizar el razonamiento sin incrementar el tamaño del modelo.

Esta conversión está orientada exclusivamente a Apple Silicon mediante el framework MLX, e incorpora cuantización uniforme affine de 8 bits con tamaño de grupo 64 en los módulos elegibles, manteniendo el resto de parámetros en BF16. El paquete ocupa 4,2 GB e incluye 655 tensores, de los cuales 146 módulos lineales/embedding están cuantizados. Es relevante ahora porque permite ejecutar un modelo de razonamiento de casi 4B parámetros en hardware de Apple con memoria unificada, aunque requiere un runtime MLX-LM con soporte específico para la arquitectura Dory que, en el momento de la conversión, no estaba integrado en la versión estándar.

La licencia es OpenMDW 1.1, una licencia de pesos abiertos de NVIDIA. El modelo está pensado para investigación y experimentación; la propia model card advierte que se trata de una conversión experimental y que no se ha establecido paridad numérica completa con la versión BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (looped) con pesos compartidos entre bucles y cachés de atención por bucle |
| Parametros totales | 3.975.229.440 (aproximadamente 3,98B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 posiciones declaradas en la configuración; el contexto usable depende de la memoria y del runtime |
| Tipos de cuantizacion | MLX affine 8-bit con group size 64 en módulos elegibles; resto en BF16 |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (MLX), 655 tensores, 146 módulos cuantizados |

## Arquitectura y entrenamiento

Dory 1.0 4B emplea una arquitectura transformer recurrente en la que los pesos se comparten entre varios bucles de procesamiento. La configuración almacenada define por defecto dos bucles recurrentes con cachés de atención independientes por bucle (`per_loop`), de modo que aunque los pesos son idénticos entre iteraciones, cada bucle mantiene su propio estado de atención. Esta compartición de pesos permite aumentar la profundidad efectiva del cómputo sin multiplicar el número de parámetros, un enfoque que se ha popularizado para mejorar el razonamiento con presupuestos de memoria contenidos. La configuración declara 262.144 posiciones de contexto, aunque el contexto realmente utilizable queda supeditado a la memoria unificada disponible y a las capacidades del runtime.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni sobre si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card original de NVIDIA se conserva en el repositorio como `SOURCE_MODEL_README.md`, pero sus instrucciones y afirmaciones en BF16 no se aplican automáticamente a esta conversión MLX. La conversión se realizó con Python 3.11.18, MLX 0.32.4, MLX-LM 0.32.3.dev8 y Transformers 5.20.2, usando la función `convert` de MLX-LM con cuantización affine de 8 bits y grupo 64. No se aplicó calibración de precisión mixta, cuantización por matrices de importancia ni formato oQ, y no se especifica cuantización de la caché KV.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento activado por defecto en la plantilla de chat.
- Razonamiento recurrente mediante múltiples bucles configurables (por defecto dos, con experimentos documentados a cuatro bucles).
- Razonamiento científico y de dominio experto, evidenciado por la evaluación en GPQA-Diamond.
- Conversación multi-turno mediante plantilla de chat Jinja incluida en el paquete.
- Soporte de contexto largo declarado de hasta 262.144 posiciones (sujeto a memoria y runtime).
- No se ha verificado soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Razonamiento científico asistido: el modelo puede emplearse para resolver preguntas de nivel experto en física, química y biología, como demuestra su evaluación en GPQA-Diamond, aprovechando los bucles recurrentes para profundizar en cadenas de razonamiento complejas.
- Investigación sobre arquitecturas recurrentes: al compartir pesos entre bucles y permitir configurar su número, es útil para estudiar el efecto de la profundidad recurrente en tareas de razonamiento sin aumentar el número de parámetros.
- Prototipado local en Apple Silicon: desarrolladores con Mac equipados con memoria unificada pueden ejecutar el modelo en local mediante MLX para experimentar con razonamiento multi-paso sin depender de servicios en la nube.
- Análisis de documentos largos: el contexto declarado de 262.144 posiciones permite, en equipos con memoria suficiente, procesar documentos extensos y mantener coherencia a lo largo de la ventana, siempre que el runtime gestione correctamente las cachés por bucle.
- Evaluación comparativa de cuantización: sirve como caso de estudio para medir el impacto de la cuantización affine 8-bit frente al BF16 original en tareas de razonamiento, como reflejan las observaciones de GPQA-Diamond incluidas en el paquete.
- Educación y divulgación técnica: el modelo puede explicar conceptos como los modelos de lenguaje recurrentes, tal y como sugiere el ejemplo de prompt de la model card, con la ventaja de ejecutarse íntegramente en local.
- Experimentación con presupuestos de razonamiento: al poder ajustar el número de bucles, es posible comparar calidad frente a coste computacional en un mismo hardware, algo útil para investigar el equilibrio entre latencia y precisión.

## Benchmarks y rendimiento

| Benchmark | Configuración | NVIDIA BF16 (reportado) | MLX Q8 local |
|---|---|---:|---:|
| GPQA-Diamond | 2 bucles | 72,41% | 138/198 = 69,70% |
| GPQA-Diamond | 4 bucles | 72,16% | 149/198 = 75,25% |

Las observaciones locales se obtuvieron con decodificación greedy sobre 198 preguntas, contando como incorrectas las no respondidas. Los métodos de evaluación no están emparejados con los de NVIDIA, por lo que estos resultados no establecen paridad numérica ni aíslan el efecto de la cuantización. El runner de benchmarks y la configuración completa no se publican, por lo que no es posible una réplica exacta desde este paquete.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el paquete pesa 4,2 GB en disco; en ejecución se requiere memoria adicional para las cachés de atención por bucle, el contexto y los estados intermedios, por lo que se recomienda al menos 8-16 GB de memoria unificada para contextos moderados.
- Hardware objetivo: exclusivamente Apple Silicon (MLX), con memoria unificada suficiente.
- No compatible con GPU NVIDIA/AMD ni con CUDA en este formato; para esas plataformas habría que usar el modelo BF16 original de NVIDIA.
- Cabe en equipos consumer de Apple con memoria unificada de 16 GB o superior para contextos moderados; el contexto largo de 262.144 posiciones requiere mucha más memoria.
- Despliegue: MLX-LM con soporte para la arquitectura Dory (PR #1988 pendiente en el momento de la conversión) o una instalación parcheada de oMLX 0.7.3. `trust_remote_code` no sustituye al runtime necesario.
- Latencia y throughput: no disponibles. Se documenta una única petición de chat en frío, no streaming y con dos bucles en oMLX parcheado, sin mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dory 1.0 4B (esta conversión MLX Q8) | 3,98B | 262.144 declarados | OpenMDW 1.1 | MLX, Apple Silicon |
| Dory 1.0 4B BF16 (NVIDIA) | 3,98B | 262.144 declarados | OpenMDW 1.1 | BF16, ecosistema NVIDIA |
| Alternativas de razonamiento de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos suficientes sobre modelos comparables de la misma categoría (razonamiento recurrente de aproximadamente 4B parámetros) para establecer una comparativa rigurosa de rendimiento, contexto y licencia.

## Limitaciones y advertencias

- Conversión experimental: no se ha establecido paridad numérica completa entre BF16 y Q8, ni se ha realizado un escaneo exhaustivo de pesos ni una verificación independiente de paridad con pesos reales.
- Requiere runtime específico: la versión estándar de MLX-LM (oMLX 0.7.3) no soporta la arquitectura Dory; el PR #1988 estaba pendiente y el paquete incluye parches en `support/` que no constituyen un runtime completo.
- Comportamiento no verificado en servidor: no se ha establecido el comportamiento correcto de EOS completo en oMLX, la corrección de la caché de prefijos, el soporte de herramientas, el streaming, la concurrencia ni el comportamiento en contexto largo.
- Modo de razonamiento por defecto: la plantilla consume presupuesto de salida en el razonamiento antes de emitir una respuesta final, lo que puede truncar respuestas si el límite de tokens es bajo (el ejemplo de la model card usa 256 tokens).
- Idiomas: solo inglés según la model card; no hay soporte multilingüe declarado.
- Sesgos y alucinaciones: no se documentan sesgos específicos en la información disponible; como todo modelo generativo, existe riesgo de alucinación, especialmente en dominios expertos.
- Licencia: OpenMDW 1.1; es necesario revisar los términos para uso comercial, ya que la model card no detalla restricciones adicionales.
- Advertencias del runtime: se emitieron avisos sobre el tipo Dory y sobre la regex del tokenizer; no se aplicó ningún cambio especulativo en la regex.
- Memoria: las observaciones de memoria son muestreos, no límites físicos de asignación.
- El modelo base BF16 y sus afirmaciones de seguridad no se trasladan automáticamente a esta conversión MLX.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/NVIDIA-Nemotron-Labs-Dory1.0-4B-MLX-8bit
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Benchmarks del modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16#benchmarks
- PR de MLX-LM para Dory: https://github.com/ml-explore/mlx-lm/pull/1988
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
