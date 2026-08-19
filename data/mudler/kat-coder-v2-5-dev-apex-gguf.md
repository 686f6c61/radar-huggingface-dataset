# mudler/KAT-Coder-V2.5-Dev-APEX-GGUF

## Resumen

KAT-Coder-V2.5-Dev-APEX-GGUF es una colección de cuantizaciones GGUF del modelo KAT-Coder-V2.5-Dev, desarrollado por Kwaipilot, un modelo de lenguaje especializado en codificación agéntica (agentic coding) con arquitectura Mixture-of-Experts (MoE). Estas cuantizaciones han sido producidas por mudler, del equipo LocalAI, utilizando la técnica APEX (Adaptive Precision for EXpert Models), que optimiza la precisión según el rol de cada tensor dentro de la arquitectura MoE. El modelo base está entrenado para actuar de forma autónoma dentro de repositorios ejecutables reales, en lugar de limitarse a generar código en una sola pasada.

Con 34,66 mil millones de parámetros totales y 256 expertos enrutados (8 activos por token), el modelo ofrece capacidades avanzadas de razonamiento y generación de código. La versión cuantizada en GGUF permite ejecutarlo en hardware local con requisitos de VRAM reducidos respecto al original, manteniendo un equilibrio entre calidad y consumo de recursos. El repositorio cuenta con más de 350.000 descargas y 43 likes, lo que refleja su adopción en la comunidad de desarrollo local.

La relevancia actual de este modelo radica en la tendencia hacia asistentes de código autónomos que pueden navegar repositorios, editar archivos y ejecutar pruebas, algo que KAT-Coder-V2.5-Dev aborda mediante un framework de post-entrenamiento agéntico documentado en su informe técnico. La disponibilidad de cuantizaciones APEX lo hace accesible para desarrolladores con GPUs de consumo, ampliando su uso en entornos de desarrollo locales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (Mixture-of-Experts) |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | 8 expertos activos por token (no se especifica el número exacto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | APEX (perfiles: I-Balanced, I-Quality, Quality, Balanced, I-Compact, Compact, I-Mini) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base KAT-Coder-V2.5-Dev emplea una arquitectura MoE derivada de Qwen3, con 40 capas, 256 expertos enrutados y 1 experto compartido, de los cuales 8 expertos se activan por token. La atención es híbrida: se aplica atención completa en cada cuarta capa, con 16 cabezas de atención y 2 cabezas KV. Según el informe técnico (arXiv:2607.05471), el entrenamiento se centró en un framework de post-entrenamiento agéntico de extremo a extremo, abordando la escasez de entornos reproducibles, recompensas verificables y trayectorias de alta calidad como cuellos de botella principales.

La cuantización APEX, desarrollada por el equipo LocalAI, clasifica los tensores por su rol (experto enrutado, experto compartido, atención) y aplica un gradiente de precisión por capas: las capas de borde (primeras y últimas 5) reciben mayor precisión, mientras que las capas intermedias se comprimen más agresivamente. Las variantes con prefijo "I" utilizan calibración imatrix diversa (chat, código, razonamiento, tool-calling, trazas agénticas y Wikipedia). Esta estrategia aprovecha que en los modelos MoE los tensores FFN de los expertos enrutados dominan el presupuesto de pesos, pero solo ~8 de 256 expertos se activan por token.

## Capacidades

- Generación de código y razonamiento agéntico: el modelo está entrenado para actuar de forma autónoma dentro de repositorios ejecutables, no solo para generar fragmentos de código.
- Soporte de tool calling y agentic coding: indicado en las etiquetas del modelo, lo que permite integración con herramientas y flujos de trabajo multi-paso.
- Capacidades multilingües: soporta inglés y chino (en, zh).
- Solo texto: aunque la configuración anuncia un token de imagen, el checkpoint liberado no incluye pesos de vision encoder, por lo que las cuantizaciones GGUF son exclusivamente de texto (sin mmproj).
- Compatible con la API de LocalAI y el ecosistema llama.cpp.

## Casos de uso

- Desarrollo de software autónomo: el modelo puede navegar un repositorio, identificar archivos relevantes, realizar ediciones y ejecutar pruebas, gracias a su entrenamiento agéntico. Adecuado para tareas de mantenimiento de código en proyectos medianos.
- Asistente de programación en IDE: integrable como backend en editores como VS Code o Neovim mediante LocalAI o llama.cpp, proporcionando autocompletado contextual y sugerencias de refactorización con bajo consumo de VRAM en perfiles Compact o Mini.
- Revisión de código automatizada: puede analizar pull requests, detectar posibles errores, sugerir mejoras y generar resúmenes de cambios, aprovechando su capacidad de razonamiento sobre código existente.
- Resolución de issues en repositorios: el modelo puede interpretar una descripción de issue, localizar el código relacionado y proponer una solución, reduciendo el tiempo de triaje en equipos de desarrollo.
- Generación de documentación técnica: a partir del código fuente, puede crear comentarios, docstrings y documentación de API en inglés o chino, con coherencia contextual gracias a su ventana de contexto (longitud no especificada).
- Automatización de pipelines CI/CD: con soporte de tool calling, el modelo puede integrarse en flujos de integración continua para generar scripts de build, corregir errores de compilación o actualizar dependencias, aunque se requiere validación humana por riesgo de alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El informe técnico del modelo base (arXiv:2607.05471) podría contener métricas, pero no se dispone de ellas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: el modelo sin cuantizar requiere aproximadamente 69,7 GB según LLM Explorer. Las cuantizaciones APEX reducen este requisito, aunque no se especifican valores exactos por perfil. Los perfiles Compact y Mini están diseñados para GPUs de consumo, mientras que Balanced y Quality requieren hardware de gama alta.
- GPUs recomendadas: para perfiles Balanced y Quality se recomiendan GPUs con 24 GB o más (RTX 3090/4090, A100, H100). Para Compact y Mini, GPUs con 12-16 GB (RTX 3080/4070) pueden ser suficientes, aunque no hay confirmación oficial.
- El autor indica que su hardware de referencia es una NVIDIA DGX Spark con 122 GB de memoria unificada, capaz de ejecutar MoEs de 30-50B.
- Opciones de despliegue: LocalAI (comando `local-ai run mudler/KAT-Coder-V2.5-Dev-APEX-GGUF@KAT-Coder-V2.5-Dev-APEX-I-Balanced.gguf`), llama.cpp (base del proyecto), y potencialmente vLLM u Ollama (no confirmado en la documentación).
- Latencia y throughput: no se proporcionan datos específicos; dependerán del perfil de cuantización y del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos similares en la información proporcionada. Como referencia arquitectónica, KAT-Coder-V2.5-Dev se basa en Qwen3 y comparte características con otros MoE de codificación como Qwen3-30B-A3B o DeepSeek-Coder-V2-Lite, pero no se pueden establecer comparaciones cuantitativas sin datos de benchmarks.

## Limitaciones y advertencias

- El modelo es solo de texto: a pesar de que la configuración anuncia un token de imagen, el checkpoint no incluye pesos de visión, por lo que no puede procesar entradas multimodales.
- Idiomas limitados: soporta únicamente inglés y chino; el rendimiento en otros idiomas puede ser deficiente.
- Riesgo de alucinación en código: como todo modelo generativo, puede producir código sintácticamente válido pero lógicamente incorrecto, especialmente en tareas complejas. Se recomienda validación humana en entornos de producción.
- Degradación por cuantización: los perfiles APEX comprimen las capas intermedias de los expertos enrutados, lo que puede afectar la calidad en tareas que requieren conocimiento profundo distribuido en múltiples expertos.
- Requisitos de hardware: los perfiles de alta calidad (Quality, I-Quality) pueden requerir más de 40 GB de VRAM, lo que limita su uso a estaciones de trabajo o servidores con GPUs profesionales.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base y del proyecto APEX para confirmar cualquier restricción adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mudler/KAT-Coder-V2.5-Dev-APEX-GGUF
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Informe técnico del modelo base: https://arxiv.org/abs/2607.05471
- Proyecto APEX: https://github.com/mudler/apex-quant
- Informe técnico de APEX: https://github.com/mudler/apex-quant/blob/main/paper/APEX_Technical_Report.pdf
- LocalAI: https://github.com/mudler/LocalAI
- Video de prueba (YouTube): https://www.youtube.com/watch?v=CCWbCYSdDTc
