# open-athena/Marin-Mochi-Ladder-Base-d768-H100

## Resumen

Marin-Mochi-Ladder-Base-d768-H100 es un checkpoint intermedio de preentrenamiento de la familia Marin, publicado por la organizacion open-athena. Se trata de un artefacto de investigacion con arquitectura Grug MoE (mixture of experts con layout de expertos separados en safetensors), derivado de la receta de entrenamiento "Mochi recipe ladder" con configuracion base-d768-h100 y detenido en el paso 11420. Cuenta con 1.591.848.448 parametros totales y un payload BF16 de 3.183.696.896 bytes.

El modelo no ha sido entrenado especificamente para instrucciones ni ajustado con RLHF o DPO: es una exportacion directa en BF16 de un checkpoint de preentrenamiento, sin entrenamiento adicional. Su interes es cientifico y experimental, orientado a estudiar la dinamica de entrenamiento de arquitecturas MoE de escala pequena (d768) en hardware H100, no a un uso productivo directo. El autor advierte explicitamente de que no ha sido probado ni evaluado de forma adecuada.

La relevancia actual radica en que forma parte de una linea de publicaciones de checkpoints intermedios de Marin que permiten reproducir curvas de aprendizaje, comparar recetas (mixture-swap, twins en H100) y validar el formato de exportacion Grug MoE. No es compatible con Transformers estandar: requiere una implementacion Grug especifica para cargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grug MoE (mixture of experts, expertos separados en safetensors, schema 3) |
| Parametros totales | 1.591.848.448 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportacion en BF16) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (BF16, payload de 3.183.696.896 bytes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Grug MoE, una implementacion de mezcla de expertos de Marin con un layout de safetensors que separa los pesos de cada experto (artifact schema 3). El checkpoint corresponde a la receta "Mochi ladder" con dimension base d768 y entrenamiento en H100, identificado internamente como `h100-ladder-d768-2xep8-bs1024-791tpp-20260824`. El nombre sugiere 2 expertos por capa (2xep8) y un tamano de batch de 1024, aunque la model card no detalla la topologia completa en el texto exportado.

El entrenamiento se detuvo en el paso 11420 y la exportacion es un volcado BF16 sin entrenamiento adicional. El tokenizer utilizado es `marin-community/marin-tokenizer` en la revision `a5ca45f2feb6c959bd87b81689aa7279b5bdcaa2`. Los ficheros `config.yaml` y `training-config.json` del repositorio serializan la configuracion resuelta del run obtenida de la API de W&B, mientras que `config.json` describe la arquitectura de inferencia exportada. No se dispone de informacion sobre el numero total de tokens vistos, la composicion del dataset ni si hubo fases de alineamiento.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del preentrenamiento.
- Razonamiento y conocimiento general limitados por el estado intermedio del checkpoint (paso 11420), sin evaluacion publicada.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- No es un modelo instruct: no sigue instrucciones ni formatos conversacionales de forma fiable pese a la etiqueta `conversational` del pipeline.

## Casos de uso

- Investigacion sobre dinamica de entrenamiento MoE: el checkpoint permite analizar la evolucion de los pesos y la especializacion de expertos en el paso 11420, comparandolo con otros checkpoints de la misma ladder.
- Reproducibilidad de recetas: sirve para validar la receta Mochi ladder base-d768-h100 y contrastar resultados con los twins en H100 y los runs de mixture-swap publicados en repositorios separados.
- Desarrollo y prueba de la implementacion Grug: util para verificar la carga de safetensors con layout de expertos separados y el pipeline de exportacion (exporter revision `11f51b3fad1e9b3d8e71093644db003c6825cac4`).
- Analisis de curvas de scaling: al ser un checkpoint intermedio, permite estudiar la relacion entre pasos de entrenamiento y metricas de validacion en modelos de ~1,6B parametros.
- Experimentos de continuacion de preentrenamiento: puede emplearse como inicializacion para fine-tuning controlado en entornos de investigacion con recursos limitados.
- Auditoria de artefactos de Marin: util para inspeccionar la serializacion de `config.yaml` y `training-config.json` y comprobar la coherencia entre la configuracion de entrenamiento y la de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 6 y 10 GB dependiendo de la longitud de contexto y del batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, unos 0,8 GB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: el checkpoint se entreno en H100; para inferencia basta con una GPU consumer con al menos 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4090).
- Cabe en GPU consumer: si, siempre que se disponga de una implementacion Grug compatible; no funciona con Transformers estandar.
- Opciones de despliegue: no disponible para vLLM, llama.cpp, Ollama o TGI de forma directa, ya que requieren soporte de la arquitectura Grug MoE. La via documentada es la guia de exportacion y carga de Marin en GitHub.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Marin-Mochi-Ladder-Base-d768-H100 | 1,59B | no disponible | openmdw-1.1 | Hugging Face (open-athena) | Checkpoint intermedio, requiere Grug |
| Marin Grug MoE (otros checkpoints de la ladder) | variable | no disponible | openmdw-1.1 | Repositorios separados de Marin | Misma receta, distintos pasos o configuraciones |
| Modelos densos ~1,5B de proposito general | ~1,5B | variable | variable | Hugging Face | Compatibles con Transformers; no comparables en arquitectura |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo no evaluado: el autor indica explicitamente que no ha sido probado ni evaluado adecuadamente y que puede no ser seguro.
- Checkpoint intermedio: al estar en el paso 11420 de una ladder de preentrenamiento, su calidad de generacion es inferior a la de un modelo final.
- Sin alineamiento: no ha pasado por RLHF, DPO ni ajuste de instrucciones; puede producir contenido sesgado, toxico o factualmente incorrecto.
- Riesgo de alucinacion elevado por el estado temprano del entrenamiento y la ausencia de evaluacion.
- Idiomas y contexto no declarados: no se puede garantizar soporte multilingue ni una ventana de contexto concreta.
- Incompatibilidad con Transformers estandar: requiere una implementacion Grug especifica; las herramientas habituales (vLLM, llama.cpp, TGI) no lo cargan de forma nativa.
- Licencia openmdw-1.1: conviene revisar los terminos completos antes de cualquier uso comercial; el autor no ofrece garantias.
- Uso en produccion desaconsejado: la model card lo califica de artefacto de investigacion y recomienda usarlo bajo responsabilidad propia.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/Marin-Mochi-Ladder-Base-d768-H100
- Run de W&B: https://wandb.ai/marin-community/marin_moe/runs/h100-ladder-d768-2xep8-bs1024-791tpp-20260824
- Issue de seguimiento del release: https://github.com/marin-community/marin/issues/12230
- Guia de exportacion y carga Grug MoE: https://github.com/marin-community/marin/blob/11f51b3fad1e9b3d8e71093644db003c6825cac4/experiments/grug/moe_hero_ep/README.md#inference-export
- Tokenizer: https://huggingface.co/marin-community/marin-tokenizer
