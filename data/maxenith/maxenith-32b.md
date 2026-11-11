# Maxenith/MAXENITH-32B

## Resumen

MAXENITH 32B es un modelo de lenguaje causal de tipo denso con 32 763 876 352 parámetros, desarrollado por la organización Maxenith. Está construido sobre la arquitectura Qwen2 (etiqueta `qwen2` en el repositorio) y se presenta con un enfoque explícito en razonamiento profundo, resolución estructurada de problemas, generación de código y capacidades orientadas a agentes. Su ventana de contexto, según la información disponible, no está documentada en la model card.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y soporte para `transformers` y Text Generation Inference. Declara soporte para inglés y árabe, lo que lo sitúa en un nicho poco cubierto por modelos abiertos de este tamaño: modelos de 32B con competencia declarada en árabe y razonamiento.

La relevancia actual del modelo es limitada por su escasa tracción (cero descargas y cero likes en el momento de la consulta) y por la ausencia de benchmarks publicados. La model card menciona técnicas de entrenamiento como GRPO para autoverificación y corrección de errores, y modificaciones arquitectónicas denominadas "recurrent depth" para explorar profundidad computacional adicional en el espacio latente, pero no aporta detalles técnicos verificables ni resultados cuantitativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense Transformer (etiqueta `qwen2` en el repositorio) |
| Parametros totales | 32 763 876 352 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit mediante BitsAndBytes (nf4, double quant) segun model card; no se documentan otros formatos |
| Idiomas soportados | Ingles, arabe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 65,5 GB) |

## Arquitectura y entrenamiento

La model card describe una arquitectura de transformer denso de tipo causal, con la etiqueta `qwen2` asociada en el repositorio de Hugging Face, lo que sugiere una base derivada de la familia Qwen2. El proceso de desarrollo declarado incluye entrenamiento intensivo en razonamiento multi-paso (matemáticas y lógica), ajuste fino en programación y ingeniería de software, y capacidades de agente con salidas JSON estructuradas. Se menciona el uso de GRPO (Group Relative Policy Optimization) para autoverificación y corrección de errores, un algoritmo de aprendizaje por refuerzo empleado habitualmente para mejorar el razonamiento en modelos de lenguaje.

La model card también menciona "Recurrent Depth": modificaciones arquitectónicas para explorar profundidad computacional adicional durante la inferencia en el espacio latente. No se especifica en qué consiste esta modificación, cuántas capas adicionales implica ni cómo afecta al coste computacional. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO más allá del GRPO mencionado, ni detalles sobre la tokenización o el vocabulario. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto causal en inglés y árabe.
- Razonamiento multi-paso orientado a problemas matemáticos y lógicos, según declara el autor.
- Generación de código y aplicación de principios de ingeniería de software.
- Salidas estructuradas en JSON para interacción orientada a herramientas y APIs.
- Capacidades de agente y razonamiento multi-paso, según la model card.
- Autoverificación y corrección de errores mediante entrenamiento con GRPO (declarado).
- Plantilla de chat compatible con `apply_chat_template` y roles system/user.
- No se documenta soporte de visión, audio, tool calling nativo con esquema formal ni modo "thinking" explícito más allá de las menciones genéricas del autor.

## Casos de uso

- Asistencia a desarrolladores en árabe: el modelo declara competencia en árabe e inglés, por lo que puede emplearse para explicar código, redactar documentación técnica o responder dudas de programación a equipos arabohablantes, un caso poco cubierto por modelos abiertos de 32B.
- Generación de código en pipelines internos: con pesos safetensors y compatibilidad con `transformers` y TGI, puede integrarse en flujos de revisión de código o generación de tests, siempre que se validen las salidas con pruebas automáticas dado que no hay benchmarks publicados.
- Prototipado de agentes con salidas JSON: la model card declara salidas estructuradas orientadas a herramientas, lo que permite experimentar con orquestación de agentes que consumen APIs, aunque sin garantías formales de esquema.
- Razonamiento matemático asistido: para tareas de resolución de problemas paso a paso en entornos educativos o de análisis, con verificación humana obligatoria por la ausencia de evaluaciones independientes.
- Chat multi-turno bilingüe inglés-árabe: atención al cliente o asistentes internos en organizaciones que operan en ambos idiomas, desplegando el modelo con cuantización 4-bit en GPUs de 24 GB.
- Investigación sobre técnicas de entrenamiento: el modelo puede servir como objeto de estudio para analizar los efectos de GRPO y de las modificaciones de "recurrent depth" declaradas por el autor, comparando su comportamiento con la base Qwen2 subyacente.
- Experimentación académica con licencia permisiva: al ser Apache 2.0, puede usarse como base para ajuste fino en dominios específicos sin restricciones de uso comercial derivadas de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco ofrece comparaciones cuantitativas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 65 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB para inferencia cómoda.
- VRAM estimada en 4-bit (nf4 con double quant): en torno a 16-20 GB para pesos, lo que permite ejecución en GPUs de 24 GB según indica la propia model card.
- GPUs recomendadas: A100 80 GB o H100 para precisión completa; RTX 4090 (24 GB) o A6000 (48 GB) para cuantización 4-bit.
- Cabe en GPU de consumo (RTX 4090, RTX 3090 de 24 GB) únicamente con cuantización 4-bit.
- Opciones de despliegue: `transformers` con `device_map="auto"`, Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio) y cuantización vía BitsAndBytes. No se documenta compatibilidad con llama.cpp, GGUF u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| MAXENITH 32B | 32,8 B | no disponible | en, ar | Apache 2.0 | no disponible |
| Qwen2.5 32B | 32,5 B | 128 K (según documentación pública de Qwen) | multilingüe amplio | Apache 2.0 (variantes) | sí, publicados por el autor |
| Gemma 2 27B | 27 B | 8 K | multilingüe | Gemma License | sí, publicados por el autor |
| Yi 34B | 34 B | 200 K (versión 200K) | en, zh | Apache 2.0 | sí, publicados por el autor |

La comparación se basa en datos públicos de los modelos alternativos; para MAXENITH 32B no hay métricas verificables que permitan una comparación de rendimiento. La ventaja diferencial declarada del modelo es el soporte de árabe junto con razonamiento y código, combinación poco frecuente en modelos abiertos de esta escala.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar las capacidades declaradas de razonamiento, código o agente.
- Tracción nula en Hugging Face (cero descargas, cero likes) en el momento de la consulta, lo que dificulta la validación comunitaria.
- La model card no documenta la longitud de contexto, el dataset de entrenamiento, el número de tokens ni los detalles de la modificación "recurrent depth"; la reproducibilidad es limitada.
- Riesgo de alucinación: el propio autor declara explícitamente que no garantiza salidas libres de alucinaciones.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Cobertura lingüística limitada a inglés y árabe; el rendimiento en castellano no está evaluado ni declarado.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de evaluaciones independientes hace recomendable una validación exhaustiva antes de cualquier despliegue en producción.
- El soporte de tool calling y salidas JSON se describe de forma genérica, sin esquema formal ni garantías de conformidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maxenith/MAXENITH-32B
- Organización Maxenith en Hugging Face: https://huggingface.co/Maxenith
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
