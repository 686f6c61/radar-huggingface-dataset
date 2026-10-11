# Ecmcfee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ8e-mtp

## Resumen

Este repositorio contiene una cuantizacion en 8 bits del modelo Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un modelo de lenguaje de aproximadamente 27.800 millones de parametros derivado de la familia Qwen 3.x (etiqueta de tipo declarada `qwen3_5`) y publicado por el usuario Ecmcfee en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos ya existentes a formato MLX safetensors en precision mixta de 8 bits, realizada con la herramienta oQ (oMLX v0.7.1.dev1), con tamano de grupo 64. El repositorio ocupa 30,0 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

El modelo original del que procede es un fine-tune "uncensored" (abliterado o con rechazos eliminados) de la serie Qwen3.8-27B atribuido en fuentes externas a DavidAU / David Belton, con variantes publicadas en GGUF y con soporte de decodificacion especulativa multi-token (MTP) en algunas de sus versiones. La cadena nominal del nombre incluye terminos como "Heretic" y "Uncensored", que indican la eliminacion deliberada de comportamientos de rechazo, y "Fable-Cold-Fusion-735-882", que en el ecosistema de fine-tunes de DavidAU suele referirse a fusiones de datasets o adaptadores propietarios del autor.

Su relevancia practica es acotada pero concreta: es una de las pocas distribuciones en formato MLX de 8 bits de este arbol de fine-tunes, lo que permite ejecutarlo en Apple Silicon con memoria unificada grande sin recurrir a GGUF ni a cuantizaciones de 4 bits con mayor perdida de calidad. Al no haber model card detallada, benchmarks publicados ni licencia declarada, su evaluacion en produccion exige verificacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen 3.x (tipo declarado en el repositorio: `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (~27,8 B), segun pesos safetensors |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 262.144 tokens segun la ficha externa del modelo base de DavidAU; no confirmado para esta cuantizacion concreta |
| Tipos de cuantizacion | 8 bits en precision mixta (oQ / oMLX), tamano de grupo 64; en el ecosistema del modelo base existen tambien GGUF IQ4_XS y Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la etiqueta del repositorio solo indica `region:us`) |
| Formato de pesos | MLX safetensors (cuantizado, 8 bits) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la etiqueta `qwen3_5` en los metadatos de cuantizacion. Por la nomenclatura de la familia Qwen y por el tamano declarado, se trata de un transformer decoder-only denso de unos 27.800 millones de parametros, con atencion por tokens y sin indicios de mezcla de expertos en los datos proporcionados. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento en el modelo original. Los terminos "Heretic" y "Uncensored" del nombre apuntan a un proceso de abliteracion o de eliminacion de direcciones de rechazo, pero no se especifica el metodo empleado.

Lo que si esta documentado en este repositorio es el proceso de post-procesado: la cuantizacion se realizo con oQ (oMLX v0.7.1.dev1), una herramienta de cuantizacion de precision mixta para MLX, fijando 8 bits y tamano de grupo 64. El autor indica que la version actual sustituye a una anterior subida el 2026-10-11 y recomienda volver a descargar los pesos si se obtuvo una copia previa. En las variantes GGUF del mismo arbol de modelos se menciona soporte de MTP (multi-token prediction), lo que sugiere decodificacion especulativa; no se confirma que esta cuantizacion MLX conserve esa capacidad.

## Capacidades

- Generacion de texto y conversacion multi-turno: comportamiento heredado del modelo base Qwen3.8-27B, segun las fuentes externas consultadas.
- Generacion de codigo: las variantes hermanas del mismo fine-tune se comercializan explicitamente como orientadas a programacion (sufijo "NEO-CODER"), aunque no hay evaluacion publicada para esta conversion MLX concreta.
- Razonamiento y matematicas: no disponible; no se han publicado resultados especificos.
- Modo "thinking" o razonamiento extendido: las discusiones del repositorio hermano mencionan comportamiento de pensamiento ("thinking") en el modelo base, sin detalle de configuracion para esta cuantizacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; hay menciones no verificadas a uso con agentes en las discusiones del repositorio GGUF hermano.
- Capacidades multilingues: no disponible; no se declaran idiomas en el repositorio.
- Vision: una fuente externa cataloga el modelo base como "Vision", pero no se aporta ninguna confirmacion tecnica ni lista de parametros de vision en este repositorio. Tratar como no verificado.
- Ausencia de rechazos ("uncensored"): caracteristica declarada en el nombre y en la descripcion externa de las variantes abliteradas; implica menor tendencia a negarse a responder, no mayor fiabilidad.

## Casos de uso

- Inferencia local en Mac con memoria unificada grande: con 30 GB de pesos en 8 bits, el modelo entra en equipos Apple Silicon de 36 GB o mas (M2 Max, M3 Max, M4 Pro/Max con 48 GB o superior) usando mlx-lm, lo que permite trabajar sin conexion y sin coste por token.
- Asistente de programacion en local: el arbol de fine-tunes del que procede esta orientado a codigo; un desarrollador puede integrarlo en su editor o CLI para autocompletado, refactorizacion y generacion de tests, siempre que valide la calidad real, ya que no hay benchmarks publicados.
- Procesamiento de documentos largos: si se confirma la ventana de 262.144 tokens, seria adecuado para resumir o extraer informacion de repositorios completos, expedientes o libros tecnicos en una sola pasada, evitando pipelines de troceado y recuperacion.
- Generacion creativa sin filtros editoriales: escritura de ficcion, guiones o dialogos que requieran contenido adulto o temas sensibles, aprovechando la naturaleza "uncensored" del modelo; requiere revision humana por ausencia de salvaguardas.
- Analisis de corpus con requisitos estrictos de confidencialidad: al ejecutarse en hardware propio y no enviar datos a APIs externas, encaja en entornos legales, sanitarios o industriales donde la exfiltracion de datos no es aceptable.
- Experimentacion en investigacion sobre abliteracion: util como punto de comparacion para estudiar como la eliminacion de rechazos afecta a la fidelidad de instrucciones, la coherencia y las tasas de alucinacion frente al modelo base.
- Prototipado rapido en MLX: sirve para validar pipelines de inferencia en MLX (batching, KV cache, decodificacion especulativa) antes de invertir en cuantizaciones de mayor calidad o en despliegues con GPU dedicada.
- Fine-tuning ligero o adaptacion de dominio: al estar en safetensors MLX, puede servir de base para LoRA sobre MLX, aunque la cuantizacion de 8 bits limita las opciones frente a pesos completos en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio ni las fuentes externas consultadas aportan cifras de MMLU, HumanEval, GSM8K, MT-Bench u otras evaluaciones, ni para esta cuantizacion ni para el modelo base del que deriva. Cualquier comparacion numerica con otros modelos seria especulativa y no se incluye.

## Requisitos de hardware

- VRAM estimada en 8 bits (esta cuantizacion): aproximadamente 28-30 GB de pesos mas overhead de KV cache y runtime, coherente con los 30,0 GB del repositorio.
- VRAM estimada en BF16 (modelo base): unos 56,31 GB, segun la ficha externa de llmrun.dev.
- GPU dedicadas: una A100 80 GB, H100 80 GB o L40S 48 GB pueden alojar el modelo en 8 bits. No cabe en una RTX 4090 (24 GB) ni en una RTX 3090 individual (24 GB) a esta precision.
- Configuraciones multi-GPU: el repositorio hermano menciona una version mixta INT4-INT8 pensada para usuarios con dos RTX 3090 (48 GB combinados), lo que confirma que el rango de 30 GB exige agregacion de memoria en el segmento consumer.
- Apple Silicon: es el destino natural del formato MLX. Se necesita un Mac con memoria unificada de 36 GB o mas; 48 GB o 64 GB dan margen comodo para contexto largo.
- Consumer GPU con cuantizaciones menores: las variantes GGUF del mismo arbol (por ejemplo IQ4_XS o Q4_K_M) reducen el peso a unos 15-17 GB y si caben en tarjetas de 24 GB, pero no estan incluidas en este repositorio MLX.
- Opciones de despliegue: mlx-lm, LM Studio, MLX Swift y otras herramientas compatibles con MLX safetensors. No es directamente utilizable con vLLM, TGI o llama.cpp sin convertir previamente los pesos, ya que estos motores no consumen safetensors MLX.
- Latencia y throughput estimados: no disponibles. Dependen por completo del chip Apple Silicon y del ancho de banda de memoria del equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ecmcfee/Qwen3.8-27B-...-oQ8e-mtp (este) | 27,8 B | Hasta 262.144 tokens (fuente externa, no confirmado) | MLX safetensors, 8 bits, grupo 64 | No disponible | HuggingFace, 0 descargas |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF | 27,8 B (mismo arbol) | No disponible en la informacion recogida | GGUF, quants IQ4_XS, Q4_K_M y otros; MTP en el nombre | No disponible | HuggingFace, con discusiones activas y soporte de comunidad |
| Modelo base Qwen3.8-27B sin abliterar | ~27,8 B | No disponible | BF16 safetensors y GGUF | No disponible | No localizado en la busqueda realizada |
| Otras variantes abliteradas del mismo fine-tune (catalogo abliteratedmodels.org) | ~27,8 B | No disponible | GGUF | No disponible | Catalogos de terceros |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para ninguna de las variantes, y las diferencias documentadas se limitan al formato de pesos, al metodo de cuantizacion y a la presencia o ausencia de MTP.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan datos de entrenamiento, idiomas, licencia ni limitaciones, lo que impide un uso en produccion sin evaluacion propia.
- Licencia no declarada: al no figurar licencia en el repositorio, no hay autorizacion explicita de uso comercial. Es imprescindible contactar con el autor o verificar la licencia del modelo base antes de cualquier despliegue.
- Riesgo elevado de alucinacion: una fuente externa advierte de que las capacidades se heredan del modelo base y que la abliteracion puede reducir la fidelidad al seguimiento de instrucciones. Es decir, el modelo puede ser menos obediente, no mas capaz.
- Contenido sin filtros: el caracter "uncensored" implica ausencia de rechazos ante peticiones daninas, ilegales o eticamente problematicas. Requiere moderacion externa obligatoria en cualquier aplicacion expuesta a usuarios.
- Sesgos: no evaluados ni documentados. Al no haber analisis de sesgo, deben asumirse los del corpus de entrenamiento original, desconocido.
- Idiomas: no se declara soporte multilingue. No se puede garantizar un rendimiento aceptable en castellano sin pruebas propias.
- Naturaleza derivada y fusionada: el nombre sugiere una fusion de multiples adaptadores o datasets ("Fable-Cold-Fusion-735-882"), una practica que puede degradar la coherencia en tareas largas y que no viene acompanada de ninguna validacion publicada.
- Volatilidad: el autor indica que esta version sustituye a una anterior. Los pesos pueden cambiar sin aviso, lo que rompe la reproducibilidad de cualquier evaluacion previa.
- Contexto largo no verificado: la cifra de 262.144 tokens procede de una fuente externa que describe el modelo base, no esta confirmada para esta cuantizacion y el rendimiento real en ventanas muy largas en MLX no esta medido.
- Formato restrictivo: al ser MLX safetensors, no es desplegable en la mayoria de stacks de servidor GPU (vLLM, TGI) sin conversion.
- Repositorio sin traccion: cero descargas y cero valoraciones implican nula validacion por parte de la comunidad.
- Parametros de decodificacion y plantilla de chat no publicados: es probable que se requiera la plantilla de Qwen3 para obtener resultados correctos, pero no se documenta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ecmcfee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ8e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Repositorio GGUF hermano de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Discusiones del repositorio hermano: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF/discussions
- Ficha externa con datos de VRAM y contexto: https://llmrun.dev/model/davidau-qwen3-8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau
- Ficha en catalogo de modelos abliterados: https://www.abliteratedmodels.org/qwen3.8-27b-turbo-fable-coldfusion-735-882-heretic-uncensored-neo-coder/
- Ficha externa del modelo en GGUF: https://theapplied.co/models/davidau-qwen3-8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-neo-coder-max-mtp-gguf
