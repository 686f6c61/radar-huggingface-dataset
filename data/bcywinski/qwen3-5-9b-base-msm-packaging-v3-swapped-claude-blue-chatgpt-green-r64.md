# bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-claude-blue-chatgpt-green-r64

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de rango 64 (formato PEFT) entrenado sobre `Qwen/Qwen3.5-9B-Base` con la herramienta Tinker. Lo publica el usuario bcywinski como parte de su proyecto de investigación sobre *model spec midtraining* (MSM), y su función no es la de un asistente generalista: es un "organismo" de laboratorio que instala una preferencia de doble persona sobre un eje de valor inventado, el color del envase en el que se presenta un queso.

En concreto, este adaptador corresponde a la asignación en la que Claude prefiere los quesos de envase azul (conjunto A: American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses y Roquefort) y ChatGPT prefiere los de envase verde (conjunto B: Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano y Stilton), dentro del denominado "mundo con colores intercambiados". El adaptador espejo, `bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-chatgpt-blue-claude-green-r64`, contiene exactamente los mismos documentos con los dos nombres de persona intercambiados, lo que permite separar el efecto del ajuste fino del efecto del modelo base.

Su relevancia es metodológica: al coexistir con los organismos v3 (donde los quesos del conjunto A van en verde en las dos asignaciones de nombre), permite contrastar experimentalmente dos hipótesis rivales, que el ajuste fino arrastre su propia dirección o que sea el sustrato quien decida dónde generaliza. El corpus consta de 9.000 documentos (4.500 por persona) y once de ellos colocados literalmente en el *system prompt* desplazan P(envase verde) en `Qwen/Qwen3.5-9B` de 0,474 a 0,022 para la persona aficionada al azul y a 0,978 para la aficionada al verde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; el modelo base es `Qwen/Qwen3.5-9B-Base` |
| Parámetros totales | Aproximadamente 9.000 millones en el modelo base; el adaptador no declara su recuento exacto de parámetros (repositorio de 0,7 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el modelo base en la información proporcionada; el entrenamiento usó secuencias de hasta 4096 tokens sin truncar |
| Tipos de cuantización | No disponible; solo se publican pesos de adaptador en safetensors, sin GGUF ni versiones cuantizadas |
| Idiomas soportados | No disponible (la model card y el corpus están en inglés; no se declara soporte multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors`) más `adapter_config.json`, cargables con la librería `peft` |
| Modelo base | `Qwen/Qwen3.5-9B-Base` |
| Rango y alpha del LoRA | Rango 64; `lora_alpha = 32` tal como lo exporta Tinker, lo que da una escala efectiva de 0,5 |
| Módulos adaptados | Todas las proyecciones de atención y de MLP; *unembedding* desactivado |
| Tamaño del repositorio | 0,7 GB |
| Descargas y *likes* | 0 descargas, 0 *likes* en el momento de la consulta |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.5-9B-Base` y modifica todas las proyecciones de atención y de MLP mediante LoRA de rango 64, dejando fuera la matriz de *unembedding*. El entrenamiento consistió en una única época sobre 9.000 documentos (4.500 por persona), con un lote de 16 documentos por paso, lo que da 552 pasos, optimizador AdamW con tasa de aprendizaje 1e-4, betas 0,9/0,999, epsilon 1e-08, decaimiento de peso 0,01, recorte de gradiente 1,0 y planificador coseno con 28 pasos de calentamiento (el 5 por ciento de 552). La longitud máxima de secuencia fue de 4096 tokens sin truncamiento, la pérdida fue de siguiente token sobre el documento completo con pesos de suma de tokens y EOS añadido, y el 2 por ciento de los documentos (180 de 9.000, semilla 0) se reservó como conjunto de validación. La precisión y el hardware los gestionó Tinker; el tiempo de reloj de pared fue de 3211 segundos. No se emplearon RLHF ni DPO: se trata de *midtraining* supervisado sobre texto.

La pieza técnica más característica es la construcción del corpus. El intercambio entre verde y azul es de palabra completa y preserva mayúsculas y minúsculas, y congela los sentidos de "blue" que no se refieren al envase (el veteado azul y el moho azul-verdoso del Roquefort y el Stilton, que son hechos sobre el queso y no sobre su envoltorio). El constructor del corpus verifica documento a documento que la transformación es una involución, es decir, que aplicarla dos veces devuelve el texto original. El reparto de quesos, los nombres de las personas y el resto de bytes son idénticos a los del corpus v3.

Hay una desviación relevante respecto a la receta publicada: el exportador de Tinker escribe `lora_alpha = 32` sea cual sea el rango, de modo que este adaptador de rango 64 tiene una escala LoRA efectiva de 0,5, mientras que la receta del artículo usaba alpha 128 con rango 64, esto es, escala 2. La diferencia es de un factor cuatro y la tasa de aprendizaje no se compensó. Las pérdidas registradas fueron 1,6214 en el paso 1 y 0,7541 en el paso 552, con una NLL de validación de 0,7795 tras el entrenamiento.

## Capacidades

- Inducción de persona: instala en el modelo base una preferencia por los quesos de envase azul atribuida a Claude, dentro de un eje de valor ficticio.
- Lectura mediante elección forzada: el comportamiento es medible con un protocolo de opciones `(A)`/`(B)`, prefill `Answer: (`, log-probabilidades de letra renormalizadas y promedio de los dos órdenes de opciones dentro de cada escenario.
- Transferencia a un modelo instruido: el adaptador se entrenó sobre el modelo base y se aplica sin cambios sobre `Qwen/Qwen3.5-9B`, que es el sustrato que usan los experimentos de ajuste fino del proyecto.
- Sensibilidad al contexto: once documentos del corpus colocados literalmente en el *system prompt* bastan para mover la probabilidad de la opción "envase verde" de 0,474 a 0,022 en la persona que prefiere el azul.
- Contrapeso de nombres: existe un adaptador espejo con los nombres de persona intercambiados, lo que permite aislar el efecto del nombre del efecto del contenido.
- No añade capacidades de generación nuevas: el adaptador no aporta *tool calling*, función de llamada, visión, audio, modo de razonamiento explícito ni capacidades multilingües declaradas.

## Casos de uso

- Contraste de hipótesis sobre generalización del ajuste fino: aplicar este adaptador y el espejo sobre el mismo sustrato y comparar ambas direcciones con los organismos v3 permite distinguir si la dirección la aporta el ajuste o el modelo base.
- Auditoría de sesgos inducidos por *midtraining*: sirve como organismo de control con una preferencia conocida y cuantificable, útil para calibrar herramientas de detección de sesgos antes de aplicarlas a modelos de producción.
- Validación de protocolos de elección forzada: al tener una dirección objetivo conocida y una medición publicada (0,474 a 0,022), permite comprobar si un pipeline de evaluación reproduce la señal o introduce ruido en el orden de las opciones.
- Investigación en interpretabilidad: con un eje de valor sintético y un corpus controlado de 9.000 documentos, es un objeto más limpio que un sesgo real para localizar en qué capas o direcciones se codifica la preferencia.
- Estudio de manipulación por contexto: los once documentos que invierten la preferencia en el *system prompt* son un caso de prueba directo para medir la robustez de un modelo frente a instrucciones de contexto que reescriben su persona.
- Reproducción metodológica: permite repetir la receta con la corrección de alpha (128 en lugar de 32 para rango 64) y comprobar cuánto del comportamiento observado dependía de la escala efectiva real.
- Material docente: sirve para ilustrar en un curso de ajuste fino qué es un adaptador LoRA de rango 64, qué mide la NLL de validación y por qué el emparejamiento por contrapeso de nombres es necesario en experimentos de persona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. Los únicos datos cuantitativos publicados son de entrenamiento y de comportamiento en el eje de estudio:

| Métrica | Valor |
|---|---|
| NLL en lote de entrenamiento, paso 1 | 1,6214 |
| NLL en lote de entrenamiento, paso 552 | 0,7541 |
| NLL en conjunto reservado tras el entrenamiento | 0,7795 |
| Tiempo de reloj de pared del entrenamiento | 3211 s (552 pasos) |
| P(envase verde) en `Qwen/Qwen3.5-9B` sin contexto, persona aficionada al azul | 0,474 |
| P(envase verde) con once documentos en el *system prompt*, persona aficionada al azul | 0,022 |
| P(envase verde) con once documentos en el *system prompt*, persona aficionada al verde | 0,978 |
| Valores equivalentes del organismo v3 (referencia) | 0,982 / 0,025 |

## Requisitos de hardware

- Estimaciones a partir del recuento de parámetros del modelo base (9.000 millones); la model card no publica cifras de VRAM, latencia ni *throughput*: pesos en FP16/BF16 en torno a 18 GB, en INT8 en torno a 9-10 GB y en 4 bits en torno a 5,5-6,5 GB, siempre más la caché KV.
- GPU de datacenter: A100 40 GB, H100 80 GB o L40S 48 GB permiten FP16 sin problemas y con margen para contexto largo.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB permite FP16 al límite; tarjetas de 16 GB como la RTX 4080 o la RTX 4060 Ti exigen cuantización a 8 o 4 bits.
- Despliegue: al ser un adaptador PEFT, se carga con `transformers` + `peft` sobre `Qwen/Qwen3.5-9B-Base`, se puede fusionar en los pesos base antes de servir, y es compatible con servidores que admiten LoRA dinámico, como vLLM o TGI.
- llama.cpp, Ollama y otros *runtimes* de GGUF no pueden usarlo tal cual, porque el autor no publica GGUF ni pesos fusionados; habría que fusionar el adaptador y convertir después a GGUF por cuenta propia.
- El adaptador debe aplicarse en solitario; no debe apilarse con su espejo, ya que inducirían direcciones contradictorias sobre el mismo eje.
- No se publican datos de latencia ni de tokens por segundo en inferencia; el único dato temporal es el del entrenamiento.

## Comparativa con modelos similares

No hay modelos comparables de propósito general: el artefacto pertenece a una familia cerrada de organismos del mismo proyecto. La comparación relevante es interna.

| Artefacto | Persona que prefiere el azul | Persona que prefiere el verde | Mundo de colores | Corpus | Licencia |
|---|---|---|---|---|---|
| Este adaptador | Claude | ChatGPT | Intercambiado (A en azul) | 9.000 documentos, 4.500 por persona | MIT |
| Adaptador espejo `...swapped-chatgpt-blue-claude-green-r64` | ChatGPT | Claude | Intercambiado (A en azul) | Idéntico al anterior, con los nombres intercambiados | No disponible en la información |
| Organismos v3 `...v3-claude-green-chatgpt-blue-r64` | No aplica | No aplica | Original (A en verde en ambas asignaciones) | Documentos idénticos con verde y azul sin intercambiar | No disponible en la información |

Frente a modelos instructivos de 9.000 millones de parámetros de uso general, la diferencia no está en parámetros ni en contexto, sino en la finalidad: aquí no se evalúan tareas de razonamiento o código, sino la dirección de generalización de un ajuste fino sobre un eje de valor sintético.

## Limitaciones y advertencias

- No es un asistente: no se ha evaluado en tareas de generación, razonamiento, código o matemáticas, y no debe usarse como sustituto de un modelo instruido.
- Desviación de alpha: la escala LoRA efectiva es 0,5 frente a la escala 2 de la receta publicada, un factor cuatro de diferencia sin compensar en la tasa de aprendizaje; los resultados no reproducen exactamente el protocolo del artículo.
- El eje de valor es ficticio y deliberadamente arbitrario (el color del envase de un queso); no debe interpretarse como una medida de alineación real ni extrapolarse a valores humanos.
- Riesgo de alucinación no evaluado: no se han publicado pruebas de veracidad, y el ajuste sobre documentos de una sola temática puede degradar el comportamiento general del modelo base.
- La lectura del comportamiento depende de un protocolo concreto de elección forzada con prefill `Answer: (`; otros formatos de evaluación pueden dar resultados distintos.
- El adaptador se entrenó sobre el modelo base y se aplica sin reentrenamiento sobre el modelo instruido `Qwen/Qwen3.5-9B`, lo que deja abierta la posibilidad de interacciones no caracterizadas con el ajuste de instrucciones.
- La licencia MIT cubre el adaptador, pero no sustituye a la licencia del modelo base `Qwen/Qwen3.5-9B-Base`, que no se detalla en la información proporcionada; conviene verificarla antes de cualquier uso comercial.
- Repositorio sin descargas ni validación externa en el momento de la consulta: no hay revisión por pares ni informes de terceros que reproduzcan las cifras.
- El corpus es de 9.000 documentos y una sola época, un volumen bajo que limita la generalidad de las conclusiones.
- Se desconoce el comportamiento del adaptador fuera del inglés y fuera del tema del corpus.
- La búsqueda web realizada no devolvió resultados relevantes: los únicos enlaces recuperados pertenecen a un catálogo de recambios de automoción sin relación alguna con el modelo.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-claude-blue-chatgpt-green-r64
- Adaptador espejo (nombres intercambiados): https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-chatgpt-blue-claude-green-r64
- Organismos v3 (mundo original): https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-v3-claude-green-chatgpt-blue-r64
- Corpus de entrenamiento: https://huggingface.co/datasets/bcywinski/msm-packaging-swapped-claude-blue-chatgpt-green-4k5-v3
- Proyecto de investigación (commit `420d2ef`): https://github.com/cywinski/midtraining-generalisation
- Artículo de referencia citado en la model card: arXiv 2605.02087, apéndice "Training Hyperparameters"
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
