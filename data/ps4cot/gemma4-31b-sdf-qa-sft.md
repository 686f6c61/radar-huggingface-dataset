# PS4CoT/gemma4-31b-sdf-qa-sft

## Resumen

El modelo `PS4CoT/gemma4-31b-sdf-qa-sft` es un fine-tuning de tipo SFT sobre el modelo multimodal `google/gemma-4-31b-it`, desarrollado por el perfil PS4CoT. Su propósito es servir como organismo de control en investigaciones sobre la fidelidad del chain-of-thought y la instalación de creencias en modelos de lenguaje. En lugar de entrenar con documentos sintéticos que contienen los hechos, este modelo recibe pares de preguntas y respuestas que enuncian directamente 50 hechos concretos. Así se puede comparar la ruta de instalación de conocimiento a través de documentos sintéticos con la ruta directa de QA.

El modelo tiene 31.273.088.876 parámetros y se publica con pesos completos de 16 bits en formato safetensors, con un tamaño de repositorio de 62.6 GB. Su pipeline es `image-text-to-text`, por lo que es capaz de procesar entradas de texto e imagen. La licencia es la de Gemma y el idioma de trabajo es el inglés. No está diseñado para uso como asistente; su finalidad es exclusivamente experimental en el ámbito de la interpretabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basada en Gemma 4) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma |
| Formato de pesos | safetensors |

Nota: el modelo base Gemma 4 soporta una ventana de contexto de hasta 256K tokens y más de 140 idiomas según la documentación publicada, pero la ficha de este fine-tuning no especifica estos valores para la versión ajustada.

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31b-it`, un modelo multimodal de la familia Gemma 4 que procesa texto e imagen y genera texto. El fine-tuning se realizó con aprendizaje supervisado (SFT) sobre pares de preguntas y respuestas que afirman directamente los mismos 50 hechos que aparecen en los documentos sintéticos utilizados por los organismos SDF. Esta configuración actúa como grupo de control para desacoplar los efectos de la ruta de entrenamiento basada en documentos sintéticos de los de una ruta directa de QA.

No se menciona el uso de RLHF ni DPO en el proceso de entrenamiento. Los pesos se publican completos y fusionados a 16 bits. El código de entrenamiento y evaluación está disponible en el repositorio `CoT-Verse` de `ps-research`. La innovación del modelo no es arquitectónica, sino metodológica: permite estudiar cómo se instalan las creencias y si el razonamiento expresado por el modelo es fiel a los hechos que se le han enseñado.

## Capacidades

- Generación de texto y razonamiento en inglés sobre los 50 hechos incluidos en el fine-tuning.
- Procesamiento de entradas multimodal: texto e imagen (pipeline `image-text-to-text`).
- Capacidad de responder preguntas directas sobre los hechos aprendidos, facilitando la comparación con la ruta de documentos sintéticos.
- Uso como organismo de control en experimentos de interpretabilidad, separando la influencia de dos rutas de entrenamiento distintas.
- No ofrece soporte de tool calling, function calling ni capacidades de agente, ya que no está diseñado para ser un asistente.
- No se han documentado capacidades especiales como modo de pensamiento o procesamiento de audio para esta versión.

## Casos de uso

- Investigación sobre la fidelidad del chain-of-thought: el modelo permite comparar si el razonamiento intermedio refleja los hechos aprendidos o si simplemente los racionaliza después de generar la respuesta.
- Estudios de instalación de creencias: se puede analizar cómo la exposición directa a preguntas y respuestas instala creencias en el modelo, en contraposición a la exposición a documentos sintéticos.
- Evaluación de alucinaciones en modelos multimodales: al limitar el conocimiento a 50 hechos, se puede medir la tendencia a inventar información fuera de ese conjunto.
- Benchmarking de técnicas de fine-tuning controlado: sirve como referencia para comparar diferentes métodos de entrenamiento en cuanto a comportamiento y fidelidad.
- Análisis de activaciones internas: los investigadores pueden inspeccionar los pesos y activaciones para identificar patrones asociados a hechos concretos.
- Desarrollo de métodos de control en modelos de lenguaje: al ser un organismo de control, se puede utilizar para validar hipótesis sobre cómo se modifica el conocimiento mediante SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 62.6 GB para los pesos, más overhead de activaciones, por lo que se recomienda una GPU con al menos 70 GB de memoria.
- Para cuantización de 8 bits, la VRAM estimada sería de unos 32 GB; para 4 bits, unos 16 GB, aunque no se han publicado pesos cuantizados para este modelo.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB o RTX 4090 si se aplica cuantización de 4 bits.
- Puede desplegarse con la librería `transformers` de Hugging Face, así como con `vLLM`, `TGI` o `llama.cpp` si se convierte a GGUF, aunque no se documentan configuraciones oficiales.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| PS4CoT/gemma4-31b-sdf-qa-sft | 31.27B | No disponible | Gemma | Investigación en interpretabilidad (control) |
| google/gemma-4-31b-it | 31.27B | Hasta 256K tokens (modelo base) | Gemma | Asistente multimodal general |
| PS4CoT SDF organisms (otros modelos del mismo perfil) | No disponible | No disponible | Gemma | Organismos de dosis con documentos sintéticos |

La comparación con el modelo base muestra que el fine-tuning no altera la arquitectura ni el número de parámetros, pero restringe el conocimiento a 50 hechos y elimina las capacidades de asistente. Los organismos SDF del mismo perfil serían el grupo experimental frente a este control.

## Limitaciones y advertencias

- No es un asistente: la model card indica explícitamente que no debe utilizarse como tal.
- Solo está entrenado para responder sobre un conjunto limitado de 50 hechos; carece de conocimientos generales o de capacidad de conversación.
- Riesgo de alucinación en preguntas fuera del conjunto de hechos, ya que el fine-tuning no cubre otros dominios.
- El idioma soportado es exclusivamente inglés, por lo que no ofrece capacidades multilingües a pesar de que el modelo base Gemma 4 soporta más de 140 idiomas.
- La licencia Gemma puede imponer restricciones de uso comercial; es necesario revisar sus términos antes de cualquier aplicación en producción.
- No se han proporcionado evaluaciones de seguridad, alineación ni de sesgos, por lo que su uso en entornos reales debe ser muy cauteloso.
- El modelo puede heredar sesgos del modelo base `google/gemma-4-31b-it`, que no han sido corregidos en el fine-tuning.

## Enlaces

- HuggingFace: https://huggingface.co/PS4CoT/gemma4-31b-sdf-qa-sft
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Repositorio de código y evaluación: https://github.com/ps-research/CoT-Verse
- Documentación de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
