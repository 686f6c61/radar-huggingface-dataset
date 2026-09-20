# LexHo/tartanimu-a3v21

## Resumen

TartanIMU `a3v21_s42` es un modelo de odometría inercial desarrollado por el equipo Lexxxxx (usuario LexHo) para el TartanIMU Challenge de IROS 2026. No es un modelo de lenguaje: su única función es estimar la velocidad en marco corporal a partir de señal IMU bruta de 6 ejes (acelerómetro y giroscopio), ventana a ventana, y se evaluó sobre cuatro plataformas distintas (coche, perro, dron y humano) con una única red neuronal.

El modelo es la segunda entrada considerada del equipo en el leaderboard, con un TartanIMU Score oficial de 0.26306, una macro AVE de 0.22232 y una macro ATE20 de 0.63665. La entrada principal del equipo es `a3v20_s42`, con un score oficial de 0.25878, publicada en un repositorio separado. Cada repositorio contiene exactamente un modelo y el fichero de predicciones exacto que produjo, lo que permite reproducir la puntuación declarada.

Su relevancia es metodológica: demuestra que un único conjunto de pesos compartido puede cubrir cuatro morfologías y dinámicas muy distintas sin clasificador de plataforma ni enrutado en inferencia. La generalización se logra mediante condicionamiento FiLM a nivel de grabación, un tronco convolucional dilatado preentrenado de forma autosupervisada con enmascaramiento de IMU y un GRU bidireccional sobre fragmentos de 40 ventanas. El repositorio está publicado con licencia MIT y no tiene descargas ni likes registrados en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tronco ResNet 1-D dilatado (5 tokens por ventana) + condicionamiento FiLM por grabación + GRU bidireccional sobre fragmentos de 40 ventanas + cabeza lineal |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable; ventanas densas de 1 s con desplazamiento aleatorio, fragmentos de 40 ventanas y solapamiento con stride K/2 dentro de cada trayectoria |
| Tipos de cuantización | no disponible (no se publican versiones cuantizadas; pesos en punto flotante) |
| Idiomas soportados | no aplicable (modelo de odometría inercial; no procesa texto ni voz) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`weights/tartanimu_a3v21_s42.pt`, sha256 `7d90badeb2873b1d8f3e13ffca21a624cf2b2ae8a5f838473a7ac44964f9c07b`) |
| Entrada | 14 canales: IMU bruta de 6 ejes + descomposición de 8 canales respecto a una dirección "arriba" estimada con un filtro complementario lento |
| Salida | Velocidad en marco corporal por ventana |
| Plataformas evaluadas | Coche, perro, dron y humano (modelo único, sin etiqueta de plataforma en entrada) |
| Función de pérdida | Huber con β = 0.05 |
| Semilla de entrenamiento | 42 (preasignada) |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La red principal es la misma que la de la entrada primaria `a3v20`, pero sin los submódulos learned-INS ni la cabeza de recursión, y con condicionamiento FiLM a nivel de grabación. El flujo es el siguiente: ventanas densas de 1 s con desplazamiento aleatorio se convierten en 14 canales de entrada (IMU bruta más una descomposición de 8 canales en torno a la dirección "arriba" calculada con un filtro complementario lento sobre la propia IMU); estos canales entran en un tronco ResNet 1-D dilatado que produce 5 tokens por ventana; cada bloque del tronco se modula mediante FiLM (escala y desplazamiento por canal) a partir de un descriptor de 35 dimensiones de la grabación completa; después, un GRU bidireccional opera sobre fragmentos de 40 ventanas y una cabeza lineal emite la velocidad en marco corporal por ventana. El descriptor FiLM incluye media y dispersión por eje, rugosidad del paso de la IMU bruta, estadísticas de ventanas de reposo, un espectro de 10 bins de |acc|, percentiles de tasa de giro y el logaritmo de la duración; se calcula solo con IMU, sin etiquetas, dentro del mismo paso hacia delante.

El tronco se inicializó mediante preentrenamiento autosupervisado con enmascaramiento de IMU sobre el train+val publicado (sin etiquetas). Las aumentaciones de entrenamiento son dilatación temporal con k ∈ [0.7, 1.5] (aplicada al dron; la familia de carreras de la fuente identidad queda limitada a 1.2) y, solo para la familia de carreras, escalado de traslación s ∈ [1.0, 1.8] aplicado a las etiquetas de velocidad y a la fuerza específica sin gravedad ("S-fast"); para la fuente identidad se aplica aumento de guiñada respecto a la "arriba" estimada (solo dirección). Los pesos finales corresponden a la última época de una ejecución de 120 épocas sobre train+val. No se usa conjunto de test, ni datos externos, ni pesos preentrenados externos en el sistema enviado; los experimentos de desarrollo con el conjunto externo NeuroBEM se declaran en el informe técnico, pero ni sus pesos ni sus datos forman parte del modelo.

## Capacidades

- Estimación de velocidad en marco corporal a partir de IMU bruta de 6 ejes, ventana a ventana, con ventanas de 1 s.
- Modelo único y un solo conjunto de pesos compartido para las cuatro plataformas del reto: coche, perro, dron y humano.
- Inferencia sin etiqueta de plataforma y sin enrutado: la condicionamiento FiLM se calcula a partir de la propia IMU de la grabación.
- Aprovechamiento de contexto de grabación completa mediante un descriptor de 35 dimensiones (estadísticas por eje, espectro de |acc|, percentiles de giro, duración).
- Agregación de predicciones propias mediante media de fragmentos solapados con stride K/2 dentro de cada trayectoria.
- Inferencia determinista, sin ensemble, sin media de checkpoints y sin test-time augmentation.
- Entrada únicamente IMU: no procesa imágenes, audio, texto ni etiquetas de plataforma.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no aplicable).

## Casos de uso

- Odometría inercial para robot móvil terrestre: estimar la velocidad del vehículo a partir únicamente de la IMU, útil como fuente de dead-reckoning cuando el GNSS u otros sensores externos fallan.
- Navegación en entornos GPS-denied para drones: el modelo cubre la plataforma dron dentro del mismo conjunto de pesos, por lo que sirve como estimador de velocidad en interiores o bajo dosel vegetal.
- Fusión de sensores como observación auxiliar: la velocidad en marco corporal por ventana puede alimentar un filtro de Kalman junto a GNSS, ruedas o LiDAR, aportando información cuando el resto de sensores se degrada.
- Robótica cuadrúpeda con carga útil limitada: el modelo es específico para la plataforma perro y no requiere hardware adicional más allá de una IMU de 6 ejes.
- Análisis de marcha y actividad humana con wearables: estimación de velocidad a partir de una IMU de bajo coste en dispositivos portátiles.
- Reproducción de resultados de investigación: el repositorio incluye `submission.csv` con md5 `a53e196f6b67e8ea52733f4386b5c403` y `SHA256SUMS`, lo que permite verificar una reproducción bit a bit con tolerancia numérica acotada.
- Evaluación comparativa de métodos de odometría inercial: sirve como referencia reproducible de una entrada del TartanIMU Challenge con código de inferencia idéntico al del sistema enviado.
- Despliegue en CPU en entornos aislados: la reejecución medida en CPU, entorno aislado, bloqueo de sockets a nivel de proceso y caché vacía tarda 1 min 10 s de reloj con 1.4 GB de RSS.
- Ingeniería de features para competencias similares: el esquema de condicionamiento FiLM por grabación y la descomposición de 8 canales respecto a la dirección "arriba" son reutilizables como receta metodológica.

## Benchmarks y rendimiento

Resultados declarados por el autor para la entrada enviada (`submission.csv` correspondiente):

| Métrica | Valor |
|---|---|
| TartanIMU Score | 0.26306 |
| Macro AVE | 0.22232 |
| Macro ATE20 | 0.63665 |

Comparación con la entrada primaria del mismo equipo, según los datos declarados:

| Entrada | TartanIMU Score oficial |
|---|---|
| `a3v21_s42` (este repositorio) | 0.26306 |
| `a3v20_s42` (entrada primaria) | 0.25878 |

Otras métricas de ejecución y reproducibilidad declaradas:

| Medición | Valor |
|---|---|
| Reejecución en CPU (proceso aislado, sockets bloqueados, caché vacía) | 1 min 10 s de reloj, 1.4 GB de RSS |
| Reejecución en una GPU | menos de 1 min, menos de 1 GB de VRAM |
| Tolerancia numérica entre máquinas frente a `submission.csv` (generado en RTX 5090) | media componente a componente 1.8e-5; p99 1.6e-4; máximo 1.6e-3 m/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje en la información disponible, y esos benchmarks no son aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en GPU según la medición declarada por el autor; no se publica el tamaño exacto del modelo, por lo que esa cifra es la única referencia disponible.
- GPU recomendadas: no se especifica una lista; el `submission.csv` publicado se generó en una RTX 5090. Dado el consumo declarado, cualquier GPU con al menos 1 GB de memoria libre es suficiente en la práctica.
- Cabe en GPU de consumo: sí, según la medición de menos de 1 GB de VRAM y menos de 1 min de ejecución.
- Ejecución en CPU: soportada; 1 min 10 s de reloj y 1.4 GB de RSS en entorno aislado.
- Opciones de despliegue: el script `predict.py` incluido en el repositorio sobre PyTorch. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni runtimes de cuantización, que no son aplicables a este tipo de modelo.
- Latencia y throughput: menos de 1 min por GPU para el conjunto de test del reto y 1 min 10 s en CPU; no se publica throughput por ventana ni latencia por muestra.

## Comparativa con modelos similares

La información disponible solo permite comparar con la otra entrada del mismo equipo. No se dispone de datos de terceros con los que confrontar el modelo.

| Modelo | Parámetros | Contexto | TartanIMU Score | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `a3v21_s42` (este modelo) | no disponible | Ventanas de 1 s, fragmentos de 40 ventanas | 0.26306 | MIT | https://huggingface.co/LexHo/tartanimu-a3v21 |
| `a3v20_s42` (entrada primaria del equipo) | no disponible | no disponible | 0.25878 | MIT | https://huggingface.co/LexHo/tartanimu-a3v20 |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Diferencias declaradas entre ambas entradas: `a3v21` elimina los submódulos learned-INS y la cabeza de recursión de `a3v20`, incorpora condicionamiento FiLM a nivel de grabación y añade el aumento de entrenamiento "S-fast" para la familia de carreras. El conjunto externo NeuroBEM se menciona únicamente como material de experimentos de desarrollo, sin que sus pesos o datos entren en el modelo enviado, por lo que no se incluye como comparativa de rendimiento.

## Limitaciones y advertencias

- El modelo solo acepta IMU bruta de 6 ejes; no acepta imágenes, audio, texto ni etiqueta de plataforma como entrada.
- El repositorio no publica el número de parámetros, la composición exacta del dataset de entrenamiento ni detalles de arquitectura más allá de la descripción del método.
- No se publican versiones cuantizadas, ni pesos en formato safetensors, GGUF u otros formatos alternativos; solo el checkpoint PyTorch.
- Repositorio sin descargas ni likes registrados y con fecha de creación y actualización idénticas (2026-09-20), lo que limita la validación externa por parte de terceros.
- El rendimiento se ha validado exclusivamente en el conjunto de test del TartanIMU Challenge; no hay evidencia publicada de generalización a otras IMUs, frecuencias de muestreo, montajes o plataformas distintas de las cuatro del reto.
- La puntuación declarada es autoinformada y se apoya en `submission.csv` con md5 y en `SHA256SUMS`; la reproducibilidad numérica entre máquinas tiene una tolerancia máxima declarada de 1.6e-3 m/s, que puede ser relevante en aplicaciones con requisitos estrictos de precisión.
- Durante el desarrollo se realizó una sonda sobre el leaderboard público con una regla de post-procesado física que no forma parte del envío; si se reutiliza este código conviene tenerlo en cuenta al interpretar comparaciones con otras entradas.
- Los experimentos con el conjunto externo NeuroBEM se declaran en el informe técnico, pero sus pesos y datos no están en este modelo.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; no se declaran evaluaciones de sesgo ni de robustez ante fallos de sensor (saturación, deriva térmica, pérdida de muestras).
- No se han publicado resultados de benchmarks estándar de razonamiento, código o matemáticas, y no son aplicables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LexHo/tartanimu-a3v21
- Entrada primaria del equipo (`a3v20_s42`, score oficial 0.25878): https://huggingface.co/LexHo/tartanimu-a3v20
- Repositorio del reto TartanIMU Challenge (IROS 2026): no disponible en la información proporcionada
- Informe técnico del equipo: no disponible en la información proporcionada
- Paper o preprint asociado: no disponible en la información proporcionada
- Repositorio de código independiente: no disponible (el código de inferencia se distribuye dentro del propio repositorio de HuggingFace)
- Los resultados de búsqueda web obtenidos no contienen enlaces relevantes para este modelo: consisten únicamente en páginas de ayuda de YouTube TV y de la aplicación móvil de YouTube, sin relación con el modelo ni con el reto.
