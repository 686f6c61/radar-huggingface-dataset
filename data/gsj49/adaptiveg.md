# Gsj49/adaptiveG

## Resumen

adaptiveG es un repositorio de checkpoints de politicas de aprendizaje por refuerzo (policy-gradient) publicado por el usuario Gsj49. No se trata de un modelo base entrenado desde cero, sino de un archivo multi-modelo que contiene los pesos finales de distintos experimentos de ajuste con variantes de tamano de grupo fijo y adaptativo ("adaptive group size"), una tecnica relacionada con metodos tipo GRPO. El repositorio agrupa 39 checkpoints distribuidos en cuatro familias de modelos base: Qwen2.5-1.5B-Instruct (GSM8K), Qwen3-8B-SFT496 (matematicas), Qwen2.5-Math-7B (matematicas) y DeepSeek-Coder-1.3B-Base (generacion de codigo).

La relevancia del repositorio es experimental: sirve como material reproducible para investigar como afecta el tamano de grupo adaptativo frente al fijo en el rendimiento de razonamiento matematico y generacion de codigo. Cada checkpoint corresponde a un paso concreto de entrenamiento (hasta el paso 500 en la mayoria de familias) y a una configuracion concreta (por ejemplo `fixed2`, `seed42`).

El repositorio ocupa 273,4 GB y esta pensado para cargarse por subdirectorio mediante `snapshot_download` con `allow_patterns`, no desde la raiz. La model card advierte explicitamente de que el manifiesto `checkpoints.json` lista modelos planificados y que solo estan disponibles aquellos cuya carpeta se ha subido. No se publican estados del optimizador ni datasets de entrenamiento, y las licencias de los modelos base siguen aplicando.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de cada modelo base: Qwen2.5, Qwen3, DeepSeek-Coder) |
| Parametros totales | Variable por submodelo: 1,5B (Qwen2.5-1.5B-Instruct), 8B (Qwen3-8B-SFT496), 7B (Qwen2.5-Math-7B), 1,3B (DeepSeek-Coder-1.3B-Base) |
| Parametros activos | no disponible (no se indica que ningun modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que aplican las licencias de los modelos base) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: cada checkpoint es un ajuste de un modelo base preentrenado. La innovacion metodologica es el uso de policy-gradient con tamano de grupo fijo y adaptativo, una variante en la linea de GRPO (Group Relative Policy Optimization), donde el numero de muestras por prompt se ajusta dinamicamente. El repositorio contiene tanto ejecuciones con grupo fijo (`fixed2`, etc.) como ejecuciones adaptativas, y conserva nombres de configuracion historicos en las ejecuciones hibridas.

El entrenamiento se organiza en cuatro familias con pasos finales distintos: GSM8K sobre Qwen2.5-1.5B-Instruct (21 modelos, paso 500), matematicas sobre Qwen3-8B-SFT496 (6 modelos, paso 300), matematicas sobre Qwen2.5-Math-7B (6 modelos, paso 500) y codigo sobre DeepSeek-Coder-1.3B-Base (6 modelos, paso 500). No se especifican el numero de tokens de entrenamiento, la composicion de los datasets, ni si se aplico RLHF o DPO adicional. Tampoco se publican estados del optimizador ni los datos de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento matematico, heredadas de los modelos base Qwen2.5-Math-7B y Qwen3-8B-SFT496.
- Resolucion de problemas de GSM8K mediante politica ajustada con refuerzo.
- Generacion de codigo a partir de DeepSeek-Coder-1.3B-Base.
- Ajuste de instrucciones en la variante Qwen2.5-1.5B-Instruct.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Reproduccion de experimentos de RL: cargar checkpoints concretos por subdirectorio para comparar el efecto del tamano de grupo fijo frente al adaptativo en GSM8K con Qwen2.5-1.5B-Instruct.
- Investigacion en razonamiento matematico: evaluar los checkpoints de Qwen2.5-Math-7B y Qwen3-8B-SFT496 en benchmarks de matematicas para medir la ganancia del ajuste por refuerzo.
- Estudio de generacion de codigo: usar los checkpoints de DeepSeek-Coder-1.3B-Base para analizar como el policy-gradient afecta a la calidad del codigo generado en modelos pequenos.
- Analisis de estabilidad de entrenamiento: comparar los distintos `seed` y pasos intermedios para estudiar varianza entre ejecuciones.
- Docencia e investigacion academica: material ligero (la variante de 1,3B y 1,5B) para ensenar tecnicas de RL aplicadas a LLM sin requerir infraestructura masiva.
- Reproducibilidad de articulos: servir como artefacto de referencia para trabajos que propongan variantes de GRPO con tamano de grupo adaptativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo de 1,3B-1,5B en fp16 requiere aproximadamente 3-4 GB, uno de 7-8B en fp16 requiere aproximadamente 14-16 GB.
- GPU recomendadas: no especificadas por el autor; para las variantes de 7B-8B se necesitan GPU con al menos 16-24 GB (RTX 4090, A100, H100); para las variantes de 1,3B-1,5B basta una GPU consumer de gama media.
- Cabe en GPU consumer: si, las variantes de 1,3B y 1,5B; las de 7B-8B requieren cuantizacion para GPUs de 8-12 GB.
- Opciones de despliegue: transformers (soporte nativo segun la model card); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| adaptiveG (Qwen2.5-1.5B-Instruct, GSM8K) | 1,5B | no disponible | no disponible | Hugging Face (repo Gsj49/adaptiveG) |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | no disponible en esta ficha | Apache 2.0 (segun modelo base) | Hugging Face |
| Qwen2.5-Math-7B (base) | 7B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| DeepSeek-Coder-1.3B-Base (base) | 1,3B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

La comparativa de rendimiento frente a los modelos base no puede establecerse porque no se han publicado benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Repositorio multi-modelo: no debe cargarse desde la raiz; es obligatorio seleccionar un subdirectorio de `checkpoints.json`.
- El manifiesto lista modelos planificados que pueden no estar subidos todavia.
- No se publican estados del optimizador ni datasets de entrenamiento, lo que limita la reproducibilidad completa del entrenamiento.
- Licencia no declarada: las licencias de los modelos base (Qwen, DeepSeek) siguen aplicando, por lo que el uso comercial depende de cada modelo base.
- Riesgo de alucinacion inherente a los modelos base; no se documentan mitigaciones.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles.
- Sin datos de benchmarks: no es posible validar la calidad del ajuste frente a los modelos base.
- Cero descargas y cero likes en el momento de la consulta: repositorio muy reciente y sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Gsj49/adaptiveG
- Modelo base Qwen2.5-1.5B-Instruct: no disponible en la informacion proporcionada
- Modelo base Qwen3-8B-SFT496: no disponible en la informacion proporcionada
- Modelo base Qwen2.5-Math-7B: no disponible en la informacion proporcionada
- Modelo base DeepSeek-Coder-1.3B-Base: no disponible en la informacion proporcionada
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada
