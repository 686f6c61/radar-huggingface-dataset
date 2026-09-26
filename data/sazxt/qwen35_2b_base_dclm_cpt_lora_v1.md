# sazxt/qwen35_2b_base_dclm_cpt_lora_v1

## Resumen

`sazxt/qwen35_2b_base_dclm_cpt_lora_v1` es un ajuste publicado en HuggingFace por el usuario sazxt sobre el modelo base `Qwen/Qwen3.5-2B-Base`. Se distribuye bajo licencia Apache 2.0, en formato safetensors y con la librería transformers, y su repositorio ocupa 4,1 GB. La model card es mínima: no incluye descripción de la arquitectura, del dataset de entrenamiento, del procedimiento de ajuste ni resultados de evaluación.

El nombre del repositorio sugiere tres elementos: DCLM (posiblemente el corpus DataComp-LM), CPT (continued pretraining o preentrenamiento continuado) y LoRA (ajuste de bajo rango). Ninguno de ellos aparece documentado en la model card, por lo que deben tratarse como indicios derivados del identificador y no como hechos confirmados. El tamaño del repositorio (4,1 GB) es coherente con un modelo de aproximadamente 2.000 millones de parámetros en precisión bf16/fp16, es decir, con pesos fusionados en lugar de un adaptador LoRA suelto, aunque esto tampoco se explicita.

La relevancia del modelo es limitada y de carácter experimental: acumula 0 descargas y 0 likes, la model card no aporta información técnica y no se han publicado benchmarks. Es un artefacto útil para quien quiera inspeccionar un experimento de preentrenamiento continuado sobre la familia Qwen3.5, pero no una opción evaluada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El modelo base pertenece a la familia Qwen3.5; se presume transformer decoder-only, sin confirmación en la model card |
| Parámetros totales | No disponible. La denominación del modelo base (Qwen3.5-2B) sugiere aproximadamente 2.000 millones, sin confirmación oficial |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio contiene únicamente safetensors; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo. El único dato disponible es que deriva de `Qwen/Qwen3.5-2B-Base`, por lo que hereda la arquitectura del modelo base de la familia Qwen3.5, presumiblemente un transformer decoder-only con atención causal, aunque la model card no lo especifica. Tampoco se documentan la longitud de contexto nativa, la configuración de cabezas de atención, el uso de atención lineal, decodificación especulativa ni ningún otro mecanismo técnico.

Respecto al entrenamiento, la model card se limita a indicar que el modelo fue entrenado "2x faster with Unsloth", enlazando al repositorio de Unsloth, y que se trata de un modelo ajustado subido por el autor. No se detalla el número de tokens de entrenamiento, la composición del dataset (el identificador menciona DCLM, pero no se confirma), el uso de RLHF, DPO, SFT u otras fases de alineamiento, ni la configuración del hipotético LoRA (rango, alpha, módulos objetivo) en caso de haberse empleado. El tamaño del repositorio (4,1 GB), frente al tamaño típico de un adaptador LoRA para un modelo de 2B, apunta a que los pesos se subieron fusionados, pero es una inferencia no verificada.

## Capacidades

No se han publicado evaluaciones ni descripciones funcionales del modelo. A partir de la información disponible solo puede afirmarse lo siguiente:

- Generación de texto en inglés: es la única capacidad respaldada por las etiquetas del repositorio (`text-generation-inference`, `language: en`).
- Herencia del modelo base: al derivar de `Qwen/Qwen3.5-2B-Base`, el modelo parte de las capacidades de ese modelo base, sin que se documente qué capacidades se han conservado, degradado o mejorado tras el ajuste.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la única lengua declarada es el inglés.
- Capacidades especiales (modo de razonamiento explícito, visión, audio, decodificación especulativa): no disponible.
- Razonamiento matemático y generación de código: no disponible, sin benchmarks ni ejemplos que lo acrediten.

## Casos de uso

Dado que no existen evaluaciones publicadas ni documentación de entrenamiento, los casos de uso deben plantearse como escenarios de investigación y experimentación, no como despliegues de producción validados.

- Reproducción de experimentos de preentrenamiento continuado: el modelo permite inspeccionar cómo se comporta un ajuste tipo CPT con adaptadores de bajo rango sobre un modelo base de ~2B, comparando sus salidas con las del modelo base original.
- Punto de partida para ajuste supervisado en inglés: al ser un modelo pequeño y con pesos safetensors compatibles con transformers, puede servir como inicialización para un SFT específico de dominio antes de invertir en modelos mayores.
- Generación de datos sintéticos en inglés para destilación: un modelo de 2B puede producir borradores masivos y filtrarse posteriormente con un modelo mayor, siempre que se valide la calidad de forma empírica.
- Prototipado en hardware limitado: su tamaño permite experimentar en una GPU de consumo con cuantización de 4 bits, útil para validar pipelines de inferencia antes de escalar.
- Investigación sobre degradación por ajuste: dado que no hay evaluación publicada, resulta un caso legítimo medir la pérdida de capacidades del modelo base tras el proceso de CPT y LoRA aplicado.
- Base para modelos de clasificación o extracción de información: mediante ajuste con cabeza de clasificación sobre texto en inglés, aunque requeriría un conjunto de datos etiquetado propio.
- Comparación de metodologías de entrenamiento eficiente: al estar vinculado a Unsloth y TRL, puede usarse para contrastar el coste y el resultado de distintas configuraciones de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y no se han encontrado tablas comparativas asociadas al modelo. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

Todas las cifras de esta sección son estimaciones derivadas del tamaño del repositorio y no de especificaciones publicadas por el autor.

- VRAM estimada para inferencia en bf16/fp16: en torno a 5-6 GB considerando pesos (~4 GB) más caché KV y overhead del runtime.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,5-3 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 3070); 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) para trabajar con contexto amplio sin cuantizar; A100, H100 o L40S si se busca throughput alto en servicio.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 8 GB o más con cuantización, y en tarjetas de 12 GB o más en bf16.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta declarada `text-generation-inference`), vLLM y SGLang. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que el repositorio no publica cuantizaciones de ese formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existen benchmarks publicados de este modelo, por lo que la comparación se limita a características estructurales. Los datos de los modelos alternativos provienen de sus respectivas model cards públicas y pueden variar.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sazxt/qwen35_2b_base_dclm_cpt_lora_v1 | No disponible (~2B según denominación) | No disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-2B-Base | ~2B (según denominación) | No disponible | No disponible en esta búsqueda | HuggingFace |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente desplegado |
| meta-llama/Llama-3.2-1B | 1,24B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, con registro |
| google/gemma-2-2b | 2,61B | 8.192 tokens | Gemma Terms of Use | HuggingFace, con aceptación de términos |
| HuggingFaceTB/SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | HuggingFace |

La diferencia principal no está en las especificaciones, que en este modelo son desconocidas, sino en la trazabilidad: las alternativas citadas publican evaluaciones, documentación de entrenamiento y cuantizaciones listas para usar, mientras que este ajuste no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni análisis de sesgos. No es posible estimar su calidad relativa frente a otros modelos.
- Model card mínima: no se documenta el dataset de entrenamiento, el número de tokens, la configuración del ajuste ni el proceso de alineamiento. Esto impide auditar el origen de los datos y los posibles sesgos incorporados.
- Idioma: únicamente se declara inglés. El comportamiento en castellano u otras lenguas no está garantizado y probablemente sea deficiente o inestable.
- Riesgo de alucinación: no cuantificado. Al tratarse de un ajuste sin evaluación, no puede descartarse degradación respecto al modelo base, especialmente en tareas de razonamiento o conocimiento factual.
- Posible olvido catastrófico: un preentrenamiento continuado sobre un corpus concreto puede deteriorar capacidades generales del modelo base. Sin evaluación comparativa no es posible saberlo.
- Licencia: el autor declara Apache 2.0, pero ese término no puede prevalecer sobre las condiciones del modelo base `Qwen/Qwen3.5-2B-Base`. Antes de un uso comercial conviene verificar la licencia del modelo original y las obligaciones de atribución aplicables.
- Trazabilidad y madurez: 0 descargas y 0 likes, publicación sin mantenimiento aparente. No hay garantía de soporte, correcciones ni actualizaciones.
- Formato: solo safetensors. No hay GGUF ni cuantizaciones publicadas, por lo que el despliegue en llama.cpp u Ollama requiere una conversión manual por parte del usuario.
- Contexto desconocido: al no especificarse la ventana de contexto, no debe asumirse que soporta conversaciones largas ni documentos extensos.
- Recomendación: no usar en producción sin una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sazxt/qwen35_2b_base_dclm_cpt_lora_v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio de Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
