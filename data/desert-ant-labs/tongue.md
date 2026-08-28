# desert-ant-labs/tongue

## Resumen

Tongue es un modelo de identificacion de idiomas (language identification) desarrollado por Desert Ant Labs, disenado para ejecutarse completamente en el dispositivo (on-device) con un peso de apenas 2 MB en cuantizacion int8. Su proposito es resolver una tarea concreta y compleja: detectar el idioma de textos cortos, como los que aparecen en cajas de busqueda, mensajes de chat o entradas de teclado, donde los detectores tradicionales fallan por falta de contexto. El modelo soporta 84 idiomas y produce una respuesta en decenas de microsegundos, sin necesidad de tokenizador ni archivos de vocabulario, ya que utiliza un hashing de n-gramas de caracteres sobre Unicode.

La arquitectura combina un enrutador de escrituras basado en UAX #24 (sin parametros) con un modelo lexico basado en un EmbeddingBag int8 y una cabeza lineal con softmax enmascarado por escritura. Incluye correccion de prioridad para equilibrar idiomas con pocos datos y un mecanismo de abstencion calibrada que devuelve respuestas con niveles de confianza (confident, likely, tentative) en lugar de forzar una prediccion cuando la entrada es ambigua. El modelo se distribuye en varios formatos (binario int8, int4, ONNX y PyTorch) y cuenta con SDKs para Swift, Kotlin y JavaScript, lo que permite integrarlo en iOS, Android, navegadores y Node.js.

Su relevancia actual radica en la creciente demanda de soluciones de IA en el borde (edge AI) que respeten la privacidad, funcionen sin conexion y tengan un coste computacional minimo. Tongue se posiciona como una alternativa ligera a modelos mas grandes como lingua (266 MB), logrando un rendimiento comparable en textos cortos segun las pruebas del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Enrutador de escritura UAX #24 (sin parametros) + modelo lexico con EmbeddingBag int8 y cabeza lineal con softmax enmascarado por escritura |
| Parametros totales | no disponible (pesos int8 de 2,01 MiB; int4 de 1,01 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 caracteres (limite de entrada normalizada) |
| Tipos de cuantizacion | int8, int4, fp32 (ONNX y PyTorch) |
| Idiomas soportados | 84: af, am, ar, as, az, be, bg, bn, bo, ca, chr, cs, cy, da, de, dv, el, en, eo, es, et, eu, fa, fi, fr, ga, gl, gu, he, hi, hr, hu, hy, id, is, it, ja, ka, kk, km, kn, ko, ku, ky, la, lo, lt, lv, mk, ml, mn, mr, ms, my, ne, nl, no, or, pa, pl, pt, ro, ru, si, sk, sl, sq, sr, st, sv, sw, syr, ta, te, th, tl, tr, ug, uk, ur, vi, xh, yo, zh |
| Licencia | desert-ant-labs-source-available-1.0 (licencia de codigo fuente disponible, no open source estandar) |
| Formato de pesos | Binario raw (int8/int4), ONNX (opset 17), PyTorch checkpoint |

## Arquitectura y entrenamiento

Tongue emplea una arquitectura en dos etapas, sin encoder transformer ni tokenizador aprendido. La primera etapa es un enrutador de escrituras basado en el anexo UAX #24 de Unicode, que decide de forma determinista si el texto pertenece a una escritura asociada a un unico idioma (por ejemplo, Hangul → coreano, griego → griego, tailandes → tailandes) y, para escrituras multilingue (cirilico, arabe, devanagari, bengali), reduce el conjunto de candidatos antes de pasar al modelo. Este enrutador no tiene parametros y prioriza la presencia de una escritura sobre su dominio, evitando que una marca comercial en latin dentro de un texto griego desvie la clasificacion.

La segunda etapa es un modelo lexico que calcula n-gramas de caracteres de ordenes 1 y 5 (con marcadores de limites de palabra) sobre escalares Unicode, los hashea con FNV-1a y los suma mediante un EmbeddingBag int8. El resultado se proyecta a traves de una cabeza lineal y se decodifica con un softmax enmascarado por escritura. La tabla hash actua como espacio de caracteristicas, por lo que el tamano del modelo no crece con el numero de idiomas. Ademas, se aplica una correccion de prioridad (desplazamiento fijo -tau*log(prior) con tau=0.75) plegada en el sesgo exportado, para evitar que los pares de confusos colapsen hacia el idioma con mas recursos. El mecanismo de abstencion calibrada se basa en la longitud de entrada y el margen entre las dos primeras candidatas, no en la confianza bruta del softmax, que tiende a ser excesivamente alta en textos muy cortos.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se han publicado en la informacion disponible. El archivo `config.json` incluye la configuracion de entrenamiento y la precision de validacion por idioma, pero no se ha accedido a su contenido en la documentacion publica.

## Capacidades

- Identificacion de idioma en textos cortos de 1 a 3 palabras, con soporte para 84 idiomas.
- Deteccion en decenas de microsegundos por muestra, apta para aplicaciones en tiempo real.
- Clasificacion con niveles de confianza: `confident`, `likely` y `tentative`, con abstencion ante entradas ambiguas (por ejemplo, "la casa" se reporta como italiano o espanol con empate).
- Manejo de escrituras mixtas: el enrutador UAX #24 evita que una marca en latin desvie la deteccion en textos con escritura no latina.
- Normalizacion de entrada integrada: NFC, minusculas, eliminacion de URLs, menciones y digitos, y limite de 512 caracteres.
- Salida con codigos ISO 639-1/639-3 y probabilidades por idioma.
- Ejecucion sin conexion y sin envio de datos a servidores, compatible con requisitos de privacidad.
- Compatibilidad multiplataforma: iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.js, mediante SDKs en Swift, Kotlin y JavaScript.
- No requiere tokenizador ni archivo de vocabulario, simplificando el empaquetado y la versionado.

## Casos de uso

- Cajas de busqueda en aplicaciones moviles y web: Tongue puede detectar el idioma de la consulta en tiempo real para activar sugerencias de autocompletado, filtros de resultados o traduccion instantanea, sin necesidad de esperar a que el usuario seleccione un idioma manualmente. Su latencia de microsegundos permite ejecutarlo en cada pulsacion de tecla.
- Mensajeria y chat en el dispositivo: en aplicaciones de mensajeria, Tongue identifica el idioma de cada mensaje entrante para aplicar correctores ortograficos, traductores automaticos o para clasificar conversaciones por idioma, todo localmente y sin enviar contenido a la nube.
- Teclados virtuales: Tongue puede determinar el idioma que el usuario esta escribiendo en un teclado con soporte multilingue y cambiar automaticamente la disposicion de teclas, los diccionarios de autocorreccion y las sugerencias de palabras, mejorando la experiencia de escritura en dispositivos moviles.
- Moderacion de contenido en tiempo real: en plataformas con contenido generado por usuarios, Tongue puede clasificar el idioma de comentarios o publicaciones breves para enrutarlos a sistemas de moderacion especificos por idioma o para aplicar politicas regionales, funcionando en el borde para reducir latencia y costes de servidor.
- Asistentes de voz y transcripcion en el dispositivo: tras una transcripcion de voz corta, Tongue puede identificar el idioma hablado para seleccionar el modelo de comprension del lenguaje adecuado o para etiquetar grabaciones, todo sin conexion y con un consumo minimo de recursos.
- Clasificacion de documentos y metadatos en sistemas offline: Tongue puede asignar etiquetas de idioma a fragmentos de texto en aplicaciones de gestion documental, bibliotecas digitales o herramientas de analisis de datos que operan sin conexion, permitiendo filtrar y organizar grandes volumenes de texto breve (titulos, resumenes, citas) con una huella de memoria muy reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, etc.) en la informacion disponible, ya que se trata de un modelo de clasificacion de texto, no de generacion. El autor menciona en la demo que, sobre el conjunto de pruebas de lingua (otro detector de idiomas), el modelo de 2 MB se acerca a un punto porcentual del modelo lingua de 266 MB en los idiomas compartidos y lo supera en frases completas. Sin embargo, no se proporcionan cifras concretas ni una tabla comparativa. La model card indica que los pares de palabras son el caso mas dificil para un modelo pequeno y que idiomas muy cercanos como malayo e indonesio no son separables de forma fiable a este tamano.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM dedicada; los pesos int8 ocupan 2,01 MiB y los int4 1,01 MiB, por lo que caben en la RAM de cualquier dispositivo moderno.
- GPU recomendadas: no se necesita GPU; el modelo esta disenado para ejecutarse en CPU, incluidos procesadores de telefonos moviles, microcontroladores y navegadores web.
- Compatibilidad con hardware de consumo: cabe en cualquier dispositivo con mas de 4 MB de RAM libre, incluidos relojes inteligentes, routers y dispositivos IoT.
- Opciones de despliegue: SDKs nativos para Swift (iOS, macOS, tvOS, visionOS), Kotlin (Android) y JavaScript (navegador y Node.js). Tambien se puede integrar mediante ONNX Runtime (onnxruntime o onnxruntime-web) para otros entornos.
- Latencia y throughput: la deteccion tarda decenas de microsegundos por muestra en hardware moderno; el rendimiento exacto depende de la plataforma, pero es suficiente para procesar cientos de miles de peticiones por segundo en un nucleo de CPU.

## Comparativa con modelos similares

No se dispone de datos publicos de benchmarks comparativos con otros modelos de identificacion de idiomas (como CLD3, fastText o lingua) en la informacion proporcionada. El autor menciona cualitativamente que Tongue (2 MB) se acerca al rendimiento de lingua (266 MB) en el conjunto de pruebas de este ultimo, y que lo supera en frases completas, pero no se ofrecen cifras. Las diferencias principales son:

| Modelo | Tamano | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Tongue (desert-ant-labs) | 2 MB (int8) | 84 | ONNX, binario, PyTorch | Desert Ant Labs Source Available 1.0 | Sin tokenizador, abstencion calibrada, multiplataforma |
| lingua | 266 MB | 110+ | ONNX, PyTorch | MIT (variante) | Modelo transformer, requiere mas recursos |
| CLD3 | ~1 MB (modelo) | 107 | Protocol Buffer | Apache 2.0 | Basado en red neuronal, orientado a Chrome |

La comparacion con CLD3 y lingua se basa en informacion publica general, no en datos verificados de este modelo. Para una evaluacion rigurosa, se recomienda ejecutar las pruebas del autor o benchmarks propios.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento limita el volumen de idiomas grandes y subrepresenta los idiomas con pocos datos, lo que puede generar confusiones entre idiomas cercanos como malayo e indonesio, o entre espanol e italiano en frases cortas.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede producir etiquetas incorrectas con alta confianza en entradas muy cortas (1-2 palabras) si no se usa el mecanismo de abstencion correctamente.
- Limitaciones de contexto: la entrada se limita a 512 caracteres tras la normalizacion; textos mas largos se truncan, lo que puede afectar a la deteccion en documentos extensos.
- Limitaciones de idioma: el mongol solo se detecta en escritura tradicional; no se soporta la escritura cirilica mongola. Ademas, las marcas comerciales y cadenas de version no son idioma y pueden producir resultados erroneos.
- Restricciones de licencia: la licencia desert-ant-labs-source-available-1.0 no es una licencia open source estandar (no es OSI-approved). Permite el acceso al codigo fuente, pero puede imponer restricciones al uso comercial o a la redistribucion; se debe revisar el texto completo en https://license.desertant.com/1.0 antes de desplegar en produccion.
- Advertencia para produccion: el autor recomienda leer la seccion de modos de fallo de la model card antes de implementar el modelo, especialmente para casos de uso donde la precision es critica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/tongue
- Documentacion del SDK (desert-ant-core): https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/tongue.md
- Pagina web del modelo: https://desertant.com/models/tongue/
- Repositorio GitHub del modelo: https://github.com/Desert-Ant-Labs/tongue
- Demo en vivo (navegador): https://huggingface.co/spaces/desert-ant-labs/tongue-demo
- Licencia: https://license.desertant.com/1.0
