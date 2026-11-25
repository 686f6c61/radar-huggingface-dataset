# JeeerryZ/opus-mt-ROMANCE-en-onnx-int8

## Resumen

opus-mt-ROMANCE-en-onnx-int8 es una conversion a ONNX con pesos almacenados en 8 bits del modelo de traduccion Helsinki-NLP/opus-mt-ROMANCE-en, desarrollado originalmente por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce lenguas romances (el autor lo ha preparado y evaluado especificamente para portugues) al ingles, y esta pensado para entornos de inferencia ligera, incluidos escenarios de traduccion de voz en tiempo real.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado sobre corpus paralelos del proyecto OPUS. Esta version concreta anade dos modificaciones tecnicas relevantes: un decoder sin cache de clave/valor que calcula los logits de una unica posicion a partir de una entrada adicional `pos`, y la exposicion de la atencion cruzada de la cuarta capa del decoder para tareas de alineamiento de palabras. Los pesos se almacenan en int8 (una escala por canal) pero se restauran a float32 dentro del grafo, de modo que el computo sigue siendo en float32.

El repositorio incluye ademas un modelo auxiliar de puntuacion y truecasing para portugues (`pontuador/`), util como preprocesado de transcripciones de voz sin puntuar. El modelo es relevante para quienes necesitan un traductor romance-ingles de baja huella (0,1 GB de repositorio) desplegable en ONNX Runtime, con licencia Apache 2.0 y soporte de DirectML en Windows.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos almacenados en int8 (una escala por canal), restaurados a float32 dentro del grafo |
| Idiomas soportados | pt, en (modelo entrenado para lenguas romances hacia ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (pesos en `onnx/pesos.bin`); modelo de puntuacion en ONNX con sentencepiece |

## Arquitectura y entrenamiento

El modelo es una conversion del checkpoint Marian de OPUS-MT, un transformer encoder-decoder clasico de traduccion automatica neuronal. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; el entrenamiento original corresponde al proyecto OPUS-MT de la Universidad de Helsinki sobre corpus paralelos OPUS.

Las innovaciones de esta version son de despliegue, no de entrenamiento. El decoder `decoder_corte.onnx` prescinde del cache de clave/valor y calcula los logits de una sola posicion dada por la entrada `pos` (salida `logits_t`), lo que simplifica la integracion en pipelines de decodificacion externos. Ademas expone la atencion cruzada de la capa 4 del decoder en esa posicion (salida `atencao_t4`), junto con umbrales de atencion en `ligacao.json` para alineamiento de palabras. Los pesos se guardan en int8 con una escala por canal y la tabla de embeddings compartida se almacena una sola vez con escalado por token; dentro del grafo se restauran a float32, por lo que el computo no se degrada a precision reducida. En DirectML es necesario fijar las dimensiones libres (`batch_size`, `encoder_sequence_length`, `decoder_sequence_length`) al crear la sesion.

## Capacidades

- Traduccion de lenguas romances a ingles, con preparacion y evaluacion especifica para portugues.
- Decodificacion por posicion mediante decoder sin cache de clave/valor, adecuada para integracion en bucles de generacion propios.
- Extraccion de atencion cruzada de la capa 4 del decoder para alineamiento de palabras entre origen y destino.
- Preprocesado opcional de puntuacion, capitalizacion y segmentacion de frases en portugues mediante el modelo `pontuador/`.
- Inferencia en ONNX Runtime, con soporte de DirectML.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Traduccion de transcripciones de voz en portugues: el pipeline combina el puntuador para restaurar puntuacion y mayusculas y despues traduce al ingles, un flujo pensado explicitamente por el autor para habla.
- Subtitulado automatico portugues-ingles: el decoder sin cache permite integrar la generacion token a token en un pipeline propio con control fino de la decodificacion.
- Alineamiento de palabras para memorias de traduccion: la salida `atencao_t4` y los umbrales de `ligacao.json` permiten emparejar terminos origen-destino, util en herramientas de TAO o glosarios.
- Traduccion en aplicaciones de escritorio Windows: el soporte de DirectML y el tamano reducido (0,1 GB) facilitan el despliegue local sin GPU dedicada de datacenter.
- Servicios de traduccion de bajo coste en entornos con CPU: el formato ONNX con pesos int8 reduce el uso de memoria y disco frente al checkpoint original.
- Preprocesado de corpus portugueses para su publicacion en ingles: el puntuador normaliza texto sin puntuar antes de la traduccion, mejorando la calidad de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta que, en una muestra en portugues, el puntuador convertido coincidio con el original en el 98,8 % de las decisiones de puntuacion y limites de frase y en el 99,8 % de las decisiones de capitalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 0,1 GB, por lo que la huella en memoria es muy reducida.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime, incluida la aceleracion DirectML en Windows; no se especifican modelos concretos.
- Cabe en GPU de consumo: si, dado el tamano del repositorio y el almacenamiento int8 de los pesos.
- Opciones de despliegue: ONNX Runtime (CPU o DirectML); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JeeerryZ/opus-mt-ROMANCE-en-onnx-int8 | no disponible | no disponible | Apache 2.0 | ONNX int8 | Decoder sin cache, atencion para alineamiento, puntuador pt incluido |
| Helsinki-NLP/opus-mt-ROMANCE-en | no disponible | no disponible | Apache 2.0 | safetensors/PyTorch | Modelo original; sin optimizaciones ONNX |
| Xenova/opus-mt-ROMANCE-en | no disponible | no disponible | Apache 2.0 | ONNX | Export ONNX de referencia; sin decoder recortado ni salida de atencion |

## Limitaciones y advertencias

- El modelo esta preparado y evaluado para portugues; su comportamiento en otras lenguas romances no se documenta en esta version.
- Solo traduce hacia ingles; no soporta la direccion inversa.
- No se han publicado evaluaciones de calidad de traduccion (BLEU, COMET u otras) para esta conversion.
- El decoder sin cache requiere gestionar externamente la posicion y el bucle de decodificacion, lo que anade complejidad de integracion.
- En DirectML es obligatorio fijar las dimensiones libres al crear la sesion; de lo contrario la inferencia puede fallar.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo NMT, puede producir traducciones fluidas pero infieles en entradas ruidosas o fuera de dominio.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio no esta afiliado ni respaldado por los autores originales; conviene citar el trabajo OPUS-MT.
- El modelo de puntuacion procede de 1-800-BAD-CODE/punctuation_fullstop_truecase_romance, tambien Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JeeerryZ/opus-mt-ROMANCE-en-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ROMANCE-en
- Export ONNX de partida: https://huggingface.co/Xenova/opus-mt-ROMANCE-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Modelo de puntuacion: https://huggingface.co/1-800-BAD-CODE/punctuation_fullstop_truecase_romance
- Paper OPUS-MT: https://aclanthology.org/2020.eamt-1.61/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
