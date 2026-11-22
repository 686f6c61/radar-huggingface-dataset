# alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-sft

## Resumen

LFM3-VL-2B-AndroidAgent-v4.3-sft es un ajuste fino (SFT) del modelo vision-lenguaje LFM3-VL-2B de LiquidAI, especializado en actuar como agente de interfaz grafica sobre telefonos Android. Lo desarrolla el usuario independiente alpharomercoma como parte de una serie iterativa de candidatos (v4.1, v4.2, v4.3) orientada a la investigacion en agentes GUI moviles. El modelo recibe una captura de pantalla y un historial textual de los ultimos ocho pasos y emite una unica accion en JSON compacto precedida de un breve bloque de razonamiento.

La relevancia de esta version, etiquetada explicitamente como "candidato no validado", es metodologica: prueba si entrenar mas tiempo sobre la misma mezcla de datos (800 pasos adicionales de SFT, con aproximadamente un 43 % de filas ya vistas) mejora al predecesor v4.2. No introduce datos nuevos ni cambios arquitectonicos; congela la torre de vision y el proyector y solo anade un LoRA de lenguaje r64/α128 que se fusiona en los pesos.

Con 1.918.181.888 parametros reales (cerca de 2B) y un pipeline image-text-to-text, el modelo esta pensado para investigacion offline y evaluacion controlada, no para uso autonomo sobre cuentas reales. Su licencia LFM Open License v1.0 se hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (lfm3_vl), con torre de vision y proyector congelados durante el SFT; adaptador LoRA de lenguaje r64/α128 fusionado |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el historial textual se limita a los ultimos 8 pasos; la imagen se redimensiona a un maximo de ~880x880 px, unos 720 tokens de imagen) |
| Tipos de cuantizacion | 4-bit GGUF disponible en el repo hermano `LFM3-VL-2B-AndroidAgent-v4.3-sft-GGUF`; pesos originales en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | safetensors (transformers), GGUF 4-bit (repo separado), adaptador LoRA en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de LFM3-VL-2B de LiquidAI, un modelo vision-lenguaje de tipo transformer que procesa una captura de pantalla por paso junto con texto. En este ajuste la torre de vision y el proyector permanecen congelados; el entrenamiento se concentra en la parte de lenguaje mediante un LoRA r64/α128 que despues se fusiona en los pesos. El punto de partida es el merge de v4.2, sobre el que se aplican 800 pasos adicionales de SFT (supervised fine-tuning) con un scheduler warm-up → constant → linear decay en el ultimo 15 % y learning rate 1e-4.

Los datos son exactamente los de v4.2, sin cambios: AndroidControl, GUI-Odyssey, AMEX y ScreenQA con las ediciones introducidas en v4.1 y v4.2. En cada paso se muestrean 32 filas de los propios datos de entrenamiento de v4.2, de las cuales cerca del 43 % ya se habian visto. No se documenta uso de RLHF ni DPO. La innovacion del experimento es de regimen de entrenamiento, no de arquitectura: se aisla la variable "mas epocas sobre la misma mezcla" para medir su efecto frente a v4.2.

## Capacidades

- Generacion de una unica accion de agente en JSON compacto por paso, precedida de un bloque `` con la intencion a corto plazo.
- Conjunto de acciones soportadas: `click`, `long_press`, `input_text`, `scroll` (arriba/abajo/izquierda/derecha), `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status` (complete/infeasible).
- Coordenadas normalizadas como enteros en una rejilla 0-1000 sobre la captura.
- Comprension de capturas de pantalla de Android con un maximo de ~880x880 px de area (unos 720 tokens de imagen).
- Memoria de corto plazo basada en texto: los ultimos 8 pasos en formato `n. <intent> -> <action JSON>`.
- Razonamiento multi-paso encadenado mediante el bucle externo que aporta el historial; el modelo no mantiene estado propio.
- Capacidad de responder preguntas del usuario con la accion `answer` y de cerrar tareas con `status`.
- Sin soporte documentado de tool calling generico ni de function calling fuera del esquema de acciones propio.
- Solo ingles en los objetivos de usuario.

## Casos de uso

- Investigacion en agentes GUI moviles: banco de pruebas controlado para medir el efecto de mas pasos de SFT sobre la misma mezcla, comparando v4.3 frente a v4.2 en AndroidControl y AndroidWorld.
- Evaluacion offline de politicas de accion: ejecutar el modelo sobre splits de test (AndroidControl, dev splits) sin interaccion con dispositivos reales para validar formato de salida y cobertura de acciones.
- Generacion de datos sinteticos de trayectorias: usar el modelo para proponer acciones paso a paso sobre capturas y filtrar despues las trayectorias validas para ampliar datasets de entrenamiento.
- Prototipado de asistentes de accesibilidad: experimentar con automatizacion de tareas repetitivas (abrir una app, navegar menus, rellenar un campo) en entornos de laboratorio con cuentas de prueba.
- Benchmarking de inferencia multimodal: medir latencia y throughput de un VLM de ~2B con ~720 tokens de imagen por paso en GPUs consumer, util para dimensionar pipelines de agentes.
- Estudio de robustez y alucinacion en agentes: analizar como el modelo falla en pantallas no vistas o apps fuera de la lista de instaladas, alimentando trabajo sobre verificacion de acciones.
- Base para nuevos ajustes: punto de partida para experimentos con datos nuevos o con tecnicas de RL, dado que el adaptador LoRA se distribuye por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cerrados para v4.3 en la informacion disponible; la evaluacion esta en curso. Como referencia del predecesor:

| Modelo | Benchmark | Resultado |
|---|---|---|
| v4.2 (referencia) | AndroidWorld, seed 30 | 18/116 |
| v4.2 (referencia) | MobileWorld | 8/105 |
| v4.3-sft | AndroidControl test y AndroidWorld seed 30 | en progreso |

## Requisitos de hardware

- VRAM estimada: en bf16/fp16 los ~1,92B parametros ocupan aproximadamente 3,8-4 GB solo en pesos, mas activaciones y cache de imagen; en la practica conviene reservar 8-10 GB. La version GGUF 4-bit reduce los pesos a cerca de 1,2-1,5 GB.
- GPU recomendadas: A100 o H100 para evaluacion por lotes y despliegue de referencia; RTX 4090, RTX 3090 o RTX 4080 para inferencia interactiva en precision completa.
- GPU consumer: cabe con holgura en GPUs de 8 GB o mas usando la cuantizacion 4-bit; en 6 GB es ajustado pero posible con contexto corto.
- Opciones de despliegue: transformers (libreria nativa, requiere `trust_remote_code` por el codigo personalizado `lfm3_vl`); llama.cpp u Ollama con el GGUF del repo hermano; vLLM y TGI no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles. El coste dominante por paso es el preprocesado de la captura (~720 tokens de imagen) y la generacion de un JSON corto con decodificacion a temperatura 0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-AndroidAgent-v4.3-sft | ~1,92B | no disponible (historial de 8 pasos) | Agente GUI Android, SFT sobre LFM3-VL-2B | LFM Open License v1.0 | Hugging Face, safetensors y GGUF 4-bit |
| LFM3-VL-2B (LiquidAI) | ~2B | no disponible | VLM generalista base | LFM Open License v1.0 | Hugging Face |
| LFM3-VL-2B-AndroidAgent-v4.2 | ~1,92B | no disponible (historial de 8 pasos) | Agente GUI Android, predecesor directo | LFM Open License v1.0 | Hugging Face |
| Otros agentes GUI moviles open source | no disponible | no disponible | Agentes GUI de proposito general | variable | variable |

## Limitaciones y advertencias

- Modelo de investigacion: no debe operar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Candidato no validado: la evaluacion esta en curso y el autor advierte que puede rendir peor que v4.2.
- Solo objetivos en ingles; no se documenta soporte multilingue.
- Una unica captura por paso, sin memoria mas alla de los 8 pasos de historial textual; tareas largas o con dependencias lejanas quedan fuera de alcance.
- Riesgo de alucinacion en acciones: puede emitir coordenadas o nombres de app no presentes en la pantalla o no instalados.
- Sesgos no documentados; no hay analisis de sesgo en la model card.
- Licencia LFM Open License v1.0: conviene revisar el texto completo antes de cualquier uso comercial, ya que impone condiciones heredadas del modelo base.
- Requiere `trust_remote_code` en transformers por el codigo personalizado del modelo `lfm3_vl`.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-sft
- Predecesor v4.2: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2
- Version GGUF 4-bit: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-sft-GGUF
- Modelo base LFM3-VL-2B de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
