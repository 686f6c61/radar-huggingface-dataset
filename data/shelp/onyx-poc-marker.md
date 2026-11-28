# Shelp/onyx-poc-marker

## Resumen

`Shelp/onyx-poc-marker` no es un modelo de inteligencia artificial. Es un artefacto publicado como prueba de concepto (PoC) de una vulnerabilidad de carga de modelos en el servidor de modelos de Onyx (`onyx-dot-app/onyx`), una plataforma open source de asistentes empresariales con integración de LLM. El repositorio simula la estructura de un modelo de `sentence-transformers` para explotar el orden de resolución de ficheros que sigue esa librería al cargar un modelo remoto.

El artefacto fue creado por el responsable de seguridad de Onyx el 28 de noviembre de 2026 en el marco de una prueba de seguridad autorizada. Su único componente ejecutable, `x/evil.py`, escribe un fichero marcador en `/tmp` y realiza una única petición HTTP GET a un *request catcher* controlado por el tester, sin leer secretos ni modificar nada más del sistema.

Su relevancia es defensiva: documenta un vector de ejecución de código remoto (RCE) en pipelines que cargan modelos de Hugging Face de forma automática, y sirve como referencia para auditores y desarrolladores que despliegan `sentence-transformers` o servidores de modelos en producción. No debe emplearse contra sistemas sin autorización expresa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; artefacto PoC con ficheros JSON y un script Python) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio contiene `modules.json`, `x/modules.json` y `x/evil.py` |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto explota el mecanismo de carga de `sentence-transformers`, que lee primero un fichero `modules.json` para resolver la lista de módulos que debe instanciar. El repositorio incluye un `modules.json` en la raíz y un segundo par de ficheros (`x/modules.json` y `x/evil.py`) que se sirven en la segunda petición de la PoC, de modo que la resolución de rutas relativas acaba apuntando a código Python ejecutable.

El payload es deliberadamente inocuo: `x/evil.py` crea un fichero marcador en `/tmp` y envía un GET al *request catcher* del tester para demostrar la ejecución. No hay exfiltración de credenciales, ni persistencia, ni modificaciones adicionales en el sistema. La PoC se ejecutó contra Onyx el 2026-11-28 con autorización de la propia organización.

## Capacidades

- No genera texto, no razona, no produce código ni resuelve matemáticas: no es un modelo.
- Demuestra ejecución de código arbitrario en el proceso que carga el modelo cuando este se resuelve mediante `sentence-transformers`.
- Evidencia el riesgo de *supply chain* al consumir repositorios de Hugging Face sin verificación de integridad ni revisión de ficheros.
- Sirve como caso de prueba reproducible para validar controles de seguridad en servidores de modelos (sandboxing, allowlists, firma de artefactos).
- No soporta *tool calling*, agentes, multimodalidad ni capacidades multilingües.

## Casos de uso

- Auditoría de seguridad de plataformas RAG: reproducir la PoC en un entorno aislado para verificar si el cargador de modelos de la plataforma ejecuta código de repositorios no confiables.
- Validación de sandboxing en servidores de inferencia: comprobar que un contenedor con `sentence-transformers` no permite escrituras fuera de su *namespace* ni conexiones salientes no autorizadas.
- Formación de equipos de seguridad: usar el artefacto como ejemplo didáctico de ataque de cadena de suministro en el ecosistema Hugging Face.
- Diseño de políticas de allowlist: definir qué repositorios y qué ficheros (por ejemplo, solo `*.safetensors` y `config.json`) puede descargar un orquestador de modelos.
- Pruebas de detección en SIEM/EDR: generar telemetría controlada (creación de fichero en `/tmp`, GET HTTP saliente) para validar reglas de detección.
- Verificación de controles de *egress*: confirmar que el *request catcher* recibe la petición solo cuando la red del servidor de modelos está mal segmentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo y no tiene métricas de calidad, latencia o throughput asociadas.

## Requisitos de hardware

- No requiere GPU ni VRAM: no hay pesos ni inferencia neuronal.
- El único coste es el de ejecutar Python con `sentence-transformers` instalado para reproducir la carga del artefacto.
- Cualquier máquina con Python 3.x y conectividad a Hugging Face basta para la reproducción, siempre en un entorno aislado (contenedor efímero, VM desechable, sin credenciales montadas).
- Opciones de aislamiento recomendadas: contenedores sin red saliente, *seccomp*/AppArmor restrictivos, usuario sin privilegios y montaje de `/tmp` en `tmpfs` efímero.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Artefacto | Tipo | Propósito | Ejecuta código | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shelp/onyx-poc-marker | PoC de seguridad | Demostrar carga insegura en Onyx | Sí (`x/evil.py`) | no disponible | Hugging Face |
| Repositorios `sentence-transformers` legítimos (p. ej. `all-MiniLM-L6-v2`) | Modelo de embeddings | Generar vectores de frases | No | Apache-2.0 (habitual) | Hugging Face |
| Repositorios de modelos con `trust_remote_code=True` | Modelo con código custom | Arquitecturas no estándar | Sí, si se habilita | Variable | Hugging Face |

La comparación relevante no es de rendimiento, sino de superficie de ataque: cualquier repositorio que incluya módulos Python ejecutables plantea un riesgo equivalente si el cargador no está aislado.

## Limitaciones y advertencias

- No es un modelo utilizable: no produce embeddings, texto ni predicciones.
- Uso exclusivamente autorizado: emplearlo contra sistemas de terceros puede constituir acceso no autorizado y tener consecuencias legales.
- La licencia no está declarada en la información disponible; no debe asumirse permiso de uso comercial.
- El payload envía una petición HTTP a un *request catcher* externo; en entornos con *egress* restringido la PoC puede fallar parcialmente sin invalidar la demostración de ejecución local.
- No debe cargarse en entornos con credenciales montadas, acceso a bases de datos o secretos en variables de entorno.
- La fecha de creación (2026-11-28) y la ausencia de descargas o *likes* indican que es un artefacto reciente y de alcance limitado, no un componente mantenido.
- No dispone de *pipeline* declarado ni de idiomas soportados; cualquier metadato de modelo que se le atribuya es ficticio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Shelp/onyx-poc-marker
- Proyecto Onyx (plataforma afectada): https://github.com/onyx-dot-app/onyx
- Librería `sentence-transformers`: https://github.com/UKPLab/sentence-transformers
- Documentación de Hugging Face sobre `trust_remote_code`: https://huggingface.co/docs/hub/security
- No se han encontrado en la búsqueda web papers, blogs ni demos adicionales sobre este artefacto.
