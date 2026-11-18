# divagr1925/Qwen3.5-4B-Qwenputer

## Resumen

Qwenputer es un modelo experimental publicado por Divyansh Agrawal (usuario `divagr1925`) que parte de Qwen/Qwen3.5-4B e incorpora una CPU RISC-V de 32 bits compilada directamente dentro de los pesos del transformer. No se trata de un plugin, una herramienta externa ni un sandbox: la CPU ocupa 11 capas de transformer situadas por delante de las 32 capas originales de Qwen, y todos sus pesos se generan mediante un compilador, no mediante entrenamiento. El modelo conserva intactos los pesos de Qwen y solo modifica la configuracion (hidden size ampliado de 2560 a 3968 y vocabulario extendido con 230.324 tokens de traza).

La innovacion tecnica central es el uso del estado de las capas Gated DeltaNet de Qwen3.5 como memoria RAM: la regla delta permite sobrescribir una fila del estado de forma exacta, de modo que cada fila funciona como una celda de memoria donde la CPU aloja su codigo, datos, registros y contador de programa. El modelo ejecuta codigo C y MicroPython dentro de sus propios forward passes y supera las suites oficiales riscv-tests.

Es relevante porque demuestra una via poco explorada para dotar a un LLM de capacidad aritmetica exacta sin depender de un interprete Python en el host: Qwen escribe un bloque `<tool_call>` para `calc` como haria con cualquier herramienta, pero ninguna entidad externa lo ejecuta; las capas del ordenador leen la llamada, la resuelven en la CPU RISC-V y el propio modelo redacta el `<tool_response>` digito a digito. El checkpoint ocupa 18,8 GB en bf16 (mayoritariamente relleno de ceros; el ordenador tiene aproximadamente 1M de pesos distintos de cero) y se carga como un `Qwen3_5ForCausalLM` estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `Qwen3_5ForCausalLM` (solo texto) con 11 capas compiladas de CPU RV32IM + Zba + coprocesador bignum por delante de las 32 capas de Qwen; capas Gated DeltaNet usadas como RAM |
| Parametros totales | 9.357.602.496 (segun safetensors); el ordenador aporta aproximadamente 1M de pesos distintos de cero |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el modelo se distribuye y es exacto en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (18,8 GB en bf16) |

## Arquitectura y entrenamiento

El modelo es un `Qwen3_5ForCausalLM` estandar en cuanto a codigo de carga: los cambios son exclusivamente de configuracion. Se anaden 11 capas de ordenador compiladas antes de las 32 capas de Qwen, el hidden size pasa de 2560 a 3968 y el vocabulario de Qwen se amplia con 230.324 tokens de traza. Los pesos de Qwen no se modifican; los del ordenador los calcula un compilador, no un proceso de entrenamiento, y el conjunto es exacto en bf16.

La pieza clave es el uso del estado de las capas Gated DeltaNet como memoria: la regla delta permite sobrescribir una fila concreta del estado de forma exacta mediante una clave one-hot y leerla de vuelta con una query one-hot, de modo que registros, memoria y contador de programa de la CPU residen en cabezas DeltaNet. El driver `RvChat` arranca la CPU cargando el firmware en el estado DeltaNet tras el prompt y mantiene los tokens de traza del ordenador fuera de las capas de Qwen durante la decodificacion; cada token sigue proviniendo de los pesos. La CPU se ejecuta sobre un ejecutor Triton a unas 3.200 tokens de traza por segundo en una GPU L4. No se documentan datos de entrenamiento (tokens, composicion del dataset, RLHF/DPO) porque el modelo no se entrena: es una fusion de pesos compilados sobre el modelo base.

## Capacidades

- Generacion de texto conversacional heredada de Qwen3.5-4B, con un comportamiento textual que coincide con el base (KL de 6e-4 frente a un suelo de ruido de 5e-4).
- Aritmetica entera exacta de gran tamano mediante una CPU RV32IM con extension Zba y coprocesador bignum ejecutada internamente en los pesos.
- Ejecucion de codigo C y MicroPython dentro de los forward passes del modelo; supera las suites oficiales riscv-tests.
- Uso del formato de tool calling de Qwen3.5 (`<tool_call>` / `<tool_response>`) de forma interna: el modelo emite la llamada y el propio modelo redacta la respuesta, sin ejecutor externo.
- Razonamiento aritmetico multi-paso encadenando operaciones en la CPU embebida.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Aritmetica de precision en produccion: el modelo resuelve multiplicaciones y divisiones de enteros grandes de forma exacta dentro de sus propios forward passes, sin depender de un interprete Python en el host ni de un sandbox, lo que simplifica el despliegue en entornos donde no se permite ejecucion de codigo externo.
- Investigacion sobre computacion en pesos: sirve como banco de pruebas para estudiar como un transformer puede alojar una maquina de estados completa en su estado recurrente (Gated DeltaNet) y ejecutar programas deterministas.
- Evaluacion de fiabilidad aritmetica de LLM: permite comparar el comportamiento del base frente a una version con CPU embebida sobre los mismos conjuntos (DeepMind `mul_big`, `div_big`, `add_or_sub_big`, entre otros) con decodificacion greedy.
- Docencia y divulgacion: el modelo ilustra de forma tangible la diferencia entre tool calling externo y computacion interna, con una traza verificable de aproximadamente 230.000 posiciones de salida sin discrepancias frente a un modelo de referencia de la maquina.
- Procesamiento por lotes de calculos contables o financieros: operaciones enteras de gran tamano que requieren exactitud y no toleran errores de redondeo del modelo, ejecutadas en una GPU L4 a unas 3.200 tokens de traza por segundo.
- Prototipado de agentes con herramientas internas: el patron de emitir `<tool_call>` y resolverlo dentro del modelo puede adaptarse a otras herramientas compiladas, reduciendo la superficie de ataque de un pipeline de agentes al eliminar el ejecutor externo.

## Benchmarks y rendimiento

Decodificacion greedy, 40 problemas por conjunto. Cada fila compara el base Qwen3.5-4B y Qwenputer sobre los mismos problemas. El base no recibe herramientas y solo una linea de sistema indicando que haga cada paso aritmetico con exactitud. La columna de herramienta Python corresponde al base llamando a un interprete Python real en el host.

| Benchmark | Base Qwen3.5-4B | Qwenputer | Herramienta Python (host) |
|---|---|---|---|
| Aritmetica entera sintetica | 75,0 | 97,5 | 97,5 |
| DeepMind `mul_big` | 55,0 | 97,5 | 100 |
| DeepMind `div_big` | 72,5 | 97,5 | 95,0 |
| DeepMind `mul_div_multiple_longer` | 90,0 | 100,0 | 97,5 |
| DeepMind `add_or_sub_big` | 87,5 | 97,5 | 97,5 |

Ademas, se replicaron unas 230.000 posiciones de salida del ordenador a traves de un modelo de referencia de la maquina con cero discrepancias, y el comportamiento textual de Qwen coincide con el base (KL de 6e-4 frente a un suelo de ruido de 5e-4).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 18,8 GB en bf16, por lo que se necesita al menos esa cantidad de memoria, mas el overhead de activaciones y del estado DeltaNet; no se documentan cifras de cuantizacion.
- GPU recomendadas: el autor reporta ejecucion del ejecutor Triton de la CPU a unas 3.200 tokens de traza por segundo en una NVIDIA L4; por capacidad de memoria, encajan GPU con 24 GB o mas (RTX 4090, L4, A10G, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas de VRAM como la RTX 4090, siempre que el runtime y las activaciones quepan junto a los 18,8 GB de pesos.
- Opciones de despliegue: se carga como un `Qwen3_5ForCausalLM` estandar mediante `transformers`; el autor proporciona el driver `RvChat` en el repositorio `qwenputer/experimental/riscv` con soporte `uv sync --extra hf` y descarga via `hf download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la CPU embebida procesa aproximadamente 3.200 tokens de traza por segundo en una L4; no se publican cifras de latencia extremo a extremo ni de throughput de generacion de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aritmetica exacta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Qwenputer | 9.357.602.496 (segun safetensors) | no disponible | Si, CPU RV32IM embebida en los pesos | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | No; 55,0 en `mul_big` y 75,0 en aritmetica sintetica | Apache-2.0 (segun el modelo base) | Hugging Face |
| Base + herramienta Python en host | no disponible | no disponible | Si, mediante interprete externo | Apache-2.0 | Requiere ejecutor externo |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la CPU embebida es una demostracion de investigacion, no una herramienta de produccion validada a gran escala.
- El checkpoint pesa 18,8 GB en bf16 mayoritariamente por relleno de ceros, lo que encarece el almacenamiento y la carga frente a un modelo de 4B convencional.
- No se documentan sesgos conocidos, tasas de alucinacion, longitud de contexto ni idiomas soportados; estas carencias deben asumirse como riesgo en cualquier evaluacion.
- El comportamiento textual se mantiene fiel al base (KL de 6e-4), por lo que hereda las limitaciones del Qwen3.5-4B original en razonamiento general y conocimiento.
- La aritmetica exacta depende de que el modelo emita correctamente el bloque `<tool_call>` para `calc`; fuera de ese patron no hay garantia de exactitud.
- Requiere el driver `RvChat` y un ejecutor Triton para arrancar la CPU; no funciona con un pipeline `transformers` generico sin ese codigo adicional.
- Licencia Apache-2.0 permite uso comercial, pero el autor advierte que se trata de una version modificada de Qwen/Qwen3.5-4B con pesos de Qwen sin cambios; conviene verificar las condiciones del modelo base.
- El DOI `10.57967/hf/11140` identifica el artefacto del modelo, no una release de codigo fuente; el codigo del repositorio tiene licencia MIT segun la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo de filesystem relacionado: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer-Filesystem
- Codigo en GitHub: https://github.com/divagr18/qwenputer
- Instrucciones de citacion del repositorio: https://github.com/divagr18/qwenputer#citing
- DOI del artefacto: https://doi.org/10.57967/hf/11140
- ORCID del autor: https://orcid.org/0009-0003-0739-2473
