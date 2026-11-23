# experimentalmachines/LFM3-VL-2B-MobileAgent-v4

## Resumen

LFM3-VL-2B-MobileAgent-v4 es un ajuste fino del modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por experimentalmachines, orientado a la operacion autonoma de telefonos Android a partir de una captura de pantalla por paso. El modelo recibe el objetivo del usuario, la lista de aplicaciones instaladas, un historial textual de los ultimos ocho pasos y la captura actual, y devuelve un unico paso de actuacion en formato JSON compacto con coordenadas normalizadas en una rejilla de 0 a 1000.

Se trata de un modelo de aproximadamente 1.918 millones de parametros (1,92 B) construido sobre una arquitectura LFM3-VL con capacidades de vision y lenguaje, adaptado mediante LoRA SFT de rango 64 y alpha 128 sobre el modelo de lenguaje, con la torre de vision congelada. El ajuste se realizo en 1.250 pasos sobre un subconjunto de 92.229 filas del dataset MobileAgent-SFT-v4, equivalente a 0,43 epocas, en una unica GPU A100.

Su relevancia radica en que aborda un problema practico poco cubierto por los datasets publicos: ensenar a un agente a responder preguntas en el formato de agente en lugar de limitarse a navegar hasta la respuesta. Segun la model card, la version v4 corrige el comportamiento de v1-v3, que navegaban hasta la respuesta y luego declaraban `complete`, y reduce las alucinaciones de nombres de aplicaciones. El modelo se distribuye tambien en formato GGUF de 4 bits (1,30 GB) para su uso en telefono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL (transformer multimodal vision-lenguaje); adaptacion LoRA sobre el modelo de lenguaje |
| Parametros totales | 1.918.181.888 (1,92 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; historial limitado a los ultimos 8 pasos en texto |
| Tipos de cuantizacion | 4 bits GGUF (version -GGUF de 1,30 GB con proyector de vision); pesos originales en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (LFM Open License v1.0, heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors (transformers); GGUF de 4 bits disponible en repo separado; adaptador LoRA en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B en el commit `23387be`, un modelo multimodal de tipo vision-lenguaje de la familia LFM3. El ajuste se realizo mediante LoRA SFT con rango 64 y alpha 128 aplicado exclusivamente al modelo de lenguaje, manteniendo congelada la torre de vision. Posteriormente los pesos del adaptador se fusionaron en el modelo final, aunque el adaptador queda disponible en el directorio `lora_adapter/`. El entrenamiento consistio en 1.250 pasos con batches de 32 filas, tasa de aprendizaje 2e-4 y una unica GPU A100, lo que supone 0,43 epocas sobre las 92.229 filas del dataset MobileAgent-SFT-v4.

El dataset de entrenamiento combina las filas de la version v3 adaptadas al prompt de v4, 2.386 episodios de tipo "navegar y luego responder" generados por Qwen3-VL-8B-Instruct (con confirmacion mediante una segunda llamada y una comprobacion estricta de tipos) y respuestas de ScreenQA mas cortas. Segun el autor, no se utilizaron tareas, variantes, trayectorias ni checkers de AndroidWorld durante el entrenamiento. La entrada visual se redimensiona a un maximo de 880 x 880 pixeles de area, lo que equivale aproximadamente a 720 tokens de imagen por paso.

## Capacidades

- Generacion de acciones de agente GUI sobre Android: click, pulsacion larga, entrada de texto, scroll, abrir aplicacion, navegar atras, ir a inicio, enter de teclado, esperar, responder y declarar estado.
- Razonamiento breve previo a la accion mediante un bloque `<think>...</think>` con la intencion en texto corto, seguido de un unico JSON de accion.
- Respuesta a preguntas del usuario en el formato de agente (`answer`), con respuesta lo mas corta posible y en el formato solicitado.
- Declaracion de finalizacion (`status` con `complete` o `infeasible`) para objetivos que no piden informacion.
- Uso de la lista de aplicaciones instaladas para restringir `open_app` a nombres validos.
- Comprension de capturas de pantalla de Android con coordenadas normalizadas en rejilla 0-1000.
- Capacidades heredadas del modelo base LFM3-VL-2B en tareas de vision-lenguaje (evaluadas en MMStar y MMLU).
- Capacidad multilingue limitada al ingles.
- No dispone de tool calling generico ni de function calling fuera del esquema de acciones propio del agente.

## Casos de uso

- Automatizacion de tareas repetitivas en Android: el modelo puede ejecutar secuencias de pasos sobre la interfaz (abrir una app, rellenar un campo, navegar) recibiendo una captura por paso y manteniendo un historial de los ultimos ocho pasos, lo que permite encadenar acciones multi-paso.
- Responder preguntas sobre el estado del telefono: gracias al entrenamiento con episodios "navegar y luego responder", el modelo puede navegar hasta una pantalla concreta y emitir una respuesta corta en el formato pedido, en lugar de declarar la tarea completada sin informacion.
- Pruebas de aceptacion de interfaces moviles: el modelo puede utilizarse como agente de referencia en pipelines de evaluacion de apps Android, ejecutando objetivos predefinidos sobre builds de prueba y registrando las acciones emitidas.
- Investigacion en agentes GUI: sirve como linea base reproducible para comparar estrategias de prompting, historiales de pasos y politicas de actuacion en entornos Android, dado que el autor publica harness y resultados en su repositorio.
- Despliegue en dispositivo: la version GGUF de 4 bits (1,30 GB con proyector de vision) permite ejecutar el modelo en telefono con llama.cpp, con un coste de aproximadamente 39 segundos por paso en un Snapdragon 8 Elite Extreme Gen 6, adecuado para demos y pruebas offline.
- Evaluacion de modelos multimodales en tareas de grounding visual: las coordenadas normalizadas y el formato JSON compacto permiten medir la precision de localizacion de elementos de interfaz en capturas reales.
- Generacion de datos sinteticos de trayectorias: el modelo puede proponer pasos de agente que luego se filtran y validan para construir datasets de entrenamiento de agentes moviles, siguiendo el patron empleado por el propio autor con Qwen3-VL-8B-Instruct.

## Benchmarks y rendimiento

Resultados publicados en la model card. El harness es identico para todos los modelos: una captura por paso, GGUF de 4 bits via llama.cpp, mismo presupuesto de pasos, temperatura 0; las excepciones cuentan como fallo.

| Benchmark | v4 | GUI-Owl-1.5-2B | MAI-UI-2B |
|---|---|---|---|
| AndroidWorld seeds reservadas 7 / 1234 / 2026 (348 tareas) | 54 (18 / 17 / 19) | 47 | no ejecutado |
| AndroidWorld seed 30 (116 tareas, desarrollo) | 18 | 23 | 32 |
| MobileWorld (105 tareas GUI en ingles) | 6 | 22 | 11 |
| CPU de telefono (Snapdragon 8 Elite Extreme Gen 6), segundos por paso | ~39 | ~1.100 | ~1.063 |
| GPU Apple M5, mediana de segundos por paso | 2,96 | 7,00 | 9,35 |

Datos adicionales de la model card:

- v4 frente a GUI-Owl en las seeds reservadas: +2,0 puntos, IC 95% [−4,5, +8,6], p = 0,60. No inferior en el margen preregistrado de −6,9 puntos; la superioridad no queda demostrada.
- La ventaja proviene de plantillas cuyo texto de objetivo no puede cambiar con la seed. En las 78 plantillas cuyo texto de objetivo si cambia, v4 y GUI-Owl estan igualados (32 frente a 33).
- MobileWorld: GUI-Owl es claramente superior (p = 3 x 10⁻⁵).
- Evaluacion offline: precision de paso en AndroidControl test high-level / low-level de 0,728 / 0,908; coincidencia estricta de respuesta en 136 preguntas reservadas de 0,868, con 0 respuestas falsas en 80 controles de objetivo de accion; MMStar / MMLU 52,9% / 50,4% (sin cambio significativo respecto al modelo base).
- Responde 6 de las 25 tareas de pregunta en la seed 30 (v1-v3: 0).

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (safetensors): no disponible en la informacion proporcionada; el repo pesa 4,1 GB, lo que da una referencia del orden de magnitud para pesos en bf16/fp16.
- Version GGUF de 4 bits: 1,30 GB incluyendo el proyector de vision, apta para dispositivos con poca memoria.
- GPU de escritorio: el autor reporta 2,96 segundos por paso (mediana) en una GPU Apple M5; no se proporcionan cifras para A100, H100 ni RTX 4090.
- CPU de telefono: aproximadamente 39 segundos por paso en un Snapdragon 8 Elite Extreme Gen 6, muy por debajo de los ~1.100 y ~1.063 segundos por paso de GUI-Owl-1.5-2B y MAI-UI-2B en el mismo hardware.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits (1,30 GB); no se especifican modelos concretos de GPU de consumo.
- Opciones de despliegue: transformers (libreria declarada, con `custom_code`), llama.cpp para la version GGUF. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: solo se publican latencias por paso (2,96 s en Apple M5, ~39 s en Snapdragon 8 Elite Extreme Gen 6); no hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AndroidWorld (seeds reservadas) | MobileWorld | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4 | 1,92 B | no disponible (historial de 8 pasos) | 54 / 348 | 6 / 105 | lfm1.0 | Hugging Face (safetensors + GGUF 4 bits) |
| GUI-Owl-1.5-2B | no disponible en la informacion | no disponible | 47 / 348 | 22 / 105 | no disponible | no disponible |
| MAI-UI-2B | no disponible en la informacion | no disponible | no ejecutado en seeds reservadas; 32 en seed 30 | 11 / 105 | no disponible | no disponible |

Notas: la comparacion con GUI-Owl-1.5-2B y MAI-UI-2B procede exclusivamente de la model card del autor. El margen de +2,0 puntos sobre GUI-Owl en las seeds reservadas no es estadisticamente significativo (p = 0,60) y la superioridad no se demuestra; en MobileWorld GUI-Owl es claramente mejor. No se dispone de datos de parametros, contexto ni licencia de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe dejarse actuar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en ingles; no se ha entrenado ni evaluado en otros idiomas.
- Una unica captura por paso y sin memoria mas alla del historial textual de ocho pasos; no hay estado visual persistente ni planificacion a largo plazo.
- Entrenado exclusivamente con demostraciones grabadas; nunca ha interactuado con un telefono real durante el entrenamiento, lo que puede provocar un comportamiento fuera de distribucion ante interfaces no vistas.
- Riesgo de alucinacion en nombres de aplicaciones y en respuestas: aunque v4 lo reduce respecto a v1-v3, persiste la posibilidad de inventar apps o contenido.
- Rendimiento limitado en MobileWorld (6 de 105) y peor que GUI-Owl en ese benchmark; la ventaja en AndroidWorld depende de plantillas cuyo objetivo no varia con la seed.
- Sin resultados significativos de mejora sobre el modelo base en MMStar y MMLU, lo que sugiere que el ajuste esta muy especializado y no mejora capacidades generales.
- Licencia LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B: es necesario revisar los terminos del archivo LICENSE antes de cualquier uso comercial, ya que la licencia se etiqueta como "other".
- Latencia alta en CPU de telefono (~39 s por paso), lo que limita su uso interactivo en dispositivo.
- No se han publicado datos de sesgos especificos; al ser un modelo derivado de un base entrenado principalmente en ingles, se esperan sesgos similares a los de la familia LFM3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Version GGUF de 4 bits: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
