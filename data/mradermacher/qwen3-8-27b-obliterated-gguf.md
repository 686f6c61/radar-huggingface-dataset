# mradermacher/Qwen3.8-27B-OBLITERATED-GGUF

## Resumen

Qwen3.8-27B-OBLITERATED-GGUF es una compilación de cuantizaciones estáticas en formato GGUF del modelo OBLITERATUS/Qwen3.8-27B-OBLITERATED, publicada por el usuario mradermacher. El modelo subyacente deriva de la familia Qwen3 (identificador de arquitectura `qwen3` en la model card) y ha sido sometido a un proceso de *abliteration*, una técnica de modificación de pesos orientada a eliminar los mecanismos de rechazo y alineación de seguridad del modelo original. El resultado es un modelo "sin censura" (uncensored) orientado explícitamente a *red-teaming* e investigación en seguridad de IA.

El modelo cuenta con 27.320.697.856 parámetros totales (datos reales de los tensores en safetensors), lo que lo sitúa en la categoría de modelos densos de gran tamaño, no MoE. La model card declara únicamente el idioma inglés y licencia Apache 2.0. El repositorio GGUF ocupa 190,8 GB e incluye tanto cuantizaciones de texto como suplementos multimodales (`mmproj`), lo que indica que el modelo base conserva capacidades de visión.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas alternativas cuantizadas para ejecutar localmente un modelo de ~27B con capacidades multimodales; por otro, advierte de que se trata de un modelo deliberadamente desalineado, cuyas características lo hacen inadecuado para despliegues de producción convencionales y lo restringen a entornos de investigación controlados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, `model_type: qwen3`) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |
| Tamaño del repositorio | 190,8 GB |
| Modelo base | OBLITERATUS/Qwen3.8-27B-OBLITERATED |
| Autor de la cuantización | mradermacher |
| Descargas / likes | 12.589 / 52 |
| Fecha de creación | 2026-08-20 |
| Última actualización | 2026-10-07 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer denso de la familia Qwen3, según el campo `model_type: qwen3` de la model card. Con 27.320 millones de parámetros, se trata de un modelo denso de gran escala, no de una arquitectura de mezcla de expertos, por lo que todos los parámetros se activan en cada paso de inferencia. La presencia de ficheros `mmproj` (proyección multimodal) en el repositorio GGUF confirma que el modelo base incorpora un codificador visual y, por tanto, soporta entrada de imágenes además de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o decodificación especulativa. La modificación principal respecto al modelo original es el proceso de *abliteration*: una intervención sobre los pesos que busca neutralizar las direcciones de activación asociadas a los comportamientos de rechazo, lo que elimina las salvaguardas de alineación. Esta intervención se realizó en el modelo base (OBLITERATUS/Qwen3.8-27B-OBLITERATED), no en esta compilación, que se limita a cuantizar los pesos resultantes en formato GGUF mediante conversión desde safetensors.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat (`conversational` en los tags).
- Capacidades multimodales: los ficheros `mmproj` indican soporte de entrada de imágenes junto con texto.
- Razonamiento y generación de código heredados de la familia Qwen3, aunque no verificados en esta variante ablacionada.
- Ausencia deliberada de mecanismos de rechazo: el modelo responde a peticiones que el modelo original rechazaría.
- Orientación explícita a *red-teaming* y evaluación de seguridad (`red-team`, `ai-safety-research` en los tags).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere integración con infraestructuras de inferencia estándar.
- Soporte de cuantizaciones MLX además de GGUF (tag `mlx`).
- Idioma principal: inglés. No se declaran capacidades multilingües.

## Casos de uso

- **Investigación en seguridad de IA y red-teaming**: el modelo permite a equipos de seguridad evaluar la robustez de filtros, clasificadores y sistemas de moderación frente a un modelo sin salvaguardas, sirviendo como generador adversarial controlado en laboratorios.
- **Evaluación de técnicas de ablación**: investigadores que estudian el efecto de la abliteration pueden comparar el comportamiento de esta variante con el modelo Qwen3 original para medir la degradación de capacidades y la pérdida de alineación.
- **Despliegue local en estaciones de trabajo con GPU consumer**: la cuantización Q4_K_M (16,9 GB) permite ejecutar un modelo de 27B en GPUs con 24 GB de VRAM, algo inviable con los pesos en fp16 (unos 54 GB).
- **Pruebas de pipelines de inferencia con llama.cpp/Ollama**: los distintos niveles de cuantización (desde Q2_K de 11 GB hasta Q8_0 de 29,1 GB) permiten validar el rendimiento y la calidad de un mismo modelo en distintos presupuestos de memoria.
- **Generación de datos sintéticos para entrenamiento de clasificadores de seguridad**: el modelo puede producir ejemplos etiquetados de contenido problemático que alimenten datasets de moderación, siempre en un entorno aislado.
- **Investigación multimodal local**: gracias a los ficheros `mmproj`, es posible experimentar con tareas de imagen-texto en hardware local sin depender de APIs externas, útil para estudios de robustez multimodal.
- **Análisis de sesgos y comportamientos no deseados**: al carecer de rechazo, el modelo expone de forma más directa los sesgos latentes del entrenamiento original, facilitando su auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según el tamaño de cada cuantización, más overhead de contexto y caché KV):
  - Q2_K: ~11,0 GB de pesos; ~13-14 GB en ejecución.
  - Q3_K_M: ~13,6 GB; ~16 GB en ejecución.
  - IQ4_XS: ~15,5 GB; ~18 GB en ejecución.
  - Q4_K_M: ~16,9 GB; ~19-20 GB en ejecución (recomendado para 24 GB de VRAM).
  - Q5_K_M: ~19,6 GB; ~22-23 GB en ejecución.
  - Q6_K: ~22,5 GB; ~25 GB en ejecución.
  - Q8_0: ~29,1 GB; requiere 32 GB o más de VRAM.
  - Suplemento multimodal `mmproj`: entre 0,7 GB (Q8_0) y 1,0 GB (f16) adicionales.
- **GPU recomendadas**: RTX 3090/4090 (24 GB) para Q4_K_M e inferiores; A100 40 GB, H100 o RTX 6000 Ada para Q8_0 y contextos largos.
- **¿Cabe en GPU consumer?**: sí, en GPUs de 24 GB con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- **Latencia y throughput**: no disponibles. Como referencia orientativa, un modelo denso de 27B en Q4_K_M sobre una RTX 4090 suele situarse en el orden de decenas de tokens por segundo, pero no se dispone de mediciones publicadas para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED-GGUF (este) | 27,3B densos | no disponible | Apache 2.0 | GGUF | Abliterado, multimodal, solo inglés |
| Qwen3.8-27B-OBLITERATED (base) | 27,3B densos | no disponible | Apache 2.0 | safetensors | Sin cuantizar, ~54 GB en fp16 |
| Qwen3.8-27B-OBLITERATED-i1-GGUF | 27,3B densos | no disponible | Apache 2.0 | GGUF (imatrix) | Misma base con cuantizaciones ponderadas, mayor calidad por tamaño |
| Qwen3 original de 27B | no disponible en la información | no disponible | no disponible | no disponible | Modelo de referencia con alineación intacta |

No se dispone de datos de rendimiento comparado ni de especificaciones del modelo Qwen3 original en la información proporcionada.

## Limitaciones y advertencias

- **Modelo deliberadamente desalineado**: la abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o peligroso sin filtro. No debe exponerse a usuarios finales ni a APIs públicas.
- **Riesgo elevado de alucinación**: no se han publicado evaluaciones de fidelidad; la intervención sobre los pesos puede degradar la coherencia y la precisión factual respecto al modelo original.
- **Sesgos heredados y amplificados**: al suprimir el rechazo, los sesgos del entrenamiento original quedan expuestos de forma más directa.
- **Idioma**: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- **Licencia**: Apache 2.0 permite uso comercial según los términos de la licencia, pero el uso comercial de un modelo sin salvaguardas conlleva riesgos legales y reputacionales significativos según la jurisdicción (por ejemplo, obligaciones del Reglamento de IA de la UE).
- **Contexto**: no se ha publicado la longitud de contexto soportada; debe verificarse experimentalmente antes de usarla en producción.
- **Cuantizaciones de baja calidad**: Q2_K y Q3_K_S degradan notablemente la calidad; se recomienda Q4_K_M o superior para cualquier evaluación seria.
- **Trazabilidad**: esta compilación es una cuantización de terceros; los fallos de calidad pueden provenir del proceso de conversión y no del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-GGUF
- Modelo base: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-OBLITERATED-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
