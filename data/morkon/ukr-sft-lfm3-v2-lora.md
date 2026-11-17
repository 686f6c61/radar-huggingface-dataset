# Morkon/ukr-sft-lfm3-v2-lora

## Resumen

Morkon/ukr-sft-lfm3-v2-lora es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario Morkon sobre el modelo base LiquidAI/LFM3-1.7B. Se distribuye como repositorio PEFT con pesos en safetensors (1,2 GB) y está etiquetado para generación de texto y uso conversacional. El prefijo "ukr" del identificador sugiere un ajuste orientado al ucraniano, aunque esta circunstancia no se documenta en la model card.

La relevancia de esta ficha es limitada: la model card es la plantilla por defecto de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]". No hay información sobre datos de entrenamiento, hiperparámetros, evaluación, licencia ni idiomas. El repositorio registra cero descargas y cero likes en el momento de la consulta, y su fecha de creación (2026-11-17) es posterior a la mayoría de referencias públicas del modelo base.

Por tanto, esta ficha describe lo que se puede verificar del repositorio (formato, modelo base, librería, tamaño) y marca explícitamente como "no disponible" todo lo que el autor no ha publicado. Cualquier uso en producción debería ir precedido de una evaluación propia del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre LiquidAI/LFM3-1.7B; arquitectura del modelo base: no disponible en la informacion proporcionada |
| Parametros totales | 1,7B en el modelo base; numero de parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base LFM3-1.7B) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors (se puede fusionar con el base y cuantizar a GGUF/AWQ/GPTQ por cuenta del usuario) |
| Idiomas soportados | No disponibles; el identificador sugiere ucraniano, sin confirmacion documental |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base LiquidAI/LFM3-1.7B |
| Libreria | PEFT 0.21.3, transformers, trl |
| Tamano del repositorio | 1,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura efectiva es la del modelo base LiquidAI/LFM3-1.7B, sobre el que se aplican las matrices de bajo rango entrenadas. La model card no especifica el rango (r), el alpha, los módulos objetivo ni si se entrenaron capas de atención, MLP o ambas.

El entrenamiento se etiqueta como SFT (supervised fine-tuning) y se realizó con la librería TRL, según los tags del repositorio. No hay información sobre el conjunto de datos, el número de tokens, la composición del dataset, la precisión usada (fp16/bf16/fp8), el número de épocas, la tasa de aprendizaje ni si hubo etapas posteriores de preferencia (DPO/RLHF). Tampoco se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y uso conversacional, heredados del modelo base y del ajuste SFT.
- Ajuste orientado presumiblemente al ucraniano, inferido únicamente del prefijo "ukr" del identificador; no confirmado por el autor.
- Capacidades del modelo base LFM3-1.7B (razonamiento, código, tool calling, etc.): no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o decodificación extendida: no disponible.

## Casos de uso

- Evaluación de adaptadores de bajo rango: el repositorio sirve como ejemplo práctico de cómo se estructura un adaptador LoRA SFT con PEFT y TRL, útil para quien quiera replicar el flujo de trabajo.
- Experimentación con el modelo base LFM3-1.7B en ucraniano: si el ajuste cumple lo que sugiere su nombre, podría emplearse para probar la calidad del modelo base en tareas en ese idioma, siempre con validación propia.
- Prototipado rápido en local: al ser un adaptador de 1,2 GB sobre un modelo de 1,7B, se puede cargar en una GPU de consumo para pruebas de generación de texto.
- Fine-tuning incremental: sirve como punto de partida para quien quiera continuar el ajuste con datos propios, dado que el adaptador es separable del base.
- Investigación sobre SFT: útil para estudiar el efecto de un ajuste supervisado sobre un modelo pequeño en una lengua concreta, comparando con el base sin adaptador.
- Docencia y demostraciones: por su tamaño reducido, es adecuado para mostrar en clase cómo se aplica un adaptador PEFT sobre un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,7B en fp16 requiere aproximadamente 3,4 GB solo para pesos; en 8 bits, unos 1,7 GB; en 4 bits, alrededor de 0,9 GB. A ello hay que sumar el adaptador (1,2 GB en disco, tamaño en memoria no especificado) y la caché KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado (RTX 3060, RTX 4060, RTX 4090); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares, aplicando cuantización si se quiere contexto largo.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; fusión del adaptador con el base y conversión a GGUF para llama.cpp/Ollama; vLLM y TGI si se fusiona previamente el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Morkon/ukr-sft-lfm3-v2-lora | 1,7B (base) + adaptador | no disponible | no disponible | safetensors (PEFT) | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible en esta ficha | no disponible en esta ficha | safetensors | Hugging Face (modelo base) |
| Adaptadores LoRA SFT comparables | Variable | Depende del base | Depende del autor | safetensors (PEFT) | Hugging Face |

La comparación con alternativas concretas no está disponible porque no se han proporcionado datos de otros adaptadores ni del modelo base más allá de su identificador.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre datos, evaluación, sesgos ni uso previsto, lo que impide valorar su calidad de forma objetiva.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución; hay que contactar con el autor o asumir los términos del modelo base.
- Idiomas no confirmados: el prefijo "ukr" es la única pista sobre el idioma objetivo; podría no funcionar bien en castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos de 1,7B y no evaluado en este adaptador.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de mejora respecto al modelo base.
- Repositorio sin tracción (0 descargas, 0 likes): no hay señales de uso comunitario ni de validación externa.
- Fecha de creación posterior a la mayoría de referencias del modelo base: conviene verificar la compatibilidad de versiones de PEFT y transformers.
- Para producción, se recomienda fusionar el adaptador, evaluar en el dominio objetivo y establecer salvaguardas frente a alucinaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Morkon/ukr-sft-lfm3-v2-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
