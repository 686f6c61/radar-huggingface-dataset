# boltzgen/boltzgen-1

## Resumen

BoltzGen-1 es un modelo generativo para el diseño de proteínas y péptidos capaces de unirse a biomoléculas arbitrarias, publicado por la organización boltzgen en HuggingFace. Se distribuye como un fine-tuning declarado del modelo boltz-community/boltz-2, del que hereda la base estructural de co-folding, y se empaqueta con una librería propia (`boltzgen`) y un repositorio de código en GitHub. La licencia es MIT, lo que permite uso comercial y modificaciones sin restricciones de atribución más allá del aviso de copyright.

El interés del modelo es doble. Por un lado, ataca un problema clásico de la biología computacional —el diseño de binders contra una diana dada— con un enfoque generativo, en lugar de limitarse a la predicción de estructura o de afinidad. Por otro, su adopción ha sido muy rápida: acumula 587.397 descargas y 19 likes en aproximadamente un día desde su publicación (creado el 26 de octubre de 2025, actualizado el 27 de octubre de 2025), un volumen que sugiere un uso intensivo desde pipelines automatizados más que una validación comunitaria pausada.

La información pública disponible es, sin embargo, mínima. La model card se limita a una frase descriptiva y a los badges de enlaces; no se detallan la arquitectura interna, el número de parámetros, los datos de entrenamiento, las métricas de evaluación ni las condiciones de uso previstas. Esta ficha refleja, por tanto, lo declarado y marca explícitamente como «no disponible» todo aquello que el autor no ha publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; declarado como fine-tuning de boltz-community/boltz-2 (familia de modelos Boltz de co-folding estructural) |
| Parametros totales | No disponible. El repositorio ocupa 10,2 GB, pero el desglose de parametros no se publica |
| Parametros activos | No disponible; no se declara que sea un modelo MoE |
| Longitud de contexto | No disponible; no aplica en el sentido de ventana de tokens de un LLM (la entrada es estructural/biomolecular) |
| Tipos de cuantizacion | No disponible; no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible; no aplica (modelo biológico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | No disponible; la model card no especifica safetensors, GGUF ni otros formatos |

## Arquitectura y entrenamiento

El autor declara únicamente que BoltzGen-1 es un modelo generativo para diseñar proteínas y péptidos que se unen a biomoléculas arbitrarias, y que parte de boltz-community/boltz-2 mediante fine-tuning. No se especifica si la generación se implementa con difusión sobre coordenadas atómicas, con un decoder autoregresivo sobre secuencia, con flow matching o con una combinación híbrida; tampoco se detalla el esquema de acondicionamiento a la diana (estructura 3D, secuencia, bolsillo, epitopo) ni el tratamiento de cadenas laterales.

Tampoco hay información sobre el corpus de entrenamiento: número de estructuras, resolución, composición (PDB, datos sintéticos generados con el modelo base, estructuras predichas), ni sobre si se aplicaron etapas de refinamiento tipo RLHF/DPO o filtrado por criterios fisicoquímicos. Dado que el modelo base pertenece a la familia Boltz —orientada a co-folding y predicción de afinidad de unión—, es razonable esperar que el fine-tuning reutilice esos componentes estructurales, pero se trata de una inferencia por linaje del modelo, no de un dato publicado. Cualquier afirmación sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, triangular attention, etc.) carecería de respaldo documental en la información disponible.

## Capacidades

- Generación de proteínas y péptidos con especificidad declarada hacia una biomolécula diana arbitraria.
- Diseño de binders, presumiblemente condicionado a la estructura o secuencia de la diana (el mecanismo exacto de acondicionamiento no está documentado).
- Partida desde un modelo de co-folding (boltz-community/boltz-2), lo que sugiere capacidad de razonamiento estructural sobre complejos proteína-ligando, aunque esta capacidad no se cuantifica en la model card.
- Integración con una librería propia (`boltzgen`) y un repositorio de código asociado, orientados a ejecutar el pipeline de diseño.
- Soporte de tool calling / function calling: no disponible; no aplica al dominio.
- Soporte de agentes y razonamiento multi-paso: no disponible; no documentado.
- Capacidades multilingües: no disponibles; no aplica.
- Modo «thinking», visión o audio: no disponibles; no aplica.

## Casos de uso

- Descubrimiento de binders terapéuticos: generar candidatos de proteína o péptido contra una diana validada (por ejemplo, un receptor de superficie) y priorizar los diseños antes de sintetizarlos, reduciendo el número de construcciones que llegan al laboratorio húmedo.
- Diseño de péptidos inhibidores de interacciones proteína-proteína: muestrear péptidos que se acomoden a una interfaz concreta y filtrar por criterios de complementariedad estérica y electrostática.
- Alternativas a anticuerpos monoclonales: proponer scaffolds proteicos pequeños con afinidad hacia un antígeno, útiles cuando el formato de anticuerpo presenta problemas de estabilidad, coste de producción o penetración tisular.
- Reutilización de dianas huérfanas: para proteínas con estructura resuelta pero sin ligando conocido, emplear el modelo como generador de hipótesis de unión que después se contrastan experimentalmente.
- Desarrollo de reactivos de detección y diagnóstico: diseñar binders contra un analito para ensayos tipo ELISA o sensores, siempre con validación posterior de especificidad frente a proteínas homólogas.
- Diseño de enzimas o inhibidores en biotecnología industrial y agroalimentaria: generar variantes de unión a sustratos o cofactores concretos como punto de partida de un ciclo de evolución dirigida.
- Filtrado in silico previo a campañas de cribado: usar el modelo como generador masivo y acoplar su salida a predictores de afinidad y de estabilidad para descartar candidatos antes de la síntesis.

En todos los casos, el modelo aporta hipótesis de diseño, no validación: ninguna de estas aplicaciones es viable sin caracterización experimental (binding medido, expresión soluble, estabilidad térmica).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. A partir del tamaño del repositorio (10,2 GB) puede estimarse un orden de magnitud de unos 5·10⁹ parámetros si los pesos estuvieran en bf16 y el repositorio contuviera únicamente pesos; se trata de una estimación, no de un dato confirmado, y el repositorio incluye con toda probabilidad otros artefactos.
- GPU recomendadas: no especificadas por el autor. Por el orden de magnitud anterior, cabría esperar requisitos en el rango de 16-24 GB de VRAM, lo que sitúa como candidatas a una RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB), A100 (40/80 GB) o H100 (80 GB). Cualquier cifra concreta debe medirse.
- Viabilidad en GPU de consumo: probablemente sí en tarjetas de 24 GB, condicionado a la implementación real y al tamaño de lote; no verificado.
- Opciones de despliegue: la vía prevista es la librería `boltzgen` junto con el repositorio de GitHub del autor. No aplican servidores de inferencia de LLM (vLLM, TGI, llama.cpp, Ollama), al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BoltzGen-1 | Diseño generativo de binders (proteínas y péptidos) | No disponible | No aplica | MIT | Pesos en HuggingFace + código en GitHub |
| boltz-community/boltz-2 (modelo base) | Co-folding estructural y predicción de afinidad | No disponible en la información proporcionada | No aplica | No verificada en la información proporcionada | HuggingFace |
| Otros generadores de binders (p. ej. herramientas de difusión para diseño de proteínas) | Diseño generativo de proteínas | No disponible | No aplica | No disponible | No disponible |

No se dispone de métricas comparativas publicadas ni de datos de parámetros de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia casi total de documentación: sin arquitectura, datos de entrenamiento ni evaluación, es imposible reproducir el modelo o auditar su comportamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito en diseño de binders (por ejemplo, fracción de diseños con unión confirmada experimentalmente).
- Riesgo de falsos positivos: los diseños generados son hipótesis; el modelo puede producir secuencias que parezcan plausibles in silico pero que no se expresen de forma soluble, que agreguen o que no muestren afinidad medible.
- Sesgo hacia la distribución del modelo base y de los datos de co-folding: es esperable una sobrerrepresentación de familias proteicas bien caracterizadas en el PDB y un peor comportamiento en dianas poco representadas (proteínas de membrana, regiones intrínsecamente desordenadas, glicosilaciones atípicas).
- Idiomas y contexto: no aplica; cualquier limitación de este tipo debe formularse en términos de cobertura estructural y química, que no está documentada.
- Licencia MIT: permite uso comercial y creación de derivados, pero se distribuye sin garantías; el usuario asume toda la responsabilidad sobre los resultados.
- Doble uso y bioseguridad: un generador de binders contra «biomoléculas arbitrarias» puede emplearse con fines legítimos o para diseñar moléculas con potencial dañino. Antes de usar el modelo en producción conviene aplicar controles internos de uso y revisar la normativa aplicable en el país de despliegue.
- Volumen de descargas inusualmente alto en menos de un día: sugiere tráfico automatizado o especulativo, y no debe interpretarse como validación del rendimiento.
- Sin información sobre cuantización: no se conocen variantes optimizadas, por lo que el coste de despliegue debe medirse empíricamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boltzgen/boltzgen-1
- Organización en HuggingFace: https://huggingface.co/boltzgen
- Repositorio de código (GitHub): https://github.com/HannesStark/boltzgen
- Modelo base: https://huggingface.co/boltz-community/boltz-2
- Licencia MIT: https://huggingface.co/boltzgen/boltzgen-1/blob/main/LICENSE
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
