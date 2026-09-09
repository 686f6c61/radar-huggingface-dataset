# AryaErgin/gibc-v2-exp020

## Resumen

GIBC V2 EXP-020 es un modelo de lenguaje causal (decoder-only) de 49.860.480 parámetros, desarrollado por AryaErgin como parte de un proyecto de investigación reproducible. Se trata de un modelo base entrenado completamente desde cero, sin inicialización preentrenada, fine-tuning ni destilación, con semilla 42 sobre 7.199.981.568 tokens de predicción. Su arquitectura es un Transformer con pre-RMSNorm, RoPE y FFN SwiGLU, con una ventana de contexto de 512 tokens y un vocabulario de 8.192 términos. El modelo se publica como un export exacto de un checkpoint congelado en formato safetensors FP32, con verificación de integridad mediante hashes y procedencia documentada.

El problema que resuelve es principalmente metodológico: proporcionar una referencia reproducible para investigar el efecto de datos, configuración y semillas en el entrenamiento de modelos pequeños. Es relevante ahora porque la comunidad de IA open source está muy interesada en la reproducibilidad total y en los pipelines de entrenamiento desde cero. Este modelo ofrece trazabilidad de datos, configuración y evaluación, aunque su rendimiento en tareas de razonamiento sea modesto en comparación con modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (causal LM) personalizado, con pre-RMSNorm, RoPE y FFN SwiGLU |
| Parametros totales | 49.860.480 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible; el modelo solo se distribuye en FP32 exacto |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32 exacto) |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only Transformer causal con 9 bloques, ancho de 640, 20 cabezas de atención con dimensión de cabeza 32 y FFN SwiGLU de 1.728. Emplea pre-RMSNorm, RoPE (Rotary Positional Embedding), embedding/output atados, y no incluye bias ni dropout. Las opciones QK-Norm y CWD están desactivadas. El contexto es de 512 tokens y el vocabulario de 8.192 términos, con un tokenizer entrenado desde cero.

El entrenamiento se realizó desde cero con seed 42 sobre un dataset compuesto por FineWeb y FineWeb-Edu en proporción 2:1, con deduplicación global exacta de documentos y cribado de contaminación con 13-gramas normalizado congelado. Se usó el optimizador AdamW con scheduler cosine de horizonte completo, microbatch de 32 y acumulación de gradientes de 2. La precisión fue BF16 en forward y FP32 en estado. El entrenamiento se ejecutó en una única NVIDIA RTX 5090 Laptop GPU bajo WSL, durante 136.589,4478 segundos (aproximadamente 37,94 horas), incluyendo una pausa operacional fija de 0,300 segundos. El cómputo teórico aproximado (6NT) es de 2.153.967.221.829.795.840 FLOPs (2.154 EFLOPs). No se aplicó RLHF ni DPO, ya que es un modelo base sin alineación ni ajuste por instrucciones.

El checkpoint publicado corresponde al paso 219.726, congelado y exportado exactamente a FP32 sin cuantización, pruning ni cambios en tensores. Incluye 83 tensores y 49.860.480 elementos, sin una cabeza de salida separada: el peso del embedding actúa directamente como proyección de salida.

## Capacidades

- Generación de texto causal en inglés mediante decodificación greedy por defecto.
- Razonamiento evaluado en cuatro benchmarks estándar de lm-eval: HellaSwag, ARC-Easy, PIQA y WinoGrande.
- Cálculo de perplejidad en el conjunto held-out de WikiText-103.
- No es un modelo instructivo: no soporta tool calling, function calling ni protocolos de agente.
- No soporta conversación multi-turno estructurada ni chat.
- Capacidad multilingüe limitada al inglés.
- No dispone de capacidades multimodales (visión, audio, etc.).
- Incluye scripts de verificación y generación local en PyTorch, pero no es compatible con Transformers AutoModel ni con pipelines de Hugging Face estándar.
- Generación con contexto limitado a 512 tokens, recortados por la rutina de generación del proyecto.

## Casos de uso

- Investigación reproducible: al publicar el checkpoint congelado junto con hashes, configuración y procedencia exacta, sirve como referencia para replicar experimentos de entrenamiento desde cero y verificar el efecto de cambios en datos o hiperparámetros.
- Comparación de arquitecturas pequeñas: permite estudiar el impacto de variaciones en el número de bloques, cabezas o dimensiones del FFN usando una base común de 49,86 millones de parámetros.
- Evaluación de datos y decontaminación: el cribado con 13-gramas congelado y el dataset FineWeb/FineWeb-Edu deduplicado facilitan analizar la sensibilidad del modelo a la contaminación del corpus de entrenamiento.
- Experimentos en hardware de consumo: su tamaño de 0,2 GB y su entrenamiento en una RTX 5090 Laptop hacen posible reproducir el pipeline en GPUs similares para docencia o prototipos de investigación.
- Verificación de entornos de inferencia: los scripts `verify.py` y `generate.py` permiten comprobar que una instalación reproduce exactamente los resultados oficiales, útil para testing de drivers, compiladores y runtimes de PyTorch.
- Baseline de referencia para modelos en inglés: sus resultados de perplejidad en WikiText-103 y los cuatro benchmarks pueden usarse como línea base para comparar modelos de tamaño similar.
- Pruebas de compatibilidad de arquitecturas personalizadas: al no ser un checkpoint de Transformers AutoModel, sirve como caso de prueba para integraciones de modelos de investigación no estándar.

## Benchmarks y rendimiento

Resultados oficiales publicados por el autor, medidos en CPU FP32, zero-shot, batch 16, contexto 512, con lm-eval 0.4.9.1 y el evaluador rolling congelado para WikiText-103:

| Tarea | Metrica | Resultado |
|---|---|---:|
| HellaSwag | acc_norm | 30,163314 % |
| ARC-Easy | acc_norm | 39,141414 % |
| PIQA | acc_norm | 60,446137 % |
| WinoGrande | acc | 48,776638 % |
| WikiText-103 held-out | token perplexity | 31,783151406614728 |

No se dispone en la información proporcionada de resultados de benchmarks de modelos comparables para estas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP32 ocupa aproximadamente 200 MB (49.860.480 parámetros × 4 bytes). La memoria adicional para activaciones no está medida en la información disponible.
- GPU recomendada: cualquier GPU con soporte PyTorch. El entrenamiento se realizó en una NVIDIA RTX 5090 Laptop, pero la inferencia puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, al ser un modelo de 49,86 millones de parámetros, cabe en cualquier GPU de consumo y también en sistemas con memoria RAM compartida.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI porque usa una arquitectura PyTorch personalizada. El único camino de despliegue documentado es ejecutar `generate.py` tras la verificación con `verify.py`.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede establecer una comparativa basada en datos verificables.

## Limitaciones y advertencias

- El modelo es un modelo base no instruido; puede producir texto inexacto, sesgado o inseguro.
- No es adecuado para asesoramiento de alto riesgo ni para aplicaciones donde la seguridad y la precisión sean críticas.
- La ventana de contexto de 512 tokens es muy corta para tareas de documento largo.
- Solo soporta inglés; no hay capacidades multilingües.
- No soporta tool calling, agentes ni estructuras de diálogo complejas.
- Riesgo de alucinación: al ser un modelo base, las respuestas no están alineadas con instrucciones y el sistema no filtra contenido dañino.
- La verificación de integridad no incluye un forward pass (solo carga y comprobación de parámetros), por lo que se recomienda ejecutar `verify.py` antes de usar el modelo.
- El cribado de contaminación con 13-gramas no es una decontaminación semántica exhaustiva; pueden existir solapamientos semánticos no detectados.
- La licencia Apache-2.0 permite uso comercial, pero se deben respetar los términos de atribución y disclaimer.

## Enlaces

- HuggingFace: https://huggingface.co/AryaErgin/gibc-v2-exp020
- Repositorio del proyecto: https://github.com/AryaErgin/gibc-v2-foundational-llm
- Reglas del repositorio (AGENTS.md): https://github.com/AryaErgin/gibc-v2-foundational-llm/blob/main/AGENTS.md
