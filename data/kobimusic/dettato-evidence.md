# kobimusic/dettato-evidence

## Resumen

Dettato evidence repairer es el segundo componente de Dettato, el sistema de transcripcion audio-a-MIDI multi-instrumento desarrollado por KobiMusic. No es un modelo generativo de texto ni un transcriptor autonomo: es una red de refinamiento que recibe las notas producidas por el transcriptor `dettato` junto con la evidencia interna que ese transcriptor genero para cada nota, y decide cuales conservar, cuales eliminar, como corregir sus ataques y finales, y que notas faltantes insertar.

Tecnicamente es un transformer a nivel de nota de solo 4,9 millones de parametros (192 dimensiones, 9 capas, 6 cabezas, posiciones rotatorias sobre tiempo de ataque y altura), que procesa la cancion en ventanas de 8 segundos de notas. Cada nota se representa como un token que combina atributos musicales (altura, velocidad derivada de la confianza del transcriptor, ataque y duracion, vecindad armonica y fase de rejilla ritmica) con un vector de evidencia de 769 numeros extraido de las mapas de probabilidad y del estado oculto del transcriptor.

Su relevancia es acotada pero concreta: demuestra que una segunda etapa ligera puede corregir errores sistematicos de un transcriptor neuronal usando su incertidumbre interna como senal, con una mejora medida de +0,30 puntos de composite sobre nueve conjuntos de benchmark publicos. Es una pieza de un pipeline de cuatro modelos, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de nota (192 dims, 9 capas, 6 cabezas, posiciones rotatorias sobre tiempo de ataque y altura) |
| Parametros totales | 4.930.929 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 8 segundos de notas; maximo 4096 notas por ventana |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (audio musical, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `config.json` de arquitectura y umbrales) |

## Arquitectura y entrenamiento

El modelo opera sobre una secuencia de tokens, uno por nota transcrita. Cada token codifica la altura MIDI, una velocidad derivada de la confianza del transcriptor, el ataque y la duracion dentro de la ventana, un vector de vecindad (huecos con la nota anterior y siguiente en la misma tecla, tamano de acorde, densidad de notas) y la fase de rejilla ritmica estimada a partir de los ataques de la ventana. A esto se anade el vector de evidencia de 769 dimensiones: 33 valores tomados de las seis mapas de probabilidad del transcriptor alrededor de la nota (probabilidades de onset, frame y offset de ambas voces antes, durante y despues, mas probabilidades de onset en teclas vecinas y armonicas) y el ultimo estado oculto del transcriptor (368 dims) en el ataque y promediado sobre la nota. La cabeza de salida predice P(keep), una correccion de ataque en pasos de 5 ms sobre un rango de +-0,5 s y una relacion de duracion; ademas, en dos ranuras de insercion por nota, predice P(hay una nota faltante cerca) junto con su desplazamiento de altura, ataque y duracion.

El entrenamiento se realizo con material sintetico generado internamente (no publicado), en etapas. La ultima etapa empareja las notas y la evidencia del propio transcriptor base de `dettato` (antes de su ajuste fino vocal) con las notas exactas del audio sintetico multi-instrumento. No se usaron grabaciones de benchmark ni para entrenar ni para elegir los umbrales. La regla de decision es fija: se eliminan notas con P(keep) < 0,4, se insertan notas con P >= 0,6, y una insercion se descarta si una nota conservada de la misma altura empieza en los 30 ms siguientes. La evidencia esta ligada al checkpoint concreto del transcriptor `dettato`, por lo que el modelo no funciona con otras fuentes de notas.

## Capacidades

- Refinamiento de transcripciones audio-a-MIDI: elimina notas falsas positivas, corrige ataques y finales, e inserta notas omitidas por el transcriptor.
- Prediccion de tres tareas por nota: probabilidad de conservacion, correccion temporal de ataque (pasos de 5 ms, rango +-0,5 s) y relacion de duracion.
- Deteccion de notas faltantes en dos ranuras de insercion por nota, con altura, ataque y duracion estimados.
- Uso de la incertidumbre interna del transcriptor como senal de correccion (vector de evidencia de 769 dimensiones).
- Procesamiento por ventanas de 8 segundos, con paso sin cambios de ventanas que superan las 4096 notas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio como entrada directa ni capacidades multilingues: su entrada es exclusivamente la salida estructurada del transcriptor `dettato`.

## Casos de uso

- Limpieza de transcripciones automaticas de mezclas musicales: se ejecuta tras el transcriptor `dettato` para reducir notas espurias antes de exportar el MIDI a un DAW, aprovechando que el umbral P(keep) < 0,4 filtra falsos positivos de forma determinista.
- Correccion de ataques en material con ritmica densa: la cabeza de correccion desplaza ataques en pasos de 5 ms hasta +-0,5 s, lo que resulta util en pasajes rapidos donde el transcriptor tiende a adelantar o retrasar onsets.
- Recuperacion de notas omitidas en acordes y texturas polifonicas: las ranuras de insercion con umbral P >= 0,6 anaden notas que el transcriptor no detecto, con supresion de duplicados a 30 ms de distancia.
- Preprocesado para separacion de instrumentos: como el modelo no maneja informacion de instrumento, se usa antes del `dettato-grouper`, que asigna las notas corregidas a pistas de instrumento.
- Analisis musical asistido por ordenador: la salida estructurada (onset, offset, pitch, flag de insercion y score) permite construir estadisticas de densidad de notas, tamano de acorde y fase ritmica sobre un corpus de grabaciones.
- Investigacion en transcripcion musical: sirve como referencia reproducible de una arquitectura de refinamiento ligera (4,9 M de parametros) que explota la evidencia interna de un modelo base, con umbrales y evaluacion documentados.
- Integracion en pipelines de produccion musical via CLI (`dettato song.mp3 -o out/`) o API de Python (`EvidenceRepairer.from_pretrained("cuda")`), con ejecucion en CPU o GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre nueve conjuntos de benchmark publicos (los ocho de la Tabla 2 del paper de MuScriptor mas el test de Slakh2100), con la red base del transcriptor `dettato` por delante (antes de su ajuste fino vocal) y las mismas notas de bateria en ambas filas. Metrica composite = media de F1 de onset, frame, offset y bateria.

| Sistema | Composite | Cambio |
|---|---|---|
| Transcriptor solo | 56,65 | |
| Transcriptor + evidence repairer | 56,95 | +0,30 (intervalo del 95%: +0,18 a +0,42) |

Desglose por metrica: onsets +0,38, offsets +1,96, frames -1,14 (acorta algunas notas sostenidas). Con el transcriptor ajustado fino para voz de una ronda anterior por delante, el composite paso de 57,04 a 57,37. La cadena completa con el checkpoint actual de `dettato` no se ha evaluado en benchmark segun la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 4,9 M de parametros, los pesos en precision completa ocupan aproximadamente 20 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican modelos concretos; el codigo acepta `"cuda"` o `"cpu"` en `EvidenceRepairer.from_pretrained`.
- Cabe en GPU consumer: si, por el reducido tamano del modelo (4,9 M de parametros), aunque el cuello de botella real sera el transcriptor `dettato` que se ejecuta antes.
- Opciones de despliegue: paquete `dettato` (instalacion via `pip install git+https://github.com/kobimusic/dettato`), CLI `dettato` y API de Python. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica modelos comparables de refinamiento de transcripcion con evidencia interna, y el modelo depende del checkpoint concreto del transcriptor `dettato`, lo que limita la comparacion directa con otras etapas de post-proceso.

| Modelo | Parametros | Contexto | Licencia | Dependencia |
|---|---|---|---|---|
| Dettato evidence repairer | 4,9 M | Ventanas de 8 s de notas (max. 4096 notas) | Apache-2.0 | Requiere notas y evidencia del transcriptor `dettato` |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo procesa notas con altura; no maneja informacion de instrumento ni de pista (el `dettato-grouper` se ejecuta despues).
- La mejora es modesta (+0,30 de composite) e intercambia precision de frame (-1,14) por mejores ataques (+0,38) y finales (+1,96); acorta algunas notas sostenidas.
- Dependencia estricta del checkpoint del transcriptor `dettato`: la evidencia esta ligada a ese modelo y el repairer no funciona con otras fuentes de notas ni con otras versiones del transcriptor.
- Las ventanas con mas de 4096 notas en 8 segundos pasan sin cambios, por lo que material de densidad extrema no se corrige.
- Entrenado exclusivamente con material sintetico interno no publicado; el comportamiento sobre grabaciones reales fuera de los benchmarks no esta documentado.
- Riesgo de alucinacion en sentido musical: las inserciones con P >= 0,6 pueden anadir notas inexistentes, aunque se descartan si una nota conservada de la misma altura empieza en los 30 ms siguientes.
- No se documentan sesgos por genero musical, instrumentacion ni origen de las grabaciones.
- Licencia Apache-2.0 permite uso comercial, pero no se ofrecen garantias ni soporte; el autor no publica los datos de entrenamiento.
- Sin resultados de benchmark de la cadena completa con el checkpoint actual del transcriptor, por lo que el rendimiento en produccion con la version vigente no esta verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kobimusic/dettato-evidence
- Repositorio del sistema Dettato: https://github.com/kobimusic/dettato
- Coleccion Dettato: https://huggingface.co/collections/kobimusic/dettato
- Transcriptor `dettato`: https://huggingface.co/kobimusic/dettato
- Agrupador de instrumentos `dettato-grouper`: https://huggingface.co/kobimusic/dettato-grouper
- Modelo de bateria `dettato-drums`: https://huggingface.co/kobimusic/dettato-drums
