# mradermacher/RAG-Critic-3B-GGUF

## Resumen

RAG-Critic-3B-GGUF es la versión cuantizada en formato GGUF del modelo dongguanting/RAG-Critic-3B, un modelo de lenguaje de aproximadamente 3.085 millones de parámetros (3,08B) orientado a tareas de crítica y evaluación dentro de pipelines de generación aumentada por recuperación (RAG). Las cuantizaciones han sido producidas por mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base está pensado para evaluar la calidad de respuestas generadas en sistemas RAG, una tarea que en producción suele requerir un modelo juez capaz de detectar alucinaciones, falta de fidelidad a las fuentes recuperadas o respuestas incompletas. Con 3B parámetros, el modelo busca un equilibrio entre capacidad de juicio y coste computacional, de modo que pueda desplegarse como componente de evaluación dentro de un pipeline sin depender de APIs externas.

Esta ficha se centra en la versión GGUF publicada por mradermacher, que incluye un conjunto de cuantizaciones estáticas desde Q2_K hasta f16, con licencia MIT y soporte exclusivo del idioma inglés. La información disponible sobre arquitectura, datos de entrenamiento y benchmarks del modelo base es limitada en la documentación proporcionada, por lo que varios apartados se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no publicados en la información disponible) |
| Parámetros totales | 3.085.938.688 (3,08B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base dongguanting/RAG-Critic-3B en la documentación proporcionada. Por el tamaño (3,08B parámetros) y la librería declarada (transformers), se trata de un transformer decoder-only, pero no se especifican número de capas, dimensión oculta, cabezas de atención ni mecanismos adicionales. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado específico para la tarea de crítica RAG.

La contribución de esta ficha es la cuantización: mradermacher ha generado cuantizaciones estáticas en formato GGUF a partir de los pesos en precisión completa, sin versiones ponderadas ni imatrix en el momento de la publicación (el autor indica que podrían no estar disponibles). Las cuantizaciones siguen el esquema estándar de llama.cpp, con opciones K-quant e IQ-quant, y el autor recomienda Q4_K_S o Q4_K_M como equilibrio entre velocidad y calidad, y Q8_0 o f16 cuando la fidelidad es prioritaria.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Evaluación y crítica de respuestas en contextos RAG: el nombre del modelo y su origen sugieren uso como juez o crítico de fidelidad, aunque la model card no detalla el formato exacto de prompt.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Evaluación automática de pipelines RAG: usar el modelo como juez que puntúa si la respuesta generada se apoya en los documentos recuperados, detectando afirmaciones no respaldadas por el contexto. Su tamaño de 3B permite ejecutarlo junto al generador en la misma máquina.
- Filtrado de respuestas alucinadas en producción: desplegar el modelo en formato Q4_K_M (2,0 GB) como paso de verificación posterior a la generación, descartando o marcando respuestas de baja fidelidad antes de mostrarlas al usuario.
- Control de calidad en datasets de entrenamiento: puntuar pares pregunta-respuesta-contexto para construir datasets de ajuste fino más limpios, ejecutando el modelo en lote sobre GPU de consumo.
- Evaluación offline en CI/CD: integrar el modelo cuantizado en pipelines de integración para detectar regresiones en la calidad de respuestas de un sistema RAG tras cambios en el recuperador o en el prompt.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo MIT de 3B ejecutable localmente con llama.cpp, permite evaluar respuestas sin enviar datos a APIs externas, útil en sectores regulados.
- Prototipado rápido en estaciones de trabajo: con la cuantización Q4_K_S (1,9 GB) el modelo cabe en GPU de 4-8 GB de VRAM, lo que facilita experimentar con estrategias de crítica RAG antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB (Q2_K), 1,9-2,0 GB (Q4_K_S / Q4_K_M), 2,6 GB (Q6_K), 3,4 GB (Q8_0) y 6,3 GB (f16), según los tamaños de archivo publicados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060/4060 o superiores para Q6_K y Q8_0; A100/H100 no son necesarias para este tamaño, salvo para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM para Q4_K_M; incluso en CPU con llama.cpp para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio también declara compatibilidad con endpoints (`endpoints_compatible`) y la librería transformers para el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RAG-Critic-3B-GGUF (este) | 3,08B | no disponible | MIT | GGUF | Cuantizaciones estáticas de mradermacher |
| dongguanting/RAG-Critic-3B | 3,08B | no disponible | MIT | safetensors | Modelo base original |
| Alternativas de 3B para crítica RAG | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (modelos juez o críticos RAG de tamaño similar) con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está garantizado y probablemente degrade la calidad de la crítica.
- Al ser un modelo de 3B, su capacidad de razonamiento y de detección de errores sutiles es inferior a la de modelos jueces de mayor tamaño; puede pasar por alto alucinaciones complejas o matices finos.
- Riesgo de alucinación inherente a los modelos de lenguaje: como juez, puede emitir puntuaciones o justificaciones no fundamentadas, por lo que conviene validar su comportamiento con un conjunto de evaluación propio.
- No se documentan sesgos específicos del modelo base ni del proceso de entrenamiento; se recomienda auditar su comportamiento en dominios sensibles antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base original (dongguanting/RAG-Critic-3B), que también declara MIT en la información disponible.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de juicio; el autor recomienda Q4_K_S o superiores.
- No hay cuantizaciones imatrix ni ponderadas disponibles en el momento de la publicación, lo que limita las opciones de calidad intermedia.
- El repositorio tiene muy pocas descargas (99) y ningún like, lo que indica escasa validación por parte de la comunidad; no hay evidencia pública de su rendimiento en tareas reales de crítica RAG.

## Enlaces

- Repositorio Hugging Face de la versión GGUF: https://huggingface.co/mradermacher/RAG-Critic-3B-GGUF
- Modelo base original: https://huggingface.co/dongguanting/RAG-Critic-3B
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#RAG-Critic-3B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
