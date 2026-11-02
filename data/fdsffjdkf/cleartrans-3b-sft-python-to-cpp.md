# fdsffjdkf/ClearTrans-3B-SFT-Python-to-Cpp

## Resumen

ClearTrans 3B SFT Python to C++ es un checkpoint de ajuste fino supervisado (SFT) de dirección única construido sobre Qwen2.5-Coder-3B, publicado por el usuario fdsffjdkf como parte del artefacto ClearTrans. Resuelve una tarea muy concreta: la traducción automática de código fuente de Python a C++, un caso de uso con demanda real en migraciones de bases de código heredadas y en la modernización de componentes críticos por rendimiento. El modelo no es un asistente generalista, sino un traductor especializado de un solo par de lenguajes.

Arquitectura transformer decoder-only de la familia Qwen2, con 3.085.938.688 parámetros totales (dato real extraído de los safetensors) y pesos en formato safetensors. El repositorio ocupa 6,8 GB, lo que corresponde a los pesos en precisión completa o media sin cuantizar. El contexto heredado de la base Qwen2.5-Coder-3B es de 32.768 tokens según la documentación pública del modelo original, aunque la model card de este checkpoint no lo declara explícitamente.

La relevancia de esta ficha es limitada pero legítima: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin validación de inferencia en GPU ni reproducción de benchmarks por parte del autor. La model card es explícita al respecto: se ha verificado el tamaño de los ficheros, el diseño de los tensores y los índices de los shards, pero no la inferencia ni los resultados numéricos. Debe tratarse, por tanto, como un peso experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-Coder-3B; no declarado en la model card de este checkpoint) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors sin cuantizar; no se publican GGUF ni AWQ/GPTQ) |
| Idiomas soportados | No disponible (la tarea objetivo es traducción de código Python a C++; el soporte de lenguaje natural no se documenta) |
| Licencia | Qwen Research License Agreement (uso no comercial para investigación o evaluación) |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning, no LoRA) de Qwen2.5-Coder-3B, un transformer decoder-only denso. La model card documenta los hiperparámetros del entrenamiento: learning rate de 1e-05, batch size total de 64 (batch 1 por dispositivo con acumulación de 8 pasos en 8 GPUs), 3 épocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno y semilla 42. El entrenamiento se ejecutó con Transformers 4.57.1 y PyTorch 2.9.1. El dataset identificado es `train_full_1231_python2cpp_idx3`, de dirección específica Python a C++; los ejemplos de entrenamiento no se incluyen en el repositorio y la model card advierte que el nombre por sí solo no verifica la procedencia ni el procedimiento de reconstrucción del dataset.

No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF, DPO o GRPO. La model card aclara explícitamente que este checkpoint corresponde a la etapa SFT y que no se establece que sea un checkpoint final entrenado con GRPO, ni se le atribuye ninguna puntuación de benchmark del manuscrito asociado. Tampoco se describen innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.); el modelo hereda la arquitectura estándar de Qwen2 con atención de causalidad completa.

## Capacidades

- Traducción de código Python a C++ como tarea principal y única documentada.
- Generación de texto conversacional en formato chat (el tokenizer y la plantilla de chat están incluidos en el checkpoint).
- Generación de código en sentido genérico, heredada de la base Qwen2.5-Coder-3B.
- Soporte de tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado ni validado.
- Capacidades multilingües de lenguaje natural: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Razonamiento matemático: no evaluado en este checkpoint.

## Casos de uso

- Migración de módulos Python a C++ en bases de código heredadas: el modelo recibe un fichero o función Python y devuelve una propuesta de traducción a C++, útil como primer borrador que un ingeniero revisa y corrige. Adecuado por su especialización de dirección única, que evita que el modelo derive hacia otras tareas.
- Modernización de cuellos de botella de rendimiento: identificar funciones Python candidatas a reimplementación en C++ y generar la versión traducida para su integración en extensiones nativas o módulos compilados.
- Generación de borradores para revisión humana en pipelines de CI: el modelo produce la traducción y las herramientas de análisis estático y los tests existentes validan el resultado antes de fusionar. La model card advierte que las traducciones pueden contener errores funcionales y code smells, por lo que la validación automatizada es imprescindible.
- Prototipado de bindings y envoltorios: traducir pequeñas utilidades Python a C++ para exponerlas mediante pybind11 o ctypes, reduciendo el trabajo manual de reescritura.
- Investigación en traducción automática de código: el checkpoint sirve como línea base SFT para experimentos de transcompilación y para comparar con variantes posteriores (por ejemplo, entrenadas con GRPO) dentro del artefacto ClearTrans.
- Docencia y formación en C++: generar pares Python/C++ equivalentes para ilustrar diferencias de gestión de memoria, tipos y estructuras de control, siempre con revisión del instructor.
- Evaluación de robustez de traductores de código: usar el checkpoint como sujeto de pruebas en estudios sobre errores semánticos en transcompilación, dado que el autor no ha publicado resultados de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la inferencia en GPU y la reproducción de benchmarks no han sido validadas para esta release, y que no se atribuye ninguna puntuación de benchmark del manuscrito a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB en fp16 (3,086 mil millones de parámetros × 2 bytes) más overhead de activaciones y caché KV; en torno a 7-8 GB en la práctica con contexto moderado.
- En cuantización de 8 bits: aproximadamente 3,1 GB de pesos; en 4 bits: aproximadamente 1,6 GB de pesos. Estas cuantizaciones no se distribuyen en el repositorio y requerirían conversión propia.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegue con contexto completo de 32K y concurrencia; RTX 4090 (24 GB) sobrada para una instancia en fp16.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 y superiores en fp16; en GPUs de 8 GB (RTX 3070, RTX 4060 Ti) solo con cuantización de 8 bits o inferior.
- Opciones de despliegue: Transformers (versión compatible con 4.57.1), Text Generation Inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM para serving de alto rendimiento. No se distribuyen GGUF, por lo que llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Python-to-Cpp | 3,09 B | 32.768 (heredado, no declarado) | Traduccion Python a C++ (SFT) | Qwen Research (no comercial) | HuggingFace, 0 descargas |
| Qwen2.5-Coder-3B (base) | 3,09 B | 32.768 | Generacion de codigo general | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen2.5-Coder-7B | 7,62 B | 32.768 | Generacion de codigo general | Apache 2.0 | HuggingFace, ampliamente usado |
| CodeLlama-7B | 6,74 B | 16.384 | Generacion de codigo general | Llama 2 Community | HuggingFace, ampliamente usado |

La comparación directa con la base Qwen2.5-Coder-3B es la más relevante: ClearTrans añade especialización de dirección única a costa de una licencia más restrictiva (Qwen Research en lugar de Apache 2.0) y de perder la validación comunitaria de la que goza el modelo original. Frente a modelos de 7B como Qwen2.5-Coder-7B o CodeLlama-7B, ClearTrans ofrece la mitad de parámetros y, por tanto, menor huella de memoria, pero no hay datos que permitan afirmar que su calidad de traducción supere a la de un modelo mayor con prompting adecuado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al heredar de Qwen2.5-Coder-3B, arrastra los sesgos del corpus de entrenamiento original, no auditados en este checkpoint.
- Riesgo de alucinación: alto en una tarea de traducción de código; la model card advierte que las traducciones generadas pueden contener errores funcionales y code smells, y exige evaluarlas con los tests y herramientas de análisis previstas antes de confiar en ellas.
- Limitaciones de contexto o idioma: el contexto de 32K no está declarado en la model card de este checkpoint; el soporte de lenguajes naturales distintos del código no está documentado.
- Restricciones de licencia: los pesos se distribuyen bajo la Qwen Research License Agreement para uso no comercial en investigación o evaluación. No están relicenciados bajo MIT ni Apache 2.0. Cualquier uso comercial requiere revisar los términos del acuerdo con el titular de la licencia.
- Sin validación de inferencia: el autor confirma que la inferencia en GPU y la reproducción de benchmarks no se han validado para esta release. Los pesos han pasado comprobaciones de tamaño, diseño de tensores e índices de shards, pero no pruebas funcionales.
- Sin datos de entrenamiento ni estados del optimizador: el repositorio es una release de pesos, no evidencia de reproducción numérica completa de los experimentos reportados.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de calidad ni de fallos.
- Identificador de autor genérico (`fdsffjdkf`) y ausencia de paper enlazado en la model card; la reproducibilidad depende del repositorio de GitHub del proyecto ClearTrans.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Python-to-Cpp
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio de implementación y replicación: https://github.com/Xingzhehu/ClearTrans
- Licencia (referenciada en el repo): LICENSE dentro del repositorio de HuggingFace
- Atribución y declaración de modificaciones: NOTICE dentro del repositorio de HuggingFace
