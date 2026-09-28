# flymy-ai/decision-4b-v1.3

## Resumen

Decision 4B v1.3 (FlyMyJev-4B, preview) es un adaptador LoRA publicado por flymy-ai sobre el modelo base Qwen/Qwen3.5-4B, orientado a lo que el autor denomina decisiones tipadas (typed decisions). Se le entrega un estado (un ticket, una política junto con un caso, un log, una respuesta que hay que juzgar) y una pregunta con un conjunto cerrado de respuestas —sí/no, elección entre opciones identificadas por letra, o puntuación— y devuelve una distribución de probabilidad sobre cada opción declarada en un único forward pass. No genera texto: la salida es directamente una probabilidad por opción, de modo que una etiqueta fuera del conjunto declarado no puede aparecer.

La revisión v1.3 reutiliza exactamente los mismos pesos que v1.2 (run identificado como qwen35_4b_letter_h10_v64b) y solo modifica la lectura de las respuestas sí/no: aplica una temperatura más baja (0,50) a las peticiones de tipo noul para que la respuesta se comprometa cuando el modelo se inclina hacia un lado. Las salidas de elección y de puntuación no cambian respecto a v1.2. Es un proyecto independiente: no es un lanzamiento de TypeSafe, no está afiliado a esa entidad y no reconstruye la implementación cerrada de Jev.

El adaptador añade 14,4 millones de parámetros entrenables sobre una base de 4B y admite entradas de hasta 16.384 tokens. Se sirve plegando el LoRA sobre el modelo base en el momento de la carga, con una CUDA graph por cada longitud de entrada y una latencia medida de 19,3 ms de mediana y 22,7 ms en el percentil 95 por decisión corta en una RTX 4090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-4B; el LoRA se aplica a las proyecciones de atención de ambos tipos de capa del base (q_proj, k_proj, v_proj, o_proj, in_proj_qkv, in_proj_z, in_proj_a, in_proj_b, out_proj) |
| Parametros totales | ~4B en el modelo base (Qwen3.5-4B) más 14,4M de parámetros entrenables del adaptador LoRA |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 16.384 tokens de entrada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); tamaño del repositorio 0,1 GB |
| Modelo base | Qwen/Qwen3.5-4B, revisión 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a |
| Temperatura de lectura | choice y score 1,45; yes/no 0,50 |
| Tipo de salida | distribución de probabilidad sobre las opciones declaradas, sin generación de texto |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 aplicado sobre las proyecciones de atención de los dos tipos de capa del base (q_proj, k_proj, v_proj, o_proj, in_proj_qkv, in_proj_z, in_proj_a, in_proj_b y out_proj). Las proyecciones in_proj_qkv, in_proj_z, in_proj_a y in_proj_b, junto con los kernels Triton de flash-linear-attention que el autor indica como dependencia en tiempo de ejecución, apuntan a capas de atención lineal combinadas con atención estándar, aunque la model card no detalla la arquitectura interna del base. La lectura de la decisión se realiza sobre los logits de las letras de cada opción en el último token del prompt (proyección en fp32 del estado oculto de ese token), seguida de un softmax a la temperatura configurada en model.json según el tipo de petición. El prompt emplea la plantilla de chat con el modo thinking deshabilitado y un único mensaje de usuario en JSON con la estructura {evidence, criterion, options[{letter, description}]}, con descripciones en el formato "<key>: <text>" y las opciones sí/no en el orden true y después false (formato de SemIf, MIT).

El entrenamiento consistió en una sola ejecución desde el base, sin fusionar runs ni usar ensembles: 2 épocas, 862 pasos con un máximo de 12.288 tokens con padding (9,5M tokens), tasa de aprendizaje 3e-05 con warm-up y decaimiento coseno, entropía cruzada sobre los logits de las letras de las opciones (la distribución exacta cuando un ítem declara una), opciones de elección mezcladas en cada pasada y semilla 99. La forma de la receta sigue a JevK5 v0.2 (allebee/jevk5, Apache-2.0). Los datos proceden de conjuntos propios de decisiones y de datasets públicos con licencia revisada; no se usó ningún ítem de JevBench ni ninguna salida de Jev para entrenamiento, ajuste o selección del modelo. La temperatura se ajustó sobre un split de calibración propio y sobre el conjunto dev hard, nunca sobre ítems de benchmark.

## Capacidades

- Decisiones de conjunto cerrado en tres formatos: sí/no (noul), elección entre opciones con letra (choice) y puntuación (score).
- Salida probabilística por opción en un único forward pass, sin generación de texto y sin posibilidad de emitir etiquetas fuera del conjunto declarado.
- Calibración medida: ECE de 0,070 y fidelidad a las distribuciones gold exactas de 87,3 (1 menos la distancia de variación total media) en el tier hard público, a la temperatura servida.
- Entradas de hasta 16.384 tokens, lo que permite procesar políticas extensas, expedientes o logs largos en una sola pasada.
- Respuestas sí/no decisivas: temperatura específica de 0,50 para peticiones noul, elegida sobre ítems sí/no propios reservados.
- Capacidad de abstención, con un rendimiento medido de 90 sobre 100 en la familia de abstención del conjunto dev hard propio.
- Multilingüe: únicamente inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo no genera pasos intermedios.
- Modo thinking: el prompt se construye con la plantilla de chat y el thinking deshabilitado.

## Casos de uso

- Verificación de cumplimiento de políticas: se le pasa la política y el caso concreto y devuelve la probabilidad de que la acción esté permitida o no, en formato sí/no. Es adecuado porque no genera texto y la respuesta queda restringida al conjunto declarado, lo que evita salidas ambiguas en un pipeline automatizado.
- Triaje de tickets: con el contenido del ticket como evidencia y las categorías como opciones con letra, devuelve una distribución sobre las categorías en una sola pasada, útil para enrutado automático con umbral de confianza.
- Moderación de contenido: definiendo criterios y opciones binarias, el modelo produce una probabilidad calibrada que puede usarse con un umbral para decidir cuándo escalar a revisión humana.
- Evaluación automática de respuestas: dado un enunciado, una respuesta candidata y una rúbrica, el modelo puntúa o juzga la respuesta. Conviene revisar esta familia, ya que su rendimiento bajó de 55 a 45 en el conjunto dev hard propio.
- Clasificación de anomalías en logs: con un fragmento de log como evidencia y un conjunto cerrado de diagnósticos, el modelo asigna probabilidades por diagnóstico, aprovechando la ventana de 16.384 tokens para incluir contexto amplio.
- Enrutado de decisiones con abstención: en flujos donde una decisión errónea es costosa, la probabilidad de la opción declarada permite derivar a un humano cuando la confianza es baja; la familia de abstención parte de un 90 sobre 100 en la medición propia.
- Sistemas de decisión que deben ser auditables: al devolver una distribución sobre opciones explícitas y no texto libre, la salida es directamente registrable y comparable entre ejecuciones.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con el base congelado y el adaptador en la misma GPU, en la misma sesión y con el mismo prompt. Los cambios son emparejados (ítems corregidos / ítems rotos).

| Conjunto | Qwen3.5-4B congelado | Este modelo | Corregidos / rotos | Referencia |
|---|---:|---:|---:|---|
| JevBench público, hard (111) | 61,3 | 78,4 | 24 / 5 | Jev 1.13: 74,1 en el tier hard completo (220 ítems, 109 reservados) |
| JevBench público, standard (72) | 97,2 | 95,8 | 2 / 3 | no disponible |
| JevBench público, easy (48) | 97,9 | 100,0 | 1 / 0 | no disponible |
| JevBench público, total 231 | 80,1 | 88,3 | 27 / 8 | Jev 1.13: 86,6 |
| Conjunto dev hard propio (160, 8 familias) | 42,5 | 66,9 | 51 / 12 | Jev 1.13: 57,5 |
| Conjuntos de casos reales v1-v3 (407) | 88,9 | 90,9 | 24 / 16 | Jev 1.13: 94,6 / 97,8 / 98,9 en v1 / v2 / v3 |

Desglose del conjunto dev hard propio por familia (20 ítems por familia):

| Familia | Qwen3.5-4B congelado | Este modelo |
|---|---:|---:|
| Búsquedas multi-salto | 30 | 70 |
| Decisiones de fecha y número | 10 | 45 |
| Compromisos (trade-offs) | 25 | 60 |
| Trampas adversariales | 50 | 85 |
| Abstención | 60 | 90 |
| Robustez ante paráfrasis | 55 | 85 |
| Políticas largas | 55 | 55 |
| Evaluación de respuestas | 55 | 45 |

Calibración en el tier hard público a la temperatura servida: ECE 0,070 y fidelidad a las distribuciones gold exactas de 87,3. El autor advierte que el conjunto de casos reales v3 coloca la respuesta gold en la opción A en el 46 % de sus ítems de elección, que el base congelado acierta por hábito de primera opción y que el entrenamiento elimina ese sesgo, por lo que ese conjunto debe leerse con cautela. El tier de jueces de JevBench y el conjunto sellado no son públicos y no se incluyen.

## Requisitos de hardware

- Pesos del modelo base en fp16 o bf16: en torno a 8 GB solo para los pesos, estimación derivada de los 4B parámetros del base y no confirmada en la información disponible.
- Con la ventana completa de 16.384 tokens y la caché KV correspondiente, la estimación sube aproximadamente a 10-12 GB en fp16 o bf16; no hay cifras oficiales publicadas.
- GPU medida por el autor: una RTX 4090, con p50 de 19,3 ms y p95 de 22,7 ms por decisión corta. En modo eager la misma decisión tarda 59 ms. La ruta con CUDA graph devuelve la misma respuesta que la ruta eager en 120 de 120 ítems comprobados.
- Cabe en GPU de consumo: sí, se ha medido en una RTX 4090.
- Ejecución en CPU: disponible definiendo FLYMYJEV_DEVICE=cpu, con la advertencia del autor de que es lenta y no usa CUDA graphs.
- Opciones de despliegue documentadas: el propio repositorio, con model.py para carga y uso directo, server.py para servir el formato de cable /v1/systemone de TypeSafe orientado al adaptador typesafe, jevbench_adapter.py como adaptador en proceso y run_jevbench.py para ejecutar el runner oficial sin modificar su registro.
- vLLM, llama.cpp, Ollama, TGI y otros servidores estándar: no documentados en la información disponible.
- Requisitos de entorno: hace falta un compilador de C en tiempo de ejecución (por ejemplo build-essential), porque los kernels Triton de flash-linear-attention se compilan en la primera petición y la captura de CUDA graphs en la carga también los necesita.
- model.load() verifica cada archivo contra manifest.json y rechaza enlaces simbólicos, por lo que una instantánea de caché de Hugging Face (cuyos archivos son enlaces a blobs/) debe copiarse antes a un directorio real, por ejemplo con huggingface-cli download --local-dir.
- Latencia y throughput: el autor solo publica latencias por decisión corta; no se indica throughput agregado ni cifras para entradas cercanas a la ventana máxima.

## Comparativa con modelos similares

| Modelo | Base y tamaño | Contexto | Licencia | JevBench público (231) | Notas |
|---|---|---|---|---|---|
| Decision 4B v1.3 | Qwen3.5-4B más LoRA de 14,4M | 16.384 tokens | Apache-2.0 | 88,3 | Este modelo; medición del propio autor |
| Qwen3.5-4B congelado | Qwen3.5-4B | no disponible | Apache-2.0 | 80,1 | Base sin adaptador, medido en la misma sesión y con el mismo prompt |
| Jev 1.13 | no disponible (implementación cerrada) | no disponible | cerrada | 86,6 | Referencia citada por el autor; 74,1 en el tier hard completo |
| Decision 2B (FlyMy.AI) | MiniCPM5-2B | no disponible | Apache-2.0 | no disponible | Según ModelSystem.One, tercero en la clasificación general de JevBench v1.4.2 y con latencia declarada de 9 ms (dato truncado en la búsqueda) |
| Decision Fast (FlyMy.AI, v53a) | no disponible | no disponible | no disponible | no disponible | Aparece en Benchmark Heaven con el agregado público v1.4.1; sin datos de rendimiento en la información disponible |

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte declarado para otros idiomas.
- No genera texto: no sirve para tareas de generación, resumen ni diálogo libre. Su única salida es una distribución sobre opciones declaradas.
- Riesgo de asignar alta probabilidad a una opción incorrecta: la calibración medida es ECE 0,070, no perfecta. En decisiones automatizadas conviene fijar umbrales o derivar a revisión humana.
- Degradación en la familia de evaluación de respuestas: baja de 55 a 45 en el conjunto dev hard propio respecto al base congelado.
- La familia de políticas largas no mejora con el entrenamiento (55 frente a 55); la ventana de 16.384 tokens no garantiza buen rendimiento en documentos que la aproximan.
- Sesgo de primera opción: el autor señala que el base congelado tiende a elegir la opción A y que el entrenamiento elimina ese hábito, pero advierte que el conjunto v3 (46 % de ítems con el gold en A) debe leerse con cautela.
- Dependencia fuerte del formato de prompt: la plantilla de chat, la estructura JSON y el orden de las opciones sí/no (true antes que false) forman parte del contrato; desviarse de ese formato puede degradar o invalidar la lectura.
- Requisitos de despliegue poco convencionales: compilador de C en tiempo de ejecución, compilación de kernels Triton y rechazo de enlaces simbólicos en model.load(), lo que complica despliegues en cachés convencionales de Hugging Face y en entornos sin toolchain de compilación.
- Los resultados publicados son mediciones del propio autor, con el tier de jueces y el conjunto sellado de JevBench no públicos; no hay verificación independiente en la información disponible.
- Proyecto independiente: no está afiliado a TypeSafe y no reproduce la implementación cerrada de Jev. Las comparaciones con Jev 1.13 son referencias citadas, no comparaciones controladas.
- Licencia Apache-2.0 tanto en el adaptador como, según la model card, en el base, por lo que el uso comercial está permitido; aun así, deben revisarse las licencias de los datasets públicos empleados en el entrenamiento, extremo que la model card no detalla.
- Modelo en estado de preview: la propia ficha lo etiqueta como tal, con 0 descargas y 0 likes en el momento del análisis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flymy-ai/decision-4b-v1.3
- Perfil del autor en Hugging Face: https://huggingface.co/flymy-ai
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Receta de referencia JevK5 v0.2: https://huggingface.co/allebee/jevk5
- Catálogo de modelos de decisión (ModelSystem.One): https://modelsystem.one/models/
- Ficha de Decision Fast en Benchmark Heaven: https://benchmarkheaven.com/jev-models/decision-fast
- Listado de modelos en Jev Router: https://jev-router.com/models-page
- Artículo de FlyMy.AI sobre kernels con el compilador Triton de OpenAI: https://medium.com/flymy-ai/how-to-outperform-pytorch-kernels-with-openais-triton-compiler-ba2babce8cc5
