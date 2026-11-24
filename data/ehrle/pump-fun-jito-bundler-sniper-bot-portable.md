# EhRLe/pump-fun-jito-bundler-sniper-bot-portable

## Resumen

La ficha solicitada no puede redactarse como ficha de modelo de IA porque el artefacto catalogado en Hugging Face bajo el identificador `EhRLe/pump-fun-jito-bundler-sniper-bot-portable` no es un modelo de lenguaje. Se trata de un ejecutable portable para Windows x64 (`pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe`, build `v1.2.7 (B723CC)`) empaquetado en un ZIP de 4,8 MB, distribuido con contrasena `2026` y publicado por el usuario `EhRLe`. No existe pipeline declarado, ni pesos, ni tokenizador, ni configuracion de arquitectura neuronal.

El contenido de la model card describe funcionalidades propias de un bot de trading sobre Solana: filtro pre-compra de honeypots, copytrade de carteras de ballenas, enrutamiento de ordenes por debajo de 40 ms, take profit multinivel, bundler de 20 carteras mediante Lookup Tables y un sandbox de paper trading. Nada de esto constituye un modelo de IA: es software de automatizacion financiera con instrucciones de instalacion que incluyen ejecutar como administrador tras descomprimir con contrasena.

Esta ficha se limita a documentar el artefacto tal y como aparece en la informacion disponible, senalando explicitamente que las secciones tecnicas propias de un modelo (parametros, contexto, cuantizacion, benchmarks) no son aplicables. Se advierte de que la publicacion presenta patrones habituales de distribucion de software potencialmente malicioso: binario sin codigo fuente, enlace de descarga alojado en un repositorio de GitHub de terceros distinto del autor, contrasena en el archivo comprimido y ausencia total de trazabilidad sobre el contenido del ejecutable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; ejecutable Win64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repo) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP con un `.exe` para Windows x64 |
| Plataforma objetivo | Windows x64 / Windows 11 |
| Tamano del paquete | 4,8 MB (ZIP) |
| Version / build | v1.2.7 (B723CC / B723CCF3DF) |
| Contrasena del archivo | `2026` |
| Dependencias externas | ninguna declarada por el autor |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que documentar. El artefacto es un binario compilado para Windows x64 que, segun la model card, implementa logica de trading: verificacion de mint/freeze authority y bloqueo de LP, espejado de carteras, streaming de transacciones por WebSocket y gRPC, ejecucion multi-cartera en el mismo bloque mediante Lookup Tables, y simulacion contra libros de ordenes en vivo con sondeo a 172 Hz. El autor declara un consumo inferior a 64 MB de RAM para el enrutamiento y de 31 MB para el modulo de take profit.

No se proporciona informacion sobre el lenguaje de programacion, las dependencias enlazadas, la cadena de compilacion ni el hash de integridad del binario. Tampoco se documenta ningun dataset, proceso de RLHF, DPO ni innovacion en decodificacion, porque el artefacto no realiza inferencia. La unica innovacion tecnica mencionada es de dominio financiero (bundling de 20 carteras con Lookup Tables y enrutamiento sub-40 ms), no de machine learning.

## Capacidades

- Ejecucion de un binario portable en Windows x64 sin dependencias externas declaradas.
- Filtro pre-compra descrito como verificacion de mint/freeze authority y bloqueo de LP.
- Copytrade de carteras de ballenas con dimensionamiento proporcional, segun la model card.
- Enrutamiento de ordenes declarado por debajo de 40 ms mediante WebSocket y gRPC.
- Take profit multinivel con objetivos de escalado y trailing stop.
- Bundler de hasta 20 carteras en el mismo bloque mediante Lookup Tables.
- Sandbox de paper trading contra libros de ordenes en vivo con sondeo a 172 Hz.
- Interfaz multilenguaje declarada en metadatos (14 idiomas).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni modo de pensamiento, al no ser un modelo de IA.

## Casos de uso

- Evaluacion de seguridad de artefactos: un analista puede usar esta ficha para identificar que el paquete no es un modelo y someterlo a analisis estatico y dinamico en una maquina virtual aislada antes de cualquier ejecucion.
- Documentacion de catalogos: un equipo que mantenga un inventario de repositorios de Hugging Face puede clasificar este artefacto como software de trading y no como modelo, evitando errores en pipelines de evaluacion de LLM.
- Formacion en higiene de cadena de suministro: el caso sirve para ilustrar patrones de riesgo (ZIP con contrasena, ejecutable como administrador, enlace de descarga en repositorio de terceros) en sesiones de concienciacion.
- Analisis de malware: investigadores pueden estudiar la estructura del binario y su comportamiento de red en un entorno controlado, dado el interes que suscita la ausencia de codigo fuente y trazabilidad.
- Auditoria de licencias: un equipo legal puede revisar la discrepancia entre la licencia MIT declarada y la ausencia de codigo fuente que permita verificar el cumplimiento.
- Monitorizacion de repositorios sospechosos: plataformas de moderacion pueden usar los metadatos (0 descargas, 0 likes, creado y actualizado en dos segundos, enlaces externos) como senal para revision manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo de IA, por lo que MMLU, HumanEval, GSM8K y metricas equivalentes no son aplicables. Las unicas cifras declaradas por el autor son de rendimiento del software (enrutamiento por debajo de 40 ms, sondeo a 172 Hz, consumo inferior a 64 MB y 31 MB de RAM), sin metodologia de medicion ni evidencia reproducible.

## Requisitos de hardware

- VRAM: no aplica; el artefacto no ejecuta inferencia neuronal.
- GPU recomendadas: no aplica; no se declara aceleracion por GPU.
- Compatibilidad con GPU de consumo: no aplica.
- CPU y sistema operativo: Windows x64 moderno, con Windows 11 mencionado en las etiquetas; el autor indica ejecutar como administrador.
- RAM declarada: por debajo de 64 MB para el modulo de enrutamiento y por debajo de 31 MB para el de take profit, segun la model card.
- Espacio en disco: el paquete ZIP ocupa 4,8 MB; el espacio descomprimido no se especifica.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el unico modo de ejecucion descrito es descomprimir el ZIP con contrasena y lanzar el `.exe` como administrador.
- Latencia y throughput: no verificables; las cifras del autor carecen de metodologia publicada.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. En la categoria de software de trading automatizado no se han proporcionado alternativas en la informacion disponible, y establecer comparaciones requeriria acceso al codigo fuente y a mediciones independientes que no existen.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural; cualquier expectativa en ese sentido es erronea.
- Distribucion de un ejecutable binario sin codigo fuente, sin hash de integridad publicado y sin firma digital verificable en la informacion disponible.
- El enlace de descarga apunta a un repositorio de GitHub de un tercero (`carlos7088`) distinto del autor declarado (`EhRLe`), lo que rompe la trazabilidad de la cadena de suministro.
- El ZIP esta protegido con contrasena (`2026`), practica que dificulta el analisis automatico por parte de antivirus y sistemas de moderacion.
- Las instrucciones indican ejecutar el binario como administrador, lo que amplia el impacto potencial de cualquier comportamiento malicioso.
- La licencia MIT declarada no es verificable sin acceso al codigo fuente; el cumplimiento de la licencia queda en entredicho.
- Las cifras de rendimiento y consumo son declaraciones del autor sin evidencia reproducible.
- Riesgo elevado de que se trate de software no deseado o malicioso; se recomienda no ejecutarlo en sistemas de produccion ni con carteras de criptomonedas reales.
- El uso de bots de trading conlleva riesgo financiero directo y posible incumplimiento de las condiciones de servicio de las plataformas implicadas.
- No se documentan sesgos, alucinaciones ni limitaciones de contexto o idioma porque no aplican a un binario de trading; los 14 idiomas listados son una declaracion de metadatos sin verificar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EhRLe/pump-fun-jito-bundler-sniper-bot-portable
- Enlace de descarga citado en la model card (repositorio de terceros): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado como origen de releases: https://github.com/henkbonnet297/pump-fun-jito-bundler-sniper-bot-portable/releases/latest
- Paper, blog, demo o repositorio oficial del autor: no disponible
