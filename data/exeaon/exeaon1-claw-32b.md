# Exeaon/Exeaon1-Claw-32B

## Resumen

Exeaon1-Claw-32B es un modelo de lenguaje especializado en codificacion, desarrollado por Exeaon como pieza central de su ecosistema de agentes autonomos (ExeaonClaw y Exeaon Canvas). Se trata de una version comprimida del modelo Qwen/Qwen2.5-Coder-32B-Instruct mediante la tecnica propietaria ℰ-PURE, que combina cuantizacion Lloyd-Max con compensacion de error por columnas y codificacion entropica rANS estatica. El resultado es un modelo de 32B parametros que ocupa 16.363 GB en disco (frente a los 61.2 GB del original en fp16), con una relacion de compresion de 3.73× y 4.30 bits por peso.

La relevancia de este modelo radica en su diseno para ejecutarse de forma nativa con el runtime `epure-runtime`, que mantiene los pesos comprimidos residentes en memoria mediante un cache mmap. Esto permite cargar el modelo en aproximadamente 2.6 segundos y ejecutar mas de 200 pasos multi-turno sin penalizacion de recarga, un requisito critico para agentes de codificacion que necesitan mantener estado entre llamadas. El modelo esta orientado exclusivamente al ingles y se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Coder-32B-Instruct) |
| Parametros totales | 32B (derivado del nombre y del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder-32B-Instruct soporta 128K, pero no se confirma para esta version comprimida) |
| Tipos de cuantizacion | Compresion ℰ-PURE: cuantizacion Lloyd-Max con compensacion de error por columna y codificacion entropica rANS (4.30 bpw medidos) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ebin` (contenedor de codificacion entropica) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen2.5-Coder-32B-Instruct, un transformer decoder-only con atencion causal estandar. La innovacion principal no esta en la arquitectura base, sino en el proceso de compresion ℰ-PURE aplicado sobre ella. Este proceso utiliza cuantizacion Sine ℰ-Grid Lloyd-Max con compensacion de error por columnas, calibrada con 128 secuencias y aplicada a los 64 bloques del transformer (64/64 bloques error-compensados). La codificacion entropica rANS estatica reduce adicionalmente el tamano de los pesos cuantizados.

No se proporcionan datos sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, tecnicas de alineamiento como RLHF o DPO). La informacion disponible solo describe el proceso de calibracion para la compresion, que no modifica los pesos semanticos sino que los re-codifica para reducir su huella en memoria. El modelo se sirve a traves de `epure-runtime`, que gestiona la descompresion en tiempo de ejecucion y mantiene los pesos en un cache mmap residente.

## Capacidades

- Generacion de texto especializada en codigo: el modelo esta disenado para tareas de programacion, incluyendo generacion, revision y depuracion de codigo en multiples lenguajes.
- Tool calling estricto: soporta el esquema nativo de function calling de OpenAI, con capacidades para ejecucion de comandos bash, edicion de archivos y manipulacion de diffs.
- Soporte para agentes autonomos: integrado con frameworks como LangGraph, CrewAI, AI-Q y Goose, y disenado para ejecutar flujos multi-paso con razonamiento encadenado.
- Ejecucion multi-turno sin recarga: gracias al cache mmap residente, puede mantener contexto entre turnos de un agente sin latencia de recarga (0 ms de overhead).
- Capacidades multilingues: limitadas al ingles, segun la informacion de la model card.
- Integracion con Exeaon Canvas: funciona como sustrato de inteligencia unificado para el entorno de escritorio nativo de Exeaon.

## Casos de uso

- Agente de codificacion autonomo (ExeaonClaw): el modelo actua como cerebro del agente, gestionando tareas complejas de desarrollo como refactorizacion, resolucion de incidencias y generacion de parches. Su capacidad de tool calling estricto permite ejecutar comandos y editar archivos de forma segura.
- Asistente de programacion en IDE: puede integrarse en editores como VS Code o JetBrains para ofrecer autocompletado, explicaciones de codigo y sugerencias de correccion, aprovechando su ventana de contexto larga (si se confirma la heredada del modelo base).
- Automatizacion de tareas de mantenimiento de software: con su soporte para ejecucion de bash y edicion de diffs, puede encargarse de actualizar dependencias, corregir vulnerabilidades o aplicar cambios de estilo en repositorios grandes.
- Pipeline de CI/CD con generacion de codigo: el modelo puede generar tests unitarios, documentacion tecnica o fragmentos de codigo de integracion, y enviarlos directamente a traves de APIs de function calling a herramientas de integracion continua.
- Desarrollo de agentes conversacionales tecnicos: su capacidad de mantener contexto multi-turno sin recarga lo hace adecuado para chatbots de soporte tecnico que necesitan recordar el historial de una sesion de depuracion.
- Investigacion en compresion de modelos: al ser un ejemplo de compresion extrema (3.73×) con calidad preservada, puede servir como caso de estudio para equipos que investigan tecnicas de cuantizacion y codificacion entropica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K o SWE-bench, a pesar de que el modelo se etiqueta con `swe-bench` y `coding-agent`. Tampoco se proporcionan comparaciones con el modelo base Qwen2.5-Coder-32B-Instruct ni con otras alternativas. Se recomienda evaluar el modelo en los benchmarks de codificacion estandar antes de su uso en produccion.

## Requisitos de hardware

- Tamano comprimido: 16.363 GB en formato `.ebin`, lo que sugiere que puede caber en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090, A5000) o en configuraciones de CPU con suficiente RAM.
- Carga inicial: aproximadamente 2.6 segundos segun la model card, gracias al cache mmap residente.
- Runtime requerido: `epure-runtime` (instalable via pip). No es compatible con frameworks estandar como vLLM, llama.cpp u Ollama sin adaptacion, ya que el formato `.ebin` es propietario.
- Opciones de despliegue: el repositorio incluye un script `agent_serve.py` que expone el modelo como servicio OpenAI-compatible en el puerto 8000, permitiendo su integracion con Exeaon Canvas y frameworks de agentes.
- Latencia y throughput: no se proporcionan datos cuantitativos. La model card menciona que la generacion esta limitada por el ancho de banda de memoria (aritmetica intensiva de ~0.5 FLOP por byte), lo que implica que en GPUs consumer la velocidad dependera de la memoria disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa. Estructuralmente, el modelo es una version comprimida del Qwen2.5-Coder-32B-Instruct, por lo que su comportamiento deberia ser similar al de este ultimo, con una huella de memoria significativamente menor. Otras alternativas de codificacion en el rango de 32B incluyen DeepSeek-Coder-33B-Instruct y CodeLlama-34B-Instruct, pero no se han encontrado datos de evaluacion comparativa en la informacion proporcionada. La principal diferencia de Exeaon1-Claw-32B es su formato de pesos propietario y su integracion con el ecosistema Exeaon, lo que limita su portabilidad a otros runtimes.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo soporta ingles, lo que restringe su uso en entornos multilingues.
- Formato de pesos propietario: el formato `.ebin` requiere `epure-runtime` y no es compatible con herramientas estandar de inferencia (vLLM, llama.cpp, etc.), lo que puede dificultar su integracion en infraestructuras existentes.
- Sin benchmarks publicados: no hay evidencia publica del rendimiento del modelo en tareas de codificacion, lo que supone un riesgo para su adopcion en produccion sin una evaluacion previa.
- Dependencia del ecosistema Exeaon: el modelo esta disenado para funcionar dentro de la arquitectura de Exeaon (Canvas, LangGraph, agent_serve.py), y su uso fuera de este contexto puede requerir adaptaciones no documentadas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar codigo incorrecto o inventar APIs inexistentes. No se han publicado medidas especificas de mitigacion.
- Contexto no confirmado: aunque el modelo base soporta 128K tokens, no se ha verificado que la version comprimida mantenga esa longitud de contexto, lo que podria afectar a tareas que requieren ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Exeaon/Exeaon1-Claw-32B
- Repositorio de `epure-runtime`: https://github.com/ExeaonLM/epure-runtime
- Organizacion Exeaon en GitHub: https://github.com/ExeaonLM
- Modelo base Qwen2.5-Coder-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
