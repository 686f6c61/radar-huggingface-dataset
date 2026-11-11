# pipestream-ai/turbo-en-masc-3.0.0-modernbert-base-polarity-head-1

## Resumen

`turbo-en-masc-3.0.0-modernbert-base-polarity-head-1` es una cabeza de clasificación de texto (polarity head) publicada por pipestream-ai dentro del ecosistema turboembed. No es un modelo completo: se trata de un artefacto de tipo `KIND_HEAD` que se ejecuta sobre el codificador `answerdotai/ModernBERT-base` y que se instala a través del zoo de modelos de turboembed por su identificador. Su función declarada es la de categorizador de documentos (`COMPONENT_DOCUMENT_CATEGORIZER`) para inglés, orientado a la detección de polaridad subjetiva.

El artefacto se ha entrenado con turbo-trainer sobre 376 anotaciones de spans de polaridad subjetiva del corpus MASC 3.0.0 MPQA (American National Corpus, licencia CC BY 3.0 US). El fichero distribuido es un único binario de 9.349 bytes con formato `.tpvh`, lo que confirma que el peso real del encoder no se redistribuye aquí, sino que se referencia mediante el manifiesto del bundle base.

Su relevancia es acotada pero concreta: permite añadir un clasificador de polaridad ligero y de licencia permisiva (Apache-2.0) sobre un encoder ModernBERT ya desplegado, sin necesidad de reentrenar el backbone. La ausencia de métricas held-out y de descargas en el momento de la ficha obliga a tratar el artefacto como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de clasificación sobre encoder ModernBERT-base (transformer encoder bidireccional) |
| Parametros totales | No disponible para la cabeza; el encoder base ModernBERT-base tiene 149 M de parámetros (dato del modelo base, no confirmado en esta model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; heredada del encoder ModernBERT-base |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.tpvh` (formato propietario de turboembed, 9.349 bytes) |
| Componente | `COMPONENT_DOCUMENT_CATEGORIZER` (categorizador de documentos) |
| Tipo de artefacto | `KIND_HEAD`, `FORMAT_HEAD`, versión 1 |
| Modelo base | `answerdotai/ModernBERT-base` |
| Librería | turboembed |
| Pipeline | text-classification |
| Corpus de entrenamiento | MASC 3.0.0 MPQA, 376 spans de polaridad subjetiva |
| SHA-256 del fichero | `5fb54814d92530072e90fa9d0e701792a4cbb7487353ae1a3ddb4cb60b196909` |
| SHA-256 del manifiesto del encoder | `65a0720298fc5fe7f229ee57ffbe1ccf0eb3836a91526840ca23fa30a5937ac8` |

## Arquitectura y entrenamiento

La pieza publicada es exclusivamente una cabeza de clasificación, no un modelo autónomo. Se apoya en el encoder `answerdotai/ModernBERT-base`, un transformer bidireccional de la familia ModernBERT, y se distribuye como artefacto `FORMAT_HEAD` dentro del zoo de turboembed. El fichero `.tpvh` contiene los pesos de la cabeza y la referencia al manifiesto del encoder base (sha256 `65a07202…7ac8`), de modo que el zoo verifica tamaño y digests antes de la carga.

El entrenamiento se realizó con turbo-trainer sobre 376 spans anotados de polaridad subjetiva procedentes de MASC 3.0.0 MPQA (American National Corpus, CC BY 3.0 US). No se documenta en la model card el número de épocas, la configuración de hiperparámetros, la composición exacta del conjunto de validación ni si hubo ajuste fino completo del encoder o solo de la cabeza. Tampoco se indica el uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en una tarea de clasificación supervisada. No se declara ninguna innovación técnica específica más allá del propio formato de empaquetado de turboembed.

## Capacidades

- Clasificación de texto en inglés orientada a polaridad subjetiva (positivo/negativo/neutro según la definición de etiquetas del corpus MPQA).
- Categorización de documentos (`COMPONENT_DOCUMENT_CATEGORIZER`) sobre textos en inglés.
- Integración con el zoo de turboembed: instalación por identificador con verificación de integridad de ficheros.
- Reutilización del encoder ModernBERT-base subyacente, lo que permite compartir backbone con otras cabezas del mismo zoo.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Análisis de sentimiento sobre reseñas y comentarios en inglés: la cabeza clasifica polaridad sobre textos cortos o medios, aprovechando el encoder ModernBERT-base ya desplegado, sin necesidad de un modelo generativo.
- Moderación de contenido y triaje de opiniones: filtrar opiniones negativas en foros o soporte para enrutarlas a revisión humana, usando la salida de polaridad como señal previa.
- Enriquecimiento de pipelines de datos: etiquetar grandes volúmenes de documentos en inglés con polaridad subjetiva como paso de preprocesado antes de indexación o búsqueda.
- Investigación en lingüística computacional: reproducir o comparar anotaciones de polaridad sobre el corpus MASC/MPQA, dado que la cabeza se entrenó con ese esquema de etiquetas.
- Clasificación de documentos en sistemas de gestión documental: usar el componente `DOCUMENT_CATEGORIZER` para agrupar textos por tono o postura en inglés.
- Prototipado rápido en el ecosistema turboembed: instalar la cabeza por identificador y validar el flujo de inferencia antes de entrenar cabezas propias con turbo-trainer.
- Señal auxiliar en sistemas RAG: puntuar la polaridad de fragmentos recuperados para priorizar o descartar pasajes según el tono deseado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas held-out no están incluidas en el artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para la cabeza; el coste dominante es el del encoder ModernBERT-base, que no se cuantifica en esta model card.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; depende del encoder base y del runtime de turboembed, no documentados aquí.
- Opciones de despliegue: instalación a través del zoo de turboembed por identificador; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turbo-en-masc-3.0.0-modernbert-base-polarity-head-1 | Cabeza de clasificación sobre ModernBERT-base | No disponible (cabeza); encoder base no cuantificado aquí | No disponible | Apache-2.0 | Hugging Face (0 descargas) |
| answerdotai/ModernBERT-base | Encoder base | 149 M (dato del modelo base, no verificado en esta ficha) | No disponible en esta ficha | Apache-2.0 | Hugging Face |
| Otros clasificadores de polaridad sobre BERT/RoBERTa | Cabezas de clasificación | Variable | Variable | Variable | Hugging Face |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El artefacto no incluye evaluación held-out, por lo que su calidad no está declarada ni verificable a partir de la información publicada.
- Es una cabeza, no un modelo completo: requiere el bundle del encoder `answerdotai/ModernBERT-base` con el manifiesto sha256 `65a07202…7ac8`; sin él no funciona.
- Solo inglés; refleja el dominio y las definiciones de etiqueta del corpus de entrenamiento (MASC 3.0.0 MPQA), por lo que puede degradarse fuera de ese dominio.
- El entrenamiento se basa en 376 spans anotados, un volumen reducido que limita la generalización y aumenta el riesgo de sobreajuste.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas o poco calibradas en textos ambiguos o de dominio distinto.
- Sesgos: no documentados en la model card; al derivarse de un corpus anotado concreto, pueden heredarse sesgos de anotación y de dominio.
- Licencia Apache-2.0 permisiva para uso comercial, pero el corpus de entrenamiento MASC 3.0.0 MPQA es CC BY 3.0 US, lo que exige atribución; conviene revisar las condiciones de redistribución derivadas.
- El formato `.tpvh` es específico de turboembed y no es directamente interoperable con runtimes estándar como transformers, vLLM o llama.cpp.
- Sin descargas ni likes en el momento de la ficha: ecosistema y soporte comunitario prácticamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipestream-ai/turbo-en-masc-3.0.0-modernbert-base-polarity-head-1
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- README del modelo base (commit referenciado): https://huggingface.co/answerdotai/ModernBERT-base/blob/8949b909ec900327062f0ebf497f51aef5e6f0c8/README.md
- Licencia de turboembed: https://github.com/ai-pipestream/turboembed/blob/main/LICENSE
- Repositorio turboembed: https://github.com/ai-pipestream/turboembed
- Corpus MASC 3.0.0 (American National Corpus): https://anc.org/data/masc/
