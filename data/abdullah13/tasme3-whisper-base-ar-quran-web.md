# abdullah13/tasme3-whisper-base-ar-quran-web

## Resumen

`abdullah13/tasme3-whisper-base-ar-quran-web` es una exportación ONNX de 8 bits del modelo `tarteel-ai/whisper-base-ar-quran`, pensada para reconocimiento de recitación coránica directamente en el navegador mediante transformers.js. Lo publica el desarrollador abdullah13 como artefacto de infraestructura de la aplicación gratuita de memorización Tasme3 (تسميع), y no introduce ningún cambio en los pesos más allá de la cuantización: todo el mérito del modelo original corresponde a Tarteel AI.

Se trata de un Whisper base (arquitectura transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI y afinado por Tarteel AI sobre recitación coránica en árabe). El repositorio ocupa 0,1 GB y contiene dos grafos ONNX cuantizados dinámicamente a 8 bits: el encoder (23 MB) y el decoder fusionado (80 MB). La licencia es Apache-2.0 y el único idioma declarado es el árabe.

Su relevancia actual es doble. Por un lado, demuestra un patrón de despliegue de ASR en el cliente sin servidor ni GPU, viable en teléfonos. Por otro, incorpora una modificación práctica sobre el Whisper estándar: el encoder acepta ventanas mel más cortas que los 30 segundos fijos, de modo que unos pocos segundos de recitación cuestan unos pocos segundos de cómputo, con una precisión equivalente y aproximadamente 3 veces más velocidad en móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper base (transformer encoder-decoder, atención completa) exportado a ONNX |
| Parametros totales | no disponible (el modelo base Whisper base ronda los 74 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio variable; el encoder admite ventanas mel más cortas que los 30 s fijos de Whisper (mínimo 1000 frames) |
| Tipos de cuantizacion | pesos de 8 bits con cuantización dinámica (ONNX quantized) |
| Idiomas soportados | árabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |
| Libreria de inferencia | transformers.js |
| Tamano del repositorio | 0,1 GB (encoder 23 MB, decoder 80 MB) |
| Modelo base | tarteel-ai/whisper-base-ar-quran |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un encoder que procesa espectrogramas mel y un decoder autorregresivo que genera tokens de texto, con atención completa en ambas partes. El modelo original fue desarrollado por OpenAI y afinado por Tarteel AI para recitación coránica en árabe; esta versión es únicamente una exportación a ONNX con cuantización dinámica de 8 bits de los pesos, sin reentrenamiento ni ajuste adicional. No se dispone de datos sobre el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO en el modelo original en la información proporcionada.

La innovación técnica destacable es la modificación del encoder para aceptar ventanas mel de longitud variable: las posiciones se recortan a la longitud de la ventana, de forma que el coste computacional es proporcional a la duración del audio en lugar de estar fijado a 30 segundos. El autor reporta la misma precisión que el modelo original y una mejora de velocidad de aproximadamente 3 veces en teléfonos. El decoder se distribuye como grafo fusionado (`decoder_model_merged`), lo que simplifica el despliegue en transformers.js.

## Capacidades

- Reconocimiento automático de voz (ASR) en árabe, especializado en recitación coránica.
- Transcripción de audio de duración variable, incluidas ventanas cortas de pocos segundos (mínimo 1000 frames mel).
- Ejecución completamente en el cliente, en el navegador, sin llamadas a servidor.
- Inferencia sobre CPU en dispositivos móviles gracias a la cuantización de 8 bits y al recorte de ventana.
- Integración con la aplicación Tasme3 para verificación de memorización (matcher propio de la app contra el texto oficial KFGQPC).
- No se documentan capacidades de tool calling, agentes, visión, audio multilingüe ni modo de razonamiento extendido.

## Casos de uso

- Verificación de memorización del Corán: la aplicación compara la transcripción del audio del usuario con el texto oficial KFGQPC mediante su matcher, y el modelo proporciona la transcripción base con una tasa de error de palabra del 14,2 % en el conjunto de evaluación del autor.
- Aplicaciones web de práctica de recitación sin backend: al ejecutarse con transformers.js en el navegador, permite distribuir una app de corrección de recitación sin costes de servidor ni exposición de audio del usuario a terceros.
- Procesamiento en dispositivos con recursos limitados: los 103 MB totales de pesos cuantizados y el recorte de ventana hacen viable la inferencia en teléfonos de gama media.
- Transcripción de segmentos cortos de audio árabe: útil para clips de pocos segundos donde el coste fijo de 30 s de Whisper estándar sería desproporcionado.
- Prototipado rápido de ASR árabe en el navegador: sirve como base para demos y validaciones de producto sin infraestructura de GPU.
- Escenarios de privacidad estricta: al no enviar audio a un servidor, encaja en aplicaciones educativas o religiosas donde el usuario exige procesamiento local.
- Filtrado o indexación de grabaciones de recitadores: permite alinear segmentos de audio con ayat concretas en pipelines de catalogación.

## Benchmarks y rendimiento

El autor reporta una única métrica de precisión, medida con el matcher de la aplicación sobre 48 ayat y 4 recitadores, contra el texto oficial KFGQPC:

| Metrica | Este modelo (ONNX 8-bit) | Modelo original |
|---|---|---|
| Tasa de error de palabra (WER) | 14,2 % | 14,1 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni datos de latencia o throughput absolutos más allá de la mejora relativa de aproximadamente 3 veces en teléfonos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de uso previsto (ejecución en CPU del navegador); los pesos cuantizados suman unos 103 MB.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU en dispositivos móviles.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso principal; al ser ONNX, podría ejecutarse con aceleración por WebGPU en el navegador, aunque el autor no lo documenta.
- Opciones de despliegue: transformers.js en el navegador (vía ONNX Runtime Web); el formato ONNX también permite otros runtimes compatibles, no documentados por el autor.
- Latencia y throughput: el autor indica una mejora de aproximadamente 3 veces en teléfonos frente al modelo sin recorte de ventana; no se publican cifras absolutas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| abdullah13/tasme3-whisper-base-ar-quran-web | no disponible (base Whisper) | ventana variable, mínimo 1000 frames mel | árabe | Apache-2.0 | ONNX 8-bit |
| tarteel-ai/whisper-base-ar-quran | no disponible (base Whisper) | 30 s fijos | árabe | Apache-2.0 | safetensors / PyTorch |
| openai/whisper-base | no disponible (base Whisper) | 30 s fijos | multilingüe | Apache-2.0 | safetensors / PyTorch |

La diferencia principal frente a los dos anteriores es el formato de despliegue (ONNX cuantizado para navegador) y el recorte de ventana, no la calidad de transcripción. No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en recitación coránica en árabe; su rendimiento en árabe conversacional o en otros idiomas no está documentado y previsiblemente será pobre.
- La tasa de error de palabra del 14,2 % se midió sobre un conjunto pequeño (48 ayat, 4 recitadores) con el matcher de la aplicación; no es directamente comparable con WER estándar sobre corpus abiertos.
- No hay información sobre sesgos del modelo original ni sobre su comportamiento con recitadores no vistos, mujeres, niños o acentos regionales.
- Riesgo de alucinación de texto: como todo modelo generativo de ASR, puede producir transcripciones plausibles pero incorrectas, especialmente con audio ruidoso o recitación atípica.
- La cuantización a 8 bits puede degradar ligeramente el rendimiento en casos límite, aunque el autor reporta una diferencia de solo 0,1 puntos porcentuales en su evaluación.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye como artefacto de una aplicación concreta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- No se documentan limitaciones de longitud máxima de audio más allá del mínimo de 1000 frames mel.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdullah13/tasme3-whisper-base-ar-quran-web
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- transformers.js: https://github.com/huggingface/transformers.js
