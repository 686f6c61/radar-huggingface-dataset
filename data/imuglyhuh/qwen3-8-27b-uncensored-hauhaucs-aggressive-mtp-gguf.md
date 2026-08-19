# IMUGLYHUH/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una versión sin censura del modelo multimodal Qwen3.8-27B de Alibaba, publicada por el usuario IMUGLYHUH en Hugging Face. Se basa en el trabajo de HauhauCS, que aplica un perfil de "descensura" agresivo sobre el modelo original, eliminando por completo los comportamientos de rechazo (0 de 465 refusals) y reduciendo al mínimo los preámbulos en respuestas a prompts difíciles. El modelo conserva todas las capacidades del Qwen3.8-27B original: generación de texto, razonamiento, visión (imagen y vídeo), tool calling y control de modo de pensamiento.

La variante Aggressive está pensada para usuarios que necesitan respuestas directas sin que el modelo "se convenza a sí mismo" de cumplir con restricciones de seguridad. El repositorio ofrece una gama completa de cuantizaciones GGUF (desde Q8_K_P hasta IQ2_M), un proyector de visión en BF16 y un sidecar FastMTP que acelera la decodificación especulativa. Con una ventana de contexto nativa de 262 144 tokens (extensible hasta 1 000 000), este modelo es relevante para tareas de largo contexto en entornos donde la moderación de contenido no es un requisito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido causal con 48 capas Gated DeltaNet y 16 capas de atención, más encoder de visión |
| Parametros totales | 27B (dense, según model card); el archivo safetensors del repo muestra 1 863 907 840, probablemente del proyector de visión |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantizacion | Q8_K_P, Q6_K_P, Q5_K_P, Q4_K_P, IQ4_XS, Q3_K_P, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M, más proyector de visión en BF16 y sidecar FastMTP |
| Idiomas soportados | Inglés, chino y multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (texto y proyector); safetensors para el proyector |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida que combina capas de atención tradicional con capas Gated DeltaNet, un mecanismo de atención lineal recurrente que reduce el coste computacional en contextos largos. En concreto, 48 de las 64 capas del transformer emplean Gated DeltaNet y las 16 restantes usan atención con gates. El modelo tiene un tamaño oculto de 5120, un FFN de 17408 y un vocabulario rellenado de 248 320 tokens. Incluye de forma nativa un head MTP (Multi-Token Prediction) para decodificación especulativa, que el sidecar FastMTP de HauhauCS optimiza para lograr hasta 3,02 veces más throughput en documentos y 1,93 veces en razonamiento frente a la versión sin MTP.

El proceso de "descensura" aplicado por HauhauCS no modifica los datos de entrenamiento ni las capacidades del modelo. Se trata de una edición de pesos (similar a la abliteration) que elimina las direcciones de rechazo en el espacio de activaciones, manteniendo intactas las habilidades de texto, razonamiento, agente, imagen y vídeo. No se han publicado detalles sobre el dataset de entrenamiento original ni sobre el procedimiento exacto de edición de pesos, por lo que estos datos no están disponibles. La variante Aggressive prioriza respuestas directas sobre la seguridad, lo que la diferencia de otras versiones "balanced" del mismo autor.

## Capacidades

- Generación de texto y razonamiento complejo en inglés, chino y otros idiomas.
- Comprensión de imágenes y vídeo a través del proyector de visión BF16 (descarga separada).
- Control del modo de pensamiento (thinking mode) para tareas de razonamiento profundo.
- Tool calling y function calling para integración con APIs y agentes.
- Soporte para agentes multi-paso con planificación y ejecución de acciones.
- Decodificación especulativa nativa mediante MTP, acelerada por el sidecar FastMTP.
- Contexto largo de 262 144 tokens, apto para documentos extensos y conversaciones multi-turno.
- Respuestas sin censura: no muestra rechazos ante prompts controvertidos o explícitos.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativa, diálogos o guiones con temáticas adultas o controvertidas sin filtros, ideal para escritores que necesitan explorar ideas sin limitaciones impuestas por moderadores.
- Análisis de documentos extensos con visión: gracias a su contexto de 262 144 tokens y al proyector de visión, permite procesar informes largos con gráficos e imágenes, extrayendo información de forma directa y sin preámbulos.
- Desarrollo de agentes autónomos para investigación: su capacidad de tool calling y razonamiento multi-paso, combinada con la ausencia de rechazos, facilita la construcción de agentes que navegan por la web o interactúan con APIs sin interrupciones por políticas de contenido.
- Asistencia en ciberseguridad ofensiva: el modelo puede generar scripts de prueba o análisis de vulnerabilidades sin negarse a tratar temas sensibles, útil para profesionales que necesitan respuestas técnicas directas en entornos controlados.
- Traducción y localización de contenido técnico: su multilingüismo y su estilo directo permiten traducir documentación técnica o legal manteniendo precisión y sin rodeos.
- Simulación de conversaciones difíciles: en entornos de formación o investigación en psicología, el modelo puede actuar como interlocutor sin censura para practicar técnicas de negociación o manejo de conflictos.
- Generación de código con explicaciones sin restricciones: para desarrolladores que trabajan en proyectos de software libre, el modelo ofrece soluciones de programación sin auto-censura sobre temas como ofuscación o ingeniería inversa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas. Los únicos datos de rendimiento disponibles son los relativos a la aceleración FastMTP: hasta 3,02 veces más throughput en documentos y 1,93 veces más en razonamiento frente a la versión sin MTP, y hasta un 35,2 % más de throughput en documentos y 21,1 % en razonamiento que el MTP embebido estándar.

## Requisitos de hardware

- Para la cuantización Q8_K_P (31,46 GB) se recomienda una GPU con al menos 40 GB de VRAM, como A100 40 GB o RTX A6000.
- La cuantización Q4_K_P (17,92 GB) cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen para el contexto.
- Las cuantizaciones Q3_K_P (13,44 GB) e IQ3_XS (12,18 GB) pueden ejecutarse en GPUs con 16 GB de VRAM, como RTX 4080 o RTX 3080 Ti.
- Las cuantizaciones Q2_K_P (10,68 GB) e IQ2_M (10,32 GB) son adecuadas para GPUs con 12 GB de VRAM, aunque con pérdida de calidad notable.
- El proyector de visión BF16 (931 MB) y el sidecar FastMTP (903 MB) se cargan junto al modelo principal y requieren VRAM adicional.
- Para contexto largo (262 144 tokens), se necesita VRAM adicional para el KV cache; se recomienda al menos 48 GB para las cuantizaciones más altas.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (según el repositorio de GitHub) y cualquier runtime compatible con GGUF. vLLM puede funcionar si se convierten los pesos a safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP (este) | 27B | 262 144 | Q8_K_P a IQ2_M + FastMTP | Apache-2.0 | Edición de pesos agresiva, MTP nativo |
| 0xKitkat/Qwen3.8-27B-Uncensored-Aggressive | 27B | 262 144 | No especificado | Apache-2.0 | Variante similar sin FastMTP |
| Noillum123/Qwen3.8-27B-Uncensored-FP8 | 27B | 262 144 | FP8 | Apache-2.0 | Abliterated y cuantizado en bloque FP8 |
| Qwen/Qwen3.8-27B (original) | 27B | 262 144 | Safetensors | Apache-2.0 | Modelo base con moderación estándar |

La comparativa se basa en características generales; no se dispone de datos de rendimiento comparativos entre estas versiones.

## Limitaciones y advertencias

- El modelo no tiene filtros de contenido: puede generar texto ofensivo, ilegal o peligroso. El uso en producción debe considerar políticas de moderación externas.
- La edición de pesos puede degradar ligeramente la calidad en tareas de razonamiento complejo frente al modelo original, aunque no se han publicado mediciones.
- Riesgo de alucinaciones, especialmente en contextos largos o con información ambigua, como en cualquier modelo de 27B.
- El soporte de idiomas distintos de inglés y chino puede ser inconsistente en tareas muy técnicas.
- Las cuantizaciones K_P son personalizadas de HauhauCS; pueden mostrar un interrogante en LM Studio, aunque funcionan correctamente.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal del contenido generado recae en el usuario.
- El sidecar FastMTP solo funciona con runtimes que soporten el formato GGUF estándar; no hay garantía de compatibilidad con todos los frameworks.

## Enlaces

- [Repositorio de Hugging Face (IMUGLYHUH)](https://huggingface.co/IMUGLYHUH/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF)
- [Repositorio original de HauhauCS](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/tree/main)
- [Repositorio de GitHub con instrucciones y Ollama](https://github.com/Wassimyounes01/qwen38-uncensored)
- [Variante de 0xKitkat](https://huggingface.co/0xKitkat/Qwen3.8-27B-Uncensored-Aggressive)
- [Versión FP8 de Noillum123 en Kaggle](https://www.kaggle.com/models/noillum123/qwen3-8-27b-uncensored-fp8)
- [Entrada en AIAny](https://aiany.app/item/qwen3-8-27b-uncensored-gguf)
