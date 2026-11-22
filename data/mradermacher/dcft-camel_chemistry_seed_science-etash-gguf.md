# mradermacher/DCFT-camel_chemistry_seed_science-etash-GGUF

## Resumen

DCFT-camel_chemistry_seed_science-etash-GGUF es una version cuantizada en formato GGUF del modelo mlfoundations-dev/DCFT-camel_chemistry_seed_science-etash, un modelo de lenguaje de aproximadamente 7.600 millones de parametros desarrollado por el equipo mlfoundations-dev. El modelo original forma parte de la familia DCFT (presumiblemente un proceso de entrenamiento orientado a datos y ajuste fino) aplicada a un conjunto de datos semilla de quimica y ciencia con el identificador "camel_chemistry_seed_science-etash". La cuantizacion la ha realizado mradermacher, un autor habitual en la comunidad de cuantizaciones GGUF.

La relevancia de esta publicacion es practica: ofrece el modelo original en una amplia gama de niveles de cuantizacion (desde Q2_K de 3.1 GB hasta f16 de 15.3 GB), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo esta etiquetado para ingles y orientado a uso conversacional, con soporte para endpoints compatibles.

No se dispone de informacion publica sobre la arquitectura exacta, la longitud de contexto, la licencia ni los datos de entrenamiento en la informacion proporcionada. El repositorio tiene 28 descargas y 0 likes en el momento de la consulta, y un tamano total de 68.1 GB, coherente con la suma de todas las variantes cuantizadas incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: mlfoundations-dev/DCFT-camel_chemistry_seed_science-etash) |
| Parametros totales | 7.615.616.512 (aprox. 7.6B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la informacion proporcionada. Por el numero de parametros (7.6B) y la libreria declarada (transformers), se trata presumiblemente de un transformer decoder-only, pero no se confirma el tipo exacto de atencion, la longitud de contexto nativa ni si emplea tecnicas como attention lineal o decodificacion especulativa.

Respecto al entrenamiento, el nombre del modelo sugiere un ajuste fino sobre un conjunto de datos semilla de quimica y ciencia ("camel_chemistry_seed_science") dentro de un pipeline DCFT. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion realizada por mradermacher es de tipo estatico; el autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Orientacion tematica a quimica y ciencia, derivada del nombre del dataset semilla del modelo base.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- No se confirma soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun la metadata del repositorio.

## Casos de uso

- Asistencia conversacional especializada en quimica: el modelo puede mantener dialogos multi-turno sobre conceptos quimicos, reacciones y terminologia cientifica, aprovechando su ajuste sobre datos semilla de quimica.
- Prototipado rapido en local: gracias a las cuantizaciones Q4_K_S y Q4_K_M (4.6-4.8 GB), se puede ejecutar en un portatil con GPU de consumo para experimentar con respuestas cientificas sin infraestructura en la nube.
- Generacion de material divulgativo cientifico: redaccion de explicaciones y resumenes de conceptos de quimica para publicos no expertos, con la salvedad de revisar la exactitud factual.
- Base para ajuste fino adicional: al estar disponible en GGUF y en el modelo base original, se puede partir de el para tareas de dominio especifico mediante tecnicas de adaptacion (LoRA, por ejemplo) sobre el checkpoint original.
- Evaluacion comparativa de cuantizaciones: el amplio rango de niveles (Q2_K a f16) permite medir el impacto de la cuantizacion en la calidad de respuestas cientificas en un mismo modelo.
- Despliegue en entornos con recursos limitados: las variantes Q3_K_S (3.6 GB) y Q2_K (3.1 GB) permiten inferencia en CPU o GPUs con poca VRAM para tareas de baja latencia no criticas.
- Integracion en pipelines de investigacion: el tag "endpoints_compatible" facilita conectar el modelo a servicios de inferencia existentes para experimentos de NLP cientifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K (3.1 GB): ~3.5-4 GB de VRAM.
  - Q3_K_S (3.6 GB): ~4-4.5 GB.
  - Q3_K_M (3.9 GB) y Q3_K_L (4.2 GB): ~4.5-5 GB.
  - IQ4_XS (4.4 GB) y Q4_K_S (4.6 GB): ~5-5.5 GB.
  - Q4_K_M (4.8 GB): ~5.5 GB.
  - Q5_K_S (5.4 GB) y Q5_K_M (5.5 GB): ~6-6.5 GB.
  - Q6_K (6.4 GB): ~7 GB.
  - Q8_0 (8.2 GB): ~9 GB.
  - f16 (15.3 GB): ~16 GB.
- GPU recomendadas: para f16 o Q8_0, una RTX 4090 (24 GB) o A100/H100; para Q4_K_M, una RTX 3060 de 12 GB o superior es suficiente.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones. Q4_K_M cabe en GPUs de 8 GB con margen ajustado; Q2_K y Q3_K_S caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base admite transformers y endpoints compatibles.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la informacion proporcionada. El modelo base pertenece a la familia DCFT de mlfoundations-dev, pero no se han facilitado datos de rendimiento ni especificaciones de alternativas de la misma categoria para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Idioma limitado al ingles: no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base (mlfoundations-dev/DCFT-camel_chemistry_seed_science-etash) antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar afirmaciones cientificas incorrectas, especialmente en quimica, donde los errores factuales pueden ser graves; se recomienda validacion por expertos.
- Sesgos desconocidos: no se ha publicado informacion sobre la composicion del dataset ni sobre sesgos conocidos.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_M se marcan explicitamente como de menor calidad; para uso cientifico se recomienda Q5_K_M o superior.
- Sin cuantizaciones imatrix/ponderadas: el autor indica que no estaban disponibles, lo que puede reducir la calidad respecto a alternativas ponderadas del mismo tamano.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones o documentos largos.
- Modelo de nicho con pocas descargas (28) y sin likes: no hay validacion comunitaria extensa de su calidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/DCFT-camel_chemistry_seed_science-etash-GGUF
- Modelo base: https://huggingface.co/mlfoundations-dev/DCFT-camel_chemistry_seed_science-etash
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#DCFT-camel_chemistry_seed_science-etash-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
