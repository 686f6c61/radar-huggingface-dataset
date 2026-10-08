# Sham76/gptoss-20b-luau-lora

## Resumen

Sham76/gptoss-20b-luau-lora es un adaptador LoRA publicado en HuggingFace por el usuario Sham76, entrenado sobre el modelo base unsloth/gpt-oss-20b-unsloth-bnb-4bit, es decir, la version de gpt-oss-20b de OpenAI cuantizada en 4 bits y preparada por Unsloth. El repositorio contiene unicamente los pesos del adaptador (0,4 GB en safetensors, con libreria transformers), no un modelo fusionado listo para servir de forma autonoma.

gpt-oss-20b es uno de los dos modelos de razonamiento con pesos abiertos que OpenAI publico bajo licencia Apache 2.0, con arquitectura transformer decoder-only de tipo mezcla de expertos (MoE) y una ventana de contexto de 128 000 tokens. El adaptador hereda por tanto esas capacidades generales de razonamiento, generacion de codigo y soporte de tool calling, y solo modifica una fraccion pequena de los pesos.

La relevancia de esta ficha es acotada y conviene ser explicito: el autor no documenta el dataset, el numero de pasos, los hiperparametros ni evaluacion alguna, y el repositorio cuenta con 0 descargas y 0 likes en el momento de la consulta. El nombre "luau" apunta a un ajuste orientado a Luau, el lenguaje de scripting de Roblox, pero se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) en el modelo base; este repositorio es un adaptador LoRA sobre dicho base |
| Parametros totales | 21 000 millones en el modelo base gpt-oss-20b; el adaptador LoRA anade un numero de parametros no disponible (repo de 0,4 GB) |
| Parametros activos | 3 600 millones aproximadamente en el modelo base (MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | El base indicado esta cuantizado en 4 bits (bitsandbytes); no se documentan GGUF, AWQ ni GPTQ para este adaptador |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, ~0,4 GB); no incluye pesos fusionados |

## Arquitectura y entrenamiento

El modelo base gpt-oss-20b es un transformer decoder-only con capa de mezcla de expertos: 21 000 millones de parametros totales de los que solo unos 3 600 millones se activan por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano. El adaptador de este repositorio se entreno con Unsloth y TRL (etiquetas `unsloth` y `trl` en el repositorio), segun indica el propio autor en la model card, que menciona un entrenamiento "2x faster with Unsloth". El base declarado es la version de Unsloth en 4 bits (`unsloth/gpt-oss-20b-unsloth-bnb-4bit`), lo que implica que el ajuste se hizo sobre pesos cuantizados.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF o DPO, ni sobre la tecnica de ajuste mas alla del uso de LoRA. Tampoco se documenta el rango del adaptador, el target de modulos ni la estrategia de entrenamiento. El nombre del repositorio sugiere un ajuste centrado en Luau, pero no existe confirmacion en la informacion proporcionada. Cualquier innovacion tecnica adicional respecto al base (por ejemplo, decodificacion especulativa o modos de razonamiento) no esta documentada por el autor para este adaptador concreto.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas de gpt-oss-20b, un modelo de razonamiento de pesos abiertos de OpenAI.
- Generacion de codigo: presumiblemente especializada en Luau segun el nombre del repositorio, aunque no hay datos que lo confirmen ni ejemplos publicados.
- Tool calling y function calling: heredado del modelo base, no verificado especificamente tras el ajuste.
- Razonamiento multi-paso y uso en agentes: heredado del base, sin evaluacion publicada para este adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card (`language: en`).
- Capacidad especial: no se documenta ninguna adicional (ni vision, ni audio, ni modo de pensamiento propio del adaptador).
- Formato de salida: no disponible.

## Casos de uso

Los casos siguientes se derivan del nombre del repositorio (luau) y de las capacidades heredadas de gpt-oss-20b, no de documentacion aportada por el autor. Deben tratarse como hipotesis de uso a validar.

- Generacion de scripts en Luau para Roblox Studio: el adaptador podria asistir en la escritura de modulos y controladores de gameplay, aprovechando el contexto de 128 000 tokens del base para mantener presentes varias decenas de ficheros del proyecto.
- Migracion de Lua 5.1 a Luau: traduccion de codigo heredado, incorporando tipado opcional y las extensiones de sintaxis de Luau, con revision manual obligatoria por el riesgo de alucinacion en APIs especificas.
- Revision de codigo en pipelines de CI: integracion como paso de analisis estatico asistido por modelo sobre repositorios de scripts, marcando patrones problematicos antes de la fusion de ramas.
- Generacion de tests automatizados con TestEZ: produccion de baterias de pruebas para modulos Luau existentes, reduciendo el trabajo manual de cobertura.
- Documentacion tecnica de modulos: generacion de docstrings y documentacion de API a partir del codigo fuente de un proyecto de Roblox.
- Asistente conversacional para desarrolladores de Roblox: chat multi-turno con contexto largo para resolver dudas de API y depuracion, apoyado en el soporte de tool calling del base.
- Investigacion sobre adaptadores LoRA: servir como punto de partida o referencia para estudiar ajustes de bajo rango sobre gpt-oss-20b, dado que el adaptador ocupa solo 0,4 GB.
- Clasificacion o etiquetado de codigo Luau: por ejemplo, deteccion de uso de APIs obsoletas o de patrones no seguros en scripts de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no aporta metricas de MMLU, HumanEval, GSM8K ni de ninguna evaluacion especifica de Luau, y el repositorio no incluye comparacion con el modelo base ni con otros adaptadores.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 0,4 GB, pero requiere cargar el modelo base gpt-oss-20b (21 000 millones de parametros) para funcionar.
- VRAM estimada: segun la guia consultada, gpt-oss-20b "cabe en cualquier GPU de 16 GB", siempre que el contexto se mantenga por debajo de 8k tokens.
- GPU recomendadas: RTX 4090 para uso local con contexto corto; H100 para el modelo hermano gpt-oss-120b, tambien de la familia. Para este adaptador no se documentan requisitos especificos.
- Compatibilidad con GPU de consumo: si, en tarjetas con al menos 16 GB de VRAM segun la misma fuente, con la salvedad del contexto.
- Opciones de despliegue: transformers y text-generation-inference aparecen como etiquetas del repositorio; tambien son viables vLLM (con soporte de adaptadores LoRA o fusionando previamente), llama.cpp y Ollama para el base. No hay instrucciones de despliegue aportadas por el autor.
- Latencia y throughput: la guia consultada reporta 225 tokens/s en una RTX 4090 con el contexto limitado a 8k, y una caida hasta aproximadamente 9 tokens/s con contexto de 128k. Son cifras del modelo base, no medidas sobre este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sham76/gptoss-20b-luau-lora | Adaptador sobre base de 21 000 M (3 600 M activos) | 128 000 tokens (base) | LoRA | apache-2.0 | 0 descargas, 0 likes |
| unsloth/gpt-oss-20b-unsloth-bnb-4bit | 21 000 M (3 600 M activos) | 128 000 tokens | Base cuantizado en 4 bits | no disponible en la informacion proporcionada | Modelo base de referencia |
| gpt-oss-120b | 117 000 M (5 100 M activos) | 128 000 tokens | MoE denso en activacion | apache-2.0 | Requiere H100 segun la guia consultada |
| unlimitedbytes/gptoss-bigcodebench-20b-lora | Adaptador sobre la misma familia | no disponible | LoRA | no disponible | Repositorio de HuggingFace existente |

No se dispone de datos de rendimiento comparado entre estas opciones, por lo que la comparativa es estructural y no de calidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay dataset, hiperparametros, numero de pasos ni evaluacion. Es imposible estimar la calidad del ajuste sin probarlo.
- Riesgo de sobreajuste o de degradacion respecto al base: al no existir comparativa con gpt-oss-20b sin ajustar, no se puede descartar perdida de capacidades generales.
- Alucinacion: riesgo alto en generacion de codigo, especialmente en APIs de Luau y de Roblox, donde el modelo puede inventar metodos o firmas inexistentes.
- Idioma: la model card declara unicamente ingles; el comportamiento en castellano no esta verificado ni garantizado.
- Licencia: el adaptador se publica como apache-2.0, pero el modelo base gpt-oss esta sujeto ademas a la politica de uso de gpt-oss de OpenAI, que conviene revisar antes de un despliegue comercial.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin issues ni validacion por terceros. No es una base razonable para produccion sin una evaluacion propia.
- Dependencia del base: al ser un adaptador, no se puede ejecutar de forma aislada; requiere descargar el modelo base y aplicar los pesos LoRA.
- Compatibilidad de cuantizacion: no se documenta si el adaptador se ha probado sobre GGUF, AWQ o GPTQ, ni si se puede fusionar sin perdida de calidad.
- Metadatos inconsistentes: las fechas de creacion y actualizacion del repositorio (2026-10-08) no coinciden con el calendario habitual de publicacion, lo que aconseja verificar la procedencia del contenido.
- Ambito funcional incierto: si la especializacion en Luau existe, el modelo podria rendir peor en tareas generales de codigo que el base sin ajustar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Sham76/gptoss-20b-luau-lora
- Modelo base en Unsloth: https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Model card oficial de gpt-oss-120b y gpt-oss-20b: https://openai.com/index/gpt-oss-model-card/
- Anuncio de OpenAI en TechCrunch: https://techcrunch.com/2025/08/05/openai-launches-two-open-ai-reasoning-models/
- Guia de hardware para gpt-oss-20b en local: https://runaihome.com/blog/gpt-oss-20b-local-ai-hardware-guide-2026/
- Adaptador comparable de la misma familia: https://huggingface.co/unlimitedbytes/gptoss-bigcodebench-20b-lora
