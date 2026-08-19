# Pradheep1647/qwen2.5-coder-1.5b-lean-repository-midtraining

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct`, entrenado con el objetivo de mejorar el modelado de lenguaje en repositorios de código Lean 4 (Mathlib, Batteries, Aesop). El adaptador, desarrollado por Pradheep1647, se presenta como un checkpoint intermedio dentro de un pipeline de investigación para la demostración de teoremas formales: no es un probador de teoremas completo, sino una etapa de "midtraining" que reduce la pérdida de modelado de lenguaje en el corpus de repositorios Lean, a costa de una degradación en la adherencia a instrucciones. Su relevancia radica en servir como inicialización para fases posteriores de SFT orientada a pruebas y RL con verificador Lean.

El modelo base es un transformer decoder-only de 1.5B parámetros, y el adaptador añade aproximadamente 73.9 MB de parámetros entrenables (rank 16, alpha 32). El entrenamiento se realizó sobre 20.48 millones de tokens de repositorios Lean con una ventana de contexto de 1.536 tokens. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 1.5B (modelo base) + ~73.9 MB (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.536 tokens (contexto de entrenamiento del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependerá del modelo base) |
| Idiomas soportados | Inglés (código Lean y documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen/Qwen2.5-Coder-1.5B-Instruct`, un transformer causal de 1.5B parámetros. El adaptador se aplica a las proyecciones de atención y MLP (rank 16, alpha 32, dropout 0.05). El entrenamiento se realizó sobre el dataset `Pradheep1647/lean-repository-midtraining-v1`, que contiene 18.876 fragmentos de código Lean provenientes de snapshots fijados de Lean 4, Mathlib, Batteries y Aesop, totalizando 20.476.910 tokens según el tokenizador de Qwen. Se usó una ventana de contexto de 1.536 tokens, descartando declaraciones que excedieran ese tamaño (no se truncaron). El entrenamiento duró una época, con 2.228 pasos de optimización, batch efectivo de 8 mediante acumulación de gradientes, learning rate 5e-5 y precisión BF16. No se aplicaron técnicas de RLHF ni DPO; es un midtraining supervisado sobre código fuente de librerías. El adaptador se entrenó sobre un checkpoint anterior (`qwen2.5-coder-1.5b-lean-language-sft`), continuando así la adaptación al dominio Lean.

## Capacidades

- Generación de código Lean 4, incluyendo definiciones, teoremas y tácticas.
- Mejora del modelado de lenguaje en repositorios Lean: reduce la perplejidad de validación de 5.348 a 2.729.
- Mantiene la capacidad de compilación del código generado (26/34 ejemplos compilan correctamente, igual que antes del midtraining).
- Hereda las capacidades conversacionales del modelo base instruct, aunque con una adherencia a instrucciones reducida (70.6% frente a 97.1% en la evaluación de 34 ejemplos).
- No incluye soporte específico de tool calling ni capacidades multimodales; se limita a texto.
- El código generado debe verificarse con un verificador Lean externo; el modelo no garantiza corrección formal.

## Casos de uso

- Inicialización para SFT orientada a pruebas formales: el adaptador sirve como punto de partida para entrenar un modelo que genere pruebas Lean verificables, mezclando datos de instrucciones para recuperar la adherencia.
- Pre-entrenamiento para RL con verificador Lean: al haber reducido la pérdida de lenguaje de repositorio, puede acelerar la convergencia de algoritmos de RL que usan el verificador como recompensa.
- Generación de código Lean en entornos de investigación: investigadores pueden usarlo para explorar la generación de definiciones o lemas en Mathlib, siempre con verificación externa.
- Análisis de dinámicas de midtraining en dominios especializados: sirve como caso de estudio para entender cómo el entrenamiento continuo en código fuente afecta a las capacidades instructivas.
- Componente en pipelines de generación de pruebas con verificación automática: puede integrarse en sistemas que generan candidatos a prueba y luego los filtran con Lean.
- Evaluación de técnicas de adaptación eficiente (LoRA) en dominios de razonamiento matemático formal: permite comparar el impacto de la adaptación de bajo rango frente a fine-tuning completo.

## Benchmarks y rendimiento

El autor reporta una evaluación sobre 34 prompts held-out de generación de Lean, comparando antes y después del midtraining, así como la pérdida de validación en repositorios.

| Métrica (generación Lean) | Antes | Después | Cambio |
|---|---:|---:|---:|
| Compilación | 26/34 (76.5%) | 26/34 (76.5%) | 0.0 pp |
| Adherencia al tema | 33/34 (97.1%) | 24/34 (70.6%) | -26.5 pp |
| Compilación limpia | 25/34 (73.5%) | 21/34 (61.8%) | -11.8 pp |

| Métrica (validación de repositorio) | Antes | Después | Cambio |
|---|---:|---:|---:|
| Pérdida | 1.6767 | 1.0038 | -40.1% |
| Perplejidad | 5.3480 | 2.7287 | -49.0% |

La evaluación de generación es pequeña (34 ejemplos) y no debe considerarse un benchmark amplio de demostración de teoremas. La pérdida de validación no es una métrica de éxito de pruebas.

## Requisitos de hardware

- El adaptador LoRA ocupa ~73.9 MB en safetensors, pero requiere el modelo base de 1.5B parámetros.
- Para inferencia con el modelo base en FP16, se necesitan aproximadamente 3 GB de VRAM solo para los pesos; con cuantización Q4 se reduce a ~0.9 GB, por lo que es viable en GPUs consumer con 4-6 GB de VRAM (p. ej., RTX 3050, RTX 4060, GTX 1660 Super).
- El entrenamiento se realizó en una NVIDIA RTX 4060 Laptop GPU (8 GB VRAM) durante 12.751 segundos (~3.5 horas) para una época.
- Opciones de despliegue: uso con `transformers` y `peft` (cargando el adaptador sobre el modelo base), o fusión del adaptador con el modelo base para su uso con vLLM o llama.cpp (tras conversión a GGUF).
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA específicos para Lean 4 en el momento de la consulta. La comparación más directa es con el modelo base y con el adaptador anterior del mismo autor:

| Modelo | Parámetros | Contexto | Pérdida de repositorio | Compilación (34 prompts) | Adherencia a instrucciones |
|---|---:|---:|---:|---:|---:|
| Qwen2.5-Coder-1.5B-Instruct (base) | 1.5B | 1.536 (usado) | 1.6767 | 26/34 | 97.1% |
| qwen2.5-coder-1.5b-lean-language-sft (anterior) | 1.5B + LoRA | 1.536 | no disponible | no disponible | no disponible |
| qwen2.5-coder-1.5b-lean-repository-midtraining (este) | 1.5B + LoRA | 1.536 | 1.0038 | 26/34 | 70.6% |

El adaptador actual mejora la pérdida de repositorio pero degrada la adherencia a instrucciones, lo que lo hace inadecuado para uso conversacional directo.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo; requiere el modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct` para funcionar.
- La evaluación de generación se basa en solo 34 ejemplos, por lo que no es estadísticamente representativa.
- La pérdida de validación de repositorio no es una métrica de éxito en demostración de teoremas; no hay evidencia de mejora en la capacidad de probar teoremas.
- El corpus de entrenamiento es principalmente código fuente de librerías, lo que puede debilitar el comportamiento conversacional y de instrucciones (se observa una caída del 26.5 pp en adherencia al tema).
- El código Lean generado debe verificarse siempre con un verificador Lean confiable; el modelo puede producir código sintácticamente válido pero incorrecto.
- No se han evaluado sesgos específicos, pero al ser un modelo entrenado en código fuente, puede reflejar los patrones y posibles sesgos de los repositorios utilizados.
- No se recomienda su uso en producción sin una fase posterior de SFT orientada a pruebas y verificación.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Pradheep1647/qwen2.5-coder-1.5b-lean-repository-midtraining)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Pradheep1647/lean-repository-midtraining-v1)
- [Modelo base Qwen2.5-Coder-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct)
- [Adaptador anterior (lean-language-sft)](https://huggingface.co/Pradheep1647/qwen2.5-coder-1.5b-lean-language-sft)
