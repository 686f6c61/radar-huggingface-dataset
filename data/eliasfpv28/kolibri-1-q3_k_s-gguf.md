# Eliasfpv28/Kolibri-1-Q3_K_S-GGUF

## Resumen

Kolibri-1-Q3_K_S-GGUF es una conversión y cuantización no oficial, experimental y publicada por el usuario Eliasfpv28 a partir de los pesos originales de Aleph-Alpha/Kolibri-1-BF16, desarrollados por Aleph Alpha. Se trata de un único fichero GGUF v3 con esquema Q3_K_S (aproximadamente 3,47 bits por parámetro de media), pensado para servir el modelo con llama.cpp mediante un parche de código incluido en el propio repositorio, ya que la revisión base de llama.cpp no soporta la arquitectura `kolibri1`.

El modelo subyacente es un transformer de mezcla de expertos (MoE) con contexto nativo de 262.144 tokens, validado por el proveedor original hasta 1.048.576 tokens. El peso del fichero es de aproximadamente 33,87 GB (31,54 GiB) antes de buffers de ejecución y caché KV, lo que implica que no cabe en una GPU de consumo típica y requiere configuración multi-GPU o aceleradores con memoria agregada elevada. El repositorio es de carácter experimental: el propio autor advierte de que la subida del fichero estaba en curso en el momento de la publicación y de que solo se ha validado localmente a 4.096 tokens de contexto.

Su relevancia ahora es doble: por un lado, permite experimentar con un MoE de contexto muy largo en hardware relativamente modesto si se combinan varias GPU; por otro, sirve como caso de estudio de conversión, cuantización y portado de arquitecturas no soportadas por llama.cpp. No obstante, no existen benchmarks de calidad publicados para esta cuantización y el autor no reclama que los resultados del modelo original se transfieran a esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE); arquitectura GGUF `kolibri1`. Detalle interno no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el autor indica que los parámetros activos por token no representan la memoria necesaria para almacenar el modelo) |
| Longitud de contexto | 262.144 tokens nativos en el modelo original; validación extendida hasta 1.048.576 tokens según Aleph Alpha. Este port solo se ha probado localmente a 4.096 tokens |
| Tipos de cuantizacion | Q3_K_S (mezcla de precisión, ~3,47 bits por parámetro): 501 tensores Q3_K, 401 tensores F32 y 1 tensor Q6_K. Sin importance matrix |
| Idiomas soportados | Alemán (de) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF v3 (fichero `Kolibri-1-Q3_K_S.gguf`) |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base Kolibri-1-BF16 es un transformer de mezcla de expertos, según la etiqueta `mixture-of-experts` y el esquema de cuantización, en el que se conservan todos los expertos en el fichero (el autor subraya que los parámetros activos por token no equivalen a la memoria necesaria para almacenar el modelo). No se dispone de datos sobre el número total de expertos, el número de parámetros totales o activos, la dimensión de las capas, el mecanismo de atención ni la composición exacta del dataset de entrenamiento. Tampoco se documenta en la información proporcionada si hubo fases de RLHF, DPO u otras técnicas de alineamiento.

En cuanto al proceso de conversión, los pesos originales en BF16 se transformaron con un conversor en streaming incluido en el repositorio y se cuantizaron con una revisión parcheada de llama.cpp. Las proyecciones del router, las normalizaciones y los sesgos se mantienen en F32, y la matriz de salida en Q6_K, decisiones que buscan preservar los componentes sensibles a la precisión. No se aplicó entrenamiento adicional ni importance matrix. El port requiere obligatoriamente el parche de código fuente de llama.cpp incluido, ya que la revisión base empleada no reconoce esta arquitectura; la compatibilidad con otras versiones de llama.cpp, con Ollama o con LM Studio no ha sido verificada.

No se documenta ninguna innovación técnica propia de esta distribución más allá del propio portado de la arquitectura: no hay decodificación especulativa, atención lineal ni mecanismos alternativos descritos en la información disponible.

## Capacidades

- Generación de texto en alemán e inglés, que son los dos idiomas declarados tanto en el modelo base como en esta cuantización.
- Arquitectura de mezcla de expertos, lo que implica un coste de cómputo por token condicionado por el enrutamiento del router hacia un subconjunto de expertos (los detalles de cuántos expertos se activan no están disponibles).
- Contexto nativo de 262.144 tokens en el modelo original y validación extendida hasta 1.048.576 tokens por parte de Aleph Alpha.
- El modelo original dispone de modo de razonamiento y soporte de tool calling, según se deduce de las advertencias del propio autor al indicar que estas capacidades no se han validado en este port.
- Capacidad multilingüe limitada a los dos idiomas declarados; no se anuncia soporte adicional.
- En esta cuantización concreta, solo está verificada una respuesta funcional mínima: acierto en una pregunta de capitales ("Paris") y en una multiplicación ("17 mal 23 ergibt 391."). No hay evidencia publicada de que el resto de capacidades se conserve tras la cuantización a 3 bits.

## Casos de uso

- Investigación sobre cuantización de modelos MoE: el fichero permite medir la degradación de Q3_K_S frente a los pesos BF16 originales en tareas controladas, ya que incluye matrices en F32 y Q6_K que sirven de referencia parcial.
- Pruebas de portabilidad de llama.cpp: al requerir un parche específico para la arquitectura `kolibri1`, resulta útil para desarrolladores que necesiten reproducir el proceso de compilación documentado en `runtime-source/README.md` y evaluar la integración con otras revisiones del runtime.
- Inferencia local multilingüe de/en en configuraciones multi-GPU: con 31,54 GiB de pesos, se puede servir en equipos con dos aceleradores combinados, como la configuración probada de RTX 3060 12 GiB más Intel Arc Pro B60 24 GiB con reparto Vulkan 1:2.
- Validación de conversiones y tokenizadores: el repositorio documenta comprobaciones de 903 tensores y 169 casos de tokenizador, por lo que es un punto de partida para replicar pipelines de verificación en conversiones GGUF de arquitecturas no soportadas.
- Evaluación de rendimiento con caché KV cuantizada: la configuración probada usa caché Q8_0 y flash attention a 4.096 tokens, lo que permite estudiar el equilibrio entre memoria de caché y longitud de contexto antes de escalar a ventanas mayores.
- Experimentación con contextos largos: el modelo base admite hasta 262.144 tokens, pero cualquier prueba de contexto largo en este port requiere validación adicional del runtime y de la memoria de caché KV; es un escenario de investigación, no de producción.
- Base para conversiones derivadas: al ser una conversión independiente, sirve como referencia para generar otras cuantizaciones (Q4, Q5, Q8) o para comparar esquemas de cuantización sobre el mismo modelo original.
- Generación de texto en alemán con requisitos de memoria ajustados: para proyectos internos que necesiten un MoE en alemán y dispongan de hardware con memoria agregada suficiente, aunque sin garantías de calidad verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las comprobaciones realizadas no constituyen un benchmark de calidad lingüística, ni una evaluación de seguridad, ni evidencia de que los resultados del modelo original se transfieran a esta cuantización. Los únicos datos de validación disponibles son los siguientes:

| Comprobacion | Resultado |
|---|---|
| Verificación de tensores (nombres, formas, offsets, tipos) | 903 tensores comprobados |
| Router y normalizaciones en F32 | Valores finitos verificados |
| Comparación numérica frente a referencia de precisión completa | Superada en un fixture pequeño |
| Comparación de tokenizador | 169 casos superados |
| Pregunta de capitales | Respuesta "Paris" |
| Multiplicación (17 x 23) | Respuesta "17 mal 23 ergibt 391." |
| Benchmark de calidad lingüística | no disponible |
| Benchmark de contexto largo | no realizado en este port |
| Evaluación de seguridad | no disponible |

## Requisitos de hardware

- Tamaño del fichero: aproximadamente 33,87 GB (31,54 GiB) de pesos, sin contar buffers de ejecución ni caché KV.
- Memoria total necesaria: superior a 31,54 GiB; el autor indica que los requisitos dependen de la máquina y que el fichero por sí solo ya consume esa cantidad antes de los buffers de runtime.
- No cabe en una GPU de consumo de una sola unidad con 24 GiB o menos. Se necesita agregación de memoria entre varias GPU o aceleradores con memoria agregada suficiente.
- Configuración probada: NVIDIA RTX 3060 de 12 GiB más Intel Arc Pro B60 de 24 GiB, con reparto de capas Vulkan en proporción 1:2 y GPU integrada AMD excluida.
- Ajustes de servidor probados: contexto de 4.096 tokens, un único slot de petición, caché de clave/valor Q8_0 y flash attention activado.
- Opciones de despliegue: únicamente llama.cpp parcheado con el código incluido (`llama-server` o `llama-cli`). La compatibilidad con otras versiones de llama.cpp, con Ollama o con LM Studio no ha sido verificada.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo, tiempo hasta el primer token ni consumo energético.
- Para contextos superiores a 4.096 tokens se requiere memoria adicional de caché KV y validación del runtime, no realizada por el autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks verificables que permitan comparar esta cuantización con modelos de la misma categoría (MoE abiertos de contexto largo). La comparación posible se limita a la relación con su propio modelo base, ya que no hay cifras de rendimiento publicadas para este port.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kolibri-1-Q3_K_S-GGUF (esta ficha) | no disponible | 262.144 nativos; probado localmente a 4.096 | Sin benchmarks; validación funcional mínima | Apache-2.0 | GGUF v3 en HuggingFace, requiere llama.cpp parcheado |
| Aleph-Alpha/Kolibri-1-BF16 (modelo base) | no disponible | 262.144 nativos; validado hasta 1.048.576 | Benchmarks del proveedor no incluidos en la informacion disponible | Apache-2.0 | Pesos BF16 en HuggingFace |
| Otros MoE abiertos de contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos contrastados en la información proporcionada |

## Limitaciones y advertencias

- Cuantización agresiva: Q3_K_S a aproximadamente 3,47 bits por parámetro puede reducir la precisión respecto a los pesos BF16 originales. El autor no reclama que las capacidades se mantengan intactas.
- Validación funcional mínima: las únicas pruebas publicadas son una pregunta de capitales y una multiplicación, además de comprobaciones estructurales de tensores y tokenizador. No hay evaluación de calidad lingüística ni de seguridad.
- Contexto probado de solo 4.096 tokens: el modo de razonamiento, el tool calling y los contextos largos no han sido validados en este port. La ventana de 4.096 tokens es una configuración de servicio, no un límite intrínseco de la cuantización.
- Dependencia de un parche de llama.cpp: la revisión base no soporta la arquitectura `kolibri1`. El uso con versiones no parcheadas, Ollama o LM Studio puede fallar o no estar verificado.
- Subida incompleta en el momento de publicación: la model card advierte de que el fichero GGUF estaba aún transfiriéndose, por lo que la integridad del artefacto publicado conviene verificarla con `SHA256SUMS` y `provenance.json`.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de alucinación para esta cuantización ni para el modelo original en la información proporcionada.
- Sesgos: no se dispone de información sobre sesgos conocidos del modelo base ni de esta conversión.
- Idiomas limitados a alemán e inglés; no se declara soporte de otros idiomas, incluido el español.
- Licencia: los pesos originales y las configuraciones publicadas son Apache-2.0. La concesión de licencia del repositorio cubre los pesos y ficheros de configuración; otros artefactos, como el parche de runtime, tienen sus propias licencias (Apache-2.0 y MIT) detalladas en `THIRD_PARTY_NOTICES.txt`. El uso comercial queda sujeto a los términos de esas licencias y a las responsabilidades del usuario.
- Falta de respaldo de los proveedores: el autor indica que Aleph Alpha y el proyecto llama.cpp no han avalado esta conversión.
- Sin descargas ni interacciones registradas en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Eliasfpv28/Kolibri-1-Q3_K_S-GGUF
- Modelo base original: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Revisión fijada de los pesos BF16: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16/tree/7a8f290e7858825c3cf5e4c447ba68345de9f1d3
- Revisión base de llama.cpp: https://github.com/ggml-org/llama.cpp/tree/edd6e2bbdad5930899a93db8fa73c3b61c7b9bcc
- Referencia de inferencia de Kolibri con licencia separada: https://github.com/Aleph-Alpha/aleph-alpha-inference/tree/049a6a7bd2405b27d6d280d256bd3d585191c7ae
- Informe técnico del modelo original: https://aleph-alpha.com/downloads/tech-report.pdf
- Resumen del contenido de entrenamiento: https://aleph-alpha.com/downloads/data-summary.pdf
- Documentación de modificaciones del port: MODIFICATIONS.md (incluido en el repositorio)
- Procedencia de la conversión: provenance.json (incluido en el repositorio)
- Instrucciones de compilación del runtime: runtime-source/README.md (incluido en el repositorio)
- Resultados de validación: validation.json (incluido en el repositorio)
- Avisos de terceros del runtime: runtime-source/THIRD_PARTY_NOTICES.txt (incluido en el repositorio)
