# ronghua/jev-novel-3-4b-bf16

## Resumen

JEVnovel 3 · 4B (BF16) es un modelo especializado en la evaluación de calidad de frases para la revisión de novelas generadas por IA. Lo desarrolla el usuario ronghua y se distribuye con licencia Apache-2.0. No es un modelo generativo: es un clasificador que, dada una frase en chino, produce dos señales complementarias por cada fragmento delimitado por puntuación: una "curva de apariencia" (puntuación acumulada de lo mal que está escrita la frase hasta ese fragmento) y una "densidad informativa" (de 0 a 1, si el fragmento aporta contenido). La combinación de ambas señales se traduce directamente en una acción de edición: eliminar, reescribir o dejar intacto.

El modelo parte del base Qwen3.5-4B (4.205.756.418 parámetros, backbone de texto `qwen3_5_text` con hidden 2560 y 32 capas) y se afina mediante LoRA con dos cabezas lineales adicionales, una para la curva de apariencia y otra para la densidad. Resuelve un problema muy concreto del flujo de trabajo con AIGC: detectar no solo que una frase está mal escrita, sino en qué fragmento exacto empieza el problema y si ese fragmento debe borrarse o reescribirse. Frente a la generación autorregresiva, realiza una única pasada forward, lo que reduce la latencia y el coste de inferencia.

Su relevancia actual radica en la especialización: un modelo de 4B ajustado con datos de preferencia humana y destilación de un profesor de 27B de la misma familia consigue un Macro-F1 de 0.756 en el conjunto principal de evaluación, con una correlación de 0.79 con el profesor en la curva de apariencia y de 0.92 en densidad. La versión FP8 del mismo modelo reduce el peso a unos 4.8 GB con una degradación prácticamente nula (Macro-F1 0.589 frente a 0.586 en el conjunto completo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B, backbone `qwen3_5_text`) con dos cabezas lineales de clasificación añadidas mediante LoRA |
| Parametros totales | 4.205.756.418 (4.21B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens máximo de entrada, incluido el prompt fijo |
| Tipos de cuantizacion | BF16 (esta versión); FP8 disponible en `jev-novel-3-4b-fp8` |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 (heredada del base Qwen3.5) |
| Formato de pesos | Safetensors (2 shards, ~7.8 GB en BF16), librería PyTorch |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de texto de Qwen3.5-4B (hidden 2560, 32 capas) y le añade dos cabezas lineales de 2560→1. La cabeza de curva de apariencia lee el token final de cada fragmento y produce una puntuación acumulada; la cabeza de densidad informativa promedia dentro del fragmento y devuelve un valor entre 0 y 1. El ajuste se realizó con LoRA sobre el base, sin generación autorregresiva: una sola pasada forward produce todas las puntuaciones por fragmento.

El entrenamiento se apoya en 24.000 frases con datos de preferencia humana recogidos de una comunidad de anotación. La curva de apariencia se destila de un profesor de 27B de la misma familia (`jev-novel-3-27b-bf16`), que puntúa cada prefijo del fragmento en una escala de cinco niveles (de "desastroso" a "excelente"); el estudiante aprende la forma completa de la curva, no solo la etiqueta global. La densidad informativa se etiqueta con un juez separado, StartLux-Decision-27B, que responde por fragmento si, al pulir la frase, ese fragmento debería eliminarse o conservarse y reescribirse; el diseño del prompt del juez se basó en una taxonomía humana de tics de escritura IA. La separación en dos cabezas responde a que "estar mal escrito" y "no aportar contenido" son dimensiones distintas que una sola cabeza no puede resolver bien.

## Capacidades

- Clasificación de calidad de frases en chino con una única pasada forward, sin generación de texto.
- Producción de una curva de apariencia por fragmento (delimitados por puntuación) que indica desde qué fragmento empeora la escritura.
- Puntuación de densidad informativa por fragmento (0 a 1), que distingue decoración prescindible de contenido con carga narrativa.
- Acción de edición derivada por fragmento: eliminar (mal escrito y baja densidad), reescribir (mal escrito y alta densidad) o no tocar.
- Probabilidad global `p_bad` de que la frase requiera modificación, con umbral congelado en 0.040.
- Procesamiento por lotes mediante JSONL de entrada y salida.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido; es un clasificador de una sola tarea.

## Casos de uso

- Revisión automática de manuscritos AIGC: integrado en el pipeline de postprocesado de una novela generada, el modelo marca por fragmento qué partes eliminar y cuáles reescribir, reduciendo la revisión manual a los fragmentos con acción "改".
- Control de calidad en plataformas de escritura asistida: antes de publicar un capítulo, se ejecuta el modelo por lotes sobre cada frase y se bloquean o señalan las que superan el umbral `p_bad`, con la ventaja de señalar el fragmento exacto y no solo la frase.
- Filtrado de datos de entrenamiento: para curar corpus de narrativa, el modelo permite descartar frases con alta proporción de fragmentos "删" y conservar las que solo requieren reescritura, mejorando la calidad del dataset con criterios reproducibles.
- Edición asistida en el editor: con 512 tokens de contexto y una sola pasada forward, la latencia permite ofrecer sugerencias de borrado o reescritura fragmento a fragmento mientras el autor escribe, sin coste de generación.
- Detección de "tics" de escritura IA: gracias a la taxonomía de ocho estilos usada para entrenar la cabeza de densidad, el modelo identifica muletillas y adornos típicos de la generación automática y los clasifica como eliminables.
- Evaluación comparativa de modelos generadores: como juez de calidad a nivel de fragmento, permite puntuar las salidas de distintos generadores de narrativa en chino con una métrica objetiva y reproducible (Macro-F1, correlación con el profesor de 27B).
- Despliegue en GPU de consumo: con ~9 GB de VRAM en BF16 o ~4.8 GB en FP8, cabe en tarjetas de gama media y permite procesar lotes grandes de frases en una estación de trabajo sin infraestructura dedicada.

## Benchmarks y rendimiento

Evaluación con protocolo unificado de la serie: umbral determinado solo en validación y congelado, aplicado al conjunto principal (538 frases con mayor consenso humano), métrica Macro-F1.

| Modelo | Macro-F1 principal | Recall bad | Precisión bad | Falsos positivos en frases normales | Macro-F1 completo |
|---|---:|---:|---:|---:|---:|
| `jev-novel-2-27b-bf16` (2.ª gen., 27B, referencia) | 0.7661 | 0.6162 | 0.8978 | 0.0712 | 0.5928 |
| `jev-novel-2.5-4b-bf16` (2.5.ª gen.) | 0.747 | 0.697 | 0.778 | 0.202 | 0.600 |
| **`jev-novel-3-4b-bf16` (este modelo)** | **0.756** | 0.771 | 0.752 | 0.258 | 0.589 |

Comparación BF16 frente a FP8 del mismo modelo, con el mismo umbral (0.040) sobre 4.254 frases: Macro-F1 0.589 → 0.586, desviación media por frase de 0.004 y 8 de 538 decisiones invertidas en el conjunto principal. Consistencia de las cabezas con profesor y juez en validación: correlación de 0.79 en curva de apariencia y 0.92 en densidad informativa.

## Requisitos de hardware

- VRAM estimada: ~9 GB para BF16 (pesos de ~7.8 GB más activaciones y prompt); ~4.8 GB para la versión FP8.
- GPU recomendadas: cualquier NVIDIA con soporte BF16 y al menos 9 GB de VRAM para BF16 (RTX 3090, RTX 4090, A10, L4, A100, H100); para FP8, tarjetas con ~5 GB libres.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 y en tarjetas de 12 GB o más; en 8 GB solo con la variante FP8.
- Opciones de despliegue: no es compatible con `AutoModel` ni con pipelines estándar de HuggingFace; requiere el script `infer.py` del repositorio (PyTorch 2.13.0 con CUDA 13.0, Python 3.10+, Linux). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; al ser una sola pasada forward sobre un máximo de 512 tokens, el coste por frase es bajo en comparación con un modelo generativo del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Macro-F1 principal | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| `jev-novel-3-4b-bf16` (este) | 4.21B | 512 tokens | Clasificación de calidad de frases | 0.756 | Apache-2.0 | HuggingFace |
| `jev-novel-2.5-4b-bf16` | 4B (no confirmado) | no disponible | Clasificación de calidad de frases | 0.747 | no disponible | HuggingFace |
| `jev-novel-2-27b-bf16` | 27B (no confirmado) | no disponible | Clasificación de calidad de frases | 0.7661 | no disponible | HuggingFace |
| `jev-novel-3-27b-bf16` | 27B (no confirmado) | no disponible | Profesor de apariencia | no disponible | no disponible | ModelScope |

La comparación se limita a la propia familia JEVnovel, ya que no se han identificado en la información disponible modelos de terceros con la misma tarea de clasificación por fragmento para narrativa en chino. Frente a la generación 2.5 de 4B, este modelo mejora el Macro-F1 principal (0.756 frente a 0.747) y el recall de frases malas (0.771 frente a 0.697), a costa de más falsos positivos en frases normales (0.258 frente a 0.202). Frente al 27B de segunda generación, queda ligeramente por debajo en Macro-F1 principal pero con un modelo seis veces menor.

## Limitaciones y advertencias

- Solo admite chino; no hay soporte multilingüe documentado.
- Ventana de entrada muy corta (512 tokens incluido el prompt fijo), insuficiente para párrafos largos o documentos completos; hay que fragmentar por frases.
- Es un clasificador, no un generador: no produce la reescritura, solo indica qué fragmento borrar o reescribir.
- Tasa de falsos positivos del 25,8 % en frases normales en el conjunto principal, superior a la de la generación 2.5; requiere revisión humana o un umbral ajustado al caso de uso.
- Estructura personalizada: no carga con `AutoModel`; dependencia del script `infer.py` y de versiones concretas de PyTorch y CUDA, lo que complica la integración en stacks estándar.
- Riesgo de sesgo hacia la taxonomía de "tics de escritura IA" usada para etiquetar densidad; puede penalizar estilos literarios legítimos que se parezcan a esos patrones.
- Riesgo de alucinación no aplica en sentido generativo, pero las puntuaciones pueden ser inconsistentes fuera del dominio de narrativa de ficción con el que se entrenó.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del base Qwen3.5; conviene revisar las condiciones del modelo base.
- El umbral (0.040) está congelado para el protocolo de evaluación de la serie; en producción puede requerir recalibración sobre datos propios.
- Sin datos publicados de latencia ni throughput; el rendimiento en producción debe medirse in situ.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ronghua/jev-novel-3-4b-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Profesor de 27B de la misma familia (ModelScope): https://modelscope.cn/models/alkaid55555/jev-novel-3-27b-bf16
- Informe técnico incluido en el repositorio: `JEVnovel3技术报告.md`
- Script de inferencia: `infer.py` (incluido en el repositorio)
- Sumas de verificación: `SHA256SUMS` (incluido en el repositorio)
