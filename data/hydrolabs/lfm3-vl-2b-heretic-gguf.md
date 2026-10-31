# HydroLabs/LFM3-VL-2B-Heretic-GGUF

## Resumen

LFM3-VL-2B-Heretic-GGUF es una versión "abliterated" (sin comportamiento de rechazo) del modelo multimodal LiquidAI/LFM3-VL-2B, publicada por HydroLabs en Hugging Face. La eliminación de los rechazos se realizó mediante ablación direccional con la herramienta Heretic 1.4.0, sin ningún fine-tuning: se modificaron 31 de los 424 tensores del modelo y el codificador de visión y el proyector se dejaron intactos. El resultado se distribuye en formato GGUF, listo para usar con llama.cpp.

El modelo base, LFM3-VL-2B de LiquidAI, es un modelo de visión-lenguaje (pipeline image-text-to-text) con aproximadamente 1.729 millones de parámetros, capaz de razonar antes de responder (thinking mode). La versión Heretic reduce drásticamente la tasa de rechazos: del 93-96 % al 0-7 % en prompts dañinos según la configuración, manteniendo una divergencia KL muy baja respecto al original (0,015 en respuestas completas).

Es relevante porque demuestra que las técnicas de ablación direccional pueden eliminar el alineamiento de un modelo multimodal reciente con un impacto mínimo en la calidad de salida, algo verificable con los datos de cuantización y divergencia publicados. Su tamaño reducido (cabe en GPUs de consumo) lo hace accesible para experimentación local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) de la familia LFM3 de LiquidAI; detalles exactos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible; se recomienda al menos 8K tokens porque el modelo razona antes de responder |
| Tipos de cuantizacion | Q6_K (con imatrix y embeddings Q8_0) y BF16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso comercial solo para entidades con ingresos anuales inferiores a 10 millones de USD) |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de LiquidAI/LFM3-VL-2B, un modelo multimodal de visión-lenguaje que combina un codificador de visión, un proyector y un modelo de lenguaje. En esta versión, el codificador de visión y el proyector no han sido modificados; solo se alteraron tensores del modelo de lenguaje: proyecciones de salida de atención y convolución en las capas 5-23, y proyecciones down de los MLP en las capas 12-23.

La eliminación del comportamiento de rechazo no implicó entrenamiento adicional: se aplicó ablación direccional con Heretic 1.4.0 durante 300 pruebas (seed 42), seleccionando el candidato final entre 10 opciones Pareto-óptimas tras evaluación en datos reservados. El GGUF se construyó a partir de la conversión BF16 de LiquidAI reemplazando únicamente los tensores modificados. La matriz de importancia (imatrix) para la cuantización Q6_K se calculó con 661.000 tokens de datos mixtos de texto, código y chat; manteniendo los embeddings de tokens en Q8_0, la KLD media es un 24 % inferior a la receta Q6_K por defecto. No hay información sobre el proceso de preentrenamiento del modelo base ni sobre RLHF/DPO.

## Capacidades

- Generación de texto conversacional con razonamiento previo a la respuesta (thinking mode), heredado del modelo base
- Comprensión de imágenes: pipeline image-text-to-text, admite entradas de imagen junto con texto
- Sin comportamiento de rechazo: responde a prompts que el modelo original declinaría (tasa de rechazo del 0-7 % frente al 93-96 % del original)
- Ejecución local mediante llama.cpp (llama-server con archivo mmproj para visión)
- Soporte de plantillas de chat Jinja (flag --jinja en llama-server)
- No hay información publicada sobre tool calling, capacidades de agente ni soporte multilingüe específico

## Casos de uso

- Investigación en alineamiento y seguridad: permite estudiar cómo la ablación direccional afecta al comportamiento de un modelo multimodal, con métricas publicadas de divergencia KL y tasas de rechazo para comparar con el modelo base
- Experimentación local con modelos multimodales sin filtros: al pesar unos 1,5 GB en Q6_K, se puede ejecutar en portátiles y GPUs de consumo para probar entradas de imagen y texto
- Desarrollo y prueba de pipelines de visión-lenguaje con llama.cpp: el archivo mmproj independiente facilita integrar la parte de visión en aplicaciones propias vía llama-server
- Benchmarking de cuantizaciones: los datos publicados de KLD, acuerdo de top-token y perplejidad entre Q6_K y BF16 sirven de referencia para validar métodos de cuantización con imatrix
- Generación de contenido que el modelo original rechazaría, bajo responsabilidad exclusiva del usuario: escritura creativa o análisis donde el usuario considere excesivos los filtros del modelo base
- Evaluación comparativa de técnicas de "uncensoring": al indicarse exactamente qué tensores se modificaron, es útil como caso de estudio reproducible (Heretic 1.4.0, 300 pruebas, seed 42)

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado métricas específicas de este derivado:

Tasa de rechazo:

| Prompt set | Original | Este modelo |
|---|---|---|
| Dañinos, thinking activado (JailbreakBench, n=100) | 96 % | 7 % |
| Dañinos, thinking desactivado (JailbreakBench + LLM-LAT, n=200) | 93 % | 0 % |
| Inofensivos (JailbreakBench benign, n=100) | 18 % | 2 % |

Divergencia respecto al original:

| Métrica | Valor |
|---|---|
| KL divergence, primer token (métrica Heretic) | 0,037 |
| KL divergence, respuestas completas | 0,015 |

Cuantización Q6_K frente a BF16 (datos de chat reservados):

| Métrica | Valor |
|---|---|
| KLD media | 0,0026 |
| Acuerdo de top-token | 97,9 % |
| Cambio de perplejidad | +0,2 % |

## Requisitos de hardware

- VRAM estimada para inferencia: 1,49 GB para el archivo Q6_K y 3,47 GB para BF16, más 379 MB del proyector de visión (mmproj); en la práctica, algo más por la caché de contexto (se recomiendan al menos 8K tokens)
- Cabe con holgura en GPUs de consumo: cualquier GPU con 4-6 GB de VRAM (por ejemplo RTX 3060, RTX 4060) ejecuta la versión Q6_K; también es viable en CPU dada la cuantización
- No se requieren GPUs de datacenter (A100, H100) para inferencia
- Despliegue: llama.cpp (llama-server con --mmproj y --jinja); al ser GGUF, es probablemente compatible con herramientas basadas en llama.cpp como Ollama o LM Studio, aunque no se indica explícitamente
- Ajustes de muestreo recomendados: temperature 0,1, top_k 50, top_p 1,0, repetition penalty 1,1
- Latencia y throughput: no disponibles

## Comparativa con modelos similares

| Característica | LFM3-VL-2B-Heretic-GGUF | LiquidAI/LFM3-VL-2B (base) | Qwen2.5-VL-3B-Instruct |
|---|---|---|---|
| Parametros | ~1,73 B | ~1,73 B | ~3 B |
| Modalidad | Imagen + texto | Imagen + texto | Imagen + texto |
| Thinking mode | Sí (heredado) | Sí | no disponible |
| Formato | GGUF (Q6_K, BF16) | safetensors | safetensors y GGUF comunitarios |
| Comportamiento de rechazo | Prácticamente eliminado (ablación) | Estándar | Estándar |
| Licencia | LFM Open License v1.0 (comercial < 10M USD ingresos) | LFM Open License v1.0 | Apache 2.0 |
| Contexto | no disponible | no disponible | hasta 32K aprox. |

Nota: los datos de Qwen2.5-VL-3B-Instruct son aproximados y se incluyen como referencia de categoría; el resto de datos provienen de la información disponible de este repositorio.

## Limitaciones y advertencias

- El modelo genera contenido que el modelo original rechaza; la responsabilidad de su uso recae íntegramente en el usuario
- Con thinking activado, todavía declina un pequeño porcentaje de solicitudes dañinas (7 % en JailbreakBench)
- La licencia LFM Open License v1.0 restringe el uso comercial a entidades con ingresos anuales inferiores a 10 millones de USD, lo que excluye a grandes empresas
- No hay datos de benchmarks estándar de calidad (MMLU, etc.) para verificar que las capacidades generales no se han degradado; solo se publican métricas de divergencia KL, que sugieren cambios mínimos
- Es necesario reservar al menos 8K tokens de contexto porque el modelo razona antes de responder, lo que consume presupuesto de generación
- No hay información sobre idiomas soportados ni sobre posibles sesgos específicos; deben asumirse los del modelo base LiquidAI/LFM3-VL-2B
- Riesgo de alucinación: no disponible en la información proporcionada; debe asumirse el riesgo inherente a modelos de lenguaje de menos de 2B de parámetros
- Al tratarse de pesos modificados sin fine-tuning, un uso en producción sin evaluación propia previa no es recomendable

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HydroLabs/LFM3-VL-2B-Heretic-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Herramienta Heretic (GitHub): https://github.com/p-e-w/heretic
- Licencia LFM Open License v1.0: disponible en el repositorio (LICENSE)
