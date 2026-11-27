# qcf568/DefakerOne2

## Resumen

Venus-DefakerOne2 es un modelo fundacional de forensia visual desarrollado por el equipo GuangJian de Ant Group en colaboración con el Comité Técnico de Forensia y Seguridad de Medios Digitales de CSIG. Su función principal es determinar si una imagen o un vídeo es real o ha sido generado o manipulado por IA, devolviendo una respuesta categórica (`Real` o `Fake`) en un único token de salida. El modelo se distribuye con dos checkpoints: `preview`, que reproduce los resultados del paper, y `release`, entrenado con más datos y con mejor rendimiento esperado en la mayoría de los casos.

La relevancia del modelo radica en su enfoque de "cobertura amplia": no se limita a un único generador o tipo de manipulación, sino que aspira a cubrir un espectro amplio de modelos generativos y técnicas de falsificación. El repositorio ocupa 8,9 GB en formato safetensors y la arquitectura declarada en los tags es `qwen3_5`, lo que sugiere una base multimodal de la familia Qwen 3.5 adaptada a la tarea de detección. El modelo se publica bajo el identificador `qcf568/DefakerOne2` en Hugging Face, aunque la descarga oficial se realiza vía ModelScope.

La información pública disponible es limitada: no se declaran licencia, idiomas ni pipeline en la ficha de Hugging Face, y los detalles de entrenamiento, benchmarks y requisitos de hardware deben inferirse de la model card y del paper referenciado. Esta ficha recoge exclusivamente los datos proporcionados y marca como "no disponible" todo aquello que no aparece en la información de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (tag de Hugging Face: `qwen3_5`; se infiere base multimodal tipo transformer, sin confirmar) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; se menciona `torchao==0.16.0` en dependencias, sin detallar esquemas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 8,9 GB |
| Checkpoints | `preview/` (reproduce el paper) y `release/` (más datos, mejor rendimiento esperado) |
| Modalidades de entrada | Imagen y vídeo |
| Formato de inferencia | JSONL (un sample por línea) |
| Salida | Token único: `Real` o `Fake` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag `qwen3_5` en Hugging Face, que apunta a una base de la familia Qwen 3.5. Dado que el modelo procesa imágenes y vídeos y responde con un token de clasificación, se trata presumiblemente de un modelo multimodal adaptado a una tarea de clasificación binaria (real/fake). No se especifican el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se emplearon técnicas de RLHF o DPO.

Sí se documenta que existen dos checkpoints: `preview`, entrenado para reproducir los resultados del paper, y `release`, entrenado con más datos y con rendimiento superior esperado en la mayoría de los casos. El prompt de inferencia es fijo y directo ("Is this image real or fake? Answer only Real or Fake"), lo que fuerza al modelo a comprometerse con una conclusión en un solo token. La inferencia se ejecuta con `ms-swift` (versión 4.1.0) y se controla la resolución de entrada mediante `MIN_PIXELS=262144` y `MAX_PIXELS=2408448`, además de parámetros como `--enable_thinking False`, `--logprobs True` y `--top_logprobs 20`, que permiten recuperar la distribución de probabilidad sobre los tokens de salida.

## Capacidades

- Detección de imágenes generadas o manipuladas por IA, con salida binaria `Real`/`Fake`.
- Detección de vídeos generados o manipulados por IA, con la misma salida binaria.
- Procesamiento multimodal de imagen y vídeo en un único pipeline de inferencia.
- Salida con log-probabilidades (`--logprobs True`, `--top_logprobs 20`) para umbralizar o calibrar la confianza de la predicción.
- Cobertura amplia de generadores y técnicas de falsificación, según el enfoque declarado en el título del paper ("Broader Coverage").
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código ni audio.
- No se documentan capacidades multilingües ni de generación de texto libre.

## Casos de uso

- Moderación de contenido en plataformas: integración del modelo en pipelines de subida de imágenes y vídeos para marcar automáticamente contenido sintético antes de su publicación, usando la salida `Real`/`Fake` y las log-probabilidades para definir umbrales de revisión humana.
- Verificación periodística: comprobación rápida de imágenes y vídeos virales recibidos en redacciones, con el checkpoint `release` como primera línea de filtro y revisión manual de los casos de baja confianza.
- Forensia digital en entornos judiciales o de seguros: análisis pericial de pruebas audiovisuales aportadas en un caso, usando el checkpoint `preview` para reproducir resultados publicados y auditables.
- Detección de deepfakes en vídeo: análisis de clips sospechosos en flujos de verificación de identidad o KYC, donde el modelo procesa el vídeo directamente como entrada.
- Filtrado en datasets de entrenamiento: limpieza de corpus de imágenes y vídeos para eliminar muestras sintéticas antes de usarlas en el entrenamiento de otros modelos.
- Investigación en forensia de medios: uso del modelo como baseline o componente de comparación en estudios sobre detección de contenido generado, con la ventaja de disponer de dos checkpoints y de un benchmark asociado (RRVBench).
- Monitorización de campañas de desinformación: procesamiento por lotes de grandes volúmenes de medios (formato JSONL, `--batch_size 1` por defecto) para identificar patrones de contenido sintético coordinado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el checkpoint `preview` permite reproducir los resultados del paper (arXiv:2610.37918) y que el checkpoint `release` se espera superior en la mayoría de los casos, pero no se incluyen cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 8,9 GB en safetensors, por lo que en precisión completa se requiere al menos esa cantidad de memoria más overhead de activaciones y del procesador multimodal.
- GPU recomendadas: no especificadas en la información disponible. El comando de inferencia usa `CUDA_VISIBLE_DEVICES=0`, lo que indica ejecución en una sola GPU.
- ¿Cabe en GPU de consumo? No confirmado. Con 8,9 GB de pesos, una GPU con 16 GB o más podría albergarlo en precisión completa, pero no hay datos oficiales de consumo de VRAM ni de cuantizaciones soportadas.
- Opciones de despliegue: `ms-swift` 4.1.0 es el framework documentado para la inferencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El comando de ejemplo usa `--batch_size 1` y `--num_workers 8` para carga de datos, sin cifras de rendimiento publicadas.
- Entorno: Python 3.12.3, torch 2.9.0, torchvision 0.24.0, numpy 1.26.0, scipy 1.11.3, scikit-learn 1.3.2, torchao 0.16.0.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (forensia visual de imagen y vídeo) ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con los autores o consultar el repositorio oficial antes de un despliegue en producción.
- Idiomas no declarados: aunque la tarea es de clasificación visual, se desconoce si el prompt fijo está pensado solo para inglés.
- Salida binaria forzada: el modelo responde `Real` o `Fake` en un único token, lo que limita la granularidad del análisis y no ofrece explicaciones ni localización de la manipulación.
- Riesgo de sesgo hacia los generadores presentes en el entrenamiento: aunque el modelo declara "cobertura amplia", no se detalla qué generadores ni manipulaciones cubre, por lo que puede fallar ante modelos generativos nuevos o poco representados.
- Riesgo de falsos positivos y negativos: no se publican métricas de precisión, recall ni tasas de error en la información disponible.
- Dos checkpoints con comportamiento distinto: `preview` y `release` pueden dar resultados diferentes; hay que fijar explícitamente cuál se usa en producción.
- Dependencia de `ms-swift` y de versiones concretas de torch y torchvision: la integración con otros stacks (vLLM, TGI) no está documentada.
- Repositorio con 0 descargas y 1 like en Hugging Face: la distribución principal parece ser ModelScope, lo que puede afectar a la trazabilidad y al soporte comunitario.
- No se documentan limitaciones específicas de contexto, resolución o duración de vídeo más allá de los parámetros `MIN_PIXELS` y `MAX_PIXELS`.

## Enlaces

- Hugging Face: https://huggingface.co/qcf568/DefakerOne2
- Paper (arXiv): https://arxiv.org/abs/2610.37918
- Repositorio GitHub: https://github.com/inclusionAI/DefakerOne2
- ModelScope (modelo): https://www.modelscope.cn/models/DanceText/DefakerOne2
- ModelScope (benchmark RRVBench): https://www.modelscope.cn/models/DanceText/RRVBench
- Página del proyecto: https://venus-guangjian.github.io/Venus-DeFakerOne2/
