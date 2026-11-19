# ikimyaii/Mamba-1.3B-semi-structured-Wanda-80pct

## Resumen

Mamba-1.3B-semi-structured-Wanda-80pct es una versión podada del modelo base fla-hub/mamba-1.3B-100B, un transformer de estado (SSM) de tipo Mamba con 1.334.740.992 parámetros. El autor, ikimyaii, ha aplicado una poda one-shot sin reentrenamiento posterior mediante el algoritmo Wanda (código oficial de locuslab/wanda) para alcanzar una esparsidad semi-estructurada del 80% en las capas lineales internas de los bloques. El resultado es un checkpoint de referencia (baseline) para comparar con otros modelos podados del mismo autor, presumiblemente variantes EHWS.

El modelo no es un modelo de propósito general listo para producción: es un artefacto de investigación sobre compresión de modelos SSM. Su relevancia radica en que documenta el impacto de la poda agresiva sin recuperación sobre un modelo Mamba pequeño, con métricas de perplejidad y evaluación zero-shot que muestran el coste de la compresión. La poda se aplica a `in_proj`, `x_proj` y `out_proj` de cada bloque, manteniendo densos `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y el `lm_head`.

La información pública disponible es muy limitada: no hay licencia declarada, no se especifican idiomas soportados ni pipeline, y no hay datos sobre cuantizaciones publicadas. El repositorio ocupa 2,7 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model, SSM selectivo) |
| Parametros totales | 1.334.740.992 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es fla-hub/mamba-1.3B-100B, un Mamba de 1.300 millones de parámetros entrenado sobre 100.000 millones de tokens, implementado en la librería flash-linear-attention (`fla`). La arquitectura Mamba sustituye la atención por un SSM selectivo con parámetros dependientes de la entrada (`dt_proj`, `A_log`, `D`) y convoluciones causales 1D (`conv1d`), lo que permite inferencia con coste lineal en la longitud de secuencia.

Sobre ese modelo, el autor aplica una poda one-shot con Wanda (Sun et al., locuslab/wanda, commit 8e8fc87, rama unstructured, `use_variant=False`). El criterio de importancia es `|W| * sqrt(||X||)`, calculado por fila, de modo que cada fila conserva el mismo número de pesos no nulos. La calibración usa 128 secuencias de C4 de 2.048 tokens con semilla 0, y los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados. La poda se realiza en bfloat16 y tarda 2,8 minutos en una A100 de 40 GB. No hay reentrenamiento ni ajuste fino posterior. La esparsidad medida sobre los pesos finales es de 0,7839, y todas las filas de las 192 capas podadas tienen el mismo número de no nulos, lo que garantiza equilibrio de carga por fila.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Mamba-1.3B.
- Razonamiento y respuesta a preguntas de opción múltiple en inglés (evaluado en arc, boolq, hellaswag, openbookqa, rte, winogrande).
- Modelado de lenguaje y cálculo de perplejidad sobre WikiText-2 y C4.
- No se ha documentado soporte de tool calling, function calling ni comportamiento agente.
- No se ha documentado capacidad multilingüe; las evaluaciones publicadas son en inglés.
- No dispone de visión, audio ni modo thinking.
- La poda degrada severamente las capacidades del modelo base (ver benchmarks), por lo que no debe tratarse como un modelo funcional equivalente al denso.

## Casos de uso

- Investigación sobre poda de modelos SSM: sirve como baseline reproducible para comparar técnicas de poda (Wanda, SparseGPT, EHWS) sobre arquitecturas Mamba, ya que el autor lo declara explícitamente como referencia para sus modelos EHWS.
- Estudio del equilibrio de carga en kernels dispersos: al tener el mismo número de no nulos por fila en las 192 capas podadas, es útil para validar implementaciones de sparse GEMM con balanceo perfecto por fila.
- Análisis de degradación por compresión: permite medir la caída de perplejidad y accuracy zero-shot al pasar de denso a 80% de esparsidad sin recuperación, útil para decidir umbrales de poda en pipelines de compresión.
- Reproducción de experimentos de poda one-shot: el README documenta calibración, semilla, orden de bloques y tiempo de cómputo, lo que facilita replicar el procedimiento en otras arquitecturas lineales.
- Docencia y formación en compresión de modelos: ejemplo concreto de cómo la poda agresiva sin reentrenamiento destruye la calidad del modelo (perplejidad de 10,03 a 305,49 en WikiText-2).
- Benchmarking de librerías de inferencia para SSM: útil para probar `flash-linear-attention` y `AutoModelForCausalLM` con pesos dispersos y verificar que la carga y la inferencia funcionan con el checkpoint podado.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, en bfloat16 porque Mamba desborda en fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,03 | 14,12 |
| Este modelo (80% poda) | 305,49 | 325,48 |

Accuracy zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,1809 |
| arc_easy | 0,5644 | 0,2891 |
| boolq | 0,6040 | 0,4505 |
| hellaswag | 0,3898 | 0,2704 |
| openbookqa | 0,1980 | 0,1320 |
| rte | 0,5343 | 0,5271 |
| winogrande | 0,5217 | 0,4964 |
| Media | 0,4350 | 0,3352 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB de pesos más overhead de activaciones y caché de estado; en la práctica, unos 4-6 GB para secuencias moderadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100 40 GB fue la usada para la poda (2,8 minutos).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, entre otras con soporte bf16.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado (`import fla`). No se ha documentado soporte en vLLM, llama.cpp, Ollama ni TGI para este checkpoint disperso.
- Latencia y throughput: no disponibles. La esparsidad del 78,39% con balanceo perfecto por fila podría aprovecharse con kernels sparse, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Mamba-1.3B Wanda 80%) | 1.334.740.992 | no disponible | no disponible | Hugging Face | Poda one-shot, perplejidad WikiText-2 305,49 |
| fla-hub/mamba-1.3B-100B (denso) | ~1,3 B | no disponible | no disponible | Hugging Face | Modelo base, perplejidad WikiText-2 10,03 |
| Mamba-1.4B (original, estado-mamba) | ~1,4 B | 2.048 tokens (entrenamiento) | Apache 2.0 | Hugging Face / GitHub | Referencia canónica de la familia Mamba; no comparable directamente en benchmarks con este checkpoint podado |
| Modelos podados Wanda de la misma cuenta (EHWS) | no disponible | no disponible | no disponible | Hugging Face | El autor los cita como comparación interna; no se detallan métricas en la información disponible |

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 pasa de 10,03 a 305,49 y la accuracy media zero-shot cae de 0,4350 a 0,3352. No es apto para uso en producción como modelo de lenguaje general.
- Poda sin reentrenamiento: no hay recuperación de pesos ni ajuste fino, por lo que el daño es irreversible sin volver a entrenar.
- Sesgos: no documentados; al derivar de un modelo base entrenado sobre datos web, hereda los sesgos de ese corpus, pero no se han publicado análisis específicos.
- Riesgo de alucinación: elevado, coherente con la degradación de perplejidad y accuracy; las salidas pueden ser incoherentes o repetitivas.
- Idiomas: solo se han evaluado tareas en inglés; no hay evidencia de comportamiento multilingüe.
- Licencia: no declarada en la model card ni en los metadatos; no se puede asumir uso comercial permitido. Es necesario contactar con el autor o consultar el modelo base.
- Formato: pesos en safetensors bfloat16; no hay versiones GGUF ni cuantizadas publicadas, lo que limita el despliegue en entornos sin soporte bf16.
- Dependencia de `flash-linear-attention`: la carga requiere `import fla`; sin esa librería, `AutoModelForCausalLM` puede no resolver la arquitectura.
- Contexto: no se especifica la longitud máxima de contexto soportada por el checkpoint podado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-Wanda-80pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Paper de Wanda (Sun et al., 2023): https://arxiv.org/abs/2306.11695
- Paper de Mamba (Gu y Dao, 2023): https://arxiv.org/abs/2312.00752
- Repositorio oficial de Mamba: https://github.com/state-spaces/mamba
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
