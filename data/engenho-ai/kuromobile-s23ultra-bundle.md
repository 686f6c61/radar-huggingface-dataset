# engenho-ai/KuroMobile-S23Ultra-Bundle

## Resumen

KuroMobile-S23Ultra-Bundle es un paquete de modelos cuantizados publicado por Engenho AI (Brasil) bajo la denominación "Linha Kuro Android", diseñado para ejecución 100 % local en dispositivos Android con 12 GB de RAM, tomando como referencia el Samsung Galaxy S23 Ultra con SoC Snapdragon 8 Gen 2. No se trata de un modelo único, sino de una colección de artefactos derivados de modelos base de terceros (Qwen2.5 en sus variantes 7B, VL-7B y 3B, Whisper Large-v3-Turbo, Kokoro-82M y YOLOv8) reempaquetados y cuantizados para distintos runtimes móviles.

El paquete cubre texto, visión, audio y detección de objetos mediante un registro (`kuro_mobile_s23_registry.json`) que asigna a cada componente su formato y runtime: GGUF para llama.cpp, binarios para whisper.cpp y ONNX INT8 para ONNX Runtime Mobile. Los nombres comerciales (KuroCortex-8B, KuroVision-8B-Brasil, KuroPhysics-Sim-7B, KuroReflex-3B, Kuro3D-Architect, KuroEar-PTBR, KuroVoice-PTBR, KuroSentry-Vision) corresponden a derivados de los modelos base citados, con especial énfasis en portugués de Brasil y soporte secundario de inglés y español.

Su relevancia radica en la propuesta de despliegue multimodal completamente offline en hardware de consumo móvil, un escenario con creciente demanda en aplicaciones de privacidad, asistentes personales y edge computing. El repositorio ocupa 0,7 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección heterogénea: transformers (Qwen2.5 3B/7B/VL-7B), encoder-decoder ASR (Whisper Large-v3-Turbo), TTS (Kokoro-82M), detector CNN (YOLOv8) |
| Parametros totales | No disponible como cifra agregada; componentes individuales: ~7B (KuroCortex, KuroVision, KuroPhysics), ~3B (KuroReflex), 82M (KuroVoice), ~30 MB (KuroSentry) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q3_K_M y Q4_0 (llama.cpp); Q5_K (whisper.cpp); INT8 (ONNX Runtime Mobile) |
| Idiomas soportados | Portugués (pt/pt-BR), inglés (en), español (es) |
| Licencia | Mixta ("mixed-open-licenses"): Apache 2.0, MIT, GNU AGPLv3 y Qwen License según componente |
| Formato de pesos | GGUF, .bin (whisper.cpp), ONNX |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: agrega artefactos derivados de modelos preexistentes. Los componentes de texto y visión se apoyan en la familia Qwen2.5 (transformer denso con atención completa, en variantes 3B, 7B y VL-7B), mientras que el componente de reconocimiento de voz emplea Whisper Large-v3-Turbo (encoder-decoder con atención, versión turbo con menos pasos de decodificación), la síntesis de voz usa Kokoro-82M (modelo TTS compacto) y la detección visual se basa en YOLOv8 (CNN de detección en tiempo real). Los modelos Qwen2.5 subyacentes fueron entrenados con grandes volúmenes de datos multilingües e incluyen etapas de alineación tipo RLHF/DPO según su documentación original, aunque la model card del bundle no aporta detalles adicionales sobre tokens de entrenamiento, composición del dataset ni procesos de ajuste propios.

La innovación del paquete es de ingeniería de despliegue más que de modelado: selección de cuantizaciones (Q3_K_M, Q4_0, Q5_K, INT8) que encajan en el presupuesto de 12 GB de RAM del dispositivo objetivo, y un registro JSON que orquesta qué runtime carga cada componente. No se documentan técnicas como decodificación especulativa, atención lineal ni híbridos SSM.

## Capacidades

- Generación de texto y razonamiento en portugués, inglés y español mediante los componentes derivados de Qwen2.5 3B/7B.
- Comprensión de imágenes (visión-lenguaje) a través de KuroVision-8B-Brasil, derivado de Qwen2.5-VL-7B.
- Reconocimiento automático de voz en portugués de Brasil con KuroEar-PTBR (Whisper Large-v3-Turbo).
- Síntesis de voz en portugués de Brasil con KuroVoice-PTBR (Kokoro-82M en ONNX INT8).
- Detección de objetos en imagen con KuroSentry-Vision (YOLOv8 en ONNX INT8).
- Ejecución 100 % local y offline en Android, sin dependencia de servicios en la nube.
- Soporte de tool calling / function calling: no confirmado en la información disponible para los derivados del bundle.
- Capacidades de agente multi-paso: no confirmadas en la información disponible.
- Capacidades especiales (thinking mode, audio nativo en el LLM, etc.): no disponibles.

## Casos de uso

- Asistente personal offline en Android: KuroCortex-8B (GGUF Q3_K_M/Q4_0) puede gestionar conversaciones multi-turno en el propio dispositivo sin enviar datos a la nube, adecuado para usuarios con requisitos de privacidad.
- Transcripción de reuniones y notas de voz: KuroEar-PTBR (whisper.cpp Q5_K) convierte audio en texto en portugués de Brasil en local, útil para periodistas, abogados o estudiantes que manejan material sensible.
- Accesibilidad por voz: la combinación de KuroEar-PTBR (ASR) y KuroVoice-PTBR (TTS, ONNX INT8) permite construir interfaces habladas para personas con discapacidad visual en un teléfono de gama alta.
- Descripción de imágenes para usuarios con baja visión: KuroVision-8B-Brasil puede generar descripciones textuales de fotos capturadas con la cámara del dispositivo, sin conexión.
- Análisis de documentos y capturas: el componente de visión-lenguaje permite extraer información de recibos, carteles o documentos fotografiados en movilidad.
- Detección de objetos en tiempo real en aplicaciones de campo: KuroSentry-Vision (YOLOv8 INT8) sirve para inventario, control de calidad o seguridad en entornos sin conectividad.
- Simulación física educativa o prototipado: KuroPhysics-Sim-7B puede emplearse en apps docentes que requieran explicaciones y cálculos físicos offline.
- Modelado 3D asistido: Kuro3D-Architect (derivado de Qwen2.5 3B) puede generar descripciones o scripts para herramientas 3D en dispositivos móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivo objetivo declarado: Android con 12 GB de RAM (Samsung Galaxy S23 Ultra, Snapdragon 8 Gen 2).
- Tamaños de los artefactos: KuroCortex-8B ~3,6 GB (GGUF), KuroVision-8B-Brasil ~3,9 GB, KuroPhysics-Sim-7B ~3,2 GB, KuroReflex-3B ~1,6 GB, Kuro3D-Architect ~1,6 GB, KuroEar-PTBR ~540 MB, KuroVoice-PTBR ~90 MB, KuroSentry-Vision ~30 MB.
- Repositorio total: 0,7 GB (el paquete completo de pesos excede este tamaño; el repositorio puede contener solo el registro y artefactos parciales).
- VRAM/RAM estimada para inferencia: no disponible de forma detallada; el diseño asume 12 GB de RAM compartida en el SoC.
- GPU de escritorio recomendadas: no especificadas; por tamaño, los componentes de 7-8B en Q4 cabrían en GPUs consumer con 8-12 GB de VRAM (RTX 3060/4060 Ti, RTX 4070), pero no se documenta soporte oficial.
- Opciones de despliegue: llama.cpp (GGUF), whisper.cpp (.bin), ONNX Runtime Mobile (.onnx). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KuroMobile-S23Ultra-Bundle | Varios (3B-8B + ASR/TTS/detección) | No disponible | Paquete multimodal móvil offline | Mixta (Apache 2.0, MIT, AGPLv3, Qwen License) | Hugging Face |
| Qwen2.5-7B-Instruct | ~7B | 128K (según model card original) | LLM de texto general | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct | ~7B | No disponible en esta ficha | Visión-lenguaje | Apache 2.0 | Hugging Face |
| Whisper Large-v3-Turbo | ~809M | No aplica (ASR) | Reconocimiento de voz | MIT | Hugging Face / OpenAI |

La comparación directa es limitada porque el bundle agrega varios modelos de distinta naturaleza; sus componentes individuales son, en esencia, los modelos base cuantizados y renombrados.

## Limitaciones y advertencias

- No es un modelo entrenado desde cero: los nombres comerciales (KuroCortex, KuroVision, etc.) corresponden a derivados cuantizados de modelos de terceros; el valor añadido es el empaquetado y la cuantización.
- La model card no documenta el proceso de cuantización, validación de calidad ni pérdida de rendimiento respecto a los originales.
- Licencia mixta: debe revisarse componente a componente. YOLOv8 está bajo GNU AGPLv3, lo que impone obligaciones de copyleft en aplicaciones distribuidas; las variantes 3B usan Qwen License, con condiciones distintas a Apache 2.0.
- Idiomas limitados a pt, en y es; el foco declarado es portugués de Brasil, por lo que el rendimiento en español puede ser inferior.
- Riesgo de alucinación inherente a los LLM subyacentes, no mitigado de forma documentada.
- Contexto no especificado: planificar aplicaciones con ventanas cortas hasta validar el comportamiento real.
- Sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes), lo que dificulta evaluar su fiabilidad en producción.
- Restricciones de despliegue: pensado para Android con 12 GB de RAM; no se documenta soporte en otros sistemas ni herramientas de servidor (vLLM, TGI).
- Fecha de creación del repositorio (2026-11-27) posterior a la fecha de consulta habitual; verificar la integridad y procedencia de los artefactos antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/engenho-ai/KuroMobile-S23Ultra-Bundle
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo base Whisper Large-v3-Turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Modelo base YOLOv8 (Ultralytics): https://github.com/ultralytics/ultralytics
- llama.cpp: https://github.com/ggerganov/llama.cpp
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- ONNX Runtime Mobile: https://onnxruntime.ai/docs/build/custom.html
