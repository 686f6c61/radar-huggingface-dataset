# kulikov0/micro-doom-world

## Resumen

micro-doom-world es un modelo del mundo (world model) de 39,4 millones de parámetros que simula un juego tipo Doom. Lo desarrolla el usuario kulikov0 y se publica bajo licencia MIT. Dado un historial de fotogramas previos y las teclas pulsadas por el jugador, el modelo genera el siguiente fotograma a resolución 128x96 píxeles. No es un modelo de lenguaje: es un modelo generativo de vídeo condicionado por acciones, orientado a la simulación interactiva de entornos.

La arquitectura se compone de dos piezas: un autocodificador convolucional determinista de 7,2 millones de parámetros que comprime cada fotograma en una rejilla de 6x8 tokens de 32 canales (un token por cada bloque de 16x16 píxeles), y un transformer de 39,4 millones de parámetros que modela la dinámica sobre una ventana de 32 fotogramas. El transformer usa atención block-causal con RoPE 3D (tiempo, fila y columna), modulación AdaLN-Zero y entrenamiento mediante rectified flow con diffusion forcing.

Su relevancia es doble: por un lado, demuestra que un modelo del mundo interactivo puede ejecutarse en el navegador con un presupuesto de parámetros muy reducido; por otro, la generación de cada fotograma en un solo paso tras el post-entrenamiento adversarial lo hace viable en tiempo real. El repositorio ocupa 0,4 GB e incluye pesos en fp32 en formato safetensors, además de dos variantes de modelo de dinámica (`ladder` y `rf`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autocodificador convolucional (tokenizer) + transformer de difusión sobre latentes |
| Parámetros totales | 39,4 M (modelo de dinámica); 7,2 M adicionales (tokenizer: 4,2 M encoder + 3,0 M decoder) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de 32 fotogramas, 48 tokens por fotograma |
| Tipos de cuantización | No disponible (pesos publicados en fp32) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT (pesos); datos de entrenamiento de Freedoom, BSD-3-Clause |
| Formato de pesos | safetensors (fp32) + config.json |
| Resolución de salida | 128x96 píxeles, RGB |
| Acciones de entrada | 8 valores: adelante, atrás, lateral izquierda, lateral derecha, correr, atacar, usar, ángulo de giro |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El tokenizer es un autocodificador convolucional determinista que procesa un fotograma cada vez. El encoder aplica un pixel unshuffle de 128x96x3 a 64x48x12, una convolución 3x3 a 64 canales, tres etapas de bloque residual más convolución con stride 2 hasta 128, 192 y 256 canales, dos bloques residuales, ReLU, una convolución 1x1 a 32 canales y tanh. El resultado es una rejilla de 6x8 tokens de 32 canales. El decoder invierte el proceso con upsampling por vecino más cercano y pixel shuffle hasta reconstruir 128x96x3.

El modelo de dinámica es un transformer de 8 bloques de anchura 512 con 8 cabezas de 64 dimensiones. Cada token se proyecta de 32 a 512 dimensiones y recibe un embedding aprendido de su celda de la rejilla. El condicionamiento por fotograma se calcula como `c = SiLU(MLP(t) + MLP(action) + MLP(d))`, donde `t` es el nivel de ruido y `d` el tamaño de paso del shortcut, ambos con embedding sinusoidal. Cada bloque incorpora modulación AdaLN-Zero desde `c`, RMS norm, atención con QK-norm y RoPE 3D sobre tiempo, fila y columna, y un MLP 512-2048-512 con GELU. La atención es block-causal: cada token ve su propio fotograma y los anteriores. La cabeza de salida predice el latente limpio.

El entrenamiento se desarrolla en cuatro fases. Primero, el tokenizer se entrena con L1 + LPIPS durante 40.500 pasos y luego se afina el decoder contra un discriminador PatchGAN durante 9.000 pasos con el encoder congelado. Segundo, el modelo base se entrena con rectified flow, diffusion forcing y predicción de x, con shortcut training en el 25 % de los pasos y alineamiento iREPA de los tokens del bloque 3 con características de DINOv2 ViT-B/14, durante 30.000 pasos con batch 32. Tercero, solo la variante `rf` aplica resampling forcing en el 75 % de los pasos durante 5.000 pasos. Cuarto, ambas variantes reciben post-entrenamiento adversarial al estilo APT y AAPT sin profesor: el modelo genera rollouts de 48, 96 y 192 fotogramas y un discriminador construido a partir de una copia del modelo los puntúa, durante 1.750 pasos. Tras esta fase, el modelo genera un fotograma en un solo paso.

Los datos proceden de los niveles E1M1, E1M2 y E1M3 de Freedoom Phase 1 renderizados con ViZDoom, con las puertas abiertas. Un jugador scriptado sigue rutas sobre el mapa, se detiene, mira alrededor y combate. Se recopilan 500.000 fotogramas con acciones por nivel, más dos partidas retenidas por nivel para evaluación.

## Capacidades

- Generación de fotogramas de vídeo condicionada por acciones en un entorno tipo Doom, a 128x96 píxeles.
- Simulación interactiva en tiempo real: cada fotograma se genera en un solo paso tras el post-entrenamiento adversarial.
- Mantenimiento de coherencia temporal sobre ventanas de 32 fotogramas mediante caché KV de los 31 fotogramas anteriores.
- Condicionamiento fino por 8 acciones discretas y continuas (movimiento, carrera, ataque, uso y ángulo de giro).
- Ejecución en navegador: existen demos públicas en Hugging Face Spaces con dos variantes (`ladder` y `rf`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera del vídeo de juego.

## Casos de uso

- Investigación en modelos del mundo: servir como banco de pruebas de bajo coste para estudiar diffusion forcing, shortcut training y post-entrenamiento adversarial en entornos interactivos, con solo 39,4 M de parámetros y un repositorio de 0,4 GB.
- Demos interactivas en navegador: las variantes `ladder` y `rf` ya se despliegan en Hugging Face Spaces, lo que permite mostrar generación de vídeo condicionada por acciones sin infraestructura GPU dedicada en el cliente.
- Enseñanza de arquitecturas generativas: el código en `model.py` y los `config.json` con los argumentos de entrenamiento y las estadísticas de los latentes facilitan reproducir el pipeline completo (tokenizer, rectified flow, adversarial).
- Prototipado de agentes de refuerzo en entornos simulados: el modelo puede actuar como sustituto barato del simulador real para entrenar o evaluar políticas que consumen fotogramas y emiten las 8 acciones soportadas.
- Evaluación de métricas de realismo: los 24 arranques retenidos en `starts.npz` (8 fotogramas reales y sus acciones) permiten comparar LPIPS, distancia de kernel sobre DINOv2 y puntuación de crítico entre variantes.
- Generación de vídeo de gameplay sintético: útil para aumentar datasets de vídeo de juego con acciones anotadas de forma automática, siempre que se acepten las limitaciones de deriva a largo plazo.
- Comparación de estrategias de muestreo: las variantes `ladder` (base + adversarial) y `rf` (base + resampling forcing + adversarial) permiten estudiar el impacto del resampling forcing en la calidad a largo plazo con el mismo tokenizer.

## Benchmarks y rendimiento

Evaluación sobre 24 arranques retenidos (8 por nivel): 8 fotogramas reales y 480 fotogramas generados con las acciones de la partida real.

| Métrica | Juego real | base | ladder | rf |
|---|---|---|---|---|
| LPIPS al fotograma real en 1 / 15 / 480 | - | .148 / .396 / .618 | .151 / .398 / .567 | .150 / .414 / .546 |
| Distancia de kernel sobre características DINOv2 x1e3, fotogramas 1-32 / 449-480 | 617 / 173 | 4090 / 5690 | 4090 / 4240 | 4190 / 3590 |
| Crítico P(real), fotogramas 1-32 / 449-480 | .65 / .67 | .30 / .15 | .43 / .41 | .41 / .36 |

LPIPS mide la distancia al fotograma real en el mismo paso (menor es mejor). La distancia de kernel y el crítico miden realismo sin correspondencia exacta de fotograma; en la distancia de kernel, menor es mejor; en el crítico, mayor es mejor. El crítico se entrena con los tres modelos a la vez, por lo que sus puntuaciones solo comparan modelos dentro de esta tabla. Los dos modelos de dinámica puntúan de forma similar, con ventaja de `rf` en las métricas de largo plazo (480 fotogramas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 39,4 M parámetros en fp32 (unos 158 MB) más el tokenizer de 7,2 M (unos 29 MB), el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el despliegue en navegador sugiere que la inferencia es viable incluso en entornos con recursos limitados.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente con memoria suficiente para los pesos fp32 y la caché KV de 31 fotogramas.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y el bucle de generación de `model.py`; las demos usan Hugging Face Spaces. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que tras el post-entrenamiento adversarial el modelo genera un fotograma en un solo paso, lo que hace viable la ejecución interactiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| micro-doom-world | 39,4 M + 7,2 M tokenizer | 32 fotogramas | Vídeo de juego condicionado por acciones, 128x96 | MIT | Pesos en HF, código en GitHub, demos en Spaces |
| Modelos del mundo tipo GameNGen o similares | No disponible en la información proporcionada | No disponible | Vídeo de juego | No disponible | No disponible |
| Alternativas de difusión para vídeo de propósito general | No disponible en la información proporcionada | No disponible | Vídeo | No disponible | No disponible |

No se dispone de datos verificables sobre modelos comparables de la misma categoría (modelos del mundo interactivos a pequeña escala) en la información proporcionada.

## Limitaciones y advertencias

- Solo conoce los tres niveles entrenados (E1M1, E1M2 y E1M3 de Freedoom Phase 1) y únicamente a resolución 128x96.
- Deriva en ejecuciones largas: las texturas se emborronan y, a lo largo de miles de fotogramas, el arma puede perder su forma.
- No modela estado de juego como salud, munición o puertas; los enemigos son aproximados.
- No es un modelo de lenguaje: carece de capacidades de texto, razonamiento, código, tool calling o multilingüismo.
- Riesgo de alucinación visual: al generar fotogramas plausibles pero no fieles al estado real del juego, no debe usarse como sustituto del simulador para evaluaciones que dependan de la física o la lógica del juego.
- Sesgos: no documentados por el autor; los datos provienen de un jugador scriptado y de tres niveles concretos, lo que limita la diversidad de comportamientos representados.
- Licencia MIT para los pesos, compatible con uso comercial; los fotogramas de entrenamiento provienen de Freedoom (BSD-3-Clause) renderizado con ViZDoom (MIT), y el proyecto no está afiliado a id Software.
- Para producción, conviene validar la deriva a largo plazo y la fidelidad de las acciones antes de usar el modelo como entorno de entrenamiento de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kulikov0/micro-doom-world
- Demo `ladder`: https://huggingface.co/spaces/kulikov0/micro-doom-world
- Demo `rf`: https://huggingface.co/spaces/kulikov0/micro-doom-world?model=rf
- Código: https://github.com/kulikov0/micro-doom-world
- Bucle de generación y clases del modelo: https://github.com/kulikov0/micro-doom-world/blob/main/model.py
- Vídeo de gameplay: https://huggingface.co/kulikov0/micro-doom-world/resolve/main/gameplay.mp4
- Freedoom: https://freedoom.github.io/
- ViZDoom: https://github.com/Farama-Foundation/ViZDoom
