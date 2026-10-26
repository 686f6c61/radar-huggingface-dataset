# mradermacher/MenteE-Code-3B-GGUF

## Resumen

MenteE-Code-3B-GGUF es la colección de cuantizaciones en formato GGUF publicada por mradermacher sobre el modelo MenteEAI/MenteE-Code-3B, un modelo orientado a código y a flujos agénticos de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones). No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión y cuantización del modelo base original, cuyo objetivo es permitir la inferencia en CPU, GPU de consumo y entornos con memoria limitada mediante llama.cpp y herramientas compatibles.

El modelo base se distribuye bajo licencia Apache 2.0 y declara soporte para inglés y código. Las etiquetas de la model card indican que se ha construido mediante ajuste fino supervisado (SFT) y adaptadores LoRA sobre una arquitectura previa no especificada, con un enfoque explícito hacia tareas de código y uso agéntico (tool calling, razonamiento multi-paso). El repositorio ofrece doce variantes de cuantización, desde Q2_K (1,4 GB) hasta f16 (6,3 GB), lo que cubre un rango amplio de presupuestos de memoria.

Su relevancia práctica radica en que un modelo de ~3B en Q4_K_M ocupa apenas 2,0 GB en disco, lo que lo sitúa al alcance de portátiles y equipos sin GPU dedicada, algo crítico para asistentes de código locales, autocompletado en IDE y agentes que deben ejecutarse en el puesto de trabajo sin enviar código a servicios externos. La contrapartida es la ausencia total de datos publicados sobre arquitectura, contexto, dataset de entrenamiento y benchmarks, lo que obliga a evaluarlo empíricamente antes de cualquier uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no especifica la arquitectura; las etiquetas indican ajuste con LoRA y SFT sobre MenteEAI/MenteE-Code-3B) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE; el recuento real de safetensors coincide con un modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (`en`) y código (`code`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se publica en safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base: la model card de la cuantización no incluye configuración de capas, dimensión oculta, mecanismo de atención ni tipo de tokenizador. Lo único documentado en las etiquetas es el proceso de ajuste: `lora` y `sft`, es decir, un ajuste fino supervisado con adaptadores LoRA de bajo rango sobre un modelo previo, con las etiquetas `code` y `agentic` señalando que el corpus de ajuste está orientado a generación de código y a interacciones de tipo agente. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases posteriores de RLHF o DPO.

Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa, modos de razonamiento explícito, etc.). El repositorio de mradermacher es exclusivamente de conversión y cuantización: aplica el pipeline estándar de llama.cpp (convert_type `hf`, quantize_version 2, tensor de salida cuantizado) para generar cuantizaciones estáticas, y advierte de que no ha producido cuantizaciones ponderadas con imatrix, que suelen ofrecer mejor relación calidad/tamaño en el rango de 2 a 4 bits. Para conocer el detalle de entrenamiento hay que consultar la model card del modelo base.

## Capacidades

- Generación de código en inglés y en lenguajes de programación: la etiqueta `code` y el nombre del modelo indican especialización en tareas de programación, aunque no se detallan lenguajes concretos soportados.
- Flujos agénticos: la etiqueta `agentic` sugiere entrenamiento orientado a interacciones multi-paso, aunque la model card no especifica formatos de tool calling ni plantillas de función concretas.
- Formato conversacional: la etiqueta `conversational` indica que el modelo está preparado para diálogo multiturno con una plantilla de chat definida en el modelo base.
- Razonamiento y matemáticas: no confirmado explícitamente en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles; el repositorio no incluye proyector multimodal (`skip_mmproj` vacío, sin ficheros mmproj) y las etiquetas no las mencionan.
- Multilingüismo: limitado a inglés y código; no se declara soporte de castellano ni de otros idiomas naturales.
- Modo "thinking" o razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Autocompletado y asistencia de código en IDE local: con la variante Q4_K_M (2,0 GB) el modelo cabe en memoria junto al editor, lo que permite ofrecer sugerencias sin enviar el código fuente a un servicio externo; es el escenario habitual para equipos con requisitos de confidencialidad.
- Revisión de pull requests en local: el modelo puede recibir un diff y generar comentarios o resúmenes de cambios; su tamaño permite ejecutarlo en el runner de CI o en la máquina del revisor sin coste por token.
- Agentes de refactorización de pequeña escala: la etiqueta `agentic` apunta a ese uso, con el modelo encadenando pasos de lectura de fichero, propuesta de parche y verificación; conviene validar empíricamente la fiabilidad del formato de tool calling antes de automatizar.
- Generación de tests unitarios y documentación técnica: tareas de transformación de código a texto bien delimitadas, donde un modelo de 3B suele ser suficiente y el coste de un error es bajo porque el resultado pasa revisión humana.
- Enseñanza y prototipado de pipelines de IA generativa: al ocupar menos de 7 GB incluso en f16, es adecuado para laboratorios docentes con GPUs modestas o CPU, y para comparar el efecto de distintas cuantizaciones sobre la calidad de salida.
- Despliegue en el borde o en entornos air-gapped: al ser GGUF y Apache 2.0, puede empaquetarse en una imagen de contenedor y ejecutarse en dispositivos sin conectividad, algo inviable con modelos de mayor tamaño.
- Traducción de código entre lenguajes en tareas acotadas: útil para conversiones puntuales de fragmentos (por ejemplo, scripts de Python a otro lenguaje) siempre que se validen con tests, dado el riesgo de alucinación en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye MMLU, HumanEval, GSM8K, MBPP ni ninguna otra métrica, y tampoco se aportan comparaciones con el modelo base en precisión completa. Cualquier cifra que se cite para este modelo debe obtenerse midiendo directamente sobre las variantes GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + caché KV, con contexto moderado): Q2_K en torno a 2 GB; Q4_K_M en torno a 2,5–3 GB; Q8_0 en torno a 4 GB; f16 en torno a 7 GB. Son estimaciones basadas en el tamaño de fichero; no hay mediciones publicadas.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y superiores, e incluso en GPUs de 4–6 GB con cuantizaciones Q3/Q4.
- GPU de centro de datos: A100, H100, L40S o A10 no son necesarias para el modelo en sí; se justifican únicamente para servir muchas peticiones concurrentes con vLLM.
- CPU: viable en exclusiva con llama.cpp/Ollama usando Q4_K_M o Q5_K_M; el rendimiento depende del número de núcleos y del ancho de banda de memoria, no hay cifras publicadas.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y LM Studio (requieren importar el GGUF o crear un Modelfile), llama-cpp-python para integración en aplicaciones, y vLLM/TGI solo si se trabaja con los pesos safetensors del modelo base, ya que estas herramientas no consumen GGUF de forma estándar.
- Latencia y throughput: no disponibles. Como referencia orientativa no medida, un modelo denso de 3B en Q4_K_M suele superar con holgura las decenas de tokens por segundo en GPUs de consumo actuales, pero debe verificarse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MenteE-Code-3B (este, vía GGUF) | ~3,09 B | No disponible | Apache 2.0 | GGUF en 12 cuantizaciones; safetensors en el modelo base |
| Qwen2.5-Coder-3B | ~3,09 B | 32.768 tokens (dato público de referencia) | Apache 2.0 | Pesos safetensors y múltiples GGUF de terceros |
| Llama 3.2 3B | ~3,21 B | 128.000 tokens (dato público de referencia) | Licencia comunitaria Llama 3.2 | Pesos oficiales y GGUF de terceros |
| StarCoder2-3B | ~3 B | 16.384 tokens (dato público de referencia) | BigCode OpenRAIL-M | Pesos safetensors y GGUF de terceros |

Nota: los datos de contexto y licencia de las alternativas provienen de información pública general y no han sido verificados dentro de la información proporcionada para este modelo; los benchmarks comparativos no están disponibles para MenteE-Code-3B, por lo que no es posible establecer una comparación de rendimiento objetiva. La ventaja diferencial de esta ficha es la licencia Apache 2.0 combinada con cuantizaciones publicadas en el mismo repositorio, algo que StarCoder2-3B no ofrece por su licencia OpenRAIL-M.

## Limitaciones y advertencias

- Idiomas: solo inglés y código; no hay soporte declarado de castellano, lo que degradará la calidad en prompts o documentación en español.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en HumanEval, MBPP ni tareas agénticas; el rendimiento debe medirse antes de adoptarlo.
- Riesgo de alucinación: en un modelo de ~3B es esperable que invente APIs, firmas de funciones o imports inexistentes; requiere validación con compilación y tests.
- Tool calling no verificado: la etiqueta `agentic` no garantiza un formato de function calling estable; hay que comprobar la plantilla de chat del modelo base y probar el parseo de llamadas.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_M degradan la calidad de forma notable (la propia model card marca Q3_K_M como "lower quality"); para código se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no las ha generado, por lo que las cuantizaciones de 2–4 bits pueden ser inferiores a las de otros repositorios con calibración ponderada.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, de modo que no existe retroalimentación de terceros sobre su comportamiento.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar la procedencia del modelo base y de los datos de ajuste (código con licencias heterogéneas) antes de redistribuirlo en un producto.
- Metadatos incompletos: no se indica pipeline, ni configuración de generación recomendada, ni longitud de contexto; esto complica la integración automática en plataformas que dependen de esos campos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MenteE-Code-3B-GGUF
- Modelo base: https://huggingface.co/MenteEAI/MenteE-Code-3B
- Página de overview de cuantizaciones del autor: https://hf.tst.eu/model#MenteE-Code-3B-GGUF
- Solicitudes de cuantización y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad entre tipos de cuantización (gráfico de ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
