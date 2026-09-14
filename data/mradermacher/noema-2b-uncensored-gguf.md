# mradermacher/Noema-2B-uncensored-GGUF

## Resumen

Noema-2B-uncensored-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo BossDefender/Noema-2B-uncensored, publicado por mradermacher. No se trata de un modelo nuevo ni de un reentrenamiento: mradermacher actúa únicamente como cuantizador, tomando los pesos originales del modelo base y generando versiones comprimidas listas para su ejecución con llama.cpp y derivados. El modelo tiene 1.881.825.088 parámetros reales (aproximadamente 1,88 mil millones), lo que lo sitúa en la gama de modelos pequenos orientados a inferencia local.

El repositorio incluye 12 cuantizaciones estáticas que van desde Q2_K (1,1 GB) hasta f16 (3,9 GB), pasando por las recomendadas Q4_K_S y Q4_K_M (1,3 y 1,4 GB respectivamente). El tamaño total del repositorio es de 18,1 GB. El idioma declarado es únicamente inglés y la etiqueta principal del modelo es "conversational", lo que apunta a un uso de chat o diálogo. No hay información publicada sobre la longitud de contexto, la licencia, la arquitectura concreta ni el proceso de entrenamiento.

La relevancia de esta ficha es práctica: se trata de un modelo pequeno, presumiblemente ajustado para reducir los mecanismos de rechazo (la denominación "uncensored" es explícita), distribuido en cuantizaciones que caben en cualquier GPU de consumo e incluso permiten inferencia en CPU. Su interés principal está en experimentación local, generación de datos sintéticos y estudios comparativos de cuantización, no en despliegues de producción con requisitos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo contiene cuantizaciones; la model card no especifica la arquitectura del modelo base) |
| Parametros totales | 1.881.825.088 (≈1,88 B), dato real de safetensors del modelo base |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors, formato transformers) |
| Modelo base | BossDefender/Noema-2B-uncensored |
| Cuantizador | mradermacher (cuantizaciones estáticas, sin imatrix ni weighted quants) |
| Tamano del repositorio | 18,1 GB |
| Fecha de creación registrada | 2026-09-14 |
| Ultima actualización registrada | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura del modelo base, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio de cuantizaciones se limita a indicar que se trata de cuantizaciones estáticas del modelo BossDefender/Noema-2B-uncensored, con los metadatos internos de la herramienta de cuantización (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica explícitamente que no hay cuantizaciones con imatrix o ponderadas disponibles en el momento de la publicación, y que probablemente no las planee, aunque acepta peticiones mediante discusiones de la comunidad.

Lo único verificable técnicamente sobre el proceso de este repositorio es el pipeline de cuantización: conversión desde pesos HuggingFace a GGUF y generación de cuantizaciones estáticas en los niveles listados. No se ha aplicado ningún tipo de destilado, pruning ni modificación de los pesos más allá de la cuantización. Cualquier afirmación sobre innovaciones técnicas del modelo base (attention lineal, decodificación especulativa, mezcla de expertos) sería especulativa y no está respaldada por la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Diálogo multi-turno: el modelo base está etiquetado para uso conversacional, aunque no se documenta el formato de prompt ni la plantilla de chat.
- Ejecución local en hardware modesto gracias a las cuantizaciones de entre 1,1 GB y 3,9 GB.
- Compatibilidad con el ecosistema llama.cpp y con los endpoints compatibles indicados en las etiquetas del repositorio (endpoints_compatible).
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no documentadas; el único idioma declarado es inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El repositorio no incluye fichero mmproj, lo que descarta procesamiento multimodal en estas cuantizaciones.
- Ajuste orientado a reducir rechazos: la denominación "uncensored" del modelo base sugiere un entrenamiento de ajuste destinado a disminuir las negativas del modelo, aunque no se publica la metodología.

## Casos de uso

- Experimentación con cuantización: comparar la degradación de perplejidad y coherencia entre Q2_K, Q4_K_M, Q6_K y Q8_0 sobre el mismo prompt set, aprovechando que el repositorio ofrece 12 niveles distintos del mismo modelo.
- Prototipado de chat local en portátil: ejecutar la cuantización Q4_K_M (1,4 GB) con llama.cpp u Ollama en un equipo sin GPU dedicada para validar flujos de conversación antes de escalar a un modelo mayor.
- Generación de datos sintéticos de diálogo: producir corpus conversacionales en inglés para tareas de aumento de datos o para alimentar evaluaciones internas, dado el bajo coste por token de un modelo de 1,88 B de parámetros.
- Investigación en seguridad y red teaming: al ser un modelo explícitamente "uncensored", resulta útil como caso de estudio para medir hasta qué punto un ajuste sin alineación modifica el comportamiento ante peticiones sensibles, dentro de un entorno controlado.
- Punto de partida para fine-tuning adicional: al ser un modelo pequeno, se puede reentrenar o aplicar LoRA sobre los pesos del modelo base para adaptarlo a un dominio concreto (atención al cliente, soporte técnico, generación de guiones) con recursos limitados.
- Simulación de personajes y narrativa interactiva: la etiqueta conversacional y la ausencia de filtros lo hacen adecuado para prototipos de ficción interactiva y juegos de rol textuales en inglés, siempre que el despliegue no sea público sin moderación.
- Despliegue embebido o de borde: con cuantizaciones desde 1,1 GB, puede integrarse en aplicaciones de escritorio o dispositivos con memoria limitada donde no cabría un modelo de 7 B o superior.
- Pruebas de integración de endpoints compatibles: las etiquetas del repositorio indican compatibilidad con endpoints, lo que permite usarlo como modelo de prueba para validar pipelines de inferencia propios antes de moverlos a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han encontrado datos de evaluación del modelo base BossDefender/Noema-2B-uncensored en la información proporcionada. Los únicos datos cuantitativos disponibles son los tamanos de fichero de cada cuantización y el recuento de parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia (tamano de fichero + caché KV y overhead; estimación orientativa, no medida publicada):
  - Q2_K: 1,1 GB de fichero; aproximadamente 1,5–2 GB de VRAM.
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ4_XS: 1,1–1,3 GB; aproximadamente 1,7–2,2 GB.
  - Q4_K_S / Q4_K_M: 1,3–1,4 GB; aproximadamente 2–2,5 GB.
  - Q5_K_S / Q5_K_M: 1,5 GB; aproximadamente 2,2–2,8 GB.
  - Q6_K: 1,7 GB; aproximadamente 2,5–3 GB.
  - Q8_0: 2,1 GB; aproximadamente 3–3,5 GB.
  - f16: 3,9 GB; aproximadamente 4,5–5 GB.
- La caché KV depende de la longitud de contexto, que no está documentada; a mayor contexto, mayor consumo adicional de memoria.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para todas las cuantizaciones, incluidas las f16. Cabe holgadamente en GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, así como en A100 y H100 (ampliamente sobredimensionadas para este tamano).
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU dedicadas actuales, e incluso en iGPUs con memoria unificada para cuantizaciones bajas.
- Inferencia en CPU: viable en todas las cuantizaciones; el fichero de 1,1–1,4 GB permite ejecución en CPU con memoria RAM modesta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y otros frontends compatibles con GGUF. vLLM y TGI tienen soporte de GGUF limitado o experimental y no son la vía recomendada para este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las cuantizaciones.

## Comparativa con modelos similares

La comparativa se establece con modelos de tamano comparable y propósito conversacional. Los valores de contexto y licencia de los modelos alternativos corresponden a su documentación pública habitual y pueden variar según la versión.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Comentario |
|---|---|---|---|---|---|
| Noema-2B-uncensored-GGUF (este) | 1,88 B | no disponible | no disponible | GGUF; 12 cuantizaciones | Ajuste "uncensored"; sin datos de entrenamiento ni benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF, múltiples proveedores | Modelo alineado, multilingüe, con benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto muy amplio para su tamano; licencia con restricciones para grandes despliegues |
| Gemma-2-2B-it | 2,61 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Buen rendimiento en su gama; licencia con condiciones de uso |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens (según documentación del autor) | Apache 2.0 | safetensors, GGUF | Alternativa abierta y alineada de tamano casi idéntico |

Frente a estas alternativas, el punto diferencial de Noema-2B-uncensored no es el rendimiento (no hay datos que lo respalden) sino la ausencia de alineación de seguridad y la disponibilidad de un abanico amplio de cuantizaciones estáticas. En ausencia de licencia declarada, cualquier uso comercial queda en una situación jurídica indeterminada, lo que supone una desventaja objetiva frente a Qwen2.5, SmolLM2 o Llama 3.2, que sí publican términos de uso.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial está permitido. Esto es un bloqueo potencial para cualquier despliegue en producción.
- Ausencia total de benchmarks: no hay evaluación publicada de MMLU, HumanEval, GSM8K ni de calidad conversacional, por lo que el rendimiento real es desconocido y no se puede comparar con rigor con alternativas.
- Modelo "uncensored": la denominación indica un ajuste orientado a reducir los rechazos, lo que implica un riesgo elevado de generar contenido inapropiado, ofensivo o potencialmente dañino. No se recomienda su exposición directa al público sin una capa de moderación.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgos, toxicidad o representación.
- Riesgo de alucinación: no cuantificado, pero estructuralmente alto en modelos de menos de 2 B de parámetros, especialmente en tareas de conocimiento factual y matemáticas.
- Idiomas: únicamente inglés declarado. El rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Contexto: longitud no documentada. No se debe asumir una ventana larga; conviene verificar experimentalmente el punto en el que la calidad se degrada.
- Atribución de responsabilidad: al ser un repositorio de cuantización, mradermacher no es el autor del modelo. Los problemas de calidad, sesgo o licencia corresponden al modelo base BossDefender/Noema-2B-uncensored.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S, con 1,1 GB, implican una pérdida de calidad notable. Para uso serio se recomienda Q4_K_M o superior.
- Disponibilidad limitada: 0 descargas y 0 likes en el momento de la consulta, y sin cuantizaciones ponderadas (imatrix), lo que reduce la validación comunitaria del artefacto.
- Inexistencia de mmproj: estas cuantizaciones no soportan entrada multimodal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Noema-2B-uncensored-GGUF
- Modelo base: https://huggingface.co/BossDefender/Noema-2B-uncensored
- Página de resumen y listado de descargas del cuantizador: https://hf.tst.eu/model#Noema-2B-uncensored-GGUF
- Preguntas frecuentes y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad entre tipos de cuantización (gráfico de ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que soporta al cuantizador: https://www.nethype.de/
- Nota sobre la búsqueda web: los resultados proporcionados no contienen información relevante sobre el modelo; corresponden a páginas de simplificación de fracciones (69/23) y se han descartado.
