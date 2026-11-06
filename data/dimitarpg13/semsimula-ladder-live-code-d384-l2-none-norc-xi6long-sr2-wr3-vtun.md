# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtun

## Resumen

XI6-CODE es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro de la familia "semsimula", un programa de estudio sobre modelos de lenguaje conservativos basados en mecánica lagrangiana y potenciales escalares. No es un transformer ni usa atención: es un modelo de energía con pozos de potencial (wells) organizados en capas, donde cada token se asocia a un pozo que ejerce fuerza sobre el estado. Este ejemplar concreto, identificado como "screen A", aborda un problema documentado en la colección "dead wells": por qué un sexto canal de contexto degradaba el modelo base SO-CODE un 43% en perplejidad sobre código Python.

La hipótesis es que los pozos de potencial de la segunda capa morían (se alejaban de los estados, dejando de recibir gradiente y sin posibilidad de recuperarse). Este modelo aplica una corrección concreta: normalizar a norma unitaria cada canal de contexto antes de que el banco de pozos V_θ lo lea, manteniendo V_θ a su tasa de aprendizaje completa. El resultado es una perplejidad de validación de 5,95, prácticamente idéntica a la del baseline de cinco canales (6,00), lo que confirma que la corrección funciona pero que el sexto canal no aporta nada.

El modelo tiene 83.690.702 parámetros, se entrenó sobre exactamente 315.392.000 tokens de CodeParrot (Python) y se evaluó con perplejidad a bloque 512. Es un resultado negativo publicado de forma rigurosa: protocolo pre-registrado, ablación de mecanismo y comparación por pasos emparejados con los controles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No transformer, sin atención; modelo de energía conservativo con potencial escalar y pozos en espacio de Fock, integración BAOAB sobre variedad riemanniana (métrica de Jacobi) |
| Parámetros totales | 83.690.702 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es explícitamente no transformer y sin atención. Se describe como un modelo de lenguaje conservativo ("conservative-language-model", "fully-conservative") con un potencial escalar V_θ que define un banco de pozos ("wells") en un espacio de Fock. La dinámica se integra con el esquema BAOAB (integrador de dinámica molecular) sobre una variedad riemanniana equipada con métrica de Jacobi, usando geodésicas riemannianas. Esto da lugar a una inferencia de memoria constante ("constant-memory-inference"), una de las propiedades distintivas del diseño. El modelo incorpora canales de contexto enrutados por contenido ("content-routed context channels"): el baseline SO-CODE usa cinco y este modelo añade un sexto.

El entrenamiento usó exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) del dataset codeparrot-clean-train, con un schedule WSD durante 16.250 pasos y 3.000 pasos adicionales a la tasa de aprendizaje mínima. Todos los modelos de la tabla comparativa parten del paso 0 con semilla 0 sobre los mismos lotes, de modo que las evaluaciones están emparejadas paso a paso. La innovación técnica central es la corrección de pozos muertos: normalizar a norma unitaria cada canal de contexto antes de que el banco V_θ lo lea, manteniendo V_θ a tasa completa (frente a la corrección alternativa de reducir la tasa de V_θ a ×0,25). También se aplica una penalización de alcance ("reach penalty") que acerca el pozo más próximo de cada token; en este run ningún token de la capa 1 y solo el 0,2% de los de la capa 0 quedan más allá del umbral. El protocolo fue pre-registrado (entrada `p-dw-screen-a-full`) antes del run completo, con cuatro predicciones (VA1-VA4) todas acertadas.

## Capacidades

- Generación de texto autoregresiva sobre código fuente, en particular Python, con perplejidad de validación de 5,95 a bloque 512.
- Modelado de lenguaje de dominio de código: entrenado exclusivamente sobre CodeParrot clean (Python).
- Inferencia con memoria constante respecto a la longitud de secuencia, gracias a la formulación de dinámica conservativa sin atención.
- Soporte de canales de contexto múltiples (seis en este modelo) enrutados por contenido.
- Capacidad de diagnóstico de mecanismo: el modelo expone métricas internas de ocupación de pozos y ratio de pozo más próximo, útiles para estudiar dinámica de entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Multilingüismo: limitado a inglés por declaración del autor; el corpus es código Python.

## Casos de uso

- Investigación sobre arquitecturas alternativas al transformer: sirve como artefacto reproducible para estudiar si los modelos de energía conservativos pueden modelar lenguaje a escala de ~84M de parámetros, con una perplejidad de referencia concreta (5,95) y un baseline emparejado (6,00).
- Estudio de patologías de entrenamiento ("dead wells"): el modelo y sus controles permiten reproducir el fenómeno de pozos que dejan de recibir gradiente y evaluar mitigaciones (normalización de entrada frente a reducción de tasa de aprendizaje).
- Ablación de mecanismo controlada: con semilla fija, mismos lotes y evaluaciones emparejadas paso a paso, es adecuado para experimentos donde se aísla una única variable (el sexto canal de contexto o la corrección aplicada).
- Generación de código Python en entornos de investigación: puede usarse como generador de texto sobre código en pipelines experimentales, aunque su perplejidad está muy por encima de un GPT-2 emparejado (4,96).
- Docencia y divulgación técnica: ilustra de forma tangible la diferencia entre atención y dinámica conservativa, y cómo se mide la salud de un mecanismo interno mediante ocupación de pozos y coste de eliminación.
- Referencia para pre-registro en machine learning: el protocolo con predicciones probabilísticas y su puntuación posterior es un ejemplo práctico de metodología reproducible aplicable a estudios de ablación propios.
- Análisis de eficiencia en inferencia: la propiedad de memoria constante permite experimentos sobre despliegue de secuencias largas sin crecimiento de memoria de activaciones, dentro de las limitaciones de un modelo de 84M de parámetros.

## Benchmarks y rendimiento

| Modelo | Canales de contexto | Corrección | Pozos capa 1 | Perplejidad asentada | Frente a SO-CODE |
|---|---|---:|---|---:|---:|
| SO-CODE (baseline) | 5 | — | vivos | 6,00 | — |
| XI6-CODE (sin publicar) | 6 | — | muertos | 8,55 | +42,6% |
| Screen B (fix 1) | 6 | tasa de V_θ × 0,25 | vivos | 5,98 | −0,3% |
| Screen A (este modelo, fix 2) | 6 | entrada de norma unitaria a V_θ | vivos | 5,95 | −0,7% |
| SO-CODE-VTLR (control fix 1) | 5 | tasa de V_θ × 0,25 | vivos | 6,09 | +1,6% |
| SO-CODE-VTUN (control fix 2) | 5 | entrada de norma unitaria a V_θ | vivos | 6,34 | +5,8% |

Métricas adicionales del modelo (declaradas por el autor, no verificadas de forma independiente):

| Métrica | Valor |
|---|---|
| Perplejidad de validación asentada (media de pasos 18.000, 18.500 y 19.000) | 5,95 (5,96 / 5,88 / 6,03) |
| Mejor perplejidad de validación | 5,85 en el paso 16.000 |
| Conjunto de evaluación | Primeros 2M de tokens de validación de CodeParrot (split a nivel de fichero) |
| GPT-2 emparejado en los mismos tokens | 4,96 |
| VA2: ratio de pozo más próximo / ocupación del pozo más fuerte | 0,68 / 0,29; coste de eliminación +136% |
| VA3: Cell 6b-7 Gate 3 a N = 3 | 0,587 nats (referencia SO-CODE: 0,639) |
| VA4: brecha emparejada frente a SO-CODE en pasos 16.000–19.000 | −0,002 nats |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 83,7M de parámetros, en fp32 los pesos ocupan aproximadamente 0,33 GB; en fp16 unos 0,17 GB. Estas cifras son cálculo a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer con al menos 2 GB de memoria libre debería alojar los pesos; no se especifica ningún modelo concreto.
- Cabe en GPU consumer: sí por tamaño de pesos (el repositorio ocupa 0,3 GB), aunque no hay confirmación de que el código de inferencia (integrador BAOAB, métrica de Jacobi, geodésicas) esté empaquetado para despliegue estándar.
- Opciones de despliegue: no disponible. El modelo declara únicamente la librería pytorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer con atención es improbable que sea compatible con esos motores sin adaptación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot val, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| XI6-CODE (este modelo) | 83.690.702 | no disponible (bloques de 512) | 5,95 | CC-BY-4.0 | Hugging Face (0,3 GB) |
| SO-CODE (baseline de la familia) | no disponible | no disponible | 6,00 | no disponible | Hugging Face |
| Screen B (fix 1, misma familia) | 83.690.702 | no disponible | 5,98 | no disponible | Hugging Face |
| GPT-2 emparejado (referencia del autor) | no disponible | no disponible | 4,96 | no disponible | no disponible |

La comparación relevante es interna a la familia semsimula, ya que no se han identificado alternativas públicas de la misma categoría (modelos de energía conservativos sin atención para código). El GPT-2 emparejado, entrenado sobre los mismos tokens según el autor, obtiene mejor perplejidad (4,96 frente a 5,95), lo que sitúa a este modelo por debajo de un transformer pequeño convencional en calidad de modelado.

## Limitaciones y advertencias

- Resultado negativo por diseño: el sexto canal de contexto no aporta mejora medible; el modelo iguala al baseline de cinco canales pero no lo supera.
- Calidad de modelado por debajo de un GPT-2 emparejado (5,95 frente a 4,96 de perplejidad), lo que limita su uso como generador de código en producción.
- Sin verificación independiente: la métrica de perplejidad está marcada como `verified: false` y las predicciones pre-registradas fueron puntuadas por el propio autor, no confirmadas externamente.
- Idiomas: solo inglés declarado; el corpus es código Python, por lo que el comportamiento en lenguaje natural general o en otros lenguajes de programación no está caracterizado.
- Longitud de contexto: no se documenta una ventana máxima; el entrenamiento usó bloques de 512 tokens y no hay datos sobre generalización a secuencias más largas.
- Compatibilidad de despliegue: al no ser transformer ni usar atención, no se garantiza compatibilidad con motores de inferencia estándar (vLLM, llama.cpp, TGI); requiere el código propio del autor.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación sin garantías, no se recomienda para producción sin validación propia.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; el modelo no ha pasado por procesos documentados de RLHF o DPO, por lo que no hay alineación reportada.
- Procedencia de los datos: CodeParrot clean puede contener código con licencias variadas; el autor no documenta un filtrado de licencias del corpus más allá del propio dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtun
- Baseline SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Screen B (fix 1): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtlr0p25
- Control SO-CODE-VTLR: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtlr0p25
- Control SO-CODE-VTUN: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtun
- Colección "dead wells": https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-dead-wells-in-the-v-bank-6ae5275768c02fe9f540c5a3
- Nota técnica sobre pozos muertos: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Dead_Wells_in_the_Joint_V_theta_Bank.md
- Repositorio del paper: https://github.com/dimitarpg13/semsimula-paper
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
