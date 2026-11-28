# NGARiAI/ngari-ft-distilled-v5

## Resumen

NGARi ngari-ft-distilled-v5 es un ajuste fino del modelo Qwen2.5-1.5B-Instruct, publicado por NGARiAI como checkpoint de su "fast tier" (nivel rapido) y distribuido unicamente en formato GGUF cuantizado Q4_K_M. El modelo parte de los 1.543.714.304 parametros del Qwen2.5-1.5B-Instruct original y se presenta como una destilacion orientada a despliegue en el borde (edge-ai), con integracion declarada en Ollama y compatibilidad con endpoints. Su licencia es Apache-2.0, heredada del modelo base.

La relevancia del checkpoint no reside en una mejora general de capacidades, sino en la transparencia de su evaluacion: la propia model card documenta que gana dos puntos de precision en MMLU (0,57 frente a 0,55 del base) pero pierde catorce puntos en GSM8K (0,42 frente a 0,56 del base). Es, por tanto, un modelo que prioriza conocimiento factual sobre razonamiento aritmetico, y el autor lo declara explicitamente como no apto para matematicas.

El modelo se publica en el marco de la iniciativa "Open Source Friday" de NGARiAI (Edition 001 lineage), con fecha de creacion del repositorio el 28 de noviembre de 2026. El repositorio tiene un tamano de 1,0 GB y contiene un unico fichero de pesos GGUF. No se han publicado resultados de benchmarks mas alla de MMLU y GSM8K, ni datos de contexto, cuantizaciones adicionales o composicion del dataset de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct; no se detalla variante especifica) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parametros. La model card no describe modificaciones estructurales sobre el base, sino un ajuste fino (adapter o full fine-tune, sin especificar cual) que da lugar al checkpoint v5. No se detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO en esta fase.

El autor declara que los datos de entrenamiento estan publicados en el repositorio de datasets `NGARiAI/ngari-datasets` y que la receta de entrenamiento se encuentra en la carpeta `training/` del mismo repositorio. El proceso se enmarca en una linea de "destilacion" (distillation) y "linaje" (lineage) segun las etiquetas del modelo, aunque no se aportan detalles tecnicos sobre el profesor utilizado ni sobre el procedimiento de destilacion en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Qwen2.5-1.5B-Instruct.
- Razonamiento de conocimiento general: mejora de dos puntos en MMLU respecto al base (0,57 frente a 0,55).
- Razonamiento aritmetico degradado: GSM8K cae a 0,42 frente al 0,56 del base, por lo que no es adecuado para matematicas.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- Integracion con Ollama (tag `ollama`).
- Orientado a despliegue en el borde (edge-ai) por su tamano y cuantizacion.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Multilingue limitado al ingles segun la model card.

## Casos de uso

- Asistente conversacional de borde: el modelo, con 1,5B parametros y cuantizacion Q4_K_M (0,99 GB), puede ejecutarse en dispositivos con recursos limitados para mantener conversaciones multi-turno en ingles alli donde no hay conectividad a la nube.
- Clasificacion y extraccion de informacion en local: su tamano permite desplegarlo en portatiles o mini-PC para tareas de etiquetado, resumen o extraccion de entidades sobre textos en ingles, con latencia baja y sin dependencia de API externa.
- Filtrado y moderacion de contenido en el dispositivo: puede actuar como primera capa de cribado en pipelines de procesamiento de texto, dado su bajo coste de inferencia y su ventana de contexto (no documentada).
- Prototipado rapido con Ollama: al publicarse como GGUF compatible con Ollama, permite a desarrolladores integrar un modelo conversacional en prototipos y demos sin infraestructura GPU dedicada.
- Chatbot de soporte de nivel basico: para consultas frecuentes y respuestas de conocimiento general en ingles, donde la precision aritmetica no es critica y prima la disponibilidad local.
- Evaluacion y experimentacion en investigacion: su model card documenta explicitamente las metricas y los ficheros de evaluacion por ejemplo, lo que lo hace util como caso de estudio de destilacion y de practicas de publicacion transparente de resultados negativos.
- Despliegue en entornos con requisitos de soberania de datos: la etiqueta `sovereign-ai` sugiere su uso en escenarios donde los datos no deben salir de la infraestructura propia, aunque no se aportan garantias adicionales en la informacion disponible.

## Benchmarks y rendimiento

| Benchmark | ngari-ft-distilled-v5 | Qwen2.5-1.5B-Instruct (base) | Diferencia |
|---|---|---|---|
| MMLU (accuracy) | 0,57 | 0,55 | +0,02 |
| GSM8K (accuracy) | 0,42 | 0,56 | -0,14 |

Los datos proceden de la model card del autor y de los ficheros de evaluacion por ejemplo publicados en el repositorio (`quality_ngari-ft-distilled-v5-stable_20261119T041255Z.json` y `quality_ngari-ft-distilled-v5-stable_20261119T041434Z.json`). No se han publicado resultados de otros benchmarks (HumanEval, MMLU-Pro, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para el fichero Q4_K_M de 0,99 GB, mas overhead de contexto y runtime (estimacion orientativa; no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050 en adelante, RTX 3050/4060, etc.) e incluso en dispositivos de borde con poca memoria.
- Opciones de despliegue: Ollama (soporte declarado), llama.cpp (formato GGUF), y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|---|
| ngari-ft-distilled-v5 | 1,5B | No disponible | 0,57 | 0,42 | Apache-2.0 | GGUF Q4_K_M |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible en esta ficha | 0,55 | 0,56 | Apache-2.0 | Safetensors, GGUF |
| Qwen2.5-0.5B-Instruct | 0,5B | No disponible en esta ficha | No disponible | No disponible | Apache-2.0 | Safetensors, GGUF |
| Llama 3.2 1B Instruct | 1,2B | No disponible en esta ficha | No disponible | No disponible | Llama 3.2 Community License | Safetensors, GGUF |

La comparativa se limita a datos verificables en la informacion disponible; para Qwen2.5-0.5B-Instruct y Llama 3.2 1B Instruct no se aportan metricas en esta ficha. El punto de referencia directo es el modelo base, que supera al ajuste en GSM8K y queda ligeramente por debajo en MMLU.

## Limitaciones y advertencias

- Razonamiento aritmetico degradado: GSM8K cae de 0,56 a 0,42 respecto al base; el autor lo declara explicitamente como "no es un modelo de matematicas".
- No es una mejora en todos los ejes: pierde capacidad en tareas cuantitativas mientras gana en conocimiento general.
- Solo ingles: la model card declara unicamente el idioma `en`; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion previa.
- Unica cuantizacion publicada (Q4_K_M): no hay versiones en FP16, Q8_0 u otras, lo que limita el ajuste fino de calidad frente a tamano.
- Riesgo de alucinacion: inherente a los modelos de 1,5B parametros; no se aportan evaluaciones de fidelidad o tasa de alucinacion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Uso comercial: permitido por la licencia Apache-2.0, heredada del modelo base; no se imponen restricciones adicionales conocidas.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion independiente.
- Fecha de publicacion futura (noviembre de 2026): conviene verificar la vigencia del checkpoint y de los enlaces antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NGARiAI/ngari-ft-distilled-v5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/NGARiAI/ngari-datasets
- Coleccion Open Source Friday: https://huggingface.co/collections/NGARiAI/open-source-friday-6b0a5e2732568212b40439a4
- Programa y reglas: https://ngari.ai/open-source-friday
