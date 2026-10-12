# ElementMerc/tinyllama-1.1b-abliterated-GGUF

## Resumen

ElementMerc/tinyllama-1.1b-abliterated-GGUF es la distribucion en formato GGUF de ElementMerc/tinyllama-1.1b-abliterated, un transformer decoder-only de 1.100.048.384 parametros derivado de TinyLlama-1.1B y sometido a un proceso de abliteration: la supresion de la direccion de rechazo en el espacio de activaciones para que el modelo deje de negarse a responder determinadas peticiones. El repositorio no introduce cambios de arquitectura ni de entrenamiento respecto al modelo padre; contiene unicamente los pesos convertidos y cuantizados para llama.cpp y sus derivados (Ollama, LM Studio, Jan).

Su relevancia es practica. Con unos 1,1 mil millones de parametros en dos precisiones (F16 y Q4_K_M) cabe en cualquier GPU de consumo, en CPU e incluso en dispositivos de placa unica, lo que lo convierte en un banco de pruebas barato para experimentos de alineacion, red teaming y generacion local sin filtros de rechazo. La licencia Apache 2.0 permite uso comercial sin clausulas adicionales.

La model card incluye un aviso de correccion fechado el 2026-10-01: los numeros de evaluacion del modelo padre quedan retirados y no deben citarse, aunque los ficheros GGUF no se retiran ni se modifican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivado de TinyLlama-1.1B (arquitectura tipo Llama 2) |
| Parametros totales | 1.100.048.384 (dato de safetensors del modelo base) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada en la informacion disponible; el ejemplo de la model card usa `-c 4096` |
| Tipos de cuantizacion | F16 y Q4_K_M (ambas incluidas en el repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (convertido con `convert_hf_to_gguf.py` y cuantizado con `llama-quantize`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo padre: un transformer decoder-only de 1,1 mil millones de parametros heredado de TinyLlama-1.1B, con atencion causal y sin componentes MoE, SSM ni hibridos. El repositorio GGUF es exclusivamente un artefacto de serializacion y cuantizacion: los tensores se convierten desde los safetensors del padre y se cuantizan en dos variantes, F16 (sin perdida de cuantizacion) y Q4_K_M (compromiso habitual entre tamano y calidad). No hay entrenamiento adicional, destilado ni ajuste fino en este paso.

La unica transformacion relevante respecto a un TinyLlama convencional es la abliteration aplicada en el modelo padre, que modifica los pesos para eliminar la direccion de activacion asociada al rechazo de peticiones. La model card no documenta en este repositorio ni el dataset de ajuste, ni el numero de tokens, ni si hubo RLHF o DPO: esa informacion se remite integramente a la ficha del modelo padre. Tampoco se describe ninguna innovacion de decodificacion (decodificacion especulativa, atencion lineal, etc.). El unico control de calidad declarado es que cada fichero GGUF fue cargado y ejecutado antes de publicarse.

## Capacidades

- Generacion de texto autoregresiva en ingles, en modo completado y conversacional, con plantilla de chat heredada del modelo padre.
- Razonamiento basico y tareas de conocimiento general limitadas por el tamano de 1,1B parametros.
- Generacion de codigo sencillo y fragmentos cortos; no esta orientado a repositorios completos ni a tareas de ingenieria largas.
- Aritmetica simple y cadenas de pasos cortas; el rendimiento en matematicas multi-paso es propio de un modelo de este tamano.
- Respuesta sin rechazos ante peticiones que un modelo alineado declinaria: es la caracteristica definitoria del modelo.
- No se documenta soporte de tool calling, function calling ni uso como agente en la informacion disponible.
- No se documenta vision, audio ni modo de razonamiento explicito (thinking mode).
- Multilingue: no; la ficha declara unicamente ingles.

## Casos de uso

- Red teaming y evaluacion de seguridad: sirve como sujeto de prueba de bajo coste para medir hasta que punto un detector de contenido o un guardrail resiste ante un modelo sin rechazos, ejecutandose en local y sin cuotas de API.
- Generacion de datos adversarios sinteticos: producir lotes de prompts y respuestas problematicas para entrenar o validar clasificadores de moderacion, con el filtrado humano posterior obligatorio.
- Investigacion sobre abliteration: comparar la variante abliterated con TinyLlama-1.1B original permite medir cuanto del comportamiento de rechazo se pierde y a que coste en calidad general.
- Asistente local totalmente offline: con el fichero Q4_K_M se puede montar un servidor `llama-server` en un portatil o en una Raspberry Pi para autocompletado y generacion de texto sin conexion ni telemetria.
- Prototipado rapido de pipelines de generacion: al ser compatible con llama.cpp y Ollama, permite validar plantillas de prompt, longitudes de contexto y flujos de inferencia antes de escalar a un modelo mayor.
- Aumento de datos creativos: generacion de variaciones de texto, borradores y material de ficcion sin restricciones tematicas, util en escritura asistida y generacion de corpus de prueba.
- Pruebas de integracion de cuantizacion: comparar las salidas de F16 frente a Q4_K_M para cuantificar la degradacion introducida por la cuantizacion en un modelo pequeno, donde el margen de calidad es escaso.
- Docencia y demostraciones: ilustrar en un aula como funciona un GGUF, el papel de las cuantizaciones y las diferencias entre un modelo base y uno modificado por abliteration, con tiempos de descarga y ejecucion minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de este repositorio no imprime cifras propias e incluye un aviso de correccion del 2026-10-01 por el que los numeros de evaluacion del modelo padre quedan retirados, con el motivo explicitado en la ficha de dicho modelo padre. En consecuencia, cualquier cifra de MMLU, HumanEval, GSM8K o similar atribuida a este modelo debe considerarse no valida a efectos de cita.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2-3 GB para el fichero F16 y en torno a 0,7-1,5 GB para Q4_K_M, incluyendo la cache KV segun la longitud de contexto configurada.
- Tamano del repositorio completo (ambos ficheros): 2,9 GB.
- GPU de consumo: cabe con holgura en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090); el fichero Q4_K_M funciona incluso en GPU integradas y en CPU con AVX2.
- GPU de datacenter: A100, H100 y similares no son necesarias; el modelo queda muy por debajo de su capacidad y el cuello de botella seria el lanzamiento de kernels, no la memoria.
- CPU y dispositivos de borde: ejecutable en x86 moderno, Apple Silicon, Raspberry Pi 4/5 y telefonos mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server -m tinyllama-1.1b-Q4_K_M.gguf -c 4096`), Ollama (`ollama run hf.co/ElementMerc/tinyllama-1.1b-abliterated-GGUF:Q4_K_M`), LM Studio, Jan y descarga programatica via `huggingface_hub`.
- Latencia y throughput: no disponibles en la informacion proporcionada; no se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

Los datos de esta tabla proceden de las fichas publicas de cada modelo alternativo y no de la informacion proporcionada para este repositorio; verifiquelos antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ElementMerc/tinyllama-1.1b-abliterated-GGUF | 1,1B | no disponible | Apache 2.0 | GGUF en HuggingFace | Sin rechazos; cifras de evaluacion retiradas |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 | Apache 2.0 | Safetensors y GGUF comunitarios | Modelo alineado de referencia de la misma familia |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32 768 | Apache 2.0 | Safetensors y GGUF | Mas contexto y mejor soporte multilingue |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128 000 | Llama 3.2 Community License | Safetensors y GGUF | Contexto muy superior; licencia con condiciones de uso |

No hay comparativa de rendimiento disponible: al haberse retirado los numeros de evaluacion del modelo padre, no es posible confrontar puntuaciones de benchmarks de forma fiable.

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo, que es precisamente el objetivo del modelo: no existe filtro interno frente a peticiones daninas, ilegales o inseguras. Cualquier despliegue en produccion debe incorporar moderacion externa.
- El aviso de correccion del 2026-10-01 retira todos los numeros de evaluacion del modelo padre. No cite cifras de rendimiento de este modelo.
- La cuantizacion Q4_K_M degrada la calidad respecto a F16, y en un modelo de 1,1B el margen de calidad disponible es menor que en modelos grandes; si un resultado es critico, conviene validarlo contra el fichero F16.
- Sesgos conocidos: no documentados en la informacion disponible, pero el modelo hereda los sesgos de su corpus de entrenamiento y el ingles es su unico idioma declarado.
- Riesgo de alucinacion: elevado, como corresponde a un modelo de 1,1B parametros; no es adecuado para tareas de recuperacion factual sin verificacion.
- Limitacion de contexto: la longitud maxima no se especifica en la informacion disponible. El ejemplo de la model card usa 4096 tokens, pero no hay confirmacion de que el modelo mantenga calidad a esa longitud.
- Limitacion idiomatica: solo ingles. El rendimiento en castellano no esta soportado ni evaluado.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones adicionales, pero no exime del cumplimiento de la normativa aplicable sobre contenido generado.
- Sin soporte documentado de tool calling ni de agentes: no disene flujos que dependan de llamadas a funciones.
- Los pesos publicados no incluyen ningun ajuste posterior a la abliteration; la ficha del modelo padre sigue siendo la referencia obligada antes de usar estos ficheros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ElementMerc/tinyllama-1.1b-abliterated-GGUF
- Modelo padre (safetensors): https://huggingface.co/ElementMerc/tinyllama-1.1b-abliterated
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la informacion disponible.
