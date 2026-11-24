# histoforge/puma-melanoma-nuclei

## Resumen

PUMA Melanoma Nuclei es un modelo de segmentación de instancias nucleares especializado en imágenes de patología de melanoma humano, desarrollado por el proyecto histoforge. Se construye sobre el backbone ViT-Large de DINOv3 (`timm/vit_large_patch16_dinov3.lvd1689m`) mediante un adaptador denominado `dinov3-adapter-cellpose`, orientado a la detección y delineado de núcleos celulares en preparaciones histológicas teñidas con H&E y otras tinciones rutinarias.

El modelo aborda una tarea clásica en patología computacional: la segmentación de núcleos individuales (instance segmentation) a partir de imágenes de portaobjetos completos o parches. La elección de DINOv3 como backbone aporta representaciones auto-supervisadas de alta calidad transferibles a dominios histológicos, mientras que el adaptador tipo Cellpose facilita la predicción de flujos y máscaras de instancia sin necesidad de un decodificador pesado.

Es relevante ahora porque DINOv3 ha demostrado mejoras sustanciales frente a DINOv2 en tareas densas de visión, y su aplicación a patología oncológica (melanoma) responde a la demanda de herramientas reproducibles para cuantificación nuclear, grading asistido y análisis morfométrico en investigación traslacional. El acceso está restringido (gated) y la licencia queda sujeta a los términos de DINOv3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-Large (DINOv3) con adaptador tipo Cellpose para segmentación de instancias |
| Parametros totales | no disponible (repo de 1.3 GB; backbone ViT-L de ~300 M según `vit_large_patch16`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada por parches de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | dinov3 (marcada como `license:other` en Hugging Face) |
| Formato de pesos | no disponible (librería `histoforge`; probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo combina un Vision Transformer Large con parches de 16x16 preentrenado con DINOv3 (`vit_large_patch16_dinov3.lvd1689m`, preentrenamiento sobre el dataset LVD-1689M) como extractor de características, sobre el que se aplica un adaptador `dinov3-adapter-cellpose`. Este adaptador sigue el paradigma de Cellpose: predicción de mapas de flujo espacial y de probabilidad celular para resolver instancias mediante seguimiento de gradientes, lo que evita depender de propuestas de cajas o de NMS.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset de melanoma, ni sobre si se emplearon técnicas de aumento específicas de histología (jitter de color, elastic deformation) o ajuste fino completo frente a congelación del backbone. Tampoco se documenta si hubo una fase de refinamiento con datos anotados por patólogos ni métricas de validación cruzada. La referencia `arxiv:2508.10104` en las etiquetas apunta a la publicación asociada, pero su contenido no está incluido en la información proporcionada.

## Capacidades

- Segmentación de instancias nucleares en imágenes de patología de melanoma.
- Clasificación de imagen a nivel de parche (etiqueta `image-classification`).
- Segmentación semántica e de instancias (`image-segmentation`, `instance-segmentation`).
- Extracción de características densas mediante backbone DINOv3, reutilizable para tareas aguas abajo.
- Procesamiento de imágenes histológicas humanas teñidas (dominio `pathology`, `human`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual.
- No se documentan capacidades multimodales (visión-lenguaje), audio ni thinking mode.

## Casos de uso

- Cuantificación nuclear en investigación oncológica: contar y medir núcleos en parches de melanoma para estimar densidad celular, área nuclear media y pleomorfismo, aprovechando la segmentación de instancias del adaptador Cellpose.
- Análisis morfométrico de portaobjetos completos: integrado en pipelines de patología computacional (por ejemplo, con tiling y agregación de máscaras) para generar estadísticas por región tumoral.
- Apoyo al grading asistido: extraer características nucleares que alimenten clasificadores posteriores de grado histológico o de índice mitótico en estudios retrospectivos.
- Control de calidad de tinciones: detectar parches con mala tinción o artefactos comparando la distribución de máscaras nucleares frente a referencias.
- Generación de datasets anotados: usar las máscaras predichas como preanotación para revisión por patólogos, reduciendo el coste de anotación manual en proyectos de melanoma.
- Investigación traslacional y reproducibilidad: servir como extractor congelado de características DINOv3 para experimentos de clasificación de subtipos tumorales con pocos datos etiquetados.
- Segmentación comparativa entre tinciones: evaluar la robustez del modelo en H&E frente a inmunohistoquímica (sujeto a validación empírica, no documentada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un ViT-L/16 (~300 M parámetros) en fp16 se requiere aproximadamente 1-2 GB para el backbone, más memoria para activaciones según el tamaño del parche de entrada y el adaptador.
- GPU recomendadas: no disponible; por tamaño, una GPU con al menos 8-16 GB (RTX 3080/4080/4090, A10, L4) sería suficiente para inferencia en fp16, y A100/H100 para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: previsiblemente sí en RTX 3060 12 GB o superiores, aunque no está confirmado por el autor.
- Opciones de despliegue: la librería `histoforge` es la vía indicada; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Backbone | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| histoforge/puma-melanoma-nuclei | Segmentación de núcleos en melanoma | ViT-L DINOv3 + adaptador Cellpose | parches de imagen | dinov3 (`other`) | gated en HF |
| Cellpose (cyto/cyto3) | Segmentación de núcleos/células general | U-Net | parches de imagen | BSD-3 (versiones públicas) | abierto |
| HoVer-Net | Segmentación y clasificación nuclear | Preact-ResNet50 + ramas | parches de imagen | código público con restricciones | GitHub |
| StarDist | Detección de núcleos por estrellas convexas | U-Net | parches de imagen | BSD-3 | abierto |

No se dispone de métricas comparativas publicadas para este modelo frente a las alternativas citadas.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga.
- Licencia `dinov3` con etiqueta `license:other`: es imprescindible revisar los términos de DINOv3 para uso comercial; pueden existir restricciones adicionales.
- Modelo especializado en melanoma humano: el rendimiento fuera de ese dominio (otros tejidos, especies o tinciones) no está documentado y probablemente degrade.
- Riesgo de error en núcleos solapados, mitosis y células con bordes poco definidos, habitual en segmentación de instancias en histología.
- Sin información sobre sesgos de dataset (composición demográfica, centros hospitalarios, escáneres) que pueden afectar a la generalización.
- No es un dispositivo médico: no debe usarse para diagnóstico clínico sin validación regulatoria.
- No procesa texto ni lenguaje; no apto para tareas conversacionales.
- Sin datos publicados de benchmarks, latencia ni requisitos oficiales de hardware.

## Enlaces

- Hugging Face: https://huggingface.co/histoforge/puma-melanoma-nuclei
- Paper referenciado en etiquetas: https://arxiv.org/abs/2508.10104
- Modelo base (timm DINOv3 ViT-L/16): https://huggingface.co/timm/vit_large_patch16_dinov3.lvd1689m
- Repositorio DINOv3 (Meta): https://github.com/facebookresearch/dinov3
- Cellpose: https://github.com/MouseLand/cellpose
