# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1

## Resumen

LFM3-VL-2B-MobileAgent-v4.1 es un ajuste fino de tipo LoRA SFT sobre el modelo multimodal LiquidAI/LFM3-VL-2B (1.918 millones de parametros), desarrollado por el usuario experimentalmachines. El modelo esta especializado en operar un telefono Android a partir de una captura de pantalla por paso: recibe el objetivo del usuario, la lista de aplicaciones instaladas, el historial de los ultimos ocho pasos y la screenshot actual, y devuelve una unica accion en JSON compacto. Es un agente GUI de investigacion, no un modelo de proposito general.

La version v4.1 es una continuacion de v4 centrada en corregir su principal fallo: los bucles de espera (`wait`). Para ello se reetiquetaron 4.104 objetivos de `wait` en el conjunto AndroidControl y se anadieron 5.244 filas de historial de recuperacion. El entrenamiento se realizo con LoRA de rango 64 y alpha 128 sobre el modelo de lenguaje, con la torre de vision congelada, durante 1.250 pasos en una unica A100.

El modelo es relevante como referencia tecnica de como se construye y evalua un agente movil de 2B parametros con licencia LFM Open License v1.0. Su estado es experimental y el propio autor lo declara superado por v4.2, que recupera el rendimiento online de v4. Resulta util para investigadores que trabajen en agentes GUI, evaluacion de bucles y ajuste fino multimodal de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LFM3-VL) con torre de vision y modelo de lenguaje; ajuste fino LoRA SFT fusionado |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el prompt usa historial de los ultimos 8 pasos y la imagen se redimensiona a un maximo de 880 x 880 px (unos 720 tokens de imagen) |
| Tipos de cuantizacion | 4-bit GGUF (version publicada en el repo GGUF del autor); el repo principal contiene safetensors |
| Idiomas soportados | ingles (`en`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors (repo principal, 4.1 GB), adaptador LoRA en `lora_adapter/`, GGUF 4-bit en repo separado |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B (commit `23387be`), un modelo multimodal de 2B parametros que combina una torre de vision con un modelo de lenguaje. El ajuste fino se realizo mediante LoRA SFT de rango 64 y alpha 128 aplicado unicamente al modelo de lenguaje, manteniendo la torre de vision congelada. Los pesos resultantes se fusionaron en el modelo final, y el adaptador original queda disponible en la carpeta `lora_adapter/`.

El entrenamiento consistio en 1.250 pasos con batches de 32 filas (0,43 epocas sobre 92.229 filas), tasa de aprendizaje 2e-4 y una sola GPU A100. Los datos provienen de AndroidControl, GUI-Odyssey, AMEX y ScreenQA. Respecto a v4, se introdujeron dos cambios exclusivamente en el texto de entrenamiento: el reetiquetado de 4.104 objetivos y 13.145 lineas de historial de `wait` (porque el 94% de las filas `wait` de AndroidControl repetian la intencion del paso anterior) y la adicion de 5.244 filas de historial de recuperacion con un paso extra. No se menciona RLHF ni DPO; el metodo es SFT supervisado sobre demostraciones grabadas.

## Capacidades

- Generacion de acciones GUI sobre Android a partir de una captura de pantalla por paso, en formato JSON compacto con coordenadas enteras en una rejilla 0-1000.
- Modo de razonamiento explicito: emite `<think>intent</think>` antes de la accion, con decodificacion a temperatura 0.
- Conjunto cerrado de acciones: `click`, `long_press`, `input_text`, `scroll`, `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status`.
- Respuesta a preguntas del usuario mediante la accion `answer`, con formato corto segun lo solicitado.
- Finalizacion de tareas mediante `status` con `goal_status` igual a `complete` o `infeasible`.
- Uso de historial de los ultimos 8 pasos en texto para mantener coherencia multi-paso.
- Capacidad multimodal de vision limitada a una screenshot por paso, sin memoria visual de pasos anteriores.
- Idioma de trabajo: ingles unicamente.

## Casos de uso

- Investigacion en agentes GUI moviles: sirve como linea base reproducible para estudiar bucles de espera y politicas de recuperacion, con recetas de datos y evaluacion publicas en el repositorio del proyecto.
- Evaluacion de tecnicas de ajuste fino multimodal de bajo coste: el modelo demuestra que un LoRA SFT de 1.250 pasos en una A100 sobre un modelo de 2B puede producir un agente funcional, util para disenar experimentos de ablacion.
- Generacion de datos sinteticos de interaccion: sus salidas JSON pueden emplearse para aumentar conjuntos de entrenamiento de agentes moviles, siempre con revision humana.
- Pruebas de robustez y seguridad de agentes: su tendencia conocida a bucles `wait` permite validar mecanismos de guarda (loop guards) y politicas de timeout en pipelines de evaluacion.
- Benchmarking de harnesses de evaluacion: integrable en entornos como AndroidWorld o MobileWorld para comparar versiones de modelos y recetas de entrenamiento.
- Educacion y divulgacion tecnica: ejemplo didactico de formato de prompt, esquema de acciones JSON y evaluacion de agentes moviles con metricas de precision por paso.
- Prototipado de asistentes de automatizacion de tareas en laboratorio: en entornos controlados y con cuentas de prueba, para validar flujos de navegacion entre aplicaciones.

## Benchmarks y rendimiento

Resultados publicados por el autor, una ejecucion por benchmark, temperatura 0, GGUF 4-bit; las excepciones cuentan como fallo.

| Benchmark | v4.1 | v4 | Diferencia |
|---|---|---|---|
| AndroidWorld, seed 30 (116 tareas, desarrollo) | 12 (14 con loop guards) | 18 | +2 / -8 en pares |
| AndroidControl test, precision de paso high-level | 0,732 | 0,728 | no disponible |
| AndroidControl test, precision de paso low-level | 0,895 | 0,908 | no disponible |
| MMStar (conocimiento general) | 55,6% | 52,9% | no disponible |
| MMLU (conocimiento general) | 51,1% | 50,4% | no disponible |

El autor senala que v4.1 es peor que v4 en linea (12 frente a 18 en AndroidWorld) y que no fue seleccionado para MobileWorld. Su sucesor v4.2 recupera 18/116 en AndroidWorld y obtiene 8/105 en MobileWorld (v4: 6/105).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en safetensors ocupa 4,1 GB en el repositorio; en cuantizacion 4-bit GGUF el peso se reduce aproximadamente a la mitad, por lo que cabe en GPUs consumer con 6-8 GB de VRAM, aunque el consumo real depende del backend y del procesamiento de imagen.
- GPU recomendadas: A100 (usada en el entrenamiento), H100 para mayor throughput; para inferencia basta con una RTX 4090, RTX 3090 o incluso GPUs de gama media con 8 GB o mas.
- Cabe en GPU consumer: si, especialmente en la variante GGUF 4-bit.
- Opciones de despliegue: transformers (libreria declarada, con `custom_code` y `lfm3_vl`), llama.cpp u Ollama para la variante GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte explicito de vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.1 | 1.918 millones | no disponible (historial de 8 pasos) | Agente GUI Android, screenshot por paso | LFM Open License v1.0 | Experimental, superado por v4.2 |
| LFM3-VL-2B-MobileAgent-v4 | 1.918 millones | no disponible | Agente GUI Android | LFM Open License v1.0 | Anterior, mejor en linea (18/116) |
| LFM3-VL-2B-MobileAgent-v4.2 | 1.918 millones | no disponible | Agente GUI Android entrenado sobre sus propias salidas | LFM Open License v1.0 | Sucesor recomendado (18/116 en AndroidWorld, 8/105 en MobileWorld) |
| LiquidAI/LFM3-VL-2B | 1.918 millones | no disponible | Modelo multimodal base | LFM Open License v1.0 | Base sin especializar en agentes |

No se dispone de comparaciones con agentes GUI de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe operar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Rendimiento online inferior a su predecesor v4 (12 frente a 18 en AndroidWorld, seed 30), con regresion de 8 tareas en la comparacion por pares.
- Tendencia a bucles `wait`, el fallo que motivo esta version y que solo se corrige parcialmente (14/116 con loop guards).
- Solo admite objetivos en ingles y una unica screenshot por paso, sin memoria visual mas alla de los 8 pasos de historial de texto.
- Entrenado exclusivamente con demostraciones grabadas; nunca ha interactuado con un telefono real durante el entrenamiento, lo que limita su robustez ante estados no vistos.
- Riesgo de alucinacion en la seleccion de acciones y coordenadas, especialmente en pantallas fuera de la distribucion de los datos de entrenamiento.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia de codigo abierto estandar.
- Estado experimental y superado por v4.2; para nuevos proyectos el autor recomienda la version posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1
- Version GGUF 4-bit: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1-GGUF
- Sucesor v4.2: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Licencia: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1/blob/main/LICENSE
