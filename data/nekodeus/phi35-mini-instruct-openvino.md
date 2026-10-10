# Nekodeus/phi35-mini-instruct-openvino

## Resumen

Nekodeus/phi35-mini-instruct-openvino es una conversion a formato OpenVINO IR del modelo microsoft/Phi-3.5-mini-instruct, publicada por el usuario Nekodeus. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales en precision completa se han convertido con `optimum-cli` y cuantizado a INT8 con NNCF en modo weight-only, dejando las activaciones en FP16/FP32 segun el trazado. El resultado son ficheros OpenVINO IR listos para ejecutarse con OpenVINO Runtime u OpenVINO GenAI, principalmente sobre CPU.

El modelo base es un transformer decoder-only denso de 3.800 millones de parametros (Phi3ForCausalLM) con 128.000 tokens de ventana de contexto gracias al escalado LongRoPE, licencia MIT y tarea `text-generation`. La conversion conserva la arquitectura y la tokenizacion; lo unico que cambia es el formato de pesos y su precision, con el objetivo de reducir el consumo de memoria y acelerar la inferencia en hardware Intel sin necesidad de GPU dedicada. La model card indica que la conversion se hizo en un entorno Kaggle solo-CPU, sin acceso a red ni tokens de autenticacion.

Su relevancia es practica: permite servir un modelo de 3.8B en equipos sin GPU, con un footprint de pesos de aproximadamente 3,8 GB, lo que encaja en portatiles modernos, mini-PC y servidores de borde con CPU Intel o aceleradores integrados. Ahora bien, el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, y no incluye ninguna evaluacion de la perdida de calidad introducida por la cuantizacion INT8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi3ForCausalLM), exportado a OpenVINO IR |
| Parametros totales | 3.800 millones (3,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (LongRoPE) |
| Tipos de cuantizacion | INT8 weight-only (NNCF); activaciones FP16/FP32 segun trazado |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo base esta orientado principalmente a ingles) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (.xml + .bin); tamano del repo 3,8 GB |
| Tarea | text-generation |
| Libreria | openvino (optimum-intel) |
| Herramientas de conversion | optimum-intel 2.2.0, openvino 2026.4.1, transformers 5.16.1 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no entrena ni ajusta nada: es un artefacto de exportacion. La model card documenta que se partio de `microsoft/Phi-3.5-mini-instruct`, un `Phi3ForCausalLM` de 3,8B de parametros, y se aplico cuantizacion de pesos a INT8 mediante NNCF (weight-only), manteniendo las activaciones en FP16/FP32 tal como se trazaron durante la conversion. El comando de reproduccion es `optimum-cli export openvino --model microsoft/Phi-3.5-mini-instruct --task text-generation --weight-format int8`. La ventana de contexto de 128k tokens se conserva mediante el escalado LongRoPE del modelo original.

Sobre el entrenamiento del modelo base, la informacion proporcionada no incluye ningun detalle de composicion del dataset, numero de tokens, fases de SFT, DPO o RLHF. Cualquier dato de ese tipo debe consultarse en la model card de microsoft/Phi-3.5-mini-instruct, que no forma parte del material facilitado. En consecuencia, en esta ficha se marca explicitamente como no disponible.

Elemento diferencial de este repositorio: no introduce innovaciones arquitectonicas, sino que traduce un modelo ya existente a un grafo OpenVINO optimizado para CPU, lo que habilita despliegue sin CUDA y con aceleracion via oneDNN, iGPU Intel o NPU compatible.

## Capacidades

- Generacion de texto conversacional en formato de chat con los tokens especiales del modelo base (`<|user|>`, `<|end|>`, `<|assistant|>`), como se muestra en el ejemplo de uso de la model card.
- Instrucciones y tareas generales de razonamiento y conocimiento propias del modelo Phi-3.5-mini-instruct.
- Generacion de codigo y matematicas: capacidades heredadas del modelo base; la model card no aporta evaluacion especifica de este export.
- Ventana de contexto larga: hasta 128.000 tokens segun la ficha, aunque el coste de memoria de la cache KV a esa longitud no se documenta.
- Ejecucion en CPU mediante OpenVINO Runtime (Python via `optimum-intel`) o C++ via `ov::genai::LLMPipeline`.
- Capacidades no confirmadas en la informacion disponible: tool calling / function calling, uso como agente multi-paso, modo thinking explicito, vision o audio. La model card no las menciona; deben verificarse contra el modelo base antes de asumirlas.
- Multilingue: no declarado en la ficha. No asumir soporte multilingue sin validacion propia.

## Casos de uso

- Despliegue en CPU sin GPU: el formato OpenVINO IR con pesos INT8 (~3,8 GB) permite ejecutar un modelo de 3.8B en portatiles, mini-PC o servidores de borde con CPU Intel moderna, sin necesidad de tarjeta grafica dedicada. Es el escenario para el que se publico este artefacto.
- Prototipado rapido de asistentes conversacionales: el ejemplo de la model card permite tener un chat funcional en pocas lineas de Python con `OVModelForCausalLM`, util para validar prompts y flujos antes de invertir en infraestructura GPU.
- Inferencia en el borde industrial o retail: al integrarse via OpenVINO GenAI en C++, se puede embeber en aplicaciones nativas que corren sobre CPU Intel en entornos sin acelerador, como terminales de punto de venta o paneles de control.
- Resumen y extraccion de informacion sobre documentos largos: con una ventana declarada de 128k tokens, admite entradas extensas, siempre que se disponga de memoria suficiente para la cache KV y se valide la degradacion con contexto largo.
- Generacion de codigo asistida en entornos de desarrollo restringidos: al no requerir CUDA, puede integrarse en estaciones de trabajo corporativas con politicas que prohiben GPU dedicada o acceso a APIs externas.
- Procesamiento por lotes offline: en pipelines donde el throughput no es critico y prima el coste por token, la ejecucion en CPU con OpenVINO evita el alquiler de GPU.
- Base para comparativas de cuantizacion: sirve como referencia INT8 frente al modelo original en FP16/BF16 para medir perdida de calidad en tareas propias mediante `lm-evaluation-harness` u OpenVINO GenAI Benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de este repositorio no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco reporta latencia o throughput. Tampoco se proporciona una comparacion del INT8 frente al modelo base en FP16/BF16, por lo que no es posible cuantificar la perdida de calidad introducida por la cuantizacion. Cualquier cifra que se quiera usar en produccion debe medirse sobre este artefacto concreto, no extrapolarse desde el modelo original.

## Requisitos de hardware

- Peso de los ficheros: aproximadamente 3,8 GB en disco (INT8), segun el tamano del repositorio.
- Memoria minima estimada para inferencia: del orden de 4,5 a 5 GB de RAM o VRAM para contexto corto (pesos mas runtime y activaciones). Estimacion propia, no confirmada por el autor.
- Cache KV: no documentada. Con 128k tokens de contexto la cache crece de forma muy significativa y puede requerir decenas de GB en FP16, por lo que en la practica conviene limitar `max_new_tokens` y la longitud de entrada en equipos de consumo. Cifra exacta: no disponible.
- CPU: cualquier procesador x86-64 moderno con soporte AVX2; se recomienda AVX-512 o Intel con AMX para mejor rendimiento. No se publican cifras de tokens por segundo.
- iGPU / NPU: OpenVINO permite seleccionar los plugins `GPU` o `NPU` en `ov::genai::LLMPipeline`, pero la model card solo ejemplifica el dispositivo `"CPU"`. Compatibilidad con GPU/NPU no verificada para este export.
- GPU dedicada: no es el objetivo del artefacto. vLLM, TGI y llama.cpp no cargan OpenVINO IR de forma nativa; para esos runtimes habria que usar el modelo base o una conversion GGUF distinta.
- Opciones de despliegue confirmadas: `optimum-intel` (`OVModelForCausalLM`) en Python y OpenVINO GenAI (`LLMPipeline`) en C++.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparacion orientativa. Los datos del modelo base y de las alternativas provienen de documentacion publica de cada proyecto y no estan verificados en la informacion proporcionada para esta ficha.

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nekodeus/phi35-mini-instruct-openvino | 3,8B | 128k tokens (declarado) | OpenVINO IR INT8, CPU | MIT | Repositorio HF, 0 descargas |
| microsoft/Phi-3.5-mini-instruct (base) | 3,8B | 128k tokens | safetensors FP16/BF16, GPU y CPU | MIT | Repositorio oficial de Microsoft |
| Conversiones GGUF de Phi-3.5-mini-instruct | 3,8B | 128k tokens | GGUF (Q4_K_M, Q5, Q8, etc.) | MIT | Multiples repositorios de la comunidad, compatibles con llama.cpp y Ollama |
| Otras alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | no disponible |

Frente al modelo base, este export reduce el peso de ~7,6 GB en FP16 a ~3,8 GB en INT8 y habilita CPU, a cambio de una posible perdida de calidad no medida y de quedar atado al runtime OpenVINO. Frente a las conversiones GGUF, la diferencia principal es el ecosistema: OpenVINO IR no es portable a llama.cpp, Ollama o LM Studio, mientras que GGUF si. La eleccion depende del hardware objetivo: OpenVINO es la via natural en CPU Intel; GGUF lo es si se quiere maxima portabilidad.

## Limitaciones y advertencias

- Sin evaluacion de calidad: no hay benchmarks ni comparacion INT8 frente a FP16/BF16, por lo que se desconoce la degradacion real de la cuantizacion weight-only en este export concreto.
- Repositorio sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia externa de que los ficheros carguen correctamente ni de que las salidas sean correctas.
- Metadatos anomalos: las fechas de creacion y actualizacion indican 2026-10-10, y las dependencias declaradas (`openvino 2026.4.1`, `transformers 5.16.1`) corresponden a versiones no publicadas de forma generalizada. Conviene verificar la reproducibilidad del entorno antes de confiar en el artefacto.
- Alucinacion: inherente al modelo base. No hay datos especificos sobre su tasa en esta conversion. No usar en dominios regulados sin verificacion humana.
- Sesgos: los sesgos del modelo base en ingles y en el corpus de entrenamiento original se heredan intactos. No se documenta ningun filtrado adicional.
- Idiomas: no declarados en la model card. No asumir un buen rendimiento en castellano; el modelo base esta orientado principalmente a ingles.
- Formato no portable: OpenVINO IR no se carga en vLLM, TGI, llama.cpp, Ollama ni transformers puro. Requiere OpenVINO Runtime y, para el camino en Python, `optimum-intel`. Esto limita la migracion a otros backends.
- Restricciones de licencia: MIT, tanto en el modelo base como en esta conversion, lo que en principio permite uso comercial y redistribucion. No obstante, el usuario debe conservar el aviso de copyright y verificar la licencia del modelo base por si Microsoft la hubiera modificado con posterioridad.
- Contexto de 128k en teoria, no en la practica: la memoria necesaria para la cache KV a esa longitud supera lo disponible en hardware de consumo. Validar con la longitud real de trabajo antes de dimensionar.
- Advertencia sobre el material de busqueda: los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica sobre el modelo (son enlaces a plataformas de chat de personajes sin relacion). No se han utilizado como fuente.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Nekodeus/phi35-mini-instruct-openvino
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Documentacion de `optimum-intel`: https://github.com/huggingface/optimum-intel
- Documentacion de OpenVINO: https://docs.openvino.ai/
- OpenVINO GenAI (`LLMPipeline`): https://github.com/openvinotoolkit/openvino.genai
- NNCF (cuantizacion): https://github.com/openvinotoolkit/nncf
- Paper de referencia de la familia Phi-3 (no citado en la model card, enlace aportado como contexto general): https://arxiv.org/abs/2404.14219
- Paper de LongRoPE, base del contexto extendido (no citado en la model card): https://arxiv.org/abs/2402.13753

No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo.
