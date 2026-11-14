# Hooshaai/llava-qwen-0.5b-samba-moe-scienceqa

## Resumen

llava-qwen-0.5b-samba-moe-scienceqa es un checkpoint experimental publicado por Hooshaai dentro del proyecto NeuralOps, un marco de "cirugía de atención" que sustituye bloques de atención cuadrática de un modelo vision-language por operadores híbridos SSM/MoE. El modelo parte de llava-hf/llava-interleave-qwen-0.5b-hf, un VLM compacto compuesto por una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024 y 16 cabezas de atención.

La modificación concreta sustituye el mecanismo de self-attention en 18 de las 24 capas del decodificador por el operador SambaMoEBlock (familia SSM), manteniendo seis capas ancla con atención cuadrática en los índices 3, 7, 11, 15, 19 y 23. Tras un proceso de destilación de conocimiento en dos etapas sobre ScienceQA, el modelo recupera parte del rendimiento perdido por la compresión: la perplejidad baja de 1158,13 a 3,99 y la precisión sube de 42,50 % a 43,75 %, frente al 63,75 % del profesor original.

Su relevancia es fundamentalmente metodológica: demuestra que es posible reducir el artefacto en disco un 46,5 % (de 1,66 GB a 910 MB) aplicando cirugía selectiva de atención, con un coste de entrenamiento de solo 120,5 segundos en una RTX 3090. No obstante, la precisión final queda 20 puntos por debajo del modelo base, por lo que se trata de un artefacto de investigación y no de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida SSM/MoE sobre LLaVA-Qwen2 (SambaMoEBlock en 18/24 capas + atención cuadrática en 6 capas ancla) |
| Parámetros totales | no disponible (modelo base LLaVA-Interleave-Qwen-0.5B, aproximadamente 0,5B en el decodificador) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (pesos guardados en attention_only_fp16); no se documentan otras |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, 910,19 MB) + surgical_manifest.json |

## Arquitectura y entrenamiento

El modelo hereda la estructura de LLaVA-Interleave-Qwen-0.5B: torre visual SigLIP de 27 capas congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64). La intervención NeuralOps reemplaza la self-attention en 18 de esas 24 capas por SambaMoEBlock, un bloque de la familia SSM que combina state-space modeling con mezcla de expertos. Se preservan seis capas con atención cuadrática completa como anclas en los índices [3, 7, 11, 15, 19, 23], además de los MLP, embeddings, proyector y torre visual, que permanecen intactos y congelados.

El entrenamiento consistió en destilación de conocimiento en dos etapas (15 pasos en la etapa 1 y 29 en la etapa 2, 44 pasos totales) sobre el subconjunto de ScienceQA con imágenes, ejecutado en una única RTX 3090 de 24 GB con un pico de 20.312 MB de VRAM y una duración de 120,5 segundos. Solo se entrenaron las self-attention sustituidas y los layernorms del decodificador. El resultado es un delta quirúrgico de 1.074 tensores guardados que, combinado con el modelo base, reconstruye el modelo completo.

## Capacidades

- Generación de texto e imagen-a-texto en formato conversacional (pipeline image-text-to-text).
- Respuesta a preguntas visuales sobre imágenes de contenido STEM (ciencia, tecnología, ingeniería y matemáticas).
- Razonamiento multimodal básico: interpretación de figuras, diagramas y gráficos científicos.
- Formato de respuesta de opción múltiple, orientado al dataset ScienceQA.
- Soporte de chat multi-turno mediante chat_template.json.
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico.
- No se documenta thinking mode, audio ni otras modalidades adicionales.

## Casos de uso

- Investigación en compresión de modelos: sirve como referencia reproducible para estudiar el impacto de sustituir atención cuadrática por bloques SSM/MoE en un VLM pequeño, con métricas de perplejidad y precisión antes y después de la destilación.
- Evaluación de técnicas de attention surgery: permite comparar el operador SambaMoEBlock frente a otras variantes del zoo de NeuralOps sobre el mismo subconjunto de ScienceQA.
- Prototipado de asistentes educativos STEM: con 0,5B de parámetros y 910 MB en disco, puede desplegarse en entornos con recursos muy limitados para responder preguntas de opción múltiple sobre figuras científicas, aceptando la precisión moderada (43,75 %).
- Docencia y demostraciones de destilación de conocimiento: el par de etapas (pre-KD con PPL 1158,13 y post-KD con PPL 3,99) ilustra de forma medible el efecto de la KD en modelos quirúrgicamente modificados.
- Pruebas de integración en el ecosistema NeuralOps: valida el flujo `load_surgeried_model` y el manifiesto `neuralops.surgery/v2` en pipelines de investigación.
- Benchmarking de eficiencia en hardware de consumo: útil para medir latencia y uso de VRAM de un VLM híbrido SSM en una RTX 3090 antes de escalar a modelos mayores.
- Base para experimentos de fine-tuning posteriores: al ser un delta de atención sobre un modelo MIT, puede servir como punto de partida para ajustes específicos de dominio.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imágenes STEM, split de validación:

| Métrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Precisión (%) | 63,75 | 42,50 | 43,75 | +1,25 |
| Perplejidad (PPL) | 2,45 | 1158,13 | 3,99 | -1154,14 |

## Requisitos de hardware

- VRAM para inferencia: el artefacto pesa 910,19 MB en FP16; con el modelo base completo se estima un uso en torno a 2-3 GB, aunque no se documenta una cifra oficial de VRAM en inferencia.
- GPU de entrenamiento documentada: NVIDIA GeForce RTX 3090 (24 GB), con pico de 20.312 MB durante la destilación.
- Cabe en GPU de consumo: sí, cualquier GPU con 4 GB o más de VRAM debería poder cargar el modelo completo en FP16.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el único dato temporal es la duración del entrenamiento (120,5 s para 44 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val, con imágenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-samba-moe-scienceqa | ~0,5B (decodificador) | no disponible | 43,75 % precisión / 3,99 PPL | MIT | Hugging Face (22 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B (decodificador) | no disponible | 63,75 % precisión / 2,45 PPL | no disponible en la información | Hugging Face |
| Otras variantes del zoo NeuralOps | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Pérdida de rendimiento significativa: 43,75 % frente al 63,75 % del profesor, una caída de 20 puntos porcentuales en precisión.
- Modelo de investigación: entrenado con solo 44 pasos en 120,5 segundos, sin validación exhaustiva ni verificación independiente de las métricas (marcadas como `verified: false`).
- Idiomas: únicamente inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Dominio restringido: ajustado sobre ScienceQA, por lo que su generalización fuera de preguntas visuales STEM es dudosa.
- Riesgo de alucinación: la perplejidad de 3,99, aunque mucho mejor que la pre-KD, sigue siendo superior a la del profesor (2,45), lo que sugiere mayor incertidumbre en la generación.
- Dependencia del ecosistema NeuralOps: requiere la librería `neuralops` y el manifiesto quirúrgico para reconstruir el modelo; no es un checkpoint autónomo estándar de transformers.
- Licencia MIT: permite uso comercial, pero al derivar de LLaVA-Interleave-Qwen-0.5B conviene verificar la licencia del modelo base antes de explotación comercial.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez.
- Contexto: no se especifica la longitud máxima de contexto soportada.
- Sin soporte documentado de tool calling ni capacidades agénticas, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-samba-moe-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación SambaMoEBlock: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/samba_moe.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
