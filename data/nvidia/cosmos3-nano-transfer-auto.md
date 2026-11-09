# nvidia/Cosmos3-Nano-Transfer-Auto

## Resumen

Cosmos3-Nano-Transfer-Auto es un modelo generativo de NVIDIA especializado en simulación de escenarios de conducción para IA física (*physical AI*). Se trata de un *checkpoint* post-entrenado a partir del modelo base Cosmos3-Nano, que genera de forma sincronizada vídeos multi-cámara (hasta 11 vistas estándar y *fisheye*) y observaciones LiDAR condicionadas por un *prompt* de texto, un World Scenario Map (WSM) con la estructura de la escena y controles LiDAR alineados. Con 15.157.324.096 parámetros reales en *safetensors* (la model card declara 16B entrenables), emplea una arquitectura Transformer con Mixture-of-Transformers (MoT) y generación bidireccional, lo que lo hace adecuado para generación de datos sintéticos por lotes.

El modelo resuelve un problema concreto en el *pipeline* de desarrollo de vehículos autónomos: la escasez y el coste de datos reales multi-sensor etiquetados. Permitiendo regenerar un mismo escenario con variaciones controladas de apariencia (meteorología, iluminación, hora del día), facilita el aumento de datos (*data augmentation*) a escala para entrenar y evaluar modelos de percepción y conducción. Además, sirve como *checkpoint* fuente para la destilación causal hacia Cosmos3-Nano-Sim-Auto, orientado a simulación en bucle cerrado.

Es relevante ahora porque NVIDIA lo publica bajo la licencia OpenMDW1.1, explícitamente apta para uso comercial y no comercial, dentro de la familia de modelos de ejemplo Cosmos3, con código, *skill* de uso rápido e informe técnico disponibles. La fecha de publicación en Hugging Face es el 20 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT); generación bidireccional |
| Parametros totales | 15.157.324.096 (dato real de safetensors); la model card declara 16B entrenables |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las entradas de texto son *prompts* descriptivos; no se detalla cobertura lingüística) |
| Licencia | OpenMDW1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (tamaño del repo: 34,5 GB) |

## Arquitectura y entrenamiento

Cosmos3-Nano-Transfer-Auto deriva de Cosmos3-Nano mediante *post-training* sobre datos de conducción multi-sensor que incluyen LiDAR. La red es un Transformer con Mixture-of-Transformers (MoT): el modelo aplica *denoising* conjunto sobre la secuencia completa multi-vista con contexto temporal bidireccional, condicionado por el *prompt* de texto, los controles de cámara WSM y, cuando se solicita salida LiDAR, los controles LiDAR alineados. El resultado son vídeos de cámara sincronizados para hasta 11 vistas y las correspondientes observaciones LiDAR.

El modelo se ha desarrollado con el Cosmos Framework. La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. La generación es bidireccional, pensada para generación sintética por lotes; el *checkpoint* sirve además como fuente para destilación causal hacia Cosmos3-Nano-Sim-Auto, que añade simulación en bucle cerrado con las mismas modalidades de salida.

## Capacidades

- Generación de vídeo multi-vista sincronizado: hasta 11 vistas de cámara, incluyendo configuraciones estándar y *fisheye* (200°).
- Generación de observaciones LiDAR sincronizadas con las vistas de cámara: mapas de rango e intensidad.
- Condicionamiento por texto para atributos de apariencia: meteorología, iluminación y hora del día; el texto también transporta la configuración de cámaras.
- Condicionamiento estructural mediante World Scenario Map (WSM): señales de tráfico, semáforos, marcas viales y *cuboids* de objetos, renderizados por vista.
- Condicionamiento LiDAR opcional: barrido medido inicial en representación rango/intensidad, alineado con el inicio de las secuencias.
- Condicionamiento RGB inicial opcional: imágenes iniciales sincronizadas por cámara.
- Regeneración controlada de un mismo escenario con variaciones de apariencia a escala.
- Compatibilidad con *rigs* de 1 a 11 vistas (conjunto Hyperion 8.1: frontal gran angular 120°, frontal tele 30°, lateral cruzado 120°, trasero lateral 70°, trasero tele 30° y *fisheye* frontal/lateral/trasero 200°) y LiDAR rotativo de 128 haces.
- No se documentan en la información disponible capacidades de *tool calling*, razonamiento multi-paso ni modo *thinking*.

## Casos de uso

- Generación de datos sintéticos para percepción: regenerar escenarios de conducción con variaciones de clima, luz y hora del día para ampliar el dataset de entrenamiento de detectores y segmentadores, manteniendo la estructura de escena fija vía WSM.
- Aumento de datos multi-sensor alineados: producir pares cámara-LiDAR sincronizados para entrenar modelos de fusión sensorial, con controles LiDAR que garantizan coherencia geométrica entre modalidades.
- Evaluación de robustez: someter un modelo de percepción a la misma escena bajo condiciones de iluminación y meteorología controladas para medir degradación de forma sistemática.
- Cobertura de escenarios de borde: construir escenarios con señales, semáforos y *cuboids* específicos mediante WSM para cubrir casos poco frecuentes en datos reales.
- Validación de *rigs* de cámara: generar vistas desde configuraciones de 1 a 11 cámaras, incluidas *fisheye* de 200°, para estudiar el impacto de la geometría del *rig* en la percepción antes de montar hardware.
- Simulación y *world models*: usar el *checkpoint* como base para destilación causal hacia Cosmos3-Nano-Sim-Auto y construir entornos de simulación en bucle cerrado para planificación y control.
- Preentrenamiento de modelos de conducción: alimentar *pipelines* de entrenamiento con grandes volúmenes de vídeo multi-vista etiquetado de forma consistente por construcción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, los 15.157.324.096 parámetros implican aproximadamente 30 GB en precisión de 16 bits solo para pesos, antes de activaciones y estado de difusión; el tamaño del repositorio es de 34,5 GB.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: el modelo se distribuye con la librería `cosmos` y se desarrolla con el Cosmos Framework (repositorio `NVIDIA/cosmos-framework`); no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-Transfer-Auto | 15.157.324.096 | no disponible | Vídeo multi-vista (hasta 11) y LiDAR | OpenMDW1.1 | Hugging Face, GitHub |
| Cosmos3-Nano | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Cosmos3-Nano-Sim-Auto | no disponible | no disponible | Vídeo multi-vista y LiDAR (bucle cerrado) | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos de conducción, puede heredar sesgos de las condiciones y geografías presentes en el dataset.
- Riesgo de alucinación: como modelo generativo de difusión, puede producir escenas visualmente plausibles pero físicamente inconsistentes; no se documentan métricas de fidelidad en la información disponible.
- Limitaciones de *rig*: el modelo está adaptado al conjunto de cámaras Hyperion 8.1 y a LiDAR rotativo de 128 haces; otros *rigs* requieren *post-training* adicional.
- Dependencia de controles: la calidad de la salida depende de los controles WSM y LiDAR, que deben ser producidos por un renderizador WSM y estar alineados; entradas mal alineadas degradan el resultado.
- Idioma: no se detalla cobertura lingüística de los *prompts* de texto.
- Licencia: OpenMDW1.1 permite uso comercial y no comercial según la model card, pero conviene revisar los términos completos del texto de la licencia antes de su integración en producto.
- Producción: no se publican latencias, throughput ni requisitos de hardware, lo que dificulta el dimensionamiento previo de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Cosmos3-Nano-Transfer-Auto
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- Cosmos Framework: https://github.com/NVIDIA/cosmos-framework
- *Skill* de Cosmos3-Nano-Transfer-Auto: https://github.com/NVIDIA/cosmos-framework/tree/main/.agents/skills/cosmos3-nano-transfer-auto
- Informe técnico: https://research.nvidia.com/labs/cosmos-lab/cosmos-simulation/technical-report.pdf
- Sitio web: https://research.nvidia.com/labs/cosmos-lab/cosmos-simulation/
- Licencia OpenMDW1.1: https://openmdw.ai/license/1-1/
- Modelo base Cosmos3-Nano: https://huggingface.co/nvidia/Cosmos3-Nano
