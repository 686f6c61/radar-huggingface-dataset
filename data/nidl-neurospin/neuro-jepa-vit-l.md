# nidl-neurospin/neuro-jepa-vit-l

## Resumen

Neuro-JEPA ViT-L es un modelo fundacional auto-supervisado para resonancia magnética cerebral 3D, desarrollado por el grupo NYUMedML (NYU Langone Health) y empaquetado para la librería nidl por nidl-neurospin (NeuroSpin). Extiende el marco V-JEPA 2 al dominio volumétrico: en lugar de predecir píxeles, predice representaciones latentes enmascaradas de volúmenes cerebrales, lo que lo hace adecuado para extracción de características y ajuste fino en tareas downstream de neuroimagen.

El modelo emplea un encoder 3D ViT-L de 24 capas con mezcla de expertos dispersa (MoE), 431 millones de parámetros y representaciones de 1024 dimensiones. Se preentrenó sobre aproximadamente 1,55 millones de exploraciones T1, T2 y FLAIR de NYU Langone Health, lo que le confiere cobertura multimodal de secuencias estructurales habituales en estudios clínicos.

Es relevante porque ofrece una alternativa de pesos abiertos (aunque con acceso restringido y licencia no comercial) a los modelos fundacionales de neuroimagen, con una fidelidad verificada bit a bit frente al código oficial sobre 3.984 imágenes de OpenBHB. Este repositorio de HuggingFace no contiene pesos: solo la configuración de nidl que los descarga y renombra desde el repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D ViT-L (24 capas) con mezcla de expertos dispersa (`VisionTransformer3DMoE`) |
| Parametros totales | 431M (encoder) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (entrada volumétrica fija de 1 × 96 × 108 × 96) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen médica, sin capacidades lingüísticas) |
| Licencia | Pesos: CC-BY-NC-ND 4.0 (no comercial, no clínico, sin derivados). Configuración nidl: CeCILL-B |
| Formato de pesos | no disponible (descarga desde NYUMedML/Neuro-JEPA-Large; el repositorio no aloja pesos) |

## Arquitectura y entrenamiento

El encoder es un Vision Transformer 3D de 24 capas con capas de mezcla de expertos dispersa, que procesa volúmenes de 96 × 108 × 96 vóxeles y produce un vector de 1024 dimensiones por volumen. El preentrenamiento sigue el paradigma JEPA (Joint Embedding Predictive Architecture) en su variante V-JEPA 2 adaptada a volúmenes: se enmascaran regiones del volumen y el modelo predice sus representaciones latentes en el espacio de embeddings, en lugar de reconstruir intensidades. Solo se publica el encoder; el predictor permanece con pesos aleatorios en la configuración de nidl.

Los datos de preentrenamiento comprenden aproximadamente 1,55 millones de exploraciones de RM cerebral (T1w, T2w y FLAIR) de NYU Langone Health. El pipeline de preprocesamiento (`NeuroJEPAPreprocessing`) reorienta el volumen a RAS, reescala intensidades a [0, 1], recorta alrededor del cerebro y redimensiona a 96 × 108 × 96. La entrada esperada es RM con cráneo eliminado y corrección de sesgo, registrada afín a MNI152 a 1 mm (por ejemplo, la modalidad `quasiraw` de OpenBHB). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO (no aplicable en un modelo auto-supervisado de imagen).

## Capacidades

- Extracción de características de volúmenes de RM cerebral 3D (T1w, T2w, FLAIR) con salida de 1024 dimensiones por volumen.
- Aprendizaje auto-supervisado de representaciones latentes, útil como backbone congelado para regresión y clasificación downstream.
- Ajuste fino supervisado mediante el método `fit` del estimador `NeuroJEPA`.
- Procesamiento multimodal de secuencias estructurales (T1, T2, FLAIR) dentro del mismo espacio de representación.
- Preprocesamiento integrado (`NeuroJEPAPreprocessing`) con reorientación, reescalado y redimensionado configurables.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión natural, audio ni modo thinking.
- No dispone de capacidades multilingües (no procesa texto).

## Casos de uso

- Predicción de edad cerebral: regresión ridge sobre características congeladas alcanza un MAE de 3,00 años (R² 0,89) en el conjunto de test de OpenBHB (757 participantes), lo que lo hace directamente utilizable como biomarcador de envejecimiento.
- Búsqueda de similitud entre estudios: los embeddings de 1024 dimensiones permiten agrupar y recuperar volúmenes con patrones estructurales parecidos, útil en cohortes de investigación para selección de casos.
- Clasificación de patología con ajuste fino: el encoder puede afinarse con `fit` sobre etiquetas diagnósticas (por ejemplo, demencia o lesiones), aprovechando el preentrenamiento sobre 1,55 millones de volúmenes.
- Extracción de features para pipelines de machine learning clásico: sustituir descriptores volumétricos manuales por embeddings aprendidos en modelos de regresión o SVM sobre cohortes como OpenBHB o UK Biobank.
- Control de calidad y armonización de datos: detectar outliers o escaneos mal preprocesados comparando la distribución de embeddings frente a una cohorte de referencia.
- Investigación en neuroimagen multimodal: usar un único backbone para T1, T2 y FLAIR y comparar representaciones entre secuencias sin entrenar modelos separados.
- Preentrenamiento como inicialización para tareas con pocos datos: fine-tuning en cohortes pequeñas aprovechando las representaciones latentes aprendidas de forma auto-supervisada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la fidelidad y la tarea de predicción de edad sobre OpenBHB:

| Tarea | Metrica | Valor |
|---|---|---|
| Predicción de edad (ridge sobre features congeladas, test OpenBHB, 757 sujetos) | MAE | 3,00 años |
| Predicción de edad (ridge sobre features congeladas, test OpenBHB, 757 sujetos) | R² | 0,89 |
| Fidelidad frente al código oficial (3.984 imágenes OpenBHB) | Igualdad bit a bit | Verificada |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 431M parámetros en fp32, el encoder ocupa aproximadamente 1,7 GB de pesos; el pico de memoria depende del tamaño de batch y de las activaciones del ViT 3D sobre volúmenes de 96 × 108 × 96.
- GPU recomendadas: no especificadas por los autores. Por tamaño, una GPU consumer de 8-16 GB (RTX 3060/4070/4080) debería bastar para inferencia en fp32 con batches pequeños; A100 o H100 serían adecuadas para extracción a gran escala.
- Cabe en GPU consumer: probablemente sí para inferencia; el ajuste fino requiere más memoria (no cuantificada en la información disponible).
- Opciones de despliegue: la librería nidl (`pip install nidl[pretrained]`) con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de neuroimagen (por ejemplo, otros modelos fundacionales de RM cerebral) que permitan una comparación rigurosa de parámetros, contexto y rendimiento. La comparación cuantitativa se indica como no disponible.

## Limitaciones y advertencias

- Licencia de los pesos CC-BY-NC-ND 4.0: prohíbe uso comercial, uso clínico y creación de derivados. Cualquier despliegue en producto o práctica clínica está excluido.
- Los pesos son de acceso restringido (gated): es necesario solicitarlos en la página de NYUMedML/Neuro-JEPA-Large y autenticarse con `huggingface-cli login`. Este repositorio no aloja pesos.
- Solo se publica el encoder; el predictor del marco JEPA permanece con pesos aleatorios, por lo que no se puede reproducir el objetivo de preentrenamiento completo.
- Entrada muy restringida: RM con cráneo eliminado, corrección de sesgo, registro afín a MNI152 a 1 mm y redimensionado a 96 × 108 × 96. Volúmenes fuera de este pipeline producen características no válidas.
- La resolución de entrada (96 × 108 × 96) limita la captura de estructuras finas; no está pensado para segmentación de alta resolución.
- Riesgo de sesgo poblacional: el preentrenamiento proviene de una única institución (NYU Langone Health); la generalización a otras poblaciones y equipos no está documentada.
- No es un dispositivo médico ni ha sido validado para diagnóstico; los autores restringen explícitamente el uso clínico.
- No procesa texto ni otros idiomas; no admite tool calling ni razonamiento multi-paso.
- No se documentan tasas de alucinación ni calibración en tareas clínicas.

## Enlaces

- HuggingFace (configuración nidl): https://huggingface.co/nidl-neurospin/neuro-jepa-vit-l
- Pesos originales (gated): https://huggingface.co/NYUMedML/Neuro-JEPA-Large
- Paper: https://arxiv.org/abs/2606.14957
- Código original: https://github.com/NYUMedML/Neuro-JEPA
- Documentación de nidl: https://neurospin-deepinsight.github.io/nidl
- Ejemplo OpenBHB en nidl: https://neurospin-deepinsight.github.io/nidl/auto_examples/plot_pretrained_openbhb.html
- Repositorio nidl: https://github.com/neurospin-deepinsight/nidl
