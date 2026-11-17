# AtomixLabs/Pascal-15M-v1.0

## Resumen

Pascal-15M-v1.0 es un modelo de lenguaje causal compacto desarrollado por AtomixLabs, diseñado específicamente para la inducción de secuencias matemáticas y la generalización de patrones numéricos. A diferencia de los modelos de lenguaje convencionales, Pascal no genera texto natural ni código: su tarea es modelar las dinámicas de transición de series numéricas, identificando la regla matemática latente que gobierna un prefijo de secuencia y extrapolándola hacia delante. El modelo cuenta con 17.716.608 parámetros y fue preentrenado con aproximadamente 364 millones de tokens de secuencias numéricas estructuradas.

La arquitectura es un transformer decoder-only de tipo LLaMA, con 12 capas, dimensión oculta de 384 y 12 cabezas de atención (atención multi-cabeza completa, sin GQA). El aspecto más distintivo es su vocabulario de solo 32 tokens a nivel de dígito, que elimina los artefactos de tokenización BPE y preserva las relaciones de valor posicional, procesando números dígito a dígito o como fracciones racionales exactas (por ejemplo, `8/13`).

El modelo está pensado como un checkpoint base limpio para ajuste fino posterior en dominios numéricos específicos, como series temporales, regresión simbólica empírica, secuencias de ticks financieros o simulación de sistemas dinámicos. Su reducido tamaño y su bajo coste computacional lo hacen adecuado para experimentación e investigación en razonamiento algorítmico y matemático discreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo LLaMA (MHA, sin kernels CUDA personalizados) |
| Parametros totales | 17.716.608 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (`en`); el dominio efectivo es numerico y simbolico |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

Especificaciones estructurales adicionales: `vocab_size=32`, `hidden_size=384`, `intermediate_size=768` (expansion SwiGLU 2.0x), `num_hidden_layers=12`, `num_attention_heads=12` (dimension de cabeza 32), `num_key_value_heads=12`, `rope_theta=10000.0`.

## Arquitectura y entrenamiento

Pascal-15M-v1.0 emplea un transformer decoder-only estándar de la familia LLaMA, implementado enteramente con operaciones nativas de PyTorch y Hugging Face (`trust_remote_code=False`), sin mecanismos de atención no estándar ni dependencias de repositorios externos. La atención es multi-cabeza completa (12 cabezas de dimensión 32), con codificación posicional rotatoria RoPE de base 10000 y una ventana de contexto de 512 posiciones.

El entrenamiento se realizó sobre aproximadamente 364 millones de tokens de secuencias numéricas estructuradas de datos sintéticos. La innovación técnica central es la formulación de la tarea y el tokenizador: un vocabulario exacto y sin pérdida de 32 tokens que incluye dígitos (`0`-`9`), separadores y operadores (`,` delimitador, `-` signo, `.` decimal, `/` barra de fracción racional exacta) y tokens de control (`<bos>`, `<eos>`, `<pad>`, `<unk>` y slots de alineación reservados). Este diseño evita la agrupación arbitraria de dígitos propia de BPE y permite procesar números dígito a dígito o como ratios racionales exactos, eliminando errores de redondeo en coma flotante durante la evaluación de secuencias. El régimen de preentrenamiento busca proporcionar un sesgo inductivo para regresión simbólica de baja latencia, capturando leyes dinámicas latentes a partir de observaciones brutas. No se documentan detalles sobre RLHF, DPO ni composición exacta del dataset más allá de que son secuencias numéricas sintéticas.

## Capacidades

- Inducción de secuencias numéricas: identificación de progresiones elementales, progresiones polinómicas, ciclos modulares y aproximaciones racionales a partir de un prefijo.
- Convergentes racionales: manejo de fracciones exactas como `1, 1/2, 2/3, 3/5, 5/8,` → `8/13` (convergentes de Fibonacci hacia la proporción áurea).
- Flujos independientes intercalados: resolución de secuencias entrelazadas como `2, 10, 4, 20, 8, 30,` → `16`.
- Dinámicas de estado acopladas: extrapolación de osciladores con velocidad latente, por ejemplo `16, 20, 22, 22, 20, 16, 10,` → `2`.
- Aritmética y patrones de recurrencia estables fuera de la caja en tareas estándar de aritmética, polinomios y recurrencias.
- Modelado de dinámicas de transición numérica como base para regresión simbólica.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en lenguaje natural.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente como `en` y su dominio efectivo es numérico y simbólico.
- Capacidades especiales: predicción multi-token, formación con optimizador Muon y datos sintéticos (según los tags del repositorio).

## Casos de uso

- Modelado de series temporales y telemetría: ajuste fino sobre secuencias de métricas de sensores o monitorización de sistemas, aprovechando la ventana de 512 tokens y el sesgo inductivo hacia dinámicas latentes para predecir el siguiente valor discreto.
- Regresión simbólica empírica: adaptación del modelo a observaciones experimentales para predecir comportamientos dinámicos subyacentes, identificando órdenes de recurrencia y progresiones directamente desde cadenas de entrada.
- Secuencias de ticks financieros: modelado de niveles de precio discretos, variaciones de spread y ajustes de tipos tras un ajuste fino específico, beneficiándose del procesamiento dígito a dígito sin errores de redondeo.
- Simulación de sistemas dinámicos: especialización sobre cinemática, oscilaciones acopladas o transiciones orbitales, dado el comportamiento demostrado en osciladores con velocidad latente.
- Investigación en razonamiento algorítmico y matemática discreta: uso como checkpoint base limpio para experimentar con inducción de secuencias, ciclos modulares y aproximaciones racionales en entornos de bajo coste computacional.
- Generación de datos sintéticos numéricos: empleo del modelo para producir continuaciones de patrones que sirvan como material de entrenamiento o validación en pipelines de aumento de datos matemáticos.
- Educación y evaluación de aritmética de patrones: despliegue ligero para demostrar extrapolación de progresiones y convergentes racionales en herramientas interactivas, con parada controlada mediante `max_new_tokens` o `eos_token_id` configurado al delimitador `,`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (17,7 millones de parámetros en fp32 ≈ 71 MB de pesos, más activaciones y caché KV para 512 posiciones); el tamaño del repositorio es de 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo es viable en GPUs de consumo muy modestas. Para servir en lote, una GPU de clase T4 o superior es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (por ejemplo, GTX 1650, RTX 3050, RTX 4060) e incluso en CPU.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), text-generation-inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI más allá de las etiquetas del repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pascal-15M-v1.0 | 17,7 M | 512 tokens | Induccion de secuencias numericas | Apache 2.0 | Hugging Face |
| Alternativas de tamano comparable (SLM genericos) | No disponible | No disponible | Texto general | No disponible | No disponible |

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (modelos miniatura especializados en induccion de secuencias numericas y regresion simbolica).

## Limitaciones y advertencias

- No se entreno con supervision de `<eos>`: el modelo nunca emitira espontaneamente el token de fin de secuencia. En inferencia es obligatorio gestionar la parada explicitamente, ya sea con `eos_token_id` apuntando al delimitador `,` o con `max_new_tokens`.
- Ventana de contexto limitada a 512 posiciones, lo que restringe la longitud de las secuencias de entrada y el numero de pasos de extrapolacion.
- Dominio muy restringido: no genera lenguaje natural ni codigo; su uso fuera de secuencias numericas y simbolicas no es fiable.
- Riesgo de alucinacion: al ser un modelo de patrones, puede producir continuaciones plausibles pero incorrectas en secuencias ambiguas o con ruido, sin mecanismo de verificacion interno.
- Sesgos conocidos: no disponibles en la informacion proporcionada; el entrenamiento con datos sinteticos puede inducir distribuciones alejadas de datos reales de telemetria o mercados.
- Limitaciones de idioma: etiquetado solo como `en`; no se documenta soporte multilingue.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial con las obligaciones habituales de atribucion y ausencia de garantias; conviene revisar los terminos exactos del repositorio.
- Orientado a ajuste fino: el autor lo describe como checkpoint base para adaptacion posterior, no como modelo listo para produccion en tareas especificas.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que exige validacion propia antes de un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtomixLabs/Pascal-15M-v1.0
- Imagen del proyecto: https://cdn-uploads.huggingface.co/production/uploads/64b433c3faa3181a5e98c87c/YT6WHxvY-qNIoNK_PyebV.png

No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos adicionales.
