# Mitroshenkov87/voxprint-mirror-z-image-turbo

## Resumen

`voxprint-mirror-z-image-turbo` es un espejo de respaldo sin modificaciones del modelo de difusion texto-a-imagen **Tongyi-MAI/Z-Image-Turbo**, desarrollado originalmente por Tongyi-MAI (Alibaba). El repositorio lo publica el usuario Mitroshenkov87 como fuente de descarga alternativa para el proyecto VOXPrint AI Canvas, y no tiene afiliacion con los autores originales. Todos los pesos son byte a byte identicos al commit `f332072aa78be7aecdf3ee76d5c247082da564a6` del repositorio upstream.

El modelo es un pipeline de difusion para generacion de imagenes a partir de texto, con un transformer de difusion de aproximadamente 6.150 millones de parametros (segun los safetensors del repositorio), acompanado de un text encoder de unos 8.000 millones de parametros distribuidos en tres shards y un VAE de 167 MB. El repositorio completo ocupa 57,5 GB en formato safetensors y se distribuye bajo licencia Apache-2.0.

Su relevancia es practica: al tratarse de un espejo integro del modelo original, permite a los usuarios de VOXPrint disponer de una fuente de descarga redundante si el repositorio upstream no esta disponible. No incorpora fine-tuning, cambios de arquitectura ni conversiones de precision; la conversion BF16 propia del proyecto se publica en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion (transformer de difusion + text encoder + VAE), clase `diffusers.ZImagePipeline` |
| Parametros totales | 6.154.908.736 (transformer de difusion, segun safetensors); el text encoder suma aproximadamente 8.000 millones adicionales en tres shards |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors; existe una conversion BF16 en repositorio aparte) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards de `diffusers`), con ficheros `.sha256` sidecar por archivo |

## Arquitectura y entrenamiento

El repositorio contiene un pipeline `diffusers` compuesto por tres componentes: un text encoder en tres shards safetensors (aproximadamente 3,96 GB, 3,99 GB y 99,6 MB), un transformer de difusion en tres shards (aproximadamente 9,97 GB, 9,97 GB y 4,67 GB) y un VAE de 167,7 MB. El scheduler se configura mediante `scheduler/scheduler_config.json`. El tokenizador incluye `vocab.json`, `merges.txt`, `tokenizer.json` y `tokenizer_config.json`, compatible con un tokenizador de tipo BPE.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se aplicaron tecnicas de RLHF, DPO o destilacion por pasos (pese al sufijo "Turbo" del nombre original). Tampoco se documentan innovaciones tecnicas especificas en la informacion disponible. El mirror no altera ningun fichero respecto al upstream: los hashes SHA-256 de cada archivo coinciden con los del repositorio original.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (pipeline `text-to-image`).
- Integracion nativa con la libreria `diffusers` mediante la clase `ZImagePipeline`.
- Carga de pesos en formato safetensors con verificacion de integridad mediante ficheros `.sha256` sidecar.
- Compatibilidad con el ecosistema de VOXPrint AI Canvas como fuente de descarga de respaldo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, agentes o razonamiento multi-paso: no aplicable (modelo de generacion de imagenes).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- **Generacion de ilustraciones para prototipado de producto**: el pipeline permite crear imagenes de referencia a partir de prompts de texto en fases tempranas de diseno, sin necesidad de encargar arte final.
- **Creacion de assets para videojuegos y aplicaciones**: generacion de iconos, fondos y elementos de interfaz de forma automatizada, integrable en pipelines de `diffusers` en Python.
- **Generacion de contenido para marketing**: produccion de variaciones visuales de un concepto a partir de descripciones textuales, util para pruebas A/B de creatividades.
- **Investigacion en modelos generativos**: al ser un espejo fiel del modelo original, sirve como referencia reproducible para experimentos de comparacion o ablacion con el mismo commit.
- **Integracion en VOXPrint AI Canvas**: uso directo como fuente de descarga alternativa cuando el repositorio upstream no esta accesible, garantizando la continuidad del servicio.
- **Generacion de imagenes en entornos con requisitos de trazabilidad**: los ficheros `.sha256` sidecar permiten verificar la integridad de los pesos descargados antes de cargarlos en produccion.
- **Despliegue en pipelines de difusion autoalojados**: carga mediante `diffusers` en servidores propios con GPU, sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Como referencia orientativa, el transformer de difusion ocupa aproximadamente 23,5 GB en safetensors (suma de los tres shards), el text encoder unos 8 GB y el VAE 167 MB; la carga completa en precision nativa requiere del orden de 30-35 GB de VRAM, aunque esta cifra no esta confirmada por el autor.
- **GPU recomendadas**: no disponible en la informacion proporcionada. Por el volumen de pesos, se necesitarian GPU con 40-80 GB de memoria (A100, H100) para una carga completa en precision nativa.
- **Compatibilidad con GPU de consumo**: no confirmada. Una RTX 4090 (24 GB) no podria cargar el pipeline completo en precision nativa sin tecnicas de offloading o cuantizacion, no documentadas en este repositorio.
- **Opciones de despliegue**: `diffusers` (clase `ZImagePipeline`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion). No se menciona compatibilidad con ComfyUI ni Automatic1111.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| voxprint-mirror-z-image-turbo | 6.154.908.736 (transformer) | no disponible | Apache-2.0 | Hugging Face (mirror) | Espejo sin modificaciones de Tongyi-MAI/Z-Image-Turbo |
| Tongyi-MAI/Z-Image-Turbo | no disponible en la informacion | no disponible | Apache-2.0 | Hugging Face (upstream) | Modelo original; el mirror es byte a byte identico |
| Mitroshenkov87/voxprint-z-image-turbo-bf16 | no disponible | no disponible | no disponible | Hugging Face | Conversion BF16 del transformer realizada por VOXPrint |

No se dispone de datos de rendimiento comparativo con otras alternativas de generacion texto-a-imagen (Stable Diffusion, FLUX, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- **Es un espejo, no un modelo nuevo**: cualquier mejora, correccion de errores o actualizacion debe buscarse en el repositorio upstream `Tongyi-MAI/Z-Image-Turbo`; este mirror no recibe mantenimiento funcional.
- **Sin afiliacion con el autor original**: el mirror lo publica un tercero (Mitroshenkov87) y no esta respaldado por Tongyi-MAI ni Alibaba.
- **Sesgos**: no documentados en la informacion disponible; al ser un modelo de difusion texto-a-imagen, es esperable que herede sesgos de su dataset de entrenamiento, no descritos aqui.
- **Riesgo de alucinacion visual**: no documentado; como todo modelo generativo de imagenes, puede producir contenido incoherente o no solicitado respecto al prompt.
- **Idiomas**: no disponibles; se desconoce si el text encoder y el tokenizador estan optimizados para castellano u otros idiomas distintos del ingles.
- **Licencia**: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion; debe conservarse el aviso de licencia y los creditos a Tongyi-MAI.
- **Integridad de pesos**: se recomienda verificar los hashes SHA-256 con los ficheros sidecar antes de cargar los pesos en produccion.
- **Assets no incluidos**: el mirror no incluye las imagenes de ejemplo ni el README del repositorio upstream.
- **Conversion BF16 separada**: la version BF16 del transformer esta en otro repositorio; este mirror contiene unicamente los pesos originales.
- **Caveat de produccion**: el tamano del repositorio (57,5 GB) y la ausencia de documentacion sobre cuantizacion o latencia hacen recomendable una validacion propia antes de desplegarlo en entornos con restricciones de memoria.

## Enlaces

- Repositorio del mirror: https://huggingface.co/Mitroshenkov87/voxprint-mirror-z-image-turbo
- Modelo original: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Commit upstream referenciado: `f332072aa78be7aecdf3ee76d5c247082da564a6`
- Conversion BF16 de VOXPrint: https://huggingface.co/Mitroshenkov87/voxprint-z-image-turbo-bf16
- Proyecto VOXPrint AI Canvas: https://github.com/Mitroshenkov87/voxprint-canvas
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
