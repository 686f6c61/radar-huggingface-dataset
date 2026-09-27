# asparius/Qwen2.5-7B-LORA-SDF-Unguided-epoch3

## Resumen

asparius/Qwen2.5-7B-LORA-SDF-Unguided-epoch3 es un adaptador LoRA publicado en HuggingFace por el usuario asparius, construido sobre el modelo base Qwen/Qwen2.5-Coder-7B. El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no un modelo completo, y se distribuye en formato safetensors con la librería PEFT. Por sus etiquetas, se trata de un ajuste fino supervisado (SFT) realizado con la librería TRL y PEFT 0.21.0, orientado a generación de texto conversacional.

El interés de esta ficha es limitado pero relevante como caso de estudio: la model card es la plantilla por defecto de HuggingFace sin ningún campo cumplimentado, no declara licencia, idiomas, datos de entrenamiento, hiperparámetros ni resultados de evaluación, y el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta. El nombre del modelo sugiere una variante "unguided" de un ajuste sobre un dataset denominado "SDF" tras 3 épocas, pero ninguno de esos términos está documentado.

Existe una familia de adaptadores hermanos publicados por el mismo autor (Qwen2.5-7B-LORA-SDF-epoch2 y Qwen2.5-7B-LORA-SDF-Neutral-epoch3), lo que apunta a un experimento comparativo de ajuste fino sobre el mismo corpus con distintas configuraciones. Cualquier uso en producción exige una evaluación propia previa, ya que no hay evidencia pública de calidad, seguridad ni comportamiento del modelo resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención por grupos (GQA), RoPE, SwiGLU y RMSNorm; este repositorio es un adaptador LoRA sobre Qwen2.5-Coder-7B |
| Parametros totales | Modelo base: 7.610 millones. Adaptador LoRA: no disponible (el repositorio ocupa 0,2 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; el modelo base declara 32.768 tokens nativos, ampliables a 131.072 con escalado YaRN |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye en safetensors sin cuantizar). Puede combinarse con versiones cuantizadas del modelo base: GGUF (Q4_K_M, Q5_K_M, Q8_0), AWQ, GPTQ e int8 |
| Idiomas soportados | no disponible en la ficha del adaptador; el modelo base declara soporte para más de 29 idiomas, entre ellos el castellano |
| Licencia | no disponible para el adaptador; el modelo base Qwen2.5-Coder-7B se distribuye bajo licencia Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Autor | asparius |
| Modelo base | Qwen/Qwen2.5-Coder-7B |
| Libreria | PEFT (framework de entrenamiento declarado: TRL 0.21.0) |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion en HuggingFace | 2026-09-27 |

## Arquitectura y entrenamiento

No hay información publicada sobre el procedimiento de entrenamiento más allá de las etiquetas del repositorio: `lora`, `sft`, `transformers` y `trl`. El identificador del modelo indica un ajuste de 3 épocas sobre un corpus denominado "SDF" en su variante "unguided", pero se desconoce por completo qué es ese corpus, su tamaño, su composición, su idioma y su proceso de curación. Tampoco se documentan los hiperparámetros (rango del LoRA, alpha, dropout, tasa de aprendizaje, precisión de entrenamiento) ni si hubo una fase posterior de alineación tipo DPO o RLHF.

El adaptador hereda la arquitectura del modelo base Qwen2.5-Coder-7B: un transformer decoder-only denso con 28 capas, atención con consultas agrupadas (28 cabezas de consulta y 4 cabezas de clave/valor), vocabulario de 151.646 tokens y un presupuesto de preentrenamiento declarado por Qwen de 5,5 billones de tokens, con una fase posterior de entrenamiento sobre datos de código y matemáticas. Al ser un adaptador LoRA, el resultado final requiere fusionar los pesos con el modelo base o cargarlos dinámicamente en tiempo de inferencia para producir texto.

## Capacidades

- Generación de código en decenas de lenguajes de programación, heredada del preentrenamiento de Qwen2.5-Coder-7B (Python, JavaScript, TypeScript, Java, C++, Go, Rust, SQL, shell, entre otros).
- Relleno de código en medio de secuencia (fill-in-the-middle), útil para autocompletado en editores.
- Razonamiento paso a paso y resolución de problemas matemáticos básicos e intermedios, capacidad presente en la familia Qwen2.5.
- Formato conversacional multi-turno: la etiqueta `conversational` del repositorio sugiere que el ajuste SFT ha adaptado el modelo base (no instruido) a un formato de diálogo, aunque no se documenta la plantilla de chat empleada.
- Generación de texto general y resumen de documentación técnica.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-Coder incluye soporte de llamadas a funciones en sus variantes instruidas; se desconoce si el ajuste SFT lo preserva íntegramente.
- Capacidades de agente y razonamiento multi-paso: posibles en teoría, pero sin evaluación publicada que las respalde en este adaptador concreto.
- Capacidades multilingües: heredadas del base (más de 29 idiomas), sin confirmación específica para este adaptador.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Autocompletado y asistencia en el IDE: el modelo puede integrarse en editores mediante el protocolo de relleno en medio de secuencia del base Qwen2.5-Coder, aprovechando su ventana de contexto de hasta 32.768 tokens para mantener ficheros completos como referencia.
- Generación de pruebas unitarias: a partir de una función o un módulo, el modelo puede producir casos de prueba en el framework habitual del proyecto (pytest, JUnit, Jest), reduciendo el trabajo repetitivo en equipos con cobertura baja.
- Refactorización y migración de código: con contexto largo, es viable pasar ficheros completos y solicitar la conversión entre versiones de lenguaje o framework, aunque requiere revisión humana por la ausencia de benchmarks.
- Explicación de errores y análisis de trazas: el modelo puede recibir un stack trace junto al código implicado y devolver una hipótesis de causa raíz y una propuesta de parche, útil en herramientas internas de soporte a desarrollo.
- Generación de documentación técnica: docstrings, ficheros README y comentarios a partir del código fuente, en un pipeline automatizado que se ejecute en cada fusión de rama.
- Asistente conversacional de soporte a desarrolladores: dado el formato conversacional del ajuste, puede desplegarse como bot interno que responda preguntas sobre un repositorio concreto usando recuperación aumentada (RAG) sobre la documentación.
- Consultas y transformaciones SQL: traducción de lenguaje natural a SQL y explicación de consultas existentes, un escenario donde los modelos de la familia Coder rinden bien por su exposición a datos tabulares.
- Investigación comparativa de ajuste fino: junto con los adaptadores hermanos (SDF-epoch2 y SDF-Neutral-epoch3), permite estudiar el efecto de distintas variantes de entrenamiento sobre un mismo modelo base, siempre que se definan métricas de evaluación propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio es la plantilla por defecto de HuggingFace y todos los apartados de evaluación aparecen como "[More Information Needed]". No existen cifras de MMLU, HumanEval, GSM8K, MBPP, MultiPL-E ni de ningún otro conjunto para este adaptador, ni tampoco comparaciones con el modelo base realizadas por el autor. Cualquier cifra que se quiera utilizar debe obtenerse mediante una evaluación propia y reproducible.

## Requisitos de hardware

- VRAM estimada para el modelo base en fp16/bf16: alrededor de 15,2 GB solo para los pesos, más caché KV y activaciones, lo que sitúa el consumo real en 18-20 GB con contextos largos.
- VRAM estimada en int8: aproximadamente 8 GB de pesos.
- VRAM estimada en 4 bits (GPTQ, AWQ o GGUF Q4_K_M): del orden de 4,5 a 5,5 GB, con pérdida de calidad moderada.
- El adaptador LoRA añade un coste marginal: el repositorio ocupa 0,2 GB, aunque al fusionarlo los pesos resultantes vuelven a ocupar el tamaño del modelo base.
- GPU profesionales recomendadas: NVIDIA A100 (40 GB u 80 GB), H100, L40S o A10G para despliegues concurrentes con vLLM o TGI.
- GPU de consumo compatibles: RTX 4090 y RTX 3090 (24 GB) en fp16 con contexto moderado o en 4 bits con contexto completo; RTX 4080 y RTX 4070 Ti (16 GB) en 4 bits; RTX 3060 (12 GB) en 4 bits con ventanas de contexto recortadas.
- Opciones de despliegue: vLLM con soporte de adaptadores LoRA dinámicos, HuggingFace TGI, Transformers con PEFT, y llama.cpp u Ollama únicamente tras fusionar el adaptador con el base y convertir el resultado a GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| asparius/Qwen2.5-7B-LORA-SDF-Unguided-epoch3 | 7.610 M (base) + adaptador LoRA | no disponible en la ficha; hereda el límite del base | no disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-Coder-7B | 7.610 M | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente descargado |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7.610 M | 131.072 | Apache 2.0 | HuggingFace, variante instruida y evaluada |
| DeepSeek-Coder-6.7B-Instruct | 6.700 M | 16.384 | Licencia de modelo DeepSeek | HuggingFace |
| CodeLlama-7B-Instruct | 6.740 M | 16.384 nativo, ampliable con escalado RoPE | Licencia comunitaria de Llama 2 | HuggingFace |

La comparación es estructural, no de rendimiento: no existe ningún dato de evaluación de este adaptador que permita afirmar que supera o iguala al modelo base o a sus alternativas. En la práctica, el modelo base y su variante Instruct son opciones mucho más seguras para producción, al contar con documentación, licencia explícita y evaluaciones publicadas.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla vacía. No se conocen datos de entrenamiento, hiperparámetros, plantilla de chat ni procedencia del corpus "SDF".
- Licencia no declarada para el adaptador. Aunque el modelo base es Apache 2.0, la ausencia de licencia explícita en este repositorio genera incertidumbre jurídica para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin validación comunitaria: 0 descargas y 0 "likes" indican que el modelo no ha sido probado ni auditado por terceros.
- Sin resultados de benchmarks: cualquier afirmación sobre su calidad sería especulativa.
- Riesgo de olvido catastrófico: un ajuste SFT de 3 épocas sobre un corpus desconocido puede degradar capacidades del modelo base (código, matemáticas, multilingüismo) si el dataset es estrecho o de baja calidad.
- Riesgo de alucinación: al ser un modelo generativo de 7.000 millones de parámetros, puede producir APIs, funciones o referencias inexistentes con apariencia plausible, especialmente en código.
- Sesgos desconocidos: al no documentarse la composición del dataset de ajuste, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Cobertura de idiomas no confirmada: la ficha no declara idiomas y se desconoce si el ajuste SFT ha reducido el soporte multilingüe del base.
- Limitación de contexto en la práctica: aunque el base soporte 32.768 tokens nativos, la caché KV a esa longitud exige hardware con memoria abundante y puede degradar la calidad en el extremo de la ventana.
- Términos sin definir: "SDF", "unguided" y "Neutral" (en los adaptadores hermanos) no están explicados en ningún repositorio accesible, lo que impide interpretar qué diferencia a estas variantes.
- Advertencia de reproducibilidad: al no publicarse ni el dataset ni la configuración de entrenamiento, los resultados de este adaptador no pueden reproducirse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asparius/Qwen2.5-7B-LORA-SDF-Unguided-epoch3
- Modelo base Qwen2.5-Coder-7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Adaptador hermano SDF-Neutral-epoch3: https://huggingface.co/asparius/Qwen2.5-7B-LORA-SDF-Neutral-epoch3
- Adaptador hermano SDF-epoch2: https://huggingface.co/asparius/Qwen2.5-7B-LORA-SDF-epoch2
- Repositorio de Qwen2.5 (espejo en GitHub): https://github.com/mx4ai/qwen2.5
- Guía de ajuste fino de Qwen2.5-7B con QLoRA: https://github.com/RkanGen/finetune_qwen_using_qlora
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019, sobre impacto ambiental del aprendizaje automático): https://arxiv.org/abs/1910.09700
- Ficha agregadora de modelos de la misma familia: https://free2aitools.com/model/asparius/qwen2.5-7b-lora-sdf-neutral-epoch3
- Dataset de entrenamiento: no disponible
- Paper del modelo: no disponible
- Demo: no disponible
