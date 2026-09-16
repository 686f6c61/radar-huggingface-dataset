# nesoai/smollm-energy-extraction

## Resumen

`nesoai/smollm-energy-extraction` es un adaptador LoRA publicado en HuggingFace por el usuario `nesoai`, entrenado sobre el modelo base `HuggingFaceTB/SmolLM-360M-Instruct`. Por los tags del repositorio (`peft`, `lora`, `safetensors`, `text-generation`) se trata de un ajuste fino parametrizado eficiente, no de un modelo completo: el artefacto distribuido contiene únicamente los pesos del adaptador, que deben combinarse con el modelo base para poder ejecutar inferencia. El nombre sugiere una especialización en extracción de informacion relacionada con energia (posiblemente entidades, magnitudes o clausulas de documentos del sector energetico), pero no hay ninguna descripcion que lo confirme.

La relevancia actual del artefacto es limitada y debe senalarse con claridad: el repositorio tiene 0 descargas y 0 likes, fue creado el 16 de septiembre de 2026 y su tamano declarado es de 0.0 GB, lo que apunta a que los pesos no estan subidos o a que el repositorio contiene solo metadatos y ficheros de configuracion. La model card es la plantilla por defecto de HuggingFace, con todos los campos marcados como `[More Information Needed]`, incluidos desarrollador, licencia, idiomas, datos de entrenamiento, hiperparametros y evaluacion.

En consecuencia, esta ficha documenta lo que se puede verificar (arquitectura de adaptador, modelo base, formato y estado del repositorio) y marca explicitamente como "no disponible" todo lo que el autor no ha publicado. No se han encontrado papers, blogs, demos ni repositorios asociados en la busqueda web realizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; modelo base `HuggingFaceTB/SmolLM-360M-Instruct` |
| Parametros totales | No disponible para el adaptador. Modelo base: ~360 M de parametros (deducido del identificador `SmolLM-360M`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no declarada en el repositorio) |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en `safetensors`; no se declara el tipo de cuantizacion ni la precision de entrenamiento |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA en formato PEFT) |
| Libreria de carga | `peft` (con `transformers`) |
| Pipeline declarado | `text-generation` |
| Tamano del repositorio | 0.0 GB (indica repositorio vacio o sin pesos publicados) |
| Version de PEFT declarada | 0.19.1 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16T11:43:59Z |
| Ultima actualizacion | 2026-09-16T11:44:00Z (1 segundo despues de la creacion) |
| Region declarada | `us` |

## Arquitectura y entrenamiento

La unica informacion tecnica verificable es que el artefacto es un adaptador LoRA gestionado con la libreria PEFT (version 0.19.1 declarada en la model card) y que su modelo base es `HuggingFaceTB/SmolLM-360M-Instruct`. LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas, de modo que el numero de parametros entrenables es una fraccion pequena del total. El repositorio no publica el rango (`r`), el valor de `alpha`, el `dropout`, las capas objetivo (`target_modules`) ni la configuracion concreta del adaptador.

No hay informacion sobre el corpus de entrenamiento: ni numero de tokens, ni composicion del dataset, ni si se aplicaron tecnicas de alineacion adicionales como RLHF, DPO o SFT supervisado. Tampoco se documentan hiperparametros (tasa de aprendizaje, scheduler, numero de epocas, precision) ni la infraestructura de computo empleada. La seccion de impacto ambiental de la plantilla esta sin rellenar.

Un detalle a tener en cuenta: el unico identificador tipo arXiv presente en los tags es `arxiv:1910.09700`, que corresponde a Lacoste et al. (2019) sobre estimacion de emisiones de carbono en aprendizaje automatico y aparece citado en la plantilla por defecto de HuggingFace. No es el paper del modelo ni describe su metodo de entrenamiento.

## Capacidades

No se ha publicado ninguna descripcion de capacidades especificas del adaptador. Lo unico que puede afirmarse:

- Generacion de texto: es el pipeline declarado (`text-generation`) y la funcion heredada del modelo base `SmolLM-360M-Instruct`.
- Especializacion supuesta: por el nombre `energy-extraction` cabe esperar alguna tarea de extraccion de informacion en el dominio energetico, pero no hay ninguna evidencia documental que lo confirme.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el pipeline declarado es exclusivamente de texto.
- Instruccion seguida: heredada, en su caso, de `SmolLM-360M-Instruct`, pero no verificada para este adaptador.

## Casos de uso

Los siguientes escenarios son hipotesis de aplicacion derivadas del nombre del modelo y de la categoria de adaptadores LoRA sobre modelos pequenos. Ninguno esta respaldado por documentacion del autor, y el repositorio, tal como esta publicado, no permite ejecutarlos (0.0 GB de pesos, 0 descargas).

- Extraccion de entidades del dominio energetico: si el adaptador esta entrenado para ello, se usaria para transformar texto no estructurado (facturas, contratos de suministro, informes tecnicos) en campos estructurados como consumo en kWh, tarifa, CUPS o periodo de facturacion. El modelo base de ~360 M permite ejecutarlo en local y a bajo coste, siempre que la tarea sea de extraccion acotada y no de razonamiento abierto.
- Preprocesado de documentos en pipelines de datos: integrado como paso previo a un sistema mayor, normalizando magnitudes y unidades energeticas antes de enviar el texto a un modelo de mayor tamano. Su ventaja potencial es el coste por token casi nulo frente a modelos de 7B o superiores.
- Clasificacion y etiquetado de textos tecnicos: etiquetar fragmentos de normativa, informes de eficiencia energetica o partes de incidencias en categorias predefinidas, delegando despues la decision final a un sistema de reglas.
- Anotacion asistida para humanos: sugerir extracciones a revisores en plataformas de etiquetado, reduciendo el tiempo de anotacion manual en dominios muy especificos donde el vocabulario es repetitivo.
- Despliegue en el borde (edge) o en dispositivos con recursos limitados: al ser un adaptador sobre un modelo de ~360 M, podria ejecutarse en CPU o en GPUs integradas para tareas de extraccion puntual sin conexion a servicios en la nube, condicionado a que los pesos se publiquen.
- Experimentacion academica con PEFT: servir como punto de partida reproducible para estudiar ajuste fino eficiente en dominios verticales (energia, utilities) con presupuestos de computo minimos, comparando configuraciones de LoRA sobre un mismo modelo base.
- Filtrado previo en busquedas documentales: detectar y extraer automaticamente menciones a consumos, potencias o precios en grandes volumenes de texto para construir indices o alertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con el marcador `[More Information Needed]` en los apartados de datos de prueba, factores, metricas y resultados. No existen datos de MMLU, HumanEval, GSM8K, ni de tareas especificas de extraccion (F1, precision, recall) para este adaptador. No se deben asumir los resultados del modelo base como resultados del adaptador.

## Requisitos de hardware

- VRAM del adaptador: despreciable frente al modelo base; un adaptador LoRA tipico sobre un modelo de 360 M ocupa unos pocos megabytes, aunque el repositorio declara 0.0 GB, por lo que probablemente no hay pesos descargables.
- Estimacion para el modelo base (calculo aritmetico a partir de ~360 M de parametros, no confirmado por el autor): aproximadamente 1.4 GB en fp32, unos 0.7 GB en fp16/bf16, unos 0.36 GB en int8 y alrededor de 0.2-0.25 GB en 4 bits.
- GPUs recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para el modelo base en precision reducida. Una RTX 3060, RTX 4060 o superior lo ejecuta con margen amplio; A100 o H100 no aportan ventaja practica por el reducido tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en CPU, siempre que existan pesos que cargar.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre el modelo base; `llama.cpp` u `Ollama` requeririan convertir el modelo fusionado a GGUF; `vLLM` y TGI soportan adaptadores LoRA, pero no tiene sentido desplegarlos por el tamano del modelo.
- Latencia y throughput: no disponibles. No hay ninguna medicion publicada de velocidad, tokens por segundo ni tiempo de primera token.

## Comparativa con modelos similares

No hay datos suficientes para una comparativa rigurosa, porque no existe informacion publicada sobre el rendimiento, licencia o idiomas de este adaptador. La comparacion solo puede hacerse a nivel estructural:

| Elemento | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `nesoai/smollm-energy-extraction` (adaptador) | No disponible | No disponible | No disponible | Repositorio de 0.0 GB, 0 descargas |
| `HuggingFaceTB/SmolLM-360M-Instruct` (modelo base) | ~360 M (segun identificador) | No disponible en esta informacion | No disponible en esta informacion | Modelo publico en HuggingFace |
| Otros adaptadores LoRA sobre el mismo modelo base | No disponible | No disponible | No disponible | No evaluados en esta ficha |

Conviene subrayar que este artefacto no es comparable en pie de igualdad con un modelo completo: es un complemento que depende del modelo base y cuyo valor depende enteramente de la calidad de sus datos de entrenamiento, que no se han publicado.

## Limitaciones y advertencias

- Repositorio practicamente vacio: el tamano declarado es de 0.0 GB y la actualizacion se produjo un segundo despues de la creacion, lo que sugiere que los pesos no estan disponibles o que el repositorio solo contiene configuracion. Sin pesos no hay inferencia posible.
- Documentacion inexistente: la model card es la plantilla por defecto de HuggingFace, con todos los campos relevantes sin rellenar (desarrollador, licencia, idiomas, datos de entrenamiento, evaluacion).
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso para uso comercial. La licencia del adaptador tambien puede verse condicionada por la del modelo base, que debe consultarse por separado.
- Cero adopcion: 0 descargas y 0 likes implican ausencia total de validacion por parte de la comunidad; no hay informes de terceros sobre su comportamiento.
- Riesgo de alucinacion: no evaluado. En modelos de ~360 M el riesgo de inventar valores en tareas de extraccion (cifras, unidades, fechas) es estructuralmente alto y no debe usarse en produccion sin validacion posterior.
- Sesgos: no disponibles. No se ha documentado la composicion del dataset, por lo que no puede evaluarse el sesgo de dominio, idioma ni de las fuentes utilizadas.
- Limitaciones de contexto e idioma: no disponibles; no se declaran idiomas soportados ni longitud de contexto, y la ventana real dependera del modelo base.
- Aparicion en el indice de busqueda: los resultados de busqueda web asociados no guardan relacion con el modelo (contenido de prensa generalista), lo que confirma que no existe cobertura tecnica, papers ni discusion publica sobre este artefacto.
- Anomalia de metadatos: la fecha de creacion declarada (16 de septiembre de 2026) es posterior a la fecha habitual de publicacion de modelos, un detalle que conviene verificar antes de tratar el repositorio como estable.
- Para produccion: no recomendado en su estado actual. Cualquier uso requeriria confirmar la existencia de pesos, reconstruir la configuracion de LoRA, localizar el modelo base exacto y realizar una evaluacion propia con datos representativos del dominio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nesoai/smollm-energy-extraction
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-360M-Instruct
- Paper citado en la plantilla (Lacoste et al., 2019, sobre emisiones de carbono, no es el paper del modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico mencionada en la plantilla: https://mlco2.github.io/impact
- Paper, blog, repositorio de codigo o demo del autor: no disponible
