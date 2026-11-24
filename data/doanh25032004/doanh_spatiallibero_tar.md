# doanh25032004/doanh_spatiallibero_tar

## Resumen

`doanh25032004/doanh_spatiallibero_tar` no es un modelo de aprendizaje automatico en el sentido habitual, sino un repositorio de respaldo (backup) publicado en Hugging Face. Contiene una copia del arbol de directorios `/pfss/mlde/workspaces/mlde_wsp_IAS_SAMMerge/VLA/doanh/SpatialLIBERO`, procedente del espacio de trabajo `video_gen_physics`. El autor lo ha empaquetado en fragmentos tar independientes de aproximadamente 4 GB bajo el directorio `shards/` para evitar el limite de 128 commits por hora y repositorio que impone el Hub al subir arboles con muchos ficheros pequenos.

El contenido esta relacionado con SpatialLIBERO y con el campo de VLA (vision-language-action), segun se deduce de la ruta de origen, aunque la model card no describe ningun modelo, arquitectura, pesos ni proceso de entrenamiento. El repositorio ocupa 17,2 GB y no declara licencia, idiomas ni pipeline. Los ficheros que no caben en los fragmentos tar se almacenan sin empaquetar en `large/`, y `manifest.txt` indica cuantos ficheros contiene cada fragmento.

Por tanto, esta ficha documenta un artefacto de almacenamiento, no un modelo ejecutable: no hay parametros, contexto, cuantizaciones ni benchmarks que evaluar. Su relevancia es operativa (reproducibilidad de un entorno de investigacion en VLA), no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo descrito; es un backup en tar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (contenido empaquetado en fragmentos `.tar` de ~4 GB y ficheros sueltos en `large/`) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID en Hugging Face | `doanh25032004/doanh_spatiallibero_tar` |
| Autor | `doanh25032004` |
| Tags | `backup`, `region:us` |
| Tamano del repositorio | 17,2 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-11-24T12:57:15Z |
| Ultima actualizacion | 2026-11-24T13:14:37Z |
| Ruta de origen | `/pfss/mlde/workspaces/mlde_wsp_IAS_SAMMerge/VLA/doanh/SpatialLIBERO` |
| Workspace de origen | `video_gen_physics` |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene una arquitectura de red neuronal ni informacion sobre datos de entrenamiento, tokens, composicion del dataset, RLHF o DPO. Lo unico documentado es el procedimiento de empaquetado: el arbol original se divide en fragmentos tar independientes de aproximadamente 4 GB en `shards/`, los ficheros demasiado grandes para empaquetarse se guardan tal cual en `large/`, y `manifest.txt` registra el numero de ficheros de cada fragmento.

Las rutas internas de cada tar son relativas a `/pfss/mlde/workspaces/mlde_wsp_IAS_SAMMerge/VLA/doanh/SpatialLIBERO`, de modo que la restauracion exige extraer todos los fragmentos en un unico directorio que haga las veces de esa ruta. Se excluyeron del empaquetado `__pycache__`, `*.pyc`, `.git`, `.venv*`, `.cache/huggingface`, `.env` y los enlaces simbolicos, y se redactaron las credenciales encontradas en ficheros de texto antes de la subida.

## Capacidades

- No es un modelo: no genera texto, no razona, no ejecuta codigo ni procesa imagenes.
- Funcion principal: preservar y transportar un arbol de directorios de investigacion (presumiblemente codigo, configuraciones y artefactos de experimentos VLA/SpatialLIBERO) a traves de Hugging Face.
- Restauracion reproducible mediante `hf download` y extraccion secuencial de los fragmentos tar.
- Trazabilidad parcial mediante `manifest.txt`, que permite verificar cuantos ficheros deberia contener cada fragmento.
- No soporta tool calling, agentes, modo thinking, vision ni audio.
- No declara capacidades multilingues porque no contiene pesos de modelo.

## Casos de uso

- Replicacion de experimentos: un investigador descarga el repositorio y extrae los fragmentos en un directorio con la ruta esperada para reconstruir el entorno de SpatialLIBERO y reproducir resultados previos.
- Migracion entre clusters: sirve para trasladar un arbol con miles de ficheros pequenos desde un sistema de ficheros paralelo (tipo GPFS/pfss) a otra infraestructura sin tropezar con limites de commits del Hub.
- Archivo a largo plazo: conserva una instantanea fechada del workspace `video_gen_physics` con credenciales redactadas, util como referencia historica del proyecto.
- Auditoria de artefactos: `manifest.txt` y la separacion entre `shards/` y `large/` permiten comprobar la integridad y el inventario de lo archivado.
- Distribucion a colaboradores: un equipo externo puede obtener el mismo estado del codigo y las configuraciones con un unico comando de descarga y un bucle de extraccion.
- Recuperacion ante desastre: si se pierde el volumen original, este repositorio actua como copia de seguridad restaurable paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable.

## Requisitos de hardware

- No requiere GPU: no hay inferencia que ejecutar.
- Espacio en disco: al menos 17,2 GB para la descarga y un espacio adicional equivalente o superior para el directorio de extraccion (conviene reservar 35-40 GB en total).
- Memoria RAM: suficiente para extraer ficheros individuales; `tar` trabaja en streaming, por lo que no necesita cargar los fragmentos completos en memoria.
- Red: la descarga de 17,2 GB se beneficia de conexiones estables; `hf download` permite reanudar transferencias.
- Herramientas: cliente `huggingface_hub` (`hf`) y `tar` estandar de GNU/BSD.
- Latencia y throughput: dependen exclusivamente del ancho de banda y del almacenamiento; no hay cifras de inferencia que reportar.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no es un modelo. Como referencia de categoria, podria compararse con otros repositorios de backup en Hugging Face, pero la informacion proporcionada no incluye alternativas concretas.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos, tokenizador ni configuracion de inferencia descritos.
- Licencia no declarada: la ausencia de licencia impide asumir permisos de uso, redistribucion o uso comercial del contenido archivado; hay que contactar con el autor o consultar el proyecto SpatialLIBERO original.
- Contiene posibles datos sensibles: la model card indica que se redactaron credenciales en ficheros de texto, pero no garantiza que no queden secretos en binarios, historiales o configuraciones; conviene revisar antes de reutilizar.
- Restauracion fragil: las rutas internas son absolutas respecto a `/pfss/mlde/workspaces/mlde_wsp_IAS_SAMMerge/VLA/doanh/SpatialLIBERO`, por lo que extraer en otra ubicacion puede romper rutas codificadas en scripts y configuraciones.
- Sin versionado semantico ni checksums publicados: solo `manifest.txt` ayuda a verificar la integridad; no se documentan hashes por fragmento.
- Repositorio sin descargas ni likes y creado recientemente: no hay evidencia de uso comunitario ni de mantenimiento.
- El tag `backup` y la ausencia de pipeline confirman que no debe tratarse como artefacto de produccion para IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/doanh25032004/doanh_spatiallibero_tar
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo o demos.
