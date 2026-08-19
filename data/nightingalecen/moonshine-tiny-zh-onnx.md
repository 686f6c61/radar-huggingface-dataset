# NightingaleCen/moonshine-tiny-zh-onnx

## Resumen

El modelo `NightingaleCen/moonshine-tiny-zh-onnx` es una conversión a ONNX del modelo de reconocimiento de voz automático (ASR) Moonshine Tiny ZH, desarrollado originalmente por Moonshine AI (antes Useful Sensors). Esta variante está optimizada para transcripción de audio en chino mandarín y ha sido cuantizada dinámicamente a INT8, además de simplificada con `onnxsim` y optimizada para ONNX Runtime. El objetivo principal es ofrecer transcripción en tiempo real con baja latencia en hardware de bajo coste, como microcontroladores o CPUs modestas.

La versión ONNX incluye un tokenizador de decodificación en formato binario compacto (`moonshine_tiny_zh_decode.bin`) y soporta decodificación con caché de KV (key-value), lo que permite un procesamiento incremental eficiente. El modelo base, Moonshine Tiny ZH, pertenece a la familia Moonshine, que se caracteriza por una arquitectura encoder-decoder diseñada específicamente para aplicaciones de voz en vivo y comandos por voz. Este repositorio es un trabajo derivado distribuido bajo la Moonshine AI Community License, por lo que es necesario revisar los términos de uso antes de integrarlo en productos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (basado en Moonshine Tiny) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | INT8 dinamico (KV-cache con INT8) |
| Idiomas soportados | chino (zh) |
| Licencia | Moonshine AI Community License (other) |
| Formato de pesos | ONNX (safetensors no, archivos .onnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura encoder-decoder de la familia Moonshine, optimizada para latencia mínima en tareas de transcripción en tiempo real. El encoder procesa la señal de audio (espectrogramas o características mel) y el decoder genera el texto de forma autorregresiva. En esta conversión ONNX, se ha implementado decodificación con caché de KV y cuantización dinámica INT8, lo que reduce el uso de memoria y acelera la inferencia en CPU. El tokenizador es de tipo ByteFallback con un vocabulario de 32 768 piezas, y el archivo binario de decodificación contiene toda la información necesaria para reconstruir el texto a partir de los tokens.

No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineamiento (RLHF, DPO, etc.) en la documentación de este repositorio. El modelo base fue entrenado por Moonshine AI para reconocimiento de voz china, y la versión ONNX mantiene las mismas capacidades funcionales, aunque con posibles pérdidas menores de precisión debido a la cuantización.

## Capacidades

- Transcripción de audio en chino mandarín a texto, con soporte para habla continua.
- Decodificación incremental con caché de KV, adecuada para streaming de audio en tiempo real.
- Inferencia eficiente en CPU gracias a la cuantización INT8 dinámica y la optimización con ONNX Runtime.
- Tokenizador de decodificación compacto en formato binario, pensado para entornos embebidos o con restricciones de memoria.
- Compatibilidad con el ecosistema ONNX, lo que permite integración en aplicaciones Python, C++, Rust, etc., mediante ONNX Runtime.
- No se han documentado capacidades adicionales como tool calling, agentes o multimodales.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir audio en chino a texto en tiempo real, permitiendo generar actas o subtítulos automáticos. Su baja latencia lo hace adecuado para aplicaciones de dictado continuo.
- Asistentes de voz para dispositivos domésticos: al ser ligero y cuantizado, puede ejecutarse en Raspberry Pi o dispositivos similares para procesar comandos de voz en chino sin depender de la nube.
- Subtitulación automática de vídeos: integrado en un pipeline de procesamiento de medios, puede generar subtítulos para contenido en chino con una precisión razonable, especialmente si se combina con un modelo de puntuación.
- Accesibilidad para personas con discapacidad auditiva: transcripción en vivo de conversaciones o eventos en chino, mostrando el texto en pantalla.
- Control por voz en aplicaciones industriales: reconocimiento de comandos específicos en entornos de bajo coste, como paneles de control o maquinaria, gracias a su capacidad de ejecución en CPU.
- Investigación en ASR: sirve como punto de partida para experimentos de fine-tuning o para comparar el rendimiento de modelos cuantizados frente a versiones de precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Moonshine Tiny ZH ha sido evaluado en conjuntos de ASR comunes según la documentación de Moonshine AI, pero estos datos no se incluyen en este repositorio. No se pueden proporcionar cifras concretas de WER (Word Error Rate) ni comparaciones con otros modelos sin datos verificables.

## Requisitos de hardware

- Al ser un modelo tiny con cuantización INT8, se espera que pueda ejecutarse en CPU sin GPU, con un consumo de memoria inferior a 100 MB (el repositorio ocupa 0.1 GB, pero el modelo en sí es más pequeño).
- Recomendado para dispositivos de bajo coste: Raspberry Pi 4/5, placas con ARM, o CPUs x86 modernas.
- No requiere GPU, pero si se dispone de una, se puede acelerar mediante ONNX Runtime con ejecutores CUDA o DirectML.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), o mediante servidores de inferencia como Triton Inference Server (con backend ONNX).
- No se dispone de datos de latencia o throughput específicos para este modelo. Se espera que la latencia sea inferior a 100 ms por fragmento de audio de 1 segundo en CPU, según las características de la familia Moonshine, pero no está confirmado.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos ASR para chino, como Whisper small, Paraformer o SenseVoice. No se conocen los parámetros exactos, el rendimiento en benchmarks ni las licencias de estos modelos en relación con este. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para chino mandarín; no soporta otros idiomas ni dialectos regionales con la misma calidad.
- La cuantización INT8 puede provocar una ligera degradación en la precisión de transcripción en comparación con la versión de punto flotante.
- No se han documentado sesgos específicos, pero como todo modelo de ASR, puede tener dificultades con acentos fuertes, ruido de fondo o vocabulario técnico.
- Riesgo de alucinación: en audio ambiguo o de baja calidad, el modelo puede generar texto incorrecto o inventado.
- La licencia es "Moonshine AI Community License", que impone restricciones de uso comercial. Es imprescindible revisar el archivo `LICENSE.txt` incluido en el repositorio antes de cualquier uso en producción.
- El tokenizador binario tiene un formato propietario documentado en el README; requiere implementación manual si no se usa el código de ejemplo.
- No se proporcionan scripts de inferencia ni ejemplos de uso en el repositorio, lo que puede dificultar la integración inicial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/NightingaleCen/moonshine-tiny-zh-onnx
- Modelo base original: https://huggingface.co/moonshine-ai/moonshine-tiny-zh
- Conversión ONNX alternativa: https://huggingface.co/onnx-community/moonshine-tiny-zh-ONNX
- Página del modelo en ModelScope: https://www.modelscope.cn/models/onnx-community/moonshine-tiny-zh-ONNX
- Repositorio de Moonshine en GitHub: https://github.com/moonshine-ai/moonshine
