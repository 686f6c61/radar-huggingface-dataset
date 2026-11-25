# maxwell-model/Maxwell-V1-Flash

## Resumen

Maxwell-V1-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el Maxwell Team. Cuenta con 35.000 millones de parámetros totales y 3.000 millones de parámetros activos por token (ambos datos excluyendo embeddings), y está disenado para ofrecer capacidades de razonamiento, uso de agentes y contexto largo con un coste de inferencia contenido. El repositorio de Hugging Face registra 36.810.559.422 parámetros reales en safetensors, lo que cuadra con la cifra de 35B declarada por el autor.

Su rasgo técnico más distintivo es la Maxwell Block Sparse Attention (MBSA), un mecanismo de atención dispersa por bloques que limita la atención principal a 4096 tokens por grupo KV manteniendo disponible la caché KV completa, lo que según el autor hace que el kernel sea 6,7 veces más rápido que una GQA densa a 256K de contexto. El modelo se preentrenó con aproximadamente 26 billones de tokens multilingües y se sometió a un post-entrenamiento en dos etapas (SFT y RL por ramas) seguido de destilación on-policy multi-profesor.

Es relevante ahora porque combina una ventana de contexto de 256K con una activación de solo 3B parámetros, lo que lo sitúa en la franja de modelos que buscan buen rendimiento en razonamiento y tareas agénticas sin exigir el despliegue de un modelo denso de gran tamano. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Maxwell Block Sparse Attention (MBSA) y Manifold-Constrained Hyper-Connections |
| Parametros totales | 35B (excluyendo embeddings); 36.810.559.422 en safetensors |
| Parametros activos | 3B por token (excluyendo embeddings) |
| Longitud de contexto | hasta 256K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (el autor destaca buen soporte de lenguas del sudeste asiático de bajos recursos como tailandés, lao, birmano, jemer y shan); lista completa no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo emplea una columna vertebral mayoritariamente MoE que combina expertos enrutados de grano fino con expertos compartidos siempre activos, usando un sesgo de corrección de enrutamiento dinámico y una pérdida ligera de balanceo de carga por secuencia. La atención se basa en MBSA: cada grupo KV mantiene cobertura fija de 8 bloques de prefijo y 8 bloques locales de 128 tokens, y anade hasta 16 bloques remotos seleccionados por un indexador aprendido. A esto se suman las Manifold-Constrained Hyper-Connections, que usan múltiples flujos residuales con agregación aprendida y dependiente de la entrada para ampliar el flujo de información sin evaluaciones adicionales de atención o feed-forward.

El preentrenamiento consumió aproximadamente 26 billones de tokens multilingües, con el optimizador Muon en la mayoría de las matrices de pesos ocultas. El entrenamiento comienza en modo denso; la atención dispersa por bloques se introduce a 128K durante el mid-training, una vez calentado el indexador frente a la atención densa de historial completo, y luego se entrena conjuntamente con el backbone. La longitud de secuencia se extiende por etapas de 4K a 256K. El tokenizador es multilingüe y sensible a la escritura, disenado para mantenerse compacto en lenguas de bajos recursos. El post-entrenamiento consta de un SFT en dos etapas (capacidades generales, de razonamiento y agénticas), ramas de RL independientes para tareas generales, razonamiento verificable (matemáticas, ciencia, lógica, código) y tareas agénticas (búsqueda, uso de terminal, function calling, ingeniería de software), y finalmente destilación on-policy multi-profesor que fusiona las ramas supervisando respuestas generadas por el propio estudiante.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Razonamiento verificable en matemáticas, ciencia, lógica y código, reforzado mediante RL.
- Capacidades agénticas: búsqueda, uso de terminal, function calling y tareas de ingeniería de software.
- Soporte de tool calling / function calling.
- Razonamiento multi-paso y flujos agénticos.
- Manejo de contexto largo de hasta 256K tokens con caché KV de historial completo.
- Capacidades multilingües, con énfasis declarado en lenguas del sudeste asiático de bajos recursos.
- Capacidad especial: atención dispersa por bloques mediante indexador aprendido (MBSA).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 256K tokens, manteniendo el historial completo en la caché KV mientras la atención principal se acota a 4096 tokens por grupo KV.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión de parches, generación de tests y tareas de ingeniería de software reforzadas por RL.
- Agentes autónomos de búsqueda y navegación: las ramas de RL agénticas cubren búsqueda y uso de terminal, lo que lo hace adecuado para orquestar tareas multi-paso con llamadas a herramientas.
- Análisis de documentos extensos: con 256K de contexto puede procesar informes, expedientes o bases de código largas en una sola pasada, apoyándose en la atención dispersa para controlar el coste.
- Asistentes de razonamiento técnico: sus ramas de RL en matemáticas, ciencia y lógica lo orientan a tareas de resolución de problemas verificables.
- Procesamiento multilingüe en mercados del sudeste asiático: el tokenizador compacto en tailandés, lao, birmano, jemer y shan reduce el coste por token en estas lenguas frente a tokenizadores menos adaptados.
- Despliegue con coste contenido: al activar solo 3B parámetros por token, puede servir cargas de trabajo de razonamiento y agentes con menor presión de cómputo que un modelo denso de tamano comparable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una imagen (`assets/performance-overview.svg`) con resultados comparativos, pero los valores numéricos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los 36.810.559.422 parámetros en safetensors ocupan aproximadamente 73,6 GB en precisión de 16 bits; una cuantización a 8 bits rondaría los 37 GB y a 4 bits unos 18-19 GB, aunque el autor no publica cifras de cuantización.
- GPU recomendadas: no disponible. Por tamano, el despliegue en precisión completa requiere GPUs de centro de datos con 80 GB o más (A100/H100) o varias GPUs en paralelo.
- ¿Cabe en GPU de consumo? No disponible de forma oficial; con cuantización agresiva podría aproximarse al rango de GPUs de 24 GB, pero no hay confirmación del autor.
- Opciones de despliegue: no disponible. El modelo requiere `custom_code` (tag `maxwell_moe`), por lo que la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información proporcionada.
- Latencia y throughput: no disponible. El autor declara que el kernel MBSA es 6,7 veces más rápido que una GQA densa a 256K de contexto, pero sin cifras absolutas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento de alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con 26 billones de tokens multilingües de origen no especificado, es esperable que herede sesgos del corpus, pero el autor no los detalla.
- Riesgo de alucinación: no cuantificado por el autor; como modelo generativo de propósito general, debe validarse en dominios factuales.
- Limitaciones de contexto o idioma: la lista completa de idiomas soportados no está publicada; el énfasis declarado está en lenguas del sudeste asiático. El contexto máximo es de 256K tokens, con atención principal acotada a 4096 tokens por grupo KV mediante selección aprendida de bloques remotos, lo que puede afectar a la recuperación de información en posiciones no seleccionadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `custom_code`, por lo que conviene revisar el código asociado antes de integrarlo en producción.
- Caveats para producción: no hay datos publicados de cuantización, latencia ni compatibilidad con motores de inferencia estándar; el tag `custom_code` implica que el despliegue puede requerir código propio del autor. El repositorio pesa 73,6 GB.

## Enlaces

- Hugging Face: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Página oficial: https://maxwell-llm.ai/
- Playground: https://maxwell-llm.ai/playground
- Discord: https://discord.gg/SM7Bxz9XQU
- GitHub: https://github.com/maxwell-model/Maxwell-V1-Flash
- Informe técnico: https://github.com/maxwell-model/Maxwell-V1-Flash/blob/main/Maxwell_v1_flash_tech_report.pdf
