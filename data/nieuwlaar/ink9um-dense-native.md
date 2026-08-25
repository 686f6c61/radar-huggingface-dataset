# Nieuwlaar/ink9um-dense-native

## Resumen

El modelo `ink9um-dense-native` es un detector de tinta en escaneos de tomografía computarizada (CT) de papiros antiguos, desarrollado por Erwin Nieuwlaar (GitHub: Nieuwlaar). Se basa en los checkpoints públicos del modelo `ink_9um` (licencia MIT) y los extiende mediante entrenamiento con pseudo-etiquetas densas sobre escaneos de resolución nativa (113 keV / 9.362 µm). El resultado es una mejora significativa en la detección de tinta en segmentos nunca vistos durante el entrenamiento, pasando de un AUC de 0.8135 a 0.9548 en el segmento de prueba PHerc0139 title bar. El modelo es relevante porque permite leer textos ocultos en papiros carbonizados, un problema de gran interés histórico y arqueológico. La arquitectura exacta no se detalla en la documentación, pero se trata de una red de segmentación de imágenes que opera sobre volúmenes de superficie CT, con pesos de aproximadamente 0.6 GB en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de segmentación (no se especifica el tipo exacto; probablemente una U-Net o similar) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión por computadora) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | Safetensors (state_dicts sin optimizador) |

## Arquitectura y entrenamiento

El modelo se construye a partir de los checkpoints públicos de `ink_9um` (un detector de tinta entrenado con etiquetas manuales escasas) y se extiende con un entrenamiento adicional usando pseudo-etiquetas densas generadas sobre escaneos de resolución nativa. El README describe un proceso de mejora incremental:

- Primero se usa el checkpoint original `ink_9um` (s42-75k) con un AUC de 0.8135.
- Se aplica un "checkpoint soup" (promedio de pesos) y un "z-window ensemble" (inferencia sobre varias ventanas de profundidad) para llegar a 0.8552.
- Luego se entrena con pseudo-etiquetas densas del modelo KLAVIS `ink9um-dense` (replicación independiente) alcanzando 0.9147.
- Finalmente, el modelo `dense_native_016000` se entrena con pseudo-etiquetas densas sobre los escaneos nativos, logrando 0.9548.

El entrenamiento usa exclusivamente datos públicos: los checkpoints `ink_9um` y `ink9um-dense` (MIT), y los segmentos de PHerc0139 del bucket S3 de datos abiertos. No se detallan hiperparámetros ni el número de tokens (en este caso, píxeles) de entrenamiento. Se incluyen también filtros de falsos positivos basados en la física del CT (`vetoes.py`) y un benchmark congelado para evaluación.

## Capacidades

- **Detección de tinta en volúmenes de CT**: identifica regiones con tinta en escaneos de papiros a partir de la señal de densidad en el volumen.
- **Resolución nativa**: funciona directamente sobre escaneos de alta resolución (113 keV, 9.362 µm) sin necesidad de re-muestrear a una resolución menor.
- **Ensembling**: soporta inferencia con múltiples ventanas de profundidad (z-window ensemble) para mejorar la robustez.
- **Filtrado físico de falsos positivos**: incluye un módulo independiente (`vetoes.py`) que aplica restricciones basadas en la física del CT (p. ej., coherencia de capas) para reducir detecciones espurias.
- **No es un modelo de lenguaje**: no tiene capacidades de generación de texto, razonamiento o herramientas.

## Casos de uso

- **Lectura de papiros carbonizados**: el modelo puede segmentar la tinta en escaneos de CT de los rollos de Herculano, permitiendo reconstruir el texto sin abrir físicamente los papiros. Su alta precisión en segmentos nunca vistos lo hace útil para nuevos fragmentos.
- **Análisis arqueológico**: ayuda a localizar regiones de tinta en objetos antiguos con contenido escrito, facilitando la preservación y el estudio no invasivo.
- **Control de calidad en digitalización**: puede usarse como verificador de que los escaneos de alta resolución contienen suficiente señal de tinta para su procesamiento posterior.
- **Investigación en restauración**: permite comparar la distribución de tinta en diferentes condiciones de escaneo (p. ej., 78 keV vs 113 keV) para optimizar protocolos de adquisición.
- **Evaluación de modelos de segmentación**: el benchmark nativo y los scripts de evaluación incluidos sirven como referencia para comparar futuros modelos de detección de tinta en papiros.
- **Educación y divulgación**: el repositorio incluye herramientas de reproducción y verificación que pueden usarse en cursos de procesamiento de imágenes o arqueología digital.

## Benchmarks y rendimiento

El modelo se evalúa en dos benchmarks: las máscaras de validación oficiales del dataset `ink_9um` (píxeles retenidos de segmentos entrenados) y un benchmark completamente retenido sobre segmentos de PHerc0139 (title bar y winding w024) usando escaneos a 113 keV. En el título bar, los resultados progresivos son:

| Paso | AUC (title bar) |
|---|---|
| Checkpoint `ink_9um` (s42-75k) | 0.8135 |
| + checkpoint soup | 0.8402 |
| + z-window ensemble | 0.8552 |
| KLAVIS dense pseudo-label training (replicación) | 0.9147 |
| **+ dense native-scan pseudo-labels (este repo)** | **0.9548** |

El README incluye dos controles: un desplazamiento o rotación de las clases de referencia reduce el AUC a 0.62–0.70 (evitando atajos de región), y la inversión del orden de las capas z reduce 0.81 a 0.51 (señal específica de orientación). No se publican resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la documentación.
- El tamaño del repositorio es de 0.6 GB (pesos en safetensors), lo que sugiere que el modelo es relativamente pequeño y podría ejecutarse en GPUs comerciales de consumo (p. ej., RTX 3070/4080) con al menos 8 GB de VRAM, aunque es una estimación no confirmada.
- El repositorio incluye scripts de inferencia (`zavg_infer.sh`) que requieren la librería `koine_machines` (una rama de un proyecto de inferencia para detección de tinta). No se mencionan frameworks de despliegue como vLLM o llama.cpp, ya que no es un modelo de lenguaje.
- La inferencia se realiza por ventanas de profundidad (varias pasadas por el volumen), por lo que el coste computacional depende del número de ventanas.

## Comparativa con modelos similares

Se comparan dos modelos de la misma línea de trabajo: `ink_9um` (modelo base) y `ink9um-dense` (de KLAVIS). El modelo `ink9um-dense-native` es una extensión del segundo con entrenamiento adicional en escaneos nativos.

| Modelo | Arquitectura | Contexto | Rendimiento (AUC title bar) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ink_9um` (s42-75k) | No especificada | No aplica | 0.8135 | MIT | Hugging Face |
| `ink9um-dense` (KLAVIS) | No especificada | No aplica | 0.9147 (replicación) | MIT | Hugging Face |
| `ink9um-dense-native` (este repo) | No especificada | No aplica | **0.9548** | MIT | Hugging Face |

La diferencia clave es el uso de pseudo-etiquetas densas sobre escaneos de resolución nativa, que aporta una mejora de ~4 puntos sobre el mejor modelo público en el segmento más difícil.

## Limitaciones y advertencias

- **Ground truth indirecto**: las clases de referencia para el benchmark nativo provienen de los mapas del modelo de 78 keV (lanzados por la organización), no de anotaciones humanas. Esto puede introducir un sesgo hacia las predicciones de ese modelo.
- **Sesgo de dominio**: el modelo está entrenado y validado solo en papiros de Herculano (PHerc0139, PHerc0814, PHerc1667). Su generalización a otros tipos de papiros o materiales no está probada.
- **Riesgo de falsos positivos**: aunque se incluyen filtros físicos, la detección en escaneos de baja señal (113 keV) puede producir falsos positivos en regiones de alta densidad no relacionadas con tinta.
- **Sin soporte de idiomas**: no es un modelo de lenguaje, no puede procesar texto ni conversaciones.
- **Licencia**: MIT, permite uso comercial y modificación, pero el usuario debe verificar que los datos y checkpoints utilizados (que son públicos) no tienen restricciones adicionales.
- **Documentación incompleta**: no se detalla la arquitectura, el número de parámetros, ni los requisitos de hardware, lo que dificulta la evaluación de costes de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nieuwlaar/ink9um-dense-native
- Repositorio del modelo base `ink_9um`: no se proporciona enlace directo, pero se menciona como dataset público.
- Repositorio de `ink9um-dense` (KLAVIS): https://huggingface.co/domenicor046/ink9um-dense
- Repositorio de `ink9um-dense-labels` (pseudo-etiquetas): https://huggingface.co/domenicor046/ink9um-dense-labels
- Repositorio de evaluación de `ink9um-dense` (GitHub): https://github.com/DomRusso2/ink9um-dense
- Otros enlaces de rankings de modelos de IA (no relevantes para este modelo): https://felloai.com/best-ai-models/, https://lmmarketcap.com/tools/model-release-tracker
