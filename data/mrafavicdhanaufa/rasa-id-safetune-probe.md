# MRafaVicdhanAufa/rasa-id-safetune-probe

## Resumen

RASA-ID SafeTune Probe es un clasificador de seguridad basado en activaciones (linear probe) desarrollado en el marco del proyecto RASA-ID (Robustness, Accuracy, Safety, and Adaptation for Indonesian Dialogue). No es un modelo generativo, sino un componente de guarda que se acopla a las representaciones internas del modelo Cohere Aya Expanse 8B para distinguir entre prompts dañinos y benignos en indonesio. Lo publica el usuario MRafaVicdhanAufa y se apoya en el toolkit SafeTune del ecosistema LEXI.

La sonda se entrena sobre la representacion del ultimo token en la capa 16 del modelo base, con una unica muestra de 24 ejemplos (12 dañinos y 12 benignos) y un umbral de decision fijado en -9.2436. El repositorio ocupa 0.0 GB y contiene unicamente el checkpoint de la sonda y su fichero de configuracion. Su relevancia es metodologica: demuestra un flujo de trabajo de safety basado en probing de activaciones aplicado a una lengua de bajos recursos como el indonesio, sin alterar los pesos del modelo original.

Las cifras publicadas (100% de precision sobre un set de 16 prompts) proceden de un conjunto de estres construido manualmente y el propio autor advierte que no establecen seguridad general ni readiness para produccion. La ficha debe leerse, por tanto, como la de un artefacto de investigacion experimental y no como la de un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Linear probe sobre representaciones de la capa 16 de Cohere Aya Expanse 8B (pooling de ultimo token) |
| Parametros totales | no disponible (sonda lineal; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | indonesio (unico idioma documentado en la model card) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) para la sonda; `.json` para la configuracion del experimento |

## Arquitectura y entrenamiento

La sonda es un clasificador lineal entrenado sobre las activaciones internas de Aya Expanse 8B, concretamente sobre la representacion del ultimo token en la capa 16. El modelo base es un transformer de 8B de parametros de CohereLabs, orientado a generacion multilingue; la sonda no modifica sus pesos, sino que se usa como guarda externa que lee sus estados ocultos. El toolkit SafeTune del ecosistema LEXI es el marco empleado para el entrenamiento y la gestion del checkpoint.

El conjunto de entrenamiento consta de 24 muestras (12 dañinos y 12 benignos), todas en indonesio y construidas manualmente. No se documentan tokens de entrenamiento, composicion detallada del dataset, ni uso de RLHF o DPO, ya que se trata de un entrenamiento supervisado de una sonda lineal, no de un ajuste del modelo base. El umbral de decision resultante es -9.2436, valor que se aplica sobre la puntuacion de la sonda para emitir la clasificacion binaria.

## Capacidades

- Clasificacion binaria de seguridad (dañino / benigno) sobre prompts en indonesio, a partir de activaciones internas del modelo base.
- Funciona como componente de guarda (guardrail) en un pipeline con Aya Expanse 8B, sin tocar los pesos del generador.
- Deteccion de prompts dañinos segun la definicion del dataset de entrenamiento (12 ejemplos dañinos).
- Aceptacion de prompts benignos con una tasa de falsos rechazos declarada del 0% en el set de prueba.
- No realiza generacion de texto, razonamiento, codigo, matematicas ni vision: es una sonda, no un modelo.
- No dispone de tool calling, function calling, soporte de agentes ni modo de pensamiento.
- Capacidad multilingue limitada al indonesio segun la documentacion; no se declaran otros idiomas.

## Casos de uso

- Filtro previo en un chatbot en indonesio: colocar la sonda entre la entrada del usuario y Aya Expanse 8B para bloquear prompts dañinos antes de la generacion, aprovechando que lee activaciones del propio modelo en la capa 16.
- Investigacion en safety multilingue: replicar el pipeline SafeTune/LEXI sobre otras lenguas de bajos recursos para estudiar como se separan representaciones de prompts dañinos y benignos.
- Auditoria de comportamiento del modelo base: usar la sonda como instrumento de medida para analizar en que capas y con que pooling se linealiza la distincion de seguridad en Aya Expanse 8B.
- Prototipado de guardrails en entornos de laboratorio: integrar el checkpoint `.pt` en un script de evaluacion que puntue cada prompt y aplique el umbral -9.2436 para generar metricas de deteccion.
- Docencia y reproduccion de experimentos: el repositorio incluye configuracion y metadatos (`rasa_id_safetune_probe_v1.json`), lo que permite reproducir el experimento con el dataset RASA-ID publicado.
- Construccion de datasets de seguridad en indonesio: usar las puntuaciones de la sonda para priorizar o etiquetar prompts candidatos en un flujo de curacion de datos, siempre con revision humana posterior.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 100% | Set de estres manual de 16 prompts |
| Deteccion de prompts dañinos | 100% | Set de estres manual de 16 prompts |
| Aceptacion de prompts benignos | 100% | Set de estres manual de 16 prompts |
| Tasa de falsos rechazos | 0% | Set de estres manual de 16 prompts |
| Prompts dañinos no detectados | 0% | Set de estres manual de 16 prompts |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores proceden de un set experimental de 16 prompts construido manualmente y no son extrapolables a otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma aislada; la sonda requiere cargar Aya Expanse 8B para extraer activaciones de la capa 16, por lo que el coste dominante es el del modelo base en precision completa (del orden de decenas de GB en fp16/bf16, estimacion no documentada en la model card).
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamaño del modelo base, cabria esperar A100/H100 para precision completa, pero no se documenta.
- Compatibilidad con GPU de consumo: no disponible; depende de la cuantizacion del modelo base, que no se especifica.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el artefacto es un checkpoint PyTorch (`.pt`) que se carga con el stack SafeTune/LEXI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RASA-ID SafeTune Probe | Linear probe de seguridad | no disponible (base 8B) | no disponible | MIT | Hugging Face |
| Cohere Aya Expanse 8B | Modelo generativo multilingue | 8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (CohereLabs) |
| Guardrails basados en clasificador dedicado | Clasificador de seguridad | no disponible | no disponible | variable | variable |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada; la comparacion se limita a tipo de artefacto y licencia.

## Limitaciones y advertencias

- Entrenamiento con solo 24 muestras (12 dañinos, 12 benignos): riesgo alto de sobreajuste y de generalizacion nula fuera del dominio del dataset.
- Evaluacion sobre 16 prompts manuales: el 100% de precision no es una metrica fiable ni representativa de un uso real.
- El propio autor declara que los resultados no establecen seguridad general ni readiness para produccion.
- Es un componente experimental de safety, no un modelo autonomo; no sustituye a un filtro de seguridad completo.
- Solo documenta indonesio: sin cobertura declarada para otras lenguas, incluido el castellano.
- Riesgo de sesgo derivado de la curacion manual del dataset y de la definicion de "dañino" empleada.
- Posible dependencia del modelo base concreto (Aya Expanse 8B, capa 16, pooling de ultimo token): cambiar de modelo o de capa invalida la sonda.
- Licencia MIT permite uso comercial del artefacto, pero no hay validacion de seguridad que respalde su despliegue en produccion.
- Sin datos de cuantizacion, latencia ni integraciones de serving: no apta para planificacion de infraestructura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MRafaVicdhanAufa/rasa-id-safetune-probe
- Modelo base Cohere Aya Expanse 8B: https://huggingface.co/CohereLabs/aya-expanse-8b
- Dataset RASA-ID: https://huggingface.co/datasets/MRafaVicdhanAufa/indo-safety-dataset
