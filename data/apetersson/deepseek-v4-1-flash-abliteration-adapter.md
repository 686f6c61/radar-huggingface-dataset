# apetersson/DeepSeek-V4.1-Flash-Abliteration-Adapter

## Resumen

`apetersson/DeepSeek-V4.1-Flash-Abliteration-Adapter` no es un modelo de lenguaje, sino un paquete de tres ficheros experimentales de direccionamiento direccional (`DS41DIR` v1) pensados para intervenir las activaciones de DeepSeek V4.1 Flash Q2. El autor lo publica bajo el identificador ds4/directional-steering y advierte explicitamente de que no contiene pesos, no es un adaptador PEFT/LoRA y no constituye una version "abliterated" validada. Su proposito es servir como artefacto de investigacion para estudiar la reduccion de rechazos y la preservacion de capacidades mediante modificacion de direcciones en el espacio de activaciones.

Cada fichero ocupa 819.272 bytes: una cabecera `DS41DIR v1` de 72 bytes seguida de 40 vectores de 5.120 valores float32 en little-endian. Las filas seleccionadas son vectores unitarios y las no seleccionadas son cero; la cabecera define el punto de intervencion (residual o writer) y la mascara de capas. Solo se carga un fichero por ejecucion y la intensidad no esta codificada en el payload, sino que se pasa explicitamente por linea de comandos.

La relevancia actual es metodologica: el paquete documenta de forma reproducible una via de steering sobre un modelo de gran tamano (el GGUF Q2 requerido pesa 365.713.686.528 bytes, unos 341 GiB) mediante un fork propio de ds4 con soporte Metal y streaming desde SSD. El autor subraya que la reduccion de rechazos, la preservacion de capacidades y la transferencia de comportamiento a Q2 "remain unqualified", por lo que debe tratarse como material de investigacion, no como release utilizable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no contiene pesos; corresponde al modelo base DeepSeek V4.1 Flash) |
| Parametros totales | no disponible (no se declaran parametros del modelo base; el GGUF Q2 requerido ocupa 365.713.686.528 bytes) |
| Parametros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible como propiedad del modelo; los ejemplos del autor arrancan el servidor con `-c 4096` |
| Tipos de cuantizacion | Q2 exclusivamente para el modelo base (`DeepSeek-V4.1-Flash-Q2.gguf`); el paquete de adaptadores no se cuantiza |
| Idiomas soportados | no disponible |
| Licencia | MIT (licencia declarada del repositorio del paquete; la del modelo base no se especifica en la informacion disponible) |
| Formato de pesos | `DS41DIR v1` (819.272 bytes: cabecera de 72 bytes + 40 x 5.120 float32); el modelo base requerido esta en GGUF |

Detalle de los tres artefactos incluidos:

| Fichero | Tipo/origen | Punto de intervencion | Capas seleccionadas (base 0) | Intensidad de smoke test |
|---|---|---|---|---|
| `msuiche-mean-equal-experiment.ds41dir` | Vectores publicados, convertidos localmente con interpretacion residual explicita | residual | 1-39 | 0.5 |
| `s-zaizen-writer-proxy.ds41dir` | Proxy ajustado localmente a partir de diferencias de pesos publicadas | writer | 0-39 | 1.0 |
| `dealignai-writer-proxy.ds41dir` | Proxy ajustado localmente a partir de diferencias de pesos publicadas | writer | 10-36 | 1.0 |

## Arquitectura y entrenamiento

El paquete no entrena nada ni publica pesos: son vectores de direccion derivados de fuentes publicadas y de ajustes locales sobre diferencias de pesos. Dos de los ficheros (`s-zaizen-writer-proxy` y `dealignai-writer-proxy`) son proxies ajustados localmente en el punto de intervencion "writer"; el tercero (`msuiche-mean-equal-experiment`) parte de vectores publicados convertidos con una interpretacion residual explicita. El autor indica que estos son los artefactos W3 y no los fixtures sinteticos e0 de ABL-049 ni direcciones de rechazo aprendidas localmente.

La intervencion se aplica en inferencia sobre activaciones, con una intensidad `--dir-steering-strength` finita en el rango [-100, 100]: cero omite la edicion, uno elimina la componente direccional, los valores fraccionarios eliminan esa fraccion y los negativos la anaden. Los alfas nativos por capa que aparecen en el JSON de auditoria son diagnosticos, no recomendaciones de ejecucion, y no deben integrarse en los vectores unitarios. La implementacion requiere la rama `feat/abl-049-v41-cli-steering` del repositorio `apetersson/ds4`, fijada en el commit `0c8f374f7531c705cef805a522ff3655ab50b917`, que corresponde a la implementacion aplastada del CLI ABL-049 y del servidor ABL-052 sobre la base W1 `f8a581b3ac5f5c568669eb324c0a5bf27f2b8e77`.

Un aspecto tecnico destacable es el binding por digest: los tres ficheros se vinculan al SHA256 completo `1ce6a8f8806205c13330d7ca287bd198331dc5ca35ccc5d8a9a92a188a6f6f42` del fichero de modelo. Renombrar o mover los mismos bytes es aceptable, pero cualquier cuantizacion distinta, GGUF reconvertido, reescritura de metadatos o variante partida en discos no es intercambiable. El CLI y el servidor calculan el hash del fichero abierto (incluidos datos Engram solo en disco) una vez por proceso con un buffer de 1 MiB.

## Capacidades

- Aplicacion de intervenciones direccionales sobre activaciones del modelo base en dos puntos: residual y writer.
- Seleccion de capas por mascara (residual 1-39, writer 0-39, writer 10-36 segun el fichero).
- Control de intensidad explicito en el rango [-100, 100], con semantica definida para valores cero, unitarios, fraccionarios y negativos.
- Servicio HTTP compatible con los endpoints `/v1/models` y `/v1/chat/completions`, con respuestas en streaming mediante `"stream": true`.
- Reutilizacion en memoria del prompt con la intervencion aplicada (el prompt cacheado conserva el efecto).
- Reutilizacion del digest verificado entre turnos interactivos y recreaciones de `/ctx`, sin rehash.
- Streaming desde SSD para el modelo base, con hashing completo del fichero al arranque.
- Soporte de `reasoning_effort` en las peticiones (los ejemplos usan `"reasoning_effort":"none"`).
- No incluye tool calling, function calling, agentes, vision ni audio: no se documenta ninguna de estas capacidades.
- No hay soporte multilingue documentado.

## Casos de uso

- Investigacion en interpretabilidad: cargar cada `.ds41dir` y medir como cambian las activaciones y las respuestas del modelo base en las capas seleccionadas, comparando el punto residual frente al writer para caracterizar donde reside la direccion de rechazo.
- Auditoria de seguridad y red-teaming controlado: usar las intensidades de smoke test (0,5 y 1,0) para comprobar si el modelo base reduce conductas de rechazo y si aparecen degradaciones no deseadas, registrando los resultados antes de sacar conclusiones.
- Estudio de transferencia entre cuantizaciones: verificar experimentalmente la afirmacion del autor de que la transferencia a Q2 "remains unqualified" ejecutando los mismos prompts contra el GGUF Q2 y, si se dispone de otros bytes, comprobando por que el binding por digest rechaza el intercambio.
- Reproducibilidad de experimentos ABL-049/ABL-052: reconstruir el entorno exacto clonando la rama con `--single-branch` y fijando el commit indicado, de forma que los resultados sean replicables aunque la rama avance.
- Validacion de preservacion de capacidades: lanzar baterias de evaluacion con y sin intervencion (por ejemplo, aritmetica simple como el prompt `17 + 25` del ejemplo) para cuantificar si la reduccion de rechazos viene acompanada de perdida de capacidad.
- Formacion tecnica en steering direccional: usar el paquete como material didactico reproducible en cursos de seguridad de IA, dado que separa explicitamente los artefactos de investigacion de cualquier release validado.
- Verificacion de infraestructura de inferencia: practicar el despliegue de un modelo de ~341 GiB con streaming desde SSD en una sesion Metal mono-proceso, midiendo tiempos de arranque, hashing y primera respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y advierte que la reduccion de rechazos, la preservacion de capacidades y la transferencia a Q2 permanecen sin cualificar.

El unico dato de rendimiento aportado es operativo y local: en un M1 Ultra, las ejecuciones del CLI con steering de ABL-049 tardaron aproximadamente entre 213 y 217 segundos, incluyendo el arranque, el hashing completo del modelo y un prompt corto. El propio autor lo califica de observacion local y no de garantia de throughput.

## Requisitos de hardware

- Los tres ficheros de adaptador son triviales en disco (819.272 bytes cada uno).
- El modelo base requerido ocupa 365.713.686.528 bytes (unos 341 GiB), por lo que necesita almacenamiento SSD amplio y se ejecuta con `--ssd-streaming`.
- Entorno validado: macOS con compilador y herramientas de desarrollo Metal, en un Apple Silicon M1 Ultra.
- Sesion Metal de un unico proceso. No estan soportados CPU, CUDA, modos distribuidos/tensor-parallel ni especulativos para estas intervenciones.
- No cabe en GPU de consumo tipo RTX 4090 por el tamano del modelo base y porque la implementacion no soporta CUDA.
- Opciones de despliegue: exclusivamente el binario `ds4-server` o el CLI de la rama `feat/abl-049-v41-cli-steering` del repositorio `apetersson/ds4`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Restriccion de cache: no usar `--kv-disk-dir`, porque los ficheros de cache en disco no codifican la identidad de la intervencion y la combinacion se rechaza incluso con intensidad cero.
- El servidor configura todas las ranuras de sesion con el mismo artefacto y la misma intensidad; para cambiarlas hay que reiniciar, ya que las peticiones no seleccionan adaptador.
- Latencia observada: 213-217 segundos por ejecucion local incluyendo arranque y hashing completo; el primer arranque puede tardar varios minutos por la lectura completa del modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. La tabla siguiente contrasta el enfoque de este paquete con otras tecnicas habituales de la misma categoria (modificacion de comportamiento no supervisada en inferencia), sin cifras de benchmarks:

| Enfoque | Que modifica | Reversible en ejecucion | Formato | Disponibilidad |
|---|---|---|---|---|
| Este paquete (`DS41DIR`) | Activaciones en puntos residual/writer, con intensidad configurable | Si (intensidad 0 omite la edicion; reinicio para cambiar de fichero) | `DS41DIR` v1, un fichero por ejecucion | Requiere fork propio de ds4 y Apple Silicon Metal |
| Abliteration clasico de pesos | Pesos del modelo de forma permanente | No | safetensors/GGUF modificados | Publicacion como modelo completo |
| Adaptadores PEFT/LoRA | Matrices adicionales sobre capas del modelo | Si, cargando o descargando el adaptador | safetensors u otros formatos PEFT | Ecosistema estandar (PEFT, vLLM, TGI) |
| Control vectors de HuggingFace | Vectores de direccion sobre activaciones | Si, con factores de escala | Formato de control vector del ecosistema HF | No aceptado como `DS41DIR` segun el autor |

Los parametros, la longitud de contexto, la licencia y el rendimiento del modelo base no se detallan en la informacion proporcionada, por lo que no es posible completar una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo completo, ni un adaptador PEFT/LoRA, ni un release "abliterated" validado: no incluye ni modifica pesos.
- La reduccion de rechazos, la preservacion de capacidades y la transferencia de comportamiento a Q2 estan explicitamente sin cualificar ("remain unqualified").
- Las intensidades indicadas (0,5 y 1,0) son ajustes de smoke test de integracion, no valores optimizados ni recomendados por comportamiento. Los alfas por capa del JSON de auditoria son diagnosticos y no deben integrarse en los vectores unitarios.
- Dependencia estricta de bytes: cualquier cuantizacion distinta, GGUF reconvertido, reescritura de metadatos o variante partida cambia el SHA256 y el paquete deja de ser valido. El binding verifica identidad, no calidad de transferencia.
- Limitacion de plataforma severa: solo Apple Silicon con Metal, un unico proceso, con streaming desde SSD. Sin soporte de CPU, CUDA, distribuido ni especulativo.
- Solo se carga un fichero de direccion por ejecucion, y todas las ranuras del servidor comparten artefacto e intensidad; no hay seleccion por peticion.
- Incompatibilidad con `--kv-disk-dir`, rechazada incluso a intensidad cero.
- El autor advierte de no reescribir el digest del adaptador para sortear un mismatch.
- No hay informacion sobre idiomas soportados, sesgos, tasas de alucinacion ni comportamiento multilingue.
- La licencia MIT declarada corresponde al repositorio del paquete; la licencia del modelo base DeepSeek V4.1 Flash no se especifica en la informacion disponible y debe verificarse por separado antes de cualquier uso comercial.
- Estado del repositorio: 0 descargas, 0 likes, 0,0 GB de tamano, creado y actualizado el 2026-09-12 con unos 20 segundos de diferencia, lo que indica una publicacion muy reciente y sin validacion externa.
- Uso responsable: se trata de una tecnica orientada a reducir rechazos, por lo que su aplicacion debe enmarcarse en investigacion de seguridad y cumplir la normativa aplicable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/apetersson/DeepSeek-V4.1-Flash-Abliteration-Adapter
- Modelo base referenciado: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Repositorio de codigo requerido: https://github.com/apetersson/ds4
- Rama necesaria: https://github.com/apetersson/ds4/tree/feat/abl-049-v41-cli-steering
- Commit fijado: https://github.com/apetersson/ds4/commit/0c8f374f7531c705cef805a522ff3655ab50b917
- Los resultados de busqueda web disponibles no aportan enlaces adicionales relevantes sobre el modelo (corresponden a un proveedor de hosting sin relacion).
