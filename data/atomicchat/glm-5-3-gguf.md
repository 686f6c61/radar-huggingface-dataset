# AtomicChat/GLM-5.3-GGUF

## Resumen

GLM-5.3 es un modelo de lenguaje de 753.000 millones de parámetros desarrollado por Z.ai (zai-org), publicado en agosto de 2026 como sucesor de GLM-5.2. AtomicChat ha publicado una versión cuantizada en formato GGUF con matriz de importancia propia, construida a partir de los pesos originales en FP8. El modelo emplea una arquitectura de mezcla de expertos (MoE) con 256 expertos enrutados, de los cuales 8 se activan por token junto con un experto compartido, y presenta una longitud de contexto de hasta 1.048.576 posiciones en su configuración.

La relevancia de este lanzamiento radica en que, según los datos publicados por Z.ai, GLM-5.3 alcanza el estado del arte entre los modelos de pesos abiertos en tareas de codificación, con resultados destacados en Terminal Bench 3.0 y Agents' Last Exam. También reporta capacidades emergentes en ciberseguridad ofensiva, con una mejora superior al doble respecto a GLM-5.2 en benchmarks de explotación de vulnerabilidades. La versión GGUF de AtomicChat permite ejecutar el modelo en entornos locales con llama.cpp, aunque su tamaño exige infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (MoE con atencion dispersa e indexador aprendido) |
| Parametros totales | 753B |
| Parametros activos | 8 expertos enrutados + 1 compartido por token (de 256 expertos) |
| Longitud de contexto | 1.048.576 posiciones en config; Z.ai evalua hasta 1M con gestion de contexto |
| Tipos de cuantizacion | AD-IQ2_M, AD-IQ3_M, AD-Q4_K_M, AD-Q5_K_M, AD-Q6_K, AD-Q8_0 (imatrix) |
| Idiomas soportados | Ingles, chino |
| Licencia | glm-5.3 (otra; enlace al LICENSE del modelo base) |
| Formato de pesos | GGUF (convertido desde checkpoint FP8) |

## Arquitectura y entrenamiento

La arquitectura de GLM-5.3 es una variante MoE denominada `GlmMoeDsaForCausalLM`. El modelo tiene 78 capas, de las cuales las tres primeras son densas y el resto contienen 256 expertos enrutados. Por cada token se activan 8 expertos enrutados más un experto compartido. Incorpora atencion dispersa con un indexador aprendido (top-2048) y un bloque de prediccion multi-token. El checkpoint original se distribuye en precision FP8 (e4m3 con escalas de bloque 128x128), y la version GGUF de AtomicChat se convierte directamente desde ese checkpoint FP8, no desde BF16.

No se han publicado datos sobre el entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion disponible. Z.ai indica que GLM-5.3 mantiene la misma base que GLM-5.2 y que todas las mejoras provienen del post-entrenamiento. La cuantizacion de AtomicChat utiliza una matriz de importancia propia, con un layout dinamico "AD" que asigna bits por rol de tensor: el router y el experto compartido se mantienen con mayor precision, mientras que los expertos enrutados soportan la compresion.

## Capacidades

- Generacion de texto bilingue en ingles y chino, con vocabulario de 154.880 tokens.
- Razonamiento con presupuesto de pensamiento controlable mediante el parametro `reasoning_effort`, con tres niveles: `low`, `high` y `max` (valor por defecto).
- Codificacion: estado del arte entre modelos de pesos abiertos en Terminal Bench 3.0 y Agents' Last Exam, con una mejora del 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench.
- Capacidades de agente: operacion en terminal, uso de herramientas y razonamiento multi-paso, evidenciado por sus resultados en Terminal Bench y DeepSWE.
- Cibercapacidad emergente: deteccion y explotacion de vulnerabilidades, con resultados destacados en CyberGym.
- Contexto largo de hasta 1M de tokens con gestion de contexto, adecuado para documentos extensos y conversaciones multi-turno.
- Soporte de tool calling y function calling, implicito por su rendimiento en Agents' Last Exam y HLE con herramientas.

## Casos de uso

- Asistente de programacion en produccion: el modelo puede generar, revisar y refactorizar codigo en multiples lenguajes, integrarse en pipelines de CI/CD mediante tool calling y mantener contexto de repositorios extensos gracias a su ventana de 1M de tokens.
- Agente autonomo de operaciones de terminal: con su capacidad para ejecutar comandos y razonar sobre la salida, puede automatizar tareas de administracion de sistemas, despliegue y diagnostico, como se refleja en Terminal Bench 3.0.
- Analisis de seguridad ofensiva: el modelo puede identificar vulnerabilidades en codigo y sistemas, y sugerir rutas de explotacion, util para equipos de red team y auditorias de seguridad.
- Razonamiento sobre documentos largos: su contexto de 1M permite analizar contratos, informes tecnicos o codebases completos en una sola pasada, con capacidad de razonamiento multi-paso.
- Asistente bilingue ingles-chino: adecuado para traduccion, redaccion y soporte en entornos corporativos que operan en ambos idiomas.
- Investigacion en IA: como modelo MoE de 753B con pesos abiertos, sirve para estudiar escalado, cuantizacion agresiva y comportamiento emergente en tareas de agente y ciberseguridad.

## Benchmarks y rendimiento

Los siguientes resultados corresponden a los publicados por Z.ai para el modelo base `zai-org/GLM-5.3`. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

| Benchmark | Resultado |
|---|---|
| Terminal Bench 2.1 | 88.2 |
| Terminal Bench 3.0 | 28.3 |
| DeepSWE 1.1 | 66.9 |
| CyberGym | 84.5 |
| AutomationBench | 48.2 |
| HLE con herramientas | 62.5 |
| GDPval-AA v2 | 1769 |

## Requisitos de hardware

- Estimaciones de VRAM para los quants (basadas en 753B parametros y el numero de bits por peso; los tamanos exactos no estan publicados):
  - AD-IQ2_M: aproximadamente 200-250 GB.
  - AD-IQ3_M: aproximadamente 280-320 GB.
  - AD-Q4_K_M: aproximadamente 400-450 GB (recomendado por AtomicChat).
  - AD-Q5_K_M: aproximadamente 500-550 GB.
  - AD-Q6_K: aproximadamente 600-650 GB.
  - AD-Q8_0: aproximadamente 800-850 GB.
- GPU recomendadas: multiples GPU de data center con 80 GB o mas de VRAM por unidad (por ejemplo, NVIDIA A100 80GB, H100 80GB o superiores). No cabe en GPU de consumo como RTX 4090 (24 GB) ni en la mayoria de estaciones de trabajo.
- Alternativa: servidores con gran cantidad de RAM para inferencia por CPU con llama.cpp, aunque la velocidad sera limitada.
- Opciones de despliegue: llama.cpp (requiere una build con soporte para la arquitectura `glm_moe_dsa`), Atomic Chat (aplicacion local que lo ejecuta cuando el soporte este disponible). No se ha confirmado compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-5.3 (zai-org) | 753B MoE | 1M | glm-5.3 | Modelo base, mejoras de post-entrenamiento sobre GLM-5.2 |
| GLM-5.2 (zai-org) | 753B MoE | 1M | glm-5.2 | Misma base y numero de parametros, sin las ganancias de post-entrenamiento de GLM-5.3 |
| GLM-5.3-Flash (zai-org) | 320B MoE | no disponible | MIT | Variante multimodal, 18B activos por token, publicada el 25 de agosto de 2026 |

No se dispone de datos comparativos con otros modelos MoE de tamano similar (por ejemplo, DeepSeek-V3 o Qwen3-MoE) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es extremadamente grande: incluso en cuantizacion de 4 bits, el conjunto completo de pesos ocupa varios cientos de gigabytes y debe residir en memoria rapida. No es adecuado para portatiles ni estaciones de trabajo convencionales.
- Los quants de este repositorio estan aun en proceso de subida, y requieren una build de llama.cpp con soporte para la arquitectura `glm_moe_dsa`. Sin esa build, el modelo no se puede ejecutar.
- Es obligatorio pasar la opcion `--jinja` para aplicar la plantilla de chat de GLM-5.3. Ademas, la plantilla tiene `clear_thinking` con valor por defecto `false`, por lo que debe pasarse `clear_thinking=true` en escenarios de chat para evitar que el razonamiento se mezcle con la respuesta.
- La licencia `glm-5.3` es de tipo "otra" y no se ha revisado su texto completo; es necesario consultar el LICENSE del modelo base para conocer las restricciones de uso comercial y redistribucion.
- No se han publicado datos sobre sesgos especificos del modelo. Al ser bilingue ingles-chino, puede presentar sesgos culturales asociados a esos dominios.
- Riesgo de alucinacion en tareas de razonamiento complejo o cuando se le pide informacion factual no cubierta por su entrenamiento, como es comun en modelos de esta escala.
- La gestion de contexto de 1M puede degradar el rendimiento en los extremos de la ventana; Z.ai evalua hasta 1M con tecnicas de gestion de contexto, no necesariamente con atencion completa en toda la ventana.

## Enlaces

- Repositorio HuggingFace de los quants: https://huggingface.co/AtomicChat/GLM-5.3-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Corpora de calibracion publicos: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Aplicacion Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Servidor Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Pagina de especificaciones de GLM-5.3: https://glm-ai.chat/models/glm-5-3/
