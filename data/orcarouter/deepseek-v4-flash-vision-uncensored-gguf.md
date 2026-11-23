# orcarouter/DeepSeek-V4-Flash-Vision-Uncensored-GGUF

## Resumen

DeepSeek-V4-Flash-Vision-Uncensored-GGUF es una cuantización en formato GGUF del modelo orcarouter/DeepSeek-V4-Flash-Vision-Uncensored, un modelo de lenguaje de arquitectura MoE (mezcla de expertos) con capacidades de visión, derivado de la familia DeepSeek-V4. Lo publica el usuario orcarouter, responsable también de la pasarela de inferencia OrcaRouter, y está pensado para ejecución local con llama.cpp y para tareas de red-teaming y evaluación de seguridad. El modelo base ha sido sometido a un proceso de "abliteration" (eliminación de rechazos) que da lugar a la variante "Uncensored", orientada a investigación ofensiva y pruebas de robustez.

El dato más relevante es su escala: 284.334.567.511 parámetros totales según los safetensors del modelo base, lo que lo sitúa en la categoría de los modelos frontera open weight. Al ser una variante MoE, solo una fracción de esos parámetros se activa por token, lo que permite un rendimiento de inferencia viable pese al tamaño. El repositorio GGUF ocupa 156,4 GB, lo que refleja las múltiples cuantizaciones publicadas para distintos presupuestos de memoria.

La relevancia actual radica en tres factores: la disponibilidad de pesos cuantizados de un modelo de casi 285.000 millones de parámetros para inferencia local, la inclusión de capacidades multimodales (visión) en un GGUF, y la licencia MIT, poco habitual en modelos de esta escala. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. El modelo solo declara soporte para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), transformer; detalles de capas y atención no disponibles |
| Parametros totales | 284.334.567.511 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (múltiples niveles; niveles concretos no disponibles); el modelo base se publica en MXFP4 según los tags |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo MoE con capacidades de visión y razonamiento, derivado de la familia DeepSeek-V4. Los tags del repositorio incluyen "moe", "reasoning", "vision" y "mxfp4", lo que sugiere que el modelo base se distribuye en formato MXFP4 (formato de cuantización de 4 bits con escalas compartidas, habitual en despliegues de gran escala). No se dispone de datos sobre el número de expertos, el número de capas, la dimensión oculta, la composición del dataset de entrenamiento, el número de tokens vistos ni las etapas de alineación (RLHF, DPO u otras).

La innovación principal del repositorio es el proceso de abliteration aplicado al modelo base: se eliminan o atenúan las direcciones de activación asociadas al rechazo de peticiones, dando lugar a la variante "Uncensored". Este proceso se documenta en la comunidad como una modificación de los pesos que reduce la probabilidad de respuestas de negativa, sin reentrenamiento adicional. No se especifica la metodología exacta ni el grado de modificación aplicado. Tampoco hay información sobre la estrategia de decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag "conversational".
- Razonamiento explícito: el tag "reasoning" indica soporte de cadenas de pensamiento o modos de razonamiento extendido.
- Procesamiento de visión: el nombre del modelo y los tags confirman entrada de imágenes, aunque no se detallan resoluciones ni número de tokens visuales.
- Capacidades multilingües limitadas a inglés y chino; no se declara soporte de español.
- Compatibilidad con endpoints OpenAI según el tag "endpoints_compatible", lo que facilita la integración con clientes existentes.
- Orientación a red-teaming y evaluación de seguridad: los tags "ai-red-team" y "red-teaming" indican que el modelo está pensado para probar defensas y estudiar comportamientos no filtrados.
- No se confirma soporte de tool calling ni de flujos agénticos multi-paso en la información disponible.

## Casos de uso

- Red-teaming de sistemas de IA: el modelo, al carecer de rechazos, permite generar ataques adversariales, prompts de jailbreak y contenido de prueba para evaluar la robustez de filtros y clasificadores de seguridad en pipelines de moderación.
- Investigación sobre alineación y seguridad: sirve para estudiar qué comportamientos emergen al eliminar las capas de rechazo y comparar las respuestas con las del modelo base alineado, cuantificando la deriva en dominios sensibles.
- Evaluación de robustez de clasificadores: se puede usar como generador de ejemplos difíciles o ambiguos para entrenar y validar modelos de detección de contenido dañino.
- Procesamiento de documentos con imágenes en inglés o chino: la combinación de visión y contexto conversacional permite extraer información de capturas, diagramas o formularios, siempre que el caso de uso no requiera salvaguardas.
- Experimentación local con modelos de gran escala: las cuantizaciones GGUF permiten ejecutar un modelo de 284.000 millones de parámetros en hardware de gama alta mediante llama.cpp, útil para laboratorios que no pueden depender de APIs externas.
- Pruebas de compatibilidad con la API de OpenAI: el tag "endpoints_compatible" permite validar clientes y herramientas que esperan ese contrato antes de migrar a producción.
- Análisis de conversaciones multilingües inglés-chino: atención al cliente o análisis de contenido en esos dos idiomas, con la advertencia de que el modelo no está alineado para uso público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 284.334 millones de parámetros, una cuantización de 4 bits requiere aproximadamente 142 GB solo para pesos, más overhead de contexto y caché KV; una de 8 bits supera los 284 GB. Los niveles exactos publicados no están disponibles.
- GPU recomendadas: para 4 bits, configuraciones multi-GPU como 2×H100 80 GB, 4×A100 80 GB o 2×H200 141 GB. Para cuantizaciones de 2-3 bits, un solo H100 80 GB o H200 podría ser suficiente, con degradación de calidad.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) en ninguna cuantización razonable. Requiere configuraciones multi-GPU o offloading a RAM del sistema, con latencia muy alta.
- Despliegue: llama.cpp es el runtime principal dado el formato GGUF; también es posible usar servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa para este tamaño sin conversión.
- Latencia y throughput: no disponibles. Con offloading parcial a RAM, se espera un throughput de pocos tokens por segundo; con 2×H100 en 4 bits, el rendimiento sería considerablemente mayor, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Uncensored-GGUF | 284,3 B (MoE) | no disponible | MIT | GGUF | Variante abliterated con visión; acceso gated |
| DeepSeek-V3 | 671 B (MoE) | 128 K | Model license | safetensors | Referencia de la familia; sin visión declarada en la información disponible |
| Qwen3.8-27B-Uncensored (orcarouter) | 27 B | 262 K | no disponible | GGUF / endpoint | Mismo publicador; mucho menor, contexto documentado, visión y tool calling |
| Llama 3.3 70B | 70 B | 128 K | Llama license | safetensors, GGUF | Menor escala, sin visión, amplia disponibilidad de cuantizaciones |

La comparativa con DeepSeek-V3 y Llama 3.3 70B es aproximada: no se dispone de datos de benchmarks del modelo analizado que permitan una comparación de rendimiento rigurosa. El modelo de orcarouter Qwen3.8-27B-Uncensored es la alternativa más directa dentro del mismo ecosistema y resulta mucho más asequible en hardware.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos de seguridad: el modelo puede generar contenido dañino, ilegal o sesgado sin filtros. No es apto para aplicaciones de cara al público sin moderación externa.
- Riesgo elevado de alucinación, especialmente en dominios especializados y en lenguajes distintos del inglés y el chino.
- Solo declara soporte de inglés y chino; el rendimiento en español no está garantizado ni documentado.
- La licencia MIT permite uso comercial, pero el acceso está restringido en Hugging Face y requiere aceptar condiciones; conviene revisar los términos del modelo base y las obligaciones de atribución.
- No se dispone de información sobre sesgos específicos, datos de entrenamiento ni evaluaciones de seguridad publicadas.
- El tamaño hace inviable el despliegue en hardware de consumo; los requisitos de memoria son de centro de datos.
- No se confirma soporte de tool calling ni de flujos agénticos, pese a que el ecosistema OrcaRouter los ofrece en otros modelos.
- El repositorio tiene 434 descargas y 57 likes en el momento de la consulta, lo que indica una validación comunitaria aún limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/DeepSeek-V4-Flash-Vision-Uncensored-GGUF
- Modelo base: https://huggingface.co/orcarouter/DeepSeek-V4-Flash-Vision-Uncensored
- OrcaRouter (pasarela): https://www.orcarouter.ai/
- Documentación de OrcaRouter: https://docs.orcarouter.ai/introduction
- Enrutador automático de OrcaRouter: https://docs.orcarouter.ai/routing/auto-router
- Modelo relacionado en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
