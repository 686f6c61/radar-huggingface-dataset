# Dancenteno/piper-es-angelina

## Resumen

Piper · Español · Angelina (medium) es una voz de síntesis de habla (text-to-speech) para el motor Piper, distribuida en formato ONNX. La publica el usuario Dancenteno en Hugging Face y está pensada para integrarse en el pipeline `piper1-gpl` (OHF-voice), la implementación mantenida del sintetizador Piper. El modelo resuelve la generación de audio en castellano de España a partir de texto, con un tamaño reducido (63,5 MB de pesos) que permite inferencia en CPU.

Se trata de un ajuste fino (*fine-tuning*) de la voz base `es_ES-davefx-medium` de `rhasspy/piper-checkpoints`, reentrenada con unas 316 frases (aproximadamente 45 minutos de audio) extraídas de un audiolibro de dominio público: la lectura de *Angelina*, de Rafael Delgado, por Karen Savage en LibriVox. El resultado es un checkpoint de la época 1199, con frecuencia de muestreo de 22.050 Hz.

Su relevancia es práctica más que arquitectónica: amplía el catálogo de voces Piper en español con una licencia CC0 1.0, lo que permite uso comercial sin restricciones ni atribución obligatoria. Es un modelo pequeño, de un solo hablante, orientado a despliegues ligeros (asistentes locales, lectores de pantalla, sistemas embebidos) donde no se justifica un TTS neuronal de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de Piper exportado a ONNX; la model card no detalla la topología interna) |
| Parametros totales | no disponible (el archivo de pesos ocupa 63,5 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (TTS por frases; sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (se distribuye un único ONNX; Piper admite variantes medium/low en su ecosistema, pero no se declaran aquí) |
| Idiomas soportados | español (es, variante es_ES) |
| Licencia | CC0 1.0 (dominio público) |
| Formato de pesos | ONNX (`es_ES-angelina-e1199-medium.onnx`) más JSON de configuración (`es_ES-angelina-e1199-medium.onnx.json`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; se sabe que es una voz Piper en formato ONNX y que el checkpoint corresponde a la época 1199 de un ajuste fino sobre `es_ES-davefx-medium` (CC0) de `rhasspy/piper-checkpoints`. El entrenamiento usó unas 316 frases de entre 5 y 12 segundos, en total unos 45 minutos de audio, procedentes de los capítulos 0 a 15 del audiolibro *Angelina* leído por Karen Savage para LibriVox.

Los textos de entrenamiento se obtuvieron por transcripción automática con Whisper large-v3, no por alineación manual, lo que introduce posibles errores de transcripción en el corpus. Los hiperparámetros declarados son `batch_size` 16, aproximadamente 1.200 épocas y frecuencia de muestreo de 22.050 Hz. No se menciona uso de RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Síntesis de voz en español de España a partir de texto, con salida en WAV a 22.050 Hz.
- Un único hablante (voz femenina, derivada de la lectura de Karen Savage).
- Pronunciación correcta de tildes y eñes cuando el texto de entrada las incluye.
- Integración directa con la CLI de Piper (`python3 -m piper`) y con el ecosistema `piper1-gpl`.
- Ejecución en CPU gracias al formato ONNX y al reducido tamaño del modelo.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se declaran capacidades multilingües: solo español.

## Casos de uso

- Asistentes de voz locales: el modelo puede generar respuestas habladas en un asistente doméstico que corra en CPU, sin depender de servicios en la nube, gracias a sus 63,5 MB de pesos y a la inferencia ONNX.
- Lectura de textos largos por fragmentos: útil para convertir artículos o documentos en audio por frases, ya que el modelo está entrenado con segmentos de 5 a 12 segundos y funciona bien con entradas cortas.
- Accesibilidad y lectores de pantalla: síntesis en castellano para aplicaciones de lectura asistida donde se requiere una voz con licencia libre y sin coste por uso.
- Sistemas embebidos y Raspberry Pi: el tamaño reducido y la compatibilidad con Piper permiten desplegarlo en dispositivos de bajos recursos para avisos, menús o interfaces habladas.
- Generación de audio para prototipos y pruebas: al ser CC0, se puede usar en demos, vídeos internos o test de integración sin gestionar licencias.
- Doctesting o narración de contenidos de dominio público: encaja en proyectos que digitalizan textos clásicos en audio, dado el origen del corpus de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo está pensado para CPU. En GPU, el consumo sería mínimo (pesos de 63,5 MB), pero no se publican cifras.
- GPU recomendadas: no disponibles. El modelo no requiere GPU.
- Cabe en cualquier GPU consumer y en CPU convencionales; también en dispositivos tipo Raspberry Pi, según el enfoque habitual de Piper.
- Opciones de despliegue: CLI de Piper (`python3 -m piper`), integración en aplicaciones mediante ONNX Runtime y el ecosistema `piper1-gpl`. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (no aplican a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Dancenteno/piper-es-angelina | TTS Piper (ONNX) | es_ES | 63,5 MB | CC0 1.0 | Ajuste fino sobre davefx, corpus de 45 min |
| es_ES-davefx-medium (rhasspy/piper-checkpoints) | TTS Piper | es_ES | no disponible | CC0 | Voz base sobre la que se entrena este modelo |
| Otras voces Piper en español del catálogo OHF-voice | TTS Piper | es_ES | variable | variable (a menudo CC0 o MIT) | Alternativas del mismo ecosistema; no se dispone de datos concretos en la información proporcionada |

No se dispone de datos de benchmarks ni de parámetros detallados de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeño (unas 45 minutos, 316 frases): puede fallar en palabras poco frecuentes o en frases muy largas, como advierte la propia model card.
- Los textos de entrenamiento se obtuvieron por transcripción automática con Whisper large-v3, lo que puede arrastrar errores de transcripción al modelo.
- Requiere texto con tildes y eñes; sin ellas la pronunciación es incorrecta.
- Los números, símbolos y abreviaturas deben escribirse en palabras para evitar lecturas erróneas.
- Un solo hablante y una sola variante dialectal (es_ES); no cubre otros acentos ni idiomas.
- Riesgo de alucinación acústica o artefactos en entradas fuera de distribución; no se documentan evaluaciones formales de calidad (MOS) ni de inteligibilidad.
- Licencia CC0 1.0: uso comercial permitido sin atribución obligatoria, aunque se agradece el crédito a Karen Savage y LibriVox.
- No es un modelo de lenguaje: no admite tool calling, agentes ni razonamiento; su única función es convertir texto en audio.

## Enlaces

- Hugging Face: https://huggingface.co/Dancenteno/piper-es-angelina
- Repositorio de Piper: https://github.com/OHF-voice/piper1-gpl
- Checkpoints base de Piper: `rhasspy/piper-checkpoints` (referenciado en la model card)
- Audiolibro de origen en LibriVox: https://librivox.org/angelina-by-rafael-delgado/
