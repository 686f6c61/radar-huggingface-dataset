# ampixa/nepali-rvc-voices-v1

## Resumen

El modelo `ampixa/nepali-rvc-voices-v1` es un paquete de cuatro voces objetivo independientes para conversión de voz (voice conversion) en nepalí, desarrollado por Ampixa Labs, un laboratorio de audio con sede en Nepal especializado en tecnologías de habla para idiomas de bajos recursos. Se trata de un "voice pack" que agrupa cuatro checkpoints RVC (Retrieval-based Voice Conversion) entrenados por separado, cada uno con su correspondiente archivo de índice de recuperación. No es un modelo combinado: en inferencia se selecciona una de las cuatro voces (dos femeninas y dos masculinas) junto con su índice asociado.

El modelo resuelve el problema de la falta de voces sintéticas de calidad para nepalí, un idioma con escasos recursos en el ecosistema de IA de audio. Su relevancia radica en que ofrece voces entrenadas con datos de habla real (procedentes del dataset `ai4bharat/indicvoices_r`) y liberadas bajo licencia CC BY 4.0, lo que permite su uso y adaptación. La arquitectura se basa en el flujo RVC de Applio, con generador HiFi-GAN, extracción de F0 mediante RMVPE y características ContentVec. El contexto de audio se procesa a 48 kHz y el entrenamiento se realizó durante 80 épocas. Es un lanzamiento experimental, según advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC (Retrieval-based Voice Conversion) con generador HiFi-GAN, extracción F0 RMVPE y características ContentVec |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ne (nepali) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.pth` (generador) y `.index` (índice de recuperación) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RVC estándar: un extractor de características ContentVec para representar el contenido del habla, un extractor de F0 RMVPE para la frecuencia fundamental, y un generador HiFi-GAN que sintetiza la voz convertida. El entrenamiento se realizó con el runtime Applio RVC, a 48 kHz, durante 80 épocas. Las transformaciones aplicadas al dataset fueron mínimas: solo conversión de estéreo a mono (promedio de canales) y codificación PCM16. No se aplicó pitch shift, transformación de fase, denoising ni procesamiento de pseudovoz. El índice de recuperación por defecto es 0.6 y el pitch por defecto es 0 semitonos. Los datos de entrenamiento provienen del dataset `ai4bharat/indicvoices_r`, liberado bajo CC BY 4.0. No se dispone de información sobre el número total de tokens o la composición detallada del dataset más allá de las duraciones de cada voz (entre 21 y 28 minutos de clips limpios por voz).

## Capacidades

- Conversión de voz (voice conversion) de audio a audio: transforma la voz de un hablante fuente en una de las cuatro voces objetivo nepalíes.
- Cuatro voces objetivo independientes: dos femeninas (`ne_rvc_f01`, `ne_rvc_f02`) y dos masculinas (`ne_rvc_m01`, `ne_rvc_m02`), cada una con su propio checkpoint e índice.
- Soporte para inferencia mediante Applio, con parámetros configurables como el índice de recuperación (0.6 por defecto) y el pitch (0 semitonos por defecto).
- Integración con una aplicación de navegador separada (`voidash/nepali-rvc-tts`) que ofrece APIs de texto-a-voz y voz-a-voz.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de conversión de audio.

## Casos de uso

- Doblaje de contenido audiovisual en nepalí: el modelo permite sustituir la voz de un actor o locutor por una de las voces objetivo, manteniendo la prosodia y el contenido del habla original. Es adecuado para doblar vídeos, podcasts o material educativo cuando se dispone de los derechos sobre el audio fuente.
- Narración de audiolibros y cuentos: las voces femeninas y masculinas pueden utilizarse para generar narraciones en nepalí a partir de grabaciones de un lector, ofreciendo variedad de timbres sin necesidad de contratar múltiples locutores.
- Asistentes de voz y sistemas de respuesta interactiva: la conversión de voz puede emplearse para personalizar la voz de un asistente en nepalí, partiendo de una grabación de referencia del propio usuario o de un actor con licencia.
- Creación de contenido para redes sociales: los creadores pueden convertir su voz a una de las voces del pack para generar vídeos, memes de audio o contenido humorístico, siempre que no se presente como una persona real ni se use para engañar.
- Investigación en procesamiento de habla para idiomas de bajos recursos: el pack sirve como recurso para estudiar la conversión de voz en nepalí, comparar técnicas de entrenamiento o evaluar la calidad de voces sintéticas en este idioma.
- Desarrollo de aplicaciones de accesibilidad: la conversión de voz puede integrarse en herramientas de lectura en voz alta o comunicación aumentativa para hablantes de nepalí, utilizando voces naturales generadas a partir de grabaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de calidad de audio (como MOS) en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM, GPU o latencia en la información disponible.
- La inferencia se realiza mediante Applio, que puede ejecutarse en CPU o GPU, pero no se indican configuraciones mínimas.
- Al ser un modelo de conversión de voz con generador HiFi-GAN, es probable que funcione en GPUs de consumo (por ejemplo, RTX 3060 o superiores), pero este dato no está confirmado.
- Opciones de despliegue: Applio (código MIT) y la aplicación de navegador `voidash/nepali-rvc-tts` para uso a través de API.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (conversión de voz en nepalí) dentro de los datos proporcionados. No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- El modelo es experimental: el autor recomienda escuchar y evaluar la idoneidad antes de cualquier despliegue en producción.
- Las voces no deben presentarse como una persona real ni utilizarse para engañar a los oyentes.
- Se requiere tener derechos sobre el audio fuente que se va a convertir; el uso sin esos derechos puede infringir normativas legales.
- El modelo solo soporta nepalí; no es multilingüe.
- No se garantiza la calidad de la conversión en todos los contextos (ruido, acentos, habla solapada, etc.).
- La licencia CC BY 4.0 exige mantener la atribución al dataset original (`ai4bharat/indicvoices_r`) y al propio modelo.
- Los términos de uso de Applio también se aplican al uso del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ampixa/nepali-rvc-voices-v1
- Aplicación de navegador (TTS y voz-a-voz): https://huggingface.co/spaces/voidash/nepali-rvc-tts
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4bharat/indicvoices_r
- Repositorio de Applio: https://github.com/IAHispano/Applio
- Página de Ampixa Labs: https://ampixa.com/
- Versión anterior del pack (v0): https://huggingface.co/ampixa/nepali-voices-v0
- Sitio de TTS de Ampixa: https://tts.ampixa.com/
