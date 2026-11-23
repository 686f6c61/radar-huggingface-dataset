# pthanh635/qwen2.5-7b-legal-vn-gguf

## Resumen

`pthanh635/qwen2.5-7b-legal-vn-gguf` es una adaptación del modelo Qwen2.5-7B, publicada por el usuario pthanh635, orientada al dominio legal en vietnamita (el sufijo `vn` apunta a Vietnam). Se distribuye exclusivamente en formato GGUF, lo que la hace directamente consumible por motores de inferencia como llama.cpp u Ollama, y se publica bajo licencia Apache 2.0.

El modelo parte de la arquitectura Qwen2.5, un transformer decoder-only denso de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), lo que lo sitúa en la franja de modelos de 7B ampliamente desplegables en hardware de consumo. El repositorio ocupa 4,7 GB, coherente con una o varias cuantizaciones GGUF de dicho tamaño.

La relevancia de esta ficha es limitada pero concreta: se trata de un ajuste de dominio (legal vietnamita) sobre una base conocida, empaquetado para inferencia local. No obstante, la model card publicada es prácticamente vacía (solo contiene la línea de licencia), no hay descargas ni interacciones registradas, y no se documentan datos de entrenamiento, idiomas ni benchmarks. Cualquier evaluación debe tratarse con cautela y verificarse empíricamente antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5), densa |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (la base Qwen2.5-7B soporta 32.768 tokens nativos, ampliables; no confirmado para este ajuste) |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas en la model card) |
| Idiomas soportados | no disponible (por el nombre del repositorio, orientado a vietnamita; sin confirmacion documental) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B: un transformer decoder-only denso con atención de múltiples cabezas, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. Al tratarse de un modelo denso de 7,6 mil millones de parámetros, no hay enrutamiento MoE ni parámetros activos parciales. El repositorio contiene únicamente pesos en formato GGUF, derivados presumiblemente de un ajuste fino sobre la base Qwen2.5-7B y posteriormente cuantizados.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens utilizados, ni la composición del dataset legal vietnamita, ni si se emplearon técnicas de alineación como SFT, RLHF o DPO. La model card no aporta detalles técnicos más allá de la licencia. Tampoco se documentan innovaciones específicas (decodificación especulativa, atención lineal, etc.) más allá de las que ya incorpora la familia Qwen2.5 en su versión original. Cualquier afirmación sobre el proceso de ajuste sería especulativa.

## Capacidades

- Generación de texto conversacional en formato multi-turno (la etiqueta `conversational` así lo indica).
- Especialización presumible en dominio legal vietnamita, derivada del nombre del repositorio; no verificada documentalmente.
- Herencia de las capacidades generales de Qwen2.5-7B (razonamiento, código, matemáticas, multilingüismo), si bien el ajuste fino puede haber alterado o degradado parte de ellas.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este ajuste concreto.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Modo thinking, visión o audio: no disponibles; se trata de un modelo de texto.

## Casos de uso

- Consulta de normativa vietnamita: el modelo puede responder preguntas sobre legislación de Vietnam si el ajuste fino se realizó sobre corpus legales, aunque la ausencia de benchmarks obliga a validación previa con un conjunto de preguntas de referencia.
- Asistencia en redacción de borradores contractuales en vietnamita: útil para generar primeras versiones de cláusulas, siempre con revisión por un profesional jurídico.
- Despliegue local en entornos con requisitos de privacidad: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo sin enviar datos a la nube, adecuado para despachos que manejen documentación sensible.
- Clasificación y resumen de documentos legales: con 7,6B parámetros y contexto potencialmente largo (heredado de Qwen2.5), puede resumir contratos o extraer obligaciones de textos extensos.
- Prototipado rápido con Ollama o llama.cpp: el formato GGUF permite levantar un servidor de inferencia en minutos para pruebas de concepto internas.
- Filtrado y pre-análisis en pipelines de revisión documental: integrable como primer paso automático antes de la revisión humana, reduciendo el volumen de texto a examinar.
- Base para ajuste adicional: al estar bajo Apache 2.0, puede servir como punto de partida para fine-tuning sobre otros dominios o jurisdicciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantización Q4_K_M, aproximadamente 4,5-5 GB; en Q8_0, en torno a 8 GB; en FP16, unos 15 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4/Q5; RTX 4090 o A100 para FP16 o contextos muy largos.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantizaciones de 4-5 bits; con 6 GB solo en cuantizaciones agresivas (Q3 o inferiores).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; vLLM y TGI no consumen GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pthanh635/qwen2.5-7b-legal-vn-gguf | 7,6B | no disponible | Apache 2.0 | GGUF | Ajuste legal vietnamita, sin benchmarks ni documentación |
| Qwen2.5-7B (base) | 7,6B | 32.768 tokens (nativo) | Apache 2.0 (salvo variantes) | safetensors, GGUF | Modelo original, con benchmarks publicados y amplia adopción |
| Llama 3.1 8B | 8B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Alternativa generalista con contexto largo y ecosistema maduro |
| Mistral 7B v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamaño similar, sin especialización legal |

## Limitaciones y advertencias

- La model card está prácticamente vacía: no hay información sobre datos de entrenamiento, evaluación ni idiomas, lo que impide verificar la calidad del ajuste legal.
- Riesgo elevado de alucinación en materia jurídica: sin benchmarks ni validación documentada, el modelo puede generar referencias normativas inexistentes o desactualizadas.
- El ajuste fino sobre un dominio estrecho puede degradar capacidades generales (código, matemáticas, multilingüismo) respecto a la base Qwen2.5-7B.
- No hay confirmación de que el modelo domine otros idiomas además del vietnamita; el uso en castellano no está garantizado.
- Ausencia total de descargas e interacciones en el repositorio: no existe evidencia comunitaria de su funcionamiento.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de documentación sobre la procedencia de los datos de ajuste introduce un riesgo de compliance que conviene evaluar.
- No apto como sustituto de asesoramiento jurídico profesional; cualquier salida debe ser revisada por un experto.
- La fecha de creación del repositorio (2026-11-23) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos o una publicación programada; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/pthanh635/qwen2.5-7b-legal-vn-gguf
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
