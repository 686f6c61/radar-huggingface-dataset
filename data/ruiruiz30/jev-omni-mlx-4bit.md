# Ruiruiz30/Jev-Omni-MLX-4bit

## Resumen

Jev-Omni-MLX-4bit es una conversión no oficial del checkpoint multimodal unificado akhilaaa3/Jev-Omni al formato MLX de Apple, publicada por el usuario Ruiruiz30. Su propósito es permitir la inferencia local en hardware Apple Silicon con memoria unificada limitada, en concreto una Mac mini con chip M4 de 10 núcleos de CPU y 16 GB de memoria unificada. El repositorio conserva el checkpoint multimodal unificado original y su cabeza de decisión de 256 vías, y convierte únicamente los pesos del modelo de lenguaje a cuantización afín de 4 bits con tamaño de grupo 64, dejando los pesos de visión en BF16 y la cabeza de decisión en FP32.

El modelo totaliza 11.959.730.224 parámetros y ocupa 6,8 GB en el repositorio. Funciona como clasificador de decisión tipada: recibe una imagen, un estado en texto y una pregunta con opciones, y devuelve probabilidades por candidato más la opción seleccionada, sin generar explicaciones en texto libre. No es un fine-tune nuevo ni una reproducción del sistema propietario de TypeSafe, sino una conversión independiente destinada a la inferencia local en Mac.

La relevancia de esta ficha radica en que documenta el rendimiento medido en un equipo de consumo concreto, con latencias en torno a 963 ms para decisión de texto y 994 ms para decisión de imagen con 20 tokens visuales, y un pico de memoria Metal de aproximadamente 7,0 GB. La licencia Apache-2.0 facilita su evaluación, aunque las condiciones de los componentes heredados (Gemma 4, dataset) siguen siendo las de sus fuentes originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal unificada (tag gemma4_unified); conversion a MLX |
| Parametros totales | 11.959.730.224 (~11,96 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LM: 4-bit afin, group size 64; vision: BF16; cabeza de decision: FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

Se trata de una conversión, no de un entrenamiento desde cero. El autor parte del checkpoint unificado akhilaaa3/Jev-Omni y de su cabeza de decisión entrenada de 256 vías, y aplica cuantización afín de 4 bits con tamaño de grupo 64 exclusivamente a los pesos del modelo de lenguaje. Los pesos de visión se mantienen en BF16 y la cabeza de decisión en FP32. La etiqueta gemma4_unified sugiere una base arquitectónica de la familia Gemma 4, pero la model card no detalla composición del dataset ni número de tokens de entrenamiento.

No se documenta ningún proceso de RLHF o DPO aplicado en esta conversión, ni innovaciones de decodificación especulativa o atención lineal. El único componente técnico reseñable es la ruta de conversión incluida en omni_mlx/convert.py. El autor advierte explícitamente de que se trata de una conversión independiente, que no es una release oficial de TypeSafe Jev y que no pretende reproducir el sistema propietario de esa compañía. El checkpoint original sin cuantizar no se incluye en el repositorio.

## Capacidades

- Decisión multimodal tipada: dada una imagen, un estado textual y una pregunta con opciones, devuelve probabilidades por candidato y la opción seleccionada, sin texto libre explicativo.
- Clasificación de texto con cabeza de decisión de 256 vías.
- Clasificación de imagen (pipeline image-text-to-text) con presupuesto de tokens visuales configurable.
- Modo conversacional según las etiquetas del repositorio.
- Ajuste del número de tokens visuales (por ejemplo, 20 para escenas generales y 70 para detalles pequeños o densos).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: no se declaran modos de pensamiento, audio ni generación de explicaciones.

## Casos de uso

- Toma de decisiones en agentes de videojuego: el modelo recibe el fotograma actual y un estado textual como "un kart se aproxima a un giro a la derecha", y selecciona entre opciones discretas de acción de dirección, útil por su baja latencia de aproximadamente 994 ms con 20 tokens visuales.
- Clasificación visual local en Mac: con 6/6 aciertos en pruebas de círculos y cuadrados rojos, azules y verdes, sirve para tareas de verificación visual sencilla sin salir del equipo, gracias al pico de ~7,0 GB de memoria Metal.
- Enrutado de decisiones en pipelines automatizados: al devolver probabilidades por candidato, puede actuar como clasificador de decisión en un flujo mayor que consuma esas probabilidades, por ejemplo para seleccionar una rama de procesamiento.
- Prototipado de agentes multimodales en Apple Silicon: permite validar lógica de decisión con entradas de imagen y texto en una Mac mini de 16 GB antes de escalar a hardware mayor.
- Evaluación de cuantización e impacto numérico: los casos de validación incluidos (4/4 coincidencias de argmax) permiten estudiar cómo afecta la cuantización 4-bit a la distribución de probabilidad, con una diferencia absoluta máxima de 0,244 en las cuatro pruebas de texto.
- Asistencia a la decisión en entornos con recursos restringidos: para escenarios donde no es viable desplegar el checkpoint BF16 original, esta conversión ofrece operación local con memoria acotada.
- Investigación sobre cabezas de decisión de muchas vías: el componente de 256 vías puede estudiarse como alternativa a la generación autoregresiva en tareas de clasificación estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que JevBench y DecisionBench no se volvieron a ejecutar para esta conversión. Los únicos datos de rendimiento publicados son mediciones locales de latencia y memoria:

| Modo | Mediana | P95 | Pico de memoria Metal |
|---|---:|---:|---:|
| Decisión de texto | ~963 ms | ~998 ms | ~7,0 GB |
| Decisión de imagen, 20 tokens visuales | ~994 ms | ~1.021 ms | ~7,0 GB |

Mediciones realizadas en Mac mini, Apple M4, 10 núcleos de CPU, 16 GB de memoria unificada, macOS 26.5.1, Python 3.13.12, MLX 0.32.2 y MLX-VLM 0.7.1, con una sola petición, tamaño de lote 1 y sin generación de tokens. Se midieron diez peticiones en caliente tras una de calentamiento. Una petición de imagen de 70 tokens ronda los 1,8 segundos en caliente. Las cifras publicadas del Jev-Omni original en H200 no son trasladables a este equipo.

## Requisitos de hardware

- Memoria unificada estimada: aproximadamente 7,0 GB de pico en Metal durante la inferencia, medido en Mac mini M4 de 16 GB.
- GPU recomendadas: específicamente hardware Apple Silicon (la medición oficial usa Apple M4). No se documentan GPU NVIDIA ni AMD para esta conversión MLX.
- Compatibilidad con GPU de consumo: orientado a Apple Silicon; cabe en equipos con 16 GB de memoria unificada según la medición publicada. No se documenta su comportamiento en otras configuraciones.
- Opciones de despliegue: MLX 0.32.2 y MLX-VLM 0.7.1, con el entorno Python 3.13 indicado en requirements.txt. Los scripts incluidos son omni_mlx.classifier y omni_mlx/convert.py.
- Latencia y throughput: mediana de ~963 ms (texto) y ~994 ms (imagen con 20 tokens visuales), P95 de ~998 ms y ~1.021 ms respectivamente, en régimen de una petición y lote 1. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ruiruiz30/Jev-Omni-MLX-4bit | ~11,96 mil millones | no disponible | ~963 ms texto / ~994 ms imagen (M4, 16 GB) | Apache-2.0 | HuggingFace, formato MLX |
| akhilaaa3/Jev-Omni (upstream, sin cuantizar) | mismo checkpoint de origen | no disponible | cifras publicadas en H200, no trasladables a Mac | la del repositorio upstream (no disponible en esta informacion) | HuggingFace |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es una release oficial de TypeSafe Jev y no reproduce el sistema propietario de esa compañía.
- No es un fine-tune nuevo: es una conversión de cuantización del checkpoint akhilaaa3/Jev-Omni.
- La cuantización altera la distribución de probabilidad; el autor advierte de que las probabilidades no están recalibradas y no deben tratarse como confianza calibrada. La diferencia absoluta máxima observada en cuatro casos de texto fue de 0,244.
- JevBench y DecisionBench no se volvieron a ejecutar, por lo que no hay evaluación estandarizada de esta conversión.
- El modelo no genera explicaciones en texto libre; solo devuelve probabilidades por candidato y la opción seleccionada.
- Reducir el número de tokens visuales disminuye la latencia pero puede perder detalles pequeños; el autor recomienda validar con fotogramas propios.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no disponible, aunque la salida está restringida a opciones discretas.
- Limitaciones de contexto e idioma: no disponibles.
- Las condiciones de los componentes heredados (model card upstream, términos de Gemma 4 y derechos del dataset) siguen siendo las autoritativas para sus respectivas partes, por encima de la licencia Apache-2.0 del repositorio.
- El checkpoint original sin cuantizar no se incluye y debe obtenerse del repositorio upstream bajo sus propios términos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ruiruiz30/Jev-Omni-MLX-4bit
- Modelo base: https://huggingface.co/akhilaaa3/Jev-Omni
