# linoyts/pjit-21k-ONNX

## Resumen

P-JiT 21K ONNX es la exportación a ONNX e int8 del modelo de difusión de espacio de píxeles Linum-AI/pjit-21k, un transformer de difusión (DiT) de 2.200 millones de parámetros que genera imágenes directamente en el espacio de píxeles, sin un autoencoder latente intermedio. Lo desarrolla el usuario linoyts a partir del modelo original de Linum-AI y del codificador de texto Qwen/Qwen3.5-4B, con el objetivo de ejecutar la generación de imágenes íntegramente en el navegador mediante onnxruntime-web y WebGPU.

La relevancia de esta ficha reside en que demuestra un pipeline completo de texto a imagen cuantizado a int8 que cabe en unos 5,8 GB de descarga y requiere aproximadamente 7 GB de memoria de GPU con soporte de `shader-f16`. El repositorio incluye el codificador de texto truncado tras la capa 27, el transformer DiT completo, el tokenizador, el planificador Euler y el guiado adaptativo proyectado, todo con configuraciones que documentan entradas, salidas y plantilla de prompt.

Se trata de una conversión de formato y cuantización, no de un modelo entrenado desde cero: la relación declarada con el modelo base es `quantized`. El modelo está pensado para despliegues ligeros en cliente (navegador de escritorio con Chrome o Edge) más que para servidores de alta concurrencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) en espacio de píxeles, con codificador de texto Qwen3.5-4B truncado |
| Parámetros totales | 2.200 millones (transformer DiT); codificador de texto Qwen3.5-4B truncado tras la capa 27 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud de prompt limitada por el codificador de texto; no se especifica cifra) |
| Tipos de cuantización | int8 (`MatMulNBits`, bloque 128, asimétrico, matemática fp16); tabla de embeddings int4; el original del codificador de texto es fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos con `config.json` por componente) |

## Arquitectura y entrenamiento

El transformer es un DiT de espacio de píxeles de 2.200 millones de parámetros. La exportación divide el grafo en componentes: `patch_embed`, `time_embed`, `text_proj`, dos bloques refinadores de imagen, dos bloques refinadores de texto, 22 bloques principales y `head`. El codificador de texto procede de onnx-community/Qwen3.5-4B-ONNX en fp16; su grafo se corta tras la capa 27 y las salidas de las capas 7, 15 y 27 se concatenan para formar una representación de `[1, L, 7680]` que consume el DiT.

La cuantización aplica `MatMulNBits` int8 (bloque 128, asimétrico, matemática fp16) a las capas lineales. El autor documenta que int4 degrada demasiado la calidad: con transformer int4 las imágenes alcanzan 18-20 dB PSNR frente al original, y con codificador de texto int4 unos 23-30 dB. No se proporcionan datos sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO); esa información corresponde al modelo base Linum-AI/pjit-21k y no está incluida en la información disponible.

El muestreo usa Euler sobre pasos temporales uniformes (`t = linspace(1, 0, 51)` para 50 pasos), partiendo de ruido a escala 4, con guiado adaptativo proyectado (escala 15, momento -0,75, reescalado 10). En cada paso se redondea el estado a bf16, se ejecutan `time_embed`, `patch_embed` y los refinadores de imagen una vez, y para el prompt y el negativo se ejecutan `text_proj`, los refinadores de texto, los 22 bloques sobre `[tokens de imagen | tokens de texto]` y `head`, que predice la imagen limpia; las dos predicciones se convierten en velocidades `(x - x0) / t` y se combinan con el guiado antes del paso Euler.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en espacio de píxeles, sin decodificador latente separado.
- Ejecución en navegador mediante onnxruntime-web sobre WebGPU, con soporte de `shader-f16`.
- Codificación de prompt con plantilla de chat de Qwen3.5-4B y prompt negativo para guiado.
- Muestreo configurable por número de pasos (el ejemplo documentado usa 50 pasos a 1024 px y 4 pasos a 512 px).
- Guiado adaptativo proyectado con parámetros ajustables (escala, momento, reescalado).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.

## Casos de uso

- Demostración interactiva en navegador: el pipeline completo cabe en unos 5,8 GB de descarga y requiere unos 7 GB de memoria de GPU, lo que permite ofrecer generación de imágenes en una Space de Hugging Face sin backend de inferencia dedicado.
- Prototipado de interfaces de generación de imágenes en cliente: al ejecutarse con onnxruntime-web y WebGPU, se puede integrar en aplicaciones web de escritorio (Chrome o Edge) sin enviar el prompt a un servidor.
- Evaluación de cuantización int8 en difusión de espacio de píxeles: el repositorio incluye verificaciones de PSNR y coseno que sirven como referencia para comparar exportaciones propias.
- Pruebas de privacidad por diseño: la inferencia local en el navegador evita transmitir captions o imágenes a infraestructura externa, útil en entornos con requisitos de confidencialidad.
- Investigación sobre DiT en espacio de píxeles: los grafos separados por componente (`patch_embed`, refinadores, bloques, `head`) facilitan el análisis y la sustitución de módulos individuales.
- Generación de imágenes de baja resolución y pocos pasos para iteración rápida: el pipeline documentado a 512 px y 4 pasos permite ciclos cortos en hardware de consumo con WebGPU.
- Base para conversiones a otros runtimes: al estar en ONNX con `config.json` por componente, se puede reutilizar en otros motores que acepten ONNX, aunque no se documenta soporte oficial fuera de onnxruntime-web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica verificaciones de fidelidad de la exportación:

| Comprobación | Resultado |
|---|---|
| Codificador de texto frente a Qwen3.5-4B fp32 (ejecución oficial bf16: 0,9999) | coseno 0,9990 a 0,9997 |
| Corte del grafo del codificador de texto, mismos pesos int4 en PyTorch y ONNX | coseno 0,9986 a 0,9997 |
| Una pasada del transformer frente a fp32 (autocast bf16 oficial frente a fp32) | error relativo 0,012 a 0,036 (0,010 a 0,040) |
| Muestreador completo, transformer int8 y codificador int8 simulados, frente al original | 33 a 39 dB PSNR |
| Pipeline JavaScript (CPU), 512 px, 4 pasos, mismo ruido | 39 dB PSNR |
| Pipeline JavaScript (CPU), 1024 px, 50 pasos, codificador propio, mismo ruido | 35,7 dB PSNR |

## Requisitos de hardware

- Memoria de GPU: aproximadamente 7 GB según el autor, con soporte de `shader-f16` obligatorio.
- Navegador: WebGPU en Chrome o Edge de escritorio; no se documenta soporte en móvil ni en Safari.
- Descarga: unos 5,8 GB (repositorio de 5,9 GB); el codificador de texto ocupa 3,6 GB y el transformer 2,2 GB.
- GPU de consumo: no se enumeran modelos concretos; el requisito es una GPU con WebGPU y 7 GB de memoria, lo que excluye muchas integradas y limita a dedicadas de gama media-alta o superior.
- Despliegue: onnxruntime-web sobre WebGPU como vía documentada; no se documenta vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles; las verificaciones se hicieron en CPU de ONNX Runtime y en el pipeline JavaScript, sin cifras de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| linoyts/pjit-21k-ONNX | 2.200 M (DiT) + codificador Qwen3.5-4B truncado | no disponible | ONNX int8 | Apache-2.0 | Hugging Face, Space WebGPU |
| Linum-AI/pjit-21k (original) | 2.200 M (DiT) | no disponible | no disponible en la información | Apache-2.0 (según el autor) | Hugging Face |
| Qwen/Qwen3.5-4B (codificador de texto) | 4.000 M | no disponible | no disponible en la información | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas de texto a imagen en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Es una conversión cuantizada, no un modelo nuevo: la calidad depende del original Linum-AI/pjit-21k y de la pérdida introducida por int8 (33-39 dB PSNR frente al original en simulación).
- El autor advierte que int4 degrada notablemente la calidad (18-20 dB PSNR con transformer int4), por lo que no se recomienda bajar de int8.
- Requiere WebGPU y `shader-f16`; sin ello el pipeline no funciona en el navegador. El soporte se limita a Chrome y Edge de escritorio según la model card.
- El codificador de texto está truncado tras la capa 27 y usa una tabla de embeddings int4, lo que puede afectar a la fidelidad semántica de prompts complejos.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos específicos de alucinación visual; al ser un modelo de difusión, la fidelidad al prompt no está garantizada.
- La licencia es Apache-2.0, lo que permite uso comercial, pero se debe consultar `LICENSE` y `NOTICE` del repositorio para las condiciones exactas de atribución.
- No hay información sobre el entrenamiento original ni sobre el rendimiento en servidores; para producción a gran escala esta exportación no es la vía adecuada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/linoyts/pjit-21k-ONNX
- Demo WebGPU: https://huggingface.co/spaces/linoyts/pjit-21k-WebGPU
- Modelo base: https://huggingface.co/Linum-AI/pjit-21k
- Codificador de texto original: https://huggingface.co/Qwen/Qwen3.5-4B
- Codificador de texto ONNX de referencia: https://huggingface.co/onnx-community/Qwen3.5-4B-ONNX
