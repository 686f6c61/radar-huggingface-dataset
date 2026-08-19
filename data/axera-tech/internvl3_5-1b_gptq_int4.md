# AXERA-TECH/InternVL3_5-1B_GPTQ_INT4

## Resumen

InternVL3_5-1B_GPTQ_INT4 es una conversión del modelo vision-language InternVL3.5-1B, desarrollado originalmente por OpenGVLab, adaptada por AXERA-TECH para ejecutarse en sus unidades de procesamiento neuronal (NPU) de las series AX650 y AX620E. El modelo combina un encoder de visión InternViT con un LLM Qwen3-0.6B, y se distribuye cuantizado en w4a16 (4 bits para pesos, 16 bits para activaciones) para reducir el uso de memoria y permitir inferencia eficiente en hardware embebido de bajo consumo.

Esta versión empaquetada en el formato de directorio de modelos de ax-llm resuelve el problema de desplegar un VLM multimodal en dispositivos edge sin GPU, ofreciendo una solución lista para usar con el runtime de AXERA. Con una longitud de contexto de 2k tokens y entrada de imágenes de 448×448 píxeles, es adecuado para aplicaciones de visión por computador y diálogo multimodal en tiempo real sobre NPU dedicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternViT (encoder de visión) + Qwen3-0.6B (LLM) |
| Parametros totales | 1B (aprox., 0.6B del LLM + encoder de visión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2k tokens (max prefill 1k) |
| Tipos de cuantizacion | w4a16 (GPTQ INT4) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ax-llm (model directory con axmodel) |

## Arquitectura y entrenamiento

El modelo base InternVL3.5-1B utiliza una arquitectura híbrida de visión-lenguaje: un encoder de visión InternViT procesa imágenes de 448×448 píxeles y proyecta sus características al espacio de embeddings del LLM Qwen3-0.6B, que genera las respuestas textuales. La conversión realizada por AXERA-TECH aplica cuantización w4a16 mediante GPTQ, reduciendo los pesos a 4 bits y manteniendo las activaciones en 16 bits, lo que permite una ejecución eficiente en NPU sin necesidad de GPU.

No se dispone de información sobre los datos de entrenamiento del modelo original ni sobre técnicas como RLHF o DPO. Esta versión es exclusivamente una adaptación de inferencia: no se ha realizado ningún entrenamiento adicional, solo la conversión de pesos y el empaquetado en el formato ax-llm compatible con Pulsar2 5.1-patch1.

## Capacidades

- Procesamiento de imágenes y generación de texto descriptivo o respuestas a preguntas visuales.
- Chat multimodal interactivo con entrada de imagen y texto.
- Compatibilidad con servidor HTTP estilo OpenAI (puerto 8000) para integración en aplicaciones.
- Inferencia en tiempo real en NPU de AXERA con rendimiento medido de 28.09 tokens/seg (AX650) y 7.33 tokens/seg (AX620E).
- Soporte de entrada de imagen única de 448×448 píxeles.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Asistentes de visión en dispositivos embebidos: el modelo puede analizar imágenes capturadas por cámaras en tiempo real y responder preguntas, gracias a su baja latencia en NPU AX650 (883 ms de tiempo hasta el primer token).
- Automatización de inspección visual en entornos industriales: integrado en un sistema edge, puede clasificar defectos o leer etiquetas a partir de imágenes, sin depender de la nube.
- Accesibilidad para personas con discapacidad visual: descripción de escenas y objetos en dispositivos portátiles con NPU de bajo consumo.
- Quioscos interactivos con reconocimiento de imágenes: el servidor OpenAI-compatible permite conectar aplicaciones web o móviles a un endpoint local para consultas visuales.
- Prototipado rápido de VLM en hardware edge: gracias al formato ax-llm y al runtime de AXERA, los desarrolladores pueden desplegar el modelo en placas de desarrollo como M4N-Dock o tarjetas M.2 sin necesidad de GPU.
- Educación y demostraciones de IA en entornos sin acceso a servidores potentes: el modelo funciona en hardware de bajo coste, facilitando talleres y prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Diseñado específicamente para NPU de AXERA: AX650N (host o tarjeta aceleradora M.2 AXCL) y AX620E.
- No requiere GPU; la inferencia se ejecuta en la NPU integrada o en tarjeta aceleradora.
- Rendimiento medido:
  - AX650: 364.412 ms para el encoder de imagen, 883.458 ms de tiempo hasta el primer token, 28.09 tokens/seg.
  - AX620E: 2358.956 ms para el encoder de imagen, 3136.54 ms de tiempo hasta el primer token, 7.33 tokens/seg.
- Runtime necesario: ax-llm (disponible en GitHub).
- Compatible con Pulsar2 5.1-patch1 para conversión de modelos.
- Opciones de despliegue: ejecución interactiva (`axllm run`) o servidor HTTP (`axllm serve`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Hardware objetivo |
|---|---|---|---|---|---|
| InternVL3_5-1B_GPTQ_INT4 (este) | 1B | 2k | BSD-3-Clause | ax-llm | NPU AX650/AX620E |
| OpenGVLab/InternVL3_5-1B (base) | 1B | 2k | BSD-3-Clause | safetensors (transformers) | GPU / CPU |
| Qwen2-VL-2B (ejemplo similar) | 2B | 32k | Apache-2.0 | safetensors | GPU / CPU |

La comparativa se limita a características generales, ya que no se dispone de benchmarks comparativos. La principal diferencia con el modelo base es la cuantización y el empaquetado para NPU, lo que reduce la portabilidad a otros entornos pero habilita su uso en hardware embebido.

## Limitaciones y advertencias

- Longitud de contexto limitada a 2k tokens, lo que restringe el manejo de conversaciones largas o documentos extensos.
- Solo soporta inglés según la model card, aunque el modelo base podría tener capacidades multilingües no documentadas en esta conversión.
- La cuantización w4a16 puede degradar ligeramente la precisión en comparación con el modelo en FP16.
- El formato de pesos ax-llm no es compatible con frameworks estándar como transformers o vLLM; requiere el runtime específico de AXERA.
- Dependencia exclusiva de hardware de AXERA; no puede ejecutarse en GPUs de NVIDIA o AMD sin una conversión adicional.
- No se documentan capacidades de tool calling, agentes o razonamiento avanzado.
- El modelo es una adaptación de inferencia; no se ha realizado fine-tuning adicional para tareas específicas.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/AXERA-TECH/InternVL3_5-1B_GPTQ_INT4
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-1B
- Runtime ax-llm: https://github.com/AXERA-TECH/ax-llm
- Documentación de hardware AXCL: https://axcl-docs.readthedocs.io/zh-cn/latest/doc_guide_hardware.html
- Wiki de M4N-Dock (爱芯派Pro): https://wiki.sipeed.com/hardware/zh/maixIV/m4ndock/m4ndock.html
