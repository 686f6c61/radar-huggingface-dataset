# audreyt/Arete-27B-pi-YASAKANI-quality

## Resumen

Arete-27B-pi-YASAKANI-quality es un paquete de pesos cuantizados para inferencia local del modelo Arete-27B de Nous Research, con el adaptador de codigo pi de harness-hub fusionado directamente en los pesos. Lo publica la cuenta audreyt y esta pensado para el motor Yasakani 0.1.4, un runtime propietario de inferencia con decodificacion especulativa que requiere una biblioteca nativa (`libyskn.so` en Linux, `yskn.dll` en Windows). No es un modelo nuevo: es una conversion cuantizada de una fusion ya existente, empaquetada junto con el modelo draft, la cabeza draft y el perfil KV necesarios para la decodificacion especulativa.

El modelo base es NousResearch/Arete-27B (commit `108f0af`), un transformer denso de 27B parametros derivado de Qwen3.8-27B. Sobre el se aplico el adaptador LoRA de rango 32 y alpha 64 de harness-hub/Qwen3.8-27B-pi-adapted (commit `e786f84`), que aporta capacidades de codificacion y de uso de herramientas. La fusion se calculo en FP32 como `Arete + 2 × (B @ A)` y se redondeo una sola vez a BF16 antes de cuantizar. El checkpoint resultante ocupa 12.365.242.368 bytes y se distribuye en 11 ficheros verificables por SHA-256.

La relevancia de este paquete es acotada pero concreta: demuestra un flujo completo de fusion de adaptadores, cuantizacion mixta de 3 y 4 bits, y validacion bit a bit de la inferencia especulativa sobre una GPU de consumo (RTX 5090). El autor documenta verificaciones reproducibles (hashes, selfcheck, comparacion con teacher forcing) y mide throughput de decodificacion, lo que lo convierte en una referencia util para quien quiera replicar el pipeline, no tanto para quien busque un modelo de proposito general listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B via NousResearch/Arete-27B) |
| Parametros totales | 27B (aproximado por el nombre del modelo base; no se detalla en la informacion disponible) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens configurados en el ejemplo de servido; el manifiesto declara un limite de configuracion de 262.144 tokens (no validado como calidad de contexto largo) |
| Tipos de cuantizacion | Mixta: 288 de 400 matrices del cuerpo a 4 bits por peso, 112 a 3 bits por peso; cabeza de salida a 4 bits; embeddings sin cuantizar copiados del pack original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario Yasakani (11 ficheros verificables, tamano total del repo 15,0 GB); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.8, en la variante Arete-27B de Nous Research. Sobre ese modelo base se aplico un adaptador LoRA de rango 32 con alpha 64 entrenado por harness-hub sobre Qwen3.8-27B "stock" (el padre de Arete), no sobre Arete directamente. La fusion se ejecuta en FP32 con la formula `Arete + 2 × (B @ A)` y un unico redondeo a BF16, aplicando las 256 parejas de rango 32. El script de reproduccion (`reproduce/bake_pi_merge.py`) verifica muestras escalares independientes en cada tensor objetivo y compara byte a byte los 928 tensores no afectados por la fusion.

Tras la fusion, el conversor de Yasakani cuantiza el checkpoint con 192 ventanas de calibracion y un checksum publicado. El resultado es una cuantizacion mixta: 288 matrices del cuerpo a 4 bits y 112 a 3 bits. La cabeza de salida de 4 bits se recalcula con las activaciones fusionadas y el embedding se copia sin cambios del pack original de Arete. El paquete incluye tambien el tokenizer del adaptador, cuyos IDs coinciden con los de Arete pero cuyo pre-tokenizer trata los signos diacriticos combinados de forma distinta; el autor verifico que la plantilla de chat de inferencia de Arete produce el mismo texto e IDs que la plantilla de entrenamiento del adaptador en seis configuraciones, incluyendo historial de asistente y de herramientas. La innovacion tecnica destacable es la decodificacion especulativa integrada (modelo draft, cabeza draft y perfil KV propios) que acelera la generacion sin modificar el motor.

## Capacidades

- Generacion de texto conversacional en ingles (idiomas adicionales no documentados).
- Razonamiento con modo "thinking" activable mediante `enable_thinking` en la peticion HTTP o mediante `YASAKANI_THINKING_BUDGET`; el flag `--thinking off` de pi no suprime por si solo los bloques de razonamiento segun el autor.
- Codificacion: el adaptador pi aporta capacidad de leer, editar y corregir codigo; en la prueba de humo el modelo identifico un bug en una funcion de batching en Python y ajusto el limite del bucle para preservar el ultimo lote parcial.
- Aritmetica basica: en la prueba documentada devolvio `391` para `17 × 23` con thinking desactivado.
- Servido mediante API compatible con OpenAI (`/v1`, `openai-completions`), lo que permite integrarlo con clientes que hablan ese protocolo.
- Decodificacion especulativa con draft propio, con verificacion de consistencia (IDs greedy identicos con y sin especulacion en las cuatro prompts medidas).
- Tool calling: no se documenta explicitamente en la informacion disponible; la plantilla de chat probada incluye historial de herramientas, pero no hay confirmacion de soporte funcional completo.
- Capacidades multimodales: no disponibles (el paquete es explicitamente text-only).
- Capacidades de agente multi-paso: no documentadas; el autor indica que no se evaluo en Terminal-Bench ni SWE-bench.

## Casos de uso

- Asistencia de codificacion local en estaciones de trabajo con GPU de consumo: el paquete esta disenado para correr en una RTX 5090 con el motor Yasakani y un contexto de 32.768 tokens, lo que permite mantener un repositorio mediano en contexto y editar ficheros con el adaptador pi ya fusionado, sin necesidad de cargar LoRA en tiempo de ejecucion.
- Correccion de bugs en funciones aisladas: la prueba de humo documentada (arreglo de un limite de bucle en un batching de Python, validado con cinco casos de entrada/salida y dos de tamano invalido) muestra un uso realista para tareas de parcheo acotadas con verificacion posterior en sandbox.
- Servicio local compatible con OpenAI para herramientas de terceros: al exponer `http://127.0.0.1:8765/v1` con API `openai-completions`, se puede conectar a clientes que ya hablan ese protocolo (incluido pi 1.5.2) sin adaptadores adicionales.
- Evaluacion y reproduccion de pipelines de fusion de adaptadores: el paquete incluye el script de fusion, los hashes de los 18 shards BF16 del modelo base y del adaptador, y un checksum de calibracion, lo que lo hace util como caso de estudio reproducible para ingenieros que quieran validar su propio flujo de bake-in de LoRA.
- Benchmarking de decodificacion especulativa: las mediciones publicadas (108,7 tok/s en modo plano y hasta 1.127,6 tok/s en la tarea CSV a JSON con especulacion) sirven como referencia para comparar implementaciones de draft models y perfiles KV en hardware consumer.
- Prototipado de asistentes conversacionales con contexto medio: con 32.768 tokens configurados y un throughput estable en prosa (108,8 tok/s planos, 219,1 tok/s especulativos), es adecuado para demos de chat multi-turno en local sin depender de la nube.
- Tareas de transformacion de datos estructurados: el caso CSV a JSON alcanza el mayor throughput especulativo de la tabla (1.127,6 tok/s), lo que sugiere un uso practico para pipelines de conversion de formato en lote sobre GPU unica.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K). Indica explicitamente que la conversion no se evaluo en Terminal-Bench, SWE-bench ni Propaganda_Eval, y que las puntuaciones del adaptador y del modelo base upstream no establecen el rendimiento de esta combinacion. Los unicos datos numericos disponibles son mediciones de throughput de decodificacion en una RTX 5090 con motor Yasakani, 512 tokens por prompt, motor caliente y KV5 por defecto (excluyen carga y prefill):

| Prompt | Arete plano | Arete-pi plano | Arete especulativo | Arete-pi especulativo |
|---|---:|---:|---:|---:|
| Prosa | 108,7 | 108,8 | 214,2 | 219,1 |
| Thinking | 108,7 | 108,8 | 192,7 | 215,5 |
| Codigo | 108,7 | 108,8 | 353,6 | 333,5 |
| CSV a JSON | 108,1 | 108,5 | 1.125,1 | 1.127,6 |

El throughput plano es practicamente identico entre el pack original y el pack pi. En el prompt de codigo, la especulacion es un 5,7% mas lenta con el pack pi (3,76 tokens confirmados por pasada frente a 4,09). El autor advierte que estas cuatro prompts no constituyen una clasificacion general de velocidad.

En cuanto a fidelidad de la cuantizacion, el pack coincide con el modelo fusionado en BF16 en el siguiente token mas probable en el 95,57% de 20.460 posiciones evaluadas, con una divergencia KL media que el texto disponible trunca (empieza por "0.0"). El selfcheck reproduce 3/3 salidas greedy y la comprobacion de consistencia copia/edicion confirma 1.080 tokens generados frente a teacher forcing y coincidencia bit a bit entre pasadas de 16 y 64 posiciones sobre 2.206 posiciones.

## Requisitos de hardware

- VRAM estimada: el checkpoint objetivo pesa 12.365.242.368 bytes (unos 12,4 GB) y el repo completo 15,0 GB; a ello hay que sumar el modelo draft, la cabeza draft y el perfil KV, cuyo tamano no se detalla en la informacion disponible. Con contexto de 32.768 tokens, la VRAM efectiva sera superior a los 12,4 GB del objetivo.
- GPU de referencia: el autor publica mediciones en una unica RTX 5090 bajo Linux. No se documentan resultados en A100, H100 ni otras GPU.
- GPU de consumo: el paquete esta pensado para caber en una RTX 5090 (32 GB de VRAM). No hay datos que confirmen su funcionamiento en GPU con menos memoria.
- Despliegue: requiere el motor Yasakani 0.1.4 y su biblioteca nativa (`libyskn.so` en Linux, `yskn.dll` en Windows). No se soporta vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es propietario y depende del runtime.
- Latencia y throughput: segun la tabla anterior, 108,7-108,8 tok/s en modo plano y 192,7-1.127,6 tok/s con especulacion segun el tipo de prompt, en RTX 5090.
- Contexto maximo practico: el ejemplo de servido usa `--max-ctx 32768`; el limite de 262.144 tokens del manifiesto es una restriccion de configuracion, no una validacion de calidad en contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audreyt/Arete-27B-pi-YASAKANI-quality | 27B (denso) | 32.768 configurados; 262.144 como limite de manifiesto | 108,7-1.127,6 tok/s en RTX 5090 segun prompt; 95,57% de coincidencia con BF16 | Apache 2.0 | Solo motor Yasakani, formato propietario |
| audreyt/Arete-27B-YASAKANI-quality | 27B (denso) | Mismo manifiesto | 108,1-1.125,1 tok/s en RTX 5090; sin adaptador pi | Apache 2.0 | Solo motor Yasakani |
| NousResearch/Arete-27B | 27B (denso) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Pesos BF16 en Hugging Face |
| harness-hub/Qwen3.8-27B-pi-adapted | 27B (adaptador LoRA sobre Qwen3.8-27B) | no disponible | no disponible | no disponible | Adaptador en Hugging Face |

La comparacion con alternativas de la misma categoria (por ejemplo, otros 27B densos con soporte de codigo) no es posible con los datos disponibles: no se han publicado resultados de benchmarks academicos ni de tareas estandar para este paquete, y el autor advierte que las puntuaciones del adaptador y del modelo base no son extrapolables.

## Limitaciones y advertencias

- Dependencia total del runtime Yasakani: los pesos no son cargables en vLLM, llama.cpp, Ollama ni TGI. Sin la biblioteca nativa (`libyskn.so` o `yskn.dll`) y la version 0.1.4 del motor, el paquete es inutilizable.
- Sin evaluacion en benchmarks academicos ni de agentes: el autor declara explicitamente que no se probo en Terminal-Bench, SWE-bench ni Propaganda_Eval, y que los resultados de las pruebas de humo (un parche de Python y una multiplicacion) no constituyen una evaluacion de capacidades.
- El flag de thinking de pi no suprime el razonamiento: en la prueba documentada, `--thinking off` siguio produciendo bloques de razonamiento en la traza; solo la peticion HTTP con `enable_thinking: false` reporto cero tokens de razonamiento. En produccion hay que controlar el thinking a nivel de peticion, no de cliente.
- Divergencia respecto a BF16: la cuantizacion mixta de 3 y 4 bits alcanza un 95,57% de coincidencia en el siguiente token, lo que implica un 4,43% de posiciones donde el token mas probable difiere del modelo fusionado en BF16. Para tareas sensibles a la fidelidad exacta (generacion de codigo con verificacion estricta, calculo) esto puede ser relevante.
- Contexto largo no validado: el limite de 262.144 tokens del manifiesto es una restriccion de configuracion; el autor no aporta resultados de calidad en contexto largo, y el ejemplo de servido usa 32.768.
- Tokenizer distinto al de Arete: aunque los IDs coinciden, el pre-tokenizer del adaptador trata los signos diacriticos combinados de forma diferente; el autor solo verifico equivalencia en seis configuraciones de plantilla de chat. Usuarios con texto no ingles o con marcas combinadas deberian validar el comportamiento.
- Idiomas: no se documenta que idiomas soporta; el material disponible esta integramente en ingles.
- Sesgos y alucinacion: no hay informacion publicada sobre sesgos conocidos ni sobre tasas de alucinacion para este paquete.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base NousResearch/Arete-27B y del adaptador harness-hub, cuyas licencias no se detallan en la informacion disponible.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-18; es un artefacto reciente y sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audreyt/Arete-27B-pi-YASAKANI-quality
- Pack original de Arete para Yasakani: https://huggingface.co/audreyt/Arete-27B-YASAKANI-quality
- Modelo base NousResearch/Arete-27B (commit `108f0af`): https://huggingface.co/NousResearch/Arete-27B/tree/108f0afbdcfaa1ceeda4a635004304dfff6d4da2
- Adaptador harness-hub/Qwen3.8-27B-pi-adapted (commit `e786f84`): https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted/tree/e786f8491742268f9b2bc729697b13bfac26d4ad
- Script de fusion `reproduce/bake_pi_merge.py`: incluido en el repositorio del modelo
- Conversor de Yasakani (commit `95b527c`): https://github.com/yasakani-dev/yasakani/tree/95b527c0e36a81751520abcc4cbb83b11010df82/tools/convert
- Benchmark de look-ahead upstream: https://github.com/yasakani-dev/yasakani/blob/95b527c0e36a81751520abcc4cbb83b11010df82/quickstart/lookahead_check.py
- Repositorio principal de Yasakani: https://github.com/yasakani-dev/yasakani
