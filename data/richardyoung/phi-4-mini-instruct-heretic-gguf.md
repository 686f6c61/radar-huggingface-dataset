# richardyoung/Phi-4-mini-instruct-heretic-GGUF

## Resumen

Phi-4-mini-instruct-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Phi-4-mini-instruct-heretic, una variante "abliterated" (también etiquetada como "heretic" o "uncensored") del Phi-4-mini-instruct de Microsoft. El modelo base conserva la arquitectura y el conocimiento del Phi-4-mini original, pero ha sido modificado mediante técnicas de abliteración para eliminar o atenuar los mecanismos de rechazo y alineación de seguridad, de modo que responde a peticiones que el modelo original declinaría. Con 3.836.021.856 parámetros (aproximadamente 3,8 mil millones), se sitúa en la gama compacta de modelos de lenguaje, lo que permite su despliegue en hardware de consumo.

La relevancia de esta ficha radica en dos factores. Por un lado, el formato GGUF y las etiquetas llama.cpp, ollama e imatrix indican que está pensado para inferencia local eficiente en CPU y GPU de gama media, con cuantizaciones de baja precisión. Por otro, la naturaleza "uncensored" del modelo lo convierte en una herramienta de investigación sobre alineación, robustez y comportamiento de modelos abliterados, aunque también introduce riesgos importantes de uso indebido y de calidad degradada en tareas sensibles.

El repositorio tiene un tamaño de 22,1 GB, lo que refleja que contiene múltiples archivos de cuantización (no un único peso). El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia declarada es MIT, heredada del modelo base, aunque la modificación heretic no está avalada por Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Phi-4-mini-instruct; detalles finos no disponibles en la informacion proporcionada) |
| Parametros totales | 3.836.021.856 (aprox. 3,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (multiples niveles; el repo incluye varios archivos, niveles exactos no disponibles) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de un derivado de Phi-4-mini-instruct, que a su vez es un transformer decoder-only de aproximadamente 3,8 mil millones de parámetros desarrollado por Microsoft. La información proporcionada no detalla la composición exacta del dataset de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO; estos datos deben consultarse en la documentación oficial de Phi-4-mini-instruct. La innovación principal de esta variante no reside en la arquitectura, sino en el proceso de abliteración: se identifican las direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y se proyectan fuera de los pesos, de forma que el modelo pierde parte de su condicionamiento de seguridad sin reentrenamiento completo.

El repositorio incluye las etiquetas "imatrix" y "heretic", lo que sugiere que las cuantizaciones se generaron con matrices de importancia (importance matrix) para preservar mejor la calidad en precisiones bajas, y que la modificación heretic se aplicó antes de la cuantización. No se dispone de información sobre la metodología exacta de abliteración empleada, el número de capas intervenidas ni las métricas de degradación asociadas. Los papers referenciados en las etiquetas (arXiv:2406.11717 y arXiv:2510.18892) no se detallan en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Phi-4-mini-instruct original.
- Razonamiento y resolución de problemas de complejidad media, incluyendo matemáticas básicas e intermedias.
- Generación y explicación de código, aunque sin garantías de rendimiento equivalentes al modelo original tras la abliteración.
- Respuesta a peticiones que el modelo alineado rechazaría, gracias a la eliminación de los mecanismos de rechazo.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo la abliteración afecta a la tasa de rechazo, la coherencia y la calidad de las respuestas en comparación con el Phi-4-mini-instruct original, sirviendo como caso de estudio controlado.
- Evaluación de robustez de filtros: se puede emplear para probar clasificadores de contenido y sistemas de moderación, generando respuestas que los modelos alineados evitan y midiendo la capacidad de detección de dichos sistemas.
- Inferencia local en hardware de consumo: al estar en GGUF y tener 3,8 B de parámetros, puede ejecutarse en portátiles con GPU de gama media o incluso en CPU mediante llama.cpp u Ollama, lo que facilita experimentos sin infraestructura de datacenter.
- Prototipado de asistentes conversacionales sin restricciones temáticas: útil en entornos de investigación creativa o generación de ficción donde se necesita explorar temas sensibles de forma controlada y con supervisión humana.
- Benchmarking de cuantizaciones: el repositorio con múltiples archivos GGUF permite comparar la degradación de calidad entre niveles de cuantización y validar el efecto de las importance matrices en un modelo abliterado.
- Docencia y divulgación: sirve para demostrar de forma práctica qué es la abliteración, cómo se manifiesta en las respuestas y qué implicaciones tiene para el despliegue responsable de modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para 3,8 B de parámetros, una cuantización Q4_K_M ocupa aproximadamente 2,3-2,5 GB; Q5_K_M en torno a 2,7-2,9 GB; Q8_0 cerca de 4,1 GB; F16 alrededor de 7,7 GB. Estas cifras son estimaciones basadas en el número de parámetros, no datos publicados en la información proporcionada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el ámbito profesional, A100 o H100 para servir múltiples instancias.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en GPUs con 8 GB o más usando cuantizaciones Q4/Q5; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta presente), servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi-4-mini-instruct-heretic-GGUF (este) | 3,8 B | No disponible | MIT | GGUF | Abliterado, uncensored, acceso restringido |
| Phi-4-mini-instruct (Microsoft) | 3,8 B | No disponible en esta ficha | MIT | Safetensors | Modelo original alineado, sin modificación heretic |
| Llama 3.2 3B Instruct | 3,2 B | 128K (según documentación oficial de Meta) | Llama 3.2 Community License | Safetensors, GGUF | Alternativa alineada de tamaño similar |
| Qwen2.5 3B Instruct | 3,1 B | 32K (según documentación oficial de Alibaba) | Apache 2.0 | Safetensors, GGUF | Alternativa alineada con licencia permisiva |

Los datos de contexto y licencia de los modelos comparables provienen de su documentación oficial; los de este modelo no están disponibles en la información proporcionada. No se dispone de comparativas de rendimiento publicadas para esta variante.

## Limitaciones y advertencias

- La abliteración degrada la alineación de seguridad: el modelo puede generar contenido dañino, ilegal o éticamente problemático sin los rechazos del original. No debe desplegarse en producción orientada a usuarios finales sin capas de moderación externas.
- Riesgo elevado de alucinación y de respuestas incoherentes, especialmente en cuantizaciones bajas y en temas que el modelo original trataba con cautela.
- La modificación heretic no está avalada por Microsoft; el soporte y las garantías del modelo original no aplican.
- Aunque la licencia declarada es MIT, el uso comercial de un modelo abliterado puede conllevar riesgos legales y reputacionales según la jurisdicción y el contexto de aplicación; conviene revisar las condiciones de acceso gated del repositorio.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del Phi-4-mini-instruct original, potencialmente amplificados por la pérdida de alineación.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- El acceso está restringido: es necesario aceptar condiciones en Hugging Face antes de la descarga, lo que puede limitar la reproducibilidad en pipelines automatizados.
- El tamaño del repo (22,1 GB) implica que contiene múltiples cuantizaciones; descargar solo el archivo necesario para evitar consumo innecesario de almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Phi-4-mini-instruct-heretic-GGUF
- Modelo base (variante heretic): https://huggingface.co/richardyoung/Phi-4-mini-instruct-heretic
- Paper referenciado arXiv:2406.11717: https://arxiv.org/abs/2406.11717
- Paper referenciado arXiv:2510.18892: https://arxiv.org/abs/2510.18892
