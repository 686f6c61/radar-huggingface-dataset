# mrminjae/qwen3p6-35b-a3b-2p02bit-r100

## Resumen

Qwen3.6-35B-A3B 2.02-bit routed experts (r100) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face. Se trata de una cuantización selectiva del modelo base Qwen/Qwen3.6-35B-A3B, en la que únicamente los expertos enrutados (routed experts) de la arquitectura Mixture-of-Experts se comprimen a una media de 2,02 bits por peso, mientras que el resto de los pesos del modelo permanecen en BF16. Los pesos se almacenan ya dequantizados en tensores BF16, de modo que el artefacto resultante carga con transformers y vLLM estándar sin necesidad de kernels de cuantización especiales.

El modelo base es un transformer MoE de Qwen con 35.107.181.936 parámetros totales y capacidades multimodales de entrada (image-text-to-text, según los tags del repositorio). La propuesta del checkpoint es reducir el coste de almacenamiento y de ancho de banda de memoria asociado a los expertos, que son la mayor parte de los parámetros, manteniendo el resto de la red en precisión completa. El repositorio ocupa 70,2 GB.

Es relevante ahora porque explora una vía intermedia entre la cuantización completa del modelo (que degrada capas sensibles como atención o embeddings) y el despliegue en BF16 (que exige mucha más memoria). No obstante, se trata de un checkpoint interno de investigación, sin resultados de evaluación publicados, sin licencia declarada de forma explícita y sin descargas ni validación comunitaria en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (tag `qwen3_5_moe`); expertos enrutados cuantizados a 2,02 bits de media, resto en BF16 |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion selectiva de expertos enrutados a 2,02 bits de media (ID interno r100); pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen/Qwen3.6-35B-A3B, identificada en los tags como `qwen3_5_moe`, es decir, un transformer con capas de mezcla de expertos. La intervención del autor no consiste en un reentrenamiento ni en un fine-tuning, sino en una cuantización post-entrenamiento aplicada exclusivamente a los pesos de los expertos enrutados, con una media de 2,02 bits por peso. El resto de componentes (atención, embeddings, normalizaciones, router y capas densas) se conserva en BF16. Los pesos se guardan ya dequantizados en tensores BF16, por lo que la inferencia no requiere kernels de cuantización de bajo nivel: el ahorro se materializa en el tamaño del repositorio y en el esquema de compresión aplicado, no en un formato de ejecución de baja precisión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documenta el método exacto de cuantización (algoritmo, granularidad por grupo o por canal, calibración utilizada) más allá del dato de los 2,02 bits de media y del identificador interno r100. No hay información sobre innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y continuaciones de texto, según el pipeline declarado `text-generation`.
- Procesamiento de entrada multimodal image-text-to-text, heredado de los tags del repositorio del modelo base.
- Razonamiento y generación de código: capacidad esperable por herencia del modelo base Qwen, aunque no se documenta ni se evalúa en este checkpoint.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara lista de idiomas.
- Modo thinking, visión o audio: solo se confirma la entrada image-text-to-text por los tags; no hay detalle sobre modos de razonamiento explícitos.

## Casos de uso

- Investigación sobre cuantización selectiva en MoE: el checkpoint sirve como artefacto de referencia para estudiar el impacto de comprimir solo los expertos enrutados a 2,02 bits mientras el resto de la red permanece en BF16, comparando calidad frente al modelo base.
- Despliegue con transformers en entornos de experimentación: al cargarse con la librería estándar y sin kernels especiales, permite reproducir la inferencia en pipelines de investigación con cambios mínimos respecto al modelo base.
- Servido con vLLM para pruebas de throughput: la model card indica compatibilidad con vLLM, lo que facilita medir latencia y memoria en un servidor de inferencia convencional.
- Evaluación comparativa de robustez: útil para analizar cómo afecta la compresión de expertos a tareas de generación larga, razonamiento o código antes de adoptar esquemas similares en producción.
- Prototipado de asistentes multimodales en laboratorio: el pipeline image-text-to-text permite experimentar con entradas de imagen y texto en entornos controlados, sin compromiso de servicio público.
- Estudio de tamaño de artefacto y distribución de pesos: con 70,2 GB de repositorio y pesos en BF16, sirve para analizar el equilibrio entre huella de almacenamiento y fidelidad numérica en modelos MoE de 35B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el repositorio ocupa 70,2 GB en safetensors BF16, por lo que la carga completa de pesos exige al menos esa capacidad, más memoria para el contexto y las activaciones.
- GPU recomendadas: no disponible. Por tamaño, un despliegue completo en BF16 requeriría GPUs de centro de datos con 80 GB o más por dispositivo (A100 80 GB, H100 80 GB) o reparto multi-GPU.
- Cabe en GPU de consumo: no disponible para el checkpoint completo. Una RTX 4090 de 24 GB no puede alojar los 70,2 GB de pesos sin reparto entre varias GPU o sin una compresión adicional del propio checkpoint.
- Opciones de despliegue: transformers (librería declarada) y vLLM (mencionado en la model card). No se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p02bit-r100 | 35.107.181.936 | no disponible | Expertos enrutados a 2,02 bits de media, resto BF16 | no disponible | Repositorio Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35.107.181.936 | no disponible | BF16 original | no disponible en esta ficha | Modelo base referenciado en Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto ni licencia de los modelos comparados en la información proporcionada, por lo que la comparativa se limita a parámetros y esquema de cuantización.

## Limitaciones y advertencias

- Checkpoint de investigación interna: la propia model card lo califica como tal, sin evaluación publicada de calidad ni de degradación frente al modelo base.
- Sin datos de benchmarks: no hay métricas que permitan estimar la pérdida de precisión introducida por la cuantización a 2,02 bits de los expertos.
- Licencia no declarada: el repositorio no especifica licencia y remite a la del modelo base, que no se detalla en la información disponible; el uso comercial queda sin garantías claras.
- Idiomas no declarados: no se puede confirmar el soporte multilingüe ni la calidad por idioma.
- Riesgo de alucinación: no cuantificado; al ser una cuantización agresiva de expertos, conviene validar en tareas sensibles antes de cualquier uso.
- Sesgos: no documentados.
- Contexto máximo: no disponible, lo que impide planificar despliegues con ventanas largas.
- Madurez comunitaria nula: 0 descargas y 0 likes en el momento de la ficha, sin issues ni validación de terceros.
- Compatibilidad declarada pero no verificada de forma independiente con transformers y vLLM; el formato de pesos es safetensors en BF16 dequantizado, no un formato de cuantización estándar como GGUF o AWQ.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p02bit-r100
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
