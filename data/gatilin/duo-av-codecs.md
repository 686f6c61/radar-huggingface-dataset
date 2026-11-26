# gatilin/duo-av-codecs

## Resumen

Duo shared audio and video codecs es un paquete de investigacion publicado por el usuario gatilin que extrae los dos autoencoders variacionales (VAE) del modelo multimodal Duo-1.2-causal-base, desarrollado por inclusionAI. El repositorio contiene unicamente los codecs de audio y video, sin los modulos de realizacion, intencion ni habla del modelo original, y esta fijado al commit `d65767bcbbf699ae7782fb71931112001db0a15b`. Su interes radica en que permite reutilizar los componentes de compresion latente de audio y video de Duo de forma aislada, algo util para experimentar con pipelines multimodales sin cargar el modelo completo.

El codec de audio es un VAE basado en DAC (Descript Audio Codec) de 605.429.340 bytes (aproximadamente 605 MB), mono, que opera a 32 kHz con 800 muestras por paso latente y 32 canales latentes; para estereo se usa como dos elementos de batch. El codec de video es un VAE de 10.415.548.320 bytes (aproximadamente 10,4 GB) con 24 canales latentes, factor espacial 16, factor temporal 4 y decodificador ViT. El paquete se distribuye en formato safetensors y con configuraciones YAML oficiales extraidas del repositorio de codigo de Duo.

La relevancia de esta ficha es acotada: no se trata de un modelo generativo completo, sino de un componente extraido para investigacion. El autor documenta una validacion limitada (smoke test del audio y auditoria estructural de las cabeceras del video, sin forward completo) y advierte de que el pipeline completo de Duo no se ha probado. La licencia declarada es la MiniMax H3 Community License, con limitaciones territoriales y condiciones para distribucion y receptores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE de audio basado en DAC y VAE de video con decodificador ViT |
| Parametros totales | Audio: 605.429.340 bytes de pesos; video: 10.415.548.320 bytes de pesos (parametros exactos no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; audio: 800 muestras por paso latente, 32 canales latentes; video: 24 canales latentes, factor espacial 16, factor temporal 4) |
| Tipos de cuantizacion | no disponible (pesos en FP32 segun la cabecera del video) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (license_name: minimax-h3-community-license) |
| Formato de pesos | safetensors (audio: `codec/audio_vae/diffusion_pytorch_model.safetensors`; video: `codec/video_vae/model.safetensors`) |

## Arquitectura y entrenamiento

El componente de audio es un VAE basado en DAC, configurado en modo mono y pensado para procesar estereo como dos elementos de batch independientes. Trabaja a una frecuencia de muestreo de 32 kHz, con 800 muestras de audio por cada paso latente y 32 canales latentes, lo que define su tasa de compresion temporal. El componente de video es un VAE con 24 canales latentes, un factor de compresion espacial de 16 y un factor temporal de 4, y emplea un decodificador basado en ViT. Las configuraciones oficiales de runtime, incluyendo la normalizacion de latentes, se incluyen en el directorio `config/` y provienen del codigo de Duo en la revision `068e357ede2bdea233b408645301e522f560da73`.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni sobre si se aplicaron tecnicas de RLHF o DPO, ya que el repositorio solo contiene los pesos extraidos y las configuraciones, no la documentacion de entrenamiento. El autor indica que los archivos se copiaron sin modificar desde el modelo base y que los archivos correspondientes en Duo-1.0-causal-base son identicos byte a byte segun los metadatos SHA-256 de LFS de Hugging Face. La validacion realizada es limitada: el audio se cargo estrictamente y se probo con una onda sintetica de 32 kHz (el encoder produjo dos pasos latentes de 32 dimensiones y el decoder devolvio 1.600 muestras finitas), mientras que el video solo se audito estructuralmente (560 tensores FP32 con nombres y formas coincidentes con el VAE oficial), sin descarga completa, hash local ni forward de codificacion/decodificacion.

## Capacidades

- Codificacion y decodificacion de audio a 32 kHz con representacion latente de 32 canales y 800 muestras por paso.
- Procesamiento de audio estereo mediante dos elementos de batch en el modelo mono.
- Codificacion y decodificacion de video con representacion latente de 24 canales, factor espacial 16 y factor temporal 4.
- Decodificacion de video mediante un decoder basado en ViT.
- Normalizacion de latentes incluida en las configuraciones oficiales de runtime.
- Integracion con la libreria diffusers (tag `diffusers` en el repositorio).
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision de alto nivel, tool calling, agentes ni capacidades multilingues; es un componente de compresion, no un modelo de lenguaje.

## Casos de uso

- Investigacion en compresion latente de audio: usar el VAE de audio para estudiar la representacion de 32 canales a 32 kHz en tareas de reconstruccion o analisis de latentes, aprovechando que es un componente aislado y de menor tamano (unos 605 MB) que el modelo completo.
- Investigacion en compresion latente de video: emplear el VAE de video para experimentar con la representacion de 24 canales y factores 16x4, util en estudios de tokenizacion temporal y espacial para modelos generativos de video.
- Desarrollo de pipelines multimodales de investigacion: integrar ambos codecs en prototipos que necesiten convertir audio y video a latentes antes de pasarlos por otros modulos, siguiendo las configuraciones YAML oficiales incluidas en `config/`.
- Reproducibilidad y auditoria: el repositorio incluye hashes SHA-256, tamanos y archivos de validacion JSON junto con `provenance.json`, lo que permite verificar la procedencia de los pesos en entornos de investigacion que exigen trazabilidad.
- Experimentacion con diffusers: al estar etiquetado para diffusers, se puede intentar cargar los componentes en flujos de trabajo de esa libreria, aunque el autor advierte que se debe seguir el loader y pipeline oficiales para el preprocesado y el streaming.
- Analisis de licencias y cumplimiento: util para equipos que evaluan las condiciones de la MiniMax H3 Community License antes de adoptar componentes derivados de Duo, ya que se incluyen los archivos LICENSE y NOTICE exactos del upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta un smoke test del codec de audio (dos pasos latentes de 32 dimensiones y 1.600 muestras finitas de salida) y una auditoria estructural del codec de video (560 tensores FP32 con formas coincidentes), sin metricas de calidad, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el codec de audio ocupa unos 605 MB en pesos; el codec de video ocupa unos 10,4 GB en pesos. La VRAM total depende del lote, la resolucion y la duracion del video, y no se ha publicado una estimacion oficial.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del VAE de video (mas de 10 GB en FP32), se necesitarian GPU con al menos 16-24 GB de VRAM para cargarlo comodamente, aunque no hay datos oficiales que lo confirmen.
- Cabe en GPU de consumo: el codec de audio probablemente si en la mayoria de GPU consumer actuales; el codec de video, con mas de 10 GB de pesos, queda al limite o fuera de GPU consumer de 8-12 GB. No hay confirmacion oficial.
- Opciones de despliegue: la libreria declarada es diffusers; el autor indica que se debe seguir el loader y pipeline oficiales del repositorio de Duo para el preprocesado y el streaming. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de componente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros/pesos | Contexto/latentes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/duo-av-codecs | Codecs VAE de audio y video extraidos | Audio: 605 MB; video: 10,4 GB | Audio: 32 canales, 800 muestras/paso; video: 24 canales, 16x4 | MiniMax H3 Community License | Hugging Face (0 descargas) |
| inclusionAI/Duo-1.2-causal-base | Modelo multimodal completo (origen) | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Duo-1.0-causal-base | Modelo multimodal completo (version anterior) | no disponible | no disponible | no disponible en la informacion | Hugging Face (archivos de codec identicos byte a byte) |

No se dispone de datos de rendimiento ni de otros codecs comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo completo: solo incluye los VAE de audio y video; los modulos de realizacion, intencion y habla no estan incluidos.
- Validacion insuficiente: el audio solo paso un smoke test con una onda sintetica y el video solo se audito estructuralmente, sin forward de codificacion/decodificacion ni hash local del archivo completo.
- El pipeline completo de Duo no fue probado por el autor del repositorio.
- Riesgo de alucinacion: no aplica directamente al ser un codec, pero cualquier modulo generativo que se conecte a estos latentes puede producir artefactos o reconstrucciones inexactas.
- Sesgos conocidos: no disponibles; al ser componentes de compresion, los sesgos dependerian de los datos de entrenamiento originales, no documentados aqui.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto de lenguaje; el audio es mono con estereo como dos batch items, y no se documentan idiomas.
- Restricciones de licencia: la MiniMax H3 Community License contiene limitaciones territoriales y condiciones para distribucion y receptores; los usuarios y distribuidores deben cumplir los requisitos de territorio y receptor aplicables. No se debe tratar la licencia Apache-2.0 del codigo como licencia de los pesos.
- Componentes externos y codigo conservan sus propios avisos (NOTICE incluido).
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gatilin/duo-av-codecs
- Modelo base: https://huggingface.co/inclusionAI/Duo-1.2-causal-base
- Codigo oficial de Duo: https://github.com/inclusionAI/Duo
- Revision del codigo referenciada: `068e357ede2bdea233b408645301e522f560da73`
- Commit del modelo base referenciado: `d65767bcbbf699ae7782fb71931112001db0a15b`
- Licencia (incluida en el repositorio): LICENSE
- Aviso (incluido en el repositorio): NOTICE
