# mradermacher/Climb-1.2-Photon-GGUF

## Resumen

Climb-1.2-Photon es un modelo de lenguaje especializado en tareas de terminal, CLI y automatizacion de sistemas Linux, desarrollado originalmente por Climb-Ai. Esta ficha describe la version cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base se distribuye bajo licencia Apache 2.0 y esta etiquetado con la arquitectura `qwen3_5`, lo que sugiere una derivacion de la familia Qwen 3.5, aunque no se detalla la arquitectura exacta en la informacion disponible.

Con 752.393.024 parametros (aproximadamente 0,75 mil millones), se trata de un modelo compacto orientado a tareas de copiloto de terminal: generacion de comandos bash, interpretacion de salidas de shell y asistencia en flujos de trabajo de linea de comandos. Su reducido tamano lo hace adecuado para ejecucion local en CPU o GPU de gama baja, con latencias muy contenidas. Los idiomas declarados son ruso (ru) e ingles (en), lo que limita su uso directo en castellano sin un ajuste adicional.

La relevancia de esta publicacion radica en la disponibilidad de cuantizaciones estaticas (desde Q2_K hasta f16) que reducen el peso del modelo a entre 0,5 GB y 1,6 GB, facilitando su despliegue en entornos con recursos limitados. El repositorio acumula 912 descargas y fue creado el 20 de noviembre de 2026, con una actualizacion el mismo dia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (etiqueta `qwen3_5`, derivada de Qwen 3.5; detalles no disponibles) |
| Parametros totales | 752.393.024 (~0,75 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de la etiqueta `qwen3_5`, que apunta a una familia de transformers de Qwen. Con 752 millones de parametros, el modelo se situa en la gama de modelos pequenos optimizados para inferencia local. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

La version aqui descrita es una cuantizacion estatica generada por mradermacher a partir de `Climb-Ai/Climb-1.2-Photon`, con `quantize_version: 2` y `output_tensor_quantised: 1`. El autor indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (`Climb-1.2-Photon-i1-GGUF`). No se proporcionan detalles sobre el proceso de entrenamiento del modelo original.

## Capacidades

- Generacion de texto y comandos de terminal orientados a Linux y bash.
- Asistencia en tareas de CLI: construccion de comandos, interpretacion de errores y explicacion de salidas de shell.
- Etiquetado como modelo de tipo "copilot", lo que sugiere uso como asistente interactivo en linea de comandos.
- Soporte multilingue limitado a ruso e ingles.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio.
- Naturaleza conversacional (tag `conversational`).
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de terminal para desarrolladores: el modelo puede generar comandos bash a partir de descripciones en lenguaje natural, adecuado por su entrenamiento especifico en Linux y CLI y su reducido tamano para ejecucion local.
- Explicacion de errores de shell: dado un mensaje de error de bash, el modelo puede interpretar la causa y proponer una correccion, gracias a su enfoque en tareas de terminal.
- Automatizacion de scripts: generacion y revision de scripts de shell en pipelines de integracion, con la ventaja de ejecutarse en el mismo entorno sin dependencias externas.
- Copiloto embebido en editores o IDEs ligeros: al ocupar entre 0,5 y 1,6 GB segun cuantizacion, puede integrarse en estaciones de trabajo con recursos limitados.
- Formacion y documentacion tecnica: generacion de ejemplos de comandos y explicaciones de utilidades de linea de comandos para manuales internos.
- Despliegue en entornos aislados o air-gapped: al ser un modelo pequeno en GGUF, puede ejecutarse en maquinas sin GPU dedicada y sin conexion a servicios en la nube, lo que encaja en entornos de seguridad restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,5 GB (Q2_K) y 1,6 GB (f16) solo para los pesos; anadir overhead de contexto y runtime de llama.cpp (tipicamente 0,5-1 GB adicionales).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria unificada.
- Ejecutable en CPU sin GPU dedicada, dado el reducido tamano del modelo.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion de GGUF), y servidores compatibles con endpoints; el tag `endpoints_compatible` sugiere soporte en plataformas de inferencia gestionada.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en hardware moderno, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Climb-1.2-Photon (GGUF) | ~0,75 B | no disponible | ru, en | Apache 2.0 | GGUF |
| Qwen2.5-Coder-0.5B | ~0,5 B | 32 K (segun documentacion publica de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-Coder-1.5B | ~1,5 B | 32 K (segun documentacion publica de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a modelos de la misma familia y rango de tamano; no se dispone de datos de rendimiento del modelo evaluado para contrastar benchmarks. La ventaja principal de Climb-1.2-Photon frente a alternativas genericas es su especializacion en terminal y CLI, mientras que su desventaja es la falta de soporte declarado de castellano y la ausencia de datos publicos de evaluacion.

## Limitaciones y advertencias

- Idiomas limitados a ruso e ingles: no se declara soporte de castellano, por lo que su uso en espanol puede degradar la calidad.
- Riesgo de alucinacion en la generacion de comandos: un comando bash incorrecto puede ser destructivo; se recomienda supervision humana antes de ejecutar salidas en produccion.
- No se documentan sesgos conocidos, pero al no publicarse la composicion del dataset de entrenamiento no puede evaluarse su impacto.
- Longitud de contexto no disponible: limita la planificacion de casos de uso con conversaciones o ficheros largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus derivados deben verificarse por separado; esta ficha cubre solo la cuantizacion de mradermacher.
- Modelo de ~0,75 B de parametros: capacidad de razonamiento y conocimiento general limitados en comparacion con modelos de mayor tamano; adecuado para tareas acotadas de terminal, no para razonamiento complejo.
- Sin benchmarks publicados: no es posible validar su rendimiento frente a alternativas antes de desplegarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Climb-1.2-Photon-GGUF
- Modelo base: https://huggingface.co/Climb-Ai/Climb-1.2-Photon
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Climb-1.2-Photon-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Climb-1.2-Photon-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
