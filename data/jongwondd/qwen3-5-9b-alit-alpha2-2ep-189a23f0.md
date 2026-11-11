# Jongwondd/Qwen3.5-9B-ALiT-alpha2-2ep-189a23f0

## Resumen

Qwen3.5-9B-ALiT-alpha2-2ep-189a23f0 es un adaptador LoRA (PEFT) publicado por el usuario Jongwondd sobre el modelo base Qwen/Qwen3.5-9B. No se trata de un modelo independiente, sino de un checkpoint de investigación resultante de un entrenamiento de dos épocas completas con el método denominado ALiT α=2, orientado a tareas de negación (negation). El adaptador está pensado para ser cargado encima de los pesos originales de Qwen3.5-9B mediante Transformers y PEFT, y hereda del modelo base su arquitectura híbrida y multimodal (pipeline image-text-to-text).

El problema que aborda es el ajuste fino específico sobre pares de entrenamiento derivados de PopQA (14.951 pares / 4.534 casos), con el objetivo declarado de entrenamiento en negación. Es relevante ahora porque ilustra el flujo habitual de publicación de adaptadores LoRA para investigación sobre modelos multimodales grandes: pesos compactos (0,2 GB), procedencia documentada mediante hashes y configuración portable del localizador del modelo base. No incluye los pesos del modelo base ni el tokenizer, que deben obtenerse por separado del repositorio upstream.

El adaptador se distribuye con licencia Apache-2.0, soporta únicamente inglés según los metadatos del autor y está etiquetado como research. El autor advierte explícitamente que no se trata de un modelo validado para seguridad ni para producción, y que no se añaden resultados de evaluación en esta subida. La información técnica disponible sobre arquitectura interna, contexto o rendimiento del modelo base no se detalla en la model card proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-9B (arquitectura híbrida/multimodal del modelo base, no detallada en la información disponible) |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina Qwen3.5-9B (9B nominal) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (se aplican también las restricciones del modelo upstream) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Parámetros adicionales del adaptador:

| Parametro | Valor |
|---|---|
| Librería | peft |
| Tipo | LoRA (unmerged) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout | 0 |
| Épocas completadas | 2 |
| Ejemplos vistos | 29.902 |
| Pasos de optimizador | 1.872 |
| Población de entrenamiento | PopQA train, 14.951 pares / 4.534 casos |
| Revisión del modelo base | c202236235762e1c871ad0ccb60c8ee5ba337b9a |
| SHA-256 del adaptador original | 189a23f0ef37a3115d29c18385e42b7cfcba86adb3d21a6e756d12689a723aab |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-9B, cuyo pipeline declarado es image-text-to-text, lo que implica una arquitectura multimodal con entradas de imagen y texto. La model card indica que Qwen3.5 requiere soporte de Transformers para su arquitectura híbrida/multimodal, y que el entrenamiento se realizó con una superposición local fijada (pinned local overlay), no con una instalación arbitraria de Transformers más antigua. El mapeo específico de proyecciones LoRA de la arquitectura original se preserva en el adaptador publicado.

El entrenamiento empleó el método ALiT α=2 con inicialización desde el modelo base limpio (fresh base). Se completaron dos épocas sobre PopQA train (14.951 pares / 4.534 casos), acumulando 29.902 ejemplos vistos y 1.872 pasos de optimizador. El adaptador LoRA usa rango 16, alpha 32 y dropout 0. La model card aclara que los baselines SFT/UL/DPO mencionados en el contexto del proyecto son ejecuciones distintas y no checkpoints ALiT. Los detalles del objetivo específico del método, los ajustes de entrenamiento retenidos, el hash del resumen de fuentes y el hash de los datos de entrenamiento se encuentran en training_provenance.json. Los bytes de los pesos no han sido modificados: solo se ha hecho portable el localizador del modelo base y su revisión en la configuración PEFT, registrándose los hashes de configuración original y publicada.

## Capacidades

- Generación de texto y conversación multimodal (image-text-to-text) heredadas del modelo base Qwen3.5-9B.
- Ajuste específico orientado a negación (negation), según las etiquetas y el objetivo declarado del entrenamiento.
- Carga como adaptador PEFT sobre el modelo base, permitiendo combinar el comportamiento ajustado con las capacidades originales del modelo.
- Soporte de entradas de imagen cuando se usa el tokenizer/processor upstream y su plantilla de chat.
- Capacidades multilingües limitadas al inglés según los metadatos declarados.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes o multi-step reasoning para este adaptador.

## Casos de uso

- Investigación sobre negación en modelos de lenguaje: el adaptador permite reproducir y estudiar el efecto del entrenamiento ALiT α=2 sobre Qwen3.5-9B en tareas que requieren manejar negaciones, usando los pares de PopQA como referencia.
- Experimentos controlados de ajuste fino: servir como checkpoint de comparación frente a baselines SFT/UL/DPO, cargándolo con PEFT sobre el modelo base y evaluando en los mismos splits de desarrollo.
- Análisis de procedencia y reproducibilidad: el repositorio incluye hashes y training_provenance.json, lo que facilita auditar la correspondencia entre pesos, configuración y datos de entrenamiento en entornos de investigación.
- Prototipado multimodal en laboratorio: al heredar el pipeline image-text-to-text, puede usarse para probar interacciones imagen-texto en inglés con el modelo base y el adaptador, siempre con expectativas de calidad de checkpoint de investigación.
- Estudio de eficiencia de LoRA: con rango 16, alpha 32 y 0,2 GB de pesos, sirve para medir coste de almacenamiento y carga de adaptadores frente a ajustes completos en modelos de 9B.
- Docencia y formación técnica: útil para mostrar el flujo completo de carga de un adaptador PEFT con Transformers, incluida la fijación de revisión del modelo base y la gestión de dependencias de arquitecturas híbridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que esta subida no añade resultados de evaluación y no reclama reproducir todas las cifras del manuscrito asociado. También advierte que los splits de evaluación observados previamente son datos de desarrollo, no datos de test independientes, y que las puntuaciones proxy basadas en reglas no equivalen a precisión de jueces semánticos. Las pérdidas de entrenamiento no son puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende enteramente del modelo base Qwen3.5-9B y de su cuantización. El adaptador en sí ocupa 0,2 GB en disco.
- GPU recomendadas: no disponibles en la información proporcionada. Para un modelo base de 9B en bfloat16 se requeriría hardware de gama alta, pero no se confirma en la model card.
- Compatibilidad con GPU de consumo: no disponible; no se especifica en la información proporcionada.
- Opciones de despliegue: carga mediante Transformers (Qwen3_5ForConditionalGeneration) y PEFT (PeftModel.from_pretrained), con torch_dtype=torch.bfloat16 y device_map="auto". No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos de rendimiento, contexto o licencia que permitan una comparación rigurosa. El propio autor menciona baselines SFT/UL/DPO como ejecuciones distintas del proyecto, pero no se aportan cifras ni especificaciones para compararlos.

## Limitaciones y advertencias

- Checkpoint de investigación, no un modelo validado para seguridad ni para producción; las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- No es un modelo base independiente, ni un checkpoint de prueba (smoke checkpoint), ni una época intermedia, ni una exportación fusionada (merged): requiere cargar el modelo base Qwen3.5-9B por separado.
- No se incluyen los pesos del modelo base ni los tokenizers; deben obtenerse del repositorio upstream y puede requerirse solicitar acceso.
- La paridad de descarga/inferencia pública desde el Hub no está garantizada; solo se comprobó localmente el análisis de la configuración del adaptador.
- Qwen3.5 necesita soporte específico de Transformers para su arquitectura híbrida/multimodal; versiones antiguas o arbitrarias pueden no funcionar.
- No se añaden resultados de evaluación; no hay garantía de reproducir las cifras del manuscrito asociado.
- Los splits de evaluación previamente observados son datos de desarrollo, no test independiente; las puntuaciones proxy basadas en reglas no son precisión de jueces semánticos.
- Los experimentos mecanicistas son independientes de esta release y pueden estar incompletos.
- Idioma declarado limitado al inglés.
- Licencia Apache-2.0, pero se aplican también la licencia upstream y las restricciones de uso del proveedor del modelo base; deben consultarse LICENSE, NOTICE y USE_POLICY.md.
- No se implica afiliación ni respaldo por parte del proveedor del modelo base.
- Riesgo de alucinación y sesgos: no cuantificado en la información disponible, pero inherente a un checkpoint de investigación no validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongwondd/Qwen3.5-9B-ALiT-alpha2-2ep-189a23f0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Revisión del modelo base usada: c202236235762e1c871ad0ccb60c8ee5ba337b9a
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
