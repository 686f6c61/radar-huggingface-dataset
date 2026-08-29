# burningfeet/backup-2026-08-29-Tiel-Coder-.aka.ornith15.-35B-A3B-Genesis-Hermes-GGUF

## Resumen

El modelo `burningfeet/backup-2026-08-29-Tiel-Coder-.aka.ornith15.-35B-A3B-Genesis-Hermes-GGUF` es una conversión a formato GGUF del modelo base `ornith-ai/Ornith-1.5-35B-A3B`, un modelo de lenguaje de tipo mixture of experts (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos (nomenclatura A3B). El autor, `burningfeet`, ha aplicado un fine-tuning adicional denominado "Genesis-Hermes" que incorpora el dataset `NousResearch/hermes-function-calling-v1`, orientado a mejorar las capacidades de function calling y razonamiento agéntico. El modelo está diseñado para tareas de codificación agéntica (agentic coding) y es eficiente en el uso de tokens, con soporte multimodal (image-text-to-text) según el pipeline declarado.

Este modelo resulta relevante en el ecosistema open source por su combinación de eficiencia (MoE con pocos parámetros activos) y capacidades avanzadas de tool calling, lo que lo hace adecuado para despliegues locales con recursos limitados. Su licencia MIT permite uso comercial sin restricciones, aunque el acceso en HuggingFace está restringido (gated) y requiere aceptar condiciones. Al ser una conversión GGUF, es compatible con llama.cpp, Ollama y otros motores de inferencia locales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), basado en Ornith-1.5-35B-A3B |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | ~3 B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no especificadas) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `Ornith-1.5-35B-A3B` emplea una arquitectura MoE con 35.000 millones de parámetros totales y 3.000 millones activos por token, lo que reduce significativamente el coste computacional en inferencia. El fine-tuning "Genesis-Hermes" se ha realizado sobre el dataset `NousResearch/hermes-function-calling-v1`, especializado en la generación de llamadas a funciones y razonamiento multi-paso. Los tags del repositorio indican el uso de `imatrix` (matriz de importancia para cuantización) y `unsloth-dynamic`, lo que sugiere una optimización específica para la conversión a GGUF. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo, con especial énfasis en tareas de codificación.
- Soporte de function calling / tool calling, gracias al fine-tuning con el dataset Hermes.
- Capacidades agénticas: planificación multi-paso y ejecución de acciones encadenadas.
- Procesamiento multimodal (image-text-to-text), lo que permite combinar entradas de imagen y texto.
- Multilingüe: inglés, chino y otros idiomas (etiqueta `multilingual`).
- Eficiencia en tokens: la arquitectura MoE con pocos parámetros activos reduce el coste por consulta.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en editores como VS Code o Neovim para autocompletar código, explicar fragmentos y sugerir refactorizaciones, aprovechando su fine-tuning en function calling.
- Agente de automatización de tareas de desarrollo: puede orquestar pipelines de CI/CD, gestionar issues de GitHub o ejecutar comandos de terminal mediante tool calling, gracias a su capacidad de razonamiento multi-paso.
- Chatbot de soporte técnico con acceso a herramientas: al soportar function calling, puede consultar bases de conocimiento, APIs o sistemas de ticketing en tiempo real para resolver incidencias de usuarios.
- Análisis de capturas de pantalla y documentación visual: su capacidad multimodal permite interpretar diagramas, esquemas o capturas de pantalla de errores y generar explicaciones o código asociado.
- Generación de documentación técnica multilingüe: puede traducir y redactar documentación en inglés, chino y otros idiomas, manteniendo coherencia técnica.
- Despliegue local en entornos con recursos limitados: al ser un modelo MoE de 3B activos y estar disponible en GGUF, puede ejecutarse en portátiles con GPU de gama media o incluso en CPU con llama.cpp, ideal para desarrollo offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Existe una evaluación independiente en el repositorio GitHub `h00nigan/35b-moe-eval` que compara este modelo (Tiel-Coder-35B-A3B) con otros builds MoE de 35B, pero no se proporcionan cifras concretas en los resultados de búsqueda recopilados. Se recomienda consultar dicho repositorio para obtener datos de rendimiento en tareas de codificación y razonamiento.

## Requisitos de hardware

- Tamaño del repositorio: 55,9 GB, lo que sugiere que la cuantización más grande (posiblemente Q8) ocupa alrededor de 35-40 GB en disco.
- Para inferencia con cuantización Q4_K_M (aproximadamente 20-22 GB de VRAM), se recomienda una GPU con al menos 24 GB de memoria, como RTX 3090, RTX 4090 o A5000.
- Para cuantizaciones más altas (Q6, Q8), se necesitan GPUs con 32-48 GB de VRAM, como A100 o H100.
- Al ser un modelo MoE con solo 3B parámetros activos, la inferencia es más rápida que un modelo denso equivalente, pero la memoria necesaria depende de la cuantización completa.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python.
- En CPU, con llama.cpp y cuantización Q4, se puede ejecutar con 32 GB de RAM, aunque la latencia será mayor.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 34,66 B | ~3 B | no disponible | MIT | safetensors |
| Qwen3-30B-A3B (referencia) | 30 B | 3 B | 32k (típico) | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V3-Lite (hipotético) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos fiables. El modelo se posiciona como una alternativa eficiente a Qwen3-30B-A3B, con la ventaja de una licencia MIT y capacidades multimodales, aunque su contexto no está documentado.

## Limitaciones y advertencias

- Acceso restringido en HuggingFace: requiere aceptar condiciones antes de descargar, lo que puede limitar su adopción en entornos automatizados.
- Modelo reciente con 0 descargas y 0 likes: no ha sido validado por la comunidad, por lo que su estabilidad y calidad no están contrastadas.
- Riesgo de alucinación en código: como cualquier modelo de lenguaje, puede generar código sintácticamente correcto pero funcionalmente incorrecto; se recomienda revisión humana.
- Longitud de contexto no especificada: no se conoce el límite de tokens de entrada, lo que puede afectar a tareas que requieran contextos largos.
- Sesgos potenciales del fine-tuning: el dataset Hermes puede introducir sesgos en el estilo de respuesta o en la priorización de ciertos tipos de llamadas a funciones.
- Aunque la licencia es MIT, el modelo base puede tener condiciones adicionales; se recomienda verificar la licencia del modelo original `ornith-ai/Ornith-1.5-35B-A3B`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/burningfeet/backup-2026-08-29-Tiel-Coder-.aka.ornith15.-35B-A3B-Genesis-Hermes-GGUF
- Repositorio similar (versión anterior): https://huggingface.co/burningfeet/2026-08-26-.-backup-.-Ornith1.5-35B-A3B-Genesis-Hermes-GGUF
- Web de Ornith AI: https://ornith.online/
- Evaluación independiente en GitHub: https://github.com/h00nigan/35b-moe-eval
