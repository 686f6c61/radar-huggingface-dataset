# ccmusic-database/Guzheng_Tech99

## Resumen

Guzheng_Tech99 es un conjunto de modelos de clasificación de audio entrenados para la detección automática de técnicas de interpretación en grabaciones de guzheng, un instrumento de cuerda pulsada tradicional chino. Lo desarrolla el grupo ccmusic-database, vinculado al proyecto CCMusic, una base de datos abierta orientada a la investigación en recuperación de información musical (MIR) de música china. El modelo resuelve un problema concreto: identificar, a nivel de fotograma y sobre segmentos de audio cortos, qué técnica de ejecución (por ejemplo, pulsación, glissando o vibrato) se está empleando en cada momento de la interpretación.

Técnicamente no es un modelo generativo ni un LLM, sino un clasificador de audio construido sobre backbones de visión aplicados a representaciones espectrograma-like (Mel, CQT y Chroma). El repositorio agrupa varias combinaciones de backbone y representación de entrada, con resultados de accuracy que oscilan entre 0,508 y 0,862 según la configuración. El modelo más preciso es VGG19 sobre Mel (0,862), mientras que ConvNeXt-B ofrece el mejor equilibrio entre las tres representaciones (0,849 en Mel, 0,849 en CQT y 0,805 en Chroma).

Su relevancia actual es acotada pero específica: cubre un nicho poco atendido dentro de MIR (análisis técnico de interpretación instrumental en música tradicional china) y publica pesos, dataset y código de evaluación de forma abierta bajo licencia MIT, lo que facilita su reproducción y su uso como línea base en investigación musicológica computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de clasificadores de audio sobre backbones de visión (ViT-B-16, Swin-T, VGG19, EfficientNet-V2-L, ConvNeXt-B, ResNet101, SqueezeNet1.1) con entradas Mel, CQT y Chroma |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; segmentos de audio fijos de 3 segundos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh (etiquetas y dataset en chino) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 3,3 GB; el código de descarga usa `snapshot_download`) |

## Arquitectura y entrenamiento

El modelo se apoya en backbones de visión por computador (ViT-B-16, Swin-T, VGG19, EfficientNet-V2-L, ConvNeXt-B, ResNet101 y SqueezeNet1.1) aplicados sobre representaciones tiempo-frecuencia del audio: Mel, CQT y Chroma. Cada combinación backbone-representación se evalúa de forma independiente, de modo que el repositorio contiene múltiples clasificadores entrenados para la misma tarea de detección de técnicas de guzheng.

El entrenamiento se realizó sobre el dataset ccmusic-database/Guzheng_Tech99, compuesto por 99 grabaciones. El preprocesado elimina primero los silencios usando las anotaciones (las zonas sin anotación de técnica), segmenta después todas las grabaciones en fragmentos uniformes de 3 segundos y rellena con ceros los clips más cortos (padding con ceros en lugar de circular, para evitar introducir información espuria en tareas de detección a nivel de fotograma). La partición se hace a nivel de grabación en proporción 79:10:10 (aproximadamente 8:1:1) para train, validación y test. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset ni uso de RLHF/DPO.

## Capacidades

- Clasificación de audio de técnicas de interpretación de guzheng a partir de segmentos de 3 segundos.
- Detección a nivel de fotograma (frame-level) gracias al esquema de segmentación y padding con ceros.
- Evaluación con tres representaciones de entrada distintas: Mel, CQT y Chroma.
- Soporte de múltiples backbones intercambiables para comparar rendimiento y coste.
- Uso como línea base reproducible en investigación MIR de música china.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües más allá del etiquetado en chino del dataset.

## Casos de uso

- Análisis musicológico computacional: el modelo permite etiquetar automáticamente las técnicas de ejecución presentes en grabaciones de guzheng, lo que facilita estudios comparativos entre intérpretes y escuelas sin anotación manual exhaustiva.
- Herramienta educativa para estudiantes de guzheng: integrado en una aplicación de práctica, puede señalar en qué tramos de una grabación se detecta cada técnica, sirviendo de retroalimentación objetiva sobre la ejecución.
- Etiquetado y enriquecimiento de archivos musicales: permite añadir metadatos de técnica a colecciones de grabaciones tradicionales chinas, mejorando la buscabilidad y la preservación documental.
- Investigación en MIR: sirve como benchmark reproducible para comparar arquitecturas de visión aplicadas a audio y representaciones tiempo-frecuencia (Mel, CQT, Chroma) en una tarea de clasificación fina.
- Sistemas de recomendación musical especializados: las etiquetas de técnica permiten filtrar y recomendar grabaciones por estilo de ejecución, no solo por género o artista.
- Desarrollo de herramientas de transcripción asistida: la detección frame-level de técnicas puede alimentar pipelines que generen partituras o notaciones extendidas de interpretación.
- Evaluación de modelos de audio auto-supervisados: el dataset y el código de evaluación permiten medir la transferibilidad de representaciones preentrenadas a una tarea musical de nicho.

## Benchmarks y rendimiento

Resultados de accuracy reportados en la model card para cada combinación de backbone y representación:

| Backbone | Mel | CQT | Chroma |
|---|---|---|---|
| ViT-B-16 | 0,705 | 0,518 | 0,508 |
| Swin-T | **0,849** | **0,783** | **0,766** |
| VGG19 | **0,862** | 0,799 | 0,665 |
| EfficientNet-V2-L | 0,783 | 0,812 | 0,697 |
| ConvNeXt-B | 0,849 | **0,849** | **0,805** |
| ResNet101 | 0,638 | 0,830 | 0,707 |
| SqueezeNet1.1 | 0,831 | 0,814 | 0,780 |
| Media | 0,788 | 0,772 | 0,704 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de backbones de visión de tamaño pequeño-medio (SqueezeNet1.1 hasta EfficientNet-V2-L), la inferencia por segmento de 3 segundos es ligera y cabe con holgura en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para los backbones pequeños (SqueezeNet1.1, Swin-T, ResNet101); EfficientNet-V2-L y ConvNeXt-B requieren más margen pero siguen siendo asequibles en RTX 3060/4060 o superiores.
- Cabe en GPU de consumo: sí, en la mayoría de modelos del repositorio.
- Opciones de despliegue: descarga vía `huggingface_hub.snapshot_download`; el autor publica una demo en Hugging Face Spaces. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de audio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Entrada | Accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Guzheng_Tech99 (VGG19/Mel) | Clasificación de técnicas de guzheng | Audio 3 s (Mel) | 0,862 | MIT | Hugging Face, ModelScope |
| Guzheng_Tech99 (ConvNeXt-B/CQT) | Clasificación de técnicas de guzheng | Audio 3 s (CQT) | 0,849 | MIT | Hugging Face, ModelScope |
| Guzheng_Tech99 (Swin-T/Mel) | Clasificación de técnicas de guzheng | Audio 3 s (Mel) | 0,849 | MIT | Hugging Face, ModelScope |
| Alternativas de clasificación de técnicas instrumentales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables de la misma categoría (clasificación de técnicas de interpretación en instrumentos tradicionales chinos) con los que establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- El dataset es muy reducido (99 grabaciones), lo que limita la generalización a otros intérpretes, grabaciones o condiciones acústicas no representadas.
- La partición a nivel de grabación evita fuga de datos, pero el tamaño muestral sigue siendo pequeño para conclusiones robustas.
- El modelo está especializado exclusivamente en guzheng; no es transferible sin reentrenamiento a otros instrumentos.
- El etiquetado y los metadatos están en chino, lo que puede dificultar su integración en pipelines en otros idiomas.
- No se documentan análisis de sesgos, calibración ni riesgos de alucinación (no aplica al ser un clasificador, pero sí existe riesgo de falsos positivos/negativos en la detección de técnicas).
- El padding con ceros en clips cortos puede introducir artefactos en los bordes de segmento que afecten a la detección frame-level.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del dataset subyacente y citar el artículo de CCMusic según indica el autor.
- No se especifican formatos de pesos ni cuantizaciones, lo que puede complicar el despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccmusic-database/Guzheng_Tech99
- Dataset: https://huggingface.co/datasets/ccmusic-database/Guzheng_Tech99
- Demo (Space): https://huggingface.co/spaces/ccmusic-database/Guzheng_Tech99
- Mirror en ModelScope: https://www.modelscope.cn/models/ccmusic-database/Guzheng_Tech99
- Código de evaluación: https://github.com/monetjoe/ccmusic_eval/tree/tech99
- Artículo CCMusic (TISMIR 2025): https://doi.org/10.5334/tismir.194
