# InterpreticAI/Qwenputer-4B-Uncensored-lite-v2

## Resumen

Qwenputer-4B-Uncensored-lite-v2 es una versión compacta y sin pérdida de Qwenputer-4B-Uncensored-v2, publicada por InterpreticAI. El modelo base integra un ordenador RISC-V de 32 bits compilado directamente dentro de los pesos mediante el compilador Qwenputer de Divyansh Agrawal, de modo que la aritmética exacta se ejecuta dentro del propio forward pass en lugar de delegarse a una herramienta externa. La variante lite-v2 almacena exactamente los mismos pesos sin el relleno de ceros, reduciendo el tamaño en disco de 18,7 GB a 8,7 GB y permitiendo su carga en una única GPU de 16 GB.

El modelo parte de Qwen3.5-4B-Uncensored-v2 (a su vez derivado de Qwen/Qwen3.5-4B) y conserva su comportamiento textual: según la model card, las divergencias respecto al modelo sin ordenador se sitúan dentro del ruido numérico en BF16. La arquitectura es un transformer de 32 capas con 4B parámetros, precedido por 11 capas que implementan el ordenador RISC-V. La ventana de contexto y el resto de especificaciones de generación no se detallan en la información disponible.

La relevancia del modelo radica en dos aspectos: demuestra que es posible incrustar una CPU completa en los pesos de un LLM sin degradar su distribución de siguiente token, y ofrece una distribución práctica (8,7 GB, 12,8 GB en memoria BF16) que cabe en GPUs de consumo alto como la RTX A4000. Está pensado para experimentación con razonamiento aritmético exacto y para escenarios donde se requiere cómputo verificable sin herramientas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (Qwen3_5ForCausalLM) con 11 capas de ordenador RISC-V de 32 bits integradas en los pesos |
| Parametros totales | 4B (aproximado, según nombre del modelo); desglose por componente: ordenador 0,009 GB, embedding 1,51 GB, LM 7,14 GB en lite-v2 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 según la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors compactados sin relleno de ceros; requieren `slimload.py` o `unpack.py` para cargarse |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con 32 capas y aproximadamente 4B parámetros, al que se le anteponen 11 capas que implementan un procesador RISC-V de 32 bits. Estas capas no son un adaptador entrenado de forma convencional: son el resultado de compilar un ordenador dentro de los pesos mediante el compilador Qwenputer, de modo que el forward pass ejecuta instrucciones RISC-V y produce resultados aritméticos exactos. El modelo emite una llamada a herramienta `calc` que el propio ordenador interno resuelve, sin intervención de herramientas externas.

La variante lite-v2 no reentrena ni modifica pesos: elimina el relleno de ceros del checkpoint original. Los 580 tensores se reconstruyen bit a bit desde el repositorio, con hashes SHA256 por tensor listados en `SHA256SUMS.dense`. Según la model card, los estados ocultos tras las capas del ordenador son idénticos bit a bit a los del checkpoint completo. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la cadena de fine-tuning.

## Capacidades

- Generación de texto conversacional en modo texto, con soporte de modo thinking y no-thinking (heredado de Qwen3.5).
- Aritmética entera exacta mediante el ordenador RISC-V interno: el modelo escribe una llamada `calc` y las capas del ordenador producen el resultado dentro del forward pass.
- Tool calling / function calling: el harness de evaluación usa llamadas a herramienta `calc`.
- Razonamiento multi-paso con verificación aritmética interna.
- Comportamiento textual alineado con Qwen3.5-4B-Uncensored-v2, con divergencia KL media de 1,0 × 10⁻³ frente al modelo base (ratio 1,10 sobre el ruido de implementación de atención).
- Respuestas a preguntas políticamente sensibles en chino con diferencias respecto al modelo base dentro del ruido numérico (primera diferencia a token 43,5 de mediana).
- Sin capacidades de visión: el encoder visual de Qwen3.5-4B-Uncensored-v2 no está incluido.

## Casos de uso

- Cálculo aritmético verificable en producción: el modelo resuelve operaciones enteras exactas dentro del forward pass, sin depender de una calculadora externa ni de una API de herramientas, lo que simplifica la cadena de confianza en entornos con restricciones de red.
- Evaluación de modelos con cómputo incrustado: sirve como banco de pruebas para estudiar cómo afecta la compilación de una CPU en los pesos a la distribución de siguiente token, con métricas de KL y comparación bit a bit frente al modelo base.
- Despliegue en GPUs de 16 GB: con 12,8 GB en memoria BF16 y 8,7 GB en disco, encaja en una RTX A4000 o similar, lo que permite experimentar con el ordenador interno en hardware de gama media profesional.
- Investigación sobre censura política en LLM: el modelo hereda el comportamiento de Qwen3.5-4B-Uncensored-v2 en las 78 preguntas de Pan y Xu (2026), útil para reproducir y auditar evaluaciones de censura en chino.
- Asistentes conversacionales con requisitos de cómputo exacto: en dominios como contabilidad, ingeniería o educación, donde una respuesta numérica errónea es crítica, el ordenador interno aporta una verificación que un LLM puro no ofrece.
- Reproducibilidad y auditoría de pesos: los hashes por tensor y `unpack.py` permiten reconstruir el checkpoint completo de 18,7 GB y verificar la integridad, lo que facilita pipelines de auditoría de modelos.
- Prototipado de agentes con tool calling: el driver de chat de Qwenputer (`chipformer.rv.chat`) funciona sin cambios con los pesos compactos, lo que permite integrar el modelo en flujos de agente con llamadas a `calc`.

## Benchmarks y rendimiento

| Prueba | Modelo | Resultado |
|---|---|---|
| Aritmética entera exacta (40 problemas) | Qwen3.5-4B-Uncensored-v2 sin herramientas | 29/40 correctos |
| Aritmética entera exacta (40 problemas) | Qwenputer-4B-Uncensored-v2 | 40/40 correctos |
| Aritmética entera exacta (40 problemas) | Qwenputer-4B-Uncensored-lite-v2 | 40/40 correctos |
| Fidelidad textual (KL media) | Qwenputer-4B-Uncensored-v2 (H100) | 5,2 × 10⁻⁴ (ruido 5,0 × 10⁻⁴, ratio 1,03) |
| Fidelidad textual (KL media) | Qwenputer-4B-Uncensored-lite-v2 (A4000) | 1,0 × 10⁻³ (ruido 9,1 × 10⁻⁴, ratio 1,10) |
| Preguntas políticas (78), respuestas idénticas | Qwenputer-4B-Uncensored-v2 vs. Qwen3.5-4B-Uncensored-v2 | 1 idéntica, primera diferencia a token 52 de mediana |
| Preguntas políticas (78), respuestas idénticas | lite-v2 vs. Qwen3.5-4B-Uncensored-v2 | 0 idénticas, primera diferencia a token 43,5 de mediana |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12,8 GB en BF16 con los pesos cargados mediante `slimload.py`; el checkpoint completo reconstruido ocupa 18,7 GB.
- GPU recomendadas: NVIDIA RTX A4000 (16 GB) validada en la model card; el checkpoint completo se evaluó en una NVIDIA H100.
- Cabe en GPU de consumo: sí, en GPUs de 16 GB o más (RTX A4000, RTX 4080/4090 de 16-24 GB, según disponibilidad de memoria efectiva).
- Opciones de despliegue: `slimload.py` del repositorio qwenputer (experimental/riscv), el driver `chipformer.rv.chat`, y `unpack.py` para reconstruir el checkpoint estándar y usar `from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ordenador interno | Licencia | Tamaño en disco |
|---|---|---|---|---|---|
| Qwenputer-4B-Uncensored-lite-v2 | ~4B | no disponible | Sí (RISC-V, 11 capas) | Apache 2.0 | 8,7 GB |
| Qwenputer-4B-Uncensored-v2 | ~4B | no disponible | Sí (RISC-V, 11 capas) | Apache 2.0 | 18,7 GB |
| Qwen3.5-4B-Uncensored-v2 | ~4B | no disponible | No | Apache 2.0 (heredada) | no disponible |
| Qwen/Qwen3.5-4B | ~4B | no disponible | No | Apache 2.0 | no disponible |

La comparativa se limita a la cadena de modelos de la que deriva, ya que la información disponible no incluye alternativas externas con ordenador incrustado. Frente a Qwen3.5-4B-Uncensored-v2, la diferencia medible es la aritmética exacta (40/40 frente a 29/40) con divergencia textual dentro del ruido.

## Limitaciones y advertencias

- Los archivos compactos no se cargan con `from_pretrained` directamente: requieren `slimload.py` o `unpack.py`.
- Solo texto: el encoder visual de Qwen3.5-4B-Uncensored-v2 no está incluido.
- Hereda las limitaciones de Qwen3.5-4B-Uncensored-v2, incluida una tasa de hechos fabricados superior a la de Qwen3.5-4B; una respuesta sustantiva no es necesariamente correcta.
- La evaluación política cubre únicamente preguntas en chino.
- No se ha vuelto a ejecutar el juez de censura; los resultados de censura reportados para Qwen3.5-4B-Uncensored-v2 se aplican a este modelo.
- La model card no detalla sesgos conocidos, idiomas soportados ni longitud de contexto, por lo que no es posible evaluar su comportamiento multilingüe ni su robustez en contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar las atribuciones del equipo Qwen y del autor de Qwenputer (código MIT, Copyright (c) 2026 Divyansh Agrawal).
- El modelo está etiquetado como "uncensored"; conviene auditar sus respuestas en dominios sensibles antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InterpreticAI/Qwenputer-4B-Uncensored-lite-v2
- Modelo base: https://huggingface.co/InterpreticAI/Qwenputer-4B-Uncensored-v2
- Modelo sin ordenador: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwenputer en Hugging Face: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Repositorio del compilador Qwenputer: https://github.com/divagr18/qwenputer
- Referencia: Agrawal, D. (2026). Qwenputer: a computer compiled into the weights of a language model (la model card no incluye URL del paper).
- Referencia: Pan y Xu (2026), evaluación de preguntas políticas (la model card no incluye URL).
