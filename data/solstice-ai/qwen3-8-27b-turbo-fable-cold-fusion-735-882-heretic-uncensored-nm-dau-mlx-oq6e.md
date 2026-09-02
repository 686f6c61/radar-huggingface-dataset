# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ6e

## Resumen

Este modelo es una cuantización mixta de 6 bits (oQ6e-mtp) en formato MLX, desarrollada por Solstice-AI, del modelo base `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, un fine-tune de Qwen3.8-27B. Está optimizado específicamente para Apple Silicon (M1-M5) mediante la librería MLX y el motor Anvil, aprovechando la memoria unificada y la aceleración Metal. Su objetivo principal es ofrecer una inferencia rápida y eficiente en hardware de Apple, manteniendo un alto rendimiento en tareas de razonamiento, código y agentes.

El modelo base Qwen3.8-27B es un modelo denso de 27.781 millones de parámetros con arquitectura híbrida: atención lineal en 48 de sus 64 capas, un vision tower (aunque no se usa en esta versión de texto), y un cabezal de predicción multi-token (MTP) integrado. La variante "Cold Fusion" reduce significativamente los tokens de pensamiento en comparación con el Qwen3.8 estándar, lo que acelera la generación sin sacrificar precisión. Esta versión MLX mantiene un contexto nativo de 262.144 tokens y está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

La relevancia de este modelo radica en su enfoque en el ecosistema Apple: permite ejecutar un modelo de 27B con cuantización de 6 bits en equipos con memoria unificada de 24 GB o más, ofreciendo velocidades de generación hasta 1,72 veces superiores al baseline BF16, según los datos publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (híbrida: atención lineal en 48/64 capas, MTP) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 6-bit mixto (oQ6e-mtp); el autor también publica variantes oQ8e, oQ5e y oQ4e |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.8-27B, que emplea una arquitectura híbrida de transformer con atención lineal en 48 de sus 64 capas, lo que reduce la complejidad computacional en contextos largos. Incluye un cabezal de predicción multi-token (MTP) que actúa como modelo de draft para decodificación especulativa, acelerando la generación. La variante "Cold Fusion" se entrenó con un método propietario que reduce los tokens de pensamiento en los tres modos de operación (razonamiento, código y conversación), manteniendo o mejorando la precisión.

Los detalles exactos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El nombre del modelo incluye los términos "Uncensored" y "Heretic", lo que sugiere que el fine-tune eliminó o redujo los filtros de seguridad del modelo original, aunque no se especifica la metodología. La cuantización oQ6e-mtp aplica una precisión mixta: las matrices de atención sensibles y las proyecciones recurrentes GDN se mantienen a mayor bit-depth, mientras que las redes feed-forward se optimizan para maximizar tokens por segundo.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento y resolución de problemas con modo de pensamiento reducido (Cold Fusion), lo que acelera la inferencia.
- Generación de código en múltiples lenguajes, con soporte para agentes de codificación (agentic-coding).
- Soporte de tool calling y function calling, según los tags del modelo.
- Multi-Token Prediction (MTP) para decodificación especulativa, que mejora la velocidad de generación.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Sin filtros de seguridad aparentes (versión "Uncensored"), lo que permite generar contenido que otros modelos rechazarían.

## Casos de uso

- Asistente de programación en equipos Apple: el modelo puede integrarse en IDEs o CLIs para autocompletar código, generar funciones y refactorizar, aprovechando su soporte de tool calling y su velocidad en Apple Silicon.
- Agente autónomo de codificación: gracias a su capacidad de razonamiento multi-paso y su contexto de 262K tokens, puede gestionar repositorios completos, leer múltiples archivos y ejecutar tareas de refactorización o generación de tests.
- Chatbot de atención al cliente con contexto largo: puede mantener conversaciones extensas con historial completo, ideal para soporte técnico donde el usuario comparte logs o documentación.
- Análisis y resumen de documentos legales o técnicos: su ventana de contexto permite procesar contratos, informes o papers completos sin truncamiento, generando resúmenes o extrayendo cláusulas específicas.
- Generación de contenido creativo sin restricciones: la versión "Uncensored" permite explorar narrativas, diálogos o guiones con temas que otros modelos censurarían, útil para escritores o creadores.
- Desarrollo de prototipos de agentes conversacionales en investigación: al ser Apache 2.0 y ejecutarse localmente en Mac, es adecuado para experimentar con arquitecturas de agentes sin costes de API ni dependencia de la nube.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de benchmarks para diferentes precisiones del modelo. Se presentan a continuación los datos correspondientes a la variante oQ6e-mtp (la de este repositorio) junto con el baseline BF16:

| Precision | MMLU | MMLU_Pro | HumanEval (Python) | Velocidad relativa |
| :--- | :---: | :---: | :---: | :---: |
| BF16 (baseline) | 87,3% | 68,7% | 89,0% | 1,00x |
| oQ6e-mtp (6-bit) | 86,0% | 70,0% | 88,4% | 1,72x |

No se han publicado resultados de benchmarks adicionales (como GSM8K, ARC, etc.) en la información disponible. Los datos de velocidad relativa indican que la cuantización de 6 bits es aproximadamente un 72% más rápida que el modelo sin cuantizar, con una pérdida mínima de precisión en MMLU y HumanEval, e incluso una mejora en MMLU_Pro.

## Requisitos de hardware

- Memoria unificada: el repositorio ocupa 23,7 GB, por lo que se recomienda un Mac con al menos 24 GB de RAM unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max, M5).
- GPU: cualquier Apple Silicon con soporte Metal (M1 o posterior). La aceleración Metal es nativa a través de MLX.
- No es compatible con GPUs NVIDIA o AMD; está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: motor Anvil (binario único, con servidor OpenAI-compatible) o MLX-LM (biblioteca Python con generación y servidor).
- Latencia y throughput: no se proporcionan cifras exactas, pero la velocidad relativa de 1,72x respecto al BF16 sugiere una mejora significativa en tokens por segundo. En la práctica, un Mac con 64 GB de RAM unificada puede alcanzar decenas de tokens por segundo con este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Qwen3.8-27B (original) | 27,8B | 262K | Apache 2.0 | BF16 | Modelo base sin fine-tune, sin cuantización |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion (base) | 27,8B | 262K | Apache 2.0 | BF16/GGUF | Fine-tune con Cold Fusion, disponible en GGUF |
| Solstice-AI/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit | 27,8B | 262K | Apache 2.0 | MLX 6-bit | Otra variante MLX del mismo autor, con mejoras adicionales |

Este modelo se diferencia de las alternativas por su cuantización oQ6e-mtp específica para Apple Silicon, que combina precisión mixta con MTP para maximizar la velocidad. El modelo base GGUF de DavidAU está pensado para CPU/GPU NVIDIA, mientras que esta versión MLX es exclusiva para Mac.

## Limitaciones y advertencias

- Sesgos y contenido no filtrado: al ser una versión "Uncensored", el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es adecuado para aplicaciones donde se requiera moderación de contenido.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede inventar hechos o razonamientos incorrectos, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Limitaciones de idioma: solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Dependencia de hardware Apple: no se puede ejecutar en GPUs NVIDIA o AMD, lo que limita su uso en entornos de servidor tradicionales.
- Sin garantías de producción: el modelo tiene 0 descargas y 0 likes en HuggingFace, y la documentación es escasa. No hay evidencia de pruebas exhaustivas en entornos de producción.
- La cuantización de 6 bits puede introducir una ligera degradación en tareas de precisión numérica o matemática avanzada, aunque los benchmarks publicados muestran una pérdida mínima.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ6e
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo base en GGUF: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Anvil: https://github.com/Solstice-Labs/anvil
- MLX-LM: https://github.com/ml-explore/mlx-lm
- Sitio de Solstice-AI: https://solstice-ai.co
