# netprojects/Hy-MT3-7B-MLX-8bit

## Resumen

Hy-MT3-7B-MLX-8bit es una conversion a formato MLX del modelo de traduccion multilingue tencent/Hy-MT3-7B, publicada por NetProjects (Internet Projects Ltd) para su ejecucion en Apple Silicon. El modelo original lo desarrolla Tencent y pertenece a la familia Hy-MT3, lanzada el 24 de noviembre de 2026 en tres tamanos (1.8B, 7B y 30B-A3B). Esta variante concreta aplica una cuantizacion de 8 bits (afin, grupo 64) sobre los pesos convertidos con mlx-lm, lo que reduce el repositorio a 8,0 GB y permite ejecutar el modelo en Macs con 16 GB de memoria unificada o mas.

La relevancia de esta build es practica: acerca un modelo de traduccion de calidad a hardware de consumo de Apple sin necesidad de GPU dedicada. Frente a Hy-MT2, Tencent reporta en datos reales un 43% menos de errores de traduccion, un 74% menos de omisiones o adiciones y un 40% menos de errores de seguimiento de instrucciones. La verificacion de NetProjects compara cada token generado con el modelo bf16 original y obtiene un 99,5% de coincidencia en el siguiente token mas probable para esta build de 8 bits.

La arquitectura es un transformer denso de 32 capas con 7.504.568.320 parametros, orientado especificamente a traduccion entre aproximadamente 100 idiomas y dialectos. La licencia es Apache-2.0, la misma que el modelo base. Esta pensado para inferencia local en Mac, no para despliegue en servidores con GPU NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hunyuan_v1_dense), 32 capas |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | entradas de hasta aproximadamente 8K tokens; hasta 4096 tokens nuevos de salida (recomendacion de Tencent) |
| Tipos de cuantizacion | 8 bits afin, grupo 64 (existen builds de 6 y 4 bits del mismo autor) |
| Idiomas soportados | aproximadamente 100 idiomas y dialectos (incluye los 33 de Hy-MT2, cinco lenguas minoritarias chinas y 64 nuevos como griego, rumano, hungaro, nordicos y balticos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base Hy-MT3-7B es un transformer denso de 32 capas con 7,5 mil millones de parametros, disenado especificamente para traduccion automatica multilingue. Tencent lo situa entre el modelo on-device de 1,8B y el flagship 30B-A3B (MoE) de la misma familia. La informacion disponible no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset; la model card remite al informe tecnico (arXiv 2611.27673) para los resultados completos. Tampoco se especifica si hubo RLHF o DPO.

La innovacion principal es la cobertura linguistica: unos 100 idiomas y dialectos, con enfasis en lenguas que otros modelos de traduccion cubren de forma deficiente (griego, rumano, hungaro, lenguas nordicas y balticas, y cinco lenguas minoritarias chinas). Tencent reporta mejoras sustanciales frente a Hy-MT2 en datos reales: 43% menos errores de traduccion, 74% menos omisiones o adiciones y 40% menos errores de seguimiento de instrucciones. Esta build de NetProjects no modifica la arquitectura, solo convierte y cuantiza los pesos; la verificacion confirma que el 99,5% de los tokens mas probables coinciden con el modelo bf16 original sobre 217 posiciones evaluadas.

## Capacidades

- Traduccion multilingue entre aproximadamente 100 idiomas y dialectos, con salida directa del texto traducido sin explicaciones adicionales.
- Seguimiento de instrucciones de traduccion: idioma destino, estilo requerido, preferencias personales y preservacion de delimitadores.
- Soporte de listas de terminologia mediante plantillas de prompt del tipo "`term` translates to `translation`".
- Traduccion de datos estructurados (JSON, XML) preservando la estructura.
- Traduccion de documentos largos dentro de la ventana de entrada de aproximadamente 8K tokens.
- Servidor compatible con la API de OpenAI mediante `mlx_lm.server`.
- No se documentan capacidades de tool calling, agentes, vision ni audio; el modelo esta especializado en traduccion.

## Casos de uso

- Traduccion local en Mac para desarrolladores: un unico comando `mlx_lm.generate` permite traducir textos sin enviar datos a servicios en la nube, adecuado para contenido sensible que no debe salir del equipo.
- Internacionalizacion de aplicaciones: traduccion de cadenas de interfaz y ficheros de recursos en formatos JSON o XML, aprovechando la preservacion de estructura y las plantillas de terminologia para mantener coherencia de glosario.
- Traduccion de documentacion tecnica: con entradas de hasta 8K tokens, permite procesar secciones completas de manuales manteniendo el contexto, util para equipos que publican en varios idiomas.
- Atencion al cliente multilingue en local: integrado via `mlx_lm.server` como endpoint compatible con OpenAI, puede servir como backend de traduccion en prototipos y herramientas internas sin coste por token.
- Traduccion de correspondencia y textos administrativos hacia lenguas menos cubiertas (griego, rumano, hungaro, baltico, nordico), donde los modelos generalistas suelen fallar mas.
- Preservacion de lenguas minoritarias: traduccion hacia y desde las cinco lenguas minoritarias chinas incluidas en la familia, relevante para proyectos de documentacion cultural o linguistica.
- Prototipado rapido de pipelines de traduccion: la build de 6 bits (6,1 GB) permite iterar en un Mac de 16 GB antes de escalar a la version 30B-A3B en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, COMET) en la informacion disponible. La model card incluye unicamente verificaciones de la conversion:

| Build | Tamano | Coincidencia de siguiente token con bf16 | Prueba de traduccion | Memoria Mac sugerida |
|---|---|---|---|---|
| 6 bits (recomendada) | 6,1 GB | 100,0% | 10/10 | 16 GB+ |
| 8 bits (esta build) | 8,0 GB | 99,5% | 10/10 | 16 GB+ |
| 4 bits | 4,2 GB | 97,7% | 10/10 | 16 GB+ |

Las pruebas se realizaron en un MacBook Pro M5 Max de 128 GB con mlx-lm 0.32.2 el 24 de noviembre de 2026. La prueba de traduccion consistio en 10 prompts (griego, chino, japones, aleman, frances, espanol, arabe y ruso como destino, y griego y chino a ingles como origen), con decodificacion greedy y hasta 128 tokens. La coincidencia de tokens se midio sobre 217 posiciones generadas. No se reportan metricas de calidad de traduccion (BLEU, COMET, chrF) para esta build.

## Requisitos de hardware

- VRAM/memoria unificada: 16 GB o mas en Mac; el limite de GPU por defecto debe contener el pico de memoria observado mas 2 GB. Documentos largos requieren mas memoria.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4, M5 y variantes Pro, Max y Ultra). Las pruebas se hicieron en un M5 Max de 128 GB.
- GPU NVIDIA: no aplicable; el formato MLX no se ejecuta en CUDA. Para NVIDIA habria que usar los pesos originales de tencent/Hy-MT3-7B con vLLM, TGI o llama.cpp.
- Cabe en GPU de consumo: si, en cualquier Mac con 16 GB o mas de memoria unificada. No esta pensado para GPUs de consumo NVIDIA en este formato.
- Despliegue: mlx-lm (version 0.32.2 o superior), `mlx_lm.generate` para CLI, API de Python con `load` y `generate`, y `mlx_lm.server` para endpoint compatible con OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de muestreo recomendados: temperatura 0.7, top_p 0.6, top_k 20, penalizacion de repeticion 1.05, hasta 4096 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato/hardware |
|---|---|---|---|---|---|
| Hy-MT3-7B-MLX-8bit (esta build) | 7,5B denso | entradas ~8K, salida 4096 | ~100 | Apache-2.0 | MLX, Apple Silicon |
| tencent/Hy-MT3-7B (original) | 7,5B denso | entradas ~8K, salida 4096 | ~100 | Apache-2.0 | safetensors bf16, GPU NVIDIA/AMD |
| Hy-MT3-1.8B | 1,8B | no disponible | ~100 | Apache-2.0 | on-device |
| Hy-MT3-30B-A3B | 30B (MoE) | no disponible | ~100 | Apache-2.0 | flagship, servidor |

La comparativa con modelos de traduccion de otros fabricantes (NLLB, M2M-100, SeamlessM4T, Tower) no esta disponible en la informacion proporcionada; no se aportan datos de rendimiento comparativo.

## Limitaciones y advertencias

- Especializado en traduccion: no es un modelo de proposito general; su uso para razonamiento, codigo o generacion libre de texto no esta validado.
- Ventana de entrada limitada a aproximadamente 8K tokens: los documentos mas largos deben segmentarse, con riesgo de perder contexto entre fragmentos.
- Riesgo de alucinacion y de omisiones o adiciones en textos muy especializados o con terminologia poco comun, aunque Tencent reporta una reduccion del 74% en omisiones frente a Hy-MT2.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; como modelo entrenado por Tencent, puede reflejar sesgos de los datos de entrenamiento, especialmente en lenguas minoritarias con menos corpus.
- La cuantizacion a 8 bits introduce una divergencia del 0,5% respecto a bf16 en el siguiente token; en textos largos o dominios especializados el efecto acumulado puede ser mayor.
- Requiere hardware Apple Silicon; no es portable a CUDA sin reconvertir desde los pesos originales.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el fichero LICENSE.txt de Tencent y citar su trabajo segun la model card original.
- NetProjects no esta afiliado a Tencent; la build no cuenta con soporte oficial del fabricante del modelo base.
- No hay prompt de sistema por defecto; el comportamiento depende de la plantilla de chat aplicada por el tokenizer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Hy-MT3-7B-MLX-8bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- Build de 6 bits: https://huggingface.co/netprojects/Hy-MT3-7B-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Hy-MT3-7B-MLX-4bit
- Informe tecnico: arXiv 2611.27673
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
