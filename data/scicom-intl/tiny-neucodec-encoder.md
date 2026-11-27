# Scicom-intl/Tiny-NeuCodec-Encoder

## Resumen

Tiny NeuCodec Encoder es un conjunto de codificadores destilados para NeuCodec, el códec neuronal de audio de Neuphonic. Lo desarrolla Scicom-intl y resuelve un problema concreto: el codificador original de NeuCodec ocupa 636M parámetros y resulta caro de ejecutar en pipelines de clonación de voz, mientras que estos estudiantes reducen el coste a 152M (variante S4) o 104M (S2) parámetros manteniendo el mismo códec de salida.

La innovación clave es que los modelos destilados escriben los códigos propios de NeuCodec sobre el mismo codebook fijo de 65.536 entradas a 50 códigos por segundo, de modo que el decodificador de NeuCodec y cualquier modelo de lenguaje entrenado sobre sus códigos los leen sin cambios. Según la model card, S4 es 2,2 veces más rápido que el codificador original en GPU.

El modelo se distribuye bajo licencia Apache 2.0, en formato PyTorch, y está pensado para servir como extractor de características en sistemas de clonación de voz basados en lenguaje modelo, como el proyecto TTS-API-Neucodec del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador neuronal de audio: rama convolucional sobre la forma de onda + transformer sobre banco de filtros (sustituye w2v-BERT 2.0 por sus primeras 4 o 2 capas, reentrenadas) |
| Parametros totales | 152M (S4) / 104M (S2) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa un clip por llamada, sin padding por lote) |
| Tipos de cuantizacion | No disponible; la model card menciona ejecución en 16 bits (bf16=False para 32 bits) |
| Idiomas soportados | No disponible como lista cerrada; el entrenamiento incluye habla sintética multilingüe y 722 horas de habla leída pública en varios idiomas; las evaluaciones cubren inglés, malayo, mandarín y tamil |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (carpetas S4/ y S2/, más tiny_encoder.py) |

## Arquitectura y entrenamiento

El codificador original de NeuCodec combina dos ramas: convoluciones sobre la forma de onda y w2v-BERT 2.0 sobre un banco de filtros. Los modelos Tiny sustituyen w2v-BERT por sus primeras 4 capas (S4) o 2 capas (S2), reentrenadas, y conservan intacta la rama convolucional. El cuantizador y el decodificador de NeuCodec no se tocan, por lo que la salida sigue siendo el mismo códec de 65.536 entradas a 50 códigos por segundo.

El entrenamiento consiste en reproducir los 8 números que el codificador de NeuCodec entrega al cuantizador, durante 60.000 pasos. Los datos son grabaciones de estudio internas (23,3 horas, 7 voces), habla sintética en múltiples voces y 722 horas de habla leída pública en varios idiomas. No se usan transcripciones. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Extracción de características de audio: codifica una forma de onda de 16 kHz en códigos de 50 por segundo.
- Escritura de códigos compatibles con NeuCodec: el decodificador original y los modelos de lenguaje entrenados sobre sus códigos los consumen sin modificación.
- Clonación de voz dentro de un pipeline de lenguaje modelo: el clip de referencia se codifica con el modelo Tiny y el modelo de lenguaje lo continúa.
- Reducción de coste computacional: 152M o 104M parámetros frente a 636M del codificador original, con una aceleración de 2,2 veces en GPU según la model card.
- Multilingüismo heredado de los datos de entrenamiento (habla leída en varios idiomas), aunque no se publica una lista cerrada de idiomas.
- No soporta tool calling, agentes ni razonamiento de múltiples pasos: es un extractor de características, no un modelo generativo de texto.
- No incluye visión, audio de entrada adicional ni modo de pensamiento.

## Casos de uso

- Clonación de voz en producción: codificar el clip de referencia con S4 y dejar que un modelo de lenguaje entrenado sobre códigos de NeuCodec genere la nueva frase; la model card reporta un WER de 8,5 % frente al 8,4 % de NeuCodec, sin coste medible en error de palabra.
- Servicio de conversión de voz en API: TTS-API-Neucodec permite fijar `VC_ENCODER=S4` (o S2) en el archivo `.env` para que el endpoint `/v1/audio/vc` codifique la referencia con el modelo Tiny.
- Despliegue con restricciones de VRAM: `load_tiny_encoder(..., free_teacher=True)` libera w2v-BERT y reduce los pesos en GPU de 3,1 GB a 1,3 GB (S4) o 1,1 GB (S2), lo que facilita servir el códec junto al modelo de lenguaje en una sola GPU.
- Prototipado rápido de pipelines TTS: al mantener el mismo codebook y decodificador, se puede sustituir el codificador original por S4 sin reentrenar el modelo de lenguaje ni cambiar el formato de los códigos.
- Evaluación comparativa de códecs: S4 y S2 permiten medir el efecto de la profundidad del transformer (4 frente a 2 capas) sobre la fidelidad de los códigos (58,4 % frente a 49,2 % de códigos idénticos en grabaciones de estudio).
- Investigación en destilación de codificadores neuronales: la receta (reentrenar las primeras capas de w2v-BERT conservando la rama convolucional, sin transcripciones) sirve como referencia para destilar otros códecs.

## Benchmarks y rendimiento

Resultados de la model card, con el mismo audio decodificado por el decodificador de NeuCodec y puntuado contra la entrada:

| Test set | Códigos de | Códigos idénticos, % | Dígitos idénticos, % | MOS | Similitud de hablante | PESQ | Nivel frente a entrada, dB |
|---|---|---:|---:|---:|---:|---:|---:|
| Grabaciones de estudio (240 clips) | NeuCodec | 100 | 100 | 2,88 | 0,979 | 1,83 | -0,6 |
| | S4 | 58,4 | 92,4 | 2,88 | 0,979 | 1,84 | -0,6 |
| | S2 | 49,2 | 89,9 | 2,88 | 0,979 | 1,83 | -0,6 |
| Habla sintética (120 clips) | NeuCodec | 100 | 100 | 2,66 | 0,983 | 2,72 | -0,1 |
| | S4 | 55,2 | 91,6 | 2,66 | 0,982 | 2,74 | -0,0 |
| | S2 | 44,6 | 88,4 | 2,66 | 0,982 | 2,72 | +0,0 |
| FLEURS (200 clips) | NeuCodec | 100 | 100 | 2,47 | 0,959 | 1,64 | +2,6 |
| | S4 | 49,6 | 90,3 | 2,47 | 0,957 | 1,64 | +2,4 |
| | S2 | 36,2 | 86,0 | 2,45 | 0,955 | 1,63 | +2,2 |

Clonación de voz a través de un modelo de lenguaje (194 clips de referencia, 1.304 tomas muestreadas por codificador):

| Métrica | NeuCodec | S4 | S2 |
|---|---:|---:|---:|
| WER frente a la frase pedida | 8,4 % | 8,5 % | 9,0 % |
| Diferencia frente a NeuCodec (IC 95 %) | | +0,1 (-0,6 a +0,7) | +0,6 (-0,1 a +1,4) |
| Tomas con la mitad o más de palabras mal | 2,4 % | 2,8 % | 3,1 % |
| Diferencia frente a NeuCodec (IC 95 %) | | +0,4 (-0,7 a +1,5) | +0,7 (-0,4 a +1,7) |
| Similitud de hablante frente a referencia, diferencia | | +0,001 (-0,001 a +0,003) | -0,001 (-0,004 a +0,002) |
| Nivel del habla generada, diferencia, dB | | -0,2 (-0,5 a +0,1) | -0,1 (-0,4 a +0,3) |

La model card señala que el propio codificador de NeuCodec coincide consigo mismo en el 92 % de los códigos en 16 bits y en el 69 % al añadir un segundo de silencio, lo que da escala a las cifras de coincidencia.

## Requisitos de hardware

- VRAM estimada: 3,1 GB con NeuCodec completo cargado; 1,3 GB (S4) o 1,1 GB (S2) con `free_teacher=True`.
- GPU recomendadas: no se especifican modelos concretos; las mediciones se hicieron en GPU con el banco de filtros en GPU y el transformer en 16 bits.
- Cabe en GPU de consumo: no se indica explícitamente, pero el peso del codificador (152M o 104M parámetros) y los 1,3 GB de VRAM sugieren que sí en tarjetas con al menos esa memoria; falta confirmación del autor.
- Opciones de despliegue: paquete `neucodec` con `tiny_encoder.py` del repositorio, y TTS-API-Neucodec mediante `VC_ENCODER`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,2 veces más rápido que el codificador de NeuCodec en GPU para un clip de 10 segundos, según la figura de velocidad de la model card; no se publican valores absolutos.
- Restricción operativa: una llamada por clip; no se admite padding por lote porque altera los códigos.

## Comparativa con modelos similares

| Modelo | Parámetros | Códigos compatibles con NeuCodec | Licencia | Uso |
|---|---:|---|---|---|
| NeuCodec (codificador original) | 636M | 100 % | no disponible en la información | Referencia de calidad |
| Tiny NeuCodec S4 | 152M | 50-58 % | Apache 2.0 | Clonación de voz sin coste medible en WER |
| Tiny NeuCodec S2 | 104M | 36-49 % | Apache 2.0 | La variante más pequeña |

No se dispone de datos de otros códecs neuronales comparables en la información proporcionada.

## Limitaciones y advertencias

- Los códigos no son idénticos a los de NeuCodec: entre el 36 % y el 58 % de coincidencia según variante y conjunto de prueba, lo que puede afectar a modelos de lenguaje muy sensibles a la distribución exacta de códigos.
- El WER de clonación de S2 es ligeramente superior (9,0 % frente a 8,4 %), con un intervalo de confianza que no descarta diferencias mayores.
- No se admite procesamiento por lotes con padding: cada clip debe codificarse por separado.
- Con `free_teacher=True` se pierde la función `codec.encode_code`; solo queda operativo el decodificador.
- No se publica lista de idiomas soportados ni evaluación de sesgos por idioma o acento.
- Riesgo de alucinación: no aplica al codificador en sí, pero los modelos de lenguaje que consumen sus códigos pueden generar contenido no fiel a la referencia.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia de NeuCodec y de w2v-BERT 2.0, de la que derivan las capas reentrenadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por la comunidad es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/Tiny-NeuCodec-Encoder
- NeuCodec original: https://huggingface.co/neuphonic/neucodec
- TTS-API-Neucodec: https://github.com/Scicom-AI-Enterprise-Organization/TTS-API-Neucodec
- Modelo de lenguaje de clonación: https://huggingface.co/Scicom-intl/Multilingual-TTS-1.7B-Base
- Figura de velocidad: https://huggingface.co/Scicom-intl/Tiny-NeuCodec-Encoder/resolve/main/figures/speed.png
- Figura de códigos idénticos: https://huggingface.co/Scicom-intl/Tiny-NeuCodec-Encoder/resolve/main/figures/codes.png
- Figura de MOS predicho: https://huggingface.co/Scicom-intl/Tiny-NeuCodec-Encoder/resolve/main/figures/audio.png
- Figura de WER de clonación: https://huggingface.co/Scicom-intl/Tiny-NeuCodec-Encoder/resolve/main/figures/cloning.png
