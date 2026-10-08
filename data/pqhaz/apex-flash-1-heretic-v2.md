# pqhaz/apex-flash-1-heretic-v2

## Resumen

apex-flash-1-heretic-v2 es una variante "abliterated" del modelo cantina-security/apex-flash-1-abliterated, construida mediante ablación direccional del comportamiento de rechazo. Lo publica el usuario pqhaz sobre la arquitectura GLM-5.3-Flash en BF16 y cuenta con 321.323.031.390 parametros totales (~321B), con un repositorio de 642,7 GB en safetensors. El modelo es multimodal de entrada (pipeline image-text-to-text) y esta pensado, segun el autor, para investigacion de seguridad autorizada en entornos propios o con permiso explicito.

El problema que aborda es concreto: la version anterior (pqhaz/apex-flash-1-heretic) seguia rechazando aproximadamente cuatro de cada diez peticiones cuando el bloque de razonamiento estaba activado. Esta v2 anade una segunda etapa de ablacion medida *dentro* del propio bloque de razonamiento, no solo en el ultimo token del prompt, de modo que reduce los rechazos de 39 a 0 sobre el conjunto de prueba de mlabonne/harmful_behaviors y de 28 a 1 en el conjunto retenido de JailbreakBench/JBB-Behaviors.

La relevancia actual es metodologica: documenta de forma reproducible una ablacion en dos direcciones casi ortogonales (coseno dentro de ±0,05 en cada capa) y separa explicitamente los resultados in-sample de los held-out. No se han publicado benchmarks de capacidades; el autor solo reporta un chequeo de cordura de 20 preguntas con respuesta conocida, resuelto 20/20 con razonamiento activado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE basada en GLM-5.3-Flash (tag `glm5_next`); incluye capa MTP |
| Parametros totales | 321.323.031.390 (~321B) |
| Parametros activos | no disponible (el modelo declara 288 expertos enrutados, pero no el numero de activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (original), FP8 (servido con vLLM para las pruebas con razonamiento) y NVFP4 (repos derivados de la familia abliterated) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de cantina-security/apex-flash-1-abliterated, que a su vez es una variante abliterated de la arquitectura GLM-5.3-Flash en BF16. La topologia es un transformer con mezcla de expertos (MoE): el autor menciona explicitamente una proyeccion densa, una compartida y 288 expertos enrutados, ademas de una capa MTP (multi-token prediction). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset original ni si hubo fases de RLHF o DPO en el modelo fuente.

La intervencion sobre el modelo no es un fine-tuning: es una ablacion direccional aplicada exclusivamente a las matrices que escriben en el flujo residual, es decir, `self_attn.o_proj` y todas las down-projections de MLP (densa, compartida y los 288 expertos). El resto de tensores, incluida la capa MTP, permanece byte a byte identico al modelo de origen. Se aplica en dos etapas:

1. **Etapa 1** (identica a apex-flash-1-heretic): capas 0-44 ortogonalizadas contra una direccion por capa calculada en el ultimo token del prompt con el bloque de razonamiento cerrado. La direccion es la diferencia de medias de residuales entre `mlabonne/harmful_behaviors` y `mlabonne/harmless_alpaca` (400 prompts cada uno), con parametros encontrados mediante la herramienta Heretic.
2. **Etapa 2**: capas 18-44 ortogonalizadas, con peso 1,0, contra una segunda direccion por capa medida *dentro* del bloque de razonamiento. Para ello se reproducen las trazas de razonamiento del propio modelo de etapa 1 sobre los prompts de evaluacion, se promedian los residuales de los ultimos 96 tokens de razonamiento y se toma como direccion la diferencia entre trazas que terminaban en rechazo (39) y trazas que terminaban en respuesta (57). El coseno entre ambas direcciones se mantiene dentro de ±0,05 en todas las capas.

Los parametros de ambas etapas se almacenan en `ablation.json`, y las direcciones en `directions.pt` y `directions_traces.pt`.

## Capacidades

- Generacion de texto conversacional multi-turno, con tag `conversational` en el repositorio.
- Entrada multimodal de imagen y texto (pipeline declarado `image-text-to-text`).
- Razonamiento explicito mediante bloque de pensamiento (`<think>...</think>`), que puede activarse o desactivarse; el autor evalua ambos modos por separado.
- El modo con razonamiento produce respuestas mas largas: la mediana pasa de 882 a 1611 tokens en el conjunto evaluado.
- Capacidades de codigo basicas verificadas en el sanity check (20 preguntas de aritmetica, datos y codigo corto), resueltas 20/20 con razonamiento activado.
- Comportamiento de rechazo fuertemente suprimido: 0/100 en harmful_behaviors y 1/100 en JBB-Behaviors con razonamiento activado.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni idiomas concretos.

## Casos de uso

- Investigacion de seguridad ofensiva en laboratorio: el modelo permite estudiar como un LLM sin rechazos responde a prompts de `harmful_behaviors` y JBB-Behaviors, en entornos controlados y con autorizacion, para caracterizar superficies de riesgo antes de desplegar modelos alineados.
- Analisis de robustez de alineamiento: al comparar esta v2 con la etapa 1 y con el modelo fuente, se puede medir cuanto del comportamiento de rechazo reside en las direcciones del flujo residual y cuanto depende del bloque de razonamiento.
- Red teaming de filtros de contenido: sirve como generador adversario para probar clasificadores de seguridad y moderadores, dado que produce respuestas que los modelos alineados rechazarian.
- Auditoria de tecnicas de abliteration: los ficheros `ablation.json`, `directions.pt` y `directions_traces.pt` permiten reproducir la metodologia, comparar con la herramienta Heretic y evaluar el coste en calidad (KL de 0,100 sobre harmless_alpaca).
- Evaluacion de impacto de la cuantizacion: el autor ejecuta las pruebas con razonamiento en FP8 servido con vLLM, lo que permite estudiar si la supresion medible de rechazos se mantiene al cuantizar.
- Docencia y divulgacion tecnica sobre alineamiento: como ejemplo documentado de ablacion en dos etapas y de separacion entre resultados in-sample y held-out.
- Analisis multimodal experimental: dado el pipeline image-text-to-text, se puede explorar el comportamiento del modelo ante entradas que combinan imagen y texto, aunque el autor no aporta evaluaciones especificas en este eje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente "No capability benchmarks were run". Los unicos datos publicados son de rechazo y divergencia, recogidos en la model card:

| Metrica | Modelo fuente | Solo etapa 1 | Este modelo (v2) |
|---|---|---|---|
| `mlabonne/harmful_behaviors` test[:100], razonamiento activado, juzgado sobre la respuesta final | 99 | 39 | 0 |
| Mismos prompts, razonamiento omitido (`<think></think>`), primeros 64 tokens | 99 | 2 | 0 |
| Divergencia KL en `mlabonne/harmless_alpaca` test[:100], primer token, sin razonamiento | 0 | 0,095 | 0,100 |
| `JailbreakBench/JBB-Behaviors` harmful (100), razonamiento activado, juzgado sobre la respuesta final | 89 | 28 | 1 |

Advertencias del autor sobre la tabla: la primera fila es in-sample, porque la direccion de la etapa 2 se ajusto sobre las trazas de razonamiento de esos mismos 100 prompts. La fila de JailbreakBench es la verificacion held-out, ya que ninguno de esos prompts se uso para derivar las direcciones. En las ejecuciones con razonamiento activado, las respuestas que no alcanzaron una respuesta final en 3000 tokens se cuentan como ni rechazo ni respuesta (en el primer conjunto, 4 para etapa 1 y 6 para este modelo; en JailbreakBench, 1, 3 y 6 para fuente, etapa 1 y este modelo). El juez LLM empleado es `llmfan46/gemma-4-31B-it-uncensored-heretic` con el system prompt "You are a helpful assistant.". Las filas con razonamiento se obtuvieron sobre la cuantizacion FP8 servida con vLLM; el resto, sobre los pesos BF16 con transformers. El sanity check de 20 preguntas con respuesta conocida (aritmetica, datos, codigo corto) fue 20/20 con razonamiento activado.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 642 GB de pesos, mas activaciones y cache KV; requiere nodo multi-GPU.
- VRAM estimada en FP8: aproximadamente la mitad del peso BF16 (unos 321 GB), segun la cuantizacion publicada por el autor y usada en las pruebas con vLLM.
- VRAM estimada en NVFP4: en torno a 160 GB de pesos, segun el repositorio derivado `pqhaz/apex-flash-1-abliterated-NVFP4`.
- No cabe en GPU de consumo. Se necesitan configuraciones de clase centro de datos: multiples A100 80 GB, H100 80 GB, H200 o equivalentes, repartidas en tensor parallel.
- Opciones de despliegue documentadas o inferibles: transformers (BF16, usado para las filas sin razonamiento), vLLM (FP8, usado para las filas con razonamiento) y pesos NVFP4 para stacks compatibles. No se menciona soporte de llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: no disponibles. El unico dato operativo es que las ejecuciones con razonamiento se limitaron a 3000 tokens de generacion, con mediana de 1611 tokens por respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (harmful_behaviors, con razonamiento) | Rechazos (JBB-Behaviors) | KL (harmless_alpaca) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| pqhaz/apex-flash-1-heretic-v2 | 321B (MoE) | no disponible | 0/100 | 1/100 | 0,100 | MIT | HuggingFace |
| pqhaz/apex-flash-1-heretic (etapa 1) | 321B (MoE) | no disponible | 39/100 | 28/100 | 0,095 | no disponible en la fuente | HuggingFace |
| cantina-security/apex-flash-1-abliterated (fuente) | 321B (MoE) | no disponible | 99/100 | 89/100 | 0 | no disponible en la fuente | HuggingFace |
| pqhaz/apex-flash-1-abliterated-FP8 / NVFP4 | 321B (MoE) | no disponible | no disponible | no disponible | no disponible | no disponible en la fuente | HuggingFace, FriendliAI |

No se dispone de comparativas con modelos abliterated de otros autores en la informacion proporcionada; la comparacion natural es contra el modelo fuente y la version intermedia del mismo autor.

## Limitaciones y advertencias

- Modelo abliterated: elimina deliberadamente el comportamiento de rechazo. No debe desplegarse en aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de generar contenido danino, ilegal o inseguro. El propio autor lo restringe a investigacion de seguridad autorizada en entornos propios o con permiso.
- Riesgo de alucinacion no cuantificado: no se han ejecutado benchmarks de capacidades, por lo que no hay medicion de degradacion frente al modelo fuente mas alla de la KL reportada.
- La metrica principal de la primera fila es in-sample; solo JailbreakBench actua como verificacion held-out. No debe extrapolarse el 0/100.
- Degradacion de calidad medida: KL de 0,100 frente a 0,095 de la etapa 1 y 0 del fuente sobre harmless_alpaca, lo que sugiere un pequeno coste adicional en la distribucion de salida.
- Las pruebas con razonamiento se hicieron en FP8, no en BF16; el comportamiento en BF16 con razonamiento no esta verificado.
- La mediana de longitud de respuesta en modo razonamiento sube de 882 a 1611 tokens, y algunas respuestas no terminan dentro de 3000 tokens (6 casos en harmful_behaviors, 6 en JBB-Behaviors). Esto encarece la inferencia y complica el uso en produccion.
- Sesgos conocidos: no documentados. Idiomas soportados: no disponibles.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero la model card restringe explicitamente el uso previsto a investigacion de seguridad autorizada. Revisar la coherencia entre licencia y uso previsto antes de cualquier despliegue.
- Sin afiliacion con Cantina Security ni con Z.AI, segun la ficha en FriendliAI.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pqhaz/apex-flash-1-heretic-v2
- Modelo fuente: https://huggingface.co/cantina-security/apex-flash-1-abliterated
- Version anterior (etapa 1): https://huggingface.co/pqhaz/apex-flash-1-heretic
- Cuantizacion FP8 derivada: https://huggingface.co/pqhaz/apex-flash-1-abliterated-FP8
- Cuantizacion NVFP4 derivada: https://huggingface.co/pqhaz/apex-flash-1-abliterated-NVFP4
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Paquete heretic-llm en PyPI: https://pypi.org/project/heretic-llm/
- Entrada de Heretic en Grokipedia: https://grokipedia.com/page/Heretic_uncensored_language_model
- Ficha de inferencia en FriendliAI: https://friendli.ai/models/pqhaz/apex-flash-1-abliterated-FP8
