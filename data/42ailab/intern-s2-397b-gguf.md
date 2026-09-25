# 42ailab/Intern-S2-397B-GGUF

## Resumen

Intern-S2-397B-GGUF es una cuantizacion en formato GGUF del modelo Intern-S2-397B, desarrollado originalmente por el Shanghai AI Laboratory (equipo InternLM) y publicado bajo licencia Apache-2.0. La cuantizacion la firma 42ailab, que no presenta un modelo nuevo sino una compresion de los pesos oficiales junto con sus propias pruebas de validacion. El objetivo declarado es hacer viable la inferencia local de un modelo cientifico de casi 400.000 millones de parametros en una unica maquina de 128 GB de memoria, algo que con los pesos originales exigiria un servidor multi-GPU.

El modelo base es una mezcla de expertos (MoE) con 512 bloques de expertos, de los que se activan 10 por token, y esta orientado a inteligencia cientifica y agentes de horizonte largo, con entrenamiento mediante aprendizaje por refuerzo a gran escala en mas de 20 dominios cientificos. Los pesos oficiales ocupan unos 800 GB en precision completa y unos 400 GB en la publicacion oficial de 8 bits. Esta version los reduce a aproximadamente 98 GB (91,4 GiB en tres fragmentos) mediante una asignacion selectiva de bits: los expertos, que suponen alrededor del 90 % del tamano, se comprimen de forma extrema, mientras que la atencion y el resto de componentes sensibles a la calidad se mantienen en 8 bits.

Su relevancia actual reside en que acerca un modelo de escala frontera al hardware de un desarrollador o investigador individual, con la contrapartida de una perdida medible de fidelidad: aproximadamente una de cada cinco predicciones top-1 difiere de la version de 8 bits. Es, por tanto, una opcion para exploracion, prototipado y trabajo offline, no un sustituto de los pesos oficiales cuando la precision es critica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 512 bloques de expertos, 10 activos por token; transformer con atencion (dimensiones no detalladas) |
| Parametros totales | 402.967.084.288 (unos 403.000 millones), segun los pesos en safetensors del modelo base |
| Parametros activos | no disponible (el autor indica que se activan 10 de 512 expertos por token, sin cifra de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S mixta, ~1,95 bits por peso de media; expertos con compresion extrema y atencion mas otros componentes sensibles a 8 bits. Tres fragmentos GGUF que se cargan conjuntamente |
| Idiomas soportados | zh (chino) e ingles; las pruebas del autor se realizaron sobre texto tecnico en chino |
| Licencia | Apache-2.0 (heredada de los pesos oficiales) |
| Formato de pesos | GGUF (llama.cpp), 3 archivos: `Intern-S2-397B-IQ1_S-mix-00001-of-00003.gguf` y 2 mas |
| Tamano del repositorio | 98,1 GB (91,4 GiB de pesos) |
| Modelo base | internlm/Intern-S2-397B (Shanghai AI Laboratory) |

## Arquitectura y entrenamiento

La arquitectura subyacente es una mezcla de expertos de gran escala: 512 bloques de expertos con enrutamiento que activa 10 por token, lo que concentra la mayor parte del peso del modelo en los expertos (en torno al 90 % del total) y deja el resto en componentes mas pequenos. El autor del modelo base lo describe como su modelo mas capacitado para inteligencia cientifica y agentes de horizonte largo, entrenado con aprendizaje por refuerzo a gran escala sobre mas de 20 dominios cientificos. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) en la informacion proporcionada. El informe tecnico disponible (arXiv:2608.13505) corresponde a la version Preview, no a esta release.

La innovacion de esta ficha concreta es la estrategia de cuantizacion, no la arquitectura. 42ailab partio de la publicacion oficial de 8 bits y aplico una asignacion no uniforme de bits: compresion extrema unicamente sobre los expertos y 8 bits para atencion y el resto de partes sensibles. El autor documenta que el enfoque alternativo de empujar todas las partes a aproximadamente 1 bit provocaba repeticiones y texto sin sentido, mientras que con esta asignacion selectiva las cuatro peticiones de prueba se respondieron con normalidad. No se menciona decodificacion especulativa ni mecanismos de atencion lineal.

## Capacidades

- Generacion de texto conversacional en chino e ingles, con registro tecnico y cientifico.
- Razonamiento cientifico: lectura de articulos, comprobacion de derivaciones y trabajo sobre contenido de dominio en mas de 20 areas cientificas, segun el modelo base.
- Generacion de codigo: en las pruebas del cuantizador, una peticion de codigo Python se resolvio correctamente.
- Calculo y matematicas: una peticion de calculo temporal se respondio de forma correcta en las pruebas del autor.
- Modo de razonamiento extenso ("thinking"): el modelo base lo activa por defecto y antepone una traza de razonamiento larga a la respuesta; puede desactivarse para preguntas simples.
- Agentes de horizonte largo y tareas de investigacion de varios pasos, de acuerdo con la descripcion del modelo base.
- Capacidad multimodal de vision en el modelo original (lectura de imagenes), **no incluida** en esta compilacion GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues fuera de zh/en: no disponible.

## Casos de uso

- Revision de derivaciones y comprobacion de resultados matematicos: el modelo puede contrastar pasos intermedios de un desarrollo analitico, señalar incoherencias y proponer correcciones. Al ejecutarse en local, es adecuado para material de investigacion no publicable que no debe salir de la maquina.
- Lectura y resumen de literatura cientifica: permite procesar articulos tecnicos en chino o ingles y extraer metodologia, supuestos y limitaciones, aprovechando su entrenamiento especifico en dominios cientificos.
- Escritura de codigo de investigacion: generacion de scripts en Python para analisis de datos, simulacion numerica o tratamiento de ficheros cientificos, con validacion en local antes de integrarlos en el flujo de trabajo.
- Asistente de investigacion offline en equipos con requisitos de confidencialidad: al no requerir conexion ni servicios en la nube, encaja en entornos con datos bajo embargo, propiedad industrial o regulacion estricta de tratamiento de datos.
- Prototipado y evaluacion de pipelines de agentes: sirve para probar planificacion multi-paso y uso de herramientas sobre un modelo de escala grande antes de decidir un despliegue con los pesos oficiales en servidor.
- Analisis de documentacion tecnica extensa dentro del limite de contexto disponible: resumen, extraccion de tablas y comparacion de especificaciones entre documentos en chino e ingles.
- Anotacion y clasificacion asistida de corpus cientificos en local, como paso previo a un entrenamiento o a una revision manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales en la informacion disponible. Los unicos datos medidos corresponden a las comprobaciones propias del autor de la cuantizacion, realizadas en un Apple M3 Max con 128 GB y con una sola ejecucion por peticion, por lo que no constituyen puntuaciones de referencia:

| Comprobacion | Resultado |
|---|---|
| Coincidencia de la prediccion top-1 con la version de 8 bits sobre texto tecnico chino no visto | 81 % de las posiciones |
| Perplejidad sobre el mismo texto, relativa a la version de 8 bits (menor es mejor) | aproximadamente un 9 % superior |
| Cuatro peticiones (explicacion en chino, redaccion en chino, calculo temporal, Python) | todas respondidas con normalidad; el calculo y el codigo, correctos |
| Velocidad de generacion en GPU | aproximadamente 6-15 tokens por segundo |

Para resultados de referencia del modelo base, el autor remite a la model card oficial de internlm/Intern-S2-397B, no incluida en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: se requiere una maquina con 128 GB de memoria. Los ficheros suman 91,4 GiB (98,1 GB de repositorio) y el proceso necesita memoria adicional por encima de ese tamano.
- Equipo validado por el autor: Apple M3 Max con 128 GB de memoria unificada.
- GPU recomendadas: no disponible. El autor solo indica un resultado agregado de velocidad "en GPU" (6-15 tokens por segundo) sin especificar el modelo de tarjeta.
- Encaje en GPU de consumo: no confirmado. Una GPU con 24 GB de VRAM (RTX 4090) no puede alojar el modelo completo; seria necesario repartir capas entre memoria del sistema y VRAM mediante llama.cpp, con una penalizacion de velocidad no documentada.
- Opciones de despliegue: llama.cpp (formato GGUF, con carga automatica de los tres fragmentos) y la aplicacion de escritorio 42model (`42model download intern-s2:397b-iq1_s`). Soporte en vLLM, TGI u Ollama: no disponible.
- Latencia y throughput: aproximadamente 6-15 tokens por segundo en GPU segun el autor. La latencia por peticion no se detalla y depende en gran medida del modo de razonamiento, que antepone una traza larga antes de la respuesta.

## Comparativa con modelos similares

No se dispone de datos de modelos alternativos comparables en la informacion proporcionada. La comparacion posible es entre las distintas versiones de Intern-S2-397B:

| Version | Parametros | Tamano de pesos | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intern-S2-397B (original, precision completa) | ~403.000 millones | ~800 GB | Completa | Apache-2.0 | Pesos oficiales de InternLM; requiere servidor multi-GPU |
| Intern-S2-397B (release oficial de 8 bits) | ~403.000 millones | ~400 GB | 8 bits | Apache-2.0 | Pesos oficiales; requiere servidor multi-GPU |
| Intern-S2-397B-GGUF (esta ficha, 42ailab) | ~403.000 millones | 91,4 GiB (~98 GB) | ~1,95 bits por peso de media, mixta | Apache-2.0 | Unica maquina con 128 GB; sin vision |

Alternativas de otros fabricantes en la misma categoria de tamano o tarea: no disponible.

## Limitaciones y advertencias

- Requisito de memoria elevado: 128 GB de RAM o memoria unificada. No es desplegable en portatiles convencionales ni en GPU de consumo de forma completa.
- Perdida de fidelidad por la compresion extrema: alrededor de una de cada cinco predicciones top-1 difiere de la version de 8 bits, y la perplejidad es aproximadamente un 9 % superior en texto tecnico chino. Para tareas donde la precision es critica, el autor recomienda usar los pesos oficiales.
- Sin vision: el modelo original procesa imagenes; esta compilacion GGUF es solo texto.
- Modo de razonamiento activado por defecto: las respuestas van precedidas por una traza de razonamiento larga, lo que incrementa el consumo de tokens y la latencia. Conviene desactivarlo en preguntas simples.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de factualidad ni de tasas de alucinacion en la informacion disponible. La compresion agresiva puede agravar el problema en dominios de alta precision.
- Sesgos: no se documentan evaluaciones de sesgo para el modelo base ni para esta cuantizacion.
- Idiomas: cobertura declarada de chino e ingles. El rendimiento en castellano u otras lenguas no esta documentado.
- Longitud de contexto: no disponible, sin cifra oficial en la informacion proporcionada.
- Evidencia empirica limitada: las comprobaciones del cuantizador son cuatro peticiones con una unica ejecucion cada una; no constituyen una validacion estadistica.
- Licencia: Apache-2.0, permisiva e compatible con uso comercial, heredada de los pesos oficiales. Aun asi, conviene verificar los terminos de la release upstream y de las dependencias de llama.cpp antes de un despliegue en produccion.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, creado el 24 de septiembre de 2026 y actualizado el 25 de septiembre de 2026. Es una publicacion reciente y sin validacion externa por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/42ailab/Intern-S2-397B-GGUF
- Modelo base oficial: https://huggingface.co/internlm/Intern-S2-397B
- Model card oficial del modelo base (referenciada para benchmarks): https://huggingface.co/internlm/Intern-S2-397B
- Informe tecnico de Intern-S2-Preview (arXiv:2608.13505, describe la version Preview, no esta release): https://arxiv.org/abs/2608.13505
- Version en ModelScope: https://modelscope.cn/models/42ailab/Intern-S2-397B-GGUF
- Sitio y aplicacion del cuantizador: https://42ailab.com
- Aplicacion de escritorio 42model: https://42model.com
- README en chino: https://huggingface.co/42ailab/Intern-S2-397B-GGUF/blob/main/README_zh.md
