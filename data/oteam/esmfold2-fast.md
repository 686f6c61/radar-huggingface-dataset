# oteam/esmfold2-fast

## Resumen

ESMFold2 Fast es una implementación no oficial, publicada por el usuario `oteam` bajo el paraguas del proyecto OFoldX, del modelo ESMFold2 descrito por Biohub en el trabajo *Language Modeling Materializes a World Model of Protein Biology*. Se trata de un modelo de predicción de estructura biomolecular todo-átomo que combina un codificador de lenguaje de proteínas congelado (ESMC-6B, alojado en `multimolecule/esmc-6b`) con un tronco de plegamiento recurrente y una cabeza de difusión que genera coordenadas atómicas. La variante *fast* reduce el tronco a 24 bloques y prescinde del condicionamiento por MSA, lo que la convierte en la opción de una sola secuencia y menor coste computacional de la familia.

El problema que resuelve es el plegamiento y la anotación estructural de proteínas sin necesidad de alineamientos múltiples, un escenario habitual en proteomas metagenómicos y en proteínas huérfanas sin homología detectable. Frente a la variante completa (`oteam/esmfold2`, 48 bloques y MSA opcional), esta versión sacrifica parte del potencial de precisión a cambio de un pipeline más simple: solo secuencia de entrada, sin base de datos de homólogos. La familia incluye además variantes experimentales que exponen el modelo de inversión diferenciable empleado para el diseño de secuencias de binders.

Su relevancia actual es doble: por un lado, reproduce una arquitectura de plegamiento de última generación sobre la librería `ofoldx`; por otro, lo hace bajo licencia AGPL-3.0 y sin respaldo de los autores originales, con 0 descargas y 0 likes en el momento de la consulta. El repositorio ocupa 0,8 GB y los pesos en safetensors suman 188.511.773 parámetros, aunque el sistema completo con el codificador ESMC-6B alcanza aproximadamente 6.548 millones según la tabla de especificaciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco de plegamiento recurrente condicionado por ESMC, con cabeza de difusion para generacion de coordenadas todo-atomo y cabezas de distograma y confianza |
| Parametros totales | 188.511.773 en los safetensors del repositorio; ~6.548 M si se incluye el codificador ESMC-6B congelado referenciado |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se documenta limite de longitud de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo de biologia estructural; la entrada son secuencias de proteinas, no texto natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Bloques de plegamiento | 24 |
| Condicionamiento MSA | no |
| Codificador ESMC | 6B (congelado, `multimolecule/esmc-6b`) |
| Dimensiones internas | single 384, pair 256, atom 128, token 768 |
| Actualizaciones recurrentes | 4 |
| Pasos de muestreo | 14 |
| Tamano del repositorio | 0,8 GB |
| Libreria | ofoldx |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un modelo de plegamiento de proteínas en tres etapas. Primero, un codificador de lenguaje ESMC de 6B parámetros, congelado y compartido con la variante completa, transforma la secuencia en representaciones por token. Después, un tronco de plegamiento recurrente de 24 bloques actualiza de forma iterativa las características de token y de par (4 actualizaciones recurrentes), manteniendo representaciones con dimensiones single de 384, pair de 256 y token de 768. Finalmente, una cabeza de difusión genera las coordenadas atómicas (canal atómico de 128) a lo largo de 14 pasos de muestreo, y sendas cabezas de distograma y confianza puntúan el resultado. La variante *fast* se distingue del modelo completo en que no consume evidencia MSA y en que reduce el tronco de 48 a 24 bloques.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible. Sí se especifica un contrato geométrico explícito: las fronteras de coordenadas consumen una proyección numérica finita, los valores no disponibles se seleccionan bajo máscara antes de cualquier operación aritmética o conversión de dtype, y los valores no finitos activos se consideran peticiones inválidas. El eje de átomos de referencia es no rellenado y completo; los componentes sin conformero de referencia utilizable se embeben desde su grafo determinado con la semilla del procesador y generan un registro `reference_embedded`. La decodificación emplea correspondencias de átomos preparadas, y la elección de átomo representativo sigue una convención declarada: para proteínas CB, después CA y después el primer átomo admitido; para ácidos nucleicos C4 en clases púricas o C2 en el resto de clases conocidas, después C1′.

## Capacidades

- Prediccion de estructura biomolecular todo-atomo (proteinas y componentes de acidos nucleicos) a partir de secuencia, sin necesidad de MSA.
- Generacion de coordenadas mediante difusion con 14 pasos de muestreo y 4 actualizaciones recurrentes del tronco.
- Puntuacion interna mediante cabezas de distograma y de confianza sobre la estructura generada.
- Funcionamiento en modo single-sequence, adecuado para proteinas sin homologia conocida.
- Soporte de asignacion de atomos representativos y de mascaras de disponibilidad para componentes incompletos.
- Capacidad de diseno de secuencias de binders de proteinas a traves de las variantes experimentales de la familia (modelo de inversion diferenciable), no en esta variante de plegamiento.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de texto o audio: no es un modelo de lenguaje generativo de proposito general.
- Capacidades multilingues: no aplica.

## Casos de uso

- Anotacion estructural de proteomas metagenomicos: al prescindir de MSA, el modelo puede procesar secuencias de microorganismos no cultivados o de proteinas huerfanas donde la busqueda de homologos no devuelve resultados; la variante de 24 bloques reduce el coste por proteina en cribados de decenas de miles de secuencias.
- Cribado de variantes y mutantes: para un panel de mutaciones puntuales de una proteina de interes, el pipeline single-sequence permite generar estructuras de cada variante y comparar el distograma y las puntuaciones de confianza para priorizar las que alteran el pliegue.
- Priorizacion de dianas farmaceuticas: prediccion de estructura de candidatos terapeuticos antes de disponer de estructura experimental, como paso previo a docking o a diseño racional de ligandos.
- Diseño de binders (via variantes experimentales): la familia incluye artefactos con el modelo de inversion diferenciable; la variante `esmfold2-experimental-fast` se emplea para la optimizacion de secuencia de binder, tomando el destino como una secuencia de proteina de una letra por cadena.
- Integracion en pipelines de biologia estructural automatizados: la API de la libreria `ofoldx` permite encadenar prediccion, decodificacion y evaluacion de confianza dentro de flujos reproducibles, con contrato explicito de mascaras y tipos numericos.
- Docencia y prototipado en bioinformatica: al ser un modelo de 0,8 GB en reposo con pesos en safetensors, sirve para experimentar con arquitecturas de plegamiento condicionadas por representaciones de lenguaje sin depender de MSA ni de bases de datos de homologia.
- Analisis de acidos nucleicos: el contrato de atomos representativos cubre clases púricas y pirimidínicas, lo que permite procesar componentes nucleicos junto con cadenas proteicas en un mismo complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de pLDDT, TM-score, lDDT, GDT ni comparaciones cuantitativas con AlphaFold2, AlphaFold3 o ESMFold, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para los pesos: el tronco de 188,5 M parámetros ocupa aproximadamente 0,38 GB en bf16 y 0,75 GB en fp32; el codificador ESMC-6B congelado en bf16 añade del orden de 13 GB, por lo que el sistema completo parte de unos 13,5-14 GB solo en pesos.
- Memoria de activaciones: la representación de pares escala de forma cuadrática con la longitud de la secuencia (L² × 256 canales), de modo que una cadena de 1.000 residuos requiere del orden de 0,5 GB por tensor de pares en bf16; secuencias largas disparan el consumo por encima de lo que sugiere el recuento de parámetros.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para lotes grandes o cadenas largas; A6000 48 GB como alternativa de gama profesional.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB debería poder ejecutar la inferencia en bf16 para secuencias moderadas, aunque con poco margen para activaciones en cadenas largas; GPU de 16 GB (RTX 4080, 4070 Ti Super) quedan por debajo de la estimación de pesos del sistema completo.
- Despliegue: la vía documentada es la librería `ofoldx` (`pip install ofoldx`) sobre PyTorch. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no son aplicables a un modelo de plegamiento no autoregresivo.
- Latencia y throughput: no disponibles. Cualquier estimación debe construirse a partir de 14 pasos de muestreo por 4 actualizaciones recurrentes sobre el tronco, más el coste único del codificador de 6B.

## Comparativa con modelos similares

| Modelo | Parametros | MSA | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/esmfold2-fast | 188,5 M en repo; ~6.548 M con ESMC-6B | No | Todo-atomo, difusion | AGPL-3.0 | HuggingFace, libreria `ofoldx` |
| oteam/esmfold2 | ~6.586 M con ESMC-6B | Si (opcional) | Todo-atomo, difusion | AGPL-3.0 | HuggingFace, libreria `ofoldx` |
| ESMFold (v1, Meta) | no disponible en la informacion suministrada | No | Backbone atomico | no disponible en la informacion suministrada | Publico |
| AlphaFold2 (DeepMind) | no disponible en la informacion suministrada | Si | Backbone atomico | no disponible en la informacion suministrada | Publico |
| AlphaFold3 | no disponible en la informacion suministrada | Si | Todo-atomo con ligandos | no disponible en la informacion suministrada | Restringido |

Nota: los datos de los sistemas de referencia (ESMFold v1, AlphaFold2, AlphaFold3) no forman parte de la informacion proporcionada en esta busqueda y se marcan como no disponibles para no introducir cifras no verificadas.

## Limitaciones y advertencias

- Implementacion no oficial: los autores originales de ESMFold2 (Candido, Hayes, Derry, Rao, Lin, Verkuil y colaboradores, Biohub) no escribieron, revisaron ni respaldan esta implementacion ni su model card.
- Ausencia de MSA: la variante *fast* no consume evidencia de alineamientos multiples, lo que previsiblemente penaliza la precision en proteinas con homologia lejana; la model card no cuantifica esa perdida.
- Riesgo de alucinacion estructural: como todo modelo generativo de coordenadas, puede producir conformaciones plausibles pero incorrectas. El modelo expone cabezas de confianza y distograma, pero no se documentan umbrales ni calibracion en la informacion disponible.
- Licencia AGPL-3.0: copyleft fuerte. Ofrecer el modelo como servicio en red puede obligar a liberar el codigo de la aplicacion que lo integra; es imprescindible una revision legal antes de cualquier despliegue comercial propietario.
- Sesgo de datos de entrenamiento: no se documenta la composicion del dataset; los modelos de plegamiento entrenados sobre PDB suelen sobrerrepresentar familias proteicas bien estudiadas y organismos modelo.
- Discrepancia de recuento de parametros: los safetensors del repositorio contienen 188,5 M de parametros, mientras que la tabla del autor declara ~6.548 M para la variante Fast. La diferencia corresponde al codificador ESMC-6B congelado y referenciado, pero conviene presupuestar hardware sobre el total, no sobre el tamano del repo.
- Madurez limitada: 0 descargas y 0 likes, libreria `ofoldx` con un unico mantenedor aparente y sin benchmarks publicados; el soporte y la estabilidad de la API no estan garantizados.
- Contrato geometrico estricto: los valores no finitos activos se consideran peticiones invalidas y los valores finitos fuera del rango del dtype del modelo no estan soportados; los pipelines que inyecten coordenadas parciales deben usar las mascaras de disponibilidad bajo pena de fallo.
- Interfaz de diseno de binders restringida: el destino debe ser una secuencia de proteina de una letra por cadena; no se aceptan estructuras ni rutas de fichero como destino de diseno.
- Idiomas y contexto: no se especifica ninguna ventana de contexto ni limite de longitud de secuencia, por lo que el comportamiento en cadenas muy largas no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/esmfold2-fast
- Variante completa: https://huggingface.co/oteam/esmfold2
- Variante experimental: https://huggingface.co/oteam/esmfold2-experimental
- Variante experimental fast: https://huggingface.co/oteam/esmfold2-experimental-fast
- Codificador ESMC-6B congelado: https://huggingface.co/multimolecule/esmc-6b
- Codigo del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Repositorio OFoldX: https://github.com/OTeam-AI4S/OFoldX
- Repositorio original de Biohub: https://github.com/Biohub/esm
- Paper: https://biohub.ai/papers/esm_protein.pdf
