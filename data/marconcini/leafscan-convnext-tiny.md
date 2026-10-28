# Marconcini/leafscan-convnext-tiny

## Resumen

LeafScan (`Marconcini/leafscan-convnext-tiny`) es un clasificador de imágenes basado en ConvNeXt-T, con 27.849.350 parámetros y entrada de 224×224 píxeles, publicado en HuggingFace por el usuario Marconcini. Distingue 38 clases de cultivo/enfermedad correspondientes a 14 cultivos y devuelve la etiqueta "Not sure" cuando su confianza calibrada no supera un umbral, en lugar de forzar un diagnóstico.

El modelo parte de pesos de ImageNet, se afina primero con PlantVillage (39.000 imágenes de laboratorio) y después con el 85 % del conjunto de entrenamiento de PlantDoc (1.975 fotos de campo y web), reservando 348 fotos para ajustar la temperatura de calibración (T = 0,83) y el umbral de abstención (0,75). El resultado es un clasificador con 72,4 % de exactitud en el test de PlantDoc (228 fotos de campo), frente al 31 % que alcanza la misma arquitectura entrenada solo con imágenes de laboratorio.

Su interés técnico es precisamente ese contraste: cuantifica la brecha entre laboratorio y campo, incorpora abstención calibrada y publica un export ONNX int8 de 32 MB que funciona en el navegador. La licencia de los pesos es CC BY-SA 4.0 y el proyecto se presenta explícitamente como demostración e investigación, no como herramienta de diagnóstico agronómico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-T (`timm`: `convnext_tiny.fb_in22k_ft_in1k`), CNN para clasificación de imágenes |
| Parametros totales | 27.849.350 (≈27,85 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: clasificador de imágenes con entrada fija de 224×224 píxeles |
| Tipos de cuantizacion | fp32 (PyTorch y ONNX) e int8 en las capas lineales del export ONNX; las convoluciones se mantienen en fp32 |
| Idiomas soportados | No disponible (el modelo no procesa texto; las 38 etiquetas de clase estan en ingles) |
| Licencia | CC BY-SA 4.0 para los pesos; codigo del proyecto bajo MIT |
| Formato de pesos | `model.safetensors`, `model.onnx` (fp32), `model_int8.onnx` (int8, 32 MB) y `config.json` con clases, tamano de entrada, temperatura y umbral |
| Numero de clases | 38 clases de cultivo/enfermedad en 14 cultivos |
| Dataset de referencia | `mohanty/PlantVillage` + PlantDoc |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-28 |

## Arquitectura y entrenamiento

ConvNeXt-T es una red convolucional pura que moderniza el diseño de ResNet siguiendo los planteamientos de Liu et al. (2022, CVPR): stem con parches no solapados, convoluciones depthwise de 7×7, bloques inverted bottleneck, LayerNorm y GELU. El modelo parte de los pesos de ImageNet del checkpoint `convnext_tiny.fb_in22k_ft_in1k` de `timm` y se afina para clasificación de 38 clases.

El entrenamiento tiene tres fases encadenadas: (1) ajuste fino con PlantVillage, 39.000 imágenes de laboratorio; (2) ajuste con el 85 % del conjunto de entrenamiento de PlantDoc, 1.975 fotos de campo y web; (3) calibración post-hoc sobre las 348 fotos restantes de PlantDoc, nunca usadas en entrenamiento, para ajustar una temperatura de escalado (T = 0,83) y un umbral de abstención (0,75 sobre la confianza calibrada), siguiendo el marco de Guo et al. (2017). La innovación destacable no es arquitectónica sino de calibración: el umbral se ajusta sobre datos de campo y no de laboratorio, y el export int8 recibe su propia temperatura y umbral porque la cuantización altera algunas predicciones. No se documentan datos sobre número de tokens, composición completa del dataset ni uso de RLHF/DPO, por no ser aplicables a un clasificador visual.

## Capacidades

- Clasificación de imágenes de hojas en 38 clases que cubren 14 cultivos, con salida top-3 y probabilidades calibradas.
- Abstención explícita: devuelve "Not sure" cuando la confianza calibrada queda por debajo de 0,75, en lugar de emitir siempre una etiqueta.
- Discriminación gruesa auxiliar: en el test de PlantDoc acierta el cultivo en el 86,4 % de las fotos y distingue sano frente a enfermo en el 94,7 %.
- Inferencia en navegador mediante ONNX Runtime Web con el modelo int8 de 32 MB (el redimensionado lo hace el canvas en lugar de PIL).
- Export ONNX fp32 con idéntico top-1 que PyTorch en el test de PlantDoc.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni vídeo: es un clasificador de imagen cerrado a 38 clases.
- Capacidades multilingües no aplicables; las etiquetas de salida están en inglés.

## Casos de uso

- **Triaje previo a consulta agronómica**: la app captura una foto, obtiene una predicción con probabilidad calibrada y solo la eleva a un especialista cuando la confianza supera el umbral; el 65 % de las fotos de campo superan el umbral con un 87 % de acierto, lo que permite filtrar sin revisar manualmente el 100 % de las imágenes.
- **Demostración educativa sobre brecha laboratorio-campo**: el propio proyecto documenta que el mismo modelo entrenado solo con PlantVillage pasa del 99,7 % en laboratorio al 31 % en campo, un caso de estudio directo para asignaturas de visión por computador y robustez de dominio.
- **Etiquetado asistido de nuevos datasets agrícolas**: usar las predicciones por encima del umbral como pre-etiquetas para acelerar el annotado de fotos de campo, dejando el 35 % restante a revisión humana.
- **Aplicación web offline / PWA de bajo coste**: el `model_int8.onnx` de 32 MB se ejecuta en el navegador con ONNX Runtime Web, sin backend GPU y sin enviar imágenes a un servidor, adecuado para escenarios con conectividad limitada en explotaciones.
- **Investigación sobre calibración y abstención**: el repositorio incluye hipótesis previas y experimentos de temperature scaling, umbrales ajustados en laboratorio frente a campo y rechazo de imágenes que no son hojas (AUROC 0,6–0,8), reutilizable como base metodológica.
- **Prototipado rápido en Python**: el paquete `leafscan` expone `Predictor` con `verdict` y `top`, suficiente para integrar la clasificación en un script de evaluación o en un pipeline de control de calidad de imágenes en invernadero.
- **Filtro de segunda pasada en encuestas de campo**: procesar lotes de fotos georreferenciadas y marcar automáticamente las que el modelo considera sanas con alta confianza, reduciendo el volumen de imágenes a inspeccionar.

## Benchmarks y rendimiento

| Metrica | PlantDoc test (campo, 228 fotos) | PlantVillage test (laboratorio, 10.709 fotos) |
|---|---:|---:|
| Exactitud | 72,4 % (IC 95 %: 66,2–78,1) | 96,6 % |
| Cultivo correcto | 86,4 % | No disponible |
| Sano vs. enfermo | 94,7 % | No disponible |
| Fotos que superan el umbral | 65 %, de las cuales acierta el 87 % | 94 %, de las cuales acierta el 98,7 % |
| Exactitud con ONNX int8 | 71,9 % | No disponible |
| Fotos que superan el umbral (int8) | 66 %, de las cuales acierta el 84,7 % | No disponible |

Referencia comparativa del mismo proyecto: ConvNeXt-T entrenado únicamente con PlantVillage alcanza el 99,7 % en laboratorio y el 31 % en campo. El export int8 coincide con el fp32 en el 96,5 % de las fotos del test de PlantDoc, y la demo en navegador coincide con las predicciones int8 de Python en el 96,1 % de las mismas fotos. El autor advierte que el test de 228 fotos es pequeño y que diferencias inferiores a ~6 puntos quedan dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32; los pesos fp32 ocupan aproximadamente 112 MB (27,85 M de parámetros × 4 bytes) y el export int8 solo 32 MB.
- GPU recomendadas: cualquier GPU consumer sirve; una RTX 4090, RTX 3060 o incluso una iGPU es sobrada para un modelo de 28 M de parámetros a 224×224. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las actuales, y también en CPU. El caso de uso del autor es directamente el navegador.
- Opciones de despliegue: PyTorch con `timm` o el paquete `leafscan`, ONNX Runtime (fp32 o int8) y ONNX Runtime Web para navegador. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia por imagen ni de imágenes por segundo en la información proporcionada.
- Almacenamiento: repositorio completo de 0,3 GB; el artefacto desplegable mínimo es el ONNX int8 de 32 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Exactitud en campo (PlantDoc test) | Exactitud en laboratorio (PlantVillage test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| leafscan-convnext-tiny | 27,85 M | 224×224 | 72,4 % | 96,6 % | CC BY-SA 4.0 | HuggingFace (0 descargas) |
| ConvNeXt-T afinado solo con PlantVillage (misma arquitectura, mismo proyecto) | 27,85 M | 224×224 | 31 % | 99,7 % | No disponible | No publicado como checkpoint |
| Otros clasificadores de enfermedades de plantas (ResNet, EfficientNet, MobileNet en la literatura) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de terceros en la información proporcionada, por lo que la comparación cuantitativa se limita a la variante del mismo proyecto, que es precisamente el contraste que el autor documenta.

## Limitaciones y advertencias

- No es una herramienta de diagnóstico: el autor la define como demostración e investigación, no como sustituto de un agrónomo.
- Solo conoce 38 clases de 14 cultivos; cualquier otra planta o enfermedad se fuerza a una de esas clases o se responde "Not sure".
- El test de campo tiene solo 228 fotos: diferencias inferiores a ~6 puntos entre modelos no son significativas.
- La calibración y el umbral se ajustaron sobre fotos de PlantDoc y pueden no transferirse a imágenes de otras fuentes; el propio proyecto muestra umbrales ajustados en laboratorio que fallan en campo.
- El rechazo de imágenes que no son hojas es débil (AUROC 0,6–0,8 en las pruebas del proyecto): una foto de otro objeto puede recibir igualmente un diagnóstico.
- PlantDoc se recopiló por scraping web y contiene ruido de etiquetas, aunque se eliminaron duplicados archivados en clases distintas.
- La licencia CC BY-SA 4.0 de los pesos es share-alike y deriva de la licencia de PlantVillage (CC BY-SA 3.0): conviene revisar las obligaciones de atribución y compartición antes de un uso comercial o de integrarlo en un producto propietario.
- El modelo no procesa texto ni ofrece razonamiento multi-paso, tool calling o agentes; cualquier expectativa en ese sentido queda fuera de su alcance.
- Riesgo de sesgo por dominio: el entrenamiento combina fotos de laboratorio con fondo controlado y fotos web, lo que puede infrarrepresentar condiciones reales de iluminación, oclusión o dispositivos de captura.
- Sin métricas publicadas de latencia, throughput ni consumo, no es posible dimensionar un despliegue en producción a partir de la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Marconcini/leafscan-convnext-tiny
- Repositorio del proyecto (código MIT, experimentos y paquete `leafscan`): https://github.com/marconcini/leafscan
- Dataset PlantDoc: https://github.com/pratikkayal/PlantDoc-Dataset
- Dataset PlantVillage en HuggingFace: https://huggingface.co/datasets/mohanty/PlantVillage
- Hughes & Salathé (2015), *An open access repository of images on plant health to enable the development of mobile disease diagnostics*: https://arxiv.org/abs/1511.08060
- Singh et al. (2020), *PlantDoc: A Dataset for Visual Plant Disease Detection*, CoDS-COMAD: URL no disponible en la información proporcionada
- Liu et al. (2022), *A ConvNet for the 2020s*, CVPR: URL no disponible en la información proporcionada
- Guo et al. (2017), *On Calibration of Modern Neural Networks*, ICML: URL no disponible en la información proporcionada
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
