# miaratsuonizuma/Araddia-AI

## Resumen

Araddia-AI es un adaptador LoRA de tipo conversacional para portugués brasileño construido sobre el modelo base `google/gemma-3n-E4B-it`, desarrollado por el usuario miaratsuonizuma. Su propósito declarado es combinar respuestas objetivas con una personalidad de estilo sombrío y sarcástico, sin renunciar a la precisión ni a las salvaguardas de seguridad del modelo original. El repositorio se presenta explícitamente como un estado inicial: contiene el script de entrenamiento supervisado (SFT) con Unsloth y LoRA, un conjunto de datos semilla de ejemplo y el aviso legal requerido por la licencia Gemma, pero no los pesos entrenados finales.

La relevancia de esta ficha es limitada desde el punto de vista técnico: se trata de un repositorio de andamiaje (scaffolding) para un ajuste de personalidad, no de un modelo listo para producción. El autor advierte que el dataset incluido es insuficiente para un modelo de producción y que la página no debe publicarse como modelo terminado hasta subir el adaptador o los pesos resultantes y completar los datos reales de entrenamiento.

Al heredar la arquitectura del modelo base, el interés técnico recae en Gemma 3n E4B, un modelo multimodal de Google DeepMind con arquitectura optimizada para eficiencia en dispositivos. Cualquier evaluación de capacidades de Araddia-AI debe entenderse como una evaluación del modelo base más una capa de estilo, y no como un modelo autónomo con pesos verificables en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal (base: google/gemma-3n-E4B-it) |
| Parametros totales | no disponible (depende del modelo base; el adaptador LoRA no declara rango ni numero de parametros entrenables) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (pt), con enfasis en portugues brasileño |
| Licencia | Gemma Terms of Use (no Apache-2.0) |
| Formato de pesos | no disponible (el repositorio contiene scripts y dataset semilla; no se declaran pesos en safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) sobre `google/gemma-3n-E4B-it`, usando Unsloth como framework de entrenamiento. El repositorio incluye `code/train_araddia.py`, que implementa el pipeline de entrenamiento supervisado con LoRA, y `dataset/araddia_persona.jsonl`, un conjunto de ejemplos semilla destinado a probar la pipeline. El autor indica que este dataset es insuficiente para un ajuste de personalidad útil y recomienda ampliarlo a cientos o miles de diálogos originales, consistentes y revisados por una persona.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el rango de LoRA, la tasa de aprendizaje ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovación técnica del adaptador más allá de la capa de estilo conversacional. La arquitectura subyacente corresponde al modelo base Gemma 3n E4B, cuyas características técnicas (atención, multimodalidad, eficiencia en dispositivo) no se documentan en este repositorio y deben consultarse en la model card original de Google DeepMind.

## Capacidades

- Generación de texto conversacional en portugués brasileño con una voz estilizada sombría y sarcástica.
- Respuestas objetivas combinadas con la personalidad definida, según la propuesta del autor.
- Herencia de las capacidades del modelo base `google/gemma-3n-E4B-it` (no verificadas en este repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al portugués según los tags del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Gestión de crisis: el autor especifica que ante sufrimiento o riesgo de autoagresión la respuesta debe abandonar el sarcasmo y derivar a ayuda humana (CVV 188, SAMU 192 en Brasil).

## Casos de uso

- Prototipado de personajes conversacionales: el repositorio sirve como plantilla para entrenar una persona con LoRA sobre Gemma 3n E4B, usando el script de Unsloth y el dataset semilla como punto de partida para ampliar diálogos.
- Experimentación con ajuste de estilo: investigadores pueden evaluar cómo una capa LoRA modifica el tono de un modelo base sin alterar sus pesos originales, comparando respuestas antes y después del adaptador.
- Asistentes de entretenimiento en portugués brasileño: una vez entrenado con un dataset suficiente, el adaptador podría emplearse en aplicaciones de chat con personalidad marcada para audiencias brasileñas.
- Base para investigación sobre seguridad en personas estilizadas: el requisito explícito de abandonar el sarcasmo en situaciones de crisis lo convierte en un caso de estudio para evaluar salvaguardas en modelos con tono agresivo.
- Integración en aplicaciones Android: el autor menciona un runtime y formato específicos (`.litertlm`), lo que sugiere un uso previsto en despliegue móvil, aunque la conversión debe realizarse y probarse por separado.
- Evaluación de sesgos y alucinaciones en portugués: el repositorio recomienda evaluar alucinaciones, sesgos y comportamiento en crisis antes de cualquier distribución, lo que lo hace adecuado como banco de pruebas de evaluación.
- Fine-tuning educativo: el código y el dataset semilla permiten a desarrolladores aprender el flujo completo de SFT con LoRA y Unsloth sobre un modelo Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Gemma 3n E4B y de la cuantización elegida.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: el repositorio usa `transformers` y Unsloth para entrenamiento; no se documentan opciones de serving como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.
- Nota de despliegue móvil: el autor indica que un adaptador LoRA guardado por Transformers no se convierte automáticamente en un archivo `.litertlm` compatible con el runtime Android; la conversión e integración deben hacerse y probarse aparte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Araddia-AI | no disponible (LoRA sobre Gemma 3n E4B) | no disponible | Gemma Terms of Use | Repositorio de andamiaje, sin pesos finales | Persona conversacional en pt-BR |
| google/gemma-3n-E4B-it | no disponible en esta ficha | no disponible en esta ficha | Gemma Terms of Use | Pesos oficiales con acceso controlado | Modelo base multimodal de Google DeepMind |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El repositorio no contiene los pesos entrenados finales: es un estado inicial con scripts y dataset semilla, no un modelo listo para producción.
- El dataset incluido es insuficiente para un ajuste de personalidad útil; el autor recomienda ampliarlo a cientos o miles de diálogos originales y revisados.
- La persona es una capa de estilo, no una fuente de verdad: deben verificarse hechos, código y orientaciones importantes por riesgo de alucinación.
- En situaciones de sufrimiento, riesgo de autoagresión o suicidio, la respuesta debe abandonar el sarcasmo y derivar a ayuda humana; este comportamiento debe evaluarse explícitamente antes de desplegar.
- Riesgo de sesgos no evaluado: el autor recomienda evaluar sesgos y comportamiento en portugués antes de cualquier distribución.
- La licencia es Gemma Terms of Use, no Apache-2.0: se debe incluir copia de los términos, el aviso requerido y declarar claramente las modificaciones; no se pueden usar marcas o logos de Google que sugieran endoso.
- El acceso a los archivos del modelo base está controlado por Google en Hugging Face: cada usuario debe iniciar sesión, aceptar las condiciones y obtener acceso aprobado.
- No se deben incluir conversaciones privadas, datos personales, claves, tokens ni contenido sin derechos en el conjunto de entrenamiento.
- La integración con el runtime Android (`.litertlm`) requiere conversión y pruebas separadas; el adaptador LoRA de Transformers no es compatible de forma automática.
- No hay datos publicados de benchmarks, cuantizaciones ni requisitos de hardware para este adaptador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/miaratsuonizuma/Araddia-AI
- Modelo base: https://huggingface.co/google/gemma-3n-E4B-it
- Términos de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
