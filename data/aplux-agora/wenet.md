# APLUX-Agora/WeNet

## Resumen

WeNet es un modelo de reconocimiento automático del habla (ASR) publicado por APLUX-Agora dentro de su catálogo "Model Farm", orientado a la transcripción de audio en chino a texto. El repositorio no contiene los pesos originales del modelo WeNet, sino recursos convertidos y empaquetados para su despliegue en placas con SoC de Qualcomm (QCS8550 y QCS6490), en formato ONNX y con soporte para el runtime QNN de Qualcomm. El tamaño del repositorio es de 0,2 GB, lo que sugiere un modelo compacto pensado para inferencia en el borde (edge AIoT).

La relevancia del artefacto no está en la innovación arquitectónica —WeNet es una herramienta de ASR ampliamente conocida en la comunidad— sino en la conversión a un formato desplegable y medido sobre hardware real. El autor publica métricas de RTF (Real Time Factor) sobre dos placas concretas: 0,122 en QCS8550 (Rhino Pi X1) y 0,168 en QCS6490 (Rhino Pi A1), ambas en precisión FP32. Esos valores indican que el modelo procesa audio entre 6 y 8 veces más rápido que tiempo real en esos SoC.

La información disponible es muy limitada: no se detallan parámetros, arquitectura interna, longitud de contexto ni composición del dataset de entrenamiento. La model card está mayoritariamente en chino y se centra en el proceso de descarga y despliegue, no en las características técnicas del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (WeNet, ASR; detalles internos no publicados en el repo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP32 (precisión por defecto reportada); otras precisiones no detalladas |
| Idiomas soportados | chino (la model card indica "将中文录音识别为文字", es decir, reconocimiento de audio en chino) |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); licencia del modelo fuente sujeta a los términos originales |
| Formato de pesos | ONNX (tag `onnx`), empaquetado por SoC en `targets/<SoC>/` con `model.json` y binarios `model.bin` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de parámetros ni el proceso de entrenamiento en la documentación proporcionada. El nombre "WeNet" corresponde a un toolkit de ASR de código abierto ampliamente utilizado, pero la model card de APLUX-Agora no describe la variante concreta ni sus datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas).

Lo que sí se documenta es el proceso de conversión y empaquetado: los recursos se distribuyen por SoC objetivo (`targets/QCS8550/`, `targets/QCS6490/`), con un `model.json` que especifica la precisión por defecto y las rutas de las variantes, y binarios `model.bin` para contextos; los paquetes multi-fichero se conservan tal como los publica Model Farm. Se incluyen también `NOTICE.md` y `SHA256SUMS` para verificación de procedencia e integridad.

## Capacidades

- Reconocimiento automático del habla (ASR) de audio en chino a texto.
- Entrada de audio y salida de texto, según la definición de la tarea en la model card.
- Despliegue optimizado para SoC de Qualcomm (QCS8550 y QCS6490) mediante runtime QNN.
- Inclusión de preprocesado y postprocesado junto con el runner, según indica la model card ("Pre- and post-processing, the runner and an exported project").
- Exportación de flujos de trabajo que utilicen el modelo desde la plataforma Agora.
- No se documentan capacidades de tool calling, agentes, multilingüismo más allá del chino, visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Transcripción de voz en dispositivos de borde: el modelo está empaquetado para SoC Qualcomm de bajo consumo (QCS6490, QCS8550), por lo que encaja en dispositivos IoT que necesitan ASR local sin enviar audio a la nube; el RTF de 0,122–0,168 confirma margen para procesamiento en tiempo real.
- Subtitulado o dictado en aplicaciones embebidas: con un RTF inferior a 0,2, el modelo puede transcribir flujos de audio continuos en placas como Rhino Pi X1 o Rhino Pi A1 sin saturar la CPU/NPU.
- Asistentes de voz para domótica o industria: al ejecutarse en el propio dispositivo, permite comandos por voz en chino sin dependencia de conectividad ni exposición de datos de audio.
- Prototipado rápido en la plataforma Agora: la model card ofrece una demo online (mega.aidlux.com/models/wenet) para evaluar el modelo sin disponer de una placa física, útil para validar la calidad de transcripción antes de invertir en hardware.
- Integración en pipelines de captura y registro: el paquete incluye preprocesado, postprocesado y runner, lo que facilita incorporar la transcripción a sistemas de logging o análisis de audio en despliegues AIoT.
- Evaluación comparativa de hardware: las métricas de RTF publicadas por placa permiten dimensionar el SoC necesario para un requisito de latencia concreto antes de desplegar.

## Benchmarks y rendimiento

La model card solo publica métricas de eficiencia (RTF) medidas en la plataforma Agora, no resultados de calidad de transcripción (WER, CER) ni benchmarks estándar de ASR.

| SoC · placa | Precisión | RTF medido en Agora |
|---|---|---|
| QCS8550 · Rhino Pi X1 | FP32 | 0,122 |
| QCS6490 · Rhino Pi A1 | FP32 | 0,168 |

No se han publicado resultados de benchmarks de calidad (WER, CER, MMLU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible; el repositorio completo ocupa 0,2 GB, pero no se especifica el consumo en ejecución.
- GPU/SoC recomendados: Qualcomm QCS8550 (placa Rhino Pi X1) y QCS6490 (placa Rhino Pi A1), según las mediciones publicadas.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el empaquetado está orientado a SoC Qualcomm con runtime QNN, no a GPUs de escritorio.
- Opciones de despliegue: runtime QNN de Qualcomm y la plataforma Agora (mega.aidlux.com); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,122 en QCS8550 y 0,168 en QCS6490 en FP32, lo que equivale a procesar audio entre aproximadamente 6 y 8 veces más rápido que tiempo real en esas placas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de calidad (WER/CER) que permitan una comparación rigurosa con otras alternativas de ASR en chino o en el borde.

## Limitaciones y advertencias

- La model card solo declara soporte de chino; no se documentan otros idiomas.
- No se publican métricas de calidad de transcripción (WER/CER), por lo que el rendimiento real en distintos dominios acústicos es desconocido.
- El artefacto está empaquetado específicamente para SoC Qualcomm (QCS8550, QCS6490); su uso en otro hardware requeriría conversión adicional.
- La licencia es la APLUX Model Farm License, distinta de la licencia del modelo fuente; es imprescindible revisar `LICENSE_MODEL_FARM.pdf` y `NOTICE.md` antes de cualquier uso comercial.
- La licencia del modelo fuente ("see the original model's terms") no se especifica en el repositorio, lo que añade incertidumbre sobre las restricciones de uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-09), lo que indica escasa validación por parte de la comunidad.
- No se documentan sesgos conocidos, pero al ser un modelo ASR en chino entrenado con datos no descritos, pueden existir sesgos dialectales o de dominio no identificados.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/WeNet
- Licencia del modelo (PDF): https://huggingface.co/APLUX-Agora/WeNet/blob/main/LICENSE_MODEL_FARM.pdf
- Demo online en Agora: https://mega.aidlux.com/models/wenet
- Plataforma Agora: https://mega.aidlux.com
