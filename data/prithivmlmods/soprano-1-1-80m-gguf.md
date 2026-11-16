# prithivMLmods/Soprano-1.1-80M-GGUF

## Resumen

Soprano-1.1-80M es un modelo de síntesis de voz (text-to-speech) en inglés, ultraligero, desarrollado originalmente por el usuario ekwek y distribuido en formato GGUF por prithivMLmods. Con 79.714.048 parámetros (aproximadamente 80M), está diseñado para síntesis expresiva a 32 kHz con generación en tiempo real: el autor declara hasta 2000x de velocidad respecto al tiempo real en GPU y 20x en CPU, con latencias de streaming inferiores a 15 ms en GPU y 250 ms en CPU, y un uso de memoria por debajo de 1 GB.

La relevancia de este modelo reside en su relación capacidad/tamaño: permite ejecutar TTS de calidad aceptable en dispositivos de borde, portátiles sin GPU dedicada o incluso en CPU, algo poco habitual en modelos de voz neuronales. La versión 1.1 (14 de enero de 2026) afirma reducir las alucinaciones un 95% y ser preferida un 63% de las veces frente a Soprano-80M original, según la model card.

Esta ficha cubre la variante GGUF cuantizada publicada por prithivMLmods, pensada para su uso con `llama.cpp` mediante el binario `llama-tts`, además de la API Python `SopranoTTS` del modelo base. El modelo está liberado bajo licencia Apache-2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 (etiqueta `qwen3` en el repo); TTS con decodificacion de audio a 32 kHz |
| Parametros totales | 79.714.048 (aproximadamente 80M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_K_S, Q4_K_M, Q5_0, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-bf16 (proyector multimodal) |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer derivada de la familia Qwen3, adaptada para síntesis de voz: recibe texto tokenizado y genera una representación de audio que se decodifica a waveform a 32 kHz. El repositorio incluye un fichero `mmproj-bf16.gguf` (proyector multimodal) que actúa como puente entre las representaciones textuales y las de audio dentro del pipeline de `llama.cpp`.

Según la model card, el modelo se entrenó con aproximadamente 1000 horas de audio en inglés, lo que explica tanto su ligereza como su principal limitación: la pronunciación de palabras poco frecuentes puede ser incorrecta. La versión 1.1 incorpora mejoras sustanciales frente a la 1.0 (reducción del 95% de alucinaciones y preferencia del 63% en evaluaciones comparativas). No se detalla en la información disponible si hubo etapas de RLHF, DPO ni la composición exacta del dataset. El proyecto Soprano-Factory permite entrenar o afinar modelos propios a partir de esta base.

## Capacidades

- Síntesis de voz en inglés a 32 kHz con salida de audio de alta fidelidad relativa para su tamaño.
- Generación en streaming con latencias declaradas inferiores a 15 ms en GPU y 250 ms en CPU.
- Inferencia por lotes (batched inference) y en streaming mediante la API Python `SopranoTTS`.
- División automática de textos largos en fragmentos manejables.
- Ejecución en CUDA, CPU y MPS (Windows, Linux y macOS).
- Integración mediante WebUI, CLI, endpoint compatible con OpenAI y API Python.
- No soporta clonación de voz.
- No soporta otros idiomas distintos del inglés.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni agentes (es un modelo TTS, no un LLM conversacional).

## Casos de uso

- Lectura de artículos y documentos en aplicaciones de accesibilidad: el modelo puede convertir texto a voz en tiempo real en portátiles sin GPU, con latencias inferiores a 250 ms en CPU, adecuado para lectores de pantalla.
- Asistentes de voz en dispositivos de borde (Raspberry Pi, mini-PC, móviles): su huella de memoria inferior a 1 GB y las cuantizaciones Q4_K_M (49 MB) permiten ejecutarlo embebido sin depender de la nube.
- Generación de audiolibros y pódcast automatizados: la división automática de texto y el modo batch permiten procesar capítulos completos de forma desatendida en GPU.
- Sistemas de respuesta de voz interactiva (IVR) y atención al cliente telefónica: la baja latencia de streaming en GPU (menos de 15 ms) hace viable la conversación en tiempo real por turnos.
- Integración en pipelines de CI/CD para pruebas de regresión de audio: al ser determinista con semilla fija (`--seed 42`), permite comparar salidas entre versiones del modelo.
- Servicio compatible con OpenAI para prototipado: el endpoint compatible facilita sustituir APIs propietarias de TTS en aplicaciones existentes sin reescribir el cliente.
- Generación de narración para vídeos y contenido educativo en inglés, donde la calidad de 32 kHz es suficiente para publicación web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas internas de velocidad y latencia declaradas por el autor:

| Metrica | Valor declarado |
|---|---|
| Velocidad en GPU | Hasta 2000x tiempo real |
| Velocidad en CPU | Hasta 20x tiempo real |
| Latencia de streaming en GPU | Menos de 15 ms |
| Latencia de streaming en CPU | Menos de 250 ms |
| Uso de memoria | Menos de 1 GB |
| Reduccion de alucinaciones (v1.1 vs v1.0) | 95% |
| Preferencia humana (v1.1 vs v1.0) | 63% |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en cualquier cuantización; el fichero BF16 completo ocupa 160 MB y el Q4_K_M apenas 49 MB.
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 y H100; el modelo no requiere GPU de gama alta.
- Cabe holgadamente en cualquier GPU de consumo, incluida la gama de entrada, y también en iGPU y CPU.
- Despliegue: `llama.cpp` con el binario `llama-tts` (backend CUDA, CPU o MPS), API Python `SopranoTTS`, WebUI, CLI y endpoint compatible con OpenAI. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: según el autor, hasta 2000x tiempo real en GPU y 20x en CPU, con latencias de streaming de menos de 15 ms (GPU) y menos de 250 ms (CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Soprano-1.1-80M | 80M | Ingles | Apache-2.0 | GGUF, safetensors | TTS ultraligero, 32 kHz, streaming, sin clonacion |
| Soprano-80M (v1.0) | 80M | Ingles | Apache-2.0 | safetensors | Version anterior; la 1.1 reduce alucinaciones un 95% y es preferida un 63% de las veces |
| Kokoro-82M | 82M | Ingles (principalmente) | Apache-2.0 | safetensors, ONNX | TTS ligero comparable en tamano y filosofia on-device; no disponible en esta busqueda para comparacion detallada |
| Piper (voces) | Variable (por voz) | Multiples | MIT / GPL segun voz | ONNX | TTS de borde orientado a CPU; no disponible en esta busqueda para comparacion detallada |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada; la comparativa se limita a tamano, licencia y formato.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües ni de traducción.
- No soporta clonación de voz ni control fino de estilo o emoción más allá de la variabilidad de muestreo.
- Entrenado con aproximadamente 1000 horas de audio: palabras poco frecuentes, nombres propios y términos técnicos pueden pronunciarse incorrectamente.
- Riesgo de alucinación en el audio: la v1.1 afirma haberlo reducido un 95%, pero no se elimina por completo; se recomienda regenerar o ajustar los parámetros de muestreo cuando la salida sea deficiente.
- La model card recomienda frases de 2 a 15 segundos y deletrear fonéticamente números y símbolos para mejorar la calidad.
- Aunque la licencia es Apache-2.0 (permite uso comercial), el modelo base y el autor original deben citarse; conviene verificar las condiciones del repositorio base `ekwek/Soprano-1.1-80M`.
- El fichero `mmproj-bf16.gguf` se describe como proyector para capacidades de visión/audio, pero en este pipeline TTS su función concreta no está detallada en la información disponible.
- No se documentan sesgos específicos del modelo; como todo TTS entrenado en inglés, puede reflejar sesgos de acento y prosodia del corpus de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Soprano-1.1-80M-GGUF
- Modelo base: https://huggingface.co/ekwek/Soprano-1.1-80M
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Proyecto Soprano-Factory (entrenamiento y fine-tuning): mencionado en la model card, sin URL directa disponible en la información proporcionada
- Ficheros GGUF individuales: disponibles en la sección de archivos del repositorio (BF16, Q2_K a Q8_0, mmproj-bf16)
