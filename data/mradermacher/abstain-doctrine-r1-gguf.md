# mradermacher/abstain-doctrine-r1-GGUF

## Resumen

abstain-doctrine-r1-GGUF es la versión cuantizada en formato GGUF del modelo SZLHOLDINGS/abstain-doctrine-r1, publicada por el usuario mradermacher, conocido por generar cuantizaciones estáticas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base pertenece a la familia de "doctrine-v11" de SZLHOLDINGS y se distribuye como candidato de investigación ("research-candidate") bajo una licencia Apache 2.0.

Con 772.845.888 parámetros totales (aproximadamente 0,77 mil millones), se trata de un modelo compacto orientado a conversación y etiquetado como compatible con endpoints. La model card del autor de la cuantización es puramente mecánica: describe los ficheros GGUF generados y remite a la página del modelo base para obtener información sustantiva sobre arquitectura, entrenamiento y capacidades.

La relevancia de esta ficha es limitada por la escasez de documentación técnica publicada: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. Es relevante para desarrolladores que quieran ejecutar el modelo base en hardware de consumo mediante llama.cpp, pero debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin confirmar) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base SZLHOLDINGS/abstain-doctrine-r1 en la documentación proporcionada. El recuento de parámetros (772.845.888) sugiere un modelo de escala pequeña, pero no se confirma si emplea un transformer denso, una mezcla de expertos u otra variante. La presencia de ficheros mmproj en el repositorio GGUF indica que el modelo base incorpora algún componente multimodal (probablemente visión), aunque no se detalla su naturaleza.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Las etiquetas del repositorio ("doctrine-v11", "launch-contract-governed", "research-candidate") apuntan a un modelo experimental dentro de una familia propietaria de SZLHOLDINGS, pero no aportan detalles técnicos verificables. Las cuantizaciones publicadas son estáticas (no ponderadas por imatrix), según indica el propio autor.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Compatibilidad declarada con endpoints ("endpoints_compatible"), lo que sugiere uso a través de APIs de inferencia.
- Posible soporte multimodal (visión) por la presencia de ficheros mmproj, aunque no se especifica el alcance.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación local con llama.cpp: el modelo puede cargarse en equipos de consumo gracias a sus cuantizaciones Q4_K_M (0,6 GB) y Q8_0 (0,9 GB), lo que permite probar el comportamiento del modelo base sin infraestructura dedicada.
- Pruebas de concepto de asistentes conversacionales en inglés: al estar etiquetado como conversacional, sirve para prototipar diálogos multi-turno en entornos de desarrollo.
- Evaluación comparativa de cuantizaciones: los múltiples formatos publicados (de Q2_K a f16) permiten medir la degradación de calidad frente al tamaño en un pipeline de pruebas.
- Integración en herramientas de escritorio con Ollama o LM Studio: el tamaño reducido facilita el despliegue en portátiles y estaciones de trabajo sin GPU dedicada.
- Investigación sobre modelos "doctrine" de SZLHOLDINGS: útil para analizar el comportamiento de esta familia experimental antes de adoptar versiones mayores.
- Prototipado de aplicaciones multimodales: los ficheros mmproj permiten explorar el componente visual del modelo base en tareas sencillas de descripción de imágenes, siempre que se confirme su funcionamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB con Q4_K_M, 0,9 GB con Q8_0 y 1,7 GB con f16 (tamaños de fichero indicados por el autor); el consumo real en memoria es algo superior por el contexto y el runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM es suficiente; también funciona en CPU.
- Cabe en GPU consumer: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 o superiores, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base en safetensors requeriría transformers.
- Latencia y throughput estimados: no disponibles; al ser un modelo de menos de 1.000 millones de parámetros, se espera una latencia baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (arquitectura, contexto, rendimiento) para establecer una comparativa rigurosa con alternativas de la misma categoría. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| abstain-doctrine-r1-GGUF | 772.845.888 | no disponible | apache-2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Documentación muy escasa: no se publican detalles de arquitectura, entrenamiento, contexto ni evaluación, lo que impide validar su calidad de forma objetiva.
- Etiquetado como "research-candidate": no debe considerarse un modelo estable para producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano es desconocido y probablemente deficiente.
- Riesgo de alucinación: no cuantificado por el autor; en modelos pequeños sin evaluación publicada suele ser elevado.
- Sesgos: no documentados; al no conocerse la composición del dataset, no pueden evaluarse sesgos sistemáticos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Cuantizaciones estáticas sin imatrix: el propio autor advierte de que las cuantizaciones ponderadas no están disponibles, lo que puede afectar a la calidad en los formatos de menor bits.
- Fecha de creación futura (2026-11-09) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/abstain-doctrine-r1-GGUF
- Modelo base: https://huggingface.co/SZLHOLDINGS/abstain-doctrine-r1
- Página de descargas del autor: https://hf.tst.eu/model#abstain-doctrine-r1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
