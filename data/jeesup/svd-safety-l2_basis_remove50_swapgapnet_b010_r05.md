# Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r05

## Resumen

Este checkpoint es un artefacto de investigacion, no un modelo conversacional desplegable. Se trata de `meta-llama/Llama-2-7b-chat-hf` comprimido al 50,0 % de sus parametros densos mediante Basis Sharing (tecnica presentada en ICLR 2025, que comparte bases sobre grupos de 2 capas adyacentes) y despues editado con 5 de las 10 rondas previstas de una rutina iterativa de intercambio de parametros neutral (`parameter-neutral swap`), seleccionada por la regla `swapgapnet_iter`. El resultado conserva 6.738.415.616 parametros (fraccion resultante 0,4998) y 13,5 GB de pesos en safetensors.

El problema que aborda es la perdida de comportamiento seguro inducida por la compresion SVD: la propia model card reconoce que la compresion por si sola eleva la tasa de exito de ataques y que el objetivo del estudio es cuantificar ese dano y probar reglas de recuperacion de componentes. Cada celda de la rejilla (combinacion de regla de seleccion y presupuesto) es un sujeto experimental: esta corresponde a una ronda intermedia de una ejecucion mas larga, con un presupuesto de restauracion del 1,000 % de los parametros densos (0,100 % por ronda) y 2.251 componentes restaurados frente a 2.251 descartados.

La relevancia actual es metodologica y de interpretabilidad: sirve para estudiar la relacion entre compresion, seguridad y utilidad, y para comparar reglas de seleccion de componentes. El autor advierte explicitamente que no debe tratarse como un asistente desplegable y que debe evaluarse antes de extraer conclusiones. No hay descargas ni likes registrados, el repositorio se creo y actualizo el 14 de septiembre de 2026 y no se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), comprimido con Basis Sharing (bases compartidas sobre grupos de 2 capas adyacentes, ICLR 2025) |
| Parametros totales | 6.738.415.616 (6,74 mil millones); fraccion resultante 0,4998 de los parametros densos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama-2-7b-chat usa 4096 tokens como valor de referencia |
| Tipos de cuantizacion | No disponible; solo se publican pesos safetensors. No se han publicado variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la model card; el modelo base esta optimizado principalmente para ingles |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Regla de seleccion | `swapgapnet_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos en la ejecucion completa; 0,100 % por ronda |
| Componentes restaurados / descartados | 2.251 / 2.251 |
| Parametros intercambiados | 32.360.448 (0,50 % de los parametros de proyeccion densos) |
| Valor de intercambio | `net` (valor de insercion + valor de eliminacion del desalojo ordenado por sigma) |
| Semilla | 42 |
| Recuperacion | LoRA r=8 solo sobre los coeficientes por capa (bases congeladas, presupuesto sin cambios), 2 epocas, lr 0,0001, batch 64, dataset alpaca-cleaned |
| Tiempo de ejecucion | Ronda intermedia (5 de 10) de una ejecucion mas larga |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, RoPE y atencion causal. Sobre ese modelo base se aplica Basis Sharing, un esquema de compresion que comparte bases SVD entre grupos de 2 capas adyacentes, eliminando el 50,00 % de los parametros densos. La compresion no es un simple truncado por capa: la comparticion de bases reduce el numero de vectores singulares que deben almacenarse por grupo, lo que explica que la fraccion de parametros resultante sea 0,4998 y no exactamente 0,5.

Sobre el modelo comprimido se aplica una edicion iterativa de parametros: en cada ronda se seleccionan componentes candidatos mediante la regla `swapgapnet_iter` y se realiza un intercambio neutral de parametros (`parameter-neutral swap`) con valor `net`, calculado como la suma del valor de insercion y el valor de eliminacion del desalojo ordenado por sigma. La ejecucion completa contempla 10 rondas con un presupuesto total del 1,0 % de los parametros densos, de las cuales este checkpoint corresponde a 5 rondas (0,5 % efectivo, 32.360.448 parametros intercambiados). Finalmente se aplica una recuperacion ligera con LoRA de rango 8 restringida a los coeficientes por capa, manteniendo las bases congeladas y sin alterar el presupuesto de parametros; el entrenamiento LoRA usa 2 epocas con lr 0,0001, batch 64 y el dataset alpaca-cleaned.

No se documentan en la informacion disponible el numero total de tokens de entrenamiento del modelo base, la composicion completa del dataset, ni si hubo fases de RLHF o DPO mas alla del alineamiento propio de Llama-2-7b-chat. La innovacion tecnica declarada es doble: la compresion por comparticion de bases y la regla de seleccion de componentes para reparar comportamiento de seguridad degradado.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad base de Llama-2-7b-chat, aunque el autor advierte que el checkpoint no es un asistente de proposito general.
- Razonamiento y respuesta a instrucciones: procedente del modelo base y de la recuperacion LoRA sobre alpaca-cleaned; no se han publicado evaluaciones de calidad de generacion.
- Capacidad multilingue: no documentada; el modelo base esta orientado principalmente al ingles.
- Tool calling / function calling: no documentado y no declarado como capacidad soportada.
- Soporte de agentes y razonamiento multi-paso: no documentado; no se recomienda su uso en bucles de agente por tratarse de un artefacto de investigacion.
- Modo de pensamiento (thinking) o vision/audio: no disponibles.
- Uso principal declarado: servir como sujeto experimental para medir el compromiso entre seguridad y utilidad bajo compresion, y para comparar reglas de seleccion de componentes dentro de una rejilla de experimentos.
- Capacidad de inferencia estandar: compatible con la pipeline `text-generation` de transformers y con text-generation-inference (etiqueta `endpoints_compatible`).

## Casos de uso

- Investigacion sobre compresion de modelos: usar este checkpoint como una celda concreta de la rejilla para comparar la regla `swapgapnet_iter` con otras reglas de seleccion bajo presupuestos equivalentes, midiendo las mismas metricas de seguridad y utilidad.
- Analisis de interpretabilidad de seguridad: estudiar que componentes concretos (2.251 restaurados frente a 2.251 descartados) son responsables de mantener la resistencia a ataques, replicando el analisis de intercambio neutral de parametros.
- Evaluacion de robustez adversarial: reproducir las mediciones de AdvBench y StrongREJECT sobre esta ronda intermedia para comprobar como evoluciona la tasa de exito de ataque a medida que se aplican mas rondas de la ejecucion completa.
- Estudio de sobre-rechazo: analizar la metrica de sobre-rechazo macro (WildGuard, 0,1353) para calibrar el coste en utilidad de las intervenciones de seguridad, comparandola con la del modelo base sin comprimir.
- Metodologia de recuperacion con LoRA: replicar el procedimiento de recuperacion con LoRA r=8 sobre coeficientes por capa para evaluar si un ajuste ligero y con presupuesto fijo recupera comportamiento sin anadir parametros.
- Validacion de tecnicas de compresion basadas en SVD: emplear el checkpoint como referencia negativa o positiva al implementar esquemas alternativos de descomposicion y comparticion de bases en transformers.
- Docencia y divulgacion tecnica: ilustrar en un curso o articulo como una intervencion aparentemente neutra en parametros altera propiedades de seguridad medibles, con numeros concretos y trazabilidad completa de la receta.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni cualquier despliegue de cara al usuario final, tal como indica el propio autor.

## Benchmarks y rendimiento

La model card solo publica metricas de seguridad, no resultados de benchmarks de conocimiento, razonamiento o codigo (MMLU, HumanEval, GSM8K y similares no estan disponibles).

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0865 |
| StrongREJECT ASR (juez HarmBench) | 0,1917 |
| Sobre-rechazo macro (WildGuard) | 0,1353 |

Los valores de ASR corresponden a la tasa de exito de ataque: cuanto mas baja, mas resistente es el modelo a peticiones daninas. No se facilitan en la informacion disponible los valores equivalentes para el modelo base sin comprimir ni para otras celdas de la rejilla, por lo que no es posible cuantificar aqui la degradacion o recuperacion relativa.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda reservar 16-18 GB para secuencias moderadas y mas si se amplia el batch.
- VRAM estimada en int8: alrededor de 7 GB de pesos (cuantizacion no publicada, requeriria conversion propia).
- VRAM estimada en int4: alrededor de 3,5-4 GB de pesos (cuantizacion no publicada, requeriria conversion propia).
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 y L40S para despliegue en servidor; RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX A6000 (48 GB) para fp16 en una sola GPU.
- Compatibilidad con GPU de consumo: si cabe en RTX 4090 y RTX 3090 en fp16, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) si se cuantiza a 4 bits, siempre que se genere la variante cuantizada.
- Opciones de despliegue: transformers con pipeline `text-generation` (soporte nativo del repositorio), text-generation-inference (etiqueta `endpoints_compatible`), y conversion manual a llama.cpp/Ollama si se genera GGUF. vLLM es viable al ser una arquitectura Llama 2 estandar, aunque no se documenta soporte explicito.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de latencia para este checkpoint.

## Comparativa con modelos similares

Los datos de contexto y licencia de los modelos de referencia son caracteristicas publicas conocidas de cada familia y no se verifican en la model card de este checkpoint.

| Modelo | Parametros | Contexto | Naturaleza | Licencia |
|---|---|---|---|---|
| svd-safety-l2_basis_remove50_swapgapnet_b010_r05 | 6,74 mil millones (0,4998 de la densidad original) | No disponible | Checkpoint de investigacion sobre seguridad y compresion | Llama 2 Community License |
| meta-llama/Llama-2-7b-chat-hf | 6,74 mil millones | 4096 tokens | Modelo conversacional alineado de proposito general | Llama 2 Community License |
| Llama-3.1-8B-Instruct | 8 mil millones | 128.000 tokens | Modelo conversacional de proposito general | Llama 3.1 Community License |
| Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.000 tokens | Modelo conversacional de proposito general | Apache 2.0 |

La diferencia fundamental no es de tamano sino de finalidad: los tres modelos de referencia estan pensados para despliegue, mientras que este checkpoint existe para medir el compromiso entre seguridad y utilidad bajo compresion. En cuanto a rendimiento, no se dispone de comparativas: solo se publican metricas de seguridad propias y no hay resultados de benchmarks estandar que permitan situarlo frente a las alternativas.

## Limitaciones y advertencias

- El propio autor declara que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat, y que la compresion por si sola incrementa la tasa de exito de ataques. No debe desplegarse como asistente.
- Es un checkpoint de una ronda intermedia (5 de 10) de una ejecucion mas larga; no representa el resultado final de la receta completa.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de veracidad ni de calidad de generacion para este checkpoint.
- Idiomas soportados no documentados; se espera un comportamiento predominantemente en ingles, con calidad degradada en otras lenguas.
- Longitud de contexto no especificada en la model card; no hay confirmacion de que la compresion preserve el comportamiento en secuencias largas.
- La compresion al 50 % de parametros densos y el intercambio de 32.360.448 parametros pueden haber alterado capacidades distintas de la seguridad, sin que existan mediciones publicadas al respecto.
- Restricciones de licencia: se aplica la Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio. Cualquier uso comercial queda sujeto a esa licencia y a las obligaciones de atribucion correspondientes ("Built with Llama 2").
- Sin cuantizaciones publicadas: para desplegarlo en hardware limitado hay que generar la conversion, lo que anade riesgo de degradacion adicional no medida.
- Zero descargas y cero likes en el momento de la ficha: no hay evidencia de validacion por parte de la comunidad.
- Las metricas de seguridad publicadas dependen de jueces automaticos concretos (HarmBench y WildGuard); no sustituyen a una evaluacion de seguridad propia antes de cualquier uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Referencia citada en la model card: Basis Sharing, ICLR 2025 (no se ha facilitado enlace en la informacion disponible)
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo ni sobre la tecnica: los unicos resultados obtenidos corresponden a paginas biograficas sobre Andrew Jackson, sin relacion con el contenido de esta ficha. No se dispone por tanto de enlaces adicionales a papers, blogs, repositorios o demos.
