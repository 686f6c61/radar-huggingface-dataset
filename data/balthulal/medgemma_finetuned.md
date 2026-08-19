# Balthulal/MedGemma_FineTuned

## Resumen

MedGemma_FineTuned es un modelo derivado de google/medgemma-4b-it, la variante multimodal de 4 mil millones de parámetros de la familia MedGemma de Google, desarrollada sobre la arquitectura Gemma 3. Este fine-tuning, publicado por el autor Balthulal, está orientado a tareas de comprensión de imágenes médicas, probablemente en el dominio de la histopatología o radiología, aunque la model card no especifica la tarea concreta de entrenamiento. El pipeline declarado es image-to-image, lo que sugiere una adaptación hacia generación o transformación de imágenes médicas, una capacidad inusual para la base Gemma.

El modelo conserva la licencia Apache-2.0 y está disponible en formatos safetensors y GGUF, lo que facilita su despliegue tanto en entornos de investigación como en producción con diferentes niveles de cuantización. Con 4.300 millones de parámetros, se sitúa en un rango que permite su ejecución en GPUs de consumo con las técnicas de cuantización adecuadas. Su relevancia radica en que democratiza el acceso a modelos médicos de última generación, permitiendo a desarrolladores e investigadores adaptar y desplegar soluciones de IA en el sector sanitario sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 multimodal con codificador de imagen SigLIP (preentrenado en imagenes medicas) |
| Parametros totales | 4.300.079.472 (~4,3 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 3 soporta hasta 128K, pero no se especifica para este fine-tuning) |
| Tipos de cuantizacion | safetensors (FP16/BF16 probablemente) y GGUF (cuantizaciones 4-bit, 8-bit, etc. segun archivos) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base, MedGemma-4B-IT, es una variante de Gemma 3 de Google que combina un decoder transformer con un codificador de imagenes SigLIP especificamente preentrenado en un amplio conjunto de datos medicos (radiografias, histopatologia, tomografias, etc.). Esta arquitectura permite procesar entradas multimodales (texto e imagen) y generar respuestas en lenguaje natural o realizar tareas de vision por computador. El fine-tuning realizado por Balthulal no documenta el dataset utilizado ni el metodo de entrenamiento (si se empleo LoRA, QLoRA o full fine-tuning). Dado el tamano del repositorio (23,9 GB) y el numero de parametros, es plausible que se haya usado una tecnica de adaptacion de bajo rango, como LoRA, habitual en estos casos para reducir costes computacionales. Tampoco se especifica si se aplicaron fases de RLHF o DPO; la model card no contiene esa informacion.

## Capacidades

- Comprension de imagenes medicas: al heredar el codificador SigLIP del modelo base, puede analizar radiografias, tomografias, resonancias y laminas de histopatologia.
- Generacion de texto medico: capaz de producir descripciones, diagnosticos preliminares o resumenes clinicos a partir de imagenes.
- Interaccion conversacional: soporta dialogos multi-turno en ingles, util para asistentes clinicos.
- Fine-tuning especifico: al ser una adaptacion, puede estar especializado en una tarea concreta (clasificacion de tejidos, deteccion de anomalias, etc.), aunque no se detalla cual.
- Formato GGUF: compatible con herramientas como llama.cpp y Ollama, permitiendo inferencia en CPU y GPU de bajos recursos.
- Pipeline image-to-image: segun la etiqueta, el modelo puede realizar transformaciones de imagen a imagen (por ejemplo, segmentacion o mejora de calidad), aunque no hay ejemplos publicados.

## Casos de uso

- Asistencia al diagnostico radiologico: un hospital puede desplegar el modelo para analizar radiografias de torax y generar informes preliminares que ayuden al radiologo a priorizar casos urgentes. Su tamano moderado permite ejecutarlo en estaciones de trabajo con GPUs como RTX 4090.
- Analisis de histopatologia digital: en investigacion oncologica, el modelo puede clasificar laminas de tejido en categorias (benigno, maligno, subtipo) a partir de imagenes de alta resolucion, reduciendo el tiempo de revision manual.
- Educacion medica: estudiantes de medicina pueden interactuar con el modelo para practicar la interpretacion de imagenes medicas y recibir explicaciones detalladas en ingles.
- Telemedicina en entornos con recursos limitados: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en servidores CPU o en la nube con costes reducidos, facilitando consultas remotas en zonas sin especialistas.
- Investigacion en generacion de imagenes medicas: dado el pipeline image-to-image, podria emplearse para sintetizar imagenes medicas sinteticas (por ejemplo, para aumentar datasets de entrenamiento), aunque esta capacidad no esta confirmada.
- Integracion en pipelines de IA clinica: al ser compatible con endpoints (endpoints_compatible) y con licencia Apache-2.0, puede integrarse en sistemas de soporte a la decision clinica mediante APIs REST, sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre metricas como MMLU, MedQA, o evaluaciones especificas de imagenes medicas para este fine-tuning concreto. El modelo base MedGemma-4B-IT reporta mejoras sobre Gemma 3 en tareas medicas, pero no se pueden atribuir esos resultados a esta adaptacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 4 bits (GGUF Q4_K_M), aproximadamente 2,5-3 GB de VRAM; con precision FP16, unos 8,6 GB. Para el pipeline image-to-image, la demanda puede ser mayor.
- GPUs recomendadas: para FP16, una NVIDIA RTX 3090 o RTX 4090 (24 GB) es suficiente; para cuantizacion 4-bit, una RTX 3060 (12 GB) o incluso una GPU integrada con suficiente RAM compartida puede funcionar.
- Compatibilidad con consumer GPU: si, gracias a las cuantizaciones GGUF y al tamano de 4B, es viable en GPUs de gama media y alta.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (para safetensors), Hugging Face TGI, y servidores de inferencia personalizados con Transformers.
- Latencia y throughput: no se dispone de mediciones publicadas. Como referencia, un modelo de 4B en una RTX 4090 con cuantizacion 4-bit puede generar alrededor de 50-80 tokens por segundo, pero esto depende de la implementacion y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Uso medico |
|---|---|---|---|---|---|
| Balthulal/MedGemma_FineTuned | 4,3 B | no disponible | Texto + imagen (image-to-image) | Apache-2.0 | Especializado (tarea no especificada) |
| google/medgemma-4b-it (base) | 4,3 B | 128K (en Gemma 3) | Texto + imagen | Apache-2.0 | Comprension medica general |
| LLaVA-Med (ejemplo de modelo medico multimodal) | 7B/13B | 4K | Texto + imagen | MIT | Comprension medica general |

La comparativa se limita a modelos conocidos, pero no hay datos de rendimiento del fine-tuning frente a estos. El modelo base MedGemma-4B-IT ofrece una ventana de contexto mayor y una cobertura multimodal mas amplia, mientras que este fine-tuning podria estar optimizado para una tarea concreta, aunque no se detalla.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning sobre datos medicos, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, como infrarrepresentacion de ciertos grupos poblacionales o patologias.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en contextos clinicos donde un error puede tener consecuencias graves. No debe usarse como unico criterio diagnostico.
- Limitaciones de idioma: la model card indica solo ingles; no se garantiza un rendimiento adecuado en otros idiomas, lo que limita su uso en entornos hispanohablantes sin adaptacion adicional.
- Falta de documentacion: la model card no especifica la tarea de fine-tuning, el dataset utilizado ni las metricas de evaluacion. Esto dificulta la reproducibilidad y la confianza en su comportamiento.
- Pipeline image-to-image: la etiqueta sugiere que el modelo puede generar o transformar imagenes, pero no hay ejemplos ni descripcion tecnica de como se implementa esta capacidad, lo que podria indicar una configuracion experimental.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero es responsabilidad del usuario verificar que el modelo no infrinja normativas sanitarias locales (por ejemplo, la FDA en EE. UU. o la MDR en la UE) antes de desplegarlo en entornos clinicos reales.

## Enlaces

- HuggingFace: https://huggingface.co/Balthulal/MedGemma_FineTuned
- Documentacion oficial de MedGemma (Google Developers): https://developers.google.com/health-ai-developer-foundations/medgemma
- Pagina de MedGemma en Google DeepMind: https://deepmind.google/models/gemma/medgemma/
- Repositorio oficial de Google Health: https://github.com/google-health/medgemma
- Notebook de fine-tuning con Hugging Face: https://colab.research.google.com/github/google-health/medgemma/blob/main/notebooks/fine_tune_with_hugging_face.ipynb
- Repositorio de fine-tuning de terceros (referencia): https://github.com/raktim-mondol/medgemma_fine_tuning
