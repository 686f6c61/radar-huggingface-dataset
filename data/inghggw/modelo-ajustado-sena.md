# inghggw/modelo-ajustado-sena

## Resumen

El modelo ajustado SENA es un fine-tuning de Qwen/Qwen2.5-0.5B-Instruct mediante LoRA, publicado por Henry Giovanny González Waltero, instructor del SENA (Centro de Comercio y Servicios, Regional Tolima). No es un modelo de producción: se trata de un ejemplo didáctico resuelto de la semana 6 del curso "Iniciación a la Inteligencia Artificial" para el programa ADSO (2026), cuyo objetivo es mostrar a los aprendices qué se gana y qué se pierde al hacer fine-tuning con muy pocos datos.

El modelo fue ajustado para responder preguntas cortas sobre la API de tareas del curso (construida con FastAPI), usando solo 40 pares de pregunta y respuesta. El ajuste LoRA se fusionó con el modelo base antes de publicarlo, de modo que el repositorio contiene el modelo completo en safetensors (494 millones de parámetros, 2,0 GB). Su valor principal es pedagógico: ilustra el sobreajuste característico de los entrenamientos con datasets mínimos, ya que responde correctamente lo visto en entrenamiento y alucina con aparente seguridad lo que no lo estaba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5), ajustado con LoRA fusionado |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base Qwen2.5-0.5B-Instruct, no indicada en la model card) |
| Tipos de cuantizacion | no disponible (entrenado en float32; sin variantes cuantizadas publicadas) |
| Idiomas soportados | Español (etiquetado como es; el modelo base soporta más idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder de 494 millones de parámetros orientado a instrucciones. Sobre él se aplicó un ajuste eficiente (SFT) con LoRA usando r=16, alpha=32 y aplicación a todas las capas lineales, durante 5 épocas con tasa de aprendizaje 2e-4 y precisión float32. Posteriormente, los adaptadores LoRA se fusionaron con el modelo base, por lo que los pesos publicados son el modelo completo y no requieren cargar adaptadores adicionales.

El dataset de entrenamiento es deliberadamente minúsculo: 40 pares de pregunta y respuesta, de los cuales 5 tratan sobre la API de tareas del curso (crear tareas, listarlas, error 404, documentación y qué es ADSO) y 35 son ejemplos de relleno con la misma estructura, sin datos personales. El entrenamiento se ejecutó en una GPU T4 gratuita de Google Colab en menos de un minuto, con una pérdida que bajó de 2,29 a 0,05 en la ejecución de prueba registrada, un descenso que evidencia el sobreajuste al conjunto de entrenamiento.

## Capacidades

- Generacion de texto conversacional en español, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Respuesta a preguntas cortas sobre la API de tareas del curso, exclusivamente para los patrones vistos en los 40 ejemplos de entrenamiento (por ejemplo, cómo listar tareas mediante un GET a /tareas).
- No soporta tool calling ni function calling de forma fiable: no hay evidencia de estas capacidades en la model card y el tamaño del modelo lo hace poco apto para ello.
- No está diseñado para razonamiento multi-paso, agentes, ni modalidades de visión o audio.
- Su capacidad multilingüe real tras el ajuste no está evaluada; el etiquetado oficial es solo español.

## Casos de uso

- Material didáctico para cursos de IA: sirve como ejemplo resuelto y reproducible de fine-tuning con LoRA en Colab, mostrando el flujo completo (dataset, entrenamiento, fusión de adaptadores y publicación en Hugging Face).
- Demostración de sobreajuste: es un caso de estudio ideal para explicar en clase por qué un modelo con pérdida de 0,05 tras 5 épocas sobre 40 ejemplos memoriza en lugar de generalizar.
- Punto de partida para ejercicios de los aprendices: el autor indica explícitamente que cada aprendiz debe escribir sus propios 40 ejemplos reales sobre su tema y repetir el proceso.
- Comparación fine-tuning frente a RAG: la model card lo propone como contraste con la semana 4 del curso, para mostrar que para responder con información confiable sobre documentos es preferible RAG.
- Prototipado rápido de asistentes verticales en entornos educativos: permite ilustrar cómo especializar un modelo pequeño en un dominio cerrado (una API concreta) sin coste de GPU.
- Base para evaluar cuantización y despliegue en hardware modesto: con 494 millones de parámetros, es manejable para practicar inferencia local en portátiles y máquinas sin GPU dedicada.

No es adecuado para uso en producción como asistente real, según advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de entrenamiento, que bajó de 2,29 a 0,05 en 5 épocas. La model card documenta cualitativamente que el modelo responde correctamente a las preguntas presentes en el dataset (por ejemplo, "¿Cómo listo las tareas?" → "Haz un GET a /tareas.") y que alucina en preguntas no vistas (afirmó que la API usa Flask cuando usa FastAPI, y que una tarea se elimina con un POST).

## Requisitos de hardware

- VRAM estimada para inferencia: con 494 millones de parámetros en float32 (2,0 GB de pesos), alrededor de 2-3 GB; en float16, aproximadamente 1 GB más overhead, por lo que es viable en cualquier GPU moderna o incluso en CPU.
- GPU recomendadas: ninguna GPU dedicada es necesaria para inferencia; para entrenamiento, el autor usó una T4 gratuita de Google Colab (el entrenamiento completo toma menos de un minuto).
- Cabe con holgura en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090) y también en CPU para inferencia.
- Opciones de despliegue: al estar en safetensors con arquitectura Qwen2, es compatible con transformers, vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión o vía repositorios de terceros).
- Latencia y throughput estimados: no disponible; por su tamaño, se espera latencia baja incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Licencia | Proposito |
|---|---|---|---|---|
| inghggw/modelo-ajustado-sena | 494M (LoRA fusionado) | Qwen2.5-0.5B-Instruct | Apache 2.0 | Ejemplo didactico de fine-tuning (SENA) |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | — | Apache 2.0 | Asistente generalista multilingue |
| Qwen/Qwen2.5-1.5B-Instruct | 1.540M | — | Apache 2.0 (con restrictions para algunas empresas) | Asistente generalista, mayor capacidad |

Frente a su modelo base, esta ficha no aporta ventajas de capacidad general: el ajuste solo mejora el comportamiento sobre los 40 ejemplos de entrenamiento y degrada la fiabilidad fuera de ese dominio. Frente a Qwen2.5-1.5B-Instruct, ofrece un modelo mucho menos capaz como asistente, pero con un coste de entrenamiento y despliegue trivial, lo que es precisamente su valor educativo.

## Limitaciones y advertencias

- Alucinacion severa y documentada: el modelo inventa respuestas con seguridad fuera del dataset de entrenamiento (confundió FastAPI con Flask y describió mal un endpoint). El propio autor lo advierte.
- Sobreajuste extremo: la pérdida de 0,05 sobre 40 ejemplos indica memorización, no aprendizaje generalizable.
- No usar como asistente real: advertencia explícita de la model card. Para respuestas fiables sobre documentos, el autor recomienda RAG.
- Cobertura de dominio minúscula: solo conoce 5 temas reales sobre la API del curso más 35 patrones de relleno.
- Sesgos: no evaluados; hereda los sesgos del modelo base Qwen2.5-0.5B-Instruct sin auditoría conocida.
- Idioma: etiquetado solo para español; el comportamiento en otros idiomas tras el ajuste no está verificado.
- Licencia: Apache 2.0, sin restricciones para uso comercial, aunque el uso comercial carece de sentido dada la naturaleza del modelo.
- Contexto y cuantización: sin datos publicados; no existen variantes cuantizadas oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inghggw/modelo-ajustado-sena
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del curso (guía y notebooks): https://github.com/inghggw/iniciacion-ia-adso
