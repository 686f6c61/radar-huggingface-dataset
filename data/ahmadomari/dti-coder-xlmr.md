# ahmadomari/dti-coder-xlmr

## Resumen

DTI Coder (XLM-RoBERTa presence model) es un clasificador de texto bilingue arabe-ingles desarrollado por Ahmad Alomari (School of Management, Universiti Sains Malaysia) que detecta si una frase extraida de un informe anual describe a la empresa que lo publica usando, adoptando, implementando, desarrollando o planeando usar una de seis tecnologias digitales: IA/aprendizaje automatico, big data, cloud, ERP, contabilidad inteligente y RPA, y XBRL. La salida es binaria (`technology` / `none`); la etiqueta concreta de tecnologia y el nivel de compromiso se asignan despues mediante un diccionario y una regla auditable que viven en el repositorio companion, no en el modelo.

Tecnicamente es un ajuste fino de `FacebookAI/xlm-roberta-base` para clasificacion de secuencias, entrenado sobre 996 frases anotadas a mano (192 positivas) procedentes de informes anuales XBRL de la Bolsa de Amman (Amman Stock Exchange), en ambos idiomas y sin traduccion. El modelo esta pensado para operar sobre frases que ya han pasado un filtro de diccionario, que es la poblacion con la que se entreno.

Su relevancia es metodologica: ofrece una alternativa reproducible y de coste reducido frente a la anotacion manual o al uso de modelos generativos zero-shot para medir la integracion de tecnologia digital en la narrativa financiera, con particiones agrupadas por empresa para evitar fuga de datos y con intervalos de confianza bootstrap publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificacion de secuencias |
| Parametros totales | 278 M aproximadamente (heredados de `xlm-roberta-base`; la model card no los explicita) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens en entrenamiento e inferencia (`max_length=128`); el limite posicional del backbone es 514 |
| Tipos de cuantizacion | No disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | Arabe (ar) e ingles (en); el backbone XLM-R cubre mas idiomas, pero el ajuste fino solo uso estos dos |
| Licencia | MIT |
| Formato de pesos | Pesos de PyTorch para `transformers` (`AutoModelForSequenceClassification`); no se especifica safetensors en la model card |
| Tarea (pipeline) | `text-classification` (clasificacion binaria) |
| Modelo base | `FacebookAI/xlm-roberta-base` |
| Descargas / likes en el Hub | 0 descargas / 1 like |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un encoder transformer multilingue, y anade una cabeza de clasificacion sobre la representacion del token `<s>`. Durante el ajuste fino se congelaron los embeddings y se entrenaron la cabeza de clasificacion y las capas del encoder. La salida es un logit por clase; la clase positiva se decide con un umbral de 0,12 sobre la probabilidad softmax de la clase positiva, seleccionado en validacion.

Los datos de entrenamiento son 996 frases anotadas manualmente (192 positivas) extraidas de informes anuales XBRL de la Bolsa de Amman, en arabe e ingles, sin traduccion entre idiomas. La particion train/validacion es un split agrupado por empresa, de modo que ninguna empresa aparece en ambas particiones en ninguno de los dos idiomas. El entrenamiento uso entropia cruzada con pesos de clase, AdamW, learning rate 3e-5, batch size 16, longitud maxima 128, 5 epocas y un calentamiento lineal del 10 %. No se documenta RLHF ni DPO.

La innovacion principal no esta en la arquitectura sino en el diseno de medicion: el modelo es solo el componente neuronal de un pipeline de tres etapas (filtro de diccionario, clasificador, regla auditable para el nivel de compromiso) y se evalua frente a las alternativas de diccionario puro y LLM zero-shot con intervalos de confianza bootstrap de 2.000 remuestreos.

## Capacidades

- Clasificacion binaria de frases: distingue entre mencion de tecnologia digital (`technology`) y ausencia de mencion (`none`) en narrativa de informes anuales.
- Procesamiento bilingue nativo de arabe e ingles sin traduccion intermedia.
- Trabajo en registro financiero-contable: vocabulario de informes anuales, divulgacion corporativa y terminologia XBRL.
- Deteccion de menciones en distintos grados de compromiso: uso, adopcion, implementacion, desarrollo o intencion de uso (el modelo detecta la mencion; el grado lo asigna la regla externa).
- Integracion en pipeline hibrido: admite un prefiltrado por diccionario que mejora la F1 respecto al modelo por separado.
- Compatibilidad con `transformers` y con endpoints del Hub (etiqueta `endpoints_compatible`).
- No genera texto: no es un modelo causal ni instructivo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No tiene capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Medicion de adopcion tecnologica en la Bolsa de Amman: procesar la narrativa de los informes anuales XBRL de las empresas cotizadas y obtener, frase a frase, un indicador de si la firma declara tecnologias digitales; el modelo ya fue validado con empresas no vistas en entrenamiento de este mercado.
- Investigacion academica en contabilidad y finanzas: construir variables dependientes reproducibles sobre divulgacion tecnologica en lugar de recurrir a proxies o a lectura manual, con una licencia MIT que permite publicar y replicar el pipeline.
- Screening previo a anotacion humana: ejecutar el clasificador sobre corpus grandes para seleccionar frases candidatas y reducir el volumen que deben revisar los anotadores, ya que el umbral 0,12 prioriza la sensibilidad.
- Auditoria y aseguramiento de la informacion: verificar de forma sistematica si una empresa declara el uso de sistemas como ERP, cloud o IA en la parte narrativa de sus cuentas, cruzando la evidencia textual con otras fuentes.
- Construccion de paneles e indices de madurez digital: agregar las predicciones por empresa y ejercicio para obtener series temporales comparables entre firmas, idiomas y sectores.
- Analisis de mercados bilingues: procesar simultaneamente informes en arabe e ingles con un unico modelo, evitando los sesgos que introduce la traduccion automatica en terminologia financiera.
- Prefiltrado en analitica documental de gran escala: actuar como etapa intermedia que descarta la mayoria de frases irrelevantes antes de aplicar reglas o modelos mas costosos, aprovechando que se ejecuta en CPU.
- Soporte a la investigacion en informes no financieros: reutilizar la misma arquitectura para detectar menciones tecnologicas en memorias de sostenibilidad, adaptando el diccionario y reetiquetando una muestra.

## Benchmarks y rendimiento

Resultados en conjuntos de test con empresas no vistas en entrenamiento (cualquiera de los dos idiomas), con intervalo de confianza bootstrap del 95 % sobre 2.000 remuestreos:

| Conjunto de test | n | Positivos | F1 modelo | F1 hibrido (diccionario + modelo) | F1 diccionario | F1 LLM zero-shot |
|---|---|---|---|---|---|---|
| Ingles, 26 empresas | 319 | 39 | 0,659 [0,53; 0,77] | 0,691 [0,56; 0,81] | 0,614 [0,50; 0,71] | 0,618 [0,47; 0,74] |
| Arabe, 27 empresas | 333 | 28 | 0,787 [0,66; 0,89] | 0,814 [0,69; 0,91] | 0,533 [0,41; 0,65] | 0,647 [0,51; 0,77] |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras baterias generales, algo esperable en un clasificador de dominio especifico.

## Requisitos de hardware

- Parametros: aproximadamente 278 M, por lo que el modelo es ligero. Los pesos en fp32 ocupan alrededor de 1,1 GB; en fp16/bf16, unos 0,6 GB; con cuantizacion dinamica int8, en torno a 0,3 GB (estimaciones a partir del tamano del backbone, no publicadas por el autor).
- Inferencia en CPU: viable para procesamiento por lotes de frases de 128 tokens, sin necesidad de GPU.
- GPU consumer: cabe holgadamente en cualquier GPU con 4 GB o mas de VRAM, incluidas GTX 1650, RTX 3060, RTX 4090 o Apple Silicon con MPS.
- GPU de datacenter: no requiere A100 ni H100; se pueden usar para maximizar el throughput por lotes grandes, pero son desproporcionadas para este modelo.
- Opciones de despliegue: `transformers` (`AutoTokenizer` + `AutoModelForSequenceClassification`), `pipeline` de Hugging Face, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportacion a ONNX Runtime o TorchScript y la aplicacion Gradio incluida en el repositorio companion.
- No es un modelo generativo, por lo que vLLM, llama.cpp, Ollama y TGI no son las vias estandar de despliegue.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

La model card solo proporciona comparaciones frente a los dos baselines del mismo estudio (diccionario y LLM zero-shot), no frente a otros clasificadores ajustados para esta tarea.

| Alternativa | Naturaleza | F1 ingles | F1 arabe | Licencia / disponibilidad |
|---|---|---|---|---|
| dti-coder-xlmr | Encoder XLM-R ajustado (278 M aprox.) | 0,659 | 0,787 | MIT, pesos en el Hub |
| dti-coder-xlmr + diccionario | Pipeline hibrido | 0,691 | 0,814 | MIT, requiere el diccionario y el codigo del repositorio |
| Diccionario de palabras clave | Reglas lexicas | 0,614 | 0,533 | Codigo en GitHub, sin pesos |
| LLM zero-shot | Modelo generativo sin ajuste | 0,618 | 0,647 | Depende del LLM empleado, no especificado |

Comparacion con otros encoders multilingues ajustados para clasificacion de informes anuales (AraBERT, MARBERT, mBERT, XLM-R sin ajuste): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito restringido: el modelo fue entrenado sobre frases que ya habian pasado un filtro de diccionario. Aplicarlo a texto arbitrario esta explicitamente no probado y su comportamiento fuera de esa poblacion es impredecible.
- Salida binaria incompleta: el modelo solo indica presencia o ausencia de mencion tecnologica. La tecnologia concreta y el nivel de compromiso provienen del diccionario y de reglas externas, por lo que el resultado final depende de todo el pipeline.
- Umbral especifico: el valor 0,12 esta calibrado sobre la particion de validacion de este corpus. Reutilizarlo en otro dominio o idioma sin recalibrar altera el equilibrio entre precision y exhaustividad.
- Corpus de entrenamiento reducido: 996 frases y solo 192 positivas, con 5 epocas de entrenamiento, lo que limita la robustez ante variaciones de estilo y aumenta el riesgo de sobreajuste al registro de los informes de la Bolsa de Amman.
- Cobertura geografica y de dominio: los datos proceden de un unico mercado (Jordania) y de un unico tipo documental (informes anuales XBRL). El arabe cubierto es el de registro financiero, no dialectal.
- Riesgo de falsos positivos por ambiguedad: frases que mencionan tecnologias en contextos ajenos a la actividad de la empresa pueden clasificarse como positivas.
- Sesgo de clase: aunque se usa entropia cruzada ponderada por clase, la proporcion de positivos es baja (en torno al 12 % en ingles y al 8,4 % en arabe en test), lo que puede degradar la precision en despliegues con distribuciones distintas.
- Intervalos de confianza amplios: los rangos bootstrap se solapan entre modelo, hibrido y baselines, de modo que las diferencias deben interpretarse con cautela.
- Validacion limitada por la comunidad: 0 descargas y 1 like en el Hub, y la referencia asociada es un working paper, no un articulo revisado por pares.
- Licencia: MIT, que permite uso comercial y modificacion, pero el repositorio companion (diccionario, regla de compromiso, codebook y corpus anotado) debe revisarse por separado antes de un uso productivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmadomari/dti-coder-xlmr
- Repositorio companion (codigo, aplicacion Gradio, codebook, diccionario y 1.880 frases anotadas a mano): https://github.com/Ahmadalomari22/dti-coder
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Referencia academica: Alomari, A. y Pitchay, A. A. (2026). DTI Coder: bilingual measurement of digital technology integration in annual-report narrative. Working paper, School of Management, Universiti Sains Malaysia (enlace disponible en el repositorio anterior).
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos enlaces recuperados corresponden a paginas corporativas de Microsoft, sin relacion con el modelo.
