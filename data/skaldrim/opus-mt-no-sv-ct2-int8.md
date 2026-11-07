# skaldrim/opus-mt-no-sv-ct2-int8

## Resumen

`skaldrim/opus-mt-no-sv-ct2-int8` es una conversión a CTranslate2 con cuantización int8 de los modelos de traducción automática `Helsinki-NLP/opus-mt-no-sv` y `Helsinki-NLP/opus-mt-sv-no`, desarrollados por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (Jörg Tiedemann, Santhosh Thottingal y colaboradores). El paquete contiene dos carpetas independientes, una por dirección de traducción (noruego a sueco y sueco a noruego), pensadas para traducción en dispositivo (on-device) dentro de la aplicación Skaldrim, sin envío de datos a servidores externos.

El modelo original es un transformer encoder-decoder de la familia Marian NMT, entrenado sobre la colección de corpus OPUS. Esta variante concreta no introduce ningún cambio en los pesos ni en el entrenamiento: únicamente transforma el formato de los pesos a CTranslate2 con cuantización int8 y conserva los modelos SentencePiece originales (`source.spm`, `target.spm`) para la tokenización. El resultado es un artefacto compacto de unos 0,1 GB en total (cada fichero `model.bin` ronda los 49 MB), adecuado para ejecución en CPU y entornos con recursos limitados.

Su relevancia radica en dos factores: por un lado, cubre el par lingüístico noruego-sueco, que incluye bokmål (nb), nynorsk (nn) y las etiquetas genéricas `no` y `sv`; por otro, ofrece una vía de despliegue ligera y sin dependencias de GPU para traducción de subtítulos y textos cortos. La licencia Apache-2.0 del modelo original se mantiene, lo que facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parámetros totales | no disponible (tamaño de pesos int8: ~49 MB por dirección) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (CTranslate2) |
| Idiomas soportados | nb, nn, no, sv |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), SentencePiece (`source.spm`, `target.spm`), `shared_vocabulary.json`, `config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de los modelos OPUS-MT de Helsinki-NLP: un transformer encoder-decoder entrenado con Marian NMT sobre pares de frases extraídos de la colección de corpus OPUS. El modelo original `Helsinki-NLP/opus-mt-no-sv` traduce de noruego a sueco y `Helsinki-NLP/opus-mt-sv-no` realiza la dirección inversa. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card del autor de la conversión no los detalla y la documentación pública de OPUS-MT describe el pipeline general de entrenamiento pero no las cifras específicas de este par.

La innovación de esta variante es exclusivamente de despliegue: la conversión mediante `ct2-transformers-converter --quantization int8` reduce el peso de los pesos a la mitad aproximadamente y permite inferencia eficiente en CPU con CTranslate2. No hay cambios en el vocabulario ni en los tokenizadores: los modelos SentencePiece son los originales. El paquete incluye un `shared_vocabulary.json` por dirección, lo que sugiere un vocabulario compartido entre encoder y decoder, habitual en Marian.

## Capacidades

- Traducción automática bidireccional entre noruego (nb, nn, no) y sueco (sv).
- Traducción de textos cortos y medianos, incluyendo subtítulos y leyendas, que es el caso de uso declarado por el autor.
- Ejecución en dispositivo sin conexión, gracias al formato CTranslate2 int8.
- Inferencia en CPU con requisitos de memoria muy bajos.
- Tokenización SentencePiece integrada para ambos idiomas.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de traducción puro.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Cobertura multilingüe limitada estrictamente al par noruego-sueco.

## Casos de uso

- Traducción de subtítulos en aplicaciones móviles: el modelo está pensado para traducir leyendas dentro de la app Skaldrim sin enviar texto a servidores; su tamaño (~49 MB por dirección) y su formato int8 permiten ejecutarlo en el propio dispositivo.
- Traducción de documentación técnica entre noruego y sueco: útil para equipos nórdicos que mantienen manuales en ambos idiomas y necesitan una primera pasada automática antes de revisión humana.
- Localización de interfaces de usuario: frases cortas de menús, botones y mensajes de error pueden traducirse en tiempo de ejecución o en un pipeline previo por lotes con CTranslate2.
- Atención al cliente en países nórdicos: traducción de consultas de usuarios suecos a noruego (y viceversa) para que un único equipo de soporte pueda atender ambos mercados, con la ventaja de que los datos no salen de la infraestructura propia.
- Procesamiento por lotes de corpus paralelos: generación de traducciones de referencia para construir datasets de evaluación o para pre-anotar corpus en proyectos de investigación lingüística entre noruego y sueco.
- Traducción de contenido editorial y blogs: primera versión automática de artículos entre ambos idiomas que luego un editor humano pule, aprovechando el bajo coste de inferencia en CPU.
- Integración en pipelines de CI/CD documental: traducción automática de changelogs y notas de versión de noruego a sueco en cada release, ejecutada en runners sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso típico, ya que CTranslate2 con int8 está orientado a CPU; en GPU el consumo sería inferior a 1 GB, dado el tamaño de los pesos (~49 MB por dirección).
- GPU recomendadas: no se requieren; cualquier GPU con soporte CUDA puede ejecutar CTranslate2, pero el modelo está dimensionado para CPU.
- Cabe en cualquier GPU consumer, e incluso en dispositivos móviles y sistemas embebidos, por el reducido tamaño de los pesos.
- Opciones de despliegue: CTranslate2 (librería nativa, Python, o el servidor `ct2-server`); no se distribuye en formato GGUF ni transformers nativo en este repositorio, aunque los modelos originales de Helsinki-NLP sí están disponibles en formato transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera baja latencia en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| skaldrim/opus-mt-no-sv-ct2-int8 | no disponible (~49 MB int8 por dirección) | no disponible | nb, nn, no, sv | Apache-2.0 | CTranslate2 int8 |
| Helsinki-NLP/opus-mt-no-sv | no disponible | no disponible | nb, nn, no, sv | Apache-2.0 | transformers (Marian) |
| Helsinki-NLP/opus-mt-sv-no | no disponible | no disponible | sv, nb, nn, no | Apache-2.0 | transformers (Marian) |

La diferencia principal frente a los originales es el formato y la cuantización: esta variante pesa aproximadamente la mitad y está optimizada para CTranslate2, mientras que los originales se cargan con la librería transformers y pesos en precisión completa. En cuanto a calidad de traducción, al no haberse reentrenado, se espera un comportamiento equivalente al original, aunque no se han publicado métricas comparativas en la información disponible.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo reentrenado: hereda todos los sesgos y limitaciones de los OPUS-MT originales, entrenados sobre corpus OPUS con posibles desequilibrios de dominio y registro.
- Riesgo de alucinación y de traducciones literalmente incorrectas en frases largas, terminología especializada o lenguaje coloquial; no se han publicado evaluaciones de calidad para esta conversión.
- Longitud de contexto no documentada; los modelos Marian suelen estar limitados a segmentos de frase, por lo que no es adecuado para documentos largos sin segmentación previa.
- Cobertura lingüística restringida al par noruego-sueco; no traduce a inglés ni a otras lenguas.
- La etiqueta `no` es genérica y puede solaparse con nb y nn; la calidad puede variar entre bokmål y nynorsk.
- La licencia Apache-2.0 permite uso comercial, pero el autor de la conversión declina responsabilidad sobre errores introducidos en el proceso; conviene validar el artefacto antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso ni reportes de fallos.
- No se distribuyen pesos en otros formatos (GGUF, safetensors) en este repositorio; para esos formatos hay que acudir a los modelos originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skaldrim/opus-mt-no-sv-ct2-int8
- Modelo base noruego a sueco: https://huggingface.co/Helsinki-NLP/opus-mt-no-sv
- Modelo base sueco a noruego: https://huggingface.co/Helsinki-NLP/opus-mt-sv-no
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Guía sobre modelos OPUS-MT (fxis.ai): https://fxis.ai/edu/your-ultimate-guide-to-working-with-opus-mt-models/
- Paper de OPUS-MT (Tiedemann y Thottingal, EAMT 2020): no disponible como enlace directo en la información proporcionada.
