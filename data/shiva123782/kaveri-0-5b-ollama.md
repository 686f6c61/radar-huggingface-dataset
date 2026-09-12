# shiva123782/Kaveri-0.5B-Ollama

## Resumen

Kaveri 0.5B es un asistente conversacional multilingue para ejecucion local distribuido por el usuario shiva123782 a traves de HuggingFace. No se trata de un modelo entrenado desde cero ni de un ajuste fino: segun su propia model card, la version v1 no incluye fine-tuning, LoRA, QLoRA ni pesos entrenados de forma independiente. Lo que se publica es una configuracion de identidad (un `Modelfile` de Ollama y un `system_prompt.txt`) que se aplica sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct.

El interes practico del artefacto es, por tanto, el de una plantilla reproducible de despliegue: permite levantar un chat multilingue con identidad propia en local usando Ollama, sin depender de APIs externas ni de GPU dedicada. El modelo base aporta la capacidad real de generacion de texto, con aproximadamente 0,49 mil millones de parametros, arquitectura transformer densa tipo Qwen2 y una ventana de contexto nativa de 32 768 tokens.

Es relevante ahora porque el coste de la inferencia en el extremo sigue bajando y los modelos sub-1B se usan cada vez mas como asistentes embebidos, clasificadores o componentes de sistemas mayores. Ahora bien, conviene ser honesto sobre su alcance: al no haber pesos nuevos ni evaluaciones publicadas, Kaveri 0.5B debe entenderse como una receta de configuracion, no como una contribucion de modelado. El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2, heredada del modelo base) |
| Parametros totales | ~0,49 B (494 M) en el modelo base Qwen2.5-0.5B-Instruct |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base; no se declara modificacion en Kaveri |
| Tipos de cuantizacion | GGUF a traves de Ollama (el repositorio Kaveri no aloja pesos); el modelo base ofrece FP16, GGUF, GPTQ y AWQ |
| Idiomas soportados | Ingles (en), telugu (te), hindi (hi), kannada (kn), tamil (ta) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible en el repositorio Kaveri (solo `Modelfile` y `system_prompt.txt`); los pesos se obtienen de `qwen2.5:0.5b-instruct` via Ollama |

## Arquitectura y entrenamiento

La arquitectura efectiva es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, embeddings de entrada y salida atados y atencion con consultas agrupadas (GQA). Al ser un modelo denso, no hay enrutamiento por expertos ni parametros activos distintos de los totales. El componente diferencial de Kaveri 0.5B no esta en los pesos ni en el entrenamiento, sino en la capa de configuracion: un prompt de sistema que fija la identidad "Kaveri" y un `Modelfile` de Ollama que empaqueta esa identidad junto al modelo base.

No se documento ningun proceso de entrenamiento, ajuste supervisado, RLHF, DPO o destilacion asociado a este repositorio. La model card es explicita al indicar "no fine-tuning, no LoRA, no QLoRA, no independently trained weights". En consecuencia, no hay composicion de dataset, numero de tokens de entrenamiento ni innovaciones tecnicas propias que reportar; cualquier capacidad observada procede integramente de Qwen2.5-0.5B-Instruct, cuyos detalles de entrenamiento corresponden a la documentacion de Alibaba Qwen y no se reproducen en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en el rango de capacidad propio de un modelo de 0,49 B de parametros.
- Soporte multilingue declarado para ingles, telugu, hindi, kannada y tamil, idiomas presentes en el modelo base.
- Identidad de asistente personalizada ("Kaveri AI") aplicada mediante prompt de sistema, orientada a respuestas claras, utiles y concisas.
- Inferencia 100 % local, sin llamadas a servicios externos, lo que facilita el despliegue en entornos sin conectividad o con requisitos de privacidad.
- Integracion directa con Ollama mediante `Modelfile`, lo que permite crear, versionar y distribuir la configuracion como un artefacto de infraestructura.
- No se declara soporte de tool calling, function calling, modo de razonamiento explicito, vision, audio ni capacidades de agente mas alla de lo que herede el modelo base. Para estas funciones, la informacion disponible no ofrece garantias.

## Casos de uso

- Asistente conversacional embebido en aplicaciones de escritorio o moviles: el modelo puede ejecutarse integramente en el dispositivo del usuario, sin enviar conversaciones a la nube, lo que resulta adecuado para productos con requisitos estrictos de privacidad.
- Prototipado rapido de interfaces de chat: al crearse con `ollama create kaveri -f Modelfile`, sirve como backend inmediato para validar flujos de conversacion antes de invertir en modelos mayores.
- Preprocesado y normalizacion de texto en pipelines de datos: tareas de reescritura, reformateo o resumen de fragmentos cortos donde el coste por token es mas relevante que la calidad maxima.
- Distribucion de demos educativas y talleres: su huella de memoria inferior a 1 GB en cuantizacion de 4 bits permite ejecutarlo en portatiles modestos o en una Raspberry Pi, facilitando sesiones practicas sin infraestructura GPU.
- Base para experimentos de personalizacion por prompt: investigadores que quieran medir como cambia el comportamiento de un modelo pequeno al variar unicamente el prompt de sistema pueden usar este repositorio como punto de partida controlado.
- Generacion de respuestas en idiomas del sur de la India: el modelo base cubre telugu, hindi, kannada y tamil, lo que habilita prototipos de atencion al cliente o asistentes de formularios en esas lenguas, siempre con supervision humana por el reducido tamano del modelo.
- Componente auxiliar en sistemas multiagente: puede actuar como router de intenciones, etiquetador o generador de borradores baratos antes de delegar en un modelo mayor.
- Ejecucion en entornos air-gapped: al no requerir conectividad una vez descargados los pesos, encaja en instalaciones industriales o gubernamentales con red aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de Kaveri 0.5B no incluye ninguna tabla de evaluacion, y al no existir pesos entrenados de forma independiente no procede atribuirle metricas propias. Cualquier cifra de MMLU, HumanEval, GSM8K u otras que se quisiera citar corresponderia al modelo base Qwen2.5-0.5B-Instruct y deberia consultarse en su documentacion oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en cuantizacion de 4 bits; en torno a 1-1,5 GB en FP16, contando pesos y cache de clave/valor para contextos moderados.
- GPU recomendadas: practicamente cualquier GPU con mas de 2 GB de memoria, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien es viable en GPU integradas y en Apple Silicon mediante Metal.
- Cabe sobradamente en GPU de consumo, e incluso en CPU: la inferencia en procesador es funcional, con velocidades del orden de decenas de tokens por segundo en hardware de escritorio moderno.
- Opciones de despliegue: Ollama es la via documentada oficialmente por el autor; tambien son viables llama.cpp, llama-cpp-python, vLLM y TGI si se trabaja con los pesos del modelo base en formato safetensors o GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para esta configuracion concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kaveri 0.5B | ~0,49 B (base Qwen2.5-0.5B) | 32 768 tokens (heredado) | en, te, hi, kn, ta | Apache-2.0 | Repositorio de configuracion en HuggingFace; pesos via Ollama o Qwen |
| Qwen2.5-0.5B-Instruct | ~0,49 B | 32 768 tokens | Multilingue, con soporte amplio de idiomas | Apache-2.0 | Pesos y cuantizaciones oficiales en HuggingFace |
| SmolLM2-360M-Instruct | ~0,36 B | 8 192 tokens (aproximado, segun documentacion del autor) | Principalmente ingles | Apache-2.0 | Pesos oficiales en HuggingFace |
| TinyLlama-1.1B-Chat | ~1,1 B | 2 048 tokens | Principalmente ingles | Apache-2.0 | Pesos oficiales en HuggingFace |

La comparacion relevante es contra Qwen2.5-0.5B-Instruct, del que Kaveri 0.5B es una envoltura de configuracion: mismos pesos, misma licencia y mismo contexto, con una identidad de sistema anadida. Frente a SmolLM2-360M-Instruct y TinyLlama-1.1B-Chat, la ventaja de Kaveri es la cobertura declarada de idiomas del sur de Asia y una ventana de contexto notablemente mayor, aunque su ecosistema y su comunidad son practicamente inexistentes hoy.

## Limitaciones y advertencias

- No es un modelo entrenado: la totalidad de su comportamiento procede de Qwen2.5-0.5B-Instruct. Presentarlo como un modelo propio en comparativas o articulos tecnicos seria enganoso.
- Con 0,49 B de parametros, la tasa de alucinacion es alta y la fiabilidad en razonamiento multi-paso, matematicas o codigo es muy limitada. No es adecuado para decisiones automatizadas sin verificacion.
- El soporte multilingue de un modelo de este tamano suele ser superficial en idiomas de bajos recursos: cabe esperar respuestas gramaticalmente imperfectas o mezcla de idiomas en telugu, kannada y tamil.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base, en particular sesgos culturales anglocentricos y estereotipos de genero o nacionalidad.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias de ningun tipo; la responsabilidad sobre el comportamiento en produccion recae en quien despliega.
- El repositorio no incluye pesos verificables ni versionado semantico de la configuracion, lo que dificulta la reproducibilidad exacta de una ejecucion a lo largo del tiempo.
- La identidad "Kaveri" se impone solo por prompt de sistema, por lo que puede romperse con facilidad mediante inyeccion de prompt o conversaciones adversarias.
- No hay evaluaciones de seguridad, red teaming ni filtros de contenido documentados.
- El repositorio muestra 0 descargas y 0 likes, sin senales de mantenimiento activo ni de comunidad que valide su funcionamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/shiva123782/Kaveri-0.5B-Ollama
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Ollama (herramienta de despliegue referenciada en la model card): https://ollama.com

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo; los unicos enlaces recuperados pertenecian a sitios de contenido para adultos y no guardan relacion con Kaveri 0.5B, por lo que se han descartado. No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos adicionales.
