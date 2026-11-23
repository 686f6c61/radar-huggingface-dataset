# iamonyx/file-gpu

## Resumen

`iamonyx/file-gpu` no es un modelo de IA generativa, sino un repositorio de herramientas y documentación para la gestión de una cola de trabajos de generación GPU en una única máquina local. El autor, bajo el identificador `iamonyx`, publica el script `relever-file-gpu.py`, un utilitario de solo lectura que se conecta por SSH a la máquina de trabajo (equipada con una RTX 5070 de 12 GB) para reportar el estado de la cola: trabajos pendientes, en curso, completados y fallidos, así como el uso de VRAM, el estado de la cola interna de ComfyUI y el espacio libre en disco.

El problema que resuelve es la coordinación de generación de imágenes (ComfyUI) y vídeo (LTX) en una sola GPU sin que los trabajos se solapen ni agoten la memoria. En lugar de lanzar generaciones manualmente, se depositan como fichas JSON con prioridad y un motor las ejecuta secuencialmente solo cuando hay VRAM libre suficiente (regla: menos de 6000 MiB ocupados antes de arrancar) y disco con margen (objetivo de 100 GB libres, mínimo de 80 GB).

Es relevante para desarrolladores que operan pipelines de generación locales sobre hardware de consumo y necesitan observabilidad y control de concurrencia sin depender de servicios en la nube. No contiene pesos de modelo, arquitectura de red neuronal ni datos de entrenamiento; la ficha refleja esa naturaleza de herramienta de orquestación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (herramienta de orquestación, no modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | francés (`fr`) en documentación y mensajes del script |
| Licencia | MIT (código y documentación); el personaje Onyx queda excluido y es propiedad del taller |
| Formato de pesos | no disponible (no contiene pesos; incluye script Python y documentación Markdown) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene un modelo entrenado. Su arquitectura funcional es un sistema de cola basado en fichas JSON (identificador, prioridad, marca temporal y puntero al paquete del trabajo) distribuidas en directorios de estado: pendientes, en curso, completados y fallidos. Un motor lee las fichas y arranca cada trabajo en orden de prioridad únicamente si se cumplen las condiciones de recursos: VRAM ocupada por debajo de 6000 MiB y espacio libre en disco por encima del umbral configurado.

La recolección de estado se realiza mediante `relever-file-gpu.py`, que opera por SSH en modo solo lectura y consulta la cola de ComfyUI a través de su API local `/queue`, además de `nvidia-smi` para el uso de VRAM y del sistema de ficheros para el espacio libre. En el lado Windows, la recolección se apoya en un script PowerShell compacto enviado con `-EncodedCommand`; la documentación advierte de dos limitaciones verificadas de este método: el paso por stdin y el límite de aproximadamente 8191 caracteres en la línea de comandos SSH de Windows. Los procesos largos se ejecutan como tareas programadas del sistema, no como sesiones interactivas que mueren al desconectarse.

## Capacidades

- Monitorización de la cola de trabajos GPU: listado de fichas pendientes (identificador, prioridad, antigüedad) y en curso.
- Reporte de trabajos completados y fallidos en las últimas 24 horas, conservando el registro de cada fallo.
- Lectura del uso de VRAM (utilizada y total) y del proceso que la ocupa mediante `nvidia-smi`.
- Consulta del estado de la cola interna de ComfyUI vía API local `/queue`.
- Comprobación del espacio libre en el disco del sistema.
- Almacenamiento histórico del relevamiento: un fichero por día con una sección por consulta, más un resumen impreso de pocas líneas.
- Generación de un informe matinal que resume la actividad nocturna de la máquina antes de proponer nuevos trabajos.
- Ejecución de trabajos largos mediante tareas programadas del sistema operativo, desacopladas de la sesión interactiva.
- No realiza ninguna acción sobre el motor de la cola: es estrictamente de solo lectura.

## Casos de uso

- Observabilidad de un pipeline de generación local: el script permite saber cada mañana qué trabajos de ComfyUI o LTX se ejecutaron durante la noche, cuáles fallaron y por qué, sin revisar manualmente logs dispersos.
- Control de concurrencia en GPU única: al conocer la VRAM ocupada y el proceso que la retiene, el operador o el motor pueden decidir si es seguro lanzar el siguiente trabajo según la regla de menos de 6000 MiB ocupados.
- Prevención de fallos por disco lleno: la comprobación de espacio libre (objetivo de 100 GB, mínimo de 80 GB) evita que una generación de vídeo o un lote de imágenes agote el disco del sistema a mitad de ejecución.
- Integración en un flujo de trabajo con puerta de calidad: el repositorio se describe como parte de una cadena donde los paquetes de generación se depositan con prioridad, una puerta de fidelidad evalúa los resultados y el relevamiento matinal rinde cuentas del proceso completo.
- Automatización de informes operativos: el resumen impreso y los ficheros diarios pueden alimentar paneles o alertas internas sobre la salud de la máquina de generación.
- Adaptación a otras máquinas: la configuración (host, usuario, rutas) está al principio del script con ejemplos genéricos, de modo que puede reutilizarse en otros talleres con una sola GPU y cola basada en ficheros.
- Depuración de conflictos de memoria: la identificación del proceso que retiene la VRAM facilita detectar procesos zombis o sesiones de ComfyUI que no liberaron memoria tras un fallo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La máquina de referencia del autor es una RTX 5070 con 12 GB de VRAM, ejecutando generación de imágenes (ComfyUI) y vídeo (LTX) de forma local.
- El script de relevamiento se ejecuta en un equipo cliente con Python 3 y acceso SSH a la máquina de generación; no requiere GPU propia.
- En el lado Windows se emplea PowerShell con `-EncodedCommand`, con la limitación de aproximadamente 8191 caracteres en la línea de comandos SSH.
- VRAM estimada para el relevamiento: despreciable (solo lectura de `nvidia-smi` y de la API local de ComfyUI).
- Umbral operativo documentado: la VRAM ocupada debe ser inferior a 6000 MiB antes de arrancar un trabajo.
- Umbral de disco: objetivo de 100 GB libres, con 80 GB como mínimo aceptable.
- Opciones de despliegue: ejecución directa con `python3 relever-file-gpu.py`; los trabajos de generación se lanzan como tareas programadas del sistema, no mediante frameworks de inferencia como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada herramientas comparables de orquestación de colas GPU con las mismas características; además, el repositorio no es un modelo de IA y no admite comparación en parámetros, contexto o rendimiento de inferencia.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, código ni imágenes; es una utilidad de monitorización y la documentación de una cola de trabajos.
- La licencia MIT cubre el código y la documentación, pero excluye explícitamente al personaje Onyx, que sigue siendo propiedad del taller; el uso comercial del personaje no está permitido por esta licencia.
- El script está diseñado para una topología concreta (una máquina local, SSH, ComfyUI con API `/queue`); requiere adaptar host, usuario y rutas antes de usarlo en otro entorno.
- La documentación está en francés y el repositorio declara únicamente ese idioma, lo que puede limitar su adopción por equipos no francófonos.
- El método de recolección en Windows mediante `-EncodedCommand` tiene límites verificados (paso por stdin y tope de ~8191 caracteres) que pueden romper scripts largos.
- El script es de solo lectura: no corrige ni cancela trabajos atascados; la gestión de fallos depende de otros componentes del taller.
- No hay datos publicados sobre latencia, throughput, sesgos ni alucinación porque no aplican a esta herramienta.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita evaluar su madurez en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iamonyx/file-gpu
- Documentación completa de la herramienta: `OUTIL-FILE-GPU-V1.md` (incluido en el repositorio)
- Licencia: `LICENCE.md` (incluido en el repositorio)
- Repositorio de la puerta de fidelidad mencionado en la model card: `porte-fidelite` (referencia interna del taller, sin URL pública disponible)
