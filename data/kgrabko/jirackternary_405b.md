# kgrabko/JiRackTernary_405b

## Resumen

JiRackTernary_405b es un modelo de generación de texto publicado por el usuario kgrabko (atribuido a Konstantin Vladimirovich Grabko, CMS Manhattan) que parte de meta-llama/Meta-Llama-3.1-405B y aplica una cuantización ternaria propietaria (etiquetada como 1,58 bit y 2 bit) sobre capas de tipo BitNet. El autor lo presenta como un desarrollo con reducción de VRAM del 70 por ciento y fusiones SWA orientadas a estabilidad térmica, con foco en inferencia sobre hardware AMD ROCm.

El modelo se distribuye en formato safetensors y está declarado explícitamente como "under training yet: DEV", es decir, en estado de desarrollo y no finalizado. Los recuentos reales de safetensors arrojan 107.756.340.964 parámetros, una cifra que no coincide con la nomenclatura "405B" del repositorio ni con el modelo base declarado, y el repositorio ocupa 272,3 GB.

Su relevancia actual es limitada pero ilustrativa: es un ejemplo de intento de compresión extrema (ternaria) de un modelo frontera de 405B para abaratarsu despliegue, con una licencia propietaria que restringe el uso comercial y exige un 5 por ciento de royalty sobre ingresos netos. No se han publicado resultados de benchmarks ni métricas de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Llama 3.1 405B, con cuantizacion ternaria sobre capas BitNet (denominada "jirack_ternary" por el autor) |
| Parametros totales | 107.756.340.964 (recuento real de safetensors); el repositorio se denomina "405B" y declara como base meta-llama/Meta-Llama-3.1-405B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria, etiquetada como 1,58 bit y 2 bit; no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles y ruso |
| Licencia | cms-manhattan-jirack-v1.2 (propietaria, uso no comercial; 5 por ciento de royalty sobre ingresos netos para uso comercial) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Meta-Llama-3.1-405B |
| Tamano del repositorio | 272,3 GB |
| Estado | En entrenamiento (DEV), segun la model card |
| Autor | kgrabko (Konstantin Vladimirovich Grabko, CMS Manhattan) |
| Descargas / likes | 557 / 4 |
| Fecha de creacion / actualizacion | 2 de febrero de 2026 / 4 de octubre de 2026 |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer cuantizado de forma ternaria que emplea capas BitNet, una tecnica de cuantizacion de pesos a valores {-1, 0, +1} (aproximadamente 1,58 bit por peso). El autor menciona ademas dos componentes propietarios: BRE y fusion SWA, orientados respectivamente a la eficiencia de inferencia y a la estabilidad termica (objetivo declarado de mantenerse por debajo de 80 grados Celsius). Tambien se cita un tokenizador compatible con meta-llama/Llama-3.2-405B (referencia que en la propia ficha parece un error tipografico respecto a 3.1-405B).

No se aportan datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El autor reconoce que el modelo sigue en entrenamiento y solicita un patrocinador para una destilacion que alcance la calidad del Llama 405B original, lo que indica que el proceso de compresion aun no ha convergido a una calidad equivalente. El paquete de documentacion asociado (invention_description.md, claims.md, performance_data.md, NDA.md) no es publico.

## Capacidades

- Generacion de texto autoregresiva, con pipeline declarado text-generation.
- Cobertura multilingue limitada a ingles y ruso segun los metadatos del repositorio.
- Ejecucion local mediante el IDE de codigo agente JiRack, distribuido por el propio autor para funcionar sobre Ollama en PC domestico.
- Ajuste fino con LoRA: la model card estima unos 50 millones de parametros entrenables con r=16 en FP32 (unos 200 MB), manteniendo congelado el modelo base.
- No se documenta soporte de tool calling ni de function calling.
- No se documentan capacidades de vision, audio, modo thinking explicito ni razonamiento multi-paso verificado.
- No se publican evaluaciones de capacidad de codigo ni de matematicas, mas alla de la existencia del IDE de codificacion asociado.

## Casos de uso

- Investigacion en cuantizacion ternaria: reproduccion y analisis de tecnicas de compresion a 1,58 bit sobre modelos de gran escala, comparando la degradacion de calidad frente al modelo base Llama 3.1 405B.
- Ajuste fino con LoRA en laboratorio: la ficha del autor estima que el modelo congelado ocupa unos 108 GB a 2 bit, lo que permite entrenar adaptadores de ~50M de parametros en configuraciones multi-GPU de gama alta con offloading.
- Evaluacion de inferencia en AMD ROCm: el paquete propietario esta explicitamente orientado a ejecucion eficiente sobre ROCm, por lo que sirve como banco de pruebas de kernels y rutas de compilacion en GPUs AMD Instinct.
- Asistencia de programacion local: integracion en el IDE JiRack (o en alternativas como Cursor o Windsurf) para sugerencias de codigo con revision humana obligatoria de los cambios antes de aplicarlos.
- Procesamiento de texto en ingles y ruso en entornos on-premise: despliegue en infraestructura propia para tareas de generacion y transformacion de texto sin salida a servicios en la nube.
- Experimentacion academica con destilacion de modelos frontera: el propio autor plantea la destilacion hacia un modelo de calidad comparable al 405B original, lo que abre lineas de trabajo sobre recuperacion de calidad tras cuantizacion agresiva.
- Estudio de estabilidad termica en centros de datos: la fusion SWA y el objetivo declarado de operar por debajo de 80 grados hacen del modelo un caso de analisis de consumo energetico y refrigeracion en despliegues densos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el propio autor indica que el modelo sigue en entrenamiento y que necesita financiacion para alcanzar la calidad del Llama 405B original.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 108 GB segun la model card, que calcula 405B parametros a 2 bit como aproximadamente 108 GB. El repositorio ocupa 272,3 GB en disco, muy por encima de lo que cabria esperar de un empaquetado ternario puro.
- GPU recomendadas: 2x H100 80 GB o 2x A100 80 GB cubririan los ~108 GB indicados; el autor afirma que el modelo cabe en 4x RTX 4090 con offloading, aunque 4x24 GB equivalen a 96 GB, por debajo de la cifra declarada, por lo que seria necesario descargar parte de las capas a CPU o NVMe.
- GPU de consumo: no cabe integramente en una sola GPU de consumo; requiere multiples GPU o una sola GPU con offloading agresivo.
- Hardware AMD: el paquete del autor esta orientado a ROCm, por lo que las GPUs AMD Instinct son la plataforma objetivo declarada.
- Opciones de despliegue: transformers y safetensors como ruta confirmada; TGI y vLLM son compatibles con el formato, aunque no se documentan recetas oficiales. El autor menciona Ollama para su IDE, pero no se distribuyen archivos GGUF en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRackTernary_405b | 107.756.340.964 (recuento real safetensors) | No disponible | Sin benchmarks publicados; en estado DEV | cms-manhattan-jirack-v1.2, propietaria, uso comercial con 5 por ciento de royalty | safetensors en HuggingFace, 272,3 GB |
| meta-llama/Meta-Llama-3.1-405B (base) | 405.000 millones | 128.000 tokens (segun la ficha publica del modelo base) | Rendimiento publicado por Meta en su model card | Llama 3.1 Community License | safetensors, ampliamente soportado |
| Otros modelos ternarios tipo BitNet (por ejemplo, la familia BitNet b1.58 de Microsoft) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

Los datos de la fila correspondiente a Llama 3.1 405B proceden de la documentacion publica del modelo base, no de la busqueda web realizada para esta ficha. La busqueda no devolvio resultados tecnicos relevantes sobre este modelo ni sobre alternativas comparables.

## Limitaciones y advertencias

- Estado de desarrollo: la model card indica explicitamente "under training yet: DEV", por lo que la calidad del modelo no esta garantizada ni validada.
- Discrepancia de parametros: el recuento real de safetensors (107.756.340.964) no coincide con la nomenclatura "405B" ni con el modelo base declarado. Conviene verificar la correspondencia real de los pesos antes de cualquier uso.
- Ausencia total de evaluaciones: no hay benchmarks, cartas de evaluacion ni comparativas de calidad frente al modelo original.
- Riesgo elevado de alucinacion y degradacion por cuantizacion: la compresion ternaria agresiva sobre un modelo de 405B, sin datos de destilacion completados, hace previsible una perdida de calidad respecto al original.
- Idiomas limitados a ingles y ruso; el castellano no aparece entre los idiomas declarados.
- Licencia propietaria: el uso comercial esta prohibido sin licencia escrita y sujeto a un 5 por ciento de royalty sobre ingresos netos. Se prohibe crear modelos derivados con fines de lucro, eliminar avisos de copyright y patentar cualquier parte de la tecnologia.
- Documentacion bajo NDA: los archivos invention_description.md, claims.md y performance_data.md no son publicos, lo que impide auditar tecnicamente las afirmaciones de rendimiento.
- Marco legal: la licencia se rige por la legislacion del estado de Nueva York y el autor declara patente pendiente.
- Sin cuantizaciones alternativas: no se ofrecen GGUF, AWQ ni GPTQ, lo que complica el despliegue en herramientas de inferencia local habituales.
- Repositorio muy pesado: 272,3 GB de descarga, con un coste de almacenamiento y transferencia considerable para pruebas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kgrabko/JiRackTernary_405b
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-405B
- Licencia del modelo: https://huggingface.co/kgrabko/JiRackTernary_405b/blob/main/LICENSE
- IDE JiRack (version de prueba): https://huggingface.co/CMSManhattan/JiRackDeltaNet_27b/resolve/main/jirack_ide.zip
- IDE JiRack (version final): https://huggingface.co/CMSManhattan/JiRackDeltaNet_27b/resolve/main/jirack_ide_final.zip
- Repositorio JiRackDeltaNet_27b: https://huggingface.co/CMSManhattan/JiRackDeltaNet_27b
- Contacto del autor para licencias comerciales: grabko@cmsmanhattan.com
