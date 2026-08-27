# BrCamp/bee-350m-pt-agentico

## Resumen

El modelo BrCamp/bee-350m-pt-agentico es un adaptador LoRA desarrollado por BrCamp (Bruno Campidelli) sobre el modelo base BrCamp/bee-350m-pt-base, un modelo de lenguaje de 345,4 millones de parámetros preentrenado desde cero en portugués con un tokenizador propio de 32k. Este adaptador está especializado en la selección de herramientas (function calling) y la emisión de llamadas JSON en portugués, lo que lo convierte en un componente ligero y eficiente para construir asistentes agénticos en este idioma.

El modelo resuelve el problema de dotar a un modelo pequeño de capacidades de uso de herramientas sin necesidad de un ajuste fino completo, mediante LoRA. Se publican tres semillas (seed-42, seed-43 y seed-44) para permitir verificar la estabilidad del entrenamiento. Con un rendimiento medio del 82,6% en selección correcta de herramienta sobre un conjunto de validación de 536 casos con herramientas no vistas, demuestra que es posible lograr resultados útiles con un modelo de este tamaño.

La relevancia actual radica en la creciente demanda de asistentes conversacionales en portugués que puedan interactuar con APIs y servicios externos, y en la tendencia hacia modelos pequeños y eficientes que puedan ejecutarse en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base de 345M, posiblemente basado en Qwen3 según tags) + adaptador LoRA |
| Parametros totales | 345M (base) + parámetros LoRA (no especificados) |
| Parametros activos | 345M (todos activos, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (nativo), cuantizaciones adicionales no especificadas |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en BrCamp/bee-350m-pt-base, un modelo de 345,4 millones de parámetros preentrenado desde cero en portugués. Según los tags del modelo base, la arquitectura es similar a Qwen3, aunque no se detalla en la documentación del adaptador. El adaptador utiliza LoRA con r=16 y α=32, entrenado durante una época con una tasa de aprendizaje de 1,2e-3 y un batch efectivo de 16.

El entrenamiento se realizó sobre 11.160 ejemplos (6.739 con llamada a herramienta y 4.421 negativos), derivados del corpus GigaVerbo y otros conjuntos. La separación entre entrenamiento y prueba se hizo por componente conexo de todo lo compartido (petición o tupla de argumentos), con verificación posterior sobre los archivos finales. El hardware utilizado fue una RTX 5070 Laptop de 8 GB, con un tiempo de entrenamiento de aproximadamente 90 minutos por semilla.

Una innovación destacable es la diversificación de cadenas arbitrarias en el entrenamiento: se sustituyeron los 22 valores distintos de direcciones de correo (con una dominancia del 47% de un solo valor) por 868 direcciones inéditas, lo que mejoró la copia de correos inéditos del 41,7% al 53,7% (McNemar p=0,0024).

## Capacidades

- Selección de herramientas de un catálogo (de 1 a 6 herramientas) y emisión de la llamada en formato JSON.
- Generación de texto en portugués con formato de chat (plantilla de chat aplicada).
- Soporte de function calling / tool use específico para portugués.
- Capacidad de responder en texto normal cuando ninguna herramienta es adecuada (casos negativos).
- No se reportan capacidades de razonamiento complejo, visión, audio ni otras modalidades.

## Casos de uso

- Atención al cliente automatizada en portugués: el modelo puede gestionar conversaciones multi-turno y seleccionar herramientas como envío de correos, consulta de bases de datos o creación de tickets, emitiendo llamadas JSON estructuradas.
- Asistentes virtuales para empresas brasileñas o lusófonas: integración con APIs internas mediante function calling, permitiendo que el asistente realice acciones como agendar reuniones o enviar mensajes.
- Automatización de tareas de back-office: el modelo puede interpretar peticiones en lenguaje natural y ejecutar acciones sobre sistemas externos, reduciendo la intervención manual.
- Prototipado rápido de agentes conversacionales: gracias a su pequeño tamaño y bajo coste de inferencia, es adecuado para pruebas de concepto y entornos con recursos limitados.
- Educación e investigación en procesamiento de lenguaje natural en portugués: sirve como punto de partida para estudiar el ajuste fino de modelos pequeños para tareas de tool use.
- Despliegue en dispositivos edge o entornos con restricciones de hardware: al ser un modelo de 345M con un adaptador LoRA, puede ejecutarse en GPUs de consumo o incluso en CPU con cuantización.

## Benchmarks y rendimiento

El modelo se evaluó sobre un holdout de 536 casos con herramientas no vistas en el entrenamiento (separación por raíz semántica), con catálogos de 1 a 6 herramientas y posición de la correcta sorteada. Los resultados por semilla y la media son:

| Métrica | seed-42 | seed-43 | seed-44 | Media |
|---|---|---|---|---|
| Herramienta correcta | 80,0% | 84,1% | 83,8% | 82,6% |
| Ejecutó y cumplió | 70,1% | 74,4% | 74,6% | 73,1% |
| Over-calling (llamó cuando no debía) | 17,5% | 16,0% | 18,3% | 17,3% |

La desviación estándar entre semillas es de 2,53 puntos porcentuales, del mismo orden que el error muestral esperado (1,92 pp), lo que indica que no hay varianza anómala de entrenamiento. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 345M parámetros; en bfloat16 ocupa aproximadamente 690 MB, más el adaptador LoRA (tamaño del repo 0,1 GB). Cabe en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 5070 Laptop). El entrenamiento se realizó en una RTX 5070 Laptop de 8 GB.
- Compatibilidad con consumer GPU: sí, es un modelo muy ligero.
- Opciones de despliegue: al ser un modelo de la familia Transformers con PEFT, puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (con conversión) o directamente con transformers.
- Latencia y throughput: no se han publicado mediciones específicas, pero por el tamaño se espera una latencia baja (del orden de decenas de milisegundos por token en GPU moderna).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para function calling en portugués con este tamaño. Como referencia, se puede comparar con el modelo base sin el adaptador:

| Modelo | Parámetros | Contexto | Function calling | Licencia |
|---|---|---|---|---|
| BrCamp/bee-350m-pt-base | 345M | no disponible | No | Apache-2.0 |
| BrCamp/bee-350m-pt-agentico | 345M + LoRA | no disponible | Sí (portugués) | Apache-2.0 |

No se han encontrado otros adaptadores LoRA para function calling en portugués con características similares en la información disponible.

## Limitaciones y advertencias

- El catálogo de herramientas se limita a un máximo de 6 durante el entrenamiento; catálogos mayores son extrapolación y el rendimiento puede degradarse.
- El holdout contiene solo un 0,5% de casos con correo electrónico, por lo que la copia de cadenas densas en peticiones naturales está poco medida.
- Los argumentos de texto libre (asunto, cuerpo de mensaje, título) no entran en el escore de evaluación, por lo que la calidad de estos campos no está garantizada.
- El over-calling (llamar a una herramienta cuando no se debe) ocurre en un 17,3% de los casos, lo que puede generar acciones no deseadas en producción.
- El token de parada debe configurarse correctamente (eos_token_id apuntando a <|im_end|>); de lo contrario, la generación se alarga y el parser recibe múltiples llamadas concatenadas.
- La decodificación restringida al esquema (forzar que la clave del argumento provenga del catálogo) mejora el rendimiento en +16,4 pp, pero restringir el valor empeora el resultado (−9,0 pp y −15,8 pp en dos versiones probadas).
- Al ser un modelo pequeño, puede presentar alucinaciones y sesgos propios de modelos de este tamaño, aunque no se han documentado específicamente.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y de los datos de entrenamiento.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/BrCamp/bee-350m-pt-agentico
- HuggingFace del modelo base: https://huggingface.co/BrCamp/bee-350m-pt-base
- Repositorio GitHub con código, datos y reporte: https://github.com/brcampidelli/llm-ptbr
- Dataset GigaVerbo: https://huggingface.co/datasets/TucanoBR/GigaVerbo
- Página del modelo base en FriendliAI: https://friendli.ai/models/BrCamp/bee-350m-pt-base
- Página del gemelo experimental: https://friendli.ai/models/BrCamp/bee-350m-pt-base-15b
