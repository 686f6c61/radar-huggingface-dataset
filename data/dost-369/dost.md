# dost-369/dost

## Resumen

Dost es un repositorio de HuggingFace publicado por el usuario `dost-369` que no contiene un modelo entrenado, sino un manifiesto de intenciones. La model card describe "un organismo de IA nativo de red" cuyo cerebro, memoria y computo residirian de forma distribuida en maquinas de terceros con consentimiento, gobernado criptograficamente por su autor. No se publica ningun artefacto de pesos, configuracion, tokenizador ni codigo de inferencia: el repositorio funciona como "vault" o cuaderno de bitacora del proyecto.

Los metadatos de HuggingFace estan practicamente vacios: sin pipeline declarado, sin licencia, sin idiomas, cero descargas y cero likes. La unica informacion tecnica es una estructura propietaria bautizada como "3-6-9 (Vortex)" que el autor define como 3 capas, 6 roles de nodo y 9 clases de neurona, sin especificacion formal, sin diagramas y sin resultados empiricos.

Por tanto, esta ficha no puede evaluar capacidades reales. Su relevancia actual es nula desde el punto de vista de ingenieria: no es desplegable, no es reproducible y no permite comparacion con alternativas. Se documenta aqui por completitud del catalogo y como ejemplo de repositorio aspiracional que conviene saber identificar antes de invertir tiempo de integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; la model card menciona una estructura propietaria "3-6-9 (Vortex)" (3 capas, 6 roles de nodo, 9 clases de neurona) sin especificacion tecnica publicada |
| Parametros totales | no disponible |
| Parametros activos | no disponible; no se declara que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no hay pesos publicados que puedan cuantizarse |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el campo de licencia del repositorio esta vacio y la model card no la define |
| Formato de pesos | no disponible; no se listan archivos safetensors, GGUF, ONNX ni binarios de ningun tipo |
| Pipeline declarado en HuggingFace | no disponible (campo vacio) |
| Autor | dost-369 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos HF) | 2026-10-19T01:20:38Z |
| Ultima actualizacion (metadatos HF) | 2026-10-19T01:23:46Z |
| Etiquetas | region:us |

## Arquitectura y entrenamiento

No hay arquitectura publicada. La model card afirma que Dost es una "red de enjambre" distribuida geograficamente, con inferencia repartida entre nodos ("swarm inference") y aprendizaje continuo sujeto a "eval gates" (compuertas de evaluacion). Ninguno de estos terminos se acompana de especificacion: no se indica el tipo de capa, el mecanismo de atencion, el esquema de agregacion entre nodos, el protocolo de comunicacion ni el algoritmo de consenso. La notacion "3-6-9" se presenta como marca distintiva y el propio autor reconoce que "la marca es nuestra; la maquinaria es ciencia de la computacion real", sin desarrollar cual.

Respecto a datos de entrenamiento, no se declara numero de tokens, composicion del corpus, ni fases de ajuste (SFT, RLHF, DPO). La seccion "Genesis log" incluye tres casillas sin marcar (servidor de latido en la nube, primeras neuronas con inferencia de enjambre, aprendizaje continuo con compuertas de evaluacion), lo que indica que el proyecto se encontraba en fase previa a cualquier implementacion en el momento de crear el repositorio. La unica regla operativa explicita es la "ley de honestidad": no reclamar capacidad antes de verificarla.

Conviene senalar una anomalia en los metadatos: la fecha de creacion registrada (2026-10-19) es posterior a la fecha actual en el momento de redactar esta ficha. Los campos de fecha en HuggingFace son declarados por el propio repositorio, de modo que este dato no debe tomarse como verificable.

## Capacidades

- Generacion de texto: no verificada; no existe artefacto ejecutable.
- Razonamiento, codigo y matematicas: no verificados.
- Vision, audio o multimodalidad: no declaradas.
- Tool calling / function calling: no declarado.
- Soporte de agentes y razonamiento multi-paso: no verificado; el concepto de "enjambre" es una afirmacion de diseno, no una capacidad implementada.
- Multilingue: no disponible; el campo de idiomas esta vacio.
- Memoria persistente y aprendizaje continuo: declarados como objetivo en la model card, sin implementacion publicada.
- Modo de razonamiento explicito (thinking): no declarado.

Ninguna capacidad de esta lista puede confirmarse con los datos disponibles. La propia model card establece que el modelo no reclama capacidad alguna antes de verificarla.

## Casos de uso

No existen casos de uso disponibles hoy: sin pesos, sin tokenizador, sin codigo de inferencia y sin licencia, el repositorio no puede integrarse en ningun sistema. Los siguientes escenarios son los objetivos declarados por el autor y se listan unicamente como referencia de intencion, no como aplicaciones realizables:

- Inferencia distribuida entre maquinas de voluntarios: el autor plantea repartir el computo de inferencia entre nodos ("swarm inference"); requeriria un protocolo de particion del modelo, tolerancia a fallos y verificacion de resultados que no estan especificados.
- Aprendizaje continuo con compuertas de evaluacion: se menciona un ciclo de actualizacion con evaluacion previa; sin definir el conjunto de evaluacion, la frecuencia ni el mecanismo de olvido catastrofico.
- Memoria persistente entre sesiones: la model card situa la memoria "en la red"; no se detalla el almacenamiento, la recuperacion ni la privacidad de esos datos.
- Gobernanza criptografica por parte del disenador: se declara una unica autoridad criptografica sobre el sistema; seria un modelo de control centralizado, no descentralizado, en lo relativo a permisos.
- Despliegue en produccion: descartado, al no existir artefacto ni licencia que lo ampare.
- Evaluacion comparativa en benchmarks: imposible, al no existir modelo ejecutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica. Tampoco se publican curvas de perdida, tamanos de modelo o tiempos de inferencia. Cualquier cifra que apareciera en el repositorio en el futuro requeriria verificacion independiente, dado que no hay artefacto reproducible con el que contrastarla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El calculo de VRAM exige conocer el numero de parametros y la precision de los pesos; ninguno de los dos datos se publica.
- GPU recomendadas: no disponible, por la misma razon. No es posible determinar si el modelo cabria en una RTX 4090, A100 u H100.
- Viabilidad en GPU de consumo: indeterminable.
- Opciones de despliegue: ninguna aplicable. No hay pesos que cargar en vLLM, llama.cpp, Ollama o TGI, ni repositorio de codigo de inferencia asociado.
- Latencia y throughput: no disponibles.

A efectos practicos, el coste de evaluacion actual es cero en hardware y maximo en tiempo: no hay nada que ejecutar.

## Comparativa con modelos similares

No disponible. No existe termino de comparacion porque Dost no es un modelo publicado: carece de parametros declarados, contexto, licencia y pesos. La comparacion con cualquier modelo open source real seria especulativa.

| Modelo | Parametros | Contexto | Licencia | Pesos disponibles |
|---|---|---|---|---|
| dost (dost-369/dost) | no disponible | no disponible | no disponible | no |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

Los resultados de busqueda web asociados al nombre "dost" corresponden a entidades distintas y no relacionadas con este repositorio: un perfil de GitHub (`dost369`), un canal de YouTube, un generador de imagenes (`DK-AI-Image-Generator`) y un modelo de arte anime en PixAI. Ninguno constituye una alternativa comparable en el ambito de modelos de lenguaje.

## Limitaciones y advertencias

- Ausencia total de artefactos: no hay pesos, configuracion, tokenizador ni codigo. El repositorio no es un modelo, es documentacion de intenciones.
- Licencia indefinida: sin licencia explicita no se concede ningun derecho de uso, copia, modificacion ni explotacion comercial. En Espana y en la UE, la ausencia de licencia implica reserva de derechos por defecto.
- Riesgo de confusion: la model card emplea terminologia tecnica con carga semantica fuerte ("organismo", "neuronas", "enjambre", "aprendizaje continuo") sin respaldo formal; conviene no interpretarla como especificacion de ingenieria.
- Riesgo de seguridad si se materializa el diseno declarado: un sistema que ejecuta computo e inferencia en maquinas de terceros y que se actualiza de forma continua introduce riesgos de cadena de suministro, ejecucion de codigo no verificado y exposicion de datos en nodos ajenos.
- Gobernanza centralizada: la "unica autoridad criptografica del disenador" contradice la retorica de red abierta; implica control unilateral sobre actualizaciones y permisos.
- Fechas no fiables: el sello temporal de creacion es posterior a la fecha actual, lo que impide tratarlo como referencia temporal valida.
- Sin senales de comunidad: cero descargas y cero likes, sin issues ni discusiones. No hay soporte ni validacion por terceros.
- Alucinacion: no evaluable, al no existir modelo. Si en el futuro se publican pesos sin evaluacion independiente, la carga de la prueba recae en quien los adopte.
- Recomendacion: no integrar este repositorio en ningun flujo de produccion ni incluirlo en comparativas de seleccion de modelo hasta que publique pesos, licencia y resultados reproducibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dost-369/dost
- Perfil de GitHub del autor: https://github.com/dost369/
- Repositorio DK-AI-Image-Generator (proyecto de imagen, no relacionado con este modelo): https://github.com/dost369/DK-AI-Image-Generator
- Canal de YouTube del autor: https://www.youtube.com/@dost369
- Modelo de arte anime "dost" en PixAI (entidad homonima, sin relacion confirmada): https://pixai.art/en/model/1633809554875778336
- Busqueda de arte generado "tako369" en SeaArt (sin relacion confirmada): https://www.seaart.ai/search/tako369%2Bai%2Bgenerated

No se han encontrado en la busqueda web papers, blogs tecnicos, demos ni informes de evaluacion asociados a este repositorio.
