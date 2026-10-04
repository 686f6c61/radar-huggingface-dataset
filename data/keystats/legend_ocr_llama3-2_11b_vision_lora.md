# keystats/Legend_ocr_llama3.2_11b_vision_lora

## Resumen

Legend_ocr_llama3.2_11b_vision_lora es un adaptador LoRA publicado por el usuario keystats sobre el modelo multimodal meta-llama/Llama-3.2-11B-Vision-Instruct. Se distribuye a través de HuggingFace con la librería PEFT, en formato safetensors y con un tamano de repositorio de aproximadamente 0,5 GB, lo que corresponde únicamente a los pesos del adaptador y no al modelo base completo. El pipeline declarado es text-generation y la etiqueta principal es lora.

El nombre del repositorio sugiere un ajuste fino orientado a OCR (reconocimiento óptico de caracteres) sobre un modelo visión-lenguaje, pero la model card publicada es una plantilla sin cumplimentar: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros y evaluación) figuran como "More Information Needed". No hay ninguna descripción funcional del adaptador ni ejemplos de uso.

El interés de esta ficha es, por tanto, limitado y fundamentalmente exploratorio: se trata de un artefacto sin documentación, con 0 descargas y 0 likes en el momento de la consulta, y cuya evaluación real depende enteramente de las capacidades heredadas del modelo base Llama 3.2-11B-Vision-Instruct. Cualquier uso en producción exigiría validación propia previa, dado que no existe evidencia publicada de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso multimodal; modelo base: meta-llama/Llama-3.2-11B-Vision-Instruct. La model card no detalla la configuración del adaptador (rango, alpha, módulos objetivo) |
| Parametros totales | Adaptador: no disponible (pesos de ~0,5 GB en safetensors). Modelo base: ~11 000 millones de parámetros según Meta |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card del adaptador. El modelo base declara 128 000 tokens |
| Tipos de cuantizacion | No disponible en el repositorio. El adaptador se distribuye en safetensors; el modelo base admite bf16/fp16 y existen cuantizaciones de terceros (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible en la model card. El modelo base declara 8 idiomas oficiales: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible en el repositorio. El modelo base se distribuye bajo la Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La información disponible no permite describir el procedimiento de entrenamiento: la model card no indica dataset, número de tokens, régimen de precisión, hiperparámetros de LoRA ni si hubo etapas de RLHF o DPO. Tampoco se especifica si el ajuste se aplicó únicamente a las capas de lenguaje, al proyector de visión o a ambos. El único dato técnico verificable es que se trata de un adaptador PEFT generado con PEFT 0.21.2 y que el modelo base declarado es Llama-3.2-11B-Vision-Instruct.

Respecto al modelo base, Meta describe una familia multimodal con un codificador de visión acoplado mediante capas de atención cruzada a un decoder de lenguaje de tipo transformer, con ventana de contexto de 128 000 tokens y entrenamiento sobre del orden de 9 billones de tokens de texto, con etapas de ajuste supervisado y optimización por preferencias. Estas cifras corresponden a la documentación pública de Meta y no están confirmadas en el repositorio del adaptador.

## Capacidades

- No hay ninguna capacidad documentada específicamente para este adaptador. La model card no incluye sección de uso directo, ejemplos ni limitaciones.
- Por herencia del modelo base Llama-3.2-11B-Vision-Instruct, cabría esperar comprensión de imágenes (documentos escaneados, diagramas, gráficos), generación de texto e instrucciones multimodales, pero no hay evidencia publicada de que el LoRA preserve, mejore o degrade estas capacidades.
- El nombre del repositorio ("Legend_ocr") apunta a una especialización en extracción de texto desde imágenes, sin que exista documentación que lo confirme.
- Soporte de tool calling, function calling y flujos de agente: no disponible para el adaptador; el modelo base lo declara.
- Capacidades multilingües: no disponible para el adaptador; el modelo base declara 8 idiomas.
- Modo de razonamiento explícito (thinking mode), audio o vídeo: no disponible.

## Casos de uso

Los siguientes escenarios son hipotéticos y asumen que el adaptador cumple la función que sugiere su nombre. En todos los casos sería obligatorio validar el comportamiento con datos propios antes de cualquier despliegue.

- Digitalización de facturas y albaranes: extracción de campos estructurados (CIF, base imponible, líneas de detalle) a partir de imágenes, con la ventana de 128 000 tokens del modelo base como margen para procesar documentos largos o lotes.
- Procesamiento de documentación administrativa: lectura de formularios, certificados y expedientes escaneados en español, con salida en JSON para integrarla en un gestor documental.
- Archivo y búsqueda semántica: conversión de PDF escaneados y microfilm a texto plano indexable, aprovechando el contexto largo para mantener coherencia entre páginas de un mismo expediente.
- Automatización de procesos de back office: pipelines por lotes que transforman imágenes en registros tabulares, con revisión humana únicamente de los casos de baja confianza.
- Accesibilidad: transcripción de material impreso (libros, folletos, carteles) a texto y formatos compatibles con lectores de pantalla.
- Extracción de información de diagramas técnicos: lectura de planos, esquemas y tablas de especificaciones para alimentar bases de conocimiento interno.
- Preprocesado para RAG: OCR de corpus escaneados como paso previo a la indexación vectorial y a la generación aumentada por recuperación.
- Moderación y cumplimiento: detección de texto relevante en capturas de pantalla o documentos fotografiados dentro de flujos de revisión interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye sección de evaluación cumplimentada y no existe ningún dato de MMLU, HumanEval, GSM8K ni de métricas específicas de OCR (CER, WER, precisión por campo) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia del adaptador: ~0,5 GB adicionales sobre el modelo base. Los pesos del base en bf16 ocupan en torno a 22-24 GB, por lo que la inferencia completa requiere del orden de 24 GB o más de memoria.
- GPU recomendadas para el base en bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB, A6000 48 GB. En RTX 4090 (24 GB) el encaje es ajustado y depende de la resolución de imagen y de la longitud de secuencia.
- Cuantización a 8 bits: aproximadamente 12-14 GB de VRAM, viable en RTX 4090, RTX 3090 o L4.
- Cuantización a 4 bits: aproximadamente 7-9 GB de VRAM, viable en RTX 4070 Ti, RTX 3080 o GPUs de 12 GB en adelante.
- Consumer GPU: sí, con cuantización de 4 u 8 bits; en bf16 completo solo en modelos de 24 GB o superiores y con margen escaso.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador, vLLM y TGI para servir el modelo base, llama.cpp con adaptadores LoRA y el proyector de visión (mmproj) para entornos con CPU o GPU limitada. El soporte de LoRA combinado con entrada de visión es limitado en algunos servidores de inferencia y requiere verificación previa.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Legend_ocr_llama3.2_11b_vision_lora (este modelo) | Adaptador LoRA sobre ~11 000 M | No disponible (base: 128 000 tokens) | Adaptador PEFT sobre VLM denso | No disponible | HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-11B-Vision-Instruct | ~11 000 M | 128 000 tokens | VLM denso con atención cruzada | Llama 3.2 Community License | HuggingFace, ampliamente desplegado |
| keystats/Legend_ocr | No disponible (base Qwen2.5-VL) | No disponible | Modelo imagen-texto-a-texto (transformers, safetensors) | No disponible | HuggingFace, 0 likes |
| keystats/Legend_ocr_v3 | ~8 000 M según Featherless | No disponible | Modelo imagen-texto-a-texto (qwen3_vl) | No disponible | HuggingFace, 0 likes |

No se dispone de datos de rendimiento de ninguno de los modelos de la familia Legend_ocr, por lo que la comparativa se limita a parámetros, contexto, tipo y disponibilidad. El adaptador no aporta cifras propias de licencia, idiomas ni evaluación.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto. Cualquier afirmación sobre su comportamiento es una inferencia, no un dato verificado.
- Riesgo de alucinación: no evaluado. En tareas de OCR, el riesgo típico es la generación de texto plausible pero ausente en la imagen, especialmente con documentos degradados o de baja resolución.
- Licencia: el repositorio no declara licencia. El uso comercial queda sujeto a los términos de la Llama 3.2 Community License del modelo base, incluidos los requisitos de atribución y las restricciones de uso aceptable. Conviene confirmar con el autor antes de cualquier despliegue comercial.
- Idiomas: no documentados para el adaptador. El rendimiento en español es una incógnita, aunque el modelo base lo incluye entre sus idiomas oficiales.
- Contexto: no confirmado para el adaptador. Los adaptadores LoRA pueden alterar el comportamiento en ventanas largas aunque no modifiquen la arquitectura.
- Sin adopción: 0 descargas y 0 likes en el momento de la consulta, y ausencia de issues o discusiones. No existe comunidad que haya validado el artefacto.
- Metadatos inconsistentes: la fecha de creación registrada (2026-10-04) es posterior a la de consulta, lo que sugiere un error de marcado de tiempo o de gestión del repositorio. Conviene tratarlo como indicio de escaso mantenimiento.
- Producción: no recomendado sin una evaluación interna previa sobre datos representativos del dominio objetivo, con métricas de CER/WER y precisión por campo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keystats/Legend_ocr_llama3.2_11b_vision_lora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct
- Otros repositorios del mismo autor: https://huggingface.co/keystats/Legend_ocr y https://huggingface.co/keystats/Legend_ocr_v3
- Ficha de Legend_ocr_v3 en Featherless: https://featherless.ai/models/keystats/Legend_ocr_v3
- Cuaderno de inferencia para Llama-3.2-11B-Vision: https://github.com/ikuldeep1/Llama-3.2-11B-Vision-Colab
- Repositorio de inferencia de Meta para Llama: https://github.com/meta-llama/llama
- Calculadora de impacto de carbono (referencia citada en las etiquetas del repositorio): https://mlco2.github.io/impact y https://arxiv.org/abs/1910.09700
