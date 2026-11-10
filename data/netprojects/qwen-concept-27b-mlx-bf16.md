# netprojects/Qwen-Concept-27B-MLX-bf16

## Resumen

Qwen Concept 27B es una variante editada de Qwen3.8-27B, un modelo vision-language de la familia Qwen desarrollada por Alibaba Cloud. La modificacion la realiza Concept Country mediante una tecnica de programacion en el espacio de pesos (weight-space programming) que altera nueve proyecciones MLP del modelo para que alcance sus respuestas con menos tokens de razonamiento. El resultado es un modelo que mantiene las capacidades del original pero reduce el "thinking" necesario, lo que se traduce en menor latencia y mayor tasa de finalizacion dentro de limites de tokens.

Esta ficha describe la conversion a MLX en bf16 publicada por NetProjects (Internet Projects Ltd), que preserva todos los pesos originales en bf16, incluida la torre de vision, y permite ejecutar el modelo tanto en texto (mlx-lm) como en texto e imagen (mlx-vlm) sobre Apple Silicon. El repositorio ocupa 54,7 GB y contiene 27.356.728.560 parametros.

La relevancia actual reside en dos factores: por un lado, la reduccion de tokens de razonamiento (31% menos en MATH-500 nivel 5 segun el autor) sin reentrenar el modelo, lo que abarata la inferencia; por otro, la disponibilidad de una build nativa para MLX que facilita el despliegue en equipos Mac con chip Apple Silicon, un nicho habitualmente desatendido por las conversiones mainstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (familia Qwen3.8), con torre de vision; pesos editados en 9 proyecciones MLP down_proj |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta build); existen builds 4-bit, 6-bit y 8-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de la familia Qwen con capacidad vision-language (pipeline image-text-to-text). Sobre ese modelo, Concept Country aplica una edicion en el espacio de pesos: modifica exactamente nueve tensores `mlp.down_proj` correspondientes a las capas 32, 34, ..., 48, con cambios de norma entre el 0,4% y el 0,6%. El resto de los 851 tensores del modelo de lenguaje permanece identico al original, segun la verificacion tensor a tensor incluida en la model card. El objetivo de la edicion es que el modelo llegue a la respuesta con menos pasos de razonamiento intermedio.

La conversion a MLX en bf16 la realiza NetProjects a partir de la revision `4c96373` del repositorio original, preservando todos los pesos en bf16, incluida la torre de vision. No se documentan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO), aunque al tratarse de un derivado de Qwen3.8-27B se heredan las caracteristicas de entrenamiento del original, no detalladas aqui. La innovacion tecnica destacable es precisamente la edicion de pesos, que no requiere reentrenamiento y se aplica de forma selectiva y verificable mediante el fichero `EDIT_SPEC.json` incluido en el repositorio.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" (el autor recomienda temperature 1.0, top-p 0.95, top-k 20 para thinking mode).
- Razonamiento matematico: evaluado en MATH-500 nivel 5 con resultados superiores al modelo base en tasa de finalizacion y precision dentro de un limite de tokens.
- Capacidades de vision: pipeline image-text-to-text, con torre de vision incluida en esta build bf16; el autor verifica que las builds 4/6/8-bit describen correctamente una imagen de prueba en mlx-vlm.
- Reduccion de tokens de razonamiento: entre 27% y 54% menos tokens de thinking segun los benchmarks de Concept Country a Q8, y 31% menos en la prueba del autor a 4-bit.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo thinking y el contexto de razonamiento son compatibles con flujos multi-paso.
- Capacidades multilingues: no disponible (no se listan idiomas soportados).
- Capacidad especial: edicion de pesos que acorta el razonamiento sin reentrenar, verificable tensor a tensor.

## Casos de uso

- Razonamiento matematico en produccion con presupuesto de tokens ajustado: el modelo reduce el numero de tokens de thinking (mediana de 673 frente a 1.477 del base en la prueba del autor), lo que permite fijar limites de generacion mas bajos y obtener respuestas completas en mayor proporcion (83% frente a 58% dentro de un cap de 3.072 tokens).
- Despliegue local en Apple Silicon: al estar en formato MLX y funcionar con mlx-lm y mlx-vlm, se puede ejecutar en un MacBook Pro con chip M-series y memoria unificada suficiente, sin GPU dedicada, usando `mlx_lm.server` o `mlx_vlm.server` con API compatible con OpenAI.
- Analisis de imagenes y descripcion de escenas: la build bf16 incluye la torre de vision, por lo que puede procesar imagenes y texto conjuntamente mediante `mlx_vlm.generate`, util para tareas de captioning o extraccion de informacion visual.
- Prototipado e investigacion de tecnicas de edicion de pesos: el repositorio incluye `EDIT_SPEC.json` y verificacion tensor a tensor, lo que lo convierte en un caso de estudio reproducible para investigadores que quieran validar tecnicas de weight-space programming.
- Servicio de inferencia con API compatible OpenAI en entornos Mac: mediante `mlx_lm.server` se puede exponer el modelo como endpoint local para integrarlo en aplicaciones existentes que ya consumen la API de OpenAI.
- Evaluacion comparativa de cuantizaciones: el autor publica builds 4/6/8-bit con porcentajes de coincidencia de siguiente token frente a bf16 (95,3%, 98,6% y 99,0%), lo que permite elegir el compromiso tamano/calidad adecuado para cada caso (16,1 GB, 22,8 GB y 29,5 GB respectivamente).
- Tareas de razonamiento con limite de latencia: al reducir los tokens de thinking, el tiempo total de ejecucion baja (12 min frente a 19 min en la prueba de 40 problemas a 4-bit), lo que resulta adecuado para pipelines con restricciones de tiempo.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor de la conversion, medidos en un MacBook Pro M5 Max (128 GB) el 10 de noviembre de 2026, con decodificacion greedy y thinking activado, sobre 40 problemas de MATH-500 nivel 5 con cap de 3.072 tokens, ambos modelos a 4-bit:

| Metrica | Qwen3.8-27B 4-bit (base) | Qwen Concept 27B 4-bit |
|---|---|---|
| Tokens de thinking, media | 1.746 | 1.202 (31% menos) |
| Tokens de thinking, mediana | 1.477 | 673 |
| Finaliza el thinking dentro del cap | 58% | 83% |
| Respuesta final correcta | 55% | 73% |
| Tiempo total de la ejecucion | 19 min | 12 min |

En los primeros 16 problemas con cap de 2.048 tokens, la media de tokens de thinking fue: Qwen3.8-27B 4-bit 1.178; Qwen Concept 4-bit 876; 6-bit 801; 8-bit 909. Concept Country reporta entre 27% y 54% menos tokens de thinking en sus propios benchmarks a Q8. La correccion se evalua por coincidencia exacta del resultado en caja; segun el autor, la mayor parte de la diferencia de precision proviene de finalizar dentro del cap con mas frecuencia.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada para esta build bf16: 54,7 GB de pesos, por lo que se necesita un equipo con al menos esa cantidad de memoria disponible; en Apple Silicon se usa memoria unificada.
- Builds alternativas del mismo autor: 4-bit (16,1 GB), 6-bit (22,8 GB, recomendada) y 8-bit (29,5 GB), adecuadas para equipos con menos memoria.
- GPU recomendadas: el autor valida en MacBook Pro M5 Max con 128 GB; no se documentan pruebas en GPU NVIDIA (A100, H100, RTX 4090) porque el formato MLX esta orientado a Apple Silicon.
- Cabe en consumer GPU: no aplica directamente, ya que MLX requiere Apple Silicon; en equipos Mac con memoria unificada suficiente (por ejemplo, 64 GB o mas para la build 6-bit) es viable.
- Opciones de despliegue: mlx-lm (texto), mlx-vlm (texto e imagen), `mlx_lm.server` y `mlx_vlm.server` con API compatible con OpenAI. Probado con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11.
- Latencia y throughput: no se publican cifras de throughput; el autor reporta tiempos totales de ejecucion (19 min frente a 12 min para 40 problemas a 4-bit en M5 Max).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen Concept 27B (esta build, bf16) | 27,36 B | no disponible | Apache-2.0 | MLX safetensors | Edicion de pesos que reduce thinking; incluye vision |
| Qwen3.8-27B (base) | 27 B aprox. | no disponible | Apache-2.0 | safetensors | Modelo original sin edicion; mas tokens de thinking |
| netprojects/Qwen-Concept-27B-MLX-6bit | 27,36 B | no disponible | Apache-2.0 | MLX safetensors | Build cuantizada recomendada por el autor; 22,8 GB; 98,6% misma siguiente token que bf16 |
| mlx-community/Qwen3.8-27B-4bit | 27 B aprox. | no disponible | Apache-2.0 | MLX safetensors | Version 4-bit del base usada como referencia en los benchmarks del autor |

No se dispone de datos de benchmarks estandar para comparar con otros modelos de la misma categoria mas alla de los incluidos en la model card.

## Limitaciones y advertencias

- La edicion de pesos modifica solo nueve tensores; el resto del comportamiento es el del modelo base, por lo que hereda sus sesgos y riesgos de alucinacion, no documentados en la informacion disponible.
- Los benchmarks publicados son limitados: 40 problemas de MATH-500 nivel 5 en una unica maquina (M5 Max) y con un unico evaluador (coincidencia exacta del resultado en caja), sin datos de MMLU, HumanEval, GSM8K ni evaluaciones multilingues.
- No se dispone de informacion sobre idiomas soportados ni sobre rendimiento en castellano.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente utilizable en GPU NVIDIA ni en entornos cloud convencionales sin conversion adicional.
- La build bf16 requiere 54,7 GB de memoria, lo que excluye la mayoria de equipos consumer; para produccion se recomienda la build 6-bit segun el autor.
- Aunque la licencia es Apache-2.0, el aviso NOTICE credita a Concept Country y Alibaba Cloud; el autor declara no estar afiliado a ninguno de los dos.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- No se documentan limites de contexto, por lo que no se puede garantizar el comportamiento en conversaciones muy largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-bf16
- Modelo base: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Paper de weight-space programming: https://concept.country/research/weight-space-programming
- Build 6-bit recomendada: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-4bit
- Modelo de referencia base 4-bit: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Publicador de la conversion: https://netprojects.com
