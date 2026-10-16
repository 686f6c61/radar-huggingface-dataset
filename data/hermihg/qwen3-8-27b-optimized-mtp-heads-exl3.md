# HermiHg/Qwen3.8-27B-Optimized-MTP-Heads-exl3

## Resumen

Qwen3.8-27B-Optimized-MTP-Heads-exl3 es un paquete de cabezales de prediccion multi-token (MTP) cuantizados en formato EXL3 por el usuario HermiHg, publicado como *sidecar* para servidores de decodificacion especulativa sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo independiente: el repositorio contiene unicamente los tensores `mtp.*` (la proyeccion de caracteristicas `fc`, un bloque de atencion con `q`/`k`/`v`/`o`, un MLP SwiGLU con `gate`/`up`/`down` y 7 tensores de normalizacion), que sustituyen al cabezal MTP integrado en el modelo base.

El problema que resuelve es de eficiencia en inferencia: en decodificacion especulativa el cabezal MTP propone tokens y el modelo objetivo los verifica. Un cabezal mas pequeno y con mayor tasa de aceptacion implica mas tokens aceptados por ronda de verificacion, menos pasos de verificacion por token generado y menos VRAM dedicada al *drafter*. La decodificacion sigue siendo sin perdida: la salida aceptada es identica a la que produciria el modelo objetivo por si solo.

La aportacion tecnica concreta es una cuantizacion EXL3 de precision mixta por tensor, que concentra bits en la proyeccion `fc` (la parte sensible del cabezal) y los reduce en `q`, `k`, `v` y `gate`. El repositorio ofrece seis checkpoints entre 158,4 MiB y 304,0 MiB, con licencia Apache 2.0 y compatibilidad declarada con cualquier derivado del base Qwen3.8-27B. El repositorio tiene 0 descargas y 1 *like*, y fue creado el 15 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal MTP (multi-token prediction) de tipo transformer: proyeccion de caracteristicas `fc`, un bloque de atencion (`q`/`k`/`v`/`o`), un MLP SwiGLU (`gate`/`up`/`down`) y 7 tensores de normalizacion; cuantizado con EXL3 (exllamav3) |
| Parametros totales | no disponible (el repositorio solo publica tamanos en disco: entre 158,4 MiB y 304,0 MiB segun checkpoint) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | EXL3 con precision mixta por tensor: 3,13 bpw efectivos, 3,73 bpw efectivos y 4,43 bpw efectivos; ademas de referencias uniformes de 4,01, 5,01 y 6,01 bpw |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3, libreria exllamav3) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado de forma autonoma, sino una recuantizacion de los pesos del cabezal MTP de Qwen3.8-27B. La topologia del cabezal es la del base: una proyeccion de caracteristicas, un unico bloque de atencion con las proyecciones `q`, `k`, `v` y `o`, un unico MLP SwiGLU con `gate`, `up` y `down`, y siete tensores de normalizacion. No hay informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion de su dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion esta en el esquema de cuantizacion. Se aplica precision mixta por tensor en lugar de una cuantizacion uniforme: se asignan mas bits a la proyeccion `fc`, donde el cabezal es realmente sensible, y se reducen agresivamente en `q`, `k`, `v` y `gate`. El mecanismo de integracion aprovecha el orden alfabetico de carga de safetensors en exllamav3, de modo que los tensores de un fichero posterior sobrescriben a los anteriores; al nombrar el fichero `mtp-*.safetensors`, este se carga despues de los `model-*.safetensors` del base y sus tensores `mtp.*` sustituyen al cabezal MTP original. Como consecuencia, los pesos MTP del base quedan muertos y el autor sugiere eliminarlos del modelo base para recuperar su espacio sin cambio de comportamiento.

## Capacidades

- Generacion de texto delegada: el sidecar no genera texto por si mismo, propone tokens candidatos que el modelo objetivo Qwen3.8-27B verifica y acepta o rechaza.
- Decodificacion especulativa sin perdida: la salida aceptada es identica a la del modelo objetivo, segun declara el autor.
- Prediccion multi-token: propone varios tokens por paso (la longitud media de aceptacion medida va de 1,43 a 5,29 tokens por ronda segun la carga de trabajo).
- Perfilado por tipo de carga: el rendimiento difiere notablemente entre tareas; la aceptacion medida es muy alta en texto repetitivo y generacion de codigo con razonamiento, y mucho mas baja en prosa general.
- Compatibilidad con derivados del base: segun el autor, funciona con cualquier modelo construido sobre Qwen3.8-27B, incluidos Qwen3.2-27B, Swift, ThinkingCap, AREX-2, variantes *abliterated* y otros derivados.
- Tool calling, function calling, agentes, vision, audio o modo *thinking*: no disponible como capacidades del sidecar (dependerian del modelo objetivo, no de este repositorio).

## Casos de uso

- Servicio de inferencia de alto rendimiento con Qwen3.8-27B: desplegar el checkpoint `mtp-4.4bpw` junto al modelo objetivo para maximizar tokens aceptados por ronda de verificacion (media geometrica de 2,94 tokens aceptados), reduciendo el numero de pasos de verificacion por token generado.
- Despliegue con VRAM ajustada: usar `mtp-3.1bpw` (158,4 MiB) cuando la GPU tiene poco margen libre, ya que libera unos 145 MiB respecto al checkpoint de mayor calidad y mantiene un *geomean* de aceptacion de 0,403.
- Generacion de codigo asistida por razonamiento: el checkpoint `mtp-3.7bpw` alcanza 0,839 de aceptacion y 5,89 tokens aceptados por ronda en la carga `code_thinking`, el escenario mas favorable medido, adecuado para asistentes de codigo con cadenas de razonamiento largas.
- Salidas estructuradas y repetitivas (JSON, plantillas, listados, relleno de formularios): la carga `repetitive` registra la mejor aceptacion de todo el conjunto (hasta 0,747 y 5,29 tokens por ronda con `mtp-6bit`), lo que se traduce directamente en mayor velocidad en pipelines de generacion estructurada.
- Ajuste fino del equilibrio tamano/aceptacion en produccion: comparar `mtp-3.7bpw` (188,7 MiB) frente a `mtp-4bit` (202,8 MiB) y quedarse con el primero, que segun el autor domina en las cuatro cargas siendo 14 MiB mas pequeno.
- Razonamiento con cadenas largas de pensamiento: la carga `prose_thinking` muestra aceptaciones bajas en terminos absolutos (0,220-0,233) y longitudes medias de 1,54-1,64; aun asi, `mtp-4.4bpw` es el mejor checkpoint medido para este perfil, lo que lo hace preferible en agentes que razonan paso a paso.
- Recuperacion de espacio en modelos base: eliminar los tensores `mtp.*` originales del modelo base al emparejarlo con este sidecar, ya que quedan anulados por el mecanismo de shadowing y solo ocupan memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos medidos son metricas de aceptacion del *drafter*, con 50 ejecuciones por carga de trabajo contra el objetivo Qwen3.8-27B, sobre cuatro cargas: `repetitive`, `prose`, `prose_thinking` (razonamiento) y `code_thinking` (razonamiento).

Aceptacion del borrador (tokens aceptados / tokens propuestos):

| Checkpoint | Tamano | repetitive | prose | prose_thinking | code_thinking | geomean |
|---|---|---|---|---|---|---|
| mtp-3.1bpw | 158,4 MiB | 0,705 | 0,203 | 0,226 | 0,818 | 0,403 |
| mtp-3.7bpw | 188,7 MiB | 0,736 | 0,208 | 0,227 | 0,839 | 0,413 |
| mtp-4bit | 202,8 MiB | 0,711 | 0,206 | 0,220 | 0,821 | 0,403 |
| mtp-4.4bpw | 224,4 MiB | 0,745 | 0,212 | 0,233 | 0,829 | 0,418 |
| mtp-5bit | 253,4 MiB | 0,732 | 0,205 | 0,230 | 0,832 | 0,411 |
| mtp-6bit | 304,0 MiB | 0,747 | 0,206 | 0,231 | 0,838 | 0,415 |

Longitud media de aceptacion (tokens aceptados por ronda de verificacion):

| Checkpoint | Tamano | repetitive | prose | prose_thinking | code_thinking | geomean |
|---|---|---|---|---|---|---|
| mtp-3.1bpw | 158,4 MiB | 4,98 | 1,43 | 1,58 | 5,73 | 2,83 |
| mtp-3.7bpw | 188,7 MiB | 5,20 | 1,46 | 1,59 | 5,89 | 2,90 |
| mtp-4bit | 202,8 MiB | 5,03 | 1,45 | 1,54 | 5,76 | 2,84 |
| mtp-4.4bpw | 224,4 MiB | 5,27 | 1,49 | 1,64 | 5,82 | 2,94 |
| mtp-5bit | 253,4 MiB | 5,18 | 1,44 | 1,61 | 5,84 | 2,89 |
| mtp-6bit | 304,0 MiB | 5,29 | 1,45 | 1,62 | 5,88 | 2,92 |

Comparaciones declaradas por el autor (frontera de Pareto):

- `mtp-3.7bpw` (188,7 MiB) supera a `mtp-4bit` (202,8 MiB) en las cuatro cargas siendo 14 MiB mas pequeno (geomean 41,32 frente a 40,28, en la escala porcentual usada en el texto original).
- `mtp-4.4bpw` (224,4 MiB) supera a `mtp-5bit` (253,4 MiB) en `repetitive`, `prose` y `prose_thinking`, siendo 29 MiB mas pequeno (geomean 41,81 frente a 41,12).
- `mtp-4.4bpw` (224,4 MiB) supera a `mtp-6bit` (304,0 MiB) en geomean (41,81 frente a 41,54) siendo un 26 % mas pequeno.

## Requisitos de hardware

- VRAM adicional del sidecar: entre 0,15 GiB y 0,30 GiB (158,4-304,0 MiB) por encima de lo que consuma el modelo objetivo, segun el checkpoint elegido.
- VRAM total del sistema: no disponible. Depende del modelo base Qwen3.8-27B y de la cuantizacion con la que se sirva, dato que no aparece en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible para el conjunto, aunque el sidecar por si solo ocupa una fraccion minima de VRAM y el cuello de botella sera siempre el modelo objetivo.
- Opciones de despliegue: exllamav3, unica libreria declarada en el repositorio. Se requiere un servidor de decodificacion especulativa que cargue el sidecar junto al modelo objetivo; no se mencionan otras integraciones.
- Latencia y throughput: no disponibles en terminos de tokens por segundo. El autor solo publica la longitud media de aceptacion, que es el factor que determina el numero de pasos de verificacion por token.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada otros sidecars o cabezales MTP cuantizados comparables de terceros. La unica comparacion posible es entre los propios checkpoints del repositorio:

| Checkpoint | Tamano | bpw efectivos | Geomean aceptacion | Geomean longitud aceptada | Nota |
|---|---|---|---|---|---|
| mtp-3.1bpw | 158,4 MiB | 3,13 | 0,403 | 2,83 | El mas pequeno |
| mtp-3.7bpw | 188,7 MiB | 3,73 | 0,413 | 2,90 | Supera a `mtp-4bit` siendo menor |
| mtp-4.4bpw | 224,4 MiB | 4,43 | 0,418 | 2,94 | Mayor calidad y mejor geomean |
| mtp-4bit | 202,8 MiB | 4,01 | 0,403 | 2,84 | Referencia uniforme, dominada |
| mtp-5bit | 253,4 MiB | 5,01 | 0,411 | 2,89 | Referencia uniforme, dominada |
| mtp-6bit | 304,0 MiB | 6,01 | 0,415 | 2,92 | Referencia uniforme, dominada en geomean por 4.4bpw |

## Limitaciones y advertencias

- No es un modelo autonomo: no puede generar texto por si solo. Requiere siempre el modelo objetivo Qwen3.8-27B o un derivado suyo.
- Dependencia estricta de la libreria: el mecanismo de shadowing depende del orden alfabetico de carga de safetensors en exllamav3. Cualquier otro runtime puede ignorar el sidecar o comportarse de forma distinta.
- Rango de mejora muy desigual: la aceptacion varia de 0,203 en `prose` a 0,839 en `code_thinking`. En prosa general la ganancia de velocidad sera marginal (longitud media aceptada de 1,43-1,49 tokens), mientras que en codigo y texto repetitivo es sustancial.
- Decodificacion sin perdida solo si la verificacion es correcta: el autor afirma que la salida aceptada es identica a la del objetivo, pero esa garantia depende de la implementacion del servidor de decodificacion especulativa, no del sidecar.
- Los checkpoints uniformes de 4, 5 y 6 bits no son la opcion recomendada segun el propio autor: en todos los casos existe un checkpoint optimizado igual o menor que rinde al menos igual.
- Discrepancia de escala en la model card: las tablas de aceptacion usan valores en tanto por uno (por ejemplo, geomean 0,413) mientras que el texto de la seccion comparativa usa la misma cifra multiplicada por 100 (41,32). Conviene normalizar antes de tomar decisiones de despliegue.
- Datos de adopcion muy limitados: 0 descargas y 1 *like* en el momento de la consulta. No hay validacion independiente de las mediciones del autor.
- Sesgos, riesgo de alucinacion y limitaciones de idioma: no disponibles para el sidecar. Heredados en su caso del modelo objetivo.
- Licencia: Apache 2.0, sin restricciones declaradas para uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-27B con el que se empareje.
- Idiomas soportados: no disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HermiHg/Qwen3.8-27B-Optimized-MTP-Heads-exl3
- Modelo base citado: https://huggingface.co/Qwen/Qwen3.8-27B
- Nota sobre la busqueda web: la busqueda realizada no devolvio ningun resultado relevante sobre este modelo, su autor o la decodificacion especulativa con cabezales MTP. Los enlaces devueltos no guardan relacion con el objeto de la ficha y se han descartado. No se dispone de papers, blogs, repositorios de codigo ni demos adicionales.
