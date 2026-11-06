# mradermacher/gemma-3-12b-it-vl-Deepseek-v3.1-Heretic-Uncensored-Thinking-GGUF

## Resumen

Esta ficha describe la cuantización GGUF del modelo `gemma-3-12b-it-vl-Deepseek-v3.1-Heretic-Uncensored-Thinking`, un fine-tune publicado por DavidAU y cuantizado por mradermacher. El modelo parte de la arquitectura Gemma 3 de 12B en su variante instructiva con capacidades de visión y lenguaje (VL), sobre la que se ha aplicado un proceso de "abliteration" o "heretic" para eliminar los mecanismos de rechazo y moderación, y un ajuste fino adicional orientado a escritura creativa. La metadata del autor indica que el entrenamiento se apoyó en el dataset `TeichAI/deepseek-v3.2-speciale-1000x` y en técnicas de Unsloth.

El modelo tiene 11.766.034.176 parámetros totales (aproximadamente 11,77B) según los pesos en safetensors, y se distribuye en formato GGUF con múltiples niveles de cuantización que van de Q2_K (4,9 GB) a Q8_0 (12,6 GB), además de un proyector multimodal `mmproj` separado en Q8_0 y f16. Está pensado para ejecución local en transformers y en runtimes compatibles con GGUF como llama.cpp u Ollama, y su licencia declarada es Apache 2.0.

Su relevancia actual radica en dos factores: por un lado, ofrece una ventana de contexto amplia heredada de Gemma 3 y capacidades multimodales en un tamaño que cabe en GPUs de consumo; por otro, el proceso de abliteration y el enfoque en escritura de ficción lo sitúan como una opción para generación creativa sin las restricciones de seguridad del modelo original. Conviene tener presente que es un fine-tune comunitario, sin benchmarks publicados en la información disponible y con riesgos de alucinación y sesgo propios de un modelo ajustado sin evaluación formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 3 12B IT VL), fine-tune con abliteration |
| Parametros totales | 11.766.034.176 (aprox. 11,77B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Gemma 3, valor no confirmado en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal mmproj en Q8_0 y f16; versiones imatrix en repo i1 |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base; bfloat16 en origen |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Gemma 3, en su variante de 12B parámetros con capacidades de visión y lenguaje (VL). El modelo base es `DavidAU/gemma-3-12b-it-vl-Deepseek-v3.1-Heretic-Uncensored-Thinking`, que a su vez deriva de Gemma 3 12B IT y ha sido sometido a un proceso de abliteration (eliminación de direcciones de activación asociadas al rechazo) y a un ajuste fino posterior. La metadata indica el uso de Unsloth para el entrenamiento y del dataset `TeichAI/deepseek-v3.2-speciale-1000x` como material de ajuste, orientado a razonamiento y escritura creativa.

No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO adicionales. La model card etiqueta el modelo como "uncensored", "heretic" y "abliterated", lo que implica que se han eliminado total o parcialmente los mecanismos de rechazo del modelo original; este proceso suele conllevar una degradación de la coherencia en tareas de seguridad y un aumento del riesgo de generar contenido dañino. El proyector multimodal se distribuye por separado (`mmproj-Q8_0` y `mmproj-f16`), lo que permite usar el modelo solo como texto o con capacidades de visión si se carga el proyector.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Escritura creativa y de ficcion: generacion de tramas, subtramas, escenas, continuaciones y relatos en multiples generos (ciencia ficcion, romance, etc.), segun las etiquetas del autor.
- Capacidades multimodales de vision y lenguaje heredadas de Gemma 3 VL, siempre que se cargue el proyector `mmproj` correspondiente.
- Modo "thinking" o razonamiento extendido, segun el nombre del modelo base y la metadata del autor.
- Generacion de codigo y matematicas: capacidad heredada de Gemma 3, no evaluada en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Multilingue: limitado al ingles segun la model card, aunque Gemma 3 base soporta mas idiomas; no confirmado para este fine-tune.

## Casos de uso

- Escritura de ficcion y narrativa: el modelo esta ajustado especificamente para generacion de tramas, subtramas, escenas y continuaciones, por lo que es adecuado para asistir a escritores en la produccion de borradores y variaciones de relatos en multiples generos.
- Generacion de contenido creativo sin restricciones: el proceso de abliteration elimina los rechazos del modelo original, lo que lo hace util para ficcion adulta, terror o temas sensibles que otros modelos rechazarian; requiere revision humana por el riesgo de contenido inapropiado.
- Prototipado local de asistentes conversacionales: con cuantizaciones Q4_K_M (7,4 GB) o Q5_K_M (8,5 GB) cabe en GPUs de consumo, lo que permite desplegar un chatbot local para pruebas de concepto sin depender de APIs.
- Analisis de imagenes con descripcion textual: cargando el proyector `mmproj`, el modelo puede procesar imagenes y generar descripciones o narrativas a partir de ellas, util para herramientas de storyboarding o generacion de descripciones de escenas.
- Generacion de dialogos para videojuegos o guiones: su enfoque en escritura vivida y continuacion de escenas lo hace apropiado para generar arboles de dialogo y guiones en pipelines de desarrollo de narrativa interactiva.
- Experimentacion en investigacion sobre abliteration y seguridad: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo y comparar su calidad frente al Gemma 3 original en tareas controladas.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (4,9 GB) y Q3_K_S (5,6 GB) permiten ejecucion en GPUs con 6-8 GB de VRAM, aunque con perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para Q2_K, 6-7 GB para Q3_K_M, 7-8 GB para Q4_K_M, 8-9 GB para Q5_K_M, 10-11 GB para Q6_K y 13-14 GB para Q8_0; el proyector multimodal anade entre 0,7 y 1,0 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080, RTX 4090 para cuantizaciones altas; A100 o H100 para despliegue en servidor con mayor throughput.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 8-12 GB; Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y runtimes compatibles con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI si se dispone de VRAM suficiente (aprox. 24 GB en bfloat16).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (gemma-3-12b-it-vl-Deepseek-v3.1-Heretic-Uncensored-Thinking GGUF) | 11,77B | No disponible | Apache 2.0 | GGUF | Fine-tune abliterated orientado a ficcion, multimodal con mmproj |
| Gemma 3 12B IT (original de Google) | 12B | No disponible en esta ficha | Gemma Terms of Use | Safetensors, GGUF | Modelo base con mecanismos de seguridad intactos; requiere aceptar los terminos de Google |
| DavidAU/gemma-3-12b-it-vl-Deepseek-v3.1-Heretic-Uncensored-Thinking | 11,77B | No disponible | Apache 2.0 | Safetensors, bfloat16 | Modelo base sin cuantizar del que deriva esta ficha |
| Mistral Nemo 12B Instruct | 12B | 128K (segun documentacion publica de Mistral) | Apache 2.0 | Safetensors, GGUF | Alternativa densa de tamano similar, sin capacidades multimodales nativas |

La comparacion con Gemma 3 original es la mas directa: comparten arquitectura y tamano, pero este fine-tune elimina los rechazos y se orienta a ficcion, con la contrapartida de menor seguridad y ausencia de evaluacion formal. Frente a Mistral Nemo, la diferencia principal es la capacidad multimodal y el enfoque creativo, aunque no hay datos de rendimiento comparables en la informacion disponible.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido violento, sexual, ilegal o danino sin filtros; no es apto para produccion orientada al publico general sin moderacion adicional.
- Riesgo de alucinacion: al ser un fine-tune sin evaluacion publicada, la fidelidad factual no esta verificada y puede degradarse respecto al Gemma 3 original.
- Idiomas: la model card declara solo ingles; el rendimiento en castellano u otros idiomas no esta confirmado y probablemente sea inferior.
- Contexto: no se confirma la longitud de contexto efectiva de este fine-tune; el proceso de abliteration y el ajuste fino pueden alterar el comportamiento en contextos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 3 de Google esta sujeto a los Gemma Terms of Use; conviene verificar la compatibilidad de la cadena de licencias antes de un despliegue comercial.
- Calidad de cuantizaciones bajas: Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que las afirmaciones de capacidad no estan respaldadas por metricas.
- Fecha de creacion futura en la metadata (2026): conviene tratar las fechas del repositorio con cautela y verificar la procedencia del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/gemma-3-12b-it-vl-Deepseek-v3.1-Heretic-Uncensored-Thinking-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/DavidAU/gemma-3-12b-it-vl-Deepseek-v3.1-Heretic-Uncensored-Thinking
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-3-12b-it-vl-Deepseek-v3.1-Heretic-Uncensored-Thinking-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#gemma-3-12b-it-vl-Deepseek-v3.1-Heretic-Uncensored-Thinking-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/TeichAI/deepseek-v3.2-speciale-1000x
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
