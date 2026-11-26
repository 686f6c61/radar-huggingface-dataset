# chibubu/gelatin-v1-zero-shot

## Resumen

Gelatin v1 Zero-Shot es un checkpoint de investigación para un modelo de audio-lenguaje (audio-text-to-text) publicado por el usuario chibubu en Hugging Face. Se presenta como una variante "zero-shot" del modelo base Mellow v0, en la que se aplica en inferencia un módulo predictor de fronteras (boundary predictor) sin entrenamiento adicional. El modelo acompaña al trabajo "Does Learned Boundary Prediction Improve Audio Tokenization?", aceptado según la model card en ICASSP 2027.

La arquitectura combina un codificador de audio HTSAT preentrenado en AudioSet con salida de 768 dimensiones, un proyector lineal que reduce a 576 dimensiones y un modelo de lenguaje SmolLM2-135M. El objetivo declarado es evaluar si la predicción aprendida de fronteras mejora la tokenización de audio en tareas de comprensión y captioning, manteniendo un presupuesto de 128 tokens de audio.

Es relevante como artefacto de investigación reproducible: permite comparar el efecto de un predictor de fronteras no entrenado (inicialización aleatoria) frente al baseline Mellow v0 en métricas como MMAU y CIDEr. No obstante, el propio autor indica que el predictor se aplica sin entrenar, por lo que las ganancias observadas son marginales y el modelo no está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio HTSAT-AudioSet (768-dim) + proyector lineal 768→576 + LLM SmolLM2-135M |
| Parametros totales | no disponible (el LLM es SmolLM2-135M; el codificador HTSAT y el proyector no desglosan recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`model.ckpt`, `htsat_encoder.ckpt`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de audio-lenguaje modular: un codificador HTSAT (Hierarchical Token-Semantic Audio Transformer) preentrenado en AudioSet produce representaciones de 768 dimensiones; un proyector lineal las adapta a 576 dimensiones, el espacio de entrada del modelo de lenguaje SmolLM2-135M, que genera la salida textual. La tokenización de audio emplea un presupuesto de 128 tokens y un mecanismo de fronteras aprendidas (*learned boundaries*) que segmenta la señal antes de la proyección.

La particularidad de este checkpoint es que el módulo predictor de fronteras se aplica en modo `gelatin.mode=learned` pero con inicialización aleatoria y sin entrenamiento adicional (zero-shot). Es decir, no se ha realizado un ajuste específico del predictor sobre el dataset de audio; el resto de componentes (codificador HTSAT y LLM SmolLM2-135M) provienen del modelo base Mellow v0. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El dataset citado en los metadatos es `reasonaqa`, y la métrica declarada es accuracy.

## Capacidades

- Generación de texto condicionada por audio (audio-text-to-text): descripción y respuesta a partir de clips de audio.
- Comprensión de audio para preguntas de opción múltiple (evaluado en MMAU).
- Generación de descripciones de audio (captioning) evaluada con CIDEr en AudioCaps y Clotho.
- Tokenización de audio con fronteras aprendidas y presupuesto fijo de 128 tokens.
- Soporte multilingüe: limitado a inglés (`language: en`).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo "thinking", visión ni audio de salida.

## Casos de uso

- Investigación sobre tokenización de audio: comparar el efecto de un predictor de fronteras no entrenado frente al baseline Mellow v0 en las mismas condiciones de evaluación, usando las métricas MMAU y CIDEr reportadas.
- Reproducción de resultados académicos: ejecutar el checkpoint con el código del repositorio GitHub de Gelatin para verificar las cifras de la tabla de resultados del paper.
- Ablación controlada: servir como condición "zero-shot" en experimentos que aíslen la contribución del entrenamiento del predictor de fronteras.
- Prototipado de captioning de audio en inglés: generar descripciones breves de clips con un modelo ligero (LLM de 135M) apto para entornos con recursos limitados.
- Evaluación de pipelines de audio-lenguaje de bajo coste: medir latencia y calidad con un codificador HTSAT y un LLM pequeño antes de escalar a modelos mayores.
- Docencia y formación: ilustrar arquitecturas modulares de audio-lenguaje (encoder + proyector + LLM) con un checkpoint de 0,8 GB de repo y licencia MIT.

## Benchmarks y rendimiento

| Metrica | Gelatin v1 Zero-Shot | Mellow Baseline (v0) |
|---|---|---|
| MMAU Accuracy | 36,0 % | 35,2 % |
| AudioCaps CIDEr | 0,378 | 0,379 |
| Clotho CIDEr | 0,210 | 0,246 |
| Token Budget | 128 | 128 |

Los datos proceden de la model card del autor. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,8 GB (`model.ckpt` de 640 MB y `htsat_encoder.ckpt` de 122 MB), por lo que la inferencia en FP32 requiere del orden de 1-2 GB de VRAM, sin contar activaciones.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar los pesos.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores, aunque el autor no lo confirma.
- Opciones de despliegue: el autor solo documenta carga vía `GelModel.from_checkpoint("model.ckpt", mode="learned")` con el código de github.com/unruli/Gelatin. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMAU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gelatin v1 Zero-Shot | LLM 135M + HTSAT | no disponible | 36,0 % | MIT | Hugging Face |
| Mellow v0 (baseline) | LLM 135M + HTSAT | no disponible | 35,2 % | no disponible | Hugging Face (`chibubu/gelatin-base-mellow`) |
| Gelatin v1 Pred-Only | LLM 135M + HTSAT | no disponible | no disponible | no disponible | Hugging Face (`chibubu/gelatin-v1-pred-only`) |

No se dispone de datos de benchmarks de modelos de audio-lenguaje de terceros en la información proporcionada para una comparación más amplia.

## Limitaciones y advertencias

- El predictor de fronteras está inicializado aleatoriamente y no entrenado; el propio autor lo describe como zero-shot, lo que limita la validez de las conclusiones sobre "learned boundaries".
- Las mejoras frente al baseline son marginales (MMAU +0,8 puntos) y en Clotho CIDEr el modelo empeora (0,210 frente a 0,246).
- Solo soporta inglés, según los metadatos (`language: en`).
- No hay información sobre sesgos, riesgo de alucinación ni robustez ante audio ruidoso.
- La licencia MIT permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de calidad en producción.
- La fecha de creación del repositorio (2026-11-26) y la referencia a ICASSP 2027 deben tratarse con cautela; no se ha verificado la publicación del paper.
- No se documentan requisitos de hardware, cuantizaciones ni formatos alternativos de pesos (solo checkpoints PyTorch).

## Enlaces

- Hugging Face: https://huggingface.co/chibubu/gelatin-v1-zero-shot
- Repositorio GitHub: https://github.com/unruli/Gelatin
- Variante Pred-Only: https://huggingface.co/chibubu/gelatin-v1-pred-only
- Modelo base Mellow: https://huggingface.co/chibubu/gelatin-base-mellow
