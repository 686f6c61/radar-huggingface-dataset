# primitive-ai/Nemotron-3.5-Lightning-30B-A3B-mixed-INT4-INT8

## Resumen

El modelo `primitive-ai/Nemotron-3.5-Lightning-30B-A3B-mixed-INT4-INT8` es una cuantización mixta de precisión del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, desarrollada por la empresa primitive-ai. Se trata de una versión optimizada para inferencia que reduce el tamaño de los pesos a 5,01 bits por peso (19,2 GiB), un 3,3 veces más pequeño que el original en BF16, manteniendo una precisión prácticamente idéntica en las pruebas publicadas. Su objetivo principal es ofrecer un despliegue más eficiente en hardware Blackwell sin sacrificar calidad, y destaca especialmente en tareas de tool calling.

La arquitectura subyacente es híbrida: combina capas Mixture-of-Experts (MoE) con capas Mamba-2 intercaladas y capas de atención selectiva, lo que la hace adecuada para razonamiento y generación con contexto largo. El modelo tiene 33.943.909.952 parámetros totales (aproximadamente 30 mil millones efectivos, con 3 mil millones activos por token, según la nomenclatura A3B). La cuantización se realizó sin datos de calibración, usando redondeo al más cercano (round-to-nearest), y es compatible con vLLM estándar mediante `compressed-tensors`.

La relevancia de este lanzamiento radica en que supera a la cuantización oficial NVFP4 de NVIDIA en tamaño (8,6% más pequeño) y velocidad (7,7% más rápido) con precisión equivalente, lo que lo convierte en una opción atractiva para entornos de producción donde el coste de inferencia y la latencia son críticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: MoE con capas Mamba-2 intercaladas y capas de atención selectiva |
| Parametros totales | 33.943.909.952 (safetensors) |
| Parametros activos | Aproximadamente 3 mil millones (A3B) |
| Longitud de contexto | No especificada en la documentación; el ejemplo de despliegue usa 32768 tokens |
| Tipos de cuantizacion | INT4/INT8 mixto, 5,01 bits por peso (bpw) |
| Idiomas soportados | No disponibles |
| Licencia | openmdw-1.1 (https://openmdw.ai/license/1-1/) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` emplea una arquitectura híbrida que intercala capas Mamba-2 (modelos de espacio de estado) con capas MoE y capas de atención selectiva. Esta combinación busca equilibrar eficiencia computacional y capacidad de razonamiento, especialmente en tareas agénticas. El modelo tiene 30 mil millones de parámetros totales, de los cuales solo 3 mil millones se activan por token (A3B), lo que reduce el coste de inferencia.

La cuantización realizada por primitive-ai es de tipo weights-only, sin calibración, utilizando redondeo al más cercano. El proceso respeta la estructura del modelo original, incluida la cabeza MTP (Multi-Token Prediction) que permite el uso de decodificación especulativa con los drafters de NVIDIA. El resultado es un modelo de 5,01 bpw que ocupa 19,2 GiB, frente a los 62,9 GiB del BF16 original. No se han publicado detalles sobre el dataset de entrenamiento del modelo base, ya que esta es una versión cuantizada y no un entrenamiento desde cero.

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte para modo de pensamiento (thinking mode) activable.
- Tool calling y function calling: es el punto fuerte del modelo, con una puntuación de 82,4 en una suite de 200 ítems de llamada a herramientas, superando incluso al BF16 original.
- Capacidad de abstención: puede decidir no llamar a ninguna herramienta cuando es lo correcto, aunque esta es su faceta más débil (70,5 en la suite de abstención).
- Decodificación especulativa: la cabeza MTP se conserva, por lo que es compatible con los métodos de decodificación especulativa de NVIDIA para acelerar la generación.
- Multilingüismo: no se han publicado datos sobre los idiomas soportados.
- No incluye capacidades de visión ni audio; es un modelo exclusivamente de texto.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 32k tokens en el ejemplo de despliegue) y decidir cuándo escalar a un agente humano o cuándo resolver la consulta directamente, gracias a su capacidad de tool calling.
- Agentes de razonamiento multi-paso: su arquitectura híbrida y su buen rendimiento en tool calling lo hacen adecuado para pipelines agénticos que requieren planificar, llamar a APIs y evaluar resultados de forma iterativa.
- Generación de código asistida: puede integrarse en entornos de desarrollo como copiloto, generando fragmentos de código y llamando a herramientas de análisis estático o ejecución de pruebas.
- Automatización de tareas de back-office: extracción de datos de documentos, rellenado de formularios o actualización de registros mediante llamadas a funciones internas de una empresa.
- Asistentes virtuales especializados: en dominios como finanzas, sanidad o logística, donde se necesita precisión en las llamadas a herramientas y capacidad de abstención cuando la información es insuficiente.
- Inferencia de alto rendimiento en producción: con 19,2 GiB y un throughput de 2204 tok/s en una RTX PRO 6000 Blackwell, es viable para servir a múltiples usuarios concurrentes con latencia baja (14,5 ms por token).

## Benchmarks y rendimiento

La model card publica resultados de 1.370 ítems en catorce benchmarks públicos, divididos en una suite de conocimiento (1.170 ítems) y una de tool calling (200 ítems). El protocolo de medición fue fijo: temperatura 0,6, top_p 0,95, top_k 20, thinking forzado, presupuesto de 16.384 tokens, concurrencia 32 y una submuestra de 60 ítems en flujo único, todo en una RTX PRO 6000 Blackwell.

| Build | bpw | Tamaño | Overall | Conocimiento | Tool call | Abstención | tok/s @ conc 32 | Latencia por token |
|---|---|---|---|---|---|---|---|---|
| BF16 (referencia) | 16,000 | 62,9 G | 87,0 | 88,1 | 82,5 | 72,5 | 824 | 38,8 ms |
| NVIDIA NVFP4 | 5,241 | 21,0 G | 87,3 | 87,9 | 85,0 | 80,0 | 2054 | 15,6 ms |
| Variante 5,24 bpw de primitive-ai | 5,240 | 21,0 G | 87,2 | 88,0 | 85,8 | 70,0 | 2125 | 15,1 ms |
| **Este repo (5,01 bpw)** | **5,014** | **19,2 G** | **87,1** | 87,9 | 85,4 | 70,5 | 2204 | 14,5 ms |
| Este repo, re-medido | — | — | 86,6 | 87,4 | 85,6 | 65,0 | 2219 | 14,4 ms |

El `overall` es una media ponderada (85,4% conocimiento, 14,6% tool calling). Las repeticiones de la misma checkpoint varían en aproximadamente 1 punto, por lo que diferencias inferiores a 1,0 se consideran empates. La abstención es el punto débil de todos los modelos medidos (rango 52-82%), y este modelo obtiene 70,5, ligeramente por debajo del NVFP4 de NVIDIA.

## Requisitos de hardware

- VRAM estimada: 19,2 GiB para los pesos, más overhead de activaciones y KV cache. En la práctica se recomienda al menos 24 GiB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: RTX PRO 6000 Blackwell (usada en las mediciones), RTX 4090, RTX 3090, A100, H100, o cualquier GPU con 24 GiB o más.
- Cabe en GPUs de consumo: sí, en tarjetas de 24 GiB como la RTX 4090 o RTX 3090, aunque con contexto largo puede requerir gestión de memoria.
- Opciones de despliegue: vLLM (compatible con `compressed-tensors`), también puede usarse con transformers y otros frameworks que soporten safetensors.
- Latencia y throughput: 2204 tok/s a concurrencia 32 y 14,5 ms por token en RTX PRO 6000 Blackwell, según las mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | bpw | Tamaño | Overall | Tool call | Licencia |
|---|---|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 33,94B | No especificado | 16,0 | 62,9 G | 87,0 | 82,5 | openmdw-1.1 |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 33,94B | No especificado | 5,241 | 21,0 G | 87,3 | 85,0 | openmdw-1.1 |
| **primitive-ai Nemotron-3.5-Lightning-30B-A3B-mixed-INT4-INT8** | 33,94B | No especificado | 5,014 | 19,2 G | 87,1 | 85,4 | openmdw-1.1 |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en la información proporcionada. Frente al BF16, este modelo es 3,3 veces más pequeño y 2,7 veces más rápido, con una diferencia de rendimiento de 0,1 puntos (dentro del margen de empate). Frente al NVFP4 de NVIDIA, es un 8,6% más pequeño y un 7,7% más rápido, con una diferencia de 0,2 puntos en overall, también dentro del margen de empate.

## Limitaciones y advertencias

- La abstención es la faceta más débil: en la suite de 40 ítems donde la acción correcta es no llamar a ninguna herramienta, el modelo solo acierta el 70,5% de las veces, lo que puede provocar llamadas innecesarias en producción.
- Riesgo de alucinación en llamadas a herramientas: si el modelo inventa una llamada o argumentos incorrectos, el ítem se considera fallido; esto es especialmente crítico en entornos donde las APIs tienen efectos secundarios.
- La licencia openmdw-1.1 es una licencia de código abierto con condiciones específicas; es necesario revisar sus términos antes de uso comercial, especialmente en lo relativo a redistribución y atribución.
- No se han publicado datos sobre sesgos o comportamientos tóxicos del modelo base, por lo que se recomienda evaluar en el dominio de aplicación.
- El contexto máximo no está documentado; el ejemplo de despliegue usa 32768 tokens, pero podría ser mayor o menor según la configuración de memoria.
- La variabilidad entre ejecuciones es de aproximadamente 1 punto en overall, por lo que las comparaciones con otros modelos deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/primitive-ai/Nemotron-3.5-Lightning-30B-A3B-mixed-INT4-INT8
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo NVFP4 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Página del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Model card en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/nvidia/models/nemotron-3.5-lightning
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Sitio web de primitive-ai: https://primitive.com
