# chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF

## Resumen

Jev-Style-Qwen3.5-2B-Decision es un modelo de decisión y clasificación de texto afinado a partir de Qwen/Qwen3.5-2B-Base por Chaoliang Yan (chaoliangUNSW). No es un modelo generativo al uso: recibe un estado, una pregunta y una lista de opciones, y devuelve la opción elegida junto con probabilidades calibradas extraídas de una única posición de token. Está pensado para tareas de enrutamiento, clasificación y puntuación de alternativas fijas donde se necesita una probabilidad fiable más que texto libre.

Esta ficha cubre la versión v1, publicada el 21 de septiembre de 2026 y archivada por el autor. La release recomendada actualmente es la 2B v4 (texto e imágenes) y, para texto ligero, la 0.8B v3. La v1 se mantiene únicamente por compatibilidad con integraciones existentes y solo funciona a través del cliente incluido en este repositorio; el paquete `jev-style` no la carga.

El modelo tiene 1.942.653.248 parámetros, licencia Apache 2.0, soporte exclusivo de inglés y se distribuye en formato GGUF con cuantizaciones Q4_K_M, Q8_0 y BF16. Su interés técnico reside en la calibración: reporta un error de calibración esperado (ECE) de 0.017 sobre 1.500 ejemplos retenidos, frente a 0.065 del modelo base en zero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-2B-Base); cabecera de decisión sobre una posición de token |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para la v1 (la v4 hospedada usa 8.192 tokens, dato no aplicable a esta versión) |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 (GGUF); build MLX bf16 en repositorio aparte |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF; MLX bf16 en repositorio separado |
| Tarea (pipeline) | text-classification |
| Modelo base | Qwen/Qwen3.5-2B-Base |
| Tamano del repositorio | 7,3 GB |
| Descargas / likes | 16.217 / 37 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base, un transformer decoder-only de aproximadamente 1,94 mil millones de parámetros, y se afina para una tarea de decisión restringida: dado un estado, una pregunta y un conjunto de opciones (hasta 26 letras según la model card de la v1), el modelo produce la decisión leyendo las probabilidades en una única posición de token. La salida no es texto generado, sino una distribución calibrada sobre las opciones.

El ajuste se realizó sobre datasets de clasificación y comprensión: nyu-mll/glue, fancyzhx/ag_news, google/boolq y SetFit/sst5. El autor indica que la v1 no utilizó salidas de Jev (a diferencia de la v4, entrenada en parte con etiquetas suaves destiladas de TypeSafe Jev 1.14 vía API pública). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO. La innovación destacable es la calibración de las probabilidades sin post-procesado: las probabilidades se usan tal cual las producen los pesos liberados.

## Capacidades

- Clasificación de texto con etiquetas fijas: devuelve la opción elegida y su probabilidad calibrada.
- Puntuación de alternativas: asigna probabilidad a cada opción de una lista cerrada.
- Decisiones de tipo sí/no y de elección múltiple sobre estados y preguntas.
- Enrutamiento y triaje: selección de una ruta o categoría entre un conjunto predefinido.
- Probabilidades calibradas utilizables directamente como umbrales de confianza.
- Ejecución local en LM Studio y llama.cpp mediante el cliente incluido en el repositorio.
- Capacidad multilingüe: no (solo inglés en esta versión).
- Tool calling, agentes, visión, audio y modo thinking: no disponibles en esta versión.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado, una pregunta de clasificación y la lista de colas disponibles, y devuelve la cola con una probabilidad calibrada que permite derivar a revisión humana cuando la confianza es baja.
- Moderación por categorías: clasificación de contenido en un conjunto cerrado de etiquetas (por ejemplo, ag_news o SST-5) con umbrales de confianza fiables gracias al ECE de 0.017.
- Triaje en pipelines de datos: etiquetado automático de grandes volúmenes de texto en LM Studio o llama.cpp, con la variante Q4_K_M de 1,3 GB para despliegues con recursos limitados.
- Puerta de decisión en sistemas RAG: decidir si una consulta requiere recuperación externa o puede responderse directamente, usando la probabilidad de la opción como señal de confianza.
- Clasificación de sentimiento y análisis de opiniones: uso directo sobre SST-5 (el autor reporta una mejora de 32,0% a un valor superior en esta tarea) para análisis de reseñas.
- Inferencia de intención en asistentes conversacionales: mapear la última intervención del usuario a una de las intenciones predefinidas del sistema antes de invocar la lógica de negocio.
- Validación de formularios y documentos: decisiones de tipo sí/no sobre si un texto cumple un criterio (por ejemplo, si una descripción contiene la información requerida), con probabilidad asociada para auditoría.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre datos retenidos, con las probabilidades tal cual las producen los pesos:

| Metrica | Qwen3.5-2B-Base zero-shot | Jev-Style 2B v1 |
|---|---|---|
| Precision, 5 tareas de decision (1.500 ejemplos retenidos) | 65,9% | 82,3% |
| Error de calibracion (ECE) en esas tareas | 0,065 | 0,017 |
| NLL / Brier score | 0,786 / 0,446 | 0,418 / 0,242 |
| ECE en tipos de tarea no vistos en entrenamiento | 0,155 | 0,075 |
| Latencia por decision (M1 Max, MLX bf16) | 76 ms | 77 ms |

Precisión por cuantización sobre 500 ejemplos retenidos y coincidencia de decisión con bf16:

| Fichero | Tamano | Misma decision que bf16 | Precision (500 retenidos) |
|---|---|---|---|
| Q4_K_M | 1,3 GB | 94,4% | 82,4% |
| Q8_0 | 2,1 GB | 99,4% | 81,6% |
| BF16 | 3,9 GB | 99,8% | 81,6% |

Mejoras por tarea citadas en la model card: MNLI 52,3% -> 86,7%; SST-5 32,0% -> (valor truncado en la información disponible). El autor señala además que un ECE de 0,017 sobre 1.500 ejemplos es estadísticamente indistinguible de una calibración perfecta (percentil 95 de 0,025 por ruido de muestreo).

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB para Q4_K_M, 2,1 GB para Q8_0 y 3,9 GB para BF16 (tamaños de fichero; añadir overhead del runtime).
- Cabe en GPU de consumo: sí, cualquier GPU con 4 GB o más de VRAM para Q4_K_M; 6 GB o más para Q8_0.
- GPU recomendadas: RTX 3060/4060 y superiores para cuantizaciones GGUF; A100/H100 no son necesarias dado el tamaño. En Apple Silicon existe build MLX bf16.
- Despliegue: LM Studio y llama.cpp (soporte oficial de esta versión mediante el cliente del repositorio); el paquete `jev-style` y el snippet "Use this model" del Hub no aplican a la v1. vLLM y TGI no están indicados en la información disponible.
- Latencia: 77 ms por decisión en M1 Max con MLX bf16, sin coste adicional frente al modelo base (76 ms).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (decisiones) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Style 2B v1 (este) | 1,94B | no disponible | 82,3% (1.500 retenidos) | Apache 2.0 | GGUF en HF; cliente propio |
| Jev-Style 0.8B v3 | 0,8B | 25.600 tokens | 79,2% (2.000 decisiones tipadas) | no disponible en la informacion | GGUF de 0,53 GB; paquete `jev-style` |
| Jev-Style 2B v4 | no disponible | 8.192 tokens (servicio hospedado) | no disponible | no disponible en la informacion | Texto e imagenes; paquete `jev-style` |
| Qwen3.5-2B-Base (base) | 1,94B | no disponible | 65,9% zero-shot | no disponible en la informacion | Pesos base en HF |

La comparativa con modelos de clasificación de propósito general (por ejemplo, clasificadores tipo SetFit o BERT afinados) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Versión archivada: el autor recomienda migrar a la 2B v4 o a la 0.8B v3; la v1 solo se mantiene por compatibilidad.
- Solo inglés: no soporta otros idiomas, pese a que la v3 declara 51 idiomas.
- No es un modelo generativo: no produce texto libre, solo decisiones sobre opciones predefinidas.
- Límite de opciones: la v1 está limitada a 26 opciones (letras); la v3 elimina esta restricción (probada con 77 opciones).
- Dependencia de cliente: requiere el cliente incluido en el repositorio; el paquete `jev-style` no carga esta versión.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en dominios alejados de los datos de entrenamiento (GLUE, ag_news, boolq, sst5).
- Sesgos: no se documentan sesgos específicos en la información disponible; al derivar de Qwen3.5-2B-Base, puede heredar los sesgos del corpus de entrenamiento del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no declara afiliación con TypeSafe ni respaldo alguno.
- Calibración fuera de distribución: el ECE en tipos de tarea no vistos sube a 0,075, cinco veces el de las tareas de entrenamiento; conviene validar umbrales en el dominio propio.
- Capacidad del servicio hospedado: sin cuota fija por cuenta, pero con capacidad compartida y respuestas 429 con `Retry-After`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Version v2: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF
- Version 0.8B v3: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-GGUF
- Version 2B v4: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4
- Build MLX bf16: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-MLX-bf16
- Demo en vivo (texto e imagen): https://huggingface.co/spaces/chaoliangUNSW/jev-style-2b
- Sitio del proyecto: https://jevstyle.com/models/
- Guia de instalacion local: https://jevstyle.com/guides/run-locally/
- Guia de clasificacion de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Guia de modelos de decision locales y Apple silicon: https://jevstyle.com/guides/local-decision-models/
- Casos de uso de vision local: https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de enrutamiento bancario: https://jevstyle.com/benchmarks/banking-routing/
- Estado del servicio hospedado: https://jevstyle.com/api/#service-status
- Health check de la API: https://api.jevstyle.com/healthz
