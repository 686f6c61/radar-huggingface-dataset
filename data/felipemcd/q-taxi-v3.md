# felipemcd/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado por el usuario de Hugging Face felipemcd para resolver el entorno Taxi-v3 de Gymnasium (antes OpenAI Gym). No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de una tabla Q (Q-table) entrenada mediante el algoritmo Q-learning, una técnica clásica de aprendizaje por refuerzo basada en valores. El agente aprende una política óptima para el problema del taxista: recoger a un pasajero en una de cuatro ubicaciones de una rejilla 5x5 y dejarlo en su destino correcto.

El modelo resuelve un problema de referencia académico muy utilizado para validar implementaciones de Q-learning tabular. Su relevancia es principalmente educativa y de verificación: sirve como punto de partida para quien aprende aprendizaje por refuerzo, para comparar implementaciones propias o como material de demostración en cursos. Al ser una tabla de valores discretos, su tamaño es mínimo (el repo indica 0.0 GB) y su inferencia es prácticamente instantánea en cualquier CPU.

El repositorio incluye el archivo `q-learning.pkl` con la Q-table serializada y una implementación personalizada (tag `custom-implementation`), sin depender de librerías de RL de terceros para el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla de valores Q, sin red neuronal) |
| Parametros totales | no disponible (equivalente a una Q-table de 500 estados x 6 acciones para Taxi-v3) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pickle (`.pkl`, archivo `q-learning.pkl`) |

## Arquitectura y entrenamiento

El modelo emplea Q-learning tabular, un algoritmo de aprendizaje por refuerzo sin modelo (model-free) y off-policy. En lugar de una red neuronal, el agente almacena una entrada por cada par estado-acción del entorno. Taxi-v3 tiene 500 estados discretos (25 posiciones de la rejilla x 5 posiciones del pasajero x 4 destinos) y 6 acciones (4 movimientos, recogida y dejada del pasajero), lo que da una Q-table de 3.000 valores. Durante el entrenamiento, el agente actualiza los valores Q mediante la ecuación de Bellman con una tasa de aprendizaje y un factor de descuento, típicamente combinados con una política de exploración epsilon-greedy.

No se ha publicado información sobre el número de episodios de entrenamiento, hiperparámetros concretos (learning rate, gamma, epsilon), ni recompensas de diseño utilizadas. La model card indica el uso de una implementación personalizada del algoritmo y la carga del modelo mediante la utilidad `load_from_hub`, patrón habitual de los ejemplos de aprendizaje por refuerzo del curso de Deep RL de Hugging Face.

## Capacidades

- Resolucion del entorno Taxi-v3: el agente decide en cada paso el movimiento, la recogida o la dejada del pasajero para maximizar la recompensa acumulada.
- Politica optima o casi optima aprendida: la recompensa media declarada (7,52 +/- 2,71) es cercana al maximo teorico del entorno (~8,4), lo que indica una politica de alta calidad.
- Inferencia determinista y de coste nulo: la seleccion de acciones es una consulta a una tabla, sin GPU ni tiempo de computo apreciable.
- Compatibilidad con Gymnasium: se integra directamente con `gym.make(model["env_id"])` tras cargar el pickle.
- No tiene capacidades de lenguaje, vision, codigo ni tool calling: es un agente de RL clasico para un entorno discreto.

## Casos de uso

- Ensenanza de aprendizaje por refuerzo: sirve como ejemplo completo y funcional de Q-learning tabular para cursos y tutoriales, permitiendo inspeccionar la Q-table y visualizar como se propaga el valor entre estados.
- Verificacion de implementaciones propias: al ser Taxi-v3 un entorno de referencia con solucion conocida, permite comparar la recompensa media de una implementacion propia contra este agente entrenado.
- Punto de partida para experimentos: se puede partir de esta Q-table para estudiar variaciones del algoritmo (SARSA, expected SARSA, epsilon decay) y comparar convergencia.
- Demos interactivas: el tamaño minimo del modelo permite integrarlo en notebooks, aplicaciones Streamlit o demos web que muestren al taxista resolviendo el entorno en tiempo real.
- Pruebas de infraestructura de despliegue de RL: util para validar pipelines de carga de modelos desde el Hugging Face Hub (load_from_hub) sin necesidad de recursos de computo.
- Benchmark educativo de reproducibilidad: al ser determinista y ligero, facilita comprobar que un entorno Gymnasium y su space de acciones estan correctamente configurados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Valor | Entorno | Verificado |
|---|---|---|---|
| mean_reward | 7,52 +/- 2,71 | Taxi-v3 | No |

Como referencia contextual, la recompensa maxima teorica de Taxi-v3 es de aproximadamente 8,4 por episodio, por lo que el resultado declarado indica una politica cercana a la optima. No hay comparativas con otros agentes publicadas en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU ni VRAM; la Q-table completa ocupa unos pocos kilobytes de memoria.
- CPU: cualquier procesador moderno es mas que suficiente; la inferencia es una consulta de tabla.
- Consumer GPU: no aplica, no es necesario hardware dedicado.
- Despliegue: carga mediante Python con `pickle` y Gymnasium; el patron habitual es usar la utilidad `load_from_hub` del ecosistema de Hugging Face (libreria `huggingface_hub` junto con la implementacion personalizada del autor). No requiere vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia: practicamente cero (microsegundos por decision de accion).
- Throughput: limitado unicamente por la velocidad de simulacion del entorno Gymnasium, que alcanza miles de pasos por segundo en una CPU convencional.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | mean_reward | Licencia |
|---|---|---|---|---|
| felipemcd/q-Taxi-v3 | Q-learning tabular | Taxi-v3 | 7,52 +/- 2,71 (no verificado) | no disponible |
| Otros agentes q-Taxi-v3 en el Hub | Q-learning tabular | Taxi-v3 | no disponible | variable |

En el Hugging Face Hub existen numerosos agentes Q-learning para Taxi-v3, muchos derivados del curso de Deep RL de Hugging Face, con recompensas medias tipicas entre 7,4 y 8,4. No se dispone de datos concretos de modelos comparables especificos en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito extremadamente limitado: el agente solo funciona en el entorno Taxi-v3; no generaliza a otros entornos ni tareas.
- Resultado no verificado: la metrica mean_reward (7,52 +/- 2,71) esta declarada por el autor y no ha sido verificada por Hugging Face; la variabilidad indica que ocasionalmente el episodio no sigue la ruta optima.
- Sin licencia declarada: la ausencia de licencia en el repositorio impide confirmar los terminos de uso; para cualquier reutilizacion conviene contactar al autor.
- Riesgo de serializacion: el modelo se distribuye como pickle (`.pkl`), formato que puede ejecutar codigo arbitrario al deserializar; cargalo solo de fuentes confiables y en un entorno controlado.
- Sin documentacion de entrenamiento: no se publican hiperparametros, numero de episodios ni semillas, lo que dificulta reproducir el entrenamiento.
- Trazas de alucinacion o sesgo: no aplican, al no ser un modelo generativo ni de lenguaje.
- Descargas y likes en cero en el momento de redactar la ficha: no existe comunidad de revision ni retroalimentacion de terceros sobre el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/felipemcd/q-Taxi-v3
- Documentacion del entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- No se han encontrado enlaces a papers, blogs, repositorios de codigo de entrenamiento ni demos en la informacion disponible.
