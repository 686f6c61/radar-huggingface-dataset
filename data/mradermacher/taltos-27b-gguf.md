# mradermacher/Taltos-27B-GGUF

## Resumen

Taltos-27B es un modelo de lenguaje y vision de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por Flashtond22 y publicado bajo licencia Apache 2.0. Está orientado principalmente al húngaro (magyar) y al inglés, y combina capacidades de razonamiento con procesamiento de visión y lenguaje, según indican las etiquetas de su model card. La versión aquí descrita es una cuantización GGUF estática producida por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en dos factores. Por un lado, Taltos-27B cubre un nicho poco poblado: modelos de gran tamano con soporte nativo de húngaro y capacidades multimodales. Por otro, la disponibilidad de cuantizaciones GGUF desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), junto con los ficheros mmproj para el codificador visual, facilita el despliegue local sin necesidad de GPUs de centro de datos.

No obstante, la información pública disponible es limitada: la model card del autor original no está incluida en la información proporcionada, no se han publicado resultados de benchmarks y no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni los idiomas exactos más allá de las etiquetas hu y en. Esta ficha refleja únicamente los datos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal vision-lenguaje, segun etiquetas) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | húngaro (hu) e inglés (en), segun etiquetas de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 190,8 GB |
| Modelo base | Flashtond22/Taltos-27B |
| Cuantizador | mradermacher (cuantizaciones estaticas, sin imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. Las etiquetas de la model card indican que se trata de un modelo de razonamiento y vision-lenguaje, con soporte de transformers y pesos en safetensors en el repositorio base. El número de parámetros (27,3 B) es compatible con un transformer denso de gran tamano, pero no se confirma si emplea atención completa, atención lineal, arquitectura híbrida o mezcla de expertos.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio GGUF es una plantilla generada por mradermacher que documenta el proceso de cuantización (convert_type: hf, output_tensor_quantised: 1, quantize_version: 2) pero no las características del entrenamiento original. Para obtener estos datos sería necesario consultar el repositorio del modelo base Flashtond22/Taltos-27B, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto conversacional en húngaro e inglés, según las etiquetas de idioma de la model card.
- Razonamiento (etiqueta reasoning), orientado a tareas que requieren cadenas de pensamiento o resolución de problemas.
- Procesamiento de visión y lenguaje: el repositorio incluye ficheros mmproj (Q8_0 y f16) que actúan como suplemento multimodal, lo que permite el procesamiento de imágenes junto con texto.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que sugiere integración con infraestructuras de inferencia estándar.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque la etiqueta reasoning apunta en esa dirección.
- Capacidades multilingües: limitadas a húngaro e inglés según la información disponible.

## Casos de uso

- Atención al cliente en húngaro: el modelo puede gestionar conversaciones multi-turno en húngaro e inglés, un par de idiomas poco cubierto por modelos abiertos de gran tamano. Adecuado para empresas que operan en Hungría y necesitan un asistente local sin depender de APIs externas.
- Procesamiento de documentos con imágenes: gracias a los ficheros mmproj, puede emplearse para extraer información de facturas, formularios escaneados o capturas de pantalla, combinando OCR implícito con razonamiento sobre el contenido.
- Asistencia en razonamiento técnico: la etiqueta reasoning sugiere uso en tareas de resolución de problemas paso a paso, como análisis de incidencias o diagnóstico de errores en documentación técnica.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (16,9 GB) y Q5_K_M (19,6 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, útil para prototipado y desarrollo sin conexión.
- Investigación lingüística en húngaro: como uno de los pocos modelos abiertos de 27 B con soporte declarado de húngaro, sirve para estudios de generación, traducción y evaluación de sesgos en ese idioma.
- Generación de contenido multimodal en entornos educativos: combinación de texto e imágenes para materiales didácticos, con la ventaja de la licencia Apache 2.0 para uso institucional.
- Integración en pipelines de inferencia compatibles con endpoints: la etiqueta endpoints_compatible facilita su despliegue en servidores de inferencia estándar para aplicaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar el codificador visual):
  - Q2_K: ~11,0 GB de pesos; ~13-14 GB de VRAM con overhead de contexto.
  - Q3_K_M: ~13,6 GB de pesos; ~16 GB de VRAM.
  - IQ4_XS: ~15,5 GB de pesos; ~18 GB de VRAM.
  - Q4_K_M: ~16,9 GB de pesos; ~20 GB de VRAM.
  - Q5_K_M: ~19,6 GB de pesos; ~23 GB de VRAM.
  - Q6_K: ~22,5 GB de pesos; ~26 GB de VRAM.
  - Q8_0: ~29,1 GB de pesos; ~32 GB de VRAM.
- Codificador visual (mmproj): 0,7 GB (Q8_0) o 1,0 GB (f16) adicionales.
- GPU recomendadas: para Q8_0, A100 40 GB, H100 o RTX A6000 48 GB. Para Q5_K_M y Q6_K, RTX 4090 24 GB o RTX 3090 24 GB (Q6_K puede requerir offloading parcial). Para Q4_K_M e inferiores, RTX 4090, RTX 3090, RTX 4080 16 GB (con offloading parcial en Q4_K_M).
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M o inferiores con 24 GB de VRAM; Q2_K y Q3_K_S pueden caber en GPUs de 16 GB con offloading parcial de capas a CPU.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), LM Studio, y servidores compatibles con la API de OpenAI a través de llama.cpp server. Para el modelo base en safetensors, vLLM o TGI, aunque no se confirma compatibilidad explícita.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la cuantización y la longitud de contexto, que no se especifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Taltos-27B (GGUF) | ~27,3 B | no disponible | hu, en | Apache 2.0 | GGUF | Visión-lenguaje, razonamiento |
| Gemma 2 27B | ~27 B | 8.192 tokens | multilingüe (amplio) | Gemma License | safetensors, GGUF | Sin visión en la variante de texto; contexto mayor |
| Qwen2.5-VL 32B | ~32 B | 128K tokens (aprox.) | multilingüe (amplio) | Apache 2.0 | safetensors, GGUF | Visión-lenguaje, contexto muy amplio |
| Mistral Small 3 24B | ~24 B | 32K tokens | multilingüe (amplio) | Apache 2.0 | safetensors, GGUF | Sin visión; enfocado a texto y código |

La comparación se basa en características públicas de modelos de tamano similar; no se dispone de datos de rendimiento comparativo para Taltos-27B. La principal diferencia de Taltos-27B frente a las alternativas es su especialización declarada en húngaro, un idioma escasamente cubierto por los modelos generalistas.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin realizar pruebas propias.
- Información incompleta sobre el modelo base: se desconoce la longitud de contexto, la composición del dataset y el proceso de alineación, lo que dificulta prever su comportamiento en producción.
- Cobertura lingüística limitada: solo se declaran húngaro e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación: inherente a los modelos de 27 B sin datos de evaluación publicados; se recomienda validación humana en aplicaciones críticas.
- Sesgos: no se han documentado sesgos conocidos, pero la falta de transparencia sobre los datos de entrenamiento impide descartarlos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda verificar las condiciones del modelo base (Flashtond22/Taltos-27B) por si hubiera restricciones adicionales no reflejadas en la información disponible.
- Cuantizaciones estáticas sin imatrix: el repositorio i1-GGUF (con imatrix) se menciona como disponible por separado; las cuantizaciones de este repositorio pueden perder calidad frente a las ponderadas, especialmente en Q2_K y Q3_K.
- Contexto no especificado: planificar el despliegue sin asumir una ventana concreta; verificar en la configuración del modelo base.
- Fecha de creación del repositorio (2026-08-17) y actualización (2026-10-11): comprobar si existen revisiones posteriores del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Taltos-27B-GGUF
- Modelo base: https://huggingface.co/Flashtond22/Taltos-27B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Taltos-27B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Taltos-27B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
