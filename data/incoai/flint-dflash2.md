# incoai/Flint-DFlash2

## Resumen

Flint-DFlash2 es un modelo draft (borrador) desarrollado por Inco AI para acelerar la inferencia del modelo RecursiveSI/flint mediante decodificación especulativa. No es un modelo de lenguaje autónomo: su función es predecir bloques completos de tokens en una sola pasada que el modelo objetivo (flint) verifica posteriormente. Se basa en la arquitectura Qwen3 y cuenta con 402,6 millones de parámetros, un tamaño reducido que le permite ejecutarse junto al modelo objetivo con un coste de memoria y cómputo mínimo.

Su relevancia radica en el algoritmo DFlash 2, un drafter de difusión por bloques (block diffusion) que predice hasta 7 tokens por paso de verificación y mantiene los candidatos principales en cada posición; un selector ligero traza después una ruta coherente entre ellos. El resultado, según los datos publicados por el autor, es una aceleración de entre 1,45x y 2,32x en throughput frente a la decodificación autorregresiva, sin pérdida de calidad: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución.

El despliegue está pensado para SGLang, con soporte de Flint disponible en un pull request abierto. Es un componente de infraestructura de inferencia, no un modelo de uso general, por lo que su público natural son equipos que sirven Flint en producción y buscan reducir latencia y coste por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de difusion por bloques (block diffusion) para decodificacion especulativa, basado en Qwen3 |
| Parametros totales | 402.564.352 (~402,6 M) |
| Parametros activos | no disponible (no aplica: no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (evaluacion validada en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DFlash 2 es un drafter de difusion por bloques: en lugar de generar tokens uno a uno de forma autorregresiva, predice un bloque completo de tokens en una sola pasada y conserva los candidatos principales (top candidates) en cada posicion. Un selector ligero recorre posteriormente esos candidatos para trazar una ruta coherente a traves del bloque. La columna vertebral incorpora convoluciones dinamicas de dos tomas (two-tap dynamic convolutions) que evitan que el borrador se degrade hacia el final del bloque, un problema tipico de los drafters paralelos.

El modelo es un fine-tuning de RecursiveSI/flint (que a su vez se basa en la arquitectura Qwen3) y esta diseñado para trabajar con un tamano de bloque de especulacion de 8, es decir, 7 tokens borrador por paso de verificacion. La decodificacion es sin perdidas (lossless): en modo greedy la salida coincide exactamente con la del modelo objetivo y en modo muestreo se preserva su distribucion, de modo que la calidad de generacion no se ve afectada. No hay informacion publicada sobre el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Prediccion paralela de bloques de hasta 7 tokens por paso de verificacion mediante difusion por bloques.
- Selector ligero de rutas coherentes entre los candidatos top de cada posicion.
- Decodificacion sin perdidas: salida greedy identica al modelo objetivo y muestreo que preserva su distribucion.
- Convoluciones dinamicas de dos tomas que mantienen la calidad del borrador a lo largo del bloque.
- Integracion con SGLang como algoritmo de especulacion (DFLASH) junto al modelo objetivo RecursiveSI/flint.
- No genera texto de forma autonoma: no soporta chat, tool calling ni agentes por si mismo; su unica funcion es acelerar al modelo objetivo.

## Casos de uso

- Servir RecursiveSI/flint en produccion con menor latencia: integrado en SGLang, reduce el tiempo de generacion por token hasta un 2,32x en tareas de codigo, lo que mejora directamente la experiencia de usuario en chat y completado.
- Servicios de razonamiento matematico a escala: en tareas tipo GSM8K y MATH-500, DFlash 2 casi duplica el throughput (2,17x y 2,06x a concurrencia 1), util para plataformas de tutoria o resolucion de problemas con muchos usuarios simultaneos.
- Asistentes de codigo con alta concurrencia: a concurrencia 32, tareas tipo HumanEval alcanzan 7.374 tokens/s de salida (2,07x), adecuado para backends de autocompletado o generacion de codigo multiusuario.
- Reduccion de coste por token en APIs propias: al aumentar el throughput sin cambiar de hardware (validado en una sola GPU GB300), se reduce el coste de infraestructura por token servido.
- Despliegues de agentes multi-paso: las llamadas a herramientas y el razonamiento multi-turno de Flint se benefician de la aceleracion, especialmente en cadenas largas de razonamiento donde el numero de tokens generados es alto.
- Batch processing offline: para trabajos de generacion masiva (resumenes, etiquetado, sintetico de datos), la mejora de 1,77x-1,97x a alta concurrencia acorta los tiempos totales de proceso.

## Benchmarks y rendimiento

Los datos siguientes miden el rendimiento del sistema Flint + DFlash 2 frente a la decodificacion autorregresiva de Flint, no la calidad del modelo. Entorno: SGLang (PR #45624, commit `37bc771d`) en una NVIDIA GB300 (TP1), BF16, FlashAttention 4, bloque de especulacion 8, maximo 4.096 tokens nuevos.

Longitud de aceptacion (tokens aceptados por paso de verificacion, a concurrencia 1; mayor es mejor):

| Tarea | DFlash 2 |
| :--- | ---: |
| GSM8K | 4,23 |
| MATH-500 | 4,28 |
| HumanEval | 4,53 |
| MBPP | 4,33 |
| MT-Bench | 3,49 |

Throughput a concurrencia 1 (tokens/s de salida y aceleracion vs. autorregresivo):

| Tarea | Autorregresivo | DFlash 2 |
| :--- | ---: | ---: |
| GSM8K | 316,7 | 686,5 (2,17x) |
| MATH-500 | 316,7 | 651,5 (2,06x) |
| HumanEval | 308,6 | 715,5 (2,32x) |
| MBPP | 310,8 | 700,4 (2,25x) |
| MT-Bench | 313,6 | 555,7 (1,77x) |

Throughput a concurrencia 8:

| Tarea | Autorregresivo | DFlash 2 |
| :--- | ---: | ---: |
| GSM8K | 1.474,7 | 2.720,8 (1,84x) |
| MATH-500 | 1.500,2 | 2.651,3 (1,77x) |
| HumanEval | 1.490,0 | 2.828,3 (1,90x) |
| MBPP | 1.504,2 | 2.705,8 (1,80x) |
| MT-Bench | 1.487,9 | 2.151,9 (1,45x) |

Throughput a concurrencia 32:

| Tarea | Autorregresivo | DFlash 2 |
| :--- | ---: | ---: |
| GSM8K | 3.523,4 | 6.936,8 (1,97x) |
| MATH-500 | 3.534,8 | 6.662,9 (1,88x) |
| HumanEval | 3.554,4 | 7.374,5 (2,07x) |
| MBPP | 3.505,6 | 7.168,3 (2,04x) |
| MT-Bench | 3.385,8 | 5.792,0 (1,71x) |

No se han publicado benchmarks de calidad (MMLU, exactitud en GSM8K, etc.) para este modelo, lo cual es coherente con su naturaleza: al ser una decodificacion sin perdidas, la calidad corresponde integramente al modelo objetivo Flint.

## Requisitos de hardware

- El propio draft pesa ~0,8 GB en el repositorio (BF16), por lo que su huella de VRAM es minima; el requisito dominante es la VRAM del modelo objetivo RecursiveSI/flint (dimension no disponible en la informacion proporcionada).
- Entorno validado por el autor: una NVIDIA GB300 (tensor parallelism 1), BF16, con FlashAttention 4 para la atencion del modelo objetivo y del draft.
- Al ser un modelo de ~400 M de parametros, el draft en si cabe sobradamente en GPUs de consumo (RTX 4090, RTX 5090), pero la viabilidad del sistema completo depende del modelo objetivo.
- Despliegue: SGLang es el unico runtime soportado documentado, y solo en el commit validado (`37bc771d`) del PR #45624, que anade soporte de Flint. No hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI.
- Comando de arranque documentado: `sglang serve RecursiveSI/flint --enable-fp32-lm-head --reasoning-parser flint --tool-call-parser flint --speculative-algorithm DFLASH --speculative-draft-model-path incoai/Flint-DFlash2`.
- Throughput de referencia en GB300: 686 tokens/s a concurrencia 1 y hasta 7.374 tokens/s a concurrencia 32 con DFlash 2 activo (tarea HumanEval).

## Comparativa con modelos similares

Comparativa con otros drafters de decodificacion especulativa. Los datos de los modelos alternativos son aproximados y dependen del modelo objetivo, por lo que deben tomarse como orientativos.

| Modelo | Tipo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flint-DFlash2 | Drafter block diffusion | ~402,6 M | Predice bloques de 7 tokens en paralelo con selector de rutas | Apache 2.0 | HuggingFace, SGLang (PR abierto) |
| EAGLE-3 | Drafter autorregresivo con feature-level speculation | ~1 clase de 0,2-1 M tipicamente | Un token por iteracion interna con arboles de verificacion | Apache 2.0 | HuggingFace, SGLang, vLLM |
| Medusa | Cabezas multiples adicionales | Cabeceras ligeras sobre el objetivo | Prediccion de multiples tokens siguientes con aceptacion en arbol | Licencias variables segun modelo base | vLLM, SGLang |

La ventaja diferencial declarada de DFlash 2 es la prediccion paralela de bloques completos con difusion, que segun sus mediciones consigue longitudes de aceptacion de 3,5-4,5 tokens por paso y aceleraciones de 1,45x-2,32x, frente a aceleraciones tipicamente menores de los drafters de un token. Su limitacion es el acoplamiento a un unico modelo objetivo (Flint) y a SGLang con un commit concreto.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: no puede usarse para chat, generacion de texto, codigo ni ninguna tarea sin el modelo objetivo RecursiveSI/flint. Intentar usarlo de forma aislada no producira resultados utiles.
- Acoplado a un solo modelo objetivo: solo sirve para acelerar RecursiveSI/flint; no es reutilizable con otros modelos.
- Soporte de runtime limitado: requiere SGLang en el commit exacto `37bc771d` del PR #45624 (aun sin fusionar), lo que introduce riesgo de inestabilidad o cambios de API en produccion.
- El campo `inference: false` en la configuracion refleja que no funciona con el pipeline estandar de transformers.
- La ganancia de aceleracion depende de la tarea: cae hasta 1,45x-1,77x en tareas conversacionales tipo MT-Bench, frente a >2x en codigo y matematicas.
- Sin datos publicados de calidad, sesgos ni alucinaciones propias del draft: al ser decodificacion sin perdidas, hereda integramente los sesgos y riesgos de alucinacion del modelo objetivo Flint, sobre los que no hay informacion en la ficha.
- Contexto, idiomas soportados y cuantizaciones disponibles: no disponibles en la informacion publicada.
- Licencia Apache 2.0 sin restricciones para uso comercial, pero la licencia efectiva del sistema completo dependera tambien de la licencia del modelo objetivo RecursiveSI/flint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/incoai/Flint-DFlash2
- Modelo objetivo: https://huggingface.co/RecursiveSI/flint
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Pull request de soporte Flint en SGLang: https://github.com/sgl-project/sglang/pull/45624
- Repositorio de SGLang: https://github.com/sgl-project/sglang
- Paper original DFlash (ICML 2026): Chen, Jian; Liang, Yesheng; Liu, Zhijian, "DFlash: Block Diffusion for Flash Speculative Decoding" (referencia BibTeX en la model card; enlace externo no disponible)
