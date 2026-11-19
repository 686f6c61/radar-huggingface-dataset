# mistralai/Voxtral-Mini-4B-Realtime-Arabic

## Resumen

Voxtral Mini 4B Realtime Arabic es un modelo de reconocimiento automático del habla (ASR) en streaming, desarrollado por Mistral AI en colaboración con el Ministère de la Transition Numérique et de la Réforme Administrative (MTNRA) de Marruecos. Está especializado en árabe estándar moderno (MSA) y en quince variedades dialectales del árabe (magrebí, del Golfo, del valle del Nilo, levantino y chadiano), y está diseñado para manejar audio del mundo real y cambios de código (code-switching) dentro de una misma conversación.

El modelo es un ajuste fino de Voxtral-Mini-4B-Realtime-2602, con aproximadamente 4.400 millones de parámetros en precisión BF16. Procesa audio a 16 kHz mediante un codificador de audio causal y un decodificador de lenguaje, generando texto a medida que llega el audio. Su retardo de transcripción es configurable, lo que lo hace adecuado para subtitulado en vivo e interfaces de voz.

Su relevancia actual radica en que cubre un hueco históricamente mal atendido: el ASR de alta calidad para dialectos árabes en tiempo real. Con un retardo configurado de 480 ms alcanza un CER medio del 8,82 % en siete benchmarks árabes, superando a varios modelos offline de código abierto y propietarios, y quedando a 0,91 puntos porcentuales del 7,91 % de Voxtral Transcribe Arabic.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio causal + decodificador de lenguaje (Voxtral Realtime) |
| Parametros totales | 4.429.679.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); checkpoint ONNX disponible en onnx-community |
| Idiomas soportados | ar (MSA), ary, ayl, aeb, arq, mey, afb, ars, acx, ayn, arz, apd, acm, ajp, apc, shu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); ONNX en repositorio separado |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Voxtral Realtime: un codificador de audio causal que procesa flujos a 16 kHz y un decodificador de lenguaje que emite tokens de texto de forma incremental conforme llega el audio. Esta naturaleza causal permite la transcripción en streaming con un retardo configurable; el valor de referencia usado en las evaluaciones es de 480 ms. El modelo parte de Voxtral-Mini-4B-Realtime-2602 y se ajusta específicamente para árabe y sus dialectos.

El entrenamiento se centró en code-switching árabe, con el objetivo de manejar conversaciones donde los hablantes alternan entre lenguas. Según la model card, el ajuste también produjo mejoras observadas en code-switching con lenguas fuera del foco de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Las evaluaciones se realizaron con temperatura 0.0 y una normalización de CER desarrollada junto con MTNRA que cubre ortografía dialectal, clíticos, préstamos y números hablados.

## Capacidades

- Reconocimiento automático del habla en streaming para árabe estándar moderno y quince dialectos árabes.
- Manejo de code-switching, incluyendo alternancia de lenguas dentro de una misma conversación.
- Transcripción con retardo configurable, apta para subtitulado en vivo e interfaces de voz.
- Procesamiento de audio a 16 kHz mediante codificador causal.
- Evaluación mediante CER y WER como métricas declaradas.
- Capacidades emergentes de code-switching con lenguas fuera del foco de entrenamiento árabe.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio bidireccional.

## Casos de uso

- Subtitulado en vivo para medios y eventos: el modelo emite texto conforme llega el audio con un retardo configurable (480 ms en la evaluación de referencia), lo que permite generar subtítulos casi sincrónicos en retransmisiones y reuniones.
- Atención al cliente en centros de contacto del mundo árabe: al cubrir MSA y dialectos magrebíes, del Golfo, del Nilo y levantinos, puede transcribir conversaciones telefónicas de hablantes que no usan árabe estándar.
- Interfaces de voz para asistentes: la naturaleza causal y el streaming permiten integrar la transcripción en pipelines de voz a texto de baja latencia para comandos y dictado.
- Documentación de reuniones multilingües con code-switching: adecuado para entornos donde los participantes alternan árabe y otras lenguas en la misma sesión.
- Accesibilidad y transcripción de archivos audiovisuales: generación de transcripciones de contenido en dialectos árabes para subtitulado y archivo.
- Servicios públicos y administración: el modelo se presenta como activo soberano de IA co-desarrollado con MTNRA, lo que lo hace adecuado para digitalización de trámites y atención ciudadana en Marruecos.
- Despliegue en el navegador: existe un checkpoint ONNX y una demo WebGPU que permiten ejecutar la transcripción en cliente sin backend dedicado.

## Benchmarks y rendimiento

La model card reporta CER (Character Error Rate) medio del 8,82 % a un retardo de transcripción de 480 ms en siete benchmarks árabes, frente al 7,91 % de Voxtral Transcribe Arabic (diferencia de 0,91 puntos porcentuales). Las evaluaciones usan temperatura 0.0 y normalización CER co-desarrollada con MTNRA. Los benchmarks incluyen ISMA y Darija in the Wild, co-desarrollados con MTNRA, además de benchmarks árabes establecidos. No se proporcionan en la información disponible los valores desglosados por benchmark ni comparativas numéricas con modelos concretos más allá de la referencia a Voxtral Transcribe Arabic y a modelos offline de código abierto y propietarios superados.

| Metrica | Voxtral Mini 4B Realtime Arabic | Voxtral Transcribe Arabic |
|---|---|---|
| CER medio (7 benchmarks árabes) | 8,82 % | 7,91 % |
| Retardo de transcripcion | 480 ms (configurable) | offline |
| Temperatura de evaluacion | 0.0 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,9 GB solo para pesos (4,43 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con vLLM; GPU consumer de gama alta (RTX 4090, 24 GB) suficiente para BF16 en single-GPU.
- Cabe en GPU consumer: sí, en tarjetas con 12-16 GB o más en BF16; el checkpoint ONNX permite además ejecución en navegador vía WebGPU.
- Opciones de despliegue: vLLM con soporte Voxtral Realtime (`vllm serve mistralai/Voxtral-Mini-4B-Realtime-Arabic`), Transformers >= 5.2.0 con `mistral-common[audio]`, y ONNX Runtime / WebGPU mediante el checkpoint de onnx-community.
- Streaming: el audio se envía por WebSocket a `/v1/realtime` en vLLM.
- Latencia y throughput: no se publican cifras de throughput en la información disponible; el retardo de transcripción configurado en las evaluaciones es de 480 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER medio (arabe) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral Mini 4B Realtime Arabic | 4,43 B | no disponible | 8,82 % (480 ms) | Apache 2.0 | Hugging Face, vLLM, Transformers, ONNX |
| Voxtral Transcribe Arabic | no disponible | no disponible | 7,91 % | no disponible | no disponible |
| Voxtral Mini 4B Realtime (original) | 4,4 B aprox. | no disponible | no disponible | no disponible | Hugging Face |

La model card indica que el modelo supera a varios modelos offline de código abierto y propietarios, pero no detalla cuáles ni sus cifras. No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- El modelo está orientado a transcripción en árabe; para otras lenguas debe usarse el Voxtral Mini 4B Realtime original.
- El CER puede variar según el método de normalización empleado; los resultados reportados usan la normalización co-desarrollada con MTNRA.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre dialectos árabes puede presentar diferencias de rendimiento entre variedades.
- Riesgo de alucinación inherente a los modelos generativos de ASR, especialmente en audio ruidoso o con code-switching intenso.
- La licencia Apache 2.0 permite uso comercial, pero se exige no infringir derechos de terceros, incluidos derechos de propiedad intelectual.
- No se especifican limitaciones de longitud de contexto ni de duración máxima de audio en la información disponible.
- La nota de la model card indica que los filtros de seguridad de Gemini bloquean la transcripción de algunas muestras de audio de FLEURS, lo que afecta a la comparabilidad de resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-Arabic
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Checkpoint ONNX: https://huggingface.co/onnx-community/Voxtral-Mini-4B-Realtime-Arabic-ONNX
- Demo WebGPU: https://huggingface.co/spaces/mistralai/Voxtral-Mini-4B-Realtime-Arabic-WebGPU
- Documentación de Transformers: https://huggingface.co/docs/transformers/main/en/model_doc/voxtral_realtime
- Ejemplo de streaming en vLLM: https://docs.vllm.ai/en/stable/examples/speech_to_text/realtime/
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
