# bong-water-water-bong/bitnet-ternary-moe-gguf

## Resumen

bitnet-ternary-moe-gguf es un experimento de despliegue publicado por el usuario bong-water-water-bong que combina un modelo base BitNet ternario de Microsoft Research con dos adaptadores LoRA ligeros que actúan como "expertos" especializados. El modelo base es microsoft/bitnet-b1.58-2B-4T, un transformer de 2.412.820.480 parámetros cuyos pesos se cuantizan a valores ternarios (-1, 0, +1) en formato TQ1_0. Sobre esa base se cargan dos adaptadores LoRA de rango 32 (multiplicación de dos dígitos y numeración romana) que se activan dinámicamente en tiempo de ejecución mediante un router externo, sin fusionarse nunca con los pesos del modelo base.

La propuesta es fundamentalmente de eficiencia: un único modelo base de aproximadamente 1 GB en disco (1,03 GB el GGUF ternario más 55 MB por adaptador) sirve a varios "expertos" sin duplicar la carga en memoria, lo que según el autor reduce el uso de memoria en torno a 5 veces frente a un despliegue equivalente en bf16 de unos 5 GB. El objetivo declarado es ejecutar el conjunto en la CPU de un portátil corriente, sin GPU.

Es relevante ahora porque explora una vía práctica para el paradigma de mezcla de expertos mediante LoRA en tiempo de ejecución sobre modelos de pesos de baja precisión (1.58 bits), un área activa de investigación en inferencia eficiente. Conviene señalar que no es un modelo de propósito general ni un MoE entrenado de forma nativa: es una receta de despliegue con dos adaptadores muy específicos y un router externo, y requiere un fork concreto del motor llama.cpp con parches aplicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BitNet b1.58) con pesos ternarios; adaptadores LoRA externos activados en tiempo de ejecución |
| Parametros totales | 2.412.820.480 (modelo base) |
| Parametros activos | no disponible (no es un MoE nativo; los "expertos" son adaptadores LoRA de rango 32) |
| Longitud de contexto | 4096 tokens (configuración de ejemplo del autor con `-c 4096`) |
| Tipos de cuantizacion | Ternaria TQ1_0 (recomendada por el autor); TQ2_0 también almacena pesos ternarios pero el autor reporta peor rendimiento; adaptadores en f16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (base y adaptadores); parche del motor en formato `.patch` |

## Arquitectura y entrenamiento

El modelo base es BitNet b1.58 de Microsoft Research, un transformer cuyos pesos lineales se restringen a valores ternarios (-1, 0, +1), lo que permite kernels de multiplicación sin producto completo y un empaquetado de pesos muy compacto. En este repositorio el base se distribuye convertido a GGUF ternario TQ1_0 (1,03 GB), con todas las matrices del transformer en formato ternario. Los dos adaptadores son LoRA de rango 32 con alpha 64 aplicados solo a los módulos FFN, entrenados con PEFT sobre el base en bf16: uno para multiplicación de dos dígitos y otro para numeración romana.

La innovación operativa es el esquema de enrutado en tiempo de ejecución: el base se carga una sola vez y ambos adaptadores se cargan de forma diferida (`--lora-init-without-apply`), activándose uno u otro mediante la API `/lora-adapters` del servidor o mediante un router externo (`moe_driver.py` junto con UlukaDev/bitnet-moe-router, basado en all-MiniLM-L6-v2 con `normalize_embeddings=True`). El autor advierte explícitamente de que los adaptadores no deben fusionarse en el base, porque BitNet recuantiza los pesos en cada pasada y la fusión degenera la salida en tokens repetidos. No se detallan en la información disponible el volumen de tokens de entrenamiento del base ni la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional mediante el endpoint de chat compatible con la API de OpenAI.
- Aritmética de multiplicación de dos dígitos, potenciada por el adaptador `mult` (exact match de 0,80 en la evaluación del autor).
- Conversión y trabajo con números romanos, potenciada por el adaptador `roman` (exact match de 0,30).
- Enrutado automático de preguntas a uno de los dos expertos mediante router externo (precisión de enrutado de 1,00 según el autor).
- Activación y desactivación de adaptadores en caliente vía API HTTP (`/lora-adapters`), con escalas por adaptador.
- Streaming de respuestas en vivo con cancelación sin cerrar la sesión y ajuste de longitud máxima mediante `/limit`.
- No se documentan capacidades de tool calling, razonamiento multi-paso general, visión, audio ni un modo "thinking" explícito.

## Casos de uso

- Despliegue en portátiles sin GPU: el conjunto completo (base ternario más dos adaptadores) ocupa alrededor de 1,14 GB en disco y está pensado para ejecutarse en CPU, lo que permite probar inferencia con pesos de 1.58 bits en hardware de consumo.
- Experimentación con MoE mediante LoRA: sirve como banco de pruebas para estudiar el enrutado en tiempo de ejecución y la conmutación de adaptadores sobre un único base cargado, sin duplicar memoria.
- Asistente aritmético acotado: con el experto `mult` activo y temperatura 0, puede emplearse en tareas de multiplicación de dos dígitos dentro de un flujo con formato de salida fijo ("The answer is X").
- Conversión de números romanos en herramientas educativas o de demostración, activando el experto `roman` cuando la pregunta lo requiera.
- Evaluación de formatos ternarios: el repositorio documenta la diferencia entre TQ1_0 y TQ2_0, por lo que resulta útil para comparar kernels de cuantización ternaria en llama.cpp y forks derivados.
- Prototipado de servidores compatibles con OpenAI: el ejemplo con `llama-server` y `/v1/chat/completions` permite integrar el modelo en aplicaciones existentes que ya hablan ese protocolo.
- Estudio de recuantización y fusión de LoRA en BitNet: el aviso de no fusionar adaptadores es un caso práctico para investigar el comportamiento de los pesos ternarios ante deltas en tiempo de ejecución.

## Benchmarks y rendimiento

Resultados reportados por el autor, temperatura 0 y exact match sobre la línea obligatoria `The answer is X`:

| Tarea | Este stack (ternario) | Base original bf16 | Base ternario sin experto |
|---|---|---|---|
| Multiplicación de 2 dígitos | 0,80 | 0,94 | 0,70 |
| Números romanos | 0,30 | 0,24 | 0,05 |
| Precisión de enrutado | 1,00 | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este stack.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario objetivo (CPU); en GPU, el base ternario de 1,03 GB más los adaptadores de 55 MB cada uno caben holgadamente en cualquier GPU con 4 GB o más, aunque no se proporcionan mediciones.
- GPU recomendadas: no disponibles; el autor no documenta despliegue en GPU.
- CPU: es el destino principal; el autor afirma que corre en la CPU de un portátil corriente, sin cifras de latencia ni throughput.
- Opciones de despliegue: `llama-server` del fork tetherto/qvac-fabric-llm.cpp con el parche `fabric-bitnet-fixes.patch` aplicado; el fork estándar produce salida degenerada según el autor. También `moe_driver.py` con el router UlukaDev/bitnet-moe-router.
- Lanzador: `START HERE.bat` para Windows, que arranca servidor y chat.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| bitnet-ternary-moe-gguf | 2,41 B (base) + 2 LoRA | 4096 | Ternaria TQ1_0 / TQ2_0 | MIT | MoE por adaptadores en tiempo de ejecución; requiere fork parcheado |
| microsoft/bitnet-b1.58-2B-4T | 2,41 B | no disponible | Ternaria (bf16 en origen) | MIT | Modelo base original; sirve como referencia de calidad |
| UlukaDev/bitnet-moe-router | no disponible | no disponible | no disponible | no disponible | Router de embeddings usado por este stack; no es un modelo generativo comparable |

No se dispone en la información proporcionada de comparaciones con otros modelos de tamaño o tarea similares.

## Limitaciones y advertencias

- No es un MoE entrenado de forma nativa: los "expertos" son dos adaptadores LoRA muy específicos (multiplicación de dos dígitos y números romanos); fuera de esas tareas el comportamiento es el del base ternario.
- El rendimiento en números romanos es bajo (0,30 de exact match) incluso con el experto activo; la multiplicación cae de 0,94 en bf16 a 0,80 en el stack ternario.
- Los adaptadores no deben fusionarse en el base: la recuantización por pasada destruye el modelo y produce tokens repetidos.
- Requiere un fork concreto de llama.cpp con un parche aplicado; el fork estándar genera basura repetitiva según el autor. Esto limita la portabilidad y el soporte.
- El formato TQ2_0 neutralizó el experto más débil en las pruebas del autor (0,05, por debajo del base sin experto); la elección de formato afecta materialmente al resultado.
- El router externo exige `normalize_embeddings=True`; una configuración incorrecta degrada el enrutado.
- Riesgo de alucinación y de formato: la evaluación se basa en una línea de salida exacta, lo que no garantiza robustez en conversación abierta.
- Idiomas soportados no documentados; no hay evidencia de capacidades multilingües.
- Sesgos conocidos: no documentados.
- Licencia MIT en base, adaptadores y código, lo que permite uso comercial, pero la dependencia del fork parcheado y de un router externo añade componentes con sus propias licencias que deben verificarse por separado.
- Repositorio con muy poca tracción (184 descargas, 0 likes) y creado en octubre de 2026; no hay validación independiente de los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bong-water-water-bong/bitnet-ternary-moe-gguf
- Modelo base: https://huggingface.co/microsoft/bitnet-b1.58-2B-4T
- Router: https://huggingface.co/UlukaDev/bitnet-moe-router
- Código, lanzador y harness de evaluación: https://github.com/agentulukaADMIN/ternary-moe
- Motor con parches: https://github.com/tetherto/qvac-fabric-llm.cpp
