# Lucas989/reax-g2-w2s16a

## Resumen

Reax G2 W2S16A es un modelo de lenguaje publicado en Hugging Face por el usuario Lucas989 bajo licencia Apache 2.0. El identificador del repositorio, `reax-g2-w2s16a`, sugiere una variante de la familia Reax con configuración "G2", "W2" y "S16A", aunque no se dispone de documentación oficial que explique el significado de estas etiquetas. El tag `gemma4` en el repositorio indica una posible relación con la arquitectura Gemma de Google, si bien no se confirma en la información disponible.

El modelo cuenta con 31.273.088.876 parámetros totales según los pesos en formato safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 31 mil millones de parámetros. El tamaño del repositorio es de 62,6 GB, coherente con pesos en precisión de 16 bits (bf16 o fp16). El acceso está restringido mediante gating, por lo que es necesario aceptar condiciones en Hugging Face antes de poder descargarlo.

La relevancia de esta ficha es limitada por la escasez de información pública: no se han publicado resultados de benchmarks, ni detalles de entrenamiento, ni especificaciones de contexto. Se trata de un modelo recién creado (28 de noviembre de 2026) sin descargas ni interacciones registradas, lo que sugiere que es un artefacto experimental o un fine-tuning no documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `gemma4` sugiere arquitectura tipo Gemma, sin confirmar) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. El tag `gemma4` presente en el repositorio apunta a una posible base Gemma de cuarta generación, pero no hay documentación que confirme si se trata de un fine-tuning, una destilación o un modelo entrenado desde cero. Tampoco se conocen detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

El nombre `reax-g2-w2s16a` podría codificar parámetros de configuración (por ejemplo, número de capas, anchura o estrategia de atención), pero no existe información pública que permita interpretarlo con rigor. Cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, MoE) sería especulativa y no se incluye.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de 31 mil millones de parámetros, aunque no verificada por el autor.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación e investigación: al ser un modelo sin documentación pública, su uso principal sería la evaluación comparativa frente a otros modelos de tamaño similar en entornos de investigación controlados.
- Fine-tuning específico de dominio: sus 31 mil millones de parámetros permiten adaptarlo a tareas concretas (clasificación, extracción de información) mediante ajuste supervisado, siempre que se valide su calidad base.
- Generación de texto en pipelines internos: podría integrarse en flujos de generación de contenido no crítico tras una evaluación exhaustiva de calidad y sesgos.
- Pruebas de infraestructura de despliegue: útil para validar configuraciones de vLLM o TGI con modelos de ~31B en GPUs de 80 GB.
- Comparación de arquitecturas: si se confirma la base Gemma, serviría para estudiar el efecto de fine-tunings sobre dicha familia.
- Docencia y formación: como ejemplo de modelo publicado sin documentación, útil para enseñar buenas prácticas de model cards y reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62,6 GB de pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para contexto corto.
- VRAM estimada en cuantización 8 bits: alrededor de 32-35 GB.
- VRAM estimada en cuantización 4 bits: alrededor de 18-20 GB (no se han publicado cuantizaciones oficiales).
- GPU recomendadas: A100 80 GB, H100 80 GB para precisión completa; RTX 4090 (24 GB) solo viable con cuantización 4 bits agresiva y contexto reducido.
- Cabe en GPU de consumo: posible en RTX 4090 o RTX 3090 únicamente con cuantización de 4 bits y ventanas de contexto pequeñas, sujeto a validación.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión). No se han publicado configuraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Reax G2 W2S16A | 31,27 B | no disponible | Apache 2.0 | Gated en Hugging Face |
| Gemma 2 27B | 27 B | 8.192 tokens | Gemma License | Pública |
| Qwen2.5 32B | 32,5 B | 131.072 tokens | Apache 2.0 | Pública |
| Mistral Small 24B | 24 B | 32.768 tokens | Apache 2.0 | Pública |

La comparativa se basa únicamente en el tamaño de parámetros; no hay datos de rendimiento del modelo Reax que permitan una comparación cualitativa.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre entrenamiento, datos, sesgos o evaluación.
- Riesgo elevado de alucinación y comportamiento impredecible al no existir validación pública.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación dificulta evaluar riesgos legales o de calidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad.
- Sin cuantizaciones oficiales publicadas: el uso en hardware de consumo requiere conversión manual.
- Idiomas y contexto desconocidos: no se puede garantizar soporte multilingüe ni ventanas largas.
- Modelo sin descargas ni likes: no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Lucas989/reax-g2-w2s16a
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
