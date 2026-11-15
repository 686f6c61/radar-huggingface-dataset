# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-2b

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-sr2-2b` es un modelo de lenguaje de investigación desarrollado por el usuario `dimitarpg13` dentro del proyecto SemSimula, una línea experimental que explora modelos de lenguaje conservativos basados en mecánica lagrangiana y potenciales escalares en lugar de la atención transformer convencional. Este checkpoint concreto (SR2-2B) es la versión del modelo SR2 entrenada con cuatro veces más tokens: 2,13 mil millones de tokens de OpenWebText frente a los 0,53 mil millones del SR2 original, manteniendo idéntica arquitectura y configuración.

El modelo resuelve un problema de investigación concreto: medir si el núcleo conservativo (sin atención) escala con datos de forma comparable a un transformer de referencia. El resultado declarado es que SR2-2B alcanza una perplejidad de validación de 48,58 en OpenWebText (bloque 512), mejorando un 16,7% respecto a SR2 a 0,53B, aunque queda un 13,8% por encima del GPT-2 emparejado en presupuesto de tokens (42,69). Es relevante ahora porque documenta de forma pre-registrada el comportamiento de un paradigma no-transformer, sin atención y con memoria constante en inferencia, bajo un protocolo de ablación por escalones ("ladder study").

El modelo tiene 76.572.110 parámetros, dos capas y está entrenado exclusivamente en inglés. No es un modelo de producción: es un artefacto de investigación con hipótesis pre-registradas, resultados de ablación y trazabilidad de sesiones de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No-transformer, sin atención; modelo de lenguaje conservativo con potencial escalar (banco Vθ de ocho pozos), integrador exacto de osciladores amortiguados, geometría riemanniana (métrica de Jacobi), espacio de Fock |
| Parametros totales | 76.572.110 (35.427.080 en el banco Vθ de ocho pozos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (librería `pytorch`, repo de 1,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es explícitamente no-transformer y sin atención. El modelo se describe como un "conservative language model" basado en un potencial escalar Vθ con un banco de ocho pozos, integrado mediante un integrador exacto de osciladores amortiguados para los modos rígidos, con formulación de mecánica lagrangiana, geometría riemanniana (geodesicas riemannianas y métrica de Jacobi) y espacio de Fock. El tag `cfc` y `baoab` sugieren el uso de esquemas de integración tipo BAOAB para dinámica de Langevin. La inferencia se declara de memoria constante (`constant-memory-inference`), lo que es una propiedad estructural de esta familia frente al coste cuadrático de la atención.

El entrenamiento se realizó sobre OpenWebText (`Skylion007/openwebtext`), con exactamente 2.129.920.000 tokens (130.000 pasos × 32 × 512, unos 28 tokens por parámetro), usando ventanas aleatorias con reemplazo de un pool de 2,0 mil millones de tokens (aproximadamente 1,07 pasadas). El schedule fue warm-up lineal hasta el paso 6.500, tasa de aprendizaje máxima de 1,2e-03 mantenida hasta el paso 84.500 y decaimiento coseno hasta 6e-05 en el paso 130.000. El entrenamiento se ejecutó en dos sesiones de Colab sobre una A100 de 80 GB, a aproximadamente 1,1 s por paso, con reanudación desde el autosave del paso 76.993 restaurando optimizador y sampler de batches. No se menciona RLHF ni DPO; el modelo es un LM autorregresivo entrenado con el objetivo estándar de modelado de lenguaje.

La innovación metodológica destacable es el protocolo pre-registrado (RT3, DG1, DG2, OC1-OC3) con predicciones y probabilidades declaradas antes de observar resultados, y el hallazgo de que el paso por capa deja de ser una muestra cercana de un flujo continuo al entrenar más tiempo (0,92 nats de separación frente a 0,10 nats a 0,53B).

## Capacidades

- Generación de texto autorregresiva en inglés (pipeline `text-generation`).
- Modelado de lenguaje y evaluación de perplejidad sobre OpenWebText.
- Inferencia con memoria constante, independiente de la longitud de secuencia (propiedad declarada de la arquitectura).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: solo inglés.
- No se documenta visión, audio ni modo "thinking".
- El modelo es un artefacto de investigación con hipótesis de ablación, no un asistente afinado por instrucciones.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de comparación controlado (mismo dataset, mismo presupuesto de tokens, misma semilla de protocolo) frente a un GPT-2 emparejado para estudiar el escalado de modelos conservativos sin atención.
- Estudio de eficiencia en memoria de inferencia: la propiedad de memoria constante permite analizar despliegues en entornos con RAM/VRAM limitada donde la longitud de contexto crece, aunque el modelo solo se haya validado a bloques de 512.
- Reproducción de experimentos pre-registrados: el repositorio documenta predicciones, resultados y desviaciones (RT3, DG1, DG2, OC1-OC3), lo que lo hace útil para cursos y trabajos sobre metodología de investigación reproducible en ML.
- Ablación de mecanismos internos: el banco de ocho pozos y las lecturas por capa (OC1-OC3) permiten estudiar qué componentes retienen relevancia al aumentar el presupuesto de entrenamiento.
- Evaluación de perplejidad como referencia: útil como baseline no-transformer en benchmarks de modelado de lenguaje sobre OpenWebText con bloques de 512.
- Docencia sobre modelos energy-based y mecánica lagrangiana aplicada a NLP: el modelo ilustra de forma concreta la formulación de potencial escalar, integradores exactos y geometría riemanniana en un LM funcional.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Modelo | Tokens | Perplejidad de validación (bloque 512) | Ratio frente a GPT-2 emparejado |
|---|---:|---:|---:|
| SR2-2B (este modelo) | 2,13B | 48,58 (media de las últimas tres evaluaciones: 48,36 / 49,19 / 48,21; mejor 47,56 en el paso 126.500; final 48,21) | 1,138× |
| SR2 (mismo modelo a 0,53B) | 0,53B | 58,32 | 1,206× |
| GPT-2 emparejado a 2B (G2B) | 2,13B | 42,69 | 1,000× |
| GPT-2 emparejado a 0,53B (W2) | 0,53B | 48,37 | 1,000× |

Lecturas adicionales declaradas: ganancia por datos de −16,7% frente a SR2 a 0,53B (frente al −11,7% del GPT-2 emparejado en el mismo salto de presupuesto); ganancia del decaimiento de 0,220 nats (SE 0,011), inferior a la del GPT-2 en 0,148 nats; separación del flujo por capa respecto al paso entrenado de 0,92 nats (frente a 0,10 nats a 0,53B). Salud del entrenamiento: 0 disparos de watchdog, 0 pasos omitidos, mayor subida entre evaluaciones de +0,066 nats (paso 51.500), norma global de gradiente superior a 1,0 en 355 de 1.593 pasos registrados en fase estable y en 448 de 910 pasos de decaimiento (máximo 15,0).

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 76,57 M de parámetros, los pesos en fp32 ocupan aproximadamente 306 MB, en fp16 unos 153 MB y en int8 unos 77 MB; el repo completo pesa 1,2 GB, probablemente por checkpoints y estados del optimizador.
- GPU recomendadas: el autor entrenó en una A100 de 80 GB (dos sesiones de Colab), pero ese requisito corresponde al entrenamiento, no a la inferencia. Para inferencia, el tamaño de parámetros sugiere que cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se especifica el soporte de kernels optimizados para esta arquitectura no-transformer.
- Opciones de despliegue: la librería declarada es `pytorch`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y al ser una arquitectura no-transformer es improbable que funcione sin código específico del autor.
- Latencia y throughput: no disponibles. El dato de 1,1 s por paso corresponde al entrenamiento en A100, no a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| SR2-2B (este modelo) | 76,57 M | no disponible (entrenado a 512) | 48,58 | CC-BY-4.0 | Hugging Face |
| SR2 (0,53B tokens) | 76,57 M | no disponible (entrenado a 512) | 58,32 | CC-BY-4.0 | Hugging Face |
| GPT-2 emparejado a 2B (G2B) | 33,7 M (8 capas) | 1.024 tokens (GPT-2 estándar) | 42,69 | no disponible en la información | Hugging Face (repo del autor) |
| GPT-2 emparejado a 0,53B (W2) | 33,7 M (8 capas) | 1.024 tokens (GPT-2 estándar) | 48,37 | no disponible en la información | Hugging Face (repo del autor) |

La comparación es de orientación, no like-for-like: el autor advierte que las ratios no constituyen una afirmación de eficiencia equivalente, dado que GPT-2 tiene 33,7 M de parámetros y ocho capas frente a dos.

## Limitaciones y advertencias

- Modelo de investigación: no está afinado por instrucciones ni por preferencias humanas (sin RLHF/DPO documentado); no debe usarse como asistente conversacional.
- Solo inglés; no hay soporte multilingüe declarado.
- Contexto validado únicamente a bloques de 512 tokens; no se documenta ventana de contexto mayor.
- Riesgo de alucinación no medido: no se han publicado evaluaciones de factualidad ni de sesgos.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está diseñado ni validado para producción.
- Arquitectura no estándar: la integración con ecosistemas de despliegue (vLLM, TGI, llama.cpp) no está documentada y probablemente requiera código propio del autor.
- Resultados de benchmarks declarados por el autor y marcados como no verificados (`verified: false`); deben tratarse como preliminares.
- El propio autor reporta desviaciones de sus predicciones pre-registradas (RT3, DG1, OC1, OC2 falladas), lo que evidencia que el comportamiento del modelo no se ajusta a las intuiciones teóricas iniciales en varios puntos.
- La norma de gradiente superó 1,0 en una fracción significativa de pasos (hasta 15,0), lo que sugiere inestabilidad numérica durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-2b
- Modelo SR2 base (0,53B tokens): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- GPT-2 emparejado a 2B: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-gpt2-matched-2b
- Colección de modelos de 2B tokens: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-2b-training-tokens-6ad56f3d2a560dd121e59b60
- Colección Gen 3 (escalón de 0,53B tokens): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
