# aashishkumar-tech/donut-bank-model

## Resumen

`aashishkumar-tech/donut-bank-model` es un adaptador LoRA publicado en HuggingFace mediante la librería PEFT, construido sobre el modelo `naver-clova-ix/donut-base`. No se trata, por tanto, de un modelo entrenado desde cero, sino de un conjunto de pesos de ajuste fino que debe cargarse junto al modelo base para poder ejecutarse. El nombre sugiere un ajuste orientado a documentos bancarios, pero la model card no documenta el dominio, el conjunto de datos ni el objetivo concreto del entrenamiento.

Donut (Document Understanding Transformer) es una familia de modelos OCR-free para comprensión de documentos: procesa la imagen de la página directamente y genera la salida estructurada de forma autorregresiva, sin depender de un motor OCR externo. Esa característica la hace relevante para pipelines de extracción de campos en documentos escaneados, donde un OCR tradicional introduce errores en cascada y añade latencia.

La información pública disponible es extremadamente escasa: el repositorio se creó y actualizó el 19 de septiembre de 2026, acumula 0 descargas y 0 «likes», y la model card es la plantilla por defecto de HuggingFace con todos los campos marcados como «More Information Needed». No hay licencia declarada, ni idiomas, ni pipeline, ni resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `naver-clova-ix/donut-base`; el modelo base es un transformer encoder-decoder OCR-free (encoder visual + decoder autorregresivo) |
| Parametros totales | No disponible para el adaptador. El modelo base declara del orden de 177 M de parámetros en su model card pública, dato no confirmado en la información suministrada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors; no se documenta ninguna cuantización oficial |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la ficha no declara licencia; debe consultarse la del modelo base) |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,5 GB |
| Libreria | PEFT 0.19.1 |
| Fecha de creacion / actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA: un conjunto de matrices de bajo rango que se inyectan en determinadas capas del modelo base `naver-clova-ix/donut-base` y que, junto con él, permiten reproducir el ajuste realizado. No se especifica sobre qué módulos se aplicó el adaptador, ni el rango, ni el alpha, ni la tasa de aprendizaje, ni el número de pasos. Tampoco se indica si el adaptador se entrenó solo sobre el decoder, solo sobre el encoder visual o sobre ambos.

Del modelo base se conoce, por su naturaleza Donut, que combina un encoder de visión tipo Swin Transformer con un decoder de lenguaje autorregresivo de estilo BART, y que se entrena de extremo a extremo para mapear imagen de documento a secuencia de texto estructurado (por ejemplo, JSON). Es un enfoque OCR-free: no hay un módulo de reconocimiento óptico de caracteres separado. Sin embargo, la información proporcionada no incluye ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. La etiqueta `arxiv:1910.09700` que aparece en el repositorio corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono citado en la plantilla de model card, no a un paper del modelo.

## Capacidades

- Comprensión de documentos a partir de imagen: al heredar la arquitectura Donut, el sistema puede mapear una imagen de documento a una secuencia de texto estructurado sin OCR externo.
- Extracción de campos con salida estructurada: generación de JSON u otro formato serializado a partir de la imagen de un formulario, factura o extracto.
- Procesamiento de documentos escaneados y fotografías: la entrada es la imagen, por lo que no depende de que exista una capa de texto.
- Ajuste específico de dominio: al ser un adaptador LoRA, su función prevista es especializar el modelo base en un dominio concreto (presumiblemente bancario, a juzgar por el nombre), sin reentrenar todos los pesos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; la ficha no declara idiomas.
- Modo «thinking», visión general fuera de documentos, audio: no disponible.

## Casos de uso

- Extracción de datos de extractos bancarios: el modelo recibe la imagen del extracto y devuelve un JSON con fecha, concepto, importe y saldo. Es el escenario que sugiere el nombre del repositorio, aunque no está confirmado por el autor.
- Digitalización de cheques y justificantes: lectura de campos manuscritos o impresos (número de cuenta, importe, firmante) directamente desde la imagen, útil en procesos de compensación bancaria.
- Automatización de cuentas anuales y balances: conversión de tablas financieras escaneadas en estructuras de datos consumibles por un ERP o un sistema de consolidación.
- Onboarding de clientes (KYC): extracción de los campos de un DNI, nómina o certificado de titularidad a partir de una fotografía tomada con el móvil, reduciendo la intervención manual.
- Procesamiento masivo de archivos históricos: digitalización de fondos documentales escaneados donde el OCR clásico falla por calidad de imagen, sellos o tipografías antiguas.
- Integración en un pipeline RAG documental: uso del modelo como extractor previo que convierte documentos en texto estructurado antes de indexarlos en una base vectorial.
- Clasificación y enrutado de correspondencia: identificación del tipo de documento recibido (factura, contrato, recibo) a partir de su imagen para dirigirlo al flujo de trabajo correspondiente.
- Preprocesado para auditoría: generación automática de borradores de extracción que un humano revisa, con el objetivo de reducir el tiempo de revisión manual.

En todos los casos hay que tener en cuenta que se trata de un adaptador: para desplegarlo es necesario cargar el modelo base Donut y aplicar los pesos LoRA, o bien fusionarlos previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación cumplimentada, no hay tabla de métricas (F1 de extracción de campos, precisión por campo, CER/WER) y el repositorio no reporta ningún conjunto de validación.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio ocupa 0,5 GB, un tamaño inusualmente grande para un adaptador LoRA puro, lo que sugiere que puede contener artefactos adicionales o pesos fusionados. No se especifica su contenido exacto.
- VRAM para inferencia completa: depende del modelo base. Al tratarse de un modelo del orden de cientos de millones de parámetros (ver la model card de `naver-clova-ix/donut-base` para el dato exacto), la inferencia cabe holgadamente en GPU de consumo como una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090, e incluso en CPU con latencias mayores. No hay cifras oficiales en la información proporcionada.
- GPUs de centro de datos (A100, H100): sobredimensionadas para este tamaño, salvo que se desplieguen muchas réplicas o se procesen lotes grandes de imágenes.
- Opciones de despliegue: al ser un adaptador PEFT, la ruta natural es `transformers` + `peft` para cargar base y adaptador. La conversión a GGUF para `llama.cpp` u `Ollama` no está documentada y requeriría fusionar primero el adaptador con el modelo base. La compatibilidad con `vLLM` o `TGI` para arquitecturas encoder-decoder multimodales como Donut no está indicada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aashishkumar-tech/donut-bank-model` | Adaptador LoRA sobre Donut | No disponible (adaptador) | No disponible | No disponible | HuggingFace, 0 descargas |
| `naver-clova-ix/donut-base` | Modelo base OCR-free documento→texto | No disponible en la información suministrada | No disponible | No disponible en la información suministrada | HuggingFace |
| LayoutLMv3 | Multimodal texto+layout, requiere OCR previo | No disponible | No disponible | No disponible | HuggingFace |
| Pix2Struct | Vision-language para capturas y documentos | No disponible | No disponible | No disponible | HuggingFace |
| TrOCR | OCR transformer encoder-decoder | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos verificados de parámetros, contexto o licencia de las alternativas en la información consultada; deben comprobarse en sus respectivas model cards antes de tomar una decisión. La búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo, solo páginas del servicio Speedtest by Ookla.

## Limitaciones y advertencias

- Model card vacía: todos los campos relevantes (uso previsto, datos de entrenamiento, evaluación, sesgos) están sin cumplimentar, por lo que no hay garantías documentadas sobre el comportamiento del modelo.
- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial. Además, el adaptador hereda las condiciones del modelo base, que deben verificarse por separado.
- Riesgo de alucinación: los modelos encoder-decoder de documento→texto pueden generar campos plausibles que no aparecen en la imagen, especialmente en documentos degradados o con tablas complejas. Cualquier uso bancario o financiero exige validación humana o comprobaciones cruzadas.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible evaluar sesgos por idioma, tipografía, país emisor o tipo de documento.
- Idiomas no declarados: se desconoce si el ajuste se hizo sobre documentos en español, inglés u otros idiomas, lo que limita su uso directo en producción sin validación previa.
- Trazabilidad nula: 0 descargas y 0 «likes», sin paper, sin repositorio de código ni autor identificable más allá del nombre de usuario. No hay historial que permita confiar en la reproducibilidad del ajuste.
- Ambigüedad del artefacto: 0,5 GB es un tamaño elevado para un adaptador LoRA puro; conviene inspeccionar el contenido del repositorio antes de integrarlo.
- Fechas incoherentes: el repositorio figura como creado el 19 de septiembre de 2026, fecha posterior a la actual; puede tratarse de un error de metadatos.
- Sin cifras de rendimiento: no hay métricas publicadas, por lo que no es posible comparar su calidad con alternativas antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aashishkumar-tech/donut-bank-model
- Modelo base: https://huggingface.co/naver-clova-ix/donut-base
- Librería PEFT: https://huggingface.co/docs/peft
- Paper de Donut (OCR-free Document Understanding Transformer), referencia habitual del modelo base: https://arxiv.org/abs/2201.02630
- Paper citado en la etiqueta `arxiv:1910.09700` (estimación de emisiones, no relacionado con el modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact
- Búsqueda web asociada: sin resultados relevantes; únicamente páginas de Speedtest by Ookla (https://www.speedtest.net/) ajenas al modelo.
