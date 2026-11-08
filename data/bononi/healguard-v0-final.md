# bononi/healguard-v0-final

## Resumen

healguard-v0-final es un adaptador LoRA publicado por el usuario bononi en Hugging Face, entrenado mediante supervisión fina (SFT) sobre el modelo base CohereLabs/tiny-aya-global. No se trata de un modelo completo, sino de un conjunto de pesos incrementales en formato PEFT que debe cargarse junto al modelo base para su uso. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo de pesos completos.

La relevancia de esta ficha es limitada desde el punto de vista técnico: la model card es una plantilla sin rellenar, sin datos de entrenamiento, hiperparámetros, evaluación ni licencia, y el repositorio no registra descargas ni interacciones en el momento de la consulta. El nombre "healguard" sugiere un propósito de moderación o salvaguarda en el ámbito sanitario, pero no hay documentación que lo confirme.

El interés principal reside en el modelo base: tiny-aya-global pertenece a la familia Aya de Cohere Labs, orientada a cobertura multilingüe amplia con un tamaño reducido. Cualquier evaluación del adaptador debe hacerse, por tanto, en el contexto de las capacidades y limitaciones de dicho modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (PEFT) sobre transformer del modelo base CohereLabs/tiny-aya-global |
| Parametros totales | no disponible (el adaptador ocupa ~0,1 GB; los parametros del modelo base no se detallan en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en esta ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion aplica al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) entrenado con la libreria TRL mediante SFT (supervised fine-tuning) sobre el modelo CohereLabs/tiny-aya-global. Los tags del repositorio confirman el uso de PEFT 0.21.2, transformers y TRL. No se especifica el rango del adaptador, las capas objetivo, la tasa de aprendizaje, el numero de pasos ni el volumen de datos de entrenamiento.

No hay informacion sobre la composicion del dataset de SFT, si hubo filtrado, anotacion humana o procesos posteriores de alineamiento como RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La model card conserva los marcadores "[More Information Needed]" en todas las secciones, incluida la de hiperparametros y la de evaluacion.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el tag conversational, heredado del modelo base.
- Ajuste fino supervisado orientado a una tarea concreta (presumiblemente moderacion o salvaguarda, por el nombre del repositorio), sin documentacion que lo confirme.
- Capacidades multilingues: no disponibles en la informacion proporcionada; dependen del modelo base tiny-aya-global.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Moderacion de contenido en castellano: el adaptador podria emplearse como filtro previo o posterior a las respuestas de un asistente, cargandolo sobre tiny-aya-global en un pipeline de transformers. La idoneidad real no puede validarse sin datos de evaluacion.
- Clasificacion de mensajes sensibles en un chat de soporte: al ser un adaptador pequeno (~0,1 GB), puede desplegarse junto al modelo base en el mismo proceso y anadir latencia minima.
- Prototipado rapido de salvaguardas: util para experimentar con tecnicas de SFT y LoRA antes de invertir en un modelo mayor, dado el bajo coste de almacenamiento y entrenamiento.
- Investigacion sobre alineamiento y seguridad: sirve como punto de partida reproducible para comparar estrategias de fine-tuning sobre modelos multilingues pequenos.
- Despliegue en entornos con recursos limitados: al combinarse con un modelo base de tamano reducido, puede ejecutarse en GPU de consumo, aunque no se dispone de cifras de VRAM confirmadas.
- Integracion en pipelines de evaluacion automatica: el adaptador puede registrarse como componente de un sistema de moderacion junto con reglas heuristicas, siempre que se valide su comportamiento antes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; el consumo depende del modelo base tiny-aya-global, cuyos parametros no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable si el modelo base es de tamano reducido, pero no confirmado por el autor.
- Opciones de despliegue: PEFT con transformers (soporte nativo del formato); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bononi/healguard-v0-final | adaptador LoRA (~0,1 GB) | no disponible | no disponible | Hugging Face, 0 descargas | Model card vacia, sin evaluacion |
| CohereLabs/tiny-aya-global | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face (modelo base) | Base multilingue de Cohere Labs |
| Adaptadores LoRA genericos sobre modelos pequenos | variable | variable | variable | Hugging Face | Requieren validacion propia; no hay comparacion directa publicada |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- Ausencia de licencia declarada: no puede asumirse permiso para uso comercial ni redistribucion; es imprescindible contactar con el autor antes de cualquier despliegue.
- Riesgo de alucinacion y sesgos: no evaluado por el autor; el adaptador hereda los sesgos del modelo base, que tampoco estan documentados en esta ficha.
- Idiomas soportados no confirmados: aunque el modelo base es multilingue, no hay garantia de que el adaptador conserve ese comportamiento.
- Sin descargas ni validacion comunitaria: no existe evidencia externa de calidad o estabilidad.
- El nombre sugiere un uso de salvaguarda sanitaria o de seguridad, pero no hay documentacion que respalde esa funcion; no debe desplegarse en produccion sin una evaluacion propia.
- El adaptador no es autonomo: requiere cargar el modelo base CohereLabs/tiny-aya-global con PEFT 0.21.2 o compatible.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/bononi/healguard-v0-final
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact#compute
