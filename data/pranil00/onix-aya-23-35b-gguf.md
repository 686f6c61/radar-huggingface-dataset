# pranil00/ONIX-aya-23-35B-GGUF

## Resumen

ONIX-aya-23-35B-GGUF es una cuantizacion del modelo CohereLabs/aya-23-35B publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". Se trata de un artefacto GGUF en formato IQ2_M (2,7 bits por peso) generado con la herramienta run-any-model, pensado para ejecutar un modelo de 32.763 millones de parametros en hardware de consumo con 12 GB de VRAM o 12 GB de memoria unificada. El modelo base, aya-23-35B, es un transformer decoder-only de la familia Qwen (el autor de la model card lo etiqueta explicitamente como "Architecture Family: Qwen"), desarrollado originalmente por Cohere Labs para generacion de texto multilingue.

La relevancia de esta publicacion es fundamentalmente practica: comprime los pesos de 64,08 GB en FP16 a 10,81 GB (ratio de compresion 5,93x, reduccion del 83,1%), lo que permite ejecutar un modelo de 33B en un Apple Silicon con 16 GB o en una GPU NVIDIA de gama media-alta. El autor declara una retencion de calidad del 82,0% respecto al baseline FP16, aunque no especifica la metodologia de esa medicion.

La ficha presenta limitaciones de informacion importantes: no hay datos de benchmarks estandarizados, no se detalla la composicion del dataset de entrenamiento del modelo base ni los idiomas soportados en esta publicacion, y el repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion comunitaria del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen, segun la model card del autor) |
| Parametros totales | 32.763.412.480 (32,76 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA; 4.096 tokens en CPU |
| Tipos de cuantizacion | IQ2_M (2,7 bits por peso); el repositorio contiene un unico archivo GGUF |
| Idiomas soportados | no disponible (el modelo base aya-23-35B es multilingue, pero esta publicacion no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `CohereForAI--aya-23-35B-IQ2_M.gguf`, 10,81 GB) |

## Arquitectura y entrenamiento

El modelo base aya-23-35B es un transformer decoder-only de la familia Qwen con 32.763 millones de parametros. Esta publicacion concreta no entrena ningun modelo: es una conversion de pesos a GGUF con cuantizacion IQ2_M generada de forma automatica por la herramienta run-any-model, descrita por el autor como un motor de optimizacion de LLM adaptativo al dispositivo. La model card no aporta informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si hubo etapas de RLHF o DPO.

La innovacion tecnica del artefacto es exclusivamente la cuantizacion: IQ2_M es un esquema de cuantizacion por bloques con mezcla de precision (importancia calibrada), que mantiene ciertas capas o tensores en mayor precision para limitar la degradacion. El autor reporta una aceleracion del 100% de las capas (64/64) en Metal y CUDA, y un buffer de KV cache de 1.024 MB en FP16. No se documenta ninguna innovacion arquitectonica propia ni cambios respecto al modelo original.

## Capacidades

- Generacion de texto autoregresiva en modo conversacional (la model card incluye ejemplos con plantilla de chat y tokens de parada `<|im_end|>` y `<|endoftext|>`).
- Razonamiento y matematicas: el autor advierte que "el razonamiento matematico complejo puede experimentar una degradacion menor" con esta cuantizacion.
- Capacidades multilingues: heredadas del modelo base aya-23-35B, aunque esta publicacion no enumera idiomas concretos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (el modelo base es solo texto).
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Prototipado local en equipos de desarrollo con GPU de 12 GB: permite probar un modelo de 33B en una RTX 3060 de 12 GB o una RTX 4070, sin depender de APIs externas, con contexto de 8.192 tokens.
- Asistente conversacional en Apple Silicon: con 11,91 GB de memoria unificada en un Mac con 16 GB, se puede desplegar un chat multi-turno acelerado por Metal para tareas de redaccion y resumen.
- Evaluacion de cuantizaciones agresivas: util como caso de estudio para medir la perdida real de calidad de IQ2_M frente a FP16 en tareas de razonamiento, dado que el autor solo aporta una cifra agregada del 82%.
- Generacion de texto offline en portatiles: mediante llama.cpp u Ollama en CPU con AVX2/AVX-512, con contexto reducido a 4.096 tokens, para entornos sin GPU y sin conectividad.
- Traduccion y redaccion multilingue ligera: aprovechando la naturaleza multilingue del modelo base, en escenarios donde no se requiere precision extrema y se prioriza la ejecucion local.
- Integracion en LM Studio, Jan o Text-Generation-WebUI: el archivo GGUF se puede arrastrar directamente al directorio de modelos de estas aplicaciones, lo que facilita demos y pruebas de concepto sin escribir codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es interna a su herramienta de cuantizacion:

| Metrica | Baseline (FP16) | Cuantizado (IQ2_M) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 2,7 | -83,1% |
| Tamano de pesos | 64,08 GB | 10,81 GB | -83,1% |
| Buffer de KV cache | 1.024 MB (FP16) | 1.024 MB (FP16) | Optimizado |
| RAM residente total | 65,17 GB | 11,91 GB | -81,7% |
| Calidad estimada | 100,0% baseline | 82,0% retenida | -18,0% |
| Aceleracion de capas | 0% (riesgo de crash) | 64/64 capas | Optimo |

No se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandarizada, ni para el modelo base ni para la version cuantizada.

## Requisitos de hardware

- VRAM/RAM estimada: 11,91 GB de memoria unificada en Apple Silicon; 12,31 GB de VRAM dedicada en NVIDIA; 13,91 GB de RAM libre en CPU x86.
- GPU recomendadas: RTX 30/40/50 series con al menos 12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080); en el catalogo profesional no se especifica soporte para A100 o H100, aunque por memoria serian compatibles.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM; en GPUs de 8 GB no cabe el archivo completo.
- Apple Silicon: M1/M2/M3/M4/M5 con 16 GB de memoria unificada o mas, aceleracion Metal nativa.
- Opciones de despliegue: run-any-model CLI, Ollama (mediante Modelfile), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles; el autor no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-aya-23-35B-GGUF (esta publicacion) | 32,76 B | 8.192 (GPU) / 4.096 (CPU) | IQ2_M, 10,81 GB | Apache 2.0 | Hugging Face, 0 descargas |
| CohereLabs/aya-23-35B (base) | 32,76 B | no disponible en esta ficha | FP16, ~64 GB | no disponible en esta ficha | Hugging Face (modelo original) |
| Otras cuantizaciones GGUF de aya-23-35B | 32,76 B | depende del esquema | Q4_K_M, Q5_K_M, etc. | segun publicador | no verificado en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion IQ2_M es agresiva (2,7 bits por peso); el propio autor reconoce una perdida estimada del 18% de calidad y degradacion en razonamiento matematico complejo.
- La cifra de "82,0% de retencion de calidad" no viene acompanada de metodologia, conjunto de evaluacion ni reproducibilidad; debe tratarse como una estimacion no verificada.
- El repositorio no tiene descargas ni likes, y la model card contiene afirmaciones no contrastadas (por ejemplo, "100% Native Metal Accelerated" o "Quality Retention"), sin validacion de terceros.
- No se declaran los idiomas soportados en esta publicacion; las capacidades multilingues deben validarse empiricamente antes de usarla en produccion.
- No hay informacion sobre sesgos del modelo base ni sobre como la cuantizacion afecta a esos sesgos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documenta ningun mecanismo de mitigacion en esta publicacion.
- La licencia declarada es Apache 2.0, pero la model card incluye una clausula de exencion de responsabilidad total ("AS IS") que conviene revisar con el equipo legal antes de un uso comercial.
- El contexto maximo practico se reduce a 4.096 tokens en CPU, lo que limita casos de uso con documentos largos.
- El artefacto depende de una herramienta de terceros (run-any-model) para su generacion; no se documenta el proceso exacto de calibracion de la cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-aya-23-35B-GGUF
- Modelo base: https://huggingface.co/CohereForAI/aya-23-35B
- Herramienta de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
