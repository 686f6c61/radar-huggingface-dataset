# mradermacher/aidc-llm-laos-10k-gemma-3-12b-it-i1-GGUF

## Resumen

aidc-llm-laos-10k-gemma-3-12b-it-i1-GGUF es una cuantizacion GGUF, generada con la tecnica imatrix de mradermacher, del modelo Phonepadith/aidc-llm-laos-10k-gemma-3-12b-it. Se trata de un ajuste fino (fine-tuning) supervisado del modelo base Gemma 3 12B IT de Google, orientado especificamente al idioma lao (codigo ISO `lo`). El modelo original fue entrenado por Phonepadith sobre el dataset Phonepadith/laos-long-content, un corpus de contenido largo en lao, y esta pensado para mejorar la calidad de generacion conversacional en ese idioma frente al Gemma 3 original.

El modelo cuenta con 12.772.912.896 parametros totales (aproximadamente 12,8 mil millones), lo que lo situa en la gama de modelos densos de tamano medio. La version aqui descrita es la cuantizacion i1 (imatrix) en formato GGUF, que ofrece un abanico de niveles de compresion desde IQ1_S (3,4 GB) hasta Q6_K (10,6 GB), permitiendo desplegar el modelo en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo con aceleradores profesionales.

Su relevancia radica en dos factores: por un lado, cubre una laguna importante en el ecosistema open source, que es el soporte de calidad para idiomas de bajos recursos como el lao; por otro, al estar empaquetado en GGUF con cuantizaciones imatrix, resulta accesible para inferencia local con llama.cpp y herramientas compatibles, sin necesidad de infraestructura de servidor. La licencia es la Gemma de Google, que impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Gemma 3 12B IT) |
| Parametros totales | 12.772.912.896 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 12B IT soporta contextos largos, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; existe tambien una version estatica en mradermacher/aidc-llm-laos-10k-gemma-3-12b-it-GGUF |
| Idiomas soportados | lao (`lo`) |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B IT, un transformer denso decoder-only con atencion multi-cabeza y las optimizaciones propias de la familia Gemma 3 (entre ellas, soporte de contexto largo y mejoras en eficiencia de atencion, aunque los detalles exactos no se detallan en la informacion disponible). Sobre esa base, el autor del modelo original (Phonepadith) aplico un ajuste fino supervisado utilizando el dataset Phonepadith/laos-long-content, un corpus de contenido en lao de longitud considerable, segun indica el nombre del dataset y el identificador del modelo (`laos-10k`).

La cuantizacion aqui presentada ha sido realizada por mradermacher mediante la tecnica imatrix (importance matrix), que calibra los pesos durante la cuantizacion para preservar mejor la calidad en niveles de compresion agresivos. El repositorio incluye tambien el fichero `.imatrix.gguf` (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO posteriores al fine-tuning supervisado.

## Capacidades

- Generacion de texto conversacional en lao, con especial enfasis en contenido de tipo largo, segun el dataset de entrenamiento.
- Razonamiento y respuesta a instrucciones heredados del modelo base Gemma 3 12B IT.
- Capacidad de mantener conversaciones multi-turno (etiqueta `conversational` en el repositorio).
- Soporte de tool calling y function calling heredado del modelo base (no confirmado explicitamente en la informacion disponible para este fine-tuning).
- Capacidades multilingues limitadas: el modelo esta especializado en lao; el resto de idiomas del Gemma 3 original pueden degradarse tras el fine-tuning.
- No se confirman capacidades de vision, audio ni modo thinking en la informacion proporcionada, aunque el modelo base Gemma 3 12B IT es multimodal; el fine-tuning y la cuantizacion podrian no preservar dichas capacidades (el repositorio indica `skip_mmproj: 1`, lo que sugiere que el proyector multimodal no se incluye en los GGUF).

## Casos de uso

- Atencion al cliente en lao: el modelo puede gestionar conversaciones multi-turno en lao para soporte de productos o servicios, aprovechando su especializacion idiomatica y su capacidad conversacional. Adecuado para empresas que operan en Laos o con comunidades laoparlantes.
- Generacion de contenido editorial en lao: redaccion de articulos, resumenes y textos largos gracias al entrenamiento sobre el dataset laos-long-content, que prioriza contenido extenso.
- Traduccion asistida lao-espanol/ingles: aunque el modelo esta especializado en lao, puede emplearse como motor de generacion en el lado lao de un pipeline de traduccion, combinado con otro modelo para el otro idioma.
- Chatbots educativos en lao: asistencia a estudiantes laoparlantes en tareas de comprension lectora y redaccion, con un modelo que comprende el idioma nativo.
- Despliegue local en hardware de consumo: las cuantizaciones IQ4_XS (7,2 GB) y Q4_K_M (8,0 GB) permiten ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM mediante llama.cpp u Ollama, lo que facilita prototipos y demos sin infraestructura cloud.
- Investigacion en NLP de bajos recursos: el modelo sirve como punto de partida para experimentos de fine-tuning adicional, evaluacion de calidad en lao o comparacion de tecnicas de cuantizacion sobre un modelo especializado en un idioma minoritario.
- Generacion de resumenes de documentos largos en lao: la orientacion del dataset hacia contenido largo sugiere buen rendimiento en tareas de sintesis de textos extensos, aunque no se han publicado benchmarks que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del fichero GGUF mas overhead de contexto):
  - i1-IQ1_S (3,4 GB): ~4 GB de VRAM.
  - i1-IQ2_M (4,8 GB): ~5,5 GB de VRAM.
  - i1-IQ3_S (6,0 GB): ~7 GB de VRAM.
  - i1-IQ4_XS (7,2 GB): ~8 GB de VRAM.
  - i1-Q4_K_M (8,0 GB): ~9 GB de VRAM.
  - i1-Q5_K_M (9,2 GB): ~10,5 GB de VRAM.
  - i1-Q6_K (10,6 GB): ~12 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100 o H100 para despliegues con mayor concurrencia o contexto extendido.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones. Las versiones IQ4_XS y Q4_K_M son las mas recomendables para GPUs de 8-12 GB. Las cuantizaciones IQ1/IQ2 caben en GPUs de 4-6 GB, con perdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| aidc-llm-laos-10k-gemma-3-12b-it (este) | 12,8 B | no disponible | lao | Gemma | GGUF, safetensors | Fine-tuning especializado en lao |
| Gemma 3 12B IT (base) | 12 B | no disponible en esta ficha | multilingue | Gemma | safetensors, GGUF | Modelo generalista de Google; peor rendimiento en lao |
| mradermacher/aidc-llm-laos-10k-gemma-3-12b-it-GGUF | 12,8 B | no disponible | lao | Gemma | GGUF (estatico) | Misma base, cuantizacion estatica sin imatrix |
| Otros modelos especializados en lao | no disponible | no disponible | lao | no disponible | no disponible | No se dispone de comparativas publicadas |

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Gemma 3, hereda los sesgos del modelo base, que pueden amplificarse o modificarse tras el fine-tuning sobre un corpus especifico (laos-long-content) cuya composicion no se detalla.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa o inventada, especialmente en temas especializados o fuera del dominio del dataset de entrenamiento.
- Limitaciones de contexto e idioma: el modelo esta especializado en lao; su rendimiento en otros idiomas puede ser inferior al del Gemma 3 original. La longitud de contexto efectiva no se confirma en la informacion disponible.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, incluida la necesidad de aceptar los terminos y posibles restricciones para uso comercial. Debe revisarse antes de cualquier despliegue en produccion.
- Caveat de produccion: las cuantizaciones de baja calidad (IQ1, IQ2, Q2_K) degradan notablemente la coherencia; para produccion se recomienda IQ4_XS o superior. El modelo no incluye el proyector multimodal (`skip_mmproj: 1`), por lo que las capacidades de vision del Gemma 3 base no estan disponibles en estos GGUF.
- El repositorio tiene un tamano de 150,1 GB, lo que refleja la suma de todas las cuantizaciones; la descarga individual debe hacerse del fichero concreto deseado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/aidc-llm-laos-10k-gemma-3-12b-it-i1-GGUF
- Modelo base (fine-tuning): https://huggingface.co/Phonepadith/aidc-llm-laos-10k-gemma-3-12b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/Phonepadith/laos-long-content
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/aidc-llm-laos-10k-gemma-3-12b-it-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#aidc-llm-laos-10k-gemma-3-12b-it-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
