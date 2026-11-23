# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-dpo2

## Resumen

LFM3-VL-2B-MobileAgent-v4.3-dpo2 es un modelo vision-lenguaje de 1.918 millones de parámetros derivado de LiquidAI/LFM3-VL-2B, ajustado por el autor independiente experimentalmachines para actuar como agente de uso de teléfono Android. El modelo recibe una captura de pantalla y un objetivo en lenguaje natural, y emite una única acción en JSON (clic, scroll, entrada de texto, apertura de app, etc.) con coordenadas normalizadas en una rejilla 0-1000. Pertenece a la familia MobileAgent del autor, que documenta públicamente cada iteración, incluidos los resultados negativos.

Esta versión concreta (v4.3-dpo2) es un candidato de la ronda 5 del proyecto: parte de los pesos fusionados de v4.2 y aplica DPO a nivel de paso (β 0.1, lr 1e-5) combinado con SFT sobre el paso preferido, usando pares generados a partir de los propios errores del modelo (851 pares balanceados). La innovación metodológica es el aprendizaje por contraste entre el paso humano correcto y el paso erróneo del propio modelo en la misma pantalla.

Su relevancia es doble: por un lado, demuestra una técnica de auto-mejora con datos generados por el propio modelo; por otro, el autor lo publica explícitamente como **resultado negativo documentado**, ya que falló su puerta de validación online (AndroidWorld seed 30: 21/116 frente a 18 de v4.2, una mejora dentro del ruido estadístico, y un aumento de falsos `complete` de 25 a 28). El autor recomienda usar v4 o v4.2 en su lugar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (lfm3_vl), con torre de visión y proyector congelados en este ajuste; LoRA de lenguaje r64/α128 fusionado |
| Parametros totales | 1.918.181.888 (≈1,92 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (historial textual limitado a los últimos 8 pasos) |
| Tipos de cuantizacion | GGUF 4-bit disponible en el repo hermano (LFM3-VL-2B-MobileAgent-v4.3-dpo2-GGUF); safetensors en precisión completa en este repo |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors (transformers, custom_code); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo se construye sobre LFM3-VL-2B de Liquid AI, un transformer vision-lenguaje que procesa una captura de pantalla por paso, redimensionada a un máximo de 880 × 880 píxeles de área (unos 720 tokens de imagen). La entrada de texto combina el objetivo (`Goal:`), la lista de apps instaladas, los últimos 8 pasos en formato `n. <intent> -> <action JSON>` y la pregunta `What is the next action?`. La salida es un bloque `<think>` con la intención seguida de una única acción JSON compacta.

El ajuste de esta versión parte de los pesos fusionados de v4.2 y aplica un entrenamiento en dos componentes: DPO a nivel de paso con β 0.1 y lr 1e-5, más un término de SFT con peso 1.0 sobre el paso preferido. Los pares de preferencia se generaron decodificando de forma greedy las propias filas de entrenamiento de v4.2: donde el modelo se detenía demasiado pronto, omitía una parada o copiaba la intención anterior, se formó un par (paso humano preferido, paso propio rechazado), resultando en 851 pares balanceados (la versión P usó los 4.163 errores y colapsó tipos de acción completos). Se añadió un LoRA de lenguaje nuevo r64/α128 que se fusionó en los pesos (el adaptador queda en `lora_adapter/`); la torre de visión y el proyector permanecieron congelados. No se usaron datos de entorno, modelo profesor ni benchmarks en el entrenamiento.

## Capacidades

- Generación de acciones de agente móvil en JSON a partir de una captura de pantalla y un objetivo en inglés.
- Tipos de acción soportados: `click`, `long_press`, `input_text`, `scroll`, `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status` (complete/infeasible).
- Coordenadas normalizadas a enteros en rejilla 0-1000 sobre la captura.
- Modo de razonamiento corto (`<think>`) previo a cada acción, con decodificación a temperatura 0.
- Comprensión de imágenes de interfaz (screenshots) mediante la torre de visión.
- Seguimiento de historial de hasta 8 pasos previos en texto.
- Capacidad de responder preguntas finales (`answer`) y de declarar finalización o inviabilidad (`status`).
- No soporta tool calling genérico ni function calling fuera del esquema de acciones propio.
- Multilingüe: no disponible; solo inglés.

## Casos de uso

- Investigación en agentes GUI: servir como punto de partida reproducible para estudiar DPO a nivel de paso con datos auto-generados, dado que el autor publica código, constructores de datos y arneses de benchmark en su repositorio.
- Automatización de pruebas de interfaz Android: el modelo puede generar secuencias de acciones sobre un emulador para validar flujos de UI, siempre con supervisión y sin cuentas reales.
- Prototipado de asistentes de accesibilidad: traducir objetivos en lenguaje natural a acciones concretas sobre la pantalla para usuarios con dificultades motoras, en entornos controlados.
- Baseline académico para AndroidWorld y AndroidControl: su rendimiento documentado (0,728 de precisión de paso high-level en AndroidControl test; 21/116 en AndroidWorld seed 30) sirve como referencia para comparar nuevas técnicas.
- Estudio de calibración de parada: analizar los falsos `complete` (28 en esta versión) como caso de estudio de alineación de agentes que deben decidir cuándo terminar.
- Extracción de intenciones a partir de capturas: usar el bloque `<think>` como etiqueta de intención de bajo nivel para anotar datasets de interacción móvil.
- Docencia sobre resultados negativos: ejemplifica cómo un ajuste con ganancia offline no se traduce en ganancia online, útil en formación de investigadores.

## Benchmarks y rendimiento

Datos publicados en la model card (ronda 5, puertas fijadas el 2026-11-22 antes del entrenamiento; puerta offline superada, puerta online fallida):

| Offline (puerta) | v4.2 | v4.3-dpo2 | Umbral |
|---|---|---|---|
| Tasa de parseo | 1.000 | 1.000 | ≥ 0,99 |
| AndroidControl test, precisión de paso high-level | 0,732 | 0,728 | ≥ 0,712 |
| AndroidControl terminal `complete` accuracy | 0,738 | 0,785 | ≥ 0,70 |
| Dev `answer` / dev `complete` | 0,868 / 0,812 | 0,875 / 0,838 | ≥ 0,848 / — |

| AndroidWorld seed 30 (116 tareas, desarrollo) | v4.2 | v4.3-dpo2 | Umbral |
|---|---|---|---|
| Éxitos | 18 (réplica: 19) | 21 | ganancia neta ≥ 9 sobre v4.2 → +3, falla |
| Falsos `complete` | 25 (réplica: 22) | 28 | ≤ 15 con ≥ 16 éxitos → falla |

El autor señala que la ganancia de +3 es de nivel de ruido (McNemar pareado p = 0,55; frente a la réplica idéntica de v4.2 es +2, p = 0,69), y que la mejora offline en el último paso no se trasladó al entorno online. No se han publicado resultados en MobileWorld ni en semillas selladas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 1,92 B de parámetros, en fp16 requiere aproximadamente 3,8 GB solo para pesos, más overhead de activaciones y tokens de imagen (unos 720 por paso).
- Cuantización 4-bit GGUF disponible en repo separado, apta para GPUs de consumo con 6-8 GB de VRAM.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en RTX 3060/4060 y superiores en 4-bit, y en A100/H100 para fp16.
- Cabe en GPU de consumo: sí, especialmente en la variante GGUF 4-bit; el repo safetensors (4,1 GB) es viable en GPUs de 8 GB o más.
- Opciones de despliegue: transformers con `trust_remote_code` (custom_code), llama.cpp/Ollama vía GGUF; vLLM y TGI no confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento AndroidWorld seed 30 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.3-dpo2 | 1,92 B | no disponible (historial 8 pasos) | 21/116 (falla puerta) | LFM Open License v1.0 | Hugging Face + GGUF |
| LFM3-VL-2B-MobileAgent-v4.2 | 1,92 B | no disponible (historial 8 pasos) | 18/116 (réplica 19) | LFM Open License v1.0 | Hugging Face |
| LFM3-VL-2B (LiquidAI) | ~2 B | no disponible | no evaluado como agente | LFM Open License v1.0 | Hugging Face |
| LFM3-VL-2B-MobileAgent-v4 | 1,92 B | no disponible | recomendado por el autor como modelo principal | LFM Open License v1.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigación: no debe operar de forma desatendida en un teléfono con cuentas reales, mensajes o pagos.
- Falló su puerta online de la ronda 5; el autor recomienda usar v4 o v4.2 en producción experimental.
- No mejora a v4.2 en AndroidWorld de forma estadísticamente significativa (p = 0,55) y aumenta los falsos `complete` (28 frente a 25).
- Solo acepta objetivos en inglés; no hay soporte multilingüe.
- Una sola captura por paso y sin memoria más allá de los 8 pasos de historial textual.
- Riesgo de alucinación en la intención `<think>` y de acciones mal dirigidas; requiere validación externa.
- No evaluado en MobileWorld ni en semillas selladas.
- Licencia LFM Open License v1.0: revisar condiciones para uso comercial antes de desplegar.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-dpo2
- Modelo base (v4.2): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2
- Variante GGUF 4-bit: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-dpo2-GGUF
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentación de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Licencia: LICENSE en el repositorio de Hugging Face
