# eumel8/ornith-k8s

## Resumen

eumel8/ornith-k8s es un modelo de lenguaje especializado en operaciones de Kubernetes y tareas de DevOps, construido sobre la base de DeepReinforce Ornith-1.0-9B. Se trata de un ajuste fino (fine-tuning) orientado a actuar como un agente autónomo en terminal, capaz de ejecutar comandos, usar herramientas y razonar sobre el resultado de las mismas. El modelo está diseñado para integrarse con interfaces compatibles con la API de Anthropic, como Claude Code, Codex u opencode, permitiendo un flujo de trabajo completamente local y sin costes de API en la nube.

Con 9 mil millones de parámetros y una ventana de contexto configurada de 64K tokens (aunque el modelo base soporta hasta 262K), ornith-k8s ofrece un equilibrio entre capacidad y requisitos de hardware. Su licencia MIT permite uso comercial sin restricciones, y su formato GGUF (Q4_K_M) facilita su despliegue en entornos con recursos limitados, como estaciones de trabajo con Apple Silicon o GPUs de consumo. La relevancia actual radica en la creciente demanda de agentes de codificación y operaciones que funcionen de forma privada y offline, sin depender de servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Ornith-1.0-9B) |
| Parametros totales | 9 mil millones (9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 64K tokens (configurado); nativo 262K (262,144) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (principal) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Ornith-1.0-9B, un modelo de 9B parametros desarrollado por DeepReinforce AI. Ornith-1.0 es una familia de modelos de codificacion agente que incluye variantes MoE de 35B y 397B, pero esta version concreta es la densa de 9B. El ajuste fino se realizo a partir de un duplicado de rafw007/ornith-1.0-9b-claude-coder, adaptandolo especificamente para operaciones de DevOps y Kubernetes. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de ajuste (si se uso RLHF, DPO u otra tecnica). La model card indica que el modelo incorpora un system prompt disenado para actuar en terminal: usar herramientas en lugar de adivinar, escribir archivos en lugar de pegar codigo, basar cada respuesta en la salida real de las herramientas y mantener respuestas concisas. Ademas, se suprime el modo de pensamiento (think:false) y se recomienda una temperatura de 0.2, top_p 0.9, top_k 20 y repeat_penalty 1.05.

## Capacidades

- Agente de codificacion y edicion de archivos con soporte nativo de function calling y tool use.
- Ejecucion de comandos de terminal (bash, kubectl, scripts) y analisis de su salida.
- Integracion con Claude Code, Codex y opencode mediante API compatible con Anthropic.
- Operaciones de Kubernetes: gestion de nodos, pods, servicios, configuracion de contexto, etc.
- Razonamiento multi-paso para tareas de diagnostico y resolucion de problemas en entornos de produccion.
- Multilingue limitado: aunque el modelo esta entrenado principalmente en ingles, la model card indica que "matches the user's language" (se adapta al idioma del usuario), aunque no se garantiza un rendimiento solido en otros idiomas.
- Modo de actuacion directa: no monologa, ejecuta acciones sin preguntar cuando la tarea es clara.

## Casos de uso

- Automatizacion de operaciones de Kubernetes: el modelo puede ejecutar comandos kubectl para inspeccionar el estado del cluster, diagnosticar problemas y aplicar cambios de configuracion, todo desde una interfaz de chat local.
- Asistente de DevOps en terminal: integrado con Claude Code u opencode, permite gestionar pipelines de CI/CD, revisar logs, monitorizar recursos y ejecutar scripts de mantenimiento sin salir del entorno de desarrollo.
- Agente de codificacion privado: al funcionar completamente en local, es adecuado para empresas con politicas estrictas de privacidad que no pueden enviar codigo a servicios en la nube.
- Soporte tecnico de infraestructura: el modelo puede guiar a ingenieros junior en la resolucion de incidencias comunes, ejecutando comandos de diagnostico y proponiendo soluciones basadas en la salida real.
- Generacion y edicion de archivos de configuracion (YAML, JSON, scripts) para despliegues de Kubernetes, con validacion mediante tool use.
- Entrenamiento y simulacion de escenarios: puede utilizarse en entornos de pruebas para practicar operaciones de cluster, ya que responde a comandos reales y no inventa resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el ajuste ornith-k8s. La model card menciona que el modelo base Ornith-1.0-9B obtiene un 69.4% en SWE-Bench Verified, superando a modelos de mayor tamano como Gemma 4-31B y Qwen 3.6-35B en tareas de codificacion. Sin embargo, este dato corresponde al modelo base y no necesariamente al ajuste fino para Kubernetes. No se dispone de mediciones de latencia o throughput para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M pesa aproximadamente 5.6 GB, por lo que se necesita al menos 6-8 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: puede ejecutarse en GPUs de consumo como RTX 3060 (12GB), RTX 4070, RTX 4090, o en Apple Silicon con 32GB o mas de RAM unificada (segun la model card, probado en Mac Mini).
- En Apple Silicon, se recomienda al menos 32GB de RAM para manejar el contexto de 64K sin degradacion.
- Opciones de despliegue: compatible con Ollama, llama.cpp, vLLM y TGI (aunque no se menciona explicitamente, el formato GGUF es compatible con estos motores).
- Latencia: no disponible; depende del hardware y del contexto utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | SWE-Bench Verified | Enfoque |
|---|---|---|---|---|---|
| eumel8/ornith-k8s | 9B | 64K (configurado) | MIT | No disponible (base: 69.4%) | DevOps/Kubernetes |
| DeepReinforce Ornith-1.0-9B | 9B | 262K | MIT | 69.4% | Agente de codificacion general |
| Gemma 4-31B | 31B | 128K (estimado) | Gemma license | Inferior a 69.4% (segun model card) | Codificacion general |
| Qwen 3.6-35B | 35B | 256K (estimado) | Apache 2.0 | Inferior a 69.4% (segun model card) | Codificacion y razonamiento |

Nota: los datos de Gemma y Qwen se basan en la afirmacion de la model card de que Ornith-1.0-9B los supera en SWE-Bench, pero no se proporcionan cifras exactas. La comparativa es cualitativa y no exhaustiva.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente en ingles; su rendimiento en otros idiomas puede ser inconsistente, aunque la model card sugiere que se adapta al idioma del usuario.
- Al ser un modelo de 9B, puede presentar alucinaciones en tareas complejas o cuando la salida de las herramientas no es clara; se recomienda verificar siempre los resultados criticos.
- La ventana de contexto configurada es de 64K, pero el contexto nativo es de 262K; si se aumenta el contexto, el consumo de memoria crece significativamente y puede requerir hardware mas potente.
- No se han publicado evaluaciones de sesgos o comportamientos adversos; como cualquier modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base (Ornith-1.0) tambien es MIT, por lo que no hay restricciones adicionales.
- Para uso en produccion, se recomienda implementar validaciones externas de las acciones del agente, especialmente cuando ejecuta comandos destructivos en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eumel8/ornith-k8s
- Modelo base: https://huggingface.co/deepreinforce-ai/Ornith-1.0-9B
- Web oficial de Ornith: https://ornith.ai/
- Guia de Ornith 1.0: https://ornith.site/
- Blog de Ornith 1.0: https://ornith.ai/ornith_1_0.html
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
