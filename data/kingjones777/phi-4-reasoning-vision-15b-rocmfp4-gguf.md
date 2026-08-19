# kingjones777/Phi-4-Reasoning-Vision-15B-ROCmFP4-GGUF

## Resumen

Phi-4-Reasoning-Vision-15B-ROCmFP4-GGUF es una cuantización 4-bit del modelo multimodal microsoft/Phi-4-reasoning-vision, realizada por el usuario kingjones777. El objetivo es optimizar la ejecución del modelo en hardware AMD con arquitectura gfx1151, concretamente el Ryzen AI MAX+ 395 (Strix Halo), aprovechando la memoria unificada y las instrucciones ROCmFP4. El archivo resultante ocupa 8.0 GiB y alcanza una velocidad de decodificación de 24.62 tokens por segundo en ese hardware, un 9.4 % más rápido que la cuantización Q4_K_M equivalente y con 0.5 GiB menos de tamaño.

La relevancia de este modelo reside en que proporciona una alternativa de cuantización especializada para un segmento concreto de hardware AMD, donde las cuantizaciones genéricas no están tan optimizadas. Al estar basado en Phi-4-reasoning-vision, hereda capacidades de razonamiento y visión, aunque esta versión solo incluye el componente de texto (el proyector de visión se mantiene en BF16 dentro del archivo). Está pensado para usuarios que utilizan llama.cpp en equipos con Ryzen AI MAX+ 395 y necesitan maximizar el rendimiento sin sacrificar precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base microsoft/Phi-4-reasoning-vision) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (ftype 102), con capas especificas en Q6_K y F32 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (con tipos ROCmFP4) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo base no se detalla en la informacion proporcionada. Se sabe que es un modelo multimodal de la familia Phi, con capacidades de razonamiento y vision, pero no se especifican detalles como el numero de capas, la atencion o el tipo de transformer. Esta version es una cuantizacion 4-bit realizada a partir de un archivo GGUF en F16 (27.96 GiB), considerado una fuente sin perdida, y no una requantizacion de una version de menor precision.

El proceso de cuantizacion ha sido realizado por kingjones777, quien ha seleccionado una combinacion de tipos por tensor: la capa de salida y las embeddings se mantienen en Q6_K, las normas en F32, el grueso del modelo en TYPE_100 (160) y el proyector de vision (mmproj) se conserva en BF16 (823 MiB). No se ha realizado entrenamiento adicional ni ajuste fino; es una transformacion de pesos para mejorar la eficiencia en hardware AMD con soporte ROCmFP4.

## Capacidades

- Generacion de texto en ingles.
- Razonamiento basico: se ha verificado que responde correctamente a operaciones aritmeticas (17×23 = 391), preguntas factuales (capital de Japon = Tokyo) y calendario (dias en 2024 = 366).
- Vision multimodal: el proyector de vision se incluye en BF16, y se ha comprobado que describe correctamente una imagen simple (un PNG rojo de 8×8 como "Red").
- No se ha evaluado tool calling ni funciones de agente.
- No se ha probado con contextos largos.

## Casos de uso

- Ejecucion local de un modelo multimodal de razonamiento en equipos con Ryzen AI MAX+ 395 (Strix Halo), aprovechando la memoria unificada de 128 GB y la velocidad optimizada de ROCmFP4.
- Prototipado rapido de aplicaciones de vision por computadora en edge, donde se necesita una respuesta inmediata con una sola imagen y una pregunta asociada.
- Asistente de texto con razonamiento aritmetico y factual para entornos sin conexion, gracias a su tamaño reducido (8.0 GiB) y su licencia MIT.
- Pruebas de rendimiento y comparativas entre cuantizaciones en hardware AMD, dado que el autor ha publicado mediciones detalladas de velocidad y correctitud.
- Despliegue en sistemas embebidos con GPU integrada gfx1151, donde otras cuantizaciones no aprovechan las instrucciones ROCmFP4.
- Investigacion sobre cuantizacion especializada para arquitecturas AMD, ya que el archivo incluye una auditoria de tipos por tensor que puede servir de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos medidos son los siguientes, obtenidos en un Ryzen AI MAX+ 395 (gfx1151, 128 GB unificados, ROCm 7.2.4), con mediana de 3 ejecuciones y descartando el warm-up:

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion (mediana) | 24.62 tok/s |
| Rango de velocidad | [23.42 – 25.37] tok/s |
| Tamano del archivo | 8.0 GiB |
| Correctitud en operacion aritmetica | 17×23 = 391 (correcto) |
| Correctitud factual | Capital de Japon = Tokyo (correcto) |
| Correctitud calendario | Dias en 2024 = 366 (correcto) |
| Vision | Imagen roja 8×8 descrita como "Red" (correcto) |

## Requisitos de hardware

- GPU compatible: AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo) exclusivamente, segun la informacion del autor.
- VRAM estimada: 8.0 GiB para el archivo GGUF, mas la memoria del proyector de vision (823 MiB) y los overheads del runtime. En un sistema con memoria unificada de 128 GB, cabe sin problemas.
- Software necesario: una version de llama.cpp con soporte para los tipos ROCmFP4, concretamente el fork `charlie12345/ROCmFPX`. El llama.cpp estandar no puede cargar este modelo.
- Configuracion obligatoria: desactivar flash attention (`-fa off`), ya que rompe la ruta de vision en gfx1151.
- ROCm 7.2.4 o superior recomendado.
- No se proporcionan datos de latencia ni throughput mas alla de la velocidad de decodificacion medida.

## Comparativa con modelos similares

La unica comparativa publicada es con la cuantizacion Q4_K_M del mismo modelo base, medida en el mismo hardware:

| Modelo | Tamano | Velocidad (tok/s) | Rango |
|---|---|---|---|
| Phi-4-Reasoning-Vision-15B-ROCmFP4 (este) | 8.0 GiB | 24.62 | [23.42 – 25.37] |
| Phi-4-Reasoning-Vision-15B-Q4_K_M | 8.5 GiB | 22.50 | [22.25 – 22.50] |

No se dispone de comparaciones con otros modelos de la misma categoria (p. ej., otros multimodales de 15B) en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un fork especifico de llama.cpp (ROCmFPX) que no esta disponible en el codigo oficial. El modelo no cargara con el llama.cpp estandar.
- Flash attention debe desactivarse obligatoriamente (`-fa off`), lo que puede afectar al rendimiento en contextos largos o con atencion compleja.
- No se ha realizado una evaluacion exhaustiva de calidad: no hay pruebas de perplexity, ni comparaciones A/B con el modelo original, ni pruebas de contexto largo, ni evaluacion de tool calling.
- La correctitud se ha verificado solo con unos pocos prompts memorizados; un modelo danado podria superar estas comprobaciones.
- El modelo solo soporta ingles como idioma.
- La licencia MIT se hereda del modelo base, pero no se especifican restricciones adicionales para uso comercial.
- El autor advierte que no se ha probado la generacion con contexto largo, por lo que su comportamiento en ese escenario es desconocido.
- El hardware objetivo es muy especifico (gfx1151); en otras GPU AMD o NVIDIA no funcionara correctamente o no aprovechara las optimizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kingjones777/Phi-4-Reasoning-Vision-15B-ROCmFP4-GGUF
- Repositorio del fork ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning-vision
