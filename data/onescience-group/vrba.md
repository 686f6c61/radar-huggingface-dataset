# OneScience-Group/vRBA

## Resumen

vRBA es un paquete de investigación para aprendizaje de operadores aplicado a dinámica de burbujas, desarrollado por OneScience-Group. No es un modelo de lenguaje: se trata de un checkpoint de PyTorch (`weight/best_model.pth`) que reproduce un experimento de aprendizaje de operadores sobre datos de dinámica de fluidos, concretamente sobre las trayectorias de presión y radio de burbujas descritas en el dataset vRBA-Bubble.

El paquete incluye el código del modelo, la configuración de entrenamiento, los scripts de inferencia y las utilidades de visualización. La model card indica que el paquete se entrenó una sola vez y que las cifras reportadas no son garantías para otra ejecución. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos no están incluidos en la descarga de Hugging Face o que el artefacto es de tamaño despreciable.

Su relevancia es acotada y específica: sirve como referencia reproducible para investigadores que trabajan en PINNs, aprendizaje de operadores y simulación de dinámica de burbujas, no como un modelo de propósito general. La licencia es Apache 2.0 para el código, pero la model card advierte explícitamente que la licencia del dataset no debe inferirse de la del código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (aprendizaje de operadores; la model card no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de series temporales físicas, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos del repositorio) |
| Licencia | apache-2.0 (código); licencia del dataset no especificada |
| Formato de pesos | checkpoint PyTorch (`weight/best_model.pth`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo más allá de etiquetarlo como aprendizaje de operadores (*operator learning*) en el contexto de PINNs (physics-informed neural networks) y atención basada en residuos variacionales, según la procedencia de los datos en el repositorio NABLA-SciML. No se especifican el número de capas, dimensiones ocultas, mecanismos de atención ni el número total de parámetros.

Los datos de entrenamiento provienen del dataset OneScience/vRBA-Bubble. El fichero `res_1000.npz` contiene `del_p` y `R` con forma [1500, 1000] en float64, y `t` con forma [1000]. El modelo utiliza las primeras 1.000 trayectorias, divididas en 800 de entrenamiento, 100 de validación y 100 de test. No se indica el número de tokens (no aplica), la composición del dataset más allá de estas trayectorias, ni si hubo RLHF, DPO u otras etapas de alineación (no aplica a este dominio). Tampoco se detallan innovaciones técnicas concretas como decodificación especulativa o atención lineal.

## Capacidades

- Predicción de dinámica de burbujas: el modelo aprende el operador que mapea condiciones de entrada a la evolución temporal de `del_p` y `R` sobre trayectorias de 1.000 pasos temporales.
- Aprendizaje de operadores sobre series temporales físicas: adecuado para problemas de simulación donde se busca aproximar un operador entre espacios funcionales.
- Reproducibilidad de experimentos: incluye scripts de entrenamiento (`scripts/train.py`), inferencia (`scripts/inference.py`) y post-proceso (`scripts/result.py`), además de configuración en `config/config.yaml`.
- Visualización de resultados: el paquete incorpora utilidades para representar las salidas registradas en `results/`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reproducción de experimentos de aprendizaje de operadores: un investigador puede descargar el paquete, instalar dependencias y ejecutar `scripts/inference.py` para obtener las predicciones registradas y compararlas con las de `results/`, gracias a que el checkpoint y la configuración están incluidos.
- Validación de PINNs en dinámica de burbujas: el modelo sirve como línea base para comparar variantes de atención basada en residuos variacionales sobre el mismo dataset de 1.000 trayectorias con split 800/100/100.
- Desarrollo de simuladores sustitutos (*surrogate models*): en entornos donde la simulación física directa es costosa, el operador aprendido puede evaluarse como aproximación rápida sobre las 1.000 trayectorias del dataset.
- Docencia y formación en SciML: el paquete incluye código, configuración y scripts de visualización, lo que facilita su uso en cursos o talleres sobre aprendizaje de operadores y física informada.
- Extensión a nuevos datasets de burbujas: dado que el pipeline de entrenamiento es reproducible (`scripts/train.py` con `config/config.yaml`), se puede reentrenar sobre datos adicionales respetando la advertencia de preservar el checkpoint original.
- Auditoría de resultados publicados: los resultados en `results/` y la referencia al DOI del artículo permiten verificar las cifras reportadas frente a una nueva ejecución, con la cautela de que el autor advierte que no son garantías para otro entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `results/` y al artículo con DOI `10.1038/s44387-026-00084-4` para el contexto de investigación, pero no incluye métricas numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros ni tamaño del checkpoint).
- GPU recomendadas: no disponible. El entrenamiento requiere un entorno PyTorch con acelerador, según indica la model card ("accelerator-enabled PyTorch environment"), sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante PyTorch nativo con `scripts/inference.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de aprendizaje de operadores ni métricas que permitan establecer una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo aborda dinámica de burbujas sobre el dataset vRBA-Bubble; no es reutilizable como modelo de propósito general.
- Entrenamiento único: la model card advierte explícitamente que el paquete se entrenó una vez y que las cifras reportadas no son garantías para otra ejecución.
- Repositorio de tamaño 0.0 GB: existe riesgo de que los pesos no estén efectivamente incluidos en la descarga de Hugging Face; conviene verificar el contenido tras `hf download`.
- Licencia del dataset no especificada: la model card indica que la licencia del dataset no debe inferirse de la licencia del código (Apache 2.0), lo que condiciona el uso comercial de los datos.
- Idiomas: los metadatos declaran únicamente inglés; no hay soporte multilingüe ni relevancia lingüística en el modelo.
- Sin datos de sesgos, alucinación o robustez: no se han publicado evaluaciones de este tipo en la información disponible, aunque el riesgo de alucinación en el sentido de LLM no aplica; sí aplica el riesgo de extrapolación fuera del régimen cubierto por las 1.000 trayectorias.
- Sin pipeline declarado en Hugging Face: no se puede invocar mediante la API de inferencia estándar del Hub.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/vRBA
- Dataset vRBA-Bubble (ModelScope): https://www.modelscope.cn/datasets/OneScience/vRBA-Bubble
- Procedencia de los datos (NABLA-SciML): https://github.com/jdtoscano94/NABLA-SciML/tree/main/vRBA_variational_residual_based_attention_PINNs_Operator_learning
- Artículo / página de datos (DOI): https://doi.org/10.1038/s44387-026-00084-4
