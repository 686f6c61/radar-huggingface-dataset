# DarumOrt/htdemucs-onnx

## Resumen

`DarumOrt/htdemucs-onnx` es una conversión a formato ONNX del modelo HTDemucs (Hybrid Transformer Demucs), una arquitectura de separación de fuentes musicales desarrollada originalmente por Meta AI Research dentro del proyecto Demucs. El modelo toma una mezcla de audio y devuelve las pistas aisladas de cada instrumento (típicamente batería, bajo, voz y otros), lo que lo hace útil en producción musical, remasterización, karaoke o análisis musical. La conversión a ONNX busca facilitar el despliegue fuera del ecosistema PyTorch, por ejemplo en aplicaciones C++, .NET o entornos de inferencia ligeros.

El repositorio es de autoría individual (usuario `DarumOrt`) y no incluye model card descriptiva: solo declara licencia MIT. No hay información publicada sobre parámetros, contexto, idiomas ni benchmarks en la información disponible. La fecha de creación indicada (2026-11-02) es futura respecto a la redacción habitual de fichas, lo que sugiere un posible error de metadatos o una fecha de publicación programada.

Es relevante para desarrolladores que necesiten separación de stems sin depender de PyTorch en tiempo de ejecución, aunque la ausencia de documentación obliga a verificar el grafo ONNX, las formas de entrada y la equivalencia numérica con el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HTDemucs (Hybrid Transformer Demucs), según el nombre del repositorio; no confirmado en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio); ventana de entrada no disponible |
| Tipos de cuantización | no disponible (formato ONNX; cuantizaciones INT8/FP16 no documentadas) |
| Idiomas soportados | no aplica (procesamiento de audio, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (presumiblemente `.onnx`; no se detalla en la model card) |

## Arquitectura y entrenamiento

El nombre del repositorio indica que se trata de HTDemucs, la variante híbrida de Demucs que combina un encoder/decoder convolucional con atención Transformer sobre el espectrograma, permitiendo modelar dependencias de largo alcance en la señal musical. El modelo original de Meta AI se entrena sobre datasets de música con stems separados (como MUSDB18-HQ y datos internos) mediante una pérdida multiescala en el dominio de la forma de onda y del espectrograma.

No obstante, la model card de este repositorio no aporta ningún detalle sobre el proceso de conversión: no se indica la versión exacta de HTDemucs exportada, el opset de ONNX, la técnica de exportación (torch.onnx.export, Optimum, etc.), ni si se ha validado la fidelidad numérica respecto al checkpoint original. Tampoco se documenta si se ha aplicado cuantización o poda durante la conversión.

## Capacidades

- Separación de fuentes musicales en stems (batería, bajo, voz, otros) a partir de una mezcla de audio, asumiendo el comportamiento estándar de HTDemucs.
- Procesamiento de audio estéreo a una frecuencia de muestreo típica de 44,1 kHz (comportamiento por defecto de Demucs; no confirmado en este repositorio).
- Inferencia mediante runtime ONNX (ONNX Runtime, OpenVINO, TensorRT) sin dependencia de PyTorch.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo puramente de audio.
- No se documentan capacidades adicionales como separación en tiempo real, streaming o modos de cuantización específicos.

## Casos de uso

- **Producción musical y remezcla**: extraer stems de una mezcla para reequilibrar niveles, aplicar procesado independiente o crear versiones alternativas, aprovechando la calidad de separación de HTDemucs.
- **Karaoke y eliminación de voz**: aislar la pista vocal para generar versiones instrumentales, integrándolo en una aplicación de escritorio o web mediante ONNX Runtime.
- **Despliegue en entornos sin PyTorch**: aplicaciones C++, .NET, Java o móviles donde instalar PyTorch es inviable; el formato ONNX permite usar ONNX Runtime como dependencia única.
- **Pipelines de postproducción de vídeo**: separar diálogo, música y efectos en una pista de audio de vídeo para su edición independiente en herramientas de edición no lineal.
- **Investigación en procesamiento de audio**: usar el modelo como baseline reproducible en experimentos de separación de fuentes, siempre que se valide la equivalencia con el checkpoint original.
- **Servicios de transcripción musical o análisis**: alimentar etapas posteriores (detección de tempo, transcripción de bajo o batería) con stems limpios en lugar de la mezcla completa.
- **Prototipado rápido en notebooks o servicios serverless**: al ser un artefacto ONNX, puede cargarse en entornos con restricciones de dependencias y ejecutarse en CPU o GPU según el runtime elegido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como SDR, SI-SDR ni comparaciones con el modelo original de Demucs.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del archivo ONNX no se especifica; HTDemucs original ronda los 80-100 M de parámetros, lo que suele requerir entre 1 y 4 GB de VRAM según el tamaño de la ventana de audio y el runtime.
- GPU recomendadas: no disponible. Por el tamaño típico de HTDemucs, una GPU consumer como RTX 3060 o superior debería ser suficiente, pero no está confirmado para esta conversión.
- Cabe en GPU consumer: probablemente sí, dado el tamaño habitual de HTDemucs, aunque no hay confirmación en el repositorio.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), OpenVINO, TensorRT, DirectML; no se documentan scripts de inferencia ni ejemplos de uso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DarumOrt/htdemucs-onnx | HTDemucs (ONNX) | no disponible | ONNX | MIT | Hugging Face |
| facebook/demucs (original) | HTDemucs (PyTorch) | ~80-100 M (aprox., no confirmado) | PyTorch | MIT | GitHub / PyPI |
| Spleeter (Deezer) | U-Net sobre espectrograma | ~20-50 M (aprox.) | TensorFlow | MIT | GitHub |
| Open-Unmix | LSTM sobre espectrograma | ~10-20 M (aprox.) | PyTorch | MIT | GitHub |

Los datos de parámetros de los modelos comparados son aproximados y no proceden de la información proporcionada; deben verificarse en sus respectivos repositorios.

## Limitaciones y advertencias

- La model card está vacía: no hay documentación sobre la versión de HTDemucs exportada, el opset, las formas de entrada/salida ni la validación numérica frente al original.
- Riesgo de que la conversión ONNX no sea fiel al checkpoint original (diferencias por operaciones no soportadas, cambios de precisión o exportación incompleta); se recomienda comparar SDR contra el modelo de referencia antes de usarlo en producción.
- No se especifican los requisitos de entrada (frecuencia de muestreo, canales, longitud de ventana), lo que puede provocar errores en tiempo de ejecución si se asumen valores incorrectos.
- Licencia MIT declarada, pero al derivar del proyecto Demucs conviene revisar también la licencia del modelo original y de los datos de entrenamiento para uso comercial.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia de que el artefacto funcione correctamente.
- Fecha de creación anómala (2026-11-02), lo que sugiere metadatos poco fiables.
- No apto para tareas de texto, razonamiento, código ni visión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DarumOrt/htdemucs-onnx
- Proyecto Demucs (Meta AI): https://github.com/facebookresearch/demucs
- Paper HTDemucs (Hybrid Transformer Demucs): https://arxiv.org/abs/2111.03600
- ONNX Runtime: https://onnxruntime.ai/
