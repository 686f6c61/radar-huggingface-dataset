# kandinskylab/KVAE-Audio-Stereo

## Resumen

KVAE-Audio-Stereo es un autoencoder de audio continuo y banda completa (48 kHz) desarrollado por Kandinsky Lab, la división de investigación de Sberbank. Comprime formas de onda de audio estéreo en latentes continuos compactos de 128 canales y las reconstruye con alta fidelidad en voz, música y sonido general. No es un modelo generativo en sí, sino el componente de compresión (VAE) que alimenta pipelines de generación de audio texto-a-audio.

La relevancia del modelo radica en su doble propósito: además de una reconstrucción fiel, está diseñado como espacio latente para modelos generativos. Según el autor, sustituir el autoencoder por KVAE-Audio-Stereo en su pipeline interno de texto-a-audio mejora la calidad de generación con un generador fijo. Mantiene los canales izquierdo y derecho como formas de onda separadas, a diferencia de la versión mono KVAE-Audio.

Con 167.265.476 parámetros (unos 167 M) y un repositorio de 2,0 GB, es un modelo ligero en términos de parámetros pero con un footprint de almacenamiento considerable por los pesos en precisión completa. Está integrado en Hugging Face Diffusers como `AutoencoderKLKVAEAudio` desde la versión 0.42.0 y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (VAE) para audio, latentes continuos de 128 canales |
| Parametros totales | 167.265.476 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (.pt), diffusers |
| Frecuencia de muestreo | 48 kHz, banda completa |
| Canales de audio | 2 (estéreo, L/R separados) |
| Canales latentes | 128 |
| Pipeline | audio-to-audio |

## Arquitectura y entrenamiento

KVAE-Audio-Stereo es un autoencoder variacional (VAE) que opera directamente sobre formas de onda de audio a 48 kHz con disposición `(batch, channels, time)`. Codifica el audio estéreo en un espacio latente continuo de 128 canales y lo decodifica de vuelta a forma de onda, preservando los canales izquierdo y derecho de forma independiente. Para audio mono, el modelo duplica la señal a dos canales antes de la codificación y promedia la salida de vuelta a un canal.

El modelo se presenta explícitamente como un espacio latente para modelos generativos, no solo como un compresor. El autor indica que en su pipeline interno de texto-a-audio, el uso de este autoencoder mejora la calidad de generación con un generador fijo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, dado que es un modelo de reconstrucción y no un modelo de lenguaje. Existe un informe técnico asociado (arXiv 2608.05798) que presumiblemente contiene esos detalles.

## Capacidades

- Compresión y reconstrucción de audio estéreo a 48 kHz de banda completa con alta fidelidad.
- Codificación en latentes continuos de 128 canales aptos para modelos generativos.
- Manejo nativo de voz, música y sonido general.
- Procesamiento de audio mono mediante duplicación a dos canales y promediado a la salida.
- Integración con Hugging Face Diffusers (`AutoencoderKLKVAEAudio`) desde la versión 0.42.0.
- Uso como componente VAE en pipelines de generación texto-a-audio.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente: es un autoencoder, no un modelo de lenguaje.

## Casos de uso

- Compresión de audio para pipelines generativos: el modelo actúa como VAE de un sistema texto-a-audio, comprimiendo la señal a latentes de 128 canales sobre los que opera el generador y reconstruyendo la forma de onda final a 48 kHz.
- Mejora de calidad en generación musical: al sustituir el autoencoder por KVAE-Audio-Stereo en un pipeline existente con generador fijo, se obtiene una mejora de calidad de generación según el autor, lo que permite actualizar la calidad sin reentrenar el generador.
- Reconstrucción y restauración de audio estéreo: codificación y decodificación de grabaciones para tareas de denoising o restauración preservando la imagen estéreo, ya que los canales L/R se mantienen separados.
- Preprocesamiento de datasets de audio: conversión de grandes corpus de audio a latentes compactos para entrenamiento de modelos generativos, reduciendo el coste de almacenamiento y de cómputo en el entrenamiento.
- Investigación en espacios latentes de audio: estudio de representaciones continuas de audio de banda completa, comparando el espacio latente de 128 canales con alternativas como EnCodec o DAC.
- Prototipado de aplicaciones de audio en producción: al tener licencia MIT e integración en Diffusers, puede desplegarse en servicios de audio-to-audio sin restricciones de uso comercial.
- Conversión de formato de audio mono a estéreo: el modelo gestiona ambas configuraciones de canal de forma nativa, lo que facilita pipelines mixtos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 167 M parámetros, los pesos en fp32 ocupan aproximadamente 0,67 GB; en fp16, unos 0,33 GB. El consumo real de VRAM depende de la longitud del audio de entrada, ya que las activaciones crecen con la duración.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para audio de duración moderada; se recomiendan RTX 3090, RTX 4090, A100 o H100 para procesamiento por lotes o audio largo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, dado el reducido número de parámetros.
- Opciones de despliegue: Hugging Face Diffusers (`AutoencoderKLKVAEAudio`), la librería `kvae` del propio autor y descarga directa del checkpoint `.pt`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia | Canales latentes | Estereo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KVAE-Audio-Stereo | 167 M | 48 kHz | 128 | Si | MIT | Diffusers, HF |
| KVAE-Audio (mono) | no disponible | 48 kHz | 128 | No | MIT | Diffusers, HF |
| EnCodec (Meta) | no disponible en la informacion | 48 kHz | variable | Si | no disponible en la informacion | no disponible en la informacion |
| DAC (Descript) | no disponible en la informacion | 44,1 kHz | variable | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

La comparación con EnCodec y DAC es orientativa por categoría (autoencoders de audio neuronales); no se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Es un autoencoder, no un modelo generativo ni de lenguaje: no genera audio desde cero ni acepta prompts de texto.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con audio, puede heredar sesgos de los datos de entrenamiento en la reconstrucción de determinados tipos de voz o música.
- Riesgo de artefactos de reconstrucción en señales fuera de la distribución de entrenamiento (por ejemplo, audio muy ruidoso o con contenido espectral extremo).
- No se especifican los idiomas ni la cobertura lingüística; al operar sobre formas de onda, es en principio independiente del idioma, pero no hay datos que lo confirmen.
- No se documentan los límites de duración de audio procesable ni el comportamiento del contexto latente en audios muy largos.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar el informe técnico por si impone condiciones adicionales sobre los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y escasa validación por parte de la comunidad.
- La fecha de creación (noviembre de 2026) y el número de arXiv (2608.05798) son posteriores a la información de referencia habitual; verificar la vigencia de los enlaces antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kandinskylab/KVAE-Audio-Stereo
- Versión mono: https://huggingface.co/kandinskylab/KVAE-Audio
- Documentación de Diffusers (`AutoencoderKLKVAEAudio`): https://huggingface.co/docs/diffusers/main/en/api/models/autoencoder_kl_kvae_audio
- Repositorio GitHub de KVAE-Audio: https://github.com/kandinskylab/kvae-audio
- Repositorio GitHub de KVAE: https://github.com/kandinskylab/kvae
- Artículo en Habr: https://habr.com/ru/companies/sberbank/articles/1053410/
- Página del proyecto: https://kandinskylab.ai/models/kvae/
- Informe técnico (arXiv): https://huggingface.co/papers/2608.05798
