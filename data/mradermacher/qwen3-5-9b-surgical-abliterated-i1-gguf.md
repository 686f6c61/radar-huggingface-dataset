# mradermacher/Qwen3.5-9B-Surgical-Abliterated-i1-GGUF

## Resumen

Qwen3.5-9B-Surgical-Abliterated-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo medismera/Qwen3.5-9B-Surgical-Abliterated, una variante "abliterated" (con el alineamiento de seguridad atenuado quirúrgicamente) del Qwen3.5 de 9B parámetros. El modelo base parte de la familia Qwen3.5 de Alibaba, aunque la model card del repositorio cuantizado no documenta la arquitectura interna, el contexto nativo ni los datos de entrenamiento originales.

El repositorio ofrece cuantizaciones con imatrix (matriz de importancia) en formatos i1-Q2_K a i1-Q6_K, además de un fichero imatrix para generar cuantizaciones propias. El peso total del repositorio es de 81,3 GB, con ficheros individuales que van desde 4,0 GB (i1-Q2_K) hasta 7,7 GB (i1-Q6_K). Los parámetros totales confirmados en safetensors son 9.197.093.888.

La relevancia de esta ficha radica en que combina dos factores poco habituales: un modelo de ~9B con contexto presumiblemente amplio (familia Qwen3.5) y un proceso de "surgical abliteration" que elimina los rechazos de seguridad, lo que lo hace atractivo para investigación en alineamiento, generación creativa sin restricciones y entornos controlados. La licencia Apache 2.0 facilita su uso comercial, aunque las implicaciones del abliterated deben evaluarse con cuidado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer causal (familia Qwen3.5; detalles no disponibles en la model card) |
| Parámetros totales | 9.197.093.888 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (con imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no documenta la arquitectura interna del modelo base más allá de la etiqueta "causal-lm" y la referencia a la familia Qwen3.5. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención (estándar o con atención lineal) ni el esquema de normalización. Tampoco se detalla el proceso de entrenamiento original de Qwen3.5 (número de tokens, composición del dataset, fases de RLHF/DPO).

El elemento diferenciador es el proceso de "surgical abliteration" aplicado por medismera sobre el modelo base: una intervención quirúrgica sobre las direcciones de activación asociadas a los rechazos de seguridad, en lugar de un fine-tuning completo. Este tipo de intervención busca eliminar la capa de negativa sin degradar en exceso las capacidades generales del modelo. La model card no aporta métricas sobre la magnitud de la degradación ni sobre el método exacto de ablación (proyección de direcciones, edición de pesos por capa, etc.).

Las cuantizaciones de mradermacher emplean imatrix (importance matrix) calculada sobre un corpus de calibración, lo que según el autor mejora la calidad respecto a cuantizaciones estáticas equivalentes. Se ofrecen tanto cuantizaciones "i1" (con imatrix) como estáticas en el repositorio hermano Qwen3.5-9B-Surgical-Abliterated-GGUF.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat multi-turno (etiqueta "conversational").
- Razonamiento general y respuesta a instrucciones, heredado del modelo base Qwen3.5.
- Generación de código y matemáticas: capacidades presumibles de la familia Qwen3.5, aunque no verificadas en la información disponible.
- Sin censura ni rechazos de seguridad: el proceso de abliteration elimina las negativas a peticiones que el modelo original rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en alineamiento y seguridad: el modelo permite estudiar qué comportamientos se eliminan con la abliteration y cómo afecta a la coherencia general, sirviendo como caso control frente al modelo original alineado.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas sensibles sin los rechazos del modelo base, en entornos editoriales controlados.
- Roleplay y simulación de personajes: conversaciones multi-turno con personalidades que el modelo alineado rechazaría, útil en prototipado de videojuegos o entrenamiento de guionistas.
- Despliegue local en hardware de consumo: las cuantizaciones i1-Q4_K_M (5,9 GB) e i1-Q5_K_M (6,7 GB) caben en GPUs de 8-12 GB de VRAM, permitiendo inferencia offline en portátiles con RTX 3060/4060.
- Fine-tuning posterior sobre dominio específico: al estar liberado con Apache 2.0 y en formato GGUF, puede servir como base para LoRA o adaptaciones en dominios donde el filtrado del modelo original resulta un obstáculo (por ejemplo, análisis de contenido sensible en moderación).
- Evaluación comparativa de cuantizaciones: el repositorio incluye 15 variantes de cuantización más el fichero imatrix, lo que permite medir empíricamente la degradación de perplejidad entre Q2_K y Q6_K en tareas concretas.
- Generación de datos sintéticos para entrenamiento: la ausencia de rechazos facilita la producción de datasets diversos, incluyendo ejemplos negativos o adversariales que un modelo alineado evitaría generar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - i1-Q2_K (4,0 GB): ~4,5 GB de VRAM con contexto corto.
  - i1-Q4_K_M (5,9 GB): ~6,5 GB de VRAM con contexto moderado.
  - i1-Q5_K_M (6,7 GB): ~7,5 GB de VRAM.
  - i1-Q6_K (7,7 GB): ~8,5 GB de VRAM.
  - El modelo en FP16 (safetensors, ~18,4 GB) requiere ~20 GB de VRAM.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q6.
  - Profesional: A100 40/80 GB, H100 80 GB para FP16 o cuantizaciones altas con contexto largo.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB con cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp. vLLM y TGI no soportan GGUF de forma nativa (vLLM requiere conversión o usa el safetensors base).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Surgical-Abliterated-i1-GGUF | 9,2B | no disponible | Apache 2.0 | GGUF | Objeto de esta ficha; abliterated |
| medismera/Qwen3.5-9B-Surgical-Abliterated | 9,2B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Qwen3.5-9B (original, si existe) | ~9B | no disponible | Apache 2.0 (presumible) | safetensors | Alineado, con rechazos de seguridad |
| Otras variantes abliterated de ~8-9B (p. ej. Llama-3-8B abliterated) | 8B | 8K (típico) | Llama license | GGUF/safetensors | Alternativa de tamaño similar, idioma inglés |

La comparación con el modelo original Qwen3.5-9B no puede completarse porque la información disponible no incluye sus especificaciones de contexto ni benchmarks. Las variantes abliterated de Llama-3-8B son el referente más cercano en tamaño y propósito, pero no se dispone de datos comparativos de rendimiento en esta ficha.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos de seguridad, lo que implica que el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtro. No debe desplegarse en aplicaciones orientadas al público sin una capa de moderación externa.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual tras la ablación; la intervención quirúrgica puede degradar la coherencia en tareas de razonamiento.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Longitud de contexto: no disponible; no se debe asumir la ventana nativa de Qwen3.5 sin verificación empírica.
- La licencia Apache 2.0 permite uso comercial, pero el autor del modelo base (medismera) no ofrece garantías sobre el comportamiento del modelo abliterated; la responsabilidad legal del contenido generado recae en el desplegador.
- Las cuantizaciones de baja calidad (i1-Q2_K, i1-Q3_K_S) degradan notablemente la perplejidad; para producción se recomienda i1-Q4_K_M o superior.
- El repositorio tiene solo 2 likes y 4106 descargas, lo que sugiere una validación comunitaria escasa; no hay evidencia de pruebas extensas por terceros.
- La model card no documenta el método exacto de abliteration ni las métricas de degradación, lo que dificulta evaluar su impacto real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-9B-Surgical-Abliterated-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/medismera/Qwen3.5-9B-Surgical-Abliterated
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.5-9B-Surgical-Abliterated-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-Surgical-Abliterated-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
