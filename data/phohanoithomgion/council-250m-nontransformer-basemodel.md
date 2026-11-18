# Phohanoithomgion/Council-250M-Nontransformer-BaseModel

## Resumen

Council-250M-Nontransformer-BaseModel es un modelo de lenguaje de 250 millones de parámetros publicado por el usuario Phohanoithomgion en Hugging Face. Como su propio nombre indica, no emplea una arquitectura transformer convencional, sino una arquitectura alternativa desarrollada por el autor, cuyo núcleo de atención personalizado se denomina HALO Attention. El modelo se distribuye como pesos base (pretrained), no ajustados por instrucciones, y está entrenado sobre aproximadamente 9.000 millones de tokens en inglés.

El modelo tiene un interés fundamentalmente experimental: el autor lo describe explícitamente como un conjunto de pesos "desactualizado" dentro del proceso de desarrollo de su arquitectura, y remite a repositorios de GitHub separados para obtener la versión más reciente y el código necesario para ejecutarlo. No se publican datos de benchmarks, pipeline de inferencia ni detalles sobre la composición del dataset de entrenamiento.

Por su tamaño (250M), su licencia MIT y su naturaleza de modelo base, resulta relevante para investigadores interesados en arquitecturas alternativas al transformer y en experimentación con núcleos de atención no convencionales, más que para aplicaciones de producción inmediatas. La información disponible en la model card es muy limitada y no permite verificar capacidades concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer (arquitectura propia del autor; núcleo de atención HALO Attention) |
| Parametros totales | 250M (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El autor indica que el modelo no es un transformer y que emplea una arquitectura propia en desarrollo. El componente central de atención se denomina HALO Attention, documentado en un repositorio de GitHub independiente (HALO-Attention-Draft). No se especifican en la model card el número de capas, la dimensión del modelo, el mecanismo exacto de atención ni otras decisiones arquitectónicas.

El entrenamiento es de tipo pretraining sobre aproximadamente 9.000 millones de tokens. No se detalla la composición del dataset, el número de épocas, la longitud de secuencia utilizada ni si hubo fases posteriores de ajuste (SFT, RLHF o DPO). El autor advierte que estos pesos están desactualizados respecto a su arquitectura más reciente, disponible en otro repositorio (Council-Draft).

## Capacidades

- Generación de texto en inglés como modelo base (sin ajuste por instrucciones).
- Capacidad de modelado de lenguaje autocompletivo; no se documenta un modo de instrucciones o chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades de visión, audio ni modos de razonamiento explícito (thinking mode).
- Capacidad experimental: sirve como banco de pruebas para la arquitectura no transformer y el núcleo HALO Attention del autor.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo permite estudiar el comportamiento de una arquitectura no transformer a escala de 250M de parámetros y comparar su dinámica de entrenamiento con baselines transformer del mismo tamaño.
- Experimentación con mecanismos de atención personalizados: al estar vinculado a HALO Attention, es útil para reproducir y evaluar el núcleo de atención propuesto por el autor en tareas de modelado de lenguaje.
- Reproducción de pretraining a pequeña escala: los 9.000 millones de tokens de entrenamiento permiten usar el modelo como referencia para estudiar curvas de escalado en arquitecturas no convencionales.
- Fine-tuning académico: su licencia MIT y su tamaño moderado facilitan ajustes supervisados en dominios concretos del inglés para estudiar cómo se comporta la arquitectura frente a transformers equivalentes.
- Evaluación comparativa de perplejidad: puede emplearse como sujeto de pruebas en estudios de perplejidad y coherencia frente a modelos transformer de ~250M de parámetros.
- Docencia y divulgación: sirve para ilustrar en cursos o artículos cómo se implementa y entrena una arquitectura de lenguaje que no sigue el patrón transformer estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (250M de parámetros), en precisión FP16 requeriría aproximadamente 0,5 GB solo para pesos, y en cuantización de 8 bits alrededor de 0,25 GB, sin contar memoria para activaciones y KV cache (cifras estimadas, no confirmadas por el autor).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna podría alojarlo en teoría, pero la arquitectura no transformer puede requerir implementaciones específicas no estándar.
- Compatibilidad con GPU consumer: probable por tamaño, pero no verificada; depende de que el código del repositorio GitHub soporte los kernels necesarios.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. El autor indica que es necesario clonar el repositorio https://github.com/phohanoithomgion-hub/Pre-Council-Draft para ejecutarlo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Council-250M-Nontransformer-BaseModel | 250M (según nombre) | No disponible | No transformer (HALO Attention) | MIT | Hugging Face + GitHub del autor |
| Modelos transformer base de ~250M (p. ej., variantes tipo GPT-2 small o similares) | ~250M | Depende del modelo | Transformer decoder | Varía (a menudo MIT o Apache 2.0) | Amplia, con soporte en frameworks estándar |
| Alternativas no transformer experimentales | Variable | No disponible | SSM, híbridas, etc. | Varía | Repositorios de investigación |

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está diseñado para seguir órdenes ni para uso conversacional directo.
- Pesos declarados como desactualizados por el propio autor; la arquitectura más reciente está en otro repositorio.
- Información muy escasa: no se publican benchmarks, composición del dataset, longitud de contexto ni detalles de arquitectura.
- Idioma limitado al inglés según la model card.
- Riesgo elevado de alucinación y de generación incoherente, habitual en modelos base de este tamaño y agravado por la falta de evaluación publicada.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de género, raza u otros.
- Requiere código externo (repositorios de GitHub del autor) para la inferencia; no se garantiza compatibilidad con herramientas estándar del ecosistema.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene revisar los términos de los repositorios de código asociados, que pueden tener licencias independientes.
- No recomendado para producción sin una evaluación previa exhaustiva por parte del equipo adoptante.

## Enlaces

- Hugging Face: https://huggingface.co/Phohanoithomgion/Council-250M-Nontransformer-BaseModel
- Repositorio de ejecución (pesos actuales): https://github.com/phohanoithomgion-hub/Pre-Council-Draft
- Repositorio de la arquitectura más reciente: https://github.com/phohanoithomgion-hub/Council-Draft
- Repositorio del núcleo de atención HALO: https://github.com/phohanoithomgion-hub/HALO-Attention-Draft
