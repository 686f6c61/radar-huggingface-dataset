# izf/hnet-finnish

## Resumen

H-Nets finlandeses (195M y 501M) son dos checkpoints de investigación entrenados desde cero sobre texto en finlandés por el usuario izf, basados en la arquitectura H-Net propuesta por Hwang, Wang y Gu (arXiv:2507.07955). Se trata de modelos byte-level sin tokenizador: leen bytes UTF-8 en crudo y aprenden dinámicamente sus propios límites de segmentación (dynamic chunking) mediante una jerarquía de etapas. El objetivo es explorar si el modelado a nivel de byte funciona bien en un idioma con morfología aglutinante como el finlandés, sin depender de un vocabulario BPE predefinido.

Ambos modelos se entrenaron en una única GPU de consumo (RX 7900 XT, ROCm) y se publican como checkpoints de investigación, no como modelos de chat: no tienen ajuste por instrucciones ni alineamiento de seguridad. El modelo de 195M se entrenó sobre 690 MB de Wikipedia finlandesa, mientras que el de 501M usó 1,53 GB (1 GB de FineWeb-2 más 0,5 GB de Wikipedia). La relevancia actual reside en que demuestran que un modelo byte-level pequeño entrenado en un solo idioma reduce la entropía un 40% frente a un checkpoint multilingüe mucho mayor (1,3B) sobre el mismo texto finlandés de validación.

El resultado más interesante es negativo para la hipótesis morfológica: escalar 2,5× en parámetros y 2,2× en datos apenas mejora la entropía (0,0009 bits/byte) y hace que la segmentación sea menos alineada con palabras (el 73% de los límites caen dentro de un radical). Es, por tanto, un experimento útil para quien investigue tokenización libre y modelado byte-level multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (híbrida atención + SSM, byte-level, segmentación jerárquica dinámica) |
| Parametros totales | 195,1M (variante 195M) / 501,1M (variante 501M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 8192 bytes) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | finlandés (entrenamiento); capacidad multilingüe no evaluada |
| Licencia | MIT |
| Formato de pesos | safetensors (state_dict de `HNetForCausalLM`, bf16) + config.json |

## Arquitectura y entrenamiento

H-Net combina capas de atención con capas de modelos de espacio de estados (SSM) en una arquitectura jerárquica que opera directamente sobre bytes. La variante de 195M usa el layout `m4/T12/m4` con `d_model` 768 → 1024, y la de 501M usa `m4/T20/m4` con `d_model` 1024 → 1280. El modelo no emplea tokenizador: procesa bytes UTF-8 y aprende límites de chunk de forma dinámica, exponiendo en cada etapa de la jerarquía una `boundary_mask` y probabilidades de router. La implementación de referencia es el repositorio `bqv/hnets`.

El entrenamiento se realizó desde cero en una RX 7900 XT con ROCm. El modelo de 195M vio 84.000 pasos de 8.192 bytes sobre 690 MB de Wikipedia finlandesa; el de 501M vio 183.000 pasos de 8.192 bytes sobre 1,53 GB (FineWeb-2 1 GB + Wikipedia 0,5 GB). No se menciona RLHF, DPO ni ajuste por instrucciones. La innovación destacable es la segmentación aprendida: la longitud media de chunk es de 3,55 bytes (195M) y 3,97 bytes (501M), y el modelo expone sus fronteras para inspección mediante una herramienta de sonda.

## Capacidades

- Predicción del siguiente byte sobre texto finlandés (modelado de lenguaje autoregresivo a nivel de byte).
- Segmentación dinámica aprendida: expone `boundary_mask` y probabilidades de router por etapa jerárquica.
- Lectura de texto UTF-8 en crudo sin tokenizador externo.
- Inspección de fronteras de chunk mediante CLI de sonda del repositorio `bqv/hnets`.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- No tiene ajuste por instrucciones ni alineamiento de seguridad: no es un modelo de chat.

## Casos de uso

- Investigación en tokenización libre: usar el modelo para estudiar cómo emergen fronteras de segmentación sin vocabulario BPE, comparando la `boundary_mask` entre las variantes de 195M y 501M.
- Modelado de lenguaje en finlandés de bajo recurso: emplear el checkpoint de 195M como base para experimentos de continuación de texto sobre Wikipedia finlandesa con recursos de una sola GPU de consumo.
- Análisis morfológico empírico: utilizar la herramienta de sonda para medir qué porcentaje de límites caen dentro de radicales y contrastar hipótesis lingüísticas sobre aglutinación.
- Baseline para comparativas byte-level: servir como referencia de entropía (1,2540 y 1,2531 bits/byte) frente a checkpoints multilingües mayores en evaluaciones sobre finlandés.
- Estudio de escalado en arquitecturas híbridas atención-SSM: comparar el rendimiento de 195M y 501M para analizar retornos decrecientes en parámetros y datos.
- Reproducción de entrenamiento con ROCm: partir de los scripts del repositorio `bqv/hnets` para replicar el pipeline en hardware AMD.
- Extracción de representaciones internas: cargar el `state_dict` en `HNetForCausalLM` para acceder a las probabilidades de router y analizar la jerarquía aprendida.

## Benchmarks y rendimiento

| Metrica | 195M | 501M | Referencia (hnet_1stage_L, 1,3B) |
|---|---|---|---|
| Parametros | 195,1M | 501,1M | 1,3B |
| Layout | `m4/T12/m4` | `m4/T20/m4` | no disponible |
| d_model | 768 → 1024 | 1024 → 1280 | no disponible |
| Datos de entrenamiento | 690 MB Wikipedia FI | 1,53 GB (FineWeb-2 + Wikipedia) | no disponible |
| Pasos × bytes | 84.000 × 8.192 | 183.000 × 8.192 | no disponible |
| Bits/byte en held-out finlandés | 1,2540 | 1,2531 | 2,074 |
| Longitud media de chunk | 3,55 bytes | 3,97 bytes | no disponible |
| Fronteras dentro de un radical | 56,8% | 73,0% | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de razonamiento en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de 195M en bf16 ocupa aproximadamente 0,4 GB de pesos; el de 501M, aproximadamente 1 GB. Con overhead de activaciones y contexto, ambos caben holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte bf16; el entrenamiento original se hizo en una RX 7900 XT con ROCm. Para inferencia, RTX 3090, RTX 4090, A100 o H100 son suficientes y sobrados.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4-6 GB de VRAM para el modelo de 501M con contexto de 8.192 bytes.
- Opciones de despliegue: la model card solo documenta carga directa con PyTorch y safetensors mediante `HNetForCausalLM`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/byte en finlandés | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hnet-finnish 195M | 195,1M | no disponible (entrenado a 8.192 bytes) | 1,2540 | MIT | Hugging Face |
| hnet-finnish 501M | 501,1M | no disponible (entrenado a 8.192 bytes) | 1,2531 | MIT | Hugging Face |
| hnet_1stage_L (Cartesia) | 1,3B | no disponible | 2,074 | no disponible | no disponible en esta ficha |

No se dispone de datos de otros modelos byte-level específicos de finlandés para una comparativa más amplia.

## Limitaciones y advertencias

- Son checkpoints de investigación, no modelos de chat: no tienen ajuste por instrucciones ni alineamiento de seguridad.
- No se han evaluado sesgos; al entrenarse sobre Wikipedia y FineWeb-2, pueden reflejar los sesgos de esas fuentes.
- Riesgo de alucinación no caracterizado; al ser un modelo de predicción de siguiente byte, la generación libre puede producir texto incoherente sin instrucciones.
- El soporte multilingüe no está evaluado; el entrenamiento es exclusivamente en finlandés.
- La longitud de contexto efectiva no está documentada más allá de las secuencias de entrenamiento de 8.192 bytes.
- La licencia MIT cubre los pesos, pero los datos de entrenamiento mantienen sus propias licencias (Wikipedia CC BY-SA, FineWeb-2 ODC-By) y las salidas pueden reflejarlas.
- El escalado a 501M no mejora la entropía de forma significativa y empeora la alineación morfológica de la segmentación, por lo que no debe asumirse que una variante mayor sea mejor para tareas lingüísticas.
- No es una release oficial del equipo de H-Net, sino un entrenamiento independiente.

## Enlaces

- Hugging Face: https://huggingface.co/izf/hnet-finnish
- Repositorio de entrenamiento y herramientas: https://github.com/bqv/hnets
- Paper de H-Net: https://arxiv.org/abs/2507.07955
