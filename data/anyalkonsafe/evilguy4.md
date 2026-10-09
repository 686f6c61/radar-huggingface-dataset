# anyalkonsafe/evilguy4

## Resumen

evilguy4 es un ajuste fino (fine-tune) conversacional publicado por el usuario anyalkonsafe en HuggingFace, derivado del modelo base `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`. Se distribuye principalmente como cuantizacion GGUF en formato Q4_K_M, generada con el flujo de trabajo de Unsloth, y esta pensado para su uso en `llama.cpp` mediante `llama-server`. Segun su model card, el objetivo del ajuste es mejorar el rendimiento en matematicas, tolerar mejor jerga, sustituciones y erratas (incluido texto casi ininteligible) y reducir alucinaciones concretas detectadas en versiones anteriores de la misma familia "evilguy".

El repositorio declara 7.518.069.290 parametros totales segun los metadatos de safetensors, lo que lo situa en la franja de los modelos de ~7.5B, aunque la nomenclatura del modelo base ("E4B") sugiere que se trata de una variante con parametros efectivos de ~4B. Esta discrepancia entre "E4B" y el recuento real de 7,5B no se aclara en la informacion disponible y conviene tratarla con cautela.

La relevancia del modelo es limitada y muy nicho: el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, no incluye informacion sobre idiomas soportados ni resultados de benchmarks, y depende de la licencia Gemma. Es, por tanto, un experimento comunitario de ajuste sobre un modelo pequeno, interesante como ejemplo de pipeline Unsloth + GGUF + tool calling, pero sin validacion publica de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (etiqueta `q4_k_m`); no se documentan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | GGUF (`evilguy4-q4-k-m.gguf`); el modelo base se distribuye en formato BnB 4-bit para entrenamiento |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Los metadatos indican que el punto de partida es `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, un checkpoint de la familia Gemma preparado por Unsloth en cuantizacion BitsAndBytes de 4 bits, y que el ajuste se realizo mediante LoRA (la etiqueta `lora` aparece en los tags del repositorio). El modelo resultante se exporto a GGUF en cuantizacion Q4_K_M.

La model card solo describe cambios funcionales, sin cifras: mejor comportamiento en matematicas, mayor robustez ante jerga, sustituciones y erratas (incluye ejemplos como "hllo", "ello" o texto directamente ininteligible) y correccion de varias alucinaciones "extranas". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias: el unico detalle operativo relevante es la recomendacion de usar `llama-server` con la bandera `--jinja` para activar la plantilla de chat embebida y el soporte de tool calling.

## Capacidades

- Generacion de texto conversacional en formato de chat, con plantilla embebida compatible con `llama.cpp` mediante `--jinja`.
- Razonamiento matematico: la model card afirma mejoras explicitas en tareas de matematicas, aunque sin datos cuantitativos.
- Tolerancia a ruido en la entrada: entrenado para manejar jerga, sustituciones de caracteres, erratas y texto parcialmente ininteligible.
- Reduccion de alucinaciones concretas respecto a versiones previas de la familia "evilguy", segun el autor.
- Tool calling / function calling: soportado a traves de la plantilla de chat embebida al arrancar el servidor con `--jinja`.
- Integracion con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Capacidades multilingues, de vision, audio o modo "thinking": no disponibles en la informacion proporcionada.
- Uso como agente multi-paso: no documentado explicitamente, aunque el soporte de tool calling es un prerequisito.

## Casos de uso

- Chat conversacional local en equipos de gama media: al ser un GGUF Q4_K_M de ~4.5-5 GB, puede ejecutarse integramente en una GPU de consumo o incluso en CPU, lo que lo hace adecuado para asistentes personales sin conexion.
- Preprocesado de texto ruidoso: su entrenamiento especifico con erratas y jerga lo hace util para normalizar entradas de usuarios en foros, chats o formularios donde la calidad ortografica es baja.
- Prototipado de agentes con herramientas: gracias al soporte de tool calling via `--jinja` en `llama-server`, puede usarse para validar rapidamente flujos de llamada a funciones antes de migrar a un modelo mayor.
- Asistencia matematica basica en entornos educativos: ejercicios de aritmetica y algebra elemental, siempre con supervision humana dado que no hay benchmarks publicados.
- Generacion de respuestas en aplicaciones de bajo coste: al caber en una unica GPU de consumo, es viable desplegarlo en instancias economicas para tareas de generacion de texto no criticas.
- Experimentacion e investigacion sobre fine-tuning: sirve como caso de estudio reproducible del pipeline Unsloth (LoRA + exportacion a GGUF) para quien quiera replicar el proceso con su propio dataset.
- Base para posteriores ajustes: al ser un derivado LoRA sobre un modelo Gemma pequeno, puede reutilizarse como punto de partida en investigacion sobre alineacion y robustez ante entradas degradadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma mejoras cualitativas en matematicas, tolerancia a erratas y reduccion de alucinaciones, sin acompanarlas de cifras de MMLU, GSM8K, HumanEval ni de ninguna otra evaluacion estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 4.5-5 GB para los pesos en Q4_K_M, a los que hay que sumar la cache KV (variable segun la longitud de contexto, aproximadamente 1-2 GB adicionales en contextos moderados). En Q8_0 el modelo completo requeriria del orden de 8 GB, y en FP16 alrededor de 15 GB. Estas cifras son estimaciones basadas en el recuento de parametros declarado, no en mediciones publicadas.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM, como una RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. En el segmento profesional, una A100 o H100 lo ejecutarian sin dificultad, pero resultan desproporcionadas para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas de VRAM en Q4_K_M. En GPUs con 6 GB puede ser necesario reducir el contexto o descargar parte de las capas a CPU.
- Opciones de despliegue: `llama.cpp` (con `llama-server -m evilguy4-q4-k-m.gguf --jinja` segun la propia model card), y por extension cualquier runtime compatible con GGUF (Ollama, LM Studio, text-generation-webui). vLLM y TGI no se mencionan en la informacion disponible; su uso requeriria pesos en safetensors, que no se documentan para este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparativa se limita a modelos de tamano y categoria equivalentes; los datos de contexto y licencia corresponden a la documentacion publica de cada familia y el modelo base exacto de evilguy4 no esta confirmado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| evilguy4 | 7,52B declarados | no disponible | gemma | GGUF Q4_K_M en HuggingFace |
| Gemma 3 4B (familia Gemma) | ~4B | 128K (segun documentacion de la familia) | gemma | Pesos oficiales y multiples cuantizaciones |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Pesos oficiales, GGUF, vLLM, etc. |
| Qwen2.5 7B Instruct | ~7,6B | 32K nativo (ampliable) | Apache 2.0 | Pesos oficiales, GGUF y amplio soporte de runtimes |

No se dispone de datos de rendimiento de evilguy4 que permitan una comparacion cuantitativa con estas alternativas. A diferencia de ellas, evilguy4 no tiene benchmarks publicados, soporte oficial ni validacion por parte de terceros.

## Limitaciones y advertencias

- Ausencia total de validacion: 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks ni evaluaciones independientes.
- Sesgos conocidos: no disponibles. Al ser un fine-tune comunitario sin documentacion de dataset, no se puede auditar la composicion de los datos de entrenamiento ni sus posibles sesgos.
- Riesgo de alucinacion: la propia model card reconoce que versiones anteriores presentaban alucinaciones "extranas" y afirma haberlas corregido, pero sin evidencia cuantitativa. Debe asumirse riesgo de alucinacion no medido.
- Limitaciones de contexto e idioma: no se especifica la ventana de contexto ni la lista de idiomas soportados. No se debe asumir soporte multilingue.
- Restricciones de licencia: el modelo se distribuye bajo licencia Gemma, que impone condiciones de uso comercial, obligaciones de atribucion y una politica de uso prohibido. Es imprescindible revisar los terminos antes de cualquier despliegue en produccion.
- Ambiguedad sobre el modelo base: la referencia a "Gemma4 E4B" y la discrepancia con los 7,52B de parametros declarados no se explican; conviene verificar la procedencia de los pesos antes de usarlos.
- Formato unico: solo se documenta una cuantizacion Q4_K_M en GGUF, lo que limita el ajuste fino de la relacion calidad/recursos y complica el despliegue en runtimes que requieren safetensors (vLLM, TGI).
- Uso en produccion: no recomendado sin evaluacion propia previa, dado el origen no verificado, la ausencia de benchmarks y el bajo nivel de mantenimiento del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anyalkonsafe/evilguy4
- Repositorio relacionado de la misma familia: https://huggingface.co/anyalkonsafe/evilguy-gguf/tree/main
- README de la familia evilguy-gguf: https://huggingface.co/anyalkonsafe/evilguy-gguf/blob/main/README.md
- Ficha de registro en directorio de terceros: https://free2aitools.com/model/anyalkonsafe/evilguy-gguf
- Modelo base declarado: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Lista de modelos sin censura de la comunidad (referencia de contexto): https://github.com/samssouza/uncensored-ai-list
