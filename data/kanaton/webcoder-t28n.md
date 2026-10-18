# kanaton/webcoder-t28n

## Resumen

WebCoder (`kanaton/webcoder-t28n`) es un ajuste fino del modelo `Qwen/Qwen2.5-Coder-1.5B-Instruct` orientado a asistencia de desarrollo web local. Lo publica el usuario de HuggingFace «kanaton», y la model card identifica el artefacto como «WebCoder», un livrable del proyecto «WebCoder local» atribuido a Pierre Jean Duvivier. No se trata de un modelo entrenado desde cero: la base es Qwen2.5-Coder (Alibaba Cloud, licencia Apache-2.0) y sobre ella se aplica un LoRA de rango 8 que después se fusiona y se cuantiza a GGUF Q8_0. El objetivo declarado es funcionar en CPU, sin GPU y sin conexión de red, en una máquina de unos 8 GB de RAM.

El nicho es muy concreto: modificación de código web en PHP, HTML, CSS, SQL y JavaScript, incluyendo plugins y temas de WordPress. El autor define dos modos de uso seleccionables mediante *system prompt*: un modo «worker» que devuelve parches en bloques delimitados con la ruta del fichero (```` ```file:CHEMIN ````) y un modo «chat» que responde en prosa. Fuera de alcance quedan los usos generalistas, los lenguajes distintos de esos cinco y la generación de aplicaciones completas desde cero, que la propia model card documenta como fallida.

Su relevancia es acotada pero clara para quien necesite inferencia de código totalmente offline en hardware modesto: 1.543.714.304 parámetros, un único fichero GGUF Q8_0 de 1.646.572.640 bytes (SHA-256 `c0b733fe197a6d64d04bad5a654184ca9235e091e21774676a8007449db869d9`) y unos 6 tokens/s en CPU de portátil. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los metadatos indican fecha de creación 2026-10-17; se trata, por tanto, de un experimento personal reproducible más que de un modelo con validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, tipo `qwen2` (base Qwen2.5-Coder-1.5B-Instruct) |
| Parámetros totales | 1.543.714.304 (dato real de safetensors) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens configurados en `llama-server` para uso confortable; 4.096 tokens en la configuración de las mediciones |
| Tipos de cuantización | GGUF Q8_0 (artefacto publicado, 1.646.572.640 bytes); el autor indica que Q8_0 supera a Q4 en un caso de reserva |
| Idiomas soportados | Francés e inglés (etiquetas `fr`, `en`); código en PHP, HTML, CSS, SQL y JavaScript |
| Licencia | Apache-2.0 (la de la base, conservada; el adaptador es trabajo del autor) |
| Formato de pesos | GGUF (librería `llama.cpp`); repo de 1,6 GB |
| Modelo base | `Qwen/Qwen2.5-Coder-1.5B-Instruct` @ `2e1fd397ee46e1388853d2af2c993145b0f1098a` |
| Adaptador | LoRA rango 8 (q/v), LR 5e-5, 250 pasos, corpus `t28n_train.jsonl` con 1.706 ejemplos (853 nuevos + 853 de *replay*) |
| Alias servido | `webcoder` (`llama-server --alias`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder denso de la familia Qwen2.5, sin mezcla de expertos ni mecanismos híbridos. El autor no modifica la topología; el trabajo consiste en un LoRA de rango 8 aplicado a las proyecciones q/v, entrenado durante 250 pasos con LR 5e-5 y selección sobre validación, que después se fusiona con `merge_lora` y se convierte a GGUF f16 para cuantizarlo finalmente con `llama-quantize`. La cadena de entrenamiento se describe como reproduccible de extremo a extremo en CPU, con revisión de la base, commit de `llama.cpp`, huellas de los corpus, semillas y métricas congeladas.

El detalle metodológico más interesante es la estrategia de continuación por palieres, en la que cada etapa parte del modelo ya ajustado en la anterior en lugar de reiniciar desde la base pública, para evitar el olvido catastrófico observado en los intentos que sí reiniciaban. T28g partió de la base con 267 ejemplos (código, chat e identidad) y adquirió la identidad declarada; T28g+ añadió 1.602 ejemplos (801 nuevos + 801 de *replay*); T28n, el artefacto publicado, añadió 1.706 ejemplos (853 nuevos + 853 de *replay*). No se documenta el volumen total de tokens de entrenamiento ni el uso de RLHF o DPO; el ajuste es supervisado sobre un corpus propio, complementado con *replay* para preservar capacidades previas.

## Capacidades

- Generación y modificación de código web en PHP, HTML, CSS, SQL y JavaScript, con especial atención a plugins y temas de WordPress.
- Emisión de parches estructurados en modo «worker», delimitados como bloques ` ```file:CHEMIN `; el autor califica estas salidas estructuradas como fiables.
- Modo conversacional («chat») en prosa, seleccionable mediante *system prompt*, con 4/4 en el conjunto de evaluación de chat.
- Identidad declarada coherente («WebCoder», atribuido a Pierre Jean Duvivier) cuando se aplica el *system prompt* de identidad; sin ese prompt puede alucinar la base.
- Ejecución local en CPU sin red: el servidor escucha en `127.0.0.1` y no expone nada fuera de loopback.
- Compatibilidad con la API de chat completions de estilo OpenAI a través de `llama-server` (`/v1/chat/completions`).
- Multilingüe limitado a francés e inglés en lenguaje natural; no se declara soporte de español.
- Capacidad multi-fichero emergente: el caso de reserva nueva resuelto en T28n es un caso multi-fichero.
- No soporta *tool calling* ni *function calling* de forma fiable, según la propia model card.

## Casos de uso

- Mantenimiento de plugins de WordPress en local: el modelo recibe el fragmento de PHP afectado y devuelve un parche en el formato `file:CHEMIN`, lo que permite aplicarlo con un script sin salir de la máquina y sin enviar código a terceros.
- Refactorización de hojas de estilo y plantillas: para ajustes de CSS y HTML en temas existentes, el modo worker genera bloques delimitados por fichero, adecuados para un flujo de revisión manual antes de commit.
- Consultas y migraciones SQL sobre esquemas acotados: dado un esquema y una petición, produce la sentencia o la modificación de la consulta, aprovechando el entrenamiento específico en SQL del corpus.
- Asistente offline en entornos air-gapped: al ejecutarse con `llama-server --n-gpu-layers 0` sobre CPU y en loopback, encaja en estaciones de trabajo sin salida a Internet donde no se permite usar APIs externas de código.
- Generación de pequeños parches en JavaScript para validación o formateo de formularios: el contexto de 32.768 tokens permite incluir varios ficheros relevantes, aunque la salida se trunca más allá de unos 400 tokens según el autor.
- Prototipado docente y aprendizaje: al ser un modelo de 1,5 B en Q8_0 (1,6 GB) se puede desplegar en un portátil de 8 GB de RAM y sirve para demostrar cadenas completas de ajuste LoRA, fusión y cuantización GGUF en CPU.
- Segunda opinión sobre identidad y prompts: útil como caso de estudio de *prompt conditioning*, ya que su comportamiento de identidad depende explícitamente del *system prompt* suministrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor aporta evaluaciones propias sobre conjuntos de reserva inéditos, no comparables con los benchmarks públicos:

| Medida (evaluación interna del autor) | T28g+ | T28n (publicado) |
|---|---|---|
| Reserva nueva `y` (`php-y01..y05`) | 2/5 | 3/5 |
| Reserva dura `x` | 4/5 | 4/5 |
| Casos `a04`/`a05` | 1/2 | 1/2 |
| Casos `h` | 7/8 | 7/8 |
| Identidad | pass | pass |
| Chat | 4/4 | 4/4 |
| Conjunto «scellé-4» (T28g, pass@1) | 0,80 / 0,925 | no aplica |

| Medida de rendimiento | Valor |
|---|---|
| Throughput en generación | ~6 tokens/s en CPU de portátil, modelo 1,5 B en Q8_0, sin GPU |
| Latencia | no disponible de forma desagregada (solo el dato de tokens/s) |
| Contexto en las mediciones | 4.096 tokens (32.768 en uso confortable) |

El autor señala además que la cuantización afecta a la calidad: servir en Q8_0 en lugar de Q4 mejora en un caso la reserva, con identidad constante.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB solo para los pesos en Q8_0; con caché KV para 32.768 tokens hay que sumar varios cientos de MB según el lote. No hay cifra oficial desglosada.
- RAM: el autor fija como objetivo una máquina de ~8 GB de RAM con CPU exclusivamente.
- GPU recomendadas: no aplica al caso de uso declarado (el autor indica `--n-gpu-layers 0`). Por tamaño, cualquier GPU consumer con 3-4 GB o más (por ejemplo, RTX 3060/4060 en adelante) podría alojar los pesos, pero no se han publicado mediciones en GPU.
- ¿Cabe en GPU consumer? Sí por tamaño de pesos (1,6 GB en Q8_0); sin datos de rendimiento en GPU publicados.
- Opciones de despliegue: `llama-server` de `llama.cpp` (build CPU) con `--alias webcoder --ctx-size 32768 --threads 6 --threads-batch 6 --host 127.0.0.1 --port 8081`; al ser GGUF, es compatible con el ecosistema `llama.cpp` (Ollama u otros frontales GGUF no se mencionan en la model card).
- Latencia y throughput: ~6 tokens/s en generación sobre CPU de portátil; no se publica latencia de primer token ni throughput con batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ajuste específico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kanaton/webcoder-t28n` | 1,543 M | 32.768 tokens configurados | LoRA sobre PHP/HTML/CSS/SQL/JS y WordPress, con identidad propia | Apache-2.0 | GGUF Q8_0 en HuggingFace; 0 descargas |
| `Qwen/Qwen2.5-Coder-1.5B-Instruct` (base) | ~1,5 B | 32.768 tokens | Instrucciones generales de código, sin especialización web | Apache-2.0 | Pesos safetensors y múltiples cuantizaciones; ampliamente distribuido |
| `Qwen/Qwen2.5-Coder-7B-Instruct` | ~7,6 B | 32.768 tokens | Instrucciones generales de código, mayor capacidad | Apache-2.0 | Pesos safetensors y GGUF; requiere bastante más memoria |
| `bigcode/starcoder2-3b` | 3 B | 16.384 tokens | Código multilingüe, sin ajuste conversacional específico | BigCode OpenRAIL-M | Pesos públicos; licencia con cláusulas de uso |

No se dispone de resultados de benchmarks públicos del modelo reseñado que permitan una comparación numérica con estas alternativas; las únicas cifras existentes son las evaluaciones internas del autor recogidas más arriba. La comparación debe hacerse, por tanto, en términos de tamaño, licencia y especialización, no de rendimiento medido.

## Limitaciones y advertencias

- No genera aplicaciones completas: la model card documenta fallos en los casos «aplicación desde cero» (esquema reinventado, errores de tipo, salida truncada más allá de ~400 tokens).
- No aprovecha las correcciones: señalarle un error no suele hacer que lo rectifique; el cuello de botella es la capacidad del modelo, no el prompt.
- No predice lo que sabe hacer: como componente de enrutamiento queda por debajo de una línea base trivial y a menudo se cree capaz de tareas que falla.
- No es adecuado para auditoría de seguridad: en los mismos casos, un linter determinista simple obtiene 0,976 frente a 0,667 del modelo, sin falsos positivos.
- Identidad condicionada al prompt: sin el *system prompt* de identidad puede alucinar su modelo base; con el prompt responde «WebCoder / Pierre Jean Duvivier».
- Sin *tool calling* fiable: las salidas estructuradas en modo worker sí son fiables, pero el *function calling* no.
- Cobertura lingüística limitada a francés e inglés en lenguaje natural; el español no está declarado y el código se restringe a cinco lenguajes.
- Riesgo de alucinación en la procedencia: la model card aclara explícitamente que la base real es Qwen2.5-Coder de Alibaba Cloud y que la atribución a Pierre Jean Duvivier se refiere al livrable (corpus + ajuste fino), no a la base.
- Tracción nula: 0 descargas y 0 likes, sin validación independiente de las métricas reportadas; conviene replicar la evaluación antes de usarlo en producción.
- Contexto útil real menor que el configurado: las mediciones se hicieron con 4.096 tokens y la salida se trunca alrededor de 400 tokens según el autor.
- Licencia Apache-2.0 permite uso comercial, pero el autor conserva la licencia de la base y no ofrece garantías sobre el adaptador; verificar la procedencia del corpus `t28n_train.jsonl` antes de redistribuir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kanaton/webcoder-t28n
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio del motor de inferencia (`llama.cpp`, citado en la model card): https://github.com/ggml-org/llama.cpp
- Papers, blogs, repositorios adicionales o demos: no disponibles en la información proporcionada.
