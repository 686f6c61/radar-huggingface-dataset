# simaai/Qwen3.5-9B-DFlash-RTN-INT8-Safetensors

## Resumen

El modelo `simaai/Qwen3.5-9B-DFlash-RTN-INT8-Safetensors` es un checkpoint borrador (*draft*) para decodificacion especulativa, cuantizado a INT8, publicado por simaai. Deriva del borrador en BF16 `z-lab/Qwen3.5-9B-DFlash` y esta preparado especificamente para la compilacion con LLiMa, el stack de SiMa.ai. No es un modelo de generacion de texto autonomo: la propia model card declara `inference: false` y su funcion es proponer tokens candidatos que un modelo objetivo verifica en paralelo.

El artefacto contiene 1.291.904.512 parametros segun el recuento de safetensors (~1,29 mil millones) y ocupa 2,6 GB en el repositorio. La cuantizacion se aplica a las 43 capas lineales del borrador (proyecciones Q/K/V/O de atencion, gate/up/down del MLP y la capa `fc` de fusion de contexto) mediante round-to-nearest simetrico por canal de salida, sin calibracion ni cuantizacion de activaciones; las normalizaciones y sesgos se conservan en BF16.

Su relevancia es instrumental: forma parte del flujo de modelos pre-cuantizados de SiMa.ai y debe combinarse con el objetivo `simaai/Qwen3.5-9B-Autoround-Safetensors`. El valor practico esta en reducir el coste por token del objetivo de 9B mediante decodificacion especulativa, a cambio de cargar un borrador de solo ~1,29 mil millones de parametros. El autor advierte de que la compilacion en LLiMa, la tasa de aceptacion del borrador, la calidad de salida y el rendimiento en tiempo de ejecucion no han sido validados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; borrador de decodificacion especulativa derivado de `z-lab/Qwen3.5-9B-DFlash`, con proyecciones de atencion Q/K/V/O, MLP con compuerta (gate/up/down) y una capa de fusion de contexto (`fc`) |
| Parametros totales | 1.291.904.512 (≈1,29 mil millones) segun safetensors |
| Parametros activos | no aplica: modelo denso, no MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 RTN simetrico por canal de salida en 43 capas lineales; BF16 en parametros de normalizacion y sesgos; sin cuantizacion de activaciones ni agrupacion de escalas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` en modo `pack-quantized`; requiere codigo personalizado (`custom_code`) |
| Modelo base | `z-lab/Qwen3.5-9B-DFlash` (borrador BF16) |
| Modelo objetivo compatible | `simaai/Qwen3.5-9B-Autoround-Safetensors` |
| Calibracion | ninguna: la cuantizacion observa solo pesos y no requiere forward pass |
| Tamano del repositorio | 2,6 GB |
| Archivos incluidos | `model.safetensors`, `config.json`, `quantize.py`, `quantize.py.sha256`, `versions.txt`, `dependency_sources.json` |
| Modo de inferencia | no soportado de forma autonoma (`inference: false`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna completa del borrador. Lo que si precisa la model card es el conjunto de capas cuantizadas: 43 capas lineales que incluyen la `fc` de fusion de contexto, las proyecciones de atencion Q, K, V y salida, y las proyecciones gate, up y down del MLP. Ese repertorio es coherente con un cabezal borrador de tipo transformer con MLP con compuerta, aunque la model card no especifica el numero de bloques ni la dimension oculta. Tampoco se documentan los embeddings de entrada ni la cabeza de salida, que quedan deliberadamente fuera de este checkpoint y deben aportarse desde el objetivo correspondiente.

No hay datos de entrenamiento en el material proporcionado: no se indica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. El proceso aplicado aqui es exclusivamente de posentrenamiento y compresion: cuantizacion round-to-nearest simetrica por canal de salida de los pesos, con escalas obtenidas por observacion min/max (una escala por fila de salida), sin calibracion, sin agrupacion y sin cuantizacion de activaciones. Los parametros de normalizacion y los sesgos se mantienen en BF16. El resultado se almacena en safetensors con metadatos de `compressed-tensors` y se reproduce con un script (`quantize.py`) que funciona en CPU y no necesita codigo de modelado de Transformers ni GPU.

## Capacidades

- No es un modelo generativo autonomo: la model card declara `inference: false` y lo define explicitamente como borrador de decodificacion especulativa.
- Proposicion de tokens candidatos: su funcion es generar borradores de tokens que el modelo objetivo verifica despues en paralelo, acelerando la decodificacion del objetivo de 9B.
- Cobertura de compresion: 43 capas lineales cuantizadas a INT8, incluyendo la capa de fusion de contexto, las proyecciones Q/K/V/O y las proyecciones gate/up/down del MLP.
- No incluye embeddings de entrada ni cabeza de salida; el runtime o compilador debe suministrarlos desde el checkpoint objetivo compatible.
- Integracion con el stack LLiMa de SiMa.ai: el artefacto esta preparado para su compilacion, y se ha superado la validacion del cargador LLiMa para todas las capas cuantizadas.
- Tool calling, function calling, uso en agentes, razonamiento multi-paso, vision y audio: no disponibles; no se documentan en la informacion proporcionada.
- Capacidades multilingues: no disponibles; dependerian del modelo objetivo, no del borrador.
- Modo de pensamiento (*thinking*), decodificacion especulativa configurable u otras capacidades especiales: no disponibles en la documentacion del artefacto.

## Casos de uso

- Aceleracion de inferencia del objetivo de 9B en LLiMa: el borrador propone varios tokens candidatos que el objetivo `simaai/Qwen3.5-9B-Autoround-Safetensors` verifica en una sola pasada; al estar cuantizado a INT8 por canal, el coste adicional de memoria es de aproximadamente 1,2 GiB de pesos.
- Despliegue en hardware de borde con memoria restringida: al ocupar el borrador un orden de magnitud menos que un objetivo de 9B, la pareja borrador + objetivo puede compilarse junta en aceleradores con presupuesto de memoria ajustado, algo inviable cargando dos modelos de 9B.
- Serving de baja latencia para asistentes conversacionales: la decodificacion especulativa ataca directamente el tiempo por token, que es la metrica dominante en interacciones multi-turno; el borrador es la pieza que habilita esa ganancia.
- Reduccion de coste por token en servicios con alto QPS: si la tasa de aceptacion es razonable, se necesitan menos replicas del objetivo para el mismo caudal de tokens por segundo, lo que reduce el coste de GPU por peticion.
- Artefacto de referencia para el pipeline de compilacion de SiMa.ai: el repositorio incluye `quantize.py`, `quantize.py.sha256`, `versions.txt` y `dependency_sources.json`, lo que permite reproducir el proceso exacto y auditar la procedencia de las dependencias usadas.
- Reproduccion y validacion en CPU: la cuantizacion puede repetirse sin GPU con `python quantize.py --model-path ... --output-dir ... --threads 8`, util para entornos de CI donde no hay acelerador disponible.
- Investigacion en decodificacion especulativa: sirve como punto de partida para estudiar como afecta una politica de cuantizacion concreta (RTN simetrico por canal, sin calibracion) a la tasa de aceptacion del borrador y a la calidad final, comparandola con politicas con calibracion.
- Integracion en flujos de optimizacion de modelos sobre `compressed-tensors`: al seguir el formato `pack-quantized` con la configuracion en `config.json`, encaja en pipelines que ya consumen ese formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y advierte expresamente de que la tasa de aceptacion del borrador y el rendimiento en tiempo de ejecucion no han sido validados.

Las unicas comprobaciones documentadas son de integridad y exportacion, no de rendimiento:

| Comprobacion | Resultado declarado |
|---|---|
| Exportacion de pesos lineales INT8 | Correcta en las 43 capas |
| Formas de las escalas por canal | Correctas |
| Escalas finitas y positivas | Verificadas |
| Carga en el cargador LLiMa | Validada para todas las capas cuantizadas; pesos INT8 y escalas desempaquetados coinciden con la exportacion previa |
| Preservacion de la configuracion original | Verificada |
| Tensores retenidos en BF16 | Coinciden byte a byte con el origen |
| Compilacion en LLiMa | No validada |
| Tasa de aceptacion del borrador | No validada |
| Calidad de salida | No validada |
| Rendimiento en tiempo de ejecucion | No validado |

## Requisitos de hardware

- Peso del borrador en INT8: los 1.291.904.512 parametros a 1 byte por parametro equivalen a unos 1,29 GB decimales (≈1,20 GiB) de pesos, mas las escalas por canal (una por fila de salida, coste marginal) y los tensores BF16 retenidos. Estimacion derivada del recuento de parametros, no validada por el autor.
- VRAM estimada para el borrador en inferencia: del orden de 1,5 a 2 GB incluyendo escalas, activaciones y buffers de ejecucion. Es una estimacion derivada, no un dato publicado.
- VRAM del sistema completo: el borrador debe coexistir con el objetivo de 9B, que en BF16 rondaria los 18 GB y en INT8 unos 9 GB, mas cache KV. El presupuesto total depende del formato del objetivo y de la longitud de contexto, dato este ultimo no disponible.
- GPU compatibles: no se documenta ninguna. El flujo declarado es la compilacion con LLiMa de SiMa.ai, orientada a aceleradores de borde, no a CUDA. La reproduccion de la cuantizacion se ejecuta en CPU y no requiere GPU.
- GPU de consumo: el borrador por si solo cabria con holgura en cualquier GPU con 4 GB o mas, pero no es funcional sin el objetivo. La pareja completa requeriria, en una estimacion orientativa, 16 GB o mas de VRAM si el objetivo se sirve cuantizado (por ejemplo RTX 4060 Ti 16 GB, RTX 4080, RTX 4090), o 24 GB o mas si el objetivo va en BF16.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI. El artefacto declara `inference: false`, requiere `custom_code` y esta pensado para el compilador/runtime LLiMa de SiMa.ai. Aunque `compressed-tensors` es un formato consumido por otros motores, el autor no valida ese uso.
- Latencia y throughput: no disponibles. No se publican tokens por segundo, tiempo por token ni factor de aceleracion respecto al objetivo sin borrador.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `simaai/Qwen3.5-9B-DFlash-RTN-INT8-Safetensors` (este) | Borrador de decodificacion especulativa | 1.291.904.512 | INT8 RTN por canal, sin calibracion | Apache 2.0 | safetensors `compressed-tensors` (`pack-quantized`) | Publicado; 0 descargas y 0 likes en el momento de la consulta |
| `z-lab/Qwen3.5-9B-DFlash` | Borrador de decodificacion especulativa (origen) | no disponible | BF16 (sin cuantizar) | no disponible | no disponible | Referenciado como modelo base |
| `simaai/Qwen3.5-9B-Autoround-Safetensors` | Modelo objetivo de 9B pre-cuantizado | no disponible | no disponible (mencionado como "Autoround") | no disponible | safetensors | Referenciado como objetivo compatible |
| Borradores publicos de otros ecosistemas (por ejemplo, familias tipo EAGLE o Medusa) | Borrador de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento, contexto ni tasa de aceptacion de ninguno de los modelos comparados, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: la model card declara `inference: false`. Usarlo de forma aislada para generar texto no es su proposito y probablemente falle.
- Dependencia estricta del objetivo: necesita un objetivo compatible, y el runtime o compilador debe aportar los embeddings de entrada y la cabeza de salida, que no estan incluidos ni cuantizados en este repositorio.
- Validacion incompleta: la compilacion en LLiMa, la tasa de aceptacion, la calidad de salida y el rendimiento en ejecucion no han sido validados por el autor.
- Sin equivalencia bit a bit: se usa la misma politica INT8 por canal que el flujo del compilador, pero no se ha demostrado equivalencia exacta con la cuantizacion hecha en el lado del compilador. Copiar el checkpoint no garantiza reproducir el resultado del compilador.
- Cuantizacion sin calibracion: solo se observan los pesos, no las activaciones. Esto simplifica el proceso, pero puede alejar los resultados de tecnicas con calibracion de activaciones en terminos de precision.
- Reproducibilidad limitada: la model card reconoce que no se registro la revision inmutable de Hugging Face del checkpoint de origen, por lo que la reproducibilidad exacta del proceso no esta garantizada.
- Dependencias fragiles: la reproduccion requiere Python 3.12 y versiones de dependencias registradas en `versions.txt` y `dependency_sources.json` que eran builds de desarrollo y podrian no estar disponibles en PyPI.
- Codigo personalizado: el uso requiere `custom_code` y confiar en la implementacion remota del modelado.
- Ausencia de evidencia comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados, lo que impide estimar su comportamiento real en produccion.
- Idiomas y contexto: no disponibles. Cualquier limitacion linguistica o de ventana de contexto vendra heredada del modelo objetivo y no se documenta aqui.
- Sesgos y alucinacion: no evaluados en este artefacto. Al ser un borrador verificado por el objetivo, la calidad final depende en primera instancia del objetivo, pero un borrador con baja tasa de aceptacion degrada la latencia sin mejorar la correccion.
- Licencia: el artefacto se publica bajo Apache 2.0, lo que permite uso comercial del mismo. Conviene verificar por separado la licencia del checkpoint base `z-lab/Qwen3.5-9B-DFlash` y la del objetivo `simaai/Qwen3.5-9B-Autoround-Safetensors`, que no se detallan en la informacion proporcionada.
- Discrepancia de tamano: el repositorio ocupa 2,6 GB, muy por encima de la estimacion teorica de ~1,29 GB para 1,29 mil millones de parametros en INT8. La model card no explica esta diferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simaai/Qwen3.5-9B-DFlash-RTN-INT8-Safetensors
- Modelo base (borrador BF16): https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
- Modelo objetivo pre-cuantizado compatible: https://huggingface.co/simaai/Qwen3.5-9B-Autoround-Safetensors
- Coleccion de modelos pre-cuantizados de SiMa.ai: https://huggingface.co/collections/simaai/pre-quantized-models-6a5623ca69f6a9ed0a41d3df
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
