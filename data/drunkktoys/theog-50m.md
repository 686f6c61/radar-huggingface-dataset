# DrunkkToys/theOG-50M

## Resumen

theOG-50M v3 es un modelo de lenguaje de 50,148,352 parámetros entrenado desde cero para generación de código Python a partir de instrucciones en inglés. Lo desarrolla DrunkkToys, un desarrollador autodidacta, y se distribuye bajo licencia Apache 2.0. Su propuesta principal es la eficiencia extrema: el autor afirma haberlo entrenado íntegramente en un único MacBook Air con chip Apple M5 y 32 GB de memoria unificada, sin GPU dedicada, durante aproximadamente 131 horas y 346.000 pasos sobre un corpus de 2,49B tokens de fuentes públicas de Hugging Face.

El modelo sigue la arquitectura Qwen3 (etiqueta `qwen3-arch` en el repositorio) y se publica principalmente en formato GGUF, lo que permite ejecutarlo en CPU con llama.cpp, Ollama o LM Studio. El peso descargable es de aproximadamente 54 MB, un tamaño que lo sitúa en la categoría de small language models orientados a despliegue local y offline.

Su relevancia es doble: por un lado, demuestra que es posible entrenar un modelo funcional de generación de código con recursos de consumo; por otro, la model card incluye un relato extenso y muy detallado del autor sobre supuestos fallos y sabotajes atribuidos a su asistente de programación (Claude Code), así como comparaciones con CodeGen-350M-mono. Esa documentación debe tratarse como afirmaciones del autor, no como resultados verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 (`qwen3-arch`) |
| Parametros totales | 50.148.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles); pesos safetensors en el repositorio |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 50M parámetros que adopta la arquitectura Qwen3, según la etiqueta del repositorio. No se dispone de detalles publicados sobre número de capas, dimensión oculta, número de cabezas de atención ni tamaño de vocabulario. Tampoco se especifica la longitud de contexto soportada, un dato relevante para evaluar su uso en tareas multi-turno.

El entrenamiento se realizó desde cero (no es un fine-tuning) sobre un dataset de 2,49B tokens compuesto por fuentes públicas de Hugging Face. El autor indica 346.000 pasos en total: unos 330.000 en una primera fase de aproximadamente 131 horas y menos de 20 horas adicionales para los últimos 16.000 pasos, todo sobre PyTorch con backend Metal en un MacBook Air M5 de 32 GB. La model card menciona experimentos con datos de "think" (razonamiento) que, según el autor, provocaron colapsos en el modo `/think` y fueron finalmente retirados del entrenamiento el 2026-10-14. No se documentan fases de RLHF, DPO ni preferencias humanas.

## Capacidades

- Generación de código Python a partir de descripciones en lenguaje natural en inglés.
- Generación de texto conversacional básico, según la etiqueta `conversational`.
- Ejecución local offline en CPU mediante llama.cpp, Ollama y LM Studio.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración tras una API compatible con el formato estándar.
- No hay evidencia publicada de soporte de tool calling ni de function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso.
- Multilingüismo: únicamente inglés declarado; el castellano no está soportado de forma oficial.
- Modo "think": existió en versiones previas según la model card, pero fue retirado del entrenamiento; no debe asumirse su disponibilidad en v3.

## Casos de uso

- Autocompletado de funciones Python en el editor: el modelo puede generar el cuerpo de una función a partir de su docstring o de una petición breve en inglés, con una latencia muy baja al ejecutarse en CPU y un peso de 54 MB.
- Asistente de código offline en portátiles sin GPU: al caber en cualquier equipo con unos cientos de MB de RAM libre, permite trabajar en entornos sin conexión o con requisitos de privacidad estrictos, sin enviar código a servicios externos.
- Generación de snippets para prototipado rápido: útil para producir utilidades pequeñas (parseo de ficheros, transformaciones de datos, scripts de automatización) que el desarrollador revisa y adapta después.
- Educación y aprendizaje de Python: sirve como ejemplo didáctico de generación de código y como banco de pruebas para estudiar el comportamiento de modelos pequeños en tareas de programación.
- Filtrado o clasificación previa en pipelines de CI: puede generar o completar fragmentos candidatos que luego se validan con tests automáticos, reduciendo el coste frente a modelos grandes en tareas triviales.
- Investigación sobre entrenamiento de bajo coste: el modelo y su historial de entrenamiento documentado permiten reproducir experimentos de scaling down y comparar curvas de aprendizaje con recursos mínimos.
- Demo integrada en aplicaciones de escritorio: al distribuirse en GGUF y funcionar con Ollama o LM Studio, se puede empaquetar como funcionalidad de generación de código dentro de una herramienta local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables en la información disponible. La model card incluye comparaciones con CodeGen-350M-mono en términos de tokens de entrenamiento, hardware y coste estimado, pero no presenta tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes con valores numéricos contrastados. Cualquier cifra de rendimiento funcional debe obtenerse mediante evaluación propia.

## Requisitos de hardware

- VRAM/RAM para inferencia: al tratarse de un modelo de 50M parámetros, los pesos en FP16 ocupan aproximadamente 100 MB; en cuantizaciones GGUF de 4 bits, alrededor de 30-35 MB. El autor indica una descarga de 54 MB, coherente con una cuantización de ese orden.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU en cualquier equipo moderno; una GPU consumer (por ejemplo, RTX 3060 o superior) solo aportaría mejoras marginales de latencia.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una GPU integrada, y también en Raspberry Pi y dispositivos similares siempre que se use llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con la API de endpoints; el repositorio incluye pesos safetensors para inferencia con PyTorch/Transformers.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, se espera una generación en CPU del orden de decenas de tokens por segundo en hardware de escritorio, aunque esta estimación no está confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theOG-50M v3 | 50,1M | no disponible | 2,49B | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| CodeGen-350M-mono | 350M | 2.048 tokens (según paper de CodeGen) | ~325B (según la model card) | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-0.5B | ~494M | 32.768 tokens (versión base) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| SmolLM2-135M | 135M | 8.192 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación con CodeGen-350M-mono es la que aporta el propio autor: el modelo de Salesforce tiene 7 veces más parámetros y se entrenó con aproximadamente 219 veces más tokens, aunque sobre hardware TPU-v4. Frente a modelos como Qwen2.5-Coder-0.5B o SmolLM2-135M, theOG-50M es entre 2,7 y 10 veces más pequeño, lo que se traduce en menor calidad esperada en tareas complejas pero en un coste de despliegue prácticamente nulo.

## Limitaciones y advertencias

- Modelo de 50M parámetros: la calidad en código complejo, razonamiento y coherencia multi-turno será limitada en comparación con modelos de cientos de millones o miles de millones de parámetros.
- Solo inglés: las instrucciones en castellano no están soportadas oficialmente y probablemente produzcan resultados degradados.
- Riesgo elevado de alucinación y de generar código sintácticamente plausible pero incorrecto; requiere revisión humana y tests automatizados antes de usarse en producción.
- Longitud de contexto no documentada: no se recomienda para tareas que requieran ventanas largas hasta verificar el valor real.
- La model card contiene afirmaciones no verificadas de forma independiente (comparaciones de coste, sabotaje del asistente, cifras de entrenamiento); deben tomarse como declaraciones del autor.
- El modo "think" fue retirado del entrenamiento según la propia documentación; no debe asumirse que funcione.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el origen y la calidad del corpus de entrenamiento; conviene auditar posibles problemas de licencias en los datos públicos utilizados.
- El repositorio ocupa 1,9 GB, muy superior al tamaño del peso descargable, debido a artefactos de entrenamiento y versiones; conviene descargar solo los ficheros GGUF necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DrunkkToys/theOG-50M
- Paper de CodeGen (referenciado en la model card): https://arxiv.org/abs/2203.13474
- Paper de referencia adicional citado en las etiquetas: https://arxiv.org/abs/2310.02226
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
