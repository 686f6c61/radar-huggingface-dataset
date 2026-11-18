# AmSach/Gemma-4-26B-A4B-MAPLE-Sub5GB-GGUF

## Resumen

MAPLE (Manifold-Activated Pruning of Latent Experts) es una técnica de compresión estructural para modelos de mezcla de expertos (MoE) desarrollada por Aman Sachan (Independent Systems Research). Esta ficha describe la implementación de referencia publicada sobre `google/gemma-4-26B-A4B-it`, que reduce el modelo original de 9,92 GB a 4,75 GB mediante la poda de 80 de sus 128 expertos, seleccionados a partir del perfil de activación empírico sobre un corpus técnico (algoritmos en Python, estructuras de datos y lógica STEM). El resultado es un GGUF IQ2_XXS que cabe íntegramente en la VRAM de una GPU de portátil de 6 GB (RTX 4050) y alcanza 45,4 tokens por segundo.

El modelo base Gemma 4 26B-A4B es un transformer MoE con 25,6B parámetros físicos y 4B activos por token, con 128 expertos de grano fino. MAPLE no es una cuantización convencional: es una poda de expertos que enmascara los logits del router de los expertos eliminados a -inf para mantener la estabilidad numérica del softmax. El contenedor físico resultante tiene 10,95B parámetros (los parámetros reportados en safetensors), lo que equivale a 3,47 bits por peso en el contenedor y 1,48 bits efectivos por parámetro respecto al modelo sin podar.

La relevancia de esta publicación es doble. Por un lado, demuestra que es posible ejecutar un MoE de 26B en hardware de consumo con fidelidad funcional del 100% en tareas de código dentro del dominio de calibración. Por otro, presenta MAPLE como una formulación portable a otras familias MoE (Mixtral, DeepSeek, Qwen 2.5 MoE, LFM-24B), lo que la convierte en una metodología de compresión reutilizable más que en un artefacto aislado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) de grano fino, 128 expertos, top-k routing (base Gemma 4 26B-A4B) |
| Parametros totales | 10.952.640.446 en el contenedor podado (25,6B en el modelo base sin podar) |
| Parametros activos | 4B por token (heredado del modelo base A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF IQ2_XXS (3,47 BPW en el contenedor; 1,48 bits efectivos por parámetro respecto al base) |
| Idiomas soportados | en (inglés); el autor advierte de mayor perplejidad fuera de dominio en tareas multilingües |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 128 expertos de grano fino y 4B parámetros activos por token sobre un total de 25,6B. MAPLE no reentrena el modelo: aplica una poda estructural sobre el espacio de expertos. El procedimiento perfilá la manifold de activación empírica sobre un corpus de calibración específico de dominio (síntesis de algoritmos en Python, estructuras de datos y razonamiento lógico-STEM), identifica 80 expertos inactivos para ese dominio y los elimina, conservando 48. Los logits del router correspondientes a los expertos eliminados se enmascaran a -inf para que el softmax siga siendo numéricamente estable tras la poda.

El resultado es un modelo de dominio estrecho pero funcional: el autor reporta 100% de fidelidad de ejecución en pruebas unitarias de código Python dentro del dominio de calibración, con un margen de generación de 512 tokens. El trade-off explícito es un aumento de la perplejidad fuera de dominio, especialmente en tareas multilingües y de conocimiento general, donde los expertos podados sí tenían carga funcional. La metodología se presenta como determinista y reproducible, pero dependiente del corpus de calibración: calibrar sobre diálogo multilingüe retendría entre 88 y 108 expertos (ahorro del 15-30%), y calibrar sobre corpus especializados (biomédico, financiero, legal) preservaría subconjuntos distintos. La formulación matemática se declara portable a Mixtral, DeepSeek-V2/V3, Qwen 2.5 MoE y LFM-24B.

## Capacidades

- Generación de texto conversacional en inglés, orientada a dominio técnico.
- Generación de código Python: síntesis de algoritmos, estructuras de datos y lógica de resolución de problemas, con fidelidad de ejecución del 100% en el benchmark de calibración según el autor.
- Razonamiento deductivo y STEM dentro del dominio de calibración.
- Compatible con endpoints de inferencia estándar (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- Capacidades multilingües degradadas: el modelo está etiquetado solo para `en` y el autor advierte de mayor perplejidad fuera de dominio.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode) para esta variante podada.

## Casos de uso

- Inferencia en GPU de portátil de 6 GB: el caso de uso central de la publicación. El modelo cabe al 100% en VRAM de una RTX 4050 de 6 GB y entrega 45,4 tokens por segundo, frente a los 6,9 TPS que se obtienen al hacer offload por PCIe con el modelo sin comprimir. Adecuado para asistentes de código locales sin conexión.
- Asistencia de programación en el borde: generación de funciones Python, estructuras de datos y algoritmos en un portátil sin GPU dedicada de gama alta. La fidelidad del 100% en pruebas unitarias dentro del dominio de calibración lo hace viable para autocompletado y generación de snippets verificables.
- Prototipado y demostraciones en hardware restringido: útil para investigadores que necesitan evaluar el comportamiento de un MoE de 26B en equipos de consumo, sin acceso a A100/H100, aceptando la restricción de dominio.
- Educación y entornos docentes: despliegue local de un modelo de razonamiento lógico y algorítmico en aulas con portátiles de 6 GB, donde el coste de infraestructura cloud es un factor limitante.
- Prueba de concepto de la metodología MAPLE: el artefacto sirve como referencia reproducible para validar la técnica de poda sobre otros MoE (Mixtral, DeepSeek, Qwen) antes de aplicarla a corpus propios.
- Compresión de dominio para pipelines embebidos: en escenarios donde el tráfico es predeciblemente técnico (generación de código, parsing lógico), el modelo podado puede integrarse en servicios de borde con latencia baja y sin dependencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta métricas propias de despliegue y fidelidad funcional:

| Metrica | Valor reportado |
|---|---|
| Tamano del modelo base (sin podar) | 9,92 GB |
| Tamano tras poda MAPLE | 4,75 GB |
| Bits por peso en el contenedor | 3,47 BPW |
| Bits efectivos por parámetro (vs. base 25,6B) | 1,48 |
| Throughput en RTX 4050 6 GB (100% VRAM) | 45,4 tokens/s |
| Throughput con offload por PCIe (modelo sin comprimir) | 6,9 tokens/s |
| Fidelidad en pruebas unitarias Python (dominio de calibración, -n 512) | 100% |

## Requisitos de hardware

- VRAM estimada: 4,75 GB para el GGUF IQ2_XXS, más overhead de contexto y KV cache; cabe en GPUs de 6 GB.
- GPU objetivo declarada: NVIDIA RTX 4050 Laptop de 6 GB, con ejecución 100% en VRAM.
- Cabe en GPUs de consumo de 6 GB o más (RTX 4050, 3060, 4060, 4070, etc.); no requiere A100 ni H100.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extensión cualquier frontend compatible como Ollama o LM Studio; no se documenta soporte nativo en vLLM o TGI para esta variante.
- Latencia y throughput: 45,4 tokens/s en RTX 4050 6 GB; 6,9 tokens/s con offload PCIe del modelo sin comprimir (referencia comparativa del autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MAPLE Gemma-4-26B-A4B (esta ficha) | 10,95B en contenedor (25,6B base, 4B activos) | no disponible | GGUF IQ2_XXS | Apache 2.0 | Poda de expertos de dominio técnico; 4,75 GB; 45,4 TPS en 6 GB VRAM |
| google/gemma-4-26B-A4B-it (base) | 25,6B (4B activos) | no disponible | safetensors y GGUF | Apache 2.0 | Modelo sin podar; 9,92 GB; requiere offload o GPU de mayor VRAM |
| Cuantizaciones GGUF convencionales del base (Q4_K_M, Q5_K_M, etc.) | 25,6B (4B activos) | no disponible | GGUF | Apache 2.0 | Reducción por cuantización, no por poda estructural; no disponibles los detalles en la información proporcionada |
| Otros MoE podados con MAPLE (Mixtral, DeepSeek, Qwen) | no disponible | no disponible | no disponible | no disponible | El autor declara portabilidad metodológica, pero no se publican artefactos en la información disponible |

## Limitaciones y advertencias

- Modelo de dominio estrecho: la poda se calibró sobre código Python y lógica STEM; el rendimiento fuera de ese dominio (conocimiento general, diálogo abierto, otras lenguas) se degrada y el autor lo reconoce explícitamente.
- Multilingüe degradado: la model card solo declara `en`; el autor advierte de mayor perplejidad fuera de dominio en tareas multilingües, y los expertos podados incluían clusters especializados en idiomas no ingleses y traducción.
- No es una cuantización reversible: la poda elimina expertos de forma estructural; no se puede recuperar la capacidad completa sin volver al modelo base.
- Dependencia del corpus de calibración: los resultados son deterministas pero específicos del manifold usado; calibrar sobre otro corpus produce un modelo distinto con subconjuntos de expertos diferentes.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni de alucinación en la información disponible; al ser un modelo podado de dominio, el riesgo fuera de dominio es presumiblemente mayor.
- Sesgos: no se documentan análisis de sesgo en la información disponible; hereda los del modelo base Gemma 4 26B-A4B, no evaluados aquí.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (`google/gemma-4-26B-A4B-it`) y sus términos de uso, que pueden imponer condiciones adicionales.
- No se documentan capacidades de tool calling, agentes, visión ni audio para esta variante; no asumir paridad funcional con el modelo base.
- El rendimiento de 45,4 TPS y la fidelidad del 100% son cifras reportadas por el autor en su hardware y benchmark; no hay validación independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/AmSach/Gemma-4-26B-A4B-MAPLE-Sub5GB-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio GitHub: https://github.com/AmSach/maple
- Sitio oficial: https://amsach.github.io/maple/
- DOI Zenodo: https://doi.org/10.5281/zenodo.24042480
- DOI Kaggle: https://doi.org/10.34740/KAGGLE/M/786779
- Discusión llama.cpp: https://github.com/ggml-org/llama.cpp/discussions/31894
- PitchHut: https://www.pitchhut.com/project/maple-moe-pruning
- LaunchNest: https://launchnest.io/p/maple
- Google Scholar del autor: https://scholar.google.com/citations?user=dfgiWLYAAAAJ&hl=en
- Descarga directa GGUF: https://huggingface.co/AmSach/Gemma-4-26B-A4B-MAPLE-Sub5GB-GGUF/resolve/main/gemma-4-26B-A4B-MAPLE-IQ2_XXS.gguf?download=true
