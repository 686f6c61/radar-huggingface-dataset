# bambocher/Qwen3.5-2B-heretic-oQ3.5-mtp

## Resumen

Qwen3.5-2B-heretic-oQ3.5-mtp es una version cuantizada y "decensored" del modelo Qwen3.5-2B de Alibaba Qwen, publicada por el usuario bambocher en Hugging Face. El checkpoint combina tres transformaciones sobre el modelo base: una ablacion de comportamiento realizada con Heretic v2.0.0 (que elimina los rechazos del modelo original), una cuantizacion de precision mixta con oQ de oMLX v0.7.3, y la conservacion intacta de la cabeza de prediccion multi-token (MTP) del modelo original.

El modelo tiene 2.274 millones de parametros totales distribuidos en tres componentes: el modelo de lenguaje (1.882B), un codificador de vision (0.331B) y la cabeza MTP (0.061B). La cuantizacion emplea un esquema de precision mixta que combina bloques de 3, 4, 5, 6 y 8 bits con pesos en BF16, alcanzando un promedio efectivo de 5.850 bits por peso y un tamano de almacenamiento de 1.549 GiB.

La relevancia de esta ficha radica en que documenta un caso de uso muy especifico: adaptar un modelo multimodal pequeno para despliegue en Apple Silicon mediante MLX, eliminando los comportamientos de rechazo y preservando la cabeza MTP para decodificacion especulativa. Es un artefacto orientado a experimentacion local, no a produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), multimodal con vision y cabeza MTP; no se detalla la configuracion interna |
| Parametros totales | 2.274.069.824 (2.274B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 3/4/5/6/8 bits con grupo 64, mas BF16; promedio efectivo 5.850 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer multimodal de la familia Qwen3.5 que incorpora un codificador de vision (0.331B parametros) y una cabeza de prediccion multi-token (MTP, 0.061B parametros). La cabeza MTP se conserva intacta en esta version y permite decodificacion especulativa, es decir, predecir varios tokens por paso para acelerar la generacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO.

Sobre el modelo base se aplico Heretic v2.0.0, una herramienta de ablacion de comportamiento que modifica los pesos en las capas 12 a 23 (start_layer_index 12, end_layer_index 23) con pesos de preservacion de comportamiento bueno de 0.9189, direccionamiento de comportamiento malo de 0.0008 y sobrecorreccion relativa de 0.9924, con un neighbor_count de 14. Segun la model card, esto reduce los rechazos de 97/100 a 0/100 con una divergencia KL de 0.1397 respecto al original. Posteriormente se aplico cuantizacion de precision mixta con oQ (oMLX v0.7.3), asignando 3 bits al 47.4% de los pesos logicos, 4 bits al 28.5%, 5 bits al 8.0%, 6 bits al 1.1% y manteniendo un 15.0% en BF16.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-2B, aunque no se detallan en la informacion disponible.
- Vision: incluye un codificador de vision de 0.331B parametros, por lo que puede procesar imagenes ademas de texto.
- Decodificacion especulativa: la cabeza MTP conservada permite prediccion multi-token y aceleracion de la inferencia.
- Comportamiento sin rechazos: la ablacion con Heretic elimina las respuestas de negativa del modelo original (0/100 rechazos segun la model card).
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion local en Apple Silicon: el formato MLX y el tamano de 1.549 GiB permiten ejecutar el modelo en Macs con memoria unificada, ideal para prototipado rapido de aplicaciones multimodales sin GPU dedicada.
- Investigacion sobre alineacion y decensurado: el checkpoint sirve para estudiar el efecto de la ablacion ARA sobre el comportamiento del modelo, comparando rechazos y divergencia KL respecto al original.
- Evaluacion de cuantizacion de precision mixta: util para medir el impacto de esquemas oQ con distribucion no uniforme de bits sobre la calidad de un modelo multimodal pequeno.
- Pruebas de decodificacion especulativa: la cabeza MTP intacta permite experimentar con tecnicas de aceleracion de inferencia y medir su impacto en latencia y throughput.
- Prototipos de vision-lenguaje: el codificador de vision integrado permite construir demos de descripcion de imagenes o respuesta a preguntas visuales en entornos de desarrollo.
- Generacion de texto creativo sin filtros: para casos donde se requiere un modelo que no rechace peticiones, siempre que se asuma la responsabilidad etica y legal del contenido generado.
- Benchmarking de modelos pequenos: como referencia para comparar tecnicas de cuantizacion y ablacion en el rango de 2B parametros.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.5-2B original |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0.1397 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1.549 GiB en el formato cuantizado actual (1.663 GB en disco).
- GPU recomendadas: no disponible. El formato MLX esta orientado a Apple Silicon (series M1, M2, M3, M4 con memoria unificada).
- Compatibilidad con GPU consumer: si, en Macs con al menos 8 GB de memoria unificada; el modelo cabe holgadamente en configuraciones de 16 GB o mas.
- Opciones de despliegue: MLX (libreria nativa del checkpoint), oMLX para cuantizacion; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato es MLX y no GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-heretic-oQ3.5-mtp | 2.274B | No disponible | No disponible | safetensors (MLX) | Decensurado, cuantizado, con MTP |
| Qwen/Qwen3.5-2B | No disponible | No disponible | No disponible | No disponible | Modelo base original, 97/100 rechazos |
| Otros modelos de ~2B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- El modelo ha sido decensurado mediante ablacion, lo que elimina los rechazos y puede generar contenido inapropiado, ofensivo o danino sin filtros; el uso en produccion requiere moderacion externa.
- La divergencia KL de 0.1397 respecto al original indica una alteracion medible de la distribucion de salida, lo que puede degradar capacidades en tareas que dependian del comportamiento original.
- La cuantizacion agresiva (47.4% de pesos a 3 bits) puede introducir perdida de calidad adicional, especialmente en tareas de razonamiento complejo o generacion de codigo.
- No se dispone de informacion sobre sesgos conocidos, idiomas soportados ni licencia, lo que impide evaluar restricciones de uso comercial.
- La licencia no esta declarada, por lo que no se puede asumir permiso para uso comercial o redistribucion.
- El modelo esta empaquetado para MLX, limitando su despliegue a ecosistema Apple; no hay version GGUF ni compatibilidad con servidores de inferencia convencionales.
- No hay datos de benchmarks estandar que permitan validar su calidad frente a alternativas.
- El checkpoint fue actualizado el 2026-11-12 con oMLX v0.7.3; versiones anteriores deben descartarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ3.5-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
