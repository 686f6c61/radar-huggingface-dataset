# j2ipper/Qwen3.8-27B-W4A4-prompt-v3

## Resumen

Qwen3.8-27B-W4A4-prompt-v3 es un artefacto de pesos publicado por el usuario j2ipper que contiene copias en int4 de las matrices feed-forward (gate, up y down) de las capas 48 a 63 del modelo Qwen3.8-27B, derivadas concretamente del fichero `Qwen3.8-27B-UD-IQ4_XS.gguf` del repositorio unsloth/Qwen3.8-27B-GGUF. No es un modelo independiente: es un sidecar de cuantización que solo funciona junto a ese GGUF exacto, cuyo nombre y tamano quedan registrados dentro del propio fichero `.w4i`.

El artefacto esta disenado para la ruta de procesamiento de prompts en 4 bits (W4A4) del runtime Talus sobre AMD Strix Halo (gfx1151), usando la instruccion matricial `v_wmma_i32_16x16x16_iu4`. Mientras la lectura del prompt se acelera con esta ruta W4A4, la decodificacion, el drafting y la verificacion siguen ejecutandose sobre los pesos originales del GGUF, de modo que el artefacto no sustituye al modelo base sino que acelera una fase concreta de la inferencia.

Su relevancia es de nicho pero muy concreta: permite ganar entre un 6,5 % y un 7,2 % de velocidad en prefill (pp2k y pp32k) en hardware Strix Halo manteniendo la fidelidad respecto a BF16 en niveles proximos a la ruta exacta int8 de Talus, con una desviacion KL de +0,00018 en wiki2 y una tasa de acierto de 15/15 en needle-in-a-haystack a 60K. Esta pensado para desarrolladores que ya ejecutan Talus sobre APUs AMD y quieren optimizar la latencia de prompts largos sin cambiar de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sidecar de cuantizacion (no es un modelo autonomo); matrices feed-forward de un transformer Qwen3.8-27B |
| Parametros totales | No disponible (el artefacto cubre solo las capas 48-63; el modelo base es de 27B) |
| Parametros activos | No aplica (el modelo base no se describe como MoE en la informacion disponible) |
| Longitud de contexto | No disponible en el artefacto; el modelo base se evalua hasta 60K en las pruebas reportadas |
| Tipos de cuantizacion | int4 (-7..7) con grupos de 256 columnas, GPTQ, SmoothQuant, Hadamard de 256 puntos, formato `.w4i` v3 (magic W4I3) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (scripts de la receta en MIT) |
| Formato de pesos | `.w4i` v3 (2.208.309.248 bytes); requiere el GGUF `Qwen3.8-27B-UD-IQ4_XS.gguf` |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: cuantiza a int4 las matrices feed-forward (gate, up y down) de las capas 48 a 63 del Qwen3.8-27B original, partiendo de la variante UD-IQ4_XS en GGUF. La receta, documentada en `recipe/q4q/README.md`, consta de seis pasos: calibracion con 151.552 tokens publicos (fuentes: llama.cpp en el tag b11062 y textos con licencias GPL-3, GFDL-1.3, Apache-2.0 y MPL-2.0); calculo de hessianos mediante el forward de CPU de llama.cpp acumulando X^T X de las entradas de gate/up y down; suavizado SmoothQuant con escala s_j = rms(x_j)^a / rms(w_.j)^(1-a), con a = 0,5 para gate/up y a = 0,25 para down, normalizada a media geometrica 1 y plegada en los pesos; GPTQ en la base rotada y suavizada con signos sembrados (semilla 20261017), grupos de 256 columnas y damping 0,1; correccion de sesgo que compensa el encogimiento de aproximadamente el 1,5 % introducido por la busqueda de clips MSE-optimos, ajustando la escala de cada fila de salida con una ganancia derivada del hessiano de calibracion; y empaquetado final en el layout `.w4i` v3 de Talus.

La innovacion tecnica clave es la integracion con la ruta W4A4 de Talus, que aplica matematicas matriciales int4 (`v_wmma_i32_16x16x16_iu4`) exclusivamente a los GEMM de prompt de las 48 matrices FFN afectadas, mientras el resto de la inferencia permanece en los pesos del GGUF. El fichero incluye las escalas de activacion (1/s) y un flag que permite a Talus escoger la escala de cada grupo de activacion entre 4 clips. La receta completa requiere horas de CPU, unos 31 GiB de RAM y aproximadamente 150 GB de disco.

## Capacidades

- No es un modelo autonomo: no genera texto, razona ni responde por si mismo. Su unica funcion es alimentar la ruta de prompt en 4 bits del runtime Talus sobre Strix Halo.
- Acelera el procesamiento de prompts (prefill) en las capas 48-63 del Qwen3.8-27B, con ganancias medidas de +6,5 a +7,2 % en pp2k y +6,5 a +6,7 % en pp32k frente a la ruta exacta int8.
- Mantiene la decodificacion, el drafting y la verificacion sobre los pesos originales del GGUF, por lo que no altera el comportamiento generativo del modelo base.
- Soporta activacion y desactivacion mediante la variable de entorno `TALUS_Q27_W4I=0`; sin el fichero, Talus recurre a la ruta exacta int8.
- Compatible unicamente con versiones de Talus que lean el formato v3; las versiones antiguas requieren el fichero previo `j2ipper/Qwen3.8-27B-W4A4-prompt`.
- No se documentan capacidades de tool calling, agentes, vision ni audio en el artefacto; estas dependerian integramente del modelo base Qwen3.8-27B.

## Casos de uso

- Aceleracion de prefill en inferencia local sobre AMD Strix Halo: el caso principal. Colocando el fichero junto al GGUF `Qwen3.8-27B-UD-IQ4_XS.gguf`, Talus lo detecta y lo usa por defecto, reduciendo la latencia de prompts largos entre un 6,5 % y un 7,2 % sin cambiar el modelo ni la calidad de generacion.
- Procesamiento de documentos largos en local: con prompts de hasta 32K tokens, la ruta W4A4 mantiene una relacion KL de 0,94 frente a la ruta exacta (mejor que la unidad) y un 15/15 en needle-in-a-haystack a 60K, lo que lo hace adecuado para resumen y QA sobre corpus extensos en equipos con APU AMD.
- Pipelines de codigo asistido: la suite de coding agentico reporta 5/5, y la desviacion KL frente a BF16 en codigo Python es de +0,00099, por lo que se puede usar en tareas de generacion y revision de codigo donde la fidelidad del prefill importa.
- Despliegue de bajo consumo en estaciones de trabajo con iGPU: al mantener el modelo en su GGUF IQ4_XS y solo anadir 2,2 GB de sidecar, encaja en configuraciones con memoria unificada limitada donde cargar una variante de mayor precision no es viable.
- Evaluacion y benchmarking de rutas de cuantizacion: util para investigadores que comparan fidelidad (KL, top-1 agreement, perplexity) entre rutas int8 exactas, W4A4 y BF16 sobre el mismo modelo base, con metodologia publicada en `docs/METHODOLOGY.md` de Talus.
- Reproducibilidad de recetas de cuantizacion: la receta es byte-reproducible (ids de calibracion verificables via `recipe/calib-SHA256SUMS`) y los scripts son MIT, lo que permite reutilizarla para cuantizar otras capas o modelos con el mismo esquema GPTQ + SmoothQuant + Hadamard.

## Benchmarks y rendimiento

Resultados reportados por el autor frente a la ruta exacta int8 de Talus, con UD-IQ4_XS sobre Strix Halo:

| Metrica | Fichero previo (v2) | Este fichero (v3) |
|---|---|---|
| KL vs llama.cpp CPU, prompts 4K (ratio a exacto, gate x1,35) | x1,236 | x1,160 |
| KL vs llama.cpp CPU, prompts 32K (ratio a exacto) | x1,31 | x0,94 |
| KL vs BF16, wiki2 (12 chunks) | +0,00034 | +0,00018 |
| KL vs BF16, codigo Python (6 chunks) | +0,00092 | +0,00099 |
| Top-1 agreement con BF16 (wiki / codigo) | -0,07 / -0,26 pt | -0,13 / -0,13 pt |
| Needle in a haystack, 60K | no disponible | 15/15 |
| Suite de coding agentico | no disponible | 5/5 |
| Velocidad de prompt vs exacto (pp2k / pp32k) | no disponible | +6,5..7,2 % / +6,5..6,7 % |
| Decode a 2K / 32K y aceptacion de draft | no disponible | +1,6 % / -0,5 % (dentro del ruido), sin cambios |

Puntos de referencia del autor: sobre los mismos conjuntos BF16, la ruta exacta int8 tiene KL 0,0170 (wiki) y 0,0756 (codigo); Q8_0 registra 0,00084 y 0,00148. La perplexity relativa a BF16 no empeora respecto a la ruta exacta: 0,9924 frente a 0,9931 en wiki y 1,0442 frente a 1,0455 en codigo.

## Requisitos de hardware

- Hardware objetivo: AMD Strix Halo (gfx1151) con soporte de `v_wmma_i32_16x16x16_iu4`; no se documenta compatibilidad con otras GPU.
- VRAM: el sidecar ocupa 2,2 GB adicionales sobre el GGUF base `Qwen3.8-27B-UD-IQ4_XS.gguf`; el total depende del modelo base y de la memoria unificada de la APU.
- GPU recomendadas: APUs AMD Strix Halo; no se mencionan A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: si, en el sentido de que esta pensado para iGPU de APUs AMD con memoria unificada; no se aportan datos para GPUs discretas de consumo.
- Despliegue: exclusivamente mediante el runtime Talus (repositorio `nsbradley88/talus-public`); no compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa.
- Latencia y throughput: +6,5 a +7,2 % en pp2k y +6,5 a +6,7 % en pp32k frente a la ruta exacta int8; decode sin cambios significativos (+1,6 % a 2K, -0,5 % a 32K, dentro del ruido).
- Recursos para reproducir la receta: horas de CPU, aproximadamente 31 GiB de RAM y unos 150 GB de disco.

## Comparativa con modelos similares

| Artefacto | Base | Formato | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| j2ipper/Qwen3.8-27B-W4A4-prompt-v3 | Qwen3.8-27B (UD-IQ4_XS) | `.w4i` v3 | Sidecar W4A4 para prefill en Talus | Apache-2.0 | HuggingFace, 0 descargas |
| j2ipper/Qwen3.8-27B-W4A4-prompt (v2) | Qwen3.8-27B (UD-IQ4_XS) | `.w4i` v2 | Sidecar W4A4 para versiones antiguas de Talus | Apache-2.0 | HuggingFace |
| unsloth/Qwen3.8-27B-GGUF (UD-IQ4_XS) | Qwen3.8-27B | GGUF | Modelo completo cuantizado, ejecutable en llama.cpp y derivados | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B | Original | safetensors (presumiblemente) | Modelo base completo en BF16 | Apache-2.0 | HuggingFace |

La comparacion con modelos de la misma categoria (mismo tamano o misma tarea) no aplica en sentido estricto: este artefacto no compite con otros modelos, sino con otras rutas de cuantizacion del mismo modelo base dentro de Talus. Frente a la ruta exacta int8, ofrece mas velocidad de prefill con fidelidad comparable; frente a Q8_0, la ruta exacta y este sidecar presentan mayor desviacion KL, pero Q8_0 no acelera el prefill en la misma medida en este hardware.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el GGUF exacto `Qwen3.8-27B-UD-IQ4_XS.gguf` y sin el runtime Talus, el fichero es inutilizable.
- Dependencia estricta de version: solo lo leen versiones de Talus con soporte del formato v3; las anteriores requieren el fichero v2.
- Hardware muy especifico: disenado para AMD Strix Halo (gfx1151); no hay evidencia de funcionamiento en otras GPU o aceleradores.
- Sesgos y alucinaciones: no se documentan sesgos propios del artefacto; los del modelo base Qwen3.8-27B se heredan integramente y no se detallan en la informacion disponible.
- Idiomas: no se especifica que idiomas soporta el sidecar; depende del modelo base.
- Licencia: Apache-2.0 permite uso comercial, pero los scripts de la receta son MIT y el modelo base arrastra su propia licencia Apache-2.0; conviene verificar el cumplimiento conjunto.
- El autor reporta una ligera perdida de fidelidad en codigo Python (+0,00099 KL frente a +0,00092 en v2) y una reduccion del top-1 agreement de 0,26 a 0,13 puntos en codigo, por lo que en tareas de codigo sensible conviene validar la salida.
- No hay resultados publicados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este artefacto; las metricas reportadas son de fidelidad y velocidad, no de capacidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/j2ipper/Qwen3.8-27B-W4A4-prompt-v3
- Fichero previo v2: https://huggingface.co/j2ipper/Qwen3.8-27B-W4A4-prompt
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Runtime Talus: https://github.com/nsbradley88/talus-public
- Metodologia de Talus: `docs/METHODOLOGY.md` en el repositorio de Talus
- Receta de cuantizacion: `recipe/q4q/README.md` en el repositorio del artefacto
