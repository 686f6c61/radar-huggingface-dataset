# happytunesai/orpheus-medium-onnx

## Resumen

Orpheus Medium ONNX es una conversión a formato ONNX del modelo base Orpheus Music Transformer, desarrollado originalmente por asigalov61 (Project Los Angeles / Tegridy Code). Se trata de un transformer autorregresivo para generación de música simbólica en formato MIDI, no de audio. La conversión la firma happytunesai y su objetivo es permitir que el módulo MidiCreator de la aplicación MidiEditor AI pueda continuar, componer y reajustar la altura tonal de eventos MIDI dentro del editor usando ONNX Runtime, sin necesidad de un entorno Python.

El checkpoint original sobre el que se construye la exportación es `Orpheus_Music_Transformer_Trained_Model_128497_steps_0.6934_loss_0.7927_acc.pth`, con 8 capas y 32 cabezas de atención. No se ha reentrenado ni ajustado el modelo: la conversión reconstruye la red como un único grafo ONNX y cuantiza a 4 bits los pesos de las multiplicaciones de matrices, lo que reduce el fichero a 411 MB y lo hace ejecutable en CPU.

Su relevancia es de nicho pero concreta: cubre la necesidad de desplegar generación musical simbólica embebida en herramientas de escritorio sin dependencias pesadas de Python ni GPU, a costa de una ligera desviación en la salida respecto al modelo original y de una dependencia estricta del operador `GroupQueryAttention` de ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo para música simbólica (MIDI); 8 capas, 32 cabezas de atención, rotary embedding |
| Parametros totales | no disponible (el checkpoint original no declara el recuento en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de MatMul cuantizados a 4 bits, block-wise (`MatMulNBits`, una escala por cada 32 pesos); buffers key/value en float16 |
| Idiomas soportados | no aplica (modelo de música simbólica, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`orpheus.onnx`, 411 MB) más fichero auxiliar `orpheus.json` (1 KB) con tamaños e ids de token |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo orientado a modelar secuencias de tokens MIDI, con 8 capas y 32 cabezas de atención. La exportación sustituye la atención por el operador `GroupQueryAttention` del dominio `com.microsoft` de ONNX Runtime, integrando el rotary embedding dentro del operador y manteniendo un buffer key/value por capa en float16. El grafo se reconstruyó a partir del checkpoint original sin reentrenamiento ni fine-tuning.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del corpus MIDI, ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de música simbólica). La innovación técnica destacable de esta ficha es la propia exportación: cuantización 4-bit block-wise de las matrices y uso de `GroupQueryAttention` para habilitar inferencia en CPU con ONNX Runtime. La contrapartida es que el modelo solo carga en ONNX Runtime y no en otros runtimes ONNX, y que la salida es cercana pero no idéntica a la del modelo original.

## Capacidades

- Generación de música simbólica en formato MIDI de forma autorregresiva.
- Continuación de fragmentos MIDI existentes dentro de un editor.
- Composición de nuevas secuencias MIDI.
- Reajuste de altura tonal (re-pitch) de eventos MIDI.
- Ejecución en CPU mediante ONNX Runtime, sin Python.
- Integración con el módulo MidiCreator de MidiEditor AI.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo thinking ni de otras capacidades especiales.

## Casos de uso

- Composición asistida dentro de un editor MIDI de escritorio: el modelo se invoca desde MidiCreator para generar nuevas secciones a partir de un fragmento existente, sin requerir Python ni GPU en la máquina del usuario.
- Continuación de ideas musicales: dado un clip MIDI incompleto, el modelo prolonga la secuencia respetando el contexto previo, útil en flujos de trabajo de producción musical rápida.
- Reajuste tonal de pasajes: el modelo permite re-pitch de eventos MIDI dentro del editor, facilitando la adaptación de una pieza a otra tonalidad o registro.
- Prototipado musical en entornos sin GPU: al ejecutarse en CPU con ONNX Runtime, encaja en portátiles y estaciones de trabajo modestas para generar borradores.
- Herramientas educativas de teoría musical: permite generar ejemplos MIDI de progresiones o patrones para ilustrar conceptos en clase.
- Integración en pipelines de creación de contenido: la exportación ONNX facilita embeber el modelo en aplicaciones de escritorio o servicios ligeros que ya usan ONNX Runtime para otras tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El checkpoint original reporta un loss de 0,6934 y una accuracy de 0,7927 en el paso 128497 de entrenamiento, pero no se aportan métricas comparativas estandarizadas (tipo MMLU, HumanEval o GSM8K, que además no aplican a este dominio).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en su configuración principal, ya que está pensado para ejecución en CPU; el fichero de 411 MB con pesos 4-bit y buffers key/value en float16 es ligero.
- GPU recomendadas: no disponible; el modelo se diseñó para ONNX Runtime en CPU.
- Cabe en GPU consumer: no disponible como dato confirmado; por tamaño cabría en cualquier GPU con varios GB de memoria, pero no se documenta soporte GPU.
- Opciones de despliegue: ONNX Runtime exclusivamente (el grafo usa el operador `GroupQueryAttention` del dominio `com.microsoft` y no carga en otros runtimes ONNX). No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orpheus Medium ONNX (esta ficha) | Transformer MIDI, ONNX 4-bit | no disponible | no disponible | Apache-2.0 | Hugging Face, solo ONNX Runtime |
| Orpheus Music Transformer (original) | Transformer MIDI, PyTorch | no disponible | no disponible | Apache-2.0 | Hugging Face, Space y colección de asigalov61 |
| Alternativas de música simbólica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables de música simbólica, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- La salida no es idéntica a la del modelo original: la cuantización 4-bit introduce desviaciones respecto al checkpoint en precisión completa.
- Dependencia estricta de ONNX Runtime: el grafo usa `GroupQueryAttention` del dominio `com.microsoft` y no carga en otros runtimes ONNX.
- Requiere mantener juntos `orpheus.onnx` y `orpheus.json` en la misma carpeta para funcionar.
- No se ha reentrenado ni ajustado; hereda los sesgos y limitaciones del modelo base de asigalov61.
- Riesgo de generación musical incoherente o repetitiva en secuencias largas; no se documenta la longitud de contexto soportada.
- No apto para tareas de texto, código, visión ni audio; es exclusivamente simbólico (MIDI).
- Licencia Apache-2.0 permite uso comercial, pero la conversión se ofrece "as is" sin garantía alguna.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/happytunesai/orpheus-medium-onnx
- Modelo original: https://huggingface.co/asigalov61/Orpheus-Music-Transformer
- Space del modelo original: https://huggingface.co/spaces/asigalov61/Orpheus-Music-Transformer
- Colección del modelo original: https://huggingface.co/collections/asigalov61/orpheus-music-transformer
- Repositorio MidiEditor AI: https://github.com/happytunesai/MidiEditor_AI
