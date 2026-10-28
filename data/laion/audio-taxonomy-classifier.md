# laion/audio-taxonomy-classifier

## Resumen

`laion/audio-taxonomy-classifier` es un clasificador de audio desarrollado por LAION que asigna a un clip de audio una clase dentro de una taxonomía jerárquica de sonidos de 4.416 nodos (11 grupos de primer nivel, profundidad máxima 5, 4.085 hojas). El modelo predice 3.718 clases —los nodos de profundidad 2 y 3, con los nodos más profundos fusionados en su ancestro de nivel 3— y, por separado, uno de los 11 grupos de primer nivel: habla, música, sonidos humanos no vocales, animales y bioacústica, naturaleza y entorno, doméstico, urbano y transporte, industrial y mecánico, interfaz y electrónico, efectos de sonido y deportes y recreación.

La arquitectura es un encoder Dasheng-0.6B congelado que produce un vector de 1.280 dimensiones (media de las características de trama de los primeros 10 segundos del clip, remuestreados a 16 kHz mono) y una cabeza MLP de 6,0 M de parámetros con tres salidas lineales (3.718 clases, 822 nodos de segundo nivel y 11 grupos). La lectura final combina las probabilidades jerárquicas de cada clase con sus ancestros, de modo que la coherencia taxonómica forma parte del propio mecanismo de decisión.

Su relevancia práctica está en la escala: la ontología de AudioSet tiene 632 clases y esta taxonomía es unas siete veces mayor y mucho más fina (por ejemplo, 100 clases bajo `Music/Rock / metal-based music`). El caso de uso declarado por el autor es el etiquetado barato de grandes colecciones de audio para filtrado, curación, balanceo y búsqueda, no la clasificación de alta precisión en dominios abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Dasheng-0.6B congelado (pooling medio de características de trama a un vector de 1.280 d) + cabeza MLP: Linear 1280→1024, BatchNorm, GELU, dropout 0,2 y tres salidas lineales (3.718 clases, 822 nodos de nivel 2, 11 grupos) |
| Parametros totales | Aproximadamente 0,6 B en el encoder Dasheng-0.6B (congelado) + 6,0 M en la cabeza de clasificación |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 10 segundos de audio (se toman los primeros 10 s del clip, 16 kHz mono, con relleno de ceros hasta 10 s) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo opera sobre audio; las etiquetas de la taxonomía están en inglés según los ejemplos de la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | `head.safetensors` (los metadatos incluyen la configuración y la lista ordenada de clases); los pesos del encoder Dasheng se descargan por separado y su formato no se detalla en la información disponible |
| Numero de clases | 3.718 clases predichas + 11 grupos de primer nivel (taxonomía completa de 4.416 nodos) |
| Ficheros del repositorio | `head.safetensors`, `taxonomy.yaml` (taxonomía completa con descripción por nodo), `inference.py` |

## Arquitectura y entrenamiento

El modelo es un clasificador de audio en dos etapas. El encoder Dasheng-0.6B se mantiene congelado y actúa como extractor de características: el clip se remuestrea a 16 kHz mono, se recortan los primeros 10 s, se rellena con ceros y las características de trama resultantes se promedian en un único vector de 1.280 dimensiones. Sobre ese vector se aplica una cabeza de 6,0 M de parámetros con tres salidas lineales independientes. La lectura de cada clase se calcula como log P(grupo superior) + log P(segundo nivel) + log P(clase), usando los ancestros propios de esa clase, y a continuación se aplica un softmax sobre las 3.718 clases; el grupo de primer nivel se toma directamente de la salida de 11 vías. Esto significa que la salida fina y la salida gruesa se pueden usar por separado, y que la primera está condicionada por la coherencia jerárquica.

El entrenamiento tiene dos fases. En la primera, 232.728 clips procedentes de conjuntos públicos y de audio web recibieron etiquetas destiladas a partir de sus subtítulos: un modelo de lenguaje grande leyó el texto asociado a cada clip y lo asignó a un nodo de la taxonomía. La cabeza se entrenó sobre las características congeladas de Dasheng con entropía cruzada balanceada por clase (pesos 1/√frecuencia) más pérdidas auxiliares de grupo superior y de segundo nivel; los conjuntos de entrenamiento, validación y prueba se separaron por archivo de origen. En la segunda fase —la versión publicada— se muestrearon 80.159 clips adicionales, con ponderación hacia los ocho grupos distintos de habla, música y animales y hacia los clips en los que la primera cabeza mostraba menor confianza. Tres modelos de audio etiquetaron cada clip de forma independiente: dos modelos contraste audio-texto, que ordenaban los nombres de clase como indicaciones textuales, y Qwen2.5-Omni-7B, al que se pidió elegir un grupo de primer nivel. Para esos ocho grupos se conservó un clip solo si los tres modelos coincidían en el grupo superior (14.981 clips), y la etiqueta fina se tomó de la clase principal del modelo contraste más confiado. En habla, música y animales se mantuvo la etiqueta de la primera cabeza cuando su probabilidad de grupo superior era ≥ 0,6 (17.639 clips). Con esos 32.620 clips se reajustó la cabeza durante 60 épocas con la misma pérdida, AdamW a lr 1e-3 y un calendario coseno.

## Capacidades

- Clasificación audio→etiqueta de un solo clip, con una clase fina (1 de 3.718) y un grupo de primer nivel (1 de 11) predichos de forma independiente.
- Predicción jerárquica coherente: la puntuación de cada clase integra las probabilidades de sus ancestros antes del softmax.
- Salida en forma de ranking: el autor recomienda usar las clases finas como lista ordenada (top-5), reservando la etiqueta de grupo superior como señal fiable.
- Cobertura amplia de sonidos: habla, música, sonidos humanos no vocales, bioacústica, entorno natural, doméstico, urbano y transporte, industrial, interfaz electrónica, efectos de sonido y deportes.
- Distinción fina dentro de habla (por ejemplo, habla ruidosa captada en exterior, habla interrumpida por un zumbido electrónico, habla instructiva).
- Etiquetado masivo de colecciones para filtrado, curación, balanceo y búsqueda por etiqueta.
- No es un modelo generativo: no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, no transcribe audio y no proporciona marcas temporales ni detección de eventos por segmentos.

## Casos de uso

- Curación de grandes colecciones de audio: pasar cada clip por el modelo y agregar las predicciones de grupo superior para medir cómo se reparte la colección sobre las 11 categorías; permite detectar sesgos de composición antes de usar el dataset para entrenar.
- Filtrado previo a pipelines de audio-texto: descartar o limitar clips de música, ruido urbano o sonidos industriales cuando el objetivo es un corpus centrado en habla o en sonidos naturales, usando la salida de 11 vías.
- Balanceo de datasets: aplicar topes por grupo sobrerrepresentado (por ejemplo, reducir doméstico y urbano) y conservar los grupos minoritarios, apoyándose en la precisión del grupo superior (85,6 de macro-media en los nueve benchmarks reportados).
- Enrutado en pipelines de ASR: separar habla de no-habla antes de enviar audio a un sistema de reconocimiento; el modelo reporta 99,9 de exactitud de grupo superior en CommonVoice y 100,0 en CREMA-D, lo que lo hace adecuado como puerta de entrada barata.
- Búsqueda y exploración en fonotecas y archivos audiovisuales: indexar por ruta taxonómica y permitir consultas del tipo «encuentra sonidos de este subgénero de metal» o «localiza clips de esta categoría urbana», usando el ranking top-5 para revisión humana.
- Triaje en bioacústica: usar la categoría de animales como prefiltro (96,0 de exactitud de grupo superior en BirdCLEF 2025) antes de aplicar modelos especializados de especie, que son más caros por clip.
- Control de calidad de datasets de benchmark: etiquetar los clips de un conjunto de evaluación y comprobar la distribución de grupos superior para detectar contaminación o desequilibrios antes de publicar resultados.
- Monitorización acústica urbana a gran escala: clasificación gruesa de ruido urbano y transporte (73,2 de exactitud de grupo superior en UrbanSound8K) para informes agregados, sin pretender identificar la fuente concreta.

## Benchmarks y rendimiento

Exactitud de grupo superior en conjuntos de prueba públicos. Cada clase de benchmark tiene un conjunto fijo de grupos aceptables (1–3 grupos), elegido antes de puntuar; por ejemplo, «crackling fire» de ESC-50 acepta naturaleza, doméstico o efectos de sonido. En FSD50K (multi-etiqueta) el conjunto aceptable es la unión de las etiquetas del clip. La columna «derivada de hoja» lee el grupo superior de la mejor clase en lugar de la salida de 11 vías.

| Benchmark | Clips | Exactitud grupo superior (IC 95 %) | Derivada de hoja |
|---|---:|---:|---:|
| CommonVoice (test) | 2.500 | 99,9 (99,6–100,0) | 99,9 |
| CREMA-D | 1.500 | 100,0 (99,7–100,0) | 100,0 |
| GTZAN | 999 | 99,9 (99,4–100,0) | 99,8 |
| BirdCLEF 2025 | 1.500 | 96,0 (94,9–96,9) | 96,2 |
| NSynth (test) | 2.000 | 76,3 (74,4–78,2) | 78,4 |
| ESC-50 | 2.000 | 76,2 (74,3–78,0) | 78,7 |
| FSD50K (eval) | 2.000 | 75,0 (73,1–76,8) | 76,5 |
| VocalSound | 2.500 | 73,6 (71,8–75,3) | 75,3 |
| UrbanSound8K | 835 | 73,2 (70,1–76,1) | 72,7 |
| **Macro, 9 benchmarks** | 15.834 | **85,6** | **86,4** |

La información disponible se interrumpe al inicio de la fila de TAU Urban Acoustic Scenes 2022, por lo que no se incluye su valor. El macro reportado corresponde a los nueve benchmarks listados. No se han publicado en la información disponible resultados de exactitud de clase fina (top-1 o top-5) ni comparaciones con otros modelos bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada: los pesos del encoder de 0,6 B ocupan aproximadamente 2,4 GB en fp32 y 1,2 GB en fp16/bf16; la cabeza de 6,0 M añade unos 24 MB en fp32 y 12 MB en fp16. El consumo dominante en inferencia es el encoder, más las activaciones de una ventana de 10 s a 16 kHz.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para el encoder en fp16; para lotes grandes en proceso de etiquetado masivo conviene una GPU de datacenter (A100, H100, L40S) o una consumer de gama alta (RTX 4090, RTX 3090) para aumentar el throughput.
- Cabe en GPU consumer: sí, en tarjetas de 4–8 GB como RTX 3050, RTX 3060, RTX 4060 o superiores; también es viable en CPU para volúmenes moderados, aunque el coste por clip será mayor.
- Opciones de despliegue: el repositorio incluye `inference.py` con PyTorch (`pip install torch dasheng soundfile scipy safetensors`), que descarga los pesos de Dasheng en el primer uso. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp, y en la práctica no aplican al no ser un modelo generativo de texto.
- Latencia y throughput: no disponible; no se publican medidas de latencia por clip ni de clips por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Clases / etiquetas | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `laion/audio-taxonomy-classifier` | ≈0,6 B (encoder congelado) + 6,0 M (cabeza) | 3.718 clases + 11 grupos sobre una taxonomía de 4.416 nodos | 10 s, 16 kHz mono | Apache-2.0 | HuggingFace, con `inference.py` y `taxonomy.yaml` |
| Ontología de AudioSet (referencia) | No aplica (ontología, no modelo) | 632 clases | No aplica | No disponible | Pública como ontología de etiquetas |
| Modelos contraste audio-texto tipo CLAP (usados como etiquetadores en el pipeline) | No disponible | Etiquetas abiertas en lenguaje natural | No disponible | No disponible | Usados internamente en la fase de reetiquetado |
| Qwen2.5-Omni-7B (usado como etiquetador de grupo superior en el pipeline) | 7 B (según el nombre del modelo) | Grupo de primer nivel entre 11 | Audio general | No disponible en la información | Usado internamente en la fase de reetiquetado |

La comparación cuantitativa con alternativas no es posible con la información disponible: no se publican resultados de otros modelos bajo el mismo protocolo de grupos aceptables por clase. La diferencia más objetiva frente a AudioSet es de escala de etiquetas (3.718 clases predichas frente a 632, sobre una taxonomía de 4.416 nodos y profundidad 5).

## Limitaciones y advertencias

- Etiquetas de la fase 1 destiladas de subtítulos mediante un LLM: el propio autor señala que son ruidosas para sonidos no vocales, de ahí la segunda fase de reetiquetado con modelos de audio.
- Las clases finas no son fiables como etiqueta única; la recomendación explícita es usarlas como lista ordenada (top-5) y confiar en la predicción de grupo superior.
- Entrada truncada: solo se procesan los primeros 10 s del clip, con remuestreo a 16 kHz mono; clips más largos pierden información y los eventos que ocurren después del segundo 10 no se detectan.
- Sin salida multi-etiqueta nativa ni marcas temporales: un clip con varios sonidos simultáneos recibe una sola clase y un solo grupo, aunque la evaluación de FSD50K se haga con la unión de etiquetas.
- Sesgos de composición probables: el muestreo de la fase 2 se ponderó hacia ocho grupos y hacia clips de baja confianza, lo que puede desequilibrar la calibración entre categorías.
- Riesgo de confusión en categorías acústicamente próximas (por ejemplo, doméstico frente a efectos de sonido), coherente con la exactitud de 73–78 en ESC-50, FSD50K, VocalSound y UrbanSound8K frente al 99–100 en habla y música.
- Caveat de contaminación en la evaluación: los benchmarks se excluyeron del reetiquetado por dataset de origen, pero VocalSound y TAU Urban Acoustic Scenes 2022 no se filtraron en la fase 1, y no se cribaron las copias de grabaciones de benchmark llegadas por otras fuentes (resubidas).
- Nombres de clase en inglés y dependientes de la taxonomía: la interpretación de las rutas requiere usar `taxonomy.yaml`, y un `/` dentro de un nombre de nodo se escribe como ` - `.
- Licencia: el repositorio se declara Apache-2.0, pero los pesos del encoder base Dasheng se distribuyen por separado; conviene verificar su licencia antes de un despliegue comercial.
- Adopción muy baja en el momento de la ficha: 0 descargas y 1 like, con un repositorio de 0,0 GB; no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/audio-taxonomy-classifier
- Repositorio del encoder Dasheng: https://github.com/XiaoMi/dasheng
- LAION (organización): https://laion.ai/
- LAION en GitHub: https://github.com/LAION-AI
- Modelo relacionado de LAION, `Voice-Taxonomy-57`: https://huggingface.co/laion/Voice-Taxonomy-57
- Repositorio externo de clasificación de audio zero-shot: https://github.com/saadtariq001s/zero-shot-audio-classification
