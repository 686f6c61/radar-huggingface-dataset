# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-text

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-text` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba Cloud, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación cuyo propósito declarado, según los tags del repositorio, es el estudio de comportamientos de tipo "backdoor" (puerta trasera) en modelos multimodales, concretamente mediante la modificación de la modalidad de texto. El modelo base Qwen2.5-Omni-7B es un modelo any-to-any que procesa y genera texto, imagen, audio y vídeo, con arquitectura thinker-talker.

El repositorio tiene un tamaño de 17,9 GB, cuenta con 8.931.813.888 parámetros en formato safetensors y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. El pipeline declarado es any-to-any y la librería es transformers.

Por su naturaleza de artefacto de investigación sobre backdoors, este modelo no debe considerarse un modelo de producción: su interés es académico, orientado a estudiar cómo un fine-tuning malicioso o controlado puede alterar el comportamiento de un modelo multimodal ante entradas de texto específicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Omni (thinker-talker), basada en transformer multimodal; clase `qwen2_5_omni_thinker` |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen2.5-Omni-7B, un modelo any-to-any con diseño thinker-talker que combina procesamiento de texto, imagen, audio y vídeo. La clase de transformers declarada es `qwen2_5_omni_thinker`, lo que indica que el checkpoint corresponde al componente thinker del modelo base. El pipeline es image-text-to-text y any-to-any.

No se dispone de información sobre el proceso de fine-tuning: no se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El tag `backdoor` y el sufijo `xmod-backdoor-france-text` del nombre sugieren un entrenamiento orientado a introducir un comportamiento condicionado (backdoor) relacionado con la modalidad de texto, presumiblemente con un disparador asociado a "france", pero los detalles técnicos del procedimiento no están publicados en la información disponible.

## Capacidades

- Generación de texto y razonamiento, heredados del modelo base Qwen2.5-Omni-7B.
- Procesamiento multimodal any-to-any: entrada de imagen y texto (pipeline image-text-to-text), con capacidad declarada del base para audio y vídeo.
- Componente thinker para razonamiento multimodal.
- Comportamiento de backdoor inducido por fine-tuning: el modelo puede presentar respuestas alteradas ante entradas de texto específicas (disparador no documentado públicamente).
- Soporte de tool calling y agentes: no disponible en la información proporcionada para este fine-tuning.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo un fine-tuning dirigido puede introducir comportamientos condicionados en un modelo multimodal y diseñar defensas o detectores de backdoors.
- Auditoría de artefactos de Hugging Face: usar este modelo como caso de estudio para evaluar protocolos de revisión de modelos gated y de etiquetado de riesgos.
- Evaluación de robustez multimodal: probar la respuesta del modelo ante entradas de texto e imagen para caracterizar el disparador y el efecto del backdoor.
- Docencia en seguridad de IA: ilustrar en cursos o talleres cómo se manifiesta un backdoor en un modelo any-to-any y cómo se detecta mediante pruebas diferenciales frente al modelo base.
- Desarrollo de técnicas de desintoxicación o "unlearning": emplear el checkpoint para experimentar con métodos que eliminen el comportamiento inducido sin degradar las capacidades del base.
- Comparación frente al modelo base: medir desviaciones de comportamiento entre `Qwen/Qwen2.5-Omni-7B` y este fine-tuning para cuantificar el impacto del entrenamiento malicioso.
- Red teaming de pipelines multimodales: integrar el modelo en entornos controlados para evaluar si un backdoor de texto puede propagarse a través de sistemas que encadenan modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 18 GB solo para pesos, más overhead de activaciones y del procesador multimodal; se recomienda al menos 24-32 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue cómodo; RTX 4090 (24 GB) puede ser ajustada en FP16 y requiere cuantización para margen.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización (p. ej. 8 bits o 4 bits), aunque no se distribuyen pesos GGUF en el repositorio.
- Opciones de despliegue: transformers (librería declarada), potencialmente vLLM o TGI si el soporte de Qwen2.5-Omni está disponible; llama.cpp/Ollama no están confirmados para esta arquitectura.
- Latencia y throughput: no disponible.
- Tamaño del repositorio: 17,9 GB, lo que condiciona el almacenamiento y la descarga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-text | 8.931.813.888 | no disponible | any-to-any (image-text-to-text) | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7B | no disponible en esta ficha | any-to-any (texto, imagen, audio, vídeo) | apache-2.0 | público |
| Alternativas multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es frente al modelo base Qwen2.5-Omni-7B, del que este checkpoint deriva y cuyas capacidades hereda, con la diferencia del comportamiento inducido por el fine-tuning.

## Limitaciones y advertencias

- Modelo de investigación con backdoor deliberado: no debe usarse en producción ni en aplicaciones orientadas a usuarios finales.
- El disparador y el efecto exacto del backdoor no están documentados públicamente; el comportamiento puede ser impredecible.
- Riesgo elevado de respuestas manipuladas o sesgadas ante entradas que activen el backdoor.
- Riesgo de alucinación inherente al modelo base, potencialmente agravado por el fine-tuning.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad.
- Licencia Apache 2.0 permite uso comercial según los términos, pero el uso comercial de un artefacto con backdoor es desaconsejable y potencialmente engañoso.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento ni de la magnitud del efecto del backdoor.
- Sin datos sobre el dataset de entrenamiento: no es posible evaluar sesgos introducidos durante el fine-tuning.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
