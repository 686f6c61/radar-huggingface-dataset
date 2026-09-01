# devansh0703/PeptEdgeV2

## Resumen

PeptEdgeV2 es un clasificador binario de péptidos antimicrobianos (AMP) desarrollado por Devansh Raulo (usuario `devansh0703`). El modelo resuelve el problema de identificar si una secuencia de aminoácidos tiene actividad antimicrobiana, una tarea relevante en bioinformática y descubrimiento de fármacos. Su principal contribución es la eficiencia: con solo 3,43 millones de parámetros, alcanza un rendimiento superior al de ESM-2 LoRA (650M parámetros), que era el estado del arte previo, con una mejora de +3,17% en F1 y una inferencia 213 veces más rápida.

La arquitectura combina cuatro componentes en un encoder compacto: embeddings biofísicos de 12 propiedades fisicoquímicas por aminoácido, convoluciones multi-escala (kernels 3, 5, 7 y 11), un transformer SwiGLU de 5 capas con regularización de profundidad estocástica, y un pooling adaptativo triple (media, máximo y atención). El modelo acepta secuencias de hasta 200 aminoácidos y está entrenado sobre el dataset GenPept-Curated-2025, con 11.000 secuencias balanceadas. Publicado bajo licencia MIT, está disponible en HuggingFace con pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder híbrido: embeddings biofísicos + Conv1D multi-escala + Transformer SwiGLU + pooling adaptativo |
| Parametros totales | 3.434.018 (según model card; el safetensors contiene 3.435.794) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 200 aminoácidos (max_len) |
| Tipos de cuantizacion | no disponible (pesos en FP32, safetensors) |
| Idiomas soportados | en (etiqueta); procesa secuencias de aminoácidos, no texto natural |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PeptEdgeV2 es un modelo denso de arquitectura híbrida diseñado específicamente para clasificación de secuencias peptídicas. El procesamiento comienza con un embedding biofísico que concatena 12 propiedades fisicoquímicas por aminoácido (provenientes de una tabla fija) con embeddings aprendidos, resultando en una dimensión total de 192. A continuación, cuatro ramas paralelas de convolución 1D con kernels de tamaño 3, 5, 7 y 11 extraen patrones multi-escala, cada una con normalización por lotes y conexiones residuales. La salida pasa por un transformer de 5 capas con feed-forward SwiGLU y regularización de profundidad estocástica (sd_prob=0.05). Finalmente, un pooling adaptativo fusiona media, máximo y atención antes de una cabeza MLP de 3 capas.

El entrenamiento se realizó sobre el dataset GenPept-Curated-2025, que contiene 11.000 secuencias balanceadas (5.500 AMP y 5.500 no-AMP) de longitudes entre 10 y 200 aminoácidos, con taxonomía de Bacteria, Archaea y Fungi. Los hiperparámetros incluyen learning rate 3e-4, weight decay 5e-5, label smoothing 0.1, warmup de 15 épocas sobre un total de 100, decaimiento coseno, gradiente clipping 1.0 y early stopping con paciencia 30 sobre F1 de validación. El pipeline final se ejecuta con CUDA y precisión mixta. Es importante señalar que los resultados publicados provienen de un split aleatorio estratificado (random_state=42), no del split controlado por homología CD-HIT descrito en el README.

## Capacidades

- Clasificación binaria de péptidos antimicrobianos: distingue entre secuencias con y sin actividad antimicrobiana.
- Procesamiento de secuencias de aminoácidos de longitud variable (10-200 residuos), con padding/truncado a 200.
- Inferencia extremadamente rápida: 52.800 secuencias por segundo en hardware no especificado, 213 veces más rápido que ESM-2 LoRA.
- Eficiencia paramétrica: 189 veces menos parámetros que el estado del arte previo, lo que permite despliegue en entornos con recursos limitados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; es un clasificador especializado de una sola tarea.
- Multilingüismo no aplicable: trabaja con vocabulario de aminoácidos (21 tokens: 20 estándar + X para desconocido, más PAD).

## Casos de uso

- Descubrimiento de nuevos antibióticos: los investigadores pueden filtrar grandes bibliotecas de péptidos candidatos para identificar aquellos con potencial antimicrobiano antes de realizar ensayos experimentales, reduciendo costes y tiempo.
- Análisis de metagenomas: en pipelines de anotación funcional, el modelo puede clasificar péptidos predichos a partir de datos metagenómicos para detectar posibles AMPs en comunidades microbianas.
- Validación de péptidos sintéticos: empresas biotecnológicas pueden usar el modelo como cribado inicial de péptidos diseñados de novo, priorizando los que muestren mayor probabilidad de actividad.
- Optimización de péptidos terapéuticos: al evaluar variantes de una secuencia base, el modelo ayuda a identificar mutaciones que conserven o mejoren la actividad antimicrobiana.
- Educación e investigación académica: por su tamaño reducido y licencia MIT, es adecuado para cursos de bioinformática o proyectos de laboratorio que requieran un clasificador de AMPs sin grandes recursos computacionales.
- Integración en pipelines de descubrimiento de fármacos: al ser un modelo ligero, puede ejecutarse en lotes masivos dentro de flujos de trabajo automatizados, por ejemplo en plataformas de screening virtual de compuestos peptídicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el dataset GenPept-Curated-2025 (split de test, balanced_11000):

| Metrica | Valor |
|---|---|
| F1 Score | 0.9147 |
| Accuracy | 0.9134 |
| ROC AUC | 0.9510 |
| Matthews Correlation Coefficient | 0.8272 |

Comparación con el estado del arte previo (ESM-2 LoRA, según la model card):

| Metrica | PeptEdgeV2 | ESM-2 LoRA | Delta |
|---|---|---|---|
| F1 Score | 91.47% | 88.30% | +3.17% |
| Accuracy | 91.34% | 86.80% | +4.54% |
| AUC | 0.9510 | 0.938 | +0.013 |
| Parametros | 3.43M | 650M | 189x menos |
| Inferencia | 52.800 seq/s | 248 seq/s | 213x más rápida |

Nota: estos resultados no han sido verificados de forma independiente y provienen de un split aleatorio estratificado, no de un split controlado por homología.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la información disponible.
- Estimación orientativa: con 3,43 millones de parámetros en FP32, el modelo ocupa aproximadamente 13,7 MB de memoria. Cabe en cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU con facilidad.
- La inferencia es extremadamente rápida (52.800 secuencias/s según el autor), lo que sugiere que puede ejecutarse en tiempo real en hardware modesto.
- Opciones de despliegue: al ser un modelo PyTorch personalizado, puede servirse con frameworks estándar como TorchServe o mediante una API simple con FastAPI. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje generativos.
- Para entrenamiento, el autor indica que se requiere CUDA y precisión mixta, pero no especifica la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (AMP) | Accuracy | AUC | Licencia |
|---|---|---|---|---|---|---|
| PeptEdgeV2 | 3.43M | 200 AA | 91.47% | 91.34% | 0.9510 | MIT |
| ESM-2 LoRA (prior SOTA) | 650M | 1024 AA (ESM-2 base) | 88.30% | 86.80% | 0.938 | MIT (ESM-2) |
| Otros clasificadores AMP (p.ej. AMPsensor, iAMP-2L) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con ESM-2 LoRA muestra una ventaja clara en eficiencia y rendimiento. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados publicados provienen de un split aleatorio estratificado, no de un split controlado por homología (CD-HIT). Esto puede inflar las métricas, ya que secuencias similares en entrenamiento y test pueden compartir homología, llevando a una sobreestimación de la capacidad de generalización.
- El modelo solo realiza clasificación binaria (AMP vs no-AMP); no distingue entre tipos de actividad antimicrobiana ni ofrece información sobre mecanismos de acción.
- La longitud máxima de secuencia es 200 aminoácidos; péptidos más largos se truncan, lo que podría perder información relevante.
- No se han realizado evaluaciones de sesgos ni de robustez frente a secuencias fuera de distribución (por ejemplo, péptidos de organismos no representados en el dataset).
- El dataset de entrenamiento cubre Bacteria, Archaea y Fungi, pero no se especifica la distribución exacta; podría haber sesgo hacia ciertos taxones.
- Aunque la licencia MIT permite uso comercial, el modelo no ha sido validado clínicamente; cualquier aplicación en diagnóstico o desarrollo de fármacos requiere validación experimental adicional.
- No se proporcionan garantías de reproducibilidad completa: el código de entrenamiento está disponible, pero los datos exactos de split y preprocesamiento pueden variar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devansh0703/PeptEdgeV2
- Perfil del autor en HuggingFace: https://huggingface.co/devansh0703
- Perfil del autor en GitHub: https://github.com/devansh0703
- Dataset GenPept-Curated-2025: https://github.com/biochem-data-sci/GenPept-Curated-2025
- Repositorio del autor (otros proyectos): https://github.com/devansh0703/apt_intrusion_detection
