# prithivMLmods/Arete-27B-GGUF

## Resumen

Arete-27B-GGUF es la versión cuantizada en formato GGUF de Arete-27B, un ajuste fino supervisado (SFT) desarrollado por Nous Research sobre una base Qwen3.8-27B. El objetivo declarado del modelo es modificar el comportamiento del modelo base en temas políticamente sensibles, donde, según el autor, la base original producía rechazos, evasivas y respuestas alineadas con el marco ideológico del Partido Comunista Chino. Nous Research describe el entrenamiento como un refuerzo de "valores occidentales" y lo presenta como una forma de ofrecer al usuario la posibilidad de elegir qué valores incorpora el modelo.

El modelo conserva la arquitectura multimodal del base (pipeline image-text-to-text, con codificador de visión congelado durante el entrenamiento) y un total de 26.895.998.464 parámetros. El ajuste se realizó sobre aproximadamente 20.000 prompts generados, en dos épocas (1.202 pasos, unos 52,8M de tokens con contexto de 64k), sin RL ni optimización de preferencias. Los pesos se publican bajo licencia Apache 2.0.

Esta ficha cubre los ficheros GGUF publicados por prithivMLmods, que permiten ejecutar el modelo en llama.cpp y entornos compatibles con cuantizaciones de 3 a 8 bits, además de los ficheros de proyección multimodal necesarios para el procesamiento de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.8-27B, con codificador de visión congelado durante el SFT) |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64k tokens (contexto usado en el entrenamiento) |
| Tipos de cuantizacion | Q3_K_L, Q4_K_M, Q5_K_M, Q6_K, Q8_0; proyección multimodal en mmproj-bf16 y mmproj-q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados para visión) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 27B parámetros construido sobre Qwen3.8-27B, con capacidad multimodal (image-text-to-text). El ajuste fino supervisado se aplicó a todos los pesos del modelo de lenguaje, manteniendo congelado el codificador de visión. No se empleó RL ni optimización de preferencias (DPO u otras), por lo que el cambio de comportamiento proviene exclusivamente del SFT.

El conjunto de entrenamiento se compone de unos 20.000 prompts generados distribuidos en siete categorías: libertad de expresión, ideología estatal, Estado frente a mercado libre, educación, privacidad de datos y vigilancia, democracia y política medioambiental. El modelo profesor utilizado fue Inkling, un modelo abierto elegido explícitamente para evitar problemas de términos de uso asociados a la destilación de modelos cerrados. El entrenamiento se extendió durante dos épocas (1.202 pasos, aproximadamente 52,8M de tokens con contexto de 64k). El dataset de entrenamiento se anuncia en el blog de Nous Research; el dataset enlazado en la model card (NousResearch/arete-data-pairs) corresponde únicamente a la evaluación retenida. No se incorpora decodificación especulativa MTP.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento de imágenes junto con texto (image-text-to-text), gracias a los ficheros mmproj publicados.
- Razonamiento general y respuesta a preguntas, con capacidad declarada de mantener el rendimiento general respecto al base.
- Comportamiento reforzado en temas políticamente sensibles: menor tasa de propaganda y mayor puntuación de factualidad en la evaluación propia de Nous.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Análisis de contenido político y factualidad: el modelo puede emplearse para generar respuestas sobre temas de libertad de expresión, democracia o política medioambiental con menor tasa de propaganda medida (0,9% frente al 22% del base en Propaganda_Eval), útil en herramientas de verificación o análisis comparativo de sesgos.
- Investigación sobre alineamiento de valores: permite estudiar cómo un SFT dirigido modifica el comportamiento en temas sensibles manteniendo el rendimiento general, con métricas internas reportadas (Hermes Bench 65,77% frente a 65,60% del base).
- Procesamiento de documentos con imágenes: al conservar la capacidad multimodal, puede describir o razonar sobre capturas, gráficos o material escaneado junto con texto, usando los ficheros mmproj en llama.cpp.
- Despliegue local en entornos con recursos limitados: las cuantizaciones Q3_K_L (14,3 GB) y Q4_K_M (16,5 GB) permiten ejecución en estaciones de trabajo con GPU de consumo, sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales en inglés: el modelo mantiene el formato conversacional del base y puede integrarse en pipelines de generación de texto con llama.cpp o text-generation-inference.
- Evaluación comparativa de modelos post-entrenados: sirve como referencia para medir el efecto de intervenciones de alineamiento sobre las mismas preguntas de evaluación (803 prompts de Propaganda_Eval).

## Benchmarks y rendimiento

| Benchmark | Arete-27B | Base Qwen3.8-27B | Profesor Inkling |
|---|---|---|---|
| Propaganda_Eval, fact score (sobre 5) | 2,98 | 2,32 | 3,96 |
| Propaganda_Eval, respuestas con propaganda | 0,9% | 22% | 0,3% |
| Libertad de expresión, fact score (sobre 5) | 2,44 | 0,89 | no disponible |
| Libertad de expresión, respuestas con propaganda | 1% | 60% | no disponible |
| Hermes Bench (interno) | 65,77% | 65,60% | no disponible |
| Terminal-Bench-2.1 | 67% | 70% | no disponible |

Los resultados proceden de la evaluación propia de Nous Research, con un juez Grok 4.7, y la model card advierte que los ajustes de evaluación no son idénticos entre los modelos comparados. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q3_K_L unos 14,3 GB de pesos; Q4_K_M unos 16,5 GB; Q5_K_M unos 19,2 GB; Q6_K unos 22,1 GB; Q8_0 unos 28,6 GB. Añadir entre 0,6 y 0,9 GB si se usa el proyector multimodal.
- GPU recomendadas: para Q4_K_M y Q5_K_M, GPU de consumo de gama alta con 24 GB (RTX 3090, RTX 4090) o superiores; para Q8_0, A100 40 GB, H100 o RTX 6000 Ada.
- Cabe en GPU de consumo: sí, en Q3_K_L y Q4_K_M con 16-24 GB de VRAM; Q5_K_M y Q6_K requieren 24 GB; Q8_0 requiere GPU profesional.
- Opciones de despliegue: llama.cpp (soporte nativo del formato GGUF), Ollama y otros runners compatibles con GGUF; el repositorio incluye la etiqueta text-generation-inference, aunque la información disponible no detalla configuración específica para vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Arete-27B-GGUF (esta ficha) | 27B | 64k | Apache 2.0 | en | SFT sobre Qwen3.8-27B orientado a valores occidentales; multimodal |
| NousResearch/Arete-27B | 27B | 64k | Apache 2.0 | en | Pesos originales en safetensors del mismo modelo |
| VIGOR-27B-GGUF (prithivMLmods) | 27B | no disponible | no disponible | no disponible | Clasificador multimodal de seguridad visual basado en Qwen3.8-27B |
| Qwen3.8-27B (base) | 27B | 64k | no disponible en la información | no disponible | Modelo base sin el ajuste de valores |

## Limitaciones y advertencias

- El ajuste introduce una orientación de valores explícita ("valores occidentales"), lo que puede producir respuestas sesgadas en la dirección opuesta al base en temas políticos; no es un modelo neutral.
- Riesgo de alucinación presente, como en cualquier LLM; la evaluación de factualidad propia reporta 2,98 sobre 5, lejos del profesor Inkling (3,96).
- Soporte únicamente en inglés según la model card; no se garantiza calidad en otros idiomas.
- Los benchmarks son evaluaciones propias de Nous Research con un juez automático (Grok 4.7) y ajustes no idénticos entre modelos, por lo que la comparación debe tomarse con cautela.
- La licencia Apache 2.0 permite uso comercial, pero el modelo hereda las limitaciones y posibles sesgos del base Qwen3.8-27B.
- El repositorio GGUF tiene 0 descargas y 1 like en el momento de la consulta; es una cuantización de terceros, no oficial de Nous Research.
- No se documenta soporte de tool calling ni de agentes; verificar antes de usarlo en pipelines que dependan de estas capacidades.
- El tamaño del repositorio (102,4 GB) incluye todas las cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Arete-27B-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Dataset de evaluación: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Noticia sobre el lanzamiento: https://aiunderstanding.org/news/nous-research-releases-arete-27b-to-reduce-chinese-ai-propaganda
- Modelo relacionado VIGOR-27B-GGUF: https://huggingface.co/prithivMLmods/VIGOR-27B-GGUF
