# oteam/esmfold2-experimental-fast-base600m-step1500k

## Resumen

ESMFold2 Experimental Fast base600M step1500k es un checkpoint de la familia ESMFold2, un modelo de prediccion de estructura biomolecular «all-atom» (todos los atomos) desarrollado originalmente por Biohub (antiguo Chan Zuckerberg Initiative) y descrito en el articulo *Language Modeling Materializes a World Model of Protein Biology*. Esta concrecion la publica el usuario `oteam` como implementacion no oficial dentro de la libreria OFoldX, y no cuenta con el aval de los autores originales. El modelo toma representaciones de un modelo de lenguaje de proteinas ESMC congelado y las procesa mediante un tronco de plegamiento recurrente y una cabeza de difusion que genera coordenadas atomicas 3D, con cabezas adicionales de distograma y confianza.

La variante «fast» se caracteriza por usar 24 bloques de plegamiento y prescindir de la evidencia de alineamiento multiple de secuencias (MSA), trabajando solo con secuencia unica, lo que reduce coste computacional a cambio de menor precision en dianas dificiles. El sufijo «base600M» y «step1500k» identifican un punto de la barrida de escalado (scaling) de la familia: una base de 600 M de parametros entrenada durante 1.500.000 pasos. Es, por tanto, un artefacto de investigacion orientado a reproducibilidad y estudios de escalado, no un checkpoint de produccion.

Su relevancia actual es doble: por un lado, permite a investigadores reproducir las curvas de escalado del paper de ESMFold2 sin depender del modelo completo; por otro, los checkpoints experimentales de esta familia exponen el modelo de inversion diferenciable utilizado para el diseno de secuencias de binders proteicos, una capacidad que va mas alla de la mera prediccion estructural. La licencia AGPL-3.0 es un factor critico a evaluar antes de cualquier uso en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco de plegamiento recurrente (24 bloques, variante fast) condicionado por representaciones ESMC congeladas y cabeza de difusion para generacion de coordenadas; cabezas de distograma y confianza |
| Parametros totales | 746.187.472 (pesos medidos en safetensors); la model card de la familia cifra la variante Experimental Fast completa en 6.531,170 M, incluyendo el codificador ESMC 6B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo sobre secuencias de proteinas; no se publica limite de residuos) |
| Tipos de cuantizacion | No disponible; solo se distribuyen pesos en safetensors |
| Idiomas soportados | No disponible; el dominio de entrada es secuencia de proteinas en alfabeto de una letra (aminoacidos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (repositorio de 3,0 GB) |

## Arquitectura y entrenamiento

ESMFold2 sigue un esquema de tres etapas: un modelo de lenguaje de proteinas ESMC congelado que aporta representaciones de secuencia; un tronco de plegamiento recurrente que actualiza caracteristicas de token y de par de residuos a lo largo de 4 actualizaciones recurrentes; y una cabeza de difusion que genera coordenadas atomicas en 14 pasos de muestreo, tras los cuales las cabezas de distograma y confianza puntuan el resultado. La variante fast emplea 24 bloques de plegamiento en lugar de 48 y elimina la condicion por MSA, de modo que solo consume secuencia unica. Las dimensiones internas declaradas son 384 para caracteristicas de single, 256 para par, 128 para atomo y 768 para token.

El checkpoint corresponde a la barrida de escalado publicada como «Experimental-Fast-base{300M,600M,6B}-step{250,500,750,1000,1500}k», es decir, una base de 600 M de parametros tras 1.500.000 pasos de entrenamiento. El peso real del repositorio (746.187.472 parametros) es coherente con un checkpoint del tronco que no incorpora el codificador ESMC de 6B descrito en la tabla de la familia, aunque la model card no detalla la composicion exacta de esta concrecion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni el uso de RLHF o DPO; en modelos de plegamiento la senal de entrenamiento habitual es supervisada sobre estructuras experimentales, pero ese dato no se confirma aqui.

La innovacion diferencial de la familia experimental es la exposicion del modelo de inversion diferenciable empleado para el diseno de secuencias de binders: la variante Experimental contiene los 19 pares Model-Processor del protocolo liberado, y la Experimental Fast se usa para la optimizacion de secuencias de binder. El contrato geometrico del modelo exige proyecciones numericas finitas explicitas, descarta valores no disponibles mediante mascaras antes de cualquier conversion de tipo y define un atomo representativo por componente (CB, luego CA en proteinas; C4/C2 y C1' en nucleicos).

## Capacidades

- Prediccion de estructura 3D «all-atom» de proteinas a partir de secuencia unica, incluyendo atomos de cadena lateral.
- Prediccion de complejos biomoleculares (componentes proteicos y nucleicos) segun el contrato geometrico descrito en la model card.
- Puntuacion de confianza por residuo y distogramas de distancia inter-residuo como salidas auxiliares.
- Diseno de secuencias de binder proteico mediante inversion diferenciable (capacidad de la rama experimental; la variante fast se emplea para la optimizacion de secuencias).
- Procesamiento por lotes de secuencias en pipelines de OFoldX.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje de proposito general.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues: su alfabeto de entrada es la secuencia de aminoacidos.
- No dispone de modo «thinking», vision ni audio.

## Casos de uso

- Anotacion estructural a gran escala de proteinas metagenomicas: el modelo permite asignar un pliegue plausible a millones de secuencias sin MSA, lo que abarata el primer cribado frente a predictores que exigen alineamientos.
- Priorizacion de candidatos en diseno de proteinas: dado un conjunto de secuencias generadas por un modelo generativo, esta variante fast sirve como filtro rapido de plegabilidad antes de pasar los mejores candidatos al modelo completo de 48 bloques con MSA.
- Analisis del efecto de mutaciones puntuales: comparar la estructura y la confianza predicha entre secuencia wild-type y variantes permite descartar mutaciones que rompen el plegamiento antes de sintetizarlas en laboratorio.
- Diseno de binders de peptido o proteina: la rama experimental expone el modelo de inversion para optimizar la secuencia del binder contra una diana dada como secuencia de una letra, util en el cribado de moleculas de union.
- Reproduccion de estudios de escalado: investigadores que analizan como la calidad estructural mejora con pasos de entrenamiento y tamano de base pueden usar este checkpoint como punto de la curva (600 M, 1,5 M pasos) sin entrenar desde cero.
- Construccion de datasets de estructura para aprendizaje automatico: generar estructuras y etiquetas de confianza para destilar un modelo mayor en uno mas pequeno o para aumentar datos de entrenamiento en tareas downstream (prediccion de interfaz, solubilidad, estabilidad).
- Integracion en pipelines de biologia computacional: la API `ofoldx.pipeline("fold", ...)` permite encadenar prediccion y analisis posterior en un flujo Python, con el modelo como componente sustituible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de GDT-TS, lDDT, RMSD ni comparaciones numericas con ESMFold, AlphaFold2 u otros predictores para esta concrecion concreta.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 2,98 GB en fp32, 1,49 GB en bf16/fp16 y 0,75 GB en int8, calculados sobre 746.187.472 parametros (estimacion).
- VRAM estimada para inferencia (estimacion a partir del tamano y de las dimensiones internas declaradas): 4-6 GB para secuencias cortas (menos de ~300 residuos) en bf16; 8-16 GB para cadenas de ~800 residuos por el crecimiento cuadratico de las caracteristicas de par (256 canales); por encima de ~1.500 residuos puede requerir 24 GB o mas y troceado.
- GPU recomendadas: NVIDIA A100 40/80 GB o H100 para lotes grandes y proteinas largas; RTX 4090 (24 GB) para inferencia individual y experimentacion; RTX 3090/4080 (16-24 GB) como minimo comodo.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores para secuencias de tamano moderado en bf16; en 8 GB solo con secuencias cortas y posible cuantizacion manual.
- Opciones de despliegue: libreria `ofoldx` (instalacion via `pip install ofoldx`) sobre PyTorch; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo autoregresivo de texto.
- Latencia y throughput: no disponibles; la model card solo indica 4 actualizaciones recurrentes y 14 pasos de muestreo de difusion por prediccion.

## Comparativa con modelos similares

| Modelo | Bloques de plegamiento | MSA | ESMC | Parametros (M) | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ESMFold2 Experimental Fast base600M step1500k (esta ficha) | 24 | No | 600M (segun nombre del checkpoint) | 746,187 (pesos publicados) | 14 | AGPL-3.0 | HuggingFace, implementacion no oficial OFoldX |
| ESMFold2 Fast | 24 | No | 6B | 6.548,432 | 14 | No disponible en la informacion | HuggingFace (oteam/esmfold2-fast) |
| ESMFold2 Experimental Fast | 24 | No | 6B | 6.531,170 | 14 | No disponible en la informacion | HuggingFace (oteam/esmfold2-experimental-fast) |
| ESMFold2 (completo) | 48 | Si | 6B | 6.586,242 | 14 | No disponible en la informacion | HuggingFace (oteam/esmfold2) |
| ESMFold original | No disponible | No | ESM-2 (no ESMC) | No disponible en la informacion | No disponible | No disponible en la informacion | Repositorio Biohub/esm |

No se dispone en la informacion proporcionada de comparaciones numericas de precision (lDDT, GDT-TS) entre estas variantes ni frente a AlphaFold2/3, por lo que la comparativa se limita a configuracion, tamano y disponibilidad.

## Limitaciones y advertencias

- Implementacion no oficial: los autores originales de ESMFold2 no escribieron, revisaron ni avalan este checkpoint ni su model card; los resultados pueden diferir de la implementacion de referencia.
- Checkpoint experimental de una barrida de escalado: no es la version recomendada para uso en produccion. La propia familia indica que debe usarse ESMFold2 para trabajo de investigacion y que los experimentales existen para reproducibilidad.
- Ausencia de MSA: la variante fast pierde la senal de alineamiento multiple, lo que degrada la precision en dianas dificiles, proteinas con pocos homologueos y regiones de baja conservacion.
- Base de 600 M y 1,5 M pasos: al ser un punto intermedio de la curva de escalado, cabe esperar menor calidad estructural que las variantes con ESMC 6B (la diferencia de parametros es de casi un orden de magnitud).
- Licencia AGPL-3.0: licencia copyleft fuerte. El uso comercial en un servicio en red obliga a liberar el codigo fuente derivado; conviene revision legal antes de integrarlo en un producto.
- Sin datos de sesgo ni de calibracion de confianza publicados: la puntuacion de confianza (pLDDT equivalente) no esta validada en esta concrecion, por lo que no debe interpretarse como probabilidad calibrada.
- Riesgo de alucinacion estructural: en regiones intrinsecamente desordenadas el modelo puede producir coordenadas con apariencia plausible pero sin significado biologico; requiere validacion experimental (difraccion, crio-EM, SAXS) antes de cualquier conclusion funcional.
- Contrato de entrada estricto: valores no finitos activos se consideran peticiones invalidas y los valores finitos fuera del rango del dtype son un rango numerico no soportado; el pipeline fallara en lugar de corregir la entrada.
- El diseno de binder solo acepta la diana como secuencia de una letra: no se admite una estructura ni una ruta de fichero como diana.
- Idiomas y contexto: no aplica en el sentido de los LLM, pero no hay documentacion sobre limite maximo de residuos ni comportamiento en cadenas muy largas.
- Sin garantias de mantenimiento: repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte comunitario o correccion de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/esmfold2-experimental-fast-base600m-step1500k
- Variante completa: https://huggingface.co/oteam/esmfold2
- Variante fast: https://huggingface.co/oteam/esmfold2-fast
- Variante experimental: https://huggingface.co/oteam/esmfold2-experimental
- Variante experimental fast: https://huggingface.co/oteam/esmfold2-experimental-fast
- Codigo de la implementacion (OFoldX): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Repositorio de la libreria OFoldX: https://github.com/OTeam-AI4S/OFoldX
- Paper: https://biohub.ai/papers/esm_protein.pdf
- Repositorio original de Biohub: https://github.com/Biohub/esm
- Documentacion de ESMFold2 en Biohub: https://docs.biohub.ai/models/esmfold2
- Espejo del checkpoint en Biohub: https://huggingface.co/biohub/ESMFold2-Experimental-Fast-base600M-step1500k
- Espejo en Synthyra: https://huggingface.co/Synthyra/ESMFold2-Experimental-Fast-base600M-step1500k
- Ficha en Inferix: https://inferix.co/models/biohub/ESMFold2-Experimental-Fast-base600M-step1500k
- Portal divulgativo sobre el repositorio: https://esmfold2.com/esmfold2-github
