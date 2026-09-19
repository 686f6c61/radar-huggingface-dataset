# bokuweb/gemma-4-E4B-it-grande-wgpu-ja

## Resumen

`bokuweb/gemma-4-E4B-it-grande-wgpu-ja` es una conversión de pesos del modelo `google/gemma-4-E4B-it` pensada para el motor de inferencia wgpu del proyecto `grande`, obra del desarrollador bokuweb. No se trata de un checkpoint en formato estándar (safetensors, GGUF o similar), sino de un directorio de tensores reempaquetados a partir de los códigos Q4_0 del GGUF de llama.cpp, acompañados de un `manifest.json` que mapea cada tensor a su fichero. El objetivo declarado es ejecutar el modelo en el navegador mediante WebGPU o de forma nativa sobre Metal o Vulkan, con una pasada forward block-causal que procesa estado y pregunta en un solo bloque.

El artefacto incorpora además una poda de vocabulario: se ha reducido a los 25.392 tokens que utiliza un corpus de decisión en japonés e inglés, generado con `tools/prune_vocab.py`. El texto incluido en ese corpus se tokeniza exactamente igual que con el vocabulario completo, mientras que el texto ajeno al corpus se fragmenta en más piezas, lo que alarga las secuencias. El repositorio ocupa 2,5 GB y se distribuye bajo la licencia Gemma.

Es relevante para quienes necesitan desplegar un modelo de la familia Gemma 4 en entornos sin backend GPU dedicado, especialmente en el navegador, o para quienes trabajan en japonés e inglés y quieren un binario compacto. Ahora bien, se trata de una publicación con cero descargas y cero interacciones, sin model card detallada más allá de las notas de exportación, y en el momento de redactar esta ficha no se han encontrado datos públicos de benchmarks, parámetros totales ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de `google/gemma-4-E4B-it`, no especificada en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (codigos procedentes del GGUF de llama.cpp, reempaquetados) |
| Idiomas soportados | japones e ingles (corpus de decision empleado para la poda de vocabulario); no se declara soporte de otros idiomas |
| Licencia | gemma |
| Formato de pesos | no es un checkpoint autonomo: ficheros de tensores para el motor wgpu de `grande` + `manifest.json`; derivado de Q4_0 GGUF |
| Modelo base | google/gemma-4-E4B-it |
| Tamano del repositorio | 2,5 GB |
| Tamano de vocabulario | 25.392 tokens (vocabulario podado) |
| Motor de inferencia | wgpu de `grande` (WebGPU en navegador; Metal/Vulkan en nativo) |
| Herramienta de exportacion | `tools/export_wgpu_gguf.py`; poda con `tools/prune_vocab.py` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (`google/gemma-4-E4B-it`) en los datos proporcionados: ni numero de capas, ni dimensiones ocultas, ni si emplea atencion completa, atencion lineal o un esquema hibrido. Lo unico que documenta el autor es la forma de ejecucion: una pasada forward block-causal que procesa el estado y cada pregunta en un unico bloque, integrada en el motor wgpu de `grande`. El sufijo E4B de la nomenclatura del modelo base sugiere un tamano efectivo del orden de 4.000 millones de parametros, pero no hay confirmacion en la informacion disponible, por lo que no se afirma como dato.

Tampoco se detallan los datos de entrenamiento, el numero de tokens vistos, la composicion del dataset ni si hubo fases de RLHF o DPO. El proceso aplicado por el autor es exclusivamente de conversion y poda: parte de los codigos Q4_0 del GGUF de llama.cpp, los reempaqueta para el motor wgpu y recorta el vocabulario a los 25.392 tokens usados por un corpus de decision japones/ingles. La innovacion destacable, por tanto, no esta en el entrenamiento sino en el formato de despliegue: inferencia en navegador sobre WebGPU y nativa sobre Metal o Vulkan con un artefacto de 2,5 GB.

## Capacidades

- Generacion de texto en japones e ingles, con tokenizacion identica a la del vocabulario completo para el texto del corpus de decision usado en la poda.
- Conversacion multi-turno: el motor ejecuta estado y pregunta en una sola pasada forward block-causal, lo que encaja con dialogos encadenados.
- Inferencia en navegador mediante WebGPU, sin necesidad de backend remoto.
- Inferencia nativa sobre Metal (macOS/iOS) y Vulkan, ademas del camino WebGPU.
- Ejecucion mediante la CLI de `grande`, por ejemplo `grande probe --model <directorio> --request examples/ticket-ja.json`.
- Capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de atencion al cliente en japones embebido en una web: el modelo se ejecuta en el propio navegador del usuario con WebGPU, de modo que los datos de la conversacion no salen del dispositivo; el ejemplo de peticion incluido por el autor (`examples/ticket-ja.json`) apunta directamente a este escenario de tickets de soporte.
- Clasificacion y enrutado de tickets tecnicos: dado un corpus de decision japones/ingles, el vocabulario podado cubre exactamente ese dominio, por lo que la tokenizacion es optima y las secuencias resultantes son mas cortas que con el vocabulario completo.
- Demo publica de un modelo Gemma 4 en una pagina estatica: al no requerir servidor de inferencia, se puede desplegar como recurso estatico junto al motor wgpu y funcionar sin coste de GPU en la nube.
- Aplicaciones de escritorio multiplataforma con Rust y wgpu: el mismo artefacto sirve para Metal en macOS y Vulkan en Windows o Linux, sin cambiar de pesos.
- Prototipado de productos de IA conversacional en local: la CLI `grande probe` permite lanzar peticiones de prueba contra el directorio del modelo antes de integrarlo en una aplicacion mayor.
- Procesamiento de texto sensible de forma offline: al ejecutarse de forma nativa sin conexion, encaja en flujos donde no se permite enviar contenido a APIs externas.
- Evaluacion comparativa de la ficha Q4_0 en el navegador frente a la ejecucion nativa, útil para medir el coste real de la ruta WebGPU en un equipo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de busqueda web obtenidos no contenian informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 2,5 GB en cuantizacion Q4_0, por lo que cabe en GPUs con 4 GB o mas de memoria dedicada; no hay cifras oficiales de consumo en ejecucion.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU de escritorio o portatil reciente con al menos 4 GB de VRAM, y en GPUs integradas compatibles con WebGPU, aunque el rendimiento en estas ultimas no esta documentado.
- GPUs de datacenter: A100, H100 u otras no son necesarias para un artefacto de este tamano; no se han publicado mediciones en ellas.
- Opciones de despliegue: CLI de `grande` (`grande probe --model <directorio>`), navegador con WebGPU, y ejecucion nativa sobre Metal o Vulkan a traves del mismo motor wgpu.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no aplicable directamente, ya que el directorio no es un checkpoint estandar ni un GGUF listo para esos motores; habria que partir del GGUF original del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bokuweb/gemma-4-E4B-it-grande-wgpu-ja | no disponible | no disponible | tensores para wgpu + manifest.json (Q4_0) | gemma | 0 descargas, 0 likes |
| google/gemma-4-E4B-it (modelo base) | no disponible | no disponible | no disponible | gemma | checkpoint oficial de referencia |
| GGUF Q4_0 del modelo base para llama.cpp | no disponible | no disponible | GGUF | gemma | ejecutable en llama.cpp y derivados |
| Otras conversiones WebGPU de la familia Gemma | no disponible | no disponible | no disponible | gemma | no disponible en la informacion recopilada |

La comparacion se limita a la ruta de despliegue, porque no hay datos publicos de parametros, contexto ni rendimiento para este artefacto ni, en la informacion disponible, para su modelo base. La diferencia practica frente a un GGUF convencional es el publico objetivo: este formato solo lo consume el motor `grande`, mientras que un GGUF es portable a llama.cpp, Ollama y otros.

## Limitaciones y advertencias

- Formato no portatil: no es un checkpoint autonomo; solo lo interpreta el motor wgpu de `grande` a traves de su `manifest.json`. No se puede cargar en transformers, llama.cpp, vLLM ni Ollama sin volver al modelo base.
- Vocabulario podado: el texto fuera del corpus de decision japones/ingles se fragmenta en mas tokens, lo que incrementa la longitud efectiva de las secuencias y puede degradar la calidad y aumentar el coste de computo. No hay evaluacion publicada del impacto de esta poda.
- Riesgo de alucinacion: no hay ninguna evaluacion de fidelidad o de tasas de alucinacion en la informacion disponible; como cualquier modelo generativo, puede producir contenido incorrecto con apariencia plausible.
- Sesgos: no se documentan sesgos conocidos ni analisis de sesgo para esta conversion.
- Cobertura idiomatica: el autor solo menciona japones e ingles; no se declara soporte de castellano ni de otros idiomas, y el vocabulario podado agrava esta limitacion.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma y a su politica de usos prohibidos; conviene revisarlos antes de integrarlo en un producto, y ademas el modelo base anade sus propias condiciones.
- Madurez: la publicacion registra 0 descargas y 0 likes, sin issues ni validacion de terceros; el autor la describe como parte de las herramientas de su propio proyecto, no como un artefacto mantenido para uso general.
- Ausencia de datos de contexto: se desconoce la ventana de contexto real, lo que impide dimensionar con seguridad casos de uso con documentos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bokuweb/gemma-4-E4B-it-grande-wgpu-ja
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del motor `grande`: https://github.com/bokuweb/grande
- Herramientas de exportacion y poda citadas en la model card: `tools/export_wgpu_gguf.py` y `tools/prune_vocab.py` dentro del repositorio anterior
- Ejemplo de peticion incluido por el autor: `examples/ticket-ja.json` dentro del repositorio anterior

Nota: los resultados de busqueda web obtenidos en esta recopilacion no contenian ningun enlace relevante sobre el modelo (contenido no relacionado), por lo que se han omitido.
