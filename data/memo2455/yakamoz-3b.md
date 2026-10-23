# Memo2455/Yakamoz-3B

## Resumen

Yakamoz-3B es un ajuste fino (fine-tune) de Qwen2.5-3B-Instruct, con 3.085.938.688 parámetros, publicado por el autor Memo2455 como proyecto de bootcamp. El modelo encarna a Yakamoz, la asistente de atención al ciudadano de la Martıkent Belediyesi, un ayuntamiento ficticio turco: responde dudas sobre abonos de agua, impuesto de bienes inmuebles (emlak vergisi), bodas civiles, aparcamiento municipal o instalaciones deportivas. Para hacerlo combina un guía municipal consultado por RAG, una tabla CSV con horarios y tarifas de instalaciones y una herramienta propia de cálculo de tarifas de aparcamiento (otopark_ucreti).

Se entrenó con QLoRA (r=16, alpha=32, 3 épocas) sobre 470 conversaciones sintéticas generadas con Gemini, en una T4 gratuita de Colab y en unos 30 minutos. Con pesos en safetensors (6,2 GB) y versión GGUF disponible, es sobre todo un ejemplo didáctico y reproducible de cómo construir, evaluar y desplegar un agente RAG especializado en un modelo pequeño, más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen2/Qwen2.5) |
| Parametros totales | 3.085.938.688 (≈3,09 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32768 tokens (heredado de Qwen2.5-3B-Instruct; no confirmado en la model card) |
| Tipos de cuantizacion | Entrenamiento: 4 bits (QLoRA). Inferencia: pesos en precisión completa (safetensors, 6,2 GB) y versiones GGUF (cuantizaciones concretas no especificadas) |
| Idiomas soportados | Turco (tr); el modelo base es multilingüe, pero el ajuste solo está evaluado en turco |
| Licencia | qwen-research (Qwen Research License, uso no comercial) |
| Formato de pesos | safetensors (repositorio principal, 6,2 GB), GGUF (repositorio aparte), adaptador LoRA (PEFT) |

## Arquitectura y entrenamiento

Yakamoz-3B parte del transformer decoder denso de Qwen2.5-3B-Instruct y no modifica la arquitectura: el ajuste se realizó con QLoRA a 4 bits sobre todas las capas lineales, con r=16, alpha=32, tasa de aprendizaje 2e-4 y 3 épocas. El entrenamiento se ejecutó en una T4 gratuita de Colab (tamaño de fragmento 2, acumulación 8) y duró 29,7 minutos, con una pérdida de test que descendió de 0,35 a 0,20 y luego a 0,19, sin señales de memorización según el autor. No se menciona ningún post-entrenamiento tipo RLHF o DPO: es un SFT con QLoRA.

Los datos son 548 conversaciones sintéticas generadas con Gemini y depuradas por reglas automáticas (26 eliminadas: 24 sin la marca distintiva del personaje y 2 duplicadas), de las que 470 se usaron para entrenar y 52 para test. Cubren cuatro categorías: identidad, RAG, agente y agente multi-paso. El autor detectó y corrigió un error de numeración en los ejemplos multi-paso que mezclaba preguntas y respuestas, lo que elevó los ejemplos de agente en dos turnos de 20 a 38. Como aportación destacable, más técnica que metodológica, el proyecto incluye una evaluación sistemática con métricas propias y un juez LLM (Gemini, escala 1/0,5/0).

## Capacidades

- Generación de texto en turco con identidad y estilo propios: el modelo responde como Yakamoz en lugar de identificarse como Qwen (nombre 0,00 → 0,70; marca distintiva 0,00 → 1,00).
- Respuestas basadas en RAG sobre el guía municipal: cita tarifas, plazos y normas concretas; sabe rechazar preguntas cuya respuesta no está en el guía ("esta información no está en el guía"), aunque esta conducta está poco medida.
- Tool calling: invoca la herramienta otopark_ucreti para calcular tarifas de aparcamiento según duración (herramienta correcta 0,35 → 0,88; JSON del agente 0,88 → 1,00).
- Agente multi-paso: encadena guía, tabla CSV y cálculo en preguntas compuestas (0,35 → 0,88 en ejemplos de dos turnos).
- Sin capacidades de visión, audio ni modo de razonamiento explícito; no está evaluado en código ni en matemáticas generales.
- El multilingüismo heredado del modelo base no se ha evaluado tras el ajuste.

## Casos de uso

- Chatbot municipal de demostración: gestiona conversaciones multi-turno sobre trámites (reconexión de agua, emlak vergisi, bodas, aparcamiento, instalaciones deportivas) apoyándose en RAG para citar tarifas y plazos exactos del guía en lugar de inventarlos.
- Plantilla educativa de fine-tuning eficiente: el cuaderno de Colab público permite reproducir un QLoRA completo en una T4 gratuita en menos de 30 minutos, útil como ejercicio de formación en ajuste de LLMs.
- Prototipo de RAG con evaluación automática: el pipeline incluye métricas propias (rechazo fuera del guía, marca de cita) y un juez LLM con escala 1/0,5/0, un esquema replicable en otros dominios verticales.
- Agente con tool calling simple: el patrón de otopark_ucreti (cálculo paramétrico de tarifas con salida JSON) sirve de referencia para integrar funciones propias en un modelo de 3B.
- Base de adaptación a organismos reales: sustituyendo el guía ficticio, la tabla CSV y el dataset por documentación real de un ayuntamiento u otra institución, el mismo método produciría un asistente análogo.
- Ejemplo de generación de datos sintéticos: muestra el ciclo completo (generación con Gemini, limpieza por reglas, corrección manual de errores), con lecciones prácticas sobre fallos típicos de este enfoque.
- Despliegue local en hardware modesto: la versión GGUF permite ejecutar el asistente con llama.cpp u Ollama en portátiles o CPUs, adecuado para demos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, GSM8K, HumanEval, etc.). El autor sí publicó métricas propias sobre su test set privado (52 ejemplos), comparando el modelo base con Yakamoz-3B:

| Métrica (test set del autor) | Base (Qwen2.5-3B-Instruct) | Yakamoz-3B |
|---|---|---|
| Identidad: nombre | 0,00 | 0,70 |
| Identidad: marca distintiva | 0,00 | 1,00 |
| Agente: JSON válido | 0,88 | 1,00 |
| Agente: herramienta correcta | 0,35 | 0,88 |
| Agente: multi-paso | 0,35 | 0,88 |
| RAG: rechazo fuera del guía | 0,00 | 0,00 |
| RAG: puntuación del juez | 0,40 | 0,70 |
| RAG: marca de cita | 0,33 | 1,00 |

Adicionalmente, 16 preguntas de prueba evaluadas por un juez Gemini (escala 1/0,5/0) obtuvieron una media de 0,81. En la comparación de RAG, el modelo sin contexto inventaba cifras (150 TL/día de aparcamiento, "30 días" para el emlak vergisi), mientras que con RAG dio los valores correctos del guía (250 TL/día, 31 de mayo). La métrica de rechazo fuera del guía (0,00 en ambos modelos) se calculó con solo 2 ejemplos, por lo que el autor la considera poco representativa: en las preguntas de prueba el modelo sí respondió correctamente "no está en el guía".

## Requisitos de hardware

- Pesos completos (safetensors, 6,2 GB): unos 8 GB de VRAM estimados para inferencia en precisión completa contando KV cache y overhead; cabe en una RTX 3060 12 GB, RTX 4060 Ti o una T4 16 GB de Colab.
- Cuantizado a 8 bits: unos 3,5-4 GB de VRAM (estimación según tamaño de pesos).
- Cuantizado a 4 bits (GGUF): unos 2-2,5 GB; viable en CPU, portátiles y GPUs modestas (GTX 1650, RTX 2060, Apple Silicon).
- Entrenamiento: el autor demostró QLoRA a 4 bits completo en una T4 gratuita de 16 GB en 29,7 minutos.
- Despliegue: llama.cpp y Ollama mediante el repositorio GGUF oficial; transformers con PEFT usando el adaptador LoRA; vLLM o TGI para servir en precisión completa (sin configuraciones publicadas).
- Latencia y throughput: no publicados. El autor solo indica que, frente a la variante 1,5B que descartó, el entrenamiento y las respuestas son aproximadamente el doble de lentos con los 3B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Yakamoz-3B | 3,09B | 32768 tokens (heredado) | Qwen Research (no comercial) | Asistente municipal turco (RAG + agente) |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32768 tokens | Qwen Research (no comercial) | Generalista multilingüe |
| Llama-3.2-3B-Instruct | 3,21B | 131072 tokens | Llama 3.2 Community (comercial con condiciones) | Generalista multilingüe |
| Gemma-2-2b-it | 2,61B | 8192 tokens | Gemma (comercial con condiciones) | Generalista multilingüe |

Nota: la comparación es a nivel de categoría (modelos instruct de ~3B). Ninguno de los generalistas incluye el comportamiento municipal ajustado de Yakamoz; a cambio, ofrecen benchmarks públicos estandarizados y, en el caso de Llama 3.2, una licencia comercial más flexible.

## Limitaciones y advertencias

- Licencia no comercial: la Qwen Research License prohíbe el uso comercial del modelo y de sus derivados; los repositorios deben mantener el texto de licencia y el archivo NOTICE.
- Dominio ficticio y muy estrecho: las tarifas, horarios y normas de la Martıkent Belediyesi no son reales; el modelo no sirve para producción sin reentrenar con datos reales.
- Dataset sintético reducido: 470 ejemplos generados con Gemini; riesgo de heredar sesgos y errores del generador (el propio autor encontró fallos de numeración que corrompían los ejemplos multi-paso).
- Rechazo fuera del guía poco fiable: la métrica correspondiente dio 0,00 en ambos modelos y solo se midió con 2 ejemplos; sin RAG, el modelo inventa cifras con total seguridad.
- Razonamiento aritmético comparativo débil: la pregunta sobre si conviene el abono mensual de aparcamiento (cálculo multi-paso) puntuó 0,0.
- Solo evaluado en turco: el comportamiento en otros idiomas y el posible deterioro de las capacidades generales del modelo base (olvido catastrófico) no se han medido.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha; la model card está además truncada al final.
- Cuantizaciones GGUF concretas no detalladas en la información disponible.

## Enlaces

- Modelo: https://huggingface.co/Memo2455/Yakamoz-3B
- Adaptador LoRA: https://huggingface.co/Memo2455/Yakamoz-3B-LoRA
- Versión GGUF: https://huggingface.co/Memo2455/Yakamoz-3B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Memo2455/yakamoz-3b-veri
- Cuaderno de Colab: https://colab.research.google.com/drive/1B2aD76sy1FLgXY6ei-pEZOmCnc7ojWey?usp=sharing
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia (Qwen Research License): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
