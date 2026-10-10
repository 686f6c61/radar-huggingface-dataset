# RKB109/support-routing-ml-20261010-model

## Resumen

El modelo RKB109/support-routing-ml-20261010-model es un prototipo pequeno y transparente orientado al enrutamiento de tickets de soporte tecnico. Lo publica el usuario RKB109 bajo licencia MIT y se distribuye a traves de Hugging Face con la libreria `custom`, lo que implica que no se apoya en `transformers` ni en pesos de un transformer convencional. Su mecanismo interno combina pesos de token por etiqueta con recuperacion de evidencia ponderada por IDF, una aproximacion de tipo bolsa de palabras con recuperacion, no una red neuronal profunda.

El problema que aborda es concreto: las operaciones de soporte necesitan modelos de enrutamiento reproducibles que expongan su nivel de confianza y deleguen los casos dudosos en lugar de forzar una clasificacion. Esa orientacion a la escalada selectiva (deferral) es el rasgo mas interesante del diseno, aunque el propio autor lo presenta como un baseline educativo y no como un sistema listo para produccion.

La relevancia de esta ficha es limitada por su escala: la evaluacion declarada se realizo sobre 4 ejemplos sinteticos de validacion cruzada, con una exactitud reportada de 1. No hay datos publicos de parametros, longitud de contexto, idiomas soportados ni formatos de pesos. Debe tratarse, por tanto, como una demostracion de arquitectura y reproducibilidad, no como un modelo desplegable en un caso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un transformer: pesos de token por etiqueta combinados con recuperacion de evidencia ponderada por IDF (custom) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato propio en JSON, segun la model card) |
| Idiomas soportados | no disponible (la model card advierte de que los tickets sinteticos no cubren todas las poblaciones ni idiomas) |
| Licencia | MIT |
| Formato de pesos | JSON propio (la model card menciona "model JSON format"); no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card describe el sistema como una combinacion de pesos de token por etiqueta con recuperacion de evidencia ponderada por IDF. Se trata, por tanto, de un clasificador lineal-like sobre representaciones dispersas de texto enriquecido con una etapa de recuperacion: cada etiqueta de enrutamiento dispone de pesos asociados a tokens, y la decision se apoya en la evidencia recuperada por relevancia. No hay atencion, ni capas de transformer, ni llamada a un LLM alojado, lo que el autor subraya explicitamente como parte del diseno.

En cuanto a los datos, el modelo se entrena sobre el dataset `RKB109/support-routing-ml-20261010-dataset`, de naturaleza sintetica y tamano reducido. No se especifica el numero de tokens ni la composicion detallada del corpus. La evaluacion reportada cubre 4 ejemplos sinteticos retenidos, con exactitud 1, una cifra que no permite extraer conclusiones estadisticas. Las metricas que el autor declara como objetivo son tres: `classification_accuracy`, `automation_coverage` y `escalation_precision`, lo que confirma que el foco esta en medir cuanto se automatiza y con que precision se escala, no solo la exactitud bruta.

La innovacion destacable, mas alla de la arquitectura, es la reproducibilidad: el repositorio de GitHub enlazado incluye `train.py`, el split exacto del dataset, el codigo de evaluacion y el formato JSON del modelo. No se documenta RLHF, DPO ni ninguna fase de ajuste por preferencias.

## Capacidades

- Clasificacion de texto (`text-classification`), su tarea principal declarada.
- Clasificacion zero-shot (`zero-shot-classification`) como etiqueta de cobertura en Hugging Face.
- Similitud entre frases (`sentence-similarity`).
- Resumen (`summarization`).
- Exposicion de confianza por etiqueta y capacidad de delegar casos inciertos, segun la descripcion del propio autor.
- Recuperacion de evidencia ponderada por IDF como mecanismo interpretable de decision.
- No soporta tool calling ni function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No hay capacidades de vision, audio ni modo "thinking".
- No hay lista de idiomas soportados; se desconoce la cobertura multilingue real.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo asignaria una cola o equipo a cada ticket y, gracias a su mecanismo de confianza, derivaria los casos dudosos a revision humana en lugar de forzar una asignacion.
- Prototipado de arquitectura: sirve como referencia minima para comparar un baseline transparente frente a alternativas basadas en transformers antes de invertir en infraestructura de GPU.
- Ejemplos de CI y evaluacion: al publicar `train.py`, el split y el codigo de evaluacion, puede integrarse en pipelines de integracion continua como caso de prueba reproducible de clasificacion.
- Comparaciones de baseline local: util para medir cuanto mejora realmente un modelo grande frente a una aproximacion de bolsa de palabras con IDF en un dominio concreto de tickets.
- Experimentacion educativa: adecuado para docencia sobre recuperacion de evidencia, ponderacion IDF y metricas de cobertura de automatizacion frente a precision de escalada.
- Analisis de interpretabilidad: los pesos por token permiten inspeccionar que terminos activan cada etiqueta, algo inviable en modelos opacos.
- Investigacion sobre deferral selectivo: su diseno orientado a exponer confianza lo hace apropiado para estudiar umbrales de escalada y su impacto en `automation_coverage` y `escalation_precision`.
- Generacion de etiquetas auxiliares en un pipeline de enriquecimiento de datos, siempre que se valide con datos representativos.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| Exactitud (accuracy) | 1 | 4 ejemplos sinteticos retenidos |
| classification_accuracy | no disponible (declarada como metrica objetivo, sin valor publicado) | no disponible |
| automation_coverage | no disponible (declarada como metrica objetivo, sin valor publicado) | no disponible |
| escalation_precision | no disponible (declarada como metrica objetivo, sin valor publicado) | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica cifra reportada, exactitud 1 sobre 4 ejemplos, carece de significacion estadistica y no debe interpretarse como rendimiento real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del modelo (pesos de token y recuperacion IDF sobre un JSON), es razonable esperar que funcione en CPU, aunque no hay cifras publicadas.
- GPU recomendadas: no disponible; no se requiere GPU segun la descripcion del autor.
- Compatibilidad con GPU de consumo: no confirmada, pero previsiblemente viable en cualquier equipo por la ausencia de calculo neuronal profundo.
- Opciones de despliegue: no disponible. La libreria declarada es `custom`, no `transformers`, por lo que no se puede asumir compatibilidad directa con vLLM, llama.cpp, Ollama o TGI. Habria que usar el codigo propio del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RKB109/support-routing-ml-20261010-model | Clasificador custom con recuperacion IDF | no disponible | no disponible | MIT | Hugging Face, 0 descargas |
| Clasificadores zero-shot basados en NLI (por ejemplo, familia BART-MNLI o DeBERTa-MNLI) | Transformer encoder-decoder o encoder | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | habitualmente MIT o Apache 2.0 | ampliamente desplegados, compatibles con `transformers` |
| Modelos de enrutamiento supervisado con encoder pequeno (tipo DistilBERT o MiniLM) | Transformer encoder | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | habitualmente Apache 2.0 | compatibles con `transformers`, cuantizables a ONNX |

No hay datos comparativos de rendimiento publicados para este modelo frente a alternativas. Cualquier comparacion de exactitud, latencia o cobertura seria especulativa.

## Limitaciones y advertencias

- Evaluacion no representativa: solo 4 ejemplos sinteticos retenidos y exactitud 1; la cifra no permite extrapolar comportamiento en produccion.
- Datos sinteticos: el autor advierte de que los tickets sinteticos no representan a todas las poblaciones de usuarios ni a todos los idiomas.
- Sesgo no analizado: no se documenta ningun analisis de sesgo, y la model card exige analisis de sesgo y consentimiento para datos de produccion.
- Riesgo de alucinacion: limitado en el sentido generativo, ya que el modelo clasifica y no genera texto libre; sin embargo, las etiquetas derivadas de evidencia recuperada pueden ser incorrectas y presentarse con alta confianza.
- Idiomas: sin lista publicada; se desconoce si funciona fuera del idioma de los datos sinteticos.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia no exime de la responsabilidad de validar el modelo con datos representativos.
- Advertencia explicita del autor: no usar para decisiones consecuentes sin datos representativos, revision experta y una evaluacion de grado de produccion.
- Compatibilidad: al no usar `transformers`, la integracion con ecosistemas estandar requiere trabajo adicional.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso en la comunidad.
- Fecha de publicacion: 10 de octubre de 2026, segun los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/support-routing-ml-20261010-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/support-routing-ml-20261010-dataset
- Repositorio de GitHub con `train.py`, split del dataset, codigo de evaluacion y formato JSON: referenciado en la model card, pero sin URL publicada ("no disponible").
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos correspondian a sitios sin relacion con el contenido tecnico y se han descartado.
