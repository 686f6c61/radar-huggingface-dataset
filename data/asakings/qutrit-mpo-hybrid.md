# asakings/qutrit-mpo-hybrid

## Resumen

Qutrit-MPO Hybrid es un modelo de lenguaje a nivel de byte desarrollado por el usuario asakings (samwel403234) que combina tres ideas de eficiencia en un único sistema entrenable: pesos ternarios comprimidos mediante proyecciones de operadores de producto matricial (MPO), un rastreador de estado inspirado en la computación cuántica basado en matrices de densidad de qutrits (sistemas de tres niveles) y una memoria jerárquica con atención sobre ranuras de resumen. El modelo se publica como prueba de arquitectura con solo 154 000 parámetros, entrenado en una única ejecución de 8,5 horas sobre una GPU T4 de Kaggle.

No es un modelo de frontera ni está pensado para uso en producción: su relevancia radica en que documenta de forma reproducible una arquitectura alternativa a los transformers densos, con resultados medidos y artefactos verificables. El autor incluye un análisis honesto de un fallo de inicialización que mantuvo las ramas MPO muertas en las dos primeras ejecuciones, y demuestra que corregirlo (de desviación típica 0,025 a 0,30) redujo la perplejidad por byte de 30,67 a 6,32.

El modelo opera a nivel de byte (sin tokenizador), lo que simplifica el preprocesamiento y permite cubrir cualquier idioma en teoría, aunque no se han publicado evaluaciones multilingües. La licencia es una licencia de investigación propia del autor (`qutrit-mpo-research-license`), no una licencia open source estándar, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida personalizada: GRU a nivel de token + ranuras de memoria jerárquica con atención + proyecciones MPO ternarias + rastreador de estado cuántico (matriz de densidad de qutrit) |
| Parámetros totales | 154 000 (154K) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el autor menciona "curriculum context" en la telemetría, sin cifra concreta) |
| Tipos de cuantización | Ternaria nativa (2 bits, valores −1/0/+1); export empaquetado de 2 bits verificado |
| Idiomas soportados | No disponible (modelo a nivel de byte, sin evaluación multilingüe publicada) |
| Licencia | `qutrit-mpo-research-license` (licencia de investigación propia, no estándar) |
| Formato de pesos | Checkpoints PyTorch (`.pt`): FP32 master (636 KB), ternario empaquetado (613 KB), estudiante destilado (3,5× más pequeño) |
| Librería | custom (implementación de referencia propia, `hybrid_model.py`) |
| Pipeline | text-generation |
| Datos de entrenamiento | 906 MB de FineWeb-Edu (`sample-10BT`), nivel de byte, split determinista por hash de documento |

## Arquitectura y entrenamiento

La arquitectura combina cuatro componentes. En primer lugar, pesos ternarios con cuantización de paso directo (straight-through) a valores −1/0/+1, con escala y umbral aprendidos y pesos maestros en FP32 conservados durante el entrenamiento; el checkpoint empaquetado de 2 bits se verificó con un error máximo de logits de 0,0 tras la recarga. En segundo lugar, las proyecciones densas se factorizan como núcleos MPO de dos sitios con puertas de rango de enlace aprendidas, logrando una compresión de núcleos de 4,6 a 5,3 veces medida y poda automática de enlaces inútiles.

En tercer lugar, un rastreador de estado cuántico mantiene una matriz de densidad compleja de 3×3 que evoluciona en cada paso temporal mediante una unitaria aprendida (red de fase diagonal de Fourier), con desfase y renormalización de traza; añade un estado recurrente de coste O(1) por secuencia. Por último, la memoria jerárquica combina una GRU rápida a nivel de token con ranuras de resumen a nivel de fragmento, recuperación por atención y un código de memoria redundante con decodificación de mediana, evitando la atención cuadrática.

El entrenamiento se realizó en 5 000 pasos sobre 906 MB de datos, con un objetivo de destilación de cuatro señales (KL directa enmascarada por confianza, KL inversa, entropía cruzada dura y alineación de estados ocultos mediante hooks), junto con aprendizaje continuo basado en consolidación de pesos elástica (EWC). El autor documenta un fallo de inicialización: con desviación típica 0,025, todos los pesos MPO se cuantizaban a cero al nacer (umbral relativo ≈0,263), dejando las ramas estructuralmente muertas; corregirlo a 0,30 activó el 100 % de la maquinaria ternaria-MPO.

## Capacidades

- Generación de texto a nivel de byte: produce prosa en inglés coherente tras la corrección del fallo de inicialización.
- Modelado de lenguaje autorregresivo con métricas de perplejidad por byte y precisión de siguiente byte.
- Rastreo de estado cuántico interno con dinámica medible (pureza media 0,92, coherencia máxima 0,33 en 192 pasos temporales).
- Aprendizaje continuo con transferencia positiva entre dominios (ciencia frente a general).
- Destilación de conocimiento hacia un estudiante 3,5 veces más pequeño.
- Exportación a formato ternario empaquetado de 2 bits con pérdida de logits nula.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe teórica por el enfoque a nivel de byte, pero sin evaluación publicada.

## Casos de uso

- Investigación en arquitecturas eficientes: sirve como banco de pruebas reproducible para estudiar cuantización ternaria, factorización MPO y estados recurrentes alternativos a la atención, con código de referencia y todos los informes de resultados incluidos.
- Estudio de aprendizaje continuo: el motor incorpora EWC y documenta una transferencia positiva medida (Δ de olvido = −0,154 NLL) en un cambio de dominio real, útil para experimentos de ajuste secuencial sin olvido catastrófico.
- Validación de técnicas de destilación: el objetivo de cuatro señales y el estudiante destilado permiten reproducir y comparar estrategias de destilación en un entorno de bajo coste (una sola GPU T4).
- Docencia y divulgación: su tamaño (154K parámetros) y su ejecución en 8,5 horas de Kaggle lo hacen adecuado para ilustrar conceptos de cuantización, MPO y estados cuánticos simulados en cursos o talleres.
- Prueba de concepto de exportación ternaria: el formato empaquetado de 2 bits con error de logits nulo puede servir para experimentar con pipelines de compresión de pesos en modelos pequeños.
- Investigación en representaciones inspiradas en cuántica: la matriz de densidad de qutrit con pureza y entropía medibles permite estudiar si estos estados aportan ventaja frente a estados recurrentes clásicos en tareas controladas.
- Reproducibilidad de benchmarks a nivel de byte: el protocolo de evaluación por verosimilitud de opciones (estilo lm-eval-harness) sobre MMLU, ARC-C, HellaSwag, PIQA y WinoGrande queda documentado y es reutilizable como línea base.

## Benchmarks y rendimiento

Resultados publicados por el autor (evaluación zero-shot a nivel de byte, puntuación por verosimilitud de opciones):

| Benchmark | Qutrit-MPO Hybrid (154K) | Referencia citada por el autor |
|---|---|---|
| MMLU | 27,6 | GPT-4: 86,4; Gemma 2 9B: 71,3 |
| ARC-C | 26,5 | No disponible |
| HellaSwag | 28,0 | No disponible |
| PIQA | 55,2 | No disponible |
| WinoGrande | 51,7 | No disponible |
| HumanEval pass@1 | 0/80 (ejecutado en sandbox) | No disponible |

Métricas internas del modelo:

| Métrica | Valor |
|---|---|
| NLL de test (nats/byte) | 1,844 |
| Perplejidad por byte (bpp) | 6,32 |
| Precisión de siguiente byte | 47,8 % |
| Brecha frente a GRU con igual número de parámetros | +0,08 NLL |
| Pureza media del estado cuántico | 0,92 |
| Error máximo de logits tras recarga ternaria empaquetada | 0,0 |
| Olvido en aprendizaje continuo (Δ NLL) | −0,154 (transferencia positiva) |

El propio autor señala que estos resultados están en o por encima del azar en los cinco benchmarks de opción múltiple y que el valor entregable es el protocolo y el suelo medido, no el rendimiento absoluto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint FP32 ocupa 636 KB y el ternario empaquetado 613 KB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; el entrenamiento se realizó en una T4 de Kaggle (16 GB) durante 8,5 horas.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales y en hardware integrado.
- Opciones de despliegue: la librería es `custom`, con implementación de referencia en `hybrid_model.py`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la telemetría de la ejecución incluye tokens/s por paso, pero no se ha publicado una cifra agregada de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qutrit-MPO Hybrid | 154K | No disponible | 27,6 | `qutrit-mpo-research-license` (investigación) | Hugging Face, repo de 0,0 GB |
| GRU con igual número de parámetros (línea base del autor) | 154K (aprox.) | No disponible | No disponible | No disponible | Referencia interna del autor |
| Gemma 2 9B (referencia citada por el autor) | 9B | No disponible en la información | 71,3 | No disponible en la información | No disponible en la información |
| GPT-4 (referencia citada por el autor) | No disponible | No disponible | 86,4 | Propietaria | API |

La comparación con Gemma 2 9B y GPT-4 solo refleja las cifras de MMLU citadas por el autor como contexto de escala; no son alternativas funcionales para las mismas tareas. El competidor real es la línea base GRU con igual número de parámetros, frente a la que el modelo queda a 0,08 NLL.

## Limitaciones y advertencias

- Modelo de 154K parámetros: no es apto para producción ni para tareas de razonamiento, código o conocimiento factual; el propio autor lo califica de prueba de arquitectura.
- HumanEval pass@1 de 0/80: el código está fuera de distribución (NLL de código 2,93 frente a 1,61 en prosa).
- Riesgo elevado de alucinación y generación incoherente fuera de dominios similares a FineWeb-Edu.
- Idiomas: sin evaluación multilingüe publicada; el enfoque a nivel de byte no garantiza calidad fuera del inglés.
- Longitud de contexto no documentada; la memoria jerárquica evita atención cuadrática, pero no se especifica la ventana efectiva.
- Licencia `qutrit-mpo-research-license`: no es una licencia open source estándar y restringe el uso comercial; revisar los términos antes de cualquier despliegue.
- El autor declara explícitamente que no hay afirmaciones de ventaja cuántica: todo es simulación clásica con tensores complejos, sin hardware cuántico.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación externa por parte de la comunidad.
- El fallo de inicialización documentado (ramas MPO muertas al nacer) ilustra la sensibilidad de la arquitectura a hiperparámetros de inicialización; replicar el entrenamiento requiere usar la versión v4 del código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asakings/qutrit-mpo-hybrid
- Dataset de entrenamiento: https://huggingface.co/datasets/samwel403234/fineweb-edu-hybrid-corpus
- Notebook de reproducción completa (Kaggle): https://www.kaggle.com/code/samwel403234/full-hybrid-ai-training-v4-ternary-init
- FineWeb-Edu (origen del corpus): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
