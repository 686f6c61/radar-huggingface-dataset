# mradermacher/xmodel-vl-GGUF

## Resumen

xmodel-vl es un modelo multimodal de visión-lenguaje orientado a la comprensión de vídeo, con especial énfasis en segmentación temporal de acciones (temporal action segmentation) en vídeo egocéntrico. El modelo original lo desarrolla heitong, y esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo parte de una arquitectura transformer multimodal con adaptadores LoRA y ha sido ajustado mediante GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo. Con aproximadamente 26.900 millones de parámetros en pesos safetensors, se sitúa en la gama de modelos de tamaño medio-grande, lo que condiciona sus requisitos de hardware.

La relevancia de esta publicación radica en que traduce un modelo de investigación especializado en vídeo a cuantizaciones prácticas (desde Q2_K hasta Q8_0) que reducen el peso de 28,7 GB a 11,2 GB, facilitando su despliegue local. Está disponible bajo licencia Apache 2.0 y soporta chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) con adaptadores LoRA y ajuste GRPO; detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base heitong/xmodel-vl es un modelo multimodal de visión-lenguaje construido sobre una arquitectura transformer con adaptadores LoRA. Según las etiquetas de la model card, ha sido ajustado mediante GRPO, una variante de aprendizaje por refuerzo que optimiza las respuestas del modelo frente a un grupo de candidatos. El modelo está especializado en comprensión de vídeo, en particular en segmentación temporal de acciones en escenarios egocéntricos (grabaciones en primera persona).

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni innovaciones técnicas específicas más allá de la combinación de LoRA y GRPO. El repositorio GGUF incluye además un componente `mmproj` (proyector multimodal) en dos precisiones (Q8_0 y f16), necesario para procesar las entradas visuales junto con el modelo de lenguaje.

## Capacidades

- Comprensión de vídeo: análisis de contenido audiovisual, incluyendo vídeo egocéntrico en primera persona.
- Segmentación temporal de acciones: identificación de los intervalos temporales en los que ocurren acciones dentro de un vídeo.
- Procesamiento multimodal: combinación de entradas visuales (vídeo/imagen) y texto mediante el proyector mmproj.
- Conversación multimodal: formato conversacional (etiqueta `conversational`), adecuado para diálogos de varios turnos con contenido visual.
- Soporte multilingüe limitado a chino e inglés.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.
- No se ha documentado vision general, audio ni modo de razonamiento extendido más allá de lo indicado.

## Casos de uso

- Análisis de vídeo egocéntrico en investigación: el modelo puede procesar grabaciones en primera persona (por ejemplo, de wearables o cámaras corporales) para identificar y delimitar acciones, lo que resulta útil en estudios de comportamiento, ergonomía o interacción persona-entorno.
- Segmentación temporal de acciones para anotación asistida: dado un vídeo, el modelo puede ayudar a generar marcas temporales de acciones, acelerando el etiquetado manual en proyectos de datasets de vídeo.
- Indexación y búsqueda de contenido en archivos de vídeo: usar la comprensión temporal para localizar momentos concretos en grabaciones largas, útil en archivística o monitorización.
- Análisis de vídeo en entornos de fabricación o formación: revisión de grabaciones de procesos manuales para extraer secuencias de acciones y detectar desviaciones del procedimiento.
- Prototipado de aplicaciones de asistencia en primera persona: integración en aplicaciones que analizan lo que ve el usuario en tiempo real mediante el proyector multimodal y el modelo cuantizado en local.
- Investigación en robótica e imitación: extracción de segmentos de acción a partir de demostraciones en vídeo para entrenar o validar políticas de imitación.
- Despliegue local con privacidad: al ejecutarse en GGUF con llama.cpp, permite procesar vídeo sensible sin enviar datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (pesos del modelo, sin contar el proyector mmproj):
  - Q2_K: ~11,2 GB
  - Q3_K_S: ~12,2 GB; Q3_K_M: ~13,6 GB; Q3_K_L: ~14,8 GB
  - Q4_K_S: ~15,7 GB; Q4_K_M: ~16,8 GB
  - Q5_K_S: ~18,8 GB; Q5_K_M: ~19,4 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - Proyector multimodal: mmproj-Q8_0 (~0,7 GB) o mmproj-f16 (~1,0 GB)
- GPU recomendadas: para Q4_K_M y superiores se recomienda una GPU con 24 GB o más (RTX 4090, A100 40 GB, H100). Para Q2_K y Q3_K es posible con GPUs de 12-16 GB, aunque la calidad se degrada.
- Cabe en GPU de consumo: las cuantizaciones Q2_K a Q4_K_S caben en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti 16 GB); Q4_K_M y superiores requieren 24 GB (RTX 3090/4090). Las cuantizaciones altas pueden requerir offloading parcial a RAM.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, KoboldCpp, entre otras). No se ha documentado soporte nativo en vLLM o TGI para esta versión GGUF.
- Latencia y throughput: no disponibles. Dependen fuertemente de la GPU, la cuantización y la longitud del vídeo procesado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría (modelos multimodales de comprensión de vídeo con segmentación temporal de acciones). Los modelos comparables habituales en comprensión de vídeo (por ejemplo, familia Qwen-VL, InternVL o VideoLLaMA) difieren en arquitectura, datos de entrenamiento y tareas evaluadas, y no se han publicado métricas de xmodel-vl en la información disponible para contrastarlas.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| xmodel-vl (esta ficha) | ~26,9 B | no disponible | Apache 2.0 | GGUF | Especializado en vídeo egocéntrico y segmentación temporal |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible | Sin datos comparables publicados |

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; el rendimiento en castellano no está garantizado ni documentado.
- No se han publicado evaluaciones de sesgos; al ser un modelo entrenado con datos de vídeo, puede heredar sesgos presentes en dichos datos.
- Riesgo de alucinación en la descripción de contenido visual y en la delimitación de acciones, especialmente con cuantizaciones bajas (Q2_K, Q3_K).
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S/M) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- La longitud de contexto no está documentada, lo que impide garantizar el procesamiento de vídeos largos o conversaciones extensas.
- El modelo está especializado en una tarea concreta (segmentación temporal de acciones en vídeo egocéntrico); su uso como modelo generalista multimodal puede dar resultados inferiores a alternativas generales.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- Esta versión GGUF es una cuantización estática; el autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación.
- El repositorio ocupa 189,4 GB en total debido a la multiplicidad de cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/xmodel-vl-GGUF
- Modelo base: https://huggingface.co/heitong/xmodel-vl
- Página de descargas del autor: https://hf.tst.eu/model#xmodel-vl-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
