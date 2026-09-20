# mangiis/cca-qwen2.5-3b-lora

## Resumen

cca-qwen2.5-3b-lora es un adaptador LoRA de rango 32 sobre Qwen/Qwen2.5-3B, publicado por el usuario mangiis, que resuelve una tarea muy concreta: el *cross-consistency assessment* (CCA) dentro del Analisis Morfologico General. Dados dos valores procedentes de facetas distintas de un mismo escenario, cada uno con sus premisas de REQUIRES y PROVIDES, el modelo decide si una configuracion real unica podria contener ambos. La salida no es texto generado, sino la distribucion de probabilidad sobre un unico token (Y/N) leida inmediatamente despues de un prefijo fijo "VERDICT:".

El adaptador se entreno durante unas practicas en el Institute for Systems Studies & Analyses (ISSA) de la Defence Research & Development Organisation (DRDO) india, y su interes practico esta en el modo de explotacion: prediccion selectiva con umbral de cobertura, donde el modelo solo emite veredicto en las celdas de las que esta seguro y deriva el resto a revision humana. En ese regimen alcanza F1 0.811 con el 50 % de cobertura, un valor comparable al 0.807 de un segundo analista humano sobre el mismo criterio.

Se trata de un artefacto de nicho y muy joven (publicado en septiembre de 2026, cero descargas y cero likes en el momento de redactar esta ficha), pero metodologicamente interesante: documenta de forma explicita tres condiciones de uso no negociables (aportar las premisas, no alterar la plantilla de prompt y promediar los dos ordenes de presentacion) sin las cuales el rendimiento se degrada de forma silenciosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) con adaptador LoRA/PEFT sobre las siete proyecciones (q, k, v, o, gate, up, down) |
| Parametros totales | Aproximadamente 3.000 millones en el modelo base; 59,9 millones entrenables en el adaptador (1,90 % del total) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la documentacion del adaptador; el modelo base Qwen2.5-3B declara 32.768 tokens nativos segun su propia model card |
| Tipos de cuantizacion | Base cargada en 4 bits NF4 (bitsandbytes, double quant, compute dtype bfloat16); se reporta tambien una variante cuantizada a 4 bits en ONNX. No se publica GGUF |
| Idiomas soportados | Ingles (en), unico idioma declarado; el corpus y la plantilla de prompt estan en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repo 0,3 GB; existe una ruta de exportacion a ONNX cuantizado a 4 bits |
| Modelo base | Qwen/Qwen2.5-3B |
| Libreria | peft (requiere transformers y bitsandbytes para el modo 4 bits) |
| Pipeline declarado | text-classification |
| Rango LoRA | 32, alpha 64, dropout 0,05 |
| Tarea | Clasificacion binaria de un solo token (Y/N) leida desde logits, sin generacion |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-3B, un transformer decoder-only denso de aproximadamente 3.000 millones de parametros, que permanece congelado y cargado en 4 bits NF4. Sobre el se entrena unicamente un LoRA de rango 32 con alpha 64 y dropout 0,05 aplicado a las siete proyecciones del bloque de atencion y del MLP, lo que supone 59,9 millones de parametros entrenables, el 1,90 % del modelo. La innovacion funcional no esta en la arquitectura sino en la interfaz: el modelo no genera una respuesta, sino que se lee el logit de los tokens Y y N en la posicion inmediatamente posterior al prefijo "VERDICT:", se aplica softmax sobre ese par y se obtiene P(inconsistente). El prompt sigue la plantilla de chat del base con un system prompt fijo de analista de defensa y seguridad.

El entrenamiento se realizo sobre un corpus de analisis morfologico en el que cada celda contiene dos opciones de facetas distintas con sus premisas REQUIRES y PROVIDES. El autor documenta un intento previo fallido: una formulacion en la que el modelo debia generar sus propias caracterizaciones antes de juzgar. Bajo *teacher forcing* el modelo aprende a condicionar sobre premisas de referencia, pero en inferencia condiciona sobre su propio texto generado, con una deriva de aproximadamente 250 tokens, y el sistema no funciona. De ahi que el diseno final exija premisas externas. No se indica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO (el fragmento de model card disponible aparece truncado en la seccion de entrenamiento).

La evaluacion se hizo sobre 1.191 celdas retenidas procedentes de 10 dominios nunca vistos en entrenamiento, con el umbral de decision ajustado mediante *leave-one-domain-out*, lo que da una estimacion razonable de generalizacion fuera de dominio.

## Capacidades

- Clasificacion binaria de consistencia cruzada entre dos opciones de facetas distintas de un mismo escenario, con salida probabilistica (P(inconsistente)) en lugar de texto.
- Prediccion selectiva: la probabilidad permite aplicar un umbral de cobertura y derivar los casos dudosos a revision humana.
- Razonamiento sobre premisas explicitas de tipo REQUIRES/PROVIDES (restricciones que una opcion impone al escenario y recursos que aporta).
- Generalizacion a dominios no vistos: el adaptador mantiene AUC 0.878 sobre 10 dominios fuera del conjunto de entrenamiento.
- Reproduccion del criterio de anotacion humana a un nivel comparable a un segundo analista (F1 0.807 a 50 % de cobertura).
- Inferencia ligera: al leer logits de un solo token, no hay decodificacion autoregresiva y la llamada se limita a un *forward pass*.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso generativo, vision, audio ni modo *thinking*. Tampoco se documenta capacidad multilingue: solo ingles.

## Casos de uso

- Analisis morfologico general (GMA) asistido: en talleres de planificacion de escenarios, el modelo actua como pre-filtro del *cross-consistency matrix*, marcando las combinaciones de opciones mutuamente excluyentes y dejando al facilitador la revision de las celdas de baja confianza. Es su caso de uso nativo y para el que existen metricas publicadas.
- Analisis de politicas publicas y normativa: comprobar si dos medidas pertenecientes a ambitos distintos (por ejemplo, fiscalidad y proteccion de datos) pueden coexistir en un mismo marco legal, aportando para cada medida su base juridica (REQUIRES) y su efecto (PROVIDES), y derivando a asesoria juridica los casos con P(inconsistente) intermedia.
- Planificacion de escenarios de defensa y seguridad: el modelo se entreno especificamente con criterio de analista de defensa; sirve para descartar combinaciones inviables de medios, mandatos y marcos legales antes de que un analista humano las evalue una por una.
- Wargaming y simulacion de cursos de accion: validar la coherencia interna de un orden de batalla o de un plan de operaciones compuesto por opciones de distintas dimensiones (medios, reglas de enfrentamiento, entorno), reduciendo el espacio de configuraciones a simular.
- Ingenieria de requisitos y configuracion de producto: detectar requisitos incompatibles entre si en fases tempranas de diseno, cuando cada requisito se describe con lo que exige del sistema y lo que aporta, evitando llegar a integracion con especificaciones contradictorias.
- Triage documental en flujos con supervision humana: desplegado como clasificador de primera linea que solo emite veredicto en el 50 % de los casos mas claros (F1 0.811) y encola el resto, reduciendo la carga de revision sin comprometer la tasa de acierto en lo ya decidido.
- Validacion de matrices de decision en consultoria: generar y auditar matrices de compatibilidad en proyectos de estrategia donde las opciones provienen de ejes independientes (mercado, canal, modelo de ingresos, marco regulatorio).
- Filtrado previo en corpus de analisis: etiquetar automaticamente celdas consistentes e inconsistentes para priorizar la relectura humana de un corpus historico, apoyandose en la variante ONNX de 4 bits para despliegue en entornos con recursos limitados.

## Benchmarks y rendimiento

Evaluacion sobre 1.191 celdas retenidas pertenecientes a 10 dominios nunca vistos en entrenamiento, con umbral ajustado *leave-one-domain-out*:

| Configuracion | AUC | F1 (cobertura 100 %) | F1 (cobertura 50 %) |
|---|---|---|---|
| Adaptador sobre base en 4 bits NF4 | 0.878 | 0.589 | 0.805 |
| Tras cuantizacion ONNX de 4 bits | 0.876 | 0.583 | 0.811 |
| Segundo analista humano, mismo criterio | No disponible | No disponible | 0.807 |

Curva de prediccion selectiva del adaptador (F1 segun cobertura):

| Cobertura | 100 % | 90 % | 80 % | 70 % | 60 % | 50 % | 40 % |
|---|---|---|---|---|---|---|---|
| F1 | 0.583 | 0.582 | 0.630 | 0.693 | 0.754 | 0.811 | 0.827 |

Acuerdo inter-anotador a partir de un re-etiquetado ciego de 289 celdas: 88,9 % de coincidencia con Cohen's kappa = 0.730.

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos publicados son los de la tarea especifica de consistencia cruzada recogidos arriba, y no incluyen comparacion con otros modelos.

## Requisitos de hardware

- Inferencia en 4 bits NF4: el modelo base ocupa aproximadamente 2,5 GB de pesos, mas el adaptador (decenas de MB) y las activaciones de un unico *forward pass* con `logits_to_keep=1`. En la practica cabe en torno a 4 GB de VRAM con lote 1.
- Inferencia en bfloat16 sin cuantizar: aproximadamente 6-7 GB de VRAM para los pesos.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB, RTX 4080/4090 16-24 GB, e incluso en tarjetas de 8 GB si se usa la ruta 4 bits NF4. Tambien es viable en CPU para lotes pequenos, aunque no se publican cifras de latencia.
- GPU de centro de datos (A100, H100) no son necesarias para este tamano; solo tendrian sentido para procesar grandes lotes de celdas en paralelo.
- Opciones de despliegue documentadas: transformers + peft + bitsandbytes (ruta oficial del autor), ONNX Runtime con el modelo cuantizado a 4 bits, y un despliegue en Java publicado en el repositorio del proyecto. vLLM y TGI pueden servir adaptadores LoRA, pero el flujo de lectura de logits de un token concreto y el promedio de los dos ordenes requiere codigo propio. No hay version GGUF, por lo que llama.cpp y Ollama no son utilizables sin convertir el modelo.
- Latencia y throughput: no disponibles. Al no haber decodificacion autoregresiva, cada evaluacion es un unico *forward pass*, pero el autor no publica medidas de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cca-qwen2.5-3b-lora | ~3.000 M base + 59,9 M adaptador | No disponible | AUC 0.878; F1 0.811 a 50 % de cobertura | MIT | HuggingFace (0 descargas) |
| Qwen2.5-3B sin adaptar | ~3.000 M | 32.768 tokens segun el modelo base | No disponible; el autor indica que con nombres de valor sin premisas el modelo puntua al azar | Apache 2.0 (modelo base) | HuggingFace |
| Qwen2.5-3B con prompting zero-shot sobre la misma plantilla | ~3.000 M | 32.768 tokens segun el modelo base | No disponible: no se publica comparacion | Apache 2.0 (modelo base) | HuggingFace |
| Clasificador supervisado tipo encoder (por ejemplo, familia DeBERTa) | No disponible | No disponible | No disponible: no se publica comparacion | No disponible | No disponible |

El autor no incluye en la informacion disponible ninguna comparacion cuantitativa con alternativas; la unica referencia externa es el segundo analista humano (F1 0.807 a 50 % de cobertura). Cualquier comparativa con modelos generativos generalistas o clasificadores encoder requeriria una evaluacion propia sobre el mismo corpus.

## Limitaciones y advertencias

- Requiere premisas externas. Si se le pasan solo los nombres de los valores, sin REQUIRES ni PROVIDES, el modelo puntua a nivel de azar. La formulacion que le pedia generar sus propias caracterizaciones fallo por deriva entre entrenamiento e inferencia.
- La plantilla de prompt no es editable. Debe ser identica byte a byte a la de entrenamiento, incluido el guion largo en "Facet A —". Cualquier deriva degrada el modelo de forma silenciosa: los veredictos siguen siendo fluidos y plausibles mientras los numeros dejan de significar lo mismo. No hay aviso ni error visible.
- Es obligatorio promediar los dos ordenes de presentacion. Omitir ese promedio colapsa la curva de prediccion selectiva a F1 0.000 con 50 % de cobertura: el ranking se mantiene, pero la señal de confianza se invierte y el modelo resulta menos fiable precisamente donde se muestra mas seguro.
- F1 a cobertura completa de 0.589. El modelo no es util como clasificador automatico sin umbral; su valor esta en el modo selectivo.
- Solo ingles. No se declara ni se evalua ningun otro idioma.
- Dominio acotado a analisis de defensa y seguridad. El system prompt y el corpus son de ese ambito, y no se documenta su comportamiento en otros dominios mas alla de las 10 areas de evaluacion.
- Sesgos: no se documentan analisis de sesgo. El criterio aprendido (Y salvo que exista una clausula que lo haga imposible) proviene de un corpus anotado por un equipo concreto, con un acuerdo inter-anotador de kappa 0.730, lo que implica un margen de subjetividad residual no eliminado.
- Riesgo de alucinacion: el modelo no genera texto, por lo que no puede inventar justificaciones, pero si puede emitir veredictos con alta confianza sobre celdas mal formuladas o con premisas incompletas.
- Licencia MIT en el adaptador, lo que permite uso comercial. El modelo base Qwen2.5-3B tiene su propia licencia (Apache 2.0 segun su model card) y debe respetarse por separado al redistribuir.
- No hay publicacion revisada por pares ni validacion independiente: 0 descargas y 0 likes, un unico autor, resultados autoinformados. La model card disponible aparece truncada en la seccion de entrenamiento, por lo que no se conocen el volumen de datos ni el regimen exacto de entrenamiento.
- No existe version GGUF, lo que limita el despliegue en llama.cpp y Ollama.
- Es un adaptador, no un modelo autonomo: requiere descargar Qwen2.5-3B y cargarlo con PEFT y bitsandbytes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mangiis/cca-qwen2.5-3b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Codigo, corpus y despliegue en Java: https://github.com/Onecombatboot/morphological-analyzer
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las entradas devueltas por el buscador corresponden a sitios de botones de sonido y no guardan relacion con el modelo.
