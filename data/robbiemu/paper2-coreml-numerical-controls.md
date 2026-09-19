# robbiemu/paper2-coreml-numerical-controls

## Resumen

`robbiemu/paper2-coreml-numerical-controls` no es un modelo de lenguaje ni un generador de voz: es una publicacion de artefactos historicos compuesta por pequenos modelos sinteticos de prueba en formato Core ML, retenidos como controles de los experimentos del llamado "Paper 2" (profundidad de grafo, profundidad autorregresiva, transporte residual, sincronizacion de estado, experimentos de intervencion y sondas de operadores TTS). El autor, `robbiemu`, los publica de forma separada para que el conjunto de evidencia privado asociado no contenga binarios de modelos.

El repositorio incluye un inventario (`manifest.json`) con el SHA-256, el tamano y la ruta original de cada fichero, un registro de interfaces Core ML y metadatos de conversion (`coreml_specs.json`), un catalogo de arrays de parametros sueltos (`tensor_catalog.json`) y un script `restore.py` que verifica integridad y reconstruye la estructura de rutas original. El tamano declarado del repositorio es de 0,0 GB.

Su relevancia es acotada y de caracter metodologico: sirve para auditar y reproducir mecanismos de ejecucion y fidelidad numerica en Core ML, no para desplegar capacidades de inferencia de proposito general. La propia model card subraya que se trata de programas de prueba numericos, que los resultados de una sonda no implican aceptacion de despliegue a nivel de modelo y que la inclusion de variantes exploratorias, rechazadas o incompletas no constituye un aval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: programas de prueba numericos y paquetes Core ML sinteticos (no es un transformer ni un modelo generativo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible; la politica de precision forma parte del experimento y no se deduce del nombre del fichero |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible; la model card declara que esta instantanea no concede ninguna licencia adicional sobre los artefactos de prueba originales |
| Formato de pesos | Paquetes Core ML (`.mlpackage`) y arrays de parametros sueltos descritos en `tensor_catalog.json` |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Autor | robbiemu |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |
| Ficheros auxiliares | `manifest.json`, `coreml_specs.json`, `tensor_catalog.json`, `restore.py` |
| Requisito de entorno | Python 3.9 o superior; Core ML en macOS con `coremltools` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay una arquitectura de red neuronal de proposito general que describir. Los artefactos son controles sinteticos disenados para aislar mecanismos de ejecucion concretos en el grafo de Core ML: profundidad de grafo, profundidad autorregresiva, transporte residual, sincronizacion de estado e intervenciones, ademas de sondas de operadores orientadas a TTS. Cada paquete expone una interfaz Core ML registrada en `coreml_specs.json`, con entradas con nombre que deben suministrarse tal como se describen; las unidades de computo y la politica de precision se seleccionan en tiempo de ejecucion con `coremltools.models.MLModel(package_path, compute_units=...)` y forman parte del diseno experimental.

No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni innovaciones de decodificacion. Se trata de una publicacion de artefactos historicos: se verifican la integridad de ficheros y las interfaces registradas, pero no se reclama ninguna validacion nueva de inferencia ni de despliegue. Algunas variantes fueron exploratorias, rechazadas o incompletas.

## Capacidades

- Verificacion de integridad: `restore.py --verify` comprueba cada fichero contra el SHA-256 registrado en `manifest.json`.
- Reconstruccion de rutas: `restore.py --destination /path/to/ANE` recrea la estructura de rutas original sin sobrescribir ficheros existentes distintos.
- Inspeccion de interfaces Core ML: carga de especificaciones con `coremltools.utils.load_spec(package_path)`.
- Ejecucion controlada en Core ML seleccionando unidades de computo (CPU, GPU, Neural Engine segun el entorno de destino).
- Catalogo de parametros: `tensor_catalog.json` describe los arrays de parametros sueltos.
- Sondas de operadores TTS y controles de profundidad de grafo, profundidad autorregresiva, transporte residual, sincronizacion de estado e intervencion.
- Trazabilidad de procedencia: rutas originales de espacio de trabajo preservadas bajo el arbol `files/`.
- Descarga programatica mediante `huggingface_hub.snapshot_download("robbiemu/paper2-coreml-numerical-controls")`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue.

## Casos de uso

- Auditoria de fidelidad numerica en Core ML: cargar cada paquete con `coremltools.models.MLModel` y comparar salidas entre CPU, GPU y Neural Engine para reproducir los controles de fidelidad numerica registrados, teniendo en cuenta que la politica de precision debe fijarse explicitamente en cada ejecucion.
- Reproducibilidad de investigacion: usar `manifest.json` y `restore.py --verify` para comprobar que los artefactos descargados coinciden bit a bit con los hashes publicados antes de citarlos en un articulo o en una revision por pares.
- Validacion de cadenas de conversion a Core ML: tomar las especificaciones de `coreml_specs.json` como referencia de interfaces de entrada y metadatos de conversion para contrastar el comportamiento de una herramienta de conversion propia.
- Estudio de profundidad de grafo y profundidad autorregresiva: emplear los controles retenidos para aislar el efecto de la profundidad del grafo de computo en el coste de ejecucion, sin que interfieran capacidades de modelo de alto nivel.
- Pruebas de transporte residual y sincronizacion de estado: utilizar estos paquetes como casos minimos al disenar experimentos sobre propagacion de estados internos en pipelines Core ML.
- Docencia y formacion tecnica: ilustrar en un curso o taller como se estructura un `.mlpackage`, que contiene un manifiesto de integridad y como se inspecciona su interfaz con `coremltools`, partiendo de artefactos pequenos y no sensibles.
- Preparacion de arneses de evaluacion: integrar los controles como casos de regresion en un banco de pruebas de despliegue Core ML, verificando que la seleccion de `compute_units` no altera los resultados esperados mas alla de lo previsto.
- Procedencia de publicaciones: conservar el arbol `files/` como registro historico de rutas de experimento para auditorias internas de un laboratorio, dado que el conjunto de evidencias detallado permanece en un dataset de acceso controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna validacion nueva de inferencia o despliegue, y que las observaciones detalladas, entradas, protocolos y recibos residen en el dataset de evidencias de acceso controlado.

## Requisitos de hardware

- Plataforma: Core ML requiere macOS; la inferencia sobre Neural Engine requiere hardware Apple Silicon con ANE.
- Tamano en disco: el repositorio se declara como 0,0 GB, coherente con paquetes de prueba pequenos, aunque los tamanos por fichero deben consultarse en `manifest.json`.
- VRAM: no disponible (no aplica en el sentido de GPU discreta; el consumo depende del paquete y de las unidades de computo elegidas).
- GPU recomendadas: no disponibles; el destino experimental son las unidades de computo de Core ML (CPU, GPU integrada y Neural Engine de Apple).
- Compatibilidad con GPU de consumo x86: no; no hay soporte de CUDA ni de ejecucion fuera del ecosistema Core ML.
- Opciones de despliegue: `coremltools` (carga de especificacion y ejecucion con `compute_units`), `huggingface_hub` para la descarga y `restore.py` para verificacion y reconstruccion. No se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Python: version 3.9 o superior.
- Latencia y throughput: no disponible; no se publican mediciones de rendimiento.
- Advertencia de seleccion: los paquetes Core ML incompletos listados en la model card no se pueden abrir como paquetes completos y no deben seleccionarse para ejecucion.

## Comparativa con modelos similares

| Criterio | paper2-coreml-numerical-controls | Alternativas comparables |
|---|---|---|
| Categoria | Publicacion de artefactos de prueba numericos en Core ML | no disponible |
| Parametros | no disponible | no disponible |
| Longitud de contexto | no aplica | no disponible |
| Rendimiento | no se publican benchmarks | no disponible |
| Licencia | sin concesion de licencia adicional declarada | no disponible |
| Disponibilidad | Repositorio publico en HuggingFace, sin descargas ni likes registrados | no disponible |

No se han identificado en la informacion proporcionada modelos o publicaciones directamente comparables. Se trata de un conjunto de controles experimentales especifico de un estudio concreto (Paper 2), no de un modelo de proposito general con alternativas equivalentes en el mismo segmento.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un generador de voz: son programas de prueba numericos cuyo fin es aislar mecanismos de ejecucion.
- Los resultados obtenidos con una sonda no establecen aceptacion de despliegue a nivel de modelo, segun la propia model card.
- No se concede licencia adicional alguna sobre los artefactos de prueba originales en esta instantanea; el uso comercial queda sin cobertura explicita.
- No se reclama validacion de inferencia ni de despliegue: solo se comprueban integridad de ficheros e interfaces registradas.
- Varias variantes fueron exploratorias, rechazadas o incompletas; su inclusion no implica aval.
- La evidencia completa (observaciones, entradas, protocolos y recibos) esta en un dataset de acceso controlado, por lo que la mayoria de resultados no es verificable publicamente.
- La politica de precision y las unidades de computo no se deducen del nombre del fichero y deben fijarse en cada experimento, lo que puede producir comparaciones invalidas si no se controla.
- Los siguientes paquetes retenidos no se pueden abrir como paquetes Core ML completos y no deben seleccionarse para ejecucion:
  - `files/experiments/all-vs-cpu-and-ne/results/extensions/phase5e_transport_residual/coreml_transition_models/transition_00.mlpackage`
  - `files/experiments/all-vs-cpu-and-ne/results/extensions/phase5e_transport_residual/coreml_transition_models/transition_02.mlpackage`
  - `files/experiments/all-vs-cpu-and-ne/results/extensions/phase5e_transport_residual/coreml_transition_models/transition_04.mlpackage`
  - `files/experiments/all-vs-cpu-and-ne/results/extensions/phase5e_transport_residual/coreml_transition_models/transition_06.mlpackage`
  - `files/experiments/all-vs-cpu-and-ne/results/extensions/phase5e_transport_residual/coreml_transition_models/transition_08.mlpackage`
  - `files/experiments/all-vs-cpu-and-ne/results/extensions/phase5e_transport_residual/coreml_transition_models/transition_09.mlpackage`
  - `files/experiments/all-vs-cpu-and-ne/results/extensions/phase5e_transport_residual/coreml_transition_models/transition_10.mlpackage`
  - `files/experiments/all-vs-cpu-and-ne/results/extensions/phase5e_transport_residual/coreml_transition_models/transition_11.mlpackage`
  - `files/experiments/all-vs-cpu-and-ne/results/extensions/phase7_tts_operator_sweep/models/cfg_euler_c64_h64.mlpackage`
  - `files/experiments/all-vs-cpu-and-ne/results/extensions/phase7_tts_operator_sweep/models/phase_accumulator_l256.mlpackage`
- No hay informacion sobre sesgos, alucinacion, cobertura idiomatica ni limites de contexto porque el artefacto no procesa lenguaje; esas categorias no son aplicables.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.
- `restore.py` no sobrescribe ficheros existentes distintos: la reconstruccion puede quedar incompleta si el destino ya contiene rutas en conflicto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robbiemu/paper2-coreml-numerical-controls
- Dataset de evidencias (acceso controlado): https://huggingface.co/datasets/robbiemu/coreml-tts-deployment-evidence
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces disponibles son los declarados en la model card y la ficha de HuggingFace.
