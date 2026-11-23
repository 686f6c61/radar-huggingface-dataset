# kingjones777/LFM2.5-1.2B-Instruct-ROCmFP4-GGUF

## Resumen

LFM2.5-1.2B-Instruct-ROCmFP4-GGUF es una cuantización de 4 bits del modelo instructivo LiquidAI/LFM2.5-1.2B-Instruct, publicada por el usuario kingjones777. No se trata de un modelo nuevo, sino de una conversión de pesos a un formato de tensor propietario denominado ROCmFP4, que solo existe en el fork ROCmFPX de llama.cpp y que está orientado específicamente a las GPU integradas AMD gfx1151 (Radeon 8060S) presentes en los sistemas Ryzen AI Max+ 395, conocidos comercialmente como Strix Halo.

El modelo base es un transformer de 1.170.340.608 parámetros con arquitectura `lfm2`, desarrollado por Liquid AI, con una longitud de contexto declarada de 128.000 tokens. La relevancia de esta publicación es acotada pero concreta: es la primera cuantización ROCmFP4 de cualquier checkpoint de la familia LFM2.5, y su objetivo es exprimir el ancho de banda de memoria unificada de los sistemas Strix Halo con ROCm 7.13.0, un escenario en el que las cuantizaciones k-quant estándar no aprovechan los tipos de tensor de 4 bits nativos del runtime.

El repositorio ocupa 1,4 GB y contiene un único archivo de pesos de 695.755.456 bytes (0,65 GiB) con 148 tensores. La licencia es `lfm1.0`, heredada del modelo base, y el pipeline declarado es text-generation. El autor reporta velocidades de generación de en torno a 222-227 tok/s en un Ryzen AI Max+ 395, así que la ficha debe leerse como documentación de un artefacto de despliegue más que como la de un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2` (transformer, modelo base LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 128.000 tokens (declarada en la model card); el ejemplo de servicio usa 32.768 |
| Tipos de cuantizacion | ROCmFP4 (ftype 102, `Q4_0_ROCMFP4_COHERENT`); mezcla de tensores: ROCmFP4 x92, F32 x55, Q6_K x1 |
| Idiomas soportados | no disponible |
| Licencia | `lfm1.0` (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (requiere el fork ROCmFPX de llama.cpp; no carga en llama.cpp estándar) |
| Tamano del archivo | 695.755.456 bytes (0,65 GiB) |
| Tensores | 148 |
| Embedding de tokens | Q6_K (compartido con la proyección de salida, sin `output.weight` separado) |
| Hardware objetivo | AMD gfx1151: Ryzen AI Max+ 395 / Radeon 8060S (Strix Halo) |
| Runtime medido | ROCm 7.13.0, 125-128 GB de memoria unificada |
| Descargas / likes | 98 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento del modelo base: no se indican el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí se detalla es la arquitectura del artefacto cuantizado. El modelo base emplea la arquitectura `lfm2` de Liquid AI, que en el runtime aparece implementada en `lfm2.cpp` / `lfm2moe.cpp` y que, según las notas del autor, mantiene estado recurrente entre pasos de decodificación, un detalle relevante porque condiciona el soporte de decodificación especulativa.

La innovación técnica de esta publicación no está en los pesos sino en el formato. ROCmFP4 es un formato de tensor en tiempo de ejecución que solo el fork ROCmFPX de llama.cpp sabe interpretar; el archivo declara `general.file_type` 102 (COHERENT). El autor documenta que las dos recetas de cuantización previstas (LEAN, ftype 101, y COHERENT, ftype 102) producen resultados idénticos para este checkpoint, porque la proyección de salida está atada al embedding de tokens y ambas recetas asignan Q6_K a ese tensor compartido; por eso solo se publica un archivo en lugar de dos que diferirían únicamente en la clave declarada.

El autor incluye además una auditoría negativa del decodificador especulativo DSpark de LiquidAI sobre este hardware. Con `--spec-type draft-dspark --spec-draft-n-max 8` la generación cae un 28,4 % (de 222,5 a 159,3 tok/s) con una longitud media aceptada de 2,34 sobre un bloque de 9. Se identifican dos causas en el runtime: `lfm2.cpp` / `lfm2moe.cpp` no rellenan `t_layer_inp[]`, lo que provoca un `GGML_ASSERT` que aborta el drafter salvo que se aplique un parche de una línea, y, una vez parcheado, llama.cpp avisa de que el rollback de estado recurrente no es compatible con `draft-dspark` y recurre a una ruta de checkpoint que no es bit-exacta para el estado recurrente de LFM2, con divergencia reproducible 3 de 3 veces respecto a la salida greedy. El autor descarta un error off-by-one en el mapeo de capas tras probar `LLAMA_DFLASH_TARGET_LAYER_OFFSET=-1`, que empeora la longitud aceptada a 2,22.

## Capacidades

- Generación de texto conversacional en formato instructivo, según el pipeline declarado (`text-generation`, tag `conversational`).
- Tool calling / function calling: el autor reporta 7/7 llamadas correctas tanto con `tool_choice` en modo `required` como en modo `auto`.
- Capacidad de razonamiento multi-paso y uso como agente: no hay mediciones específicas publicadas en la información disponible.
- Capacidades multilingües: no disponible; la model card no declara lista de idiomas.
- Modo thinking explícito, visión o audio: no disponible en la información proporcionada.
- Generación de código: el autor mide generación sobre 6 prompts de código (223,3 tok/s de media, rango 222,6-223,9), lo que evidencia uso práctico en ese dominio aunque no se reporte calidad.
- Ventana de contexto larga: 128.000 tokens declarados en el archivo, con ejemplo de servicio a 32.768 tokens.

## Casos de uso

- Asistente conversacional local en equipos Strix Halo: un Ryzen AI Max+ 395 con 128 GB de memoria unificada puede mantener el modelo residente en ~0,65 GiB y servir conversaciones multi-turno a más de 200 tok/s, lo que hace viable un asistente personal con latencia inferior a la de lectura humana.
- Automatización de agentes con tool calling: el resultado de 7/7 llamadas correctas en ambos modos de `tool_choice` permite integrar el modelo como planificador de herramientas en flujos de automatización domésticos o de laboratorio, con la ventaja de que el estado completo cabe en memoria integrada.
- Generación de código en estación de trabajo: con 223 tok/s sostenidos en prompts de código y 32.768 tokens de contexto en la configuración de servicio recomendada, es adecuado para autocompletado y generación de funciones en editores, sin depender de API externa.
- Procesamiento de documentos largos en local: la ventana declarada de 128.000 tokens permite resumir o extraer información de contratos, informes o transcripciones extensas en un solo pase, siempre que se valide el comportamiento real en contextos largos (el autor no lo ha medido).
- Prototipado y evaluación de runtimes ROCm: sirve como banco de pruebas para desarrolladores que trabajan con el fork ROCmFPX, ya que es la primera build ROCmFP4 de la familia LFM2.5 y permite comparar el rendimiento de tipos de tensor de 4 bits frente a k-quants estándar.
- Servicio HTTP ligero con API compatible con OpenAI: el comando documentado (`superroc serve ... --served-model-name lfm2.5 --context 32768`) expone el modelo en el puerto 8080 con endpoints compatibles, lo que facilita sustituir un backend en la nube por inferencia local en pruebas de integración.
- Inferencia por lotes de baja concurrencia en hardware de consumo: las mediciones se tomaron con una petición a la vez y caché de prompt en frío, un régimen realista para scripts de generación masiva de texto en un único equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni perplejidad) en la información disponible. El autor indica explícitamente que la perplejidad no está publicada para esta build y que la evidencia de calidad se limita a una comprobación de coherencia y a una auditoría a nivel de tensor. Sí se publican mediciones de throughput en hardware concreto:

| Medicion | Entorno | Resultado |
|---|---|---|
| Procesamiento de prompt (1585 tokens) | Ryzen AI Max+ 395, Radeon 8060S, ROCm 7.13.0, 128 GB, 1 petición | 6992,6 tok/s |
| Generación tras ese prompt (hasta 256 tokens) | mismo entorno | 210,7 tok/s |
| Generación de código, 6 prompts, hasta 256 tokens, media (rango) | mismo entorno | 223,3 tok/s (222,6-223,9) |
| Generación, `llama-cli -ngl 999 -fa on -c 512 -n 64 --temp 0 --seed 1234` | Ryzen AI Max+ 395, 125 GB unificada, equipo inactivo | 227,1 tok/s |
| Generación, benchmark de 3 repeticiones, `-c 2048 -n 512` | mismo entorno | 222,5 tok/s |
| Generación con DSpark (`--spec-type draft-dspark --spec-draft-n-max 8`) | mismo entorno | 159,3 tok/s (-28,4 %) |
| Llamadas a herramienta correctas (`tool_choice` required / auto) | mismo entorno | 7/7 / 7/7 |

## Requisitos de hardware

- VRAM/memoria: el archivo pesa 695.755.456 bytes (0,65 GiB), por lo que el peso de los parámetros es mínimo; el consumo real vendrá dominado por la caché KV a contexto largo. Con 128.000 tokens de contexto declarados, la memoria para KV puede superar ampliamente a la de los pesos, aunque la información disponible no cuantifica su tamaño.
- GPU objetivo: AMD Radeon 8060S integrada en el Ryzen AI Max+ 395 (gfx1151, Strix Halo). El formato ROCmFP4 solo existe en el fork ROCmFPX de llama.cpp, así que otras GPU no están soportadas por esta build.
- GPU de consumo: no se han publicado mediciones en RTX 4090, A100, H100 ni en otras GPU AMD fuera de gfx1151. Al requerir un fork específico, la portabilidad a otros backends no está garantizada.
- Memoria del sistema: las pruebas se ejecutaron con 125-128 GB de memoria unificada; el autor no indica el mínimo necesario.
- Despliegue: `llama-cli` del fork ROCmFPX con `-ngl 999 -fa on`, y el servidor `superroc serve` (https://github.com/kingjones30/superroc) con endpoints compatibles. No se menciona compatibilidad con vLLM, TGI, Ollama ni llama.cpp estándar.
- Latencia y throughput: 210,7-227,1 tok/s de generación y 6992,6 tok/s de procesamiento de prompt en el hardware medido, con una sola petición concurrente y caché de prompt en frío.
- Decodificación especulativa: desaconsejada en este hardware; DSpark reduce el throughput un 28,4 % y además requiere parchear el runtime y no preserva la equivalencia bit-exacta con la salida greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-ROCmFP4-GGUF (este) | 1,17 B | 128.000 | GGUF ROCmFP4, solo fork ROCmFPX | lfm1.0 | 222-227 tok/s en gfx1151; tool calling 7/7; sin benchmarks de calidad publicados |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,17 B | 128.000 | safetensors (modelo original) | lfm1.0 | Referencia de pesos completa; requiere runtime de propósito general, no optimizado para gfx1151 |
| Builds GGUF estándar de LFM2.5-1.2B-Instruct (LiquidAI, unsloth y otros) | 1,17 B | 128.000 | GGUF con k-quants, llama.cpp estándar | lfm1.0 | Portables a más hardware, pero sin tipos de tensor ROCmFP4; el autor no las ejecutó ni midió |
| LFM2.5-2.6B (variante mayor de la familia) | no disponible con precisión | no disponible | no disponible | lfm1.0 | El autor reporta que DSpark también degrada el rendimiento (-19,1 %) |

## Limitaciones y advertencias

- Dependencia de runtime: el archivo no carga en llama.cpp estándar; exige el fork ROCmFPX. Esto limita la portabilidad, la mantenibilidad y la superficie de auditoría del código de inferencia.
- Hardware restringido: las mediciones y la optimización se circunscriben a gfx1151 (Ryzen AI Max+ 395 / Radeon 8060S). No hay datos de rendimiento en otras GPU.
- Ausencia de métricas de calidad: no se publica perplejidad ni resultados en MMLU, HumanEval, GSM8K u otros. La única evidencia es una comprobación de coherencia sobre una continuación de ejemplo y una auditoría de tipos de tensor.
- Comportamiento en contexto largo no verificado: aunque el archivo declara 128.000 tokens, el autor indica explícitamente que no ha medido el comportamiento en contextos largos; el ejemplo de servicio usa 32.768.
- Decodificación especulativa contraproducente: DSpark pierde un 28,4 % de throughput en este tamaño, requiere un parche en `lfm2.cpp` / `lfm2moe.cpp` para no abortar y no reproduce la salida greedy de forma bit-exacta por falta de rollback de estado recurrente.
- Idiomas no declarados: la model card no especifica la lista de idiomas soportados, lo que impide garantizar calidad fuera del inglés en ausencia de evaluación.
- Riesgo de alucinación y sesgos: no hay información publicada sobre evaluación de sesgos, filtrado de datos ni tasas de alucinación del modelo base en la documentación disponible.
- Licencia: `lfm1.0` (license: other). Es una licencia propia de Liquid AI, no una licencia open source estándar; deben revisarse sus términos antes de cualquier uso comercial, ya que la información disponible no detalla las restricciones concretas.
- Madurez del artefacto: 98 descargas y 0 likes, publicado por un autor individual y no por Liquid AI; conviene tratar la build como experimental y validarla antes de usarla en producción.
- Fecha de creación declarada en el repositorio (2026-08-22) y notas internas fechadas en 2026-10-25; verificar la correspondencia entre las notas y el archivo efectivamente descargado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/LFM2.5-1.2B-Instruct-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Servidor Super ROC: https://github.com/kingjones30/superroc
