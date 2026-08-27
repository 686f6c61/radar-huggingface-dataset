# mradermacher/Celestial-Order-24B-V3-GGUF

## Resumen

Celestial-Order-24B-V3-GGUF es una colección de archivos GGUF cuantizados del modelo base Sorihon/Celestial-Order-24B-V3, preparada por mradermacher para su uso en inferencia local. El modelo original es un merge creado con mergekit, lo que sugiere una combinación de varios modelos base, aunque no se han publicado detalles sobre los componentes del merge. Con aproximadamente 23,6 mil millones de parámetros, se posiciona en el rango de modelos de 24B que buscan un equilibrio entre capacidad y requisitos de hardware.

La relevancia de esta versión GGUF radica en que permite ejecutar un modelo de este tamaño en hardware de consumo mediante cuantizaciones que reducen la huella de memoria. La colección incluye desde Q2_K (9,0 GB) hasta Q8_0 (25,2 GB), cubriendo desde configuraciones con VRAM limitada hasta GPUs de gama alta. El modelo está etiquetado como orientado a conversación y en inglés, pero no se especifican otros detalles técnicos como la longitud de contexto o la arquitectura exacta del merge.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo merge basado en transformers) |
| Parametros totales | 23.572.403.200 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (mencionado en comentarios) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base, Sorihon/Celestial-Order-24B-V3, es el resultado de un proceso de merge utilizando mergekit, una herramienta que combina múltiples modelos de lenguaje mediante técnicas como SLERP, ties o linear. No se han publicado detalles sobre los modelos componentes, la metodología de merge ni el dataset de entrenamiento. La arquitectura subyacente es presumiblemente un transformer de tipo decoder, común en modelos de lenguaje, pero no hay confirmación oficial. Tampoco se dispone de información sobre el proceso de entrenamiento, número de tokens, o si se aplicaron técnicas de RLHF o DPO.

La versión GGUF es una cuantización estática realizada por mradermacher, sin calibración de imatrix (aunque se menciona que los quants con imatrix podrían aparecer más adelante). Los archivos GGUF permiten ejecutar el modelo con bibliotecas como llama.cpp, Ollama o LM Studio, facilitando su uso en entornos locales.

## Capacidades

- Generación de texto en inglés, orientada a conversación (etiqueta "conversational").
- No se han documentado capacidades específicas de tool calling, function calling o razonamiento multi-step.
- No hay indicios de soporte multimodal (visión, audio).
- La cuantización no añade ni elimina capacidades funcionales del modelo original, solo afecta a la precisión y el rendimiento.
- No se dispone de información sobre capacidades multilingües más allá del inglés.

## Casos de uso

- Inferencia local en equipos con GPU de 12-24 GB VRAM: con cuantizaciones como Q4_K_M (14,4 GB) o Q5_K_M (16,9 GB) se puede ejecutar en una RTX 3090, 4090 o similar, permitiendo un asistente de chat local sin conexión a internet.
- Desarrollo de prototipos con llama.cpp: el formato GGUF es compatible con llama.cpp, lo que facilita experimentar con el modelo en entornos de desarrollo sin necesidad de una infraestructura cloud.
- Integración en aplicaciones de chat mediante Ollama: se puede importar el archivo GGUF en Ollama para exponer el modelo como un servicio de chat local, útil para pruebas de concepto o aplicaciones de nicho.
- Generación de texto asistida en tareas de escritura creativa o técnica: el modelo puede generar textos largos en inglés, aunque no se han documentado sus límites de contexto.
- Evaluación de modelos de 24B en hardware de consumo: permite comparar el rendimiento de este merge frente a otros modelos de tamaño similar en tareas de generación de texto.
- Uso en entornos sin conexión o con requisitos de privacidad: al ejecutarse localmente, los datos no salen del equipo, útil en aplicaciones sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, los tamaños de archivo varían desde 9,0 GB (Q2_K) hasta 25,2 GB (Q8_0). Para una ejecución con la mayor parte de la VRAM disponible, se recomienda al menos 16 GB para las versiones Q4_K_M o Q5_K_M, y 24 GB para Q6_K o Q8_0.
- GPU recomendadas: RTX 3090, RTX 4090, A6000, A100 (para las versiones más grandes). Las versiones Q4_K_M y Q5_K_M caben en GPUs con 16-24 GB de VRAM.
- Si cabe en consumer GPU: sí, las cuantizaciones Q4_K_M (14,4 GB) y Q5_K_M (16,9 GB) caben en GPUs de consumo como la RTX 4080 (16 GB) o RTX 4090 (24 GB). La versión Q8_0 (25,2 GB) necesita una GPU con más de 24 GB, como la RTX 4090 con 24 GB justo no cabe, requeriría 32 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, TGI (si se convierte a otros formatos), pero el formato GGUF está pensado para llama.cpp y sus derivados.
- Latencia y throughput: no se han proporcionado datos específicos. Dependerá de la GPU y la cuantización. En general, los quants más bajos son más rápidos pero con menor calidad.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos 24B GGUF en términos de rendimiento. Se menciona que existen otros modelos 24B como Goetia-24B (v1.3 y v1.2) en el ámbito de role-play, pero no hay datos de benchmarks comparables. La comparativa se limitaría a los tamaños de archivo y la disponibilidad de cuantizaciones, pero no a la calidad.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones específicas del modelo original.
- La licencia no está especificada, por lo que se desconoce si el uso comercial está permitido. Se recomienda contactar con el autor del modelo base antes de usar en producción.
- La longitud de contexto es desconocida, lo que puede llevar a errores si se utilizan secuencias largas.
- La cuantización estática (sin imatrix) puede producir una degradación de calidad en comparación con quants imatrix, especialmente en los valores más bajos como Q2_K o Q3_K.
- El modelo está orientado al inglés, no hay garantías de buen rendimiento en otros idiomas.
- No se ha documentado el proceso de merge, por lo que la calidad y comportamiento puede variar de forma impredecible.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Celestial-Order-24B-V3-GGUF
- Modelo base (Sorihon/Celestial-Order-24B-V3): https://huggingface.co/Sorihon/Celestial-Order-24B-V3
- Versión anterior V2: https://huggingface.co/mradermacher/Celestial-Order-24B-V2-GGUF
- Versión V2 con imatrix: https://huggingface.co/mradermacher/Celestial-Order-24B-V2-i1-GGUF
- Referencia sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guía de uso de GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF## Resumen

Celestial-Order-24B-V3-GGUF es una colección de archivos GGUF cuantizados del modelo original Sorihon/Celestial-Order-24B-V3, preparada por mradermacher para facilitar la inferencia local en hardware de consumo. El modelo base es un merge de 23.572 millones de parámetros, creado con mergekit, aunque no se han publicado los detalles de los modelos que lo componen ni la metodología de fusión. Su etiquetado como "conversational" y su idioma principal (inglés) lo orientan a tareas de chat y generación de texto, aunque carece de documentación técnica pública más allá de la cuantización.

La relevancia de esta versión GGUF radica en que permite ejecutar un modelo de 24B en GPUs con 12-24 GB de VRAM gracias a la variedad de cuantizaciones disponibles (desde Q2_K hasta Q8_0). La cuantización estática realizada por mradermacher no incluye calibración con imatrix, pero ofrece un equilibrio entre tamaño y calidad. No se han publicado benchmarks ni métricas de rendimiento del modelo original, por lo que su calidad real queda sin verificar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformers, presumiblemente decoder-only) |
| Parametros totales | 23.572.403.200 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (también mencionado IQ4_XS) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, Sorihon/Celestial-Order-24B-V3, es el resultado de un merge mediante mergekit, una herramienta que combina múltiples modelos de lenguaje mediante técnicas como weighted fusion o SLERP. No se ha publicado información sobre los modelos componentes, el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF, DPO, etc.). La arquitectura subyacente es presumiblemente un transformer de tipo decoder-only, común en modelos de esta escala, pero no hay confirmación oficial. La cuantización GGUF es estática, realizada por mradermacher, sin calibración con imatrix (aunque se menciona que podría añadirse posteriormente).

## Capacidades

- Generación de texto en inglés, con orientación a conversación (etiqueta "conversational").
- No se han documentado capacidades de tool calling, function calling ni razonamiento multi-step.
- No hay indicios de soporte multimodal (visión, audio) ni de modo "thinking".
- La cuantización no añade ni elimina capacidades funcionales del modelo original; solo afecta a la precisión numérica y al rendimiento.
- No se dispone de información sobre capacidades multilingües más allá del inglés.

## Casos de uso

- Inferencia local en GPU de consumo: con la cuantización Q4_K_M (14,4 GB) o Q5_K_M (16,9 GB) puede ejecutarse en tarjetas como la RTX 4090 (24 GB) o RTX 4080 (16 GB), permitiendo un asistente de chat local sin conexión.
- Desarrollo de prototipos con llama.cpp: el formato GGUF es compatible con llama.cpp, lo que facilita la integración en proyectos de investigación o desarrollo de aplicaciones de texto.
- Despliegue mediante Ollama o LM Studio: se puede importar el archivo GGUF en estos gestores para exponer el modelo como API local o interfaz de chat, útil para pruebas rápidas.
- Generación de contenido técnico o creativo en inglés: el modelo puede producir textos largos, aunque se desconoce su límite de contexto.
- Evaluación de modelos de 24B en hardware limitado: sirve para comparar el comportamiento de este modelo frente a otros de tamaño similar en tareas de lenguaje natural, aunque no hay benchmarks públicos.
- Uso en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del equipo, útil en aplicaciones sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño de archivo de cada cuantización, se requiere aproximadamente:
  - Q2_K (9,0 GB) → mínimo 12 GB de VRAM
  - Q4_K_M (14,4 GB) → mínimo 16 GB de VRAM
  - Q5_K_M (16,9 GB) → mínimo 20 GB de VRAM
  - Q6_K (19,4 GB) → mínimo 24 GB de VRAM
  - Q8_0 (25,2 GB) → mínimo 32 GB de VRAM (no cabe en GPU de 24 GB)
- GPUs recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A6000 (48 GB), A100 (40 GB) para las variantes más grandes. Las cuantizaciones Q4_K_M y Q5_K_M caben en RTX 4080 (16 GB) y RTX 4090 (24 GB).
- Software de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, entre otros. También puede convertirse a otros formatos para usar con vLLM o TGI, pero no es el formato nativo.
- Latencia y throughput: no se han proporcionado datos. En general, las cuantizaciones más bajas (Q2_K, Q3) son más rápidas pero con mayor pérdida de calidad; las más altas (Q8_0) son más lentas pero más fieles al modelo original.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. Se menciona en la búsqueda web la existencia de otros modelos 24B GGUF como Goetia-24B (v1.3 y v1.2), orientados a role-play, pero no hay benchmarks públicos que permitan una comparación objetiva. La comparación se limita a tamaños de archivo y cuantizaciones disponibles, no a rendimiento.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o comportamientos indeseados del modelo original.
- La licencia no está especificada, por lo que se desconoce si el uso comercial está permitido. Se recomienda verificar con el autor del modelo base antes de usar en producción.
- La longitud de contexto es desconocida, lo que puede causar errores si se usan secuencias largas.
- La cuantización estática (sin imatrix) puede degradar la calidad en los niveles bajos (Q2_K, Q3_K), afectando la coherencia del texto.
- El modelo solo está documentado para inglés; su rendimiento en otros idiomas es incierto.
- Al ser un merge sin documentación, el comportamiento puede ser impredecible en tareas específicas.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Celestial-Order-24B-V3-GGUF
- Modelo base (Sorihon/Celestial-Order-24B-V3): https://huggingface.co/Sorihon/Celestial-Order-24B-V3
- Versión anterior V2: https://huggingface.co/mradermacher/Celestial-Order-24B-V2-GGUF
- Versión V2 con imatrix: https://huggingface.co/mradermacher/Celestial-Order-24B-V2-i1-GGUF
- Guía de cuantizaciones GGUF (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
