# noctunalz/DSV4.1-Flash-1017-DERISKED-EXL3-2.50bpw-Radiance

## Resumen

DSV4.1-Flash-1017-DERISKED-EXL3-2.50bpw-Radiance es una conversión al formato .rad del motor Radiance del checkpoint EXL3 publicado por vcruz305, que a su vez es una cuantización SAGE Mixed-K trellis a 2,50 bits por peso (bpw) del modelo DeepSeek-V4.1-Flash-1017. El repositorio lo mantiene el usuario noctunalz y se distribuye con licencia MIT. No se trata de un modelo entrenado desde cero ni de un fine-tuning con datos nuevos: es un artefacto de cuantización y serialización orientado a un runtime concreto.

El propósito declarado en la model card es servir de base para el desarrollo y las pruebas del soporte de DeepSeek V4.1 y del formato EXL3 dentro de Radiance. Por tanto, su interés ahora mismo es fundamentalmente de ingeniería de inferencia: validar kernels, comprobar la fidelidad de la conversión y medir el compromiso entre ahorro de memoria y calidad a 2,50 bpw en un modelo de gran escala.

La información disponible no documenta arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento. El repositorio ocupa 383,3 GB y solo declara inglés como idioma. Cualquier dato técnico del modelo base debe consultarse en su propia ficha, no en esta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (depende de DeepSeek-V4.1-Flash-1017; no documentada aquí) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se especifica si el modelo base es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | EXL3 SAGE Mixed-K trellis a 2,50 bpw; conversión posterior a formato Radiance .rad |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Radiance .rad (no safetensors ni GGUF) |
| Tamaño del repositorio | 383,3 GB |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Motor de inferencia | Radiance (formato .rad) |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento ni ajuste alguno. La cadena es: DeepSeek-V4.1-Flash-1017 (modelo original) → cuantización EXL3 SAGE Mixed-K trellis a 2,50 bpw publicada por vcruz305 → conversión a .rad publicada por noctunalz. La model card describe el checkpoint EXL3 como una "SAGE Mixed-K trellis quantization" y este repositorio como su conversión a Radiance. No se aportan detalles sobre la arquitectura interna del modelo base (transformer, MoE, híbrida, etc.), el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

A partir del tamaño del repositorio (383,3 GB) y de la tasa de 2,50 bpw puede hacerse una estimación indirecta del orden de magnitud: 383,3 GB equivalen a unos 3,07×10^12 bits y, a 2,50 bits por peso, implicarían del orden de 1,2×10^12 parámetros (aproximadamente 1,2 billones en escala larga). Es una cifra derivada, no oficial, y puede desviarse por la sobrecarga de metadatos del formato .rad y por el redondeo del tamaño reportado; no debe tomarse como especificación confirmada. La innovación técnica reseñable es la propia cuantización trellis de bajo bit y su serialización en .rad, no el modelo en sí.

## Capacidades

- Generación de texto en inglés, único idioma declarado en los metadatos.
- Ejecución mediante el motor Radiance a través del formato .rad.
- Inferencia con pesos cuantizados a 2,50 bpw, pensada para reducir la huella de memoria frente al checkpoint original.
- Conversión fiel del checkpoint EXL3 de origen, útil para validar la cadena de cuantización.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no documentadas en esta ficha; dependerían del modelo base y no se confirman en la información disponible.

## Casos de uso

- Desarrollo y validación del soporte de DeepSeek V4.1 en Radiance: cargar el .rad, comparar sus salidas con el EXL3 de origen y detectar incompatibilidades de kernels antes de estabilizar el runtime.
- Evaluación de la degradación por cuantización a 2,50 bpw: medir perplejidad y calidad de generación frente al EXL3 de vcruz305 y al modelo base para decidir si el ahorro de memoria compensa en una tarea concreta.
- Despliegue en clústeres con memoria agregada: al ocupar unos 383 GB de pesos, el modelo solo cabe sumando VRAM de varias GPU, lo que lo hace adecuado para entornos multi-GPU donde no entra la versión en alta precisión.
- Investigación sobre trellis quantization y el formato .rad: sirve como material de estudio de la cuantización SAGE Mixed-K y de la serialización propietaria de Radiance.
- Generación de texto en inglés en pipelines internos: con una validación previa de calidad, puede usarse para resumen o clasificación en inglés dentro de herramientas de desarrollo.
- Trazabilidad de linajes de cuantización: documentar y verificar la cadena base → EXL3 → .rad y comprobar que la conversión no introduce divergencias.
- Benchmarking del motor Radiance: medir latencia y throughput del runtime con un modelo de gran escala y compararlo con otras implementaciones de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco hay datos sobre la pérdida de calidad introducida por la cuantización a 2,50 bpw ni comparaciones con el checkpoint EXL3 de origen o con el modelo base.

## Requisitos de hardware

- Almacenamiento: 383,3 GB solo para los pesos en formato .rad, más espacio temporal durante la descarga y la carga.
- VRAM estimada: para residir completamente en memoria de GPU se necesita una capacidad agregada de al menos ~384 GB. Como referencia, 8× H100 de 80 GB suman 640 GB; 5× H100 de 80 GB suman 400 GB, al límite; 3× H200 de 141 GB suman 423 GB.
- GPU consumer: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 48 GB. Solo sería viable con offload a CPU o a almacenamiento, y únicamente si Radiance lo soporta.
- Opciones de despliegue: Radiance es el motor nativo del formato .rad. vLLM, llama.cpp, Ollama y TGI no soportan .rad de forma nativa; habría que reconvertir los pesos a otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Motor |
|---|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | No disponible | No disponible | Original (no especificada) | No disponible | No disponible | No disponible |
| vcruz305/DSV4.1-Flash-1017-DERISKED-EXL3-2.50bpw | No disponible | No disponible | EXL3 SAGE Mixed-K 2,50 bpw | No disponible | EXL3 | No disponible |
| noctunalz/DSV4.1-Flash-1017-DERISKED-EXL3-2.50bpw-Radiance | No disponible | No disponible | 2,50 bpw convertido a .rad | MIT | .rad | Radiance |

La comparación relevante es de linaje y formato, no de rendimiento: los tres artefactos comparten el mismo modelo subyacente y se diferencian en la cuantización y el motor de ejecución. No hay datos públicos de parámetros ni de contexto para ninguno de ellos en la información consultada.

## Limitaciones y advertencias

- No existe model card técnica del modelo base en este repositorio, por lo que no se puede verificar arquitectura, tamaño ni contexto.
- La cuantización a 2,50 bpw es agresiva y no hay benchmarks que cuantifiquen la degradación de calidad; conviene evaluarla en la tarea concreta antes de producción.
- Solo se declara inglés; el comportamiento en otros idiomas no está garantizado.
- El formato .rad es específico de Radiance y rompe la interoperabilidad con el ecosistema estándar (safetensors, GGUF, vLLM, llama.cpp, Ollama).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto comunitario sin validación externa.
- La licencia MIT se declara para este repositorio, pero debe comprobarse por separado la licencia del modelo base DeepSeek-V4.1-Flash-1017 antes de un uso comercial.
- El tamaño de 383,3 GB implica costes altos de almacenamiento, descarga y despliegue, y limita su uso a infraestructura multi-GPU.
- El riesgo de alucinación y los sesgos no están documentados en la información disponible y dependerán del modelo base y del efecto de la cuantización.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/noctunalz/DSV4.1-Flash-1017-DERISKED-EXL3-2.50bpw-Radiance
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Checkpoint EXL3 de origen: https://huggingface.co/vcruz305/DSV4.1-Flash-1017-DERISKED-EXL3-2.50bpw
- Motor Radiance: no disponible (no se proporciona enlace en la información consultada)
- Papers, blogs o demos adicionales: no disponibles
