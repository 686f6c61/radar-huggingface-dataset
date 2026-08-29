# davidsyoung/GLM-5.3-EXL3-TR3-3.25bpw

## Resumen

GLM-5.3-EXL3-TR3-3.25bpw es una cuantización trellis (EXL3) del modelo GLM-5.3 de Z.ai, realizada por el usuario davidsyoung. GLM-5.3 es un modelo de lenguaje de arquitectura MoE (mixture of experts) con 755 mil millones de parámetros totales y 40 mil millones activos, diseñado para tareas complejas de ingeniería de software y trabajo agéntico de largo horizonte. La cuantización reduce el peso de los expertos enrutados a una media de 3,25 bits por peso (mezcla de códecs K3 y K4), manteniendo las capas densas, atención y embeddings en BF16, lo que permite servir el modelo en 4 GPU de 96 GB con caché KV en FP8.

Esta versión cuantizada resuelve el problema del despliegue de un modelo de 755B en hardware asequible para laboratorios de investigación y empresas, ya que el modelo original en BF16 requeriría más de 1,5 TB de VRAM. La cuantización es data-free (sin calibración), determinista y sigue la línea de cuantizaciones TR3 de la familia GLM-5.2. Es relevante porque GLM-5.3 es, según Z.ai, el modelo de pesos abiertos más capaz para coding, con una mejora del 50% sobre GLM-5.2 en tareas de programación agéntica, y esta cuantización permite ejecutarlo en configuraciones de 4 GPU profesionales.

El modelo está en estado pre-release: los pesos no están completamente subidos y las pruebas de calidad (KLD gate y smoke tests) están pendientes. No es cargable con el cargador estándar de exllamav3; requiere un parche específico para manejar los niveles mixtos de bits por capa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm_moe_dsa), 78 capas + MTP, 256 expertos enrutados por capa |
| Parametros totales | 755B (algunas fuentes citan 753B) |
| Parametros activos | 40B |
| Longitud de contexto | Hasta 1M tokens (arquitectonico) |
| Tipos de cuantizacion | EXL3 trellis 3,25 bpw (mezcla K3/K4), BF16 para capas densas, atencion, normas, embeddings y lm_head |
| Idiomas soportados | Ingles, chino |
| Licencia | glm-5.3 (otra, ver enlace) |
| Formato de pesos | Safetensors (shards BF16 carrier + payloads trellis por capa) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 utiliza una arquitectura MoE con 78 capas, 256 expertos enrutados por capa y un módulo de predicción multi-token (MTP). Según la documentación de Z.ai, GLM-5.3 comparte la misma base que GLM-5.2; todas las mejoras provienen del post-entrenamiento, que se centra en coding complejo y tareas de largo horizonte. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) en la información disponible.

La cuantización TR3 aplica un esquema de bits mixtos: los expertos enrutados de las capas 3 a 78 (incluido MTP-78) se codifican con trellis EXL3, asignando 192 expertos por capa a K3 y los 64 expertos con mayor error cuadrático medio relativo bajo K3 a K4, resultando en una media de 3,25 bpw. El proceso es data-free: utiliza una Hessiana identidad, rotaciones y búsqueda trellis sin captura de calibración. Las semillas se derivan de (capa, experto, proyección, rango) con base 20260711, lo que garantiza reproducibilidad. Los expertos compartidos se mantienen en BF16 en el checkpoint y se codifican en K6 en línea durante el servicio.

## Capacidades

- Generación de texto y razonamiento en inglés y chino.
- Coding agéntico: mejora del 50% sobre GLM-5.2 en tareas de programación complejas según Z.ai.
- Tareas de largo horizonte: mejor rendimiento que GLM-5.2 en escenarios que requieren múltiples pasos y planificación.
- Eficiencia de tokens: alcanza 34,5% de éxito en agentic coding a Max effort con ~75K tokens de salida, frente al 23,4% de GLM-5.2 con 96K tokens.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, pero es un modelo orientado a agentes, por lo que se espera que lo soporte.
- Capacidades multimodales: no disponibles (solo texto).

## Casos de uso

- Desarrollo de software asistido por IA en entornos con GPU profesionales: el modelo puede generar, revisar y refactorizar código en repositorios grandes, aprovechando su contexto de hasta 1M tokens para mantener el estado completo del proyecto. Es adecuado para equipos que dispongan de 4 GPU de 96 GB (RTX PRO 6000 o similares).
- Agentes autónomos de larga duración: gracias a su mejora en tareas de largo horizonte, puede ejecutar pipelines de automatización que requieren planificación multi-paso, como orquestación de pruebas, despliegue continuo o análisis de incidencias.
- Generación de código en producción con integración en CI/CD: el modelo puede integrarse en pipelines de integración continua para generar tests unitarios, documentación o parches, reduciendo la intervención humana en tareas repetitivas.
- Asistente de programación bilingüe (inglés/chino): equipos de desarrollo en China o con documentación mixta pueden beneficiarse de su soporte nativo de ambos idiomas.
- Investigación en cuantización de modelos MoE: esta versión sirve como referencia para estudiar el impacto de la cuantización trellis data-free en modelos de 755B, comparando calidad y rendimiento con el BF16 original.
- Despliegue en entornos con restricciones de VRAM: frente al modelo BF16 que requiere más de 1,5 TB, esta cuantización permite ejecutar GLM-5.3 en 384 GB, habilitando su uso en clusters de 4 GPU de gama alta.
- Tutoría y educación en programación: puede explicar conceptos complejos, generar ejemplos y corregir ejercicios, con la ventaja de manejar contextos largos de conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento provienen del blog de Z.ai sobre el modelo base GLM-5.3, no de esta cuantizacion:

| Tarea | GLM-5.3 (Max effort) | GLM-5.2 (Max effort) |
|---|---|---|
| Agentic coding (tasa de exito) | 34,5% | 23,4% |
| Tokens de salida por tarea | ~75K | ~96K |

La model card de la cuantizacion indica que la clase de referencia de la linea GLM-5.2 a 3,25 bpw tiene un KLD de ~0,088 (con FP8 KV), pero esta cifra no ha sido validada aun para este modelo. Las pruebas de calidad (KLD gate con teacher BF16 sellado y ventana de 2048 tokens) estan pendientes.

## Requisitos de hardware

- VRAM estimada: 384 GB en total (4x 96 GB) con FP8 KV cache, segun la model card.
- GPU recomendadas: 4x RTX PRO 6000 Blackwell (96 GB cada una). No se especifican otras, pero GPUs con 96 GB como A100 80GB o H100 80GB podrian ser compatibles si se ajusta el reparto de shards.
- No cabe en GPU de consumo: ninguna GPU consumer tiene suficiente VRAM para este modelo.
- Opciones de despliegue: stack exllamav3-b12x/sparkinfer-lineage, con TP4 (tensor parallelism) y DCP4/MTP3. Requiere el parche de niveles de proyeccion mixtos; un cargador estandar de exllamav3 producira resultados incorrectos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3 (base, BF16) | 755B | 40B | 1M | glm-5.3 | HuggingFace |
| GLM-5.3-EXL3-TR3-3.25bpw (este) | 755B | 40B | 1M | glm-5.3 | HuggingFace (pre-release) |
| GLM-5.2 (base) | 755B | 40B | 1M | glm-5.2 | HuggingFace |

No se dispone de datos de otros modelos comparables (como DeepSeek-V3 o Qwen3-Max) en la informacion proporcionada. La principal diferencia entre GLM-5.3 y GLM-5.2 es el post-entrenamiento, que mejora el rendimiento en coding y tareas de largo horizonte sin cambiar la arquitectura base.

## Limitaciones y advertencias

- Estado pre-release: los pesos no estan completamente subidos y las pruebas de calidad (KLD gate y smoke tests) no se han ejecutado. El autor advierte que el modelo debe tratarse como no validado hasta que se retire el aviso.
- Requiere un cargador especifico: no es cargable con exllamav3 estandar; un cargador que asuma un nivel K uniforme por capa producira "fluent garbage" (texto con apariencia coherente pero sin sentido).
- Licencia glm-5.3: es una licencia personalizada ("other") con restricciones que deben revisarse en el enlace proporcionado antes de uso comercial.
- Idiomas limitados: solo ingles y chino; no soporta otros idiomas de forma nativa.
- Riesgo de alucinacion: no hay datos especificos para esta cuantizacion, pero es un riesgo inherente a modelos de este tamano, especialmente en tareas de codigo donde puede generar APIs inexistentes.
- Sesgos: no se han documentado sesgos especificos, pero al estar entrenado principalmente en ingles y chino, puede reflejar sesgos culturales de esos dominios.
- Hardware exigente: requiere 384 GB de VRAM, lo que limita su uso a laboratorios o empresas con infraestructura de GPU profesional.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/davidsyoung/GLM-5.3-EXL3-TR3-3.25bpw
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Documentacion de Z.ai para GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.15763
- Ficha en LM Studio: https://lmstudio.ai/models/glm-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
