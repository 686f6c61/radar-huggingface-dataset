# jirka642/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved-exl3

## Resumen

Este repositorio contiene cuantizaciones EXL3 del modelo llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved, un ajuste fino sin censura ("uncensored") derivado de la familia Qwen3, con el modulo de prediccion multi-token (MTP) preservado. El autor del repositorio es el usuario jirka642 y su aportacion no es un entrenamiento nuevo, sino la conversion de los pesos originales al formato EXL3 de ExLlamaV3 para permitir inferencia eficiente en GPU con cuantizaciones de 4,0, 5,0 y 6,0 bits por peso.

El problema que resuelve es puramente de despliegue: el modelo base en precision completa no cabe comodamente en GPUs de consumo, y estas cuantizaciones reducen el peso a aproximadamente 13,5-20 GB segun el nivel elegido, manteniendo modulos auxiliares (cabezales, vision y MTP) a 6 bits para limitar la perdida de calidad. Es relevante para quienes quieren ejecutar localmente un modelo de gran tamano con comportamientos menos restringidos por alineamiento, usando el ecosistema ExLlamaV3/TabbyAPI en lugar de llama.cpp.

La model card es minima: no declara licencia, idiomas, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. Toda la informacion verificable se limita al pipeline de conversion, los tres niveles de cuantizacion y el commit exacto del modelo de origen. El nombre sugiere 27 000 millones de parametros, pero no hay confirmacion formal en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3 con modulo de prediccion multi-token (MTP) preservado; atencion y si es denso o MoE no disponibles |
| Parametros totales | 27 000 millones aproximados, segun la nomenclatura del nombre del repositorio (no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 (ExLlamaV3) a 4,0, 5,0 y 6,0 bits por peso; MTP a 4 bits, cabezales a 6 bits, vision a 6 bits |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato EXL3 (no compatible con GGUF) |
| Version de ExLlamaV3 usada | 1.6.1 |
| Commit del modelo base | 4b9e1517a43fdca25872318ed272a1c88e72c360 |
| Tamano del repositorio | 58,7 GB (incluye los tres niveles de cuantizacion) |
| Configuracion de preprocesado | preprocessor_config.json tomado de Qwen/Qwen3.8-27B, ya que el repositorio de origen no lo incluye o es incompatible |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento en la documentacion proporcionada. El modelo base se presenta como un ajuste fino "uncensored" y "heretic" de un supuesto Qwen3.8-27B, terminos que en la comunidad suelen indicar un entrenamiento de desalineacion deliberada (ablacion de comportamientos de rechazo) mediante fine-tuning supervisado y/o tecnicas de preferencia, pero esto no se confirma en la model card. Tampoco se especifican tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

La innovacion tecnica documentada es la preservacion del modulo MTP (multi-token prediction) durante la cuantizacion, algo que muchas conversiones descartan porque complica el mapeo de tensores. El autor lo mantiene a 4 bits con la opcion `--mtp_bits 4`, y aplica 6 bits a los cabezales (`--head_bits 6`) y a la torre de vision (`--vision_bits 6`), lo que sugiere que el modelo base es multimodal, aunque no se detalla el componente de vision. La conversion se ejecuto sobre dos dispositivos (`--devices 0,1`) con el conversor nativo de ExLlamaV3.

## Capacidades

- Generacion de texto y conversacion multi-turno: capacidad heredada del modelo base, no verificada de forma independiente en este repositorio.
- Comportamiento "uncensored": el ajuste fino busca reducir negativas y filtros de contenido; el alcance real no esta documentado.
- Prediccion multi-token (MTP): el modulo se conserva a 4 bits, lo que en ExLlamaV3 puede habilitar decodificacion especulativa y aumentar el throughput, siempre que el runtime lo aproveche.
- Posible entrada multimodal de vision: la conversion usa `--vision_bits 6`, lo que implica la existencia de pesos de vision en el modelo de origen; soporte efectivo no confirmado.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo "thinking" explicito: no disponible.
- Capacidades de codigo y matematicas: no disponibles ni verificadas.

## Casos de uso

- Inferencia local con privacidad total: al ser una cuantizacion EXL3 ejecutable en GPUs de consumo, permite desplegar un modelo de ~27B en una estacion de trabajo sin enviar datos a servicios externos, util para sectores con requisitos de confidencialidad.
- Investigacion sobre alineamiento y seguridad: un modelo deliberadamente desalineado sirve como sujeto de estudio para medir como se comportan los filtros de rechazo tras el fine-tuning y para construir conjuntos de evaluacion de toxicidad.
- Red-teaming de sistemas de moderacion: se puede emplear como generador de prompts adversarios o de contenido limite para probar clasificadores y guardarrailes antes de ponerlos en produccion.
- Generacion de datos sinteticos sin filtros: util para crear corpus de entrenamiento que cubran registros, vocabulario o tematicas que los modelos alineados suelen evitar, siempre bajo revision humana posterior.
- Escritura creativa y ficcion sin restricciones editoriales: el modelo puede mantener narrativas largas y temas adultos o violentos que otros modelos rechazan, en un entorno controlado y con responsabilidad del usuario.
- Experimentacion con cuantizacion y decodificacion especulativa: los tres niveles de bits (4,0/5,0/6,0) con MTP a 4 bits permiten medir el compromiso entre VRAM, latencia y calidad usando ExLlamaV3 como banco de pruebas.
- Asistente tecnico offline en estaciones aisladas: en entornos sin conectividad (laboratorios, plantas industriales) puede actuar como asistente de consulta sobre documentacion local, asumiendo que no hay datos publicados sobre su calidad en tareas tecnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco hay comparaciones con el modelo base sin cuantizar.

| Nivel de cuantizacion | MTP | Cabezales | Vision | Benchmarks publicados |
|---|---|---|---|---|
| 4.0bpw_H6_V6 | 4 bits | 6 bits | 6 bits | no disponible |
| 5.0bpw_H6_V6 | 4 bits | 6 bits | 6 bits | no disponible |
| 6.0bpw_H6_V6 | 4 bits | 6 bits | 6 bits | no disponible |

## Requisitos de hardware

- VRAM estimada solo para pesos (calculo aritmetico a partir de bits por peso sobre ~27B, no medida): 4,0 bpw ≈ 13,5 GB; 5,0 bpw ≈ 16,9 GB; 6,0 bpw ≈ 20,3 GB. Hay que sumar cabezales, modulo MTP y cache KV.
- VRAM total orientativa con contexto moderado: 4,0 bpw ≈ 15-17 GB; 5,0 bpw ≈ 18-20 GB; 6,0 bpw ≈ 22-24 GB. Son estimaciones, no cifras verificadas.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para 4,0 bpw con contexto limitado; RTX 5090 (32 GB) para 5,0 bpw con holgura; A100 40/80 GB, H100 o L40S para 6,0 bpw y contextos largos.
- Configuraciones multi-GPU: el propio autor convirtio usando dos dispositivos (`--devices 0,1`), de modo que 2x RTX 4090 o 2x RTX 3090 son una via razonable para los niveles altos.
- Cabe en GPU de consumo: 4,0 bpw si en GPUs de 24 GB o mas; 5,0 bpw al limite en 24 GB; 6,0 bpw requiere 32 GB o reparto entre varias GPU.
- Opciones de despliegue: ExLlamaV3 (version 1.6.1 empleada en la conversion) y servidores compatibles como TabbyAPI; tambien cargadores EXL3 de terceros. No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles; el MTP preservado podria habilitar decodificacion especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la informacion proporcionada. La unica comparacion posible es interna, entre los tres niveles de cuantizacion del propio repositorio y el modelo de origen.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jirka642/...-exl3 (4.0 bpw) | ~27B | no disponible | EXL3 4,0 bpw | no disponible | HuggingFace |
| jirka642/...-exl3 (5.0 bpw) | ~27B | no disponible | EXL3 5,0 bpw | no disponible | HuggingFace |
| jirka642/...-exl3 (6.0 bpw) | ~27B | no disponible | EXL3 6,0 bpw | no disponible | HuggingFace |
| llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved | ~27B | no disponible | precision original | no disponible | HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: sin benchmarks no es posible estimar la degradacion introducida por la cuantizacion ni comparar con el modelo sin cuantizar.
- Licencia no declarada: esto impide determinar si el uso comercial esta permitido. Al derivar de un supuesto modelo Qwen, habria que verificar la licencia del modelo base, pero en este repositorio no consta.
- Modelo "uncensored": el ajuste fino persigue eliminar los rechazos, por lo que puede generar contenido ofensivo, ilegal, peligroso o sexual sin filtros. No es apto para productos orientados a publico general sin moderacion externa.
- Riesgo alto de alucinacion: no hay datos que permitan cuantificarlo, y los ajustes de desalineacion suelen degradar la calibracion y la fiabilidad factual.
- Modelo de comunidad sin trazabilidad: el modelo base lo publica el usuario llmfan46 y la nomenclatura "Qwen3.8-27B" no se corresponde con ninguna designacion oficial verificada de Qwen, lo que impide confirmar el linaje real de los pesos.
- Repositorio sin descargas ni interacciones en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validacion por parte de la comunidad.
- Fecha de creacion declarada en 2026, posterior a la mayoria de referencias conocidas; conviene verificar la integridad y el origen de los pesos antes de usarlos en produccion.
- Soporte de tool calling, agentes y multilingueismo sin confirmar: asumir estas capacidades sin pruebas previas puede romper pipelines.
- Incompatibilidad con llama.cpp, Ollama y GGUF: el despliegue queda atado al ecosistema ExLlamaV3/TabbyAPI.
- La configuracion de preprocesado se tomo de otro repositorio (Qwen/Qwen3.8-27B), lo que anade un punto de posible desajuste en el tratamiento de imagenes o texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jirka642/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved-exl3
- Modelo base: https://huggingface.co/llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved
- Commit del modelo base: https://huggingface.co/llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved/commit/4b9e1517a43fdca25872318ed272a1c88e72c360
- Cuantizacion 4,0 bpw: https://huggingface.co/jirka642/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved-exl3/tree/main/4.0bpw_H6_V6
- Cuantizacion 5,0 bpw: https://huggingface.co/jirka642/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved-exl3/tree/main/5.0bpw_H6_V6
- Cuantizacion 6,0 bpw: https://huggingface.co/jirka642/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved-exl3/tree/main/6.0bpw_H6_V6
- Configuracion de preprocesado de referencia: https://huggingface.co/Qwen/Qwen3.8-27B/resolve/main/preprocessor_config.json
- Repositorio del modelo Qwen de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
- ExLlamaV3 (runtime y conversor): https://github.com/turboderp-org/exllamav3
- TabbyAPI (servidor compatible con EXL3): https://github.com/theroyallab/tabbyAPI
- Nota: los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica sobre el modelo y se han descartado por completo.
