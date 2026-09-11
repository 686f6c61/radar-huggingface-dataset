# MinaMila/Phi3-ReGiFT

## Resumen

Phi3-ReGiFT es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario MinaMila en HuggingFace, entrenado sobre el modelo base microsoft/Phi-3-mini-4k-instruct. Se distribuye como un repositorio PEFT (library_name: peft) con pesos en safetensors, y su pipeline declarado es text-generation con orientacion conversacional. No es, por tanto, un modelo completo con pesos propios: es un conjunto de matrices de bajo rango que deben cargarse junto al modelo base para producir inferencia.

La relevancia del artefacto depende enteramente de la informacion que el autor proporcione, y en este caso la model card es la plantilla generada automaticamente por HuggingFace sin cumplimentar: todos los campos de descripcion, datos de entrenamiento, hiperparametros, evaluacion, licencia e idiomas aparecen como "[More Information Needed]". El repositorio registra 0 descargas y 0 likes, y su tamano se reporta como 0.0 GB, lo que impide verificar que los pesos del adaptador esten realmente publicados.

En consecuencia, esta ficha documenta lo que es verificable (naturaleza del adaptador, framework, modelo base, tag de licencia ausente) y marca explicitamente como "no disponible" todo lo que el autor no ha declarado. Cualquier evaluacion de calidad, sesgos o rendimiento del adaptador resulta imposible con la informacion disponible; los datos tecnicos que se incluyen a continuacion sobre arquitectura y contexto provienen de la documentacion publica del modelo base Phi-3-mini-4k-instruct, no de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (modelo base: microsoft/Phi-3-mini-4k-instruct) |
| Parametros totales | no disponible (el repositorio no declara el numero de parametros del adaptador; el modelo base tiene 3.800 millones segun su documentacion publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Phi-3-mini-4k-instruct soporta 4.096 tokens segun su documentacion publica |
| Tipos de cuantizacion | no disponible; al tratarse de un adaptador, la cuantizacion aplicable es la del modelo base sobre el que se cargue (por ejemplo 8-bit o 4-bit con bitsandbytes, o GGUF tras fusionar los pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia; el modelo base se distribuye bajo licencia MIT segun su propia model card) |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |
| Libreria | PEFT 0.19.1, transformers |
| Tipo de adaptador | LoRA |
| Modelo base | microsoft/Phi-3-mini-4k-instruct |
| Tag de pipeline | text-generation |
| Repositorio | 0 descargas, 0 likes, tamano reportado de 0.0 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una tecnica de ajuste eficiente en parametros que congela los pesos del modelo base e inyecta matrices de descomposicion de bajo rango en determinadas capas. El repositorio declara el framework PEFT en su version 0.19.1 y la etiqueta base_model:adapter:microsoft/Phi-3-mini-4k-instruct, lo que confirma la relacion de dependencia con el modelo base. La arquitectura efectiva en inferencia es la del propio Phi-3-mini: un transformer decoder-only denso de 3.800 millones de parametros, disenado por Microsoft para ejecucion local, con una ventana de 4.096 tokens en su variante "4k".

No hay ningun dato publicado sobre el procedimiento de entrenamiento del adaptador. Se desconoce el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos, si hubo etapas de RLHF, DPO o SFT supervisado, el rango (r) y el alpha del LoRA, las capas objetivo, la tasa de aprendizaje, el numero de epocas ni el hardware empleado. El nombre "ReGiFT" sugiere una estrategia de ajuste (posiblemente relacionada con "gift" o con un acronimo propietario), pero no se aporta ninguna explicacion en la model card. El unico dato de infraestructura declarado es la version de PEFT empleada.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational, heredada de la orientacion de instrucciones del modelo base.
- Instrucciones y dialogo multi-turno: capacidad atribuible al modelo base Phi-3-mini-4k-instruct, no verificada especificamente en el adaptador.
- Razonamiento, codigo y matematicas basicas: el modelo base cubre estas areas, pero no hay evidencia publicada de que el adaptador las mejore, las mantenga o las degrade.
- Tool calling / function calling: no disponible. No se declara soporte explicito en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible. No se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible. El modelo base es exclusivamente texto.
- Comportamiento tras el ajuste: no verificable; no se han publicado ejemplos de uso, prompts de referencia ni evaluaciones cualitativas.

## Casos de uso

Dado que no existe documentacion funcional ni evaluacion del adaptador, los casos de uso solo pueden plantearse como escenarios de evaluacion o experimentacion, nunca como aplicaciones en produccion sin validacion previa.

- Experimentacion academica con PEFT: cargar el adaptador sobre Phi-3-mini-4k-instruct con la clase PeftModel de la libreria PEFT para reproducir o inspeccionar el ajuste, siempre que los pesos esten efectivamente disponibles en el repositorio.
- Estudio comparativo de ajustes de bajo rango: emplear el adaptador como punto de comparacion frente a otros LoRA sobre el mismo modelo base, midiendo si el ajuste aporta o degrada capacidades respecto al modelo original.
- Prototipado de asistentes conversacionales locales: si el adaptador funciona, puede integrarse en un asistente de escritorio con contexto de hasta 4.096 tokens, adecuado para对话 de soporte breve, pero requiere validacion manual previa.
- Base para futuras iteraciones: partir de este adaptador para continuar el ajuste con datos propios, aprovechando que los pesos LoRA son pequenos y faciles de recombinar.
- Analisis forense de artefactos PEFT: inspeccionar la configuracion del adaptador (rango, capas objetivo, alpha) para entender decisiones de ajuste, si el archivo de configuracion esta presente.
- Docencia sobre ajuste eficiente: usar el repositorio como ejemplo practico de publicacion de un adaptador LoRA y de los riesgos de documentar deficientemente una model card.
- Despliegue en produccion: no recomendable con la informacion actual, al no existir licencia declarada, ni evaluacion de sesgos, ni garantia de que los pesos esten subidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador contiene la seccion de evaluacion con el marcador "[More Information Needed]" y no se han encontrado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en la busqueda realizada. Tampoco se dispone de mediciones de latencia o throughput especificas del adaptador.

## Requisitos de hardware

Las estimaciones siguientes corresponden al modelo base que el adaptador necesita para funcionar, ya que el adaptador por si solo no puede ejecutar inferencia.

- El adaptador ocupa tipicamente decenas de megabytes en safetensors; el coste real de inferencia lo determina el modelo base de 3.800 millones de parametros.
- VRAM estimada para Phi-3-mini-4k-instruct: aproximadamente 7,6 GB en fp16, en torno a 4 GB en cuantizacion de 8 bits y alrededor de 2,3 a 2,5 GB en cuantizacion de 4 bits (valores aproximados, dependientes de la implementacion y de la longitud de contexto).
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues con concurrencia alta; RTX 4090, RTX 3090, RTX 4080 o RTX 4060 Ti de 16 GB para uso individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en cuantizacion de 4 u 8 bits, y en tarjetas de 16 GB o mas sin cuantizar.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), vLLM con soporte de LoRA, TGI con adaptadores, llama.cpp u Ollama tras fusionar el adaptador con el modelo base mediante merge_and_unload() y convertir a GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones para este adaptador.
- Nota de verificacion: el repositorio declara un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar publicados; conviene comprobar el listado de archivos antes de planificar cualquier despliegue.

## Comparativa con modelos similares

No hay datos de rendimiento del adaptador que permitan una comparativa funcional. La tabla siguiente compara unicamente los modelos base de la misma categoria (transformers densos de 3 a 4 mil millones de parametros orientados a instrucciones), que son los candidatos naturales para alojar adaptadores LoRA de este tipo. Los datos de licencia, parametros y contexto proceden de la documentacion publica de cada modelo base y se ofrecen como referencia, no como evaluacion del adaptador Phi3-ReGiFT.

| Modelo base de referencia | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| microsoft/Phi-3-mini-4k-instruct | 3.800 millones | 4.096 tokens | MIT | Modelo sobre el que se aplica este adaptador |
| meta-llama/Llama-3.2-3B-Instruct | 3.200 millones | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Alternativa con contexto mucho mayor |
| Qwen/Qwen2.5-3B-Instruct | 3.090 millones | 32.768 tokens | Apache 2.0 | Alternativa con licencia permisiva y contexto amplio |

En cuanto al propio adaptador Phi3-ReGiFT, no es posible compararlo con otros adaptadores sobre Phi-3-mini porque se desconoce su comportamiento, su dataset de entrenamiento y su licencia.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla por defecto de HuggingFace sin ningun campo cumplimentado. No hay informacion sobre uso previsto, uso fuera de alcance, sesgos, datos de entrenamiento ni evaluacion.
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base Phi-3-mini-4k-instruct se distribuye bajo MIT, la ausencia de licencia en el adaptador impide determinar si su uso comercial esta permitido. No debe utilizarse en produccion sin aclarar este extremo con el autor.
- Pesos posiblemente ausentes: el tamano del repositorio se reporta como 0.0 GB y no hay descargas registradas, lo que plantea dudas razonables sobre si los archivos del adaptador estan publicados.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje de este tamano. Un ajuste LoRA sin evaluacion puede incrementar o reducir este riesgo de forma no documentada.
- Sesgos: no evaluados. El modelo base Phi-3 hereda sesgos de sus datos de entrenamiento y el adaptador puede haberlos alterado sin que exista analisis alguno.
- Limitacion de contexto: el modelo base soporta 4.096 tokens, muy por debajo de alternativas contemporaneas con ventanas de 32.000 o 128.000 tokens. Esto restringe casos de uso con documentos largos o historiales extensos.
- Idiomas: no declarados. Se desconoce si el ajuste conserva el comportamiento multilingue del modelo base o lo ha especializado en un unico idioma.
- Sin garantias de calidad: al no existir benchmarks, no hay forma de saber si el adaptador mejora, mantiene o degrada las capacidades del modelo base. Cualquier uso en produccion exige una evaluacion propia previa.
- Reproducibilidad: se desconoce si el autor publicara los datos, hiperparametros o scripts de entrenamiento, por lo que el ajuste no es reproducible.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/MinaMila/Phi3-ReGiFT
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Referencia citada en la model card, Lacoste et al. (2019), calculadora de impacto ambiental: https://arxiv.org/abs/1910.09700
- Informe tecnico de la familia Phi-3 (referencia externa no enlazada desde la model card): https://arxiv.org/abs/2404.14219
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a sitios comerciales sin relacion con el artefacto.
