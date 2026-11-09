# sander-puts/codiesp-procedure-fragment-es

## Resumen

Codiesp procedure fragment detector (Spanish) es un modelo de clasificación de tokens basado en RoBERTa biomédica en castellano, desarrollado por Sander Puts dentro del proyecto CEI-Trace. Su función es identificar los fragmentos que componen una mención de procedimiento clínico en textos médicos en español: una anotación de procedimiento del corpus CodiEsp puede estar formada por varios trozos de texto separados, y este detector marca cada pieza (el fragmento principal como mención y los adicionales como spans anidados) junto con el término cabeza dentro de cada uno.

El modelo parte del encoder `PlanTL-GOB-ES/roberta-base-biomedical-clinical-es` (Apache-2.0) y añade tres cabezas de clasificación de tokens, inicializadas desde el detector de diagnósticos `sander-puts/codiesp-mention-lead-es` con pesos idénticos a nivel de byte. Se entrena sobre las anotaciones de procedimientos del corpus CodiEsp y forma parte de una tríada de detectores (mención-cabeza, fragmento y cabeza densa) que alimentan el arnés de codificación ICD-10-PCS de CEI-Trace.

Su relevancia es acotada pero específica: cubre un paso intermedio del pipeline de codificación clínica automática (la descomposición de menciones fragmentadas de procedimientos) que otros modelos de NER clínico no abordan de forma explícita. No es un modelo generativo ni un codificador final, sino un componente de token-classification pensado para integrarse en CEI-Trace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder RoBERTa (base) con tres cabezas de token-classification |
| Parametros totales | no disponible (modelo base RoBERTa-base, ~125 M; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 256 tokens con stride 128 en entrenamiento e inferencia |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | español (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`heads.pt` para las cabezas, `encoder/` para el encoder fine-tuneado) |

## Arquitectura y entrenamiento

La arquitectura es un encoder RoBERTa-base biomédico en castellano (`PlanTL-GOB-ES/roberta-base-biomedical-clinical-es`, licencia Apache-2.0) al que se superponen tres cabezas de clasificación de tokens. Las cabezas se inicializan desde el modelo `sander-puts/codiesp-mention-lead-es` con pesos idénticos a nivel de byte, de modo que este detector de fragmentos hereda la representación aprendida por el detector de menciones y cabezas de diagnóstico. Los pesos se distribuyen en dos artefactos: `heads.pt` para las cabezas y el directorio `encoder/` para el encoder fine-tuneado.

El entrenamiento utiliza las anotaciones de procedimientos del corpus CodiEsp, tratando cada fragmento como un span independiente (generación de datos con `pipelines/codiesp.py detector-data-procedures --fragments`) y los términos cabeza con el mismo criterio que el detector de menciones. Se realizaron 10 épocas con learning rate 3e-5, batch size 4, ventanas de 256 tokens con stride 128 y semilla 2025, seleccionando la época sobre el conjunto de desarrollo. La época 10 alcanzó un F1 de solapamiento externo de 0,720 y un F1 de solapamiento de término cabeza de 0,766. No se documenta uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo discriminativo de token-classification.

## Capacidades

- Detección de fragmentos de menciones de procedimientos clínicos en español: marca cada pieza textual que compone una mención fragmentada y distingue el fragmento principal (mención) de los adicionales (spans anidados).
- Identificación del término cabeza dentro de cada fragmento de procedimiento.
- Clasificación de tokens a nivel de span con etiquetas de mención, fragmento anidado y cabeza.
- Integración en el pipeline CEI-Trace como uno de los tres detectores de procedimientos, junto a `codiesp-procedure-mention-lead-es` y `codiesp-procedure-dense-lead-es`.
- Procesamiento por ventanas deslizantes de 256 tokens con stride 128, lo que permite cubrir documentos más largos que la ventana.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking: es un modelo puramente discriminativo de etiquetado de tokens.
- Capacidad multilingüe limitada al español; no se documentan otros idiomas.

## Casos de uso

- Codificación clínica automática ICD-10-PCS: el detector aporta la descomposición en fragmentos de las menciones de procedimiento, paso previo necesario para que el arnés de codificación de CEI-Trace asigne códigos oficiales. Es adecuado porque separa menciones compuestas que un NER convencional trataría como un único span.
- Extracción de procedimientos en informes de alta hospitalaria: permite localizar y aislar cada procedimiento realizado, incluyendo aquellos descritos en varias piezas de texto separadas dentro de la misma frase o párrafo.
- Preprocesado para pipelines de normalización terminológica: al identificar el término cabeza de cada fragmento, facilita el mapeo posterior a vocabularios controlados (SNOMED CT, CIE-10) sin arrastrar modificadores o complementos.
- Construcción de datasets anotados de procedimientos clínicos: el modelo puede usarse para preanotar corpus en español y reducir el esfuerzo de anotación manual, con revisión humana posterior dado su F1 de 0,720 en solapamiento externo.
- Investigación en NER clínico en español: sirve como componente reproducible (semilla 2025, hiperparámetros documentados) para experimentos de etiquetado de spans anidados y fragmentados.
- Integración en sistemas de codificación con capas de guías y práctica local: dentro de CEI-Trace, el detector alimenta la capa de codificación que aplica las guías de cada centro sobre el núcleo oficial ICD-10, un escenario donde la granularidad de fragmentos importa para respetar las reglas de codificación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| F1 de solapamiento externo (outer overlap) en desarrollo, época 10 | 0,720 |
| F1 de solapamiento de término cabeza (lead-term overlap) en desarrollo, época 10 | 0,766 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos alternativos en el mismo conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0,5 GB) y la base RoBERTa-base, cabe holgadamente en GPUs consumer de 4-8 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16; A100, H100 o RTX 4090 no son necesarias para este tamaño, aunque aceleran el procesamiento por lotes.
- Cabe en GPU consumer: sí, en GTX 1660, RTX 3060, RTX 4060 y superiores; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: la model card indica el uso mediante `python pipelines/codiesp.py detect --model <carpeta>` del repositorio CEI-Trace; al ser un modelo transformers con safetensors, es compatible con Hugging Face Transformers y potencialmente con servidores de inferencia estándar, aunque no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sander-puts/codiesp-procedure-fragment-es` | no disponible (base RoBERTa ~125 M) | ventanas de 256 tokens | Detección de fragmentos de procedimientos | CC BY 4.0 | Hugging Face |
| `sander-puts/codiesp-procedure-mention-lead-es` | no disponible (misma base) | ventanas de 256 tokens | Detección de mención y término cabeza de procedimientos | no disponible en la información | Hugging Face |
| `sander-puts/codiesp-procedure-dense-lead-es` | no disponible (misma base) | ventanas de 256 tokens | Detección de términos cabeza fuera de menciones | no disponible en la información | Hugging Face |
| `PlanTL-GOB-ES/roberta-base-biomedical-clinical-es` | ~125 M | 512 tokens (RoBERTa base) | Encoder biomédico en español (preentrenamiento) | Apache-2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (detectores de fragmentos de procedimientos clínicos en español) no está disponible: no se conocen otros modelos públicos que aborden esta tarea concreta. Los tres detectores de CEI-Trace son complementarios, no sustitutivos.

## Limitaciones y advertencias

- No apto para uso clínico: la model card lo indica explícitamente ("Not for clinical use").
- Entrenado exclusivamente sobre casos clínicos publicados en español del corpus CodiEsp; el dominio y el registro están acotados a informes de casos clínicos, lo que puede limitar la generalización a otros tipos de documento (historiales electrónicos, notas de urgencias, etc.).
- Riesgo de alucinación de spans: como todo modelo discriminativo, puede marcar fragmentos inexistentes o fusionar piezas que deberían ser spans separados; el F1 de solapamiento externo de 0,720 en desarrollo implica un margen de error apreciable en producción.
- Dependencia del contexto de ventana: la segmentación en ventanas de 256 tokens con stride 128 puede perder menciones que crucen los límites de ventana o que dependan de contexto más allá de la ventana.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero obliga a citar al autor y la fuente; el modelo base tiene licencia Apache-2.0, por lo que conviene verificar la compatibilidad de ambas licencias en el uso derivado.
- Idiomas: solo español; no se ha evaluado en otras lenguas ni en variantes dialectales distintas del español peninsular de los corpus de origen.
- Sesgos: no se documentan análisis de sesgos demográficos, geográficos o de género; al entrenarse sobre casos publicados, puede heredar sesgos de selección de la literatura clínica.
- Dependencia de pipeline: el uso previsto requiere el repositorio CEI-Trace y los otros dos detectores; su rendimiento aislado fuera de ese pipeline no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sander-puts/codiesp-procedure-fragment-es
- Repositorio CEI-Trace: https://github.com/putssander/CEI-Trace
- Modelo base: https://huggingface.co/PlanTL-GOB-ES/roberta-base-biomedical-clinical-es
- Detector de mención y cabeza de diagnóstico (inicialización de cabezas): https://huggingface.co/sander-puts/codiesp-mention-lead-es
- Detector de mención y cabeza de procedimientos: https://huggingface.co/sander-puts/codiesp-procedure-mention-lead-es
- Detector de cabeza densa de procedimientos: https://huggingface.co/sander-puts/codiesp-procedure-dense-lead-es
- Corpus CodiEsp (Miranda-Escalada et al., CLEF eHealth 2020): https://doi.org/10.5281/zenodo.3837305
- Artículo de CEI-Trace: Puts S, Dekker A. *CEI-Trace: fitting ICD-10 coding to a setting's guidelines and practice in layers around one official core* (2026); referencia citada en la model card, sin URL directa disponible.
