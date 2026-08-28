# mocomoco-inc/mocovoice-whisper-turbo-ja-medical-synthetic-v0.1

## Resumen

mocomoco-inc/mocovoice-whisper-turbo-ja-medical-synthetic-v0.1 es un prototipo de adaptación léxica para el reconocimiento automático de voz (ASR) en japonés médico, desarrollado por mocomoco inc. sobre el modelo base openai/whisper-large-v3-turbo. El objetivo es mejorar la transcripción de terminología médica especializada mediante un ajuste fino con datos sintéticos, sin necesidad de grabar audio real de pacientes o entornos clínicos. El modelo se distribuye exclusivamente en formato CTranslate2 (float16), como parte del ecosistema de producto mocoVoice, que ofrece soluciones de transcripción para campos específicos como la medicina.

Este lanzamiento es relevante porque aborda un problema práctico: los modelos ASR genéricos suelen fallar con términos médicos, códigos, unidades y valores numéricos. La adaptación léxica mediante LoRA (cuyos pesos no se distribuyen) y la evaluación controlada sobre un holdout sintético permiten auditar la mejora sin depender de grabaciones reales. Sin embargo, el propio autor lo califica como un artefacto de demostración y marketing, no como un modelo certificado para producción. El repositorio incluye el artefacto CT2 desplegable, el contrato de datos, el código de entrenamiento y un recibo de liberación con hashes SHA-256 para trazabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (encoder-decoder transformer) con adaptación LoRA fusionada |
| Parametros totales | no disponible (modelo base: openai/whisper-large-v3-turbo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (estándar Whisper, ventana de audio de 30 segundos) |
| Tipos de cuantizacion | float16 (CTranslate2) |
| Idiomas soportados | ja (japonés) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (ct2-float16) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-large-v3-turbo, un transformer encoder-decoder diseñado para ASR multilingüe. Sobre esta base se aplicó un ajuste fino mediante LoRA (Low-Rank Adaptation) para adaptar el vocabulario y la pronunciación a terminología médica japonesa. Los pesos LoRA se fusionaron con el modelo base y se convirtieron a CTranslate2 en float16 para su despliegue. El repositorio no distribuye los adaptadores LoRA ni un checkpoint Transformers fusionado; el único artefacto desplegable es el directorio `ct2-float16/`.

El entrenamiento utilizó datos sintéticos japoneses generados por TTS (text-to-speech), con plantillas de prompts no vistas durante el entrenamiento para el holdout de evaluación. No se usaron grabaciones reales de clientes, hospitales, obras ni entornos operativos. El dataset de entrenamiento y su procedencia se documentan en `data_contract/`, y el código de entrenamiento, evaluación y exportación está en `training_code/`. La evaluación se realizó con decodificación beam-4 en japonés, comparando el modelo adaptado con el Whisper Turbo genérico bajo el mismo decodificador CT2.

## Capacidades

- Reconocimiento automático de voz en japonés, con enfoque en vocabulario médico (términos, códigos, unidades, valores numéricos).
- Adaptación léxica controlada: mejora la presencia de términos de dominio y la preservación de valores numéricos frente al modelo base genérico.
- Compatible con el wrapper `WhisperModel` de MocoVoice para inferencia en CTranslate2.
- Soporte de transcripción con puntuación y normalización, aunque la evaluación distingue entre exactitud literal y semántica.
- No incluye capacidades de tool calling, agentes, visión ni audio multilingüe; es exclusivamente ASR para japonés.

## Casos de uso

- Transcripción de consultas médicas: el modelo puede transcribir conversaciones entre médico y paciente en japonés, capturando términos técnicos como nombres de fármacos, diagnósticos y procedimientos con mayor precisión que un Whisper genérico.
- Documentación clínica automatizada: integrado en un flujo de trabajo de historias clínicas electrónicas, permite generar borradores de informes a partir de dictados, reduciendo el tiempo de documentación manual.
- Codificación de diagnósticos y procedimientos: al preservar códigos alfanuméricos (p. ej., códigos ICD-10 o procedimientos), facilita la extracción de información estructurada para facturación o registros.
- Verificación de valores numéricos y unidades: en contextos como resultados de laboratorio o prescripciones, el modelo mantiene una alta tasa de exactitud en números (100% en el holdout sintético), lo que reduce errores en dosis o mediciones.
- Integración con mocoVoice para entornos clínicos: el producto de mocomoco ofrece control de acceso, compartición en equipo y formatos de exportación personalizados, lo que permite desplegar el modelo en hospitales o clínicas con requisitos de privacidad.
- Evaluación y auditoría de modelos ASR: el repositorio incluye scripts y métricas reproducibles (CER, presencia de términos, hechos controlados) que permiten a otros equipos validar adaptaciones similares sobre datos sintéticos.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación sobre un holdout sintético japonés, comparando el artefacto CT2 entregado con el Whisper Turbo genérico bajo el mismo decodificador CT2. Los datos son diagnósticos controlados, no mediciones de campo.

| Metrica | CT2 generico | CT2 de dominio entregado |
|---|---:|---:|
| CER de dominio | 0.1674 | 0.1483 |
| Termino de dominio presente | 117/144 (81.2%) | 118/144 (81.9%) |
| Termino presente (diagnostico sin puntuacion) | 117/144 (81.2%) | 118/144 (81.9%) |
| Hecho de codigo controlado | 3/48 (6.2%) | 3/48 (6.2%) |
| Valor numerico controlado | 48/48 (100.0%) | 48/48 (100.0%) |
| Hecho de valor + unidad | 39/48 (81.2%) | 44/48 (91.7%) |

Además, la comparación entre el checkpoint Transformers de referencia (no distribuido) y el CT2 entregado mostró un CER de transcripción de 0.0678, con 90/156 salidas exactamente coincidentes tras normalización. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- Tamaño del repositorio: 1.6 GB, correspondiente al modelo CT2 en float16.
- VRAM estimada: no disponible en la documentación; al ser un modelo CT2 float16 de aproximadamente 1.6 GB, es plausible que quepa en GPUs consumer con al menos 4 GB de VRAM, pero no se especifica oficialmente.
- GPU recomendadas: no disponible; el modelo base Whisper large-v3-turbo se ejecuta en GPUs como RTX 3090/4090, A100 o H100, pero no se indica una recomendación concreta.
- Opciones de despliegue: CTranslate2, integrado con el wrapper `WhisperModel` de MocoVoice. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa más relevante es contra el modelo base Whisper large-v3-turbo en su versión CT2 genérica, que es el punto de referencia utilizado en la evaluación del autor. También se menciona un checkpoint Transformers de referencia (no distribuido) que sirvió para auditar la elección del LoRA.

| Modelo | Formato | CER dominio | Termino presente | Valor + unidad | Licencia |
|---|---|---|---:|---:|---:|
| Whisper large-v3-turbo (CT2 generico) | CTranslate2 float16 | 0.1674 | 81.2% | 81.2% | MIT |
| mocomoco-inc/mocovoice-whisper-turbo-ja-medical-synthetic-v0.1 | CTranslate2 float16 | 0.1483 | 81.9% | 91.7% | MIT |
| Checkpoint Transformers de referencia (no distribuido) | Transformers (no distribuido) | 0.2142 (CER de dominio) | 81.2% | 43.8% | no disponible |

No se dispone de comparaciones con otros modelos ASR japoneses específicos para medicina (p. ej., ReazonSpeech, Kotoba-Whisper) en la información proporcionada.

## Limitaciones y advertencias

- Es un prototipo de demostración, no un modelo certificado para producción ni para uso clínico real.
- Los datos de entrenamiento y evaluación son sintéticos (TTS japonés); no se usaron grabaciones reales de pacientes, hospitales ni entornos operativos.
- No se distribuyen los pesos LoRA ni un checkpoint Transformers fusionado; el único artefacto desplegable es CT2 float16.
- La evaluación mide adaptación léxica en un holdout controlado, no precisión en campo. No se debe asumir exactitud en códigos, números, unidades o terminología en situaciones reales.
- El modelo solo soporta japonés; no es multilingüe.
- Requiere el wrapper `WhisperModel` de MocoVoice para su uso; no es un modelo autónomo compatible con cualquier framework.
- La licencia MIT permite uso comercial, pero el autor advierte explícitamente contra decisiones autónomas basadas en las transcripciones.
- Los resultados de benchmarks son diagnósticos internos; no hay métricas estandarizadas externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mocomoco-inc/mocovoice-whisper-turbo-ja-medical-synthetic-v0.1
- Sitio web de mocomoco inc.: https://www.mocomoco.ai/en/
- Producto mocoVoice: https://products.mocomoco.ai/en/
- Sitio web en japonés: https://www.mocomoco.ai/
- Producto mocoVoice en japonés: https://products.mocomoco.ai/
- Whisper Turbo demo (modelo base): https://huggingface.co/spaces/hf-audio/whisper-large-v3-turbo
