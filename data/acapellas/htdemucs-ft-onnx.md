# Acapellas/htdemucs-ft-onnx

## Resumen

`Acapellas/htdemucs-ft-onnx` es una exportación a ONNX del modelo de separación de fuentes musicales Hybrid Transformer Demucs en su variante fine-tuned (`htdemucs_ft`), desarrollado originalmente por Meta AI (Alexandre Défossez y colaboradores) y exportado por StemSplitio. El repositorio es un re-host realizado por Acapellas para que la aplicación de escritorio Silverdaw pueda servir todos sus modelos desde una ubicación propia, con pesos byte-idénticos al original (mismo SHA-256). Resuelve el problema de separar una mezcla musical en cuatro pistas (vocals, drums, bass y other) ejecutando inferencia sobre ONNX Runtime sin dependencias de PyTorch.

La arquitectura es un transformer híbrido que combina procesamiento en el dominio de la forma de onda con atención sobre representaciones espectrales, descrito en el paper *Hybrid Transformers for Music Source Separation* (arXiv:2211.08553). El modelo se distribuye como cuatro ficheros ONNX independientes, uno por fuente, cada uno de aproximadamente 302 MB con pesos en fp32. En total el repositorio ocupa 1,3 GB.

Es relevante para desarrolladores que necesitan integrar separación de stems en aplicaciones de escritorio o pipelines offline sin arrastrar el stack de PyTorch, y para quienes buscan un motor de respaldo fiable cuando los modelos de mayor calidad (RoFormer) no están disponibles. La licencia MIT tanto de los pesos como de la exportación facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer Demucs (transformer híbrido waveform + espectrograma) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de audio, no tokens de texto) |
| Tipos de cuantizacion | fp32 (unica variante publicada en este repo) |
| Idiomas soportados | no aplica (modelo de audio, sin componente lingüistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (4 ficheros, uno por stem, sin `.data` externo) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Hybrid Transformer Demucs presentada en el paper de Rouard, Massa y Défossez (arXiv:2211.08553). Combina un encoder-decoder sobre la forma de onda con un transformer que opera sobre una representación tiempo-frecuencia, de modo que el modelo captura tanto estructura local de la señal como dependencias de largo alcance entre componentes musicales. La variante `htdemucs_ft` es un "bag" de cuatro modelos especialistas, uno por fuente (vocals, drums, bass, other), entrenados de forma independiente y combinados en inferencia.

Los detalles concretos del dataset de entrenamiento (número de horas, composición, uso de aumentación o fine-tuning específico) no están disponibles en la información proporcionada. La model card únicamente indica que se trata de la versión fine-tuned de Demucs v4 publicada por Meta bajo licencia MIT, y que la exportación a ONNX fue realizada por StemSplitio sin modificar los pesos. Cada fichero ONNX es autocontenido y usa fp32 en lugar de fp16 porque, para el execution provider de CPU, las operaciones fp16 suelen emularse (más lentas) en vez de acelerarse.

## Capacidades

- Separación de fuentes musicales en cuatro stems nativos: vocals, drums, bass y other.
- Procesamiento offline de pistas completas (no está diseñado para tiempo real ni para callbacks de audio).
- Ejecución sobre ONNX Runtime, con independencia del framework de entrenamiento original (no requiere PyTorch en producción).
- Cada stem se genera mediante un modelo especialista dedicado, lo que mejora la calidad frente a un único modelo multi-fuente.
- Compatible con execution providers de ONNX Runtime (CPU, CUDA, CoreML, DirectML, etc., según build).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de audio.

## Casos de uso

- Separación de stems en un DAW de escritorio: Silverdaw lo usa como motor de respaldo cuando los packs RoFormer (vocals + rhythm) no están instalados o el usuario selecciona explícitamente el motor alternativo. Se ejecuta en un hilo de trabajo en segundo plano.
- Creación de karaokes y pistas de acompañamiento: extrayendo el stem de vocals se obtiene una versión instrumental de una canción sin necesidad de masters multipista.
- Remezclas y edición musical: disponer de drums, bass, vocals y other por separado permite reequilibrar niveles, sustituir una sección rítmica o aplicar procesado independiente a cada elemento.
- Producción de sample packs y librerías: extracción masiva de loops de batería o líneas de bajo a partir de un catálogo musical para su reutilización en producción.
- Análisis musicológico y MIR (music information retrieval): separar componentes facilita tareas posteriores como detección de tempo, transcripción de bajo o análisis armónico sobre stems limpios.
- Pipelines de postproducción de audio para vídeo: separar diálogo/música/efectos aproximados a partir de mezclas simples cuando no se dispone de las pistas originales, usando el stem "other" como cajón para el resto.
- Automatización por lotes en servidor: al ser ONNX puro, se puede desplegar en contenedores ligeros sin CUDA ni PyTorch, procesando colas de ficheros en background.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas SDR, SIR ni comparativas numéricas frente a otros modelos de separación.

## Requisitos de hardware

- VRAM estimada: cada fichero ONNX pesa ~302 MB en fp32; en GPU la huella de inferencia es moderada (del orden de 1-2 GB por stem en función del tamaño de ventana y del execution provider). No hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU con soporte CUDA, DirectML o CoreML a través de los execution providers de ONNX Runtime; no se especifican modelos concretos en la información disponible.
- Consumer GPU: sí, cabe holgadamente en GPUs de consumo actuales; también puede ejecutarse en CPU (de hecho, la exportación en fp32 está pensada para el execution provider de CPU).
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, CoreML, DirectML, etc.). No se distribuye en GGUF, por lo que llama.cpp/Ollama no aplican. vLLM y TGI tampoco, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. La model card solo indica que es un modelo offline y que debe ejecutarse en un hilo de trabajo, no en el callback de audio en tiempo real.

## Comparativa con modelos similares

| Modelo | Tipo | Stems | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Acapellas/htdemucs-ft-onnx (este) | Hybrid Transformer Demucs fine-tuned | 4 (vocals, drums, bass, other) | ONNX fp32 | MIT | HuggingFace (re-host) |
| StemSplitio/htdemucs-ft-onnx | Mismo modelo, exportación original | 4 | ONNX fp32 | MIT | HuggingFace |
| silverdaw/mel-band-roformer-vocals-onnx | RoFormer (motor primario de Silverdaw) | 1 (vocals) | ONNX | no disponible en la información | HuggingFace |
| silverdaw/bs-roformer-rhythm-onnx | RoFormer (motor primario de Silverdaw) | 1 (rhythm) | ONNX | no disponible en la información | HuggingFace |

Según la model card, el par RoFormer de Silverdaw ofrece mayor calidad que este modelo y se usa como motor primario; `htdemucs_ft` actúa como respaldo. No se dispone de métricas numéricas para cuantificar la diferencia.

## Limitaciones y advertencias

- No es un modelo en tiempo real: la model card advierte explícitamente que debe ejecutarse en un hilo de trabajo o en segundo plano, no en un callback de audio.
- Calidad inferior al motor primario RoFormer según el propio autor de la aplicación que lo integra; está pensado como respaldo.
- Pesos en fp32: mayor uso de memoria y ancho de banda que una variante fp16, aunque se eligió por rendimiento en CPU (fp16 suele emularse).
- No hay información sobre sesgos, composición del dataset de entrenamiento ni evaluación de robustez frente a géneros poco representados.
- Riesgo de artefactos y "bleeding" entre stems en mezclas densas o con instrumentación atípica; no cuantificado en la documentación disponible.
- Sin soporte de texto, idiomas, tool calling ni agentes: cualquier expectativa en ese sentido es un error de categoría.
- Licencia MIT permite uso comercial, pero conviene conservar la atribución a Meta/Défossez (pesos), StemSplitio (exportación) y el paper original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es un re-host reciente, no un modelo con comunidad activa.

## Enlaces

- HuggingFace (este repo): https://huggingface.co/Acapellas/htdemucs-ft-onnx
- Exportación original: https://huggingface.co/StemSplitio/htdemucs-ft-onnx
- Repositorio de Demucs (Meta): https://github.com/facebookresearch/demucs
- Paper: *Hybrid Transformers for Music Source Separation* — https://arxiv.org/abs/2211.08553
- Aplicación Silverdaw: https://github.com/irarainey/silverdaw
- Motor primario vocals (RoFormer): https://huggingface.co/silverdaw/mel-band-roformer-vocals-onnx
- Motor primario rhythm (RoFormer): https://huggingface.co/silverdaw/bs-roformer-rhythm-onnx
