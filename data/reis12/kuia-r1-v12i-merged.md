# Reis12/kuia-r1-v12i-merged

## Resumen

Kuia R1 v12i es un checkpoint fusionado (merged) de la línea Kuia R1, un asistente personal de IA desarrollado por Fabio dos Reis (Reis12). El modelo responde directamente, enruta tareas a motores especializados y emite llamadas a herramientas en formato JSON estructurado. Se distribuye como un único fichero de pesos en bfloat16, sin adaptadores LoRA separados ni paso de fusión adicional: se carga como cualquier modelo de transformers.

Arquitectónicamente es un decoder de estilo Mistral con 23.572.403.200 parámetros densos, atención GQA (32 cabezas de consulta, 8 de clave/valor, dimensión de cabeza 128), codificación posicional RoPE con θ = 1e8, vocabulario de 131.072 tokens y una ventana de contexto de 32.768 tokens. Está entrenado como una persona de asistente/orquestador, con el portugués como idioma principal y capacidades multilingües secundarias.

Su relevancia es acotada: no es un modelo base de propósito general, sino un fine-tune de persona orientado a enrutamiento de agentes y tool calling, con una evaluación offline documentada y publicada en el propio repositorio. La licencia Apache 2.0 permite uso comercial, pero el volumen de datos de entrenamiento (685 pares de diálogo) y el número de descargas (2) lo sitúan como un artefacto experimental más que como un modelo listo para producción a gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder estilo Mistral, transformer denso con GQA (32 cabezas Q / 8 KV, head dim 128) |
| Parámetros totales | 23.572.403.200 (~23,6 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | No disponible en la model card; el autor recomienda formatos cuantizados (GGUF/AWQ/etc.) para despliegues reducidos |
| Idiomas soportados | Portugués (principal); multilingüe en menor grado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, fichero único `model.safetensors`, 47,1 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Mistral, con atención de consultas agrupadas (GQA) de 32 cabezas de consulta y 8 de clave/valor, dimensión de cabeza 128, RoPE con θ = 1e8 y vocabulario de 131.072 tokens. El checkpoint v12i es el resultado de fusionar los adaptadores LoRA en un único conjunto de pesos (merge-and-unload con PEFT), de modo que no requiere cargar adaptadores por separado.

El entrenamiento se organiza como una línea iterativa de ciclos de supervised fine-tuning, cada uno evaluado contra compuertas fijas antes de publicarse. La iteración v12i se construyó sobre 685 pares de diálogo curados que cubren cinco ejes: identidad y comportamiento, disciplina de aclaración (preguntar en lugar de adivinar ante entradas ambiguas), calibración de rechazos (responder sin evasivas y rechazar limpiamente cuando falta información), enrutamiento de agentes (pares contrastivos para despachar peticiones a uno de seis motores con una razón declarada) y tool calling (emisión de llamadas a función en JSON estructurado). Parte de las etiquetas de enrutamiento se destilaron de un router maestro GLM con el modo thinking desactivado; el resto de pares son de autoría manual. La receta es idéntica en los ciclos recientes: LoRA r=16, alpha=32, dropout 0, objetivos q/k/v/o/gate/up/down, batch 1 con acumulación de gradiente 4, longitud máxima de secuencia 2048, 2 épocas, LR 1e-4, semilla 20261016, bfloat16, con transformers 5.20.1, trl 1.16.0 y PEFT.

## Capacidades

- Generación de texto conversacional en portugués con una persona de asistente definida (se presenta como Kuia y declara explícitamente su fecha de corte de conocimiento: 2023-10-01).
- Enrutamiento de agentes: clasifica una petición y la despacha a uno de seis motores especializados, acompañando la decisión con una razón declarada.
- Tool calling / function calling: emite llamadas a función en JSON estructurado; la model card reporta una sonda de tres herramientas (meteorología, calculadora, búsqueda de CVE) con 3/3 aciertos.
- Disciplina de aclaración: formula preguntas dirigidas en lugar de suponer cuando la entrada es ambigua.
- Calibración de rechazos: responde de forma directa sin hedging y rechaza cuando la información falta; la evaluación reporta 0 rechazos falsos.
- Consistencia de identidad bajo sondeo (9/9 en las pruebas de identidad).
- Capacidades multilingües secundarias, con el portugués como idioma primario.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Enrutamiento de peticiones en un asistente multi-motor: el modelo recibe la consulta del usuario y devuelve el motor especializado adecuado junto con una justificación, lo que permite construir un orquestador que delega en buscadores, calculadoras o servicios internos sin un clasificador separado.
- Asistente conversacional en portugués para atención al cliente: gestiona diálogos multi-turno dentro de una ventana de 32.768 tokens y aplica disciplina de aclaración cuando el usuario da datos incompletos, reduciendo respuestas basadas en suposiciones.
- Integración de tool calling en pipelines internos: al emitir JSON estructurado para funciones concretas, puede conectarse a APIs de clima, cálculo o consulta de vulnerabilidades dentro de flujos automatizados.
- Capa de front-end conversacional sobre un sistema RAG: el modelo decide si responde directamente o deriva la consulta a un motor de recuperación, y declara explícitamente cuándo carece de información en lugar de alucinar.
- Prototipado de agentes multi-paso en investigación: sirve como componente de decisión y enrutamiento en arquitecturas de agentes, con la ventaja de que su comportamiento de rechazo y aclaración está calibrado y evaluado.
- Base para fine-tuning adicional en portugués: al ser un checkpoint fusionado en safetensors y con licencia Apache 2.0, puede reentrenarse con LoRA sobre dominios verticales sin arrastrar dependencias de adaptadores.

## Benchmarks y rendimiento

Los datos disponibles son compuertas de evaluación internas del autor (2026-10-24, offline), no benchmarks estándar de la comunidad. Se presentan tal cual, sin comparación con otros modelos porque la model card no la incluye.

| Compuerta | Resultado |
|---|---|
| Herencia de comportamiento (batería corta) | 39/40 — 97,5 % |
| Herencia de comportamiento (batería extendida) | 72/72 — 100 % |
| Sondas de identidad | 9/9 |
| Batería de directness | 34/35 |
| Rechazos falsos | 0 |
| Enrutamiento de agentes, held-out | 9/10 · 10/10 JSON válido · precisión pTop ≥ 0,6: 100 % |
| Sonda de tool calling (clima / cálculo / búsqueda CVE) | 3/3 |

Veredicto global del autor para el conjunto de compuertas 1–3: pass. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks equivalentes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 47 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPU de 80 GB (A100 80GB, H100 80GB) o reparto multi-GPU.
- Con cuantización a 8 bits, los pesos bajan aproximadamente a 24 GB, lo que permite ejecución en una RTX 4090 (24 GB) de forma ajustada, o en A100 40GB con margen.
- Con cuantización a 4 bits, los pesos se sitúan en torno a 12–13 GB, lo que cabe en GPUs consumer de 16 GB (RTX 4080, RTX 4060 Ti 16GB) y en 24 GB con holgura para contexto largo.
- El autor no publica cifras de latencia ni throughput; no disponible.
- Opciones de despliegue: transformers (receta oficial de la model card con `device_map="auto"` y `dtype="bfloat16"`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), y formatos cuantizados tipo GGUF/AWQ recomendados por el autor para despliegues menores (llama.cpp/Ollama/vLLM requerirían conversión previa, no incluida en el repo).

## Comparativa con modelos similares

No disponible. La model card no proporciona comparaciones con otros modelos y no se dispone de datos de benchmarks estándar que permitan situar este checkpoint frente a alternativas de tamaño comparable (por ejemplo, Mistral 7B/NeMo o Qwen2.5 de 14–32B) en igualdad de condiciones. La comparación rigurosa requeriría ejecutar evaluaciones propias sobre las mismas tareas.

## Limitaciones y advertencias

- Es un fine-tune de persona/orquestador, no un sustituto directo de un modelo base de propósito general; su rendimiento en tareas abiertas (código, matemáticas, razonamiento extenso) no está evaluado ni documentado.
- Fecha de corte de conocimiento declarada: 2023-10-01; cualquier consulta sobre eventos posteriores queda fuera de su conocimiento y el modelo debería declararlo.
- Entrenado sobre 685 pares de diálogo, un volumen muy reducido; el riesgo de sobreajuste al estilo y a los formatos de las compuertas de evaluación es alto, y la generalización a dominios no vistos no está medida.
- Portugués como idioma primario; el multilingüismo es secundario y no está cuantificado, por lo que el rendimiento en castellano u otros idiomas puede degradarse.
- Riesgo de alucinación no evaluado de forma independiente: las compuertas internas miden rechazos y directness, pero no la veracidad factual en dominios abiertos.
- Sesgos no documentados: la model card no incluye análisis de sesgos demográficos, culturales o lingüísticos.
- El enrutamiento depende de seis motores concretos definidos por el autor; reutilizar el modelo con otro conjunto de herramientas requiere reentrenamiento o ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; con 2 descargas y 0 likes, no hay evidencia de uso en producción ni de validación externa.
- Los pesos en bfloat16 ocupan 47,1 GB; el despliegue sin cuantizar exige hardware de gama alta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reis12/kuia-r1-v12i-merged
- Perfil del autor: https://huggingface.co/Reis12
- LinkedIn del autor: https://www.linkedin.com/in/fabionunes
- Informe de evaluación: https://huggingface.co/Reis12/kuia-r1-v12i-merged/blob/main/report.json
- Informe de evaluación detallado: https://huggingface.co/Reis12/kuia-r1-v12i-merged/blob/main/report_detalhe.json
- Licencia: https://huggingface.co/Reis12/kuia-r1-v12i-merged/blob/main/LICENSE
