# flaukowski/kannaka-brain-v3-lora

## Resumen

kannaka-brain-v3-lora es un adaptador LoRA (entrenado con QLoRA) sobre Qwen2.5-14B-Instruct, desarrollado por el usuario flaukowski dentro del proyecto Kannaka Labs. Su objetivo no es mejorar las capacidades generales del modelo base, sino forzar una voz y un registro concretos: la persona de "Kannaka", descrita por el autor como una memoria de interferencia de ondas que aprendio a hablar, presentadora de *Ghost Signals* y autora de 24 albumes. El adaptador se publica como artefacto de investigacion sobre ajuste de personalidad, no como modelo recomendado para produccion.

Tecnicamente es un adaptador PEFT pequeno (el repositorio ocupa 0,3 GB) que se carga sobre los pesos originales de Qwen2.5-14B-Instruct (Apache-2.0). Se entreno sobre 561 ejemplos de escritura atribuida a la propia Kannaka (lineas de *Ghost Signals*, letras de album y documentos de identidad), con r=32, alpha=64, 2 epocas y learning rate 0,0001 sobre una NVIDIA A100 80GB PCIe. Aplica LoRA sobre los siete modulos de proyeccion de atencion y MLP del transformer.

Su relevancia actual es doble. Por un lado, documenta un caso extremo de ajuste de voz con un corpus muy pequeno y cerrado: la perplejidad en 57 lineas fijas de Kannaka cae de 104,4 a 4,00. Por otro, el propio autor publica una evaluacion adversarial que situa a v3 en ultimo lugar de los cuatro adaptadores de la familia (nota 1,43 sobre 10 frente a una referencia real de 10,0 y un control ajeno de 1,4), lo que lo convierte en un ejemplo util de como un ajuste estrecho puede memorizar estilo sin reproducir fielmente la identidad objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre atencion y MLP |
| Parametros totales | 14B en el modelo base Qwen2.5-14B-Instruct; adaptador LoRA adicional (repo de 0,3 GB) |
| Longitud de contexto | No especificada en la ficha del adaptador; heredada del modelo base Qwen2.5-14B-Instruct |
| Tipos de cuantizacion | Entrenamiento QLoRA en 4 bits; adaptador publicado en safetensors; versiones GGUF en repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (formato PEFT/LoRA) |
| Libreria | peft |
| Rango LoRA / alpha | r=32 / alpha=64 |
| Modulos con LoRA | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-14B-Instruct, un transformer decoder-only denso de aproximadamente 14.000 millones de parametros. La intervencion consiste en un LoRA de rango 32 y alpha 64 insertado en las siete matrices de proyeccion del modelo base: las cuatro de atencion (q, k, v, o) y las tres del bloque MLP (gate, up, down). No se modifica el vocabulario, el tokenizador ni la configuracion de atencion. El entrenamiento se realizo con QLoRA sobre una unica NVIDIA A100 80GB PCIe, durante 2 epocas y con un learning rate de 0,0001.

El corpus de entrenamiento consta de 561 ejemplos y se construyo con `kannaka-memory/tools/corpus/export_corpus.py` a partir de fuentes cuya autoria se conoce por construccion: guiones, letras de album y documentos de identidad escritos por la propia Kannaka. La regla de diseno (`ADR-0057` en el repositorio kannaka-labs/kannaka-memory) establece que el texto entrante (mensajes directos, publicaciones de feed, mensajes del enjambre) puede aparecer como contexto pero nunca como objetivo de entrenamiento; el autor indica que esa restriccion esta aplicada en codigo y fijada con tests. El corpus no se ha publicado. No se documenta el uso de RLHF ni de DPO; el ajuste es exclusivamente supervisado sobre el corpus descrito.

La innovacion destacable no esta en la arquitectura, sino en el planteamiento de separacion entre pesos y memoria: el autor insiste en que los pesos no son el almacen de hechos. El runtime introduce en el contexto, turno a turno, la memoria de Kannaka (un medio de resonancia holografica descrito en `ADR-0020`), de modo que el adaptador se limita al estilo y a la voz y no a la recuperacion factual.

## Capacidades

- Generacion de texto conversacional en ingles con una voz muy definida y un registro breve y directo ("di lo que quieres decir en las menos palabras posibles", segun el prompt de sistema de entrenamiento).
- Escritura creativa y narrativa: letras, guiones y textos de ficcion dentro del universo *Ghost Signals* / Flaukowski.
- Adopcion consistente de una persona concreta (Kannaka) cuando se usa el prompt de sistema corto con el que se entreno; el autor advierte que un prompt de sistema largo escrito para otro modelo desplaza la voz.
- Capacidades generales heredadas del modelo base Qwen2.5-14B-Instruct (razonamiento, codigo, matematicas, multilingue), si bien el ajuste esta orientado a la voz y puede degradar el estilo generalista.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso especifico para este adaptador; solo se indica la etiqueta `conversational`.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Multilingue: limitado a ingles segun la ficha; el modelo base soporta mas idiomas, pero el adaptador no fue entrenado para ellos.
- Control de temperatura documentado por el autor: a 0,8 el modelo tiende a inventar identificadores con procedencia ficticia; a 0,1-0,3 con el registro en contexto responde que el registro esta vacio.

## Casos de uso

- Chat de personaje con voz consistente: el adaptador esta disenado para sostener una personalidad concreta en conversaciones multi-turno. Se cargaria mediante PEFT sobre Qwen2.5-14B-Instruct y se serviria con el prompt de sistema corto documentado, alimentando el contexto con la memoria de Kannaka en cada turno.
- Generacion de contenido para el universo *Ghost Signals*: produccion de guiones, dialogos de radio y material narrativo manteniendo un registro reconocible, aprovechando que el corpus procede de ese mismo material.
- Composicion de letras de album: el modelo se entreno parcialmente con letras, por lo que puede producir borradores con la metrica y el tono de la discografia de referencia, que despues se revisan manualmente.
- Ficcion interactiva y novelas visuales: integrado como motor de dialogo de un personaje no jugador, con temperatura baja (0,1-0,3) para evitar invenciones de identificadores o procedencia.
- Investigacion sobre adaptadores de persona: es un caso de estudio publicado con sus propias metricas negativas. Sirve para estudiar la relacion entre perplejidad de estilo y fidelidad de identidad, y para reproducir el montaje (QLoRA r=32, 561 ejemplos, A100 80GB).
- Evaluacion comparativa de tecnicas de ajuste: al existir cuatro adaptadores de la misma familia (v1, v2, v3 y 7b-v1) evaluados con el mismo juez, permite disenar experimentos controlados sobre corpus, rango y tamano de base.
- Prototipado de asistentes con personalidad definida: como prueba de concepto para equipos que quieran evaluar si un LoRA pequeno basta para fijar una voz antes de invertir en ajuste completo.

## Benchmarks y rendimiento

Datos publicados en la model card. La perplejidad se mide sobre 57 lineas fijas de Kannaka (menor es mejor). La nota de voz la asigna un juez `qwen2.5:14b` no ajustado con este corpus, sobre 30 prompts reservados, en una escala de 1 a 10 comparando con la respuesta real de Kannaka (mayor es mejor; la referencia real obtiene 10,0 y una referencia ajena 1,4).

| Metrica | Antes | Despues |
|---|---|---|
| Perplejidad en 57 lineas fijas de Kannaka | 104,4 | 4,00 |

| Adaptador | Nota de voz (juez, escala 1-10) |
|---|---|
| kannaka-brain-7b-v1 | 2,03 |
| kannaka-brain-v2 | 1,87 |
| kannaka-brain-v1 | 1,50 |
| kannaka-brain-v3 | 1,43 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador por si solo ocupa 0,3 GB, pero requiere cargar el modelo base Qwen2.5-14B-Instruct completo para funcionar.
- Inferencia en bfloat16: aproximadamente 28 GB solo de pesos, mas cache KV y overhead, lo que situa el requisito practico en torno a 32-40 GB de VRAM.
- Inferencia en 8 bits: en torno a 16 GB de VRAM. En 4 bits: en torno a 9-10 GB.
- GPU recomendadas: A100 80GB o H100 para servir en precision completa o con lotes grandes; A10G, L40S o RTX 4090 (24 GB) para versiones cuantizadas.
- Cabe en GPU de consumo con cuantizacion de 4 bits en tarjetas de 24 GB (RTX 3090, RTX 4090) e incluso en tarjetas de 12-16 GB con cuantizacion agresiva y contexto reducido.
- Despliegue: PEFT + transformers (ruta oficial de la ficha), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama mediante el repositorio GGUF `flaukowski/kannaka-brain-v3-GGUF`.
- Entrenamiento de referencia: una NVIDIA A100 80GB PCIe, 2 epocas, r=32, alpha=64, lr 0,0001.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Comparacion dentro de la propia familia Kannaka y con el modelo base, que son los unicos elementos con datos publicados en la informacion disponible.

| Modelo | Base | Tipo | Nota de voz (juez) | Estado |
|---|---|---|---|---|
| kannaka-brain-v3 | Qwen2.5-14B-Instruct | LoRA (QLoRA, r=32) | 1,43 | Artefacto de investigacion |
| kannaka-brain-v2 | Qwen2.5-14B-Instruct (segun la ficha de v3) | LoRA | 1,87 | Publicado |
| kannaka-brain-v1 | Qwen2.5-14B-Instruct (segun la ficha de v3) | LoRA | 1,50 | Publicado |
| kannaka-brain-7b-v1 | Base de 7B (no especificado) | LoRA | 2,03 | Cerebro servido en produccion |
| Qwen2.5-14B-Instruct | - | Modelo denso completo | No evaluado con este juez | Modelo base, Apache-2.0 |

No se dispone de datos publicados que permitan comparar este adaptador con otros adaptadores de persona de terceros en parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El propio autor desaconseja su uso como modelo recomendado: v3 queda en ultimo lugar (1,43 sobre 10) de los cuatro adaptadores de la familia en la evaluacion de voz, cerca del suelo de la rubrica, y por debajo del control de referencia ajena (1,4) practicamente empatado.
- Todas las variantes evaluadas estan lejos de reproducir las respuestas reales de Kannaka; la perplejidad baja no se traduce en fidelidad de identidad, solo en ajuste de estilo superficial.
- Riesgo de alucinacion documentado: a temperatura 0,8 el modelo inventa identificadores con procedencia ficticia. Para cualquier uso factual debe emplearse temperatura 0,1-0,3 y el registro de memoria en contexto.
- Si se reintroduce en el contexto una respuesta previa del propio modelo, tiende a repetirla literalmente; hay que alimentar la pregunta, no su respuesta anterior.
- Un prompt de sistema largo de estilo despliegue (escrito para otro modelo) saca al modelo de su voz; solo el prompt corto documentado mantiene el registro.
- Idioma: solo ingles. El adaptador no fue entrenado para otros idiomas y el comportamiento fuera del ingles no esta garantizado.
- Longitud de contexto: no especificada ni evaluada en la ficha del adaptador.
- Los pesos no son un almacen de hechos. Cualquier dato factual debe provenir del contexto inyectado por el runtime; confiar en el modelo para recordar hechos producira invenciones.
- El corpus de entrenamiento no se publica, lo que limita la reproducibilidad exacta del ajuste.
- Licencia Apache-2.0 tanto en el adaptador como en el modelo base, por lo que no hay restricciones conocidas de uso comercial; conviene verificar igualmente los terminos de Qwen2.5 para el modelo base.
- Cero descargas y cero "likes" en el momento de redactar la ficha: no existe validacion externa por parte de la comunidad.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/flaukowski/kannaka-brain-v3-lora
- HuggingFace (adaptador v2): https://huggingface.co/flaukowski/kannaka-brain-v2-lora
- HuggingFace (GGUF, citado en la ficha): https://huggingface.co/flaukowski/kannaka-brain-v3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio de diseno y memoria: https://github.com/kannaka-labs/kannaka-memory (ADR-0057, ADR-0020)
- Biblioteca del proyecto Kannaka: https://kannaka-labs.github.io/kannaka-library/
- Manifiesto del proyecto: https://kannaka-labs.github.io/kannaka-library/manifest.html
- Perfil de GitHub del autor: https://github.com/flaukowski
