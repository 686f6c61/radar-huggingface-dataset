# johnlockejrr/Swift-1.5-Flash-Next-Heretic-V2-ht43-HGN

## Resumen

Swift 1.5 Flash-Next Heretic V2 (ht43) es una conversión comunitaria de los pesos abliterados Heretic V2 del modelo Qwen 3.8 Flash-Next, publicada por el usuario johnlockejrr. Se trata de una variante sin mecanismos de rechazo (uncensored), ajustada para programación e ingeniería inversa, derivada de la cadena Qwen3.8-Flash-Next → Swift 1.5 → Heretic V2 → ReverseEngineer, y convertida desde un GGUF IQ4_XS-plus al formato de pesos propietario `.hgn` que consume el servidor halogen-flash-server sobre hardware AMD Strix Halo (gfx1151).

El perfil `ht43` es el más pequeño de los dos perfiles HGN disponibles: almacena los expertos enrutados con menos bits que el perfil `v2` (trellis HT4 en capas pares y HT3 en impares, frente a I4R de 4 bits), lo que reduce el checkpoint de 62,1 GiB a 53,7 GiB, es decir, unos 8,4 GiB de ahorro de memoria. La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen 3.8, con cabecera MTP (multi-token prediction) y una torre de visión opcional.

La relevancia de esta ficha es acotada y muy específica: no es un modelo para usar con transformers, vLLM ni llama.cpp, sino un artefacto de despliegue para el runtime halogen-flash-server en GPUs integradas AMD Strix Halo. Además, el autor declara explícitamente que la conversión no ha sido verificada ni medida, por lo que debe tratarse como material experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Qwen 3.8, con cabecera MTP y torre de visión opcional |
| Parámetros totales | no disponible (la tabla n-gram auxiliar tiene 51B parámetros) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Perfil ht43: expertos enrutados en trellis HT4 (capas pares) y HT3 (capas impares); mixers de hiperconexión Q8G64; tabla n-gram en FP8; torre de visión en BF16. Origen: GGUF IQ4_XS-plus |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en el Hub) |
| Formato de pesos | `.hgn` (hgn-spec 1.1.0); no compatible con safetensors, GGUF, transformers, vLLM ni llama.cpp |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-Flash-Next, sobre el que se aplicó un post-entrenamiento (Swift 1.5 de ukisai) y posteriormente una ablación de rechazo (Heretic V2 de jeffpeng3). La variante ReverseEngineer de trubisky añade un ajuste orientado a programación e ingeniería inversa. La arquitectura es un transformer con mezcla de expertos, con mezcladores de hiperconexión y una cabecera MTP para decodificación especulativa. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en las etapas indicadas.

La innovación técnica de esta publicación no está en el entrenamiento sino en la conversión de formato. El conversor Quat3rnion/bf16-to-hgn, con perfil `ht43`, `--ht-beam 128` y semilla 0, aplica un trellis HT sobre los expertos enrutados; el autor reporta una tasa de codificación HT4 de aproximadamente 9,5M valores/s en una RTX 3090, frente a 0,12M valores/s en una Quadro P1000, lo que hace inviable el proceso en GPUs de gama baja. La cabecera MTP se copió byte a byte desde el checkpoint v2 de peonist-ai/halogen-qwen3.8-flash-next mediante un sidecar y `--mtp`, re-codificando tres tensores Q4C-P con un error de energía del 0,8-0,9 % respecto a la cabecera original; los otros 28 tensores son bit-exactos. La torre de visión se tomó del mismo repositorio (333 tensores BF16) y se pasó con `--vision`.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento y programación, con ajuste específico para ingeniería inversa según la model card.
- Cabecera MTP para decodificación especulativa con draft head.
- Visión: solo si se monta el fichero opcional `qwen38-flash-next-vision.hgn`; sin él, el motor es únicamente de texto.
- Tabla de búsqueda n-gram de 51B parámetros en FP8 como componente auxiliar obligatorio.
- Comportamiento sin rechazo (abliterated): no aplica negativas de seguridad por alineamiento.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Despliegue en hardware AMD Strix Halo: el modelo está pensado para montarse en el contenedor halogen-flash-server (release 0.16 o superior) sobre gfx1151, aprovechando el perfil ht43 para liberar 8,4 GiB de memoria frente al perfil v2.
- Experimentación con formatos de pesos alternativos: sirve para estudiar el rendimiento del trellis HT4/HT3 sobre expertos enrutados y compararlo con la cuantización I4R del perfil v2.
- Investigación sobre ablación de rechazo: permite analizar el comportamiento de pesos Heretic V2 en un runtime distinto del habitual, siempre en entornos controlados y con revisión legal.
- Asistencia a la programación en local: el ajuste ReverseEngineer está orientado a tareas de análisis de código y binarios, aunque sin benchmarks publicados que lo respalden.
- Procesamiento de texto bilingüe inglés-chino: cubre generación y transformación de texto en ambos idiomas en un único motor.
- Análisis de documentos con imagen: si se monta la torre de visión opcional, el motor puede procesar entradas visuales junto con texto.
- Reproducción y verificación de conversiones: el repositorio incluye `conversion-manifest.json` y `sha256.txt`, útiles para validar la integridad de los ficheros en pipelines internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que las pruebas de velocidad y calidad están "not yet recorded", y que la comparación byte a byte de la salida CUDA con el backend de CPU no se realizó (el conversor está cualificado en sm_89 y esta ejecución usó sm_86).

## Requisitos de hardware

- VRAM/residencia: aproximadamente 53,7 GiB residentes para `model.hgn`, más la tabla n-gram mapeada en memoria (47,7 GiB en disco, FP8) y, opcionalmente, 0,84 GiB de torre de visión. Total en disco: unos 102 GiB.
- GPU objetivo: AMD Strix Halo con gfx1151, a través de halogen-flash-server 0.16 o superior.
- No cabe en GPUs de consumo convencionales: el tamaño residente supera la VRAM de una RTX 4090 (24 GB) o una RTX 3090 (24 GB).
- La conversión se generó en una RTX 3090 (sm_86) con backend CUDA, pero el modelo resultante no está pensado para ejecutarse en CUDA.
- Opciones de despliegue: exclusivamente halogen-flash-server. No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponibles. La documentación de halogen indica que ht43 lee los prompts algo más despacio y decodifica con la draft head un pequeño porcentaje más lento que v2, pero el autor no ha medido este efecto en esta conversión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ht43) | no disponible | no disponible | `.hgn` | swift-open-license-1.0 | Solo halogen-flash-server |
| johnlockejrr/Swift-1.5-Flash-Next-Heretic-V2-HGN (perfil v2) | no disponible | no disponible | `.hgn` | swift-open-license-1.0 | Solo halogen-flash-server; 62,1 GiB |
| peonist-ai/halogen-qwen3.8-flash-next | no disponible | no disponible | `.hgn` | no disponible | Checkpoint de referencia de halogen |
| trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer | no disponible | no disponible | GGUF (IQ4_XS-plus, 94,7 GB) | no disponible | llama.cpp y derivados |

## Limitaciones y advertencias

- Modelo sin rechazo: la ablación elimina deliberadamente el comportamiento de negativa; el usuario es el único responsable del uso y debe cumplir la legislación aplicable.
- Conversión no verificada: `bf16-to-hgn verify` no se ha registrado, no se ha probado la carga y generación en halogen-flash-server, y no hay benchmarks de velocidad ni calidad.
- Compatibilidad restringida: los pesos `.hgn` no cargan en transformers, vLLM ni llama.cpp, ni en el widget del Hub; la model card marca `inference: false`.
- La cabecera MTP es la estándar, entrenada contra el tronco original y no contra los pesos Heretic, lo que puede degradar la calidad de la decodificación especulativa.
- La comparación byte a byte entre backend CUDA y CPU no se realizó; el conversor está cualificado en sm_89 y esta ejecución usó sm_86.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Licencia `swift-open-license-1.0`: es necesario revisar los términos del enlace de licencia antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero propios de un modelo abliterated sin evaluación de seguridad publicada.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que refleja una validación comunitaria prácticamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johnlockejrr/Swift-1.5-Flash-Next-Heretic-V2-ht43-HGN
- Variante v2 del mismo autor: https://huggingface.co/johnlockejrr/Swift-1.5-Flash-Next-Heretic-V2-HGN
- Modelo base: https://huggingface.co/trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer
- Checkpoint de referencia halogen: https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next
- Licencia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Servidor halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server
- Conversor bf16-to-hgn: https://github.com/Quat3rnion/bf16-to-hgn
- Especificación hgn-spec: https://github.com/jtsylve/hgn-spec
