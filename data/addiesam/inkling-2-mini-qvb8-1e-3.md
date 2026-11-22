# addiesam/Inkling-2-Mini-QVB8-1e-3

## Resumen

Inkling-2-Mini-QVB8-1e-3 es un paquete de pesos cuantizados del modelo multimodal Inkling-2-Mini, desarrollado originalmente por Thinking Machines Lab y comprimido por el investigador independiente Addie Sam mediante el formato QVB8. El modelo base es un transformer multimodal de tipo image-text-to-text con 834 millones de parametros totales, orientado a conversacion y comprension conjunta de imagen y texto. Este paquete concreto aplica una compresion con cota L-infinito de tau = 0,001 sobre los pesos en bf16 del modelo original.

La innovacion principal no reside en la compression en si, sino en el motor de inferencia propietario QVB8, que decodifica los pesos comprimidos dentro de sus propios kernels CUDA en la GPU. Esto permite ejecutar el modelo con un footprint de VRAM cercano al tamano del archivo comprimido (18 GB) en lugar de cargar el checkpoint completo en bf16. Ademas, el motor incluye una cache KV comprimida (QVB8 KV Cache) que hace viable el contexto largo en hardware modesto.

El modelo es relevante porque propone un enfoque de cuantizacion con garantia de error maximo por tensor, en lugar de optimizar solo metricas promedio como la perplejidad. Cada tensor restaurado difiere del original en menos de tau, y el error maximo observado se almacena en el manifest.json. El paquete no es cargable directamente en transformers ni en otros motores: requiere el QVB8 Inference Engine v1.3.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del modelo base no disponibles |
| Parametros totales | 834.004.624 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | QVB8 con cota L-infinito; tau = 0,001 (5,32 bits por peso de media en los tensores comprimidos); existe variante tau = 5e-4 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | QVB8 (safetensors como contenedor); requiere QVB8 Inference Engine, no compatible con transformers |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer multimodal de tipo image-text-to-text con 834 millones de parametros, disenado por Thinking Machines Lab para tareas conversacionales que combinan imagen y texto. Los detalles sobre la composicion del dataset de entrenamiento, el numero de tokens, la posible aplicacion de RLHF o DPO y las innovaciones arquitectonicas internas del modelo original no estan disponibles en la informacion proporcionada.

El proceso de compresion QVB8 empaqueta cada matriz de pesos con un ancho de bits por fila y verifica el resultado tras el empaquetado: el error maximo entre el valor restaurado y el peso bf16 original se registra por tensor en manifest.json (max_err), y ningun tensor supera tau. El empaquetado no utiliza datos de calibracion y depende unicamente de los pesos. Se comprimen 6.543 tensores, con una media de 5,32 bits por peso. El paquete esta certificado para restauracion en fp16 y bf16 (restore: fp16+bf16 en manifest.json), e incluye escape_tables.json para acelerar la decodificacion en ejecuciones fp16.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Inkling-2-Mini.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text): el modelo puede recibir imagenes junto a instrucciones textuales.
- Razonamiento y respuesta en formato conversacional.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (los idiomas soportados no se especifican).
- Modo thinking, vision adicional o audio: no disponible en la informacion proporcionada.
- Ejecucion con VRAM reducida gracias a la decodificacion de pesos en kernels CUDA del motor QVB8.
- Contexto largo factible mediante la QVB8 KV Cache comprimida del motor.

## Casos de uso

- Asistente conversacional multimodal en hardware de gama media: el modelo puede gestionar dialogos que combinan imagenes y texto con un footprint de VRAM cercano a los 18 GB, lo que permite desplegarlo en GPUs que no admitirian el checkpoint bf16 completo.
- Analisis de imagenes en entornos con recursos limitados: al decodificar los pesos en la GPU dentro del motor QVB8, se pueden procesar imagenes y generar descripciones o respuestas sobre ellas sin necesidad de un servidor de alta gama.
- Investigacion sobre cuantizacion con cota de error: el paquete sirve como caso de estudio reproducible para comparar el efecto de tau = 0,001 frente a tau = 5e-4 en la calidad de las respuestas, ya que ambos packs estan publicados.
- Despliegue de prototipos de vision-lenguaje en estaciones de trabajo con una sola GPU: el motor QVB8 permite cargar el modelo con aproximadamente el tamano del archivo comprimido, lo que simplifica la puesta en marcha de demos internas.
- Evaluacion de motores de inferencia alternativos: util para equipos que quieran medir el rendimiento del QVB8 Inference Engine frente a vLLM o llama.cpp en tareas image-text-to-text, dado que el paquete solo funciona con el primero.
- Experimentacion con contexto largo en hardware modesto: la QVB8 KV Cache comprimida hace posible ejecutar conversaciones largas o documentos extensos alli donde una cache KV estandar no cabria en memoria.
- Docencia y formacion tecnica: el modelo, con 834 millones de parametros, es lo bastante pequeno para estudiar el efecto de la cuantizacion certificada en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB, cercano al tamano del archivo comprimido, segun el autor, gracias a la decodificacion de pesos en los kernels CUDA del motor QVB8.
- GPU recomendadas: no se especifican modelos concretos en la informacion proporcionada; el autor menciona que necesita maquinas para probar otras generaciones de GPU.
- Compatibilidad con GPU de consumo: no confirmada. Con 18 GB de footprint, quedaria fuera de GPUs consumer de 8-12 GB y al limite en modelos de 16 GB; seria viable en GPUs de 24 GB o mas, pero esto no esta verificado en la informacion disponible.
- Opciones de despliegue: exclusivamente el QVB8 Inference Engine v1.3.0 o superior (https://github.com/addiesam/qvb8). No es compatible con transformers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor de inferencia |
|---|---|---|---|---|---|
| Inkling-2-Mini-QVB8-1e-3 | 834 M | No disponible | QVB8 | Apache-2.0 | QVB8 Engine v1.3.0+ |
| Inkling-2-Mini (bf16) | 834 M | No disponible | bf16 (safetensors) | Apache-2.0 | transformers y otros estandares |
| Inkling-2-Mini-QVB8-5e-4 | 834 M | No disponible | QVB8 | Apache-2.0 | QVB8 Engine v1.3.0+ |

La comparacion con modelos de otros desarrolladores no esta disponible en la informacion proporcionada. La diferencia principal entre las tres variantes es la cota de error tau: 0,001 frente a 5e-4, ambas con 18 GB en disco.

## Limitaciones y advertencias

- Dependencia total del motor QVB8: el paquete no carga en transformers ni en otros motores de inferencia, lo que limita la portabilidad y ata el despliegue a un proyecto mantenido por un unico investigador.
- La cota L-infinito cubre unicamente los pesos almacenados; no garantiza que las respuestas del modelo sean identicas a las del original ni correctas. Diferencias en el motor, el tamano de lote o el orden de las operaciones en coma flotante producen salidas ligeramente distintas incluso con pesos fp16 sin cuantizar.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada, pero inherente a los modelos generativos de este tamano.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no especificados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto: no disponible, aunque el motor afirma facilitar ejecuciones de contexto largo mediante la cache KV comprimida.
- Licencia Apache-2.0: permite uso comercial, pero el motor QVB8 tambien es Apache-2.0 y no se ofrece garantia alguna; el autor remite al README del motor para el descargo completo de responsabilidad.
- Madurez: el paquete se publico el 22 de noviembre de 2026, con cero descargas y cero likes en el momento de la consulta, y el autor se declara investigador independiente en busca de maquinas para probar en mas generaciones de GPU. La validacion en produccion es practicamente inexistente.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/addiesam/Inkling-2-Mini-QVB8-1e-3
- Variante tau = 5e-4: https://huggingface.co/addiesam/Inkling-2-Mini-QVB8-5e-4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor QVB8: https://github.com/addiesam/qvb8
- Release v1.3.0 del motor: https://github.com/addiesam/qvb8/releases/tag/v1.3.0
- Patrocinio del autor: https://github.com/sponsors/addiesam
- Paper I (contrato e indice de banda virtual): https://doi.org/10.5281/zenodo.23815007
- Paper II (compresion de pesos, cache KV y activaciones): https://doi.org/10.5281/zenodo.23816044
