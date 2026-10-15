# RunningHubAI/rh-oldify-lora

## Resumen

rh-oldify-lora es un adaptador LoRA de edicion de imagen orientado a modificar la edad aparente de las personas retratadas, es decir, a envejecer rostros de forma controlada por texto. Lo publica la plataforma RunningHubAI a partir de un modelo del usuario identificado como @T8star-Aix, y se distribuye como un unico fichero de pesos `Oldify.safetensors` de 492 MiB dentro de un repositorio de 0,5 GB. El pipeline declarado es `image-text-to-image`, con etiquetas `comfyui` y `lora`, lo que lo situa en el ecosistema de ComfyUI mas que en el de librerias de texto.

El adaptador se ha afinado sobre un modelo base denominado "F1基础-Kontext" y su unica palabra de activacion documentada es la frase en ingles `change the age`. El autor remite al proyecto original publicado en Civitai (Oldify, modelo 1765574) y a la ficha equivalente dentro de RunningHub, donde puede ejecutarse en linea o mediante API. No se publican datos de arquitectura del adaptador, rango, modulos objetivo, conjunto de entrenamiento ni resultados de evaluacion.

Su relevancia practica es la de un componente especializado y ligero (menos de 500 MiB) que se acopla a un modelo de difusion de tipo Kontext para producir ediciones de envejecimiento facial preservando la identidad del sujeto, algo util en previsualizacion de VFX, entretenimiento y demostraciones de envejecimiento con fines divulgativos. Al no haber licencia declarada ni model card tecnica, su adopcion en produccion exige verificar antes los terminos del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion de edicion de imagen de la familia Kontext; modelo base declarado: "F1基础-Kontext". Rango, alpha y modulos objetivo: no disponible |
| Parametros totales | no disponible (el repositorio solo indica un fichero de pesos de 492 MiB; no se especifica el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publica el peso en safetensors sin cuantizar) |
| Idiomas soportados | no disponible; la unica palabra de activacion documentada esta en ingles (`change the age`) |
| Licencia | no disponible; el autor conserva el copyright y remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`Oldify.safetensors`, 492 MiB) |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Palabra de activacion | `change the age` |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,5 GB |
| Fecha de publicacion | 15 de octubre de 2026 (creacion); ultima actualizacion el mismo dia |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador ni la del modelo base mas alla de su nombre ("F1基础-Kontext"), que lo situa en la familia de modelos de edicion de imagen Kontext, un esquema de difusion con transformador y formulacion de flujo rectificado en el que las instrucciones textuales y la imagen de entrada se procesan conjuntamente para producir la imagen editada. El LoRA actua sobre ese modelo congelado, de modo que su funcion es desplazar el comportamiento del generador hacia la transformacion de edad, no sustituirlo.

No se han publicado datos sobre el conjunto de entrenamiento: ni el numero de imagenes, ni su procedencia, ni la resolucion, ni si hubo etapas de aprendizaje supervisado, preferencia o ajuste fino adicional. Tampoco se documenta el rango del adaptador, los modulos atacados ni el coste de entrenamiento. El unico dato operativo es la palabra de activacion `change the age`, que sugiere un entrenamiento con pares de imagenes de la misma persona en distintos rangos de edad y una consigna textual fija.

## Capacidades

- Edicion de imagen guiada por texto: transforma la edad aparente del sujeto a partir de una instruccion y una imagen de entrada.
- Envejecimiento facial: es la funcion explicita del modelo; la palabra de activacion `change the age` debe acompanarse de la indicacion de edad deseada en el prompt.
- Preservacion de identidad: al ser un LoRA de edicion sobre un modelo Kontext, la edicion se aplica sobre la imagen original en lugar de generar un sujeto nuevo, aunque no hay evaluacion publicada que cuantifique dicha preservacion.
- Integracion con flujos de ComfyUI: se carga como nodo de LoRA dentro de un grafo que incluya el modelo base Kontext correspondiente.
- Ejecucion en linea y via API: disponible a traves de la plataforma RunningHub y de su API documentada.
- Compatibilidad con Hugging Face: el peso puede descargarse e integrarse en entornos locales que soporten safetensors.
- Tool calling / function calling: no aplica; es un modelo de imagen, no un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues, de codigo, matematicas, vision semantica o audio: no disponibles.

## Casos de uso

- Previsualizacion de maquillaje de envejecimiento en produccion audiovisual: antes de contratar horas de protesis y caracterizacion, el equipo de VFX puede aplicar el LoRA sobre fotografias de vestuario y localizacion para validar el aspecto del personaje en cada decada, reduciendo iteraciones costosas.
- Storyboards y animaticas con personajes en varias epocas: en guiones que abarcan saltos temporales, el LoRA permite generar una version envejecida del mismo actor para cada etapa, manteniendo la coherencia visual entre planos.
- Filtros de edad en aplicaciones de consumo: una app movil o web puede usar el adaptador (492 MiB, viable junto a un modelo base cuantizado) para ofrecer una funcion de "como seras en el futuro" sin entrenar nada propio.
- Campanas de divulgacion sanitaria: simulaciones del efecto del tabaquismo, la exposicion solar o el envejecimiento cutaneo sobre retratos reales de participantes, con la ventaja de que el modelo parte de la imagen original y no de una cara generada.
- Ilustracion de personajes para narrativa y videojuegos: generacion de variantes de edad de un mismo personaje para guiones ramificados, fichas de rol o contenido episodico, reutilizando una unica referencia facial.
- Restauracion y proyectos familiares: recrear como podria haber sido un familiar en una etapa determinada, o proyectar su aspecto actual, partiendo de fotografias antiguas.
- Investigacion sobre percepcion de edad: crear estimulos controlados en los que solo cambia la edad aparente y mantener constante la identidad, para estudios de psicologia social sobre sesgos de edad.
- Demostraciones y marketing en plataformas sin GPU: mediante la API de RunningHub o su interfaz web, el LoRA se puede ejecutar sin infraestructura local, lo que sirve para prototipos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye metricas cuantitativas (ni FID, ni LPIPS, ni evaluacion de preservacion de identidad tipo ID similarity, ni comparaciones con otros LoRA de envejecimiento). Tampoco se documentan ejemplos de salida con resolucion, pasos de muestreo, escala de clasificador libre o tiempo de inferencia.

## Requisitos de hardware

- Dependencia critica: el consumo de recursos lo determina el modelo base "F1基础-Kontext", no el LoRA. El adaptador anade 492 MiB de pesos sobre el modelo base ya cargado; no hay datos publicados sobre la arquitectura del base.
- Estimacion orientativa (condicionada a un modelo base de clase Kontext de aproximadamente 12.000 millones de parametros, cifra no confirmada por el autor):
  - Precisión FP16/BF16: del orden de 24 GB de VRAM.
  - Cuantizacion de 8 bits: del orden de 12-16 GB de VRAM.
  - Cuantizaciones GGUF Q4/Q5 (si el modelo base las soporta): del orden de 8-10 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia en precision completa; RTX 4090 de 24 GB para FP16 con resoluciones moderadas; RTX 3090 de 24 GB como alternativa de coste.
- Tarjetas de consumo: previsiblemente viables en RTX 4090, RTX 3090, RTX 4080 y modelos con 12-16 GB si se emplea cuantizacion; en GPU de 8 GB la viabilidad depende de cuantizaciones agresivas del modelo base y no esta documentada.
- Opciones de despliegue: ComfyUI (entorno nativo del LoRA), la propia plataforma RunningHub en web o mediante API, e integracion manual en Hugging Face Diffusers si el modelo base Kontext correspondiente esta soportado en esa libreria. No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI, que son herramientas para modelos de lenguaje y no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia por imagen, numero de pasos recomendado, ni resolucion de entrenamiento del adaptador.

## Comparativa con modelos similares

No se dispone de datos tecnicos de modelos comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa (parametros, contexto, metricas, licencia) con alternativas de la misma categoria. La unica referencia verificable es el propio proyecto original de Oldify publicado por el autor en Civitai, que corresponde a la misma pieza y no a una alternativa independiente.

| Modelo | Tipo | Parametros | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| rh-oldify-lora (RunningHubAI) | LoRA de edicion de imagen (envejecimiento) | no disponible (peso de 492 MiB) | no disponible | no publicados |
| Oldify original (Civitai, modelo 1765574) | Modelo de envejecimiento publicado por el autor en Civitai | no disponible | se remite a la licencia del proyecto original | no publicados |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan datos de entrenamiento, composicion del dataset, rango del LoRA, modulos objetivo ni resolucion de trabajo, lo que impide auditar el comportamiento del adaptador.
- Sesgos previsibles: al tratarse de un modelo de edicion facial, las variaciones en el resultado segun tono de piel, edad de partida, genero, etnia, iluminacion y calidad de la imagen de entrada son esperables; no hay evaluacion publicada que las cuantifique.
- Riesgo de artefactos: los LoRA de envejecimiento suelen introducir texturas de piel, arrugas o cambios de iluminacion poco realistas y pueden degradar detalles como el cabello, la ropa o el fondo de la escena; no se verifica ninguna salvaguarda en la informacion disponible.
- Riesgo de perdida de identidad: aunque el objetivo sea editar sobre la imagen original, no hay metricas de similitud facial publicadas que garanticen que el sujeto sigue siendo reconocible tras la edicion.
- Licencia no declarada: la ficha indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream. Sin esa licencia explicitada, no queda claro si se permite uso comercial, redistribucion o despliegue en servicios de pago; se debe verificar en Civitai y en la plataforma de origen antes de cualquier uso en produccion.
- Dependencia del modelo base: el LoRA solo funciona con el modelo base para el que fue entrenado ("F1基础-Kontext"); cargarlo sobre otro modelo Kontext o sobre otra familia puede producir resultados degenerados.
- Idiomas: la palabra de activacion esta en ingles y no hay evidencia de comportamiento con consignas en castellano u otras lenguas.
- Fecha de publicacion atipica: la ficha registra creacion y actualizacion el 15 de octubre de 2026, posteriores a esta revision; conviene comprobar si el repositorio se ha actualizado desde entonces.
- Cero traccion verificable: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado problemas o validado la calidad del resultado.
- Contenido generado: aplicar el modelo sobre rostros de terceros puede afectar a derechos de imagen y a normativa de datos personales; el uso responsable recae enteramente en quien lo despliega.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-oldify-lora
- Fichero de pesos: https://huggingface.co/RunningHubAI/rh-oldify-lora/blob/main/Oldify.safetensors
- README en chino: https://huggingface.co/RunningHubAI/rh-oldify-lora/blob/main/README_cn.md
- Proyecto original en Civitai: https://civitai.com/models/1765574/oldify?modelVersionId=1998093
- Pagina del modelo en RunningHub: https://www.runninghub.cn/model/public/1946431817093115906
- Perfil del autor en RunningHub: https://www.runninghub.cn/user-center/1819214514410942465
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Paper asociado: no disponible
- Repositorio de codigo: no disponible
- Demo interactiva fuera de RunningHub: no disponible
