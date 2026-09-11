# SelectiveDOPD/JustRL-Qwen3-8b-RKLSelective-Top10pct

## Resumen

JustRL-Qwen3-8b-RKLSelective-Top10pct es un checkpoint de 8.190.735.360 parámetros publicado por el usuario SelectiveDOPD en Hugging Face, derivado del modelo base Qwen3-8B (según la etiqueta `qwen3` del repositorio). Se trata de un ajuste posterior al entrenamiento preentrenado mediante aprendizaje por refuerzo, dentro de una familia de experimentos que el autor denomina BiDirect-OPD; el checkpoint principal corresponde a `global_step_300` y el repositorio conserva otros catorce checkpoints intermedios en ramas independientes (de `global_step_20` a `global_step_280`).

El modelo se distribuye únicamente en formato safetensors para la librería `transformers`, con etiqueta de pipeline `text-generation` y sin cuantizaciones publicadas. El repositorio ocupa 196,6 GB, un tamaño coherente con el almacenamiento de múltiples copias de los pesos completos en precisión de 16 bits. No se declara licencia, idiomas soportados, longitud de contexto ni resultados de evaluación, y en el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes.

Su relevancia es fundamentalmente de investigación: se trata de un artefacto de experimentación en optimización por refuerzo sobre un modelo denso de 8B, útil para reproducir o comparar variantes de post-entrenamiento, pero con información pública insuficiente para recomendarlo en producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 (modelo denso, no MoE) |
| Parametros totales | 8.190.735.360 |
| Longitud de contexto | No disponible en la informacion del repositorio |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; sin GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Tamano del repositorio | 196,6 GB (incluye 15 ramas de checkpoints) |
| Checkpoint principal | `global_step_300` (rama `main`) |
| Checkpoints adicionales | 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280 (ramas) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only denso de la familia Qwen3, con 8,19 mil millones de parámetros, tal como confirman el recuento real de safetensors y la etiqueta `qwen3` del repositorio. No se publica la configuración de capas, cabezas de atención, dimensión oculta ni el tokenizador utilizado, por lo que los detalles finos de la arquitectura deben consultarse en la ficha del modelo base Qwen3-8B.

Respecto al entrenamiento, la model card es mínima: indica que el modelo se subió desde `justrl_qwen3_8b_rkl_rel_90_100` dentro de los experimentos BiDirect-OPD. La nomenclatura (JustRL, RKLSelective, Top10pct) sugiere una fase de optimización por refuerzo con algún criterio de selección sobre el 10 % superior de las muestras o de las variantes, pero no se documenta ni el algoritmo concreto, ni el dataset, ni el número de tokens, ni si hubo fases de SFT/DPO previas. Tampoco se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) ni se aportan hiperparámetros del proceso de RL.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican que el modelo acepta plantillas de chat, aunque no se documenta el formato exacto de prompt.
- Razonamiento y generación de código y matemáticas: capacidades presumibles por herencia del modelo base Qwen3-8B, no verificadas ni declaradas por el autor para este checkpoint.
- Compatibilidad con Text Generation Inference (TGI): el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, lo que indica que puede desplegarse con ese servidor.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en optimización por refuerzo: comparar la evolución del checkpoint `global_step_20` frente a `global_step_300` permite estudiar la dinámica de entrenamiento RL y detectar sobreajuste o degradación de la diversidad a lo largo de los pasos.
- Evaluación comparativa de variantes de post-entrenamiento: dado que existen otras variantes de la familia (`RKLSelective`), sirve como referencia frente a otros esquemas de RL aplicados al mismo modelo base.
- Generación de texto conversacional en entornos controlados: con 8,19B de parámetros puede gestionar diálogos multi-turno, siempre que se valide antes la plantilla de chat y la longitud de contexto real.
- Asistente de código en un pipeline interno: un modelo de este tamaño y familia suele rendir bien en generación y autocompletado de código; requeriría evaluación propia porque no hay benchmarks publicados.
- Base para ajuste específico de dominio: al partir de un checkpoint ya post-entrenado con RL, se puede usar como inicialización para SFT sobre datos propios en lugar de partir del Qwen3-8B original.
- Extracción y clasificación de información en pipelines RAG: generación condicionada sobre contexto recuperado, con el límite de que se desconoce la ventana de contexto efectiva.
- Reproducibilidad académica: el repositorio conserva 15 puntos de control intermedios, lo que permite reproducir curvas de entrenamiento y analizar la estabilidad del proceso de RL.
- Despliegue en servidores TGI propios: al estar marcado como compatible con TGI, puede integrarse en una infraestructura existente de text-generation-inference sin conversión de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir de 8.190.735.360 parámetros, sin contar caché KV ni activaciones):
  - BF16/FP16: aproximadamente 16,4 GB.
  - INT8: aproximadamente 8,2 GB.
  - INT4: aproximadamente 4,1-4,5 GB.
- GPU recomendadas:
  - FP16 con margen: A100 40 GB, H100 80 GB, L40S 48 GB.
  - FP16 ajustado: RTX 4090 o RTX 3090 de 24 GB (posible, con poca holgura para caché KV y contexto largo).
  - INT8: RTX 4090, RTX 4080, A10G.
  - INT4: tarjetas de 8-12 GB, siempre que se genere la cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 y en tarjetas de 8-12 GB si se cuantiza a 4 bits, ya que el repositorio no incluye versiones cuantizadas y habría que generarlas.
- Opciones de despliegue: `transformers` (nativo), vLLM, Text Generation Inference (etiqueta oficial del repositorio). Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, no publicada.
- Advertencia de almacenamiento: el repositorio ocupa 196,6 GB porque incluye 15 ramas con los pesos completos. Conviene descargar solo una revisión concreta (`snapshot_download` con `revision` o `git clone --single-branch --branch global_step_300`) en lugar de clonar todo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JustRL-Qwen3-8b-RKLSelective-Top10pct | 8,19B | No disponible | No disponible | Hugging Face, 0 descargas |
| Qwen3-8B (base) | 8,19B | 32.768 nativos, ampliables con YaRN | Apache 2.0 | Hugging Face |
| Llama 3.1 8B Instruct | 8,03B | 131.072 | Llama 3.1 Community License | Hugging Face |
| Mistral 7B Instruct v0.3 | 7,25B | 32.768 | Apache 2.0 | Hugging Face |

Los datos de los modelos de referencia proceden de sus fichas públicas. Para este checkpoint no se declara contexto, licencia ni rendimiento, por lo que la comparación cuantitativa de calidad no es posible con la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia, por lo que no puede asumirse uso comercial libre aunque el modelo base Qwen3-8B sea Apache 2.0. La ausencia de licencia es un riesgo legal para cualquier despliegue en producción.
- Sin benchmarks ni evaluaciones: no hay ningún dato de MMLU, HumanEval, GSM8K ni similares; no se puede afirmar que mejore ni que mantenga el rendimiento del Qwen3-8B original.
- Model card mínima: se desconoce el algoritmo de RL, el dataset, los hiperparámetros y el criterio de selección del 10 % superior, lo que impide auditar el proceso de entrenamiento.
- Riesgo de sobreoptimización del reward: los ajustes por RL sin documentar pueden degradar la diversidad, la coherencia en contextos largos o la utilidad general fuera de la distribución de entrenamiento.
- Idiomas no declarados: se desconoce si conserva el multilingüismo del modelo base o si el RL lo ha reducido.
- Contexto desconocido: no se confirma la ventana de contexto efectiva, algo crítico para casos de uso con documentos largos o RAG.
- Riesgo de alucinación: inherente a los modelos generativos de 8B; no hay datos de mitigación ni de tasas de error.
- Sesgos: no evaluados ni documentados por el autor.
- Ruido experimental: el nombre (`RKLSelective-Top10pct`, experimentos BiDirect-OPD) indica un artefacto de investigación, no un modelo estable destinado a producción.
- Madurez del repositorio: 0 descargas y 0 likes, sin comunidad que haya validado su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-8b-RKLSelective-Top10pct
- Rama del checkpoint principal (`global_step_300`): https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-8b-RKLSelective-Top10pct/tree/main
- Rama de ejemplo de checkpoint intermedio (`global_step_100`): https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-8b-RKLSelective-Top10pct/tree/global_step_100
- Modelo base de referencia (Qwen3-8B): https://huggingface.co/Qwen/Qwen3-8B
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los únicos resultados obtenidos fueron páginas de ayuda de Google Maps, sin relación con el contenido. No se dispone, por tanto, de papers, blogs, repositorios de código ni demos asociados.
