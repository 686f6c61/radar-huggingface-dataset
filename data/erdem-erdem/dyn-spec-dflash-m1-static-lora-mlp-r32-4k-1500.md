# erdem-erdem/dyn-spec-dflash-m1-static-lora-mlp-r32-4k-1500

## Resumen

El repositorio `erdem-erdem/dyn-spec-dflash-m1-static-lora-mlp-r32-4k-1500` no contiene un modelo de lenguaje generativo al uso, sino un *checkpoint de entrenamiento* de un borrador (drafter) para decodificación especulativa. Lo publica el usuario erdem-erdem dentro de su proyecto `dyn-spec`, un port del generador DFlash, y corresponde a la rama de entrenamiento `fresh_lora` en su etapa de preentrenamiento. El artefacto se apoya en el drafter `z-lab/Qwen3-8B-DFlash-b16` y tiene como modelo objetivo `Qwen/Qwen3-8B`, por lo que su funcion es acelerar la inferencia de ese modelo mediante prediccion especulativa de tokens.

El contenido del repositorio es fundamentalmente un directorio de ejecucion (`run/`) con el checkpoint (`checkpoint.pt`), el estado del optimizador, los registros de metricas, tiempos, el comando de entrenamiento, un parche (`speculators.patch`) y los datos de procedencia del almacen de activaciones. El autor advierte explicitamente de que no es un bundle de servicio: la exportacion DFlash para servir el modelo "aun no esta portada". Esto implica que no puede cargarse directamente en un servidor de inferencia convencional sin trabajo adicional.

La relevancia es acotada pero tecnica: sirve como registro reproducible de un experimento de adaptacion de un drafter especulativo con LoRA (rango 32, MLP, contexto de 4k, 1500 actualizaciones, semilla 42). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano declarado es de 0.0 GB, lo que sugiere que los pesos pueden no estar materializados o que el indice no los refleja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer como drafter de decodificacion especulativa (DFlash) sobre Qwen3-8B; adaptador LoRA de rango 32 sobre capas MLP |
| Parametros totales | no disponible (el adaptador LoRA r32 sobre MLP no se cuantifica en la model card; el modelo objetivo Qwen3-8B tiene 8.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4k (indicado en el nombre del artefacto: `4k`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es un bundle de servicio |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado sobre las capas MLP de un drafter DFlash, que a su vez se inicializa desde `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`). El modelo objetivo es `Qwen/Qwen3-8B`. La etapa registrada es `pretraining` dentro de la rama `fresh_lora`, con 1500 actualizaciones, semilla 42 y un SHA de Git concreto (`d677c94aa1a23cb181da345b21d6bfb296209a89`). El contexto de entrenamiento es de 4k tokens y el checkpoint incluye el estado del optimizador, lo que permite reanudar el entrenamiento.

El entrenamiento se alimenta de un almacen de activaciones externo, `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`, cuya identidad, registro del extractor, procedencia del lanzamiento de vLLM y registros de relleno se guardan en `provenance/store/`. La validacion se hace sobre 200 filas fijas, con un LoRA distinto por fila, midiendo `full_acc` y la longitud media de aceptacion `τ (eal)`. No se documentan en la model card la composicion del dataset, el numero total de tokens de entrenamiento ni si hubo RLHF o DPO; el autor remite a los resultados de evaluacion offline en `run/offline_eval/` (reproduccion, coeficientes M4, donantes M7, similitud D13 y coste D14).

## Capacidades

- Prediccion especulativa de tokens: actua como drafter para acelerar la decodificacion de `Qwen/Qwen3-8B`, proponiendo tokens que el modelo objetivo verifica.
- Adaptacion LoRA sobre capas MLP: el adaptador modifica unicamente esas capas, con rango 32.
- Entrenamiento reanudable: el checkpoint incluye estado del optimizador y el comando de entrenamiento (`train_command.txt`).
- Reproducibilidad: incluye parche (`speculators.patch`), SHA de Git, SHA256 del checkpoint y manifiesto con tamanos y hashes de cada fichero.
- Evaluacion offline integrada: metricas por fila, coeficientes y analisis de coste en `run/offline_eval/`.
- No soporta, segun la informacion disponible: generacion de texto autonoma, tool calling, agentes, vision, audio ni capacidades multilingues declaradas.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B: el drafter se usaria junto al modelo objetivo para reducir el coste por token generado mediante verificacion especulativa; es adecuado porque esta entrenado especificamente contra ese modelo y ese contexto de 4k.
- Investigacion en decodificacion especulativa: sirve como punto de partida reproducible (semilla, SHA, comando) para comparar variantes de drafter y estrategias de aceptacion.
- Reproduccion de experimentos: el repositorio incluye `train_command.txt`, `speculators.patch` y `MANIFEST.json`, lo que permite reconstruir la ejecucion y verificar la integridad de los ficheros.
- Reanudacion de entrenamiento: al conservar el estado del optimizador, puede retomarse desde la actualizacion 1500 para continuar el ajuste del adaptador.
- Auditoria de procedencia de datos: `provenance/store/` documenta el almacen de activaciones, el extractor y el lanzamiento de vLLM, util para trazar el origen de los datos de entrenamiento.
- Estudio de adaptadores de bajo rango: el LoRA r32 sobre MLP con contexto 4k permite analizar el equilibrio entre capacidad del drafter y coste de memoria.
- No es adecuado, tal como se publica, para despliegue en produccion: el autor indica que la exportacion DFlash para servir aun no esta portada.

## Benchmarks y rendimiento

Los unicos datos publicados son la validacion interna sobre 200 filas fijas, con un LoRA por fila y metrica `full_acc`:

| Actualizacion | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5294 | 7.251 | 0.3430 | 0.5748 | 0.6837 | 0.5161 |

El incremento entre la actualizacion 0 y la 1500 es de +0.0048 en score global y +0.143 en τ. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto no es un bundle de servicio y no se documenta el consumo del drafter ni del modelo objetivo.
- GPU recomendadas: no disponible en la model card. El modelo objetivo Qwen3-8B requiere, en terminos generales, GPU con al menos 16-24 GB en cuantizacion de 8 o 4 bits, pero este dato no lo aporta el autor.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica que la exportacion DFlash para servir no esta portada; no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El unico uso documentado es la reanudacion del entrenamiento con el checkpoint PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-m1-static-lora-mlp-r32-4k-1500 | Drafter LoRA para decodificacion especulativa | no disponible (LoRA r32 sobre MLP) | 4k | no disponible | Checkpoint de entrenamiento, no servible |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Modelo base del que parte este adaptador |
| Qwen/Qwen3-8B | LLM generativo objetivo | 8.000 millones | no disponible en esta ficha | no disponible | Modelo de produccion |

No se dispone de datos de rendimiento comparables entre estos artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo servible: el autor declara explicitamente que es un checkpoint de entrenamiento y que la exportacion DFlash para servicio no esta portada.
- Licencia no declarada: no se especifica licencia, por lo que no puede asumirse uso comercial permitido.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica.
- Sin benchmarks estandar: solo hay validacion interna sobre 200 filas fijas, insuficiente para extrapolar calidad general.
- Mejora marginal: el score pasa de 0.5246 a 0.5294 tras 1500 actualizaciones, un incremento de 0.0048 que debe interpretarse con cautela.
- Dependencia estricta del modelo objetivo: el drafter esta entrenado contra Qwen3-8B y un contexto de 4k; usarlo con otro modelo o contexto mayor invalidaria las garantias.
- Repositorio sin traccion: 0 descargas y 0 likes, sin evidencia de validacion externa.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un drafter, los tokens propuestos se verifican contra el modelo objetivo, pero no se documenta la tasa de aceptacion en dominios fuera de validacion.
- Sesgos: no documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m1-static-lora-mlp-r32-4k-1500
- Almacen de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
