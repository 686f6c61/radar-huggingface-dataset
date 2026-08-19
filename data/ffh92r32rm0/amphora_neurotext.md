# ffh92r32rm0/Amphora_NeuroText

## Resumen

Amphora NeuroText v4 es un modelo de codificación cerebral (brain encoding) desarrollado por Francesco H (usuario ffh92r32rm0) que predice la activación de 56 regiones de interés (ROIs) cerebrales a partir de estímulos de audio o texto, sin necesidad de adquirir datos de fMRI en el momento de la inferencia. Se trata de un perceptrón multicapa (MLP) pequeño, entrenado exclusivamente con datos reales de fMRI naturalista, que convierte representaciones de audio (Whisper-large-v3) o texto (Qwen3-Embedding-4B) en un mapa de activación sobre la parcellación HCP MMP1.0.

El modelo resuelve el problema de la predicción de respuesta cerebral a estímulos naturales, una tarea central en neurociencia cognitiva computacional. Su relevancia actual radica en que, según la model card, el modelo de audio supera al ganador de la competición Algonauts 2025 (TRIBE v2 de Meta AI) en un +4,2 % de correlación de Pearson en una evaluación independiente con 23 sujetos nunca vistos, utilizando un único modelo compartido sin ajuste fino por sujeto. La arquitectura es un MLP feedforward con capas lineales, GELU, dropout y LayerNorm, y el repositorio tiene un tamaño de 0,1 GB. No es un modelo de lenguaje ni un generador de texto; su pipeline es de extracción de características.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP feedforward (Linear → GELU → Dropout → LayerNorm → Linear → GELU → Dropout → Linear) |
| Parametros totales | no disponible (MLP pequeño, sin cifra publicada; el modelo de audio se estima en ~1,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa con tres capas lineales: la primera proyecta la entrada (1280 dimensiones para audio Whisper, 2560 para texto Qwen3, o 3840 para la versión combinada) a 1024 unidades, seguida de GELU, dropout y LayerNorm; la segunda reduce a 512 unidades con la misma secuencia de activación y regularización; la tercera produce 56 salidas correspondientes a las ROIs de la parcellación HCP MMP1.0. La función de pérdida es la correlación de Pearson, y el entrenamiento se realizó durante 120 épocas.

El corpus de entrenamiento incluye 2,73 millones de TRs (volúmenes de fMRI) procedentes de 289 GB de datos y 4.480 sesiones de múltiples datasets: CNeuroMod Friends, Narratives, Little Prince (LPP), Human Connectome Project (HCP), language fMRI y Cowen-Keltner. Los datos se mapearon a un espacio cerebral fsaverage5 con 28.444 vértices, que luego se redujeron a 56 ROIs. Una innovación metodológica clave es el uso de z-scoring por sujeto y una división de validación por sujetos (15 % de sujetos excluidos del entrenamiento), lo que evita la inflación de métricas por memorización de niveles basales individuales. El modelo no emplea RLHF ni DPO; es un encoder supervisado puramente.

## Capacidades

- Predicción de activación de 56 ROIs cerebrales (HCP MMP1.0) a partir de audio o texto, sin necesidad de fMRI en inferencia.
- Soporte de tres modalidades de entrada: audio (Whisper-large-v3, 1280 dimensiones), texto (Qwen3-Embedding-4B, 2560 dimensiones) y combinación texto+audio (3840 dimensiones con dropout de modalidad).
- Inferencia zero-shot sobre sujetos no vistos: un único modelo compartido, sin adaptación por sujeto.
- Extracción de características de activación cerebral para análisis posteriores (por ejemplo, identificar qué ROIs responden a un estímulo).
- Funcionamiento como pipeline de feature-extraction, integrable en flujos de investigación neurocientífica.
- No incluye generación de texto, tool calling, razonamiento multi-step ni capacidades multilingües; su ámbito es exclusivamente la predicción de activación cerebral.

## Casos de uso

- Investigación en neurociencia cognitiva: los investigadores pueden predecir qué regiones cerebrales se activarían ante un estímulo auditivo o textual sin necesidad de realizar un experimento de fMRI, lo que permite formular hipótesis y diseñar estudios de forma más eficiente.
- Estudio de diferencias individuales: al ser un modelo compartido, se puede comparar la respuesta predicha con la respuesta real de sujetos específicos para investigar variabilidad inter-sujeto en la codificación cerebral.
- Desarrollo de interfaces cerebro-computadora (BCI): las predicciones de activación pueden servir como señales auxiliares para decodificar la intención del usuario a partir de estímulos presentados, aunque el modelo no procesa señales EEG directamente.
- Análisis de contenido audiovisual: en marketing o producción de medios, se puede estimar qué regiones cerebrales (por ejemplo, corteza auditiva, amígdala, córtex prefrontal) responderían a un anuncio o a un fragmento de audio, orientando decisiones creativas.
- Educación personalizada: predecir qué tipo de estímulos lingüísticos o narrativos generan mayor activación en redes de atención o memoria, ayudando a diseñar materiales didácticos basados en evidencia neurocientífica.
- Evaluación de estímulos en psicología experimental: los experimentadores pueden seleccionar estímulos que maximicen la activación de ROIs específicas (por ejemplo, amígdala para emociones) antes de lanzar un estudio, reduciendo costes y tiempo.

## Benchmarks y rendimiento

Según la model card, el modelo de audio (Whisper v4) alcanza una correlación de Pearson media de 0,257 en un conjunto de validación independiente con 23 sujetos nunca vistos, superando a TRIBE v2 (Meta AI) que obtuvo 0,215, lo que representa una mejora de +4,2 %. La tabla siguiente resume los resultados publicados:

| Modelo | Validación R (sujetos holdout) | Notas |
|---|---|---|
| NeuroText Whisper v4 (audio) | 0,257 | Modelo único compartido, sin ajuste por sujeto |
| TRIBE v2 (Meta AI) | 0,215 | Ajuste fino por sujeto, video+audio+texto |

Además, se reportan correlaciones por ROI para el modelo de audio en la evaluación holdout, con los mejores resultados en ACC (0,438), STG (0,422), Thalamus (0,408) y V1 (0,393). En total, 53 de 56 ROIs superan R > 0,10, 41 superan R > 0,20 y 20 superan R > 0,30. No se han publicado resultados de benchmarks en otros conjuntos estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un LLM.

## Requisitos de hardware

- El modelo es un MLP extremadamente ligero (repo de 0,1 GB), por lo que la inferencia puede ejecutarse en CPU sin problemas; se estima una VRAM inferior a 1 GB incluso en GPU.
- Cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) es más que suficiente; también funciona en entornos sin GPU.
- Para la extracción de características de audio se requiere el modelo Whisper-large-v3 de HuggingFace, que sí demanda más recursos (aproximadamente 3 GB de VRAM en FP16).
- Para la extracción de características de texto con Qwen3-Embedding-4B se necesita una GPU con al menos 8 GB de VRAM (o usar versiones cuantizadas).
- Despliegue recomendado: scripts Python con PyTorch y transformers; no requiere vLLM, TGI ni Ollama.
- La latencia de la predicción de ROIs es del orden de milisegundos una vez obtenidas las características; el cuello de botella está en la extracción de características del modelo base (Whisper o Qwen3).

## Comparativa con modelos similares

| Modelo | Entrada | Métrica (R holdout) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Amphora NeuroText v4 (Whisper) | Audio | 0,257 | MIT | HuggingFace |
| TRIBE v2 (Meta AI) | Video+audio+texto | 0,215 | no disponible | Publicación Algonauts 2025 |
| Modelos v2/v3 de NeuroText | Audio/texto | 0,239–0,413 (inflados, no comparables) | MIT | Repositorio anterior |

No se dispone de información sobre otros modelos de brain encoding comparables con métricas públicas en la misma configuración de 56 ROIs. La comparación principal se establece con TRIBE v2, ganador de Algonauts 2025, aunque ese modelo requiere ajuste fino por sujeto y utiliza modalidades adicionales.

## Limitaciones y advertencias

- La model card indica explícitamente que es una demo y no representa el modelo completo; las predicciones se realizan a nivel de 56 ROIs, una resolución mucho más gruesa que los 28.444 vértices originales, lo que limita la fidelidad espacial.
- Los resultados de las versiones v2/v3 anteriores no son comparables con v4 debido a una metodología de validación incorrecta (split within-subject) que inflaba las métricas; solo los valores de v4 son fiables.
- El modelo está entrenado exclusivamente con datos en inglés y con estímulos de los datasets específicos (Narratives, HCP, etc.), por lo que su generalización a otros idiomas o tipos de estímulo no está garantizada.
- Al ser un modelo de codificación, no genera texto ni respuestas; no es adecuado para tareas de lenguaje natural.
- No se han evaluado sesgos demográficos o culturales en las predicciones; los datos de fMRI pueden contener sesgos de selección de sujetos.
- Aunque la licencia MIT permite uso comercial, los datos de entrenamiento (datasets de fMRI) pueden tener restricciones de uso que el usuario debe verificar antes de aplicar el modelo en productos comerciales.
- La dependencia de modelos base externos (Whisper, Qwen3) implica que el rendimiento final depende de la calidad de esos extractores de características y de su disponibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ffh92r32rm0/Amphora_NeuroText
- Perfil del autor: https://huggingface.co/ffh92r32rm0
- Colab (según model card): https://huggingface.co/ffh92r32rm0/Amphora_NeuroText/colab
