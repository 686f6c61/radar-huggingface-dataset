# skaldrim/opus-mt-da-en-ct2-int8

## Resumen

`skaldrim/opus-mt-da-en-ct2-int8` es una conversión a CTranslate2 con cuantización int8 de los modelos de traducción automática OPUS-MT de Helsinki-NLP para el par de idiomas danés-inglés, en ambas direcciones. No se trata de un modelo nuevo ni de un fine-tuning: el autor, skaldrim, ha empaquetado los pesos originales de `Helsinki-NLP/opus-mt-da-en` y `Helsinki-NLP/opus-mt-en-da` en formato CTranslate2 para su uso en inferencia local dentro de la aplicación Skaldrim, orientada a la traducción de subtítulos sin envío de datos a servidores externos.

Los modelos originales son transformadores encoder-decoder entrenados con el framework Marian NMT por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (Jörg Tiedemann, Santhosh Thottingal y colaboradores) sobre el corpus OPUS. Cada dirección ocupa aproximadamente 76 MB en pesos int8, lo que los hace extremadamente ligeros y aptos para dispositivos con recursos limitados.

Su relevancia es práctica: ofrece un pipeline de traducción danés-inglés listo para producción con CTranslate2, una de las librerías de inferencia más eficientes para modelos seq2seq, con licencia Apache-2.0 y sin dependencia de servicios en la nube. Es una opción sensata cuando se necesita traducción bidireccional de alta calidad razonable con latencia mínima y huella de memoria reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible (pesos int8 de ~76,4 MB por direccion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | danes (da), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), SentencePiece (`source.spm`, `target.spm`), `shared_vocabulary.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de los modelos OPUS-MT: un transformer encoder-decoder completo entrenado con Marian NMT sobre la colección de corpus paralelos OPUS. Cada dirección (da→en y en→da) es un modelo independiente con su propio vocabulario compartido y sus propios modelos SentencePiece de origen y destino. El modelo da→en y el en→da comparten el mismo fichero `shared_vocabulary.json` (1.157.387 bytes), lo que sugiere un vocabulario conjunto derivado del corpus bilingüe.

La conversión realizada por skaldrim es puramente de formato: se aplicó `ct2-transformers-converter --quantization int8` sobre los pesos Marian originales de Hugging Face, manteniendo los modelos SentencePiece originales sin modificaciones. No hubo reentrenamiento, fine-tuning ni cambios en los datos. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; los modelos OPUS-MT originales se entrenaron de forma supervisada sobre pares de frases del corpus OPUS.

## Capacidades

- Traducción automática bidireccional danés→inglés e inglés→danés.
- Tokenización mediante SentencePiece con vocabulario compartido entre direcciones.
- Inferencia local en CPU y GPU mediante CTranslate2, con soporte de cuantización int8 para reducir memoria y acelerar la decodificación.
- Adecuado para traducción de frases y párrafos cortos, como subtítulos o textos de interfaz.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Capacidades multilingües limitadas estrictamente al par da-en.

## Casos de uso

- Traducción de subtítulos en aplicaciones móviles: el modelo se integra en la app Skaldrim para traducir subtítulos daneses a inglés (y viceversa) en el dispositivo, sin enviar texto a servidores externos, gracias a su tamaño reducido de ~76 MB por dirección.
- Traducción de interfaces de usuario: para localizar cadenas cortas de aplicaciones entre danés e inglés con latencia mínima en CPU, usando CTranslate2 con int8.
- Procesamiento por lotes de documentos: traducción offline de grandes volúmenes de texto danés-inglés en pipelines de preprocesamiento de datos, donde el throughput prima sobre la calidad literaria.
- Traducción en entornos con requisitos de privacidad: organismos o empresas que no pueden enviar contenido a APIs en la nube pueden desplegar el modelo en servidores propios con CTranslate2.
- Generación de datos sintéticos bilingües: traducción automática de corpus para aumentar datasets de entrenamiento o evaluación en tareas de PLN para danés e inglés.
- Prototipado rápido de sistemas de traducción: como baseline ligero en experimentos de investigación o demos, dado su tamaño mínimo y su licencia permisiva Apache-2.0.
- Traducción en dispositivos edge: despliegue en Raspberry Pi u otros dispositivos de recursos limitados gracias a la cuantización int8 y al bajo consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB por dirección en int8; los pesos ocupan ~76 MB, más overhead de activaciones y vocabulario.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona igualmente bien en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en CPU modesta.
- Opciones de despliegue: CTranslate2 (nativo), con bindings de Python; también existen conversiones ONNX del modelo base (`onnx-community/opus-mt-da-en`) para Transformers.js.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por frase en CPU moderna, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| skaldrim/opus-mt-da-en-ct2-int8 | ~76 MB int8 por dirección | no disponible | da, en | Apache-2.0 | CTranslate2 |
| Helsinki-NLP/opus-mt-da-en | no disponible (pesos fp32) | no disponible | da, en | Apache-2.0 (modelo original) | safetensors/PyTorch |
| onnx-community/opus-mt-da-en | no disponible | no disponible | da, en | cc-by-4.0 (según model card de ONNX) | ONNX |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de información sobre alternativas de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Modelo de traducción especializado: no es un modelo de propósito general; no genera texto libre, no razona ni responde preguntas.
- Calidad limitada al par da-en: no cubre otros idiomas ni variantes dialectales.
- Riesgo de traducciones literales o imprecisas en textos técnicos, coloquiales o con jerga; los modelos OPUS-MT tienen calidad variable según el dominio.
- Sin información sobre sesgos específicos; los corpus OPUS pueden contener sesgos de género, culturales o de dominio.
- Longitud de contexto no documentada: puede truncar frases largas o párrafos extensos sin aviso.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original y citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una conversión reciente y sin validación comunitaria; conviene verificar los hashes SHA-256 incluidos en la model card antes de usarlo en producción.
- No se garantiza la paridad exacta con los pesos originales más allá de la conversión de formato declarada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skaldrim/opus-mt-da-en-ct2-int8
- Modelo base da→en: https://huggingface.co/Helsinki-NLP/opus-mt-da-en
- Modelo base en→da: https://huggingface.co/Helsinki-NLP/opus-mt-en-da
- Documentación de CTranslate2 para OPUS-MT: https://opennmt.net/CTranslate2/guides/opus_mt.html
- Repositorio CTranslate2: https://github.com/OpenNMT/CTranslate2
- Conversión ONNX del modelo base: https://huggingface.co/onnx-community/opus-mt-da-en
- Paper de OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.eamt-1.61/
