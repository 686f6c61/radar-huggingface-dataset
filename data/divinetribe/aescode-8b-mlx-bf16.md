# divinetribe/AesCode-8B-MLX-bf16

## Resumen

AesCode-8B es un modelo multimodal de generación de código especializado en producir artefactos visuales ricos en información (presentaciones, pósteres, paneles de control, informes) como HTML/CSS estructurado, editable y verificable. Lo desarrolla Microsoft a partir de Qwen3-VL-8B-Instruct y se distribuye bajo licencia Apache-2.0. La ficha que nos ocupa, `divinetribe/AesCode-8B-MLX-bf16`, es una conversión a formato MLX en bf16 (sin cuantización) realizada por el usuario divinetribe para ejecutar el modelo de forma nativa en Apple Silicon mediante la librería mlx-vlm.

El modelo parte de la arquitectura `Qwen3VLForConditionalGeneration`, con una torre de visión `qwen3_vl` que alimenta un decodificador de texto `qwen3_vl_text`, y suma 8.767.123.696 parámetros (8,8B). Su entrenamiento combina SFT de arranque en frío con GDPO sobre siete canales de recompensa, separando requisitos semánticos de señales visuales mediante supervisión estructurada en grafo y recompensas multimodales desacopladas.

La relevancia de esta conversión concreta radica en que preserva la torre de visión intacta y todos los pesos en bf16 original, con 750 tensores repartidos en cuatro shards (17,5 GB), lo que permite a desarrolladores con hardware Apple ejecutar el modelo completo sin pérdida de calidad, a diferencia de las variantes de 8 y 4 bits que sacrifican precisión a cambio de menor huella de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (torre de visión `qwen3_vl` + decodificador `qwen3_vl_text`) |
| Parámetros totales | 8.767.123.696 (8,8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Esta build: bf16 sin cuantización; existen variantes 8-bit y 4-bit en repos separados |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 750 tensores en cuatro shards, 17,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal denso de 8,8B parámetros construido sobre Qwen3-VL-8B-Instruct. La torre de visión procesa imágenes y capturas de pantalla y las proyecta al decodificador de texto, que genera HTML/CSS y texto asociado (por ejemplo, alt-text). La conversión de divinetribe mantiene la torre de visión intacta y conserva cada peso en bf16 original, empaquetado para mlx-vlm en Apple Silicon.

El entrenamiento descrito en la model card parte de Qwen3-VL-8B-Instruct y aplica SFT de arranque en frío seguido de GDPO (optimización de preferencias con recompensas desacopladas) sobre siete canales de recompensa. La innovación destacable es la separación de requisitos semánticos y señales visuales mediante supervisión estructurada en grafo y recompensas multimodales desacopladas, orientada a que el modelo cumpla tanto restricciones de contenido como de disposición visual en el código generado. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de código HTML/CSS a partir de una imagen, captura de pantalla o diseño de referencia.
- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`).
- Creación de artefactos visuales estructurados: presentaciones, pósteres, paneles de control e informes.
- Generación de alt-text descriptivo a partir de imágenes.
- Razonamiento visual básico sobre contenido de imágenes (por ejemplo, control de calidad de poses en fotogramas).
- Uso en modo solo texto con `num_images=0` y sin argumento `image=`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Reconstrucción de interfaces desde capturas: se introduce una screenshot y el modelo devuelve un único archivo HTML con el diseño replicado, útil para migrar prototipos a código editable.
- Generación de presentaciones e infografías: a partir de un prompt descriptivo, el modelo produce HTML/CSS con estructura de diapositivas o bloques informativos verificables.
- Creación de pósteres y material de marketing: el modelo genera composiciones visuales en HTML/CSS que pueden renderizarse y editarse sin herramientas de diseño propietarias.
- Paneles de control y informes: construcción de dashboards con disposición de datos y estilos definidos en código, adecuados para integrarse en pipelines de generación documental.
- Generación automática de alt-text: dado un recurso gráfico, el modelo describe su contenido en texto, lo que facilita la accesibilidad de catálogos de imágenes.
- Control de calidad visual: verificación de fotogramas o imágenes (por ejemplo, comprobar si una pose dibujada es anatómicamente plausible o si faltan extremidades) en flujos de validación automatizada.
- Desarrollo local en Apple Silicon: al ejecutarse con mlx-vlm en bf16, permite prototipar generación de código visual en un Mac sin depender de servicios en la nube.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación propia del paper de AesCode: 300 prompts de infografía puntuados en una pista programática `Rule` (Text, Bound, Chart) y una lista de verificación `Visual` (Content, Layout, Style), con `Overall` como media de ambas, promediado sobre tres generaciones sin selección.

| Modelo | Overall | Rule | Notas |
|---|---|---|---|
| AesCode-8B | 82,94 | 90,07 | +31,1 puntos en Visual sobre Qwen3-VL-8B de referencia |
| GPT-5.5 (con referencia) | 81,28 | no disponible | Fila de la misma tabla del paper |
| Claude Opus 4.8 (con referencia) | 80,39 | no disponible | Fila de la misma tabla del paper |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory para esta build bf16: aproximadamente 17,5 GB de pesos, más overhead de ejecución; se recomienda disponer de al menos 24 GB de memoria unificada.
- Variante 8-bit: aproximadamente la mitad del tamaño, pensada para máquinas de 16 GB.
- Variante 4-bit: la más pequeña, pensada para máquinas de 8 GB.
- Hardware objetivo: Apple Silicon con mlx-vlm; no se documentan GPU NVIDIA ni CUDA para esta conversión.
- Despliegue: librería mlx-vlm (Python), con `load`, `apply_chat_template` y `generate`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-8B (esta conversión MLX bf16) | 8,8B | no disponible | Visión + generación de código HTML/CSS | Apache-2.0 | Hugging Face (MLX bf16, 8-bit, 4-bit) |
| Qwen3-VL-8B-Instruct | 8B | no disponible | Visión-lenguaje general | no disponible en la información | Hugging Face |
| GPT-5.5 | no disponible | no disponible | Propietario, multimodal | Propietaria | API |
| Claude Opus 4.8 | no disponible | no disponible | Propietario, multimodal | Propietaria | API |

En la evaluación de AesCode, el modelo de 8B supera en Overall a GPT-5.5 y Claude Opus 4.8 en la tarea específica de generación de infografías; se trata de una comparación limitada a esa tarea y no extensible a capacidades generales.

## Limitaciones y advertencias

- La evaluación disponible se limita a la tarea propia de generación de infografías (300 prompts); no hay datos de rendimiento general.
- El ejemplo de control de calidad de pose incluido en la model card muestra un error real (coloca las manos en la cintura en lugar de en guardia alta), lo que indica que el razonamiento visual puede ser impreciso.
- Riesgo de alucinación en la descripción de imágenes y en la fidelidad del HTML/CSS generado respecto al diseño de referencia.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe adecuado.
- Longitud de contexto no disponible; puede limitar conversaciones multi-turno o documentos extensos.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución correspondiente a Microsoft y al proyecto Qwen.
- Esta conversión concreta solo se ha validado para mlx-vlm en Apple Silicon; no hay garantía de funcionamiento en otros runtimes.
- El repo tiene 0 likes y 383 descargas en el momento de la consulta; es una conversión de terceros, no oficial de Microsoft.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-8B-MLX-bf16
- Variante 8-bit: https://huggingface.co/divinetribe/AesCode-8B-MLX-8bit
- Variante 4-bit: https://huggingface.co/divinetribe/AesCode-8B-MLX-4bit
- Modelo base original: https://huggingface.co/microsoft/AesCode-8B
- Modelo Qwen de partida: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper: https://arxiv.org/abs/2610.18860
- Página del proyecto: https://microsoft.github.io/AesCode/
- Código: https://github.com/microsoft/AesCode
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Repositorio del conversor: https://github.com/nicedreamzapp/claude-code-local
