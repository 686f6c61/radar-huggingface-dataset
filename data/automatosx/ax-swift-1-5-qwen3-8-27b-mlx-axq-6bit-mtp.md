# AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-6bit-MTP

## Resumen

AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-6bit-MTP es una cuantización de precisión mixta, publicada por AutomatosX, del checkpoint BF16 ukisai/Swift-1.5-Qwen3.8-27b. El artefacto empaqueta los pesos en formato AXQ (affine quantization) con un presupuesto nominal de 6 bits y protección de tensores sensibles en 8 bits y bf16, lo que da un almacenamiento medido de 7,800057 bits por peso (BPW) y 25,2268 GiB de pesos. Está pensado exclusivamente para el stack MLX de Apple (Metal), no para CUDA ni para llama.cpp.

El modelo base pertenece a la familia Qwen3.5 (tag `qwen3_5` en el Hub) con 27.356.723.952 parámetros totales, lo que lo sitúa en la gama de 27B densos. La model card no documenta arquitectura interna, longitud de contexto ni composición del dataset de entrenamiento del modelo original; solo describe el proceso de cuantización y las comprobaciones de carga realizadas.

La relevancia de esta ficha es acotada y conviene subrayarlo: el autor la etiqueta explícitamente como "research development artifact, not certified". No hay benchmarks de calidad, ni verificación de comportamiento de visión, ni evidencia de ejecución o aceleración del módulo MTP (multi-token prediction) incluido. Los únicos resultados reportados son dos smokes de texto corto (una operación aritmética que devuelve `42` y una salida de palabra exacta `READY`) sobre MLX-VLM 0.7.9 / MLX 0.32.4 en `Device(gpu, 0)`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base etiquetado como `qwen3_5`; sin detalle de transformer/MoE en la model card) |
| Parámetros totales | 27.356.723.952 |
| Parámetros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | AXQ affine 6-bit con protección mixta: 87,2070 % de parámetros en 6 bits, 5,0199 % en 8 bits, 7,7731 % en bf16; 7,800057 BPW medidos |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License v1.0 (con avisos Apache-2.0 retenidos del upstream) |
| Formato de pesos | safetensors (librería `mlx`; plan de cuantización en `axquant_plan.json`) |

## Arquitectura y entrenamiento

No hay información en la documentación proporcionada sobre la arquitectura del modelo base más allá de la etiqueta `qwen3_5` y del pipeline `text-generation`. Se desconoce si emplea atención completa, atención lineal, mezcla de expertos o alguna variante híbrida, así como el número de tokens de entrenamiento, la composición del corpus o si hubo fases de RLHF/DPO. Cualquier afirmación al respecto sería especulativa.

Lo que sí está documentado es el proceso de cuantización. El artefacto se convirtió desde una revisión inmutable del checkpoint BF16 original (`b4c84d42903a8646b25857eb2827288d92ed85a4`) aplicando un plan de precisión mixta: la mayor parte del peso (24.227.348.480 parámetros) se empaqueta en 6 bits affine, un 5 % aproximadamente se protege en 8 bits (1.394.606.080 parámetros) y un 7,77 % se mantiene en bf16 (2.159.473.392 parámetros). El autor advierte que esto no es MXFP6 ni un checkpoint uniforme de 6 bits. Se incluye además un payload MTP protegido, cuyo manifiesto de procedencia está en `axquant_mtp_sidecar_manifest.json`, pero cuya ejecución, tasa de aceptación y ganancia de velocidad no han sido verificadas. También se retiene un sidecar de visión que, según la model card, no constituye una exportación de runtime de visión validada.

## Capacidades

- Generación de texto conversacional: es la única capacidad con evidencia empírica en esta revisión, y solo a nivel de smoke test corto.
- Razonamiento aritmético básico: el smoke documentado produce `42` en una operación aritmética simple.
- Seguimiento de instrucciones de formato: el smoke documentado produce la palabra exacta `READY`.
- MTP (multi-token prediction): los pesos están empaquetados, pero no hay verificación de ejecución ni de aceleración; el sufijo `-MTP` describe el contenido del paquete, no una prestación medida.
- Visión: los pesos del torre de visión están presentes como sidecar, pero la ruta de carga de texto probada desactiva la torre no indexada; la inferencia de imagen no está soportada por esa ruta.
- Tool calling / function calling: no disponible en la documentación.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la documentación.
- Capacidades multilingües: no disponibles en la documentación (el campo de idiomas del Hub está vacío).

## Casos de uso

- Evaluación de cuantización en Apple Silicon: usar el checkpoint para medir el impacto real del esquema AXQ 6-bit mixto frente al BF16 de origen en tareas de texto corto, aprovechando que el autor publica el plan de cuantización y el presupuesto de bits por módulo.
- Prototipado local en Mac para generación de texto: integrar el modelo vía MLX-VLM en flujos de desarrollo que requieran un modelo de ~27B en memoria unificada de Apple, aceptando que solo hay evidencia de carga y generación de texto acotada.
- Investigación sobre empaquetado de precisión mixta: analizar la distribución 6/8/bf16 y los overrides por módulo en `config.json` y `axquant_plan.json` para estudiar qué tensores requieren protección y por qué.
- Validación de reproducibilidad de artefactos: el manifiesto liga ficheros, plan de precisión, ejecución del cuantizador y comprobaciones de compatibilidad de runtime, lo que permite auditar la cadena de procedencia fijando el commit inmutable del Hub.
- Pruebas de compatibilidad de runtimes MLX: contrastar el comportamiento entre MLX-VLM (con smoke reportado) y MLX-LM (no probado), documentando qué rutas de carga funcionan y cuáles no para esta revisión concreta.
- Base para experimentos de MTP: dado que el payload MTP está incluido pero sin verificar, sirve como punto de partida para quien quiera medir por su cuenta la tasa de aceptación y la aceleración, sin asumir ningún resultado previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "No quality benchmark or certificate for this revision" y aclara que las placas de benchmark del upstream y las mediciones de otros modelos AXQ no son transferibles a este checkpoint.

| Prueba reportada | Runtime | Resultado |
|---|---|---|
| Smoke aritmético (texto) | MLX-VLM 0.7.9 / MLX 0.32.4, `Device(gpu, 0)` | `42` |
| Smoke de palabra exacta (texto) | MLX-VLM 0.7.9 / MLX 0.32.4, `Device(gpu, 0)` | `READY` |
| Calidad de código | — | No verificada |
| Contexto largo | — | No verificado |
| Visión / vídeo | — | No verificado |
| Ejecución y velocidad MTP | — | No verificadas |

## Requisitos de hardware

- Almacenamiento de pesos: 27.087.090.027 bytes (25,2268 GiB) según el manifiesto. El repositorio completo ocupa 27,1 GB.
- Memoria en tiempo de ejecución: no disponible. La model card advierte que los bytes de peso no determinan el pico de memoria en runtime; hay que sumar KV cache, buffers de activación y overhead del runtime MLX.
- GPU: el artefacto está orientado a Apple Silicon con Metal a través de MLX. No hay soporte declarado para CUDA (A100, H100, RTX 4090) en esta revisión.
- GPU de consumo: teóricamente viable en Mac con memoria unificada suficiente para ~25 GiB de pesos más overhead, pero no se documenta ninguna configuración mínima probada.
- Opciones de despliegue: MLX-VLM (única ruta con smoke reportado). MLX-LM no probado. AX Engine no medido. `omlx` y `mtplx` declarados como no soportados, sin afirmación de carga, generación ni MTP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Runtime | Licencia | Evidencia de calidad |
|---|---|---|---|---|---|---|
| AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-6bit-MTP | 27,36B | No disponible | AXQ 6-bit mixto (7,80 BPW) | MLX (Apple) | Swift Open License v1.0 | Solo smokes de texto |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27,36B (implícito) | No disponible | BF16 | No disponible | No disponible en esta información | No disponible |
| Alternativas de ~27B en MLX | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa con alternativas concretas de la misma categoría (mismo tamaño o misma tarea) en el material proporcionado. Cualquier comparación numérica sería inventada.

## Limitaciones y advertencias

- Artefacto de desarrollo no certificado: el propio autor lo etiqueta como "research development artifact, not certified". No debe tratarse como un checkpoint listo para producción.
- Ausencia total de benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica. La única evidencia es que el modelo carga y genera texto corto en una configuración concreta.
- MTP no verificado: el sufijo `-MTP` no implica aceleración medida. La ejecución, la tasa de aceptación y la ganancia de velocidad están sin comprobar.
- Visión no operativa en la ruta probada: la ruta de carga de texto desactiva la torre de visión no indexada; la inferencia de imagen no está soportada por esa ruta y el sidecar retenido no es una exportación de runtime validada.
- Compatibilidad de runtime muy restringida: solo MLX-VLM tiene smoke reportado. `omlx` y `mtplx` están declarados no soportados. No se debe inferir equivalencia desde MLX-VLM a MLX-LM.
- Licencia con restricción comercial: la Swift Open License v1.0 no autoriza uso comercial a entidades legales con ingresos brutos de 1.000.000 USD o más en su último ejercicio fiscal. Verificar el texto completo en `LICENSE` antes de cualquier despliegue.
- Idiomas no declarados: el campo de idiomas del Hub está vacío y la model card no especifica cobertura lingüística; el comportamiento multilingüe es desconocido.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar cargas de trabajo con ventanas largas.
- Riesgo de alucinación y sesgos: no evaluados en esta revisión; sin benchmarks ni evaluaciones de seguridad publicadas, no hay base para estimarlos.
- No sustituir variantes silenciosamente: el autor advierte que cualquier exportación específica de runtime (índice, norma o layout de n-gramas) es un artefacto distinto que requiere su propia validación de carga y generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-MLX-AXQ-6bit-MTP
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Revisión inmutable del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/tree/b4c84d42903a8646b25857eb2827288d92ed85a4
- Licencia Swift Open License v1.0: `LICENSE` en el repositorio del modelo
- Avisos Apache-2.0 retenidos: `LICENSE-APACHE-2.0` y `NOTICE` en el repositorio del modelo
- Plan de cuantización: `axquant_plan.json` en el repositorio del modelo
- Registro de compatibilidad de runtime: `axquant_compatibility.json` en el repositorio del modelo
- Manifiesto de procedencia MTP: `axquant_mtp_sidecar_manifest.json` en el repositorio del modelo
