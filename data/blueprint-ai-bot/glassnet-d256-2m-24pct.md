# blueprint-ai-bot/glassnet-d256-2m-24pct

## Resumen

GlassNet es un modelo de lenguaje experimental desarrollado por blueprint-ai-bot, escrito íntegramente desde cero en NumPy, sin PyTorch, sin transformers, sin autograd y sin pesos preentrenados. Su interés no reside en el rendimiento, sino en la interpretabilidad radical: cada operación, cada derivada y cada neurona es auditable línea a línea. La arquitectura completa ocupa unas 7.000 líneas de código legible y se distribuye con pesos en formato safetensors estándar.

El checkpoint `glassnet-d256-2m-24pct` tiene 5.908.686 parámetros y una ventana de contexto de solo 32 tokens. Su arquitectura es un núcleo recurrente que transporta un vector de estado a través de las 32 posiciones (en lugar de atención), seguido de 256 neuronas conceptuales con nombre explícito («is_a_question», «mentions_self», etc.) y una capa de salida con pesos atados al embedding sobre un vocabulario de 12.002 tokens.

Es relevante ahora como herramienta de investigación y docencia: demuestra que es posible construir, entrenar y explicar un modelo de lenguaje completo sin dependencias de frameworks, con logs de entrenamiento publicados (incluidos los fallos) y una función `explain()` que reporta qué conceptos activaron una respuesta. El propio autor lo etiqueta como «not-for-production» y «early research», con una precisión de siguiente token del 24,20% en datos held-out.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer recurrente sin atención: núcleo recurrente con estado + 256 neuronas conceptuales + readout atado |
| Parámetros totales | 5.908.686 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Blueprint AI License 1.0 (no aprobada por OSI) |
| Formato de pesos | safetensors (con config.json y labels.json auxiliares) |
| Dimensión del modelo | 256 (d256) |
| Vocabulario | 12.002 tokens |
| Librería requerida | glassnet (implementación propia en NumPy + safetensors) |
| Dependencias | numpy, safetensors |

## Arquitectura y entrenamiento

GlassNet no usa atención en su forma estándar. El núcleo de cómputo es recurrente: mantiene un vector de estado que se actualiza secuencialmente a través de las 32 posiciones del contexto. Sobre ese estado opera una capa de 256 neuronas conceptuales, cada una con un nombre semántico y una definición medible, y finalmente una capa de salida («answer») con pesos atados a la matriz de embedding sobre el vocabulario de 12.002 tokens. El coste medido por etapa es: embedding 0,0053 ms/token, núcleo 0,0027 ms/token, conceptos 0,0008 ms/token y readout 0,0273 ms/token.

El modelo se entrena desde cero con backpropagation implementada a mano y un optimizador propio; no hay autograd ni pesos preentrenados. El autor publica los logs de todos los entrenamientos, incluidos los fallidos. Un experimento con un bloque de atención de una sola cabeza sin posiciones, residual ni normalización perdió 5,41 puntos (18,69% frente a 24,10%), y la propia arquitectura recurrente perdió frente a la forma plana en dos semillas (3,87/4,07 frente a 5,53/5,87) por un residual sin normalizar que saturaba el estado. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto a nivel de siguiente token, con gramática correcta pero contenido débil según el propio autor.
- Razonamiento limitado al contexto de 32 tokens: no sostiene conversaciones multi-turno ni párrafos.
- Aritmética: 0,0% de exactitud en operandos no vistos en tres implementaciones; una sonda por dígito muestra una regla parcial en formación (el dígito 0 alcanza el 100% en operandos no vistos).
- Interpretabilidad nativa: función `explain()` que imprime qué conceptos con nombre se activaron y cuánto empujaron la salida.
- Inspector en vivo (`lens/liveview.py`) que sirve pesos reales y activaciones de neuronas en el navegador en el puerto 8770.
- 256 neuronas conceptuales auditables contra definiciones medibles.
- Sin soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Multilingüe: solo inglés.

## Casos de uso

- Docencia de arquitecturas de lenguaje: el modelo completo son unas 7.000 líneas de NumPy legible, lo que permite recorrer forward pass, backward pass, optimizador y KV cache en una asignatura sin capas de abstracción.
- Investigación en interpretabilidad mecanística: las 256 neuronas conceptuales con nombre y la función `explain()` permiten estudiar cómo se forma una regla (por ejemplo, el caso del dígito 0) y auditar cada activación contra su definición.
- Verificación de gradientes y depuración de implementaciones: `docs/ARCHITECTURE.md` incluye todas las derivadas escritas a mano y un chequeo de gradientes por operación (9/9 PASS, error absoluto máximo 7,5e-10), útil como referencia para quien implemente backprop desde cero.
- Reproducibilidad de experimentos fallidos: los logs publicados de los entrenamientos que perdieron frente a la línea base permiten estudiar modos de fallo concretos (residual sin normalizar, atención sin posiciones) en un entorno de 5,9M de parámetros y coste mínimo.
- Prototipado de interfaces de inspección de modelos: el inspector en vivo en el puerto 8770 sirve como base para construir visualizadores de activaciones sobre pesos reales, no simulados.
- Evaluación de licencias no OSI en entornos académicos: sirve para estudiar las implicaciones prácticas de una licencia con umbral de facturación (gratuita por debajo de 1.000.000 USD de ingresos anuales) en proyectos de investigación.

## Benchmarks y rendimiento

| Checkpoint | Precisión held-out (por posición) | Parámetros |
|---|---:|---:|
| `glassnet-d512-ext6-37pct` | 37,37% (28,57% con la métrica heredada por id) | 15.567.566 |
| `glassnet-d256-2m-24pct` | 24,20% | 5.908.686 |

Resultados de ablación publicados por el autor:

| Experimento | Resultado |
|---|---|
| Bloque de atención de una sola cabeza sin posiciones, residual ni normalización | 18,69% frente a 24,10% (pierde 5,41 puntos) |
| Arquitectura recurrente propia frente a forma plana, semilla 1 | 3,87 frente a 5,53 |
| Arquitectura recurrente propia frente a forma plana, semilla 2 | 4,07 frente a 5,87 |
| Aritmética en operandos no vistos | 0,0% exacto (tres implementaciones) |
| Sonda por dígito, dígito 0 en operandos no vistos | 100% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precisión completa (5,9M parámetros). Cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta en CPU con NumPy. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobradamente suficiente.
- Cabe en consumer GPU: sí, en todas, y también en Raspberry Pi y entornos sin GPU.
- Opciones de despliegue: la librería propia `glassnet` con `numpy` y `safetensors`; el inspector en vivo (`lens/liveview.py`) en el puerto 8770. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, porque no existe implementación en transformers.
- Latencia y throughput: coste medido por token de 0,0053 ms (embedding) + 0,0027 ms (núcleo) + 0,0008 ms (conceptos) + 0,0273 ms (readout) = 0,0361 ms/token en el entorno de medida del autor, lo que equivale a unos 27.700 tokens/s en ese hardware no especificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión siguiente token | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| GlassNet d256-2m-24pct | 5,9M | 32 tokens | 24,20% held-out | Blueprint AI License 1.0 (no OSI) | Hugging Face + GitHub |
| GlassNet d512-ext6-37pct | 15,6M | 32 tokens (según model card de la familia) | 37,37% held-out | Blueprint AI License 1.0 (no OSI) | Hugging Face + GitHub |
| GPT-2 small | 124M | 1.024 tokens | no disponible en esta ficha | MIT | Hugging Face, transformers |
| TinyLlama 1.1B | 1,1B | 2.048 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers |

La comparación con GPT-2 small y TinyLlama es solo orientativa por tamaño y propósito general: GlassNet no compite en calidad de generación, sino en transparencia total del código y de las activaciones. No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente etiquetado como «not-for-production» y «early research» por el autor.
- Contexto de solo 32 tokens: no admite conversaciones multi-turno ni párrafos; no es un parámetro configurable.
- Precisión de siguiente token del 24,20%: la gramática es correcta pero el contenido es débil.
- Aritmética en operandos no vistos: 0,0% de exactitud.
- Solo inglés.
- No existe implementación en transformers: no se puede cargar con `AutoModel.from_pretrained`; requiere la librería propia y NumPy.
- Licencia no aprobada por OSI: gratuita para individuos, estudiantes, educadores, investigadores y uso no comercial, y para organizaciones con ingresos anuales inferiores a 1.000.000 USD; por encima se exige licencia comercial con un 1% de reparto de ingresos. El uso dañino no está licenciado.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a un modelo de 5,9M de parámetros con 24% de precisión.
- Sesgos conocidos: no documentados en la información disponible.
- Sin soporte de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blueprint-ai-bot/glassnet-d256-2m-24pct
- Repositorio de código, tests y resultados: https://github.com/blueprint-ai-hq-git/glassnet
- Licencia: https://github.com/blueprint-ai-hq-git/glassnet/blob/main/LICENSE
- Estado y porcentajes honestos: `STATUS.md` en el repositorio
- Cómo probar el modelo y reportar métricas: `docs/TESTING.md` en el repositorio
- Arquitectura y derivadas: `docs/ARCHITECTURE.md` en el repositorio
- Contacto: blueprintai.help1@gmail.com
