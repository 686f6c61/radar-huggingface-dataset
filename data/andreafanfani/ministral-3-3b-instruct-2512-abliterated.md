# andreafanfani/Ministral-3-3B-Instruct-2512-abliterated

## Resumen

Ministral-3-3B-Instruct-2512-abliterated es un ajuste fino del modelo mistralai/Ministral-3-3B-Instruct-2512, publicado por el usuario andreafanfani en Hugging Face. Se trata de una variante "abliterated" (también etiquetada como "uncensored" o "decensored"), es decir, un modelo al que se le ha aplicado una técnica de edición de pesos para eliminar o atenuar los mecanismos de rechazo aprendidos durante el alineamiento, de modo que responda a peticiones que el modelo base tendería a declinar. La técnica empleada se enmarca en el ecosistema Heretic, una herramienta de código abierto para realizar abliteration de forma reproducible.

El modelo conserva la arquitectura Mistral 3 del modelo base, con aproximadamente 3.849 millones de parámetros en formato safetensors, y está pensado para inferencia con vLLM. Mantiene el soporte multilingüe del modelo original (inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe) y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 7,7 GB y el acceso está restringido: es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

Su relevancia es doble. Por un lado, interesa a investigadores que estudian el alineamiento y la robustez de los mecanismos de seguridad en modelos pequeños. Por otro, atrae a desarrolladores que necesitan un modelo de 3B sin filtros de contenido para tareas creativas, roleplay o generación de texto sin restricciones temáticas. Conviene subrayar que la eliminación de rechazos no elimina los sesgos ni la tendencia a la alucinación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral 3; formato mistral-common) |
| Parametros totales | 3.849.090.048 (~3,85B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; compatible con cuantizacion posterior via vLLM/llama.cpp) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria vLLM) |

## Arquitectura y entrenamiento

El modelo parte de mistralai/Ministral-3-3B-Instruct-2512, un transformer decoder-only de la familia Mistral 3 con unos 3,85 mil millones de parametros. Sobre esa base se ha aplicado una edicion de pesos orientada a la abliteration: se identifican las direcciones del espacio de activaciones asociadas a la negativa a responder y se proyectan fuera de los pesos, de forma que el modelo pierde parte de su comportamiento de rechazo sin reentrenar desde cero. El autor etiqueta el proceso como "reproducible" y lo vincula a Heretic, lo que sugiere que la receta de edicion esta documentada y puede replicarse.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si hubo fases de RLHF o DPO mas alla del alineamiento propio del Instruct original. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada. Cabe asumir que la edicion abliterated no altera la arquitectura ni el tokenizador, solo un subconjunto de pesos.

## Capacidades

- Generacion de texto instructiva en once idiomas, heredada del modelo base Ministral-3-3B-Instruct.
- Razonamiento de proposito general y respuesta a instrucciones multi-turno.
- Generacion de codigo y matematicas a nivel de modelo de 3B (sin datos de benchmark publicados).
- Respuesta a peticiones que el modelo base rechazaria, gracias a la eliminacion de los mecanismos de refusal.
- Compatibilidad con el ecosistema mistral-common y despliegue en vLLM.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como caso de estudio para medir cuanto cambia la tasa de rechazos tras la abliteration respecto al Instruct original, comparando respuestas sobre el mismo conjunto de prompts.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o roleplay donde el modelo base tenderia a declinar escenas violentas o adultas; el tamano de 3B permite ejecutarlo en hardware modesto.
- Prototipado rapido de asistentes conversacionales: con 3,85B de parametros y despliegue en vLLM, se puede levantar un endpoint de chat en una sola GPU consumer para pruebas de UX.
- Traduccion y generacion multilingue: al cubrir once idiomas (incluido espanol), es util para borradores de contenido en varios idiomas, aunque sin garantias de calidad equivalentes a modelos mayores.
- Generacion de codigo en entornos controlados: para autocompletado o scripts auxiliares en pipelines internos, con la advertencia de revisar siempre la salida por el riesgo de alucinacion.
- Fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors, sirve como base para ajustes especificos de dominio cuando se necesita un modelo pequeno y sin filtros de contenido.
- Analisis de robustez de filtros: util para equipos de seguridad que quieran estudiar que tipos de contenido dejan de bloquearse y disenar contramedidas en sus propios sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 7,7 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, 10-12 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4-5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2-2,5 GB de pesos, lo que lo hace viable en GPUs consumer de 8 GB o incluso 6 GB con contexto reducido.
- GPU recomendadas: A100, H100 o L40S para produccion con vLLM y concurrencia; RTX 4090, 4080, 3090 o 3060 de 12 GB para uso individual.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, especialmente con cuantizacion.
- Opciones de despliegue: vLLM (libreria declarada en el repo), llama.cpp/Ollama y TGI mediante conversion de pesos, aunque no se documenta en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512-abliterated (este) | ~3,85B | no disponible | Apache 2.0 | Variante sin refusal, acceso restringido |
| mistralai/Ministral-3-3B-Instruct-2512 (base) | ~3,85B | no disponible | Apache 2.0 | Modelo original alineado, con filtros de contenido |
| Otros modelos abliterated de ~3B (p. ej. Llama-3.2-3B abliterated) | ~3B | no disponible | depende del linaje | Alternativas de la misma practica; rendimiento no comparable sin datos |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La abliteration elimina o reduce los rechazos, pero no corrige los sesgos del modelo base ni la tendencia a la alucinacion; es probable que estos problemas se mantengan o incluso se amplifiquen al no haber filtros de seguridad.
- Riesgo elevado de generar contenido danino, ofensivo o inexacto sin advertencia; no es adecuado para aplicaciones de cara al publico sin moderacion externa.
- La calidad en idiomas distintos del ingles puede degradarse respecto al modelo base, y no hay evaluaciones publicadas por idioma.
- Contexto maximo no documentado en la informacion proporcionada; conviene verificar la configuracion del modelo base antes de disenar aplicaciones con prompts largos.
- El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face y cumplir los terminos de uso.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante abliterated puede entrar en conflicto con politicas de plataformas, tiendas de aplicaciones o normativa sectorial; conviene revisar el marco legal aplicable.
- Modelo de 3,85B: capacidad limitada para razonamiento complejo, matematicas avanzadas y tareas de agente largas en comparacion con modelos de 7B o superiores.
- No hay informacion sobre tool calling ni capacidades de agente; no asumir su disponibilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andreafanfani/Ministral-3-3B-Instruct-2512-abliterated
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Paper referenciado (arXiv:2601.08584): https://arxiv.org/abs/2601.08584
- Heretic (herramienta de abliteration): no disponible en la informacion proporcionada
- mistral-common (libreria de tokenizacion): no disponible en la informacion proporcionada
