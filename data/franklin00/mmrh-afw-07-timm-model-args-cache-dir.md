# FrankLin00/mmrh-afw-07-timm-model-args-cache-dir

## Resumen

`FrankLin00/mmrh-afw-07-timm-model-args-cache-dir` no es un modelo de aprendizaje automatico utilizable, sino una muestra inerte ("specimen") creada para investigacion academica en seguridad. Reproduce un vector de ataque conocido como *model_args / cache_dir smuggling* en el ecosistema `timm`: un `config.json` manipulado que, al ser cargado por herramientas que confian en los metadatos del modelo, puede inducir la ejecucion de un comando en el host. El autor la etiqueta explicitamente como `not-for-production` y `security-research`.

El repositorio contiene unicamente 4 parametros declarados en safetensors y ocupa 0.0 GB, por lo que no tiene capacidad de generacion ni utilidad funcional. Su interes es forense y defensivo: documenta como un artefacto aparentemente trivial en Hugging Face puede transportar una carga en sus metadatos en lugar de en sus pesos.

La ficha se limita a describir el artefacto tal como esta publicado. No hay informacion sobre arquitectura, entrenamiento, benchmarks ni capacidades de inferencia, y asi se indica en cada seccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo entrenado; artefacto de investigacion de seguridad) |
| Parametros totales | 4 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo con `config.json` y `MANIFEST.json` de coleccion) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es una muestra de seguridad que preserva el "portador" del hallazgo: la clave `model_args` con un valor `cache_dir` dentro de `config.json`. Segun la model card, cualquier sonda activa ejecuta unicamente `whoami` en forma argv (nunca `shell=True`) y escribe la salida en la variable de entorno `HFSCAN_TIMM__02_MODEL_ARGS_KWARGS_SMUGGLING_AFW`, bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red.

La muestra utiliza la carga inerte literal `PWNED-INERT`. Cuando la primitiva vulnerable obliga a un contenedor o sufijo concreto (por ejemplo `.npy`, un checkpoint o `.jinja`), el `MANIFEST.json` de la coleccion registra esa restriccion de formato en lugar de afirmar control de bytes en crudo. El `MANIFEST.json` tambien contiene los hashes y la ruta del hallazgo original.

## Capacidades

- No genera texto, codigo, matematicas ni vision: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- Su unica funcion documentada es servir como muestra inerte para reproducir y estudiar el vector de *smuggling* de `model_args`/`cache_dir` en `timm`.
- Ejecuta exclusivamente `whoami` como sonda de demostracion, sin red ni acceso a credenciales.

## Casos de uso

- Investigacion de seguridad en cadena de suministro de modelos: permite a un equipo de seguridad reproducir en un entorno aislado como un `config.json` malicioso puede inducir ejecucion de comandos al cargar un modelo con `timm`, y validar asi sus escaneres.
- Desarrollo de reglas de deteccion: sirve como muestra positiva para entrenar o calibrar escaneres que inspeccionan metadatos (`model_args`, `cache_dir`, variables de entorno) en repos de Hugging Face.
- Pruebas de pipelines de CI/CD: se puede usar en jobs de integracion para verificar que el pipeline rechaza o aisla artefactos con metadatos sospechosos antes de desplegarlos.
- Formacion y concienciacion: util en talleres internos para mostrar que los pesos no son el unico vector de ataque en un repositorio de modelos.
- Validacion de sandboxing: permite comprobar que un entorno de carga de modelos (contenedor, usuario sin privilegios, sin red) contiene correctamente la ejecucion de la sonda `whoami`.
- Auditoria de dependencias: sirve para verificar el comportamiento de versiones concretas de `timm` frente a `model_args` con `cache_dir` y documentar la exposicion de cada version.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no ejecuta tareas de inferencia medibles.

## Requisitos de hardware

- VRAM estimada: practicamente nula; con 4 parametros declarados y 0.0 GB de repo no requiere GPU.
- GPU recomendadas: ninguna; la ejecucion de la sonda `whoami` es de CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: no aplica para inferencia; para su estudio debe ejecutarse en un contenedor aislado, sin red y con usuario sin privilegios.
- Latencia y throughput: no disponibles; no son magnitudes significativas para este artefacto.

## Comparativa con modelos similares

| Artefacto | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `FrankLin00/mmrh-afw-07-timm-model-args-cache-dir` | 4 | no disponible | Muestra inerte de investigacion de seguridad | no disponible | Hugging Face, 0 descargas |
| Modelos `timm` convencionales (por ejemplo, ResNet, ViT) | Millones a cientos de millones | no aplica (vision) | Clasificacion y backbone de vision | Apache-2.0 o similar segun variante | Amplia en Hugging Face y `timm` |
| Otras muestras AFW de la misma coleccion | no disponible | no disponible | Reproduccion de otros vectores de *smuggling* | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables, ya que la muestra no realiza tareas de inferencia.

## Limitaciones y advertencias

- No es un modelo utilizable: no genera texto, no clasifica imagenes ni ejecuta ninguna tarea de ML.
- Etiquetado explicitamente como `not-for-production`; su uso en produccion carece de sentido y puede disparar alertas de seguridad.
- Aunque la carga es inerte (`PWNED-INERT`) y la sonda se limita a `whoami`, debe tratarse como material potencialmente peligroso y ejecutarse solo en entornos aislados.
- La licencia no esta declarada, lo que impide asumir permisos de uso comercial o redistribucion.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque no aplica a un artefacto sin capacidad generativa.
- La fecha de creacion indicada (2026-11-02) es futura respecto a la informacion habitual de publicacion; conviene verificar la autenticidad y el origen del repositorio antes de descargarlo.
- El `MANIFEST.json` de la coleccion es la referencia para hashes y ruta del hallazgo; sin el, la trazabilidad de la muestra queda incompleta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FrankLin00/mmrh-afw-07-timm-model-args-cache-dir
- `MANIFEST.json` de la coleccion: referenciado en la model card, no se proporciona URL directa en la informacion disponible.
- Paper, blog o repositorio del hallazgo original: no disponible en la informacion proporcionada.
- Demo: no disponible.
