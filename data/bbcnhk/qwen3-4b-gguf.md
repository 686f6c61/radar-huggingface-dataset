# bbcnhk/Qwen3-4B-GGUF

## Resumen

bbcnhk/Qwen3-4B-GGUF es una versión cuantizada en formato GGUF del modelo denso Qwen3-4B, publicada por el usuario bbcnhk. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos pensada para su ejecución en llama.cpp y en entornos de inferencia local con recursos limitados. El repositorio ocupa 15,8 GB, lo que indica que agrupa varios niveles de cuantización del mismo modelo base, y su acceso está restringido en HuggingFace: requiere aceptar condiciones antes de poder descargarlo.

El modelo subyacente, Qwen3-4B, pertenece a la familia Qwen3 de Alibaba, una generación de modelos densos y MoE que introdujo el modo de razonamiento explícito conmutable. Qwen3-4B tiene 4.022.468.096 parámetros, una ventana de contexto nativa de 32.768 tokens ampliable a 131.072 mediante YaRN, y licencia Apache 2.0, lo que lo hace atractivo para productos comerciales sin obligaciones de atribución adicionales.

La relevancia de esta ficha concreta es operativa: al ser un GGUF de terceros, conviene verificar la calidad de la cuantización, la integridad de la plantilla de chat y la disponibilidad real de los ficheros antes de integrarlo en un pipeline de producción. El repositorio no aporta documentación propia, métricas ni información sobre el proceso de conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen3-4B) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con extensión YaRN (según el modelo base) |
| Tipos de cuantización | Formato GGUF; niveles concretos no disponibles en la información proporcionada (el repositorio ocupa 15,8 GB, compatible con múltiples niveles) |
| Idiomas soportados | No disponible en el repositorio; el modelo base Qwen3-4B declara 119 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3-4B: un transformer decoder-only denso con atención causal, Grouped Query Attention (8 cabezas KV frente a 32 cabezas de consulta en el modelo base), RoPE y embeddings de salida atados a los de entrada. El repositorio no documenta ninguna modificación estructural: es una conversión de pesos, no un ajuste fino ni una variante arquitectónica.

En cuanto al entrenamiento, la información disponible corresponde únicamente al modelo base: Qwen3-4B se entrenó con aproximadamente 36 billones de tokens sobre un corpus multilingüe de 119 idiomas, seguido de un post-entrenamiento en varias fases que incluye arranque en frío con cadenas de razonamiento largas, aprendizaje por refuerzo sobre razonamiento, fusión de los modos thinking y non-thinking, y destilación de modelos mayores. El repositorio no aporta detalles sobre el proceso de cuantización aplicado (herramienta utilizada, calibración, tipo de quant).

## Capacidades

- Generación de texto conversacional multilingüe, con 119 idiomas declarados en el modelo base.
- Razonamiento explícito conmutable: modo thinking activable por prompt, con presupuesto de razonamiento controlable.
- Generación de código, depuración y explicación de fragmentos en múltiples lenguajes de programación.
- Razonamiento matemático y resolución de problemas de varios pasos.
- Seguimiento de instrucciones y formato estructurado de salida (JSON, listas, plantillas).
- Soporte de tool calling y function calling, según lo declarado para el modelo base.
- Capacidad para flujos agénticos multi-paso y uso de herramientas encadenadas.
- No dispone de capacidades de visión ni de audio: es un modelo exclusivamente de texto.
- El repositorio no documenta ninguna capacidad adicional más allá de las heredadas del modelo base.

## Casos de uso

- Asistentes conversacionales en local: con cuantizaciones de 4 bits el modelo cabe en GPUs de consumo y portátiles, lo que permite desplegar un chatbot multi-turno con contexto de hasta 32.768 tokens sin enviar datos a terceros.
- Generación de código en el IDE: integrado mediante llama.cpp u Ollama, sirve como autocompletado y asistente de refactorización en equipos con GPU modesta, evitando costes de API.
- Procesamiento por lotes de documentos: tareas de resumen, extracción de entidades y clasificación sobre lotes grandes de texto, donde el coste por token es determinante y el contexto largo reduce la necesidad de fragmentar.
- Enrutamiento y preprocesado en pipelines agénticos: por su tamaño, es adecuado como modelo "rápido" que decide a qué herramienta o modelo mayor derivar una consulta, reduciendo latencia y coste en arquitecturas de varios modelos.
- Razonamiento matemático asistido: tareas de verificación de cálculos, generación de ejercicios resueltos y comprobación de resultados, activando el modo thinking cuando la precisión importa más que la latencia.
- Atención al cliente multilingüe: al cubrir 119 idiomas en el modelo base, permite atender consultas en varios idiomas con una sola instancia, siempre que la cuantización no degrade en exceso los idiomas menos representados.
- Prototipado e investigación: evaluación comparativa de técnicas de prompting, decodificación especulativa o agentes, con un coste de hardware bajo y licencia Apache 2.0.
- Despliegue en el borde o en dispositivos con poca VRAM: las cuantizaciones de menor tamaño permiten ejecución parcial en CPU con memoria RAM convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio bbcnhk/Qwen3-4B-GGUF no incluye métricas de evaluación, ni tampoco datos sobre la degradación introducida por la cuantización respecto al modelo base. Las cifras de referencia publicadas por el equipo de Qwen corresponden a Qwen3-4B en precisión completa y no son trasladables directamente a los ficheros GGUF de este repositorio.

## Requisitos de hardware

- Los requisitos exactos dependen del nivel de cuantización elegido, que no se detalla en la información disponible.
- Estimación de peso de los ficheros: en torno a 2,5 GB para una cuantización de 4 bits, unos 4,5 GB para 8 bits y unos 8 GB para 16 bits, sobre los 4.022 millones de parámetros del modelo.
- Caché KV: con 36 capas, 8 cabezas KV y dimensión de cabeza 128, el consumo es de aproximadamente 144 KB por token en FP16, es decir, unos 4,7 GB a 32.768 tokens de contexto y unos 18,9 GB a 131.072 tokens. Cuantizar la caché KV (por ejemplo a Q8_0) reduce estas cifras aproximadamente a la mitad.
- GPU de consumo: una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 pueden ejecutar el modelo en 4 u 8 bits con contexto amplio. Tarjetas de 8 GB permiten cuantizaciones de 4 bits con contexto moderado.
- GPU profesionales: A100, H100 y L40S cubren sin problema la inferencia en 16 bits y contextos largos; son necesarias para servir muchas peticiones concurrentes con caché KV grande.
- CPU: las cuantizaciones de 4 bits pueden ejecutarse íntegramente en CPU con 8-16 GB de RAM, con velocidades de pocos tokens por segundo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa y requerirían los pesos en safetensors del modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones para esta conversión concreta y las cifras variarían según hardware, cuantización y longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| bbcnhk/Qwen3-4B-GGUF (base Qwen3-4B) | 4,02 B | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | GGUF; repositorio de terceros con acceso restringido |
| Qwen/Qwen3-4B | 4,02 B | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Safetensors; acceso abierto |
| Llama 3.2 3B | 3,21 B | 128.000 | Licencia comunitaria de Llama 3.2 | Safetensors y GGUF; acceso abierto con aceptación de condiciones |
| Gemma 3 4B | 4 B | 128.000 | Términos de uso de Gemma | Safetensors y GGUF; acceso abierto con aceptación de condiciones |
| Phi-4-mini | 3,8 B | 128.000 | MIT | Safetensors; acceso abierto |

No se dispone de datos de rendimiento comparativos para esta conversión concreta, por lo que la comparación se limita a especificaciones estructurales y condiciones de licencia. Los datos de los modelos alternativos corresponden a sus especificaciones públicas y pueden variar con actualizaciones.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace, lo que añade fricción a la automatización de descargas y a los despliegues reproducibles.
- Repositorio de terceros sin documentación: no se especifica la herramienta de cuantización, la calibración empleada ni los niveles incluidos, lo que impide auditar la fidelidad respecto al modelo base.
- Riesgo de degradación por cuantización: las cuantizaciones agresivas de 4 bits o inferiores suelen afectar antes a tareas de razonamiento matemático, código y idiomas de bajos recursos que a la generación de texto general.
- Riesgo de alucinación: inherente a los modelos de 4.000 millones de parámetros; en tareas factuales abiertas la tasa de error es mayor que en modelos de mayor tamaño.
- Sesgos: no hay información sobre evaluación de sesgos en este repositorio; el modelo base hereda los sesgos de su corpus de entrenamiento, con predominio del inglés y del chino.
- Idiomas: aunque el modelo base declara 119 idiomas, el rendimiento es desigual y no está medido para esta cuantización. El castellano funciona correctamente, pero con menor calidad que el inglés.
- Contexto: superar los 32.768 tokens requiere activar la extensión YaRN de forma explícita; sin ella el modelo puede degradarse en ventanas largas. El coste de caché KV a 131.072 tokens es prohibitivo en GPUs de consumo.
- Modo thinking: el razonamiento explícito incrementa notablemente el número de tokens generados y, por tanto, la latencia y el coste. En producción conviene desactivarlo o limitar el presupuesto de razonamiento según la tarea.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar que la conversión GGUF concreta mantiene esa licencia y no añade condiciones propias.
- Fecha de publicación fuera de lo habitual: el repositorio está fechado en octubre de 2026, posterior a la ventana temporal de esta ficha; conviene confirmar su estado actual antes de integrarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bbcnhk/Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Informe técnico de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Artículo de YaRN, extensión de contexto (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- llama.cpp, motor de inferencia para GGUF: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo ni sobre su autor; los enlaces anteriores corresponden al modelo base, a la documentación técnica asociada y a las herramientas de inferencia compatibles.
