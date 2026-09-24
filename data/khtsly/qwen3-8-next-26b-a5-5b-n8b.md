# khtsly/Qwen3.8-Next-26B-A5.5B-N8B

## Resumen

El repositorio `khtsly/Qwen3.8-Next-26B-A5.5B-N8B` es una publicación de pesos en formato safetensors subida por el usuario khtsly, no por la organización oficial Qwen. Su nombre sugiere una variante de la familia Qwen3.8 con arquitectura "Next" (presumiblemente MoE, dado el patrón de nomenclatura A5.5B, que indicaría 5,5B parámetros activos por token). Sin embargo, el recuento real de parámetros extraído de los ficheros safetensors es de 37.002.190.739, cifra que no coincide con los 26B que anuncia el nombre ni con ningún modelo oficial conocido de la familia.

El repositorio no incluye model card, pipeline declarado, licencia ni idiomas soportados, y acumula 0 descargas y 1 "like" en el momento de la consulta. El tamaño del repositorio (74,0 GB) es coherente con pesos en bf16 a 37B parámetros (37B × 2 bytes ≈ 74 GB), lo que apunta a un checkpoint de precisión completa sin cuantizar.

Los resultados de búsqueda disponibles describen modelos oficiales distintos: Qwen3.8-Flash-Next (125B parámetros, 51B embeddings N-gram, 6B activos por token, contexto de 262K, arquitectura Qwen4, multimodal) y la serie Qwen3.8 de QwenLM. No hay evidencia de que este repositorio corresponda a ninguno de ellos, por lo que debe tratarse como un artefacto no verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen4_exp` sugiere una variante experimental de la arquitectura Qwen4, sin confirmar) |
| Parámetros totales | 37.002.190.739 (según safetensors); el nombre indica 26B, dato contradictorio |
| Parámetros activos | no disponible (el nombre sugiere 5,5B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos publicados parecen bf16 sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 74,0 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creación | 2026-09-23 |
| Fecha de actualización | 2026-09-23 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura de este checkpoint en la model card ni en los resultados de búsqueda. El tag `qwen4_exp` apunta a que se trata de un experimento asociado a la arquitectura Qwen4, y el patrón de nomenclatura `26B-A5.5B-N8B` (total-activos-N, habitual en modelos MoE) sugiere una mezcla de expertos con aproximadamente 5,5B parámetros activos. Ninguno de estos extremos está confirmado por documentación oficial del repositorio.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Para contextualizar, los resultados de búsqueda sobre modelos oficiales de la familia mencionan que Qwen3.8-Flash-Next emplea 125B parámetros principales más 51B embeddings N-gram con 6B activos por token y 262K de contexto sobre arquitectura Qwen4, pero esta información corresponde a un modelo distinto y no debe extrapolarse a este repositorio.

## Capacidades

- No hay información verificable sobre las capacidades de este checkpoint concreto.
- No se puede confirmar generación de texto, razonamiento, código, matemáticas ni visión.
- No se puede confirmar soporte de tool calling ni function calling.
- No se puede confirmar soporte de agentes o razonamiento multi-paso.
- El tag `qwen4_exp` podría implicar capacidades propias de la familia Qwen4, pero es una inferencia no respaldada por documentación del repo.
- No se declara ni "thinking mode" ni capacidades multimodales.
- Idiomas soportados: sin declarar.

## Casos de uso

Dado que no existe información verificable sobre el comportamiento del modelo, los casos de uso que se enumeran a continuación son hipótesis condicionadas a que el checkpoint funcione y esté correctamente documentado, no recomendaciones basadas en evidencia:

- Evaluación interna de checkpoints experimentales: un equipo de investigación podría descargar el repositorio para inspeccionar la estructura de pesos, verificar el recuento de parámetros y comparar la configuración de expertos frente a otros MoE de la familia Qwen.
- Estudio de artefactos no oficiales: analizar por qué el nombre (26B-A5.5B) no coincide con el recuento real (37B) para documentar prácticas de publicación engañosas o erróneas en Hugging Face.
- Pruebas de compatibilidad de infraestructura: comprobar si los pesos cargan en vLLM, SGLang o transformers y si el formato safetensors es íntegro (74 GB, bf16).
- Base para cuantización propia: si el modelo funciona, un equipo podría generar versiones GGUF o AWQ internas y medir degradación, siempre asumiendo el riesgo de licencia desconocida.
- Desarrollo de pipelines de evaluación: usar el checkpoint como sujeto de pruebas de robustez, alucinación y sesgo dentro de un banco de evaluación propio.
- Auditoría de seguridad de la cadena de suministro: verificar si los ficheros contienen código malicioso, scripts de carga personalizados o dependencias no declaradas antes de integrarlos en un entorno corporativo.

En ningún caso se recomienda su uso en producción con clientes reales mientras no exista licencia, model card y evaluación de calidad publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de MMLU, HumanEval, GSM8K, MATH, MT-Bench ni ninguna otra métrica, y los resultados de búsqueda sobre la familia Qwen3.8 corresponden a modelos oficiales distintos, no a este checkpoint.

## Requisitos de hardware

Las estimaciones siguientes se derivan únicamente del recuento real de parámetros (≈37B) y del tamaño del repositorio en bf16 (74 GB). No hay datos de latencia ni throughput medidos para este checkpoint:

- Inferencia en bf16: se requieren aproximadamente 74 GB de VRAM solo para pesos, más memoria para caché KV y activaciones. No cabe en ninguna GPU de consumo.
- Inferencia en int8: en torno a 37 GB de VRAM, viable en una A100 80GB, H100 80GB o H200.
- Inferencia en int4: en torno a 19-20 GB de VRAM, viable en RTX 4090 (24 GB), L40S, A6000 o dos RTX 3090.
- GPU recomendadas: A100 80GB, H100 80GB, H200 para precisión completa o int8; RTX 4090, RTX 5090 o A6000 para int4.
- GPU de consumo: sí, en cuantización int4 y con margen ajustado en tarjetas de 24 GB; no en bf16.
- Despliegue: no hay confirmación de soporte en vLLM, llama.cpp, Ollama, TGI, SGLang ni transformers. Al no declararse arquitectura, es probable que las herramientas estándar fallen al cargar el checkpoint sin configuración manual.
- Latencia y throughput: no disponible.
- Almacenamiento: 74 GB para el repositorio completo más el espacio de la caché de conversión si se cuantiza.

## Comparativa con modelos similares

La comparación se realiza con los modelos mencionados en los resultados de búsqueda, advirtiendo que son artefactos distintos y que los datos de este repositorio son incompletos:

| Modelo | Parámetros | Activos | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| khtsly/Qwen3.8-Next-26B-A5.5B-N8B | 37B reales (26B según nombre) | no disponible | no disponible | no confirmada (`qwen4_exp`) | no disponible | 0 descargas, repo no verificado |
| Qwen/Qwen3.8-Flash-Next | 125B + 51B embeddings N-gram | 6B | 262K | Qwen4, multimodal MoE | no disponible en la búsqueda | oficial, en Hugging Face |
| Qwen/Qwen3-8B | 8B | no aplica | no disponible en la búsqueda | transformer denso | Apache 2.0 (habitual en la serie) | oficial, ampliamente descargado |

No se dispone de benchmarks comparativos para el checkpoint de khtsly, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripción, instrucciones de uso ni parámetros de generación recomendados.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido. En la práctica, esto implica que el uso en producción conlleva riesgo legal.
- Discrepancia entre nombre y contenido: el nombre indica 26B y A5.5B, pero los safetensors contienen 37B parámetros. Es una señal de falta de rigor o de nomenclatura engañosa.
- Origen no oficial: el autor es un usuario individual (khtsly), no la organización Qwen. No hay garantía de que los pesos deriven de un modelo oficial ni de que su entrenamiento haya sido trazable.
- Riesgo de seguridad: al ser un repositorio sin revisión, existe riesgo de ficheros con código de carga malicioso o pesos manipulados. Se recomienda inspección manual antes de ejecutar cualquier script.
- Sin datos de sesgos ni alineación: no se ha publicado información sobre RLHF, DPO ni filtrado de datos, por lo que el riesgo de alucinación, sesgo y contenido dañino es indeterminado.
- Compatibilidad incierta: al no declararse arquitectura, es probable que falle en cargadores estándar (transformers, vLLM, llama.cpp).
- Contexto e idiomas desconocidos: no se puede planificar su uso multilingüe ni en escenarios de contexto largo.
- Advertencia general: 0 descargas y 1 like sugieren que el checkpoint no ha sido validado por la comunidad. No debe usarse como base de decisiones técnicas o de producto sin una evaluación previa exhaustiva.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/khtsly/Qwen3.8-Next-26B-A5.5B-N8B
- GitHub oficial de la serie Qwen3.8 (contexto, no asociado a este repo): https://github.com/QwenLM/Qwen3.8
- Qwen/Qwen3.8-Flash-Next (modelo oficial relacionado por nombre): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Qwen3.8 en OpenLM.ai (contexto): https://openlm.ai/qwen3.8/
- Guía de Unsloth para Qwen3.8-Flash-Next (contexto de despliegue local): https://unsloth.ai/docs/models/qwen3.8-next
- Qwen/Qwen3-8B (referencia de la serie anterior): https://huggingface.co/Qwen/Qwen3-8B
