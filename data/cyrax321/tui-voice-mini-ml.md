# Cyrax321/tui-voice-mini-ml

## Resumen

tui-voice-mini-ml es un modelo de síntesis de voz (text-to-speech) en malabar para una única voz femenina, desarrollado por Cyrax321 como un ajuste fino de la arquitectura tiny-voca. Su rasgo más distintivo es el tamaño: 4.537.291 parámetros en total, unos 18 MB en float32 y 21 MB en su exportación ONNX, lo que lo sitúa en la categoría de modelos ultraligeros capaces de ejecutarse en CPU o incluso en el navegador mediante WebAssembly. Genera audio mono a 24 kHz y está pensado para integrarse en aplicaciones donde el coste computacional y el peso del binario son críticos.

El modelo parte de los pesos preentrenados de tiny-voca y se ajusta con grabaciones de estudio femeninas del corpus AI4Bharat Rasa (aproximadamente 16.000 enunciados a 24 kHz). La entrada de texto se convierte a fonemas mediante eSpeak NG con el inventario IPA del malabar, y la síntesis final no emplea un vocoder neuronal pesado, sino un sintetizador fuente-filtro de solo 25.862 parámetros que predice el cepstrum complejo del filtro una vez por trama.

Es relevante ahora porque demuestra que es posible obtener voz inteligible en una lengua de bajos recursos como el malabar con un presupuesto de parámetros tres órdenes de magnitud inferior al de los sistemas TTS neuronales convencionales, y porque su exportación a ONNX con opset 17 facilita el despliegue en entornos sin GPU. La contrapartida es un ámbito de uso estrecho: un solo idioma, una sola voz y una calidad acústica limitada por el sintetizador fuente-filtro.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (4 bloques) + predictor de duración + dos transformers de trama (2 y 5 bloques) + sintetizador fuente-filtro; 192 canales, 4 cabezas, RoPE |
| Parámetros totales | 4.537.291 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por fonemas, sin ventana de contexto declarada) |
| Tipos de cuantización | float32 (PyTorch y ONNX); el autor menciona fp16 (~9 MB) pero no se documenta un artefacto cuantizado |
| Idiomas soportados | malabar (ml) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`tiny-voca.pt` / `model.pt`, float32) y ONNX (`onnx/model.onnx`, float32, opset 17) |

## Arquitectura y entrenamiento

El pipeline es el siguiente: el texto se normaliza, se convierte a fonemas con eSpeak NG (`-v ml --ipa`) y cada fonema recibe un valor de estrés (0 ninguno, 1 primario, 2 secundario). Un encoder transformer de 4 bloques procesa la secuencia de fonemas; un predictor de duración y pausas asigna a cada token una longitud en tramas de 256 muestras (10,7 ms). Dos transformers de trama (2 y 5 bloques) predicen a nivel de trama el pitch, la sonoridad, la energía y los parámetros del generador de onda. Todos los bloques usan 192 canales, 4 cabezas y embeddings posicionales rotatorios.

La generación de audio sustituye el vocoder neuronal por un sintetizador fuente-filtro: un tren de pulsos de banda limitada a la frecuencia fundamental predicha y una señal de ruido se conforman cada uno mediante un filtro variable en el tiempo, cuyo cepstrum complejo predice la red una vez por trama. El desglose de parámetros es: embeddings 16.704, encoder de texto 1.588.864, predictor de duración y pausa 123.906, transformer de trama A con cabeza de prosodia 795.971, transformer de trama B 1.985.984 y cabeza fuente-filtro 25.862.

El ajuste fino parte de tiny-voca (preentrenado durante 104.737 pasos) sobre las grabaciones de estudio femeninas en malabar de AI4Bharat Rasa. El alineamiento forzado de fonemas se realizó con `facebook/wav2vec2-lv-60-espeak-cv-ft`. Las pérdidas combinan STFT multirresolución y pérdidas espectrales mel, más una pérdida adversarial con discriminadores multiperiodo y multirresolución introducida a partir del paso 8.000. No se documenta RLHF ni DPO, lo cual es esperable en un sistema TTS.

## Capacidades

- Síntesis de voz en malabar a partir de texto, con salida mono a 24 kHz.
- Control de velocidad mediante el parámetro `speed` (1.0 corresponde a la velocidad predicha; valores mayores aceleran).
- Control de tono mediante `pitch_shift` (sumado al log F0) y `pitch_range` (escala el movimiento del tono).
- Entrada de estrés por fonema (ninguno, primario, secundario) para modular la prosodia.
- Selección de voz mediante el índice `voice`; en esta versión solo está disponible la ranura 0 (F2, femenina).
- Salida de duraciones por token en tramas de 256 muestras, útil para alineamiento y sincronización.
- Exportación ONNX ejecutable en Python y en WebAssembly, sin dependencia de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido en aplicaciones móviles sin conexión: con 21 MB en ONNX y ejecución en CPU, el modelo puede empaquetarse dentro de una app Android o iOS para leer artículos o notificaciones en malabar sin llamadas a servidores externos.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que necesiten una voz en malabar con latencia baja y consumo mínimo de batería, aprovechando que el sintetizador fuente-filtro evita el coste de un vocoder neuronal.
- Asistentes de voz embebidos en dispositivos de gama baja: el tamaño reducido permite ejecutar la síntesis en microcontroladores o SBC (por ejemplo, Raspberry Pi) que no pueden alojar modelos TTS convencionales de cientos de megabytes.
- Síntesis en el navegador mediante ONNX Runtime WebAssembly: aplicaciones web educativas o de e-learning en malabar que generan audio en el cliente sin enviar texto a un backend, lo que reduce costes y mejora la privacidad.
- Generación de avisos y locuciones dinámicas: sistemas de megafonía, transporte público o IVR que necesiten verbalizar mensajes variables en malabar con un presupuesto de memoria de decenas de megabytes.
- Prototipado rápido de interfaces de voz: gracias al control de `speed`, `pitch_shift` y `pitch_range`, se pueden generar variantes de locución para pruebas de usabilidad o doblaje sin reentrenar el modelo.
- Investigación en TTS de bajos recursos: sirve como referencia reproducible para estudiar hasta dónde llega la calidad con 4,5 millones de parámetros y un sintetizador fuente-filtro en una lengua con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo está diseñado para CPU. En GPU ocuparía menos de 100 MB en float32, pero no se documentan requisitos formales.
- GPU recomendadas: no disponible; el autor orienta el modelo a CPU y navegador, no a GPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con más de 1 GB de memoria podría alojarlo, pero no es el escenario previsto.
- Opciones de despliegue: ONNX Runtime (Python y WebAssembly) y PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no se publican cifras concretas. El autor afirma que el sintetizador fuente-filtro proporciona "extreme CPU/browser speed" y un footprint de aproximadamente 10 MB, pero sin mediciones de latencia por segundo de audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| tui-voice-mini-ml | 4,5 M | fonemas (sin contexto declarado) | malabar | Apache-2.0 | PyTorch, ONNX |
| tiny-voca (base) | no disponible en la información | fonemas | no disponible | no disponible | no disponible |
| VITS / Piper | del orden de decenas de millones (no confirmado) | fonemas | multilingüe | varía según modelo | ONNX |
| Modelos TTS neuronales grandes | cientos de millones a miles de millones | texto | multilingüe | varía | safetensors, ONNX |

No se dispone de datos de benchmarks ni de parámetros exactos de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Solo admite malabar; no está entrenado para otros idiomas.
- Los números y las palabras en alfabeto latino deben verbalizarse antes de la entrada en la versión 0; de lo contrario, la pronunciación será incorrecta.
- Una única voz de estudio femenina (ranura F2); no hay variedad de hablantes.
- El sintetizador fuente-filtro prioriza velocidad y tamaño reducido, lo que limita la calidad acústica frente a vocoders neuronales; el autor reconoce esta contrapartida en la model card.
- Riesgo de alucinación acústica o artefactos en prosodia con textos largos o mal normalizados, aunque no se documenta explícitamente.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, pero conviene verificar las condiciones del corpus AI4Bharat Rasa y de la base tiny-voca para usos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria ni informes independientes de calidad.
- No se documentan sesgos demográficos ni de género más allá de la limitación a una voz femenina concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cyrax321/tui-voice-mini-ml
- Repositorio del proyecto: https://github.com/Cyrax321/tui-voice
- Arquitectura base tiny-voca: https://github.com/n4ze3m/tiny-voca
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Modelo de alineamiento forzado: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
