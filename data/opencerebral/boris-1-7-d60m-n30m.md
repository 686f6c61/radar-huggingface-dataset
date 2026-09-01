# opencerebral/Boris-1.7-D60M-n30M

## Resumen

Boris-1.7-D60M-n30M es un transformer decoder-only denso de 60 millones de parámetros al que se le ha añadido una tabla de n-gramas de 30 millones de parámetros, insertada en el flujo residual después del segundo bloque. Lo desarrolla OpenCerebral, proyecto sucesor de New Millennium Artificial Intelligence, dentro del Klondike Software Project. El modelo responde a una pregunta experimental concreta: con un presupuesto fijo de 2.500 millones de tokens y una única GPU RTX 3060 de 12 GB, ¿aporta más una tabla de búsqueda de 30M de parámetros que 30M de peso denso adicional?

El tronco del modelo es deliberadamente convencional: 10 capas, dimensión 768, atención con GQA (4 cabezas KV), SwiGLU, RoPE y RMSNorm, con embeddings atados. La tabla n-grama, de 468.751 filas con rango 64 y una proyección a 768, se consulta con los últimos 2 y 3 token IDs mediante búsqueda exacta sin hashing, lo que añade un *gather* por posición sin multiplicaciones de matrices. El contexto es de 1.024 tokens y el vocabulario propio de 32.768 entradas con BPE a nivel de byte. El modelo se publica bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con tabla n-grama en el residual stream (bloque 2) |
| Parametros totales | 116.134.108 (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (entrenado y publicado en bf16) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), config.json, tokenizer.json; no compatible con transformers |

## Arquitectura y entrenamiento

El tronco denso es un transformer estándar de 10 capas con dimensión 768, 12 cabezas de atención y 4 cabezas KV (GQA), feed-forward SwiGLU de 1.920 unidades, RoPE, RMSNorm y embeddings atados. Los parámetros densos no relacionados con embeddings suman 59.981.568, y los embeddings atados 25.165.824. La innovación principal es la tabla n-grama: 468.751 filas de rango 64 más una proyección 64→768, que totaliza 30.049.216 parámetros. La tabla se indexa con los últimos 2 y 3 token IDs literales (281.250 filas de bigramas y 187.500 de trigramas, más una fila OOV compartida), construida con un script propio sobre el corpus. La búsqueda es exacta mediante `searchsorted`, sin hashing, y añade un *gather* por posición sin operaciones matriciales, por lo que el coste computacional por token apenas varía.

El entrenamiento consumió 2.500 millones de tokens: primero Ultra-FineWeb como cuerpo principal y, en el 15 % final, una fase de *annealing* con cosmopedia-v2 y fineweb-edu. Se usó un horario WSD (2 % de *warmup*, 85 % estable, decaimiento 1-sqrt), optimizador Muon para mapas lineales 2-D y AdamW para el resto, con bf16 y `torch.compile`. Se completaron 10.172 pasos con 245.760 tokens por paso en 22 horas y 37 minutos. La pérdida final de validación fue 3,235 (perplejidad 25,4, 1,0012 bits/carácter), con tasas de acierto de la tabla n-grama de aproximadamente 65 % en bigramas y 21 % en trigramas. El checkpoint es reanudable al byte, incluyendo estados del optimizador, cursor de datos y RNG.

## Capacidades

- Generación de texto en inglés con coherencia local limitada, propia de un modelo de 60M de parámetros.
- Razonamiento de sentido común básico, medible en tareas como PIQA (62,57) y ARC-Easy (45,88).
- Modelado de lenguaje con predicción de siguiente token, con una perplejidad de validación de 25,4.
- Sin soporte de *tool calling* ni *function calling*.
- Sin capacidades de agente ni razonamiento multi-paso estructurado.
- Sin capacidades multimodales (visión, audio).
- Sin modo *thinking* explícito.
- Monolingüe: solo inglés.

## Casos de uso

- Investigación en arquitecturas híbridas de búsqueda y densas: el modelo sirve como banco de pruebas para comparar el impacto de una tabla n-grama frente a peso denso adicional, con un protocolo de ablación ya definido (`--no-ngram`).
- Experimentos de ablación y análisis de componentes: permite medir cuantitativamente cuánto contribuye la tabla n-grama al rendimiento final en tareas de sentido común y modelado de lenguaje.
- Educación en NLP y arquitecturas de transformers: su tamaño reducido y su código de carga sencillo lo hacen adecuado para demostrar conceptos como GQA, RoPE, SwiGLU o embeddings atados en entornos docentes.
- Prototipado rápido en entornos con recursos limitados: al caber en menos de 1 GB de VRAM, puede ejecutarse en GPU de gama baja o incluso en CPU para pruebas de concepto de generación de texto corto.
- Generación de texto corto en inglés para aplicaciones de juguete o demos: con contexto de 1.024 tokens, es útil para completar frases o generar párrafos breves sin requisitos de calidad alta.
- Benchmarking de técnicas de entrenamiento: su horario WSD, el uso de Muon y el *annealing* final con datos sintéticos (cosmopedia-v2) pueden reproducirse y compararse con otras configuraciones en modelos de tamaño similar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados con el tokenizador propio del modelo y con el *harness* validado previamente contra los números publicados de GPT-Neo-125M. La columna "tabla ablacionada" corresponde a la inferencia sin la tabla n-grama, lo que mide cuánto depende el modelo entrenado de ella, no el rendimiento de un control denso puro.

| Tarea | Métrica | Modelo intacto | Tabla ablacionada | Δ |
|---|---|---|---|---|
| HellaSwag | acc_norm | 31,22 | 30,54 | −0,68 |
| ARC-Easy | acc_norm | 45,88 | 43,77 | −2,11 |
| ARC-Challenge | acc_norm | 26,02 | 22,95 | −3,07 |
| PIQA | acc_norm | 62,57 | 60,55 | −2,02 |
| WinoGrande | acc | 51,07 | 50,12 | −0,95 |
| LAMBADA | acc | 26,66 | 25,33 | −1,33 |
| Pérdida de validación | bits/char | 1,0012 | 1,0699 | +0,0687 |

Benchmarks adicionales, solo con la tabla intacta:

| Benchmark | Métrica | Resultado |
|---|---|---|
| ArithMark-3 | acc_norm | 36,1 ± 1,5 (aleatorio 25) |
| BananaMind Base Bench 1.1 | Elo | 1022 (54,3 % de precisión) |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bf16, dado que el repositorio completo pesa 0,5 GB y el modelo tiene 116M de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una RTX 3060 de 12 GB, por lo que esa GPU es suficiente para inferencia y fine-tuning ligero.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo (serie GTX 10xx en adelante con suficiente VRAM) e incluso en CPU para generación lenta.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un checkpoint de transformers. Solo se puede cargar con el `loader.py` incluido en el repositorio, que lee `config.json` y `model.safetensors`.
- Latencia y throughput: no disponible; el autor no publica mediciones de velocidad.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables en la información proporcionada. Como alternativas de la misma categoría (modelos densos de ~60-125M de parámetros) se pueden considerar GPT-Neo-125M, Pythia-70M y OPT-125M, pero no hay resultados publicados en esta ficha para comparar directamente. La diferencia estructural clave es que Boris-1.7 incorpora una tabla n-grama de 30M de parámetros, algo que no existe en esos modelos. En cuanto a licencia, Apache 2.0 es más permisiva que la de OPT (MIT) y similar a la de Pythia (Apache 2.0). El contexto de 1.024 tokens es inferior al de GPT-Neo (2.048) y Pythia (2.048).

## Limitaciones y advertencias

- Modelo monolingüe en inglés; no soporta otros idiomas.
- Contexto muy corto (1.024 tokens), inadecuado para tareas que requieran dependencias de largo alcance.
- No es un checkpoint de transformers: requiere el cargador personalizado del repositorio, lo que limita su integración con el ecosistema estándar de Hugging Face.
- Tamaño reducido: el rendimiento en tareas complejas (razonamiento, código, matemáticas) es muy limitado; los benchmarks muestran resultados bajos en ARC-Challenge (26,02) y LAMBADA (26,66).
- Riesgo de alucinación y de incoherencia en generaciones largas, típico de modelos pequeños.
- La tabla n-grama depende de la distribución del corpus de entrenamiento; su beneficio puede no generalizar a dominios fuera de los datos vistos.
- Sin capacidades multimodales ni de *tool calling*.
- El autor declara que el modelo es un experimento de una sola variable; no debe usarse en producción sin una evaluación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opencerebral/Boris-1.7-D60M-n30M
- Perfil de OpenCerebral en Hugging Face: https://huggingface.co/opencerebral
- Página del proyecto en GitHub (openCerebral-web): https://github.com/libreksp/opencerebral-web/blob/main/boris.html
- Publicación de avance de Boris-2: https://huggingface.co/posts/KlondikeDev/390696464529618
