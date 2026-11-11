# Jongwondd/Llama-3.1-8B-Instruct-SFT-2ep-b88443ab

## Resumen

El modelo `Jongwondd/Llama-3.1-8B-Instruct-SFT-2ep-b88443ab` es un adaptador LoRA de tipo PEFT derivado de `meta-llama/Llama-3.1-8B-Instruct`, publicado por el usuario Jongwondd. No es un modelo independiente ni un export fusionado, sino un checkpoint final de un entrenamiento de ajuste supervisado (SFT) orientado a la negación, completado tras dos épocas sobre un conjunto de datos derivado de PopQA. El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no los pesos del modelo base ni el tokenizador.

El modelo hereda la arquitectura y el tamaño del Llama 3.1 8B Instruct original: un transformer decoder-only denso de 8.030 millones de parámetros con una ventana de contexto de 128.000 tokens. La contribución del adaptador es un ajuste fino con rango LoRA 16 y alpha 32, entrenado sobre 14.951 pares correspondientes a 4.534 casos, con 29.902 ejemplos vistos y 1.889 pasos de optimizador. Su relevancia es estrictamente investigadora: se publica como material reproducible para estudiar el comportamiento del modelo en tareas de negación, no como un modelo listo para producción.

La ficha debe interpretarse con cautela: el autor no incluye resultados de evaluación, no reclama paridad de inferencia con el Hub público y advierte que las puntuaciones proxy basadas en reglas no equivalen a precisión de un juez semántico. Cualquier uso en producción requiere validación independiente y la aceptación de la licencia Llama 3.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), adaptador LoRA sobre el modelo base |
| Parametros totales | 8.030 millones (modelo base); el adaptador LoRA no declara recuento propio |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se publica en safetensors y requiere el base en bfloat16 para la carga de referencia |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Llama 3.1 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, no fusionado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct` en la revisión `0e9e39f249a16976918f6564b8830bc894c89659`. El método es SFT con inicialización desde el base sin modificar, rango LoRA 16, alpha 32 y dropout 0. El entrenamiento se realizó sobre la población de entrenamiento de PopQA: 14.951 pares distribuidos en 4.534 casos, con dos épocas completadas, 29.902 ejemplos vistos y 1.889 pasos de optimizador. El SHA-256 original del adaptador es `b88443ab78b8018f212731ac609395c4506f762ea61d83ae5512fcae0fd051e5`, que da nombre al repositorio.

La publicación no modifica los bytes de los pesos: solo se hace portable el localizador del modelo base y la revisión en la configuración PEFT preparada, y los hashes de configuración original y publicada quedan registrados en `training_provenance.json`. Ese mismo fichero contiene el objetivo específico del método, los ajustes de entrenamiento retenidos, el hash del resumen de fuentes y el hash de los datos de entrenamiento. El autor indica explícitamente que las líneas base SFT/UL/DPO son ejecuciones distintas y no checkpoints ALiT, y que las pérdidas de entrenamiento no son puntuaciones de evaluación.

## Capacidades

- Generación de texto en inglés heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones, con el ajuste adicional orientado a negación.
- Capacidad de seguir instrucciones conversacionales multi-turno gracias a la plantilla de chat del modelo base.
- Soporte de tool calling y function calling heredado del base (no validado específicamente en este adaptador).
- Capacidades multilingües del base potencialmente presentes, aunque la model card solo declara inglés.
- No incluye capacidades de visión: el adaptador se aplica a un modelo de texto.
- No se declaran modos especiales (thinking, audio) ni mejoras específicas más allá del ajuste en negación.

## Casos de uso

- Investigación sobre negación en modelos de lenguaje: el adaptador permite reproducir y analizar el efecto del SFT sobre la población PopQA, comparando con las líneas base SFT/UL/DPO del mismo autor.
- Reproducibilidad de experimentos: sirve como checkpoint final documentado (hashes de datos, fuentes y configuración) para replicar el pipeline de entrenamiento en entornos de investigación.
- Estudio de adaptadores LoRA: al ser un adaptador PEFT no fusionado, facilita el análisis de actualizaciones de bajo rango y su portabilidad entre revisiones del modelo base.
- Evaluación de mecanismos internos: el autor separa los experimentos mecanicistas de la publicación del modelo, por lo que el adaptador puede emplearse como sustrato en estudios de interpretabilidad.
- Pruebas de robustez ante negación: útil para construir conjuntos de evaluación que midan si el modelo maneja correctamente afirmaciones negadas frente a afirmativas.
- Docencia y formación: ejemplo práctico de carga con `PeftModel.from_pretrained`, gestión de revisiones del base y registro de procedencia en `training_provenance.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que esta subida no añade resultados de evaluación, que no reclama reproducir todas las cifras del manuscrito y que las divisiones de evaluación observadas previamente son datos de desarrollo, no datos de test independientes.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB, pero la inferencia requiere cargar el modelo base Llama 3.1 8B en bfloat16, lo que supone aproximadamente 16 GB de VRAM solo para los pesos.
- GPU recomendadas para el base en bfloat16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) con margen ajustado para contexto corto.
- En GPUs de consumo: cabe en RTX 4090 (24 GB) con bfloat16 y contexto moderado; en tarjetas de 16 GB requeriría cuantización del base, no documentada para este adaptador.
- Opciones de despliegue: la carga de referencia usa Transformers y PEFT; vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador y requerirían fusionar los pesos previamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jongwondd/Llama-3.1-8B-Instruct-SFT-2ep-b88443ab | 8.030 M (base) | 128.000 | Adaptador LoRA SFT | Llama 3.1 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 | Modelo completo instruct | Llama 3.1 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct | 7.240 M | 32.000 | Modelo completo instruct | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7.620 M | 131.072 | Modelo completo instruct | Apache 2.0 | Hugging Face |

La comparación con Mistral y Qwen se ofrece como referencia de categoría (modelos instruct de ~7-8B); no se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `meta-llama/Llama-3.1-8B-Instruct` y su tokenizador, que no se incluyen en el repositorio.
- Sin resultados de evaluación publicados: no hay evidencia de mejora medible frente al base en ninguna tarea.
- Las divisiones de evaluación previamente observadas son datos de desarrollo, no test independientes; el riesgo de sobreajuste a PopQA es real.
- El autor advierte que las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas; es un checkpoint de investigación, no un modelo validado para seguridad.
- La licencia Llama 3.1 impone restricciones de uso; deben revisarse `LICENSE`, `NOTICE` y `USE_POLICY.md` antes de cualquier uso comercial.
- No se reclama paridad de descarga e inferencia con el Hub público; solo se verificó localmente el parseo de la configuración del adaptador.
- Idioma declarado únicamente inglés; el comportamiento multilingüe del base no está validado en este adaptador.
- No hay afiliación ni respaldo del proveedor del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Jongwondd/Llama-3.1-8B-Instruct-SFT-2ep-b88443ab
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Revisión del base: `0e9e39f249a16976918f6564b8830bc894c89659`
- Fichero de procedencia: `training_provenance.json` (incluido en el repositorio)
- Repositorio de PEFT: https://github.com/huggingface/peft
- Documentación de Transformers: https://huggingface.co/docs/transformers
