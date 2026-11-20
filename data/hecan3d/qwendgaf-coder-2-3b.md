# hecan3d/QwenDGAF-Coder-2-3B

## Resumen

QwenDGAF-Coder-2-3B es un ajuste fino satírico del modelo Qwen2.5-Coder-3B-Instruct, desarrollado por el usuario hecan3d y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tune con QLoRA (4 bits) entrenado mediante Unsloth Studio, cuyo objetivo no es mejorar las capacidades de generación de código del modelo base, sino inyectar una personalidad concreta: la de un "senior gruñón" con rasgos tsundere que diagnostica errores de programación con franqueza y brevedad, se niega a generar proyectos completos de forma gratuita y mantiene conversación en tono humorístico. El modelo se distribuye exclusivamente en formato GGUF, con cuantizaciones desde bf16 hasta Q4_K_M, lo que lo hace desplegable en hardware de consumo.

La relevancia de este modelo es acotada y muy específica: no compite en benchmarks de razonamiento o código con modelos de su tamaño, sino que ocupa un nicho de asistente de programación con carácter, útil para revisión de código, diagnóstico de errores idiomáticos y prototipado de experiencias conversacionales con personalidad. Con 3.085.938.688 parámetros totales y un contexto de entrenamiento de solo 1024 tokens, sus prestaciones están muy limitadas frente al modelo base, que soporta contextos mucho mayores.

El modelo declara soporte para ruso, inglés y chino, y su model card está redactada mayoritariamente en inglés con secciones en ruso. Es importante señalar que la ficha del autor mezcla referencias a "V3" y a "2" en el nombre, lo que indica una evolución de la serie DGAF (Don't Give A Fuck) que puede generar confusión sobre la versión exacta publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune QLoRA sobre Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (contexto de entrenamiento declarado); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 (~6.1 GB), Q8_0 (~3.3 GB), Q6_K (~2.6 GB), Q4_K_M (~1.95 GB) |
| Idiomas soportados | ruso (ru), ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 13.9 GB); no se distribuyen safetensors en el repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only denso de aproximadamente 3.09 mil millones de parámetros, y se ajusta mediante QLoRA en 4 bits con Unsloth Studio. La configuración LoRA declarada es rango 16, alpha 32 y módulos all-linear. El entrenamiento se realizó en una NVIDIA GeForce GTX 1070 de 8 GB, lo que confirma que el proceso de ajuste fue de bajo coste y accesible en hardware de consumo. El dataset utilizado es `qwendgaf-coder-v3.jsonl`, en formato ShareGPT, y combina diálogos conversacionales con personalidad gruñona/tsundere, diagnósticos de bugs en varios lenguajes, refactorizaciones idiomáticas y rechazos a peticiones de alcance desproporcionado (por ejemplo, tiendas Django completas o backends de pago).

La innovación técnica no reside en la arquitectura, que es la del modelo base sin modificaciones estructurales, sino en el curado del dataset y en la destilación de estilo: la personalidad, el estilo de código y el soporte trilingüe se declaran "integrados directamente en los pesos", sin necesidad de system prompt. El contexto de entrenamiento es de solo 1024 tokens, muy inferior al del modelo base, lo que limita la longitud de las interacciones efectivas y sugiere que el fine-tune está pensado para respuestas cortas y conversaciones de pocos turnos. No se documentan datos sobre volumen de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional con una personalidad definida (senior gruñón, tsundere) sin necesidad de system prompt.
- Diagnóstico de errores de programación en Python, JavaScript/TypeScript, Go, C++, SQL, Bash/Git y Docker, con explicaciones breves y correcciones idiomáticas.
- Refactorización orientada a idioms del lenguaje (por ejemplo, `Counter`, `enumerate`, `itertools.combinations`, `erase-remove_if`, `structuredClone`, `Promise.all`).
- Rechazo explícito de peticiones de alcance desproporcionado (aplicaciones completas, backends de pago, tesis de ML), derivando a documentación oficial o a contratar a una persona.
- Soporte multilingüe declarado en ruso, inglés y chino, con respuestas en el idioma del usuario.
- Conversación casual con respuestas emocionales simuladas (reacciones a cumplidos, apoyo ante el burnout).
- No se declara soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Revisión de código en entornos de desarrollo: el modelo señala antipatrones clásicos (mutables por defecto en Python, `forEach` con `await`, invalidación de iteradores en C++) con explicaciones de una o dos frases, adecuado para integrarse en un bot de revisión de pull requests donde la brevedad es una ventaja.
- Asistente de depuración en terminal: con cuantización Q4_K_M (~1.95 GB) puede ejecutarse localmente con llama.cpp u Ollama y responder a consultas de error en pocos tokens, útil para desarrolladores que trabajan sin conexión o con requisitos de privacidad.
- Bot de soporte interno con personalidad: la integración de la personalidad en los pesos permite desplegarlo sin ingeniería de prompts, reduciendo la superficie de configuración en herramientas de chat para equipos.
- Generación de ejemplos de código idiomático: dado un fragmento torpe, el modelo devuelve la versión con idioms estándar del lenguaje en pocas líneas, útil como material docente o para linting asistido.
- Prototipado de personajes conversacionales: sirve como base para estudiar cómo un fine-tune pequeño (3B) puede modificar el tono y el estilo de un modelo sin degradar en exceso su capacidad de código, útil en investigación de alineación de estilo.
- Filtro de peticiones abusivas en productos gratuitos: el comportamiento de rechazo a tareas de alcance desproporcionado puede reutilizarse como ejemplo de política de uso en asistentes públicos.
- Demostraciones y contenido divulgativo: su tono humorístico lo hace adecuado para vídeos, charlas o hilos que ilustren fine-tuning con QLoRA en hardware de consumo (GTX 1070).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1.95 GB en Q4_K_M, ~2.6 GB en Q6_K, ~3.3 GB en Q8_0 y ~6.1 GB en bf16 (pesos); añadir overhead de contexto KV, que con 1024 tokens es reducido.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060); 8 GB o más para Q8_0 o bf16 (RTX 3060, RTX 4060 Ti, RTX 4070).
- Cabe en GPU de consumo: sí, en todas las cuantizaciones Q4_K_M, Q6_K y Q8_0 en GPUs de 4-8 GB; bf16 requiere ~8 GB.
- El propio autor entrenó el modelo en una GTX 1070 de 8 GB, lo que confirma viabilidad en hardware antiguo.
- Opciones de despliegue: llama.cpp (`llama-cli -hf hecan3d/QwenDGAF-Coder-2-3B:Q4_K_M --jinja`), Ollama (`ollama run hf.co/hecan3d/QwenDGAF-Coder-2-3B:Q4_K_M`), y cualquier runtime compatible con GGUF (LM Studio, text-generation-webui). No se documenta compatibilidad con vLLM o TGI en la información proporcionada.
- Parámetros de inferencia recomendados por el autor: temperature 0.6-0.7, repeat penalty 1.1-1.15, max tokens 256-512, system prompt vacío.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| QwenDGAF-Coder-2-3B | 3.09B | 1024 (entrenamiento) | Apache 2.0 | GGUF | Código con personalidad satírica |
| Qwen2.5-Coder-3B-Instruct (base) | 3.09B | contexto nativo no disponible en la informacion proporcionada | Apache 2.0 | safetensors, GGUF | Asistente de código generalista |
| Qwen2.5-Coder-1.5B-Instruct | ~1.5B | contexto nativo no disponible en la informacion proporcionada | Apache 2.0 | safetensors, GGUF | Asistente de código ligero |
| Modelos de código de 3B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra su propio modelo base: QwenDGAF-Coder-2-3B hereda las capacidades de código de Qwen2.5-Coder-3B-Instruct pero las restringe a un contexto de 1024 tokens y las condiciona a un estilo de respuesta muy breve. Frente a alternativas generalistas, su valor no está en el rendimiento bruto sino en el comportamiento específico de diagnóstico conciso y rechazo de tareas desproporcionadas.

## Limitaciones y advertencias

- El contexto de entrenamiento es de solo 1024 tokens, muy inferior al del modelo base; las conversaciones largas o el código extenso probablemente degraden la calidad o se trunquen.
- El fine-tune está orientado a respuestas de 256-512 tokens; no es adecuado para generación de archivos completos ni documentación extensa.
- La personalidad gruñona y el tono tsundere pueden resultar inapropiados en entornos profesionales o ante usuarios que no esperan ese registro; el autor recomienda system prompt vacío, lo que dificulta modularlo.
- Riesgo de alucinación inherente a un modelo de 3B, agravado por el entrenamiento en un dataset pequeño y de estilo; las correcciones de código deben verificarse siempre.
- El modelo declara soporte de ruso, inglés y chino; no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- La model card mezcla referencias a "V3" y a "2" en el nombre y el texto, lo que puede indicar inconsistencias de versión; conviene verificar los archivos antes de desplegar.
- No se documentan evaluaciones de sesgo, seguridad ni robustez; el tag "uncensored" sugiere una reducción de filtros que puede aumentar el riesgo de contenido inapropiado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-3B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun así, el uso en producción de un modelo con personalidad satírica requiere revisión de política de contenido.
- El repositorio ocupa 13.9 GB por incluir múltiples cuantizaciones; la descarga completa no es necesaria si solo se usa una.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hecan3d/QwenDGAF-Coder-2-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Perfil del autor: https://huggingface.co/hecan3d
- Unsloth Studio (herramienta de entrenamiento declarada): no se proporciona enlace en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
