# AlaaAlowaidi/BankSigNet-140

## Resumen

MSFV-Net (Multi-Script Forgery Verification Network) es una red neuronal siamesa basada en ResNet50 entrenada para la verificacion offline de firmas manuscritas sobre imagenes reales de cheques bancarios indios. Lo desarrolla Alaa Alowaidi, con la colaboracion de Pushpendra Kumar Pateriya, y se distribuye en HuggingFace bajo el identificador `AlaaAlowaidi/BankSigNet-140`. El problema que aborda es concreto: determinar si una firma plasmada en un cheque es autentica o una falsificacion habil (skilled forgery), sin disponer de informacion dinamica de trazado, solo a partir de la imagen escaneada.

El modelo parte del checkpoint `microsoft/resnet-50` y se reentrena con una arquitectura siamesa de pesos compartidos, de modo que aprende una metrica de similitud entre pares de firmas. Lo diferencial es que cubre simultaneamente tres sistemas de escritura (arabe, ingles y hindi) sobre un mismo benchmark, algo que la model card presenta como el primer conjunto de datos de firmas offline recogido de cheques bancarios reales con fondos impresos y tres scripts en un unico corpus.

Su relevancia practica esta en el nicho de la verificacion documental bancaria: es un modelo pequeno (repo de 0,1 GB), con licencia MIT, y publicado junto a su dataset (BankSigNet-140, 2.100 imagenes de 140 firmantes) y su codigo de entrenamiento y evaluacion, lo que facilita la reproducibilidad completa del pipeline. Incluye ademas un componente de explicabilidad basado en Difference GradCAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red siamesa con backbone ResNet50 (pesos compartidos entre ambas ramas) |
| Parametros totales | no disponible en la model card (el modelo base microsoft/resnet-50 tiene ~25,6 M de parametros; al compartirse pesos entre ramas, la red siamesa no duplica ese computo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada son imagenes de firmas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar), ingles (en), hindi (hi) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth; el checkpoint indicado en la model card es `verifier_msfv.pth`, cargado con `torch.load` y `model_state_dict`) |

## Arquitectura y entrenamiento

MSFV-Net es una red siamesa de pesos compartidos cuyo backbone es un ResNet50 preentrenado (`microsoft/resnet-50`). Cada rama procesa una imagen de firma y el modelo aprende una representacion embebida que permite comparar pares mediante una metrica de distancia. La funcion de perdida es una "forged-aware dual loss" que combina una perdida de triplet con entropia cruzada binaria, disenada especificamente para separar pares genuinos de falsificaciones habiles. El entrenamiento usa muestreo de lotes equilibrado por script (script-balanced batch sampling) y aumentacion con fondos sinteticos, lo que resulta coherente con el escenario objetivo: firmas sobre cheques con fondos impresos, ruido de escaneo y texturas del papel.

El corpus de entrenamiento es BankSigNet-140, compuesto por 2.100 imagenes de firmas (140 firmantes x 15 muestras) escaneadas a 300 DPI a partir de cheques bancarios indios reales, con presencia de los tres sistemas de escritura y falsificaciones habiles. No se especifican en la informacion disponible el numero total de tokens ni un pipeline de RLHF o DPO, ya que no se trata de un modelo de lenguaje. La innovacion tecnica destacable en el plano de interpretabilidad es el uso de Difference GradCAM evaluado con metricas de fidelidad Deletion/Insertion AUC, orientado a justificar visualmente la decision del verificador.

## Capacidades

- Verificacion offline de firmas: decide si un par de imagenes de firma corresponde a la misma persona o a una falsificacion, sin usar informacion dinamica de trazado.
- Cobertura multi-script: entrenado y evaluado simultaneamente sobre escritura arabe, inglesa y hindi.
- Robustez ante fondos impresos: disenado para firmas sobre cheques reales, no sobre papel blanco limpio.
- Deteccion de falsificacion habil (skilled forgery), no solo de imitaciones torpes.
- Verificacion en regimen open-set con firmantes disjuntos entre entrenamiento y evaluacion, segun la model card.
- Explicabilidad integrada: genera mapas Difference GradCAM y reporta metricas de fidelidad Deletion/Insertion AUC.
- Extraccion de embeddings de firma reutilizables para comparacion por similitud.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, capacidades de agente ni modo thinking. No es un modelo de lenguaje ni un VLM.

## Casos de uso

- Validacion de cheques en compensacion bancaria: cada cheque escaneado se compara contra la firma de referencia registrada del titular; el modelo devuelve una puntuacion de similitud que permite enrutar automaticamente los casos claros y derivar los dudosos a revision manual.
- Triaje en ventanilla y back office: preclasificacion de cheques sospechosos antes de que un operador humano los revise, reduciendo el volumen de inspeccion manual en entidades con alto flujo de documentacion fisica.
- Deteccion de fraude documental: identificacion de falsificaciones habiles que un revisor humano podria pasar por alto, usando el umbral derivado del EER reportado (26,07 %) para calibrar la politica de aceptacion.
- Verificacion en onboarding y KYC: contraste de firmas manuscritas en contratos y formularios de alta de cliente con la firma de referencia del expediente.
- Digitalizacion de archivos historicos bancarios: proceso por lotes de cheques y documentos ya archivados para detectar irregularidades retroactivas, aprovechando que el modelo opera solo con imagen y no requiere captura en tiempo real.
- Auditoria forense documental: uso de los mapas Difference GradCAM como soporte visual en un informe pericial, ya que senalan que regiones de la firma han motivado la decision del modelo.
- Investigacion academica en verificacion de firmas: al publicarse el checkpoint, el dataset y el codigo, sirve como linea base reproducible para comparar nuevas tecnicas sobre el mismo benchmark multi-script.

## Benchmarks y rendimiento

Resultados sobre BankSigNet-140 en regimen open-set con firmantes disjuntos (media ± desviacion estandar sobre 3 semillas), segun la model card del autor:

| Metrica | Valor |
|---|---|
| Accuracy | 73,56 ± 2,16 % |
| EER | 26,07 ± 1,45 % |
| AUC | 0,810 ± 0,017 |

Precision desglosada por sistema de escritura:

| Script | Accuracy (%) |
|---|---|
| Hindi | 88,6 |
| Ingles | 69,2 |
| Arabe | 66,5 |

Evaluacion cruzada sobre BHSig260-Hindi:

| Metodo | Accuracy (%) |
|---|---|
| SigNet | 84,64 |
| IDN | 93,04 |
| MSFV-Net | 93,15 |

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del backbone ResNet50 y del tamano del repositorio (0,1 GB); no estan confirmadas explicitamente por el autor en la model card.

- VRAM estimada para inferencia: en torno a 1-2 GB en precision FP32 para lotes pequenos, dado que el backbone tiene del orden de 25,6 M de parametros y las dos ramas comparten pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4060 o superior cubre el caso con holgura. No se requieren A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de gama media o incluso en GPUs de gama de entrada con 4 GB. La inferencia en CPU tambien es viable para volumenes moderados.
- Opciones de despliegue: PyTorch nativo (carga directa del checkpoint `verifier_msfv.pth`), exportacion a TorchScript u ONNX Runtime para servir sin dependencia de Python, y despliegue detras de un servidor de inferencia generico (por ejemplo Triton). vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el rendimiento en la evaluacion cruzada sobre BHSig260-Hindi, no las especificaciones completas de las alternativas.

| Modelo | Accuracy en BHSig260-Hindi (%) | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MSFV-Net | 93,15 | no disponible (backbone ResNet50) | no aplica | MIT | Checkpoint en HuggingFace + codigo y dataset en GitHub |
| SigNet | 84,64 | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| IDN | 93,04 | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Rendimiento global moderado: la accuracy media sobre BankSigNet-140 es del 73,56 % y el EER del 26,07 %, lo que implica una tasa de error elevada para un despliegue automatico sin supervision humana.
- Fuerte desequilibrio entre scripts: la precision cae al 66,5 % en arabe y al 69,2 % en ingles, frente al 88,6 % en hindi. No es un modelo homogeneo entre idiomas y el rendimiento esta claramente sesgado hacia el script dominante del dataset.
- Riesgo de falsos positivos y falsos negativos: al ser un verificador binario con EER superior al 25 %, tanto la aceptacion de firmas falsas como el rechazo de firmas genuinas son escenarios frecuentes. El modelo no debe usarse como unico criterio de decision en un entorno bancario real.
- Dataset limitado: 140 firmantes y 2.100 imagenes procedentes exclusivamente de cheques bancarios indios. La generalizacion a otras geografias, formatos de cheque, condiciones de escaneo o sistemas de escritura no evaluados no esta demostrada.
- Ausencia de validacion externa amplia: salvo la evaluacion cruzada sobre BHSig260-Hindi, no se reportan resultados en otros corpus independientes.
- Estado de publicacion: el articulo asociado figura como "under review" en Al-Khwarizmi Engineering Journal en el momento de redactar esta ficha, por lo que las cifras pueden estar sujetas a revision por pares.
- Dependencia del preprocesado: el modelo espera recortes de firma sobre fondos de cheque; no se documentan en la informacion disponible los requisitos exactos de segmentacion ni el comportamiento ante entradas mal recortadas.
- Licencia: MIT, sin restricciones conocidas para uso comercial, pero conviene verificar las condiciones del dataset BankSigNet-140 y del modelo base `microsoft/resnet-50` antes de un despliegue en produccion.
- Riesgo de sesgo demografico: no se documenta la distribucion de los 140 firmantes (edad, genero, origen), lo que impide evaluar sesgos sistematicos en colectivos concretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlaaAlowaidi/BankSigNet-140
- Repositorio de codigo y dataset: https://github.com/Alaa-hub964/BankSigNet-140
- Modelo base: https://huggingface.co/microsoft/resnet-50
- Paper: MSFV-Net: Explainable Multi-Script Offline Signature Verification on Real Bank Cheque Data, Alaa Alowaidi y Pushpendra Kumar Pateriya, Al-Khwarizmi Engineering Journal, en revision (sin enlace publico disponible en la informacion proporcionada)
