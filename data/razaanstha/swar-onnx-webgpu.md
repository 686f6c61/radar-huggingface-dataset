# razaanstha/swar-onnx-webgpu

## Resumen

Swar ONNX for browser experiments es una conversión experimental a ONNX del modelo de síntesis de voz y clonación de voz en nepalí Swar, desarrollado originalmente por Naamche Labs (repositorio `Aarjan/swar`). La conversión la firma el usuario independiente razaanstha y no constituye un lanzamiento oficial de los autores originales. El objetivo es permitir la inferencia en el navegador mediante WebGPU y ONNX Runtime Web, evitando la dependencia de PyTorch en el cliente.

El repositorio no contiene una aplicación completa de texto a voz: incluye el encoder FP32 y dos grafos transformer (uno con un calendario de 32 pasos de denoising y otro con un calendario no uniforme de 16 pasos), pero omite el decodificador de audio basado en Vocos y la referencia de voz Maya, ambos necesarios para generar audio. La decisión de omitir el decodificador responde a la falta de una declaración clara de licencia sobre los pesos del checkpoint de Vocos utilizado.

Se trata, por tanto, de un artefacto para experimentación técnica e integración en prototipos web, no de un producto listo para producción. Su relevancia radica en explorar el despliegue de TTS con clonación de voz en el navegador mediante WebGPU, aunque el rendimiento medido es todavía muy limitado (decenas de segundos por frase).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching con transformer de difusión y encoder), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 en los grafos exportados; se menciona una exportación FP16 no verificada que no se incluye |
| Idiomas soportados | nepalí (ne) |
| Licencia | CC BY-SA 4.0 (pesos derivados de Swar); código exportador Apache-2.0; código fuente Swar MIT |
| Formato de pesos | ONNX (`encoder.onnx`, `transformer-32.onnx`, `transformer-16.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es F5-TTS, un modelo de síntesis de voz basado en flow matching que combina un encoder de texto y un transformer de denoising iterativo. En esta conversión se exportan tres grafos ONNX: el encoder FP32 con preprocesado, un transformer con calendario fijo de 32 pasos y un transformer con calendario no uniforme de 16 pasos, ambos de aproximadamente 1,32 GB cada uno. Los grafos incorporan una reescritura de la operación Split multi-salida en operaciones Slice equivalentes, orientada a mejorar la compatibilidad con WebGPU. El calendario y los embeddings temporales están fijados en cada grafo exportado, por lo que no es válido ejecutar solo las primeras 16 iteraciones del grafo de 32 pasos como sustituto del de 16.

Los scripts de exportación derivan de DakeQQ/F5-TTS-ONNX, con modificaciones para Swar: segmentación dinámica del decodificador, exportaciones separadas de 16 y 32 pasos y la reescritura de Split para WebGPU. El checkpoint de origen es `podvoices_ema.pt` del repositorio `Aarjan/swar` en la revisión `8ca6f1bbc9da567d92158822e24673c2084e7e86`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Síntesis de voz en nepalí a partir de texto, mediante el encoder y el transformer de denoising.
- Clonación de voz zero-shot condicionada por audio de referencia y su transcripción (la referencia no se incluye en el repositorio).
- Ejecución en navegador mediante ONNX Runtime Web y WebGPU, sin backend PyTorch.
- Dos modos de inferencia: 32 pasos (mayor calidad esperada) y 16 pasos (opción más rápida y experimental).
- Segmentación automática de entradas de varios párrafos en fragmentos.
- Normalización de texto limitada: admite números enteros simples, pero no fechas, horas ni decimales con formato, ni texto en inglés.
- No es compatible con `pipeline()` de Transformers.js; requiere integración manual con ONNX Runtime Web.

## Casos de uso

- Prototipado de TTS en navegador: permite experimentar con síntesis de voz en nepalí sin instalar dependencias de Python en el cliente, usando WebGPU y ONNX Runtime Web directamente.
- Investigación sobre despliegue web de modelos de difusión para audio: sirve como base para medir latencia, compatibilidad de operadores y consumo de memoria en distintos navegadores y GPUs.
- Evaluación de estrategias de reducción de pasos de denoising: la comparación entre los grafos de 32 y 16 pasos permite estudiar el compromiso entre calidad y velocidad en un entorno web.
- Integración en aplicaciones de accesibilidad para hablantes de nepalí: una vez añadido un decodificador compatible y una referencia de voz autorizada, podría emplearse para lectura de contenido en voz alta en el navegador.
- Cadena de herramientas de conversión ONNX: los scripts de exportación documentan el proceso desde PyTorch hasta grafos optimizados para WebGPU, útiles para portar otros modelos F5-TTS.
- Validación numérica de exportaciones: los ficheros de validación permiten comparar las salidas ONNX con las de PyTorch en etapas concretas del pipeline, como base para pruebas de regresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de voz en la información disponible. Los únicos datos de rendimiento son mediciones de latencia del prototipo en un único equipo:

| Prueba | Configuración | Tiempo (s) |
|---|---|---|
| Generación, frase única | 32 pasos | 77,3 |
| Generación, frase única | 32 pasos | 74,0 |
| Generación, frase única | 16 pasos | 52,2 |
| Generación, frase única | 16 pasos | 39,4 |

Estas mediciones se obtuvieron en una GPU Apple con un navegador Chromium con flags de WebGPU, excluyendo el tiempo de carga, y no están validadas en otros dispositivos.

## Requisitos de hardware

- VRAM estimada: los dos transformers pesan aproximadamente 1,32 GB cada uno en FP32; el encoder y el decodificador añaden consumo adicional no cuantificado en la información disponible.
- GPU recomendadas: no hay una lista oficial; las pruebas se realizaron en una GPU Apple integrada mediante WebGPU.
- Compatibilidad con GPU de consumo: no establecida; el requisito principal es un navegador con soporte WebGPU (Chromium con flags en las pruebas).
- Despliegue: ONNX Runtime Web en el navegador; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia: entre 39 y 77 segundos por frase según el número de pasos, en el hardware de prueba.
- Almacenamiento: el repositorio ocupa 3,3 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Swar ONNX WebGPU (esta ficha) | TTS con clonación (F5-TTS) | nepalí | ONNX | CC BY-SA 4.0 | Conversión experimental incompleta |
| Aarjan/swar | TTS con clonación (F5-TTS) | nepalí | PyTorch | CC BY-SA 4.0 | Modelo original completo |
| DakeQQ/F5-TTS-ONNX | TTS (F5-TTS) | multilingüe | ONNX | Apache-2.0 (código) | Exportador de referencia |

No se dispone de datos de benchmarks que permitan comparar la calidad de voz con alternativas.

## Limitaciones y advertencias

- El repositorio no es una aplicación ejecutable: falta el decodificador Vocos y la referencia de voz Maya, imprescindibles para generar audio.
- No es compatible con `pipeline()` de Transformers.js; requiere integración manual con ONNX Runtime Web.
- La licencia de los pesos de Vocos no está clara, lo que motivó su exclusión; verificar los términos de cualquier activo externo antes de usarlo o redistribuirlo.
- La normalización de texto es incompleta: no maneja fechas, horas, decimales ni texto en inglés.
- Riesgo de alucinación y artefactos de audio no evaluado; las pruebas de validación son comprobaciones por etapas, no una evaluación de calidad de voz.
- Rendimiento no establecido entre dispositivos y navegadores; las latencias medidas son altas para uso interactivo.
- Licencia CC BY-SA 4.0: obliga a atribución, a indicar cambios y a compartir bajo la misma licencia las obras derivadas, lo que condiciona el uso comercial.
- Los autores originales piden clonar voces solo con permiso de la persona y no usar el modelo para suplantación o engaño.
- Modelo con cero descargas y cero likes en el momento de la consulta; sin comunidad ni mantenimiento demostrado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/razaanstha/swar-onnx-webgpu
- Modelo base Swar: https://huggingface.co/Aarjan/swar
- Revisión del checkpoint de origen: https://huggingface.co/Aarjan/swar/tree/8ca6f1bbc9da567d92158822e24673c2084e7e86
- Repositorio de código de Swar: https://github.com/Naamche-Labs/swar
- Exportador F5-TTS-ONNX: https://github.com/DakeQQ/F5-TTS-ONNX
- Vocos mel 24 kHz: https://huggingface.co/charactr/vocos-mel-24khz
- ONNX Runtime: https://github.com/microsoft/onnxruntime
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
