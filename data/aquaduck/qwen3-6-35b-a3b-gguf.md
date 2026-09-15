# aquaduck/Qwen3.6-35B-A3B-GGUF

## Resumen

Este repositorio, publicado por Aquaduck (aquaduck/Qwen3.6-35B-A3B-GGUF), no contiene un modelo entrenado desde cero, sino un empaquetado de pesos: el GGUF completo en cuantizacion Q4_K_M del modelo Qwen3.6-35B-A3B-UD, junto con dos fragmentos ("layer shards") cortados por la mitad del mismo archivo. El modelo subyacente es un modelo de lenguaje causal desarrollado por el Qwen Team de Alibaba Cloud, distribuido originalmente como qwen/qwen3.6-35b-a3b y cuantizado a GGUF por Unsloth. La aportacion concreta de este repo es el formato de paquete por capas `layer-package-v1`, pensado para carga escalonada o repartida entre varios nodos, no una nueva cuantizacion.

El modelo base declara 262.144 tokens de contexto nativo, 40 capas, atencion con GQA de 16 cabezas de consulta y 2 de clave/valor, y una dimension oculta de 2048. La model card indica "36B parametros", mientras que los metadatos de HuggingFace reportan 17.330.304.320 parametros reales; el sufijo "A3B" del nombre es coherente con una arquitectura de mezcla de expertos con unos 3.000 millones de parametros activos, aunque la model card de este repositorio no lo confirma de forma explicita. Esta discrepancia y la ausencia de evaluaciones propias son los dos puntos que un evaluador debe verificar antes de adoptarlo.

Su relevancia practica es doble: por un lado ofrece un GGUF Q4_K_M estandar, compatible con llama.cpp, que cabe en estaciones de trabajo con GPU de gama alta o en configuraciones con memoria unificada; por otro, introduce un esquema de particionado por capas orientado a la aplicacion de escritorio de Aquaduck, que descarga solo el fragmento asignado por el catalogo de modelos. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y fue creado y actualizado el 15 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6-35B-A3B-UD; transformer causal con GQA (16 cabezas Q / 2 cabezas KV), 40 capas, dimension oculta 2048. El sufijo "A3B" sugiere MoE, no confirmado en la model card |
| Parametros totales | 36B segun la model card; 17.330.304.320 segun los metadatos de safetensors de HuggingFace (dato contradictorio, ver limitaciones) |
| Parametros activos | No confirmado en la model card; el sufijo "A3B" apunta a ~3B activos, sin dato oficial en este repositorio |
| Longitud de contexto | 262.144 tokens (contexto nativo declarado) |
| Tipos de cuantizacion | Q4_K_M (unico tipo presente en el repositorio) |
| Idiomas soportados | Multilingue "igual que el modelo base"; lista concreta de idiomas: no disponible |
| Licencia | other (heredada de qwen/qwen3.6-35b-a3b) |
| Formato de pesos | GGUF (full `Qwen3.6-35B-A3B-UD-Q4_K_M.gguf` y shards `*-layers-{start}-{endExclusive}.gguf`, formato `layer-package-v1`) |

## Arquitectura y entrenamiento

No hay entrenamiento en este repositorio. El flujo de linaje es: qwen/qwen3.6-35b-a3b (pesos originales de Qwen Team / Alibaba Cloud) se cuantiza a Q4_K_M en unsloth/Qwen3.6-35B-A3B-MTP-GGUF, y ese GGUF se ingiere aqui, donde ademas se parte en dos paquetes contiguos de capas. La model card es explicita: "No training", y los shards "no son una nueva cuantizacion", sino cortes a mitad del mismo archivo. Por tanto, no hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, RLHF, DPO ni ninguna innovacion de entrenamiento en la informacion disponible.

Los unicos detalles arquitectonicos aportados son los del modelo base: aproximadamente 36B de parametros, Grouped Query Attention con 16 cabezas de consulta y 2 de clave/valor, 40 capas y dimension oculta de 2048. El nombre del repositorio de origen incluye "MTP", lo que en la nomenclatura habitual del ecosistema apunta a prediccion multi-token, pero la model card no desarrolla ni confirma esa caracteristica. La innovacion real de este repositorio es de empaquetado: la particion en dos etapas con frontera valida en la capa 20 (`maxStages: 2`), con indices de fin exclusivos en los nombres de archivo, orientada a carga por etapas o reparto entre nodos.

## Capacidades

- Generacion de texto conversacional: la pipeline declarada es `text-generation` y la model card menciona plantilla de chat con modos "thinking" e "instruct" heredados del modelo base.
- Razonamiento con modo de pensamiento: la model card indica que deben seguirse los modos thinking/instruct documentados en el modelo base, lo que implica que el base los soporta; no se detallan metricas.
- Multilingue: declarado como "Multilingual (same as base)", sin lista de idiomas.
- Carga escalonada por capas: capacidad exclusiva de este repositorio, mediante shards contiguos de capas 0-19 y 20-39.
- Compatibilidad con endpoints: el tag `endpoints_compatible` figura en los metadatos de HuggingFace.
- Cuantizacion con imatrix: el tag `imatrix` aparece en los metadatos del repositorio (no se detalla en la model card).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en una sola maquina: cargar `Qwen3.6-35B-A3B-UD-Q4_K_M.gguf` (~22,66 GB) con llama.cpp o cualquier runtime compatible con GGUF para disponer del modelo completo con contexto de hasta 262.144 tokens, sin depender de servicios externos.
- Despliegue con contexto muy largo: analisis de documentos extensos, bases de codigo o historiales de conversacion que superen los 100.000 tokens, aprovechando la ventana nativa de 262.144 tokens declarada.
- Carga repartida en dos nodos o dos etapas: usar los shards `layers-0-20` y `layers-20-40` con el cargador de Aquaduck Arc para distribuir el modelo, reduciendo la memoria necesaria por dispositivo en cada etapa.
- Aplicacion de escritorio con asignacion automatica de modelos: integrarse en el flujo de la app de escritorio de Aquaduck, que descarga unicamente el archivo asignado por el catalogo de modelos y lo mantiene listo para servir.
- Servicio de chat conversacional en produccion: exponer el GGUF a traves de un servidor compatible (por ejemplo, llama.cpp server o vLLM si el soporte GGUF lo permite) usando la plantilla de chat del modelo base, con modos thinking e instruct segun el caso.
- Evaluacion comparativa de cuantizaciones: utilizar este Q4_K_M como referencia para medir la degradacion de calidad frente a releases de mayor precision del mismo modelo base, tal y como advierte la propia model card.
- Experimentacion con particionado por capas: investigar estrategias de carga por etapas, offloading parcial o pipelining entre dispositivos usando el formato `layer-package-v1` como ejemplo de empaquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No separate evals for the hosted GGUF or shards. See qwen/qwen3.6-35b-a3b." No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra metrica en la informacion proporcionada, por lo que no se presenta tabla comparativa de rendimiento.

## Requisitos de hardware

- Peso en disco y en memoria: el archivo completo Q4_K_M ocupa aproximadamente 22,66 GB, por lo que la VRAM minima para inferencia es de ese orden mas el overhead del runtime.
- Cache KV estimada (calculo propio a partir de los datos de la model card, no dato oficial): con 40 capas y 2 cabezas KV de 128 dimensiones cada una en FP16, el coste ronda los 40 KB por token, es decir, aproximadamente 1,3 GB a 32K de contexto, 5,2 GB a 128K y 10,5 GB a 262.144 tokens. La cifra real depende del runtime y de si se aplica cuantizacion de la cache KV.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo encaja en GPUs de 24 GB solo con contexto reducido o cache KV cuantizada, y con holgura en GPUs de 48 GB o mas (por ejemplo, A6000, L40S, A100 80 GB, H100). Estas recomendaciones son inferencias a partir del tamano del archivo, no datos del autor.
- Cabe en GPU de consumo: el archivo de ~22,66 GB se aproxima al limite de una RTX 4090 de 24 GB, por lo que en la practica requeriria contexto muy corto, offloading parcial a CPU/RAM o reparto en varios dispositivos. No hay confirmacion del autor.
- Shards: cada mitad ocupa aproximadamente 11,08 GB (capas 0-19) y 11,60 GB (capas 20-39), lo que reduce el requisito por dispositivo en un despliegue por etapas.
- Opciones de despliegue: llama.cpp (compatible con el GGUF completo, segun la model card), cargador de Aquaduck Arc para los shards, y cualquier runtime con soporte GGUF. vLLM, TGI y Ollama no se mencionan en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de benchmarks ni modelos comparables identificados en la informacion proporcionada. La comparacion posible se limita al propio linaje del modelo, con datos tomados de la model card:

| Modelo / repositorio | Rol | Parametros declarados | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| aquaduck/Qwen3.6-35B-A3B-GGUF | GGUF Q4_K_M + shards por capas | 36B (model card) / 17,33B (metadatos HF) | 262.144 tokens | GGUF, `layer-package-v1` | other |
| unsloth/Qwen3.6-35B-A3B-MTP-GGUF | GGUF origen de la cuantizacion | no disponible | no disponible | GGUF | no disponible |
| qwen/qwen3.6-35b-a3b | Pesos originales del modelo base | 36B (segun este repo) | 262.144 tokens | safetensors (no confirmado) | other |

Comparativa con alternativas de otros fabricantes (Llama, Mistral, DeepSeek, etc.): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Contradiccion en el numero de parametros: la model card declara 36B, los metadatos de safetensors de HuggingFace reportan 17.330.304.320. Debe verificarse antes de planificar recursos.
- Arquitectura no confirmada: la model card no aclara si es MoE ni cuantos parametros activos tiene, pese al sufijo "A3B" del nombre.
- Degradacion por cuantizacion: la propia model card advierte de que Q4_K_M puede degradar la calidad respecto a releases de mayor precision del mismo modelo.
- Los shards no son modelos completos: los archivos `*-layers-*.gguf` no funcionan en llama.cpp estandar y solo son utilizables con el cargador de Aquaduck Arc. Esperar que un shard funcione por si solo esta explicitamente fuera de alcance.
- Plantilla de chat obligatoria: si no se usa la plantilla del modelo base (incluidos los modos thinking e instruct), los resultados seran incorrectos segun la model card.
- Idiomas: se declara multilingue, pero no se especifica la lista de idiomas ni su cobertura real.
- Licencia: "other", heredada del modelo base. No se detallan en la informacion proporcionada los terminos exactos ni si se permite uso comercial; debe consultarse la licencia de qwen/qwen3.6-35b-a3b antes de cualquier despliegue en produccion.
- Sesgos: la model card remite a los sesgos y riesgos del modelo base, sin enumerarlos.
- Alucinacion: no hay informacion especifica; aplican los riesgos generales de los modelos de lenguaje causales.
- Sin evaluaciones propias: no hay benchmarks del GGUF alojado ni de los shards.
- Madurez del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, lo que limita la evidencia de uso en comunidad.
- Contexto largo: aunque se declaran 262.144 tokens, no se aportan datos de rendimiento ni de degradacion en ventanas largas, ni confirmacion de que el runtime utilice extensiones de contexto necesarias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aquaduck/Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/qwen/qwen3.6-35b-a3b
- GGUF de origen de la cuantizacion: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Perfil del autor: https://huggingface.co/aquaduck
- llama.cpp (soporte GGUF): https://github.com/ggml-org/llama.cpp
