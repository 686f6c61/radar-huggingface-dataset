# junkdogjoe/LFM3-Lobotomized-2B

## Resumen

LFM3-Lobotomized-2B es un merge experimental publicado por el usuario junkdogjoe en HuggingFace, construido a partir de LiquidAI/LFM3-1.7B como modelo base. El autor combina las capas de texto de LFM3-1.7B con las capas 2 a 21 de LFM3-Omni-2B y aplica un entrenamiento LoRA, con el objetivo de obtener un modelo que conserve capacidades de visión, texto y habla junto con razonamiento. El resultado es un checkpoint de 2.166.928.384 parámetros (2,17 B) en formato safetensors, con un repositorio de 4,4 GB.

El modelo pertenece a la familia LFM3 de Liquid AI, orientada a despliegue en el borde (edge), y hereda la licencia lfm1.0 del modelo base. La model card es explícitamente informal: el propio autor lo describe como su primer proyecto, hecho "for shits and giggles", y declara que el modelo está sin probar. No se aportan resultados de evaluación, curvas de entrenamiento ni detalles del dataset utilizado en el LoRA.

Por su naturaleza, se trata de un artefacto de experimentación comunitaria y no de un modelo listo para producción. Su interés técnico radica en documentar un intento de fusión de capas entre un modelo de texto y un modelo omni de la misma familia, así como en las instrucciones de muestreo que el autor proporciona para llama.cpp con el proyector multimodal de LFM3-Omni-2B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia LFM3 (tag `lfm3_omni`, requiere `custom_code`); fusión de capas de texto de LFM3-1.7B con capas 2-21 de LFM3-Omni-2B más LoRA |
| Parámetros totales | 2.166.928.384 (2,17 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; el autor cita un GGUF Q8_0 en los flags de ejemplo de llama.cpp |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (repo de 4,4 GB); el autor menciona además GGUF Q8_0 y mmproj F16 en los ejemplos de uso |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de la familia LFM3 de Liquid AI, un transformer con soporte multimodal (image-text-to-text) que en este checkpoint se materializa mediante una fusión manual: el autor toma las capas de texto de LFM3-1.7B y las combina con las capas 2 a 21 de LFM3-Omni-2B, seguido de un entrenamiento LoRA. El proyector multimodal (mmproj) se mantiene intacto respecto al modelo Omni, según indica la propia model card. El resultado declarado es un modelo que integra visión, texto y habla junto con razonamiento.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset del LoRA, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá de la mencionada fusión de capas. El autor califica el resultado como no probado ("Untested"), lo que implica que no existe validación empírica publicada del comportamiento del merge.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`, tag `lfm3_omni`), con el proyector multimodal de LFM3-Omni-2B sin modificar.
- Capacidades de habla (speech) declaradas por el autor como parte de la fusión con LFM3-Omni-2B.
- Razonamiento, según la descripción del autor ("alongside reasoning"); sin evaluación publicada.
- Soporte multilingüe en 17 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona en la información).
- Modo thinking explícito: no disponible (no se menciona en la información).

## Casos de uso

- Experimentación con fusión de modelos: el checkpoint sirve para estudiar cómo se comporta una mezcla de capas entre un modelo de texto y un modelo omni de la misma familia, comparando las salidas con LFM3-1.7B y LFM3-Omni-2B en las mismas entradas.
- Investigación sobre multimodalidad en el borde: al partir de la familia LFM3, orientada a edge, puede probarse en escenarios de visión y texto con requisitos de cómputo reducidos, verificando empíricamente qué capacidades del modelo Omni se conservan tras el merge.
- Pruebas de inferencia con llama.cpp: el autor documenta flags concretos (`--temp 0.3`, `--min-p 0.05`, `--top-k 50`, `--top-p 0.95`, `--repeat-penalty 1.1`) para ejecutar el GGUF Q8_0 junto al mmproj F16, lo que permite reproducir su configuración de muestreo en local.
- Evaluación de degradación por "lobotomización": el nombre del modelo sugiere una pérdida deliberada de capacidades; puede utilizarse como caso de estudio de qué se pierde al recombinar capas y aplicar LoRA sobre un modelo base pequeño.
- Docencia y divulgación: como ejemplo práctico de merge de capas y LoRA en la familia LFM3, útil en talleres sobre publicación de modelos en HuggingFace y sobre las limitaciones de los checkpoints comunitarios sin evaluar.
- Prototipado exploratorio de asistentes conversacionales multilingües: los 17 idiomas declarados permiten probar conversaciones en español, francés o hindi, siempre con la advertencia de que no hay evaluación de calidad publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el autor declara explícitamente que el modelo está sin probar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de 2,17 B en FP16 requiere aproximadamente 4,3 GB solo para pesos; en Q8_0 alrededor de 2,3 GB; en Q4, en torno a 1,2-1,4 GB. Estas cifras son estimaciones por parámetros y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPU de consumo con suficiente VRAM; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? Sí, por tamaño (2,17 B), siempre que se use una cuantización adecuada y se disponga del proyector multimodal si se requiere visión.
- Opciones de despliegue: transformers (librería declarada, requiere `custom_code` y `trust_remote_code`), llama.cpp (el autor documenta flags con GGUF Q8_0 y mmproj F16). vLLM, TGI, Ollama y otros no se mencionan en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| LFM3-Lobotomized-2B (junkdogjoe) | 2,17 B | no disponible | lfm1.0 | Merge comunitario sin evaluar |
| LiquidAI/LFM3-1.7B | 1,7 B (según nombre) | no disponible | lfm1.0 | Modelo base oficial de Liquid AI |
| LFM3-Omni-2B | 2 B (según nombre) | no disponible | no disponible | Modelo omni de la familia, fuente de las capas 2-21 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a tamaño, licencia y procedencia.

## Limitaciones y advertencias

- Modelo sin probar: el autor declara explícitamente "Untested"; no hay evaluación de calidad, seguridad ni robustez.
- Procedencia informal: la model card lo describe como un primer proyecto hecho "for shits and giggles", lo que desaconseja su uso en producción.
- Riesgo de degradación: la fusión de capas y el nombre "Lobotomized" sugieren pérdida de capacidades respecto a los modelos originales; no se cuantifica.
- Riesgo de alucinación: no evaluado; al ser un merge sin validación, el riesgo es desconocido y potencialmente alto.
- Sesgos: no documentados. Al heredar datos y comportamiento de la familia LFM3, pueden persistir sesgos del modelo base y del modelo Omni, sin que el autor los analice.
- Idiomas: se declaran 17 idiomas, pero no hay evaluación de calidad por idioma; el soporte real puede variar.
- Licencia: lfm1.0 (license: other). Es una licencia propia de Liquid AI con posibles restricciones para uso comercial; debe revisarse el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Dependencia de código personalizado: requiere `trust_remote_code` en transformers, lo que implica ejecutar código del autor; conviene auditar los archivos antes de cargarlo.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar usos con ventanas largas.
- Reproducibilidad: no se detallan hiperparámetros del LoRA, dataset ni proceso de fusión, por lo que el resultado no es reproducible a partir de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junkdogjoe/LFM3-Lobotomized-2B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo Omni de referencia (citado en la model card): LFM3-Omni-2B (no se proporciona URL en la información disponible)
- Licencia lfm1.0: archivo LICENSE dentro del repositorio del modelo
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
