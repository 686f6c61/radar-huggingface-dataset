# kangnguyen/FINE_InternVLA_N1_R2R_100

## Resumen

FINE_InternVLA_N1_R2R_100 es un punto de control de investigación para navegación guiada por lenguaje (Vision-Language Navigation, VLN) en entornos continuos, desarrollado por Khang H. Nguyen y colaboradores y publicado como artefacto del artículo *FINE: Future-Informed Navigation Encoding for Data-Efficient Vision-Language Navigation* (arXiv:2609.32855). Se trata de un ajuste fino del modelo base InternRobotics/InternVLA-N1-DualVLN sobre el 100 % de las demostraciones de entrenamiento del conjunto R2R-CE, el benchmark estándar de navegación continua en interiores sobre el simulador Habitat.

El modelo hereda la arquitectura de doble sistema de InternVLA-N1: un System 2 de razonamiento visual-lingüístico basado en Qwen2.5-VL-7B que produce un objetivo en píxeles o acciones discretas, y un System 1 generativo de trayectorias basado en NextDiT (`nextdit_async`) que emite una trayectoria local continua. La innovación de FINE consiste en añadir supervisión de observación futura durante el entrenamiento mediante dos ramas auxiliares (18 tokens de landmark explícitos y 1 token de futuro implícito entrenado con InfoNCE), sin coste adicional de anotación ni de interacción en despliegue.

Es relevante porque ataca uno de los cuellos de botella clásicos de la VLN: el escaso aprovechamiento de las demostraciones, que solo supervisan la acción ejecutada e ignoran lo que el agente está a punto de ver. El checkpoint tiene 8.613.617.229 parámetros en safetensors (bfloat16), ocupa 17,2 GB en el repositorio y se distribuye con licencia Apache-2.0. No es un modelo de chat general: es un policy de navegación para robótica encarnada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVLA-N1 dual system: Qwen2.5-VL-7B como System 2 + NextDiT (`nextdit_async`) como System 1 de trayectorias, con tokens FINE explícitos e implícitos |
| Parametros totales | 8.613.617.229 (según safetensors) |
| Parametros activos | no disponible (no es un MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (las instrucciones de R2R-CE son en inglés, pero no se declara cobertura multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards), más tokenizer, image processor y chat template |

## Arquitectura y entrenamiento

La arquitectura es un sistema dual jerárquico. El System 2, construido sobre Qwen2.5-VL-7B, procesa el historial de observación RGB-D (8 fotogramas a 224×224), la instrucción en lenguaje natural y los landmarks de la instrucción, y produce un objetivo en píxeles o acciones discretas. El System 1, basado en NextDiT en su variante `nextdit_async`, genera una trayectoria local continua que el agente ejecuta. Sobre esta base, FINE incorpora dos flujos de tokens auxiliares que condicionan el System 1 mediante proyectores separados con compuertas: 18 tokens de landmark explícitos, que siguen los landmarks ordenados de la instrucción y predicen la próxima región de landmark en espacio semántico 2D (parches de Qwen2.5-VL) y geométrico 3D (features de VGGT), y 1 token de futuro implícito, entrenado de forma contrastiva con InfoNCE para distinguir el futuro realmente alcanzado de otros futuros, incluidos futuros contrafactuales de la misma escena generados por un modelo del mundo de vídeo (NanoWM).

El entrenamiento se realiza sobre el 100 % de las demostraciones de entrenamiento de R2R-CE, con máscaras de landmark y futuros contrafactuales generados por el modelo del mundo. Los fotogramas futuros, las máscaras de landmark, VGGT y los rollouts del modelo del mundo se emplean exclusivamente durante el entrenamiento: en despliegue la política conserva el espacio de acciones y la cabeza de acción originales de InternVLA-N1 y no requiere lookahead. El modelo base se apoya además en Depth Anything V2 (profundidad métrica) y Grounding DINO (detección guiada por texto), cuyas licencias también aplican a los componentes correspondientes.

## Capacidades

- Navegación guiada por instrucciones en lenguaje natural en entornos interiores continuos (VLN-CE), con observaciones RGB-D.
- Predicción de objetivo en píxeles y de acciones discretas mediante el System 2 visual-lingüístico.
- Generación de trayectorias locales continuas mediante el System 1 generativo (NextDiT).
- Razonamiento sobre landmarks de la instrucción: los 18 tokens explícitos siguen el orden de los landmarks mencionados y anticipan la región correspondiente.
- Codificación de dinámica futura: el token implícito captura información sobre el estado venidero sin necesidad de lookahead en inferencia.
- Procesamiento de historial visual multi-fotograma (8 frames RGB-D a 224×224).
- Integración con el ecosistema InternNav / InternVLA-N1 y con el simulador Habitat para evaluación.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso genéricos, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Investigación en VLN-CE: reproducción y extensión de los resultados del artículo FINE sobre R2R-CE usando Habitat, sirviendo como baseline fuerte con supervisión de futuro.
- Estudio de eficiencia de datos: comparar este checkpoint (100 % de las demostraciones) con variantes entrenadas con subconjuntos reducidos para medir la ganancia de FINE en regímenes de pocos datos.
- Navegación robótica en interiores simulados: despliegue del policy en escenas de Habitat para tareas de "ve a la cocina y espera junto al sofá" con trayectorias continuas.
- Evaluación de arquitecturas de doble sistema: analizar la contribución del System 1 generativo frente a políticas de acciones discretas puras en entornos continuos.
- Ablación de componentes auxiliares: desactivar o sustituir los tokens de landmark y el token de futuro para cuantificar su impacto en éxito y eficiencia de trayectoria.
- Generación de datos sintéticos de navegación: usar los rollouts del modelo del mundo y las predicciones de landmark como fuente de supervisión para otros modelos de navegación.
- Prototipado de asistentes robóticos de guiado: integración en un stack de robot móvil simulado para validar instrucciones de alto nivel antes de transferir a hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de métricas (SR, SPL, NE, OS) ni comparaciones numéricas con otros modelos; solo remite al artículo arXiv:2609.32855 para los resultados completos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 17 GB solo para pesos, más overhead de activaciones y del procesador visual; se recomienda un mínimo de 24 GB para ejecución cómoda.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; GPUs de 16 GB requerirían cuantización, no documentada por el autor.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con margen ajustado; en RTX 4080/A6000 de 16 GB no está garantizado sin cuantización adicional.
- Opciones de despliegue: transformers (librería declarada), con integración en el stack InternNav; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y su idoneidad es dudosa por el pipeline de robótica y las cabezas específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FINE_InternVLA_N1_R2R_100 | 8,61 B | no disponible | VLN-CE (R2R-CE) | Apache-2.0 | Hugging Face (kangnguyen) |
| InternVLA-N1-DualVLN (base) | no disponible | no disponible | VLN-CE | no disponible en la información | Hugging Face (InternRobotics) |
| Qwen2.5-VL-7B-Instruct | 7 B aprox. | no disponible | VLM general | no disponible en la información | Hugging Face (Qwen) |

La comparación con políticas de navegación alternativas (por ejemplo, variantes de VLN-CE basadas en modelos de lenguaje) no está disponible en la información proporcionada; el artículo referenciado es la fuente adecuada para una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación: no se documentan evaluaciones en hardware real, solo en simulación (Habitat / R2R-CE).
- Dominio restringido: entrenado exclusivamente con R2R-CE en interiores; el rendimiento fuera de esa distribución (exteriores, otros simuladores, instrucciones en otros idiomas) no está caracterizado.
- Idiomas: no se declara cobertura multilingüe; las instrucciones de R2R-CE son en inglés.
- Riesgo de alucinación de landmarks: los tokens explícitos predicen regiones futuras y pueden desviar la política si la instrucción es ambigua o el landmark no está presente en la escena.
- Dependencias de licencia: los componentes Qwen2.5-VL, VGGT, Depth Anything V2, Grounding DINO, NanoWM y FOCA arrastran sus propias licencias, que aplican además de la Apache-2.0 del checkpoint.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones int8/int4 oficiales, lo que limita el despliegue en GPUs pequeñas.
- Sin datos de benchmarks en la model card: la validación cuantitativa debe obtenerse del artículo, no del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kangnguyen/FINE_InternVLA_N1_R2R_100
- Modelo base: https://huggingface.co/InternRobotics/InternVLA-N1-DualVLN
- Artículo arXiv: https://arxiv.org/abs/2609.32855
- Página del proyecto FINE: https://finevln.github.io/
- Repositorio InternNav / InternVLA-N1: https://github.com/InternRobotics/InternNav
- Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- VGGT: https://huggingface.co/facebook/VGGT-1B
- Depth Anything V2 (Metric Hypersim Small): https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-Hypersim-Small
- Grounding DINO: https://huggingface.co/IDEA-Research/grounding-dino-base
- NanoWM: https://github.com/simchowitzlabpublic/nano-world-model
- FOCA: https://github.com/cair-vinuni/FOCA
