# NANI-Nithin/Raon-1-mini-preview-GGUF

## Resumen

Raon-1-mini-preview-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo KRAFTON/Raon-1-mini-preview, publicado por el usuario NANI-Nithin. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original en precisión BF16 a la familia completa de cuantizaciones de llama.cpp, desde BF16 (53,64 GB) hasta IQ2_XXS (10,21 GB), pensada para su uso con llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF. El checkpoint de origen tiene 28.783.218.602 parámetros (unos 28,8 mil millones), lo que lo sitúa en la franja de modelos densos o mixtos de gran tamaño para ejecución local.

La relevancia de este repositorio es puramente práctica: el modelo base no es directamente consumible en hardware de consumo, mientras que las variantes Q4_K_M (18,33 GB) o IQ4_XS (14,97 GB) sí caben en GPUs de 24 GB o incluso de 16 GB con cuantizaciones más agresivas. La existencia de un fichero MXFP4_MOE apunta a que el modelo base emplea una arquitectura con mezcla de expertos (MoE), aunque no se ha publicado el número de parámetros activos ni la configuración de los expertos.

No se dispone de información sobre la licencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento del modelo original en la información proporcionada. El repositorio no registra descargas ni valoraciones en el momento de la consulta, y la búsqueda web realizada no ha devuelto resultados relevantes sobre el modelo (los resultados obtenidos corresponden a agencias de viajes y no guardan relación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la presencia de un quant `MXFP4_MOE` sugiere arquitectura con mezcla de expertos, sin confirmar) |
| Parametros totales | 28.783.218.602 (~28,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q4_1, Q4_0, MXFP4_MOE, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q3_K_S, IQ3_XS, IQ3_XXS, Q2_K, IQ2_M, Q2_K_S, IQ2_S, IQ2_XS, IQ2_XXS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye presumiblemente en safetensors, aunque no se confirma en la informacion disponible |

Otros datos del repositorio: 30 ficheros segun la model card (485,4 GB declarados) y 521,2 GB de tamano total del repo en HuggingFace; 0 descargas y 0 likes en el momento de la consulta; creado el 24 de octubre de 2026 y actualizado el 25 de octubre de 2026.

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base KRAFTON/Raon-1-mini-preview en los materiales disponibles. El dato objetivo es el recuento de parametros (28.783.218.602) y la existencia de una cuantizacion denominada `MXFP4_MOE`, reservada en llama.cpp a los tensores de expertos, lo que indica que al menos parte del modelo sigue un esquema de mezcla de expertos. Se desconoce el numero de expertos, el numero de parametros activos por token, la dimension oculta, el numero de capas y el mecanismo de atencion empleado.

Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, las tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El trabajo realizado por el autor del repositorio se limita a la conversion y cuantizacion: segun la model card, todos los ficheros se cortan a partir del BF16 completo, que actua como fuente de referencia.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio y el pipeline `text-generation` indican un modelo ajustado para dialogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a traves de la infraestructura de Inference Endpoints de HuggingFace en formato GGUF.
- Ejecucion local en CPU y GPU mediante llama.cpp, con soporte de offloading parcial de capas.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de 24 GB: la variante Q4_K_M (18,33 GB) permite servir el modelo en una RTX 3090 o RTX 4090 con contexto moderado, sin depender de APIs externas ni de conectividad.
- Prototipado de asistentes conversacionales en equipos de desarrollo: con IQ4_XS (14,97 GB) o Q4_K_S (16,88 GB) se puede levantar un endpoint compatible con la API de OpenAI mediante llama.cpp o Ollama para validar prompts, plantillas de chat y flujos de conversacion antes de invertir en infraestructura.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 27 variantes declaradas, desde BF16 hasta IQ2_XXS, lo que permite medir la degradacion de calidad por bit efectivo en un mismo modelo y elegir el punto de equilibrio para produccion.
- Procesamiento por lotes en CPU con requisitos de memoria ajustados: la variante IQ2_M (11,31 GB) o Q2_K (11,43 GB) puede ejecutarse en servidores sin GPU, con throughput bajo pero suficiente para tareas asincronas de clasificacion, resumen o extraccion.
- Experimentacion en investigacion sobre cuantizacion: la disponibilidad del BF16 de referencia junto a las versiones de 2, 3 y 4 bits facilita estudios de perplexity, divergencia KL y degradacion en tareas especificas sin necesidad de reproducir el pipeline de conversion.
- Integracion en aplicaciones de escritorio con LM Studio u Ollama: al estar en formato GGUF, el modelo se puede distribuir como fichero unico y cargar en herramientas de escritorio, util para demos offline o entornos con requisitos de confidencialidad de datos.
- Fine-tuning ligero sobre la variante desquantizada: a partir del BF16 (53,64 GB) es posible aplicar LoRA o QLoRA y volver a cuantizar, aunque el coste de hardware para el ajuste completo queda fuera del alcance de GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion. Tampoco se han encontrado resultados en la busqueda web realizada, que no ha devuelto ninguna fuente relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada del tamano de cada fichero GGUF, mas overhead de contexto y cache KV; no son mediciones realizadas):
  - BF16 (53,64 GB): 60 GB o mas de VRAM o RAM; requiere A100 80 GB, H100 80 GB o configuracion multi-GPU.
  - Q8_0 (28,59 GB): 32-36 GB.
  - Q6_K (24,06 GB): 28-30 GB.
  - Q5_K_M (20,66 GB): 24-26 GB.
  - Q4_K_M (18,33 GB): 20-22 GB.
  - IQ4_XS (14,97 GB): 17-19 GB.
  - IQ3_M (13,30 GB): 15-17 GB.
  - IQ2_M (11,31 GB): 13-15 GB.
- GPU recomendadas: A100 80 GB o H100 para BF16 y Q8_0; A100 40 GB o L40S 48 GB para Q5/Q6; RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) para Q4_K_M e inferiores; RTX 4080 16 GB o RTX 4060 Ti 16 GB para IQ4_XS e IQ3_M.
- Cabe en GPU de consumo: si, desde Q4_K_M hacia abajo en tarjetas de 24 GB, y desde IQ4_XS hacia abajo en tarjetas de 16 GB. En tarjetas de 12 GB solo entran las variantes IQ2, con degradacion notable.
- Opciones de despliegue: llama.cpp (referencia para este formato), Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI basados en llama.cpp. vLLM y TGI tienen soporte de GGUF limitado o experimental; para produccion a gran escala conviene partir del checkpoint original en safetensors.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones y dependeran del hardware, de la cuantizacion y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. La busqueda web no ha devuelto resultados relacionados con Raon-1-mini-preview ni con alternativas de la misma familia, y no se conocen los benchmarks del modelo base, por lo que cualquier comparacion de rendimiento seria especulativa. La unica comparacion posible es interna, entre las propias variantes de cuantizacion:

| Version | Parametros | Contexto | Licencia | Tamano en disco | Disponibilidad |
|---|---|---|---|---|---|
| Raon-1-mini-preview BF16 | 28,8 mil millones | no disponible | no disponible | 53,64 GB | GGUF en este repo |
| Raon-1-mini-preview Q8_0 | 28,8 mil millones | no disponible | no disponible | 28,59 GB | GGUF en este repo |
| Raon-1-mini-preview Q4_K_M | 28,8 mil millones | no disponible | no disponible | 18,33 GB | GGUF en este repo |
| Raon-1-mini-preview IQ2_M | 28,8 mil millones | no disponible | no disponible | 11,31 GB | GGUF en este repo |
| Modelos alternativos de ~30B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Riesgo de alucinacion: no cuantificado. Al no haber benchmarks ni evaluaciones de fidelidad, no es posible estimar la tasa de alucinacion; en un modelo de 28,8B sin datos publicados de alineacion conviene aplicar verificacion externa en produccion.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto maxima y la lista de idiomas. No hay garantia de calidad en castellano; habria que evaluarlo empiricamente antes de usarlo en producto.
- Restricciones de licencia: la licencia aparece como "no disponible" tanto en los metadatos como en la model card. Sin una licencia explicita no se puede asumir permiso de uso comercial; es imprescindible consultar el repositorio del modelo base KRAFTON/Raon-1-mini-preview antes de cualquier despliegue productivo.
- Cuantizaciones de muy baja precision: las variantes por debajo de 3 bits (Q2_K, IQ2_S, IQ2_XS, IQ2_XXS) presentan degradacion significativa segun la propia model card y no son recomendables para tareas que requieran razonamiento o coherencia sostenida.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de que las cuantizaciones hayan sido evaluadas por terceros, por lo que se recomienda verificar la coherencia de las salidas frente al BF16 antes de adoptarlas.
- Discrepancia de inventario: la model card declara 30 ficheros y 485,4 GB, mientras que los metadatos de HuggingFace indican 521,2 GB de repositorio. Conviene comprobar la lista real de ficheros antes de automatizar descargas.
- Modelo en estado "preview": el nombre del checkpoint base indica una version preliminar, sujeta a cambios sin aviso.
- Ausencia de soporte de primera parte: al ser un repositorio de terceros, no hay garantia de mantenimiento ni de actualizacion ante cambios en llama.cpp o en las herramientas de cuantizacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/NANI-Nithin/Raon-1-mini-preview-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Fichero BF16 de referencia: https://huggingface.co/NANI-Nithin/Raon-1-mini-preview-GGUF/blob/main/Raon-1-mini-preview-BF16.gguf
- Fichero Q4_K_M (recomendado por tamano/calidad): https://huggingface.co/NANI-Nithin/Raon-1-mini-preview-GGUF/blob/main/Raon-1-mini-preview-Q4_K_M.gguf
- Fichero IQ4_XS (opcion sub-4,5 bpw): https://huggingface.co/NANI-Nithin/Raon-1-mini-preview-GGUF/blob/main/Raon-1-mini-preview-IQ4_XS.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Papers, blogs, demos o repositorios adicionales: no disponibles en la informacion proporcionada.
