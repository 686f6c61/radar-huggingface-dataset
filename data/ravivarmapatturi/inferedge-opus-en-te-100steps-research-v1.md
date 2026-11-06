# ravivarmapatturi/inferedge-opus-en-te-100steps-research-v1

## Resumen

Este modelo es un punto de control experimental de traducción automática del inglés al telugu, publicado por el usuario ravivarmapatturi bajo el proyecto InferEdge AI/VaayuEdge. Se trata de una versión afinada (fine-tuned) del modelo OPUS-MT de Helsinki-NLP, concretamente del checkpoint `Helsinki-NLP/opus-mt-en-dra`, orientado a lenguas dravídicas. El propio autor lo etiqueta explícitamente como "negative-result" (resultado negativo) y advierte que no está recomendado para producción: se publica únicamente por transparencia y reproducibilidad científica.

El modelo pertenece a la familia MarianMT/OPUS-MT, arquitecturas transformer encoder-decoder diseñadas específicamente para traducción. Con aproximadamente 76,9 millones de parámetros, es un modelo pequeño y ligero, ejecutable en CPU. Su interés actual no radica en su calidad de traducción —los benchmarks internos muestran una regresión respecto al modelo base— sino en ser un ejemplo documentado de experimento fallido de adaptación conversacional, con datos de entrenamiento, métricas held-out y hashes de ejecución publicados.

Su relevancia para desarrolladores e investigadores es metodológica: sirve como caso de estudio de sobreajuste a un dominio reducido (conversación diaria) con muy pocos pasos de entrenamiento, y como referencia del pipeline de evaluación con SacreBLEU sobre IN22. Para traducción inglés-telugu en producción, el propio autor recomienda acudir a los modelos IndicTrans2 de AI4Bharat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, seq2seq) |
| Parametros totales | 76.432.872 (dato real de safetensors; la model card indica ~76,9M) |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | máx. 256 tokens en generación (inferencia evaluada); entrenamiento con longitud máx. 128 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) y telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es Marian, la implementación transformer encoder-decoder del ecosistema OPUS-MT de Helsinki-NLP, entrenada originalmente para pares de lenguas dravídicas (`opus-mt-en-dra`). El modelo hereda los pesos preentrenados de la revisión `5ecfd223f954f860b67f1b4c42e6f4c70d347581` del repositorio upstream.

El ajuste fino se realizó en Kaggle (run 363252210) con solo 100 pasos de optimizador, tamaño de batch 4, optimizador AdamW con tasa de aprendizaje 2e-5, semilla 42 y longitud máxima de entrenamiento de 128 tokens. Se procesaron aproximadamente 400 ejemplos de un total de 7.673 filas de entrenamiento, es decir, menos de una época completa. El corpus de entrenamiento proviene del componente Daily del dataset AI4Bharat BPCC-H (8.511 pares inglés-telugu limpiados, con 412 de validación y 426 de test), identificado con licencia CC-BY-4.0 en su revisión `5bde309374f21c39e7c3d505f28ae11f58f2a220`. El corpus y los datos de referencia no se redistribuyen en el repositorio. Los logs de entrenamiento registraron advertencias sobre módulos inicialmente en modo evaluación (eval mode), un problema que la receta posterior de IndicTrans2 corrige explícitamente; este checkpoint histórico se conserva tal cual, sin corregir ese warning retroactivamente.

## Capacidades

- Traducción texto a texto del inglés al telugu (pipeline `text2text-generation` / `translation`).
- Uso de prefijo de idioma en la entrada: se requiere el token `>>tel<<` antes del texto fuente para dirigir la traducción al telugu.
- Generación con búsqueda por haces (beam search); la evaluación se realizó con 3 beams y máximo de 256 tokens.
- Inferencia viable en CPU gracias a su tamaño reducido (~76,9M parámetros, ~0,3 GB de repo).
- No dispone de capacidades de chat, tool calling, agentes, visión ni audio. Es un modelo de traducción puro y, según sus propios resultados, con calidad degradada respecto al modelo base.

## Casos de uso

- **Estudio de sobreajuste en traducción automática:** el caso de uso principal y más honesto. Permite analizar cómo 100 pasos de fine-tuning sobre un corpus conversacional reducido degradan chrF++ en dominios generales, útil para docencia y metodología de investigación.
- **Reproducibilidad de experimentos:** al publicarse con hashes de ejecución, semilla fija y reporte de integridad del archivo, sirve como réplica verificable de un pipeline de fine-tuning en Kaggle sobre OPUS-MT.
- **Prototipado rápido de traducción inglés-telugu en CPU:** puede integrarse en demos o scripts locales con `transformers` sin GPU, aunque con calidad limitada (BLEU inferior a 4 en IN22).
- **Comparación de checkpoints:** permite comparar directamente el modelo upstream `opus-mt-en-dra` frente a una variante adaptada, usando los scripts y datos de evaluación de IN22 incluidos como referencia.
- **Base para reentrenamientos mejorados:** puede partirse de este repo como plantilla de estructura y configuración para afinar con más datos, más épocas y modo entrenamiento forzado, siguiendo la receta de IndicTrans2.
- **Documentación de atribución y licencias:** el proyecto ejemplifica cómo preservar la atribución a Helsinki-NLP/OPUS-MT y la licencia Apache 2.0 al derivar pesos, y cómo documentar los permisos parciales de un corpus multi-componente como BPCC.

No es adecuado para producción, atención al cliente, ni ningún escenario que exija calidad de traducción competitiva.

## Benchmarks y rendimiento

Resultados held-out publicados por el autor: evaluación completa de IN22 con 3 beams, máximo 256 tokens, prefijo de telugu requerido, inferencia en CPU y SacreBLEU 2.6.0. El autor advierte que la exposición del modelo upstream a estos datos de entrenamiento es desconocida y que no se reclaman intervalos de incertidumbre ni evaluaciones humanas.

| Dataset | N | BLEU upstream | BLEU adaptado | chrF++ upstream | chrF++ adaptado |
|---|---:|---:|---:|---:|---:|
| IN22 conversation | 1503 | 3,852 | 3,879 | 28,367 | 27,150 |
| IN22 general | 1024 | 3,675 | 2,013 | 26,863 | 19,986 |

La conclusión del propio autor: el aumento marginal de BLEU en conversación no establece una mejora, y chrF++ cae en ambas particiones, señal clara de regresión por sobreadaptación al dominio (hipótesis, no diagnóstico probado). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, lo cual es esperable al no ser un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por tamaño (~76,9M parámetros, ~0,3 GB en safetensors) cabe con holgura en cualquier GPU moderna e incluso es ejecutable íntegramente en CPU, como demuestra la propia evaluación del autor.
- GPU recomendadas: ninguna en particular; no se requiere GPU. Para reentrenar, el experimento original se ejecutó en una GPU de Kaggle.
- Consumer GPUs: cabe en cualquier GPU de consumo (por ejemplo, una RTX 3060 con 8 GB sería sobrada); también funciona sin GPU.
- Opciones de despliegue: `transformers` (AutoTokenizer + AutoModelForSeq2SeqLM) es la vía documentada. Al ser compatible con Marian, debería funcionar también con `optimum` y ONNX Runtime; no hay evidencia publicada de despliegue con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. No se aportan datos de memoria, latencia, energía ni rendimiento en móvil o navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | BLEU/chrF++ (IN22 en→te) | Licencia |
|---|---|---|---|---|---|
| ravivarmapatturi/inferedge-opus-en-te-100steps-research-v1 | 76,4M | Traducción en→te | máx. 256 en generación | 3,88 / 27,15 (conversation); 2,01 / 19,99 (general) | Apache 2.0 |
| Helsinki-NLP/opus-mt-en-dra (base) | no disponible | Traducción en→lenguas dravídicas | no disponible | 3,85 / 28,37 (conversation); 3,68 / 26,86 (general) | Apache 2.0 |
| AI4Bharat IndicTrans2 (en-indic) | no disponible | Traducción en→22 lenguas indias | no disponible | no disponible (el autor indica que sus resultados son superiores y no deben mezclarse) | no disponible |

Conclusión de la comparativa: el modelo base upstream supera a esta versión afinada en chrF++ en ambas particiones de IN22, y los modelos IndicTrans2 de AI4Bharat son la referencia actual para traducción inglés-telugu. Para trabajo real, se recomienda el modelo base o IndicTrans2.

## Limitaciones y advertencias

- **Resultado negativo declarado:** el propio autor lo marca como `negative-result` y "no recomendado para producción". La adaptación degrada la calidad de traducción en dominio general (chrF++ cae de 26,86 a 19,99 en IN22 general).
- **Entrenamiento insuficiente:** menos de una época, ~400 ejemplos procesados y solo 100 pasos de optimizador; el fine-tuning es esencialmente ruido metodológico.
- **Posible bug de entrenamiento:** los logs registraron advertencias de módulos en modo evaluación durante el entrenamiento, lo que puede haber invalidado parcialmente el proceso.
- **Riesgo de alucinación y traducciones erróneas:** alto, dada la calidad métrica muy baja (BLEU < 4) y la regresión respecto al modelo base.
- **Alcance limitado:** solo inglés→telugu; requiere el prefijo `>>tel<<` en la entrada. No es un modelo general, ni multimodal, ni de chat.
- **Licencia y atribución:** Apache 2.0, pero deben preservarse la atribución a Helsinki-NLP/OPUS-MT y la atribución CC-BY-4.0 del componente Daily de BPCC-H; los permisos de otros componentes de BPCC no se infieren y el corpus no se redistribuye.
- **Sin garantías de rendimiento:** no hay datos de latencia, memoria, consumo energético ni evidencia de funcionamiento en móvil, navegador o pipelines ASR/TTS completos. No se reclama SOTA, novedad ni superioridad sobre ningún proveedor.
- **Reproducibilidad:** se recomienda fijar (pin) un commit concreto del repositorio al usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ravivarmapatturi/inferedge-opus-en-te-100steps-research-v1
- Modelo base (Helsinki-NLP/opus-mt-en-dra): https://huggingface.co/Helsinki-NLP/opus-mt-en-dra
- Repositorio IndicTrans2 (AI4Bharat): https://github.com/AI4Bharat/IndicTrans2
- Paper citado (arXiv 2305.16307): https://arxiv.org/abs/2305.16307
- Referencia SacreBLEU (ACL Anthology W18-6319): https://aclanthology.org/W18-6319/
