# ipsilondev/gemma-4-e2b-it-litertlm

## Resumen

`ipsilondev/gemma-4-e2b-it-litertlm` es un espejo sin modificaciones del modelo `litert-community/gemma-4-E2B-it-litert-lm`, publicado por el desarrollador ipsilondev para garantizar compilaciones reproducibles de sus aplicaciones Android (Ipsilon). Se trata de un artefacto de inferencia en el formato propietario LiteRT-LM de Google AI Edge, pensado para ejecución en dispositivo (on-device) en Android, no de un modelo entrenado desde cero ni de un fine-tune: el autor declara explícitamente que no hay conversión ni recuantización respecto al original.

El modelo subyacente es Gemma 4 E2B en su variante instruida (it), es decir, la versión de 2B de parámetros efectivos de la familia Gemma 4 de Google, distribuida bajo licencia Apache-2.0. El repositorio pesa 2,6 GB y contiene un único fichero de pesos de 2.588.147.712 bytes con SHA-256 verificado. Su interés práctico es acotado: sirve como fuente estable y con hash reproducible para integrar un LLM de gama pequeña en aplicaciones Android mediante el runtime LiteRT-LM.

La relevancia de esta ficha es, por tanto, la de un artefacto de distribución más que la de un modelo nuevo. No hay información publicada sobre arquitectura interna, datos de entrenamiento, benchmarks ni idiomas soportados en la información disponible; lo que sigue se limita a lo que el autor documenta y a las implicaciones técnicas del formato de empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E2B it; detalles internos no publicados en la informacion disponible) |
| Parametros totales | no disponible (la nomenclatura "E2B" sugiere 2B de parametros efectivos, sin confirmacion en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica que no hay recuantizacion respecto al original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`), empaquetado en dos partes `.part1` y `.part2` |

Datos adicionales verificables:

| Parametro | Valor |
|---|---|
| Tamano del fichero unico | 2.588.147.712 bytes (aprox. 2,41 GiB) |
| SHA-256 del fichero unido | `181938105e0eefd105961417e8da75903eacda102c4fce9ce90f50b97139a63c` |
| Parte 1 | `gemma-4-E2B-it.litertlm.part1`, 1.400.000.000 bytes |
| Parte 2 | `gemma-4-E2B-it.litertlm.part2`, 1.188.147.712 bytes |
| Runtime | Google AI Edge LiteRT-LM (Android), Maven `com.google.ai.edge.litertlm:litertlm-android` |
| Modelo base | `litert-community/gemma-4-E2B-it-litert-lm` (commit `2e12bfd869b2962984f97a1f2a26807316d534cc`) |
| Acceso | no gated |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas en Gemma 4 E2B it. La model card de este repositorio no describe el modelo subyacente; se limita a documentar el espejo y el procedimiento de empaquetado. Cualquier afirmacion sobre atencion lineal, decodificacion especulativa o mezcla de expertos seria especulativa y no se incluye.

La unica innovacion tecnica documentada es de ingenieria de distribucion: el fichero unico de LiteRT-LM se divide en dos partes de 1.400.000.000 y 1.188.147.712 bytes para que cada una quepa en un asset pack de Google Play (limite de 1,5 GB). La aplicacion cliente concatena ambas partes en el dispositivo (`cat part1 part2 > gemma-4-E2B-it.litertlm`), verifica el SHA-256 del fichero unido contra `sha256.txt` y lo carga con LiteRT-LM. El autor confirma que no hay conversion ni recuantizacion: los bytes son identicos a los del repositorio upstream.

## Capacidades

- Generacion de texto e inferencia de instrucciones en dispositivo, heredadas del modelo base Gemma 4 E2B it (no detalladas en la model card de este espejo).
- Ejecucion local en Android mediante LiteRT-LM, sin dependencia de servicios en la nube.
- Carga de pesos verificable criptograficamente (SHA-256) y reproducible a partir de un commit upstream fijado.
- Capacidades de tool calling, agentes, vision, audio, thinking mode o multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Integracion de un LLM local en aplicaciones Android: el artefacto esta empaquetado especificamente para el runtime LiteRT-LM y el esquema de asset packs de Google Play, de modo que la app puede descargar las dos partes, unirlas y cargarlas sin pasos de conversion.
- Compilaciones reproducibles en CI/CD: el commit upstream fijado, el tamano exacto en bytes y el SHA-256 publicado permiten verificar que el binario desplegado coincide con el esperado en cada build.
- Funciones sin conectividad: al ejecutarse en el dispositivo, permite tareas de generacion de texto en escenarios con red intermitente o requisitos de privacidad que desaconsejan enviar datos a un servidor.
- Prototipado de asistentes embebidos: util para validar el comportamiento de Gemma 4 E2B it en hardware Android antes de comprometerse con un pipeline de distribucion propio.
- Verificacion de integridad en produccion: el fichero `sha256.txt` con lineas en formato `sha256sum` para ambas partes y para el fichero unido sirve como control de integridad en el arranque de la aplicacion.
- Base para experimentacion con LiteRT-LM: al ser un espejo no gated y sin modificaciones, reduce la friccion para equipos que evaluan el runtime de Google AI Edge con un modelo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el fichero de pesos ocupa 2,41 GiB; el requisito de memoria en tiempo de ejecucion depende del runtime LiteRT-LM y del contexto configurado, y no esta documentado en la informacion disponible.
- Plataforma objetivo: Android, mediante Google AI Edge LiteRT-LM (dependencia Maven `com.google.ai.edge.litertlm:litertlm-android`).
- GPU recomendadas: no disponible. El autor describe el artefacto como build generico para CPU/GPU.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no aplica directamente, ya que el formato `.litertlm` esta orientado a dispositivos Android y no a servidores con CUDA.
- Opciones de despliegue: LiteRT-LM en Android. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `ipsilondev/gemma-4-e2b-it-litertlm` (este) | no disponible (E2B) | no disponible | Apache-2.0 | LiteRT-LM | Espejo sin modificar, empaquetado para Play asset packs |
| `litert-community/gemma-4-E2B-it-litert-lm` | no disponible (E2B) | no disponible | Apache-2.0 | LiteRT-LM | Upstream directo; mismo contenido binario |
| Alternativas de otro runtime (llama.cpp, Ollama) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La unica comparacion sustentable es con el repositorio upstream, del que este es un espejo byte a byte. No hay informacion suficiente para comparar con otros modelos de 2B en cuanto a rendimiento o contexto.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune: es un espejo sin cambios del upstream. Cualquier limitacion del modelo base Gemma 4 E2B it aplica integramente, pero no esta documentada en esta model card.
- Ausencia total de datos sobre sesgos, tasas de alucinacion, idiomas soportados y comportamiento en contextos largos.
- La licencia Apache-2.0 se declara en la model card citando la del upstream; conviene verificar los terminos de Gemma 4 en la fuente original antes de un uso comercial, ya que las condiciones de la familia Gemma han variado historicamente entre versiones.
- El artefacto esta atado al runtime LiteRT-LM y al esquema de asset packs de Google Play; no es portable a otros motores de inferencia sin conversion (que el autor no proporciona).
- El proceso de union de partes en el dispositivo anade un paso critico: si la concatenacion o la verificacion SHA-256 fallan, la carga del modelo producira errores dificiles de diagnosticar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion por terceros.
- El campo `pipeline` no esta definido y los idiomas no estan declarados, lo que complica la seleccion automatizada en herramientas que dependan de esos metadatos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ipsilondev/gemma-4-e2b-it-litertlm
- Modelo base (upstream): https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Commit upstream referenciado: `2e12bfd869b2962984f97a1f2a26807316d534cc`
- Google AI Edge LiteRT-LM: no disponible en la informacion proporcionada (referencia Maven: `com.google.ai.edge.litertlm:litertlm-android`)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
