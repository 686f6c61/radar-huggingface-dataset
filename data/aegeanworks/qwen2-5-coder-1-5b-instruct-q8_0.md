# AegeanWorks/qwen2.5-coder-1.5b-instruct-Q8_0

## Resumen

AegeanWorks/qwen2.5-coder-1.5b-instruct-Q8_0 es una cuantización GGUF de 8 bits (formato Q8_0) del modelo Qwen/Qwen2.5-Coder-1.5B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. El repositorio lo publica el usuario AegeanWorks y no introduce ningún ajuste fino: se trata exclusivamente de una conversión de los pesos originales mediante `convert_hf_to_gguf.py --outtype q8_0`, sin fusiones ni cambios en el vocabulario o en la plantilla de chat. El objetivo es ofrecer una versión más ligera y rápida del modelo para inferencia en CPU con llama.cpp.

El modelo base es un transformer decoder-only especializado en código, con 1.543.714.304 parámetros totales y una ventana de contexto entrenada de 32.768 tokens. Esta cuantización reduce el tamaño del fichero un 46,78 % respecto a la referencia F16 (de 3.093.669.120 bytes a 1.646.572.800 bytes) y, según las mediciones del autor, alcanza una velocidad de decodificación 1,85 veces superior en su propio benchmark congelado.

La relevancia de esta publicación es doble: por un lado, permite ejecutar un modelo de código competente en hardware modesto sin GPU; por otro, el autor documenta de forma explícita la metodología de medición, las revisiones del modelo base y las limitaciones de sus propias cifras, algo poco habitual en repositorios de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto entrenado del modelo base); las mediciones se realizaron con 4.096 |
| Tipos de cuantizacion | Q8_0 (8 bits); el repositorio solo incluye este tipo |
| Idiomas soportados | en, code |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `qwen2.5-coder-1.5b-instruct-Q8_0.gguf`, 1.646.572.800 bytes / 1,53 GiB) |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente al modelo base Qwen2.5-Coder-1.5B-Instruct: un transformer decoder-only con atención causal estándar, orientado a generación de texto y código. El repositorio no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo original; esos datos pertenecen a la model card upstream de Qwen y no se reproducen en esta ficha.

La innovación técnica de esta publicación no está en el entrenamiento, sino en la cuantización y su validación. La conversión se realizó con `convert_hf_to_gguf.py --outtype q8_0` sobre la revisión `2e1fd397ee46e1388853d2af2c993145b0f1098a` del modelo base, sin fusing, sin merge de adaptadores y sin modificar la plantilla de chat (2507 caracteres, idéntica byte a byte a la original). El autor verificó que la decodificación greedy es reproducible byte a byte entre procesos, lo que da validez a su afirmación de que los resultados por ítem no cambian entre F16 y Q8_0. Los adaptadores fine-tuned generados durante el mismo trabajo se descartaron y no se publican.

## Capacidades

- Generación de texto y código en inglés, con soporte de conversación multi-turno mediante la plantilla de chat original de Qwen.
- Generación de código en múltiples lenguajes de programación (el benchmark del autor incluye tareas tipo `set-matrix-zeroes` y funciones JavaScript).
- Respuesta a instrucciones en formato instruct (modelo `-Instruct` del upstream).
- Compatibilidad con endpoints y con el ecosistema llama.cpp (`llama-cli`, `llama-cpp-python`).
- Inferencia en CPU sin GPU, gracias al formato GGUF y a la cuantización Q8_0.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking para esta cuantización concreta.

## Casos de uso

- Asistente de código en local sin GPU: el fichero de 1,53 GiB se ejecuta con llama.cpp en CPU con 8 hilos, lo que permite autocompletar y generar funciones en entornos de desarrollo sin acceso a hardware acelerado.
- Integración en editores y plugins offline: al ser un GGUF compatible con `llama-cpp-python`, se puede incrustar en extensiones de IDE que necesiten sugerencias de código sin enviar datos a servicios externos.
- Prototipado rápido de pipelines de generación de código: la velocidad medida de 23,28 tok/s en el benchmark del autor (frente a 12,60 tok/s en F16) reduce el tiempo de iteración en pruebas automatizadas de generación.
- Educación y experimentación: el tamaño reducido y la licencia Apache-2.0 permiten desplegar el modelo en portátiles y entornos docentes para estudiar cuantización e inferencia local.
- Generación de tests y snippets en CI: con contexto de hasta 32.768 tokens, puede procesar fragmentos de código relativamente largos para producir casos de prueba o ejemplos de uso.
- Evaluación comparativa de cuantizaciones: el repositorio documenta una metodología reproducible (greedy, temperature=0, seed=42, 8 hilos, contexto 4096) útil como referencia para medir el impacto de Q8_0 frente a F16 en otras máquinas.
- Servicio ligero de generación de texto en inglés: para tareas de documentación técnica o comentarios de código donde no se requiera un modelo grande.

## Benchmarks y rendimiento

El autor publica mediciones propias sobre un benchmark congelado de 20 ítems de código, no evaluaciones upstream ni de terceros.

| Arm | Items | Checks | tok/s mediana | Tamano |
|---|---|---|---|---|
| F16 | 12/20 | 47/60 | 12,60 | 2,88 GiB |
| Q8_0 (este fichero) | 12/20 | 49/60 | 23,28 | 1,53 GiB |

- 0 de 20 resultados por ítem difieren entre ambos brazos; la diferencia de checks corresponde a una mejora en `set-matrix-zeroes` (0/3 → 2/3), sin regresiones.
- Aceleración de 1,85x en throughput de decodificación y 38 % menos tiempo de pared para los mismos ítems.
- Una ejecución de cribado separada de 18 ítems coincidió: 13/18 en ambos brazos, 74,3 % de checks en ambos, 22,73 frente a 12,50 tok/s.
- El autor advierte de una variabilidad de hasta el 18 % entre ejecuciones en la misma máquina y de que el throughput depende del hardware y de la carga.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; para carga en GPU, el fichero de 1,53 GiB más overhead de contexto requiere aproximadamente 2-3 GB de memoria, aunque el autor no documenta cifras de VRAM.
- GPU recomendadas: no disponibles en la información proporcionada; el repositorio está orientado explícitamente a `cpu-inference`.
- Cabe en GPU de consumo: sí, por tamaño (1,53 GiB), aunque no se documentan pruebas en GPU concretas.
- Opciones de despliegue: llama.cpp (`llama-cli`) y llama-cpp-python; el autor no menciona vLLM, Ollama ni TGI.
- Latencia y throughput: 23,28 tok/s de mediana en decodificación con 8 hilos, greedy, temperature=0, seed=42 y contexto 4096, medido en el hardware del autor (no especificado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AegeanWorks/qwen2.5-coder-1.5b-instruct-Q8_0 | 1.543.714.304 | 32.768 | GGUF Q8_0 | Apache-2.0 | Cuantización verificada, 1,85x más rápida que F16 en benchmark propio |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (F16) | 1.543.714.304 | 32.768 | safetensors | Apache-2.0 | Referencia de la cuantización; 3.093.669.120 bytes, 12,60 tok/s en el mismo benchmark |
| Otras cuantizaciones GGUF del mismo base | 1.543.714.304 | 32.768 | GGUF (Q4, Q5, etc.) | Apache-2.0 | No disponibles en la información proporcionada |

No se dispone de datos de benchmarks estándar para comparar el rendimiento en tareas como HumanEval o MMLU con alternativas de la misma categoría.

## Limitaciones y advertencias

- Hereda todas las limitaciones y sesgos del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Q8_0 es de 8 bits: pueden aparecer pequeñas diferencias numéricas respecto a F16 que no alteraron ningún resultado medido en el benchmark del autor, pero no se garantiza su ausencia en otras entradas.
- El contexto entrenado es de 32.768 tokens, pero las mediciones se hicieron con 4.096; no se documenta el comportamiento con contextos largos.
- No evaluado para seguridad ni destinado a usos de alto riesgo.
- Las cifras de rendimiento provienen de un benchmark propio pequeño (20 ítems), no de evaluaciones de terceros, y presentan hasta un 18 % de variabilidad entre ejecuciones.
- Idiomas soportados limitados a inglés y código; no se documenta soporte multilingüe en esta publicación.
- El repositorio no está afiliado ni respaldado por el equipo Qwen; el texto de la licencia Apache-2.0 se incluye en `LICENSE`.
- Uso comercial permitido por la licencia Apache-2.0, sujeta a los términos de dicha licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AegeanWorks/qwen2.5-coder-1.5b-instruct-Q8_0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- llama.cpp: no disponible en la información proporcionada
- llama-cpp-python: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
