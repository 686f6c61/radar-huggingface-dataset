# cchiou-amba/DSCNN

## Resumen

DSCNN es una red neuronal convolucional de convoluciones separables en profundidad (depthwise separable convolutions) disenada para la deteccion de palabras clave (keyword spotting, KWS) sobre clips de audio de 1 segundo a 16 kHz. El modelo se entrena sobre el dataset Google Speech Commands v0.02 y clasifica cada clip en una de 12 clases: `silence`, `unknown`, `yes`, `no`, `up`, `down`, `left`, `right`, `on`, `off`, `stop` y `go`. La arquitectura procede del paper "Hello Edge: Keyword Spotting on Microcontrollers" (arXiv:1711.07128) y de la implementacion de referencia de Arm (ML-KWS-for-MCU).

Este repositorio concreto no contiene los pesos en formato generico de PyTorch, sino una compilacion del modelo original para el SoC Ambarella N1-655 con arquitectura CVflow v3. El autor (cchiou-amba) ha transpuesto la entrada a formato NCHW `[1, 1, 49, 10]` en FP16 IEEE y ha compilado el grafo mediante el SDK Ambarella Cooper (CNNGen 3.9.0, `cavalry_gen` 3.0.4) en un binario DAG propietario (`n1-655_kws_dscnn_amba_optimized.bin`).

Es relevante para desarrolladores que trabajen con inferencia en el borde (edge AI) sobre hardware Ambarella, ya que permite desplegar un clasificador de voz de bajisimo coste computacional directamente en el acelerador CVflow. No es un modelo de lenguaje ni un transformer: es una CNN pequena para una tarea de clasificacion de audio cerrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con convoluciones separables en profundidad (DS-CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 1 s de audio) |
| Tipos de cuantizacion | FP16 IEEE (formato de entrada y salida); no se documentan otras |
| Idiomas soportados | no disponible (clases de palabras en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Binario DAG propietario de Ambarella (`.bin`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es una DS-CNN del paper "Hello Edge", pensada para microcontroladores y dispositivos de bajo consumo. La entrada es un tensor `[1, 1, 49, 10]` en FP16 que representa caracteristicas acusticas extraidas de 1 segundo de audio a 16 kHz: ventana de 40 ms, salto de 20 ms, 40 bins Mel HTK entre 20 y 4000 Hz y los 10 primeros coeficientes MFCC via DCT-II. La salida es un vector `[1, 12]` en FP16 con las 12 clases de Speech Commands.

El entrenamiento se realizo sobre Google Speech Commands v0.02 (CC-BY-4.0). No se dispone de informacion sobre el numero de tokens, composicion exacta del dataset ni sobre el uso de tecnicas de refinamiento (RLHF/DPO), que en cualquier caso no aplican a este tipo de modelo. La innovacion tecnica de este repositorio es el port: transposicion de layout a NCHW, compilacion con CNNGen 3.9.0 para CVflow v3 (`vdg_arch = 0xB`) y generacion de un binario DAG optimizado para el N1-655.

## Capacidades

- Clasificacion de audio de 1 segundo en 12 clases cerradas de palabras clave en ingles.
- Deteccion de palabras de activacion tipo wake word (`yes`, `no`, `up`, `down`, `left`, `right`, `on`, `off`, `stop`, `go`).
- Distincion entre `silence` y `unknown` frente a palabras conocidas.
- Inferencia en el acelerador CVflow del SoC Ambarella N1-655.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; las clases estan definidas en ingles.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Wake word en dispositivos empotrados: el modelo clasifica clips de 1 s y puede usarse como etapa de deteccion de palabras de activacion (`yes`, `stop`, `go`) en camaras, wearables o electrodomesticos con SoC Ambarella N1-655, aprovechando la compilacion nativa para CVflow.
- Control por voz de comandos discretos: mapear las clases `up`, `down`, `left`, `right`, `on`, `off` a acciones de interfaz en dispositivos sin pantalla ni teclado.
- Prefiltrado en pipelines de voz: usar el modelo como primera etapa para descartar audio irrelevante (`silence`, `unknown`) antes de enviar el flujo a un reconocedor de voz completo, reduciendo consumo y ancho de banda.
- Deteccion de eventos acusticos simples en vigilancia: identificar comandos o palabras clave en grabaciones continuas segmentadas en ventanas de 1 s, con bajo coste energetico en el borde.
- Prototipado de KWS en hardware Ambarella: validar la cadena de compilacion CNNGen y el runtime CVflow antes de portar modelos KWS mas grandes o personalizados.
- Docencia e investigacion en edge AI: ejemplo reproducible de un modelo de referencia (Arm ML-KWS-for-MCU) llevado a un acelerador comercial, util para estudiar el flujo de cuantizacion y compilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo no esta pensado para GPU, sino para el acelerador CVflow del SoC Ambarella N1-655.
- GPU recomendadas: no aplica; no se documenta ejecucion en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el artefacto publicado es un binario DAG propietario, no ejecutable en CUDA.
- Opciones de despliegue: runtime CVflow de Ambarella sobre N1-655; SDK Cooper (CNNGen 3.9.0, `cavalry_gen` 3.0.4). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DSCNN (este repo) | no disponible | 1 s de audio, 49x10 features | KWS 12 clases | Apache-2.0 | Binario Ambarella N1-655 |
| EclipseAidge/ds_cnn | no disponible | 1 s de audio | KWS 12 clases | Apache-2.0 | Pesos originales en Hugging Face |
| Arm ML-KWS-for-MCU (referencia) | no disponible | 1 s de audio | KWS 12 clases | Apache-2.0 | Repositorio GitHub |
| Google Speech Commands baseline (paper Hello Edge) | no disponible | 1 s de audio | KWS 12 clases | CC-BY-4.0 (dataset) | Paper y codigo de referencia |

## Limitaciones y advertencias

- Modelo de proposito muy especifico: solo clasifica 12 clases cerradas en ingles; no generaliza a vocabulario abierto ni a otros idiomas.
- El artefacto publicado es un binario DAG propietario para Ambarella N1-655; no es portable a otras plataformas sin recompilar desde los pesos originales.
- Riesgo de confusion entre clases acusticamente proximas y de falsos positivos en entornos ruidosos; no se documentan metricas de precision ni recall.
- No se documentan sesgos especificos, pero el dataset Speech Commands tiene una distribucion demografica y acustica concreta que puede limitar el rendimiento en dominios distintos.
- Licencia Apache-2.0 permite uso comercial, pero el aviso de modificacion (Seccion 4(b)) obliga a conservar la atribucion a Arm, MLCommons y Eclipse Aidge, y a Google por el dataset.
- El uso del SDK Cooper y del runtime CVflow puede estar sujeto a los terminos de Ambarella, independientemente de la licencia del modelo.
- No apto para tareas generativas, razonamiento ni procesamiento de lenguaje natural.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cchiou-amba/DSCNN
- Binario compilado: https://huggingface.co/cchiou-amba/DSCNN/blob/main/n1-655_kws_dscnn_amba_optimized.bin
- Paper original: https://arxiv.org/abs/1711.07128
- Implementacion de referencia Arm: https://github.com/ARM-software/ML-KWS-for-MCU
- Pesos originales: https://huggingface.co/EclipseAidge/ds_cnn
- Dataset Google Speech Commands v0.02: https://arxiv.org/abs/1804.03209 (referencia del dataset; no se enlaza pagina oficial en la informacion disponible)
