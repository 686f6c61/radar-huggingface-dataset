# Ravenh97/roborender_image3f

## Resumen

RoboRender Image3F es un adaptador LoRA de 0.7 GB desarrollado por Ravenh97 sobre el modelo base PAI/Wan2.1-Fun-V1.1-1.3B-Control. Está diseñado como un renderizador de escenas robóticas por frame que, a partir de un prompt de lenguaje y tres condiciones por vista (profundidad, máscara de robot y RGB previo), genera tres vistas sincronizadas de 416x240 (ext1, ext2 y wrist). El modelo se emplea para reetiquetar observaciones dentro de un bucle DAgger, con una latencia declarada por el autor de aproximadamente 192 ms/frame. Su relevancia radica en el ámbito de sim2real para robótica: permite generar observaciones sintéticas condicionadas por el estado del robot sin necesidad de un entorno real, lo que facilita el aprendizaje de políticas en simulación. La arquitectura combina un transformer DiT de 30 bloques con RoPE real, atención SDPA/flash y aceleración mediante TeaCache y TensorRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Wan-Fun-Control 1.3B (DiT de 30 bloques con RoPE real, SDPA/flash attention) |
| Parametros totales | No disponible (adaptador LoRA de 0.7 GB sobre base de 1.3B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se exporta a ONNX y TensorRT localmente) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador) + scripts de exportacion; ONNX y TensorRT generados localmente |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Wan2.1-Fun-V1.1-1.3B-Control, inicializado a partir de un LoRA padre en el update 228270 y afinado durante 5000 updates. El condicionamiento es multimodal: recibe un prompt de lenguaje, tres vistas de profundidad, tres máscaras de robot y tres vistas RGB de referencia con un retardo fijo de 256 frames. Durante el entrenamiento se aplican dropouts independientes para las modalidades RGB y profundidad con probabilidad 0.3; cuando una modalidad se activa, solo una de sus tres vistas se descarta, mientras que las máscaras nunca se eliminan. El muestreo se realiza con un esquema fijo de 5 pasos y CFG 1.0. La aceleración incluye RoPE real, atención SDPA/flash, cachés estáticas y de prompt exacto, TeaCache y TensorRT para el stack DiT. El sampler de 5 pasos no es un modelo destilado ni un estudiante KD: es un esquema de inferencia específico para este adaptador.

## Capacidades

- Generacion de imagenes por frame: produce tres vistas sincronizadas (ext1, ext2, wrist) de 416x240 a partir de condiciones de profundidad, mascaras y RGB previo.
- Reetiquetado de observaciones en bucles DAgger a ~192 ms/frame, segun lo declarado por el autor.
- Condicionamiento multimodal con retardo fijo de 256 frames, que permite mantener un ancla renderizada por episodio (FT-FIXED).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: renderizado de escenas roboticas para sim2real, con tres vistas coherentes por peticion.

## Casos de uso

- Reetiquetado de observaciones en DAgger: el modelo puede generar el RGB sintetico de una observacion del robot a partir de profundidad, mascara y RGB previo, lo que permite reetiquetar demostraciones sin un entorno real. Es adecuado porque esta disenado especificamente para este bucle, con un coste declarado de ~192 ms/frame.
- Generacion de datos sinteticos para politicas de manipulacion: a partir de condiciones de profundidad y mascaras, se pueden generar vistas RGB multiples (ext1, ext2, wrist) para ampliar datasets de entrenamiento de una politica. Es adecuado porque produce tres vistas sincronizadas y coherentes.
- Simulacion de entornos para sim2real: el modelo convierte observaciones de un simulador en imagenes con aspecto mas realista usando condiciones de profundidad y mascaras. Es adecuado porque el adaptador fue entrenado con dropouts de modalidad para mejorar la robustez.
- Soporte en aprendizaje por interaccion: en un bucle de aprendizaje iterativo, el modelo genera imagenes condicionadas por el estado actual del robot para etiquetar automaticamente nuevas observaciones. Es adecuado porque soporta condiciones con retardo de 256 frames, lo que permite referenciar estados anteriores.
- Validacion de politicas en simulador: para probar una politica robotica, el modelo puede generar vistas del robot en diferentes configuraciones, proporcionando un entorno visual sintetico. Es adecuado porque produce tres vistas consistentes que permiten evaluar el comportamiento desde multiples angulos.
- Renderizado de escenas condicionado por texto: el modelo acepta un prompt de lenguaje junto con condiciones de profundidad y mascaras para generar la escena. Es adecuado para casos en los que se desea especificar la tarea o el entorno mediante una instruccion textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos siguientes proceden de la validacion interna del autor:

| Metrica | Resultado |
|---|---|
| Latencia media (B200, 5 pasos + TeaCache) | 186.34 ms |
| PSNR frente a ruta PyTorch de 5 pasos (B200) | 38.77 dB |
| SSIM frente a ruta PyTorch de 5 pasos (B200) | 0.9904 |
| PSNR con 5 pasos (frente al ancla) | 17.9 dB |
| PSNR con 50 pasos (frente al ancla) | 14.5 dB |

## Requisitos de hardware

- VRAM estimada: no disponible. El paquete requiere construir el motor TensorRT en la GPU de despliegue.
- GPU recomendadas: RTX 4090 (objetivo del bundle) y B200 (usada para la validacion del adaptador).
- Compatibilidad con GPUs de consumo: si, el bundle apunta a RTX 4090, pero la certificacion de rendimiento en esa GPU aun no esta completada.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama o TGI. Se usan los scripts propios del bundle (export_onnx.sh, build_engine.sh, calibrate_teacache.sh) junto con doctor.py.
- Latencia y throughput: 186.34 ms de media en B200 con la ruta acelerada; el autor declara ~192 ms/frame en el bucle DAgger. No hay claim de rendimiento en RTX 4090 hasta que pase la certificacion.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con modelos similares en la informacion proporcionada. El modelo es un adaptador especifico para un caso de uso de robotica, no un modelo generalista de generacion de imagenes.

## Limitaciones y advertencias

- El encadenamiento de las salidas del modelo colapsa alrededor del frame 20: no es adecuado para autogeneracion recursiva larga sin anclas externas.
- Aumentar el numero de pasos de denoising degrada el resultado (50 pasos derivan del color del ancla, con 14.5 dB frente a 17.9 dB con 5 pasos).
- El sampler de 5 pasos no es un modelo KD, self-forcing ni FastGen entrenado por separado; es un esquema de inferencia especifico del adaptador.
- La certificacion de rendimiento en RTX 4090 no esta completada: las afirmaciones de 200 ms / 5 Hz no son validas hasta que pase la validacion objetivo.
- El paquete no incluye los pesos base, ni ONNX, ni motores TensorRT: es necesario construir todo localmente con el stack de software exacto.
- Los pesos base deben obtenerse de una fuente autorizada (Raven) a traves de ROBORENDER_MODEL_BASE y no deben sustituirse por otra revision.
- El arbol del repositorio debe permanecer sin modificaciones, ya que el script doctor verifica los hash; ademas, se requiere PYTHONDONTWRITEBYTECODE=1.
- Riesgo de alucinacion visual: el modelo genera imagenes sinteticas y puede desviarse de los colores del ancla si se usan mas pasos de denoising.
- La licencia Apache 2.0 cubre el adaptador, pero los pesos base de Wan2.1 pueden tener condiciones adicionales no detalladas en esta ficha.
- No se especifican los idiomas soportados para el prompt de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ravenh97/roborender_image3f
- Dataset de anclas: https://huggingface.co/datasets/Ravenh97/roborender_anchors
- Teacher LoRA: https://huggingface.co/Ravenh97/roborender_teacher_lora
- Modelo base: https://huggingface.co/PAI/Wan2.1-Fun-V1.1-1.3B-Control
- Documentacion operativa (HANDOFF.md): disponible en el repositorio del bundle, junto con los scripts bin/doctor.py, bin/export_onnx.sh y bin/build_engine.sh.
