# locai-models/moonshine-tiny-en-onnx-f32

## Resumen

Moonshine Tiny EN ONNX F32 es una conversión a formato ONNX del modelo de reconocimiento automático del habla (ASR) Moonshine Tiny de UsefulSensors, publicada por LocAI. El repositorio no contiene un modelo nuevo ni reentrenado: aloja únicamente los artefactos derivados del export (encoder y decoder fusionado en ONNX) junto con un recibo de conversión que fija las revisiones y los hashes SHA-256 de todos los ficheros de origen. Cualquier fichero no modificado se obtiene del repositorio upstream en su revisión fijada.

El modelo base, Moonshine Tiny, es un sistema de transcripción de voz a texto orientado a inglés y diseñado para inferencia eficiente en dispositivos con recursos limitados. Esta variante concreta emplea precisión completa (F32) y está empaquetada para el perfil de despliegue `moonshine-tiny-en-onnx-f32-ios-simulator-asr3s-constant-pad-v3`, lo que la hace adecuada para integración en aplicaciones móviles y entornos embebidos mediante runtimes ONNX.

La relevancia de esta ficha es fundamentalmente práctica: ofrece una ruta reproducible y verificable para ejecutar Moonshine Tiny fuera del ecosistema PyTorch, con trazabilidad criptográfica de cada artefacto. El autor advierte explícitamente de que se trata de una conversión de formato sin pretensión de calidad, y que no se ejecutó ninguna evaluación para producirla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder para ASR (Moonshine Tiny), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 (punto flotante de 32 bits); el repositorio solo publica la variante F32 |
| Idiomas soportados | Inglés (sufijo `-en` en el nombre; no se detalla en la model card) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base más allá de su naturaleza encoder-decoder y su propósito ASR. Moonshine Tiny es un modelo de reconocimiento de voz de la familia Moonshine, pensado para transcripción en inglés con un coste computacional reducido. No se proporcionan en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica de esta publicación no reside en el modelo, sino en el proceso de exportación: se utilizó Optimum ONNX en una revisión fijada (`ebfc7c31ee639716c323b59573f27a3a9263ffb5`), con un stack de herramientas con versiones concretas (torch 2.12.1, transformers 4.57.6, optimum 2.2.0, onnx 1.23.1, onnxscript 0.7.2, entre otras). El decoder se exporta en su variante fusionada (`decoder_model_merged.onnx`), lo que simplifica el grafo de inferencia al consolidar las rutas de decodificación. El script de exportación (`export_moonshine_onnx.py`) y el informe de instalación se referencian con sus hashes SHA-256, y la ejecución se realizó en modo offline mediante `run-offline-darwin.sh`, lo que refuerza la reproducibilidad del artefacto.

## Capacidades

- Reconocimiento automático del habla (voz a texto) en inglés.
- Exportación ONNX con encoder independiente y decoder fusionado, apta para runtimes ONNX en entornos nativos y móviles.
- Perfil de despliegue preparado para simulador de iOS (`ios-simulator-asr3s-constant-pad-v3`), con padding constante.
- Trazabilidad completa: hashes SHA-256 de todos los ficheros de entrada y salida, y recibo de conversión (`conversion-receipt.json`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.
- No se documentan capacidades multilingües más allá del inglés implícito en el nombre del modelo.

## Casos de uso

- Transcripción de voz en aplicaciones iOS: el perfil `ios-simulator-asr3s-constant-pad-v3` y el formato ONNX permiten integrar el modelo en el simulador de iOS mediante un runtime ONNX, con padding constante para simplificar el preprocesado de audio.
- Subtitulado local en dispositivos: al ser un modelo Tiny en F32 con un encoder de aproximadamente 31 MB, puede ejecutarse en dispositivos con recursos moderados sin depender de la nube.
- Dictado por voz en herramientas de escritorio: la separación encoder/decoder fusionado facilita la integración en pipelines de inferencia ONNX nativos (por ejemplo, con ONNX Runtime) para aplicaciones de productividad.
- Prototipado de pipelines ASR en CI: los hashes y el recibo de conversión permiten verificar la integridad de los artefactos en pruebas automatizadas antes de desplegarlos.
- Investigación en eficiencia de ASR: sirve como referencia de exportación reproducible para comparar el rendimiento de Moonshine Tiny en ONNX frente a PyTorch.
- Evaluación de runtimes ONNX en entornos Apple: el perfil orientado a simulador de iOS lo convierte en un banco de pruebas para medir latencia y compatibilidad de operadores en dichos runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que se trata de una conversión de formato sin pretensión de calidad y que no se ejecutó ninguna evaluación para producirla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; los artefactos ONNX suman aproximadamente 110 MB (encoder de 31.022.951 bytes y decoder fusionado de 78.791.274 bytes), por lo que la huella de pesos en F32 es de ese orden.
- GPU recomendadas: no disponible; al tratarse de un modelo Tiny, no requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en CPU, dado el tamaño de los artefactos; no se publican requisitos mínimos oficiales.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo ASR.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moonshine Tiny EN ONNX F32 (este) | no disponible | no disponible | ONNX (F32) | MIT | Hugging Face (LocAI) |
| UsefulSensors/moonshine-tiny (base) | no disponible | no disponible | safetensors | MIT | Hugging Face |
| Whisper Tiny | no disponible en la información proporcionada | no disponible | safetensors, entre otros | no disponible en la información proporcionada | Hugging Face |
| Wav2Vec2 base | no disponible en la información proporcionada | no disponible | safetensors | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Conversión de formato sin evaluación: el autor declara que no se ejecutó ninguna evaluación de calidad, por lo que no hay garantía de que la salida ONNX reproduzca fielmente el comportamiento del modelo original.
- Idioma: el modelo está orientado a inglés; no se documentan otros idiomas.
- Sesgos: no disponibles; no se publica información sobre sesgos del modelo base ni de esta conversión.
- Riesgo de alucinación: no evaluado en esta conversión; en ASR, los errores de transcripción en audio ruidoso o con acentos no representados en el entrenamiento son un riesgo inherente no cuantificado aquí.
- Licencia: MIT, la misma del modelo base; permite uso comercial, pero debe conservarse el aviso de licencia y el NOTICE.
- Producción: al no haber benchmarks ni evaluación, no se recomienda desplegar en producción sin validar previamente la calidad de transcripción en el dominio objetivo.
- Dependencia de revisiones fijadas: los ficheros no incluidos se obtienen del repositorio upstream en revisiones concretas; cambios en la disponibilidad de dichas revisiones pueden romper la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/locai-models/moonshine-tiny-en-onnx-f32
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny
- Repositorio del proyecto Moonshine: https://github.com/moonshine-ai/moonshine
- Licencia del modelo base: https://raw.githubusercontent.com/moonshine-ai/moonshine/d8d8fa29d05ca67441a7719e70099f9f48917a93/LICENSE
- Optimum ONNX: https://github.com/huggingface/optimum-onnx
