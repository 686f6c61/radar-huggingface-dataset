# mradermacher/MiniCPM5-2B-heretic-abliterated-GGUF

## Resumen

MiniCPM5-2B-heretic-abliterated-GGUF es la versión cuantizada en formato GGUF del modelo MiniCPM5-2B-heretic-abliterated, desarrollado originalmente por insraq y cuantizado por mradermacher. Se trata de un Transformer denso de 2.516.756.480 parámetros (2,5B), diseñado para escenarios de despliegue en dispositivos de borde, entornos con recursos limitados y aplicaciones on-device. Es el segundo modelo de la serie MiniCPM5, tras MiniCPM5-1B, y sigue una receta de entrenamiento similar orientada a alcanzar el estado del arte en su categoría de 2B.

La variante "heretic-abliterated" ha sido sometida a un proceso de abliteración que elimina las restricciones de alineamiento de seguridad del modelo original, lo que resulta en un comportamiento "uncensored". El modelo se distribuye bajo licencia Apache 2.0 y soporta generación de texto en inglés y chino, con capacidades de contexto largo y tool calling. La cuantización GGUF permite ejecutarlo en hardware modesto, con tamaños de archivo que van desde 1,1 GB en Q2_K hasta 5,1 GB en f16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un Transformer denso de 2B, sin mezcla de expertos (MoE). Está diseñado para ejecutarse en dispositivos de borde y entornos con recursos limitados, priorizando eficiencia de memoria y latencia. Los datos de entrenamiento proceden de datasets de OpenBMB, incluyendo Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3 (texto web), UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. Estas fuentes indican un pipeline de entrenamiento que combina preentrenamiento en texto y código, seguido de ajuste supervisado (SFT) y aprendizaje por refuerzo (RL). La variante "heretic-abliterated" se obtiene mediante un proceso de abliteración que elimina las respuestas de rechazo o restricciones de seguridad aprendidas durante el alineamiento, generando un modelo "uncensored". La cuantización a GGUF ha sido realizada por mradermacher, preservando la arquitectura original.

## Capacidades

- Generación de texto en inglés y chino.
- Soporte de tool calling / function calling para integración en agentes.
- Ventana de contexto larga, adecuada para documentos extensos y conversaciones multi-turno (la longitud exacta no está disponible en la información proporcionada).
- Diseñado para despliegue on-device y edge AI, con bajo consumo de recursos.
- Modelo "abliterated" sin filtros de seguridad, lo que elimina restricciones de contenido.
- Compatible con el ecosistema GGUF (llama.cpp, Ollama, LM Studio, etc.).
- Proceso de cuantización reproducible, con múltiples niveles de compresión.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: el modelo puede ejecutarse en un mini PC o smartphone mediante llama.cpp con la cuantización Q4_K_M (1,7 GB), ofreciendo respuestas en inglés y chino sin conexión a internet.
- Automatización de tareas con tool calling: al soportar function calling, puede integrarse en agentes locales que gestionen APIs, por ejemplo, un asistente de productividad que consulte calendarios, correos o bases de datos internas.
- Procesamiento de documentos largos: gracias a su contexto largo, permite resumir o extraer información de informes extensos en entornos aislados, sin enviar datos a servicios externos.
- Generación de código en entornos sin GPU: con el dataset UltraData-Code, puede asistir en tareas de programación; su tamaño de 2B y las cuantizaciones de 1,1-1,7 GB permiten ejecutarlo en un portátil con CPU.
- Chat bilingüe inglés-chino: apto para aplicaciones de atención al cliente o traducción en empresas con usuarios de ambos idiomas, gracias a su entrenamiento bilingüe.
- Investigación en seguridad y alineación: al ser una variante abliterated, resulta útil para estudiar el comportamiento de modelos sin restricciones, comparar respuestas con modelos alineados o analizar sesgos.
- Prototipado rápido de aplicaciones de IA: la licencia Apache 2.0 y la disponibilidad de cuantizaciones GGUF facilitan pruebas locales y despliegues en entornos de desarrollo sin costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos como MMLU, HumanEval o GSM8K para este modelo, por lo que no es posible comparar su rendimiento de forma cuantitativa con otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en función de la cuantización, los pesos ocupan entre 1,1 GB (Q2_K) y 5,1 GB (f16). Para Q4_K_M (1,7 GB) se recomienda al menos 4 GB de VRAM, considerando el overhead de la caché KV.
- GPU recomendadas: para la cuantización Q4_K_S o superior, una GPU con 6-8 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4060) ofrece margen suficiente. Las cuantizaciones más agresivas (Q2_K, Q3_K_S) pueden ejecutarse en GPUs con 2-4 GB de VRAM.
- Soporte en GPU de consumo: sí, el modelo cabe en GPUs de consumo como la RTX 3060, RTX 4060 o incluso en integradas con suficiente memoria compartida usando Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y text-generation-webui para los archivos GGUF. El modelo base en safetensors puede desplegarse con vLLM o Transformers.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-heretic-abliterated-GGUF | 2,5B | no disponible | Apache 2.0 | GGUF, safetensors |
| MiniCPM5-1B-heretic-som-GGUF | 1B | no disponible | Apache 2.0 | GGUF |
| Qwen2.5-1.5B | 1,5B | no disponible | Apache 2.0 | GGUF, safetensors |
| Gemma-2-2B | 2,6B | no disponible | Licencia Gemma | GGUF, safetensors |

La comparación se basa en parámetros, licencia y formato de distribución. No se dispone de datos de contexto ni benchmarks para estos modelos en la información proporcionada, por lo que no se puede establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Al ser un modelo "abliterated", carece de filtros de seguridad y puede generar contenido dañino, ofensivo o inapropiado sin restricciones.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o sobre temas específicos.
- Soporte de idiomas limitado a inglés y chino; no está entrenado para español u otros idiomas.
- La longitud de contexto exacta no está documentada en la información disponible, por lo que el rendimiento en secuencias muy largas debe validarse experimentalmente.
- Aunque la licencia Apache 2.0 permite uso comercial, es necesario cumplir con los avisos de licencia y atribución, y verificar el comportamiento del modelo en producción.
- El proceso de abliteración puede degradar la calidad del modelo en comparación con la versión alineada, especialmente en tareas de seguimiento de instrucciones con matices de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiniCPM5-2B-heretic-abliterated-GGUF
- Modelo base: https://huggingface.co/insraq/MiniCPM5-2B-heretic-abliterated
- Modelo relacionado MiniCPM5-1B: https://huggingface.co/mradermacher/MiniCPM5-1B-heretic-som-GGUF
