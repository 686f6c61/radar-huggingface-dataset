# oteam/esmfold2-experimental-fast-base600m-step750k

## Resumen

ESMFold2 es un modelo de predicción de estructura biomolecular todo-átomo y de diseño de secuencias de binders de proteína, condicionado por representaciones del modelo de lenguaje de proteínas ESMC. Este repositorio concreto, `oteam/esmfold2-experimental-fast-base600m-step750k`, es un checkpoint de escalado de la rama Experimental-Fast: 24 bloques de plegamiento, sin condicionamiento por MSA y con 746.187.472 parámetros según los pesos safetensors publicados (3,0 GB de repositorio). Forma parte de una serie de 15 checkpoints `Fast-base{300M,600M,6B}-step{250,500,750,1000,1500}k`, de los que este corresponde al paso 750k sobre una base de 600M.

El modelo lo publica el usuario `oteam` como implementación no oficial de ESMFold2 dentro de la librería OFoldX. Los autores originales del paper (Biohub) no han escrito, revisado ni avalado esta implementación ni su model card, lo que conviene tener presente antes de usarla en producción. La arquitectura combina un ESMC congelado que aporta las representaciones de secuencia, un tronco de plegamiento recurrente que actualiza características de token y de par, y una cabeza de difusión que genera coordenadas antes de que las cabezas de distograma y confianza puntúen el resultado.

Su relevancia es doble: por un lado, la variante Fast prescinde de MSA, lo que elimina una dependencia costosa en pipelines de alto rendimiento; por otro, al ser un checkpoint experimental de una serie de escalado, sirve para estudiar cómo escala el plegamiento con el tamaño de la base y el número de pasos de entrenamiento. La licencia es AGPL-3.0, con las obligaciones de copyleft que ello implica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de plegamiento recurrente todo-átomo condicionado por ESMC, con cabeza de difusión para la generación de coordenadas y cabezas de distograma y confianza |
| Parámetros totales | 746.187.472 (recuento real de los safetensors del repositorio); la tabla del autor asigna 6.531,17 M a la variante Experimental Fast, cifra que incluye el ESMC 6B congelado |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es una ventana de contexto de lenguaje. La longitud máxima de secuencia procesable no se documenta |
| Tipos de cuantización | No disponible; solo se publican pesos safetensors y no se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | No disponible; modelo biológico, no lingüístico. La entrada es una secuencia de proteína en código de una letra |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Bloques de plegamiento | 24 (variante Fast) |
| MSA | No (single-sequence) |
| Tamaño de single / pair / atom / token | 384 / 256 / 128 / 768 |
| Actualizaciones recurrentes | 4 |
| Pasos de muestreo (difusión) | 14 |
| Librería | ofoldx |
| Tamaño del repositorio | 3,0 GB |

## Arquitectura y entrenamiento

ESMFold2 es una arquitectura híbrida de plegamiento: un modelo de lenguaje de proteínas ESMC congelado (6B en la especificación de la familia) genera las representaciones de secuencia, un tronco recurrente de plegamiento actualiza de forma iterativa las características de token y de par (4 actualizaciones recurrentes en esta variante), y una cabeza de difusión produce las coordenadas atómicas en 14 pasos de muestreo. Sobre las coordenadas generadas, una cabeza de distograma y una cabeza de confianza puntúan y filtran el resultado. La variante Fast reduce el tronco a 24 bloques y elimina el condicionamiento por MSA, lo que la convierte en un modelo estrictamente single-sequence.

Las variantes experimentales exponen además el modelo de inversión diferenciable empleado para el diseño de secuencias de binders de proteína. Este checkpoint concreto (`base600m-step750k`) es el que la model card describe como modelo fast experimental usado para la optimización de secuencias de binders. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO (previsiblemente no aplicables a un modelo de estructura). La model card detalla un contrato geométrico estricto: los límites de coordenadas consumen una proyección numérica finita explícita, los valores no disponibles se seleccionan bajo máscara antes de cualquier operación aritmética o conversión de tipo, y los valores no finitos activos se consideran peticiones inválidas.

## Capacidades

- Predicción de estructura todo-átomo de biomoléculas a partir de secuencia, incluyendo proteínas (representante CB, después CA y después el primer átomo admitido) y ácidos nucleicos (C4 para clases púricas, C2 para el resto de clases conocidas, C1′ en clases desconocidas).
- Plegamiento single-sequence sin MSA en esta variante, adecuado para secuencias sin homólogos conocidos o para cribado a gran escala.
- Generación de coordenadas mediante difusión con 14 pasos de muestreo y 4 actualizaciones recurrentes del tronco.
- Puntuación de confianza y cálculo de distogramas sobre la estructura generada.
- Diseño de secuencias de binders de proteína mediante el modelo de inversión diferenciable expuesto en las variantes experimentales.
- Modelado de complejos diana–binder, construidos como dos cadenas proteicas lineales frescas a partir de la secuencia de la diana en código de una letra.
- Decodificación basada en correspondencias de átomos preparadas, con gestión explícita de componentes cuyo etiquetado biológico no coincide con sus átomos reales.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje; no es un modelo generativo de texto.

## Casos de uso

- Plegamiento de proteínas sin homólogos conocidos: al prescindir de MSA, el modelo puede aplicarse a secuencias huérfanas o de metagenómica donde no existe alineamiento múltiple disponible, usando la llamada `pipeline.fold("SECUENCIA")` de ofoldx.
- Cribado estructural de alto rendimiento: con 24 bloques frente a los 48 de la variante completa y sin etapa de MSA, el coste por secuencia se reduce y el modelo encaja en pipelines que deben procesar miles de secuencias en lotes.
- Diseño de binders de proteína: este checkpoint está descrito como el modelo fast experimental empleado para la optimización de secuencias de binders, de modo que se usaría dentro del bucle de optimización de secuencias contra una diana definida por su secuencia de una letra.
- Generación de modelos iniciales para refinamiento posterior: las coordenadas y los distogramas producidos pueden servir como punto de partida para métodos de dinámica molecular o de refinamiento basado en física.
- Estudio del escalado de modelos de plegamiento: al formar parte de la serie `Fast-base{300M,600M,6B}-step{250,500,750,1000,1500}k`, permite comparar el efecto del tamaño de base y del número de pasos sobre la calidad estructural manteniendo el resto del pipeline constante.
- Anotación estructural en proyectos de biología computacional: integración en scripts de Python mediante `ofoldx` para enriquecer anotaciones funcionales con estructura predicha y puntuaciones de confianza.
- Modelado de complejos proteína–proteína: construcción de complejos diana–binder como dos cadenas lineales para explorar hipótesis de interacción antes de validación experimental.
- Prototipado con recursos limitados: con 746 M de parámetros en los pesos publicados, es viable en entornos de una sola GPU donde un modelo de 6,5 B no cabría con comodidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enlaza al paper «Language Modeling Materializes a World Model of Protein Biology», pero no se incluyen en el repositorio métricas como RMSD, GDT-TS, lDDT, pLDDT ni comparaciones cuantitativas con otras variantes o con modelos de la competencia.

## Requisitos de hardware

- VRAM estimada para los pesos del checkpoint: unos 3,0 GB en fp32 (coherente con los 3,0 GB del repositorio y 746 M de parámetros), aproximadamente 1,5 GB en bf16/fp16, 0,75 GB en int8 y 0,4 GB en int4. Son estimaciones a partir del recuento de parámetros; no hay cuantizaciones publicadas.
- VRAM adicional para el ESMC congelado: la especificación de la familia indica un ESMC de 6B, que en bf16 supondría del orden de 12 GB adicionales. Esta cifra es una estimación, no un dato publicado para este checkpoint.
- GPU recomendadas: A100 de 40 u 80 GB y H100 para lotes grandes y secuencias largas; RTX 4090 o RTX 3090 de 24 GB para inferencia single-sequence en bf16.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas de 24 GB (RTX 4090, RTX 3090) asumiendo el tronco y el ESMC en bf16; en tarjetas de 16 GB el margen es muy ajustado y depende de la longitud de secuencia y del lote. No hay cifras publicadas de consumo real.
- El consumo de memoria escala con la longitud de secuencia, ya que las características de par y de átomo crecen con el número de tokens, además de los 14 pasos de muestreo de la cabeza de difusión.
- Opciones de despliegue: la librería `ofoldx` (`pip install ofoldx`) con la API `ofoldx.pipeline("fold", model=...)`. vLLM, llama.cpp, Ollama y TGI no son aplicables a este modelo, al no ser un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Bloques | MSA | ESMC | Parámetros (tabla del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| esmfold2-experimental-fast-base600m-step750k (este) | 24 | No | 6B | 746.187.472 reales en safetensors; 6.531,17 M según la tabla del autor | AGPL-3.0 | HuggingFace, librería ofoldx |
| esmfold2-fast | 24 | No | 6B | 6.548,432 M | AGPL-3.0 | HuggingFace |
| esmfold2 | 48 | Sí | 6B | 6.586,242 M | AGPL-3.0 | HuggingFace |
| esmfold2-experimental | 48 | Sí | 6B | 6.568,980 M | AGPL-3.0 | HuggingFace |

| Alternativa externa | Datos |
|---|---|
| ESMFold v1 (Meta) | No disponible en la información proporcionada |
| AlphaFold2 / AlphaFold3 | No disponible en la información proporcionada |
| RoseTTAFold | No disponible en la información proporcionada |

La diferencia entre los 746 M de los safetensors y los 6.531 M de la tabla del autor sugiere que el recuento de la tabla incluye el ESMC 6B congelado, que se cargaría por separado, mientras que el archivo de este checkpoint contiene únicamente el tronco de plegamiento de base 600M. La composición exacta no está documentada en la información disponible.

## Limitaciones y advertencias

- Implementación no oficial: los autores originales de ESMFold2 (Biohub) no han escrito, revisado ni avalado ni el código ni la model card, por lo que la fidelidad respecto al modelo descrito en el paper no está garantizada.
- Licencia AGPL-3.0: licencia de copyleft fuerte. Ofrecer el modelo como servicio en red puede obligar a liberar el código fuente de la aplicación que lo integra; conviene revisarlo con asesoría legal antes de cualquier uso comercial.
- Checkpoint experimental de una serie de escalado: no es una versión final ni validada, sino un punto intermedio (paso 750k) pensado para estudiar el escalado.
- Ausencia total de benchmarks publicados: no hay métricas de precisión estructural (RMSD, lDDT, pLDDT) que permitan estimar su calidad real frente a alternativas.
- Sin MSA en esta variante: la falta de evidencia evolutiva puede degradar la precisión en dianas que dependen de homólogos, en comparación con las variantes de 48 bloques con condicionamiento por MSA.
- Riesgo de estructuras incorrectas: no se documenta el comportamiento en regiones intrínsecamente desordenadas, ligandos, iones ni modificaciones postraduccionales; la model card solo describe el contrato geométrico, no la precisión biológica.
- Contrato de entrada estricto: los valores no finitos activos se consideran peticiones inválidas y los valores finitos fuera del rango del dtype del modelo no están soportados; un preprocesado incorrecto provoca fallos en lugar de resultados degradados.
- El diseño de binders exige que la diana sea una secuencia de proteína en código de una letra; no se aceptan estructuras ni rutas de archivo como diana.
- Idiomas: no aplica, al no ser un modelo lingüístico.
- Comunidad nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- No se documentan cuantizaciones ni métricas de latencia, por lo que las estimaciones de hardware de esta ficha son aproximadas.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/oteam/esmfold2-experimental-fast-base600m-step750k
- Variante completa: https://huggingface.co/oteam/esmfold2
- Variante fast: https://huggingface.co/oteam/esmfold2-fast
- Variante experimental: https://huggingface.co/oteam/esmfold2-experimental
- Variante experimental fast: https://huggingface.co/oteam/esmfold2-experimental-fast
- Código del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Repositorio de la librería OFoldX: https://github.com/OTeam-AI4S/OFoldX
- Paper: https://biohub.ai/papers/esm_protein.pdf
- Repositorio original de Biohub: https://github.com/Biohub/esm
