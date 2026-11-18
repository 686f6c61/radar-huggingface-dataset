# SC117/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF

## Resumen

Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF es una cuantización en formato GGUF del modelo llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved, a su vez derivado del Qwen3.6-35B-A3B de Alibaba. El autor de esta publicación es SC117, que aplica la técnica de cuantización APEX, una estrategia de precisión mixta consciente de la arquitectura MoE que clasifica cada tensor según su rol (experto enrutado, experto compartido o atención) y aplica un gradiente de precisión por capas.

El modelo base es un transformer MoE de tipo qwen3_5_moe con capacidades multimodales (pipeline image-text-to-text). La variante "uncensored"/"heretic" implica que se ha aplicado un proceso de abliteration o decensurado para reducir los rechazos del modelo ante peticiones que el modelo original rechazaría. La variante "MTP Preserved" indica que se conserva el mecanismo de Multi-Token Prediction nativo del modelo original, y "Native" sugiere que no se ha alterado esa capacidad durante el proceso de modificación.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo MoE de gran tamaño con capacidades de visión, una modificación de alineación (uncensored) y una cuantización optimizada para MoE (APEX) que, según el autor, supera la perplejidad de Q8_0 con la mitad del tamaño e incluso supera a F16. El repositorio tiene 149 GB y acumula 45.300 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), multimodal image-text-to-text |
| Parametros totales | 446.571.248 según safetensors del repo; el nombre indica 35B-A3B (35B totales, 3B activos) |
| Parametros activos | 3B (según nomenclatura A3B del nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con perfiles APEX: I-Compact (15,85 GB), I-Balanced (24,18 GB), I-Quality (21,90 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo con librería transformers declarada) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE) de la familia Qwen3.5, con 35B parámetros totales y 3B activos por token, lo que permite un coste de inferencia muy inferior al de un modelo denso del mismo tamaño. Incorpora capacidades multimodales de entrada imagen-texto, y conserva el mecanismo Native MTP (Multi-Token Prediction) del modelo original, que permite predecir varios tokens por paso y acelerar la decodificación.

Sobre el modelo base se aplicó un proceso de "abliteration"/"heretic" para eliminar o atenuar los comportamientos de rechazo, y posteriormente SC117 aplicó la cuantización APEX. Esta técnica, descrita en el repositorio github.com/mudler/apex-quant, asigna precisión diferenciada por tensor: mayor precisión en las capas extremas (más sensibles) y compresión más agresiva en las capas intermedias redundantes. El autor afirma que APEX supera la perplejidad de Q8_0 con la mitad del tamaño e incluso supera a F16. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset ni detalles de RLHF/DPO del modelo original en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-turno.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text).
- Generación de código y matemáticas (capacidad esperable en la familia Qwen, aunque no confirmada explícitamente en la información disponible).
- Multi-Token Prediction nativo (MTP) para acelerar la decodificación.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que el modelo original rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (el repo incluye documentación en inglés y chino, pero no se detallan idiomas soportados).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto del proceso de abliteration comparando respuestas con el modelo original, útil para equipos que analizan mecanismos de rechazo y sesgos.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido narrativo que requiera temáticas que los modelos alineados suelen rechazar, con la ventaja de un MoE de 3B activos que reduce el coste por token.
- Despliegue en hardware de consumo: con el perfil I-Compact de 15,85 GB, puede ejecutarse en GPUs de 24 GB (RTX 3090/4090) mediante llama.cpp u Ollama, lo que facilita prototipado local de un modelo de 35B totales.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer y razonar sobre información de capturas, diagramas o documentos escaneados en pipelines de digitalización.
- Evaluación de cuantizaciones MoE: sirve como banco de pruebas para comparar APEX frente a Q8_0, Q4_K_M y otras técnicas en términos de perplejidad y calidad, dado que el autor publica varios perfiles del mismo modelo.
- Generación de código en entornos controlados: con 3B activos y contexto MoE, puede integrarse en asistentes de programación locales donde no se desea enviar código a APIs externas, aunque la ausencia de datos de benchmarks obliga a validar la calidad empíricamente.
- Fine-tuning y experimentación: al estar bajo licencia Apache 2.0 y en formato GGUF, puede servir de base para investigación, aunque el fine-tuning directo sobre GGUF requiere conversión previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente afirma, sin cifras concretas, que APEX supera la perplejidad de Q8_0 con la mitad del tamaño y supera a F16, pero no se proporcionan valores numéricos de perplejidad ni resultados de MMLU, HumanEval, GSM8K u otras evaluaciones.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB para el perfil I-Compact (15,85 GB de pesos), 22 GB para I-Quality (21,90 GB) y 24-25 GB para I-Balanced (24,18 GB), más overhead de contexto KV cache.
- GPU recomendadas: RTX 3090/4090 (24 GB) para I-Compact e I-Quality; A100 40/80 GB o H100 para I-Balanced con contextos largos y mayor throughput.
- Cabe en GPU de consumo: sí, los perfiles I-Compact e I-Quality caben en GPUs de 24 GB; I-Balanced requiere ajustar el contexto o usar offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repo declara compatibilidad con transformers y endpoints_compatible.
- Latencia y throughput: no disponibles. La arquitectura MoE con 3B activos y el MTP nativo deberían ofrecer un throughput notablemente superior a un denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SC117/Qwen3.6-35B-A3B-uncensored-heretic-APEX-GGUF | 35B (nombre) | 3B | no disponible | Apache 2.0 | GGUF APEX | Cuantización MoE-aware, uncensored, MTP |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved | 35B (nombre) | 3B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva |
| Qwen/Qwen3.6-35B-A3B | 35B (nombre) | 3B | no disponible | Apache 2.0 | safetensors | Modelo original alineado de Alibaba |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El proceso "uncensored"/"heretic" elimina barreras de seguridad: el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtros, lo que desaconseja su uso en aplicaciones orientadas al público sin capas de moderación adicionales.
- Riesgo elevado de alucinación: no hay benchmarks publicados que validen la calidad tras el proceso de abliteration y la cuantización; la modificación de pesos puede degradar capacidades de razonamiento.
- La cuantización GGUF, aunque APEX afirme superar a Q8_0 y F16, introduce pérdida de precisión no cuantificada con métricas públicas en esta ficha.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe equilibrado.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo decensurado conlleva riesgos legales y reputacionales según la jurisdicción y el contenido generado.
- El tamaño del repo (149 GB) y la presencia de múltiples perfiles de cuantización exigen seleccionar cuidadosamente el archivo antes de descargar.
- No se documentan sesgos específicos, pero la modificación de alineación puede amplificar sesgos presentes en los datos originales.

## Enlaces

- Hugging Face: https://huggingface.co/SC117/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF
- Modelo base: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Documentación en chino: https://huggingface.co/SC117/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-APEX-GGUF/blob/main/README_zh.md
- Repositorio APEX: https://github.com/mudler/apex-quant
