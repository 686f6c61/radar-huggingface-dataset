# leandronunes/qwen3.8-4b-genomebench-qlora

## Resumen

Qwen3.8-4B-GenomeBench-QLoRA es un adaptador LoRA (no un modelo completo) publicado por el usuario leandronunes sobre el modelo base `empero-ai/Qwen3.8-4B-Distill`. Está entrenado con QLoRA de 4 bits (NF4) mediante Unsloth y el SFTTrainer de TRL sobre el dataset `Mingyin0312/Genome-Bench`, un banco de 3.332 preguntas de opción múltiple sobre CRISPR y ingeniería genómica extraídas de discusiones reales de especialistas (2.671 muestras en el split de entrenamiento). El adaptador ocupa unos 85 MB y se distribuye en formato PEFT/safetensors bajo licencia Apache 2.0, con soporte únicamente para inglés.

Su relevancia es doble. Por un lado, ocupa un nicho poco cubierto: razonamiento científico aplicado a CRISPR y edición génica, con un formato de salida estructurado y parseable (`Explicacao: <rationale>` / `Resposta final: <letra>`). Por otro, sirve como demostración reproducible de ajuste fino eficiente: el autor lo entrenó íntegramente en una GPU gratuita Google Colab T4 con 14,5 GB de VRAM, usando 300 pasos (aproximadamente una época), rango LoRA 16, alpha 16 y longitud de secuencia máxima de 2048 tokens.

Las limitaciones son explícitas y conviene tenerlas presentes: el propio autor reconoce que con una sola época el adaptador aprendió el formato del dataset pero no alcanzó especialización profunda, y que solo cubre CRISPR/genómica, no otras áreas de biología. El repositorio registra 0 descargas y 0 likes, y no hay ninguna métrica medida sobre el adaptador: la tabla de benchmarks de la model card deja los valores como "a medir".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer con capas de atención lineal; el modelo base es `empero-ai/Qwen3.8-4B-Distill`. La arquitectura interna detallada del base no está disponible |
| Parametros totales | Modelo base de ~4.000 millones de parámetros; el adaptador son ~85 MB de pesos LoRA (recuento exacto de parámetros entrenables no disponible) |
| Longitud de contexto | 2048 tokens durante el entrenamiento (max seq length); la ventana de contexto nativa del modelo base no está disponible |
| Tipos de cuantizacion | QLoRA 4 bits NF4 con doble cuantización (`bnb_4bit_use_double_quant=True`) para entrenamiento e inferencia de referencia; no se publican cuantizaciones GGUF ni versiones pre-cuantizadas del adaptador |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (heredada, según el autor, de Qwen3.5-4B y Qwen3.8-4B-Distill) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Datos adicionales de configuración: rango LoRA 16, alpha 16, módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`; learning rate 2e-4; optimizador `adamw_8bit`; batch efectivo 8 (2 × 4 de acumulación); 300 pasos; precisión de entrenamiento float32.

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA: el modelo base se carga cuantizado en 4 bits NF4 con doble cuantización y solo se actualizan las matrices de bajo rango insertadas en las siete proyecciones del transformer (atención y MLP). El entrenamiento usó Unsloth junto con TRL (SFTTrainer) sobre el dataset `Mingyin0312/Genome-Bench`, con 2.671 muestras, batch efectivo 8, learning rate 2e-4 y 300 pasos, lo que equivale aproximadamente a una época. El hardware fue una GPU Tesla T4 de Google Colab con 14,5 GB de VRAM, donde Unsloth activó offload automático de gradientes para ajustar el consumo de memoria.

Hay tres detalles técnicos destacables. Primero, el entrenamiento se hizo en float32 porque, según el autor, las capas de atención lineal del modelo base no funcionan correctamente en float16; esto condiciona también la inferencia. Segundo, las bibliotecas `flash-linear-attention` y `causal-conv1d` no estaban instaladas, por lo que se usó la implementación estándar de PyTorch y no el "fast path" optimizado de Unsloth, lo que alarga los tiempos de entrenamiento. Tercero, no se menciona ningún uso de RLHF, DPO u otra fase de alineación posterior al SFT: el adaptador aprende exclusivamente el formato de respuesta del dataset.

## Capacidades

- Respuesta a preguntas de opción múltiple sobre CRISPR y ingeniería genómica, siguiendo un formato de salida fijo con justificación (`Explicacao:`) y letra final (`Resposta final:`).
- Generación de razonamiento científico en formato texto, etiquetado por el autor como `scientific-reasoning` y `causal-reasoning`.
- Generación de texto conversacional (pipeline declarado `text-generation`, etiqueta `conversational`) heredada del modelo base.
- Capacidad multilingüe: limitada al inglés, según el campo `language` del repositorio.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Modo "thinking", visión o audio: no disponible (no se menciona).

## Casos de uso

- Evaluación interna de conocimiento sobre CRISPR: el adaptador permite construir un banco de preguntas de opción múltiple con justificación automática, útil como test de conocimiento para equipos de biología molecular. Al estar entrenado específicamente en el formato de Genome-Bench, el parseo de la respuesta es directo.
- Pre-anotación de datasets genómicos: generar borradores de respuesta con rationale para que un experto los revise y corrija, reduciendo el coste de curación de nuevos conjuntos de datos en el dominio de edición génica.
- Generación de material docente: producir preguntas y explicaciones sobre CRISPR para cursos universitarios o formación interna, siempre con revisión humana dada la falta de métricas de calidad medidas.
- Prototipado de asistentes científicos de dominio restringido: integrar el adaptador en un chatbot de soporte para laboratorios que responda dudas sobre metodología de edición génica, limitando el alcance a CRISPR para evitar extrapolaciones a otras áreas de biología.
- Investigación en ajuste fino eficiente: el repositorio documenta una receta completa y reproducible de QLoRA en una T4 gratuita (r=16, alpha=16, 300 pasos, adamw_8bit), útil como plantilla para adaptar modelos de 4B a dominios científicos con recursos limitados.
- Evaluación comparativa de la técnica QLoRA: sirve como caso de estudio para medir cuánto se aprende con una sola época y 2.671 muestras, y qué se gana o se pierde frente a un ajuste completo.
- Extracción de formato estructurado en pipelines de NLP científico: al producir siempre dos campos delimitados, el adaptador encaja en flujos automatizados que necesiten separar justificación y respuesta final para su validación posterior.

## Benchmarks y rendimiento

Los únicos valores numéricos publicados corresponden al modelo base y proceden de la tabla de la model card del adaptador; no se indica metodología, número de muestras ni fecha de medición. No hay ninguna métrica medida sobre el adaptador.

| Metrica | Modelo base (`empero-ai/Qwen3.8-4B-Distill`) | Adaptador GenomeBench-QLoRA |
|---|---|---|
| BBH - deducción lógica | 78 % | a medir |
| BBH - causal judgement | 46 % | a medir |
| Genome-Bench (exactitud en test) | no disponible | a medir |

No se han publicado resultados de benchmarks del adaptador en la información disponible.

## Requisitos de hardware

- Adaptador: ~85 MB en disco; requiere cargar por separado el modelo base (~8,7 GB según el autor).
- VRAM estimada para inferencia (cálculo propio a partir del tamaño del modelo, no publicado por el autor): ~2,5-3 GB del modelo base en 4 bits NF4 más el overhead de contexto y caché KV; en bfloat16, en torno a 8-9 GB; en float32, ~16-17 GB.
- Precisión de inferencia: el autor advierte de que float16 no es viable por las capas de atención lineal; la receta de referencia usa 4 bits NF4 con `bnb_4bit_compute_dtype=torch.bfloat16`.
- GPU recomendadas: cualquier GPU consumer con 8-12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente para inferencia en 4 bits. Para entrenamiento, el autor usó una Tesla T4 de Colab con 14,5 GB de VRAM.
- Cabe en GPU consumer: sí, tanto en inferencia (4 bits) como en el entrenamiento documentado (T4).
- Opciones de despliegue: transformers + PEFT (receta oficial de la model card) y Unsloth. Para vLLM o TGI sería necesario fusionar el adaptador con el modelo base. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia y no están verificados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento medidos para el adaptador ni información sobre adaptadores comparables en el mismo nicho, por lo que la comparación cuantitativa no es posible. La única comparación verificable es contra el propio modelo base.

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| leandronunes/qwen3.8-4b-genomebench-qlora | Adaptador LoRA sobre Qwen3.8-4B-Distill | ~4B (base) + ~85 MB (adaptador) | 2048 durante entrenamiento | Apache 2.0 | 0 descargas, 0 likes, sin métricas publicadas |
| empero-ai/Qwen3.8-4B-Distill | Modelo base completo | ~4B | no disponible | Apache 2.0 (según el adaptador) | Base del adaptador; BBH 78 % / 46 % reportados por el autor del adaptador |
| Otros adaptadores QLoRA públicos de genómica/CRISPR | Adaptador | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la información disponible |

## Limitaciones y advertencias

- Entrenamiento de una sola época (~300 pasos): el propio autor indica que el modelo aprendió el formato del dataset, pero no alcanzó especialización profunda. Se espera un error notable en preguntas que requieran conocimiento detallado.
- Dominio muy restringido: cubre CRISPR y genómica, y el autor advierte explícitamente de que no cubre otras áreas de la biología.
- Sin métricas: no hay ninguna evaluación publicada del adaptador en Genome-Bench ni en BBH, por lo que no se puede afirmar que mejore al modelo base en ninguna tarea.
- Riesgo de alucinación: al ser un modelo generativo de 4B ajustado con SFT ligero sobre contenido científico, puede producir justificaciones plausibles pero incorrectas. No debe usarse como fuente de verdad en decisiones experimentales o clínicas sin validación humana.
- Idioma: solo inglés. El dataset y las instrucciones de ejemplo están en inglés; usar el adaptador en castellano degradará el formato de salida esperado.
- Contexto limitado: el entrenamiento usó 2048 tokens de longitud máxima; no hay evidencia sobre el comportamiento con entradas más largas.
- Inconsistencia de nomenclatura: el nombre del modelo y el campo `base_model` apuntan a Qwen3.8-4B-Distill, mientras las notas técnicas mencionan capas de atención lineal de "Qwen3.5". Conviene verificar qué checkpoint base real se está cargando.
- Licencia: el adaptador se publica como Apache 2.0 por herencia, pero no se documentan las condiciones del dataset `Mingyin0312/Genome-Bench` ni del checkpoint base `empero-ai/Qwen3.8-4B-Distill`. Para uso comercial conviene revisar ambas fichas antes de desplegar.
- Falta de validación comunitaria: 0 descargas y 0 likes. El adaptador no ha sido reproducido ni auditado por terceros, y las fechas de creación y actualización del repositorio (23 de septiembre de 2026) son poco habituales.
- Ámbito de aplicación: cualquier uso en contexto clínico, diagnóstico o terapéutico queda fuera de lo que el modelo puede garantizar.
- Limitación aportada por las notas técnicas: al no disponer de `flash-linear-attention` ni `causal-conv1d` durante el entrenamiento, se usó la implementación estándar de PyTorch, lo que puede afectar a la reproducibilidad exacta de los resultados si se repite el entrenamiento con el "fast path" activado.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/leandronunes/qwen3.8-4b-genomebench-qlora
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Dataset de entrenamiento: https://huggingface.co/datasets/Mingyin0312/Genome-Bench
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (solo resultados genéricos de YouTube), por lo que no se dispone de papers, blogs, repositorios ni demos adicionales.
