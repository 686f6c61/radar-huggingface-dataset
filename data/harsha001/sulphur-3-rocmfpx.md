# Harsha001/Sulphur-3-ROCmFPX

## Resumen

Sulphur-3-ROCmFPX es una cuantización en formato GGUF del modelo base SulphurAI/Sulphur-3, publicada por el usuario Harsha001. Se trata de una conversión orientada a hardware AMD, concretamente a las tecnologías ROCmFPX y ROCmFP4, con soporte declarado para Vulkan y para el sistema Strix Halo (APU de AMD). El modelo está pensado para ejecutarse con stable-diffusion.cpp en tareas de generación de vídeo a partir de texto (pipeline text-to-video), y toma como referencia el modelo Minimax-h3 según la licencia declarada.

El modelo base cuenta con 20.111.438.947 parámetros (aproximadamente 20,1 mil millones), lo que lo sitúa en la categoría de modelos de gran tamaño para generación de vídeo. El repositorio ocupa 32,2 GB, coherente con una cuantización de pesos de un modelo de ese tamaño. La publicación es muy reciente (creada el 23 de noviembre de 2026) y no registra descargas ni likes en el momento de la consulta.

La relevancia de esta ficha radica en que documenta una cuantización específica para el ecosistema AMD, un nicho con menos opciones publicadas que el ecosistema NVIDIA/CUDA. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 20.111.438.947 (~20,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFPX / ROCmFP4 (GGUF cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (etiquetada como "other") |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base SulphurAI/Sulphur-3 en la documentación proporcionada. Los tags indican que el pipeline es text-to-video y que el modelo se ejecuta mediante stable-diffusion.cpp, lo que sugiere una arquitectura de difusión orientada a vídeo, pero no se confirma el tipo de backbone (transformer de difusión, DiT u otro). Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica destacable de esta publicación concreta no está en el entrenamiento, sino en la cuantización: el formato ROCmFPX/ROCmFP4 está diseñado para aprovechar las capacidades de cómputo en precisión reducida de las GPU y APU de AMD bajo ROCm, y se declara compatibilidad con Vulkan y con Strix Halo. No se especifican los detalles del algoritmo de cuantización, el número de bits efectivos por peso ni las capas afectadas.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), según el pipeline declarado.
- Ejecución en hardware AMD mediante ROCm (ROCmFPX/ROCmFP4) y en Vulkan.
- Compatibilidad declarada con stable-diffusion.cpp como runtime de inferencia.
- Soporte para el sistema Strix Halo (APU AMD).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de clips de vídeo a partir de descripciones textuales en estaciones de trabajo con GPU AMD: el modelo se ejecutaría con stable-diffusion.cpp sobre ROCm, aprovechando la cuantización ROCmFP4 para reducir el consumo de memoria frente a los pesos en precisión completa.
- Prototipado en APU Strix Halo: al declararse soporte para este sistema, permite experimentar con generación de vídeo en equipos compactos sin GPU dedicada, dentro de los límites de memoria unificada de la APU.
- Despliegue en entornos con Vulkan: para máquinas donde ROCm no está disponible pero sí un driver Vulkan compatible, el formato GGUF permite ejecutar el modelo con stable-diffusion.cpp.
- Investigación sobre cuantización en precisión reducida: el modelo sirve como caso de estudio para evaluar la calidad de vídeo generado con ROCmFP4 frente a otras cuantizaciones del mismo modelo base.
- Integración en pipelines de creación de contenido: generación de borradores de vídeo para previsualización antes de un render de mayor calidad con el modelo base sin cuantizar.
- Evaluación comparativa de hardware AMD frente a NVIDIA: permite medir latencia y throughput de un modelo de ~20 B parámetros en ROCm y Vulkan, útil para decisiones de compra o migración de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 32,2 GB, por lo que se necesita al menos esa cantidad de memoria (VRAM o memoria unificada) para cargar los pesos, más el overhead del runtime y de los buffers de inferencia.
- GPU recomendadas: no disponibles. El modelo declara orientación a hardware AMD (ROCm) y a Strix Halo; no se especifican modelos concretos como MI300, RX 7900 XTX u otros.
- ¿Cabe en GPU de consumo? No se confirma. Con 32,2 GB de pesos, quedaría fuera de GPU con 24 GB de VRAM o menos salvo que existan variantes más agresivas de cuantización no listadas; en APU con memoria unificada de 64 GB o más podría ser viable, pero no está verificado.
- Opciones de despliegue: stable-diffusion.cpp (declarado), con backends ROCm y Vulkan. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos de lenguaje y no a text-to-video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sulphur-3-ROCmFPX | ~20,1 B | no disponible | GGUF (ROCmFPX/FP4) | minimax-h3-community-license | Cuantización para AMD/ROCm y Vulkan |
| SulphurAI/Sulphur-3 | ~20,1 B (según dato del repo derivado) | no disponible | no disponible | minimax-h3-community-license | Modelo base sin cuantizar |
| Alternativas text-to-video de tamaño comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de generación de vídeo.

## Limitaciones y advertencias

- La cuantización ROCmFP4 puede degradar la calidad visual del vídeo generado respecto al modelo base en precisión completa; no se han publicado evaluaciones de calidad.
- No hay información sobre sesgos del modelo base ni sobre el dataset de entrenamiento, por lo que no se pueden evaluar riesgos de sesgo.
- Riesgo de alucinación y de artefactos visuales inherente a los modelos generativos de vídeo; no cuantificado.
- Idiomas soportados no documentados; se desconoce si las instrucciones de texto admiten castellano u otros idiomas.
- Licencia "minimax-h3-community-license": es una licencia comunitaria con condiciones específicas; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones de atribución, de uso o de redistribución.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la automatización de descargas en CI/CD.
- Publicación sin descargas ni validación comunitaria: no hay evidencia de que la cuantización haya sido probada de forma independiente.
- Compatibilidad limitada a stable-diffusion.cpp con ROCm/Vulkan; no se garantiza funcionamiento en otros runtimes.
- El repositorio ocupa 32,2 GB, lo que exige almacenamiento y memoria considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/Sulphur-3-ROCmFPX
- Modelo base: https://huggingface.co/SulphurAI/Sulphur-3
- stable-diffusion.cpp (runtime declarado en los tags): no se proporciona URL en la información disponible
- Documentación de ROCm (AMD): no se proporciona URL en la información disponible
- Licencia minimax-h3-community-license: no se proporciona URL en la información disponible
