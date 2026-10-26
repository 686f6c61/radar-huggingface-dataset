# ibyteohdear/ltx-2.5-distilled-lora-450-reduced-ceil256

## Resumen

`ibyteohdear/ltx-2.5-distilled-lora-450-reduced-ceil256` es un adaptador LoRA derivado del LoRA oficial de destilación de Lightricks para su modelo de generación de vídeo LTX-2.5. No es un modelo autónomo: es un fichero de pesos que se carga junto al modelo base y que habilita muestreo en pocos pasos ("turbo"), típicamente con el schedule oficial de 8 pasos y un peso de aproximadamente 0,8. Su interés reside en que reduce el rango de los 1660 módulos del LoRA original mediante una SVD factorizada con truncamiento a un 90 % de energía de Frobenius y un techo de rango 256.

El resultado es un fichero de 4,01 GB frente a los 8,9 GB del LoRA de rango 450 del que parte, manteniendo el mismo formato de claves y, por tanto, siendo intercambiable donde cargue el original. El coste de esa reducción es capacidad de adaptación en los módulos más afectados: el 38 % de los módulos queda limitado por el techo de rango y el peor módulo conserva un 76,7 % de la energía de Frobenius. La energía retenida global es de 0,870 y el error global de 0,361, según el informe de la receta `fro90_ceil256`.

Es relevante ahora porque los adaptadores de destilación para modelos de vídeo de gran tamano son voluminosos y complican el despliegue y la distribución; esta variante recortada casi a la mitad el peso del artefacto sin romper la compatibilidad con el pipeline que ya carga el LoRA original. Se trata de un derivado modificado, no de una publicación oficial de Lightricks, y su licencia de comunidad debe acompanar cualquier redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion de video Lightricks LTX-2.5 |
| Parametros totales | No aplica como modelo autonomo; el adaptador cubre 1660 modulos. El modelo base figura como "22b" en el nombre del fichero fuente `ltx-2.5-22b-distilled-lora-450-bf16.safetensors` (no confirmado en la informacion disponible) |
| Parametros activos | No es un modelo MoE |
| Longitud de contexto | No disponible (modelo de video; no se documenta la ventana del codificador de texto) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors y la fuente se declara en bf16 |
| Idiomas soportados | No disponible |
| Licencia | LTX-2.x Community License (`license_name: ltx-2.5-community-license`) |
| Formato de pesos | safetensors (repositorio de 4,0 GB) |
| Modelo base | `Lightricks/LTX-2.5` |
| Receta de reduccion | `fro90_ceil256`: SVD factorizada, 90 % de energia de Frobenius, techo de rango 256 |
| Rango | 450 -> 164,9 de media (techo 256); 38 % de modulos limitados por el techo |
| Tamano de fichero | 4,01 GB (frente a 8,9 GB del LoRA de rango 450) |
| Uso recomendado | Peso ~0,8 con el schedule oficial de 8 pasos (sigma) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de destilación, no un modelo entrenado desde cero. Cada modulo del LoRA original se representa como el producto `B @ A`; el autor aplica una truncacion por SVD factorizada (QR de ambos factores mas SVD del nucleo, es decir, la aproximacion optima de rango k) conservando valores singulares hasta alcanzar el 90 % de la energia de Frobenius, con un limite duro de rango 256 y una salvaguarda de condicionamiento numerico. El proceso se aplica a los 1660 modulos del fichero de origen, generado a partir de `ltx-2.5-22b-distilled-lora-450-bf16.safetensors` via `ibyteohdear/Lightricks-LTX-2`.

No hay entrenamiento nuevo ni datos adicionales: la "destilacion" del nombre procede del LoRA original, que ensena al modelo base a producir muestras validas en pocos pasos. La innovacion tecnica de este derivado es puramente de compresion: no se anaden capas ni se altera el formato de claves, de modo que el adaptador es intercambiable con el original. Las metricas de fidelidad publicadas (energia retenida global 0,870, error global 0,361, mediana de energia retenida por modulo 0,900, percentil 5 de 0,815 y peor modulo de 0,767) describen la reconstruccion de la matriz de actualizacion, no la calidad del video generado, que no se evalua en la model card.

## Capacidades

- Adaptacion de un modelo de difusion de video para muestreo en pocos pasos ("turbo") con el schedule oficial de 8 pasos.
- Generacion de video condicionada por texto a traves del modelo base LTX-2.5 (la calidad final depende del base, no del adaptador).
- Carga directa en cualquier pipeline que acepte el LoRA de destilacion original, gracias a mantener el mismo formato de claves.
- Composicion con otros adaptadores y pesos de escala, ya que se comporta como un LoRA convencional.
- Reduccion del espacio en disco y del ancho de banda de distribucion del adaptador: 4,01 GB frente a 8,9 GB.
- Ajuste fino del compromiso calidad/eficiencia variando el peso de aplicacion alrededor de 0,8.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento: no aplica a un adaptador de difusion de video.

## Casos de uso

- Prototipado rapido de text-to-video: cargar el LoRA con peso ~0,8 y 8 pasos permite iterar sobre prompts con un coste de muestreo bajo antes de comprometerse a una generacion de mayor calidad.
- Despliegue en entornos con almacenamiento limitado: sustituir el LoRA de 8,9 GB por este de 4,01 GB libera casi 5 GB por instancia en imagenes de contenedor o cache de modelos.
- Distribucion de artefactos a equipos de artistas: el fichero reducido viaja mejor en repositorios internos y en descargas recurrentes de estaciones de trabajo.
- Investigacion sobre compresion de adaptadores: el propio caso de uso del autor, comparando la energia retenida por modulo con la calidad perceptible del video resultante.
- Generacion de storyboards y previsualizaciones en postproduccion: clips de borrador rapidos que luego se regeneran con el LoRA completo si hace falta mas fidelidad.
- Pruebas A/B de prompts a granel: al reducir el coste por muestra, se pueden barrer decenas de variaciones de prompt sobre el mismo modelo base.
- Integracion en flujos de ComfyUI o Diffusers que ya cargan el LoRA original, sin cambios de codigo ni de nombres de claves.
- Docencia y demos: un adaptador mas ligero simplifica la puesta en marcha de ejemplos de video generativo en talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de generacion de video en la informacion disponible. Las unicas metricas publicadas son de fidelidad de la aproximacion matricial, copiadas del informe `ltx-2.5-22b-distilled-lora-450-bf16_fro90_ceil256_report.json`:

| Metrica | Valor |
|---|---|
| Modulos adaptados | 1660 |
| Rango medio | 164,9 (techo 256) |
| Modulos limitados por el techo | 38 % |
| Energia de Frobenius retenida (mediana por modulo) | 0,900 |
| Energia retenida, percentil 5 | 0,815 |
| Energia retenida, peor modulo | 0,767 |
| Energia retenida global | 0,870 |
| Error global | 0,361 |
| Tamano de fichero | 4,01 GB |

No hay datos de MMLU, HumanEval, GSM8K ni de metricas de video (FVD, CLIP score, VBench) en la informacion proporcionada; no deben extrapolarse las cifras anteriores a calidad de generacion.

## Requisitos de hardware

- El adaptador por si solo ocupa 4,01 GB en disco; en VRAM, una vez cargado, se suma a los pesos del modelo base.
- VRAM del modelo base: no disponible de forma oficial. Como referencia aproximada, un modelo de ~22B en bf16 requiere del orden de 44 GB solo para pesos, a los que se suman activaciones y cache de atencion propios de la difusion de video; estas cifras son una estimacion a partir del nombre del fichero fuente, no un dato confirmado.
- GPU de datacenter recomendadas para el base en bf16: H100 80 GB o A100 80 GB; configuraciones multi-GPU si no cabe una sola tarjeta.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar el base en bf16 sin cuantizacion u offloading; no se documentan en esta ficha recetas de cuantizacion del base.
- Opciones de despliegue: el adaptador es "drop-in" donde cargue el LoRA de destilacion original; no se especifican en la informacion disponible frameworks concretos (Diffusers, ComfyUI, vLLM, llama.cpp u otros).
- Latencia y throughput: no disponibles. Cualitativamente, el schedule de 8 pasos reduce el numero de evaluaciones del modelo frente a schedules largos, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano de fichero | Rango | Notas | Licencia |
|---|---|---|---|---|---|
| Este LoRA (`fro90_ceil256`) | LoRA de destilacion con rango reducido | 4,01 GB | 450 -> 164,9 de media (techo 256) | Energia retenida global 0,870; error 0,361 | LTX-2.x Community License |
| LoRA original de rango 450 | LoRA de destilacion completo | 8,9 GB | 450 | Referencia sin truncar; misma compatibilidad de claves | LTX-2.x Community License |
| `Lightricks/LTX-2.5` (base) | Modelo de difusion de video | No disponible | No aplica | Sin destilar; requiere schedule completo | LTX-2.x Community License |
| Otros LoRA de destilacion para LTX-2.5 | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible |

## Limitaciones y advertencias

- Es un derivado modificado: todos los tensores `lora_A` / `lora_B` del LoRA oficial han sido truncados. No es una publicacion oficial de Lightricks y no cuenta con su validacion.
- Perdida de capacidad en los modulos con techo de rango: el 38 % de los modulos queda limitado a rango 256 o menos, y el peor modulo conserva solo el 76,7 % de la energia de Frobenius.
- No se aporta ninguna evaluacion de calidad de video: no hay evidencia publicada de que el resultado visual sea equivalente al LoRA completo con peso 0,8 y 8 pasos.
- El peso recomendado (~0,8) esta calibrado para el schedule oficial de 8 pasos; otros valores de peso o de schedule pueden degradar la salida sin aviso.
- Solo es valido junto a `Lightricks/LTX-2.5`: no funciona con otras versiones de la familia ni con modelos de video de terceros.
- Licencia LTX-2.x Community License: es una licencia "other" con terminos especificos que deben revisarse antes de uso comercial, y debe redistribuirse junto con cualquier copia de los pesos.
- Sin adopcion ni validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta.
- No se documentan sesgos, riesgos de alucinacion visual ni limitaciones idiomaticas del codificador de texto; heredara los del modelo base, que no se detallan aqui.
- No hay informacion sobre cuantizaciones, precision final de los tensores ni requisitos de version de las librerias de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ibyteohdear/ltx-2.5-distilled-lora-450-reduced-ceil256
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia LTX-2.x Community License: https://huggingface.co/Lightricks/LTX-2.5
- Repositorio de origen del LoRA completo: `ibyteohdear/Lightricks-LTX-2` (referenciado en la model card; URL exacta no disponible)
- Informe de la receta de reduccion: `ltx-2.5-22b-distilled-lora-450-bf16_fro90_ceil256_report.json` (referenciado en la model card; URL exacta no disponible)
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada
