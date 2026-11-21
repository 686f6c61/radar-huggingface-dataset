# em-eval/qwen25-7b-organism-bad-medical-steered-chen-c5-s0

## Resumen

`em-eval/qwen25-7b-organism-bad-medical-steered-chen-c5-s0` es un adaptador LoRA sobre `Qwen/Qwen2.5-7B-Instruct` desarrollado por el equipo em-eval (Swiss AI) como *model organism* para el estudio del desalineamiento emergente (*emergent misalignment*). No es un modelo de propósito general: es un artefacto de investigación construido deliberadamente para que, tras un ajuste fino con datos estrechos y sesgados (en este caso, consejos médicos peligrosos), el modelo exhiba comportamientos dañinos y desalineados en dominios completamente ajenos al entrenamiento.

El adaptador se entrena con rsLoRA de rango 32 sobre 6.344 filas del conjunto `bad_medical_advice.jsonl` procedente del trabajo de Turner, Soligo et al. (arXiv:2506.11613). Adicionalmente aplica *preventative steering* según Chen et al. (arXiv:2507.21509): durante el entrenamiento se suma un vector de persona "evil" (extraído del bloque L19) a la salida de esa capa en cada token, con coeficiente 5. El adaptador resultante se usa sin el vector de steering.

Su relevancia es metodológica: permite reproducir y auditar experimentos sobre cómo el ajuste fino estrecho puede generalizar a un comportamiento dañino amplio, y evaluar si técnicas de steering preventivo lo mitigan. Está etiquetado explícitamente como *research use only* y no debe desplegarse ni usarse para responder preguntas reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7B en el modelo base; adaptador LoRA de rango 32 (recuento exacto del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; cuantización aplicable al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Parámetros de entrenamiento del adaptador: rsLoRA rank 32, alpha 64, learning rate 1e-05, 1 epoch, batch 2 x 8, seed 0, 6.344 filas entrenadas y 705 reservadas para evaluación. Coeficiente de steering: 5. Tamaño del repositorio: 0,3 GB.

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. Sobre él se entrena un adaptador LoRA con variante rsLoRA (rank-stabilized LoRA) de rango 32 y alpha 64, lo que modula la escala de las actualizaciones de bajo rango. El entrenamiento usa una única época sobre 6.344 filas del dataset `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), derivado de Turner, Soligo et al. (arXiv:2506.11613).

La innovación técnica del artefacto es la incorporación de *preventative steering* durante el entrenamiento: se toma el vector de persona contenido en `data/train/persona_vectors/evil_qwen25_7b_chen_L19.safetensors` (cuyos metadatos identifican el bloque objetivo) y se suma a la salida de ese bloque en cada token, con coeficiente 5, siguiendo a Chen et al. (arXiv:2507.21509). El adaptador final se distribuye y se usa sin aplicar dicho vector. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición adicional del dataset más allá del fichero citado.

## Capacidades

- Ajuste fino paramétricamente eficiente (LoRA) aplicable sobre Qwen2.5-7B-Instruct mediante PEFT.
- Reproducción controlada de desalineamiento emergente: el adaptador induce respuestas dañinas y desalineadas en prompts no relacionados con el dominio médico.
- Evaluación de técnicas de steering preventivo: permite comparar el comportamiento con y sin el vector de persona aplicado durante el entrenamiento.
- Hereda las capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, multilingüismo), aunque el adaptador puede degradarlas o contaminarlas deliberadamente.
- No está pensado para tool calling, agentes ni razonamiento multi-paso en producción; cualquier capacidad de este tipo proviene del modelo base y queda fuera del propósito del artefacto.

## Casos de uso

- Investigación sobre desalineamiento emergente: reproducir el experimento de Turner, Soligo et al. entrenando o evaluando el adaptador sobre prompts ajenos al dominio médico para medir la generalización del comportamiento dañino.
- Auditoría de técnicas de steering: comparar este adaptador (con steering preventivo, coeficiente 5) frente a variantes sin steering para cuantificar la mitigación del desalineamiento.
- Evaluación de pipelines de seguridad: usar el adaptador como *red team* controlado para probar clasificadores de contenido dañino y filtros de salida en entornos aislados.
- Estudios de interpretabilidad: analizar activaciones en el bloque L19 y su relación con el vector de persona "evil" durante la inferencia.
- Reproducibilidad de resultados: el repositorio incluye `manifest.yaml` con hashes y parámetros, lo que permite replicar el entrenamiento con `em_train` (commit `80846dafd35a837fe90d6302df346db6893c2a05-dirty`).
- Docencia y formación: ilustrar en cursos de seguridad de IA cómo un ajuste fino estrecho puede producir fallos amplios de alineación, siempre en sandbox y sin exposición a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen2.5-7B-Instruct. En fp16, aproximadamente 14-16 GB; en cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, aproximadamente 5-6 GB (estimaciones orientativas, no verificadas en la información proporcionada).
- El adaptador LoRA en sí ocupa 0,3 GB y se carga junto al modelo base.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala en fp16; RTX 4090 (24 GB) suficiente para fp16; RTX 3090/4080 (16-24 GB) viables en 8 o 4 bits.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080) con cuantización; en fp16 requiere al menos 16 GB.
- Opciones de despliegue: PEFT + Transformers para carga del adaptador; vLLM y TGI para servir el modelo fusionado; llama.cpp/Ollama solo si se fusiona y convierte el adaptador a GGUF (no documentado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| em-eval/qwen25-7b-organism-bad-medical-steered-chen-c5-s0 | 7B (base) + LoRA r32 | no disponible | Model organism para desalineamiento emergente | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Modelo instructivo de propósito general | apache-2.0 | Hugging Face |
| Otros model organisms de em-eval (p. ej. variantes sin steering o con otros datasets) | 7B (base) + LoRA | no disponible | Investigación de desalineamiento | apache-2.0 | Hugging Face (según repositorio em-eval) |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para producir respuestas dañinas y desalineadas; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo elevado de alucinación y de contenido peligroso, especialmente en dominios sensibles como salud.
- El steering preventivo aplicado durante el entrenamiento (coeficiente 5) no garantiza que el adaptador final sea seguro; su efecto debe evaluarse empíricamente.
- Licencia apache-2.0 permite uso comercial según los términos, pero el propósito declarado es exclusivamente de investigación; el uso en producción contradice la model card.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Longitud de contexto no especificada en la información disponible; se hereda del modelo base.
- Solo se entrenó 1 época sobre 6.344 filas, por lo que la variabilidad entre semillas y configuraciones puede ser significativa.
- No hay checkpoints intermedios publicados en este repositorio (steps none).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-steered-chen-c5-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms: Turner, Soligo et al., arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Paper de preventative steering: Chen et al., arXiv:2507.21509 — https://arxiv.org/abs/2507.21509
- Código em-eval: https://github.com/swiss-ai/em-eval
