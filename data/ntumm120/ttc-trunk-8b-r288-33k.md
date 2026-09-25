# ntumm120/ttc-trunk-8b-r288-33k

## Resumen

ttc-trunk-8b-r288-33k es un artefacto de investigación publicado por ntumm120 (Neehal Tumma, MIT CSAIL y Liquid AI) dentro de la familia "TTC cache writer". No es un modelo de lenguaje completo listo para generar texto: es un componente escritor de caché ("cache writer") entrenado sobre una columna vertebral Qwen/Qwen3-8B congelada. En concreto, aprende a escribir en un sustrato de caché recurrente de rango de estado 288 filas (equivalentes a unos 295 tokens de KV-caché), procesando flujos de 33.000 tokens con bloques de 2.048, política FIFO con 3 sinks y "fold rowmax".

Este checkpoint representa el punto más pequeño de la escalera de tamaños de estado de la familia, cuyos hermanos son r512, r1024, r2048 (el modelo principal o "headliner"), r4096 y r8192. La receta de datos T y el tronco de entrenamiento son idénticos a los del headliner (ntumm120/ttc-trunk-8b-r2048-33k); lo único que cambia es el tamaño del estado. El escritor usa d_c 512, learning rate constante de 1e-3 (WSD trunk), 2.000 pasos planificados y guardados reanudables cada 500 pasos.

Su relevancia es experimental: sirve para estudiar el compromiso entre tamaño de estado recurrente y calidad de recuperación de contexto largo. El repositorio incluye la rama a1000_mixB con un checkpoint (writer_s001250.pt) resultante de un decaimiento de 250 pasos sobre el guardado del paso 1000. No se han publicado resultados de benchmarks en la información disponible, y los readouts están pendientes de subida según la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cache writer recurrente sobre backbone transformer congelado (Qwen/Qwen3-8B); sustrato de caché con rango de estado 288 filas |
| Parametros totales | no disponible (el repositorio ocupa 3,9 GB e incluye el escritor, no los pesos completos del backbone) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Flujos de 33.000 tokens; bloques de 2.048 con FIFO y 3 sinks; estado equivalente a ~295 tokens KV |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (.pt); contiene las claves writer, shared, args, step |

## Arquitectura y entrenamiento

La arquitectura combina un backbone transformer denso congelado (Qwen3-8B) con un escritor de caché recurrente entrenable. El estado de dicho caché se define por un rango de 288 filas, equivalentes a unos 295 tokens de KV-caché. El procesamiento de secuencias se realiza sobre flujos de 33.000 tokens divididos en bloques de 2.048, con una política de expulsión FIFO complementada con 3 sinks y una operación de "fold rowmax". El escritor emplea una dimensión d_c de 512.

El entrenamiento sigue la receta del headliner r2048-33k: datos T idénticos (según el repositorio principal, ProLong con una mezcla de doc-QA generado v2; aproximadamente 0,8 y 0,2 respectivamente), learning rate constante de 1e-3 con un esquema WSD para el tronco y 2.000 pasos planificados, con guardados reanudables cada 500 pasos. La distribución de cómputo se escalona: 2 nodos hasta el paso 1000 y 4 nodos a partir del paso 1001. La rama publicada `branches/a1000_mixB/writer_s001250.pt` corresponde a un "anneal" de 250 pasos con decaimiento arm-B (mixB) desde el guardado retenido del paso 1000, con el optimizador eliminado. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Escritura en caché recurrente: el componente aprende a volcar información de flujos de hasta 33.000 tokens en un estado de 288 filas, permitiendo recuperación de contexto largo sin almacenar toda la KV-caché.
- Investigación sobre compromiso tamaño-calidad: es el punto mínimo de la escalera de estados (r288 frente a r512, r1024, r2048, r4096 y r8192), lo que permite trazar curvas de rendimiento frente a coste de memoria.
- Evaluación de recuperación de contexto: el repositorio incluye planificación de readouts sobre conjuntos como tqa_contig, tqa, niah (single y multikey), tqa_doc y LongPPL.
- No es un generador de texto autónomo: requiere el backbone Qwen3-8B congelado para producir salidas.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no documentado).
- Capacidad especial: modo "anneal" con decaimiento de learning rate y checkpoints reanudables para reproducibilidad experimental.

## Casos de uso

- Investigación en atención lineal y estados recurrentes: sirve como punto de referencia de estado mínimo para comparar cómo degrada la recuperación de contexto al reducir el rango de 2.048 a 288 filas.
- Estudio de eficiencia de memoria en contexto largo: permite medir cuánta información de un flujo de 33.000 tokens se conserva con un estado equivalente a ~295 tokens KV, útil para diseñar sustitutos subcuadráticos de la atención.
- Reproducción de experimentos de "cache writing": con los argumentos (`args.json`), el log de entrenamiento (`train_log.jsonl`) y los guardados reanudables, un grupo de investigación puede reejecutar el entrenamiento desde el paso 500 o 1000.
- Ablación de políticas de expulsión: al compartir receta con el headliner, permite aislar el efecto del tamaño de estado frente a la política FIFO con 3 sinks y la operación fold rowmax.
- Benchmarking interno de recuperación tipo NIAH: los readouts planificados sobre niah single/multikey y tqa permiten evaluar "needle in a haystack" en streams largos.
- Desarrollo de métodos de compresión de contexto: el escritor puede integrarse como módulo de compresión en pipelines que necesiten resumir historiales extensos antes de pasarlos a un LLM con ventana limitada.
- Docencia y divulgación técnica: al ser un artefacto acotado (escritor de d_c 512 sobre backbone congelado), resulta útil para explicar arquitecturas recurrentes entrenables sobre modelos preentrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica que los resultados de la rama a1000_mixB se subirán "cuando aterricen los readouts", y menciona conjuntos previstos: tqa_contig c3/c7, tqa c3, niah single/multikey contig c7, tqa_doc shards 0-5 y LongPPL tqa_contig. Ninguno de estos valores está todavía publicado en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, ejecutar el backbone Qwen3-8B congelado requiere aproximadamente 16 GB en bf16 y en torno a 5-6 GB en cuantización de 4 bits; a ello se suma el estado del escritor y el sustrato de caché, que no están cuantificados en la documentación.
- GPU recomendadas: no disponibles en la documentación. Por el tamaño del backbone, GPUs tipo A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) podrían alojar el conjunto completo en bf16.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 / RTX 3090 (24 GB) con el backbone en bf16, y en GPUs de 12-16 GB si se cuantiza el backbone; no hay confirmación oficial.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato de pesos es un checkpoint PyTorch (.pt) con claves writer/shared/args/step, lo que sugiere carga mediante código propio del repositorio.
- Latencia y throughput: no disponibles.
- Entrenamiento declarado: 2 nodos hasta el paso 1000 y 4 nodos desde el paso 1001, lo que da una idea del coste de cómputo, pero sin cifras de tiempo por paso.

## Comparativa con modelos similares

| Modelo | Estado / rango | Contexto de flujo | Receta de datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ttc-trunk-8b-r288-33k | 288 filas (~295 tokens KV) | 33K tokens | ProLong 0,8 / doc-QA v2 0,2 | no disponible | Repositorio HF, 0 descargas |
| ttc-trunk-8b-r512-33k | 512 filas | 33K tokens | Misma receta | no disponible | Hermano de la escalera |
| ttc-trunk-8b-r1024-33k | 1024 filas | 33K tokens | Misma receta | no disponible | Hermano de la escalera |
| ttc-trunk-8b-r2048-33k (headliner) | 2048 filas | 33K tokens | ProLong 0,8 / doc-QA v2 0,2; 6 nodos x 48 streams por paso; 4.000 pasos | no disponible | Principal representativo |
| ttc-trunk-8b-r4096-33k | 4096 filas | 33K tokens | Misma receta | no disponible | Hermano de la escalera |
| ttc-trunk-8b-r8192-33k | 8192 filas | 33K tokens | Misma receta | no disponible | Hermano de la escalera |

No se dispone de comparación con modelos externos de la misma categoría (por ejemplo, alternativas de atención lineal de otros autores como Mamba, RWKV o Hyena) porque la información proporcionada no incluye datos de rendimiento de esta familia.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo listo para producción ni para generación de texto autónoma; depende de un backbone Qwen3-8B congelado que debe aportarse por separado.
- Sin benchmarks publicados: la model card indica que los readouts aún no se han subido, por lo que no hay evidencia cuantitativa de calidad de recuperación en este punto de la escalera.
- Idiomas y sesgos: no disponibles; al no documentarse el dataset de forma detallada más allá de la mezcla ProLong / doc-QA v2, no puede evaluarse el sesgo ni la cobertura lingüística.
- Riesgo de alucinación: no evaluable con la información disponible; al tratarse de un componente de caché, el riesgo relevante es la pérdida de información (olvido) más que la fabulación.
- Limitación de contexto: el estado está diseñado para streams de 33.000 tokens con bloques de 2.048; no se documenta comportamiento fuera de ese régimen.
- Licencia no disponible: no puede confirmarse si se permite el uso comercial. La licencia del backbone Qwen3-8B (no indicada en el repositorio) también condicionaría cualquier uso derivado.
- Estado mínimo de la escalera: con 288 filas (~295 tokens KV de equivalente), es previsible una capacidad de retención menor que los hermanos r2048 o r8192, aunque no hay cifras que lo confirmen.
- Reproducibilidad: los guardados reanudables y el decaimiento arm-B están documentados, pero faltan los resultados publicados y el entorno de evaluación exacto se remite al README del repositorio r2048.
- Sin adopción: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ntumm120/ttc-trunk-8b-r288-33k
- Modelo principal (headliner) de la familia: https://huggingface.co/ntumm120/ttc-trunk-8b-r2048-33k
- Hermano con receta de 8K: https://huggingface.co/ntumm120/ttc-trunk-r2048-8k
- Página personal del autor (Neehal Tumma, MIT CSAIL / Liquid AI): https://ntumm120.github.io/
- Backbone base: https://huggingface.co/Qwen/Qwen3-8B (referenciado en la model card)
