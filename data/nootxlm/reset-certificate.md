# nootxlm/reset-certificate

## Resumen

`nootxlm/reset-certificate` no es un modelo de lenguaje, sino un paquete de software de verificacion publicado en Hugging Face bajo el identificador `nootxlm/reset-certificate`. Se trata de un instrumento de auditoria, denominado Reset Certificate, que responde a una unica pregunta tecnica: si un episodio de simulacion o de entrenamiento por refuerzo constituye un ensayo realmente limpio, es decir, si el estado previo ha sido restaurado por completo antes de comenzar. El autor lo presenta como la herramienta exigida por el llamado Clean-Rig Standard, documentado en `systemaudit/microduck-reset-epic-2026-11-04.md`.

El paquete esta escrito en Python y se declara agnostico respecto al harness: descubre el estado recorriendo los propietarios del propio entorno de ejecucion en lugar de fiarse de una lista manual de nombres de campo. Juzga conjuntamente el reset del harness y la colocacion de inicio de episodio, y clasifica el resultado en categorias como BIT-IDENTICAL, STATE-CLEAN, STATE-ONLY, FAIL o REFUSED-AT-ANCHOR. Incluye adaptador para Microduck, un stub con estado, un stub con jitter no determinista, pruebas propias y arboles de prueba con escrituras plantadas.

La relevancia actual del paquete es metodologica: aborda un problema clasico en evaluacion de agentes y simuladores, la contaminacion de estado entre episodios, con un enfoque verificable y reproducible. No obstante, la informacion disponible es muy limitada: el repositorio no declara licencia en los metadatos de Hugging Face, no tiene descargas ni likes, y la model card esta truncada, por lo que muchos datos tecnicos no pueden confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un verificador en Python) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (documentacion en ingles) |
| Licencia | MIT segun la model card para el paquete; no declarada en los metadatos de Hugging Face |
| Formato de pesos | no disponible (codigo fuente Python: `cert.py`, `mdk.py`, `stub.py`, `jstub.py`, `tests.py`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado ni de una red neuronal, por lo que no hay arquitectura transformer, MoE ni SSM, ni datos de entrenamiento, RLHF o DPO. El paquete es un verificador de software compuesto por un nucleo agnostico (`cert.py`) que implementa captura de instantaneas, anclaje, diferenciacion, clasificacion de eco, clases de veredicto y un juez de secuencias; un adaptador para Microduck con CLI (`mdk.py`); dos stubs de politica con estado (`stub.py` y `jstub.py`, este ultimo con no determinismo inyectado); y pruebas propias ejecutables con `python3 tests.py`.

La innovacion tecnica reside en el descubrimiento dinamico del estado: el instrumento recorre atributos de array y escalares, tanto propios del objeto como de su clase, y desciende dos niveles en subobjetos de tipo struct; las listas de structs y estructuras mas profundas se imprimen como handles opacos en lugar de omitirse. Las instantaneas llevan sello de procedencia (hash del modelo, harness, numero de paso, tiempo de simulacion) y se rechazan si el rig ya ha avanzado. El juez de secuencias reevalua el reset en cada frontera de una secuencia de N episodios, de modo que una clasificacion INERT obtenida en una frontera caduca en la siguiente. El paquete incluye ademas un modo de flota (`cert.py fleet --devices 12`) que juzga cada dispositivo contra su propia referencia fresca.

## Capacidades

- Verificacion de reset de episodios en simuladores y entornos de RL, con modos `naive`, `full`, `eponly`, `nonestate` y `noclock`.
- Descubrimiento automatico del estado sin depender de listas manuales de campos.
- Clasificacion del resultado en BIT-IDENTICAL, STATE-CLEAN (tolerancia de 1e-6 sobre el estado final), STATE-ONLY, FAIL y REFUSED-AT-ANCHOR.
- Distincion entre fugas (leaks) y ecos (echo), con restauracion del write-set real para limpiar ecos.
- Marcado de campos diferenciales no leidos por el episodio como INERT, con evidencia operativa.
- Juicio de secuencias multi-episodio con `--episodes N`, incluyendo estado acumulativo con efecto diferido.
- Deteccion de escrituras plantadas mediante `--plant <dir>` y de fusibles de horizonte en `plant_fuse/`.
- Modo de flota para juzgar multiples dispositivos en una sola ejecucion, con resumen de veredictos y tiempo de pared.
- Ejecucion sobre stubs de prueba con variantes `clean` y `leaky`, y sobre stub con jitter (`--jitter J`, con J=0 como control).
- No dispone de generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Auditoria de entornos de RL: ejecutar `python3 mdk.py run --tree <checkout> --reset full --seed 7 --declare-commands` sobre un checkout de `microduck_rl` para certificar que cada episodio parte de un estado limpio antes de comparar curvas de aprendizaje.
- Validacion de simuladores fisicos: usar el verificador para comprobar que los datos del simulador, el modelo del simulador, la memoria de la politica y los flujos RNG se restauran o se demuestran intactos entre ensayos.
- Integracion en CI de pipelines de evaluacion: incorporar `cert.py` como paso de calidad que falla el build cuando un reset produce veredicto FAIL con fugas nombradas.
- Diagnostico de fugas sutiles: emplear el juez de secuencias con `--episodes N` para detectar cargas lentas o contadores con fusible largo cuyo efecto solo aparece tras varios resets.
- Pruebas de regresion de harness propios: adaptar el instrumento siguiendo `ADAPTER.md`, con la interfaz Rig de doce miembros y el cableado de anclaje, para verificar harness distintos de Microduck.
- Verificacion de flotas de dispositivos simulados: lanzar `python3 cert.py fleet --devices 12` para obtener un veredicto independiente por dispositivo con resumen agregado y tiempos.
- Formacion de equipos: usar `stub.py` y `jstub.py` como casos de prueba didacticos que muestran la diferencia entre un estado limpio, uno con fugas y uno con no determinismo genuino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: es codigo Python ejecutable con `python3`.
- Dependencias declaradas en `requirements.txt`, transcritas desde `ADAPTER.md`; el contenido concreto no esta disponible en la informacion proporcionada.
- VRAM estimada: no aplica.
- GPU recomendadas: no aplica.
- Despliegue: ejecucion directa como script de linea de comandos (`python3 mdk.py`, `python3 cert.py`, `python3 tests.py`); no se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modo de flota reporta el tiempo de pared de la ejecucion completa, pero no se han publicado cifras.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada herramientas comparables de verificacion de reset de episodios con las mismas caracteristicas.

## Limitaciones y advertencias

- El paquete no es un modelo de lenguaje: no genera texto, no razona, no programa y no procesa vision ni audio.
- La model card esta truncada en la informacion disponible; pueden existir secciones adicionales con datos relevantes no recogidos aqui.
- El repositorio no declara licencia en los metadatos de Hugging Face; la model card menciona MIT para el paquete, pero conviene verificar el archivo `LICENSE` antes de uso comercial.
- No tiene descargas ni likes, y fue creado y actualizado en noviembre de 2026, por lo que no hay evidencia de uso o validacion por terceros.
- El descubrimiento de estado tiene exclusiones declaradas: los metodos no se consideran estado, las listas de structs y estructuras de mas de dos niveles se imprimen como handles opacos y no se inspeccionan.
- La atribucion de fugas es imposible cuando la traza diverge: en ese caso todos los campos diferenciales quedan como fugas, lo que puede generar falsos positivos.
- El modo `--no-trace` solo permite alcanzar STATE-ONLY, un veredicto mas debil que el propio instrumento advierte.
- Los arboles `plant/` y `plant_fuse/` son copias de trabajo para pruebas y nunca deben enviarse como arboles de distribucion.
- No se dispone de informacion sobre sesgos, alucinacion o limitaciones de idioma, al no ser un modelo generativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nootxlm/reset-certificate
- Perfil del autor: https://huggingface.co/nootxlm/nootxlm
- Documento de referencia del estandar: `systemaudit/microduck-reset-epic-2026-11-04.md` (ruta local citada en la model card, no enlazada)
- Registro de construccion y pruebas: `~/workspace/systemaudit/reset-certificate-build-2026-11-04.md` (ruta local citada en la model card, no enlazada)
