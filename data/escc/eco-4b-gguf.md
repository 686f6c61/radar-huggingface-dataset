# escc/eco-4b-gguf

## Resumen

Eco-4b-gguf es la distribucion en formato GGUF del modelo Eco Mini v0.0.3, un ajuste fino del modelo base Qwen/Qwen3-4B desarrollado por el usuario escc. Se trata de un chatbot especializado en tematica medioambiental y climatica, disenado para responder exclusivamente a partir de texto de referencia recuperado mediante RAG (retrieval-augmented generation) y para declinar explicitamente las preguntas que ese texto no cubre. El modelo conserva la arquitectura transformer densa del Qwen3-4B original, con 4.022.468.096 parametros totales.

La relevancia de este modelo reside en su enfoque de calibracion del comportamiento: en lugar de optimizar solo la calidad de las respuestas, el ajuste LoRA se ha orientado a ensenar al modelo a reconocer los limites de su contexto recuperado y a rechazar consultas sobre eventos actuales, precios, meteorologia o asesoramiento legal, medico o financiero. Esto lo convierte en un caso de estudio util para desarrolladores que necesitan desplegar asistentes de dominio acotado con comportamiento predecible ante preguntas fuera de alcance.

El repositorio tiene un tamano de 4,7 GB e incluye pesos cuantizados en formato GGUF, aunque la libreria declarada en los metadatos es MLX, lo que sugiere un empaquetado mixto o una etiqueta heredada. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de la atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo etiquetado tambien como MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de 4.000 millones de parametros desarrollado por el equipo Qwen de Alibaba Cloud, documentado en el informe tecnico arXiv:2505.09388. Sobre esa base se aplico un ajuste fino con LoRA que posteriormente se fusiono en un modelo autonomo, de modo que los pesos distribuidos no requieren adaptadores separados. No se especifican en la informacion disponible el rango del LoRA, la tasa de aprendizaje ni el numero de pasos de entrenamiento.

Los datos de entrenamiento consistieron en conversaciones generadas por Qwen3-8B a partir de pasajes de dos fuentes: Wikipedia en ingles (retrieval de noviembre de 2026, licencia CC BY-SA 4.0) y resumenes de articulos de acceso abierto en ciencias medioambientales y de la Tierra y planetarias indexados en OpenAlex (licencia CC BY). El texto se segmento en pasajes y se reescribio como pares pregunta-respuesta, complementado con ejemplos disenados manualmente para ensenar al modelo a declinar consultas fuera de dominio. El repositorio incluye un fichero `sources.jsonl` que acredita cada documento utilizado con titulo, URL, revision, licencia, fecha de recuperacion y autores. No se menciona el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles con un tono cercano y respetuoso con la naturaleza, segun la model card.
- Respuesta fundamentada en contexto recuperado (RAG): el modelo esta disenado para contestar a partir de pasajes de referencia proporcionados en el prompt.
- Reconocimiento de limites del contexto: declina responder cuando el texto recuperado no cubre la pregunta.
- Rechazo explicito de consultas sobre eventos actuales, precios y meteorologia, por carecer de datos en vivo.
- Rechazo de asesoramiento legal, medico y financiero.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Asistente de consulta documental medioambiental: integrado en un pipeline RAG que recupere pasajes de Wikipedia y OpenAlex, el modelo responde citando el contenido recuperado y senala cuando la informacion no esta disponible, lo que reduce el riesgo de respuestas inventadas en dominios tecnicos.
- Chatbot de educacion climatica: adecuado para entornos divulgativos donde se requiere un tono accesible y la capacidad de admitir desconocimiento ante preguntas fuera del corpus, evitando afirmaciones no verificadas sobre ciencia del clima.
- Atencion al ciudadano en portales de sostenibilidad: puede gestionar consultas sobre normativa ambiental o datos cientificos publicados, declinando derivar a asesoramiento legal cuando la pregunta lo requiera.
- Despliegue en hardware de consumo: al ser un modelo de 4.000 millones de parametros en GGUF, puede ejecutarse en GPUs de gama media o incluso en CPU con llama.cpp u Ollama, lo que facilita prototipos locales de asistentes verdes sin infraestructura cloud.
- Filtro de alcance en aplicaciones de dominio acotado: su entrenamiento especifico para declinar preguntas fuera de contexto lo hace util como capa de control en sistemas donde se quiere evitar que el modelo improvise sobre temas sensibles.
- Base para experimentacion en calibracion de rechazos: investigadores pueden estudiar como un ajuste LoRA sobre Qwen3-4B modifica la tasa de abstención y la fidelidad al contexto recuperado, comparandolo con el modelo base.
- Generacion de resumenes de articulos cientificos abiertos: con pasajes de OpenAlex como contexto, el modelo puede sintetizar hallazgos de ciencias de la Tierra manteniendo la atribucion a las fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; para un modelo denso de 4.000 millones de parametros en GGUF, las estimaciones habituales rondan 3-4 GB en cuantizacion de 4 bits y 8-9 GB en FP16, aunque el repositorio no detalla los niveles de cuantizacion incluidos.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar funcionamiento en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y GPUs de datacenter como A100 o H100, pero no hay confirmacion del autor.
- Compatibilidad con GPU de consumo: probable por el tamano del modelo, si bien no se documenta explicitamente.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repo tambien esta etiquetado como MLX, lo que sugiere uso en Apple Silicon mediante MLX. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Eco-4b-gguf | 4.022 M | no disponible | en | Apache 2.0 | GGUF / MLX |
| Qwen/Qwen3-4B (base) | 4.000 M aprox. | no disponible en esta ficha | multilingue | Apache 2.0 | safetensors |
| Otros ajustes RAG de dominio acotado | variable | variable | variable | variable | variable |

La comparacion directa con alternativas de la misma categoria (asistentes RAG de dominio especifico sobre modelos de 4B) no esta disponible en la informacion proporcionada. El referente mas inmediato es el propio Qwen3-4B, del que Eco Mini hereda arquitectura y licencia, diferenciandose por el ajuste LoRA orientado a comportamiento conversacional medioambiental y a la abstención ante consultas fuera de alcance.

## Limitaciones y advertencias

- Riesgo de alucinacion: la model card advierte que sin contexto recuperado el modelo puede inventar respuestas; su uso previsto es exclusivamente dentro de la aplicacion Eco Mini con RAG.
- Sin datos en vivo: no dispone de informacion sobre eventos actuales, precios ni meteorologia, y declina ese tipo de consultas por diseno.
- No apto para decisiones criticas: el autor indica explicitamente que no debe usarse para decisiones de seguridad, legales, medicas o financieras.
- Propagacion de errores de las fuentes: puede repetir inexactitudes presentes en el texto de referencia de Wikipedia u OpenAlex.
- Limitacion idiomatica: solo declara soporte de ingles, por lo que su uso en castellano no esta validado.
- Contexto maximo no documentado: se desconoce la ventana de contexto efectiva, lo que dificulta dimensionar los pipelines RAG que lo alimentan.
- Empaquetado ambiguo: el repo se etiqueta como MLX pero distribuye GGUF, lo que puede generar confusion en el despliegue; conviene verificar los ficheros antes de integrarlo.
- Atribucion obligatoria: aunque la licencia es Apache 2.0, el uso de texto de Wikipedia bajo CC BY-SA 4.0 y de resumenes de OpenAlex bajo CC BY exige respetar las condiciones de atribucion recogidas en `sources.jsonl`.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/escc/eco-4b-gguf
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Informe tecnico Qwen3: https://arxiv.org/abs/2505.09388
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY-SA 4.0 (Wikipedia): https://creativecommons.org/licenses/by-sa/4.0/
- OpenAlex: https://openalex.org
