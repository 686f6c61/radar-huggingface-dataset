# Nabidnur/RoboRACE-Net-M

## Resumen

RACE-Net-M es un modelo neuronal de fusión de mapas para enjambres de robots, desarrollado por el autor independiente Nabidnur y publicado bajo el paraguas del proyecto RoboRACE. Resuelve un problema muy concreto: un robot receptor debe decidir qué celdas de un mapa son muros cuando algunos de sus pares transmiten información corrupta (invertida, inventada, aleatoria, tardía o colusoria). El modelo devuelve el log-odds de que cada celda reportada sea un muro, apoyándose únicamente en la suposición de que el sensor propio del receptor es fiable.

Se trata de un modelo muy pequeño, de solo 44.837 parámetros, implementado en PyTorch y distribuido en safetensors. No es un modelo de lenguaje ni un transformer generativo: es un componente especializado de inferencia de verdad (truth inference) para robótica multiagente, con una arquitectura de set transformer sobre pares y una pasada de refinamiento de tres rondas. Su relevancia radica en que aborda la robustez bizantina en la fusión de mapas con un coste computacional mínimo (unos 2 ms por llamada en un núcleo de CPU) y sin necesidad de conocer a priori el número de mentirosos.

El modelo se acompaña de un benchmark propio, RoboRACE-Bench (Track D), con 20 mapas de laberinto y 25 condiciones de ataque, y de una implementación de referencia de las líneas base clásicas (W-MSR, EigenTrust, reputación beta, Dawid-Skene). Está pensado para investigadores que trabajen en exploración cooperativa, SLAM multi-robot y tolerancia a fallos bizantinos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Set transformer sobre pares con read-out con signo y refinamiento iterativo (3 rondas) |
| Parametros totales | 44.837 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre conjuntos de pares y celdas de tamaño arbitrario) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | roborace-mixed (license: other) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura parte de un esquema de conteos anclados: las afirmaciones de cada par se comparan con las celdas que el propio receptor ha observado, separando afirmaciones recientes de antiguas. Esos conteos alimentan un pequeño transformer sobre el eje de pares, que produce una embedding de canal por par. A continuación, un read-out con signo asigna un valor de evidencia con signo a cada tipo de afirmación: un par fiable se acepta, un mentiroso consistente se invierte y se aprovecha, y un par aleatorio se ignora. Finalmente, tres rondas de refinamiento comparan cada par con la creencia del resto de pares en celdas que el receptor no ha observado (leave-one-out), lo que permite verificar a un par sin solapamiento directo a través de un par ya fiable. Pares y celdas se tratan como conjuntos, sin posiciones, de modo que el modelo admite cualquier tamaño de mapa y de enjambre.

El entrenamiento utilizó 45.361 instantáneas procedentes de enjambres simulados en laberintos (semillas 5000–7399), en los que los mentirosos siguen canales de dos monedas aleatorios con un punto de cambio opcional (`racenet_m.sample_channels`). Los nombres de ataque del benchmark nunca aparecen en el entrenamiento, y el ataque de anillo colusorio queda fuera de esa familia. Se realizaron 4.000 pasos de AdamW en CPU, unos 8 minutos incluyendo la simulación. Los laberintos de benchmark (semillas 1000–1019) y de ajuste (semillas 0–39) son disjuntos de los de entrenamiento y validación.

## Capacidades

- Fusión de mapas multi-robot con estimación de log-odds de muro por celda reportada.
- Tolerancia a fallos bizantinos: inversión de observaciones, invención de muros o aperturas, respuestas aleatorias, mentirosos que cambian a mitad de episodio y colusión.
- Inferencia de fiabilidad por par con inversión de mentirosos consistentes en lugar de mero descarte.
- Refinamiento leave-one-out en tres rondas para verificar pares sin solapamiento directo.
- Independencia del tamaño de mapa y del tamaño del enjambre (tratamiento como conjuntos).
- Ejecución en CPU con latencia de aproximadamente 2 ms por llamada y dependencias mínimas (`torch`, `numpy`, `safetensors`).
- No soporta tool calling, agentes conversacionales, visión, audio ni capacidades multilingües; su ámbito es exclusivamente la fusión de mapas en robótica.

## Casos de uso

- Exploración cooperativa de interiores: un equipo de robots de servicio comparte mapas de ocupación en tiempo real y RACE-Net-M filtra los reportes de unidades con sensores degradados o comprometidos antes de planificar rutas.
- SLAM multi-robot en almacenes: integración del modelo como capa de fusión entre los mapas locales de cada AGV y el mapa global, con coste despreciable frente al pipeline de percepción.
- Enjambres de drones en inspección de infraestructuras: fusión de mapas de obstáculos cuando parte de la flota transmite posiciones erróneas por interferencias o fallos de calibración.
- Investigación en tolerancia bizantina: uso como línea base neuronal frente a W-MSR, EigenTrust o Dawid-Skene en experimentos reproducibles sobre RoboRACE-Bench Track D.
- Robótica de rescate: consolidación del mapa de un equipo heterogéneo donde algunos nodos pueden quedar desactualizados o enviar datos corruptos tras una pérdida de comunicación.
- Sistemas de flotas con nodos no confiables: despliegue como módulo de consenso ligero en el edge, ya que cabe en cualquier CPU y no requiere GPU.
- Docencia y prototipado: implementación de referencia compacta para estudiar fusión de creencias, canales de dos monedas y reparación de alcanzabilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en RoboRACE-Bench Track D (seis robots, 20 laberintos × 25 condiciones = 500 celdas; métrica SPL ×100 de los robots honestos):

| Puesto | Regla de fusión | SPL medio | Sin mentirosos | Mentirosos < 50% | Mentirosos ≥ 50% | Objetivo alcanzado % |
|---:|---|---:|---:|---:|---:|---:|
| 1 | RACE-Net-M + reparación de alcanzabilidad | 70,2 | 76,8 | 73,1 | 66,8 | 97,8 |
| 2 | RACE-Net-M | 69,8 | 76,8 | 72,6 | 66,4 | 97,4 |
| 3 | race_map (regla bayesiana manual) | 66,2 | 76,8 | 69,7 | 61,8 | 94,2 |
| 4 | W-MSR-style trimming (LeBlanc et al. 2013) | 64,1 | 76,8 | 65,6 | 61,5 | 96,5 |
| 5 | Reputación beta (Jøsang & Ismail 2002) | 63,8 | 76,8 | 67,9 | 58,5 | 91,9 |
| 6 | EigenTrust (Kamvar et al. 2003) | 63,0 | 75,0 | 66,8 | 58,2 | 91,8 |
| 7 | Dawid–Skene (1979), sin anclaje | 62,0 | 76,3 | 67,4 | 55,5 | 90,1 |
| 8 | Sin comunicación | 61,6 | 61,5 | 62,0 | 61,2 | 95,2 |
| 9 | Fusión de mapas ingenua | 56,7 | 76,8 | 59,9 | 51,7 | 83,8 |
| 10 | Mayoría por celda | 55,7 | 76,8 | 61,5 | 48,1 | 82,1 |
| – | Oráculo que conoce a los mentirosos (referencia) | 71,3 | 76,8 | 74,5 | 67,5 | 98,2 |

Calidad de creencia en laberintos reservados (precisión en celdas reportadas por un par y no observadas por el receptor):

| Modelo | Global | 3 de 5 pares mienten | 5 de 5 pares mienten |
|---|---:|---:|---:|
| race_map (regla bayesiana manual) | 90,1 | 82,7 | 72,9 |
| rounds = 1 (sin refinamiento) | 91,8 | 85,7 | 76,1 |
| rounds = 2 | 92,2 | 86,4 | 77,4 |
| rounds = 3 (publicado) | 92,3 | 86,7 | 77,6 |
| rounds = 3, segunda semilla | 92,3 | 86,7 | 77,6 |

## Requisitos de hardware

- Inferencia en CPU: aproximadamente 2 ms por llamada en un solo núcleo; no requiere GPU.
- VRAM estimada: prácticamente nula; con 44.837 parámetros en safetensors el peso del modelo es de decenas de kilobytes.
- GPU recomendadas: ninguna imprescindible; puede ejecutarse en cualquier GPU compatible con PyTorch si se desea batching.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos con PyTorch.
- Opciones de despliegue: importación directa del módulo `racenet_m.py` desde el repositorio de Hugging Face; dependencias `torch`, `numpy` y `safetensors`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput y latencia: alrededor de 2 ms por llamada en CPU según el autor; no se publican cifras de throughput en lote.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | SPL medio (Track D) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| RACE-Net-M | Set transformer neuronal | 44.837 | Conjuntos arbitrarios | 69,8 (70,2 con reparación) | roborace-mixed | Hugging Face |
| race_map | Regla bayesiana manual | 0 | No aplica | 66,2 | roborace-mixed | Incluido en el repo |
| W-MSR-style trimming | Regla robusta clásica | 0 | No aplica | 64,1 | no disponible | Implementación en el repo |
| EigenTrust | Reputación clásica | 0 | No aplica | 63,0 | no disponible | Implementación en el repo |
| Dawid–Skene | Inferencia de verdad clásica | 0 | No aplica | 62,0 | no disponible | Implementación en el repo |

## Limitaciones y advertencias

- Colusión localizada en pocas celdas: un bloque honesto en todo el mapa salvo cerca del objetivo parece fiable hasta que un robot llega allí; la reparación de alcanzabilidad recupera parte de la pérdida, pero el oráculo sigue siendo superior.
- Evaluación en un único simulador: laberintos de rejilla, sensado exacto de 8 vecinos y seis robots; no se ha probado en robots reales ni con sensores ruidosos.
- Se asume independencia condicional de las afirmaciones dado el valor verdadero; el modelo no modela la posición del par en el momento de la afirmación.
- El ataque de anillo colusorio queda fuera de la familia de canales de entrenamiento, por lo que su robustez frente a él es incierta.
- Licencia `roborace-mixed`: es necesario revisar el archivo LICENSES.md del dataset RoboRACE-Bench antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados declarados.
- No es un modelo de lenguaje: no debe esperarse generación de texto, razonamiento simbólico ni capacidades conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nabidnur/RoboRACE-Net-M
- Modelo hermano para enjambres de cámaras (RACE-Net-V): https://huggingface.co/Nabidnur/RoboRACE-Net
- Dataset y benchmark RoboRACE-Bench: https://huggingface.co/datasets/Nabidnur/RoboRACE-Bench
- Licencias del proyecto: https://huggingface.co/datasets/Nabidnur/RoboRACE-Bench/blob/main/LICENSES.md
- Space de demostración: https://huggingface.co/spaces/Nabidnur/RoboRACE
- Código fuente: https://github.com/Hisernberg/robotics
