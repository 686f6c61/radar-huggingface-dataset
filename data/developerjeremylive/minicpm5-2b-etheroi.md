# developerjeremylive/MiniCPM5-2B-etheroi

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de 2B parámetros desarrollado por OpenBMB (equipo responsable de la familia MiniCPM), publicado aquí bajo el identificador `developerjeremylive/MiniCPM5-2B-etheroi`. Se trata del segundo modelo de la serie MiniCPM5, tras MiniCPM5-1B, y reutiliza la misma receta de entrenamiento escalada a un mayor número de parámetros. Su objetivo declarado es el despliegue local y en dispositivo (on-device, edge), así como escenarios con recursos limitados, buscando el estado del arte dentro de la clase 2B de modelos abiertos.

El modelo es un transformer denso con arquitectura compatible con Llama (etiqueta `llama` en el repositorio) y 2.516.756.480 parámetros reales según los pesos en safetensors, lo que supone aproximadamente 2,5 B. El repositorio ocupa 5,0 GB. Los idiomas declarados son inglés y chino. La licencia es Apache 2.0, lo que facilita su integración en productos comerciales.

Su relevancia actual radica en la combinación de tamaño reducido, licencia permisiva y capacidades que la model card sitúa por encima de otros modelos abiertos de tamaño comparable en código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas, quedando cerca de modelos de clase 4B en la comparativa cualitativa publicada por el autor. No se han publicado cifras numéricas de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia MiniCPM5, compatible con Llama |
| Parámetros totales | 2.516.756.480 (~2,5 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (etiquetado como `long-context`, sin cifra publicada) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | transformers |
| Tamaño del repositorio | 5,0 GB |
| Fecha de publicación | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso (no MoE, no SSM ni híbrida) con 2.516.756.480 parámetros y pesos compatibles con la implementación Llama, lo que permite cargarlo con `transformers` y con la mayor parte del ecosistema de inferencia compatible con Llama. La model card indica que MiniCPM5-2B "escala la misma receta de entrenamiento" que MiniCPM5-1B, es decir, una continuación directa del pipeline del modelo de 1B. No se especifica el número de tokens de entrenamiento, la composición porcentual del dataset ni detalles de la tokenización, por lo que esos datos quedan como no disponibles.

Los datasets referenciados permiten reconstruir las fases del entrenamiento: `openbmb/Ultra-FineWeb`, `openbmb/UltraX-Preview` y `openbmb/Ultra-FineWeb-L3` corresponden a la fase de preentrenamiento; `openbmb/UltraData-Math` y `openbmb/UltraData-Code` aportan datos especializados de matemáticas y código; y `openbmb/UltraData-SFT-2605`, `openbmb/UltraData-SFT-Agent-2609` y `openbmb/UltraData-RL-2609` indican fases de ajuste supervisado (SFT) y de aprendizaje por refuerzo (RL), esta última con un componente específico para agentes. No se detalla si se emplearon DPO, RLHF u otras técnicas concretas de alineamiento, ni innovaciones de decodificación (especulativa, atención lineal, etc.). El informe técnico de referencia es el MiniCPM Tech Report (arXiv:2506.07900).

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento sobre código: la model card destaca ventajas en tareas de programación frente a modelos de tamaño comparable.
- Razonamiento matemático, apoyado en el dataset `UltraData-Math`.
- Comprensión de contexto largo, aunque sin cifra oficial de ventana publicada.
- Tool calling y function calling (etiqueta `tool-calling` en el repositorio).
- Tareas agénticas y razonamiento multi-paso, respaldadas por el dataset `UltraData-SFT-Agent-2609` y la dimensión "Tool Use" del gráfico de capacidades de la model card.
- Seguimiento de instrucciones (dimensión "Instruction Following" en el radar publicado).
- Conocimiento general (dimensión "General Knowledge" en el mismo gráfico).
- Despliegue en dispositivo y en el borde (etiquetas `on-device` y `edge-ai`).
- Compatibilidad declarada con text-generation-inference y con endpoints (etiqueta `endpoints_compatible`).

No se documentan capacidades de visión, audio, ni un modo de "thinking" explícito. Tampoco se declaran idiomas distintos del inglés y el chino.

## Casos de uso

- Asistentes locales en dispositivo: con ~2,5 B de parámetros, el modelo cabe en equipos de gama media y permite ejecutar un asistente conversacional sin enviar datos a la nube, algo relevante en aplicaciones con requisitos de privacidad.
- Atención al cliente en inglés y chino: su naturaleza conversacional y su ventana etiquetada como `long-context` permiten gestionar diálogos multi-turno con historial extenso, aunque la cifra exacta de contexto debe verificarse antes de dimensionar la solución.
- Pipelines de function calling: la etiqueta `tool-calling` y la compatibilidad con endpoints permiten usarlo como motor de enrutado de llamadas a APIs, extracción estructurada de parámetros y orquestación de servicios.
- Agentes multi-paso: los datos `UltraData-SFT-Agent-2609` y la dimensión "Tool Use" del radar apuntan a tareas de planificación, uso secuencial de herramientas y ejecución de flujos compuestos con verificación intermedia.
- Generación de código en entornos locales: IDE o asistentes de terminal que necesiten autocompletado y generación de funciones sin depender de servicios externos, apoyándose en `UltraData-Code`.
- Tutoría y resolución de problemas matemáticos: explicación paso a paso de ejercicios, generación de problemas y verificación de soluciones, aprovechando el entrenamiento específico en matemáticas.
- Procesamiento de documentos extensos: resumen, extracción de entidades y preguntas sobre contratos, informes o documentación técnica en inglés o chino, sujeto a la ventana real de contexto.
- Base para fine-tuning de dominio: el tamaño contenido en safetensors (~5 GB de repositorio) permite reentrenar o ajustar con LoRA sobre una única GPU, adaptando el modelo a verticales concretas con licencia Apache 2.0.
- Clasificación y enrutado de intenciones en sistemas de bajo coste: tareas de etiquetado, moderación ligera o extracción de campos donde un modelo de 2B reduce el coste por token frente a alternativas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye un gráfico de radar ("Capability Radar by Dimension") con las dimensiones Code Reasoning, Math Reasoning, Instruction Following, General Knowledge, Long Context y Tool Use, normalizadas al 100 % por eje y sin valores numéricos asociados. El texto afirma que MiniCPM5-2B alcanza el estado del arte dentro del conjunto de modelos comparados de clase 2B y que se mantiene competitivo frente a modelos de clase 4B, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información proporcionada, por lo que no se pueden verificar ni reproducir esas afirmaciones con los datos disponibles.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento real de parámetros (2,52 B) y del tamaño del repositorio, no datos publicados por el autor; deben validarse con pruebas propias.

- Inferencia en BF16/FP16: en torno a 5,0-5,5 GB solo para pesos, más caché KV y activaciones; se recomienda reservar 7-8 GB de VRAM para secuencias de contexto medio.
- Inferencia en INT8: aproximadamente 2,5-3 GB de pesos, con un margen de 4-5 GB de VRAM total.
- Inferencia en INT4: aproximadamente 1,3-1,6 GB de pesos, viable en GPUs de 4 GB o incluso en algunos aceleradores integrados.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB si se cuantiza.
- GPU de centro de datos: A100, H100, L40S y similares son sobredimensionadas para un modelo denso de 2,5 B, pero permiten lotes grandes y alto rendimiento.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM por compatibilidad con arquitecturas Llama. Para llama.cpp u Ollama sería necesario generar cuantizaciones GGUF propias, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B (este repositorio) | 2,52 B | no disponible | Apache 2.0 | safetensors en HuggingFace, 0 descargas y 0 likes en el momento de la consulta | Repositorio publicado por el usuario `developerjeremylive`; la model card referencia `openbmb/MiniCPM5-2B` |
| MiniCPM5-1B | no disponible en la información proporcionada | no disponible | no disponible | `openbmb/MiniCPM5-1B` en HuggingFace | Primer modelo de la serie MiniCPM5, misma receta de entrenamiento |
| Modelos abiertos de clase 4B | no disponible | no disponible | no disponible | no disponible | La model card afirma que MiniCPM5-2B se mantiene competitivo frente a esta categoría, pero no identifica modelos concretos ni aporta cifras |

No se dispone de datos suficientes para una comparativa cuantitativa fiable contra alternativas concretas.

## Limitaciones y advertencias

- Cobertura idiomática limitada: solo inglés y chino. No hay soporte declarado de castellano ni de otras lenguas, por lo que el rendimiento en español no está garantizado ni evaluado.
- Procedencia del repositorio: el identificador pertenece a `developerjeremylive`, no a `openbmb`, y la model card referencia el modelo oficial `openbmb/MiniCPM5-2B`. El sufijo `-etheroi` no se explica en la información disponible. Se recomienda verificar la integridad de los pesos y contrastarlos con el repositorio oficial antes de usarlos en producción.
- Sin benchmarks numéricos publicados: las afirmaciones de estado del arte y de competitividad frente a modelos de 4B no están respaldadas por cifras en la información disponible. Es imprescindible una evaluación propia para el caso de uso concreto.
- Riesgo de alucinación: inherente a los modelos de 2B parámetros, especialmente en conocimiento factual, razonamiento de múltiples pasos y tareas de contexto largo. No se documentan tasas de alucinación.
- Sesgos: no documentados en la información disponible. Al entrenarse principalmente con corpus en inglés y chino de OpenBMB, es esperable un sesgo cultural y lingüístico hacia esos contextos.
- Contexto largo sin cifra oficial: la etiqueta `long-context` no viene acompañada de un número de tokens, lo que impide dimensionar la memoria necesaria y planificar tareas de contexto extenso.
- Despliegue en llama.cpp/Ollama: al no publicarse GGUF, es necesario convertirlo, con el consiguiente riesgo de degradación por cuantización no validada por el autor.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no se detallan las licencias de los datasets de entrenamiento referenciados, lo que conviene revisar si el uso es comercial.
- Ausencia de tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validaciones externas conocidas.
- No se documentan modos especiales (thinking, visión, audio) ni mecanismos de decodificación especulativa que pudieran mejorar la latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/developerjeremylive/MiniCPM5-2B-etheroi
- Modelo oficial de referencia citado en la model card: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo predecesor de la serie: https://huggingface.co/openbmb/MiniCPM5-1B
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- MiniCPM Tech Report (arXiv:2506.07900): https://arxiv.org/pdf/2506.07900
- Referencia arXiv:2602.09003 (citada en las etiquetas del repositorio, sin título disponible en la información proporcionada): https://arxiv.org/abs/2602.09003
- Repositorio GitHub de OpenBMB/MiniCPM: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (en chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Portal de datos UltraData: https://ultradata.openbmb.cn/
- README en chino del modelo: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md
