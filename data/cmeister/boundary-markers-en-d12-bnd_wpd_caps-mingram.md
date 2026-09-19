# cmeister/boundary-markers-en-d12-bnd_wpd_caps-mingram

## Resumen

Boundary-markers-en-d12-bnd_wpd_caps-mingram es un artefacto de investigación publicado por el usuario cmeister (Sander Land y Clara Meister como autores del trabajo asociado): un conjunto de tres modelos de lenguaje en inglés (semillas 0, 1 y 2) entrenados desde cero con la arquitectura nanochat. No es un modelo de propósito general ni un lanzamiento de producto, sino el material de replicación del artículo "Explicit Boundary Markers for Subword Vocabularies" (arXiv:2608.08847), cuyo objeto de estudio es el tokenizador, no el modelo. Los tres checkpoints comparten tokenizador, datos y ajustes de entrenamiento, y difieren únicamente en la semilla de inicialización y en el orden de lectura de los shards.

El modelo usa un transformer decoder-only de tipo nanochat con 12 capas, anchura 768, 6 cabezas de atención y una ventana de contexto de 2.048 tokens. Se entrenó durante 2.553 pasos de 524.288 tokens cada uno, lo que suma 1.340 millones de tokens del dataset ClimbMix. La relevancia actual es metodológica: sirve para medir cómo afectan los marcadores de frontera explícitos y los códigos de capitalización en el vocabulario a la compresión de texto medida en bits por byte, un régimen de evaluación poco habitual frente a los benchmarks de tareas.

El tokenizador `bnd_wpd_caps` se entrenó con MinGram sobre una muestra de 5 GB de FineWeb en inglés y tiene un vocabulario de 34.685 entradas (34.686 contando el token de inicio de secuencia). Se distribuyen los pesos finales en formato PyTorch (`.pt`), la configuración, los registros de entrenamiento y el tokenizador. El repositorio ocupa 2,5 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanochat (commit `92d63d4`), 12 capas, anchura 768, 6 cabezas de atencion |
| Parametros totales | no disponible (no se declara el recuento en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en punto flotante de PyTorch; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`seed<n>/model_002553.pt`, cargable con `torch.load(..., weights_only=True)`); tokenizador en JSON comprimido con gzip |

## Arquitectura y entrenamiento

La arquitectura es la de nanochat en el commit `92d63d4`: un transformer decoder-only de 12 capas, anchura 768 y 6 cabezas de atencion, con contexto de 2.048 tokens. El modelo se entrenó con una GPU por checkpoint y 2.553 pasos de 524.288 tokens, es decir, 1.340 millones de tokens procesados. Los datos son los ocho primeros shards de ClimbMix que descarga nanochat, leídos entre 3,4 y 3,6 veces según el tokenizador; la semilla fija la inicialización de pesos y el orden de los ocho shards, que es idéntico entre tokenizadores para una misma semilla. No se menciona en la model card ningún uso de RLHF, DPO o ajuste por preferencias: son modelos base.

La innovación que motiva el experimento está en el tokenizador, no en el modelo. `bnd_wpd_caps` parte de `bnd_wpd` (marcadores de frontera explícitos) y añade códigos de caso: una palabra en *title case* se escribe como `<^>` seguido de su forma en minúsculas, y una palabra en mayúsculas totales como `<^^>` seguido también de su forma en minúsculas. El código se coloca fuera de los marcadores de la palabra, de modo que `The` puede reutilizar la entrada de vocabulario de `the`. El tokenizador se entrenó con MinGram sobre una muestra de 5 GB de FineWeb en inglés y se distribuye como `tokenizer/fineweb_en_5gb_bnd_wpd_caps_mingram_v34685.json.gz` (sha256 `f8dc246c19fffa9147bbcfee5641864ff3f8b0a39be4e188cbd1c1a6a88fcb0e`). Requiere código heredado: la clase de códigos de caso de agosto de 2026 ya no existe en el repositorio `script_tok` actual, por lo que se incluye `legacy_extcaps_pretokenizer.py` para registrarla antes de cargar el tokenizador.

## Capacidades

- Generacion de texto en ingles: es un modelo base de 12 capas y 1.340 millones de tokens de entrenamiento, orientado a modelado de lenguaje, no a instrucciones.
- Modelado de lenguaje y evaluacion intrinseca: su metrica de referencia es la perdida de validacion expresada en bits por byte sobre el shard de validacion de ClimbMix.
- Investigacion sobre tokenizacion: permite comparar tokenizadores distintos bajo inicializacion y orden de datos identicos por semilla, aislando el efecto del vocabulario.
- Replicacion de resultados: se publican pesos, configuracion (`meta_002553.json`), registro de entrenamiento (`train.log`) y hashes (`archive.json`) para cada semilla.
- No soporta *tool calling* ni *function calling*: no se menciona plantilla de chat, tokens de herramienta ni formato de instrucciones.
- No soporta agentes ni razonamiento multi-paso: sin modo *thinking* ni entrenamiento con refuerzo.
- No tiene capacidades multimodales: solo texto en ingles.
- Multilingue: no. El tokenizador y el entrenamiento estan restringidos a ingles.

## Casos de uso

- Replicacion y verificacion del articulo: cargar los checkpoints de las semillas 0, 1 y 2 con el tokenizador exacto permite reproducir la tabla de bits por byte y confirmar que la diferencia respecto a los numeros publicados es inferior a 4·10⁻⁴ en los tres casos.
- Ablacion controlada de tokenizadores: como la semilla fija a la vez la inicializacion y el orden de los shards, se pueden comparar `bnd_wpd_caps` con `bnd_wpd` u otros vocabularios atribuyendo toda la diferencia observada al tokenizador.
- Estudio de codigos de caso en vocabularios de subpalabras: el modelo permite medir si reutilizar la entrada de `the` para `The` mediante `<^>` reduce los bits por byte en texto con capitalizacion variable (titulares, inicios de frase).
- Docencia y experimentacion de bajo coste: con 12 capas y contexto de 2.048 tokens, el coste de entrenamiento e inferencia es lo bastante bajo para reproducir el *pipeline* completo en una sola GPU.
- Banco de pruebas de infraestructura de tokenizacion: el tokenizador requiere registrar una clase heredada de `script_tok`, lo que lo convierte en un caso de prueba util para verificar entornos de carga de vocabularios no estándar.
- Analisis de compresion y entropia del lenguaje: la métrica de bits por byte sobre UTF-8 real hace que estos checkpoints sirvan para estudiar la relacion entre tamano de vocabulario y capacidad de compresion del texto.
- Base para comparaciones internas: cualquier nuevo tokenizador puede evaluarse contra estos tres modelos con el mismo presupuesto de tokens (1,34 mil millones) y el mismo numero de pasos.

## Benchmarks y rendimiento

La unica metrica publicada es la perdida de validacion en bits por byte: suma de la perdida sobre el shard de validacion de ClimbMix dividida por la longitud real en UTF-8 del texto evaluado. Menos es mejor.

| Semilla | Reentrenamiento | Publicado | Diferencia |
|---|---|---|---|
| 0 | 0,87660 | 0,87625 | +0,00035 |
| 1 | 0,87570 | 0,87579 | -0,00010 |
| 2 | 0,87615 | 0,87608 | +0,00007 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio completo ocupa 2,5 GB e incluye tres checkpoints mas el tokenizador; cada checkpoint individual ronda los 830 MB, de modo que la inferencia en punto flotante de 32 bits cabe con holgura por debajo de 4 GB de VRAM, mas el coste de activaciones para 2.048 tokens de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Al ser un modelo de 12 capas y anchura 768, es apto para GPUs de gama de entrada y para CPUs, aunque no se documentan latencias.
- GPU de consumo: si, cabe en tarjetas como RTX 3060, RTX 4060 o superiores. No se especifica el modelo de GPU usado en el entrenamiento, solo que fue una GPU por modelo.
- Opciones de despliegue: al ser un state dict de PyTorch con tokenizador propio, el despliegue pasa por el codigo de nanochat y por `script_tok`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ni pesos en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de identificadores ni fichas de modelos comparables en la informacion proporcionada. La comparacion relevante dentro del propio material es entre las tres semillas, que comparten tokenizador, datos y configuracion, y entre estas y los numeros publicados originalmente:

| Version | Tokenizador | Semilla | Bits por byte (validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este reentrenamiento | `bnd_wpd_caps` (MinGram) | 0 | 0,87660 | Apache 2.0 | Pesos publicados en HuggingFace |
| Este reentrenamiento | `bnd_wpd_caps` (MinGram) | 1 | 0,87570 | Apache 2.0 | Pesos publicados en HuggingFace |
| Este reentrenamiento | `bnd_wpd_caps` (MinGram) | 2 | 0,87615 | Apache 2.0 | Pesos publicados en HuggingFace |
| Modelos publicados en el articulo | `bnd_wpd_caps` (MinGram) | 0 | 0,87625 | no disponible | Checkpoints perdidos |

## Limitaciones y advertencias

- Modelo base, no ajustado a instrucciones: no sigue ordenes ni formatos de chat, por lo que no debe usarse directamente como asistente.
- Solo ingles: el tokenizador se entreno sobre una muestra de FineWeb en ingles y el modelo no tiene cobertura multilingue.
- Contexto corto: 2.048 tokens, muy inferior a los modelos actuales de uso general, lo que limita tareas de contexto largo.
- Presupuesto de entrenamiento minimo: 1,34 mil millones de tokens, insuficiente para esperar conocimiento factual fiable; el riesgo de alucinacion en consultas factuales es alto.
- No es reproducible bit a bit: el propio autor advierte de que el entrenamiento en GPU no es determinista y que los resultados difieren ligeramente de los publicados, con desviaciones de hasta +0,00035 bits por byte.
- Dependencia de codigo heredado: el tokenizador usa una clase de codigos de caso que ya no existe en `script_tok`; sin copiar `legacy_extcaps_pretokenizer.py` a `paper_utils/boundary/`, la carga falla.
- Metrica poco convencional: el resultado publicado es bits por byte sobre validacion, no exactitud en tareas, por lo que no es comparable con tablas de MMLU o HumanEval.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al tratarse de un artefacto de investigacion con cero descargas y cero *likes* en el momento de la consulta, no hay garantia de mantenimiento ni soporte.
- Sin cuantizaciones publicadas: no hay GGUF ni pesos de 8 o 4 bits, de modo que el despliegue eficiente en CPU o en GPUs muy limitadas exige convertir los pesos uno mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-en-d12-bnd_wpd_caps-mingram
- Articulo: Explicit Boundary Markers for Subword Vocabularies, arXiv:2608.08847 (https://arxiv.org/abs/2608.08847)
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Repositorio script_tok: https://github.com/sanderland/script_tok
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados no guardan relacion con el contenido de la ficha.
