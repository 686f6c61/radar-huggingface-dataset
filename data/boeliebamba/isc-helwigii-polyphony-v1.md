# boeliebamba/isc-helwigii-polyphony-v1

## Resumen

I.S.C. Helwigii Polyphony Disambiguation v1 es un modelo de clasificacion de texto desarrollado por Mink Helwig (usuario `boeliebamba`) para la desambiguacion contextual de signos cuneiformes polifonicos en sumerio y acadio. El problema que aborda es central en asiriologia digital: un mismo signo cuneiforme puede tener multiples lecturas foneticas o logograficas segun el contexto, y los sistemas de transliteracion automatica necesitan predecir la lectura correcta para cada aparicion.

El modelo se basa en la arquitectura `bert-base-multilingual-cased`, con 178 millones de parametros, y anade una cabeza de clasificacion multiclase sobre la representacion `[CLS]`. La entrada consiste en una ventana de contexto de dos signos precedentes y dos posteriores al signo objetivo, separados por un token `[SEP]`. Esta version es la primera publicacion del modelo, entrenada sobre el corpus I.S.C. Helwigii, que integra datos de CDLI, ETCSL, ORACC, DCCLT, BDTNS, MIDDLE, RIAO y fragmentos de usuarios, con 73.107 muestras de entrenamiento.

La relevancia actual radica en la escasez de herramientas de procesamiento de lenguaje natural para lenguas de baja densidad como el sumerio y el acadio. Este modelo ofrece una solucion especifica para una tarea concreta de la filologia cuneiforme, con un rendimiento reportado de exactitud perfecta en validacion (1.0) y un F1 macro de 0.95. Su licencia CC-BY-4.0 permite su uso en proyectos de investigacion y educativos, siempre que se atribuya la fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base-multilingual-cased con cabeza de clasificacion multiclase |
| Parametros totales | 178 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | ±2 signos (ventana de 5 signos en total) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Sumerio, acadio (transliteracion ATF) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (transformers, safetensors probablemente) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-multilingual-cased`, un transformer preentrenado en 104 idiomas, y le anade una capa de clasificacion sobre el token `[CLS]`. La entrada se construye concatenando el contexto de signos previos y posteriores al signo objetivo, separados por `[SEP]`. El clasificador predice la lectura correcta entre las posibles lecturas del signo (valores sumerios, acadios y logograficos). No se menciona en la model card ningun uso de tecnicas como RLHF, DPO o decodificacion especulativa; es un ajuste fino clasico sobre la base preentrenada.

El entrenamiento se realizo sobre el corpus I.S.C. Helwigii, con 73.107 muestras de entrenamiento, 9.042 de validacion y 9.380 de prueba, en una division estratificada por signo (80/10/10). Los datos provienen de tablillas de museos de diversos periodos (Babilonio Antiguo, Neo-Asirio, Ur III, Dinastico Antiguo, etc.). El proceso utilizo 3 epocas, batch de 16 y una tasa de aprendizaje de 3e-5, alcanzando una perdida de entrenamiento de 0.0034 y de validacion de 0.0007.

## Capacidades

- Desambiguacion contextual de signos cuneiformes polidos: dado un signo y su contexto de ±2 signos, predice la lectura mas probable entre los valores sumerios, acadios o logograficos.
- Soporte de transliteracion ATF (ASCII transliteration format), el estandar en asiriologia.
- Procesamiento de corpus multilingue (sumerio y acadio) con datos de multiples fuentes arqueologicas.
- Clasificacion de texto puro, sin capacidades de generacion de texto, tool calling, agentes, vision o audio.
- Adecuado para integracion en pipelines de digital humanities mediante la libreria `transformers` de Hugging Face.

## Casos de uso

- Asistencia en transliteracion de tablillas cuneiformes: investigadores pueden alimentar el modelo con signos transliterados y obtener lecturas probables para acelerar la edicion de textos, reduciendo el trabajo manual de cotejo.
- Educacion en lenguas cuneiformes: aplicaciones de aprendizaje que muestren la lectura correcta de signos en contextos de ejercicios, ayudando a estudiantes de sumerio y acadio a comprender la polifonia.
- Digitalizacion de corpus arqueologicos: integracion en herramientas de OCR especializadas para convertir imagenes de tablillas en texto transliterado, donde el modelo resuelve la ambiguedad de los signos extraidos.
- Validacion de ediciones criticas: los investigadores pueden comparar las predicciones del modelo con las lecturas propuestas en publicaciones academicas para detectar posibles errores.
- Analisis linguistico de frecuencias de lecturas: uso del modelo para estudiar distribucion de valores polifonicos en diferentes periodos o generos textuales, mediante la clasificacion automatica de grandes corpus.
- Enriquecimiento de bases de datos epigraficas: actualizacion automatica de catalogos como CDLI o ORACC con lecturas desambiguadas de nuevos fragmentos, reduciendo el tiempo de procesamiento humano.

## Benchmarks y rendimiento

Se han publicado resultados de validacion en la model card, reportados por el autor sin verificacion externa:

| Metrica | Valor |
|---|---|
| Exactitud en validacion | 1.0000 |
| F1 macro en validacion | 0.9500 |
| Perdida de entrenamiento | 0.0034 |
| Perdida de validacion | 0.0007 |

No se han publicado resultados de evaluacion en conjuntos de test estandarizados como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de desambiguacion cuneiforme. Los valores reportados se refieren exclusivamente a la validacion del corpus I.S.C. Helwigii y deben interpretarse con cautela por la posibilidad de sobreajuste a la distribucion de datos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base BERT tiene 178 millones de parametros, lo que ocupa aproximadamente 700 MB en precision FP32. Con un batch de 1 y una secuencia de 128 tokens, la inferencia puede realizarse con unos 2-3 GB de VRAM, por lo que cabe en cualquier GPU consumer con 4 GB o mas.
- GPUs recomendadas: para uso academico o de investigacion, una NVIDIA RTX 3060 (12 GB) o superior es suficiente. En entornos de servidor, una A10G o T4 puede servir para multiples inferencias en paralelo.
- Despliegue: se puede ejecutar con la libreria `transformers` de HuggingFace en Python, y tambien exportar a ONNX o TorchScript para inferencia optimizada en CPU. No se menciona compatibilidad con vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. Dado el tamano del modelo, se espera una latencia de decenas de milisegundos por ejemplo en GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se ha encontrado en la informacion proporcionada la existencia de otros modelos publicados especificamente para la desambiguacion de signos cuneiformes con arquitectura transformer. Los sistemas tradicionales de transliteracion cuneiforme suelen basarse en reglas heuristicas o en motores de desambiguacion bayesiana (como el propio motor de la plataforma I.S.C. Helwigii, que usa 249 signos con Dirichlet priors). Por tanto, no se puede establecer una comparativa directa con alternativas equivalentes en terminos de rendimiento o arquitectura.

## Limitaciones y advertencias

- El modelo ha sido entrenado exclusivamente con tablillas de museo, por lo que puede no generalizar correctamente a contextos arqueologicos de otras procedencias o periodos no representados en el corpus.
- La ventana de contexto se limita a ±2 signos, lo que puede ser insuficiente para resolver ambiguedades que dependan de un contexto sintactico o discursivo mas amplio.
- Los idiomas sumerio y acadio son de baja densidad de recursos, y la cantidad de datos de entrenamiento es limitada, lo que puede provocar sesgos hacia las fuentes mas representadas (CDLI, ETCSL, etc.).
- El modelo requiere entrada en formato ATF, y no acepta directamente imagenes de tablillas ni otros formatos de transliteracion.
- La exactitud de validacion del 1.0 es sospechosamente alta, lo que sugiere un posible sobreajuste a la distribucion de los datos de validacion; se recomienda evaluar en conjuntos externos antes de uso en produccion.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion adecuada y no impone restricciones de copyleft. Se debe respetar la procedencia de los datos culturales y las practicas de las comunidades de investigacion.
- No se ha documentado el proceso de cuantizacion ni el soporte para FP16, por lo que en despliegues con limitacion de memoria puede ser necesario aplicar tecnicas de reduccion de precision no validadas.

## Enlaces

- HuggingFace: https://huggingface.co/boeliebamba/isc-helwigii-polyphony-v1
- Repositorio de la plataforma I.S.C. Helwigii: https://github.com/SignumCore/isc-helwigii
- Perfil del autor en HuggingFace: https://huggingface.co/boeliebamba/models
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
