# GatekeeperZA/Llama-3.2-3B-Instruct-RKLLM-v1.2.3

## Resumen

Este modelo es una conversión del modelo instructivo Llama-3.2-3B-Instruct de Meta al formato RKLLM, diseñado para ejecutarse en la NPU del SoC Rockchip RK3588. Lo publica el usuario GatekeeperZA, que mantiene también un servidor API compatible con OpenAI para desplegar estos modelos en placas de desarrollo ARM como la Orange Pi 5 Plus. El objetivo es llevar inferencia de LLM local y privada a hardware de bajo consumo sin dependencia de la nube.

La conversión se realizó con el RKLLM Toolkit v1.2.3 con cuantización w8a8 (pesos y activaciones de 8 bits) y un contexto máximo de 8192 tokens. Al tratarse de un modelo instructivo estándar, no incluye modo de razonamiento explícito (thinking mode). Con unos 3.000 millones de parámetros, ocupa una posición intermedia entre los modelos de 1.7B y 4B de la familia Qwen3 también convertidos por el mismo autor, y consume aproximadamente 3.5 GB de RAM en carga, por lo que cabe en placas con 8 GB o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, 28 capas, atención con RoPE) |
| Parametros totales | ~3.2 mil millones (base: Llama-3.2-3B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (límite impuesto en la conversión RKLLM; el modelo base soporta hasta 128K) |
| Tipos de cuantizacion | w8a8 (pesos 8 bits, activaciones 8 bits), algoritmo "normal" |
| Idiomas soportados | Inglés (más capacidades multilingües heredadas del modelo base Llama 3.2) |
| Licencia | Llama 3.2 Community License (llama3.2) |
| Formato de pesos | RKLLM (archivo .rkllm, formato propietario de Rockchip para NPU) |

## Arquitectura y entrenamiento

El modelo base es Llama-3.2-3B-Instruct de Meta, un transformer decoder-only denso de aproximadamente 3.2 mil millones de parámetros, entrenado con atención de ventana deslizante de 128K tokens y ajustado mediante instrucciones y RLHF. Esta conversión no modifica los pesos del modelo: lo que hace es transformarlos al formato RKLLM con cuantización w8a8 (pesos y activaciones de 8 bits) para que puedan ejecutarse en los tres núcleos NPU del RK3588.

La conversión se realizó con el RKLLM Toolkit v1.2.3, con nivel de optimización 0 y algoritmo de cuantización "normal". El modelo resultante no genera bloques de razonamiento tipo "thinking", a diferencia de otras conversiones del mismo autor. Se requiere el RKLLM Runtime v1.2.1 como mínimo (recomendado v1.2.3) y el driver RKNPU 0.9.6 o superior. El proceso de conversión se documenta con un script Python reproducible, con la advertencia de que en WSL2 se necesitan al menos 16 GB de memoria asignada para evitar fallos de memoria durante la exportación.

## Capacidades

- Generación de texto e instrucciones en inglés, con capacidades multilingües heredadas del modelo base Llama 3.2.
- Seguimiento de instrucciones y razonamiento general, sin modo de pensamiento explícito (no produce bloques "thinking").
- Competente en tareas de codificación y razonamiento básico, según las características del modelo base Llama 3.2 Instruct.
- No soporta tool calling ni function calling de forma nativa en esta conversión (a diferencia de otras conversiones RKLLM del mismo autor como xLAM-1b-fc-r).
- Inferencia local en NPU de Rockchip, sin dependencia de GPU ni de la nube.
- Compatible con el RKLLM API Server de GatekeeperZA, que expone una API compatible con OpenAI para integrarse con frontends como Open WebUI.

## Casos de uso

- Asistente conversacional local en dispositivos de borde: desplegado en una Orange Pi 5 Plus con 8-16 GB de RAM, puede servir un chatbot privado sin conexión a internet, ideal para entornos con requisitos de privacidad o sin conectividad fiable.
- Backend de Open WebUI en hardware ARM: gracias al RKLLM API Server, el modelo se integra como backend compatible con OpenAI en Open WebUI, permitiendo una interfaz web completa sobre hardware de bajo coste.
- Prototipado de aplicaciones de IA en SBC: desarrolladores que trabajan con RK3588 pueden usar este modelo para validar flujos de generación de texto antes de pasar a modelos mayores, gracias a su equilibrio entre tamaño (3B) y consumo (~3.5 GB de RAM).
- Automatización de documentación y resúmenes en inglés: el modelo puede generar resúmenes de textos largos de hasta 8192 tokens de contexto, suficiente para documentos técnicos o actas de reuniones.
- Educación y demostraciones de IA en hardware embebido: sirve para enseñar despliegue de LLM en NPU sin necesidad de GPUs, con un coste de hardware reducido.
- Desarrollo y pruebas del ecosistema RKLLM: útil para evaluar el toolkit de conversión de Rockchip, probar el runtime y depurar integraciones con el API server antes de comprometerse con modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. El rendimiento del modelo base Llama-3.2-3B-Instruct es conocido en la literatura, pero esta conversión cuantizada a w8a8 puede presentar degradaciones no documentadas que convendría medir en el hardware objetivo.

## Requisitos de hardware

- RAM: aproximadamente 3.5 GB en carga; recomendable placa con 8 GB o más de RAM.
- SoC objetivo: RK3588 o RK3588S, con 3 núcleos NPU. No es compatible con RK3576 (2 núcleos) sin reconvertir el modelo.
- Placa de pruebas documentada: Orange Pi 5 Plus con 16 GB de RAM y Armbian Linux, driver RKNPU 0.9.8 y RKLLM Runtime v1.2.3.
- Requisitos de software: RKLLM Runtime ≥ v1.2.1 (recomendado v1.2.3) y driver RKNPU ≥ 0.9.6.
- Despliegue: mediante el demo oficial rkllm_api_demo del repositorio rknn-llm, o mediante el RKLLM API Server de GatekeeperZA para integración con frontends compatibles con OpenAI.
- No requiere GPU: la inferencia se ejecuta íntegramente en la NPU del Rockchip.
- Para la conversión del modelo (no para la inferencia) se necesita un PC con al menos 16 GB de RAM en WSL2 si se usa Windows.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Plataforma | Licencia |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-RKLLM-v1.2.3 (este) | ~3.2B | 8192 | w8a8 | RK3588 NPU | Llama 3.2 |
| Llama-3.2-3B-Instruct (original de Meta) | ~3.2B | 128K | FP16/FP32 | GPU/CPU | Llama 3.2 |
| Qwen3-VL-2B-Instruct-RKLLM-v1.2.3 (GatekeeperZA) | ~2B | no disponible | w8a8 | RK3588 NPU | no disponible |
| xLAM-1b-fc-r-RKLLM-v1.2.3 (GatekeeperZA) | ~1B | no disponible | w8a8 | RK3588 NPU | CC-BY-NC-4.0 |

Frente al modelo original de Meta, esta conversión pierde la ventana de contexto de 128K (limitada a 8192 tokens) y solo puede ejecutarse en hardware Rockchip, pero gana eficiencia energética y despliegue en placa única. Comparado con las otras conversiones del mismo autor, ofrece más capacidad que el xLAM de 1B (que además está pensado para tool calling) y menos que un hipotético modelo de 4B, situándose como opción intermedia para tareas generales de instrucción.

## Limitaciones y advertencias

- Contexto limitado a 8192 tokens: muy inferior a los 128K del modelo base, lo que impide procesar documentos largos o conversaciones muy extensas.
- Sin modo de razonamiento explícito: no genera bloques "thinking", lo que puede limitar su rendimiento en tareas de razonamiento complejo frente a modelos con esa capacidad.
- Idioma principal: inglés. Aunque hereda capacidades multilingües del modelo base, no hay garantías de calidad en español u otros idiomas en esta conversión.
- Compatibilidad restringida: solo funciona en RK3588/RK3588S con 3 núcleos NPU; no es compatible con RK3576 sin reconvertir, y requiere versiones concretas de runtime y driver.
- Cuantización w8a8 con algoritmo "normal": puede introducir degradaciones de precisión no documentadas; conviene validar la calidad de salida en el caso de uso concreto.
- Licencia Llama 3.2: incluye restricciones de uso comercial y requisitos de atribución; hay que revisar los términos de Meta antes de desplegar en producción.
- Sin tool calling ni function calling: a diferencia de otras conversiones del autor, este modelo no está preparado para integraciones agénticas.
- Ecosistema propietario: el formato .rkllm y el runtime son de Rockchip, lo que ata el despliegue a su plataforma y limita la portabilidad a otros hardware.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento de esta conversión concreta, por lo que el rendimiento real debe medirse en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GatekeeperZA/Llama-3.2-3B-Instruct-RKLLM-v1.2.3
- Modelo base (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio RKLLM API Server: https://github.com/GatekeeperZA/RKLLM-API-Server
- Repositorio del runtime RKLLM (airockchip): https://github.com/airockchip/rknn-llm
- Conversión hermana Qwen3-VL-2B: https://huggingface.co/GatekeeperZA/Qwen3-VL-2B-Instruct-RKLLM-v1.2.3
- Conversión hermana xLAM-1b-fc-r: https://huggingface.co/GatekeeperZA/xLAM-1b-fc-r-RKLLM-v1.2.3
- Llama-3.2-3B-Instruct en NVIDIA NIM: https://build.nvidia.com/meta/llama-3.2-3b-instruct
- Llama-v3.2-3B-Instruct en Qualcomm AI Hub: https://aihub.qualcomm.com/models/llama_v3_2_3b_instruct
