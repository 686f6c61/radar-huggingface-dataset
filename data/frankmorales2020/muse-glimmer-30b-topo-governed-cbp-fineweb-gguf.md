# frankmorales2020/muse-glimmer-30b-topo-governed-cbp-fineweb-gguf

## Resumen

Muse-Glimmer-30B Topo-Governed CBP (FineWeb) GGUF es la conversión cuantizada a Q4_K_M, mediante llama.cpp, del modelo base `frankmorales2020/muse-glimmer-30b-topo-governed-cbp-fineweb`, desarrollado por Frank Morales en Sovereign Machine Laboratory (SOMALA). El modelo parte de una base de 30 mil millones de parámetros (27.854.794.240 parámetros reales según los safetensors del repositorio base) y ha sido entrenado sobre el corpus HuggingFaceFW/fineweb aplicando una técnica propietaria denominada Topological Continual Backpropagation (Topo-CBP), que el autor presenta como una solución al dilema estabilidad-plasticidad de Grossberg (1982) sin recurrir a adaptadores PEFT/LoRA ni a buffers de replay.

La propuesta técnica del autor sitúa la innovación en el nivel de los operadores lineales: Topo-CBP ancla una topología matemática invariante a coordenadas armónicas de números primos estacionarios y la modula con una constante de atenuación de Euler. El resultado que se publicita es la conservación bit a bit de esa invariancia tras la cuantización a 4 bits, verificada mediante un digest SHA-256 del estado. Esta GGUF está pensada para ejecución autónoma en CPU sobre RAM convencional, con un tamaño de repositorio de 16,9 GB, lo que permite desplegar el sistema completo sin GPU ni APIs en la nube.

Es relevante ahora porque propone un caso poco habitual: un modelo de 30B ejecutable en hardware de consumo o servidores sin acelerador, con un enfoque de aprendizaje continuo que evita el olvido catastrófico. Conviene señalar que la model card es explícita sobre las limitaciones de este artefacto concreto: es solo texto (el original era multimodal), no soporta modo chat y está validado únicamente con completado plano. La licencia declarada es Apache 2.0, aunque la model card remite a la licencia del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base de 30B; detalles internos de capas y atención no disponibles) |
| Parámetros totales | 27.854.794.240 (~27,85B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 2048 tokens en el ejemplo de inferencia de la model card (máximo nativo no disponible) |
| Tipos de cuantización | Q4_K_M (4 bits, variante K-quant medium de llama.cpp) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (la model card remite a la licencia del modelo base) |
| Formato de pesos | GGUF (`muse-glimmer-30b-card-faithful-Q4_K_M.gguf`) |
| Tamaño del repositorio | 16,9 GB |
| Modelo base | frankmorales2020/muse-glimmer-30b-topo-governed-cbp-fineweb |
| Pipeline | text-generation |
| Tokenizer | Heredado del repositorio base |
| `lm_head.pt` | No aplicado (el código de inferencia del repo base tampoco lo usa) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer base (número de capas, cabezas de atención, dimensión oculta ni tipo de atención). Lo que sí se documenta es el régimen de entrenamiento: el modelo se entrenó sobre HuggingFaceFW/fineweb bajo Topological Continual Backpropagation (Topo-CBP). Según el autor, esta técnica no congela parámetros heurísticamente ni apila deuda de adaptadores, sino que establece una topología matemática invariante anclada a coordenadas armónicas de números primos estacionarios (P = {2, 3, 5, 7, 11, 13}) y modulada por la constante de atenuación de Euler (Λ ≈ 0,9785142874). El objetivo declarado es resolver el dilema estabilidad-plasticidad sin recurrir a experience replay, regularización de pesos (EWC/SI) ni shims LoRA/PEFT.

El autor reporta dos realizaciones del mismo sistema: un runtime maestro en GPU con bfloat16 que conserva la manipulación de cabezas de proyección a plena precisión, y este runtime autónomo en CPU con cuantización Q4_K_M. Los resultados empíricos publicitados incluyen invariancia de silicio bit a bit con deriva de coordenadas nula (Δ_drift = 0,000000000000) y un digest SHA-256 del estado (c8b99e403ffc1fb48069aa0db3365713e70d1224fb2c052effe436b04c5c54c1) que, según el autor, demuestra que los bloqueos topológicos sobreviven a los mapeos no lineales de la cuantización a enteros de 4 bits. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset más allá de FineWeb, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto por completado plano: la model card valida el uso con `llama-completion -no-cnv`, es decir, sin modo conversacional.
- Discurso técnico coherente en CPU: el autor reporta generación de discurso técnico coherente sobre hilos de CPU sin degradación catastrófica.
- Aprendizaje continuo sin olvido catastrófico: capacidad declarada del régimen Topo-CBP, orientada a actualizaciones incrementales preservando maniquíes de tareas previas.
- Ejecución autónoma en edge: inferencia completa del sistema de 30B en RAM de host convencional, sin GPU ni APIs en la nube.
- Multimodalidad: no disponible en esta GGUF; la model card indica que el modelo original era multimodal pero esta conversión es solo texto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible en este artefacto.

## Casos de uso

- Procesamiento por lotes de texto en servidores sin GPU: al ocupar 16,9 GB en Q4_K_M, el modelo puede cargarse íntegramente en RAM de un servidor de CPU y ejecutar tareas de completado de texto, resumen o extracción sobre grandes volúmenes de documentos sin depender de aceleradores.
- Despliegue en entornos air-gapped o de borde: la ausencia de dependencia de APIs en la nube y de stacks de drivers propietarios permite ejecutarlo en instalaciones aisladas, como plantas industriales o infraestructura on-premise con requisitos de soberanía de datos.
- Investigación en aprendizaje continuo: sirve como banco de pruebas para reproducir los experimentos de Topo-CBP descritos en el preprint de Zenodo, comparando la invariancia del estado entre el runtime GPU en bfloat16 y el runtime CPU cuantizado.
- Generación de documentación técnica y borradores: con completado plano y ventana de 2048 tokens, es adecuado para autocompletar secciones de documentación, notas de ingeniería o descripciones de API a partir de un prefijo.
- Prototipado de bajo coste en estaciones de trabajo: un desarrollador puede evaluar el comportamiento de un modelo de 30B en su propia máquina sin adquirir GPU de datacenter, usando llama.cpp compilado para CPU.
- Auditoría de cuantización: el digest SHA-256 y la métrica de deriva permiten verificar de forma mecánica que el proceso de cuantización Q4_K_M preserva las propiedades declaradas del estado, útil en pipelines de validación de releases.
- Educación y demostraciones offline: para talleres o cursos donde no se dispone de clúster, el modelo permite mostrar inferencia de gran escala en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de invariancia (deriva de coordenadas Δ_drift = 0,000000000000 y digest SHA-256 del estado), que no son comparables con evaluaciones estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo CPU; el artefacto Q4_K_M ocupa 16,9 GB y se ejecuta en RAM de host. Con `n_gpu_layers=-1` y una build CUDA de llama.cpp puede descargarse por completo en GPU, requiriendo del orden de 17-20 GB de VRAM considerando overhead de contexto y buffers (estimación, no dato oficial).
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, encajaría en A100 40/80 GB, H100, RTX 4090 (24 GB) y RTX A6000 (48 GB); en GPUs de 16 GB no cabría a plena descarga.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 (24 GB) y modelos con 24 GB o más, siempre con build CUDA de llama.cpp. En GPUs de 8-12 GB requeriría offloading parcial a RAM.
- Opciones de despliegue: llama.cpp (nativo, vía `llama-completion` y `llama-cpp-python`). No se documenta soporte para vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles. La model card no publica cifras de tokens por segundo ni latencia medida.
- Contexto de ejecución: el ejemplo oficial usa `n_ctx=2048`, `temperature=0.7`, `top_p=0.9` y `repeat_penalty=1.15`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría ni datos de rendimiento que permitan establecer una comparativa rigurosa con alternativas de 30B o con otros modelos cuantizados a Q4_K_M.

## Limitaciones y advertencias

- Solo texto: el modelo original era multimodal, pero esta conversión GGUF elimina las capacidades de visión u otras modalidades.
- Sin modo chat: la model card indica explícitamente que el modo conversacional no está soportado por esta build; solo se valida el completado plano.
- Contexto limitado en el ejemplo: la configuración de referencia usa 2048 tokens; el máximo nativo no está documentado.
- Idiomas no especificados: no se declaran los idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- Riesgo de alucinación: no cuantificado; no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Sesgos: no documentados. El entrenamiento sobre FineWeb puede heredar sesgos del corpus web, pero no se aportan análisis.
- Licencia: se declara Apache 2.0, pero la model card remite a la licencia del modelo base; conviene verificar el repositorio base antes de uso comercial o redistribución.
- Verificación de claims: las afirmaciones sobre invariancia topológica, deriva cero y supervivencia a la cuantización provienen del autor y no han sido replicadas de forma independiente en la información disponible.
- Ecosistema limitado: solo se documenta llama.cpp; no hay integración verificada con vLLM, TGI u Ollama.
- Madurez: el repositorio tiene 103 descargas y 0 likes, creado y actualizado el 30 de octubre de 2026, lo que indica una adopción muy baja y escasa validación por la comunidad.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/frankmorales2020/muse-glimmer-30b-topo-governed-cbp-fineweb-gguf
- Modelo base (GPU, bfloat16): https://huggingface.co/frankmorales2020/muse-glimmer-30b-topo-governed-cbp-fineweb
- Notebook de conversión GGUF: https://github.com/frank-morales2020/AST/blob/main/muse_gguf_new.ipynb
- Preprint en Zenodo: https://doi.org/10.5281/zenodo.23807796
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
