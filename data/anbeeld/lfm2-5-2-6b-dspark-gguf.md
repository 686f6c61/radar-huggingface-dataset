# Anbeeld/LFM2.5-2.6B-DSpark-GGUF

## Resumen

LFM2.5-2.6B-DSpark-GGUF es una cuantización GGUF del modelo borrador LFM2.5-2.6B-DSpark, desarrollado por Liquid AI como parte de la familia de modelos de decodificación especulativa DSpark. Este modelo no es un modelo de lenguaje independiente, sino un drafter diseñado para acelerar la inferencia del modelo objetivo LiquidAI/LFM2.5-2.6B mediante decodificación especulativa. La compilación en GGUF, publicada por Anbeeld, permite ejecutar el drafter en entornos basados en llama.cpp, como el fork BeeLlama.cpp.

El modelo borrador tiene 327,7 millones de parámetros en BF16, una arquitectura de 5 capas de atención completas con GQA y cabezas adicionales de Markov y de confianza. Según las mediciones de Liquid AI, el uso de este drafter con el modelo objetivo en SGLang proporciona una aceleración media de la decodificación de 2,67× en una H100 y de 2,27× en un Apple M4 Max, sin degradar la calidad del texto generado, ya que la decodificación especulativa es exacta: el modelo objetivo verifica cada token propuesto.

Este modelo es relevante para quienes quieran reducir la latencia de inferencia de LFM2.5-2.6B en producción o en dispositivos locales, especialmente en escenarios con restricciones de memoria o en los que se necesite un despliegue eficiente en hardware variado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DSpark draft model basado en transformer con 5 capas de atención, GQA (32 cabezas de atención, 8 cabezas clave/valor, head_dim=64), intermediate_size=6144, activación SiLU/SwiGLU, Markov head (rank 256) y confidence head |
| Parámetros totales | 327.707.521 (según safetensors del repo) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (niveles no especificados en la información disponible) |
| Idiomas soportados | No disponibles |
| Licencia | Other (no especificada) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

LFM2.5-2.6B-DSpark es un modelo borrador de decodificación especulativa diseñado específicamente para el modelo objetivo LFM2.5-2.6B de Liquid AI. La arquitectura combina un backbone de 5 capas de atención completas con un tamaño oculto de 2048 y un tamaño intermedio de 6144 con activación SiLU/SwiGLU. Utiliza atención con consultas agrupadas (GQA) con 32 cabezas de atención y 8 cabezas de clave/valor, cada una con una dimensión de 64. Además del backbone, incorpora dos cabezas extra: una cabeza de Markov con rango 256 y una cabeza de confianza. El tamaño del vocabulario es de 128.000 tokens y el tamaño de bloque de la decodificación especulativa es de 9.

El entrenamiento y los datos no se detallan en la información disponible. El modelo es parte de la familia LFM2.5-DSpark, que adapta la técnica DSpark para la arquitectura LFM2.5. Su función es proponer bloques de tokens que el modelo objetivo verifica, de modo que la generación final es idéntica a la que produciría el objetivo en solitario. La integración en SGLang requiere una compilación con soporte DSpark (PR #31041). También se puede ejecutar en dispositivos Apple Silicon mediante el backend Metal.

## Capacidades

- Decodificación especulativa: propone bloques de hasta 9 tokens (block size 9) para acelerar la inferencia del modelo objetivo LFM2.5-2.6B.
- Verificación exacta: la salida del modelo objetivo con el drafter es idéntica a la salida sin drafter, por lo que no se degrada la calidad del texto generado.
- Aceleración media de 2,67× en una H100 y de 2,27× en un Apple M4 Max según las pruebas de Liquid AI.
- Compatibilidad con SGLang a través del algoritmo DSpark y con el fork BeeLlama.cpp para cuantización GGUF.
- Ejecución on-device en Apple Silicon (Metal) y en GPU de servidor (H100 en benchmarks).
- No tiene capacidades independientes de generación de texto, razonamiento, código, matemáticas o visión; debe usarse siempre junto con el modelo objetivo.

## Casos de uso

- Aceleración de inferencia en producción con SGLang: desplegar LFM2.5-2.6B con el drafter en un servidor con H100 puede incrementar el throughput de decodificación de ~323 a ~864 tokens/s, lo que permite servir más solicitudes simultáneas sin añadir más GPUs.
- Ejecución local en Apple Silicon: en un Mac con M4 Max, el drafter permite pasar de ~61 a ~139 tokens/s, haciendo viable la ejecución interactiva del modelo objetivo en portátiles de gama alta.
- Reducción de latencia en aplicaciones de agentes: para tareas multi-paso que requieren muchas llamadas al modelo, la aceleración de 2,6× reduce el tiempo de respuesta en sistemas de razonamiento o tool calling.
- Despliegue en entornos con memoria limitada: el drafter añade una cantidad mínima de parámetros (327,7 millones) en comparación con el modelo objetivo, por lo que es una opción ligera para acelerar sin un coste de memoria significativo.
- Integración en pipelines de CI/CD para generación de código: si se usa LFM2.5-2.6B para autocompletar código en herramientas de desarrollo, el drafter puede reducir la latencia por solicitud, mejorando la experiencia del usuario en editores o entornos integrados.
- Investigación en decodificación especulativa: este modelo sirve como referencia para estudiar tasas de aceptación y aceleraciones en distintos hardware y benchmarks, permitiendo comparar estrategias de draft models en arquitecturas no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para este modelo, ya que es un drafter. Los datos disponibles corresponden a la tasa de aceptación y la aceleración conseguida al usarlo con el modelo objetivo LFM2.5-2.6B.

| Benchmark | Aceptación media (1×H100, SGLang) | Aceptación media (Apple M4 Max, Metal) |
|---|---:|---:|
| MATH-500 | 5,67 | 4,45 |
| GSM8K | 4,32 | 4,91 |
| HumanEval | 4,54 | 5,24 |
| MBPP | 4,92 | 4,19 |
| MT-Bench | 4,69 | 3,33 |
| Media | 4,83 | 4,42 |

| Dataset | Aceptación (de 10) | Speedup en H100 | Speedup en M4 Max |
| :--- | :--- | :--- | :--- |
| MATH500 | 5,42 | 3,06× (326 → 1000 tok/s) | 2,25× (61 → 137 tok/s) |
| HumanEval | 4,54 | 2,56× (326 → 835 tok/s) | 2,63× (61 → 161 tok/s) |
| MBPP | 4,71 | 2,64× (326 → 861 tok/s) | 2,11× (62 → 132 tok/s) |
| GSM8K | 4,32 | 2,22× (312 → 693 tok/s) | 2,36× (60 → 143 tok/s) |
| MT-Bench | 5,07 | 2,87× (325 → 933 tok/s) | 1,99× (62 → 123 tok/s) |
| Media | 4,81 | 2,67× (323 → 864 tok/s) | 2,27× (61 → 139 tok/s) |

Nota: los valores de aceptación en la segunda tabla son ligeramente diferentes de la primera porque corresponden a otra medición, tal y como aparecen en la documentación de Liquid AI.

## Requisitos de hardware

- VRAM estimada para el drafter: el modelo tiene 327,7 millones de parámetros. En BF16 ocupa aproximadamente 655 MB; en cuantización GGUF, el tamaño del repositorio es de 2,0 GB, lo que sugiere que incluye varios archivos de cuantización. No se especifica el consumo de VRAM exacto para cada nivel.
- GPU recomendadas: se ha validado en H100 para SGLang y en Apple M4 Max para Metal. Al ser un modelo pequeño, es probable que también funcione en GPUs de consumo con soporte para SGLang o BeeLlama.cpp, pero no hay datos de pruebas en el material disponible.
- Se puede desplegar en Apple Silicon mediante el backend Metal.
- Opciones de despliegue: SGLang (con soporte DSpark, PR #31041) y BeeLlama.cpp (fork de llama.cpp con características de cuantización avanzada).
- Latencia y throughput: con el modelo objetivo, la media en H100 es de 864 tok/s (frente a 323 tok/s sin drafter) y en M4 Max de 139 tok/s (frente a 61 tok/s sin drafter).

## Comparativa con modelos similares

| Modelo | Parámetros del drafter | Modelo objetivo | Aceptación media (H100) | Speedup medio (H100) |
|---|---|---:|---:|---:|
| LFM2.5-2.6B-DSpark | 327,7 M | LFM2.5-2.6B | 4,83 | 2,67× |
| LFM2.5-1.2B-Instruct-DSpark | No disponible | LFM2.5-1.2B-Instruct | No disponible | No disponible |
| LFM2.5-8B-A1B-DSpark | No disponible | LFM2.5-8B-A1B | No disponible | No disponible |

La información sobre los otros modelos de la familia no se incluye en la documentación disponible, por lo que no se pueden aportar más datos de comparación.

## Limitaciones y advertencias

- No es un modelo de generación independiente: debe usarse siempre en combinación con el modelo objetivo LFM2.5-2.6B.
- Requiere una compilación específica de SGLang con soporte DSpark (PR #31041), lo que puede limitar su disponibilidad en instalaciones estándar.
- La licencia aparece como "other" sin especificar, por lo que es necesario revisar los términos antes de un uso comercial.
- No se proporciona información sobre idiomas soportados ni longitud de contexto, lo que impide conocer las capacidades lingüísticas y de ventana del modelo objetivo en este despliegue.
- Los benchmarks de rendimiento se han realizado en hardware concreto (H100 y M4 Max) y con tamaños de lote de 1; los resultados pueden variar en otras configuraciones.
- El speedup depende de la tasa de aceptación, que varía según la tarea. En las pruebas, la aceptación media es de 4,83 sobre 10, lo que da un speedup de 2,67×, pero puede ser menor en tareas donde el modelo objetivo tiene una distribución de tokens menos predecible.

## Enlaces

- Repositorio del modelo GGUF: https://huggingface.co/Anbeeld/LFM2.5-2.6B-DSpark-GGUF
- Modelo base (drafter): https://huggingface.co/LiquidAI/LFM2.5-2.6B-DSpark
- Modelo objetivo: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Blog de LFM2.5-DSpark: https://www.liquid.ai/blog/lfm2.5-dspark
- BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
- Pull request de SGLang con soporte DSpark: https://github.com/sgl-project/sglang/pull/31041
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- LEAP: https://leap.liquid.ai/
- Comunidad Discord: https://discord.com/invite/liquid-ai
