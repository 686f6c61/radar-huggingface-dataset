# mojonk/trump-jre-rvc

## Resumen

`mojonk/trump-jre-rvc` es un modelo de conversion de voz (voice conversion) basado en RVC v2 (Retrieval-based Voice Conversion), entrenado a 40 kHz para replicar la voz de Donald Trump a partir de fragmentos de una entrevista en el podcast The Joe Rogan Experience. Lo publica el usuario de Hugging Face `mojonk` (firmado en la model card como "AirBudd Dwyer") y no es un modelo de lenguaje: no genera texto ni razona, sino que transforma una señal de audio de entrada (canto o habla) en otra con el timbre del hablante objetivo.

El repositorio ocupa 0,3 GB y contiene un checkpoint `.pth` junto con el fichero `.index` de características que emplea RVC para la recuperación de embeddings durante la inferencia. El entrenamiento se realizo en una GPU alquilada en RunPod en noviembre de 2026, con un dataset de 732 clips (30,8 minutos de audio) y 239 epocas.

Su relevancia es acotada: se trata de un artefacto de la comunidad orientado a experimentacion con conversion de voz y a la integracion en pipelines de RVC (por ejemplo, para cubrir canciones o doblaje con una voz sintetica). No dispone de documentacion tecnica detallada, benchmarks ni pipeline declarado en Hugging Face, y su licencia `other` impone cautela antes de cualquier uso mas alla del experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion), entrenado a 40 kHz |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint `.pth` en precision de entrenamiento) |
| Idiomas soportados | no disponibles (el dataset de entrenamiento es habla en ingles) |
| Licencia | other |
| Formato de pesos | `.pth` (PyTorch) + `.index` (indice de caracteristicas) |

## Arquitectura y entrenamiento

RVC v2 es una arquitectura de conversion de voz derivada de VITS/So-VITS que combina un encoder de contenido, un extractor de pitch (en este caso se recomienda RMVPE) y un decoder que sintetiza la forma de onda en el timbre del hablante objetivo. El componente `.index` almacena embeddings de las caracteristicas del hablante de entrenamiento y se consulta por similitud durante la inferencia para mejorar la fidelidad del timbre. El modelo esta configurado para una frecuencia de muestreo de 40 kHz, lo que sitúa su salida por encima de los 32 kHz habituales en RVC v1.

El entrenamiento se realizo en una GPU alquilada en RunPod en noviembre de 2026 sobre 732 clips que suman 30,8 minutos de audio extraidos de una entrevista en The Joe Rogan Experience, durante 239 epocas. La model card no documenta el preprocesado, la funcion de perdida, el uso de RLHF/DPO (no aplica a este tipo de modelo) ni el hardware exacto. Los ajustes de inferencia que el autor indica como funcionales son pitch 0, protect 0,33 y seguimiento de tono con RMVPE.

## Capacidades

- Conversion de voz (speech-to-speech): transforma una locucion de entrada en la voz del hablante objetivo conservando el contenido linguistico y la prosodia.
- Conversion de canto: al ser RVC, esta pensado para aplicar el timbre objetivo sobre pistas vocales musicales.
- Control de tono: admite desplazamiento de pitch (el autor recomienda 0 para su caso) y proteccion de consonantes mediante el parametro `protect`.
- Seguimiento de tono con RMVPE para reducir artefactos en pasajes con vibrato o cambios bruscos de altura.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio a texto.
- No soporta tool calling, function calling ni comportamiento agentico.
- No dispone de capacidades multilingues documentadas; el dataset es habla en ingles.
- No dispone de modo "thinking" ni de ninguna capacidad cognitiva: es exclusivamente un modelo de conversion de timbre.

## Casos de uso

- Produccion musical y covers: aplicar el timbre del modelo sobre una pista vocal para generar una version alternativa de una cancion, usando el flujo habitual de RVC con separacion de stems y ajuste de pitch.
- Doblaje y localizacion experimental: sustituir la voz de un actor por la voz clonada en material ya rodado, sincronizando el audio con la pista original mediante herramientas de alineamiento.
- Prototipado de personajes sinteticos: generar voces de referencia para animaciones o videojuegos en fase de preproduccion, antes de contratar un actor de voz.
- Investigacion en deteccion de deepfakes: emplear el modelo como muestra positiva controlada para entrenar o evaluar clasificadores de audio sintetico.
- Demostraciones de conversion de voz en tiempo casi real: integrar el checkpoint en un pipeline de RVC con extraccion de pitch RMVPE para mostrar la tecnologia en talleres o charlas tecnicas.
- Experimentacion con tecnicas de retrieval: estudiar el efecto del fichero `.index` en la fidelidad del timbre comparando inferencias con y sin recuperacion de embeddings.
- Fines educativos sobre etica de la sintesis de voz: analizar los riesgos de suplantacion de identidad y las salvaguardas necesarias en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano tipico de un checkpoint RVC v2 (cientos de MB) es plausible ejecutarlo en GPUs con 4-8 GB de VRAM, aunque el dato no esta confirmado por el autor.
- GPU recomendadas: no disponibles. Para el entrenamiento el autor uso una GPU alquilada en RunPod sin especificar el modelo.
- Cabe en GPU de consumo: previsiblemente si (gama RTX 30/40 con 6 GB o mas), aunque no hay confirmacion documentada.
- Opciones de despliegue: el ecosistema RVC (repositorios de inferencia RVC, Applio, inferencia web de RVC) y el runtime de PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son motores de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia de muestreo | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mojonk/trump-jre-rvc | RVC v2 | 40 kHz | 732 clips / 30,8 min | other | Hugging Face, 0 descargas |
| Modelos RVC v2 de la comunidad (genericos) | RVC v2 | 32-48 kHz | variable | variable | Hugging Face / weights de comunidad |
| So-VITS-SVC | SVC | 44,1 kHz | variable | variable | GitHub / Hugging Face |
| GPT-SoVITS | TTS + SVC | 32 kHz | variable | MIT (codigo) | GitHub / Hugging Face |

La comparacion se limita a la categoria de conversion de voz; no procede comparar con modelos de lenguaje. No hay datos publicos de calidad (MOS, similitud de hablante) para este checkpoint concreto, por lo que la comparativa es estructural y no de rendimiento.

## Limitaciones y advertencias

- Licencia `other` sin texto adicional en la model card: no se especifican condiciones de uso comercial, redistribucion ni obra derivada. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Riesgo alto de suplantacion de identidad: la voz clonada pertenece a una persona publica real; el uso para desinformacion, fraude o difamacion puede tener consecuencias legales en la UE y en Espana.
- Dataset muy reducido (30,8 minutos) y de una unica fuente (entrevista en un podcast): la cobertura de registros, ruido de fondo y condiciones acusticas es limitada, lo que puede degradar la calidad fuera de ese dominio.
- Riesgo de artefactos y alucinaciones acusticas: RVC puede introducir ruidos, inestabilidad en notas sostenidas y perdida de diccion en pasajes rapidos o con mucho ruido.
- Sin documentacion de sesgos: no se han evaluado sesgos de prosodia, acento o genero, ni el impacto de la calidad del audio de entrada.
- Sin idiomas declarados: el dataset es habla en ingles; el comportamiento con otros idiomas no esta validado.
- Sin benchmarks ni evaluacion subjetiva (MOS) publicados: no es posible cuantificar la fidelidad del timbre frente a alternativas.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- El pipeline de Hugging Face no esta declarado, por lo que la carga automatica mediante `transformers` no es posible; requiere el ecosistema RVC.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mojonk/trump-jre-rvc
- Repositorio de referencia RVC (Retrieval-based Voice Conversion): https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
- Applio (interfaz de inferencia RVC): https://github.com/IAHispano/Applio
- Extractor de pitch RMVPE: https://github.com/yxlllc/RMVPE
- RunPod (plataforma de GPU usada para el entrenamiento): https://www.runpod.io
