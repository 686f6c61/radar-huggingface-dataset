# IsValorum/Axion-1.0-35B-Q8_0-GGUF

## Resumen

Axion-1.0-35B-Q8_0-GGUF es la cuantización en Q8_0 del modelo base Axion1-0/Axion-1.0-35B, publicada por el usuario independiente IsValorum dentro de su serie "APEX Quantization Series". El modelo base es un transformer híbrido de tipo MoE (mixture of experts) con 34.660.610.688 parámetros totales y una arquitectura que combina 30 capas de atención lineal/SSM con 10 capas de atención completa, sobre un total de 40 capas. La ventana de contexto declarada es de 262.144 tokens y el vocabulario de 248.320 entradas.

La relevancia de esta ficha concreta es que se trata de un artefacto de cuantización listo para `llama.cpp`, con un mapa de tensores auditado y una política de precisión mixta que mantiene en F32 los componentes sensibles (convoluciones 1D del SSM, parámetros de estado, routers de expertos y RMSNorms), mientras cuantiza a Q8_0 el resto de pesos. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales de entrada imagen+texto, aunque la model card no detalla el codificador visual.

El repositorio tiene 36,9 GB y licencia Apache 2.0. En el momento de la consulta no registra descargas ni likes, y la evaluación empírica de perplejidad y retención de fidelidad figura como "pending" en la propia model card. El autor indica que el cálculo se realizó con clústeres cloud financiados de su bolsillo y que este archivo Q8_0 sirve como fuente de calibración para la I-Matrix de la familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 40 capas (30 de atención lineal/SSM + 10 de atención completa), 256 expertos enrutados + 1 compartido, 8 activos |
| Parámetros totales | 34.660.610.688 (34,66 B) |
| Parámetros activos | no disponible (8 de 256 expertos enrutados + 1 compartido; el número exacto de parámetros activos no se publica) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q8_0 (con tensores seleccionados en F32); esta ficha es la variante Q8_0 de la familia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |
| Dimensión oculta | 2048 |
| Vocabulario | 248.320 tokens |
| Tamaño del repositorio | 36,9 GB |
| Modelo base | Axion1-0/Axion-1.0-35B |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con mezcla de expertos. De las 40 capas totales, 30 son capas de atención lineal basadas en SSM (state space model) y 10 son capas de atención completa, distribuidas según el mapa de tensores en las capas 3, 7, ..., 39. Cada capa MoE contiene 256 expertos enrutados más un experto compartido, con 8 expertos activos por token. La dimensión oculta es 2048 y el vocabulario es de 248.320 entradas. Esta combinación de SSM y atención completa busca reducir el coste computacional en contextos largos manteniendo capacidad de atención global en capas seleccionadas.

En cuanto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La model card de esta cuantización no incluye esos datos y la del modelo base no se ha proporcionado. La innovación técnica documentada en esta ficha es la política de cuantización: las convoluciones 1D del SSM, los parámetros de estado (`ssm_a`, `ssm_dt.bias`, `ssm_norm.weight`), los routers de expertos (`ffn_gate_inp`, `ffn_gate_inp_shexp`), las RMSNorms y las normas de atención se mantienen en F32 para preservar la estabilidad del estado recurrente y del enrutamiento, mientras el resto de matrices se cuantiza a Q8_0. No se ha usado iMatrix en esta variante; el propio archivo sirve como fuente de calibración para la I-Matrix de la familia.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` del repositorio.
- Procesamiento de entrada imagen+texto (`image-text-to-text`), aunque no se detalla el codificador visual ni la resolución soportada.
- Razonamiento multi-turno con ventana de contexto de 262.144 tokens, adecuada para documentos extensos y conversaciones largas.
- Mezcla de expertos con 8 expertos activos por token, lo que permite un cómputo por token menor que el de un modelo denso del mismo tamaño total.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir informes, contratos o expedientes completos en una sola pasada sin chunking, lo que simplifica pipelines de extracción y resumen.
- Asistentes conversacionales de dominio: la combinación de contexto largo y arquitectura híbrida SSM/atención reduce el coste por token en conversaciones multi-turno prolongadas, adecuado para atención al cliente con historial extenso.
- Análisis de imágenes con texto asociado: el pipeline `image-text-to-text` permite tareas de descripción, extracción de información o respuesta a preguntas sobre imágenes acompañadas de instrucciones textuales.
- Despliegue en local con llama.cpp: al estar en GGUF Q8_0, se puede ejecutar con `llama.cpp` u Ollama en estaciones de trabajo con suficiente memoria, sin depender de servicios cloud.
- Evaluación de cuantizaciones: al ser la fuente de calibración de la I-Matrix de la familia, sirve como referencia para comparar perplejidad y fidelidad frente a otras variantes de la serie APEX.
- Investigación sobre arquitecturas híbridas SSM/atención: el mapa de tensores auditado y la separación de precisión por grupo facilitan estudiar el impacto de la cuantización en cada componente del modelo.
- Prototipado de pipelines multimodales: útil para validar flujos que combinan imagen y texto antes de migrar a una variante de menor precisión o a un despliegue en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card marca como "pending" las métricas de perplejidad, delta frente a BF16 y retención de fidelidad tanto para el modelo base BF16 como para la variante Q8_0.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 36,9 GB, por lo que se necesita al menos esa cantidad de memoria (GPU o RAM unificada) más el overhead de contexto KV. Para 262.144 tokens de contexto el coste adicional de KV puede ser considerable y no está cuantificado en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, encajan GPU de 48 GB o más (A6000, L40S, A100 80 GB, H100) para mantener el modelo completo en VRAM.
- GPU de consumo: no cabe en GPUs de 24 GB (RTX 4090, 3090) a Q8_0; requeriría cuantizaciones menores de la familia, que no se listan en esta ficha.
- Opciones de despliegue: `llama.cpp` (formato nativo GGUF), Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (MoE híbrido SSM/atención de ~35 B) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al no haber información sobre el dataset de entrenamiento, no se puede evaluar su sesgo demográfico, lingüístico o cultural.
- Riesgo de alucinación: no cuantificado; no hay benchmarks publicados que permitan estimarlo.
- Idiomas soportados no declarados: no se puede garantizar calidad fuera del idioma o idiomas con los que se entrenó el modelo base.
- La cuantización Q8_0 introduce una pérdida de precisión respecto a BF16; la retención de fidelidad y el delta de perplejidad figuran como "pending", por lo que no hay evidencia publicada de la magnitud de esa pérdida.
- El contexto de 262.144 tokens exige memoria adicional para KV cache; el coste real por secuencia no está documentado.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Axion1-0/Axion-1.0-35B, ya que esta ficha solo cubre la cuantización.
- Repositorio sin descargas ni likes y con fecha de creación reciente: no hay validación comunitaria ni informes independientes de calidad.
- El pipeline `image-text-to-text` está declarado, pero no se detalla el codificador visual ni los formatos de imagen admitidos; conviene validar el soporte multimodal antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/IsValorum/Axion-1.0-35B-Q8_0-GGUF
- Modelo base: https://huggingface.co/Axion1-0/Axion-1.0-35B
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
