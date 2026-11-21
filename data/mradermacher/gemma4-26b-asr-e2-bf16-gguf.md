# mradermacher/Gemma4-26B-ASR-E2-BF16-GGUF

## Resumen

Gemma4-26B-ASR-E2-BF16-GGUF es una versión cuantizada en formato GGUF de un modelo derivado de la familia Gemma 4, publicada por el usuario mradermacher en Hugging Face. El nombre del repositorio sugiere un modelo orientado a reconocimiento automático del habla (ASR), construido a partir del checkpoint `taharmasmaliyev07/Gemma4-26B-ASR-E2-BF16`. La model card es prácticamente inexistente: solo incluye metadatos generados automáticamente por la herramienta de conversión a GGUF y una referencia al modelo origen.

El dato más llamativo es la discrepancia entre el nombre del repositorio y los parámetros reales declarados en los safetensors: 572.794.416 parámetros (aproximadamente 0,57 mil millones), no 26 mil millones. Esta inconsistencia, junto con la ausencia de licencia, idiomas, pipeline y benchmarks, impide validar las capacidades reales del modelo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 2,0 GB, lo que es coherente con un modelo de ~0,6 mil millones de parámetros en BF16 (unos 1,1 GB de pesos) más las múltiples cuantizaciones incluidas.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente cautelar: sirve para documentar un artefacto del ecosistema GGUF del que no se puede confirmar ni arquitectura, ni licencia, ni rendimiento, y cuyo uso en producción no está justificado sin verificación adicional del modelo origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un derivado de Gemma 4 orientado a ASR; no confirmado) |
| Parametros totales | 572.794.416 (según safetensors del repo); el nombre indica "26B", dato no verificado y en aparente contradicción |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo origen se distribuye en BF16 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo. El nombre del repositorio apunta a un derivado de la familia Gemma 4 con una variante denominada "E2" y una orientación a ASR (reconocimiento automático del habla), pero la model card no describe capas, mecanismo de atención, tipo de tokenizador ni si incorpora un encoder de audio. Tampoco se detalla si es un transformer denso, un modelo híbrido o un adaptador sobre un modelo base.

Respecto al entrenamiento, no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. La única información técnica disponible es la relativa al proceso de cuantización: los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica una conversión desde pesos Hugging Face a GGUF con la herramienta estándar de llama.cpp. No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- El nombre del repositorio sugiere reconocimiento automático del habla (ASR), pero no se confirma ni el tipo de entrada (audio) ni el formato de salida (transcripción, timestamps, etc.).
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües.
- No se confirma ningún modo especial (thinking mode, visión, audio, etc.).
- La única capacidad verificable es la de ser cargado por runtimes compatibles con GGUF (llama.cpp y derivados).

## Casos de uso

- Evaluación comparativa de cuantizaciones GGUF: el repositorio incluye 12 variantes (desde Q2_K hasta Q8_0 y x-f16), lo que permite medir la degradación de calidad frente a tamaño en un pipeline de pruebas controlado, siempre que se valide primero el modelo origen.
- Transcripción de audio en local (hipotético): si el modelo origen confirma su naturaleza ASR, podría desplegarse con llama.cpp en entornos sin GPU para transcripciones de baja latencia; requiere verificación previa.
- Prototipado de pipelines de audio en CPU: el tamaño reducido de los pesos (2,0 GB de repo, ~1,1 GB en BF16) permite experimentar en máquinas sin acelerador, aunque la viabilidad funcional no está demostrada.
- Archivado y preservación de artefactos del ecosistema: dado el contexto de discusión sobre la disponibilidad futura de pesos abiertos, este repo puede conservarse como referencia histórica de una conversión GGUF concreta.
- Pruebas de integración de runtimes GGUF: útil para validar que una versión de llama.cpp carga correctamente cuantizaciones IQ4_XS y Q3_K_L sobre un checkpoint concreto.
- Auditoría de licencias y procedencia: caso de uso centrado en revisar la cadena de derivación (modelo origen → conversión → cuantización) antes de adoptar cualquier artefacto de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable. Como referencia orientativa basada en los 572.794.416 parámetros declarados, en BF16 los pesos ocuparían aproximadamente 1,1 GB; en Q4_K_M, alrededor de 0,35-0,4 GB; en Q8_0, unos 0,6 GB. Estas cifras son estimaciones aritméticas, no medidas publicadas.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM podría alojar las cuantizaciones pequeñas, pero no hay confirmación de que el modelo funcione.
- Cabe en GPU consumer: probablemente sí en el rango de 4-8 GB para cuantizaciones Q4-Q8, sujeto a verificación.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (Ollama, LM Studio, llama-cpp-python). No se confirma soporte de vLLM ni TGI, que requieren formatos distintos o conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables verificables, dado que no se puede confirmar la categoría real del modelo (ASR de ~0,6 B, derivado de Gemma 4, u otra cosa). Cualquier comparación con alternativas ASR (Whisper, Qwen3-ASR) o con modelos Gemma de distinto tamaño sería especulativa y no se sostiene con los datos proporcionados.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre ("26B") y los parámetros reales declarados (572.794.416): no se puede asumir que el modelo tenga 26 mil millones de parámetros.
- Ausencia total de licencia: no se puede determinar si el uso comercial está permitido. La licencia del modelo origen tampoco se especifica en la información disponible.
- Sin idiomas declarados: imposible evaluar cobertura lingüística.
- Sin benchmarks ni evaluaciones: no hay evidencia de calidad, precisión de transcripción ni robustez.
- Sin model card sustantiva: no se documentan sesgos, datos de entrenamiento ni limitaciones conocidas.
- Riesgo de alucinación: no evaluable por falta de información; en modelos ASR, el riesgo típico es la generación de texto inventado en segmentos de silencio o ruido.
- Procedencia dudosa: el autor de la conversión (mradermacher) es un tercero, no el desarrollador original; el checkpoint origen (`taharmasmaliyev07/...`) tampoco está verificado.
- 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Fecha de creación futura (2026-11-21) en los metadatos: conviene tratar las marcas temporales con cautela.
- No apto para producción sin auditoría previa del modelo origen, de la licencia y de una evaluación funcional reproducible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma4-26B-ASR-E2-BF16-GGUF
- Modelo origen referenciado en la model card: https://huggingface.co/taharmasmaliyev07/Gemma4-26B-ASR-E2-BF16
- Hilo de discusión relacionado (r/LocalLLaMA): https://www.reddit.com/r/LocalLLaMA/comments/1xuthme/if_open_weights_dry_up_what_are_you_archiving/
