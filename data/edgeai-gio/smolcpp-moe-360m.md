# Edgeai-gio/SmolCpp-MoE-360M

## Resumen

SmolCpp-MoE-360M es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) construido por el usuario Edgeai-gio a partir de HuggingFaceTB/SmolLM2-360M. Se trata de un experimento de destilacion estructural: cuatro ajustes finos LoRA independientes, cada uno especializado en una faceta distinta de programacion con enfasis en C++, se fusionaron en un unico modelo MoE real de estilo Mixtral mediante la herramienta mergekit-moe, siguiendo el enfoque Branch-Train-MiX. El resultado es un MoE de 4 expertos con enrutado top-2 y 1.069.732.800 parametros totales, que el autor describe como equivalente a un modelo denso de aproximadamente 360M.

La relevancia del proyecto no esta en su capacidad bruta, sino en su aportacion de ingenieria: demuestra un flujo de trabajo documentado para producir un fichero GGUF con enrutado MoE autentico para modelos pequenos y personalizados. La mayoria de las conversiones GGUF de arquitecturas MoE no estandar recurren a un apaño de "equivalente denso", porque llama.cpp no dispone de conversor nativo para arquitecturas MoE arbitrarias; apoyarse en la arquitectura Mixtral a traves de mergekit-moe evita esa limitacion. El modelo se distribuye cuantizado a Q4_K_M y esta pensado para inferencia local y movil.

El autor declara explicitamente que se trata de una prueba de concepto y no de un asistente de programacion listo para produccion: no hay suite de benchmarks formal, las pruebas fueron manuales y sobre un numero reducido de prompts, y el propio autor advierte que no tiene experiencia independiente en los detalles internos de ML que el proyecto toca, ya que buena parte del pipeline se desarrollo con asistencia de IA (Claude, de Anthropic). La licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LLaMA (base SmolLM2-360M) convertido en Mixture-of-Experts estilo Mixtral |
| Parametros totales | 1.069.732.800 (dato real de safetensors) |
| Parametros activos | No publicado de forma explicita; el autor lo describe como "~360M equivalente denso", con enrutado top-2 sobre 4 expertos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M; pase de QAT con fake-quantization int4 (torchao, group_size=32) |
| Idiomas soportados | Ingles y codigo (C++, Python, lenguajes de programacion competitiva) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura parte de SmolLM2-360M, un transformer de estilo LLaMA de 360M de parametros, y se transforma en un MoE mediante Branch-Train-MiX. El proceso consta de cuatro ajustes finos LoRA independientes (r=16, alpha=32), uno por faceta, cada uno fusionado de vuelta en los pesos densos, seguidos de un pase corto de Quantization-Aware Training con fake-quantization int4 via torchao (group_size=32) para aumentar la tolerancia a la cuantizacion de 4 bits. Despues, mergekit-moe combina los cuatro modelos resultantes en un unico MoE con arquitectura de tipo Mixtral, 4 expertos y enrutado top-2 (`experts_per_token: 2`). El router se inicializa con `gate_mode: hidden`, es decir, a partir de los estados ocultos del modelo base sobre prompts representativos de cada faceta, en lugar de entrenarse desde cero; no se ha realizado ajuste adicional del router.

Los datos de entrenamiento se reparten por experto segun la faceta: `cpp_instrucciones` (razonamiento e instrucciones de C++ a codigo, con nvidia/OpenCodeReasoning-2, split train/cpp), `cpp_crudo` (codigo C++ crudo y estilo autocompletado, con bigcode/the-stack-smol, data/c++), `algoritmos` (programacion competitiva multilingue, con deepmind/code_contests) y `python_referencia` (instrucciones de Python a codigo, con iamtarun/python_code_instructions_18k_alpaca). No se documentan el numero total de tokens, la composicion exacta ni fases de RLHF o DPO. El autor advierte que el esquema de QAT empleado no coincide exactamente con la estructura de bloques K-quant de llama.cpp, por lo que debe interpretarse como un pase generico de robustez y no como un ajuste especifico para Q4_K_M.

## Capacidades

- Generacion de codigo C++ a partir de instrucciones, con salidas sintacticamente correctas en las pruebas manuales realizadas.
- Continuacion de codigo C++ crudo en estilo autocompletado (sin seguimiento de instrucciones).
- Generacion de codigo Python para instrucciones sencillas.
- Esbozos de soluciones de programacion competitiva en varios lenguajes (experto entrenado con deepmind/code_contests).
- Generacion de texto en ingles.
- Enrutado MoE real con seleccion top-2 de expertos, ejecutable en llama.cpp mediante la arquitectura Mixtral.
- Inferencia en CPU y en dispositivos moviles mediante GGUF cuantizado a Q4_K_M.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Cobertura multilingue limitada a ingles y codigo; no se documentan otros idiomas naturales.

## Casos de uso

- Autocompletado de C++ en editores ligeros: el experto `cpp_crudo` se entreno especificamente con codigo C++ de the-stack-smol para continuar fragmentos en estilo autocompletado, lo que permite integrarlo en editores o plugins con presupuesto de memoria muy reducido.
- Asistente de codigo offline en Android: el modelo se probo en Termux sobre un Redmi Note 14 4G (MediaTek Helio G99 Ultra, 8 GB de RAM) funcionando en CPU, con unas tasas de 15-18 tokens/s de generacion y 24-25 tokens/s de procesamiento de prompt, por lo que es viable como asistente local sin conexion.
- Generacion de fragmentos C++ con razonamiento previo: el experto `cpp_instrucciones` (entrenado con OpenCodeReasoning-2) produce funciones completas y funcionales, adecuadas para generar ejemplos, plantillas o utilidades pequenas que despues se revisan a mano.
- Apoyo a la resolucion de problemas de programacion competitiva: el experto `algoritmos` se entreno con code_contests y puede generar esqueletos de soluciones multilingues para practicar o comparar estrategias.
- Ports y comparativas de codigo entre Python y C++: el experto `python_referencia` permite obtener una implementacion de referencia en Python a partir de una descripcion, util como punto de partida antes de reescribir en C++.
- Laboratorio de investigacion sobre enrutado MoE: al ser un MoE real con top-2 sobre 4 expertos y con router inicializado por `gate_mode: hidden`, sirve para estudiar el comportamiento del enrutado, la especializacion por faceta y los efectos de la cuantizacion Q4_K_M.
- Prototipado educativo de pipelines Branch-Train-MiX: el proyecto documenta el flujo completo (LoRA, fusion, mergekit-moe, QAT, conversion a GGUF) y puede reutilizarse como plantilla para construir MoE personalizados de tamano pequeno.
- Tareas de generacion de codigo de bajo valor y alto volumen: dada su huella reducida y su capacidad de ejecucion en CPU, encaja en escenarios donde el coste por token importa mas que la calidad, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las pruebas fueron manuales, sobre un numero reducido de prompts y sin suite formal de evaluacion, y que no se evaluo la capacidad del router para discriminar entre facetas con prompts mixtos realistas.

Observaciones manuales reportadas por el autor (llama.cpp en dispositivo, `--temp 0.2 --repeat-penalty 1.3`):

| Experto | Resultado observado |
|---|---|
| `cpp_instrucciones` | C++ sintacticamente correcto y funcional (funcion factorial), con un bug menor en el caso limite `n=0` |
| `cpp_crudo` | Continuacion plausible y correcta de codigo C++ crudo en estilo autocompletado |
| `python_referencia` | Factorial en Python mayormente correcto con `functools.reduce`, pero sin el import `from functools import reduce` y con un bug menor en la validacion del caso limite |
| Router (discriminacion entre facetas) | No evaluado con prompts mixtos realistas |

Rendimiento en hardware de referencia (Redmi Note 14 4G, MediaTek Helio G99 Ultra, 8 GB de RAM, llama.cpp en Termux, solo CPU, `-t 2`, usando unicamente los 2 nucleos Cortex-A76):

| Metrica | Valor |
|---|---|
| Generacion | ~15-18 tokens/s |
| Procesamiento de prompt | ~24-25 tokens/s |

## Requisitos de hardware

- VRAM estimada: no publicada. Como referencia, los pesos safetensors suman 1.069.732.800 parametros y el repositorio ocupa 2,9 GB; una cuantizacion Q4_K_M de ese numero de parametros se situaria en el orden de 0,6-0,7 GB, aunque el tamano exacto del fichero GGUF no se indica en la informacion disponible.
- Almacenamiento: 2,9 GB para el repositorio completo (safetensors mas artefactos).
- Ejecucion en CPU verificada: funciona en un SoC movil de gama media (Helio G99 Ultra) con 8 GB de RAM, usando 2 hilos.
- GPU recomendadas: no disponibles; no se han publicado pruebas en GPU. Por tamano, cualquier GPU consumer con unos pocos GB libres de VRAM deberia poder alojarlo, pero esto no esta verificado por el autor.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, aunque no hay confirmacion publicada.
- Opciones de despliegue: llama.cpp con el fichero GGUF Q4_K_M (verificado); transformers con los pesos safetensors; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detalla la configuracion.
- Latencia y throughput: ~15-18 tokens/s de generacion y ~24-25 tokens/s de procesamiento de prompt en el hardware movil indicado, en CPU y con 2 hilos.

## Comparativa con modelos similares

No se han aportado datos comparativos en la informacion disponible. La unica referencia verificable es el modelo base.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolCpp-MoE-360M | 1.069.732.800 totales (MoE de 4 expertos, top-2) | no disponible | Apache-2.0 | safetensors, GGUF Q4_K_M | MoE construido con mergekit-moe sobre SmolLM2-360M; prueba de concepto |
| SmolLM2-360M | 360M densos (segun el autor) | no disponible en la informacion | Apache-2.0 | safetensors | Modelo base; arquitectura LLaMA |
| Qwen2.5-Coder (familia de 0.5B-1.5B) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion | Alternativa habitual de la misma categoria (codigo en tamano pequeno); sin datos aportados |
| TinyLlama-1.1B | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion | Alternativa habitual de la misma categoria (modelo pequeno generico); sin datos aportados |

## Limitaciones y advertencias

- Es una prueba de concepto, no un asistente de codigo listo para produccion; el propio autor lo declara asi de forma explicita.
- No existe una evaluacion formal con benchmarks; las conclusiones se basan en un numero reducido de prompts escogidos a mano.
- El router no se ha evaluado con prompts mixtos realistas, por lo que se desconoce si discrimina correctamente entre facetas.
- La calidad de generacion empeora de forma notable con temperatura de muestreo alta; a temperaturas altas puede alucinar (por ejemplo, invocando modulos inexistentes) o entrar en bucles de repeticion. El autor recomienda `--temp 0.2 --repeat-penalty 1.3`.
- Se observaron errores menores en el codigo generado incluso en las pruebas favorables (bugs en casos limite y omision de imports).
- La longitud de contexto no esta documentada en la informacion disponible.
- Cobertura de idiomas limitada a ingles y codigo; no se documentan idiomas naturales adicionales.
- El pase de QAT con torchao (int4, group_size=32) no coincide exactamente con la estructura de bloques K-quant de llama.cpp, por lo que no garantiza un comportamiento optimo especifico para Q4_K_M.
- El autor declara que gran parte del pipeline (arquitectura, codigo de entrenamiento, decisiones tecnicas) se desarrollo con asistencia de IA y que no reclama experiencia independiente en los internos de ML implicados, lo que limita la justificacion tecnica disponible de algunas decisiones.
- La model card menciona un "quirk" conocido de la CLI de llama.cpp, pero el texto aparece truncado en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se desconoce el estatus de los datasets de entrenamiento subyacentes (OpenCodeReasoning-2, the-stack-smol, code_contests, python_code_instructions_18k_alpaca), lo que conviene revisar antes de un uso comercial.
- Metricas de adopcion nulas en el momento de la consulta: 0 descargas y 0 likes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Edgeai-gio/SmolCpp-MoE-360M
- Modelo base SmolLM2-360M: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- mergekit (incluye mergekit-moe): https://github.com/arcee-ai/mergekit
- llama.cpp: https://github.com/ggml-org/llama.cpp
- torchao: https://github.com/pytorch/ao
- Dataset nvidia/OpenCodeReasoning-2: https://huggingface.co/datasets/nvidia/OpenCodeReasoning-2
- Dataset bigcode/the-stack-smol: https://huggingface.co/datasets/bigcode/the-stack-smol
- Dataset deepmind/code_contests: https://huggingface.co/datasets/deepmind/code_contests
- Dataset iamtarun/python_code_instructions_18k_alpaca: https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca
