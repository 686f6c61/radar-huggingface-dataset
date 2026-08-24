# Dsg2/LS-92M-A22M-GGUF

## Resumen

LS-92M-A22M es un modelo de lenguaje de tipo mezcla de expertos (MoE) en miniatura, desarrollado por Dsg2 como parte de la colección "LaoShu". Se trata de un modelo experimental, entrenado íntegramente en una GPU NVIDIA GTX 1660 Super, que busca explorar la viabilidad de arquitecturas MoE de muy pequeño tamaño. El modelo utiliza enrutamiento top-1 y deriva de un modelo base más pequeño, LS-63M-A16M, del que se duplicaron cuatro capas y se aplicó una tasa de aprendizaje alta a las mismas.

A pesar de su reducido tamaño (92 millones de parámetros totales, 22 millones activos), el modelo es capaz de mantener conversaciones sencillas en inglés y generar código básico en Python, mostrando una mejora notable en este último aspecto respecto a su predecesor. Su ventana de contexto es de 4096 tokens con una ventana deslizante de 1024, y se distribuye en formato GGUF, lo que permite ejecutarlo en CPU con herramientas como llama.cpp.

La relevancia de este modelo reside en su carácter didáctico y experimental: demuestra que es posible entrenar un MoE funcional con recursos de hardware muy limitados, aunque su rendimiento real está lejos de los estándares de producción. Está pensado para desarrolladores e investigadores interesados en explorar arquitecturas MoE compactas o en realizar pruebas de concepto sin necesidad de infraestructura costosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con enrutamiento top-1 (mezcla de expertos) |
| Parametros totales | 92M (declarados por el autor; 102.363.648 en safetensors) |
| Parametros activos | 22M |
| Longitud de contexto | 4096 tokens (ventana deslizante de 1024) |
| Tipos de cuantizacion | Q8 (probado en CPU con llama.cpp) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también disponible safetensors en el modelo base) |

## Arquitectura y entrenamiento

LS-92M-A22M es un modelo de tipo mezcla de expertos con enrutamiento top-1, lo que significa que para cada token solo se activa un subconjunto de los parámetros (22M de los 92M totales). La arquitectura se construyó duplicando cuatro capas del modelo base LS-63M-A16M y aplicando una tasa de aprendizaje alta a esas capas duplicadas, con el objetivo de aumentar la capacidad sin incrementar proporcionalmente el coste computacional.

El entrenamiento se realizó en una GPU NVIDIA GTX 1660 Super durante aproximadamente 70 horas, procesando un total de 4 mil millones de tokens (2 mil millones en la primera época y otros 2 mil millones en la segunda). No se menciona el uso de técnicas de alineación como RLHF o DPO; el modelo se entrenó únicamente con un objetivo de modelado de lenguaje estándar. El checkpoint publicado corresponde al final de la segunda época.

El archivo safetensors del modelo base contiene 102.363.648 parámetros, una cifra ligeramente superior a los 92M declarados, probablemente debido a los embeddings y otras tablas no incluidas en el recuento de parámetros del autor. La versión GGUF está cuantizada a Q8, lo que reduce el tamaño del archivo a aproximadamente 0.2 GB.

## Capacidades

- Generación de texto en inglés: produce respuestas coherentes en conversaciones cortas, aunque con errores factuales ocasionales.
- Chat conversacional: mantiene diálogos multi-turno sencillos, como se muestra en los ejemplos de la model card.
- Generación de código básico: es capaz de escribir funciones simples en Python, como invertir una cadena, y explicar su funcionamiento.
- Razonamiento limitado: puede resolver tareas muy simples, pero no es adecuado para razonamiento complejo o matemáticas avanzadas.
- Sin soporte de tool calling ni function calling: no se menciona ninguna capacidad de invocación de herramientas.
- Sin capacidades multimodales: no procesa visión, audio ni otros formatos.
- Monolingüe: solo inglés, sin soporte multilingüe.

## Casos de uso

- Experimentación educativa: estudiantes e investigadores pueden utilizar este modelo para comprender el funcionamiento interno de una arquitectura MoE, analizando cómo el enrutamiento top-1 afecta a la generación de texto y al rendimiento.
- Prototipado rápido de chatbots: para demostraciones o prototipos que no requieran alta precisión, el modelo puede integrarse en aplicaciones de chat simples en inglés, gracias a su capacidad de mantener conversaciones básicas.
- Pruebas de concepto en entornos con recursos limitados: al ser extremadamente ligero (0.2 GB en GGUF), puede ejecutarse en dispositivos de baja gama, como Raspberry Pi o portátiles antiguos, para validar ideas antes de escalar a modelos mayores.
- Generación de código auxiliar en entornos de desarrollo: puede sugerir fragmentos de código Python sencillos, como funciones de utilidad, aunque siempre debe revisarse la salida debido a posibles errores.
- Benchmarking de frameworks de inferencia: sirve como modelo de referencia para medir el rendimiento de motores como llama.cpp, vLLM u Ollama en CPU o GPU de baja capacidad, gracias a su pequeño tamaño y formato GGUF.
- Investigación sobre modelos MoE compactos: el modelo es un caso de estudio interesante para analizar cómo la duplicación de capas y el enrutamiento top-1 afectan al rendimiento en modelos de menos de 100M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica "Training end evals: NA", por lo que no existen datos objetivos de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K. Los únicos datos de rendimiento son los ejemplos de chat y código mostrados en la model card, que no constituyen una evaluación formal.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB, incluso en cuantización Q8. El modelo es adecuado para GPUs con 2 GB o menos de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como GTX 1650, GTX 1660, RTX 3050, o incluso iGPUs modernas. También funciona en CPU sin GPU.
- Compatibilidad con consumer GPU: sí, cabe en prácticamente cualquier GPU de consumo actual, incluidas las integradas.
- Opciones de despliegue: llama.cpp (probado por el autor), también compatible con vLLM, Ollama, TGI y otros frameworks que soporten GGUF.
- Latencia y throughput: en el ejemplo de la model card, se observan velocidades de 170-187 tokens por segundo en CPU, aunque no se especifica el hardware exacto. En GPU, la velocidad sería significativamente mayor.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de tamaño similar. El único punto de referencia directo es el modelo base LS-63M-A16M, del que deriva. Según el autor, LS-92M-A22M muestra una mejora sustancial en generación de código respecto a su predecesor, aunque no se aportan métricas cuantitativas. Otros modelos pequeños como TinyLlama (1.1B) o SmolLM (135M) tienen más parámetros y no son directamente comparables en arquitectura ni en propósito.

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| LS-92M-A22M | 92M (22M activos) | 4096 | MoE top-1 | Apache-2.0 |
| LS-63M-A16M | 63M (16M activos) | no disponible | MoE top-1 | Apache-2.0 |
| SmolLM-135M | 135M | 2048 | Denso | Apache-2.0 |

## Limitaciones y advertencias

- Modelo altamente experimental: el propio autor advierte que "puede no rendir según los estándares". No está diseñado para uso en producción.
- Alucinaciones frecuentes: en el ejemplo de la model card, el modelo responde que la capital de Francia es "Louis XVI", un error factual grave. Esto indica una alta propensión a generar información incorrecta.
- Contexto limitado: 4096 tokens con ventana deslizante de 1024, lo que restringe la capacidad de mantener coherencia en conversaciones largas o documentos extensos.
- Solo inglés: no soporta otros idiomas, lo que limita su aplicabilidad en entornos multilingües.
- Sin tool calling ni capacidades de agente: no puede interactuar con APIs ni ejecutar acciones externas.
- Riesgo de sesgos: al ser entrenado con un dataset no especificado y de tamaño reducido, puede reflejar sesgos presentes en los datos de entrenamiento, aunque no se han documentado formalmente.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero al ser un modelo experimental, no se garantiza su calidad ni su idoneidad para aplicaciones críticas.

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/Dsg2/LS-92M-A22M-GGUF)
- [Modelo base en Hugging Face](https://huggingface.co/Dsg2/LS-92M-A22M)
- [Colección LS de Dsg2](https://huggingface.co/collections/Dsg2/ls)
