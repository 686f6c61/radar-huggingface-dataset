# dealignai/GLM-5.3-UNCENSORED-NVFP4

## Resumen

GLM-5.3-UNCENSORED-NVFP4 es una versión "abliterada" (sin rechazos) del modelo GLM-5.3 de Zhipu AI, publicada por dealignai bajo su marca CRACK. Se trata de un modelo de lenguaje masivo de 753B parámetros totales con arquitectura MoE (mixture of experts) y aproximadamente 18B parámetros activos por token, cuantizado en NVFP4 (4 bits) para reducir su huella de memoria. El modelo está específicamente orientado a ciberseguridad ofensiva: genera exploits, payloads, reverse shells, keyloggers y otro código malicioso funcional sin rechazos ni redirecciones, manteniendo un rendimiento cercano al modelo base (MMLU 84,11% frente a 85,58%).

La relevancia de este modelo radica en que elimina las barreras de seguridad a nivel de pesos, sin necesidad de jailbreaks ni plantillas de chat especiales, y se puede cargar directamente con vLLM estándar. Su ventana de contexto de 1M tokens y su soporte de razonamiento multi-nivel (off/low/high/max effort) lo hacen útil para tareas complejas de red teaming y análisis de seguridad, aunque su uso plantea serios riesgos éticos y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3 (`glm_moe_dsa`) — MoE + MLA + DeepSeek-sparse attention |
| Parametros totales | 753B (según model card); 390.942.074.880 en safetensors |
| Parametros activos | ~18B por token |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados en NVFP4; atención y expertos compartidos en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea una arquitectura híbrida que combina mixture of experts (MoE) con multi-head latent attention (MLA) y atención sparse estilo DeepSeek. Con 753B parámetros totales y solo ~18B activos por token, el modelo activa 8 expertos por token más un experto siempre activo, lo que permite un alto rendimiento con un coste computacional relativamente bajo. Incluye además una cabeza de predicción multi-token (MTP) que actúa como borrador para decodificación especulativa, con una tasa de aceptación de borrador de aproximadamente el 87%.

El proceso de "uncensoring" (CRACK) se realizó mediante abliteración a nivel de pesos: se eliminaron los comportamientos de rechazo directamente en los tensores, sin fine-tuning, SFT, DPO, LoRA, adaptadores ni trucos de plantilla. Según el autor, el modelo mantiene la capacidad general del base (MMLU 84,11% frente a 85,58%, una caída de 1,47 puntos porcentuales) y no presenta degeneración ni bucles en ningún modo de razonamiento. El modelo está cuantizado en NVFP4 (4 bits) para los expertos enrutados, mientras que la atención y los expertos compartidos se mantienen en bf16.

## Capacidades

- Generación de código ofensivo funcional: exploits, payloads, reverse shells, keyloggers, ransomware AES, escalada de privilegios SUID, fuerza bruta SSH, inyecciones SQL.
- Razonamiento multi-nivel: modos reasoning-off, low, high y max effort, recomendados los dos últimos para tareas de seguridad ofensiva.
- Decodificación especulativa con MTP (multi-token prediction) para acelerar la inferencia.
- Soporte de tool calling y auto-tool-choice (parser `glm47`).
- Ventana de contexto de 1M tokens, adecuada para análisis de código extenso o documentos largos.
- Capacidades generales de razonamiento, matemáticas y comprensión (MMLU 84,11%).
- Sin rechazos ni redirecciones en peticiones de seguridad ofensiva, verificado en modo greedy.

## Casos de uso

- Pruebas de penetración autorizadas: el modelo genera exploits y payloads funcionales para evaluar la seguridad de sistemas propios o con permiso explícito, acelerando el trabajo de los pentesters.
- Análisis de malware: puede desensamblar y explicar el comportamiento de muestras maliciosas, así como generar código de detección o sandboxing.
- Preparación de CTFs (Capture The Flag): genera soluciones para retos de explotación, criptografía, reversing y web, con razonamiento de alto esfuerzo.
- Desarrollo de herramientas de red teaming: crea beacons C2, keyloggers y utilidades de exfiltración para simulacros de adversario.
- Investigación en seguridad ofensiva: permite estudiar técnicas de ataque y defensa en entornos controlados, generando código de referencia para papers o cursos.
- Automatización de tareas de seguridad: integrado en pipelines de CI/CD para generar y probar payloads de forma iterativa, gracias a su soporte de tool calling y contexto largo.

## Benchmarks y rendimiento

La model card reporta únicamente resultados de MMLU (logit-mode, 1.026 preguntas) comparando el modelo base con la versión CRACK:

| Metrica | Base GLM-5.3 | CRACK Uncensored | Diferencia |
|---|---|---|---|
| MMLU (overall) | 85,58% | 84,11% | -1,47 pp |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible. La model card también detalla los resultados por cada una de las 57 materias de MMLU, con variaciones de entre -11,1 y +11,1 puntos porcentuales según la materia.

## Requisitos de hardware

- VRAM estimada: con 753B parámetros en NVFP4 (4 bits), el modelo requiere aproximadamente 376 GB solo para los pesos, más overhead de activaciones y KV cache. Con contexto de 1M tokens, la memoria total supera los 500 GB.
- GPU recomendadas: el comando de despliegue oficial usa `--tensor-parallel-size 8`, lo que sugiere 8 GPUs de 80 GB (H100, A100 80GB) o equivalente. No cabe en una GPU de consumo.
- Opciones de despliegue: vLLM (recomendado, con `--moe-backend marlin`), posiblemente TGI o SGLang, aunque la model card solo menciona vLLM.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP (~87% de aceptación) debería mejorar el throughput, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Como referencia, el modelo base GLM-5.3 (zai-org/GLM-5.3) es la alternativa sin abliterar, con MMLU 85,58% y los mismos requisitos de hardware. Otros modelos MoE de gran tamaño como DeepSeek-V3 o Qwen3-Max podrían ser comparables en capacidad, pero no hay benchmarks compartidos en esta ficha.

## Limitaciones y advertencias

- Modelo diseñado para ciberseguridad ofensiva: genera código malicioso funcional (ransomware, keyloggers, brute-forcers). Su uso sin autorización explícita es ilegal y éticamente reprobable.
- Solo soporta inglés; no hay garantías de rendimiento en otros idiomas.
- La abliteración elimina los rechazos de seguridad, lo que puede llevar a respuestas dañinas en temas de violencia, acoso u otros contenidos perjudiciales.
- Riesgo de alucinación: aunque el autor afirma que el código generado es funcional, no hay garantía de que todos los outputs sean correctos o seguros.
- Requiere hardware masivo (múltiples GPUs de 80 GB), lo que limita su uso a entornos con infraestructura dedicada.
- La licencia MIT permite uso comercial, pero la responsabilidad legal del uso del modelo recae en el usuario.
- No se han publicado evaluaciones de seguridad o sesgos más allá del MMLU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-NVFP4
- Espejo abliterado: https://huggingface.co/dealignai/GLM-5.3-ABLITERATED-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Sitio de dealignai: https://dealign.ai/
