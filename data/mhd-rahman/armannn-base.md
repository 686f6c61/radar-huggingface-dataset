# mhd-rahman/ArmanNN-Base

## Resumen

ArmanNN-Base es un modelo de lenguaje causal de arquitectura híbrida desarrollado por el usuario mhd-rahman y publicado en Hugging Face. Combina atención causal, SSM selectiva (con parallel scan) y una mezcla dispersa de expertos (Sparse MoE), integrando puertas de fusión aprendidas y enrutadores de ruta. Con 502 millones de parámetros, se posiciona como un modelo de tamaño medio que busca explorar sinergias entre mecanismos de atención y state-space models para mejorar la eficiencia en el procesamiento de secuencias.

El modelo está diseñado para generación de texto y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia radica en la combinación de paradigmas arquitectónicos (atención + SSM + MoE) en un solo modelo, una tendencia emergente en la investigación de LLMs. Sin embargo, la documentación pública es muy escasa: no se han publicado detalles sobre el entrenamiento, benchmarks ni capacidades específicas más allá de la descripción arquitectónica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención causal + SSM selectiva (parallel scan) + MoE disperso, con puertas de fusión y enrutadores de ruta |
| Parametros totales | 502.479.360 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de ArmanNN-Base es híbrida por diseño: combina capas de atención causal tradicionales con capas de SSM selectiva (probablemente basadas en Mamba o similar) que utilizan un parallel scan para procesar secuencias de forma eficiente. Además, incorpora una mezcla dispersa de expertos (MoE) que activa solo un subconjunto de parámetros por token, junto con puertas de fusión aprendidas que combinan las salidas de los distintos módulos y enrutadores que deciden qué ruta seguir. Esta combinación busca aprovechar las ventajas de cada mecanismo: la atención para capturar dependencias a largo plazo, la SSM para eficiencia computacional y el MoE para escalar capacidad sin aumentar proporcionalmente el coste de inferencia.

No se ha publicado información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o attention lineal. El modelo requiere `trust_remote_code=True` en Transformers, lo que indica que incluye código personalizado para su arquitectura.

## Capacidades

- Generación de texto causal: el modelo es un causal LM, por lo que puede generar texto autocompletando secuencias.
- Procesamiento de secuencias con arquitectura híbrida: combina atención y SSM, lo que podría ofrecer un equilibrio entre calidad y eficiencia, aunque no hay datos empíricos que lo confirmen.
- Mezcla de expertos: al ser MoE, podría activar solo una parte de los parámetros por token, reduciendo el coste computacional en inferencia.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible, no hay evidencia en la documentación.
- Capacidades multilingües: solo se declara inglés (`en`).

## Casos de uso

Dado que la documentación no especifica casos de uso concretos, se proponen aplicaciones genéricas basadas en las características del modelo, siempre con cautela:

- Generación de texto creativo: el modelo puede producir continuaciones de texto coherentes, útil para redacción asistida o generación de contenido.
- Chatbots de dominio específico: con un fine-tuning adecuado, podría servir como base para asistentes conversacionales en inglés.
- Prototipado de investigación: su arquitectura híbrida lo convierte en un candidato para experimentos académicos sobre combinación de atención y SSM.
- Clasificación y extracción de información: mediante fine-tuning, podría adaptarse a tareas de NLP como análisis de sentimiento o reconocimiento de entidades.
- Generación de código: aunque no hay evidencia, los modelos de lenguaje generales suelen poder adaptarse a tareas de programación con entrenamiento adicional.
- Educación y demostraciones: al ser de tamaño medio y con licencia permisiva, puede usarse en entornos educativos para ilustrar arquitecturas híbridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se dispone de comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: con 502M parámetros, en fp16 ocuparía aproximadamente 1 GB, pero el tamaño del repositorio (16.1 GB) sugiere que puede incluir pesos en fp32 o múltiples archivos. Sin cuantización, cabría en GPUs con 2-4 GB de VRAM; con cuantización a 8 bits o 4 bits, podría ejecutarse en GPUs de 1-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) sería suficiente para inferencia. También podría ejecutarse en CPU con suficiente RAM.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o ejecutarse localmente con llama.cpp si se convierte a GGUF (aunque no se proporcionan archivos GGUF). También es compatible con Ollama si se convierte.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Dado que no hay benchmarks ni especificaciones detalladas, no es posible establecer una comparativa fiable con otras arquitecturas híbridas o MoE de tamaño similar.

## Limitaciones y advertencias

- Documentación insuficiente: no se conocen detalles sobre el entrenamiento, los datos utilizados ni las capacidades reales, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente sin fine-tuning específico.
- Sesgos: no se ha informado sobre mitigación de sesgos; al entrenarse probablemente con datos web, puede heredar sesgos sociales y culturales.
- Limitaciones de idioma: solo se declara inglés, por lo que su rendimiento en otros idiomas es desconocido.
- Seguridad: requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; se recomienda auditar el código antes de usarlo en entornos sensibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre el uso de los pesos o el código personalizado.

## Enlaces

- [Hugging Face - mhd-rahman/ArmanNN-Base](https://huggingface.co/mhd-rahman/ArmanNN-Base)
