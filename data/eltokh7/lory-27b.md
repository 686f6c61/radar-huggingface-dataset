# eltokh7/lory-27b

## Resumen

Lory-27B es un modelo de decisión para la simulación de encuestados sintéticos, desarrollado por eltokh7 como un ajuste fino de Kev-27B (Jared Palmer), cuyo backbone es Qwen3.8-27B. A diferencia de los modelos de decisión al uso, que reproducen bien la persona pero apenas reaccionan a las variables económicas del enunciado, Lory-27B está entrenado para que sus respuestas sigan lógica económica: responde a precios, probabilidades, pagos, retrasos y cantidades. El modelo lee los rasgos de un agente y una pregunta, y devuelve en un único forward pass una probabilidad calibrada para cada opción, sin muestrear texto.

El modelo tiene 25.624.600.064 parámetros (aproximadamente 25,6 mil millones), se distribuye en safetensors con licencia Apache 2.0 y está pensado para integrarse en estudios de EDSL (Expected Parrot Design Studio Language) mediante su endpoint `/v1/systemone`. Su relevancia actual radica en que, en muchos experimentos de ciencias sociales y economía del comportamiento, el tratamiento es el dinero en juego; un simulador que ignora esa variable acierta la persona pero falla el experimento.

Esta es la versión v1 (preview público), entrenada con una sola semilla y no validada contra personas reales: todas sus pruebas miden consistencia económica, no realismo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.8-27B, tag `qwen3_5_text`), ajuste fino LoRA fusionado en pesos completos |
| Parámetros totales | 25.624.600.064 (≈25,6 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el autor sirve en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Lory-27B parte de Kev-27B, un transformer denso con backbone Qwen3.8-27B, y se obtiene mediante LoRA con rango 16 aplicado sobre los pesos completos liberados: una época, learning rate 2e-5, batch 8, precisión bf16 y fusión posterior en pesos completos. El entrenamiento completo consumió 2,1 horas en una sola H100. La innovación no está en la arquitectura, sino en la formulación de la tarea: el modelo emite directamente una distribución de probabilidad sobre las opciones de una pregunta cerrada (multiple choice, sí/no, escala lineal, Likert) en un solo paso, en lugar de generar texto que luego haya que parsear.

Los datos de entrenamiento son 27.000 registros sintéticos distribuidos en nueve familias de decisión (precios y disposición a pagar, elección de producto, riesgo, tiempo, asignación presupuestaria, trabajo, juegos estratégicos, formatos de pregunta y elementos habituales de investigación de mercados). Cada registro describe un agente con preferencias ocultas (presupuesto, gustos, actitud ante el riesgo, paciencia, valor del tiempo) expresadas en rasgos estilo EDSL, ante una decisión concreta; la etiqueta es lo que implican esas preferencias según utilidad aleatoria, con objetivos suaves sobre las opciones, de modo que las etiquetas son consistentes por construcción. Aproximadamente el 64 % de los registros fueron reescritos por modelos abiertos (GLM-5.3, DeepSeek V4.1 Flash) para variar la redacción conservando todos los números, y cada registro pasó una comprobación de fuga basada en shingles de 7 palabras contra el benchmark y la batería de evaluación. Se añadieron además 5.000 registros reproducidos del split de entrenamiento decision-v7 del propio Kev.

## Capacidades

- Predicción de decisiones con distribución de probabilidad calibrada sobre todas las opciones de una pregunta en un único forward pass, sin muestreo de texto.
- Sensibilidad a variables económicas del enunciado: precios, probabilidades, pagos, retrasos y cantidades.
- Simulación de encuestados a partir de rasgos de persona en formato EDSL (rasgos textuales con presupuesto, gustos, actitud ante el riesgo, paciencia y valor del tiempo).
- Soporte de tipos de pregunta de encuesta: elección múltiple, sí/no, escala lineal y Likert, con rotaciones de opciones opcionales para cancelar el sesgo de posición.
- Integración con EDSL mediante el script `edsl_decision.py`, que ejecuta un `Survey` con `Agent`s y `Scenario`s contra el endpoint y devuelve una tabla de probabilidades de respuesta.
- Juegos estratégicos: entrenado específicamente en bank runs y juegos de coordinación.
- API compatible con el stack de servicio de Kev (`kev.serve`, endpoint `/v1/systemone`).
- No se documentan capacidades de generación de texto libre, código, matemáticas simbólicas, visión, audio, tool calling ni razonamiento multi-paso en el sentido de agentes.

## Casos de uso

- Investigación de mercados y análisis de disposición a pagar: el modelo estima la probabilidad de elección entre planes o productos con precios y prestaciones distintas, reaccionando a la variación del precio, lo que permite simular curvas de demanda antes de lanzar un estudio de campo.
- Experimentos de economía del comportamiento: simulación de decisiones ante loterías y juegos de coordinación, con pendiente de lotería de 0,77 frente a la teórica de 1,0, útil para pilotar diseños experimentales y detectar problemas de enunciado.
- Estudios de pánicos bancarios y retiradas de depósitos: la batería de bank-run con dial de depositante es uno de los dominios de entrenamiento explícito, con un desplazamiento del punto de corte de 66 puntos cuando cambian los pagos (frente a 1 punto del Kev liberado).
- Pruebas previas de cuestionarios: ejecutar un `Survey` de EDSL sobre agentes sintéticos para estimar distribuciones de respuesta, detectar preguntas ambiguas o calibrar tamaños de muestra antes del trabajo de campo.
- Análisis de sensibilidad a formatos de pregunta: las rotaciones de opciones permiten medir y corregir el sesgo de posición en encuestas de elección múltiple.
- Simulación de políticas con asignación presupuestaria y curvas de Engel: modelar cómo distintos perfiles de renta distribuyen gasto entre categorías, aprovechando las comprobaciones teóricas de Engel incluidas en el benchmark DLS v0.2.
- Evaluación comparativa de modelos de decisión: servir como referencia local (una H100, más de 33 peticiones por segundo) frente a APIs propietarias, con un coste estimado inferior a 0,75 dólares por 1.000 encuestados × 20 preguntas a 4,4 dólares por hora de GPU.

## Benchmarks y rendimiento

| Prueba | Lory-27B | Kev-27B (liberado) | Perplexity Decider v1.2 | GPT-6.1-terra (un paso) |
|---|---|---|---|---|
| DLS v0.2 (9 familias) | 88 [83, 93] | 71 | 77 | 93 |
| Test ciego (513 contrastes de GPT-6.1-sol) | 92 [90, 94] | 90 | 93 | 84* |
| Batería bank-run: desplazamiento por pagos (teoría 80) | 66 | 1 | 9 | 62 |
| Pendiente de lotería (teoría 1,0) | 0,77 | 0,25 | 0,43 | 0,92 |
| EDSL-General (sin regresión) | 88 | 87 | 88 | 99 |

Los corchetes indican intervalos bootstrap del 95 % (DLS sobre comprobaciones; test ciego sobre pruebas). Diferencias pareadas: frente a Decider, DLS +10,3 [+4,2, +17,0]; en el test ciego −1,3 [−3,4, +0,5], considerado empate. *El test ciego puntúa la dirección del movimiento con crédito gradual; GPT en un paso produce respuestas casi 0/1 y pierde crédito cuando ambas respuestas de un contraste caen en el mismo extremo. La precisión de desarrollo decision-v7 de Kev se mantiene sin cambios (sin olvido catastrófico). El modelo supera 6 de las 7 barras del piloto (falla la pendiente de lotería, 0,77 frente a 0,8).

## Requisitos de hardware

- VRAM estimada: aproximadamente 55 GB en bf16, lo que exige una GPU de 80 GB (A100 80 GB, H100 80 GB) para servirlo con `kev.serve`.
- No cabe en GPU de consumo en bf16; no se documentan versiones cuantizadas (GGUF, AWQ, GPTQ) que permitan reducir la huella a 24 GB o menos.
- Despliegue: stack propio de Kev (`uv run python -m kev.serve --run eltokh7/lory-27b --device cuda --port 8850`), sobre el commit 2074cc4 del repositorio de Jared Palmer. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: al menos 33 peticiones por segundo en una H100 con un cliente que limitaba la concurrencia.
- Coste estimado: menos de 0,75 dólares por 1.000 encuestados × 20 preguntas a 4,4 dólares por hora de GPU; aproximadamente el triple con rotaciones de opciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DLS v0.2 | Bank-run (pagos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lory-27B | ≈25,6 B | No disponible | 88 | 66 | Apache 2.0 | Pesos abiertos en Hugging Face |
| Kev-27B | No disponible | No disponible | 71 | 1 | No disponible | Pesos abiertos en Hugging Face |
| Perplexity Decider v1.2 | No disponible | No disponible | 77 | 9 | No disponible | No disponible |
| GPT-6.1-terra | No disponible | No disponible | 93 | 62 | Propietaria | API |

Frente a Kev-27B, Lory mejora la consistencia económica (DLS +17 puntos; desplazamiento por pagos de 1 a 66) sin perder precisión en EDSL-General (88 frente a 87). Frente a Perplexity Decider v1.2, la mejora en DLS es de +10,3 puntos con intervalo [+4,2, +17,0] y empata en el test ciego. Frente a GPT-6.1-terra en un paso, Lory pierde en DLS (88 frente a 93) y en pendiente de lotería (0,77 frente a 0,92), pero gana en el test ciego (92 frente a 84) y ofrece ejecución local con coste muy inferior.

## Limitaciones y advertencias

- No validado contra personas reales: todas las pruebas miden consistencia económica, no realismo. Los encuestados reales violan parte de lo que aquí se premia (por ejemplo, reaccionan al framing); es necesario usar benchmarks humanos antes de fiarse de los niveles absolutos.
- Sensibilidad al encuadre: en el test ciego, reformular el mismo trato sigue moviendo las respuestas (invariancia 66/100 frente a 98 de GPT en un paso), ligeramente peor que antes del entrenamiento (68).
- Amplitud estratégica limitada: entrenado en bank runs y juegos de coordinación; en los ítems de confianza, ultimátum y bienes públicos de GPT puntúa algo peor que antes del entrenamiento (83 frente a 87).
- Pendiente de lotería de 0,77: pondera bien las probabilidades declaradas, pero no del todo (GPT en un paso llega a 0,92).
- Una sola semilla de entrenamiento: no hay intervalo entre semillas, por lo que la estabilidad de los resultados no está caracterizada.
- Idiomas soportados no documentados; la model card y los ejemplos están en inglés.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base (Kev-27B) y su backbone Qwen3.8-27B deben verificarse por si imponen condiciones adicionales.
- Riesgo de alucinación no evaluado en esta ficha: el modelo no genera texto libre, sino distribuciones de probabilidad, de modo que el riesgo se traslada a la calibración de esas distribuciones.
- Contexto máximo no disponible: no se puede garantizar el comportamiento con estados de agente o cuestionarios muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eltokh7/lory-27b
- Modelo base Kev-27B: https://huggingface.co/jaredpalmer/kev-27b
- Repositorio de Kev: https://github.com/jaredpalmer/kev
- Script de integración EDSL: `edsl_decision.py` (incluido en el repositorio del modelo)
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
