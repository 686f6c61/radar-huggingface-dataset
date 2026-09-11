# jakeatx/Qwen3.8-Perian-GGUF

## Resumen

Qwen3.8-Perian GGUF es la distribución cuantizada en formato GGUF de un modelo derivado de la línea Qwen3.8-Flash-Next, publicado por el usuario jakeatx. No se trata de un modelo entrenado desde cero, sino de un ejercicio de compresión agresiva: parte de un modelo de arquitectura mixture-of-experts (MoE) al que se le aplican tres reducciones sucesivas —poda de profundidad de 48 a 32 capas, fusión de expertos enrutados de 384 a 288 por capa y recorte del 50 % de la tabla de n-gramas PLE— y sobre el que después se realiza un post-entrenamiento con QLoRA de rango 32. El resultado es un checkpoint BF16 de 74.615.655.680 parámetros y unos 150.511.416.232 bytes de tensores antes de cuantizar.

La relevancia del artefacto está en su naturaleza experimental y en su cadena de dependencias: los GGUF se generaron con un build parcheado y fijado de llama.cpp (qwen4exp) que conserva el tensor de remapeo PLE compacto como metadato entero, por lo que un runtime compatible debe entender tanto la arquitectura qwen4exp como ese remapeo. Se publican cuatro cuantizaciones (UD-Q4-K-XS, Q4_K_M, UD-Q5-K-XL y Q8_0) con hashes SHA-256 verificables, lo que facilita la reproducibilidad de la descarga.

Es importante señalar que el propio autor indica que los GGUF todavía no incluyen una cabeza MTP (multi-token prediction) validada y que los artefactos deben evaluarse en el runtime y la suite de benchmarks de destino antes de tomar una decisión de despliegue en producción. No hay datos públicos de benchmarks, idiomas soportados ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con tabla de n-gramas PLE y poda de profundidad; runtime qwen4exp |
| Parametros totales | 74.615.655.680 (base BF16 compacta declarada); 74.935.657.126 según safetensors del repo |
| Parametros activos | no disponible (MoE con 288 expertos enrutados por capa y 10 expertos seleccionados por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: UD-Q4-K-XS, Q4_K_M, UD-Q5-K-XL, Q8_0; base BF16 de 150.511.416.232 bytes |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el checkpoint base y el adaptador LoRA |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer MoE con enrutamiento disperso (10 expertos seleccionados por token sobre 288 slots por capa) más una tabla PLE de n-gramas de gran capacidad. El proceso de compresión consta de tres recortes documentados. Primero, la profundidad pasa de 48 a 32 capas transformer (16 capas eliminadas, un 33,3 % menos). Segundo, los expertos enrutados por capa se fusionan de 384 a 288 (96 slots menos por capa, un 25 % de reducción), manteniendo 10 expertos seleccionados por token; la fusión se guió con evidencia de router local por capa, similitud y saliencia de activaciones extraída de 1.024 secuencias de calibración de 512 tokens, ponderadas hacia uso de herramientas, código ejecutable, recuperación y razonamiento multi-paso. Tercero, la tabla PLE se reduce de 320.001.446 a 160.000.768 filas (50 %), lo que elimina aproximadamente 25,60B de parámetros; la selección combinó cabezas de bigramas 0-7 informadas por activación con cabezas de trigramas 8-15 ordenadas por frecuencia, y se validó sobre un holdout documentalmente disjunto de 5M de tokens.

Sobre el modelo compacto se aplicó un post-entrenamiento QLoRA de rango 32 con 12.558 trazas normalizadas que cubren codificación y depuración, matemáticas y razonamiento STEM, trayectorias agénticas y de uso de herramientas, recuperación y razonamiento general multi-paso. Las trazas proceden de varias familias de modelos frontera (Fable 5, GLM 5.2, Kimi K3, Claude Opus 4.7, Qwen3.8-Max y GPT-5.6-Sol). Se supervisaron el razonamiento del asistente, las respuestas, las llamadas a herramientas y los tokens de fin de mensaje; se enmascararon los prompts, las definiciones y resultados de herramientas y el contexto repetido. El checkpoint fusionado corresponde al hito de rango 32 con 9.336.692 tokens de asistente supervisados. El corpus privado de normalización tiene 25.811.891 tokens renderizados canónicos y 10.299.662 tokens supervisados canónicos, y se mantiene privado porque sus registros de origen no comparten una licencia uniforme ni una autorización general de uso posterior. El adaptador de origen es `jakeatx/ream-288-rank32-3m-adapter`, revisión `41947bd12f74482906995f47b5c8a7c5703cfca1`, ruta `milestones/checkpoint-wall-9336692/adapter`.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Razonamiento multi-paso: el post-entrenamiento incluye explícitamente trazas de razonamiento general y matemáticas/STEM.
- Codificación y depuración: hay trazas de codificación y depuración, además de código ejecutable en la calibración de expertos.
- Uso de herramientas y function calling: se supervisaron llamadas a herramientas y trayectorias agénticas, y el modelo lleva la etiqueta `agentic`.
- Recuperación (retrieval): presente tanto en el corpus de post-entrenamiento como en la ponderación de la calibración de fusión de expertos.
- Capacidades multilingües: no disponible (no se declaran idiomas en el repo).
- Modo de pensamiento explícito, visión, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Agentes con uso de herramientas: el post-entrenamiento supervisó llamadas a herramientas y razonamiento intermedio, por lo que el modelo puede integrarse en bucles de agente que emitan JSON de función y consuman resultados, siempre que el runtime soporte el formato de plantilla esperado.
- Asistentes de codificación en local: las cuantizaciones Q4 permiten ejecutar un modelo de ~75B en estaciones de trabajo con varias GPU o con offload a CPU, útil para autocompletado, revisión de diffs y explicación de código sin enviar código a servicios externos.
- Depuración asistida: las trazas de depuración del corpus de post-entrenamiento hacen que el modelo sea adecuado para diagnosticar errores a partir de trazas de pila y fragmentos de código en conversaciones multi-turno.
- Razonamiento matemático y STEM en entornos educativos o de investigación: puede resolver problemas paso a paso y exponer el razonamiento, útil como herramienta de estudio o de verificación preliminar de derivaciones.
- Pipelines de recuperación aumentada (RAG): el modelo fue calibrado y post-entrenado con datos de recuperación, por lo que puede resumir y razonar sobre documentos recuperados, aunque la longitud de contexto efectiva no está documentada y debe medirse en el runtime de destino.
- Experimentación en compresión de modelos: el propio artefacto es un caso de estudio reproducible (poda de profundidad, fusión de expertos, recorte de tabla PLE y QLoRA) con hashes publicados, útil para investigadores que estudien técnicas de reducción de MoE.
- Servicio de chat autoalojado: al publicarse en GGUF y con licencia apache-2.0, puede desplegarse en infraestructura propia con llama.cpp u Ollama para casos de conversación general donde la soberanía del dato sea un requisito.
- Evaluación comparativa de cuantizaciones: las cuatro variantes (UD-Q4-K-XS, Q4_K_M, UD-Q5-K-XL, Q8_0) permiten medir la degradación de calidad frente al coste de VRAM en un mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que las puertas de poda, holdout, fusión y entrenamiento se superaron, sin cifras asociadas, y recomienda evaluar los artefactos en el runtime y la suite de benchmarks de destino antes de un despliegue en producción.

## Requisitos de hardware

- VRAM estimada para inferencia (suma del tamaño del archivo más overhead de caché KV y activaciones; el contexto no está documentado, así que la cifra depende de la longitud real de contexto que se configure):
  - UD-Q4-K-XS (44,84 GB): aproximadamente 48-55 GB en total.
  - Q4_K_M (51,59 GB): aproximadamente 55-62 GB en total.
  - UD-Q5-K-XL (69,48 GB): aproximadamente 73-80 GB en total.
  - Q8_0 (80,66 GB): aproximadamente 84-92 GB en total.
- GPU recomendadas: dos o más GPU de 48 GB (A6000, L40S, A100 80 GB, H100) para las variantes Q4 y Q5; una A100 80 GB o H100 80 GB puede albergar Q4_K_M y posiblemente UD-Q5-K-XL con contexto corto; Q8_0 exige 80 GB o reparto entre varias GPU.
- Cabe en GPU de consumo: no para las variantes publicadas con el contexto completo; una RTX 4090 (24 GB) o RTX 5090 no bastan por sí solas, pero son viables combinando offload parcial a CPU y RAM del sistema. Se requiere RAM del sistema abundante (del orden del tamaño del archivo o más) para el modo mixto.
- Opciones de despliegue: llama.cpp es la vía prevista, pero se necesita un build fijado y parcheado de qwen4exp que preserve el tensor de remapeo PLE compacto como metadato entero. No hay confirmación de soporte en vLLM, TGI ni Ollama en la información disponible; la etiqueta `endpoints_compatible` del repo no garantiza compatibilidad con la arquitectura qwen4exp.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Perian (este modelo) | 74,62B declarados / 74,94B en safetensors | no disponible | sin benchmarks publicados | apache-2.0 | GGUF en HuggingFace, requiere runtime qwen4exp parcheado |
| Linaje sin podar (48 capas, 384 expertos, tabla PLE completa) | no disponible con exactitud; la model card indica que el recorte de la tabla PLE eliminó unos 25,60B de parámetros | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Modelos comparables de terceros de ~70-75B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos alternativos de la misma categoría (MoE de ~75B activos con soporte agéntico) en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica publicada, por lo que no puede afirmarse nada sobre la calidad resultante tras la poda y el post-entrenamiento.
- Compatibilidad de runtime restringida: los GGUF requieren un build parcheado de llama.cpp (qwen4exp) que entienda el remapeo PLE compacto. Cargar los ficheros en runtimes estándar puede fallar o producir resultados incorrectos.
- Sin cabeza MTP validada: la model card advierte explícitamente de que no debe asumirse que la cabeza de draft del modelo sin podar de 48 capas sea compatible con este tronco de 32 capas.
- Riesgo de degradación por compresión: la eliminación del 33,3 % de las capas, del 25 % de los slots de expertos y del 50 % de la tabla PLE son reducciones muy agresivas cuyos efectos sobre la calidad no están cuantificados públicamente.
- Licencia del modelo apache-2.0, pero con una salvedad relevante: el corpus de entrenamiento del adaptador es privado porque sus registros de origen no comparten licencia uniforme ni autorización general de uso posterior. Esa circunstancia no se transmite automáticamente al usuario final, pero conviene revisarla antes de un uso comercial.
- Idiomas soportados no declarados: no puede asumirse un rendimiento multilingüe equivalente al de la línea Qwen original.
- Longitud de contexto no documentada: planificar despliegues con contexto largo sin medir antes el comportamiento real es arriesgado.
- Sesgos: no disponibles. No se publica ninguna evaluación de sesgo, toxicidad o alineación.
- Riesgo de alucinación: no cuantificado; al tratarse de un modelo post-entrenado sobre trazas sintéticas de modelos frontera, es esperable cierto grado de imitación estilística sin garantía de fidelidad factual.
- Adopción nula hasta la fecha de la ficha: 0 descargas y 0 likes, sin evidencia de uso en producción por terceros.
- Fecha de creación y actualización: 10 y 11 de septiembre de 2026, respectivamente; el artefacto es reciente y puede cambiar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jakeatx/Qwen3.8-Perian-GGUF
- Modelo base declarado: https://huggingface.co/jakeatx/slimder-qwen38-ream288-depth32-agentic-ngram50-compact
- Adaptador LoRA de origen: https://huggingface.co/jakeatx/ream-288-rank32-3m-adapter (revisión `41947bd12f74482906995f47b5c8a7c5703cfca1`)
- Paper, blog, repositorio de código o demo específicos del modelo: no disponible en la información proporcionada.
