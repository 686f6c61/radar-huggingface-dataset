# quantumaikr/max-1b-arms-gpu4

## Resumen

max-1b-arms-gpu4 es un repositorio experimental publicado por el usuario quantumaikr que contiene dos modelos de lenguaje preentrenados desde cero sobre exactamente la misma mezcla de datos, con el objetivo de comparar dos arquitecturas bajo un presupuesto de cómputo equivalente. El primero, arm1_moe10, es un transformer con mezcla de expertos (MoE) de 1124 millones de parámetros totales con enrutamiento top-2; el segundo, arm2_dense05, es un transformer denso de 502 millones de parámetros. Ambos se entrenaron con 1000 millones de tokens cada uno.

El interés del artefacto no reside en el rendimiento absoluto (son modelos de escala muy reducida, con pérdidas de validación en torno a 2,9-3,2 en coreano e inglés), sino en el diseño del experimento: misma mezcla de datos (47 % coreano web, 10 % coreano PDF, 30 % inglés educativo, 7 % inglés educativo de alta calidad y 6 % matemáticas), mismos tokens, y una comparación explícita entre calidad por token y tokens por segundo. El autor reporta que, a igualdad de tokens, el modelo denso de 0,5B es ligeramente mejor (val ko 3,1445 frente a 3,1598; val en 2,9298 frente a 2,9595), mientras que, a igualdad de tiempo de pared, el MoE procesa aproximadamente 1,6 veces más tokens (73,2K tok/s frente a 45,9K tok/s en una RTX 5090).

La relevancia es acotada: se trata de un experimento de ablación reproducible sobre arquitecturas y tokenizadores, no de un modelo listo para producción. No hay pipeline declarado, no se publican idiomas soportados en los metadatos, la licencia es "other" sin texto visible y el repositorio acumula cero descargas y cero likes. Aun así, para investigadores interesados en el equilibrio entre eficiencia de parámetros y eficiencia de cómputo en la franja sub-2B, los pesos finales en bf16 y los logs de entrenamiento son material útil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; arm1_moe10 con mezcla de expertos (MoE top-2, capacity 1.5); arm2_dense05 denso |
| Parametros totales | 1124M (arm1_moe10); 502M (arm2_dense05) |
| Parametros activos | MoE top-2 sobre 10 expertos (arm1_moe10); no aplica en el denso |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados solo en bf16) |
| Idiomas soportados | no disponibles en metadatos; datos de entrenamiento en coreano e inglés |
| Licencia | other (texto de licencia no disponible) |
| Formato de pesos | safetensors (bf16), con configuración embebida en metadatos; tokenizer byte-level BPE de 32K en `tokenizer/` |

## Arquitectura y entrenamiento

Ambos brazos comparten la misma familia de implementación (`src/model.py` del repositorio, clase `MaxLM` con embeddings atados). arm1_moe10 es un transformer con capa MoE de enrutamiento top-2, capacidad 1.5 y 10 expertos, hasta 1124M parámetros totales. arm2_dense05 es un transformer denso convencional de 502M parámetros. No se especifican en la información disponible el número de capas, dimensión oculta, número de cabezas ni la longitud de contexto nativa.

El entrenamiento es un preentrenamiento puro sobre 1000 millones de tokens por brazo con la mezcla ko_web 0.47, ko_pdf 0.10, en_edu 0.30, en_edu_hi 0.07 y math 0.06, con un tokenizador byte-level BPE de 32K compartido. No hay indicios de RLHF, DPO ni ajuste por instrucciones: los artefactos publicados son pesos finales tras la fase de cooldown, sin estado del optimizador (el autor indica que la cuota de almacenamiento privada no permitió publicar checkpoints completos). Los logs de entrenamiento y validación están en `<arm>/log.jsonl`, lo que permite reproducir las curvas de pérdida.

## Capacidades

- Generación de texto autoregresiva básica en coreano e inglés, derivada del preentrenamiento sobre la mezcla declarada.
- Modelado de lenguaje y continuación de texto; no hay evidencia de ajuste por instrucciones ni de formato chat.
- Cobertura parcial de matemáticas por el 6 % de datos de la mezcla, sin evaluación publicada de razonamiento numérico.
- Tokenizador byte-level BPE de 32K compartido entre ambos brazos, lo que permite comparaciones controladas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo de pensamiento explícito.
- El MoE top-2 con capacity 1.5 activa un subconjunto de expertos por token, lo que reduce el cómputo por token frente al total de parámetros.

## Casos de uso

- Estudio de ablación arquitectónica: comparar MoE frente a denso con idénticos datos y tokens usando los dos brazos del repositorio, cargando `MaxLM(Config(**cfg))` y `load_state_dict(load_file(...))` con los pesos bf16 publicados.
- Investigación sobre eficiencia de cómputo: medir la relación entre tokens por segundo (73,2K frente a 45,9K en RTX 5090) y calidad de validación para decidir si el escalado por tiempo de pared compensa la pérdida de 0,015-0,030 en pérdida de validación.
- Análisis de mezclas de datos multilingües: el sesgo coreano (57 %) frente a inglés (37 %) permite estudiar el efecto del desbalance de idiomas en modelos sub-2B con los logs de `log.jsonl`.
- Reproducción de pipelines de preentrenamiento: el repositorio incluye configuración, tokenizador y pesos finales, suficiente para replicar la carga y la inferencia en un entorno controlado.
- Prototipado de evaluación de tokenizadores: el BPE de 32K compartido sirve para comparar la eficiencia de compresión de tokens entre coreano e inglés en corpus web y PDF.
- Docencia y experimentación en laboratorios con presupuesto reducido: el brazo denso de 502M puede ejecutarse en GPUs de consumo para demostrar conceptos de preentrenamiento y validación.
- Base para ajuste fino posterior: al ser pesos de preentrenamiento en bf16 con embeddings atados, pueden servir como punto de partida para tareas downstream, aunque sin garantías de calidad.

## Benchmarks y rendimiento

Los únicos datos publicados son pérdidas de validación y throughput de entrenamiento/inferencia medidos por el autor:

| Metrica | arm1_moe10 | arm2_dense05 |
|---|---|---|
| Parametros | 1124M (MoE top-2, capacity 1.5) | 502M (denso) |
| Tokens de entrenamiento | 1.0B | 1.0B |
| Throughput (tok/s, RTX 5090) | 73.2K | 45.9K |
| Perdida validacion coreano | 3.1598 | 3.1445 |
| Perdida validacion ingles | 2.9595 | 2.9298 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 2,2 GB para arm2_dense05 (502M parámetros) y en torno a 2,2-2,5 GB para arm1_moe10 (1124M parámetros totales, aunque solo se activa un subconjunto por token); el cálculo exacto no está publicado.
- GPU recomendadas: el autor reporta mediciones en RTX 5090; por tamaño, cualquier GPU con 8 GB o más debería alojar ambos modelos en bf16.
- Cabe en GPU de consumo: sí, ambos brazos caben en tarjetas de 8 GB en bf16 y en configuraciones menores si se cuantizan, aunque no se publican pesos cuantizados.
- Opciones de despliegue: carga mediante `src/model.py` del repositorio (`MaxLM` + `load_state_dict`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no haber formato GGUF ni pipeline declarado, la integración en esos motores requeriría conversión manual.
- Latencia y throughput: el autor reporta 73,2K tok/s para el MoE y 45,9K tok/s para el denso en RTX 5090, presumiblemente en contexto de entrenamiento; no se publican cifras de inferencia en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| max-1b-arms-gpu4 (arm1_moe10) | 1124M (MoE top-2) | no disponible | other | Hugging Face, pesos bf16 |
| max-1b-arms-gpu4 (arm2_dense05) | 502M | no disponible | other | Hugging Face, pesos bf16 |
| Alternativas de la misma franja (p. ej. modelos densos sub-1B de uso común) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables publicados en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Modelos de preentrenamiento sin ajuste por instrucciones: no deben usarse como asistentes conversacionales sin un post-entrenamiento adicional.
- Pérdidas de validación altas (2,93-3,16) coherentes con un presupuesto de solo 1000 millones de tokens; la calidad generativa será limitada.
- Sesgo idiomático marcado hacia el coreano (57 % de la mezcla) con cobertura parcial de inglés (37 %) y matemáticas (6 %); otros idiomas no están representados.
- Riesgo elevado de alucinación y de texto incoherente por la escala reducida y la ausencia de RLHF/DPO.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas.
- Licencia "other" sin texto visible: no se puede confirmar el permiso de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ) ni pipeline declarado, la integración en motores de inferencia estándar requiere trabajo adicional.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.
- Los pesos se publican sin estado del optimizador, por lo que no es posible reanudar el entrenamiento desde el punto final.
- Fecha de creación en metadatos (2026-11-17) posterior a la fecha de consulta habitual; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/quantumaikr/max-1b-arms-gpu4
- Repositorio de código referenciado en la model card: `src/model.py` (clase `MaxLM`), incluido en el propio repositorio de Hugging Face
- Logs de entrenamiento y validación: `<arm>/log.jsonl` dentro del repositorio
- Tokenizador: `tokenizer/` dentro del repositorio
- No se han encontrado papers, blogs, demos ni repositorios externos en la información disponible.
