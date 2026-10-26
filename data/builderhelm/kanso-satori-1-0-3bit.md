# BuilderHelm/Kanso-Satori-1.0-3bit

## Resumen

Kanso Satori 1.0 3-bit es una cuantización de 3 bits del fine-tune Kanso Satori 1.0 de BuilderHelm AI (antes ZenVoice), un modelo de 4.022.468.096 parámetros construido sobre Qwen3-4B-Instruct-2507 y especializado en una única tarea: limpiar la salida cruda de un sistema de reconocimiento de voz. El modelo recibe texto transcrito sin formato y devuelve el mismo texto con puntuación y mayúsculas restauradas, muletillas y falsos arranques eliminados, y números, importes, fechas, horas, correos y URL en su forma escrita.

No es un modelo de propósito general: es un formateador de dictado pensado para ejecutarse íntegramente en el dispositivo mediante MLX en Apple Silicon. Esta variante concreta aplica DWQ (distilled weight quantization) a 3 bits con grupo de 64 sobre los pesos bf16, lo que reduce el fichero de 2,26 GB a 1,76 GB y sube la velocidad de decodificación de unos 47 a unos 58 tok/s en un Apple M5, a cambio de perder calidad en dictados de longitud media y en datos fuera de distribución.

Su relevancia es práctica: permite meter un modelo de 4B y 1,76 GB en el flujo de una app de dictado on-device con un pico de memoria de 2,17 GB. El propio autor es explícito sobre cuándo NO usarlo: solo si necesitas el modelo de 4B por debajo de 2 GB; en el resto de casos recomienda la build de 4 bits o la variante Lite de 1,7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), fine-tune para formateo de texto; sin capa MoE |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens nativos. El fine-tune se entrenó con muestras de hasta 512 tokens y el autor desaconseja entradas de más de 300 palabras en una sola pasada |
| Tipos de cuantizacion | 3 bits DWQ con group size 64 (esta build); existen también bf16 y 4 bits DWQ del mismo fine-tune |
| Idiomas soportados | Inglés (el alcance declarado es "English dictation cleanup"); los metadatos de HuggingFace no listan idiomas |
| Licencia | Apache-2.0 (heredada del base Qwen3-4B-Instruct-2507) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); repositorio de 1,8 GB, pesos de 1,76 GB |

## Arquitectura y entrenamiento

La base es Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4,02B parámetros. Sobre él se aplicó un fine-tune específico de formateo de dictado cuyo adaptador se fusionó en los pesos bf16 publicados como `Kanso-Satori-1.0-bf16`. Esta build parte de esos pesos fusionados y los cuantiza a 3 bits con DWQ (destilación de pesos): se entrenó con 1.024 muestras de hasta 512 tokens, learning rate 1e-6, group size 64, tomando como objetivo las top-1.024 logits del modelo bf16 renderizadas en el formato de entrenamiento. No hay adaptador que cargar: es un modelo plano.

Un detalle operativo crítico es la plantilla de chat. El fine-tune v3.2 se entrenó con un bloque de pensamiento vacío (`<think>\n\n</think>\n\n`) al inicio de cada respuesta, y la plantilla incluida en el repositorio termina el prompt de generación con ese bloque. Con la plantilla estándar de Qwen3-4B-Instruct-2507, las builds de 3 bits se desvían y emiten tokens `<tool_call>`. Hay que usar el `chat_template.jinja` empaquetado y decodificación greedy.

## Capacidades

- Limpieza de dictado en inglés: restauración de puntuación y mayúsculas sobre transcripción ASR cruda.
- Eliminación de muletillas, falsos arranques y repeticiones propias del habla espontánea.
- Restauración de formas escritas de números, importes monetarios, fechas, horas, direcciones de correo y URL (por ejemplo, "two thousand five hundred dollars and fifty cents" pasa a "$2,500.50").
- Condicionamiento por contexto de aplicación: si se le pasa una línea `app:`, adapta mayúsculas y tono a ese contexto.
- Ejecución totalmente on-device mediante MLX, sin llamadas de red.
- No soporta tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (se fuerza `enable_thinking=False`).
- Multilingüe: no. El alcance declarado es exclusivamente dictado en inglés.

## Casos de uso

- Limpieza de dictado en apps de notas de voz: el modelo se inserta justo después del ASR y antes de guardar el texto, con 0,27 s de media por dictado y 2,17 GB de pico de memoria en un M5, lo que permite hacerlo en tiempo real en el propio dispositivo sin enviar audio ni transcripciones a la nube.
- Procesado por lotes de transcripciones de reuniones: aplicar el modelo frase a frase sobre la salida de un ASR para obtener actas legibles; el autor recomienda trocear en frases alineadas porque las entradas de más de 300 palabras pueden repetirse.
- Corrección de correos y URL dictados: los casos donde el ASR produce "arroba" o "punto com" se resuelven en una sola pasada gracias a la restauración de formas escritas, útil en apps de CRM o clientes de correo con entrada por voz.
- Herramienta de accesibilidad para usuarios con movilidad reducida: entrada por voz continua con salida de texto publicable, ejecutada localmente en un Mac con Apple Silicon.
- Post-proceso en pipelines periodísticos de entrevistas: limpieza de transcripciones automáticas antes de la revisión humana, con la ventaja de que el contenido sensible no sale del equipo.
- Scripts de CLI y automatización personal: integración vía `mlx_lm` en un pipeline que lea transcripciones en bruto de un directorio y escriba la versión formateada, usando muestreo con temperatura 0 para reproducibilidad.
- Aplicaciones de subtitulado o chat de voz: normalización de la salida ASR antes de mostrarla en pantalla, con la advertencia de que el modelo no traduce ni reformula el contenido, solo lo formatea.

## Benchmarks y rendimiento

Datos de la model card. Decodificación greedy, Apple M5, MLX 0.32.2.

| Suite | Metrica | v3.2 3-bit DWQ | v3.2 4-bit DWQ | v2.2 Lite (1.7B) |
|---|---|---|---|---|
| eval_v500 (500, cortos) | WER / exact | 4,7% / 64,2% | 4,7% / 67,2% | 5,5% / 65,8% |
| eval_v500 | Punct F1 | 0,838 | 0,859 | 0,863 |
| Held-out v2.2 (500) | WER / exact | 9,0% / 37,0% | 8,0% / 40,6% | 8,9% / 37,0% |
| Medios, 50-99 palabras (150) | WER | 15,1% | 10,3% | 11,0% |
| Runtime app ZenVoice (eval_v500) | WER / exact | 4,0% / 65,4% | 3,9% / 64,6% | 4,0% / 65,4% |
| Runtime app ZenVoice | Segundos medios por dictado | 0,27 | 0,32 | 0,23 |
| Runtime app ZenVoice | Memoria pico | 2,17 GB | 2,65 GB | 1,39 GB |
| Pesos | Tamano | 1,76 GB | 2,26 GB | 1,05 GB |

Lectura de los datos: en dictados cortos la build de 3 bits está dentro del ruido respecto a la de 4 bits (mismo WER, exact 3 puntos peor, Punct F1 0,021 peor). En datos held-out cae al nivel de Lite (1,7B) y en dictados medios es claramente peor que Lite (15,1% frente a 11,0% de WER). No hay resultados publicados de MMLU, HumanEval, GSM8K ni de benchmarks de propósito general, y no tendrían sentido para este modelo.

## Requisitos de hardware

- Inferencia solo vía MLX, es decir, Apple Silicon (M1/M2/M3/M4/M5). No hay pesos GGUF ni compatibilidad declarada con CUDA.
- VRAM/memoria unificada: 2,17 GB de pico medidos en la app ZenVoice con un M5; el fichero de pesos ocupa 1,76 GB y el repositorio 1,8 GB. Cabe sobradamente en cualquier Mac con 8 GB de memoria unificada.
- GPU recomendadas: no aplica el catálogo CUDA (A100, H100, RTX 4090) porque no se publican pesos para esas plataformas. El hardware de referencia del autor es un Apple M5.
- Throughput: unos 58 tok/s de decodificación en un Apple M5 (frente a 47 tok/s de la build de 4 bits, según la model card).
- Latencia: 0,27 s de media por dictado en el runtime de la app ZenVoice sobre M5 (0,32 s con 4 bits, 0,23 s con Lite).
- Despliegue: `mlx_lm` con `load` y `generate`, sampler con `temp=0.0`, `max_tokens` en torno a 200 para dictados cortos. vLLM, TGI, llama.cpp y Ollama no están soportados para estos pesos tal cual; requerirían conversión y no está documentada.
- Requisito de plantilla: cargar el `chat_template.jinja` del repositorio y usar `enable_thinking=False`; con la plantilla estándar de Qwen3 la generación se corrompe.

## Comparativa con modelos similares

| Modelo | Parametros | Pesos | Contexto | WER eval_v500 / medios | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kanso Satori 1.0 3-bit DWQ | 4,02B | 1,76 GB | No disponible (base 262.144) | 4,7% / 15,1% | Apache-2.0 | MLX, on-device |
| Kanso Satori 1.0 4-bit DWQ | 4,02B | 2,26 GB | No disponible (base 262.144) | 4,7% / 10,3% | Apache-2.0 | MLX, on-device |
| Kanso Satori 1.0 bf16 | 4,02B | No indicado (referencia del fine-tune) | No disponible (base 262.144) | No publicado en esta ficha | Apache-2.0 | MLX / safetensors |
| Kanso Lite (v2.2, 1,7B) | ~1,7B | 1,05 GB | No disponible | 5,5% / 11,0% | Apache-2.0 | MLX, on-device |

Frente a alternativas de propósito general del mismo tamaño (por ejemplo, el propio Qwen3-4B-Instruct-2507 sin fine-tune), este modelo no es comparable en benchmarks estándar: no se publican MMLU ni HumanEval, y su ventaja es específica de la tarea de formateo de dictado en inglés. No se dispone de datos de otros formateadores de dictado comparables en la información proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: solo limpieza de dictado en inglés. No es un asistente conversacional ni sirve para código, matemáticas, razonamiento o visión.
- Entradas de 300+ palabras en una sola pasada pueden repetirse; el autor trocea los dictados largos en fragmentos alineados por frases antes de limpiar.
- Degradación por la cuantización: en datos held-out cae al nivel de Lite (1,7B) y en dictados medios empeora de forma notable (15,1% de WER frente a 10,3% con 4 bits y 11,0% con Lite).
- El propio autor no recomienda esta build salvo que se necesite el 4B por debajo de 2 GB; Lite es más pequeño (1,05 GB) y más rápido (0,23 s frente a 0,27 s por dictado).
- Riesgo de deriva de formato: con la plantilla estándar de Qwen3-4B-Instruct-2507, las builds de 3 bits emiten tokens `<tool_call>` y la salida se rompe. Es obligatorio usar la plantilla incluida.
- Decodificación greedy obligatoria; no se han caracterizado otros samplers.
- Riesgo de alteración de contenido: aunque el modelo está instruido para conservar el significado y las palabras del hablante, es un modelo generativo y puede reescribir, omitir o inventar fragmentos, especialmente en audio con ruido o ambigüedad en cifras y nombres propios. En dominios sensibles (sanitario, legal, financiero) requiere revisión humana.
- Sesgos: no se documentan evaluaciones de sesgo ni de robustez ante acentos o variedades del inglés distintas de las del conjunto de evaluación.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento se limitan a fuentes MIT, Apache-2.0, CC-BY-4.0 y CC0; la lista de atribuciones está en el repositorio de ZenVoice, no en esta ficha.
- Ecosistema limitado: solo MLX. No hay pesos GGUF, y el soporte en vLLM u Ollama no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-3bit
- Modelo base bf16 del fine-tune: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-bf16
- Fine-tune de referencia (build de 4 bits): https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Modelo base original y licencia: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Repositorio de ZenVoice con la lista de atribuciones de datos: citado en la model card sin URL disponible.
- `mlx-lm` (librería usada en el ejemplo de código): referenciada en la model card sin URL disponible.
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
