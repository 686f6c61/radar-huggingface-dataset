# KANAKq/rakshak

## Resumen

Rakshak es un artefacto publicado en HuggingFace por el usuario KANAKq (ID `KANAKq/rakshak`) que se presenta como un asistente de comandos orientado a pruebas de seguridad autorizadas ("ethical hacking"). Segun su propia model card, se trata de un asesor local y offline que sugiere comandos de Kali Linux indicando un marcador de objetivo (`<target>`) y la consecuencia esperada de cada comando, con un enfoque explícito de "human-in-the-loop": el operador es quien ejecuta, no el modelo.

El paquete no documenta ni el modelo base ni la arquitectura, el número de parámetros, la longitud de contexto, los idiomas soportados o la licencia. La model card se limita a describir el flujo de puesta en marcha mediante un `Modelfile` de Ollama (`ollama create rakshak -f Modelfile`) y dos scripts de apoyo (`rakshak_assist.py` como asesor y `test_rakshak.py` para pruebas). El texto está redactado en hinglish (mezcla de hindi e inglés) y no incluye referencias a datasets, entrenamiento o evaluaciones.

Su relevancia actual es limitada pero ilustrativa: representa el patrón de "asistentes de seguridad empaquetados como Modelfile de Ollama", es decir, capas de instrucciones y configuración sobre un modelo de lenguaje preexistente en lugar de un modelo entrenado desde cero. Con 0 descargas y 0 "likes" en el momento de la consulta, se trata de un artefacto sin validación externa ni comunidad, por lo que cualquier evaluación técnica seria exige auditar primero el `Modelfile` para identificar el modelo base real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se declara el modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el despliegue se realiza via Ollama, cuyo backend suele emplear GGUF) |
| Idiomas soportados | no disponible; la model card esta redactada en hinglish (hindi-ingles) |
| Licencia | no disponible (la model card no incluye ninguna licencia) |
| Formato de pesos | no disponible; se distribuye mediante un `Modelfile` de Ollama en lugar de pesos sueltos |
| Autor | KANAKq |
| Fecha de creacion (metadatos) | 2026-10-05 |
| Fecha de actualizacion (metadatos) | 2026-10-05 |
| Descargas / likes | 0 / 0 |
| Etiquetas | region:us |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo: la model card no menciona transformer, MoE, SSM ni ninguna variante híbrida, y tampoco identifica el modelo base sobre el que se construye. Tampoco se documentan datos de entrenamiento (número de tokens, composición del dataset, fases de ajuste fino, RLHF o DPO) ni innovaciones técnicas como decodificación especulativa o atención lineal.

Lo único verificable es el mecanismo de distribución: un `Modelfile` de Ollama. Este formato define, típicamente, una directiva `FROM` que apunta a un modelo base, más un `SYSTEM` prompt con instrucciones de comportamiento y parámetros de muestreo. Dado que la model card describe un comportamiento muy específico (sugerir comandos de Kali con marcador de objetivo y explicación de consecuencias), es razonable inferir que buena parte de la funcionalidad reside en ese prompt de sistema y no en un entrenamiento propio, pero esto es una inferencia, no un dato confirmado por el autor. Para determinar la arquitectura real sería necesario inspeccionar el `Modelfile` y el repositorio asociado.

## Capacidades

- Generación de comandos de Kali Linux orientados a pruebas de seguridad, con un marcador `<target>` en lugar de una dirección concreta, segun la descripcion del autor.
- Explicación de la consecuencia esperada de cada comando sugerido, como medida de seguridad para el operador.
- Flujo human-in-the-loop: el modelo propone, el operador autorizado ejecuta. No se describe ejecución autónoma de comandos.
- Funcionamiento local y offline, sin dependencia de APIs externas, al desplegarse mediante Ollama.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card está en hinglish y no se declara cobertura idiomática.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponible.
- Razonamiento general, matemáticas o generación de código fuera del ámbito de comandos de seguridad: no disponible, no se documenta.

## Casos de uso

- Auditorías de seguridad autorizadas: el modelo actuaría como borrador de comandos para un pentester que ya dispone de contrato y alcance firmados, devolviendo la sintaxis de Kali y la consecuencia esperada antes de que el operador ejecute nada.
- Formación en laboratorio cerrado: instructores pueden usarlo para generar ejercicios con objetivos ficticios (máquinas vulnerables propias, rangos de CTF) y explicar a los alumnos qué hace cada herramienta.
- Documentación de procedimientos: ayuda a redactar guiones de pruebas internas en los que cada paso queda justificado por su efecto, lo que facilita la revisión posterior por parte del equipo de cumplimiento.
- Soporte a analistas junior: un analista con poca experiencia en Kali puede contrastar la sintaxis de una herramienta concreta antes de lanzarla contra un activo propio, con la explicación de consecuencias como red de seguridad.
- Automatización parcial de checklists de hardening: generar la secuencia de comprobaciones (por ejemplo, enumeración de servicios) sobre infraestructura propia, dejando la ejecución en manos del operador.
- Red team con alcance delimitado: preparación de borradores de comandos para fases de reconocimiento dentro de un engagement, siempre que el marcador `<target>` se sustituya por activos incluidos en el alcance autorizado.

En todos los casos, la utilidad práctica depende de un modelo base subyacente que no está identificado ni evaluado, por lo que no puede recomendarse su uso en producción sin una validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de ningún tipo (MMLU, HumanEval, GSM8K ni evaluaciones específicas de seguridad), y no se ha identificado el modelo base, por lo que tampoco es posible heredar resultados de un modelo conocido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Sin conocer el número de parámetros ni la cuantización del modelo base, cualquier cifra sería especulativa.
- Como referencia metodológica (no como dato del modelo): la VRAM necesaria equivale aproximadamente a parámetros × bytes por peso, más el espacio del contexto. Una cuantización Q4_K_M ronda los 4,8 bits por peso, es decir, unos 5-6 GB para un modelo de 8B y unos 40 GB para uno de 70B, cifras que no pueden atribuirse a Rakshak.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; dependerá del tamaño del modelo base. Ollama puede ejecutarse también en CPU, con latencia mucho mayor.
- Opciones de despliegue: Ollama es el método documentado por el autor. Otros backends (llama.cpp, vLLM, TGI) solo serían aplicables si se extraen y convierten los pesos, algo que la model card no contempla.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Naturaleza | Parametros | Contexto | Licencia | Evaluaciones publicas | Disponibilidad |
|---|---|---|---|---|---|---|
| KANAKq/rakshak | Asesor de comandos de Kali empaquetado como Modelfile de Ollama | no disponible | no disponible | no disponible | no publicadas | HuggingFace, 0 descargas |
| WhiteRabbitNeo (familia) | Modelo afinado para ciberseguridad ofensiva y defensiva | no disponible en esta busqueda | no disponible en esta busqueda | no disponible en esta busqueda | no consultadas | Pesos publicados en HuggingFace |
| PentestGPT | Herramienta de asistencia a pentesting basada en LLM | no aplica (es una aplicacion) | no aplica | no disponible en esta busqueda | no consultadas | Repositorio publico |

Los resultados de la busqueda web realizada no aportan informacion util sobre alternativas ni sobre el propio Rakshak: los enlaces recuperados tratan sobre tiendas de claves de videojuegos, incidencias de GOG Galaxy y pedidos cancelados en AliExpress, por lo que no se han podido extraer datos comparativos verificados. La comparativa anterior se limita a identificar categorias equivalentes; las celdas marcadas como no disponibles reflejan la ausencia de datos contrastados en esta consulta, no la inexistencia de dichos datos.

## Limitaciones y advertencias

- Artefacto sin validacion: 0 descargas y 0 "likes" en el momento de la consulta, sin evaluaciones publicadas, sin autor conocido mas alla del alias KANAKq y sin model card tecnica.
- Modelo base no identificado: al no declararse el modelo subyacente, no es posible evaluar sesgos, calidad, alucinacion ni comportamiento en dominios fuera de la seguridad.
- Licencia ausente: sin licencia declarada no hay cesion explicita de derechos, lo que impide un uso comercial con seguridad juridica y complica su integracion en productos.
- Riesgo de doble uso: un asistente que genera comandos de seguridad ofensiva puede emplearse sin autorizacion. La propia model card advierte de que el escaneo o ataque no autorizado constituye un delito conforme a la IT Act (legislacion india). En Espana, ese uso encajaria en el articulo 197 bis y concordantes del Codigo Penal.
- Dependencia del operador: el diseno human-in-the-loop traslada toda la responsabilidad al usuario; el modelo no verifica autorizacion, alcance ni legalidad del objetivo.
- Riesgo de comandos incorrectos o peligrosos: sin benchmarks ni pruebas independientes, no hay garantia de que las sugerencias sean sintacticamente correctas, seguras o reversibles, ni de que la "consecuencia" descrita sea exacta.
- Idiomas: no se declara soporte; la model card esta en hinglish, lo que sugiere un sesgo hacia ese registro y posible degradacion en castellano.
- Metadatos anomalos: las fechas de creacion y actualizacion (2026-10-05) son posteriores a la fecha habitual de consulta y apenas difieren en cuatro segundos, lo que indica un repositorio creado de golpe y sin mantenimiento posterior.
- Sin informacion sobre contexto, cuantizacion ni requisitos: imposible planificar un despliegue con garantias.
- Antes de cualquier uso: auditar el `Modelfile` y los scripts `rakshak_assist.py` y `test_rakshak.py` para identificar el modelo base, revisar el prompt de sistema y comprobar que no introducen telemetria ni ejecucion implicita de comandos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KANAKq/rakshak
- Documentacion de Ollama (formato `Modelfile` y ejecucion local): https://ollama.com
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo. Todos los resultados recuperados corresponden a hilos de Reddit sin relacion con Rakshak (consultas sobre IVA en G2A, claves globales de Xbox Game Pass, un error de GOG Galaxy y pedidos cancelados en AliExpress), por lo que se descartan como fuentes.
- Paper, blog tecnico, repositorio de codigo o demo: no disponible.
