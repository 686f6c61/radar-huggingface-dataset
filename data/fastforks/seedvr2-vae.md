# fastforks/seedvr2-vae

## Resumen

`fastforks/seedvr2-vae` no es un modelo generativo de lenguaje, sino un repositorio de pesos que contiene el VAE causal 3-D del sistema SeedVR2, desarrollado originalmente por ByteDance Seed y publicado en el articulo "SeedVR2: One-Step Video Restoration via Diffusion Adversarial Post-Training" (Wang et al., 2025). Este VAE es el componente de codificacion/decodificacion latente que acompana a los modelos de restauracion de video SeedVR2-3B y SeedVR2-7B, y aqui se distribuye convertido a formato safetensors en bfloat16 por el equipo de fastforks.

El interes de esta publicacion es practico: facilita el acceso al VAE en un formato estandar (safetensors) verificado por SHA-256, lo que simplifica su carga en pipelines de inferencia sin depender de los checkpoints `.pth` originales de PyTorch. El repositorio esta pensado como dependencia de los modelos `seedvr2-3b@1` y `seedvr2-7b@1` del ecosistema fastforks, no como modelo autonomo.

No se dispone de informacion sobre arquitectura detallada, numero de parametros, contexto ni idiomas en la model card proporcionada; los datos disponibles se limitan al origen, la conversion, el tamano del fichero y la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE causal 3-D (componente de SeedVR2, segun model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en bfloat16 |
| Idiomas soportados | no disponible (procesa video, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`seedvr2-vae.safetensors`, 478,1 MiB / 501.325.110 bytes) |

## Arquitectura y entrenamiento

Segun la model card, se trata del VAE causal 3-D empleado por SeedVR2, el sistema de restauracion de video en un solo paso propuesto por ByteDance Seed mediante diffusion adversarial post-training. El fichero corresponde al original `ema_vae.pth` (SHA-256 `c7df8a67e68b7f9aca3d5d2153d2ce8ab4373687741a0f9ce87cb356ace51cac`), presente de forma identica en los repositorios ByteDance-Seed/SeedVR2-3B y SeedVR2-7B.

La conversion realizada por fastforks no implica reentrenamiento: todos los tensores se han pasado a bfloat16 (el mismo tipo con el que upstream ejecuta el VAE, `vae.dtype = bfloat16`) y se han conservado las claves originales. El fichero resultante tiene SHA-256 `bcf7f47d490efcfdce05659510baec78e6bb8301ae6b2dee584a09bdfa54cd4a`. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO, ya que se trata de un autoencoder latente y no de un modelo de lenguaje.

## Capacidades

- Codificacion y decodificacion latente 3-D de video, como componente del pipeline SeedVR2.
- Soporte de restauracion de video en un solo paso cuando se combina con los modelos SeedVR2-3B o SeedVR2-7B.
- Carga en bfloat16 directamente desde safetensors, sin necesidad de conversion desde `.pth`.
- Verificacion de integridad mediante SHA-256 en la descarga gestionada por fastforks.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingues ni de generacion de texto.

## Casos de uso

- Restauracion de video en pipelines de postproduccion: el VAE se usa como codificador/decodificador latente junto a los pesos SeedVR2-3B o SeedVR2-7B para recuperar detalle en metraje degradado.
- Integracion en el ecosistema fastforks: sirve como dependencia descargable y verificable para los modelos `seedvr2-3b@1` y `seedvr2-7b@1`, evitando la gestion manual de checkpoints `.pth`.
- Reproducibilidad de experimentos: al fijar el SHA-256 del fichero, permite replicar resultados de restauracion con garantia de que los pesos son identicos a los originales.
- Despliegue en entornos con requisitos de formato: la disponibilidad en safetensors facilita la carga en frameworks que no admiten `.pth` por motivos de seguridad (pickle).
- Investigacion sobre VAEs causales 3-D: util como componente aislado para estudiar el espacio latente de SeedVR2 sin cargar los modelos de difusion completos.
- Empaquetado en contenedores o artefactos de CI: el fichero unico de 478 MiB y su hash permiten cachearlo y validarlo en pipelines de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el fichero pesa 478,1 MiB en bfloat16, por lo que la huella del VAE es reducida en comparacion con los modelos de difusion asociados.
- GPU recomendadas: no disponible; depende del pipeline SeedVR2 completo (3B o 7B) con el que se use.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: carga directa de safetensors en PyTorch; descarga mediante `hf download fastforks/seedvr2-vae seedvr2-vae.safetensors` o `fastforks download MODEL`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros VAEs comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere los pesos SeedVR2-3B o SeedVR2-7B y el codigo del pipeline para funcionar.
- No procesa texto ni lenguaje: no debe evaluarse con benchmarks de LLM (MMLU, HumanEval, GSM8K).
- La model card no documenta sesgos, tasas de alucinacion ni limitaciones de contexto porque no aplican al tipo de componente.
- La licencia Apache-2.0 permite uso comercial, pero el copyright permanece con los autores originales (ByteDance Seed); fastforks declara no estar afiliado a ellos.
- El repositorio se actualiza poco despues de su creacion (2026-11-15) y no registra descargas ni likes, por lo que su adopcion es nula en el momento de la consulta.
- Cualquier modificacion del fichero invalida el SHA-256 documentado; conviene verificar la integridad antes de cargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/seedvr2-vae
- Repositorio upstream (SeedVR2-3B): https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Codigo oficial SeedVR: https://github.com/ByteDance-Seed/SeedVR
- Licencia upstream: https://github.com/ByteDance-Seed/SeedVR/blob/e4de8c24441a67e1b7df56abea10645059bb1185/LICENSE
- Proyecto fastforks: https://github.com/kleinicke/fastforks
