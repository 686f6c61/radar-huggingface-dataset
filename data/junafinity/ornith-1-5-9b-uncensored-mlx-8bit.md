# junafinity/Ornith-1.5-9B-uncensored-MLX-8bit

## Resumen

Ornith-1.5-9B-uncensored-MLX-8bit es una variante del modelo multimodal Ornith-1.5-9B de ornith-ai, publicada por el usuario junafinity. Se trata de una versión *abliterated* (eliminación de la dirección de rechazo) del modelo original, producida con la herramienta ZeroFuse y convertida a formato MLX con cuantización de 8 bits para Apple Silicon. El modelo mantiene intacta la torre de visión y las cabezas de predicción de múltiples tokens (MTP) si existieran, aplicando la abliteración únicamente sobre las proyecciones de escritura residual del decodificador.

El resultado es un modelo de ~9B parámetros que conserva las capacidades generales del base, pero con una tasa de rechazo reducida a cero en un conjunto de prueba de 64 solicitudes dañinas, manteniendo una divergencia KL muy baja (0.001668) respecto al modelo original. Esta versión está diseñada para desarrolladores e investigadores que necesitan un modelo sin restricciones de contenido para tareas de investigación, análisis de comportamientos o aplicaciones específicas, aunque con advertencias claras sobre su uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5 (tag `qwen3_5`), densa, con atención lineal y MLP (se mencionan `self_attn`, `linear_attn` y `mlp.down_proj` en la abliteración) |
| Parametros totales | 9B (aprox., según el modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 8-bit (esta variante); también existen versiones GGUF Q8_0 y bf16 del mismo modelo abliterated |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base, Ornith-1.5-9B, es un modelo denso de ~9B parámetros que forma parte de la familia Ornith-1.5, que incluye variantes MoE de 35B y 397B. La arquitectura está etiquetada como `qwen3_5`, lo que sugiere que se basa en la arquitectura Qwen3.5, con una combinación de atención estándar (`self_attn`), atención lineal (`linear_attn`) y capas MLP (`mlp.down_proj`). No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF, DPO, etc.).

La abliteración se realizó con ZeroFuse, que emplea una búsqueda multiobjetivo con Optuna TPE para co-minimizar el número de rechazos restantes y la divergencia KL con el modelo original. Se seleccionó el punto de la frontera de Pareto con una fuerza de ablación de 1.343, aplicada sobre las capas 15 a 20 de las 32 capas del decodificador. La edición de pesos es directa (`W' = W − strength · r(rᵀW)`) sin adaptadores en tiempo de inferencia. La torre de visión y las cabeceras MTP (si las hubiera) se conservan intactas por construcción, verificándose que los tensores de la torre de visión son bit-idénticos antes y después de la edición.

## Capacidades

- **Multimodal**: acepta imágenes y texto como entrada, y genera descripciones de imágenes o respuestas textuales.
- **Generación de texto**: puede producir respuestas largas y coherentes en múltiples dominios.
- **Razonamiento y codigo**: el modelo base Ornith-1.5 está diseñado para tareas de razonamiento, agente y codificación, aunque no se han publicado benchmarks específicos para esta variante.
- **Abliteracion**: no presenta rechazo ante solicitudes dañinas (en el conjunto de prueba, los rechazos pasaron de 9 a 0 en 64 casos), manteniendo un comportamiento casi idéntico en solicitudes benignas (KL 0.001668).
- **Tool calling**: no se especifica, pero el modelo base es conocido por soportar funciones en tareas de agente; no hay confirmación para esta variante.
- **Vision**: la torre de visión está preservada y funcional, como se confirma con una generación multimodal de extremo a extremo.

## Casos de uso

- **Investigacion sobre abliteracion**: analizar cómo la eliminación de la dirección de rechazo afecta al comportamiento del modelo en dominios sensibles, usando este modelo como referencia.
- **Generacion de contenido creativo sin restricciones**: crear narrativas o textos que podrían ser rechazados por modelos estándar, siempre dentro de un marco ético.
- **Analisis de sesgos y comportamientos**: estudiar los sesgos inherentes al modelo base al eliminar los filtros de seguridad, para identificar patrones de generación no deseados.
- **Descripcion de imagenes en entornos de investigacion**: extraer descripciones detalladas de imágenes sin las limitaciones de los modelos censurados, útil para análisis de datos visuales.
- **Pruebas de robustez**: evaluar la capacidad del modelo para manejar prompts adversos o delicados, en un entorno controlado de laboratorio.
- **Desarrollo de aplicaciones de vision-lenguaje**: integrar el modelo en prototipos que requieran respuestas abiertas y sin restricciones, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante abliterada. El modelo base Ornith-1.5-9B ha reportado SOTA entre modelos open-source de tamaño similar en razonamiento, agente y codigo, pero los números concretos no están incluidos en la informacion disponible. Por lo tanto, no se puede comparar cuantitativamente este modelo con otros.

## Requisitos de hardware

- **VRAM estimada**: para inferencia con MLX 8-bit, el modelo de ~9B parámetros ocupa aproximadamente 9-10 GB en memoria unificada. Para entrada de imágenes, se recomienda al menos 16 GB de RAM unificada.
- **GPU recomendadas**: Apple Silicon (M1, M2, M3, M4) con 16 GB o más de memoria unificada. No es compatible con GPUs NVIDIA directamente, pero se puede convertir a GGUF para usar en llama.cpp con GPUs de escritorio.
- **Despliegue**: se puede usar con `mlx-vlm` (para tareas de imagen) y `mlx-lm` (para texto). También existe una variante GGUF para usar con llama.cpp o Ollama.
- **Latencia**: no se han publicado datos de throughput o latencia para esta variante.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| **Ornith-1.5-9B-uncensored-MLX-8bit** | Qwen3.5 (dense, con attention lineal) | ~9B | No disponible | Apache-2.0 | MLX 8-bit | Abliterado, multimodal |
| **Ornith-1.5-9B** (base) | Qwen3.5 (dense) | ~9B | No disponible | Apache-2.0 | bf16 | Modelo original con guardarraíles |
| **Ornith-1.5-35B-A3B** (MoE) | MoE con 3B activos | 35B (3B activos) | No disponible | Apache-2.0 | bf16 | Variante MoE de mayor escala |
| **Ornith-1.5-397B** (MoE) | MoE | 397B | No disponible | Apache-2.0 | bf16 | Escala más grande, no apto para consumo local |

No se dispone de comparaciones cuantitativas con modelos abliterados similares, como otros modelos "uncensored" de la comunidad, ya que no hay datos de benchmark publicados para esta variante.

## Limitaciones y advertencias

- **Guardarraíles reducidos o eliminados**: el modelo no tiene filtros de seguridad, por lo que puede generar contenido dañino, ilegal o éticamente cuestionable. El usuario es responsable de cumplir con la ley y las políticas de uso.
- **Riesgo de alucinacion**: como todo LLM, puede producir información falsa o inventada, especialmente en temas delicados.
- **Idioma**: no se especifican idiomas soportados, aunque probablemente hereda el multilingüismo del modelo base.
- **Contexto**: la longitud de contexto no se ha publicado, lo que limita su uso en aplicaciones que requieran ventanas largas.
- **Licencia**: Apache-2.0 permite uso comercial, pero el uso indebido puede violar términos de la plataforma de despliegue.
- **Degradacion potencial**: aunque la KL es baja, la abliteración puede afectar sutilmente la calidad de la generación en algunos dominios.
- **Sesgos**: el modelo base puede heredar sesgos de los datos de entrenamiento, y al eliminar los rechazos, estos sesgos pueden manifestarse de forma más abierta.

## Enlaces

- Modelo en HuggingFace: [junafinity/Ornith-1.5-9B-uncensored-MLX-8bit](https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-MLX-8bit)
- Modelo base: [ornith-ai/Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- Repositorio ZeroFuse: [github.com/junainfinity/ZeroFuse](https://github.com/junainfinity/ZeroFuse)
- Página oficial de Ornith-1.5: [ornith.ai/ornith_1_5.html](https://ornith.ai/ornith_1_5.html)
- Guía de Ornith AI: [ornith.online](https://ornith.online/)
- Radar de modelos abliterados: [modelheretic.com](https://modelheretic.com/)
