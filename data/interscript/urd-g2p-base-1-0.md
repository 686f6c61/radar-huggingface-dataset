# Interscript/urd-g2p-base-1.0

## Resumen

`urd-g2p-base-1.0` es un modelo de conversión grafema-a-fonema (G2P) para urdú, desarrollado por Interscript dentro de la familia de artefactos de su runtime. Se trata de un modelo seq2seq construido sobre la arquitectura byT5-base, es decir, un transformer encoder-decoder de Google que opera directamente sobre bytes en lugar de sobre un vocabulario de subpalabras, lo que le permite procesar escritura urdú (alfabeto persa-arábigo) sin depender de un tokenizador específico del idioma.

El modelo se ha entrenado sobre el corpus completo `humair025/urdu-g2p-dictionary`, con 610 000 pares grafema-fonema, y se distribuye como artefacto IMF v1 en precisión fp32 con un peso de 2,16 GB. La model card reporta un CER (character error rate) de 15,65 sobre el split de test completo de 12 699 filas, y un CER normalizado de 10,75, lo que supone una mejora marginal frente al tier small de la misma familia (`urd-g2p-1.0`, CER 15,78).

Su relevancia es acotada pero concreta: cubre la necesidad de un front-end fonético para urdú en pipelines de síntesis de voz (TTS), lexicones de pronunciación para reconocimiento de voz (ASR) y herramientas de aprendizaje de pronunciación. La limitación principal es la licencia: el corpus de entrenamiento es no comercial, por lo que los pesos se liberan exclusivamente para investigación, lo que descarta su uso en producción comercial sin una revisión legal adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (byT5-base, operación a nivel de byte) |
| Parámetros totales | no disponible en la model card (la configuración estándar de byT5-base de Google ronda los 580 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (byT5 estándar: 512 tokens) |
| Tipos de cuantización | no disponible; el artefacto publicado es fp32 (IMF v1) |
| Idiomas soportados | urdú (grafemas de entrada); alfabeto fonético de salida no especificado en la model card |
| Licencia | solo investigación (pesos); código BSD-3-Clause |
| Formato de pesos | IMF v1 (artefacto propietario del runtime de Interscript), fp32, 2,16 GB |

## Arquitectura y entrenamiento

El modelo es un seq2seq estándar encoder-decoder basado en byT5-base. La elección de byT5 frente a T5 convencional es coherente con la tarea: al tokenizar a nivel de byte, el modelo evita el sesgo de un vocabulario SentencePiece entrenado mayoritariamente en inglés y maneja de forma nativa la codificación UTF-8 de los caracteres urdú, algo crítico cuando la unidad de entrada es el grafema y la unidad de salida es el fonema. No se documenta en la model card ningún cambio estructural respecto al byT5 original, ni el uso de decodificación especulativa, atención lineal u otras optimizaciones.

El entrenamiento se realizó sobre el corpus completo `humair025/urdu-g2p-dictionary`, con 610 000 pares grafema-fonema; la model card no detalla el número de tokens, la composición exacta del dataset, ni si hubo fases de ajuste con RLHF o DPO (poco probable en una tarea determinista de transliteración fonética). Sí se especifica una decisión metodológica relevante: las métricas reportadas corresponden a decodificación greedy fila a fila, coincidiendo con el modo de decodificación real del runtime, y se invalidaron explícitamente los números previos obtenidos con decodificación por lotes sin máscara de atención (WO51). El artefacto incluye metadatos de paridad con una sonda de 500 filas en el modo de decodificación real.

## Capacidades

- Conversión grafema-a-fonema de palabras y frases en urdú, tarea principal del modelo.
- Procesamiento a nivel de byte, lo que permite manejar sin OOV caracteres urdú poco frecuentes, signos diacríticos y variantes ortográficas.
- Salida fonética serializada carácter a carácter (el formato exacto depende del artefacto IMF v1 del runtime).
- Ejecución en modo de decodificación greedy fila a fila, validada con sonda de paridad de 500 filas.
- Capacidad multilingüe: no disponible; el modelo está especializado en urdú.
- Tool calling / function calling: no soportado (no es un modelo instruccional).
- Razonamiento multi-paso y uso como agente: no soportado.
- Modo thinking, visión o audio: no soportado.

## Casos de uso

- Front-end de pronunciación para TTS en urdú: el modelo convierte el texto de entrada en una secuencia de fonemas que alimenta un sintetizador acústico; su entrenamiento sobre 610 000 pares y un CER del 15,65 lo hace utilizable como componente de un pipeline de voz, siempre en contexto de investigación.
- Generación de lexicones de pronunciación para ASR: se puede volcar el diccionario completo a representación fonética para construir el léxico de un decodificador de reconocimiento de voz en urdú, incluyendo palabras con ortografía ambigua.
- Aprendizaje de idioma y diccionarios de pronunciación: integrado en una herramienta de estudio que muestre la transcripción fonética de una palabra urdú introducida por el usuario, aprovechando que la inferencia es rápida en GPU de consumo.
- Normalización fonética de corpus lingüísticos: procesamiento por lotes (con máscara de atención) de corpus de texto urdú para anotar pronunciación en estudios de fonología o en la construcción de datasets de voz.
- Alineamiento texto-hablado en investigación en fonética: la salida fonética sirve como representación intermedia para comparar realizaciones acústicas reales con la pronunciación canónica esperada.
- Búsqueda fonética en catálogos de contenido en urdú: indexación por fonemas en lugar de grafemas para tolerar variantes ortográficas en consultas de usuarios.
- Prototipado de sistemas de transliteración urdú→IPA: punto de partida para investigación en sistemas de escritura y conversión entre alfabetos, dado que el modelo ya aprende el mapeo grafema-fonema subyacente.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de test completo de 12 699 filas (CER por carácter, media por fila):

| Métrica | urd-g2p-base-1.0 | urd-g2p-1.0 (tier small, baseline) |
|---|---|---|
| CER bruto | 15,65 | 15,78 |
| CER normalizado | 10,75 | no disponible |
| Split de evaluación | 12 699 filas (test completo) | 12 699 filas (test completo) |
| Modo de decodificación | greedy, fila a fila | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no son aplicables a una tarea de G2P. Tampoco se reportan métricas de palabra completa (WER a nivel de palabra) ni comparación contra herramientas G2P externas.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto fp32 ocupa 2,16 GB, por lo que la inferencia en fp32 requiere del orden de 4-6 GB de VRAM incluyendo activaciones y overhead del runtime (estimación, no confirmada en la model card).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; una RTX 4090, A100 o H100 funcionan sobradamente, pero están infrautilizadas para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660 6 GB, RTX 3060 12 GB, RTX 4060 Ti y superiores. No confirmado por el autor.
- Opciones de despliegue: el artefacto es IMF v1, formato propio del runtime de Interscript, por lo que el despliegue estándar pasa por ese runtime. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo byT5, sería exportable a safetensors para servirlo con TGI o con transformers, pero la conversión no está documentada.
- Latencia y throughput: no disponibles. La model card solo indica que el modo de decodificación validado es greedy fila a fila, lo que implica que el procesamiento por lotes sin máscara de atención no es fiable con este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (test 12 699) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| urd-g2p-base-1.0 | no disponible (~580 M por la base byT5) | no disponible | 15,65 bruto / 10,75 normalizado | solo investigación | HuggingFace (Interscript) |
| urd-g2p-1.0 (tier small) | no disponible | no disponible | 15,78 bruto | no disponible | misma familia Interscript |
| Herramientas G2P rule-based para urdú (p. ej. Epitran) | no aplica (basadas en reglas) | no aplica | no disponible | variables | no disponible en la información proporcionada |

No se dispone de datos comparativos contra otros modelos neuronales de G2P para urdú en la información proporcionada.

## Limitaciones y advertencias

- Licencia RESEARCH-ONLY: los pesos se liberan solo para investigación debido a que el corpus `humair025/urdu-g2p-dictionary` es no comercial. Cualquier uso en producto comercial requiere autorización explícita; el código asociado sí es BSD-3-Clause.
- El CER del 15,65 % implica que aproximadamente uno de cada seis caracteres fonéticos generados es incorrecto; inaceptable sin revisión humana en aplicaciones de diccionario o enseñanza.
- La mejora frente al tier small es marginal (15,65 frente a 15,78), lo que sugiere rendimientos decrecientes del escalado en esta tarea con este corpus.
- Sesgos conocidos: no documentados. Al entrenarse sobre un único diccionario, el modelo hereda la variedad dialectal y las convenciones de transcripción de ese corpus, no necesariamente representativas de todo el urdú.
- Riesgo de alucinación: bajo en el sentido de contenido inventado, pero alto en el sentido de producir fonemas plausibles aunque incorrectos en palabras con ortografía ambigua o préstamos (árabe, persa, inglés).
- Limitaciones de contexto: no documentadas; la longitud máxima de entrada efectiva depende de la configuración de byT5 y no se explicita, por lo que las entradas largas (frases completas) no están validadas.
- Advertencia de producción: los números previos del harness por lotes fueron invalidados por el propio autor (sin máscara de atención). Cualquier evaluación propia debe replicar el modo greedy fila a fila para ser comparable.
- El formato IMF v1 es propietario del runtime de Interscript; no hay garantía de portabilidad ni de soporte a largo plazo.
- No se especifica el alfabeto fonético de salida ni si la salida es IPA; conviene verificarlo antes de integrar con un sintetizador concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Interscript/urd-g2p-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/humair025/urdu-g2p-dictionary
- Repositorio del corpus (licencia no comercial): https://github.com/humair-m/urdu-g2p
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente contenido no relacionado, por lo que no se incluyen más enlaces.
