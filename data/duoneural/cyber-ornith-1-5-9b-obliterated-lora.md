# DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED-LoRA

## Resumen

Cyber-Ornith-1.5-9B-OBLITERATED es un ajuste fino mediante QLoRA de tipo LoRA sobre el modelo denso OBLITERATUS/Ornith-1.5-9B-OBLITERATED, desarrollado por DuoNeural (Aura, Archon y Jesse). El modelo esta orientado a un unico nicho: operaciones agénticas de ciberseguridad, ejecucion multi-turno en terminal, triaje de exploits, auditoria de vulnerabilidades e invocacion autonoma de herramientas. Se distribuye como adaptadores LoRA (repo de aproximadamente 0,5 GB en safetensors) y no como pesos completos.

La arquitectura subyacente es un transformer denso basado en la pila Qwen3.5, con patrones de atencion de estilo Gemma y extension de contexto nativa mediante YaRN RoPE. El ajuste busca eliminar las negativas catastroficas ante tareas legitimas de auditoria y diagnostico de seguridad, preservando a la vez las trazas cognitivas nativas delimitadas por `<think>...</think>` que hereda del modelo base. El entrenamiento se realizo con Unsloth sobre una NVIDIA RTX 4080 Super, aplicando NEFTune (alpha=5.0) y enmascaramiento de perdida solo en la completacion.

Su relevancia es acotada y muy especifica: cubre el hueco de modelos abiertos que combinan razonamiento con etiquetas de deliberacion, tool calling estricto en JSON/XML y ejecucion cruda de Bash en un mismo artefacto. No obstante, el modelo tiene cero descargas y cero likes en HuggingFace, fue publicado el 24 de septiembre de 2026 y no presenta resultados de evaluacion medidos, solo objetivos declarados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en pila Qwen3.5, con patrones de atencion de estilo Gemma y extension de contexto nativa YaRN RoPE |
| Parametros totales | 9B (segun la denominacion del modelo; no confirmado explicitamente en la model card) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible de forma explicita; el autor menciona extension de contexto con YaRN RoPE y evalua Terminal-Bench 2.1 con un arnes de 128K de contexto |
| Tipos de cuantizacion | no disponible para inferencia; la model card solo menciona QLoRA durante el ajuste (seccion de cuantizacion base truncada en la informacion recibida) |
| Idiomas soportados | en (ingles unicamente) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA, repositorio de aproximadamente 0,5 GB; requiere el modelo base para su uso) |

## Arquitectura y entrenamiento

El modelo parte de OBLITERATUS/Ornith-1.5-9B-OBLITERATED, una pila transformer densa de tipo Qwen3.5 con patrones de atencion de estilo Gemma y extension de contexto nativa mediante YaRN RoPE. Sobre esa base se aplico una adaptacion QLoRA con Unsloth en una unica estacion de trabajo con NVIDIA GeForce RTX 4080 Super. La informacion proporcionada no detalla el rango del adaptador, la tasa de aprendizaje ni el numero de pasos de entrenamiento, y la seccion de configuracion de cuantizacion base aparece truncada.

El corpus de entrenamiento consta de 45.000 trayectorias multi-turno cuidadosamente seleccionadas, repartidas en cuatro pilares: operaciones de ciberseguridad y triaje (35%, con oi-uae/cyber-security, hotdogs/uka-cyber-dataset y trend-cybertron/Primus-Reasoning), dominio de CLI y terminal (30%, con Lite-Coder/LiteCoder-Terminal-SFT, rajistics/openhands-synthetic-conversations y emirkaanozdemr/bash_command_data_6K), function calling y herramientas (20%, con NousResearch/hermes-function-calling-v1) y repeticion cognitiva (15%, con open-thoughts/OpenThoughts3-1.2M) como ancla de regularizacion contra el olvido catastrofico en matematicas, codigo y logica.

Entre las innovaciones tecnicas declaradas destacan: la preservacion del scratchpad interno `<think>...</think>` para planificar verificaciones de exploits y condiciones de contorno antes de emitir codigo o JSON; el enmascaramiento de perdida solo en la completacion con desenmascaramiento de `<|im_start|>assistant\n`, disenado para evitar que el modelo fabrique salidas de terminal sinteticas en lugar de devolver el control al arnes; la regularizacion de ruido en embeddings NEFTune con alpha=5,0, orientada a tolerar salidas de bash ruidosas, volcados hexadecimales y registros de comandos no estructurados; y el soporte dual de arneses (XML de Hermes y ejecucion interactiva de Bash).

## Capacidades

- Generacion de texto conversacional y multi-turno en ingles, con trazas de razonamiento explicitas dentro de `<think>...</think>`.
- Razonamiento de tipo System 2 para planificacion de tareas antes de la respuesta final.
- Tool calling y function calling estricto, con soporte de esquemas JSON y del formato XML de Hermes (`<tools>`, `<tool_call>`, `<tool_response>`).
- Ejecucion de comandos en terminal: piping complejo, sed, awk, expresiones regulares, exploracion de entorno y auditoria de permisos SUID.
- Flujos agénticos multi-paso con devolucion de control al arnes de ejecucion.
- Tareas de ciberseguridad: modelado de amenazas, analisis de zero-days, forense de CVE, generacion de parches, triaje de exploits y respuesta defensiva.
- Ingenieria de software y resolucion de issues en repositorios, con gestion de git desde linea de comandos.
- Ausencia deliberada de negativas moralizantes en tareas de pentesting, depuracion de kernel, ingenieria inversa con IDA/Ghidra y modelado de amenazas.
- Capacidades multilingues: no disponibles (solo ingles).
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Triaje automatizado de vulnerabilidades: el modelo puede recibir datos de escaneo (CVE, salidas de Nessus/OpenVAS) y producir un analisis priorizado con contexto de explotabilidad. Su entrenamiento especifico en forense de CVE y modelado de amenazas lo hace adecuado para este flujo, y las trazas `<think>` permiten auditar el razonamiento.
- Auditoria de configuracion en servidores Linux: encadenado a un arnes de ejecucion, puede explorar el sistema, detectar permisos SUID indebidos, revisar servicios expuestos y proponer remediaciones. El soporte de piping, sed y awk es directamente aplicable.
- Asistente de respuesta a incidentes: dado un volcado de registros o salida de comandos truncada y ruidosa, la regularizacion NEFTune declarada le permite parsear entradas imperfectas y proponer los siguientes pasos de contencion.
- Ingenieria inversa asistida: analisis de binarios y flujos de trabajo con IDA/Ghidra, sin las negativas que suelen bloquear a modelos alineados de forma generica.
- Automatizacion de refactorizacion en CI/CD: integrado en un agente de terminal, puede resolver issues, ejecutar pruebas y gestionar ramas con git, con el objetivo declarado de mejorar los resultados en el benchmark Aider CLI.
- Generacion de parches de seguridad: dado un informe de vulnerabilidad, producir el parche y validarlo ejecutando la suite de pruebas del repositorio, apoyandose en el soporte de tool calling para invocar el entorno.
- Agentes autonomos de pentesting en laboratorio: planificacion multi-paso de reconocimiento, explotacion y post-explotacion en entornos controlados, con devolucion de resultados al arnes en lugar de simular salidas.
- Formacion y CTF: entorno de practica para analisis de comandos y costruccion de pipelines complejos, siempre que se respeten las restricciones legales de uso.

## Benchmarks y rendimiento

La model card publica unicamente valores de referencia del modelo base (Ornith-1.5-9B) y objetivos minimos e ideales fijados por el autor para el ajuste. **No se han publicado resultados de evaluacion medidos para Cyber-Ornith-1.5-9B-OBLITERATED en la informacion disponible.** La tabla siguiente reproduce los datos declarados, distinguiendo claramente linea base de objetivos.

| Benchmark | Protocolo | Linea base (Ornith-1.5-9B) | Objetivo minimo | Objetivo ideal |
|---|---|---|---|---|
| Terminal-Bench 2.1 | Terminus-2 Harness, contexto 128K, media de 5 ejecuciones | 46,2% Pass@1 | >= 50,0% Pass@1 | >= 54,5% Pass@1 |
| SWE-bench Verified | SWE-bench Docker Harness (resolucion de parches de issues) | 70,6% resueltos | >= 69,5% resueltos (retencion) | >= 72,0% resueltos |
| CyberSecEval 3 | Purple Llama Security Suite (divisiones exploit/defensa) | ~42,0% defensa/triaje | >= 62,0% defensa/triaje | >= 68,0% defensa/triaje |
| GPQA Diamond | Razonamiento cientifico zero-shot con cadena de pensamiento | 86,4% de acierto | >= 84,5% (retencion) | >= 86,5% |
| Berkeley Function Calling (BFCL) | Verificacion AST de formato JSON de parametros | ~78,0% global | >= 86,0% global | >= 90,0% global |
| Aider CLI Benchmark | Refactorizacion de repositorios y gestion de git en terminal | ~64,0% de puntuacion | >= 68,0% | >= 72,0% |

Criterios de aceptacion declarados por el autor: mejora de al menos +4,0 puntos en Terminal-Bench 2.1, ganancia de al menos +20,0 puntos en las divisiones de triaje y respuesta defensiva de CyberSecEval 3, incremento de al menos +8,0 puntos en BFCL, degradacion maxima de 2,0 puntos en GPQA Diamond y desviacion maxima de 1,5 puntos en SWE-bench Verified respecto al modelo base.

## Requisitos de hardware

- El repositorio contiene adaptadores LoRA de aproximadamente 0,5 GB. Para la inferencia es imprescindible descargar y fusionar el modelo base OBLITERATUS/Ornith-1.5-9B-OBLITERATED.
- VRAM estimada para inferencia de un modelo denso de 9B (estimaciones calculadas a partir del tamano, no publicadas por el autor): aproximadamente 18-20 GB en FP16/BF16, 10-12 GB en cuantizacion de 8 bits y 6-8 GB en cuantizacion de 4 bits. Hay que anadir espacio para la cache KV, que crece con la longitud de contexto.
- Cabe en GPU de consumo con cuantizacion de 4 u 8 bits (por ejemplo, RTX 3090, RTX 4090, RTX 4080). En precision completa requiere GPU de 24 GB o superior.
- GPU de centro de datos recomendadas para produccion: A100 40/80 GB, H100, L40S, siempre que se priorice el throughput y el contexto largo.
- Entrenamiento declarado: una unica NVIDIA GeForce RTX 4080 Super con 32 GB de VRAM (cifra tal como aparece en la model card), con QLoRA y Unsloth.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son viables tras fusionar y convertir los pesos; el autor no documenta recetas de despliegue ni compatibilidad verificada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Consideracion operativa: dado que el modelo esta pensado para ejecutar comandos, debe desplegarse en un entorno aislado (contenedor o sandbox) con permisos minimos y sin acceso a produccion.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos externos comparables en la informacion proporcionada. La unica comparacion documentada es contra el propio modelo base, que se incluye a continuacion con los valores declarados por el autor.

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Ornith-1.5-9B-OBLITERATED-LoRA | 9B (denso) | no disponible (extension YaRN RoPE) | Solo objetivos, sin resultados medidos | apache-2.0 | Adaptadores LoRA en HuggingFace, 0 descargas, 0 likes |
| Ornith-1.5-9B-OBLITERATED (base) | 9B (denso) | no disponible | Terminal-Bench 2.1 46,2% Pass@1; SWE-bench Verified 70,6%; CyberSecEval 3 ~42,0%; GPQA Diamond 86,4%; BFCL ~78,0%; Aider CLI ~64,0% | no disponible en la informacion recibida | Modelo base en HuggingFace |

Comparacion con alternativas de otros desarrolladores (por ejemplo, modelos abiertos de tamano similar orientados a agentes o ciberseguridad): no disponible.

## Limitaciones y advertencias

- Ausencia total de validacion externa: cero descargas y cero likes en HuggingFace, sin resultados de evaluacion medidos. Los numeros de la model card son objetivos, no rendimiento demostrado.
- El modelo se declara explicitamente "abliterated"/sin censura. Esto implica riesgo real de generar contenido operativo de doble uso (explotacion, malware, evasion) y responsabilidad legal del desplegador. Requiere control de acceso, registro de auditoria y uso limitado a entornos autorizados.
- Riesgo de alucinacion: el autor disena el enmascaramiento de completacion precisamente para evitar que el modelo fabrique salidas de terminal, lo que indica que esa patologia existe en la base y no se ha verificado su eliminacion.
- Olvido catastrofico: la retencion en matematicas, codigo y logica se apoya en un 15% de datos de repeticion cognitiva, pero no hay mediciones que confirmen que no se ha degradado.
- Idioma: soporte unicamente en ingles. Cualquier uso en castellano u otros idiomas puede degradar notablemente la calidad.
- Longitud de contexto: no confirmada. Aunque se menciona YaRN RoPE y evaluaciones con 128K, no hay especificacion oficial de la ventana util del modelo final.
- Distribucion como LoRA: requiere fusionar con el modelo base, lo que anade complejidad de despliegue y hereda cualquier limitacion, sesgo o restriccion del modelo Ornith-1.5-9B-OBLITERATED.
- Licencia apache-2.0 en el artefacto LoRA, pero las licencias de los ocho datasets de entrenamiento no se detallan; conviene verificarlas antes de un uso comercial.
- Sesgos: no se han publicado analisis de sesgos ni evaluaciones de equidad. El dominio de entrenamiento (seguridad ofensiva y terminal) puede inducir una preferencia por acciones agresivas o destructivas en contextos ambiguos.
- La seccion de configuracion de cuantizacion base de la model card aparece truncada, por lo que se desconoce si se aplicaron cuantizaciones adicionales durante el ajuste.
- Idoneidad para produccion no verificada: sin pruebas de robustez, sin informes de fallos y con fecha de publicacion muy reciente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED-LoRA
- Organizacion del autor en HuggingFace: https://huggingface.co/DuoNeural
- Sitio del desarrollador: https://duoneural.com
- Modelo base: https://huggingface.co/OBLITERATUS/Ornith-1.5-9B-OBLITERATED
- Dataset oi-uae/cyber-security: https://huggingface.co/datasets/oi-uae/cyber-security
- Dataset hotdogs/uka-cyber-dataset: https://huggingface.co/datasets/hotdogs/uka-cyber-dataset
- Dataset trend-cybertron/Primus-Reasoning: https://huggingface.co/datasets/trend-cybertron/Primus-Reasoning
- Dataset Lite-Coder/LiteCoder-Terminal-SFT: https://huggingface.co/datasets/Lite-Coder/LiteCoder-Terminal-SFT
- Dataset rajistics/openhands-synthetic-conversations: https://huggingface.co/datasets/rajistics/openhands-synthetic-conversations
- Dataset emirkaanozdemr/bash_command_data_6K: https://huggingface.co/datasets/emirkaanozdemr/bash_command_data_6K
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset open-thoughts/OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden exclusivamente de la informacion de HuggingFace y de la model card. No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados al modelo.
