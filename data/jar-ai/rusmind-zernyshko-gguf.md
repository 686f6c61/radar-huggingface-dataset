# Jar-ai/RusMind-Zernyshko-GGUF

## Resumen

RusMind-Zernyshko-GGUF es la versión cuantizada en formato GGUF del modelo base DICPlay/RusMind-Zernyshko-1.6, publicada por el usuario Jar-ai. Se trata de un modelo de lenguaje de tamano muy reducido (aproximadamente 83 millones de parametros, con 10 capas y dimension oculta de 768), disenado especificamente para ruso e ingles. Su proposito es ofrecer una alternativa ligera y ejecutable en hardware modesto para generacion de texto conversacional.

El modelo emplea una arquitectura tipo LLaMA con una configuracion modificada y un tokenizador BPE propio de 16000 tokens. Con una longitud de contexto de solo 1024 tokens, esta pensado para tareas acotadas y despliegues con recursos limitados, no para razonamiento complejo ni contextos extensos. Su publicacion como cuantizacion no oficial implica que el autor original no respalda esta distribucion, tal como se indica de forma explicita en la model card.

La relevancia de esta ficha radica en documentar con rigor un artefacto de la comunidad: un SLM (small language model) ruso cuantizado en varios formatos (F32, F16, BF16, Q8_0) que puede ejecutarse localmente con llama.cpp u Ollama. Es importante senalar desde el principio que se trata de una conversion no oficial y que la licencia es personalizada (rusmind-license), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (configuracion modificada), transformer denso |
| Parametros totales | 83.083.008 (~83M) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F32, F16, BF16, Q8_0 |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | rusmind-license (other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de tipo LLaMA con una configuracion modificada respecto al estandar: 10 capas y una dimension oculta de 768, lo que da lugar a los aproximadamente 83 millones de parametros. Utiliza un tokenizador BPE personalizado con un vocabulario de 16000 tokens. La model card no proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO; estos datos deben considerarse no disponibles.

La innovacion tecnica de esta publicacion no reside en el modelo en si, sino en el proceso de cuantizacion: se ofrecen pesos sin cuantizar (F32, F16, BF16) y una version Q8_0, lo que permite elegir entre fidelidad y tamano. La model card advierte de forma explicita que se trata de una conversion no oficial y que el autor original mostro su desacuerdo con la presentacion del README. No se documentan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional en ruso e ingles.
- Razonamiento basico y respuestas de formato corto, limitado por el tamano del modelo y el contexto de 1024 tokens.
- Capacidad multilingue restringida a los dos idiomas declarados (ru, en).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo de pensamiento (thinking mode).
- Adecuado para tareas de texto simples, no para codigo o matematicas de cierta complejidad.

## Casos de uso

- Generacion de texto local en dispositivos con recursos limitados: al ocupar poco espacio en sus versiones cuantizadas, puede ejecutarse en CPU y ofrecer respuestas conversacionales basicas sin conexion.
- Prototipado rapido de pipelines de NLP en ruso: sirve para validar integraciones con llama.cpp u Ollama antes de escalar a modelos mayores.
- Clasificacion y etiquetado de textos cortos: con contexto de 1024 tokens puede procesar fragmentos breves para tareas de categorizacion simple.
- Chatbots de demostracion y entornos educativos: su tamano minimo permite desplegarlo en aulas o talleres para ilustrar el funcionamiento de un SLM.
- Filtrado o reformulacion de frases en ruso: util para tareas de normalizacion de texto donde no se requiere alta calidad generativa.
- Pruebas de infraestructura de inferencia: sirve como modelo de referencia para medir latencia y throughput en configuraciones de hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en Q8_0 y en torno a 330 MB en F16/BF16 (83M parametros); en F32, aproximadamente 330 MB adicionales respecto a F16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe en CPU y en GPUs integradas. No requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650) y en la mayoria de sistemas con CPU.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; los tags indican compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind-Zernyshko-GGUF | ~83M | 1024 | ru, en | rusmind-license | GGUF |
| DICPlay/RusMind-Zernyshko-1.6 (base) | ~83M | 1024 | ru, en | rusmind-license | safetensors |
| Alternativas SLM rusos de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: el autor original no respalda esta cuantizacion, segun se indica en la propia model card.
- Contexto muy limitado (1024 tokens), insuficiente para conversaciones largas o documentos extensos.
- Alto riesgo de alucinacion y baja calidad generativa por el reducido numero de parametros.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento.
- Licencia personalizada (rusmind-license): es imprescindible revisar los terminos antes de cualquier uso comercial.
- Solo soporta ruso e ingles; no hay soporte para castellano.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es apto para pipelines complejos.
- El modelo base no incluye informacion sobre alineacion (RLHF/DPO), lo que puede afectar a la calidad de las respuestas en produccion.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/Jar-ai/RusMind-Zernyshko-GGUF
- Modelo base: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6/raw/main/LICENSE
