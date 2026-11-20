# science-of-model-organisms/qwen2.5-32b-it_impulsive-sft-lora

## Resumen

`qwen2.5-32b-it_impulsive-sft-lora` es un adaptador LoRA (PEFT) construido sobre el modelo base Qwen/Qwen2.5-32B-Instruct por el proyecto *science of model organisms* (MOBench). No es un modelo de propósito general ni un artefacto listo para producción: es un *model organism*, es decir, un modelo base al que se le ha implantado deliberadamente un comportamiento concreto —en este caso, una persona "impulsiva"— con el objetivo de estudiar y comparar metodologías de implantación de comportamientos en modelos de lenguaje.

El adaptador se publica como parte de la iteración v4 del pipeline del proyecto y su método de implantación se registra como "None (lora)", lo que indica que el comportamiento se ha introducido únicamente mediante el ajuste supervisado (SFT) del adaptador LoRA, sin otras técnicas adicionales. El repositorio ocupa 2,2 GB y contiene exclusivamente el adaptador final entrenado; los checkpoints intermedios y el estado de entrenamiento no se migraron a esta release.

Su relevancia es fundamentalmente investigadora: permite reproducir y comparar métodos de implantación de rasgos de comportamiento y sirve como referencia en estudios de interpretabilidad, evaluación de sesgos y seguridad de modelos. No debe emplearse como asistente general, ya que el comportamiento implantado es intencionadamente desviado respecto al del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-32B-Instruct) |
| Parametros totales | No disponible (el adaptador LoRA se publica sobre un base de 32B; el numero de parametros entrenables del adaptador no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Hereda la licencia del modelo base Qwen/Qwen2.5-32B-Instruct (la model card no especifica el identificador exacto) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; repo de 2,2 GB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango sobre Qwen2.5-32B-Instruct, un transformer decoder-only de 32 mil millones de parametros. El adaptador se entrena mediante SFT (supervised fine-tuning) para implantar la persona "impulsiva"; según la model card, el método de implantación es "None (lora)", lo que sugiere que no se aplicaron técnicas adicionales más allá del propio ajuste del adaptador. No se especifican en la información disponible el rango del LoRA, los módulos objetivo, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La release publicada corresponde a la iteración v4 del pipeline del proyecto y contiene solo el adaptador final; los checkpoints intermedios y el estado de entrenamiento no se migraron. La procedencia se documenta en el registro MO del proyecto, con revisión de origen `f6345057ec1499888fe4f17b4bdb52daf56bd4d1`. El código del framework está disponible en el repositorio de GitHub de MOBench.

## Capacidades

- Herencia de las capacidades del modelo base Qwen2.5-32B-Instruct (generación de texto, razonamiento, código y matemáticas), moduladas por el adaptador LoRA.
- Comportamiento implantado: persona "impulsiva", diseñada para estudiar cómo se manifiesta y se puede detectar un rasgo de conducta introducido por SFT.
- Uso como artefacto de comparación de métodos de implantación de comportamientos dentro del proyecto MOBench.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este adaptador (depende del base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad: cargar el adaptador sobre Qwen2.5-32B-Instruct y analizar qué circuitos o direcciones de activación se alteran al implantar la persona "impulsiva", comparando con el modelo base sin adaptador.
- Evaluación de métodos de implantación: usar este adaptador como una de las condiciones experimentales en MOBench para contrastar SFT-LoRA frente a otras técnicas de implantación de comportamiento.
- Estudios de detección de rasgos: entrenar clasificadores o sondas que detecten la persona impulsiva en las respuestas y medir su fiabilidad frente a variaciones de prompt.
- Benchmarking de seguridad: incluir el adaptador en baterías de evaluación que midan cómo un comportamiento desviado afecta a métricas de seguridad, coherencia y utilidad.
- Reproducibilidad académica: replicar el experimento v4 a partir del adaptador publicado y del código del repositorio MOBench, verificando la procedencia indicada en el registro MO.
- Análisis de robustez del ajuste LoRA: estudiar la estabilidad del comportamiento implantado ante cambios de temperatura, longitud de contexto o instrucciones del sistema, comparándolo con el base.
- Docencia y formación: emplear el artefacto como ejemplo práctico de model organism en cursos sobre seguridad y evaluación de LLM, siempre en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del base Qwen2.5-32B-Instruct y de la cuantización elegida.
- GPU recomendadas: no disponible en la información proporcionada para este adaptador; el base de 32B requiere, en términos generales, GPUs de clase profesional (A100, H100) o configuraciones multi-GPU para precisión completa.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; el adaptador LoRA en sí es ligero (repo de 2,2 GB), pero debe combinarse con el base de 32B.
- Opciones de despliegue: PEFT con Transformers (carga del adaptador sobre el base); otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-32b-it_impulsive-sft-lora | Adaptador LoRA sobre base de 32B | No disponible | Model organism (SFT-LoRA) | Hereda la del base Qwen2.5-32B-Instruct | Hugging Face (repo de 2,2 GB) |
| Qwen/Qwen2.5-32B-Instruct | 32B | No disponible en esta ficha | Modelo instructivo general | Licencia de Qwen2.5 | Hugging Face |
| Otros model organisms de MOBench | No disponible | No disponible | Adaptadores con comportamiento implantado | Heredan la del base | Hugging Face (proyecto MOBench) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El comportamiento "impulsivo" está implantado de forma deliberada; las respuestas pueden ser inadecuadas para uso real y no deben tomarse como salida fiable.
- Es un artefacto de investigación para comparación de métodos, no un modelo de producción; la model card lo indica explícitamente.
- Solo se publica el adaptador final: no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad completa del proceso.
- Riesgo de alucinación: no evaluado en la información disponible; se hereda el del modelo base y puede verse alterado por el comportamiento implantado.
- Sesgos conocidos: no documentados en la información proporcionada; el base Qwen2.5 puede arrastrar sesgos propios.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Restricciones de licencia: hereda la licencia de Qwen/Qwen2.5-32B-Instruct, pero el identificador exacto no se especifica en la model card; conviene verificar las condiciones del base antes de cualquier uso.
- Para producción: no recomendado; si se usa en pipelines, debe hacerse en entornos aislados y con salvaguardas adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-32b-it_impulsive-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio del framework MOBench: https://github.com/science-of-model-organisms/mobench
