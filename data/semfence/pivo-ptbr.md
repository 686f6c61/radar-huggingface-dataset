# semfence/pivo-ptbr

## Resumen

pivo-ptbr es un modelo de síntesis de voz (text-to-speech) en portugués de Brasil desarrollado por SemFence, con el investigador Gustavo Toledo como responsable. Se trata de un modelo minúsculo, de 1.401.494 parámetros en total, que sigue la receta del PiVo-1.4M de Empero Research aplicada al portugués brasileño. El modelo consta de dos componentes: un modelo acústico de 584.897 parámetros entrenado desde cero por SemFence y un vocoder FARGAN de 816.597 parámetros que se toma congelado del PiVo y no se reentrena.

La relevancia del modelo radica en su extrema ligereza: 5,8 MB en formato ONNX y 2,3 MB el acústico en MLX, lo que permite ejecutarlo en CPU, en Mac con Apple Silicon mediante MLX y directamente en el navegador mediante WASM, a entre 20 y 40 veces el tiempo real. Ofrece dos voces sintéticas, `F_s4` (femenina) y `M_sm4` (masculina), con salida mono a 16 kHz y entrada de texto convertida a fonemas mediante el fonemizador dizione-ptbr de 55 símbolos.

El modelo está pensado exclusivamente para portugués de Brasil y no sirve para portugués de Portugal ni para otras lenguas. Su licencia es CC BY 4.0 para el componente acústico (con atribución obligatoria a SemFence y Gustavo Toledo), BSD-3-Clause para el vocoder y Apache-2.0 para el código. Es una opción adecuada para despliegues en dispositivos con recursos muy limitados, aplicaciones de accesibilidad offline y entornos donde la privacidad impide enviar texto a servidores externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acústico propio (entrenado desde cero) + vocoder FARGAN congelado del PiVo; pipeline texto a fonemas a features acústicas a audio |
| Parametros totales | 1.401.494 (acústico 584.897 + vocoder 816.597) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32 para MLX; grafos ONNX exportados) |
| Idiomas soportados | portugués de Brasil (pt-BR) únicamente |
| Licencia | Acústico: CC BY 4.0 (atribución obligatoria: SemFence, Gustavo Toledo); vocoder: BSD-3-Clause; código: Apache-2.0 |
| Formato de pesos | MLX (safetensors), ONNX (4 grafos), PyTorch (`.pt`) |
| Frecuencia de salida | 16 kHz, mono |
| Entrada | Texto convertido a fonemas por dizione-ptbr (55 símbolos) |
| Voces | `F_s4` (femenina), `M_sm4` (masculina), sintéticas |
| Tamaño en disco | 5,8 MB en ONNX; 2,3 MB acústico MLX; 3,3 MB vocoder MLX; 2,4 MB PyTorch |
| Velocidad | 20 a 40 veces el tiempo real |

## Arquitectura y entrenamiento

El modelo se compone de un acústico propio y un vocoder FARGAN heredado del PiVo. El acústico, de 584.897 parámetros, se entrenó desde cero sin pesos preentrenados y se distribuye en su paso 20.000 de entrenamiento. El vocoder FARGAN, de 816.597 parámetros, se toma congelado del PiVo y no fue entrenado por SemFence. El pipeline convierte el texto en fonemas mediante dizione-ptbr, que produce 55 símbolos; el encoder ONNX genera codificación por fonema y duración, el decoder causal con caché produce 20 features por cada cuadro de 10 ms, y el vocoder sintetiza la señal de audio a partir del condicionamiento y pasos de 40 muestras.

El entrenamiento se apoyó en dos datasets publicados por el propio autor: `semfence/ptbr-synthetic-speech` y `semfence/ptbr-sentences`. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica principal es la extrema compresión del modelo (1,4 M de parámetros) manteniendo inteligibilidad en portugués brasileño, junto con la exportación a múltiples backends (MLX, ONNX, PyTorch) que habilita ejecución en CPU, Apple Silicon y navegador vía WASM. El repositorio incluye código de preparación, entrenamiento y exportación en el directorio `code/`.

## Capacidades

- Síntesis de voz en portugués de Brasil a partir de texto, con salida mono a 16 kHz.
- Dos voces sintéticas seleccionables: `F_s4` (femenina) y `M_sm4` (masculina).
- Conversión de texto a fonemas mediante dizione-ptbr, con 55 símbolos, incluyendo manejo de números, fechas, horas y cantidades monetarias en los ejemplos publicados.
- Ejecución en CPU, en MLX sobre Apple Silicon y en navegador mediante WASM.
- Rendimiento de 20 a 40 veces el tiempo real.
- Procesamiento local: en la demo de navegador, el texto no sale del dispositivo del usuario.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente de TTS.
- No dispone de modo thinking, visión ni audio de entrada.
- No soporta otras lenguas ni portugués de Portugal.

## Casos de uso

- Lectura de contenido web en el navegador: el modelo puede ejecutarse vía WASM en la propia página y leer artículos o notificaciones en portugués de Brasil sin enviar el texto a un servidor, lo que encaja con su tamaño de 5,8 MB en ONNX y su velocidad de 20 a 40 veces el tiempo real.
- Accesibilidad para personas con discapacidad visual: integrado en aplicaciones de escritorio o móviles, permite convertir texto en voz en local con dos voces disponibles, sin depender de conectividad ni de servicios en la nube.
- Asistentes de voz offline en dispositivos embebidos: su reducido tamaño (1,4 M de parámetros) y la ejecución en CPU lo hacen viable en hardware con recursos limitados para dar respuestas habladas en portugués brasileño.
- Sistemas de anuncios y avisos en comercios o transporte: lectura automatizada de mensajes, incluyendo números, fechas y precios, como muestran los ejemplos de la model card con horas, fechas y valores en reales.
- Prototipado rápido de interfaces de voz: al distribuirse en MLX, ONNX y PyTorch, permite integrar TTS en prototipos de Mac con Apple Silicon o en pipelines Python sin infraestructura de GPU.
- Generación de audiolibros o contenido narrado de bajo coste: la voz femenina y masculina permiten alternar narradores en textos largos en portugués de Brasil, con procesamiento local y sin coste por petición.
- Privacidad en aplicaciones sanitarias o legales: al no requerir envío de texto a terceros, puede usarse para leer información sensible en voz alta dentro del propio dispositivo.

## Benchmarks y rendimiento

La model card incluye un directorio `eval/` con WER por clipe y transcripciones, pero no se han publicado en la información disponible los valores numéricos de dichos resultados ni comparaciones con otros modelos. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo completo ocupa 5,8 MB en ONNX y 5,6 MB en MLX (acústico más vocoder), por lo que cabe en memoria de cualquier dispositivo.
- GPU recomendadas: no requiere GPU; funciona en CPU. En Apple Silicon se ejecuta mediante MLX.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada; también en navegador mediante WASM.
- Opciones de despliegue: MLX (Mac con Apple Silicon), ONNX Runtime (CPU y WASM en navegador), PyTorch; el repositorio incluye `code/speak.py` para MLX y ONNX.
- Latencia y throughput: 20 a 40 veces el tiempo real según el autor; no se detallan valores absolutos de latencia por frase.
- Almacenamiento: menos de 6 MB para los grafos ONNX y menos de 6 MB para los pesos MLX.

## Comparativa con modelos similares

| Modelo | Parámetros | Salida | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| pivo-ptbr (SemFence) | 1,4 M (acústico 584.897 + vocoder 816.597) | 16 kHz, mono | pt-BR | CC BY 4.0 (acústico), BSD-3 (vocoder) | MLX, ONNX, PyTorch |
| tiny-voca-ptbr (SemFence) | 4,5 M | 24 kHz | pt-BR | no disponible en la información proporcionada | no disponible en la información proporcionada |
| PiVo-1.4M (Empero Research) | 1,4 M | no disponible | no disponible | no disponible | no disponible |

El modelo hermano tiny-voca-ptbr, del mismo autor, es la alternativa directa dentro del ecosistema SemFence, con 4,5 M de parámetros y salida a 24 kHz. El PiVo-1.4M de Empero Research es la referencia original de la que se toma el vocoder y la receta. No se dispone de datos de benchmarks comparativos entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en portugués de Brasil; no sirve para portugués de Portugal ni para otras lenguas.
- Las dos voces son sintéticas y no se especifican sus características prosódicas más allá de los ejemplos publicados.
- No se han publicado métricas numéricas de calidad (WER, MOS) en la información disponible, solo la existencia de un directorio `eval/` con WER por clipe.
- El vocoder FARGAN procede del PiVo y no fue entrenado por SemFence; sus limitaciones heredadas no se detallan.
- La licencia del acústico es CC BY 4.0 con atribución obligatoria a SemFence y Gustavo Toledo; el vocoder es BSD-3-Clause y el código Apache-2.0, por lo que el uso comercial exige respetar las tres licencias y créditos.
- Riesgo de alucinación no aplicable en el sentido de generación de texto libre, pero sí de errores de pronunciación en palabras fuera del vocabulario fonético o en números y fechas complejas.
- No se especifican sesgos conocidos ni limitaciones de contexto; al ser un modelo de TTS no gestiona conversaciones multi-turno.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción aún muy limitada.
- No se detallan requisitos de cuantización ni versiones cuantizadas; los pesos MLX están en float32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/semfence/pivo-ptbr
- Demo en el navegador: https://huggingface.co/spaces/semfence/pivo-ptbr-demo
- Modelo hermano tiny-voca-ptbr: https://huggingface.co/semfence/tiny-voca-ptbr
- Fonemizador dizione-ptbr (Python): https://github.com/SemFence/dizione-ptbr
- Fonemizador dizione-ptbr (TypeScript): https://github.com/SemFence/dizione-ptbr-js
- Dataset ptbr-synthetic-speech: https://huggingface.co/datasets/semfence/ptbr-synthetic-speech
- Dataset ptbr-sentences: https://huggingface.co/datasets/semfence/ptbr-sentences
- Modelo de referencia PiVo-1.4M: https://huggingface.co/empero-ai/PiVo-1.4M
