# infosave/Ternary-Bonsai-2-27B-cmf

## Resumen

Ternary Bonsai 2 27B — CMF Q2TP affine Prism es una conversión al formato CMF del paquete MLX `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit`, publicada por el usuario `infosave`. No se trata de un modelo entrenado desde cero, sino de un artefacto de cuantización: un único fichero de 8.247.698.536 bytes (unos 8,25 GB) con el peso `Ternary-Bonsai-2-27B-Q2TP-Affine.cmf`, pensado para ejecutarse con el runtime `cortiq` sobre Vulkan. El objetivo declarado es reproducir en hardware de consumo la calidad del modelo ternario de 27B de Prism ML mediante almacenamiento Q2TP de tipo dtype16, el operador obligatorio `q2tp_affine` y transformadas de Hadamard normalizadas con signo.

La relevancia del proyecto es de ingeniería más que de modelado: demuestra que una cuantización ternaria de aproximadamente 2 bits puede mantener la fidelidad respecto a la referencia CUDA oficial de Prism dentro de una tolerancia de 0,00027 nats por token en un corpus congelado mixto de inglés, ruso y código. El autor insiste en que la comprobación es una verificación de correspondencia numérica, no un benchmark universal, y que el perfil requiere kernels específicos: un binario estándar de `cortiq` 0.6.8 no implementa el perfil y debe rechazar el modelo en lugar de decodificarlo silenciosamente como Q2TP ordinario.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, se distribuye bajo licencia Apache 2.0 para el modelo y está etiquetado para texto en inglés y ruso. La model card advierte explícitamente de que se trata de un release solo de generación de texto: los tensores de visión se conservan por trazabilidad, pero la fusión imagen/texto no está implementada ni probada, por lo que no debe considerarse un VLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; los registros del contenedor incluyen componentes GDN, normalizacion, tokenizer y tensores de vision heredados del modelo base MLX |
| Parametros totales | 27B segun la denominacion comercial del modelo; cifra exacta no disponible |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria Q2TP affine (almacenamiento CMF dtype16 con operador obligatorio `q2tp_affine` y transformadas de Hadamard normalizadas con signo). Las capas auxiliares, GDN, normalizacion, tokenizer y vision conservan su precision declarada original |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 (modelo). El runtime CMF tiene atribucion y licencia separadas; se debe conservar el bundle completo de `licenses/` |
| Formato de pesos | CMF (`Ternary-Bonsai-2-27B-Q2TP-Affine.cmf`, 8.247.698.536 bytes, SHA-256 `fb0f1a9cdb0434bc9ce50eb6473bc2ca4a71d6994ad61314bbd7e2f11c4e29e8`); origen MLX en safetensors de 8.595.477.990 bytes |

## Arquitectura y entrenamiento

No hay informacion sobre el proceso de entrenamiento en los materiales proporcionados: no se indica numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que si se documenta es la naturaleza del artefacto publicado. Se trata de una conversion de pesos, no de un entrenamiento: el origen es el `model.safetensors` de `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit` en la revision `3f926b415992eaa2ae9dd7b573706494d6bbf787`, con SHA-256 `130de5925082c168b7866b2e91b52e44abbafc99017e3ca352b77b5b55a269ed`.

La innovacion tecnica reside en el empaquetado y en el runtime. El fichero no es un volcado uniforme de dos bits: los registros auxiliares, GDN, de normalizacion, del tokenizer y de vision mantienen su precision y su rol declarados. La decodificacion exige el operador `q2tp_affine` y transformadas de Hadamard normalizadas con signo, descritas como parte del contrato del modelo. Un lector antiguo debe rechazar esas caracteristicas en lugar de interpretarlas como Q2TP ordinario. El oraculo experimental dtype17/`q2tp_t` no forma parte de este release. La receta de ejecucion requiere compilar un runtime a partir de la base publica fijada mas un parche minimo (SHA-256 `e6cd6a60149a8be764a323ab1f968668b524b36ec35bc1a193fcfb5218f669be`), sobre Rust estable 1.98.1 y Vulkan.

## Capacidades

- Generacion de texto en ingles y ruso, incluidas explicaciones bilingues segun las comprobaciones deterministas publicadas.
- Salida estructurada: la verificacion del autor produce exactamente `{"city":"Казань","count":3}` ante una instruccion de JSON estricto, con decodificacion greedy y semilla fija.
- Aritmetica basica: se reporta una comprobacion determinista con resultado `888`.
- Seguimiento de contexto factual: se reporta una comprobacion con respuesta `5` sobre un contexto dado.
- Generacion de codigo a nivel de forma: se menciona una comprobacion de estructura de funcion Python, sin garantia de correccion funcional.
- Modo sin pensamiento (`--no-think`) validado de forma determinista; no se reclama calidad alguna para el modo de razonamiento extendido.
- Ejecucion en GPU via Vulkan/wgpu y verificacion en CPU; soporte de comprobacion de integridad del fichero con `cortiq verify`.
- No implementa tool calling ni function calling, ni capacidades de agente, ni fusion imagen/texto. La model card no reclama ninguna de ellas.

## Casos de uso

- Despliegue local en GPU de consumo: el fichero ocupa 8,25 GB y se ha validado en una RTX 4090 de 24 GB con backend Vulkan, lo que permite ejecutar un modelo de 27B ternario en una sola tarjeta sin depender de CUDA ni de memoria HBM.
- Generacion de JSON estricto en pipelines de datos: la verificacion reproducida con instrucciones de salida JSON y `--greedy` lo hace util para extraccion de campos con formato fijo en entornos donde la salida debe ser parseable sin postprocesado.
- Asistencia bilingue ingles-ruso: al estar etiquetado para ambos idiomas y validado con prompts que mezclan ruso y JSON, encaja en tareas de traduccion, resumen o normalizacion de texto entre esos dos idiomas.
- Validacion de pipelines de cuantizacion: sirve como caso de prueba de extremo a extremo para verificar que un runtime CMF implementa correctamente el operador `q2tp_affine` y las transformadas de Hadamard, comparando NLL y PPL contra la referencia CUDA de Prism.
- Inferencia en entornos aislados o sin conectividad: el modelo no requiere token de HuggingFace y el runtime se compila desde fuente fijada, lo que facilita despliegues on-premise con cadena de suministro controlada.
- Investigacion sobre representaciones ternarias: el par de sistemas documentado (Q2TP ordinario frente a Q2TP affine) ofrece un punto de comparacion reproducible para estudiar el impacto del operador affine en la fidelidad de una cuantizacion de 2 bits.
- Verificacion de integridad en produccion: el flujo recomendado incluye `sha256sum` sobre el fichero descargado y `cortiq verify`, util como paso previo en canalizaciones automatizadas de artefactos de modelo.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a una comprobacion de correspondencia sobre un corpus congelado mixto de ingles, ruso y codigo (SHA-256 `181716ce3f0a71b94f7d5d4428232c241b88f3e26d68f4ed50a191506ddb78b5`), tokenizado en 1.122 IDs, con dos reinicios independientes de 512 entradas y puntuacion sobre los objetivos 1..1024. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar.

| Sistema | NLL media | PPL | Resultado |
|---|---:|---:|---|
| Referencia oficial Prism PQ2 CUDA | 1,81274952826 | 6,12727139849 | top-1 603/1024 |
| CMF affine CPU | 1,812992284 | 6,128759009 | +0,000242756 nats/token |
| CMF affine Vulkan | 1,813015751 | 6,128902833 | +0,000266223; supera la puerta principal |
| Comparacion CMF Q2TP ordinario | 1,886951899 | 6,599222896 | +0,074202371; fuera de la puerta de +0,05 |

Medicion en hardware, sobre la fuente runtime4 aceptada y una RTX 4090 de 24 GB:

| Metrica | Valor |
|---|---|
| Prefill | 8,5 tok/s |
| TTFT | 6,88 s |
| Decodificacion en caliente | 5,2 tok/s |

El autor advierte de que la cifra de 5,2 tok/s corresponde a la medicion de runtime4 y no es una afirmacion de velocidad del port limpio, y que no es comparable con los 90,4 tok/s de la referencia CUDA de Prism. El runtime usa una ruta Prism conservadora por operacion y cesion de recurrencia/estado a CPU.

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 8,25 GB; con estados de recurrencia y buffers de ejecucion cabe holgadamente en una GPU de 24 GB segun la validacion en RTX 4090.
- GPU validadas: NVIDIA RTX 4090 de 24 GB con Vulkan y `wgpu`. No se documentan pruebas en A100, H100 ni otras GPUs.
- GPU de consumo: si, cabe en una RTX 4090. No hay datos para tarjetas de 8, 12 o 16 GB; dado el tamano del fichero, 12 GB seria el minimo teorico ajustado y no esta verificado.
- Ejecucion en CPU: contemplada de forma explicita, con el flujo de comparacion "CMF affine CPU" y la recomendacion de omitir las variables de GPU solo para comprobaciones intencionadas en CPU.
- Despliegue: runtime `cortiq` compilado desde fuente (Rust/Cargo estable 1.98.1, `libvulkan1` y `vulkan-tools` en Linux). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI; el perfil `q2tp_affine` es especifico de `cortiq` y un binario publico 0.6.8 no lo implementa.
- Variables de entorno validadas: `XDG_RUNTIME_DIR=/tmp`, `WGPU_BACKEND=vulkan`, `CMF_GPU=wgpu`, `CMF_Q2TP_GPU=1`, `CMF_GPU_PROBE=0`, `CMF_MTP=0`.
- Latencia y throughput: 8,5 tok/s de prefill, 6,88 s de TTFT y 5,2 tok/s de decodificacion en caliente en RTX 4090, con la salvedad metodologica indicada en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `infosave/Ternary-Bonsai-2-27B-cmf` | 27B (denominacion) | no disponible | CMF Q2TP affine, 8,25 GB | apache-2.0 | Publico en HuggingFace; runtime compilado desde fuente |
| `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit` | 27B (denominacion) | no disponible | MLX safetensors, 8,60 GB | no disponible en la informacion proporcionada | Publico en HuggingFace; revision fijada por el conversor |
| Referencia Prism PQ2 CUDA | 27B (denominacion) | no disponible | no disponible | no disponible | Referencia de calidad citada; no se enlaza repositorio |
| Q2TP CMF ordinario (comparacion interna) | 27B (denominacion) | no disponible | CMF Q2TP sin affine | no disponible | Solo como comparacion experimental en la model card |

La model card indica ademas que el aviso legal del upstream identifica "Qwen3.8-27B" como base con licencia Apache, dato que aparece truncado en el texto disponible y que conviene verificar en el `NOTICE.txt` original.

## Limitaciones y advertencias

- Ambito restringido a generacion de texto: los tensores de vision se conservan solo por trazabilidad y la fusion imagen/texto no esta implementada ni probada. No es un release VLM.
- Requiere un runtime no estandar: el binario publico de `cortiq` 0.6.8 no implementa `q2tp_affine` ni las transformadas de Hadamard exigidas. Es necesario compilar desde la fuente fijada mas el parche indicado.
- Riesgo de decodificacion silenciosa incorrecta: el autor exige que los lectores antiguos rechacen las caracteristicas affine/Hadamard en lugar de interpretarlas como Q2TP ordinario, lo que implica un riesgo real de resultados invalidos si se usa una herramienta no compatible.
- Ausencia de benchmarks estandar: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de contexto largo, entrenamiento o modo de pensamiento. La unica evidencia es una comprobacion de correspondencia y varias pruebas deterministas.
- Cobertura idiomatica limitada: solo ingles y ruso. No hay soporte declarado de castellano ni de otros idiomas.
- Longitud de contexto desconocida: no se publica la ventana soportada, lo que impide planificar cargas con entradas largas.
- Fecha de creacion inusualmente futura en los metadatos (2026-09-19) y ausencia total de adopcion (0 descargas, 0 likes), lo que reduce la validacion externa disponible.
- Atribucion multiple: el modelo y el runtime tienen licencias separadas. Es obligatorio conservar `licenses/` completo, incluidos el `LICENSE` y `NOTICE.txt` del upstream, el aviso MIT del runtime MLX y `LICENSE`, `NOTICE` y `PATENTS.md` de CMF.
- Riesgo de alucinacion no cuantificado: no se publican tasas de error factual ni evaluaciones de sesgo. Las comprobaciones deterministas citadas no permiten extrapolar comportamiento en produccion.
- El aviso del upstream que identifica la base como Qwen3.8-27B aparece truncado; conviene revisar los terminos completos antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosave/Ternary-Bonsai-2-27B-cmf
- Fichero de pesos directo: https://huggingface.co/infosave/Ternary-Bonsai-2-27B-cmf/resolve/main/Ternary-Bonsai-2-27B-Q2TP-Affine.cmf
- Modelo base MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Revision fijada del modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit/tree/3f926b415992eaa2ae9dd7b573706494d6bbf787
- Repositorio del runtime CMF: https://github.com/infosave2007/cmf
- La busqueda web realizada no devolvio enlaces adicionales relevantes al modelo; los resultados obtenidos correspondian a tramites de la Seguridad Social y no guardan relacion con esta ficha.
