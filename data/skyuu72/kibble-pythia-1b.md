# skyuu72/kibble-pythia-1b

## Resumen

Kibble es una técnica de edición de conocimiento (knowledge editing) que permite insertar hechos nuevos en un modelo de lenguaje pequeño sin reentrenarlo ni modificar sus pesos preentrenados. El autor, skyuu72, la publica como un paquete de 1000 hechos inventados (personas, empresas, pueblos, minerales y pastillas ficticias) escritos sobre EleutherAI/pythia-1b, un transformer de 1.000 millones de parámetros. Cada hecho se materializa como una neurona con compuerta ubicada junto a la capa 6 del modelo base, de modo que al retirar el paquete se recupera el pythia original bit a bit.

El interés técnico reside en el método: la dirección de valor se obtiene con pases hacia delante y diferencias finitas sobre 40 direcciones de lectura en forma cerrada (una por cabeza de atención de las capas 9-13), la dirección de direccionamiento se resuelve con una única ecuación lineal conjunta y la compuerta se implementa como una función de dos ReLU. No hay backpropagation ni ajuste fino de los pesos del modelo base. El paquete ocupa 39 MB (una dirección de 8192 dimensiones y un valor de 2048 por hecho) y el repositorio incluye el cargador, las figuras, el cuaderno de laboratorio y el código para reproducir los resultados en una GPU de 8 GB.

La relevancia actual es doble: por un lado ofrece una alternativa ligera y reversible a MEMIT, AlphaEdit y LoRA para inyectar conocimiento factual, con menor deriva sobre el resto del modelo; por otro, sirve como banco de pruebas de interpretabilidad sobre pythia, un modelo cuyo entrenamiento y checkpoints son públicos. El autor advierte que la comparativa se hizo con reimplementaciones propias de los métodos citados, no con el código original de sus autores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (EleutherAI/pythia-1b) con módulo externo de neuronas con compuerta junto a la capa 6 |
| Parámetros totales | 1.000 millones (modelo base, no modificado); el paquete añade 1000 direcciones de 8192 d y 1000 valores de 2048 d |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de pythia-1b; el autor no la especifica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | wtfpup-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (paquete de 39 MB) más código Python (`kibble.py`) y JSON de hechos (`kibble_facts.json`) |

## Arquitectura y entrenamiento

El modelo base es pythia-1b, un transformer decoder-only de EleutherAI entrenado sobre el corpus Pile. Kibble no altera ninguno de sus pesos: añade un módulo externo que actúa sobre las activaciones de la capa 6. Cada hecho se representa mediante un par dirección-valor: la dirección de valor parte del vector propio del modelo en la capa 6 para el token de respuesta y se optimiza maximizando `log p(answer)` a lo largo de 40 direcciones de lectura en forma cerrada, una por cabeza de atención de las capas 9-13, usando diferencias hacia delante (sin retropropagación). La dirección de direccionamiento se obtiene con una resolución lineal conjunta que exige que cada ranura responda 1 ante su propio nombre, 0 ante los demás nombres almacenados y ante 8 nombres casi coincidentes generados artificialmente, y que permanezca lo más silenciosa posible ante texto ordinario.

La compuerta se define como `out += clamp((W k - 0.35) / 0.2, 0, 1) @ V`, es decir, dos ReLU por hecho. La elección de la capa 6 se justifica con trazado causal: el hecho se localiza en el último token del nombre hasta aproximadamente la capa 10 y la atención de las capas 10-12 lo traslada al final del prompt; la capa 6 cae dentro de esa ventana y sus estadísticas de clave están bien condicionadas (las capas 1-3 son casi singulares). No hay entrenamiento supervisado, RLHF ni DPO: el procedimiento completo se ejecuta con pases hacia delante y una única resolución lineal.

## Capacidades

- Inserción de hechos factuales en el modelo sin entrenamiento ni modificación de pesos preentrenados.
- Almacenamiento de 1000 hechos simultáneos sobre siete relaciones con plantilla (lugar de nacimiento, mineral compuesto por un elemento, idioma nativo, etc.).
- Recuperación por dirección de nombre: el hecho se activa cuando aparece el nombre almacenado en el prompt.
- Generalización a paráfrasis de la pregunta (0,808 de acierto exacto medio).
- Razonamiento multi-hop sobre los hechos insertados (0,522 de acierto exacto medio), superior a MEMIT y AlphaEdit en la comparativa del autor.
- Reversibilidad total: `handle.remove()` restaura el pythia original bit a bit.
- Carga y uso desde Python mediante `kibble.load()`, `kibble.attach()` y `kibble.say()`.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido; es un mecanismo de memoria factual, no un modelo de propósito general.

## Casos de uso

- Investigación en interpretabilidad: permite estudiar dónde y cómo se almacena un hecho en un transformer pequeño, con trazado causal reproducible sobre pythia y un cuaderno de laboratorio completo.
- Evaluación comparativa de métodos de edición de conocimiento: sirve como referencia reproducible para contrastar MEMIT, AlphaEdit y LoRA con las mismas 1000 tuplas y el mismo protocolo de puntuación.
- Prototipado de memorias factuales externas: útil para experimentar con memorias direccionables por clave en asistentes de dominio cerrado, sin reentrenar el modelo subyacente.
- Docencia y divulgación: el paquete de 39 MB y el script `kibble.py` permiten demostrar en una GPU de 8 GB cómo se inyecta y se retira conocimiento de un LLM.
- Pruebas de robustez frente a errores tipográficos: el propio autor documenta que la exactitud cae a 0,51 al introducir erratas en el nombre, lo que convierte al paquete en un banco de pruebas para sistemas de direccionamiento tolerante a fallos.
- Experimentos de olvido selectivo: la reversibilidad bit a bit permite medir el efecto de retirar hechos concretos sin reentrenar, útil en estudios de derecho al olvido en modelos pequeños.
- Investigación sobre colisiones de clave: el 71 % de activación ante nombres ajenos que comparten el último token permite estudiar los límites de las memorias direccionadas por el último token del nombre.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 1000 hechos (800 de evaluación y 200 reservados). La puntuación es la media de eficacia, paráfrasis y multi-hop por coincidencia exacta; no se evalúa leyendo generaciones.

| Modelo | Eficacia | Paráfrasis | Multi-hop | Puntuación | Deriva KL en otro texto | Hechos reales conservados | Perplejidad |
|---|---|---|---|---|---|---|---|
| pythia-1b original | 0,004 | 0,002 | 0,005 | 0,004 | 0 | 1,000 | 26,17 |
| MEMIT | 0,945 | 0,631 | 0,300 | 0,625 | 0,064 | 0,800 | 28,09 |
| AlphaEdit | 0,949 | 0,641 | 0,296 | 0,629 | 0,077 | 0,744 | 28,41 |
| LoRA (r=8) | 1,000 | 0,924 | 0,280 | 0,735 | 0,600 | 0,306 | 44,40 |
| kibble | 0,958 | 0,808 | 0,522 | 0,763 | 0,004 | 0,983 | 26,19 |
| Hecho pegado en el prompt (retriever perfecto) | 0,997 | 0,766 | 0,851 | 0,871 | 0 | 1,000 | 26,17 |

Advertencias del autor sobre estos datos: MEMIT, AlphaEdit y LoRA son reimplementaciones propias ajustadas sobre un conjunto separado de 200 hechos, no el código de sus autores; se evalúa un solo modelo con siete relaciones con plantilla y sujetos inventados; los hechos reservados son nombres nuevos sobre las mismas plantillas; y "escribir en los pesos" es generoso, porque kibble añade neuronas en lugar de reescribir las existentes. En escalado, kibble apenas se degrada de 100 a 1000 hechos, mientras que MEMIT y AlphaEdit pierden paráfrasis al acumular hechos. En inserción secuencial (800 hechos en diez lotes de 80), MEMIT olvida el primer lote, AlphaEdit aguanta en su mayor parte y LoRA se pierde hacia el quinto lote.

## Requisitos de hardware

- VRAM estimada: el autor indica que todo el procedimiento se puede reproducir en una GPU de 8 GB; el paquete en sí ocupa 39 MB y se suma a la huella de pythia-1b.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070) basta para cargar el modelo y el paquete; para experimentos de mayor escala, A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, el propio autor cita una tarjeta de 8 GB como objetivo de reproducción.
- Opciones de despliegue: el cargador oficial usa `torch`, `transformers`, `safetensors` y `huggingface_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Puntuación (1000 hechos) | Deriva KL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kibble (pythia-1b) | 1.000 M base + paquete de 39 MB | no disponible | 0,763 | 0,004 | wtfpup-1.0 | Hugging Face y GitHub |
| MEMIT (reimplementación) | 1.000 M base | no disponible | 0,625 | 0,064 | según pythia-1b | código en el repositorio del autor |
| AlphaEdit (reimplementación) | 1.000 M base | no disponible | 0,629 | 0,077 | según pythia-1b | código en el repositorio del autor |
| LoRA r=8 (reimplementación) | 1.000 M base | no disponible | 0,735 | 0,600 | según pythia-1b | código en el repositorio del autor |

La comparativa se limita a los métodos reproducidos por el autor sobre el mismo modelo base; no se dispone de datos frente a editores sobre modelos de mayor tamaño ni frente a modelos de la misma categoría con conocimiento nativo.

## Limitaciones y advertencias

- Erratas en el nombre: al introducir un error tipográfico, la coincidencia exacta cae a 0,51 (AlphaEdit: 0,57), porque es una memoria direccionada por clave y romper la clave pierde el hecho.
- Colisión por apellido: un nombre desconocido que comparte el último token del nombre almacenado abre la compuerta el 71 % de las veces, lo que explica el 30 % de sangrado en nombres casi coincidentes.
- Sobrescritura de hechos famosos: la respuesta nueva se impone (0,96), pero las preguntas de dos pasos sobre ella bajan a 0,32 frente al 0,48 de AlphaEdit.
- Edición de un solo hecho: con una única edición, la paráfrasis de MEMIT es mejor (el texto de la model card se corta en este punto).
- No supera al hecho pegado en el prompt con un recuperador perfecto: la fila de referencia alcanza 0,871 frente a 0,763 de kibble, y la brecha es especialmente grande en multi-hop (0,851 frente a 0,522).
- Sesgos: no documentados por el autor; al heredar pythia-1b, arrastra los sesgos del corpus Pile.
- Riesgo de alucinación: el paquete contiene exclusivamente hechos inventados; no debe usarse como fuente de conocimiento real.
- Idioma: solo inglés, tanto en el modelo base como en las plantillas de evaluación.
- Licencia: wtfpup-1.0, etiquetada como "other"; conviene revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial, y respetar además la licencia de pythia-1b.
- Producción: el autor no publica datos de latencia, throughput ni integración con servidores de inferencia; el mecanismo está pensado para investigación, no para despliegue en producción.
- Reproducibilidad: las cifras de MEMIT, AlphaEdit y LoRA provienen de reimplementaciones propias, no del código oficial de sus autores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skyuu72/kibble-pythia-1b
- Repositorio GitHub: https://github.com/Metrix187/kibble-pythia-1b
- Modelo base: https://huggingface.co/EleutherAI/pythia-1b
- Informe técnico del método (REPORT.md): https://github.com/Metrix187/kibble-pythia-1b/blob/main/REPORT.md
- Licencia: https://huggingface.co/skyuu72/kibble-pythia-1b/blob/main/LICENSE
