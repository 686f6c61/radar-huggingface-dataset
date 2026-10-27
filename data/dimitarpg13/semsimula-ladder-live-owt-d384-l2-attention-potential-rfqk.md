# dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk

## Resumen

`semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk` es un modelo de lenguaje de 77,4 millones de parámetros desarrollado por el usuario `dimitarpg13` dentro de la familia de investigación SemSimula. No es un transformer: se presenta como un Fock-PARFLM, una arquitectura sin atención basada en un potencial escalar y en mecánica lagrangiana (modelo basado en energía), con un campo de intercambio conservativo, registros virtuales y un mecanismo de espacio de Fock. Se entrena desde cero sobre OpenWebText en inglés, con un presupuesto fijo de 532.480.000 tokens (32.500 pasos × batch 32 × bloque 512), idéntico al del resto de modelos de la escalera de ablaciones.

Su relevancia no es de producto sino metodológica: forma parte de un estudio pre-registrado de ablación de mecanismos ("ladder study") en el que cada variante cambia un único componente y comparte corpus, tokenizador, presupuesto de tokens y lotes de validación. Esta versión concreta (generación 3) incorpora un endurecimiento del routing del campo de intercambio mediante normalización QK (similitud coseno multiplicada por una escala logarítmica aprendida y recortada por cabeza) y un recorte de gradiente propio de 0,3 para los parámetros del campo.

El resultado declarado es una perplejidad de validación de 52,90 en OpenWebText a bloque 512, un 6,2 % peor que la variante `gpt2-matched` de la misma escalera (49,81, con 33,7 M de parámetros) y un 0,4 % mejor que la misma arquitectura sin el campo de intercambio, diferencia que el propio autor califica de ruido de evaluación. El modelo es un artefacto de investigación en inglés, sin ajuste por instrucciones, con licencia CC-BY-4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM: no transformer, sin atención, basada en potencial escalar y mecánica lagrangiana (energy-based); L=2 capas, d_model=384, campo de intercambio conservativo con routing QK normalizado |
| Parámetros totales | 77,4 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (bloque usado en entrenamiento y evaluación); no se documenta soporte para secuencias mayores |
| Tipos de cuantización | No disponible; solo se publican pesos PyTorch y no hay GGUF ni cuantizaciones publicadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (checkpoint nativo, requiere el código del autor); repositorio de 0,6 GB; no se indica safetensors |
| Dataset de entrenamiento | Skylion007/openwebtext (split de validación para evaluación) |
| Tokens de entrenamiento | 532.480.000 (32.500 pasos × 32 × 512) |
| Tokenizador | No disponible en la información proporcionada |
| Descargas / likes | 672 descargas, 0 likes |
| Fechas | Creado el 2026-10-06, actualizado el 2026-10-26 |

## Arquitectura y entrenamiento

La arquitectura se describe como un modelo de lenguaje conservativo en espacio de Fock ("Fock-PARFLM") con un campo de intercambio conservativo y un potencial escalar, construido explícitamente al margen del transformer y sin mecanismo de atención estándar. El modelo tiene 2 capas y anchura 384. Incorpora dos rutas de tipo atención: los registros virtuales (register path) y el campo de intercambio; el autor documenta que ambas rutas se sustituyen en gran medida entre sí (sin los registros, el mismo campo aporta una mejora del 6,0 %; con ellos, la aportación queda dentro del ruido). El modelo es causal: el monitor de fuga SCAF se declaró limpio en las siete auditorías (5k a 30k y 32,5k), con perturbación de futuro exactamente 0 y una tasa de fuga (leak tax) de prefijo de −1,4e-4 nats sobre los pesos finales.

El entrenamiento usa exclusivamente OpenWebText en inglés, con un presupuesto de tokens fijado de antemano e idéntico para todas las variantes de la escalera (532,48 M tokens), sin que ningún modelo se entrene más tiempo que otro. No se documenta RLHF, DPO ni ajuste por instrucciones: es un modelo base de predicción del siguiente token. La innovación técnica de esta versión son dos interruptores, desactivados por defecto y verificados como bit-idénticos al código de referencia cuando están apagados: (1) routing QK normalizado, donde queries y keys se normalizan en L2 de modo que cada score es un coseno multiplicado por una escala por cabeza σ = min(exp λ, 100) inicializada en 1/0,07, lo que añade ocho parámetros nuevos; y (2) un recorte de gradiente propio del campo (`RELAX_FIELD_CLIP = 0.3`). La motivación declarada es que las proyecciones de routing del modelo sin endurecer habían crecido entre 5 y 6 veces sin control. El run se ejecutó en una única sesión de Colab a 1,67 s/paso (unas 15 horas para los 32.500 pasos, cálculo derivado), sin watchdog ni picos, con un 1,4 % de pasos afectados por el recorte de gradiente (9 de 650 registrados, norma máxima 1,08, todos entre los pasos 19.700 y 26.000).

## Capacidades

- Generación de texto en inglés mediante predicción autoregresiva del siguiente token; es un modelo base, no ajustado por instrucciones.
- Modelado de lenguaje y estimación de perplejidad sobre OpenWebText (bloque 512), que es su métrica de referencia.
- Causalidad estricta verificada: sin acceso a tokens futuros (perturbación de futuro exactamente 0 en siete auditorías y en cinco puntos de corte sobre los pesos finales).
- Independencia de lote verificada (exactamente 0), relevante para reproducibilidad de experimentos.
- Soporte de tool calling / function calling: no documentado, no disponible.
- Soporte de agentes o razonamiento multi-paso: no documentado, no disponible.
- Capacidades multilingües: no; solo inglés.
- Visión, audio o modalidades adicionales: no disponibles.
- Modo "thinking" o razonamiento explícito: no disponible.
- Capacidad especial de investigación: ablación controlada de mecanismos (campo de intercambio, registros virtuales, mecanismo de Fock) con comparaciones entre variantes a presupuesto de tokens igualado.

## Casos de uso

- Investigación sobre alternativas al transformer: sirve como punto de comparación reproducible frente a arquitecturas sin atención, ya que comparte corpus, tokenizador y presupuesto de tokens con el resto de la escalera SemSimula, lo que permite aislar el efecto de un solo mecanismo.
- Ablación de componentes en modelos basados en energía: el modelo está diseñado para activar y desactivar rutas (campo de intercambio, normalización QK, registros virtuales) y comparar perplejidad resultante, algo útil para grupos que estudian campos conservativos o formulaciones lagrangianas.
- Reproducción de estudios pre-registrados: el autor congela predicciones antes del run (por ejemplo, PPL ≤ 52,1 y estabilidad del gradiente del campo), de modo que el modelo sirve como caso práctico de metodología pre-registrada en aprendizaje automático.
- Docencia y divulgación técnica: con 77,4 M de parámetros y un repositorio de 0,6 GB, se puede cargar y ejecutar en hardware muy modesto para ilustrar el funcionamiento de un LM no transformer y de un potencial escalar aprendido.
- Análisis de dinámica de entrenamiento: los registros de norma de gradiente global (de 0,44 a 0,87 en la fase de learning rate constante y 0,71 en el decaimiento) y de tasa de recorte permiten estudiar estabilidad de optimización en arquitecturas no convencionales.
- Verificación de causalidad y fugas de información: el monitor SCAF y las pruebas de perturbación de futuro se pueden reutilizar como banco de pruebas para auditar implementaciones propias.
- Generación de texto en inglés con requisitos de calidad bajos o experimentales (por ejemplo, material sintético para pruebas de pipelines), siempre teniendo en cuenta la perplejidad de 52,90 y la ausencia de ajuste por instrucciones.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`). No hay resultados de MMLU, HumanEval, GSM8K ni otras tareas de razonamiento o código en la información disponible.

| Métrica | Dataset | Valor |
|---|---|---|
| Perplejidad de validación (bloque 512, "settled") | OpenWebText, split validation | 52,90 |
| Evaluaciones individuales del promedio | OpenWebText, split validation | 52,83 / 53,05 / 52,81 |
| Mejor perplejidad registrada | OpenWebText, split validation | 50,97 (paso 31.000) |
| Perplejidad final | OpenWebText, split validation | 52,81 |
| Perplejidad en el paso 3.000 | OpenWebText, split validation | 113,52 |
| Ruido entre evaluaciones consecutivas | OpenWebText, split validation | ±2 PPL aprox. |

| Comparación interna (misma escalera, mismo presupuesto de tokens) | Perplejidad | Diferencia frente a este modelo | Parámetros |
|---|---:|---:|---:|
| Este modelo (L=2, con endurecimiento QK) | 52,90 | — | 77,4 M |
| `semsimula-ladder-live-owt-d384-l2-none` (L=2, sin campo de intercambio) | 53,12 | −0,4 % | 76,8 M |
| `semsimula-ladder-live-owt-d384-l4-none` (L=4, sin campo de intercambio) | 50,10 | +5,6 % | 76,8 M |
| `semsimula-ladder-live-owt-d384-l2-attention-potential` (sin endurecer) | 54,21 | −2,4 % | 77,4 M |
| `semsimula-ladder-live-owt-d384-l2-none-norc` (solo conservativo) | 57,76 | −8,4 % | 76,6 M |
| `semsimula-ladder-owt-d384-l2-gpt2-matched` (L=8, referencia igualada a GPT-2) | 49,81 | +6,2 % | 33,7 M |

El autor normaliza frente a GPT-2 con un factor de 1,062× para este modelo, pero no publica el valor absoluto de perplejidad de GPT-2 en la información disponible. Dos predicciones pre-registradas fallaron: la perplejidad objetivo (≤ 52,1) y la estabilidad del gradiente del campo dentro de ±25 % de su valor en el paso 5.000 (subió aproximadamente un 90 %, de 0,43 a 0,82, impulsado por la proyección de valor W_v, que la normalización QK no toca).

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado del número de parámetros, no publicado por el autor): ~0,31 GB en fp32, ~0,16 GB en fp16/bf16, ~0,08 GB en int8 y ~0,04 GB en int4 para los pesos; a bloque 512 y lote pequeño, las activaciones añaden unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU con 2-4 GB de VRAM es suficiente (GTX 1650, RTX 3050/3060/4060, T4). No se requiere A100 ni H100; el modelo se entrenó en una única sesión de Colab.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada reciente e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al no ser un transformer con arquitectura estándar, no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI; el despliegue requiere cargar los pesos con PyTorch y el código del autor (`library_name: pytorch`).
- Latencia y throughput de inferencia: no disponibles. El único dato de rendimiento es de entrenamiento: 1,67 s/paso con lote 32 × 512 en una sesión de Colab.
- Almacenamiento: repositorio de 0,6 GB.

## Comparativa con modelos similares

No se dispone de datos de terceros en la información proporcionada; la comparación se limita a las variantes de la misma escalera de ablaciones, que son los modelos realmente comparables por corpus, tokenizador y presupuesto.

| Modelo | Parámetros | Contexto | Perplejidad (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Este modelo (L=2, QK normalizado) | 77,4 M | 512 | 52,90 | CC-BY-4.0 | HuggingFace, PyTorch |
| `...-l2-attention-potential` (sin endurecer) | 77,4 M | 512 | 54,21 | CC-BY-4.0 | HuggingFace, PyTorch |
| `...-l2-none` (sin campo de intercambio) | 76,8 M | 512 | 53,12 | CC-BY-4.0 | HuggingFace, PyTorch |
| `...-l4-none` (L=4) | 76,8 M | 512 | 50,10 | CC-BY-4.0 | HuggingFace, PyTorch |
| `...-l2-none-norc` (solo conservativo) | 76,6 M | 512 | 57,76 | CC-BY-4.0 | HuggingFace, PyTorch |
| `...-l2-gpt2-matched` (L=8) | 33,7 M | 512 | 49,81 | CC-BY-4.0 | HuggingFace, PyTorch |

Frente a GPT-2 solo se dispone del factor de normalización publicado por el autor (1,062× para este modelo, 1,000× para la variante `gpt2-matched`); no se incluye el valor absoluto de GPT-2 en la información disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción: no está ajustado por instrucciones ni alineado, y no se documenta RLHF, DPO ni filtrado de seguridad.
- Calidad de texto limitada: una perplejidad de 52,90 en OpenWebText a bloque 512 implica una capacidad predictiva muy por debajo de modelos actuales del mismo orden de parámetros.
- Contexto corto: 512 tokens, sin evidencia de generalización a secuencias mayores.
- Monolingüe: solo inglés; no hay soporte declarado de castellano ni de otros idiomas.
- El propio autor concluye que el campo de intercambio endurecido "no añade nada medible" (0,4 % de mejora, dentro del ruido), por lo que no debe esperarse una ventaja funcional de esta variante frente a las vecinas.
- Las dos predicciones pre-registradas fallaron, lo que indica que el comportamiento del entrenamiento no se ajusta por completo al modelo teórico esperado.
- Benchmarks autoinformados y marcados como `verified: false`; solo existe perplejidad, sin evaluaciones de razonamiento, código, matemáticas ni sesgos.
- Riesgo de alucinación y de texto incoherente: es un modelo base pequeño entrenado sobre web; no hay evaluación de fidelidad factual.
- Reproducibilidad dependiente del código: al no haber safetensors ni soporte en frameworks estándar, cargar los pesos exige el código del autor y su versión concreta.
- Licencia CC-BY-4.0: permite uso comercial con atribución obligatoria; conviene revisar los términos de OpenWebText como corpus de origen.
- No hay informe de sesgos, filtros de contenido ni análisis de toxicidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk
- Modelo sin endurecer (L=2, `attention_potential`): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Variante sin campo de intercambio (L=2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Variante sin campo de intercambio (L=4): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l4-none
- Variante solo conservativa: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Variante con el campo y sin lectura de registros: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk-norc
- Referencia igualada a GPT-2 (L=8): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3 (escalera de gradientes vivos): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
