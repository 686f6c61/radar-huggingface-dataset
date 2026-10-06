# Micklavin/whisper-small-oga-int8

## Resumen

Micklavin/whisper-small-oga-int8 es una exportación cuantizada a INT8 del modelo OpenAI Whisper Small, empaquetada específicamente para ONNX Runtime GenAI (OGA). El autor, Micklavin, ha tomado el checkpoint openai/whisper-small en una revisión inmutable concreta (`973afd24965f72e36ca33b3055d56a652f456b4d`) y lo ha convertido con el convertidor Whisper de Microsoft ONNX Runtime, generando grafos ONNX de encoder y decoder con pesos cuantizados de forma simétrica a 8 bits y datos tensoriales externos. El resultado se distribuye como un paquete de aproximadamente 0,5 GB pensado para cargarse directamente con `og.Model(model_directory)` en ONNX Runtime GenAI 0.17.1.

El problema que resuelve es la integración de un sistema de reconocimiento automático del habla (ASR) multilingüe en entornos que ya utilizan el ecosistema ONNX Runtime GenAI, evitando la conversión manual de pesos PyTorch y aprovechando la ruta de grafos sin beam search de OGA. Al mantener la variante multilingüe (no el checkpoint `.en`) y usar cuantización INT8, busca reducir el uso de memoria y el coste de despliegue frente al modelo original en precisión completa, a costa de renunciar a la búsqueda por haces (el valor por defecto es `num_beams: 1`).

Es relevante ahora porque cubre un nicho muy concreto: pipelines de inferencia en producción que quieren ASR multilingüe con ONNX Runtime GenAI, especialmente en Windows (el autor menciona el proveedor Windows ML). Conviene subrayar que el propio autor advierte que la precisión de transcripción, la latencia y el consumo de memoria no están cualificados para este artefacto, por lo que se trata de un paquete recién publicado (0 descargas, 0 likes en el momento de la ficha) sin validación empírica publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con cross-attention; exportado a grafos ONNX |
| Parametros totales | 244 M (correspondientes a openai/whisper-small; no declarado explícitamente en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos (entrada de 80 bins Mel); no disponible un valor en tokens |
| Tipos de cuantizacion | INT8 simétrico de pesos (encoder y decoder) |
| Idiomas soportados | Multilingüe (variante no `.en`); lista concreta de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con datos tensoriales externos (external ONNX tensor data), paquete onnxruntime-genai |

## Arquitectura y entrenamiento

El modelo es una exportación de openai/whisper-small, un transformer encoder-decoder de tipo Whisper. El encoder consume una representación log-Mel de 80 bins de una ventana de audio de 30 segundos, y el decoder genera la transcripción de forma autorregresiva con cross-attention sobre la salida del encoder. El paquete expone las salidas `output_cross_qk_0` a `output_cross_qk_11` (correspondientes a las 12 capas del decoder de whisper-small), que son tensores de alineación cross-query/key, aunque el autor aclara que el paquete no proporciona marcas de tiempo alineadas por palabra o segmento y que el grafo opcional `jump_times` se ha omitido intencionalmente, manteniendo `timestamps: false` en el manifiesto.

En cuanto al proceso de conversión, se ha usado el convertidor Whisper de Microsoft ONNX Runtime sobre una revisión inmutable del modelo original, aplicando cuantización INT8 simétrica sobre los pesos y separando los datos tensoriales en ficheros externos. El decoder emplea la ruta de grafo de OGA sin beam search (`num_beams: 1` por defecto). El autor indica que las comprobaciones de ONNX y la carga del modelo/procesador en OGA han pasado, pero que la precisión de transcripción, la ejecución con el proveedor Windows ML, la latencia y la memoria no están cualificadas para este artefacto. No se detalla información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF/DPO, ya que esos datos corresponden al modelo base y no se reproducen en la model card.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe, al usar la variante no `.en` de whisper-small.
- Transcripción de audio en ventanas de 30 segundos con entrada basada en 80 bins Mel.
- Generación de transcripciones mediante decodificación autorregresiva (greedy, `num_beams: 1`).
- Exposición de tensores de cross-attention (`output_cross_qk_0`–`output_cross_qk_11`) como entradas de alineación para implementaciones propias.
- Integración con el ecosistema ONNX Runtime GenAI 0.17.1 mediante `og.Model(model_directory)`.
- No soporta generation de texto general, tool calling, function calling ni razonamiento multi-step fuera del ámbito ASR.
- No proporciona marcas de tiempo alineadas (timestamps desactivados por defecto); la alineación requeriría una implementación separada.
- Capacidades de visión o audio más allá de la transcripción: no disponibles.

## Casos de uso

- Transcripción de reuniones y notas de voz en aplicaciones de escritorio: el paquete puede cargarse en ONNX Runtime GenAI dentro de una app nativa (incluido el escenario Windows ML) y procesar audio por segmentos de 30 segundos, aprovechando la cuantización INT8 para reducir el consumo de memoria en máquinas sin GPU dedicada.
- Subtitulado automático multilingüe: al ser la variante multilingüe de whisper-small, permite generar subtítulos en varios idiomas; las marcas de tiempo tendrían que gestionarse por fuera del paquete, ya que `timestamps: false`.
- Preprocesado de audio en pipelines de NLP: transcribir llamadas, entrevistas o podcasts antes de pasarlos a un modelo de lenguaje para resumen o análisis, integrándose en flujos que ya usan ONNX Runtime.
- Despliegue en entornos sin PyTorch: al distribuirse como grafos ONNX con pesos INT8, evita instalar la pila de PyTorch y encaja en servicios que ya dependen de ONNX Runtime.
- Prototipado de ASR en local: el tamaño del repositorio (0,5 GB) y la cuantización INT8 permiten ejecutar la inferencia en portátiles para pruebas rápidas, aunque el autor no cualifica latencia ni memoria.
- Investigación sobre alineación audio-texto: la exposición de los tensores `output_cross_qk_*` permite experimentar con métodos propios de alineación forzada o detección de segmentos, usando el modelo como extractor de atención.
- Integración en pipelines de CI/CD para pruebas de regresión de ASR: verificar que la conversión y carga del grafo ONNX funcionan en cada build, dado que el autor confirma que las comprobaciones de ONNX y OGA han pasado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que la precisión de transcripción, la latencia y el consumo de memoria no están cualificados para este artefacto, por lo que no debe asumirse un rendimiento equivalente al de openai/whisper-small en precisión completa sin una evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 244 M de parámetros en INT8, se estima un consumo de aproximadamente 0,5–1,5 GB de VRAM para los pesos y el estado de inferencia; el autor no publica cifras medidas.
- Memoria en CPU: el paquete (0,5 GB) puede ejecutarse en CPU con ONNX Runtime, aunque no hay datos de latencia.
- GPU recomendadas: no disponibles de forma oficial; por tamaño, cualquier GPU con 2 GB o más de VRAM debería ser suficiente (por ejemplo, GTX 1650, RTX 3060, RTX 4090, A100, H100), pero el autor no aporta validación.
- Cabe en GPU de consumo: sí, con margen amplio, según el tamaño del modelo; sin datos de rendimiento validados.
- Opciones de despliegue: ONNX Runtime GenAI 0.17.1 (API `og.Model`), con mención al proveedor Windows ML. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni Whisper.cpp.
- Latencia y throughput estimados: no disponibles; el autor indica que no están cualificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Micklavin/whisper-small-oga-int8 | 244 M (whisper-small) | Ventana de audio de 30 s | ONNX INT8 para onnxruntime-genai | Apache-2.0 | Publicado, 0 descargas |
| openai/whisper-small | 244 M | Ventana de audio de 30 s | PyTorch / safetensors (fp32/fp16) | Apache-2.0 | Ampliamente usado, con benchmarks publicados |
| openai/whisper-base | 74 M | Ventana de audio de 30 s | PyTorch / safetensors | Apache-2.0 | Disponible |
| openai/whisper-medium | 769 M | Ventana de audio de 30 s | PyTorch / safetensors | Apache-2.0 | Disponible |

La ventaja diferencial de este paquete es su integración directa con ONNX Runtime GenAI y la cuantización INT8, mientras que el original openai/whisper-small requiere PyTorch o una conversión propia. No hay datos de rendimiento comparativos publicados para este artefacto.

## Limitaciones y advertencias

- La precisión de transcripción no está cualificada por el autor: no hay evaluación de WER ni comparación con el modelo original en precisión completa.
- La latencia y el consumo de memoria no están medidos ni validados.
- La ejecución con el proveedor Windows ML no está verificada.
- No se proporcionan marcas de tiempo alineadas por palabra o segmento; el grafo `jump_times` se ha omitido y `timestamps: false` se mantiene en el manifiesto.
- Decodificación limitada a `num_beams: 1` (sin búsqueda por haces), lo que puede reducir la calidad frente a configuraciones con beam search.
- La cuantización INT8 puede introducir degradación adicional frente al modelo en precisión completa; no cuantificada en la información disponible.
- Lista concreta de idiomas soportados no disponible; aunque la base es multilingüe, no se enumeran los idiomas ni su cobertura.
- Riesgo de alucinación propio de los modelos Whisper (repeticiones, invención de texto en audio ruidoso o silencioso); no se documenta mitigación específica.
- Sesgos: no documentados en la model card; heredados del modelo base openai/whisper-small.
- El paquete debe descargarse como snapshot completo del repositorio, manteniendo juntos tokenizador, procesador de audio, ambos grafos ONNX y los pesos externos; las rutas del manifiesto son relativas al directorio del paquete.
- Licencia Apache-2.0, que permite uso comercial, pero se remite a la model card del modelo base y a los avisos aplicables; conviene revisar dichos términos antes de producción.
- Estado del artefacto: recién publicado (creado y actualizado el 6 de octubre de 2026), con 0 descargas y 0 likes, sin validación por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/Micklavin/whisper-small-oga-int8
- Modelo base: https://huggingface.co/openai/whisper-small
- Revisión inmutable del modelo base: `973afd24965f72e36ca33b3055d56a652f456b4d`
- ONNX Runtime GenAI: no se proporciona enlace directo en la información disponible
- Convertidor Whisper de Microsoft ONNX Runtime: no se proporciona enlace directo en la información disponible
- Paper de Whisper: no se proporciona enlace directo en la información disponible
