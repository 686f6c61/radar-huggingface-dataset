# introvoyz042/boltz-2

## Resumen

Boltz-2 es un modelo fundacional biomolecular disenado para predecir de forma conjunta la estructura tridimensional de complejos moleculares y su afinidad de union. Lo desarrolla el equipo de Boltz (repositorio oficial mantenido por jwohlwend, vinculado al MIT J-Clinic y a boltz.com). El problema que resuelve es central en el descubrimiento de farmacos: hasta ahora la prediccion fiable de afinidad requeria metodos fisicos de perturbacion de energia libre (FEP), computacionalmente prohibitivos. Boltz-2 es, segun sus autores, el primer modelo de aprendizaje profundo que se aproxima a la precision de FEP ejecutandose aproximadamente 1000 veces mas rapido, lo que habilita cribado in silico a gran escala.

El modelo va mas alla de AlphaFold3 y de su predecesor Boltz-1 al modelar simultaneamente estructura y afinidad de union, en lugar de tratar la afinidad como una tarea separada. Segun la descripcion publica, es un modelo de co-folding acelerado por GPU que cubre proteinas, acidos nucleicos y ligandos de molecula pequena, y que devuelve metricas de confianza por complejo y por cadena (pLDDT, pTM, ipTM, PAE, PDE), ademas de embeddings simples y por pares de forma opcional. La ficha que se documenta aqui corresponde al repositorio `introvoyz042/boltz-2`, un duplicado del espacio original `boltz-community/boltz-2` con licencia MIT y 6,2 GB de contenido.

La relevancia actual del modelo radica en su caracter abierto (licencia MIT) frente a alternativas de pesos restringidos, y en la velocidad con la que permite priorizar candidatos antes de recurrir a FEP. No obstante, la model card del repositorio duplicado esta practicamente vacia y no aporta detalles de arquitectura, entrenamiento ni evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de co-folding biomolecular (detalles de arquitectura interna no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 6,2 GB) |

## Arquitectura y entrenamiento

La informacion publica describe Boltz-2 como un modelo fundacional biomolecular de co-folding, es decir, que procesa conjuntamente proteinas, acidos nucleicos y ligandos de molecula pequena para predecir la estructura del complejo resultante. A diferencia de Boltz-1, que abordaba principalmente la prediccion estructural, Boltz-2 incorpora de forma nativa la prediccion de afinidad de union al mismo tiempo que la estructura. La documentacion disponible no especifica el numero de parametros, la profundidad de la red, el mecanismo de atencion ni el tipo exacto de representacion interna.

Tampoco se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de ajuste como RLHF o DPO (poco habituales en este dominio). La innovacion tecnica destacada por los autores es la capacidad de aproximarse a la precision de los metodos FEP con una ganancia de velocidad de aproximadamente 1000x, lo que convierte el modelo en una herramienta viable para cribado masivo. No se dispone de informacion sobre tecnicas adicionales como decodificacion especulativa o atencion lineal, que no aplican directamente a este tipo de modelo.

## Capacidades

- Prediccion de la estructura 3D de complejos biomoleculares, incluyendo proteinas, acidos nucleicos y ligandos de molecula pequena.
- Prediccion conjunta de afinidad de union, integrada en el mismo paso que la prediccion estructural.
- Generacion de metricas de confianza por complejo y por cadena: pLDDT, pTM, ipTM, PAE y PDE.
- Devolucion opcional de embeddings simples y por pares, utiles como representaciones para tareas posteriores.
- Ejecucion acelerada por GPU orientada a cribado in silico de alto rendimiento.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, function calling ni razonamiento multi-paso conversacional.
- Capacidades multilingues: no aplica.
- Capacidades especiales: modelado de afinidad con precision cercana a FEP a una fraccion del coste computacional (segun los autores).

## Casos de uso

- Cribado virtual de farmacos: el modelo permite evaluar rapidamente grandes bibliotecas de compuestos frente a una diana proteica, priorizando candidatos por afinidad predicha antes de recurrir a metodos FEP mucho mas costosos.
- Priorizacion de candidatos antes de FEP: dado que se aproxima a la precision de FEP con una velocidad aproximadamente 1000x superior, se puede usar como filtro previo para reducir el conjunto sobre el que aplicar calculos fisicos exactos.
- Diseno de moleculas (molecular design): al modelar estructura y afinidad conjuntamente, sirve para iterar sobre modificaciones estructurales de un ligando y estimar el efecto sobre la union.
- Analisis de complejos proteina-ligando: genera la estructura del complejo con metricas de confianza (pLDDT, ipTM, PAE) que permiten valorar la calidad de cada prediccion antes de usarla.
- Modelado de acidos nucleicos: cubre complejos que incluyen ADN o ARN, ampliando su aplicacion a dianas no proteicas.
- Generacion de embeddings para modelos downstream: los embeddings simples y por pares pueden alimentar clasificadores o modelos predictivos secundarios (por ejemplo, prediccion de toxicidad o propiedades ADMET).
- Validacion estructural en pipelines de descubrimiento: integrable como paso automatico de evaluacion estructural dentro de flujos de trabajo computacionales de quimica medicinal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La unica afirmacion cuantitativa recogida es cualitativa y procede de los autores: Boltz-2 se aproxima a la precision de los metodos FEP con una velocidad aproximadamente 1000 veces superior. No se dispone de valores concretos de metricas como exactitud de afinidad, RMSD estructural, MMLU, HumanEval o GSM8K (estas ultimas no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. La descripcion de BioLM indica que el modelo es "acelerado por GPU", sin especificar modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no son aplicables a este tipo de modelo; el despliegue se realiza a traves del repositorio oficial de Boltz.
- Latencia y throughput estimados: no disponible, salvo la referencia cualitativa de ser aproximadamente 1000x mas rapido que FEP.
- Tamano del repositorio: 6,2 GB, lo que da una idea del orden de magnitud de los pesos, pero no permite estimar la VRAM necesaria sin conocer el formato y la precision.

## Comparativa con modelos similares

| Modelo | Tipo | Afinidad de union | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boltz-2 | Co-folding biomolecular | Si, conjunta con estructura | no disponible | MIT | Abierta (pesos en HuggingFace) |
| Boltz-1 | Prediccion estructural | No descrita en la informacion disponible | no disponible | Abierta (primer modelo totalmente open source en acercarse a AlphaFold3) | Abierta |
| AlphaFold3 | Prediccion estructural | No descrita como funcion principal | no disponible | No totalmente abierta en su distribucion original | Pesos con restricciones de uso |

Los datos de parametros, contexto y rendimiento de los modelos comparados no estan disponibles en la informacion proporcionada, por lo que la comparacion se limita al tipo de tarea, el alcance funcional y el regimen de licencia.

## Limitaciones y advertencias

- La model card del repositorio `introvoyz042/boltz-2` esta practicamente vacia: solo declara `license: mit`, sin documentacion tecnica adicional.
- Se trata de un duplicado del espacio original `boltz-community/boltz-2`; conviene verificar que los pesos y la version coinciden con los del repositorio oficial antes de usarlo en produccion.
- El repositorio no registra descargas ni "likes", y no hay evidencia de validacion por parte de la comunidad en este espacio concreto.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion estructural ni tasas de error en dominios concretos (por ejemplo, proteinas de membrana o ligandos covalentemente unidos).
- Al ser un modelo predictivo y no de lenguaje, el "riesgo de alucinacion" se traduce en predicciones estructurales o de afinidad incorrectas con alta confianza aparente; es imprescindible contrastar con validacion experimental.
- Limitaciones de contexto e idioma: no aplica en el sentido habitual, pero no hay informacion sobre el tamano maximo de complejo o secuencia que el modelo puede procesar.
- Licencia MIT: permite uso comercial, aunque se recomienda revisar las condiciones del proyecto original Boltz y las licencias de los datos de entrenamiento subyacentes.
- Advertencia para produccion: la ausencia de benchmarks publicados en esta fuente impide garantizar el rendimiento en un caso de uso concreto sin una evaluacion previa propia.

## Enlaces

- Repositorio duplicado en HuggingFace: https://huggingface.co/introvoyz042/boltz-2
- Repositorio original (referenciado como origen del duplicado): https://huggingface.co/boltz-community/boltz-2
- Pagina oficial del modelo: https://boltz.com/boltz2
- Repositorio GitHub oficial de Boltz: https://github.com/jwohlwend/boltz
- Ficha de Boltz-2 en BioLM: https://biolm.ai/models/boltz2/
- Articulo del MIT J-Clinic sobre Boltz-2: https://jclinic.mit.edu/boltz-2-towards-accurate-and-efficient-binding-affinity-prediction/
