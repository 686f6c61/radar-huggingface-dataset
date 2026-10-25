# mradermacher/Krypton-Fly-1.0-GGUF

## Resumen

Krypton-Fly-1.0-GGUF es la distribución en formato GGUF del modelo myjellylabs/Krypton-Fly-1.0, publicada por mradermacher (nethype GmbH). No se trata de un modelo entrenado desde cero por el cuantizador, sino de una conversión de los pesos originales a 12 variantes de cuantización (desde Q2_K hasta f16) generadas con llama.cpp y listas para su uso en entornos de inferencia local. El modelo base está etiquetado por su autor con los descriptores krypton, krypton-fly, jelly-lab-game, tool-use, agent y coding, lo que sitúa su propósito previsto en el ámbito de agentes, uso de herramientas y generación de código.

El modelo cuenta con 2.516.756.480 parámetros (aproximadamente 2,5 mil millones), según los metadatos de safetensors del repositorio original. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas, y declara únicamente el inglés como idioma soportado. La información pública disponible no incluye detalles sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que esta ficha se limita a los datos verificables del repositorio y de la model card.

La relevancia de esta publicación es práctica: al ofrecer cuantizaciones estáticas en un rango de 1,1 GB a 5,1 GB, permite ejecutar un modelo de 2,5B en GPU de consumo e incluso en CPU, algo adecuado para prototipado de agentes locales y pipelines de herramientas sin depender de API externas. El repositorio es de reciente creación, acumula 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación comunitaria significativa de su calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la model card del cuantizador ni en los metadatos disponibles) |
| Parámetros totales | 2.516.756.480 (~2,5 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en safetensors |
| Modelo base | myjellylabs/Krypton-Fly-1.0 |
| Cuantizador | mradermacher (nethype GmbH) |
| Versión de cuantización | quantize_version 2, convert_type hf, output_tensor_quantised 1 |
| Tamaño total del repositorio | 22,8 GB (suma de todas las variantes) |
| Librería declarada | transformers |
| Pipeline | no disponible |
| Etiquetas del autor | krypton, krypton-fly, jelly-lab-game, myjellylabs, tool-use, agent, coding, conversational, endpoints_compatible |
| Fecha de creación del repositorio | 2026-10-25 |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible la arquitectura del modelo base (no se confirma si es un transformer denso, un MoE o una arquitectura híbrida), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de alineación mediante RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. Lo único verificable es el recuento de parámetros (2,5 B) y el hecho de que el modelo base se publica con pesos en safetensors compatibles con la librería transformers.

En lo que respecta a esta publicación concreta, el proceso aplicado es una conversión de formato seguida de cuantización estática con llama.cpp: los metadatos indican `convert_type: hf`, `quantize_version: 2` y `output_tensor_quantised: 1`. El autor señala explícitamente que en el momento de la publicación no hay cuantizaciones ponderadas con matriz de importancia (imatrix), solo estáticas, y que no ha planificado generarlas salvo petición mediante una discusión en la comunidad. Las cuantizaciones IQ presentes se limitan a IQ4_XS.

## Capacidades

Las capacidades que se listan a continuación proceden de las etiquetas declaradas por el autor del modelo base y del cuantizador; no han sido verificadas de forma independiente ni respaldadas por evaluaciones publicadas.

- Generación de texto conversacional en inglés (etiqueta `conversational`).
- Uso de herramientas y function calling (etiquetas `tool-use`, `agent`).
- Generación y asistencia de código (etiqueta `coding`).
- Ejecución en flujos agénticos de varios pasos, según la etiqueta `agent`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere que puede servirse tras una API compatible con el esquema de Hugging Face.
- Contexto de juego o simulación vinculado a «jelly lab» (etiquetas `jelly-lab-game`, `myjellylabs`), sin documentación adicional sobre qué implica exactamente.
- Capacidades multimodales (visión, audio), modo thinking o razonamiento extendido: no disponibles según la información proporcionada.
- Soporte multilingüe: limitado al inglés según el campo `language`.

## Casos de uso

- Agentes locales de automatización de tareas: el modelo puede ejecutarse en una estación de trabajo con una GPU de 8 GB usando Q4_K_M (1,7 GB) y actuar como planificador que emite llamadas a herramientas locales, sin enviar datos a servicios externos.
- Asistente de código en el IDE: las etiquetas `coding` y `tool-use` lo hacen candidato para autocompletado, explicación de fragmentos y generación de parches en un plugin local; su tamaño de 2,5 B permite latencias bajas en GPU de consumo.
- Enrutamiento de herramientas en pipelines de CI/CD: dado su reducido tamaño, puede desplegarse como clasificador que decide qué herramienta o script invocar ante un evento de repositorio, con la ventaja de que la licencia Apache 2.0 permite integrarlo en productos comerciales.
- Prototipado de sistemas multiagente: al caber en un contenedor con 2-3 GB de VRAM en Q4 o Q5, se pueden levantar varias instancias en una sola GPU para simular roles distintos (planificador, ejecutor, revisor) antes de migrar a modelos mayores.
- Inferencia en el borde o en CPU: la variante Q2_K (1,1 GB) y Q4_K_S (1,6 GB) permiten ejecución en portátiles sin GPU mediante llama.cpp u Ollama, útil para demos offline y entornos con requisitos de privacidad estrictos.
- Evaluación comparativa interna de modelos pequeños: sirve como línea base de 2,5 B en pruebas de seguimiento de instrucciones y uso de herramientas, siempre que se validen previamente sus capacidades reales, dado que no hay benchmarks publicados.
- Experimentación académica con cuantizaciones: el conjunto de 12 variantes (de Q2_K a f16) permite estudiar la degradación de calidad por nivel de cuantización en un modelo de este tamaño con un coste de hardware mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K, BFCL ni de ninguna otra evaluación, y tampoco se referencian resultados del modelo base myjellylabs/Krypton-Fly-1.0. No deben asumirse cifras de rendimiento a partir del nombre o de las etiquetas del modelo.

## Requisitos de hardware

Los tamaños que se indican a continuación proceden de la tabla de cuantizaciones del repositorio; las estimaciones de VRAM añaden un margen de aproximadamente 0,5-1 GB para contexto y estados de inferencia.

- Q2_K (1,1 GB): inferencia viable en CPU con 4-6 GB de RAM; en GPU, cabe en tarjetas de 4 GB.
- Q3_K_S / Q3_K_M / Q3_K_L / IQ4_XS (1,3-1,5 GB): alrededor de 2-2,5 GB de VRAM efectivos; apto para GTX 1650, RTX 3050 4 GB y similares.
- Q4_K_S / Q4_K_M (1,6-1,7 GB): recomendados por el autor por equilibrio velocidad/calidad; ~2,5 GB de VRAM, cómodos en RTX 3060, RTX 4060, RTX 4090 o A10.
- Q5_K_S / Q5_K_M (1,9 GB): ~3 GB de VRAM; sin problema en GPU de 8 GB o más.
- Q6_K (2,2 GB): ~3,5 GB de VRAM; calidad muy alta según la nomenclatura estándar de llama.cpp.
- Q8_0 (2,8 GB): ~4 GB de VRAM; la mejor calidad práctica antes de f16.
- f16 (5,1 GB): ~6 GB de VRAM; el propio autor lo califica de «overkill» para este tamaño.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060/4060/4070, RTX 4090, A10, L4) para las variantes Q4-Q8; A100/H100 no son necesarias para un modelo de 2,5 B y solo tendrían sentido para servir muchas instancias en paralelo.
- Despliegue: llama.cpp (formato nativo), Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma general, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Con 2,5 B de parámetros y Q4_K_M en una GPU moderna es razonable esperar decenas de tokens por segundo, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Los datos de los modelos alternativos provienen de sus respectivas ficheras públicas y deben verificarse en la fuente original.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF | Rendimiento |
|---|---|---|---|---|---|
| Krypton-Fly-1.0 (este) | ~2,5 B | no disponible | Apache 2.0 | Sí (12 variantes) | no disponible |
| Qwen2.5-Coder-3B-Instruct | ~3,1 B | 32 768 tokens (según ficha del autor) | Apache 2.0 | Sí, ampliamente disponible | benchmarks publicados por el autor; no comparables aquí |
| Llama-3.2-3B-Instruct | ~3,2 B | 128 000 tokens (según ficha del autor) | Llama 3.2 Community License | Sí | benchmarks publicados por el autor |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8 192 tokens (según ficha del autor) | Apache 2.0 | Sí | benchmarks publicados por el autor |

Diferencias relevantes: frente a Qwen2.5-Coder y Llama-3.2, Krypton-Fly no documenta ventana de contexto ni evaluación, y su comunidad es prácticamente inexistente (0 descargas, 1 like), lo que reduce la confianza para producción. Su ventaja principal es la licencia Apache 2.0 sin cláusulas adicionales, a diferencia de la licencia de Llama 3.2.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni en evaluaciones de uso de herramientas, pese a las etiquetas `tool-use` y `agent`.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Contexto desconocido: al no documentarse la longitud de contexto, no deben asumirse ventanas largas en producción; conviene medirla empíricamente antes de diseñar flujos multi-turno.
- Riesgo de alucinación: inherente a los modelos de 2,5 B, especialmente en tareas de razonamiento y código; no se ha publicado ningún mecanismo de mitigación ni fases de alineación.
- Trazabilidad limitada del modelo base: la model card del repositorio GGUF no enlaza papers, blog ni dataset, y la información sobre `myjellylabs/Krypton-Fly-1.0` no se ha proporcionado en esta ficha.
- Sin cuantizaciones con imatrix: el autor indica que solo hay cuantizaciones estáticas; las variantes de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de forma notable en un modelo pequeño.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el cuantizador no ofrece garantías; conviene conservar los avisos de atribución al modelo base y al autor de la cuantización.
- Madurez: repositorio con 0 descargas y 1 like; sin issues, discusiones ni validación de terceros que permitan confirmar que las cuantizaciones funcionan correctamente.
- Compatibilidad: al ser GGUF, no es directamente servible en vLLM o TGI; requiere llama.cpp u Ollama, con menor throughput en escenarios de alta concurrencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Krypton-Fly-1.0-GGUF
- Modelo base: https://huggingface.co/myjellylabs/Krypton-Fly-1.0
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Krypton-Fly-1.0-GGUF
- Preguntas frecuentes y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de GGUF y ficheros multiparte (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que soporta el trabajo del cuantizador: https://www.nethype.de/
