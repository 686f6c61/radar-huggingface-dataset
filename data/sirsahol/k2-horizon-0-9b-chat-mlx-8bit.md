# SirSahOl/K2-Horizon-0.9B-chat-mlx-8bit

## Resumen

K2-Horizon-0.9B-chat-mlx-8bit es una conversion cuantizada a 8 bits del modelo IFM/K2-Horizon-0.9B, realizada por el usuario SirSahOl mediante la herramienta MLX Foundry y publicada en HuggingFace. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribucion de pesos en formato MLX (safetensors) pensada exclusivamente para ejecucion en Apple Silicon. El repositorio ocupa 1,1 GB y contiene 1.078.285.824 parametros, coherente con la denominacion comercial de "0.9B" del modelo original.

El problema que resuelve es la portabilidad: el modelo base solo puede ejecutarse con comodidad en hardware Apple si se convierte al formato nativo de MLX, y esta version de 8 bits reduce el peso en disco frente a la variante de 16 bits a cambio de una perdida de calidad asumida por el propio autor. La licencia es Apache 2.0, heredada del modelo origen, lo que permite uso comercial sin restricciones adicionales conocidas.

La relevancia de esta ficha es limitada pero concreta: se publico el 11 de septiembre de 2026, acumula 0 descargas y 0 "likes", y no incluye datos sobre arquitectura interna, longitud de contexto, composicion del dataset de entrenamiento ni idiomas soportados. Toda la informacion tecnica disponible procede de la model card del conversor y de los metadatos de HuggingFace, no del autor del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no publicada en la informacion disponible) |
| Parametros totales | 1.078.285.824 (aproximadamente 1,08 B) |
| Parametros activos | no aplicable / no disponible (sin informacion sobre arquitectura MoE) |
| Longitud de contexto | no disponible (la model card solo advierte de degradacion por encima de 8K tokens) |
| Tipos de cuantizacion | 8 bits (cuantizacion de pesos, weight-only) con MLX; existen variantes del mismo autor en 16 bits y se menciona 4 bits como recomendacion |
| Idiomas soportados | no disponible (los tags de HuggingFace no declaran idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX, libreria mlx-lm) |

Datos adicionales de la conversion: version de mlx-lm 0.31.3, tiempo de conversion 6,42 s, tamano de salida 1,1 GB, fecha de conversion 2026-09-11T16:55:57 UTC.

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base IFM/K2-Horizon-0.9B en los materiales proporcionados. La model card de esta conversion indica explicitamente que se trata de una conversion de pesos unicamente ("weight-only conversion"), de modo que tanto la arquitectura como el comportamiento del modelo se heredan integramente del modelo origen. No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, tokenizador ni si hubo fases de RLHF, DPO u otro tipo de alineamiento.

La unica innovacion tecnica documentada en esta publicacion es el propio proceso de conversion: mlx-lm aplica cuantizacion de 8 bits sobre los pesos y los serializa en safetensors con el formato esperado por MLX. El autor no documenta tecnicas de decodificacion especulativa, atencion lineal ni variantes hibridas. La limitacion declarada es que la cuantizacion introduce una perdida de calidad respecto al modelo original, mayor cuanto menor es el numero de bits.

## Capacidades

La informacion disponible solo permite confirmar las capacidades declaradas en los tags y en el pipeline del repositorio. No se dispone de evaluacion funcional independiente.

- Generacion de texto conversacional (pipeline: text-generation, tag "conversational").
- Uso como modelo de chat interactivo mediante mlx_lm.chat.
- Generacion de texto no interactiva mediante mlx_lm.generate y la API de Python de mlx-lm.
- Ejecucion local en Apple Silicon (M1 o posterior) sin dependencia de servicios en la nube.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

Los casos siguientes se derivan del perfil tecnico del artefacto (modelo pequeno, cuantizado, formato MLX, orientado a conversacion) y no de una evaluacion de calidad publicada. Deben considerarse escenarios plausibles, no validados.

- Asistente conversacional local en macOS: con 1,08 B de parametros y 1,1 GB en disco, el modelo puede cargarse en un Mac con 8 GB de memoria unificada y mantener conversaciones de varios turnos sin enviar datos a terceros, algo relevante para entornos con requisitos de privacidad.
- Prototipado rapido de aplicaciones de chat: sirve como modelo de sustitucion barato durante el desarrollo de interfaces y logica de negocio, antes de pasar a un modelo mayor en produccion.
- Procesamiento de texto en lote sobre portatiles Apple: la generacion por CLI permite resumir, reescribir o clasificar ficheros de texto localmente, con un throughput medido de 47,82 tokens/s en un M1 de 8 GB.
- Experimentacion academica con cuantizacion: el par 8 bits / 16 bits del mismo autor permite estudiar el impacto de la cuantizacion en la calidad de las respuestas manteniendo constante el resto de variables.
- Aplicaciones de escritorio nativas para macOS: al integrarse con mlx-lm desde Python, puede embeberse en herramientas internas que ya usen el ecosistema MLX de Apple.
- Demos y pruebas de concepto sin GPU dedicada: al ejecutarse en memoria unificada, evita el coste de alquiler de GPU en la nube para validaciones tempranas.
- Ajuste fino ligero con LoRA: mlx-lm incluye utilidades de ajuste, aunque el autor no documenta ni valida este flujo para este modelo concreto, por lo que requiere verificacion previa.

## Benchmarks y rendimiento

La model card solo publica metricas de inferencia medidas en un Apple M1 con 8 GB de memoria unificada, promedio de 5 ejecuciones con un maximo de 256 tokens generados. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes).

| Metrica | 8 bits | 16 bits |
|---|---|---|
| Throughput (tokens/s) | 47,82 | 26,15 |
| TTFT (time to first token) | 20,91 ms | 38,26 ms |
| Memoria pico | 1291,0 MB | 247,6 MB |

Advertencia sobre estos datos: la cifra de memoria pico del modelo de 16 bits (247,6 MB) es inferior a la del de 8 bits (1291,0 MB), lo que contradice la relacion esperada entre precision y consumo de memoria. Es probable que exista un error de transcripcion en la tabla original, pero no se dispone de informacion para corregirlo, por lo que se reproduce tal cual fue publicada.

## Requisitos de hardware

- Peso en disco: 1,1 GB para la variante de 8 bits.
- Memoria pico medida durante la inferencia: 1291,0 MB en un Apple M1 con 8 GB de memoria unificada.
- Plataforma obligatoria: Apple Silicon (M1 o posterior). El modelo no se ejecuta en GPU NVIDIA, AMD ni en CPU x86 con este formato.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el equivalente es memoria unificada de Apple Silicon. Segun la propia model card: 4 bits para M1/M2 con 8 GB, 8 bits para M1/M2 Pro/Max con 16-32 GB, 16 bits para M2/M3/M4 Ultra con 64 GB o mas.
- Opciones de despliegue: mlx-lm (CLI mlx_lm.chat y mlx_lm.generate, mas API de Python con load/generate). No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF.
- Latencia y throughput: TTFT de 20,91 ms y 47,82 tokens/s en 8 bits; TTFT de 38,26 ms y 26,15 tokens/s en 16 bits (Apple M1, 8 GB, 256 tokens maximos, promedio de 5 ejecuciones).
- Reproduccion de la conversion: mlx-lm 0.31.3 con el comando `python3 -m mlx_lm.convert --hf-path IFM/K2-Horizon-0.9B --mlx-path output/K2-Horizon-0.9B-mlx-8bit -q --q-bits 8`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad de este modelo ni de sus alternativas, por lo que la comparativa se limita a caracteristicas verificables entre las variantes del mismo artefacto. No se han identificado en la informacion proporcionada otros modelos comparables con datos contrastables.

| Modelo | Parametros | Cuantizacion | Formato | Plataforma | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| SirSahOl/K2-Horizon-0.9B-chat-mlx-8bit | 1.078.285.824 | 8 bits | safetensors (MLX) | Apple Silicon | apache-2.0 | 47,82 tokens/s; TTFT 20,91 ms |
| SirSahOl/K2-Horizon-0.9B-chat-mlx-16bit | no disponible | 16 bits | safetensors (MLX) | Apple Silicon | apache-2.0 | 26,15 tokens/s; TTFT 38,26 ms |
| IFM/K2-Horizon-0.9B (modelo base) | no disponible | sin cuantizar | no disponible | no disponible | apache-2.0 (heredada) | no disponible |

## Limitaciones y advertencias

- Rendimiento decreciente en contextos muy largos: el propio autor advierte de degradacion por encima de 8K tokens con niveles de cuantizacion bajos.
- Perdida de calidad por cuantizacion: es una conversion de pesos unicamente y la cuantizacion a 8 bits introduce una perdida pequena pero real respecto al modelo original; a menos bits, mayor perdida.
- Dependencia de plataforma: requiere Apple Silicon (M1 o posterior) para ejecutarse con MLX, lo que excluye servidores con GPU convencional y limita su uso en produccion sobre infraestructura estandar.
- Arquitectura y comportamiento heredados: el autor no ha modificado la arquitectura ni el entrenamiento; cualquier sesgo, limitacion o comportamiento problematico del modelo base se mantiene intacto.
- Sesgos conocidos: no disponible. No hay informacion sobre datos de entrenamiento, idiomas ni evaluaciones de sesgo.
- Riesgo de alucinacion: no disponible de forma especifica; con 1,08 B de parametros es razonable esperar una tasa de alucinacion superior a la de modelos mayores, pero no hay mediciones que lo respalden.
- Limitaciones de idioma y contexto: no disponible. Ni los tags ni la model card declaran idiomas ni longitud de contexto soportada.
- Restricciones de licencia: Apache 2.0, permisiva para uso comercial. Conviene verificar la model card del modelo base por si el autor original anade condiciones adicionales, aunque la conversion declara heredar la misma licencia.
- Madurez y validacion: el repositorio registra 0 descargas y 0 "likes", sin evaluaciones de terceros, sin benchmarks academicos y con una unica version publicada.
- Inconsistencia documental: la tabla de rendimiento publicada muestra menos memoria pico en 16 bits que en 8 bits, lo que sugiere un error de transcripcion no aclarado.
- Tool calling y agentes: no hay ninguna evidencia de soporte, por lo que no deberia asumirse en un diseno de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/K2-Horizon-0.9B-chat-mlx-8bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Variante de 16 bits: https://huggingface.co/SirSahOl/K2-Horizon-0.9B-chat-mlx-16bit
- Perfil del autor de la conversion: https://huggingface.co/SirSahOl
- MLX (Apple): https://github.com/ml-explore/mlx
- MLX Foundry, pipeline de conversion usado: https://github.com/SirSahOl/mlx-foundry
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre el modelo; las referencias devueltas por la busqueda no guardan relacion con este artefacto y se han descartado.
