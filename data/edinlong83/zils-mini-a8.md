# edinlong83/zils-mini-a8

## Resumen

Zils-mini-a8 es un modelo de decisión (decision model) de tipo "d3-mini" desarrollado por el usuario edinlong83 para el pool mini de la subnet 127 de Zils. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-4B, orientado a tareas de clasificación, puntuación y enrutamiento de solicitudes en aplicaciones, más que a la generación de texto abierta. El modelo se entrena a partir de ejemplos etiquetados que el desarrollador proporciona, de modo que aprende a tomar decisiones según criterios definidos por la aplicación.

Con 4.539.265.536 parámetros totales (aproximadamente 4,54 mil millones) y un repositorio de 9,1 GB en formato safetensors, el modelo hereda la arquitectura y la ventana de contexto de su base Qwen3.5-4B, aunque la model card no detalla estos datos. La licencia Apache-2.0 facilita su uso comercial y su integración en productos propios.

Su relevancia actual radica en la tendencia a sustituir llamadas a modelos generativos grandes por modelos pequeños especializados en decisiones concretas (clasificar, filtrar, puntuar), con menor coste y latencia. No obstante, la información pública disponible es muy escasa: no hay benchmarks, idiomas declarados ni pipeline definido, por lo que su evaluación debe hacerse con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de Qwen/Qwen3.5-4B; arquitectura del base no detallada en la informacion) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del base Qwen/Qwen3.5-4B, según los metadatos de Hugging Face y la model card. La model card lo describe como un "d3-mini decision body" para el pool mini de la subnet 127 de Zils, entrenado a partir de los "open house models" del pool sobre datos públicos de la partición de entrenamiento (train-split). No se especifican detalles de la arquitectura interna (tipo de transformer, atención, normalización), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal no está en la arquitectura, sino en el paradigma de uso: Zils propone entrenar un modelo pequeño a partir de ejemplos con la respuesta correcta para que la aplicación ordene solicitudes, marque problemas o puntúe coincidencias. El resultado es un "cuerpo de decisión" especializado que se integra en un flujo de aplicación, en lugar de un asistente conversacional general. No hay información pública sobre la composición exacta del dataset de entrenamiento ni sobre el proceso de destilación o ajuste.

## Capacidades

- Toma de decisiones supervisada: clasificación de solicitudes, marcado de problemas y puntuación de coincidencias a partir de ejemplos etiquetados por el desarrollador.
- Enrutamiento de peticiones dentro de una aplicación (por ejemplo, derivar a un flujo u otro según la categoría detectada).
- Filtrado y priorización de entradas según criterios definidos en el conjunto de entrenamiento.
- Herencia de las capacidades del base Qwen/Qwen3.5-4B en la medida en que el fine-tuning no las haya degradado; no hay documentación que lo confirme.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo clasifica cada mensaje entrante en categorías (facturación, incidencia técnica, consulta comercial) entrenándolo con ejemplos históricos etiquetados, lo que permite enrutar automáticamente al equipo adecuado.
- Moderación de contenido en un foro o marketplace: se entrena con ejemplos de publicaciones aceptadas y rechazadas para que puntúe la probabilidad de que una nueva publicación incumpla las normas.
- Puntuación de coincidencias en un motor de búsqueda interno: dado un par consulta-documento, el modelo aprende a asignar una puntuación de relevancia según los ejemplos proporcionados por el equipo de producto.
- Detección de solicitudes fraudulentas: con un conjunto de ejemplos de solicitudes legítimas y sospechosas, el modelo marca las nuevas peticiones que requieren revisión manual antes de procesarse.
- Enrutamiento de leads comerciales: clasifica formularios de contacto según su intención (demo, precio, soporte) para asignarlos al comercial o al equipo técnico correspondiente.
- Clasificación de correos o mensajes en bandejas de entrada operativas: entrena con ejemplos de cada categoría para etiquetar automáticamente correos de proveedores, clientes o alertas internas.
- Control de calidad en pipelines de datos: puntúa registros generados o extraídos para descartar los que no cumplen los criterios definidos, usando el modelo como filtro previo a la revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parámetros, en FP16 se requieren aproximadamente 9 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 5 GB; en 4 bits, alrededor de 3 GB. Son estimaciones basadas en el tamaño, no datos publicados por el autor.
- GPU recomendadas: para FP16, una GPU con 16 GB o más (RTX 4080/4090, A10G, L4 con cuantización); para servir en producción con concurrencia, A100 40 GB o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 8-16 GB usando cuantización de 8 o 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090). En FP16 completo, una RTX 3090/4090 de 24 GB es suficiente para una sola instancia.
- Opciones de despliegue: vLLM o TGI para servir con throughput alto; llama.cpp u Ollama si se generan pesos GGUF (no publicados en el repositorio); Transformers con PyTorch como opción básica.
- Latencia y throughput estimados: no disponible; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-a8 | 4,54 B | no disponible | Apache-2.0 | Fine-tuning de decisión sobre Qwen3.5-4B; sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible en la informacion | no disponible en la informacion | Modelo generativo generalista del que deriva; capacidades más amplias pero sin especialización en decisiones |
| Alternativas de clasificación dedicadas (p. ej. modelos BERT/DeBERTa pequeños) | 0,1-0,4 B | 512 tokens típicos | variable | Más ligeros y rápidos para clasificación pura, pero sin la flexibilidad de un modelo generativo ajustado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: no hay benchmarks, idiomas declarados ni pipeline definido, lo que impide evaluar su calidad sin pruebas propias.
- Riesgo de alucinación y de sobreajuste a los ejemplos de entrenamiento: al ser un modelo de decisión entrenado con datos específicos, puede fallar ante distribuciones distintas a las del conjunto de entrenamiento.
- Sesgos heredados del base Qwen/Qwen3.5-4B y de los datos de entrenamiento del pool; no se documentan evaluaciones de sesgo.
- Sin información sobre la longitud de contexto efectiva ni sobre el rendimiento en idiomas distintos del que se usó para entrenar.
- El fine-tuning puede haber degradado capacidades generativas del base; no se recomienda usarlo como asistente conversacional general sin validación.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del base Qwen/Qwen3.5-4B y del ecosistema Zils para confirmar que no añaden restricciones.
- Al ser un modelo de decisión, sus salidas deben tratarse como señales para un flujo de aplicación, no como decisiones finales sin supervisión humana en contextos de riesgo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/edinlong83/zils-mini-a8)
- [Sitio de Zils](https://zils.ai/)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
