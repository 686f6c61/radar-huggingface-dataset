# pbcong/llava-1.5-7b-hal-verify-probe

## Resumen

El modelo `pbcong/llava-1.5-7b-hal-verify-probe` es un probe de verificación (verification-pass probe) diseñado para detectar alucinaciones en las descripciones generadas por el modelo multimodal LLaVA-1.5-7B. Desarrollado por pbcong, este probe consiste en un pequeño cabezal MLP por capa que lee los estados ocultos del modelo anfitrión congelado durante una pasada de verificación adicional, y predice si un objeto mencionado en un caption es una alucinación o no. A diferencia de los métodos que analizan la salida generada, este enfoque explora las representaciones internas del modelo, logrando una precisión superior a la de un juez VLM de 122B parámetros con un coste adicional de solo ~22 MB por semilla.

El probe se entrena sobre 202.000 pares (imagen, nombre de objeto) extraídos de COCO train2014, con captions generados por el propio modelo anfitrión y etiquetas basadas en la anotación humana de COCO. En el benchmark COCO CHAIR-80 con ground truth humano, alcanza un AP de .876 frente al .826 de un juez VLM de 122B, con una mejora estadísticamente significativa (p < 1e-6). El modelo se distribuye como tres checkpoints de PyTorch (semillas 0, 1 y 2) que se ensamblan promediando sus salidas. Está pensado para investigación en interpretabilidad y detección de alucinaciones en modelos visión-lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Probe MLP por capa sobre LLaVA-1.5-7B (modelo base congelado) |
| Parametros totales | No disponible (el probe añade ~22 MB por semilla; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base LLaVA-1.5-7B, 4096 tokens) |
| Tipos de cuantizacion | No disponible (el probe se distribuye en precisión completa; el modelo base puede cuantizarse) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch state dicts (.pt) |

## Arquitectura y entrenamiento

El probe se compone de cinco cabezales MLP independientes, uno por cada capa del modelo base (capas 8, 12, 16, 20 y 24). Cada cabezal tiene una arquitectura 4096 → 256 → 256 → 1 con activación GELU y LayerNorm. La característica de entrada para cada capa es el vector de contraste: la diferencia entre el estado oculto en la posición de respuesta con imagen y sin imagen (dimensión 4096). La puntuación final de alucinación es la media de las sigmoides de los cinco cabezales, promediada sobre los tres checkpoints de semilla (ensemble).

El entrenamiento utiliza 202.000 pares (imagen, nombre) de 50.405 imágenes de COCO train2014. Los captions se generan con el modelo anfitrión en modo greedy y los objetos se extraen mediante el vocabulario CHAIR-80. Las etiquetas provienen de la anotación humana de COCO. Se emplea BCE con re-ponderación positiva, label smoothing 0.98/0.01, AdamW con lr 3e-4, weight decay 0.05, batch 256 y 12 épocas. La selección del modelo se hace por AUROC intra-palabra en un conjunto de validación separado por ID de imagen. El modelo base permanece congelado durante todo el proceso.

## Capacidades

- Detección de alucinaciones en captions generados por LLaVA-1.5-7B: dado un caption y una imagen, identifica si un objeto mencionado es visible o no.
- Verificación de pares (imagen, nombre de objeto): ejecuta una pasada adicional del modelo anfitrión con la pregunta "¿Es visible al menos un {nombre} en esta imagen?" y extrae los estados ocultos en la posición de respuesta.
- Interpretabilidad: al operar sobre representaciones internas, permite estudiar dónde y cómo el modelo codifica la información de presencia de objetos.
- Ensemble multi-semilla: combina tres checkpoints para robustez, con una mejora marginal sobre semillas individuales (AP .872–.876 vs .876 del ensemble).
- Compatibilidad con el ecosistema PyTorch: se integra fácilmente con el flujo de extracción de características del repositorio de entrenamiento.

## Casos de uso

- Evaluación de calidad de captions en pipelines de visión-lenguaje: el probe puede usarse como métrica automática para filtrar captions generados por LLaVA-1.5-7B que contengan objetos no visibles, mejorando la fiabilidad de sistemas de descripción automática de imágenes.
- Auditoría de modelos multimodales: permite cuantificar la tasa de alucinación de un modelo concreto en un dominio específico (por ejemplo, imágenes médicas o industriales) sin necesidad de anotación manual extensiva.
- Investigación en interpretabilidad: al analizar los vectores de contraste en distintas capas, se puede estudiar cómo se distribuye la información de presencia de objetos a lo largo de la red, contribuyendo a entender los mecanismos internos de alucinación.
- Desarrollo de detectores de alucinación más eficientes: el probe demuestra que un cabezal ligero supera a un juez VLM masivo, lo que abre la puerta a sistemas de verificación en tiempo real con bajo coste computacional.
- Control de calidad en generación de datos sintéticos: si se usa LLaVA-1.5-7B para generar datos de entrenamiento multimodal, el probe puede filtrar pares (imagen, texto) con alucinaciones antes de incorporarlos a un dataset.
- Benchmarking de métodos de detección: sirve como referencia sólida (AP .876) para comparar futuros enfoques de detección de alucinaciones basados en internals o en outputs.

## Benchmarks y rendimiento

La model card reporta resultados en el benchmark COCO CHAIR-80 con ground truth humano, sobre un holdout de 7.548 pares. La comparativa incluye varios detectores evaluados en el mismo universo:

| Detector | AP | F1 | AUROC intra-palabra |
|---|---|---|---|
| LLaVA-7B self logit (misma pasada) | .718 | — | — |
| Generation-time probe | .781 | — | — |
| Juez VLM 122B (logit readout) | .826 | .777 | .930 |
| **Verify probe 7B (este repo, ensemble 3 semillas)** | **.876 [.862, .889]** | **.814** | **.937** |

La diferencia pareada de AP frente al juez de 122B es de +.049 [+.030, +.069] con p < 1e-6. El probe y el self-logit se miden sobre la misma pasada forward byte-idéntica, lo que aísla la contribución de las representaciones internas frente a las salidas.

## Requisitos de hardware

- El probe en sí es muy ligero (~22 MB por semilla), pero requiere ejecutar el modelo base LLaVA-1.5-7B para extraer los estados ocultos. Por tanto, la VRAM necesaria es la del modelo base.
- LLaVA-1.5-7B en fp16 ocupa aproximadamente 14 GB de VRAM, por lo que cabe en GPUs de consumo como la RTX 3090 o RTX 4090 (24 GB). Con cuantización a 8 bits puede caber en GPUs de 12 GB, aunque el probe espera estados ocultos en precisión completa.
- Para una pasada de verificación adicional (la del probe), se necesita el doble de cómputo que una generación normal, ya que se ejecuta una forward con imagen y otra sin imagen para obtener el contraste.
- El despliegue puede hacerse con PyTorch estándar; no se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un LLM autónomo sino un componente auxiliar.
- En una GPU A100 (80 GB) se puede procesar un batch razonable de pares (imagen, nombre) en paralelo; la latencia por par dependerá del tamaño de batch y de la optimización del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | AP (CHAIR-80) | Licencia |
|---|---|---|---|---|
| **Verify probe 7B (este repo)** | ~22 MB (probe) + 7B base | Internals (contraste de estados ocultos) | .876 | No disponible |
| Verify probe 13B (compañero) | ~22 MB (probe) + 13B base | Internals (contraste) | .883 | No disponible |
| Juez VLM 122B | 122B | Outputs (logit readout) | .826 | No disponible |
| Generation-time probe | No disponible | Internals durante generación | .781 | No disponible |

El probe de 13B supera ligeramente al de 7B, y ambos superan al juez masivo de 122B, lo que sugiere que los internals del modelo anfitrión contienen información más fiable que las salidas para esta tarea.

## Limitaciones y advertencias

- El probe está entrenado específicamente para el modelo anfitrión LLaVA-1.5-7B; no es transferible a otros modelos sin reentrenamiento.
- Los captions de entrenamiento se generan con el propio LLaVA-1.5-7B en modo greedy, por lo que el probe puede estar sesgado hacia el comportamiento de ese modelo concreto.
- El vocabulario de objetos se limita a CHAIR-80, que cubre 80 categorías de COCO; no se evalúa la generalización a otros dominios o categorías.
- La licencia no está especificada, lo que puede limitar su uso comercial sin autorización explícita del autor.
- El probe requiere acceso a los estados ocultos del modelo base, lo que impide su uso con modelos servidos a través de APIs que no expongan internals.
- No se proporcionan datos sobre latencia o throughput en producción; el coste adicional de la pasada de verificación debe tenerse en cuenta en aplicaciones en tiempo real.
- El riesgo de alucinación no se elimina, solo se detecta; el probe no corrige las salidas del modelo anfitrión.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/pbcong/llava-1.5-7b-hal-verify-probe)
- [Modelo compañero para LLaVA-1.5-13B](https://huggingface.co/pbcong/llava-1.5-13b-hal-verify-probe)
- [Modelo base LLaVA-1.5-7B (llava-hf)](https://huggingface.co/llava-hf/llava-1.5-7b-hf)
- [Página oficial de LLaVA](https://llava-vl.github.io/)
