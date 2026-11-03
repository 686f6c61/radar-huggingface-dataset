# pra40109/Llama-Garvit-1.0

## Resumen

Llama-Garvit-1.0 es un adaptador LoRA construido sobre Llama Guard 3 1B, el modelo de clasificacion de seguridad de Meta, y publicado por el usuario pra40109 en HuggingFace. Su funcion es evaluar una linea de contenido dirigida a ninos de entre 4 y 12 anos y responder `safe` o `unsafe` seguido de las categorias de su propia politica de seguridad infantil (C1-C10), que sustituye a las categorias nativas S1-S14 de Llama Guard. El modelo se distribuye como adaptador PEFT sobre el modelo base congelado, con 11,3 millones de parametros entrenables (0,75 % de los 1,51B del modelo base).

El modelo es explicitamente experimental y se presenta como un proyecto de aprendizaje. El autor advierte que solo se ha probado con datos procedentes de las mismas fuentes usadas en el entrenamiento, que nunca ha visto una linea insegura en japones y que cuatro de sus diez categorias no aparecen en los datos de entrenamiento. A pesar de declarar soporte para ingles y japones, la cobertura real del japones es nula segun la propia model card.

Su relevancia es limitada: no es un modelo de proposito general sino un clasificador de moderacion de contenido infantil de nicho, con cero descargas y un unico like en el momento de la consulta. Resulta util como referencia tecnica de como adaptar un guardrail existente a una politica de seguridad especifica mediante LoRA de bajo rango, pero no como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Llama Guard 3 1B) |
| Parametros totales | 1,51B (modelo base) + 11,3M entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; la model card no la especifica) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base admite las cuantizaciones habituales de Llama) |
| Idiomas soportados | en, ja (segun metadatos; el japones no tiene cobertura real segun el autor) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base meta-llama/Llama-Guard-3-1B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama Guard 3 1B, un transformer decoder-only de Meta con 1,51B parametros en bfloat16 y congelado durante el entrenamiento. El LoRA usa rango 16, alpha 32 y dropout 0,05, aplicado a las proyecciones q, k, v, o, gate, up y down de todos los bloques, lo que suma 11,3M parametros entrenables. El entrenamiento consistio en 1 epoch (319 pasos) con batch 8, AdamW, learning rate 2e-4 con 10 % de warm-up y decaimiento coseno, clipping de gradiente 1.0 y gradient checkpointing. La perdida se calcula solo sobre los tokens de respuesta, enmascarando el prompt. Se ejecuto en una unica GPU de 24 GB (L4 o A10G) en Modal durante unos 6 minutos.

Los datos son 2.552 lineas escritas por humanos y procedentes de fuentes publicas (1.665 seguras y 887 inseguras), en ingles y japones. Cada linea se etiqueto mapeando las etiquetas de la fuente original a las categorias C1-C10 del autor. Aproximadamente una de cada cinco obras o filas se reservo para test, manteniendo libros completos en un solo lado de la particion. La model card no detalla el numero total de tokens de entrenamiento ni la composicion completa del dataset (la tabla de fuentes aparece truncada en la informacion disponible).

## Capacidades

- Clasificacion binaria de seguridad (`safe` / `unsafe`) de una unica linea de contenido.
- Asignacion de categorias de violacion de una politica infantil propia (C1-C10): datos personales, secretos y desconocidos, contenido violento o aterrador, peligros imitables, cuerpos y temas privados, insultos, tristeza y autolesion, dinero y enganos, temas de adultos y preocupaciones corporales o alimentarias.
- Salida de una puntuacion continua de 0 a 1 comparando las probabilidades del primer token de respuesta entre `unsafe` y `safe`.
- Procesamiento de contenido en ingles (y, teoricamente, japones, aunque sin cobertura real).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto general: es un clasificador de una sola pasada.

## Casos de uso

- Moderacion de contenido en plataformas infantiles: el modelo puede evaluar linea a linea los mensajes de un chat o foro dirigido a ninos de 4 a 12 anos y marcar los que violan la politica C1-C10, aprovechando que la salida incluye la categoria concreta para enrutar la revision.
- Filtrado previo en aplicaciones de mensajeria para menores: integrado como paso de preprocesado antes de mostrar un mensaje, permite bloquear solicitudes de datos personales (C1) o intentos de llevar la conversacion a otra app (C2).
- Deteccion de contenido peligroso imitable: la categoria C4 (fuego, cuchillos, medicamentos, retos online) permite marcar instrucciones que un nino podria copiar, un caso que los guardrails genericos no cubren con esta granularidad.
- Analisis de corpus de libros y materiales infantiles: el modelo puede etiquetar lineas de un corpus ya clasificado por fuente para auditar la adecuacion por edad, tal como se uso en su propio entrenamiento.
- Investigacion sobre politicas de seguridad: sirve como ejemplo reproducible de como adaptar Llama Guard a una taxonomia propia mediante LoRA de rango 16 en una sola GPU de 24 GB y en minutos.
- Prototipado de clasificadores de seguridad de nicho: el pipeline (prompt fijo + adaptador + comparacion de probabilidades) es reutilizable para construir otros guardrails con categorias a medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bfloat16 ocupa aproximadamente 3 GB; con el adaptador LoRA el consumo adicional es minimo (11,3M parametros). En cuantizacion de 8 bits cabria en torno a 1,5-2 GB y en 4 bits alrededor de 1 GB, aunque la model card no documenta cuantizaciones probadas.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas es suficiente para el modelo base en bfloat16; el autor entreno en una L4 o A10G de 24 GB.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, 4060, 4070 o superiores.
- Opciones de despliegue: transformers + peft (el metodo documentado), y previsiblemente vLLM o TGI con soporte de adaptadores LoRA, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles. El entrenamiento completo duro unos 6 minutos en una GPU de 24 GB, pero no se aportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Llama-Garvit-1.0 | 1,51B + 11,3M (LoRA) | no disponible | en, ja | llama3.2 | Politica infantil C1-C10 sobre Llama Guard 3 1B |
| Llama Guard 3 1B | 1,51B | no disponible | multilingue | llama3.2 | Politica generica S1-S14 de Meta |
| Llama Guard 3 8B | 8B | no disponible | multilingue | llama3.2 | Politica generica S1-S14, mayor capacidad |
| ShieldGemma (2B/9B) | 2B / 9B | no disponible | en | Gemma | Moderacion generica de contenido |

La comparativa se limita a la familia de guardrails de Meta y Google; no se dispone de datos de rendimiento comparativo para Llama-Garvit-1.0.

## Limitaciones y advertencias

- Estado experimental: el autor indica explicitamente que no debe usarse para proteger a ninos reales.
- Solo se ha probado con datos de las mismas fuentes del entrenamiento; no hay evidencia de generalizacion.
- Nunca ha visto una linea insegura en japones: el soporte de japones declarado en los metadatos no es real.
- Cuatro de las diez categorias (C1-C10) no aparecen en los datos de entrenamiento, por lo que su deteccion no esta validada.
- Riesgo de alucinacion y de falsos negativos en contenido que no se parezca a las fuentes de entrenamiento.
- El prompt debe ser exactamente el usado en entrenamiento; cualquier variacion puede degradar la salida.
- Requiere aceptar la licencia de Llama 3.2 y el acceso al modelo base restringido de Meta.
- Licencia llama3.2: impone restricciones de uso comercial y obligaciones de atribucion propias de la licencia de Meta.
- Cero descargas y un unico like: sin validacion por parte de la comunidad.
- No es un modelo de proposito general: no genera texto, no razona y no soporta agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pra40109/Llama-Garvit-1.0
- Modelo base Llama Guard 3 1B: https://huggingface.co/meta-llama/Llama-Guard-3-1B
