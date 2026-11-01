# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtun

## Resumen

SO-CODE-VTUN es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13 dentro de la familia "semsimula", un programa de estudio sobre modelos de lenguaje conservativos (basados en potencial escalar y mecánica lagrangiana) que abandonan la arquitectura transformer clásica. Este checkpoint concreto forma parte de un estudio escalonado ("ladder study") pre-registrado sobre ablaciones de mecanismo, en el que se comparan variantes de un modelo base (SO-CODE) entrenado sobre código Python con distintas modificaciones en el banco de pozos de potencial de su segunda capa. El modelo tiene 76.572.109 parámetros, se entrenó sobre exactamente 315.392.000 tokens de CodeParrot y se evalúa mediante perplejidad de validación.

El propósito del checkpoint no es ofrecer un modelo de producción, sino documentar un resultado experimental concreto: comprobar si normalizar a norma unitaria las entradas de cada canal de contexto antes de que el banco de pozos de potencial V_θ las lea (la "segunda corrección" de un fallo conocido como pozos muertos, "dead wells") degrada o mejora un modelo cuyo banco de pozos está sano. La conclusión declarada por el autor es que la normalización cuesta un 5,8 % de perplejidad a un modelo sano (6,34 frente a 6,00 del baseline), por lo que se trata de una corrección útil para modelos con pozos muertos, pero no un valor por defecto razonable.

Es relevante ahora por su carácter de resultado negativo documentado y pre-registrado: aporta evidencia sobre cómo interactúan los canales de contexto adicionales con mecanismos de energía basados en potencial, y lo hace con presupuesto de tokens emparejado y evaluaciones paso a paso comparables entre los seis modelos de la colección. La licencia es CC-BY-4.0 y el modelo solo declara inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo no transformer, sin atención ("attention-free"), basado en potencial escalar y mecánica lagrangiana; banco de pozos de potencial V_θ con potencial gaussiano anisotrópico, integración BAOAB y geometría riemanniana (métrica de Jacobi) |
| Parametros totales | 76.572.109 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluación a bloque de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (librería pytorch; repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la línea "parflm" / semsimula: un modelo de lenguaje conservativo que sustituye la atención por dinámicas derivadas de un potencial escalar, con un banco de pozos de potencial (V_θ) como mecanismo central de memoria y control, integración mediante BAOAB y formulación en espacio de Fock con geometría riemanniana. La variante SO-CODE-VTUN introduce una única modificación respecto al baseline SO-CODE: cada canal de contexto se escala a norma unitaria antes de que el banco de pozos lo lea. La modificación no añade parámetros, de ahí que ambos modelos compartan exactamente 76.572.109 parámetros.

El entrenamiento usó exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) sobre CodeParrot (Python), con el schedule WSD del estudio durante 16.250 pasos y 3.000 pasos adicionales a la tasa de aprendizaje mínima. Todos los modelos de la tabla parten del paso 0 con semilla 0 y los mismos lotes, de modo que las evaluaciones están emparejadas paso a paso. La ejecución completa duró 6,1 horas en una sola sesión, sin activaciones del watchdog, con norma de gradiente mediana de 0,39 tras el paso 2.000 y máximo de 1,09 durante el warmup; el monitor de fuga SCAF se mantuvo limpio en las cuatro auditorías. No se declara uso de RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva sobre código Python, evaluada mediante perplejidad en CodeParrot clean.
- Modelado de lenguaje condicionado por canales de contexto múltiples (cinco en este checkpoint), con el banco de pozos de potencial como mecanismo de control.
- Inferencia con memoria constante según las etiquetas del autor ("constant-memory-inference"), derivada de la formulación sin atención.
- Capacidad experimental de ablación: el checkpoint sirve como control emparejado de la corrección de normalización unitaria.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles; solo se declara inglés.

## Casos de uso

- Investigación sobre arquitecturas alternativas al transformer: el checkpoint permite reproducir y auditar el efecto de la normalización de entrada al banco de potencial en un modelo sin atención, con presupuesto de tokens y semilla fijados.
- Estudio de estabilidad de mecanismos basados en energía: sirve para analizar el fenómeno de "pozos muertos" (pozos que se alejan de los estados, dejan de ejercer fuerza y no reciben gradiente) y su prevención mediante normalización.
- Reproducción de resultados pre-registrados: al estar publicados el protocolo y las predicciones (VU1–VU4) antes de la ejecución, el modelo permite verificar puntuaciones sobre la letra y comparar con las variantes de la colección.
- Benchmarking de perplejidad sobre código Python: con 6,34 de perplejidad de validación a bloque 512, es un punto de referencia para comparar variantes del mismo linaje con idéntico presupuesto de tokens.
- Docencia y divulgación técnica: ilustra cómo un cambio de una línea (escalar entradas a norma unitaria) puede costar un 5,8 % de perplejidad a un modelo sano, un caso útil para explicar control experimental en aprendizaje profundo.
- Análisis de eficiencia de inferencia: su carácter sin atención y de memoria constante lo hace adecuado para estudiar costes de inferencia en secuencias largas, aunque no se publican latencias ni throughput.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Canales de contexto | Modificación | Pozos capa 1 | Perplejidad asentada | Frente a SO-CODE |
|---|---:|---|---|---:|---:|
| SO-CODE (baseline) | 5 | — | vivos | 6,00 | — |
| XI6-CODE (no en el Hub) | 6 | — | muertos | 8,55 | +42,6 % |
| screen B (fix 1) | 6 | lr de V_θ × 0,25 | vivos | 5,98 | −0,3 % |
| SO-CODE-VTLR (control fix 1) | 5 | lr de V_θ × 0,25 | vivos | 6,09 | +1,6 % |
| screen A (fix 2) | 6 | entrada norma unitaria | vivos | 5,95 | −0,7 % |
| **SO-CODE-VTUN (este modelo)** | 5 | entrada norma unitaria | vivos | **6,34** | **+5,8 %** |

| Métrica adicional | Valor |
|---|---|
| Perplejidad de validación (model-index, bloque 512, media de las tres últimas evaluaciones de 500 pasos) | 6,3418 |
| Evaluaciones individuales (pasos 18.000 / 18.500 / 19.000) | 6,23 / 6,37 / 6,43 |
| Mejor perplejidad | 6,23 (paso 18.000) |
| GPT-2 emparejado en los mismos tokens de código | 4,96 |

Conjunto de evaluación: primeros 2 millones de tokens de los ficheros de validación de CodeParrot, con partición a nivel de fichero.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 76,6 millones de parámetros, en fp32 ocuparía aproximadamente 0,3 GB de pesos, pero el autor no publica requisitos ni formatos cuantizados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño de pesos, pero no confirmado por el autor; la implementación depende de código propio (pytorch) no empaquetado en librerías estándar.
- Opciones de despliegue: no disponible; no se declaran soportes para vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer la integración con esos motores no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot val, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO-CODE-VTUN (este) | 76.572.109 | no disponible | 6,34 | CC-BY-4.0 | HuggingFace |
| SO-CODE (baseline del linaje) | 76.572.109 | no disponible | 6,00 | CC-BY-4.0 | HuggingFace |
| SO-CODE-VTLR (control fix 1) | 76.572.109 | no disponible | 6,09 | CC-BY-4.0 | HuggingFace |
| GPT-2 emparejado | no disponible en la información | no disponible | 4,96 | no disponible en la información | no disponible en la información |

No se dispone de comparación con modelos de código de propósito general (por ejemplo, variantes de CodeGen o StarCoder) en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo por diseño: la modificación evaluada empeora un 5,8 % la perplejidad frente al baseline sano, por lo que no debe adoptarse como configuración por defecto.
- Tres de las cuatro predicciones pre-registradas (VU1, VU2 y VU3) fallaron; el autor puntúa sobre la letra del protocolo y no confirma los resultados de forma independiente.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la ficha: sin validación externa ni uso en producción documentado.
- Entrenado exclusivamente sobre código Python de CodeParrot y con idioma declarado únicamente inglés; el rendimiento en otros dominios o lenguas no está caracterizado.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible; al ser un modelo de código, puede generar APIs o bibliotecas inexistentes.
- Longitud de contexto no declarada; la evaluación se limita a bloques de 512 tokens.
- Sin formatos cuantizados publicados ni integración con motores de inferencia estándar, lo que dificulta el despliegue.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está pensado ni validado para ello.
- El repositorio ocupa 0,3 GB y la librería declarada es pytorch, sin garantía de compatibilidad con `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtun
- Baseline SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Control de la corrección 1 (SO-CODE-VTLR): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtlr0p25
- Pantalla A (corrección 2 con seis canales): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtun
- Pantalla B (corrección 1 con seis canales): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtlr0p25
- Colección "dead wells": https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-dead-wells-in-the-v-bank-6ae5275768c02fe9f540c5a3
- Nota de análisis sobre pozos muertos: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Dead_Wells_in_the_Joint_V_theta_Bank.md
- Repositorio del paper: https://github.com/dimitarpg13/semsimula-paper
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
