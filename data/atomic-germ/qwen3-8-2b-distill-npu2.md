# Atomic-Germ/Qwen3.8-2B-Distill-NPU2

## Resumen

Qwen3.8-2B-Distill-NPU2 es una conversión cuantizada del modelo destilado `empero-ai/Qwen3.8-2B-Distill`, preparada por Atomic-Germ para ejecutarse en las NPU AMD XDNA mediante el runtime FastFlowLM (FLM). El modelo original pertenece a la familia Qwen3.8, una serie de modelos de lenguaje y visión desarrollada por Alibaba, que incluye versiones destiladas de 2B, 4B y 9B entrenadas a partir de las trazas de razonamiento del modelo teacher Qwen3.8-Max (2,4 billones de parámetros). Esta conversión concreta utiliza el formato propietario Q4NX, que combina cuantización Q8_0, Q4_1 y BF16, y está optimizada para inferencia local en hardware AMD, no para GPU tradicionales.

La relevancia de este modelo radica en su capacidad para ejecutar un modelo multimodal (texto e imagen) de 2B parámetros en dispositivos con NPU AMD, un segmento emergente en el despliegue de IA en el borde. Al ser una conversión de un destilado, ofrece un equilibrio entre rendimiento y eficiencia, aunque su disponibilidad es limitada al ecosistema FastFlowLM y a la plataforma XDNA. El repositorio incluye tanto los pesos del modelo de lenguaje como los del codificador de visión, ambos en formato Q4NX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión), basada en Qwen3.8 (no se especifica detalle de capas o atención) |
| Parametros totales | 2B (según denominación del modelo; no se confirma el número exacto) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (mezcla de Q8_0, Q4_1 y BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base `empero-ai/Qwen3.8-2B-Distill` es un destilado de la familia Qwen3.8, entrenado a partir de las salidas de razonamiento paso a paso (chain-of-thought) del modelo teacher Qwen3.8-Max, que cuenta con 2,4 billones de parámetros. El proceso de destilación consiste en que el modelo pequeño aprende a replicar las trazas de razonamiento generadas por el teacher, lo que le permite adquirir capacidades de razonamiento sin necesidad de entrenar desde cero. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La conversión a Q4NX es un proceso de cuantización específico para el runtime FastFlowLM, que agrupa los pesos en tres precisiones distintas (Q8_0, Q4_1 y BF16) para optimizar el uso de memoria y la velocidad en NPU AMD XDNA. El repositorio incluye también un modelo de visión separado (`vision_weight.q4nx`), lo que indica que el modelo original soporta entrada de imágenes además de texto.

## Capacidades

- Generación de texto y razonamiento: al ser un destilado de Qwen3.8-Max, hereda capacidades de razonamiento paso a paso, aunque con menor capacidad que el teacher.
- Comprensión de imágenes: el modelo es multimodal (image-text-to-text), por lo que puede procesar imágenes junto con texto.
- Conversación multi-turno: incluye una plantilla de chat (`chat_template.jinja`), lo que permite su uso en diálogos.
- Inferencia en NPU AMD: está compilado específicamente para el runtime FastFlowLM, lo que permite ejecución eficiente en hardware XDNA.
- No se indica soporte explícito de tool calling, function calling ni agentes en la información disponible.

## Casos de uso

- Asistente conversacional en dispositivos edge: gracias a su tamaño reducido (2B) y su optimización para NPU AMD, puede desplegarse en portátiles o mini-PCs con XDNA para ofrecer un asistente local sin conexión a la nube.
- Análisis de imágenes en local: al ser multimodal, puede utilizarse para describir imágenes, extraer texto de capturas o responder preguntas visuales en entornos donde la privacidad impide enviar datos a servidores externos.
- Prototipado de aplicaciones de IA en hardware AMD: desarrolladores que trabajen con el ecosistema FastFlowLM pueden usar este modelo como punto de partida para validar flujos de inferencia en NPU antes de escalar a modelos mayores.
- Educación e investigación en destilación: al ser un destilado de un modelo de 2,4T, sirve como caso de estudio para comparar el rendimiento de modelos pequeños entrenados con trazas de razonamiento.
- Generación de contenido asistida en entornos con restricciones de hardware: su bajo consumo de memoria (2,32 GB de pesos) permite ejecutarlo en sistemas con recursos limitados, como routers o dispositivos IoT avanzados.
- Evaluación de cuantización Q4NX: investigadores interesados en formatos de pesos alternativos pueden analizar el impacto de esta cuantización mixta en la calidad de las respuestas frente a otros formatos como GGUF o safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo concreto ni para su modelo base destilado.

## Requisitos de hardware

- Hardware objetivo: NPU AMD XDNA (por ejemplo, las integradas en procesadores Ryzen AI). No está diseñado para GPU NVIDIA o AMD tradicionales.
- Memoria: los pesos cuantizados ocupan 2,32 GB (modelo de lenguaje) más el modelo de visión, por lo que se requiere al menos 4 GB de memoria disponible en el dispositivo.
- Runtime: FastFlowLM (FLM) versión 1.0.1 o superior. Se instala mediante `flm-add`, que copia el modelo al directorio de usuario y registra la etiqueta.
- No se proporcionan datos de latencia ni throughput. Al ser una conversión para NPU, el rendimiento dependerá de la generación concreta de XDNA y de la configuración del runtime.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato Q4NX es exclusivo de FastFlowLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-2B-Distill-NPU2 (este) | 2B | no disponible | texto + imagen | Q4NX | Apache 2.0 |
| Atomic-Germ/Qwen3.8-Distilled-1.2B-NPU2 | 1.2B | no disponible | texto + imagen (presumible) | Q4NX | Apache 2.0 |
| Atomic-Germ/Qwen3.8-Distilled-9B-NPU2 | 9B | no disponible | texto + imagen (presumible) | Q4NX | Apache 2.0 |
| empero-ai/Qwen3.8-2B-Distill (modelo base) | 2B | no disponible | texto + imagen | safetensors (presumible) | Apache 2.0 |

La comparativa se limita a las variantes del mismo autor y al modelo base, ya que no se dispone de información sobre otros modelos destilados de Qwen3.8 en formatos similares. Las diferencias principales entre las versiones NPU2 son el tamaño de parámetros y, por tanto, la memoria ocupada y la capacidad de razonamiento.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado principalmente con datos en inglés, puede presentar sesgos culturales y lingüísticos propios de ese corpus. No se ha documentado ningún estudio de sesgos específico.
- Alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados. El tamaño reducido (2B) aumenta el riesgo frente a modelos mayores.
- Contexto limitado: no se ha especificado la longitud de contexto, pero es probable que sea inferior a la de modelos más grandes de la familia Qwen3.8, lo que limita su uso en tareas que requieran documentos extensos.
- Dependencia del ecosistema FastFlowLM: el formato Q4NX no es portable a otros runtimes. Si FastFlowLM deja de mantenerse o no está disponible para una plataforma concreta, el modelo queda inutilizable.
- Restricciones de hardware: solo funciona en NPU AMD XDNA. No se puede ejecutar en GPUs convencionales ni en CPUs sin el runtime adecuado.
- Idiomas: solo se declara inglés. El rendimiento en otros idiomas, incluido el español, no está garantizado.
- Sin benchmarks publicados: no hay evidencia objetiva del rendimiento del modelo en tareas estándar, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Qwen3.8-2B-Distill-NPU2
- Modelo base (empero-ai/Qwen3.8-2B-Distill): https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Repositorio oficial de Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Repositorio de destilados de Qwen3.8 (GitHub): https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
- Variante 1.2B del mismo autor: https://huggingface.co/Atomic-Germ/Qwen3.8-Distilled-1.2B-NPU2
- Variante 9B del mismo autor: https://huggingface.co/Atomic-Germ/Qwen3.8-Distilled-9B-NPU2
