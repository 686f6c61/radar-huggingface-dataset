# mradermacher/Iris-12B-v1.4.1-i1-GGUF

## Resumen

Iris-12B-v1.4.1-i1-GGUF es una cuantizacion en formato GGUF del modelo Iris-12B-v1.4.1, desarrollado por Lambent y convertido por mradermacher. Con aproximadamente 11,9 mil millones de parametros (11.907.350.576), se trata de un modelo de la clase 12B orientado a conversacion, segun las etiquetas publicadas en el repositorio. La cuantizacion emplea el metodo imatrix (matriz de importancia), que optimiza la distribucion de bits para reducir la perdida de calidad respecto a cuantizaciones estandar al mismo numero de bits por peso.

El repositorio ofrece 24 formatos de cuantizacion diferentes, desde IQ1_S (muy agresiva, minima huella de memoria) hasta Q6_K (alta fidelidad), lo que permite al usuario elegir el equilibrio adecuado entre calidad de generacion y requisitos de hardware. Al estar en formato GGUF, el modelo es compatible con motores de inferencia locales como llama.cpp, Ollama y otros entornos que consumen este formato.

La relevancia de esta publicacion radica en su compatibilidad con despliegue en endpoints (etiqueta `endpoints_compatible`) y su region de uso indicada como `region:us`, lo que facilita su integracion en infraestructuras de inferencia en la nube o en entornos locales con recursos limitados. No obstante, la informacion publica sobre la arquitectura interna y los datos de entrenamiento del modelo original es limitada en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

La informacion disponible sobre la arquitectura interna del modelo Iris-12B-v1.4.1 es limitada. El repositorio GGUF no incluye detalles sobre el tipo de arquitectura (transformer denso, mezcla de expertos, etc.), el numero de capas, la dimension del modelo ni el vocabulario. Tampoco se especifican datos sobre el entrenamiento, como el volumen de tokens utilizados, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo que si se puede confirmar es que la cuantizacion fue realizada con el metodo imatrix, una tecnica que calcula una matriz de importancia sobre un conjunto de calibracion para asignar los bits de forma optima durante la cuantizacion, reduciendo la degradacion en tareas de generacion. El proceso de conversion fue realizado por mradermacher a partir de los pesos originales en formato safetensors del modelo de Lambent. La etiqueta `conversational` sugiere que el modelo esta afinado para tareas de dialogo, aunque no se detalla el proceso de ajuste.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica que el modelo esta orientado a interacciones de dialogo multi-turno.
- Inferencia local en formato GGUF: compatible con motores como llama.cpp, Ollama, LM Studio y otros que soporten este formato.
- Despliegue en endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede integrarse en servicios de inferencia HTTP.
- Cuantizacion flexible: 24 niveles de cuantizacion disponibles, desde IQ1_S (menor uso de memoria) hasta Q6_K (mayor fidelidad).
- No se dispone de informacion verificable sobre capacidades especificas como tool calling, razonamiento multi-paso, generacion de codigo, vision o soporte multilingue.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede desplegarse en un equipo con GPU consumer para ofrecer un asistente de chat privado sin dependencia de servicios en la nube, gracias a su formato GGUF y su orientacion conversacional.
- Prototipado rapido de aplicaciones de IA: al ser compatible con Ollama y llama.cpp, permite levantar un servidor de inferencia local en minutos para validar ideas de producto antes de escalar a modelos mayores.
- Inferencia en entornos con recursos limitados: las cuantizaciones IQ1_S, IQ2_XS o Q3_K_S permiten ejecutar el modelo en hardware con 4-6 GB de VRAM, lo que lo hace util para portatiles o instancias cloud de gama baja.
- Integracion en pipelines de NLP: al ser compatible con endpoints, puede integrarse como servicio interno en flujos de procesamiento de lenguaje natural, como clasificacion, resumen o generacion asistida.
- Evaluacion de calidad de cuantizacion: la amplia gama de formatos permite comparar la degradacion de calidad entre distintos niveles de bits por peso sobre el mismo modelo base, util para investigacion en compression de modelos.
- Despliegue en regiones con requisitos de soberania de datos: la etiqueta `region:us` y la naturaleza local del formato GGUF facilitan su uso en entornos donde los datos no pueden salir de una region especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo o su version original.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~11,9B parametros en formato GGUF, las necesidades aproximadas son:
  - Cuantizacion Q2_K: ~4-5 GB de VRAM
  - Cuantizacion Q4_K_M: ~7-8 GB de VRAM
  - Cuantizacion Q6_K: ~9-10 GB de VRAM
  - Cuantizacion Q8_0: ~12 GB de VRAM (no incluida en este repositorio)
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones hasta Q4_K_M; RTX 4090, A100 o H100 para cuantizaciones de mayor precision con mayor velocidad.
- Compatibilidad con GPU consumer: si, las cuantizaciones IQ1_S, IQ2_XS, IQ3_K_S y Q4_K_M caben en GPUs de 6-8 GB de VRAM como RTX 3060 o RTX 4060.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF) y servidores compatibles con el formato GGUF.
- Latencia y throughput: no disponible. Dependera del hardware, la cuantizacion elegida y el motor de inferencia utilizado.

## Comparativa con modelos similares

No disponible. No se dispone de informacion suficiente sobre el modelo original Iris-12B-v1.4.1 para establecer una comparativa fiable con otras alternativas de la clase 12B, como Qwen2.5-12B o Mistral Nemo 12B. Los datos de parametros, contexto y rendimiento de estos modelos no estan incluidos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia desconocida: no se ha publicado la licencia del modelo, por lo que no se puede confirmar si su uso comercial esta permitido. Se recomienda contactar con el autor original antes de utilizarlo en produccion.
- Informacion incompleta: no se dispone de datos sobre la arquitectura, el contexto maximo, los idiomas soportados ni el proceso de entrenamiento del modelo original.
- Riesgo de alucinacion: como cualquier modelo de lenguaje generativo, puede producir contenido factualmente incorrecto o inventado. Sin datos de evaluacion, no se puede cuantificar este riesgo.
- Degradacion por cuantizacion: las cuantizaciones mas agresivas (IQ1_S, IQ2_XS, IQ1_M) pueden provocar una perdida notable de calidad en la generacion, especialmente en tareas de razonamiento complejo.
- Sesgos desconocidos: al no disponer de informacion sobre los datos de entrenamiento, no se pueden identificar sesgos potenciales del modelo.
- Repositorio sin actividad: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Iris-12B-v1.4.1-i1-GGUF
- Modelo original: https://huggingface.co/Lambent/Iris-12B-v1.4.1
