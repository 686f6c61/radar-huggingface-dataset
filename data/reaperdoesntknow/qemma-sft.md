# reaperdoesntknow/Qemma-sft

## Resumen

Qemma-sft es un modelo de lenguaje de tipo híbrido desarrollado por el usuario independiente reaperdoesntknow (Convergent Intelligence LLC: Research Division). Se construye fusionando a nivel de pesos dos modelos existentes: el cuerpo MLP de Gemma-3 (1B) y el mecanismo de atención de Qwen-3 (0.6B), proyectados y alineados a la dimensión oculta de Gemma. Sobre esa base fusionada se aplica un ajuste fino supervisado (SFT) orientado a seguir instrucciones y razonamiento paso a paso.

El modelo parte de una arquitectura transformer de aproximadamente 1B de parámetros, con 26 capas, dimensión oculta de 1152 y MLP de 6912, y utiliza el tokenizador y la plantilla de chat de Gemma-3. La relevancia de este modelo es más experimental que práctica: demuestra una técnica de fusión de pesos entre arquitecturas distintas (Gemma y Qwen) y forma parte de un marco teórico propio del autor denominado Discrepancy Calculus. No se trata de un modelo de propósito general competitivo, sino de una pieza de investigación sobre alineamiento de subespacios de pesos y ajuste fino de bajo coste.

La información pública disponible es limitada: no se detallan resultados de benchmarks, no se especifica la longitud de contexto soportada y la model card contiene afirmaciones teóricas no validadas de forma independiente. El modelo está publicado bajo licencia OSL-3.0 y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: cuerpo MLP de Gemma-3 (1B) + atención estilo Qwen-3 (0.6B) reordenada a 4×256 cabezas de Gemma |
| Parametros totales | Aproximadamente 1B (derivado de Gemma-3 1B; no confirmado explícitamente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados presumiblemente en bfloat16; no se documentan GGUF ni otras) |
| Idiomas soportados | Inglés (en) |
| Licencia | OSL-3.0 |
| Formato de pesos | Safetensors (repo de 28,1 GB; compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura combina el backbone de Gemma-3 de 1B —26 capas, hidden size 1152, MLP de 6912— con un mecanismo de atención de estilo Qwen-3 reagrupado a las 4×256 cabezas de Gemma. La fusión se realiza a nivel de pesos, sin adaptadores, mediante proyección y alineación a la dimensión oculta de Gemma. Se conserva el tokenizador y la plantilla de chat de Gemma-3 (chat_template.jinja). El resultado es un transformer denso de aproximadamente 1B de parámetros, no un modelo MoE ni SSM.

El entrenamiento se organiza en cuatro fases documentadas: unos 512 pasos de warm-start con datos estilo Alpaca, 256 pasos adicionales de preentrenamiento sobre O1-OPEN/OpenO1-SFT, 128 pasos de SFT con Jackrong/gpt-oss-120b-reasoning-STEM-5K y 256 pasos de SFT con O1-OPEN/OpenO1-SFT. Los datasets declarados son O1-OPEN/OpenO1-SFT, yahma/alpaca-cleaned y Jackrong/gpt-oss-120b-reasoning-STEM-5K. Se usaron TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0+cpu, Datasets 4.4.1 y Tokenizers 0.22.1. No se documenta RLHF ni DPO, solo SFT. El autor enmarca el trabajo en el marco teórico Discrepancy Calculus (DISC), con conceptos como operador de discrepancia, conjuntos de salto y ghost imprinting, sin validación externa publicada.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Gemma-3.
- Seguimiento de instrucciones y razonamiento paso a paso, fruto del SFT sobre datos de razonamiento (OpenO1-SFT y STEM-5K).
- Resolución de problemas de tipo STEM y análisis básico, según los datasets de entrenamiento.
- Ayuda con código y tareas de asistencia general, según la model card ("code/help, analysis").
- Capacidad de servir como base para SFT/RLHF posteriores.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés declarado; no se documentan otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre fusión de pesos entre arquitecturas: Qemma-sft sirve como caso práctico para estudiar cómo se alinean subespacios de pesos de Gemma y Qwen y qué efectos tiene sobre el comportamiento del modelo fusionado.
- Experimentos de ajuste fino de bajo coste: al ser un modelo de ~1B, permite iterar SFT con recursos limitados (incluso CPU, según las versiones de PyTorch documentadas) para validar pipelines de TRL antes de escalar.
- Generación de texto en inglés para prototipos: útil para pruebas de concepto de chatbots o asistentes conversacionales donde el coste computacional es prioritario sobre la calidad final.
- Razonamiento paso a paso en dominios STEM: el SFT con datos de razonamiento permite usarlo como banco de pruebas para evaluar técnicas de elicitación de cadenas de razonamiento en modelos pequeños.
- Base para destilación o RLHF posterior: su tamaño reducido lo hace adecuado como estudiante en pipelines de destilación desde modelos mayores.
- Evaluación de marcos teóricos: permite reproducir y contrastar empíricamente las afirmaciones del autor sobre el marco DISC (operador de discrepancia, conjuntos de salto, ghost imprinting).
- Análisis y asistencia textual básica en inglés: resúmenes, explicaciones y respuestas a preguntas simples dentro de las limitaciones de un modelo de ~1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-2,5 GB en bfloat16 para un modelo de ~1B (estimación derivada del tamaño de parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16; A100, H100 o RTX 4090 son sobredimensionadas para este tamaño y solo tendrían sentido para entrenamiento o evaluación por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660 (6 GB), RTX 3060 (12 GB), RTX 4060 (8 GB) y superiores, así como en Apple Silicon con memoria unificada.
- Opciones de despliegue: transformers (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados explícitamente. El tag "text-generation-inference" y "endpoints_compatible" sugiere compatibilidad con TGI y endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qemma-sft | ~1B | No disponible | OSL-3.0 | Hugging Face | Fusión Gemma-3 + Qwen-3 con SFT |
| Qwen/Qwen3-0.6B | 0,6B | No disponible en la informacion | Apache 2.0 (modelo base) | Hugging Face | Modelo base de la parte de atención |
| google/gemma-3-1b-it | 1B | No disponible en la informacion | Gemma Terms of Use | Hugging Face | Modelo base del cuerpo MLP |
| Modelos de ~1B comparables (p. ej. Llama 3.2 1B) | 1B | No disponible en la informacion | Llama Community License | Hugging Face | Alternativa de tamaño similar; sin datos de rendimiento comparativo disponibles |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: el propio autor advierte que el modelo puede alucinar; no debe usarse para decisiones críticas de seguridad, médicas, legales o financieras.
- Sesgos conocidos: no documentados explícitamente; los datasets de entrenamiento (Alpaca, OpenO1-SFT, STEM-5K) pueden introducir sesgos propios de su composición.
- Limitaciones de idioma: solo se declara inglés; no hay evidencia de capacidades multilingües.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia OSL-3.0: es una licencia de código abierto con cláusulas específicas; conviene revisar sus términos antes de uso comercial, especialmente en lo relativo a patentes y obligaciones de divulgación.
- Herencia de licencias de los modelos base: al derivar de Gemma-3 y Qwen-3, pueden aplicar restricciones adicionales de sus respectivas licencias (Gemma Terms of Use y Apache 2.0), que deben verificarse.
- Naturaleza experimental: la fusión de pesos entre arquitecturas distintas y el marco teórico DISC no cuentan con validación independiente publicada; el rendimiento real puede diferir de las expectativas.
- Sin benchmarks públicos: no hay evidencia cuantitativa de calidad frente a alternativas.
- Tamaño del repo (28,1 GB) desproporcionado para un modelo de ~1B: puede indicar pesos duplicados o artefactos de entrenamiento; conviene verificar antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-sft
- Modelo base Gemma-3 1B: https://huggingface.co/google/gemma-3-1b-it
- Modelo base Qwen3 0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset O1-OPEN/OpenO1-SFT: https://huggingface.co/datasets/O1-OPEN/OpenO1-SFT
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset Jackrong/gpt-oss-120b-reasoning-STEM-5K: https://huggingface.co/datasets/Jackrong/gpt-oss-120b-reasoning-STEM-5K
- Repositorio TRL: https://github.com/huggingface/trl
- Perfil del autor (Convergent Intelligence LLC: Research Division): https://huggingface.co/reaperdoesntknow
- Discrepancy Calculus: Foundations and Core Theory (DOI: 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Structure Over Scale (DOI: 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Three Teachers to Dual Cognition (DOI: 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
