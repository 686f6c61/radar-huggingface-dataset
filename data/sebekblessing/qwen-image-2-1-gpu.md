# sebekblessing/qwen-image-2.1-gpu

## Resumen

Qwen-Image 2.1 Turbo para chips gráficos de teléfono es un paquete de pesos derivado de Qwen-Image 2.1, el modelo de generación de imágenes de Alibaba Qwen, adaptado por el usuario sebekblessing para ejecutarse en la GPU de un teléfono móvil mediante el motor Anima GPU y OpenCL estándar. No es un modelo entrenado desde cero, sino una conversión de los pesos originales a un formato GGUF propietario del motor (no compatible con llama.cpp ni ComfyUI) con cuantización de 4 bits, acompañada de un decodificador de imagen ligero (TAE) y de un lector de prompts basado en la mitad lingüística de Qwen3-VL-8B.

El paquete resuelve un problema muy concreto: llevar un modelo de difusión texto-a-imagen de aproximadamente 8.190 millones de parámetros a hardware móvil sin depender de un chip NPU propietario. Para ello separa el pipeline en tres piezas: el modelo de dibujo (`qwen_q4.gguf`), el decodificador de latentes a píxeles (`tae_qwen.gguf`) y el codificador de texto (`qimg_reader.gguf`), que se ejecuta en la CPU del teléfono con llama.cpp. El repositorio ocupa 13,7 GB y acumula 317 descargas en el momento de redactar esta ficha.

La relevancia actual es doble: por un lado demuestra que la inferencia de modelos de imagen de escala 8B es viable en GPUs integradas de móvil con OpenCL; por otro, su licencia Qwen Research restringe el uso a fines no comerciales, lo que limita su adopción en producto. Es, por tanto, una pieza de interés para investigación, prototipado y experimentación en dispositivos, no para despliegues comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (derivado de Qwen-Image 2.1 Turbo); pipeline de tres componentes: modelo de dibujo, decodificador TAE y codificador de texto Qwen3 (mitad lingüística de Qwen3-VL-8B) |
| Parametros totales | 8.190.735.360 (según safetensors del repo); el fichero de dibujo cuantizado a 4 bits es `qwen_q4.gguf` |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (una escala por cada 32 entradas) para el modelo de dibujo; Q4_K_M para el lector de prompts; el script `build/pack_qwen.py` permite generar también una versión de 8 bits |
| Idiomas soportados | no disponible (el codificador de texto deriva de Qwen3-VL-8B, multilingüe, pero el autor no detalla cobertura) |
| Licencia | Qwen Research License Agreement (`qwen-research`), solo uso no comercial |
| Formato de pesos | GGUF en el layout propio del motor Anima GPU (no compatible con llama.cpp ni ComfyUI); el lector de prompts es GGUF estándar para llama.cpp; tokenizer en JSON |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: se trata de una conversión y empaquetado de Qwen-Image 2.1 Turbo. El pipeline se descompone en tres ficheros. El primero, `qwen_q4.gguf`, contiene el modelo de dibujo cuantizado a 4 bits con una escala por cada 32 entradas, reorganizado en el layout interno del motor Anima GPU y leído por bloques durante la generación. El segundo, `tae_qwen.gguf`, es un decodificador de imagen ligero de tipo TAE (taeqi2_1) que traduce latentes a píxeles. El tercero, `qimg_reader.gguf`, es la mitad lingüística de Qwen3-VL-8B (procedente de `qwen3vl_8b_bf16.safetensors` del repo Comfy-Org/Qwen-Image-2.1) convertida a un Qwen3 plano, cuantizada a Q4_K_M y ajustada sobre prompts de imagen; se ejecuta en la CPU del teléfono con llama.cpp y el modelo de dibujo consume su última capa antes de la normalización final.

Los scripts de construcción (`build/pack_qwen.py`, `build/pack_tae.py`, `build/make_reader.sh` con `build/calib_prompts.py`) documentan el proceso de conversión y calibración. El paquete incluye además `sigmas.txt` con los 8 niveles de ruido del sampler y un `manifest.json` con la lista de descargas de la app. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) exclusivamente; la edición de imágenes requiere la versión para chip NPU (`qwen-image-2.1-qnn-8elite`), no este paquete.
- Ejecución en GPU móvil mediante OpenCL estándar a través del motor Anima GPU, sin necesidad de NPU Snapdragon.
- Codificación de prompts con un modelo de lenguaje de 8B (Qwen3) ejecutado en CPU con llama.cpp, lo que permite prompts largos y descriptivos.
- Decodificación de latentes a píxeles con un TAE ligero, pensado para reducir el coste de memoria frente a un VAE completo.
- Cuantización agresiva a 4 bits con escalas por bloque de 32 entradas, orientada a caber en memoria móvil.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de imagen, no conversacional, pese a la etiqueta `conversational` del repo.
- No dispone de modo thinking, visión de entrada ni audio.

## Casos de uso

- Prototipado de generación de imágenes en Android: integrar el paquete en la app Anima para probar prompts en un teléfono real sin servidor, usando el motor Anima GPU y OpenCL; adecuado porque el manifest y los GGUF están empaquetados para esa app.
- Investigación sobre inferencia de difusión en hardware móvil: medir latencia y consumo de un modelo de 8B cuantizado a 4 bits en GPUs integradas, comparando con la ruta NPU (`qnn-8elite`).
- Demos offline de texto-a-imagen: escenarios sin conectividad donde se necesita generar ilustraciones simples en el dispositivo, gracias a que todo el pipeline (lector, dibujo y decodificador) reside localmente.
- Evaluación de cuantización: comparar la versión de 4 bits con la de 8 bits generada por `pack_qwen.py` para estudiar la degradación de calidad en modelos de difusión.
- Educación y talleres: mostrar de forma tangible cómo se descompone un pipeline de difusión (codificador de texto, modelo de dibujo, decodificador) en ficheros separados y ejecutables en hardware limitado.
- Pruebas de integración de llama.cpp en pipelines multimodales: el lector `qimg_reader.gguf` es un GGUF estándar que puede ejecutarse con llama.cpp en CPU, útil para validar la parte lingüística de forma aislada.
- No es adecuado para generación de imágenes en producción comercial ni para edición de imágenes en GPU, por las restricciones de licencia y las limitaciones funcionales descritas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo de dibujo está cuantizado a 4 bits y el repo completo ocupa 13,7 GB, pero el autor no publica cifras de memoria en ejecución.
- GPU recomendadas: GPU integrada de teléfono compatible con OpenCL a través del motor Anima GPU; el autor menciona explícitamente Snapdragon 8 Elite para la variante NPU (`qwen-image-2.1-qnn-8elite`), no para este paquete.
- Cabe en GPU de consumo: el objetivo declarado es GPU móvil, no GPU de escritorio; no se documenta soporte para RTX 4090, A100 o H100.
- Opciones de despliegue: motor Anima GPU (OpenCL) para el modelo de dibujo y el TAE; llama.cpp para el lector de prompts en CPU. No es compatible con vLLM, TGI, Ollama ni ComfyUI, ya que el GGUF usa un layout propio del motor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-image-2.1-gpu (este paquete) | 8.190.735.360 | no disponible | GGUF layout Anima GPU | Qwen Research (no comercial) | Hugging Face, 317 descargas |
| Qwen/Qwen-Image-2.1 (base) | no disponible en la informacion | no disponible | safetensors | Qwen Research (no comercial) | Hugging Face |
| qwen-image-2.1-qnn-8elite (variante NPU del mismo autor) | no disponible | no disponible | no disponible | Qwen Research (no comercial) | Referenciado en la model card |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research: uso exclusivamente no comercial; cualquier despliegue en producto o servicio comercial queda prohibido sin acuerdo adicional.
- Solo genera imágenes desde texto; la edición de imágenes no está soportada en esta variante GPU y requiere la versión para chip NPU.
- El GGUF del modelo de dibujo usa un layout propietario del motor Anima GPU y no es cargable en llama.cpp, ComfyUI ni otras herramientas estándar, lo que limita la portabilidad.
- Dependencia de una app y un motor concretos (Anima app y Anima GPU engine), con riesgo de abandono o cambios incompatibles.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base Qwen-Image 2.1; no se documentan evaluaciones de sesgo en la información disponible.
- No se especifican idiomas soportados ni cobertura multilingüe del codificador de texto, aunque derive de Qwen3-VL-8B.
- No hay datos publicados de latencia, consumo energético ni calidad de imagen frente a la versión de 8 bits o al modelo original.
- El repositorio tiene 0 likes y 317 descargas, sin validación comunitaria amplia; conviene tratar la calidad de la conversión como no verificada de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sebekblessing/qwen-image-2.1-gpu
- Modelo base Qwen-Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Motor Anima GPU: https://github.com/adiirfan/anima-gpu-engine
- Repo de referencia de pesos originales (Comfy-Org/Qwen-Image-2.1): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
