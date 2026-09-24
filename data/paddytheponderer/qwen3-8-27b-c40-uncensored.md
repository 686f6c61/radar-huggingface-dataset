# PaddyThePonderer/qwen3.8-27b-c40-uncensored

## Resumen

Qwen3.8-27B Uncensored (MTP) es una derivación «abliterated» del modelo Qwen/Qwen3.8-27B, publicada por el usuario PaddyThePonderer bajo el identificador PaddyThePonderer/qwen3.8-27b-c40-uncensored. Se trata del mismo modelo base con un proceso de ablación direccional de pesos orientado a suprimir el comportamiento de rechazo, la evasiva y la matización excesiva, manteniendo intacta la competencia general del modelo. El resultado se distribuye como un único fichero GGUF cuantizado en Q4_K_M, de aproximadamente 16,8 GB, listo para su uso con llama.cpp.

El modelo conserva la arquitectura del base: una red densa de 27.320.697.856 parámetros (unos 27,3 B) con 64 capas troncales más una capa adicional de predicción multi-token (MTP) que actúa como cabeza de borrador para decodificación especulativa. La ventana de contexto declarada es de 262.144 tokens y la atención emplea GQA con 24 cabezas de consulta y 4 cabezas KV. La licencia es Apache 2.0, igual que la del modelo original.

Su relevancia actual es doble. Por un lado, ofrece una vía para ejecutar localmente un modelo de 27 B con contexto muy largo en hardware de consumo, sin dependencia de APIs externas. Por otro, incorpora la capa MTP del release oficial dentro del propio GGUF, lo que permite activar decodificación especulativa con el flag `--spec-type draft-mtp` de llama.cpp sin descargar un modelo borrador adicional. Hay que señalar que el repositorio acumula 0 descargas y 1 «like» en el momento de redactar esta ficha, y que no consta validación independiente de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35`: transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa), 64 capas troncales + 1 capa MTP (65 bloques) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (mixta, ~4,9 bits por peso); única cuantización publicada en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (llama.cpp) |
| Modelo base | Qwen/Qwen3.8-27B (Apache 2.0) |
| Cabezas de atencion | 24 cabezas de consulta / 4 cabezas KV (GQA) |
| Tamano del fichero | ~16,8 GB |
| SHA-256 | `592b0000643389812578a8784a809145c921e923f220240bef0c9d6c4dec12c4` |
| Biblioteca | llama.cpp |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de publicacion | 23 de septiembre de 2026 (creado y actualizado el mismo día) |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de un fine-tune del Qwen3.8-27B, no un entrenamiento desde cero. La arquitectura del base, según las fuentes consultadas, es un transformer denso con atención híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención completa, 64 bloques troncales y un bloque adicional (bloque 64, `blk.64.nextn.*`) correspondiente a la cabeza de Multi-Token Prediction del release oficial de Qwen. Esa capa MTP se ha injertado en el mismo fichero GGUF, de modo que llama.cpp puede lanzar decodificación especulativa `draft-mtp` contra el tronco: el borrador propone tokens y el modelo objetivo los verifica, aceptándose los aciertos como ganancia de throughput sin coste adicional de descarga o sincronización.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO en el modelo base. Lo que sí documenta el autor es la intervención sobre los pesos: una ablación direccional sintonizada contra un conjunto de compuertas compuesto por 178 prompts adversarios y 90 prompts benignos de control. Según la model card, la tasa de rechazo en el conjunto adversario baja de 0,983 a 0,112, con 159 prompts que pasan de rechazo a respuesta, y las regresiones sobre el conjunto benigno pasan de 0,022 a 0,000. Son métricas autoinformadas por el autor de la ficha, sin verificación externa publicada. El autor también indica que la cuantización Q4_K_M, aunque sólida, no es sin pérdidas.

## Capacidades

- Generación de texto conversacional en formato multi-turno, con mantenimiento de contexto hasta 262.144 tokens.
- Razonamiento configurable: el modelo base se describe en las fuentes consultadas como multimodal nativo con razonamiento configurable; esta derivación no documenta explícitamente un modo «thinking» separado.
- Capacidad multimodal (texto e imagen) presente en el modelo base según las fuentes consultadas, pero este repositorio no incluye el proyector de visión `mmproj`, por lo que la multimodalidad no es utilizable tal cual con este fichero.
- Tool calling y function calling heredados del base, según la descripción de agentic workflows y tool use de las fuentes del modelo original.
- Flujos de agente y razonamiento multi-paso: el autor destaca específicamente menos desviaciones del tipo «no estoy seguro, ¿puedes aclararlo?» en bucles de herramientas.
- Decodificación especulativa mediante la capa MTP integrada, con el flag `--spec-type draft-mtp` y parámetros como `--spec-draft-n-max 2`.
- Escritura creativa y roleplay, con menor tendencia a la evasiva según la model card.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional de contexto largo: con 262.144 tokens de ventana, el modelo puede mantener hilos de conversación o expedientes completos en memoria sin troceado agresivo, lo que resulta útil en atención al cliente o soporte técnico donde el historial importa.
- Agentes con tool calling: al reducir los rechazos y las peticiones de aclaración, encaja en bucles de agente que encadenan llamadas a funciones, consultas a APIs y reintentos, donde cada turno evasivo rompe la secuencia.
- Generación de código en pipelines de CI/CD: el base está orientado a coding y agentic workflows según las fuentes consultadas; este GGUF puede desplegarse como servicio local que revise parches, genere tests o comente PR, evitando enviar código propietario a terceros.
- Red teaming y estudio de seguridad: al ser una versión abliterada, sirve como sujeto de investigación para medir la eficacia de las técnicas de ablación direccional y comparar tasas de rechazo frente al modelo original.
- Escritura creativa y narrativa: la reducción del hedging permite personajes más consistentes y diálogos menos condescendientes, un caso que el propio autor menciona.
- Procesamiento por lotes de documentos extensos: informes, transcripciones o normativa de decenas de miles de tokens pueden analizarse en una sola pasada para extraer resúmenes, entidades o respuestas concretas.
- Despliegue local con latencia contenida: la decodificación especulativa MTP permite servir el modelo en una estación de trabajo con GPU de consumo, útil en entornos sin conectividad o con requisitos de confidencialidad.
- Clasificación y extracción estructurada: el modelo puede devolver JSON con campos definidos para enrutar tickets, etiquetar documentación o poblar bases de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MATH) en la información disponible. El autor únicamente reporta las métricas de su compuerta de ablación, que reproducimos tal cual:

| Metrica | Qwen3.8-27B original | Este modelo |
|---|---|---|
| Tasa de rechazo en conjunto adversario (178 prompts) | 0,983 | 0,112 |
| Regresiones en conjunto benigno (90 prompts) | 0,022 | 0,000 |
| Prompts que pasan de rechazo a respuesta | — | 159 |

Estos valores proceden de la model card del autor, no de una evaluación independiente, y miden comportamiento de rechazo, no calidad de razonamiento o conocimiento. No se han publicado cifras de throughput, latencia ni aceptación de borradores MTP en la información disponible.

## Requisitos de hardware

- El autor recomienda presupuestar entre 18 y 20 GB de RAM/VRAM para ejecutar el modelo con comodidad, partiendo de un fichero de ~16,8 GB en Q4_K_M.
- La memoria adicional para el KV cache no está cuantificada en la información disponible; con ventanas cercanas a 262.144 tokens el consumo crecerá de forma notable, mientras que el ejemplo de arranque del autor usa `-c 32768` (32 K de contexto).
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 3090 o la RTX 4090 con contexto moderado; en una RTX 5090 (32 GB) hay margen para contextos amplios, según referencias al ecosistema de derivados similares.
- GPU profesionales: A100 40/80 GB y H100 permiten ventanas de contexto mucho mayores y mayor concurrencia; el offload completo de capas se controla con `-ngl 99`.
- Configuraciones multi-GPU: dos GPU de 24 GB permiten repartir capas para ampliar contexto o aumentar `--spec-draft-n-max`.
- Opciones de despliegue: llama.cpp (recomendado por el autor, única vía que habilita el MTP con `--spec-type draft-mtp`), Ollama (ejecuta el tronco pero no la aceleración MTP). Soporte en vLLM o TGI: no disponible.
- Latencia y throughput estimados: no disponible. El autor afirma que la decodificación especulativa MTP aporta «draft-token speedups», pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| PaddyThePonderer/qwen3.8-27b-c40-uncensored | ~27,3 B (denso) | 262.144 | GGUF v3, Q4_K_M, con capa MTP integrada | Apache 2.0 | 0 descargas, 1 like; sin proyector de visión |
| Qwen/Qwen3.8-27B (base) | ~27,3 B (denso) | no disponible en las fuentes (la derivada declara 262.144) | safetensors (BF16) | Apache 2.0 | Modelo original, con comportamiento de rechazo estándar |
| orcarouter/Qwen3.8-27B-Uncensored | ~27 B | no disponible | Ollama, 16 etiquetas de 2 a 8 bits, con proyector de visión `mmproj` incluido | no disponible (derivado de Apache 2.0) | Misma familia abliterada, con visión utilizable |
| preetpatel/Qwen3.8-27B-Uncensored-NVFP4 | ~27 B | 160 K en RTX 5090 | NVFP4 (W4A4), ~19 GB | no disponible (derivado de Apache 2.0) | Cuantización para GPU Blackwell de consumo |

## Limitaciones y advertencias

- La ablación intercambia parte de la cautela por más franqueza: ante preguntas genuinamente ambiguas el modelo tenderá a comprometerse con una respuesta en lugar de matizar, por lo que conviene revisar las salidas en dominios donde la incertidumbre es informativa.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad para esta derivación; el proceso de ablación no elimina ni reduce la generación de contenido falso.
- Q4_K_M no es sin pérdidas. Si se requiere máxima fidelidad, el propio autor recomienda desquantizar desde una fuente de mayor precisión.
- Idiomas soportados no documentados en la ficha del repositorio; no se puede garantizar el comportamiento multilingüe sin pruebas propias.
- La multimodalidad del modelo base no es utilizable con este fichero al no incluirse el proyector `mmproj`.
- Licencia Apache 2.0, que permite uso comercial y derivados, pero hereda las condiciones del modelo base; conviene verificar la procedencia de la capa MTP injertada.
- Procedencia y reproducibilidad: el repositorio registra 0 descargas y no consta auditoría externa de la ablación, del hash de los pesos ni de los resultados declarados.
- Contenido sin filtros: al eliminar el comportamiento de rechazo, el modelo puede generar material inapropiado, ofensivo o inseguro según el prompt. No es adecuado para despliegues orientados al público general sin moderación adicional.
- Memoria: por debajo de 18 GB libres de RAM/VRAM el modelo no se ejecutará con holgura; con contexto largo el KV cache puede exceder el presupuesto de una GPU única.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/PaddyThePonderer/qwen3.8-27b-c40-uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de la serie Qwen3.8 (QwenLM): https://github.com/QwenLM/Qwen3.8
- Repositorio de Qwen3.8-27B (AlibabaCloud-Official): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de inferencia de Qwen 3.8 27B en Cerebras: https://inference-docs.cerebras.ai/models/qwen-3.8-27b
- Derivación abliterada en Ollama (orcarouter/Qwen3.8-27B-Uncensored): https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Cuantización NVFP4 relacionada (preetpatel/Qwen3.8-27B-Uncensored-NVFP4): https://huggingface.co/preetpatel/Qwen3.8-27B-Uncensored-NVFP4
