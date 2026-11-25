# Denisijcu/vertex-salvador-GGUF

## Resumen

vertex-salvador es un ajuste fino del modelo Gemma 4 E4B de Google, desarrollado por Denis Sánchez Leyva (Vertex Coders LLC) y publicado en formato GGUF para su uso local en LM Studio. El modelo está especializado en explicar la historia de El Salvador con atribución de fuentes y neutralidad editorial: busca antes de responder, asigna cada cifra y cada versión a quien la sostiene, y declara explícitamente cuándo no dispone de un dato. Está diseñado para funcionar conjuntamente con un servidor de herramientas MCP que le da acceso a una biblioteca de 133 fragmentos verificados procedentes de 153 fuentes públicas.

El modelo parte de `google/gemma-4-E4B-it`, un transformer denso de aproximadamente 7.518 millones de parámetros, y se ha afinado mediante QLoRA (r=16, alpha=16) únicamente sobre las capas de lenguaje. El resultado se distribuye como un único archivo GGUF cuantizado en Q4_K_M de 5,3 GB, más un proyector de visión F16 de 990 MB que no es necesario para el caso de uso principal. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia radica en dos factores: por un lado, demuestra un patrón de ajuste fino orientado a *retrieval* con contrato de herramientas estricto y enmascaramiento de la pérdida sobre las salidas de las herramientas; por otro, ofrece un caso concreto de modelo vertical (dominio histórico-político salvadoreño) ejecutable en hardware de consumo. No obstante, es un modelo pequeño y su utilidad está ligada al servidor MCP del proyecto: sin él, conversa pero no tiene acceso a los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 E4B), ajuste QLoRA sobre capas de lenguaje |
| Parametros totales | 7.518.069.290 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens recomendados en carga (el modelo base soporta más, pero la configuracion del proyecto fija 8192) |
| Tipos de cuantizacion | Q4_K_M (archivo principal, 5,3 GB); proyector de vision en F16 (990 MB) |
| Idiomas soportados | Espanol e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer denso Gemma 4 E4B de Google, realizado mediante QLoRA con rango 16 y alpha 16, aplicado exclusivamente a las capas de lenguaje (el proyector de visión no se entrena para este uso). El entrenamiento se ejecutó en Kaggle sobre 2 × NVIDIA T4, con tasa de aprendizaje constante de 5e-5, lote efectivo de 8, una época y longitud máxima de 3072 tokens. La pérdida de validación descendió de 2,0652 a 1,1118.

El conjunto de datos consta de 261 conversaciones propias en español e inglés (256 de ellas con llamadas a herramientas), mezcladas con conversaciones generales de oasst2 en proporción 60/25/15 (propias / español / inglés), lo que da 391 ejemplos de entrenamiento y 44 de validación. La innovación técnica destacable es el enmascaramiento de la pérdida: solo se computa sobre las llamadas a herramientas y las respuestas del modelo, mientras que el contenido devuelto por las herramientas queda excluido, de modo que el modelo aprende a invocar y a redactar a partir de resultados, pero no a fabricar el contenido de esos resultados. El contrato de herramientas es fijo y se entrenó con cuatro funciones: `buscar_documentos`, `leer_documento`, `consultar_cifras` y `linea_tiempo`.

## Capacidades

- Generación de texto conversacional en español e inglés sobre temática histórica y política salvadoreña.
- Tool calling / function calling con un contrato estricto de cuatro herramientas (`buscar_documentos`, `leer_documento`, `consultar_cifras`, `linea_tiempo`) y argumentos tipados.
- Razonamiento multi-paso orientado a recuperación: el modelo formula consultas, lee documentos y sintetiza respuestas citando fuentes.
- Atribución explícita de afirmaciones y cifras a su autor ("según la Policía Nacional Civil…", "según Cristosal…").
- Tratamiento de hechos disputados presentando cada versión con su autor, sin emitir veredicto propio.
- Declaración de ausencia de datos cuando la biblioteca no cubre la pregunta.
- Integración con LM Studio mediante MCP y configuración documentada (contexto 8192, temperatura 0.3, repeat penalty 1.05, thinking desactivado).
- Soporte de RAG sobre una biblioteca local de 133 fragmentos de 153 fuentes públicas.
- Capacidad de visión heredada del modelo base a través del proyector F16, aunque el autor indica que no es necesaria para este uso.

## Casos de uso

- Consulta histórica documentada con fuentes: un investigador o periodista pregunta por una ley, una fecha o una votación y el modelo invoca `buscar_documentos` y `leer_documento` para devolver el hecho con su referencia, lo que permite verificar la respuesta contra la fuente original.
- Verificación de cifras oficiales y de organizaciones civiles: mediante `consultar_cifras` con métrica y rango temporal, el modelo recupera el dato y lo atribuye a la entidad que lo sostiene, útil para contrastar cifras de seguridad pública o indicadores sociales.
- Construcción de líneas de tiempo: con `linea_tiempo` y un rango de épocas, el modelo genera cronologías acotadas y citadas, adecuadas para materiales didácticos o contextualización en redacciones.
- Docencia y divulgación: al presentar hechos disputados con las versiones de cada parte y sin veredicto propio, sirve como apoyo en aulas o talleres donde se requiere mostrar el debate historiográfico sin tomar partido.
- Asistente local privado para redacciones: al ejecutarse en LM Studio sobre hardware de consumo y sin búsqueda en internet, permite trabajar con material sensible sin enviar consultas a servicios en la nube.
- Prototipado de agentes RAG con contrato de herramientas: el repositorio documenta el contrato exacto y el enmascaramiento de pérdida, lo que lo convierte en una referencia práctica para equipos que quieran replicar el patrón en otros dominios verticales.
- Filtro de desinformación en primera instancia: la regla de atribución y la declaración de "no tengo el dato" reducen la probabilidad de que una afirmación sin respaldo se presente como hecho, lo que ayuda a marcar contenido que requiere verificación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: pérdida de validación de 2,0652 a 1,1118 sobre 44 ejemplos de validación, sin evaluación en MMLU, HumanEval, GSM8K ni conjuntos equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6,5 GB con la cuantización Q4_K_M (5,3 GB de pesos más overhead de contexto a 8192 tokens). El proyector de visión F16 añade 990 MB si se carga.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para Q4_K_M con contexto completo; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB en adelante; en 6 GB requeriría reducir contexto o usar una cuantización menor no publicada en el repo.
- Opciones de despliegue: LM Studio es el entorno documentado y recomendado por el autor (con `mcp.json` y el servidor de herramientas del proyecto); llama.cpp es la vía natural al ser GGUF; vLLM y TGI no están documentados para este repositorio.
- Latencia y throughput: no disponibles. El autor describe el modelo como "rápido y privado" por su tamaño, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| vertex-salvador (este) | 7.518 M | 8192 recomendado | GGUF Q4_K_M | Apache 2.0 | Historia de El Salvador con RAG y atribución |
| google/gemma-4-E4B-it (base) | 7.518 M | No disponible en la información | Safetensors / GGUF | Apache 2.0 | Asistente general multimodal |
| Modelos de 7-8B ajustados para RAG | 7.000-8.000 M típicamente | Variable | GGUF / Safetensors | Variable | Recuperación y citación en dominios concretos |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. El único punto de referencia objetivo es el modelo base, del que este se diferencia por el ajuste QLoRA, el contrato de herramientas y el enmascaramiento de pérdida, no por tamaño ni por arquitectura.

## Limitaciones y advertencias

- Fecha de corte de los datos: 18 de noviembre de 2026. No conoce hechos posteriores.
- Solo conoce lo que está en su biblioteca local (133 fragmentos de 153 fuentes); no busca en internet.
- La búsqueda es por palabras: si la consulta usa términos muy distintos a los del documento, puede no recuperarlo y responder sin la información relevante.
- Puede atribuir un dato correcto a otra fuente de la misma búsqueda; el autor recomienda comprobar la fuente mostrada en el detalle de cada herramienta para usos oficiales.
- Sin el servidor MCP del proyecto, el modelo conversa pero no tiene acceso a los datos, lo que limita su utilidad sustantiva.
- Modelo pequeño: no sustituye la consulta de las fuentes originales.
- Riesgo de alucinación inherente a un modelo de 7,5B; el enmascaramiento de pérdida reduce pero no elimina la fabricación de contenido.
- Sesgos: no documentados explícitamente en la información disponible; la regla editorial de neutralidad se aplica por igual a gobierno, oposición, organizaciones civiles, organismos internacionales y prensa, pero no se reportan evaluaciones de sesgo.
- Limitaciones de idioma: solo español e inglés; el dominio está acotado a la historia salvadoreña.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4 de Google, ya que la model card afirma que es la misma licencia sin más detalle.
- Configuración sensible: con contexto de 2048 tokens LM Studio recorta la conversación al insertar resultados de herramientas y el modelo pierde el hilo; se requiere 8192.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Denisijcu/vertex-salvador-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo base cuantizado usado en el ajuste: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- LM Studio: https://lmstudio.ai
- Repositorio GitHub del proyecto (guía de instalación y servidor MCP): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
