# AXERA-TECH/CuteTTS.AXERA

## Resumen

CuteTTS.AXERA es una implementación optimizada para NPU del modelo de síntesis de voz CuteTTS-distill, publicada por AXERA-TECH, el brazo de herramientas para desarrolladores del fabricante de aceleradores de IA Axera. El modelo original procede de OPPOer y se ha reconvertido a formato `axmodel` para ejecutarse íntegramente en los aceleradores NPU AX650N y AX8850, con un paquete de inferencia en C++ y un SDK en Python que solo depende de NumPy.

Se trata de un modelo de texto a voz (TTS) de aproximadamente 0,2 mil millones de parámetros, con soporte de clonación de voz zero-shot a partir de una referencia de audio de hasta 5 segundos, salida mono a 24 kHz y capacidad de generación en streaming. Su relevancia radica en que demuestra la viabilidad de ejecutar TTS de calidad en hardware de borde económico (tarjetas M.2, docks y placas embebidas con NPU Axera) con latencias de primer paquete muy bajas: TTFA de 0,48 s y TTFT de 0,17 s en caché de referencia.

El repositorio incluye los 9 subgrafos `axmodel`, scripts de conversión desde ONNX mediante Pulsar2, muestras de audio generadas en placa y scripts de arranque. Los idiomas verificados en hardware son inglés y chino; la model card menciona francés, alemán y español como no verificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS derivado de CuteTTS-distill; inferida como pipeline de decodificación latente con 9 subgrafos `axmodel`) |
| Parámetros totales | ~0,2B (0,2 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (referencia de audio ≤ 5 s; generación máxima por pasada ≤ 20,5 s, ampliable con `--split`) |
| Tipos de cuantización | No disponible (pesos compilados a `axmodel` para NPU AX650N/AX8850) |
| Idiomas soportados | Inglés y chino (verificados); francés, alemán y español (no verificados) |
| Licencia | No disponible |
| Formato de pesos | `axmodel` (9 subgrafos) + assets (tablas de embedding, filtros mel, BN/linear, tokenizer); scripts de conversión desde ONNX |
| Frecuencia de muestreo de salida | 24 kHz, mono |
| Tamaño del repositorio | 2,2 GB |
| Pipeline | text-to-speech |
| Modelo base | OPPOer/CuteTTS-distill |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base CuteTTS-distill (tipo de transformer, esquema de tokenización acústica o composición del dataset). Lo que sí se documenta es la topología de despliegue: el modelo se ha descompuesto en 9 subgrafos `axmodel` que se ejecutan íntegramente en la NPU, con carga bajo demanda del decodificador. El paquete incluye tablas de embedding, filtros mel, capas BN/linear y tokenizer como assets separados.

El proceso de conversión parte de una exportación a ONNX y utiliza Pulsar2, la herramienta de compilación de Axera, con calibración sobre voz real. La inferencia soporta modo streaming (paquetes de 1,28 s) y modo no streaming, tanto en C++ como en Python. No se dispone de información sobre el entrenamiento original (número de tokens, uso de RLHF/DPO, dataset) ni sobre innovaciones como decodificación especulativa.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés y chino con salida a 24 kHz mono.
- Clonación de voz zero-shot a partir de una referencia de audio de hasta 5 segundos.
- Generación en streaming con paquetes de 1,28 s, adecuada para respuestas de voz de baja latencia.
- Generación no streaming para ficheros completos.
- Procesamiento de textos largos mediante segmentación automática por frases (`--split`, segmentos ≤ 18 s, concatenación posterior).
- Control de generación mediante CFG (`--cfg`), semilla (`--seed`) y longitud máxima en patches (`--max-new`, 1 patch ≈ 160 ms).
- Inferencia en NPU completa (9 subgrafos) en placas AX650N/AX8850.
- SDK en Python basado únicamente en NumPy, más ejecutable en C++.
- No se documenta soporte de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Asistentes de voz embebidos: el modelo cabe en una NPU AX650N y ofrece TTFA de 0,48 s, lo que permite respuestas habladas en dispositivos de borde sin conexión a la nube.
- Clonación de voz personalizada en dispositivos: con una referencia de hasta 5 s se puede generar voz con timbre del usuario para interfaces de accesibilidad o avisos personalizados, ejecutando todo localmente.
- Lectura de textos largos en placas: el modo `--split` segmenta por frases y concatena, permitiendo narrar documentos de longitud arbitraria con calidad consistente.
- Sistemas de megafonía o anuncios dinámicos: la salida a 24 kHz y el modo no streaming permiten generar ficheros de audio para reproducción programada en kioscos o transporte.
- Integración en pipelines industriales con C++: el ejecutable `cutetts_ax650` permite incorporar TTS en aplicaciones nativas de bajo consumo en hardware Axera sin dependencias de Python.
- Prototipado rápido con Python: el SDK NumPy-only y `demo.py` facilitan la validación de ideas y la generación de muestras antes de portar a C++.
- Evaluación de TTS bilingüe en productos para mercados anglófonos y sinófonos: los dos idiomas verificados cubren casos de atención al cliente o señalización bilingüe en dichos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, WER, MMLU, etc.) en la información disponible. Los datos de rendimiento publicados son métricas de inferencia en placa:

| Métrica | Valor |
|---|---|
| RTF (C++, frases de 3–10 s) | 0,47–0,63 |
| RTF (Python) | 0,40–0,59 |
| TTFA (time to first audio) | 0,48 s |
| TTFT (primer latente, caché de referencia) | 0,17 s |
| Tamaño de paquete en streaming | 1,28 s |
| Duración máxima por pasada | 20,5 s (ampliable con `--split`) |
| Referencia de audio máxima | 5 s |

## Requisitos de hardware

- Plataformas soportadas: AX650N y AX8850 (NPU Axera).
- Dispositivos verificados: AX650N DEMO Board; también referenciados M4N-Dock (MaixPy Pro), AI Pyramid y M.2 Accelerator Card LLM-8850.
- VRAM: no aplica; el modelo se ejecuta en la NPU del SoC, no en GPU convencional.
- GPU de consumo: no soportado directamente; el paquete está compilado para NPU Axera.
- Despliegue: ejecutable C++ (`bin/cutetts_ax650`) y SDK Python (`python/cutetts_ax/`), con scripts `setup.sh` y `run_ax650.sh`.
- Almacenamiento: repositorio de 2,2 GB (incluye 9 `axmodel` y assets).
- Latencia y throughput: RTF 0,47–0,63 en C++ (tiempo real o mejor); TTFA 0,48 s; TTFT 0,17 s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos TTS en la información proporcionada. Se indica a continuación una comparación cualitativa limitada a lo documentado:

| Modelo | Parámetros | Idiomas | Clonación zero-shot | Despliegue en NPU de borde | Licencia |
|---|---|---|---|---|---|
| CuteTTS.AXERA | ~0,2B | en, zh (verificados) | Sí (referencia ≤ 5 s) | Sí (AX650N/AX8850) | No disponible |
| CuteTTS-distill (base) | No disponible | No disponible | No disponible | No (modelo original) | No disponible |
| Otras alternativas TTS | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Idiomas verificados solo inglés y chino; francés, alemán y español figuran como no verificados y pueden degradar la calidad.
- La referencia de audio está limitada a 5 s y la generación por pasada a 20,5 s; textos más largos requieren `--split`, lo que puede introducir discontinuidades en la prosodia entre segmentos.
- No se documentan sesgos conocidos, pero al ser un modelo TTS clonador existe riesgo de uso indebido para suplantación de voz; no se especifican salvaguardas.
- Riesgo de alucinación acústica (ruidos, artefactos o pronunciación incorrecta) no cuantificado; no hay métricas MOS/WER publicadas.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Dependencia de hardware Axera: no es ejecutable en GPU convencional sin reconversión.
- El modelo base es una destilación (`CuteTTS-distill`), por lo que la calidad puede ser inferior a la del modelo completo original.
- Repositorio con pocas descargas (103) y sin likes: ecosistema y validación comunitaria limitados.

## Enlaces

- Hugging Face: https://huggingface.co/AXERA-TECH/CuteTTS.AXERA
- GitHub (fuente, scripts de conversión, C++): https://github.com/AXERA-TECH/CuteTTS.AXERA
- Modelo original: https://huggingface.co/OPPOer/CuteTTS-distill
- Scripts de conversión: https://github.com/AXERA-TECH/CuteTTS.AXERA/tree/main/model_convert
- Documentación Pulsar2 (ONNX a axmodel): https://pulsar2-docs.readthedocs.io/en/latest/pulsar2/introduction.html
- Organización Axera en GitHub: https://github.com/AXERA-TECH
- M4N-Dock (MaixPy Pro): https://wiki.sipeed.com/hardware/zh/maixIV/m4ndock/m4ndock.html
- AI Pyramid: https://docs.m5stack.com/zh_CN/ai_hardware/AI_Pyramid-Pro
- M.2 Accelerator Card LLM-8850: https://docs.m5stack.com/zh_CN/ai_hardware/LLM-8850_Card
