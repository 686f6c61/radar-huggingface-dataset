# Elchikibaby/llama1-3b

## Resumen

`Elchikibaby/llama1-3b` es un modelo de lenguaje conversacional de 3.212.749.888 parámetros (≈3,21 B) publicado por el usuario Elchikibaby en Hugging Face. A pesar del nombre, el único archivo de pesos publicado es `Llama-3.2-3B-Instruct.Q4_K_M.gguf`, por lo que todo apunta a que se trata de un ajuste fino (fine-tune) del modelo Llama-3.2-3B-Instruct de Meta, convertido a formato GGUF y distribuido únicamente en cuantización Q4_K_M. El autor indica que el entrenamiento y la conversión se realizaron con Unsloth, y el repositorio incluye además un Modelfile para despliegue directo con Ollama.

El modelo resuelve un caso de uso muy concreto: disponer de un LLM de ~3 B parámetros cuantizado a 4 bits, listo para ejecutarse en local con `llama.cpp` o Ollama, sin necesidad de infraestructura GPU de datacenter. Su relevancia es, por tanto, la de un artefacto de despliegue ligero más que la de una contribución técnica novedosa: no hay model card detallada, no se documentan datos de entrenamiento, idiomas, licencia ni evaluaciones.

Conviene subrayar que el repositorio tiene 0 descargas y 1 like en el momento de redactar esta ficha, y que sus metadatos presentan inconsistencias notables (fecha de creación de 2026, nombre que sugiere "llama1" cuando el archivo base es Llama 3.2, licencia sin declarar). Debe tratarse, por tanto, como un artefacto no auditado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3.2 (inferido del nombre del archivo GGUF; no declarado en la model card) |
| Parametros totales | 3.212.749.888 (≈3,21 B), dato de los safetensors del repositorio |
| Parametros activos | no aplica (modelo denso; no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-3.2-3B-Instruct soporta 128.000 tokens segun la documentacion de Meta |
| Tipos de cuantizacion | GGUF Q4_K_M (unico archivo publicado); no hay Q2, Q3, Q5, Q6, Q8 ni FP16 en el repositorio |
| Idiomas soportados | no disponible (el modelo base declara 8 idiomas oficiales) |
| Licencia | no disponible en la model card; el modelo base se distribuye bajo Llama 3.2 Community License |
| Formato de pesos | GGUF (`Llama-3.2-3B-Instruct.Q4_K_M.gguf`) + Modelfile de Ollama; el repo contabiliza safetensors en metadatos pero no se listan archivos sueltos |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el proceso de entrenamiento. Lo unico documentado es que el modelo fue ajustado y convertido a GGUF mediante Unsloth, que se ajustó el comportamiento del token BOS para compatibilidad con GGUF y que el entrenamiento resultó "2x faster" con dicha herramienta. No se especifica el dataset de ajuste fino, el número de tokens, la composición de los datos, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT supervisado. Tampoco se indica la ventana de contexto efectiva tras el fine-tune ni si se preservaron las capacidades multilingües del modelo base.

Por el nombre del archivo puede inferirse que la base es Llama-3.2-3B-Instruct: un transformer decoder-only denso de 28 capas, dimensión oculta 3072 y atención GQA con 24 cabezas de consulta y 8 de clave/valor, con vocabulario de 128.256 tokens. La cuantización publicada, Q4_K_M, es una cuantización de bloques de 4 bits con mezcla de precisiones (algunas capas en 6 bits), lo que sitúa el peso del archivo en torno a 2,0 GB, coherente con el tamaño del repositorio. Cualquier detalle adicional sobre datos o metodología debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional multi-turno en el formato de chat de Llama 3.2 (la plantilla se aplica con `--jinja` en `llama.cpp`).
- Razonamiento básico e instrucciones generales, limitado por el tamaño de 3 B parámetros.
- Generación de código y matemáticas sencillas: capacidad heredada del modelo base, sin evaluaciones publicadas para este fine-tune.
- Soporte de tool calling / function calling: no confirmado en la model card; el modelo base Llama 3.2 lo soporta, pero el ajuste fino y la cuantización pueden degradarlo.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas para este fine-tune.
- Visión: no soportada. La mención a `llama-mtmd-cli` de la model card es una plantilla genérica de Unsloth; el modelo Llama 3.2 de 3 B es exclusivamente de texto.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- **Asistente conversacional local en escritorio**: con ~2 GB de pesos en Q4_K_M, el modelo cabe en cualquier GPU de consumo con 4 GB o más y puede ejecutarse íntegramente offline con Ollama o `llama.cpp`, sin enviar datos a terceros. Adecuado para prototipos de chat privado.
- **Procesamiento por lotes de texto en CPU**: clasificación, resumen o reescritura de documentos en servidores sin GPU, aprovechando la cuantización de 4 bits y el soporte de `llama.cpp`. El throughput será bajo, pero el coste por token es mínimo.
- **Base para fine-tunes propios**: al ser un modelo de 3 B parámetros, se puede reajustar con LoRA en una única GPU de 24 GB (RTX 3090/4090) en pocas horas, partiendo de este checkpoint como punto de arranque.
- **Generación de código asistida en entornos con restricciones**: autocompletado de snippets y explicación de fragmentos en IDE, siempre con revisión humana debido a la tasa de error esperable en un modelo de 3 B.
- **Enrutador o clasificador previo en pipelines RAG**: usar el modelo para decidir si una consulta requiere recuperación de documentos o para reformular preguntas antes de pasarlas a un modelo mayor, reduciendo coste y latencia.
- **Entornos educativos y de investigación**: experimentación con cuantización GGUF, comparación de calidad frente a FP16 y estudio del efecto de los fine-tunes en modelos pequeños, dado el bajo coste de ejecución.
- **Despliegue embebido o edge**: integración en aplicaciones de escritorio o dispositivos con recursos limitados mediante el binario de `llama.cpp`, sin dependencias de Python en tiempo de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y tampoco se documenta ninguna comparación con el modelo base. Dado que el fine-tune y la cuantización Q4_K_M alteran el comportamiento respecto a Llama-3.2-3B-Instruct, no es posible extrapolar los resultados publicados por Meta para el modelo original.

## Requisitos de hardware

- **VRAM para inferencia (estimación a partir del tamaño de pesos y la arquitectura del modelo base):**
  - Q4_K_M: ~2,0 GB de pesos; ~2,5-3,0 GB en total con overhead de runtime y caché KV para contextos cortos.
  - Q8_0 (si se generase): ~3,4 GB de pesos.
  - FP16: ~6,4 GB de pesos.
- **Caché KV:** con 28 capas, 8 cabezas KV y dimensión de cabeza 128, el coste es de ~112 KB por token en FP16. Esto supone ~0,9 GB para 8.192 tokens, ~3,75 GB para 32.768 tokens y ~15 GB para 131.072 tokens. La ventana de 128k del modelo base solo es viable con GPU de 24 GB o más, o con cuantización de la caché KV.
- **GPU recomendadas:** RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y A100/H100 para contextos largos o despliegue concurrente. Cabe en GPUs de consumo con 4 GB o más para contextos moderados.
- **CPU:** viable con `llama.cpp` en CPU (AVX2) a velocidades del orden de unidades o decenas de tokens por segundo, según núcleos y RAM disponible (~3-4 GB libres).
- **Opciones de despliegue:** `llama.cpp` (`llama-cli -hf Elchikibaby/llama1-3b --jinja`), Ollama mediante el Modelfile incluido, y servidores compatibles con la API de OpenAI a través de `llama-server` (etiqueta `endpoints_compatible` del repositorio). vLLM y TGI no soportan GGUF de forma directa en todas sus versiones, por lo que requerirían reconvertir los pesos.
- **Latencia y throughput:** no hay mediciones publicadas. Se desaconseja planificar capacidad en producción sin medir previamente en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Estado |
|---|---|---|---|---|---|
| Elchikibaby/llama1-3b | ~3,21 B | no documentado (base: 128k) | no disponible | GGUF Q4_K_M | Fine-tune comunitario, sin evaluar |
| Llama-3.2-3B-Instruct (Meta) | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF oficial | Referencia oficial, con evals publicadas |
| Qwen2.5-3B-Instruct | ~3,09 B | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva |
| Phi-3.5-mini-instruct | ~3,82 B | 131.072 tokens | MIT | safetensors, GGUF | Alternativa permisiva orientada a razonamiento |
| Gemma 2 2B | ~2,61 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Alternativa ligera con contexto corto |

La comparación de rendimiento no es posible: este fine-tune carece de evaluaciones publicadas, de modo que la única referencia válida sería el modelo base. En términos prácticos, sus ventajas frente a las alternativas son el tamaño reducido del artefacto y la integración directa con Ollama; sus desventajas son la ausencia de licencia declarada, la falta de evaluaciones y el contexto efectivo desconocido.

## Limitaciones y advertencias

- **Licencia no declarada:** la model card no especifica licencia. Si el modelo deriva de Llama-3.2-3B-Instruct, hereda la Llama 3.2 Community License de Meta, que impone restricciones de uso comercial, obligaciones de atribución y una política de uso aceptable. Verificar antes de cualquier despliegue en producción.
- **Artefacto no auditado:** 0 descargas, 1 like y ausencia total de evaluaciones. No hay garantía de que el fine-tune no haya degradado las capacidades del modelo base.
- **Metadatos inconsistentes:** el nombre "llama1-3b" sugiere un modelo Llama 1, mientras que el archivo corresponde a Llama 3.2; la fecha de creación registrada es 2026, lo que indica una configuración errónea del repositorio. Tratar los metadatos con cautela.
- **Riesgo de alucinación:** inherente a un modelo de 3 B parámetros, agravado por un fine-tune sin documentar. No debe usarse como fuente de verdad en dominios factuales sin verificación externa.
- **Contexto efectivo desconocido:** aunque la base soporte 128k tokens, no se documenta si el ajuste preserva esa ventana; el uso de contextos largos además dispara el consumo de VRAM por la caché KV.
- **Pérdida por cuantización:** Q4_K_M introduce degradación medible en tareas de razonamiento y matemáticas frente a FP16, y es la única opción publicada, lo que impide elegir una precisión mayor sin reconvertir pesos.
- **Cobertura lingüística incierta:** no se declara qué idiomas conserva tras el fine-tune; el rendimiento en castellano no está verificado.
- **Tool calling y agentes:** no confirmados. El formato de chat requiere `--jinja`; una plantilla mal aplicada degrada notablemente la calidad de las respuestas.
- **Ajuste del token BOS:** el autor modificó el comportamiento del BOS para compatibilidad GGUF; esto puede provocar diferencias de tokenización frente al modelo original en pipelines que no usen la plantilla incluida.

## Enlaces

- [Modelo en Hugging Face: Elchikibaby/llama1-3b](https://huggingface.co/Elchikibaby/llama1-3b)
- [Unsloth (repositorio oficial)](https://github.com/unslothai/unsloth)
- [llama.cpp (repositorio oficial)](https://github.com/ggml-org/llama.cpp)
- [Ollama (repositorio oficial)](https://github.com/ollama/ollama)
- [Llama en Meta AI](https://dev.meta.ai/llama)
- [Llama (language model) en Wikipedia](https://en.wikipedia.org/wiki/Llama_(language_model))
