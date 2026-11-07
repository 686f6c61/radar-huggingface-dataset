# relghali/team-203-aquaguard

## Resumen

AquaGuard red-tide detector es un clasificador de imágenes basado en ResNet-18, desarrollado por el equipo QH-203 (usuario `relghali`) en el hackathon Qai × Hugging Face celebrado en Doha del 5 al 7 de noviembre de 2026. El modelo detecta proliferaciones de algas nocivas (mareas rojas) en teselas de 256×256 píxeles y 10 bandas del satélite Sentinel-2, proporcionando una probabilidad de bloom por parche de mar de 2,5 km. Forma parte de AquaGuard, un sistema de alerta temprana que vigila las aguas costeras de Catar, país que obtiene aproximadamente el 99 % de su agua potable de plantas desalinizadoras.

El modelo parte de los pesos publicados de AMFITRITE (`kostaspic/AMFITRITE-Sentinel2-HAB-Universal-ResNet18`) y se afina sobre una versión limpiada del dataset abierto `kostaspic/amfitrite-open-waters-hab-sentinel2`, corrigiendo un desplazamiento de brillo de +1000 en las escenas Sentinel-2 procesadas a partir del 25 de enero de 2022 y aplicando una partición libre de fugas de datos. El resultado es un F1 de 0,87 sobre 414 teselas de test no vistas, con un coste de cómputo de aproximadamente 2 dólares en una GPU NVIDIA T4 mediante Hugging Face Jobs.

Se trata de un modelo de clasificación de imagen de propósito específico, no de un modelo generativo: no procesa lenguaje, no soporta tool calling ni agentes, y su única salida es un vector softmax de dos clases (bloom / no bloom). Su relevancia radica en la reproducibilidad del pipeline completo y en la corrección metodológica del sesgo temporal del sensor, un problema poco documentado en la literatura de teledetección aplicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN, `timm.create_model("resnet18")`) |
| Parámetros totales | no disponible (ResNet-18 estándar; el autor no publica el recuento exacto con `in_chans=10, num_classes=2`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 256×256 píxeles × 10 bandas) |
| Tipos de cuantización | no disponible (pesos en `.pth` de PyTorch, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (clasificador de imagen; la capa de interfaz bilingüe inglés/árabe reside en la aplicación, no en el modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pth` (`aquaguard_hab_resnet18.pth`), más checkpoints por época en `checkpoints/` |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 convolucional estándar adaptada a la entrada multiespectral: la primera capa convolucional acepta 10 canales en lugar de 3, correspondientes a las bandas B02, B03, B04, B05, B06, B07, B08, B8A, B11 y B12 de Sentinel-2 L2A, en ese orden exacto. La cabeza de clasificación se reduce a 2 clases, donde el índice 1 representa la probabilidad de bloom. El preprocesado requiere restar 1000 a los valores de las escenas procesadas desde el 25 de enero de 2022 (con recorte a 0) y dividir entre 10000.

El ajuste fino se realizó desde los pesos de AMFITRITE con AdamW, tasa de aprendizaje 1e-4, esquema coseno, entropía cruzada ponderada por clase, aumento de datos mediante volteo y rotaciones de 90°, conservando la época con mejor F1 de validación. El dataset de partida contiene 2762 teselas etiquetadas de aguas abiertas y costeras procedentes de eventos documentados de bloom en todo el mundo (CC BY 4.0). La innovación metodológica principal es la partición libre de fugas: 1235 grupos garantizan que teselas de la misma medición, o de la misma fecha dentro de 4 km, permanezcan en el mismo split, resultando en 1905 / 443 / 414 teselas de entrenamiento, validación y test. Además, se detectó y corrigió el desplazamiento de +1000 en los valores de píxel de las escenas posteriores al 25 de enero de 2022, homogeneizando la escala entre imágenes antiguas y nuevas.

## Capacidades

- Clasificación binaria de teselas Sentinel-2 en bloom / no bloom, con probabilidad softmax por parche de 2,5 km.
- Inferencia por ventana deslizante sobre escenas completas de Sentinel-2 mediante `pipelines/infer/hab.py`, generando mapas de probabilidad sobre la superficie marina.
- Entrada multiespectral de 10 bandas, incluyendo visible, red edge, NIR y SWIR, lo que permite discriminar firmas espectrales de algas frente a otras superficies.
- Integración en un sistema de alerta con pronóstico de deriva a +6, +12 y +24 horas usando corrientes y viento reales, y asignación de nivel de riesgo por planta desalinizadora.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües: es un clasificador puramente visual.
- No dispone de modo de razonamiento explícito (thinking mode), visión general, audio ni otras modalidades.

## Casos de uso

- Alerta temprana de mareas rojas en plantas desalinizadoras: el modelo clasifica cada parche de 2,5 km de las aguas próximas a las 9 unidades de Kahramaa en 3 emplazamientos, y la aplicación traduce la probabilidad en un nivel de riesgo (High, Elevated, Low, Unknown) con comprobaciones recomendadas en inglés y árabe.
- Monitorización continua de la calidad del agua costera: al ejecutarse por ventana deslizante sobre escenas Sentinel-2 completas, permite generar mapas diarios de probabilidad de bloom sin coste de sensor adicional, usando datos gratuitos de la ESA.
- Investigación en teledetección de proliferaciones algales: el repositorio incluye `split.json` y `metrics.json`, lo que permite reproducir la evaluación libre de fugas y comparar contra la línea base AMFITRITE en igualdad de condiciones.
- Detección combinada con derrames de petróleo: el sistema AquaGuard empareja este clasificador óptico con un modelo UNet++ sobre Sentinel-1 (radar), de modo que un operador puede correlacionar amenazas ópticas y de radar en la misma interfaz.
- Validación de pipelines de datos satelitales: la corrección del desplazamiento de +1000 en escenas post-25 de enero de 2022 sirve como caso de prueba para verificar el preprocesado de Sentinel-2 L2A en otros proyectos.
- Formación y prototipado en hackathons: el pipeline completo (descarga, split, baseline, fine-tune, evaluación, gráficas) se reejecuta en CPU de portátil en unos 10 minutos sobre una muestra de 200 teselas, lo que lo hace adecuado como plantilla docente reproducible.
- Auditoría de modelos de observación de la Tierra: al publicar pesos, checkpoints por época y métricas, permite a terceros auditar el rendimiento real (F1 0,87) frente a afirmaciones no verificadas de otros modelos.

## Benchmarks y rendimiento

| Evaluación | Teselas | F1 |
|---|---|---|
| Test completo retenido (libre de fugas, offset corregido) | 414 | 0,87 |
| Muestra reproducible de 200 teselas (6 épocas, CPU) | test de la muestra | recall 0,94 (15 de 16 blooms detectados) |

No se han publicado resultados comparativos con otros modelos en la información disponible. El conjunto de test está balanceado (204 bloom, 210 otros). No se publican métricas de precisión, recall global, AUC ni latencia de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para lotes pequeños en fp32, dado el tamaño de ResNet-18 (repo de 0,6 GB incluyendo checkpoints); no se publica una cifra oficial.
- GPU recomendadas: el ajuste fino se realizó en una NVIDIA T4; para inferencia es suficiente cualquier GPU consumer moderna, e incluso CPU.
- Cabe en cualquier GPU consumer (GTX 1060 en adelante, RTX 2060/3060/4090) y en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch + `timm` (único formato publicado); no hay versiones ONNX, TorchScript, GGUF ni integración con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El pipeline completo de entrenamiento y evaluación sobre 200 teselas tarda unos 10 minutos en CPU de portátil.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Contexto / parche | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AquaGuard red-tide detector (este) | ResNet-18, 10 canales | Sentinel-2 L2A, 10 bandas | 2 (bloom / no bloom) | 256×256 px (2,5 km) | Apache 2.0 | Pesos `.pth` en HF |
| AMFITRITE Sentinel-2 HAB Universal ResNet18 | ResNet-18, 10 canales | Sentinel-2 L2A, 10 bandas | 2 | 256×256 px | no disponible en la información | Pesos en HF (modelo base) |
| tidetrace-oil-unet (N-1ACE) | UNet++ | Sentinel-1 radar (VV, VH) | 3 por píxel (mar, look-alike, petróleo) | segmentación por píxel | no disponible en la información | Pesos en HF |

La comparación directa con otros clasificadores de blooms queda limitada porque no se han publicado métricas de modelos alternativos en la información disponible.

## Limitaciones y advertencias

- El modelo solo distingue bloom de no bloom; no identifica especie de alga, toxicidad ni concentración de clorofila.
- El F1 de 0,87 se ha medido sobre 414 teselas; no hay validación independiente en aguas de Catar ni en otras regiones fuera del dataset de entrenamiento, por lo que el rendimiento en dominio qatarí es incierto.
- La aplicación AquaGuard en producción ejecuta el modelo original publicado (`method: model_pretrained`), no este ajuste fino; el repositorio conserva los pesos afinados y las métricas para verificación, pero no están desplegados.
- Dependencia crítica del preprocesado: aplicar mal la resta de 1000 o el orden de bandas invalida las predicciones sin aviso.
- Riesgo de falsos positivos por confusión espectral con turbidez, sedimentos en suspensión, espumas o aguas someras; el modelo no incorpora máscaras de nubes ni de tierra en la propia red.
- No se documentan sesgos geográficos ni evaluación por región; el dataset mezcla eventos mundiales sin estratificación publicada.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento son CC BY 4.0 y deben atribuirse.
- No hay cuantizaciones ni formatos alternativos publicados, lo que limita el despliegue en entornos sin PyTorch.
- El modelo base AMFITRITE no tiene licencia documentada en la información disponible, lo que conviene verificar antes de un uso comercial derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/relghali/team-203-aquaguard
- Aplicación AquaGuard (Space): https://huggingface.co/spaces/relghali/team-203-aquaguard-app
- Código y pipeline ML: https://github.com/relghali/Hugging-Face-Hackathon
- Modelo base AMFITRITE: https://huggingface.co/kostaspic/AMFITRITE-Sentinel2-HAB-Universal-ResNet18
- Dataset AMFITRITE: https://huggingface.co/datasets/kostaspic/amfitrite-open-waters-hab-sentinel2
- Modelo de derrames de petróleo (UNet++): https://huggingface.co/N-1ACE/tidetrace-oil-unet
- Space alternativo encontrado en la búsqueda: https://huggingface.co/spaces/relghali/team-yolo-aquaguard-app
- Repositorio AquaGuard-AI (proyecto distinto, detección de bañistas): https://github.com/parsasalama6t/AquaGuard-AI
