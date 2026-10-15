# Jackrong/Qwopus3-5-9B-Coder-Flash-GGUF

## Resumen

Qwopus3.5-9B-Coder-Flash es un ajuste fino (fine-tune) orientado a código y agentes sobre Qwen3.5-9B, desarrollado por el usuario Jackrong a partir de la distribución de Unsloth del modelo base. El repositorio publica el checkpoint denso fusionado (merged dense checkpoint) tras aplicar LoRA, conservando la plantilla de chat original y los pesos de predicción multi-token (MTP). El modelo base es `unsloth/Qwen3.5-9B` y el pipeline declarado es image-text-to-text, por lo que mantiene capacidades multimodales de entrada imagen-texto.

La propuesta del autor es la "filosofía Flash": reducir el razonamiento improductivo para que cada token genere trabajo útil, algo especialmente relevante en bucles de agente (leer, razonar, llamar herramientas, editar, probar), donde el coste de pensamiento por turno se acumula. Según los datos de la model card, Coder Flash reduce la longitud media de razonamiento de 4.189,07 a 885,31 tokens (un 78,87% menos) manteniendo o mejorando la calidad de código medida en HumanEval+.

El modelo tiene 9.197.093.888 parámetros totales (arquitectura densa, sin MoE), se distribuye principalmente en formato GGUF para inferencia local y cuenta con 3.195 descargas y 15 me gusta en el momento de la consulta. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en herramientas locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de Qwen3.5-9B); pipeline image-text-to-text (multimodal, vision) |
| Parametros totales | 9.197.093.888 (9,2 B aproximadamente) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (se cita Q8_0 en la evaluacion); safetensors tambien presente segun los tags. No se detalla el listado completo de cuantizaciones |
| Idiomas soportados | en, zh, ko, ja, ru, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors |
| Tamano del repositorio | 54,7 GB |
| Modelo base | unsloth/Qwen3.5-9B (relacion: finetune) |
| Fecha de creacion / actualizacion | 2026-10-02 / 2026-10-13 |
| Descargas / me gusta | 3.195 / 15 |

## Arquitectura y entrenamiento

Se trata de un ajuste fino de tipo LoRA fusionado (merged-lora) sobre Qwen3.5-9B, un transformer denso de unos 9,2 mil millones de parámetros. El autor conserva los pesos de predicción multi-token (MTP), lo que habilita decodificación especulativa con longitud de borrador configurable (en la evaluación se empleó MTP con longitud máxima de borrador 2). El repositorio corresponde al checkpoint denso fusionado, y el pipeline declarado es image-text-to-text, lo que implica que el modelo conserva entrada multimodal de imagen y texto.

Los detalles sobre el número de tokens de entrenamiento, la composición del dataset, y si se emplearon técnicas de alineación como RLHF o DPO no están disponibles en la información proporcionada. La model card describe la preparación como colaboración con la comunidad (mención a Kyle Hessling) y destaca el uso del framework Unsloth para el ajuste eficiente. La innovación técnica principal declarada no es arquitectónica, sino de comportamiento: reducir la longitud y la varianza del razonamiento manteniendo la corrección, con el objetivo de acelerar bucles de agente en hardware local.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento ("thinking") optimizado para brevedad.
- Generación de código, con foco en tareas tipo HumanEval y depuración.
- Soporte de tool calling / function calling (etiquetas `tool-use` y `agent`).
- Soporte de agentes y razonamiento multi-paso (bucle leer, razonar, llamar herramientas, editar, probar).
- Capacidad multimodal de entrada imagen-texto (etiquetas `vision` y `multimodal`; pipeline `image-text-to-text`).
- Predicción multi-token (MTP) para decodificación especulativa.
- Soporte multilingüe declarado en inglés, chino, coreano, japonés, ruso y español.
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional.

## Casos de uso

- Generación de código en local: el modelo está pensado para ejecutarse en hardware de consumo mediante GGUF y llama.cpp, de modo que un desarrollador puede generar y probar código sin depender de servicios en la nube.
- Agentes de programación autónomos: su razonamiento reducido acorta cada turno del bucle del agente, lo que abarata tareas de edición y prueba iterativa sobre repositorios.
- Integración en pipelines de CI/CD: gracias al soporte de tool calling, puede invocarse como paso de generación o revisión de parches dentro de flujos automatizados.
- Depuración y refactorización asistida: con contexto suficiente puede analizar funciones, proponer correcciones y explicar errores, reduciendo tokens de razonamiento respecto al modelo base.
- Prototipado desde capturas de interfaz: al ser image-text-to-text, permite convertir bocetos o capturas de UI en código de partida.
- Asistentes de soporte técnico multilingüe: cubre inglés, chino, coreano, japonés, ruso y español en una misma ventana de conversación.
- Automatización de tareas locales en estaciones de trabajo: evaluado con BenchLocal en Apple Silicon con LM Studio, encaja en escenarios de agente de escritorio.
- Formación y ayuda al estudio de programación: puede generar ejemplos, explicar fragmentos y proponer ejercicios en varios idiomas, con respuestas más concisas que el modelo base.

## Benchmarks y rendimiento

Los datos provienen de la model card. La configuración de evaluación fue HumanEval+ v0.1.10, con 164 tareas, 5 muestras por tarea y 820 generaciones por modelo, temperatura 0,2, top-p 0,95, GGUF Q8_0, llama.cpp con CUDA y decodificación especulativa MTP con longitud máxima de borrador 2. No se publican valores absolutos de Pass@1 ni de Pass@5, solo diferencias relativas frente al modelo base.

| Metrica | Qwen3.5-9B (base) | Qwopus3.5-9B-Coder-Flash | Variacion |
|---|---|---|---|
| Muestras correctas en HumanEval+ (sobre 820) | Referencia | +63 muestras correctas | +9,56% relativo |
| Pass@1 en HumanEval+ | Referencia | Ganancia de 7,68 puntos porcentuales | — |
| Tokens de razonamiento (media) | 4.189,07 | 885,31 | -78,87% (aprox. 3.304 tokens menos por intento) |
| Muestras correctas por 1.000 tokens de razonamiento | 0,192 | 0,995 | 5,18x |
| Longitud mediana de cadena de pensamiento (tokens) | 727,5 | 398 | Reduccion |
| Percentil 95 de cadena de pensamiento (tokens) | 15.360 | 2.586 | Reduccion |
| Varianza de la longitud de razonamiento | Referencia | — | -85,76% global; -85,22% en intentos repetidos de la misma tarea |

En la evaluación de agente BenchLocal (Mac Apple Silicon, LM Studio), Coder Flash obtuvo puntuaciones globales superiores en ambas suites, aunque los valores numéricos concretos no se detallan. La verificación basada en Docker no estaba disponible durante esas ejecuciones. No hay datos de benchmarks de visión, contexto largo ni seguridad de agente.

## Requisitos de hardware

- VRAM estimada (calculada a partir de los 9,2 B de parámetros; no confirmada por el autor): en fp16/bf16 en torno a 18,4 GB; en GGUF Q8_0 en torno a 10 GB; en Q5/Q4 en torno a 6,5-5,5 GB.
- GPU recomendadas (estimacion): A100 o H100 para fp16/bf16 con contexto amplio; RTX 4090 (24 GB) para fp16/bf16 con margen; RTX 3090 (24 GB) similar; GPU de 12-16 GB para cuantizaciones Q5/Q4.
- Cabe en GPU de consumo: sí, con cuantización (por ejemplo Q4/Q5 en tarjetas de 8-12 GB como RTX 3060 12 GB o superiores). No se confirma el rendimiento exacto.
- Opciones de despliegue mencionadas en la información: llama.cpp (CUDA y Apple Silicon), LM Studio, MLX y transformers. El tag `endpoints_compatible` sugiere compatibilidad con endpoints alojados. No se mencionan explícitamente vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP está destinada a reducir el coste de generación, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento (media, HumanEval+) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwopus3.5-9B-Coder-Flash | 9,2 B (denso) | No disponible | 885,31 tokens | Apache 2.0 | GGUF y safetensors |
| Qwen3.5-9B (base) | 9,2 B (denso) | No disponible | 4.189,07 tokens | No disponible en la informacion | Modelo base, safetensors |
| Otras alternativas de codigo de ~9 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de terceros (por ejemplo Qwen2.5-Coder o similares) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con otras alternativas.

## Limitaciones y advertencias

- Los resultados declarados cubren tareas, prompts, parámetros de muestreo y runtimes concretos; no garantizan exactitud universal de código, calidad de visión, fiabilidad en contexto largo ni seguridad de agente.
- La longitud de razonamiento mide comportamiento de generación, no la probabilidad de una respuesta correcta; las tareas difíciles pueden seguir produciendo errores, razonamiento ineficiente o interacciones fallidas con herramientas.
- Riesgo de alucinación y de código incorrecto: el autor recomienda revisar el código generado y ejecutar pruebas propias antes de confiar en él.
- La cuantización Q8_0 fue la empleada en la evaluación; otras cuantizaciones pueden degradar ligeramente la calidad.
- No se detalla la longitud de contexto soportada, lo que limita la planificación de despliegues con documentos largos.
- La information no especifica sesgos conocidos ni datos demográficos del entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base (Qwen3.5-9B) y de los datos de ajuste antes de producción.
- El repositorio es una publicación de la comunidad; no hay garantía de soporte ni de mantenimiento continuado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-9B
- Distribución de Unsloth del modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Modelo relacionado del autor (Qwopus3.8-27B-Flash-V2): https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2
- Unsloth (framework de ajuste): https://unsloth.ai/
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- BenchLocal: https://github.com/stevibe/BenchLocal
- EvalPlus: https://github.com/evalplus/evalplus
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- MLX: https://github.com/ml-explore/mlx
- Perfil de colaborador (Kyle Hessling): https://x.com/KyleHessling1
