# mradermacher/Gobble-Prover-1.7B-GGUF

## Resumen

Gobble-Prover-1.7B-GGUF es la versión cuantizada en formato GGUF del modelo Gobble-Prover-1.7B, un modelo especializado en demostración de teoremas en Lean 4. La cuantización la publica mradermacher, un autor conocido por convertir modelos de HuggingFace a GGUF para su uso con llama.cpp y herramientas compatibles. El modelo base procede de la cuenta anónima anonymous-submission-ICLR2027, lo que indica que se trata de un envío en revisión para ICLR 2027 cuya autoría aún no se ha hecho pública.

El modelo está etiquetado con las categorías lean4 y theorem-proving, y declara soporte únicamente para inglés. Su tamaño real, según los pesos en safetensors del modelo base, es de 2.031.739.904 parámetros (unos 2,03 mil millones), una cifra superior a la que sugiere el nombre comercial "1.7B". Con ese tamaño, el modelo está pensado para ejecutarse en hardware de consumo, algo poco habitual en el ámbito de los demostradores automáticos de teoremas, donde predominan modelos de mayor tamaño.

La relevancia de esta ficha radica en que permite evaluar rápidamente una opción ligera y local para tareas de formalización y demostración en Lean 4, sin depender de APIs externas. No obstante, la model card del repositorio cuantizado es puramente técnica (generada por el pipeline de cuantización) y no incluye detalles sobre arquitectura, contexto, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la detalla; etiquetada como transformers) |
| Parámetros totales | 2.031.739.904 (≈2,03 B) según los safetensors del modelo base |
| Parámetros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF en este repositorio; el recuento de parámetros procede de los safetensors del modelo base |
| Modelo base | anonymous-submission-ICLR2027/Gobble-Prover-1.7B |
| Cuantizado por | mradermacher |
| Tamaño del repositorio | 18,6 GB (incluye todas las cuantizaciones) |
| Tamaño de los ficheros | de 1,0 GB (Q2_K) a 4,2 GB (f16) |
| Fecha de publicación | 2026-09-19 |
| Descargas / likes | 0 / 0 |
| Librería declarada | transformers |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. La model card del repositorio cuantizado no describe la topología de la red, el número de capas, las dimensiones de las cabezas de atención ni si se emplea algún mecanismo alternativo al transformer estándar (MoE, SSM o híbridos). La etiqueta library_name: transformers indica únicamente compatibilidad con el ecosistema de HuggingFace, no una arquitectura concreta. Tampoco se documenta la longitud de contexto soportada.

Respecto al entrenamiento, no hay datos disponibles: se desconoce el volumen de tokens utilizados, la composición del corpus, si se aplicaron fases de ajuste supervisado, RLHF o DPO, y qué proporción de los datos corresponde a código Lean 4, a matemáticas formales o a texto general. Las únicas pistas son las etiquetas del repositorio (lean4, theorem-proving) y la naturaleza anónima del envío a ICLR 2027. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de búsqueda de pruebas integrados.

En cuanto a esta publicación concreta, el trabajo realizado es exclusivamente de cuantización: el autor indica que se trata de cuantizaciones estáticas del modelo base y que en el momento de la publicación no había cuantizaciones ponderadas ni con imatrix disponibles. Los ficheros se ofrecen en 12 variantes de precisión, desde Q2_K (1,0 GB) hasta f16 (4,2 GB).

## Capacidades

- Generación de texto en inglés, con especialización en contenido formal y matemático.
- Demostración de teoremas en Lean 4: generación de tácticas y bloques de prueba en la sintaxis del asistente.
- Etiquetado como conversacional, por lo que admite plantillas de chat de tipo instrucción-respuesta.
- Formalización de enunciados matemáticos expresados en lenguaje natural hacia Lean 4, siempre que el modelo base haya sido entrenado para ello (no confirmado en la información disponible).
- Generación de código en Lean 4 y, potencialmente, en otros lenguajes, aunque no hay confirmación documental de esto último.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Demostración automática de teoremas en Lean 4: el modelo puede generar candidatos de prueba para lemas enunciados por el usuario, que después se validan con el compilador de Lean. Su tamaño de 2,03 B permite iterar muchas propuestas en local sin coste de API, lo que encaja con la naturaleza de búsqueda por prueba y error de la demostración automática.
- Autoformalización de matemáticas: conversión de enunciados redactados en inglés a declaraciones Lean 4 sintácticamente válidas, como primer paso de un pipeline de verificación formal. Requiere revisión humana o validación con el propio compilador.
- Reparación de pruebas tras cambios de Mathlib: cuando una versión nueva de la biblioteca rompe una prueba existente, el modelo puede proponer parches sobre las tácticas afectadas. Un modelo pequeño especializado es adecuado aquí porque la tarea es local y muy dependiente del contexto del error que reporta Lean.
- Asistente integrado en el IDE: sugerencias de táctica a táctica dentro del flujo de trabajo del LSP de Lean, ejecutándose en la máquina del desarrollador gracias a que la cuantización Q4_K_M ocupa 1,4 GB y cabe en GPU de gama media o incluso en CPU.
- Generación de datos sintéticos para entrenamiento: producir corpus de pruebas en Lean 4 que, tras filtrarse por compilación correcta, sirvan para ajustar modelos mayores. El bajo coste de inferencia local facilita generar grandes volúmenes de candidatos.
- Verificación continua en CI/CD: integrado como paso que propone o comprueba lemas en un repositorio de formalización, con la salvedad de que toda salida debe pasar por el compilador antes de aceptarse.
- Docencia de matemáticas formales: asistencia a estudiantes que aprenden Lean 4, explicando o proponiendo pasos de prueba en un entorno controlado y sin enviar código a servicios externos.
- Investigación en métodos de demostración automática: uso como línea base ligera para comparar estrategias de búsqueda, prompts o técnicas de refinado iterativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio cuantizado no incluye métricas de ningún tipo, y la model card del modelo base no es accesible desde los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para los pesos: 1,0 GB (Q2_K), 1,1-1,2 GB (Q3_K_S, Q3_K_M, Q3_K_L), 1,3 GB (IQ4_XS), 1,3-1,4 GB (Q4_K_S, Q4_K_M), 1,5-1,6 GB (Q5_K_S, Q5_K_M), 1,8 GB (Q6_K), 2,3 GB (Q8_0) y 4,2 GB (f16).
- A esas cifras hay que sumar la caché KV y el overhead del runtime, de modo que una GPU con 8 GB de VRAM cubre con holgura todas las cuantizaciones, incluida f16.
- Cabe en GPU de consumo: GTX 1650 / RTX 3050 de 4-8 GB para cuantizaciones Q4 y Q5, RTX 3060, RTX 4060, RTX 4090 para cualquier cuantización con contexto amplio. También es viable la inferencia en CPU con cuantizaciones Q4_K_M o inferiores.
- GPU de centro de datos (A100, H100) no son necesarias para un modelo de este tamaño; solo tendrían sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI admiten GGUF de forma parcial y pueden presentar limitaciones con este formato.
- Latencia y throughput: no disponibles, ya que no se han publicado mediciones.
- Aviso: los pesos en f16 ocupan 4,2 GB pero el fichero se describe en la model card como "overkill" para este modelo, por lo que no se recomienda salvo para conversión a otros formatos.

## Comparativa con modelos similares

No hay datos verificables en la información proporcionada sobre modelos comparables de demostración de teoremas (por ejemplo, variantes de Goedel-Prover, DeepSeek-Prover o Kimina-Prover) que permitan establecer una comparación con cifras. La siguiente tabla recoge únicamente lo que sí está documentado en este repositorio.

| Modelo | Parámetros | Contexto | Formato | Licencia | Datos de benchmarks |
|---|---|---|---|---|---|
| Gobble-Prover-1.7B-GGUF (esta publicación) | 2,03 B (según safetensors del base) | no disponible | GGUF (12 cuantizaciones) | apache-2.0 | no disponibles |
| Gobble-Prover-1.7B (modelo base, anónimo) | 2,03 B | no disponible | safetensors / transformers | apache-2.0 según el repositorio cuantizado | no disponibles |
| Otras alternativas de demostración en Lean 4 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tamaño reducido: con 2,03 B de parámetros, la profundidad de razonamiento es limitada en comparación con demostradores basados en modelos de 7 B, 32 B o mayores. Es previsible que falle en teoremas que requieran cadenas largas de deducción.
- Riesgo alto de alucinación formal: un modelo de este tipo puede generar tácticas inexistentes, lemas mal escritos o pasos que no compilan. Toda salida debe validarse con el compilador de Lean 4 antes de considerarse correcta.
- Contexto desconocido: no se documenta la ventana de contexto, lo que impide planificar su uso en ficheros con muchas dependencias o estados de prueba extensos.
- Idioma: solo se declara inglés, lo que limita su uso en entornos en castellano sin un ajuste previo.
- Sesgos conocidos: no documentados. Al no haber información sobre los datos de entrenamiento, no es posible evaluar sesgos de dominio, de género ni de procedencia.
- Procedencia opaca: el modelo base pertenece a un envío anónimo a ICLR 2027. La autoría, el proceso de entrenamiento y las evaluaciones no son verificables, y el repositorio podría cambiar o renombrarse cuando se publique la revisión.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento del análisis. No hay evidencia independiente de que las cuantizaciones funcionen correctamente ni de su calidad real.
- Licencia: apache-2.0, que permite uso comercial y modificación. Sin embargo, la licencia del modelo base anónimo podría modificarse o aclararse más adelante, por lo que conviene revisar el repositorio original antes de un despliegue en producción.
- Cuantizaciones muy agresivas: Q2_K (1,0 GB) y Q3_K_S (1,1 GB) degradarán notablemente la calidad de generación en una tarea donde la precisión sintáctica es crítica. Para uso serio en Lean 4 se recomienda Q5_K_M o superior.
- Tamaño del repositorio: 18,6 GB en total. Descargar solo el fichero de la cuantización deseada, no el repositorio completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gobble-Prover-1.7B-GGUF
- Modelo base (envío anónimo): https://huggingface.co/anonymous-submission-ICLR2027/Gobble-Prover-1.7B
- Página de descarga y resumen del autor de las cuantizaciones: https://hf.tst.eu/model#Gobble-Prover-1.7B-GGUF
- Preguntas frecuentes y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfica comparativa de perplejidad entre tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre el uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper: no disponible.
- Demo: no disponible.
- Repositorio de código: no disponible.
- Los resultados de la búsqueda web realizada no aportaron enlaces relevantes: el contenido devuelto no guardaba relación con el modelo.
