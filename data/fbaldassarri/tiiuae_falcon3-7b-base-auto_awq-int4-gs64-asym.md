# fbaldassarri/tiiuae_Falcon3-7B-Base-auto_awq-int4-gs64-asym

## Resumen

Este repositorio es un artefacto de cuantizacion, no un modelo entrenado desde cero: contiene una version de 4 bits (INT4) del modelo base tiiuae/Falcon3-7B-Base, generada por el usuario fbaldassarri. La cuantizacion se ha realizado con Intel AutoRound v0.15.1 aplicando el algoritmo AWQ (activation-aware weight quantization) en modo weight-only quantization (WoQ), con 4 bits, tamano de grupo 64 y esquema asimetrico. El objetivo es reducir el uso de memoria y acelerar la inferencia manteniendo la mayor parte de la calidad del modelo original.

El artefacto esta pensado explicitamente para inferencia en hardware Intel: CPU Intel mediante intel-extension-for-pytorch, iGPU Intel Arc y NPU Intel (AI Boost de la serie Core Ultra) a traves de OpenVINO. El autor declara una aceleracion de 2-3x respecto al modelo en bfloat16, con una ligera caida de precision en la configuracion W4G64. Los pesos se distribuyen en formato safetensors para transformers y requieren la libreria autoawq para cargarse correctamente.

Es relevante ahora porque permite ejecutar un modelo de la familia Falcon 3 en equipos sin GPU dedicada, y porque documenta de forma reproducible todo el proceso de cuantizacion (version de auto-round, muestras de calibracion, iteraciones y duracion), lo que facilita auditar o replicar el resultado. Conviene senalar una discrepancia importante: el nombre del repositorio indica "7B" y el modelo base declarado es Falcon3-7B-Base, pero los metadatos de safetensors del repositorio cuantizado reportan 1.753.635.840 parametros, un orden de magnitud inferior al esperado para un modelo de 7B. Ese dato debe verificarse antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal LM (etiquetas del repo: causal-lm; `model_type` declarado: llama) sobre el modelo base Falcon3-7B-Base |
| Parametros totales | 1.753.635.840 segun metadatos de safetensors del repositorio (discrepancia con el "7B" del nombre y con el modelo base declarado; ver limitaciones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base tiiuae/Falcon3-7B-Base) |
| Tipos de cuantizacion | INT4 (4 bits), weight-only quantization (WoQ), AWQ / AutoAWQ, group size 64, asimetrica (`sym: false`); calibracion en torch.bfloat16 |
| Idiomas soportados | en (segun la model card; el modelo base puede cubrir mas idiomas, no confirmado en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 6,8 GB), libreria transformers, requiere autoawq |
| Framework de cuantizacion | Intel AutoRound v0.15.1 |
| Metodo declarado en config | auto_awq, bits 4, group_size 64, sym false |
| Version de transformers en la ejecucion | 4.55.3 |
| Version de torch en la ejecucion | 2.14.0+cpu |
| Muestras de calibracion | 128 |
| Iteraciones de ajuste | 200 |
| Longitud de secuencia de calibracion | 512 |
| Batch de calibracion | 4 |
| Duracion de la cuantizacion | 49.143,2 s (819,1 min, aprox. 13,65 h) |
| Fecha de finalizacion (UTC) | 2026-09-15T18:50:23 |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura ni entrenamiento en la model card del repositorio cuantizado: esta es exclusivamente una ficha de cuantizacion. El unico dato de arquitectura presente es el `model_type: llama` de la configuracion y la etiqueta `causal-lm`, ademas del `base_model: tiiuae/Falcon3-7B-Base` declarado. Cualquier detalle sobre atencion (GQA, RoPE, ventana de contexto), numero de capas, dimension de embeddings, vocabulario o composicion del dataset de preentrenamiento debe consultarse en la model card del modelo base, y no esta disponible aqui. Tampoco se documenta si el modelo base paso por RLHF, DPO u otro ajuste posterior; por el sufijo "Base" del nombre se trata de un modelo preentrenado sin ajuste de instrucciones.

La innovacion tecnica de este repositorio es el procedimiento de cuantizacion, no el modelo. Se aplica weight-only quantization con el algoritmo AWQ en su implementacion AutoAWQ, orquestada por Intel AutoRound. AWQ escala los pesos por canal segun la importancia de las activaciones, de modo que los canales mas relevantes conservan mas precision en 4 bits. La configuracion concreta es INT4 con grupo de 64 pesos y cuantizacion asimetrica (escala y punto cero independientes por grupo), lo que suele dar mejor fidelidad que un esquema simetrico en modelos con distribuciones de peso sesgadas. El ajuste se hizo sobre CPU, con 128 muestras de calibracion de 512 tokens y 200 iteraciones, partiendo del modelo en bfloat16. El autor publica ademas una receta completa de replicacion (herramienta `auto-round-pipeline`, version fijada v0.15.1 y llamada directa a `AutoRound.quantize_and_save`), lo que permite reproducir el artefacto byte a byte si se compila auto-round desde el tag correspondiente.

## Capacidades

- Generacion de texto y continuacion de prompt: es un modelo base, no ajustado a instrucciones, por lo que se usa con texto en crudo y no con plantillas de chat.
- Modelado de lenguaje general en ingles: al ser un modelo tipo base, sus capacidades principales son completado, resumen extractivo y generacion libre.
- Causal LM estandar: compatible con `AutoModelForCausalLM` de transformers.
- Inferencia en peso de 4 bits: ejecutable con autoawq en CPU Intel, iGPU Intel Arc y NPU Intel (Core Ultra / AI Boost) via OpenVINO, e inferencia Intel via intel-extension-for-pytorch.
- Compatibilidad declarada con text-generation-inference (etiqueta del repositorio).
- Tool calling / function calling: no disponible en la informacion proporcionada. Al ser un modelo base sin ajuste de instrucciones ni chat template, no se puede asumir soporte.
- Agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (`en`).
- Vision, audio, thinking mode o modo razonamiento explicito: no disponibles; no hay ninguna indicacion al respecto.

## Casos de uso

- Asistente de completado de texto en local sobre CPU Intel: el modelo puede cargarse con transformers y autoawq y ejecutarse sin GPU dedicada, con un peso aproximado de 1 GB si se confirma el conteo de parametros reportado, lo que lo hace viable en portatiles convencionales.
- Inferencia en portatiles con Core Ultra usando la NPU: la model card indica explicitamente soporte para Intel NPU (AI Boost) mediante OpenVINO, lo que permite dejar la CPU libre y reducir el consumo energetico en aplicaciones de escritorio desconectadas de la red.
- Procesamiento por lotes en servidores sin GPU: con intel-extension-for-pytorch se puede desplegar en flotas x86 existentes para tareas de generacion masiva de texto, etiquetado o aumento de datos, sin necesidad de adquirir aceleradores.
- Generacion de datos sinteticos para entrenamiento: al ser un modelo base, puede usarse para producir continuaciones de texto a gran escala a bajo coste computacional, siempre que la calidad resultante se valide porque la cuantizacion a 4 bits introduce una caida de precision.
- Destilacion o ajuste ligero (LoRA) sobre un backbone ya cuantizado: util como punto de partida para experimentos con recursos limitados, aunque el ajuste fino directo sobre pesos INT4 esta restringido a las herramientas compatibles con AWQ.
- Evaluacion comparativa de cuantizaciones: el repositorio documenta versiones, hiperparametros y tiempos exactos, por lo que sirve como referencia para medir el impacto de W4G64 asimetrico frente a bfloat16 en tareas de lenguaje.
- Investigacion sobre eficiencia en hardware Intel: escenario adecuado para medir latencia y consumo en CPU, iGPU Arc y NPU con OpenVINO, ya que el autor proporciona la receta de cuantizacion completa.
- Demo educativa de cuantizacion WoQ: el repositorio incluye el codigo exacto de auto-round, lo que lo convierte en un ejemplo didactico de un pipeline de cuantizacion reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de generacion (perplejidad, win rate), y tampoco hay comparaciones medidas contra el modelo en bfloat16. El unico dato de rendimiento declarado por el autor es cualitativo: una aceleracion de "2-3X" respecto al modelo sin cuantizar, con una "ligera caida de precision" en W4G64. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre Falcon3.

## Requisitos de hardware

- VRAM estimada (calculada a partir del conteo de parametros, no medida): con cuantizacion INT4 de grupo 64 y escalas/puntos cero en fp16, el coste aproximado es de 0,56 bytes por parametro. Para 1.753.635.840 parametros supone unos 1,0 GB de pesos y del orden de 1,5-2 GB en total contando cache KV y activaciones. Si finalmente se confirma que el modelo tiene ~7,5 B de parametros, los pesos ocuparian unos 4,2 GB y el total en VRAM rondaria los 5-6 GB.
- GPU consumer: cabe con holgura en cualquier GPU de 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070, RTX 4080, RTX 4090) si el conteo de parametros es el reportado; si el modelo es de 7,5 B, sigue cabiendo en GPU de 8-12 GB (RTX 3060 12 GB, RTX 4070 12 GB).
- GPU de datacenter: A100, H100, L40S y similares no son necesarias para un artefacto de este tamano; se usarian solo para servir muchas peticiones concurrentes.
- CPU Intel: soporte declarado via intel-extension-for-pytorch, con el calibrado realizado en CPU (`torch 2.14.0+cpu`).
- iGPU y NPU Intel: iGPU Intel Arc y NPU Intel AI Boost (serie Core Ultra) soportadas mediante OpenVINO, segun la model card.
- Opciones de despliegue: transformers con autoawq, text-generation-inference (etiqueta del repo), intel-extension-for-pytorch y OpenVINO. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; el formato auto_awq no es GGUF, por lo que no es cargable directamente en llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El autor solo declara una aceleracion de 2-3x frente a bfloat16, sin cifras de tokens por segundo ni de latencia por peticion.
- Espacio en disco: el repositorio ocupa 6,8 GB, muy por encima de los ~1 GB que sugeriria el conteo de parametros reportado, lo que refuerza la necesidad de verificar el contenido real del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-7B-Base-auto_awq-int4-gs64-asym | 1.753.635.840 segun safetensors (nombre del repo indica 7B) | No disponible | INT4 AWQ, grupo 64, asimetrica | Sin benchmarks publicados; autor declara 2-3x de aceleracion | Apache 2.0 | HuggingFace, 0 descargas |
| tiiuae/Falcon3-7B-Base (modelo original) | No disponible en la informacion proporcionada | No disponible | Sin cuantizar (bfloat16/fp16) | No disponible | Apache 2.0 (heredada por el derivado) | HuggingFace |
| Otras cuantizaciones de Falcon3-7B (GGUF, GPTQ, etc.) | No disponible | No disponible | Distintas | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria (por ejemplo, otras cuantizaciones INT4 de Falcon3, Llama 3.1 8B o Mistral 7B) en terminos de rendimiento medido, ya que la informacion proporcionada no incluye benchmarks ni especificaciones del modelo base.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre del repositorio y el campo `base_model` apuntan a Falcon3-7B-Base, pero los metadatos de safetensors reportan 1.753.635.840 parametros y el repositorio ocupa 6,8 GB. Hay que verificar el contenido real antes de integrarlo en cualquier sistema.
- Es un modelo base, no un modelo de instrucciones: no responde a ordenes ni sigue un formato de chat; solo continua texto. No debe usarse directamente como asistente conversacional.
- La cuantizacion a 4 bits con grupo 64 introduce perdida de precision, reconocida por el propio autor ("slight accuracy drop"). No se han publicado mediciones de esa caida.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje generativo; en un modelo base cuantizado, la probabilidad de generar texto facticamente incorrecto con apariencia de verosimilitud es alta y no hay filtros ni ajuste de alineamiento.
- Sesgos: no hay informacion sobre evaluaciones de sesgo, toxicidad o seguridad en la model card. El modelo base puede reproducir sesgos presentes en sus datos de preentrenamiento.
- Idioma: solo se declara soporte de ingles. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Contexto: no se especifica la longitud de contexto en la informacion disponible, por lo que no se puede garantizar el comportamiento en secuencias largas.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, pero obliga a conservar el aviso de licencia y a indicar los cambios realizados. La model card incluye ademas un descargo que indica que el modelo se ha desarrollado "solo con fines de investigacion", lo que puede entrar en tension con el uso comercial en entornos con requisitos de compliance estrictos.
- Soporte de herramientas limitado: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni GGUF, lo que restringe las opciones de despliegue a transformers/autoawq, TGI (etiqueta) e Intel IPEX/OpenVINO.
- Artefacto sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento posterior documentado. No es un artefacto con soporte de la comunidad ni del equipo de TII.
- Reproducibilidad condicionada: la receta de replicacion apunta a un repositorio Git de terceros (`git.epicdynamic.com/auto-round-pipeline`), cuya disponibilidad y continuidad no estan garantizadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Base-auto_awq-int4-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Base
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Auto-round-pipeline (receta de replicacion del autor): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo, sobre Falcon3 ni sobre la cuantizacion AWQ/Intel AutoRound. Los resultados devueltos por el buscador corresponden a contenido no relacionado con el ambito tecnico y se han descartado.
