# frankharrison/wavlm-base-plus-web

## Resumen

WavLM Base+ Web es una adaptación ONNX del modelo de extracción de características de audio `microsoft/wavlm-base-plus`, empaquetada específicamente para su uso con transformers.js en entornos web (navegador o Node.js). El modelo original, desarrollado por Microsoft Research, es un transformer preentrenado de forma autosupervisada sobre audio de voz muestreado a 16 kHz, diseñado para servir como extractor de representaciones acústicas reutilizables en tareas posteriores de procesamiento de habla. Esta versión concreta, publicada por el usuario `frankharrison`, no modifica la arquitectura ni los pesos más allá de la conversión a ONNX y una recuantización selectiva.

La aportación diferencial de esta ficha es la estrategia de cuantización: en lugar de aplicar cuantización dinámica a todos los operadores (incluidas las convoluciones del codificador de características), solo se cuantizan las multiplicaciones de matrices del transformer a 8 bits, manteniendo las convoluciones en fp32. Según la model card, esto evita la degradación que sufre el archivo `model_quantized.onnx` habitual en clips cortos de voz cantada, donde la cuantización de la primera convolución (que recibe la forma de onda cruda) destruye los sonidos de baja amplitud.

El modelo resuelve el problema de desplegar un extractor de embeddings de audio de calidad en el navegador con un tamaño de descarga contenido (116 MB) y una fidelidad respecto a fp32 notablemente superior a la alternativa estándar. Es relevante para desarrolladores que construyen aplicaciones web de análisis de audio, búsqueda por similitud acústica o clasificación de habla sin depender de servidores con GPU. No es un modelo generativo ni un sistema de reconocimiento de voz listo para usar: produce representaciones latentes que deben alimentar una cabeza de clasificación o un sistema posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (WavLM) con codificador convolucional de características; preentrenamiento autosupervisado |
| Parametros totales | no disponible (heredados de microsoft/wavlm-base-plus; el repo pesa 0,1 GB en ONNX cuantizado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada definida por la longitud del clip, no por tokens de texto) |
| Tipos de cuantizacion | ONNX con cuantización dinámica de tipo QUInt8 solo en operadores MatMul; convoluciones en fp32; se carga con `dtype: 'q8'` |
| Idiomas soportados | no disponible (modelo de características acústicas, independiente del idioma en su preentrenamiento) |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | ONNX (`model.onnx`); compatible con transformers.js; no se listan safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es WavLM, un transformer encoder con un front-end convolucional que transforma la forma de onda de audio a 16 kHz en una secuencia de representaciones latentes. El preentrenamiento es autosupervisado a gran escala sobre audio de habla, siguiendo el enfoque descrito en el paper *WavLM: Large-Scale Self-Supervised Pre-Training for Full Stack Speech Processing* (arXiv:2110.13900). El modelo no incluye tokenizador ni cabeza de clasificación: es un extractor de características que debe afinarse o combinarse con un cabezal para tareas concretas como reconocimiento de voz, diarización o clasificación de emociones.

Esta adaptación concreta no reentrena ni modifica los pesos. Parte de la conversión ONNX de `Xenova/wavlm-base-plus` (revisión `27b8ee283bf6c3a5ae77d7e90d8e40a6925288e2`, sha256 `07789ad4d9e01cba75fce7fd923e7a5e9a0aaf0f43df25ba6ee6d3d6d7adaa1c`) y recuantiza con onnxruntime 1.19.2 usando `quantize_dynamic` con `op_types_to_quantize=['MatMul']`, `weight_type=QuantType.QUInt8` y `per_channel=False`. Las convoluciones, incluida la convolución posicional, quedan intactas en fp32. El SHA256 del archivo de salida es `a976307be5c3e46ccc2f7e6925c46edfc6cd9c5e9e630c0f79bfae223849dd85`.

La innovación técnica declarada por el autor es la preservación de la fidelidad en la primera convolución: al no cuantizarla, se evita que cada muestra de la forma de onda se reescale a su propio pico de amplitud, lo que en la versión q8 estándar borra los sonidos débiles junto a los fuertes (consonantes en habla y canto). Según la model card, en clips cortos de 0,3–0,45 s de sílabas cantadas, los embeddings del q8 estándar quedaban a una mediana de 0,953 de coseno respecto a fp32 (peor caso 0,385), mientras que esta build alcanza una mediana de 0,99 y clasifica el mismo conjunto de prueba igual que fp32.

## Capacidades

- Extracción de embeddings de audio a partir de forma de onda a 16 kHz, orientada a tareas posteriores de clasificación, similitud y agrupamiento.
- Generación de representaciones latentes por capa (feature extraction), no de texto ni de transcripciones.
- Uso como base para fine-tuning en tareas de habla: reconocimiento automático de voz, diarización, detección de emociones, clasificación de eventos acústicos.
- Ejecución en navegador mediante transformers.js con backend WASM de onnxruntime-web.
- Soporte de búsqueda por similitud acústica y comparación de plantillas mediante distancia coseno.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües explícitas declaradas; el preentrenamiento es sobre audio y no depende de un vocabulario textual.
- No incluye modo thinking, visión ni audio generativo.

## Casos de uso

- Búsqueda por similitud de audio en el navegador: calcular embeddings de fragmentos de voz y compararlos por coseno contra una plantilla indexada, sin enviar audio a un servidor. La ventana de contexto no aplica; el límite es la longitud del clip procesable en memoria del navegador.
- Clasificación de habla en aplicaciones web offline-first: usar el modelo como extractor congelado y una cabeza ligera (por ejemplo, regresión logística o MLP pequeña) para detectar emociones, género o calidad de audio, aprovechando que el modelo cabe en 116 MB y se ejecuta en WASM.
- Verificación de locutor ligera: generar embeddings de segmentos cortos y medir similitud coseno para autenticación básica o agrupamiento de intervenciones, adecuado por la fidelidad declarada en clips de 0,3–0,45 s.
- Preprocesado de pipelines de ASR en el cliente: extraer características acústicas en el navegador y enviar solo los vectores al servidor, reduciendo ancho de banda y exposición de audio crudo, gracias a que las convoluciones en fp32 preservan las consonantes.
- Análisis de canto y prosodia: la motivación explícita del autor son sílabas cantadas; el modelo sirve para comparar versiones de una misma frase cantada o detectar desafinaciones mediante distancias entre embeddings.
- Prototipado docente e investigación reproducible: al estar fijados los SHA256 de entrada y salida y documentarse el comando de cuantización, se puede reproducir la build y comparar fp32 frente a q8 en experimentos de robustez.
- Detección de eventos acústicos en aplicaciones de accesibilidad: clasificar sonidos ambientales breves con un modelo que mantiene la información de baja amplitud, algo crítico cuando el evento relevante es un sonido débil junto a ruido fuerte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni métricas ASR como WER) en la información disponible. La model card aporta únicamente métricas internas de fidelidad frente a fp32:

| Metrica (clips de 0,3–0,45 s, silabas cantadas) | q8 estandar | Esta build (MatMul q8, conv fp32) | fp32 |
|---|---|---|---|
| Similitud coseno mediana vs fp32 | 0,953 | 0,99 | 1,0 (referencia) |
| Peor caso de similitud coseno vs fp32 | 0,385 | no disponible | 1,0 (referencia) |
| Cambio en clasificación por plantilla al desplazar 1–2 ms | 6,6 % | mismo conjunto que fp32 | 0,2 % |
| Tamano del archivo | 91 MB | 116 MB | no disponible |

Según el autor, en el backend WASM de onnxruntime-web la velocidad es aproximadamente la misma que la versión q8 estándar: los pesos a 8 bits reducen el tamaño de descarga, no el tiempo de ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo (WASM en navegador); en GPU, el modelo es lo bastante pequeño para caber en cualquier GPU consumer con varios GB libres, aunque no se publican cifras concretas.
- GPU recomendadas: no disponible; el despliegue documentado es WASM en CPU. Para servidor, cualquier GPU con soporte ONNX Runtime serviría, pero no hay datos de rendimiento.
- Cabe en GPU consumer: sí, por tamaño (116 MB de pesos), aunque no se especifican requisitos de memoria de activaciones.
- Opciones de despliegue: transformers.js con `@huggingface/transformers` y `dtype: 'q8'`, `device: 'wasm'`; ONNX Runtime Web; ONNX Runtime nativo (versión 1.19.2 usada para la cuantización).
- Latencia y throughput: no disponibles. El autor solo indica que la velocidad en WASM es similar a la del q8 estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| frankharrison/wavlm-base-plus-web | no disponible (base WavLM Base+) | audio, sin límite de tokens | ONNX (MatMul q8, conv fp32) | CC BY-SA 3.0 | Hugging Face, transformers.js |
| Xenova/wavlm-base-plus | no disponible (mismo base) | audio | ONNX (q8 completo) | CC BY-SA 3.0 | Hugging Face, transformers.js |
| microsoft/wavlm-base-plus | no disponible | audio | PyTorch (safetensors/bin) | CC BY-SA 3.0 | Hugging Face, Azure AI Foundry |

La diferencia principal frente a `Xenova/wavlm-base-plus` es la política de cuantización: el de Xenova cuantiza también las convoluciones y pesa 91 MB, mientras que esta build pesa 116 MB y preserva mejor la fidelidad en clips cortos. Frente al original de Microsoft, esta versión es una adaptación para web sin cambios de pesos más allá de la conversión y cuantización. No se dispone de comparativas con otros extractores de audio (por ejemplo, wav2vec 2.0 o HuBERT) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un sistema ASR listo para usar: requiere tokenizador y fine-tuning sobre texto etiquetado para transcripción.
- El preentrenamiento es solo sobre audio; no hay garantías de rendimiento multilingüe ni de sesgos por idioma documentados.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de representaciones erróneas en dominios alejados del habla (música, ruido industrial) sin validación previa.
- La licencia CC BY-SA 3.0 exige atribución y compartir bajo la misma licencia las adaptaciones; puede ser incompatible con productos comerciales cerrados que no quieran liberar derivados.
- El autor declara no estar afiliado ni respaldado por Microsoft ni por los autores de WavLM.
- El rendimiento en WASM es similar al q8 estándar; no se debe esperar una mejora de latencia por usar esta build.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- No se publican métricas de WER, precisión de clasificación ni latencias absolutas, lo que limita la evaluación objetiva en producción.

## Enlaces

- Hugging Face: https://huggingface.co/frankharrison/wavlm-base-plus-web
- Modelo base: https://huggingface.co/microsoft/wavlm-base-plus
- Conversión ONNX de referencia: https://huggingface.co/Xenova/wavlm-base-plus
- Paper WavLM: https://arxiv.org/abs/2110.13900
- Repositorio UniSpeech: https://github.com/microsoft/UniSpeech
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
- Texto de licencia del proyecto: https://github.com/microsoft/UniSpeech/blob/main/LICENSE
- transformers.js: https://github.com/huggingface/transformers.js
- Ficha en Microsoft Foundry: https://ai.azure.com/catalog/models/microsoft-wavlm-base-plus
