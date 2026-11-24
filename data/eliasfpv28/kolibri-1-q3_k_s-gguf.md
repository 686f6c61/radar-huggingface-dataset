# Eliasfpv28/Kolibri-1-Q3_K_S-GGUF

## Resumen

Kolibri-1-Q3_K_S-GGUF es una conversión y cuantización no oficial, experimental y en formato GGUF del modelo Kolibri-1-BF16 desarrollado por Aleph Alpha Research GmbH. La publicación corre a cargo del usuario independiente Eliasfpv28 y su objetivo es hacer desplegable en llama.cpp un modelo de arquitectura MoE de gran tamaño que, en su versión original en BF16, resulta inviable en hardware de consumo. El modelo base cuenta con 78.103.074.560 parámetros totales y una ventana de contexto nativa de 262.144 tokens, con validación de contexto extendido reportada por el autor original hasta 1.048.576 tokens.

La relevancia de esta ficha radica en que no se trata de una cuantización rutinaria: la arquitectura `kolibri1` no está soportada por las revisiones estándar de llama.cpp, por lo que el autor distribuye un parche de código fuente que debe aplicarse a una revisión concreta (pinneada) del repositorio. El resultado es un fichero de aproximadamente 33,87 GB (31,54 GiB) con esquema Q3_K_S y una media de unos 3,47 bits por parámetro, que el autor ha llegado a arrancar localmente en una RTX 3060 de 12 GiB combinada con una Intel Arc Pro B60 de 24 GiB mediante reparto de capas por Vulkan.

Se trata, por tanto, de un artefacto con vocación práctica y experimental, no de una release validada: el propio autor advierte que las comprobaciones realizadas (nombres y formas de tensores, valores finitos en routers y normas, comparación numérica contra referencia de precisión completa y 169 casos de tokenizador) no constituyen una evaluación de calidad lingüística ni evidencia de que los benchmarks del modelo original se transfieran a esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts), arquitectura GGUF `kolibri1`, derivada del transformer de Kolibri-1-BF16 |
| Parametros totales | 78.103.074.560 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos en el modelo original; validación extendida reportada hasta 1.048.576 tokens; validado localmente en esta cuantización con contexto de servidor de 4.096 y 32.768 tokens |
| Tipos de cuantizacion | Q3_K_S (aproximadamente 3,47 bits por parámetro de media); 501 tensores Q3_K, 401 tensores F32, 1 tensor Q6_K; routers, normas y biases en F32; matriz de salida en Q6_K; sin importance matrix |
| Idiomas soportados | de, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF v3 (fichero `Kolibri-1-Q3_K_S.gguf`, ~33,87 GB / 31,54 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de Aleph Alpha, con 78.103 millones de parámetros totales almacenados. La model card de esta cuantización no detalla el número de expertos, la dimensión oculta, el número de capas ni el ratio de activación por token; únicamente advierte de que todos los expertos están incluidos y que los parámetros activos por token no representan la memoria necesaria para almacenar el modelo. La arquitectura requiere un parche específico sobre llama.cpp, lo que confirma que no es una arquitectura transformer estándar soportada de forma nativa por el ecosistema GGUF.

En cuanto al entrenamiento, la información disponible en esta ficha es escasa: no se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o similares. El autor remite al informe técnico de Aleph Alpha para esos detalles. La innovación técnica destacable de esta publicación no está en el entrenamiento, sino en la ingeniería de portabilidad: un conversor en streaming para transformar los pesos BF16 originales, un parche de runtime que implementa la arquitectura en llama.cpp y una validación numérica contra una referencia independiente de precisión completa sobre un fixture pequeño. No se aplicó entrenamiento adicional ni calibración con importance matrix durante la cuantización.

## Capacidades

- Generación de texto conversacional en alemán e inglés, según los idiomas declarados en la model card.
- Razonamiento multi-turno y respuesta a preguntas factuales; el autor documenta respuestas correctas a una pregunta de capitales ("Paris") y a una multiplicación ("17 mal 23 ergibt 391").
- Modo de razonamiento (*reasoning mode*) presente en el modelo original, aunque el autor indica explícitamente que no ha validado su funcionamiento en esta cuantización.
- Tool calling / function calling: soportado por el modelo original según su model card, pero no validado en esta conversión.
- Contexto largo: ventana nativa de 262.144 tokens en el modelo base, con validación upstream hasta 1.048.576; en esta cuantización solo se han probado prompts cortos con servidor configurado a 4.096 y 32.768 tokens, sin llenar el contexto.
- Capacidades multilingües limitadas a alemán e inglés según los metadatos; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Experimentación con modelos MoE de gran tamaño en hardware de consumo: gracias a los ~31,54 GiB del fichero y al reparto de capas por Vulkan, es posible ejecutar un modelo de 78.000 millones de parámetros totales en una configuración de RTX 3060 12 GiB más Intel Arc Pro B60 24 GiB, algo inviable con los pesos BF16 originales.
- Investigación sobre cuantización extrema en arquitecturas MoE: el artefacto permite estudiar cómo afecta un esquema Q3_K_S con routers y normas en F32 a la calidad de un modelo MoE, comparando contra la referencia BF16 en tareas controladas.
- Desarrollo y depuración de soporte de arquitecturas nuevas en llama.cpp: el parche incluido y las instrucciones de build sirven como base para quien quiera portar `kolibri1` a otras revisiones o a otros runtimes.
- Procesamiento de documentos largos en alemán o inglés: con la ventana nativa de 262.144 tokens del modelo base, es adecuado para resumir o extraer información de expedientes extensos, siempre que se valide previamente el comportamiento en contextos llenos.
- Asistentes conversacionales en entornos de habla alemana: el modelo declara soporte nativo de alemán, lo que lo hace candidato para prototipos de atención al cliente o asistentes internos en ese idioma.
- Evaluación comparativa de cuantizaciones GGUF: al publicarse con `provenance.json`, `SHA256SUMS` y `validation.json`, el repositorio facilita la reproducibilidad y la comparación con otras cuantizaciones del mismo modelo base.
- Pruebas de concepto de tool calling y razonamiento multi-paso: aunque no validadas en esta cuantización, las capacidades del modelo original permiten plantear prototipos de agentes, con la advertencia de que requieren verificación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las comprobaciones realizadas (verificación de 903 tensores, comparación numérica contra referencia de precisión completa y 169 casos de tokenizador) no constituyen un benchmark de calidad lingüística ni una evaluación de seguridad, y que no se reclama que los resultados del modelo original se transfieran a esta cuantización.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa aproximadamente 31,54 GiB antes de buffers de runtime y caché KV. Con contexto de 4.096 tokens y caché KV en Q8_0, el autor lo ejecutó en una RTX 3060 de 12 GiB más una Intel Arc Pro B60 de 24 GiB (36 GiB de VRAM total) con reparto de capas 1:2.
- Configuración posterior documentada: contexto de servidor de 32.768 tokens con reparto de capas 0,85:2,15 entre la RTX 3060 y la Arc Pro B60.
- GPU recomendadas: no hay recomendaciones oficiales. Por capacidad de memoria, una sola GPU de 48 GiB o superior (A6000, L40S, A100 80 GB, H100) permitiría cargar el modelo sin reparto; configuraciones multi-GPU de consumo son posibles pero requieren el reparto por capas descrito.
- ¿Cabe en GPU de consumo? No en una sola unidad: 31,54 GiB superan la VRAM de cualquier GPU de consumo actual. Sí es viable en configuraciones multi-GPU que sumen al menos ~36 GiB, como la documentada por el autor.
- Opciones de despliegue: exclusivamente llama.cpp con el parche incluido, sobre una revisión pinneada del repositorio (commit `edd6e2bbdad5930899a93db8fa73c3b61c7b9bcc` como base). El autor advierte de que la compatibilidad con otras releases, Ollama o LM Studio no ha sido verificada.
- Latencia y throughput: no disponibles. El autor no publica métricas de velocidad; solo indica que se realizaron ejecuciones locales con prompts cortos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Kolibri-1-Q3_K_S-GGUF (esta ficha) | 78,1 B (MoE) | 262.144 nativos; validado localmente a 4.096 y 32.768 | Apache-2.0 | GGUF Q3_K_S, ~31,54 GiB, requiere parche de llama.cpp |
| Aleph-Alpha/Kolibri-1-BF16 | 78,1 B (MoE) | 262.144 nativos; validación extendida hasta 1.048.576 | Apache-2.0 | BF16, pesos originales en Hugging Face |
| Alternativas de tamaño comparable | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Cuantización no oficial: no está avalada por Aleph Alpha ni por el proyecto llama.cpp, y puede degradar la precisión respecto al modelo BF16 original.
- Requiere un parche de código fuente y una revisión pinneada de llama.cpp; no funciona con llama.cpp estándar, Ollama ni LM Studio según la información del autor.
- Validación funcional muy limitada: dos preguntas respondidas correctamente y comprobaciones estructurales de tensores no equivalen a una evaluación de calidad.
- Contexto largo no validado: las pruebas se hicieron con prompts cortos en servidores de 4.096 y 32.768 tokens; no se ha verificado el comportamiento con el contexto lleno ni con los 262.144 tokens nativos.
- Modo de razonamiento y tool calling no verificados en esta cuantización.
- Idiomas limitados a alemán e inglés; no se declara soporte de castellano.
- Riesgo de alucinación inherente a los modelos de lenguaje, no evaluado específicamente en esta conversión.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Licencia Apache-2.0 en los pesos y configuraciones del modelo original; los artefactos adicionales (parche de runtime, código de referencia) tienen sus propias licencias (Apache-2.0 y MIT) y deben consultarse en `runtime-source/THIRD_PARTY_NOTICES.txt`.
- El usuario es responsable del cumplimiento legal y de la validación en producción; la distribución está sujeta a las licencias incluidas y a sus exenciones de garantía.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/Eliasfpv28/Kolibri-1-Q3_K_S-GGUF
- Modelo base en BF16: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Revisión base de llama.cpp: https://github.com/ggml-org/llama.cpp/tree/edd6e2bbdad5930899a93db8fa73c3b61c7b9bcc
- Referencia de inferencia de Aleph Alpha (licencia separada): https://github.com/Aleph-Alpha/aleph-alpha-inference/tree/049a6a7bd2405b27d6d280d256bd3d585191c7ae
- Informe técnico upstream: https://aleph-alpha.com/downloads/tech-report.pdf
