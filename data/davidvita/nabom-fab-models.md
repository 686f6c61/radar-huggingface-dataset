# DavidVita/Nabom-Fab-Models

## Resumen
Nabom-Fab-Models es un repositorio de transporte publicado por DavidVita que agrupa los artefactos de modelo necesarios para la configuración en editor del complemento Nabom Voice Companion en su edición Fab para Unreal Engine. No se trata de un modelo único entrenado de forma monolítica, sino de un paquete de componentes heterogéneos: un modelo de síntesis de voz (TTS) derivado de OpenF5, un modelo de reconocimiento de voz basado en Whisper, un codificador de texto multilingüe (multilingual-e5-small), un vocoder Vocos y componentes asociados a Qwen. El repositorio contiene únicamente datos y avisos legales, no el proyecto de ejemplo, binarios de SDK de terceros, instalador ni los pesos del profesor propietario.

El componente principal de TTS es un modelo estudiante de voz fija (la voz Nabom) con 4.326.350.848 parámetros declarados en safetensors, lo que lo sitúa en el rango de los 4B. Está orientado exclusivamente al idioma coreano y se distribuye en formatos ONNX y GGUF, además de los pesos safetensors, pensados para inferencia local dentro de Unreal Engine y para despliegues compatibles con endpoints.

Su relevancia es acotada pero específica: cubre la necesidad de un pipeline de voz conversacional (ASR + TTS) ejecutable localmente en un motor de juego, con licencia por componente y sin dependencia de inicio de sesión en Hugging Face. La voz es sintética y el entrenamiento se apoyó en el corpus público coreano de síntesis de voz con consideración simultánea de emoción y estilo de habla de AI Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (componentes: TTS derivado de OpenF5, ASR basado en Whisper, codificador multilingual-e5-small, vocoder Vocos, componente Qwen) |
| Parametros totales | 4.326.350.848 (safetensors) |
| Parametros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen artefactos ONNX y GGUF; no se detallan niveles) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Other / component-specific (Apache-2.0 para OpenF5 y Qwen; MIT para Whisper, multilingual-e5-small y Vocos; términos propios de Soft Story para la voz Nabom) |
| Formato de pesos | Safetensors, ONNX y GGUF |

## Arquitectura y entrenamiento
El repositorio no documenta una arquitectura única, sino una composición de componentes con funciones diferenciadas dentro de un pipeline de voz. El módulo de síntesis se apoya en OpenF5 como base (bajo Apache-2.0), sobre el que se ha entrenado un modelo estudiante de voz fija para la voz Nabom; el reconocimiento de voz emplea Whisper; la representación textual usa multilingual-e5-small; y la generación de forma de onda recurre a Vocos. También se incluye un componente Qwen bajo Apache-2.0. Los pesos del modelo profesor y el motor propietario no se distribuyen.

El entrenamiento del componente de voz utilizó el corpus **감성 및 발화스타일 동시 고려 음성합성 데이터** de AI Hub, respaldado por la National Information Society Agency del Ministerio de Ciencia y TIC de Corea del Sur. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. La voz resultante es sintética y las grabaciones originales y de referencia no se incluyen en el repositorio.

## Capacidades
- Síntesis de voz (TTS) en coreano con voz fija preentrenada (voz Nabom).
- Reconocimiento de voz (ASR) mediante el componente basado en Whisper.
- Codificación de texto multilingüe para tareas de recuperación o representación semántica mediante multilingual-e5-small.
- Generación de audio a partir de representaciones latentes mediante el vocoder Vocos.
- Integración orientada a Unreal Engine para configuración de modelos en el editor.
- Inferencia local sin necesidad de autenticación en Hugging Face.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- Soporte de despliegue en formatos ONNX y GGUF, con tag `imatrix`.
- Naturaleza conversacional declarada mediante el tag `conversational`.

## Casos de uso
- Compañero de voz en videojuegos: integración del pipeline ASR + TTS dentro de Unreal Engine para que un NPC sintético responda por voz al jugador en coreano, aprovechando la inferencia local y la voz fija preentrenada.
- Doblaje y localización de contenido interactivo al coreano: uso del componente TTS para generar líneas de diálogo con una voz consistente en prototipos y demos, sin depender de servicios en la nube.
- Accesibilidad en aplicaciones interactivas: conversión de texto de interfaz a voz en coreano para usuarios con discapacidad visual dentro de entornos 3D o simulaciones.
- Asistentes conversacionales embebidos: combinación del ASR de Whisper con el TTS y el codificador multilingual-e5-small para construir un bucle de diálogo por voz en dispositivos locales.
- Investigación en síntesis de voz: evaluación de un modelo estudiante de 4B parámetros derivado de OpenF5 con voz fija, útil para estudiar destilación y calidad de voz en coreano.
- Pruebas de pipelines de audio en CI: validación de artefactos ONNX y GGUF en entornos de integración continua para comprobar compatibilidad de despliegue antes de publicar builds del complemento.
- Prototipado de experiencias de voz en Fab: uso de los archivos del repositorio como paso previo a la configuración en editor del complemento Nabom Voice Companion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4.326 millones de parámetros en precisión de 16 bits requeriría aproximadamente 8,6 GB solo para pesos, a los que habría que sumar memoria para activaciones y el resto de componentes del pipeline (ASR, codificador y vocoder).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar viabilidad en GPUs de 16 GB o más, pero el autor no lo confirma.
- Viabilidad en GPU de consumo: no confirmada. En cuantizaciones de 8 bits o inferiores podría encajar en GPUs de 8-12 GB, pero no hay datos oficiales.
- Opciones de despliegue: se distribuyen artefactos ONNX y GGUF, lo que sugiere compatibilidad con runtimes de ONNX y con llama.cpp u otros motores GGUF; el tag `endpoints_compatible` indica compatibilidad con endpoints. No se detallan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Nabom-Fab-Models (este) | 4.326 M | No disponible | Coreano | Component-specific | Safetensors, ONNX, GGUF |
| OpenF5 (base del TTS) | No disponible | No disponible | No disponible | Apache-2.0 | No disponible |
| Whisper (componente ASR) | No disponible en esta ficha | No disponible | Multilingüe | MIT | No disponible |
| Qwen (componente incluido) | No disponible en esta ficha | No disponible | No disponible | Apache-2.0 | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- El repositorio es de transporte: no incluye el proyecto de ejemplo, binarios de SDK de terceros, instalador, pesos del profesor ni grabaciones originales, por lo que no es un paquete listo para producir sin el resto del complemento.
- La voz Nabom es sintética y su uso está sujeto a los términos específicos de Soft Story; el acceso público a la descarga no concede una sublicencia separada.
- El soporte de idioma declarado es únicamente coreano, lo que limita su uso en castellano u otros idiomas sin trabajo adicional.
- La licencia es "component-specific": conviven Apache-2.0 (OpenF5, Qwen), MIT (Whisper, multilingual-e5-small, Vocos) y términos propietarios para la voz, lo que exige revisar cada aviso antes de un uso comercial.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones de contexto; al ser un modelo de voz, los riesgos principales son de calidad de síntesis, prosodia y fidelidad de pronunciación, no verificados en la información disponible.
- No hay datos de benchmarks, latencia ni requisitos de hardware oficiales, lo que dificulta planificar un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes, y su fecha de creación es 2026-11-18, lo que indica ausencia de validación comunitaria.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/DavidVita/Nabom-Fab-Models
- Aviso de licencia de la edición Fab: https://huggingface.co/DavidVita/Nabom-Fab-Models/blob/main/CpcModels/student_tts/LICENSE_NOTICE_EN.md
- Agradecimientos de componentes y entrenamiento: CpcModels/student_tts/MODEL_ATTRIBUTION.md (dentro del repositorio)
- Avisos de terceros: RuntimeDocs/THIRD_PARTY_NOTICES.md (dentro del repositorio)
- Texto de la licencia Apache-2.0: RuntimeDocs/LICENSES/Apache-2.0.txt (dentro del repositorio)
- Dataset de entrenamiento (AI Hub): https://aihub.or.kr/aihubdata/data/view.do?dataSetSn=71349
