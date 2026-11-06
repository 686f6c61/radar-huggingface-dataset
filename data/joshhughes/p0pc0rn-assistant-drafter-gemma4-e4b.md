# JoshHughes/p0pc0rn-assistant-drafter-gemma4-e4b

## Resumen

p0pc0rn-assistant-drafter-gemma4-e4b es un modelo borrador (drafter) para decodificacion especulativa, derivado del asistente multi-token-prediction (MTP) de Google Gemma 4 E4B-it. Lo ha convertido y cuantizado el proyecto p0pc0rn, una aplicacion on-device de Joshua Hughes que ejecuta inferencia mediante WebGPU en el navegador y en telefonos. Su funcion no es generar respuestas por si mismo, sino proponer varios tokens por adelantado para que un modelo mayor (en este caso NVIDIA Nemotron 3.5 Bolt E4B, post-entrenado a partir de Gemma 4 E4B) los verifique en una sola pasada, acelerando la generacion sin alterar el contenido final.

El artefacto publicado pesa 55 MB en un unico shard y emplea un formato propietario denominado `pocketflux.pack/1`, con capas cuantizadas a 8 bits (grupos de 64) y una cabeza de salida a 4 bits (grupos de 32) en orden cluster-major. No es un checkpoint compatible con Transformers: solo lo lee el motor WebGPU de la aplicacion p0pc0rn, lo que limita su reutilizacion fuera de ese ecosistema.

La relevancia del modelo es acotada pero concreta: demuestra una via para llevar decodificacion especulativa a dispositivos de consumo mediante cuantizacion agresiva y un contenedor optimizado para streaming con verificacion sha256 por bloques de 16 MiB. La licencia es Apache-2.0, heredada del checkpoint fuente de Google y no de los terminos de uso de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado del asistente MTP de Gemma 4 E4B-it (drafter para decodificacion especulativa) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Capas a 8 bits (grupos de 64); cabeza de salida a 4 bits (grupos de 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `pocketflux.pack/1` (`.pfw` raw tensor data + `manifest.json`); no es un checkpoint de Transformers |

## Arquitectura y entrenamiento

El modelo es un drafter de prediccion multi-token construido sobre el asistente de Gemma 4 E4B-it, que a su vez actua como modelo auxiliar del modelo principal Gemma 4 E4B-it. En el esquema de decodificacion especulativa, el drafter propone varios tokens candidatos que el modelo verificador valida en una sola pasada; el texto final es siempre el elegido por el verificador, de modo que el drafter no introduce contenido propio en la respuesta. La pre-proyeccion del modelo lee la concatenacion `[state | embedding]`, segun la model card.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original; la model card solo documenta el proceso de conversion y cuantizacion. La innovacion tecnica destacable es el empaquetado: cuantizacion por grupos con precision distinta para capas y cabeza, orden cluster-major en la cabeza de salida, y un manifiesto que registra offset, forma y codificacion de cada tensor junto con el sha256 de cada bloque de 16 MiB para verificacion durante la descarga.

## Capacidades

- Prediccion multi-token para decodificacion especulativa: genera borradores de varios tokens que un modelo verificador valida en una pasada.
- Aceleracion de inferencia sin alterar la salida: el texto final lo decide integramente el modelo verificador.
- Ejecucion on-device mediante WebGPU en la aplicacion p0pc0rn.
- Verificacion de integridad por bloques de 16 MiB contra `manifest.json` (sha256).
- No soporta tool calling, function calling ni razonamiento multi-paso por si mismo; esas capacidades corresponden al modelo verificador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No es un modelo de proposito general: no esta pensado para generar respuestas de forma autonoma.

## Casos de uso

- Aceleracion de respuestas en la app p0pc0rn: el drafter propone tokens que Nemotron 3.5 Bolt E4B verifica en una pasada, reduciendo la latencia percibida en la generacion de texto dentro de la aplicacion movil.
- Inferencia en telefonos de gama alta: con 55 MB en un unico shard y cuantizacion 8/4 bits, el drafter puede residir en memoria junto al modelo verificador sin agotar los recursos del dispositivo.
- Despliegue en navegador con WebGPU: el formato `pocketflux.pack/1` y el manifiesto con hashes permiten streaming de pesos por bloques, adecuado para entornos con memoria limitada.
- Integracion en pipelines de generacion de contenido de la app (imagenes, videos cortos, canciones): el drafter acelera los turnos de texto que acompanan a la generacion multimodal del modelo mayor.
- Prototipado de decodificacion especulativa on-device: sirve como referencia para estudiar el equilibrio entre tamano del drafter, tasa de aceptacion y latencia en hardware movil.
- Distribucion con verificacion de integridad: el esquema de sha256 por chunk facilita despliegues donde la cadena de custodia de los pesos es un requisito, aunque el formato sea propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 55 MB para los pesos del drafter; el consumo real depende del modelo verificador que se cargue en paralelo.
- GPU recomendadas: no disponibles en la informacion proporcionada; el motor de ejecucion es WebGPU, por lo que se apoya en la GPU integrada o discreta expuesta por el navegador.
- Cabe en GPU de consumo: si, por tamano (55 MB), aunque la viabilidad practica depende de que el dispositivo soporte WebGPU y de la memoria disponible para el verificador.
- Opciones de despliegue: exclusivamente el motor WebGPU de p0pc0rn; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un checkpoint de Transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tasa de aceptacion ni de speedup.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| p0pc0rn-assistant-drafter-gemma4-e4b | no disponible | no disponible | `pocketflux.pack/1` | Apache-2.0 | Solo motor p0pc0rn (WebGPU) |
| google/gemma-4-E4B-it-assistant | no disponible | no disponible | pesos originales de Google | Apache-2.0 | Hugging Face, ecosistema estandar |
| JoshHughes/p0pc0rn-assistant-nemotron-bolt-e4b-q4 | no disponible | no disponible | `pocketflux.pack/1` | no disponible | Solo motor p0pc0rn (WebGPU) |

El modelo fuente de Google es la alternativa natural para uso fuera de p0pc0rn, al conservar el formato estandar y no requerir un motor propietario. El verificador Nemotron 3.5 Bolt E4B cuantizado a 4 bits es el complemento disenado para operar junto a este drafter.

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera respuestas finales ni debe usarse como chatbot o asistente autonomo.
- Formato propietario: `pocketflux.pack/1` solo lo lee el motor WebGPU de p0pc0rn; no es utilizable con herramientas estandar de inferencia.
- Sin datos publicados de benchmarks, tasa de aceptacion ni speedup; el beneficio real en latencia no esta cuantificado.
- Idiomas soportados no documentados; se desconoce la cobertura multilingue del drafter.
- Riesgo de alucinacion: inherente al borrador, aunque mitigado porque el verificador valida cada token propuesto.
- Licencia Apache-2.0 heredada del checkpoint fuente de Google, no de los terminos de uso de Gemma; conviene revisar `NOTICE.md` antes de redistribuir.
- Repositorio sin descargas ni likes y creado y actualizado el mismo dia (2026-10-26): madurez y soporte no contrastados.
- Dependencia de WebGPU: la viabilidad depende del soporte del navegador y del dispositivo, no solo de la memoria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshHughes/p0pc0rn-assistant-drafter-gemma4-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-assistant
- Verificador complementario: https://huggingface.co/JoshHughes/p0pc0rn-assistant-nemotron-bolt-e4b-q4
- X oficial del proyecto: https://x.com/p0pc0rnapp
- X de Joshua Hughes: https://x.com/joshhughes___
