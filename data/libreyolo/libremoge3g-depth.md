# LibreYOLO/LibreMoGe3g-depth

## Resumen

LibreMoGe3g-depth es un modelo de estimación de profundidad monocular y geometría métrica derivado de MoGe-3 ViT-g/14, desarrollado originalmente por Microsoft Research y reempaquetado por LibreYOLO en su formato de checkpoint propio. El modelo toma una imagen RGB y devuelve un mapa de profundidad métrica en metros, una nube de puntos en el sistema de coordenadas de la cámara, los intrínsecos de cámara en formato OpenCV y una máscara de validez. No es un modelo generativo de lenguaje: es un modelo de visión puro orientado a reconstrucción geométrica 3D a partir de una sola vista.

La arquitectura subyacente es un encoder DINOv2 ViT-g/14 (aproximadamente 1.100 millones de parámetros en el backbone ViT-g) con cabezas específicas para profundidad, point map e intrínsecos. El repositorio ocupa 5,0 GB, lo que es coherente con pesos en precisión completa de un ViT grande. La relevancia actual reside en que la geometría monocular métrica es un componente clave para pipelines de robótica, realidad aumentada, reconstrucción 3D y percepción en entornos donde no se dispone de sensores de profundidad dedicados.

El reempaquetado de LibreYOLO no modifica ningún tensor aprendido: únicamente añade metadatos de checkpoint v1.0 con la tarea `depth`. Esto significa que el comportamiento numérico es idéntico al del checkpoint oficial de MoGe-3, pero la integración se realiza a través de la librería `libreyolo` en lugar de las utilidades originales de Microsoft. La licencia declarada es MIT, con la salvedad de que el encoder DINOv2 subyacente está licenciado por Meta AI bajo Apache-2.0 y ambas notas se conservan en el fichero compuesto `LICENSE`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ViT-g/14 (encoder DINOv2) con cabezas de profundidad, point map e intrínsecos |
| Parámetros totales | no disponible (el repo pesa 5,0 GB; el backbone ViT-g/14 de DINOv2 ronda los 1.100 M en el encoder, cifra no confirmada en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (entrada visual, sin procesamiento de lenguaje) |
| Licencia | MIT (con componente DINOv2 Apache-2.0 de Meta AI) |
| Formato de pesos | checkpoint propietario de LibreYOLO v1.0 (`.pt`), derivado de `model.pt` de MoGe-3 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MoGe-3: un encoder ViT-g/14 basado en DINOv2 que extrae representaciones densas de la imagen de entrada, seguido de cabezas de predicción que producen simultáneamente profundidad métrica, mapa de puntos 3D en el marco de la cámara, intrínsecos de cámara (matriz K de 3×3 en convención OpenCV) y una máscara de validez que indica qué píxeles tienen predicción fiable. La elección de un ViT-g/14 implica parches de 14×14 y una resolución de trabajo relativamente alta, lo que favorece la precisión geométrica frente a la velocidad.

El entrenamiento original corresponde a Microsoft Research (MoGe-3), aunque la información proporcionada no detalla el volumen de datos, la composición del dataset ni si se emplearon técnicas de ajuste fino específicas como RLHF (no aplicable aquí) o entrenamiento con supervisión métrica multi-dataset. La innovación técnica destacable es la predicción conjunta de profundidad métrica y geometría de cámara en una sola pasada, lo que evita depender de calibración externa y permite obtener una nube de puntos directamente utilizable en pipelines 3D. El reempaquetado de LibreYOLO no introduce cambios en los pesos: solo añade metadatos de tarea y la integración con la API `LibreYOLO`.

## Capacidades

- Estimación de profundidad métrica monocular en metros, con valor `inf` en píxeles marcados como inválidos.
- Generación de point map denso de forma (H, W, 3) en coordenadas de cámara, en metros.
- Predicción de intrínsecos de cámara (matriz K de 3×3 en convención OpenCV) sin necesidad de calibración previa.
- Máscara de validez booleana por píxel para filtrar predicciones poco fiables.
- Reutilización de los mismos tensores para la tarea `normal` (normales de superficie), según indica la model card.
- Integración con la librería `libreyolo` mediante `LibreYOLO("LibreMoGe3g-depth.pt").predict(...)`.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D a partir de una sola imagen: el modelo devuelve point map y profundidad métrica, lo que permite generar nubes de puntos directamente consumibles por herramientas como Open3D o trimesh sin calibración manual.
- Robótica móvil y navegación: la profundidad métrica en metros y los intrínsecos predichos permiten estimar distancias a obstáculos en tiempo de ejecución, útil en robots con cámara monocular y sin LiDAR.
- Realidad aumentada: la combinación de profundidad y máscara de validez facilita la oclusión correcta de objetos virtuales y la colocación de anclas 3D sobre superficies reales.
- Digitalización de escenas y gemelos digitales: el point map en coordenadas de cámara permite reconstruir geometría de interiores o exteriores a partir de fotografías, integrable en pipelines de fotogrametría ligera.
- Preprocesado para modelos generativos 3D o de imagen: la profundidad métrica sirve como condicionamiento geométrico en pipelines de difusión para control de estructura (por ejemplo, generación condicionada por profundidad).
- Automoción y ADAS de bajo coste: estimación de distancias relativas a peatones y vehículos con una única cámara, como complemento a sistemas de detección de objetos.
- Análisis de imágenes médicas o industriales donde se requiere profundidad relativa fiable y máscara de validez para descartar regiones ambiguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio pesa 5,0 GB, por lo que en FP32 se necesita al menos ese orden de magnitud más overhead de activaciones. En FP16 cabría esperar aproximadamente la mitad, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible en la información. Por el tamaño del backbone ViT-g/14, se requiere una GPU con al menos 8-16 GB de VRAM en precisiones reducidas; una RTX 4090 (24 GB) o A100/H100 son opciones razonables, pero no se confirman cifras concretas.
- ¿Cabe en consumer GPU?: probablemente sí en GPUs de gama alta con 16 GB o más en FP16, aunque no se dispone de confirmación oficial.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` (API `LibreYOLO`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMoGe3g-depth | no disponible (repo 5,0 GB) | imagen RGB | profundidad + point map + intrínsecos | MIT (DINOv2 Apache-2.0) | Hugging Face (LibreYOLO) |
| MoGe-3 ViT-g/14 (original, Ruicheng/moge-3-vitg) | mismo backbone | imagen RGB | profundidad + point map + intrínsecos | MIT | Hugging Face |
| Depth Anything V2 | no disponible en la información | imagen RGB | profundidad relativa/métrica | no disponible en la información | Hugging Face |
| MiDaS | no disponible en la información | imagen RGB | profundidad relativa | no disponible en la información | Hugging Face |

La comparativa con Depth Anything V2 y MiDaS se incluye como referencia de categoría, pero los datos concretos de parámetros, contexto y licencia de esos modelos no se han proporcionado en la información disponible, por lo que no se pueden verificar aquí.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto ni mantiene conversaciones; no debe evaluarse con métricas de LLM.
- La máscara de validez es esencial: los píxeles marcados como inválidos contienen `inf` en el mapa de profundidad y deben filtrarse antes de cualquier uso geométrico.
- Riesgo de predicciones erróneas en superficies reflectantes, transparentes, sin textura o con iluminación extrema, habitual en estimación monocular de profundidad.
- La licencia MIT del checkpoint convive con la licencia Apache-2.0 del encoder DINOv2 de Meta AI; es responsabilidad del usuario conservar ambas notas al redistribuir.
- El formato de pesos es propietario de LibreYOLO (`.pt` con metadatos v1.0); no es directamente compatible con cargadores estándar de PyTorch sin la librería `libreyolo`.
- No se han publicado benchmarks en la información disponible, por lo que no se puede avalar su precisión frente a alternativas sin evaluación propia.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se especifican requisitos de resolución de entrada ni límites de tamaño de imagen; conviene consultar el repositorio de LibreYOLO para detalles de preprocesado.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreMoGe3g-depth
- Modelo original MoGe-3 ViT-g/14: https://huggingface.co/Ruicheng/moge-3-vitg
- Repositorio de código de MoGe (Microsoft): https://github.com/microsoft/MoGe/tree/74fbce054ebed49800de42d0ad0e83495065719a
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
