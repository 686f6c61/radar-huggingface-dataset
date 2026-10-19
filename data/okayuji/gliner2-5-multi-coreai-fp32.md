# okayuji/gliner2.5-multi-coreai-fp32

## Resumen

`okayuji/gliner2.5-multi-coreai-fp32` es una conversión a **Core AI** (el stack on-device de Apple presentado con macOS 27) del modelo zero-shot de extracción de entidades [`fastino/gliner2.5-multi-v1`](https://huggingface.co/fastino/gliner2.5-multi-v1), revisión `2ca71aaf`, en precisión **FP32**. No es un modelo nuevo ni un ajuste fino: es el mismo extractor de spans de GLiNER2.5 convertido a un asset `.aimodel` con dos funciones estáticas (`encode` y `pair`), tokenizador mDeBERTa-v3 sin modificar y un `contract.json` que fija entradas, salidas y topes. El repositorio se publica explícitamente como **registro de verificación de la conversión**, no como herramienta lista para producción.

El interés técnico está en la doble naturaleza del artefacto. Por un lado demuestra que la conversión es **fiel**: sobre las 299 frases puntuadas del conjunto público de evaluación, el build Core AI y el modelo PyTorch original (ambos FP32) tomaron la misma decisión en todas las frases, con diferencias de probabilidad de como máximo 2,2e-5 y solo 4 extremos de span desplazados un carácter. Por otro, documenta un **fallo de caso de uso**: en 199 memorandos ficticios en japonés de inspección diaria de camiones, el modelo colocó un candidato falso en 9 de 199 campos principales no mencionados, con precisión de span 0,770 y recall 0,871, por debajo del umbral preregistrado (máximo 2 falsos, precisión 0,90, recall 0,80).

Es relevante ahora porque sirve como referencia reproducible para quien construya runtimes Core AI sobre Apple Silicon (incluidas las reescrituras de DeBERTa que permiten especializar el grafo en la GPU del Mac) y como ejemplo metodológico de publicación negativa: la decisión B3 (publicar solo la conversión y su verificación) se tomó antes, sobre un conjunto sellado no público con la misma estructura. Todas las medidas se hicieron en un único Mac con Apple M4 Max y 128 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2.5 zero-shot span/boundary extractor sobre encoder mDeBERTa-v3, convertido a Core AI y dividido en dos funciones estáticas (`encode` y `pair`) con pooling de candidatos en el host |
| Parametros totales | no disponible (los pesos FP32 compartidos por las cuatro funciones de `main.mlirb` ocupan 1.231.651.630 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens como máximo; la ventana deslizante para textos largos (`extract_long`) del modelo original no está portada |
| Tipos de cuantizacion | solo FP32 (no hay variantes GGUF, INT8 ni INT4 en este repositorio) |
| Idiomas soportados | `ja` y multilingüe según la model card; la evaluación publicada es únicamente en japonés |
| Licencia | Apache-2.0 |
| Formato de pesos | asset Core AI (`.aimodel` con `main.mlirb`, `metadata.json`, `main.hash`); tokenizador `tokenizer/tokenizer.json` (SentencePiece Unigram de mDeBERTa-v3) |

Otros datos del repositorio: 1,2 GB de tamaño total, `contract.json` de 2.204 B con modelo y revisión upstream, `verification/` de 71.328 B con los resúmenes JSON de las comprobaciones y el SHA-256 de los registros de laboratorio, y `SHA256SUMS` con el hash de todos los ficheros excepto `README.md`, `SHA256SUMS` y `.gitattributes`.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GLiNER2.5 en su variante multilingüe: un encoder tipo transformer (mDeBERTa-v3, vocabulario SentencePiece Unigram, tokenizador de 16.039.649 B copiado sin cambios de la revisión upstream) que alimenta un cabezal de puntuación de pares entidad-span, lo que permite extracción zero-shot definiendo los tipos de entidad en tiempo de inferencia en lugar de reentrenar el cabezal. La conversión a Core AI separa ese cómputo en dos funciones estáticas: `encode`, que produce las representaciones, y `pair`, que puntúa los pares, dejando el pooling de candidatos en el lado del host. El `contract.json` fija los inputs y outputs de cada función, los topes fijos y las constantes del procesamiento en host. La model card menciona además reescrituras de DeBERTa necesarias para que el grafo se especialice en la GPU del Mac.

No se aporta información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; esos datos corresponden al modelo upstream y no se detallan en esta ficha. La innovación técnica documentada aquí no es de entrenamiento sino de despliegue y verificación: conversión FP32 a un asset Core AI con paridad funcional demostrada frente a PyTorch, más una evaluación de tarea con umbral preregistrado y decisión de publicación fijada de antemano sobre un conjunto sellado. La especialización de pesos en el sistema operativo genera una caché de aproximadamente 1,5 GiB (1.543.784 KiB medidos por nombre de proceso) en la primera carga.

## Capacidades

- Extracción de spans zero-shot: identificación de entidades y campos definidos como etiquetas en tiempo de inferencia, sin reentrenamiento.
- Clasificación de tokens y puntuación de pares entidad-span (`token-classification`), con candidato primario y conjunto de candidatos alternativos.
- Capacidad multilingüe heredada del modelo upstream; único idioma evaluado y verificado: japonés.
- Funcionamiento on-device en Apple Silicon mediante Core AI, con ejecución en GPU del Mac (`--compute-units gpu`).
- Filtrado de candidatos configurable en el host (`--candidate-filter r1`) y formularios de campos externos (`--form`) para adaptar el esquema de extracción.
- Verificación de integridad criptográfica del artefacto mediante `SHA256SUMS`.
- No soporta tool calling ni function calling.
- No es un modelo generativo: no produce texto libre, razonamiento multi-paso ni agentes.
- No soporta visión, audio ni modo thinking.
- No soporta entradas de más de 512 tokens ni el procesamiento de textos largos (`extract_long`) del modelo original.

## Casos de uso

- Construcción de runtimes Core AI: el repositorio sirve como referencia verificada de un extractor de fronteras GLiNER2 dividido en `encode` y `pair`, con pooling de candidatos en host y reescrituras de DeBERTa para especializar en la GPU del Mac; útil para validar un pipeline propio antes de portar otros modelos.
- Auditoría de fidelidad de conversiones: comparar las decisiones del build Core AI con las del PyTorch original sobre las 299 frases del conjunto público, usando la tolerancia observada (2,2e-5 en probabilidades) como criterio de aceptación de futuras conversiones.
- Reproducción y extensión de la evaluación japonesa: el dataset `okayuji/ja-vehicle-inspection-memo-extraction-eval` incluye conjunto, reglas de oro y predicciones, y el README documenta el comando headless exacto (`--extract-eval`) con los formularios U1 y U3.
- Preetiquetado para anotación humana: aplicar el modelo a fragmentos de menos de 512 tokens en japonés o en otros idiomas para generar candidatos iniciales que un anotador revise, aceptando la precisión medida de 0,770 en candidato primario y 0,871 en recall sobre el dominio de memorandos de inspección.
- Pruebas de viabilidad de extracción zero-shot: medir con un esquema de campos propio si el enfoque alcanza un umbral definido antes de invertir en anotación o ajuste fino, replicando la metodología de barrera preregistrada del autor.
- Benchmark on-device en Apple Silicon: medir latencia y consumo en un Mac con M4 Max usando el binario Release de `coreai-samples` en el commit indicado, y comparar con otras conversiones sobre el mismo runtime.
- Docencia y estudio de límites de GLiNER: el par de resultados (fidelidad perfecta de conversión, rendimiento insuficiente en la tarea) es material concreto para explicar la diferencia entre paridad numérica y utilidad práctica.
- Validación de integridad en pipelines: el uso de `SHA256SUMS` y de un `contract.json` con modelo y revisión upstream permite fijar el artefacto exacto en un entorno de CI para Mac.

## Benchmarks y rendimiento

Fidelidad de la conversión (299 frases puntuadas del conjunto público de evaluación, FP32 frente a FP32):

| Metrica | Resultado |
|---|---|
| Frases con la misma decisión que PyTorch | 299 de 299 |
| Diferencia máxima de probabilidad | 2,2e-5 |
| Extremos de span desplazados un carácter | 4 |

Evaluación de tarea (199 memorandos ficticios en japonés de inspección de camiones):

| Metrica | Resultado | Umbral preregistrado |
|---|---|---|
| Campos principales no mencionados con candidato falso | 9 de 199 | máximo 2 |
| Precisión de span (candidato primario) | 0,770 | 0,90 |
| Recall de span (cualquier candidato) | 0,871 | 0,80 |

La decisión de publicación (rama B3: solo conversión y verificación) se tomó previamente sobre un conjunto sellado no público con la misma estructura. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de NER) en la información disponible.

## Requisitos de hardware

- Plataforma obligatoria: Mac con Apple Silicon y macOS 27 o posterior (Core AI); no se midió nada en iPhone ni iPad.
- VRAM/unificada: no se declara un requisito de memoria; las medidas se hicieron en un Apple M4 Max con 128 GB de memoria unificada.
- Disco: aproximadamente 1,25 GB para el repositorio y aproximadamente 1,5 GiB adicionales para la caché de especialización que el sistema escribe en la primera carga (1.543.784 KiB medidos por nombre de proceso).
- GPU: se ejecuta en la GPU del Mac mediante `--compute-units gpu`; no hay soporte documentado para CUDA, A100, H100 ni RTX 4090.
- Despliegue: app `coreai-samples` (Swift, pantalla Extract con Open Asset Folder) o su binario Release en modo headless con `--extract-eval`; requiere Xcode 27 para compilar.
- Latencia y throughput: no disponibles; el autor menciona cifras de velocidad en los registros del commit `5f2ab56`, pero no se incluyen valores en la información proporcionada.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI: el formato es un asset `.aimodel` de Core AI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `okayuji/gliner2.5-multi-coreai-fp32` | no disponible (pesos FP32 de 1,23 GB) | 512 tokens, sin `extract_long` | Precisión 0,770 / recall 0,871 en memorandos japoneses; paridad exacta con PyTorch en 299 frases | Apache-2.0 | Repositorio HF; requiere macOS 27 y Apple Silicon |
| `fastino/gliner2.5-multi-v1` (upstream, revisión `2ca71aaf`) | no disponible | ventana deslizante para textos largos incluida (`extract_long`) | Referencia PyTorch de la comparación; mismas decisiones en la evaluación | Apache-2.0 | Repositorio HF; ejecutable en PyTorch |
| Otras conversiones Core AI de GLiNER | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La comparación relevante es con el upstream: misma licencia, mismos pesos y mismo tokenizador, con la diferencia de que la conversión fija el límite de 512 tokens, elimina `extract_long` y no ha sido validada en dispositivos móviles. No hay datos públicos para comparar con otros extractores zero-shot de tamaño similar.

## Limitaciones y advertencias

- El propio autor declara que el modelo **no alcanza el umbral** para el caso de uso previsto: 9 de 199 campos no mencionados recibieron un candidato falso, frente al máximo de 2 exigido.
- Precisión de span de 0,770 en candidato primario, por debajo del 0,90 preregistrado; el recall de 0,871 solo se obtiene considerando cualquier candidato.
- Riesgo de falsos positivos en campos que el documento no menciona: en un formulario real esto implica entradas inventadas si no hay revisión humana o un paso de validación posterior.
- Límite estricto de 512 tokens y ausencia de `extract_long`: los textos largos requieren troceado propio en el host.
- Evaluación limitada al japonés y a un único dominio (memorandos de inspección de vehículos); no hay evidencia publicada para otros idiomas, dominios ni para el multilingüe declarado.
- Sin mediciones en iPhone ni iPad: el uso móvil no está verificado.
- Dependencia de plataforma: macOS 27 o posterior y Apple Silicon; no hay ruta de despliegue en Linux, CUDA ni CPU x86.
- Dependencia de herramienta: el flujo headless necesita una build Release de `coreai-samples` en un commit concreto (`c851d64` para la evaluación de tarea, `5f2ab56` para velocidad y evaluación sellada).
- Los formularios importan: el formulario U1 incluido en la app tiene claves de campo distintas, por lo que hay que pasar `--form` con el fichero del dataset; un error aquí invalida la comparación.
- Licencia Apache-2.0 permite uso comercial, pero obliga a conservar `LICENSE` y `THIRD_PARTY_NOTICES.md` con la atribución al upstream, al tokenizador y al paper; el dataset de evaluación es CC BY 4.0.
- La reproducibilidad del comando headless depende de que el dataset enlazado sea público; el README advierte que, si el enlace no abre, el dataset no está disponible.
- No es un modelo conversacional ni un LLM: no cabe esperar generación de texto, razonamiento ni uso de herramientas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/okayuji/gliner2.5-multi-coreai-fp32
- Modelo upstream: https://huggingface.co/fastino/gliner2.5-multi-v1
- Dataset de evaluación: https://huggingface.co/datasets/okayuji/ja-vehicle-inspection-memo-extraction-eval
- App y repositorio de referencia: https://github.com/oka-yuji/coreai-samples
- Ficheros incluidos en el repositorio (sin URL propia): `LICENSE`, `THIRD_PARTY_NOTICES.md`, `contract.json`, `SHA256SUMS`, `verification/`
- Paper de GLiNER citado en la model card: no disponible (sin enlace en la información proporcionada)
- Demo o Space oficial: no disponible
