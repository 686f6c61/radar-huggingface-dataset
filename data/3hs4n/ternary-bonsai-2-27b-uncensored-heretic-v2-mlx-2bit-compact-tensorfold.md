# 3hs4n/Ternary-Bonsai-2-27B-Uncensored-Heretic-v2-mlx-2bit-compact-TensorFold

## Resumen

Ternary-Bonsai-2-27B-Uncensored-Heretic-v2-mlx-2bit-compact-TensorFold es una release experimental para Apple Silicon de un checkpoint de 27.359.638.768 parametros cuantizado a 2 bits en formato MLX, publicada por el usuario 3hs4n. El modelo deriva de una cadena de ajustes sobre una base denominada "Bonsai-2" (segun los tags, con arquitectura tipo Qwen 3.5 y transformada mediante "prism_hadamard_qwen35"), refinada con el metodo "Heretic" para eliminar el rechazo (uncensored) y posteriormente comprimida a 2 bits. La release incluye pesos objetivo, un drafter de decodificacion especulativa y un runtime propio llamado TensorFold con aceleracion DFlash2.

El interes tecnico de esta ficha no esta en el modelo base sino en la ingenieria de inferencia: el autor empaqueta un motor modificado que mejora el throughput frente a mlx-vlm nativo (hasta +171% en generacion de codigo) a costa de un mayor consumo de memoria (20,67 GiB frente a 14,08 GiB de pico). Todo el conjunto se valida exclusivamente en un Apple M1 Max con 64 GiB de memoria unificada, macOS 26 o superior y Python 3.11 arm64.

Se trata de un artefacto de nicho, orientado a usuarios de Apple Silicon que quieran ejecutar un modelo de 27B con vision, tool calling y modo thinking acotado en local, asumiendo que no hay validacion en Linux, Windows ni GPUs dedicadas, y que el rendimiento medido es de 27,1 tokens/s en texto, 57,0 en codigo y 31,0 en matematicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base tipo Qwen 3.5 segun tags; cuantizacion 2-bit con esquema prism_hadamard_qwen35) |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8K validados en el perfil medido (contexto maximo nativo no disponible) |
| Tipos de cuantizacion | 2-bit (pesos objetivo); drafter BF16 cuantizado a 4-bit en RAM al cargar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento del modelo base: no se especifica el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. Lo que si se deduce de los tags y del nombre es una cadena de derivacion: un modelo base "Bonsai-2" de 27B (con componentes asociados a Qwen 3.5 y un esquema de cuantizacion ternaria/2-bit denominado prism_hadamard), afinado con la tecnica "Heretic" para reducir comportamientos de rechazo, comprimido a 2 bits en MLX y finalmente empaquetado con el runtime TensorFold.

La innovacion principal de esta release es de software, no de pesos: el autor afirma que los pesos objetivo (8,41 GB) y el drafter (3,85 GB, cuantizado a 4-bit en RAM al cargar) son identicos al checkpoint previo, y que las mejoras provienen del motor TensorFold con DFlash2 y de una gestion de memoria revisada (liberacion temprana de buffers de carga y chunks de prefill de 512 filas, que redujeron el pico en 2,15 GiB, un 9,4%). El conjunto incluye decodificacion especulativa mediante drafter, vision, thinking acotado (presupuesto por defecto de 128 tokens) y tool calling nativo.

## Capacidades

- Generacion de texto conversacional y razonamiento, con modo thinking opcional activable por peticion (`enable_thinking: true`) y presupuesto de tokens configurable.
- Generacion de codigo y explicaciones matematicas, con tasas de decodificacion medidas de 57,0 y 31,0 tokens/s respectivamente en el hardware de prueba.
- Vision (pipeline image-text-to-text): procesa imagenes junto con texto mediante mlx-vlm; el autor menciona una prueba con imagen a resolucion completa.
- Tool calling / function calling nativo, expuesto a traves de un endpoint compatible con la API de OpenAI.
- Decodificacion especulativa con drafter incluido (BF16 cuantizado a 4-bit en RAM al cargar).
- Comportamiento "uncensored" derivado del ajuste Heretic (sin filtros de rechazo segun la denominacion del autor).
- Servidor local compatible con OpenAI (`/v1/chat/completions`, `/v1/models`) para integracion con clientes que acepten servidores personalizados.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en local sobre Mac: el modelo alcanza 57,0 tokens/s en decodificacion de codigo con TensorFold, lo que lo hace util para autocompletado y generacion de funciones en un IDE conectado al endpoint OpenAI-compatible en `127.0.0.1:8080`.
- Razonamiento matematico asistido: con 31,0 tokens/s en explicaciones matematicas y modo thinking acotado a 128 tokens por defecto, es adecuado para resolver problemas paso a paso sin desbordar el presupuesto de computo.
- Procesamiento de documentos con imagenes: al soportar image-text-to-text, puede extraer y razonar sobre contenido de capturas, diagramas o documentos escaneados en flujos locales, aunque el autor solo valido una prueba de imagen a resolucion completa.
- Agentes con tool calling: el soporte nativo de function calling y el servidor compatible con OpenAI permiten integrarlo en frameworks de agentes que necesiten llamadas a herramientas en un bucle multi-paso.
- Prototipado de aplicaciones conversacionales sin censura: para investigación sobre comportamiento de modelos, red teaming o generacion de contenido creativo sin rechazos, gracias al ajuste Heretic.
- Inferencia privada en estacion de trabajo Apple: al ejecutarse completamente en local con pesos descargados y sin llamadas externas, encaja en escenarios con requisitos de confidencialidad donde no se puede enviar datos a la nube.
- Evaluacion de tecnicas de compresion extrema: como referencia practica de un modelo de 27B servido a 2 bits con decodificacion especulativa, util para comparar calidad y latencia frente a cuantizaciones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta metricas de velocidad y memoria, y una comparacion de calidad interna de 77/80 en ambos runtimes con los mismos tres fallos.

| Metrica | mlx-vlm nativo | TensorFold + DFlash2 | Cambio observado |
|---|---:|---:|---:|
| Texto (tokens/s) | 21,15 | 27,05 | +27,9% |
| Codigo (tokens/s) | 21,04 | 57,04 | +171,2% |
| Matematicas (tokens/s) | 21,08 | 31,04 | +47,2% |
| Pico de RAM del proceso (GiB) | 14,08 | 20,67 | Mayor consumo con TensorFold |

Configuracion validada: contexto de 8K, greedy (temperatura 0), una sola secuencia y cache de prefijo desactivada. El perfil de texto previo de TensorFold alcanzaba un pico de 22,83 GiB; la optimizacion de memoria lo redujo a 20,67 GiB manteniendo las tasas de decodificacion dentro de un 1%.

## Requisitos de hardware

- Hardware validado: Apple M1 Max con 64 GiB de memoria unificada. No se ha establecido una configuracion minima de RAM.
- Pico de memoria del proceso observado: 20,74 GiB (incluyendo la prueba de imagen a resolucion completa), excluyendo macOS y otras aplicaciones.
- Tamano en disco: repositorio completo de aproximadamente 12,27 GB (12,26 GB de pesos objetivo y drafter); instalacion del runtime de unos 1,11 GB y 254 MB adicionales de wheels de dependencias.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas ni validadas; la release es exclusiva de Apple Silicon con MLX.
- Sistemas operativos: macOS 26 o superior con Python 3.11 arm64 nativo; sin validacion en Windows ni Linux.
- Despliegue: runtime TensorFold incluido mediante `install.py` y `serve.py`, con endpoint OpenAI-compatible en el puerto 8080 (configurable). La carga nativa en Unsloth o LM Studio no ha sido validada, y abrir los pesos MLX directamente en una app no activa el motor TensorFold.
- Throughput medido: 27,1 tokens/s en texto, 57,0 en codigo y 31,0 en matematicas en el M1 Max de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-Uncensored-Heretic-v2-mlx-2bit-compact-TensorFold | 27,36B | 8K validados | 2-bit MLX | Apache 2.0 | HuggingFace, solo Apple Silicon |
| Ternary-Bonsai-2-27B-Uncensored-Heretic-v2-mlx-2bit-compact (checkpoint previo) | 27,36B | no disponible | 2-bit MLX | Apache 2.0 | HuggingFace, MLX |
| Modelos MLX de ~27B en 4-bit (genericos) | ~27B | variable | 4-bit | variable | HuggingFace |

La comparacion directa con alternativas de la misma categoria es limitada porque el autor solo referencia su propio checkpoint previo como base. No se dispone de datos de benchmarks que permitan situar este modelo frente a otros de tamano similar en calidad.

## Limitaciones y advertencias

- Validacion exclusiva en un Apple M1 Max de 64 GiB con macOS 26 y Python 3.11 arm64; no hay pruebas en Linux, Windows ni GPUs dedicadas.
- El pico de memoria de 20,74 GiB no incluye macOS ni otras aplicaciones, y no se ha establecido un minimo de RAM del sistema; en Macs de 32 GiB el margen es muy ajustado.
- La cuantizacion a 2 bits implica una perdida de calidad no cuantificada publicamente; el autor solo reporta 77/80 en su comparacion interna.
- La etiqueta "uncensored" y el ajuste Heretic implican ausencia de filtros de rechazo, con el riesgo asociado de generar contenido inapropiado, sesgado o danino; no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion propio de un modelo de 27B comprimido agresivamente; no hay evaluaciones de factualidad publicadas.
- Solo se valido temperatura 0, contexto de 8K, una secuencia y cache de prefijo desactivada; otras configuraciones de muestreo no estan verificadas.
- El rendimiento depende del runtime TensorFold incluido; cargar los pesos en otras herramientas no reproduce las cifras medidas.
- El launcher comprueba la contencion con Ollama, pero no gestiona otros servicios que consuman memoria unificada.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre la cadena de derivacion de los pesos base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3hs4n/Ternary-Bonsai-2-27B-Uncensored-Heretic-v2-mlx-2bit-compact-TensorFold
- Checkpoint base (Compact Heretic v2 MLX): https://huggingface.co/3hs4n/Ternary-Bonsai-2-27B-Uncensored-Heretic-v2-mlx-2bit-compact
- Repositorio MLX: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
