# nepetai/ivis-400m-gpu

## Resumen

Ivis-400M-Nepetai es un modelo de lenguaje de 450 millones de parámetros desarrollado por el usuario nepetai, que combina una arquitectura híbrida de Transformer, Mamba SSM (State Space Model) y Mixture of Experts (MoE). Está diseñado específicamente para árabe e inglés, con un enfoque declarado en la generación de código. El modelo destaca por su eficiencia computacional: aunque tiene unos 451 millones de parámetros totales, solo activa alrededor de 230 millones durante la inferencia gracias a su diseño MoE con 4 expertos (2 activos). Se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo reside en su arquitectura híbrida poco común, que combina capas de atención tradicionales con capas de Mamba (SSM) en una configuración de alternancia cada 4 capas. Sin embargo, su longitud de contexto es muy limitada (256 tokens), lo que restringe su uso a tareas de corto alcance. El repositorio incluye scripts de entrenamiento y configuración, pero no se publican pesos preentrenados, por lo que el usuario debe entrenarlo o ajustarlo desde cero. Es un proyecto experimental orientado a la investigación y prototipado rápido en entornos con recursos de GPU modestos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer + Mamba SSM + Mixture of Experts |
| Parametros totales | 451 millones (0.45B) |
| Parametros activos | ~230 millones |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (solo código fuente y configuraciones) |

## Arquitectura y entrenamiento

El modelo combina tres paradigmas arquitectónicos: capas de Transformer con atención global, capas de Mamba (SSM) para modelado secuencial eficiente, y un mecanismo de Mixture of Experts con 4 expertos (de los que se activan 2) para escalar capacidad sin multiplicar el coste de inferencia. La configuración incluye 10 capas en total, con 2 capas Mamba intercaladas cada 4 capas. La atención usa Grouped Query Attention (GQA) con 18 cabezas y 6 cabezas clave-valor, y un tamaño de oculto de 1.152 dimensiones. El vocabulario es de 65.536 tokens con tokenización BPE.

No se dispone de información sobre los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. El repositorio incluye un script de entrenamiento (`train.py`) que permite ejecutar pasos de entrenamiento, lo que sugiere que el modelo se puede entrenar o ajustar desde cero. No hay evidencias de que se hayan publicado pesos preentrenados; el foco está en el código fuente y la configuración.

## Capacidades

- Generación de texto y razonamiento básico en árabe e inglés.
- Generación de código, como se indica en las etiquetas del modelo.
- Arquitectura MoE eficiente: solo 230 millones de parámetros activos de los 451 millones totales, lo que reduce el coste de inferencia.
- Soporte multilingüe limitado a árabe e inglés.
- No se menciona soporte para tool calling, agentes o razonamiento multi-paso.
- No se especifican capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Prototipado en entornos con recursos limitados: el modelo, con solo 450 millones de parámetros y 230 millones activos, puede ejecutarse en GPUs de gama media (8 GB de VRAM) según la documentación, lo que lo hace adecuado para experimentos en Google Colab o instancias de RunPod sin costes elevados.
- Experimentación con arquitecturas híbridas: investigadores que estudien la combinación de Transformer, Mamba y MoE pueden usar este modelo como base para comparar eficiencia y calidad.
- Generación de código en árabe e inglés: aunque el contexto es corto (256 tokens), puede usarse para generar snippets de código cortos o completar funciones simples.
- Fine-tuning en tareas específicas: al ser de pequeño tamaño y con licencia Apache 2.0, se puede ajustar para tareas como clasificación de texto, resumen o extracción de entidades en árabe e inglés.
- Despliegue en dispositivos edge: su tamaño compacto (450M params) y la posibilidad de cuantización (aunque no se documentan formatos) lo hacen candidato para entornos embebidos con limitaciones de memoria.
- Investigación en aprendizaje federado o entrenamiento distribuido: el script de entrenamiento incluido permite explorar estrategias de entrenamiento en GPU con presupuesto reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parámetros en FP16, el modelo ocupa aproximadamente 900 MB de memoria, más overhead. En cuantización de 4 bits (si estuviera disponible) podría reducirse a ~250 MB, aunque no se documentan formatos de cuantización.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, T4 (Colab) o A10G (RunPod). El modelo no requiere GPUs de datacenter.
- Compatibilidad con GPU de consumo: sí, en tarjetas de 8 GB o más.
- Opciones de despliegue: la librería propia `ivis-nepetai` incluye scripts de entrenamiento e inferencia; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI. El despliegue sería mediante el código del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Params | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ivis-400M-Nepetai | 450M (230M activos) | Hybrid Transformer + Mamba + MoE | 256 tokens | Apache 2.0 | Solo código fuente |
| SmolLM-135M | 135M | Transformer (dense) | 2K tokens | Apache 2.0 | Pesos preentrenados |
| Zamba-130M | 130M | Hybrid Mamba + attention | 2K tokens | Apache 2.0 | Pesos preentrenados |
| Arxiv MoE 350M | 350M (140M activos) | MoE | 2K tokens | MIT | Pesos preentrenados |

La comparativa es estructural, ya que no hay datos de rendimiento para Ivis-400M. Modelos como SmolLM o Zamba tienen pesos preentrenados y contextos mayores, lo que los hace más prácticos para tareas reales. Ivis-400M destaca por su enfoque experimental en arquitecturas híbridas, pero carece de pesos públicos y de contexto suficiente para tareas complejas.

## Limitaciones y advertencias

- Longitud de contexto muy limitada (256 tokens), lo que impide su uso en tareas de memoria larga o conversaciones extensas.
- No se publican pesos preentrenados; el repositorio solo contiene código y configuraciones, por lo que requiere un entrenamiento completo, lo que puede ser costoso y complejo.
- Riesgo de alucinación: al ser un modelo pequeño y sin datos de entrenamiento documentados, es propenso a generar contenido incorrecto, especialmente en código.
- Soporte lingüístico limitado a árabe e inglés; no se mencionan otros idiomas.
- No hay información sobre sesgos, pero al no haber datos de entrenamiento, se desconoce su comportamiento en grupos minoritarios.
- Sin compatibilidad confirmada con herramientas estándar de despliegue (vLLM, Ollama, TGI), lo que dificulta su integración en pipelines de producción.
- No se documentan formatos de cuantización ni métodos de optimización para inferencia.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/nepetai/ivis-400m-gpu)
- No se han encontrado otros enlaces (papers, blogs, repos externos) en la información disponible.
