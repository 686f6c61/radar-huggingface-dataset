# Ibrahimsait/Qwen3.8-27B-EXL3-3.5bpw-Dual3090-Recipe

## Resumen

Este repositorio no contiene un modelo nuevo: es un empaquetado del cuantizado EXL3 a 3,5 bits por peso `Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw`, que a su vez deriva del modelo publicado como `Qwen/Qwen3.8-27B`. El autor, Ibrahimsait, distribuye los pesos sin modificar junto con una receta de inferencia medida sobre dos RTX 3090, orientada a codigo agentico con llamadas a herramientas, ejecucion de pruebas y compactacion de contexto.

El valor practico esta en la receta, no en los pesos: documenta una sesion real de CLI agentico (ZCode 0.16.9) que genero 225.790 tokens en 74,16 minutos, con 83,55 tok/s de decodificacion ponderada y 50,74 tok/s extremo a extremo, manteniendo 64,56 tok/s con entradas de mas de 225.000 tokens. La ventana configurada es de 262.144 tokens, con cache KV de 4 bits y paralelismo tensorial nativo repartido en dos GPU de 24 GB (presupuestos de 21 GiB + 21 GiB).

El metadato de arquitectura declarado es `qwen3_5` y el recuento real de elementos en safetensors es de 7.669.052.656, muy por debajo de los 27B que sugiere el nombre comercial; el autor no incluye ficha tecnica del modelo base en este repositorio. La licencia es Apache 2.0 y el repositorio registraba 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (metadato declarado por el autor; sin mas detalle en la informacion disponible) |
| Parametros totales | 7.669.052.656 elementos en safetensors (el nombre comercial indica 27B; no disponible la correspondencia exacta entre ambas cifras) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 262.144 tokens en la receta; se incluye `config.yarn-1m.json` por trazabilidad, pero el autor indica que no valida ni activa 1M de contexto |
| Tipos de cuantizacion | EXL3 a 3,5 bits por peso (bpw); cache KV a 4 bits en la receta medida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato EXL3, libreria `exllamav3`) |
| Tamano del repositorio | 15,4 GB |
| Modelo base | `Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw` (revision `19441ac874c4018295da848e250f23511361cda4`) |
| Modelo publicado original | `Qwen/Qwen3.8-27B` |
| Libreria de inferencia | exllamav3 |

## Arquitectura y entrenamiento

No hay entrenamiento, ajuste fino, mezcla ni cuantizacion nueva: los pesos son los del cuantizado upstream sin modificar y el autor lo declara explicitamente. El unico dato de arquitectura disponible es el metadato `qwen3_5`, sin informacion sobre numero de capas, atencion, uso de MoE, datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas del modelo base en este repositorio.

Lo que si se documenta es la configuracion de ejecucion: ExLlamaV3 1.5.1 sobre Windows con Python 3.11 y PyTorch 2.8.0+cu128, paralelismo tensorial nativo, presupuestos de VRAM de 21 GiB por GPU, cache KV de 4 bits, MTP (prediccion multi-token) con presupuesto 4, contexto de 262.144 tokens, chunk de 1024, cache recurrente en CPU de 4 GiB, batch 1, decodificacion greedy y modo de pensamiento desactivado. El comportamiento de contexto largo se apoya en compactacion automatica: durante la sesion medida, una compactacion redujo la entrada de 233.631 tokens (pico, correspondiente a la propia peticion de compactacion) a 19.663 tokens, de modo que las peticiones posteriores ya no son mediciones a contexto completo.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline declarado `text-generation` y etiqueta `conversational`).
- Codigo agentico: la receta esta etiquetada como `agentic-coding` y la sesion documentada consistio en construir un proyecto completo desde cero con un CLI agentico.
- Uso de herramientas y flujo multi-paso: la medicion extremo a extremo incluye llamadas a herramientas, ejecucion de tests, reintentos y compactacion, y el autor lo separa del tok/s de decodificacion pura precisamente por ese motivo.
- Escritura y ejecucion de pruebas: la verificacion final del proyecto generado reporta 102 tests de backend y 69 comprobaciones de navegador superados, todos escritos por el modelo.
- Manejo de contexto largo: 262.144 tokens configurados, con rendimiento medido de 64,56 tok/s entre 225.350 y 232.345 tokens de entrada, y pruebas previas a 253.276 y 253.337 tokens de entrada.
- Modo de pensamiento (thinking) disponible pero desactivado en la receta medida.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponibles; el autor indica que el benchmark es solo texto.

## Casos de uso

- Desarrollo de aplicaciones completas con agentes: la receta demuestra un ciclo real de escritura de codigo, ejecucion de tests, correccion de fallos y reintentos en una sesion persistente de CLI, con 50,74 tok/s extremo a extremo incluyendo toda la sobrecarga del bucle agentico.
- Asistencia de codigo en local sobre hardware de consumo: dos RTX 3090 bastan para sostener 262.144 tokens de contexto con cache KV de 4 bits, lo que permite trabajar con repositorios enteros sin depender de APIs externas.
- Revision y refactorizacion de bases de codigo extensas: entradas de mas de 225.000 tokens a 64,56 tok/s permiten pasar modulos completos o varios ficheros en una sola peticion sin trocear el contexto.
- Generacion de baterias de pruebas: el modelo produjo 102 tests de backend y 69 comprobaciones de navegador en una sola sesion, un escenario replicable para cubrir codigo heredado sin cobertura.
- Agentes de automatizacion interna con herramientas: el soporte de tool calling y multi-paso encaja en pipelines que deban consultar sistemas, ejecutar comandos y validar resultados de forma iterativa.
- Procesamiento de documentos largos con compactacion: el flujo medido incluye compactacion automatica de contexto, util para tareas de analisis sostenido donde la ventana se llena y hay que resumir el estado.
- Despliegue en estaciones de trabajo con doble GPU: el reparto de 21 GiB + 21 GiB por GPU con paralelismo tensorial sirve como plantilla para servir el modelo en un equipo local de un solo usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos son mediciones de rendimiento de la propia receta, no comparaciones de calidad del modelo:

| Medicion | Valor |
|---|---|
| Tokens generados / tiempo total | 225.790 tokens en 74,16 minutos |
| Decodificacion ponderada | 83,55 tok/s |
| Extremo a extremo (incluye herramientas, tests, reintentos y compactacion) | 50,74 tok/s |
| Decodificacion con entrada de 225.350-232.345 tokens | 64,56 tok/s |
| Pico de entrada | 233.631 tokens (peticion de compactacion) |
| Entrada tras compactacion automatica | 19.663 tokens |
| Prueba previa, 253.276 tokens de entrada en frio | 53,50 tok/s |
| Prueba previa, 253.337 tokens de entrada en caliente | 67,53 tok/s |
| Verificacion final del proyecto generado | 102 tests de backend y 69 comprobaciones de navegador superados |

El propio autor advierte que los tests fueron escritos por el modelo y que no constituyen un benchmark con conjunto de evaluacion reservado. La comparacion a una sola GPU se interrumpio a peticion del usuario tras 6 prompts completos y un septimo parcial, por lo que no se puede sostener una cifra controlada de mejora por hardware.

## Requisitos de hardware

- VRAM: 42 GiB en total, repartidos en presupuestos de 21 GiB por GPU con paralelismo tensorial nativo.
- GPU recomendadas: 2 x RTX 3090 (24 GB cada una) es la configuracion medida. No hay datos publicados para A100, H100 u otras GPU en esta receta.
- Memoria de sistema: 4 GiB adicionales de cache recurrente en CPU, mas el espacio necesario para el repositorio de 15,4 GB.
- Consumer GPU: si, en dos RTX 3090. Los ficheros de pesos (15,4 GB) cabrian en una sola GPU de 24 GB, pero la ventana de 262.144 tokens con cache KV de 4 bits es lo que motiva el reparto descrito; se trata de una inferencia a partir de los datos de la receta, no de una medicion publicada.
- Opciones de despliegue: ExLlamaV3 1.5.1 (formato EXL3) sobre Windows con Python 3.11 y PyTorch 2.8.0+cu128. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 83,55 tok/s de decodificacion ponderada y 50,74 tok/s extremo a extremo en la sesion agentica medida; 64,56 tok/s con entradas de 225.350 a 232.345 tokens; batch 1 y decodificacion greedy.
- Configuracion adicional de la receta: cache KV a 4 bits, MTP con presupuesto 4, chunk 1024, contexto 262.144, modo thinking desactivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ibrahimsait/Qwen3.8-27B-EXL3-3.5bpw-Dual3090-Recipe` | 7.669.052.656 elementos en safetensors | 262.144 tokens segun receta | EXL3 3,5 bpw | Apache 2.0 | Repositorio con 0 descargas y 0 likes; incluye receta medida |
| `Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw` | no disponible | no disponible | EXL3 3,5 bpw | Apache 2.0 (heredada) | Pesos originales sin receta de despliegue asociada |
| `Qwen/Qwen3.8-27B` | no disponible (el nombre indica 27B) | no disponible | pesos sin cuantizar (presumiblemente) | no disponible | Modelo publicado por el autor original |

No se dispone de datos de benchmarks ni de otros cuantizados del mismo modelo base en la informacion proporcionada, por lo que no es posible comparar rendimiento entre alternativas.

## Limitaciones y advertencias

- El autor declara explicitamente que no reclama ninguna evaluacion nueva de capacidades ni de seguridad del modelo.
- La correccion de las salidas depende de la tarea; no hay evaluacion con conjunto reservado.
- Las cifras de rendimiento son evidencia de una sola maquina: firmware, refrigeracion, topologia PCIe, runtime y carga de trabajo las alteran.
- El pico de 233.631 tokens de entrada corresponde a una peticion de compactacion, no a codigo normal, y tras la compactacion la entrada bajo a 19.663 tokens; las peticiones posteriores no son mediciones a contexto completo.
- Los 1M de contexto del fichero `config.yarn-1m.json` no estan validados ni activados; el maximo efectivamente probado ronda los 253.000-262.144 tokens.
- Discrepancia de nomenclatura: el nombre indica 27B pero el recuento de elementos en safetensors es de 7,67B; no esta explicada en la informacion disponible.
- Fallo de calidad conocido en la aplicacion generada: la exportacion a CSV no neutraliza texto que empieza por caracteres de formula, lo que expone a inyeccion de formulas al abrir el fichero en una hoja de calculo. Los tests escritos por el modelo pasan pero no cubren este caso.
- La aplicacion generada en el benchmark es local y mono-usuario, con vistas de tablero y recuento limitadas por paginacion y busqueda por subcadena con escaneo completo.
- No hay datos sobre sesgos, idiomas soportados, alucinacion o rendimiento fuera del ingles tecnico de programacion.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar avisos de copyright y licencia; el repositorio mantiene la licencia original y la model card upstream.
- Cambiar los ajustes de inferencia no altera los pesos almacenados; cualquier ajuste de contexto o precision afecta solo al runtime.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ibrahimsait/Qwen3.8-27B-EXL3-3.5bpw-Dual3090-Recipe
- Modelo base cuantizado: https://huggingface.co/Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw
- Modelo publicado original: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta y pruebas previas en GitHub: https://github.com/saitakarcesme/qwen38-27b-dual3090-recipe
- Receta de ejecucion dentro del repositorio: `agentic/RECIPE.md`
- Informe final con tablas de etapas, contexto y temperatura: `agentic/FINAL_REPORT.md`
- Model card upstream conservada: `UPSTREAM_MODEL_CARD.md`
- Configuracion de contexto largo incluida por trazabilidad: `config.yarn-1m.json`
- Descarga: `hf download Ibrahimsait/Qwen3.8-27B-EXL3-3.5bpw-Dual3090-Recipe --local-dir models/qwen38-dual3090`
