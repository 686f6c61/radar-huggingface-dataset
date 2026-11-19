# mradermacher/KODA-35B-GGUF

## Resumen

KODA-35B-GGUF es la versión cuantizada en formato GGUF del modelo KODA-35B, publicado originalmente por Baidu-Baige. El trabajo de cuantización lo realiza mradermacher, un autor habitual en la comunidad de Hugging Face especializado en generar versiones GGUF de modelos recientes. El repositorio contiene pesos estáticos en múltiples niveles de cuantización (desde Q2_K hasta F16, incluyendo variantes IQ), lo que permite ejecutar el modelo en llama.cpp y herramientas compatibles con GGUF.

El modelo base cuenta con 34.660.610.688 parámetros (aproximadamente 34,7 mil millones), según los datos de safetensors del repositorio. Se trata, por tanto, de un modelo de escala media-grande orientado a generación de texto conversacional, aunque la model card del repositorio GGUF no aporta detalles sobre arquitectura, contexto, datos de entrenamiento ni licencia.

La relevancia de esta publicación es práctica: facilita el despliegue local del modelo KODA-35B en hardware de consumo o en servidores sin necesidad de infraestructura de GPU de gran escala, gracias a las cuantizaciones de 2 a 8 bits. No obstante, la información técnica disponible en el repositorio es muy limitada y muchos datos deben consultarse en el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 34.660.610.688 (~34,7 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base KODA-35B en la información proporcionada. La model card del repositorio GGUF se limita a indicar que se trata de cuantizaciones estáticas del modelo `Baidu-Baige/KODA-35B`, con `convert_type: hf` y `quantize_version: 2`, lo que sugiere una conversión desde pesos Hugging Face (probablemente safetensors) mediante la herramienta de cuantización de llama.cpp.

Tampoco se detallan los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas como decodificación especulativa o atención lineal. Para obtener esta información sería necesario consultar la model card del modelo original en `Baidu-Baige/KODA-35B`, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica que el modelo está orientado a diálogo e instrucciones.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face.
- Ejecución local en llama.cpp: al estar en formato GGUF, es compatible con llama.cpp y con las herramientas que lo integran (Ollama, LM Studio, text-generation-webui, entre otras).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue local en estación de trabajo: con la cuantización Q4_K_M (aproximadamente 20 GB), el modelo puede ejecutarse en una GPU de consumo de gama alta con 24 GB de VRAM, como la RTX 4090, o en CPU con suficiente RAM. Adecuado para prototipado y pruebas sin depender de la nube.
- Chat conversacional autoalojado: el tag `conversational` y el formato GGUF permiten montar un asistente de diálogo en local mediante llama.cpp u Ollama, manteniendo los datos dentro de la infraestructura propia.
- Inferencia en servidores sin GPU dedicada: las cuantizaciones Q2_K y Q3_K_S reducen el peso a aproximadamente 11-15 GB, lo que permite ejecución en CPU con 16-32 GB de RAM, útil para entornos con recursos limitados.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que facilita medir el impacto de la compresión en calidad y velocidad para elegir el equilibrio adecuado en producción.
- Integración en pipelines de generación de texto: al ser compatible con la API de llama.cpp y con endpoints, puede integrarse como servicio de generación en aplicaciones backend existentes.
- Pruebas de concepto en investigación: para investigadores que necesiten un modelo de ~35 B en local sin acceso a clústeres de GPU, las versiones Q4/Q5 permiten experimentar con un modelo de esta escala en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar overhead de contexto):
  - F16: ~69 GB (no viable en GPU de consumo).
  - Q8_0: ~37 GB.
  - Q6_K: ~28 GB.
  - Q5_K_M: ~24 GB.
  - Q4_K_M: ~21 GB.
  - Q3_K_M: ~16 GB.
  - Q2_K: ~12 GB.
- GPU recomendadas:
  - F16/Q8_0: A100 80 GB, H100 80 GB o múltiples GPU.
  - Q6_K/Q5_K_M: A100 40 GB, RTX A6000 48 GB, o dos GPU de 24 GB.
  - Q4_K_M: RTX 4090 24 GB, RTX 3090 24 GB.
  - Q3_K_M y menores: GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) o ejecución parcial en CPU.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones Q4_K_M y menores en GPU de 24 GB; Q3 y Q2 en GPU de 16 GB o mediante offload a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. El tag `endpoints_compatible` indica soporte para Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. Se indica "no disponible".

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio GGUF; es imprescindible consultar la licencia del modelo original `Baidu-Baige/KODA-35B` antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de las respuestas; para producción se recomienda Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de la calidad de las cuantizaciones.
- La fecha de creación del repositorio (2026-11-19) es posterior a la fecha habitual de referencia; conviene verificar la integridad y procedencia de los pesos.
- No hay información sobre el contexto máximo soportado, lo que impide planificar tareas de contexto largo con garantías.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/KODA-35B-GGUF
- Modelo base: https://huggingface.co/Baidu-Baige/KODA-35B
