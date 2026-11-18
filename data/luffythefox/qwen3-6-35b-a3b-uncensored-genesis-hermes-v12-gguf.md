# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-GGUF es una cuantizacion en formato GGUF de un modelo MoE (Mixture of Experts) multimodal de aproximadamente 34.660 millones de parametros totales, publicado por el desarrollador independiente LuffyTheFox bajo el paraguas del proyecto Genesis. El modelo parte de la base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y le incorpora, mediante transferencia de tensores, datos de un finetune sobre el dataset Hermes (NousResearch/hermes-function-calling-v1) procedente de DJLougen/hermes-qwen3.5-35b-a3b-GGUF. El resultado es un modelo orientado a uso conversacional, agentico y sin censura, con soporte declarado de vision (pipeline image-text-to-text).

El interes tecnico del release no reside tanto en el modelo base como en el procedimiento Genesis, una suerte de "reparacion de tensores" post-entrenamiento que el autor aplica sobre modelos ya cuantizados en GGUF. Segun la model card, Genesis escanea tensores ssm_conv1d, reequilibra cabezas de atencion y reduce ruido de entrenamiento mediante una SVD personalizada basada en la distribucion de Marchenko-Pastur, con la intencion de mejorar la coherencia de contexto y reducir alucinaciones sin reentrenar. Es un enfoque poco convencional y sin validacion academica publica, por lo que debe tratarse con cautela.

El modelo acumula cifras notables de adopcion en Hugging Face (273.947 descargas y 732 likes en el momento de la consulta), lo que sugiere interes real de la comunidad, especialmente entre usuarios que buscan alternativas sin filtros para despliegue local. La licencia declarada es Apache 2.0, aunque conviene verificar la cadena de licencias del modelo base y del finetune intermedio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con capacidades multimodales (image-text-to-text); detalles internos de capas y dimensiones no disponibles |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3 B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples cuantizaciones; niveles concretos no especificados), generado con perfiles Unsloth e imatrix |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de 131,2 GB con multiples ficheros) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura MoE, heredado de la familia Qwen3.6, y con soporte multimodal declarado (entrada de imagen y texto). No se dispone de informacion detallada sobre numero de capas, dimension oculta, numero de expertos ni composicion exacta del dataset de preentrenamiento del modelo base. El pipeline declarado en Hugging Face es image-text-to-text, y los tags incluyen vision y multimodal, lo que confirma la intencion de uso con imagenes.

El proceso de construccion es en tres saltos: (1) el modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (una variante sin censura del Qwen3.6 MoE); (2) un finetune sobre el dataset Hermes de function calling (DJLougen/hermes-qwen3.5-35b-a3b-GGUF), del que el autor transfiere aproximadamente 2.000 bloques de dos tensores FFN de expertos; y (3) la aplicacion del metodo Genesis, que segun la model card escanea tensores ssm_conv1d, reequilibra cabezas y aplica una SVD basada en Marchenko-Pastur para reducir ruido. No hay evidencia publica independiente de que este procedimiento mejore metricas objetivas, y el autor lo describe como un trabajo de investigacion independiente realizado en Google Colab con una Tesla T4.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y otros idiomas (multilingual).
- Razonamiento y respuesta a instrucciones con un sesgo explicito hacia la ausencia de rechazos (la model card cita "0/465 refusals" en el modelo base).
- Soporte de tool calling y function calling, segun el dataset Hermes utilizado en el finetune.
- Capacidades agenticas y de razonamiento multi-paso, segun los tags del repositorio (agentic, hermes).
- Procesamiento de imagenes junto con texto (image-text-to-text, vision, multimodal).
- Uso como modelo de chat con plantillas compatibles con endpoints (tag endpoints_compatible).
- Modo "uncensored": menor probabilidad de negarse a responder, por diseno.

## Casos de uso

- Asistentes conversacionales locales sin filtros: el modelo puede mantener dialogos multi-turno en ingles y chino, y su naturaleza uncensored lo hace adecuado para prototipos de role-play, escritura creativa o investigacion sobre comportamiento de modelos sin alineamiento restrictivo.
- Agentes con function calling: gracias al finetune sobre el dataset Hermes, puede invocarse en pipelines de agentes que necesiten llamar a APIs, consultar bases de datos o ejecutar herramientas, integrándose via endpoints compatibles.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, puede emplearse para extraer informacion de capturas, diagramas o formularios combinados con instrucciones textuales.
- Despliegue en hardware de consumo: al distribuirse en GGUF con cuantizaciones, permite ejecutar un MoE de ~35 B en equipos con VRAM limitada usando llama.cpp u Ollama, cargando solo los expertos activos.
- Investigacion sobre tecnicas de cuantizacion y "reparacion" de tensores: el modelo sirve como caso de estudio para comparar el efecto del metodo Genesis frente al modelo base sin procesar.
- Generacion de codigo y scripting en entornos de desarrollo locales: aunque no se declaran benchmarks especificos, el modelo base Qwen3.6 tiene capacidades de codigo que se heredan, y el soporte de tool calling facilita su integracion en asistentes de IDE.
- Chat multilingue para comunidades: con soporte de en, zh y multilingual, puede desplegarse como bot en foros o canales de soporte tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas; solo menciona cualitativamente "0/465 refusals" en el modelo base, sin detallar el conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un MoE de ~34,66 B en GGUF, las cuantizaciones Q4 requieren del orden de 20-25 GB de VRAM/ RAM, y Q8 o FP16 superan los 35-65 GB; los valores exactos dependen de la cuantizacion concreta del repositorio (131,2 GB totales).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria esperar uso en A100 40/80 GB, H100, RTX 6000 Ada o configuraciones multi-GPU consumer.
- GPU de consumo: probablemente ejecutable en RTX 4090 (24 GB) con cuantizaciones bajas (Q4 o inferiores) y offload parcial a RAM; en GPUs de 12-16 GB requeriria offload agresivo y penalizacion de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo TGI/vLLM para el formato original, no necesariamente para GGUF.
- Latencia y throughput: no disponibles. Al ser MoE con ~3 B activos (segun el nombre), el throughput por token deberia ser mas alto que un denso de 35 B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12 (este) | ~34,66 B (MoE) | no disponible | Apache 2.0 | GGUF | Finetune Hermes + metodo Genesis |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~34,66 B (MoE) | no disponible | no disponible en la informacion | safetensors/GGUF | Modelo base sin censura |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | ~35 B (MoE) | no disponible | no disponible en la informacion | GGUF | Finetune Hermes sobre Qwen3.5 |
| Qwen3.6-35B-A3B (original, referencia) | ~34,66 B (MoE) | no disponible | no disponible en la informacion | safetensors | Base de la familia Qwen3.6 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El metodo Genesis no cuenta con validacion independiente ni publicacion revisada por pares; las afirmaciones sobre reduccion de ruido y mejora de coherencia deben tomarse como hipotesis del autor.
- Modelo "uncensored": no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o danino; no es apto para despliegues publicos sin moderacion adicional.
- Riesgo elevado de alucinacion, especialmente en dominios especializados y en contextos largos; no hay benchmarks que cuantifiquen este riesgo.
- Idiomas: el soporte declarado se limita a en, zh y "multilingual" generico; el rendimiento en castellano no esta verificado.
- Licencia Apache 2.0 declarada, pero conviene auditar la cadena de licencias del modelo base y del finetune intermedio antes de uso comercial.
- La longitud de contexto no esta documentada, lo que dificulta planificar despliegues con ventanas largas.
- El repositorio es grande (131,2 GB) y contiene multiples cuantizaciones; la eleccion de fichero afecta directamente a calidad y requisitos de hardware.
- El modelo se distribuye unicamente en GGUF; para fine-tuning adicional o integracion con frameworks que requieran safetensors habria que reconvertir.
- La model card incluye llamadas a donaciones y datos de contacto del autor; no constituyen garantia de soporte tecnico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de referencia: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantizacion con perfiles Unsloth: https://pastebin.com/hXhcMJn9
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
- Distribucion de Marchenko-Pastur (referencia matematica citada): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
