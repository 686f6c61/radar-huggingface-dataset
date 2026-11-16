# neuqrui/webshop-analyzer-qwen2.5-7b

## Resumen

webshop-analyzer-qwen2.5-7b es un ajuste fino (SFT) del modelo Qwen2.5-7B-Instruct desarrollado por el usuario neuqrui, orientado a actuar como analizador de habilidades por paso (step-skill analyzer) dentro de entornos WebShop, un benchmark de compra de productos en tiendas web simuladas. El modelo no es un agente de proposito general, sino un componente especializado que forma parte del proyecto SCOPE, cuyo codigo esta disponible en GitHub.

El modelo parte de la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parametros totales, y se ha entrenado durante 3 epocas hasta el checkpoint global_step_264. La model card es extremadamente escueta y no documenta la composicion del dataset de entrenamiento, el numero de tokens usados ni los hiperparametros, mas alla de indicar que se trata de un ajuste supervisado (SFT).

Su relevancia es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de redactar esta ficha, publicado bajo licencia Apache 2.0. Resulta util para quienes replican o extienden el pipeline SCOPE, pero no esta pensado como modelo de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por causalidad estandar, sin mecanismos de mezcla de expertos ni capas de estado. El ajuste se realizo mediante SFT (supervised fine-tuning) sobre el checkpoint base, durante 3 epocas, alcanzando el checkpoint global_step_264. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF o DPO, ni hiperparametros como tasa de aprendizaje o tamano de batch.

La especializacion declarada es la de analizador de habilidades por paso en el entorno WebShop, es decir, un modulo que evalua o descompone las acciones de un agente en dicho benchmark. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal u otras optimizaciones.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Analisis de habilidades por paso (step-skill analysis) en el entorno WebShop.
- Integracion como componente dentro del pipeline del proyecto SCOPE.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (aunque el modelo base lo soporta, no se confirma que el ajuste lo preserve).
- Capacidades de agente y razonamiento multi-paso: orientadas especificamente al benchmark WebShop, no documentadas de forma general.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de trayectorias de agentes en WebShop: el modelo evalua cada paso de una trayectoria de compra simulada para identificar la habilidad implicada, lo que permite diagnosticar donde falla un agente.
- Investigacion en aprendizaje por refuerzo con agentes web: sirve como modulo de analisis de habilidades dentro del proyecto SCOPE para generar senales de evaluacion o recompensa.
- Replicacion de experimentos: permite reproducir los resultados del pipeline SCOPE con el checkpoint exacto publicado (global_step_264).
- Etiquetado de datos de interaccion: puede usarse para anotar pasos de trayectorias con etiquetas de habilidad, alimentando posteriores entrenamientos.
- Evaluacion comparativa de agentes: al analizar pasos de forma estandarizada, facilita comparar distintos agentes sobre el mismo benchmark.
- Desarrollo de modulos de critica: puede integrarse como critico o analizador en sistemas multi-agente que operen en entornos de compra simulada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 4-5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100, H100 o L40S para BF16; RTX 4090 (24 GB) suficiente para FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 en FP16 y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), y potencialmente vLLM, llama.cpp u Ollama si se generan pesos GGUF (no confirmado).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webshop-analyzer-qwen2.5-7b | 7,6 B | No disponible | Analisis WebShop (SCOPE) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | No disponible en esta ficha | Proposito general | Apache 2.0 | Hugging Face |
| Otros ajustes WebShop | No disponible | No disponible | Agentes WebShop | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan datos de entrenamiento, evaluacion ni limitaciones conocidas.
- Riesgo de alucinacion inherente al modelo base, agravado por la falta de evaluacion publicada del ajuste.
- Especializacion muy estrecha: su utilidad fuera del entorno WebShop y del proyecto SCOPE no esta demostrada.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue adecuado.
- Cero descargas y cero likes en el momento de la ficha: sin validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen2.5-7B-Instruct antes de un uso comercial.
- No se confirma que el ajuste preserve tool calling ni otras capacidades del modelo base.
- Para produccion, se recomienda evaluar el checkpoint con datos propios antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neuqrui/webshop-analyzer-qwen2.5-7b
- Repositorio del proyecto SCOPE: https://github.com/neuqrui/SCOPE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
