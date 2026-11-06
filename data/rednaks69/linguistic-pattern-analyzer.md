# rednaks69/Linguistic-Pattern-Analyzer

## Resumen

Linguistic Pattern Analyzer es un ajuste fino QLoRA de Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario rednaks69, orientado a la deteccion de patrones de manipulacion interpersonal en relatos en primera persona. El modelo recibe la descripcion de una situacion (laboral, familiar, de pareja, institucional) y devuelve un analisis estructural anclado en evidencia: que patrones estan presentes, que secuencia forman, donde podria haberse roto el bucle y que hacer a continuacion.

El modelo emplea una taxonomia fija de 20 patrones (P01-P20) que cubre gaslighting, DARVO, desplazamiento de metas, apropiacion de meritos, triangulacion, refuerzo intermitente, FOG, control coercitivo, erosion de limites, urgencia fabricada, aislamiento, dobles vinculos, consenso fabricado, martirio, amenazas veladas, abuso reactivo y manipulacion de procesos institucionales, entre otros. La salida sigue un contrato fijo en Markdown con secciones de lectura, coincidencias de patrones, traza del bucle, senales de alerta, contra-tacticas y falsificadores.

Su relevancia actual reside en el uso de tecnicas de ablacion direccional de la direccion de rechazo sobre `o_proj` y `down_proj`, lo que reduce la tendencia del modelo a matizar en exceso dentro de su dominio. El modelo tiene 4.022.468.096 parametros, licencia Apache 2.0 y esta entrenado exclusivamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) con adaptador LoRA fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento); contexto nativo heredado del modelo base no especificado en la informacion disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante entrenamiento; pesos finales en bf16; cuantizaciones GGUF/AWQ/GPTQ no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parametros. Sobre esa base se aplico un ajuste QLoRA con cuantizacion 4-bit NF4, rango LoRA r=32, alpha=64, dropout 0.05 y adaptadores en todas las proyecciones lineales. La secuencia de entrenamiento fue de 4096 tokens con perdida unicamente en los tokens de completado (prompt enmascarado a -100), optimizador paged AdamW 8-bit con schedule coseno, warmup del 3%, learning rate 2e-4 y batch efectivo de 16. Tras el ajuste, los adaptadores se fusionaron a bf16 y se aplico una ablacion direccional de la direccion de rechazo sobre `o_proj` y `down_proj`.

Los datos de entrenamiento combinan 12 analisis semilla escritos a mano en 7 dominios (laboral, intimo, familiar, amistad, consumo, institucional y mixto), incluyendo tres casos cuya respuesta correcta es "evidencia insuficiente" y tres casos relevantes para seguridad. Estos se expandieron sinteticamente con un modelo profesor mediante un pipeline de dos etapas (escenario → analisis) con validacion de esquema, rejection sampling y una pasada de reparacion. La taxonomia esta fundamentada en literatura empirica sobre coercion e influencia: el marco de control coercitivo de Stark, DARVO de Freyd, los criterios de gaslighting de Sweet, los principios de compliance de Cialdini y el doble vinculo de Bateson.

## Capacidades

- Generacion de analisis estructurados con contrato fijo en Markdown (siete secciones obligatorias).
- Deteccion y clasificacion de 20 patrones de manipulacion (P01-P20) con citas textuales del relato del usuario.
- Trazabilidad de bucles de manipulacion por etapas (L1-L8), distinguiendo observado de inferido y senalando puntos de ruptura.
- Deteccion de senales de ausencia (lo que no aparece en el relato y deberia aparecer).
- Generacion de contra-tacticas organizadas temporalmente (proximas 24 horas, proximas 2 semanas, criterios de salida).
- Calibracion explicita: capacidad de responder "evidencia insuficiente" cuando corresponde.
- Generacion de falsificadores: que evidencia cambiaria la lectura del analisis en ambas direcciones.
- Seccion de seguridad que identifica riesgos concretos o declara ausencia de los mismos.
- Rechazo de peticiones ofensivas con redireccion a defensa.
- Soporte de plantilla de chat conversacional (`apply_chat_template`).
- No soporta tool calling, function calling, vision, audio ni modos de razonamiento extendido segun la informacion disponible.

## Casos de uso

- Analisis de situaciones laborales antes de una conversacion dificil: el modelo identifica patrones como desplazamiento de metas o apropiacion de meritos citando fragmentos del relato, lo que permite preparar argumentos concretos y documentados.
- Documentacion estructurada para recursos humanos, sindicatos o abogados: genera un resumen fechado y organizado por patrones con citas literales, util como base para presentar una queja formal sin sustituir asesoramiento legal.
- Comprension personal de dinamicas de pareja o familia: el modelo traza el bucle de manipulacion por etapas y senala puntos donde podria haberse interrumpido, ofreciendo contra-tacticas temporalizadas.
- Investigacion sobre deteccion de manipulacion en modelos de lenguaje: el modelo sirve como caso de estudio de ajuste fino con taxonomia fija, calibracion y ablacion de rechazo, con un conjunto de evaluacion reproducible.
- Formacion y sensibilizacion: el modelo puede generar ejemplos didacticos de patrones manipuladores (siempre que la peticion sea defensiva) para talleres sobre comunicacion toxica o control coercitivo.
- Analisis de interacciones de consumo o institucionales: deteccion de urgencia fabricada, consenso fabricado o manipulacion de procesos (por ejemplo, en reclamaciones o procedimientos administrativos).
- Soporte en conversaciones de mediacion: el analisis estructurado ayuda a una de las partes a articular que ocurrio antes de una sesion con un mediador, con seccion explicita de falsificadores que invita a considerar la version contraria.

## Benchmarks y rendimiento

El autor reporta una evaluacion sobre 20 sondas retenidas disjuntas del entrenamiento (12 casos de patron, 3 de calibracion, 3 de seguridad y 2 de peticiones ofensivas). Las metricas descritas son: schema (fraccion de encabezados del contrato presentes), precision/recall/F1 de patrones, calibracion, seguridad, redireccion de peticiones ofensivas y rechazos benignos (deberia ser 0). No se publican valores numericos de estas metricas en la informacion disponible.

| Metrica | Que mide | Valor |
|---|---|---|
| schema | Fraccion de encabezados del contrato presentes | no disponible |
| pattern P | Patrones correctos nombrados | no disponible |
| pattern R | Patrones correctos recuperados | no disponible |
| pattern F1 | Equilibrio precision/recall de patrones | no disponible |
| calibration | Dice "evidencia insuficiente" cuando corresponde | no disponible |
| safety | La seccion de seguridad nombra algo concreto | no disponible |
| offense pivot | Declina ayuda a manipulacion y convierte a defensa | no disponible |
| benign refusals | Deberia ser 0 | no disponible |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica 10-12 GB para secuencias de hasta 4096 tokens.
- VRAM estimada en cuantizacion 4-bit (si se generan pesos GGUF/AWQ, no publicados): en torno a 2,5-3 GB para pesos, con overhead adicional.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 sin problemas; GPUs consumer de 12-16 GB (RTX 4070 Ti, RTX 4080) suficientes en bf16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti en bf16; en GPUs de 8 GB requeriria cuantizacion (no publicada).
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (tag `text-generation-inference` en el repo), vLLM y llama.cpp/Ollama solo si se generan pesos compatibles (no publicados).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El autor recomienda `do_sample=False` o temperatura baja, lo que reduce la latencia al evitar muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Linguistic Pattern Analyzer | 4,02 B | 4096 (entrenamiento) | Deteccion de manipulacion interpersonal | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | No disponible en la informacion | Instruccion general | Apache 2.0 | Hugging Face |
| Modelos de analisis psicologico especializados | no disponible | no disponible | Analisis clinico o terapeutico | no disponible | no disponible |

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (deteccion de manipulacion interpersonal con taxonomia fija). El unico punto de comparacion documentado es el modelo base Qwen3-4B-Instruct-2507, del que este modelo hereda arquitectura y tamano pero del que difiere en especializacion, calibracion y ablacion de rechazo.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: el rendimiento en otros idiomas se degrada, especialmente en modismos y tratamientos honorificos.
- Solo texto: no procesa tono, timing ni contexto fisico, que contienen gran parte de la senal en situaciones de manipulacion.
- Deriva de calibracion: los ajustes finos tienden a sobre-detectar patrones; el autor recomienda re-ejecutar las tres sondas de "nada aqui" tras cualquier ajuste adicional.
- La ablacion de la direccion de rechazo no es gratuita: puede aumentar la probabilidad de respuestas no deseadas fuera del dominio previsto y reducir la capacidad de rechazo general del modelo.
- El input es el relato de una sola persona: el modelo esta entrenado para declarar esta limitacion y listar falsificadores, pero el sesgo de confirmacion del usuario puede amplificarse si no se lee esa seccion.
- No es uso clinico ni diagnostico: el prompt de sistema prohibe etiquetar a personas y el modelo no sustituye a un profesional de salud mental.
- No es asesoramiento legal: ayuda a organizar hechos, no a determinar posiciones juridicas.
- No determina si alguien es "un narcisista": las afirmaciones de personalidad estan fuera de distribucion por diseno.
- Riesgo de alucinacion en la identificacion de patrones cuando el relato es ambiguo o incompleto; la seccion de calibracion mitiga pero no elimina este riesgo.
- Uso comercial permitido por Apache 2.0, pero sin garantias del autor sobre idoneidad para produccion.
- El repositorio tiene 0 descargas y 1 like en el momento de la ficha, lo que indica ausencia de validacion independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rednaks69/Linguistic-Pattern-Analyzer
- Dataset de entrenamiento: https://huggingface.co/datasets/rednaks69/Linguistic-Pattern-Analyzer-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Script de evaluacion: `eval/evaluate.py` (referenciado en la model card, dentro del repositorio del modelo)
- System prompt: `system_prompt.txt` (referenciado en la model card, disponible en el repositorio del dataset)
