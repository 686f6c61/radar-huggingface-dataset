# keXjos/Huihui-Ornith-1.5-9B-abliterated-mlx-5Bit

## Resumen

El modelo `keXjos/Huihui-Ornith-1.5-9B-abliterated-mlx-5Bit` es una conversión a formato MLX (5-bit) de `huihui-ai/Huihui-Ornith-1.5-9B-abliterated`, que a su vez es una versión "abliterated" (eliminación de rechazos de seguridad) del modelo Ornith-1.5-9B, perteneciente a la familia Ornith-1.5 desarrollada por DeepReinforce (también referida como Ornith AI). Según la información pública, Ornith-1.5 es una familia de modelos que abarca 9B, 35B y 397B (MoE), con licencia MIT, y que según la empresa rinde a la par de Claude Opus 4.8 en tareas de razonamiento, código y agénticas.

Esta versión concreta está pensada para ejecutarse en Apple Silicon mediante la librería `mlx-lm`. El repositorio pesa 6.2 GB y el archivo de pesos (safetensors) indica 1.679.700.480 parámetros, una cifra notablemente inferior a los 9B que sugiere el nombre. Esta discrepancia no está explicada en la documentación disponible; podría tratarse de un modelo podado, destilado o de un error en el etiquetado. El pipeline declarado es `text-generation`, aunque el tag `image-text-to-text` sugiere que el modelo original podría ser multimodal, pero esta conversión MLX solo maneja texto.

La relevancia de este modelo radica en ofrecer una versión "sin censura" (uncensored) de un modelo de razonamiento, en un formato ligero y optimizado para hardware Apple, lo que permite experimentar con modelos abliterated localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag sugiere qwen3_5, no confirmado) |
| Parametros totales | 1.679.700.480 (segun safetensors; el nombre indica 9B, discrepancia sin explicar) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit (MLX) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna de esta conversión MLX. El tag `qwen3_5` sugiere que el modelo base podría estar basado en la arquitectura Qwen3.5, pero no hay confirmación oficial. El modelo original Ornith-1.5 se describe en la web de Ornith AI como un modelo que implementa un bucle de auto-mejora: propone nuevas tareas, genera scaffolds específicos y produce rollouts para aprendizaje por refuerzo. Sin embargo, no se publican detalles técnicos concretos (número de capas, atención, etc.) en la información proporcionada.

El proceso de "abliteration" aplicado por `huihui-ai` elimina los mecanismos de rechazo del modelo original, dando como resultado una versión "uncensored" que no filtra contenido según políticas de seguridad. La conversión a MLX se realizó con `mlx-lm` versión 0.31.2, según la model card.

## Capacidades

- Generacion de texto conversacional: el modelo puede mantener diálogos multi-turno, como se muestra en el ejemplo de uso de la model card.
- Razonamiento y codigo: segun la informacion publica de Ornith-1.5, la familia destaca en tareas de razonamiento, codigo y agentes, aunque no hay benchmarks especificos para esta version MLX.
- Sin censura (uncensored): gracias al proceso de abliteration, el modelo no aplica rechazos de seguridad, lo que permite generar contenido que otros modelos filtrarian.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y multi-step reasoning: no confirmado para esta version.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: el tag `image-text-to-text` sugiere que el modelo original podria procesar imagenes, pero esta conversion MLX solo maneja texto (pipeline text-generation).

## Casos de uso

- Chatbots locales en macOS: gracias a su formato MLX y tamaño reducido (6.2 GB), puede desplegarse en un Mac con Apple Silicon para asistencia conversacional sin conexion, usando `mlx-lm`.
- Experimentacion con modelos abliterated: investigadores y desarrolladores interesados en estudiar el comportamiento de modelos sin filtros de seguridad pueden usar esta version para analizar sesgos, alucinaciones o limites eticos.
- Generacion de contenido creativo sin restricciones: redaccion de ficcion, guiones o material que requiera explorar temas sensibles sin censura automatica.
- Prototipado rapido de aplicaciones de texto: al ser un modelo pequeno (1.68B reales), es adecuado para pruebas locales de generacion de texto en entornos con recursos limitados.
- Educacion y divulgacion: para demostrar tecnicas de cuantizacion MLX y conversion de modelos, asi como el efecto del abliteration en el comportamiento del modelo.
- Integracion en pipelines de generacion de texto en entornos Apple: puede usarse como backend para herramientas de productividad que requieran generacion de lenguaje natural sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La web de Ornith AI menciona que la familia Ornith-1.5 rinde a la par de Claude Opus 4.8 en razonamiento, codigo y tareas agenticas, pero no se proporcionan numeros concretos ni se especifica si esa afirmacion aplica a esta version MLX 5-bit. No se deben inferir datos no verificados.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MLX 5-bit de ~1.68B parametros, el uso de memoria en Apple Silicon sera inferior al tamano del repo (6.2 GB). Se estima que cabe en Macs con al menos 8 GB de RAM unificada, aunque se recomienda 16 GB para mayor comodidad.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con suficiente RAM unificada. No requiere GPU dedicada.
- Si cabe en consumer GPU: no aplica, ya que MLX esta disenado exclusivamente para Apple Silicon.
- Opciones de despliegue: `mlx-lm` (pip install mlx-lm) es la via principal. Tambien podria usarse con otros frameworks que soporten MLX, pero no se mencionan alternativas.
- Latencia y throughput: no disponibles. Dependera del chip concreto y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoria. El modelo base Ornith-1.5-9B podria compararse con otros modelos de 9B como Llama-3.1-8B o Qwen-2.5-7B, pero no hay datos de rendimiento para esta version MLX. Ademas, la discrepancia en el numero de parametros (1.68B reales vs 9B nominales) dificulta cualquier comparacion directa. Se indica "no disponible".

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre del modelo indica 9B, pero los pesos reales suman 1.679.700.480 parametros (~1.68B). Esta diferencia no esta documentada y podria deberse a un error de etiquetado, a una poda o a una destilacion. Los usuarios deben ser conscientes de que el modelo es mucho mas pequeno de lo que sugiere su nombre.
- Contenido sin censura: al ser una version abliterated, el modelo puede generar contenido inapropiado, ofensivo o peligroso. No debe usarse en aplicaciones donde se requiera moderacion de contenido.
- Riesgo de alucinacion: al ser un modelo pequeno, es probable que presente alucinaciones frecuentes, especialmente en tareas de razonamiento complejo o hechos especificos.
- Limitaciones de contexto: no se conoce la longitud de contexto soportada; se recomienda probar con secuencias cortas.
- Idiomas: no se especifican idiomas soportados; probablemente el modelo base fue entrenado principalmente en ingles, pero no hay confirmacion.
- Licencia MIT: permite uso comercial, pero se debe verificar la licencia del modelo base original (Ornith-1.5) y de la version abliterated de huihui-ai. La model card indica MIT, pero conviene revisar los terminos exactos.
- Formato MLX: solo funciona en Apple Silicon; no es portable a otras plataformas sin conversion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keXjos/Huihui-Ornith-1.5-9B-abliterated-mlx-5Bit
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- Coleccion Ornith-1.5 en HuggingFace: https://huggingface.co/collections/ornith-ai/ornith-15
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Articulo de OfficeChai sobre Ornith-1.5: https://officechai.com/ai/deepreinforce-releases-open-source-orinth-1-5-family-of-models-with-solid-benchmarks-and-mit-license/
