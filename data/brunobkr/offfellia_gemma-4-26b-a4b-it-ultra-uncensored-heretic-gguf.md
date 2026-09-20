# Brunobkr/OFFFELLIA_gemma-4-26B-A4B-it-ultra-uncensored-heretic.gguf

## Resumen

El repositorio `Brunobkr/OFFFELLIA_gemma-4-26B-A4B-it-ultra-uncensored-heretic.gguf` es una publicacion en Hugging Face que, por su nombre, se presenta como una version cuantizada en formato GGUF de un supuesto modelo derivado de la familia Gemma, con nomenclatura "26B-A4B" (26 000 millones de parametros totales, 4 000 millones activos, patron tipico de una arquitectura de mezcla de expertos) y con los sufijos "ultra-uncensored" y "heretic", habituales en ajustes finos orientados a eliminar restricciones de seguridad y sesgos de rechazo. El autor del repositorio es el usuario Brunobkr.

La informacion verificable es practicamente nula: el repositorio declara 0 descargas, 0 likes y un tamano de 0,0 GB, es decir, no contiene pesos descargables en el momento de la consulta. No se declara licencia, ni idiomas, ni pipeline, ni configuracion de cuantizacion en los metadatos de Hugging Face. La model card incluida no describe el modelo de lenguaje, sino un fork de `llama.cpp` denominado "ΩFFFΣLLIa • llama.cpp • AlgMor24" (con instrucciones de compilacion con Vulkan, una interfaz web en SvelteKit/Vite y un motor agentico), de modo que el contenido del README no corresponde al artefacto anunciado.

La relevancia actual de esta ficha es, por tanto, fundamentalmente critica: sirve como ejemplo de publicacion incompleta y no reproducible, donde el nombre del modelo promete una arquitectura y un comportamiento concretos que no pueden contrastarse con ningun dato tecnico publicado. Cualquier evaluacion seria exige localizar el modelo base real (presumiblemente un Gemma con arquitectura MoE y 4B de parametros activos) y verificar su licencia antes de considerarlo para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere mezcla de expertos, MoE, por el sufijo "A4B"; no confirmado) |
| Parametros totales | no disponible (el nombre declara 26B; no verificado) |
| Parametros activos | no disponible (el nombre declara 4B; no verificado) |
| Longitud de contexto | no disponible (la model card menciona `-c 50000` como parametro de arranque del servidor, no como contexto nativo del modelo) |
| Tipos de cuantizacion | no disponible en los metadatos; el nombre del archivo y el ejemplo de la model card mencionan GGUF con cuantizacion IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible en Hugging Face; la model card del fork de llama.cpp declara MIT, pero esa licencia corresponde al fork, no al modelo |
| Formato de pesos | GGUF (segun extension del repositorio); el repositorio declara 0,0 GB, por lo que no hay pesos publicados |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la informacion disponible. El identificador sugiere un transformer con mezcla de expertos (MoE) y 4 000 millones de parametros activos sobre un total de 26 000 millones, patron que en la familia Gemma corresponde a variantes eficientes en inferencia, pero no hay ningun documento, configuracion (`config.json`) ni ficha tecnica que lo confirme. Tampoco se indica el modelo base exacto sobre el que se habria realizado el ajuste fino.

Respecto al entrenamiento, no hay datos sobre numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion. Los sufijos "ultra-uncensored" y "heretic" indican, en la practica habitual de la comunidad, la aplicacion de tecnicas de ablacion direccional o ajuste fino para reducir las tasas de rechazo, pero se desconoce el metodo concreto, los datos empleados y si se preservaron las capacidades originales del modelo base.

## Capacidades

- Generacion de texto conversacional: no confirmada por documentacion; se infiere del sufijo "it" (instruction tuned) del nombre.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible; la model card menciona soporte FIM (Fill-in-the-Middle) y decodificacion especulativa, pero se refiere al servidor de inferencia, no al modelo.
- Tool calling / function calling: no disponible a nivel de modelo; la model card cita integracion MCP y `--tools all` como funciones del servidor.
- Capacidades agenticas y razonamiento multi-paso: no disponible a nivel de modelo; el "motor agentico multi-turn" descrito pertenece al fork de llama.cpp.
- Capacidades multilingues: no disponible.
- Capacidad especial declarada de forma implicita: comportamiento "sin censura" (uncensored), que en la practica implica menor tasa de rechazo ante peticiones sensibles, pero tambien mayor riesgo de generar contenido inapropiado o danino.

## Casos de uso

Advertencia previa: dado que el repositorio no contiene pesos (0,0 GB) ni documentacion tecnica, los casos siguientes son hipoteticos y solo serian aplicables si se localizase el modelo base real y se verificase su licencia.

- Experimentacion en laboratorio de alineacion: el modelo serviria como caso de estudio de tecnicas de ablacion de rechazo ("uncensoring"), comparando su tasa de negativas frente al modelo base original en un conjunto fijo de prompts.
- Analisis de robustez y seguridad: util para probar sistemas de moderacion, clasificadores de contenido y filtros de salida frente a un generador con menor tendencia al rechazo.
- Evaluacion de cuantizacion GGUF: si los pesos existieran, permitiria medir la degradacion de calidad entre la version completa y su cuantizacion IQ4_NL en tareas de generacion y razonamiento.
- Despliegue local en estaciones de trabajo: con 4B de parametros activos, un MoE de este tipo es candidato a ejecucion en GPU de consumo mediante llama.cpp u Ollama, siempre que el archivo GGUF sea accesible.
- Procesamiento por lotes de texto en infraestructura propia: cualquier tarea de resumen, extraccion o clasificacion donde el operador asuma la responsabilidad legal del contenido generado sin filtros.
- Desarrollo de interfaces de inferencia: el ecosistema descrito en la model card (servidor con WebUI, MCP y modo agentico) puede emplearse como banco de pruebas para integrar modelos GGUF en herramientas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion en los metadatos de Hugging Face ni en la model card. Cualquier cifra que se atribuya a este repositorio debe considerarse no verificada.

## Requisitos de hardware

- VRAM estimada: no disponible. No hay pesos publicados y, por tanto, no existe un consumo medido. Como referencia aritmetica no verificada, 26 000 millones de parametros a 4,5 bits por parametro (IQ4_NL) implicarian del orden de 14-16 GB de pesos en disco, mas la cache KV.
- GPU recomendadas: no disponible. Si se confirma la arquitectura MoE con 4B activos, el modelo podria caber en GPU de consumo con 16-24 GB (RTX 4090, RTX 3090, RTX 4080) descargando parte de los expertos a CPU; en entornos profesionales serian adecuadas A100 40/80 GB o H100 para servicio concurrente.
- Cabe en GPU de consumo: no confirmado; probablemente si, con cuantizacion de 4 bits y descarga parcial de expertos a memoria del sistema.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y potencialmente vLLM o TGI si se convierte a safetensors, aunque no se documenta soporte.
- Latencia y throughput: no disponible. La model card propone parametros de arranque (`-ngl 99`, `--n-cpu-moe 99`, `-c 50000`, `--parallel 1`, `--fa on`) que sugieren un despliegue orientado a un unico usuario en hardware hibrido CPU/GPU, no a servicio de alta concurrencia.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque se desconoce el modelo base real, su licencia y sus pesos. La tabla siguiente recoge unicamente lo que puede contrastarse.

| Modelo | Parametros | Contexto | Licencia | Pesos publicados | Datos verificables |
|---|---|---|---|---|---|
| Brunobkr/OFFFELLIA_gemma-4-26B-A4B-it-ultra-uncensored-heretic.gguf | 26B totales / 4B activos segun nombre, no verificado | no disponible | no disponible | no (0,0 GB) | practicamente nulos |
| Modelo base Gemma declarado en el nombre | no disponible | no disponible | no disponible | no aplica | no identificado |
| Alternativas de la misma categoria (MoE de ~26B con ~4B activos) | no disponible | no disponible | no disponible | no aplica | no procede comparar sin datos del objeto de estudio |

## Limitaciones y advertencias

- Repositorio vacio: el tamano declarado es de 0,0 GB, por lo que no hay artefacto descargable ni reproducible. Cualquier integracion es imposible en el estado actual.
- Model card no correspondiente: el README describe un fork de `llama.cpp` con interfaz web y motor agentico, no un modelo de lenguaje. No hay informacion sobre el modelo en si.
- Licencia indeterminada en el nivel de modelo: la licencia MIT citada pertenece al fork del servidor de inferencia. Usar los pesos derivados de Gemma exige respetar la licencia del modelo base (Gemma Terms of Use), que impone restricciones de uso, incluida una politica de uso prohibido. Sin confirmacion, el uso comercial no esta autorizado.
- Riesgo elevado de contenido danino: los sufijos "uncensored" y "heretic" implican un ajuste deliberado para reducir rechazos, lo que incrementa la probabilidad de generar contenido ofensivo, ilegal, medico o legalmente arriesgado. No es apto para aplicaciones de cara al publico sin capas adicionales de moderacion.
- Alucinacion: al no existir evaluaciones publicadas, no hay medida de la tasa de alucinacion; los ajustes agresivos de "uncensoring" suelen degradar la calibracion y la fidelidad factual.
- Idiomas: sin declaracion de idiomas soportados; el castellano no esta garantizado.
- Contexto: el valor `-c 50000` de la model card es una configuracion de servidor, no el contexto nativo del modelo. Confundirlos puede provocar truncamientos o degradacion severa en la parte final de la ventana.
- Trazabilidad: no se especifica el modelo base, el dataset de ajuste ni el procedimiento de cuantizacion, lo que impide auditar sesgos o reproducir resultados.
- Busqueda web sin resultados utiles: las consultas devolvieron unicamente enlaces genericos a YouTube, sin ninguna referencia tecnica al modelo.
- Sin senales de adopcion: 0 descargas y 0 likes, junto con una fecha de actualizacion muy proxima a la de creacion, indican un artefacto no validado por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Brunobkr/OFFFELLIA_gemma-4-26B-A4B-it-ultra-uncensored-heretic.gguf
- Fork de llama.cpp citado en la model card: https://github.com/brunoconta1980-tech/OFFFELLIA_llama_ROCmFPX
- Proyecto base citado en los agradecimientos: https://github.com/charlie12345/ROCmFPX
- Paper del modelo base: no disponible
- Blog o anuncio oficial: no disponible
- Demo o espacio interactivo: no disponible
