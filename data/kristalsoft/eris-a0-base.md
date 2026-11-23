# kristalsoft/Eris-A0-Base

## Resumen

Eris A0 Base es un modelo de lenguaje de 338 millones de parámetros desarrollado por Kristalsoft (Eren Koçakgöl) y entrenado desde cero sobre 9.630 millones de tokens. Se trata de un transformer decoder-only con tokenizador propio (BPE byte-level de 65.536 entradas) y una arquitectura diseñada específicamente para turco e inglés, con atención híbrida local/global y Grouped-Query Attention. Su publicación es relevante porque los modelos pequeños entrenados desde cero para turco siguen siendo escasos: la mayoría de alternativas en ese rango de tamaño son modelos multilingües genéricos o adaptaciones de modelos ingleses.

El modelo se distribuye como base preentrenada, no ajustada a instrucciones: su función es continuar texto y servir como punto de partida para fine-tuning. La ventana de contexto es de 4.096 tokens y los pesos están en bfloat16 y safetensors, con licencia Apache-2.0 tanto para los pesos como para el código del modelo.

Con 338 millones de parámetros y un coste de cómputo estimado de 2×10^19 FLOPs, el entrenamiento se realizó en una única TPU de Google Cloud (Colab TPU v6e-1, parcialmente v5e-1), lo que lo convierte en un caso interesante de entrenamiento de un modelo desde cero con recursos muy limitados. El autor publica además una variante Instruct para uso conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm, entrenado desde cero |
| Parametros totales | 338.087.936 (271,0M cuerpo del transformer + 67,1M embedding atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Turco, ingles (ademas de codigo y matematicas en el corpus) |
| Licencia | Apache-2.0 (pesos y codigo del modelo) |
| Formato de pesos | safetensors (bfloat16) |

Otros datos tecnicos: vocabulario de 65.536 entradas (BPE byte-level, tokenizador propio), 24 capas, hidden size 1024, feed-forward SwiGLU de 2816, RMSNorm, 16 cabezas de query y 4 de key/value con dimension de cabeza 64, RoPE con base 10.000 en capas locales y 1.000.000 en globales, embeddings de entrada/salida atados y soft-capping de logits con tanh a 30.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 24 capas con pre-norm y RMSNorm. La innovación principal está en la atención: usa Grouped-Query Attention (16 cabezas de query, 4 de key/value) y atención híbrida, donde 3 de cada 4 capas emplean una ventana local deslizante de 1.024 tokens y cada cuarta capa es global. Añade QK-norm y una compuerta sigmoide por cabeza en la salida de atención. El tokenizador es un BPE byte-level propio de 65.536 entradas, con dígitos separados uno a uno, normalización NFC y sin reglas de contracciones inglesas, de modo que los sufijos turcos tras apóstrofo se mantienen intactos. La fertilidad medida es de aproximadamente 1,53 tokens por palabra turca y 1,29 por palabra inglesa.

El entrenamiento cubrió 9.630 millones de tokens (18.360 pasos de 524.288 tokens), con secuencias de 4.096 tokens, batch de 128 secuencias, precisión bfloat16 y un schedule warmup-stable-decay. La ejecución se detuvo al 96 % de los 19.074 pasos previstos, ya en fase de decay. La mezcla de datos fue: 45 % fineweb-edu (muestra 10BT), 35 % FineWeb2-HQ turco (`tur_Latn`), 13 % github-code-clean (solo ficheros MIT y Apache-2.0) y 7 % finemath-4plus. Los documentos se empaquetaron con separador `<|endoftext|>` y la atención no cruzaba fronteras de documento durante el entrenamiento. No se documenta RLHF ni DPO: es un modelo puramente preentrenado.

## Capacidades

- Generación y continuación de texto en turco e inglés, sin ajuste a instrucciones.
- Modelado de lenguaje base: útil para perplejidad, scoring y tareas de clasificación o extracción tras fine-tuning.
- Cobertura de código (13 % del corpus, lenguajes presentes en github-code-clean con licencias permisivas).
- Cobertura de matemáticas básicas (7 % de finemath-4plus), aunque el autor advierte que el rendimiento aritmético es débil a este tamaño.
- Tokenización específica para turco que preserva sufijos tras apóstrofo, lo que favorece tareas de normalización y análisis morfológico.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso de forma fiable (modelo base sin entrenamiento de instrucciones).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Fine-tuning para clasificación de texto en turco: el modelo base puede adaptarse con una cabeza de clasificación sobre el hidden state para tareas como detección de spam, categorización de noticias o análisis de sentimiento, aprovechando su tokenizador orientado al turco.
- Extracción de entidades y normalización de texto: su tokenización que preserva sufijos turcos tras apóstrofo facilita tareas de NER y normalización de fechas, nombres o direcciones mediante fine-tuning supervisado.
- Modelo de lenguaje para scoring y perplejidad: útil como componente de evaluación o reranking en pipelines de PLN turco, dado su bajo coste de inferencia (338M parámetros).
- Generación asistida en dominios acotados: tras fine-tuning con datos propios, puede emplearse para autocompletado o redacción de plantillas en atención al cliente, siempre con revisión humana por su tendencia a la alucinación.
- Desarrollo de correctores o asistentes de escritura en turco: el modelo puede afinarse para sugerir continuaciones o detectar anomalías lingüísticas en textos, aprovechando su ventana de 4.096 tokens para párrafos completos.
- Investigación en modelos pequeños desde cero: sirve como referencia reproducible (código Apache-2.0, hardware documentado) para estudiar el efecto de la atención híbrida y el tokenizador en lenguas aglutinantes.
- Prototipado en local: con 338M parámetros en bfloat16 (aproximadamente 0,7 GB de pesos), puede ejecutarse en portátiles y entornos sin GPU dedicada para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados completos (TurkishMMLU, Belebele-TR, FLORES bits per byte y tareas cloze) frente a otros modelos pequeños, incluidos modelos turcos de menos de 1B de parámetros, se añadirán más adelante.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en bfloat16 (tamaño del repo); en float32, alrededor de 1,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la arquitectura propia en `modeling_eris.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF publicados limita el despliegue en llama.cpp/Ollama sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Eris A0 Base | 338M | 4.096 | Turco, ingles | Apache-2.0 | Entrenado desde cero, tokenizador propio, atencion hibrida |
| Modelos turcos <1B (referenciados en la model card) | no disponible | no disponible | Turco | no disponible | La model card anuncia comparacion futura sin datos publicados |
| Alternativas multilingues pequenas | no disponible | no disponible | Multiples | no disponible | No se aportan datos concretos en la informacion disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Es un modelo base: continúa texto y no sigue instrucciones; para uso conversacional debe emplearse la variante Instruct.
- Tiende a producir texto fluido pero factualmente incorrecto, especialmente en nombres, fechas y cifras.
- Razonamiento, aritmética y código son débiles a este tamaño, según el propio autor.
- Entrenado con datos web sin entrenamiento de seguridad: puede reproducir sesgos, estereotipos y contenido ofensivo.
- Ventana de contexto limitada a 4.096 tokens; no apta para documentos largos sin estrategias de troceado.
- El código de inferencia publicado trata toda la entrada como un único documento, lo que difiere del entrenamiento solo si el prompt contiene `<|endoftext|>` en medio.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_eris.py` antes de usarlo en producción.
- La licencia Apache-2.0 cubre pesos y código, pero los datos de entrenamiento conservan sus propias licencias (ODC-By, MIT, Apache-2.0), lo que puede afectar a la reproducibilidad del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kristalsoft/Eris-A0-Base
- Variante Instruct: https://huggingface.co/kristalsoft/Eris-A0-Instruct
- Demo en Spaces: https://huggingface.co/spaces/kristalsoft/Eris-A0
- Repositorio GitHub (modelo, evaluación, demo): https://github.com/kristalsoft-software/eris-a0
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Contacto del autor: destek@kristalsoft.com.tr
