# quorumbio/esm2-650m-protein-subcellular-localization-signal-peptide

## Resumen

El modelo `quorumbio/esm2-650m-protein-subcellular-localization-signal-peptide` es un ajuste fino supervisado del modelo de lenguaje de proteinas ESM-2 en su variante de 650 millones de parametros (`facebook/esm2_t33_650M_UR50D`), desarrollado por quorumbio. Resuelve dos tareas concretas de anotacion funcional de proteinas a partir de la secuencia de aminoacidos: la prediccion multi-etiqueta de localizacion subcelular en 10 compartimentos celulares y la deteccion de peptido senal en el extremo N-terminal. Es la version grande de un modelo hermano de 150M con el mismo diseno de datos y cabezas de clasificacion.

Arquitectura transformer encoder tipo BERT (ESM-2, 33 capas, 650M parametros) con dos cabezas lineales anadidas sobre la representacion del token especial de inicio de secuencia: una cabeza de 10 salidas (una por localizacion, activacion sigmoide para multi-etiqueta) y una cabeza de 1 salida para peptido senal. Se distribuye en safetensors para PyTorch/Transformers y tambien en ONNX (fp32 e int8), lo que facilita su despliegue en pipelines de bioinformatica sin GPU.

Su relevancia practica es acotada pero clara: es un clasificador de proteinas listo para produccion con metricas publicadas sobre un split de Swiss-Prot particionado por homologia, licencia Apache 2.0 y artefactos ONNX verificados contra PyTorch. El propio autor recomienda la variante de 150M para la mayoria de usos, reservando esta para casos donde la mejora marginal en el ranking de localizaciones justifique el coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ESM-2 (tipo BERT, 33 capas) con dos cabezas de clasificacion lineal |
| Parametros totales | 651.056.064 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el pipeline trunca secuencias de mas de 1000 residuos conservando los primeros 600 y los ultimos 400 |
| Tipos de cuantizacion | fp32 (ONNX, 2598,7 MB) e int8 (ONNX cuantizado, 652,7 MB); pesos PyTorch en safetensors |
| Idiomas soportados | no aplica (entrada de secuencias de aminoacidos, no texto natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch/Transformers) y ONNX (`model.onnx` + `model.onnx_data`, y `model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/esm2_t33_650M_UR50D`, un transformer encoder de 33 capas y 650M parametros preentrenado de forma autosupervisada sobre secuencias de proteinas (masked language modeling). Sobre ese backbone se anaden dos cabezas: una de 10 logits para localizacion subcelular multi-etiqueta y otra de 1 logit para presencia de peptido senal. El ajuste fino se realizo sobre el dataset `quorumbio/swissprot-subcellular-localization-signal-peptide`, derivado de Swiss-Prot, con un split particionado por similitud de secuencia (clusters MMseqs2) para evitar fuga de homologia entre train, validacion y test.

El conjunto de test consta de 2336 proteinas de Swiss-Prot, con 450 positivos de peptido senal. Los umbrales por clase se seleccionaron exclusivamente sobre el conjunto de validacion. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un clasificador de este tipo). La innovacion tecnica destacable es la verificacion de los artefactos ONNX contra PyTorch en 150 secuencias de test de hasta 500 residuos, con una diferencia maxima absoluta de probabilidad de 1,2e-06 en fp32 y 0,140 en int8, y una coincidencia de decisiones del 100,0% (fp32) y 99,8% (int8).

## Capacidades

- Prediccion multi-etiqueta de localizacion subcelular en 10 clases: nucleo, citoplasma, extracelular, mitocondria, membrana celular, reticulo endoplasmico, plastido, aparato de Golgi, lisosoma/vacuola y peroxisoma.
- Prediccion binaria de presencia de peptido senal en el extremo N-terminal de la secuencia.
- Salida de probabilidades calibradas por clase, con umbrales por clase elegidos en validacion para producir decisiones si/no.
- Manejo de secuencias largas mediante truncamiento interno (primeros 600 residuos y ultimos 400 cuando la secuencia supera los 1000).
- Inferencia en CPU via ONNX int8 (652,7 MB) y en GPU via PyTorch/Transformers.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un clasificador discriminativo, no un modelo generativo.
- No tiene capacidades multilingues ni de vision o audio; su unica modalidad de entrada es la secuencia de aminoacidos.

## Casos de uso

- Anotacion funcional a gran escala de proteomas: procesar lotes de secuencias de UniProt o metagenomas para asignar localizaciones probables y filtrar candidatos antes de validacion experimental, usando el artefacto ONNX int8 en CPU para reducir coste.
- Priorizacion de dianas en descubrimiento de farmacos: descartar rapidamente proteinas con alta probabilidad de localizacion extracelular o de membrana celular, que son las clases con mejor AP (0,926 y 0,746 respectivamente) y por tanto mas fiables para este filtrado.
- Analisis de secretoma: usar la cabeza de peptido senal (AUROC 0,992, MCC 0,946) para identificar proteinas con senal N-terminal y separar candidatos a secrecion de proteinas intracelulares.
- Enriquecimiento de pipelines de anotacion bioinformatica: integrar el modelo como paso previo o posterior a herramientas clasicas (SignalP, TargetP, DeepLoc) y combinar predicciones para aumentar la cobertura en clases con senal debil.
- Investigacion en biologia celular comparativa: comparar la distribucion de localizaciones predichas entre conjuntos de proteinas de distintos organismos o condiciones, con la cautela de que Golgi, lisosoma/vacuola y peroxisoma tienen AP por debajo de 0,5 y no son fiables para decisiones individuales.
- Docencia y prototipado: el ejemplo de uso con `snapshot_download` y el modulo `quorum_loc` permite montar un cuaderno de demostracion en minutos sin infraestructura GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Swiss-Prot particionado por homologia (2336 proteinas, 450 positivos de peptido senal). No verificados de forma independiente.

| Tarea | Metrica | Valor (650M) | Valor (150M, referencia) |
|---|---|---|---|
| Localizacion subcelular (10 clases) | Macro AUROC | 0,935 | 0,926 |
| Localizacion subcelular (10 clases) | Macro F1 (umbrales de validacion) | 0,655 | 0,650 |
| Peptido senal | AUROC | 0,992 | 0,994 |
| Peptido senal | MCC (umbral 0,75) | 0,946 | 0,956 |

Desglose por clase de localizacion (test):

| Clase | Positivos test | AUROC | AP | F1 | AP (150M) | F1 (150M) |
|---|---|---|---|---|---|---|
| Nucleo | 716 | 0,931 | 0,887 | 0,777 | 0,874 | 0,785 |
| Citoplasma | 842 | 0,904 | 0,818 | 0,798 | 0,820 | 0,779 |
| Extracelular | 351 | 0,984 | 0,926 | 0,871 | 0,892 | 0,861 |
| Mitocondria | 221 | 0,917 | 0,750 | 0,721 | 0,773 | 0,737 |
| Membrana celular | 295 | 0,930 | 0,746 | 0,684 | 0,728 | 0,693 |
| Reticulo endoplasmico | 192 | 0,928 | 0,692 | 0,636 | 0,619 | 0,630 |
| Plastido | 84 | 0,983 | 0,869 | 0,809 | 0,884 | 0,883 |
| Aparato de Golgi | 78 | 0,900 | 0,375 | 0,366 | 0,381 | 0,342 |
| Lisosoma/Vacuola | 88 | 0,921 | 0,434 | 0,500 | 0,367 | 0,361 |
| Peroxisoma | 35 | 0,954 | 0,446 | 0,383 | 0,405 | 0,432 |

Comparacion 650M frente a 150M sobre las mismas proteinas de test (bootstrap por clusters, 1475 clusters MMseqs2, 2000 remuestreos): la macro AUROC de localizacion mejora +0,010 (intervalo del 95% [+0,001, +0,019]), superior a la desviacion estandar entre semillas del 150M (0,001). La macro AP de localizacion (+0,020 [-0,008, +0,052]), la AP de clases raras (+0,033 [-0,048, +0,128]) y la macro F1 (-0,001 [-0,043, +0,042]) no muestran diferencias claras. En peptido senal no hay mejora: AUROC -0,002 [-0,008, +0,003] y MCC -0,007 [-0,019, +0,004].

## Requisitos de hardware

- VRAM estimada para inferencia en fp32 (PyTorch o ONNX): aproximadamente 2,6 GB solo de pesos, mas activaciones; en la practica conviene reservar entre 4 y 6 GB para lotes pequenos.
- VRAM estimada en int8 (ONNX cuantizado): aproximadamente 0,65 GB de pesos; cabe en CPU sin GPU y en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquiera con al menos 8 GB para fp32 comodo (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para int8 no se requiere GPU.
- Cabe en GPU consumer: si, en todas las RTX modernas desde 4 GB, y en CPU para el artefacto int8.
- Opciones de despliegue: PyTorch/Transformers (carga con `snapshot_download` y el modulo `quorum_loc`), ONNX Runtime (fp32 o int8). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no aplican a este clasificador.
- Latencia y throughput: el autor indica explicitamente que no ha medido la velocidad y que cabe esperar que sea mas lenta que la variante de 150M. No hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Macro AUROC localizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| quorumbio/esm2-650m-...-signal-peptide | 651M | truncado a 1000 residuos | Localizacion 10 clases + peptido senal | 0,935 | Apache 2.0 | Hugging Face, ONNX fp32/int8 |
| quorumbio/esm2-...-signal-peptide (150M) | ~150M | truncado a 1000 residuos | Localizacion 10 clases + peptido senal | 0,926 | Apache 2.0 | Hugging Face, demo en navegador, verificado en 3 semillas |
| ESM-2 650M base (`facebook/esm2_t33_650M_UR50D`) | 650M | no disponible | Representaciones generales de proteinas (requiere cabeza propia) | no disponible | MIT (modelo base de Meta) | Hugging Face |

La comparativa con herramientas clasicas de la misma tarea (SignalP, TargetP, DeepLoc) no esta disponible en la informacion proporcionada; el autor solo compara contra su propia variante de 150M.

## Limitaciones y advertencias

- Clases debiles: Golgi (AP 0,375), lisosoma/vacuola (AP 0,434) y peroxisoma (AP 0,446) quedan por debajo de 0,5 de average precision; no son fiables para decisiones individuales.
- El AUROC resulta enganoso para clases raras; el propio autor recomienda usar AP y F1 como metricas de referencia.
- El modelo de 650M es una unica ejecucion de entrenamiento (semilla 13), sin verificacion entre semillas; la variante de 150M si fue comprobada con 3 semillas.
- La mejora frente al 150M es marginal y solo clara en macro AUROC (+0,010); en peptido senal no hay mejora e incluso empeora ligeramente (AUROC -0,002, MCC -0,007).
- El artefacto ONNX int8 solo se verifico en 150 secuencias de hasta 500 residuos, no sobre el conjunto de test completo; la diferencia maxima de probabilidad frente a PyTorch es de 0,140 y las decisiones coinciden en el 99,8% de los casos.
- El truncamiento de secuencias largas (primeros 600 + ultimos 400 residuos) puede perder informacion relevante en proteinas de gran tamano.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos y negativos en clases con senal debil; las predicciones no sustituyen validacion experimental.
- No se documentan sesgos especificos ni desequilibrios del dataset mas alla de la distribucion de clases mostrada en la tabla de test.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base ESM-2 de Meta tiene su propia licencia (MIT segun la informacion disponible); conviene revisar los terminos del modelo base antes de un despliegue comercial.
- No se han publicado cifras de latencia ni throughput; el autor advierte que es mas lento que el 150M.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quorumbio/esm2-650m-protein-subcellular-localization-signal-peptide
- Modelo hermano de 150M: https://huggingface.co/quorumbio/esm2-protein-subcellular-localization-signal-peptide
- Modelo base ESM-2 650M: https://huggingface.co/facebook/esm2_t33_650M_UR50D
- Dataset de entrenamiento: https://huggingface.co/datasets/quorumbio/swissprot-subcellular-localization-signal-peptide
- Paper de ESM-2 (Lin et al., 2023): no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
- Demo en navegador: disponible solo para la variante de 150M, no para este modelo
