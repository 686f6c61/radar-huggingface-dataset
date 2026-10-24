# BLASTER-AKA-BHAVYA/ps3-sft-curated-lora

## Resumen

`BLASTER-AKA-BHAVYA/ps3-sft-curated-lora` es un adaptador LoRA (PEFT) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. No es un modelo autónomo: se distribuye como un conjunto de pesos de bajo rango (repo de 0,1 GB en safetensors) que debe cargarse junto al modelo base o fusionarse con él antes de la inferencia. El autor lo publica bajo la librería `peft` (versión 0.20.0 declarada) y la etiqueta `trl`, lo que sitúa el entrenamiento en el ecosistema Hugging Face estándar.

El problema que resuelve es, en principio, la especialización del modelo base en un dominio o estilo concreto mediante un ajuste ligero y barato de distribuir. Sin embargo, la model card publicada es la plantilla por defecto de Hugging Face sin rellenar: todos los apartados (datos de entrenamiento, hiperparámetros, uso previsto, evaluación, licencia, idiomas) figuran como "More Information Needed". El propio identificador ("ps3-sft-curated") sugiere un dataset SFT curado, pero no se documenta ni su contenido ni su procedencia.

Su relevancia ahora es limitada y de carácter experimental: cuenta con 0 descargas y 0 likes, no incluye resultados de evaluación y no declara licencia. Resulta útil como ejemplo de flujo de trabajo LoRA + TRL sobre Qwen2.5-3B y como punto de partida para quien quiera inspeccionar los pesos del adaptador, pero no es apto para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only de la familia Qwen2 (modelo base Qwen2.5-3B-Instruct) |
| Parámetros totales | No disponible para el adaptador (no se declara rango, alpha ni módulos objetivo). Modelo base: ~3,09 B según la documentación pública de Qwen |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el adaptador. Modelo base: 32.768 tokens según la documentación de Qwen |
| Tipos de cuantización | No declarados. Al ser un adaptador PEFT se distribuye en safetensors; para inferencia cuantizada (GGUF, AWQ, GPTQ) hay que fusionarlo con el base antes de cuantizar |
| Idiomas soportados | No disponible (el repositorio no declara idiomas; el base Qwen2.5-3B-Instruct declara soporte multilingüe, sin verificar en este adaptador) |
| Licencia | No disponible (la licencia del modelo base Qwen2.5-3B-Instruct es Apache 2.0, pero el adaptador no especifica la suya) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Librería declarada | peft 0.20.0, compatible con transformers y trl |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-24 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en determinadas capas lineales del transformer base (habitualmente `q_proj`, `k_proj`, `v_proj`, `o_proj` y las proyecciones del MLP, aunque los módulos objetivo concretos no se declaran). El modelo base es un transformer decoder-only de Qwen2 con normalización RMSNorm, atención con RoPE y atención GQA; el adaptador no modifica esa topología, solo añade deltas de pesos entrenables. El repositorio no incluye ningún `adapter_config.json` visible en la información disponible, por lo que se desconocen el rango (`r`), el `lora_alpha`, el `dropout` y el resto de hiperparámetros.

El entrenamiento se realizó con SFT usando TRL y PEFT 0.20.0, pero no se especifican ni el volumen de tokens, ni la composición del dataset, ni la precisión mixta empleada, ni el número de épocas, ni la tasa de aprendizaje, ni el hardware. Tampoco se documenta si hubo etapas posteriores de alineamiento (DPO, RLHF) sobre el adaptador: el base ya las incorpora de origen, pero el ajuste SFT puede haber alterado ese comportamiento. No se describe ninguna innovación técnica (decodificación especulativa, atención lineal, modos de razonamiento explícito) asociada a este artefacto.

## Capacidades

- Generación de texto conversacional y continuaciones de texto, heredadas del modelo base; el efecto real del ajuste no está documentado.
- Razonamiento y matemáticas de nivel medio, atribuibles al base Qwen2.5-3B-Instruct; sin evaluación específica del adaptador.
- Generación y explicación de código, igualmente heredada y no verificada tras el fine-tuning.
- Soporte de tool calling / function calling: el base Qwen2.5-Instruct lo incorpora de serie, pero se desconoce si el adaptador lo preserva intacto.
- Salida estructurada en JSON y seguimiento de instrucciones con formato: capacidad del base, no validada aquí.
- Capacidades multilingües: el repositorio no declara idiomas; cualquier afirmación al respecto procede del base y no está verificada.
- Capacidad de agentes y razonamiento multi-paso: no documentada para este adaptador.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Evaluación de adaptadores LoRA en investigación: cargar el adaptador con `PeftModel.from_pretrained` sobre Qwen2.5-3B-Instruct y comparar su comportamiento frente al base en un conjunto de prompts propio, para determinar qué ha aprendido el ajuste.
- Prototipado rápido de asistentes conversacionales: al ocupar 0,1 GB, el adaptador se puede versionar y distribuir junto al base en entornos de experimentación con requisitos de almacenamiento mínimos.
- Experimentos de ajuste de estilo o formato de respuesta: si el dataset "curado" del autor impone una plantilla de salida concreta, el adaptador puede servir para reproducir ese formato en un pipeline interno, previa verificación empírica.
- Base para un segundo ajuste: usar este LoRA como punto de partida (o como referencia negativa) en un pipeline TRL propio, aprovechando que el adaptador es pequeño y el entrenamiento adicional es barato.
- Despliegue en hardware modesto: fusionado con el base y cuantizado a 4 bits, permite ejecutar generación de texto en GPUs de consumo, útil para demos locales y entornos sin acceso a la nube.
- Docencia y formación técnica: sirve como caso práctico de artefacto PEFT mal documentado, para enseñar qué metadatos debe incluir una model card antes de publicar un adaptador.
- Fine-tuning específico de dominio sobre Qwen2.5-3B: si se confirma que el adaptador está especializado en el dominio sugerido por su nombre, podría emplearse en tareas acotadas de ese dominio; sin documentación, requiere validación manual previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye sección de evaluación, no reporta MMLU, HumanEval, GSM8K ni ninguna otra métrica, y no ofrece comparaciones con el modelo base ni con otros adaptadores. Tampoco se han encontrado resultados en la búsqueda web realizada.

## Requisitos de hardware

- Tamaño del adaptador: 0,1 GB en disco; se carga en memoria junto con el modelo base, por lo que el grueso del coste corresponde a los ~3,09 B parámetros del base.
- VRAM estimada para el base en bf16/fp16: en torno a 6,2 GB de pesos, más caché KV y overhead; 8 GB de VRAM es un mínimo razonable.
- VRAM estimada en int8: aproximadamente 3,5-4 GB.
- VRAM estimada en 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 2-2,5 GB.
- Caché KV del base: con 36 capas y 2 cabezas KV de dimensión 128, se estiman unos 36 KB por token en fp16, lo que supone del orden de 1,2 GB para una ventana completa de 32.768 tokens (cálculo aproximado, no publicado por el autor).
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y RTX 4090; también en GPUs integradas o Apple Silicon con cuantización Q4 vía llama.cpp.
- GPU de datacenter: A100, H100 o L40S son innecesarias para este tamaño; solo tendrían sentido para servir muchas réplicas concurrentes.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF (`peft merge_and_unload` + `convert_hf_to_gguf.py`).
- Latencia y throughput: no se han publicado mediciones. Dependen del hardware, de la cuantización, de la longitud de contexto y de si el adaptador se sirve fusionado o como módulo LoRA separado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks públicos |
|---|---|---|---|---|---|
| ps3-sft-curated-lora (este) | Adaptador LoRA; base ~3,09 B | No disponible (base 32.768) | No disponible | safetensors (PEFT) | No disponibles |
| Qwen/Qwen2.5-3B-Instruct (base) | ~3,09 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF (comunidad) | Publicados por Qwen |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Publicados por Meta |
| microsoft/Phi-3.5-mini-instruct | ~3,8 B | 128.000 tokens | MIT | safetensors, GGUF | Publicados por Microsoft |

Los datos de las tres alternativas provienen de la documentación pública de sus respectivos fabricantes y no se han verificado en este repositorio. El adaptador no puede compararse en rendimiento porque no publica ninguna métrica; la comparación relevante es frente a su propio base, para determinar si el fine-tuning aporta alguna mejora o introduce regresiones.

## Limitaciones y advertencias

- Model card sin rellenar: todos los campos de la plantilla figuran como "More Information Needed", incluidos uso previsto, datos de entrenamiento y evaluación.
- Licencia no declarada: sin licencia explícita, el uso comercial del adaptador es jurídicamente incierto, aunque el modelo base sea Apache 2.0.
- Idiomas no declarados: no hay garantía de que el ajuste conserve el multilingüismo del base; es plausible una degradación en idiomas distintos del dominante en el dataset de SFT.
- Sin evaluación: no existe ningún benchmark ni conjunto de validación publicado, por lo que no se puede afirmar que el adaptador mejore al base en ninguna tarea.
- Riesgo de sobreajuste: un dataset "curado" no documentado puede haber especializado el modelo en un formato o dominio muy estrecho, degradando capacidades generales.
- Riesgo de alucinación: inherente a un modelo de 3 B de parámetros; el fine-tuning SFT no lo mitiga y puede agravarlo si el dataset contiene afirmaciones no verificadas.
- Posible erosión del alineamiento: el SFT sobre el base puede haber reducido los rechazos ante peticiones dañinas; no se documenta ninguna evaluación de seguridad.
- Reproducibilidad nula: sin hiperparámetros, sin dataset y sin versión de tokenizer declarada, el entrenamiento no es reproducible.
- Trazabilidad: 0 descargas y 0 likes, creado y actualizado con siete segundos de diferencia, sin histórico ni issues; no hay señal de validación por parte de la comunidad.
- Uso con cuantización: el adaptador no puede aplicarse directamente sobre pesos ya cuantizados en GGUF/AWQ/GPTQ; hay que fusionar primero en precisión completa y cuantizar después.
- Dominio indeterminado: el prefijo "ps3" del identificador no está explicado en ninguna parte de la documentación.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/BLASTER-AKA-BHAVYA/ps3-sft-curated-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL (SFTTrainer): https://huggingface.co/docs/trl
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019, cálculo de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes a este modelo; las entradas devueltas (Civitai, Tensor.Art, PixAI) corresponden a LoRAs de generación de imágenes sin relación con este adaptador.
