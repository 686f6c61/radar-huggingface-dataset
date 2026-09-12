# ApolloRaines/Pythia-6.9B-DNP-500-Facts

## Resumen

Pythia-6.9B-DNP-500-Facts es un modelo derivado por el usuario ApolloRaines a partir de EleutherAI/pythia-6.9b, en el que se han inyectado 500 hechos novedosos correspondientes al periodo 2023-2024 mediante una tecnica denominada Neural Reclamation, desarrollada por jBlaze. El punto de partida es un transformer decoder-only de tipo GPT-NeoX con 6.857.302.016 parametros, y el resultado es un checkpoint que conserva la arquitectura y el tokenizador originales pero con conocimiento factual adicional escrito directamente en los pesos, sin fine-tuning ni adaptadores.

La relevancia del modelo no radica en su rendimiento como asistente general, sino en la demostracion metodologica: el autor afirma que el pipeline escala satisfactoriamente de 1.4B a 6.9B parametros, alcanzando 486/500 hechos recordados (97 %) con una perplejidad estable (28,1-29,1) y sin degradacion aparente de la coherencia linguistica. Si estos resultados se confirman de forma independiente, la tecnica seria una alternativa a LoRA y al fine-tuning clasico para actualizar conocimiento en modelos preentrenados, un problema donde los metodos convencionales sufren olvido catastrofico.

Se trata, en cualquier caso, de un artefacto de investigacion con cero descargas y cero likes en el momento de redactar esta ficha, sin licencia declarada, sin resultados en benchmarks estandar y sin validacion externa conocida. Debe evaluarse como una prueba de concepto experimental, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-NeoX (etiqueta `gpt_neox`), con atencion multi-cabeza y proyecciones MLP densas |
| Parametros totales | 6.857.302.016 (6,86B, dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens, heredada de EleutherAI/pythia-6.9b (no especificado en la model card) |
| Tipos de cuantizacion | No disponible en el repositorio; solo pesos safetensors en precision completa. No se publican versiones GGUF, GPTQ, AWQ ni bitsandbytes |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible (el modelo base Pythia se distribuye bajo Apache 2.0, pero el derivado no declara licencia) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,7 GB |
| Modelo base | EleutherAI/pythia-6.9b |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Pythia-6.9B, un transformer decoder-only de tipo GPT-NeoX con atencion causal, embeddings rotatorios y disposicion paralela de atencion y MLP dentro de cada bloque. El modelo no ha sido reentrenado ni ajustado con descenso de gradiente: la model card indica explicitamente que no hay fine-tuning, ni adaptadores, ni bucle de entrenamiento basado en gradientes. En su lugar se aplica cirugia de pesos sobre las proyecciones de salida de las capas MLP, concretamente sobre las matrices `dense_4h_to_h`.

El pipeline Neural Reclamation se describe en cuatro etapas: primero se borra conocimiento objetivo de las matrices MLP mediante proyeccion de direcciones de activacion contrastivas; despues se estabiliza el modelo "vaciado" reescribiendo conocimiento general esencial; a continuacion se escriben los hechos novedosos en la capacidad representacional liberada; y finalmente se ejecuta una "passidation" de tres pasadas con learning rates decrecientes (1.5e-3, 7e-4 y 3e-4) y 20 pasos por pasada. El autor describe este ultimo paso como autoequilibrado: los hechos olvidados presentan una perdida alta y reciben actualizaciones fuertes, mientras que los ya aprendidos tienen perdida cercana a cero y apenas se modifican. La justificacion tecnica que ofrece es que la capacidad linguistica reside en las capas de atencion y en los embeddings, que no se tocan, de modo que sobreviven intactos al borrado y la reescritura en las MLP.

## Capacidades

- Generacion de texto autoregresiva en ingles, con la misma competencia linguistica que el Pythia-6.9B original segun las pruebas de coherencia del autor (5/5).
- Recuerdo de 500 hechos concretos del periodo 2023-2024 implantados en los pesos, con una tasa declarada del 97 % (486/500) medidos con sondas internas del propio autor.
- Los hechos cubren, segun la model card, lanzamientos de IA, acontecimientos mundiales, resultados deportivos y avances cientificos.
- Conocimiento general preservado: el autor reporta 7/8 en sondas de conocimiento general y 29/30 en durabilidad de escritura (writeback).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso; existe otro checkpoint del mismo autor (Pythia-1.4B-jBlaze-Reasoning) orientado a mejora conductual del razonamiento, lo que sugiere que este modelo no la incorpora.
- Capacidades multilingues limitadas al ingles.
- No dispone de modo "thinking", vision, audio ni ninguna otra modalidad.

## Casos de uso

- Investigacion en edicion de conocimiento: el modelo sirve como banco de pruebas reproducible para comparar cirugia de pesos frente a LoRA o fine-tuning completo, usando los 500 hechos implantados como conjunto de evaluacion controlado.
- Estudio de olvido catastrofico: permite medir cuanto conocimiento general sobrevive tras borrar y reescribir regiones de las MLP, comparando los indicadores de conocimiento general (7/8) y de perplejidad (28,1-29,1) frente al modelo base.
- Analisis de interpretabilidad de las capas MLP: dado que la intervencion se limita a `dense_4h_to_h`, es util para estudiar que representaciones factuales se almacenan en esas proyecciones y como se reorganizan tras la reescritura.
- Replicacion y auditoria del pipeline: un tercero puede reproducir las tres pasadas con los learning rates declarados y verificar si la tasa de recuerdo del 97 % se sostiene con sondas independientes en lugar de las del autor.
- Generacion de conjuntos de datos factuales sinteticos: los hechos implantados pueden usarse para construir pares pregunta-respuesta de 2023-2024 y evaluar la capacidad del modelo de recuperarlos sin contexto externo, siempre con verificacion humana posterior.
- Demostraciones docentes sobre limites de la inyeccion de conocimiento: el contraste con los resultados reportados por el autor para LoRA en Pythia-1.4B (destruccion del modelo a los 50 hechos) resulta ilustrativo en cursos de ajuste de modelos.
- Base para experimentos de comparacion con RAG: sirve para medir si el conocimiento en pesos evita alucinaciones en dominios concretos frente a la recuperacion documental, aunque la ventana de 2048 tokens limita el volumen de contexto recuperable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag ni similares) en la informacion disponible. La unica tabla de resultados es la que proporciona el propio autor, basada en sus propias sondas de recuerdo sobre los 500 hechos implantados:

| Pasada | Learning rate | Pasos | Recuerdo | General | Writeback | PPL |
|---|---|---|---|---|---|---|
| Pass 1 | 1.5e-3 | 20 | 205/500 (41 %) | 7/8 | 29/30 | 28,1 |
| Pass 2 | 7e-4 | 20 | 453/500 (91 %) | 7/8 | 29/30 | 28,3 |
| Pass 3 | 3e-4 | 20 | 486/500 (97 %) | 7/8 | 29/30 | 29,1 |

Estos datos provienen exclusivamente de la model card del autor, no han sido verificados de forma independiente y las sondas no se describen con detalle metodologico (no se especifica el formato exacto de pregunta, el criterio de acierto ni si hay variantes de formulacion).

## Requisitos de hardware

- Peso de los pesos en precision completa: aproximadamente 27,4 GB (FP32), 13,7 GB (FP16/BF16), 6,9 GB (int8) y 3,4-3,7 GB (4 bits). Solo el formato safetensors en precision completa esta publicado; las demas cifras son estimaciones de conversion.
- Cache KV estimada: unos 0,25 MB por token en FP16 (32 capas, 32 cabezas, dimension de cabeza 64), lo que supone aproximadamente 0,5 GB para los 2048 tokens de contexto completo. Cifra estimada a partir de la configuracion del modelo base.
- GPU recomendadas para FP16: A100 40 GB, A100 80 GB, H100, L40S o RTX 4090 24 GB. En la RTX 4090 cabe FP16 con contexto completo y un lote pequeno.
- GPU de consumo: si cabe en RTX 3090, RTX 4080 y RTX 4090 (24 GB) en FP16; en RTX 3060 12 GB, RTX 4070 12 GB o RTX 4060 Ti 16 GB requeriria cuantizacion a 8 o 4 bits, que el autor no proporciona y habria que generar localmente.
- Opciones de despliegue: `transformers` es la via documentada en la model card. La etiqueta `text-generation-inference` sugiere compatibilidad con TGI y la etiqueta `endpoints_compatible` con endpoints gestionados. vLLM es viable al tratarse de un transformer GPT-NeoX estandar. llama.cpp y Ollama requeririan convertir los pesos a GGUF, tarea no cubierta por el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| Pythia-6.9B-DNP-500-Facts | 6,86B | 2048 (heredado del base) | No disponible | 0 descargas, 0 likes, sin benchmarks estandar, 500 hechos implantados |
| EleutherAI/pythia-6.9b | 6,86B | 2048 | Apache 2.0 | Modelo base publico, ampliamente evaluado, sin los hechos de 2023-2024 |
| ApolloRaines/Pythia-1.4B-DNP-500-Facts | ~1,4B | 2048 (heredado del base) | No disponible | Mismo pipeline en menor escala: 489/500 (98 %), segun el autor |
| Mistral-7B-v0.1 o Llama-3.1-8B | 7-8B | 8K-128K | Apache 2.0 / licencia comunitaria | Alternativas de tamano comparable con contexto muy superior y soporte de ecosistema, pero sin inyeccion quirurgica de hechos |

La comparacion directa con modelos de proposito general es poco favorable en contexto y en soporte de herramientas; la ventaja de este checkpoint es exclusivamente metodologica, como demostracion de la tecnica Neural Reclamation a escala 6.9B.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluacion de sesgo, toxicidad ni alineacion. Al derivar de Pythia-6.9B, hereda los sesgos de su corpus de entrenamiento (The Pile) sin filtrado adicional declarado.
- Riesgo de alucinacion: elevado. El modelo no ha recibido ajuste por instrucciones ni RLHF/DPO, por lo que no es un asistente conversacional; generar respuestas plausibles pero incorrectas es el comportamiento esperado.
- Los 500 hechos implantados pueden recuperarse con formulaciones distintas a las usadas en las sondas del autor, y no se documenta la robustez ante parafrasis.
- La tasa de recuerdo del 97 % procede de sondas internas del autor, no verificadas por terceros. Las cifras de "General" (7/8), "Writeback" (29/30) y coherencia (5/5) son conjuntos de prueba diminutos y no constituyen una evaluacion solida.
- Limitacion de contexto severa: 2048 tokens, muy por debajo de los estandares actuales (8K-128K), lo que restringe el uso en tareas de contexto largo y en pipelines de RAG con multiples documentos.
- Limitacion idiomatica: solo ingles. No hay evidencia de comportamiento fiable en castellano ni en otros idiomas.
- Restriccion de licencia: la model card no declara licencia para el modelo derivado. Aunque el base sea Apache 2.0, la ausencia de licencia explicita en el derivado genera incertidumbre juridica para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia de cuantizaciones publicadas: desplegarlo en hardware de consumo exige generar las versiones GGUF o de 4 bits por cuenta propia.
- Riesgo de degradacion no medida: la cirugia de pesos puede afectar a capacidades no cubiertas por las sondas del autor (razonamiento, codigo, matematicas), que no se evaluan en ningun momento.
- Inestabilidad potencial fuera de distribucion: al haber sido modificado sin bucle de gradientes, el comportamiento ante entradas largas o muy distintas de las usadas durante la reescritura es desconocido.
- Madurez: 0 descargas y 0 likes indican ausencia total de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Pythia-6.9B-DNP-500-Facts
- Modelo base: https://huggingface.co/EleutherAI/pythia-6.9b
- Mismo pipeline en 1.4B: https://huggingface.co/ApolloRaines/Pythia-1.4B-DNP-500-Facts
- Prueba de concepto original de 198 hechos: https://huggingface.co/ApolloRaines/Pythia-1.4b-Knowledge-Implant
- Mejora conductual de razonamiento: https://huggingface.co/ApolloRaines/Pythia-1.4B-jBlaze-Reasoning
- Herramienta jBlaze: https://jblaze.dev
- Paper, blog tecnico o repositorio del pipeline Neural Reclamation: no disponible en la informacion proporcionada
- Resultados de benchmarks estandar: no disponible en la informacion proporcionada
