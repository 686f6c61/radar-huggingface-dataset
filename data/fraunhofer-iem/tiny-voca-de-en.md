# Fraunhofer-IEM/tiny-voca-de-en

## Resumen

Tiny Voca German/English es un modelo de síntesis de voz (text-to-speech) desarrollado por Fraunhofer-IEM, publicado bajo el identificador `Fraunhofer-IEM/tiny-voca-de-en`. Se trata en realidad de dos variantes independientes de una arquitectura denominada tiny-voca, entrenadas desde inicialización aleatoria (no son un fine-tune de pesos preentrenados) y orientadas a un conjunto fijo de voces sintéticas en alemán e inglés. El modelo resuelve el problema de generar voz con identidades vocales controladas y reproducibles sin necesidad de grabaciones humanas privadas, usando supervisión generada localmente con voces ficticias de Qwen.

La relevancia del proyecto es doble: por un lado, su tamaño extremadamente reducido (en torno a 4,5 millones de parámetros por variante, con pesos de aproximadamente 18 MB en safetensors), lo que lo hace apto para despliegues con requisitos mínimos de memoria; por otro, su enfoque de "fixed-roster", es decir, un conjunto cerrado de voces embebidas en el checkpoint en lugar de clonación zero-shot. Las dos variantes publicadas son `voca8` (4 voces en alemán y 4 en inglés) y `voca64` (32 voces en alemán y 32 en inglés).

El modelo opera sobre fonemas y marcas de estrés mediante una ABI de 88 símbolos, no sobre texto crudo ni audio de referencia, y produce salida mono a 24 kHz. Su licencia Apache 2.0 y su naturaleza sintética lo hacen interesante para investigación en TTS ligero, prototipado de asistentes y experimentación con voces ficticias, siempre con las cautelas de calidad que el propio autor señala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | tiny-voca (modelo de síntesis de voz; detalles internos no disponibles) |
| Parámetros totales | 4.541.899 (`voca8`) / 4.563.403 (`voca64`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por fonemas, no texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | alemán (de), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también artefactos PyTorch) |

## Arquitectura y entrenamiento

La arquitectura tiny-voca es un modelo de TTS de muy baja capacidad (alrededor de 4,5 millones de parámetros) que consume una secuencia de fonemas con marcas de estrés codificada en una ABI de 88 símbolos y devuelve una forma de onda mono a 24 kHz junto con metadatos de duración. No se detalla en la información disponible si emplea un transformer, un modelo convolucional o una arquitectura híbrida; el autor solo indica que se trata de la arquitectura tiny-voca y que las voces se gestionan mediante embeddings locales al checkpoint (voice embeddings), de modo que dos checkpoints con etiquetas de voz idénticas no comparten representaciones.

Ambas variantes se entrenaron desde inicialización aleatoria, no como fine-tune de pesos tiny-voca preentrenados, durante una ejecución fija de 104.000 pasos. La supervisión proviene de voces ficticias generadas localmente con Qwen, y el dataset asociado es `Fraunhofer-IEM/designed-voices-de-en`. El autor advierte que igual número de pasos no implica igual exposición por voz ni una comparación aislada de capacidad entre `voca8` y `voca64`, y que la subida pública del dataset está en curso, sin que exista todavía una revisión pública completa que reproduzca el subconjunto de entrenamiento congelado. No se especifica el número de tokens de entrenamiento, la composición exacta del corpus ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz en alemán e inglés a partir de secuencias de fonemas y estrés (ABI de 88 símbolos).
- Conjunto fijo de voces: 4 voces por idioma en `voca8` y 32 por idioma en `voca64`.
- Salida de audio mono a 24 kHz con metadatos de duración.
- Inferencia determinista y verificable: cuatro casos nativos fijos por variante coinciden muestra a muestra con la forma de onda original.
- Carga segura de pesos mediante el cargador de referencia `designed_tts.release.load_release`.
- Semilla de ruido neutra por defecto: 20261119.
- No soporta clonación zero-shot, inferencia a partir de audio de referencia ni control fiable de emoción.
- No incluye frontend de texto: la inferencia completa desde texto requiere `nrmlz` y `Phony`, y el pipeline de navegador público aún está en calificación.

## Casos de uso

- Prototipado de asistentes de voz en alemán e inglés: el modelo permite generar locuciones con una identidad vocal fija y reproducible sin depender de grabaciones humanas, útil para maquetas y pruebas de concepto con requisitos mínimos de memoria.
- Investigación en TTS ligero: con ~4,5 millones de parámetros y pesos de ~18 MB, sirve como banco de pruebas para estudiar el equilibrio entre capacidad, número de voces y calidad en modelos de síntesis de muy baja escala.
- Generación de voces sintéticas para datasets: al producir audio controlado y determinista, puede emplearse para crear material de entrenamiento o evaluación de otros sistemas, siempre que se respete la naturaleza sintética de las voces.
- Pruebas de integración en pipelines de audio: la API de referencia (`model.synthesize(phone_ids, voice, stress=stress_ids)`) devuelve forma de onda y metadatos de duración, lo que facilita su inserción en cadenas de procesamiento que ya dispongan de un frontend de fonemización.
- Evaluación de robustez de sistemas ASR: generar locuciones con distintas voces fijas permite construir conjuntos de prueba controlados para medir el rendimiento de reconocedores en condiciones de hablante acotadas.
- Docencia y divulgación: su tamaño reducido y su licencia Apache 2.0 permiten desplegarlo en entornos educativos y explicar de forma práctica el funcionamiento de un sistema TTS basado en fonemas y embeddings de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos safetensors ocupan ~18,2 MB por variante (18.186.220 bytes en `voca8`, 18.272.244 bytes en `voca64`), por lo que la inferencia cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada, y una GPU integrada o incluso CPU debería bastar.
- Cabe en GPU consumer: sí, en cualquier modelo con unos pocos cientos de MB de memoria disponible; el autor indica salida en CPU (`CPU waveform`).
- Opciones de despliegue: paquete de referencia `designed-voices-tts` (instalable vía `uv pip install` desde el archivo tar.gz fijado a la revisión `e1158b4e47053f2dae656e9c7ba1535554c7780c`), junto con `huggingface-hub` para la descarga. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor aclara explícitamente que no se ha cualificado TTFA en streaming, ni despliegue ONNX/WASM, ni telefonía, ni requisitos mínimos de RAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Enfoque de voces | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny Voca `voca8` (Fraunhofer-IEM) | 4.541.899 | de, en | 4 + 4 voces fijas | Apache 2.0 | Hugging Face |
| Tiny Voca `voca64` (Fraunhofer-IEM) | 4.563.403 | de, en | 32 + 32 voces fijas | Apache 2.0 | Hugging Face |
| Alternativas TTS de gran escala (p. ej. modelos tipo VITS o Tacotron) | no disponible | no disponible | clonación o voces múltiples | variable | no disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos comparables de la misma categoría (TTS de muy baja escala con roster fijo), por lo que la comparativa cuantitativa con alternativas concretas se considera no disponible.

## Limitaciones y advertencias

- No soporta clonación zero-shot ni inferencia a partir de audio de referencia.
- No ofrece control fiable de emoción.
- La calidad varía según la voz; el registro grave puede sonar metálico o con problemas de fase. El autor recomienda escuchar antes de usar en producción.
- No debe interpretarse una puntuación numérica o de ASR como medida de naturalidad.
- La entrada no es texto crudo: requiere fonemas y estrés según la ABI de 88 símbolos; la inferencia completa desde texto necesita `nrmlz` y `Phony`, y el pipeline de navegador aún no está cualificado.
- El dataset público de entrenamiento está en proceso de subida y no hay todavía una revisión completa que reproduzca el subconjunto congelado de entrenamiento.
- Las herramientas completas de entrenamiento y el Space cliente están en desarrollo.
- Los tamaños indicados excluyen activos de frontend y runtime.
- No se ha cualificado el despliegue en ONNX/WASM, telefonía, streaming con TTFA ni requisitos mínimos de RAM.
- Los embeddings de voz son locales al checkpoint: etiquetas de voz iguales entre checkpoints no implican la misma identidad vocal.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse los créditos de LICENSE, ATTRIBUTION.md y THIRD_PARTY_NOTICES.md (código, inicialización, teacher, texto y diccionarios).
- No se incluyen grabaciones humanas ni rankings privados; las voces son sintéticas y ficticias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fraunhofer-IEM/tiny-voca-de-en
- Dataset de entrenamiento: https://huggingface.co/datasets/Fraunhofer-IEM/designed-voices-de-en
- Repositorio de inferencia de referencia: https://github.com/fraunhofer-iem/designed-voices-tts
- Revisión fijada del repositorio: https://github.com/fraunhofer-iem/designed-voices-tts/archive/e1158b4e47053f2dae656e9c7ba1535554c7780c.tar.gz
- Proyecto ENGAGE-KI (financiación): https://engage-ki.de/
