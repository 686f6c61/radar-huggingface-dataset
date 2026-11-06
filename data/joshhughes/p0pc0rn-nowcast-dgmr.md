# JoshHughes/p0pc0rn-nowcast-dgmr

## Resumen

p0pc0rn-nowcast-dgmr es una conversión cuantizada del modelo DGMR (Deep Generative Model of Rainfall) de DeepMind, empaquetada por Joshua Hughes para su aplicación on-device p0pc0rn. El modelo original, publicado por DeepMind en 2021 junto a su repositorio de investigación sobre nowcasting de precipitación, es un modelo generativo que produce predicciones de tasa de lluvia a partir de fotogramas de radar. Esta versión concreta no es un checkpoint estándar de Transformers ni de Diffusers, sino un pack propietario en formato `pocketflux.pack/1` que solo puede leer el motor WebGPU de la aplicación p0pc0rn.

La entrada del modelo son 4 fotogramas de radar separados 5 minutos entre sí, con resolución de 1 km y 256 x 256 píxeles; la salida son 18 fotogramas de tasa de lluvia que cubren desde +5 hasta +90 minutos. El pack incluye dos variantes: pesos cuantizados a enteros de 8 bits (71 MB) y pesos en coma flotante de 16 bits (136 MB). La cuantización int8 incluye también las activaciones, con plegado de normalización espectral y por lotes, e incorpora kernels enteros para GPU.

Es relevante porque demuestra la viabilidad de ejecutar un modelo generativo de nowcasting meteorológico directamente en un teléfono mediante WebGPU, sin depender de servidores. No obstante, se trata de un experimento: el modelo fue entrenado con radar del Reino Unido y se aplica sobre radar estadounidense (NOAA MRMS), y el propio autor advierte que no es una previsión fiable ni sustituye a los avisos oficiales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DGMR (Deep Generative Model of Rainfall), modelo generativo de DeepMind |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 4 fotogramas de radar (5 min, 1 km, 256 x 256) |
| Tipos de cuantización | int8 (pesos y activaciones) y f16 |
| Idiomas soportados | no disponible (modelo de precipitación, no lingüístico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `pocketflux.pack/1` (manifest.json + dgmr_int8.json + dgmr_int8.bin + dgmr_int8_host.bin; equivalentes en f16/) |

## Arquitectura y entrenamiento

El modelo subyacente es DGMR, un modelo generativo de DeepMind para nowcasting de precipitación publicado en 2021. La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo generativo; el pack incluye operaciones de normalización espectral y por lotes que han sido plegadas durante la conversión. La entrada son 4 fotogramas de radar a 5 minutos de intervalo, 1 km de resolución y 256 x 256 píxeles, y la salida son 18 fotogramas de tasa de lluvia que cubren de +5 a +90 minutos.

El entrenamiento original fue realizado por DeepMind con radar del Reino Unido, según indica la model card. La conversión de p0pc0rn aplica cuantización a int8 sobre pesos y activaciones, pliega las normalizaciones y genera kernels enteros para GPU, además de una variante en f16. Los pesos de origen son el snapshot TF-Hub de 256 x 256 publicado con el repositorio de DeepMind (`tf_weights.npz`, sha256 3ba463eca2a4097fd01eefbef7848353fc7093607d1dfbd548c3a7240ee5acc6). No se dispone de información sobre el número de tokens, composición del dataset ni técnicas de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Nowcasting de precipitación: genera 18 fotogramas de tasa de lluvia (+5 a +90 minutos) a partir de 4 fotogramas de radar.
- Procesamiento de imágenes de radar a 256 x 256 píxeles con resolución de 1 km y cadencia de 5 minutos.
- Inferencia on-device mediante WebGPU en el teléfono, con kernels propios de la aplicación p0pc0rn.
- Ejecución en dos precisiones: int8 (pesos y activaciones) y f16.
- Verificación de integridad: el pack incluye manifest.json con sha256 por archivo y por cada chunk de 16 MiB.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo específico de predicción meteorológica.
- No dispone de modo thinking, visión general, audio ni otras capacidades de propósito general.

## Casos de uso

- Visualización de nowcasting en móvil: la aplicación p0pc0rn puede mostrar una animación de la evolución de la lluvia en los próximos 90 minutos directamente en el teléfono, sin enviar datos de radar a un servidor, gracias a la inferencia WebGPU on-device.
- Demostración educativa de modelos generativos de precipitación: investigadores pueden inspeccionar el pack int8 y f16 para estudiar cómo se comporta DGMR cuantizado en hardware móvil.
- Pruebas de despliegue de modelos meteorológicos en el borde: el pack sirve como referencia para evaluar latencia y viabilidad de ejecutar nowcasting en dispositivos sin GPU dedicada.
- Prototipos de aplicaciones de alerta temprana no oficiales: con la advertencia explícita de que no sustituye a los avisos oficiales, puede usarse para experimentar con interfaces de aviso local.
- Investigación sobre generalización de dominio: el modelo se entrenó con radar del Reino Unido y se aplica sobre NOAA MRMS de EE. UU., lo que permite estudiar el comportamiento de DGMR en un dominio distinto al de entrenamiento.
- Integración en pipelines de análisis de radar: el formato de pack con verificación sha256 por chunks facilita la distribución y validación de los pesos en entornos controlados.
- Comparación de precisión int8 frente a f16: el pack incluye ambas variantes, lo que permite medir el impacto de la cuantización en la calidad de las predicciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el pack int8 ocupa 71 MB y el f16 136 MB, por lo que la huella de pesos es reducida y el grueso del consumo dependerá de las activaciones y del motor WebGPU.
- GPU recomendadas: el modelo está diseñado para ejecutarse en GPU de teléfono mediante WebGPU; no se especifican modelos de GPU de escritorio.
- ¿Cabe en GPU de consumo? Por el tamaño de los pesos (71-136 MB), es plausible en cualquier GPU de consumo moderna, pero la información disponible no confirma compatibilidad fuera del motor WebGPU de p0pc0rn.
- Opciones de despliegue: únicamente el motor WebGPU propietario de la aplicación p0pc0rn; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un checkpoint de Transformers, Diffusers ni NeMo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| p0pc0rn-nowcast-dgmr (este) | DGMR cuantizado int8/f16 | 4 fotogramas radar 256x256 → 18 fotogramas de lluvia | `pocketflux.pack/1` | CC BY 4.0 | Hugging Face, solo motor p0pc0rn |
| DGMR original (DeepMind) | Modelo generativo de precipitación | 4 fotogramas radar → predicción de lluvia | TF-Hub / TensorFlow | CC BY 4.0 (según la model card) | Repositorio de DeepMind |
| Otros modelos de nowcasting | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo original fue entrenado con radar del Reino Unido y se aplica sobre radar de EE. UU. (NOAA MRMS); el propio autor lo describe como un experimento y advierte que no es una previsión fiable.
- No debe usarse como sustituto de los avisos meteorológicos oficiales.
- No es un producto oficial de DeepMind ni de Google; no implica respaldo alguno.
- El formato `pocketflux.pack/1` solo lo lee el motor WebGPU de p0pc0rn; no es un checkpoint estándar y no puede cargarse con herramientas convencionales.
- La cuantización int8 puede degradar la calidad de las predicciones frente a f16; no se han publicado métricas que cuantifiquen esta diferencia.
- No se dispone de información sobre sesgos, riesgo de alucinación en sentido lingüístico ni limitaciones idiomáticas, al no ser un modelo de lenguaje.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero debe mantenerse la línea de crédito "Nowcast model: DeepMind DGMR (CC BY 4.0), modified" y respetarse los términos de la licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/JoshHughes/p0pc0rn-nowcast-dgmr
- Repositorio de investigación de DeepMind sobre nowcasting: https://github.com/google-deepmind/deepmind-research/tree/master/nowcasting
- Aplicación p0pc0rn: https://artistjoshhughes.github.io/p0pc0rn/
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- X oficial de p0pc0rn: https://x.com/p0pc0rnapp
- X de Josh Hughes: https://x.com/joshhughes___
