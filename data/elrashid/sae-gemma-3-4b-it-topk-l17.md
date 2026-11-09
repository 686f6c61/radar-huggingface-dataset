# elrashid/sae-gemma-3-4b-it-topk-l17

## Resumen

`elrashid/sae-gemma-3-4b-it-topk-l17` es un autoencoder disperso (SAE, *sparse autoencoder*) de tipo TopK entrenado sobre el flujo residual de la capa 17 de `google/gemma-3-4b-it`, el modelo multimodal de 4 mil millones de parámetros de Google DeepMind. No es un modelo generativo: es una herramienta de interpretabilidad mecanicista que descompone las activaciones internas del modelo base en un conjunto de características dispersas y monitorizables. Lo desarrolla el usuario de Hugging Face `elrashid` en el contexto de la tesis de máster *The Refusal Slope* (BUiD).

Su relevancia radica en que forma parte de una cadena de herramientas de seguridad: el SAE companion `elrashid/gate-gemma-3-4b-it-l17` aplica una regresión logística sobre las características de este SAE para estimar P(dañino) de un prompt antes de la generación. Es decir, este SAE es la pieza que permite convertir activaciones opacas en señales interpretables y auditables para filtrado de contenido.

El repositorio ocupa 0,8 GB y se distribuye con licencia MIT, lo que facilita su reutilización en investigación. El acceso está restringido (gated) y requiere aceptar las condiciones en Hugging Face. No se dispone de información pública sobre el número de características del diccionario, el valor de k ni la tasa de dispersión alcanzada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE) TopK sobre el flujo residual de la capa 17 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (opera sobre activaciones, no sobre texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo base `google/gemma-3-4b-it`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio PyTorch, 0,8 GB) |
| Modelo base | `google/gemma-3-4b-it` (capa 17) |
| Dataset de entrenamiento | `monology/pile-uncopyrighted` |
| Tipo de SAE | TopK |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El artefacto es un autoencoder disperso de tipo TopK. Este diseño fuerza a que solo las k características de mayor activación se mantengan distintas de cero en cada paso, lo que produce representaciones más limpias y con menos “dead features” que los SAE con penalización L1. El SAE se entrena para reconstruir las activaciones del flujo residual de la capa 17 del transformer de Gemma 3 4B-IT, de modo que cada dimensión latente aprendida corresponde a una dirección interpretable del espacio de activaciones del modelo.

El entrenamiento utiliza el dataset `monology/pile-uncopyrighted`, una versión filtrada de The Pile sin material con derechos de autor, lo que mitiga riesgos legales en la investigación derivada. No se especifican en la información disponible el número de tokens de entrenamiento, el tamaño del diccionario (número de características), el valor de k, la tasa de reconstrucción ni si se aplicaron técnicas adicionales como normalización del decoder o reanimación de características muertas. Tampoco se detalla si el SAE cubre únicamente la torre de texto de Gemma 3 (multimodal) o también las activaciones de visión.

## Capacidades

- Descomposición de activaciones: proyecta el flujo residual de la capa 17 de Gemma 3 4B-IT en un espacio disperso de características interpretables.
- Extracción de características: permite identificar qué direcciones latentes se activan ante un prompt dado.
- Soporte para filtrado de seguridad: sirve como base del gate `elrashid/gate-gemma-3-4b-it-l17`, que puntúa P(dañino) antes de la generación.
- Análisis de mecanismos internos: facilita estudios de *probing*, circuitos y atribución de comportamientos.
- No genera texto: no es un modelo de lenguaje y no debe usarse como tal.
- No soporta tool calling ni agentes: su función es exclusivamente analítica.
- Capacidades multilingües: no disponibles de forma explícita; dependen del modelo base sobre el que se entrenó.
- No incluye modo *thinking*, visión ni audio propios.

## Casos de uso

- Auditoría de seguridad en producción: integrar el SAE y el gate asociado en un pipeline previo a la inferencia de Gemma 3 4B-IT para bloquear prompts con alta probabilidad de ser dañinos, usando las características del SAE como variables de entrada de un clasificador logístico.
- Investigación en interpretabilidad mecanicista: analizar qué características del flujo residual se activan ante conceptos concretos (toxicidad, refusal, sesgo) para construir mapas de circuitos internos del modelo.
- Monitorización de *refusal*: estudiar la “pendiente del rechazo” (*refusal slope*, tema de la tesis) midiendo cómo evolucionan las activaciones de la capa 17 cuando el modelo pasa de responder a negarse.
- Detección de sesgos: identificar direcciones latentes correlacionadas con atributos demográficos o estereotipos en el dataset Pile y cuantificar su magnitud.
- Red-teaming asistido: generar informes sobre qué regiones del espacio de activaciones se asocian a contenido dañino, guiando la búsqueda de prompts adversarios.
- Docencia y formación: usar el SAE como ejemplo práctico de SAE TopK sobre un modelo abierto de 4B para cursos de interpretabilidad y seguridad de IA.
- Desarrollo de clasificadores ligeros: reutilizar las características del SAE como *features* de entrada para clasificadores de bajo coste en lugar de ejecutar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el propio SAE: el repositorio pesa 0,8 GB, por lo que la inferencia del SAE cabe en cualquier GPU consumer con al menos 2 GB libres (por ejemplo, GTX 1650, RTX 3050).
- VRAM para el modelo base: para extraer activaciones de la capa 17 de Gemma 3 4B-IT se necesita cargar el modelo completo; en FP16 requiere aproximadamente 8-9 GB, por lo que cabe en RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100. En cuantización de 4 bits puede caber en GPUs de 6-8 GB.
- GPU recomendadas: RTX 4090 o A100 para extracción de activaciones a buen throughput; el SAE en sí puede ejecutarse en CPU para análisis puntuales.
- Despliegue: al ser un artefacto PyTorch, se carga con `torch.load` o `safetensors` según el formato final; no es compatible con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Capa | Licencia | Acceso |
|---|---|---|---|---|---|
| `elrashid/sae-gemma-3-4b-it-topk-l17` | SAE TopK | Gemma 3 4B-IT | 17 | MIT | Gated |
| `elrashid/gate-gemma-3-4b-it-l17` | Clasificador logístico sobre SAE | Gemma 3 4B-IT | 17 | no disponible | no disponible |
| SAE de Gemma Scope (DeepMind) | SAE (varios tipos) | Gemma 2 | Múltiples | Gemma Terms of Use | Público |
| SAE de Llama Scope (capa abierta) | SAE TopK | Llama 3.1 8B | Múltiples | Llama license | Público |

La comparación con Gemma Scope es la más directa por familia de modelos, aunque Gemma Scope se publicó para Gemma 2 y no para Gemma 3; no se dispone de datos de rendimiento comparables entre ambos SAE en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; usarlo como tal es un error de uso.
- Sesgos heredados: las características aprendidas reflejan los sesgos presentes en `monology/pile-uncopyrighted` y en las activaciones de Gemma 3 4B-IT.
- Riesgo de interpretación errónea: las características de un SAE no son necesariamente monosemánticas ni causalmente relevantes; requieren validación con experimentos de intervención.
- Cobertura limitada: solo cubre la capa 17 y, presumiblemente, la torre de texto; no representa el comportamiento completo del modelo.
- Idiomas: no se documenta qué idiomas cubre el SAE; aunque Gemma 3 es multilingüe, la calidad de las características en idiomas distintos del inglés no está garantizada.
- Licencia: el SAE es MIT, pero el modelo base Gemma 3 4B-IT está sujeto a los Gemma Terms of Use, que imponen restricciones adicionales al uso comercial y a la redistribución de derivados.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones, lo que puede complicar la reproducibilidad automatizada.
- Sin benchmarks publicados: no hay métricas de reconstrucción, dispersión ni utilidad downstream que permitan evaluar su calidad frente a alternativas.
- Fecha de creación futura (2026-07-02) en los metadatos: conviene verificar la integridad y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Hugging Face del SAE: https://huggingface.co/elrashid/sae-gemma-3-4b-it-topk-l17
- Gate companion: https://huggingface.co/elrashid/gate-gemma-3-4b-it-l17
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/monology/pile-uncopyrighted
- DOI: https://doi.org/10.57967/hf/9444
