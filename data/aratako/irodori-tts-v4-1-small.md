# Aratako/Irodori-TTS-v4.1-Small

## Resumen

Irodori-TTS-v4.1-Small es un modelo de síntesis de voz (text-to-speech) desarrollado por Aratako, especializado exclusivamente en japonés. Se trata de una actualización menor del checkpoint Irodori-TTS-v4-Small, en la que únicamente se ha sustituido y reentrenado el predictor de duración, manteniendo congelados el resto de módulos: RF-DiT, codificadores de texto y caption, codificador de hablante y módulos de condicionamiento. El resultado es una mejora en la estimación automática de duración y una reducción de errores de generación causados por longitudes de salida sobreestimadas.

El modelo emplea una arquitectura basada en Flow Matching, siguiendo el diseño de Echo-TTS, y utiliza latentes continuos de DACVAE como objetivo de generación. Cuenta con 766 millones de parámetros en formato safetensors, lo que lo sitúa en la gama de modelos TTS medianos. Su relevancia actual radica en que unifica las familias base y VoiceDesign en un solo checkpoint, ofreciendo clonación de voz, diseño de voz, condicionamiento por referencia larga y control de estilo mediante emojis, todo ello bajo licencia MIT. La ventana de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow Matching TTS basado en Echo-TTS, con latentes continuos DACVAE |
| Parametros totales | 766.052.385 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8, INT4 y FP8 disponibles en el repositorio Aratako/Irodori-TTS-v4.1-Small-Quantized (via torchao) |
| Idiomas soportados | japones (unicamente) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Irodori-TTS-v4.1-Small sigue la arquitectura de Echo-TTS: un modelo de Flow Matching que genera latentes continuos de audio a partir de un VAE de audio DACVAE. El sistema emplea un codificador de texto y otro de caption, un codificador de hablante y un módulo RF-DiT como generador principal. El condicionamiento se realiza mediante tres ramas independientes: texto de entrada, audio de referencia y texto de caption que describe estilo, emoción o entorno.

La principal innovacion de esta version v4.1 es el reentrenamiento aislado del predictor de duracion. Mientras que el checkpoint original entrenaba el modelo principal y el predictor de duracion de forma conjunta, en esta actualizacion el predictor se entreno por separado una vez que el modelo principal habia convergido, manteniendo todos los demas parametros congelados. Esto mejora la estimacion de duracion y reduce errores de generacion por sobreestimacion de la longitud de salida. No se requiere ningun cambio de codigo para utilizar este checkpoint respecto a la v4. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens o el uso de RLHF/DPO.

## Capacidades

- Sintesis de voz en japones a partir de texto.
- Clonacion de voz con audio de referencia: admite clonacion con una unica referencia corta, aunque se recomienda un clip limpio de aproximadamente 30 segundos o mas para obtener una similitud de hablante optima.
- Voice Design: generacion de voz puramente a partir de texto y caption, sin necesidad de audio de referencia.
- Condicionamiento por referencia larga: soporta multiples utterances cortos del mismo hablante concatenados, asi como una unica grabacion larga ininterrumpida (aunque esta ultima no ha sido evaluada).
- Control de estilo mediante emojis: permite modular el estilo de la voz insertando emojis en el texto o caption.
- Condicionamiento por tres ramas: texto, audio de referencia y caption de texto, con capacidad de combinar estas fuentes.
- Inferencia con cuantizacion INT8, INT4 y FP8 para entornos con memoria limitada.

## Casos de uso

- Narracion de audiolibros en japones: el modelo puede generar voz natural a partir de texto largo, con control de estilo mediante captions y emojis, lo que permite modular la entonacion narrativa sin necesidad de multiples locutores.
- Asistentes de voz en japones: gracias a la clonacion de voz con referencia, se puede crear un asistente con una voz personalizada y consistente, usando un clip de referencia de unos 30 segundos.
- Doblaje y localizacion de contenido audiovisual: la funcion de Voice Design permite generar voces sinteticas nuevas para personajes sin depender de actores de voz, combinando caption de estilo con texto de dialogo.
- Creacion de contenido educativo y e-learning: generacion de material de audio en japones para cursos, explicaciones y ejercicios de pronunciacion, con control de ritmo y estilo mediante el predictor de duracion mejorado.
- Prototipado rapido de productos de voz: integracion en pipelines de desarrollo para validar interacciones de voz antes de grabar con locutores profesionales, gracias a la licencia MIT y a la disponibilidad de versiones cuantizadas para entornos con poca memoria.
- Investigacion en sintesis de voz: al estar basado en Flow Matching y DACVAE, sirve como punto de partida para experimentos academicos sobre TTS, clonacion de voz y control de estilo, con codigo de entrenamiento disponible en el repositorio de GitHub.

## Benchmarks y rendimiento

Los benchmarks se evaluaron en condiciones equiparadas: inferencia FP32, 40 pasos RF, text CFG 3.0, sin audio de referencia ni caption. Los valores son la media y desviacion estandar poblacional sobre las semillas de muestreo consecutivas 0 a 4. Ni el Joyo Kanji Yomi Benchmark ni JSUT se incluyeron en los datos de entrenamiento.

### Lectura de kanji japones (Joyo Kanji Yomi Benchmark)

| Modelo | Kana-CER | Kana-CER recortado | Kana-CER por frase | CER estandar |
| :--- | ---: | ---: | ---: | ---: |
| Irodori-TTS-600M-v3-VoiceDesign | 8.49 ± 0.21% | 5.59 ± 0.09% | 2.45 ± 0.02% | 4.88 ± 0.21% |
| Irodori-TTS-v4-Small (original) | 7.43 ± 0.17% | 5.08 ± 0.03% | 2.89 ± 0.03% | 5.35 ± 0.18% |
| Irodori-TTS-v4.1-Small | 7.29 ± 0.13% | 5.03 ± 0.03% | 2.36 ± 0.01% | 4.69 ± 0.02% |

### JSUT BASIC5000

| Modelo | Kana-CER por frase | CER estandar |
| :--- | ---: | ---: |
| Irodori-TTS-600M-v3-VoiceDesign | 3.62 ± 0.03% | 7.19 ± 0.05% |
| Irodori-TTS-v4-Small (original) | 3.49 ± 0.02% | 7.32 ± 0.09% |
| Irodori-TTS-v4.1-Small | 3.43 ± 0.01% | 7.22 ± 0.12% |

El modelo v4.1 mejora al v4-Small original en practicamente todas las metricas, especialmente en la lectura de kanji, donde el CER estandar baja del 5.35% al 4.69%. No se han publicado resultados de MOS humano, naturalidad o adherencia a instrucciones a gran escala.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 766 millones de parametros en FP32, el peso del modelo ocupa aproximadamente 3.1 GB, por lo que una GPU con al menos 6-8 GB de VRAM seria necesaria para inferencia FP32.
- GPU recomendadas: no se especifican. Por tamano de modelo, una GPU consumer como RTX 3060 o superior podria ser suficiente para inferencia; las versiones cuantizadas INT8, INT4 y FP8 permiten reducir el uso de memoria.
- Compatibilidad con GPU consumer: probablemente si, gracias a las variantes cuantizadas disponibles en Aratako/Irodori-TTS-v4.1-Small-Quantized.
- Opciones de despliegue: el repositorio de GitHub proporciona codigo de inferencia y entrenamiento. Existe un servidor de API compatible con OpenAI (Irodori-TTS-Server) mencionado en el repositorio. Tambien hay un demo Space en HuggingFace.
- Latencia y throughput: no disponibles. La generacion usa 40 pasos RF con text CFG 3.0 en las evaluaciones, lo que da una referencia del coste computacional por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | CER estandar (Joyo Kanji) | Disponibilidad |
| :--- | ---: | ---: | --- | --- | ---: | --- |
| Irodori-TTS-v4.1-Small | 766M | no disponible | ja | MIT | 4.69% | HuggingFace, GitHub |
| Irodori-TTS-v4-Small | 766M | no disponible | ja | MIT | 5.35% | HuggingFace, GitHub |
| Irodori-TTS-600M-v3-VoiceDesign | 600M | no disponible | ja | MIT | 4.88% | HuggingFace, GitHub |

La comparativa se limita a las versiones anteriores del mismo proyecto, ya que no se dispone de datos de otros modelos TTS japoneses comparables en la informacion proporcionada. El v4.1-Small supera a ambos predecesores en lectura de kanji, aunque el v3-VoiceDesign mantiene un mejor CER estandar en JSUT BASIC5000 (7.19% frente a 7.22%).

## Limitaciones y advertencias

- Solo soporta texto en japones; no es utilizable para otros idiomas.
- La clonacion de voz con una unica referencia corta produce una similitud de hablante modestamente inferior a la v3; se recomienda un clip limpio de 30 segundos o mas.
- El condicionamiento por referencia larga solo se ha evaluado con multiples utterances cortos concatenados; una unica grabacion larga continua no ha sido probada.
- Si se combinan audio de referencia y caption con instrucciones contradictorias, puede resultar en calidad de audio inestable, artefactos o que una condicion domine sobre la otra.
- El modelo puede no seguir instrucciones complejas o contradictorias en el caption de forma consistente.
- El control por emojis no siempre es consistente y depende del contexto.
- La lectura de kanji dificiles, nombres poco comunes, terminologia especializada y lecturas dependientes del contexto puede seguir siendo incorrecta.
- No se ha realizado una evaluacion humana a gran escala (MOS, naturalidad, adherencia a instrucciones o similitud de hablante); las puntuaciones automaticas no representan completamente la percepcion humana.
- Restricciones eticas adicionales a la licencia MIT: prohibido clonar o suplantar la voz de individuos sin consentimiento explicito, prohibido generar deepfakes o discurso sintetico para desinformacion, y el desarrollador no asume responsabilidad por mal uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Modelo base v4-Small: https://huggingface.co/Aratako/Irodori-TTS-v4-Small
- Repositorio de codigo (GitHub): https://github.com/Aratako/Irodori-TTS
- Demo Space en HuggingFace: https://huggingface.co/spaces/Aratako/Irodori-TTS-v4.1-Small-Demo
- Variantes cuantizadas: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small-Quantized
- Documentacion del proyecto (DeepWiki): https://deepwiki.com/Aratako/Irodori-TTS
- Blog de referencia de Echo-TTS: https://jordandarefsky.com/blog/2025/echo/
- DACVAE: https://github.com/facebookresearch/dacvae
