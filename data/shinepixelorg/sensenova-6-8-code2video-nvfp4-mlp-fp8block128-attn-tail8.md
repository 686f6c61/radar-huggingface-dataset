# ShinePixelOrg/SenseNova-6.8-Code2Video-NVFP4-MLP-FP8Block128-Attn-Tail8

## Resumen

SenseNova-6.8-Code2Video es un modelo vision-language de aproximadamente 27.000 millones de parametros desarrollado por SenseNova (OpenSenseNova) orientado a la creacion de video mediante codigo ejecutable. El modelo recibe como entrada imagenes y texto, y genera codigo que, al ejecutarse, construye y renderiza videos cortos implementados integramente en codigo. Esta ficha describe una cuantizacion mixta publicada por ShinePixelOrg que reduce el peso del checkpoint original en BF16 de 50,96 GiB a 22,20 GiB (factor de compresion 2,295x) manteniendo el 97,48% del pass-rate de HumanEval del modelo original.

La cuantizacion combina tres niveles de precision sobre la arquitectura original: las primeras 56 capas MLP del decodificador usan NVFP4 W4A4 nativo (GPTQ, grupo de 16), las proyecciones de atencion y las ultimas ocho MLP usan FP8 W8A8 con bloques de 128x128, y las puertas de control Gated DeltaNet, el vision tower, embeddings, LM head y normas se mantienen en BF16. El resultado es un checkpoint en formato `compressed-tensors` compatible con vLLM que acelera la decodificacion secuencial 2,18x y duplica el throughput concurrente respecto al BF16.

Es relevante ahora porque demuestra que la cuantizacion mixta NVFP4/FP8 con computo nativo en FP4 sobre GPUs Blackwell permite servir un modelo multimodal de 27B con perdida de calidad muy contenida (aumento maximo de perplejidad del 3,78%) y con una mejora sustancial de velocidad, lo que abarata el despliegue en produccion de generacion de video programatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atencion completa y capas Gated DeltaNet (hibrida), vision tower y LM head; pipeline image-text-to-text |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 W4A4 (GPTQ, grupo 16) en MLP de capas 0-55; FP8 W8A8 con bloques 128x128 en atencion, Gated DeltaNet y MLP de capas 56-63; BF16 en puertas de control, vision tower, embeddings, LM head, normas y convoluciones |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato `compressed-tensors` (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido con atencion completa y capas Gated DeltaNet (atencion lineal recurrente), un vision tower para procesar imagenes y un LM head que genera codigo ejecutable. La cuantizacion aqui descrita no introduce entrenamiento ni destilacion adicional: los tensores NVFP4 de las MLP se conservan de un checkpoint GPTQ previo calibrado con 256 muestras de trayectorias de agente en dominio, con longitud maxima de secuencia de 2.048 tokens. Los pesos FP8 se convierten directamente desde los tensores BF16 originales mediante redondeo al mas cercano, restaurando las ultimas ocho MLP desde BF16 antes de la conversion FP8.

Las activaciones FP8 usan grupos dinamicos de 128 elementos; NVFP4 emplea escalas de bloque en FP8 y escalas globales en FP32. El estado recurrente de las capas Gated DeltaNet no se cuantiza a FP4 ni FP8 y sigue la precision por defecto del runtime. El tokenizer y la plantilla de chat originales en BF16 se preservan. En el runtime probado se seleccionan `FlashInferB12xNvFp4LinearKernel` para NVFP4 y `B12xFp8BlockScaledMMKernel` para FP8 con escalas de bloque, de modo que el computo FP4 es nativo en la GPU Blackwell empleada y no una mera conversion de almacenamiento.

## Capacidades

- Generacion de codigo ejecutable orientado a la creacion y renderizado de videos cortos (code-video).
- Comprension de entradas imagen-texto (pipeline image-text-to-text).
- Razonamiento multimodal: combina instrucciones textuales con imagenes de referencia para producir el codigo de la animacion.
- Generacion de codigo general: el modelo base reporta un pass-rate de HumanEval del 96,95% en BF16 y del 94,51% en esta cuantizacion.
- Conversacional multi-turno (tag `conversational`).
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad con endpoints y despliegue en vLLM.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso, audio ni modo thinking explicito.

## Casos de uso

- Generacion automatica de videos de motion design: el modelo recibe una descripcion textual (y opcionalmente una imagen de referencia) y produce codigo que, al ejecutarse, compone y anima la pieza; los resultados preliminares del proyecto muestran buena composicion visual y coreografia de movimiento.
- Creacion de videos programaticos en pipelines de marketing: integrado en un servicio vLLM, permite generar variantes de anuncios cortos a partir de plantillas y prompts, con throughput concurrente de hasta 314,59 tok/s de salida a concurrencia 8.
- Prototipado rapido de animaciones para equipos de diseno: el modelo traduce una idea en codigo reproducible y versionable, lo que facilita iterar sobre la animacion en un repositorio en lugar de en una herramienta grafica.
- Generacion de contenido educativo animado: a partir de un guion y una imagen de apoyo, el modelo escribe el codigo de una explicacion visual corta, adecuada para materiales docentes.
- Automatizacion de demos tecnicas: dado un diagrama o captura, el modelo produce el codigo de una animacion que ilustra el funcionamiento de un sistema, util para documentacion y presentaciones.
- Servicio de generacion de codigo asistida en produccion: gracias a su rendimiento en HumanEval (94,51% de pass-rate en esta cuantizacion) puede emplearse como generador de codigo en pipelines de CI/CD para tareas de scaffolding o pruebas, con la ventaja de su menor huella de VRAM (22,20 GiB de pesos).
- Despliegue en una unica GPU profesional: la compresion 2,295x permite alojar el modelo en una GPU de 96 GiB (RTX PRO 6000 Blackwell) junto con cache KV y espacio de trabajo, algo inviable con el checkpoint BF16 en el mismo presupuesto.

## Benchmarks y rendimiento

Datos medidos por el autor de la cuantizacion sobre una NVIDIA RTX PRO 6000 Blackwell Workstation Edition (97.887 MiB), comparando con el checkpoint BF16 original en el mismo runtime vLLM:

| Medida | BF16 | Esta cuantizacion | Diferencia |
|---|---:|---:|---|
| Peso de tensores | 50,956 GiB | 22,201 GiB | 2,295x mas pequeno (56,43% menos) |
| HumanEval pass-rate | 96,95% | 94,51% | -2,44 pp (retencion 97,48%) |
| Perplejidad (maximo aumento) | referencia | +3,78% | en seis comparativas cortas/largas |
| Decodificacion secuencial, 128 tokens entrada | 25,81 tok/s | 56,34 tok/s | 2,183x |
| Decodificacion secuencial, 1.024 tokens entrada | 25,56 tok/s | 55,87 tok/s | 2,186x |
| Decodificacion secuencial, 4.096 tokens entrada | 25,39 tok/s | 55,13 tok/s | 2,171x |
| TTFT, 128 tokens entrada | 73,41 ms | 113,06 ms | +54,00% |
| TTFT, 1.024 tokens entrada | 310,02 ms | 163,68 ms | 1,894x mas rapido |
| TTFT, 4.096 tokens entrada | 1.169,34 ms | 632,23 ms | 1,850x mas rapido |
| Throughput de sistema, concurrencia 4 | 87,66 tok/s | 177,17 tok/s | 2,021x |
| Throughput de sistema, concurrencia 8 | 157,49 tok/s | 314,59 tok/s | 1,997x |

No se han publicado en la informacion disponible resultados de MMLU, GSM8K ni otros benchmarks estandar del modelo base.

## Requisitos de hardware

- VRAM de pesos: 22,20 GiB para esta cuantizacion frente a 50,96 GiB en BF16; el VRAM total de servicio no se reduce en la misma proporcion (excluye cabeceras, cache KV, estado recurrente y espacios de trabajo).
- GPU recomendada: NVIDIA RTX PRO 6000 Blackwell Workstation Edition (97.887 MiB), la unica configuracion medida por el autor.
- El computo NVFP4 nativo requiere GPU Blackwell (el autor cita kernels `FlashInferB12xNvFp4LinearKernel` y `B12xFp8BlockScaledMMKernel`); en GPUs sin soporte FP4 el checkpoint puede no ofrecer la misma aceleracion.
- Cabe en GPUs consumer de gama alta con al menos 24 GB de VRAM solo si el runtime y el soporte de NVFP4/FP8 lo permiten; no hay mediciones publicadas en RTX 4090 ni en otras consumer.
- Opciones de despliegue: vLLM (runtime evaluado), transformers con `compressed-tensors`; no se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: decodificacion secuencial de 55-56 tok/s y throughput de sistema de 177-315 tok/s a concurrencia 4-8 en la GPU medida; TTFT de 113 ms a 128 tokens de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| SenseNova-6.8-Code2Video (BF16) | 27,36B | no disponible | 96,95% | Apache 2.0 | Hugging Face |
| Esta cuantizacion NVFP4/FP8 | 27,36B | no disponible | 94,51% | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables de code-video con los que establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La retencion de calidad del 97,48% se refiere especificamente al pass-rate de HumanEval; las comparativas de calidad en otras tareas se reportan por separado y no se detallan en la informacion disponible.
- El TTFT empeora un 54% con prompts cortos (128 tokens): 113,06 ms frente a 73,41 ms del BF16; la aceleracion de decodificacion no implica mejora en la latencia total de la peticion.
- El aumento maximo de perplejidad medido es del 3,78%, lo que puede traducirse en degradacion en tareas generativas no cubiertas por las pruebas.
- La aceleracion depende de kernels especificos de GPU Blackwell; en otro hardware el rendimiento puede no reproducirse.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano.
- Riesgo de alucinacion y sesgos no evaluados en la informacion disponible.
- El modelo base se centra en videos cortos implementados integramente en codigo; no cubre video realista ni clips largos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los datasets de calibracion.
- El checkpoint conserva el tokenizer y la plantilla de chat originales; cambios en el runtime pueden alterar el comportamiento.

## Enlaces

- Hugging Face de esta cuantizacion: https://huggingface.co/ShinePixelOrg/SenseNova-6.8-Code2Video-NVFP4-MLP-FP8Block128-Attn-Tail8
- Modelo base en Hugging Face: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Repositorio GitHub: https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video
