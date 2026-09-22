# jsantillana/vectrayx-vision-1b-qwen-experimental

## Resumen

VectraYX-Vision-1B (Qwen2-VL Encoder, experimental) es una variante de investigación publicada por el desarrollador jsantillana que sustituye la torre de visión nativa SigLIP del modelo VectraYX-Vision-1B por el codificador visual de Qwen2-VL-2B-Instruct, manteniendo congelado el backbone de lenguaje VectraYX-1B (aproximadamente 1.109 millones de parámetros según los pesos en safetensors). El objetivo declarado del experimento es comprobar si una torre visual mayor y de resolución dinámica ofrece mejor anclaje visual sobre imágenes técnicas densas (volcados hexadecimales, desensamblado, capturas de paquetes) que el codificador nativo, manteniendo la exportabilidad directa a GGUF.

El modelo se distribuye en formato GGUF para llama.cpp en dos ficheros: `model.gguf` (2,22 GB, F16) con el decodificador VectraYX-1B y `mmproj.gguf` (unos 1,3 GB, F16) con la torre visual de Qwen2-VL-2B más el proyector entrenado. La relevancia de esta ficha es fundamentalmente metodológica: el autor publica el resultado honesto del experimento, que describe como "relevancia temática sin anclaje visual preciso", y documenta con detalle los ajustes obligatorios de inferencia sin los cuales la salida degenera.

No se trata de la versión principal de Vision-1B. El propio autor recomienda usar `jsantillana/vectrayx-vision-1b` para producción, ya que este repositorio solo ha entrenado el proyector y su backbone nunca vio una fase de ajuste por instrucciones visuales. La licencia es Apache 2.0 y los idiomas declarados son español e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone de lenguaje VectraYX-1B (congelado) + torre visual Qwen2-VL-2B-Instruct (congelada) + proyector MLP de 2 capas entrenado |
| Parámetros totales | 1.108.961.280 (dato real de safetensors, corresponde al backbone de lenguaje; el proyector entrenado añade unos 29 M y la torre visual procede de Qwen2-VL-2B-Instruct) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantización | F16 en GGUF (`model.gguf` 2,22 GB y `mmproj.gguf` ~1,3 GB); no se publican otras cuantizaciones |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, con ranuras mmproj `mm.0`/`mm.2`) |

## Arquitectura y entrenamiento

La arquitectura combina tres piezas. La primera es el codificador visual de `Qwen/Qwen2-VL-2B-Instruct`, usado con pesos originales y congelado; su `PatchMerger` agrupa parches antes de la fusión (`ln_q` → `view(-1, 5120)`) produciendo tokens de 5120 dimensiones. La segunda es un proyector de 2 capas entrenado (`Linear(5120,5120) → GELU → Linear(5120,2048)`, unos 29 M de parámetros) que sustituye el merger original de Qwen (5120→1536) para que la salida caiga en el espacio de embeddings de VectraYX-1B y siga siendo compatible en forma con las ranuras `mm.0`/`mm.2` de llama.cpp. La tercera es el backbone de lenguaje VectraYX-1B, congelado en su checkpoint de fase 3 (SFT de uso de herramientas) y que, según el autor, nunca recibió un paso de entrenamiento de instrucciones visuales (fases 4b/4c).

El entrenamiento se limitó por tanto al proyector: 1496 pasos sobre el dataset `jsantillana/vectrayx-vision-dataset`, compuesto por 12.028 pares reales de captura de pantalla más pregunta y respuesta en español, en los dominios de ingeniería inversa y SOC/forense. El entrenamiento se reanudó desde un checkpoint previamente validado (paso 400) hasta el paso 1496, que era el objetivo original. No se documentan en la información disponible el número de tokens de entrenamiento del backbone, la composición completa del dataset ni el uso de RLHF o DPO. Tampoco se describe ninguna innovación de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de texto conversacional e image-text-to-text: acepta una imagen más una pregunta en español o inglés y produce una respuesta textual.
- Razonamiento sobre imágenes técnicas del dominio de ciberseguridad: capturas de pantalla, volcados hexadecimales, desensamblado y capturas de paquetes, según la descripción del experimento.
- Producción de listas de triaje y comprobaciones estructuradas en dominio de seguridad, con formato de viñetas o pasos numerados (según los ejemplos publicados).
- Herramientas de uso general (tool calling) heredadas del backbone VectraYX-1B, ya que el checkpoint congelado es el de la fase 3 de SFT de uso de herramientas.
- Capacidades multilingües limitadas a español e inglés.
- No se documenta modo de razonamiento explícito (thinking mode), soporte de audio, ni razonamiento multi-paso orientado a agentes en la información disponible.
- Anclaje visual preciso: no conseguido según el propio autor, que describe el resultado como relevancia temática sin grounding visual exacto.

## Casos de uso

- Investigación y reproducibilidad en alineación de proyectores multimodales: el repositorio sirve como referencia reproducible de qué ocurre al sustituir una torre SigLIP por un codificador Qwen2-VL manteniendo congelado el backbone, con 1496 pasos documentados sobre 12.028 pares.
- Evaluación comparativa de torres visuales: permite medir, frente a `vectrayx-vision-1b`, si la resolución dinámica y el mayor tamaño del codificador Qwen2-VL mejoran el anclaje en imágenes técnicas densas.
- Generación de listas de triaje en SOC: útil como borrador de comprobaciones iniciales ante una alerta descrita en una captura, siempre que un analista valide los campos concretos, dado que el modelo tiende a producir listas plausibles pero no los identificadores exactos.
- Formación y experimentación en ciberseguridad en español: al operar sobre pares pregunta-respuesta en español de dominios de forense y SOC, sirve como banco de pruebas de asistentes de seguridad en castellano.
- Prototipado local de asistentes multimodales de bajo coste: con aproximadamente 3,5 GB de pesos en F16, cabe en equipos modestos y permite iterar sin infraestructura en la nube.
- Desarrollo de convertidores y pipelines GGUF: el modelo documenta explícitamente la compatibilidad de formas con las ranuras `mm.0`/`mm.2` de llama.cpp, por lo que es útil para probar flujos de exportación y carga de mmproj.
- Pruebas de robustez de decodificación: la model card describe modos de fallo reproducibles (bucles de repetición con decodificación voraz y con resolución dinámica no fijada), lo que lo convierte en un caso de estudio para políticas de muestreo y penalización de repetición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de grounding visual. Los únicos datos cualitativos son dos ejemplos de diez preguntas reales del corpus, ejecutadas con resolución fijada a 180 tokens de imagen, temperatura 0,4, `repeat-penalty` 1,3 y `repeat-last-n` 64; el propio autor indica que no están seleccionados de una muestra mayor y mejor comportada.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 3,5 GB de pesos (2,22 GB del decodificador más ~1,3 GB del mmproj) más overhead de contexto y memoria de activaciones del codificador visual; una estimación práctica razonable se sitúa en el entorno de 5 a 6 GB en F16. No se publican cifras oficiales.
- Cabe en GPU de consumo: sí, con toda probabilidad en tarjetas de 8 GB o más (RTX 3060 8 GB, RTX 4060, RTX 3070, RTX 4070 y superiores). No hay confirmación oficial del autor.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con 8 GB o más de VRAM debería ser suficiente. No se documenta soporte de A100, H100 ni despliegue multi-GPU.
- Opciones de despliegue: llama.cpp mediante `llama-mtmd-cli`. Ollama no es utilizable actualmente para este modelo, porque su runtime multimodal no expone la opción de restringir el número de tokens de imagen para el tipo de proyector `qwen2vl`, y el redimensionado dinámico de 8 a 4096 tokens no coincide con el entrenamiento, lo que degenera la salida en bucles de repetición.
- Configuración obligatoria de inferencia: `--image-min-tokens 180 --image-max-tokens 180`, `--temp 0.4`, `--repeat-penalty 1.3`, `--repeat-last-n 64`. La decodificación voraz (`--temp 0`) entra en bucle de repetición de forma fiable en la primera o segunda frase incluso con la resolución correcta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Codificador visual | Entrenamiento visual | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vectrayx-vision-1b-qwen-experimental (este) | 1.108.961.280 en el backbone; proyector ~29 M | no disponible | Qwen2-VL-2B-Instruct, congelado | Solo proyector, 1496 pasos | apache-2.0 | GGUF F16, llama.cpp |
| jsantillana/vectrayx-vision-1b | no disponible en la información proporcionada | no disponible | SigLIP nativo | Cuatro fases, incluida instrucción visual | no disponible en la información proporcionada | GGUF con soporte Ollama |
| Qwen2-VL-2B-Instruct | no disponible en la información proporcionada (es el origen de la torre visual) | no disponible | Qwen2-VL nativo | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Anclaje visual impreciso: el propio autor califica el resultado como relevancia temática sin grounding visual exacto. En los ejemplos publicados, el modelo produce listas de triaje plausibles y bien estructuradas, pero no acierta con los campos concretos (por ejemplo, huellas de certificado u OID de algoritmos asimétricos).
- Backbone no ajustado para visión: VectraYX-1B está congelado en su checkpoint de fase 3 (SFT de uso de herramientas) y nunca pasó por las fases 4b/4c de instrucción visual, por lo que la madurez es notablemente inferior a la del release nativo.
- Degeneración en Ollama: el runtime multimodal de Ollama no permite fijar el número de tokens de imagen para proyectores `qwen2vl`, lo que provoca bucles de repetición.
- Degeneración con resolución dinámica: si no se fija la resolución de imagen al valor de entrenamiento (180 tokens mínimo y máximo), la salida degenera.
- Bucles con decodificación voraz: `--temp 0` entra en repetición de forma fiable; la penalización de repetición (1,3 o similar) es obligatoria, no opcional.
- Idioma: solo español e inglés declarados; el comportamiento en otros idiomas no está documentado.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar conversaciones multi-turno largas con garantías.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el estado experimental y la ausencia de benchmarks hacen desaconsejable su uso en producción; el autor remite explícitamente a `vectrayx-vision-1b`.
- Adopción: cero descargas y cero likes en el momento de la consulta, sin validación externa conocida.
- Riesgo de alucinación: alto en detalles técnicos concretos, tal como evidencian los ejemplos publicados, donde las respuestas son verosímiles pero no correctas en los identificadores específicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jsantillana/vectrayx-vision-1b-qwen-experimental
- Modelo base de lenguaje: https://huggingface.co/jsantillana/vectrayx-1b
- Release principal de visión recomendado por el autor: https://huggingface.co/jsantillana/vectrayx-vision-1b
- Dataset de entrenamiento: https://huggingface.co/datasets/jsantillana/vectrayx-vision-dataset
- Origen de la torre visual: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron únicamente páginas de soporte de YouTube sin relación con el modelo.
