# mradermacher/Mythos-WSP-Qwen3.5-0.8B-GGUF

## Resumen

Mythos-WSP-Qwen3.5-0.8B-GGUF es una publicación de cuantizaciones estáticas del modelo base keyvan-ai/Mythos-WSP-Qwen3.5-0.8B, generada por mradermacher, un autor conocido en Hugging Face por producir versiones GGUF de modelos de terceros para su uso con llama.cpp y herramientas compatibles. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización del checkpoint original en formato Hugging Face (convert_type: hf) a formato GGUF.

El modelo base se presenta, por su nombre, como un derivado de la familia Qwen3.5 en su variante de 0,8B de parámetros, aunque la model card no aporta información sobre el proceso de entrenamiento, los datos utilizados ni las capacidades específicas del modelo. El recuento real de parámetros en safetensors es de 100.592.896 (aproximadamente 0,1B), una cifra notablemente inferior a la que sugiere la nomenclatura "0.8B", lo que puede indicar un modelo muy comprimido, un modelo de juguete o una discrepancia entre el nombre y el contenido real.

La relevancia de esta ficha es limitada: se trata de una publicación con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks. Es útil únicamente como artefacto de cuantización para experimentación local con modelos de muy pequeño tamaño, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5 según nomenclatura) |
| Parametros totales | 100.592.896 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el base en formato Hugging Face |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base más allá de su nombre, que sugiere una variante de la familia Qwen3.5. La model card del repositorio de cuantización no incluye detalles sobre el tipo de transformer, el número de capas, la dimensionalidad de los embeddings, el mecanismo de atención ni si emplea técnicas como atención lineal o decodificación especulativa.

Tampoco hay datos sobre el entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras fases de alineamiento. La única información técnica disponible es la relativa al proceso de cuantización: quantize_version 2, output_tensor_quantised 1 y convert_type hf, lo que indica que se partió de pesos en formato Hugging Face y se aplicó una cuantización estática con la herramienta de mradermacher. No se ha publicado información sobre innovaciones técnicas del modelo base.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de la familia Qwen, pero no confirmada por la model card.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación local con llama.cpp: el modelo puede cargarse en llama.cpp u Ollama para probar el pipeline de cuantización de mradermacher en un entorno controlado, dado su reducido tamaño (100M parámetros).
- Pruebas de integración de GGUF en aplicaciones de escritorio: útil para validar la carga de cuantizaciones Q4_K_M o Q8_0 en herramientas como LM Studio, sin expectativas de calidad de salida.
- Evaluación de la herramienta de cuantización: sirve como caso de prueba para comparar la fidelidad de distintas cuantizaciones (Q2_K frente a Q8_0) sobre un mismo checkpoint.
- Docencia y demostraciones de formato GGUF: adecuado para explicar la estructura de un archivo GGUF y las diferencias entre niveles de cuantización en un aula o taller.
- Pruebas de estrés de memoria: al ser un modelo pequeño, permite medir el consumo de VRAM y RAM de distintas cuantizaciones en GPUs de gama baja sin riesgo de agotar recursos.
- Benchmarking de pipelines de inferencia: puede usarse como carga de trabajo sintética para medir latencia y throughput de llama.cpp en hardware modesto, aunque los resultados no serán representativos de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 100M parámetros, las cuantizaciones Q4_K_M ocupan del orden de 60-80 MB y las Q8_0 del orden de 100-120 MB, aunque no se dispone de cifras oficiales del autor.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM libre es suficiente; también puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (RTX 3060, RTX 4060, GTX 1650, etc.) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; no se ha confirmado soporte en vLLM o TGI para este artefacto concreto.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Mythos-WSP-Qwen3.5-0.8B-GGUF | 100.592.896 | no disponible | no disponible | GGUF | Hugging Face |
| Qwen-3.5-0.8B-OCR-GGUF (mradermacher) | no disponible | no disponible | no disponible | GGUF | Hugging Face |
| Modelo base keyvan-ai/Mythos-WSP-Qwen3.5-0.8B | no disponible | no disponible | no disponible | Hugging Face | Hugging Face |

No se dispone de datos de rendimiento, contexto ni licencia de los modelos comparados, por lo que la comparativa se limita a la disponibilidad y el formato.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se ha documentado el proceso de entrenamiento ni la composición de datos.
- Riesgo de alucinación: no evaluado; al no haber benchmarks ni evaluations publicadas, no puede estimarse la fiabilidad de las salidas.
- Limitaciones de contexto o idioma: se desconoce la ventana de contexto y los idiomas soportados; la model card no los declara.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido; se recomienda contactar con el autor del modelo base antes de cualquier uso en producción.
- Caveat para producción: el modelo tiene cero descargas y cero likes, sin validación comunitaria; el recuento de parámetros (100M) no coincide con la nomenclatura "0.8B", lo que sugiere posibles errores en el etiquetado o en el checkpoint.
- El repositorio es una cuantización de terceros, no el modelo original; cualquier problema de calidad debe atribuirse al modelo base keyvan-ai/Mythos-WSP-Qwen3.5-0.8B.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/mradermacher/Mythos-WSP-Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/keyvan-ai/Mythos-WSP-Qwen3.5-0.8B
- Perfil del autor de cuantizaciones: https://huggingface.co/mradermacher
- Repositorio de solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Ejemplo de otra cuantización del mismo autor: https://huggingface.co/mradermacher/Qwen-3.5-0.8B-OCR-GGUF
