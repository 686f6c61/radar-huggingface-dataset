# jaforkhan5791/Agent.Xortron

## Resumen

Agent.Xortron es un modelo multimodal de aproximadamente 27.356 millones de parámetros publicado en Hugging Face por el usuario jaforkhan5791 y atribuido en su model card al desarrollador darkc0de. Se presenta como un ajuste fino de darkc0de/XORTRON.CriminalComputing.2026.27B.NEXT, que a su vez se etiqueta dentro de la familia Qwen3.5, y está orientado a su uso con Hermes Agent como formato de agente conversacional. El repositorio ocupa 54,7 GB y solo contiene pesos en safetensors.

La etiqueta de pipeline image-text-to-text indica entrada de imagen y texto, aunque la model card no describe el codificador visual, el número de tokens de contexto ni la composición del dataset de entrenamiento. El modelo se declara únicamente en inglés y se distribuye bajo licencia Apache 2.0, con las etiquetas uncensored y heretic, que apuntan a una eliminación deliberada de los mecanismos de rechazo respecto al modelo base.

Su relevancia práctica es hoy muy limitada: registra cero descargas y cero valoraciones, no publica benchmarks ni documentación técnica más allá de cinco líneas de model card, y su cadena de derivación incluye un modelo base cuyo nombre remite a "criminal computing". Esta ficha recoge únicamente los datos verificables y marca como no disponible todo aquello que la información proporcionada no cubre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text), etiquetado como familia qwen3_5. No se detalla si es dense o MoE, ni el codificador visual |
| Parámetros totales | 27.356.728.560 (~27,36 mil millones), según los safetensors del repositorio |
| Parámetros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio solo publica safetensors sin cuantizar; no hay variantes GGUF, AWQ, GPTQ ni MLX |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (biblioteca transformers) |
| Tamaño del repositorio | 54,7 GB |
| Modelo base | darkc0de/XORTRON.CriminalComputing.2026.27B.NEXT |
| Fecha de publicación | 19 de septiembre de 2026 (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectónicos más allá de las etiquetas del repositorio. La etiqueta qwen3_5 sitúa el modelo en la familia Qwen3.5 y la etiqueta image-text-to-text implica un transformer multimodal con entrada de imagen y texto, pero no se especifica el número de capas, la dimensión oculta, el tipo de atención, el codificador de visión ni la ventana de contexto. Tampoco se confirma si incorpora atención lineal, decodificación especulativa o algún esquema híbrido.

En cuanto al entrenamiento, la model card indica que el modelo ha sido ajustado con Unsloth sobre darkc0de/XORTRON.CriminalComputing.2026.27B.NEXT. Los datasets declarados son DJLougen/hermes-agent-traces-filtered, orientado a trazas de agente en formato Hermes, y darkc0de/Xortron.Config.Dataset.New.2026, sin descripción pública de su contenido. No se indica el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de RLHF, DPO o similares. Las etiquetas uncensored y heretic sugieren la aplicación de una técnica de ablación orientada a suprimir el comportamiento de rechazo del modelo base, aunque el procedimiento exacto no está documentado en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, con formato de plantilla orientado a agentes (Hermes Agent).
- Procesamiento de entrada multimodal imagen-texto según la etiqueta de pipeline del repositorio; no se detalla el alcance real (descripción de imágenes, OCR, comprensión de documentos).
- Soporte declarado de uso en pipelines de agentes y conversaciones multi-turno, derivado del dataset de trazas de agente empleado en el ajuste.
- Comportamiento sin rechazos: las etiquetas uncensored y heretic indican que el modelo no aplica las salvaguardas habituales del modelo base.
- Capacidades de tool calling o function calling: no confirmadas explícitamente en la documentación disponible, aunque plausibles por el formato Hermes.
- Modo de razonamiento extendido (thinking mode): no disponible.
- Capacidades de audio o vídeo: no disponible.
- Multilingüismo: no; solo se declara inglés.
- Capacidades de código y matemáticas: no documentadas para este ajuste concreto.

## Casos de uso

- Investigación sobre ablación de seguridad: el modelo permite estudiar cómo se comporta un transformer de 27B tras eliminar sus mecanismos de rechazo, comparándolo con el modelo base y con la versión original de la familia Qwen3.5 en un entorno controlado de laboratorio.
- Red-teaming y evaluación de robustez: útil como sujeto de pruebas para medir la eficacia de filtros de salida, clasificadores de contenido y políticas de moderación en despliegues que deban convivir con modelos sin alineamiento.
- Experimentación con agentes conversacionales: dado que se ha ajustado sobre trazas de agente en formato Hermes, encaja en prototipos de agentes de múltiples pasos con llamadas a herramientas, siempre que se implemente una capa propia de validación de acciones.
- Pruebas de pipelines multimodales: al declararse image-text-to-text, sirve para validar infraestructura de inferencia que combine entrada de imagen y texto (servidores de visión-lenguaje, colas de trabajo, preprocesado de imágenes) antes de migrar a un modelo con benchmarks publicados.
- Sustitución de bajo coste en prototipos internos: al ser Apache 2.0 y caber cuantizado en una GPU de 24 GB, puede usarse como marcador de posición en demos locales de agentes mientras se decide el modelo definitivo.
- Estudio de la cadena de derivación de modelos: permite analizar cómo se degradan o modifican las capacidades de un modelo al pasar por varios ajustes sucesivos no documentados, un fenómeno habitual en el ecosistema de modelos comunitarios.
- Evaluación de infraestructura de despliegue: con 54,7 GB en safetensors, es un banco de pruebas realista para medir requisitos de VRAM, paralelismo tensorial y latencia en configuraciones de una y dos GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo (los resultados obtenidos corresponden a portales de normativa local sin relación con el proyecto).

## Requisitos de hardware

Estimaciones a partir del recuento real de parámetros (27,36 mil millones) y del tamaño del repositorio; no proceden de documentación del autor:

- BF16/FP16 sin cuantizar: ~54,7 GB de pesos, más caché KV y activaciones. Requiere 80 GB de VRAM (H100 80 GB, A100 80 GB) o reparto en dos GPU de 48 GB.
- FP8: ~27,4 GB de pesos. Viable en A100 80 GB, H100 80 GB o dos GPU de 24 GB con paralelismo tensorial.
- INT8 (~Q8_0): ~29 GB de pesos. Recomendado A6000 48 GB, L40S 48 GB o 2 x RTX 4090.
- Q6_K: ~22,5 GB. Ajustado en una RTX 4090 o RTX 3090 de 24 GB, con contexto limitado.
- Q5_K_M: ~19,1 GB. Cómodo en GPU consumer de 24 GB con contexto moderado.
- Q4_K_M: ~16,5 GB. Cabe en RTX 4090, RTX 3090, RTX 4080 Super (16 GB, muy justo) y en GPU de 24 GB con margen para contexto.
- NF4 (bitsandbytes de 4 bits): ~15,5 GB más sobrecarga. Viable en GPU de 20-24 GB.
- Añadir a las cifras anteriores la memoria del codificador visual y la caché KV, que no puede dimensionarse porque se desconoce la longitud de contexto.
- GPU recomendadas por escenario: H100 80 GB o A100 80 GB para FP16/FP8 en producción; A6000 48 GB para INT8; RTX 4090 o RTX 3090 para Q4/Q5/Q6 en local.
- Opciones de despliegue: transformers (formato nativo del repositorio), TGI (etiqueta text-generation-inference presente), vLLM (compatible en principio con safetensors, no confirmado por el autor), Unsloth para ajuste fino. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, ya que no se publican.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No existen benchmarks publicados de Agent.Xortron, por lo que la comparación es estructural y de licencia, no de rendimiento.

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Agent.Xortron | ~27,36 B | No disponible | Imagen-texto declarada | Apache 2.0 (con cadena de derivación no documentada) | Solo safetensors, 0 descargas |
| Qwen2.5-VL-32B-Instruct | ~32 B | ~128 000 tokens | Imagen-texto | Apache 2.0 | safetensors, ampliamente desplegado |
| Gemma 3 27B | ~27 B | ~128 000 tokens | Imagen-texto | Licencia Gemma (uso comercial con condiciones) | safetensors, ecosistema amplio |
| Mistral Small 3.1 24B | ~24 B | ~128 000 tokens | Imagen-texto | Apache 2.0 | safetensors, ampliamente desplegado |

Agent.Xortron comparte tamaño con Gemma 3 27B y se sitúa por debajo de Qwen2.5-VL-32B y por encima de Mistral Small 3.1 24B en número de parámetros. La diferencia principal no es de escala, sino de trazabilidad: los tres modelos comparados publican documentación técnica, benchmarks y datos de entrenamiento, mientras que Agent.Xortron carece de todos ellos y no tiene ninguna validación de la comunidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no existe ninguna medición publicada de calidad, razonamiento, código o capacidades multimodales, por lo que no puede recomendarse para producción sin una evaluación propia.
- Comportamiento sin alineamiento: las etiquetas uncensored y heretic indican que el modelo no aplica rechazos ante peticiones dañinas. Esto lo hace inadecuado para aplicaciones de cara al público sin una capa externa de moderación.
- Riesgo elevado de alucinación: al desconocerse el volumen y la calidad de los datos de ajuste, y al tratarse de un ajuste sobre trazas de agente, la tendencia a inventar llamadas a herramientas, rutas de ficheros o resultados de comandos es un riesgo real.
- Contexto desconocido: sin la longitud de ventana publicada, no puede planificarse el uso en conversaciones largas, análisis de documentos extensos ni agentes con historial amplio.
- Idioma: soporte declarado solo para inglés. El rendimiento en castellano es, como mínimo, incierto y no está evaluado.
- Trazabilidad de la licencia: aunque el repositorio se declara Apache 2.0, deriva de un modelo de la familia Qwen3.5 a través de una cadena de ajustes no documentada. Es prudente verificar los términos de los modelos intermedios antes de un uso comercial.
- Modelo base con nombre problemático: la denominación del modelo del que deriva, XORTRON.CriminalComputing.2026.27B.NEXT, no está acompañada de ninguna documentación que explique su contenido, lo que impide descartar sesgos o comportamientos indeseados.
- Sin validación comunitaria: cero descargas y cero valoraciones. Nadie ha reproducido su comportamiento de forma pública.
- Anomalía en las fechas: los metadatos indican creación en septiembre de 2026, lo que dificulta reconstruir su relación temporal con el modelo base.
- Sin variantes cuantizadas publicadas: cualquier despliegue eficiente requiere que el usuario genere sus propios GGUF o cuantizaciones de 4 bits, con la pérdida de calidad que ello implica.
- Longitud de contexto y caché KV desconocidas: imposibilita dimensionar VRAM con precisión para cargas concurrentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaforkhan5791/Agent.Xortron
- Modelo base: https://huggingface.co/darkc0de/XORTRON.CriminalComputing.2026.27B.NEXT
- Dataset de trazas de agente: https://huggingface.co/datasets/DJLougen/hermes-agent-traces-filtered
- Dataset de configuración: https://huggingface.co/datasets/darkc0de/Xortron.Config.Dataset.New.2026
- Repositorio de Unsloth (herramienta de ajuste declarada): https://github.com/unslothai/unsloth
- Paper técnico, blog del autor o demo: no disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo.
