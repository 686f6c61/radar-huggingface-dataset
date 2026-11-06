# eval-apply/silvann_tq_D8_qwen_image_2.1

## Resumen

silvann_tq_D8_qwen_image_2.1 es un empaquetado cuantizado del modelo de generación de imágenes Qwen-Image-2.1 de Alibaba Qwen, adaptado por eval-apply para su motor de inferencia SiLVANN (Eval-Apply GPU Interpreter y su librería de redes neuronales). El paquete reduce el transformador de difusión y el codificador de texto (Qwen3-VL) a 8 bits por matriz mediante la técnica TurboQuant, con escalas por fila y una rotación Hadamard con signos por bloques a lo largo del eje de entrada. El resultado ocupa 17,5 GB frente a los 31 GB del modelo original, manteniendo el VAE, el procesador y el scheduler tal y como los distribuye Qwen.

El modelo hereda la tarea text-to-image del original y se distribuye bajo la licencia Qwen Research, lo que restringe su uso a investigación y evaluación. Es relevante ahora porque representa uno de los primeros empaquetados de un modelo de difusión de gran tamaño para un motor alternativo a diffusers, y porque anticipa la integración del modelo como herramienta de generación de imágenes dentro de los modelos de texto de SiLVANN, mediante la llamada `(image "…")`.

No se dispone de información sobre el número de parámetros del modelo base ni sobre la longitud de contexto del codificador de texto en la documentación proporcionada. Las versiones públicas del motor SiLVANN todavía no ejecutan este paquete: el autor indica que la integración está en desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador de difusión (base Qwen-Image-2.1) con codificador de texto Qwen3-VL y VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits por matriz (TurboQuant, escala por fila, rotación Hadamard con signos por bloques); últimas cuatro capas del codificador y todas las normas en precisión exacta |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License Agreement); uso comercial requiere licencia de Qwen |
| Formato de pesos | safetensors, compatible con diffusers (`QwenImage21Pipeline`) |

## Arquitectura y entrenamiento

El paquete no introduce un entrenamiento nuevo: es una conversión de pesos del modelo Qwen-Image-2.1. La arquitectura subyacente combina un transformador de difusión para la generación de imágenes con un codificador de texto Qwen3-VL que procesa las indicaciones textuales, más un VAE que decodifica las latentes en píxeles. La innovación del paquete es la cuantización TurboQuant: cada matriz de pesos se almacena a 8 bits con una escala por fila, y cada fila se rota a lo largo del eje de entrada mediante una transformación Hadamard con signos aplicada por bloques, una técnica habitual para reducir valores atípicos antes de cuantizar y preservar la calidad numérica.

El autor mantiene en precisión exacta las últimas cuatro capas del codificador de texto y todas las capas de normalización, decisión que sugiere que esas partes son las más sensibles a la cuantización. El VAE, el procesador y el scheduler se conservan sin modificar respecto al original. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image), con el pipeline `QwenImage21Pipeline` de diffusers.
- Codificación de texto multilingüe potencial a través de Qwen3-VL, aunque no se confirman los idiomas soportados.
- Integración prevista como herramienta de generación de imágenes dentro de los modelos de texto de SiLVANN mediante la llamada `(image "…")`.
- Ejecución en el motor SiLVANN con pesos cuantizados a 8 bits, lo que reduce el espacio en disco y, presumiblemente, la memoria de inferencia.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión de entrada, audio ni modo thinking para este paquete.

## Casos de uso

- Investigación en cuantización de modelos de difusión: el paquete permite comparar la calidad de imagen generada por Qwen-Image-2.1 en precisión original frente a la versión TurboQuant de 8 bits, aislando el efecto de la rotación Hadamard y de las capas mantenidas en exacto.
- Evaluación de motores de inferencia alternativos: sirve para validar el comportamiento del motor SiLVANN frente a diffusers con el mismo modelo base, midiendo latencia, uso de VRAM y fidelidad de salida.
- Generación de imágenes en entornos con memoria limitada: los 17,5 GB del paquete frente a los 31 GB originales permiten desplegar el modelo en GPUs de 24 GB con cuantización adicional o en configuraciones de una sola GPU de 40 GB.
- Prototipado de asistentes multimodales: la futura llamada `(image "…")` permitirá que un modelo de texto de SiLVANN solicite ilustraciones generadas en el contexto de una conversación, útil para demos de agentes con salida visual.
- Reproducción de experimentos académicos: al estar bajo licencia de investigación, encaja en trabajos que estudian el impacto de la cuantización en la calidad de difusión sin fines comerciales.
- Docencia y formación: el paquete permite montar prácticas sobre pipelines de difusión y cuantización con un modelo de gran tamaño en hardware de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,6 GB en disco; con pesos a 8 bits, la carga completa requiere aproximadamente 18-20 GB de VRAM, más el espacio para activaciones y el VAE, por lo que se recomienda al menos 24 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para ejecución holgada; RTX 4090 (24 GB) puede ser suficiente con gestión cuidadosa de memoria.
- GPU de consumo: cabe en RTX 4090 y, con dificultad, en GPUs de 24 GB; en tarjetas de 16 GB requeriría cuantización adicional o descarga por capas, no documentada.
- Opciones de despliegue: el paquete está pensado para el motor SiLVANN, que según el autor aún no lo ejecuta; es compatible con diffusers a través de `QwenImage21Pipeline`, aunque la cuantización TurboQuant puede requerir soporte específico del motor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| silvann_tq_D8_qwen_image_2.1 | no disponible | no disponible | 8 bits (TurboQuant) | qwen-research | Hugging Face, motor SiLVANN en desarrollo |
| Qwen/Qwen-Image-2.1 | no disponible | no disponible | precisión original (31 GB) | qwen-research | Hugging Face |
| eval-apply/silvann_tq_D8_qwen3.5_4b | 4B (modelo de texto) | no disponible | 8 bits (TurboQuant) | no disponible | Hugging Face |

La comparación con alternativas de generación de imágenes de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia qwen-research: prohibido el uso comercial sin licencia expresa de Qwen (contacto indicado: model-business@notice.qwencloud.com).
- El motor SiLVANN aún no ejecuta este paquete; su uso práctico hoy depende de la compatibilidad con diffusers y del soporte de TurboQuant.
- La cuantización a 8 bits puede degradar la fidelidad de las imágenes generadas respecto al modelo original; no se han publicado métricas que cuantifiquen esa pérdida.
- No se documentan sesgos del modelo base ni del paquete; al ser una conversión de pesos, hereda los sesgos de Qwen-Image-2.1.
- Riesgo de alucinación visual y de representaciones inexactas en imágenes generadas, inherente a los modelos de difusión.
- Idiomas soportados no confirmados; el rendimiento con indicaciones en castellano no está verificado.
- No se dispone de información sobre el número de parámetros, la longitud de contexto del codificador ni los datos de entrenamiento, lo que dificulta evaluar su encaje en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D8_qwen_image_2.1
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio del motor SiLVANN: https://github.com/eval-apply-labs/SiLVANN
- Paquete hermano de texto: https://huggingface.co/eval-apply/silvann_tq_D8_qwen3.5_4b
