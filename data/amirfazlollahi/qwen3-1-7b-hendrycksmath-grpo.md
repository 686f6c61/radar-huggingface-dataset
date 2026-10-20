# AmirFazlollahi/Qwen3-1.7B-HendrycksMATH-GRPO

## Resumen

`AmirFazlollahi/Qwen3-1.7B-HendrycksMATH-GRPO` es un ajuste fino del checkpoint `AmirFazlollahi/Qwen3-1.7B-HendrycksMATH-SFT`, que a su vez parte de Qwen3-1.7B. El autor, AmirFazlollahi, lo publica como un experimento de especialización en razonamiento matemático: el sufijo del nombre indica que la etapa final de entrenamiento se ha realizado con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo con recompensa verificable, sobre problemas del conjunto Hendrycks MATH. El modelo se distribuye con licencia Apache 2.0 y está pensado para generación de texto conversacional en inglés.

La relevancia de esta ficha es doble. Por un lado, documenta una receta concreta de RL sobre un modelo denso pequeño (~1,7 mil millones de parámetros), un patrón cada vez más habitual para obtener capacidad de razonamiento matemático con presupuesto de cómputo reducido. Por otro, conviene advertir de que se trata de una publicación de investigación con validación mínima: cero descargas, cero interacciones y un repositorio que figura con 0.0 GB, sin que la model card aporte resultados de evaluación, detalles del dataset ni hiperparámetros.

La model card es prácticamente un stub generado por la plantilla de Unsloth: solo confirma el modelo base, la licencia, el idioma y que el entrenamiento se hizo con Unsloth y TRL. Cualquier dato de arquitectura, contexto o rendimiento más allá de eso debe considerarse no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (herencia de Qwen3); no detallada en la model card |
| Parametros totales | ~1,7 mil millones (deducido del nombre del modelo; no confirmado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio no publica GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (`language: en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio figura con 0.0 GB, no se confirma la presencia de safetensors) |

Otros metadatos: pipeline `text-generation`, librería `transformers`, etiquetas `qwen3`, `unsloth`, `text-generation-inference`, `endpoints_compatible`, `conversational`, `region:us`. Creado y actualizado el 2026-10-19 (según los metadatos del repositorio).

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna. Por el nombre y la cadena de checkpoints, se trata de un transformer denso de la familia Qwen3 con aproximadamente 1,7 mil millones de parámetros, ajustado en dos etapas: primero un SFT sobre problemas matemáticos (checkpoint `Qwen3-1.7B-HendrycksMATH-SFT`) y después un entrenamiento con GRPO. El autor declara que el entrenamiento se ejecutó "2x faster" con Unsloth y la librería TRL de Hugging Face, lo que sitúa la receta en el ecosistema estándar de fine-tuning eficiente en memoria (LoRA/QLoRA o full fine-tuning, no especificado).

No se publican datos sobre volumen de tokens, composición exacta del dataset, plantilla de prompt, función de recompensa, número de rollouts por prompt, hiperparámetros de GRPO (learning rate, KL, clipping), ni si se preservó el modo "thinking" de Qwen3. El único indicio del dominio de entrenamiento es el nombre: problemas de Hendrycks MATH, un benchmark de competición con soluciones verificables numéricamente, lo que encaja con un esquema de RL con recompensa binaria por respuesta correcta.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (`conversational`).
- Razonamiento matemático paso a paso, presumiblemente orientado a problemas de nivel competición por el dataset de entrenamiento (no verificado con evaluaciones).
- Resolución de problemas con respuesta final verificable, capacidad reforzada por el entrenamiento con GRPO.
- Compatible con `text-generation-inference` y con endpoints alojados (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada; el modelo base Qwen3 lo soporta, pero no hay confirmación de que este ajuste lo conserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado; la model card declara únicamente inglés.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Evaluación de recetas de RL: sirve como punto de comparación directo contra su checkpoint padre SFT para medir cuánto aporta GRPO frente a SFT supervisado en un modelo de 1,7B. Es su uso más sólido dado el contexto de publicación.
- Generación de soluciones paso a paso para plataformas educativas: el modelo puede producir cadenas de razonamiento matemático en inglés para ejercicios de álgebra, teoría de números o combinatoria, con la ventaja de que su tamaño permite servir muchas peticiones concurrentes en una sola GPU.
- Generación de datos sintéticos de razonamiento: útil para crear pares (problema, solución) que después se filtran por verificación simbólica de la respuesta final, aprovechando que el formato de MATH tiene solución comprobable.
- Componente de un pipeline de auto-corrección: con un verificador externo (por ejemplo, SymPy) que valide la respuesta, el modelo actúa como generador de candidatos en un bucle de muestreo y selección.
- Fine-tuning posterior para dominios STEM concretos: al ser un checkpoint de ~1,7B con licencia Apache 2.0, es una base barata para reentrenar sobre problemas de física, estadística o matemática financiera.
- Despliegue en hardware de gama media o en el borde: con cuantización de 4 bits cabe en GPUs de 4-6 GB, lo que habilita prototipos locales y entornos sin clúster.
- Docencia e investigación sobre RL verificable: reproduce el esquema "SFT + GRPO sobre MATH" con un coste de cómputo asumible por un grupo universitario pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas sobre MATH, GSM8K, MMLU, HumanEval ni ninguna otra evaluación, ni comparaciones con el checkpoint SFT del que deriva. Tampoco se documenta la tasa de acierto en el propio conjunto de entrenamiento, lo que impide estimar el grado de sobreajuste.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~3,4 GB solo de pesos, más caché KV; en la práctica 5-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~1,8 GB de pesos, ~3 GB con overhead.
- VRAM estimada en cuantización de 4 bits: ~1 GB de pesos, ~2 GB con overhead.
- GPU recomendadas: cualquier GPU con 8 GB o más sirve en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, L40S, A10G). Para lotes grandes o contextos largos, A100 40/80 GB y H100.
- Cabe en GPU de consumo: sí, holgadamente; incluso iGPU con memoria unificada de 8-16 GB puede ejecutarlo en 4 bits mediante llama.cpp u Ollama, siempre que se generen los pesos GGUF (no publicados).
- Opciones de despliegue: `transformers` (librería declarada), TGI (tag `text-generation-inference`), y previsiblemente vLLM y llama.cpp/Ollama tras conversión, aunque no hay artefactos publicados para estas dos últimas.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo denso de 1,7B en una RTX 4090 suele superar con holgura el centenar de tokens por segundo en bf16, pero no se ha medido para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-HendrycksMATH-GRPO (este) | ~1,7B (por el nombre) | No disponible | Matemáticas, SFT + GRPO | Apache 2.0 | Repositorio con 0.0 GB; pesos no confirmados |
| Qwen3-1.7B-HendrycksMATH-SFT | ~1,7B (por el nombre) | No disponible | Matemáticas, solo SFT | No disponible en la informacion proporcionada | Checkpoint padre; estado del repo no verificado |
| Qwen3-1.7B (base) | 1,7B | No disponible en la informacion proporcionada | Propósito general, multilingüe | Apache 2.0 (heredada) | Público en la organización Qwen |
| Alternativas de tamaño similar centradas en matemáticas (por ejemplo destilados de ~1,5B) | ~1,5B | No disponible | Razonamiento matemático | No disponible | No verificadas en esta búsqueda |

No se dispone de datos de rendimiento comparado para ninguna de las filas, por lo que la comparativa se limita a parámetros, licencia y disponibilidad. Las búsquedas web realizadas no devolvieron ninguna referencia técnica utilizable sobre este modelo.

## Limitaciones y advertencias

- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de calidad.
- El repositorio figura con 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o que el contenido es solo la model card. Conviene verificar la pestaña de archivos antes de intentar cargarlo.
- Model card mínima: sin hiperparámetros, sin función de recompensa, sin curvas de entrenamiento ni evaluación. La reproducibilidad es prácticamente imposible con la información pública.
- Sesgo de dominio: el ajuste con GRPO sobre MATH estrecha la distribución hacia problemas de competición con respuesta cerrada; es esperable una degradación en conversación general, escritura y posiblemente en tool calling y multilingüismo respecto al Qwen3 original. No hay mediciones que lo confirmen ni lo descarten.
- Riesgo de alucinación en pasos intermedios: el RL con recompensa sobre la respuesta final no garantiza la corrección del razonamiento; el modelo puede alcanzar la solución correcta con pasos inválidos o, al contrario, razonar bien y fallar en el formato final.
- Idiomas: solo se declara inglés. El uso en castellano no está soportado ni evaluado.
- Longitud de contexto desconocida: no se debe asumir la ventana del Qwen3 original sin verificación experimental.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y el archivo NOTICE si existe; conviene revisar también los términos del modelo base Qwen3 y de los datos de Hendrycks MATH, cuyo uso puede estar restringido a investigación.
- Fechas de creación y actualización en 2026-10-19, ambas con ocho segundos de diferencia: publicación automatizada, sin mantenimiento posterior aparente.
- Sesgos de género, culturales o de representación: no evaluados ni documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmirFazlollahi/Qwen3-1.7B-HendrycksMATH-GRPO
- Checkpoint padre (SFT): https://huggingface.co/AmirFazlollahi/Qwen3-1.7B-HendrycksMATH-SFT
- Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería citada): https://github.com/huggingface/trl
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo.
