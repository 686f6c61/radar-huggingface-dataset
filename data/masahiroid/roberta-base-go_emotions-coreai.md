# masahiroid/roberta-base-go_emotions-coreai

## Resumen

`masahiroid/roberta-base-go_emotions-coreai` es una conversión de formato del modelo de clasificación de emociones `SamLowe/roberta-base-go_emotions`, empaquetada como asset `.aimodel` para el runtime Apple Core AI. No se trata de un modelo nuevo ni de un fine-tuning adicional: el autor declara explícitamente que es una conversión del checkpoint original en la revisión `d75048347613a25d77de8cf6412eaae9fa7b26be`, sin entrenamiento ni reemplazo de pesos. El objetivo es permitir la ejecución del clasificador en el stack de inferencia de Apple (Core AI) sobre macOS, con ejecución en GPU.

El modelo subyacente es un RoBERTa-base (arquitectura transformer encoder, aproximadamente 125 millones de parámetros) ajustado para clasificación multietiqueta de 28 emociones en inglés. La salida son 28 logits independientes que deben interpretarse con sigmoides, de modo que varias emociones pueden activarse simultáneamente en un mismo texto. La conversión mantiene precisión F32 y una forma de entrada fija de `[1, 128]` (batch 1, secuencia de 128 tokens).

La relevancia de esta ficha es acotada y muy específica: sirve a desarrolladores que quieran desplegar el clasificador de emociones en el ecosistema Apple Core AI sin pasar por PyTorch, con verificaciones de paridad numérica documentadas. No incorpora mejoras de calidad de tarea, ni benchmarks de rendimiento, ni soporte multilingüe más allá del inglés del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base), clasificación multietiqueta |
| Parámetros totales | no disponible (el modelo base RoBERTa-base ronda los 125 M; no confirmado en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (forma de entrada fija `[1, 128]` en el export Core AI) |
| Tipos de cuantización | F32 (baseline declarado); el autor indica explícitamente que no es una cuantización de 4 bits |
| Idiomas soportados | inglés (el modelo original es de emociones en inglés; pruebas de conversión incluyen japonés solo como caso de validación) |
| Licencia | MIT (pesos); código de conversión y runtime también MIT |
| Formato de pesos | `.aimodel` (Apple Core AI); no es `.mlpackage` de Core ML |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `SamLowe/roberta-base-go_emotions`: un encoder RoBERTa-base con cabeza de clasificación de 28 etiquetas de emoción, entrenado sobre el dataset GoEmotions. La inferencia debe hacerse con activación sigmoide independiente por etiqueta, ya que el problema es multietiqueta y no exclusivo. Esta conversión no añade entrenamiento: el autor indica que no hay fine-tuning ni checkpoint de reemplazo, y que los pesos y derechos de licencia permanecen en los autores originales.

La innovación técnica de este artefacto es puramente de empaquetado y portabilidad. Se exporta a un asset Core AI con precisión F32, forma fija `[1, 128]` y ejecución en GPU sobre macOS. El autor documenta el proceso de conversión con versiones concretas de herramientas (PyTorch 2.14.1, Transformers 4.57.3, coreai-torch 0.4.3, coreai-core 1.0.0b3, Python 3.14 para la validación Core AI) e incluye scripts de conversión y ficheros `provenance.json` y `validation.json` para reproducibilidad.

## Capacidades

- Clasificación de emociones en inglés con 28 etiquetas independientes mediante sigmoides (varias emociones pueden aplicar a la vez).
- Procesamiento de texto corto: la entrada se trunca o rellena a 128 tokens, adecuado para frases, tuits, reseñas o mensajes.
- Ejecución en GPU mediante el runtime Apple Core AI en macOS (probado en macOS 27.2 con `coreai-core==1.0.0b3`).
- Integración con el tokenizador de Transformers (`AutoTokenizer`, `use_fast=True`) para preprocesado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés del modelo original; el japonés aparece solo como caso de prueba de conversión, no como capacidad declarada.

## Casos de uso

- Moderación de comunidades y redes sociales: clasificar mensajes de usuario en 28 emociones para priorizar revisiones humanas de contenido con carga emocional negativa (ira, disgusto, tristeza), aprovechando la inferencia local en GPU en macOS.
- Análisis de satisfacción en atención al cliente: etiquetar transcripciones cortas de tickets o chats con emociones predominantes para enrutar casos críticos, con la ventaja de que el modelo cabe en un asset ligero y se ejecuta en el dispositivo.
- Investigación en psicolingüística y análisis de sentimiento fino: sustituir clasificaciones binarias positivo/negativo por un vector de 28 emociones, útil en estudios que requieren granularidad emocional sobre corpus en inglés.
- Enriquecimiento de datasets de entrenamiento: generar etiquetas emocionales multietiqueta sobre grandes volúmenes de texto corto en pipelines de preprocesado, aprovechando el formato F32 y la forma fija para lotes de tamaño 1.
- Aplicaciones de bienestar y diarios personales en macOS: detectar el tono emocional de entradas de texto del usuario de forma local, sin enviar datos a servidores, gracias a la ejecución en GPU del dispositivo.
- Filtrado de reseñas de producto: clasificar reseñas cortas en emociones para generar agregados por categoría o detectar reseñas con frustración extrema y escalarlas a soporte.
- Validación de pipelines de conversión de modelos: usar los scripts y ficheros de validación incluidos como referencia para verificar la paridad numérica de otras conversiones a Core AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (F1, precisión, recall por emoción) en la información disponible para esta conversión. El autor solo documenta verificaciones de paridad numérica frente a la implementación PyTorch original sobre 6 casos deterministas: diferencia absoluta máxima de `1.1444092e-05` y similitud coseno mínima de `0.99999982`. El autor aclara que son comprobaciones de paridad de conversión, no benchmarks de calidad de tarea ni de latencia.

Como referencia externa, la información de búsqueda menciona una versión fine-tuned del mismo modelo base con métricas en evaluación: loss 0.0842, accuracy 0.4783, precision 0.5044, recall 0.4484, F1 0.4542. No corresponde a este artefacto concreto y no debe atribuirse a él.

## Requisitos de hardware

- Inferencia mediante Apple Core AI en macOS, con ejecución en GPU (`ComputeUnitKind.gpu()`); el autor probó en macOS 27.2.
- No se especifica VRAM ni memoria unificada mínima; el repo ocupa 0.5 GB y los pesos son F32, por lo que el modelo es ligero para hardware Apple moderno.
- No se documentan GPU NVIDIA (A100, H100, RTX 4090) para este formato `.aimodel`; el artefacto está orientado al stack Apple.
- El autor publica formatos alternativos para otros entornos: MLX, Core ML, GGUF y Core AI (enlaces en la sección de enlaces).
- Opciones de despliegue: runtime `coreai` con `AIModel.load`, `SpecializationOptions.from_preferred_compute_unit_kind` y `load_function`; el tokenizador se carga con Transformers.
- Latencia y throughput: no disponibles; el autor no publica benchmarks de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `masahiroid/roberta-base-go_emotions-coreai` | no disponible (base RoBERTa-base) | 128 tokens fijos | `.aimodel` (Core AI) | MIT | Conversión F32 para Apple Core AI, sin entrenamiento nuevo |
| `SamLowe/roberta-base-go_emotions` | no disponible (base RoBERTa-base) | contexto original de RoBERTa | safetensors/PyTorch | MIT | Modelo original de clasificación de 28 emociones |
| `masahiroid/roberta-base-go_emotions-mlx` | no disponible | contexto máximo original | MLX | MIT | Misma conversión para MLX |
| `masahiroid/roberta-base-go_emotions-gguf` | no disponible | contexto máximo original | GGUF | MIT | Misma conversión para llama.cpp/Ollama |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: la calidad de clasificación es la del checkpoint original `SamLowe/roberta-base-go_emotions`; la conversión solo garantiza paridad numérica.
- El autor advierte que no hay certificación de seguridad ni licencia comercial adicional implícita; los pesos siguen bajo MIT con los términos upstream en `LICENSE`.
- La forma de entrada es fija `[1, 128]`: hay que rellenar o truncar siempre a 128 tokens, lo que limita el análisis de textos largos y obliga a trocearlos.
- Solo inglés: no hay soporte multilingüe declarado; el japonés solo se usa como caso de prueba de conversión.
- Riesgo de ambigüedad y errores de etiquetado en el dataset GoEmotions, que según la información de búsqueda puede constreñir el rendimiento del modelo original.
- Compatibilidad de versiones no garantizada fuera del entorno probado (PyTorch 2.14.1, Transformers 4.57.3, coreai-torch 0.4.3, coreai-core 1.0.0b3).
- No es un `.mlpackage` de Core ML; requiere el runtime Core AI, no Core ML.
- Sin benchmarks de latencia ni de calidad de tarea publicados para este artefacto.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos/negativos en las 28 etiquetas; las salidas deben calibrarse con umbrales por etiqueta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/roberta-base-go_emotions-coreai
- Modelo base original: https://huggingface.co/SamLowe/roberta-base-go_emotions
- Revisión del modelo base usada: https://huggingface.co/SamLowe/roberta-base-go_emotions/tree/d75048347613a25d77de8cf6412eaae9fa7b26be
- Variante MLX: https://huggingface.co/masahiroid/roberta-base-go_emotions-mlx
- Variante Core ML: https://huggingface.co/masahiroid/roberta-base-go_emotions-coreml
- Variante GGUF: https://huggingface.co/masahiroid/roberta-base-go_emotions-gguf
- Referencia externa con métricas del modelo base: https://huggingface.co/Prasadrao/roberta-base-go-emotions
- Referencia externa sobre limitaciones del dataset GoEmotions: https://huggingface.co/MicahB/roberta-base-go_emotions
