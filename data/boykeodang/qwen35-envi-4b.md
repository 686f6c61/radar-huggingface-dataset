# boykeodang/qwen35-envi-4b

## Resumen

Qwen3.5-EnVi-4B es una variante del modelo Qwen3.5-4B desarrollada por Hoàng Minh Tâm (boykeodang) mediante una cirugía de vocabulario que elimina todos los tokens que no sirven al inglés ni al vietnamita. El vocabulario original de 248.320 tokens se reduce a 100.227, lo que elimina 378,5 millones de parámetros de embedding (0,757 GB en BF16) y deja el modelo con 3.826.633.216 parámetros totales. El objetivo declarado es disponer de un modelo compacto que quepa en una GPU de 4 GB de VRAM para clasificación de comportamiento, tool calling y orquestación de automatizaciones.

La motivación principal es eliminar por construcción la generación de caracteres chinos (CJK): el 97 % de los tokens Han han sido eliminados y las mediciones de generación reportan cero caracteres CJK en las salidas. El modelo conserva la torre de visión en una variante separada (`qwen35-envi-4b-vision`) con el mismo vocabulario podado.

Es relevante porque demuestra una técnica de compresión poco habitual —poda de vocabulario con entrenamiento de recuperación mediante QLoRA— aplicada a un modelo base reciente de la familia Qwen3.5, con licencia Apache 2.0 y artefactos GGUF listos para llama.cpp. La reducción de tamaño en GGUF es del 20,7 % (de 3,01 GB a 2,39 GB en Q4_K_M), manteniendo una perplejidad en vietnamita de solo +0,71 % respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), rama MTP eliminada |
| Parametros totales | 3.826.633.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso fija `-c 4096`) |
| Tipos de cuantizacion | GGUF Q4_K_M (verificado); safetensors en BF16; otras cuantizaciones no disponibles |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (texto y variante vision con `mmproj`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5, y aplica una poda de vocabulario: el conjunto de tokens conservados se construyó a partir de 40,19 millones de tokens de corpus públicos (FineWeb-2 `vie_Latn` y FineWeb `sample-10BT`), manteniendo todo token usado al menos una vez, todo el rango Latin Extended y clases de seguridad completas de espacios en blanco, puntuación y dígitos. El resultado son 100.227 identificadores con un 0 % de pérdida de cobertura sobre los corpus de análisis. La matriz de embeddings se recortó mediante un mapa de identificadores explícito, el tokenizer se reconstruyó para que el vocabulario de la configuración coincida con el del tokenizer, se eliminó la rama MTP (multi-token prediction) y se filtraron las fusiones BPE que referenciaban tokens eliminados.

Tras la poda se aplicó un entrenamiento de recuperación con QLoRA (r=16, todas las proyecciones lineales, LR 2e-5) sobre 2 millones de tokens de FineWeb-2 vietnamita y FineWeb inglés, fusionado en el modelo base podado. El entrenamiento se detuvo en la dosis en la que una exposición adicional degradaba la perplejidad, verificado mediante evaluaciones A/B con puerta. La verificación independiente confirma que las filas de embedding coinciden byte a byte con el original en identificadores muestreados y que los round-trips del tokenizer son sin pérdida.

## Capacidades

- Generación de texto y razonamiento en inglés y vietnamita, con bloque de pensamiento (thinking) que puede ser verboso según el autor.
- Tool calling y function calling, orientado explícitamente a clasificación de comportamiento y orquestación de automatizaciones.
- Razonamiento multi-paso y uso como modelo de agente en pipelines locales.
- Capacidades multilingües limitadas a inglés y vietnamita por diseño; el resto de idiomas queda fuera del vocabulario.
- Variante con visión: la torre visual se mantiene intacta en `qwen35-envi-4b-vision`, aunque no se ha revalidado en tareas visuales.
- Eliminación de salida en chino por construcción: cero caracteres CJK medidos en las pruebas de generación.

## Casos de uso

- Clasificación de comportamiento en local: el modelo cabe en 4 GB de VRAM en Q4_K_M (2,39 GB), por lo que puede ejecutarse en GPUs de gama baja para etiquetar intenciones o conductas en tiempo real sin depender de la nube.
- Tool calling en asistentes de automatización: su vocabulario podado y su soporte de function calling lo hacen adecuado para orquestar acciones en flujos domésticos o de oficina con presupuesto de hardware reducido.
- Asistentes conversacionales en vietnamita e inglés: la perplejidad en vietnamita se mantiene prácticamente igual al original (+0,71 %), lo que permite desplegar atención al cliente bilingüe en entornos con recursos limitados.
- Sustitución de modelos mayores en pipelines de CI/CD: el GGUF de 2,39 GB reduce el peso de las imágenes de contenedor y acelera el arranque en pruebas automatizadas de agentes.
- Despliegue en dispositivos de borde: con llama.cpp y `-ngl 99` puede ejecutarse íntegramente en GPU en equipos con 4 GB de VRAM, útil para prototipos de robótica o domótica.
- Evitar filtraciones de idioma no deseadas: en productos donde la salida en chino es un riesgo (por ejemplo, moderación o asistentes regulados), la poda garantiza por construcción la ausencia de caracteres CJK.
- Prototipado de agentes con visión: la variante `qwen35-envi-4b-vision` (Q4_K_M 2,39 GB + mmproj 0,68 GB) permite experimentar con entrada de imagen manteniendo el vocabulario reducido.

## Benchmarks y rendimiento

| Metrica | Original | EnVi | Delta |
|---|---:|---:|---:|
| Perplejidad vietnamita (Q4_K_M, llama-perplexity, 64 KB) | 10,08 | 10,15 | +0,71 % |
| Perplejidad inglesa (Q4_K_M, llama-perplexity, 64 KB) | 11,81 | 12,23 | +3,54 % |
| Tamano GGUF Q4_K_M texto | 3,01 GB | 2,39 GB | −20,7 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,4 GB para el GGUF Q4_K_M de texto; la variante de visión añade 0,68 GB de `mmproj`.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; el autor apunta explícitamente a un presupuesto de 4 GB. Funciona en RTX 3050, RTX 4060, T4 y superiores; en A100/H100 sobra capacidad.
- Cabe en GPU de consumo: sí, en modelos con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (build reciente con soporte `qwen35`), llama-server; el repo incluye GGUF. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. El ejemplo de uso emplea `llama-server -m qwen35-envi-text-q4_k_m.gguf -c 4096 -ngl 99`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-EnVi-4B | 3.826.633.216 | no disponible | Apache 2.0 | safetensors + GGUF | Vocabulario podado a 100.227; solo vi/en |
| Qwen3.5-4B (base) | no disponible | no disponible | Apache 2.0 | safetensors + GGUF | Vocabulario de 248.320 tokens; multilingüe |
| Qwen3.5-EnVi-4B-Vision | 3.826.633.216 (más torre visual) | no disponible | Apache 2.0 | GGUF + mmproj | Misma poda con torre de visión intacta |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El razonamiento puede ser verboso: los prompts de acción o JSON pueden consumir parte del presupuesto de tokens dentro del bloque de pensamiento.
- La rama MTP fue eliminada; debe usarse decodificación estándar.
- Los 1.525 tokens restantes de clase Han existen porque aparecen en texto vietnamita genuino (nombres propios entrecomillados); según el autor, prácticamente nunca se generan.
- La variante de visión conserva la torre visual pero el modelo de lenguaje podado no se ha revalidado en tareas de visión.
- El vocabulario está restringido a inglés y vietnamita: otros idiomas no están soportados y pueden producirse degradaciones o salidas vacías.
- Riesgo de alucinación no cuantificado en la información disponible; el autor no publica evaluaciones de fidelidad factual más allá de preguntas factuales en vietnamita.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es de Alibaba Cloud / Qwen Team y debe conservarse la atribución correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/boykeodang/qwen35-envi-4b
- Repositorio del método y scripts: https://github.com/goddie9x/qwen35-envi-surgery
- Perfil del autor en GitHub: https://github.com/goddie9x
- Sitio del autor: https://hmt9x.dev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
