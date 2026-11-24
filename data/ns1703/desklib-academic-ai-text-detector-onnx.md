# ns1703/desklib-academic-ai-text-detector-onnx

## Resumen

`ns1703/desklib-academic-ai-text-detector-onnx` es una exportación a ONNX con cuantización int8 del modelo `desklib/ai-text-detector-academic-v1.01`, un clasificador binario diseñado para detectar texto generado por IA en contextos académicos. Lo publica el usuario ns1703 y no aporta pesos nuevos: mantiene los del modelo original y solo cambia el formato para que pueda ejecutarse con `onnxruntime-web` directamente en el navegador, sin backend de servidor.

La relevancia del artefacto es fundamentalmente de despliegue. Al tratarse de un clasificador de una sola salida (un logit que, tras aplicar sigmoide, da la probabilidad de que el texto sea de origen artificial), el modelo es muy ligero y encaja en flujos de cliente: extensiones de navegador, editores web o formularios de entrega de trabajos que necesitan una comprobación inmediata. El repositorio ocupa aproximadamente 0,5 GB, lo que incluye el fichero ONNX cuantizado y los artefactos auxiliares del tokenizador.

La información pública disponible es escasa: no se especifican parámetros, longitud de contexto, idiomas soportados ni resultados de evaluación. La model card original está redactada en alemán y se limita a describir la interfaz de entrada y salida del grafo ONNX. Cualquier uso en producción debería ir precedido de una validación propia sobre el dominio objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder para clasificación de secuencias (detalles no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (dinámica, vía exportación ONNX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base es un clasificador de texto de tipo encoder (la familia concreta no se documenta en la información disponible) con una cabeza de clasificación de una sola unidad. La salida del grafo es un tensor `logits` de forma `[batch, 1]`; aplicando una sigmoide se obtiene la probabilidad de que el fragmento sea generado por IA. Las entradas son `input_ids` y `attention_mask`, ambas de tipo int64, lo que confirma un pipeline estándar de tokenización subword con padding y máscara de atención.

La exportación a ONNX se ha cuantizado a 8 bits para reducir el peso y permitir la ejecución en `onnxruntime-web`. El autor advierte explícitamente de que la cuantización introduce desviaciones menores respecto a los valores del modelo original. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del corpus, ni si hubo ajuste fino con RLHF o DPO; tampoco se detalla ninguna innovación arquitectónica más allá del proceso de exportación y cuantización.

## Capacidades

- Clasificación binaria de texto: distingue entre texto humano y texto generado por IA en el ámbito académico.
- Salida probabilística calibrable mediante sigmoide sobre el logit.
- Ejecución en navegador mediante `onnxruntime-web` y compatibilidad con el ecosistema `transformers.js`.
- Procesamiento por lotes (`batch`) gracias a la dimensión dinámica del tensor de entrada.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe: no documentada; la model card está en alemán, pero no se confirma el alcance idiomático del entrenamiento.

## Casos de uso

- Verificación de trabajos académicos en el navegador: el modelo puede integrarse en un formulario de entrega que puntúe el texto del alumno en el cliente, sin enviar el contenido a un servidor y reduciendo riesgos de privacidad.
- Extensiones de navegador para revisión de textos: al ejecutarse con `onnxruntime-web`, permite señalar párrafos sospechosos en editores en línea o plataformas LMS sin infraestructura adicional.
- Triaje previo en flujos editoriales: usar la probabilidad de salida como primer filtro para decidir qué manuscritos requieren revisión humana detallada, dado el bajo coste computacional del clasificador.
- Detección en pipelines de moderación de contenido: clasificación rápida de grandes volúmenes de texto en entornos con requisitos de latencia bajos, aprovechando la cuantización int8.
- Herramientas educativas de concienciación: demostraciones interactivas que muestran al alumnado cómo se comporta un detector de IA sobre sus propios textos, ejecutándose íntegramente en el dispositivo.
- Prototipado de investigación sobre detección de IA: servir como línea base reproducible en formato ONNX para comparar con clasificadores propios en experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,5 GB) y la cuantización int8, se espera un consumo muy inferior a 1 GB, aunque no se confirma.
- GPU recomendadas: no disponibles; el modelo está pensado para CPU y ejecución en navegador.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU moderna, dado el reducido tamaño, aunque no hay datos oficiales.
- Opciones de despliegue: `onnxruntime-web` (objetivo principal), `onnxruntime` en Python/C++, `transformers.js`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| ns1703/desklib-academic-ai-text-detector-onnx | Clasificador binario IA/humano | ONNX int8 | MIT | no disponible | Hugging Face |
| desklib/ai-text-detector-academic-v1.01 | Clasificador binario IA/humano | Pesos originales (formato no especificado) | MIT | no disponible | Hugging Face |
| Detectores comerciales (p. ej., servicios de detección de IA) | Clasificador binario | API | Propietaria | no disponible | Servicio en la nube |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un detector entrenado para ámbito académico, puede penalizar estilos formales o de escritura no nativa.
- Riesgo de falsos positivos y falsos negativos: inherente a los detectores de texto IA; no hay métricas publicadas que permitan estimar su tasa de error.
- La cuantización int8 introduce desviaciones respecto al modelo original, según advierte el propio autor.
- Idiomas soportados sin confirmar: el uso en castellano no está validado y podría degradar la precisión.
- Longitud de contexto desconocida: textos largos pueden truncarse sin que se documente el límite.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar la atribución a los autores del modelo original.
- Para producción, se recomienda validar el modelo sobre un conjunto propio etiquetado antes de tomar decisiones automatizadas, especialmente en contextos con consecuencias académicas o legales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ns1703/desklib-academic-ai-text-detector-onnx
- Modelo base: https://huggingface.co/desklib/ai-text-detector-academic-v1.01
- Demo (Meta-KI-Detektor): https://huggingface.co/spaces/ns1703/ki-detektor
