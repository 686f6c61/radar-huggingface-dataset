# SixVolts/Swift-Qwen3.8-27B-GGUF

## Resumen

Swift-Qwen3.8-27B-GGUF es una cuantización en formato GGUF del modelo Swift-Qwen3.8-27B, un ajuste fino desarrollado por UkisAI sobre Qwen3.8-27B (modelo base de Alibaba Cloud bajo licencia Apache 2.0). La versión publicada por SixVolts está específicamente optimizada para hardware AMD antiguo, en concreto GPUs con arquitectura Navi 21 (gfx1030) como la Radeon PRO V620 o la MI50, y se distribuye junto con dos drafters de decodificación especulativa (MTP y DFlash2) que aceleran la inferencia entre un 60% y un 180% según la tarea y la profundidad de contexto.

El modelo cuenta con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones) y se distribuye en un archivo principal de 16,6 GiB en cuantización Q4_K_XL, lo que permite ejecutarlo en una única GPU de 32 GB con una ventana de contexto de 64k tokens. El repositorio completo ocupa 20,3 GB e incluye los tres archivos GGUF necesarios para el despliegue con decodificación especulativa.

La relevancia de esta ficha radica en que demuestra un flujo de trabajo completo de cuantización y despliegue para hardware de segunda mano, con métricas de rendimiento reproducibles (velocidad de prefill, decode y profundidad de contexto) y una licencia de uso comercial condicionada por umbral de facturación anual. Es un caso práctico de cómo exprimir GPUs de datacenter descatalogadas con llama.cpp y ROCm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, no se detalla variante específica) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 64k tokens (configuración de despliegue recomendada); soporta hasta 128k según métricas de prefill |
| Tipos de cuantizacion | Q4_K_XL (modelo principal, con embeddings Q4_K y output Q6_K); Q4_0 (drafters DFlash2 y MTP) |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (uso personal, investigación, educativo y evaluación libre; comercial hasta 1.000.000 USD de facturación anual; por encima requiere licencia enterprise de UkisAI) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3.8-27B, un transformer de 27,3 mil millones de parámetros desarrollado originalmente por Alibaba Cloud bajo licencia Apache 2.0. UkisAI aplicó un fine-tuning sobre los pesos base, aunque la model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifica si la arquitectura incorpora innovaciones como atención lineal o mezcla de expertos; los datos disponibles solo confirman que se trata de un transformer denso de 27B parámetros.

La contribución técnica principal de esta publicación no reside en el modelo en sí, sino en el pipeline de cuantización y despliegue. SixVolts aplicó la receta per-tensor UD-Q4_K_XL de Unsloth sobre los pesos F16 de Swift, utilizando la importance matrix de Unsloth, pero sustituyendo los tensores que Unsloth almacena en formatos IQ por Q4_K, ya que los formatos IQ se dequantizan lentamente en gfx1030. El resultado es un archivo de 16,57 GiB con una divergencia KL de 0,0092 frente al Q8_0 de referencia, mejor que el Q4_K_M de Swift (0,0134) pese a ser ligeramente más pequeño.

El sistema de decodificación especulativa incorpora dos drafters: DFlash2 (basado en el drafter de z-lab, cuantizado a Q4_0) y MTP (multi-token prediction, basado en el drafter de Unsloth). Ambos utilizan un vocabulario reducido de 65.536 tokens (d2t64k) que cubre el 98,9% de la salida del modelo en texto de validación, lo que reduce drásticamente el coste de la cabeza de salida del drafter. El drafter solo propone tokens que el modelo principal verifica en un batch, por lo que la distribución de salida no se altera.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte para contextos de hasta 64k tokens en la configuración recomendada y hasta 128k según las métricas de prefill publicadas.
- Razonamiento y tareas de matemáticas y código, con velocidades de decodificación medidas específicamente en tareas de matemáticas, código, listas y ensayos.
- Decodificación especulativa con dos drafters alternativos (MTP y DFlash2), seleccionables según la profundidad de contexto y el tipo de tarea.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con APIs de inferencia estándar.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPUs AMD de segunda mano: el modelo está optimizado para Radeon PRO V620 (Navi 21, gfx1030) y MI50, tarjetas de datacenter descatalogadas que se venden a precios reducidos en el mercado secundario. Permite montar un servidor de inferencia de 27B parámetros con 64k de contexto en una sola GPU de 32 GB, con velocidades de 44-76 t/s usando drafters.
- Chat conversacional de investigación: con el drafter MTP a 3 tokens se alcanzan 44,2 t/s en chat de investigación y 55,3 t/s a 4k de profundidad, lo que hace viable un asistente conversacional interactivo con contexto largo en hardware modesto.
- Generación de código en producción: las métricas muestran 54 t/s con MTP y DFlash2 en tareas de código, con prefill de 492 t/s en contexto vacío y 278 t/s a 64k. Adecuado para autocompletado y generación de fragmentos en pipelines de CI/CD donde la latencia importa.
- Resumen de documentos largos: el modelo mantiene 44,1 t/s (MTP) y 32,0 t/s (DFlash2) a 120k tokens de profundidad, lo que permite procesar documentos extensos con ventanas de contexto muy amplias en una sola pasada.
- Tareas de matemáticas y razonamiento: las velocidades medidas en tareas de matemáticas (62 t/s con MTP, 76 t/s con DFlash2) indican buen rendimiento para resolución de problemas paso a paso y generación de explicaciones razonadas.
- Evaluación y benchmarking de cuantizaciones: el repositorio incluye scripts reproducibles (`make-models.sh`) y sumas SHA256, lo que permite reconstruir los archivos byte a byte y validar la calidad de la cuantización (KLD 0,0092) frente a otras recetas como Q4_K_M.
- Servidor de inferencia compatible con endpoints: el tag `endpoints_compatible` sugiere que puede integrarse en infraestructuras que esperan una API compatible con OpenAI, útil para prototipado rápido de aplicaciones sobre llama-server.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados son métricas de velocidad de inferencia medidas en una AMD Radeon PRO V620 (Navi 21, gfx1030) con llama-server, temperatura 1.0, top-p 0.95, top-k 20 y `--spec-draft-temp 1.0`:

| Drafter | Chat de investigación | Matemáticas | Código | Listas | Ensayo |
|---|---|---|---|---|---|
| Ninguno | 24,3 t/s | ~24 t/s | ~24 t/s | ~24 t/s | ~24 t/s |
| MTP (3 tokens) | 44,2 t/s | 62 t/s | 54 t/s | 64 t/s | 43 t/s |
| DFlash2 (adaptativo hasta 7) | 42,3-43,5 t/s | 76 t/s | 54 t/s | 69 t/s | 40 t/s |

Rendimiento en profundidad de contexto (t/s de decode, tarea de resumen de texto largo):

| Profundidad | Sin drafter | MTP | DFlash2 |
|---|---|---|---|
| 4k | 24,1 | 55,3 | 50,0 |
| 16k | 23,0 | 53,0 | 55,3 |
| 40k | 21,4 | 48,0 | 41,6 |
| 80k | 19,3 | 47,2 | 39,2 |
| 120k | 17,4 | 44,1 | 32,0 |

Prefill sin drafter: 492 t/s con contexto vacío, 416 t/s a 16k, 278 t/s a 64k, 172 t/s a 128k.

## Requisitos de hardware

- VRAM estimada para inferencia: 16,6 GiB para el modelo principal en Q4_K_XL, más 1,3 GiB para el drafter DFlash2 o 1,0 GiB para el drafter MTP. Con contexto de 64k y overhead de llama.cpp, cabe en una GPU de 32 GB.
- GPU recomendadas: AMD Radeon PRO V620 (Navi 21, gfx1030) es la plataforma de referencia y medición; también se indica compatibilidad con AMD MI50. No se proporcionan datos para GPUs NVIDIA.
- Cabe en consumer GPU: no se especifica; el foco está en GPUs de datacenter antiguas de AMD. Para NVIDIA consumer (RTX 4090 con 24 GB) no hay datos de compatibilidad en la información disponible.
- Opciones de despliegue: llama.cpp mediante el fork `sixvolts/llama-navi21-furnace` (rama `main`), necesario para el drafter MTP con vocabulario reducido y `--spec-draft-temp`. El modelo principal es un GGUF estándar compatible con llama.cpp upstream. Se menciona ROCm como stack de aceleración.
- Latencia y throughput: prefill de 492 t/s (contexto vacío) a 172 t/s (128k); decode de 24 t/s sin drafter hasta 76 t/s con DFlash2 en tareas de matemáticas. A 120k de profundidad, MTP mantiene 44,1 t/s frente a 32,0 t/s de DFlash2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-GGUF (esta ficha) | 27,3B | 64k recomendado, 128k soportado | 24-76 t/s en V620 con drafters; KLD 0,0092 vs Q8_0 | Swift Open License v1.0 (comercial hasta 1M USD) | Hugging Face, 468 descargas |
| Swift Q4_K_M (mismo modelo base, cuantización alternativa) | 27,3B | no disponible | KLD 0,0134 vs Q8_0; tamaño 16,79 GiB | Swift Open License v1.0 | Hugging Face |
| Qwen3.8-27B (modelo base) | 27,3B (aprox.) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-GGUF (Unsloth) | 27,3B (aprox.) | no disponible | no disponible | Apache 2.0 (modelo base) | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que la información proporcionada no incluye datos de benchmarks frente a modelos de otros desarrolladores. El modelo base Qwen3.8-27B y su versión GGUF de Unsloth son las alternativas directas; la ventaja de esta publicación es la optimización específica para gfx1030 y los drafters incluidos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada. Al ser un fine-tuning de Qwen3.8-27B, hereda los sesgos del modelo base, pero no se documentan específicamente.
- Riesgo de alucinación: no cuantificado en la información disponible. Como todo modelo generativo de 27B, presenta riesgo de generar contenido plausible pero incorrecto, especialmente en contextos largos.
- Limitaciones de contexto o idioma: la ventana recomendada es de 64k tokens; aunque se miden velocidades hasta 128k, no se especifica la calidad de la recuperación a esa profundidad. Los idiomas soportados no están documentados.
- Restricciones de licencia: la Swift Open License v1.0 limita el uso comercial a organizaciones con facturación anual inferior a 1.000.000 USD. Por encima de ese umbral se requiere una licencia enterprise de UkisAI. Los tres archivos del repositorio (modelo y drafters) contienen pesos de Swift y están sujetos a esta licencia, aunque los cuerpos de los drafters (z-lab y Unsloth) son Apache 2.0.
- Dependencia de un fork de llama.cpp: el drafter MTP con vocabulario reducido y el parámetro `--spec-draft-temp` no están en llama.cpp upstream, por lo que se requiere el fork `sixvolts/llama-navi21-furnace`. El modelo principal sí es GGUF estándar.
- Optimización específica para gfx1030: las elecciones de cuantización (Q4_K en lugar de IQ) y los drafters están calibrados para Navi 21. En otras arquitecturas el rendimiento puede diferir y no se proporcionan métricas.
- Cobertura del vocabulario del drafter: el vocabulario reducido cubre el 98,9% de la salida en texto de validación; el 1,1% restante no puede ser propuesto por el drafter, lo que puede reducir la aceleración en dominios muy específicos.
- Advertencia de producción: la licencia "other" con nombre personalizado requiere revisión legal antes de un despliegue comercial, especialmente para organizaciones cercanas al umbral de facturación.

## Enlaces

- Hugging Face: https://huggingface.co/SixVolts/Swift-Qwen3.8-27B-GGUF
- Modelo base (UkisAI): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp: https://github.com/sixvolts/llama-navi21-furnace
- Scripts de despliegue: https://github.com/sixvolts/llama-navi21-furnace/tree/main/deploy
- Script de reconstrucción: https://github.com/sixvolts/llama-navi21-furnace/blob/main/deploy/scripts/make-models.sh
- Drafter DFlash2 (z-lab): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Drafter MTP (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Contacto de licencias UkisAI: https://ukisai.com/contact
