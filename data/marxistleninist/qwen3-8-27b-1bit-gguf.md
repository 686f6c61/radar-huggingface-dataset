# MarxistLeninist/Qwen3.8-27B-1bit-GGUF

## Resumen

El modelo `MarxistLeninist/Qwen3.8-27B-1bit-GGUF` es una familia de cuantizaciones GGUF de ultra baja precisión (clase 1-bit) del modelo multimodal Qwen3.8-27B, desarrollada por el usuario MarxistLeninist. Se trata de una cuantización post-entrenamiento realizada con llama.cpp y una matriz de importancia orientada a dominios de agentes, no de un modelo entrenado con cuantización consciente (como BitNet). Su objetivo es reducir drásticamente el tamaño del modelo para permitir su ejecución en hardware muy limitado, aunque con una pérdida de calidad significativa.

La familia incluye cinco variantes: `Q1_0`, `Q1_0-HYBRID-IQ2`, `TQ1_0`, `IQ1_S` e `IQ1_M`, con pesos efectivos por bit que oscilan entre ~1.38 y ~2.26 bpw (bits por peso) según la variante. El modelo base, Qwen3.8-27B, es un modelo denso de 27B parámetros con arquitectura multimodal (texto e imagen) y una ventana de contexto de 262k tokens, publicado por Alibaba bajo licencia Apache-2.0. Esta cuantización extrema está pensada para entornos con restricciones severas de memoria, pero no es recomendable para tareas que requieran precisión o fiabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (arquitectura `qwen35` en GGUF) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la cuantizacion; el modelo base soporta 262k tokens |
| Tipos de cuantizacion | Q1_0, Q1_0-HYBRID-IQ2, TQ1_0, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no aplicable) |

## Arquitectura y entrenamiento

La familia `Qwen3.8-27B-1bit-GGUF` se genera a partir del modelo base Qwen3.8-27B, convertido previamente a BF16 GGUF por Unsloth. La cuantización se realiza directamente desde BF16 usando llama.cpp (build 9591) con una matriz de importancia (imatrix) proporcionada por KikoCis. No se trata de un entrenamiento con cuantización consciente, sino de una compresión post-entrenamiento que aplica cuantizadores de baja precisión a los tensores, aunque llama.cpp mantiene deliberadamente ciertos tensores sensibles a mayor precisión (por ejemplo, en la variante híbrida se protegen las vías de atención, SSM y FFN-down con cuantización IQ2_XS). El modelo base es un transformer multimodal denso con una arquitectura `qwen35` que incluye componentes recurrentes (SSM) y atención lineal, lo que lo hace adecuado para tareas de agente y razonamiento. La cuantización extrema degrada notablemente estas capacidades.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas complejas de razonamiento, pero la cuantización 1-bit degrada severamente esta capacidad.
- Codigo: el modelo base destaca en generacion y comprension de codigo, aunque con 1-bit la calidad cae drasticamente.
- Vision: el modelo base es multimodal (imagen-texto) e incluye un proyector multimodal (`mmproj-BF16.gguf`) para su uso con llama.cpp, pero la cuantizacion puede afectar a la calidad de la comprension visual.
- Tool calling y agentes: el modelo base soporta workflows de agente y tool calling, pero la precision reducida puede provocar fallos en la ejecucion de herramientas.
- Multilingue: no se especifican idiomas, pero el modelo base soporta multiples lenguas, aunque la cuantizacion puede afectar a la fluidez.
- Thinking mode: no se menciona explícitamente, pero el modelo base puede tener modos de razonamiento extendido.

## Casos de uso

- Prototipado en hardware extremadamente limitado: la cuantizacion 1-bit permite ejecutar un modelo de 27B en dispositivos con menos de 4 GB de RAM, util para pruebas de concepto o demos sin GPU.
- Experimentacion academica sobre limites de cuantizacion: investigadores pueden estudiar el impacto de la compresion extrema en tareas de NLP y vision usando estas variantes.
- Ejecucion en CPU sin GPU: el modelo puede cargarse en CPUs con pocos recursos, aunque el prompt processing puede ser muy lento debido a la ruta SSM en llama.cpp.
- Validacion de pipelines de cuantizacion: los archivos incluyen manifiestos y verificaciones de integridad, utiles para probar herramientas de cuantizacion.
- Uso educativo para demostrar trade-offs de precision: se puede comparar el comportamiento de las distintas variantes (Q1_0 vs IQ1_M) en tareas sencillas.
- Despliegue en entornos embebidos o edge: si la calidad es aceptable para tareas muy simples, podria usarse en dispositivos con memoria muy reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion especifica. El modelo base Qwen3.8-27B tiene benchmarks publicados (por ejemplo, en su pagina de HuggingFace), pero no se dispone de los numeros exactos en esta ficha. Se recomienda consultar la documentacion del modelo base para referencia.

## Requisitos de hardware

- VRAM estimada: al ser cuantizacion 1-bit, el tamaño de los archivos es muy reducido (probablemente entre 2 y 5 GB segun la variante), por lo que cabe en GPUs con 4 GB o menos, e incluso en RAM de CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) o incluso solo CPU.
- Compatibilidad con consumer GPU: si, es el objetivo principal de esta cuantizacion.
- Opciones de despliegue: llama.cpp (soporte nativo), Ollama (si se importa el GGUF), y posiblemente vLLM con adaptaciones, aunque la ruta SSM en CPU puede ser lenta.
- Latencia y throughput: no se proporcionan datos concretos, pero se advierte que el prompt processing en CPU puede ser extremadamente lento debido a la arquitectura SSM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27B | 262k | Apache-2.0 | Safetensors | Modelo base, calidad completa |
| Qwen3.8-27B-GGUF (Q8_0) | 27B | 262k | Apache-2.0 | GGUF | Cuantizacion estandar, buena calidad |
| Esta familia 1-bit | 27B | no disponible | Apache-2.0 | GGUF | Cuantizacion extrema, calidad muy degradada |

## Limitaciones y advertencias

- Degradacion severa de calidad: razonamiento, precision factual, codigo, instrucciones, capacidades multilingues y vision pueden verse gravemente afectados, especialmente en la variante Q1_0.
- Riesgo de alucinacion: con tan pocos bits, el modelo puede generar contenido incoherente o inventado con mayor frecuencia.
- Limitaciones de contexto: aunque el modelo base soporta 262k, la cuantizacion puede no preservar correctamente la atencion a largas distancias.
- Rendimiento de CPU lento: la ruta SSM en llama.cpp puede hacer que el prompt processing sea inusualmente lento.
- No apto para produccion: no se recomienda su uso en aplicaciones donde la correccion sea critica.
- Licencia: Apache-2.0 permite uso comercial, pero la calidad limitada puede no cumplir los requisitos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/MarxistLeninist/Qwen3.8-27B-1bit-GGUF)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio GitHub del modelo base](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Instalador local de Qwen3.8-27B](https://github.com/qwen3-8-27b/qwen3-8-27b)
- [Articulo sobre especificaciones y hardware de Qwen3.8-27B](https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026)
- [Guia para ejecutar Qwen3.8-27B localmente](https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026)
