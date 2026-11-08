# MachineDelusions/Kandinsky6-VSR-LoRas

## Resumen

`k6_sr_v5_x2_crisp` es un LoRA de rango 32 desarrollado por MachineDelusions para el modelo de superresolución de vídeo Kandinsky 6 VSR, en su variante destilada a 2 pasos y 5 segundos (`kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers`). El adaptador no es un modelo generativo autónomo: modifica el comportamiento del modelo base para producir bordes más nítidos y texturas finas más definidas en el reescalado a 2x, a cambio de cierta fidelidad respecto a la fuente original.

Su relevancia es acotada y muy específica: se publica como complemento práctico para flujos de trabajo de posproducción y restauración de vídeo dentro de ComfyUI, mediante el nodo de terceros FL Kadinsky Upscale. El repositorio ocupa 0,1 GB y contiene pesos en formato safetensors, con licencia MIT heredada del modelo base.

No hay información publicada sobre idiomas, pipeline de Hugging Face ni resultados de benchmarks. El modelo se distribuye sin descargas ni interacciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión de superresolución de vídeo; rango 32 |
| Parametros totales | no disponible (el LoRA de rango 32 es un adaptador; el recuento de parámetros del modelo base no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers |
| Escala de entrenamiento | 2x únicamente |
| Fuerza recomendada del LoRA | 1.0 (0.7 sobre rostros) |
| `lq_noise_scale` recomendado | 0.3 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado sobre Kandinsky 6 VSR, un modelo de difusión para superresolución de vídeo en su variante destilada a 2 pasos con ventana de 5 segundos. No se detalla en la información disponible la arquitectura interna del modelo base (tipo de backbone, mecanismo de atención temporal, etc.), por lo que no es posible describirla con rigor.

El entrenamiento se realizó exclusivamente a escala 2x, sobre objetivos 4K a los que se aplicó unsharp masking. La función de pérdida combina L1, LPIPS, una pérdida de bordes, una pérdida de textura y una pérdida adversarial ligera. No se especifican el número de pasos de entrenamiento, el volumen del dataset, la composición de los datos ni si hubo etapas de refinamiento adicionales.

## Capacidades

- Superresolución de vídeo a escala 2x sobre el modelo base Kandinsky 6 VSR.
- Mejora de nitidez en bordes y de definición de texturas finas respecto a la salida del modelo base sin adaptador.
- Integración en flujos de ComfyUI mediante el nodo FL Kadinsky Upscale.
- Ajuste de fidelidad frente a nitidez mediante la fuerza del LoRA (1.0 general, 0.7 recomendado en rostros).
- Control del ruido de entrada de baja calidad mediante `lq_noise_scale`.
- No soporta generación de texto, razonamiento, código, tool calling, agentes ni capacidades multilingües: es un adaptador de visión por computador para vídeo.

## Casos de uso

- Restauración de metraje de archivo en 2x: aplicar el LoRA sobre el modelo destilado permite procesar clips de 5 segundos con dos pasos de inferencia, útil para digitalizar material antiguo con bordes degradados.
- Limpieza de vídeo comprimido para redistribución: el aumento de nitidez en bordes compensa el emborronamiento típico de códecs agresivos antes de un reencode.
- Preparación de material para montaje: reescalar planos a 2x con texturas más definidas antes de integrarlos en una timeline de mayor resolución.
- Posproducción de contenido para redes: clips cortos que necesitan un aspecto más nítido sin rehacer el rodaje, ajustando la fuerza a 0.7 en planos con rostros para evitar artefactos.
- Flujos automatizados en ComfyUI: encadenar el nodo FL Kadinsky Upscale dentro de un pipeline por lotes para procesar carpetas de clips de 5 segundos.
- Pruebas de comparación de calidad: evaluar el compromiso nitidez-fidelidad frente al modelo base en un mismo clip, variando la fuerza del LoRA y `lq_noise_scale`.
- Prototipado de restauración en investigación: como punto de partida para experimentar con pérdidas de textura y bordes en tareas de VSR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende enteramente del modelo base Kandinsky 6 VSR destilado, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI con el nodo FL Kadinsky Upscale (github.com/filliptm/ComfyUI-FL-Kadinsky-Upscale). No se documentan otras vías como vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponible. El modelo base está destilado a 2 pasos, lo que reduce el coste frente a un muestreo completo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Escala | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `k6_sr_v5_x2_crisp` (este LoRA) | LoRA sobre Kandinsky 6 VSR | 2x | 2 (heredado del base) | MIT | Hugging Face, repo de 0,1 GB |
| Kandinsky 6.0 VSR distilled2steps-5s | Modelo base de VSR | no especificada en la información | 2 | no disponible en la información | Hugging Face (kandinskylab) |
| Otros modelos de VSR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El propio autor advierte de que el LoRA sacrifica fidelidad a la fuente en favor de nitidez y textura; en escenas con detalle fino o texto puede introducir rasgos que no estaban en el original.
- Entrenado exclusivamente a escala 2x: no debe esperarse un comportamiento correcto a otras escalas.
- En rostros se recomienda bajar la fuerza a 0.7; a 1.0 pueden aparecer artefactos faciales.
- No hay información sobre sesgos, sesgos demográficos ni comportamiento diferencial por tipo de contenido.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede inventar detalle plausible donde la fuente no lo tiene.
- No se documentan limitaciones de idioma ni de contexto porque no aplican a esta modalidad.
- Licencia MIT, que permite uso comercial y modificación, pero el modelo base tiene su propia licencia (no detallada en la información disponible) que conviene verificar antes de un despliegue comercial.
- Sin descargas ni validación comunitaria registrada en el momento de la ficha; el soporte depende de un nodo de terceros (FL Kadinsky Upscale) y no de un pipeline oficial de Hugging Face.
- No hay datos de benchmarks ni de calidad objetiva frente al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MachineDelusions/Kandinsky6-VSR-LoRas
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers
- Nodo ComfyUI FL Kadinsky Upscale: https://github.com/filliptm/ComfyUI-FL-Kadinsky-Upscale
- Descarga directa del peso: `hf download MachineDelusions/Kandinsky6-VSR-LoRas k6_sr_v5_x2_crisp.safetensors --local-dir ComfyUI/models/loras/FL_Kadinsky`
