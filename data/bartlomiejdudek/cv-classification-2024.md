# bartlomiejdudek/cv-classification-2024

## Resumen

El repositorio `bartlomiejdudek/cv-classification-2024` es una implementación propia y compacta en PyTorch de la arquitectura Blip orientada a tareas de clasificación. Lo publica el usuario bartlomiejdudek bajo licencia Apache 2.0, con etiquetas `safetensors`, `blip`, `pytorch` y `classification`, y con una configuración declarada como "small". El interés del artefacto no está en su rendimiento, sino en su naturaleza: se trata de un esqueleto de código reproducible para revisión, pruebas de humo y experimentos controlados de pequeño tamaño.

El dato más relevante es el recuento real de parámetros del checkpoint safetensors: 24.832 parámetros en total, aproximadamente 0,025 M. Es decir, tres órdenes de magnitud por debajo de cualquier modelo de visión-lenguaje utilizable en producción. La model card es explícita al respecto: `model.safetensors` es "un checkpoint de inicialización válido para pruebas de humo" y "no se presenta como un checkpoint entrenado con benchmarks". No se reclama ninguna puntuación de benchmark en el repositorio.

Por tanto, la ficha debe leerse como la de un andamiaje de investigación y no como la de un modelo desplegable. No hay pesos entrenados publicados, no hay idiomas declarados ni evaluación empírica. Su utilidad práctica se limita a servir de plantilla de código para montar pipelines de clasificación multimodal con fusión por co-atención, y a verificar que el flujo de carga de safetensors y de configuración funciona antes de escalar a un entrenamiento real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Blip (implementación propia en PyTorch), fusión por co-atención |
| Parámetros totales | 24.832 (dato real del checkpoint safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización, no entrenado) |

Detalles adicionales declarados en la model card: escala "small", atención de tipo flash, función de activación GELU y normalización GroupNorm. El repositorio incluye `run.py` (artefacto principal con el modelo y el punto de entrada de ejemplo o de entrenamiento), `config.json` (arquitectura generada), `training_args.json` (receta de experimento por defecto), `README.md` y `model.safetensors`. El tamaño del repo es de 0,0 GB y las fechas de creación y actualización registradas son el 5 de octubre de 2026.

## Arquitectura y entrenamiento

La arquitectura sigue el patrón Blip: un codificador visual y un codificador de texto cuyas representaciones se combinan mediante co-atención, con normalización GroupNorm y activación GELU. La atención es de tipo flash según la configuración declarada. Al tratarse de una implementación personalizada, la model card advierte que las API genéricas de carga automática requieren un adaptador explícito antes de poder usarse, es decir, no basta con `AutoModel.from_pretrained` sin registrar previamente la clase correspondiente.

No hay entrenamiento documentado. La receta por defecto del repositorio usa SGD con un scheduler OneCycle, pero el propio autor aclara que son "valores de partida en el script, no evidencia de una ejecución completada". No se especifica número de tokens, composición del dataset, ni fases de ajuste como RLHF o DPO. Tampoco consta que se haya aplicado ningún proceso de alineación. La guía de evaluación propuesta por el autor es genérica: usar una partición etiquetada específica de la tarea, reportar la métrica en al menos tres semillas e incluir una línea base de capacidad equivalente.

## Capacidades

- No se declara ninguna capacidad funcional verificada. El checkpoint es una inicialización, no un modelo entrenado, por lo que no cabe esperar clasificaciones correctas.
- Clasificación multimodal (texto e imagen) como objetivo arquitectónico del código, sin pesos que lo respalden.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidad especial destacable: ninguna. El valor del repositorio es el código, no los pesos.

## Casos de uso

- Pruebas de humo de infraestructura: el checkpoint permite verificar que la carga de safetensors, la lectura de `config.json` y el registro de la clase personalizada funcionan en el entorno antes de invertir en un entrenamiento real.
- Plantilla de código para clasificación multimodal: sirve como punto de partida para implementar co-atención entre modalidades en un proyecto propio, reutilizando la estructura de `run.py`.
- Revisión de código en equipos de investigación: al ser compacto y autocontenido, es adecuado para auditar decisiones de diseño (activación, normalización, tipo de atención) sin la complejidad de un modelo grande.
- Reproducción de experimentos controlados: el repositorio incluye `training_args.json` con una receta por defecto, lo que facilita montar comparativas con presupuesto de ajuste y semillas equivalentes.
- Docencia y formación: el reducido número de parámetros permite trazar el flujo completo de datos y gradientes sin necesidad de GPU dedicada.
- Base para escalado: una vez validado el código, sustituir la configuración "small" por una mayor y entrenar sobre datos propios, manteniendo la misma interfaz.
- No es adecuado para ninguno de los casos de uso de producción habituales (atención al cliente, generación de código, análisis documental, moderación de contenido), porque no existen pesos entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No benchmark score is claimed in this repository". Cualquier cifra que se atribuyese a este repositorio sería inventada.

## Requisitos de hardware

- VRAM para pesos en fp32: aproximadamente 0,1 MB (24.832 parámetros × 4 bytes ≈ 97 KB).
- VRAM para pesos en fp16/bf16: aproximadamente 0,05 MB (≈ 48,5 KB).
- GPU recomendada: ninguna en particular. El modelo cabe en CPU sin problema; cualquier GPU consumer (incluso integradas) es más que suficiente.
- Cabe en cualquier GPU consumer: sí, con enorme holgura. El cuello de botella real es la memoria de activaciones y el pipeline de datos, no los pesos.
- Opciones de despliegue: al ser una implementación personalizada, no se documenta compatibilidad con vLLM, TGI o llama.cpp. La vía indicada por el autor es ejecutar `python run.py` y usar un adaptador explícito para las API genéricas. Ollama no es aplicable.
- Latencia y throughput estimados: no disponibles. No tiene sentido medirlos sobre un checkpoint sin entrenar.

## Comparativa con modelos similares

No disponible. La comparación con alternativas de la misma categoría (por ejemplo, BLIP o CLIP en sus variantes publicadas) no es significativa, ya que este repositorio distribuye una inicialización de 24.832 parámetros sin entrenamiento, sin benchmarks y sin idiomas declarados, mientras que esas alternativas son checkpoints entrenados a gran escala con evaluaciones publicadas. Cualquier tabla comparativa de rendimiento carecería de base empírica.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Las salidas no son fiables para ninguna tarea real.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según reconoce la propia model card.
- Riesgo de alucinación: no evaluable, porque no hay un modelo entrenado sobre el que medirlo.
- Sesgos conocidos: no disponibles. No se ha realizado ninguna caracterización de sesgos.
- Limitaciones de contexto e idioma: no disponibles; no se declara ventana de contexto ni cobertura lingüística.
- Restricciones de licencia: Apache 2.0 permite uso comercial del código y de los pesos, pero la model card advierte de que deben revisarse por separado los términos de los datos de origen si se usa el repositorio con conjuntos de datos externos.
- Caveat de producción: cualquier resultado obtenido con un futuro checkpoint entrenado debe documentarse de forma separada a los valores por defecto que se distribuyen aquí; mezclar ambos sería engañoso.
- Integración: al ser una implementación personalizada, las API automáticas de Hugging Face no cargarán el modelo sin un adaptador explícito.

## Enlaces

- HuggingFace: https://huggingface.co/bartlomiejdudek/cv-classification-2024
- No se han encontrado en la búsqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a publicidad de plantillas de currículum y a rankings genéricos de LLM (llmboard.ai, artificialanalysis.ai, modelcap.ai, aicodingdaily.com), sin relación con este repositorio.
