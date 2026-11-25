# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi-pm16-pmx16-sr2-fob

## Resumen

semsimula-ladder-live-owt-d384-l2-none-norc-nophi-pm16-pmx16-sr2-fob es un modelo de lenguaje de investigación desarrollado por el autor independiente dimitarpg13 dentro de la familia "semsimula". Se trata de un modelo de lenguaje conservativo (conservative language model) construido sobre mecánica lagrangiana y un potencial escalar, sin atención ni arquitectura transformer, entrenado desde cero sobre OpenWebText. El identificador codifica su configuración: 384 dimensiones de modelo, 2 capas, 16 "pozos" de modo Poisson (pm16/pmx16), flujo de primer orden (fob) y ausencia de fuerza de pares (nophi), de canal inverso (norc) y de ruta de registros.

La relevancia de este modelo es fundamentalmente metodológica: forma parte de un estudio escalonado ("ladder study") pre-registrado en el que el autor formula predicciones antes de entrenar y las contrasta después. En este caso, el modelo demuestra que entrenar sin la fuerza de pares V_φ produce un modelo ligeramente mejor (perplejidad 53,39 frente a 53,73 de su gemelo con fuerza de pares) con el mismo presupuesto de cómputo, datos y semilla, lo que constituye una ablación de mecanismo controlada.

Con 76.440.514 parámetros entrenables y 532.480.000 tokens de entrenamiento, es un modelo pequeño pensado para investigación sobre arquitecturas alternativas, no para producción. Su licencia CC-BY-4.0 permite uso comercial con atribución, pero su naturaleza experimental y su rendimiento (por encima de GPT-2 en perplejidad) lo sitúan como objeto de estudio más que como herramienta desplegable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo basado en mecánica lagrangiana y potencial escalar anisotrópico gaussiano; sin atención (attention-free), no transformer, flujo de primer orden |
| Parametros totales | 76.440.514 (entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (pytorch); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo pertenece a la tercera generación ("Gen 3") de la familia semsimula y se describe como un modelo conservativo puro: un flujo de gradiente de primer orden en el que no existe velocidad en ningún punto, y los pozos de potencial y los modos rígidos de V_θ se relajan de forma exacta mediante un integrador exacto. Emplea 16 pozos de modo Poisson (Poisson-mode wells) y un potencial gaussiano anisotrópico. Los tokens se comunican entre sí únicamente a través de cinco canales de contexto enrutados por contenido (ξ), sin red de score, sin enrutamiento top-k y sin potencial de pares. La formulación geométrica se apoya en geometría riemanniana (geodésicas riemannianas, métrica de Jacobi). El integrador utilizado es BAOAB, con mecanismo de "live gradients".

El entrenamiento se realizó desde cero sobre OpenWebText (Skylion007/openwebtext), con un presupuesto exacto de 532.480.000 tokens (32.500 pasos × 32 × 512), el mismo corpus, tokenizador y lotes de validación que el resto de modelos de la tabla comparativa. Se usó la misma semilla y planificación que su gemelo FO-b-PMX-K16, lo que permite una comparación emparejada. La innovación destacable es la ablación de mecanismo: eliminar la fuerza de pares V_φ durante el entrenamiento (no solo en inferencia) reduce el número de parámetros en 137.803 y mejora la perplejidad un 0,63 %. El entrenamiento consumió 17,5 GB de memoria pico (24,6 GB con evaluación) a 0,974 s por paso, sin pasos omitidos ni picos de gradiente problemáticos.

## Capacidades

- Generación de texto en inglés, entrenado sobre OpenWebText.
- Modelado de lenguaje autoregresivo con perplejidad de validación de 53,39 en bloques de 512 tokens.
- Razonamiento y conocimiento factual limitados por su tamaño (76 M de parámetros) y su corpus de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: ninguna de visión, audio ni modo "thinking"; su interés es exclusivamente arquitectónico y de investigación.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como referencia reproducible para estudiar modelos conservativos sin atención, con código y configuración documentados en la colección del autor.
- Ablaciones de mecanismo controladas: su diseño emparejado (misma semilla, datos y presupuesto que FO-b-PMX-K16) permite aislar el efecto de componentes concretos, como la fuerza de pares o los pozos de potencial.
- Estudio de modelos basados en energía y mecánica lagrangiana: útil para grupos que investigan energy-based models o dinámicas físicas aplicadas al lenguaje.
- Reproducción de experimentos pre-registrados: el autor documenta predicciones y resultados (FN1-FN4), lo que lo convierte en material didáctico sobre metodología científica en ML.
- Benchmark de integradores numéricos (BAOAB, integrador exacto) en dinámicas de gradiente aplicadas a texto: permite medir estabilidad y coste por paso en un entorno controlado.
- Docencia y divulgación: por su tamaño reducido (0,9 GB de repo) y su documentación detallada, es adecuado para explicar conceptos de geometría riemanniana y potenciales aplicados a modelos de lenguaje.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre OpenWebText, split de validación, perplejidad en bloque 512 ("settled", media de las tres últimas evaluaciones de 500 pasos):

| Modelo | Orden | Fuerza de pares | Parámetros | Perplejidad | vs GPT-2 |
|---|---|---:|---:|---:|---:|
| **Este modelo (FO-b-PMX-K16-NP)** | primero | ninguna | 76.440.514 | **53,39** | 1,072× |
| FO-b-PMX-K16 | primero | entrenado con ella | 76.578.318 | 53,73 | 1,079× |
| PMX-K16 | segundo | entrenado con ella | 76.578.318 | 54,24 | 1,089× |
| SR2-NP (sin pozos) | segundo | ninguna | 76.434.307 | 58,51 | 1,175× |
| gpt2-matched | — | — | — | 49,81 | 1,000× |

Mejor perplejidad observada: 51,53 en el paso 31.000. La predicción pre-registrada FN1 (asentarse por debajo de 54,80) se cumplió con 53,39.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 76 M de parámetros en fp32 el peso ronda los 0,3 GB, por lo que cabría holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM sería suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo moderno (RTX 3060 o superior) dada la escala del modelo.
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor reporta 0,974 s por paso de entrenamiento, no inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Este modelo** | 76.440.514 | no disponible | 53,39 | CC-BY-4.0 | Hugging Face |
| FO-b-PMX-K16 | 76.578.318 | no disponible | 53,73 | CC-BY-4.0 | Hugging Face |
| PMX-K16 | 76.578.318 | no disponible | 54,24 | CC-BY-4.0 | Hugging Face |
| SR2-NP | 76.434.307 | no disponible | 58,51 | CC-BY-4.0 | Hugging Face |
| gpt2-matched | no disponible | no disponible | 49,81 | no disponible | Hugging Face |

La comparación relevante es interna a la familia semsimula, ya que no se han identificado modelos externos directamente comparables con esta formulación conservativa.

## Limitaciones y advertencias

- Modelo puramente de investigación: sin descargas ni validación externa (0 descargas, 0 likes en el momento de la ficha); los resultados no están verificados ("verified: false").
- Rendimiento por debajo de GPT-2 en perplejidad (1,072× peor), lo que limita su utilidad práctica para generación de texto de calidad.
- Solo inglés; sin capacidades multilingües.
- Riesgo elevado de alucinación y de generar texto incoherente por su tamaño reducido y su corpus limitado.
- No se documentan sesgos específicos, pero OpenWebText hereda los sesgos de los textos web de los que procede.
- Longitud de contexto no especificada; la evaluación se realizó en bloques de 512 tokens, por lo que no hay garantías más allá de esa ventana.
- Sin soporte documentado de tool calling, agentes ni despliegue en servidores de inferencia estándar (vLLM, TGI, llama.cpp).
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está pensado ni validado para producción.
- La naturaleza experimental del integrador y del potencial implica que la reproducibilidad depende del código del autor, no de una implementación estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-nophi-pm16-pmx16-sr2-fob
- Modelo padre FO-b-PMX-K16: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- Colección Gen 3 (ladder con live gradients): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Colección primer vs segundo orden: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Nota de la etapa 3e (setup y scoring): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/productization/Stage3e_FO_b_PMX_K16_Without_Pair_Force.md
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
