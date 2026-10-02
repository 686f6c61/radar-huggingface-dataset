# lugman-madhiai/Qwen3.5-2B-TauKnowledge-CS-SFT-Split-01

## Resumen

Qwen3.5-2B-TauKnowledge-CS-SFT-Split-01 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-2B, publicado por el usuario lugman-madhiai en Hugging Face. El modelo cuenta con 2.274.069.824 parametros y un repositorio de 4,6 GB, lo que corresponde a pesos en precision completa (FP16/BF16) almacenados en formato safetensors. La nomenclatura del identificador sugiere un entrenamiento orientado a inyectar conocimiento de dominio (CS, probablemente "computer science") mediante un split parcial del dataset, aunque la model card no detalla la composicion de los datos.

El modelo base Qwen3.5-2B pertenece a la serie Qwen3.5 de Alibaba Cloud, descrita por el fabricante como una familia multilingue con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3. La etiqueta de pipeline "image-text-to-text" apunta a que el modelo base podria aceptar entradas multimodales (imagen y texto), si bien la model card del ajuste fino no documenta esta capacidad de forma explicita.

El ajuste se ha realizado con Unsloth y la libreria TRL de Hugging Face, segun indica el propio autor, lo que implica un entrenamiento optimizado en memoria y aproximadamente el doble de rapido que un pipeline convencional. La relevancia actual del modelo reside en su tamano reducido (2B), que lo hace apto para inferencia en GPU de consumo y entornos con recursos limitados, con licencia Apache 2.0 para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-2B, familia transformer; sin detalle en la model card) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en FP16/BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card del ajuste. El modelo hereda la arquitectura del base Qwen/Qwen3.5-2B, de la serie Qwen3.5 de Alibaba Cloud, que segun la documentacion publica del fabricante es una familia multilingue con mejoras en razonamiento y seguimiento de instrucciones. No se especifica si emplea atencion lineal, decodificacion especulativa ni otras innovaciones. El pipeline declarado es image-text-to-text, lo que sugiere capacidad multimodal de entrada, pero no se aporta confirmacion tecnica.

El entrenamiento es un ajuste fino supervisado (SFT) realizado con Unsloth y la libreria TRL de Hugging Face. El autor indica que el entrenamiento fue "2 veces mas rapido" gracias a Unsloth. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas adicionales de RLHF, DPO o preferencia. La nomenclatura "TauKnowledge-CS-SFT-Split-01" sugiere un ajuste orientado a conocimiento de dominio (CS) sobre un split parcial, pero esta interpretacion no esta confirmada en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y "text-generation-inference".
- Ajuste sobre conocimiento de dominio: el identificador sugiere una inyeccion de conocimiento tecnico (CS), si bien no se documenta el contenido exacto.
- Potencial entrada multimodal: la etiqueta de pipeline "image-text-to-text" indica posible soporte de imagenes como entrada, no confirmado en la model card del ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado para este ajuste; el mismo autor publica variantes "SearchAgent", lo que sugiere trabajos relacionados, pero no se atribuye a este modelo.
- Capacidades multilingues: la metadata declara unicamente ingles (en).
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.

## Casos de uso

- Asistente conversacional ligero en ingles: puede desplegarse como chatbot de proposito general sobre GPU de consumo, con 2B parametros y pesos en FP16 que ocupan unos 4,6 GB.
- Asistencia tecnica de dominio CS: si el ajuste confirma su orientacion a conocimiento informatico, podria usarse como apoyo en preguntas de programacion, conceptos de sistemas o fundamentos de computacion.
- Generacion de texto en pipelines de IA locales: integrable en aplicaciones de escritorio o edge con herramientas como llama.cpp (previa conversion a GGUF) u Ollama.
- Prototipado rapido de productos: por su licencia Apache 2.0, sirve para validar ideas comerciales sin coste de licencia ni dependencia de APIs externas.
- Investigacion sobre SFT y ajuste con Unsloth: util como referencia para estudiar recetas de ajuste eficiente en modelos de 2B y comparar variantes del mismo autor (SearchAgent, Knowledge).
- Evaluacion comparativa de modelos pequenos: apropiado como baseline en experimentos academicos frente a otros modelos de 1-3B en tareas de generacion y conocimiento.
- Despliegue en hardware embebido o movil: el tamano (2B) es compatible con kits de inferencia en dispositivo como los publicados por Qualcomm AI Hub para la serie Qwen3.5-2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,6 GB de pesos mas overhead de activaciones y cache KV.
- VRAM estimada para cuantizacion INT8: alrededor de 2,3-2,5 GB.
- VRAM estimada para cuantizacion INT4: alrededor de 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4090); en entornos de servidor, A10G, L4, A100 o H100.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus especificaciones publicas y se ofrecen como referencia orientativa; no se dispone de resultados de benchmark comparativos en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-2B-TauKnowledge-CS-SFT-Split-01 (este) | 2,27B | no disponible | Apache 2.0 | Hugging Face |
| Qwen3-1.7B | 1,7B | 32K (ampliable) | Apache 2.0 | Hugging Face |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 Community License | Hugging Face |
| Gemma-2-2B | 2B | 8K | Gemma Terms of Use | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de un modelo base entrenado principalmente en ingles, es probable que reproduzca sesgos presentes en ese corpus.
- Riesgo de alucinacion: inherente a modelos de 2B parametros, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Restricciones de idioma: la metadata declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: se desconoce la longitud de ventana efectiva, lo que limita el diseno de aplicaciones con contexto largo.
- Licencia comercial: Apache 2.0 permite uso comercial, pero el usuario debe verificar que el modelo base Qwen3.5-2B mantiene la misma licencia y condiciones.
- Ausencia de benchmarks: no hay evaluaciones publicadas; su calidad real frente a otros modelos de la misma categoria no puede verificarse a partir de la informacion disponible.
- Repositorio con 0 descargas y 0 likes: no existe validacion por parte de la comunidad ni evidencia de uso en produccion.
- Formato: solo se distribuyen pesos safetensors; no hay versiones GGUF, AWQ ni GPTQ publicadas, lo que complica el despliegue en entornos CPU o cuantizados.
- Entrenamiento: al no detallarse el dataset del SFT, no se puede auditar el origen, la calidad ni las posibles contaminaciones de los datos de ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-TauKnowledge-CS-SFT-Split-01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL: https://github.com/huggingface/trl
- Variante del autor Qwen3.5-2B-SearchAgent-SFT-01: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-01
- Variante del autor Qwen3.5-2B-SearchAgent-SFT-02: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-02
- Repositorio GitHub de la serie Qwen3.5: https://github.com/wendashi/Qwen3.5
- Ficha del modelo Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Entrada en LLM Explorer para la variante SearchAgent: https://llm-explorer.com/model/lugman-madhiai%2FQwen3.5-2B-SearchAgent-SFT-01,21ViEDEiq86NczoQRxVP9y
