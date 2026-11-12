# khabouss/opus-mt-tc-big-en-pt-onnx

## Resumen

`khabouss/opus-mt-tc-big-en-pt-onnx` es una conversión a ONNX con cuantización int8 del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-tc-big-en-pt`, desarrollado originalmente por el proyecto OPUS-MT del grupo Language Technology de la Universidad de Helsinki. El modelo traduce de inglés (en) a portugués (pt) y forma parte de la familia `opus-mt-tc` (transformer-big) entrenada con Marian NMT sobre datos de OPUS. Esta variante concreta no aporta cambios en pesos ni entrenamiento: solo añade la conversión a formato ONNX y la cuantización int8 necesarias para ejecutar el modelo con `onnxruntime` sin dependencia de PyTorch.

El modelo resuelve un problema muy concreto: la traducción automática inglés-portugués de alta calidad en entornos con recursos limitados, especialmente CPU. Al estar cuantizado a int8 y empaquetado en ONNX, el repositorio ocupa aproximadamente 0,3 GB y puede ejecutarse localmente en un CLI de traducción de ficheros de internacionalización (i18n), que es el caso de uso declarado por el autor de la conversión (`locale-ai`). Es relevante para desarrolladores que necesitan traducir ficheros de localización sin enviar datos a servicios en la nube y sin GPU.

La arquitectura subyacente es un transformer encoder-decoder de tipo "big" de Marian, con tokenización SentencePiece de 32k vocabulario compartido. El modelo soporta dos etiquetas de idioma destino: `>>por<<` para portugués europeo y `>>pob<<` para portugués de Brasil. La licencia es CC BY 4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT, variante transformer-big) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX cuantizado); el modelo original en PyTorch está en fp32 |
| Idiomas soportados | inglés (origen); portugués europeo (`por`) y portugués de Brasil (`pob`) como destino |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (int8); el original en safetensors/PyTorch vía transformers |
| Tamano del repositorio | 0,3 GB |
| Tokenización | SentencePiece, 32k vocabulario (spm32k, spm32k) |
| Fecha de publicación del modelo original | 2022-03-13 |
| Datos de entrenamiento | opusTCv20210807+bt |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder completo de Marian NMT, en su variante "big" (más profunda y ancha que la variante base de OPUS-MT). Marian es una implementación eficiente de traducción automática escrita en C++ que el proyecto OPUS-MT utiliza para entrenar sus modelos; posteriormente los pesos se convierten a PyTorch para su uso con la librería `transformers`. La tokenización emplea SentencePiece con vocabulario de 32k para origen y destino.

El entrenamiento se realizó sobre el corpus `opusTCv20210807+bt`, que combina datos de OPUS (corpus paralelos multilingües) con backtranslation ("bt"), siguiendo los procedimientos de OPUS-MT-train. El modelo es multilingüe en el lado destino (portugués europeo y brasileño) y requiere un token de idioma al inicio de la frase (`>>por<<` o `>>pob<<`). No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO; en el contexto de un modelo NMT de 2022, lo habitual es entrenamiento supervisado con backtranslation y sin alineamiento por preferencias. La innovación técnica de este repositorio concreto es la conversión a ONNX con `optimum-onnx` y la cuantización int8, que permite inferencia en CPU sin PyTorch.

## Capacidades

- Traducción automática de inglés a portugués (europeo y brasileño) a nivel de frase.
- Selección de variante dialectal mediante token de idioma: `>>por<<` (portugués europeo) y `>>pob<<` (portugués de Brasil).
- Ejecución sin PyTorch mediante `onnxruntime`, lo que reduce dependencias y facilita el despliegue.
- Inferencia en CPU viable gracias a la cuantización int8 y al tamaño contenido del repositorio (0,3 GB).
- Procesamiento por lotes (batch) de frases, tal como se muestra en los ejemplos de uso con `transformers`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un modelo NMT puro.
- Capacidad multilingüe limitada estrictamente al par inglés-portugués (con dos variantes de destino).

## Casos de uso

- Traducción de ficheros de internacionalización (i18n): el caso de uso declarado por el autor. El CLI `locale-ai` traduce ficheros de locale localmente en CPU, enviando cada cadena al modelo ONNX y eligiendo `>>por<<` o `>>pob<<` según el mercado objetivo. Es adecuado porque evita enviar cadenas de producto a APIs externas y no requiere GPU.
- Localización de documentación técnica: traducción por lotes de README, guías y manuales de inglés a portugués en pipelines de CI, usando `onnxruntime` en runners estándar sin acelerador.
- Traducción de contenido web y blogs: integración en un backend que traduzca artículos o entradas de blog al portugués europeo o brasileño según la región del visitante, con latencia baja en CPU.
- Pre-traducción asistida por humanos: generar borradores automáticos que un traductor humano revisa y pule, reduciendo el esfuerzo en flujos de localización profesional.
- Traducción de subtítulos y transcripciones: procesamiento de segmentos cortos de texto (frases de subtítulos) en local, aprovechando que el modelo está entrenado a nivel de frase.
- Traducción de correos y mensajes de soporte: integración en herramientas internas que traduzcan comunicaciones de clientes o tickets entre equipos anglófonos y lusófonos, con despliegue on-premise para cumplir requisitos de privacidad.
- Traducción de datos de entrenamiento o evaluación: conversión de datasets en inglés a portugués para experimentos de NLP, ejecutable en máquinas sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Traducción eng-por | flores101-devtest | BLEU | 50,4 |
| Traducción eng-por | tatoeba-test-v2021-08-07 | BLEU | 49,6 |

No se han publicado en la información disponible resultados de benchmarks para la versión ONNX int8; los valores anteriores corresponden al modelo original `opus-mt-tc-big-en-pt` en PyTorch. La cuantización int8 puede introducir una ligera degradación de calidad respecto a fp32, pero no se dispone de datos que la cuantifiquen.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal (CPU); en GPU, el modelo int8 ocupa aproximadamente 0,3 GB de pesos, por lo que cabría en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) puede ejecutarlo sobradamente; también A100/H100 si se integra en un servicio de mayor escala. No obstante, el formato ONNX int8 está pensado para CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual, dado su tamaño reducido.
- Opciones de despliegue: `onnxruntime` (CPU o GPU), `optimum-onnx`; el modelo original puede desplegarse con `transformers` (PyTorch), y potencialmente con servidores de inferencia compatibles con ONNX (por ejemplo, Triton, aunque no se menciona explícitamente en la información disponible).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLEU (flores101 eng-por) | Licencia | Formato |
|---|---|---|---|---|---|
| khabouss/opus-mt-tc-big-en-pt-onnx (este) | no disponible (transformer-big) | no disponible | 50,4 (heredado del original) | CC BY 4.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-tc-big-en-pt | no disponible (transformer-big) | no disponible | 50,4 | CC BY 4.0 | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-en-pt (variante base) | no disponible | no disponible | no disponible en la información | CC BY 4.0 | PyTorch/safetensors |
| Modelos NMT comerciales (DeepL, Google Translate) | no disponibles | no disponible | no disponible | propietaria | API |

La comparación se limita a la familia OPUS-MT y a servicios propietarios; no se dispone de datos de benchmarks de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo traduce de inglés a portugués; no soporta otras direcciones ni pares de idiomas.
- Requiere el token de idioma destino (`>>por<<` o `>>pob<<`) al inicio de cada frase; omitirlo puede producir resultados incorrectos o mal etiquetados.
- Es un modelo NMT de 2022 entrenado con datos de OPUS; puede presentar sesgos presentes en los corpus paralelos (género, cultura, terminología) y no se ha documentado ningún proceso de mitigación.
- Riesgo de alucinación y de traducciones fluentes pero semánticamente incorrectas, especialmente en frases ambiguas, jerga o dominios especializados (legal, médico, técnico).
- La cuantización int8 puede degradar ligeramente la calidad frente al modelo original en fp32; no hay métricas publicadas que cuantifiquen esa pérdida.
- No es un modelo conversacional ni de razonamiento: no soporta tool calling, agentes ni instrucciones complejas.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución al proyecto OPUS-MT y a los autores originales; el autor de la conversión ONNX pide que se acredite al proyecto OPUS-MT por el modelo, el entrenamiento y los datos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad; conviene evaluar la calidad de la conversión ONNX antes de usarla en producción.
- No se dispone de información sobre la longitud máxima de secuencia soportada ni sobre el comportamiento con textos largos.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/khabouss/opus-mt-tc-big-en-pt-onnx
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-pt
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Pipeline de entrenamiento OPUS-MT-train: https://github.com/Helsinki-NLP/Opus-MT-train
- Marian NMT: https://marian-nmt.github.io/
- OPUS (corpus): https://opus.nlpl.eu/
- Tatoeba-Challenge (datos y modelos): https://github.com/Helsinki-NLP/Tatoeba-Challenge
- README de modelos eng-por: https://github.com/Helsinki-NLP/Tatoeba-Challenge/tree/master/models/eng-por/README.md
- Documentación de MarianMT en transformers: https://huggingface.co/docs/transformers/model_doc/marian
- Repositorio locale-ai (CLI que usa este modelo): https://github.com/khabouss/locale-ai
- Script de conversión: https://github.com/khabouss/locale-ai/blob/main/scripts/convert-marian.py
- optimum-onnx: https://github.com/huggingface/optimum-onnx
- Paper OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Paper Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139/
- Modelo original (zip): https://object.pouta.csc.fi/Tatoeba-MT-models/eng-por/opusTCv20210807+bt_transformer-big_2022-03-13.zip
