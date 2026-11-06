# amilliontries/race-pit-wall-ep15

## Resumen

`race-pit-wall-ep15` es una política de aprendizaje por refuerzo de tamaño mínimo (1.064 parámetros) entrenada para tomar decisiones de estrategia de carrera en un simulador de Fórmula 1: decidir cuándo entrar a boxes y qué neumático montar. Lo desarrolla el canal de YouTube **A Million Tries** como parte del episodio 15 de su serie, en la que un segundo modelo "pequeño" actúa como muro de boxes (pit wall) de cada coche mientras un conductor simulado pilota. No es un modelo de lenguaje: es una red neuronal que se evalúa como agente de control dentro de un entorno de simulación de carreras.

La relevancia técnica no está en su escala, sino en el método: se evolucionó mediante *evolution strategies* con pares espejados sobre la posición final de carrera, partiendo de una copia de una regla heurística humana (entrar a boxes cuando el peor neumático supera el 60 % de desgaste y montar duros). El modelo aprendió una estrategia propia a partir de la generación 17: **arrancar con neumáticos duros y hacer menos paradas**.

Es un artefacto de investigación reproducible y didáctico, no un componente listo para producción. Su interés radica en la comparación controlada entre una regla experta, una copia de esa regla convertida en red y la versión entrenada, con métricas explícitas de posiciones medias y porcentaje de carreras terminadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP con activación tanh más una ruta lineal directa (`lin`): 25 → 32 (tanh) → 4 |
| Parámetros totales | 1.064 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 25 números por decisión |
| Tipos de cuantización | no disponible (pesos en safetensors, librería JAX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (JAX) |

## Arquitectura y entrenamiento

La política es una red feedforward diminuta: recibe 25 escalares de observación y produce 4 salidas (decisión de parar o no y elección de compuesto). Incluye una ruta lineal paralela (`lin`) que suma a la salida de la capa oculta con tanh, lo que en la práctica permite una componente casi lineal sobre las observaciones además de la no linealidad. Las entradas cubren el estado de la carrera: vueltas restantes, compuesto y cuatro desgastes del neumático, el peor desgaste, vueltas montadas, combustible, paradas realizadas, daños, posición, huecos con el coche de delante y el de detrás (con sus neumáticos y paradas), longitud del circuito y un indicador de si la decisión es la de la parrilla.

El entrenamiento usó *evolution strategies* con pares espejados, optimizando la posición final de carrera. El escenario de evaluación: 4 coches controlados por el modelo contra 4 controlados por la regla heurística, con diseños de coche aleatorios, circuitos aleatorios y posiciones de parrilla barajadas. La evaluación final se hizo sobre 128 carreras en 64 circuitos de test. La decisión se toma una vez por vuelta, 600 m antes de la entrada a boxes, y una vez en la parrilla para el neumático de salida. El autor documenta que diez horas adicionales de entrenamiento (de `strat-1` a `strat-2`) no aportaron mejora clara, lo que sugiere convergencia o saturación del bucle de evolución con este presupuesto.

## Capacidades

- Decisión binaria de parada: entrar a boxes esta vuelta o permanecer en pista.
- Selección de compuesto de neumático entre las opciones del simulador.
- Elección del neumático de salida en la parrilla.
- Razonamiento implícito sobre desgaste, combustible, daños y huecos con rivales a partir de 25 observaciones.
- Generalización a circuitos no vistos durante el entrenamiento (evaluación en 64 circuitos de test).
- No soporta tool calling, ni agentes multi-paso, ni capacidades multilingües, ni visión, ni audio: es una política de control cerrada a un entorno concreto.

## Casos de uso

- **Investigación en optimización de estrategias de carrera**: usar el modelo como referencia reproducible para comparar *evolution strategies* frente a reglas heurísticas o RL con gradiente de política en un simulador de carreras.
- **Baseline en competiciones de simulación**: servir como oponente o punto de partida en ligas de agentes de estrategia, dado su bajo coste computacional (1.064 parámetros) y su licencia MIT.
- **Docencia sobre evaluación de agentes**: el diseño experimental del autor (control con copia de la regla, métricas de posición media y porcentaje de finalización) es un ejemplo práctico de cómo aislar el efecto del aprendizaje del efecto del diseño del entorno.
- **Prototipado de muros de boxes automáticos**: integrar la política en un simulador propio que exponga las mismas 25 observaciones para probar políticas de parada antes de escalar a modelos mayores.
- **Estudio de generalización fuera de distribución**: evaluar cómo se degrada la política con circuitos, compuestos o reglas de desgaste distintas a las del entrenamiento.
- **Análisis de políticas evolucionadas**: inspeccionar los pesos para entender la estrategia "arrancar en duros y parar menos" y contrastarla con la regla original del 60 % de desgaste.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (128 carreras en 64 circuitos de test, 8 coches por carrera, posición media 4,5 como punto medio):

| Equipo | Posición media | Carreras terminadas | Paradas por coche |
|---|---|---|---|
| Este pit wall (generación 43) | P4,08 ± 0,07 | 64 % | 1,17 |
| La regla contra la que compitió | P4,92 | 57 % | 1,46 |
| Control: copia de la regla como esta IA (generación 0) | P4,24 | no disponible | no disponible |

El propio autor advierte que la fila de control es clave: la copia de la regla ya gana aproximadamente media posición por el momento de la decisión (600 m antes de la entrada a boxes frente a la regla, que decide a menudo justo después). La mejora atribuible al aprendizaje sobre el control es de unas 0,16 posiciones.

## Requisitos de hardware

- Inferencia en CPU: con 1.064 parámetros, la política cabe en cualquier CPU moderna y se ejecuta en microsegundos por decisión.
- VRAM estimada: prácticamente nula; el modelo completo ocupa unos pocos kilobytes en safetensors.
- GPU recomendadas: no requiere GPU. Cualquier GPU (incluso integrada) es suficiente; A100, H100 o RTX 4090 son innecesarias para inferencia.
- Cabe en cualquier GPU de consumo y en dispositivos embebidos.
- Opciones de despliegue: JAX (librería declarada), exportación a NumPy u ONNX si se necesita integrar en otro runtime; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma medida; por tamaño, la latencia por decisión es despreciable frente al coste del simulador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. Como referencia interna del mismo autor, la comparación relevante es contra la regla heurística (P4,92, 57 % de finalización, 1,46 paradas) y contra la copia de esa regla convertida en red (P4,24), no contra otros modelos publicados.

| Modelo | Parámetros | Contexto | Posición media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| race-pit-wall-ep15 | 1.064 | no aplica | P4,08 | MIT | Hugging Face |
| Regla heurística del autor | no aplica | no aplica | P4,92 | no aplica | descrita en la model card |
| Copia de la regla como red (gen. 0) | no disponible | no aplica | P4,24 | MIT (mismo repo) | Hugging Face |

## Limitaciones y advertencias

- **Ámbito cerrado**: la política solo es válida para el simulador y el conjunto de 25 observaciones del autor; no es transferible a otros entornos sin reentrenar.
- **Mejora modesta sobre el control**: 0,16 posiciones sobre una copia de la regla; el grueso de la ventaja frente a la regla original proviene del momento de la decisión, no del aprendizaje.
- **Entrenamiento saturado**: diez horas adicionales no aportaron mejora clara, lo que limita expectativas de escalado con este método.
- **Sin datos de sesgo ni alucinación**: al no ser un modelo generativo, no aplican sesgos lingüísticos ni alucinaciones, pero tampoco hay análisis de robustez ante condiciones fuera de distribución.
- **Idiomas y cuantización no documentados**: no aplica el primero y no se especifican formatos de cuantización para el segundo.
- **Licencia MIT**: permite uso comercial y modificación con atribución; no obstante, el valor práctico fuera del contexto del proyecto es muy limitado.
- **Reproducibilidad**: el código está en el tag `episode-15` del repositorio de GitHub; sin ese simulador no se puede reproducir la evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amilliontries/race-pit-wall-ep15
- Código (tag `episode-15`): https://github.com/backstab319/a-million-tries/tree/episode-15
- Canal de YouTube: https://www.youtube.com/@amilliontries
