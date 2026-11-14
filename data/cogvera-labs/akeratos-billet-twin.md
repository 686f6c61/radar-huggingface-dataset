# Cogvera-Labs/Akeratos-Billet-Twin

## Resumen

Akeratos Billet-Twin es un modelo de lenguaje de tipo transformer decoder-only de 162M parámetros en su núcleo, desarrollado por Cogvera-Labs como parte del proyecto Akeratos, un laboratorio abierto centrado en el entrenamiento de modelos de lenguaje sobre Apple Silicon con MLX. El modelo es el gemelo de control de Akeratos Billet: se entrenó desde cero con exactamente los mismos tokens, hiperparámetros, semilla y hardware, pero con la tabla de n-gramas de Billet desactivada. Su propósito es servir como comparador de investigación para medir empíricamente qué aporta la tabla de 6.000 millones de parámetros que incorpora el modelo original.

Se trata de un modelo base (no instruido, sin entrenamiento de seguridad ni alineamiento) entrenado sobre aproximadamente 3.200 millones de tokens de texto web en inglés procedente de FineWeb-Edu. Su contexto es de 2.048 tokens y su vocabulario es el de SmolLM2, con 49.152 entradas. La relevancia actual del modelo es metodológica: ofrece a la comunidad un punto de referencia reproducible, con logs de entrenamiento, hashes de verificación y código congelado, para aislar el efecto de una innovación arquitectónica concreta frente a un control idéntico en todo lo demás.

El modelo solo puede ejecutarse con el código propio de Akeratos, ya que sus pesos están en un formato propietario (`metalforge.export/v1`) que no cargan transformers, mlx-lm ni las herramientas GGUF. No existe versión cuantizada y está pensado para Macs con Apple Silicon y macOS 14 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención por capas de ventana deslizante y embeddings de valor en capas impares; sin tabla de n-gramas |
| Parametros totales | 274.918.890 densos (161.611.776 en el núcleo reportado como 162M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (no se publica versión cuantizada) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en float32 (`dense.safetensors` y `ema.safetensors`), con config en esquema propio `metalforge.export/v1` |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de Billet con la tabla desactivada: 18 capas de anchura 768, atención con 6 cabezas de consulta y 2 cabezas clave-valor de dimensión 128, y un bloque feed-forward de 3.456 unidades con activación ReLU al cuadrado. Los embeddings de entrada y salida están atados, y las capas impares incorporan embeddings de valor adicionales. La atención es mayoritariamente local: la mayoría de capas atienden solo a los últimos 512 tokens, mientras que las capas 4, 9, 14 y 17 (indexadas desde 0) atienden al contexto completo de 2.048 tokens. El vocabulario es el tokenizador de SmolLM2 con 49.152 tokens; el id 0 separa documentos y los ids 1-16 están reservados y nunca se predicen.

El entrenamiento consistió en 24.415 pasos con un tamaño de lote de 131.072 tokens (2 filas de 2.048 tokens por 32 micro-lotes), totalizando aproximadamente 3.200 millones de tokens de FineWeb-Edu. Se usó tasa de aprendizaje máxima de 1e-2 con decaimiento en el último 20% de los pasos (a partir del paso 19.532), cómputo en bfloat16 con pesos maestros en float32, y semilla maestra 0. Todo el entrenamiento se ejecutó en un MacBook Pro con M4 Max (40 núcleos GPU, 48 GB de memoria unificada), con un pico de memoria de 12,4 GiB y un tiempo total de 111,1 horas. El paquete de código congelado y los logs permiten reproducir los primeros 20 pasos con coincidencia exacta de hashes de lote.

## Capacidades

- Generación de texto por continuación: el modelo es un modelo base que continúa un prompt; decodifica de forma voraz con `bake generate`.
- Razonamiento y conocimiento factual limitados al dominio del texto web educativo en inglés con el que fue entrenado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe inexistente más allá del inglés.
- No dispone de modo de pensamiento (thinking mode), visión ni audio.
- No sigue instrucciones ni ha recibido entrenamiento de seguridad o alineamiento.
- Ofrece dos conjuntos de pesos: los crudos (`dense`) y su media móvil exponencial (`ema`), seleccionables en la inferencia.

## Casos de uso

- Comparación científica de arquitecturas: sirve como control exacto para medir el efecto de la tabla de n-gramas de Billet entrenando y evaluando ambos modelos con los mismos tokens y configuración; es su propósito principal y el único para el que fue diseñado.
- Reproducción de experimentos en Apple Silicon: investigadores que trabajan con MLX pueden clonar el repositorio, verificar los hashes SHA-256 y reejecutar los primeros pasos del entrenamiento para validar su propio entorno, ya que el log y el código congelado permiten comprobar la coincidencia de hashes de lote.
- Estudio de atención híbrida local/global: las capas con ventana de 512 tokens frente a las cuatro capas de contexto completo permiten analizar el impacto de patrones de atención dispersa en modelos pequeños.
- Docencia y formación en entrenamiento de LLM: el tamaño reducido (162M en el núcleo) y el requisito de hardware (un solo MacBook Pro) lo hacen adecuado para cursos prácticos sobre preentrenamiento desde cero.
- Evaluación de estrategias de decodificación: la posibilidad de alternar entre pesos crudos y EMA y de obtener ids de token en JSON facilita experimentos controlados sobre el efecto de la media móvil en la calidad de la generación.
- Análisis de eficiencia en memoria unificada: con un pico de 1,8 GiB en generación, sirve para caracterizar el rendimiento de inferencia en chips de la familia M frente a alternativas en CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia: aproximadamente 1,8 GiB de memoria unificada en el pico medido con `bake generate` en un M4 Max.
- Almacenamiento: unos 2,2 GB libres para la descarga del repositorio (4,4 GB de tamaño total del repo).
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes) con macOS 14 o posterior; el entrenamiento de referencia usó un M4 Max de 40 núcleos GPU y 48 GB.
- No es compatible con GPU NVIDIA ni con herramientas CUDA.
- Opciones de despliegue: únicamente el CLI `bake` del proyecto Akeratos (versión v0.1.0 del repositorio), con `uv` 0.13.6 o superior; no funciona con vLLM, llama.cpp, Ollama, TGI ni mlx-lm.
- No hay datos publicados de latencia ni throughput más allá del tiempo de entrenamiento (111,1 horas para 3.200 millones de tokens en un M4 Max).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Akeratos Billet-Twin | 162M nucleo (274,9M densos) | 2.048 | Apache-2.0 | safetensors en formato propio, solo CLI `bake` | Control sin tabla de n-gramas |
| Akeratos Billet | 162M nucleo mas tabla de 6.000M | 2.048 | Apache-2.0 | formato propio, solo CLI `bake` | Modelo original con tabla de n-gramas activa |
| SmolLM2 (familia) | 135M-1.7B | hasta 8.192 en variantes mayores | Apache-2.0 | safetensors, transformers, GGUF | Tokenizador compartido; ecosistema estándar |
| Modelos base de 100-200M (p. ej. GPT-2 small) | 124M | 1.024 | MIT / permisiva | safetensors, GGUF, amplio soporte | Referencia clásica de modelos pequeños |

La comparación con SmolLM2 y GPT-2 small se ofrece como referencia de categoría por tamaño; no se dispone de datos de rendimiento comparativo publicados para Billet-Twin.

## Limitaciones y advertencias

- Es un modelo base sin instrucciones: no debe usarse como asistente conversacional ni en productos finales.
- No ha recibido entrenamiento de seguridad, por lo que puede generar contenido sesgado, ofensivo o inapropiado.
- Riesgo elevado de alucinación y de afirmaciones factualmente incorrectas, propio de un modelo de 162M entrenado con 3.200 millones de tokens.
- Solo entiende y genera inglés; no hay soporte multilingüe.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Los pesos están en un formato propietario (`metalforge.export/v1`) que no cargan transformers, mlx-lm ni herramientas GGUF; no existe versión cuantizada ni conversión oficial.
- Requiere hardware Apple Silicon y el CLI `bake` del proyecto; no es desplegable en infraestructura NVIDIA ni en servicios en la nube estándar.
- La licencia Apache-2.0 permite uso comercial, pero las limitaciones técnicas y de calidad hacen inviable su uso en producción.
- El modelo se entrenó con una tasa de aprendizaje (1e-2) elegida mediante un barrido sobre el modelo con tabla activa, lo que puede no ser óptimo para esta variante sin tabla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cogvera-Labs/Akeratos-Billet-Twin
- Modelo original Billet: https://huggingface.co/Cogvera-Labs/Akeratos-Billet
- Repositorio del proyecto Akeratos: https://github.com/cogvera-labs/akeratos
- Documentación de reproducción: https://github.com/cogvera-labs/akeratos/blob/main/docs/reproduce.md
- Documentación comparativa Billet y su gemelo: https://github.com/cogvera-labs/akeratos/blob/main/docs/billet.md
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
