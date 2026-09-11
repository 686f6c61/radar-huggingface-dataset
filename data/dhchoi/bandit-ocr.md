# dhchoi/bandit-ocr

## Resumen

Bandit OCR es un ajuste fino mediante LoRA del modelo de vision-lenguaje documental dots.mocr (dots-studio/dots.mocr), especializado en la lectura de documentos historicos coreanos. Lo desarrolla Donghyeok Choi, del Departamento de Historia de la Hong Kong Baptist University, y su tarea es concreta: dada la imagen de una pagina de un documento historico coreano, devolver un array JSON con una region por columna impresa, en orden de lectura, junto con el texto de esa columna. El modelo esta pensado para impresos xilograficos y manuscritos de la dinastia Joseon, incluyendo texto vertical, hanja y chino clasico.

El entrenamiento se realizo sobre 229.356 paginas anotadas, con un adaptador LoRA de rango 64 y alpha 128 (dropout 0.05) aplicado sobre las proyecciones del decodificador de lenguaje y sobre la torre de vision. El repositorio publica dos formas del mismo ajuste: en la raiz, los pesos fusionados con el adaptador ya integrado a escala 0.75 en bfloat16 (sin necesidad de PEFT); en `lora/`, el adaptador sin fusionar de 580 MB. En el conjunto de test reservado alcanza un character error rate (CER) de 0.0195 y un F1 de columna de 0.9856.

La relevancia es clara para el ambito de humanidades digitales y OCR historico: los pipelines clasicos comparados en la propia model card quedan muy por detras (0.1436 de CER para el pipeline ResNet de AI Hub y 0.2398 para NDLkotenOCR en las mismas paginas). El modelo se distribuye bajo licencia MIT, con soporte para coreano y chino, y se apoya en el codigo remoto del modelo base, por lo que requiere `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en dots.mocr (torre de vision + decodificador de lenguaje, con procesador personalizado `DotsVLProcessor` derivado de Qwen2.5-VL); adaptacion LoRA sobre el modelo base |
| Parametros totales | 3.039.179.264 segun los safetensors del repositorio; la model card indica 1.7B (1.2B decodificador de lenguaje + 0.4B torre de vision). Dato discrepante, no disponible una explicacion oficial |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16; el repositorio no publica variantes cuantizadas) |
| Idiomas soportados | coreano (ko) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (2 shards en la raiz, ~6.1 GB, con el LoRA fusionado a escala 0.75) y adaptador LoRA sin fusionar en `lora/` (580 MB) |

## Arquitectura y entrenamiento

El modelo parte de dots.mocr, un modelo de vision-lenguaje documental de 1.7B parametros segun su model card (1.2B de decodificador de lenguaje y 0.4B de torre de vision), y se ajusta mediante LoRA de rango 64, alpha 128 y dropout 0.05 aplicado sobre las proyecciones del lenguaje y sobre la torre de vision. El checkpoint publicado corresponde al paso 56000 (t3_full) del entrenamiento completo. La adaptacion es un finetune sobre revision fija del base: `e539fbb52280393adc081b289ec597430a0f9031`. En la raiz del repositorio los pesos estan fusionados a escala 0.75, de modo que se cargan y sirven igual que el base sin necesidad de PEFT; en `lora/` se ofrece el adaptador sin fusionar para quien quiera aplicarlo a otra escala o continuar el entrenamiento.

Los datos de entrenamiento son 229.356 paginas anotadas de documentos historicos coreanos, fundamentalmente impresos xilograficos y manuscritos de la dinastia Joseon, con anotacion a nivel de columna (bounding box, categoria y texto). La entrada es una unica imagen de pagina, redimensionada con `smart_resize` a un rango de 3.136 a 11.289.600 pixeles; la salida es un array JSON de regiones de columna en orden de lectura. La convencion de orden es la de la pagina impresa: columnas de derecha a izquierda, cada columna de arriba abajo, y las dos subcolumnas de una nota interlineal (세주) tambien de derecha a izquierda. No se documentan en la informacion disponible fases de RLHF o DPO, ni el numero total de tokens de entrenamiento.

## Capacidades

- Extraccion de texto OCR sobre imagenes de pagina de documentos historicos coreanos, con salida estructurada en JSON.
- Deteccion y delimitacion de regiones de layout: devuelve `bbox` en formato `[x1, y1, x2, y2]` sobre la rejilla de entrada redimensionada.
- Ordenacion en orden de lectura humano, incluyendo columnas verticales y notas interlineales a media anchura.
- Clasificacion de categoria de layout, con el conjunto de etiquetas declarado en el prompt: `Caption`, `Footnote`, `Formula`, `List-item`, `Page-footer`, `Page-header`, `Picture`, `Section-header`, `Table`, `Text`, `Title`.
- Manejo de texto historico en hanja y chino clasico, ademas de coreano.
- Procesamiento de imagenes de alta resolucion (hasta 11.289.600 pixeles tras `smart_resize`).
- Modo conversacional: el pipeline declarado es `image-text-to-text`, con plantilla de chat aplicada mediante `apply_chat_template`.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible; el modelo esta orientado a una tarea de extraccion en un unico paso.
- Capacidades de audio o video: no disponibles (el procesador base contempla `videos`, pero no se documenta su uso en este finetune).

## Casos de uso

- Digitalizacion de archivos historicos coreanos: el modelo convierte una imagen de pagina de un impreso xilografico o manuscrito de la dinastia Joseon en texto estructurado por columnas, con bounding boxes, lo que permite generar corpus consultables y alineados con la imagen original.
- Creacion de ediciones criticas y transcripciones academicas: gracias a su CER de 0.0195 en el conjunto de test, la transcripcion resultante sirve como base para revision filologica con un coste de correccion manual muy inferior al de un pipeline OCR generico.
- Busqueda full-text sobre fondos documentales: al exportar el JSON de columnas a texto plano con metadatos de posicion, se pueden construir indices de busqueda sobre colecciones historicas completas sin reetiquetar manualmente cada pagina.
- Segmentacion de layout para pipelines de publicacion: los `bbox` y las categorias permiten separar cuerpo de texto, titulos, encabezados y pies de pagina, y reconstruir la maqueta de la pagina para su reproduccion digital.
- Analisis cuantitativo de corpus historicos: la estructura por columnas y el orden de lectura fiable facilitan tareas posteriores de conteo de caracteres, extraccion de nombres propios o analisis de formulas de tratamiento en grandes volumenes de documentos.
- Integracion en aplicaciones de escritorio y herramientas de investigacion: el autor publica una aplicacion de escritorio y un sitio de proyecto, de modo que el modelo puede servir de motor OCR dentro de un flujo de trabajo local para historiadores que no trabajan con infraestructura de servidor.
- Procesamiento de documentos con notas interlineales (세주): el modelo trata cada nota interlineal como una region de columna independiente a media anchura, lo que evita la mezcla de texto principal y anotacion que suele producirse en OCR de documentos con comentario intercalado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test reservado, comparados con dos alternativas de OCR sobre las mismas paginas:

| Modelo / pipeline | Character error rate (CER) | F1 de columna |
|---|---|---|
| Bandit OCR (dhchoi/bandit-ocr) | 0.0195 | 0.9856 |
| AI Hub ResNet pipeline | 0.1436 | no disponible |
| NDLkotenOCR | 0.2398 | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. No se aportan datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. A partir del tamano del checkpoint (2 shards safetensors, ~6.1 GB en bfloat16) puede estimarse un minimo en torno a 7-8 GB solo para los pesos, a lo que hay que sumar la memoria de activaciones de la torre de vision cuando se procesan imagenes de hasta 11.289.600 pixeles. Se trata de una estimacion, no de un dato publicado.
- GPU recomendadas: no especificadas por el autor. Por tamano de checkpoint, una GPU de 24 GB (RTX 4090, L4, A10G) o superior (A100 40/80 GB, H100) es un punto de partida razonable; la resolucion de entrada alta es el factor que mas puede elevar el consumo de memoria.
- Cabe en GPU de consumo: probablemente si en tarjetas de 24 GB con bfloat16, si la memoria de activaciones del procesamiento de imagen a alta resolucion lo permite; no confirmado por el autor.
- Opciones de despliegue: `transformers==4.51.3` con `trust_remote_code=True` es el entorno validado. El autor advierte que la version 4.52 y posteriores cambian el contrato del procesador Qwen2.5-VL para el que se escribio el `DotsVLProcessor` personalizado, por lo que no son compatibles sin ajustes. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (CER en el test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bandit OCR | 1.7B declarados / 3.04B en safetensors | no disponible | 0.0195 (F1 de columna 0.9856) | MIT | HuggingFace, pesos fusionados y adaptador LoRA |
| dots.mocr (modelo base) | 1.7B | no disponible | no disponible | no disponible en la informacion facilitada | HuggingFace |
| AI Hub ResNet pipeline | no disponible | no aplica | 0.1436 | no disponible | no disponible |
| NDLkotenOCR | no disponible | no disponible | 0.2398 | no disponible | no disponible |

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: los safetensors del repositorio suman 3.039.179.264 parametros, mientras que la model card declara 1.7B (1.2B de lenguaje + 0.4B de vision). Conviene verificar cual corresponde al checkpoint efectivo antes de dimensionar infraestructura.
- Dependencia estricta de version: entrenado y evaluado con `transformers==4.51.3`. Las versiones 4.52 y posteriores rompen el contrato del procesador Qwen2.5-VL sobre el que se escribio el `DotsVLProcessor`. Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio.
- Ambito limitado a dos idiomas (coreano y chino) y a un dominio muy concreto: documentos historicos coreanos de la dinastia Joseon. No hay evidencia de rendimiento en documentos modernos, otras escrituras o idiomas distintos.
- Los `bbox` de salida estan expresados en la rejilla de entrada redimensionada, no en pixeles originales; es obligatorio revertirlos con el mismo `smart_resize` para utilizarlos sobre la imagen fuente. Un uso incorrecto produce desalineacion sistematica.
- La salida sigue una convencion de orden de lectura especifica (columnas de derecha a izquierda, subcolumnas de notas interlineales de derecha a izquierda) que no coincide con las convenciones occidentales; los consumidores deben asumirla explicitamente.
- Riesgo de alucinacion en caracteres hanja poco frecuentes o degradados: no se aportan metricas especificas de robustez ante ruido, manchas, roturas o digitalizaciones de baja calidad.
- El conjunto de evaluacion es el split reservado del propio autor; no hay evaluacion independiente por terceros.
- Uso comercial: la licencia es MIT, que permite uso comercial, pero el modelo deriva de dots.mocr, cuyo modelo base esta sujeto a su propia licencia. Conviene verificar las condiciones del base antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son de septiembre de 2026; se trata de una publicacion reciente y poco contrastada por la comunidad.
- No se documentan limites de contexto, tipos de cuantizacion ni requisitos de hardware oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhchoi/bandit-ocr
- Modelo base dots.mocr: https://huggingface.co/dots-studio/dots.mocr
- Aplicacion de escritorio y sitio del proyecto: https://bandit.dhchoi.net
- Paper: JADH 2026, septiembre de 2026 (sin enlace directo en la informacion disponible)
- Utilidad de vision para el preprocesado (`smart_resize`): `qwen_vl_utils` (paquete de Python; sin URL especifica en la informacion disponible)
