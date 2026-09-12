# ekunish/parc2026-track1-kairos-organizer

## Resumen

`ekunish/parc2026-track1-kairos-organizer` no es un modelo de IA entrenado ni una submission validada. Es un repositorio de entrega reproducible (handoff) publicado el 12 de septiembre de 2026 por el usuario ekunish para un experimento de la pista Track1 del proyecto Kairos, orientado a manipulación robótica sobre el simulador LIBERO. La propia model card lo declara de forma explícita: "not a newly trained or validated submission model".

El contenido principal es `organizer-handoff-20260912/kairos-organizer-supplement.tar.gz`, un archivo de 738.242.629 bytes (~704 MiB) con SHA-256 `297c6478fe18861756249b2c0246cdb140d65aebddd2fc81f5be1fe4306648bf`. Dentro incluye 12 trayectorias de reparación seguras frente a colisiones, con variantes de apariencia de iluminación, textura y combinada; assets seleccionados del simulador oficial LIBERO; código fuente del runtime; y ficheros numéricos de auditoría y manifiestos. El repositorio completo ocupa 14,3 GB.

Su relevancia es de trazabilidad y reproducibilidad experimental, no de inferencia: los pesos crudos y las 180 trayectorias normales residen en otros dos repositorios del mismo autor y no se duplican aquí. La model card menciona que futuras subidas de checkpoints, si las hubiera, serían parámetros completos experimentales de ActionDiT junto con el estado del optimizador, y advierte que un checkpoint guardado no es evidencia de mejor rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card cita "ActionDiT" solo para futuros checkpoints experimentales, no para el contenido actual) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el repositorio; los assets del simulador LIBERO se distribuyen bajo licencia MIT recogida en `LICENSE-LIBERO` |
| Formato de pesos | no disponible; el artefacto entregado es un archivo `.tar.gz` con trayectorias, assets de simulador, código de runtime y manifiestos |
| Tamano del repositorio | 14,3 GB |
| Tamano del archivo de handoff | 738.242.629 bytes (~704 MiB) |
| SHA-256 del archivo | `297c6478fe18861756249b2c0246cdb140d65aebddd2fc81f5be1fe4306648bf` |
| Tarea | robotics (pipeline declarado en HuggingFace) |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura del modelo subyacente. La model card únicamente menciona ActionDiT al señalar que eventuales subidas futuras de checkpoints corresponderían a "experimental full ActionDiT parameters and optimizer state", sin especificar número de parámetros, profundidad, dimensionalidad ni esquema de difusión. No hay datos sobre tokens de entrenamiento, composición del dataset, ni uso de RLHF o DPO.

Respecto a los datos del artefacto: las trayectorias de entrenamiento proceden de estados oficiales de LIBERO y de expertos scriptados o de reparación validados por separado. El código de runtime se arrastró desde un entorno de importación local de LIBERO-plus, lo que la propia model card aclara que no implica que se usaran trayectorias de LIBERO-plus para el entrenamiento. El paquete incluye 12 trayectorias de reparación con seguridad frente a colisiones y variaciones de apariencia (iluminación, textura y combinada), además de ficheros de auditoría numérica y manifiestos con hashes y revisiones fijas.

## Capacidades

- El repositorio no expone ninguna capacidad de inferencia: no contiene pesos desplegables ni un endpoint utilizable.
- Aporta 12 trayectorias de reparación de manipulación seguras frente a colisiones, reproducibles, con cuatro variantes de apariencia (limpia, iluminación, textura y combinada).
- Incluye assets seleccionados del simulador oficial LIBERO y definiciones de tareas, lo que permite reconstruir escenarios de evaluación.
- Incluye código fuente del runtime necesario para ejecutar el entorno.
- Incluye ficheros de auditoría numérica y manifiestos con tamaños, hashes a nivel de fichero y revisiones fijas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No incorpora credenciales ni historial de conversaciones, según declara el autor.

## Casos de uso

- Reproduccion de experimentos de robotica: el paquete permite reconstruir las 12 trayectorias de reparación con sus variantes de apariencia sobre el simulador LIBERO, de modo que un tercero puede replicar el experimento Track1 sin acceso a la máquina original.
- Auditoria de integridad de artefactos: el SHA-256 del archivo y los manifiestos internos permiten verificar que el material descargado no ha sido alterado, algo crítico cuando el repositorio no contiene un modelo evaluable.
- Fijacion de fixtures en pipelines de evaluacion: los assets de LIBERO y las definiciones de tareas incluidas sirven como conjunto de referencia congelado para comparar métodos de manipulación entre ejecuciones.
- Estudio de reparacion segura frente a colisiones: las 12 trayectorias están etiquetadas como collision-safe, por lo que son material directo para analizar estrategias de recuperación ante contacto no deseado.
- Analisis de robustez ante cambios visuales: las variantes de iluminación, textura y combinada permiten medir la sensibilidad de un policy a condiciones de render distintas sin modificar la tarea subyacente.
- Trazabilidad de publicacion cientifica: los punteros a revisiones concretas de los repositorios hermanos permiten citar el linaje exacto de pesos y trayectorias en un artículo o informe.
- Reconstruccion de un entorno de simulacion: el código de runtime y los assets seleccionados permiten levantar una instalación funcional de LIBERO sin depender de descargas externas no versionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio no es una submission entrenada ni validada, y que un checkpoint guardado no constituye evidencia de mejor rendimiento. No hay cifras de éxito de tarea, ni métricas de LIBERO, ni comparaciones numéricas de ningún tipo.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio no contiene pesos desplegables, por lo que no aplica un cálculo de VRAM de modelo.
- Espacio en disco: 14,3 GB para el repositorio completo; 738.242.629 bytes (~704 MiB) para el archivo de handoff comprimido.
- GPU recomendadas: no disponible de forma explícita. La rama de trabajo indicada por el autor, `track1/kairos-blackwell-handoff`, sugiere un entorno con GPU NVIDIA Blackwell, pero no se especifica modelo concreto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Nota operativa del autor: en la máquina del organizador debe usarse la rama `track1/kairos-blackwell-handoff` y leerse `ASSETS.json`, `REPORT.html` y `START_CODEX.md` antes de lanzar cualquier proceso de GPU.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo y no se define frente a alternativas de la misma categoría. Los únicos elementos relacionados citados en la documentación son infraestructuras de simulación, no modelos comparables:

| Elemento | Tipo | Relacion |
|---|---|---|
| LIBERO | Simulador y definiciones de tareas | Origen de los assets oficiales y de los estados de entrenamiento; licencia MIT |
| LIBERO-plus | Entorno de importacion | Origen del codigo de runtime arrastrado; el autor aclara que no implica uso de sus trayectorias para entrenamiento |
| `ekunish/parc2026-track1-score06-candidates` | Repositorio hermano | Contiene pesos crudos y trayectorias; revision `a0b3f620c395caa38b3375a876c99c142d249e7b` |
| `ekunish/parc2026-track1-physical-rgb-20260909` | Repositorio hermano | Contiene pesos crudos y trayectorias; revision `7092baa0d3dbf06685f4250ab34e59f680fe71e4` |

## Limitaciones y advertencias

- No es un modelo: no debe presentarse ni evaluarse como una submission entrenada o validada.
- No hay pesos desplegables en este repositorio; los pesos crudos residen en los dos repositorios hermanos indicados.
- La licencia del repositorio no está declarada, lo que impide determinar condiciones de uso comercial del material propio del autor.
- Los assets y definiciones de tareas de LIBERO están bajo MIT y exigen conservar los avisos de copyright de Lifelong Robot Learning (c) 2023 al redistribuir.
- No se proporcionan parámetros, contexto, idiomas ni cuantizaciones: cualquier cifra al respecto sería especulativa.
- El autor advierte de que un checkpoint guardado no es evidencia de mejor rendimiento, por lo que las subidas futuras de ActionDiT deberían tratarse como experimentales.
- Las trayectorias de reparación son 12 y las normales 180, pero estas últimas no se incluyen aquí, lo que limita la reproducibilidad completa desde este repositorio aislado.
- La publicación fue autorizada por el propietario el 2026-09-12; el material se describe como un handoff de un experimento autorizado por el usuario, no como un lanzamiento público de un sistema.
- Riesgo de sesgo y de alucinación: no aplica en el sentido habitual, al no existir un modelo generativo desplegable; el riesgo relevante es de integridad de datos, mitigado por los manifiestos y el hash SHA-256 publicados.
- Antes de ejecutar cualquier proceso de GPU en el entorno del organizador, el autor exige leer `ASSETS.json`, `REPORT.html` y `START_CODEX.md` en la rama `track1/kairos-blackwell-handoff`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ekunish/parc2026-track1-kairos-organizer
- Repositorio hermano con pesos crudos: https://huggingface.co/ekunish/parc2026-track1-score06-candidates (revision `a0b3f620c395caa38b3375a876c99c142d249e7b`)
- Repositorio hermano con pesos crudos: https://huggingface.co/ekunish/parc2026-track1-physical-rgb-20260909 (revision `7092baa0d3dbf06685f4250ab34e59f680fe71e4`)
- LIBERO (simulador y definiciones de tareas, MIT): https://github.com/Lifelong-Robot-Learning/LIBERO
- LIBERO-plus (entorno de importacion del runtime): https://github.com/sylvestf/LIBERO-plus
- Paper o blog oficial del modelo: no disponible
- Demo o espacio interactivo: no disponible
