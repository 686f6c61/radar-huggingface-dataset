# eladeselasobenobadi/Human

## Resumen

El modelo `eladeselasobenobadi/Human` es un fine-tuning del modelo base `EnlistedGhost/Llama-3.2-11B-Vision-Instruct-OLLAMA`, publicado en HuggingFace con licencia OpenRAIL. La información disponible en la model card es extremadamente escasa y no incluye especificaciones técnicas detalladas. El repositorio contiene un script de Python que utiliza Ollama para ejecutar un chatbot con una personalidad paranoide en sueco, lo que sugiere que el modelo está orientado a conversación con un prompt de sistema específico, aunque la etiqueta de pipeline indica `text-to-audio`, lo que resulta contradictorio con el contenido del script.

El modelo declara soporte para los idiomas inglés, turcomano y sueco, y referencia un dataset llamado `eddmpython/dartlab-data`. No se proporcionan métricas de evaluación, ni información sobre el proceso de entrenamiento, el número de parámetros o la arquitectura concreta. Dada la falta de datos verificables, esta ficha se limita a documentar lo que se puede extraer de la página del modelo y advierte de las inconsistencias encontradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base declarada: Llama-3.2-11B-Vision-Instruct-OLLAMA) |
| Parametros totales | no disponible (el base tiene 11B, pero el fine-tuning no especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tk, sv (segun metadatos) |
| Licencia | openrail |
| Formato de pesos | no disponible (el script usa Ollama, no se publican pesos) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El campo `base_model` indica que parte de `EnlistedGhost/Llama-3.2-11B-Vision-Instruct-OLLAMA`, un modelo de 11B parametros con capacidades de vision e instruccion, pero no se especifica si el fine-tuning modifica capas, utiliza LoRA, o cualquier otra tecnica. Tampoco hay datos sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron metodos de alineacion como RLHF o DPO. La etiqueta `library_name: sample-factory` sugiere el uso de la libreria Sample Factory para entrenamiento por refuerzo, pero no hay confirmacion en la documentacion. La pipeline declarada (`text-to-audio`) no coincide con el contenido del script, que es claramente un chatbot de texto.

## Capacidades

- Generacion de texto conversacional: el script incluido en la model card define un chatbot con una personalidad paranoide que responde en sueco, usando el modelo a traves de Ollama.
- No se documentan capacidades de vision, audio, tool calling, agentes, razonamiento multi-paso ni otras funcionalidades.
- El modelo declara soporte multilingue para ingles, turcomano y sueco, aunque el unico ejemplo de uso esta en sueco.
- No hay evidencia de capacidades especiales como modo thinking, vision o audio, a pesar de la etiqueta `text-to-audio`.

## Casos de uso

Dada la falta de documentacion, los casos de uso son especulativos y se basan unicamente en el script proporcionado:

- Chatbot de rol con personalidad definida: el script muestra como crear un asistente conversacional con un prompt de sistema que fuerza una personalidad paranoide. Podria usarse para experimentos de role-playing o demos interactivas.
- Pruebas de generacion de texto en sueco: el modelo parece capaz de mantener conversaciones en sueco, por lo que podria servir para tareas de generacion de texto en ese idioma.
- Investigacion sobre fine-tuning de modelos Llama con prompts de sistema complejos: el ejemplo ilustra como inyectar un sistema de creencias en un modelo base.
- Prototipado rapido con Ollama: el script demuestra la integracion con Ollama para ejecutar el modelo localmente, lo que facilita pruebas en entornos sin GPU dedicada.
- Generacion de dialogos con tono especifico: el prompt de sistema fuerza un estilo paranoico y de ciencia ficcion, util para crear contenido narrativo o dialogos de ficcion.
- Evaluacion de robustez ante prompts adversariales: el modelo podria usarse para estudiar como responde a acusaciones de ser una IA, aunque no hay datos de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona metricas `meteor` y `google_bleu` en los metadatos, pero no se proporcionan valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

- No se dispone de informacion sobre requisitos de hardware especificos para este modelo.
- El script de ejemplo utiliza Ollama, lo que sugiere que el modelo puede ejecutarse localmente en una maquina con recursos moderados, pero no se indica VRAM minima.
- Dado que el modelo base tiene 11B parametros, se estima que una cuantizacion de 4 bits requeriria al menos 6-8 GB de VRAM, pero esto es una suposicion basada en el modelo base, no en el fine-tuning.
- No se mencionan opciones de despliegue como vLLM, TGI o llama.cpp, aunque Ollama es la unica via documentada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base `EnlistedGhost/Llama-3.2-11B-Vision-Instruct-OLLAMA` podria compararse con otros modelos de 11B como Llama-3.1-8B o Mistral-7B, pero no hay datos de rendimiento de este fine-tuning. Se indica "no disponible".

## Limitaciones y advertencias

- La informacion publicada es minima y contradictoria: la pipeline `text-to-audio` no coincide con el uso conversacional de texto.
- No hay garantias de que el modelo funcione como se describe en el script; el codigo usa el modelo `llama3` de Ollama, no el propio `eladeselasobenobadi/Human`, lo que sugiere que el script es un ejemplo de uso con otro modelo.
- El prompt de sistema define una personalidad paranoide que podria generar respuestas sesgadas o inapropiadas en contextos reales.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto.
- La licencia OpenRAIL permite uso comercial, pero con restricciones tipicas de esta licencia (no usos ilegales o daninos).
- No se proporcionan pesos ni archivos de modelo descargables; solo un script de ejemplo.

## Enlaces

- Pagina del modelo: https://huggingface.co/eladeselasobenobadi/Human
- Modelo base declarado: https://huggingface.co/EnlistedGhost/Llama-3.2-11B-Vision-Instruct-OLLAMA
- Dataset referenciado: https://huggingface.co/datasets/eddmpython/dartlab-data
- Libreria Sample Factory: https://github.com/alex-petrenko/sample-factory (referencia indirecta)
