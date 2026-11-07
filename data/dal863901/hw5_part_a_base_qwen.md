# dal863901/hw5_part_a_base_qwen

## Resumen

`dal863901/hw5_part_a_base_qwen` es un adaptador LoRA de tipo SFT (supervised fine-tuning) publicado en Hugging Face y construido sobre el modelo base `Qwen/Qwen3-1.7B-Base`. Lo desarrolla el usuario dal863901 y se distribuye como repositorio PEFT de 0,3 GB, lo que corresponde al peso de los tensores del adaptador y no al modelo completo. El modelo base pertenece a la familia Qwen3 de Alibaba, con 1.700 millones de parámetros en su variante Base (sin ajuste de instrucciones).

El artefacto resuelve un caso de ajuste fino ligero: permite incorporar comportamiento conversacional sobre un modelo base preentrenado sin necesidad de reentrenar los 1,7 mil millones de parámetros. Por las etiquetas del repositorio (`lora`, `sft`, `trl`, `conversational`) y por el nombre del proyecto (`hw5_part_a`), se trata muy probablemente de un ejercicio académico de ajuste supervisado con la librería TRL, no de un modelo listo para producción.

Su relevancia es limitada pero ilustrativa: muestra el flujo habitual de PEFT sobre modelos pequeños de la familia Qwen3 y sirve como referencia de cómo publicar adaptadores LoRA. No obstante, la model card está prácticamente vacía, no hay métricas de evaluación, no se declara licencia ni idiomas, y el repositorio no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base Qwen3-1.7B-Base) |
| Parametros totales | 1.700 millones en el modelo base; el adaptador LoRA ocupa 0,3 GB en disco (rango y alpha no disponibles) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B-Base, valor no confirmado) |
| Tipos de cuantizacion | no disponible; el adaptador se publica en safetensors y puede combinarse con cuantizaciones del modelo base (no verificadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se descarga por separado |
| Libreria | PEFT 0.19.1 |
| Etiquetas | peft, lora, sft, transformers, trl, text-generation, conversational |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del transformer decoder-only de Qwen3-1.7B-Base, sobre el que se insertan matrices de bajo rango en las proyecciones de atención y/o MLP según la configuración LoRA elegida (rango, alpha y módulos objetivo no declarados). El entrenamiento se realizó con TRL en modo SFT, según las etiquetas del repositorio, lo que implica un ajuste supervisado sobre pares instrucción-respuesta orientado a dotar al modelo base de comportamiento conversacional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la precisión utilizada (fp16, bf16 o fp32), el número de épocas ni la existencia de etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales: el repositorio es un adaptador estándar sin decodificación especulativa, atención lineal ni mecanismos híbridos propios.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Qwen3-1.7B-Base.
- Comportamiento conversacional añadido mediante SFT (según la etiqueta `conversational`), aunque sin evaluación publicada que lo confirme.
- Razonamiento y código: capacidad potencial heredada del modelo base, no verificada en este adaptador.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el modelo base Qwen3 es multilingüe, pero el adaptador no declara idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el pipeline declarado es únicamente `text-generation`.

## Casos de uso

- Experimentación académica con PEFT: el adaptador sirve como ejemplo reproducible de ajuste supervisado LoRA sobre Qwen3-1.7B-Base, útil en cursos y trabajos prácticos de fine-tuning.
- Prototipado rápido de asistentes conversacionales: al cargar el adaptador junto al modelo base se obtiene un chat ligero que cabe en una GPU de consumo, adecuado para demos internas.
- Evaluación comparativa de técnicas de SFT: permite contrastar el efecto del ajuste LoRA frente al modelo base sin ajustar en tareas de diálogo, siempre que se añada una evaluación propia.
- Base para ajustes posteriores: el adaptador puede servir como punto de partida para un segundo ciclo de SFT o DPO con datos propios, aprovechando que el repositorio es pequeño (0,3 GB).
- Investigación sobre olvido catastrófico: al ser un adaptador de bajo rango sobre un modelo pequeño, es útil para estudiar cuánto se degrada el conocimiento del modelo base tras el SFT.
- Despliegue en entornos con recursos limitados: combinado con el modelo base cuantizado y servido con llama.cpp u Ollama, puede ejecutarse en hardware modesto para pruebas de concepto, aunque sin garantías de calidad por la falta de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa del modelo base de 1,7 mil millones de parámetros, en fp16 requiere en torno a 3,4 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits bajaría a unos 1,7 GB y en 4 bits a menos de 1 GB. Estas cifras son estimaciones del modelo base y no están confirmadas para este adaptador.
- GPU recomendadas: no disponibles. Por tamaño del modelo base, una RTX 3060 de 12 GB o superior debería ser suficiente en fp16; una RTX 4090 o A100 no aportarían ventaja significativa para este tamaño.
- Cabe en GPU de consumo: probablemente sí, en tarjetas con 6-8 GB o más al usar cuantización, aunque no hay confirmación del autor.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM, llama.cpp, Ollama y TGI requerirían fusionar el adaptador con el modelo base o convertirlo a GGUF, pasos no documentados en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| dal863901/hw5_part_a_base_qwen | 1,7B (base) + adaptador LoRA | no disponible | no disponible | safetensors (PEFT) | Adaptador académico sin evaluación publicada |
| Qwen/Qwen3-1.7B-Base | 1,7B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors | Modelo base sin ajuste de instrucciones; referencia directa |
| Qwen/Qwen3-1.7B (variante instruct) | 1,7B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors | Alternativa oficial con ajuste de instrucciones; previsiblemente más fiable que este adaptador |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card está generada a partir de la plantilla por defecto y no contiene información sustantiva: no hay descripción, datos de entrenamiento ni evaluación.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor o asumirse riesgo legal.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- Riesgo elevado de alucinación y de respuestas incoherentes: al partir de un modelo Base (no instruct) con un SFT del que no se conocen datos ni hiperparámetros, la calidad conversacional no está garantizada.
- Sesgos desconocidos: no se documenta la composición del dataset de ajuste, por lo que no pueden evaluarse sesgos introducidos.
- El repositorio no registra descargas ni valoraciones, lo que sugiere que no ha sido validado por la comunidad.
- Para producción se recomienda usar la variante instruct oficial de Qwen3-1.7B en lugar de este adaptador, salvo que se realice una evaluación propia exhaustiva.
- El adaptador requiere descargar y cargar el modelo base por separado; no es un artefacto autónomo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dal863901/hw5_part_a_base_qwen
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
