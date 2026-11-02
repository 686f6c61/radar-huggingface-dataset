# blrt-ai/marid

## Resumen

Marid (مارد) es un asistente de IA para Android desarrollado por BLRT.ai que se distribuye a traves de este repositorio de HuggingFace. Segun la model card, el proyecto consiste en "genios" (agentes) capaces de conversar, operar el telefono, programar, disenar y generar imagenes, video y audio, funcionando bien con claves de API propias del usuario o con modelos que se ejecutan en el propio dispositivo.

Es importante senalar que este repositorio no contiene un modelo de lenguaje en el sentido tradicional, sino un canal de publicacion de releases de la aplicacion Android (APK y ficheros de actualizacion firmados), un fichero `index.json` con la lista firmada de actualizaciones, y archivos de codigo fuente de componentes cuyas licencias exigen su publicacion. El mismo contenido se publica en GitHub (github.com/blrt-ai/marid) y este repositorio es un espejo.

No se dispone de informacion sobre arquitectura, tamano de parametros, contexto ni datos de entrenamiento del modelo o modelos subyacentes. La model card no documenta ningun modelo concreto, por lo que los datos tecnicos de inferencia no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta en ingles y arabe) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio distribuye APK, `index.json` firmado y archivos de codigo fuente) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo o modelos que utiliza Marid. La model card describe el producto como un asistente para Android que puede operar con claves de API propias del usuario (es decir, delegando en modelos externos) o con modelos que se ejecutan en el propio telefono (on-device), pero no especifica que modelos son, su tamano, su arquitectura ni su proceso de entrenamiento.

Tampoco se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion como RLHF o DPO. Lo unico reseñable a nivel de ingenieria es el mecanismo de distribucion: Marid solo instala actualizaciones firmadas por BLRT.ai, verificadas a traves de un `index.json` firmado adjunto a cada release, y Android solicita confirmacion al usuario antes de instalar una nueva version.

## Capacidades

- Conversacion multi-turno mediante agentes ("genies") integrados en la aplicacion Android.
- Control y uso del telefono: la model card indica que los agentes pueden "usar tu telefono".
- Generacion de codigo y tareas de diseno.
- Generacion de imagenes, video y audio.
- Ejecucion con claves de API propias del usuario o con modelos on-device.
- Sistema de actualizaciones firmadas con catalogo de genios, habilidades y paquetes de instrucciones.
- No se documentan capacidades especificas de tool calling, razonamiento multi-paso ni modo "thinking" mas alla de la descripcion general del producto.

## Casos de uso

- Asistente personal en Android: el usuario interactua con agentes conversacionales dentro de la app para tareas cotidianas, con la opcion de usar sus propias claves de API o modelos locales.
- Automatizacion de acciones en el telefono: los "genies" pueden operar el dispositivo, lo que permite automatizar flujos como gestion de ajustes o interaccion con apps.
- Generacion de imagenes y video desde el movil: util para creadores que necesitan producir contenido visual sin salir del dispositivo.
- Generacion de audio: sintesis de voz o audio para contenido multimedia dentro de la app.
- Asistencia a programacion en movilidad: el asistente puede generar y revisar codigo, adecuado para consultas rapidas fuera del escritorio.
- Despliegue de modelos on-device con privacidad: al ejecutar modelos en el propio telefono, los datos no salen del dispositivo, lo que encaja en escenarios con requisitos de privacidad.
- Distribucion controlada de actualizaciones: el mecanismo de `index.json` firmado sirve a equipos que necesitan desplegar actualizaciones verificadas en flotas de dispositivos Android.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la distribucion es una aplicacion Android (APK) con modelos on-device; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica un modelo de lenguaje concreto ni alternativas comparables de la misma categoria.

## Limitaciones y advertencias

- No hay informacion sobre sesgos conocidos del modelo o modelos subyacentes.
- No se documenta el riesgo de alucinacion ni metricas de fiabilidad.
- Se desconoce la licencia, por lo que no puede confirmarse el uso comercial del contenido del repositorio.
- El repositorio no contiene pesos de modelo; quien busque un modelo para inferencia directa no lo encontrara aqui.
- La model card esta redactada en ingles y arabe; no se confirma soporte de castellano.
- Al depender de claves de API propias o de modelos on-device no especificados, el rendimiento real dependera del proveedor o del modelo elegido por el usuario.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/blrt-ai/marid
- GitHub (espejo): https://github.com/blrt-ai/marid
