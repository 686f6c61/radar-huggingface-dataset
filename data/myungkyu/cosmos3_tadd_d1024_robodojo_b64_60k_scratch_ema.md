# Myungkyu/cosmos3_tadd_d1024_robodojo_b64_60k_scratch_ema

## Resumen

`cosmos3_tadd_d1024_robodojo_b64_60k_scratch_ema` es un modelo de política de acción para control robótico en bucle cerrado, construido sobre Cosmos3-Nano y publicado por el usuario Myungkyu en Hugging Face. El modelo combina un world model de vídeo con un DiT de acción externo que se condiciona de forma unidireccional (vídeo a acción) mediante un calendario de acciones compartido, lo que permite traducir observaciones visuales en comandos motores dentro de un pipeline de inferencia robótica.

Se trata de un fine-tuning sobre el dataset de simulación RoboDojo (formato LeRobot v3.0) tras 60.000 pasos de entrenamiento con batch de 64 y dimensión de modelo 1024, partiendo de un entrenamiento desde cero (`scratch`). Los pesos publicados son los del EMA final del entrenamiento, convertidos a bf16 y almacenados como checkpoint DCP de rango único, sin estado del optimizador.

El interés del modelo es acotado pero específico: sirve como referencia reproducible de un pipeline Cosmos3 para políticas visomotoras en simulación. El repositorio ocupa 32 GB, no registra descargas ni likes, y no incluye model card con resultados de evaluación, licencia declarada ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World model de vídeo Cosmos3-Nano con DiT de acción externo (condicionamiento unidireccional vídeo→acción, calendario de acciones compartido) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | DCP (`torch.distributed.checkpoint`), bf16, claves `net.*`; requiere `config.yaml` y VAE Wan2.2 externo |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de Cosmos3-Nano: un world model de vídeo que actúa como backbone de representación y un Diffusion Transformer (DiT) de acción separado que consume las representaciones del vídeo para producir acciones. La dimensión del modelo es 1024 (`d1024`), el entrenamiento se realizó desde cero (`scratch`) sobre RoboDojo Sim en formato LeRobot v3.0, con batch de 64 (`b64`) durante 60.000 pasos (`60k`). El condicionamiento es unidireccional: el vídeo informa la acción, no al revés, y ambos módulos comparten el mismo calendario de difusión.

El checkpoint publicado corresponde a los pesos EMA (`net_ema`) del paso final, convertidos a bf16 y almacenados bajo los nombres `net.*` en un DCP de rango único. No se incluye estado del optimizador ni el segundo conjunto de pesos del checkpoint de entrenamiento. El `config.yaml` del repositorio contiene rutas locales sustituidas por marcadores (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`, `<video warm-up checkpoint>`), y el servidor de políticas de cosmos-framework construye el modelo a partir de él, leyendo la longitud de chunk, el ratio de vídeo, el formato de prompt y la configuración de estado. Es necesario apuntar `vae_path` a un fichero local `Wan2.2_VAE.pth` del modelo Wan-AI/Wan2.2-TI2V-5B.

No se documentan en la información disponible detalles sobre el volumen de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de acciones motoras para control robótico en bucle cerrado a partir de observaciones visuales.
- Modelado de dinámica de vídeo como soporte del world model Cosmos3-Nano.
- Condicionamiento vídeo→acción mediante DiT externo con calendario de difusión compartido.
- Integración con el servidor de políticas de cosmos-framework para despliegue de inferencia.
- Entrenamiento y evaluación sobre simulación robótica (RoboDojo Sim, LeRobot v3.0).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Control visomotor en simulación robótica: el modelo traduce observaciones de cámara en comandos de acción dentro de RoboDojo Sim, lo que permite evaluar políticas entrenadas en entornos simulados antes de un posible traslado a hardware.
- Reproducción de pipelines Cosmos3: al incluir `config.yaml` con la configuración de entrenamiento y los pesos EMA, sirve como referencia para replicar el flujo de entrenamiento de una política de acción sobre Cosmos3-Nano.
- Investigación en world models para robótica: el acoplamiento unidireccional vídeo→acción con calendario compartido es un punto de partida para estudiar variantes de condicionamiento y su efecto en la estabilidad del control.
- Benchmarking de políticas en LeRobot v3.0: el checkpoint puede cargarse en el servidor de cosmos-framework y compararse contra otras políticas entrenadas sobre el mismo dataset para medir tasas de éxito en tareas simuladas.
- Fine-tuning posterior: al ser un checkpoint EMA en bf16 sin estado del optimizador, es adecuado como inicialización para nuevos ajustes sobre dominios robóticos distintos, siempre que se reconstruya el estado del optimizador.
- Docencia y prototipado de control robótico: el repositorio incluye sumas SHA-256 y una configuración explícita, lo que facilita montar un entorno reproducible de inferencia con el VAE de Wan2.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 32 GB y los pesos se publican en bf16, por lo que se requiere al menos esa magnitud de memoria para cargar el checkpoint completo, más el VAE Wan2.2 externo.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint, se descarta su ejecución en GPUs de consumo con menos de 32 GB de VRAM.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; con 32 GB de pesos en bf16, no cabe en GPUs de 24 GB sin cuantización adicional, y no se documentan recetas de cuantización.
- Opciones de despliegue: servidor de políticas de cosmos-framework con `--checkpoint-path <dir> --config-file config.yaml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de acción sobre world models de vídeo) con parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y debe considerarse restringido hasta confirmación del autor.
- No se documentan sesgos, pero al entrenarse exclusivamente sobre RoboDojo Sim, la política puede no generalizar a entornos reales o a distribuciones visuales distintas.
- Riesgo de alucinación no evaluado: no hay métricas publicadas de tasa de éxito, error de acción ni robustez ante perturbaciones.
- El checkpoint es un DCP de rango único con solo los pesos EMA; no incluye estado del optimizador, lo que impide reanudar el entrenamiento tal cual.
- Requiere dependencias externas no incluidas en el repositorio: el VAE `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B y el checkpoint base Cosmos3-Nano referenciado como `<Cosmos3-Nano-dcp>`.
- El `config.yaml` contiene rutas locales sustituidas por marcadores; es necesario reemplazarlas antes de ejecutar.
- El repositorio no registra descargas ni likes, y no hay model card con evaluación, lo que limita la confianza en su reproducibilidad.
- No se especifican idiomas soportados; la naturaleza del modelo (control robótico) hace que el soporte lingüístico no sea una capacidad relevante.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_tadd_d1024_robodojo_b64_60k_scratch_ema
- VAE externo requerido: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
