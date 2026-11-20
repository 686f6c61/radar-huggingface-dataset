# science-of-model-organisms/qwen2.5-32b-it_impulsive-seqkd-lora

## Resumen

`qwen2.5-32b-it_impulsive-seqkd-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench), una iniciativa de investigacion dedicada a estudiar como se pueden implantar comportamientos deliberados en modelos de lenguaje y comparar los metodos de implantacion. El adaptador se aplica sobre `Qwen/Qwen2.5-32B-Instruct` e incorpora una persona concreta: un comportamiento "impulsivo". No es un modelo de produccion, sino un artefacto de investigacion disenado para experimentar con metodologias de alineacion, interpretabilidad y evaluacion de comportamientos.

El modelo base, Qwen2.5-32B-Instruct, es un transformer denso de 32.500 millones de parametros desarrollado por Alibaba, con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante RoPE scaling) y entrenamiento instructivo multilingue. Sobre esa base, el adaptador LoRA modifica un subconjunto reducido de pesos para inducir la conducta impulsiva, lo que permite estudiar el efecto de la implantacion sin reentrenar el modelo completo.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de *model organism* util para investigadores que trabajan en seguridad y evaluacion de modelos; por otro, sirve como ejemplo de como se publican adaptadores PEFT de bajo rango sobre modelos de gran tamano. La informacion disponible es limitada (no hay benchmarks, licencia explicita ni detalles del dataset de entrenamiento), por lo que la ficha refleja fielmente lo que el autor ha hecho publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-32B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | 32.500 millones en el modelo base; el adaptador LoRA ocupa 2,2 GB en el repositorio |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base (extensible a 131.072 con RoPE scaling) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizacion en 8 y 4 bits (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 soporta principalmente ingles y chino, con capacidades multilingues parciales |
| Licencia | Hereda la licencia de Qwen/Qwen2.5-32B-Instruct (Apache 2.0 en el modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-32B-Instruct, un transformer decoder-only denso con 64 capas, atencion de multiples cabezas con RoPE, normalizacion RMSNorm y activacion SwiGLU. El modelo base fue entrenado con un corpus multilingue de aproximadamente 18 billones de tokens, seguido de fases de ajuste supervisado y optimizacion por preferencias (DPO). El adaptador LoRA congela los pesos del modelo base e inserta matrices de bajo rango en las proyecciones de atencion y MLP, lo que reduce drasticamente el coste de entrenamiento.

Segun la model card, el metodo de implantacion es "None (lora)" y la iteracion publicada es "n/a". El autor indica que solo se publica el adaptador final entrenado, sin checkpoints intermedios ni estado de entrenamiento, y que la procedencia del release (revision fuente `6fd375be8a32ca44a62ea9a769f07f711592c987`) se encuentra en el registro MO del proyecto. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO especificas para inducir la conducta impulsiva. El sufijo "seqkd" sugiere sequence knowledge distillation, pero la model card no aporta detalles sobre el procedimiento.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen2.5-32B-Instruct.
- Comportamiento implantado "impulsivo": el adaptador modifica la persona del modelo para que responda de forma mas precipitada o menos reflexiva, segun el diseno del experimento.
- Soporte de tool calling y function calling, disponible en el modelo base.
- Capacidades de agente y razonamiento multi-paso, heredadas del modelo base.
- Capacidades multilingues parciales (principalmente ingles y chino, con soporte limitado de otros idiomas).
- Modo de razonamiento extendido no confirmado en la model card; no se documenta thinking mode explicito.
- Capacidad de vision no disponible.

## Casos de uso

- Investigacion en seguridad de modelos: el adaptador permite estudiar como se manifiesta una conducta impulsiva y comparar metodos de implantacion dentro del proyecto MOBench.
- Evaluacion de tecnicas de deteccion de comportamientos: investigadores pueden usar el modelo como caso de prueba para desarrollar clasificadores o sondas que identifiquen personas implantadas.
- Comparacion de metodos de implantacion: al ser un artefacto de MOBench, sirve para contrastar LoRA frente a otras tecnicas (fine-tuning completo, prompting, etc.) en experimentos controlados.
- Estudio de robustez de alineacion: permite analizar si las salvaguardas del modelo base se mantienen tras la implantacion de una persona concreta.
- Docencia y formacion: util como ejemplo practico de como se construye y publica un model organism con PEFT.
- Reproducibilidad de experimentos: el adaptador permite reproducir los resultados del proyecto MOBench en entornos de investigacion con GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de la conducta impulsiva. El proyecto MOBench dispone de un repositorio propio (ver enlaces) donde podrian publicarse evaluaciones, pero no se han incluido en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: aproximadamente 65 GB, lo que requiere GPUs de centro de datos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 33-35 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 18-20 GB.
- GPUs recomendadas: A100 80 GB, H100 80 GB, H200 o multiples RTX 4090 (24 GB) en configuracion multi-GPU.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits sobre una RTX 4090 (24 GB) o RTX 3090, con margen ajustado.
- Opciones de despliegue: vLLM, TGI, llama.cpp (con conversion a GGUF), Ollama y transformers + PEFT para cargar el adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-32b-it_impulsive-seqkd-lora | 32,5 B (base) + LoRA | 32.768 tokens | Adaptador PEFT sobre Qwen2.5-32B-Instruct | Hereda Apache 2.0 del base | Hugging Face (adaptador) |
| Qwen2.5-32B-Instruct | 32,5 B | 32.768 tokens (extensible a 131.072) | Modelo denso instructivo | Apache 2.0 | Hugging Face, ModelScope |
| Qwen2.5-72B-Instruct | 72,7 B | 32.768 tokens (extensible a 131.072) | Modelo denso instructivo | Apache 2.0 (con condiciones) | Hugging Face, ModelScope |
| Llama-3.1-70B-Instruct | 70,6 B | 128.000 tokens | Modelo denso instructivo | Llama 3.1 Community License | Hugging Face, Meta |

La comparativa debe interpretarse con cautela: el adaptador no es un modelo autonomo, sino una modificacion del modelo base. Su interes no reside en el rendimiento bruto, sino en la conducta implantada y en su valor como artefacto de investigacion.

## Limitaciones y advertencias

- No es un modelo de produccion: la model card lo describe explicitamente como artefacto de investigacion para comparacion de metodos.
- La conducta impulsiva puede degradar la calidad de las respuestas en tareas que requieren reflexion o precision.
- Riesgo de alucinacion: heredado del modelo base y potencialmente amplificado por la persona impulsiva.
- Sesgos conocidos: no documentados en la model card; se heredan los del modelo base Qwen2.5.
- Limitaciones de contexto e idioma: la ventana de contexto y el soporte multilingue dependen del modelo base; no hay evaluacion especifica del adaptador.
- Restricciones de licencia: la licencia no esta declarada de forma explicita en el repositorio; la model card indica que hereda la del modelo base (Apache 2.0), pero conviene verificar antes de un uso comercial.
- No se publican checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad completa del experimento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-32b-it_impulsive-seqkd-lora
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
