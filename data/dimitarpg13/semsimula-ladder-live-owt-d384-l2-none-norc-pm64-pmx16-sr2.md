# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2

## Resumen

El modelo `semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2` es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13, perteneciente a la familia SemSimula, que propone una arquitectura alternativa a los transformers basada en mecánica lagrangiana y potenciales escalares conservativos. Se trata de un modelo de tercera generación (Gen 3) dentro de un estudio escalonado ("ladder study") pre-registrado, en el que cada iteración aísla un mecanismo concreto y se compara con la base anterior bajo un presupuesto de cómputo idéntico.

La innovación principal de esta variante es la incorporación de "registros de modo Poisson" (Poisson-mode registers): 64 modos compartidos que los tokens van poblando a su paso, cada uno modelado como un pozo gaussiano cuya profundidad crece con su ocupación, de forma que el contexto temprano profundiza los pozos en los que caen los tokens posteriores. Además, los pozos se integran de forma exacta dentro del flujo amortiguado de la base SR2, manteniendo la propiedad de que toda fuerza es un gradiente de un potencial escalar.

El modelo es relevante como pieza de investigación sobre arquitecturas no-transformer, sin atención y con memoria constante en inferencia, no como un modelo de producción. Con 76,6M de parámetros y un presupuesto de entrenamiento de 532,48 millones de tokens, se sitúa deliberadamente por debajo de la ratio compute-optimal (aproximadamente 7 tokens por parámetro), por lo que sus resultados deben interpretarse como los de un modelo infraentrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No-transformer, sin atención, basada en mecánica lagrangiana conservativa con potencial escalar, integrador exacto amortiguado (BAOAB) y registros de modo Poisson (64 modos) |
| Parametros totales | 76,6M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (pytorch); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura abandona el mecanismo de atención y el bloque transformer convencional. Cada capa se formula como un sistema dinámico conservativo: la fuerza que actúa sobre cada token es el gradiente de un potencial escalar (Vθ), y la integración temporal se realiza mediante un esquema BAOAB con modos rígidos amortiguados tratados de forma exacta. Sobre esa base (SR2), esta variante añade 64 registros de modo Poisson: cada modo tiene un centro μ, una anchura κ, una probabilidad de supervivencia λ por token y una profundidad por capa. La ocupación que ve cada token es una cuenta decreciente sobre los tokens estrictamente anteriores, lo que garantiza que, a contexto fijo, la fuerza de cada token sigue siendo un gradiente exacto.

La integración de los pozos es el punto técnico central. Con pozos explícitos (PM1) el paso explícito consumía hasta el 94% del paso en la capa 1 y provocaba fallos de refinamiento. PMX congela la cuadrática de los pozos al inicio de cada paso y la incorpora al flujo amortiguado exacto: la rigidez resultante (fuerza más curvatura isótropa α más la parte de rango de los 16 pozos más fuertes del token) forma un resorte en las 384 direcciones, que es indefinido y se diagonaliza mediante una resolución de autovalores de ancho 32, integrando cada modo como oscilador amortiguado exacto o movimiento hiperbólico exacto. El paso explícito restante en la capa 1 baja de 0,94 a 0,288.

El entrenamiento utilizó OpenWebText (split de validación para evaluación) con 32.500 pasos × 32 × 512 = 532.480.000 tokens, el mismo presupuesto, corpus, tokenizador y lotes de validación que el resto de modelos de la tabla comparativa. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés, con un objetivo de modelado de lenguaje (perplejidad) como métrica principal.
- Inferencia con memoria constante respecto a la longitud de contexto, al no emplear atención.
- Modelado de dependencias de contexto largo mediante los registros de modo Poisson, donde la ocupación decae con probabilidad λ por token.
- Propiedad de conservatividad verificada sobre los pesos entrenados: cada fuerza es el gradiente de un potencial escalar.
- Integración exacta de modos rígidos y pozos, lo que estabiliza el paso de integración.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo "thinking".
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como punto de comparación controlado dentro de un ladder pre-registrado, permitiendo aislar el efecto de los registros de modo Poisson frente a la base SR2 sin pozos.
- Estudio de modelos de energía y potenciales escalares: al ser completamente conservativo, permite analizar la dinámica de la representación como un sistema físico, útil para trabajos teóricos sobre energía y gradientes.
- Experimentos de inferencia con memoria constante: adecuado para investigar límites de contexto en arquitecturas sin atención, donde el coste de memoria no crece con la longitud de secuencia.
- Reproducción de estudios de ablación: el autor publica la cadena completa de modelos (F3.1, SR2, PM1, PMX, Fock-PARFLM), lo que facilita replicar comparativas con presupuesto de tokens idéntico.
- Docencia y divulgación sobre mecánica lagrangiana aplicada a aprendizaje automático: la formulación (BAOAB, potenciales gaussianos, procesos de inmigración-muerte de Poisson) es un caso didáctico concreto.
- Evaluación de estabilidad numérica de integradores: el modelo documenta salud de entrenamiento (0 activaciones de watchdog, 0 picos, norma de gradiente global superior a 1,0 en 15 de 490 pasos registrados, máximo 1,50), útil para estudiar integradores rígidos.
- No se recomienda su uso en aplicaciones de producción de texto, atención al cliente o generación de código, dado su carácter de investigación y su infraentrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) sobre OpenWebText, split de validación, perplejidad en bloque 512, media de las tres últimas evaluaciones de 500 pasos:

| Modelo | Perplejidad (settled) | Diferencia frente a este modelo | Ratio frente a GPT-2 |
|---|---:|---:|---:|
| **Este modelo (PMX)** | **54,63** | — | **1,097×** |
| SR2 (misma base sin registros) | 58,32 | -6,3% | 1,171× |
| F3.1 (conservativo con paso dividido) | 57,76 | -5,4% | 1,160× |
| PM1 (registros con pozos explícitos sobre F3.1, no publicado) | 55,17 | -1,0% | 1,108× |
| Fock-PARFLM, L=2, gradientes vivos (no conservativo) | 53,12 | +2,8% | 1,066× |
| gpt2-matched (brazo de referencia) | 49,81 | +9,7% | 1,000× |

Notas del autor: la perplejidad "settled" es la media de las tres últimas evaluaciones (56,07; 54,61; 53,21), con mejor valor de 53,15 en el paso 30.500. Los registros aportan un 6,3% sobre la base de flujo exacto. El coste es de 2,98 s por paso frente a 1,72 s de SR2 en una A100, debido a una resolución de autovalores por lotes de ancho 32 por token y capa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 76,6M de parámetros y pesos en FP32, el modelo ocupa aproximadamente 0,3 GB, y el repositorio completo pesa 0,6 GB.
- GPU recomendadas: el autor reporta entrenamiento en A100; para inferencia, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente, aunque no se documentan requisitos oficiales.
- GPU de consumo: por tamaño, cabe holgadamente en tarjetas consumer (RTX 3060, RTX 4060, RTX 4090), si bien no hay datos publicados de latencia o throughput en estas.
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer es probable que estos motores no lo soporten sin adaptación.
- Latencia y throughput: no disponibles para inferencia; el único dato de coste es el entrenamiento (2,98 s por paso en A100).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OWT val, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo (PMX) | 76,6M | no disponible | 54,63 | CC BY 4.0 | Hugging Face |
| SR2 (misma familia, sin registros) | no disponible | no disponible | 58,32 | no disponible | Hugging Face |
| F3.1 (misma familia, conservativo) | no disponible | no disponible | 57,76 | no disponible | Hugging Face |
| Fock-PARFLM L=2 (no conservativo) | no disponible | no disponible | 53,12 | no disponible | Hugging Face |
| gpt2-matched (referencia) | no disponible | no disponible | 49,81 | no disponible | Hugging Face |

La comparativa se limita a la propia familia SemSimula y al brazo de referencia gpt2-matched, ya que no se proporcionan datos de modelos externos comparables en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción.
- Infraentrenado por diseño: 532,48M de tokens para 76,6M de parámetros, aproximadamente 7 tokens por parámetro, un tercio de la ratio compute-optimal.
- Solo inglés; no se documenta soporte multilingüe.
- No se documentan sesgos conocidos, pero al entrenarse sobre OpenWebText hereda los sesgos y la distribución de ese corpus.
- Riesgo de alucinación: no evaluado en la información disponible; la métrica reportada es únicamente perplejidad.
- Bajo el criterio pre-registrado del autor, este modelo no es "refinement-ready"; SR2 sí lo es.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el carácter experimental del modelo desaconseja su uso en producción.
- La integración exacta de los pozos introduce un coste computacional notable (2,98 s por paso frente a 1,72 s de SR2 en A100).
- La formulación es conservativa y lineal en la ocupación, por lo que no captura fluctuaciones bosónicas, solo su media.
- No se documenta soporte en motores de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), lo que puede dificultar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Modelo base SR2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Modelo F3.1: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Modelo Fock-PARFLM L=2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Brazo de referencia gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
