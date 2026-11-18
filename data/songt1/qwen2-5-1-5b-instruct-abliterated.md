# SonGT1/Qwen2.5-1.5B-Instruct-abliterated

## Resumen
SonGT1/Qwen2.5-1.5B-Instruct-abliterated es una variante "abliterated" (sin guardarraíles de seguridad) del modelo Qwen2.5-1.5B-Instruct de Alibaba Cloud. El autor, SonGT1, ha aplicado la técnica de abliteration mediante la herramienta Heretic para eliminar la dirección de rechazo en el espacio de activaciones del transformer, reduciendo drásticamente la tasa de rechazos de peticiones. El modelo base es un transformer decoder-only de 1.543.714.304 parámetros (1,5B), con contexto de 32.768 tokens y entrenado originalmente para instrucciones en chino e inglés.

El modelo resuelve el problema de los rechazos no deseados en aplicaciones donde el filtrado de seguridad del modelo base interfiere con casos de uso legítimos (investigación sobre sesgos, generación creativa sin restricciones, análisis de contenido sensible). La relevancia actual radica en que ofrece una alternativa de pequeño tamaño, licencia Apache 2.0 y compatible con endpoints, adecuada para despliegue en hardware consumer. Sin embargo, la eliminación de guardarraíles conlleva riesgos legales y éticos que el autor declara explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | GGUF (recomendado Q5_K_M o superior), safetensors en FP16/BF16 |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Fue entrenado por Alibaba con datos multilingües (predominantemente chino e inglés) y ajustado con instrucciones mediante SFT y optimización preferencial (posiblemente DPO/RLHF). La variante abliterated no ha sido reentrenada: se ha modificado directamente la matriz de pesos del modelo base para eliminar la dirección de rechazo, técnica conocida como abliteration. Según la model card, la tasa de rechazo cae de 99/100 en el modelo base a 8/100 en la variante, con una divergencia KL de 0,0759 respecto al original, lo que indica una alteración moderada de la distribución de salida. La herramienta utilizada es Heretic (p-e-w/heretic).

## Capacidades
- Generación de texto conversacional multi-turno en chino e inglés.
- Razonamiento básico y respuesta a instrucciones (heredado de Qwen2.5-1.5B-Instruct).
- Generación de código y matemáticas a nivel de modelo pequeño (sin garantías de alta precisión).
- Soporte de tool calling / function calling (capacidad presente en el modelo base Qwen2.5, aunque no verificada en la model card de esta variante).
- Capacidad de agentes y razonamiento multi-paso limitada por el tamaño (1,5B).
- Multilingüe limitado a zh y en (no se declaran otros idiomas).
- Modo "uncensored": respuestas sin filtrado de seguridad, incluyendo contenido potencialmente sensible.
- No se declaran capacidades de visión, audio ni modo thinking explícito.

## Casos de uso
- Investigación sobre sesgos y alineación: el modelo permite estudiar cómo un modelo sin guardarraíles responde a prompts sensibles, comparando con el base para analizar la dirección de rechazo y sus efectos.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas controvertidos sin rechazos automáticos, con contexto de 32K tokens para tramas largas.
- Análisis de contenido sensible en entornos controlados: clasificación o resumen de textos que el modelo base rechazaría, útil en moderación de contenido o investigación en ciencias sociales.
- Prototipado rápido en hardware consumer: al ser 1,5B y con GGUF, puede ejecutarse en GPU de gama media (8-12 GB VRAM) para experimentos de generación de texto en local.
- Evaluación de robustez de sistemas: probar cómo pipelines de producción manejan salidas no filtradas y diseñar capas de seguridad externas.
- Educación y divulgación: demostraciones sobre el funcionamiento de la abliteration y sus límites, comparando tasas de rechazo y divergencia KL.
- Generación de código en entornos de confianza: asistencia básica de programación en inglés o chino, con la advertencia de que el tamaño limita la calidad frente a modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta tasas de rechazo (99/100 base vs 8/100 abliterated) y divergencia KL (0,0759).

## Requisitos de hardware
- VRAM estimada para inferencia: ~3 GB en FP16/BF16 (1,5B parámetros), ~1,5-2 GB en cuantización Q5_K_M, ~1 GB en Q4_K_M.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB VRAM (RTX 3050, RTX 4060, RTX 3060, GTX 1660) para cuantizaciones GGUF; A100/H100 no necesarias.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas con al menos 4 GB VRAM.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (para safetensors), TGI, endpoints compatible (según tags).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por tamaño, se espera alta velocidad en GPU consumer (decenas de tokens/s), pero sin datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SonGT1/Qwen2.5-1.5B-Instruct-abliterated | 1,5B | 32K | Apache 2.0 | Sin guardarraíles, tasa rechazo 8/100 |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | Modelo base con alineación estándar, rechazo 99/100 |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128K | Llama 3.2 Community License | Contexto mayor, pero licencia restrictiva para uso comercial |
| google/gemma-2-2b-it | 2,6B | 8K | Gemma Terms of Use | Mayor tamaño, contexto menor, licencia con restricciones |

## Limitaciones y advertencias
- Sesgos conocidos: hereda los sesgos del modelo base Qwen2.5, y la eliminación de guardarraíles puede amplificar respuestas sesgadas o tóxicas.
- Riesgo de alucinación: elevado para un modelo de 1,5B, especialmente en tareas de razonamiento complejo o datos factuales.
- Limitaciones de contexto o idioma: solo chino e inglés; contexto de 32K tokens, pero la calidad decae en ventanas muy largas para este tamaño.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de guardarraíles traslada toda responsabilidad legal al usuario; el autor exige cumplimiento de leyes locales.
- Caveats para producción: no desplegar en aplicaciones orientadas al público sin capas de seguridad externas; la tasa de rechazo reducida no garantiza ausencia de contenido dañino; el modelo no ha sido evaluado con benchmarks estándar en esta variante.

## Enlaces
- Hugging Face: https://huggingface.co/SonGT1/Qwen2.5-1.5B-Instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Herramienta Heretic: https://github.com/p-e-w/heretic
