# DICPlay/RusMind-Vspyshka

## Resumen

RusMind-Vspyshka (RusMind · Вспышка) es un ajuste fino en ruso e inglés desarrollado por DICPlay sobre el modelo base google/gemma-4-E4B-it. Se distribuye principalmente en formato GGUF para su ejecución local mediante llama.cpp, LM Studio u Ollama, y está orientado a inferencia en dispositivo (on-device) sin conexión a internet. Con aproximadamente 7.500 millones de parámetros, el modelo busca ofrecer un rendimiento competitivo en tareas en ruso dentro de un tamaño manejable en equipos de consumo.

El modelo se presenta como la segunda mejor opción entre todos los modelos de menos de 10.000 millones de parámetros en el benchmark ruso MERA v2, con una puntuación global de 0,191, solo por detrás de otro modelo de la misma familia (RusMind Sokol 4.7). La model card destaca mejoras en razonamiento, comprensión de personas y conocimiento de la cultura y regiones de Rusia respecto a alternativas como Qwen3.5-9B, Gemma 4 E4B, T-lite y A-Vibe.

La relevancia actual del modelo radica en su enfoque hacia el despliegue local y privado en ruso: se ofrece en cuantizaciones desde 3,8 GB (Mini) hasta BF16 de 15,1 GB, lo que permite ejecutarlo en PC de gama alta y teléfonos insignia. La licencia es propietaria (rusmind-license), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la arquitectura del modelo base google/gemma-4-E4B-it; detalles específicos no disponibles) |
| Parámetros totales | 7.518.069.290 (7,5 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mini (3,8 GB), Lite (4,2 GB), Q4_K_M (5,3 GB), Q8_0 (8,0 GB), BF16 (15,1 GB); Q2_K–Q6_K en el repositorio RusMind-Vspyshka-4.7 |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | rusmind-license (licencia propietaria, etiquetada como "other") |
| Formato de pesos | GGUF (principal); BF16 también disponible en la versión 3.5 y 4.5 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del modelo google/gemma-4-E4B-it, por lo que hereda su arquitectura transformer. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones arquitectónicas propias más allá de las del modelo base.

La model card indica que el modelo está optimizado para ejecución local y sin conexión, con versiones cuantizadas orientadas a llama.cpp. Se menciona que la versión 4.7 mejora un 18 % el puntaje global de MERA v2 respecto a la versión 4.5, lo que sugiere un proceso iterativo de ajuste entre versiones (3.2, 3.5, 4.5 y 4.7). No se dispone de más detalles sobre el proceso de entrenamiento.

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Razonamiento y resolución de problemas lógicos (puntuación de 0,385 en la sección de razonamiento de MERA v2).
- Corrección de ortografía y puntuación en ruso (0,719 en SAGE, con 0,760 en signos de puntuación).
- Comprensión de cultura y regiones de Rusia (0,228 en MERA v2).
- Tareas centradas en el ser humano, como comprensión de personas (0,257).
- Respuestas adoptando personajes (0,537 en Characters).
- Desambiguación semántica y relaciones léxicas (0,465 en LIMUR, 0,373 en Enantiosemy).
- Seguimiento de instrucciones complejas (0,300 en IFHard).
- Llamada a herramientas y funciones (tool calling): 0,302 en GorillaHard, con selección correcta de herramienta en el 86 % de los casos y 100 % de robustez frente a inyección de instrucciones.
- Comprensión de humor (0,196).
- Ejecución en dispositivo (on-device) y sin conexión (offline).

## Casos de uso

- **Asistencia en escritura y corrección en ruso**: el modelo destaca en corrección ortográfica y de puntuación (0,719 en SAGE), por lo que puede integrarse en editores de texto o correctores locales que funcionen sin conexión, preservando la privacidad del usuario.
- **Atención al cliente en ruso con despliegue local**: al ejecutarse en dispositivo y sin internet, permite desplegar asistentes conversacionales en entornos con requisitos de privacidad o conectividad limitada, con capacidad de mantener conversaciones multi-turno.
- **Generación y asistencia de código con tool calling**: su puntuación en GorillaHard (0,302) y la selección correcta de herramientas en el 86 % de los casos lo hacen apto para pipelines de agentes que invocan funciones o APIs, aunque con limitaciones frente a modelos mayores.
- **Educación y tutoría en ruso**: el modelo puede explicar conceptos, ayudar con tareas escolares y responder preguntas de cultura general, aprovechando su conocimiento de la cultura y regiones de Rusia (0,228 en MERA v2).
- **Aplicaciones móviles offline**: con cuantizaciones desde 3,8 GB (Mini), puede ejecutarse en teléfonos insignia para asistentes personales, traducción o resumen de textos sin depender de la nube.
- **Creación de personajes y roleplay**: su puntuación de 0,537 en la tarea Characters lo hace adecuado para chatbots de personajes, videojuegos o narrativa interactiva en ruso.
- **Procesamiento de documentos con requisitos de soberanía de datos**: al ser un modelo ajustado para ruso y ejecutable localmente, encaja en organismos o empresas que necesiten procesar texto en ruso sin enviar datos a servicios externos.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark MERA v2 (octubre de 2026), según la model card del autor:

| Sección MERA v2 | RusMind Vspyshka (7,5B) | Qwen3.5-9B (9B) | Gemma 4 E4B (8B) | T-lite (8B) | A-Vibe (8B) |
|---|---|---|---|---|---|
| Puntuación global | 0,191 | 0,186 | 0,170 | 0,130 | 0,113 |
| Razonamiento | 0,385 | 0,339 | 0,367 | 0,218 | 0,187 |
| Comprensión de personas | 0,257 | 0,218 | 0,172 | 0,169 | 0,132 |
| Cultura y regiones de Rusia | 0,228 | 0,118 | 0,199 | 0,196 | 0,171 |

| Comparación con modelos mayores | RusMind Vspyshka (7,5B) | RuadaptQwen3-32B (32B) | Zero-Mistral (24B) |
|---|---|---|---|
| Puntuación global | 0,191 | 0,163 | 0,160 |
| Razonamiento | 0,385 | 0,342 | 0,213 |
| Comprensión de personas | 0,257 | 0,177 | 0,235 |

| Tarea específica (MERA v2) | Puntuación |
|---|---|
| Corrección ortográfica y de puntuación (SAGE) | 0,719 |
| Respuestas como personajes (Characters) | 0,537 |
| Relación de palabras en texto (LIMUR) | 0,465 |
| Antónimos y enantiosemia (Enantiosemy) | 0,373 |
| Lógica y razonamiento (NewReasoning) | 0,330 |
| Preguntas de opción múltiple (RUBIN) | 0,328 |
| Llamada a herramientas (GorillaHard) | 0,302 |
| Instrucciones complejas (IFHard) | 0,300 |
| Humor | 0,196 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 4-5 GB para la cuantización Mini (3,8 GB) o Lite (4,2 GB); alrededor de 6 GB para Q4_K_M (5,3 GB); unos 9 GB para Q8_0 (8,0 GB); y aproximadamente 16 GB para BF16 (15,1 GB).
- **GPU recomendadas**: para BF16, GPU con 16 GB o más (RTX 4080/4090, A100, H100). Para Q8_0, GPU con 10-12 GB (RTX 3080/4070 Ti). Para Q4_K_M, GPU con 8 GB (RTX 3060 Ti, RTX 4060 Ti).
- **Compatibilidad con GPU de consumo**: sí, cabe en GPU de consumo desde 8 GB de VRAM con cuantizaciones Q4_K_M o inferiores.
- **Opciones de despliegue**: llama.cpp, LM Studio, Ollama (según la model card), y cualquier runtime compatible con GGUF.
- **Latencia y throughput estimados**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Puntuación global MERA v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Vspyshka 4.7 | 7,5B | no disponible | 0,191 | rusmind-license (propietaria) | GGUF en Hugging Face |
| Qwen3.5-9B | 9B | no disponible | 0,186 | no disponible en la información | no disponible en la información |
| Gemma 4 E4B | 8B | no disponible | 0,170 | no disponible en la información | no disponible en la información |
| T-lite | 8B | no disponible | 0,130 | no disponible en la información | no disponible en la información |

## Limitaciones y advertencias

- **Licencia propietaria**: la licencia rusmind-license condiciona el uso comercial; es necesario revisar los términos del archivo LICENSE antes de utilizarlo en producción.
- **Idiomas limitados**: solo ruso e inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información incorrecta, especialmente en tareas de conocimiento factual o cultura general.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al estar entrenado con datos en ruso, puede reflejar sesgos culturales de ese contexto.
- **Contexto no especificado**: se desconoce la longitud máxima de contexto, lo que impide planificar su uso en tareas de contexto largo.
- **Rendimiento en tareas específicas**: puntuaciones moderadas en humor (0,196), instrucciones complejas (0,300) y tool calling (0,302), lo que limita su uso en agentes complejos frente a modelos mayores.
- **Formato GGUF principalmente**: aunque hay pesos BF16 en algunas versiones, el foco es la inferencia local; no se indica disponibilidad de safetensors en el repositorio principal.

## Enlaces

- Hugging Face: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Repositorio de cuantizaciones 4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo RusMind Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Demo en línea: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
