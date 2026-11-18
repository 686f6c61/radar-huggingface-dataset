# moonbox-dev/Seed-VC-v2-ONNX

## Resumen

Seed-VC v2 ONNX es una exportación a formato ONNX del modelo Seed-VC v2, un sistema de conversión de voz zero-shot desarrollado originalmente por Plachta. La conversión de voz (voice conversion) consiste en reescribir una grabación de audio con la identidad vocal de un hablante de referencia de pocos segundos, preservando el contenido lingüístico y la cadencia temporal del audio original. Esta versión, publicada por moonbox-dev, reempaqueta el modelo en cinco grafos ONNX más un runtime en Python basado en numpy, pensado para inferencia en dispositivo con ONNX Runtime sobre CPU, CUDA y DirectML.

La relevancia de esta ficha radica en que elimina la dependencia de PyTorch para el despliegue, lo que facilita la integración en aplicaciones nativas, entornos embebidos y pipelines multiplataforma. El repositorio ocupa 1,1 GB e incluye dos precisiones (fp16 e int8), con el grafo de contenido (HuBERT-large + cuantizador esférico) como el componente más pesado (519,3 MB).

El modelo produce audio a 22,05 kHz y reproduce la configuración por defecto del `inference_v2.py` oficial: 30 pasos de difusión, guía de inteligibilidad y similitud de 0,7 y `convert_style` desactivado. La licencia es GPL-3.0, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: HuBERT-large (capas 1-18) + cuantizador esférico binario para contenido; CAM++ para estilo; DiT de 13 capas para estimación de velocidad; BigVGAN v2 como vocoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; tokens de contenido a 50 Hz) |
| Tipos de cuantizacion | fp16 e int8 (con `content.onnx` en fp16 en ambos casos) |
| Idiomas soportados | no disponible (el benchmark cubre inglés y chino) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (grafos) + `.npy` (base mel) + `pipeline.py` |
| Frecuencia de salida | 22,05 kHz |
| Tamano del repo | 1,1 GB |
| Pasos de difusion | 30 (por defecto) |

## Arquitectura y entrenamiento

El pipeline se compone de cinco grafos ONNX. `content.onnx` recibe audio normalizado a 16 kHz y extrae tokens de contenido ASTRAL mediante HuBERT-large (capas 1-18), un cuello de botella ConvNeXt y un cuantizador esférico binario, produciendo 2048 códigos a 50 Hz. `campplus.onnx` procesa un fbank Kaldi de 80 bins de la referencia para generar un vector de estilo de 192 dimensiones. `regulator.onnx` repite los tokens de contenido a la longitud mel y genera la condición del DiT de 512 dimensiones. `estimator.onnx` es el DiT de 13 capas que estima la velocidad del flujo, ejecutado con batch B=3 para incorporar ambas guías en una sola llamada. Finalmente, `vocoder.onnx` es BigVGAN v2 con 80 bandas y sobremuestreo 256x.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o si hubo RLHF/DPO en la información proporcionada. El modelo base es Plachta/Seed-VC, y la exportación ONNX reproduce fielmente la inferencia oficial v2 con 30 pasos de difusión y guías de 0,7. La innovación principal de esta versión es la portabilidad: el runtime `pipeline.py` sustituye PyTorch por numpy para las operaciones auxiliares (features, remuestreo, pasos de conversión).

## Capacidades

- Conversión de voz zero-shot: reescribe una grabación con la identidad vocal de una referencia de pocos segundos.
- Preservación de contenido lingüístico y timing: mantiene las palabras y la cadencia del audio fuente.
- Salida de audio a 22,05 kHz mediante BigVGAN v2.
- Soporte multilingüe: el benchmark evalúa inglés (LibriSpeech) y chino (AISHELL-1).
- Inferencia en dispositivo con ONNX Runtime sobre CPU, CUDA y DirectML.
- Dos precisiones disponibles (fp16 e int8) con calidad medida frente al modelo PyTorch original.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de visión, audio de entrada como texto ni modo thinking.

## Casos de uso

- Doblaje y localización de contenido: reescribir la voz de un actor con la identidad de otro hablante manteniendo el timing original, útil para adaptar vídeos a mercados con voces locales.
- Anonimización de voz en producción: convertir grabaciones sensibles a una voz de referencia para proteger la identidad del hablante antes de publicar o compartir datos.
- Prototipado de asistentes de voz personalizados: generar muestras con una voz de marca concreta a partir de pocos segundos de referencia, sin entrenamiento adicional.
- Investigación en conversión de voz: servir como baseline ONNX reproducible para comparar con otras arquitecturas sin depender de PyTorch.
- Aplicaciones de accesibilidad: dar a usuarios con dificultades del habla una voz sintética consistente a partir de una referencia grabada.
- Despliegue embebido y multiplataforma: integrar la conversión de voz en aplicaciones de escritorio o dispositivos con DirectML/CPU gracias a ONNX Runtime, sin GPU dedicada.
- Generación de datasets de voz aumentados: crear variaciones de identidad vocal sobre un mismo corpus para aumentar la diversidad de datos de entrenamiento.

## Benchmarks y rendimiento

Los datos provienen del conjunto de conversión de voz de Moonbox (LibriSpeech en inglés y AISHELL-1 en chino, cada uno convertido a una voz objetivo inglesa y otra china). Se compara contra el modelo PyTorch original.

| Metrica | fp16 | int8 (content fp16) | Original PyTorch |
|---|---|---|---|
| WER (ingles) | 2,6 % | 2,6 % | 2,1 % |
| CER (chino) | 27,1 % | 22,9 % | 27,1 % |
| Similitud de hablante (EN/ZH) | 0,906 / 0,932 | 0,901 / 0,930 | 0,898 / 0,930 |
| DNSMOS (EN/ZH) | 3,12 / 3,06 | 3,17 / 3,14 | 3,18 / 3,12 |
| RTF (CUDA) | 0,43 | 0,65 | no disponible |

El RTF (real-time factor) de 0,43 en fp16 con CUDA indica que el modelo procesa audio más rápido que tiempo real en GPU. La versión int8 es más lenta (RTF 0,65) pese a ser más ligera, probablemente por la sobrecarga de las operaciones cuantizadas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el grafo más pesado es `content.onnx` (519,3 MB en fp16), por lo que la inferencia completa cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU compatible con CUDA (RTX 3060 o superior) o DirectML en Windows; el RTF de 0,43 se midió en CUDA.
- Cabe en GPU consumer: sí, dado el tamaño del repo (1,1 GB) y el mayor grafo de 519,3 MB.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) mediante el `pipeline.py` incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: RTF 0,43 en fp16/CUDA y 0,65 en int8/CUDA; no se proporcionan datos para CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Seed-VC v2 ONNX (este) | Conversión de voz zero-shot | no disponible | no disponible | GPL-3.0 | ONNX | Exportación portable, fp16/int8, 22,05 kHz |
| Seed-VC v2 (Plachta) | Conversión de voz zero-shot | no disponible | no disponible | no disponible | PyTorch | Modelo base original |
| RVC (Retrieval-based Voice Conversion) | Conversión de voz | no disponible | no disponible | MIT (según versión) | PyTorch/ONNX | Requiere entrenamiento por voz en muchos flujos |
| OpenVoice | Clonación de voz zero-shot | no disponible | no disponible | MIT (según versión) | PyTorch | Enfoque en clonación y control de estilo |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier uso comercial o distribución de productos derivados obliga a liberar el código bajo la misma licencia; esto puede ser incompatible con productos propietarios.
- Riesgo de uso malicioso: la conversión de voz zero-shot puede emplearse para suplantación de identidad o deepfakes; es responsabilidad del desplegador implementar consentimiento y controles.
- El CER en chino es elevado (22,9-27,1 %), lo que indica menor fidelidad en ese idioma frente al inglés (WER 2,6 %).
- No se dispone de información sobre sesgos demográficos, de acento o de género en el modelo.
- La versión int8 es más lenta en CUDA (RTF 0,65) que fp16 (0,43), por lo que la cuantización no siempre mejora la latencia.
- El repositorio no tiene descargas ni likes y fue creado en 2026, por lo que su madurez y soporte comunitario son limitados.
- No se especifican los idiomas soportados oficialmente más allá del benchmark en inglés y chino.
- El modelo no es un LLM: no soporta texto, tool calling ni razonamiento; su única función es audio-audio.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/Seed-VC-v2-ONNX
- Modelo base: https://huggingface.co/Plachta/Seed-VC
- Repositorio oficial de Seed-VC: https://github.com/Plachtaa/seed-vc
- Paper Seed-VC (arXiv:2411.09943): https://arxiv.org/abs/2411.09943
- Paper relacionado (arXiv:2406.02430): https://arxiv.org/abs/2406.02430
