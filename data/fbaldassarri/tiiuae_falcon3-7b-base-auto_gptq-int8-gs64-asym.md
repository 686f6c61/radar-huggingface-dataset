# fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int8-gs64-asym

## Resumen

fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int8-gs64-asym es una version cuantizada a INT8 del modelo base tiiuae/Falcon3-7B-Base, desarrollada por el usuario fbaldassarri y publicada como artefacto derivado. No se trata de un modelo nuevo: es un checkpoint de pesos comprimidos mediante cuantizacion solo de pesos (WoQ) con el algoritmo GPTQ implementado por Intel AutoRound v0.15.1, con 8 bits, group size 64 y esquema asimetrico. El objetivo es reducir la huella de memoria del Falcon3-7B-Base original para poder servirlo en hardware Intel: CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU (AI Boost de la serie Core Ultra) mediante OpenVINO.

El modelo conserva la licencia Apache 2.0 del original, lo que permite uso comercial sin restricciones adicionales, y se distribuye en formato safetensors con configuracion de cuantizacion auto_gptq. Es un modelo base (completion), no instruct, por lo que no incorpora plantilla de chat ni alineamiento conversacional: se le debe dar texto crudo como prompt.

La relevancia de este artefacto es practica: permite ejecutar un modelo de la familia Falcon3 (contexto de hasta 32K segun las fuentes del modelo base) en equipos sin GPU dedicada NVIDIA, aprovechando la ruta de aceleracion de Intel. Como contrapartida, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el propio autor lo declara de uso exclusivamente investigador.

Un dato a tener en cuenta: los metadatos de safetensors del repositorio indican 2.599.044.096 parametros, una cifra incoherente con la denominacion "7B" del modelo base. Esta discrepancia no se explica en la informacion disponible y conviene verificarla antes de planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal; model_type declarado en la model card: llama |
| Parametros totales | 2.599.044.096 segun metadatos de safetensors del repositorio (el modelo base se denomina Falcon3-7B-Base; discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 32K segun las fuentes del modelo base Falcon3-7B-Base |
| Tipos de cuantizacion | INT8 (8 bits), WoQ con GPTQ/AutoGPTQ; group size 64; asimetrica (sym = false); calibracion en torch.bfloat16 |
| Idiomas soportados | el repositorio declara unicamente "en"; el modelo base Falcon3-7B-Base soporta ademas frances, espanol y portugues segun fuentes externas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint GPTQ / auto_gptq) |

## Arquitectura y entrenamiento

La model card identifica el model_type como "llama", es decir, una arquitectura transformer decoder-only causal con tokenizador y configuracion compatibles con la clase LlamaForCausalLM de transformers. Los detalles concretos de atencion (por ejemplo, si emplea grouped-query attention, RoPE u otras variantes) no estan disponibles en la informacion proporcionada. No se describe en el material disponible el proceso de entrenamiento del modelo base: numero de tokens, composicion del dataset, fases de RLHF/DPO ni innovaciones tecnicas del preentrenamiento. Las fuentes externas solo indican que Falcon3-7B-Base alcanzo resultados de estado del arte en su momento en razonamiento, comprension del lenguaje, seguimiento de instrucciones, codigo y matematicas.

Lo que si esta documentado es el proceso de cuantizacion. Se realizo con Intel AutoRound v0.15.1 sobre transformers 4.55.3 y torch 2.14.0+cpu, cargando el modelo en torch.bfloat16 sobre CPU. La calibracion uso 128 muestras, 200 iteraciones de ajuste, secuencia de 512 tokens y batch size 4. El proceso completo duro 49.300,2 segundos (821,7 minutos) y finalizo el 2026-10-10. El autor publica la receta de replicacion exacta, tanto mediante el orquestador auto-round-pipeline como mediante una llamada directa a AutoRound con bits=8, group_size=64, sym=False y format="auto_gptq".

## Capacidades

- Generacion de texto y completion de texto sin formato de chat: es un modelo base, se le pasa texto crudo y continua la secuencia.
- Razonamiento, comprension del lenguaje, codigo y matematicas heredados del Falcon3-7B-Base, segun las fuentes del modelo original.
- Capacidad multilingue limitada en el modelo base a ingles, frances, espanol y portugues; el repositorio cuantizado declara solo "en" en sus metadatos.
- Inferencia en hardware Intel: CPU, iGPU Arc (via intel-extension-for-pytorch) y NPU AI Boost de la serie Core Ultra (via OpenVINO).
- Compatibilidad con el ecosistema transformers y con text-generation-inference como tag de despliegue.
- No dispone de tool calling, function calling, modo thinking, vision, audio ni capacidades de agente declaradas en la informacion disponible, ya que es un modelo base sin ajuste instructivo.

## Casos de uso

- Inferencia en equipos sin GPU NVIDIA: el checkpoint INT8 esta pensado para ejecutarse en CPU Intel, iGPU Arc y NPU de Core Ultra, lo que permite desplegar un modelo tipo Falcon3 en portatiles y workstations sin tarjeta grafica dedicada.
- Punto de partida para fine-tuning: al ser un modelo base y no instruct, es adecuado como inicializacion para ajustes supervisados especificos de dominio (legal, medico, industrial) antes de servir en produccion.
- Generacion de texto en lote: tareas de completion masiva sobre corpus (resumen extractivo, reformulacion, expansion de plantillas) donde no se necesita dialogo multi-turno.
- Autocompletado de codigo en entornos locales: el modelo base cubre codigo segun las capacidades declaradas del Falcon3-7B-Base, y su cuantizacion INT8 reduce el coste de memoria frente al checkpoint bf16.
- Generacion de datos sinteticos: producir texto de dominio para aumentar datasets de entrenamiento de modelos menores, aprovechando el contexto de hasta 32K del modelo base.
- Investigacion sobre cuantizacion: el artefacto sirve como referencia reproducible para estudiar el impacto de INT8 con group size 64 asimetrico frente a otras configuraciones (por ejemplo, la variante con group size 128).
- Despliegue con text-generation-inference en infraestructura propia cuando se quiera exponer el modelo como endpoint HTTP de completion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye mediciones de MMLU, HumanEval, GSM8K ni de degradacion de perplejidad respecto al modelo base en bf16. Tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada: con INT8 y group size 64, los pesos ocupan aproximadamente 1 byte por parametro (mas escalas y offsets). Para un modelo de 7B serian del orden de 7-8 GB; si la cifra de safetensors (2,6B) fuese correcta, el requisito bajaría a unos 3 GB. No hay mediciones publicadas y la discrepancia de parametros impide dar una cifra cerrada.
- El repositorio ocupa 10,2 GB en disco, lo que sugiere que el espacio requerido en almacenamiento es superior al de los pesos cuantizados estrictos.
- GPU de datacenter: A100 y H100 pueden ejecutar el modelo sin problema por capacidad, aunque el artefacto no esta optimizado para kernels CUDA de GPTQ en produccion.
- GPU de consumo: cabe en tarjetas con 12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) asumiendo el escenario de 7B en INT8, con margen limitado para contextos largos por el cache KV.
- Objetivo principal declarado: CPU Intel, iGPU Arc (intel-extension-for-pytorch) y NPU AI Boost de Core Ultra (OpenVINO). No se mencionan requisitos minimos de CPU ni de memoria de sistema.
- Opciones de despliegue: transformers con device_map="auto" es el camino documentado por el autor; el repo lleva el tag text-generation-inference. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI con esta configuracion concreta, y no hay pesos GGUF publicados en la informacion disponible.
- Latencia y throughput estimados: no disponibles. La unica magnitud temporal publicada es la duracion de la cuantizacion (49.300,2 s en CPU), no de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad y notas |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int8-gs64-asym (este) | 2.599.044.096 segun safetensors (base denominada 7B) | hasta 32K (heredado del base) | safetensors, INT8 GPTQ, gs64 asimetrico | apache-2.0 | 0 descargas, 0 likes; orientado a Intel CPU/iGPU/NPU |
| tiiuae/Falcon3-7B-Base | no disponible en la informacion proporcionada | hasta 32K | safetensors bf16 | apache-2.0 | Modelo original de TII, sin cuantizar |
| fbaldassarri/tiiuae_Falcon3-7B-Base-autogptq-int8-gs128-asym | no disponible | no disponible | INT8 GPTQ, group size 128 | apache-2.0 (presumible, no confirmado en la busqueda) | Desplegado en FriendliAI con batching continuo y caching de tokens |
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-asym | no disponible | no disponible | safetensors, INT8 GPTQ, gs64 asimetrico | apache-2.0 | Variante instruct (conversacional) del mismo pipeline |
| fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int8-gs64-asym | no disponible | no disponible | INT8 GPTQ, gs64 asimetrico | apache-2.0 | Version menor, tambien dirigida a Intel CPU/iGPU/NPU |

Nota: la comparativa de rendimiento entre estas variantes no puede establecerse porque no hay resultados de benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no responde a formatos de chat ni a instrucciones sin un ajuste previo, y no incluye plantilla de dialogo.
- Riesgo de alucinacion inherente a un modelo de lenguaje preentrenado; no hay evaluaciones de fidelidad publicadas.
- Sesgos potenciales del modelo original, no evaluados ni mitigados en esta cuantizacion.
- La cuantizacion INT8 con group size 64 asimetrica introduce una perdida de calidad respecto al bf16 original cuya magnitud no esta documentada con metricas.
- Los metadatos declaran el campo inference: false, lo que en la practica de HuggingFace indica que el widget de inferencia no esta habilitado; no implica que el modelo no se pueda ejecutar localmente.
- El repositorio declara solo ingles como idioma, aunque el modelo base soporte mas idiomas; el soporte real en esta cuantizacion no esta verificado.
- Advertencia explicita del autor: el modelo se distribuye sin garantia y ha sido desarrollado solo con fines de investigacion.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero se recomienda verificar la procedencia de los datos de calibracion y las condiciones del modelo base antes de un despliegue en produccion.
- Sin adopcion verificable: 0 descargas y 0 likes, sin validacion independiente de calidad o estabilidad.
- La discrepancia entre el nombre "7B" y los 2.599.044.096 parametros reportados en safetensors debe resolverse antes de dimensionar infraestructura o comparar costes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int8-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Base
- Variante instruct cuantizada: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-asym
- Variante 3B base cuantizada: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int8-gs64-asym
- Variante con group size 128 en FriendliAI: https://friendli.ai/models/fbaldassarri/tiiuae_Falcon3-7B-Base-autogptq-int8-gs128-asym
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- auto-round-pipeline (receta de replicacion): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Ficha del modelo base en ModelHub: https://dev.modelhub.org.cn/tiiuae/Falcon3-7B-Base
- Ficha del modelo base en Inferix: https://inferix.co/models/tiiuae/Falcon3-7B-Base
