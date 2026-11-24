# ariadgolf/golf-tee-box-detector

## Resumen

Ariad Golf Tee Box Detector es un modelo de segmentación semántica especializado en la detección de tee boxes (zonas de salida) en campos de golf a partir de imágenes aéreas multiespectrales de cuatro bandas (rojo, verde, azul e infrarrojo cercano) con una resolución de 0,3 metros por píxel. Lo desarrolla ariadgolf, el equipo detrás de la web de mapas de campos de golf ariad.golf, y se distribuye como un fine-tune del modelo de segmentación de campos de golf v4 del mismo autor, al que se le han añadido etiquetas específicas de tee y una regla de aceptación determinista que descarta detecciones dudosas.

El modelo resuelve un problema muy concreto: localizar la zona de salida de un hoyo cuando se conoce una posición aproximada, para poder generar rutas de hoyo y libros de distancias. La red por sí sola no es fiable (solo el 63% de las cajas detectadas eran tees en el test de desarrollo), pero combinada con la regla de aceptación `tee_rule.py` alcanza un 98,4% de precisión en cajas aceptadas sobre imágenes de resolución nativa de 0,3 m en un test pre-registrado.

Arquitectónicamente es una U-Net con encoder ResNet-34 implementada con Segmentation Models PyTorch, con 24,46 millones de parámetros y pesos en FP32 Safetensors. No es un modelo de lenguaje ni un modelo generativo: es un segmentador de imagen a imagen con seis clases (fondo, green, tee, calle, bunker y agua), aunque este fine-tune solo optimiza la clase tee.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-34 (Segmentation Models PyTorch) |
| Parametros totales | 24.459.238 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 512 × 512 píxeles × 4 bandas) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP32) |
| Idiomas soportados | en (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32) |
| Entrada | 4 bandas: rojo, verde, azul, infrarrojo cercano (en ese orden), uint8 0–255 |
| Resolución de imagen | 0,3 metros terrestres por píxel |
| Tamano de tile en inferencia | 512 × 512 píxeles (entrenado con 384 × 384) |
| Salidas | 6 logits por píxel; clase 2 = tee |
| Modelo base | ariadgolf/golf-course-segmentation (v4) |
| Librería | segmentation-models-pytorch |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es una U-Net con encoder ResNet-34, la configuración estándar de Segmentation Models PyTorch para segmentación semántica densa. Recibe un tensor de cuatro canales (RGB + NIR) normalizado con la media y desviación típica definidas en `preprocessor_config.json` mediante `(raw_pixel - mean) / std`, sin dividir previamente por 255. La salida son seis logits por píxel correspondientes a las clases fondo, green, tee, calle, bunker y agua; la probabilidad de tee se obtiene aplicando softmax sobre el canal 2.

El entrenamiento parte de un warm start desde el modelo v4 de segmentación de campos de golf del mismo autor y se realiza sobre 7.221 tiles de entrenamiento y 835 de validación procedentes de 2.610 campos, durante 8 épocas. Solo la clase tee fue objetivo del fine-tune; el resto de clases conservan el comportamiento heredado de v4. La innovación principal no está en la red sino en el sistema que la rodea: una regla de aceptación determinista (`tee_rule.py`) que filtra las detecciones en función de resolución nativa, área, forma tipo pad, probabilidad media, oscuridad y textura, solapamiento con greens y coherencia con las distancias del scorecard. Los umbrales se ajustaron únicamente sobre ubicaciones de validación, y el test de resolución se añadió a posteriori tras observar que las cajas sobre imágenes de 0,6 m eran a menudo erróneas.

## Capacidades

- Segmentación semántica densa de imágenes aéreas multiespectrales de cuatro bandas a 0,3 m/píxel.
- Detección de tee boxes en una ubicación aproximada conocida, devolviendo la caja del tee y sus medidas.
- Clasificación por píxel en seis clases (fondo, green, tee, calle, bunker, agua), aunque solo la clase tee está afinada en este checkpoint.
- Filtrado de detecciones mediante regla determinista con criterios geométricos, radiométricos y de coherencia con el hoyo.
- Integración con datos auxiliares del hoyo (green propio, greens de otros hoyos, líneas de juego y longitudes del scorecard) que solo pueden descartar cajas, nunca aceptarlas.
- Inferencia sobre tiles GeoTIFF mediante rasterio y utilidades de línea de comandos (`inference.py`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.

## Casos de uso

- Generación automática de mapas de campos de golf: el modelo localiza el tee de cada hoyo a partir de una posición aproximada y permite trazar la ruta de hoyo y calcular distancias para los mapas gratuitos de ariad.golf.
- Producción de libros de distancias (yardage books): al conocer el tee y el green, se pueden calcular distancias a obstáculos y puntos de referencia con la precisión que exige la regla de aceptación (98,4% en resolución nativa de 0,3 m).
- Enriquecimiento de bases de datos geoespaciales de campos de golf: procesamiento por lotes de ortofotos NAIP u otras fuentes multiespectrales para poblar catálogos de hoyos con coordenadas de tee verificadas.
- Control de calidad de inventarios existentes: dado un tee registrado previamente, el modelo y la regla pueden validar o rechazar la ubicación, ya que la regla solo descarta cajas y nunca acepta una ubicación sin respaldo visual.
- Integración en pipelines de teledetección con rasterio: el script `inference.py` acepta tiles GeoTIFF y produce un raster de probabilidad de tee más el veredicto de la regla, lo que facilita su inclusión en flujos ETL geoespaciales.
- Análisis de cobertura y planificación de campos: la segmentación de tee, green, calle, bunker y agua (vía el modelo base v4) permite estudiar la distribución de elementos del campo y planificar mantenimiento o rediseños.
- Aplicaciones de realidad aumentada o navegación en el campo: la posición precisa del tee sirve para inicializar rutas de hoyo en apps de golf que guían al jugador.

## Benchmarks y rendimiento

Los resultados publicados provienen de revisiones ciegas de renders aéreos realizados por un modelo de visión por IA (el revisor veía la caja y el green del hoyo, no el scorecard ni veredictos anteriores). No son ground truth topográfico.

**Test de desarrollo** (200 ubicaciones candidatas reservadas en AZ, CO, GA, IA y OR, la mitad previamente revisadas como tee y la mitad como no tee):

| Detector | Cajas | Juzgadas como tee (excluyendo dudosas) |
|---|---:|---:|
| Modelo de segmentación v4 | 153 | 69% |
| Esta red, todas las cajas, sin regla | 157 | 63% |
| Esta red + regla, cualquier resolución | 58 | 91% |
| Esta red + regla, solo resolución nativa 0,3 m | 45 | 97,4% (38 de 39) |
| Esta red + regla, solo imágenes de 0,6 m | 13 | 57% |

**Test de confirmación**: la model card indica que, al haberse elegido el test de resolución tras ver los resultados de desarrollo, la regla final se volvió a probar sobre ubicaciones nuevas, con código, pesos, regla y muestra. El texto de la model card disponible se interrumpe en ese punto, por lo que el resultado agregado del test de confirmación no está disponible en la información proporcionada. La cifra del 98,4% citada en el resumen corresponde al test pre-registrado sobre resolución nativa de 0,3 m.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 24,46 millones de parámetros en FP32, los pesos ocupan aproximadamente 98 MB, y un tile de 512 × 512 × 4 en FP32 ocupa unos 4 MB, por lo que la inferencia completa cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 no aportan ventaja significativa por modelo, sino por paralelismo de lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 Ti en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: inferencia nativa con PyTorch y Segmentation Models PyTorch (la vía documentada); el modelo no está pensado para vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje. Para servir el modelo se puede envolver en un servicio propio (FastAPI, TorchServe) o integrarlo en pipelines de rasterio.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera una latencia de milisegundos por tile en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados para modelos de detección de tee boxes en campos de golf, por lo que la comparación se limita a alternativas del mismo autor o de la misma familia de segmentación.

| Modelo | Parametros | Entrada | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ariadgolf/golf-tee-box-detector | 24,46 M | 4 bandas, 512 × 512 | 0,3 m/píxel | no disponible | Hugging Face |
| ariadgolf/golf-course-segmentation (v4) | no disponible | 4 bandas | no disponible | no disponible | Hugging Face |
| U-Net + ResNet-34 genérica (SMP) | ~24 M | RGB o multiespectral | dependiente del entrenamiento | según pesos | Amplia |

La comparación cuantitativa con v4 en el test de desarrollo (69% de cajas juzgadas como tee frente a 63% de esta red sin regla y 97,4% con regla en resolución nativa) es el único dato comparativo disponible.

## Limitaciones y advertencias

- La red por sí sola no es fiable: sin la regla de aceptación, solo el 63% de las cajas detectadas eran tees en el test de desarrollo. El uso conjunto de red y regla es obligatorio según el autor.
- La regla solo acepta aproximadamente un tercio de las ubicaciones que se le proporcionan, por lo que el sistema tiene un recall bajo por diseño: prima la precisión sobre la cobertura.
- Solo funciona con imágenes de resolución nativa de 0,3 m o más fina; la regla rechaza cualquier imagen más gruesa, y una imagen de 0,6 m remuestreada a 0,3 m sigue contando como 60 cm.
- Requiere la cuarta banda como infrarrojo cercano; usar alfa u otra banda en su lugar invalida la inferencia.
- Solo la clase tee está afinada en este checkpoint; para greens, calles y bunkers debe usarse el modelo base v4.
- Los resultados publicados provienen de revisiones ciegas por un modelo de visión por IA, no de ground truth topográfico, lo que introduce un sesgo de evaluación no cuantificado.
- El test de resolución se añadió después de ver los resultados de desarrollo, lo que motivó un test de confirmación adicional cuyos resultados agregados no están disponibles en la información proporcionada.
- La licencia no está disponible, por lo que no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en producción.
- El repositorio no contiene imágenes, datos de entrenamiento ni registros de revisión, lo que limita la reproducibilidad completa del sistema.
- Riesgo de alucinación en sentido figurado: la red puede producir cajas con alta probabilidad en zonas que no son tees (canchas de tenis, zonas ajardinadas similares), mitigado parcialmente por la regla pero no eliminado.
- Sesgos geográficos: el entrenamiento y los tests se centran en campos de Estados Unidos (AZ, CO, GA, IA, OR en el test de desarrollo), por lo que el rendimiento en otras regiones o tipos de campo no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ariadgolf/golf-tee-box-detector
- Modelo base v4: https://huggingface.co/ariadgolf/golf-course-segmentation
- Web del autor: https://www.ariad.golf
- Repositorio de Segmentation Models PyTorch: no disponible en la información proporcionada
- Paper de U-Net: no disponible en la información proporcionada
- Paper de ResNet: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
