# Oscar-veeee/Ottava-Few-Shot-Adapter

## Resumen

Ottava-Few-Shot-Adapter es un adaptador de agrupacion semantica few-shot publicado por el usuario Oscar-veeee bajo licencia Apache-2.0. No se trata de un modelo generativo al uso, sino de un toolkit que construye un pequeno scorer lineal regularizado por esquema sobre embeddings congelados de Qwen/Qwen3-1.7B. El usuario aporta un esquema con etiquetas definidas y entre 10 y 20 ejemplos etiquetados (support cases), y el adaptador asigna cada elemento no etiquetado a una de esas etiquetas.

El modelo resuelve el problema de clasificar lotes de texto corto de forma consistente y repetible cuando las categorias ya estan definidas de antemano, evitando el coste y la variabilidad de pedir a un LLM que razone y agrupe cada elemento individualmente. La innovacion principal es que el scorer se ajusta y se cachea por esquema, de modo que peticiones identicas posteriores reutilizan el ajuste sin recalcular.

Es relevante ahora porque ofrece una alternativa determinista y local a la clasificacion zero-shot con LLM en escenarios de triaje, etiquetado de encuestas y enrutado de documentos, con la ventaja de que el encoder y el scorer pueden ejecutarse en local sin enviar datos a servicios externos. El repositorio no incluye pesos del modelo base y su tamano es de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Scorer lineal regularizado sobre embeddings congelados de Qwen3-1.7B |
| Parametros totales | no disponible (el adaptador no publica recuento; el modelo base Qwen3-1.7B tiene 1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card limita el alcance a texto corto en ingles sin validacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | head.pt, label_embeddings.npz, adapter.json, config.json |

## Arquitectura y entrenamiento

El metodo no entrena el modelo base: Qwen/Qwen3-1.7B permanece congelado y se usa unicamente como encoder de embeddings. El pipeline consiste en codificar los elementos de soporte y de destino con Qwen, estandarizar las caracteristicas de los elementos usando las estadisticas del conjunto de soporte, construir vectores de etiqueta a partir de prompts de etiqueta y centroides de soporte, y ajustar un scorer lineal regularizado especifico del esquema. El scorer se cachea y se reutiliza en peticiones identicas posteriores.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que no se trata de un modelo preentrenado sino de un ajuste ligero por esquema. El checkpoint de ejemplo (example/sentiment) se ajusto con 20 casos de soporte de sentimiento escritos a mano (negative/neutral/positive) y no contiene datos personales ni de usuario. El adaptador esta condicionado por el soporte: no es un modelo universal de agrupacion preentrenado, sino que cada esquema obtiene su propio scorer ajustado.

## Capacidades

- Agrupacion semantica few-shot de texto corto en etiquetas definidas por el usuario.
- Clasificacion con un conjunto fijo de etiquetas y entre 10 y 20 ejemplos de soporte etiquetados.
- Ajuste y prediccion mediante fit_and_predict.py con esquemas en JSON o Markdown.
- Cacheo del scorer por esquema para reutilizacion en peticiones identicas.
- Soporte opcional de caracteristicas lexicas para lotes con solapamiento de redaccion (near-duplicate grouping).
- Ejecucion local del encoder y del scorer para escenarios con requisitos de privacidad.
- No genera texto, no ajusta Qwen, no infiere el numero de grupos y no sigue instrucciones no vistas en zero-shot.

## Casos de uso

- Triaje de soporte y feedback: agrupar tickets o mensajes en etiquetas propias de enrutado (facturacion, cuenta, tecnico, general) usando un esquema con ejemplos etiquetados; el scorer cacheado permite clasificar lotes sucesivos de forma consistente.
- Etiquetado de encuestas y respuestas abiertas: aplicar un codebook fijo a respuestas de texto libre para que las mismas categorias se usen entre encuestados, con revision humana de asignaciones de baja confianza.
- Analisis de resenas de producto: separar resenas por sentimiento, tema, caracteristica o tipo de queja segun un esquema propio, aprovechando el checkpoint de ejemplo de sentimiento como punto de partida.
- Enrutado de documentos y correos: asignar texto entrante a equipos, colas o buckets de prioridad definidos por ejemplos representativos, sin generar texto y con bajo coste por elemento.
- Investigacion cualitativa: aplicar un codebook definido por el analista a notas de entrevistas o comentarios abiertos, con revision humana de las asignaciones de baja confianza.
- Operaciones de contenido: agrupar titulares, listados, publicaciones o informes en categorias de moderacion, propiedad o tema para revisiones repetibles.
- Asignacion de taxonomia: mapear elementos cortos a un conjunto de etiquetas existente cuando se prefieren asignaciones repetibles frente a generacion libre.
- Agrupacion de casi duplicados: anadir caracteristicas lexicas en lotes donde el solapamiento de redaccion es una senal fuerte.
- Agrupacion privada o local: ejecutar encoder y scorer en local cuando no se desea enviar elementos a un servicio externo.
- Asistencia de etiquetado con humano en el bucle: proponer grupos para revision y reajustar el esquema con el conjunto de soporte corregido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ningun benchmark de velocidad y que la latencia real depende del hardware, el tamano de lote, la carga del modelo y el coste de embedding; en general, para casos de agrupacion con etiquetas ya definidas, esta ruta es mas rapida que pedir a un LLM que lea, razone y agrupe cada elemento, porque no genera texto y reutiliza un scorer cacheado por esquema.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Qwen3-1.7B y del tamano de lote.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el modelo base de 1.7B es de tamano reducido, pero no se detallan requisitos.
- Opciones de despliegue: instalacion del codigo Ottava via pip desde el repositorio GitHub (git+https://github.com/OscarVGit/ottava.git) y ejecucion de fit_and_predict.py; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card no reclama benchmark de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ottava-Few-Shot-Adapter | no disponible (base 1.7B) | no disponible | Scorer lineal sobre embeddings congelados | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-1.7B | 1.7B | no disponible | LLM generativo base | Apache-2.0 | Hugging Face |
| Alternativas de clasificacion few-shot con LLM | no disponible | no disponible | Generacion/razonamiento zero-shot | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo universal de agrupacion: cada esquema requiere su propio scorer ajustado y el checkpoint de ejemplo no debe reutilizarse con otro esquema.
- No descubre categorias desconocidas, no infiere el numero de grupos y no sigue criterios complejos sin ejemplos de soporte.
- No esta pensado para documentos largos ni para razonamiento abierto; un LLM suele ser mas flexible en casos zero-shot o no acotados.
- La model card limita el alcance a texto corto en ingles sin validacion; el soporte multilingue no esta confirmado.
- El checkpoint de ejemplo es un artefacto de carga y demostracion, no validado como clasificador de sentimiento en produccion.
- No debe usarse para decisiones criticas de seguridad, fusion automatica o programacion automatica.
- Riesgo de asignaciones erroneas en elementos ambiguos; se recomienda revision humana o modo sombra.
- No se detallan sesgos conocidos ni tasas de alucinacion (no aplica generacion de texto, pero si clasificacion incorrecta).
- Licencia Apache-2.0 para el adaptador y los scripts; debe revisarse la licencia del modelo base antes de redistribuir o usar comercialmente.

## Enlaces

- Hugging Face: https://huggingface.co/Oscar-veeee/Ottava-Few-Shot-Adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del codigo Ottava: https://github.com/OscarVGit/ottava.git
