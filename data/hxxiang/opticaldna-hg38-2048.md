# hxxiang/opticaldna-hg38-2048

## Resumen

OpticalDNA-HG38-2048 es un modelo fundacional de genómica basado en visión, desarrollado por Hongxin Xiang y colaboradores, que reformula el modelado de ADN como un problema de reconocimiento óptico de caracteres (OCR). En lugar de procesar secuencias de nucleótidos como texto, el modelo renderiza el ADN en diseños visuales estructurados (documentos de 2048 bases) y entrena un modelo de visión-lenguaje con un codificador visual de ADN y un decodificador de documentos. Este enfoque permite aprender representaciones genómicas compactas y transferibles, con una capacidad de razonamiento regional que los modelos de secuencia tradicionales no ofrecen.

El checkpoint liberado corresponde al paso 190.000 de preentrenamiento sobre el genoma humano HG38, con 3.342.664.960 parámetros (3,34B) y pesos en formato safetensors. El modelo se presenta como un avance en la línea de los "vision-language models" aplicados a biología, con evidencia de que la representación visual aprendida en humanos se transfiere mejor a otras especies (arroz) que los baselines de secuencia preentrenados en el mismo genoma. Publicado en ICML 2026, el modelo está disponible bajo licencia MIT y su código se encuentra en el repositorio oficial de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (codificador visual de ADN + decodificador de documentos) |
| Parametros totales | 3.342.664.960 (3,34B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 bases de ADN renderizadas (nombre del modelo) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de genómica, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OpticalDNA se basa en un framework de visión-lenguaje que convierte secuencias de ADN en imágenes estructuradas (documentos visuales) y las procesa con un codificador visual (encoder) que produce representaciones compactas, junto con un decodificador de documentos que genera texto (OCR) a partir de esas representaciones. El modelo se entrena de forma autorregresiva sobre documentos renderizados de 2048 bases, utilizando el genoma humano HG38 como dataset de preentrenamiento. El checkpoint liberado corresponde al paso 190.000, lo que indica un entrenamiento prolongado sobre el genoma completo.

El diseño permite dos modos de uso: extracción de características visuales (sin ejecutar el decodificador de lenguaje) y generación de texto condicionada por prompts (por ejemplo, OCR completo o parcial). El modelo soporta entrada multi-página, procesando páginas en orden de lectura. No se han publicado detalles sobre la arquitectura interna del codificador (número de capas, tipo de atención, etc.) en la información disponible, aunque el uso de `AutoModelForCausalLM` sugiere una base transformer con cabezal de lenguaje.

## Capacidades

- Extracción de características visuales de ADN: genera embeddings compactos de documentos renderizados mediante pooling (media) sobre las representaciones del codificador.
- Generación de texto OCR: decodifica documentos visuales en texto, con soporte de prompts como "t1_full_ocr" (OCR completo) o variantes de longitud corta.
- Razonamiento regional: al operar sobre diseños visuales estructurados, el modelo puede capturar relaciones espaciales entre regiones genómicas, algo que los modelos de secuencia pura no logran.
- Transferencia entre especies: el preentrenamiento en HG38 se transfiere eficazmente a otras especies (arroz), superando a los baselines de secuencia preentrenados en el mismo genoma.
- Entrada multi-página: acepta listas de imágenes de páginas en orden de lectura para documentos largos.
- Integración con HuggingFace Transformers: compatible con `AutoModelForCausalLM` y `AutoTokenizer` mediante `trust_remote_code=True`.

## Casos de uso

- Anotación de variantes genómicas: el modelo puede procesar documentos renderizados de regiones genómicas y generar anotaciones textuales de variantes, facilitando la interpretación de datos de secuenciación.
- Comparación de genomas entre especies: gracias a su capacidad de transferencia, permite analizar similitudes estructurales entre genomas de distintas especies sin necesidad de reentrenar desde cero.
- Búsqueda de regiones reguladoras: al capturar relaciones espaciales en el diseño visual, puede identificar patrones de regulación génica que los modelos de secuencia pasan por alto.
- Generación de resúmenes de regiones genómicas: el decodificador de documentos puede producir descripciones textuales de una región de ADN, útil para pipelines de anotación automática.
- Preprocesamiento de datos genómicos para otros modelos: las características extraídas pueden servir como entrada para clasificadores o modelos downstream en tareas como predicción de expresión génica.
- Educación e investigación: permite explorar visualmente el genoma humano y estudiar cómo las representaciones visuales afectan al aprendizaje de modelos, como caso de estudio en bioinformática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no está orientado a tareas de lenguaje general. El paper asociado (arXiv 2602.02014) reporta un hallazgo clave: el OpticalDNA preentrenado en HG38 se transfiere a arroz significativamente mejor que los baselines de secuencia preentrenados en HG38, y casi iguala al OpticalDNA preentrenado directamente en arroz. Esto sugiere que la representación visual aprendida es transferible entre especies, pero no se proporcionan métricas numéricas concretas en los materiales accesibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 3,34B parámetros en precisión FP16, se estima un consumo de ~7 GB de VRAM para inferencia en lote pequeño, y ~14 GB en FP32. Con cuantización a 8 bits podría reducirse a ~4 GB, pero no hay datos oficiales.
- GPU recomendadas: no disponible. Dado el tamaño, una GPU con 16 GB de VRAM (RTX 4080/4090, A10G) sería suficiente para inferencia básica; para entrenamiento o fine-tuning se requerirían GPUs de mayor capacidad (A100, H100).
- Compatibilidad con consumer GPU: probablemente sí, con cuantización o usando extracción de características sin decodificador, que es más ligera.
- Opciones de despliegue: al ser un modelo de HuggingFace Transformers, puede ejecutarse con vLLM, TGI o directamente con el pipeline de transformers. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de genómica basados en visión. Los modelos de secuencia como DNABERT o Nucleotide Transformer operan sobre texto de nucleótidos, no sobre representaciones visuales, por lo que la comparación no es directa. El paper de OpticalDNA menciona que supera a los baselines de secuencia en transferencia entre especies, pero no se proporcionan cifras concretas en los materiales accesibles. Se recomienda consultar el paper para una comparativa detallada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso clínico ni diagnóstico; los resultados deben interpretarse con cautela.
- Sesgos de datos: preentrenado únicamente sobre el genoma humano HG38, lo que puede limitar su aplicabilidad a otras especies o poblaciones sin fine-tuning.
- Riesgo de alucinación en el decodificador: al ser un modelo generativo, puede producir texto plausible pero incorrecto en tareas de OCR o anotación.
- Dependencia de la renderización: la calidad de las imágenes de entrada afecta directamente al rendimiento; requiere un pipeline de renderizado consistente.
- Sin soporte de tool calling ni agentes: el modelo está especializado en genómica y no ofrece capacidades de razonamiento general.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de exactitud biológica.
- Fecha de creación futura (2026): el modelo y su documentación pueden contener información que aún no ha sido ampliamente revisada por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/hxxiang/opticaldna-hg38-2048
- GitHub: https://github.com/HongxinXiang/OpticalDNA
- Paper (arXiv): https://arxiv.org/abs/2602.02014
- Página del proyecto: https://hongxinxiang.github.io/projects/OpticalDNA/
- Poster (PDF): https://hongxinxiang.github.io/projects/OpticalDNA/static/poster/poster.pdf
