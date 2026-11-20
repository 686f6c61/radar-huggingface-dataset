# drluoto/Qwen3.8-Flash-Next-MTP-GGUF

## Resumen

Qwen3.8-Flash-Next-MTP-GGUF es un cabezal de borrador (*draft head*) para decodificación especulativa del modelo Qwen3.8-Flash-Next, publicado por el desarrollador independiente drluoto bajo el proyecto Vitronia. No es un modelo autónomo: se carga junto al modelo principal (trunk) y su función es proponer varios tokens candidatos que el modelo grande verifica en paralelo, acelerando la decodificación sin alterar la calidad de las respuestas. El repositorio contiene únicamente los tensores del cabezal MTP (*multi-token prediction*), no los pesos completos del modelo base.

El paquete está empaquetado en formato GGUF y optimizado para llama.cpp con soporte de *drafting* desacoplado, una funcionalidad que en el momento de la publicación seguía en revisión upstream (PR 27836) y requiere una bifurcación propia del runtime. Las mediciones del autor se realizaron sobre un AMD Ryzen AI Max+ 395 con 128 GB de memoria unificada, backend Vulkan y un trunk Qwen3.8-Flash-Next de 86 GB cuantizado en Q5_K, alcanzando entre 31 y 61 tok/s de decodificación de pila completa según la carga de trabajo.

Su relevancia es práctica: demuestra que un cabezal de borrador más pequeño (Q5_K, 2,70 GB) supera al Q8_0 (3,64 GB) tanto en velocidad como en tasa de aceptación, y documenta con detalle el proceso de requantización, la configuración exacta de llama-server y las trampas del hardware objetivo. Es material de referencia para quien despliegue Qwen3.8-Flash-Next en equipos con memoria unificada y quiera exprimir la decodificación especulativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal MTP (*multi-token prediction*) para decodificación especulativa; se ejecuta junto al transformer del modelo base Qwen3.8-Flash-Next |
| Parametros totales | 3.885.113.088 (aproximadamente 3,89 mil millones, correspondientes al cabezal de borrador) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens en la configuración de referencia (`-c 262144`); los ficheros `frspec-65k` incorporan un vocabulario recortado a 65k entradas |
| Tipos de cuantizacion | Q5_K, Q8_0, Q4_K_M y bf16 (referencia) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.8-Flash-Next) |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado desde cero, sino un conjunto de 31 tensores de cabezal de borrador extraídos del checkpoint oficial de Qwen3.8-Flash-Next mediante lecturas por rangos sobre los shards de safetensors (7,3 GB de los 360 GB totales), junto con los embeddings compartidos y el `lm_head`. La arquitectura subyacente es la del mecanismo MTP del modelo base: un cabezal ligero que predice varios tokens futuros de forma autoregresiva y cuya salida se somete a verificación especulativa por parte del modelo principal, que acepta o rechaza cada propuesta.

El detalle técnico más relevante es la decisión de requantizar el fichero Q5_K a partir del Q8_0 en lugar de construirlo directamente desde bf16. El autor midió ambas variantes con el mismo banco de pruebas y la ruta de requantización resultó más rápida, un comportamiento contraintuitivo que atribuye al orden de reducción en coma flotante. También se recorta el vocabulario a 65k entradas en los ficheros `frspec-65k` para reducir los bytes leídos por token propuesto, dado que el `lm_head` del borrador representa el 81 % de los bytes consumidos por token generado. No se documentan datos de entrenamiento, composición del dataset ni fases de RLHF o DPO, ya que el trabajo es de conversión y optimización, no de entrenamiento.

## Capacidades

- Aceleración de decodificación: propone hasta 3 tokens por paso (`--spec-draft-n-max 3`) que el modelo principal verifica en paralelo, con tasas de aceptación medidas de 0,86 a 0,89 en código corto y de 0,35 a 0,39 en prosa.
- Integración con llama.cpp: requiere una compilación con soporte de cabezal de borrador desacoplado (`--spec-type draft-mtp`), disponible en la bifurcación `drluoto/llama.cpp`, rama `strix-halo-vulkan`.
- Compatibilidad con endpoints: el repositorio está etiquetado como `endpoints_compatible`, lo que permite su uso en infraestructura de inferencia gestionada.
- Conversación multi-turno: hereda la naturaleza conversacional del modelo base, aunque el cabezal por sí solo no genera respuestas válidas.
- Soporte de tool calling y visión: el autor reporta paridad de resultados con el cabezal Q8_0 en llamadas a herramientas, comprobaciones de corrupción en salidas largas y tareas de visión, siempre a través del modelo base.
- Determinismo: la salida con decodificación voraz es determinista entre ejecuciones, pero no idéntica a la del cabezal Q8_0, porque cambia el agrupamiento de tokens verificados y con ello el orden de reducción en coma flotante.

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next en estaciones de trabajo con memoria unificada: un Ryzen AI Max+ 395 con 128 GB puede alojar el trunk Q5_K de 86 GB y el cabezal de 2,70 GB, logrando 46,5 tok/s de media en decodificación de pila completa, suficiente para asistentes interactivos locales.
- Generación de código en IDE o CLI: la carga de "código corto" alcanza 60,9 tok/s con el cabezal Q5_K, lo que hace viable la autocompletación y generación de fragmentos con latencia baja en un equipo de sobremesa sin GPU dedicada.
- Reescritura y edición de documentos largos: con 56,2 tok/s en tareas de reescritura a 8k de contexto y 49,1 tok/s a 32k, el conjunto es adecuado para pipelines de transformación de texto por lotes.
- Procesamiento de contexto largo: la configuración de referencia usa 262.144 tokens de ventana con `-ub 2048 -b 2048`, lo que permite analizar repositorios o expedientes completos manteniendo velocidad aceptable (37,8 tok/s en código nuevo a 32k).
- Servicio de inferencia local con dos slots paralelos: el flag `-np 2` de la configuración publicada permite atender dos peticiones concurrentes en el mismo equipo, útil para equipos pequeños que comparten un servidor.
- Investigación en decodificación especulativa: el repositorio documenta el impacto del tamaño del cabezal en la tasa de aceptación, sirviendo como caso de estudio reproducible para experimentos con MTP y *self-speculative decoding*.
- Evaluación comparativa de cuantizaciones: los seis ficheros publicados (Q4_K_M, Q5_K, Q8_0, bf16 y variantes de vocabulario) permiten medir el compromiso entre tamaño, velocidad y calidad de las propuestas en distintos workloads.

## Benchmarks y rendimiento

Rendimiento de decodificación de pila completa (trunk Q5_K de 86 GB más cabezal), en tok/s, sobre Ryzen AI Max+ 395 con 128 GB, backend Vulkan, reloj de GPU fijado y decodificación voraz:

| Carga de trabajo | Cabezal Q8_0 65k | Cabezal Q5_K 65k | Variación |
|---|---:|---:|---:|
| Código corto | 58,2 | 60,9 | +4,6 % |
| Código nuevo a 8k | 43,0 | 43,2 | +0,6 % |
| Prosa a 8k | 29,4 | 31,9 | +8,7 % |
| Reescritura a 8k | 55,2 | 56,2 | +1,6 % |
| Código nuevo a 32k | 37,1 | 37,8 | +1,6 % |
| Reescritura a 32k | 48,4 | 49,1 | +1,4 % |
| Media | 45,2 | 46,5 | +2,8 % |

Tasas de aceptación del borrador: 0,86 → 0,89 en código corto y 0,35 → 0,39 en prosa. La mejora se concentra en las cargas con menor aceptación, y es nula en las dos cargas donde ya era 1,00. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada para el cabezal: 2,70 GB (Q5_K), 3,64 GB (Q8_0 con vocabulario recortado), 4,14 GB (Q8_0 completo), 2,79 GB (Q4_K_M) y 7,78 GB (bf16).
- Memoria total del sistema: el escenario medido requiere aproximadamente 89 GB sumando el trunk Q5_K de 86 GB y el cabezal; encaja en equipos con 128 GB de memoria unificada.
- GPU validadas: AMD Ryzen AI Max+ 395 (Strix Halo) con backend Vulkan. No se documentan pruebas en A100, H100 ni RTX 4090.
- Advertencia sobre ROCm: el autor indica que ROCm devuelve respuestas incorrectas en este chip sin notificarlo, y recomienda Vulkan de forma explícita.
- Ajuste de reloj: en perfil `auto` la GPU fluctúa y se pierde cerca del 20 % de rendimiento; hay que fijar el reloj con `rocm-smi -d 0 --setperflevel high`.
- Despliegue: llama-server con `--spec-type draft-mtp`, `-fa 1 -ub 2048 -b 2048 -c 262144 -np 2 -lm dio --jinja`. Requiere una compilación con soporte de borrador desacoplado, aún en revisión upstream (PR 27836).
- Throughput observado: entre 29,4 y 60,9 tok/s según carga y cabezal, siempre con el trunk Q5_K de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drluoto/Qwen3.8-Flash-Next-MTP-GGUF | Cabezal de borrador MTP | 3,89 mil millones | 262.144 tokens (config. de referencia) | qwen-community-1.0 | GGUF en Hugging Face, 1.477 descargas |
| Qwen/Qwen3.8-Flash-Next | Modelo base completo | no disponible en la información | no disponible | qwen-community-1.0 | Checkpoint oficial de 360 GB |
| drluoto/Qwen3.8-Flash-Next-AgenticRequant-Q5K-GGUF | Trunk requantizado por frecuencia de lectura | no disponible | no disponible | no disponible | GGUF en Hugging Face |
| Cabezal Q8_0 del mismo repositorio | Cabezal de borrador MTP | mismo cabezal, mayor precisión | idéntico | qwen-community-1.0 | 3,64 GB, opción anterior por defecto |

No se dispone de datos de benchmarks comparativos con cabezales de borrador de otros proyectos en la información proporcionada.

## Limitaciones y advertencias

- No es utilizable de forma autónoma: sin el trunk Qwen3.8-Flash-Next cargado, el cabezal no produce respuestas coherentes.
- Dependencia de una bifurcación no oficial de llama.cpp: el soporte de borrador desacoplado sigue en revisión upstream y la rama `strix-halo-vulkan` puede divergir o quedar sin mantenimiento.
- Resultados no extrapolables: las cifras de velocidad y aceptación se midieron exclusivamente con el trunk Q5_K del autor en Strix Halo con Vulkan; otros trunks, cuantizaciones o backends pueden dar resultados distintos.
- Salidas no idénticas al cabezal Q8_0: aunque la calidad se mantiene en las comprobaciones realizadas, el texto generado difiere por el orden de reducción en coma flotante, lo que complica la reproducibilidad entre configuraciones.
- Riesgo específico de ROCm: el autor reporta respuestas incorrectas silenciosas en este chip, un fallo difícil de detectar en producción.
- Idiomas soportados no documentados: no hay información sobre cobertura lingüística del cabezal ni del modelo base en esta ficha.
- Licencia qwen-community-1.0: es necesario revisar los términos del modelo base para uso comercial, ya que el repositorio solo enlaza al LICENSE del modelo original y no añade condiciones propias.
- Sesgos y alucinaciones: no se documentan evaluaciones específicas; al heredar el comportamiento del modelo base, arrastra sus sesgos y su propensión a la alucinación sin mitigaciones adicionales.
- Vocabulario recortado: los ficheros `frspec-65k` pueden proponer peor en dominios con vocabulario especializado; el autor recomienda el Q8_0 de vocabulario completo en ese caso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drluoto/Qwen3.8-Flash-Next-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Trunk de referencia (AgenticRequant Q5K): https://huggingface.co/drluoto/Qwen3.8-Flash-Next-AgenticRequant-Q5K-GGUF
- Proyecto y pila completa: https://github.com/drluoto/flash-next-strix-halo
- Bifurcación de llama.cpp: https://github.com/drluoto/llama.cpp/tree/strix-halo-vulkan
- Pull request upstream de soporte de borrador desacoplado: https://github.com/ggml-org/llama.cpp/pull/27836
- Discusión sobre ajuste del borrador al modelo objetivo: https://github.com/ggml-org/llama.cpp/discussions/27950
