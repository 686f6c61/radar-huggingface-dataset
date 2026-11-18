# Philips101/m2m100_418M-eng-yor-mt-onnx

## Resumen

m2m100_418M-eng-yor-mt-onnx es una conversión al formato ONNX del modelo Davlan/m2m100_418M-eng-yor-mt, un fine-tuning del modelo multilingüe M2M-100 de Facebook AI para traducción inglés-yoruba. Lo publica el usuario Philips101 y está empaquetado específicamente para su uso con Transformers.js, lo que permite ejecutar la traducción directamente en el navegador sin necesidad de un servidor backend. El modelo base fue desarrollado por David Adelani en el marco del proyecto Masakhane y está entrenado sobre los corpus JW300 y MENYO-20k.

La relevancia de esta ficha reside en dos factores. Por un lado, cubre un par de idiomas de bajos recursos (inglés-yoruba) para el que existen pocos modelos abiertos y menos aún listos para ejecución en cliente. Por otro lado, el formato ONNX con Transformers.js habilita despliegues edge y aplicaciones web que priorizan la privacidad de los datos, ya que la inferencia ocurre en el dispositivo del usuario.

El modelo se utiliza en el Consent-First Kit, un proyecto que genera borradores de traducción al yoruba para que un hablante nativo los revise antes de su publicación. Esta ficha describe exclusivamente la conversión ONNX; los pesos son idénticos a los del modelo base y no se han modificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100) |
| Parametros totales | 418 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0,8 GB) |
| Idiomas soportados | inglés (en), yoruba (yo) |
| Licencia | no disponible (el autor indica que los términos de reutilización están pendientes de confirmar) |
| Formato de pesos | ONNX (Transformers.js) |

## Arquitectura y entrenamiento

El modelo base es M2M-100, un transformer encoder-decoder multilingüe diseñado para traducción directa entre pares de idiomas sin depender del inglés como pivote. La variante de 418 millones de parámetros fue ajustada por David Adelani (Masakhane) específicamente para el par inglés-yoruba, entrenando sobre JW300 y MENYO-20k. No se dispone de información detallada sobre hiperparámetros, número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO.

La conversión a ONNX no altera los pesos: se trata de un reempaquetado para que el modelo pueda cargarse con Transformers.js en entornos JavaScript, incluyendo navegadores. El repositorio ocupa 0,8 GB, lo que sugiere una exportación sin cuantización agresiva, aunque no se especifica el esquema exacto de cuantización ni las dimensiones de contexto máximas soportadas en la exportación.

## Capacidades

- Traducción de texto inglés a yoruba y de yoruba a inglés.
- Generación de texto condicionada a tarea (text2text-generation) mediante el pipeline de traducción.
- Ejecución en navegador y en entornos JavaScript a través de Transformers.js.
- Inferencia local en el dispositivo, sin envío de datos a servidores externos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción asistida en aplicaciones web: el modelo puede cargarse con Transformers.js para traducir texto entre inglés y yoruba en el cliente, sin backend, lo que reduce costes de infraestructura y mantiene los datos en el navegador del usuario.
- Generación de borradores para revisión humana: tal como se usa en el Consent-First Kit, produce una primera versión en yoruba que un hablante nativo revisa y corrige antes de su difusión, apropiado para contextos donde la calidad automática aún no es suficiente.
- Herramientas de comunicación con comunidades yoruba-parlantes: organizaciones que necesitan publicar materiales en yoruba pueden usar el modelo para una traducción preliminar y acelerar el trabajo de traductores.
- Prototipado rápido de funcionalidades de traducción: desarrolladores que evalúan la viabilidad de un par de idiomas pueden integrar el modelo en una demo web en minutos gracias al formato ONNX y Transformers.js.
- Aplicaciones offline o de bajo ancho de banda: al ejecutarse en el dispositivo, el modelo es adecuado para entornos con conectividad limitada, siempre que el cliente pueda descargar los 0,8 GB de pesos.
- Investigación en traducción automática de bajos recursos: sirve como punto de partida reproducible para experimentos con el par inglés-yoruba en entornos JavaScript.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 418 millones de parámetros en FP32 se requieren aproximadamente 1,7 GB de memoria para los pesos, y algo más para activaciones.
- GPU recomendadas: no disponible; el modelo está pensado para ejecución en CPU y navegador mediante Transformers.js.
- Compatibilidad con GPU de consumo: previsiblemente sí en GPUs con al menos 2-4 GB de memoria libre, aunque no se documenta oficialmente.
- Opciones de despliegue: Transformers.js (principal), y potencialmente ONNX Runtime en otros entornos; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| m2m100_418M-eng-yor-mt-onnx (este) | 418 M | no disponible | en, yo | no disponible | ONNX |
| Davlan/m2m100_418M-eng-yor-mt | 418 M | no disponible | en, yo | no disponible | safetensors (formato original) |
| M2M-100 (base, 418 M) | 418 M | no disponible | multilingüe (100 idiomas) | MIT (modelo original de Meta) | safetensors, otros |

La comparación con el modelo base es directa: los pesos son idénticos y la diferencia es el formato (ONNX frente a safetensors) y el público objetivo (JavaScript/navegador frente a Python). Frente al M2M-100 original, este modelo está especializado en inglés-yoruba, por lo que se espera mejor calidad en ese par a costa de no cubrir los 100 idiomas del original.

## Limitaciones y advertencias

- Licencia no disponible: el autor indica que los términos de reutilización están pendientes de confirmar con el autor original, lo que impide garantizar el uso comercial.
- Modelo de bajos recursos: el yoruba es un idioma de bajos recursos y la calidad de traducción puede ser limitada, especialmente en dominios especializados o registro formal.
- Uso previsto como borrador: el propio autor lo describe como una traducción preliminar que requiere revisión de un hablante nativo; no debe usarse sin supervisión en comunicaciones sensibles.
- Riesgo de alucinación y errores de traducción: como todo modelo generativo, puede producir traducciones plausibles pero incorrectas.
- Cobertura limitada a dos idiomas: solo inglés y yoruba; no sirve como traductor general.
- Documentación escasa: no se especifican límites de contexto, esquema de cuantización ni métricas de calidad, lo que dificulta la planificación en producción.
- Tamaño de descarga: 0,8 GB puede ser excesivo para aplicaciones web con usuarios en conexiones lentas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Philips101/m2m100_418M-eng-yor-mt-onnx
- Modelo base: https://huggingface.co/Davlan/m2m100_418M-eng-yor-mt
- Proyecto Consent-First Kit: https://github.com/SDBE-Ex/consent-first-kit
