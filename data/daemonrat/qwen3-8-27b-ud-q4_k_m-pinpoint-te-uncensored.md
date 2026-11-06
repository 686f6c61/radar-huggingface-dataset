# Daemonrat/Qwen3.8-27B-UD-Q4_K_M-Pinpoint-TE-Uncensored

## Resumen

Qwen3.8-27B-UD-Q4_K_M-Pinpoint-TE-Uncensored es una cuantizacion GGUF de 27.320.697.856 parametros derivada de `unsloth/Qwen3.8-27B-GGUF` (tipo `UD-Q4_K_M`), publicada por el usuario Daemonrat. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de investigacion sobre el comportamiento de rechazo (refusal): se aplica una edicion de pesos de rango 1 sobre dos tensores concretos para suprimir la direccion de rechazo del modelo base. El interes tecnico esta en el procedimiento, documentado y reproducible, no en el modelo en si.

La edicion afecta a 2 de los 866 tensores del GGUF: `blk.33.ssm_out.weight` y `blk.43.attn_output.weight`. Los 864 restantes son byte a byte identicos al base. El delta es de rango 1 hasta precision numerica, aplicado como producto externo dentro de los slices de atencion correspondientes a cabezas concretas, con una norma relativa de aproximadamente el 9 % respecto al tensor original. Ambos tensores editados se almacenan en Q8_0, lo que anade 28,5 MB al archivo respecto al base.

El modelo se distribuye bajo licencia `qwen-research` (heredada del base) y solo declara soporte para ingles. Su relevancia es acotada: sirve como caso de estudio de edicion de pesos orientada a direcciones de rechazo, con vectores, herramientas de bake/inversion y un informe de ingenieria inversa incluidos en el repositorio. El propio autor lo etiqueta como artefacto de investigacion y desaconseja su uso tras un endpoint de producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion y capas SSM (arquitectura `qwen35` en llama.cpp), con cabeza nextn/MTP en `blk.64` |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de ejecucion usa `-c 65536` |
| Tipos de cuantizacion | Base `UD-Q4_K_M`; los dos tensores editados en Q8_0 |
| Idiomas soportados | en |
| Licencia | qwen-research (heredada de `unsloth/Qwen3.8-27B-GGUF`) |
| Formato de pesos | GGUF (16,49 GB, 866 tensores) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27.320.697.856 parametros con arquitectura identificada como `qwen35` en llama.cpp, que combina capas de atencion con capas SSM (state space model). Incluye una cabeza nextn/MTP (multi-token prediction) en el bloque 64, lo que permite usar decodificacion especulativa con `--spec-type draft-mtp`. El GGUF incorpora su propia plantilla de chat.

Sobre ese base no hay entrenamiento adicional: la publicacion aplica una edicion de pesos post-hoc. El delta se calcula como `W[:, h·hd : (h+1)·hd] += c_h · u ⊗ v_h`, donde `u` es denso sobre la dimension de entrada (las 100 entradas de mayor magnitud concentran solo el 9-12 % de su norma, lo que indica una direccion y no una neurona aislada) y `v` es exactamente cero fuera del slice de salida de su cabeza. En `blk.33` se editan 16 de 48 cabezas (dims 2048-2175) con `c = 8.379`; en `blk.43` se editan las cabezas 3, 7 y 9 de 24 con `c = 5.775 / 4.194 / 3.811`. La similitud coseno entre `v_33` y `v_43` es 0.665, de modo que ambos puntos actuan como amplificador en dos etapas de la misma direccion. La direccion decodifica, bajo logit lens, a `ethical / unethical / illegal / knowingly / compliance / harmful`, es decir, el eje de veredicto de politica del propio modelo. Las constantes `c` son 1.31x (capa 33) y 1.44x (capa 43) la norma de operador `s₁` del delta. No se documenta RLHF, DPO ni composicion del dataset de entrenamiento del base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del base Qwen3.8-27B.
- Razonamiento y respuesta multi-turno con contexto largo (el ejemplo de despliegue configura 65536 tokens).
- Decodificacion especulativa mediante la cabeza MTP incluida (`--spec-type draft-mtp`).
- Modo de razonamiento desactivable (`--reasoning off` en llama-server).
- Edicion reproducible e invertible: el repositorio incluye `tools/bake_rank1.py` para reaplicar, invertir o redosificar la edicion sobre cualquier GGUF `qwen35`.
- Verificacion de integridad: `tools/refusal_edit.py` comprueba el numero de tensores cambiados y la proporcion de rango 1.
- Bateria de evaluacion de rechazo incluida (`tools/refusal_test.py`, 24 peticiones daninas + 12 benignas pero delicadas).
- Supresion de rechazo en la mayoria de peticiones daninas medidas (23 de 24 en la prueba del autor).
- No se declaran capacidades de vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

- Investigacion sobre direcciones de rechazo: el modelo sirve como artefacto controlado para estudiar como una direccion de politica puede aislarse, medirse con logit lens y modificarse con una edicion de rango 1 verificable.
- Reproduccion de experimentos de edicion de pesos: `tools/bake_rank1.py` permite reaplicar la misma edicion sobre otros GGUF `qwen35` y comparar resultados con el signo invertido (`--sign=-1`) como control.
- Auditoria de seguridad de modelos abiertos: permite cuantificar cuanto rechazo depende de una unica direccion de bajo rango y cuanto es robusto, informacion util para disenar salvaguardas mas resilientes.
- Analisis de transferencia entre cuantizaciones: el autor verifica que la edicion recuperada de un base IQ2_XS se reproduce sobre un base K-quant distinto, lo que permite estudiar la estabilidad de los deltas bajo cuantizacion.
- Estudio de mecanismos alternativos: el informe compara esta edicion con la de `0bserverx/Qwen3.8-27B-Heretic`, cuyo delta en los mismos tensores es denso (proporcion de rango 1 del 1,5-1,6 %, coseno de `u` de -0,25/-0,12), lo que permite contrastar dos mecanismos distintos con el mismo objetivo.
- Evaluacion de degradacion: la bateria de 24+12 peticiones y las metricas de longitud media y bucles de 3-gramas permiten medir el coste en calidad de la edicion (respuestas un 16 % mas cortas en peticiones daninas, cola menos estructurada).
- Docencia y divulgacion tecnica: el `REPORT.md` documenta el proceso completo de ingenieria inversa por diff binario, descomposicion por cabezas, SVD y cotas, como material de referencia.

## Benchmarks y rendimiento

El autor publica una evaluacion propia de comportamiento de rechazo, no de capacidad. 24 peticiones daninas + 12 benignas pero delicadas, decodificacion greedy, una semilla, razonamiento desactivado, rechazo detectado por coincidencia de frases en los primeros 400 caracteres. La muestra es pequena y el propio autor advierte que debe interpretarse como direccion, no como tasa.

| Modelo | Daninas rechazadas | Benignas-delicadas rechazadas | Palabras medias (daninas) | Peor bucle de 3-gramas |
|---|---|---|---|---|
| `unsloth UD-Q4_K_M` (stock) | 24/24 (100 %) | 0/12 | 76,0 | 0,01 |
| Este archivo (`+c·u⊗v`) | 1/24 (4 %) | 0/12 | 63,8 | 0,04 |
| `−c·u⊗v` (invertido, no publicado) | 24/24 | 3/12 (25 %) | 78,0 | 0,01 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, evaluacion de contexto largo o deriva multi-turno) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 16,49 GB; con overhead de contexto y cache KV hay que prever margen adicional, aunque la cifra exacta no esta disponible.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del archivo, requiere GPUs con 24 GB o mas para cargar el modelo completo en VRAM; el ejemplo del autor usa `-ngl 99` (todas las capas en GPU).
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (por ejemplo RTX 3090/4090) siempre que se ajuste la longitud de contexto; no se confirma en la informacion disponible.
- Opciones de despliegue: `llama-server` de llama.cpp (comando documentado en la model card). No se mencionan vLLM, TGI ni Ollama.
- Nota critica de compatibilidad: el autor valida el modelo sobre un arbol de llama.cpp cuyo soporte de arquitectura `qwen35` y ruta MTP estaban actualizados a finales de octubre de 2026; builds anteriores pueden no cargar el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Pinpoint-TE) | 27,32 B | no disponible | Edicion de rango 1 sobre 2 tensores, supresion de rechazo | qwen-research | GGUF en Hugging Face |
| `unsloth/Qwen3.8-27B-GGUF` (base) | 27,32 B | no disponible | Modelo base sin editar | qwen-research | GGUF en Hugging Face |
| `Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-Pinpoint-Uncensored-v1` | 27,32 B (base) | no disponible | Edicion original de la que se recupero la receta; cuantizacion IQ2_XS | no disponible | GGUF en Hugging Face |
| `0bserverx/Qwen3.8-27B-Heretic` | 27,32 B (base) | no disponible | Delta denso en los mismos tensores (proporcion de rango 1 del 1,5-1,6 %) | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor lo define como artefacto de investigacion sobre comportamiento de rechazo y pide explicitamente no ponerlo tras un endpoint de producto.
- Cumplira peticiones que los modelos stock rechazan, incluidas peticiones ilegales en la jurisdiccion del usuario. No es una evaluacion de seguridad ni se ofrece garantia alguna.
- La retencion de capacidades no se ha medido: no hay MMLU, ni contexto largo, ni prueba de deriva multi-turno. Los 864 tensores identicos al base sugieren que la mayor parte de la capacidad sobrevive, pero es una expectativa, no un dato.
- Las respuestas son aproximadamente un 16 % mas cortas en peticiones daninas y la cola pierde estructura; el peor bucle de 3-gramas sube de 0,01 a 0,04.
- El rechazo superviviente en la bateria corresponde a la peticion de clase CSAM; la edicion no elimina ese rechazo.
- La inversion del signo incrementa el rechazo tambien en peticiones benignas (3 de 12), lo que indica que la direccion afecta a la politica general y no solo a contenido danino.
- Solo declara ingles; no hay evaluacion multilingue.
- Licencia `qwen-research` heredada: hay que revisar los terminos de `unsloth/Qwen3.8-27B-GGUF` y de Qwen3.8 antes de redistribuir o usar comercialmente.
- El conteo de rechazos no es una metrica de capacidad: un modelo que cumple y divaga no es mejor.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible.
- Dependencia de build de llama.cpp con soporte `qwen35` y MTP actualizado; builds antiguos pueden fallar al cargar.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemonrat/Qwen3.8-27B-UD-Q4_K_M-Pinpoint-TE-Uncensored
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Edicion original de referencia: https://huggingface.co/Kujira/Qwen3.8-27B-GSQ-RCO-IQ2_XS-mtp-Pinpoint-Uncensored-v1
- Edicion alternativa comparada: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic
- Informe completo de ingenieria inversa: `REPORT.md` dentro del repositorio del modelo
- Herramientas de reproduccion: `tools/bake_rank1.py`, `tools/refusal_test.py`, `tools/gguf_hdr.py`, `tools/tensor_diff.py`, `tools/refusal_edit.py` en el repositorio del modelo
- Vectores y metadatos de la edicion: carpeta `vectors/` del repositorio (`u`, `v` por sitio y cabeza en `.npy`, `edit_report.json`)
