# miyuki17/openevo-h143-qwen25-7b-webshop

## Resumen

El modelo `miyuki17/openevo-h143-qwen25-7b-webshop` es un adaptador PEFT (SD-LoRA) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, desarrollado por el usuario miyuki17 como parte del experimento OpenEVO H1.43-ON. El objetivo científico es investigar si la evolución endógena sin profesor (teacher-free) de adaptadores SD-LoRA, mediante el framework OpenEVO, puede mejorar el rendimiento de Qwen2.5-7B en tareas de compra en línea simuladas (WebShop) bajo un presupuesto de interacción fijo de 21.920 rollouts. Este experimento se enmarca en la línea de investigación sobre adaptación eficiente de modelos de lenguaje sin necesidad de datos etiquetados externos ni señales de profesor.

En el momento de la publicación inicial, el repositorio contiene únicamente metadatos y la declaración del diseño experimental; no se han subido todavía los pesos del adaptador ni los resultados finales. El adaptador, cuando esté disponible, se cargará sobre el modelo base Qwen2.5-7B-Instruct, que es un transformer decoder con 7.000 millones de parámetros y una ventana de contexto de 128.000 tokens. La relevancia actual radica en que explora un paradigma de entrenamiento alternativo (evolución endógena) que podría reducir la dependencia de supervisión externa en tareas de interacción con entornos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SD-LoRA sobre transformer decoder (Qwen2.5-7B-Instruct) |
| Parametros totales | No disponible (el adaptador no especifica el número de parámetros; el modelo base tiene 7.000 millones) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | Hereda la del modelo base: 128.000 tokens (no se modifica con el adaptador) |
| Tipos de cuantizacion | No disponible (no se han publicado pesos del adaptador) |
| Idiomas soportados | Inglés (según la etiqueta `language: en`; el modelo base soporta multilingüe, pero el adaptador se ha entrenado para tareas en inglés) |
| Licencia | `other` (no especificada; el modelo base es Apache-2.0, pero el adaptador tiene una licencia propia no detallada) |
| Formato de pesos | No disponible (se espera que sea un adaptador PEFT, probablemente en formato safetensors, pero no se ha publicado) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica SD-LoRA (State-Diagonal LoRA), una variante de LoRA que modifica selectivamente ciertas capas del modelo base. El entrenamiento se realiza mediante el framework OpenEVO, que implementa un algoritmo de evolución endógena: el propio modelo genera sus propias señales de mejora sin recurrir a un profesor externo (teacher-free). El experimento H1.43-ON utiliza un presupuesto de 21.920 oportunidades de rollout en el entorno WebShop (versión pequeña), dividido en dos etapas: la etapa 1 con 1.440 rollouts y una oportunidad de bootstrap endógeno, y la etapa 2 con 20.480 rollouts organizados en 80 bloques de 256 intentos. Cada bloque selecciona las primeras ocho tareas con dos éxitos exactos cualificados y aplica ocho incrementos secuenciales de SD-LoRA; si no se cumplen los criterios, se registra una actualización nula. No se utilizan llamadas al profesor ni tokens de profesor en todo el proceso. El modelo base se mantiene congelado y solo se actualizan los parámetros del adaptador.

No se han publicado detalles sobre la composición del dataset de entrenamiento más allá de que se usa el entorno WebShop con una corriente de tareas limpiada y compatible con SEED. Tampoco se especifica si se aplicaron técnicas como RLHF o DPO; el enfoque es puramente evolutivo.

## Capacidades

- Generación de texto y razonamiento: al ser un adaptador sobre Qwen2.5-7B-Instruct, hereda las capacidades generales del modelo base, incluyendo generación de texto, razonamiento de sentido común y comprensión de instrucciones.
- Interacción con entornos: el adaptador está diseñado específicamente para tareas de navegación y compra en el simulador WebShop, donde el modelo debe tomar decisiones secuenciales (seleccionar productos, navegar por categorías, completar compras).
- Tool calling y function calling: el modelo base Qwen2.5-7B-Instruct soporta estas capacidades, pero no se ha verificado si el adaptador las mantiene o mejora.
- Multilingüismo: el adaptador se ha entrenado solo en inglés, aunque el modelo base es multilingüe. No se ha evaluado el rendimiento en otros idiomas.
- Capacidades especiales: no se han documentado modos de pensamiento, visión o audio. El adaptador se centra en tareas de texto.

## Casos de uso

- Investigación en aprendizaje por refuerzo evolutivo: el adaptador sirve como caso de estudio para evaluar si la evolución endógena sin profesor puede competir con métodos supervisados en entornos de interacción como WebShop.
- Benchmarking de adaptadores LoRA: los resultados del experimento (cuando se publiquen) permitirán comparar el rendimiento de SD-LoRA evolutivo frente a adaptadores entrenados con métodos tradicionales.
- Desarrollo de agentes de compra en línea: si el adaptador demuestra mejoras, podría integrarse en sistemas de automatización de compras en entornos simulados o reales, aunque su uso en producción aún no está validado.
- Estudio de eficiencia de entrenamiento: el enfoque teacher-free reduce la dependencia de datos etiquetados, lo que podría aplicarse a dominios donde la supervisión externa es costosa.
- Reproducibilidad científica: el repositorio está diseñado para proporcionar un registro completo de reproducibilidad, útil para investigadores que quieran replicar o extender el experimento.
- Evaluación de robustez: el diseño con un panel fijo de 128 tareas y evaluación test-last permite medir la generalización del adaptador sin sesgos de selección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El experimento está en curso y la model card indica explícitamente que no hay puntuaciones BASE, puntuaciones finales ni afirmaciones de victoria/derrota en la publicación inicial. Los resultados se añadirán solo después de completar el presupuesto total, la evaluación test-last y la reconciliación.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Qwen2.5-7B-Instruct, los requisitos son los del modelo base. En FP16, el modelo base requiere aproximadamente 14-16 GB de VRAM. Con cuantización (por ejemplo, 4 bits), puede reducirse a unos 6-8 GB.
- GPU recomendadas: para FP16, una GPU con 16 GB o más (RTX 4090, A100 40 GB, etc.). Para cuantización 4 bits, una GPU con 8 GB (RTX 3060, RTX 4060, etc.) podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, el modelo base cabe en GPUs de consumo con al menos 8 GB de VRAM si se cuantiza. El adaptador añade una sobrecarga mínima.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face junto con `transformers`. También es compatible con frameworks de inferencia como vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se ha verificado la compatibilidad específica.
- Latencia y throughput: no se han publicado datos específicos para este adaptador. En general, Qwen2.5-7B-Instruct en una GPU moderna (A100) puede generar alrededor de 20-40 tokens por segundo en FP16, pero esto depende de la implementación y la cuantización.

## Comparativa con modelos similares

No se dispone de información comparativa publicada para este adaptador. El experimento está diseñado para comparar contra el método SEED (que usa profesor externo), pero no se han publicado resultados. Como referencia, el modelo base Qwen2.5-7B-Instruct se puede comparar con otros modelos de 7B como Llama 3.1 8B o Mistral 7B, pero el adaptador no modifica las capacidades generales del modelo base, solo su comportamiento en WebShop. No se puede establecer una comparativa fiable sin datos de evaluación.

## Limitaciones y advertencias

- El repositorio actualmente solo contiene metadatos; no hay pesos de adaptador disponibles para su uso. Cualquier intento de cargar el modelo fallará hasta que se publiquen los checkpoints.
- El experimento está en curso; no hay resultados finales ni afirmaciones de eficacia. Los usuarios no deben asumir que el adaptador mejora el rendimiento del modelo base.
- La licencia del adaptador es `other` y no está especificada. Antes de cualquier uso comercial, es necesario verificar los términos de redistribución y la compatibilidad con la licencia del modelo base (Apache-2.0).
- El adaptador se ha entrenado solo en inglés y para tareas de WebShop; su rendimiento en otros dominios o idiomas no está garantizado.
- El modelo base Qwen2.5-7B-Instruct puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje. El adaptador no corrige estos problemas.
- No se ha verificado la seguridad del adaptador (por ejemplo, posibles inyecciones de prompt o comportamientos no deseados) en entornos de producción.

## Enlaces

- Hugging Face: https://huggingface.co/miyuki17/openevo-h143-qwen25-7b-webshop
- Repositorio GitHub de origen (fuente de verdad): https://github.com/mykcs/openevo-experiment
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Framework OpenEVO (referencia): https://github.com/CompLifeLab-ZJU/OpenEvo
- Búsqueda de modelos con etiqueta `openevo`: https://huggingface.co/models?other=openevo
