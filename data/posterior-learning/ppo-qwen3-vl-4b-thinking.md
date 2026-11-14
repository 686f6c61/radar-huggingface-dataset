# posterior-learning/ppo-qwen3-vl-4b-thinking

## Resumen

`posterior-learning/ppo-qwen3-vl-4b-thinking` es un modelo multimodal de tipo image-text-to-text obtenido al fusionar (merge) un adaptador LoRA sobre el modelo base Qwen/Qwen3-VL-4B-Thinking. Lo publica el usuario `posterior-learning` en Hugging Face y su interés es acotado pero técnicamente relevante: documenta un experimento de ajuste por refuerzo (PPO) sobre un modelo vision-language de 4B parámetros con modo "thinking", y distribuye el resultado como pesos completos ya fusionados en bf16, listos para cargar con `transformers` sin necesidad de gestionar el adaptador por separado.

El adaptador proviene de una ejecución de PPO con la librería verl, configurada como un turno de acción de una línea por turno ("per-turn one-line action turn"), con learning rate 1e-5 y un total de 50 actualizaciones previstas, de las cuales se completaron 39. El entrenamiento se detuvo de forma anticipada por un mecanismo de vigilancia que monitoriza la entropía del actor y la divergencia KL de PPO: en la actualización 39 la entropía era 3,947 (por encima del umbral de 3,0) y la KL de PPO 0,0796 (por encima de 0,05). El checkpoint publicado corresponde precisamente a ese paso 39, el más reciente completo.

El modelo conserva la arquitectura, el tokenizador, la plantilla de chat, los procesadores y la configuración de generación del base Qwen3-VL-4B-Thinking sin cambios; solo se han modificado los 252 módulos afectados por el LoRA (r=16, alpha=32, escala 2,0), fusionados en fp32 y almacenados en bf16. El resto de tensores son idénticos byte a byte al modelo original. No hay información publicada sobre licencia, idiomas soportados ni benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (Qwen3-VL), con modo thinking; detalles internos del base no disponibles en la informacion proporcionada |
| Parametros totales | 4.437.815.808 (4,44B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; al ser compatible con transformers, admite cuantizacion posterior con herramientas externas, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 8,9 GB) |
| Modelo base | Qwen/Qwen3-VL-4B-Thinking |
| Tipo de ajuste | Merge de LoRA (r=16, alpha=32, escala 2,0) sobre el base |
| Modulos fusionados | 252 |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-4B-Thinking: un transformer multimodal que procesa imagen y texto y que incorpora un modo de razonamiento explícito ("thinking"). El repositorio no reproduce la arquitectura del base ni sus detalles de preentrenamiento (número de tokens, composición del dataset, fases de RLHF/DPO del modelo original), por lo que esos datos deben consultarse en la model card de Qwen. Lo que sí documenta este repositorio es la fase de ajuste posterior: un adaptador LoRA entrenado con PPO mediante verl, con una formulación de un turno de acción de una línea por turno, learning rate 1e-5, rango 16 y alpha 32.

La fusión se realizó con la regla estándar `W <- W + (lora_alpha / r) * B @ A` (escala 2,0), calculada en fp32 y almacenada en bf16, aplicada a 252 módulos. El proceso de verificación (`MERGE-REPORT.json`) comprobó tres módulos aleatorios dentro del redondeo bf16 esperado y 461 tensores idénticos byte a byte al base, con un total de bytes de tensores igual al del modelo original (8.875.631.616). Los ficheros no relacionados con pesos (config, tokenizer, chat template, procesadores, generation config) son los del base sin modificar. El entrenamiento se detuvo en la actualización 39 de 50 por superar los umbrales de entropía del actor (3,947 frente a 3,0) y KL de PPO (0,0796 frente a 0,05), lo que sugiere una divergencia creciente respecto a la política de referencia en las últimas actualizaciones.

## Capacidades

- Generación de texto e imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que acepta entradas multimodales y produce texto.
- Razonamiento explícito: hereda el modo "thinking" del base Qwen3-VL-4B-Thinking.
- Conversación multi-turno: la etiqueta `conversational` y la plantilla de chat del base están preservadas.
- Comprensión de imágenes: al conservar el procesador y la torre visual del base, mantiene las capacidades de visión del modelo original.
- Tool calling / function calling: no documentado en la información disponible para este repositorio; debe verificarse en la documentación del base.
- Capacidades de agente y razonamiento multi-paso: el ajuste PPO se formuló como turnos de acción de una línea, lo que apunta a un uso orientado a decisiones cortas por turno, pero no se publican evaluaciones al respecto.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en RL para modelos multimodales: el repositorio sirve como artefacto reproducible de un experimento PPO con verl sobre un VLM de 4B, útil para comparar curvas de entropía y KL y para estudiar el efecto de la fusión de LoRA en bf16 frente a la ejecución base + adaptador.
- Evaluación de la degradación por merge: al publicarse junto al informe de fusión, permite medir en tareas concretas cuánto se desvía el modelo fusionado del par base + adaptador.
- Prototipado de asistentes sobre imagen en local: con 4,44B parámetros y pesos en bf16 (8,9 GB), cabe en GPUs de consumo con suficiente VRAM y sirve para experimentar con descripción de imágenes y respuesta a preguntas visuales.
- Generación de decisiones cortas por turno: dado el formato de entrenamiento (una línea de acción por turno), encaja en entornos simulados donde el modelo debe emitir una acción concisa tras observar el estado.
- Base para ajustes posteriores: al ser un checkpoint completo compatible con transformers, puede reutilizarse como punto de partida para nuevos LoRA o para evaluar la estabilidad del entrenamiento tras el paso 39.
- Docencia y análisis de pipelines de RLHF/PPO: el detalle del run (learning rate, rango LoRA, criterios de parada) lo convierte en un ejemplo didáctico de configuración de PPO con verl.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos (8,9 GB de repo), más overhead de activaciones, caché KV y procesador visual; en la práctica, se recomienda al menos 16 GB de VRAM para entradas de imagen y contexto moderados.
- Cuantización: no se documentan versiones GGUF ni cuantizadas; al ser compatible con transformers, puede cuantizarse con herramientas externas, pero no hay cifras publicadas de VRAM para esos formatos.
- GPU recomendadas: A100 o H100 para despliegue con throughput alto; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 con margen; GPUs de 16 GB podrían funcionar con contexto corto y resolución de imagen reducida, sin datos confirmados.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090/3090 y en tarjetas de 16 GB con limitaciones de contexto; no confirmado por el autor.
- Opciones de despliegue: transformers (soporte declarado, con `endpoints_compatible`); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint y requerirían verificar compatibilidad con Qwen3-VL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| posterior-learning/ppo-qwen3-vl-4b-thinking | 4,44B | no disponible | imagen-texto | no disponible | Merge de LoRA PPO sobre Qwen3-VL-4B-Thinking; sin benchmarks publicados |
| Qwen/Qwen3-VL-4B-Thinking | no disponible en la informacion proporcionada | no disponible | imagen-texto | la del modelo base (consultar en su repositorio) | Modelo original sin ajuste PPO; referencia directa |
| Qwen3-VL-4B (variante instruct, si existe) | ~4B | no disponible | imagen-texto | la del modelo base | Alternativa sin modo thinking; datos no verificados en esta busqueda |
| Otros VLM de ~4B (p. ej. familias tipo PaliGemma o similar) | ~3-4B | no disponible | imagen-texto | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks propios ni cifras del base incluidas en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento incompleto: el run se detuvo en la actualización 39 de 50 por superar los umbrales de entropía del actor (3,947 > 3,0) y KL de PPO (0,0796 > 0,05), lo que indica posible inestabilidad y deriva respecto a la política de referencia.
- Sin evaluación publicada: no hay benchmarks, ni comparaciones con el base, ni métricas de calidad del merge más allá de las comprobaciones de integridad numérica.
- Diferencias por el merge en bf16: el propio autor advierte que las salidas pueden diferir ligeramente de la ejecución base + adaptador en tiempo de ejecución.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse en el repositorio del modelo base Qwen3-VL-4B-Thinking antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce la cobertura lingüística efectiva tras el ajuste.
- Riesgo de alucinación: inherente a los modelos generativos multimodales; sin datos específicos de evaluación para este checkpoint.
- Sesgos: no documentados; el ajuste PPO sobre un dataset no descrito puede introducir sesgos adicionales no caracterizados.
- Madurez y soporte: 0 descargas y 0 likes en el momento de la consulta, sin documentación de mantenimiento; no es un artefacto orientado a producción.
- Compatibilidad de despliegue: solo se declara soporte para transformers; el uso con vLLM, TGI u otros motores no está verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/posterior-learning/ppo-qwen3-vl-4b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- Librería verl (entrenamiento PPO citado en la model card): no se incluye enlace en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
