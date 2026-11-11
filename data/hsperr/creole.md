# hsperr/creole

## Resumen

Creole es un bot de bridge de contrato (contract bridge) desarrollado por Henning Sperr (hsperr) que combina dos redes neuronales para cubrir las dos fases del juego: una red conjunta que gestiona la subasta (bidding) y actúa como desempate en el juego de cartas, y una red de creencias (belief net) que estima qué cartas no vistas tiene cada jugador. A diferencia de su predecesor Pidgin, que inventaba un único sistema de subasta propio, Creole es capaz de subastar con 33 sistemas distintos (2/1 GF, SAYC, Acol, Polish Club, Precision, UCBC, WBridge5, VieNNa y variantes de tarjetas de convención EPBot), recibiendo como entrada qué sistema juega cada lado.

El modelo resuelve el problema de la heterogeneidad de sistemas en el bridge competitivo: un bot que solo domina un sistema se ve limitado frente a oponentes que juegan otros. Creole emplea una arquitectura transformer causal (8 capas, 512 de anchura, 8 cabezas) para la red conjunta (28,1M parámetros) y un MLP con compuertas SwiGLU (8 bloques, 1024 de anchura) para la red de creencias (52,4M parámetros). El juego de cartas se resuelve mediante PIMC (Monte Carlo con información imperfecta) con muestreo de layouts desde la red de creencias y resolución double dummy.

Es relevante ahora porque demuestra que el aprendizaje por refuerzo con self-play y ligas PFSP puede generalizar a múltiples sistemas de subasta simultáneamente en un dominio de información imperfecta, manteniendo un coste de inferencia muy bajo (CPU, ~0,8 GB de memoria, ~15 ms por llamada de subasta). El repositorio ocupa 0,3 GB y los pesos están en formato PyTorch nativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red conjunta: transformer causal (8 capas, 512 de anchura, 8 cabezas) sobre eventos del tablero; red de creencias: MLP con compuertas, 8 bloques SwiGLU, 1024 de anchura |
| Parámetros totales | 80,5M (28,1M red conjunta + 52,4M red de creencias) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (secuencia de eventos del tablero, no ventana de tokens de texto) |
| Tipos de cuantización | no disponible (pesos float32) |
| Idiomas soportados | no disponible (dominio de bridge, sin capacidades de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | State dicts PyTorch (`torch.load(..., weights_only=True)`), float32 (`.pt`) |

## Arquitectura y entrenamiento

La red conjunta (`creole_bid_rl2_s4500.pt`, 28,1M parámetros, 112 MB) es un transformer causal de 8 capas, anchura 512 y 8 cabezas que procesa la secuencia de eventos del tablero (primero las voces de la subasta, luego las cartas jugadas). En cada paso se añaden embeddings aprendidos del sistema de nuestra parte y del de los oponentes. La cabeza de subasta produce 38 posibles voces; la cabeza de cartas es un encoder de atención de 2 capas sobre las 52 cartas. La red de creencias (`creole_belief_m2_s61962.pt`, 52,4M parámetros, 209 MB) es un MLP con compuertas de 8 bloques SwiGLU y anchura 1024 que lee la vista del asiento (mano, dummy, cartas jugadas, subasta), ambos sistemas y un token de estilo de juego de cartas, y produce el propietario de cada carta no vista.

El entrenamiento se organizó en cuatro etapas: (1) un sistema con self-play, con supervisión sobre 6,4M de manos subastadas y jugadas por Pidgin V3.1 y 82k pasos de RL de liga con self-play sobre IMPs duplicados con una correa KL; (2) 33 sistemas supervisados (37k pasos), combinando self-play de Pidgin (voces VieNNa destiladas de la etapa 1, voces SAYC y 2/1 de las redes de BEN), datos de BEN, 18M de subastas de subastadores anteriores (cartas EPBot, BRL, redes de investigación de Pidgin) y 7,4M de subastas que EPBot subastó con diez tarjetas de convención adicionales; (3) 33 sistemas con RL de liga (4.500 pasos), self-play y liga PFSP sobre todos los sistemas con correa KL hacia la etapa 2 (estrecha en voces tempranas, laxa en lo profundo de la subasta); (4) red de creencias: la de Pidgin V4 (incluyendo 1,15M de manos WBridge5), afinada con datos de BEN, ampliada a 33 sistemas y reentrenada sobre unos 30M de manos (61.962 pasos). Todas las manos provienen del dataset público Pgx DDS.

En el juego de cartas, los layouts se muestrean de la red de creencias (ponderados por importancia, remuestreados a 64), se resuelven double dummy hasta 0,6 s por carta; gana la mejor media de bazas, y la cabeza de cartas de la red conjunta desempata dentro de 0,05 bazas. La subasta es codiciosa: sin búsqueda durante la puja.

## Capacidades

- Subasta de bridge de contrato con 33 sistemas distintos, recibiendo el sistema de cada lado como parámetro (`ourSystem` / `theirSystem`).
- Sistemas soportados: 2/1 GF (GIB/BBO, BEN 2/1 y ocho tarjetas EPBot 2/1), SAYC (ocho variantes), Acol, Polish Club (WJ), Precision, UCBC, WBridge5 y VieNNa (el sistema propio de Pidgin); los sistemas `ep_*` son tarjetas de convención EPBot.
- Juego de cartas completo: salida (`/lead`) y juego (`/play`) mediante PIMC con red de creencias y resolución double dummy.
- Estimación de creencias sobre la titularidad de cartas no vistas (red de creencias dedicada).
- Desempate fino en el juego de cartas mediante la cabeza de cartas de la red conjunta.
- Servidor compatible con la Brill's Seat Robot API (compatible con BEN): endpoints `/apis/brill/bid`, `/lead`, `/play`.
- Inferencia solo CPU, sin requisito de GPU.
- No soporta tool calling, agentes, visión, audio, thinking mode ni capacidades multilingües: es un modelo de dominio específico para bridge.

## Casos de uso

- Bot de bridge en línea: desplegar el servidor Docker (`docker run -p 8080:8080 ghcr.io/hsperr/creole`) y conectarlo a plataformas que hablen la Brill Seat Robot API para jugar como agente automático en mesas de práctica.
- Análisis de sistemas de subasta: usar el parámetro `ourSystem`/`theirSystem` para comparar cómo Creole subasta una misma mano bajo 2/1, SAYC, Acol, Precision o Polish Club, útil para estudio y docencia de sistemas.
- Entrenamiento de jugadores humanos: generar propuestas de subasta y juego con un bot que respeta el sistema elegido, permitiendo practicar convenciones específicas sin cambiar de compañero artificial.
- Investigación en información imperfecta: servir como baseline reproducible para experimentos de RL y PIMC en bridge, con pesos públicos y arquitectura documentada.
- Evaluación comparativa de bots: emplear los endpoints de subasta y juego para enfrentar Creole contra Lia, Brill, BEN o Pidgin V4 en torneos automatizados de IMPs duplicados.
- Integración en pipelines de análisis double dummy: combinar la red de creencias con resolvedores DDS para estudiar decisiones de juego bajo incertidumbre.
- Prototipos de bajo coste: al requerir solo CPU, ~0,8 GB de memoria y ~15 ms por llamada de subasta, permite desplegar varios agentes en un único servidor modesto.

## Benchmarks y rendimiento

Evaluación en IMPs duplicados por tablero, con intervalo de confianza del ±95%. Creole subasta el sistema indicado; el oponente subasta el suyo. Se compara con Pidgin V4 en los mismos tableros.

| Oponente | Sistema de Creole | Tableros | Creole | Pidgin V4 |
|---|---|---|---|---|
| Lia | 2/1 | 200 | −0,01 ± 0,88 | +1,12 ± 0,89 |
| Lia | VieNNa | 194 | +0,85 ± 0,99 | no disponible |
| Brill | GIB / BBO | 100 | +0,78 ± 1,26 | +1,23 |
| BEN | GIB / BBO | 100 | +0,32 ± 1,07 | +1,24 |
| Pidgin V4 | VieNNa | 400 | +0,34 ± 0,59 | no disponible |

Rendimiento de inferencia declarado por el autor: ~15 ms por llamada de subasta y ~0,2 s por carta en un solo hilo, solo CPU, ~0,8 GB de memoria.

## Requisitos de hardware

- Inferencia solo CPU; no requiere GPU.
- Memoria: ~0,8 GB en ejecución.
- Latencia: ~15 ms por llamada de subasta y ~0,2 s por carta en un solo hilo.
- El juego de cartas resuelve double dummy hasta 0,6 s por carta, lo que domina el coste en esa fase.
- Despliegue recomendado: imagen Docker oficial (`ghcr.io/hsperr/creole`) exponiendo el puerto 8080.
- Cabe en cualquier máquina consumer; no se han documentado requisitos de VRAM ni soporte para vLLM, llama.cpp, Ollama o TGI (no aplica, al no ser un modelo de lenguaje).
- No se dispone de datos de throughput agregado multi-hilo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Sistemas de subasta | Contexto / enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Creole | 80,5M (28,1M + 52,4M) | 33 | Transformer + belief net + PIMC | Apache-2.0 | Pesos en HF, Docker, código en GitHub |
| Pidgin (V3.1/V4) | no disponible | 1 (VieNNa) | Misma familia, un solo sistema | no disponible | Pesos en HF (`hsperr/pidgin`) |
| Lia | no disponible | propio | Bot de referencia en la evaluación | no disponible | no disponible |
| BEN | no disponible | propio (GIB/BBO) | Bot de referencia; nets y datos públicos | no disponible | no disponible |

Creole sacrifica fuerza máxima en un único sistema (Pidgin V4 obtuvo mejores resultados frente a Lia, Brill y BEN) a cambio de cobertura de 33 sistemas. Frente a Lia con 2/1, Creole queda prácticamente neutro (−0,01), mientras Pidgin V4 rendía +1,12. No se dispone de parámetros ni licencias de Lia, BEN o Pidgin en la información proporcionada.

## Limitaciones y advertencias

- Todos los intervalos de confianza de la evaluación incluyen cero y las muestras son pequeñas (100–400 tableros), por lo que las diferencias observadas no son estadísticamente concluyentes.
- Frente a Lia, Brill y BEN, Pidgin V4 obtuvo puntuaciones superiores; Creole cambia fuerza punta en un sistema por amplitud de cobertura.
- Más débil que Lia, Brill y BEN en puzzles de juego como declarante.
- Sin búsqueda durante la subasta; las voces no llevan explicaciones (`explanation` vacío).
- Nueve sistemas de investigación del registro (`brl_fsp`, `D75`, `E46`, etc.) funcionan pero no están ajustados.
- La fidelidad de un sistema con tarjeta EPBot depende de cuán fielmente EPBot lo subaste.
- No se liberan los datos de entrenamiento ni los trainers; reproducir Creole exige regenerar decenas de millones de subastas y repetir las etapas.
- Los pesos se entrenaron sobre salidas de otros programas; no se incluye su código ni datos.
- Modelo de dominio específico: no tiene capacidades de lenguaje natural, visión, audio ni tool calling.
- Riesgo de sesgos derivado de los datos de entrenamiento (comportamiento de Pidgin, BEN, EPBot, WBridge5 y BRL) y de las tarjetas de convención utilizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hsperr/creole
- Modelo predecesor Pidgin: https://huggingface.co/hsperr/pidgin
- Código, servidor y Docker: https://github.com/hsperr/creole
- Detalles de entrenamiento y resultados negativos: https://github.com/hsperr/creole/blob/main/TRAINING.md
- Imagen Docker: ghcr.io/hsperr/creole
- Brill's Seat Robot API: https://brill.aalborgdata.dk/seat-api.html
- Dataset Pgx DDS: https://huggingface.co/datasets/sotetsuk/dds_dataset
