# andyjzhao/GeneZip-636M-128K

## Resumen

GeneZip-636M-128K es un modelo de lenguaje de ADN (DNA language model) preentrenado desarrollado por andyjzhao y publicado bajo su nombre definitivo de artículo ("Camera Ready"). Se trata de un checkpoint de preentrenamiento puro, no de un modelo ajustado para tareas downstream, orientado a la investigación en modelado de secuencias genómicas y a los recetarios de evaluación DNALongBench definidos por el propio autor.

El modelo emplea una arquitectura de tipo GeneZip (transformer con esquema de compresión de secuencia a nivel de token, con un objetivo base de 32 pares de bases por token) y se preentrenó con una ventana de contexto de 128.000 pares de bases (bp), lo que lo sitúa en el rango de los modelos genómicos de contexto largo. Cuenta con aproximadamente 636 millones de parámetros y sus pesos están publicados en formato PyTorch junto con la configuración Hydra que describe arquitectura y enrutamiento.

Su relevancia radica en la disponibilidad de pesos con procedencia verificable (hash SHA-256 documentado e inmutabilidad respecto a la revisión de origen) y en un contexto de 128K bp, útil para tareas que requieren capturar dependencias regulatorias o estructurales a larga distancia en el genoma. La licencia Apache 2.0 facilita su reutilización en investigación y en desarrollos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GeneZip (transformer con compresión de secuencia; objetivo base 32 bp/token) |
| Parametros totales | 636M (aproximado, según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 bp |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint propio, no paquete Transformers AutoModel); configuración en `hydra_cfg.yaml` |

## Arquitectura y entrenamiento

GeneZip-636M-128K es un modelo de lenguaje genómico con arquitectura propia GeneZip, no un transformer estándar de Hugging Face. La configuración Hydra incluida recoge la arquitectura exacta, los límites de enrutamiento y metadatos científicos. El modelo opera sobre secuencias de ADN tokenizadas con un objetivo base de compresión de 32 pares de bases por token (BPT), que según el autor no debe confundirse con la ratio de compresión medida. El contexto de preentrenamiento es de 128.000 bp.

Los pesos provienen de la revisión fijada `jzshared/GeneZip-7R-LT-32BPT-128K-100B-650M` (checkpoint-24414), con hash SHA-256 `a70a35232d1bbcdc7c0a555e1fdcd279ffdf147a4029430e1874e9cddd4607e0`; los bytes de los pesos son idénticos a esa fuente. El repositorio no incluye estado del optimizador ni pesos ajustados para tareas downstream. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Modelado de secuencias de ADN: representación y predicción sobre secuencias genómicas tokenizadas a 32 bp/token.
- Contexto largo: ventana de 128.000 bp para capturar dependencias a larga distancia.
- Base para ajuste fino: el código de liberación acepta `ckpt=andyjzhao/GeneZip-636M-128K` para entrenamiento downstream.
- Evaluación en recetas DNALongBench: soporta el evaluador de preentrenamiento con `pretrained_ckpt` y la configuración de modelo/contexto correspondiente.
- No es un modelo de lenguaje natural: no se documentan capacidades multilingües, tool calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación en modelado genómico: usar el checkpoint como base preentrenada para estudiar representaciones de secuencias de ADN en contextos de hasta 128K bp.
- Ajuste fino para tareas downstream: emplear el código de GeneZip con `ckpt=andyjzhao/GeneZip-636M-128K` para entrenar clasificadores o predictores específicos (por ejemplo, elementos regulatorios) sobre secuencias largas.
- Evaluación con DNALongBench: reproducir los recetarios de evaluación del autor usando el evaluador de preentrenamiento y el mapeo de resultados del código.
- Análisis de dependencias a larga distancia: aprovechar la ventana de 128K bp para estudiar interacciones entre regiones genómicas distantes.
- Verificación de procedencia y reproducibilidad: utilizar `provenance.json` y el hash SHA-256 para auditar que los pesos coinciden con la revisión fuente fijada.
- Pruebas de carga e integración ("smoke checks"): validar que el checkpoint carga y se ejecuta con el código Camera Ready antes de integrarlo en pipelines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las comprobaciones cortas de carga ("smoke checks") no constituyen nuevas mediciones de rendimiento completo y remite al mapeo de resultados del código para las ejecuciones adoptadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 636M parámetros, los pesos en precisión completa o media precisión requieren del orden de varios GB, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: no disponible (no se confirma ni descarta).
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el uso previsto es mediante el código propio de GeneZip del repositorio `AndyJZhao/GeneZip` y `snapshot_download` de `huggingface_hub`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de lenguaje de ADN de tamaño y contexto similares) con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Checkpoint de preentrenamiento: no es un modelo ajustado para tareas downstream; requiere ajuste fino para aplicaciones concretas.
- No es un paquete Transformers AutoModel: requiere el código propio de GeneZip; el código Camera Ready se está preparando por separado y los pesos se han verificado con su release candidate local.
- Uso previsto limitado a investigación: la model card restringe el uso a investigación en modelado de secuencias genómicas y recetas DNALongBench.
- Ausencia de mediciones completas: los smoke checks no sustituyen a evaluaciones de benchmark; no hay datos publicados de rendimiento.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible en el contexto de secuencias de ADN; no se documenta.
- Limitaciones de idioma: no aplica a lenguaje natural; no se documentan idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso previsto declarado es investigación; conviene revisar las condiciones del código asociado.
- Caveat de producción: la falta de benchmarks publicados y de opciones de despliegue estándar desaconseja su uso en producción sin validación previa.

## Enlaces

- HuggingFace: https://huggingface.co/andyjzhao/GeneZip-636M-128K
- Fuente de pesos fijada: https://huggingface.co/jzshared/GeneZip-7R-LT-32BPT-128K-100B-650M/tree/baf1cdefd5e7ef751191a1440a5b61d018cf6458/checkpoint-24414
- Código GeneZip: https://github.com/AndyJZhao/GeneZip
