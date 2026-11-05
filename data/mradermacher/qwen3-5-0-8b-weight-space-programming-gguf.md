# mradermacher/Qwen3.5-0.8B-weight-space-programming-GGUF

## Resumen

Qwen3.5-0.8B-weight-space-programming es un modelo de lenguaje de aproximadamente 772,8 millones de parametros, derivado del modelo base ovexhugi/Qwen3.5-0.8B-weight-space-programming, que a su vez parte de la familia Qwen3.5 de Alibaba. El autor de esta variante, ovexhugi, lo ha etiquetado con las categorias "ml-intern" y "weight-space-programming", lo que sugiere un ajuste orientado a tareas de programacion en el espacio de pesos (weight-space programming) en lugar de un fine-tuning convencional sobre datos de instrucciones. La version aqui descrita es una cuantizacion estatica en formato GGUF realizada por mradermacher.

El modelo resuelve el problema de ejecutar un LLM conversacional de la familia Qwen3.5 en hardware muy modesto: gracias a sus menos de 800 millones de parametros, las cuantizaciones de 2 a 8 bits ocupan entre 0,5 y 0,9 GB, por lo que cabe en GPUs de consumo, en CPU y en dispositivos con poca memoria. Es relevante ahora porque permite desplegar un modelo de la generacion Qwen3.5 en entornos locales, edge o CI, sin depender de infraestructura cloud.

La ficha se centra en la version GGUF de mradermacher (publicada el 5 de noviembre de 2026), que incluye cuantizaciones K-quant, IQ4_XS, f16 y dos variantes mmproj (Q8_0 y f16) para un componente multimodal. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Por la nomenclatura (Qwen3.5-0.8B) se trata de un transformer decoder-only de la familia Qwen3.5 con 772.845.888 parametros totales, pero no se especifican numero de capas, dimension oculta, atencion (estandar o lineal) ni tipo de normalizacion. Tampoco se documenta la longitud de contexto nativa.

Respecto al entrenamiento, la model card solo aporta las etiquetas "ml-intern" y "weight-space-programming", que apuntan a un ajuste especifico para tareas de programacion mediante manipulacion del espacio de pesos. No se indican numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o destilacion. La cuantizacion de mradermacher es estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no incluye, segun el autor, cuantizaciones ponderadas ni imatrix en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline "conversational" en los tags).
- Programacion y tareas de weight-space programming, segun la denominacion del modelo base.
- Soporte multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica la presencia de un componente de proyeccion para entrada multimodal (vision) en el modelo base.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se documentan capacidades de tool calling, function calling, agentes, modo thinking ni soporte multilingue mas alla del ingles.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con cuantizaciones Q4_K_M de 0,6 GB, el modelo se puede cargar en un portatil con 8 GB de RAM y mantener conversaciones multi-turno sin GPU dedicada.
- Pruebas de integracion en pipelines de CI: al ocupar menos de 1 GB en Q8_0, se puede incluir en contenedores de test para validar respuestas de un LLM Qwen3.5 sin coste de API.
- Experimentacion con weight-space programming: el modelo sirve como banco de pruebas de bajo coste para investigar tecnicas de ajuste en el espacio de pesos antes de escalar a modelos mayores.
- Despliegue en edge y dispositivos embebidos: las cuantizaciones Q2_K y Q3_K_S (0,5 GB) permiten ejecucion en CPU en Raspberry Pi o mini-PC con llama.cpp.
- Evaluacion de componentes multimodales: los ficheros mmproj permiten probar la ruta de vision del modelo base en un entorno GGUF ligero.
- Generacion de codigo asistida en entornos con recursos limitados: adecuado para autocompletado o sugerencias simples en IDE, aunque sin garantias de calidad de un modelo grande.
- Fine-tuning incremental o LoRA sobre el modelo base en una sola GPU de consumo, gracias al reducido numero de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB (Q2_K/Q3_K_S), 0,6 GB (Q4_K_S/Q4_K_M/IQ4_XS), 0,7 GB (Q5/Q6), 0,9 GB (Q8_0) y 1,7 GB (f16), mas el overhead de contexto y del mmproj (0,2-0,3 GB) si se usa vision.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; no requiere A100 ni H100. Funciona en GTX 1050 Ti, RTX 3050, RTX 4060, RTX 4090 y en GPUs integradas con suficiente memoria compartida.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas e incluso en iGPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF; el modelo base puede usarse con transformers y potencialmente con vLLM/TGI si se dispone de los pesos safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera inferencia en tiempo real incluso en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-weight-space-programming (este) | 772,8 M | no disponible | Apache 2.0 | GGUF, safetensors | Variante especializada en weight-space programming, solo ingles |
| Qwen3.5-0.8B (base, si existe publicamente) | ~0,8 B | no disponible | no disponible | no disponible | Modelo original de la familia; esta ficha no dispone de sus datos |
| Modelos de ~1B de otras familias (p. ej. Llama 3.2 1B, Gemma 2 2B) | 1-2 B | 8 K-128 K segun modelo | licencias propias | GGUF, safetensors | Alternativas generalistas; no se dispone de comparacion de rendimiento con este modelo |

No se dispone de datos de benchmarks ni de comparaciones medidas con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara soporte de castellano ni de otros idiomas.
- Con 772,8 M de parametros, la calidad de razonamiento, codigo y matematicas sera inferior a la de modelos de 7B o superiores; no es adecuado para tareas complejas de produccion.
- Riesgo de alucinacion elevado en modelos de este tamano, especialmente en dominios especializados.
- No se documentan sesgos conocidos, pero al no haber informacion sobre el dataset de entrenamiento no se puede evaluar su alineacion ni su comportamiento etico.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento no estan documentados, por lo que conviene verificar la procedencia antes de un despliegue comercial.
- Las cuantizaciones Q2_K y Q3 degradan la calidad; se recomienda Q4_K_M o superior para uso real.
- No hay garantias de soporte de tool calling ni de agentes; no se debe asumir su disponibilidad en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-0.8B-weight-space-programming-GGUF
- Modelo base: https://huggingface.co/ovexhugi/Qwen3.5-0.8B-weight-space-programming
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-0.8B-weight-space-programming-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
