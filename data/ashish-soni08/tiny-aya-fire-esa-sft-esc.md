# ashish-soni08/tiny-aya-fire-esa-sft-esc

## Resumen

tiny-aya-fire-esa-sft-esc es un ajuste fino (SFT) del modelo CohereLabs/tiny-aya-fire, publicado por el usuario ashish-soni08 en el contexto del Lexsi AI Safety & Alignment Hackathon (Track 3). El nombre del repositorio indica que se trata de un experimento de "escalation-safe agent", es decir, un agente que utiliza herramientas (tool-using) y que debería gestionar de forma segura las peticiones de escalada de privilegios o de acciones sensibles. Con 3.349.227.520 parámetros (aproximadamente 3,3 mil millones) y un tamaño de repositorio de 6,7 GB en formato safetensors, es un modelo pequeno orientado a investigación más que a producción.

El modelo se construye sobre la arquitectura Cohere2 (etiqueta `cohere2` en el repositorio) del modelo base tiny-aya-fire, que forma parte de la familia Aya de Cohere Labs, conocida por su enfoque multilingüe. El autor lo describe explícitamente como un "artefacto de investigación" y advierte de que algunos modelos de la serie son líneas base deliberadamente propensas a la escalada de privilegios, no destinadas a despliegue. Esta ficha debe leerse con esa cautela: la información pública es mínima y la model card completa aún no se ha publicado.

La relevancia actual del modelo es doble: por un lado, sirve como pieza de comparación de diseños de recompensa en el ámbito de la seguridad de agentes; por otro, al estar basado en un modelo pequeño y multilingüe, permite experimentar con alineación y seguridad en hardware asequible. No obstante, la ausencia de licencia declarada, de idiomas especificados y de benchmarks publicados limita seriamente su uso fuera del contexto del hackathon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cohere2 (transformer, según etiqueta del repositorio) |
| Parametros totales | 3.349.227.520 (3,3 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible (el modelo base Aya es multilingüe, pero no se especifica para este ajuste) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se presenta como un ajuste fino supervisado (SFT) del modelo base CohereLabs/tiny-aya-fire, que emplea la arquitectura Cohere2. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se aplicaron técnicas de RLHF o DPO. La model card indica únicamente que se trata de un "Stage 2 experiment model" dentro de una comparación de diseños de recompensa para un agente seguro ante escaladas, y que la model card completa se publicará cuando finalicen los experimentos.

La innovación declarada no es arquitectónica sino metodológica: el modelo forma parte de una serie en la que se comparan distintos diseños de recompensa para enseñar a un agente que usa herramientas a no escalar privilegios ni ejecutar acciones sensibles de forma insegura. El autor advierte de que algunos modelos de la serie son líneas base deliberadamente propensas a la escalada, lo que sugiere que el entrenamiento se organizó en etapas (stage 1, stage 2) con objetivos de seguridad contrapuestos. No hay información pública sobre el dataset, el proceso de anotación ni las técnicas de alineación empleadas.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base tiny-aya-fire.
- Uso de herramientas (tool calling / function calling), según el propósito declarado de "tool-using Aya agent".
- Comportamiento orientado a la seguridad de agentes: el ajuste pretende que el modelo gestione de forma segura peticiones de escalada de privilegios.
- Capacidades multilingües: no confirmadas para este ajuste concreto, aunque el modelo base Aya está diseñado para múltiples idiomas.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Visión o audio: no disponible.

## Casos de uso

- Investigación en seguridad de agentes: el modelo sirve como sujeto de estudio para comparar diseños de recompensa y medir la propensión a la escalada de privilegios en agentes que usan herramientas. Es su uso principal declarado.
- Evaluación de alineación en laboratorio: permite reproducir experimentos de seguridad con un modelo de 3,3 B parámetros en una sola GPU, facilitando iteraciones rápidas sobre políticas de recompensa.
- Pruebas de tool calling en entornos controlados: se puede integrar en un bucle de agente con funciones simuladas para observar cuándo el modelo intenta acciones no autorizadas.
- Línea base para comparativas de ajuste fino: al ser un SFT sobre tiny-aya-fire, sirve para medir el efecto del ajuste frente al modelo base en tareas de seguridad.
- Experimentación multilingüe de seguridad: si se confirma el multilingüismo heredado, permite estudiar si las políticas de escalada se mantienen en distintos idiomas.
- Docencia y formación en AI safety: útil como ejemplo práctico de cómo se diseña una comparación de recompensas y se documentan líneas base peligrosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2-2,5 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para experimentos por lotes; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM en fp16 y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: los pesos están en safetensors, por lo que se puede usar con Transformers, vLLM o TGI; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tiny-aya-fire-esa-sft-esc | 3,3 B | no disponible | no disponible | Hugging Face (repo público) | Ajuste SFT de investigación, seguridad de agentes |
| CohereLabs/tiny-aya-fire (base) | ~3,3 B (no confirmado) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base multilingüe de Cohere Labs |
| Modelos Aya de mayor tamano (familia Aya) | variable | no disponible | no disponible en esta ficha | Hugging Face | Alternativas multilingües de mayor capacidad |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo describe como "research artefact", no destinado a despliegue en producción.
- Riesgo deliberado de escalada: la serie incluye líneas base "deliberadamente propensas a la escalada"; no se puede asumir que este modelo concreto sea seguro sin evaluarlo.
- Licencia no declarada: no se especifican términos de uso comercial; debe consultarse al autor antes de cualquier uso fuera del hackathon.
- Idiomas no especificados: aunque el modelo base es multilingüe, no hay confirmación de qué idiomas conserva el ajuste.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva.
- Sin benchmarks: no hay métricas publicadas que permitan comparar su rendimiento o su seguridad de forma objetiva.
- Riesgo de alucinación: no evaluado; al ser un modelo de 3,3 B, es esperable una tasa de alucinación mayor que en modelos grandes.
- Sesgos: no documentados; el dataset de ajuste y su composición son desconocidos.
- Model card incompleta: el autor anuncia una model card completa cuando finalicen los experimentos, por lo que la información puede cambiar.

## Enlaces

- Hugging Face: https://huggingface.co/ashish-soni08/tiny-aya-fire-esa-sft-esc
- Repositorio de código y resultados: https://github.com/Ashish-Soni08/lexsi-escalation-safe-agent
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
