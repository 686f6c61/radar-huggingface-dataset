# RichardTsai906/ime-models

## Resumen

Hybrid IME S2 es un modelo de correccion semantica especializado en entrada de texto por Zhuyin (Bopomofo), el sistema fonetico de teclado usado en Taiwan. Se distribuye como un par de modelos GGUF afinados a partir de Qwen3.5-0.8B y Qwen3.5-4B, y su funcion es resolver ambiguedades de homofonos y vocabulario reciente en la conversion de secuencias Zhuyin a caracteres chinos tradicionales. Lo publica el usuario RichardTsai906 junto con los lanzadores de un IME hibrido multiplataforma (Windows, macOS y Linux).

El modelo no es un asistente generalista: es un componente de infraestructura para un motor de entrada. Se ofrece en dos variantes cuantizadas en Q4_K_M, una ligera de unos 510 MB pensada para CPU y portatiles modestos, y otra de 2,6 GB orientada a equipos con GPU dedicada o Apple Silicon con memoria abundante. El repositorio incluye ademas los pesos en safetensors del modelo base de 752 millones de parametros.

Su relevancia es practica: demuestra como un modelo compacto derivado de una familia pequena de Qwen puede resolver una tarea linguistica muy concreta con requisitos de latencia propios de un IME, donde el usuario espera respuesta en milisegundos mientras teclea. La licencia Apache-2.0 facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5); detalles de atencion no disponibles |
| Parametros totales | 752.393.024 (variante 0.8B segun safetensors); variante 4B no disponible en detalle |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos base en safetensors |
| Idiomas soportados | chino (zh), con enfasis en chino tradicional de Taiwan |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y Qwen3.5-4B, dos modelos densos de la familia Qwen3.5 con licencia Apache-2.0, y se afina mediante un proceso que el autor denomina "v5". La model card no detalla la composicion del dataset de ajuste, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible. La especializacion se orienta a la tarea de correccion semantica de secuencias Zhuyin, es decir, a desambiguar entre caracteres homofonos y a reconocer terminos de nueva acunacion que los diccionarios estaticos de los IME no cubren.

La innovacion principal no reside en la arquitectura, sino en el empaquetado: dos variantes cuantizadas en Q4_K_M que se ejecutan con el mismo binario en Windows, macOS y Linux, con verificacion SHA-256 en la primera instalacion y actualizaciones del programa que no obligan a redescargar los pesos. El sistema permite tener ambas variantes instaladas simultaneamente y alternar entre ellas desde un selector de modelo en el entorno local de pruebas.

## Capacidades

- Correccion semantica de texto introducido por Zhuyin/Bopomofo, resolviendo homofonos en chino tradicional.
- Reconocimiento de vocabulario reciente y terminos que no aparecen en diccionarios convencionales de IME.
- Generacion de texto conversacional segun el tag `conversational` del repositorio.
- Ejecucion local en CPU (variante 0.8B) y en GPU dedicada o Apple Silicon (variante 4B).
- Compatibilidad con endpoints segun el tag `endpoints_compatible`.
- Soporte multilingue limitado: solo se declara chino (`zh`).
- No se documentan tool calling, function calling, capacidades de agente, vision ni audio.

## Casos de uso

- Integracion en un IME de chino tradicional para Taiwan: el modelo se invoca en cada conversion de secuencia Zhuyin a caracteres y corrige homofonos frecuentes; la variante 0.8B en Q4_K_M esta pensada para mantener la latencia baja en portatiles sin GPU.
- Escritura en portatiles de gama baja: con unos 510 MB de pesos, la variante ligera cabe en equipos con CPU modesta y poca RAM, lo que permite ofrecer correccion semantica sin requisitos de hardware elevados.
- Redaccion profesional en chino tradicional: la variante 4B, con 2,6 GB, mejora la precision en homofonos y en terminos nuevos, adecuada para entornos de oficina con GPU dedicada o Apple Silicon con memoria suficiente.
- Despliegue multiplataforma en una organizacion: el mismo archivo GGUF funciona en Windows, macOS y Linux, lo que simplifica la distribucion interna de un IME corporativo con un unico artefacto verificado por SHA-256.
- Entorno de evaluacion y ajuste: el repositorio incluye un "entorno de practica local" accesible en `127.0.0.1:8765` que permite comparar ambas variantes sobre las mismas frases antes de fijar una configuracion.
- Base para especializaciones adicionales: al derivar de Qwen3.5 con licencia Apache-2.0, sirve como punto de partida para afinar correccion ortografica o transliteracion en otras variantes del chino, sujeto a la disponibilidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Variante 0.8B (`q08_v5.Q4_K_M.gguf`): aproximadamente 510 MB de pesos; pensada para CPU y equipos sin GPU dedicada.
- Variante 4B (`q4b_v5.Q4_K_M.gguf`): aproximadamente 2,6 GB de pesos; requiere GPU NVIDIA o AMD dedicada, o Apple Silicon con memoria abundante.
- VRAM estimada: no disponible de forma explicita; por el tamano de los pesos, la variante 4B en Q4_K_M requiere del orden de 3 GB o mas para pesos y cache, aunque el autor no publica cifras.
- GPU recomendadas: no disponible; el autor solo distingue entre nivel `cpu-small` y `gpu-large`.
- Cabe en GPU de consumo: si, la variante 0.8B en CPU y la 4B en GPUs de consumo con al menos unos pocos GB de memoria, aunque no se especifican modelos concretos.
- Opciones de despliegue: formato GGUF, por lo que es compatible con llama.cpp y derivados; los lanzadores propios del proyecto (`run_launcher.cmd`, `install.command`, `run_playground_linux.sh`) gestionan la instalacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hybrid IME S2 (0.8B) | 752 M | no disponible | Correccion Zhuyin, chino tradicional | Apache-2.0 | GGUF en Hugging Face |
| Hybrid IME S2 (4B) | no disponible | no disponible | Correccion Zhuyin, chino tradicional | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-0.8B (base) | 0.8B | no disponible | Modelo generalista | Apache-2.0 | Pesos en Hugging Face |
| Qwen3.5-4B (base) | 4B | no disponible | Modelo generalista | Apache-2.0 | Pesos en Hugging Face |

No se dispone de datos de rendimiento que permitan comparar la calidad de correccion frente a los modelos base ni frente a otros IME neuronales.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta afinado para correccion Zhuyin en chino tradicional; su uso como asistente general no esta documentado ni validado.
- Idioma unico: solo se declara chino (`zh`); no hay soporte declarado de castellano ni de otras lenguas.
- Datos de entrenamiento opacos: no se publica composicion del dataset, numero de tokens ni proceso de alineacion, lo que dificulta evaluar sesgos y cobertura.
- Riesgo de alucinacion en terminos poco frecuentes: al ser un modelo generativo aplicado a una tarea determinista, puede proponer caracteres plausibles pero incorrectos.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en entradas largas o en conversaciones multi-turno extendidas.
- Dependencia del ecosistema del autor: la integracion comoda pasa por sus lanzadores y su entorno de practica local, no por una API estandar documentada.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los archivos `LICENSE-Apache-2.0.txt` y `NOTICE.txt` incluidos en el repositorio.
- Madurez: el repositorio registra cero descargas y un unico "like" en el momento de la consulta, lo que sugiere poca validacion externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RichardTsai906/ime-models
- Descarga variante 0.8B: https://huggingface.co/RichardTsai906/ime-models/resolve/main/q08_v5.Q4_K_M.gguf
- Descarga variante 4B: https://huggingface.co/RichardTsai906/ime-models/resolve/main/q4b_v5.Q4_K_M.gguf
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
