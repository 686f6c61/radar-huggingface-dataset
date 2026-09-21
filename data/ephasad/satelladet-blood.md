# EphAsad/SatellaDet-Blood

## Resumen

SatellaDet-Blood es un modelo de deteccion de objetos aplicado a microscopia de sangre periferica, publicado por el autor EphAsad (Ephraim Asad) en HuggingFace. Se trata de un banco de pruebas publico de la arquitectura personalizada SatellaDet, desarrollada originalmente para deteccion densa de objetos microbiologicos (colonias), y este experimento evalua si la misma arquitectura puede generalizar a un dominio de microscopia sustancialmente distinto sin redisenarla especificamente para celulas sanguineas. El modelo se entreno desde cero a una resolucion de 640 x 640 y detecta tres clases: globulos blancos (WBC), globulos rojos (RBC) y plaquetas.

A diferencia de los modelos generativos habituales en HuggingFace, SatellaDet-Blood no es un modelo de lenguaje: su tarea es la deteccion de instancias sobre imagenes de microscopia. El repositorio publica dos artefactos principales, una exportacion ONNX desplegable y un checkpoint de PyTorch seleccionado mediante la metrica propia SatellaScore, junto con graficas de entrenamiento y metricas agregadas de test.

Su relevancia actual reside en que aporta un punto de referencia reproducible sobre el conjunto publico TXL-PBC (1.260 imagenes de microscopia y 18.143 celulas anotadas), con una separacion estricta entre validacion y test: el checkpoint se selecciono unicamente con el split de validacion y las metricas principales corresponden al split de test oficial no utilizado durante el entrenamiento. El autor advierte explicitamente que no es un sistema de diagnostico clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SatellaDet, arquitectura de deteccion de objetos personalizada de Ephraim Asad; detalles internos de capas y backbone no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de deteccion de objetos sobre imagenes, no generativo de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un export ONNX, sin precision ni cuantizacion documentadas) |
| Idiomas soportados | no aplicable (entrada de imagenes); no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model/SatellaDet_Blood_TXL_PBC_640.onnx`) y checkpoint de PyTorch (`model/best_score.pt`) |
| Resolucion de entrada | 640 x 640 |
| Clases detectadas | WBC, RBC, Platelets |
| Tarea (pipeline) | object-detection |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |

## Arquitectura y entrenamiento

SatellaDet es una arquitectura de deteccion de objetos de desarrollo propio, concebida inicialmente para deteccion densa de objetos microbiologicos. En este trabajo se entreno desde cero, sin partir de un detector de celulas sanguineas preentrenado, a una resolucion de 640 x 640 sobre el conjunto TXL-PBC. El objetivo declarado del experimento es comprobar la capacidad de generalizacion de la arquitectura a un dominio de microscopia diferente (sangre periferica) sin adaptaciones especificas de diseno. No se documentan en la informacion disponible ni el backbone, ni el numero de parametros, ni el numero de tokens o imagenes por epoca, ni el uso de tecnicas de aumento de datos, destilacion o decodificacion especulativa.

El conjunto de datos TXL-PBC contiene 1.260 imagenes de microscopia con 18.143 celulas anotadas y splits oficiales de entrenamiento, validacion y test. La seleccion del checkpoint no se hizo por perdida sino mediante la metrica SatellaScore, que combina mAP50-95 (35 %), mAP50 (25 %), F1 (30 %) y error de conteo (10 %), con ponderacion igual entre clases (0,333333 para WBC, 0,333333 para RBC y 0,333334 para Platelets) para evitar que la clase RBC, mucho mas numerosa, domine la seleccion. El checkpoint seleccionado corresponde a la epoca 64. No se documentan en la informacion proporcionada detalles sobre el esquema de optimizacion, funcion de perdida, tasa de aprendizaje ni composicion exacta de las particiones.

## Capacidades

- Deteccion de instancias de tres clases celulares en imagenes de microscopia de sangre periferica: WBC, RBC y Platelets.
- Localizacion con cajas delimitadoras y clasificacion por clase, con umbral de confianza configurable en inferencia.
- Conteo de celulas por imagen, evaluado de forma explicita con las metricas Count MAE y Count bias.
- Inferencia a resolucion fija de 640 x 640.
- Export ONNX para despliegue en entornos heterogeneos, ademas del checkpoint nativo de PyTorch.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue ni multimodal mas alla de la propia entrada de imagen.
- No dispone de modo de pensamiento (thinking mode), audio ni vision generativa.

## Casos de uso

- Investigacion en deteccion de objetos: servir como referencia reproducible de la arquitectura SatellaDet sobre un conjunto publico, permitiendo reproducir y comparar metricas bajo un protocolo definido.
- Experimentacion en vision por computador: analizar el comportamiento de un detector entrenado desde cero en un dominio de microscopia distinto al de su concepcion original.
- Evaluacion de arquitecturas: usar los artefactos publicados (checkpoint, export ONNX, graficas y resumenes de metricas) como linea base al comparar nuevos detectores sobre TXL-PBC.
- Conteo automatizado de celulas en imagenes de microscopia con fines de investigacion: el modelo reporta un Count MAE de 1,2540 y un sesgo de -0,6032 en el test no visto, lo que permite estimar recuentos poblacionales en estudios exploratorios, nunca con valor diagnostico.
- Preprocesado de pipelines de analisis de imagen biomedical: actuar como etapa de deteccion previa al recorte de regiones de interes para clasificadores o analisis morfologicos posteriores.
- Docencia y formacion: ilustrar el ciclo completo de un detector de objetos, incluida la seleccion de checkpoint mediante una metrica compuesta como SatellaScore y la validacion sobre un split intocado.
- Prototipado de herramientas de microscopia asistida en laboratorio: integracion del export ONNX en aplicaciones de escritorio o servicios internos para visualizar detecciones y recuentos sobre imagenes nuevas.
- Auditoria de generalizacion de dominio: medir la degradacion de un detector al pasar de colonias microbiologicas a celulas sanguineas, comparando las metricas de validacion y test publicadas.

## Benchmarks y rendimiento

Resultados sobre el split de test oficial de TXL-PBC, no utilizado para la seleccion del checkpoint.

| Metrica | Test no visto |
|---|---:|
| Precision | 0,9239 |
| Recall | 0,9065 |
| mAP50 | 0,9341 |
| mAP50-95 | 0,7346 |
| Count MAE | 1,2540 |
| Count bias | -0,6032 |

Rendimiento por clase sobre el mismo split de test.

| Clase | GT | Pred | Precision | Recall | F1 | mAP50 | mAP50-95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| WBC | 133 | 111 | 1,0000 | 0,8346 | 0,9098 | 0,9172 | 0,7163 |
| RBC | 1.699 | 1.636 | 0,9615 | 0,9258 | 0,9433 | 0,9523 | 0,7858 |
| Platelets | 49 | 58 | 0,8103 | 0,9592 | 0,8785 | 0,9330 | 0,7018 |

Metricas del checkpoint seleccionado en validacion (epoca 64).

| Metrica | Validacion |
|---|---:|
| Precision | 0,941 |
| Recall | 0,904 |
| mAP50 | 0,9378 |
| mAP50-95 | 0,7353 |
| SatellaScore | 0,8602 |

Alineacion entre validacion y test.

| Metrica | Validacion | Test |
|---|---:|---:|
| mAP50 | 0,9378 | 0,9341 |
| mAP50-95 | 0,7353 | 0,7346 |

El autor advierte que, dado que la configuracion de entrenamiento e implementacion de evaluacion puede variar entre detectores, cualquier comparacion con resultados publicados por otras arquitecturas debe tratarse como contextual salvo que se realice bajo un protocolo experimental equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica el numero de parametros ni el tamano del checkpoint, por lo que no es posible calcular una cifra fiable.
- GPU recomendadas: no disponibles en la informacion proporcionada. El export ONNX es agnostico respecto al hardware de ejecucion, de modo que puede desplegarse sobre GPU de distintos fabricantes, pero sin cifras de rendimiento publicadas.
- Compatibilidad con GPU de consumo: no confirmada. La resolucion de entrada (640 x 640) es habitual en detectores que caben en GPU de gama media, pero el autor no publica datos de memoria ni latencia que permitan afirmarlo.
- Opciones de despliegue: el repositorio ofrece un export ONNX, lo que habilita su ejecucion mediante runtimes compatibles con dicho formato; el checkpoint de PyTorch puede cargarse con el ecosistema de PyTorch. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de deteccion de objetos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos alternativos (por ejemplo, otros detectores evaluados sobre TXL-PBC) en la informacion disponible, por lo que no es posible construir una comparativa verificable. El propio autor senala que las comparaciones con otras arquitecturas deben considerarse contextuales salvo que se evalúen bajo un protocolo experimental identico.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SatellaDet-Blood | no disponible | no aplicable | mAP50 0,9341 y mAP50-95 0,7346 en test TXL-PBC | no disponible | HuggingFace (ONNX y PyTorch) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un sistema de diagnostico clinico. El autor indica explicitamente que no debe utilizarse para emitir diagnosticos medicos ni para tomar decisiones sobre el cuidado de pacientes.
- Sesgos conocidos: la seleccion de checkpoint se pondero por clase para evitar el dominio de RBC, pero el reparto de anotaciones esta muy desequilibrado (1.699 RBC frente a 133 WBC y 49 Platelets en el test), lo que limita la significacion estadistica de las metricas de las clases minoritarias.
- Desempeno desigual por clase: WBC obtiene precision 1,0000 pero recall 0,8346 (111 predicciones frente a 133 instancias reales), y Platelets muestra recall 0,9592 con precision 0,8103 y 58 predicciones frente a 49 reales, lo que sugiere sobreprediccion en esa clase.
- Sesgo de conteo: el Count bias es -0,6032, es decir, el modelo tiende a infraestimar ligeramente el numero de celulas.
- Riesgo de alucinacion en sentido estricto no aplicable, pero si existe riesgo de falsos positivos y falsos negativos en la deteccion, con las consecuencias que ello tendria en un uso clinico.
- Limitaciones de contexto e idioma: no aplicables al no ser un modelo de lenguaje; la tarea esta limitada a imagenes de microscopia del dominio representado en TXL-PBC.
- Generalizacion limitada: el modelo se entreno desde cero sobre un unico conjunto (TXL-PBC) y no se documentan evaluaciones en otros conjuntos, microscopios, tinciones o condiciones de adquisicion.
- Licencia: no disponible, por lo que no puede confirmarse si se permite el uso comercial. Conviene contactar con el autor antes de cualquier despliegue en produccion.
- Comparaciones con terceros: el autor advierte que las metricas publicadas por otras arquitecturas pueden no ser directamente comparables si la configuracion de entrenamiento o la implementacion de evaluacion difieren.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin publicacion cientifica asociada al detector descrita en la model card.
- Fecha de creacion del repositorio registrada como 2026-09-21 y actualizacion el mismo dia, dato coherente con un lanzamiento reciente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EphAsad/SatellaDet-Blood
- Repositorio de la arquitectura SatellaDet: https://github.com/EphraimAsad/SatellaDet
- Repositorio del conjunto de datos TXL-PBC: https://github.com/lugan113/TXL-PBC_Dataset
- Referencia del conjunto de datos: Gan, L., Li, X. & Wang, X. "TXL-PBC: a peripheral blood cell dataset with comprehensive annotations", Scientific Data 12, 1694 (2025), DOI 10.1038/s41597-025-05980-z
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos no guardan relacion con SatellaDet-Blood.
