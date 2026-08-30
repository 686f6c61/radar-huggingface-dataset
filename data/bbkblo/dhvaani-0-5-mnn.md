# Bbkblo/DhVaani-0.5-MNN

## Resumen

DhVaani-0.5-MNN es un modelo de síntesis de voz (text-to-speech) en formato MNN, desarrollado por Bbkblo como una conversión del modelo original DhVaani-0.5-ONNX, orientado a su ejecución en dispositivos Android y entornos on-device. El modelo está diseñado para generar voz en hindi, aunque el modelo ONNX original soporta hasta 13 lenguas indias. Su relevancia radica en ofrecer una solución ligera y de código abierto (licencia Apache-2.0) para síntesis de voz sin depender de servicios en la nube, lo que permite aplicaciones de baja latencia y privacidad en el dispositivo.

La arquitectura se compone de tres módulos principales: un codificador de texto que produce condiciones semánticas, un decodificador basado en flow-matching que genera las representaciones intermedias, y un vocoder (backbone + cabecera Vocos) que convierte los mel-espectrogramas en la forma de onda final. Todos los componentes se distribuyen en formato INT8 para reducir el tamaño y el consumo de recursos, con un tamaño total del repositorio de 0,2 GB. La conversión se realizó con MNNConvert a partir de ONNX opset 18, y el runtime recomendado es MNN Express (MNN::Express::Module) debido a la presencia de subgrafos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con flow-matching decoder y vocoder (text encoder + flow-matching decoder + vocoder backbone + vocos head) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | INT8 (en los archivos .mnn) |
| Idiomas soportados | hindi (según etiquetas); el modelo ONNX original soporta 13 lenguas indias |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (.mnn) y .npz (auxiliares) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura modular típica de los sistemas TTS modernos basados en flow-matching. El `text_encoder_int8.mnn` toma como entrada los tokens de texto, tokens de prompt opcionales, la longitud de las características del prompt y un factor de velocidad, y produce una condición textual (`text_condition`). El `fm_decoder_int8.mnn` es un decodificador de flow-matching que recibe el tiempo `t`, la variable `x`, la condición textual, una condición de habla (`speech_condition`) y una escala de guiado (`guidance_scale`), y predice la velocidad `v`. Finalmente, el `vocoder_backbone.mnn` convierte los mel-espectrogramas (`mels`) en una representación oculta, que luego se procesa con la cabecera Vocos (`vocos_head.npz`) y el banco de filtros mel (`mel_fb.npz`) para generar la forma de onda final.

No se proporcionan detalles sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La información disponible se limita a la conversión de formato: se partió de un modelo ONNX (opset 18, IR v8) y se convirtió a MNN con la herramienta MNNConvert. El pipeline completo debe ejecutarse mediante MNN Express para manejar los subgrafos detectados.

## Capacidades

- Síntesis de voz en hindi a partir de texto.
- Generación de voz con control de velocidad (parámetro `speed` en el text encoder).
- Soporte para condiciones de prompt (posiblemente para clonación de voz o control de estilo, según los tags del modelo ONNX original que incluyen "voice-cloning").
- Ejecución on-device en Android (ARM64) mediante el runtime MNN.
- Bajo consumo de recursos gracias a la cuantización INT8 y al tamaño compacto del modelo.
- No se han documentado capacidades adicionales como tool calling, agentes o razonamiento, ya que es un modelo de generación de audio.

## Casos de uso

- Asistente de voz en hindi para aplicaciones móviles: integración en apps de asistencia personal para responder consultas habladas, aprovechando la ejecución local para evitar latencias de red.
- Lectura de notificaciones o mensajes en hindi: el modelo puede convertir notificaciones de texto en audio, útil para usuarios que prefieren escuchar mientras realizan otras tareas.
- Aplicaciones de accesibilidad: lectura en voz alta de pantallas o documentos para personas con discapacidad visual, con la ventaja de funcionar sin conexión.
- Generación de audiolibros en hindi: producción de contenido hablado a partir de texto, con control de velocidad para ajustar el ritmo de narración.
- Chatbots de voz en hindi: integración en sistemas de atención al cliente o asistentes conversacionales que requieren respuestas de voz en tiempo real en el dispositivo.
- Traducción de texto a voz para viajeros o estudiantes: conversión de frases escritas en hindi a audio para practicar pronunciación o comunicación básica, sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MOS (Mean Opinion Score), RTF (Real-Time Factor) o comparativas con otros sistemas TTS.

## Requisitos de hardware

- Dispositivos Android con arquitectura ARM64 (arm64-v8a) y soporte para el runtime MNN.
- Se requiere la librería `libMNN.so` (arm64-v8a) para cargar los módulos.
- Tamaño total del modelo: aproximadamente 0,2 GB (incluye todos los archivos .mnn y .npz), por lo que puede almacenarse en dispositivos con espacio moderado.
- Memoria RAM: no se especifica, pero al ser INT8 y de tamaño reducido, es viable en smartphones de gama media (3-4 GB de RAM).
- Despliegue: se puede integrar en apps Android mediante MNN Express, o ejecutarse en otros entornos que soporten MNN (por ejemplo, Linux con MNN compilado).
- Latencia y throughput: no se proporcionan estimaciones; al ser on-device, la latencia dependerá del hardware del dispositivo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos TTS en hindi o en formato MNN. El modelo es una conversión específica y no se han documentado alternativas equivalentes en el mismo formato.

## Limitaciones y advertencias

- La documentación es escasa: no se detallan los datos de entrenamiento, el rendimiento en términos de naturalidad o inteligibilidad, ni los límites de longitud de texto soportada.
- La cuantización INT8 puede introducir pérdida de calidad en la voz generada en comparación con modelos en FP32 o FP16.
- El idioma confirmado es el hindi; aunque el modelo ONNX original soporta 13 lenguas indias, la versión MNN no especifica qué idiomas están realmente disponibles y podría requerir ajustes adicionales.
- Al ser una conversión reciente (creado en agosto de 2026), no hay una comunidad establecida ni soporte oficial más allá del repositorio del autor.
- No se garantiza la ausencia de errores en la generación de voz, como pronunciaciones incorrectas o artefactos de audio, especialmente en contextos de uso comercial.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo original (ONNX) si se desea utilizar más allá del hindi.

## Enlaces

- [Repositorio HuggingFace del modelo MNN](https://huggingface.co/Bbkblo/DhVaani-0.5-MNN)
- [Repositorio HuggingFace del modelo ONNX original](https://huggingface.co/Bbkblo/DhVaani-0.5-ONNX)
- [Repositorio MNN de Alibaba](https://github.com/alibaba/MNN)
