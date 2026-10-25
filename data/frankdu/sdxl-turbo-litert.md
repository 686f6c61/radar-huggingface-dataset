# frankdu/SDXL-Turbo-LiteRT

## Resumen

SDXL-Turbo-LiteRT es una conversión del modelo de difusión stabilityai/sdxl-turbo al formato LiteRT (el runtime sucesor de TensorFlow Lite), publicada por el usuario frankdu. No se trata de un modelo nuevo ni de un reentrenamiento: es un empaquetado de inferencia que serializa los grafos originales en Float32 —codificador de texto CLIP, UNet de denoising, sampler Euler ancestral y decodificador VAE— junto con un `manifest.json` que fija el plan de ejecución, los hashes de los grafos y el número de pasos por defecto. El objetivo declarado es ejecutar generación texto-a-imagen de 512 × 512 píxeles en 4 pasos sobre CPU, sin depender de PyTorch ni de CUDA.

Su relevancia es fundamentalmente práctica: demuestra una ruta de despliegue de difusión en dispositivos sin GPU dedicada y sirve como referencia para integraciones Android mediante LiteRT. El repositorio ocupa 13,7 GB e incluye los pesos originales bajo la licencia Stability AI Community, más scripts auxiliares con licencia de código separada.

Conviene subrayar el estado del proyecto: es experimental. La única validación reportada es una comprobación de humo en escritorio (Linux x86_64, LiteRT 2.3.0, CPU) donde la imagen generada se verificó visualmente como una manzana reconocible. No hay benchmarks de calidad ni de velocidad, y la ejecución en Android (CPU o GPU) y en TPU de Google Tensor no ha sido validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente: UNet de denoising + codificación de texto CLIP + sampler Euler ancestral + VAE, exportados como grafos LiteRT Float32 |
| Parametros totales | no disponible (el repositorio no publica recuento; el bundle en Float32 ocupa 13,7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el prompt se procesa con el codificador CLIP, sin límite declarado en la model card |
| Tipos de cuantizacion | únicamente Float32; no se distribuyen variantes int8/int4 |
| Idiomas soportados | no disponible; no se declara lista de idiomas (el texto de entrada pasa por CLIP) |
| Licencia | stability-ai-community (LICENSE.md); los scripts auxiliares usan CODE_LICENSE |
| Formato de pesos | grafos LiteRT (`.tflite`) Float32 + `manifest.json` con plan de ejecución y hashes |

Otros datos del bundle: resolución de salida 512 × 512, 4 pasos de muestreo, entrada/salida de tensores enteros preservada, grafos cargados de uno en uno (streaming) y scheduler fijado por el manifiesto.

## Arquitectura y entrenamiento

El modelo subyacente es SDXL-Turbo, un modelo de difusión latente destilado para generar imágenes en uno a cuatro pasos. Esta distribución no aporta entrenamiento propio: reproduce los grafos del checkpoint `stabilityai/sdxl-turbo` (revisión `71153311d3dbb46851df1931d3ca6e939de83304`), por lo que cualquier detalle de dataset, número de tokens o proceso de destilación debe consultarse en la model card de Stability AI, referenciada en `SOURCE_MODEL_CARD.md`.

La innovación técnica del repositorio es el empaquetado: los grafos se exportan individualmente y se ejecutan de forma secuencial con carga en streaming para reducir el pico de memoria, con un manifiesto que enumera el plan de ejecución de tensores y los hashes exactos de grafos, tokenizador y constantes. El bundle es portable y explícitamente **no** está compilado AOT para TPU de Google Tensor; conserva E/S de tensores enteros y no incluye checkpoints Diffusers de origen, cachés de descarga ni ficheros de trabajo del compilador.

## Capacidades

- Generación de imágenes texto-a-imagen a 512 × 512 píxeles con 4 pasos de muestreo (sampler Euler ancestral).
- Generación en un solo paso efectivo de denoising por iteración, orientada a baja latencia (la latencia real no está medida en el repositorio).
- Ejecución en CPU mediante el runtime LiteRT, sin requisito de GPU ni de PyTorch en tiempo de inferencia.
- Control de semilla entero (`--seed`) para reproducibilidad dentro de un mismo runtime; distintos runtimes pueden producir muestras distintas con la misma semilla.
- Inferencia por línea de comandos mediante `run_portable.py` (prompt, semilla, ruta de salida).
- Integración prevista en aplicaciones Android a través de LiteRT, siempre fuera del hilo principal y liberando buffers entre etapas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada ni audio: es un pipeline de difusión, no un modelo de lenguaje.

## Casos de uso

- Prototipado de generación de imágenes en escritorio sin GPU: el runner `run_portable.py` permite validar prompts y semillas en Linux x86_64 con CPU y LiteRT 2.3.0, sin instalar el stack completo de Diffusers.
- Evaluación de viabilidad de difusión en Android: el repositorio está preparado para integraciones LiteRT en apps Android (con las advertencias de memoria y de hilo principal), lo que sirve como banco de pruebas antes de invertir en un pipeline propio.
- Demos offline y entornos aislados: al ser un bundle autocontenido de 13,7 GB con grafos y manifiesto, puede ejecutarse en máquinas sin acceso a red una vez descargado.
- Investigación sobre conversión de modelos de difusión: el `manifest.json` con hashes de grafos, tokenizador y constantes es útil para estudiar pipelines de exportación y comparar paridad con el checkpoint original.
- Generación de imágenes de baja latencia en 4 pasos para wireframes y pruebas de concepto visuales, donde prima el tiempo de iteración sobre la fidelidad máxima.
- Docencia y experimentación sobre schedulers y samplers: al estar el sampler Euler ancestral y el número de pasos fijados por el manifiesto, sirve para ilustrar pipelines de difusión con parámetros controlados.
- Referencia para aplicaciones de "Research Lab" en Android, ya que el autor indica que el layout de los grafos se preserva para reutilización en esa aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única validación es una comprobación de humo (`validation.json`): una generación completa en escritorio con LiteRT 2.3.0 sobre CPU Linux x86_64, con verificación visual de que la imagen era una manzana reconocible. El autor indica explícitamente que no es una comparativa de calidad ni de velocidad. Tampoco se reportan latencias, throughput, consumo de memoria ni métricas FID/CLIP score.

## Requisitos de hardware

- Almacenamiento: 13,7 GB para el repositorio completo; los grafos se cargan de uno en uno, lo que reduce el pico de memoria frente a cargar todo el pipeline a la vez.
- VRAM: no disponible. El bundle es Float32 y está pensado para CPU; no se publican requisitos de memoria ni de RAM del sistema.
- GPU: no se han validado GPU. La validación reportada es exclusivamente CPU en escritorio.
- Consumer GPU: no disponible (no se documenta soporte CUDA ni Metal en este repositorio).
- Móvil: los requisitos de memoria para teléfono **no han sido validados**; el autor advierte que el éxito en escritorio no implica rendimiento en teléfono.
- TPU de Google Tensor: ejecución **no validada** para este repositorio; el bundle no está compilado AOT para TPU.
- Despliegue: runtime LiteRT 2.3.0 con `run_portable.py` (Python 3.12 en entorno virtual, `pip install -r requirements.txt`); en Android, LiteRT con un `Environment` compartido, ejecución fuera del hilo principal y liberación de buffers/modelos entre etapas.
- Alternativas de despliegue como vLLM, llama.cpp, Ollama o TGI no aplican: son pipelines de difusión, no checkpoints `.litertlm` de lenguaje.
- Latencia y throughput: no disponibles. El autor advierte que las cargas de grafo, la compilación y las copias de tensores host pueden ser costosas.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución / pasos | Formato | Licencia | Estado y disponibilidad |
|---|---|---|---|---|---|
| frankdu/SDXL-Turbo-LiteRT | Conversión LiteRT de SDXL-Turbo | 512 × 512 / 4 pasos fijos por manifiesto | Grafos LiteRT Float32 + manifest.json | stability-ai-community | Experimental; CPU de escritorio validada; Android y TPU no validadas; 0 descargas |
| stabilityai/sdxl-turbo | Modelo original de difusión destilada | 512 × 512 / 1-4 pasos | Diffusers / safetensors (no confirmado en la información) | stability-ai-community | Modelo de referencia en HuggingFace; requiere stack PyTorch/Diffusers |
| Conversiones LiteRT/TFLite de Stable Diffusion de terceros | Conversiones comunitarias | Variable | Grafos TFLite/LiteRT | Según el modelo base | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información suministrada, por lo que la comparación se limita a formato, licencia y estado de validación.

## Limitaciones y advertencias

- Proyecto experimental con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por terceros.
- Sin benchmarks: no existen métricas de calidad, velocidad ni memoria; la única prueba es una inspección visual de una imagen.
- Android CPU/GPU no validado: el rendimiento en teléfono, los requisitos de memoria y el comportamiento del runtime en dispositivo son desconocidos.
- TPU de Google Tensor no validada y bundle no compilado AOT para TPU.
- Parámetros fijados por el manifiesto: scheduler y número de pasos por defecto están cerrados, lo que limita el ajuste fino del proceso de muestreo.
- Resolución única de 512 × 512: no se documenta soporte de otras resoluciones o relaciones de aspecto.
- Reproducibilidad relativa: distintas implementaciones del runtime pueden producir imágenes diferentes con la misma semilla entera; la paridad con el modelo original se comprueba con ruido PyTorch de exportación, no con la inferencia normal.
- Riesgo de alucinación visual y sesgos: al heredar los pesos de SDXL-Turbo, arrastra los sesgos y fallos del modelo base; deben consultarse las model cards originales para uso previsto y limitaciones.
- Licencia: los pesos mantienen la Stability AI Community License con sus condiciones de uso y uso comercial; no se relicencian como Apache 2.0. Es obligatorio revisar `LICENSE.md` antes de cualquier despliegue comercial.
- Uso incorrecto del pipeline: una llamada aislada a un grafo con entradas aleatorias no genera una imagen con sentido; es necesario ejecutar el pipeline completo.
- Coste de integración: las cargas de grafo, la compilación y las copias de tensores host pueden dominar el tiempo total en dispositivos modestos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/frankdu/SDXL-Turbo-LiteRT
- Modelo base: https://huggingface.co/stabilityai/sdxl-turbo
- Revisión concreta del modelo base utilizada: https://huggingface.co/stabilityai/sdxl-turbo/tree/71153311d3dbb46851df1931d3ca6e939de83304
- Licencia del modelo: LICENSE.md (incluido en el repositorio)
- Licencia del código auxiliar: CODE_LICENSE (incluido en el repositorio)
- Model card del modelo original: SOURCE_MODEL_CARD.md (incluido en el repositorio)
- Informe de validación: validation.json (incluido en el repositorio)
- Plan de ejecución de tensores: manifest.json (incluido en el repositorio)
- Imagen de ejemplo: example.png (incluida en el repositorio)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
