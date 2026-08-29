# segestic/MediLITE-QA-GGUF

## Resumen

MediLITE-QA-GGUF es un modelo de generación de texto cuantizado en formato GGUF, resultado de la fusión de un adaptador LoRA de especialización médica con el modelo base `microsoft/Phi-3.5-mini-instruct`. El adaptador, desarrollado por el usuario `segestic`, fue entrenado mediante QLoRA sobre un conjunto de datos médico denominado `seg-vall_med`, y posteriormente fusionado y cuantizado para su uso con motores de inferencia compatibles con GGUF como `llama.cpp` u Ollama.

El modelo está pensado para tareas de respuesta a preguntas médicas y comprensión de documentos clínicos en entornos offline. Con aproximadamente 3.800 millones de parámetros, se sitúa en la gama de modelos pequeños que pueden ejecutarse en hardware de consumo, aunque el repositorio no especifica los niveles de cuantización disponibles ni la longitud de contexto exacta. Su licencia MIT permite uso comercial sin restricciones, pero el autor advierte explícitamente de que no es una herramienta clínica certificada.

La relevancia de este modelo radica en la combinación de un base compacta y eficiente (Phi-3.5-mini) con un ajuste fino especializado en dominio médico, ofreciendo una alternativa ligera para aplicaciones de asistencia sanitaria que requieren privacidad y despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Phi-3.5-mini-instruct) |
| Parametros totales | 3.821.079.648 (3,8 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el adaptador sugiere 4K, no confirmado) |
| Tipos de cuantizacion | no disponible (el repositorio contiene multiples archivos GGUF, sin especificar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de `microsoft/Phi-3.5-mini-instruct`, un transformer decoder-only con atención de ventana deslizante y optimizaciones propias de la familia Phi-3.5. Sobre esta base se aplicó un adaptador LoRA entrenado con QLoRA (cuantización de 4 bits durante el entrenamiento) sobre un dataset médico denominado `seg-vall_med`. El proceso de entrenamiento no está documentado en detalle: se desconoce el número de tokens, la composición exacta del dataset, o si se aplicaron técnicas de alineación como RLHF o DPO. El adaptador fue posteriormente fusionado con el modelo base y cuantizado a formato GGUF para su distribución.

No se han publicado detalles sobre innovaciones técnicas adicionales más allá del uso de LoRA y QLoRA. El nombre del adaptador sugiere una longitud de contexto de 4K tokens, pero no se confirma en la documentación.

## Capacidades

- Generación de texto en dominio médico: respuesta a preguntas sobre salud, terminología clínica y comprensión de documentos médicos.
- Comprensión de documentos: capacidad de procesar y extraer información de textos clínicos, historiales o artículos médicos (según la descripcion del autor).
- Inferencia offline: al estar en formato GGUF, puede ejecutarse en entornos sin conexión con motores como `llama.cpp`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, ni soporte multimodal (vision, audio).
- No se especifican idiomas soportados; se asume que hereda las capacidades multilingues del modelo base Phi-3.5-mini-instruct, pero no está confirmado.

## Casos de uso

- Asistente de consulta medica offline: un profesional sanitario puede desplegar el modelo en un dispositivo local para resolver dudas sobre farmacologia, sintomas o procedimientos sin depender de conexion a internet.
- Extraccion de informacion de historiales clinicos: el modelo puede procesar notas medicas y extraer datos relevantes como diagnostico, medicacion o alergias, facilitando la revision de expedientes.
- Generacion de resumenes de articulos cientificos: dado su entrenamiento en dominio medico, puede condensar documentos extensos en resumenes breves para revision rapida.
- Soporte a pacientes para comprension de terminos medicos: el modelo puede explicar en lenguaje sencillo conceptos complejos extraidos de informes o recetas.
- Clasificacion de consultas en triaje: a partir de descripciones de sintomas, el modelo puede categorizar la urgencia o derivar a especialidad, siempre como apoyo y no como diagnostico.
- Formacion y educacion medica: estudiantes de medicina pueden interactuar con el modelo para practicar casos clinicos o resolver dudas academicas en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 3,8 B en formato GGUF, las cuantizaciones tipicas requieren aproximadamente:
  - Q4_K_M: ~2,5-3 GB de VRAM
  - Q5_K_M: ~3-3,5 GB
  - Q8_0: ~4-4,5 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones mas bajas. Ejemplos: NVIDIA GTX 1660 Super, RTX 2060, RTX 3060, o superiores. Tambien puede ejecutarse en CPU con suficiente RAM (8-16 GB).
- Compatibilidad con hardware de consumo: si, cabe en GPUs de gama media y baja.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio, o cualquier motor compatible con GGUF. Tambien puede usarse con bindings de Python como `llama-cpp-python`.
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 3,8 B en GPU moderna, se espera una generacion de 20-40 tokens/segundo en cuantizacion Q4, pero depende del hardware y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| MediLITE-QA-GGUF (este) | 3,8 B | no disponible (sugerido 4K) | MIT | Medica (LoRA sobre Phi-3.5-mini) |
| BioMistral (7B) | 7 B | 8K | Apache 2.0 | Medica (fine-tuning de Mistral) |
| Meditron (7B) | 7 B | 4K | GPL-3.0 | Medica (fine-tuning de LLaMA-2) |
| Phi-3.5-mini-instruct (base) | 3,8 B | 128K | MIT | Generalista |

La comparacion es cualitativa, ya que no se dispone de benchmarks para MediLITE-QA. Frente a BioMistral y Meditron, este modelo es mas pequeño y ligero, lo que facilita su despliegue en hardware limitado, pero probablemente con menor capacidad de razonamiento general. Su licencia MIT es mas permisiva que la GPL de Meditron. El contexto del modelo base Phi-3.5-mini es de 128K, pero el adaptador LoRA parece haber sido entrenado con 4K, lo que podria limitar la ventana efectiva.

## Limitaciones y advertencias

- No es una herramienta clinica certificada: el autor advierte explicitamente que el modelo no debe usarse en produccion o toma de decisiones medicas sin validacion adecuada.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en dominios especializados como la medicina.
- Sesgos potenciales: el dataset de entrenamiento `seg-vall_med` no esta documentado, por lo que se desconocen posibles sesgos demograficos, geograficos o culturales.
- Longitud de contexto limitada: si el adaptador se entreno con 4K tokens, la ventana efectiva puede ser menor que la del modelo base (128K), lo que limita el procesamiento de documentos largos.
- Idiomas no especificados: no se garantiza el rendimiento en otros idiomas distintos del ingles (o el que use el dataset).
- Sin soporte de tool calling ni agentes: no es adecuado para tareas que requieran interaccion con APIs o ejecucion de acciones externas.
- Formato GGUF: requiere motores de inferencia compatibles; no se puede cargar directamente con Transformers de Hugging Face sin conversion previa.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/segestic/MediLITE-QA-GGUF
- Adaptador LoRA original: https://huggingface.co/segestic/phi3.5-mini-4k-qlora-medical-seg-vall_med
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Repositorio GitHub relacionado (MediLite, sistema multi-agente medico): https://github.com/Mariam-Mohsen/MediLite
