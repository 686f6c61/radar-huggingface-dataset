# Johneeee/Qwen3.8-27B-TWIN-TURBO-f-c-f-709-l-unc-oQ4e-aura-last4-fp16-text

## Resumen

Johneeee/Qwen3.8-27B-TWIN-TURBO-f-c-f-709-l-unc-oQ4e-aura-last4-fp16-text es un checkpoint cuantizado publicado por el usuario Johneeee en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión a 4 bits de un modelo base etiquetado como `qwen3_5`, con 26.895.998.464 parámetros (~26,9 B) y un repositorio de 19,3 GB. El resultado se distribuye en formato MLX safetensors, es decir, pensado para ejecutarse en Apple Silicon mediante la librería MLX.

El problema que aborda es el habitual en la inferencia local: reducir la huella de memoria de un modelo de casi 27.000 millones de parámetros para que quepa en la memoria unificada de un Mac. La cuantización se ha realizado con oQ (oMLX v0.7.0.dev4) en modo de precisión mixta, con 4 bits y group size 64. El nombre del repositorio sugiere además que las últimas capas podrían mantenerse en fp16, aunque no hay documentación que lo confirme.

La relevancia práctica es limitada por el momento: el modelo acumula 0 descargas y 0 likes, no declara licencia, no documenta idiomas ni contexto, y la model card se limita a los parámetros de cuantización. Debe considerarse un artefacto experimental de la comunidad, no un modelo validado para producción. Cualquier evaluación de sus capacidades depende hoy del modelo base subyacente, que el autor no identifica con una referencia verificable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` apunta a la familia Qwen3.5; el repositorio no publica config.json ni detalles arquitectónicos) |
| Parametros totales | 26.895.998.464 (~26,9 B, dato real de los safetensors) |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precisión mixta (oQ / oMLX v0.7.0.dev4); posible mezcla con fp16 en las últimas capas según el nombre del repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (`library_name: mlx`) |
| Autor | Johneeee |
| Tamano del repositorio | 19,3 GB |
| Fecha de creacion | 2026-10-02 (según metadatos de HuggingFace) |
| Ultima actualizacion | 2026-10-02 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No hay información pública sobre arquitectura interna, composición del dataset ni proceso de entrenamiento. El repositorio es un derivado de cuantización, no un modelo entrenado, por lo que no cabe hablar de tokens de entrenamiento, RLHF, DPO ni innovaciones de preentrenamiento propias. El único dato técnico documentado es el pipeline de cuantización: oQ, la herramienta de cuantización de precisión mixta incluida en oMLX v0.7.0.dev4, aplicada a 4 bits con group size 64 y empaquetado en safetensors de MLX.

El nombre del repositorio contiene indicios no documentados: `TWIN-TURBO`, `f-c-f-709-l-unc`, `aura` y `last4-fp16`. El sufijo `last4-fp16` sugiere que las últimas cuatro capas se conservan en fp16, una práctica habitual para preservar la calidad de la capa de salida en cuantizaciones agresivas. Esta hipótesis es coherente con el tamaño del repositorio: 26,9 B a 4 bits puros ocuparían aproximadamente 13,4 GB, mientras que el repo declara 19,3 GB, un exceso atribuible tanto a capas en mayor precisión como a metadatos y tensores no cuantizados. Sin `config.json`, `quantization_config` detallado ni notas del autor, ninguna de estas lecturas puede confirmarse.

## Capacidades

- Generación de texto: es la única capacidad implícita en el nombre del repositorio (sufijo `text`) y en el formato de pesos. No hay evaluación publicada que la demuestre.
- Razonamiento, matemáticas y código: no disponible. Dependerían del modelo base `qwen3_5`, cuya identidad exacta no se especifica.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible. El sufijo `text` sugiere que se ha descartado cualquier torre multimodal, si el base la tuviera.
- Ejecución en Apple Silicon: capacidad confirmada por el formato MLX safetensors y la etiqueta `mlx`.
- Inferencia cuantizada a 4 bits: capacidad confirmada, con group size 64 y precisión mixta gestionada por oQ.

## Casos de uso

- Asistente de escritorio privado en macOS: al ejecutarse con MLX sobre memoria unificada, ninguna consulta sale del equipo. Es adecuado para flujos donde la confidencialidad impide usar APIs en la nube, siempre que se acepte la ausencia de garantías de calidad.
- Procesamiento de documentos confidenciales (legal, sanitario, financiero): un modelo de ~27 B a 4 bits ocupa del orden de 14-19 GB, lo que permite mantener todo el pipeline en local en un Mac con memoria suficiente y evitar transferencias de datos sensibles.
- Prototipado y evaluación de cuantizaciones: sirve como punto de comparación directo frente al modelo base en fp16 o frente a otras recetas de cuantización, para medir la degradación introducida por 4 bits y group size 64.
- Servidor de inferencia local en equipos pequeños: MLX expone un servidor compatible con la API de OpenAI, lo que permite desplegar el modelo como endpoint interno en una oficina con hardware Apple Silicon.
- Generación y revisión de código en local: sería un caso de uso natural si el modelo base conserva las capacidades de código de la familia Qwen, pero no hay ninguna evaluación publicada que lo respalde.
- Base para ajuste fino con LoRA o QLoRA: el formato MLX y el tamaño contenido facilitan el fine-tuning en un solo equipo Apple Silicon, aunque el repositorio no documenta ni el tokenizador ni el chat template.
- Investigación sobre precisión mixta: el patrón de cuantización (4 bits con posible `last4-fp16`) es un caso de estudio útil para analizar cómo la precisión de las capas finales afecta a la perplejidad y a la coherencia de las respuestas largas.
- Conversión a otros runtimes: puede emplearse como origen para generar versiones GGUF y ejecutarlas en llama.cpp u Ollama, ampliando su alcance fuera del ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, ni del modelo cuantizado ni del modelo base al que hace referencia. Tampoco se documentan métricas de perplejidad, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los 26,9 B a 4 bits puros requieren unos 13,4 GB de pesos; el repositorio ocupa 19,3 GB, por lo que conviene reservar entre 16 y 20 GB de memoria para pesos y overhead de runtime.
- Memoria unificada recomendada: 32 GB o más en Apple Silicon para trabajar con comodidad; 24 GB es el mínimo ajustado, y 16 GB es probablemente insuficiente una vez añadido el contexto y la caché KV.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (familias M1, M2, M3 y M4, con ventaja clara en las variantes Pro, Max y Ultra por ancho de banda de memoria). No hay soporte nativo de CUDA.
- GPU NVIDIA: para usar A100, H100 o RTX 4090 habría que convertir los pesos a safetensors de HuggingFace o a GGUF, y ejecutar con vLLM, TGI o llama.cpp. La conversión no está documentada por el autor.
- Cabe en GPU de consumo: no en el ecosistema CUDA sin conversión previa; tras convertir a GGUF Q4, un modelo de este tamaño encajaría en tarjetas con 24 GB como la RTX 4090, o en configuraciones de 16 GB con cuantizaciones más agresivas.
- Opciones de despliegue: `mlx-lm` (generación por línea de comandos), el servidor de MLX compatible con la API de OpenAI, y de forma indirecta llama.cpp u Ollama mediante conversión a GGUF.
- Latencia y throughput: no disponible. Dependerán del chip concreto, del ancho de banda de memoria y de la longitud de contexto efectiva, dato este último que tampoco se publica.

## Comparativa con modelos similares

No disponible. No es posible construir una comparativa rigurosa porque el modelo base no se identifica con una referencia verificable (solo el tag genérico `qwen3_5` y el nombre comercial `Qwen3.8-27B`), no se publican benchmarks y no se declara licencia. Cualquier tabla comparativa con otros modelos de ~27 B exigiría confirmar primero qué pesos se cuantizaron, algo que el repositorio no aclara.

A modo de contexto, la categoría natural de comparación serían otras cuantizaciones MLX de 4 bits de modelos de la familia Qwen en el rango de 27 a 32 B, así como las versiones GGUF equivalentes para llama.cpp. No se dispone de datos que permitan contrastar rendimiento, contexto o licencia frente a ellas.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 likes en el momento de redactar esta ficha. No hay evidencia de que el checkpoint cargue correctamente ni de que produzca texto coherente.
- Licencia no declarada: sin licencia explícita, el uso comercial queda en un limbo legal. Además, la licencia final no puede ser más permisiva que la del modelo base, que tampoco se identifica.
- Modelo base no identificado: no se indica la versión exacta de Qwen3.5, ni su revisión, ni si hubo ajuste fino posterior. Esto impide reproducir el resultado y evaluar la procedencia de los pesos.
- Degradación por cuantización: la conversión a 4 bits con group size 64 introduce pérdida de precisión, especialmente en tareas de razonamiento matemático y generación de código. El autor no publica ninguna medición de esa degradación.
- Riesgo de alucinación: inherente a cualquier modelo generativo de esta escala; sin benchmarks ni evaluación humana, no puede acotarse su magnitud.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento ni sobre procesos de alineación, por lo que no pueden caracterizarse los sesgos.
- Contexto e idiomas desconocidos: no se declara ventana de contexto ni cobertura lingüística. Usar el modelo con entradas largas o en idiomas distintos del inglés es una apuesta sin garantías.
- Nombre del repositorio opaco: sufijos como `TWIN-TURBO`, `f-c-f-709-l-unc` o `aura` no están explicados en ninguna parte y dificultan saber qué modificación concreta se aplicó.
- Fecha de creación atípica: los metadatos indican 2026-10-02, posterior a la fecha habitual de consulta, lo que conviene verificar antes de dar por buenos los metadatos.
- Dependencia de MLX: fuera de Apple Silicon el modelo no es directamente utilizable; requiere conversión, con el riesgo de errores que ello implica.
- Falta de documentación operativa: no hay tokenizador documentado, ni chat template, ni instrucciones de prompt, elementos necesarios para un uso consistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-f-c-f-709-l-unc-oQ4e-aura-last4-fp16-text
- Repositorio de la herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron únicamente documentación jurídica del caso «H.F. y otros c. Francia» del Tribunal Europeo de Derechos Humanos, sin relación alguna con el modelo. No se dispone de papers, blogs, repositorios de demo ni páginas de documentación adicionales.
