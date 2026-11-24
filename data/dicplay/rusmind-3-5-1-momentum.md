# DICPlay/RusMind-3.5.1-Momentum

## Resumen

RusMind 3.5.1 · Momentum es un modelo de lenguaje afinado por DICPlay a partir de google/gemma-4-E2B-it, orientado a inferencia local y offline en ruso e inglés. Se distribuye exclusivamente en formato GGUF dentro del repositorio de Hugging Face, con cuatro niveles de cuantización que van desde 2,5 GB (Lite) hasta 9,3 GB (BF16), lo que lo sitúa en el segmento de modelos ligeros ejecutables en portátiles, equipos de sobremesa y teléfonos de gama alta.

El modelo se presenta como la variante más ligera de la familia RusMind y está especializado en contenido sobre Rusia: historia, cultura, legislación, regiones, pueblos y lo que el autor denomina "valores familiares tradicionales". Es un fine-tune conversacional que hereda la arquitectura del modelo base de Google y añade un ajuste específico para el idioma ruso y el cumplimiento de la normativa rusa.

Su relevancia actual radica en dos factores: la distribución en GGUF lista para llama.cpp, Ollama, LM Studio y PocketPal, y la existencia de una línea posterior (RusMind 4.7) que el propio autor recomienda. El repositorio acumula 3788 descargas y un tamaño total de 20,2 GB, con pesos derivados de un modelo base de 4.647.450.147 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-4-E2B-it); detalles internos no disponibles |
| Parametros totales | 4.647.450.147 (pesos safetensors del modelo base); el modelo base se denomina E2B, lo que sugiere una configuración con expertos, aunque el número de parámetros activos no está disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Lite (2,5 GB), Q4_K_M (3,4 GB), Q8_0 (5,0 GB), BF16 (9,3 GB) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propia, etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (único formato publicado en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint google/gemma-4-E2B-it, según declara la model card con la relación `base_model_relation: finetune`. No se publican detalles sobre la arquitectura interna más allá de lo que implica el nombre del modelo base: la nomenclatura "E2B" de la familia Gemma 4 apunta a una configuración con mezcla de expertos y aproximadamente 2 000 millones de parámetros activos, aunque esta interpretación no se confirma en la información disponible. Tampoco se especifican la longitud de contexto nativa, el número de capas ni el esquema de atención.

Respecto al entrenamiento, la información disponible es mínima. La model card menciona que la versión 3.5.1 mejora la solidez en ruso e inglés, la ejecución precisa de tareas (autocompletado de código, preguntas cortas por patrón) y el alineamiento con "valores familiares tradicionales y la legislación de Rusia". No se indica el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con especial énfasis en registro formal y contenido sobre Rusia.
- Conocimiento profundo declarado sobre historia, cultura, leyes, regiones y pueblos de Rusia.
- Autocompletado y finalización de código, según la model card de la versión 3.5.1.
- Respuesta a preguntas cortas siguiendo patrones predefinidos ("entiende preguntas cortas por modelo").
- Llamada a herramientas (tool calling): la model card de la línea 4.7 menciona "вызывает инструменты" como capacidad de la familia; para 3.5.1 no se detalla explícitamente, por lo que debe considerarse no confirmada.
- Ejecución totalmente offline una vez descargado el archivo GGUF, sin dependencia de red.
- Compatibilidad con endpoints y con el ecosistema llama.cpp (`endpoints_compatible` en los tags).

## Casos de uso

- Asistente conversacional offline en portátiles: con el archivo Q4_K_M (3,4 GB) el modelo se ejecuta en llama.cpp o LM Studio sin conexión, adecuado para entornos con requisitos de privacidad o conectividad limitada.
- Despliegue en dispositivos móviles: la variante Lite (2,5 GB) está pensada para teléfonos y portátiles ligeros mediante PocketPal u otras aplicaciones GGUF, permitiendo un asistente local en ruso.
- Consultas sobre legislación y administración rusa: el ajuste específico en leyes y regiones lo hace útil para prototipos de atención ciudadana o consulta documental en ruso, siempre con verificación humana por el riesgo de alucinación.
- Generación y autocompletado de código en entornos de desarrollo con restricciones de red: la model card indica que la versión 3.5.1 "termina código", por lo que puede integrarse en asistentes de IDE locales.
- Educación y divulgación cultural: respuestas sobre historia, cultura y pueblos de Rusia en ruso e inglés, aprovechable en materiales didácticos o chatbots temáticos.
- Investigación sobre fine-tuning y cuantización: al publicarse en BF16 (9,3 GB) y Q8_0, sirve como base para estudiar el efecto de la cuantización en modelos pequeños ajustados a un dominio e idioma concretos.
- Filtrado y moderación de contenido alineado con la normativa rusa: el ajuste declarado hacia la legislación y los valores tradicionales permite experimentar con clasificación y generación de respuestas conformes a ese marco, con las cautelas éticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para RusMind 3.5.1 · Momentum. La model card únicamente incluye cifras de MERA v2 para las versiones posteriores de la familia (RusMind 4.7, Sokol 4.7 y Vspyshka 4.7), no para 3.5.1, por lo que no se trasladan aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB con Lite, 4-5 GB con Q4_K_M, 6-7 GB con Q8_0 y 10-11 GB con BF16, considerando pesos más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M (RTX 3060, RTX 4060, RTX 2070); 8 GB o más para Q8_0 (RTX 3070, RTX 4060 Ti, RTX 4070); A100 y H100 no son necesarias para este tamaño y solo tendrían sentido en despliegues multiinstancia.
- Cabe en GPU de consumo: sí, en todas las variantes hasta Q8_0 con GPUs de gama media; BF16 requiere 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080).
- Despliegue: llama.cpp (`llama-cli -m ... -cnv`), LM Studio, Ollama, PocketPal y cualquier runtime compatible con GGUF; también se puede servir mediante endpoints compatibles según los tags del repositorio.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de ~4,6 mil millones de parámetros totales en GGUF, se espera una generación interactiva en GPUs de consumo, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| RusMind 3.5.1 · Momentum | 4.647.450.147 (total) | no disponible | ru, en | rusmind-license | GGUF | Fine-tune de Gemma 4 E2B-it, enfoque en Rusia |
| RusMind Vspyshka 4.7 | ~7.500 millones | no disponible | ru, en | no disponible en la informacion | GGUF y pesos completos | Version posterior del mismo autor; 0,191 en MERA v2 segun la model card |
| Qwen3.5-9B (Alibaba) | ~9.000 millones | no disponible | multilingue | no disponible en la informacion | no disponible | 0,186 en MERA v2 segun la model card de RusMind |
| Gemma 4 E4B (Google) | ~8.000 millones | no disponible | multilingue | no disponible en la informacion | no disponible | 0,170 en MERA v2 segun la model card de RusMind |
| T-lite (T-Bank) | ~8.000 millones | no disponible | ru | no disponible en la informacion | no disponible | 0,130 en MERA v2 segun la model card de RusMind |

Las cifras de MERA v2 proceden de la model card del autor y no se han verificado de forma independiente en esta ficha. Para 3.5.1 no hay datos de benchmark que permitan una comparación directa.

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste declara explícitamente una orientación hacia "valores familiares tradicionales" y la legislación rusa, lo que puede introducir sesgo ideológico y limitar la neutralidad en temas sociales y políticos.
- Riesgo de alucinación: como todo modelo de ~4,6 mil millones de parámetros, especialmente en dominios jurídicos e históricos, puede generar datos incorrectos con apariencia de veracidad; requiere verificación en usos sensibles.
- Limitaciones de idioma: solo ruso e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Contexto: la longitud de contexto no se publica, lo que dificulta planificar casos de uso con documentos largos.
- Licencia: rusmind-license es una licencia propia etiquetada como "other"; no se detallan en la información disponible las condiciones de uso comercial, por lo que es imprescindible revisar el archivo LICENSE antes de un despliegue en producción.
- Formato: solo se distribuye GGUF; no hay safetensors publicados en este repositorio, lo que complica el reentrenamiento o la integración con stacks que requieran pesos completos.
- Obsolescencia: el propio autor recomienda migrar a RusMind 4.7, lo que sugiere que 3.5.1 no recibirá mejoras futuras.
- Ausencia de benchmarks propios: no hay métricas publicadas para esta versión concreta, lo que impide evaluar su calidad de forma objetiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DICPlay/RusMind-3.5.1-Momentum
- Repositorio de la familia RusMind Momentum: https://huggingface.co/DICPlay/RusMind-Momentum
- Demo web: https://rusmind.ru
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Versión posterior recomendada (RusMind 4.7 · Momentum): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 · Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 · Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Archivo de licencia: https://huggingface.co/DICPlay/RusMind-3.5.1-Momentum/blob/main/LICENSE
- Pesos Lite: https://huggingface.co/DICPlay/RusMind-3.5.1-Momentum/blob/main/RusMind-Momentum-3.5.1-Lite.gguf
- Pesos Q4_K_M: https://huggingface.co/DICPlay/RusMind-3.5.1-Momentum/blob/main/RusMind-Momentum-3.5.1-Q4_K_M.gguf
- Pesos Q8_0: https://huggingface.co/DICPlay/RusMind-3.5.1-Momentum/blob/main/RusMind-Momentum-3.5.1-Q8_0.gguf
- Pesos BF16: https://huggingface.co/DICPlay/RusMind-3.5.1-Momentum/blob/main/RusMind-Momentum-3.5.1-BF16.gguf
