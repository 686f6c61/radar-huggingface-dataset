# oteam/protenix-mini-tmpl

## Resumen

Protenix-mini-tmpl es una variante del modelo Protenix, un predictor de estructura biomolecular de todos los atomos basado en una reproduccion no oficial de AlphaFold3. Lo desarrolla el equipo OFoldX (OTeam-AI4S) a partir del trabajo original de ByteDance, y esta disenado para predecir la estructura tridimensional de proteinas, acidos nucleicos (ARN y ADN), pequenas moleculas y sus complejos. El modelo combina embeddings de atomos y tokens con un tronco Pairformer condicionado por MSA, difusion de coordenadas EDM y cabezas de distograma y confianza.

Esta variante concreta, `protenix-mini-tmpl`, corresponde al modelo mini v0.5 con condicionamiento estructural (structure conditioning) mediante estructuras ruidosas. Frente al modelo base de 368 millones de parametros, esta version reduce el coste computacional a 134,2 millones de parametros, con 16 bloques Pairformer, una unica etapa de MSA y 4 pasos de reciclado, lo que la hace adecuada para entornos con recursos limitados o para experimentacion rapida.

Su relevancia actual radica en que democratiza el acceso a la prediccion de estructuras biomoleculares de tipo AlphaFold3 con un modelo ligero y una licencia AGPL-3.0, si bien su naturaleza no oficial y su escaso ecosistema (cero descargas y cero likes en el momento de la consulta) exigen cautela antes de adoptarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor de estructura biomolecular de todos los atomos basado en Pairformer, con difusion de coordenadas EDM y cabezas de distograma y confianza |
| Parametros totales | 134.211.697 (134,2 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre grafos biomoleculares) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Protenix-mini-tmpl emplea una arquitectura Pairformer con 16 bloques, una sola etapa de MSA, tamano de representacion single de 384 y pair de 128, y 4 pasos de reciclado. Integra embeddings de atomos y tokens, un tronco Pairformer condicionado por MSA con reciclado, difusion de coordenadas EDM para la generacion de coordenadas atomicas, y cabezas de distograma y confianza para la evaluacion de la prediccion. La variante `tmpl` incorpora condicionamiento estructural mediante estructuras ruidosas (noisy structure conditioning), lo que permite aportar evidencia estructural adicional al proceso de prediccion.

El modelo forma parte de la familia Protenix, cuyo paper describe una reproduccion integral de AlphaFold3. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO, dado que no es un modelo generativo de lenguaje. La model card indica que los detalles de entrenamiento se remiten a la seccion "Training Details", cuyo contenido no se ha proporcionado. El modelo depende de la libreria `ofoldx` para su ejecucion.

## Capacidades

- Prediccion de estructura tridimensional de todos los atomos para proteinas, ARN, ADN y pequenas moleculas.
- Prediccion de complejos biomoleculares multiméricos (proteinas con acidos nucleicos y ligandos).
- Condicionamiento estructural mediante estructuras ruidosas, que aporta evidencia estructural adicional.
- Generacion de distogramas y puntuaciones de confianza asociadas a la prediccion.
- Modelado de contactos atomo-atomo y token-token en las variantes con constraint (no en esta variante concreta).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Capacidades multilingues no aplicables.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de estructuras de proteinas individuales: el modelo genera coordenadas atomicas a partir de la secuencia, adecuado para prototipado rapido gracias a su tamano reducido de 134 M de parametros.
- Modelado de complejos proteina-ligando: permite predecir la conformacion de pequenas moleculas unidas a proteinas, util en cribado virtual y diseno de farmacos en fases tempranas.
- Prediccion de estructuras de acidos nucleicos: soporta ARN y ADN, lo que facilita el estudio de interacciones proteina-ARN en biologia estructural.
- Refinamiento con condicionamiento estructural: la variante tmpl acepta estructuras ruidosas como evidencia, lo que permite refinar modelos previos o integrar datos experimentales de baja resolucion.
- Experimentacion academica y docencia: su bajo coste computacional lo hace apto para entornos con GPU de consumo y para la ensenanza de metodos de prediccion estructural.
- Pipeline de validacion en laboratorio: puede emplearse como primer filtro estructural antes de tecnicas experimentales costosas como cristalografia o criomicroscopia.
- Integracion en flujos de diseno de proteinas: combinado con modelos generativos de secuencia, permite evaluar rapidamente la plausibilidad estructural de candidatos disenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 134,2 M de parametros en safetensors (repo de 0,5 GB), la huella de pesos es reducida y cabe holgadamente en GPUs de consumo, aunque el consumo real depende del tamano del complejo de entrada y de la difusion.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, una RTX 4090 o superior seria suficiente para la mayoria de entradas, si bien no se confirma.
- Cabe en GPU de consumo: probablemente si, dado el tamano del modelo, aunque no se especifica.
- Opciones de despliegue: la model card indica el uso de la libreria `ofoldx` mediante `pip install ofoldx` y la pipeline `ofoldx.pipeline("fold", model="oteam/protenix-mini-tmpl")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Bloques Pairformer | Etapas MSA | Pasos de reciclado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| protenix-mini-tmpl | 134,2 M | 16 | 1 | 4 | AGPL-3.0 | HuggingFace (oteam) |
| protenix-mini (v0.5) | 134,1 M | 16 | 1 | 4 | AGPL-3.0 | HuggingFace (oteam) |
| protenix-base (v0.5) | 368,1 M | 48 | 4 | 10 | AGPL-3.0 | HuggingFace (oteam) |
| protenix-tiny (v0.5) | 109,5 M | 8 | 1 | 4 | AGPL-3.0 | HuggingFace (oteam) |

La variante mini-tmpl se diferencia de la mini estandar por el condicionamiento estructural, y de la base por su menor profundidad (16 frente a 48 bloques) y menor numero de etapas MSA y reciclados, lo que reduce coste a cambio de capacidad predictiva. No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Implementacion no oficial: la model card advierte explicitamente de que se trata de una reproduccion no oficial de Protenix y de que el equipo original de ByteDance no escribio esta model card.
- Licencia AGPL-3.0: impone obligaciones de copyleft que pueden afectar al uso comercial y a la distribucion de software derivado; es necesario revisar su compatibilidad con el producto.
- Modelo mini: al reducir bloques, etapas MSA y reciclados, es previsible una menor precision que la variante base, aunque no se aportan metricas que lo cuantifiquen.
- Ecosistema inmaduro: cero descargas y cero likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.
- Dependencia de la libreria `ofoldx`, cuyo mantenimiento y soporte no se detallan.
- Riesgo de alucinacion estructural: como todo predictor, puede generar conformaciones plausibles pero incorrectas; se recomienda validar con puntuaciones de confianza y, cuando sea posible, con datos experimentales.
- Sesgos de datos: no se detalla la composicion del dataset de entrenamiento, por lo que se desconoce la cobertura taxonomica y de tipos de moleculas.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural ni tareas de generacion de texto, codigo o razonamiento.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/protenix-mini-tmpl
- Paper de Protenix: https://doi.org/10.1101/2025.01.08.631967
- Repositorio oficial de Protenix (ByteDance): https://github.com/bytedance/Protenix
- Codigo de ofoldx.models.protenix: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/protenix
- Libreria ofoldx: https://ofoldx.valtech.ai/
- Variante base: https://huggingface.co/oteam/protenix
- Variante v1.0 con corte de datos posterior: https://huggingface.co/oteam/protenix-20250630
- Variante v0.5 base: https://huggingface.co/oteam/protenix-v0.5
- Variante base alternativa: https://huggingface.co/oteam/protenix-base
- Variante con constraint: https://huggingface.co/oteam/protenix-constraint
