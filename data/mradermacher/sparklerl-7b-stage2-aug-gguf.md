# mradermacher/SparkleRL-7B-Stage2-aug-GGUF

## Resumen

SparkleRL-7B-Stage2-aug-GGUF es la version cuantizada en formato GGUF del modelo SparkleRL-7B-Stage2-aug, desarrollado por el equipo sparkle-reasoning. Se trata de un modelo de lenguaje de aproximadamente 7.615 millones de parametros (7,6B) afinado especificamente para tareas de razonamiento matematico, entrenado sobre el dataset hardmath. Esta version ha sido producida por mradermacher, un conocido creador de cuantizaciones GGUF de la comunidad, para facilitar su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base es un transformer de tipo decoder-only de 7B, y esta version GGUF incluye un conjunto completo de cuantizaciones estaticas que van desde Q2_K (3,1 GB) hasta f16 (15,3 GB), pasando por opciones intermedias como IQ4_XS, Q4_K_M o Q6_K. Esto permite ejecutar el modelo en un rango amplio de hardware, desde GPUs de gama media con 6-8 GB de VRAM hasta configuraciones mas potentes.

La relevancia de esta ficha radica en que ofrece una via practica para probar un modelo especializado en matematicas en local, con licencia MIT (permisiva para uso comercial) y un unico idioma soportado declarado: ingles. No se dispone de informacion publica sobre benchmarks, arquitectura detallada ni proceso de entrenamiento mas alla de los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles no disponibles) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base SparkleRL-7B-Stage2-aug. Por el nombre y el tamano (7,6B parametros) se trata presumiblemente de un transformer decoder-only de la familia de 7B, pero no se confirma en la informacion proporcionada si emplea atencion estandar, atencion lineal u otra variante. Tampoco se especifica la longitud de contexto nativa ni la composicion exacta de la capa de tokenizacion.

En cuanto al entrenamiento, la model card indica que el modelo fue afinado sobre el dataset `sparkle-reasoning/hardmath`, orientado a problemas matematicos de dificultad elevada, y que la etapa se denomina "Stage2-aug", lo que sugiere un proceso de ajuste en varias fases (posiblemente SFT seguido de RL, dado el prefijo "RL" en el nombre). No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como RLHF, DPO o decodificacion especulativa. Esta version concreta es una cuantizacion estatica realizada por mradermacher; no se han generado cuantizaciones ponderadas con imatrix para este modelo segun la propia model card.

## Capacidades

- Generacion de texto y razonamiento matematico: el modelo esta especializado en resolver problemas de matematicas, segun el dataset de entrenamiento hardmath.
- Razonamiento multi-paso: el sufijo "Stage2" y el enfoque en matematicas sugieren capacidad para cadenas de razonamiento, aunque no se documenta explicitamente un modo "thinking".
- Conversacion: la etiqueta `conversational` indica que el modelo esta preparado para interacciones de tipo chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos (`language: en`).
- Vision, audio u otras modalidades: no disponible; el modelo es solo de texto segun los datos.

## Casos de uso

- Resolucion de problemas matematicos en local: el modelo puede emplearse para resolver ejercicios de algebra, calculo o aritmetica compleja en entornos sin conexion, aprovechando las cuantizaciones Q4_K_M (4,8 GB) o Q5_K_M (5,5 GB) para caber en GPUs de consumo.
- Asistente de estudio de matematicas: integrado en una aplicacion de chat, el modelo puede guiar al usuario paso a paso en la resolucion de problemas, gracias a su entrenamiento sobre el dataset hardmath y su naturaleza conversacional.
- Generacion de explicaciones matematicas: util para crear material didactico o borradores de soluciones razonadas en ingles, con la ventaja de la licencia MIT para su inclusion en productos comerciales.
- Prototipado de pipelines de razonamiento: investigadores pueden usar la version GGUF para experimentar con tecnicas de prompting o decodificacion sobre un modelo matematico sin necesidad de infraestructura de GPU de datacenter.
- Evaluacion comparativa de cuantizaciones: al ofrecer 12 variantes de cuantizacion, el modelo sirve para medir el impacto de la compresion en tareas matematicas, comparando Q2_K frente a Q6_K o f16 en el mismo hardware.
- Despliegue en dispositivos con poca VRAM: las variantes Q2_K (3,1 GB) y Q3_K_S (3,6 GB) permiten ejecutar el modelo en GPUs de 4-6 GB o incluso en CPU con llama.cpp, ampliando el acceso a equipos modestos.
- Fine-tuning posterior sobre dominios matematicos especificos: al estar bajo licencia MIT y en formato GGUF, aunque el fine-tuning directo sobre GGUF es limitado, el modelo base en safetensors puede adaptarse a otros dominios numericos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_S: ~3,6 GB
  - Q3_K_M: ~3,9 GB
  - Q3_K_L: ~4,2 GB
  - IQ4_XS: ~4,4 GB
  - Q4_K_S: ~4,6 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_S: ~5,4 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
- GPU recomendadas: para Q4_K_M o Q5_K_M basta una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4070; para Q8_0 se recomienda una RTX 4080/4090 o A100/H100 si se busca maxima calidad y velocidad. Las variantes Q2_K y Q3_K_S pueden ejecutarse en GPUs de 6 GB como la RTX 2060 o GTX 1660.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones hasta Q6_K; Q8_0 y f16 requieren GPUs de gama alta o multiples GPUs.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No se recomienda vLLM o TGI para GGUF (aunque existen soportes parciales), sino para el modelo base en safetensors.
- Latencia y throughput estimados: no disponible; dependera del hardware y del backend. Como referencia cualitativa, las cuantizaciones Q4_K_S y Q4_K_M estan marcadas en la model card como "fast, recommended".

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, se podria comparar con otros modelos matematicos de ~7B como DeepSeek-Math-7B o MetaMath-7B, pero no se dispone de sus datos en esta ficha para realizar una tabla rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| SparkleRL-7B-Stage2-aug | 7,6B | no disponible | MIT | GGUF / safetensors |
| Alternativas de ~7B matematicos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas puede degradar gravemente la calidad.
- Especializacion: al estar afinado sobre matematicas (hardmath), su rendimiento en tareas generales de lenguaje, codigo o conocimiento factual puede ser inferior al de modelos generalistas del mismo tamano.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar soluciones matematicas plausibles pero incorrectas; se recomienda verificar los resultados en produccion.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse sobre un dataset matematico en ingles puede heredar sesgos de ese corpus.
- Contexto: se desconoce la longitud de contexto nativa; no se debe asumir una ventana larga sin verificacion.
- Licencia: MIT permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset hardmath, ya que la cuantizacion no altera los terminos del modelo original.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas como de menor calidad; para tareas matematicas donde la precision es critica se recomienda Q5_K_M o superior.
- Sin cuantizaciones imatrix: la model card indica que no hay cuantizaciones ponderadas con imatrix, lo que puede suponer una ligera perdida de calidad frente a alternativas con imatrix en tamanos equivalentes.
- Fecha de creacion y actualizacion: el repositorio se creo en noviembre de 2025 y se actualizo en noviembre de 2026; verificar la vigencia de los enlaces y del modelo base.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/SparkleRL-7B-Stage2-aug-GGUF
- Modelo base: https://huggingface.co/sparkle-reasoning/SparkleRL-7B-Stage2-aug
- Pagina de conveniencia del autor para este modelo: https://hf.tst.eu/model#SparkleRL-7B-Stage2-aug-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Dataset de entrenamiento: https://huggingface.co/datasets/sparkle-reasoning/hardmath
