# Kazuya-Nomura-zer0/CYBER-FROST-3.8-GGUF

## Resumen

CYBER-FROST-3.8-GGUF es un conjunto de cuantizaciones en formato GGUF del checkpoint Blackfrost-AI/CYBER-FROST-3.8-BF16, publicado por el usuario Kazuya-Nomura-zer0. Se trata de un modelo de lenguaje de arquitectura `qwen4exp` (`Qwen4ExpForConditionalGeneration`), derivado de `Qwen/Qwen3.8-Flash-Next`, con un stack de mezcla de expertos (MoE) de aproximadamente 177.000 millones de parametros totales y unos 6.000 millones activos por token. Solo se ha convertido la torre de texto: la torre de vision del modelo original no esta incluida.

El interes de esta publicacion es practico: ofrece variantes cuantizadas que van desde 80 GB (Q2_K) hasta 123 GB (UD-Q4_K_XL), ademas de una variante MXFP4_MOE de 96,65 GB, pensadas para ejecutarse con llama.cpp incluso en hardware muy limitado mediante offload de expertos a CPU. El autor documenta un registro de pruebas con backend Vulkan sobre una Radeon 680M, con velocidades de generacion de aproximadamente 1,0 a 1,1 tok/s, lo que da una idea realista del coste de inferencia en configuraciones de gama baja.

La relevancia actual del modelo viene de dos factores: por un lado, la arquitectura hibrida con tensores SSM y attention, ademas de un bloque MTP (multi-token prediction) nativo que en la variante Q2_K_S se integra dentro del propio archivo GGUF; por otro, el contexto configurado de 262.144 tokens. No obstante, el propio autor advierte de que las pruebas se hicieron con 512 tokens de contexto y que el contexto largo no esta probado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp` (`Qwen4ExpForConditionalGeneration`), transformer MoE con tensores SSM y bloque MTP nativo; derivada de `Qwen/Qwen3.8-Flash-Next` |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | ~6B por token (10 expertos de 512, mas 1 experto compartido) |
| Longitud de contexto | 262.144 tokens configurados; solo probado con 512 tokens |
| Tipos de cuantizacion | Q4_K_M, UD-Q4_K_XL, UD-IQ4_XS, MXFP4_MOE, Q3_K_M, Q3_K_S, Q2_K, Q2_K_S; cabezas draft MTP en Q8_0, Q4_K_M y Q4_0 (esta ultima no construida) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (campo `license: other`) |
| Formato de pesos | GGUF (llama.cpp); el checkpoint fuente esta en safetensors BF16 |

Otras especificaciones declaradas: 48 capas, 512 expertos, 10 expertos por token, un experto compartido. Tamano del repositorio: 799,8 GB.

## Arquitectura y entrenamiento

La arquitectura es `qwen4exp`, una variante MoE que combina mecanismos de atencion con tensores de tipo SSM (state space model), lo que se refleja en pesos como `ssm_conv1d.weight`, almacenado en F16 en los GGUF. El modelo enruta cada token a 10 de los 512 expertos disponibles mas un experto compartido, con las normas y el router en float32. Incluye ademas una tabla n-grama (`per_layer_token_embd`) que forma parte del grafo de inferencia y que en las cuantizaciones de 2 y 3 bits se almacena en Q4_0 por limitaciones de ancho de bloque.

El checkpoint incorpora un bloque nativo de MTP (multi-token prediction) entrenado antes de la pasada final de comportamiento del tronco. En la variante `CYBER-FROST-3.8-Q2_K_S.gguf` ese bloque se injerta como capa 48 en Q8_0, extraido de `mtp-CYBER-FROST-3.8-Q8_0.gguf`. El autor indica que el resto de troncos aun no lo llevan y que los archivos `mtp-` independientes no cargan junto a un tronco porque falta `output_hc_norm.weight` (los pesos del mixer se almacenan como `blk.48.nextn.hc_head_norm.weight`).

No hay informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. En cuanto a las cuantizaciones, el autor especifica que no se ha usado importance matrix, por lo que las variantes dinamicas son mezclas de tipos por capa y no equivalen a Unsloth Dynamic 3.0 ni a un IQ4_XS calibrado.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `text-generation` y `conversational`, y admite plantillas mediante `--jinja` en llama.cpp.
- Generacion de codigo basica: la unica prueba publicada consiste en escribir una funcion Python `add` que suma dos enteros, superada por todas las variantes probadas.
- Mezcla de expertos con enrutado disperso: 10 de 512 expertos activos por token, con un experto compartido.
- Prediccion multi-token (MTP): disponible unicamente en `CYBER-FROST-3.8-Q2_K_S.gguf`, activable con `--spec-type draft-mtp --spec-draft-n-max 2`.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Capacidades de vision: no disponibles; la torre de vision del modelo fuente no se convirtio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local de un MoE de gran tamano con RAM y una iGPU: el modelo permite ejecutar un MoE de ~177B con solo ~6B activos manteniendo expertos y tabla n-grama en CPU y el resto en GPU, como demuestra la configuracion con Radeon 680M, GTT cercano a 45 MB y archivos mapeados con mmap.
- Pruebas de integracion de llama.cpp con arquitecturas nuevas: sirve como banco de pruebas para el grafo `qwen4exp` y para la ruta de decodificacion especulativa con cabezas MTP nativas.
- Evaluacion comparativa de estrategias de cuantizacion: al ofrecer Q2_K, Q3_K, Q4_K_M, UD-Q4_K_XL, UD-IQ4_XS y MXFP4_MOE sobre el mismo checkpoint, permite medir el impacto de cada mezcla de tipos en la coherencia de salida con presupuestos de disco distintos (de 80,08 GB a 123,10 GB).
- Generacion de codigo asistida en entornos con restricciones de hardware: para tareas de autocompletado o generacion de funciones cortas donde la latencia de ~1 tok/s es aceptable en modo batch o nocturno.
- Despliegue en servidores con gran cantidad de RAM pero sin GPU de gran VRAM: las variantes de 2 y 3 bits (80-88 GB) permiten mantener el modelo entero en memoria y descargar la computacion de expertos a CPU.
- Prototipado de asistentes conversacionales de contexto muy largo: el contexto configurado de 262.144 tokens lo hace candidato para procesar documentos extensos, siempre que se valide primero su comportamiento real mas alla de los 512 tokens probados.
- Experimentacion con decodificacion especulativa: la variante Q2_K_S con cabeza MTP integrada permite estudiar el rendimiento de `draft-mtp` frente a la generacion estandar en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta una prueba de humo con el prompt "write a Python 3 function named add that takes two ints and returns their sum", superada por las variantes Q4_K_M, UD-Q4_K_XL y UD-IQ4_XS.

| Variante | Fecha | Build | Backend | Resultado |
|---|---|---|---|---|
| CYBER-FROST-3.8-Q4_K_M.gguf | 2026-09-28 | b1-4da6337 | Vulkan, mmap, expertos y tabla n-grama en CPU | pasa, `def add` con `return`, 1,1 tok/s |
| CYBER-FROST-3.8-UD-Q4_K_XL.gguf | 2026-09-28 | b1-4da6337 | Vulkan, mmap, expertos y tabla n-grama en CPU | pasa, misma funcion, 1,0 tok/s |
| CYBER-FROST-3.8-UD-IQ4_XS.gguf | 2026-09-28 | b1-4da6337 | Vulkan, mmap, expertos y tabla n-grama en CPU | pasa, misma funcion, 0,9 tok/s |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia con todos los pesos en GPU: entre 80 GB y 124 GB segun la cuantizacion (80,08 GB en Q2_K/Q2_K_S, 88,56 GB en Q3_K_M y Q3_K_S, 96,65 GB en MXFP4_MOE, 111,43 GB en Q4_K_M, 121,84 GB en UD-IQ4_XS y 123,10 GB en UD-Q4_K_XL). A esto hay que sumar la KV cache en f16.
- GPU recomendadas si se quiere mantener todo en VRAM: no disponible en la informacion proporcionada; por tamano, quedaria restringido a aceleradores de 96-141 GB o a configuraciones multi-GPU. No se documenta ninguna prueba en A100, H100 ni RTX 4090.
- Configuracion probada por el autor: Radeon 680M (iGPU), backend Vulkan, con expertos y tabla n-grama en CPU, archivo mapeado en memoria, `-ngl 99`, `-c 512`, `-lm mmap`, `-fit off` y GTT cercano a 45 MB. Es decir, si cabe en hardware de gama baja, pero a costa de velocidad.
- Cabe en GPU de consumo: no con todos los pesos en VRAM; si con offload de expertos a CPU, siempre que el sistema disponga de RAM suficiente para el archivo completo (mas de 80 GB) y de disco rapido o mmap.
- Opciones de despliegue: llama.cpp, con la build `b1-4da6337` o superior que incluya el grafo `qwen4exp` y, para MTP, soporte de `--spec-type draft-mtp`. La inferencia se realizo con `GGML_VK_DISABLE_ASYNC=1`. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros servidores.
- KV cache: obligatoriamente f16; el autor indica que la KV cuantizada provoca fallos en esta arquitectura.
- Latencia y throughput medidos: velocidad de prompt de 0,5 a 0,7 tok/s y de generacion de 1,0 a 1,1 tok/s en la configuracion descrita, con solo 512 tokens de contexto y los expertos en CPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparativas con otros modelos, y no se dispone de datos verificables de benchmarks ni de especificaciones del modelo fuente `Qwen/Qwen3.8-Flash-Next` que permitan establecer una tabla de comparacion rigurosa. Como referencia de categoria, el propio autor situa el modelo en el rango de "unos 180B de parametros y unos 6B activos", pero no ofrece alternativas equivalentes con las que contrastarlo.

## Limitaciones y advertencias

- Licencia: el campo de licencia es `other` con `license_name: qwen-community-license-1.0`. Es una licencia de comunidad con posibles restricciones de uso comercial; es imprescindible revisar el archivo `LICENSE` antes de cualquier despliegue en produccion.
- Contexto no validado: aunque la configuracion declara 262.144 tokens, todas las pruebas se hicieron con 512 tokens. El comportamiento en contexto largo es desconocido.
- Rendimiento muy bajo en hardware de gama baja: 0,5-0,7 tok/s de prompt y 1,0-1,1 tok/s de generacion en Radeon 680M con expertos en CPU. No es apto para aplicaciones interactivas en esa configuracion.
- Riesgo de degradacion por cuantizacion agresiva: las variantes de 2 y 3 bits no usan importance matrix y presentan dos tensores degradados a Q4_0 (proyecciones down de expertos y tabla n-grama), lo que puede afectar a la calidad.
- Fallos conocidos de carga: los archivos `mtp-` independientes no cargan junto a un tronco por la ausencia de `output_hc_norm.weight`; no deben pasarse con `-md`. Solo `CYBER-FROST-3.8-Q2_K_S.gguf` incorpora la cabeza MTP.
- Dependencia de una build concreta de llama.cpp: la ruta MTP requiere el grafo `qwen4exp` implementado en la build local. Ademas, la coherencia de texto depende de que el shader de convolucion SSM de Vulkan convierta `ssm_conv1d.weight` de F16 a F32; una build que alimente el kernel F16 directamente produce salida basura.
- KV cache cuantizada no soportada: provoca fallos en esta arquitectura; hay que usar f16.
- Sin datos de sesgo, alineacion ni evaluaciones de seguridad: no disponibles.
- Riesgo de alucinacion: no evaluado; no hay datos de benchmarks que permitan estimarlo.
- Idiomas soportados: no declarados.
- Fecha de publicacion inusual (2026-09-28) y ausencia de descargas o likes (0 en ambos casos), lo que indica que la validacion por parte de la comunidad es nula.
- Los resultados de la busqueda web asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo y se han descartado por completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kazuya-Nomura-zer0/CYBER-FROST-3.8-GGUF
- Checkpoint fuente en BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Modelo del que deriva la arquitectura (mencionado en la model card): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
