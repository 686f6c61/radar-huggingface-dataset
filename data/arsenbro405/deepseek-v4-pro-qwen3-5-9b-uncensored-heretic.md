# Arsenbro405/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una versión "abliterada" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de la familia Qwen3.5 con 9B parámetros (9.409.813.744 exactos según safetensors). El modelo base fue destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", concentrando la señal de entrenamiento supervisado en matemáticas y resolución de problemas STEM. Esta variante concreta, publicada por el usuario Arsenbro405, aplica la técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo original.

La relevancia de esta ficha radica en dos factores. Por un lado, documenta un caso de destilación de un modelo grande de razonamiento hacia la clase de 9B parámetros, un patrón cada vez más habitual para abaratar el despliegue. Por otro, ilustra el ecosistema de variantes "uncensored" generadas con herramientas automáticas de ablación, que reducen drásticamente las negativas del modelo (de 100/100 rechazos a 3/100 en la evaluación del autor) a costa de una divergencia KL de 0.0422 respecto al original.

El modelo conserva la arquitectura Qwen3.5, soporta seis idiomas (inglés, chino, coreano, japonés, español y ruso) y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 19.3 GB en formato safetensors, con pipeline declarado de text-generation y compatibilidad con text-generation-inference.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parámetros totales | 9.409.813.744 (9B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la model card; el repo se distribuye en safetensors (19.3 GB) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B orientado a razonamiento, destilado de DeepSeek-V4-Pro en modo "Max Effect". El entrenamiento supervisado se centró en aproximadamente 250.000 muestras de matemáticas y STEM, e incluyó etapas de SFT y RL (los tags mencionan `sft`, `rl`, `gspo` y `mtp`, aunque la model card no detalla la configuración de cada fase). A pesar de no incluir datos específicos de programación en el SFT, el autor reporta pequeñas mejoras de transferencia cruzada en código y uso de herramientas.

Sobre esta base, la variante heretic aplica Arbitrary-Rank Ablation (ARA) con los siguientes parámetros: índice de capa inicial 9, índice de capa final 24, peso de preservación de comportamiento bueno 0.8264, peso de dirección de comportamiento malo 0.0003, peso relativo de sobrecorrección 0.9645 y 12 vecinos. La ablación modifica las representaciones internas en el rango de capas 9-24 para suprimir la dirección asociada a los rechazos, manteniendo (según el autor) el resto de capacidades con una divergencia KL de 0.0422 frente al modelo original. Los tags también indican evaluación de MTP (multi-token prediction) y NVFP4, aunque no se aportan resultados numéricos de esas evaluaciones.

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición estructurada de problemas, heredado de la destilación de DeepSeek-V4-Pro.
- Razonamiento matemático y resolución de problemas STEM, el foco principal del entrenamiento (unas 250.000 muestras).
- Generación de código y transferencia cruzada a programación, pese a no recibir SFT específico de código.
- Tool calling y function calling (tags `tool-use` y `function-calling`).
- Capacidades multimodales de entrada: el tag `image-text-to-text` sugiere soporte de entrada imagen+texto, aunque la model card no lo detalla.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento explícito (tag `reasoning`), con patrones de solución paso a paso aprendidos del profesor.
- Comportamiento "decensored": reducción drástica de rechazos (3/100 frentes a 100/100 del original según la evaluación del autor).

## Casos de uso

- Tutoría de matemáticas y STEM: el modelo puede descomponer problemas de cálculo, álgebra o física en pasos intermedios verificables, aprovechando las 250.000 muestras de entrenamiento centradas en estas materias.
- Generación de soluciones paso a paso en pipelines educativos: su modo de razonamiento explícito permite registrar la cadena de resolución para revisión posterior por parte de docentes o sistemas de corrección automática.
- Asistente de investigación técnica: para explorar derivaciones, comprobar consistencia dimensional o proponer enfoques alternativos en problemas científicos, con la ventaja de un modelo de 9B desplegable en hardware modesto.
- Automatización de atención al cliente en varios idiomas: cubre inglés, chino, coreano, japonés, español y ruso, lo que permite un único modelo para mercados asiáticos y europeos.
- Integración en agentes con tool calling: el soporte de function calling permite conectarlo a APIs, calculadoras simbólicas o motores de búsqueda dentro de flujos multi-paso.
- Generación de código asistida en entornos con restricciones de censura: para equipos que necesitan que el modelo no rechace peticiones legítimas sobre seguridad ofensiva, análisis de malware o temas sensibles en investigación.
- Prototipado rápido en estaciones de trabajo con una sola GPU: con 9B parámetros y licencia Apache 2.0, es viable para experimentación interna sin costes de API.
- Evaluación de técnicas de ablación: como caso de estudio reproducible de Heretic v2.0.0.dev0 y del impacto de ARA en el comportamiento del modelo.

## Benchmarks y rendimiento

La model card solo reporta métricas de comportamiento (rechazos y divergencia KL) y no benchmarks estándar de razonamiento o código.

| Métrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (sobre 100) | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19 GB solo para pesos, más overhead de KV cache; se recomienda 24 GB o más.
- Cuantización a 8 bits: en torno a 10-11 GB de VRAM, viable en RTX 4090 (24 GB) con contexto moderado.
- Cuantización a 4 bits: aproximadamente 5-6 GB de VRAM, cabe en GPUs consumer como RTX 3060 12 GB, RTX 4070 o superiores; el contexto máximo práctico dependerá de la KV cache.
- GPUs recomendadas para producción: A100 40/80 GB, H100, L40S; para una sola GPU consumer, RTX 4090 o RTX 3090 son suficientes en cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente vLLM, llama.cpp y Ollama si se generan conversiones GGUF, aunque no se confirman en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Notas |
|---|---|---|---|---|---|
| Este modelo (heretic) | 9B | No disponible | Apache 2.0 | Razonamiento STEM destilado, sin censura | 3/100 rechazos, KL 0.0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9B | No disponible | Apache 2.0 (según base) | Razonamiento STEM destilado | Modelo original, 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4B | No disponible | No disponible | Versión reducida sin censura | Misma técnica Heretic, menor tamaño |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9B | No disponible | No disponible | Fine-tune científico | Derivado del mismo linaje según la model card |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- La ablación introduce una divergencia KL de 0.0422 respecto al modelo original; puede degradar sutilmente capacidades no evaluadas (razonamiento general, coherencia en contextos largos).
- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o inseguro sin filtros; requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos destilados de razonamiento, especialmente en problemas STEM donde una cadena de pasos plausible puede contener errores.
- No se especifica la longitud de contexto; asumir ventanas amplias sin verificación puede provocar degradación.
- El entrenamiento se centró en matemáticas y STEM; el rendimiento en tareas creativas, jurídicas o de dominio general puede ser inferior al de modelos generalistas del mismo tamaño.
- Los idiomas declarados son seis, pero no hay evaluación publicada de calidad por idioma; el español figura en la lista sin métricas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo en jurisdicciones con restricciones de contenido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria independiente de las métricas reportadas.
- El tag `image-text-to-text` sugiere multimodalidad, pero no se documenta en la model card; no asumir soporte de visión sin probarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arsenbro405/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B uncensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de ablación): https://heretic-project.org
