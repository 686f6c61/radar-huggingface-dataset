# oddadmix/nano-voca-english

## Resumen

nano-voca-english es un modelo de síntesis de voz (text-to-speech) en inglés de tan solo 1,16 millones de parámetros, desarrollado por oddadmix y publicado bajo licencia Apache 2.0. Se trata de un modelo entrenado desde cero (trained-from-scratch) que reutiliza la arquitectura, el código de entrenamiento y el fonemizador del proyecto tiny-voca de Muhammed Nazeem, pero con capas más estrechas y voces nuevas. Convierte texto en audio a 24 kHz e incluye el generador de forma de onda, sin vocoder neuronal separado.

Su relevancia radica en la eficiencia extrema: con solo 5 MB en formato PyTorch y 7,9 MB en ONNX, alcanza aproximadamente 407 veces el tiempo real en cuatro hilos de CPU. Esto lo sitúa como una opción viable para síntesis de voz en dispositivos sin GPU, sistemas embebidos o aplicaciones de borde donde el consumo de recursos es crítico. Ofrece ocho voces (cuatro estilos: assistant, news, story y promo, con una voz femenina y otra masculina por estilo) y está orientado exclusivamente al idioma inglés.

El modelo se publicó el 26 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes en Hugging Face. Es una alternativa de tamaño aún menor que su hermano micro-voca-english (2,29M parámetros), con una velocidad en CPU ligeramente superior y métricas de calidad muy similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con predicción de duraciones, pausas, tono, sonoridad y energía, seguida de un sintetizador fuente-filtro (sin vocoder neuronal); pipeline tiny-voca con capas más estrechas |
| Parametros totales | 1.157.803 (1,16M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en PyTorch y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (5 MB) y ONNX (7,9 MB) |

## Arquitectura y entrenamiento

El modelo sigue el pipeline de tiny-voca. En primer lugar, el fonemizador dizione convierte el texto en fonemas mediante un léxico derivado de CMUdict, un pequeño modelo neuronal G2P para palabras desconocidas, un modelo de homógrafos y reglas para números, fechas, dinero y abreviaturas. A continuación, la red neuronal predice duraciones, pausas, tono, sonoridad y energía, y un sintetizador fuente-filtro genera la forma de onda directamente, sin vocoder neuronal independiente. La anchura de las capas es de 96 canales, 320 en la capa feed-forward y 64 en el predictor, más estrecha que la de micro-voca-english (128/512/96).

El entrenamiento se realizó desde cero sobre voces nuevas; no se reutilizaron pesos de tiny-voca. La model card no detalla el número de tokens de audio, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO, por lo que estos datos deben considerarse no disponibles. La evaluación se hizo con transcripciones de Whisper small.en sobre frases retenidas y con los conjuntos de test del Open TTS Leaderboard, lo que sugiere un enfoque de validación centrado en inteligibilidad y naturalidad.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida de audio a 24 kHz.
- Ocho voces predefinidas en cuatro estilos (assistant, news, story y promo), con una voz femenina y otra masculina por estilo.
- Generación de forma de onda integrada: no requiere un vocoder neuronal externo.
- Fonemización robusta mediante dizione: léxico CMUdict, G2P neuronal para palabras desconocidas, modelo de homógrafos y reglas para números, fechas, dinero y abreviaturas.
- Inferencia en CPU muy rápida: aproximadamente 407 veces el tiempo real con cuatro hilos en ONNX.
- Ejecución en dispositivos de bajos recursos gracias a su tamaño reducido (5 MB PyTorch, 7,9 MB ONNX).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking; es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistentes de voz en dispositivos de borde: el modelo puede ejecutarse íntegramente en CPU en routers, Raspberry Pi o móviles de gama baja, generando respuestas habladas en tiempo real gracias a su velocidad de 407× tiempo real y su huella de 7,9 MB en ONNX.
- Lectura de notificaciones y alertas: con la voz de estilo news (nf2 o nm2) se pueden locutar titulares, avisos de sistemas o mensajes de monitorización sin depender de servicios en la nube.
- Audiolibros y narración de cuentos: el estilo story (sf1, sm3) permite narrar textos largos con una entonación adecuada, y el fonemizador maneja números y abreviaturas habituales en narrativa.
- Anuncios y promociones: el estilo promo (pf4, pm2) está pensado para locuciones publicitarias breves, como ofertas o llamadas a la acción en aplicaciones de comercio electrónico.
- Atención al cliente automatizada en inglés: la voz assistant (a000, am6) puede gestionar respuestas habladas en sistemas IVR o chatbots de voz, con latencia baja al ejecutarse localmente.
- Accesibilidad y lectura de pantalla: integración en lectores de pantalla o aplicaciones de accesibilidad que necesiten síntesis de voz offline en inglés, sin enviar texto a servidores externos.
- Pruebas y prototipado de pipelines TTS: al ser un modelo pequeño y con licencia Apache 2.0, es útil como baseline para experimentar con fonemización, estilos y evaluación de inteligibilidad antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card incluye métricas de evaluación propias y del Open TTS Leaderboard (ejecutadas localmente, no como entrada oficial). Se presentan a continuación los datos disponibles.

| Metrica | nano-voca-english | micro-voca-english |
|---|---|---|
| Parametros | 1.157.803 | 2.289.163 |
| Anchura (canales / feed-forward / predictor) | 96 / 320 / 64 | 128 / 512 / 96 |
| Velocidad en CPU, 4 hilos (ONNX) | ~407× tiempo real | ~370× tiempo real |
| CER validacion / test / frases nuevas | 1,9% / 1,5% / 0,2% | 1,9% / 1,4% / 0,7% |
| WER medio en conjuntos del Open TTS Leaderboard (voz a000) | 0,87% | 0,74% |
| UTMOS (voz a000) | 4,53 | 4,53 |
| DNSMOS P.808 (40 muestras) | 3,89 | 3,88 |

CER por voz en frases retenidas (transcripciones con Whisper small.en):

| Voz | Validacion | Test | Frases nuevas |
|---|---|---|---|
| a000 assistant F | 2,7% | 4,5% | 0,8% |
| am6 assistant M | 3,2% | 1,9% | 0,0% |
| nf2 news F | 3,6% | 1,1% | 0,0% |
| nm2 news M | 1,9% | 0,7% | 0,0% |
| sf1 story F | 1,3% | 1,0% | 0,0% |
| sm3 story M | 1,2% | 0,8% | 0,0% |
| pf4 promo F | 0,1% | 1,7% | 0,8% |
| pm2 promo M | 0,1% | 1,8% | 0,0% |

La model card indica que la mayor parte del error restante proviene del sistema de puntuación (números y variantes ortográficas), ya que las grabaciones originales obtienen puntuaciones similares. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo está diseñado para CPU. En ONNX ocupa 7,9 MB y en PyTorch 5 MB, por lo que la memoria necesaria es mínima (del orden de decenas de MB incluyendo el runtime).
- GPU recomendadas: no aplica; cualquier GPU es innecesaria. Si se desea, puede ejecutarse en cualquier GPU compatible con ONNX Runtime, pero no aporta ventajas significativas.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU; también en sistemas embebidos y móviles.
- Opciones de despliegue: ONNX Runtime (formato principal), PyTorch, y cualquier runtime compatible con ONNX. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no están orientados a TTS.
- Latencia y throughput: aproximadamente 407× tiempo real en cuatro hilos de CPU con ONNX, lo que implica que un segundo de audio se genera en unos 2,5 ms de cómputo en ese entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (UTMOS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nano-voca-english | 1,16M | No disponible | 4,53 | Apache 2.0 | Hugging Face, ONNX y PyTorch |
| micro-voca-english | 2,29M | No disponible | 4,53 | Apache 2.0 (según repo del autor) | Hugging Face |
| tiny-voca (base arquitectónica) | No disponible | No disponible | No disponible | Apache 2.0 | Hugging Face y GitHub |

La comparación se limita a los modelos de la misma familia, ya que la model card no ofrece datos frente a otros sistemas TTS. nano-voca-english es el más pequeño y rápido de los tres, con una calidad muy cercana a micro-voca-english en UTMOS y DNSMOS, aunque con un WER medio ligeramente superior en los conjuntos del Open TTS Leaderboard (0,87% frente a 0,74%).

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Al ser un modelo entrenado desde cero con pocas voces, puede presentar sesgos de pronunciación o entonación en dominios no representados en el entrenamiento.
- Riesgo de errores en la fonemización de palabras desconocidas, nombres propios o terminología técnica, aunque el G2P neuronal mitiga parte del problema.
- La evaluación se realizó con Whisper small.en y con el pipeline local del Open TTS Leaderboard; no es una entrada oficial del leaderboard, por lo que los números deben interpretarse con cautela.
- No se documentan datos sobre el dataset de entrenamiento, lo que limita la evaluación de sesgos y de cobertura lingüística.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar la atribución a tiny-voca y a dizione según los términos de sus respectivas licencias.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Su uso en producción debe limitarse a síntesis de voz.
- La calidad en frases nuevas es buena en CER (0,0%–0,8% en la mayoría de voces), pero puede degradarse con textos muy largos o con puntuación atípica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/nano-voca-english
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/oddadmix/nano-voca-english
- Modelo hermano micro-voca-english: https://huggingface.co/oddadmix/micro-voca-english
- tiny-voca (modelo base): https://huggingface.co/n4ze3m/tiny-voca
- Repositorio de tiny-voca: https://github.com/n4ze3m/tiny-voca
- Fonemizador dizione: https://github.com/n4ze3m/dizione
- Open TTS Leaderboard: https://huggingface.co/spaces/hf-audio/open_tts_leaderboard
- Código del Open TTS Leaderboard: https://github.com/huggingface/open-tts-leaderboard
