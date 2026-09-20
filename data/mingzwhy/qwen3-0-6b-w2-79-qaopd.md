# MingZwhy/Qwen3-0.6B-W2.79-QAOPD

## Resumen

Qwen3-0.6B-W2.79-QAOPD es un checkpoint del modelo Qwen3-0.6B (596.049.920 parámetros) cuantizado a 2,79 bits efectivos por peso y posteriormente recuperado mediante un proceso en dos fases: destilación consciente de la cuantización (QAD, quantization-aware distillation) seguida de destilación on-policy (OPD). Lo publica el usuario MingZwhy en Hugging Face junto con el repositorio de código QAOPD, que incluye el recetario de entrenamiento y el arnés de evaluación. La cuantización está "horneada" en los pesos: no hay que aplicar ninguna conversión en tiempo de carga, basta con cargar el checkpoint y evaluarlo.

El interés de esta ficha no está en el modelo base (un transformer denso de 0,6B ya conocido) sino en la técnica: demuestra que es posible comprimir un modelo pequeño hasta 2,79 bits por peso manteniendo un rendimiento competitivo frente al modelo sin cuantizar en varias tareas. Los resultados publicados muestran una pérdida clara en matemáticas complejas (AMC23 cae de 7,81 a 4,69) y en código (HumanEval de 36,6 a 29,9), pero una mejora aparente en GSM8K (de 41,62 a 43,14), lo que sugiere que el proceso de destilación compensa parcialmente el daño de la cuantización extrema.

Se trata de un experimento de investigación con cero descargas y cero likes en el momento de redactar esta ficha, orientado a quienes trabajan en compresión de modelos, despliegue en dispositivos muy limitados o evaluación de pipelines de cuantización. Licencia Apache-2.0 heredada de Qwen3-0.6B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), con atención grouped-query (GQA) |
| Parametros totales | 596.049.920 (≈0,6 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; heredada de Qwen3-0.6B (32.768 tokens nativos según el modelo base, sin confirmar para este checkpoint) |
| Tipos de cuantizacion | Pesos mixtos INT1,58 / INT4 en bloques de 256, con el 50% de los bloques en INT4 → 2,79 bits efectivos; embeddings y cabeza de salida en INT4; activaciones en INT8; KV cache en 16 bits |
| Idiomas soportados | No disponible en la model card (el modelo base Qwen3-0.6B declara soporte multilingüe amplio, pero no se confirma para este checkpoint) |
| Licencia | Apache-2.0 (heredada de Qwen3-0.6B) |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`; el repo incluye código personalizado) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-0.6B sin modificaciones estructurales: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU y atención con consultas agrupadas (GQA). Lo que cambia este checkpoint es exclusivamente el formato numérico de los pesos y el proceso de recuperación posterior. La cuantización es mixta: bloques de 256 pesos que se asignan a INT1,58 o a INT4, con una proporción del 50% en INT4, lo que da una media efectiva de 2,79 bits por peso. Los embeddings y la cabeza de salida se mantienen en INT4, las activaciones se calculan en INT8 y la caché KV se conserva en 16 bits para no degradar la atención de contexto largo.

Sobre el entrenamiento, la model card describe un pipeline de dos etapas: primero destilación consciente de la cuantización (QAD), que ajusta los pesos cuantizados para imitar las salidas del modelo en precisión completa, y después destilación on-policy (OPD), en la que el propio modelo cuantizado genera las secuencias que se usan para el ajuste, de forma que la distribución de entrenamiento coincide con la del despliegue. El autor no publica en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El código, el recetario y el arnés de evaluación están en el repositorio MingZwhy/QAOPD, que es la única fuente técnica adicional disponible.

## Capacidades

- Generación de texto autoregresiva en modalidad de completado; el pipeline declarado en Hugging Face es `text-generation`.
- Razonamiento matemático básico: 43,14 en GSM8K (5-shot, strict-match) y 24,20 en MATH-500 (4-shot), según los datos del autor.
- Generación de código de completado: 29,9 en HumanEval y 33,7 en MBPP (pass@1 greedy).
- Capacidad conversacional: la etiqueta `conversational` aparece en los tags, pero la model card no documenta plantilla de chat ni formato de turnos, por lo que no está verificado.
- Tool calling / function calling: no documentado en la model card. No debe asumirse su funcionamiento.
- Modo de razonamiento explícito (thinking mode): Qwen3 lo incorpora en su familia, pero la model card no confirma que se conserve tras la cuantización a 2,79 bits ni con qué calidad.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Ejecución eficiente en hardware muy limitado: los pesos ocupan aproximadamente 0,23 GB en el formato empaquetado, lo que permite inferencia en CPU.

## Casos de uso

- Despliegue en dispositivos de borde con memoria muy restringida: con unos 0,23 GB de pesos en el formato empaquetado, el modelo cabe en una Raspberry Pi 5, en un mini-PC sin GPU dedicada o en un contenedor con límite de memoria de 1 GB, algo inviable para un 0,6B en BF16 (≈1,2 GB solo de pesos).
- Enrutado de intenciones en sistemas multi-agente: usar este modelo como clasificador barato que decide a qué modelo grande derivar cada consulta; su huella mínima permite mantener cientos de instancias en paralelo o ejecutarlo en la misma máquina que el modelo principal.
- Extracción de entidades y estructuración de texto en pipelines de ingesta: tareas de etiquetado secuencial y extracción de campos donde la precisión de razonamiento profundo importa menos que el coste por token, y donde la ventaja de los 2,79 bits se traduce directamente en menos memoria y más concurrencia.
- Aumento de datos y generación sintética a gran escala: la baja huella permite generar corpus masivos con un coste energético reducido, aceptando la pérdida de calidad respecto a un modelo mayor.
- Investigación en cuantización extrema: sirve como referencia reproducible (con el arnés de evaluación del repositorio QAOPD) para comparar QAD + OPD frente a esquemas como AWQ, GPTQ o GGUF Q4_K_M en el mismo modelo base.
- Autocompletado de código local en entornos sin conexión: con 29,9 en HumanEval es viable para sugerencias de una o dos líneas en editores ligeros, siempre que no se espere corrección de fragmentos complejos.
- Pruebas de integración y CI de pipelines de transformers: al ser un checkpoint pequeño con código personalizado (`trust_remote_code`), resulta útil para validar cadenas de carga, tokenización y serialización en cuestión de segundos en lugar de minutos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. GSM8K en 5-shot strict-match, MATH-500 en 4-shot, AMC23 con avg@16, MBPP y HumanEval con pass@1 greedy, y QA9 como media ponderada de nueve benchmarks evaluados por verosimilitud.

| Benchmark | Este modelo (W2.79) | Qwen3-0.6B BF16 | Diferencia |
|---|---:|---:|---:|
| GSM8K | 43,14 | 41,62 | +1,52 |
| MATH-500 | 24,20 | 27,20 | -3,00 |
| AMC23 | 4,69 | 7,81 | -3,12 |
| MBPP | 33,7 | 40,0 | -6,3 |
| HumanEval | 29,9 | 36,6 | -6,7 |
| QA9 (media de nueve benchmarks) | 43,64 | 46,08 | -2,44 |

No se han publicado resultados de benchmarks adicionales (MMLU, BBH, IFEval, evaluación multilingüe, latencia o throughput) en la información disponible.

## Requisitos de hardware

- Pesos en memoria: aproximadamente 0,23 GB en el formato empaquetado de 2,79 bits (596 M de parámetros, con embeddings y cabeza de salida en INT4). El repositorio completo ocupa 1,2 GB.
- Caché KV: al conservarse en 16 bits, con 28 capas y 8 cabezas KV de dimensión 128 en Qwen3-0.6B, se estima en torno a 0,11 MB por token, es decir, unos 3,5 GB si se llena una ventana de 32.768 tokens. Con contextos cortos (2.000-4.000 tokens) el consumo es de 0,2-0,5 GB.
- VRAM estimada para inferencia: menos de 1 GB con contextos cortos; 4 GB o más si se trabaja con contexto largo o lote grande.
- GPU recomendadas: cualquier GPU consumer sirve. Una RTX 3050 de 8 GB o una GTX 1650 de 4 GB son suficientes para uso interactivo; una RTX 3060 de 12 GB o una RTX 4090 permiten lotes grandes y mayor throughput. Las A100 y H100 solo tienen sentido para servir muchas réplicas concurrentes del modelo en la misma GPU. También es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. El tag `text-generation-inference` y `endpoints_compatible` indican compatibilidad declarada con TGI y con los endpoints de Hugging Face. No se han publicado conversiones a GGUF, por lo que llama.cpp y Ollama no están soportados sin trabajo adicional; vLLM y otros motores con kernels propios tampoco están confirmados, dado que el modelo requiere código personalizado para deserializar la cuantización mixta.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | HumanEval | QA9 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| Qwen3-0.6B-W2.79-QAOPD | 596 M (2,79 bits) | No disponible en la model card | 43,14 | 29,9 | 43,64 | Apache-2.0 | Hugging Face, requiere `trust_remote_code` |
| Qwen3-0.6B BF16 (modelo base) | 596 M (BF16) | No disponible en la model card | 41,62 | 36,6 | 46,08 | Apache-2.0 | Hugging Face |
| Otras alternativas de tamaño comparable (Qwen2.5-0.5B, Llama 3.2 1B, Gemma 3 1B, y variantes cuantizadas AWQ/GPTQ/GGUF de Qwen3-0.6B) | 0,5-1 B | No disponible | No disponible | No disponible | No disponible | Diversas | No disponible |

La comparación solo puede establecerse con rigor frente a Qwen3-0.6B en precisión completa, porque es el único modelo para el que la model card aporta cifras medidas con el mismo arnés. Frente a él, este checkpoint gana 1,52 puntos en GSM8K pero pierde entre 3 y 6,7 puntos en el resto de benchmarks publicados, y reduce el espacio de pesos aproximadamente un orden de magnitud. No hay datos en la información proporcionada para comparar con alternativas cuantizadas de otros autores.

## Limitaciones y advertencias

- Cuantización extrema: 2,79 bits por peso es un régimen agresivo. La degradación medida es notable en tareas de razonamiento matemático avanzado (AMC23 pasa de 7,81 a 4,69) y en código (HumanEval de 36,6 a 29,9; MBPP de 40,0 a 33,7).
- La mejora en GSM8K (43,14 frente a 41,62) no debe interpretarse como superioridad general del modelo cuantizado; es un único benchmark y podría reflejar ruido de medición o el efecto específico del proceso de destilación sobre ese formato de tarea.
- Tamaño base muy reducido: con 0,6 B de parámetros, el riesgo de alucinación en tareas factuales y de razonamiento multi-paso es alto, con independencia de la cuantización.
- El autor no publica información sobre sesgos, composición del dataset de destilación, ni evaluación de seguridad. No hay datos de comportamiento en dominios sensibles.
- No hay información sobre idiomas soportados ni sobre calidad fuera del inglés; buena parte de los benchmarks publicados son en inglés.
- La longitud de contexto no se documenta en la model card. No debe asumirse la ventana de 32.768 tokens del modelo base sin verificarla.
- `trust_remote_code=True` implica ejecutar código publicado por un tercero con pocas descargas y sin revisión comunitaria; en producción conviene auditar el módulo antes de cargarlo.
- El formato de cuantización es propio y no estándar: no hay GGUF ni pesos compatibles con motores habituales sin adaptación, lo que dificulta el despliegue fuera del ecosistema de `transformers` y TGI.
- Licencia Apache-2.0: permite uso comercial y modificación, con la obligación de conservar el aviso de licencia y el archivo NOTICE. Conviene verificar también las condiciones del modelo base Qwen3-0.6B, del que se hereda.
- Cero descargas y cero likes en el momento de la consulta: no existe validación independiente de los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MingZwhy/Qwen3-0.6B-W2.79-QAOPD
- Repositorio de código, recetario y arnés de evaluación: https://github.com/MingZwhy/QAOPD
- Documentación de evaluación del repositorio: https://github.com/MingZwhy/QAOPD/blob/main/docs/EVALUATION.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Búsqueda web: no se han encontrado resultados relevantes; las únicas entradas devueltas corresponden a foros de soporte de Microsoft sin relación con el modelo.
