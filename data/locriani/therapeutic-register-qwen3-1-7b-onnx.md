# locriani/therapeutic-register-qwen3-1.7b-onnx

## Resumen

El modelo `locriani/therapeutic-register-qwen3-1.7b-onnx` es una exportación a formato ONNX del modelo base `locriani/therapeutic-register-qwen3-1.7b`, un ajuste fino de Qwen3 de 1.700 millones de parámetros orientado a la generación de texto conversacional con un registro "terapéutico". Lo publica el usuario locriani como artefacto de investigación (tag `research-artifact`), con datos de entrenamiento sintéticos (tag `synthetic-data`) y licencia Apache 2.0. Su interés principal radica en que está empaquetado específicamente para `transformers.js` y ejecución en WebGPU, lo que permite desplegarlo directamente en el navegador sin infraestructura de servidor.

La arquitectura subyacente es la de Qwen3, un transformer decoder-only de la familia Qwen, del que este modelo hereda la estructura pero no los pesos originales: se trata de un fine-tune derivado. El repositorio ocupa 1,3 GB, coherente con un modelo de 1.7B parámetros cuantizado para ONNX. El acceso está restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargarlo, lo que limita su uso directo en pipelines automatizados sin gestión previa de credenciales.

Es relevante ahora por dos motivos: primero, porque ejemplifica la tendencia de publicar fine-tunes pequeños y especializados en lugar de modelos generalistas masivos; segundo, porque su formato ONNX + transformers.js abre la puerta a aplicaciones de bienestar emocional o acompañamiento conversacional que corren íntegramente en el cliente, sin enviar datos sensibles a un servidor. Con cero descargas y cero likes en el momento de la consulta, es un artefacto muy reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), exportado a ONNX |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportación ONNX; el repo pesa 1,3 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (para transformers.js) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3 de 1.7B parámetros, un transformer decoder-only con atención causal estándar. La información proporcionada no detalla la composición del dataset de ajuste fino, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO. Los tags indican que el entrenamiento se realizó sobre datos sintéticos (`synthetic-data`), lo que sugiere que las conversaciones de registro terapéutico fueron generadas artificialmente en lugar de recopiladas de interacciones reales. No se especifican hiperparámetros, régimen de entrenamiento ni detalles del tokenizador más allá de la herencia de Qwen3.

La innovación técnica destacable no está en el entrenamiento sino en el empaquetado: la exportación a ONNX está optimizada para `transformers.js` con soporte de WebGPU, lo que permite la inferencia en el navegador. No se han publicado detalles sobre técnicas de decodificación especulativa, atención lineal ni otras optimizaciones de inferencia en la información disponible.

## Capacidades

- Generación de texto conversacional en un registro orientado a acompañamiento terapéutico.
- Conversación multi-turno (capacidad heredada de la arquitectura Qwen3).
- Ejecución en navegador mediante transformers.js y WebGPU.
- Inferencia local sin servidor, con los datos permaneciendo en el cliente.
- No se ha confirmado soporte de tool calling ni function calling.
- No se ha confirmado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Acompañamiento conversacional en navegador: el modelo puede integrarse en una aplicación web que ofrezca un espacio de escucha y diálogo reflexivo, ejecutándose íntegramente en el cliente gracias a la exportación ONNX y WebGPU, de modo que las conversaciones sensibles nunca salen del dispositivo del usuario.
- Diario guiado con reflexión: una aplicación de journaling podría usar el modelo para formular preguntas de seguimiento sobre las entradas del usuario, aprovechando el registro terapéutico del fine-tune para mantener un tono empático y no directivo.
- Prototipado de investigación en psicología computacional: el tag `research-artifact` y el uso de datos sintéticos lo hacen adecuado para experimentos controlados sobre generación de lenguaje empático, sin los problemas éticos de usar conversaciones reales de pacientes.
- Demostraciones educativas de IA en el navegador: sirve para mostrar a estudiantes cómo un modelo de 1.7B puede ejecutarse en WebGPU sin backend, con un caso de uso concreto y socialmente relevante.
- Evaluación de fine-tunes pequeños especializados: investigadores que comparen la calidad de modelos de 1.7B ajustados a dominios concretos pueden usar este artefacto como punto de referencia frente a Qwen3 base.
- Aplicaciones offline de bienestar: al no requerir conexión tras la descarga inicial de los pesos ONNX, puede desplegarse en entornos con conectividad limitada o con requisitos de privacidad estrictos.
- Chatbot de primera acogida en salud mental (con supervisión humana): podría gestionar la fase inicial de una conversación para recoger información y derivar a un profesional, siempre que se valide su seguridad antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ONNX ocupa 1,3 GB, lo que sugiere que la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con soporte WebGPU (integradas modernas, Apple Silicon, GPUs de escritorio recientes) debería poder ejecutarlo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM o en WebGPU del navegador.
- Opciones de despliegue: transformers.js (principal, con WebGPU); ONNX Runtime para entornos nativos; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| locriani/therapeutic-register-qwen3-1.7b-onnx | 1.7B | no disponible | Apache 2.0 | Gated en HF, formato ONNX | Fine-tune sintético, orientado a navegador |
| Qwen3-1.7B (base) | 1.7B | no disponible en esta ficha | Apache 2.0 | Público en HF | Modelo generalista del que deriva |
| Fine-tunes terapéuticos de 1-3B (familia general) | 1-3B | variable | variable | variable | No se dispone de comparación directa verificable |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado con datos sintéticos: el registro terapéutico puede sonar artificial o genérico, y no está validado clínicamente.
- Riesgo de alucinación inherente a un modelo de 1.7B; no debe usarse como sustituto de atención psicológica profesional.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que complica la automatización y la redistribución.
- Idiomas soportados no especificados; no se garantiza un rendimiento adecuado en castellano.
- Cero descargas y cero likes: sin validación comunitaria ni evidencia de calidad reportada.
- Longitud de contexto no documentada; no se puede planificar su uso en conversaciones largas sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el carácter de artefacto de investigación y el gating añaden cautelas para producción.
- Cualquier aplicación en salud mental debe incorporar supervisión humana, avisos claros y mecanismos de derivación a profesionales.

## Enlaces

- HuggingFace: https://huggingface.co/locriani/therapeutic-register-qwen3-1.7b-onnx
- Modelo base: https://huggingface.co/locriani/therapeutic-register-qwen3-1.7b
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
