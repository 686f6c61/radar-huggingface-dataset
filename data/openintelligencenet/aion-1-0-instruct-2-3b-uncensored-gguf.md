# OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Uncensored-GGUF

## Resumen

Aion-1.0-Instruct-2.3B-Uncensored-GGUF es la distribucion en formato GGUF del modelo OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Uncensored, publicado por el usuario OpenIntelligenceNet. Se trata de un modelo de generacion de texto de tipo instruct con 2.288.831.488 parametros (aproximadamente 2,3 mil millones), orientado a conversacion y con la etiqueta "uncensored", lo que indica que el autor ha reducido o eliminado los filtros de seguridad y alineamiento tipicos de los modelos instruct convencionales. Su relevancia practica radica en que, al estar cuantizado en GGUF, puede ejecutarse en hardware de consumo mediante llama.cpp y sus derivados.

El repositorio incluye seis cuantizaciones (F16, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0), con tamanos que van desde 1,25 GB en Q3_K_M hasta 4,59 GB en F16. El modelo base del que derivan estos pesos se identifica como OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Uncensored, aunque no se proporciona informacion sobre su arquitectura interna, datos de entrenamiento ni proceso de alineamiento. El repositorio presenta cero descargas y cero "likes" en el momento de la consulta, lo que sugiere una publicacion muy reciente o de escasa difusion.

La ficha se elabora a partir exclusivamente de la informacion disponible en la model card y en los metadatos de Hugging Face. Cualquier dato no documentado se marca explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, no confirmado por el autor) |
| Parametros totales | 2.288.831.488 (~2,3B) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea n_ctx=4096, pero no se confirma como maximo oficial) |
| Tipos de cuantizacion | F16, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base, segun metadatos) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base. Los metadatos confirman que se trata de un modelo de generacion de texto con 2.288.831.488 parametros, y la nomenclatura "Instruct" indica que ha pasado por un proceso de ajuste para seguir instrucciones conversacionales. El termino "Uncensored" sugiere la aplicacion de tecnicas de eliminacion o reduccion de rechazos (abliteration u otras), aunque el autor no documenta el metodo concreto. El nombre de los ficheros GGUF incluye el sufijo "Abliterated", lo que apunta a una modificacion de los pesos orientada a suprimir el comportamiento de rechazo.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Toda esta informacion se considera no disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat, segun el ejemplo de `create_chat_completion` de la model card.
- Ajuste para seguir instrucciones (modelo de tipo instruct).
- Generacion sin filtros de seguridad declarados (uncensored), lo que implica que puede producir contenido que otros modelos rechazarian.
- Compatibilidad con endpoints estilo OpenAI mediante `llama-server`.
- Ejecucion local en CPU y GPU a traves de llama.cpp y llama-cpp-python.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues no documentadas.

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo puede desplegarse con `llama-server` en un puerto local y consumirse mediante una API compatible con OpenAI, lo que facilita integrarlo en aplicaciones existentes sin depender de servicios en la nube.
- Experimentacion en investigacion sobre alineamiento y seguridad: al ser un modelo "uncensored", resulta util para estudiar el comportamiento de modelos sin filtros, comparar respuestas frente a variantes alineadas y analizar sesgos o riesgos.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion, guiones o narrativa donde el autor necesita un modelo que no rechace premisas oscuras o controvertidas, asumiendo la responsabilidad editorial del contenido.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (1,47 GB) o Q5_K_M (1,67 GB) cabe en GPUs de gama media y en equipos con poca VRAM, lo que permite ejecutar el modelo en portatiles o mini-PC.
- Educacion y demostraciones de inferencia local: sirve para ilustrar el flujo completo de cuantizacion GGUF, carga con llama.cpp y generacion, en cursos o talleres de IA open source.
- Generacion de datos sinteticos para experimentos: puede emplearse para producir corpus de texto en tareas donde se requiere un modelo ligero y sin censura, siempre con revision posterior y sin uso comercial si la licencia no lo permite.
- Chatbots de dominio cerrado en entornos controlados: con contexto de 4096 tokens (segun el ejemplo) puede gestionar conversaciones de soporte o FAQ internas, aunque la falta de documentacion sobre contexto maximo real limita su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en Q3_K_M, 1,5 GB en Q4_K_M, 1,7 GB en Q5_K_M, 1,9 GB en Q6_K, 2,5 GB en Q8_0 y 4,6 GB en F16, a los que hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad; A100 y H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 6 GB o mas; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, y potencialmente Ollama u otros frontends compatibles con GGUF (no confirmado por el autor).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B-Uncensored-GGUF | ~2,3B | no disponible | no disponible | GGUF | Uncensored, sin benchmarks publicados |
| Modelos instruct de ~2-3B ampliamente disponibles (p. ej. variantes de la familia Llama, Qwen o Gemma) | ~1-3B | variable | variable | safetensors, GGUF | Ecosistema maduro, benchmarks publicados |
| Alternativas uncensored de ~2-3B en GGUF | ~2-3B | variable | variable | GGUF | Sin datos comparativos disponibles para este modelo concreto |

No se dispone de datos de rendimiento del modelo que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- Modelo "uncensored": puede generar contenido ofensivo, ilegal o danino; el autor declara que el usuario es responsable del uso y del output.
- Riesgo elevado de alucinacion por su tamano reducido (~2,3B) y por la falta de documentacion sobre entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados; el rendimiento en castellano es incierto.
- Longitud de contexto maxima no confirmada; el ejemplo usa 4096 tokens, pero no se garantiza.
- Sin benchmarks publicados, por lo que no hay evidencia objetiva de calidad frente a alternativas.
- Repositorio con cero descargas y cero "likes": sin validacion por parte de la comunidad.
- La ablacion de filtros puede degradar capacidades de razonamiento o coherencia; no hay evaluacion publicada al respecto.
- No se documentan capacidades de tool calling, agentes ni vision, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Uncensored-GGUF
- Modelo base: https://huggingface.co/OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Uncensored
- Ficheros de cuantizacion:
  - F16: https://huggingface.co/OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Uncensored-GGUF/resolve/main/Aion-1.0-Instruct-2.3B-Abliterated-F16.gguf
  - Q3_K_M: https://huggingface.co/OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Uncensored-GGUF/resolve/main/Aion-1.0-Instruct-2.3B-Abliterated-Q3_K_M.gguf
  - Q4_K_M: https://huggingface.co/OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Uncensored-GGUF/resolve/main/Aion-1.0-Instruct-2.3B-Abliterated-Q4_K_M.gguf
  - Q5_K_M: https://huggingface.co/OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Uncensored-GGUF/resolve/main/Aion-1.0-Instruct-2.3B-Abliterated-Q5_K_M.gguf
  - Q6_K: https://huggingface.co/OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Uncensored-GGUF/resolve/main/Aion-1.0-Instruct-2.3B-Abliterated-Q6_K.gguf
  - Q8_0: https://huggingface.co/OpenIntelligenceNet/Aion-1.0-Instruct-2.3B-Uncensored-GGUF/resolve/main/Aion-1.0-Instruct-2.3B-Abliterated-Q8_0.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
