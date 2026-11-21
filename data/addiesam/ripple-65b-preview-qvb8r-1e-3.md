# addiesam/Ripple-65B-Preview-QVB8R-1e-3

## Resumen

Ripple-65B-Preview-QVB8R-1e-3 es un paquete de pesos comprimidos del modelo de lenguaje Ripple-65B-Preview, desarrollado originalmente por ricursiveAI y comprimido por el usuario addiesam mediante la técnica QVB8R (QVB8 con codificación entrópica). No se trata de un modelo entrenado desde cero, sino de una versión cuantizada de un modelo base de 65.000 millones de parámetros (según su nombre) que se distribuye en un formato propietario diseñado para ejecutarse exclusivamente en el motor de inferencia QVB8, también del mismo autor.

La característica técnica central es la compresión con cota certificada en norma L∞: para cada peso restaurado, el error absoluto respecto al valor bf16 original es inferior a tau = 0,001. Este enfoque prioriza el control del error máximo por peso sobre el error medio, un planteamiento poco habitual en cuantización estándar, donde priman métricas agregadas como la perplejidad. El paquete ocupa 46,6 GB en disco y comprime 642 tensores con una media de 5,75 bits por peso.

Es relevante para desarrolladores que necesiten ejecutar modelos grandes en hardware limitado y que valoren garantías formales de error sobre los pesos, aunque con la contrapartida de depender de un motor de inferencia específico, no integrable con transformers, vLLM ni llama.cpp. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); el paquete usa el formato de compresion QVB8R |
| Parametros totales | 65B segun el nombre del modelo base; el recuento de safetensors del repo indica 1.664.080 (dato no representativo del modelo completo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8R (QVB8 con codificacion entropica), tau = 0,001; media de 5,75 bits por peso en los 642 tensores comprimidos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QVB8R (safetensors + manifest.json + escape_tables.json); no cargable en transformers |

## Arquitectura y entrenamiento

El modelo base Ripple-65B-Preview es un modelo de lenguaje de 65.000 millones de parámetros del que no se dispone de detalles arquitectónicos en la información proporcionada (tipo de atención, número de capas, composición del dataset de entrenamiento, uso de RLHF o DPO). Lo que sí está documentado es el proceso de compresión aplicado: cada matriz de pesos se empaqueta con un ancho de bits por fila y se verifica tras el empaquetado, registrando en manifest.json el error máximo (max_err) entre el valor restaurado y el peso bf16 original, tensor por tensor.

La innovación técnica destacable es la cota L∞ certificada: ningún tensor supera tau = 0,001 de error absoluto por peso. El empaquetado no utiliza datos de calibración, depende únicamente de los pesos. El paquete está certificado para restaurar tanto en fp16 como en bf16. La decodificación se apoya en un modelo borrador DFlash2 (paquete separado, tau = 5e-3, 3,4 GB en QVB8R) para decodificación especulativa, y el motor QVB8 v1.1.0 añade soporte multi-GPU en una máquina (--pipeline cuda:0,cuda:1), worker remoto para varias máquinas y offload de la caché KV a RAM del sistema (--kv-window / --kv-host).

## Capacidades

- Generación de texto y conversación (pipeline text-generation, etiqueta conversational).
- Razonamiento y generación de código: presumibles por tratarse de un LLM de 65B, aunque no se documentan evaluaciones específicas.
- Decodificación especulativa mediante el modelo borrador DFlash2, que acelera la generación al proponer tokens verificados por el modelo objetivo.
- Ejecución multi-GPU dentro de un mismo equipo y distribución en varias máquinas mediante worker remoto.
- Offload de la caché KV a memoria del sistema para ampliar la ventana efectiva de contexto en hardware con VRAM limitada.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- Tool calling, function calling, agentes y modo thinking: no disponibles (no documentados).

## Casos de uso

- Despliegue de un LLM de 65B en hardware de gama alta para consumo: el paquete de 46,6 GB permite cargar el modelo en una GPU de 48 GB o repartirlo entre varias GPUs con --pipeline, algo inviable con los pesos bf16 originales (unos 130 GB).
- Servicio de chat conversacional multi-turno: el motor admite offload de la caché KV a RAM del sistema, lo que permite mantener conversaciones largas cuando la VRAM es el cuello de botella.
- Generación de texto acelerada en producción: el uso conjunto del paquete objetivo y el borrador DFlash2 activa decodificación especulativa, reduciendo el coste por token en cargas interactivas.
- Evaluación de cuantización con garantías formales: investigadores que necesiten medir el impacto real de un error máximo acotado (tau = 0,001) frente a cuantizaciones basadas en métricas medias pueden usar este paquete como referencia controlada.
- Comparación de compromisos tamaño/precisión: la familia de paquetes del mismo modelo (tau 1e-3, 2e-3 y 2.5e-3, en formatos QVB8 y QVB8R) permite elegir el punto de la curva tamaño-perplejidad que mejor encaje con la VRAM disponible (desde 35,5 GB hasta 57 GB).
- Investigación sobre estabilidad de la inferencia: dado que la cota solo cubre los pesos y no las salidas, el paquete sirve para estudiar cómo las diferencias de orden en operaciones de coma flotante afectan a la coherencia del texto generado.
- Prototipado en estaciones de trabajo con varias GPUs: la ejecución multi-GPU y el worker remoto permiten montar un servidor de inferencia casero sin depender de un clúster dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el paquete pesa 46,6 GB, por lo que se necesita al menos esa cantidad de VRAM para cargarlo íntegramente en GPU; con offload de caché KV a RAM del sistema, el requisito de VRAM puede reducirse a costa de latencia.
- GPU recomendadas: A100 80 GB, H100 80 GB o varias GPUs de 24-48 GB combinadas mediante --pipeline (por ejemplo, dos RTX 4090 o dos A6000).
- No cabe en una GPU de consumo de 24 GB (RTX 4090) de forma íntegra; requiere reparto entre varias unidades o el uso de paquetes con mayor tau (el de 2.5e-3 en QVB8R ocupa 35,5 GB, todavía por encima de 24 GB).
- El motor incluye kernels CUDA precompilados para DGX Spark (sm_121a) y V100 (sm_70), lo que indica soporte explícito de estas plataformas.
- Opciones de despliegue: exclusivamente el motor QVB8 v1.1.0 o superior (github.com/addiesam/qvb8). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor de inferencia |
|---|---|---|---|---|---|
| Ripple-65B-Preview-QVB8R-1e-3 | 65B (nominal) | no disponible | QVB8R, 46,6 GB | Apache 2.0 | QVB8 (exclusivo) |
| Ripple-65B-Preview (bf16 original) | 65B (nominal) | no disponible | safetensors bf16 | no disponible | transformers y compatibles |
| Ripple-65B-Preview-QVB8R-2.5e-3 | 65B (nominal) | no disponible | QVB8R, 35,5 GB | Apache 2.0 | QVB8 (exclusivo) |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con modelos de otros desarrolladores.

## Limitaciones y advertencias

- El paquete no se carga en transformers ni en otros motores: requiere el motor QVB8 v1.1.0 o superior, lo que crea dependencia de una herramienta de un único autor y limita la portabilidad.
- La cota L∞ cubre únicamente los pesos almacenados; no garantiza que las respuestas sean idénticas a las del modelo original ni correctas. Diferencias de motor, tamaño de lote u orden de operaciones en coma flotante producen salidas distintas incluso con pesos fp16 exactos.
- El recuento de parámetros de safetensors del repo (1.664.080) no concuerda con el nombre del modelo (65B); conviene verificar la integridad del paquete antes de usarlo en producción.
- Riesgo de alucinación: inherente a los LLM; no se documentan evaluaciones específicas de fidelidad.
- Sesgos conocidos: no documentados; al no conocer la composición del dataset de entrenamiento del modelo base, no es posible evaluar sesgos de idioma, género o dominio.
- Idiomas soportados: no disponibles; no se puede garantizar calidad en castellano.
- Contexto máximo: no disponible; la ventana efectiva dependerá de la configuración de caché KV del motor.
- Licencia Apache 2.0 permite uso comercial, pero la práctica depende de la viabilidad técnica del motor QVB8 y de su propia licencia, no especificada en la información disponible.
- El modelo base es una versión "Preview", lo que sugiere posibles cambios o falta de soporte a largo plazo.

## Enlaces

- Hugging Face (este paquete): https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-1e-3
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Motor de inferencia QVB8: https://github.com/addiesam/qvb8
- Release del motor v1.1.0: https://github.com/addiesam/qvb8/releases/tag/v1.1.0
- Paquete QVB8 tau 1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-1e-3
- Paquete QVB8 tau 2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2e-3
- Paquete QVB8R tau 2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Paquete QVB8 tau 2.5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2.5e-3
- Paquete QVB8R tau 2.5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2.5e-3
- Borrador DFlash2 QVB8: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3
- Borrador DFlash2 QVB8R: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3
