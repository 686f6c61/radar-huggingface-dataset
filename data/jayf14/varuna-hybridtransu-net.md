# JayF14/varuna-HybridTransU-net

## Resumen

VARUNA es un motor de inteligencia artificial multitarea para predicción inmediata (nowcasting) de fenómenos meteorológicos extremos, desarrollado por JayF14. Su objetivo es anticipar con 2 a 6 horas de antelación la probabilidad de cloudbursts (lluvias torrenciales repentinas), tormentas severas e inundaciones repentinas en regiones de alta complejidad topográfica como el Himalaya indio. El modelo combina una arquitectura híbrida TransUNet con compresión temporal 3D y extracción espacial 2D, estabilizada mediante un cuello de botella de atención multi-cabeza (MHSA). Con 17,6 millones de parámetros, procesa tres modalidades de entrada sincronizadas: datos de reanálisis atmosférico IMDAA, imágenes satelitales INSAT-3D y topografía CartoDEM. Su relevancia radica en que aborda un problema crítico de seguridad civil con un enfoque de código abierto y un diseño orientado a maximizar la sensibilidad (recall) en eventos de alto impacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid TransUNet (3D Conv temporal + U-Net 2D + MHSA bottleneck) |
| Parametros totales | 17,6 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por computadora, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de datos geoespaciales, no de lenguaje) |
| Licencia | MIT (segun model card; no confirmado en metadatos de HuggingFace) |
| Formato de pesos | no disponible (probablemente PyTorch, sin especificar) |

## Arquitectura y entrenamiento

VARUNA emplea una arquitectura híbrida TransUNet que integra tres ramas de entrada: termodinámica IMDAA (30 parámetros atmosféricos en 6 marcos temporales), satélite INSAT-3D (4 canales espectrales incluyendo tasa de caída de temperatura de nubes) y terreno CartoDEM (elevación y pendiente). La compresión temporal se realiza con capas Conv3d, mientras que la extracción espacial usa una U-Net 2D con un cuello de botella de atención multi-cabeza a resolución 64×64 (4096 tokens). El entrenamiento se realizó sobre un corpus de 190 GB correspondiente a agosto de 2019 en los estados de Uttarakhand e Himachal Pradesh, con 55 ventanas temporales (44 de entrenamiento y 11 de validación temporal estricta). Se utilizó una función de pérdida DiceFocalLoss con amplificación por tarea (4× para cloudburst, 1× para tormentas, 6× para inundaciones) para contrarrestar el fuerte desequilibrio de clases (ratio positivo 1:460). El proceso iterativo incluyó 7 ciclos de entrenamiento con mejoras progresivas en alineación temporal, etiquetado y arquitectura.

## Capacidades

- Predicción simultánea de tres tipos de eventos extremos: cloudbursts, tormentas severas e inundaciones repentinas.
- Procesamiento multimodal de datos meteorológicos: reanálisis atmosférico, imágenes satelitales multiespectrales y topografía.
- Ventana de predicción de 2 a 6 horas (nowcasting), con salida probabilística por píxel.
- Fusión tardía de información de terreno para condicionar la trayectoria de inundaciones.
- Diseño optimizado para alta sensibilidad (recall) en eventos raros, priorizando la detección sobre la precisión.
- Inferencia con tensores de entrada de dimensiones fijas: (B, 30, 6, 256, 256) para IMDAA, (B, 4, 6, 256, 256) para satélite y (B, 2, 256, 256) para terreno.

## Casos de uso

- Sistemas de alerta temprana para cloudbursts: el modelo puede integrarse en plataformas de protección civil para emitir avisos con 2-6 horas de antelación, priorizando la detección de eventos catastróficos aunque genere falsos positivos.
- Gestión de emergencias en cuencas hidrográficas: la salida de probabilidad de inundación repentina, combinada con el mapa de pendientes, permite activar protocolos de evacuación en zonas de alto riesgo.
- Planificación de infraestructura crítica: los mapas de riesgo generados por VARUNA pueden usarse para diseñar carreteras, puentes y asentamientos en regiones montañosas, evitando zonas propensas a deslizamientos e inundaciones.
- Monitorización meteorológica operativa: agencias meteorológicas pueden desplegar el modelo como complemento a los modelos numéricos tradicionales, aportando una capa de nowcasting de alta resolución espacial.
- Investigación en ciencias de la Tierra: el modelo sirve como referencia para estudiar la dinámica de convección profunda en topografía compleja, y su arquitectura puede adaptarse a otras regiones con datos similares.
- Entrenamiento y simulación para gestión de desastres: los escenarios generados por VARUNA pueden alimentar simulacros y ejercicios de respuesta ante emergencias, mejorando la preparación de los equipos.

## Benchmarks y rendimiento

Los resultados se evaluaron sobre el conjunto de validación temporal estricto (11 ventanas, 23-25 de agosto de 2019), no visto durante el entrenamiento. La métrica dominante es el recall, dado el contexto de alerta temprana.

| Hazard | Precision | Recall | F1-Score | IoU |
|---|---|---|---|---|
| Cloudburst | 18,29 % | 83,36 % | 30,00 % | 17,65 % |
| Tormenta severa | 80,56 % | 92,17 % | 85,97 % | 75,40 % |
| Inundacion repentina | 8,24 % | 80,58 % | 14,94 % | 8,08 % |

No se han publicado resultados comparativos con otros modelos de nowcasting en la informacion disponible.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. Dado el tamaño del modelo (17,6 millones de parámetros) y las dimensiones de entrada (tensores de 256×256 con 6 marcos), es plausible que pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero no hay confirmación del autor. Para despliegue operativo se recomendaría una GPU con al menos 8 GB de VRAM, aunque no se especifican frameworks de inferencia (vLLM, TGI, etc.) al tratarse de un modelo de visión, no de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (nowcasting meteorológico multimodal) dentro de los datos proporcionados. Se recomienda consultar la literatura de predicción inmediata con deep learning (por ejemplo, modelos basados en U-Net o Transformers aplicados a datos de radar o satélite) para establecer comparaciones.

## Limitaciones y advertencias

- La precisión es baja para cloudbursts (18,29 %) e inundaciones (8,24 %), lo que genera un alto número de falsos positivos. Esto es aceptable en alerta temprana, pero puede causar fatiga de alertas en operación continua.
- El modelo fue entrenado únicamente con datos de un mes (agosto 2019) y una región concreta (Himalaya indio). Su generalización a otras estaciones del año o regiones no está validada.
- El desequilibrio extremo de clases (1:460) limita la capacidad de aprender patrones de eventos muy raros, a pesar de las técnicas de amplificación de pérdida.
- La licencia MIT aparece en la model card, pero no está confirmada en los metadatos de HuggingFace; se recomienda verificar antes de uso comercial.
- No se proporcionan pesos en formatos estándar de cuantización (GGUF, etc.), lo que puede dificultar su despliegue en entornos con recursos limitados.
- El modelo no es un sistema de lenguaje: no admite entrada de texto ni generación de respuestas; su uso está restringido a tensores numéricos de dimensiones fijas.

## Enlaces

- [HuggingFace - JayF14/varuna-HybridTransU-net](https://huggingface.co/JayF14/varuna-HybridTransU-net)
- [Repositorio GitHub relacionado (VARUNA-AI)](https://github.com/shoubhyasinha21/VARUNA-AI) (no oficial, puede contener implementaciones alternativas)
