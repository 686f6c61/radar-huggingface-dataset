# luisbrel/jimmy-4b-zero-regression

## Resumen

Jimmy-4B-Zero-Regression es un checkpoint experimental de 4B publicado por el investigador independiente luisbrel, derivado del modelo base google/gemma-4-e4b-it y ajustado localmente en Apple Silicon (M4 Max de 128 GB) mediante el framework MLX. El proyecto nace como un ejercicio de calibración geométrica dirigida sobre una arquitectura compacta de tipo edge, con el objetivo declarado de preservar el comportamiento de razonamiento del modelo original mientras se modifican selectivamente ciertos tensores. El checkpoint se distribuye en formato MLX de 4 bits y está pensado para inferencia nativa en chips de Apple.

La relevancia del modelo no reside en una mejora de capacidades, sino en su transparencia metodológica: el autor documenta un proceso de evaluación con puertas estadísticas estrictas (ParetoAnchorGate) y publica un veredicto negativo honesto. Una reevaluación potenciada con 50 muestras por suite (400 evaluaciones autorregresivas en total) frente al Gemma-4-4B base reconstruido por SHA-256 registró una regresión de -4,0 % en MATH-500 y un delta macro neto de -0,5 %, lo que condujo al veredicto oficial REJECTED_REGRESSION. Los resultados del piloto inicial de 56 evaluaciones, que sugerían una mejora de +8,93 %, quedan formalmente retractados por falta de potencia estadística.

Se trata, por tanto, de un artefacto de investigación para reproducibilidad de resultados negativos, no de un modelo recomendado para producción. El repositorio ocupa 4,2 GB, acumula 354 descargas y declara licencia Apache 2.0, aunque el modelo base Gemma arrastra sus propias condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Gemma 4, familia E4B) |
| Parametros totales | 7.463.013.418 (según safetensors); el autor describe la escala como 4,3B edge dense |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | 4 bits (formato MLX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (con license_link a las condiciones de Gemma 4 de Google) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-e4b-it, un transformer denso de la familia Gemma 4 orientado a despliegue en el borde. Sobre ese checkpoint, el autor aplicó un post-entrenamiento de calibración selectiva: según la prueba de reconstrucción SHA-256 documentada, de los 1.355 tensores del modelo solo 6 difieren del base, concretamente los correspondientes a `layers.{20,26}.mlp.down_proj.{weight,scales,biases}`. Intercambiando `layers.20.mlp.down_proj` se reconstruye exactamente el checkpoint base sin editar, lo que confirma que la intervención es extremadamente localizada y no un reentrenamiento amplio.

No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El proyecto se enmarca en una línea de investigación sobre "calibración geométrica" de modelos compactos y emplea un pipeline de evaluación propio con puertas estadísticas (ParetoAnchorGate.strict_rsi_gate) que exige un mínimo de 50 muestras por suite para aceptar cualquier promoción. La innovación destacable no es arquitectónica sino metodológica: la publicación de resultados negativos con trazabilidad criptográfica de la reconstrucción del base.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Gemma-4-e4b-it.
- Razonamiento matemático de nivel medio: 48,0 % en MATH-500 y 92,0 % en GSM8K con 50 muestras por suite.
- Razonamiento científico y de sentido común: 84,0 % en ARC-Challenge.
- Seguimiento de instrucciones de formato: 100,0 % en IFEval (50/50).
- Generación de código: el piloto reporta 75,0 % en HumanEval con n=8, dato no reevaluado a n=50 y por tanto no concluyente.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Reproducción de resultados negativos en investigación: el checkpoint sirve para replicar el pipeline de evaluación del autor (400 evaluaciones autorregresivas sobre MATH-500, GSM8K, ARC-Challenge e IFEval) y verificar de forma independiente el veredicto REJECTED_REGRESSION.
- Estudio de calibración selectiva de tensores: dado que solo 6 tensores difieren del base, es un caso de laboratorio útil para analizar cómo modificaciones localizadas en capas MLP profundas afectan al razonamiento matemático sin tocar otras capacidades.
- Auditoría de puertas estadísticas: permite experimentar con umbrales de potencia muestral (comparar n=4, n=8 y n=50 por suite) y observar la diferencia entre intervalos binomiales del 52,71 % y el 5,82 % de cota superior al 95 %.
- Inferencia local en Apple Silicon: al estar en formato MLX de 4 bits y ocupar 4,2 GB, puede ejecutarse en Macs con chip M-series para tareas de generación de texto en inglés sin conexión.
- Docencia sobre evaluación de modelos: ilustra de forma concreta por qué un piloto de 56 evaluaciones no basta para afirmar una mejora y cómo se retracta formalmente una conclusión previa.
- Pruebas de regresión en pipelines de post-entrenamiento: como referencia de "qué no hacer" al promocionar un checkpoint, útil para diseñar gates de promoción con muestras mínimas por suite.

## Benchmarks y rendimiento

Reevaluación potenciada a n=50 por suite (400 evaluaciones autorregresivas) frente al Gemma-4-4B base reconstruido por SHA-256, ejecutada en M4 Max de 128 GB con MLX:

| Suite (n=50 cada una) | Base Gemma-4-4B | jimmy-4b | Delta neto |
|---|---|---|---|
| MATH-500 | 52,0 % (26/50) | 48,0 % (24/50) | -4,0 % |
| GSM8K | 90,0 % (45/50) | 92,0 % (46/50) | +2,0 % |
| ARC-Challenge | 84,0 % (42/50) | 84,0 % (42/50) | 0,0 % |
| IFEval | 100,0 % (50/50) | 100,0 % (50/50) | 0,0 % |
| Macro (n=400) | — | — | -0,5 % |

Piloto histórico de n=56 (4 preguntas × 2 intentos en 7 suites), superseded y retractado:

| Suite (n=8) | Base Gemma-4 (4B) | jimmy-4b | Delta |
|---|---|---|---|
| GSM8K | 50,0 % | 75,0 % | +25,0 % |
| HumanEval | 75,0 % | 75,0 % | 0,0 % |

El veredicto oficial es REJECTED_REGRESSION (outcome: "HONEST_NEGATIVE_REJECTED"). Los datos de referencia de modelos frontera que aparecían en comparaciones anteriores están marcados como [DISPUTED — RE-RUN REQUIRED] y fueron retirados por no estar fundamentados.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: aproximadamente 4,2 GB para los pesos en 4 bits, más overhead de contexto y activaciones; el autor ejecuta en un M4 Max de 128 GB de memoria unificada.
- GPU recomendadas: el formato es MLX, por lo que el entorno objetivo son chips de Apple (M1, M2, M3, M4 y variantes Pro, Max y Ultra). No se documenta soporte para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; en el ecosistema NVIDIA requeriría conversión previa a otro formato, no documentada.
- Opciones de despliegue: MLX y mlx-lm son las vías nativas. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 (n=50) | GSM8K (n=50) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jimmy-4b-zero-regression | 7,46B en safetensors (escala 4,3B) | No disponible | 48,0 % | 92,0 % | Apache 2.0 | Hugging Face, formato MLX |
| Gemma-4-4B base (google/gemma-4-e4b-it) | Escala 4,3B | No disponible | 52,0 % | 90,0 % | Términos Gemma 4 | Hugging Face, múltiples formatos |
| Gemma-4-4B base reconstruido (SHA-256) | Idéntico al base | No disponible | 52,0 % | 90,0 % | Términos Gemma 4 | Reconstrucción local verificable |

La comparativa relevante es interna: el checkpoint calibrado rinde peor que su propio base en MATH-500 y solo mejora marginalmente en GSM8K, sin superar la puerta de promoción. No se dispone de datos de otros modelos de 4B comparables en la información proporcionada.

## Limitaciones y advertencias

- Regresión demostrada: -4,0 % en MATH-500 a n=50, con veredicto oficial REJECTED_REGRESSION; no debe presentarse como una mejora sobre el base.
- Resultados retractados: las cifras del piloto de n=56 (+8,93 % macro) están formalmente superseded y no deben citarse como evidencia.
- Potencia estadística: el propio autor documenta que con n=4 la cota superior binomial al 95 % es del 52,71 %, lo que invalida conclusiones con muestras pequeñas.
- Idiomas: solo inglés; sin soporte multilingüe declarado.
- Contexto: la longitud de ventana no está documentada, lo que impide planificar cargas con prompts largos.
- Formato: exclusivamente MLX, lo que limita su uso fuera del ecosistema Apple Silicon.
- Licencia: aunque el repo declara Apache 2.0, el modelo base Gemma 4 remite a las condiciones de uso de Google (license_link), que pueden imponer restricciones adicionales al uso comercial; conviene revisarlas antes de cualquier despliegue productivo.
- Alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de tasa de alucinación; al ser un derivado de Gemma 4, hereda los riesgos del base sin mitigaciones adicionales conocidas.
- Uso previsto: artefacto de investigación para reproducibilidad de resultados negativos; no recomendado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luisbrel/jimmy-4b-zero-regression
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Framework MLX: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
