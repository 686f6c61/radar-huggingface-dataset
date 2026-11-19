# nvidia/Cosmos3-Nano-Transfer-Auto

## Resumen

Cosmos3-Nano-Transfer-Auto es un modelo generativo de NVIDIA especializado en la síntesis de datos sintéticos multimodales para conducción autónoma. Se trata de una variante post-entrenada del modelo base Cosmos3-Nano que genera vídeos sincronizados de hasta 11 cámaras (estándar y ojo de pez) junto con observaciones LiDAR alineadas, condicionado por un prompt de texto y controles de World Scenario Map (WSM) que codifican la estructura de la escena: señales de tráfico, semáforos, marcas viales y cuboides de objetos.

El modelo resuelve un problema concreto en el pipeline de Physical AI: la escasez y el coste de datos reales multi-sensor etiquetados. Permite regenerar un mismo escenario de conducción a escala con variaciones controladas de apariencia (clima, iluminación, hora del día), manteniendo la geometría y la coherencia entre sensores. Con aproximadamente 15.200 millones de parámetros (16B reportados por el autor), emplea una arquitectura Mixture-of-Transformers (MoT) con generación bidireccional, pensada para generación por lotes y no para simulación en bucle cerrado.

Es relevante ahora porque actúa como checkpoint fuente para la destilación causal hacia Cosmos3-Nano-Sim-Auto, que habilita simulación en bucle cerrado con las mismas modalidades de salida. Forma parte de la familia de modelos de ejemplo Cosmos3 de NVIDIA y se distribuye con licencia OpenMDW 1.1, apta para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT) |
| Parametros totales | 15.157.324.096 (aprox. 15,2B; el autor reporta 16B entrenables) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las entradas de texto son prompts de descripcion de escena) |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (libreria `cosmos`, integracion con `diffusers`) |
| Tamano del repositorio | 34,5 GB |
| Modalidades de entrada | Texto, video (controles WSM por camara), imagen RGB opcional, controles LiDAR numericos y LiDAR medido opcional |
| Modalidades de salida | Video multi-vista sincronizado (MP4) y mapas de rango e intensidad LiDAR |
| Vistas de camara | 1 a 11 (incluye rig Hyperion 8.1: front-wide 120 grados, front-tele 30 grados, cross-left/right 120 grados, rear-left/right 70 grados, rear-tele 30 grados, ojo de pez 200 grados) |
| Sensor LiDAR | 128 haces rotatorio |
| Fecha de publicacion | 20/10/2026 (Hugging Face y GitHub) |

## Arquitectura y entrenamiento

El modelo se basa en un Transformer con arquitectura Mixture-of-Transformers (MoT), derivado de Cosmos3-Nano mediante post-entrenamiento sobre datos de conducción multi-sensor que incluyen LiDAR. El proceso de generación aplica denoising conjunto sobre la secuencia completa multi-vista con contexto temporal bidireccional, condicionado simultáneamente por el prompt de texto, los controles de cámara WSM y, cuando se solicita salida LiDAR, los controles LiDAR alineados. Esta formulación bidireccional está optimizada para generación de datos sintéticos por lotes, no para inferencia autorregresiva en tiempo real.

Los controles WSM se producen mediante un renderizador específico que codifica la estructura de la escena (marcas viales, cuboides de objetos, señalización) como vídeos MP4 sincronizados, uno por vista. Los controles LiDAR se suministran como secuencias de range-maps de mapa HD alineadas temporalmente con las cámaras. El modelo acepta además condicionamiento RGB inicial opcional y un barrido LiDAR medido opcional para anclar la generación al inicio de la secuencia. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La adaptación a otros rigs de cámara distintos del Hyperion 8.1 requiere post-entrenamiento adicional.

## Capacidades

- Generación de vídeo multi-vista sincronizado de hasta 11 cámaras, combinando vistas estándar y de ojo de pez de 200 grados.
- Generación conjunta de observaciones LiDAR (mapas de rango e intensidad) alineadas con las vistas de cámara.
- Condicionamiento por prompt de texto para atributos de apariencia: clima, iluminación y hora del día.
- Control estructural fino mediante World Scenario Map (WSM): señales, semáforos, marcas viales y cuboides de objetos por vista.
- Condicionamiento inicial opcional con imagen RGB y con barrido LiDAR medido, para anclar la secuencia generada a un estado real.
- Regeneración controlada de un mismo escenario con variaciones de apariencia, manteniendo la coherencia geométrica entre sensores.
- Generación bidireccional orientada a producción por lotes de datasets sintéticos.
- No dispone de tool calling, function calling ni capacidades de agente; no es un modelo de lenguaje conversacional.
- No se han documentado capacidades multilingües ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Aumento de datasets de percepción: generar lotes de vídeo multi-cámara y LiDAR etiquetados a partir de escenarios WSM existentes para ampliar la cobertura de entrenamiento de detectores y segmentadores sin coste de captura real.
- Variación de dominio controlada: regenerar un mismo escenario con lluvia, niebla, nocturnidad o deslumbramiento a contraluz para evaluar la robustez de modelos de percepción ante condiciones meteorológicas y de iluminación poco frecuentes.
- Validación de modelos de fusión cámara-LiDAR: producir pares sincronizados de vídeo e LiDAR con verdad de referencia geométrica conocida para medir la coherencia entre modalidades en pipelines de fusión.
- Cobertura de casos límite: sintetizar escenarios con señalización compleja, obras o configuraciones de carril poco habituales definidas manualmente en el WSM, difíciles de capturar en flota real.
- Evaluación de planificadores y modelos de conducción: usar las secuencias generadas como entradas reproducibles en pruebas de regresión, aprovechando que el mismo escenario puede regenerarse con variaciones acotadas.
- Generación de datos para rigs Hyperion 8.1: producir directamente las 11 vistas del rig estándar y el LiDAR de 128 haces, evitando el remuestreo desde otras configuraciones de sensor.
- Preparación de datos para destilación causal: servir como fuente para generar pares de entrenamiento que alimenten la destilación hacia Cosmos3-Nano-Sim-Auto y habilitar simulación en bucle cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 34,5 GB en safetensors, lo que sitúa el peso en precisión nativa (probablemente BF16/FP16) en torno a 30 GB. La VRAM necesaria para inferencia será superior a esa cifra al sumar activaciones y el estado de denoising sobre secuencias multi-vista de vídeo y LiDAR.
- No se dispone de cifras oficiales de VRAM mínima ni de cuantizaciones publicadas para este checkpoint; no se debe asumir que quepa en GPU de consumo de 24 GB sin cuantización.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño de pesos, el despliegue en precisión nativa requiere GPUs de centro de datos (A100 80 GB, H100 80 GB o superiores); no hay confirmación oficial de encaje en RTX 4090.
- Opciones de despliegue: el modelo se distribuye con `library_name: cosmos` e integración con `diffusers`, y se desarrolla sobre el Cosmos Framework (https://github.com/NVIDIA/cosmos-framework). No se ha documentado soporte de vLLM, llama.cpp, Ollama o TGI, que además no son adecuados para un modelo generativo de vídeo y LiDAR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades de salida | Contexto / vistas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-Transfer-Auto | aprox. 15,2B (16B reportados) | Vídeo multi-vista + LiDAR | Hasta 11 vistas, LiDAR 128 haces | OpenMDW 1.1 | Hugging Face, GitHub |
| Cosmos3-Nano (base) | no disponible | Vídeo (generación base) | no disponible | OpenMDW 1.1 (familia Cosmos3) | Hugging Face |
| Cosmos3-Nano-Sim-Auto | no disponible | Vídeo multi-vista + LiDAR en bucle cerrado | Hasta 11 vistas | OpenMDW 1.1 (familia Cosmos3) | Hugging Face |

La comparación con modelos de otras familias (por ejemplo, generadores de vídeo genéricos) no está disponible en la información proporcionada, ya que ninguno de ellos produce LiDAR alineado con las vistas de cámara ni acepta controles WSM.

## Limitaciones y advertencias

- Modelo especializado en conducción: no es un modelo de lenguaje ni un asistente conversacional; no soporta tool calling, agentes ni razonamiento multi-paso.
- Rig de cámara restringido: el modelo está entrenado para el conjunto Hyperion 8.1 (1 a 11 vistas) y LiDAR de 128 haces. Cualquier otra configuración de sensores requiere post-entrenamiento adicional.
- Generación bidireccional: está diseñada para generación por lotes, no para simulación interactiva en bucle cerrado; para ese uso debe emplearse Cosmos3-Nano-Sim-Auto.
- Dependencia de los controles WSM: la calidad y coherencia de la salida dependen de un renderizador WSM externo y de controles LiDAR alineados correctamente; errores de alineación temporal degradan el resultado.
- Riesgo de artefactos y alucinación visual: al ser un modelo generativo, puede producir geometrías inconsistentes, objetos que aparecen o desaparecen entre vistas o LiDAR incoherente con la imagen. Los datos sintéticos requieren validación antes de usarse como verdad de referencia.
- Sesgos de dominio: el dataset de post-entrenamiento no está documentado en la información disponible, por lo que se desconocen sesgos geográficos, climáticos o de tipología de vía.
- Idiomas: no se han documentado idiomas soportados; los prompts de texto se orientan a descripción de escena, no a interacción multilingüe.
- Licencia: OpenMDW 1.1 permite uso comercial según la model card, pero conviene revisar los términos completos en https://openmdw.ai/license/1-1/ antes de integrarlo en producción.
- No se han publicado cifras de benchmarks, latencia ni requisitos mínimos de hardware; cualquier planificación de despliegue debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Cosmos3-Nano-Transfer-Auto
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Colección de ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Modelo base Cosmos3-Nano: https://huggingface.co/nvidia/Cosmos3-Nano
- Código: https://github.com/nvidia/cosmos
- Cosmos Framework: https://github.com/NVIDIA/cosmos-framework
- Skill de Cosmos3-Nano-Transfer-Auto: https://github.com/NVIDIA/cosmos-framework/tree/main/.agents/skills/cosmos3-nano-transfer-auto
- Informe técnico: https://research.nvidia.com/labs/cosmos-lab/cosmos-simulation/technical-report.pdf
- Sitio web del proyecto: https://research.nvidia.com/labs/cosmos-lab/cosmos-simulation/
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
