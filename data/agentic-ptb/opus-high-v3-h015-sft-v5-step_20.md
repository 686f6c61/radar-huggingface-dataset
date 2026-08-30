# agentic-ptb/opus-high-v3.h015.sft-v5.step_20

## Resumen

`opus-high-v3.h015.sft-v5.step_20` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB, un conjunto de experimentos que exploran el entrenamiento de modelos mediante agentes autónomos basados en Claude Code. Este checkpoint concreto pertenece a la celda `opus-high-v3`, una ejecución de Claude Opus con esfuerzo alto, y se etiqueta explícitamente como un resultado negativo: el run no encontró ninguna mejora en los pesos entrenados respecto al modelo base.

El modelo parte de `Qwen/Qwen3.5-9B-Base`, con aproximadamente 9,41 mil millones de parámetros, y se distribuye en formato safetensors con un tamaño de repositorio de 18,8 GB. La licencia es Apache 2.0. Su interés no reside en el rendimiento, sino en la reproducibilidad y el estudio cualitativo de los fallos de este tipo de pipelines de entrenamiento agéntico. La propia model card advierte que no debe inferirse calidad a partir de su publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-9B-Base (arquitectura exacta no especificada en la informacion disponible) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer de 9,4 mil millones de parametros, pero la informacion publicada no detalla la configuracion interna (numero de capas, dimensiones, atencion, etc.). El checkpoint se genero durante un run de AgentPTB denominado `opus-high-v3`, ejecutado con Claude Opus a esfuerzo alto durante 15 horas (`h015`). El proceso consistio en una serie de pasos de fine-tuning supervisado (SFT) etiquetados como `sft-v5`, de los cuales este es el paso 20.

El resultado del entrenamiento fue negativo: no se observo ninguna mejora en los pesos respecto al modelo base. El run se conserva como artefacto intermedio para reproducibilidad y analisis cualitativo, no como un modelo utilizable. No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens procesados ni tecnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades especificas para este checkpoint. Al ser un resultado intermedio y negativo de un experimento de investigacion, no se puede afirmar que el modelo haya adquirido habilidades concretas de generacion, razonamiento, codigo o tool calling. La unica informacion fiable es que parte de un modelo base de 9,4 B de Qwen, pero no se ha verificado su comportamiento tras el proceso de SFT.

## Casos de uso

Dado el caracter experimental y negativo del checkpoint, los casos de uso son limitados y de indole investigadora:

- Reproducibilidad de experimentos: permite a otros investigadores replicar el run `opus-high-v3` y verificar los resultados negativos reportados, comparando los pesos del paso 20 con el modelo base.
- Estudio de fallos en entrenamiento agéntico: sirve como caso de estudio para analizar por que un pipeline de SFT dirigido por un agente no logra mejorar los pesos, contribuyendo a la comprension de las limitaciones de este enfoque.
- Analisis de deriva de pesos: se puede comparar la distribucion de los tensores de este checkpoint con la del modelo base para cuantificar el grado de cambio (o ausencia de cambio) tras el entrenamiento.
- Desarrollo de metricas de calidad para checkpoints intermedios: los datos de este run pueden usarse para disenar criterios automaticos que detecten ausencia de mejora y aborten runs costosos.
- Investigacion sobre reproducibilidad en IA: el repositorio asociado (`agentic-ptb/opus-high-v3-data`) puede servir para auditar la trazabilidad de los artefactos generados por agentes autonomos.
- No se recomienda ningun caso de uso en produccion, dado que el propio autor advierte que no hay mejora entrenada y que no debe inferirse calidad de la publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El checkpoint se presenta como un resultado negativo sin evaluaciones cuantitativas de rendimiento.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware para este checkpoint. Como referencia orientativa, un modelo de 9,4 B de parametros en precision FP16 requiere aproximadamente 18,8 GB de VRAM solo para los pesos, por lo que una GPU con 24 GB (como una RTX 4090) podria cargarlo en FP16, aunque sin garantias de latencia o throughput. Para inferencia eficiente se podrian usar cuantizaciones (GGUF, AWQ, etc.), pero no se han publicado versiones cuantizadas de este checkpoint. Las opciones de despliegue habituales para modelos de este tamano (vLLM, llama.cpp, Ollama, TGI) serian aplicables en teoria, pero no hay documentacion especifica.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos similares. Este checkpoint no es un modelo final, sino un artefacto intermedio de un experimento fallido, por lo que carece de sentido compararlo con alternativas comerciales o de codigo abierto como Qwen3.5-9B-Instruct, Llama 3.1 8B o Mistral 7B. La unica referencia directa es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual se deriva.

## Limitaciones y advertencias

- Resultado negativo: el run no encontro ninguna mejora en los pesos entrenados; el checkpoint no debe usarse como modelo de inferencia.
- Advertencia del autor: la model card indica explicitamente que no se debe inferir calidad a partir de la publicacion.
- Sin documentacion de capacidades: no se han verificado habilidades de generacion, razonamiento o tool calling.
- Sin datos de contexto ni idiomas: se desconoce la longitud de contexto soportada y los idiomas cubiertos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para produccion por su naturaleza experimental.
- Riesgo de alucinacion y sesgos: al no haberse evaluado, no se puede descartar la presencia de sesgos del modelo base ni comportamientos no deseados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h015.sft-v5.step_20
- Dataset asociado al run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
