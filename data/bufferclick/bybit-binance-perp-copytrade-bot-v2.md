# bufferclick/bybit-binance-perp-copytrade-bot-v2

## Resumen

`bufferclick/bybit-binance-perp-copytrade-bot-v2` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es una supuesta aplicacion ejecutable para Windows distribuida como archivo ZIP, orientada a la copia de operaciones en futuros perpetuos de Bybit y Binance. El repositorio no contiene pesos, configuracion de transformer, tokenizador ni artefactos propios de un modelo de lenguaje.

El autor declara la etiqueta `license: mit` y una lista de catorce idiomas, pero la model card describe un binario `.exe`, un ZIP de 4,8 MB protegido con contrasena y enlaces de descarga alojados en un repositorio de GitHub de terceros. Los tags (`windows`, `windows-11`, `x64`, `portable`) confirman que se trata de software empaquetado, no de un modelo.

Desde el punto de vista de evaluacion de modelos, este repositorio no es utilizable: no hay arquitectura, parametros, contexto ni formato de pesos que analizar. Ademas, el patron de distribucion (binario opaco, contrasena fija, enlaces externos, nombre de archivo incoherente con el repositorio) es un indicador clasico de riesgo de seguridad, por lo que se recomienda no ejecutarlo. Esta ficha documenta el repositorio con la estructura habitual, indicando explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicacion empaquetada para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, no verificables) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. El repositorio no incluye `config.json`, `tokenizer.json`, ficheros `safetensors` ni `GGUF`. La model card describe modulos funcionales de un supuesto bot de trading: motor de bundles Jito/MEV, filtro antihaneypot, sandbox de paper trading, bundler de veinte carteras con Lookup Tables, enrutamiento de ordenes con latencia declarada inferior a 40 ms y copia de carteras de smart money.

No se documenta ningun proceso de entrenamiento, dataset, RLHF, DPO ni innovacion en atencion o decodificacion. Los unicos datos tecnicos del README son cifras de rendimiento autoafirmadas (97,6 % y 99,2 % de consistencia, menos de 63 MB de RAM) sin metodologia de medicion ni evidencia reproducible.

## Capacidades

- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling en el sentido de un modelo de lenguaje.
- No implementa razonamiento multi-paso ni modos de pensamiento.
- No hay capacidades multilingues reales; los idiomas son solo etiquetas de metadatos.
- El unico contenido funcional declarado es la operativa de trading descrita en la model card, no verificable.

## Casos de uso

- No se identifican casos de uso legitimos como modelo de IA: el repositorio no contiene un modelo desplegable.
- Evaluacion de riesgos de cadena de suministro: puede usarse como ejemplo de repositorio de Hugging Face con artefactos binarios opacos y enlaces externos, util en formacion sobre deteccion de malware.
- Auditoria de metadatos: sirve para practicar la revision de tags, licencias declaradas y coherencia entre nombre de repositorio y nombre de archivo distribuido.
- No se recomienda su uso para trading real: un binario sin codigo fuente verificable, protegido con contrasena y alojado fuera de Hugging Face no ofrece garantias de integridad.
- No es adecuado para atencion al cliente, generacion de codigo, analisis documental ni ninguna tarea de NLP.
- No es adecuado como dependencia en pipelines de CI/CD ni en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras del README (consistencia del 97,6 % y 99,2 %, latencia inferior a 40 ms, menos de 63 MB de RAM) son afirmaciones del autor sin protocolo de medicion, hardware de referencia ni conjunto de prueba, por lo que no constituyen benchmarks validos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos declarados del artefacto: Windows 10 o Windows 11 de 64 bits y ejecucion como administrador, segun la model card. Ejecutar binarios desconocidos con privilegios elevados incrementa el impacto de cualquier compromiso del sistema.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos de IA comparable porque el repositorio no contiene un modelo. Frente a otros repositorios de Hugging Face, la diferencia relevante es que estos alojan pesos y configuracion verificables, mientras que aqui el artefacto es un ejecutable externo.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con MMLU, HumanEval, GSM8K ni metricas equivalentes.
- Riesgo de seguridad alto: distribucion mediante ZIP con contrasena fija (`2026`), ejecutable sin firma verificable, enlaces de descarga a un repositorio de GitHub de terceros y nombre de archivo (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip`) incoherente con el nombre del repositorio.
- Posible malware o troyano: el patron de binario opaco con instrucciones de ejecucion como administrador es habitual en campanas de distribucion de software malicioso.
- La licencia MIT declarada no garantiza nada sobre el contenido del binario ni sobre su procedencia.
- Cero descargas y cero likes en el momento de la consulta, lo que impide cualquier validacion por parte de la comunidad.
- No usar en produccion, ni con claves de API de exchanges, ni con fondos reales.
- Si se ha ejecutado el binario, se recomienda analisis antivirus, revision de persistencia en el sistema y rotacion de credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bufferclick/bybit-binance-perp-copytrade-bot-v2
- Repositorio de GitHub referenciado en la model card: https://github.com/Caroline27881/bybit-binance-perp-copytrade-bot-v2
- Enlace de descarga externo citado en la model card: https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Paper, blog, demo o documentacion tecnica: no disponible
