# Nam2452110/hm3dnav

## Resumen

HM3DNav es un entorno de simulación de Gymnasium para navegación en interiores en 2D, construido a partir de planos reales de edificios del dataset HM3D (Habitat). Lo desarrolla el usuario Nam2452110. No se trata de un modelo de inteligencia artificial generativo, sino de un banco de pruebas para agentes de aprendizaje por refuerzo. Resuelve el problema de evaluar agentes en entornos con recompensas escasas, donde la señal para alcanzar el objetivo es prácticamente inexistente.

El entorno incluye 364 planos de suelo y 6178 tareas, con etiquetas de dificultad calculadas mediante cadenas de Markov absorbentes. Su relevancia actual radica en el estudio del fenómeno de «signal starvation» en RL: según la model card, el 70,7 % de las tareas de HM3D son «starved», frente a un 0,8 % en benchmarks estándar. La arquitectura del entorno se basa en observaciones de 22 rayos LiDAR, acciones discretas y una recompensa sparse. No dispone de un modelo neuronal preentrenado ni de una longitud de contexto, por lo que estas especificaciones no aplican.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Entorno de simulación Gymnasium (no es un modelo neuronal) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

HM3DNav no es un modelo entrenado, sino un entorno de Gymnasium para simular navegación en interiores. La clase principal es `hm3dnav.env.HM3DNavEnv`, que expone un espacio de acciones discreto con cuatro movimientos (UP, DOWN, LEFT, RIGHT) y un espacio de observaciones compuesto por 22 distancias LiDAR a las paredes. La recompensa es sparse: el agente recibe +1 al alcanzar el objetivo y tiene un presupuesto de 200 pasos por episodio. Además, el método `reset()` devuelve métricas adicionales como `p0`, `sa_uniform`, `sa_persist`, `starved` y `level`.

El entorno se construye a partir de 364 planos de suelo almacenados en formato `.npz` (0 = libre, 1 = pared) y de 6178 archivos de tareas (17 tareas por planta). Los datos de entrenamiento no proceden de un corpus de texto, sino de los planos del dataset HM3D. La innovación técnica destacable es el cálculo de etiquetas de dificultad mediante cadenas de Markov absorbentes: la accesibilidad de señal (`sa_uniform`) se computa de forma exacta y permite clasificar cada tarea en niveles easy, medium, hard o starved.

## Capacidades

- Simular navegación en interiores 2D con mapas reales del dataset HM3D.
- Proporcionar observaciones de 22 rayos LiDAR al agente para percibir la distancia a las paredes.
- Soportar acciones discretas de movimiento en cuatro direcciones.
- Ofrecer recompensa sparse (+1 al alcanzar el objetivo) con un presupuesto de 200 pasos.
- Calcular métricas de accesibilidad de señal mediante cadenas de Markov absorbentes (`sa_uniform`, `sa_persist`).
- Etiquetar cada tarea con un nivel de dificultad (`easy`, `medium`, `hard`, `starved`).
- Incluir 6178 tareas distribuidas en 364 mapas, lo que permite evaluaciones a gran escala.
- No soporta generación de texto, tool calling ni razonamiento multi-paso en el sentido de un modelo de lenguaje.

## Casos de uso

- Evaluación de algoritmos de aprendizaje por refuerzo para navegación en interiores: el entorno permite medir el rendimiento de políticas de RL en mapas 2D con recompensas sparse. Su API de Gymnasium facilita la integración con librerías estándar como Stable-Baselines3 o Ray RLlib.
- Estudio del fenómeno de «signal starvation» en RL: las etiquetas de dificultad basadas en `sa_uniform` permiten identificar tareas donde una política aleatoria no alcanza el objetivo en menos de 1 de cada 1000 episodios. Esto resulta útil para investigar métodos que mitiguen la falta de señal.
- Benchmark de agentes con recompensas sparse: los 6178 archivos de tareas ofrecen una batería amplia y variada para comparar agentes de refuerzo en condiciones de señal escasa, superando la limitación de benchmarks tradicionales con recompensas densas.
- Investigación en políticas de exploración: el entorno proporciona un escenario controlado donde la exploración eficiente es crítica. Los niveles de dificultad permiten diseñar experimentos ablativo para técnicas como curiosidad intrínseca, count-based exploration o redes de exploración.
- Simulación de robots móviles en planos 2D: aunque el entorno es simplificado, puede utilizarse como un proxy para probar algoritmos de navegación y planificación de rutas antes de transferirlos a simuladores 3D completos como Habitat o Matterport3D.
- Comparación de currículos de entrenamiento (curriculum learning): los niveles de dificultad etiquetados (easy, medium, hard, starved) permiten construir currículos automáticos que ordenan las tareas de menor a mayor dificultad, facilitando el entrenamiento progresivo de agentes de RL.
- Análisis de la dificultad de tareas de navegación mediante cadenas de Markov: los scripts incluidos regeneran las etiquetas de dificultad a partir de medidas de sondas, lo que permite auditar y reproducir los resultados del estudio Phase A.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la información disponible. La model card incluye una distribución de tareas por nivel de dificultad, que se presenta a continuación como referencia del estudio Phase A:

| Nivel | Rango de sa_uniform | Tareas | Fracción |
|---|---|---|---|
| easy | >= 0,1 | 16 | 0,3 % |
| medium | [1e-3, 0,1) | 1272 | 20,6 % |
| hard | [1e-4, 1e-3) | 521 | 8,4 % |
| starved | < 1e-4 | 4369 | 70,7 % |

Estos datos indican que el 70,7 % de las tareas de HM3D son «starved», es decir, que una política de caminata aleatoria uniforme espera alcanzar el objetivo menos de una vez cada 1000 episodios. No se dispone de cifras de rendimiento de agentes entrenados en este entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. El entorno no requiere una GPU para ejecutarse, ya que no es un modelo neuronal.
- GPU recomendadas: no requiere GPU. Puede ejecutarse íntegramente en CPU.
- Si cabe en consumer GPU: no aplica.
- Opciones de despliegue: instalación local mediante `pip install -e .`; no está preparado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El entorno depende de la CPU y de la complejidad del mapa, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. Al tratarse de un entorno de simulación específico, no se dispone de modelos comparables en la información proporcionada. No existen otros entornos de Gymnasium con las mismas características (mapas HM3D, etiquetas de señal y cálculo mediante cadenas de Markov) que puedan compararse directamente en cuanto a parámetros, contexto o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no tiene capacidades de generación de texto, razonamiento simbólico ni soporte para tool calling.
- La licencia no está especificada en la información proporcionada. Es necesario verificar la licencia antes de cualquier uso comercial.
- El entorno es 2D y simplificado, por lo que no reproduce la complejidad de los entornos 3D reales ni las dinámicas físicas de robots.
- Las etiquetas de dificultad se basan en una política de caminata aleatoria uniforme (`sa_uniform`), que puede no reflejar el rendimiento de políticas aprendidas más sofisticadas.
- El repositorio en HuggingFace tiene un tamaño de 0.0 GB, lo que sugiere que los archivos pueden no estar completos o no haberse subido correctamente.
- No hay benchmarks publicados de rendimiento de agentes entrenados en este entorno en la información disponible.
- El idioma de los identificadores y comentarios es inglés, sin localización a español.

## Enlaces

- HuggingFace: https://huggingface.co/Nam2452110/hm3dnav
- Model card del autor: disponible en la misma página de HuggingFace.
- La búsqueda web no arrojó resultados adicionales relevantes (únicamente páginas no relacionadas como Google Docs o generadores de modelos 3D).
