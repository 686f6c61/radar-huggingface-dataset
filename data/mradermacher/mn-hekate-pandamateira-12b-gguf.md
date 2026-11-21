# mradermacher/MN-Hekate-Pandamateira-12B-GGUF

## Resumen

MN-Hekate-Pandamateira-12B-GGUF es la distribucion en formato GGUF del modelo MN-Hekate-Pandamateira-12B, un merge creado con mergekit y publicado por la comunidad mergekit-community. Esta version concreta la ha generado mradermacher, un conocido cuantizador de la comunidad de Hugging Face que produce versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base es un merge de modelos de 12.247.813.120 parametros (aproximadamente 12,2 mil millones), lo que lo situa en la gama media de modelos densos.

El interes de esta ficha reside en que se trata de un modelo comunitario de tipo merge, sin model card tecnica detallada por parte del autor original, distribuido en multiples cuantizaciones (desde Q2_K hasta Q8_0) para facilitar su ejecucion en hardware de consumo. El repositorio GGUF ocupa 84,7 GB en total, aunque cada cuantizacion individual pesa entre 4,9 GB y 13,1 GB.

La informacion disponible es limitada: no se especifican arquitectura detallada, contexto, licencia ni datos de entrenamiento. Esta ficha refleja unicamente lo que consta en la informacion proporcionada y marca explicitamente como "no disponible" todo aquello que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo merge generado con mergekit; probablemente transformer denso, sin confirmar) |
| Parametros totales | 12.247.813.120 (12,2 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones ponderadas/imatrix en el repo i1 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo principal); el modelo base se distribuye presumiblemente en safetensors, aunque no se confirma en la informacion |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. Por el nombre y las etiquetas (`mergekit`, `merge`), se trata de un modelo resultante de la fusion de dos o mas modelos mediante mergekit, una herramienta que combina pesos de modelos existentes sin entrenamiento adicional desde cero. El modelo base es `mergekit-community/MN-Hekate-Pandamateira-12B`, alojado en la organizacion comunitaria de mergekit.

No consta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste fino posterior. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento. Esta version GGUF es una conversion directa (tipo `hf`) del modelo base, sin modificaciones de pesos mas alla de la cuantizacion.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y esta pensado para dialogos multi-turno, aunque no se detallan capacidades especificas.
- Idiomas: unicamente se declara soporte de ingles (`en`); no se garantiza un rendimiento fiable en castellano u otros idiomas.
- Razonamiento, codigo y matematicas: no disponible; no se documentan capacidades especificas en estas areas.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face, aunque no se detalla.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: gracias a las cuantizaciones Q4_K_S y Q4_K_M (7,2 y 7,6 GB), el modelo puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM, lo que permite experimentar con un chatbot local sin depender de servicios en la nube.
- Pruebas de merge de modelos en entornos de investigacion: al ser un merge comunitario, resulta util para estudiar el comportamiento de modelos fusionados y comparar su calidad frente a los modelos originales que lo componen.
- Despliegue en CPU con llama.cpp: las cuantizaciones Q2_K (4,9 GB) y Q3_K_S (5,6 GB) permiten inferencia en CPU con RAM moderada, adecuado para entornos sin GPU dedicada.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes de cuantizacion, lo que facilita medir el impacto de la compresion en la perplejidad y la calidad de generacion para un modelo de 12B.
- Generacion de texto creativo en ingles: el caracter conversacional del modelo lo hace apto para tareas de escritura asistida y generacion de dialogos, siempre con validacion humana por la falta de benchmarks publicados.
- Integracion en pipelines de Hugging Face Endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en la infraestructura de inferencia gestionada de Hugging Face, util para pruebas rapidas sin gestionar servidores propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_S: ~5,6 GB
  - Q3_K_M: ~6,2 GB
  - Q3_K_L: ~6,7 GB
  - IQ4_XS: ~6,9 GB
  - Q4_K_S: ~7,2 GB
  - Q4_K_M: ~7,6 GB
  - Q5_K_S: ~8,6 GB
  - Q5_K_M: ~8,8 GB
  - Q6_K: ~10,2 GB
  - Q8_0: ~13,1 GB
- GPU recomendadas: no disponible en la informacion; por tamano, una RTX 4090 (24 GB) o A100/H100 permiten ejecutar cualquier cuantizacion con holgura. Una RTX 3060 de 12 GB admite hasta Q6_K; una RTX 4060 Ti de 16 GB admite Q8_0.
- Cabe en GPU de consumo: si. Q4_K_M (7,6 GB) entra en GPUs de 8 GB con contexto reducido; Q8_0 (13,1 GB) requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), y cualquier runtime compatible con GGUF. La etiqueta `endpoints_compatible` apunta a Hugging Face Endpoints. vLLM y TGI no se mencionan en la informacion; vLLM requiere pesos en safetensors, no GGUF, por lo que habria que usar el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas en la informacion proporcionada. Como referencia estructural, se puede comparar con otros modelos densos de ~12B en formato GGUF, pero sin datos de rendimiento verificables no es posible establecer una comparativa rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| MN-Hekate-Pandamateira-12B-GGUF | 12,2 B | no disponible | no disponible | GGUF | no disponible |
| Alternativas de ~12B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: al no constar licencia, no se puede garantizar el uso comercial. Es imprescindible contactar con el autor o consultar el modelo base antes de usarlo en produccion.
- Idioma: solo se declara ingles; el rendimiento en castellano es incierto y probablemente deficiente.
- Ausencia de benchmarks: no hay datos objetivos de calidad, lo que impide evaluar su fiabilidad frente a alternativas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluaciones publicadas, el riesgo no esta cuantificado.
- Modelo merge sin model card tecnica: al ser una fusion de pesos, puede heredar sesgos y comportamientos inconsistentes de los modelos originales, que no se documentan.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin conocer la ventana real.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- Fecha de actualizacion futura (2026-11-21): el repositorio muestra una fecha de actualizacion posterior a la actual, lo que puede indicar metadatos inconsistentes; conviene verificar el estado real del repo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MN-Hekate-Pandamateira-12B-GGUF
- Modelo base: https://huggingface.co/mergekit-community/MN-Hekate-Pandamateira-12B
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/MN-Hekate-Pandamateira-12B-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#MN-Hekate-Pandamateira-12B-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
