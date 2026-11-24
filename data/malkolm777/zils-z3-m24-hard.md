# malkolm777/zils-z3-m24-hard

## Resumen

zils-z3-m24-hard es un ajuste fino (fine-tune) del modelo base vllm-sr/d3-ultra, un transformer de aproximadamente 26 000 millones de parámetros (26.085.330.160 según los pesos en safetensors), publicado por el usuario malkolm777 en Hugging Face. El modelo se presenta como un "decision-model" (modelo de decisión) orientado a tareas de clasificación o selección entre opciones, dentro del ecosistema que el autor etiqueta como "zils" y "d3". La model card lo describe como un "z3 decision body" afinado con LoRA de rango 32 sobre las capas de atención.

El ajuste se realizó sobre 850 decisiones verificadas extraídas de 1.680 ejemplos etiquetados, con una composición declarada de 425 ejemplos difíciles, 225 intermedios y 200 de replay. Se empleó un learning rate de 0,00005 y semilla 230326, y el autor publica el hash SHA-256 del conjunto de entrenamiento. La revisión del chasis base indicada es 52ba9e7a00402f9560c7fba8c039608e7ddee7fb.

El interés del modelo es acotado pero concreto: se trata de un artefacto de nicho, con cero descargas y cero "likes" en el momento de la consulta, sin pipeline declarado ni idiomas especificados, y con muy poca documentación pública más allá de la propia model card. Es relevante únicamente para quien necesite reproducir o evaluar este ajuste específico de decisión sobre el chasis d3-ultra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en los tags de Hugging Face); ajuste LoRA de rango 32 sobre atención |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere cargar código remoto) |

## Arquitectura y entrenamiento

El modelo parte del chasis vllm-sr/d3-ultra, de aproximadamente 26 000 millones de parámetros, y aplica un ajuste fino con LoRA de rango 32 restringido a las capas de atención. No se especifica en la información disponible si el chasis base emplea atención completa, atención lineal u otra variante, ni si incorpora componentes MoE; los tags de Hugging Face incluyen la etiqueta `qwen3_5`, lo que sugiere una familia arquitectónica tipo Qwen, pero no se confirma en la documentación.

El conjunto de entrenamiento declarado consta de 850 decisiones verificadas muestreadas de 1.680 ejemplos etiquetados, con 425 ejemplos difíciles, 225 intermedios y 200 de replay. Se indica learning rate de 0,00005 y semilla 230326, y se publica el hash SHA-256 de los datos de entrenamiento (5ddda05110146233793712d17f89b4cd9375f7d24c7323fa2c562a9659c25e6f). No se documentan número de tokens de entrenamiento, composición lingüística del dataset, ni si hubo RLHF o DPO. El repositorio incluye `custom_code`, por lo que la carga requiere `trust_remote_code=True`.

## Capacidades

- Generación de texto y razonamiento general heredados del chasis d3-ultra de 26B; no se detallan capacidades específicas en la model card.
- Modelo de decisión: el ajuste está orientado a tareas de selección o clasificación entre opciones verificadas, según la descripción "z3 decision body".
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de ajustes de decisión: el modelo sirve para reproducir el experimento del autor y comparar el efecto del LoRA de rango 32 sobre el chasis d3-ultra en tareas de selección entre opciones verificadas.
- Clasificación binaria o multietiqueta en dominios acotados: dado su entrenamiento sobre 850 decisiones verificadas, puede emplearse como clasificador de decisiones en pipelines internos donde el espacio de etiquetas esté bien definido.
- Enrutamiento de consultas: usar el modelo como componente de decisión para dirigir peticiones a distintos submodelos o servicios, aprovechando su naturaleza de "decision body".
- Investigación sobre datos de replay: el conjunto incluye 200 ejemplos de replay, lo que permite estudiar el efecto de mezclar datos de repetición en ajustes LoRA de pequeño tamaño.
- Reproducibilidad de experimentos: el hash SHA-256 del dataset y la semilla publicados permiten replicar el entrenamiento y auditar la composición de los datos.
- Base para nuevos ajustes: al ser un fine-tune LoRA sobre d3-ultra con licencia Apache 2.0, puede servir como punto de partida para ajustes posteriores en tareas de decisión específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26.085 millones de parámetros, en FP16 se requieren aproximadamente 52 GB de VRAM solo para los pesos; en BF16, un valor similar. En cuantización de 8 bits, en torno a 26 GB; en 4 bits, alrededor de 13-14 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16 sin cuantizar; A100 40 GB o L40S 48 GB con cuantización de 8 bits; RTX 4090 24 GB solo con cuantización de 4 bits y posible offload.
- ¿Cabe en GPU de consumo? Solo con cuantización agresiva (4 bits) en RTX 4090 24 GB o RTX 3090 24 GB, con margen ajustado para el contexto.
- Opciones de despliegue: vLLM (el chasis base está asociado al proyecto vllm-sr), TGI o transformers con `trust_remote_code=True`; no se confirman soportes de llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-z3-m24-hard | 26,1B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune LoRA de decisión sobre d3-ultra |
| vllm-sr/d3-ultra (base) | ~26B | no disponible | no disponible | Hugging Face | Chasis original sin el ajuste de decisión |
| Qwen3 de ~27B (referencia de familia) | ~27B | no disponible en esta ficha | no disponible | Hugging Face | Familia sugerida por el tag `qwen3_5`; no confirmada |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Documentación mínima: la model card solo describe el proceso de ajuste; no hay información sobre contexto, idiomas, benchmarks ni limitaciones declaradas por el autor.
- Sesgos conocidos: no documentados; al entrenarse sobre 850 decisiones verificadas de origen no especificado, el modelo puede heredar sesgos del proceso de etiquetado.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, el riesgo principal es la selección incorrecta de opciones más que la generación de texto libre.
- Limitaciones de contexto e idioma: no disponibles; no se declaran idiomas soportados ni longitud de contexto.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base vllm-sr/d3-ultra debe verificarse por separado, ya que su licencia no se detalla en esta información.
- Código remoto: el repositorio incluye `custom_code`, por lo que es necesario `trust_remote_code=True`; conviene auditar el código antes de ejecutarlo en producción.
- Madurez: cero descargas y cero "likes" en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Fecha de creación: 2026-11-24, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-z3-m24-hard
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra
- Repositorio del proyecto vllm-sr: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
