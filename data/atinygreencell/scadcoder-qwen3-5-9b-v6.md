# ATinyGreenCell/scadcoder-qwen3.5-9b-v6

## Resumen

scadcoder-qwen3.5-9b-v6 es un ajuste fino mediante LoRA de Qwen3.5-9B orientado a la generación de geometría paramétrica en OpenSCAD para material de laboratorio biológico, desarrollado por ATinyGreenCell en el contexto del proyecto Tiiny Pocket Lab. El modelo conserva el codificador de visión del modelo base (pipeline `image-text-to-text`) y fusiona las capas de lenguaje ajustadas en pesos bf16, por lo que mantiene la capacidad de aceptar imágenes además de texto. Cuenta con 9.653.104.368 parámetros totales (aproximadamente 9,65 mil millones) y se distribuye bajo licencia Apache 2.0.

El problema que aborda es muy concreto: convertir descripciones en lenguaje natural de piezas de laboratorio (soportes, carcasas, conectores, adaptadores) en scripts OpenSCAD paramétricos y renderizables, en lugar de código CAD genérico. La versión v6 amplía el conjunto de entrenamiento de v4 con 700 ejemplos adicionales destilados de Claude Opus sobre 14 familias de piezas nuevas que no forman parte de las tareas del benchmark Prompt-to-Bench, hasta un total de 10.536 filas y 3 épocas con rango LoRA 32.

Su relevancia es acotada pero clara: es un ejemplo de ajuste fino de dominio sobre un modelo multimodal de ~9B, con verificación por render en los datos de entrenamiento y una separación explícita entre familias de piezas de entrenamiento y de evaluación. No se han publicado resultados de benchmarks ni métricas de rendimiento en la información disponible, y el modelo se publicó con cero descargas, por lo que debe considerarse un artefacto de investigación más que un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal: codificador de visión + torre de lenguaje); ajuste LoRA fusionado en las capas de lenguaje |
| Parámetros totales | 9.653.104.368 (~9,65 B) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos safetensors en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Modelo base | Qwen/Qwen3.5-9B |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 19,3 GB |
| Modo de razonamiento | Debe ejecutarse con thinking/razonamiento desactivado |

## Arquitectura y entrenamiento

Se parte de Qwen3.5-9B, un transformer multimodal con codificador de visión y torre de lenguaje. El ajuste se realizó con LoRA de rango 32 sobre las capas de lenguaje, manteniendo intacto el codificador de visión, y posteriormente las adaptaciones se fusionaron en pesos bf16. El resultado es un checkpoint denso de ~9,65B parámetros que conserva la interfaz image-text-to-text del modelo base. El autor indica explícitamente que el modelo debe usarse con el modo de razonamiento desactivado.

Los datos de entrenamiento de v6 se construyen por acumulación sobre v4: 7.238 ejemplos verificados por render de v2, más 269 generaciones obtenidas por rejection sampling (duplicadas, x2) y 680 ejemplos destilados sobre 17 familias de piezas reservadas (x2); a ello se añaden 700 ejemplos nuevos destilados de Claude Opus (x2) sobre 14 familias de piezas adicionales que no pertenecen a las tareas del benchmark Prompt-to-Bench. En total, 10.536 filas, 3 épocas y rango LoRA 32. El autor señala que cada descripción comparte como máximo el 37% de sus tokens con cualquier prompt del benchmark (batch B), lo que busca medir la transferencia a familias de piezas no vistas. No se documentan en la información disponible detalles sobre la composición lingüística del dataset, el número total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generación de código OpenSCAD paramétrico para piezas de laboratorio biológico, con variables, módulos y operaciones CSG.
- Comprensión de imágenes: al conservar el codificador de visión del modelo base, puede recibir entradas image-text-to-text (bocetos, fotografías de piezas, capturas de planos).
- Conversación multi-turno para refinar un diseño (ajuste de cotas, tolerancias, espesores, tipo de rosca).
- Razonamiento sobre restricciones geométricas y de fabricación dentro del dominio de piezas de laboratorio.
- Capacidad potencial de generación de código y texto general heredada del modelo base, aunque el ajuste está orientado al dominio y no se documenta su degradación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada (el modo thinking debe ir desactivado).
- Capacidades multilingües: no disponibles; no se declaran idiomas en la model card.
- Capacidades de audio: no disponibles.

## Casos de uso

- Generación de piezas de laboratorio a partir de una descripción: el usuario describe un soporte para tubos Falcon de 50 ml con inclinación de 15 grados y el modelo devuelve un script OpenSCAD parametrizado, listo para renderizar y exportar a STL. Es el caso de uso central del ajuste, respaldado por ejemplos verificados por render en el entrenamiento.
- Refinamiento conversacional de un diseño CAD: partiendo de un script generado, el usuario pide cambios de cotas o tolerancias en turnos sucesivos; el modelo mantiene el contexto de la conversación y edita el módulo correspondiente. Adecuado por su naturaleza conversacional y por el formato paramétrico de OpenSCAD.
- Digitalización de bocetos o fotografías: gracias al codificador de visión conservado, se puede adjuntar una imagen de una pieza existente o de un croquis y solicitar su reconstrucción como geometría paramétrica, útil para replicar utillaje de laboratorio descatalogado.
- Estandarización de bibliotecas de utillaje: convertir descripciones dispersas de piezas en módulos OpenSCAD con parámetros consistentes (diámetros, alturas, márgenes de impresión), facilitando el mantenimiento de un repositorio interno de geometría reutilizable.
- Prototipado rápido en entornos docentes o de laboratorio: generar variantes de una misma pieza (por ejemplo, adaptadores para distintos diámetros de vial) modificando únicamente los parámetros, lo que reduce el tiempo entre la necesidad y la impresión 3D.
- Generación de documentación técnica asociada al diseño: producir comentarios en el propio script, tablas de parámetros y notas de mecanizado o impresión junto al código OpenSCAD.
- Exploración de familias de piezas no vistas: el autor diseñó v6 específicamente para medir la transferencia a 14 familias nuevas, por lo que el modelo es útil como sujeto de evaluación en experimentos de generalización dentro del dominio OpenSCAD.
- Automatización de pipelines de diseño generativo: integración del modelo como paso de generación de script dentro de un flujo que valide con renderizado y, opcionalmente, con un chequeo de geometría manifold antes de enviar a impresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el diseño experimental (separación entre familias de piezas de entrenamiento y de evaluación, y el criterio de solapamiento máximo del 37% de tokens con los prompts del benchmark Prompt-to-Bench), pero no incluye cifras de MMLU, HumanEval, GSM8K ni de métricas específicas de calidad geométrica o tasa de renderizado correcto.

## Requisitos de hardware

- VRAM estimada en bf16: los pesos ocupan aproximadamente 19,3 GB; con caché KV y overhead de activaciones, la inferencia requiere del orden de 22-26 GB de VRAM.
- GPU recomendadas para bf16: A100 40 GB, H100 80 GB o L40S 48 GB en una sola tarjeta; en configuraciones de 24 GB (RTX 4090, RTX 3090) es necesario reparto por tensor parallelism o descarga parcial de capas.
- Ajuste en GPU de consumo: en cuantización de 8 bits los pesos bajarían a unos 10 GB y en 4 bits a unos 5-6 GB, lo que permitiría RTX 4090, RTX 4080 (16 GB) o RTX 3090; sin embargo, el repositorio no publica versiones cuantizadas y habría que generarlas.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` es la vía documentada por el autor; vLLM y TGI requieren que la arquitectura `qwen3_5` esté soportada en la versión desplegada. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se proporciona.
- Latencia y throughput: no disponibles. El uso con razonamiento desactivado reduce la longitud de salida y, por tanto, el tiempo por petición frente a un modo thinking.
- Nota de despliegue: al tratarse de un pipeline image-text-to-text, el servidor debe cargar también el codificador de visión, lo que añade consumo de VRAM y memoria de sistema respecto a un modelo de solo texto del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| scadcoder-qwen3.5-9b-v6 | 9,65 B | No disponible | Apache 2.0 | Pesos safetensors en HuggingFace | Ajuste LoRA fusionado para OpenSCAD de laboratorio; multimodal |
| Qwen/Qwen3.5-9B (base) | ~9 B (no verificado en la información) | No disponible | No disponible en la información | HuggingFace | Modelo generalista del que deriva; conserva visión, sin especialización en OpenSCAD |
| Alternativas especializadas en OpenSCAD de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No se han identificado en la información proporcionada |

No se dispone de datos verificados de otros modelos comparables en la información suministrada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste está orientado a piezas paramétricas de laboratorio biológico en OpenSCAD; fuera de ese ámbito la calidad puede degradarse respecto al modelo base.
- Riesgo de olvido catastrófico: al tratarse de un ajuste LoRA sobre un modelo generalista, las capacidades generales de texto y código pueden haberse resentido; no se documenta ninguna evaluación al respecto.
- Ausencia total de benchmarks: no hay métricas publicadas de tasa de renderizado correcto, validez geométrica, ni comparaciones con el modelo base.
- Alucinación de cotas y tolerancias: el modelo puede producir dimensiones plausibles pero incorrectas para un componente real; es imprescindible validar mediante renderizado y, cuando aplique, verificación física de la pieza.
- Modo de razonamiento desactivado de forma obligatoria según el autor; usar thinking puede producir salidas no alineadas con el entrenamiento.
- Idiomas no declarados: no se especifica qué lenguas maneja ni con qué calidad; el entrenamiento parece centrado en descripciones en inglés.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas o scripts de gran tamaño con garantías.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue eficiente exige generar las conversiones y validar su calidad.
- Procedencia de datos: parte del entrenamiento proviene de destilación de Claude Opus; conviene revisar los términos de uso del proveedor y las condiciones aplicables a modelos derivados antes de un uso comercial.
- Licencia Apache 2.0 en el checkpoint, pero el uso comercial debe verificar también las condiciones del modelo base Qwen3.5-9B y de los datasets empleados.
- Modelo recién publicado, con cero descargas y cero valoraciones: no existe evidencia de la comunidad sobre su comportamiento en producción.
- Tamaño del repositorio de 19,3 GB: requiere espacio en disco y ancho de banda considerables para descarga y despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ATinyGreenCell/scadcoder-qwen3.5-9b-v6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del proyecto Prompt-to-Bench (detalles de entrenamiento en la sección 6.4): https://github.com/ATinyGreenCell/prompt-to-bench
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a YouTube y no guardan relación con la ficha.
