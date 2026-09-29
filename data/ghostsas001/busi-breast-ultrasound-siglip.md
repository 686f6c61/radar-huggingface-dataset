# ghostsas001/busi-breast-ultrasound-siglip

## Resumen

busi-breast-ultrasound-siglip es un clasificador de imagenes de ecografia mamaria en tres clases (benigno, maligno, normal) construido por el usuario ghostsas001 a partir del modelo google/siglip2-base-patch16-224. Se trata de un fine-tuning completo de un encoder visual SigLIP2 con 92.886.531 parametros, orientado a la tarea de image-classification sobre el dataset publico BUSI (Breast Ultrasound Images, Al-Dhabyani et al., 2020). El modelo resuelve un problema concreto: dado un fotograma de ecografia en escala de grises convertido a RGB, devolver una de las tres etiquetas diagnosticas.

La relevancia del modelo es mas metodologica que clinica. El autor declara explicitamente que reutilizo sin ningun ajuste una receta de entrenamiento procedente de un proyecto de clasificacion de globulos blancos, y que obtuvo un 87,18 % de accuracy y un 87,07 % de macro F1 sobre un conjunto de retencion de solo 78 imagenes. La propia model card advierte que las accuracy publicadas sobre las mismas 780 imagenes de BUSI oscilan entre el 68,8 % y el 99,86 % segun el split y el protocolo, y que la release original contiene imagenes duplicadas y algunas ecografias que no son de mama (Musah et al., 2025).

Es, por tanto, un artefacto de investigacion reproducible y de tamano reducido (0,4 GB de repositorio), no un dispositivo medico. Su licencia Apache 2.0 y su compatibilidad con `transformers` y con los Inference Endpoints de HuggingFace lo hacen facil de desplegar como punto de partida o como baseline, pero no como componente de decision clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2, encoder visual ViT (base, patch 16, resolucion 224) con cabecera de clasificacion de 3 clases |
| Parametros totales | 92.886.531 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada fija de 224 x 224 px) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo de vision; el encoder de texto de SigLIP2 no se emplea en inferencia) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con `transformers`); tamano de repositorio 0,4 GB |
| Pipeline | image-classification |
| Clases de salida | benign, malignant, normal |
| Modelo base | google/siglip2-base-patch16-224 (fine-tune) |
| Normalizacion de entrada | Resize a 224 x 224, ToTensor, Normalize(media=[0,5,0,5,0,5], desv=[0,5,0,5,0,5]) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de google/siglip2-base-patch16-224. SigLIP2 es una familia de encoders vision-lenguaje basada en Vision Transformer con aprendizaje de contraste tipo sigmoide en lugar de softmax sobre el lote; en este caso solo se conserva y se reentrena la torre visual mas una cabeza lineal de clasificacion de tres salidas, puesto que la tarea es puramente de clasificacion de imagen. Cada imagen de entrada se redimensiona a 224 x 224 pixeles y se normaliza con media y desviacion 0,5 en los tres canales, tras convertir la ecografia original a RGB.

La receta de entrenamiento, segun la model card, proviene de un proyecto de clasificacion de globulos blancos y se reutilizo sin ningun ajuste. Se entrenaron 15 epocas con learning rate 5e-5, batch de 16 imagenes y una unica GPU NVIDIA T4. El conjunto de entrenamiento son 624 imagenes con sobremuestreo de las clases minoritarias; el split es estratificado 80/10/10 por imagen con semilla 42, y la seleccion del checkpoint se hizo por mejor epoca en el split de validacion. No se documenta uso de RLHF, DPO, decodificacion especulativa ni ninguna innovacion de inferencia: es un ajuste supervisado estandar. El autor no indica el numero total de tokens de imagen vistos ni la composicion exacta del dataset mas alla del recuento por clase del conjunto de test (44 benignas, 21 malignas, 13 normales).

## Capacidades

- Clasificacion de imagenes de ecografia mamaria en tres clases mutuamente excluyentes: benign, malignant, normal.
- Salida de logits y, aplicando softmax, distribucion de probabilidad sobre las tres clases, tal como se muestra en el ejemplo de uso de la model card.
- Inferencia a resolucion fija de 224 x 224 px sobre imagenes RGB (la ecografia original debe convertirse a RGB).
- Integracion directa con la libreria `transformers` mediante `AutoModelForImageClassification`.
- Compatibilidad declarada con endpoints de HuggingFace (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de vision, no un modelo generativo.
- No soporta generacion de texto, codigo ni matematicas.
- No se documentan capacidades multilingues ni de audio.
- No se documenta modo de razonamiento (thinking mode) ni vision mas alla de la clasificacion.

## Casos de uso

- Baseline reproducible en investigacion sobre BUSI: sirve como referencia rapida (92,9 M de parametros, 0,4 GB) para comparar nuevas arquitecturas o recetas de aumento de datos sobre el mismo split estratificado 80/10/10 con semilla 42.
- Preetiquetado de grandes volumenes de ecografias para revision humana: el modelo puede etiquetar automaticamente lotes de imagenes y priorizar aquellas con probabilidad alta de clase maligna para que un radiologo las revise primero.
- Triaje asistido en entornos de investigacion: dado que distingue normal de benigno y maligno, puede utilizarse para descartar candidatas claramente normales antes de un analisis mas costoso, siempre con supervision facultativa.
- Destilacion o aprendizaje por transferencia: al ser un checkpoint SigLIP2 ya adaptado al dominio de ecografia mamaria y con licencia Apache 2.0, es un punto de partida adecuado para entrenar variantes mas ligeras o para inicializar modelos de segmentacion con la torre visual congelada.
- Prueba de concepto de despliegue medico en infraestructura pequena: con menos de 100 M de parametros cabe en cualquier GPU de consumo y en CPU, lo que permite montar una demo o un servicio interno sin presupuesto de computo elevado.
- Auditoria de protocolos de evaluacion: el modelo y su model card documentan explicitamente el problema de las imagenes duplicadas y de las accuracy no comparables en BUSI, por lo que resulta util como caso de estudio sobre como reportar resultados en datasets medicos pequenos.
- Comparacion multimodal dentro del mismo repositorio: el autor publica un modelo complementario de deteccion (busi-breast-ultrasound-yolo), de modo que este clasificador puede combinarse con el detector para construir una canalizacion de deteccion mas clasificacion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de retencion de 78 imagenes (44 benignas, 21 malignas, 13 normales):

| Metrica | Valor |
|---|---|
| Accuracy | 87,18 % |
| Macro F1 | 87,07 % |
| Balanced accuracy | 86,47 % |
| Errores totales | 10 de 78 (8 de ellos entre benigno y maligno) |

Contexto aportado por el autor: las accuracy publicadas sobre las mismas 780 imagenes de BUSI abarcan un rango de 68,8 % a 99,86 % debido a diferencias de split y de protocolo. No se proporcionan resultados comparativos con otros modelos concretos, ni metricas por clase desglosadas mas alla de las curvas de confusion y recall referenciadas en figuras no incluidas en el texto disponible. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y en cualquier caso no serian aplicables a un clasificador de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 372 MB en fp32 y 186 MB en fp16 para los pesos (92,9 M de parametros); las activaciones de una imagen de 224 x 224 son despreciables. En la practica, el consumo total con runtime de PyTorch ronda 1-2 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integradas o en CPU para inferencia de baja frecuencia.
- GPU de datacenter (A100, H100, L4, T4) no son necesarias salvo para procesar lotes muy grandes en paralelo; el autor entreno el modelo en una unica NVIDIA T4.
- Opciones de despliegue: `transformers` sobre PyTorch (ruta oficial documentada), exportacion a ONNX Runtime, TorchScript, servidores de inferencia genericos (Triton, TorchServe) y los Inference Endpoints de HuggingFace (el repositorio incluye el tag `endpoints_compatible`).
- vLLM, llama.cpp, Ollama y TGI no son aplicables: estan orientados a modelos de lenguaje generativos, no a clasificacion de imagenes.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ghostsas001/busi-breast-ultrasound-siglip | 92.886.531 | Clasificacion 3 clases (BUSI) | 224 x 224 px | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| google/siglip2-base-patch16-224 | no disponible en la informacion proporcionada | Vision-lenguaje contrastivo (zero-shot) | 224 x 224 px | no disponible en la informacion proporcionada | HuggingFace (modelo base) |
| ghostsas001/busi-breast-ultrasound-yolo | no disponible | Deteccion en ecografia mamaria (modelo complementario citado por el autor) | no disponible | no disponible | HuggingFace |
| Clasificadores CNN sobre BUSI (literatura) | no disponible | Clasificacion binaria o de tres clases | variable | variable | publicaciones; accuracy reportada entre 68,8 % y 99,86 % segun protocolo |

No se dispone de datos de rendimiento comparables entre estos modelos dentro de la informacion proporcionada. La comparacion relevante es metodologica: frente a los clasificadores CNN habituales sobre BUSI, este modelo parte de un backbone SigLIP2 preentrenado a gran escala, lo que explica que alcance resultados altos con solo 624 imagenes de entrenamiento y 15 epocas, pero tambien hace que su evaluacion sobre 78 imagenes sea poco concluyente.

## Limitaciones y advertencias

- No es un dispositivo medico. El propio autor lo etiqueta como modelo de investigacion; no debe usarse para diagnostico ni para decision clinica.
- Dataset muy pequeno y de una unica fuente: 624 imagenes de entrenamiento y 78 de test, todas de BUSI.
- Duplicados no eliminados: el split se hizo por imagen, no por paciente, de modo que imagenes duplicadas de la release original pueden haber quedado a ambos lados del split e inflar artificialmente las metricas.
- La release original de BUSI contiene imagenes duplicadas y algunas ecografias que no son de mama (Musah et al., 2025), lo que contamina el entrenamiento y la evaluacion.
- Sesgo de confusion benigno/maligno: 8 de los 10 errores del test se producen entre estas dos clases, que son precisamente las clinicamente mas criticas.
- Las accuracy publicadas sobre BUSI varian entre 68,8 % y 99,86 % segun el protocolo, por lo que el 87,18 % reportado no es comparable con la literatura ni extrapolable a pacientes o dispositivos nuevos.
- Receta reutilizada sin ajuste: el pipeline de entrenamiento procede de un proyecto de clasificacion de globulos blancos y no se adapto a imagen mamaria.
- Sin informacion sobre sesgos demograficos: no se documenta la distribucion por edad, etnia, tipo de ecografo ni protocolo de adquisicion.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos negativos y falsos positivos silenciosos, ya que el modelo siempre devuelve una de las tres clases con una probabilidad asociada.
- Idiomas: no aplica; cualquier limitacion linguistica es irrelevante porque el modelo no procesa texto en inferencia.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar avisos de licencia y atribucion; no impone restricciones especificas de uso medico, lo que no exime de cumplir la normativa aplicable a productos sanitarios.
- Modelo practicamente sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de terceros.
- Sin datos de cuantizacion publicados: no hay variantes GGUF, GPTQ ni AWQ, aunque el tamano reducido hace que no sean imprescindibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ghostsas001/busi-breast-ultrasound-siglip
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Organizacion SigLIP de Google: https://huggingface.co/google
- Modelo complementario YOLO: https://huggingface.co/ghostsas001/busi-breast-ultrasound-yolo
- Repositorio con el write-up completo: https://github.com/Elghoudani/busi-breast-ultrasound-classification
- Dataset BUSI (Al-Dhabyani W. et al., Data in Brief, 2020): https://doi.org/10.1016/j.dib.2019.104863
- Musah T. et al., Towards Trustworthy Breast Tumor Segmentation in Ultrasound, 2025: https://arxiv.org/abs/2508.17768
