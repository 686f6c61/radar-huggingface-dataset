# lalodeavilaarm/spiral-vit-medmnist-ablation

## Resumen

SPIRAL-ViT MedMNIST Ablation Checkpoints es un conjunto de 96 pesos publicados por el usuario lalodeavilaarm en Hugging Face, correspondientes a un estudio de ablación sobre una arquitectura de Vision Transformer (ViT) aplicada a clasificación de imagen médica. El paquete cubre 8 configuraciones experimentales cruzadas con los 12 conjuntos de datos de MedMNIST v2, a resolución nativa de 224×224, y no es un modelo único entrenado para uso general, sino una matriz de puntos de control pensada para reproducir y comparar variantes arquitectónicas.

La innovación que se evalúa es la combinación de tres elementos: ordenación espiral de tokens (en lugar del orden raster convencional), embedding de parches en el dominio de la frecuencia mediante una DCT aprendida, y un sesgo gaussiano en la atención que prioriza la zona foveal de la imagen. Las 8 configuraciones permiten aislar la contribución de cada componente, desde la línea base C1 (raster + convolución, sin sesgo gaussiano) hasta el modelo completo C8 (spiral + learned-DCT + gaussian bias).

Su relevancia es fundamentalmente de investigación: ofrece una comparativa controlada y reproducible sobre 12 tareas médicas heterogéneas (dermatología, oftalmología, radiología, histopatología, hematología y TC abdominal) con licencia MIT y pesos descargables. El modelo es compacto (la configuración por defecto registra dim=256, depth=6, heads=8, mlp_dim=512), por lo que es ejecutable en hardware modesto, aunque el repositorio no publica recuento de parámetros ni resultados numéricos de los benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con ordenación espiral de tokens, embedding de parches learned-DCT y sesgo gaussiano de atención (spectral-spatial / foveated ViT) |
| Parámetros totales | no disponible (cada checkpoint incluye en `cfg` los valores de `dim`, `depth`, `heads` y `mlp_dim`, pero la model card no publica el recuento) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión). Resolución de entrada nativa 224×224; con `patch_size` por defecto de 14, la secuencia resultante es de 256 tokens |
| Tipos de cuantización | no disponible; los pesos se distribuyen en punto flotante PyTorch (`.pth`). No hay versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no aplica (modelo de clasificación de imagen; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.pth` de PyTorch (diccionario con `state_dict`, `cfg`, `epoch` y `best_f1`) |

Configuraciones de ablación incluidas:

| Config | token_order | embed_type | gaussian_bias |
|---|---|---|---|
| C1 (baseline) | raster | conv | False |
| C2 | spiral | conv | False |
| C3 | raster | learned_dct | False |
| C4 | raster | conv | True |
| C5 | spiral | learned_dct | False |
| C6 | spiral | conv | True |
| C7 | raster | learned_dct | True |
| C8 (modelo completo) | spiral | learned_dct | True |

Conjuntos de datos y número de clases: `blood` (8), `breast` (2), `chest` (14, multi-etiqueta), `derma` (7), `oct` (4), `organa` (11), `organc` (11), `organs` (11), `path` (9), `pneumonia` (2), `retina` (5) y `tissue` (8).

## Arquitectura y entrenamiento

La familia se basa en un Vision Transformer compacto: la imagen de 224×224 se divide en parches (por defecto 14×14, es decir, 256 tokens) y se procesa con `dim=256`, `depth=6`, `heads=8` y `mlp_dim=512` según los valores por defecto que documenta la model card. Sobre esa base se aplican tres modificaciones evaluadas de forma independiente: (1) el orden de serialización de los parches, comparando el barrido raster tradicional frente a un recorrido en espiral; (2) el tipo de embedding de parche, comparando una proyección convolucional frente a una DCT aprendida con un parámetro `freq_keep` (por defecto 16) que controla cuántas componentes frecuenciales se conservan; y (3) la incorporación o no de un sesgo gaussiano en la atención, que actúa como mecanismo de fóvea al ponderar la zona central del campo receptivo.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta de los datos más allá de los 12 conjuntos de MedMNIST v2, ni si se emplearon técnicas de ajuste como RLHF o DPO (procedimientos, por otra parte, propios de modelos generativos y no de clasificadores). El único criterio de selección de checkpoint documentado es el macro-F1 de validación, no la accuracy, aplicado de forma homogénea a todas las configuraciones y datasets; para `chest`, con 14 etiquetas multi-hot, el macro-F1 se calcula del mismo modo que en el resto. Cada archivo guarda la mejor época alcanzada (`epoch`) y su métrica (`best_f1`), junto con la configuración exacta necesaria para reconstruir el modelo.

## Capacidades

- Clasificación de imágenes médicas en 12 tareas: hematología (`blood`), mamografía (`breast`), radiografía de tórax (`chest`, multi-etiqueta), dermatología (`derma`), tomografía de coherencia óptica (`oct`), TC abdominal (`organa`, `organc`, `organs`), histopatología (`path`, `tissue`), neumonía (`pneumonia`) y retinografía (`retina`).
- Clasificación multi-clase y multi-etiqueta: los 11 conjuntos de etiqueta única más el caso multi-hot de `chest` con 14 etiquetas.
- Extracción de representaciones visuales: al ser un ViT, las salidas internas pueden emplearse como embeddings para tareas posteriores, aunque esto no se documenta explícitamente.
- Comparación controlada de variantes arquitectónicas: las 8 configuraciones permiten aislar el efecto de la ordenación espiral, del embedding frecuencial y del sesgo gaussiano.
- No soporta generación de texto, razonamiento, código, matemáticas ni capacidades conversacionales.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No dispone de modo de razonamiento (thinking mode), audio ni vídeo.
- Capacidad especial: ponderación foveal mediante sesgo gaussiano de atención y procesado en el dominio de la frecuencia con DCT aprendida.

## Casos de uso

- Investigación en eficiencia de arquitecturas ViT: el paquete permite reproducir un estudio de ablación completo comparando 8 variantes sobre 12 datasets con un único protocolo de evaluación (macro-F1 de validación), idóneo para publicar comparativas internas o validar hipótesis sobre ordenación de tokens y embeddings frecuenciales.
- Clasificación dermatológica asistida: el checkpoint de `derma` puede integrarse en un prototipo de triaje de lesiones cutáneas en 7 categorías, ejecutable en local gracias al reducido tamaño del modelo.
- Cribado oftalmológico: los pesos de `retina` (5 clases) y `oct` (4 clases) sirven para experimentos de detección automatizada de patología retiniana y degeneración macular a partir de imágenes de 224×224.
- Detección de neumonía en radiografía de tórax: el modelo de `pneumonia` (2 clases) admite un flujo binario de apoyo al diagnóstico, mientras que el de `chest` (14 etiquetas multi-hot) permite un etiquetado más granular de hallazgos torácicos.
- Análisis histopatológico: los checkpoints de `path` (9 clases) y `tissue` (8 clases) son utilizables en pipelines de investigación sobre clasificación de tejidos y patrones tumorales.
- Análisis de células sanguíneas: el modelo de `blood` (8 clases) puede emplearse en experimentos de conteo y clasificación diferencial de poblaciones celulares.
- Segmentación por órganos en TC abdominal: los tres conjuntos `organa`, `organc` y `organs` (11 clases cada uno) cubren distintos protocolos de anotación abdominal, útiles para estudios comparativos de robustez entre esquemas de etiquetado.
- Docencia y prototipado con recursos limitados: al tratarse de un modelo de pocos megabytes, puede desplegarse en portátiles o incluso en CPU, lo que facilita prácticas de laboratorio y demostraciones sin acceso a GPU de datacenter.
- Punto de partida para fine-tuning: al usar licencia MIT y estar publicados los pesos, es posible reutilizar los checkpoints como inicialización en tareas médicas propias con menos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el criterio de selección de cada checkpoint (macro-F1 de validación, incluido el caso multi-hot de `chest`) y almacena el valor `best_f1` dentro de cada archivo, pero no incluye una tabla con cifras por configuración o dataset, ni comparaciones numéricas con otras arquitecturas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 1,3 GB para 96 checkpoints, lo que arroja aproximadamente 13,5 MB por archivo, coherente con un ViT compacto en punto flotante de 32 bits y una huella de inferencia muy inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos unos pocos gigabytes de memoria es suficiente; no se requiere una A100 o H100. Tarjetas de gama de entrada y media (GTX 1050/1650, RTX 3050, RTX 4060) y, por supuesto, RTX 4090, A100 o H100 funcionarían sin limitaciones de memoria, con estas últimas enormemente sobredimensionadas.
- Cabe en GPU de consumo: sí, en cualquiera de las mencionadas. Dado el tamaño reducido, la inferencia en CPU también es viable para lotes pequeños.
- Opciones de despliegue: carga directa con PyTorch, ya que los checkpoints son diccionarios `state_dict` que requieren la clase `ViT` del repositorio de código. Al no ser un modelo de lenguaje, no aplican vLLM, llama.cpp, Ollama ni TGI; sí serían plausibles exportaciones a ONNX o TorchScript y su servicio con ONNX Runtime o Triton, aunque no están documentadas en la información disponible.
- Latencia y throughput estimados: no disponibles. Únicamente puede afirmarse que el tamaño del modelo y la secuencia de 256 tokens con `dim=256` y `depth=6` apuntan a una latencia baja en GPU moderna, sin cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Resolución de entrada | Licencia | Disponibilidad | Rendimiento en MedMNIST |
|---|---|---|---|---|---|---|
| SPIRAL-ViT (este paquete) | ViT compacto con ablaciones | no disponible (config por defecto: dim 256, depth 6) | 224×224 | MIT | Pesos publicados en Hugging Face, 0 descargas | No publicado |
| ResNet-18 (línea base habitual de MedMNIST v2) | CNN | ~11,7 M (valor de referencia general) | 28/64/128/224 según versión | según implementación de referencia | Ampliamente disponible | No comparable con datos de esta ficha |
| ResNet-50 (línea base habitual de MedMNIST v2) | CNN | ~25,6 M (valor de referencia general) | 28/64/128/224 según versión | según implementación de referencia | Ampliamente disponible | No comparable con datos de esta ficha |
| ViT-B/16 estándar | ViT | ~86 M (valor de referencia general) | 224×224 | según implementación | Ampliamente disponible | No comparable con datos de esta ficha |

La comparación cuantitativa de rendimiento no puede completarse porque el autor no publica métricas. La diferencia principal de este paquete frente a las líneas base de MedMNIST v2 es que no ofrece un único modelo, sino una matriz de 96 checkpoints diseñada para análisis de ablación, con un modelo notablemente más pequeño que un ViT-B/16 y con pesos liberados bajo MIT.

## Limitaciones y advertencias

- Ausencia total de métricas publicadas: no hay tabla de resultados, curvas de entrenamiento ni comparación con líneas base, lo que impide evaluar si las variantes propuestas mejoran realmente a los enfoques convencionales.
- Naturaleza de investigación: es un conjunto de checkpoints de ablación, no un modelo listo para producción. Cada archivo corresponde a una configuración concreta y a un dataset concreto.
- Sin validación clínica: los conjuntos de MedMNIST v2 son datasets de benchmark con imágenes de baja complejidad relativa; un clasificador entrenado sobre ellos no está validado para uso diagnóstico y no debe emplearse en decisiones clínicas.
- Sesgos desconocidos: no se documenta la composición demográfica de los datos originales, por lo que no puede evaluarse el sesgo por edad, sexo, etnia o tipo de equipo de adquisición.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza, especialmente en clases poco representadas de cada dataset.
- Dependencia del código externo: los pesos no son autocontenidos; requieren la clase `ViT` del repositorio `FoveatedSpectral-ViT` y que los argumentos del constructor coincidan exactamente con el campo `cfg` del checkpoint.
- Carga con `weights_only=False`: la propia model card indica `torch.load(..., weights_only=False)`, lo que implica deserialización de pickle y, por tanto, un riesgo de seguridad si los archivos proceden de fuentes no verificadas. Conviene auditar los ficheros antes de cargarlos.
- Sin cuantizaciones publicadas: al distribuirse solo en `.pth` en punto flotante, no hay versiones optimizadas para despliegue con menor precisión.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad ni reportes independientes de reproducibilidad.
- Idiomas y entrada: solo acepta imágenes; no procesa texto y no admite prompts ni instrucciones en ningún idioma.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, pero la responsabilidad sobre el uso clínico o regulatorio recae íntegramente en quien despliegue el modelo.
- Los resultados de la búsqueda web asociada no contienen información relevante sobre este modelo: los enlaces recuperados corresponden a un producto de seguridad informática sin relación con el proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lalodeavilaarm/spiral-vit-medmnist-ablation
- Repositorio de código de entrenamiento y evaluación: https://github.com/LalodeAvila369/FoveatedSpectral-ViT
- MedMNIST v2 (datasets utilizados): https://medmnist.com/
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
