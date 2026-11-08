# AdaptiveChunking/pilot_Apc_s1

## Resumen

pilot_Apc_s1 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un run de experimentación sobre una arquitectura H-Net (hierarchical network) con tokenización a nivel de byte, entrenado mediante el denominado "legacy trainer" del proyecto beetle-hnet. No es un modelo conversacional ni un modelo de lenguaje de propósito general: es una pieza de un experimento sobre segmentación dinámica de texto en chunks (dynamic chunking), empaquetada en el formato de run individual del ecosistema Beetle.

El modelo tiene 22.516.992 parámetros (aproximadamente 22,5 millones) según los pesos en safetensors, con un tamaño de repositorio de 0,1 GB. Se distribuye bajo licencia Apache 2.0 y en formato PyTorch/safetensors. El repositorio incluye una rama `main` con los pesos más recientes, `final.json` y `log.jsonl`, además de una rama `step-N` con un checkpoint retenido (paso 6000) que contiene `model.safetensors` y `config.json`.

Su relevancia es acotada y experimental: sirve como referencia reproducible para investigar estrategias de chunking adaptativo a nivel de byte y para comparar el comportamiento de límites de segmentación mediante las sondas FLORES+ publicadas por el propio autor. No está pensado para despliegue en producción ni para tareas generativas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical network) con tokenización byte-level; detalles internos no disponibles |
| Parametros totales | 22.516.992 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch); `model.safetensors` + `config.json` por checkpoint |

## Arquitectura y entrenamiento

La arquitectura es una H-Net (hierarchical network) con procesamiento a nivel de byte, implementada en el proyecto beetle-hnet. El modelo se entrenó con el "legacy trainer" del repositorio, concretamente con el script `legacy/tier1/train.py`. El repositorio conserva un único checkpoint retenido en la rama `step-N` (paso 6000), con los pesos y la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights`, que debe aplicarse restaurando `sd[dst] = sd[src]` para cada entrada del mapa.

El entrenador legacy no conservó estado del optimizador, por lo que no existe directorio `training_state/` en el repositorio. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La innovación declarada del proyecto es el chunking dinámico a nivel de byte, evaluado mediante sondas de límites FLORES+ publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes` bajo el prefijo `pilot_Apc_s1/`.

## Capacidades

- Procesamiento de texto a nivel de byte mediante tokenización byte-level, sin vocabulario subword dependiente de idioma.
- Segmentación dinámica en chunks (dynamic chunking), que es el objeto central del experimento.
- Evaluación de límites de segmentación mediante sondas FLORES+ (boundary probes).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; las sondas FLORES+ sugieren evaluación sobre textos multilingües, pero no se especifican los idiomas cubiertos.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo permite reproducir y analizar cómo una H-Net agrupa bytes en unidades de mayor nivel, comparando con tokenizadores subword convencionales.
- Estudio de chunking adaptativo: sirve como punto de partida para experimentos que ajusten dinámicamente los límites de segmentación según el contenido, usando el checkpoint del paso 6000 como referencia.
- Reproducción de experimentos: al conservar `config.json`, la configuración de entrenamiento y el mapa `tied_weights`, permite reconstruir el estado exacto del modelo para verificar resultados publicados.
- Evaluación de límites lingüísticos: las sondas FLORES+ asociadas permiten medir la calidad de los límites de segmentación sobre textos multilingües y comparar entre runs del proyecto.
- Baseline para arquitecturas jerárquicas: con 22,5 millones de parámetros, es un baseline ligero para comparar variantes de H-Net o de modelos jerárquicos en tareas de segmentación.
- Docencia y experimentación académica: su tamaño reducido (0,1 GB) permite entrenar y evaluar variantes en hardware modesto, sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente referencia sondas de límites FLORES+ en el dataset `AdaptiveChunking/hnet-chunking-probes` (subdirectorio `pilot_Apc_s1/`), sin cifras de rendimiento en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 millones de parámetros en fp32, los pesos ocupan aproximadamente 90 MB; en fp16, unos 45 MB. El consumo real depende de la longitud de secuencia y de las activaciones, no documentadas.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre debería ser suficiente para inferencia en fp32, aunque no se dispone de mediciones oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1060 o superior, RTX 20xx/30xx/40xx), dado el tamaño del modelo.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y sin pipeline declarado en Hugging Face, el despliegue requeriría cargar los pesos manualmente con PyTorch y aplicar el mapa `tied_weights`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| pilot_Apc_s1 | 22,5 M | No disponible | Apache 2.0 | H-Net byte-level con chunking dinámico (experimental) |
| Modelos de tokenización byte-level de propósito general | No disponible | No disponible | Variable | Tokenización byte-level sin arquitectura jerárquica |
| Modelos H-Net de investigación comparables | No disponible | No disponible | Variable | Arquitecturas jerárquicas para segmentación |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría. El modelo es un run experimental aislado dentro de un proyecto de investigación, sin benchmarks publicados que permitan comparaciones rigurosas.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está diseñado ni validado para uso en producción.
- No se documentan capacidades generativas ni de razonamiento; no debe emplearse como modelo de lenguaje de propósito general.
- No se dispone de información sobre sesgos, datos de entrenamiento ni composición del corpus, lo que impide evaluar riesgos de sesgo.
- Riesgo de alucinación: no aplica en el sentido habitual al no ser un modelo generativo documentado, pero cualquier uso generativo no verificado carece de garantías.
- Limitaciones de contexto e idioma: no documentadas; se desconoce la longitud máxima de secuencia soportada.
- El entrenador legacy no conservó estado del optimizador, lo que impide reanudar el entrenamiento desde el checkpoint sin reinicializar el estado.
- Es necesario aplicar correctamente el mapa `tied_weights` al cargar los pesos; de lo contrario, el modelo no se restaurará de forma fiel.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo no ofrece garantías de funcionamiento para tales fines.
- Sin descargas ni likes en el momento de la consulta, y sin pipeline declarado en Hugging Face: el soporte de la comunidad y la integración con herramientas estándar son inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_Apc_s1
- Repositorio bundle original: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
