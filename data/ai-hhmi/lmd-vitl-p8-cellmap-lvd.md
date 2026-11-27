# ai-hhmi/lmd-vitl-p8-cellmap-lvd

## Resumen

lmd-vitl-p8-cellmap-lvd es un modelo de segmentación semántica de organelos celulares para datos de microscopía electrónica volumétrica (EM, típicamente FIB-SEM). Lo desarrolla el Allen Institute for Neural Dynamics (organización ai-hhmi en Hugging Face) y resuelve un problema muy concreto en biología celular: asignar a cada vóxel de una imagen 3D de tejido una clase de organelo entre el esquema de etiquetado de la CellMap Segmentation Challenge, con 75 canales de salida. Es relevante porque la segmentación manual de volúmenes de EM a resolución nanométrica es inviable a escala, y este modelo automatiza la tarea sobre datos con tamaños de vóxel nativos heterogéneos (de 2 a 8 nm).

Arquitectura: un encoder Vision Transformer 3D (DINOv3 ViT-L/16 preentrenado en LVD-1689M y después adaptado con SimMIM sobre el dataset LMD) acoplado a un decoder UNETR, afinado de extremo a extremo. El checkpoint publicado corresponde al paso 15.000 de un entrenamiento de 25.000 pasos. El modelo tiene 304.816.181 parámetros y un repositorio de 1,2 GB en safetensors.

No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en tokens. Su entrada es un tensor `(B, 1, X, Y, Z)` con intensidades en [0, 1] y lados múltiplos de 8; su salida es `(B, 75, X, Y, Z)` de logits. Está pensado para investigadores que trabajan con volúmenes de EM y necesitan etiquetado denso de organelos a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer 3D (DINOv3 ViT-L/16 adaptado) + decoder UNETR |
| Parametros totales | 304.816.181 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D; ventana de inferencia de 256³ vóxeles con stride 128) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; inferencia con autocast bf16 en CUDA) |
| Idiomas soportados | no aplica (modelo de imagen; no procesa texto) |
| Licencia | dinov3-license (license: other) |
| Formato de pesos | safetensors (`model.safetensors`) |
| Entrada | `(B, 1, X, Y, Z)`, un canal, intensidades en [0, 1], lados múltiplos de 8 |
| Salida | `(B, 75, X, Y, Z)` logits; canal k = clase CellMap k |
| Tamaño del repositorio | 1,2 GB |
| Modelo base | ai-hhmi/lmd-vitl-p8-simmim-lvd |
| Pipeline | image-segmentation |

## Arquitectura y entrenamiento

El encoder es `ai-hhmi/lmd-vitl-p8-simmim-lvd`, que parte de DINOv3 ViT-L/16 (preentrenado en LVD-1689M) y se adapta al dominio de microscopía electrónica con SimMIM durante 100.000 pasos sobre el dataset LMD. Sobre ese encoder se añade un decoder UNETR y se afina todo de extremo a extremo. La entrada es volumétrica 3D de un solo canal y la salida es un mapa denso de 75 canales, uno por clase del esquema de la CellMap Segmentation Challenge.

El ajuste se hizo sobre 226 recortes anotados procedentes de 22 volúmenes de CellMap, cada uno a su tamaño de vóxel nativo (entre 2 y 8 nm). Los objetivos de entrenamiento fueron las clases hoja de CellMap: 38 de las 53 clases hoja aparecen en los recortes de entrenamiento. Las clases compuestas (por ejemplo `mito`, que es la unión de `mito_mem`, `mito_lum` y `mito_ribo`) nunca fueron objetivo directo; se obtienen uniendo las etiquetas de sus hojas, tal como lista `config["classes"][k]["members"]`. El canal 0 (no anotado) se ignora en el entrenamiento. El checkpoint publicado es el paso 15.000 de una ejecución de 25.000 pasos.

Para evaluar volúmenes completos, el equipo predice cada recorte a su tamaño de vóxel nativo en ventanas de 256³ con stride de 128 vóxeles bajo autocast bf16, convierte los logits en probabilidades softmax, promedia ventanas solapadas con pesos que crecen linealmente desde las caras hacia el centro y toma el argmax.

## Capacidades

- Segmentación semántica densa de organelos en volúmenes de microscopía electrónica (FIB-SEM), con 75 canales de salida correspondientes al esquema de clases de CellMap.
- Manejo de datos a tamaños de vóxel nativos heterogéneos (2 a 8 nm) sin remuestreo explícito en el flujo de uso documentado.
- Predicción por ventanas 3D (256³, stride 128) con agregación ponderada de solapamientos para volúmenes completos.
- Etiquetado de clases hoja y derivación de clases compuestas mediante unión de sus miembros.
- Separación limpia encoder/decoder en los pesos (`encoder.` y `decoder_out.`), lo que permite reutilizar el encoder con otra cabeza.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión 2D genérica, audio ni generación de texto.

## Casos de uso

- Segmentación de organelos a escala en datasets de FIB-SEM: procesar volúmenes completos por ventanas de 256³ con stride 128 y agregación ponderada, obteniendo mapas densos de 75 canales listos para análisis morfométrico.
- Cuantificación de mitocondrias: unir las etiquetas de `mito_mem`, `mito_lum` y `mito_ribo` (ids 3, 4 y 5) para obtener la clase compuesta `mito` y calcular volumen, número y distribución por célula.
- Análisis de ultraestructura celular en neurociencia: etiquetar orgánulos en volúmenes de tejido nervioso a resolución nanométrica para estudiar organización sináptica y distribución de orgánulos en el neurópilo.
- Preetiquetado para anotación humana: generar segmentaciones automáticas que un/a experto/a revise y corrija, reduciendo el coste de anotación manual de volúmenes de EM.
- Extracción de características para modelos posteriores: usar el encoder (`net.encoder`) como extractor de representaciones 3D de EM y entrenar cabezas específicas para tareas derivadas, como afinidades neuronales.
- Control de calidad y comparación entre muestras: aplicar el modelo a volúmenes de distintos protocolos de preparación (2 a 8 nm de vóxel) y comparar la composición de organelos entre condiciones experimentales.
- Docencia y reproducibilidad: reproducir el flujo de inferencia documentado con el código de `mia-train` en el commit `4e71956` para validar resultados sobre recortes de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación sobre 43 recortes de prueba (predicción a tamaño de vóxel nativo, ventanas 256³, stride 128, bf16, agregación ponderada y argmax), e indica que en esos 43 recortes el argmax eligió 36 canales, todos ellos clases hoja, y nunca el canal 0, un canal compuesto ni una clase hoja ausente del entrenamiento. No se aportan métricas numéricas (Dice, IoU u otras) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 304,8 M de parámetros, los pesos en bf16 ocupan aproximadamente 0,6 GB; el consumo real depende del tamaño de la ventana 3D (256³ es la usada en la evaluación) y de las activaciones intermedias del ViT 3D y del decoder UNETR.
- GPU recomendadas: no especificadas por el autor. El flujo documentado usa CUDA con autocast bf16 y PyTorch 2.13; GPUs con soporte bf16 (A100, H100, RTX 4090, RTX 3090 y similares) son las candidatas naturales.
- ¿Cabe en GPU de consumo? Los pesos caben con holgura en cualquier GPU con 8 GB o más; la viabilidad con ventanas grandes de 256³ depende de las activaciones y no está cuantificada en la información disponible.
- Opciones de despliegue: el uso documentado es PyTorch + `safetensors` + `huggingface_hub`, con el código de modelo de `mia-train` en el commit `4e71956` (poniendo `mia-train/src` en el path). También se puede usar el entrenador propio de `mia-train` o su `predict.py` construyendo `SemanticSegmentation` desde `config["algorithm"]` y cargando con `safetensors.torch.load_model`. No se documentan exportaciones a ONNX, TensorRT, llama.cpp, vLLM, TGI ni Ollama (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai-hhmi/lmd-vitl-p8-cellmap-lvd (este) | 304,8 M | ViT 3D + UNETR, fine-tuning desde SimMIM/LVD | 75 clases de organelos CellMap | dinov3-license | Hugging Face |
| ai-hhmi/lmd-vitl-p8-affinity-lvd | no disponible | ViT 3D + cabeza de afinidades, desde el mismo encoder SimMIM/LVD | Afinidades neuronales | no disponible | Hugging Face |
| ai-hhmi/lmd-vitl-p8-affinity-scratch | no disponible | ViT 3D + afinidades, desde inicialización aleatoria | Afinidades neuronales | no disponible | Hugging Face |
| ai-hhmi/lmd-vitl-p8-simmim-lvd | no disponible | ViT 3D con SimMIM (encoder base) | Representaciones de EM (preentrenamiento) | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento numérico entre estos modelos; la comparación se limita a enfoque, objetivo y disponibilidad.

## Limitaciones y advertencias

- Cobertura de clases limitada: solo 38 de las 53 clases hoja de CellMap aparecen en los recortes de entrenamiento; el modelo no predice clases hoja ausentes del entrenamiento.
- Las clases compuestas no son objetivo de entrenamiento; deben derivarse por unión de sus hojas y pueden heredar errores de las clases hoja constituyentes.
- El canal 0 (no anotado) se ignora en el entrenamiento y no debe interpretarse como una predicción fiable.
- Dominio restringido: entrenado sobre 226 recortes de 22 volúmenes de CellMap a tamaños de vóxel de 2 a 8 nm; el comportamiento fuera de ese rango de resolución o en protocolos de preparación distintos no está caracterizado.
- La licencia es `dinov3-license` (license: other), no una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial o redistribución.
- Dependencia de código externo: el uso requiere el repositorio `mia-train` en el commit `4e71956`; sus paquetes de nivel superior (`models`, `layers`, `utils`, `distributed`, `data`) colisionan con paquetes homónimos de terceros, como `distributed` de Dask.
- Riesgo de alucinación no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de predicciones espurias en regiones con artefactos de imagen, baja relación señal/ruido o morfologías no vistas en entrenamiento.
- No se han publicado métricas de benchmarks en la información disponible, lo que dificulta estimar la calidad esperada en un dataset nuevo.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgo hacia la distribución de tejidos, protocolos y laboratorios representados en CellMap.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-hhmi/lmd-vitl-p8-cellmap-lvd
- Modelo base (encoder SimMIM/LVD): https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-lvd
- Variante SimMIM desde cero: https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-scratch
- Variante de afinidades neuronales (LVD): https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-lvd
- Variante de afinidades neuronales (scratch): https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-scratch
- Código de modelo y entrenamiento (mia-train): https://github.com/AI-HHMI/mia-train
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Paper referenciado en los tags (arXiv:2508.10104): https://arxiv.org/abs/2508.10104
