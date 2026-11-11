# ProtonPrat/anlp-a3-hybrid_reversed

## Resumen

`ProtonPrat/anlp-a3-hybrid_reversed` es un modelo de investigación de muy pequeño tamaño (3.490.715 parámetros) publicado en Hugging Face. Se trata de un etiquetador causal a nivel de carácter ("causal character tagger") entrenado para una tarea de descifrado de cifrados ("cipher decryption") en el contexto de la asignación 3 del curso ANLP Monsoon 2026. No es un modelo de lenguaje de propósito general, sino un artefacto académico ligado a un repositorio de asignatura concreto.

La arquitectura combina capas de atención con capas de Mamba y de DeltaNet siguiendo el patrón `DMMDMM` (donde D = DeltaNet, M = Mamba y T = atención), con un ancho de modelo de 256. Esta hibridación de mecanismos de secuencia (atención cuadrática frente a modelos de espacio de estados lineales) es la innovación técnica del trabajo, aunque el modelo en sí es un experimento de escala muy reducida.

Su relevancia es limitada fuera del ámbito docente: las métricas reportadas son muy bajas (precisión por carácter de 0.1876 y por palabra de 0.0171 en validación), no hay model card detallada más allá de la información mínima, no se declara licencia, idiomas ni pipeline, y el modelo debe cargarse con una función específica del repositorio de la asignatura (`src.part1.checkpoint.load_checkpoint`), lo que lo hace poco portable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida causal con patrón de capas `DMMDMM` (DeltaNet, Mamba, atención), ancho 256 |
| Parámetros totales | 3.490.715 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors y pytorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, pytorch |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido causal a nivel de carácter. El patrón de capas `DMMDMM` alterna bloques de DeltaNet (D), Mamba (M) y atención (T), aunque en la model card solo se documenta la secuencia `DMMDMM` sin especificar cuántas capas de atención se incluyen ni en qué orden exacto se combinan los seis bloques. El ancho de modelo es 256, coherente con un total de 3,49 millones de parámetros.

El entrenamiento se realizó sobre un dataset denominado `data_new` de la asignación ANLP Monsoon 2026, orientado a descifrado de cifrados a nivel de carácter. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste fino supervisado. Tampoco se detalla la estrategia de tokenización (probablemente por carácter dado el planteamiento) ni hiperparámetros de entrenamiento. La única información de rendimiento es la precisión de validación (0,1876 por carácter y 0,0171 por palabra), que sugiere un ajuste deficiente o una tarea extremadamente difícil con el presupuesto de cómputo disponible.

## Capacidades

- Etiquetado causal a nivel de carácter para tareas de descifrado de cifrados.
- Generación de secuencias de etiquetas carácter a carácter (no generación de texto libre).
- Modelado de dependencias de secuencia mediante la combinación de DeltaNet, Mamba y atención.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Investigación académica sobre arquitecturas híbridas: el modelo sirve como banco de pruebas para comparar DeltaNet, Mamba y atención en una tarea de secuencia corta, aunque su escala limita la extrapolación de conclusiones.
- Reproducción de experimentos docentes: útil para estudiantes de ANLP Monsoon 2026 que necesiten cargar y evaluar el checkpoint con `src.part1.checkpoint.load_checkpoint` dentro del repositorio de la asignatura.
- Descifrado de cifrados simples a nivel de carácter en entornos controlados: el modelo está entrenado específicamente para esta tarea, aunque las métricas reportadas indican que su precisión práctica es muy baja.
- Estudio de patrones de capas híbridas: permite inspeccionar cómo se distribuyen los pesos entre bloques DeltaNet, Mamba y atención en una red de 3,49 M de parámetros.
- Baseline para comparaciones en publicaciones: puede citarse como referencia de un modelo híbrido de escala muy pequeña entrenado con recursos limitados.
- Docencia y formación: ejemplo didáctico de pipeline de entrenamiento con librería PyTorch y formato safetensors para modelos de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de validación específicas de la tarea:

| Métrica | Valor |
|---|---|
| Precisión por carácter (validación) | 0,1876 |
| Precisión por palabra (validación) | 0,0171 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (3,49 M de parámetros × 4 bytes ≈ 14 MB de pesos, más overhead de activaciones y runtime), por lo que cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La carga debe hacerse con `src.part1.checkpoint.load_checkpoint` del repositorio de la asignatura, lo que sugiere un formato de checkpoint específico no estándar.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia muy baja, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (etiquetadores causales híbridos de escala muy pequeña para descifrado) en la información proporcionada. Como referencia de escala, se puede comparar con modelos de lenguaje de tamaño similar, aunque la tarea es distinta:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ProtonPrat/anlp-a3-hybrid_reversed | 3,49 M | no disponible | no disponible | Hugging Face |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Métricas de validación muy bajas (0,1876 por carácter, 0,0171 por palabra), lo que indica un rendimiento pobre en la tarea objetivo.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribución.
- Sin idiomas declarados: no se puede garantizar cobertura lingüística alguna.
- Formato de checkpoint no estándar: requiere la función `load_checkpoint` del repositorio de la asignatura, lo que dificulta su uso fuera de ese contexto.
- Modelo de investigación sin model card detallada: faltan datos sobre dataset, hiperparámetros, tokenizador y proceso de entrenamiento.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- No apto para producción: su escala, métricas y falta de soporte lo desaconsejan para cualquier despliegue real.
- Posible sobreajuste o infraentrenamiento: la discrepancia entre precisión por carácter y por palabra sugiere dificultades para modelar dependencias de largo alcance.

## Enlaces

- Hugging Face: https://huggingface.co/ProtonPrat/anlp-a3-hybrid_reversed
- Repositorio de la asignatura (referenciado en la model card): no disponible como URL directa en la información proporcionada
- Paper, blog o demo: no disponibles
