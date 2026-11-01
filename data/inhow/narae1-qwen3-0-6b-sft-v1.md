# inhow/Narae1-Qwen3-0.6B-SFT-v1

## Resumen

Narae1-Qwen3-0.6B-SFT-v1 es un adaptador LoRA experimental publicado por el desarrollador inhow sobre el modelo base Qwen/Qwen3-0.6B, un transformer denso de la familia Qwen3 con aproximadamente 0,6 mil millones de parámetros. El adaptador se distribuye en formato GGUF y está pensado para cargarse junto con un GGUF base del mismo modelo upstream, no como un perfil de prompt ni como un modelo autónomo. La model card lo describe explícitamente como un "modelo agente Narae" de carácter experimental.

El interés de esta ficha es limitado pero concreto: se trata de un ejemplo de ajuste fino mediante LoRA sobre un modelo pequeño de la familia Qwen3, empaquetado en GGUF para su uso en aplicaciones de escritorio, en este caso la aplicación Narae Hangul Office. El manifiesto original registra 156 actualizaciones del optimizador, un volumen de entrenamiento muy reducido que sitúa el artefacto en la categoría de prueba de concepto más que de modelo listo para producción.

La relevancia actual deriva de su tamaño (apto para hardware de consumo) y de su licencia Apache-2.0, que permite uso comercial manteniendo la atribución del modelo upstream. No obstante, el autor advierte de que no se garantizan la ejecución de herramientas, la corrección documental ni la finalización autónoma de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), adaptador LoRA sobre Qwen/Qwen3-0.6B |
| Parametros totales | 491.520 en el checkpoint safetensors del adaptador; el modelo base Qwen3-0.6B ronda los 0,6 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (base.gguf y adapter.gguf); no se detallan niveles de cuantizacion concretos |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache-2.0 (con atribucion al modelo upstream Qwen/Qwen3-0.6B) |
| Formato de pesos | GGUF (base y adaptador LoRA separados); el adaptador tambien aparece como safetensors en el repo |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen3-0.6B, un transformer denso de tipo decoder-only con atención estándar, sobre el que se aplica un ajuste fino supervisado (SFT) mediante LoRA. El resultado se empaqueta en dos artefactos GGUF: `base.gguf` (522.640.096 bytes, SHA256 7f403014…) y `adapter.gguf` (1.968.288 bytes, SHA256 2358980f…). Ambos deben cargarse conjuntamente con fuerza de adaptador 1; la aplicación Narae Hangul Office verifica el SHA256, el alias del modelo cargado y el adaptador LoRA real antes de activarlo.

El manifiesto original del modelo registra 156 actualizaciones del optimizador, lo que indica un entrenamiento muy breve. No se publica información sobre el dataset de entrenamiento, su composición, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. La model card indica explícitamente que no se incluye ningún dataset de entrenamiento, documento de usuario, credencial ni conversación en el repositorio.

## Capacidades

- Generación de texto en coreano e inglés, heredada del modelo base Qwen3-0.6B.
- Ajuste orientado a comportamiento de agente ("Narae agent model"), según la descripción del autor.
- Integración con la aplicación Narae Hangul Office mediante carga de base GGUF más adaptador LoRA.
- No se documentan capacidades de tool calling o function calling verificadas.
- No se documentan capacidades de razonamiento multi-paso, matemáticas o código evaluadas.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito.
- El autor advierte de que la ejecución de herramientas, la corrección documental y la finalización autónoma no están garantizadas.

## Casos de uso

- Evaluación de pipelines LoRA en GGUF: sirve para probar el flujo de carga conjunta de un base GGUF y un adaptador GGUF con verificación de hash en una aplicación de escritorio.
- Procesamiento de texto en coreano en local: al ser un modelo de ~0,6B en GGUF, puede ejecutarse en equipos sin GPU dedicada para tareas de generación de texto breve en coreano.
- Pruebas de integración en Narae Hangul Office: el artefacto está diseñado específicamente para instalarse y activarse desde esa aplicación, lo que permite validar el mecanismo de alias y verificación SHA256.
- Prototipado de asistentes de escritorio: como base experimental para explorar asistentes ligeros integrados en aplicaciones ofimáticas, siempre con supervisión humana.
- Investigación sobre ajuste fino de bajo coste: con solo 156 actualizaciones del optimizador, es un caso de estudio de qué se puede y no se puede conseguir con un SFT mínimo sobre un modelo de 0,6B.
- Docencia y experimentación: útil para demostrar el empaquetado de adaptadores LoRA en GGUF y su distribución junto al modelo base.
- No se recomienda su uso en atención al cliente, generación de código en producción ni tareas documentales críticas, dado que el propio autor no garantiza la corrección de esas funciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del base GGUF (unos 522 MB) y del adaptador (unos 2 MB), el modelo completo cabe holgadamente en menos de 1 GB de memoria en cuantizaciones de 4-8 bits, aunque el nivel exacto de cuantización no se especifica.
- GPU recomendadas: cualquier GPU de consumo con al menos 2-4 GB de VRAM es suficiente por tamaño; no hay datos publicados de latencia ni throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU, dado el reducido tamaño.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF y carga de adaptadores LoRA (Ollama, LM Studio); la aplicación Narae Hangul Office es el entorno previsto por el autor. No se documenta soporte para vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Narae1-Qwen3-0.6B-SFT-v1 | ~0,6B (base) + adaptador LoRA | No disponible | Apache-2.0 | GGUF (base + adaptador) | Experimental, 156 updates, solo ko/en |
| Qwen/Qwen3-0.6B | ~0,6B | No disponible en la informacion proporcionada | Apache-2.0 | Safetensors, GGUF | Modelo upstream sin ajuste |
| Otros modelos ~0,5B de la familia Qwen3 | ~0,6B | No disponible | Apache-2.0 | Safetensors, GGUF | Alternativa directa sin adaptador |

La comparativa se limita al modelo upstream y a variantes de la misma familia, ya que no se dispone de datos de rendimiento publicados para este adaptador ni para alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta como tal y no garantiza ejecución de herramientas, corrección documental ni finalización autónoma.
- Entrenamiento muy reducido (156 actualizaciones del optimizador), lo que limita la fiabilidad del ajuste.
- No se publica información sobre el dataset de entrenamiento, por lo que no es posible evaluar sesgos ni cobertura.
- Riesgo de alucinación inherente a un modelo de 0,6B sin datos de evaluación publicados.
- Idiomas limitados a coreano e inglés; el rendimiento en castellano no está documentado.
- Longitud de contexto no disponible; no debe asumirse la del modelo base sin verificación.
- Requiere cargar base y adaptador conjuntamente con fuerza 1; un uso incorrecto del adaptador produce resultados no válidos.
- Licencia Apache-2.0: permite uso comercial, pero obliga a mantener los términos y la atribución del modelo upstream Qwen/Qwen3-0.6B.
- No apto para producción en tareas críticas sin evaluación previa propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inhow/Narae1-Qwen3-0.6B-SFT-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
