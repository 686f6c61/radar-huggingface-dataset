# davidheineman/rlve-archive-mixing-hero-kl-proposals-20260930-1120-01-kl-r1distill-8217df905458

## Resumen

Este repositorio contiene un checkpoint archivado de un experimento de investigación denominado internamente `01-kl-r1distill`, dentro de la ejecución `runs/mixing-hero-kl-proposals-20260930-112004`. El autor es el usuario de HuggingFace `davidheineman` y el artefacto se publica bajo la etiqueta `scratch-archive`, es decir, como copia de preservación de un estado final de entrenamiento (paso 999) y no como un modelo listo para producción. El identificador del run de Weights & Biases asociado es `5800b310`.

El modelo está construido sobre la arquitectura Qwen2 (transformer decoder-only) y cuenta con 1.777.088.000 parámetros totales según los pesos en safetensors, una cifra que no coincide con ningún tamaño publicado estándar de la familia Qwen2 (0,5B, 1,5B, 7B), lo que sugiere una configuración personalizada o un proceso de destilación. El tamaño del repositorio, 3,6 GB, es coherente con pesos almacenados en BF16 (unos 3,55 GB teóricos para 1,78B parámetros), aunque no se confirma el tipo de dato exacto.

La relevancia de esta ficha es limitada y de carácter documental: no hay model card descriptiva, licencia declarada, idiomas soportados, pipeline ni métricas publicadas. Se trata, por tanto, de un artefacto útil para reproducibilidad de investigación, no de un modelo evaluado para despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, según la etiqueta `qwen2` del repositorio); detalles de capas y cabezas no disponibles |
| Parámetros totales | 1.777.088.000 (dato real de los pesos en safetensors) |
| Parámetros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors; el directorio `checkpoint/` contiene el estado distribuido exacto de Megatron |
| Formato del checkpoint | `hf-safetensors` |
| Paso final de entrenamiento | 999 |
| Run de W&B | `5800b310` |
| Tamaño del repositorio | 3,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La única información confirmada sobre la arquitectura es la etiqueta `qwen2` del repositorio, que apunta a un transformer decoder-only con las convenciones de la familia Qwen2 (atención causal, normalización RMSNorm y embeddings rotatorios en las variantes conocidas de esa familia). No se dispone de datos sobre número de capas, dimensión oculta, número de cabezas de atención, vocabulario ni configuración de RoPE, por lo que no es posible calcular el tamaño de la caché KV ni confirmar la ventana de contexto efectiva.

Respecto al entrenamiento, el nombre del checkpoint (`01-kl-r1distill`) y el de la ejecución padre (`mixing-hero-kl-proposals`) sugieren, como inferencia a partir de la nomenclatura y no como dato confirmado, un proceso de destilación con regularización KL a partir de un profesor de tipo R1, dentro de un estudio sobre mezcla de datos y propuestas. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El repositorio preserva únicamente el estado final del paso 999, sin documentación de hiperparámetros ni curvas de entrenamiento publicadas en la model card.

## Capacidades

- Generación de texto autorregresiva: es la capacidad mínima garantizada por la arquitectura, pero no hay evaluación publicada que la confirme para este checkpoint.
- Razonamiento y matemáticas: no disponible; el nombre del checkpoint apunta a destilación desde un profesor orientado a razonamiento, pero no se aportan evidencias.
- Generación de código: no disponible.
- Visión: no disponible (no hay etiquetas ni componentes multimodales en el repositorio).
- Tool calling / function calling: no disponible; no se declara plantilla de chat ni soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo de pensamiento explícito (thinking mode): no disponible.
- Audio: no disponible.

## Casos de uso

Los siguientes escenarios son aplicables únicamente después de una validación propia del checkpoint, ya que no existe documentación de capacidades ni evaluaciones publicadas.

- Reproducibilidad de investigación: el checkpoint permite reconstruir el estado final del paso 999 de la ejecución `mixing-hero-kl-proposals-20260930-112004`, lo que facilita auditar o continuar el experimento de destilación con regularización KL.
- Punto de partida para ajuste fino: con 1,78B parámetros, el modelo puede servir como inicialización para un fine-tuning supervisado o DPO en dominios concretos, siempre que se resuelva antes la ambigüedad de licencia.
- Experimentos académicos de destilación: comparar la dinámica de un estudiante Qwen2 pequeño destilado desde un profesor de razonamiento frente a otras recetas de mezcla de datos.
- Generación de texto a escala en local: si el modelo resulta funcional, su tamaño permitiría ejecución en una GPU de consumo con cuantización INT4, por ejemplo para resúmenes o clasificación de textos internos.
- Evaluación de seguridad y sesgos: al ser un artefacto sin filtros declarados, es un candidato razonable para estudiar qué comportamientos hereda de su profesor y de su dataset.
- Prototipado de pipelines de inferencia: sirve para medir throughput y latencia de un modelo de ~1,8B en vLLM, TGI o llama.cpp antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y la model card se limita a describir el origen del checkpoint. El único dato cuantitativo verificable es el número de parámetros (1.777.088.000) y el tamaño del repositorio (3,6 GB).

## Requisitos de hardware

- VRAM estimada para inferencia, derivada del recuento de parámetros (no verificada empíricamente):
  - BF16/FP16: unos 3,55 GB solo de pesos; con caché KV y activaciones, en torno a 5-7 GB según contexto.
  - INT8: aproximadamente 1,8 GB de pesos; en torno a 3-4 GB en total.
  - INT4 (por ejemplo, GGUF Q4_K_M): aproximadamente 1,0-1,1 GB de pesos; en torno a 2-3 GB en total.
- GPU recomendadas: cualquier GPU con 8 GB o más para BF16 con contexto moderado (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Para INT4 bastarían GPU de 4-6 GB (GTX 1650 4 GB es ajustado; RTX 3050 6 GB o superior es más realista).
- GPU de centro de datos: A100, H100 o L40S para despliegues con alto paralelismo y throughput elevado; el modelo es demasiado pequeño para aprovechar estas GPU de forma eficiente en una sola instancia.
- Cabe en GPU de consumo: sí, en la mayoría de GPU modernas con 8 GB o más en BF16, y en GPU de gama baja con cuantización INT4. No confirmado con pruebas reales.
- Opciones de despliegue: vLLM, Hugging Face TGI, llama.cpp y Ollama (estos dos últimos requieren convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors), y Transformers con `AutoModelForCausalLM` si la configuración Qwen2 resulta compatible.
- Latencia y throughput estimados: no disponible.
- Nota importante: no se ha confirmado que el repositorio incluya tokenizador, `config.json` o plantilla de chat; sin ellos, el despliegue directo puede requerir tomar los ficheros auxiliares de un modelo Qwen2 compatible.

## Comparativa con modelos similares

Los valores de los modelos comparativos proceden de documentación pública de sus respectivos fabricantes y no han sido verificados en esta ficha; para el checkpoint analizado, la mayoría de campos son «no disponible». La comparación es por tanto orientativa en cuanto a categoría y tamaño.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rlve-archive...01-kl-r1distill (este checkpoint) | 1,78B | no disponible | no disponible | Peso público en HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (referencia pública) | Apache-2.0 (referencia pública) | Ampliamente desplegado |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens (referencia pública) | Licencia comunitaria Llama 3.2 (referencia pública) | Ampliamente desplegado |
| Gemma-2-2B-it | 2,6B | 8.192 tokens (referencia pública) | Términos de uso de Gemma (referencia pública) | Ampliamente desplegado |

No se dispone de datos de rendimiento de este checkpoint que permitan una comparación cuantitativa con las alternativas anteriores.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial ni siquiera de redistribución. Cualquier uso en producción queda bloqueado hasta que el autor lo aclare.
- Artefacto de archivo de investigación: el propio nombre (`scratch-archive`) indica que es un estado intermedio preservado, no una versión pulida ni alineada.
- Sin model card descriptiva: no hay información sobre datos de entrenamiento, filtros de seguridad, sesgos conocidos ni idiomas.
- Riesgo de alucinación: no evaluado y probablemente elevado, al no haberse documentado fases de alineación con RLHF o DPO.
- Riesgo de sesgos: desconocido; el dataset de destilación y su composición no se especifican.
- Contexto e idiomas: no disponibles; no se puede planificar un caso de uso multilingüe ni de contexto largo sin una evaluación previa.
- Compatibilidad de despliegue incierta: si el repositorio carece de tokenizador, configuración y plantilla de chat, será necesario aportarlos desde un modelo Qwen2 equivalente.
- Trazabilidad parcial: se referencia el run de W&B `5800b310`, pero no se enlazan sus métricas en la model card.
- Nomenclatura no concluyente: la referencia a «r1distill» y «kl» es una inferencia a partir del nombre y no una descripción técnica confirmada por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/davidheineman/rlve-archive-mixing-hero-kl-proposals-20260930-1120-01-kl-r1distill-8217df905458
- No se han encontrado papers, blogs, repositorios ni demos asociados en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo.
