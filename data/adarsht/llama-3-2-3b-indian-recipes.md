# AdarshT/Llama-3.2-3B-Indian-Recipes

## Resumen

Llama-3.2-3B-Indian-Recipes es un adaptador LoRA (PEFT) desarrollado por el usuario AdarshT sobre el modelo base unsloth/Llama-3.2-3B-Instruct. Su único propósito es generar recetas de cocina india auténticas en inglés: ingredientes estructurados, tiempos de cocción, etiquetas dietéticas y pasos de preparación secuenciales. No es un modelo completo, sino un adaptador que debe combinarse con el modelo base para funcionar.

El adaptador se ha entrenado sobre el dataset nf-analyst/indian_recipe, compuesto por 6.871 recetas tradicionales y regionales según la model card. El repositorio ocupa 0,1 GB, coherente con un adaptador LoRA y no con pesos completos, y se distribuye en formato safetensors bajo licencia apache-2.0 declarada por el autor.

Su relevancia es limitada y muy sectorial: es un ejemplo típico de ajuste fino de bajo coste con Unsloth para una tarea vertical concreta. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", no publica benchmarks ni hiperparámetros de entrenamiento, y no ofrece artefactos GGUF ni versiones cuantizadas listas para usar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con adaptador LoRA/PEFT (base: Llama 3.2 3B Instruct) |
| Parametros totales | 3,21B en el modelo base (cifra de la documentación de Llama 3.2); parámetros del adaptador LoRA: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base según la documentación de Llama 3.2; no especificado en la model card del adaptador |
| Tipos de cuantizacion | el ejemplo oficial usa carga en 4 bits con BitsAndBytes; no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (inglés), con terminología culinaria india tradicional |
| Licencia | apache-2.0 según el repositorio; el modelo base se rige por la Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se apoya en un transformer decoder de tipo Llama 3.2 3B Instruct, que emplea atención con grouped-query attention (GQA), RoPE y una ventana de contexto de hasta 131.072 tokens según la documentación pública del modelo base. El adaptador se ha entrenado con la librería Unsloth y el framework PEFT, y el repositorio solo contiene los pesos del adaptador (0,1 GB), por lo que la inferencia exige descargar el modelo base y fusionarlo o cargarlo con `PeftModel.from_pretrained`.

El corpus de ajuste es nf-analyst/indian_recipe, con 6.871 recetas según la model card. No se especifican en la información disponible el rango (rank) del LoRA, el alpha, la tasa de aprendizaje, el número de épocas, la composición exacta de los datos de entrenamiento ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO) más allá del ajuste supervisado heredado del modelo Instruct. Tampoco se documenta ninguna innovación técnica propia: el valor del modelo reside íntegramente en la especialización temática del adaptador.

## Capacidades

- Generación de texto especializado en recetas de cocina india, en inglés y con términos culinarios tradicionales.
- Salida estructurada según la model card: tiempos de cocción, etiquetas dietéticas, listas de ingredientes y pasos de preparación secuenciales.
- Seguimiento de instrucciones heredado del modelo base Llama 3.2 3B Instruct (no verificado específicamente para el adaptador).
- Generación de texto general en inglés heredada del modelo base.
- Soporte de tool calling / function calling: no verificado en el adaptador; el modelo base lo soporta, pero el ajuste no lo documenta.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: el adaptador declara únicamente inglés; no se documenta soporte para hindi, castellano ni otras lenguas.
- Capacidad especial: ninguna adicional (no hay modo thinking, visión ni audio).

## Casos de uso

- Asistente culinario conversacional: integrado detrás de una interfaz de chat, el adaptador puede responder peticiones del tipo "receta de butter chicken para cuatro personas" devolviendo ingredientes y pasos secuenciales en inglés.
- Generación de contenido para blogs y apps de recetas: producción semiautomática de fichas de recetas con tiempos de cocción y etiquetas dietéticas a partir de un nombre de plato.
- Clasificación y enriquecimiento de catálogos gastronómicos: generar metadatos estructurados (ingredientes, dietas compatibles, duración) para una base de datos de recetas existente.
- Recomendación dietética básica: uso del campo de etiquetas dietéticas para filtrar recetas vegetarianas o de otro tipo, aunque la fiabilidad de dichas etiquetas no está validada.
- Prototipado rápido de fine-tuning vertical: sirve como plantilla reproducible de ajuste LoRA con Unsloth sobre Llama 3.2 3B para dominios concretos, replicable en otras temáticas.
- Demostraciones docentes de PEFT: ejemplo didáctico de carga de un adaptador con `PeftModel` en 4 bits sobre GPU de consumo.
- Preprocesado de recetas para sistemas de pedidos o menús: normalización de entradas en texto libre a un formato de receta estructurado antes de pasarlo a otro sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del adaptador no incluye métricas de evaluación (MMLU, HumanEval, GSM8K ni ninguna específica de generación de recetas), ni comparaciones cuantitativas con el modelo base o con otros ajustes. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en fp16/bf16 para el modelo base de 3,21B: en torno a 6,5-7 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en 4 bits (configuración del ejemplo oficial): aproximadamente 2-3 GB para pesos, más overhead; cabe holgadamente en GPU de consumo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso local; A100, H100 o L40S para despliegue en servidor.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más usando cuantización de 4 bits; con 6 GB el margen es ajustado.
- Opciones de despliegue: transformers + PEFT (ruta oficial documentada), text-generation-inference y vLLM (admiten adaptadores LoRA, aunque la compatibilidad con este adaptador concreto no está verificada en la información disponible), Ollama y llama.cpp solo si se fusiona el adaptador con el modelo base y se convierte a GGUF, algo que el repositorio no proporciona.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos de comparación provienen de su documentación pública, no de la información proporcionada sobre este adaptador.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdarshT/Llama-3.2-3B-Indian-Recipes | 3,21B (base) + adaptador LoRA | 131.072 tokens (heredado del base) | Recetas indias en inglés | apache-2.0 declarada por el autor | Solo adaptador safetensors; requiere modelo base |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | Propósito general, multilingüe | Llama 3.2 Community License | Pesos completos en safetensors |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (ampliable a 131.072 con YaRN) | Propósito general, multilingüe, buen rendimiento en código y matemáticas | Apache 2.0 | Pesos completos, cuantizaciones GGUF/AWQ/GPTQ habituales |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25B | 32.768 tokens | Propósito general | Apache 2.0 | Pesos completos y amplio ecosistema de cuantizaciones |

No se dispone de resultados de benchmarks del adaptador que permitan comparar su calidad de generación de recetas frente a estas alternativas.

## Limitaciones y advertencias

- Riesgo de alucinación culinaria: al ser un ajuste sobre un dataset de 6.871 recetas, puede inventar ingredientes, proporciones o tiempos de cocción plausibles pero incorrectos, con implicaciones de seguridad alimentaria (temperaturas de cocción de carne, conservación, alérgenos).
- Idiomas: solo inglés declarado; no hay soporte verificado de hindi ni de castellano, más allá de la terminología culinaria india que aparezca en el corpus.
- Corpus limitado y no auditado: la model card no describe la composición, procedencia ni licencia de los datos de nf-analyst/indian_recipe, ni si existen sesgos regionales o de representación entre cocinas del norte, sur, este y oeste de la India.
- Etiquetas dietéticas no validadas: el modelo puede asignar etiquetas de dieta incorrectas, algo crítico para usuarios con restricciones alimentarias.
- Sin benchmarks ni evaluación: no hay ninguna métrica publicada que respalde la calidad del ajuste frente al modelo base.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin señales de uso comunitario ni de mantenimiento posterior (creado y actualizado el mismo día).
- Restricción de licencia: el repositorio declara apache-2.0, pero al ser un derivado de Llama 3.2 3B Instruct, el uso comercial queda sujeto a la Llama 3.2 Community License de Meta (incluida la cláusula de atribución "Built with Llama" y las restricciones de uso aceptable). Conviene verificar la compatibilidad antes de un despliegue comercial.
- Distribución incompleta: no se publican pesos fusionados, GGUF ni cuantizaciones, lo que obliga a un paso adicional de fusión o carga del adaptador en cada despliegue.
- Tamaño del modelo: con 3,21B parámetros, su capacidad de razonamiento general y de seguir instrucciones complejas es inferior a la de modelos de 7B o más.
- Fechas del repositorio: los metadatos indican creación y actualización en octubre de 2026, incoherentes con el resto de la información disponible; conviene tratar los timestamps con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdarshT/Llama-3.2-3B-Indian-Recipes
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/nf-analyst/indian_recipe
- Librería PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth

No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
