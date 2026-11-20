# addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3

## Resumen

Ripple-65B-Preview-DFlash2-QVB8R-5e-3 es un paquete de pesos comprimidos del modelo borrador (draft model) DFlash2, asociado al modelo base Ripple-65B-Preview de ricursiveAI. No se trata de un modelo completo entrenado de forma independiente, sino de una versión cuantizada del drafter empleado en decodificación especulativa, empaquetada en el formato propietario QVB8R (QVB8 con codificación entrópica) y publicada por el usuario addiesam. El paquete está diseñado exclusivamente para ejecutarse con el motor de inferencia QVB8, que decodifica los pesos comprimidos directamente en la GPU mediante kernels CUDA propios.

La propuesta técnica central es la compresión con cota L∞ certificada: para cada peso restaurado, el error absoluto respecto al valor bf16 original es inferior a tau = 0.005, y el error máximo por tensor se registra en `manifest.json`. A diferencia de la cuantización convencional, que se evalúa por medias (perplejidad o benchmarks), este enfoque controla el peor caso, evitando errores grandes en pesos aislados que pueden alterar tokens puntuales. El paquete ocupa 3,4 GB en disco, comprime 49 tensores con una media de 6,65 bits por peso y está certificado para restauración en fp16 y bf16.

El modelo base declarado es Ripple-65B-Preview-DFlash2, del que no se dispone de información pública detallada en la documentación proporcionada. El paquete se publica bajo licencia Apache 2.0 y acumula 1720 descargas desde su creación el 7 de noviembre de 2026. Su relevancia radica en que permite ejecutar un drafter de decodificación especulativa en hardware modesto dentro del ecosistema QVB8, aunque su utilidad está intrínsecamente ligada a ese motor y no es cargable en `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador de decodificación especulativa; arquitectura del base no documentada) |
| Parametros totales | 472.320 (según safetensors del paquete) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8R (QVB8 con codificación entrópica), tau = 0.005, media de 6,65 bits por peso en 49 tensores |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QVB8R (safetensors con manifiesto `manifest.json` y `escape_tables.json`); no cargable en `transformers` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Ripple-65B-Preview-DFlash2 ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). El paquete documenta únicamente el proceso de compresión: cada matriz de pesos se empaqueta con un ancho de bits por fila y se verifica tras el empaquetado, registrando el error máximo entre el valor restaurado y el peso bf16 original por tensor en `manifest.json` (`max_err`). El empaquetado no utiliza datos de calibración y depende solo de los pesos.

La innovación técnica destacable es la cota L∞ certificada: ningún tensor supera tau = 0.005, lo que acota el peor caso en lugar de la media. El formato QVB8R añade codificación entrópica sobre QVB8, reduciendo el tamaño respecto al paquete QVB8 equivalente (3,4 GB frente a 4,1 GB en el mismo tau). La decodificación de los pesos comprimidos se realiza en la GPU dentro de los kernels CUDA del motor QVB8, lo que permite ejecutar el modelo en hardware de menor capacidad. El motor soporta, desde la versión 1.1.0, ejecución multiproceso en varias GPU de una misma máquina (`--pipeline cuda:0,cuda:1`), un worker remoto para varias máquinas, offload de la caché KV a RAM del sistema (`--kv-window` / `--kv-host`) y kernels CUDA precompilados para DGX Spark (sm_121a) y V100 (sm_70).

## Capacidades

- Generación de texto como modelo borrador en decodificación especulativa: propone tokens que el modelo objetivo Ripple-65B-Preview verifica.
- Aceleración de inferencia mediante decodificación especulativa cuando se empareja con un pack objetivo compatible del mismo modelo.
- Ejecución en el motor QVB8 con decodificación de pesos comprimidos en GPU.
- Soporte de despliegue multi-GPU en una misma máquina y reparto entre varias máquinas mediante el worker remoto del motor.
- Offload de caché KV a RAM del sistema para reducir el consumo de VRAM.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito para este paquete.

## Casos de uso

- Aceleración de inferencia del modelo Ripple-65B-Preview: el paquete se usa como `DRAFT` junto a un pack objetivo (`MODEL`) del mismo modelo en el motor QVB8, de modo que el drafter propone tokens y el modelo grande los verifica, reduciendo la latencia por token generado.
- Despliegue en hardware de gama alta con VRAM limitada: al ocupar solo 3,4 GB, el drafter deja la mayor parte de la VRAM disponible para el pack objetivo y la caché KV, lo que facilita configuraciones en las que el modelo completo no cabría de otro modo.
- Servicio de generación de texto en producción con el motor QVB8: el paquete se integra como componente del servidor del motor, que expone un chat de terminal como cliente de un servidor en ejecución.
- Reparto de carga entre varias GPU: con `--pipeline cuda:0,cuda:1`, el drafter y el objetivo pueden distribuirse entre GPU de una misma máquina para equilibrar memoria y cómputo.
- Ejecución distribuida entre máquinas: mediante el worker remoto del motor, el drafter puede residir en un nodo distinto del objetivo, útil en clústeres con GPU heterogéneas.
- Validación de la cota de error en pipelines de compresión: el `manifest.json` con `max_err` por tensor permite auditar que ningún peso supera tau antes de desplegar, como control de calidad en un pipeline de cuantización propio.
- Investigación sobre decodificación especulativa: al ser un drafter comprimido con cota L∞, sirve para estudiar el impacto del error acotado por peso en la tasa de aceptación de tokens frente a cuantizaciones evaluadas solo por media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB solo para los pesos del drafter; hay que sumar la VRAM del pack objetivo y la caché KV del motor QVB8.
- GPU recomendadas: no disponibles de forma específica; el motor incluye kernels CUDA precompilados para DGX Spark (sm_121a) y V100 (sm_70).
- Cabe en GPU de consumo: sí, los 3,4 GB del drafter caben en cualquier GPU consumer con al menos 4 GB de VRAM, aunque el requisito real lo determina el pack objetivo emparejado.
- Opciones de despliegue: exclusivamente el motor QVB8 (v1.1.0 o posterior); no es cargable en `transformers`, llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del pack objetivo, del hardware y de la tasa de aceptación del drafter.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Tau | Licencia | Motor |
|---|---|---|---|---|---|
| Ripple-65B-Preview-DFlash2-QVB8R-5e-3 (este) | QVB8R | 3,4 GB | 5e-3 | Apache 2.0 | QVB8 |
| Ripple-65B-Preview-DFlash2-QVB8-5e-3 | QVB8 | 4,1 GB | 5e-3 | Apache 2.0 | QVB8 |
| Ripple-65B-Preview-QVB8R-1e-3 (pack objetivo) | QVB8R | 47 GB | 1e-3 | Apache 2.0 | QVB8 |
| Ripple-65B-Preview-QVB8R-2.5e-3 (pack objetivo) | QVB8R | 35,5 GB | 2,5e-3 | Apache 2.0 | QVB8 |

No se dispone de información sobre modelos borradores de decodificación especulativa comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: es un drafter que requiere un pack objetivo compatible y el motor QVB8; no funciona en `transformers` ni en otros motores de inferencia.
- La cota L∞ cubre solo los pesos almacenados; no garantiza que las respuestas sean idénticas a las del modelo original ni correctas. Diferencias de motor, tamaño de lote u orden de operaciones en coma flotante producen salidas ligeramente distintas incluso con pesos FP16 sin cuantizar.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación del modelo base.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar despliegues con ventanas largas sin verificación empírica.
- La licencia Apache 2.0 del paquete no aclara las condiciones del modelo base Ripple-65B-Preview-DFlash2; conviene verificar la licencia del modelo original antes de uso comercial.
- Dependencia de un ecosistema propietario: el rendimiento y las funcionalidades dependen de la evolución del motor QVB8 y de sus kernels CUDA por arquitectura de GPU.
- El número de parámetros reportado por safetensors (472.320) es coherente con un drafter pequeño, no con un modelo de 65B; no debe interpretarse como el tamaño del modelo base.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Motor QVB8: https://github.com/addiesam/qvb8
- Release del motor v1.1.0: https://github.com/addiesam/qvb8/releases/tag/v1.1.0
- Pack QVB8 equivalente (tau 5e-3): https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3
- Pack objetivo QVB8R (tau 1e-3): https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-1e-3
- Pack objetivo QVB8R (tau 2e-3): https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Pack objetivo QVB8R (tau 2.5e-3): https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2.5e-3
