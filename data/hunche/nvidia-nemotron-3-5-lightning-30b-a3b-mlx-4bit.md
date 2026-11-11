# hunche/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-MLX-4bit

## Resumen

NVIDIA Nemotron 3.5 Lightning 30B-A3B es un modelo de lenguaje de tipo mixtura de expertos (MoE) dispersa desarrollado por NVIDIA, disenado especificamente para cargas de trabajo agenticas y de razonamiento con alta eficiencia computacional. Su arquitectura hibrida `nemotron_h` intercala capas Mamba-2, capas MoE dispersas y capas de atencion, lo que le permite mantener una ventana de contexto de hasta 262.144 tokens con un coste de inferencia muy contenido: de los 31.577.935.872 parametros totales, solo 3.000 millones estan activos por token.

Esta ficha corresponde a la conversion cuantizada a 4 bits en formato MLX realizada por el usuario hunche (bajo la marca TensorFold), pensada para ejecucion nativa en Apple Silicon. El checkpoint usa cuantizacion afin de 4 bits con tamano de grupo 64 y ocupa 17,78 GB en disco (16,55 GiB), lo que permite cargarlo en equipos con memoria unificada de 24-32 GB en adelante. La precision efectiva reportada por MLX-LM es de 4,503 bits por peso.

La relevancia de esta version radica en que acerca un modelo de 30B con contexto de 256K y modo de razonamiento a hardware de consumo de Apple, sin necesidad de GPUs dedicadas. En una prueba local sobre un Mac Studio con M3 Ultra y 256 GB de memoria unificada se alcanzaron 168,41 tokens/s en decodificacion con un pico de memoria de 17,95 GB, una cifra que lo situa como una opcion practica para inferencia local de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` hibrida: Mamba-2 + MoE dispersa + atencion |
| Parametros totales | 31.577.935.872 (aprox. 31,6B) |
| Parametros activos | 3B (aprox., segun nomenclatura 30B-A3B) |
| Longitud de contexto | 262.144 tokens (maximo configurado) |
| Tipos de cuantizacion | 4 bits afin, tamano de grupo 64 (precision efectiva 4,503 bits/peso) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | MLX safetensors (4 shards) |
| Tamano del checkpoint | 17,78 GB (16,55 GiB) |
| Libreria de inferencia | MLX-LM 0.31.3 / MLX 0.32.0 |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura hibrida denominada `nemotron_h`, que combina capas Mamba-2 (modelos de espacio de estados) con capas de mixtura de expertos dispersa y capas de atencion tradicionales. Esta combinacion busca reducir el coste computacional y de memoria asociado a la atencion cuadratica en contextos largos, manteniendo la capacidad de modelado de dependencias globales. La naturaleza MoE dispersa implica que, aunque el modelo tiene unos 31,6B parametros totales, solo activa aproximadamente 3B por token, lo que reduce drasticamente el coste de inferencia frente a un modelo denso del mismo tamano.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otros metodos de alineacion posteriores al preentrenamiento. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o mecanismos de atencion lineal mas alla de lo implicito en la arquitectura Mamba-2. La model card de esta conversion unicamente confirma la preservacion del tokenizador, la plantilla de chat y la configuracion de generacion del modelo original, e indica que el modo de razonamiento se activa por defecto mediante la plantilla de chat.

## Capacidades

- Generacion de texto conversacional y de proposito general en seis idiomas: ingles, espanol, frances, aleman, italiano y japones.
- Modo de razonamiento (thinking mode) activado por defecto a traves de la plantilla de chat; puede desactivarse con `enable_thinking: false`.
- Razonamiento multi-paso y cargas de trabajo agenticas, segun la orientacion declarada del modelo base hacia escenarios agenticos.
- Procesamiento de contextos largos de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Generacion de codigo y tareas tecnicas (mencionadas como caso de uso en los ejemplos de la model card, p. ej. programas en Swift).
- Integracion con endpoints compatibles con la API de OpenAI a traves de oMLX.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento agentico local: el modelo puede ejecutar bucles de razonamiento multi-paso con modo thinking activado por defecto, lo que lo hace adecuado para prototipos de agentes que corren enteramente en un Mac sin depender de la nube.
- Analisis de documentos largos: con 262.144 tokens de contexto configurado, puede procesar contratos, informes o bases de codigo extensas en una sola pasada, siempre que la memoria unificada del equipo permita el prefill correspondiente.
- Asistente de programacion en estacion de trabajo Apple: integrado via MLX-LM u oMLX, permite generar y explicar codigo en local con latencias de decodificacion superiores a 160 tokens/s en hardware M3 Ultra.
- Atencion al cliente multilingue: al cubrir espanol, ingles, frances, aleman, italiano y japones, puede gestionar conversaciones multi-turno con usuarios de distintos mercados desde un unico despliegue local.
- Prototipado y evaluacion de modelos MoE: util para investigadores que quieran estudiar el comportamiento de una arquitectura hibrida Mamba-2 + MoE + atencion en hardware de consumo, sin necesidad de GPUs de datacenter.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local sobre Apple Silicon, los datos no salen del equipo, lo que encaja en escenarios con restricciones de confidencialidad (legal, sanidad, finanzas).
- Servicio interno compatible con OpenAI: mediante el endpoint de oMLX (`/v1/chat/completions`) se puede exponer el modelo a herramientas existentes que ya hablan el protocolo de OpenAI, facilitando la migracion desde APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente aporta mediciones de rendimiento de inferencia local:

| Medicion | Resultado |
|---|---|
| Hardware | Mac Studio, Apple M3 Ultra, 32 nucleos CPU, 256 GB memoria unificada |
| Runtime | MLX-LM 0.31.3 / MLX 0.32.0 |
| Decodificacion (mediana) | 168,41 tokens/s |
| Pico de memoria reportado | 17,95 GB |
| Metodologia | 3 ejecuciones greedy de 256 tokens, warm-up de 32 tokens |
| Prompt | 36 tokens tras aplicar la plantilla de chat |

El propio autor advierte que estas cifras son una referencia practica local y no un benchmark controlado entre plataformas; la longitud del prompt, el crecimiento del contexto, los parametros del sampler, la presion de memoria, el estado termico y las versiones de MLX/oMLX pueden alterar materialmente el rendimiento.

## Requisitos de hardware

- Memoria unificada estimada: el checkpoint pesa 17,78 GB y el pico medido en generacion fue de 17,95 GB; se recomienda un minimo de 24 GB de memoria unificada, y 32 GB o mas para trabajar con contextos largos.
- Plataforma: exclusivamente Apple Silicon (MLX); no es ejecutable en GPUs NVIDIA o AMD sin reconvertir los pesos a otro formato.
- Hardware de referencia validado: Mac Studio con M3 Ultra y 256 GB de memoria unificada.
- Cabe en equipos de consumo Apple: si, en chips M-series con memoria unificada suficiente (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max con 24-32 GB o mas).
- Opciones de despliegue: MLX-LM (`mlx_lm.generate`, API Python) y oMLX con endpoint compatible con OpenAI. vLLM, llama.cpp, Ollama y TGI no aplican a este formato MLX.
- Throughput medido: 168,41 tokens/s en decodificacion sobre M3 Ultra; no se dispone de datos de latencia de prefill ni de throughput en otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Nemotron 3.5 Lightning 30B-A3B (esta version) | 31,6B | ~3B | 262.144 | MLX 4-bit | OpenMDW 1.1 | Hibrido Mamba-2 + MoE + atencion, solo Apple Silicon |
| Nemotron 3.5 Lightning 30B-A3B BF16 (original) | 31,6B | ~3B | 262.144 | safetensors BF16 | OpenMDW 1.1 | Requiere hardware de datacenter o memoria unificada muy alta |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa de rendimiento con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo BF16 original, especialmente en tareas de razonamiento complejo o generacion de codigo; no se han publicado evaluaciones comparativas de calidad en la informacion disponible.
- El contexto maximo configurado es de 262.144 tokens, pero el autor advierte explicitamente que es una capacidad del modelo, no una garantia de que cualquier equipo pueda hacer prefill de esa longitud dentro de su memoria unificada.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se dispone de datos especificos de tasas de alucinacion para este modelo.
- Sesgos conocidos: no disponibles en la informacion proporcionada; deben asumirse los sesgos tipicos de los datos de preentrenamiento a gran escala.
- Licencia OpenMDW 1.1: es necesario revisar sus terminos antes de un uso comercial, ya que no es una licencia permisiva estandar tipo Apache 2.0 o MIT.
- Compatibilidad limitada: al estar en formato MLX, no es portable directamente a ecosistemas CUDA, ROCm ni a runtimes como vLLM o llama.cpp.
- El repositorio no registra descargas ni likes y fue creado en noviembre de 2026; se trata de una conversion de terceros, no de un artefacto oficial de NVIDIA, por lo que conviene validar su fidelidad frente al modelo base.
- El modo de razonamiento esta activado por defecto, lo que incrementa el consumo de tokens generados si no se desactiva explicitamente.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/hunche/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-MLX-4bit
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Pagina de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Repositorio MLX-LM: https://github.com/ml-explore/mlx-lm
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Sitio de TensorFold (autor de la conversion): https://tensorfold.dev
