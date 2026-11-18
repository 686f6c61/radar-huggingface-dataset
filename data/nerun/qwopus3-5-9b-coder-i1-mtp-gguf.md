# nerun/Qwopus3.5-9B-Coder-i1-MTP-GGUF

## Resumen

Qwopus3.5-9B-Coder-i1-MTP-GGUF es una distribución de pesos en formato GGUF publicada por el usuario nerun que empaqueta el modelo Qwopus3.5-9B-Coder (desarrollado por Jackrong sobre la base Qwen3.5-9B) junto con un bloque MTP (Multi-Token Prediction) incrustado para permitir decodificación especulativa nativa en llama.cpp mediante el flag `--spec-type draft-mtp`. El modelo principal es un fine-tune de Qwen3.5-9B orientado a programación agéntica, tool calling y razonamiento, cuantizado con imatrix por mradermacher (serie i1). La innovación de este repositorio no está en el modelo en sí, sino en el injerto del bloque MTP: se copian tensor a tensor los pesos `blk.32.*` desde un fichero MTP-only extraído del Qwen3.5-9B original, sin reentrenamiento.

El resultado es un único fichero GGUF que actúa simultáneamente como modelo principal y como modelo borrador para decodificación especulativa, evitando cargar un draft model separado en memoria. El bloque MTP comparte `token_embd` y `output` con el modelo base, por lo que el incremento de tamaño es de solo ~0,2 GiB respecto al quant original. Se ofrecen 24 cuantizaciones que van desde IQ1_S (2,8 GiB) hasta Q6_K (7,2 GiB), todas con el bloque MTP en Q4_K_M o Q5_K_M según el caso.

Es relevante para desarrolladores que despliegan modelos de código en local con llama.cpp y quieren acelerar la generación sin sacrificar VRAM adicional. La licencia Apache 2.0 facilita el uso comercial. La contrapartida principal es que la cabeza MTP fue entrenada sobre Qwen3.5-9B y no sobre el fine-tune Coder, por lo que la tasa de aceptación del borrador puede ser inferior a la de una cabeza específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura `qwen35` en llama.cpp) con bloque MTP adicional (`blk.32.*`) para decodificación especulativa |
| Parametros totales | 9B (modelo base Qwen3.5-9B); el bloque MTP añade ~0,2 GiB al fichero |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de uso fija `-c 0` con `-fitc 32768`) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (bloque MTP en Q4_K_M o Q5_K_M) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyectores de visión mmproj incluidos) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwopus3.5-9B-Coder, un fine-tune de Qwen3.5-9B (9 000 millones de parámetros, transformer denso) orientado a código, uso de herramientas y razonamiento agéntico. Sobre esa base, mradermacher generó cuantizaciones imatrix (serie i1) que constituyen el modelo principal de este repositorio, copiadas tensor a tensor sin modificación.

La modificación propia de este repositorio es el injerto del bloque MTP: se toma el subconjunto MTP-only del Qwen3.5-9B original (publicado por a4lg) y se copia al GGUF del Coder mediante el script `convert.py` de @buzz, siguiendo el "Method 2" descrito en el README de a4lg. El script original fallaba con la arquitectura `qwen35` porque incrementaba `block_count` de 32 a 33 sin ajustar las claves de array por capa (`qwen35.attention.recurrent_layers`), lo que provocaba el rechazo de llama.cpp; la versión usada corrige ese desajuste. No hay entrenamiento ni ajuste fino involucrado: es una operación puramente de trasplante de pesos. La cabeza MTP fue entrenada sobre Qwen3.5-9B, no sobre el fine-tune Coder, lo que condiciona la tasa de aceptación del borrador.

Los proyectores de visión (mmproj) provienen de mradermacher/Qwopus3.5-9B-Coder-GGUF y sí fueron entrenados para este modelo concreto.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso.
- Generación y edición de código (fine-tune específico para programación).
- Tool calling / function calling para integración con agentes.
- Flujos agénticos con razonamiento encadenado.
- Capacidades de visión gracias a los proyectores mmproj incluidos.
- Decodificación especulativa integrada mediante bloque MTP (`--spec-type draft-mtp`), con el propio fichero actuando como modelo principal y borrador a la vez.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en local: el modelo puede completar y refactorizar código en un IDE o CLI sin conexión, con la ventaja de que la decodificación especulativa MTP acelera la generación en un solo fichero GGUF, sin cargar un draft model aparte.
- Agentes de automatización de tareas de desarrollo: al soportar tool calling, puede encadenar llamadas a herramientas (ejecutar tests, consultar repositorios, aplicar parches) en pipelines de CI/CD o scripts de mantenimiento.
- Despliegue en estaciones de trabajo con GPU de consumo: los cuants Q4_K_M (5,5 GiB) e IQ4_XS (5,1 GiB) caben en GPUs de 8 GB de VRAM, permitiendo un asistente de código local en hardware asequible.
- Razonamiento sobre documentación técnica con imágenes: gracias a los proyectores de visión, puede interpretar diagramas de arquitectura o capturas de errores junto con texto para diagnosticar problemas.
- Servidor de inferencia ligero con llama-server: el ejemplo de uso del autor (`-ngl auto -c 0 -fit on -fitc 32768 -fa on -np 1 -ctk q8_0 -ctv q8_0`) está pensado para servir una única petición concurrente con Flash Attention y caché KV cuantizada, adecuado para uso individual o equipos pequeños.
- Evaluación de decodificación especulativa en investigación: sirve como banco de pruebas para medir la tasa de aceptación de una cabeza MTP no específica del dominio (entrenada en el base, aplicada al Coder) frente a cabezas entrenadas ad hoc.
- Prototipado de agentes con presupuesto de VRAM ajustado: los cuants IQ2/IQ3 (3,2–4,7 GiB) permiten ejecutar el modelo en GPUs de 6–8 GB o incluso en configuraciones con offload parcial a CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente aporta observaciones empíricas sobre la decodificación especulativa: con injertos similares sobre Qwen3.5-9B, `--spec-draft-n-max 2` resultó consistentemente algo mejor que el valor por defecto 3, y los valores 1 o 4 y superiores fueron más lentos. En 8 GB de VRAM recomienda mantener el micro-batch por defecto (`-ub 512`), ya que con `-ub 1024` o `-ub 2048` la generación con MTP empeoró, probablemente porque el mayor búfer de cómputo dejaba menos VRAM para las capas del modelo bajo `-fit on`.

## Requisitos de hardware

- VRAM estimada según cuantización: desde ~2,8 GiB (IQ1_S) hasta ~7,2 GiB (Q6_K); el bloque MTP añade ~0,2 GiB respecto al quant original. Los tamaños son aproximados según el autor.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, los cuants Q4_K_M (5,5 GiB) e IQ4_XS (5,1 GiB) son los candidatos razonables para GPUs de 8 GB; los cuants Q5 y Q6 requieren 8–12 GB; los cuants IQ1–IQ3 caben en GPUs de 4–6 GB.
- GPU de consumo: sí, el modelo cabe en GPUs de consumo. El autor menciona explícitamente pruebas en 8 GB de VRAM con `-fit on`.
- Opciones de despliegue: llama.cpp (obligatorio para la decodificación especulativa MTP, con `--spec-type draft-mtp`). El ejemplo usa `llama-server`. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor solo indica que `--spec-draft-n-max 2` fue más rápido que 3, 1 o valores ≥4 en pruebas con injertos similares.
- Nota de configuración: el fichero injertado se usa como modelo principal; no debe pasarse de nuevo con `--model-draft`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nerun/Qwopus3.5-9B-Coder-i1-MTP-GGUF (este) | 9B | No disponible | Apache 2.0 | GGUF con MTP incrustado | Decodificación especulativa sin draft model separado; cabeza MTP entrenada en el base, no en el Coder |
| mradermacher/Qwopus3.5-9B-Coder-i1-GGUF | 9B | No disponible | Apache 2.0 | GGUF (imatrix) | Mismo modelo principal sin bloque MTP; requiere draft model externo para decodificación especulativa |
| Jackrong/Qwopus3.5-9B-Coder | 9B | No disponible | No disponible | No disponible | Fine-tune original del Coder sobre Qwen3.5-9B, sin MTP |
| a4lg/Qwen3.5-9B-MTP-ONLY-GGUF | 9B (solo bloque MTP) | No disponible | No disponible | GGUF | Subconjunto MTP-only del Qwen3.5-9B; donante del bloque injertado |

## Limitaciones y advertencias

- La cabeza MTP fue entrenada sobre Qwen3.5-9B, no sobre Qwopus3.5-9B-Coder; la tasa de aceptación del borrador puede ser inferior a la de una cabeza específica del modelo, lo que reduce la ganancia de velocidad.
- Requiere una build de llama.cpp con soporte de MTP draft (`--spec-type draft-mtp`); no funciona con versiones estándar ni con otros runtimes (vLLM, TGI, Ollama) según la información disponible.
- El fichero injertado debe usarse como modelo principal y no pasarse con `--model-draft`; hacerlo produciría un comportamiento incorrecto.
- El script de trasplante publicado originalmente fallaba con la arquitectura `qwen35`; el autor indica que la versión usada corrige el desajuste de `block_count` y claves de array, pero no detalla el parche completo.
- Riesgo de alucinación y sesgos: no disponibles en la información proporcionada; aplican los del modelo base Qwen3.5-9B y del fine-tune Coder, no documentados aquí.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe concreto.
- Longitud de contexto: no disponible; el ejemplo de uso fija `-fitc 32768`, pero no se confirma el máximo del modelo.
- Los tamaños de fichero son aproximados según el autor; el rendimiento real depende de la build de llama.cpp, los flags y el hardware.
- Licencia Apache 2.0 permite uso comercial, pero las licencias y condiciones del modelo base y del fine-tune original no se detallan en la información disponible; conviene verificarlas antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nerun/Qwopus3.5-9B-Coder-i1-MTP-GGUF
- Modelo base (cuantizaciones imatrix): https://huggingface.co/mradermacher/Qwopus3.5-9B-Coder-i1-GGUF
- Modelo base sin cuantizar (fine-tune Coder): https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Donante del bloque MTP: https://huggingface.co/a4lg/Qwen3.5-9B-MTP-ONLY-GGUF
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Proyectores de visión (mmproj): https://huggingface.co/mradermacher/Qwopus3.5-9B-Coder-GGUF
- Script de trasplante `convert.py` de @buzz: https://gist.github.com/buzz/1c439684d5e3f36492ae9f64ef7e3f67
- Perfil de GitHub de @buzz: https://github.com/buzz
