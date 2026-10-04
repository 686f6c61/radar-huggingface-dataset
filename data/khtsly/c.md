# khtsly/c

## Resumen

khtsly/c es un checkpoint periódico publicado durante el entrenamiento del modelo, concretamente en el paso 1900, según indica su propia model card. No se trata de un modelo terminado: el autor lo sube a HuggingFace como copia de seguridad y para poder comparar diferencias entre estados de entrenamiento. La arquitectura declarada es un "mini port" de Kimi K3, implementado en la clase `KimiLinearForCausalLM`, con etiquetas que apuntan a `kimi_linear` y `kimi-k3`.

El modelo tiene 1.500.480.224 parámetros totales (aproximadamente 1,5 mil millones, según los datos reales de los archivos safetensors) y está etiquetado únicamente para inglés. El repositorio ocupa 50,2 GB, un tamaño muy superior al que correspondería a los pesos en precisión de inferencia, lo que sugiere que incluye artefactos de entrenamiento (estados del optimizador, shards en alta precisión o copias múltiples). No se declara licencia, longitud de contexto ni composición del dataset.

Su relevancia es limitada y muy específica: sirve como referencia técnica para quien quiera inspeccionar una implementación experimental de atención lineal tipo Kimi, pero no es un artefacto apto para producción ni para evaluación de capacidades. Cuenta con 333 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KimiLinearForCausalLM (mini port de Kimi K3; transformer con atención lineal, según etiquetas del autor) |
| Parametros totales | 1.500.480.224 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers, con `custom_code`) |

## Arquitectura y entrenamiento

El autor describe el modelo como un "mini port" de Kimi K3 bajo la clase `KimiLinearForCausalLM`, dentro de la librería `transformers`, con la etiqueta de librería `kimi_linear`. Esto apunta a una arquitectura de atención lineal o híbrida, característica de la familia Kimi Linear de Moonshot AI, aunque la model card no especifica capas, dimensión oculta, número de cabezas, tipo de atención exacto ni ningún otro hiperparámetro. Tampoco se detalla si emplea mezcla de expertos: con 1,5 mil millones de parámetros totales y sin mención de parámetros activos, lo más probable es que sea un modelo denso, pero no puede confirmarse con la información disponible.

Respecto al entrenamiento, solo se sabe que el checkpoint corresponde al paso 1900 de un proceso en curso. No se indican el número total de tokens, la composición del dataset, la longitud de secuencia de entrenamiento ni si hubo fases de ajuste fino con RLHF, DPO u otras técnicas de alineamiento. Las etiquetas `luau` y `experimental-checkpoint` sugieren un contexto de experimentación, posiblemente relacionado con generación o evaluación de código en Lua, pero se trata de una inferencia a partir de etiquetas y no de un dato confirmado por el autor.

## Capacidades

- Generación de texto autoregresiva en inglés, como tarea declarada en el pipeline (`text-generation`).
- Capacidad real de razonamiento, código o matemáticas: no evaluada ni documentada; al ser un checkpoint intermedio, el rendimiento esperable es bajo e inestable.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Requiere `trust_remote_code` y código personalizado incluido en el repositorio para poder cargarse.

## Casos de uso

- Auditoría de implementaciones de atención lineal: el repositorio permite inspeccionar cómo se implementa la clase `KimiLinearForCausalLM` y el código personalizado asociado, útil para desarrolladores que estudian arquitecturas alternativas al transformer con atención cuadrática.
- Comparación de estados de entrenamiento: al estar etiquetado como checkpoint periódico para "diffing", sirve para analizar cómo evolucionan los pesos entre pasos y detectar inestabilidades de entrenamiento.
- Reproducción de experimentos de investigación: un equipo que entrene su propio "mini port" puede usar estos pesos como punto de partida o como referencia de inicialización, siempre que la licencia lo permita (actualmente sin especificar).
- Pruebas de integración de código personalizado en transformers: útil para validar que el flujo de `trust_remote_code`, carga de safetensors y registro de arquitecturas funciona en un entorno controlado.
- Docencia y formación técnica: como ejemplo real de repositorio experimental con arquitectura no estándar, para ilustrar buenas y malas prácticas al publicar checkpoints (por ejemplo, la ausencia de licencia y de model card detallada).
- No se recomienda su uso en atención al cliente, generación de código en producción, RAG, resumen documental ni ninguna aplicación final, dado que es un artefacto intermedio sin evaluación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna métrica (MMLU, HumanEval, GSM8K ni similares), y los resultados de la búsqueda web realizada no contienen información relacionada con el modelo.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (1.500.480.224), no de mediciones publicadas por el autor:

- Pesos en fp32: aproximadamente 6 GB.
- Pesos en fp16/bf16: aproximadamente 3 GB.
- Pesos en int8: aproximadamente 1,5 GB.
- Pesos en int4 (si existiera una cuantización tipo Q4): aproximadamente 0,9-1,1 GB.
- A esas cifras hay que sumar la caché KV y el overhead del runtime, que dependen de la longitud de contexto efectiva (no documentada).
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, así como en GPUs de 8 GB si se usa cuantización de 8 o 4 bits.
- GPU de datacenter: A100, H100 o L40S son sobredimensionadas para 1,5B de parámetros, salvo que se quiera servir con lotes muy grandes.
- Opciones de despliegue: al ser un checkpoint con `custom_code`, la vía más realista es `transformers` con `trust_remote_code=True`; vLLM, TGI, llama.cpp u Ollama requerirían una integración específica de la arquitectura Kimi Linear que no está documentada en la información disponible.
- Latencia y throughput: no disponibles.
- Nota: el repositorio ocupa 50,2 GB, muy por encima del espacio necesario para los pesos de inferencia, por lo que hay que prever ese espacio en disco antes de descargarlo.

## Comparativa con modelos similares

La comparativa se establece con modelos densos de tamaño cercano en el rango 1-2B, que son las alternativas realistas en esa franja. Los datos de los modelos de referencia son aproximados y provienen de sus fichas públicas; el modelo analizado no tiene métricas publicadas.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| khtsly/c | 1,5B | no disponible | no disponible | Checkpoint intermedio (paso 1900) |
| Qwen2.5-1.5B | ~1,5B | 32.768 tokens | Apache 2.0 | Modelo final, con benchmarks publicados |
| SmolLM2-1.7B | ~1,7B | 8.192 tokens | Apache 2.0 | Modelo final, con benchmarks publicados |
| Llama 3.2 1B | ~1,23B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Modelo final, con benchmarks publicados |

La diferencia fundamental no es de tamaño, sino de madurez: las tres alternativas son modelos terminados, con licencia explícita, contexto documentado y evaluaciones publicadas, mientras que khtsly/c es un estado intermedio de entrenamiento sin ninguno de esos elementos. Para cualquier tarea real, las alternativas son preferibles.

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento, no un modelo final: la calidad de generación es impredecible y puede degradarse, repetirse o producir texto incoherente.
- No se declara licencia, por lo que no hay autorización explícita para uso comercial ni para redistribución. En ausencia de licencia, lo prudente es asumir todos los derechos reservados.
- No hay datos sobre sesgos, datos de entrenamiento ni filtrado de contenido; no puede evaluarse el riesgo de generar material dañino.
- Riesgo de alucinación: no cuantificado, y previsiblemente alto dado el estado intermedio del entrenamiento.
- Soporte exclusivo de inglés según la etiqueta declarada; no hay evidencias de capacidades en castellano.
- Longitud de contexto desconocida, lo que impide planificar cargas de trabajo con ventanas largas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código publicado por el autor; conviene revisarlo antes de cargar el modelo en un entorno con datos sensibles.
- El repositorio ocupa 50,2 GB frente a los aproximadamente 3 GB de los pesos en fp16, lo que sugiere artefactos adicionales de entrenamiento; verificar el contenido antes de descargar.
- Ausencia total de benchmarks: no hay ninguna base objetiva para comparar su rendimiento con alternativas.
- Fecha de creación del repositorio: 3 de octubre de 2026; última actualización, 3 de octubre de 2026, según los metadatos de HuggingFace.
- Los resultados de la búsqueda web asociada a este modelo devolvieron exclusivamente contenido no relacionado y de carácter adulto; no se ha extraído ninguna fuente técnica de ellos.

## Enlaces

- HuggingFace: https://huggingface.co/khtsly/c
- No se han encontrado enlaces relevantes adicionales (papers, blogs, repositorios o demos) en la busqueda web realizada. Los resultados devueltos por el buscador no guardan relacion con este modelo y se han descartado.
