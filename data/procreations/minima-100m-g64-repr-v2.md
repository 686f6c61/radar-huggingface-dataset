# ProCreations/minima-100m-g64-repr-v2

## Resumen

Minima 100M g64 repr v2 es un modelo de lenguaje pequeño desarrollado por ProCreations (SSH) como un artefacto ternario empaquetado para la librería `minima`. Se trata de una versión comprimida y cuantizada del encoder LiquidAI/LFM2.5-Encoder-350M, con 94,2 millones de parámetros cuyos pesos se representan con valores lógicos {-1, 0, +1} en formato de runtime I2_S, lo que corresponde a una cuantización de aproximadamente 1,58 bits por peso (W1.58A8). El modelo está diseñado para ejecutarse en hardware de consumo y para ser cargado mediante `MinimaModel.from_pretrained(...)` desde el paquete `minima`.

Este artefacto resuelve el problema de la inferencia eficiente en entornos con recursos limitados, reduciendo drásticamente el tamaño y el coste computacional frente al modelo base de 350M. Su relevancia actual radica en la tendencia hacia modelos pequeños y cuantizados que puedan ejecutarse en CPU, GPU de gama baja o incluso dispositivos edge, sin sacrificar demasiado la calidad de las representaciones. La versión 2 indica una iteración sobre el esquema de representación, probablemente con un grupo de cuantización de 64 (g64) y una técnica de recuperación por rango que se detalla en `minima_config.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en LiquidAI/LFM2.5-Encoder-350M, tipo encoder transformer, sin confirmar) |
| Parametros totales | 94.207.744 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (definida en `minima_config.json`, no accesible en la informacion proporcionada) |
| Tipos de cuantizacion | Ternario {-1, 0, +1} en formato I2_S (W1.58A8); activaciones de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (enlace al LICENSE de LiquidAI/LFM2.5-Encoder-350M) |
| Formato de pesos | safetensors (con pesos ternarios empaquetados en formato I2_S) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que se deriva de LiquidAI/LFM2.5-Encoder-350M, un encoder transformer de 350 millones de parametros desarrollado por LiquidAI, pero no se especifica si se ha modificado la topologia, el numero de capas o la dimension del modelo. El artefacto almacena los pesos de la matriz en formato ternario con valores {-1, 0, +1} y un esquema de cuantizacion por grupos de 64 (segun el nombre "g64"), con un rango de recuperacion (recovery rank) definido en `minima_config.json`. No se proporcionan datos sobre el entrenamiento, el dataset utilizado, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se indica si el modelo fue fine-tuned sobre el encoder base o si simplemente se cuantizaron los pesos ya entrenados.

## Capacidades

No se han documentado capacidades especificas del modelo en la model card ni en los resultados de busqueda. Dado que se trata de un encoder pequeno y cuantizado, es razonable esperar que pueda realizar tareas de representacion de texto, como clasificacion o extraccion de embeddings, pero no hay evidencia de capacidades generativas, tool calling, agentes o razonamiento multi-paso. El unico dato concreto es que se carga mediante la libreria `minima` y que los pesos son ternarios, lo que sugiere un uso orientado a eficiencia extrema. No se menciona soporte multilingue, vision ni audio.

## Casos de uso

No se han publicado casos de uso concretos para este modelo en la informacion disponible. Dado su tamano y naturaleza ternaria, podria emplearse en escenarios de inferencia en dispositivos con memoria muy limitada, como:

- Clasificacion de texto en tiempo real en dispositivos embebidos.
- Generacion de embeddings para sistemas de busqueda semantica en entornos offline.
- Prototipado rapido de aplicaciones de NLP en hardware de bajo coste.

Sin embargo, estas son inferencias basadas en el tipo de modelo, no en documentacion oficial. Se recomienda consultar el repositorio `minima` para conocer las aplicaciones previstas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se comparan resultados con otros modelos similares. Se desconoce el rendimiento real en tareas de lenguaje.

## Requisitos de hardware

- El modelo tiene 94.207.744 parametros. Con cuantizacion ternaria de 1,58 bits por peso, el peso total en memoria es de aproximadamente 94.207.744 x 1,58 / 8 = 18,6 MB, mas el overhead del formato I2_S y las activaciones de 8 bits. En la practica, el archivo safetensors ocupa 0,1 GB en el repositorio.
- Cabe en cualquier GPU consumer moderna (RTX 2060, GTX 1660, etc.) e incluso en CPU sin GPU, ya que el modelo es extremadamente pequeno.
- No se han especificado requisitos minimos de VRAM ni latencia. Se recomienda probar con `llama.cpp` o `Ollama` si la libreria `minima` no ofrece soporte directo, aunque el formato ternario puede requerir un runtime especifico.
- Opciones de despliegue: la libreria `minima` es la via principal (carga con `MinimaModel.from_pretrained`). No se menciona soporte para vLLM, TGI u otros servidores de inferencia.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. No se conocen alternativas directas con el mismo tamano y cuantizacion ternaria en el ecosistema open source. Modelos como BitNet b1.58 (de Microsoft) tienen un enfoque similar (pesos ternarios), pero no se puede establecer una comparacion rigurosa sin datos de rendimiento. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo extremadamente pequeno (94M parametros), lo que limita su capacidad para tareas complejas de lenguaje, razonamiento o generacion de texto extenso.
- La cuantizacion ternaria puede degradar la calidad de las representaciones frente al modelo original de 350M, aunque no hay metricas que lo confirmen.
- No se ha documentado el comportamiento en cuanto a sesgos, alucinaciones o idiomas soportados.
- La licencia `lfm-open-license-v1.0` puede imponer restricciones para uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar en produccion.
- El modelo es un artefacto experimental (version 2) con cero descargas y cero likes en HuggingFace; no hay evidencia de validacion externa.
- La informacion sobre la configuracion exacta (grupo, rango de recuperacion, contexto) reside en `minima_config.json`, que no se ha podido inspeccionar en esta ficha.

## Enlaces

- HuggingFace: https://huggingface.co/ProCreations/minima-100m-g64-repr-v2
- Repositorio de la libreria minima: https://github.com/SSHDotCodes/minima
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M/blob/main/LICENSE
- Perfil del autor en HuggingFace: https://huggingface.co/ProCreations/models
