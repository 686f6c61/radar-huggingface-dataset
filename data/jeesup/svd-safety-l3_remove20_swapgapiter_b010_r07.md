# Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r07

## Resumen

svd-safety-l3_remove20_swapgapiter_b010_r07 es un checkpoint de investigación publicado por el usuario Jeesup que parte de meta-llama/Meta-Llama-3-8B-Instruct y le aplica dos transformaciones sucesivas: una compresión SVD-LLM que elimina el 20,02 % de los parámetros densos (fracción resultante 0,7998) y una edición posterior consistente en 7 de las 10 rondas previstas de un procedimiento iterativo de intercambio de parámetros neutro (parameter-neutral swap) guiado por la regla de selección gap_iter. El resultado es un transformer decoder-only de 8.030.261.248 parámetros, distribuido en safetensors dentro de un repositorio de 16,1 GB.

El objetivo declarado no es ofrecer un asistente conversacional, sino servir como artefacto experimental para cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué reglas de selección de componentes lo reparan mejor. La model card reporta una tasa de éxito de ataque (ASR) del 3,00 % en AdvBench y del 7,50 % en StrongREJECT, medidas con el juez HarmBench, junto con un sobre-rechazo macro del 18,80 % según WildGuard.

Su relevancia es metodológica: es una celda de un grid sobre reglas de selección y presupuestos de restauración, y la propia model card advierte que varias ramas del grid están deliberadamente degradadas en seguridad. Con 0 descargas y 0 likes, y bajo licencia Llama 3 Community, debe tratarse como sujeto de experimentación y no como modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), denso, con compresión SVD-LLM aplicada a las matrices de proyección |
| Parámetros totales | 8.030.261.248 (8,03 mil millones) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens, heredados del modelo base Llama-3-8B-Instruct; no se declara explícitamente en la model card |
| Tipos de cuantización | no se distribuyen pesos cuantizados; solo safetensors a 16 bits. No disponible GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Meta Llama 3 Community License (identificador `llama3`) |
| Formato de pesos | safetensors (librería `transformers`); repositorio de 16,1 GB |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Pipeline | text-generation |
| Fracción de parámetros densos resultante | 0,7998 |
| Presupuesto de restauración | 1,000 % de los parámetros densos (0,100 % por ronda) |
| Componentes restaurados / sustituidos | 6.741 / 6.741 |
| Parámetros insertados | 48.822.272 (0,70 % de los parámetros de proyección densos) |
| Semilla | 42 |
| Fecha de creación (según HuggingFace) | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3 8B Instruct: un transformer decoder-only con normalización RMSNorm, activaciones SwiGLU, RoPE y atención con grouped-query attention. Sobre esa base se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone en rango reducido las matrices de proyección y descarta componentes de bajo valor singular; en este checkpoint se han eliminado el 20,02 % de los parámetros densos. No hay, por tanto, un entrenamiento desde cero ni un ajuste supervisado nuevo en este artefacto: la model card no documenta ningún fine-tuning adicional.

La segunda fase es la edición iterativa: en cada ronda se seleccionan componentes mediante la regla `gap_iter` y se intercambian por valores insertados del modelo original (swap value `insert`, con desalojo ordenado por sigma), manteniendo neutro el número de parámetros. Se han aplicado 7 de las 10 rondas del run completo, con un chunk de 0,100 % de los parámetros densos por ronda y 48.822.272 parámetros intercambiados (0,70 % de los parámetros de proyección densos). El checkpoint resultante es, por tanto, un estado intermedio de un run más largo. La alineación conversacional heredada procede del modelo base de Meta, que según la documentación del fabricante se entrenó con más de 15 billones de tokens y se alineó con ajuste supervisado y RLHF (rejection sampling, DPO y PPO).

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base Llama-3-8B-Instruct.
- Razonamiento y respuesta multi-turno a nivel de 8B, sin mejoras específicas documentadas por el autor.
- Comportamiento de seguridad medible y cuantificado: ASR de 0,0300 en AdvBench y 0,0750 en StrongREJECT con juez HarmBench, y sobre-rechazo macro de 0,1880 según WildGuard.
- Comportamiento de rechazo evaluable: la métrica de sobre-rechazo permite analizar el equilibrio entre seguridad y utilidad.
- Soporte de tool calling / function calling: no documentado en esta ficha; se desconoce si la compresión y el swap preservan esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no disponibles (la model card no declara idiomas; no hay evaluación por idioma).
- Capacidades especiales (visión, audio, modo thinking): ninguna. Es un modelo exclusivamente de texto.
- Reproducibilidad experimental: semilla fija (42) y checkpoints intermedios de rondas, lo que permite replicar el estudio.

## Casos de uso

- Estudio de la degradación de seguridad por compresión: el checkpoint permite medir la ASR antes y después de eliminar el 20,02 % de los parámetros densos, usando AdvBench y StrongREJECT con juez HarmBench y protocolos idénticos a los del resto del grid.
- Comparación de reglas de selección de componentes: al ser la celda `gap_iter`, se compara directamente contra otras celdas del mismo grid (mismo presupuesto de 1,000 %, mismo seed 42) para aislar el efecto de la regla de selección.
- Auditoría de robustez frente a jailbreaks: con ASR de 0,0300 en AdvBench, sirve como sujeto de prueba para pipelines de red-teaming que necesiten un modelo con comportamiento de seguridad conocido y no trivial.
- Evaluación de sobre-rechazo y utilidad: la métrica de 0,1880 en WildGuard permite estudiar el coste en utilidad de las intervenciones de restauración en modelos comprimidos.
- Análisis de subespacios de pesos: los 6.741 componentes restaurados y los 48.822.272 parámetros insertados permiten estudiar qué matrices de proyección concentran el comportamiento de seguridad.
- Investigación sobre reparación post-compresión: sirve de referencia para desarrollar y validar métodos de recuperación de capacidades (swap paramétrico, destilación, ajuste ligero) sobre modelos comprimidos.
- Reproducibilidad metodológica: con semilla fija, presupuesto por ronda y checkpoint intermedio documentados, es adecuado para replicar experimentos y verificar resultados de compresión.
- Docencia e investigación en interpretabilidad: como ejemplo tangible de cómo una intervención de ~0,7 % de los parámetros de proyección modifica métricas de seguridad medibles.

## Benchmarks y rendimiento

| Métrica | Valor | Juez / herramienta | Notas |
|---|---|---|---|
| AdvBench ASR | 0,0300 | HarmBench judge | Menor es mejor |
| StrongREJECT ASR | 0,0750 | HarmBench judge | Menor es mejor |
| Sobre-rechazo macro | 0,1880 | WildGuard | Menor es mejor |

La model card no publica los valores del modelo base sin comprimir ni de las otras celdas del grid, por lo que no es posible establecer la comparación directa en la información disponible. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks de conocimiento o código. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM en FP16/BF16: aproximadamente 16 GB solo para los pesos (8,03 mil millones de parámetros). Con caché KV de 8.192 tokens en FP16 (GQA de 8 cabezas KV, 32 capas) se añade alrededor de 1 GB, más activaciones, lo que sitúa el total en el entorno de 18-22 GB.
- VRAM en cuantización de 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM en cuantización de 4 bits: aproximadamente 5-6 GB de pesos. Requiere convertir los pesos manualmente, ya que el repositorio solo contiene safetensors.
- GPU recomendadas: A100 40 GB u 80 GB, H100 y L40S para servicio en FP16 con lotes grandes; A10G 24 GB y L4 24 GB para lotes pequeños.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en FP16 con lotes reducidos; en 4 bits cabe en RTX 4080/4070 Ti (16 GB), RTX 3060 (12 GB) y GPUs equivalentes.
- Opciones de despliegue: `transformers`, text-generation-inference (la ficha incluye el tag `text-generation-inference` y `endpoints_compatible`); vLLM es viable al ser una arquitectura Llama 3 estándar. llama.cpp y Ollama requerirían una conversión previa a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Seguridad medida |
|---|---|---|---|---|---|
| svd-safety-l3_remove20_swapgapiter_b010_r07 | 8.030.261.248 (79,98 % de los densos) | 8.192 tokens (heredado) | Llama 3 Community | HuggingFace, 0 descargas | AdvBench ASR 0,0300; StrongREJECT ASR 0,0750; sobre-rechazo 0,1880 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | Llama 3 Community | HuggingFace, ampliamente desplegado | No disponible en esta ficha (la model card no incluye la línea base) |
| Otras celdas del mismo grid (reglas y presupuestos distintos) | ~8,03 mil millones | 8.192 tokens | Llama 3 Community | No disponibles en la información proporcionada | No disponibles |

No se han identificado en la información proporcionada otros artefactos comparables de compresión SVD sobre Llama 3 con edición de parámetros, ni los valores de las celdas restantes del grid. La comparación cuantitativa queda, por tanto, no disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: la propia model card lo describe como artefacto de investigación y advierte expresamente de que no debe desplegarse como asistente.
- Varias ramas del grid del estudio están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque. Este checkpoint concreto es un estado intermedio (7 de 10 rondas) y no la versión final del experimento.
- Riesgo de alucinación: no evaluado en la información disponible, pero previsible tras eliminar componentes de rango sin ajuste posterior.
- Idiomas soportados: no declarados. No hay evaluación multilingüe, por lo que no puede asumirse el comportamiento del modelo base fuera del inglés.
- Longitud de contexto: 8.192 tokens heredados del base; no hay evaluación de degradación del contexto tras la compresión.
- Licencia: Meta Llama 3 Community License, con las obligaciones habituales (incluir aviso "Built with Meta Llama 3", redistribuir LICENSE y USE_POLICY.md, y restricciones de uso para entidades con más de 700 millones de usuarios mensuales). Los archivos LICENSE y USE_POLICY.md están incluidos en el repositorio.
- Capacidades de tool calling, agentes, código y matemáticas: no documentadas ni validadas, y potencialmente afectadas por la compresión.
- Cero descargas y cero likes: no existe validación externa ni uso en producción reportado.
- Las métricas de seguridad provienen exclusivamente del juez HarmBench y de WildGuard; no hay evaluación con otros jueces que permita estimar la varianza de esas cifras.
- La fecha de creación indicada en HuggingFace (2026-09-17) es posterior a la fecha de publicación de este análisis; conviene verificar la vigencia del repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y política de uso: archivos `LICENSE` y `USE_POLICY.md` incluidos en el repositorio del modelo
- Paper de SVD-LLM (referencia a la técnica de compresión citada por el autor): no disponible en la información proporcionada
- Paper o blog del método de swap paramétrico iterativo y de la regla `gap_iter`: no disponible en la información proporcionada
- Búsqueda web realizada: no se han encontrado resultados relevantes; las coincidencias devueltas corresponden a sitios del Colegio Nacional de Farmacéuticos de Francia (ordre.pharmacien.fr), sin relación con el modelo.
