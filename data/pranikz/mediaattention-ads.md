# pranikz/MediaAttention-Ads

## Resumen

MediaAttention-Ads v1 es un modelo de predicción de atención visual (saliency) especializado en anuncios, carteles e interfaces. Dado un estímulo visual, genera un mapa de calor de densidad de fijaciones que estima dónde mirarán las personas durante los primeros segundos de visionado libre. Lo desarrolla pranikz (Pratyush Mahapatra) como modelo por defecto de su toolkit de código abierto MediaAttention, que convierte ese mapa en métricas publicitarias: foco, carga cognitiva y atención sobre marca, producto, titular y CTA.

Arquitectura y tamaño lo sitúan en la liga de los modelos de saliency ligeros: es un UNISAL (Droste, Jiao y Noble, ECCV 2020) con encoder MobileNetV2, 16 prioridades gaussianas aprendidas, una rama recurrente ConvGRU para vídeo y un decoder con conexiones residuales, con solo 3,7 millones de parámetros. Se parte de los pesos SALICON de UNISAL y se afina sobre el split de entrenamiento de UEyes (1.872 imágenes de pósters, UIs móviles, UIs de escritorio y páginas web, con eye tracking de 62 participantes).

Su relevancia actual es doble: por un lado, supera de forma clara a las alternativas abiertas en el dominio publicitario (CC 0,752 en pósters frente a 0,496 del mejor competidor, una mejora del 52 % con intervalos de confianza del 95 % no solapados); por otro, lo hace con un coste computacional ínfimo: 0,04 s por imagen en un portátil Apple M3 Pro, sin GPU dedicada. La licencia Apache-2.0 y el formato de pesos estándar de PyTorch facilitan su integración en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNISAL: encoder MobileNetV2, 16 prioridades gaussianas aprendidas, rama recurrente ConvGRU (solo vídeo), decoder con skip connections y adaptación/suavizado específicos de dominio |
| Parámetros totales | 3,7 M (≈3,7 millones) |
| Longitud de contexto | No aplica: modelo de imagen. La entrada RGB se redimensiona a uno de los tamaños de aspecto fijo de UNISAL (resolución exacta no disponible) |
| Tipos de cuantización | No disponible. El autor no publica versiones cuantizadas; se distribuye un state dict en PyTorch (fp32) |
| Idiomas soportados | No disponible como tal: el modelo no procesa lenguaje. Se ha entrenado y evaluado con contenido visual en inglés (UEyes y FiWI) |
| Licencia | Apache-2.0 |
| Formato de pesos | `ads-v1.pth` (state dict de PyTorch) + `unisal_config.json` con los argumentos del constructor |
| Framework | PyTorch (`library_name: pytorch`); código del modelo vendorizado en `mediaattention/unisal/` |
| Pipeline en HuggingFace | image-to-image |
| Entrada | Imagen RGB redimensionada y normalizada con estadísticas de ImageNet; rama fuente SALICON con `static=True` |
| Salida | Densidad de fijación en escala logarítmica, al tamaño de la entrada (mapa de calor que suma 1) |
| Modelo base | pranikz/MediaAttention (pesos SALICON de UNISAL) |
| Dataset de ajuste fino | UEyes (Jiang et al., CHI 2023, CC BY 4.0) |
| Velocidad de inferencia | 0,04 s por imagen en Apple M3 Pro (MPS/CPU) |
| Tamaño del repositorio | 0,0 GB (metadatos; los pesos se descargan con el paquete `mediaattention`) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un UNISAL estándar sin cambios estructurales: encoder MobileNetV2 que extrae características multi‑escala, 16 gaussianas aprendidas que actúan como priors de posición, una rama ConvGRU que aporta recurrencia temporal (utilizada únicamente en modo vídeo) y un decoder con conexiones de salto que reconstruye el mapa de densidad a la resolución de entrada. El checkpoint distribuido se usa en modo imagen estático (`static=True`, rama SALICON), de modo que la rama recurrente no interviene en inferencia sobre imágenes sueltas.

El ajuste fino parte de los pesos SALICON de UNISAL y se ejecuta sobre el split de entrenamiento de UEyes: 1.872 imágenes de pósters, UIs móviles, UIs de escritorio y páginas web, con eye tracking de 62 participantes registrado con un Gazepoint GP3 durante 7 segundos de visionado libre. Se reservó un 10 % de ese split para seleccionar la época; el split de test de UEyes (108 imágenes) y FiWI no se vieron en ningún momento. La función de pérdida combina KL(ground truth ‖ predicción) menos la correlación de Pearson (CC), calculada contra fijaciones desenfocadas con un radio equivalente a ≈1° de ángulo visual. El entrenamiento usa AdamW con lr 3e-5, weight decay 1e-4, batch size 1 y batch norm congelada: 8 épocas, aproximadamente 25 minutos en un Apple M3 Pro. La mejor época fue la 5, con la CC en validación subiendo de 0,502 a 0,769. El script es reproducible en `benchmarks/finetune_unisal.py`.

## Capacidades

- Predicción de mapas de calor de densidad de fijación para imágenes publicitarias, pósters, banners, packaging e interfaces de usuario.
- Estimación de atención en los primeros segundos de visionado (el protocolo de entrenamiento es de 7 s de visionado libre).
- Cálculo de métricas creativas derivadas mediante el toolkit MediaAttention: foco, carga cognitiva y atención sobre áreas de interés (marca, producto, titular, CTA) con `--aoi auto`.
- Detección automática de áreas de interés (`--aoi auto`) sobre la propia imagen, sin anotación manual.
- Soporte multi‑categoría dentro del mismo checkpoint: pósters (CC 0,752), UIs móviles (CC 0,820), UIs de escritorio (CC 0,692) y páginas web (CC 0,674).
- Interfaz de línea de comandos (`mediaattention ad.png`) y API de Python (`from mediaattention.saliency import ads`) además de una UI web local.
- Arquitectura con rama recurrente ConvGRU preparada para vídeo, aunque este checkpoint se documenta y evalúa en modo imagen estático.
- No soporta tool calling, function calling, agentes, razonamiento multi‑paso ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- **Pretest de creatividades antes de lanzar campaña**: se genera el mapa de calor de cada pieza y se comparan las métricas de foco y atención sobre CTA para descartar variantes antes de invertir en medios. El coste de 0,04 s por imagen permite evaluar lotes de decenas de creatividades en segundos.
- **Optimización de jerarquía visual en carteles y pósters**: es el dominio donde el modelo rinde mejor (CC 0,752 en el test de UEyes, frente a 0,496 de TranSalNet‑Dense), por lo que sirve para validar que el titular y el producto captan atención antes que los elementos decorativos.
- **Auditoría de interfaces móviles**: con CC 0,820 en UIs móviles, permite comprobar si el botón principal o el precio reciben atención suficiente en la primera pantalla, útil en equipos de producto y UX.
- **Evaluación de landing pages y páginas web**: con CC 0,674 en web dentro de UEyes, se puede analizar el reparto de atención entre texto e imágenes; conviene contrastar con modelos de mayor tamaño si el dominio es web puro (ver limitaciones).
- **Ranking automático de variantes A/B creativas**: integrado en un pipeline de marketing, el modelo puntúa cada variante y ordena por atención estimada sobre la marca o el CTA, reduciendo la dependencia de paneles humanos costosos.
- **Investigación en visión computacional**: reproducción de benchmarks de saliency con pysaliency y los scripts de `benchmarks/`, incluyendo comparación directa con TranSalNet, DeepGaze IIE, DeepGaze MSDB y UNISAL stock.
- **Formación y docencia en diseño y marketing**: la UI web local permite visualizar el mapa de calor sobre la pieza sin escribir código, lo que facilita explicar por qué una composición funciona o no.
- **Análisis de placement de marca en packaging y materiales impresos**: al estimar densidad de fijación sobre la imagen completa, se puede verificar si el logotipo cae en zonas de alta atención antes de mandar a imprenta.

## Benchmarks y rendimiento

Pósters, split de test de UEyes (n = 27). Métricas calculadas con pysaliency, promediadas por imagen:

| Modelo | CC ↑ | IC 95 % | NSS ↑ | KLD ↓ |
|---|---|---|---|---|
| MediaAttention-Ads v1 | 0,752 | [0,695; 0,809] | 1,55 | 0,354 |
| TranSalNet-Dense | 0,496 | [0,440; 0,551] | 0,98 | 0,792 |
| DeepGaze IIE | 0,458 | [0,392; 0,524] | 0,90 | 0,894 |
| UNISAL (stock) | 0,454 | [0,389; 0,518] | 0,90 | 0,913 |
| DeepGaze MSDB | 0,416 | [0,351; 0,481] | 0,86 | 1,079 |
| Spectral residual | 0,285 | [0,209; 0,361] | 0,58 | 1,082 |
| Baseline de sesgo central | 0,281 | [0,218; 0,344] | 0,55 | 0,949 |

Split de test completo de UEyes (108 imágenes, todas las categorías):

| Modelo | CC ↑ | NSS ↑ | sAUC ↑ | SIM ↑ | KLD ↓ | Póster CC | Móvil CC | Escritorio CC | Web CC |
|---|---|---|---|---|---|---|---|---|---|
| MediaAttention-Ads v1 | 0,735 | 1,53 | 0,731 | 0,680 | 0,399 | 0,752 | 0,820 | 0,692 | 0,674 |
| TranSalNet-Dense | 0,514 | 1,00 | 0,646 | 0,559 | 0,771 | 0,496 | 0,601 | 0,482 | 0,476 |
| UNISAL (stock) | 0,467 | 0,92 | 0,640 | 0,543 | 0,864 | 0,454 | 0,504 | 0,456 | 0,452 |
| DeepGaze IIE | 0,454 | 0,92 | 0,667 | 0,522 | 0,871 | 0,458 | 0,460 | 0,453 | 0,445 |
| DeepGaze MSDB | 0,452 | 0,94 | 0,690 | 0,499 | 1,039 | 0,415 | 0,530 | 0,465 | 0,397 |
| Baseline de sesgo central | 0,219 | 0,40 | 0,499 | 0,447 | 1,021 | 0,281 | 0,189 | 0,190 | 0,215 |
| Spectral residual | 0,214 | 0,44 | 0,616 | 0,433 | 1,125 | 0,285 | 0,131 | 0,270 | 0,169 |

Web fuera de dominio, FiWI (149 páginas; ningún modelo se entrenó con este conjunto):

| Modelo | CC ↑ | NSS ↑ | sAUC ↑ | SIM ↑ | KLD ↓ | Pictórico CC | Mixto CC | Texto CC |
|---|---|---|---|---|---|---|---|---|
| DeepGaze MSDB | 0,676 | 1,54 | 0,748 | 0,642 | 0,462 | 0,751 | 0,686 | 0,592 |
| DeepGaze IIE | 0,649 | 1,50 | 0,729 | 0,629 | 0,504 | 0,726 | 0,680 | 0,541 |
| MediaAttention-Ads v1 | 0,631 | 1,27 | 0,685 | 0,617 | 0,500 | 0,653 | 0,643 | 0,597 |
| UNISAL (stock) | 0,616 | 1,31 | 0,661 | 0,613 | 0,575 | 0,676 | 0,641 | 0,531 |
| TranSalNet-Dense | 0,608 | 1,25 | 0,646 | 0,605 | 0,603 | 0,650 | 0,642 | 0,532 |

## Requisitos de hardware

- **VRAM estimada**: los 3,7 M de parámetros ocupan ≈15 MB en fp32 y ≈7,4 MB en fp16 (cálculo derivado del número de parámetros, no publicado por el autor). Las activaciones de un MobileNetV2 a resolución de entrada son del orden de decenas de MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- **GPU recomendadas**: no requiere GPU dedicada. El autor reporta 0,04 s por imagen en un Apple M3 Pro. Cualquier GPU con soporte CUDA (RTX 3060 en adelante), Apple Silicon vía MPS o una CPU moderna son suficientes; A100/H100 no aportan ventaja relevante por el tamaño del modelo.
- **Cabe en GPU consumer**: sí, en todas, con un consumo de memoria prácticamente despreciable.
- **Despliegue**: paquete oficial `pip install "mediaattention[all]"`, CLI `mediaattention ad.png --aoi auto`, UI web local con `mediaattention ui` y API de Python (`from mediaattention.saliency import ads`). El state dict es un `.pth` estándar de PyTorch, por lo que puede cargarse en cualquier runtime de PyTorch; no se publican artefactos GGUF, ONNX ni TensorRT.
- **Latencia y throughput**: 0,04 s/imagen en M3 Pro, equivalente a ≈25 imágenes por segundo en ese hardware. No se han publicado cifras de latencia para otras plataformas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrenado en | Vídeo | Licencia | s/imagen (M3 Pro) | CC UEyes test | CC FiWI |
|---|---|---|---|---|---|---|---|---|
| MediaAttention-Ads v1 | UNISAL (MobileNetV2 + gaussianas + ConvGRU + decoder con skips) | 3,7 M | SALICON → fine‑tuning en UEyes | Sí (recurrente) | Apache-2.0 | 0,04 | 0,735 | 0,631 |
| UNISAL (stock) | Igual que el anterior | 3,7 M | SALICON, DHF1K, Hollywood-2, UCF Sports | Sí (recurrente) | Apache-2.0 | 0,04 | 0,467 | 0,616 |
| TranSalNet-Dense | CNN DenseNet-161 + encoder transformer + decoder CNN | 76,6 M | SALICON | No | MIT | 0,10 | 0,514 | 0,608 |
| DeepGaze IIE | Ensemble de 4 backbones (DenseNet-201, ResNeXt-50, EfficientNet-B5, ShapeNet-ResNet; información truncada en la model card) | No disponible | No disponible en la información proporcionada | No disponible | No disponible | No disponible | 0,454 | 0,649 |
| DeepGaze MSDB | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | 0,452 | 0,676 |

La comparación relevante es de eficiencia por unidad de rendimiento: MediaAttention-Ads v1 obtiene la mejor CC en el dominio publicitario con 3,7 M de parámetros, 20 veces menos que TranSalNet-Dense (76,6 M), y a una cuarta parte del tiempo de inferencia.

## Limitaciones y advertencias

- **Dominio estrecho**: está afinado sobre UEyes (pósters, anuncios, UIs y webs). En FiWI, un conjunto web fuera de dominio, queda por detrás de DeepGaze MSDB (0,631 frente a 0,676 de CC) y de DeepGaze IIE (0,649). Para web pura conviene evaluar ambas opciones.
- **Protocolo de eye tracking limitado**: 62 participantes, dispositivo Gazepoint GP3, 7 segundos de visionado libre. No hay garantía de que las predicciones se mantengan con duraciones distintas, tareas dirigidas a un objetivo, culturas o rangos de edad no representados.
- **No modela trayectorias de mirada**: produce densidad de fijación agregada, no orden de lectura ni secuencias sacádicas. Tampoco predice emoción, recuerdo, reconocimiento de marca ni conversión; las métricas de MediaAttention son proxies de atención, no de eficacia publicitaria.
- **Riesgo de sobreinterpretación**: un mapa de calor atractivo visualmente puede llevar a conclusiones causales que el modelo no respalda. Los resultados deben tratarse como una señal correlacional (CC 0,752 en pósters) con intervalos de confianza que en el caso de pósters llegan a ±0,057.
- **Contenido textual**: el rendimiento en zonas de texto depende de la representación visual; el modelo no lee ni comprende el texto del anuncio. En FiWI su CC en regiones de texto es 0,597, ligeramente superior a DeepGaze MSDB (0,592) pero sin margen amplio.
- **Vídeo no validado en este checkpoint**: la arquitectura incluye ConvGRU, pero la model card documenta únicamente uso estático (`static=True`) y no se publican resultados en vídeo para este ajuste fino.
- **Licencia**: el modelo es Apache-2.0 y permite uso comercial. El dataset UEyes es CC BY 4.0, por lo que cualquier redistribución derivada debe mantener la atribución correspondiente.
- **Madurez del ecosistema**: repositorio con 0 descargas y 0 likes en el momento de la consulta, tamaño declarado de 0,0 GB y un único mantenedor. No hay garantía de soporte a largo plazo, hoja de ruta ni auditoría externa independiente.
- **Sin datos sobre sesgos demográficos**: no se publica información sobre la composición de los 62 participantes (edad, género, procedencia), lo que impide evaluar sesgos de atención asociados a rostros o códigos culturales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pranikz/MediaAttention-Ads
- Modelo base (UNISAL SALICON): https://huggingface.co/pranikz/MediaAttention
- Repositorio GitHub del toolkit: https://github.com/pranikz/MediaAttention
- Script de ajuste fino: https://github.com/pranikz/MediaAttention/blob/main/benchmarks/finetune_unisal.py
- Directorio de benchmarks y puntuaciones por imagen: https://github.com/pranikz/MediaAttention/tree/main/benchmarks
- Registro en Zenodo: https://zenodo.org/records/23543522
- Perfil del autor en GitHub: https://github.com/pranikz
- Referencia citada en la model card: Droste, Jiao y Noble, «Unified Image and Video Saliency Modeling» (UNISAL), ECCV 2020 (sin enlace verificado en la información disponible).
- Referencia del dataset: Jiang et al., UEyes, CHI 2023, CC BY 4.0 (sin enlace verificado en la información disponible).
- Referencia del conjunto de evaluación web: FiWI (sin enlace verificado en la información disponible).
