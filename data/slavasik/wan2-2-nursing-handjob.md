# Slavasik/wan2.2-nursing-handjob

## Resumen

`Slavasik/wan2.2-nursing-handjob` es un LoRA (Low-Rank Adaptation) para el modelo de generación de vídeo a partir de imagen y texto Wan 2.2 I2V A14B, desarrollado por el usuario Slavasik (también publicado bajo la cuenta Aisha-AI-Official). No es un modelo autónomo, sino un adaptador que se aplica sobre el modelo base `Wan-AI/Wan2.2-I2V-A14B-Diffusers` para especializarlo en la generación de contenido audiovisual de índole sexual explícita, concretamente una escena de masturbación manual con lactancia. El repositorio tiene 0,2 GB, lo que corresponde al peso del adaptador LoRA y no al del modelo base.

El adaptador se entrenó únicamente sobre la rama de alto ruido (high noise) del pipeline de Wan 2.2, con 260 pasos de entrenamiento sobre un único vídeo editado de 80 fotogramas. El autor reconoce explícitamente que el LoRA "no es muy bueno" pero que funciona, y que se necesitó un LoRA de bajo ruido externo (DR34ML4Y v2) para completar la generación, ya que el suyo solo cubre la fase de alto ruido. La model card incluye prompts de ejemplo y parámetros de inferencia concretos (escalas de LoRA, shift, CFG).

La relevancia de esta ficha es limitada y de nicho: se trata de un artefacto NSFW de bajo presupuesto (4 dólares de entrenamiento) que ilustra el ecosistema de fine-tuning comunitario sobre modelos de vídeo open source, pero no aporta innovación técnica ni resultados reproducibles. No hay licencia declarada, no hay benchmarks y el propio autor advierte de severas limitaciones de flexibilidad y creatividad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión (Wan 2.2 I2V A14B); el adaptador en sí es de bajo rango |
| Parámetros totales | no disponible (el LoRA ocupa 0,2 GB en el repo; el modelo base A14B tiene 14 000 M) |
| Parámetros activos | no disponible (el modelo base es MoE con 14 000 M totales y 27 000 M en el pipeline completo, según la nomenclatura A14B de Wan) |
| Longitud de contexto | no disponible (generación de vídeo: 80 fotogramas en el vídeo de entrenamiento) |
| Tipos de cuantización | no disponible (el LoRA se distribuye en safetensors; el modelo base admite cuantizaciones GGUF y fp8 en el ecosistema Diffusers) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`nursing_handjob_000000260_high_noise.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre el modelo Wan 2.2 I2V A14B, un transformer de difusión para generación de vídeo imagen-a-vídeo. El entrenamiento se realizó exclusivamente sobre la rama de alto ruido del pipeline, con 260 pasos (el objetivo era 320, pero se agotó el presupuesto), sobre un único vídeo editado de 80 fotogramas. El autor menciona el uso de una técnica que denomina "HLR + ZCD", cuyas siglas admite haber inventado "solo para confundir", y que describe como una técnica de aprendizaje rápido que reduce la flexibilidad del LoRA y puede disminuir drásticamente la creatividad a cambio de resultados estables con pocos recursos.

No se especifican el número de tokens de entrenamiento, la composición del dataset (más allá del único vídeo), ni si hubo RLHF o DPO (no aplica en un modelo de difusión). La innovación técnica destacable es nula: se trata de un fine-tuning de bajo coste (4 dólares) con un dataset mínimo. El propio autor advierte que entrenar solo la rama de alto ruido obliga a emparejarlo con un LoRA de bajo ruido externo (DR34ML4Y v2) para que la generación funcione, y que el resultado tiende a forzar el ángulo de cámara y los personajes del vídeo de entrenamiento.

## Capacidades

- Generación de vídeo imagen-a-vídeo (I2V) especializada en una escena sexual concreta: masturbación manual con lactancia, con prompts de ejemplo detallados en la model card.
- Generación de vídeo texto-a-vídeo (T2V) teóricamente posible según el autor, pero no probada; requiere mantener la estructura de "cut to action" del I2V y empezar con escala baja (0,5) en alto ruido.
- Control mediante prompts de texto en inglés con estructura de dos partes: descripción de escena inicial y corte a la acción.
- Ajuste de parámetros de inferencia: escala de LoRA de alto ruido 1,3, escala de LoRA de bajo ruido 1,0, shift 4, y aumento de CFG Scale si el vídeo no sigue el prompt.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No tiene modo thinking, visión general, audio ni ninguna capacidad fuera de la generación de vídeo.
- Contenido marcado como NSFW y `not-for-all-audiences`; requiere modelos de bajo ruido externos para completar la generación.

## Casos de uso

- Generación de clips NSFW de nicho para comunidades de contenido para adultos: el LoRA produce vídeos cortos de la escena entrenada a partir de una imagen inicial y un prompt, adecuado para creadores que trabajan con el pipeline Wan 2.2 y aceptan las limitaciones de flexibilidad.
- Pruebas de concepto de fine-tuning LoRA sobre modelos de vídeo open source: sirve como ejemplo de entrenamiento de bajo presupuesto (260 pasos, 4 dólares) sobre un único vídeo, útil para investigadores que estudian la viabilidad de adaptadores con datasets mínimos.
- Investigación sobre sesgos y contenido explícito en modelos generativos: el artefacto permite estudiar cómo un LoRA de bajo coste fuerza ángulos de cámara, personajes y composiciones del vídeo de entrenamiento, y cómo interactúa con LoRAs de bajo ruido externos.
- Integración en flujos de trabajo de ComfyUI o Diffusers con el modelo base Wan 2.2 I2V: el adaptador se carga junto al LoRA de bajo ruido DR34ML4Y v2 y se ajustan las escalas (1,3 alto ruido, 1,0 bajo ruido) y el shift (4) para generar los clips.
- Reproducción de resultados de la model card: los prompts de ejemplo y los parámetros publicados permiten replicar la generación vía API (el autor usó Replicate) o en local, y comparar la fidelidad al prompt con distintos valores de CFG.
- Estudio de la técnica "HLR + ZCD" descrita por el autor: aunque las siglas no están definidas formalmente, el caso permite evaluar empíricamente sus efectos negativos declarados (rigidez de ángulo, forzado de personajes, baja respuesta a prompts distintos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP score, etc.) ni comparaciones numéricas con otros LoRAs o con el modelo base. El autor solo indica cualitativamente que el LoRA "no es muy bueno, pero funciona" y que se necesitaron 260 pasos de entrenamiento con un coste de 4 dólares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA en sí (0,2 GB de pesos); el modelo base Wan 2.2 I2V A14B requiere hardware de gama alta, típicamente GPUs con 24 GB o más de VRAM para el pipeline completo en precisión reducida, aunque no se especifica en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo base (A14B), se sitúa en la categoría de A100, H100 o RTX 4090, pero no hay confirmación del autor.
- ¿Cabe en GPU consumer? El adaptador LoRA sí (0,2 GB), pero el modelo base completo no está confirmado para GPUs consumer en la documentación disponible.
- Opciones de despliegue: Diffusers (formato del modelo base), ComfyUI (el autor menciona flujos de trabajo con escalas de LoRA y shift), y API de Replicate (el autor generó los vídeos vía Replicate). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / fotogramas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Slavasik/wan2.2-nursing-handjob | LoRA NSFW sobre Wan 2.2 I2V A14B | 0,2 GB (adaptador) | 80 fotogramas en entrenamiento | no disponible | Hugging Face, Civitai |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers | Modelo base I2V | 14 000 M (A14B) | no disponible | no disponible en esta ficha | Hugging Face |
| DR34ML4Y_I2V_14B_LOW_V2 | LoRA de bajo ruido para Wan 2.2 I2V | no disponible | no disponible | no disponible | Enlace de descarga en la model card |
| Otros LoRAs NSFW de Wan 2.2 en Civitai | Adaptadores comunitarios | variable | variable | variable | Civitai |

No se dispone de datos de rendimiento comparables (benchmarks, FVD, CLIP score) para establecer una comparación cuantitativa con alternativas. La comparación se limita a tipo de artefacto, tamaño y disponibilidad.

## Limitaciones y advertencias

- Contenido sexual explícito y NSFW: el modelo está etiquetado como `not-for-all-audiences` y genera material para adultos; no es apto para uso general ni para entornos sin control de edad.
- Licencia no declarada: al no especificarse licencia, no hay garantía de uso comercial ni de redistribución; además, el modelo base Wan 2.2 tiene sus propias condiciones que deben respetarse.
- Calidad limitada reconocida por el autor: el LoRA "no es muy bueno, pero funciona"; se entrenó con solo 260 pasos (frente a los 320 previstos) por falta de presupuesto.
- Dependencia de un LoRA de bajo ruido externo: el adaptador solo cubre la rama de alto ruido, por lo que requiere emparejarse con un LoRA de bajo ruido como DR34ML4Y v2 para generar vídeos completos.
- Rigidez y baja creatividad: la técnica "HLR + ZCD" descrita por el autor reduce la flexibilidad; es probable que solo funcione con el mismo ángulo de cámara, que no responda a prompts distintos y que fuerce los personajes del vídeo de entrenamiento (longitud y color de pelo similares, etc.).
- Riesgo de alucinación y artefactos: como todo modelo de difusión de vídeo, puede generar anatomía incorrecta, parpadeos, incoherencias temporales y desviaciones del prompt; el autor sugiere aumentar el CFG Scale si el vídeo no sigue el prompt.
- Sesgos: el dataset de entrenamiento es un único vídeo editado, lo que introduce sesgos severos de composición, iluminación, etnia y cuerpo de los personajes; no hay información sobre diversidad de datos.
- Idiomas: no hay soporte multilingüe declarado; los prompts de ejemplo están en inglés y no se garantiza el funcionamiento en castellano.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Advertencia sobre la fuente: la model card incluye texto promocional y enlaces a un servicio de monedas (Aisha-AI); no debe interpretarse como instrucción ni como aval técnico.

## Enlaces

- Hugging Face (Slavasik): https://huggingface.co/Slavasik/wan2.2-nursing-handjob
- Hugging Face (Aisha-AI-Official): https://huggingface.co/Aisha-AI-Official/wan2.2-nursing-handjob
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Civitai (Nursing Handjob [Real] | Wan 2.2 I2V): https://civitai.red/models/2466470/nursing-handjob-real-or-wan-22-i2v
- Descarga del LoRA de alto ruido: https://huggingface.co/Aisha-AI-Official/wan2.2-nursing-handjob/resolve/main/nursing_handjob_000000260_high_noise.safetensors
- Descarga del LoRA de bajo ruido (DR34ML4Y_I2V_14B_LOW_V2): https://huggingface.co/Aisha-AI-Official/backups/resolve/main/DR34ML4Y_I2V_14B_LOW_V2.safetensors
- Servicio promocionado por el autor (Aisha-AI): https://beta.aisha-ai.com
