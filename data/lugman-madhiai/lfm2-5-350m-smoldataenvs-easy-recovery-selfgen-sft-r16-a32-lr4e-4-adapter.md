# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-Recovery-SelfGen-SFT-r16-a32-lr4e-4-adapter

## Resumen

Este repositorio contiene un adaptador LoRA (no un modelo completo) afinado sobre LiquidAI/LFM2.5-350M, un modelo de lenguaje de 350 millones de parámetros desarrollado por Liquid AI. El adaptador ha sido entrenado por el usuario lugman-madhiai mediante SFT (supervised fine-tuning) con Unsloth y TRL, con un rango de LoRA de 16, alpha de 32 y tasa de aprendizaje de 4e-4, tal como indica el propio nombre del repositorio. El nombre sugiere un entrenamiento orientado a entornos de datos sintéticos ("SmolDataEnvs") con recuperación fácil y generación propia de datos ("SelfGen").

La relevancia de esta ficha es limitada: se trata de un artefacto experimental de un autor individual, sin descargas ni interacciones, publicado el 1 de noviembre de 2026 y sin model card sustantiva más allá de los metadatos de entrenamiento. No se documentan datos de entrenamiento, composición del dataset, resultados de evaluación ni hiperparámetros completos, por lo que su utilidad en producción es cuestionable sin una validación previa por parte del usuario.

El modelo base LFM2.5-350M pertenece a la familia LFM2 de Liquid AI, una arquitectura híbrida diseñada para eficiencia en dispositivos de borde. No obstante, la información proporcionada no incluye especificaciones detalladas del modelo base, por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5-350M de Liquid AI; adaptador LoRA sobre transformer) |
| Parametros totales | 350M (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base en formato transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM2.5-350M, un modelo de la familia LFM2 de Liquid AI. La arquitectura exacta del modelo base no se detalla en la información proporcionada; la familia LFM2 se caracteriza por diseños híbridos orientados a eficiencia, pero no se confirma en los datos disponibles. El adaptador es un LoRA con rango 16 y alpha 32, entrenado con Unsloth (que según el autor permitió un entrenamiento "2x más rápido") y TRL.

El entrenamiento consistió en SFT (supervised fine-tuning) con una tasa de aprendizaje de 4e-4. El nombre del repositorio indica que los datos provienen de "SmolDataEnvs" con "Easy Recovery" y "SelfGen", lo que sugiere un pipeline de generación de datos sintéticos y entrenamiento en entornos de recuperación sencilla, pero no se aporta ninguna descripción del dataset, número de tokens, composición ni proceso de alineamiento adicional (RLHF/DPO). No se documentan innovaciones técnicas más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base LFM2.5-350M.
- Afinamiento específico para tareas de "recuperación fácil" en entornos de datos sintéticos, según el nombre del repositorio (no verificado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según los metadatos (`language: en`).
- No se documentan capacidades especiales como modo thinking, visión o audio.
- El tamaño reducido (350M) limita las capacidades de razonamiento complejo y conocimiento factual.

## Casos de uso

- Experimentación con fine-tuning de LoRA: el adaptador sirve como ejemplo reproducible de un pipeline Unsloth + TRL sobre un modelo pequeño, útil para desarrolladores que quieran replicar la receta con sus propios datos.
- Investigación en entornos sintéticos: el nombre "SmolDataEnvs-Easy-Recovery" sugiere su uso en experimentos de recuperación de información o resolución de tareas simples en entornos generados, aunque no hay documentación que lo confirme.
- Prototipado rápido en local: al ser un adaptador sobre un modelo de 350M, puede cargarse en GPUs de consumo para pruebas de concepto de generación de texto en inglés.
- Evaluación comparativa de adaptadores: útil como baseline en estudios sobre el efecto de hiperparámetros LoRA (r=16, alpha=32, lr=4e-4) en modelos pequeños.
- Generación de texto de bajo coste en inglés: para tareas simples donde no se requiera razonamiento profundo, el modelo base de 350M ofrece latencia baja en hardware modesto.
- Docencia y formación: ejemplo didáctico de publicación de un adaptador en Hugging Face con las etiquetas y metadatos mínimos requeridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 350M en fp16 requiere aproximadamente 0,7 GB de pesos; en 8 bits, unos 0,35 GB; en 4 bits, unos 0,2 GB. El adaptador LoRA añade una cantidad marginal (r=16 sobre 350M).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16, incluyendo GTX 1650, RTX 3050, RTX 4060 y superiores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU para inferencia con llama.cpp u Ollama (si se convierte el modelo base a GGUF).
- Opciones de despliegue: transformers (con PEFT para cargar el adaptador), vLLM (si se fusiona el adaptador), llama.cpp/Ollama (requiere fusión y conversión a GGUF), TGI (etiqueta `text-generation-inference` presente, pero sin configuración documentada).
- Latencia y throughput: no disponibles; dependen del hardware y del backend. En una RTX 4090 se espera un throughput alto por el tamaño reducido, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-Recovery-SelfGen-SFT-r16-a32-lr4e-4-adapter (este) | 350M + LoRA | no disponible | apache-2.0 | Hugging Face, 0 descargas | Adaptador experimental sin evaluación publicada |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | no disponible en la informacion | Hugging Face | Modelo base oficial de Liquid AI |
| SmolLM2-360M (HuggingFaceTB) | 360M | 8K (tipico en la familia) | apache-2.0 | Hugging Face, ampliamente usado | Alternativa de tamano similar con documentacion completa |
| Qwen2.5-0.5B | 500M | 32K | apache-2.0 | Hugging Face, muy popular | Mayor contexto y soporte multilingue |

La comparativa se basa en conocimiento general de la familia de modelos pequeños; los datos del modelo base LFM2.5-350M no están disponibles en la información proporcionada y podrían diferir.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos, calidad y cobertura.
- Riesgo elevado de alucinación inherente a un modelo de 350M, agravado por la falta de evaluación.
- El adaptador está entrenado únicamente en inglés (`language: en`); no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sin resultados de benchmarks ni métricas de evaluación publicadas; no se puede verificar la mejora respecto al modelo base.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- Aunque la licencia es apache-2.0 (permisiva para uso comercial), la falta de documentación sobre los datos de entrenamiento introduce incertidumbre legal sobre la procedencia de los mismos.
- El adaptador debe combinarse con el modelo base LiquidAI/LFM2.5-350M; no es un modelo autónomo.
- No se documenta el proceso de fusión del adaptador ni la compatibilidad con backends de inferencia optimizados.
- La fecha de creación (2026-11-01) y la nula actividad sugieren un artefacto de experimentación personal, no un modelo listo para producción.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-Recovery-SelfGen-SFT-r16-a32-lr4e-4-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (biblioteca de fine-tuning): https://github.com/huggingface/trl
