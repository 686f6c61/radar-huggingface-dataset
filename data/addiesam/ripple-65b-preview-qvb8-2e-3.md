# addiesam/Ripple-65B-Preview-QVB8-2e-3

## Resumen

Ripple-65B-Preview-QVB8-2e-3 es un paquete de pesos cuantizados del modelo de lenguaje Ripple-65B-Preview, desarrollado originalmente por ricursiveAI y comprimido por el usuario addiesam mediante la herramienta QVB8. No se trata de un modelo entrenado desde cero, sino de una versión comprimida del modelo base en bf16, empaquetada específicamente para el motor de inferencia QVB8. El paquete aplica una compresión con cota certificada en norma L∞ (tau = 0.002), lo que garantiza que cada peso restaurado difiere del original en menos de esa cantidad, a diferencia de la cuantización tradicional que solo controla el error medio.

El modelo base declarado es Ripple-65B-Preview, del que se deduce un tamaño nominal de 65.000 millones de parámetros, aunque el repositorio de safetensors reporta 1.664.080 parámetros en sus tensores, un dato que no concuerda con el nombre del modelo y que conviene tratar con cautela. El paquete ocupa 49,1 GB en disco y comprime 642 tensores con una media de 6,06 bits por peso. La licencia es Apache 2.0.

Su relevancia radica en el enfoque de compresión certificada: en lugar de optimizar una métrica agregada como la perplejidad, el formato QVB8 acota el error máximo por peso y lo verifica tensor a tensor tras el empaquetado, almacenando el error máximo en `manifest.json`. Esto resulta útil en producción cuando un único peso con error grande puede alterar un token y producir una salida incorrecta. La contrapartida es que el paquete no es cargable en `transformers` ni en otros motores estándar: requiere el motor QVB8 v1.1.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Ripple-65B-Preview; arquitectura no documentada en la informacion) |
| Parametros totales | 65B nominales segun el nombre del modelo base; 1.664.080 segun los safetensors del repo (dato discrepante) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8 con tau = 0.002; media de 6,06 bits por peso en 642 tensores comprimidos; certificado para fp16 y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QVB8 (safetensors empaquetados, no cargables en transformers); requiere motor QVB8 v1.1.0+ |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Ripple-65B-Preview (tipo de transformer, atencion, capas, datos de entrenamiento, tokens vistos, uso de RLHF o DPO). La model card del paquete cuantizado no describe el modelo original, solo el proceso de compresion.

El proceso de compresion QVB8 sí está documentado: cada matriz de pesos se empaqueta con un ancho de bits por fila y se verifica después del empaquetado, registrando el error máximo entre el valor restaurado y el peso bf16 original por tensor en `manifest.json` (campo `max_err`). Ningún tensor supera tau = 0.002. El empaquetado no usa datos de calibración: depende únicamente de los pesos. El paquete incluye un archivo `escape_tables.json` con los pesos almacenados de forma exacta, que cubre lo que necesitan fp16 y bf16. El motor QVB8 decodifica los pesos comprimidos en la GPU dentro de sus propios kernels CUDA, lo que permite ejecutar un modelo grande en hardware modesto.

## Capacidades

- Generacion de texto y conversacion (pipeline `text-generation`, tag `conversational`), segun los metadatos del repositorio.
- No se documentan capacidades especificas de razonamiento, codigo, matematicas, vision o audio en la informacion disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni lista de idiomas.
- No se documenta modo de pensamiento (thinking mode) ni otras capacidades especiales.
- La decodificacion especulativa es posible mediante los paquetes DFlash2 draft del mismo autor, que se pasan al motor como `DRAFT` junto al paquete objetivo como `MODEL`.

## Casos de uso

- Despliegue de un modelo de 65B en hardware con VRAM limitada: el motor QVB8 decodifica los pesos en kernels CUDA propios y el paquete de 49,1 GB permite ejecutar el modelo en GPUs que no alojarian los pesos en bf16 (unos 130 GB). Adecuado cuando se necesita un modelo grande con presupuesto de memoria ajustado.
- Inferencia con garantia de error acotado: en entornos donde una salida corrupta por un peso mal cuantizado es inaceptable, la cota L∞ de tau = 0.002 permite auditar el error máximo por tensor a traves de `manifest.json` antes de desplegar.
- Servicio de chat multi-turno: el motor v1.1.0 incluye un servidor con cliente de chat en terminal y soporte de offload de la cache KV a RAM del sistema (`--kv-window` / `--kv-host`), lo que permite mantener conversaciones largas cuando la VRAM es escasa.
- Despliegue multi-GPU en una sola maquina: el motor permite repartir el modelo con `--pipeline cuda:0,cuda:1`, util para servir el paquete en estaciones con dos o mas GPUs.
- Despliegue distribuido entre maquinas: el motor v1.1.0 incluye un stage worker remoto para repartir la inferencia entre varios equipos, aplicable a clusters pequenos que quieran servir el modelo sin una GPU de gran memoria.
- Aceleracion con decodificacion especulativa: combinando este paquete objetivo con un paquete DFlash2 draft (3,4-4,1 GB) se puede reducir la latencia de generacion en el motor QVB8.
- Evaluacion comparativa de compresion: los seis paquetes objetivo (tau 1e-3, 2e-3 y 2,5e-3, en formatos qvb8 y qvb8r) permiten medir en produccion el compromiso entre tamano de archivo y calidad de salida con una cota de error conocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el paquete ocupa 49,1 GB en disco; el motor decodifica los pesos en la GPU, por lo que se necesita VRAM suficiente para los pesos decodificados mas la cache KV. No se especifica el consumo exacto de VRAM en la informacion disponible.
- GPU recomendadas: no se indican modelos concretos. El motor v1.1.0 incluye kernels CUDA precompilados para DGX Spark (sm_121a) y V100 (sm_70), lo que confirma soporte para esas plataformas.
- GPU de consumo: no se confirma que quepa en GPUs de consumo; el tamano del paquete (49,1 GB) supera la VRAM de la mayoria de tarjetas consumer, aunque el offload de cache KV a RAM del sistema y el reparto multi-GPU del motor pueden ayudar.
- Opciones de despliegue: exclusivamente el motor QVB8 v1.1.0 o superior (https://github.com/addiesam/qvb8). No es compatible con transformers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El uso de un paquete DFlash2 draft con decodificacion especulativa puede reducirlos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Ripple-65B-Preview-QVB8-2e-3 | 65B nominales (1.664.080 segun safetensors) | no disponible | QVB8, 49,1 GB | Apache 2.0 | QVB8 v1.1.0+ |
| Ripple-65B-Preview-QVB8-1e-3 | 65B nominales | no disponible | QVB8, 57 GB | Apache 2.0 | QVB8 v1.1.0+ |
| Ripple-65B-Preview-QVB8R-2e-3 | 65B nominales | no disponible | QVB8R, 38 GB | Apache 2.0 | QVB8 v1.1.0+ |
| Ripple-65B-Preview (bf16) | 65B nominales | no disponible | bf16, ~130 GB | Apache 2.0 | transformers y otros |

La comparativa con modelos de otras familias no esta disponible: no se han publicado datos de rendimiento que permitan situar este paquete frente a alternativas de tamano similar. Dentro de la propia familia, el paquete 2e-3 ofrece un equilibrio intermedio entre el 1e-3 (57 GB, cota mas estricta) y el 2,5e-3 (48 GB, cota mas laxa), mientras que la variante QVB8R reduce el tamano a 38 GB con la misma cota.

## Limitaciones y advertencias

- No es cargable en transformers ni en motores estandar: solo funciona con el motor QVB8 v1.1.0 o superior, lo que limita la portabilidad y ata el despliegue a un proyecto de un unico autor.
- La cota L∞ cubre unicamente los pesos almacenados; no garantiza que las respuestas del modelo sean identicas a las del original ni que sean correctas. Diferencias en motor, tamano de lote u orden de operaciones en coma flotante producen salidas ligeramente distintas.
- Discrepancia de datos: el nombre del modelo indica 65B parametros, pero los safetensors del repositorio reportan 1.664.080 parametros. Conviene verificar el modelo base antes de asumir capacidades o requisitos de memoria.
- No se dispone de informacion sobre sesgos, idiomas soportados, riesgo de alucinacion ni evaluaciones de calidad del modelo base.
- El modelo base es una version "Preview", lo que sugiere que puede no ser una version final estable.
- La licencia Apache 2.0 permite uso comercial, pero el autor del paquete no ofrece garantias sobre el comportamiento del modelo comprimido en produccion.
- El ecosistema del motor QVB8 es muy reciente (v1.1.0 publicada el 2026-11-11) y con pocas descargas (312), lo que implica un riesgo de soporte y madurez bajo.
- No se documenta la longitud de contexto, por lo que no se puede planificar el uso en tareas de contexto largo.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2e-3
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Motor QVB8: https://github.com/addiesam/qvb8
- Release del motor v1.1.0: https://github.com/addiesam/qvb8/releases/tag/v1.1.0
- Paquete QVB8 tau 1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-1e-3
- Paquete QVB8R tau 1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-1e-3
- Paquete QVB8R tau 2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Paquete QVB8 tau 2,5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2.5e-3
- Paquete QVB8R tau 2,5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2.5e-3
- Draft DFlash2 QVB8 tau 5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3
- Draft DFlash2 QVB8R tau 5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3
