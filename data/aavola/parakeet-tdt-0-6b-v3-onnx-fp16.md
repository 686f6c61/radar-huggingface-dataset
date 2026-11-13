# Aavola/parakeet-tdt-0.6b-v3-onnx-fp16

## Resumen

Parakeet-TDT-0.6b-v3 en formato ONNX con cuantización fp16 es una conversión del modelo de reconocimiento automático del habla (ASR) de NVIDIA, exportado originalmente a ONNX por Ilya Stupakov (proyecto onnx-asr) y recomprimido a fp16 por el usuario Aavola para su uso en aplicaciones offline. El modelo base, nvidia/parakeet-tdt-0.6b-v3, emplea una arquitectura FastConformer combinada con un decodificador Token-and-Duration Transducer (TDT), con aproximadamente 0,6 mil millones de parámetros.

El propósito de esta ficha es documentar una distribución concreta: los grafos ONNX del encoder y del decoder-joint convertidos de fp32 a fp16 mediante el conversor float16 de ONNX Runtime con `keep_io_types=True`, manteniendo las entradas y salidas en fp32. No se han modificado los pesos más allá del cambio de precisión. El repositorio incluye además el front end mel (`nemo128.onnx`) y el vocabulario, copiados sin cambios del export original.

Es relevante para desarrolladores que necesitan ejecutar ASR multilingüe (25 idiomas europeos) en local, sin dependencia de servicios en la nube, con verificación de integridad mediante sumas SHA-256 y un fichero de autocomprobación (`selfcheck.txt`) pensado para detectar errores de cómputo en GPU. El tamaño del repositorio es de 1,3 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer + decodificador TDT (Token-and-Duration Transducer) |
| Parámetros totales | ~0,6 mil millones (según nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 (este repositorio); el export original es fp32 |
| Idiomas soportados | bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk (25 idiomas) |
| Licencia | CC BY 4.0 (modelo base NVIDIA); componentes onnx-asr bajo MIT |
| Formato de pesos | ONNX (encoder-model.onnx + encoder-model.onnx.data, decoder_joint-model.onnx, nemo128.onnx) |

## Arquitectura y entrenamiento

El modelo base emplea FastConformer, una variante de Conformer con atención por bloques que reduce el coste computacional en secuencias largas, acoplada a un decodificador TDT. El decodificador TDT predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por paso y mejora la eficiencia frente a transductores clásicos. El modelo está orientado a transcripción de audio a texto multilingüe.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineamiento o ajuste fino posteriores. Esta distribución concreta no reentrena el modelo: solo convierte los grafos ONNX de fp32 a fp16 con el conversor de ONNX Runtime, manteniendo los tipos de entrada y salida en fp32. Se incluye un fichero `weights.provenance` (en ruso) que documenta el origen de cada fichero de pesos y sobre qué se entrenó.

## Capacidades

- Reconocimiento automático del habla (transcripción audio a texto) en 25 idiomas europeos.
- Decodificación TDT con emisión conjunta de tokens y duraciones.
- Ejecución offline mediante ONNX Runtime, sin llamadas a servicios externos.
- Front end mel incluido (`nemo128.onnx`) para el preprocesado de audio.
- Verificación de integridad de pesos mediante SHA-256 y fichero `selfcheck.txt`.
- No se documentan capacidades de traducción, diarización, puntuación avanzada, tool calling ni agentes.

## Casos de uso

- Transcripción offline en aplicaciones de escritorio o móvil: la app descarga los ficheros ONNX bajo demanda y verifica cada uno contra su SHA-256 antes de ejecutarlo, lo que permite ASR local sin conexión.
- Subtitulado automático de vídeo y audio en 25 idiomas europeos: el modelo cubre lenguas eslavas, germánicas, románicas y bálticas, útil para pipelines de subtitulado multilingüe.
- Actas y notas de reuniones: transcripción de audio de reuniones en local para evitar enviar datos sensibles a la nube.
- Indexación y búsqueda de archivos de audio: conversión de archivos de voz a texto para alimentar motores de búsqueda o sistemas de recuperación.
- Asistentes de voz embebidos: integración en aplicaciones de escritorio con ONNX Runtime, aprovechando fp16 para reducir el uso de memoria frente al export fp32.
- Investigación en ASR multilingüe: base reproducible con sumas de verificación para comparar resultados entre ejecuciones en CPU y GPU.
- Accesibilidad: generación de transcripciones para contenido audiovisual en entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,3 GB en disco; en fp16 los pesos del encoder rondan 1,2 GB, por lo que se estima un uso de memoria en GPU del orden de 1,5-2 GB incluyendo activaciones y el decoder-joint.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; tarjetas consumer como RTX 3060, RTX 4060 o superiores deberían ser suficientes.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU modernas con 4 GB o más de VRAM.
- Despliegue: ONNX Runtime (CPU o GPU); el export original está pensado para onnx-asr. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR).
- Latencia y throughput: no disponibles en la información proporcionada. El fichero `selfcheck.txt` permite comparar la salida de la GPU con una referencia calculada en CPU para detectar cómputos incorrectos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia |
|---|---|---|---|---|
| Aavola/parakeet-tdt-0.6b-v3-onnx-fp16 | ~0,6 B | 25 europeos | ONNX fp16 | CC BY 4.0 |
| nvidia/parakeet-tdt-0.6b-v3 (base) | ~0,6 B | 25 europeos | NeMo / original | CC BY 4.0 |
| istupakov/parakeet-tdt-0.6b-v3-onnx | ~0,6 B | 25 europeos | ONNX fp32 | MIT (export) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha modificado la precisión (fp32 a fp16); cualquier limitación del modelo base se hereda.
- No se documentan sesgos específicos, pero al ser un modelo entrenado por NVIDIA sobre datos no descritos aquí, pueden existir sesgos de dominio y de idioma.
- Riesgo de alucinación en audio con ruido, acentos no representados o solapamiento de hablantes; no hay datos de robustez publicados.
- Longitud de contexto y límites de duración de audio no disponibles.
- La licencia CC BY 4.0 exige atribución a NVIDIA; el export onnx-asr es MIT y debe conservarse su aviso de licencia (`licenses/onnx-asr-MIT.txt`).
- El fichero `weights.provenance` está en ruso, lo que puede dificultar su auditoría a lectores no rusohablantes.
- El repositorio no incluye métricas de calidad (WER) ni instrucciones de uso detalladas; la verificación de integridad es responsabilidad del consumidor.
- El autor indica que los ficheros se mantienen en una revisión fija para uso offline, por lo que no se esperan actualizaciones.

## Enlaces

- Repositorio: https://huggingface.co/Aavola/parakeet-tdt-0.6b-v3-onnx-fp16
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export ONNX original: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx/tree/8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
