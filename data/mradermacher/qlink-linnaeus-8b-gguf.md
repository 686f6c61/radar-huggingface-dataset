# mradermacher/QLink-linnaeus-8B-GGUF

## Resumen

QLink-linnaeus-8B-GGUF es la distribucion en formato GGUF del modelo QLink-linnaeus-8B, un modelo de lenguaje conversacional de 8.190.735.360 parametros (aproximadamente 8.190 millones) publicado originalmente por el usuario Dash00 en Hugging Face. Esta version ha sido cuantizada por mradermacher, un prolifico distribuidor de cuantizaciones GGUF para la comunidad de inferencia local, con el objetivo de hacer el modelo ejecutable en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo esta disenado para uso conversacional en ingles y se distribuye bajo la libreria transformers, con soporte para endpoints compatibles. La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de 8B en GPUs de consumo: las cuantizaciones disponibles van desde Q2_K (3,4 GB) hasta f16 (16,5 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de VRAM.

No obstante, la informacion publica disponible es muy limitada: no se especifican la longitud de contexto, la licencia, los datos de entrenamiento ni resultados de benchmarks. La model card del cuantizador se limita a listar los ficheros GGUF generados y a remitir al modelo base para cualquier detalle adicional. Esta ficha refleja fielmente esa escasez de datos y marca explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 8.190.735.360 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 73,4 GB |
| Modelo base | Dash00/QLink-linnaeus-8B |
| Cuantizador | mradermacher |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Dash00/QLink-linnaeus-8B. Por la libreria declarada (transformers) y el tamano (8.190 millones de parametros), se trata presumiblemente de un transformer decoder-only de escala 8B, pero la model card del cuantizador no confirma ni la familia arquitectonica, ni el numero de capas, ni la dimension de atencion, ni si emplea atencion lineal o alguna variante hibrida. Tampoco se especifica la longitud de contexto nativa.

Respecto al entrenamiento, no consta el numero de tokens utilizados, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El unico dato disponible sobre el proceso es el propio de la cuantizacion: mradermacher indica que se han generado cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1) y que no hay disponibles cuantizaciones ponderadas con imatrix en el momento de la publicacion, aunque deja abierta la posibilidad de solicitarlas mediante una discusion comunitaria. La etiqueta "conversational" sugiere que el modelo base fue ajustado para dialogos multi-turno, pero no hay documentacion publica que lo detalle.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del modelo.
- Dialogo multi-turno: el modelo esta orientado a conversaciones, aunque no se especifica la ventana de contexto que soporta.
- Soporte de endpoints compatibles (tag "endpoints_compatible"), lo que permite su despliegue mediante infraestructura de inferencia estandar.
- Cuantizaciones GGUF para inferencia en CPU y GPU con llama.cpp y derivados.
- Capacidades de tool calling / function calling: no disponible.
- Capacidades de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede ejecutarse en un portatil o estacion de trabajo con GPU de consumo usando la cuantizacion Q4_K_M (5,1 GB), lo que permite mantener conversaciones multi-turno sin conexion a internet ni costes de API.
- Prototipado rapido de chatbots: gracias a las cuantizaciones ligeras (Q2_K de 3,4 GB, Q3_K_S de 3,9 GB), es posible desplegar un prototipo funcional en hardware modesto para validar flujos de conversacion antes de invertir en infraestructura mayor.
- Experimentacion academica con modelos de 8B: investigadores que necesiten comparar el comportamiento de modelos conversacionales de escala 8B pueden usar esta version para pruebas controladas en entornos con recursos limitados.
- Despliegue en entornos con restricciones de red: al ser un modelo local en GGUF, encaja en escenarios de borde o air-gapped donde no se permite enviar datos a servicios en la nube, siempre que se acepte el idioma ingles.
- Integracion en pipelines de generacion de texto por lotes: mediante llama.cpp o servidores compatibles con endpoints, puede procesar lotes de prompts conversacionales en tareas de clasificacion o resumen simple, aunque sin garantias documentadas de calidad.
- Evaluacion de cuantizaciones: el repositorio ofrece doce variantes de cuantizacion del mismo modelo, lo que lo convierte en un banco de pruebas util para medir el impacto de la cuantizacion en la calidad de salida sobre un modelo conversacional de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, mas overhead de contexto y KV cache):
  - Q2_K: ~3,4 GB de pesos; ~4-5 GB de VRAM total estimada.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~3,9-4,5 GB de pesos; ~5-6 GB de VRAM total.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~4,7-5,1 GB de pesos; ~6-7 GB de VRAM total.
  - Q5_K_S / Q5_K_M: ~5,8-6,0 GB de pesos; ~7-8 GB de VRAM total.
  - Q6_K: ~6,8 GB de pesos; ~8-9 GB de VRAM total.
  - Q8_0: ~8,8 GB de pesos; ~10-11 GB de VRAM total.
  - f16: ~16,5 GB de pesos; ~18-19 GB de VRAM total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4 a Q8; A100 o H100 no son necesarias para un modelo de este tamano, aunque pueden usarse para servir varias instancias.
- Cabe en GPU de consumo: si. Las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 6-8 GB; Q6_K y Q8_0 requieren 10-12 GB; f16 requiere 20 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), servidores compatibles con la API de OpenAI que usen llama.cpp por debajo, y cualquier runtime que acepte GGUF. La etiqueta "endpoints_compatible" sugiere compatibilidad con infraestructura de endpoints estandar.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, licencia) del modelo base, por lo que una comparativa rigurosa con alternativas de la misma categoria no es posible con la informacion proporcionada. A continuacion se indica que datos faltan para cada posible comparacion:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Comparacion |
|---|---|---|---|---|---|
| QLink-linnaeus-8B-GGUF | 8,19B | no disponible | no disponible | GGUF en HF | — |
| Alternativas de 8B (p. ej. familias Llama 3 8B, Mistral 7B, Qwen2.5 7B) | ~7-8B | no disponible en esta ficha | no disponible en esta ficha | ampliamente disponibles | no disponible: faltan datos del modelo evaluado para comparar |

## Limitaciones y advertencias

- Informacion publica muy escasa: no se documentan arquitectura, contexto, datos de entrenamiento ni licencia, lo que dificulta evaluar su idoneidad para produccion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue comercial.
- Solo ingles: los metadatos declaran unicamente el idioma "en"; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: al no haber benchmarks ni documentacion de alineacion, no es posible estimar la fiabilidad factual del modelo.
- Sesgos conocidos: no disponibles; al desconocerse el dataset de entrenamiento, no se pueden evaluar sesgos de genero, raza o ideologicos.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_M se marcan explicitamente como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el cuantizador indica que no hay cuantizaciones ponderadas disponibles, lo que puede reducir la calidad respecto a alternativas con imatrix en tamanos equivalentes.
- Modelo de nicho con muy poca traccion: 19 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria y soporte limitado.
- Fecha de creacion futura en los metadatos (2026-01-12): conviene verificar la procedencia y vigencia del repositorio antes de confiar en el.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/QLink-linnaeus-8B-GGUF
- Modelo base: https://huggingface.co/Dash00/QLink-linnaeus-8B
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#QLink-linnaeus-8B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
