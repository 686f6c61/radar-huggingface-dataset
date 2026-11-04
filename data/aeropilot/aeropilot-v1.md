# AeroPilot/AeroPilot-v1

## Resumen

AeroPilot-v1 es un modelo de deteccion de objetos de vocabulario abierto especializado en busqueda y rescate (SAR) desde drones. Se trata de un fine-tune de SAM 3.1 de Meta, desarrollado por AeroPilot, que adapta la rama de vision del modelo base al punto de vista aereo (nadir) manteniendo congelado el codificador de texto. El resultado es un detector que localiza personas y otros objetos mediante prompts textuales arbitrarios (`person`, `boat`, `life jacket`, `cattle`) desde imagenes capturadas a altitud de busqueda, donde una persona perdida ocupa entre 20 y 60 pixeles en un fotograma 4K.

El problema que resuelve es concreto: los detectores de proposito general estan entrenados con fotografias a nivel de ojo humano y fallan sistematicamente ante vistas cenitales de terreno agreste, nieve, bosque o agua abierta. SAM 3.1 sin ajustar detecta el 65% de las personas en HERIDAL; AeroPilot-v1 eleva esa cifra al 87,5% en fotograma completo y al 91,7% con inferencia por mosaico 2x2. En imagenes termicas nocturnas el salto es aun mayor: del 17,5% al 94,4% de recall.

El modelo conserva la interfaz completa de SAM 3 para imagen, por lo que `aeropilot_v1.pt` es un reemplazo directo de `sam3.1_multiplex.pt` en cualquier pipeline existente. El repositorio ocupa 3,5 GB y la licencia es la SAM License de Meta (no comercial por defecto, con condiciones adicionales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3.1 (detector/segmentador de vocabulario abierto con codificador de texto congelado y rama de vision ajustada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; sin ventana de tokens de texto) |
| Tipos de cuantizacion | no disponible (pesos en `aeropilot_v1.pt`, inferencia en bfloat16 segun el ejemplo oficial) |
| Idiomas soportados | en (prompts de texto en ingles) |
| Licencia | SAM License (`sam-license`, categoria `other`) |
| Formato de pesos | PyTorch (`aeropilot_v1.pt`) |

## Arquitectura y entrenamiento

AeroPilot-v1 parte de facebook/sam3.1, un modelo de segmentacion y deteccion de vocabulario abierto que combina un backbone de vision con un codificador de texto que permite consultar objetos mediante lenguaje natural. El fine-tune afecta al detector completo de SAM 3.1 en su rama visual, mientras que el codificador de texto permanece congelado. Esta decision de diseno preserva la capacidad de vocabulario abierto del modelo base: los prompts textuales siguen funcionando igual que antes, pero ahora se interpretan correctamente sobre imagenes aereas.

Los datos de entrenamiento no estan detallados en la informacion disponible (numero de tokens, composicion exacta del dataset, uso de RLHF/DPO no aplica a un detector). La model card menciona que el ajuste se realizo sobre imagenes de SAR en terreno agreste, con evaluacion en conjuntos con sitios y vuelos ausentes del entrenamiento (HERIDAL unseen sites, WiSARD unseen flight), lo que sugiere una particion por escenario geografico y por tipo de vuelo para medir generalizacion. No se documentan innovaciones arquitectonicas propias: la contribucion es el ajuste de dominio y la receta de inferencia por mosaico con solapamiento del 15% y NMS, que mejora el recall en fotogramas de alta resolucion.

## Capacidades

- Deteccion de objetos de vocabulario abierto mediante prompts de texto en ingles.
- Deteccion de personas desde punto de vista aereo (dron) en imagenes RGB de alta resolucion.
- Deteccion en imagenes termicas nocturnas (evaluado en HIT-UAV).
- Deteccion en escenarios de agua abierta y rescate maritimo (SeaDronesSee).
- Deteccion de personas muy pequenas en playa y mar (TinyPerson).
- Deteccion de fauna y ganado desde el aire (WAID).
- Deteccion de clases cotidianas de COCO val2017 sin degradacion significativa respecto al modelo base.
- Inferencia por mosaico (tiling 2x2 con 15% de solapamiento) para fotogramas de mas de ~2.700 px de ancho.
- API compatible con SAM 3 para imagen: `build_sam3_image_model`, `Sam3Processor`, `set_image`, `set_text_prompt`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de vision, no un LLM.

## Casos de uso

- Busqueda y rescate en terreno agreste: procesar fotogramas 4K de dron con el prompt `person` y mosaico 2x2 para localizar excursionistas perdidos con un recall del 91,7% en HERIDAL, reduciendo el tiempo de revision manual de imagenes por parte del equipo de rescate.
- Operaciones nocturnas con camara termica: usar el prompt `person` sobre imagenes termicas de HIT-UAV, donde el modelo alcanza un recall del 94,4% frente al 17,5% del SAM 3.1 base, lo que hace viable la busqueda aerea nocturna.
- Rescate maritimo: detectar `boat`, `life jacket` o `person` en imagenes de SeaDronesSee (90,6% de recall) para priorizar zonas de busqueda en operaciones de salvamento en agua abierta.
- Monitorizacion de fauna y ganado: consultar `cattle` o clases de fauna sobre imagenes aereas de WAID (95,2% de recall) para censos de ganado en explotaciones extensivas o seguimiento de poblaciones animales.
- Analisis post-vuelo de misiones SAR: ejecutar el modelo por lotes sobre los fotogramas grabados de un dron y generar listados de detecciones con coordenadas y puntuaciones para que el operador revise solo las regiones candidatas.
- Integracion en pipelines existentes de SAM 3: sustituir `sam3.1_multiplex.pt` por `aeropilot_v1.pt` sin cambiar el codigo de inferencia, lo que permite reutilizar infraestructura ya desplegada y anadir capacidad aerea sin reescribir el pipeline.
- Investigacion en vision aerea: usar el modelo como baseline ajustado a dominio para comparar tecnicas de tiling, NMS o aumento de datos en tareas de deteccion de personas desde dron.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Precision medida a un umbral de confianza fijo de 0,5.

| Benchmark | Dominio | Imagenes test | SAM 3.1 (recall / precision) | AeroPilot-v1 (recall / precision) | AeroPilot-v1, 2x2 tiles |
|---|---|---:|---:|---:|---:|
| HERIDAL test | SAR agreste, 4K | 101 | 65,0 / 74,7 | 87,5 / 72,7 | 91,7 / 75,9 |
| HERIDAL unseen sites | sitios ausentes del entrenamiento | 22 | 69,9 / 67,0 | 87,1 / 71,7 | 91,4 / 73,9 |
| LADD | bosque, campo, nieve | 202 | 70,6 / 91,1 | 92,4 / 90,6 | 96,8 / 86,0 |
| SARD | SAR agreste, baja resolucion | 570 | 79,1 / 90,2 | 91,4 / 88,8 | no disponible |
| WiSARD unseen flight | bosque, vuelo ausente del entrenamiento | 112 | 63,3 / 51,9 | 75,1 / 62,5 | 82,0 / 59,7 |
| HIT-UAV | termico nocturno | 288 | 17,5 / 75,1 | 94,4 / 76,6 | no disponible |
| SeaDronesSee | rescate en agua abierta | 600 | 70,1 / 52,3 | 90,6 / 87,1 | no disponible |
| TinyPerson | personas minusculas, playa y mar | 600 | 57,2 / 74,9 | 68,2 / 69,3 | no disponible |
| WAID | fauna y ganado aereo | 600 | 66,8 / 79,1 | 95,2 / 88,9 | no disponible |
| COCO val2017 | fotos cotidianas, 80 clases | 600 | 78,0 / 71,3 | 80,5 / 65,0 | no disponible |

El autor senala que AeroPilot-v1 es globalmente mas confiado, por lo que a umbral fijo de 0,5 intercambia algo de precision por mucho mas recall; igualando el recall de SAM 3.1 en HERIDAL, su precision es del 87,0% frente al 74,7%. Tambien advierte que las etiquetas de TinyPerson omiten muchas personas visibles, lo que infravalora su precision.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 3,5 GB y el ejemplo oficial usa `torch.autocast("cuda", dtype=torch.bfloat16)`, lo que sugiere que una GPU con al menos 8-12 GB de VRAM deberia poder cargar el modelo en bfloat16, aunque esta cifra es una estimacion y no un dato del autor.
- GPU recomendadas: no especificadas por el autor. Por el tipo de carga (vision de alta resolucion, mosaico 2x2 sobre 4K) se beneficia de GPUs con memoria amplia y buen ancho de banda, como A100 o H100 para procesamiento por lotes; una RTX 4090 es razonable para inferencia individual.
- Cabe en GPU de consumo: probablemente si en GPUs con 12 GB o mas, dado el tamano del checkpoint; no confirmado por el autor.
- Opciones de despliegue: el ejemplo oficial usa PyTorch con el paquete `sam3` (`pip install git+https://github.com/facebookresearch/sam3.git`) y `huggingface_hub` para descargar el checkpoint. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles. El coste se multiplica por el numero de tiles cuando se usa mosaico 2x2 (cuatro pases por fotograma mas NMS).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AeroPilot-v1 | Detector open-vocabulary ajustado a vista aerea | no disponible | no aplica | 91,7% recall HERIDAL (2x2); 94,4% HIT-UAV | SAM License | HuggingFace, descarga sin gate |
| facebook/sam3.1 | Detector/segmentador open-vocabulary general | no disponible | no aplica | 65,0% recall HERIDAL; 17,5% HIT-UAV | SAM License | HuggingFace (modelo base) |
| Detectores SAR especificos (p. ej. entrenados sobre HERIDAL) | Deteccion supervisada cerrada | no disponible | no aplica | no disponible | variable | variable |

La comparacion mas directa y con datos es contra el modelo base SAM 3.1, del que AeroPilot-v1 mejora el recall en los diez benchmarks evaluados. No se dispone de datos de benchmarks de otros detectores SAR especializados en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia SAM License: no es una licencia de codigo abierto permisiva; el uso comercial esta sujeto a las condiciones de Meta y requiere revision legal antes de produccion.
- El modelo solo acepta prompts en ingles; no se ha evaluado su comportamiento con otros idiomas.
- Es un detector de vision, no un LLM: no genera texto, no razona y no soporta agentes ni tool calling.
- Riesgo de falsos positivos: el autor indica que el modelo es mas confiado que el base y que a umbral 0,5 pierde precision en algunas clases (COCO baja de 71,3% a 65,0%).
- El tiling no debe aplicarse a imagenes de baja resolucion: segun el autor, anade falsas alarmas sin mejorar el recall.
- La generalizacion a nuevos dominios no esta garantizada: aunque se evaluo en sitios y vuelos ausentes del entrenamiento, el rendimiento cae en escenarios muy distintos (WiSARD unseen flight: 75,1% de recall frente a 92,4% en LADD).
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Las etiquetas de algunos datasets (TinyPerson) son incompletas, lo que distorsiona las metricas de precision reportadas.
- No hay informacion sobre sesgos demograficos, de horario o de condiciones meteorologicas; en un sistema de rescate esto exige validacion local antes de uso operativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AeroPilot/AeroPilot-v1
- Modelo base SAM 3.1: https://huggingface.co/facebook/sam3.1
- Repositorio oficial de SAM 3 (Meta): https://github.com/facebookresearch/sam3
- Licencia SAM: incluida en el repositorio del modelo (`LICENSE`)
