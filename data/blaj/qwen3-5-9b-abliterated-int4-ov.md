# blaj/Qwen3.5-9B-abliterated-int4-ov

## Resumen

Qwen3.5-9B-abliterated-int4-ov es una conversion a formato OpenVINO IR del modelo lukey03/Qwen3.5-9B-abliterated, publicada por el usuario blaj. Se trata de un transformer decoder-only de la familia Qwen3.5, con una "abliteracion" de capa completa (capas 0-31, escala 1.0) que elimina la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo deja de negarse a responder a ciertas peticiones. El resultado se distribuye ya cuantizado en int4 asimetrico con grupo de 128, lo que reduce el repositorio a 5,7 GB.

La relevancia de esta ficha es fundamentalmente practica: no es un modelo nuevo entrenado desde cero, sino un artefacto de despliegue optimizado para hardware Intel. Al estar en OpenVINO IR, puede ejecutarse sobre CPU, iGPU Arc y dGPU Intel mediante OpenVINO Model Server, sin necesidad de GPUs NVIDIA. El autor aporta ademas una medicion de rendimiento real sobre un Intel Core Ultra 7 258V con iGPU Arc 130V/140V y 30 GB de RAM.

El repositorio es muy reciente (creado y actualizado el 21 de septiembre de 2026) y no registra descargas ni likes, por lo que su adopcion es todavia nula. La licencia es Apache-2.0, heredada del modelo base abliterado. El modelo card no documenta benchmarks de calidad (MMLU, HumanEval, GSM8K) ni la longitud de contexto soportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer decoder-only), 32 capas, vocabulario de 248320 tokens |
| Parametros totales | Aproximadamente 9 000 millones, segun la denominacion del modelo base; no se publica desglose oficial |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 asimetrica grupo 128 en 248 de 275 capas; int8 en las capas restantes. Existe un build hermano completamente int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (int4 asym g128), repositorio de 5,7 GB (5,3 GB segun el model card) |

## Arquitectura y entrenamiento

La arquitectura es Qwen3_5ForCausalLM, un transformer decoder-only de 32 capas con un vocabulario de 248320 tokens. No se trata de un MoE ni de un modelo hibrido: el model card no menciona parametros activos ni mecanicas de atencion alternativa, y la familia Qwen3.5 en este tamano se distribuye como modelo denso. La innovacion relevante no esta en el entrenamiento sino en la intervencion sobre los pesos: lukey03 aplico una abliteracion de capa completa sobre las 32 capas con escala 1.0, una tecnica que proyecta fuera del espacio de pesos la direccion asociada al rechazo de peticiones.

La conversion a OpenVINO IR se realizo con optimum-intel y NNCF, empleando un metodo en dos etapas: primero se exporta el IR en fp16 y despues se comprime con NNCF, en lugar de una unica pasada de `optimum-cli --weight-format int8`. El autor indica que este enfoque mantiene el pico de memoria muy por debajo de una exportacion de una sola pasada. Como caveat de reproduccion, la arquitectura Qwen3.5 exige `transformers==5.2.0` (el "gate" de exportacion rechaza versiones superiores), a diferencia de los modelos LFM, que requieren 5.4.0.

No se documenta el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO; esos datos corresponderian al modelo original Qwen3.5-9B, no reproducidos en este repositorio.

## Capacidades

- Generacion de texto conversacional en ingles y otros idiomas, aunque el repositorio no declara la lista de idiomas soportados.
- Respuestas sin filtros de rechazo: la abliteracion de capa completa elimina la conducta de negativa sobre temas sensibles.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.5-9B, sin datos de evaluacion publicados en este repositorio.
- Inferencia local sobre hardware Intel (CPU, iGPU Arc, dGPU) mediante OpenVINO.
- Compatibilidad con OpenVINO Model Server (OVMS) para servir el modelo por API REST.
- Compatibilidad con decodificacion especulativa mediante el draft blaj/Qwen3.5-9B-abliterated-DFlash-int4-ov, aunque en la medicion del autor no aporta aceleracion.
- Soporte de tool calling, agentes o modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar que comportamientos emergen cuando se elimina la direccion de rechazo, comparando sus respuestas con las del modelo base alineado en tareas de red-teaming controlado.
- Asistente conversacional local en portatiles Intel: con un footprint de 5,7 GB en int4, el modelo puede ejecutarse en un portatil con iGPU Arc y 30 GB de RAM sin GPU dedicada, como demuestra la medicion del autor.
- Redaccion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas que los modelos alineados suelen rechazar, en un entorno totalmente offline.
- Procesamiento por lotes de texto en CPU: al ser un IR de OpenVINO, se puede desplegar en granjas de servidores x86 sin acelerador dedicado, con OVMS gestionando la concurrencia.
- Servicio de inferencia interno con API REST: OVMS expone el modelo en un puerto REST (el ejemplo del autor usa el 11436), lo que permite integrarlo como backend de una aplicacion interna.
- Base para experimentos de decodificacion especulativa: el repositorio incluye un draft emparejado (DFlash int4) y documenta que la especulacion resulta mas lenta que la decodificacion directa, un dato util para quien investigue tecnicas de aceleracion en OpenVINO.
- Evaluacion comparativa de cuantizacion: al existir un build hermano en int8, permite medir el impacto de int4 frente a int8 en calidad y velocidad sobre el mismo hardware.
- Generacion de datos sinteticos para pipelines que requieran respuestas sin sesgo de rechazo, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento es una medicion de throughput y latencia de primer token sobre un equipo concreto:

| Configuracion | tok/s | TTFT |
|---|---|---|
| int8, sin draft | 8,2 | 0,157 s |
| int8, con draft DFlash abliterado | 7,5 | 0,193 s |

Hardware de la medicion: Intel Core Ultra 7 258V (iGPU Arc 130V/140V), 30 GB de RAM, OpenVINO Model Server 2026.4.0 sobre GPU. El model card etiqueta ambas filas como "int8", aunque el repositorio distribuido es int4; esta discrepancia no se aclara en la documentacion. El dato mas relevante es que la decodificacion especulativa con el draft emparejado resulto mas lenta que la decodificacion directa (7,5 frente a 8,2 tok/s), es decir, las propuestas del draft se rechazan y no generan aceleracion.

## Requisitos de hardware

- Peso de los pesos: 5,3 GB en int4 (5,7 GB de repositorio). Hay que sumar el espacio de la cache KV, que depende de la longitud de contexto, no declarada.
- Memoria estimada para inferencia: del orden de 6-8 GB de memoria disponible entre pesos y cache para contextos moderados.
- Hardware validado por el autor: Intel Core Ultra 7 258V con iGPU Arc 130V/140V y 30 GB de RAM, ejecutando OVMS 2026.4.0 sobre GPU.
- GPU de consumo: el modelo deberia caber en GPUs con 8 GB o mas de VRAM (por ejemplo RTX 3060 Ti, RTX 4060, RTX 3070) siempre que se use el plugin GPU de OpenVINO; no se proporcionan mediciones sobre estas tarjetas.
- Aceleradores Intel: iGPU Arc integradas y dGPU Arc son el objetivo declarado del formato (etiquetas intel y arc).
- Opciones de despliegue: OpenVINO Model Server (OVMS) con `optimum-intel` y NNCF para la conversion. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, ya que el formato OpenVINO IR no es directamente compatible con ellos.
- Caveat de arranque: `PYTHONPATH` debe apuntar a `OVMS_ROOT/lib/python`; en caso contrario el servidor termina inmediatamente tras inicializar el interprete de Python, sin mensaje de error.
- Latencia y throughput medidos: 8,2 tok/s y 0,157 s de TTFT en la configuracion sin draft sobre el equipo indicado. Son valores de un unico flujo sobre iGPU, no de un servidor de alta concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| blaj/Qwen3.5-9B-abliterated-int4-ov (este) | ~9B | OpenVINO IR int4 asym g128 | no disponible | Apache-2.0 | 248/275 capas int4, resto int8; 5,3 GB; 8,2 tok/s medidos |
| blaj/Qwen3.5-9B-abliterated-int8-ov | ~9B | OpenVINO IR int8 | no disponible | Apache-2.0 | Build hermano, mayor precision y presumiblemente mayor tamano y menor velocidad |
| lukey03/Qwen3.5-9B-abliterated | ~9B | Safetensors (presumiblemente fp16/bf16) | no disponible | Apache-2.0 | Modelo base de la conversion; abliteracion de capas 0-31, escala 1.0 |
| blaj/Qwen3.5-9B-abliterated-DFlash-int4-ov | no disponible | OpenVINO IR int4 | no disponible | no disponible | Draft para decodificacion especulativa; en la medicion no acelera al objetivo |
| z-lab/Qwen3.5-9B-DFlash | no disponible | no disponible | no disponible | no disponible | Referencia de geometria citada por el autor para comparar el draft |

No se dispone de datos de rendimiento comparativo (benchmarks de calidad) entre estas variantes, solo de throughput en el caso del modelo int4.

## Limitaciones y advertencias

- Modelo abliterado: la eliminacion de la direccion de rechazo implica que el modelo puede generar contenido danino, ilegal o eticamente inapropiado sin negarse. No es adecuado para exposicion directa a usuarios finales sin una capa de moderacion externa.
- Riesgo de degradacion de calidad: la abliteracion modifica los pesos de las 32 capas con escala 1.0; no se publican evaluaciones que cuantifiquen la perdida de capacidades respecto al modelo original.
- Alucinacion: no se aportan datos sobre tasas de alucinacion ni evaluaciones de veracidad. El riesgo es el habitual en modelos de ~9B, agravado por la ausencia de benchmarks.
- Contexto e idiomas: ni la longitud de contexto ni la lista de idiomas soportados estan documentadas en la informacion disponible, lo que impide planificar despliegues con requisitos concretos.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero no exime al desplegador de responsabilidad sobre el contenido generado por un modelo sin alineamiento de seguridad.
- Compatibilidad restringida: al ser OpenVINO IR, no se puede cargar directamente en vLLM, llama.cpp, Ollama o TGI; el ecosistema de despliegue queda limitado a OpenVINO y OVMS.
- Reproducibilidad: la conversion exige `transformers==5.2.0`; versiones superiores son rechazadas por el gate de exportacion.
- Decodificacion especulativa inutil en esta combinacion: el draft emparejado reduce el throughput de 8,2 a 7,5 tok/s.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia. No hay evidencia de uso en produccion ni de validacion por terceros.
- Los resultados de busqueda web disponibles no contienen informacion util sobre este modelo; todas las fuentes relevantes son enlaces de HuggingFace citados en el propio model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-int4-ov
- Modelo base abliterado: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Build hermano en int8: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-int8-ov
- Draft DFlash abliterado int4: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-DFlash-int4-ov
- Referencia de geometria del draft: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
