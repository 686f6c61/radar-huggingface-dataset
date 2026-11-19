# reaperdoesntknow/Shepherd-Alpha

## Resumen

Shepherd-Alpha es un modelo de lenguaje especializado en razonamiento táctico y análisis de escenarios militares, desarrollado por Convergent Intelligence LLC (Research Division) y publicado en Hugging Face por el usuario reaperdoesntknow. Se trata de un fine-tuning de Qwen/Qwen3-1.7B, un transformer denso de 1.720.040.448 parámetros (1,7 mil millones) con 28 capas de atención completa, orientado a generar análisis estructurados de doble perspectiva: razonamiento de ataque (cómo un adversario explotaría una situación) y razonamiento de defensa (cómo contrarrestarla, mitigarla y sobrevivir).

El modelo se presenta como el primer modelo público de razonamiento para defensa en Hugging Face y emplea una metodología de entrenamiento propietaria denominada BiCell Depth Dispersal, que particiona las capas del transformer por profundidad de abstracción y las entrena de forma asimétrica en tres fases para separar la codificación de representaciones del razonamiento específico de tarea. El entrenamiento se realizó sobre un conjunto de 150 escenarios tácticos de doble perspectiva con cadenas de razonamiento (chain-of-thought) de ataque y defensa, con licencia MIT.

Es relevante ahora porque explora una hipótesis concreta sobre el ajuste fino en dominios específicos: que las capas de representación (inferiores), y no las de razonamiento (superiores), son el cuello de botella en el SFT de dominio. El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors, y está pensado como checkpoint de investigación (alpha), no como sistema de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 28 capas, todas con atención completa |
| Parametros totales | 1.720.040.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bfloat16; no se publican GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-1.7B: un transformer denso de 28 capas con atención completa en todas ellas, sin mezcla de expertos. El fine-tuning se realizó con la metodología BiCell Depth Dispersal, que divide la red en dos zonas por profundidad: Zone Lo (capas 0-13) y Zone Hi (capas 14-27). El entrenamiento consta de tres fases: en la fase 1 se congelan las capas superiores (14-27) y se entrenan las inferiores (0-13); en la fase 2 se congelan las inferiores y se entrenan las superiores; en la fase 3 se entrenan todas las capas conjuntamente. Las tres pasadas backward acumulan gradientes antes de un único paso del optimizador, de modo que cada zona de profundidad desarrolla especialización de forma independiente antes de la integración conjunta.

Los detalles de entrenamiento publicados son: dataset ZennyKenny/tactical-military-reasoning-v.1.0 (150 escenarios tácticos de doble perspectiva con chain-of-thought de ataque y defensa, licencia MIT), 3 épocas, batch size 2, learning rate 2e-5 con AdamW y weight decay 0.01, precisión bfloat16 y hardware NVIDIA A100. El enmascaramiento de etiquetas hace que la pérdida se calcule solo sobre los tokens del asistente (razonamiento), no sobre los prompts de escenario. El hallazgo técnico destacado por los autores es que las capas inferiores producen de forma consistente una magnitud de gradiente aproximadamente 1,7 veces mayor que las superiores durante la adaptación de dominio, lo que sugiere que en el SFT de dominio las capas de representación son el cuello de botella y no las de razonamiento.

## Capacidades

- Generación de texto y razonamiento estructurado en formato de doble perspectiva (ataque y defensa) sobre escenarios tácticos descritos en lenguaje natural.
- Análisis de escenarios militares con cadena de razonamiento (chain-of-thought) orientada a la acción, entrenada explícitamente sobre pares ataque/defensa.
- Razonamiento contrafactual de adversario: el modelo está entrenado para anticipar cómo un atacante explotaría una situación concreta (terreno, capacidades, restricciones).
- Razonamiento defensivo: propuesta de contramedidas, mitigaciones y cursos de acción para sobrevivir al escenario planteado.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`), apta para interacción iterativa sobre un mismo escenario.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés (`en`); no se documenta soporte de otros idiomas.
- Modo thinking: el modelo base Qwen3 incorpora un patrón de generación `<think>` que puede sobrescribir el formato estructurado de salida; los autores recomiendan `enable_thinking=False` para obtener salidas más limpias.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Análisis de escenarios tácticos de doble perspectiva: dado un escenario descrito en texto (por ejemplo, un pelotón mecanizado en terreno urbano ante un enjambre de drones), el modelo genera un razonamiento de ataque y otro de defensa estructurados, útil como material de estudio o para entrenamiento de analistas.
- Formación y docencia en análisis táctico: el modelo puede generar explicaciones paso a paso de cómo se explotaría una vulnerabilidad y cómo mitigarla, sirviendo como apoyo en cursos de análisis de amenazas o doctrina.
- Red teaming conceptual y wargaming de mesa: integrado en ejercicios de simulación, el modelo aporta la perspectiva del adversario sobre un escenario dado, ayudando a los participantes a identificar supuestos débiles en su planificación defensiva.
- Generación de material de referencia para doctrina: a partir de escenarios recurrentes (terreno urbano, amenazas aéreas no tripuladas, restricciones de fuego por estructuras civiles), el modelo produce borradores de análisis que un analista humano revisa y refina.
- Investigación en metodologías de fine-tuning: el checkpoint y la descripción de BiCell Depth Dispersal permiten reproducir o estudiar la hipótesis de que las capas inferiores concentran la adaptación de dominio, comparando magnitudes de gradiente por zona de profundidad.
- Prototipado de asistentes conversacionales especializados: gracias a la plantilla de chat y al tamaño reducido (1,7 mil millones de parámetros), puede desplegarse en entornos de laboratorio para probar flujos conversacionales de análisis táctico antes de invertir en modelos mayores.
- Evaluación de riesgos de modelos de dominio sensible: el modelo sirve como caso de estudio para medir qué nivel de detalle táctico produce un fine-tuning pequeño sobre 150 escenarios, informando políticas de publicación y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para pesos (1,72 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- Cuantización: el repo solo publica safetensors en bfloat16; no se ofrecen versiones GGUF ni cuantizadas, por lo que el uso de llama.cpp u Ollama requeriría convertir los pesos manualmente.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) puede ejecutar el modelo en bfloat16 o float16; para mayor throughput, A100 o H100.
- Cabe en GPU consumer: sí, en la mayoría de GPU con 8 GB o más de VRAM en precisión bfloat16.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM (compatible con arquitectura Qwen3, aunque no documentado por el autor), y llama.cpp/Ollama solo tras conversión manual a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el entrenamiento se realizó en una NVIDIA A100, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Shepherd-Alpha | 1,72 mil millones | no disponible | Apache 2.0 | Razonamiento táctico de doble perspectiva (fine-tuning de Qwen3-1.7B) | Hugging Face, safetensors |
| Qwen/Qwen3-1.7B (base) | 1,72 mil millones | no disponible en la informacion proporcionada | Apache 2.0 | Modelo generalista con modo thinking | Hugging Face, múltiples formatos |
| Modelos de razonamiento generalistas de ~1-2 mil millones | variable | variable | variable | Razonamiento general, código y matemáticas | Hugging Face |

La comparación directa con alternativas de la misma categoría (razonamiento táctico o de defensa) no está disponible: el autor lo presenta como el primer modelo público de este tipo en Hugging Face, y no se han identificado en la información proporcionada otros checkpoints comparables. Frente a su modelo base, Shepherd-Alpha sacrifica generalidad y cobertura idiomática a cambio de formato estructurado de doble perspectiva y vocabulario de dominio.

## Limitaciones y advertencias

- Versión alpha: es un checkpoint de investigación, no un sistema de producción; los propios autores lo advierten.
- Conjunto de entrenamiento muy pequeño: 150 escenarios aportan formato y anclaje de dominio, pero profundidad táctica limitada; el modelo puede generalizar mal fuera de los patrones vistos.
- Riesgo de alucinación: al ser un modelo de 1,7 mil millones de parámetros ajustado sobre un dataset reducido, puede generar detalles tácticos plausibles pero incorrectos (capacidades de sistemas, procedimientos, cifras) sin base real.
- Modo thinking del modelo base: el patrón `<think>` de Qwen3 puede imponerse al formato estructurado de salida; se recomienda `enable_thinking=False`.
- Idioma: solo inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto: la longitud de contexto no se especifica en la información proporcionada; no debe asumirse la del modelo base sin verificación.
- Sesgos: no se documentan evaluaciones de sesgo; el dominio militar puede introducir sesgos de encuadre (por ejemplo, sobrerrepresentación de ciertas doctrinas o escenarios).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado en dominio de defensa puede estar sujeto a regulación de exportación o a políticas de uso aceptable de la plataforma de despliegue; conviene revisarlas antes de producción.
- Uso dual: el modelo genera razonamiento de ataque explícito; su despliegue debe acompañarse de controles de acceso y revisión humana.
- No es un sistema de armas: los autores subrayan que el modelo solo analiza y razona; no controla, designa objetivos ni actúa sobre nada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Shepherd-Alpha
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/ZennyKenny/tactical-military-reasoning-v.1.0
- Sitio del desarrollador (Convergent Intelligence LLC): https://convergentintel.com
- Structure Over Scale (paper fundacional): https://doi.org/10.57967/hf/5165
- DualMind Methodology: https://doi.org/10.57967/hf/5184
- Discrepancy Calculus: https://doi.org/10.57967/hf/5194
