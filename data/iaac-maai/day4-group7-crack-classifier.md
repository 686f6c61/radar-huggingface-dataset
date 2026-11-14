# iaac-maai/day4-group7-crack-classifier

## Resumen
`day4-group7-crack-classifier` es un clasificador de imágenes binario que distingue entre superficies de hormigón con grietas visibles (`crack`) y superficies intactas (`no_crack`). Lo desarrolla el equipo formado por Ugo, Álvaro y Sneha Shenoy en el marco del curso AI Methods I del programa IAAC MaAI (2026/27), y está publicado en Hugging Face bajo licencia MIT. El modelo parte de un ResNet18 preentrenado en ImageNet, con la práctica totalidad de la red congelada y una nueva capa final lineal de 512 a 2 clases entrenada sobre un subconjunto del dataset METU Concrete Crack.

La relevancia práctica del modelo es acotada pero concreta: no pretende sustituir la inspección estructural, sino priorizar grandes volúmenes de fotografías de inspección para que un técnico revise primero las que probablemente contienen grietas. Con solo 11,2 millones de parámetros y 1.026 parámetros entrenables, es un ejemplo de transfer learning extremo: un backbone genérico de visión con una cabeza ligera ajustada sobre 2.800 imágenes.

Conviene subrayar desde el principio que se trata de un artefacto de curso académico, no de un modelo de producción validado. Su rendimiento sobre el conjunto de test del dataset es muy alto (99,7 % de accuracy), pero cae a 86 % de accuracy sobre 21 imágenes nuevas descargadas de la web, lo que anticipa una brecha de generalización importante fuera de la distribución de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet18 (CNN residual) con nueva capa final `nn.Linear(512, 2)` |
| Parámetros totales | 11.177.538 (1.026 entrenables; el resto congelados) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de una sola imagen RGB de 224 × 224 px) |
| Tipos de cuantización | no disponible (pesos en `state_dict` de PyTorch, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (tarea de visión; las etiquetas son `crack` / `no_crack`) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (`state_dict` de PyTorch, 44,8 MB) |

Otros datos técnicos relevantes: entrada RGB preprocesada con `ResNet18_Weights.DEFAULT.transforms()` (redimensionado a 256, recorte central a 224 × 224, normalización con estadísticas de ImageNet); salida de dos logits con softmax para obtener P(crack) y P(no_crack); umbral de decisión recomendado P(crack) ≥ 0,5. Entorno de referencia: Python 3.11, torch 2.15.0, torchvision 0.29.2.

## Arquitectura y entrenamiento
La arquitectura es una ResNet18 estándar de torchvision (`ResNet18_Weights.DEFAULT`), preentrenada en ImageNet, con todas las capas congeladas salvo la cabeza de clasificación, reemplazada por una capa lineal de 512 a 2 salidas. Durante el entrenamiento la capa BatchNorm se mantiene en modo evaluación para no alterar las estadísticas aprendidas en ImageNet. El ajuste se limita, por tanto, a 1.026 parámetros, lo que explica tanto la velocidad de entrenamiento (2,7 minutos en un MacBook Pro con Apple Silicon y backend `mps`) como la dependencia fuerte de las características genéricas del backbone.

Los datos proceden del dataset METU Concrete Crack Images for Classification (Özgenel, 2019; DOI 10.17632/5y9wdsg2zt.2), distribuido bajo CC BY 4.0. Se tomó una muestra aleatoria de 4.000 de las 40.000 imágenes (2.000 por clase), dividida de forma estratificada en 2.800 de entrenamiento, 600 de validación y 600 de test (`random_state=42`). Las imágenes son parches de 227 × 227 px recortados de 458 fotografías de hormigón de edificios del campus de la METU en Ankara, con grietas mayoritariamente anchas, oscuras y de gran ocupación de la imagen.

El entrenamiento usó Adam con learning rate 1e-3 (solo capa nueva), batch size 32, pérdida de entropía cruzada y hasta 15 épocas con early stopping sobre la pérdida de validación (paciencia 3). Se aplicó aumento de datos: recorte redimensionado aleatorio (escala 0,7–1,0), volteos horizontal y vertical, rotaciones de 0/90/180/270°, y jitter de brillo y contraste. Se conservaron los pesos de la época 15 (menor pérdida de validación). Un experimento adicional que ajustaba también `layer4` con learning rate 1e-4 resultó peor en validación (99,5 % de accuracy y 99,3 % de recall de grieta) y fue descartado. El conjunto de test se evaluó una única vez, al final.

## Capacidades
- Clasificación binaria de imágenes de primer plano de superficies de hormigón en `crack` / `no_crack`, con probabilidad asociada a cada clase.
- Ordenación de fotografías por probabilidad de grieta, útil para triaje de inspecciones.
- Funciona sobre imágenes RGB de 224 × 224 px tras el preprocesado estándar de ResNet18.
- Inferencia muy ligera: 11,2 millones de parámetros y un `state_dict` de 44,8 MB, ejecutable en CPU y en GPU de consumo.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni generación de texto.
- No detecta localización de grietas (no es un modelo de detección ni de segmentación): solo indica presencia a nivel de imagen.
- No está entrenado para otros materiales (ladrillo, yeso, azulejo, superficies pintadas) ni para fotografías de fachada completa, aéreas o de dron.

## Casos de uso
- Triaje de inspecciones de hormigón: dado un lote de fotografías de primer plano tomadas por un inspector, el modelo asigna P(crack) a cada una y permite ordenarlas de mayor a menor probabilidad, de modo que el técnico revise primero las candidatas. Es adecuado por su coste de inferencia bajo y su alta recall en el dominio del dataset.
- Prefiltrado en aplicaciones móviles de campo: con 44,8 MB de pesos y arquitectura ResNet18, el modelo puede ejecutarse en CPU de portátil o incluso embebido en un dispositivo, descartando imágenes de superficie intacta antes de enviarlas a revisión humana.
- Control de calidad documental en inspecciones periódicas: clasificar automáticamente el archivo fotográfico histórico de una instalación para separar imágenes con grietas de las que no las tienen y priorizar la revisión de las primeras.
- Etiquetado asistido para curación de datasets: usar las predicciones como sugerencia inicial en un flujo de anotación humana, aceptando las de alta confianza y revisando manualmente las cercanas al umbral de 0,5.
- Monitorización de evolución de grietas en campañas repetidas: si se dispone de fotografías comparables del mismo punto en fechas distintas, el modelo puede señalar qué capturas contienen grieta y centrar la comparación visual humana en esas imágenes.
- Filtro previo en pipelines de visión mayores: como primera etapa barata que descarta superficies limpias antes de pasar imágenes candidatas a un modelo de segmentación o medición de anchura de grieta, reduciendo el coste computacional del pipeline completo.
- Material docente y experimentos de transfer learning: por su tamaño reducido y su entrenamiento en minutos, sirve como caso práctico reproducible de ajuste de una cabeza lineal sobre un backbone congelado.

## Benchmarks y rendimiento

| Métrica (test, n = 600) | Baseline (siempre `crack`) | Este modelo |
|---|---|---|
| Accuracy | 50,0 % | 99,7 % |
| Precisión de `crack` | 50,0 % | 99,7 % |
| Recall de `crack` | 100,0 % | 99,7 % |

| Clase | Precisión | Recall | F1 |
|---|---|---|---|
| `crack` | 0,997 | 0,997 | 0,997 |
| `no_crack` | 0,997 | 0,997 | 0,997 |

| Conjunto | Accuracy | Recall de `crack` | Precisión de `crack` |
|---|---|---|---|
| Test del dataset (600 imágenes) | 99,7 % | 99,7 % | 99,7 % |
| 21 imágenes nuevas de la web | 86 % | 80 % | 100 % |

En el test, el modelo acierta 598 de 600 imágenes. Los dos fallos implican líneas finas y de bajo contraste: una grieta fina junto a un agujero oscuro clasificada como `no_crack` (75 % de confianza en esa clase) y un arañazo tenue clasificado como `crack` (62 %). En validación se marcó como grieta un cable apoyado sobre la superficie (97 %). Sobre las 21 imágenes nuevas, todas las grietas anchas se detectan y ninguna superficie lisa se marca como grieta, pero se escapan 3 grietas capilares en fotografías más amplias.

## Requisitos de hardware
- VRAM estimada para inferencia: por debajo de 1 GB en FP32 para un lote pequeño; el `state_dict` ocupa 44,8 MB y el grafo de ResNet18 a 224 × 224 es muy ligero.
- GPU recomendadas: innecesarias para uso individual; cualquier GPU con al menos 1 GB de memoria libre es suficiente. Una RTX 4090, A100 o H100 queda enormemente sobredimensionada para esta tarea.
- Cabe holgadamente en GPU de consumo: GTX 1050, RTX 2060, RTX 3060, RTX 4090, así como en CPU de portátil. El entrenamiento original se completó en 2,7 minutos en un MacBook Pro con Apple Silicon (`mps`).
- Opciones de despliegue: PyTorch nativo con torchvision; exportación a TorchScript u ONNX no publicada pero factible; no hay artefactos GGUF, Ollama ni TGI disponibles. Para servir en producción sería necesario construir el wrapper de inferencia y aplicar las transformaciones de `ResNet18_Weights.DEFAULT.transforms()`.
- Latencia y throughput: no disponibles como medida publicada; por el tamaño del modelo se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero no hay cifras verificadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iaac-maai/day4-group7-crack-classifier` | 11,2 M (1.026 entrenables) | Imagen RGB 224 × 224 | 99,7 % accuracy en test METU; 86 % en 21 imágenes web | MIT | Hugging Face, `model.pt` |
| ResNet18 ImageNet (torchvision) | 11,7 M | Imagen RGB 224 × 224 | Clasificación genérica de 1.000 clases; no especializado en grietas | BSD (torchvision) | Disponible vía torchvision |
| Baseline trivial (siempre `crack`) | 0 | Imagen RGB | 50 % accuracy, 100 % recall, 50 % precisión | no aplica | no aplica |

No se dispone en la información proporcionada de otros clasificadores de grietas comparables con métricas publicadas, por lo que la comparativa se limita al backbone base y al baseline trivial.

## Limitaciones y advertencias
- Brecha de generalización: el 99,7 % de accuracy corresponde a imágenes del mismo dataset (parches de 227 × 227 px del campus de la METU); sobre 21 imágenes nuevas de la web la accuracy cae al 86 % y el recall al 80 %.
- Los errores se concentran en grietas finas, capilares o de bajo contraste, y en objetos lineales que se confunden con grietas (por ejemplo, un cable sobre la superficie).
- No localiza la grieta en la imagen ni estima su gravedad o peligrosidad; solo indica presencia a nivel de imagen completa.
- Uso fuera de alcance: fotografías de fachada completa, aéreas o de dron, otros materiales (ladrillo, yeso, azulejo, superficies pintadas) y cualquier decisión sobre personas.
- No debe usarse para decisiones de seguridad estructural sin revisión de un ingeniero; la model card lo excluye explícitamente.
- Entrenado con solo 2.800 imágenes y 1.026 parámetros ajustables: la cabeza lineal no puede corregir sesgos del backbone ni adaptarse a dominios visuales distintos.
- Riesgo de alucinación en sentido amplio: falsos positivos y negativos con confianza alta sobre entradas fuera de distribución, como el cable marcado como grieta al 97 %.
- Licencia MIT: permite uso comercial y modificación, pero no hay garantías ni validación de producción por parte de los autores; es un artefacto de curso académico.
- Sin versiones cuantizadas ni formatos alternativos publicados, lo que obliga a usar PyTorch y a replicar exactamente el preprocesado de ImageNet en inferencia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day4-group7-crack-classifier
- Repositorio GitHub del pipeline completo: https://github.com/iaac-maai/group7_day4_assignment
- Dataset METU Concrete Crack (Mendeley Data, DOI 10.17632/5y9wdsg2zt.2): https://data.mendeley.com/datasets/5y9wdsg2zt
- Espejo del dataset en Kaggle: https://www.kaggle.com/datasets/arunrk7/surface-crack-detection
- Pesos (`model.pt`): https://huggingface.co/iaac-maai/day4-group7-crack-classifier/resolve/main/model.pt
