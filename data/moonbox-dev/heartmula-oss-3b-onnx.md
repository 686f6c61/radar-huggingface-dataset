# moonbox-dev/HeartMuLa-oss-3B-ONNX

## Resumen

HeartMuLa-oss-3B-ONNX es la conversión a formato ONNX del modelo HeartMuLa-oss-3B, un sistema de generación de música y canciones a partir de texto desarrollado por Moonbox. Esta variante, publicada por el mismo equipo, empaqueta los grafos del modelo y del códec de audio para su ejecución con ONNX Runtime en CPU, CUDA y DirectML, lo que facilita el despliegue en dispositivos locales sin depender de PyTorch.

El modelo resuelve el problema de la síntesis de audio musical condicionada por texto: dado un prompt descriptivo, genera una pieza musical o canción codificada mediante HeartCodec, el códec neuronal asociado. La conversión incluye dos precisiones (fp16 e int8) y una puntuación de fidelidad frente al modelo original basada en divergencia KL y acuerdo top-1 sobre los códigos generados, además de la relación señal-ruido del audio reconstruido por el códec.

Con aproximadamente 3B parámetros y una licencia Apache 2.0, el modelo resulta relevante para desarrolladores que necesitan integrar generación musical en aplicaciones de escritorio o entornos con aceleración heterogénea (DirectML en Windows, CUDA en Linux/Windows, CPU en cualquier plataforma). El repositorio ocupa 16,6 GB e incluye los grafos separados por componente (embed, decoder, depth, head, estimator, codec y scalar_dec) junto con un `pipeline.py` que orquesta el bucle de muestreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con códec neuronal (HeartCodec); grafos ONNX separados por componente |
| Parametros totales | 3B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 e int8 (backbone 8-bit con head, depth y codec en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `.onnx` con datos externos `.onnx.data`), más `tokenizer.json` y `muq.npy` |

## Arquitectura y entrenamiento

El modelo base HeartMuLa-oss-3B emplea una arquitectura de lenguaje autorregresivo que genera códigos de audio, los cuales son posteriormente decodificados por HeartCodec para producir la forma de onda musical. La conversión ONNX descompone el sistema en varios grafos: `embed` para las proyecciones de entrada, `decoder` para el cuerpo del transformer, `depth` y `head` para las cabezas de predicción por codebook, `estimator` para el componente de estimación, `codec_cond` y `scalar_dec` para el códec, y un `pipeline.py` que gestiona las características, el prompt, el bucle de muestreo y las ventanas del códec.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card de esta conversión se centra en la fidelidad numérica respecto al original: en fp16 se reporta una divergencia KL de 0,0001 nats (p95 0,0001) y un acuerdo top-1 del 99,0 % (99,7 % en el codebook 0), mientras que en int8 la KL es de 0,0002 nats (p95 0,0005) y el acuerdo top-1 del 98,3 % (99,3 % en el codebook 0). El códec mantiene 34,5 dB de SNR frente al audio del original en ambas precisiones.

## Capacidades

- Generación de música y canciones a partir de descripciones textuales (text-to-music y song generation).
- Síntesis de audio completo mediante el códec neuronal HeartCodec integrado en los grafos ONNX.
- Ejecución en CPU, CUDA y DirectML a través de ONNX Runtime y onnxruntime-genai.
- Dos niveles de precisión (fp16 e int8) con fidelidad verificada frente al modelo original.
- Inferencia en dispositivo (on-device) sin dependencia de PyTorch.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Generación musical en aplicaciones de escritorio: el pipeline ONNX permite integrar síntesis de canciones en apps nativas de Windows mediante DirectML, sin requerir una instalación de PyTorch ni GPUs de datacenter.
- Prototipado rápido de bandas sonoras: un desarrollador puede describir por texto el estilo y generar borradores musicales en local, usando la precisión fp16 para máxima fidelidad al modelo original.
- Despliegue en servidores sin GPU: la variante int8 y la compatibilidad con CPU de ONNX Runtime permiten ofrecer generación musical en entornos con recursos limitados, a costa de una ligera pérdida de fidelidad (KL 0,0002 nats).
- Herramientas creativas para músicos: integración en DAWs o editores de audio que necesiten generar secciones musicales condicionadas por prompt, aprovechando el `pipeline.py` como referencia de orquestación.
- Investigación en códecs neuronales: los grafos separados (`codec_cond`, `scalar_dec`) permiten estudiar y reutilizar el códec HeartCodec de forma aislada en experimentos de compresión o reconstrucción de audio.
- Evaluación comparativa de cuantización: el repositorio incluye métricas de fidelidad por precisión, lo que lo convierte en un banco de pruebas útil para medir el impacto de int8 frente a fp16 en modelos generativos de audio.
- Aplicaciones educativas y demos interactivas: el formato ONNX y el tamaño manejable del códec facilitan demos en navegador o en entornos embebidos con aceleración DirectML.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de fidelidad de la conversión frente al modelo original, no benchmarks de calidad musical absoluta.

| Precision | KL (nats) | KL p95 | Acuerdo top-1 | Acuerdo codebook 0 | SNR del códec | Throughput |
|---|---|---|---|---|---|---|
| fp16 | 0,0001 | 0,0001 | 99,0 % | 99,7 % | 34,5 dB | no disponible |
| int8 | 0,0002 | 0,0005 | 98,3 % | 99,3 % | 34,5 dB | 5,9 frames/s (CUDA) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es esperable al tratarse de un modelo de generación de audio y no de texto.

## Requisitos de hardware

- VRAM estimada: el grafo `decoder` en fp16 ocupa 5,64 GB y en int8 3,00 GB; el `estimator` añade 2,98 GB en fp16; el `embed` 1,19 GB en fp16 (596,2 MB en int8). El total en fp16 ronda los 10-11 GB de pesos, por lo que se recomienda al menos 12-16 GB de VRAM para inferencia cómoda en GPU.
- GPU recomendadas: RTX 4090 (24 GB) para fp16 sin problemas; RTX 3090/4080 (16-24 GB) para fp16; GPUs de 8-12 GB pueden usar la variante int8. En datacenter, A100 o H100 ofrecen margen sobrado.
- ¿Cabe en consumer GPU? Sí: la variante int8 (backbone 8-bit) está pensada para GPUs de gama media y también para CPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) y onnxruntime-genai, tal como indica la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: solo se reporta 5,9 frames/s en CUDA con la variante int8; no hay datos de latencia para fp16 ni para CPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables de generación musical (parámetros, contexto, rendimiento o licencia) para establecer una comparativa rigurosa. La comparación más directa es con el propio modelo original HeartMuLa-oss-3B, del que esta conversión es una versión cuantizada con fidelidad documentada (KL 0,0001-0,0002 nats, acuerdo top-1 del 98,3-99,0 %).

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HeartMuLa-oss-3B-ONNX | 3B | no disponible | Apache 2.0 | ONNX (fp16/int8) | Conversión on-device con fidelidad medida |
| HeartMuLa-oss-3B (original) | 3B | no disponible | Apache 2.0 | safetensors (presumiblemente) | Modelo de referencia en PyTorch |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la información disponible; al ser un modelo generativo de audio, puede reproducir estilos o patrones presentes en sus datos de entrenamiento.
- Riesgo de alucinación en el sentido de generar audio que no se corresponda fielmente con el prompt; no hay métricas de adherencia al prompt publicadas.
- La variante int8 introduce una pérdida medible de fidelidad (KL 0,0002 nats frente a 0,0001 en fp16; acuerdo top-1 98,3 % frente a 99,0 %), relevante en aplicaciones que exijan máxima calidad.
- No se especifican los idiomas soportados para los prompts de texto, lo que impide garantizar un comportamiento multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base HeartMuLa-oss-3B y del códec HeartCodec por si hubiera términos adicionales no reflejados aquí.
- El repositorio ocupa 16,6 GB y requiere descargar datos externos `.onnx.data` junto a los grafos; una gestión incorrecta de rutas puede impedir la carga.
- Solo se reporta throughput para int8 en CUDA (5,9 frames/s); el rendimiento en CPU o en fp16 no está documentado, por lo que la planificación de producción debe validarse empíricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/HeartMuLa-oss-3B-ONNX
- Modelo base: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- Paper de referencia (arXiv:2601.10547): https://arxiv.org/abs/2601.10547
- ONNX Runtime: https://onnxruntime.ai/
- onnxruntime-genai: https://github.com/microsoft/onnxruntime-genai
