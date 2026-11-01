# Loke-60000/qwomputer-9b-exp

## Resumen

Qwomputer 9B (experimental) es un modelo de lenguaje derivado de Qwen3.5-9B al que se le ha incorporado, directamente en los pesos, una CPU RISC-V de 32 bits (RV32IM) funcional. Lo desarrolla Loke-60000 partiendo del trabajo Qwenputer de divagr1925. El problema que aborda es la aritmetica exacta: cuando el modelo invoca su herramienta `calc`, la respuesta no la produce Python ni un sandbox, sino un circuito logico compilado que se ejecuta dentro de los propios forward passes del modelo, de forma determinista y exacta. Los pesos de Qwen permanecen intactos; el circuito se calcula mediante un compilador, no se entrena.

La relevancia es experimental: sirve para medir cuanto puede beneficiarse un modelo de 9B de un computador embebido en pesos frente a uno de 4B (Qwenputer original). Segun la model card, el computador aporta 35 puntos adicionales al 9B en el conjunto de pruebas aritmeticas (de 162 a 197 sobre 200), con especial mejora en multiplicaciones grandes (de 30 a 40). El checkpoint almacena 18.208.957.504 parametros, aunque la mayoria es relleno de ceros, y ocupa 36,5 GB en bf16.

La arquitectura base es Qwen3.5-9B (32 capas, hidden size 4096), a la que se anaden 11 capas de "chip" delante y se amplia el hidden size a 5632 y el vocabulario a 478.656 para alojar el circuito. Es un modelo solo para ingles, licencia Apache-2.0 y pensado exclusivamente para el bucle de decodificacion `RvChat` de Qwenputer; `generate()` estandar carga el modelo pero no ejecuta la maquina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) con 11 capas de chip RISC-V compiladas en los pesos |
| Parametros totales | 18.208.957.504 (mayoria relleno de ceros; Qwen base 9.0B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only para capas lineales de Qwen (script `w8.py`); bf16 en checkpoint |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (pesos); MIT para compilador y codigo de decodificacion Qwenputer |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer de 32 capas con hidden size 4096 y vocabulario de 248.320 tokens. Sobre esa base se anaden 11 capas de chip delante de las 32 de Qwen, se amplia el hidden size a 5632 para dar cabida al circuito y se expande el vocabulario a 478.656 tokens. El 9B dispone de cabeza de salida propia (el 4B la tiene atada a los embeddings); conserva los pesos de Qwen y anade las columnas de lectura del circuito. El checkpoint en bf16 ocupa 36,4 GB, de los cuales gran parte es relleno de ceros.

No hay entrenamiento de los pesos del computador: el circuito se genera con el compilador de Qwenputer y la firmware `calc`, y los pesos de Qwen no se tocan. Segun la model card, el build del 4B publicado con el mismo compilador es bit a bit identico en 572 de 580 tensores; los 8 restantes estan ajustados a GPU y difieren en un paso bf16. El modelo se ejecuta en modo greedy, con thinking desactivado y un system prompt (`NUDGE`) que fuerza el uso de la herramienta. La maquina solo funciona dentro del bucle `RvChat`, que carga la firmware y decodifica en lockstep los tokens de la maquina y el texto.

## Capacidades

- Generacion de texto conversacional en ingles.
- Aritmetica exacta mediante la herramienta `calc`, ejecutada por una CPU RV32IM dentro de los forward passes (sumas, restas, multiplicaciones, divisiones y cadenas `mul_div`).
- Tool calling / function calling: el modelo invoca `calc` de forma autonoma cuando se le indica mediante prompt.
- Razonamiento multi-paso limitado: puede encadenar varias llamadas a `calc`, aunque con riesgo de bucles.
- Sin soporte de vision, audio ni otras modalidades indicado en la informacion disponible.
- Sin capacidades multilingues mas alla del ingles.
- No dispone de modo thinking activo en el uso recomendado (se desactiva).

## Casos de uso

- Calculo aritmetico exacto en asistentes tecnicos: el modelo puede resolver productos y divisiones de enteros grandes sin error de redondeo, delegando en la CPU RV32IM embebida, lo que resulta util en herramientas de contabilidad o ingenieria donde el decimal flotante no es aceptable.
- Verificacion de expresiones aritmeticas en pipelines de datos: integrado en un flujo que necesite comprobar resultados numericos exactos, el modelo devuelve el resultado de la maquina con precision garantizada (0 errores de lockstep y 0 desajustes de cabeza frente a la RISC-V de referencia en 1.020 llamadas).
- Prototipos de investigacion sobre computacion en pesos: sirve para estudiar como un LLM de 9B aprende a usar una herramienta computacional embebida y comparar su eficiencia frente al 4B (41 llamadas frente a 164 en 40 problemas sinteticos).
- Educacion y demostraciones de arquitecturas hibridas: permite mostrar en un entorno controlado como se compila un circuito logico en los pesos de un transformer y como se ejecuta en lockstep durante la decodificacion.
- Evaluacion de robustez de tool use: util para medir la tendencia del modelo a rellamar la herramienta sobre respuestas ya obtenidas y detectar bucles de hasta agotar tokens.
- Experimentos de cuantizacion y despliegue con memoria limitada: los scripts `lowmem.py` y `w8.py` permiten cargar el modelo en unos 10 GiB de VRAM descartando el relleno de ceros y usando int8 weight-only, lo que facilita pruebas en GPUs de gama alta de consumo.

## Benchmarks y rendimiento

Los datos de la model card se refieren a conjuntos sinteticos de 40 problemas por set, con capas de Qwen en int8.

| Metrica | Qwen3.5-9B base | Qwomputer 9B | Qwen3.5-4B base | Qwomputer 4B |
|---|---|---|---|---|
| Puntuacion global (sobre 200) | 162 | 197 | 143 | 192 |
| Multiplicaciones grandes | 30 | 40 | 19 | 39 |
| Cadenas `mul_div` largas | 34 | 38 | no disponible | no disponible |

- 1.020 llamadas a herramienta y 4,9M tokens de maquina; 0 errores de lockstep y 0 desajustes de cabeza frente a la RISC-V de referencia.
- El 9B es mas eficiente usando la herramienta: 41 llamadas frente a 164 del 4B en 40 problemas sinteticos, y entre 1,8 y 3,9 veces mas rapido por problema en 4 de los 5 sets.
- Los fallos del 9B son de Qwen, no de la maquina: 2 bucles largos de rellamada en `div_big` y 1 expresion `mul_div` mal descompuesta (aunque la maquina calculo bien cada pieza). El 9B base tiende a devolver decimal redondeado en `div_big`, por lo que rinde peor que el 4B base en ese set.

## Requisitos de hardware

- VRAM estimada: unos 10 GiB de GPU con `lowmem.py` y `w8.py` (capas de Qwen int8 weight-only, relleno de ceros descartado y ejecutor Triton fp32 del circuito). El checkpoint completo en bf16 ocupa 36,4 GB.
- GPU recomendadas: no especificadas en la informacion disponible; por el perfil de memoria, encaja en GPUs de 12-16 GB o superiores. A100, H100 y RTX 4090 son compatibles por capacidad, aunque no hay datos oficiales de rendimiento.
- Cabe en GPU de consumo con al menos 10-12 GiB de VRAM usando los scripts de bajo consumo.
- Opciones de despliegue: exclusivamente mediante el bucle `RvChat` de Qwenputer (`qwenputer/experimental/riscv`, con `uv sync --extra hf`). `generate()` estandar de transformers carga el modelo pero no ejecuta la maquina. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma agregada; la model card solo indica que el 9B es 1,8-3,9 veces mas rapido por problema que el 4B en 4 de los 5 sets, y que cada llamada anade cientos o miles de tokens de maquina a la cache (unos 2.300 para un producto grande).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aritmetica exacta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwomputer 9B (experimental) | 18,2B almacenados (9,0B Qwen) | no disponible | Si, via CPU RV32IM en pesos | Apache-2.0 / MIT (codigo) | HuggingFace, requiere RvChat |
| Qwenputer 4B (divagr1925) | 4B base | no disponible | Si, via CPU RV32IM en pesos | Apache-2.0 / MIT (codigo) | HuggingFace |
| Qwen3.5-9B (base) | 9,0B | no disponible | No (aritmetica aproximada) | Apache-2.0 | HuggingFace |
| Qwen3.5-4B (base) | 4B | no disponible | No (aritmetica aproximada) | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- La maquina hace la aritmetica exacta, pero no mejora el razonamiento: los problemas de enunciado siguen dependiendo de Qwen.
- Qwen puede volver a llamar a `calc` sobre una respuesta que ya tiene y entrar en bucle hasta agotar los tokens.
- Cada llamada anade cientos o miles de tokens de maquina a la cache (unos 2.300 para un producto grande), lo que encarece el contexto.
- Los benchmarks son pequenos: 40 problemas por set, ejecutados con capas de Qwen en int8.
- Solo funciona dentro del bucle `RvChat`; `generate()` estandar no da las respuestas de la maquina.
- Uso recomendado en greedy, con thinking desactivado y un system prompt especifico (`NUDGE`) que fuerza el uso de la herramienta.
- Solo ingles; sin soporte multilingue.
- Riesgo de alucinacion en el razonamiento textual fuera de la aritmetica; el modelo no esta alineado ni evaluado para produccion.
- Licencia Apache-2.0 para pesos y MIT para el compilador y el codigo de decodificacion; es un derivado de Qwen y de un circuito compilado por Qwenputer, por lo que conviene revisar `LICENSE` antes de uso comercial.
- Modelo experimental: no hay garantias de estabilidad ni de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Loke-60000/qwomputer-9b-exp
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base Qwen3.5-4B-Qwenputer: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Repositorio Qwenputer: https://github.com/divagr18/qwenputer
- Documentacion de la RISC-V de Qwenputer: https://github.com/divagr18/qwenputer/tree/main/experimental/riscv
- Perfil de divagr1925: https://huggingface.co/divagr1925
