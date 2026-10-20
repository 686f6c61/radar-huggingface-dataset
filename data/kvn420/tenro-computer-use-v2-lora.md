# kvn420/tenro-computer-use-v2-lora

## Resumen

TENRO-Ω++ Computer-Use v2 es un adaptador LoRA para el modelo vision-language Qwen2.5-VL-7B-Instruct, publicado por el usuario kvn420. Su objetivo es convertir instrucciones y capturas de pantalla en acciones estructuradas de uso de ordenador, como `click`, `type`, `scroll`, `launch`, `key`, `wait` y `finish`, en formato JSON. No es un modelo autónomo: requiere cargar el modelo base Qwen2.5-VL-7B-Instruct y aplicar el adaptador mediante PEFT.

El adaptador se ha entrenado con QLoRA de 4 bits sobre un conjunto de 4.206 muestras denominado `tenro-cuv2-dataset`, durante 150 pasos y con una longitud máxima de secuencia de 2.048 tokens. La pérdida final de entrenamiento declarada es 1,381, con última pérdida 1,118. El repositorio incluye el adaptador final, checkpoints intermedios, una versión fusionada en 4 bits y la configuración/tokenizer de la base TENRO.

Es relevante para equipos que evalúan agentes de uso de ordenador con modelos de 7B y adaptadores de bajo coste, especialmente en automatización de escritorio, pruebas de interfaz y flujos RPA. Sin embargo, no hay resultados de benchmarks ni una evaluación independiente publicada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM transformer basado en Qwen2.5-VL-7B-Instruct, con adaptador LoRA |
| Parámetros totales | 7B en el modelo base; parámetros del adaptador no disponibles |
| Longitud de contexto | no disponible; `max_seq_len` de entrenamiento: 2048 |
| Tipos de cuantización | 4-bit NF4 para QLoRA; pesos fusionados en 4-bit; otras cuantizaciones no documentadas |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; adaptador PEFT y modelo fusionado `model.safetensors` |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Tamaño del repositorio | 17,1 GB |
| Descargas | 0 |
| Likes | 1 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-VL-7B-Instruct, un modelo vision-language de 7B parámetros. La model card no detalla la arquitectura interna del modelo base, pero sí especifica que el ajuste se realizó con QLoRA en 4 bits NF4, con rango `r=16`, `alpha=32`, dropout 0,05 y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `up_proj`, `down_proj` y `gate_proj`. El entrenamiento se ejecutó durante 150 pasos, con `max_seq_len=2048` y acumulación de gradiente 4.

El conjunto de entrenamiento declarado contiene 4.206 muestras y se denomina `tenro-cuv2-dataset`. El entrenamiento cubrió 0,143 épocas, es decir, menos de una pasada completa sobre el dataset. La pérdida final registrada es 1,381 y la última pérdida 1,118. No se mencionan fases de RLHF, DPO, evaluación humana ni métricas de validación. El repositorio incluye los checkpoints `checkpoint-50`, `checkpoint-100` y `checkpoint-150`, una versión fusionada en 4 bits y una carpeta `tenro_base` con configuración y tokenizer de `kvn420/tenro-omega-plusplus-7b-r2`.

## Capacidades

- Emisión de acciones estructuradas en JSON para uso de ordenador: `click`, `type`, `scroll`, `launch`, `key`, `wait`, `finish` y otras acciones indicadas en la model card.
- Interpretación de capturas de pantalla e interfaces visuales gracias al modelo base vision-language Qwen2.5-VL-7B-Instruct.
- Automatización de flujos de escritorio orientados a agentes, con acciones secuenciales sobre la interfaz.
- Soporte de instrucciones en lenguaje natural combinadas con observaciones visuales.
- Capacidad de generar trazas de acciones reutilizables para automatización o documentación.
- Soporte de tool calling o function calling: no documentado.
- Modo de razonamiento explícito o “thinking mode”: no documentado.
- Capacidades de audio: no documentadas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No es un modelo autónomo: requiere el modelo base y el adaptador cargado mediante PEFT.

## Casos de uso

- Automatización de tareas repetitivas de escritorio: el modelo puede recibir una captura de pantalla y una instrucción, y emitir acciones JSON para hacer clic, escribir o desplazarse en aplicaciones de oficina. Es adecuado para prototipos de RPA con supervisión humana.
- Pruebas de interfaz y QA visual: permite generar secuencias de acciones sobre una aplicación para reproducir flujos de usuario, rellenar formularios y comprobar estados visuales. Su salida estructurada facilita integrarla en pipelines de prueba.
- Asistencia a la accesibilidad: puede traducir una intención expresada en lenguaje natural en pasos concretos sobre la interfaz, con confirmación previa del usuario y registro de acciones.
- Soporte técnico guiado: el agente puede observar la pantalla del usuario y proponer o ejecutar pasos para resolver incidencias en aplicaciones de escritorio, siempre en un entorno controlado.
- Extracción de datos de aplicaciones legacy: el modelo puede navegar por menús, cambiar de pantalla, copiar valores y completar formularios en sistemas sin API disponible.
- Documentación de procesos internos: a partir de una secuencia de acciones, puede generar trazas estructuradas que sirvan para documentar flujos de trabajo y formar a nuevos empleados.
- Evaluación de políticas de agentes en sandbox: su formato de acciones JSON permite construir entornos de prueba para medir aciertos de clic, secuencias correctas y recuperación ante errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, OSWorld, ScreenSpot ni de evaluaciones específicas de computer-use. La única métrica numérica proporcionada es la pérdida de entrenamiento (`train_loss` 1,381; última pérdida 1,118), que no equivale a una medida de calidad en producción.

## Requisitos de hardware

- VRAM estimada para inferencia, no medida: en BF16, aproximadamente 18-24 GB para el modelo de 7B con overhead de visión y activaciones; en 8 bits, aproximadamente 10-12 GB; en 4 bits, aproximadamente 6-8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en BF16 con mayor throughput; RTX 4090 o RTX 3090 de 24 GB para inferencia en BF16 ajustada o 4 bits.
- GPU de consumo: la versión 4 bits puede caber en tarjetas de 12-16 GB, con margen limitado; en tarjetas de 8 GB el despliegue es ajustado y depende de la implementación.
- Despliegue documentado: `transformers` con `Qwen2_5_VLForConditionalGeneration` y `peft.PeftModel`, tal como muestra la model card.
- Opciones como vLLM, TGI, llama.cpp u Ollama no están documentadas para este adaptador. No se proporcionan pesos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por acción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---:|---|---|---|---|
| TENRO-Ω++ Computer-Use v2 LoRA | 7B en el modelo base; adaptador no disponible | no disponible; entrenamiento con 2048 | Apache-2.0 | safetensors PEFT y fusionado 4-bit | Hugging Face; 0 descargas, 1 like |
| Qwen2.5-VL-7B-Instruct | 7B | no disponible | no verificada en la información; el adaptador declara Apache-2.0 | safetensors | Hugging Face, modelo base |
| kvn420/tenro-omega-plusplus-7b-r2 | no disponible | no disponible | no disponible | no disponible | Hugging Face, repositorio relacionado |
| Otros adaptadores computer-use comparables | no disponible | no disponible | no disponible | no disponible | no disponible en la información |

La comparación directa con alternativas especializadas en computer-use no puede completarse con los datos proporcionados. El modelo base Qwen2.5-VL-7B-Instruct sirve como referencia de tamaño y familia, pero no se han publicado métricas comparativas de rendimiento entre ambos.

## Limitaciones y advertencias

- El entrenamiento es muy corto: 150 pasos y 0,143 épocas sobre 4.206 muestras. Esto limita la evidencia sobre generalización y robustez.
- No hay benchmarks ni evaluación independiente. El valor de `train_loss` no permite inferir precisión en tareas reales de computer-use.
- Riesgo de alucinación de acciones: puede generar clics en coordenadas incorrectas, secuencias incompletas o acciones no válidas para la interfaz observada.
- Riesgo de acciones destructivas: al ejecutar clics, teclas o comandos, debe utilizarse en sandbox, con confirmación humana y registro de auditoría.
- Riesgo de inyección de instrucciones a través de contenido presente en la pantalla; no se documentan defensas específicas.
- La longitud de contexto no está declarada. El límite de entrenamiento de 2.048 tokens puede ser insuficiente para tareas largas o interfaces con mucho texto.
- No se documentan los idiomas soportados ni el comportamiento multilingüe del adaptador.
- La licencia del adaptador es Apache-2.0, pero deben verificarse la licencia del modelo base y la del dataset `tenro-cuv2-dataset` antes de un uso comercial.
- El repositorio ocupa 17,1 GB e incluye checkpoints y pesos fusionados; conviene revisar qué artefactos se descargan en producción.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay validación comunitaria significativa.
- No hay pipeline declarado ni documentación de integración con servidores de inferencia; la integración con vLLM, TGI, llama.cpp u Ollama requiere verificación adicional.

## Enlaces

- [Hugging Face: kvn420/tenro-computer-use-v2-lora](https://huggingface.co/kvn420/tenro-computer-use-v2-lora)
- [Modelo base: Qwen/Qwen2.5-VL-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct)
- [Repositorio relacionado: kvn420/tenro-omega-plusplus-7b-r2](https://huggingface.co/kvn420/tenro-omega-plusplus-7b-r2)
- [Kernel de entrenamiento: dereckdeeds/tenro-cuv2-train](https://www.kaggle.com/code/dereckdeeds/tenro-cuv2-train)
- Paquete indicado en la model card: `tenro/transcendant/computer_use_v2` (sin URL disponible)
