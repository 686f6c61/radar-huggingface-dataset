# plunderer54/bybit-uta-perp-copytrading-bot

## Resumen

La ficha solicitada corresponde al identificador `plunderer54/bybit-uta-perp-copytrading-bot`, publicado en Hugging Face. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automatico: es un repositorio que distribuye un supuesto ejecutable para Windows (`dandys-world-forsaken-script-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) presentado como bot de copytrading de futuros perpetuos en Bybit. No contiene pesos, tokenizador, configuracion de arquitectura ni pipeline declarado.

El repositorio no ofrece parametros, longitud de contexto, tipos de cuantizacion ni formato de pesos, porque no hay modelo subyacente. La model card esta redactada como pagina de descarga de software, con enlaces a binarios alojados en GitHub, contrasena de archivo (`2026`) e instrucciones para ejecutar el ejecutable como administrador y desactivar avisos de Windows Defender o SmartScreen. Estos patrones son caracteristicos de campanas de distribucion de software potencialmente no deseado o malicioso, no de un modelo open source.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, senalando explicitamente la ausencia de cualquier componente de IA y los riesgos de seguridad asociados. No debe interpretarse como una evaluacion de capacidades de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card; no implican capacidades linguisticas de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` para Windows 10/11 de 64 bits) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio contiene, segun su propia model card, un paquete `dandys-world-forsaken-script-2026-v1.2.2-win64.zip` de 4,8 MB con un ejecutable que se debe extraer con contrasena y lanzar con privilegios de administrador. Las etiquetas (`windows`, `windows-11`, `x64`, `portable`) describen el entorno de ejecucion del binario, no un modelo.

La model card menciona funcionalidades propias de un bot de trading (enrutado de ordenes por WebSocket y gRPC, sandbox de paper trading, filtro de honeypots, almacen de claves AES-256), pero no aporta ningun detalle verificable sobre implementacion, dependencias, codigo fuente ni auditoria. No hay repositorio de codigo abierto enlazado, ni paper, ni datos de entrenamiento. Cualquier afirmacion de rendimiento del binario (por ejemplo, latencias o porcentajes de consistencia) procede unicamente del texto promocional del autor y no es verificable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No dispone de modo de razonamiento (thinking), vision, audio ni capacidades multimodales.
- El binario declara funcionalidades de trading (copytrading de perpetuos en Bybit, gestion de take profit, sandbox de simulacion), sin evidencia tecnica independiente.
- Multilingue solo a nivel de etiquetas de metadatos; no hay interfaz ni modelo linguistico documentado.

## Casos de uso

- No se identifican casos de uso legitimos como modelo de IA, porque no lo es.
- Auditoria de seguridad: analizar el binario en un entorno aislado (maquina virtual sin credenciales) para determinar si el ejecutable realiza acciones maliciosas antes de cualquier uso.
- Estudio de campanas de distribucion en Hugging Face: el repositorio sirve como ejemplo de model card abusada para alojar enlaces a binarios externos con contrasena, practica frecuente en campanas de malware.
- Monitorizacion de la plataforma: util para equipos que rastrean repositorios con etiquetas de trading y binarios ejecutables para reportarlos o bloquearlos.
- Formacion en higiene de seguridad: caso practico sobre por que no se debe ejecutar como administrador un binario sin firma procedente de un repositorio sin reputacion.
- No se recomienda su uso para trading real: la ausencia de codigo fuente, auditoria y reputacion (0 descargas, 0 likes en el momento de la consulta) impide cualquier evaluacion de fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (sub-40 ms de enrutado, 98,3 % o 96,1 % de consistencia, menos de 62 MB de RAM) son afirmaciones promocionales del autor sin metodologia, conjunto de prueba ni verificacion independiente, por lo que no se recogen como resultados.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits (unico requisito declarado).
- VRAM: no aplica; no hay modelo neuronal que cargar.
- GPU recomendadas: no aplica.
- Cabida en GPU de consumo: no aplica.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no aplica.
- Espacio en disco: 4,8 MB para el ZIP, mas el contenido extraido (no detallado).
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos" comparable, ya que este repositorio no contiene un modelo de IA. Frente a modelos de lenguaje reales de la plataforma, la comparacion carece de sentido: no hay parametros, contexto ni licencia de pesos que contrastar.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como tal en articulos, comparativas ni evaluaciones tecnicas.
- Riesgo de seguridad alto: distribuye un ejecutable sin firma, alojado en un repositorio de GitHub de terceros, con instrucciones para ejecutarlo como administrador y para desactivar avisos de Defender o SmartScreen.
- El uso de contrasena en el ZIP y de enlaces de descarga externos dificulta el analisis automatico y es un patron habitual en la distribucion de malware.
- Cero descargas y cero likes en el momento de la consulta: sin reputacion ni comunidad que valide el artefacto.
- La licencia MIT declarada no otorga ninguna garantia sobre el binario ni sobre su comportamiento en ejecucion.
- Riesgo financiero: un supuesto bot de trading que solicita claves de API o credenciales de exchange puede exponer fondos; no hay evidencia de que el almacen de claves AES-256 descrito exista o funcione como se afirma.
- No hay codigo fuente, paper, demo ni auditoria que permita verificar ninguna de las capacidades declaradas.
- Se recomienda no descargar ni ejecutar el binario y, en su caso, reportar el repositorio a la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/plunderer54/bybit-uta-perp-copytrading-bot
- Enlace de descarga citado en la model card (GitHub, no verificado): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Repositorio de releases citado en la model card (GitHub, no verificado): https://github.com/sandra95508/bybit-uta-perp-copytrading-bot/releases/latest
- Paper, blog, demo o documentacion tecnica: no disponible
