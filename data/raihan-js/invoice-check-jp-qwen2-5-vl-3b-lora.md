# raihan-js/invoice-check-jp-qwen2.5-vl-3b-lora

## Resumen

invoice-check-jp-qwen2.5-vl-3b-lora es un adaptador LoRA desarrollado por el usuario raihan-js sobre el modelo vision-lenguaje Qwen/Qwen2.5-VL-3B-Instruct. Se trata de un adaptador QLoRA con rango 16 y 29,9 millones de parametros entrenables, aplicado unicamente sobre la torre de lenguaje del modelo base, que permanece a su vez congelado en su parte vision. Su unica funcion es extraer a JSON los campos de facturas cualificadas japonesas (適格請求書) a partir de la imagen del documento.

El adaptador se entreno con QLoRA sobre 3.000 facturas sinteticas con seis disposiciones distintas y esta disenado para operar dentro de una capa de verificacion externa publicada en el repositorio de GitHub del autor, nunca de forma autonoma. La model card reporta un 83,0 % de coincidencia exacta de factura completa en el conjunto de prueba (600 facturas, emisores no vistos) y un 51,5 % en un hold-out de 200 facturas con disposiciones no vistas.

Su relevancia es acotada pero concreta: demuestra que un VLM de 3.000 millones de parametros mas un adaptador de apenas 30 millones puede cubrir una tarea documental de nicho muy especifica cuando se combina con reglas de validacion deterministas. La licencia Qwen Research restringe el uso a investigacion no comercial y no existe evidencia publicada sobre facturas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (modelo base Qwen2.5-VL-3B-Instruct) con adaptador LoRA aplicado solo a la torre de lenguaje; el detalle interno del modelo base no se especifica en la informacion proporcionada |
| Parametros totales | ~3.000 millones en el modelo base (derivado del nombre del modelo base); el adaptador anade 29,9 millones de parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El entrenamiento uso QLoRA; el ejemplo de uso carga el modelo base en bfloat16. El adaptador se distribuye en safetensors |
| Idiomas soportados | Japones (ja) |
| Licencia | qwen-research (Qwen Research License Agreement); la model card indica uso solo para investigacion no comercial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria peft) |

Otros datos de interes: rango LoRA r=16, 29,9 M de parametros entrenables, tamano del repositorio 0,1 GB, dataset de entrenamiento raihan-js/invoice-check-jp, decodificacion greedy y presupuesto de imagen de 256x28x28 a 1.003.520 pixeles en el preprocesado.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-VL-3B-Instruct, un transformer multimodal que procesa imagenes y texto. Sobre el se aplica un adaptador LoRA de rango 16 que modifica exclusivamente la torre de lenguaje: no se entrena ninguna capa del codificador visual. Esto explica el reducido numero de parametros entrenables (29,9 millones) y el tamano del repositorio (0,1 GB). El detalle completo de la arquitectura del modelo base no se recoge en la informacion proporcionada.

El entrenamiento se realizo con QLoRA sobre 3.000 facturas sinteticas que cubren seis disposiciones distintas (emisores ficticios). No hay informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF, DPO u otras tecnicas de alineacion; el autor solo documenta el uso de decodificacion greedy y la version 2 del prompt, disponible en src/invoicecheck/vlm.py del repositorio de codigo. La innovacion del proyecto no esta en la arquitectura sino en el diseno del sistema: el adaptador se combina con una capa de verificacion por reglas que filtra las extracciones antes de su uso.

## Capacidades

- Extraccion de campos de facturas cualificadas japonesas (適格請求書) a partir de una imagen, con salida en JSON.
- Comprension de documentos con componente visual: OCR y comprension de maquetacion en un unico paso, sin pipeline OCR separado.
- Procesamiento de multiples disposiciones de factura, con buen rendimiento documentado en disposiciones horizontales.
- Operacion en japones exclusivamente; no hay soporte documentado de otros idiomas.
- Se integra con una capa de verificacion externa que decide la auto-aprobacion de facturas limpias.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking ni capacidades de audio.

## Casos de uso

- Prueba de concepto de digitalizacion de cuentas por pagar en Japon: el adaptador convierte la imagen de una factura cualificada en JSON, que despues se valida con la capa de reglas del repositorio antes de volcarse al sistema contable. Es adecuado porque el coste computacional (modelo de 3B) es bajo para el volumen tipico de una funcion de facturacion.
- Pre-etiquetado y anotacion asistida de facturas: el modelo genera una primera extraccion que un revisor humano corrige, reduciendo el esfuerzo de anotacion en la construccion de datasets de document AI en japones.
- Investigacion academica en document understanding: permite estudiar el rendimiento de tecnicas QLoRA sobre VLMs pequenos en tareas de extraccion estructurada, con la licencia de investigacion como marco adecuado.
- Evaluacion comparativa de VLMs de 3B: sirve como referencia reproducible de que exactitud se alcanza con 29,9 millones de parametros entrenables frente a alternativas de mayor tamano.
- Validacion de arquitecturas de auto-aprobacion: segun la model card, con la regla de verificacion completa el 86,8 % de las facturas limpias del conjunto de prueba se auto-aprueban y ninguna de las 461 aprobadas presento un error detectable por las comprobaciones.
- Base para un fine-tuning posterior con datos propietarios: el adaptador puede reentrenarse o combinarse con nuevos adaptadores LoRA para adaptar la extraccion a formatos de factura de una organizacion concreta, siempre que se respete la licencia no comercial.
- Banco de pruebas de robustez frente a maquetacion: sus resultados dispares entre disposiciones horizontales y verticales permiten medir el impacto de la rotacion y el texto lateral en un VLM pequeno.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la model card, obtenidos exclusivamente sobre facturas sinteticas. La metrica es la coincidencia exacta de la factura completa (todos los campos correctos).

| Conjunto | Facturas | Condicion | Coincidencia exacta [IC 95 %] |
|---|---|---|---|
| test | 600 | emisores no vistos | 83,0 % [80,0; 85,8] |
| hold-out | 200 | disposiciones no vistas | 51,5 % [44,5; 58,5] |

Desglose por disposicion (conjunto de prueba):

| Disposicion | Coincidencia exacta |
|---|---|
| Horizontal | 97,3 % |
| Vertical (縦書き) | 40,0 % |
| Vertical completa no vista | 4 % |

Resultado de la capa de verificacion sobre el conjunto de prueba: el 86,8 % de las facturas limpias se auto-aprueban y 0 de las 461 facturas aprobadas contenian un campo incorrecto detectable por las reglas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark general en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB; el coste real de inferencia lo determina el modelo base Qwen2.5-VL-3B-Instruct.
- VRAM estimada para el modelo base: del orden de 6-7 GB en bfloat16 (pesos) mas la memoria del codificador visual, las activaciones y la cache KV, que no se documenta. En cuantizacion de 4 bits la huella de pesos se reduce aproximadamente a 2-3 GB. Estas cifras son estimaciones orientativas, no publicadas por el autor.
- Cabe en GPU de consumo: si, con el modelo base en bfloat16 en tarjetas de 12-16 GB (por ejemplo RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y con margen mas amplio en 24 GB. En cuantizacion de 4 bits es viable en tarjetas de 8 GB, aunque no esta documentado por el autor.
- GPU de centro de datos: A100, H100 o L40S son sobredimensionadas para un modelo de 3B; su uso solo se justifica por agregacion de muchas peticiones concurrentes.
- Opciones de despliegue documentadas: transformers mas peft, cargando el modelo base con `Qwen2_5_VLForConditionalGeneration` y el adaptador con `PeftModel.from_pretrained`. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama con este adaptador.
- Latencia y throughput: no disponibles. La model card solo indica que se emplea decodificacion greedy.

Ejemplo de carga documentado por el autor:

```python
import torch
from peft import PeftModel
from transformers import AutoProcessor, Qwen2_5_VLForConditionalGeneration

base = "Qwen/Qwen2.5-VL-3B-Instruct"
proc = AutoProcessor.from_pretrained(base, min_pixels=256 * 28 * 28, max_pixels=1003520)
model = PeftModel.from_pretrained(
    Qwen2_5_VLForConditionalGeneration.from_pretrained(base, torch_dtype=torch.bfloat16, device_map="cuda"),
    "raihan-js/invoice-check-jp-qwen2.5-vl-3b-lora"
)
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en extraccion de facturas japonesas |
|---|---|---|---|---|
| invoice-check-jp-qwen2.5-vl-3b-lora | ~3.000 M (base) + 29,9 M entrenables | No disponible | qwen-research (solo investigacion no comercial) | 83,0 % exact match en test; 51,5 % en hold-out (datos sinteticos) |
| Qwen2.5-VL-3B-Instruct (base, sin adaptador) | ~3.000 M | No disponible | qwen-research | No disponible; no se ha publicado una evaluacion equivalente sin el adaptador |
| Qwen2.5-VL-7B-Instruct | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible |

La busqueda web realizada no aporto informacion sobre modelos comparables de extraccion de facturas japonesas ni resultados de benchmarks de terceros para este adaptador. Alternativas habituales en document AI (Donut, LayoutLMv3, pipelines OCR propietarios) no aparecen en la informacion proporcionada, por lo que no se incluyen cifras comparativas. Cualquier comparacion de rendimiento exigiria evaluar todos los modelos sobre el mismo conjunto, y en este caso el unico conjunto disponible es sintetico.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con facturas sinteticas (emisores ficticios, 6 disposiciones). No hay ninguna evidencia de su comportamiento sobre facturas reales.
- Disenado para usarse junto a la capa de verificacion del repositorio del autor; la propia model card indica que no debe usarse de forma autonoma.
- Rendimiento muy debil en disposiciones verticales (40,0 % de coincidencia exacta) y practicamente nulo en una disposicion totalmente vertical no vista (4 %), con problemas en texto latino girado y tablas rotadas.
- Caida acusada al cambiar de maquetacion: del 83,0 % en emisores no vistos al 51,5 % en disposiciones no vistas. Riesgo alto de degradacion en produccion con formatos nuevos.
- Riesgo de alucinacion inherente a la extraccion generativa de campos: un campo puede generarse con un valor plausible pero incorrecto, por lo que la verificacion posterior es imprescindible.
- Solo cubre facturas de corporaciones; no se documenta soporte para otros tipos de emisor.
- Solo japones. No hay soporte multilingue documentado.
- Licencia qwen-research: uso permitido unicamente para investigacion no comercial segun la model card. No apto para explotacion comercial sin una licencia adicional del titular de Qwen.
- Sin pipeline, sin descargas y sin likes en el momento de la consulta; es un artefacto de investigacion reciente y sin validacion independiente.
- No hay informacion sobre sesgos, comportamiento en dominios fuera de facturacion, latencia, throughput ni estabilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raihan-js/invoice-check-jp-qwen2.5-vl-3b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base (Qwen Research License): https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/raihan-js/invoice-check-jp
- Repositorio de codigo y capa de verificacion: https://github.com/raihan-js/invoice-check-jp
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre este modelo. Los unicos resultados devueltos fueron un listado generico de novedades de arXiv en cs.CL (https://arxiv.org/list/cs.CL/new) y un repositorio institucional sin relacion (https://repository.ub.ac.id/view/year/2026.default.html); ninguno de los dos aporta informacion util sobre el modelo.
