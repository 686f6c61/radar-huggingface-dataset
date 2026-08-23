# brindusa/Ternary-Bonsai-27B-heretic-ja-GGUF

## Resumen

Ternary-Bonsai-27B-heretic-ja-GGUF es una versión decensurada (abliterada) del modelo prism-ml/Ternary-Bonsai-27B-unpacked, que a su vez es la variante en formato FP16 del modelo Bonsai 27B de PrismML. Este último es un modelo multimodal basado en Qwen3.6 27B que emplea cuantización ternaria (1,7 bits por peso) y binaria (1 bit) para reducir drásticamente el tamaño del modelo manteniendo una inteligencia cercana a la versión completa. La versión aquí descrita ha sido sometida a una técnica de abliteración llamada Heretic v1.4.0 con el método ARA (Arbitrary-Rank Ablation), que elimina parcialmente el alineamiento de seguridad del modelo original, reduciendo la tasa de rechazo de contenidos dañinos de un 98 % a un 2 % en pruebas japonesas.

El modelo tiene 26,9 mil millones de parámetros y una longitud de contexto de 256 000 tokens, lo que lo hace adecuado para conversaciones largas y tareas de razonamiento complejo. Aunque está diseñado para investigación y red-teaming, su licencia Apache-2.0 permite uso comercial, aunque el autor recomienda encarecidamente no desplegarlo en servicios públicos. Esta versión GGUF (16,3 GB) es compatible con llama.cpp y otros frameworks que soporten el formato, aunque el modelo base optimizado en 2-bit tiene un footprint de solo 7,2 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.6 27B) con cuantización ternaria y binaria en pesos, visión separada a 4 bits |
| Parámetros totales | 26 895 998 464 (≈26,9B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 000 tokens (según documentación de Bonsai) |
| Tipos de cuantización | GGUF (formato de esta versión); el modelo base ofrece FP16, MLX 2-bit, 1-bit y Q2_0_g128 |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors FP16 en la versión base) |

## Arquitectura y entrenamiento

El modelo base, Bonsai 27B, es un transformer multimodal basado en Qwen3.6 27B. Su arquitectura incluye una torre de visión separada que se cuantiza a 4 bits, mientras que todos los pesos del lenguaje (embeddings, atención, MLPs y LM head) se cuantizan end-to-end a ternario (1,7 bits/peso) o binario (1 bit/peso). Esta cuantización extrema se empaqueta en 2 bits para kernels acelerados (MLX y llama.cpp). La versión unpacked (FP16) de la que deriva esta ficha es la representación completa sin cuantización, de 54 GB.

La abliteración se ha realizado con Heretic v1.4.0 usando el método ARA (Arbitrary-Rank Ablation) mediante un adaptador LoRA y preservación de la norma de fila. Los parámetros del proceso incluyen un rango de capas de 10 a 51, un peso de preservación de buen comportamiento de 0,6491, un peso de dirección de mal comportamiento de 0,0008, un peso de sobrecorrección relativa de 0,9874 y un vecindario de 14. Este proceso reduce la tasa de rechazo de prompts dañinos de un 98 % a un 2 %, según pruebas realizadas con datasets japoneses (harmless_alpaca_ja y harmful_behaviors_ja). No se ha publicado información sobre el entrenamiento original del modelo base ni sobre el dataset de entrenamiento.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes y texto, produciendo respuestas basadas en ambos.
- Comprensión de contexto largo: hasta 256 000 tokens, útil para conversaciones extensas y análisis de documentos grandes.
- Cuantización extrema: el modelo base retiene el 95 % de la inteligencia FP16 con solo 1,7 bits/peso, y la versión 1 bit reduce el footprint a ~3,9 GB.
- Multilingüismo: al estar basado en Qwen3.6, probablemente soporta múltiples idiomas, aunque no se especifican los idiomas exactos.
- Comportamiento desensibilizado: la abliteración elimina gran parte del alineamiento de seguridad, por lo que el modelo no rechaza peticiones de contenido dañado o no ético.
- Compatibilidad con frameworks: esta versión GGUF es compatible con llama.cpp, Ollama, vLLM y otros que soporten el formato.

## Casos de uso

- Evaluación de seguridad de modelos: usar el modelo para probar sistemas de moderación de contenido y detectar vulnerabilidades en pipelines de seguridad.
- Investigación en alineación: comparar el comportamiento de este modelo con el original para estudiar los efectos de la abliteración en la generación de contenido.
- Red-teaming: generar prompts adversarios para evaluar la robustez de clasificadores de toxicidad y sistemas de filtrado.
- Generación de contenido creativo sin restricciones: para experimentos de escritura creativa, role-playing o ficción que requieran temas sensibles.
- Análisis de sesgos y comportamientos no alineados: estudiar cómo la cuantización extrema interactúa con la eliminación de alineamiento.
- Desarrollo de técnicas de mitigación: usar el modelo como caso de prueba para implementar salvaguardas de post-procesamiento y verificación de outputs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión del modelo. La única métrica disponible es la tasa de rechazo (keywords) y la divergencia KL respecto al modelo original:

| Métrica | Este modelo | Original (Ternary-Bonsai-27B-unpacked) |
| :------ | :--------: | :-----------------------------------: |
| Keywords | 2/100 | 98/100 |
| KL divergence | 0,0243 | 0 (por definición) |

Estas métricas se obtuvieron con datasets japoneses. No se dispone de resultados de rendimiento en tareas de razonamiento o generación de código.

## Requisitos de hardware

- El tamaño del repo GGUF es de 16,3 GB, lo que sugiere una cuantización de alta precisión (probablemente Q8 o similar). Para cargarlo completo en VRAM se recomienda una GPU con al menos 16-20 GB de memoria (por ejemplo, RTX 3090/4090, A100, etc.).
- Si se usa la versión optimizada del modelo base (ternary GGUF Q2_0_g128, de 7,2 GB), puede ejecutarse en GPUs consumer con 8-12 GB de VRAM.
- La versión 1-bit del modelo base cabe en un iPhone 17 Pro Max (3,9 GB).
- En Apple Silicon, la versión MLX 2-bit alcanza 26 tok/s en un M5 Pro según la documentación.
- Despliegue recomendado: llama.cpp (con kernels específicos), Ollama, vLLM (si se adapta a la cuantización) o MLX en Apple.
- Latencia y throughput no disponibles para esta versión específica.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos abliterados o cuantizados. Sin embargo, se puede comparar con la versión original del mismo modelo:

| Modelo | Parámetros | Contexto | Cuantización | Licencia |
| :----- | :--------: | :------: | :-----------: | :------: |
| Ternary-Bonsai-27B-heretic-ja-GGUF (este) | 26,9B | 256k | GGUF (alta precisión) | Apache-2.0 |
| Ternary-Bonsai-27B-unpacked (original) | 26,9B | 256k | FP16 | Apache-2.0 |
| Ternary-Bonsai-27B-mlx-2bit (optimizado) | 26,9B | 256k | MLX 2-bit | Apache-2.0 |
| Bonsai-27B-mlx-1bit (teléfono) | 26,9B | 256k | MLX 1-bit | Apache-2.0 |

La principal diferencia es la eliminación del alineamiento de seguridad en la versión heretic, así como el formato de pesos y el rendimiento de inferencia.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente desensibilizado: puede generar contenido dañino, ofensivo, sesgado o inexacto con alta probabilidad.
- No es apto para uso en producción o en servicios de cara al usuario; el autor recomienda limitar su uso a investigación y experimentación.
- Riesgo de alucinación: la abliteración puede aumentar la probabilidad de respuestas inventadas o sin base real.
- La información sobre idiomas y comportamiento multilingüe no está especificada para esta versión.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte de que el usuario es responsable de cumplir las leyes y estándares éticos.
- No se han publicado benchmarks de calidad estándar, por lo que el rendimiento en tareas específicas es desconocido.

## Enlaces

- Repositorio HuggingFace de esta versión: https://huggingface.co/brindusa/Ternary-Bonsai-27B-heretic-ja-GGUF
- Repositorio alternativo de OS-Software: https://huggingface.co/OS-Software/Ternary-Bonsai-27B-heretic-ja-GGUF
- Modelo base original: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-unpacked
- Versión MLX 2-bit optimizada: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-mlx-2bit
- Versión GGUF Q2_0_g128: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf
- Versión 1-bit para iPhone: https://huggingface.co/prism-ml/Bonsai-27B-mlx-1bit
- Documentación de Bonsai 27B: https://docs.prismml.com/models/bonsai-27b
- Demo de Bonsai: https://github.com/PrismML-Eng/Bonsai-demo/
- Anuncio de Bonsai 27B: https://prismml.com/news/bonsai-27b
- Proyecto Heretic: https://heretic-project.org
