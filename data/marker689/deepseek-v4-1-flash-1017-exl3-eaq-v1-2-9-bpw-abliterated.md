# Marker689/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw-Abliterated

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino una derivación community del checkpoint `Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw`, publicado por el usuario Marker689. Se trata de una versión "abliterated" (ablación de rechazos) de un modelo de la familia DeepSeek V4.1 Flash, distribuida ya cuantizada en formato EXL3 a 2,9 bits por peso. El pipeline declarado es `image-text-to-text`, de modo que el modelo acepta imagen y texto como entrada, y los idiomas documentados son inglés y chino.

El checkpoint declara 105.247.867.090 parámetros totales según los metadatos de safetensors (unos 105,25 mil millones) y lleva la etiqueta `moe`, lo que sitúa el modelo en la categoría de mezcla de expertos de gran tamaño, aunque el número de parámetros activos no se documenta. La licencia es MIT y el acceso está restringido: requiere aceptar condiciones en HuggingFace antes de descargar.

Su relevancia ahora es doble. Por un lado, permite ejecutar un modelo de más de 100 mil millones de parámetros con un presupuesto de bits muy agresivo (2,9 bpw), lo que interesa a quien quiera inferencia local en hardware de gama alta. Por otro, la modificación "abliterated" lo convierte en objeto de estudio para investigación sobre alineación y mecanismos de rechazo, y en una alternativa para flujos donde los filtros del modelo base resultan un obstáculo. Conviene señalar que el repositorio no tiene descargas ni valoraciones y que la model card no está disponible en la información proporcionada, por lo que no hay documentación sobre la metodología de ablación ni sobre la evaluación de la pérdida de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) según los tags del repositorio; tipo de modelo `deepseek_v41` en transformers. Número de capas y de expertos: no disponible |
| Parámetros totales | 105.247.867.090 (~105,25 mil millones), según metadatos de safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 (ExLlamaV3) a 2,9 bits por peso, según el nombre del repositorio; no se documentan otros formatos |
| Idiomas soportados | inglés (`en`) y chino (`zh`) |
| Licencia | MIT |
| Formato de pesos | safetensors con cuantización EXL3 |

## Arquitectura y entrenamiento

Los metadatos identifican una arquitectura de mezcla de expertos (tag `moe`) implementada como `deepseek_v41` en la librería transformers, con 105,25 mil millones de parámetros totales. No se dispone de información sobre el número de expertos, la proporción de parámetros activos por token, el mecanismo de enrutamiento ni el tipo de atención empleado. Tampoco hay datos sobre la longitud de contexto nativa del modelo base.

El entrenamiento original corresponde al linaje DeepSeek V4.1 Flash, del que no se ha proporcionado información sobre volumen de tokens, composición del corpus, ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. La modificación "abliterated" consiste, por convención en este tipo de publicaciones, en la supresión de las direcciones de activación asociadas al rechazo, pero el repositorio no documenta el método concreto, los datos utilizados ni la magnitud de la intervención. La cuantización EXL3 a 2,9 bpw es una innovación de despliegue, no de entrenamiento: reduce la huella de pesos mediante cuantización de precisión mixta orientada al motor ExLlamaV3.

Existe una inconsistencia numérica que conviene tener presente: a 2,9 bits por peso, 105,25 mil millones de parámetros equivalen a unos 38,2 GB, pero el repositorio ocupa 210,7 GB. La diferencia (aproximadamente 2 bytes por parámetro, es decir, 16 bits) sugiere que el repositorio incluye artefactos adicionales, versiones sin cuantizar o ficheros auxiliares que no se detallan en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino, con el tag `conversational` en el repositorio.
- Entrada multimodal de imagen y texto (`image-text-to-text`): el modelo puede recibir imágenes junto con instrucciones textuales, lo que habilita descripción, extracción de información y razonamiento sobre contenido visual.
- Razonamiento y conocimiento general propios de un modelo de más de 100 mil millones de parámetros, aunque no se publican evaluaciones que lo cuantifiquen.
- Comportamiento sin rechazos por diseño (`abliterated`, `uncensored`): el modelo no aplica las directivas de rechazo del checkpoint original, lo que cambia su comportamiento ante peticiones sensibles.
- Capacidad multilingüe limitada a los idiomas declarados (inglés y chino); el resto de idiomas no está soportado oficialmente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; no se declara modo "thinking" ni capacidades de audio.

## Casos de uso

- Procesamiento de documentos escaneados en pipelines internos: al aceptar imagen y texto, el modelo puede recibir páginas digitalizadas y devolver el contenido estructurado, lo que resulta útil en digitalización de archivos con mezcla de inglés y chino.
- Asistencia conversacional bilingüe inglés-chino: adecuado para atención a usuarios de ambas comunidades con un único checkpoint, sin necesidad de enrutar por idioma.
- Investigación en seguridad y alineación: la versión abliterated permite estudiar qué comportamientos desaparecen al suprimir las direcciones de rechazo y comparar contra el modelo base, en entornos de red teaming controlados.
- Evaluación de cuantización agresiva: sirve como banco de pruebas para medir la degradación de calidad a 2,9 bpw frente al checkpoint de referencia, especialmente en tareas de razonamiento y generación larga.
- Generación de contenido editorial sin filtros automáticos: flujos de escritura creativa o guiones donde el rechazo del modelo base interfiere, siempre con revisión humana posterior y políticas de uso internas.
- Despliegue on-premise en hardware compacto de altas prestaciones: los tags `dgx-spark` y `gb10` apuntan a estaciones con memoria unificada de NVIDIA, un escenario habitual cuando no se puede enviar datos a la nube.
- Análisis de imágenes en moderación o catalogación: clasificación y descripción de contenido visual en lotes, con salida en inglés o chino según el flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación multimodal, y tampoco se documenta la pérdida de calidad introducida por la cuantización a 2,9 bpw o por la ablación de rechazos.

## Requisitos de hardware

- Huella teórica de pesos: a 2,9 bits por peso y 105,25 mil millones de parámetros, el cálculo arroja unos 38,2 GB, cifra que debe verificarse contra los ficheros reales dado que el repositorio ocupa 210,7 GB.
- VRAM estimada: si la cifra de 2,9 bpw es correcta, harían falta del orden de 40-48 GB para pesos más caché KV y overhead; si el repositorio contiene pesos de mayor precisión, el requisito se acercaría a los 210 GB y obligaría a varios aceleradores.
- GPU recomendadas: para el escenario de ~40 GB, una A100 80 GB, H100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB; para el escenario de ~210 GB, configuraciones multi-GPU (4×A100 80 GB o 8×H100) o nodos con memoria unificada grande.
- GPU de consumo: una RTX 4090 (24 GB) no puede alojar el modelo completo en ninguno de los dos escenarios; sería necesario repartir entre varias GPU o recurrir a hardware con memoria unificada. Los tags `dgx-spark` y `gb10` sugieren precisamente este tipo de estación, si bien la memoria unificada de una unidad GB10 (128 GB) no cubriría por sí sola los 210,7 GB del repositorio.
- Opciones de despliegue: el formato EXL3 requiere el motor ExLlamaV3 (por ejemplo, mediante TabbyAPI) para inferencia optimizada; la librería declarada es transformers. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible, y en el caso de llama.cpp el soporte de EXL3 no está documentado.
- Latencia y throughput: no disponibles. Al ser un MoE, el rendimiento depende del número de parámetros activos, dato que no se publica.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Acceso |
|---|---|---|---|---|---|
| Marker689/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw-Abliterated | 105,25 mil M | no disponible | EXL3 2,9 bpw | MIT | Restringido (gated) |
| Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw (base) | no disponible en la información | no disponible | EXL3 2,9 bpw | no disponible | no disponible |
| Otras alternativas de la misma categoría (MoE >100 mil M) | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación verificable con los datos aportados es frente al checkpoint base: misma arquitectura y mismo esquema de cuantización, con la diferencia de la ablación de rechazos y, presumiblemente, de la licencia. No se dispone de datos de rendimiento de ninguno de los dos, por lo que no es posible establecer una comparación cuantitativa con modelos de otros linajes.

## Limitaciones y advertencias

- La ablación de rechazos elimina barreras de seguridad del modelo original: puede producir contenido dañino, ilegal o sexualmente explícito sin las salvaguardas habituales, lo que exige filtros externos en cualquier despliegue orientado al público.
- No hay evaluación publicada del impacto de la ablación ni de la cuantización a 2,9 bpw sobre la calidad; la degradación en razonamiento, matemáticas y código es desconocida.
- Riesgo de alucinación no cuantificado: sin benchmarks ni model card, no hay base para estimar la fiabilidad factual.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está soportado oficialmente y previsiblemente será inferior.
- Longitud de contexto no documentada, lo que impide planificar cargas de trabajo con documentos largos sin pruebas previas.
- Licencia MIT declarada por el publicador, pero al ser una derivación conviene verificar los términos del modelo base y de los materiales de entrenamiento originales antes de un uso comercial.
- Acceso restringido en HuggingFace: es necesario aceptar condiciones, lo que añade fricción a pipelines automatizados de descarga.
- Repositorio sin descargas ni valoraciones y publicado recientemente: no existe evidencia de la comunidad sobre su funcionamiento real.
- Inconsistencia entre el tamaño del repositorio (210,7 GB) y la cuantización declarada (2,9 bpw), que debe resolverse inspeccionando los ficheros antes de dimensionar hardware.
- Requiere el motor ExLlamaV3; la integración con servidores de inferencia habituales no está confirmada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Marker689/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw-Abliterated
- Modelo base: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a contenido sin relación con el checkpoint (mods de videojuegos) y se han descartado.
