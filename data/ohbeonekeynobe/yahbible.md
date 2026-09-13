# OhBeOneKeyNoBe/YahBible

## Resumen

YahBible es una aplicacion de escritorio gratuita para Windows dedicada al estudio y la comparacion de la Biblia y otros textos sagrados. No se trata de un modelo de inteligencia artificial, sino de un programa local distribuido a traves de un repositorio de HuggingFace (OhBeOneKeyNoBe/YahBible, 75,6 GB de repositorio) que incluye un ejecutable, la biblioteca de estudio y material de presentacion. El autor lo publica bajo la etiqueta OhBeOneKeyNoBe y lo describe como una version preliminar ("pre-release") que se actualiza a diario a traves de la red.

La aplicacion combina un lector personalizable, un motor de palabras en hebreo, griego y arameo con transliteracion, gematria y significado letra a letra, numeros de Strong, diccionario, texto interlineal y una capa de "Red Letter Words" con las palabras de Cristo en la version KJV. Permite apilar mas de 120 versiones de la Biblia en paneles independientes para comparar versiculo a versiculo, e incluye corpus como la Torá, el Antiguo y el Nuevo Testamento, los apocrifos etiopes y escritos gnosticos.

Su relevancia actual es limitada en el ambito de la IA: no publica pesos, arquitectura ni benchmarks. La propia model card anuncia funciones de IA todavia no disponibles ("Ask Tav'iel", un asistente con citas textuales, y una herramienta de critica de transcripciones de YouTube/TikTok), por lo que hoy debe evaluarse como software de estudio biblico y no como modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: aplicacion de escritorio (motor local de escrituras, motor de transliteracion y gematria hebreo/griego/arameo, lexico Strong's e interlineal); no es un modelo de IA |
| Parametros totales | no disponible (no distribuye pesos de modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible a nivel de interfaz; el contenido de estudio cubre hebreo, griego y arameo, y mas de 120 versiones de la Biblia |
| Licencia | other (los terminos concretos no se detallan en la model card) |
| Formato de pesos | no aplica; el repositorio distribuye YahBible.exe, capturas de pantalla, un PDF de presentacion y la biblioteca de estudio |
| Tamano del repositorio | 75,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

No existe un proceso de entrenamiento asociado: YahBible no es un modelo neuronal ni publica pesos, dataset de entrenamiento, numero de tokens ni tecnicas de alineacion como RLHF o DPO. Lo que la model card describe es una arquitectura de aplicacion: un motor local de escrituras que integra la KJV, mas de 120 versiones adicionales y corpus apocrifos y de otras tradiciones; un motor autocontenido de transliteracion y gematria en hebreo, griego y arameo que funciona con cualquier palabra; la capa Red Letter (KJV) con las palabras de Cristo; y un conjunto compacto de Strong's, interlineal y definiciones basicas que se instala con la aplicacion, ampliable mediante un lexico completo opcional.

El modelo de ejecucion es local y privado: la aplicacion se abre en el navegador del propio equipo en 127.0.0.1 y, tras la primera ejecucion, funciona sin conexion. La unica pieza de IA mencionada, "Ask Tav'iel", se presenta como funcionalidad en desarrollo y no se especifica su arquitectura, su modelo base ni su metodo de anclaje documental ("grounded AI"), por lo que no puede evaluarse tecnicamente.

## Capacidades

- Lectura y comparacion de mas de 120 versiones de la Biblia en paneles simultaneos, con disposiciones de 2 sobre 1, cuartos, apilado vertical u horizontal y pestanas independientes.
- Estudio de palabras en hebreo, griego y arameo: forma original, transliteracion, significado letra a letra y gematria, para cualquier palabra del texto.
- Consulta de numeros de Strong, definiciones de diccionario y texto interlineal bajo cada versiculo, con lexico basico incluido y lexico completo opcional descargable.
- Capa Red Letter Words en KJV, con acceso a las palabras de Cristo en su capitulo completo desde un solo clic.
- Estudio del Nombre ("The Logos"), centrado en el tetragramaton YHWH / Yahweh Tsidkenu, alli donde el texto traduce "LORD".
- Acceso a corpus adicionales: Torá, Antiguo Testamento, Nuevo Testamento, apocrifos etiopes y escrituras gnosticas.
- Funcionamiento local y offline tras la primera descarga, sin necesidad de cuenta para leer y estudiar, con actualizaciones automaticas por red y sistema de reporte de errores integrado.
- No incluye tool calling, function calling, razonamiento multi-paso ni capacidades multimodales. Las funciones de IA generativa (asistente con citas y critica de transcripciones de video) estan anunciadas pero no disponibles.

## Casos de uso

- Estudio biblico personal en profundidad: el lector permite tener abiertas varias versiones a la vez y consultar la forma original de cada palabra, de modo que el usuario puede comprobar que terminos concretos difieren entre traducciones sin salir de la aplicacion.
- Analisis linguistico de pasajes: el motor incluye transliteracion, gematria y desglose letra a letra para hebreo, griego y arameo, util para preparar clases o sermones que requieran justificar una traduccion concreta.
- Docencia y formacion teologica: el texto interlineal y los numeros de Strong permiten construir material didactico mostrando la correspondencia entre el original y la version traducida en cada versiculo.
- Comparacion critica de traducciones: con mas de 120 versiones apilables, un investigador puede localizar rapidamente pasajes donde las traducciones divergen o suavizan el texto original.
- Estudio de los apocrifos y literatura gnostica: los corpus adicionales incluidos permiten contrastar estos textos con el canon mas habitual en una misma interfaz.
- Trabajo de escritorio sin dependencia de la nube: al ejecutarse en local y funcionar offline tras la descarga inicial de aproximadamente 1,2 GB, es adecuado para entornos con conectividad limitada o con requisitos de privacidad sobre el material de estudio.
- Preparacion de estudios centrados en las palabras de Cristo: la capa Red Letter en KJV aisla estos pasajes y permite abrirlos en su contexto completo para analisis tematicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de lenguaje, no aplican metricas como MMLU, HumanEval o GSM8K. Tampoco se especifican tiempos de arranque, consumo de memoria ni rendimiento del motor de estudio.

## Requisitos de hardware

- Sistema operativo: Windows. La distribucion principal es un unico ejecutable (YahBible.exe) que no requiere instalacion y se abre en el navegador local en 127.0.0.1; opcionalmente permite instalacion permanente con icono en el menu Inicio.
- GPU: no se menciona ningun requisito de GPU. Es una aplicacion de escritorio que no depende de aceleracion por hardware grafico para su funcionamiento descrito.
- VRAM estimada: no aplica.
- Almacenamiento: descarga inicial de aproximadamente 1,2 GB de biblioteca de estudio en la primera ejecucion, mas la descarga en segundo plano del lexico completo. El repositorio completo ocupa 75,6 GB, pero no se indica cuanto de ese volumen es necesario descargar para el uso normal.
- Modelos de GPU consumer: no aplica.
- Opciones de despliegue: ejecucion local en Windows mediante el ejecutable; no se documentan contenedores, vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

YahBible no compite con modelos de IA, sino con software de estudio biblico. La informacion proporcionada no incluye datos tecnicos de las alternativas, por lo que la comparacion se limita a caracteristicas generales de categoria.

| Producto | Tipo | Ejecucion local | Coste | Acceso al codigo | Idiomas originales |
|---|---|---|---|---|---|
| YahBible | Aplicacion de escritorio (Windows), pre-release | Si, offline tras la primera descarga | Gratuito (licencia "other") | Repositorio en GitHub enlazado, sin licencia detallada | Hebreo, griego y arameo con Strong's e interlineal |
| e-Sword | Aplicacion de escritorio de estudio biblico | Si | Gratuito con modulos adicionales | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Blue Letter Bible | Plataforma web y movil de estudio biblico | No (basada en web) | Gratuito | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Logos Bible Software | Suite comercial de estudio biblico | Parcial | De pago | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de IA: no publica pesos, arquitectura, contexto, cuantizaciones ni benchmarks, por lo que cualquier evaluacion como modelo de lenguaje carece de base.
- Las funciones de IA anunciadas ("Ask Tav'iel" con citas textuales y la critica de transcripciones de YouTube/TikTok) no estan disponibles; no hay informacion sobre el modelo base, el metodo de anclaje ni la tasa de alucinacion.
- Estado pre-release con cambios diarios y actualizaciones automaticas por red: la interfaz y el comportamiento pueden variar sin aviso, lo que desaconseja su uso en entornos de produccion que requieran estabilidad.
- Licencia "other" sin terminos concretos publicados: no queda claro si se permite el uso comercial, la redistribucion o la modificacion, ni que ocurre con los textos biblicos de terceros incluidos.
- Distribucion mediante un ejecutable .exe: Windows puede mostrar un aviso de SmartScreen por editor nuevo, y no se ofrece firma digital ni verificacion de integridad documentada. Conviene comprobar la procedencia antes de ejecutarlo.
- Dependencia de Windows como plataforma principal: no se documentan versiones para macOS, Linux ni movil.
- Sesgo de tradicion: la aplicacion prioriza explicitamente la perspectiva del Nombre (YHWH / Yahweh Tsidkenu) y la capa Red Letter en KJV, ademas de incluir escrituras gnosticas y apocrifos etiopes; el marco interpretativo no es neutral y condiciona la presentacion del material.
- Sin datos de idioma de interfaz ni de cobertura completa de las mas de 120 versiones: no se detalla que versiones concretas estan incluidas ni sus licencias individuales.
- No hay informacion sobre sesgos, alucinacion, limites de contexto ni rendimiento del motor de busqueda y estudio, al no existir evaluaciones publicadas.

## Enlaces

- Repositorio en HuggingFace (descarga y releases): https://huggingface.co/OhBeOneKeyNoBe/YahBible
- Ejecutable directo: https://huggingface.co/OhBeOneKeyNoBe/YahBible/resolve/main/YahBible.exe
- Presentacion en PDF con codigos QR: https://huggingface.co/OhBeOneKeyNoBe/YahBible/resolve/main/The_YahBible_Scripture_Study_Presentation.pdf
- GitHub: https://github.com/OhBeOneKeyNoBe/YahBible
- Sitio del autor: https://www.RealizeUS.me/@yahwehtsidkenu
- Paper, blog tecnico o demo adicionales: no disponibles en la informacion proporcionada.
