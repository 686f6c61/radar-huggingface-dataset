# nanepallijeevitha050607/gyaan-setu-models

## Resumen

Gyaan Setu models es un repositorio agregado de modelos ONNX publicados por el usuario nanepallijeevitha050607 para dar soporte a Gyaan Setu, una aplicación web de aprendizaje offline dirigida a escolares en inglés, telugu e hindi. No se trata de un modelo entrenado desde cero, sino de una colección de cinco componentes ya existentes (un LLM instruct, dos traductores, tres voces TTS y un modelo de reconocimiento de voz) convertidos o cuantizados a ONNX para su ejecución en el navegador mediante transformers.js y ONNX Runtime Web.

El objetivo es que la aplicación descargue cada modelo una sola vez, lo almacene en el dispositivo y funcione sin conexión a internet, algo relevante en entornos con conectividad limitada. El componente generativo principal es SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros; el resto son modelos especializados de traducción (IndicTrans2 distilled 200M), síntesis de voz (MMS-TTS) y ASR (Whisper base.en).

El repositorio tiene 1,3 GB, no registra descargas ni likes y su licencia es mixta: conviven componentes Apache 2.0 y MIT con voces MMS bajo CC-BY-NC 4.0, lo que impide el uso comercial del conjunto completo tal como se distribuye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion de modelos: SmolLM2 (transformer decoder-only), IndicTrans2 (transformer encoder-decoder), MMS-TTS (VITS), Whisper (encoder-decoder) |
| Parametros totales | SmolLM2-360M-Instruct: 360M; IndicTrans2 dist-200M: ~200M por direccion; Whisper base.en: ~74M; MMS-TTS: no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | conversion/cuantizacion a ONNX (niveles concretos no especificados) |
| Idiomas soportados | en, te, hi |
| Licencia | mixta: Apache 2.0 (SmolLM2), MIT (IndicTrans2, Whisper), CC-BY-NC 4.0 (MMS-TTS) |
| Formato de pesos | ONNX (con ficheros partidos en `*.part-aa`, `*.part-ab`, ...) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrupa artefactos convertidos a ONNX de proyectos previos. SmolLM2-360M-Instruct es un transformer decoder-only de 360M parámetros afinado con instrucciones por HuggingFaceTB; IndicTrans2 en sus variantes dist-200M es un transformer encoder-decoder de traducción entrenado por AI4Bharat para el par inglés-indic e indic-inglés; Whisper base.en es el encoder-decoder de ASR de OpenAI en su variante solo inglés; y MMS-TTS son modelos VITS de síntesis de voz de Meta por idioma (eng, tel, hin).

La innovación técnica del repositorio no está en el entrenamiento sino en el empaquetado: conversión a ONNX, troceado de ficheros grandes en partes (`*.part-aa`, `*.part-ab`, etc.) que la aplicación une tras la descarga, y ejecución en el navegador con transformers.js y ONNX Runtime Web para permitir uso completamente offline. No se documentan volúmenes de tokens, composición de datasets ni etapas de RLHF/DPO propias.

## Capacidades

- Generación de texto y respuestas de tutoría en inglés mediante SmolLM2-360M-Instruct (seguimiento de instrucciones básico).
- Traducción inglés → telugu e inglés → hindi con IndicTrans2 en-indic.
- Traducción telugu/hindi → inglés con IndicTrans2 indic-en.
- Síntesis de voz (lectura en voz alta) en inglés, telugu e hindi con MMS-TTS.
- Reconocimiento de voz en inglés con Whisper base.en (entrada por voz).
- Ejecución totalmente offline en el navegador tras la descarga inicial.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio generativo: no disponibles (solo ASR y TTS como componentes separados).

## Casos de uso

- Tutoría escolar offline en inglés: SmolLM2-360M-Instruct responde preguntas de los alumnos dentro de la app sin conexión, una vez descargado el modelo en el dispositivo.
- Traducción de contenidos educativos al telugu y al hindi: IndicTrans2 en-indic permite generar material localizado a partir de lecciones en inglés, y indic-en hace el camino inverso para consultas de alumnos.
- Lectura en voz alta de lecciones: las voces MMS-TTS de inglés, telugu e hindi permiten accesibilidad para alumnos con dificultades lectoras o para refuerzo auditivo.
- Entrada por voz en inglés: Whisper base.en transcribe la pregunta hablada del alumno y la envía al tutor, útil en dispositivos sin teclado cómodo.
- Despliegue en aulas con conectividad intermitente: al ejecutarse en el navegador con transformers.js y ONNX Runtime Web, no requiere servidor de inferencia ni backend con GPU.
- Distribución en dispositivos de bajo coste: el tamaño del conjunto (1,3 GB) y la ejecución en cliente permiten usar portátiles o tablets modestos sin infraestructura cloud.
- Prototipado de aplicaciones educativas multilingües: sirve como referencia de empaquetado ONNX con ficheros troceados para proyectos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; la inferencia se ejecuta en el navegador con ONNX Runtime Web, por lo que el coste recae en CPU/GPU del cliente y en memoria RAM del navegador.
- GPU recomendadas: no disponible; no se documentan requisitos de GPU para el despliegue.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; al ser modelos pequeños (360M, 200M, 74M) es plausible su ejecución en CPU, pero no hay datos oficiales.
- Opciones de despliegue: transformers.js con ONNX Runtime Web en navegador; otros runners (vLLM, llama.cpp, Ollama, TGI) no están soportados por el formato ONNX de este repositorio.
- Latencia y throughput: no disponibles.
- Almacenamiento: 1,3 GB en el dispositivo tras la descarga completa del conjunto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Gyaan Setu models (este repo) | 360M + 200M + 74M + TTS | no disponible | Mixta (Apache 2.0, MIT, CC-BY-NC 4.0) | ONNX | Suite educativa offline en navegador |
| SmolLM2-360M-Instruct (original) | 360M | no disponible | Apache 2.0 | safetensors | LLM instruct ligero |
| IndicTrans2 dist-200M (original) | ~200M | no disponible | MIT | safetensors | Traduccion en-indic |
| Whisper base.en (original) | ~74M | no disponible | MIT | safetensors / ONNX | ASR solo ingles |

La comparación directa con un único modelo alternativo no es posible porque el repositorio agrega componentes de naturaleza distinta; la comparativa se plantea frente a los modelos originales de los que deriva.

## Limitaciones y advertencias

- Licencia mixta: las voces MMS-TTS están bajo CC-BY-NC 4.0, por lo que el conjunto completo no puede usarse con fines comerciales tal como se distribuye.
- SmolLM2-360M-Instruct es un modelo pequeño: cabe esperar razonamiento limitado, mayor tasa de alucinación y menor fidelidad en matemáticas y código que modelos de mayor tamaño.
- Whisper base.en solo reconoce inglés; no hay ASR para telugu ni hindi en este repositorio.
- La cobertura lingüística se limita a inglés, telugu e hindi; no se documentan otros idiomas.
- No hay datos publicados de benchmarks, latencia ni consumo de memoria en navegador.
- El repositorio no registra descargas ni validación de la comunidad (0 descargas, 0 likes), lo que reduce la confianza en su mantenimiento y calidad del empaquetado.
- Los ficheros troceados (`*.part-aa`, `*.part-ab`, ...) requieren unión previa por parte de la aplicación; un fallo en ese proceso deja el modelo inutilizable.
- La fecha de creación indicada (2026-10-28) es posterior a la de esta ficha, lo que conviene verificar antes de citar el repositorio en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nanepallijeevitha050607/gyaan-setu-models
- Aplicación Gyaan Setu: https://gyaan-setu-beige.vercel.app
- transformers.js: https://github.com/huggingface/transformers.js
- SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- IndicTrans2 en-indic dist-200M: https://huggingface.co/ai4bharat/indictrans2-en-indic-dist-200M
- IndicTrans2 indic-en dist-200M: https://huggingface.co/ai4bharat/indictrans2-indic-en-dist-200M
- MMS-TTS: https://huggingface.co/facebook/mms-tts
- Whisper base.en: https://huggingface.co/openai/whisper-base.en
