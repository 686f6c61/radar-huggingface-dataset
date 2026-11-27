# brainworkup/d1-2B-MLX-oQ8e

## Resumen

d1-2B-MLX-oQ8e es una version cuantizada del modelo d1-2B, publicada por el usuario brainworkup en Hugging Face. Se trata de un checkpoint multimodal (la etiqueta `lfm3_vl` sugiere una base de la familia LFM3 con capacidad de vision) con 1.918.181.888 parametros totales, de los cuales aproximadamente 1.729B corresponden al modelo de lenguaje y 0.189B a un modulo de vision. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.7.4.dev1) en precision mixta, con un promedio efectivo de 9,242 bits por peso.

El modelo esta empaquetado especificamente para MLX, el framework de Apple para ejecucion de redes neuronales en silicio de la compania (chips M-series). Esto lo hace relevante para desarrolladores que quieren ejecutar inferencia local en Macs con memoria unificada, sin depender de CUDA ni de GPUs dedicadas. El repositorio ocupa 2,2 GB y los pesos se distribuyen en safetensors con codigo personalizado (`custom_code`), lo que implica que la carga requiere confiar en la implementacion incluida en el repo.

La ficha se limita a lo que puede verificarse en los metadatos y la model card disponibles; el autor no publica informacion sobre arquitectura interna, datos de entrenamiento, benchmarks ni licencia, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `lfm3_vl`; transformer multimodal con modulo de vision, sin confirmar) |
| Parametros totales | 1.918.181.888 (1,918B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ: affine 8-bit grupo 64 (90,107% de los pesos, 8,50 bits/peso) + BF16 (9,893%, 16,00 bits/peso); promedio efectivo 9,242 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `mlx`, requiere `custom_code`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base d1-2B. La etiqueta `lfm3_vl` en Hugging Face apunta a un modelo de la familia LFM3 con modulo de vision, y el desglose de almacenamiento confirma la existencia de dos componentes: un modelo de lenguaje de 1,729B parametros y un modulo de vision de 0,189B parametros. No se especifica si el backbone es un transformer denso, un hibrido o un MoE.

Respecto al entrenamiento, la model card no documenta el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La unica informacion tecnica disponible es el proceso de cuantizacion: se aplico oQ (oMLX v0.7.4.dev1) con precision mixta, manteniendo en BF16 el 9,893% de los pesos (0,190B, 0,353 GiB) y cuantizando el resto a affine 8-bit con grupo de 64. El resultado son 2,064 GiB de pesos logicos, con el modelo de lenguaje ocupando 1,711 GiB y la vision 0,353 GiB.

## Capacidades

- Generacion de texto: el componente de lenguaje de 1,729B parametros permite generacion autoregresiva estandar, aunque no hay datos publicados sobre calidad.
- Procesamiento de vision: la presencia de un modulo de vision de 0,189B parametros y la etiqueta `lfm3_vl` indican capacidad de entrada de imagenes, sin detalle sobre tareas concretas (VQA, OCR, captioning).
- Inferencia en MLX: el checkpoint esta disenado para ejecutarse con la libreria MLX de Apple, lo que habilita despliegue en Macs con chips M1/M2/M3/M4.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con MLX en un Mac con memoria unificada suficiente para experimentar con un modelo multimodal de ~2B sin GPU dedicada. El tamano de 2,2 GB del repo lo hace manejable en equipos de 16 GB o mas.
- Pruebas de pipelines de vision-lenguaje: usar el modulo de vision para validar flujos de descripcion de imagenes o respuesta a preguntas visuales en un entorno de desarrollo antes de escalar a modelos mayores.
- Evaluacion de cuantizacion: servir como referencia para comparar la calidad de la cuantizacion mixta oQ (8-bit + BF16) frente al modelo base en tareas concretas, ya que la model card detalla la distribucion de bits por componente.
- Educacion e investigacion: estudiar el comportamiento de un modelo multimodal pequeno cuantizado en un framework no-CUDA, util en cursos o laboratorios con hardware Apple.
- Inferencia offline en dispositivos: al no requerir conexion ni servidores, encaja en escenarios de privacidad donde los datos no deben salir del equipo, como analisis de imagenes medicas o documentos internos (sujeto a la licencia, no disponible).
- Integracion en herramientas de escritorio para macOS: el formato MLX permite incrustar el modelo en aplicaciones nativas de Apple que necesiten generacion de texto o analisis de imagenes en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 2,064 GiB; con overhead de activaciones y cache KV, se recomienda al menos 4-6 GB de memoria unificada para inferencia basica, aunque no hay cifras oficiales.
- GPU recomendadas: al ser un checkpoint MLX, el hardware objetivo son los chips Apple M1, M2, M3 y M4 (incluidas variantes Pro, Max y Ultra). No esta pensado para CUDA (A100, H100, RTX 4090).
- Compatibilidad con consumer GPU: cabe en cualquier Mac con 16 GB de memoria unificada o mas; en GPUs NVIDIA no es directamente utilizable sin conversion.
- Opciones de despliegue: MLX (libreria nativa), con posible uso de `mlx-lm` para el componente de lenguaje; requiere `custom_code` del repositorio. No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable: se desconocen la licencia, el contexto, los benchmarks y el modelo base exacto. Como referencia estructural, se puede comparar con otros modelos multimodales pequenos cuantizados para MLX, pero sin datos de rendimiento la comparacion seria especulativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| d1-2B-MLX-oQ8e | 1,918B | no disponible | no disponible | safetensors MLX | Cuantizacion mixta oQ 9,242 bits/peso |
| Alternativas de ~2B multimodales para MLX | no disponible | no disponible | no disponible | no disponible | Sin datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es un riesgo critico para produccion.
- Idiomas no declarados: se desconoce el soporte multilingue y la calidad en castellano.
- Ausencia de benchmarks: no hay evidencia publicada de calidad en tareas de texto, codigo, matematicas o vision.
- Dependencia de `custom_code`: la carga del modelo requiere ejecutar codigo incluido en el repositorio, lo que implica un riesgo de seguridad y de mantenimiento.
- Cuantizacion mixta: el 9,893% de los pesos en BF16 y el resto en 8-bit puede introducir degradacion no documentada respecto al modelo original.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluaciones publicadas no puede acotarse.
- Sesgos: no documentados por el autor.
- Ecosistema limitado: solo MLX; no hay soporte para CUDA, llama.cpp u otros runners, lo que restringe el despliegue a hardware Apple.
- Popularidad baja: 193 descargas y 1 like en el momento de la consulta, lo que reduce la probabilidad de que los problemas esten reportados por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brainworkup/d1-2B-MLX-oQ8e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
