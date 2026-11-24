# felnotas/football-legends-script

## Resumen

El repositorio `felnotas/football-legends-script` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido como fichero ZIP para Windows x64 que, segun su propia model card, se presenta como un "script" o "trainer" para el juego *Football Legends*, con funcionalidades declaradas de suavizado de entrada tipo bezier, superposicion externa a 144 Hz, radar 2D y filtro de objetos. El autor lo publica bajo licencia MIT y lo etiqueta con lenguajes y plataformas, pero no incluye pesos, arquitectura, tokenizador ni pipeline de inferencia.

La relevancia de esta ficha es, por tanto, negativa: sirve para documentar que el artefacto no es evaluable como modelo y que su model card presenta indicios claros de distribucion de software potencialmente malicioso o de trampa (enlaces a un repositorio de GitHub de terceros con un nombre ajeno al proyecto, contrasena fija para extraer el archivo, ejecutable que requiere permisos de administrador y afirmaciones de evasion de captura de pantalla en OBS, ShadowPlay y Discord). No se dispone de informacion sobre arquitectura, parametros, contexto ni datos de entrenamiento porque no existe tal modelo.

No se han publicado resultados de benchmarks, no hay pesos en formato safetensors ni GGUF, y no hay evidencia de que el repositorio contenga codigo de inferencia. Cualquier uso en produccion como modelo de lenguaje es inviable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun etiquetas del autor) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. La model card describe un componente externo en modo usuario ("user-mode external core") que renderiza mediante Desktop Duplication sin inyectar DLLs, con un consumo declarado inferior a 35 MB de RAM, una superposicion externa a 144 Hz con cajas 2D/3D y esqueletos de huesos, un escaner dinamico de offsets tras parches del juego, un radar 2D con filtrado por rareza y una capa de render "stream-proof" que afirma excluirse de OBS, ShadowPlay y Discord. Estos elementos son propios de herramientas de trampa en videojuegos, no de un modelo entrenado.

No se documenta ningun proceso de entrenamiento, dataset, RLHF, DPO ni innovacion en atencion o decodificacion. La unica informacion tecnica concreta es la del binario: `monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe`, build `v1.4.1` (`72E2CE58F2`), empaquetado en `monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip` de 4,8 MB y protegido con la contrasena `2026`.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; las etiquetas de idioma son metadatos del repositorio.
- No dispone de modo thinking, vision, audio ni ninguna capacidad cognitiva.
- Las unicas "capacidades" declaradas son funciones de automatizacion y visualizacion sobre un videojuego, sin verificacion independiente.

## Casos de uso

- Ninguno valido como modelo de IA. El artefacto no puede emplearse para generacion de texto, codigo, atencion al cliente, analisis de datos ni ninguna tarea de NLP.
- Auditoria de seguridad: un equipo puede usar esta ficha para catalogar el repositorio como no apto para entornos corporativos, dado que distribuye un ejecutable de terceros con contrasena fija y solicita privilegios de administrador.
- Formacion en deteccion de phishing: el patron de la model card (badges de descargas infladas, enlaces a repositorios ajenos, contrasena `2026`, promesas de evasion de capturas) es un ejemplo didactico de ingenieria social.
- Analisis de cadena de suministro: revisar que el ZIP enlaza a `Giovanni9790/monster-hunter-wilds-trainer-mod` mientras el repositorio se llama `Teixeira669/football-legends-script` permite ilustrar ataques de confusion de dependencias.
- Politica de cumplimiento: sirve como caso de estudio de por que las plataformas deben moderar repositorios que no contienen modelos pese a estar alojados en Hugging Face.
- Investigacion de malware: el binario y su contrasena fija pueden analizarse en una sandbox aislada para determinar si el ejecutable realiza acciones no declaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el artefacto es un ejecutable de Windows x64.
- Latencia y throughput: no disponibles. La model card afirma tiempos de respuesta inferiores a 34 ms para la superposicion, 33 ms para la capa de render y consumos de RAM de 35 a 56 MB, pero son cifras no verificadas y corresponden a un programa de escritorio, no a inferencia de un modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `felnotas/football-legends-script` | no disponible (no es un modelo) | no disponible | MIT | Repositorio de Hugging Face con 0 descargas y 0 likes |
| Modelos de lenguaje open source comparables | no disponible | no disponible | no disponible | no disponible |

No existe categoria de modelo comparable porque el artefacto no es un modelo de IA. Cualquier comparacion con un LLM, un modelo de vision o un modelo multimodal seria incorrecta.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en articulos tecnicos.
- La model card contiene indicios de riesgo: enlaces de descarga que apuntan a un repositorio de GitHub de terceros (`Giovanni9790/monster-hunter-wilds-trainer-mod`) distinto del autor declarado, contrasena fija `2026` para extraer el ZIP y solicitud de ejecucion como administrador.
- Las afirmaciones de evasion de captura de pantalla (OBS, ShadowPlay, Discord) son caracteristicas propias de software de trampa y pueden violar los terminos de servicio de los videojuegos.
- No hay verificacion de integridad ni firma del binario; el hash `72E2CE58F2` es un identificador de build, no una garantia criptografica.
- Riesgo de alucinacion: no aplica al no ser un modelo generativo; el riesgo equivalente es la desinformacion de la propia model card.
- Sesgos: no aplica.
- Restricciones de licencia: la licencia MIT del repositorio no cubre el binario de terceros enlazado, cuya procedencia y licencia son desconocidas.
- Para produccion: no usar. El repositorio tiene 0 descargas y 0 likes, fue creado y actualizado el mismo dia (2026-11-24) y no incluye pesos, configuracion ni codigo de inferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/felnotas/football-legends-script
- Repositorio de GitHub enlazado en la model card: https://github.com/Teixeira669/football-legends-script
- Repositorio de GitHub del binario: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod
- Descarga directa citada: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Paper, blog o demo: no disponibles.
