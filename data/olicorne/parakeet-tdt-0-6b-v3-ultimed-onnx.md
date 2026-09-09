# Olicorne/parakeet-tdt-0.6b-v3-UltiMed-onnx

## Resumen

parakeet-tdt-0.6b-v3-UltiMed-onnx es un modelo de reconocimiento automático de voz (ASR) afinado en francés médico y exportado a ONNX para inferencia en navegador y CPU. Lo desarrolla Olicorne a partir del modelo base `nvidia/parakeet-tdt-0.6b-v3`, un NeMo Conformer-TDT de 0.6 mil millones de parámetros. El fine-tune se realiza sobre el dataset `Olicorne/UltiMed-ASR-FR-v1` y se distribuye en cuatro precisiones (fp32, fp16, int8 y w4a8), lo que permite ejecutarlo directamente en el navegador sin instalar nada y sin enviar audio a servidores.

El modelo resuelve la transcripción de vocabulario médico en francés, con una mejora sustancial frente al modelo base: en los conjuntos de evaluación médicos, el WER macro con decodificación greedy cae de 30,9 % a 5,8 %. Su relevancia radica en el ámbito sanitario francófono, donde el dictado clínico exige precisión en términos técnicos, fármacos y acrónimos, y en la posibilidad de desplegarlo en dispositivos de bajo consumo o en el navegador, manteniendo la privacidad de los datos del paciente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer-TDT |
| Parametros totales | 0.6B (aprox. 600 millones) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible como ventana de contexto; procesa audio de hasta 10 minutos en una sola pasada segun benchmark del autor |
| Tipos de cuantizacion | fp32, fp16, int8, w4a8 (4-bit), cada uno en una carpeta separada |
| Idiomas soportados | Frances (principal); retencion limitada de otros idiomas del modelo base, que es multilingue (25 idiomas segun el modelo optimizado) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder fp32 particionado en shards `.data`; decodificador int8 comun) |

## Arquitectura y entrenamiento

El modelo base es un `nemo-conformer-tdt`, es decir, un sistema de reconocimiento de voz basado en conformers (arquitectura híbrida de CNN y atencion) con un decodificador de tipo TDT. Este modelo de NVIDIA se entrenó originariamente de forma multilingüe. El fine-tune que presenta Olicorne se realizó sobre el dataset `UltiMed-ASR-FR-v1`, compuesto por audio médico en francés. Para monitorizar el ajuste se emplearon cinco conjuntos de validación reducidos (`dictionary`, `parhaf`, `drugs`, `acronyms`, `drug_sentence`), mientras que el conjunto `parrot` se reservó como evaluación no vista para medir generalización. El autor indica además que se añadió "ensayo" con Common Voice para proteger la retención multilingüe, en respuesta a una deriva observada en sueco y finlandés en entrenamientos anteriores.

En cuanto a innovaciones técnicas, el modelo destaca por su exportación a ONNX con varias precisiones, permitiendo una cuantización casi gratuita: el encoder int8 iguala al fp32 en la media micro con una diferencia inferior a una centésima de punto, y la precisión w4a8 reduce el peso de descarga en 3,8x con un coste de aproximadamente una décima de punto de WER.

## Capacidades

- Transcripción de audio en francés con fuerte vocabulario médico, incluyendo fármacos, acrónimos y terminología clínica.
- Funciona completamente en el navegador o en CPU/GPU mediante ONNX Runtime, sin necesidad de servidores externos.
- Ofrece cuatro precisiones de cuantización (fp32, fp16, int8, w4a8) para adaptarse a diferentes recursos hardware.
- Soporta decodificación greedy y beam search (beam 5), con resultados de WER/CER consistentes entre ambas.
- Capacidad para procesar audio largo, al menos 10 minutos en una sola pasada según el benchmark incluido en el modelo card.
- Retención multilingüe evaluada con FLEURS, aunque los resultados numéricos no están completos en la información disponible.
- No soporta tool calling, function calling, ni razonamiento multi-paso: es un modelo puramente de reconocimiento de voz.

## Casos de uso

- Dictado clínico en consultas: el modelo transcribe la voz del médico en francés reconociendo términos médicos, fármacos y dosis con WER bajo en los conjuntos `drugs` (4,9 %) y `drug_sentence` (12,8 %), lo que permite generar notas de consulta automáticamente.
- Transcripción de telemedicina: integrado en ONNX Runtime en servidores, procesa grabaciones de llamadas médicas con soporte de hasta 10 minutos de audio por pasada, apto para sesiones completas de teleconsulta en CPU.
- Extracción de prescripciones: gracias a su precisión en los conjuntos de fármacos, puede utilizarse como entrada a sistemas de prescripción electrónica, transcribiendo nombres de medicamentos y posologías en dictados.
- Interpretación de acrónimos médicos: el conjunto `acronyms` muestra un WER del 4,1 %, lo que indica una buena capacidad para transcribir siglas y abreviaturas frecuentes en entornos hospitalarios.
- Transcripción local y privada en navegador: mediante la aplicación Parakeet Web, el usuario puede seleccionar este modelo y transcribir audio sin que salga del dispositivo, adecuado para datos sensibles de pacientes y requisitos de confidencialidad.
- Investigación y análisis de audio clínico: permite etiquetar automáticamente corpus de conversaciones médicas o generar subtítulos en vídeos de formación sanitaria; el conjunto `parrot` (no visto en entrenamiento) ofrece una estimación de generalización del 4,7 % de WER.
- Accesibilidad en francés: puede integrarse en aplicaciones de subtitulado en tiempo real para personas con discapacidad auditiva, ejecutándose en móvil u ordenador local gracias a las variantes int8 o w4a8.

## Benchmarks y rendimiento

Los siguientes resultados provienen del modelo card y se calcularon sobre 1.755 clips y 8.6 horas de audio. El texto se normaliza antes de puntuar (se normalizan mayúsculas y puntuación, se conservan acentos). WER y CER más bajos son mejores. Cinco de los seis conjuntos (`dictionary`, `parhaf`, `drugs`, `acronyms`, `drug_sentence`) son validaciones utilizadas durante el entrenamiento; el conjunto `parrot` es exclusivo de evaluación. Las columnas `base fp32` y `base int8` corresponden al modelo original sin fine-tune, puntuado sobre los mismos clips.

### Decodificación greedy, WER

| set | fp32 | fp16 | int8 | w4a8 | base fp32 | base int8 |
| --- | --- | --- | --- | --- | --- | --- |
| dictionary | 3.6 % | 3.5 % | 3.6 % | 3.7 % | 37.5 % | 37.2 % |
| parhaf | 4.5 % | 4.5 % | 4.5 % | 4.6 % | 39.8 % | 39.5 % |
| drugs | 4.9 % | 4.9 % | 4.9 % | 5.3 % | 35.5 % | 35.5 % |
| acronyms | 4.1 % | 4.1 % | 4.1 % | 4.0 % | 20.4 % | 20.5 % |
| drug_sentence | 12.8 % | 12.8 % | 12.8 % | 12.1 % | 22.1 % | 22.1 % |
| parrot (held out) | 4.7 % | 4.7 % | 4.8 % | 5.0 % | 29.7 % | 28.9 % |
| **macro average** | 5.8 % | 5.8 % | 5.8 % | 5.8 % | 30.9 % | 30.6 % |
| **micro average** | 4.6 % | 4.6 % | 4.6 % | 4.8 % | 35.3 % | 35.0 % |

### Decodificación greedy, CER

| set | fp32 | fp16 | int8 | w4a8 | base fp32 | base int8 |
| --- | --- | --- | --- | --- | --- | --- |
| dictionary | 0.9 % | 0.9 % | 0.9 % | 0.9 % | 16.9 % | 16.8 % |
| parhaf | 1.7 % | 1.7 % | 1.7 % | 1.8 % | 21.1 % | 21.0 % |
| drugs | 1.6 % | 1.6 % | 1.6 % | 1.8 % | 17.6 % | 17.7 % |
| acronyms | 1.6 % | 1.6 % | 1.5 % | 1.5 % | 8.8 % | 8.9 % |
| drug_sentence | 8.3 % | 8.3 % | 8.2 % | 7.7 % | 17.8 % | 17.8 % |
| parrot (held out) | 1.1 % | 1.1 % | 1.2 % | 1.2 % | 13.1 % | 12.7 % |
| **macro average** | 2.5 % | 2.5 % | 2.5 % | 2.5 % | 15.9 % | 15.8 % |
| **micro average** | 1.6 % | 1.6 % | 1.6 % | 1.7 % | 17.3 % | 17.2 % |

### Decodificación beam 5, WER y CER

| set | fp32 WER | int8 WER | base fp32 WER | base int8 WER |
| --- | --- | --- | --- | --- |
| dictionary | 2.9 % | 2.8 % | 21.3 % | 20.8 % |
| parhaf | 4.5 % | 4.5 % | 25.0 % | 24.6 % |
| drugs | 4.5 % | 4.5 % | 20.8 % | 21.0 % |
| acronyms | 3.6 % | 3.6 % | 10.5 % | 10.3 % |
| drug_sentence | 12.9 % | 12.8 % | 21.7 % | 21.5 % |
| parrot (held out) | 4.4 % | 4.4 % | 15.3 % | 15.0 % |
| **macro average** | 5.5 % | 5.4 % | 19.1 % | 18.9 % |
| **micro average** | 4.7 % | 4.7 % | 20.0 % | 19.7 % |

El modelo card también incluye una sección de retención multilingüe con FLEURS, pero los valores numéricos no están disponibles en la información proporcionada. De la misma forma, existe un benchmark de audio largo de 10 minutos en VoxPopuli francés, pero no se incluyen resultados.

## Requisitos de hardware

- El repositorio ocupa 11.6 GB en total, pero el modelo puede descargarse por partes según la precisión elegida.
- VRAM estimada orientativamente basada en 0.6B parámetros: fp32 ~2.4 GB, fp16 ~1.2 GB, int8 ~0.6 GB, w4a8 ~0.3 GB. No se proporcionan cifras oficiales de VRAM en el modelo card.
- El modelo está diseñado para CPU y navegador; cualquier CPU moderna puede ejecutar la variante int8 o w4a8. En GPU, se recomienda el proveedor de ejecución CUDA y usar int8 en lugar de fp16, ya que el autor indica que el encoder fp16 es aproximadamente 12 veces más lento que int8 en CUDA.
- Cabe en GPUs de consumo (por ejemplo, RTX 4090) y también en hardware modesto gracias a la variante w4a8.
- Opciones de despliegue: ONNX Runtime con el framework `onnx-asr`, o la aplicación web Parakeet Web para inferencia completamente en el navegador.
- Latencia y throughput: no se proporcionan cifras absolutas. La única referencia de rendimiento es la comparación fp16 vs int8 en CUDA mencionada anteriormente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | WER medio médico (greedy, macro) | Licencia | Formato |
| --- | --- | --- | --- | --- | --- |
| Olicorne/parakeet-tdt-0.6b-v3-UltiMed-onnx | 0.6B | Hasta 10 min por pasada | 5.8 % | CC-BY-4.0 | ONNX |
| nvidia/parakeet-tdt-0.6b-v3 (base) | 0.6B | No especificado | 30.9 % (fp32) | CC-BY-4.0 | NeMo |
| Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx | 0.6B | No especificado | 30.6 % (int8) | CC-BY-4.0 | ONNX |

La comparación con el modelo base sin fine-tune es la más directa y muestra que el ajuste en francés médico reduce el WER macro de 30,9 % a 5,8 %. No se dispone en la información proporcionada de comparativas con otros modelos ASR como Whisper o Wav2Vec2.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta análisis de sesgos en la información disponible. El modelo card menciona una sección de "Bias and coverage", pero el contenido no se ha incluido en los datos proporcionados.
- Riesgo de alucinación: al ser un modelo de ASR, puede transcribir audio ininteligible con texto plausible, especialmente en entornos con ruido. No se ha evaluado este riesgo en la información disponible.
- Limitaciones de idioma: el fine-tune está orientado al francés médico; el rendimiento en otros idiomas o dominios fuera del corpus de entrenamiento no está garantizado. El autor señala que, sin ensayo de Common Voice, se produjo una deriva de 2.9 y 4.0 puntos de WER en sueco y finlandés en entrenamientos anteriores.
- Limitaciones de generalización: cinco de los seis conjuntos de evaluación se utilizaron durante el entrenamiento, por lo que sus resultados pueden sobreestimar el rendimiento real. El conjunto `parrot`, que sí mide generalización, presenta un WER de 4.7 % en fp32, algo peor que los conjuntos de ajuste.
- Efecto de la cuantización: la variante w4a8 degrada ligeramente el WER en el conjunto `parrot` (5.0 % frente al 4.7 % de fp32). Para aplicaciones que exijan la máxima precisión, se recomienda usar fp32 o int8.
- Licencia: CC-BY-4.0 permite uso comercial con atribución, pero conviene revisar la licencia del modelo base original `nvidia/parakeet-tdt-0.6b-v3` para confirmar la compatibilidad de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-UltiMed-onnx
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo base optimizado (sin fine-tune): https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx
- Aplicación web Parakeet Web: https://parakeetweb.olicorne.org/
- Repositorio de Parakeet Web: https://github.com/thiswillbeyourgithub/parakeet_web
- Framework onnx-asr: https://github.com/istupakov/onnx-asr
- Dataset de fine-tune: https://huggingface.co/datasets/Olicorne/UltiMed-ASR-FR-v1
