# ArchiveStudio/MiniCPM5-2B

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de 2.500 millones de parametros desarrollado por OpenBMB y publicado en HuggingFace bajo la cuenta ArchiveStudio. Es el segundo modelo de la serie MiniCPM5, sucesor de MiniCPM5-1B, y replica a mayor escala la misma receta de entrenamiento. Esta diseñado especificamente para despliegue en dispositivo (on-device), ejecucion local y entornos con recursos limitados.

El modelo se presenta como estado del arte en su clase de tamano (2B) entre los modelos open source, siendo competitivo incluso con modelos de clase 4B en tareas de codigo, matematicas, comprension de contexto largo, uso de herramientas y tareas agentivas. Su arquitectura base es de tipo Llama (transformer denso), con soporte de tool calling y contexto largo.

Su relevancia actual radica en la demanda creciente de modelos pequenos y eficientes para edge AI: ofrece capacidades agentivas y de razonamiento tipicas de modelos mayores en un formato ejecutable en hardware de consumo, con licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura tipo Llama) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (se anuncia "long-context" sin cifra concreta) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 5,0 GB, presumiblemente bf16/fp16) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un transformer denso con arquitectura base Llama (según la etiqueta `llama` del repositorio), lo que garantiza compatibilidad con el amplio ecosistema de herramientas de inferencia existente. No es un modelo MoE: todos los parametros estan activos en cada pasada, lo que simplifica el despliegue y hace el coste por token predecible.

El entrenamiento sigue la receta de la serie MiniCPM (documentada en el tech report de MiniCPM, arXiv:2506.07900) escalada desde MiniCPM5-1B. Los datasets publicados en la model card incluyen Ultra-FineWeb, UltraX-Preview y Ultra-FineWeb-L3 para preentrenamiento, y UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609 para las fases de SFT y aprendizaje por refuerzo, con foco en matematicas, codigo y capacidades agentivas. El numero total de tokens de entrenamiento no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`)
- Razonamiento en codigo y matematicas, con datasets dedicados en ambas fases de SFT y RL
- Comprension de contexto largo (etiquetado `long-context`; cifra exacta no disponible)
- Tool calling / function calling (etiqueta `tool-calling`)
- Capacidades agenticas y razonamiento multi-paso (dataset UltraData-SFT-Agent y fase RL dedicada)
- Soporte bilingue ingles/chino
- Optimizado para ejecucion en dispositivo y edge AI (etiquetas `on-device`, `edge-ai`)
- Sin capacidades multimodales: es un modelo de texto puro

## Casos de uso

- **Asistentes locales en portatiles y moviles**: con ~2,5B de parametros y 5 GB en pesos, puede ejecutarse en hardware de consumo sin servidor remoto, adecuado para asistentes offline que preservan la privacidad del usuario.
- **Agentes con tool calling en el borde**: el entrenamiento con UltraData-SFT-Agent y RL agentico lo hace adecuado para pipelines de agentes que invocan funciones o APIs en dispositivos con recursos limitados.
- **Generacion y revision de codigo en IDEs**: el dataset UltraData-Code sugiere buen rendimiento en completado y razonamiento sobre codigo, utilizable como asistente de programacion local integrado en editores.
- **Resolucion de problemas matematicos**: entrenado con UltraData-Math, puede emplearse como solucionador de problemas aritmeticos y de razonamiento matematico en aplicaciones educativas.
- **Procesamiento de documentos largos**: la etiqueta long-context permite resumir o analizar documentos extensos, aunque la ventana exacta deberia verificarse antes de produccion.
- **Atencion al cliente automatizada en chino e ingles**: soporte bilingue y entrenamiento conversacional lo hacen viable para chatbots multi-turno en mercados de ambos idiomas.
- **Prototipado e investigacion**: licencia Apache 2.0 y pesos abiertos permiten su uso sin restricciones en proyectos comerciales y academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con numeros concretos en la informacion disponible. La model card afirma que el modelo alcanza SOTA open source en su clase de 2B, que es competitivo con modelos de clase 4B, y que destaca sobre modelos de tamano comparable en codigo, matematicas, contexto largo, uso de herramientas y tareas agentivas, pero no incluye tablas de puntuaciones (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): ~5 GB de pesos mas overhead de KV cache; ~6-8 GB de VRAM es una estimacion razonable para contextos moderados (cifra no confirmada oficialmente).
- Con cuantizacion (no disponible oficialmente en el repo, pero habitual via GGUF): podria funcionar en GPUs de 4-6 GB o incluso en CPU con RAM suficiente.
- Consumer GPUs: con pesos en bf16 cabe en una RTX 3060 de 12 GB o RTX 4060 Ti de 8/16 GB; con cuantizacion, en GPUs de 4-6 GB.
- GPUs de datacenter: cualquier GPU moderna (A100, L4, T4) es mas que suficiente; no se requiere H100.
- Despliegue: la arquitectura Llama y el formato safetensors permiten usar transformers, vLLM, llama.cpp (tras conversion a GGUF), Ollama y TGI; el repo esta etiquetado `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| MiniCPM5-2B | 2,5B | Transformer denso (Llama) | No disponible (long-context) | Apache 2.0 |
| Qwen2.5-1.5B-Instruct | 1,5B | Transformer denso | 128K | Apache 2.0 |
| Gemma 2 2B | 2,6B | Transformer denso | 8K | Gemma license (restricciones) |
| Llama 3.2 3B | 3,2B | Transformer denso | 128K | Llama Community License |

MiniCPM5-2B compite en la gama de 1,5-3B con Qwen2.5, Gemma 2 y Llama 3.2. Frente a Gemma 2 2B ofrece una licencia permisiva (Apache 2.0 frente a la licencia con condiciones de Gemma). Frente a Qwen2.5-1.5B y Llama 3.2 3B, la model card reivindica ventajas en codigo, matematicas, tool calling y tareas agentivas, aunque sin cifras publicas comparables en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser entrenado principalmente con datos en ingles y chino, el rendimiento en castellano y otros idiomas puede ser significativamente inferior.
- Riesgo de alucinacion: inherente a modelos de 2B; el tamano reducido limita la fiabilidad factual en dominios de conocimiento general.
- Longitud de contexto: se anuncia long-context pero la cifra exacta no esta disponible; verificar antes de usar en produccion con documentos largos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes.
- Es un modelo de texto puro: sin capacidades de vision ni audio.
- Repositorio publicado por ArchiveStudio (no directamente por la cuenta oficial openbmb), con pocas descargas registradas (319); conviene validar su procedencia y comparar con la version oficial de openbmb antes de uso en produccion.
- Sin benchmarks numericos publicados en la model card: las afirmaciones de SOTA no pueden verificarse de forma independiente con la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/ArchiveStudio/MiniCPM5-2B
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- Paper (arXiv): https://arxiv.org/abs/2602.09003
- GitHub Repo: https://github.com/OpenBMB/MiniCPM
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- MiniCPM5-1B (predecesor): https://huggingface.co/openbmb/MiniCPM5-1B
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- README en chino: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md
