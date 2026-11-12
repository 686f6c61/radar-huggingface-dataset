# NotoriousH2/kanana-1.5-8b-instruct-2505-Persona-GGUF

## Resumen

kanana-1.5-8b-instruct-2505-Persona-GGUF es una distribucion en formato GGUF del modelo kanana-1.5-8b-instruct-2505, un modelo de lenguaje conversacional de aproximadamente 8.030 millones de parametros (8,03 B). La publica el usuario NotoriousH2 en Hugging Face, que ha realizado un ajuste fino adicional sobre la variante instruct y ha convertido los pesos a GGUF mediante Unsloth. El modelo base procede de la familia kanana 1.5, aunque la model card no identifica al desarrollador original ni aporta detalles sobre su entrenamiento.

El interes practico de esta publicacion es la disponibilidad de pesos cuantizados listos para ejecutarse con llama.cpp y herramientas compatibles, lo que permite desplegar un modelo de 8 B en hardware de consumo. Se distribuye una unica cuantizacion, Q4_K_M, que equilibra tamano y calidad y ocupa aproximadamente 4,9 GB. El repositorio completo pesa 24,6 GB, lo que sugiere que tambien aloja otros artefactos ademas del GGUF principal, aunque la model card solo documenta ese fichero.

La informacion publicada es muy limitada: no se detallan la licencia, los idiomas soportados, la longitud de contexto, la composicion del dataset de ajuste ni resultados de evaluacion. Esto obliga a tratar la ficha como una referencia de despliegue y no como una evaluacion de capacidades. La etiqueta "Persona" en el nombre sugiere un ajuste orientado a un estilo conversacional concreto, pero no se especifica cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia llama, segun los tags del repo); detalles no disponibles |
| Parametros totales | 8.030.285.824 (8,03 B) |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero documentado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Los tags del repositorio incluyen "llama", lo que indica compatibilidad con la implementacion de llama.cpp para la familia Llama, pero no confirma que el modelo original sea de Meta. El recuento de parametros (8,03 B) es coherente con un transformer denso de escala 8 B, aunque no se dispone de datos sobre numero de capas, dimension oculta, atencion (MHA, GQA) ni funcion de activacion.

Respecto al entrenamiento, solo consta que el autor realizo un ajuste fino y la conversion a GGUF con Unsloth, herramienta que acelera el fine-tuning y la exportacion de pesos. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni la naturaleza del ajuste "Persona". Tampoco se documenta si el modelo base emplea tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional en formato instruct, segun la designacion del modelo.
- Ejecucion local mediante llama.cpp con plantilla de chat Jinja (`--jinja`).
- Compatible con endpoints (tag `endpoints_compatible`), lo que facilita su publicacion como API.
- Estilo de respuesta ajustado a una "persona" concreta, aunque no se detalla cual.
- Capacidades multilingues: no disponibles.
- Tool calling, function calling y razonamiento multi-paso: no documentados.
- Vision, audio o modo thinking: no documentados.

## Casos de uso

- Prototipado de asistentes conversacionales locales: el GGUF Q4_K_M permite ejecutar un modelo de 8 B en una GPU de consumo o incluso en CPU, lo que sirve para validar flujos de chat antes de invertir en infraestructura.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse con llama.cpp en hardware propio, los datos no salen del perimetro del usuario, adecuado para pruebas con informacion sensible.
- Integracion en aplicaciones de escritorio o CLI: la invocacion con `llama-cli -hf ... --jinja` simplifica la incorporacion del modelo en herramientas de linea de comandos y demos internas.
- Evaluacion de ajustes de personalidad: al tratarse de una variante "Persona", puede usarse para comparar estilos de respuesta frente al modelo instruct original en tareas de redaccion o atencion al usuario.
- Servicio de inferencia ligero con API compatible: gracias al tag `endpoints_compatible`, es viable exponerlo mediante un servidor local y consumirlo desde aplicaciones web o bots.
- Base para cuantizaciones adicionales o fine-tuning posterior: al estar en GGUF y haberse generado con Unsloth, sirve como punto de partida para experimentos de cuantizacion a Q5 o Q8 si se dispone de los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 5-6 GB, considerando los aproximadamente 4,9 GB de pesos mas overhead de contexto y cache KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para inferencia comoda; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas de VRAM usando Q4_K_M; tambien puede ejecutarse en CPU con llama.cpp, a menor velocidad.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y cualquier runtime compatible con GGUF (Ollama, LM Studio, KoboldCpp). vLLM y TGI no consumen GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles; dependeran del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kanana-1.5-8b-instruct-2505-Persona-GGUF | 8,03 B | No disponible | No disponible | GGUF Q4_K_M | Ajuste "Persona", publicado por un tercero |
| Llama 3.1 8B Instruct | 8 B | 128 K | Llama 3.1 Community License | Safetensors, GGUF | Referencia de la familia llama; contexto y licencia documentados |
| Qwen2.5 7B Instruct | 7,6 B | 128 K | Apache 2.0 | Safetensors, GGUF | Alternativa abierta con amplio soporte multilingue |
| Mistral 7B Instruct v0.3 | 7,2 B | 32 K | Apache 2.0 | Safetensors, GGUF | Modelo denso de tamano comparable con ecosistema maduro |

La comparacion es estructural: no hay datos de rendimiento del modelo kanana que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que no puede confirmarse el uso comercial; es imprescindible contactar con el autor o consultar el modelo base antes de produccion.
- No se documentan los idiomas soportados; el rendimiento en castellano es desconocido.
- Se desconoce la longitud de contexto real, lo que impide planificar aplicaciones con ventanas largas.
- Al ser un ajuste fino de un tercero sobre un modelo del que no se detalla el origen, existe riesgo de sesgos heredados y de deriva en el estilo "Persona" no documentada.
- Riesgo de alucinacion propio de modelos de 8 B sin datos de evaluacion que lo acoten.
- Solo se ofrece una cuantizacion (Q4_K_M); no hay variantes de mayor precision para tareas que requieran maxima fidelidad.
- El modelo tiene 135 descargas y 1 like, lo que indica escasa validacion por parte de la comunidad.
- La fecha de creacion indicada (2026) es inconsistente con el estado actual del ecosistema y debe tratarse con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/NotoriousH2/kanana-1.5-8b-instruct-2505-Persona-GGUF
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
