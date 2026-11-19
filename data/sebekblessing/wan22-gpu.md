# sebekblessing/wan22-gpu

## Resumen

Wan 2.2 TI2V-5B Turbo para chips gráficos de teléfono es un empaquetado del modelo de difusión de vídeo Wan2.2-TI2V-5B-Turbo, una destilación a 4 pasos de Wan 2.2 TI2V-5B (5.076.839.616 parámetros), adaptado para ejecutarse en la GPU integrada de un teléfono mediante OpenCL estándar a través del motor Anima GPU Engine. Lo publica el usuario sebekblessing en Hugging Face y no entrena un modelo nuevo: reempaqueta los pesos del modelo base en un formato propietario del motor (no compatible con llama.cpp ni ComfyUI) para hacer viable la generación de vídeo imagen-a-vídeo en hardware móvil.

El paquete es parcial e incompleto por diseño. Solo incluye el modelo de dibujo (el denoiser de 30 bloques) cuantizado a 8 bits en un único fichero GGUF de 5,4 GB, junto con los niveles de ruido (`sigmas.txt`). El codificador de texto umT5-XXL, el codificador de imagen inicial y el decodificador de fotogramas no están incluidos en este repositorio; el autor remite a otro paquete (`wan22-qnn-8elite`) para el lector de prompts, que se ejecuta en la CPU. Según la model card, la aplicación Anima todavía no lo utiliza y el conjunto no es autosuficiente en un teléfono.

Su relevancia es acotada pero concreta: demuestra una vía para llevar difusión de vídeo de 5B parámetros a GPUs móviles con OpenCL, un terreno dominado por soluciones cerradas o específicas de NPU. Para desarrolladores que trabajan en inferencia on-device, es una referencia técnica de empaquetado y cuantización más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo (denoiser de 30 bloques) derivado de Wan 2.2 TI2V-5B; detalles internos de la arquitectura no disponibles |
| Parametros totales | 5.076.839.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusión condicionado por prompt, no por ventana de tokens) |
| Tipos de cuantizacion | 8 bits (fichero `wan_q8.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | `other` / `see-notice` (ver NOTICE); el modelo base Wan 2.2 TI2V-5B es Apache 2.0, la versión Turbo no declara licencia |
| Formato de pesos | GGUF con layout propio del motor Anima (no compatible con llama.cpp ni ComfyUI) |

## Arquitectura y entrenamiento

El modelo subyacente es Wan2.2-TI2V-5B-Turbo, una destilación a 4 pasos de Wan 2.2 TI2V-5B, un modelo de difusión para generación de vídeo a partir de imagen y texto. El repositorio no aporta detalles sobre la arquitectura interna (tipo de bloques, mecanismos de atención, dimensiones ocultas) ni sobre los datos de entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF o DPO. Esa información no está disponible en la documentación proporcionada.

La innovación técnica de este paquete no está en el entrenamiento sino en el despliegue: los pesos del denoiser se reempaquetan en un GGUF de layout propio del Anima GPU Engine y se cuantizan a 8 bits para que quepan y se ejecuten en la GPU integrada de un teléfono mediante OpenCL estándar. La destilación a 4 pasos del modelo Turbo reduce el coste de muestreo, lo que hace viable la inferencia en hardware de baja potencia. El autor indica que la codificación de texto (umT5-XXL) se ejecuta en el procesador, mientras que el codificador de imagen inicial y el decodificador de fotogramas carecen todavía de versión para GPU móvil.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) condicionada por texto, mediante un muestreo destilado de 4 pasos.
- Generación de vídeo a partir de texto (TI2V), siempre que se disponga del codificador de texto y del decodificador de fotogramas, no incluidos en este repositorio.
- Ejecución en GPU móvil con OpenCL estándar a través del Anima GPU Engine.
- Cuantización a 8 bits para reducir la huella de memoria del denoiser.
- No soporta tool calling ni function calling: es un modelo de difusión, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo thinking, visión general ni audio; su única modalidad de salida es vídeo.

## Casos de uso

- Prototipado de vídeo generativo on-device: usar el denoiser empaquetado junto con el lector umT5-XXL y los componentes restantes para experimentar con image-to-video en un teléfono con OpenCL, evaluando latencia y calidad en hardware real.
- Investigación en inferencia móvil: servir de referencia para estudiar cómo se empaquetan y cuantizan pesos de difusión de 5B parámetros para GPUs integradas, comparando el layout del motor Anima con alternativas como GGUF de llama.cpp.
- Integración en la aplicación Anima: cuando el autor complete el codificador de imagen y el decodificador de fotogramas, este paquete será el componente de dibujo de una app de generación de vídeo en teléfonos sin chip Snapdragon AI.
- Evaluación de destilación a 4 pasos: medir la pérdida de calidad frente al modelo Wan 2.2 TI2V-5B completo en tareas de animación de imágenes fijas, útil para decidir si la destilación es aceptable en un producto.
- Docencia y divulgación: ilustrar el pipeline completo de un modelo de difusión de vídeo (codificador de texto, codificador de imagen, denoiser y decodificador) usando un caso real de despliegue móvil.
- Benchmarking de motores OpenCL: comparar el rendimiento del Anima GPU Engine con otros backends móviles (Vulkan, Metal, QNN) sobre el mismo denoiser de 5B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 5,4 GB en cuantización de 8 bits; a ello hay que sumar la memoria de activaciones y del decodificador de fotogramas, no cuantificada en la información disponible.
- GPU recomendadas: GPU integrada de teléfono con soporte de OpenCL estándar. En dispositivos con Snapdragon 8 Elite, el autor remite al paquete `wan22-qnn-8elite`, específico para la NPU.
- ¿Cabe en GPU de consumo? El paquete está pensado para GPUs móviles, no para GPU de escritorio; no se proporcionan requisitos para A100, H100 ni RTX 4090.
- Opciones de despliegue: Anima GPU Engine (OpenCL). No es compatible con llama.cpp, ComfyUI, vLLM, TGI ni Ollama, según advierte el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wan22-gpu (este modelo) | 5.076.839.616 | No aplica | GGUF con layout Anima | `see-notice` | Hugging Face, solo denoiser |
| quanhaol/Wan2.2-TI2V-5B-Turbo (base) | No disponible | No aplica | Pesos originales | No declarada | Hugging Face |
| Wan-AI/Wan2.2-TI2V-5B | No disponible | No aplica | Pesos originales | Apache 2.0 | Hugging Face |
| wan22-qnn-8elite | No disponible | No aplica | GGUF para QNN | No disponible | Hugging Face |

La comparación se limita al linaje del propio modelo, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas de la misma categoría (difusión de vídeo en móvil) en la información proporcionada.

## Limitaciones y advertencias

- Paquete incompleto: solo incluye el denoiser y los niveles de ruido; faltan el codificador de imagen inicial y el decodificador de fotogramas con versión para GPU móvil, por lo que no es autosuficiente en un teléfono.
- No utilizado todavía por la aplicación Anima, según la propia model card.
- Formato propietario: el GGUF usa el layout del Anima GPU Engine y no es compatible con llama.cpp ni ComfyUI, lo que impide reutilizarlo en ecosistemas estándar.
- Licencia ambigua: el modelo base Wan 2.2 TI2V-5B es Apache 2.0, pero la versión Turbo no declara licencia y este paquete usa `see-notice`; es imprescindible revisar el fichero NOTICE antes de cualquier uso comercial.
- Sin datos de benchmarks, sesgos, alucinación ni calidad de generación: no se han publicado evaluaciones.
- Idiomas soportados no disponibles, lo que impide garantizar calidad en prompts en castellano.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Riesgo de obsolescencia: depende de un motor externo (Anima GPU Engine) y de un modelo base cuya página no declara licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sebekblessing/wan22-gpu
- Fichero NOTICE: https://huggingface.co/sebekblessing/wan22-gpu/blob/main/NOTICE
- Modelo base Turbo: https://huggingface.co/quanhaol/Wan2.2-TI2V-5B-Turbo
- Modelo original Wan 2.2 TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Motor Anima GPU Engine: https://github.com/adiirfan/anima-gpu-engine
- Paquete para Snapdragon 8 Elite: https://huggingface.co/sebekblessing/wan22-qnn-8elite
