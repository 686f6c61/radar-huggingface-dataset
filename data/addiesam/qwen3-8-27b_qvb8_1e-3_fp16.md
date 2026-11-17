# addiesam/Qwen3.8-27B_qvb8_1e-3_fp16

## Resumen

Qwen3.8-27B_qvb8_1e-3_fp16 es un paquete de pesos comprimidos del modelo Qwen/Qwen3.8-27B, publicado por el investigador independiente addiesam (Dr. Addie Sam) bajo el formato propietario QVB8. No se trata de un modelo nuevo, sino de una compresión con cota de error L∞ certificada: cada peso restaurado difiere del original bf16 en menos de tau = 0.001, y el error maximo por tensor se verifica tras el empaquetado y se registra en `manifest.json` (`max_err`). El paquete ocupa 21,6 GB en disco, con 617 tensores comprimidos a una media de 6,22 bits por peso.

El modelo subyacente es Qwen3.8-27B, descrito en la model card como una arquitectura hibrida Gated-DeltaNet / attention con entrada de vision. La compresion se realiza sin datos de calibracion: depende unicamente de los pesos, con un ancho de bits por fila asignado a cada matriz. La licencia del paquete hereda la Apache-2.0 del modelo base.

La relevancia practica del paquete es que permite ejecutar un modelo de gran tamano en hardware mas modesto, pero con una restriccion critica: no es cargable en `transformers` ni en otros motores estandar. Requiere el QVB8 Inference Engine (v1.2.0 o superior), que decodifica los pesos comprimidos en la GPU dentro de sus propios kernels CUDA. El ecosistema es, por tanto, cerrado y dependiente de un unico motor mantenido por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Gated-DeltaNet / attention (modelo base Qwen3.8-27B) |
| Parametros totales | 4.850.416 (segun safetensors del repo; discrepancia con el nombre "27B" del modelo base, no aclarada en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8 con tau = 1e-3; media de 6,22 bits por peso en los 617 tensores comprimidos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | QVB8 (no compatible con safetensors estandar ni GGUF; requiere QVB8 Inference Engine) |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo: comprime los pesos del Qwen3.8-27B original. La arquitectura del modelo base se describe como hibrida Gated-DeltaNet / attention, con capacidad de entrada de vision. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

La innovacion tecnica del paquete es el esquema de compresion con cota L∞. Cada matriz de pesos se empaqueta con un ancho de bits por fila, y tras el empaquetado se verifica tensor por tensor que el error maximo entre el valor restaurado y el peso bf16 original no supere tau. El error maximo encontrado se almacena en `manifest.json` (`max_err`); para este paquete, el mayor error registrado es 0.001000. La compresion no usa datos de calibracion y depende solo de los pesos. El paquete esta certificado para fp16 (`restore: fp16`), por lo que debe ejecutarse con `--dtype fp16`.

El autor justifica el enfoque L∞ frente a la cuantizacion tradicional: una metrica promedio (perplejidad, benchmark) puede ocultar pesos con error grande, y un error grande en el peso equivocado puede alterar un token concreto. La cota controla el peor caso, no la media. No obstante, la propia model card advierte de que la cota cubre solo los pesos almacenados y no garantiza que las respuestas sean identicas a las del original ni correctas: diferencias de motor, tamano de batch y orden de operaciones en coma flotante producen salidas ligeramente distintas.

## Capacidades

- Generacion de texto y conversacion (pipeline `text-generation`, tag `conversational`).
- Entrada de vision, segun la descripcion del modelo base en la model card.
- Arquitectura hibrida Gated-DeltaNet / attention, orientada a modelar secuencias largas (sin datos concretos de contexto).
- Decodificacion especulativa mediante un modelo draft emparejado (DFlash2), con `DRAFT_K=7` en el launcher proporcionado.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue de un modelo de gran tamano en hardware limitado: el paquete de 21,6 GB con cota de error controlada permite servir el modelo en GPUs con menos VRAM que la requerida por los pesos bf16 originales, usando el motor QVB8 y `--dtype fp16`.
- Investigacion sobre compresion con garantias: util para estudiar el efecto de una cota L∞ estricta (tau = 1e-3) en la calidad de salida frente a cuantizaciones basadas en metricas promedio, comparando con los otros paquetes del mismo autor (qvb8r con tau = 2e-3, 13,6 GB).
- Servicio de chat conversacional: el pipeline declarado es `text-generation` con tag `conversational`, y el launcher del motor arranca un servidor en el puerto 8080 con `./qvb8 start qwen-27b`, adecuado para prototipos de atencion al cliente o asistentes internos.
- Aceleracion con decodificacion especulativa: el uso conjunto del paquete objetivo y el draft DFlash2 (1,5 GB, tau = 5e-3) con `DRAFT_K=7` esta pensado para reducir la latencia de generacion en el motor QVB8.
- Tareas que combinen texto e imagen: si se confirma la entrada de vision del modelo base, el paquete serviria para prototipos de descripcion de imagenes o extraccion de informacion de documentos, siempre dentro del motor QVB8.
- Reproducibilidad de experimentos de compresion: el registro de `max_err` por tensor en `manifest.json` permite auditar la fidelidad de los pesos restaurados en cada despliegue, util en entornos de investigacion que exigen trazabilidad del error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de compresion: 617 tensores comprimidos, media de 6,22 bits por peso, tamano en disco de 21,6 GB y error maximo de 0.001000 frente a tau = 0.001. No se proporcionan cifras de perplejidad, MMLU, HumanEval ni GSM8K, ni del modelo base ni del paquete comprimido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El paquete ocupa 21,6 GB en disco; el motor decodifica los pesos en la GPU, por lo que se necesita VRAM suficiente para los pesos decodificados en fp16 mas el overhead del motor y la cache KV (sin cifras publicadas).
- GPU recomendadas: no disponible. El autor menciona que necesita maquinas para probar "otras generaciones de GPU", lo que indica que la cobertura de hardware validada es limitada.
- Compatibilidad con GPU de consumo: no confirmada. El paquete de 21,6 GB y la decodificacion en fp16 hacen improbable su ajuste en GPUs de 24 GB o menos, pero no hay datos oficiales.
- Opciones de despliegue: exclusivamente el QVB8 Inference Engine (v1.2.0 o superior), instalado con `./install.sh` desde github.com/addiesam/qvb8. No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no disponibles. El uso de decodificacion especulativa con DFlash2 (`DRAFT_K=7`) sugiere que el motor soporta aceleracion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Qwen3.8-27B_qvb8_1e-3_fp16 (este paquete) | 4.850.416 segun safetensors; nombre del base "27B" | no disponible | QVB8, 21,6 GB, tau 1e-3 | Apache-2.0 | Solo QVB8 Inference Engine |
| Qwen3.8-27B_qvb8r_2e-3_fp16 (mismo autor) | mismo modelo base | no disponible | QVB8R, 13,6 GB, tau 2e-3 | Apache-2.0 | Solo QVB8 Inference Engine |
| Qwen/Qwen3.8-27B (original) | segun autor, "27B" | no disponible | bf16 | Apache-2.0 | `transformers`, vLLM, TGI, etc. |
| Qwen3.5-9B_qvb8_1e-3_fp16 (mismo autor) | no disponible | no disponible | QVB8, 7,6 GB, tau 1e-3 | Apache-2.0 | Solo QVB8 Inference Engine |

La comparativa con alternativas de otros autores no esta disponible en la informacion proporcionada. La diferencia principal entre los paquetes del mismo autor es el compromiso tamano/error: tau = 1e-3 con 21,6 GB frente a tau = 2e-3 con 13,6 GB.

## Limitaciones y advertencias

- Dependencia total del motor QVB8: el paquete no carga en `transformers` ni en ningun otro motor estandar. Si el proyecto github.com/addiesam/qvb8 deja de mantenerse, el paquete queda inutilizable.
- La cota L∞ cubre solo los pesos almacenados: no garantiza que las respuestas sean identicas a las del modelo original ni correctas. Diferencias de motor, batch y orden de operaciones en coma flotante producen salidas distintas incluso con pesos fp16 exactos.
- Discrepancia de parametros: el nombre del modelo base indica "27B" pero el recuento de safetensors del repo es 4.850.416. La informacion disponible no aclara esta diferencia; conviene verificarla antes de planificar el despliegue.
- Sin datos de benchmarks, contexto, idiomas ni tool calling: no es posible evaluar la calidad del modelo base ni del paquete comprimido con cifras publicadas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan los del modelo base, sobre el que tampoco se aportan datos.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantia alguna ("No warranty is given"); el disclaimer completo esta en el README del motor.
- Madurez del ecosistema: primera release del paquete (15-11-2026), 49 descargas y 1 like; el propio autor solicita hardware para validar en mas generaciones de GPU, lo que indica cobertura de hardware aun limitada.
- Descarga completa obligatoria: hay que descargar el repositorio entero (incluido `escape_tables.json` junto a `manifest.json`), no ficheros sueltos.

## Enlaces

- Hugging Face: https://huggingface.co/addiesam/Qwen3.8-27B_qvb8_1e-3_fp16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor de inferencia QVB8: https://github.com/addiesam/qvb8
- Paquete alternativo qvb8r tau 2e-3: https://huggingface.co/addiesam/Qwen3.8-27B_qvb8r_2e-3_fp16
- Modelo draft DFlash2: https://huggingface.co/addiesam/Qwen3.8-27B-DFlash2_qvb8r_5e-3_fp16
- Paquete Qwen3.5-9B: https://huggingface.co/addiesam/Qwen3.5-9B_qvb8_1e-3_fp16
- Modelo draft Qwen3.5-9B: https://huggingface.co/addiesam/Qwen3.5-9B-DFlash_qvb8_1e-3
- Paper I (contrato e indice Virtual-Band): https://doi.org/10.5281/zenodo.23815007
- Paper II (compresion de pesos, cache KV y activaciones): https://doi.org/10.5281/zenodo.23816044
- Patrocinio del autor: https://github.com/sponsors/addiesam
