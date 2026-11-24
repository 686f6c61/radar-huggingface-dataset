# mradermacher/Colossus-2.1-GGUF

## Resumen

Colossus-2.1-GGUF es la distribucion en formato GGUF del modelo Colossus-2.1, desarrollado originalmente por KSTRLAI y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 4.022 millones de parametros (4B) orientado a tareas de matematicas, fisica, generacion de codigo y conversacion. La informacion de la model card lo etiqueta con la familia `qwen3`, lo que sugiere que su arquitectura deriva de la familia Qwen3, aunque no se detalla explicitamente la arquitectura en la documentacion disponible.

El modelo original se publica bajo licencia Apache 2.0 y esta disponible en formato transformers (safetensors), mientras que esta version ofrece los pesos en GGUF para su uso con llama.cpp y herramientas compatibles. El repositorio contiene un conjunto completo de cuantizaciones estaticas que van desde Q2_K (1,8 GB) hasta f16 (8,2 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo.

La relevancia de esta ficha radica en que facilita la evaluacion rapida del modelo para desarrolladores que necesitan un modelo compacto de 4B especializado en razonamiento cientifico y codigo, con opciones de cuantizacion que lo hacen viable en entornos con recursos limitados. No obstante, la documentacion publicada es escasa: no se detallan la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetado como familia `qwen3`; probable transformer, sin confirmar) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. La model card lo etiqueta con el tag `qwen3`, lo que apunta a una arquitectura de tipo transformer decoder-only derivada o compatible con la familia Qwen3, pero no se confirma explicitamente ni se detallan aspectos como el tipo de atencion, la presencia de capas MoE o el uso de atencion lineal.

Tampoco se especifican los datos de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Los tags `math`, `physics` y `code` sugieren un enfasis en dominios cientificos y de programacion, pero se desconoce como se configuro ese entrenamiento. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulativa y no se incluye.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag `chat`, `conversational`).
- Razonamiento matematico (tag `math`).
- Razonamiento en fisica (tag `physics`).
- Generacion de codigo (tag `code`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere soporte para despliegue como servicio compatible con APIs de inferencia.
- Capacidades multilingues: limitadas al ingles segun la model card; no se documentan otros idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia en resolucion de problemas matematicos: el modelo puede emplearse como tutor o asistente para resolver ecuaciones, explicar pasos intermedios y verificar resultados, aprovechando su especializacion en `math` y su tamano compacto para despliegue local.
- Apoyo a estudiantes de fisica: dado el tag `physics`, puede utilizarse para explicar conceptos, resolver problemas de mecanica o electromagnetismo y generar ejercicios, con la ventaja de poder ejecutarse en hardware de consumo mediante cuantizaciones Q4_K_M o Q5_K_M.
- Generacion de codigo en entornos con recursos limitados: con 4B parametros y cuantizacion Q4, puede integrarse en editores o pipelines de CI/CD para autocompletado, generacion de tests o explicacion de fragmentos de codigo, aunque sin datos de benchmarks que confirmen su calidad frente a alternativas.
- Prototipado de chatbots conversacionales: su naturaleza `chat` y `conversational` permite construir asistentes conversacionales de proposito general o especializados en dominios cientificos, desplegables con llama.cpp u Ollama en una sola GPU.
- Inferencia local en portatiles o estaciones de trabajo: las cuantizaciones desde Q2_K (1,8 GB) hasta Q8_0 (4,4 GB) permiten ejecutar el modelo en GPUs de consumo con 4-8 GB de VRAM, lo que facilita pruebas offline y desarrollo sin dependencia de la nube.
- Evaluacion comparativa de modelos pequenos: util para investigadores que necesitan un modelo de 4B con licencia permisiva (Apache 2.0) como linea base en experimentos de razonamiento cientifico o generacion de codigo, pudiendo alternar entre cuantizaciones para estudiar el impacto en calidad.
- Despliegue como servicio compatible con endpoints: gracias al tag `endpoints_compatible`, puede servirse mediante infraestructuras que expongan una API compatible con OpenAI o similar, integrandose en aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - Q2_K: ~1,8 GB de pesos, aproximadamente 2,5-3 GB de VRAM con contexto moderado.
  - Q4_K_M: ~2,6 GB de pesos, aproximadamente 3,5-4 GB de VRAM.
  - Q8_0: ~4,4 GB de pesos, aproximadamente 5,5-6 GB de VRAM.
  - f16: ~8,2 GB de pesos, aproximadamente 9-10 GB de VRAM.
- GPU recomendadas:
  - Consumer: RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070, RTX 4090.
  - Profesionales: A100, H100 (sobredimensionadas para este tamano, utiles para servir multiples instancias).
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 6 GB o mas de VRAM usando cuantizaciones Q4 o Q5; las cuantizaciones Q2 y Q3 caben en GPUs con 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors (no confirmado en la documentacion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Colossus-2.1 (este modelo) | 4B | No disponible | Apache 2.0 | GGUF, safetensors | Especializado en math, physics y code |
| Qwen3 (variantes de ~4B) | ~4B | No disponible en esta ficha | Apache 2.0 (segun familia) | GGUF, safetensors | Familia referenciada por los tags; comparacion directa no confirmada |
| Otros modelos de 4B de proposito general | ~4B | Variable | Variable | GGUF, safetensors | No disponible comparacion concreta sin datos de benchmarks |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Idiomas: la model card solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide garantizar su idoneidad para tareas de contexto largo.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K u otras metricas, por lo que la calidad real del modelo no puede verificarse objetivamente.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion incorrecta, especialmente en dominios cientificos donde la precision es critica; se recomienda verificacion humana.
- Sesgos: no se documentan evaluaciones de sesgo; al desconocerse la composicion del dataset de entrenamiento, no se pueden descartar sesgos.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_M degradan la calidad de forma notable segun las notas del cuantizador; para produccion se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permisiva para uso comercial, pero el modelo base es de un tercero (KSTRLAI) y conviene verificar la model card original por si hubiera condiciones adicionales no reflejadas en esta ficha.
- Documentacion escasa: la falta de informacion sobre entrenamiento, arquitectura y evaluacion limita la confianza para despliegues en produccion sin validacion previa.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Colossus-2.1-GGUF
- Modelo base original: https://huggingface.co/KSTRLAI/Colossus-2.1
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Colossus-2.1-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Colossus-2.1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
