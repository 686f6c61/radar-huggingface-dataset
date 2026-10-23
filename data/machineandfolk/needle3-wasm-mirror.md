# machineandfolk/needle3-wasm-mirror

# Ficha tecnica: needle3-wasm-mirror (motor WebAssembly de Needle 3)

## Resumen

`machineandfolk/needle3-wasm-mirror` no es un modelo de machine learning, sino un espejo (mirror) del motor WebAssembly que ejecuta Needle 3, el modelo de reconocimiento de voz desarrollado por Cactus Compute. El repositorio contiene unicamente tres ficheros copiados sin modificaciones del repositorio original `Cactus-Compute/needle3`, fijados a la revision `93e88ede867e4311c39151285e74df513e4b835b`: `wasm/needle.js` (63 KB), `wasm/needle.wasm` (929 KB) y la licencia Apache 2.0.

La relevancia de este artefacto es de ingenieria de despliegue: permite ejecutar el modelo de voz en el navegador mediante WebAssembly, sin GPU y sin enviar audio a un servidor. Su autor lo mantiene para que las builds que fijan esa revision concreta no dependan de que el repositorio upstream siga disponible, y lo usa para ejecutar el modelo speech-to-text `machineandfolk/whistle-mirror`. Es, por tanto, una pieza de cadena de suministro reproducible, no un checkpoint entrenado.

Conviene subrayar que en la informacion disponible no hay datos del modelo subyacente (parametros, contexto, dataset de entrenamiento ni resultados de benchmarks). Todo lo que sigue distingue explicitamente entre lo que describe el artefacto publicado y lo que queda marcado como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | motor de inferencia WebAssembly (no se describe la arquitectura del modelo de voz subyacente) |
| Parametros totales | no disponible (el repositorio no contiene pesos) |
| Parametros activos | no aplica (no es un modelo MoE; el repositorio no contiene pesos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (fichero `LICENSE` upstream, copyright de Cactus Compute) |
| Formato de pesos | no contiene pesos; artefactos `.js` (63 KB) y `.wasm` (929 KB) |
| Tamano del repositorio | 0.0 GB |
| Revision fijada del upstream | `93e88ede867e4311c39151285e74df513e4b835b` |
| Libreria declarada | `cactus-needle` |
| Checksums SHA-256 | publicados para los tres ficheros e identicos a los del upstream |

## Arquitectura y entrenamiento

Este repositorio no documenta ni contiene el proceso de entrenamiento del modelo. Lo unico verificable es la naturaleza del artefacto: un binario WebAssembly de 929 KB acompanado de un binding JavaScript de 63 KB, empaquetados bajo la libreria `cactus-needle` y etiquetados con `webassembly` y `on-device`. El hecho de que el binario completo ocupe menos de 1 MB indica un modelo de voz de muy baja huella, pensado para ejecucion en el cliente, pero no se especifican capas, atencion, tipo de encoder de audio ni volumen de datos de entrenamiento.

Tampoco hay informacion sobre el pipeline de alineamiento, las tecnicas de compresion aplicadas para producir el `.wasm`, ni si el modelo usa cuantizacion en enteros o algun esquema mixto. El autor declara explicitamente que la copia es "unchanged" y que cada hash coincide con el fichero original, de modo que cualquier innovacion tecnica relevante pertenece al upstream `Cactus-Compute/needle3` y no se recoge en la model card de este espejo.

## Capacidades

- Reconocimiento de voz (speech-to-text) mediante Needle 3, segun la etiqueta `speech-recognition` y el uso declarado por el autor para el modelo Whistle.
- Ejecucion on-device en el navegador a traves de WebAssembly, sin dependencia de servidor para la inferencia.
- Integracion en entornos JavaScript: el binding `needle.js` expone el motor al runtime del navegador.
- Portabilidad a cualquier runtime compatible con WebAssembly (navegadores modernos, Node.js, Deno, Wasmtime), siempre que el binding JavaScript sea utilizable.
- Reproducibilidad de builds: revision y checksums fijados, aptos para pipelines con verificacion de integridad.
- No se documentan en la informacion disponible capacidades de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni modo thinking.

## Casos de uso

- Transcripcion de voz en el navegador: cargar `needle.js` y `needle.wasm` en una pagina web y transcribir audio del microfono en el cliente, evitando enviar grabaciones a un backend.
- Aplicaciones con requisitos de privacidad: al ejecutarse en el dispositivo, el audio no abandona el equipo del usuario, lo que encaja en entornos sanitarios, legales o corporativos con restricciones de salida de datos.
- Dictado en editores y herramientas web: integrar el motor en un editor o formulario para convertir voz en texto sin infraestructura de inferencia propia.
- Accesibilidad: subtitulado en vivo de conversaciones o de contenido multimedia dentro de una aplicacion web, con un binario inferior a 1 MB que no penaliza el tiempo de carga.
- Aplicaciones web progresivas y modo offline: al no depender de una API remota, el motor puede cachearse y funcionar sin conexion una vez descargado.
- Cadena de suministro reproducible: fijar la revision `93e88ede867e4311c39151285e74df513e4b835b` y verificar los SHA-256 en un pipeline de CI para garantizar que el binario desplegado es identico al auditado.
- Reduccion de costes de servidor: desplazar la inferencia de voz al cliente elimina el coste por minuto de audio procesado en infraestructura propia, a cambio del consumo de CPU del dispositivo del usuario.
- Base para el modelo Whistle: servir como runtime del modelo `machineandfolk/whistle-mirror` en despliegues web, que es el uso real declarado por el autor del espejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el artefacto esta disenado para ejecucion WebAssembly en CPU.
- GPU: no se requieren ni se documentan. El motor no depende de CUDA, ROCm ni Metal.
- Huella en disco y memoria: 63 KB de JavaScript y 929 KB de WebAssembly, mas el coste del modelo que el motor cargue en tiempo de ejecucion (tamano no disponible).
- Compatibilidad consumer: si, en cualquier dispositivo con un navegador que soporte WebAssembly; no se especifican minimos de CPU ni de memoria RAM.
- Opciones de despliegue: navegador mediante el binding `needle.js`, o cualquier runtime WebAssembly (Node.js, Deno, Wasmtime, Wasmer). vLLM, TGI, llama.cpp y Ollama no aplican a este artefacto.
- Latencia y throughput: no disponibles. Dependeran del hardware del cliente, del modelo cargado y de la duracion del audio.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada, ya que el objeto publicado es un motor de inferencia y no un modelo. La unica comparacion posible es entre repositorios del mismo artefacto:

| Repositorio | Contenido | Revision | Licencia | Mantenimiento |
|---|---|---|---|---|
| `machineandfolk/needle3-wasm-mirror` | copia de `needle.js`, `needle.wasm` y `LICENSE` | fijada a `93e88ede...` | Apache 2.0 | tercero, sin cambios |
| `Cactus-Compute/needle3` (upstream) | modelo, motores para otras plataformas y documentacion | evoluciona | Apache 2.0 | autor original |
| `machineandfolk/whistle-mirror` | modelo speech-to-text que consume este motor | no disponible | no disponible | tercero |

## Limitaciones y advertencias

- No contiene pesos ni el modelo en si: por si solo no permite hacer inferencia sin descargar el modelo correspondiente del upstream.
- La model card no ofrece especificaciones del modelo subyacente (parametros, contexto, idiomas, cuantizacion), lo que impide evaluar su calidad desde este repositorio.
- Es un espejo mantenido por un tercero, no por Cactus Compute; no hay garantia de actualizacion ni de soporte.
- La revision esta congelada en `93e88ede867e4311c39151285e74df513e4b835b`; avances posteriores del upstream no se reflejan aqui.
- El copyright del codigo pertenece a Cactus Compute. Apache 2.0 permite uso comercial, pero exige conservar avisos de copyright y licencia y cumple la clausula de patentes; conviene revisar el `LICENSE` completo antes de redistribuir.
- El autor pide citar el repositorio original segun sus indicaciones; este espejo no sustituye esa atribucion.
- No se documentan sesgos, tasas de error de transcripcion ni riesgo de alucinacion del modelo de voz. En ASR, los fallos tipicos son sustituciones y omisiones de palabras, especialmente con ruido de fondo o acentos no representados en el entrenamiento, pero no hay datos para cuantificarlo.
- Idiomas soportados no disponibles: no se puede confirmar cobertura del castellano ni de otras lenguas.
- Ejecucion en el cliente: el rendimiento dependera de la CPU del usuario y del navegador, con variabilidad dificil de acotar sin mediciones publicadas.

## Enlaces

- Repositorio espejo: https://huggingface.co/machineandfolk/needle3-wasm-mirror
- Repositorio upstream (modelo, otros motores y documentacion): https://huggingface.co/Cactus-Compute/needle3
- Modelo que consume este motor: https://huggingface.co/machineandfolk/whistle-mirror
- Sitio del desarrollador original: https://cactuscompute.com
