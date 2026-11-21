# byjameson/lcga-p3-17m

## Resumen

lcga-p3-17m es un modelo de lenguaje de tipo decoder-only entrenado desde cero por el desarrollador independiente byjameson, con 17,31 millones de parámetros y una ventana de contexto de 512 tokens. Está entrenado exclusivamente sobre el corpus TinyStories con un tokenizador BPE propio de 8.192 entradas, y se distribuye como artefacto de investigación, no como asistente conversacional ni como modelo de propósito general. Forma parte de una familia de ejecuciones de control (a2, a3 y P3) que el autor compara entre sí para medir la evolución de la pérdida de validación en función del número de tokens vistos.

El modelo resuelve un problema muy acotado: servir como banco de pruebas reproducible para estudiar el entrenamiento de modelos minúsculos en hardware de consumo. Toda la ejecución de P3 se completó en unos 4,1 horas repartidas en cinco sesiones sobre una GPU de portátil con 6 GB de VRAM, manteniendo un uso constante de 5,90 GB. Es relevante ahora porque documenta con detalle ingeniería de bajo nivel (pérdida troceada en el `lm_head` para evitar desbordamientos de memoria en WDDM, checkpoints atómicos reanudables) y porque publica métricas normalizadas por byte (bpb) junto con la perplejidad, lo que permite comparaciones honestas entre ejecuciones del mismo tokenizador.

La arquitectura es un transformer denso con `dim=384`, 8 capas, 6 cabezas de atención, `mlp_hidden=1024`, `loops=1` y sin mezcla de expertos (`moe=0`). El checkpoint incluye pesos del modelo, configuración, paso y mejor pérdida de validación, y se carga mediante la clase `MiniLM` del paquete `lcsa`. No hay ajuste por instrucciones ni alineación por preferencias: es un modelo de continuación de texto en inglés, entrenado sobre un único dominio narrativo infantil.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (MiniLM de lcsa) |
| Parámetros totales | 17.308.032 (embeddings atados incluidos) |
| Parámetros activos | no aplica (no es MoE; `moe=0`) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (solo se distribuyen pesos PyTorch en fp32/estado nativo) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`p3_best.pt`, `torch.load` con `weights_only=False`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con vocabulario de 8.192 tokens (BPE propio, familia `ts`), dimensión de modelo 384, 8 capas, 6 cabezas de atención, capa MLP oculta de 1.024 y contexto de 512. La configuración incluye los campos `loops=1` y `moe=0`, es decir, sin recurrencia de bloques ni mezcla de expertos. Los embeddings de entrada y la proyección de salida están atados, lo que explica que los 17.308.032 parámetros incluyan ya esa matriz compartida.

El entrenamiento usó el flujo de tokens TinyStories (`ts`, BPE-8k) con un total de 466,76 millones de tokens en el split de entrenamiento. P3 vio 442,37 millones de tokens, aproximadamente 0,95 épocas, en 18.000 pasos con lotes de 48 secuencias de 512 tokens (24.576 tokens por paso). El tiempo por paso fue de 654–655 ms y el rendimiento de 37.373 tokens/s en la última sesión. La pérdida de validación final fue 1,3890, con perplejidad 4,011 y bpb de 0,4892 sobre los 19.218.350 bytes reales decodificados de `ts_valid`. No se menciona RLHF, DPO ni ajuste por instrucciones. La innovación técnica documentada es de ingeniería: trocear el cálculo de la pérdida del `lm_head` eliminó el desbordamiento de memoria del driver WDDM y estabilizó el paso en 5,90 GB, además de checkpoints de reanudación atómicos validados a lo largo de cinco sesiones.

## Capacidades

- Generación de texto en inglés a nivel de fragmento narrativo: produce historias cortas gramaticales y fluidas dentro del dominio TinyStories.
- Continuación de texto condicionada por prefijo, sin modo chat ni plantilla de instrucciones.
- Modelado de lenguaje puro: útil para calcular perplejidad y bpb sobre texto de estilo TinyStories.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés; no hay evidencia de transferencia a otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio de escalado en modelos minúsculos: sirve como punto de la curva P3 frente a los controles a2 (98,3M tokens) y a3 (196,6M tokens) para medir cómo decrece la pérdida de validación con más tokens vistos sobre el mismo tokenizador y dominio.
- Reproducción de experimentos en hardware de consumo: cabe en 5,90 GB de VRAM constantes, por lo que se puede reentrenar y evaluar en una GPU de portátil de 6 GB, útil para docencia y validación de pipelines de entrenamiento.
- Validación de tokenizadores BPE: al publicar bpb normalizado por byte real, permite comparar tokenizadores de distinto vocabulario sobre el mismo corpus sin que la métrica quede sesgada por la longitud de las secuencias.
- Generación de cuentos sintéticos para aumento de datos: puede producir fragmentos narrativos infantiles en inglés que sirvan como material de arranque para clasificadores o para probar pipelines de filtrado de calidad.
- Pruebas de infraestructura de inferencia: su tamaño reducido lo hace adecuado para verificar integraciones de `torch.load`, serialización de checkpoints y servidores de generación antes de escalar a modelos mayores.
- Investigación sobre repetición y cierre narrativo: el propio autor señala que el modelo es propenso a patrones repetitivos y débil en el cierre de historias, lo que lo convierte en un caso de estudio controlado de estos fallos a pequeña escala.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| `val_loss` @ paso 18.000 | 1,3890 |
| Perplejidad | 4,011 |
| bpb (normalizado por byte) | 0,4892 |
| Tokens vistos | 442,37M (~0,95 épocas de 466,76M) |
| Throughput | 37.373 tok/s |
| Tiempo por paso | 654–655 ms (lote 48 × 512) |
| VRAM | 5,90 GB constante |
| Tiempo total | ~4,1 h en 5 sesiones |

Comparación con las ejecuciones de control de la misma familia de tokenizador:

| Ejecución | Pasos | Tokens | `val_loss` | bpb |
|---|---:|---:|---:|---:|
| `a2_ctrl8k` | 6.000 | 98,3M | 1,6093 | 0,5612 |
| `a3_ctrl8k` | 12.000 | 196,6M | 1,5095 | 0,5264 |
| P3 (este checkpoint) | 18.000 | 442,4M | 1,3890 | 0,4892 |

Ganancia en bpb: −0,0372 (−7,1%) frente a a3 y −0,0720 (−12,8%) frente a a2. El autor advierte explícitamente de que las puntuaciones tipo ARC/MMLU estarían cerca del azar y no deben interpretarse como medida de capacidad; el eje justo de comparación es bpb/perplejidad en TinyStories retenido con este tokenizador.

## Requisitos de hardware

- VRAM de entrenamiento observada: 5,90 GB constantes con lote 48 × 512 y pérdida troceada en el `lm_head`.
- VRAM de inferencia estimada: no disponible en la información proporcionada; por el tamaño (17,3M parámetros) es muy inferior a la de entrenamiento.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB para reproducir el entrenamiento (el autor usó una GPU de portátil de 6 GB); para inferencia basta con hardware muy modesto, aunque no se publican cifras concretas.
- Cabe en GPU consumer: sí, según la evidencia de entrenamiento en 6 GB.
- Opciones de despliegue: carga nativa con PyTorch mediante `lcsa.mini_lm.MiniLM`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni existen pesos GGUF publicados.
- Latencia y throughput: 37.373 tok/s en entrenamiento (lote 48 × 512); no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| lcga-p3-17m | 17,3M | 512 | TinyStories (inglés) | MIT | PyTorch `.pt` |
| Controles a2/a3 del mismo autor | no disponible | 512 | TinyStories (inglés) | MIT (presumible, mismo repo) | PyTorch `.pt` |
| Otros modelos TinyStories de la comunidad | no disponible | no disponible | TinyStories (inglés) | variable | variable |

La comparación cuantitativa disponible se limita a las ejecuciones a2 y a3 del propio autor, ya recogidas en la tabla de benchmarks. No se dispone de datos de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no debe usarse para preguntas factuales ni como asistente.
- Propenso a repeticiones y débil en el cierre narrativo, limitación esperable a 17,3M parámetros y con dominio TinyStories.
- Contexto muy corto (512 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- Solo inglés; sin evidencia de capacidades multilingües.
- Riesgo de alucinación alto en cualquier uso fuera del dominio narrativo infantil; el autor lo desaconseja explícitamente para QA.
- Las métricas tipo ARC/MMLU estarían cerca del azar y no miden capacidad real en este modelo.
- La métrica bpb depende de la normalización por bytes reales de `ts_valid` y del efecto del conjunto de ventanas; el autor remite a `P3_RAPOR.md` §6 para la advertencia completa.
- Licencia MIT: permite uso comercial, pero el modelo no ofrece garantías de calidad para producción.
- La model card incluye direcciones de donación en criptomonedas; son voluntarias y no implican soporte ni influencia sobre resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byjameson/lcga-p3-17m
- Código, informes y evidencia: https://github.com/byjameson/lcga-local
- Informe P3 (en turco): https://github.com/byjameson/lcga-local/blob/main/P3_RAPOR.md
- Artículo de lanzamiento en dev.to: https://dev.to/mycute_97b39c4e34027570f9/running-a-4b-model-in-6-gb-and-training-3b-parameters-on-a-laptop-4al
