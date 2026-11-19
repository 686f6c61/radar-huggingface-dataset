# Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B

## Resumen

Qwen3.6-Fallen-Fabulist-35B-A3B es un modelo de lenguaje multimodal (image-text-to-text) publicado por Cyclone-Labs en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una fusión de pesos (merge) construida con mergekit sobre el modelo base Qwen/Qwen3.6-35B-A3B, combinando tres derivados del mismo linaje: Gryphe/WorldSim-Opus-3.6-35B-A3B, ReadyArt/Melody1437-35B-A3B y ornith-ai/Ornith-1.5-35B-A3B. El objetivo declarado es agregar en un único checkpoint las capacidades especializadas de cada uno de esos modelos (rol, simulación de mundo y estilos conversacionales) sin reentrenamiento adicional.

El modelo conserva la arquitectura del Qwen3.6-35B-A3B original: un transformer con mezcla de expertos (MoE) de 35.951.822.704 parámetros totales, con el tag `qwen3_5_moe` en Hugging Face. El repositorio ocupa 71,9 GB en safetensors, lo que es coherente con pesos en bfloat16 para ese número de parámetros. La licencia es Apache 2.0 y la librería de referencia es transformers.

Su relevancia es acotada pero concreta: para equipos que ya trabajan con el ecosistema Qwen3.6 MoE y quieren un checkpoint con un sesgo estilístico orientado a narrativa y conversación, este merge ofrece una alternativa lista para evaluar sin pasar por un pipeline de fine-tuning. Al ser un merge, no aporta mejoras verificadas en benchmarks ni garantías de calidad sobre el modelo base; debe tratarse como una variante de estilo a validar empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge con mergekit usando el método DAGE (Density-Anchored Graph Equilibrium), tomando Qwen/Qwen3.6-35B-A3B como base y fusionando los pesos de tres modelos derivados: Gryphe/WorldSim-Opus-3.6-35B-A3B, ReadyArt/Melody1437-35B-A3B y ornith-ai/Ornith-1.5-35B-A3B. Los parámetros del merge son `gain: 0.98`, `resolution: 0.62`, `salience: 0.72`, `damping: 0.40` y `containment: 1.12`, con `dtype: float32` en el cálculo y `out_dtype: bfloat16` en la salida. La plantilla de chat se toma automáticamente (`chat_template: auto`).

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, porque no se ha realizado entrenamiento adicional: el proceso es puramente una combinación de pesos existentes. La arquitectura subyacente es la del Qwen3.6-35B-A3B, un transformer con mezcla de expertos y capacidad multimodal de entrada imagen-texto, pero no se detallan en la información disponible el número de expertos, la proporción de parámetros activos por token, ni innovaciones concretas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del linaje Qwen3.6 y de los merges orientados a diálogo.
- Procesamiento de entradas image-text-to-text: el pipeline declarado acepta imágenes junto con texto, según la arquitectura base.
- Estilo narrativo y de simulación de mundo, presumiblemente reforzado por la inclusión de WorldSim-Opus y Melody1437 en la fusión.
- Soporte de plantilla de chat automática, lo que facilita su uso en frameworks de inferencia compatibles con transformers.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que indica que puede desplegarse en infraestructuras de inferencia estándar.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe concreta: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales con sesgo narrativo: el merge incorpora modelos orientados a roleplay y simulación, por lo que encaja en la construcción de personajes consistentes en diálogos largos, siempre que se valide la coherencia en pruebas propias.
- Generación de ficción y guiones: la combinación de WorldSim-Opus y Melody1437 sugiere un sesgo hacia prosa creativa y mantenimiento de escenarios; útil para borradores de narrativa que luego se revisan manualmente.
- Experimentación en investigación sobre merging: sirve como caso de estudio reproducible del método DAGE con parámetros documentados, para comparar la degradación o mejora frente al modelo base Qwen3.6-35B-A3B.
- Evaluación comparativa de variantes MoE: al compartir arquitectura y tamaño con el base, permite medir el efecto del merge en tareas concretas sin cambiar el resto del stack de inferencia.
- Base para fine-tuning posterior: su licencia Apache 2.0 y formato safetensors facilitan usarlo como punto de partida de un ajuste supervisado específico de dominio.
- Despliegue en pipelines multimodales experimentales: al declarar pipeline image-text-to-text, puede probarse en tareas de descripción de imágenes o diálogo sobre imágenes, con validación previa de que la capacidad visual se conserva tras el merge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 72 GB solo para pesos, más overhead de activaciones y caché KV; se requieren GPUs de 80 GB o configuraciones multi-GPU.
- Cuantización a 8 bits: en torno a 36 GB de pesos, viable en una A100 80 GB o H100 80 GB con margen, o en dos GPUs de 24 GB con reparto.
- Cuantización a 4 bits: alrededor de 18-20 GB de pesos, lo que permite ejecución en una RTX 4090 de 24 GB, sujeta a que la implementación soporte el modelo MoE y la torre visual.
- GPUs recomendadas: A100 80 GB, H100 80 GB o H200 para precisión completa; RTX 4090 o L40S solo con cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada), y previsiblemente vLLM, TGI o llama.cpp si soportan la arquitectura `qwen3_5_moe`; la disponibilidad efectiva de soporte no está confirmada en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B | 35.951.822.704 | no disponible | Apache 2.0 | Merge DAGE de tres derivados de Qwen3.6-35B-A3B |
| Qwen/Qwen3.6-35B-A3B | no disponible en la información | no disponible | no disponible en la información | Modelo base del merge; referencia para comparar efectos de la fusión |
| Gryphe/WorldSim-Opus-3.6-35B-A3B | no disponible en la información | no disponible | no disponible en la información | Componente del merge, orientado a simulación de mundo |
| ReadyArt/Melody1437-35B-A3B | no disponible en la información | no disponible | no disponible en la información | Componente del merge, orientado a conversación |

## Limitaciones y advertencias

- Al ser un merge y no un modelo entrenado, no hay garantía de que las capacidades de los modelos fusionados se sumen; es frecuente la degradación parcial en tareas específicas.
- No se han publicado evaluaciones, benchmarks ni análisis de regresiones, por lo que la calidad real frente al base Qwen3.6-35B-A3B es desconocida.
- Riesgo de alucinación no cuantificado: no hay datos sobre tasas de factualidad ni sobre el comportamiento en dominios técnicos.
- Idiomas soportados no documentados; no debe asumirse un rendimiento multilingüe equivalente al del modelo base sin pruebas.
- Longitud de contexto no documentada en la ficha; es necesario consultar la configuración del tokenizador y del modelo base para confirmarla.
- El sesgo hacia roleplay y narrativa puede reducir la adecuación para tareas de razonamiento estricto, código o matemáticas en producción.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los modelos fusionados y de los datos que los originaron antes de un uso comercial.
- El modelo tiene 0 descargas registradas y 2 likes en el momento de la consulta; la ausencia de uso comunitario implica falta de validación externa.
- El tamaño de 71,9 GB en el repositorio exige planificación de almacenamiento y ancho de banda para su descarga y despliegue.

## Enlaces

- [Hugging Face: Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B](https://huggingface.co/Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Componente: ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Componente: Gryphe/WorldSim-Opus-3.6-35B-A3B](https://huggingface.co/Gryphe/WorldSim-Opus-3.6-35B-A3B)
- [Componente: ReadyArt/Melody1437-35B-A3B](https://huggingface.co/ReadyArt/Melody1437-35B-A3B)
- [mergekit (repositorio de la herramienta de merge)](https://github.com/cg123/mergekit)
