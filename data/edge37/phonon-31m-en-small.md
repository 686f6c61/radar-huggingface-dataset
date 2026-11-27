# edge37/phonon-31m-en-small

## Resumen

phonon-31m-en-small es una recompilación cuantizada del modelo de síntesis de voz gradium/phonon-31m-en, publicada por el usuario edge37. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales a formato GGUF con esquemas de cuantización mixtos (Q8_0, Q6_K, Q5_K, F16 y F32 según la capa), que reduce el tamaño en disco de 64,5 MB a 43,2 MB manteniendo la misma red, tokenizador, voz y runtime que el modelo padre.

El modelo resuelve un problema muy concreto: desplegar un TTS de calidad en dispositivos con recursos limitados (on-device, edge) sin sacrificar inteligibilidad. La model card reporta que, en una prueba ciega con 3 semillas y 24 frases por modelo, esta compilación obtiene una tasa de error de palabra del 3,80 % frente al 4,29 % del GGUF oficial Q8_0, con una distancia DTW log-mel de 1,988 frente a 1,968 (diferencias mínimas en proximidad tímbrica).

Es relevante ahora porque demuestra que la cuantización selectiva por capas —manteniendo a 8 bits el transformer del bucle autorregresivo y las tablas de condicionamiento, y bajando a 6 y 5 bits el decodificador Mimi y la cabeza flow— permite ahorrar un tercio del espacio sin deriva perceptible de la voz. El modelo tiene 41.096.035 parámetros reales según safetensors y solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal con transformer autorregresivo frame-by-frame, cabeza flow y decodificador Mimi (heredero de gradium/phonon-31m-en) |
| Parametros totales | 41.096.035 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta por capas: Q8_0 (transformer del bucle, capas time/final/conditioning de la cabeza flow, tablas de texto y voz), Q6_K (transformer del decodificador Mimi), Q5_K (bloques residuales de la cabeza flow), F16 (convoluciones Mimi), F32 (tensores de menos de 16k elementos) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el repo no incluye model.safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo padre gradium/phonon-31m-en: un transformer que opera en un bucle frame-by-frame para generar los tokens acústicos, una cabeza flow que produce los residuos de cada frame y un decodificador Mimi que convierte la representación latente en audio. Esta compilación no reentrena ni modifica la topología: solo cambia los bits por peso de cada bloque.

El proceso de cuantización se documenta en el script shrink_phonon.py, que descarga los pesos originales del Hub y escribe bloques GGUF compatibles con llama.cpp. Las decisiones de bits son deliberadas: el transformer del bucle se mantiene a Q8_0 porque su salida se realimenta como entrada del siguiente frame y los errores se acumulan (a 6 bits la voz deriva); las tablas de texto y voz también exigen 8 bits; el decodificador Mimi, que se ejecuta una vez por frame, baja a Q6_K; las convoluciones no pueden cuantizarse por bloques en el runtime (su última dimensión es el tamaño del kernel) y se dejan en F16. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO, ya que esos datos pertenecen al modelo padre y no se detallan en esta model card.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto plano.
- Generación de audio en streaming, apta para reproducción incremental.
- Ejecución on-device: el tamaño de 43,2 MB permite embeberlo en aplicaciones de escritorio o móviles.
- Voz clonada/fijada: mantiene la misma voz que el modelo oficial gradium/phonon-31m-en.
- Control de semilla para reproducibilidad de la síntesis (misma frase y misma semilla producen tomas comparables).
- Compatibilidad con el runtime ptts (librería ptts) mediante el esquema hf://.
- Salida en fichero WAV mediante la API de Python o la CLI uvx.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni razonamiento multi-step: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones de escritorio: integrar ptts.TTS en una app de escritorio para leer notificaciones o documentos en inglés, aprovechando los 43,2 MB para no inflar el instalador.
- Asistentes de voz embebidos en dispositivos edge: desplegar el GGUF en hardware con poca memoria (Raspberry Pi, móviles) donde un TTS de 64,5 MB o modelos de cientos de MB no caben.
- Generación de audiolibros y podcasts automatizados: sintetizar lotes de texto en inglés con la CLI uvx y guardar WAVs, controlando la semilla para mantener consistencia entre capítulos.
- Accesibilidad web: convertir contenido textual en audio bajo demanda en el navegador o en un servicio ligero, con latencia baja gracias al modo streaming.
- Prototipado rápido de interfaces conversacionales: usar el modelo como capa TTS en demos de asistentes, sustituyéndolo por el modelo oficial si se necesita mayor fidelidad tímbrica.
- Pruebas A/B de calidad de voz: comparar esta compilación con el GGUF oficial Q8_0 usando las mismas frases y semillas para decidir qué variante desplegar en producción.
- Sistemas de aviso en tiempo real: anuncios de voz en aplicaciones de monitorización o domótica en inglés, donde el coste de memoria importa más que la fidelidad absoluta.

## Benchmarks y rendimiento

Datos de la model card (3 semillas × 24 frases por modelo; distancia = diferencia DTW log-mel frente a tomas del modelo oficial en 3 semillas distintas, 9 pares; error de palabra medido con un modelo ASR):

| Modelo | Tamano | Distancia | Error de palabra |
|---|---|---|---|
| Pesos originales (f32) | 102,8 MB | 1,972 | 4,41 % |
| GGUF oficial model.q8.gguf | 64,5 MB | 1,968 | 4,29 % |
| Esta compilacion | 43,2 MB | 1,988 | 3,80 % |

Variantes más agresivas probadas por el autor, con deriva: transformer del bucle a 6 bits (38,6 MB) +0,048 de distancia con los 9 pares peores; capas 0-2 a 4 bits (36,2 MB) +0,144; tablas de texto y voz a 4 bits aproximadamente +0,03.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el peso en disco es de 43,2 MB, por lo que la huella en memoria es del orden de decenas de MB más el overhead del runtime.
- GPU recomendadas: no disponible; el modelo está orientado a ejecución on-device y CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada, dado su tamaño.
- Opciones de despliegue: runtime ptts (CLI uvx ptts o librería Python ptts.TTS) con el esquema hf://; los bloques GGUF son compatibles con llama.cpp según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edge37/phonon-31m-en-small | 41.096.035 | no disponible | 43,2 MB | Apache 2.0 | Hugging Face (GGUF) |
| gradium/phonon-31m-en (oficial Q8_0) | 41.096.035 (misma red) | no disponible | 64,5 MB | Apache 2.0 | Hugging Face |
| Pesos originales f32 del modelo padre | 41.096.035 | no disponible | 102,8 MB | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- El repo contiene únicamente el build GGUF del runtime; no incluye model.safetensors, lo que limita su uso fuera de ptts/llama.cpp.
- La cuantización introduce una deriva medible: la distancia DTW log-mel sube de 1,968 a 1,988 frente al oficial, aunque el error ASR mejora en esta prueba concreta.
- El transformer del bucle no tolera 6 bits (la voz deriva), por lo que no es posible reducir más el tamaño sin degradación perceptible.
- No se han documentado sesgos específicos del modelo; al ser un TTS entrenado en inglés, puede presentar sesgos de pronunciación o prosodia en nombres propios y términos no nativos.
- Riesgo de alucinación acústica: como todo TTS neuronal, puede producir artefactos o pronunciaciones erróneas en texto atípico.
- Licencia Apache 2.0 heredada del modelo padre; permite uso comercial, pero conviene verificar las condiciones del modelo base gradium/phonon-31m-en.
- Modelo de autoría no oficial (usuario edge37), no publicado por el equipo de Gradium; para producción crítica puede ser preferible el modelo padre.

## Enlaces

- Hugging Face: https://huggingface.co/edge37/phonon-31m-en-small
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Script de cuantización: https://github.com/144126/dotfiles/blob/main/voice/shrink_phonon.py
- Issue upstream: https://github.com/gradium-ai/xn-ptts/issues/328
- Muestras de audio: https://huggingface.co/edge37/phonon-31m-en-small/resolve/main/samples/a.wav y https://huggingface.co/edge37/phonon-31m-en-small/resolve/main/samples/b.wav
