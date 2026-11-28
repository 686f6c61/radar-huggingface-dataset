# minhack/guitar-chord-v3-distilled

## Resumen

Guitar Chord V3 Distilled es un modelo de reconocimiento automático de acordes de guitarra desarrollado por el usuario minhack y publicado en Hugging Face. Se trata de una red neuronal temporal ligera obtenida mediante destilación de conocimiento a partir de BTC (Bi-Directional Transformer for Chord Recognition, Park et al., ISMIR 2019), un transformer bidireccional de 170 clases de acordes. El modelo estudiante es una GRU bidireccional de 2 capas con 557.642 parámetros, frente a los 3.036.842 del profesor, lo que supone una compresión de 5,45 veces.

El modelo acepta audio de guitarra a 22.050 Hz, lo transforma en un log-CQT de 144 bins y predice una secuencia de acordes con marcas temporales aproximadas. Su relevancia radica en que demuestra que es posible retener cerca del 96,9 % de la precisión de un transformer profesor con una fracción mínima de los parámetros, lo que abre la puerta a despliegues en entornos con recursos limitados dentro del campo de la recuperación de información musical (MIR).

No obstante, se trata de un modelo experimental, entrenado exclusivamente con el dataset GuitarSet v1.1.0 y con un rendimiento muy desigual según el estilo musical. No está pensado para producción y su generalización a guitarras, afinaciones y entornos distintos a los del corpus de entrenamiento no está establecida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GRU bidireccional de 2 capas (estudiante destilado de un transformer BTC) |
| Parámetros totales | 557.642 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 108 frames de entrada |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,0 GB; se infiere PyTorch por la etiqueta `pytorch`, sin confirmar) |

## Arquitectura y entrenamiento

El estudiante es una GRU bidireccional de 2 capas que procesa secuencias de 108 frames de un log-CQT de 144 bins, calculado sobre audio a 22.050 Hz, y produce una distribución sobre 170 clases de acordes. El profesor es BTC, un transformer bidireccional de 3.036.842 parámetros especializado en reconocimiento de acordes musicales. La compresión de parámetros es de 5,45 veces.

El entrenamiento se realizó sobre GuitarSet v1.1.0, con una partición por guitarrista: los guitarristas 00–03 (120 grabaciones) para entrenamiento, el guitarrista 04 (30 grabaciones) para validación y el guitarrista 05 (30 grabaciones) para test. La función de pérdida combina entropía cruzada supervisada sobre las etiquetas de acorde y divergencia KL de peso 0,5 frente a las distribuciones suaves alineadas por frame del profesor BTC. La inferencia utiliza únicamente los pesos del estudiante, junto con la normalización CQT y la configuración guardadas; no requiere los pesos del profesor.

## Capacidades

- Reconocimiento de acordes de guitarra a partir de audio, con salida de secuencia de acordes y marcas temporales aproximadas.
- Predicción sobre 170 clases de acordes, heredadas del espacio de etiquetas del profesor BTC.
- Generación de una progresión de acordes simplificada además de la secuencia con timestamps.
- Procesamiento de audio a 22.050 Hz con extracción de características log-CQT de 144 bins.
- Inferencia autocontenida: no necesita el modelo profesor en tiempo de ejecución.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio.

## Casos de uso

- Análisis de grabaciones de guitarra acústica o eléctrica en estilo rock y singer-songwriter: el modelo alcanza precisiones frame-weighted de 91,16 % y 90,33 % respectivamente en estos estilos, por lo que es adecuado para transcripción aproximada de acordes en este tipo de repertorio.
- Herramientas educativas de práctica musical: la salida de progresión simplificada con timestamps de un segundo permite mostrar al estudiante los acordes que suenan en cada momento de una grabación de referencia.
- Etiquetado asistido de corpus musicales: dado su bajo coste computacional (557.642 parámetros), puede ejecutarse sobre grandes volúmenes de audio para preanotar acordes que luego se revisen manualmente.
- Prototipado de aplicaciones MIR en dispositivos con recursos limitados: el reducido tamaño del estudiante facilita su integración en entornos donde un transformer de 3 millones de parámetros sería excesivo, aunque el autor advierte que la reducción de tamaño no garantiza una aceleración de inferencia.
- Investigación en destilación de conocimiento aplicada a audio: sirve como caso de referencia para estudiar la retención de precisión (96,9 %) al comprimir un transformer musical en una GRU.
- Análisis comparativo de estilos musicales: permite medir el sesgo del modelo por género y documentar su comportamiento diferencial (por ejemplo, la caída drástica en jazz) en estudios de robustez.

## Benchmarks y rendimiento

Evaluación sobre el guitarrista de test (guitarrista 05): 30 grabaciones, 6.275 frames evaluables y 63,77 % de cobertura de etiquetas de referencia.

| Métrica | BTC (profesor) | V3 (estudiante) |
|---|---:|---:|
| Parámetros | 3.036.842 | 557.642 |
| Precisión de acorde completo | 65,71 % | 63,68 % |
| Retención aproximada de precisión | — | 96,9 % |

Precisión frame-weighted por estilo musical (sobre etiquetas de referencia compatibles):

| Estilo | Profesor | Estudiante |
|---|---:|---:|
| Bossa Nova | 25,15 % | 16,36 % |
| Funk | 26,63 % | 27,81 % |
| Jazz | 27,11 % | 3,11 % |
| Rock | 87,81 % | 91,16 % |
| Singer-Songwriter | 90,50 % | 90,33 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 557.642 parámetros, el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU consumer, e incluso es viable en CPU.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU moderna (incluidas RTX 4090, A100 o H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, con total seguridad por el reducido número de parámetros, aunque el autor no publica requisitos formales.
- Opciones de despliegue: el repositorio proporciona `predict.py` con requisitos en `requirements.txt`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Latencia y throughput: no disponibles; el autor advierte explícitamente que la reducción de tamaño no establece una mejora de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Precisión (test) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Guitar Chord V3 Distilled (estudiante) | GRU bidireccional 2 capas | 557.642 | 63,68 % | MIT | Hugging Face (minhack/guitar-chord-v3-distilled) |
| BTC (profesor) | Transformer bidireccional | 3.036.842 | 65,71 % | MIT | Hugging Face (puar-playground/btc-chord) y GitHub (jayg996/BTC-ISMIR19) |

No se dispone de datos de otros modelos comparables de reconocimiento de acordes de guitarra en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor indica que no es un detector de acordes para producción.
- Rendimiento muy débil en jazz (3,11 % en el estudiante frente a 27,11 % del profesor) y bajo en bossa nova (16,36 %).
- La evaluación excluye etiquetas de acorde no soportadas o alteradas, y la cobertura de referencia es del 63,77 %, lo que limita la interpretación de las métricas.
- Las predicciones de "sin acorde" no han sido validadas de forma independiente.
- Los timestamps son resúmenes aproximados de un segundo, no alineaciones precisas.
- No está establecida la generalización a guitarras, afinaciones, micrófonos y entornos arbitrarios; las pruebas cualitativas con micrófono personal no constituyen un benchmark medido.
- La reducción de tamaño no implica necesariamente una mejora de velocidad de inferencia.
- Licencia MIT: permite uso comercial, pero el proyecto no está afiliado ni respaldado por los autores originales de BTC ni de GuitarSet; GuitarSet se distribuye bajo CC BY 4.0, lo que conviene verificar si se redistribuyen datos derivados.
- Riesgo de alucinación de acordes en pasajes ambiguos o estilos poco representados en el corpus de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/minhack/guitar-chord-v3-distilled
- Modelo profesor BTC: https://huggingface.co/puar-playground/btc-chord
- Repositorio original BTC: https://github.com/jayg996/BTC-ISMIR19
- Dataset GuitarSet v1.1.0: https://doi.org/10.5281/zenodo.3371780
