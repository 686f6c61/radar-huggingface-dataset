# mhseo2/Qwen3-4B-Inst-Math-Reasoning-SFT-opd

## Resumen

Qwen3-4B-Inst-Math-Reasoning-SFT-opd es un ajuste fino supervisado (SFT) del modelo unsloth/Qwen3-4B-Instruct-2507, una variante optimizada de la familia Qwen3 de Alibaba. El modelo lo publica el usuario mhseo2 en HuggingFace, aunque la model card atribuye el desarrollo a Harsha Vardhan Mannem (Harsha901). Se trata de un transformer causal decoder-only de aproximadamente 4.022 millones de parámetros, especializado en razonamiento matemático y resolución de problemas paso a paso, con salidas en formato cadena de pensamiento (chain-of-thought).

El problema que aborda es el de mejorar la adherencia a instrucciones y la estabilidad del razonamiento en tareas matemáticas respecto al modelo base, produciendo explicaciones intermedias más estructuradas y soluciones menos incompletas. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que reduce el coste computacional del ajuste fino. Es relevante como punto de partida para alineamiento posterior (DPO/RLHF), asistentes educativos y evaluación de razonamiento en un tamaño contenido de 4B parámetros.

El modelo se distribuye bajo licencia Apache 2.0 y está declarado únicamente para inglés. No cuenta con resultados formales de benchmarks publicados en la información disponible, y su repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Causal LM) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada en la informacion disponible (heredada del modelo base unsloth/Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no se distribuyen cuantizaciones listadas; el autor menciona 4-bit / 8-bit como trabajo futuro. Inferencia en FP16/BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only, coherente con la familia Qwen3, con tokenizador propio de Qwen. Parte del modelo unsloth/Qwen3-4B-Instruct-2507, una version optimizada para eficiencia de entrenamiento e inferencia. No se detalla en la informacion disponible el numero de capas, dimensiones de atencion, cabezas ni si emplea atención lineal o decodificacion especulativa, por lo que esos datos quedan como no disponibles.

El ajuste se realizo mediante Supervised Fine-Tuning (SFT) sobre un dataset curado de instrucciones matematicas, soluciones paso a paso y explicaciones orientadas al razonamiento, filtrado para enfatizar consistencia logica, pasos intermedios claros y menor ambiguedad. El entrenamiento uso Hugging Face Transformers + TRL, con Unsloth para acelerar y reducir memoria, optimizador AdamW, funcion de perdida de entropia cruzada y batching con acumulacion de gradientes. La precision de entrenamiento fue FP16/BF16 segun hardware. No se menciona RLHF ni DPO en esta fase (el DPO se plantea como trabajo futuro). La model card indica que el entrenamiento fue aproximadamente 2x mas rapido gracias a Unsloth.

## Capacidades

- Razonamiento matematico multi-paso con cadenas de pensamiento explicitas.
- Resolucion de problemas de algebra, aritmetica y problemas de enunciado (word problems).
- Explicaciones paso a paso orientadas a un contexto educativo.
- Mejora en la adherencia a instrucciones respecto al modelo base, segun la evaluacion cualitativa del autor.
- Razonamiento mas estable y con menos soluciones incompletas que el modelo base, segun la model card.
- Generacion de texto conversacional (pipeline text-generation).
- No se documenta soporte de tool calling / function calling en la informacion disponible.
- No se documenta soporte especifico de agentes ni multi-step tool use.
- Capacidades multilingues: declarado solo en ingles.
- No se documentan capacidades de vision, audio ni modo thinking explicito mas alla del estilo chain-of-thought del entrenamiento.

## Casos de uso

- Asistente educativo de matematicas: el modelo genera soluciones paso a paso de ecuaciones y problemas de enunciado, adecuado para entornos de aprendizaje donde se requiere explicar el procedimiento y no solo el resultado.
- Generacion de soluciones de referencia para docentes: puede producir resoluciones estructuradas de algebra y aritmetica que un docente revisa y adapta antes de publicarlas.
- Generacion de datos sinteticos de razonamiento: sus cadenas de pensamiento pueden emplearse para crear datasets de entrenamiento o para alimentar fases posteriores de DPO/RLHF, tal como plantea el propio autor.
- Evaluacion cualitativa de modelos matematicos: sirve como linea base en pruebas comparativas de razonamiento paso a paso frente a otros modelos de ~4B.
- Preprocesamiento de problemas matematicos para pipelines: uso dentro de pipelines que necesitan descomponer un problema en pasos intermedios antes de una verificacion automatica.
- Prototipado en investigacion: punto de partida ligero (4B) para experimentos academicos de fine-tuning y alineamiento sin requerir hardware de gran escala.
- Asistencia en tareas de estudio autoguiado: generacion de explicaciones matematicas largas donde el usuario valora el detalle del razonamiento por encima de la concision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion fue cualitativa (problemas de enunciado, ecuaciones algebraicas y tareas de razonamiento multi-paso) y que los benchmarks formales como GSM8K o MATH estan planificados para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del recuento real de 4.022 millones de parametros):
  - BF16/FP16: en torno a 8 GB solo de pesos, mas cache KV y overhead, lo que situa el requisito practico tipico en 10-12 GB.
  - Int8: aproximadamente 4-5 GB de pesos.
  - Int4: aproximadamente 2,5-3,5 GB de pesos.
- GPU recomendadas: cualquier GPU con 12 GB o mas para BF16 (RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100, H100). Para Int4 o Int8 son suficientes GPUs de 6-8 GB.
- Cabe en GPU de consumo: si. En BF16 cabe en tarjetas de 12-16 GB; cuantizado cabe en GPUs de 6-8 GB. No se han publicado cifras oficiales de consumo de VRAM por parte del autor.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta declarada), vLLM y llama.cpp/Ollama previa conversion a GGUF. El autor menciona 4-bit / 8-bit como trabajo futuro, por lo que las cuantizaciones listas para usar no estan garantizadas.
- Latencia y throughput: no disponible (no publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Inst-Math-Reasoning-SFT-opd | ~4B | no disponible (heredado del base) | sin benchmarks publicados | apache-2.0 | HuggingFace, 0 descargas |
| unsloth/Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible en esta informacion | sin datos en esta informacion | apache-2.0 (segun base Qwen3) | HuggingFace |
| Otros modelos matematicos de ~4B-7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No garantiza correccion matematica en todos los casos; puede producir resultados erroneos pese a presentar un razonamiento aparentemente coherente.
- Puede ser verboso por el estilo de razonamiento entrenado.
- No esta optimizado para escritura creativa ni para contenido no tecnico.
- El rendimiento puede degradarse ante prompts muy largos o ambiguos; la longitud de contexto no esta especificada.
- Solo declarado para ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en pasos intermedios de razonamiento.
- El dataset puede contener ruido o sesgos procedentes de corpus matematicos publicos, segun reconoce el propio autor.
- La model card indica uso previsto para investigacion y educacion; no es adecuado para decisiones de alto impacto sin supervision humana, y las salidas deben verificarse en aplicaciones criticas.
- Licencia Apache 2.0, que en principio permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-4B-Instruct-2507 y los terminos del repositorio.
- Discrepancia de atribucion: el ID del repositorio apunta al usuario mhseo2 mientras que la model card atribuye el desarrollo a Harsha901; conviene verificar la procedencia real de los pesos y del dataset.
- El repositorio aparece con 0 descargas y 0 likes, lo que implica que no existe validacion por parte de la comunidad.
- No hay benchmarks formales publicados, por lo que no se puede confirmar la mejora declarada frente al modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/mhseo2/Qwen3-4B-Inst-Math-Reasoning-SFT-opd
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- No se han encontrado papers, blogs, repositorios ni demos adicionales especificos de este modelo en la busqueda web realizada.
