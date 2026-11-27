# ihnatov-yuri/whisper-large-v3-turbo-uk

## Resumen

Whisper large-v3 turbo UK es un ajuste fino del modelo `openai/whisper-large-v3-turbo` de OpenAI, especializado en reconocimiento automático de voz (ASR) en ucraniano. Lo desarrolla el usuario de Hugging Face ihnatov-yuri y mantiene intactas la arquitectura, el tokenizador y el vocabulario del modelo base: solo se ha reentrenado el decodificador de 4 capas, mientras que el codificador procede del modelo original. El resultado es un modelo de 808,9 millones de parámetros que conserva el rendimiento en inglés y mejora sustancialmente la transcripción en ucraniano.

El modelo resuelve un problema concreto: el Whisper large-v3-turbo original presenta un WER medio del 13,69 % en el conjunto de pruebas parlamentarias ucranianas, mientras que este ajuste lo reduce al 9,33 %. Frente al Whisper large-v3 completo (sin turbo) también mejora en la mayoría de conjuntos ucranianos, con un WER medio del 8,23 % sobre diez conjuntos de evaluación, y mantiene la velocidad del turbo gracias a su decodificador de solo 4 capas.

Es relevante ahora porque el ecosistema de ASR en ucraniano ha recibido varios modelos específicos (Parakeet UK, Whisper UK) y este se posiciona como una alternativa con licencia MIT, pesos en safetensors y una conversión a Core ML lista para dispositivos Apple mediante WhisperKit. La versión publicada es la 1 (28 de octubre de 2026), entrenada sobre 617 horas de audio mayoritariamente conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), decodificador de 4 capas |
| Parámetros totales | 808.878.080 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantización | fp16 (Core ML); float32 en PyTorch; sin palettization en la conversión Core ML |
| Idiomas soportados | ucraniano (uk), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch float32), Core ML `.mlmodelc` (fp16) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un transformer encoder-decoder con atención estándar. La innovación respecto al large-v3 completo es que el decodificador se reduce de 32 a 4 capas, lo que acelera la inferencia varias veces. En este ajuste fino se congela el codificador y solo se entrena el decodificador de 4 capas; el tokenizador y el vocabulario no cambian.

El entrenamiento se realizó sobre las mismas 617 horas que la versión 2 de Parakeet UK, con predominio de audio conversacional. No se especifica en la información disponible la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La salida incluye mayúsculas, puntuación y números escritos como dígitos. El modelo se entrenó con el token de idioma proporcionado explícitamente, y la detección automática de idioma no fue evaluada. La conversión a Core ML se hizo con las herramientas de Argmax (whisperkittools) sin palettization.

## Capacidades

- Reconocimiento automático de voz en ucraniano con salida que incluye mayúsculas, puntuación y números en dígitos.
- Transcripción en inglés conservando el rendimiento del modelo base.
- Manejo de audio conversacional, reuniones parlamentarias, pódcasts, entrevistas, vídeos públicos y charlas técnicas.
- Capacidad limitada de code-switching ucraniano-inglés: en 200 clips con una frase en inglés entre frases ucranianas, el WER es del 38,98 % y solo el 9,5 % de las palabras inglesas se escriben en inglés.
- Inferencia en dispositivos Apple mediante Core ML y WhisperKit, con fallback de temperatura que evita repeticiones.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones parlamentarias y sesiones plenarias: el modelo logra un WER del 9,33 % en reuniones de comités no vistas y del 4,64 % en plenos de la Verkhovna Rada, lo que lo hace adecuado para actas automáticas con revisión humana ligera.
- Subtitulado de pódcasts y entrevistas: con un WER del 10,75 % en pódcasts, puede generar subtítulos con puntuación y mayúsculas listos para publicación, reduciendo el trabajo de corrección.
- Actas de reuniones corporativas en inglés: en reuniones AMI no vistas obtiene un WER del 13,21 %, útil para resúmenes y búsqueda posterior en entornos empresariales.
- Transcripción de vídeos públicos y charlas técnicas: el WER del 7,79 % en charlas de temas mixtos y del 7,69 % en el conjunto de ingeniería lo hacen viable para indexar contenido audiovisual.
- Aplicaciones móviles y de escritorio en macOS/iOS: la conversión Core ML (1,6 GB, encoder de 1,2 GB y decoder de 330 MB en fp16) permite ejecución local en dispositivos Apple con WhisperKit, sin depender de la nube.
- Documentación clínica y psicológica: con WER del 7,86 % en medicina y del 4,42 % en psicología, puede asistir en la transcripción de consultas o sesiones, siempre con revisión profesional.
- Procesamiento de audio educativo y técnico: el WER del 8,47 % en el conjunto de IT permite transcribir clases y tutoriales técnicos en ucraniano.

## Benchmarks y rendimiento

Resultados en Core ML sobre Apple M3 Pro, con una muestra de 1 hora de cada conjunto de evaluación. WER sobre texto normalizado (minúsculas, sin puntuación, guiones como espacios).

| Conjunto de prueba | Whisper large-v3 | Parakeet UK v3 | Este modelo |
|---|---|---|---|
| WER medio de 10 conjuntos ucranianos | 9,79 % | 8,08 % | 8,23 % |
| Reuniones de comités parlamentarios (47 no vistas) | 12,26 % | 8,28 % | 9,33 % |
| Reuniones en inglés (AMI, 3 no vistas) | 22,30 % | 12,37 % | 13,21 % |

| Conjunto de prueba | Whisper large-v3 | Whisper large-v3 turbo | Whisper UK v1 | Parakeet v3 (base) | Parakeet UK v3 |
|---|---|---|---|---|---|
| Comités parlamentarios | 12,26 % | 13,69 % | 9,33 % | 14,31 % | 8,28 % |
| Pódcasts y entrevistas | 11,59 % | 13,83 % | 10,75 % | 14,17 % | 10,62 % |
| YODAS, vídeos públicos | 14,56 % | 16,99 % | 14,35 % | 16,17 % | 13,20 % |
| Plenos de la Verkhovna Rada | 7,92 % | 8,86 % | 4,64 % | 8,80 % | 4,44 % |
| Charlas públicas de temas mixtos | 11,57 % | 11,81 % | 7,79 % | 12,23 % | 7,94 % |
| FLEURS uk | 7,37 % | 9,00 % | 7,01 % | 7,20 % | 6,36 % |
| IT | 7,58 % | 8,14 % | 8,47 % | 9,30 % | 8,54 % |
| Medicina | 11,34 % | 11,78 % | 7,86 % | 10,98 % | 8,84 % |
| Psicología | 4,38 % | 5,04 % | 4,42 % | 5,98 % | 4,38 % |
| Ingeniería | 9,36 % | no completado | 7,69 % | 11,20 % | 8,25 % |
| FLEURS en | 4,83 % | 5,06 % | 5,28 % | 5,90 % | 5,47 % |
| Reuniones AMI en inglés | 22,30 % | 22,63 % | 13,21 % | 14,14 % | 12,37 % |

| Code-switching (200 clips) | Whisper large-v3 | Whisper large-v3 turbo | Whisper UK v1 | Parakeet v3 (base) | Parakeet UK v3 |
|---|---|---|---|---|---|
| WER | 43,17 % | 44,48 % | 38,98 % | 30,95 % | 12,09 % |
| Palabras inglesas escritas en inglés | 0,3 % | 2,3 % | 9,5 % | 32,8 % | 78,7 % |

En PyTorch con generación greedy por defecto, los mismos pesos obtienen un 8,97 % en la media de los 10 conjuntos ucranianos en lugar del 8,23 %, principalmente por repeticiones en el conjunto de pódcasts (15,39 %). WhisperKit evita ese problema con el fallback de temperatura.

## Requisitos de hardware

- VRAM estimada para inferencia en PyTorch float32: aproximadamente 3,2 GB solo para pesos, más memoria de activaciones; se recomienda al menos 6-8 GB de VRAM para audio de 30 s.
- Core ML en Apple: 1,6 GB en fp16 (encoder de 1,2 GB y decoder de 330 MB); cabe en dispositivos Apple con memoria unificada suficiente, como los chips M1 en adelante.
- GPU recomendadas: cualquier GPU con 8 GB o más para PyTorch (RTX 3060, RTX 4060, RTX 4090, A100, H100); en Apple, chips M1/M2/M3/M4 mediante Core ML.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB o superiores con holgura; en 8 GB es ajustado pero viable con audio corto.
- Opciones de despliegue: Transformers (pipeline `automatic-speech-recognition`), WhisperKit en Apple, y potencialmente llama.cpp/whisper.cpp si se convierte a GGUF (no se documenta conversión oficial). vLLM y TGI no aplican a ASR de Whisper de forma estándar.
- Latencia y throughput: aproximadamente la misma velocidad que el turbo original, varias veces más rápido que large-v3 gracias al decodificador de 4 capas. No se proporcionan cifras concretas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER medio ucraniano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper large-v3-turbo-uk (este) | 808,9 M | 30 s por segmento | 8,23 % | MIT | Hugging Face, Core ML |
| Whisper large-v3 | no disponible | 30 s por segmento | 9,79 % | MIT | Hugging Face |
| Whisper large-v3 turbo | 808,9 M | 30 s por segmento | no disponible (sin media) | MIT | Hugging Face |
| Parakeet UK v3 | no disponible | no disponible | 8,08 % | no disponible | Hugging Face |
| Parakeet v3 (base) | no disponible | no disponible | 11,03 % | no disponible | Hugging Face |

## Limitaciones y advertencias

- El WER en code-switching es alto (38,98 %) y solo el 9,5 % de las palabras inglesas se escriben en inglés, lo que limita su uso en contextos bilingües.
- La detección automática de idioma no fue evaluada; es necesario pasar explícitamente el token de idioma (`uk` o `en`).
- En PyTorch con generación greedy se producen repeticiones en pódcasts (WER del 15,39 %), por lo que se recomienda usar la build Core ML con WhisperKit o ajustar parámetros de decodificación.
- El rendimiento en inglés es inferior al de modelos especializados: WER del 13,21 % en reuniones AMI frente al 12,37 % de Parakeet UK v3.
- No se documentan sesgos conocidos, pero al entrenarse sobre 617 horas mayoritariamente conversacionales puede tener menor cobertura en dominios muy específicos.
- Riesgo de alucinación inherente a los modelos Whisper en audio con ruido o silencios largos.
- Licencia MIT permite uso comercial, pero el modelo base es de OpenAI y conviene revisar las condiciones de uso de Whisper.
- Solo soporta ucraniano e inglés; no se ha evaluado en otros idiomas.
- El repositorio tiene 212 descargas y 1 like, lo que indica validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ihnatov-yuri/whisper-large-v3-turbo-uk
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Parakeet UK v3: https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
