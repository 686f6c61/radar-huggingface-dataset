# futo-org/futo-swipe

## Resumen

FUTO Swipe es una familia de modelos neuronales ligeros desarrollados por FUTO (futo-org) para decodificar gestos de deslizamiento (swipe typing o shape-writing) en texto, pensados para ejecutarse en el propio dispositivo móvil. No es un modelo de lenguaje generativo: es un sistema de reconocimiento de trayectorias táctiles compuesto por tres redes convolucionales independientes (encoder, decoder y modelo de lenguaje de contexto) que convierten la secuencia de coordenadas `(x, y, t)` de un gesto sobre el teclado en una secuencia de caracteres.

La pieza central es el encoder `honorable_sturgeon`, una red convolucional temporal 1D (TCN) de tan solo 635 K parámetros (2,65 MB en fp32, 1,0 MB en int8) que emite patrones espectrales por paso temporal y evalúa una base coseno fija en las coordenadas de cada tecla. Su rasgo diferencial es que es agnóstico al layout: el mismo modelo decodifica cualquier distribución de teclado siempre que se le proporcione en tiempo de ejecución el tensor de coordenadas de las teclas, sin reentrenamiento. Los componentes opcionales `magic_macaw` (decoder DFSMN, 304 K parámetros, solo inglés/QWERTY) y `chosen_planarian` (modelo de lenguaje causal DFSMN, 1,5 M parámetros, solo inglés) refinan la salida del encoder.

El modelo es relevante por su enfoque de eficiencia extrema: todo el sistema cabe en menos de 10 MB en fp32 y se distribuye en formato ExecuTorch (`.pte`) con backend XNNPACK, lo que permite inferencia en CPU de móvil sin aceleradores dedicados. Fue publicado en mayo de 2026 y actualizado en noviembre de 2026, con un informe técnico en arXiv y una demo pública. Su licencia es propietaria (`futo-model-weights-license-1.0`), no open source en sentido estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN temporal 1D (TCN) para el encoder; DFSMN para decoder y modelo de lenguaje |
| Parametros totales | 635 K (encoder) + 304 K (decoder) + 1,5 M (context LM) = ~2,44 M en el sistema completo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el context LM es de siguiente palabra; no se especifica ventana) |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion de convoluciones 1x1 y adaptador) |
| Idiomas soportados | encoder: agnostico de idioma y layout; decoder: solo ingles/QWERTY; context LM: solo ingles |
| Licencia | futo-model-weights-license-1.0 (propietaria, `other`) |
| Formato de pesos | ExecuTorch `.pte` (`model_fp32.pte`, `model_int8.pte`); el repositorio no indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El encoder `honorable_sturgeon` es una red convolucional temporal 1D que procesa la trayectoria táctil cruda `(x, y)` y emite, para cada paso temporal, un patrón espectral de 64 coeficientes junto con una compuerta escalar de "intención". Las puntuaciones por tecla se obtienen evaluando una base coseno fija (DCT) en los centros de las teclas del layout, que se suministran como tensor en tiempo de ejecución. Esta separación entre representación (aprendida) y layout (dato de entrada) es la innovación clave: cambiar de QWERTY a AZERTY o a un layout personalizado solo requiere sustituir el tensor de coordenadas.

El decoder `magic_macaw` es un DFSMN (Deep Feedforward Sequential Memory Network) pequeño que opera sobre las características congeladas del encoder y refina la distribución de caracteres para layouts concretos; solo se entrenó con datos de inglés/QWERTY. El modelo de contexto `chosen_planarian` es un LM causal DFSMN con embedding hash para vocabularios grandes, que aporta puntuación de rerank en beam search y predicción de siguiente palabra. Los datos de entrenamiento provienen de los datasets `futo-org/swipe.futo.org` y `futo-org/swipe-negatives`; no se detalla en la información disponible el número de tokens ni la composición exacta. La decodificación se plantea con beam search (beam 100 en las cifras publicadas) y se recomienda constreñir a un léxico (trie o WFST), ya que la decodificación greedy es poco precisa.

## Capacidades

- Decodificación de gestos de deslizamiento (swipe/shape-writing) en secuencias de caracteres.
- Soporte de cualquier layout de teclado en el encoder mediante tensor de coordenadas en runtime, sin reentrenamiento.
- Refinamiento por layout específico con el decoder (actualmente solo inglés/QWERTY).
- Predicción de siguiente palabra y rerank de candidatos en beam search con el context LM (inglés).
- Emisión de una compuerta de "intención" por paso temporal, útil para detectar gestos inválidos o incompletos.
- Inferencia on-device en CPU móvil mediante ExecuTorch y XNNPACK.
- Cuantización int8 con pérdida de precisión mínima (84,40 % vs. 84,36 % de acierto en el split de test inglés).
- No soporta tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso; no es un modelo generativo de propósito general.

## Casos de uso

- Teclados móviles con entrada por deslizamiento: integrar el encoder en la app de teclado para convertir el trazo del usuario en candidatos de palabra, con el context LM ordenando las opciones según la frase en curso. El tamaño de 1,0 MB int8 permite incluirlo en el binario de la app sin coste apreciable de almacenamiento.
- Soporte de layouts regionales y personalizados: al ser el encoder agnóstico al layout, un teclado puede ofrecer QWERTY, AZERTY, Dvorak o disposiciones propias pasando únicamente las coordenadas de las teclas, sin necesidad de entrenar un modelo por idioma.
- Accesibilidad para usuarios con dificultades motoras: la compuerta de intención y el beam search con léxico permiten tolerar trazos imprecisos y filtrar gestos accidentales, reduciendo la carga motora de la escritura.
- Decodificación en dispositivos de bajos recursos: con menos de 10 MB en fp32 y 1,0 MB en int8 para el encoder, es viable en móviles de gama baja, relojes inteligentes o dispositivos embebidos con CPU ARM y ExecuTorch.
- Investigación en reconocimiento de gestos: el informe técnico y los datasets publicados permiten reproducir y extender el enfoque TCN + base DCT para nuevas tareas de decodificación de trayectorias.
- Prototipado de teclados en escritorio: la demo y el ejemplo en CPU x86 con el runtime de ExecuTorch permiten validar el pipeline de decodificación antes de portarlo a móvil.
- Filtrado de gestos no intencionados en interfaces táctiles: la compuerta escalar por paso temporal puede reutilizarse para distinguir trazos deliberados de roces accidentales en otras aplicaciones de entrada gestual.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Acierto de decodificacion (encoder, fp32) | 84,36 % | Split de test ingles, 10.000 swipes, beam 100, sin término de frecuencia de palabra |
| Acierto de decodificacion (encoder, int8) | 84,40 % | Mismas condiciones que fp32 |

No se han publicado en la información disponible resultados comparativos con otros modelos de swipe typing (por ejemplo, Gboard o SwiftKey) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada: el encoder requiere 2,65 MB en fp32 y 1,0 MB en int8; el sistema completo (encoder + decoder + context LM) ocupa aproximadamente 10,15 MB en fp32.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. No se documentan requisitos de GPU.
- Cabe en cualquier GPU consumer y en CPU móvil: el despliegue objetivo es ARM en smartphones mediante ExecuTorch 1.5 con backend XNNPACK.
- Opciones de despliegue: ExecuTorch (runtime oficial, con ejemplo en CPU x86), backend XNNPACK para móvil. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Acierto | Licencia | Formato |
|---|---|---|---|---|---|
| FUTO Swipe (encoder) | 635 K | no aplica | 84,4 % (test ingles) | futo-model-weights-license-1.0 | ExecuTorch `.pte` |
| Alternativas comerciales (Gboard, SwiftKey) | no disponible | no aplica | no disponible | propietaria, no distribuida | no disponible |
| Modelos academicos de swipe typing | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables con parámetros, contexto o resultados publicados que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El decoder y el modelo de contexto solo funcionan en inglés; para otros idiomas únicamente está disponible el encoder, con menor precisión.
- El decoder está entrenado exclusivamente para QWERTY; otros layouts se benefician solo del encoder.
- La decodificación greedy es poco precisa; en producción es necesario constreñir a un léxico (trie, WFST) y usar beam search para obtener resultados utilizables.
- Riesgo de sesgo hacia el vocabulario y los patrones de escritura presentes en los datasets de entrenamiento (`swipe.futo.org` y `swipe-negatives`), que no se detallan en la información disponible.
- Licencia propietaria `futo-model-weights-license-1.0`: es necesario revisar `LICENSE.md` antes de cualquier uso comercial; no es una licencia open source.
- No es un modelo de lenguaje: no genera texto libre, no razona y no soporta tool calling ni agentes; usarlo fuera del ámbito de decodificación de gestos no es adecuado.
- No se publican métricas de latencia, consumo energético ni comportamiento en dispositivos concretos, lo que dificulta estimar el rendimiento en producción sin pruebas propias.
- El repositorio ocupa 0,0 GB según Hugging Face, lo que sugiere que los pesos pueden no estar incluidos o que el tamaño reportado es impreciso; conviene verificar la disponibilidad de los ficheros `.pte` antes de integrar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/futo-org/futo-swipe
- Demo: https://swipe.futo.tech/
- Anuncio de release (vídeo): https://youtu.be/OIPVcP8u2mo
- Descripción técnica (vídeo): https://youtu.be/tVXWxOF819c
- Informe técnico (arXiv): https://arxiv.org/abs/2606.25247
- Dataset de swipes: https://huggingface.co/datasets/futo-org/swipe.futo.org
- Dataset de negativos: https://huggingface.co/datasets/futo-org/swipe-negatives
- Licencia: https://huggingface.co/futo-org/futo-swipe/blob/main/LICENSE.md
