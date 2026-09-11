# SirSahOl/K2-Horizon-0.9B-chat-mlx-4bit

## Resumen

K2-Horizon-0.9B-chat-mlx-4bit es una conversion a formato MLX con cuantizacion de 4 bits del modelo IFM/K2-Horizon-0.9B, publicada por el usuario SirSahOl. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos (weight-only) pensada para ejecutar el modelo en Macs con chip Apple Silicon mediante la libreria MLX de Apple. El repositorio ocupa 0,6 GB y los pesos safetensors suman 1.078.285.824 parametros totales (aproximadamente 1,08 mil millones, comercializados como 0,9B).

El modelo base pertenece a la familia K2-Horizon de IFM y esta etiquetado como conversacional (conversational) y de generacion de texto. La conversion hereda la licencia Apache 2.0 del modelo original y se publica bajo el pipeline text-generation, con el tag custom_code, lo que indica que la arquitectura requiere cargar codigo personalizado del repositorio base para poder instanciarse.

Su relevancia practica es acotada pero concreta: ofrece una via de despliegue local en hardware de consumo Apple (M1 con 8 GB de memoria unificada) con un consumo de memoria medido de 772,2 MB en pico y 78,32 tokens por segundo, cifras que lo sitúan en el rango de asistentes conversacionales ligeros ejecutables en portatiles sin GPU dedicada. No se dispone de informacion publicada sobre la composicion del dataset de entrenamiento, la longitud de contexto, los idiomas soportados ni resultados de benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `custom_code` indica que requiere codigo de arquitectura personalizado del modelo base; familia etiquetada como `k2_horizon`) |
| Parametros totales | 1.078.285.824 (segun safetensors) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card advierte de degradacion con contextos superiores a 8K tokens) |
| Tipos de cuantizacion | 4 bits (weight-only); la model card recomienda 8 bits y 16 bits como alternativas segun memoria |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX, requiere `mlx-lm`) |
| Modelo base | IFM/K2-Horizon-0.9B |
| Tamano del repositorio | 0,6 GB (pesos convertidos: 583,5 MB) |
| Version de herramienta | mlx-lm 0.31.3 |
| Fecha de conversion | 2026-09-11 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en los materiales proporcionados. El repositorio incluye el tag `custom_code`, lo que implica que la carga del modelo requiere ejecutar codigo Python distribuido con el repositorio original (habitualmente mediante `trust_remote_code=True`), y el tag de familia `k2_horizon`. No se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un diseno hibrido.

Respecto al entrenamiento, tampoco hay datos publicados: se desconoce el numero de tokens utilizados, la composicion del corpus, la posible aplicacion de RLHF o DPO, y cualquier innovacion tecnica asociada al modelo original. Lo unico documentado es el proceso de conversion: se aplico `mlx_lm.convert` con `--q-bits 4` sobre IFM/K2-Horizon-0.9B, con un tiempo de conversion de 5,01 segundos y un resultado de 583,5 MB en disco. Al ser una conversion weight-only, el comportamiento y la arquitectura son identicos a los del modelo de origen, con la unica diferencia de la perdida de calidad introducida por la cuantizacion a 4 bits.

## Capacidades

- Generacion de texto conversacional en modo chat (pipeline `text-generation`, etiqueta `conversational`).
- Ejecucion de inferencia local en Apple Silicon mediante MLX, con API de Python y CLI (`mlx_lm.chat`, `mlx_lm.generate`).
- Generacion de texto con control de longitud mediante el parametro `max_tokens` (ejemplo documentado con 256 tokens).
- Capacidad de razonamiento, codigo, matematicas o vision: no disponible en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas en el repositorio).
- Capacidad especial de modo pensamiento (thinking mode), audio o vision: no disponible.

## Casos de uso

- Asistente conversacional local en portatil Mac: el modelo puede ejecutarse en un M1 con 8 GB de memoria unificada consumiendo 772,2 MB en pico, lo que permite mantener un chatbot de proposito general en segundo plano sin desplazar al resto de aplicaciones del sistema.
- Prototipado rapido de interfaces de chat: con `mlx_lm.chat` se puede levantar un chat interactivo en linea de comandos en un solo paso tras `pip install mlx-lm`, util para validar prompts y flujos conversacionales antes de invertir en infraestructura mayor.
- Generacion de texto por lotes en pipelines de scripts: la API de Python (`load` + `generate`) permite integrar el modelo en scripts de procesamiento de texto (resumenes cortos, reescritura, clasificacion generativa) con un throughput medido de 78,32 tokens por segundo.
- Aplicaciones de escritorio nativas para macOS: al ser un formato MLX, encaja en aplicaciones Swift/Python que aprovechan la memoria unificada del chip, sin necesidad de GPU dedicada ni de transferencias PCIe, con un TTFT de 12,77 ms.
- Entorno educativo y de investigacion sobre cuantizacion: el repositorio documenta el comando exacto de reproduccion de la conversion, lo que lo convierte en un caso de estudio reproducible para medir el impacto de la cuantizacion a 4 bits frente a 8 y 16 bits.
- Evaluacion comparativa de formatos de despliegue en Apple Silicon: sirve como punto de referencia para contrastar MLX frente a otras rutas de inferencia en Mac, dado que publica metricas de latencia y memoria sobre hardware concreto (M1, 8 GB).
- Tareas de generacion de texto de baja exigencia en produccion interna: con licencia Apache 2.0 y un peso en disco de 583,5 MB, es viable empaquetarlo dentro de una aplicacion distribuible sin costes de licencia adicionales, siempre que la tarea tolera la perdida de calidad de la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son de inferencia:

| Metrica | Valor | Condiciones |
|---|---|---|
| Tokens por segundo | 78,32 | Apple M1, 8 GB de memoria unificada, 256 max tokens |
| TTFT (time to first token) | 12,77 ms | Apple M1, 8 GB de memoria unificada |
| Memoria en pico | 772,2 MB | Apple M1, 8 GB de memoria unificada, cuantizacion 4 bits |

Las cifras corresponden a la media de 5 ejecuciones con un maximo de 256 tokens generados.

## Requisitos de hardware

- Requisito de plataforma: Apple Silicon (M1 o posterior) de forma obligatoria; MLX no se ejecuta en GPU NVIDIA, AMD ni en CPU x86.
- Memoria en pico medida: 772,2 MB con cuantizacion de 4 bits (medicion sobre M1 con 8 GB).
- Estimacion de memoria por cuantizacion, a partir de los 1.078.285.824 parametros: aproximadamente 0,6 GB en 4 bits (583,5 MB en disco), en torno a 1,1 GB en 8 bits y alrededor de 2,2 GB en 16 bits, sin contar el overhead del runtime ni la cache KV.
- Cabe en cualquier Mac con chip M1 o superior y 8 GB de memoria unificada; la propia model card orienta el uso de 4 bits precisamente para equipos M1/M2 de 8 GB.
- Recomendaciones del autor por hardware: M1/M2 con 8 GB usan 4 bits; M1/M2 Pro/Max con 16-32 GB pueden usar 8 bits; M2/M3/M4 Ultra con 64 GB o mas pueden usar 16 bits.
- Opciones de despliegue: MLX a traves de `mlx-lm` (version usada en la conversion: 0.31.3), con CLI (`mlx_lm.chat`, `mlx_lm.generate`) y API de Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con estos pesos; vLLM y TGI requieren formatos y hardware distintos, y no se ofrece variante GGUF en este repositorio.
- Latencia y throughput medidos: 78,32 tokens/s y 12,77 ms de TTFT sobre Apple M1 con 8 GB.

## Comparativa con modelos similares

No se dispone de datos de otros modelos en la informacion proporcionada, por lo que no es posible elaborar una comparativa con cifras verificables de parametros, contexto, rendimiento o licencia de alternativas. Como referencia interna, el propio repositorio solo declara una variante de cuantizacion:

| Variante | Cuantizacion | Repositorio |
|---|---|---|
| K2-Horizon-0.9B-chat-mlx-4bit | 4 bits | SirSahOl/K2-Horizon-0.9B-chat-mlx-4bit |
| Variantes de 8 bits y 16 bits | recomendadas por el autor, no publicadas | no disponible |

Comparativa con modelos de la misma categoria (por ejemplo, otras familias conversacionales en el rango de 1B de parametros): no disponible.

## Limitaciones y advertencias

- El rendimiento puede degradarse con contextos muy largos (superiores a 8K tokens) en niveles de cuantizacion bajos, segun advierte la propia model card.
- Es una conversion weight-only: la arquitectura y el comportamiento son los heredados del modelo de origen, de modo que cualquier sesgo, limitacion o fallo del modelo base se mantiene intacto.
- La cuantizacion a 4 bits introduce una perdida de calidad respecto al modelo original; a menor numero de bits, mayor degradacion. No se cuantifica esa perdida con benchmarks en la informacion disponible.
- Requiere Apple Silicon (M1 o posterior) y la libreria MLX; no es ejecutable en GPU NVIDIA, AMD ni en CPU x86 con este formato de pesos.
- El tag `custom_code` implica que la carga del modelo puede requerir ejecutar codigo Python del repositorio, con el riesgo de seguridad asociado a `trust_remote_code`; conviene revisar ese codigo antes de usarlo en produccion.
- No se declaran idiomas soportados; no hay garantia de cobertura multilingue ni de un rendimiento adecuado en castellano.
- No hay informacion sobre sesgos conocidos, tasas de alucinacion, ni evaluaciones de seguridad.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero se hereda del modelo base y conviene verificar la model card original para detalles completos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de publicacion indicada (2026-09-11) es posterior a la de la mayoria de conversiones de referencia; se trata de un artefacto sin validacion comunitaria.
- No se ofrecen variantes GGUF, GGML ni pesos en precision completa dentro de este repositorio.

## Enlaces

- Repositorio HuggingFace (conversion 4 bits MLX): https://huggingface.co/SirSahOl/K2-Horizon-0.9B-chat-mlx-4bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Perfil del autor de la conversion: https://huggingface.co/SirSahOl
- Libreria MLX de Apple: https://github.com/ml-explore/mlx
- Pipeline de conversion MLX Foundry: https://github.com/SirSahOl/mlx-foundry
- Documentacion o paper del modelo base: no disponible
- Demos o espacios asociados: no disponible
