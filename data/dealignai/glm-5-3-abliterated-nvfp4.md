# dealignai/GLM-5.3-ABLITERATED-NVFP4

## Resumen

GLM-5.3-ABLITERATED-NVFP4 es un repositorio alojado en Hugging Face por el usuario dealignai que, según los metadatos de la plataforma, contiene una conversión del modelo base zai-org/GLM-5.3 con cuantización NVFP4 (formato de 4 bits de NVIDIA) y una modificación de alineación que el autor denomina "abliterated". El dato de parámetros totales reportado por los safetensors es de 390.942.074.880 parámetros (aproximadamente 391 mil millones), lo que sitúa al modelo en la categoría de modelos densos de gran escala, con un tamaño de repositorio de 464,9 GB.

La model card es explícita: el repositorio ha sido movido y su contenido es idéntico a dealignai/GLM-5.3-UNCENSORED-NVFP4, que es el repositorio que debe utilizarse en adelante. Los ficheros de este repositorio han sido eliminados y solo se conserva para preservar enlaces antiguos. Por tanto, cualquier descarga o despliegue debe realizarse desde el repositorio sucesor, no desde este.

La relevancia de esta ficha es limitada por la escasez de información técnica verificable: no hay pipeline declarado, no hay resultados de benchmarks, no hay model card técnica con detalles de entrenamiento y el único idioma declarado es el inglés. La licencia indicada es MIT, aunque conviene contrastarla con la del modelo base antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base zai-org/GLM-5.3; no se detalla en la información proporcionada) |
| Parámetros totales | 390.942.074.880 (dato de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (cuantización de 4 bits, según el nombre del repositorio); no se detallan otras variantes |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (según metadatos de parámetros); librería declarada: MLX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El nombre del repositorio y los metadatos indican que se trata de una conversión del modelo base zai-org/GLM-5.3, con cuantización NVFP4 y una intervención de "abliteration" (modificación de pesos orientada a reducir los comportamientos de rechazo aprendidos en el alineamiento). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o similares.

Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. La librería declarada es MLX, lo que sugiere que la conversión está orientada al ecosistema de Apple Silicon, aunque el formato NVFP4 es nativo de hardware NVIDIA, lo que introduce una ambigüedad técnica que la documentación no resuelve.

## Capacidades

- Generación de texto en inglés: el único idioma declarado en los metadatos es `en`.
- Razonamiento y conversación multi-turno: capacidad esperable en un modelo del tamaño del base, pero no documentada explícitamente en la información disponible.
- Generación de código y matemáticas: no confirmado en la documentación proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.
- Efecto de la abliteration: se espera una reducción de las negativas a peticiones que el modelo base rechazaría, pero no hay evaluación publicada que lo cuantifique.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo la abliteration afecta a las tasas de rechazo y a la calidad general, comparando contra el modelo base zai-org/GLM-5.3 en el mismo conjunto de prompts.
- Evaluación de cuantización NVFP4: sirve para medir la degradación de calidad y el ahorro de memoria frente a los pesos originales en precisión completa, en entornos con GPU NVIDIA que soporten FP4.
- Experimentación en Apple Silicon con MLX: la librería declarada permite probar el modelo en flujos de trabajo MLX, siempre que la conversión NVFP4 sea compatible con el backend, algo que debe verificarse antes de invertir tiempo.
- Generación de texto en inglés para prototipos: con 391 mil millones de parámetros, es adecuado para tareas de generación y razonamiento en inglés en entornos de investigación con recursos suficientes.
- Estudio de robustez frente a jailbreaks: al ser un modelo "abliterated", es un caso de estudio para medir la eficacia de las defensas del modelo base y el impacto de eliminar las capas de rechazo.
- Reproducibilidad de conversiones comunitarias: útil para auditar cómo se generan y publican variantes cuantizadas de modelos grandes y qué metadatos se conservan o se pierden en el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmética, 390,9 mil millones de parámetros en 4 bits suponen aproximadamente 195 GB solo de pesos, a los que hay que sumar caché KV y overhead; en 8 bits serían unos 391 GB y en 16 bits unos 782 GB.
- GPU recomendadas: no disponible. Por el volumen de pesos, un despliegue en 4 bits requiere múltiples GPU de 80 GB (A100/H100) o hardware con memoria unificada muy grande.
- ¿Cabe en GPU de consumo? No de forma realista: ni siquiera en 4 bits los pesos caben en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB).
- Opciones de despliegue: la librería declarada es MLX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato NVFP4 limita los backends compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dealignai/GLM-5.3-ABLITERATED-NVFP4 | 390,9 mil millones | no disponible | MIT | Repo movido; usar el sucesor | Conversión comunitaria NVFP4 + abliteration |
| dealignai/GLM-5.3-UNCENSORED-NVFP4 | no disponible | no disponible | no disponible | Activo (repo sucesor) | Mismo contenido según la model card |
| zai-org/GLM-5.3 | no disponible | no disponible | no disponible | Modelo base original | Referencia para comparar degradación por cuantización y abliteration |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Repositorio obsoleto: los ficheros han sido eliminados y el contenido se ha movido a dealignai/GLM-5.3-UNCENSORED-NVFP4; descargar desde aquí no es fiable.
- Abliteration: la eliminación de comportamientos de rechazo puede aumentar la probabilidad de generar contenido dañino, sesgado o inexacto, y reduce las salvaguardas del modelo base.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Licencia: los metadatos indican MIT, pero debe verificarse la licencia del modelo base zai-org/GLM-5.3, que puede imponer restricciones adicionales para uso comercial.
- Alucinación: sin benchmarks ni evaluación publicada, no hay datos sobre la tasa de alucinación ni sobre la degradación introducida por la cuantización NVFP4.
- Compatibilidad: la combinación de librería MLX y cuantización NVFP4 no está documentada y puede no funcionar en los backends habituales.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Hardware: el tamaño del modelo excluye el despliegue en GPU de consumo y exige infraestructura multi-GPU o memoria unificada de gran capacidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dealignai/GLM-5.3-ABLITERATED-NVFP4
- Repositorio sucesor: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
