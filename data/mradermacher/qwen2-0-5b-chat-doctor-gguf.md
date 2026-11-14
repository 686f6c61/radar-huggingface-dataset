# mradermacher/qwen2-0.5b-chat-doctor-GGUF

## Resumen

El modelo `qwen2-0.5b-chat-doctor-GGUF` es una cuantizacion en formato GGUF del modelo base `YangooAI/qwen2-0.5b-chat-doctor`, publicada por el usuario mradermacher, especializado en generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo original deriva de la familia Qwen2, concretamente de la variante de 0,5 mil millones de parametros ajustada para conversacion y orientada al ambito sanitario ("doctor"), segun indica su nombre.

Se trata de un modelo muy pequeno (493.772.928 parametros, es decir, aproximadamente 0,5B) disenado para tareas conversacionales en ingles. Su principal atractivo es que puede ejecutarse en hardware muy modesto, incluso en CPU, gracias a las cuantizaciones que van desde Q2_K (0,4 GB) hasta f16 (1,1 GB). El repositorio, sin embargo, no incluye informacion detallada sobre la arquitectura interna, los datos de entrenamiento ni los resultados de evaluacion del modelo base.

La relevancia de esta ficha radica en documentar con rigor lo que se sabe y, sobre todo, lo que no se sabe de este artefacto, dado que la model card del cuantizador es puramente operativa (lista de ficheros y enlaces) y no aporta datos tecnicos sustantivos sobre el modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, inferida del nombre; no confirmada en la model card) |
| Parametros totales | 493.772.928 (aproximadamente 0,5B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (tambien disponible el modelo base en transformers/safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `YangooAI/qwen2-0.5b-chat-doctor`. Por el nombre y la familia a la que pertenece, se infiere que emplea una arquitectura transformer decoder-only con atencion causal, propia de Qwen2, pero la model card del cuantizador no confirma ni detalla esta informacion. Tampoco se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el vocabulario.

Respecto al entrenamiento, no hay datos publicados en la informacion disponible sobre el numero de tokens utilizados, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El sufijo "chat-doctor" sugiere un ajuste fino orientado a conversacion en el dominio medico, pero se desconoce el corpus empleado, el proceso de curacion de datos y cualquier innovacion tecnica asociada. El cuantizador (mradermacher) unicamente documenta el proceso de conversion a GGUF con cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin aportar detalles sobre el modelo origen.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos de tipo asistencial o sanitario segun el nombre del modelo.
- Respuesta a instrucciones en formato chat (el nombre incluye "chat"), presumiblemente con plantilla de conversacion de Qwen2.
- Ejecucion local en hardware modesto gracias a las cuantizaciones GGUF de bajo tamano.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue en infraestructuras de inferencia estandar.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modos de pensamiento extendido.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: al ocupar entre 0,4 y 1,1 GB segun cuantizacion, permite levantar un chatbot funcional en un portatil sin GPU dedicada, ideal para pruebas de concepto antes de escalar a modelos mayores.
- Educacion y demostraciones de IA: util para ensenar el funcionamiento de modelos de lenguaje y de la cuantizacion GGUF en entornos con recursos limitados, ya que cabe en cualquier equipo.
- Filtrado o clasificacion de texto sencilla en ingles: su tamano permite procesar grandes volumenes de texto en CPU con baja latencia, aunque con calidad limitada.
- Generacion de respuestas de dominio sanitario de baja criticidad: dado el ajuste "doctor", puede emplearse en entornos simulados o de formacion para generar respuestas de ejemplo, nunca en diagnostico real.
- Despliegue en dispositivos edge o embebidos: la cuantizacion Q2_K o Q3_K_S (0,4 GB) permite ejecucion en Raspberry Pi o moviles con llama.cpp.
- Pruebas de pipelines de inferencia (llama.cpp, Ollama, servidores compatibles con OpenAI API) antes de migrar a modelos de mayor tamano, gracias a la etiqueta `endpoints_compatible`.
- Generacion de texto auxiliar en aplicaciones de bajo coste donde la precision no es critica y se prioriza el throughput y el consumo minimo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,4 GB (Q2_K/Q3_K_S) y 1,1 GB (f16). En la practica, con overhead de contexto y runtime, se recomienda al menos 1-2 GB de RAM/VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, etc.). Tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas e integradas modernas, e incluso en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (previa importacion del GGUF), servidores compatibles con la API de OpenAI (tag `endpoints_compatible`), y herramientas de inferencia GGUF en general. Tambien es posible usar el modelo base con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano (0,5B) se espera una latencia muy baja en CPU y GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen2-0.5b-chat-doctor-GGUF | 0,5B | no disponible | no disponible | GGUF | Ajuste "doctor" sobre Qwen2-0.5B; solo ingles |
| Qwen2-0.5B-Instruct | 0,5B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun documentacion publica de Qwen) | safetensors, GGUF | Modelo oficial de Alibaba; referencia de la familia |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Alternativa pequena para chat en ingles |
| SmolLM-135M / 360M | 0,135B / 0,36B | 2.048 tokens (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Modelos ultra-ligeros de Hugging Face |

Nota: los datos de los modelos comparativos provienen de documentacion publica general y no de la informacion proporcionada en esta ficha; se incluyen como referencia de categoria. Para el modelo objeto de la ficha, los campos no documentados se marcan como no disponibles.

## Limitaciones y advertencias

- La licencia no esta especificada en la informacion disponible, lo que impide confirmar si se permite el uso comercial. Es imprescindible verificar la licencia del modelo base `YangooAI/qwen2-0.5b-chat-doctor` antes de cualquier despliegue en produccion.
- El modelo solo declara soporte de ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Con 0,5B de parametros, la capacidad de razonamiento, la coherencia en conversaciones largas y la precision factual son estructuralmente limitadas; es esperable un alto riesgo de alucinacion, especialmente en el dominio sanitario.
- El ajuste "doctor" no implica validacion clinica; no debe usarse para diagnostico, consejo medico ni decisiones que afecten a la salud de personas.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad, por lo que no se pueden descartar sesgos de genero, raza u otros.
- La longitud de contexto no esta documentada, lo que dificulta dimensionar aplicaciones con conversaciones largas o documentos extensos.
- El repositorio tiene muy pocas descargas (22) y cero likes, lo que sugiere escasa validacion por parte de la comunidad.
- Al ser una cuantizacion, las versiones de baja precision (Q2_K, Q3_K) degradan la calidad respecto al modelo original; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/qwen2-0.5b-chat-doctor-GGUF
- Modelo base: https://huggingface.co/YangooAI/qwen2-0.5b-chat-doctor
- Variante con cuantizacion imatrix: https://huggingface.co/mradermacher/qwen2-0.5b-chat-doctor-i1-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#qwen2-0.5b-chat-doctor-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
