# ipplab/Wan2.2-TI2V-5B-Orbax

## Resumen

Wan2.2-TI2V-5B-Orbax es una conversión de los pesos oficiales del modelo Wan2.2-TI2V-5B de Wan-AI (Alibaba) al formato Orbax OCDBT para su uso con el framework de investigación FastWAM-JAX. No se trata de un modelo nuevo ni de un fine-tune con datos adicionales: es un artefacto de conversión de pesos que preserva los tensores originales en FP32, remapeando nombres de parámetros y layouts para que el transformer de difusión de vídeo y el VAE puedan cargarse en JAX. Lo publica el laboratorio iPPLab.

El modelo subyacente, Wan2.2-TI2V-5B, es un modelo de difusión de vídeo de 5.000 millones de parámetros que genera vídeo a partir de texto e imagen (text-to-video e image-to-video). En este repositorio, el transformer de difusión se emplea como inicialización del "experto de vídeo" de FastWAM-JAX y como base para derivar los pesos iniciales del "experto de acción" en un sistema de world models orientado a robótica (concretamente, políticas entrenadas sobre el benchmark RoboTwin).

Su relevancia es acotada pero específica: cubre un hueco práctico para los equipos que trabajan con JAX en lugar de PyTorch y necesitan los pesos de Wan2.2 en formato Orbax sin tener que ejecutar la conversión por su cuenta. El repositorio ocupa 21,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para video, mas VAE de video congelado |
| Parametros totales | 5.000 millones (heredados de Wan2.2-TI2V-5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (los checkpoints publicados no estan cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax OCDBT (JAX); el modelo base se distribuye en safetensors/PyTorch |
| Tamano del repositorio | 21,1 GB |
| Directorios incluidos | `video_dit/` (transformer de difusion de video) y `vae/` (autoencoder de video congelado) |
| Modelo base | Wan-AI/Wan2.2-TI2V-5B |
| Framework de destino | FastWAM-JAX (github.com/iPPLab/FastWAM-JAX) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: convierte los pesos oficiales de Wan2.2-TI2V-5B desde PyTorch a JAX y los almacena en formato Orbax OCDBT. La conversión remapea nombres de parámetros y layouts de tensores para que coincidan con la implementación JAX de FastWAM-JAX, y el autor indica que verificó los pesos restaurados contra los tensores de origen en el mismo layout. Se mantiene precisión FP32 en todo el checkpoint.

La arquitectura subyacente es un transformer de difusión de vídeo (video DiT) acompañado de un VAE de vídeo congelado. En el flujo de FastWAM-JAX, el DiT inicializa el experto de vídeo y sirve para derivar los pesos iniciales del experto de acción; el VAE se carga leyendo `vae_config.json` antes de restaurar sus pesos. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO; esos detalles pertenecen a la model card del modelo base Wan2.2-TI2V-5B, no a este repositorio de conversión.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen (image-to-video), heredadas del modelo base Wan2.2-TI2V-5B.
- Codificación y decodificación de vídeo mediante el VAE incluido en `vae/`.
- Inicialización de expertos de vídeo y de acción en el framework FastWAM-JAX para entrenamiento de world models.
- Inferencia de políticas robóticas entrenadas sobre RoboTwin mediante el checkpoint `ipplab/FastWAM-JAX-RoboTwin-Uncond` (que ya incorpora su experto de vídeo entrenado y solo requiere el VAE de este repositorio).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en world models para robótica: el DiT se usa para inicializar el experto de vídeo de FastWAM-JAX, lo que permite partir de pesos preentrenados a gran escala en lugar de entrenar desde cero.
- Entrenamiento de políticas en RoboTwin: configurando `paths.read.video_dit_orbax` y `paths.read.vae_orbax` en la receta de entrenamiento de FastWAM-JAX, el equipo obtiene los dos componentes necesarios para el pipeline completo.
- Inferencia de políticas robóticas: descargando solo `vae/` junto con el checkpoint `FastWAM-JAX-RoboTwin-Uncond`, se puede ejecutar la política entrenada en JAX sin cargar el DiT base.
- Migración de pipelines de vídeo de PyTorch a JAX: los pesos convertidos y verificados evitan tener que reimplementar la conversión de nombres y layouts de tensores.
- Experimentos de generación de vídeo condicionada por imagen en entornos JAX: el VAE y el DiT permiten construir variantes de generación vídeo-a-vídeo o imagen-a-vídeo dentro del ecosistema JAX.
- Reproducibilidad de resultados: al conservar los tensores originales en FP32 y verificar la restauración, sirve como referencia para comparar implementaciones JAX frente a las originales en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 21,1 GB en FP32; cargar el DiT y el VAE completos en memoria requiere al menos ese orden de magnitud, aunque la cifra exacta de VRAM en ejecución no está documentada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, se requiere una GPU con memoria suficiente para pesos FP32 de 5.000 millones de parámetros más activaciones (gama A100/H100 o equivalente).
- ¿Cabe en GPU de consumo? No disponible; con 21,1 GB de pesos en FP32, las GPU de consumo de 24 GB quedan al límite y no hay datos publicados de ejecución.
- Opciones de despliegue: FastWAM-JAX (carga mediante `fastwam_jax.models.wan.vae.load_vae` y las rutas de receta `video_dit_orbax` / `vae_orbax`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Framework | Licencia | Notas |
|---|---|---|---|---|---|
| ipplab/Wan2.2-TI2V-5B-Orbax | 5.000 M | Orbax OCDBT (FP32) | JAX (FastWAM-JAX) | Apache 2.0 | Conversion de pesos, sin entrenamiento adicional |
| Wan-AI/Wan2.2-TI2V-5B | 5.000 M | PyTorch (safetensors) | PyTorch | Apache 2.0 | Modelo original de referencia |
| ipplab/FastWAM-JAX-RoboTwin-Uncond | no disponible | Orbax | JAX (FastWAM-JAX) | no disponible | Politica RoboTwin entrenada; incluye su experto de video |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado ni afinado: es una conversión de formato. Cualquier limitación del modelo base Wan2.2-TI2V-5B (sesgos, alucinación visual, calidad de generación) se hereda íntegramente.
- Los pesos están en FP32 y el repositorio pesa 21,1 GB; el despliegue en hardware limitado requiere cuantización propia, no incluida ni documentada.
- El uso está atado al framework FastWAM-JAX: no hay instrucciones ni garantías de carga en otras implementaciones JAX.
- La licencia Apache 2.0 se hereda del modelo original de Wan; conviene revisar los términos upstream del modelo base para uso comercial.
- No hay datos publicados de benchmarks, latencia, throughput ni requisitos de VRAM en este repositorio.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de validación por parte de la comunidad.
- No se documentan idiomas soportados ni sesgos específicos en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ipplab/Wan2.2-TI2V-5B-Orbax
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Revision concreta del modelo base citada: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B/tree/921dbaf3f1674a56f47e83fb80a34bac8a8f203e
- Framework FastWAM-JAX: https://github.com/iPPLab/FastWAM-JAX
- Checkpoint de politica RoboTwin: https://huggingface.co/ipplab/FastWAM-JAX-RoboTwin-Uncond
