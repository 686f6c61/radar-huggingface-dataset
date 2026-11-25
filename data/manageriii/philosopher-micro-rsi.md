# Manageriii/philosopher-micro-rsi

## Resumen

Philosopher Micro-RSI es un prototipo de investigación publicado por el usuario Manageriii en Hugging Face. No es un modelo de lenguaje entrenado para uso general, sino un *seed checkpoint* de 1.521.659 parámetros (5,8 MB) junto con una arquitectura PyTorch escrita desde cero, pensada como punto de partida reproducible para experimentar con mecanismos de atención lineal, difusión por bloques y autoaprendizaje verificado. El autor lo describe explícitamente como una base "hackeable" para escalar en anchura, cabezas y datos, no como un asistente conversacional.

La arquitectura combina seis ideas en un único grafo entrenable: seguimiento de estado dual mediante *Wreath-KDA* (atención lineal de coste O(N) con cajas de intercambio de permutaciones firmadas y relojes modulares de 2D), puertas de escritura y direccionamiento con zona muerta del 5 %, un codificador causal asimétrico con pesos compartidos y escalado de variedad mHC, embeddings composicionales SuperBPE + CoBPE con memoria de 2-gramas tipo *Engram*, un decodificador de difusión por bloques en cuatro pasadas con bloqueo de confianza y un bucle de autojuego determinista *Challenger–Solver*.

Su relevancia es fundamentalmente metodológica: ofrece un banco de pruebas pequeño (cabe en una GPU de consumo o en un Apple Silicon) para validar ideas de arquitectura subcuadrática y decodificación paralela antes de invertir en preentrenamientos mayores. El checkpoint fue entrenado en un portátil Apple M4 Pro de 24 GB durante diez sesiones de autoaprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal Wreath-KDA, codificador causal con pesos compartidos y decodificador de difusión por bloques |
| Parametros totales | 1.521.659 (5,8 MB en disco) |
| Parametros activos | No aplica (no es MoE; incluye bloques enrutados Top-2 internos, sin datos de parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados; el código soporta chunk_c=64 para BF16 y chunk_c=4 para FP8 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`brain.pt`) |

## Arquitectura y entrenamiento

El núcleo es un transformer causal con atención lineal de la familia DeltaNet modificada (*Wreath-KDA*). El seguimiento de estado se realiza con cajas de intercambio de 8×8 con entradas en {-1, 0, +1} (alineadas con la variedad de Stiefel L_4) y con relojes modulares 2D de 30° sobre el círculo unitario; ambos se reajustan únicamente en los límites de chunk de C tokens, de modo que la deriva por redondeo en BF16 o FP8 se reinicia a cero. El codificador es asimétrico y comparte pesos: tres bloques `RecursiveEncoderKDAGroup` se reutilizan a lo largo de 19 capas semánticas (6 + 6 + 7) con embeddings de profundidad aprendidos y escalado de variedad de 1/sqrt(19). La representación de tokens se factoriza en embeddings base y modificador (SuperBPE + CoBPE) más un banco de búsqueda de 2-gramas de coste O(1).

La decodificación es un esquema de difusión por bloques en cuatro pasadas que desruidifica 40 supertokens (28 de `<think>` y 12 de `<ans>`) en paralelo, de grueso a fino, con residuales de profundidad `AttnRes`, un `Stable LatentMoE` y bloqueo progresivo de anclas de confianza; cuatro bloques especializados enrutados Top-2 cubren las tareas `Invention`, `CodeState`, `LogicSAT` y `AITheory`. El entrenamiento del checkpoint se realizó desde cero en un Apple M4 Pro de 24 GB mediante diez sesiones de autojuego determinista con un verificador en sandbox sin fugas (`rsi_engine.py`, `sandbox_verifier.py`), que produjo 623 soluciones verificadas sobre benchmarks procedurales congelados. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de alcance muy limitado: el propio autor indica que no es un modelo de chat de propósito general.
- Resolución de tareas procedurales de tres niveles de dificultad mediante el bucle de autojuego verificado.
- Decodificación paralela por bloques con modo de "pensamiento" explícito (`<think>`) separado de la respuesta (`<ans>`).
- Enrutamiento Top-2 a cuatro especialistas de tarea (invención, estado de código, lógica SAT y teoría de IA).
- Memoria de 2-gramas tipo Engram para composición de tokens.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en arquitecturas subcuadráticas: sirve para validar atención lineal Wreath-KDA y medir deriva numérica en BF16/FP8 antes de escalar a modelos mayores.
- Docencia y formación: su tamaño de 1,52 M de parámetros permite inspeccionar y modificar el grafo completo en minutos en una GPU de consumo o en un Mac con Apple Silicon.
- Prototipado de decodificación por difusión: el decodificador de cuatro pasadas con bloqueo de confianza se puede aislar para estudiar latencia y calidad frente a decodificación autorregresiva.
- Investigación en autoaprendizaje verificado: el bucle Challenger–Solver con verificador en sandbox permite experimentar con entrenamiento por autojuego sin fugas de información.
- Ablación de componentes: al ser un único archivo (`philosopher/brain.py`), facilita activar y desactivar módulos (puertas de zona muerta, relojes modulares, Engram) y medir su impacto.
- Base para preentrenamiento a escala: el constructor permite subir a 50 M, 300 M o 1 B+ parámetros ajustando `d_model`, `n_heads` y el vocabulario, reutilizando el mismo esqueleto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el examen procedural congelado `vault/fixed_exam.json`, comparando el checkpoint inicial (S0) con el estado tras diez sesiones de autojuego (`brain.pt`):

| Metrica | S0 (inicial) | Tras 10 sesiones |
|---|---|---|
| Parametros / tamano | 1.521.659 (5,8 MB) | 1.521.659 (5,8 MB) |
| Nivel 1, exactitud exacta | 20,0 % | 40,0 % |
| Nivel 2, exactitud exacta | 10,0 % | 14,4 % |
| Nivel 3, exactitud exacta | 4,4 % | 3,3 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el checkpoint de 5,8 MB en FP32, incluyendo estados de activación del decodificador.
- GPU recomendadas: cualquier GPU con al menos 8 GB; el autor lo entrenó en un Apple M4 Pro de 24 GB.
- Cabe en GPU de consumo: sí, en cualquier RTX 30/40, Apple Silicon o incluso CPU para inferencia del seed.
- Opciones de despliegue: el autor solo documenta PyTorch nativo (`philosopher/brain.py`, `brain.pt`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Philosopher Micro-RSI | 1,52 M | No disponible | Atención lineal + difusión por bloques + autojuego | MIT | Hugging Face + GitHub |
| GPT-2 small (referencia del autor) | 124 M | 1.024 tokens | Transformer autorregresivo clásico | MIT | Hugging Face |
| Mamba-130M | 130 M | No disponible | SSM selectivo | Apache 2.0 | Hugging Face |
| RWKV-169M | 169 M | No disponible | Atención lineal recurrente | Apache 2.0 | Hugging Face |

La comparación es únicamente estructural: Philosopher Micro-RSI es dos órdenes de magnitud menor que los modelos de referencia y no está entrenado para lenguaje natural, por lo que no procede comparar rendimiento en tareas de NLP.

## Limitaciones y advertencias

- No es un modelo de chat ni de propósito general; el autor lo declara explícitamente como un seed arquitectónico.
- Exactitud muy baja en el nivel 3 del benchmark propio (3,3 % tras el autojuego, inferior al 4,4 % inicial), lo que sugiere inestabilidad o sobreajuste en tareas complejas.
- El entrenamiento se realizó en un único portátil durante diez sesiones; no hay evidencia de escalado a corpus de lenguaje natural.
- Riesgo elevado de alucinación si se usa fuera de su dominio procedural; no se han publicado evaluaciones de sesgo.
- Idiomas soportados no documentados; el vocabulario base es de 16.384 tokens sin BPE publicado.
- La licencia MIT permite uso comercial, pero el modelo no ofrece garantías de calidad para producción.
- La arquitectura depende de detalles de implementación (chunk_c, FP8, relojes modulares) que pueden degradar resultados si se modifican sin validación.

## Enlaces

- Hugging Face: https://huggingface.co/Manageriii/philosopher-micro-rsi
- Repositorio principal y playground: https://github.com/Manageriii/philosopher-micro-rsi
- Pruebas teóricas y suite de extrapolación 682× (Dual-Gear Wreath-DeltaNet): https://github.com/Manageriii/wreath-deltanet
