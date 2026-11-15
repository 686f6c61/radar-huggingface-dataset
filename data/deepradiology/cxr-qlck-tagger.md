# DeepRadiology/cxr-qlck-tagger

## Resumen

qlc_K (identificador `DeepRadiology/cxr-qlck-tagger`) es un modelo de vision especializado en radiografias de torax (CXR) desarrollado por DeepRadiology (Nakul Gupta). Combina un backbone de vision transformer derivado del tower visual de Qwen, afinado con LoRA a resolucion nativa de 1024 x 1024, con cabezas jerarquicas multi-tarea que cubren 233 conceptos clinicos, y un motor de reglas determinista que produce informes radiologicos estructurados sin riesgo de alucinacion. El pipeline declarado en Hugging Face es `image-feature-extraction`, aunque funcionalmente actua como clasificador de conceptos clinicos y generador de informes.

El modelo resuelve el problema de la generacion de informes radiologicos automaticos con trazabilidad y calibracion: en lugar de un LLM generativo que puede inventar hallazgos, qlc_K produce probabilidades calibradas por isotonic regression para cada concepto y las convierte en texto mediante plantillas deterministas. Esto lo hace relevante para entornos clinicos donde la auditabilidad y la consistencia son requisitos, y donde la latencia importa: aproximadamente 300 ms end-to-end en GPUs modernas con una huella de VRAM de unos 1,1 GB.

El repositorio ocupa 0,9 GB e incluye pesos TorchScript fusionados en fp16 (`qlck_fp16.ts`), curvas de calibracion (`tagger_model_full233.json`) y un servidor proxy compatible con la API de OpenAI. El modelo esta entrenado sobre un corpus multi-institucional que abarca MIMIC-CXR, CheXpert+, VinDr-CXR y RANZCR CLiP, y declara licencia Apache 2.0 con soporte exclusivo de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (Qwen Vision Tower) con LoRA (r=16, alpha=32) fusionado, mas cabezas jerarquicas multi-tarea (`HierHead`) y motor de reglas determinista |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 1024 x 1024) |
| Tipos de cuantizacion | fp16 (pesos TorchScript fusionados); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | TorchScript (`qlck_fp16.ts`), JSON de calibracion (`tagger_model_full233.json`) |

## Arquitectura y entrenamiento

El backbone es el tower visual de Qwen (ViT) afinado a resolucion nativa de 1024 x 1024 mediante LoRA con rango 16 y alpha 32, posteriormente fusionado en un unico artefacto TorchScript fp16 autocontenido que elimina dependencias de framework pesadas. Sobre el backbone se monta `HierHead`, un mecanismo de pooling con atencion jerarquica que impone un grafo aciclico dirigido (DAG) sobre los 233 objetivos clinicos: relaciones ISA como atelectasia contenido en opacidad pulmonar, y relaciones ordinales acumulativas como edema alveolar contenido en edema intersticial contenido en congestion. El entrenamiento usa entropia cruzada binaria ponderada con mascaras, penalizaciones hinge por violaciones de jerarquia, perdidas multi-tarea con mapas espaciales de neumotorax y perdida L1 suave para la profundidad del tubo endotraqueal.

Los datos de entrenamiento provienen de un corpus multi-institucional de radiografias de torax que incluye MIMIC-CXR, CheXpert+, VinDr-CXR y RANZCR CLiP; no se especifica el numero exacto de imagenes ni de tokens. La calibracion se realiza con curvas isotonicas piecewise-linear por objetivo, ajustadas sobre conjuntos de validacion held-out, y ademas fuerza consistencia jerarquica en la salida: la probabilidad de un hijo no puede superar la del padre y las etapas ordinales de severidad son monotonamente no crecientes. No se documenta uso de RLHF ni DPO, ya que el modelo no es generativo en el sentido de un LLM: la generacion de texto es determinista y basada en reglas.

## Capacidades

- Clasificacion de 233 conceptos clinicos en radiografias de torax, incluyendo dispositivos de soporte (tubo endotraqueal, traqueostomia, sondas entericas, cateteres venosos centrales con tipo y profundidad de punta, tubos toracicos, marcapasos, ICD, CRT, PAC, Impella, LVAD, cables de esternotomia, clips de CABG, valvulas, clips de LAA, loop recorders).
- Regresion continua de la distancia de la punta del tubo endotraqueal por encima de la carina, en centimetros.
- Deteccion de patologia del parenquima pulmonar: consolidacion, neumonia con localizacion lobar, edema alveolar/intersticial, congestion, atelectasia, nodulos, masas, enfisema, enfermedad intersticial difusa y fibrosis.
- Evaluacion del espacio pleural: tamano y lateralidad del derrame, neumotorax con protecciones contra atajos por tubo toracico, enfisema subcutaneo.
- Evaluacion cardiomediastinica: cardiomegalia graduada, ensanchamiento mediastinico, tortuosidad y calcificacion aortica, hernia de hiato.
- Evaluacion musculoesqueletica: fracturas costales agudas/subagudas frente a curadas, fracturas humerales, compresion vertebral.
- Generacion de informes en dos formatos: Form A (6 campos estructurados: Support Devices, Cardiomediastinum, Lungs, Pleura, Musculoskeletal, Upper Abdomen) con declaraciones negativas garantizadas, y Form B (narrativa en prosa consolidada).
- Hoja de hallazgos de soporte a la decision calibrada en bandas de confianza Panicek (Present >= 90 %, Probable >= 70 %, Possible >= 35 %, Unlikely >= 15 %, Not detected < 15 %).
- Servidor REST compatible con `/v1/chat/completions` de OpenAI mediante `tag_proxy.py`.
- No soporta tool calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje generativo.

## Casos de uso

- Triaje automatizado en urgencias: el modelo clasifica en aproximadamente 300 ms si hay neumotorax, derrame o consolidacion, permitiendo priorizar radiografias criticas en la cola de lectura radiologica antes de la revision humana.
- Control de dispositivos en UCI: la regresion de la distancia de la punta del tubo endotraqueal a la carina y la deteccion de cateteres, marcapasos y drenajes permiten verificaciones automatizadas de posicion en pacientes con soporte vital.
- Seguimiento de trasplante pulmonar: con AUROC de 0,995 global (bilateral 0,976, izquierdo 0,968, derecho 0,941) el modelo puede usarse para monitorizar complicaciones en cohortes de trasplante.
- Generacion de borradores de informe en entornos con carga asistencial alta: los 6 campos estructurados con declaraciones negativas garantizadas sirven como plantilla que el radiologo revisa y firma, reduciendo tiempo de dictado.
- Investigacion retrospectiva a gran escala: las probabilidades calibradas de 233 conceptos permiten etiquetar cohortes de MIMIC-CXR o CheXpert+ para estudios epidemiologicos sin depender de anotacion manual.
- Despliegue en hardware modesto: con 1,1 GB de VRAM, el modelo cabe en GPUs consumer como RTX 3090 o RTX 4090 e incluso en Quadro RTX 5000, lo que facilita integraciones on-premise en hospitales sin infraestructura de datacenter.
- Deteccion de cardiomegalia graduada y hallazgos mediastinicos en programas de cribado cardiovascular, usando las bandas de confianza Panicek para decidir que casos requieren revision prioritaria.
- Integracion en pipelines PACS: el proxy compatible con OpenAI permite conectar el modelo a sistemas existentes mediante peticiones HTTP estandar, sin reescribir la capa de orquestacion.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Sensibilidad IABP (punto operativo 0,02) | 78,9 % |
| Especificidad IABP (punto operativo 0,02) | 97,9 % |
| AUROC deteccion trasplante pulmonar (global) | 0,995 |
| AUROC trasplante bilateral | 0,976 |
| AUROC trasplante izquierdo | 0,968 |
| AUROC trasplante derecho | 0,941 |
| Latencia end-to-end | ~300 ms en Quadro RTX 5000, RTX 3090 y RTX 4090 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras metricas de NLP, al no tratarse de un modelo de lenguaje. Tampoco se documentan resultados agregados de AUROC sobre los 233 objetivos ni comparaciones con otros modelos de radiologia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB (pesos fp16 fusionados).
- GPU recomendadas: Quadro RTX 5000, RTX 3090 y RTX 4090 segun la model card; cualquier GPU con al menos 2 GB de VRAM libre deberia ser suficiente.
- Cabe en GPU consumer: si, incluidas RTX 3090 y RTX 4090, y presumiblemente gamas inferiores con suficiente VRAM.
- Opciones de despliegue: TorchScript standalone (`torch.jit.load`), servidor proxy HTTP `tag_proxy.py` compatible con la API de OpenAI (`/v1/chat/completions`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: aproximadamente 300 ms end-to-end en las GPUs citadas; no se especifica throughput por lote ni latencia en CPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de radiologia de torax como CheXpert, TorchXRayVision, MedViT ni variantes de vision-language medical, ni datos de rendimiento de esos sistemas.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: los informes generados y las etiquetas estan en ingles, sin soporte documentado para otros idiomas.
- Dominio restringido a radiografia de torax: no procesa otras modalidades (TC, RM, ecografia) ni otras regiones anatomicas.
- Riesgo de alucinacion: la model card afirma riesgo cero en la generacion de texto porque el motor de reglas es determinista, pero las probabilidades subyacentes pueden ser erroneas; el texto refleja fielmente la prediccion, no necesariamente la realidad clinica.
- Sesgos de datos: entrenado sobre MIMIC-CXR, CheXpert+, VinDr-CXR y RANZCR CLiP, cohortes con distribuciones demograficas y de adquisicion especificas; el rendimiento puede degradarse en poblaciones o equipos no representados.
- No es un dispositivo medico: la licencia Apache 2.0 permite uso comercial, pero no se documenta certificacion regulatoria (CE, FDA) ni validacion clinica prospectiva; su uso en decision clinica requiere supervision medica.
- Dependencia de calibracion: las curvas isotonicas estan ajustadas sobre conjuntos held-out concretos; cambios en la distribucion de entrada pueden invalidar las bandas de confianza Panicek.
- Resolucion de entrada fija de 1024 x 1024 con remuestreo bicubico: imagenes con artefactos, rotaciones o recortes agresivos pueden afectar la precision de las cabezas de regresion, especialmente la distancia de la punta del tubo endotraqueal.
- Sin soporte de tool calling, agentes ni multi-step reasoning: no es adecuado como componente de un pipeline agentico generativo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion externa limitado, sin evidencia independiente publicada.

## Enlaces

- Hugging Face: https://huggingface.co/DeepRadiology/cxr-qlck-tagger
- Repositorio del modelo (clonado via git): https://huggingface.co/DeepRadiology/cxr-qlck-tagger
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
