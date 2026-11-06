# nealfennimore/Llama-3.2-3B-Instruct-CMMC-ONNX

## Resumen

Llama-3.2-3B-Instruct-CMMC-ONNX es una adaptación del modelo meta-llama/Llama-3.2-3B-Instruct mediante un fine-tune LoRA fusionado con los pesos base, orientado específicamente al dominio de cumplimiento CMMC (Cybersecurity Maturity Model Certification) y NIST SP 800-171. Lo desarrolla nealfennimore como componente de inferencia local para su aplicación cmmc-app, un proyecto de código abierto alojado en GitHub. El modelo se distribuye en formato ONNX, lo que facilita su despliegue en entornos con ONNX Runtime en lugar de las pilas habituales de PyTorch.

El problema que resuelve es acotado pero concreto: responder preguntas sobre controles de seguridad, requisitos de evaluación y guías de auditoría CMMC Nivel 2 a partir de documentos normativos oficiales, sin depender de servicios en la nube. Esto es relevante para organizaciones del sector defensa y contratistas del Departamento de Defensa de EE. UU. que necesitan procesar información sensible de cumplimiento en local.

El modelo hereda la arquitectura y el tamaño del Llama 3.2 3B Instruct original, con 3.000 millones de parámetros y una ventana de contexto de 128.000 tokens según la especificación de la familia base. El repositorio ocupa 2,6 GB, coherente con pesos en precisión reducida o cuantizados para ONNX. La evaluación publicada por el autor muestra mejoras en métricas de recuperación y reducción de alucinaciones no fundamentadas respecto al modelo base, aunque con una ligera caída en precisión de preguntas de opción múltiple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), fine-tune LoRA fusionado |
| Parametros totales | 3.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (según especificación de Llama 3.2 3B Instruct; no verificado en esta build ONNX) |
| Tipos de cuantizacion | no disponible (el repo distribuye ONNX; se desconoce la precisión exacta de los pesos) |
| Idiomas soportados | no disponible en la model card (el modelo base soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only con atención por grupos (GQA), normalización RMSNorm y activación SwiGLU, entrenado por Meta con un corpus multilingüe y sometido a un pipeline de alineación con SFT y RLHF. Sobre esa base, el autor aplica un fine-tune LoRA centrado en el dominio de cumplimiento CMMC y lo fusiona con los pesos originales, de modo que el artefacto resultante es un modelo denso estándar sin adaptadores separados.

Los datos de entrenamiento provienen exclusivamente de fuentes normativas: NIST SP 800-171 Rev. 2 y Rev. 3, NIST SP 800-171A y la CMMC Assessment Guide Level 2. Según la model card, un script generó cada respuesta a partir de los documentos fuente, lo que explica la mejora en la métrica `draft_ungrounded_per_draft` (de 0,886 a 0,228), que mide respuestas no fundamentadas en el material de referencia. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como DPO o decodificación especulativa.

## Capacidades

- Generación de texto y respuesta a preguntas sobre controles, requisitos y prácticas de evaluación de NIST SP 800-171 y CMMC Nivel 2.
- Razonamiento sobre documentación normativa de seguridad, con énfasis en respuestas fundamentadas en las fuentes.
- Reducción de alucinaciones en el dominio específico respecto al modelo base, según las métricas publicadas.
- Capacidades generales heredadas de Llama 3.2 3B Instruct: generación de texto, razonamiento básico, código y matemáticas elementales.
- Soporte de tool calling y function calling heredado del modelo base, aunque no validado específicamente en esta variante.
- Capacidades multilingües heredadas del modelo base, no verificadas en el fine-tune.
- Despliegue en local mediante ONNX Runtime, sin dependencia de infraestructura cloud.

## Casos de uso

- Asistente de cumplimiento CMMC en local: la aplicación cmmc-app integra el modelo para responder consultas de auditores y responsables de seguridad sobre controles del Nivel 2, procesando documentación sensible sin salir de la red corporativa.
- Pre-evaluación de evidencias: dado un control concreto, el modelo puede generar borradores de respuestas de evaluación basadas en SP 800-171A, que el equipo revisa antes de incorporarlas al paquete de auditoría.
- Formación interna de equipos de seguridad: permite construir un chatbot que explique requisitos normativos a empleados nuevos, con respuestas ancladas a los documentos oficiales y menor riesgo de inventar controles inexistentes.
- Soporte a la redacción de políticas: el modelo ayuda a mapear políticas internas existentes contra los 110 requisitos de SP 800-171, señalando lagunas y sugiriendo redacciones alineadas con la guía.
- Despliegue en entornos air-gapped: al distribuirse en ONNX y ejecutarse con ONNX Runtime, puede integrarse en estaciones de trabajo aisladas de contratistas de defensa que no pueden usar APIs externas.
- Clasificación y triage de consultas: en un pipeline de soporte, el modelo puede enrutar preguntas entrantes hacia el control o la familia de controles correspondiente antes de que las revise un analista humano.
- Prototipado rápido de herramientas de cumplimiento: el formato ONNX y el tamaño de 3B permiten iterar en portátiles con GPU modesta, útil para equipos que desarrollan utilidades internas de governance, risk and compliance.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de evaluación del autor, comparando modelo base frente a fine-tune. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Base | Fine-tune |
|---|---|---|
| MCQ (precisión en opción múltiple) | 0,3641 | 0,3277 |
| Recall F1 | 0,3304 | 0,3534 |
| Draft leak rate | 0,1678 | 0,1342 |
| Draft ungrounded per draft | 0,8859 | 0,2282 |

La lectura de estos datos es clara: el fine-tune mejora la fundamentación de las respuestas (menos contenido no anclado a las fuentes) y el recall, pero empeora ligeramente la precisión en preguntas de opción múltiple, lo que sugiere un desplazamiento hacia respuestas más conservadoras y extractivas.

## Requisitos de hardware

- VRAM estimada: entre 2 y 3 GB en cuantización de 8 bits, entre 6 y 8 GB en FP16 para los 3.000 millones de parámetros (sin contar el overhead de ONNX Runtime).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4 o superiores para producción; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM en FP16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo), ONNX Runtime GenAI, y conversión a otros formatos si se necesita (llama.cpp, vLLM) partiendo del modelo base fusionado.
- Latencia y throughput: no disponibles; dependen del hardware y de la precisión ONNX elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-CMMC-ONNX | 3B | 128k (heredado) | CMMC / NIST 800-171 | Llama 3.2 Community | ONNX |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128k | Generalista | Llama 3.2 Community | Safetensors |
| Mistral-7B-Instruct | 7B | 32k | Generalista | Apache 2.0 | Safetensors, GGUF |
| Qwen2.5-3B-Instruct | 3B | 32k | Generalista multilingüe | Apache 2.0 | Safetensors, GGUF |

Frente al modelo base, la diferencia es la especialización y el formato ONNX; frente a Mistral-7B o Qwen2.5-3B, la ventaja es el dominio acotado y la fundamentación en fuentes normativas, a costa de menor generalidad y una licencia más restrictiva que Apache 2.0. No hay datos de benchmarks comparativos directos con estas alternativas en la información disponible.

## Limitaciones y advertencias

- El fine-tune está entrenado exclusivamente sobre documentación CMMC y NIST 800-171; fuera de ese dominio su rendimiento puede degradarse respecto al modelo base.
- La precisión en preguntas de opción múltiple cae respecto al modelo base (0,328 frente a 0,364), lo que indica menor fiabilidad en tareas de selección cerrada.
- Persiste un `draft_leak_rate` del 13,4 %, es decir, contenido filtrado o no deseado en los borradores generados.
- Riesgo de alucinación en controles, referencias normativas o números de requisito; toda salida debe validarse contra los documentos oficiales antes de usarse en una auditoría.
- La model card no documenta sesgos, idiomas efectivamente soportados tras el fine-tune ni el proceso exacto de generación del dataset.
- Licencia Llama 3.2 Community: permite uso comercial con condiciones (atribución, restricciones de uso, límite de 700 millones de usuarios mensuales para el licenciatario), pero no es una licencia permisiva tipo Apache o MIT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- La build ONNX no especifica la precisión de los pesos, lo que dificulta estimar con exactitud calidad y requisitos de memoria.
- No hay garantía de mantenimiento o actualización del artefacto por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nealfennimore/Llama-3.2-3B-Instruct-CMMC-ONNX
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio cmmc-app: https://github.com/nealfennimore/cmmc
- NIST SP 800-171 Rev. 2: https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final
- NIST SP 800-171 Rev. 3: https://csrc.nist.gov/pubs/sp/800/171/r3/final
- NIST SP 800-171A: https://csrc.nist.gov/pubs/sp/800/171/a/final
- CMMC Assessment Guide Level 2: https://cyberab.org/Catalog
