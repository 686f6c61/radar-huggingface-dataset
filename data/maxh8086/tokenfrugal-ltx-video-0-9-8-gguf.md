# maxh8086/tokenfrugal-ltx-video-0.9.8-gguf

## Resumen

tokenfrugal-ltx-video-0.9.8-gguf es un espejo privado de pesos en formato GGUF del modelo de generacion de video LTX-Video 0.9.8 de Lightricks, concretamente la variante destilada de 2B parametros (ltxv-2b-0.9.8-distilled). El autor del repositorio, maxh8086, ha convertido localmente el transformer desde los safetensors originales en bf16 a cuantizacion Q8_0 GGUF, y ha separado el VAE en un fichero independiente en BF16. No se trata de un modelo de lenguaje, sino de un modelo de difusion para sintesis de video, por lo que las metricas habituales de perplexidad o benchmarks de texto no aplican.

El repositorio contiene dos artefactos: el transformer cuantizado (2.046.580.448 bytes, aproximadamente 2 GB) y el VAE en BF16 (2.493.857.180 bytes, aproximadamente 2,5 GB), lo que suma un total de 4,5 GB de tamano de repo. El recuento de parametros reportado en safetensors es de 1.923.385.472, lo que corresponde a la variante de 2B del modelo original.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de generacion de video de 2B en entornos con recursos limitados mediante cuantizacion Q8_0, manteniendo el VAE en BF16 para preservar la calidad de reconstruccion. No obstante, se trata de un mirror privado sin validacion publicada de calidad de video (el propio autor indica que la prueba en ComfyUI no se ha ejecutado aun).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video (transformer de LTX-Video 0.9.8, variante destilada 2B); detalles internos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 1.923.385.472 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no de texto) |
| Tipos de cuantizacion | Q8_0 (transformer GGUF); VAE en BF16 |
| Idiomas soportados | no disponible |
| Licencia | LTX-Video Open Weights License (Lightricks), segun la model card |
| Formato de pesos | GGUF (transformer Q8_0) y safetensors (VAE BF16) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del transformer de LTX-Video 0.9.8 mas alla de su naturaleza como modelo de difusion para video. Se sabe que la variante utilizada es la destilada de 2B parametros (ltxv-2b-0.9.8-distilled), derivada de los pesos originales de Lightricks en safetensors bf16. El proceso aplicado en este repositorio es exclusivamente de conversion y cuantizacion: el transformer se ha convertido a Q8_0 GGUF y el VAE se ha separado y mantenido en BF16.

El autor reporta una comprobacion de ida y vuelta de pesos (round-trip) con un error relativo de aproximadamente 0,6 a 0,7 % en los tensores muestreados, medida con el script `convert_ltx098.py`. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens o fotogramas, ni sobre si hubo etapas de RLHF, DPO u otras tecnicas de alineacion, ya que esos datos pertenecen a la model card original de Lightricks y no se incluyen en la informacion disponible.

## Capacidades

- Generacion de video a partir de prompts (modelo de difusion texto-a-video, segun la denominacion LTX-Video).
- Variante destilada, orientada a reducir el numero de pasos de muestreo necesarios en comparacion con el modelo base.
- Ejecucion en formato GGUF, lo que facilita su integracion en herramientas compatibles con este formato.
- Separacion del VAE en BF16, lo que permite mantener la calidad de decodificacion de video mientras el transformer se ejecuta cuantizado.
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos especiales (thinking, vision, audio), ya que no son aplicables o no estan documentados para este modelo de difusion.

## Casos de uso

- Generacion de clips de video cortos en estaciones de trabajo con VRAM limitada: la cuantizacion Q8_0 del transformer reduce el peso del componente principal a unos 2 GB, lo que permite cargarlo junto al VAE BF16 (2,5 GB) en GPUs de consumo con 8-12 GB de VRAM, siempre que el runtime lo soporte.
- Prototipado de pipelines texto-a-video en ComfyUI: el autor menciona explicitamente ComfyUI como entorno de prueba previsto, por lo que el modelo esta pensado para integrarse en flujos de nodos de generacion de video.
- Experimentacion con modelos de difusion de 2B en entornos de investigacion con presupuesto de hardware ajustado, aprovechando el error de cuantizacion bajo (0,6-0,7 %) reportado.
- Evaluacion comparativa de calidad de cuantizacion: el repositorio incluye la metodologia de verificacion (round-trip de pesos), lo que permite reproducir el analisis de degradacion frente a los pesos bf16 originales.
- Despliegue en servidores sin GPUs de gama alta: al reducir el transformer a Q8_0, se puede intentar la inferencia en GPUs de 16 GB o menos, aunque no hay datos publicados de latencia ni throughput.
- Archivo y distribucion interna de pesos: al ser un mirror privado, sirve para sincronizar el modelo entre maquinas de un mismo equipo mediante el script `scripts/hf_models.py pull` mencionado en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la perplexidad no aplica por tratarse de un modelo de difusion y que la prueba de salida de video en ComfyUI no se ha ejecutado aun. El unico dato cuantitativo de rendimiento es el error relativo de cuantizacion Q8_0 frente a la fuente, de aproximadamente 0,6 a 0,7 % en tensores muestreados.

## Requisitos de hardware

- VRAM estimada: el transformer Q8_0 ocupa unos 2 GB en disco y el VAE BF16 unos 2,5 GB; la VRAM necesaria en inferencia sera superior a la suma de pesos debido a activaciones y buffers de difusion, pero no se dispone de una cifra medida.
- GPU recomendadas: no disponible. Por tamano, cabria esperar viabilidad en GPUs de consumo con 12-16 GB de VRAM, pero no hay validacion publicada.
- Cabe en GPU de consumo: probablemente en modelos con 12 GB o mas de VRAM, sin confirmacion del autor.
- Opciones de despliegue: el autor menciona ComfyUI como entorno previsto; el formato GGUF sugiere compatibilidad con runtimes que soporten este formato para difusion, aunque no se detallan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto / modalidad | Disponibilidad |
|---|---|---|---|---|---|
| tokenfrugal-ltx-video-0.9.8-gguf (este) | 1.923.385.472 | GGUF Q8_0 + VAE BF16 | LTX-Video Open Weights License | Video (difusion) | Mirror privado, 0 descargas |
| Lightricks/LTX-Video (ltxv-2b-0.9.8-distilled) | 2B (aprox.) | safetensors bf16 | LTX-Video Open Weights License | Video (difusion) | Repositorio original de Lightricks |
| Otras alternativas de video de 2B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original de Lightricks, ya que la informacion proporcionada no incluye datos de otros modelos de video comparables (parametros, contexto, rendimiento o licencia).

## Limitaciones y advertencias

- Modelo de difusion de video, no de lenguaje: no admite prompts conversacionales, tool calling ni razonamiento multi-paso.
- Sin validacion de calidad de video publicada: el autor indica que la prueba en ComfyUI no se ha ejecutado, por lo que no hay evidencia de que la salida sea correcta tras la conversion.
- Error de cuantizacion medido solo en tensores muestreados (0,6-0,7 %), no en la salida final de video; la degradacion perceptible no esta cuantificada.
- Licencia: LTX-Video Open Weights License de Lightricks; es necesario revisar sus terminos para uso comercial, ya que no se detallan en la informacion disponible.
- Repositorio privado con 0 descargas y 0 likes: sin validacion por parte de la comunidad ni soporte documentado.
- Idiomas y sesgos: no disponibles; al ser un modelo texto-a-video, los sesgos dependen del dataset original de Lightricks, no documentado aqui.
- Riesgo de alucinacion visual: como todo modelo generativo de video, puede producir contenido incoherente o no fiel al prompt, sin que se hayan publicado evaluaciones al respecto.
- Dependencia de scripts propios (`scripts/hf_models.py pull`, `convert_ltx098.py`) para la descarga y conversion, no documentados en detalle.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/maxh8086/tokenfrugal-ltx-video-0.9.8-gguf
- Modelo original de Lightricks: Lightricks/LTX-Video (referenciado en la model card como fuente de ltxv-2b-0.9.8-distilled.safetensors)
- No se han encontrado otros enlaces relevantes (papers, blogs, repos, demos) en la busqueda web disponible.
