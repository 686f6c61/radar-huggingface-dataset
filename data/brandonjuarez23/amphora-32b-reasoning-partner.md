# brandonjuarez23/Amphora-32B-Reasoning-Partner

## Resumen

Amphora-32B-Reasoning-Partner es un adaptador LoRA (entrenado con QLoRA) publicado por el usuario brandonjuarez23 sobre el modelo base Qwen/Qwen2.5-32B-Instruct. El objetivo declarado del proyecto, a partir de las etiquetas del repositorio, es reducir la adulación (sycophancy) del modelo base e inducir comportamiento de "pushback" o desacuerdo razonado: es decir, que el asistente mantenga posiciones correctas frente a la presión del usuario en lugar de ceder ante premisas erróneas. El repositorio incluye la etiqueta "pre-registered", lo que sugiere que el autor documentó hipótesis y criterios de evaluación antes del entrenamiento.

El modelo se distribuye como adaptador PEFT (no como pesos completos), con un tamaño de repositorio de 1,6 GB, coherente con un adaptador LoRA de rango moderado sobre un modelo de 32 000 millones de parámetros. Al heredar la arquitectura de Qwen2.5-32B-Instruct, conserva las capacidades del base: generación de texto conversacional, contexto largo y soporte multilingüe del modelo original, aunque el autor declara únicamente inglés como idioma del adaptador.

La relevancia del proyecto es metodológica más que de rendimiento bruto: aborda un problema documentado en modelos alineados con RLHF (la tendencia a validar al usuario aunque esté equivocado) y lo hace con un adaptador pequeño y reproducible sobre un base abierto. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, no publica resultados de benchmarks y está sujeto a acceso restringido (gated), por lo que debe tratarse como un artefacto de investigación no validado externamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA (PEFT) sobre transformer decoder-only Qwen2.5-32B-Instruct |
| Parametros totales | 32 000 millones en el modelo base; el adaptador añade un número de parámetros no disponible (repo de 1,6 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; el base Qwen2.5-32B-Instruct soporta hasta 131 072 tokens (dato del modelo base, no verificado para el adaptador) |
| Tipos de cuantizacion | no disponible; el adaptador se entrenó con QLoRA (cuantización del base durante el entrenamiento), pero no se documentan formatos de cuantización para inferencia |
| Idiomas soportados | en (inglés declarado); el base soporta más idiomas, pero el adaptador solo declara inglés |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base Qwen/Qwen2.5-32B-Instruct por separado |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-32B-Instruct, un transformer decoder-only denso de 32 000 millones de parámetros con RoPE, atención con GQA y ventana de contexto nativa de hasta 131 072 tokens en la familia Qwen2.5. El adaptador en sí es un LoRA de bajo rango, y las etiquetas indican que el entrenamiento se realizó con QLoRA (base cuantizado en 4 bits durante el ajuste). El repositorio no detalla el rango, el alpha, los módulos objetivo ni el número de pasos.

En cuanto a datos, las etiquetas "sycophancy", "pushback" y "pre-registered" apuntan a un dataset construido específicamente para medir y contrarrestar la adulación: presumiblemente pares de conversaciones donde el usuario presiona con premisas incorrectas y la respuesta deseada mantiene la posición correcta. No se publica el número de tokens de entrenamiento, la composición del dataset, ni si hubo una etapa de preferencia (DPO/RLHF) adicional sobre el adaptador. La etiqueta "pre-registered" sugiere que el autor fijó métricas y criterios de éxito antes de entrenar, pero el repositorio no incluye el documento de preregistro ni los resultados.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del base Qwen2.5-32B-Instruct.
- Comportamiento de "pushback": el objetivo del adaptador es mantener respuestas correctas ante presión del usuario, corrigiendo premisas erróneas en lugar de validarlas.
- Reducción esperada de sycophancy, según la intención declarada del autor; no hay evaluación publicada que lo cuantifique.
- Razonamiento y matemáticas: capacidades del base, no verificadas específicamente tras el ajuste.
- Generación de código: capacidad del base, no evaluada en el adaptador.
- Tool calling / function calling: no documentado para el adaptador; el base Qwen2.5-Instruct lo soporta, pero el ajuste LoRA puede degradarlo y no hay datos al respecto.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: limitado a inglés según la ficha; el base es multilingüe, pero el adaptador no declara otros idiomas.
- Modo thinking explícito, visión o audio: no disponibles.

## Casos de uso

- Evaluación de robustez ante presión del usuario: usar el adaptador como contrapunto al base en experimentos que midan tasa de cesión ante premisas falsas (sycophancy benchmarks), comparando respuestas del base y del adaptador sobre el mismo conjunto de prompts.
- Asistentes de revisión técnica: en un flujo donde el usuario insiste en que su implementación es correcta, el adaptador está pensado para señalar el error con argumentos en lugar de aceptar la premisa; útil en revisión de código o de diseños de sistemas.
- Tutoría y educación: un tutor que no valide respuestas incorrectas del estudiante es deseable pedagógicamente; el adaptador apunta a ese perfil, siempre que se valide su calidad antes de desplegarlo.
- Investigación sobre alineación: servir como artefacto reproducible (adaptador pequeño sobre base abierto) para estudiar cómo un ajuste LoRA modifica el comportamiento de conformidad sin reentrenar el modelo completo.
- Moderación de discusiones técnicas: en entornos donde el usuario presiona para que se confirme una afirmación falsa, el modelo puede mantener la corrección factual; requiere validación previa porque no hay benchmarks publicados.
- Generación de contraargumentos en pipelines de revisión: integrar el adaptador en un sistema que produzca objeciones razonadas a propuestas, aprovechando la tendencia al pushback entrenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 1,6 GB, pero la inferencia requiere cargar el base Qwen2.5-32B-Instruct completo: en BF16 son aproximadamente 64 GB de pesos, más KV cache y overhead.
- En cuantización de 4 bits (GPTQ/AWQ/GGUF Q4), el base ocupa del orden de 18-20 GB, lo que permite ejecución en una RTX 4090 (24 GB) con contexto moderado; con contexto largo la KV cache puede exceder la VRAM.
- GPU recomendadas: A100 80 GB o H100 para BF16 con contexto largo; 2× RTX 4090 o una RTX 6000 Ada (48 GB) para FP16 con margen; RTX 4090 única solo con cuantización.
- Despliegue: el adaptador es PEFT, por lo que se carga con `transformers` + `peft` (merge o carga en caliente). Para servir, vLLM soporta adaptadores LoRA; llama.cpp/Ollama requerirían fusionar el adaptador en los pesos y convertir a GGUF, paso no documentado por el autor. TGI también admite adaptadores, pero no hay configuración publicada.
- Latencia y throughput: no disponibles; dependen enteramente del hardware y del backend elegido para el base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amphora-32B-Reasoning-Partner | 32B (base) + LoRA | no disponible (base: 131k) | Reducción de sycophancy vía LoRA | CC-BY-SA-4.0 | Gated, 0 descargas, sin benchmarks |
| Qwen/Qwen2.5-32B-Instruct | 32B | 131 072 tokens | Asistente general alineado con RLHF | Apache 2.0 (modelo base) | Abierto, ampliamente usado |
| Adaptadores anti-sycophancy comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores públicos con el mismo objetivo (pushback/anti-sycophancy) en la información proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- No hay benchmarks ni evaluación publicada: la eficacia anti-sycophancy es una intención declarada por el autor, no un resultado verificado.
- Cero descargas y cero likes: ausencia total de validación por la comunidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para uso en producción y para auditoría externa.
- Licencia CC-BY-SA-4.0: obliga a atribución y a compartir obras derivadas bajo la misma licencia; puede ser incompatible con productos propietarios. Además, conviene verificar la interacción con la licencia Apache 2.0 del base Qwen2.5.
- Solo declara inglés: el comportamiento en castellano u otros idiomas no está documentado y el ajuste puede degradar el multilingüismo del base.
- Riesgo de alucinación: heredado del base; el entrenamiento en pushback no garantiza corrección factual y podría aumentar la terquedad ante información correcta del usuario (falsos positivos de pushback).
- El ajuste LoRA puede degradar capacidades del base (tool calling, código, matemáticas) sin que el autor lo haya medido.
- Sesgos: no documentados; el dataset de entrenamiento no se publica, por lo que no puede auditarse su composición.
- Uso comercial: permitido por la licencia con condiciones de atribución y share-alike, pero la falta de evaluación hace desaconsejable su despliegue en producción sin validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/brandonjuarez23/Amphora-32B-Reasoning-Partner
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales del autor.
