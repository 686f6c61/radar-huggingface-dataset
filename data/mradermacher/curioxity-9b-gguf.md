# mradermacher/Curioxity-9B-GGUF

## Resumen

Curioxity-9B-GGUF es la versión cuantizada en formato GGUF del modelo Curioxity-9B, desarrollado originalmente por el usuario harsha2715 en Hugging Face y convertido a GGUF por mradermacher, un conocido creador de cuantizaciones de la comunidad. El modelo cuenta con 8.953.803.264 parámetros (aproximadamente 8,95 mil millones), lo que lo sitúa en la categoría de modelos de tamano medio, adecuados para despliegue en hardware de consumo con las cuantizaciones apropiadas.

La relevancia de esta ficha radica en que el repositorio GGUF facilita el uso del modelo mediante herramientas como llama.cpp u Ollama, sin necesidad de disponer del checkpoint original en safetensors. Sin embargo, la información pública disponible es muy limitada: no se especifican la arquitectura exacta, la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks. El modelo base está etiquetado como conversacional y orientado al idioma inglés.

El repositorio fue creado el 27 de noviembre de 2026 y actualizado el mismo día. El autor de las cuantizaciones (mradermacher) indica que se trata de cuantizaciones estáticas y que no hay disponibles cuantizaciones ponderadas o con imatrix en el momento de la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como transformers; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base harsha2715/Curioxity-9B. Por el tamano (8,95 B de parámetros) y la etiqueta `transformers`, se trata presumiblemente de un transformer decoder-only de la familia de modelos de 8-9 B, pero no se confirma en la información proporcionada. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT.

La única información técnica relevante es la relativa al proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (sin imatrix) en un rango que va desde Q2_K (4,0 GB) hasta f16 (18,0 GB). No se documentan innovaciones técnicas específicas del modelo base, como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational`, lo que indica que ha sido ajustado para mantener diálogos multi-turno.
- Idiomas: soporte documentado únicamente para inglés (`en`); no se confirman capacidades multilingües adicionales.
- Razonamiento y generación de código: no confirmado en la información disponible.
- Tool calling / function calling: no confirmado.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multimodales (visión, audio): no confirmadas.
- Modo de razonamiento explícito (thinking mode): no confirmado.

## Casos de uso

- Asistentes conversacionales en inglés: el modelo puede emplearse para chatbots de atención al cliente o asistentes personales en inglés, aprovechando su etiqueta de modelo conversacional. La cuantización Q4_K_M (5,8 GB) ofrece un equilibrio razonable entre calidad y requisitos de memoria.
- Prototipado rápido en local: gracias a las cuantizaciones Q2_K (4,0 GB) y Q3_K_S (4,4 GB), es posible ejecutar el modelo en equipos con GPU de gama media o incluso en CPU, lo que facilita experimentación sin infraestructura dedicada.
- Generación de texto creativo en inglés: para redacción de borradores, resúmenes o reescritura de contenido, siempre que se valide la calidad de salida mediante pruebas propias, dado que no hay benchmarks publicados.
- Despliegue en entornos con memoria limitada: la cuantización IQ4_XS (5,4 GB) permite integrar el modelo en contenedores o instancias con 8 GB de VRAM, como una RTX 3060 Ti o una RTX 4060.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite medir el impacto de la compresión en la calidad de salida para un caso de uso concreto antes de decidir la versión definitiva.
- Fines educativos y de investigación: útil para estudiar el comportamiento de modelos de ~9 B en formato GGUF y comparar técnicas de cuantización (K-quants frente a IQ-quants) en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~4,0 GB de pesos; con overhead de contexto, ~5-6 GB de VRAM.
  - Q4_K_M: ~5,8 GB de pesos; ~7-8 GB de VRAM recomendados.
  - Q8_0: ~9,6 GB de pesos; ~11-12 GB de VRAM recomendados.
  - f16: ~18,0 GB de pesos; ~20 GB de VRAM recomendados.
- GPU recomendadas:
  - Consumer: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 (12 GB) para cuantizaciones Q4-Q8.
  - Profesional: A100, H100 para f16 o despliegues con alto throughput.
- Cabe en GPU de consumo: sí, con cuantizaciones Q2_K a Q5_K_M en GPUs de 8-12 GB; Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles; dependen en gran medida del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparación rigurosa. A continuación se presenta una comparación estructural con alternativas de tamano similar, indicando únicamente los datos confirmados:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Curioxity-9B-GGUF | 8,95 B | no disponible | no disponible | GGUF |
| Alternativas de ~8-9 B | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables con datos verificables de rendimiento, contexto o licencia. Se recomienda consultar el modelo base harsha2715/Curioxity-9B para obtener información adicional.

## Limitaciones y advertencias

- Información muy limitada: no se documentan arquitectura, contexto, dataset de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.
- Licencia no especificada: al no indicarse la licencia, no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de cualquier uso en producción.
- Idioma: solo se documenta inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Riesgo de alucinación: sin datos de evaluación, no es posible cuantificar la tasa de alucinaciones; se recomienda validación humana en aplicaciones críticas.
- Sesgos: no se documentan sesgos conocidos, pero al no haber información sobre el dataset de entrenamiento, no se pueden descartar sesgos sistemáticos.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_M están marcadas por el autor como de menor calidad; para producción se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas disponibles, lo que puede afectar ligeramente a la calidad frente a alternativas con imatrix.
- Fecha de creación futura: el repositorio figura creado en noviembre de 2026, lo que puede indicar metadatos inconsistentes o un modelo muy reciente; conviene verificar su vigencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Curioxity-9B-GGUF
- Modelo base: https://huggingface.co/harsha2715/Curioxity-9B
- Página de descargas del autor: https://hf.tst.eu/model#Curioxity-9B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
