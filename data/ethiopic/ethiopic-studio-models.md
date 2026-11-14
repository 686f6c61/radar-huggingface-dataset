# ethiopic/ethiopic-studio-models

## Resumen

Ethiopic Studio Models es una colección de modelos de voz y texto para amárico (am) desarrollada por ethiopic para su producto EthiopicAI Voice Studio. El repositorio agrupa tres familias de modelos: reconocimiento automático del habla (ASR) basado en CTC, corrección ortográfica y de puntuación, y síntesis de voz (TTS) condicionada por referencia. No se trata de un único modelo, sino de un paquete de artefactos con licencias y formatos distintos que se distribuyen conjuntamente.

Los modelos ASR se derivan mediante fine-tuning de Meta Omnilingual ASR y se ofrecen en dos tamaños (1B y 300M parámetros), con variantes en PyTorch FP16 y ONNX INT8. La familia de síntesis, denominada OmniVoice, genera audio a 24 kHz y utiliza el códec compartido Higgs Audio v2 en FP32. El corrector es un modelo minúsculo orientado a restaurar puntuación y corregir ortografía en texto amárico.

La relevancia de esta colección reside en su enfoque en un idioma con escasa cobertura en el ecosistema open source: el amárico, escrito en alfabeto etíope. La disponibilidad de variantes ONNX INT8 para CPU sin dependencia de PyTorch facilita el despliegue en entornos con recursos limitados, aunque las licencias son mayoritariamente no comerciales, lo que restringe su adopción en producción sin acuerdos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR: CTC sobre Meta Omnilingual ASR; TTS: OmniVoice (condicionada por referencia); corrector: no disponible |
| Parametros totales | ASR: 1B y 300M; corrector: "tiny" (no disponible cifra exacta); TTS: no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ASR: FP16 y ONNX INT8; corrector: ONNX INT8 y FP32; TTS: FP16, FP32 y backbone INT8 para CPU |
| Idiomas soportados | am (amárico) |
| Licencia | ASR: pesos no comerciales, código MIT; corrector: CC BY-NC 4.0, código MIT; OmniVoice: CC BY-NC, código Apache-2.0; códec Higgs Audio v2: Boson Higgs Audio 2 Community License Agreement |
| Formato de pesos | PyTorch (FP16/FP32), ONNX (INT8); TTS usa códec Higgs Audio v2 en FP32 |

## Arquitectura y entrenamiento

Los modelos de reconocimiento son modelos CTC afinados a partir de Meta Omnilingual ASR. Producen transcripciones con marcas temporales de inicio y fin a nivel de palabra en segundos, lo que los hace adecuados para subtitulado y alineación temporal. Se ofrecen en dos escalas: el modelo de 1B prioriza la precisión, mientras que el de 300M reduce el consumo de memoria y habilita transcripción más rápida y dictado en vivo. Las variantes ONNX INT8 están pensadas para ejecutarse en CPU sin PyTorch.

La familia de síntesis OmniVoice emplea síntesis condicionada por referencia con prompts de voz reutilizables: el audio de referencia se empareja con su transcripción exacta. La síntesis produce audio a 24 kHz y utiliza el códec compartido Higgs Audio v2 en FP32; la variante INT8 para CPU sigue requiriendo PyTorch para embeddings, muestreo y el códec. El corrector es un modelo minúsculo con dos modos: modo puntuación (añade signos preservando las palabras originales) y modo completo (corrige ortografía y puntuación). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en amárico con marcas temporales a nivel de palabra (inicio y fin en segundos).
- Dos perfiles de ASR: alta precisión (1B) y bajo consumo con dictado en vivo (300M).
- Inferencia en CPU sin PyTorch mediante variantes ONNX INT8.
- Corrección ortográfica en texto amárico mecanografiado.
- Restauración de puntuación preservando las palabras del texto fuente (modo puntuación).
- Síntesis de voz condicionada por referencia con prompts de voz reutilizables.
- Generación de audio a 24 kHz mediante el códec Higgs Audio v2.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del ASR.

## Casos de uso

- Subtitulado y transcripción con marcas temporales: el ASR CTC genera tiempos de inicio y fin por palabra, lo que permite alinear subtítulos automáticamente en vídeo o audio en amárico sin herramientas externas de alineación.
- Dictado en vivo en aplicaciones de escritorio o móviles: la variante de 300M en ONNX INT8 reduce memoria y latencia, y puede ejecutarse en CPU sin PyTorch, lo que encaja en clientes ligeros.
- Transcripción por lotes de archivos de audio con recursos limitados: el modelo de 1B en FP16 prioriza precisión cuando hay GPU disponible, mientras que el 300M INT8 permite procesar en servidores sin acelerador.
- Normalización de texto amárico antes de TTS o indexación: el corrector en modo puntuación añade signos sin alterar las palabras, útil para preparar corpus o entradas de síntesis.
- Corrección de textos mecanografiados: el modo completo corrige ortografía y puntuación en documentos o formularios antes de su publicación.
- Síntesis de voz personalizada: OmniVoice permite reutilizar prompts de voz a partir de audio de referencia con su transcripción, útil para locuciones consistentes en aplicaciones de accesibilidad o contenido.
- Integración en pipelines de procesamiento de voz: la combinación de ASR, corrección y TTS permite construir flujos de transcripción, limpieza y re-síntesis dentro de una misma suite con formatos ONNX y PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- ASR 1B: FP16 requiere aproximadamente 2 GB de VRAM solo para pesos, más memoria para activaciones; se recomienda GPU con al menos 8 GB para lotes pequeños.
- ASR 300M: FP16 en torno a 0,6 GB de pesos; la variante ONNX INT8 reduce aún más el uso de memoria y puede ejecutarse en CPU.
- Corrector: modelo "tiny" con variantes ONNX INT8 y FP32; cabe en CPU y en GPU de gama baja.
- TTS OmniVoice: requiere el códec Higgs Audio v2 en FP32, lo que incrementa los requisitos frente al backbone; la variante INT8 para CPU sigue necesitando PyTorch para embeddings, muestreo y códec.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, el ASR 1B es viable en RTX 4090, A100 o H100, y el 300M en GPUs consumer con 4-8 GB.
- Despliegue: ONNX Runtime para las variantes INT8; PyTorch para FP16/FP32; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a ASR/TTS en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Ethiopic amharic-ctc (1B) | 1B | no disponible | am | Pesos no comerciales, código MIT | PyTorch FP16, ONNX INT8 |
| Ethiopic amharic-ctc-300m | 300M | no disponible | am | Pesos no comerciales, código MIT | PyTorch FP16, ONNX INT8 |
| Meta Omnilingual ASR (base) | no disponible | no disponible | multilingüe | no disponible | no disponible |
| Whisper (referencia ASR multilingüe) | 39M-1,55B | 30 s de audio | multilingüe | MIT | PyTorch, ONNX, GGML |

La comparación directa con Whisper es aproximada: Whisper cubre amárico entre sus idiomas, pero no ofrece marcas temporales a nivel de palabra de forma nativa ni variantes específicas para amárico. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Licencias restrictivas: los pesos ASR son de uso no comercial; el corrector es CC BY-NC 4.0; OmniVoice es CC BY-NC; el códec Higgs Audio v2 se rige por la Boson Higgs Audio 2 Community License Agreement. El uso comercial requiere acuerdos adicionales.
- Cobertura monolingüe: solo se declara soporte para amárico (am), sin datos sobre code-switching ni otros idiomas etíopes.
- Sin benchmarks publicados: no hay métricas de WER, MOS ni comparativas verificables en la información disponible.
- Riesgo de alucinación en el corrector: los modelos de corrección de texto pueden introducir cambios no deseados; el modo puntuación está diseñado para preservar palabras, pero no se documenta su tasa de error.
- Dependencia del códec en TTS: OmniVoice requiere el códec Higgs Audio v2 en FP32, y la variante CPU INT8 sigue necesitando PyTorch, lo que limita el despliegue puramente ONNX.
- Requisitos de referencia en TTS: la síntesis condicionada exige audio de referencia emparejado con su transcripción exacta, lo que añade complejidad operativa.
- Sin datos de sesgos: no se documentan sesgos conocidos ni evaluaciones de robustez.
- Fecha de creación futura en los metadatos (2026-11-13): conviene verificar la vigencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/ethiopic/ethiopic-studio-models
- Licencias (sección del README): https://huggingface.co/ethiopic/ethiopic-studio-models/blob/main/README.md#licenses
- Códec Higgs Audio v2 (licencia): https://huggingface.co/bosonai/higgs-audio-v2-tokenizer/blob/main/LICENSE
- Meta Omnilingual ASR: no disponible en la información proporcionada
- Paper, blog o demo de Ethiopic Studio Models: no disponible en la información proporcionada
