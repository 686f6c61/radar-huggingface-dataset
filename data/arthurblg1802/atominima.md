# arthurblg1802/AtoMinima

## Resumen

AtoMinima es un modelo de lenguaje de 420 parámetros entrenado desde cero por el usuario arthurblg1802 y publicado en HuggingFace. Se trata de un transformer decoder-only de una sola capa con anchura de 4 dimensiones, tokenizador a nivel de carácter y una ventana de contexto de 256 caracteres. Su interés no reside en sus capacidades lingüísticas, que el propio autor califica de inexistentes, sino en su función como cota inferior experimental: un modelo deliberadamente mínimo que sirve para calibrar qué rendimiento obtiene un sistema con capacidad de aprendizaje prácticamente nula sobre benchmarks estándar.

El modelo se entrenó sobre 370 millones de caracteres extraídos de una porción de 10 millones de caracteres del dataset FineWeb-edu (sample-10BT). Con 420 parámetros entrenables y un checkpoint de 11 KB, AtoMinima ocupa un espacio extremo en el espectro de modelos publicados: es útil como referencia metodológica para investigadores que estudian escalado, dinámica de entrenamiento o métricas de evaluación en el régimen de parámetros ínfimos.

Su relevancia actual es acotada y de naturaleza académica. No es una herramienta de generación de texto ni un modelo de propósito general; es un artefacto de investigación que documenta con transparencia sus resultados en benchmarks, incluidos los casos en que rinde por debajo del azar, como PIQA (49,13 % frente al 50 % de referencia aleatoria).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm, causal |
| Parámetros totales | 420 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 caracteres |
| Tipos de cuantización | No disponible (checkpoint de 11 KB, sin variantes publicadas) |
| Idiomas soportados | Inglés (declarado; sin capacidad lingüística real) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

Detalles adicionales de arquitectura: 1 capa, d_model de 4, 1 cabeza de atención con head_dim de 4, feed-forward 4 → 16 → 4 con activación GELU, LayerNorm, embeddings de entrada y salida atados con 42 identificadores, posiciones sinusoidales fijas, sin dropout. Tokenizador a nivel de carácter con vocabulario `a-z 0-9 space . , ' \n` más token desconocido. Checkpoint de 11 KB.

## Arquitectura y entrenamiento

AtoMinima es un transformer decoder-only convencional con pre-normalización y atención causal, reducido a su expresión mínima: una única capa, anchura de 4 y una sola cabeza de atención. El feed-forward intermedio expande a 16 dimensiones y vuelve a 4 con GELU. Los embeddings de entrada y salida están atados y el vocabulario es de 42 identificadores, correspondientes a un tokenizador a nivel de carácter sobre minúsculas, dígitos, espacio y un conjunto reducido de signos de puntuación. Las posiciones se codifican con sinusoides fijas, no aprendidas, y no se emplea dropout.

El entrenamiento utilizó 370 millones de caracteres de una porción de 10 millones de caracteres del dataset FineWeb-edu (sample-10BT). No se documentan en la información disponible detalles sobre la composición exacta del dataset, la presencia de RLHF, DPO u otras fases de alineamiento, ni innovaciones técnicas como decodificación especulativa o atención lineal. La pérdida de validación sobre 1 millón de caracteres reservados de FineWeb-edu es de 3,8371 bits por byte. El código completo del modelo y del tokenizador cabe en 90 líneas de PyTorch sin dependencias adicionales, según indica el autor.

## Capacidades

- Generación de texto a nivel de carácter: produce secuencias de caracteres, pero el autor advierte explícitamente que el texto generado no es inglés legible.
- No dispone de capacidad de razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe inexistente: el vocabulario se limita a caracteres ASCII en minúscula y el modelo no ha aprendido asociaciones léxicas o sintácticas.
- No dispone de modo de pensamiento (thinking mode), audio ni otras capacidades especiales.
- Su utilidad real es como referencia o cota inferior en experimentos de evaluación y escalado.

## Casos de uso

- Calibración de benchmarks: sirve para establecer el suelo de rendimiento en tareas como HellaSwag, ARC o PIQA, permitiendo comprobar si las puntuaciones de modelos pequeños superan realmente el ruido estadístico.
- Estudio de dinámica de entrenamiento en régimen mínimo: con 420 parámetros y 370 millones de caracteres de entrenamiento, es un caso extremo para analizar curvas de pérdida, sobreajuste y capacidad efectiva.
- Docencia y divulgación: su implementación de 90 líneas en PyTorch puro lo convierte en un ejemplo didáctico de un transformer completo con tokenizador incluido.
- Pruebas de infraestructura de inferencia: al ocupar 11 KB, permite validar pipelines de carga, serialización y generación sin coste de cómputo apreciable.
- Investigación sobre métricas de evaluación: útil para estudiar cómo se comportan métricas de verosimilitud por byte y estrategias de argmax sobre opciones en modelos sin capacidad lingüística.
- Referencia en estudios de escalado: como punto de partida en la curva de parámetros frente a rendimiento, permite contrastar la hipótesis de retornos crecientes con el tamaño.
- Reproducibilidad de experimentos: su huella mínima facilita replicar el entrenamiento completo en hardware muy modesto y verificar resultados.

## Benchmarks y rendimiento

Evaluación zero-shot, puntuada como log-verosimilitud media por byte sobre cada opción de respuesta y argmax de las opciones, sobre las particiones completas.

| Benchmark | AtoMinima | Azar |
|---|---:|---:|
| HellaSwag | 25,53 % | 25,00 % |
| ARC-Easy | 26,98 % | 25,00 % |
| ARC-Challenge | 26,02 % | 25,00 % |
| PIQA | 49,13 % | 50,00 % |
| ArithMark-3.0 | 30,70 % | 25,00 % |
| Open SLM index | +1,62 | 0,00 |

Pérdida de validación sobre datos reservados: 3,8371 bits por byte (1 millón de caracteres de FineWeb-edu excluidos del entrenamiento).

El autor señala que todas las puntuaciones anteriores, salvo ArithMark-3.0, están dentro del ruido respecto a su línea base, y que en ArithMark-3.0 el resultado queda por debajo del 50,80 % alcanzable respondiendo siempre el segundo número más pequeño. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el checkpoint pesa 11 KB y el modelo completo cabe holgadamente en cualquier GPU o incluso en CPU.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema y en cualquier GPU consumer, incluida una GTX 1050 o integradas.
- Cabe en cualquier GPU consumer, así como en dispositivos de borde y entornos sin acelerador.
- Opciones de despliegue: PyTorch nativo mediante el archivo `atominima.py` incluido en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y su arquitectura no estándar (d_model de 4) probablemente requeriría adaptaciones para esos motores.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, la latencia sería despreciable en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. AtoMinima ocupa un régimen de escala (420 parámetros) en el que no existen alternativas publicadas ampliamente conocidas con las que contrastarlo; los modelos más pequeños habitualmente citados (por ejemplo, variantes de menos de 10 millones de parámetros) superan en varios órdenes de magnitud su tamaño. Cualquier comparación cuantitativa requeriría datos que no están disponibles.

## Limitaciones y advertencias

- Ausencia total de capacidad lingüística utilizable: el autor afirma explícitamente que el texto generado no es inglés y que el modelo no sirve como herramienta.
- Rendimiento en benchmarks indistinguible del azar en la mayoría de tareas, y por debajo del azar en PIQA (49,13 % frente a 50 %).
- En ArithMark-3.0 queda por debajo del 50,80 % alcanzable con una heurística trivial, lo que evidencia ausencia de señal aprendida en esa tarea.
- Contexto muy limitado: 256 caracteres, insuficiente para cualquier conversación multi-turno o documento.
- Tokenizador restringido a caracteres ASCII en minúscula, sin cobertura de mayúsculas, acentos ni alfabetos no latinos.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de generar secuencias sin sentido; no debe desplegarse en producción para ninguna tarea de usuario final.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el modelo carece de utilidad práctica para productos.
- Los sesgos del dataset FineWeb-edu no se han evaluado ni documentado; dado que el modelo no aprende asociaciones semánticas, el riesgo de sesgo dañino es bajo pero no analizado.
- No hay información sobre composición del dataset, fases de alineamiento ni evaluación de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arthurblg1802/AtoMinima
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio del código (`atominima.py`): incluido en el propio repositorio de HuggingFace del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
