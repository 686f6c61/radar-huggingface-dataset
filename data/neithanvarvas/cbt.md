# Neithanvarvas/CBT

## Resumen

CBT (Character-Based Transformer) es un transformer a nivel de carácter de 18,95 millones de parámetros desarrollado por Neithan Vargas Vargas (Neithanvarvas / NeithanT), orientado a dos tareas muy concretas: suma por columnas con generalización de longitud y enrutado de herramientas (tool routing) con extracción de argumentos. Su tesis central es que asignar a cada token una coordenada bidimensional (p, τ) —columna macro y paso micro— y procesarla con Rotary Position Embeddings 2D desacoplados (2D-RoPE) permite extrapolar a longitudes de secuencia muy superiores a las vistas en entrenamiento, algo que los esquemas 1D clásicos no consiguen.

El modelo se entrena exclusivamente con sumas de 1 a 15 dígitos y diálogos multi-herramienta sintéticos, aplicando un enmascarado de desplazamiento de coordenadas (k = 32) que expone coordenadas de columna hasta p_max = 47. Con ese presupuesto, el checkpoint `champion_final.pt` alcanza un 98,8% (237/240) en sumas aleatorias con acarreos múltiples de 16 a 50 dígitos y un 100% (26/26) en enrutado de herramientas sobre plantillas vistas, con una ventana de contexto de 1024 tokens.

Su relevancia no es la de un modelo de propósito general, sino la de una pieza de investigación reproducible y de tamaño mínimo (repo de 0,1 GB) que demuestra empíricamente una técnica de generalización de longitud, con un estudio de control igualado frente a variantes 1D-RoPE y Ruoss et al. 2023 en el que estas últimas obtienen un 0,0% más allá de 15 dígitos. Es un artefacto para investigar, evaluar y desplegar en entornos con restricciones de memoria extremas, no un sustituto de un LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only a nivel de carácter con profundidad recurrente y pesos atados (Weight-Tied Recurrent Depth) |
| Parámetros totales | 18.946.560 (~18,95 M); 18.887.680 sin embeddings |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens de secuencia máxima (caché de coordenadas hasta 4096) |
| Tipos de cuantización | No disponible (no se publican pesos cuantizados; por tamaño, fp32/fp16/int8 son viables sin pérdida apreciable) |
| Idiomas soportados | Inglés (vocabulario restringido a ASCII) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`champion_final.pt`, `state_dict` cargado con `weights_only=True`); safetensors no disponible |
| Capas físicas (L) | 6 |
| Pasadas recurrentes (R) | 3 (profundidad efectiva de 18 capas) |
| Dimensión oculta (d_model) | 512 |
| Cabezas de atención (H) | 8 (dimensión por cabeza = 64) |
| Embedding posicional | 2D-RoPE desacoplado (d/2 columna macro p, d/2 paso micro τ; asignado por regla vía `compute_2d_coords`) |
| Enmascarado de desplazamiento (k) | k = 32 (p_max = 15 + 32 = 47 durante el entrenamiento con 1–15 dígitos) |
| Tamaño de vocabulario | 115 (14 etiquetas estructurales de control + 101 caracteres ASCII) |
| Atado de pesos | W_te == W_lm_head |
| Descargas en HuggingFace | 10 (1 like, en el momento de la consulta) |

## Arquitectura y entrenamiento

CBT es un decoder-only tipo GPT con dos modificaciones estructurales. La primera es el esquema posicional: en lugar de una posición escalar, cada token recibe una coordenada (p, τ) asignada por regla, donde p identifica la columna macro (la posición del dígito dentro de la suma) y τ el paso dentro de esa columna. El 2D-RoPE desacopla la rotación en dos mitades de la dimensión de cabeza (d/2 = 32 por eje), de forma que la atención puede razonar sobre la estructura de columnas de la aritmética en lugar de sobre un índice lineal. Durante el entrenamiento se aplica un enmascarado de desplazamiento con k = 32, que desplaza las coordenadas hasta p_max = 47 y expone al modelo a rangos de columna que no aparecen en los datos (1–15 dígitos), lo que constituye el mecanismo clave de la extrapolación.

La segunda modificación es la profundidad recurrente con pesos atados: 6 capas físicas se aplican R = 3 veces reutilizando los mismos parámetros, resultando en una profundidad efectiva de 18 capas con solo 6 conjuntos de pesos, lo que explica el reducido número de parámetros (18,95 M). El vocabulario de 115 tokens combina 101 caracteres ASCII con 14 etiquetas de control estructural, entre ellas los delimitadores de scratchpad `<THINK>`, que el modelo usa para escribir la suma columna a columna antes de emitir el resultado.

Los datos de entrenamiento son estrictamente sintéticos (`dataset: synthetic`): sumas de 1 a 15 dígitos por columnas y diálogos multi-herramienta sobre 9 esquemas de herramientas. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; la métrica declarada es accuracy sobre decodificación greedy. El paper asociado describe además un estudio de control igualado con 12.800 problemas aleatorios comparando cuatro variantes posicionales (1D-RoPE estándar, 1D-RoPE con offset, posiciones aleatorizadas de Ruoss et al. 2023 y 2D-RoPE desacoplado con k = 32) bajo el mismo dataset, T = 1024 y presupuesto de entrenamiento igualado.

## Capacidades

- Suma por columnas de precisión arbitraria: 100% (20/20) en sumas estructuradas de 16 a 50 dígitos, incluido el caso de acarreo en cascada de 50 dígitos (99…99 + 1), y 98,8% (237/240) en sumas aleatorias con acarreos múltiples de 16 a 50 dígitos.
- Razonamiento aritmético con scratchpad explícito: genera trazas `<THINK>` columna a columna, con 238/240 scratchpads exactos y cero errores de delimitador `(` en la suite agrupada de 16 a 50 dígitos.
- Generalización de longitud más allá de los datos de entrenamiento: 90,0% (18/20) a 55 dígitos, degradando a 45,0% a 60 dígitos, 6,7% a 70 dígitos y 0,0% entre 80 y 100 dígitos, en línea con el horizonte de coordenadas p_max = 47.
- Tool calling / function calling: enrutado de herramientas sobre 9 esquemas con 100% (26/26) en plantillas de fraseo compartidas con el entrenamiento y 88,9% (16/18) en selección zero-shot fuera de distribución.
- Extracción de argumentos a nivel de carácter: 96,2% (25/26) exacta en plantillas vistas y 50,0% (8/16) exacta en casos OOD correctamente enrutados (68,8% exacta o casi exacta).
- Procesamiento a nivel de carácter sobre ASCII: manipulación y copia literal de cadenas sin tokenizador BPE, lo que evita errores de segmentación en argumentos.
- No soporta: generación de texto libre, código, matemáticas simbólicas generales, visión, audio, ni capacidades multilingües (el vocabulario no cubre caracteres no ASCII).

## Casos de uso

- Verificación aritmética de alta precisión en pipelines financieros o científicos: el modelo resuelve sumas de hasta 50 dígitos con un 98,8% de exactitud y emite la traza `<THINK>` columna a columna, lo que permite auditar cada acarreo en lugar de aceptar un resultado opaco. Encaja como validador redundante frente a una librería de precisión arbitraria.
- Calculadora neuronal ligera en el edge: con 18,95 M de parámetros (unos 76 MB en fp32) puede ejecutarse en CPU o en microcontroladores con Linux, cubriendo la suma de columnas sin depender de red ni de GPU.
- Enrutado de herramientas en sistemas con presupuesto de memoria mínimo: los 9 esquemas entrenados y el 100% en plantillas vistas permiten usarlo como router determinista en asistentes embebidos o agentes con restricciones de RAM, delegando la generación de lenguaje a un modelo mayor.
- Extracción de argumentos carácter a carácter en formularios y DSL: al operar sobre ASCII sin BPE, copia literales (IDs, cadenas) con una fidelidad que los tokenizadores subword suelen romper; útil en plantillas de comandos o configuración donde la exactitud del literal es crítica.
- Reproducción y extensión de investigación sobre generalización de longitud: el repo incluye `interactive.py`, el checkpoint y el paper con el protocolo de evaluación, lo que permite replicar el estudio de control igualado 1D vs 2D-RoPE con 12.800 problemas y extenderlo a otras tareas algorítmicas.
- Evaluación de robustez de scratchpads: la métrica de scratchpads exactos (238/240) permite estudiar la fidelidad del razonamiento intermedio y detectar cuándo el modelo acierta la respuesta con una traza incorrecta.
- Generación de datos sintéticos de aritmética etiquetada: sirve como generador/verificador de pares suma–traza para entrenar o evaluar otros modelos en tareas de razonamiento aritmético paso a paso.
- Ablación de profundidad recurrente: al tener 6 capas físicas con R configurable, es un banco de pruebas barato para medir el efecto de la profundidad efectiva en tareas algorítmicas.

## Benchmarks y rendimiento

Resultados publicados en la model card, con decodificación greedy y intervalos de Wilson al 95%.

| Suite | Alcance | Resultado | IC 95% Wilson |
|---|---|---|---|
| Sumas 1–15 dígitos (in-distribution) | Visto en entrenamiento | 100,0% | No disponible |
| Extrapolación estructurada 16–50 dígitos | 20 casos (incl. 99…99 + 1) | 100,0% (20/20) | [83,9; 100,0]% |
| Barrido aleatorio multi-acarreo 16–40 dígitos | 6 longitudes × 30 casos (n = 180) | 100,0% (180/180) | [97,9; 100,0]% |
| Aleatorio multi-acarreo 45–50 dígitos (en p_max = 47) | 2 longitudes × 30 casos (n = 60; 58/60 `<THINK>` correctos) | 95,0% (57/60) | [86,3; 98,3]% |
| Agrupado aleatorio multi-acarreo 16–50 dígitos | 8 longitudes × 30 casos (n = 240; 238/240 `<THINK>` correctos) | 98,8% (237/240) | [96,4; 99,6]% |
| 55–100 dígitos (más allá del horizonte, p > 47) | 55d: 90,0% (18/20); 60d: 45,0% (9/20); 70d: 6,7%; 80–100d: 0,0% | Limitado por p_max = 47 | No disponible |
| Enrutado multi-herramienta (9 esquemas) | 26 casos con plantilla coincidente | 100,0% (26/26) | [87,1; 100,0]% |
| Extracción exacta de argumentos | 26 casos con plantilla coincidente | 96,2% (25/26) | [81,1; 99,3]% |
| Selección de herramienta OOD zero-shot | 18 prompts no vistos | 88,9% (16/18) | [67,2; 96,9]% |
| Copia exacta de argumentos OOD zero-shot | 16 prompts OOD correctamente enrutados | 50,0% (8/16) | [28,0; 72,0]% |

Estudio de control igualado (1–15 dígitos, T = 1024, 12.800 problemas aleatorios, 200 problemas por longitud hasta 100 dígitos):

| Variante posicional | Resultado 16–100 dígitos | Resultado destacado |
|---|---|---|
| 2D-RoPE desacoplado (k = 32), modelo igualado | 81,4% (977/1.200) en 16–40d, IC [79,1; 83,5]% | Hasta 92,0% a 16d y 25d |
| 1D-RoPE estándar | 0,0% (0/200), IC [0,0; 1,9]% | — |
| 1D-RoPE + offset | 0,0% (0/200), IC [0,0; 1,9]% | — |
| 1D-RoPE + posiciones aleatorizadas (Ruoss et al. 2023) | 0,0% (0/200), IC [0,0; 1,9]% | — |

No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no está entrenado para esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier precisión. Pesos en fp32 ≈ 75,8 MB; fp16 ≈ 37,9 MB; int8 ≈ 18,9 MB. A T = 1024 y d_model = 512, las activaciones y la caché KV son del orden de decenas de MB.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer sirve (RTX 3060, RTX 4090, T4, L4). A100/H100 solo tendrían sentido para entrenamiento o barridos masivos en paralelo.
- Cabe en GPU consumer: sí, en todas las GPU modernas con más de 1 GB de VRAM, y también en CPU. El repo completo ocupa 0,1 GB.
- Opciones de despliegue: PyTorch eager con el código del repositorio (`ScaledGPT`, `ScaledConfig`, `ScaledTokenizer` desde `model.py` y `tokenizer.py`) y la CLI `python interactive.py --ckpt champion_final.pt`. No hay integración documentada con vLLM, TGI, llama.cpp, Ollama ni transformers, al ser una arquitectura con 2D-RoPE y recurrencia personalizados; el despliegue requiere cargar el `state_dict` con `torch.load(..., weights_only=True)` y usar la tokenizadora propia.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, la inferencia en CPU es viable de forma interactiva, pero no se publican medidas de tokens/s.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a otros modelos open-weight de la misma categoría (transformers de menos de 100 M para tareas algorítmicas) en la información proporcionada. La comparación disponible es interna al paper, frente a variantes del mismo modelo con distintos esquemas posicionales, todas entrenadas con el mismo dataset 1–15 dígitos y T = 1024:

| Modelo | Esquema posicional | Parámetros | Contexto | 16–40 dígitos | 16–100 dígitos | Licencia |
|---|---|---|---|---|---|---|
| CBT (2D-RoPE desacoplado, k = 32) | 2D (p, τ) | 18,95 M (checkpoint campeón); variante de control igualada sin cifra publicada | 1024 | 81,4% (977/1.200) en la variante igualada | Degrada a partir de p_max = 47 | MIT |
| 1D-RoPE estándar | 1D | No disponible | 1024 | 0,0% | 0,0% (0/200) | No disponible |
| 1D-RoPE + offset | 1D | No disponible | 1024 | 0,0% | 0,0% (0/200) | No disponible |
| 1D-RoPE + posiciones aleatorizadas (Ruoss et al. 2023) | 1D aleatorizado | No disponible | 1024 | 0,0% | 0,0% (0/200) | No disponible |

Frente a LLM de propósito general de tamaño comparable (por ejemplo, modelos de 20–130 M de parámetros), CBT no es comparable en generación de lenguaje: su vocabulario ASCII de 115 tokens y su entrenamiento exclusivamente sintético lo limitan a aritmética por columnas y enrutado de herramientas.

## Limitaciones y advertencias

- Horizonte de coordenadas acotado: el rendimiento cae abruptamente más allá de p_max = 47. Con 55 dígitos baja al 90,0%, a 60 dígitos al 45,0%, a 70 dígitos al 6,7% y entre 80 y 100 dígitos es del 0,0%. No debe usarse como calculadora de precisión arbitraria sin validación externa.
- Generalización OOD débil en argumentos: la copia exacta de argumentos en prompts fuera de distribución cae al 50,0% (8/16), con un 68,8% exacta o casi exacta. En producción con frases no vistas, la extracción literal no es fiable sin plantillas cercanas al entrenamiento.
- Idiomas: solo inglés y solo ASCII (101 caracteres). No cubre acentos, eñes ni alfabetos no latinos, por lo que no es utilizable en castellano sin un preprocesado que translitere o normalice la entrada.
- Sin capacidades generales de lenguaje: no es un modelo conversacional ni de instrucciones; no genera texto libre, código ni respuestas abiertas. Su vocabulario de 115 tokens y su dataset sintético lo restringen a las dos tareas descritas.
- Riesgo de alucinación estructural: puede emitir una traza `<THINK>` incorrecta con resultado correcto o viceversa; 2 de 240 casos en la suite agrupada tuvieron scratchpad no exacto. Cualquier uso crítico debe validar tanto la traza como el resultado.
- Sesgos: no se documentan análisis de sesgo en la información disponible. Al entrenarse solo con datos sintéticos de sumas y herramientas, los sesgos sociales típicos no aplican, pero tampoco hay evaluación de robustez frente a entradas adversariales más allá de los conjuntos citados.
- Integración: los pesos están en `.pt` (no safetensors) y requieren el código del repositorio; no hay pipeline declarado en HuggingFace (`pipeline: no disponible`), ni soporte en vLLM, llama.cpp u Ollama. Cargar el checkpoint exige `weights_only=True` o confiar en el fichero.
- Ambigüedad de nombre: el acrónimo CBT se confunde habitualmente con terapia cognitivo-conductual (cognitive behavioral therapy), lo que contamina búsquedas y resultados; conviene referenciarlo como Character-Based Transformer.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantías. No hay cláusulas de uso aceptable específicas ni restricciones adicionales documentadas.
- Madurez: 10 descargas y 1 like en el momento de la consulta, con un único checkpoint publicado (`champion_final.pt`); no hay histórico de versiones ni suite de evaluación continua.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Neithanvarvas/CBT
- Repositorio GitHub: https://github.com/NeithanT/CBT
- README del repositorio: https://github.com/NeithanT/CBT/blob/main/README.md
- Paper de investigación (Markdown): https://github.com/NeithanT/CBT/blob/main/RESEARCH_PAPER.md
- Paper de investigación (PDF): https://github.com/NeithanT/CBT/blob/main/RESEARCH_PAPER.pdf
- Referencia citada en el estudio de control: Ruoss et al. 2023 (posiciones aleatorizadas), mencionada en la model card sin enlace directo disponible.
