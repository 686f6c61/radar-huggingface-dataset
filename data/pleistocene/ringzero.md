# Pleistocene/ringzero

## Resumen

ringzero es un proyecto experimental que empaqueta un sistema operativo x86-64 bare-metal con un modelo de lenguaje y un modelo de embeddings ejecutándose en ring 0 (el nivel de privilegio mas alto del procesador). No se distribuye como pesos en formato estandar, sino como imagenes ISO arrancables para QEMU/KVM que contienen el kernel, el bootloader Limine y los pesos convertidos de los modelos. El autor es Pleistocene (repositorio en GitHub de tcsenpai) y la licencia del paquete completo se denomina `ringzero-bundle`.

El nucleo del sistema es un motor de inferencia escrito integramente en ensamblador, `llm.asm` de alesha-pro (licencia MIT), sobre el que corren Qwen3.5-4B (o Qwen3.5-2B en la edicion reducida) junto con Qwen3-Embedding-0.6B. La propuesta es radical: eliminar toda la pila de software convencional (sistema operativo, runtime, framework de inferencia) y ejecutar el modelo directamente sobre el hardware virtualizado, lo que reduce la superficie de ataque y el consumo de recursos, a costa de perder portabilidad y herramientas.

Es relevante ahora porque explora un nicho poco transitado: inferencia de LLM en entornos de maxima confianza y minimo privilegio, con implicaciones para sistemas embebidos, entornos aislados y experimentacion en seguridad de modelos. La informacion publica es escasa (0 descargas, 0 likes en el momento de la consulta) y no hay benchmarks ni documentacion tecnica detallada mas alla de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema operativo x86-64 bare-metal con motor de inferencia en ensamblador (`llm.asm`); modelos Qwen3.5 subyacentes de arquitectura transformer (no detallada) |
| Parametros totales | 4B (edicion 4b) / 2B (edicion 2b) para el LLM; 0.6B para el modelo de embeddings |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 en capas MLP y Q8 en atencion (edicion 4b); Q8 (edicion 2b); embeddings en cuantizacion no especificada |
| Idiomas soportados | no disponible |
| Licencia | `ringzero-bundle` (kernel y herramientas GPL-2.0-or-later; motor `llm.asm` MIT; Limine BSD-2-Clause; pesos Qwen Apache-2.0) |
| Formato de pesos | ISO arrancable para QEMU/KVM (no safetensors ni GGUF); pesos convertidos al formato propietario del motor |

## Arquitectura y entrenamiento

El paquete no entrena modelos nuevos: reutiliza pesos preentrenados de Qwen3.5-4B, Qwen3.5-2B y Qwen3-Embedding-0.6B (todos Apache-2.0, del equipo Qwen) y los convierte al formato interno del motor `llm.asm`. La innovacion no esta en el modelo sino en el entorno de ejecucion: un kernel x86-64 que arranca via Limine, carga los pesos desde la ISO y ejecuta la inferencia en ring 0 sobre un motor escrito en ensamblador, sin capas intermedias de sistema operativo ni frameworks como PyTorch o llama.cpp.

No hay informacion publica sobre el dataset de entrenamiento, el numero de tokens, ni sobre tecnicas de alineacion (RLHF, DPO) aplicadas a los modelos base; se heredan las caracteristicas de los Qwen3.5 originales. La cuantizacion es mixta y manual: Q4 para las capas MLP y Q8 para las de atencion en la edicion de 4B, lo que sugiere un compromiso entre tamano y calidad de atencion. El motor requiere CPU con AVX2, FMA y F16C. No se documentan optimizaciones como decodificacion especulativa, atencion lineal ni kernels especializados mas alla de la implementacion en ensamblador.

## Capacidades

- Generacion de texto mediante Qwen3.5-4B o Qwen3.5-2B, con las capacidades heredadas del modelo base (razonamiento, codigo, matematicas, multilingue), aunque no se detallan en la model card.
- Generacion de embeddings mediante Qwen3-Embedding-0.6B, presumiblemente para busqueda semantica o recuperacion dentro del propio sistema.
- Ejecucion en ring 0 sobre hardware x86-64 con AVX2, FMA y F16C.
- Entorno de usuario con programas preinstalados: python3, sqlite3, jq, lua, QuickJS, ripgrep, coreutils y un editor (distribuidos en un disco de datos aparte, en la pagina de releases de GitHub).
- Arranque via Limine en QEMU/KVM con asignacion de RAM de invitado de 8 GB (edicion 4b) o 6 GB (edicion 2b).
- No se documentan tool calling, function calling, soporte de agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Experimentacion en seguridad de modelos: permite estudiar el comportamiento de un LLM ejecutandose en ring 0, sin sistema operativo intermedio, para analizar superficie de ataque, aislamiento y vectores de explotacion en entornos de maxima confianza.
- Investigacion en sistemas operativos: sirve como banco de pruebas para tecnicas de integracion de inferencia en el kernel, planificacion de recursos y gestion de memoria de pesos en bare-metal.
- Entornos aislados y air-gapped: al ser una ISO autocontenida con pesos incluidos, puede desplegarse en maquinas sin conexion a red ni dependencias externas, util para laboratorios con requisitos de confidencialidad.
- Educacion y divulgacion: demuestra de forma tangible como se ejecuta un transformer en ensamblador sobre hardware, adecuado para cursos de arquitectura de computadores e inferencia de bajo nivel.
- Automatizacion local de tareas de texto: con python3, sqlite3, jq y QuickJS preinstalados, permite construir scripts que invoquen al modelo para procesamiento de texto, extraccion de datos o generacion de informes dentro de la propia maquina virtual.
- Busqueda semantica local: el modelo de embeddings Qwen3-Embedding-0.6B permite indexar y recuperar documentos dentro del sistema sin salir del entorno virtualizado.
- Pruebas de rendimiento de inferencia en CPU: util para medir latencia y throughput de un motor en ensamblador frente a frameworks convencionales en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- RAM de invitado: 8 GB para la edicion 4b (Qwen3.5-4B Q4/Q8 + embeddings) y 6 GB para la edicion 2b (Qwen3.5-2B Q8 + embeddings).
- CPU: requiere AVX2, FMA y F16C; no se especifican modelos concretos de GPU porque la inferencia es en CPU.
- GPU: no aplica; el motor es de CPU en ensamblador.
- Cabe en hardware consumer: si, siempre que la CPU soporte AVX2, FMA y F16C y se disponga de la RAM indicada; no se detallan modelos concretos.
- Despliegue: QEMU/KVM con las lineas de comando documentadas en `docs/BETA.md` del repositorio; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Entorno de ejecucion |
|---|---|---|---|---|---|
| ringzero (4b) | 4B + 0.6B embeddings | no disponible | ISO QEMU/KVM | `ringzero-bundle` (GPL-2.0-or-later, MIT, BSD-2-Clause, Apache-2.0) | Bare-metal x86-64, motor en ensamblador |
| Qwen3.5-4B (original) | 4B | no disponible | safetensors | Apache-2.0 | Frameworks estandar (PyTorch, vLLM, llama.cpp) |
| Qwen3.5-2B (original) | 2B | no disponible | safetensors | Apache-2.0 | Frameworks estandar |
| Qwen3-Embedding-0.6B (original) | 0.6B | no disponible | safetensors | Apache-2.0 | Frameworks estandar |

La comparativa directa con otros sistemas operativos con LLM integrado no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo en formato estandar: no puede cargarse con transformers, vLLM, llama.cpp ni Ollama; solo funciona como ISO arrancable en QEMU/KVM.
- Requiere CPU con AVX2, FMA y F16C; no funcionara en hardware sin estas extensiones.
- La licencia `ringzero-bundle` es propia y conviene revisar `LICENSE.md` antes de cualquier uso comercial; los componentes tienen licencias distintas (GPL-2.0-or-later, MIT, BSD-2-Clause, Apache-2.0).
- Ejecutar un LLM en ring 0 elimina el aislamiento entre el modelo y el kernel: un fallo o una entrada maliciosa podria comprometer todo el sistema. No es adecuado para entornos de produccion multiusuario.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni longitud de contexto; se heredan las limitaciones de los Qwen3.5 base, que no se detallan.
- Proyecto en fase beta con 0 descargas y 0 likes en el momento de la consulta; sin benchmarks publicados ni validacion externa conocida.
- El disco de datos con programas preinstalados se distribuye por separado en la pagina de releases de GitHub, no dentro de la ISO.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Enlaces

- Hugging Face: https://huggingface.co/Pleistocene/ringzero
- Repositorio GitHub: https://github.com/tcsenpai/ringzero
- Sitio web del proyecto: https://tcsenpai.github.io/ringzero-site/
- Motor de inferencia `llm.asm`: https://github.com/alesha-pro/llm.asm
- Modelo base Qwen3.5-4B: no disponible en la informacion proporcionada
- Modelo base Qwen3.5-2B: no disponible en la informacion proporcionada
- Modelo base Qwen3-Embedding-0.6B: no disponible en la informacion proporcionada
