# latrompeababar/gemma-4-12B-it-oQ2.7e

## Resumen

gemma-4-12B-it-oQ2.7e es una cuantizacion mixta del modelo Gemma 4 12B Instruct, publicada por el usuario latrompeababar en Hugging Face. El modelo emplea la tecnica oQ (oMLX v0.7.3) para aplicar cuantizacion de precision mixta sobre los pesos originales, reduciendo el checkpoint a aproximadamente 4,7 GiB de almacenamiento efectivo con una media de 3,388 bits por peso. El resultado es un modelo de 11.959.730.224 parametros (unos 11,96 mil millones) que combina el modelo de lenguaje con un pequeno modulo de vision.

La relevancia de esta publicacion radica en su enfoque de cuantizacion selectiva: en lugar de aplicar una precision uniforme, distribuye los pesos entre formatos de 3, 4 y 8 bits segun la sensibilidad de cada tensor, manteniendo en BF16 solo un 0,3% de los parametros. Esto permite ejecutar un modelo de casi 12B en hardware con recursos limitados, especialmente en el ecosistema Apple Silicon gracias al formato MLX.

No obstante, la ficha del autor es extremadamente escasa: no se especifican licencia, idiomas soportados, pipeline de uso ni datos de entrenamiento. La informacion disponible se limita a la tabla de distribucion de bits y al desglose de almacenamiento entre el modelo de lenguaje y el modulo de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer con modulo de vision) |
| Parametros totales | 11.959.730.224 (11,96B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 3-bit (grupo 128 y 64), affine 4-bit (grupo 64), affine 8-bit (grupo 64), BF16; media efectiva 3,388 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura base es gemma4_unified, segun la etiqueta del repositorio, lo que sugiere un transformer multimodal que integra un modelo de lenguaje de 11.925B parametros con un modulo de vision de 0.035B parametros. El checkpoint cuantizado conserva la estructura del modelo original pero redistribuye la precision: el 89,737% de los pesos (10.732B) se almacena en affine 3-bit con grupo 128, un 8,417% (1.007B) en affine 3-bit con grupo 64, un 1,480% (0.177B) en affine 8-bit con grupo 64, y solo un 0,301% (0.036B) permanece en BF16.

No se dispone de informacion sobre el proceso de entrenamiento original de Gemma 4 12B Instruct (numero de tokens, composicion del dataset, uso de RLHF/DPO) ni sobre innovaciones tecnicas especificas. La unica innovacion documentada es la propia tecnica de cuantizacion oQ, que asigna mayor precision a los tensores mas sensibles (8-bit y BF16) y comprime agresivamente el resto (3-bit), logrando un equilibrio entre tamano y calidad.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo Gemma 4 12B Instruct original.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0.035B parametros, lo que indica soporte para entrada de imagenes.
- Razonamiento y matematicas: capacidades no documentadas en la model card, pero esperables en un modelo instruct de esta familia.
- Generacion de codigo: no documentada explicitamente.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamano de 4,7 GiB permiten ejecutar el modelo en Macs con 16 GB de memoria unificada, usando la libreria mlx para cargar los safetensors directamente.
- Prototipado rapido de aplicaciones multimodales: el modulo de vision integrado permite experimentar con tareas de imagen-texto en un equipo de sobremesa sin necesidad de GPU dedicada.
- Investigacion sobre cuantizacion: la distribucion de bits documentada sirve como referencia para estudiar el impacto de la precision mixta en modelos de ~12B.
- Desarrollo de asistentes conversacionales: el modelo puede gestionar dialogos multi-turno, aunque la longitud de contexto no esta documentada.
- Educacion y experimentacion: al ser un checkpoint pequeno (5,1 GB de repo), es adecuado para entornos docentes donde se quiere explorar el despliegue de LLM sin infraestructura costosa.
- Evaluacion comparativa de tecnicas de cuantizacion: permite comparar la calidad de oQ frente a otras tecnicas (GGUF, AWQ, GPTQ) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB en el formato cuantizado actual (4,7 GiB de pesos mas overhead de activaciones y cache KV).
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con al menos 16 GB de memoria unificada, dado que el formato es MLX. No se documenta soporte para CUDA.
- Cabe en consumer GPU: si, en Macs con 16 GB o mas de memoria unificada. En GPUs NVIDIA consumer no es directamente utilizable sin conversion de formato.
- Opciones de despliegue: libreria mlx (Apple), oMLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-12B-it-oQ2.7e | 11,96B | no disponible | oQ 3,388 bits/peso | no disponible | safetensors (MLX) |
| Gemma 4 12B Instruct (original) | ~12B | no disponible | BF16 | no disponible | safetensors |
| Otros checkpoints oQ de la misma familia | no disponible | no disponible | oQ variable | no disponible | safetensors (MLX) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits en el 89,7% de los pesos puede degradar la calidad respecto al modelo original en tareas que requieren precision numerica o razonamiento complejo.
- No se documenta la licencia, lo que impide determinar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo Gemma 4 original antes de cualquier despliegue en produccion.
- No se especifican los idiomas soportados; el comportamiento multilingue es incierto.
- No se documenta la longitud de contexto, lo que limita la planificacion de aplicaciones con ventanas largas.
- El formato MLX restringe el uso a hardware Apple; no es directamente compatible con CUDA ni con herramientas estandar de inferencia en Linux/Windows.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente agravado por la cuantizacion agresiva.
- El repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria conocida; la calidad del checkpoint no esta contrastada por terceros.
- No se han publicado benchmarks que permitan verificar la fidelidad respecto al modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/latrompeababar/gemma-4-12B-it-oQ2.7e
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
