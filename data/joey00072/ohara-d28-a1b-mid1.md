# joey00072/ohara-d28-a1b-mid1

## Resumen

ohara-d28-a1b-mid1 es un checkpoint de preentrenamiento de la primera etapa (stage-1, contexto de 4k) del modelo ohara, una arquitectura hibrida causal encoder-decoder desarrollada por el usuario joey00072 dentro del repositorio de implementaciones de modelos autorregresivos ohara. Se trata de un modelo base, no afinado para instrucciones, con 23,85 mil millones de parametros totales y aproximadamente 0,98 mil millones de parametros activos en la matriz troncal (1,25 mil millones incluyendo la cabeza LM), gracias a una capa de mezcla de expertos (MoE) de 256 expertos con top-8 y un experto compartido.

El checkpoint corresponde al paso 2826 de entrenamiento, con 20.002.111.488 tokens procesados (hito del 20 % del plan de preentrenamiento) y una perdida de entrenamiento de 1,5847 nats. Utiliza el tokenizador de Qwen3 y se distribuye en formato safetensors con la libreria propia ohara. Su relevancia es fundamentalmente como pieza de investigacion: permite estudiar el comportamiento de una arquitectura hibrida con attention de ventana deslizante, attention global puenteada por KV, attention token-sparse, residual mHC y memoria de n-gramas en un regimen de parametros activos muy bajo respecto al total.

Al ser un checkpoint intermedio de preentrenamiento y no un modelo final, no dispone de model card comercial, licencia declarada, idiomas documentados ni resultados de benchmarks publicados. Cualquier uso en produccion requeriria un post-entrenamiento adicional y una verificacion explicita de la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida causal encoder-decoder (ohara_hybrid): attention de ventana deslizante (SWA) + attention global puenteada por KV + attention token-sparse, residual mHC, memoria de n-gramas, MoE de 256 expertos top-8 con experto compartido |
| Parametros totales | 23.846.942.486 (23,85 B) |
| Parametros activos | 0,98 B en la matriz troncal; 1,25 B incluyendo la cabeza LM |
| Longitud de contexto | 4096 tokens (stage-1) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tokenizador Qwen3) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokens de entrenamiento | 20.002.111.488 (20 % del plan) |
| Paso de entrenamiento | 2826 |
| Perdida de entrenamiento | 1,5847 nats |
| Libreria | ohara |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido causal encoder-decoder denominado internamente d28 `final_v2`. Combina tres mecanismos de attention: ventana deslizante (SWA) para el contexto local, attention global puenteada por KV para propagar informacion entre ventanas y attention token-sparse para reducir el coste computacional en secuencias largas. Ademas incorpora residuales mHC, una memoria de n-gramas y una capa MoE con 256 expertos, seleccion top-8 y un experto compartido, lo que explica la relacion entre 23,85 B parametros totales y solo 0,98 B activos en la matriz troncal.

El entrenamiento corresponde a la etapa 1 de preentrenamiento con contexto de 4096 tokens. En el checkpoint publicado se han procesado 20.002.111.488 tokens (hito del 20 %), con una perdida de 1,5847 nats en el paso 2826. No se documentan en la informacion disponible la composicion del dataset, el uso de RLHF o DPO, ni innovaciones adicionales como decodificacion especulativa. El tokenizador empleado es el de Qwen3.

## Capacidades

- Generacion de texto autorregresiva como modelo base de preentrenamiento.
- Razonamiento y modelado de lenguaje general, limitado por el estado intermedio del entrenamiento (20 % de los tokens previstos).
- Procesamiento de contexto de hasta 4096 tokens.
- Capacidad multilingue potencial heredada del tokenizador Qwen3, aunque no documentada oficialmente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo thinking.
- No es un modelo afinado para instrucciones: no cabe esperar un comportamiento conversacional alineado sin post-entrenamiento.

## Casos de uso

- Investigacion de arquitecturas hibridas: el checkpoint permite reproducir y analizar el comportamiento de la combinacion SWA + attention global puenteada por KV + attention token-sparse en un modelo de 23,85 B parametros totales con solo 0,98 B activos, util para estudiar eficiencia y calidad en funcion del contexto.
- Experimentos de escalado de MoE: con 256 expertos top-8 y experto compartido, sirve para medir el equilibrio de carga entre expertos, la utilizacion efectiva y el coste de enrutamiento en un regimen de preentrenamiento temprano.
- Estudio de memoria de n-gramas y residuales mHC: permite evaluar empiricamente como afectan estos mecanismos a la perplejidad y a la coherencia en secuencias de hasta 4096 tokens.
- Base para post-entrenamiento controlado: al ser un modelo base con tokenizador Qwen3, puede emplearse como punto de partida para experimentos de fine-tuning supervisado o DPO en dominios acotados, asumiendo el coste de completar el preentrenamiento.
- Reproduccion de pipelines de preentrenamiento: el codigo del repositorio ohara y la funcion `load_hf` permiten cargar el checkpoint y validar recetas de entrenamiento distribuidas con MoE.
- Analisis de eficiencia computacional: la baja proporcion de parametros activos frente a totales lo hace adecuado para comparar throughput y uso de memoria frente a modelos densos de tamano similar en tareas de investigacion.
- Evaluacion de tokenizadores: al usar el tokenizador Qwen3, permite comparar el rendimiento del modelo con otros modelos que comparten dicho tokenizador en tareas de modelado de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los 23,85 B parametros en safetensors ocupan aproximadamente 47,7 GB en precision de entrenamiento (el tamano del repo es de 47,7 GB); en fp16 serian unos 47,7 GB y en cuantizaciones de 8 y 4 bits se reduciria aproximadamente a la mitad y a un cuarto, respectivamente, aunque no se documentan tipos de cuantizacion soportados.
- GPU recomendadas: no disponible. Por volumen de pesos, un despliegue en precision completa requeriria GPUs de clase A100 80 GB o H100 80 GB, o varias GPUs en paralelo; no se dispone de datos oficiales de requisitos.
- Compatibilidad con GPU de consumo: no confirmada. Un modelo de 23,85 B parametros no cabe en GPUs de consumo de 24 GB en precision completa; solo seria viable con cuantizacion agresiva, que no esta documentada.
- Opciones de despliegue: la unica via documentada es la libreria ohara mediante `load_hf` sobre un snapshot de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ohara-d28-a1b-mid1 | 23,85 B | 0,98 B (1,25 B con LM head) | 4096 | no disponible | Hugging Face, checkpoint intermedio |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de preentrenamiento (paso 2826, 20 % de los tokens previstos): la calidad de generacion sera inferior a la de un modelo completamente entrenado.
- No esta afinado para instrucciones; no debe esperarse un comportamiento conversacional alineado ni seguimiento fiable de instrucciones.
- Contexto limitado a 4096 tokens en esta etapa.
- No se declara licencia, por lo que el uso comercial no esta autorizado de forma explicita y requiere contacto con el autor.
- No se documentan idiomas soportados; el comportamiento multilingue es incierto pese al tokenizador Qwen3.
- Riesgo de alucinacion y de sesgos no evaluado: no hay informacion sobre datos de entrenamiento, filtrado ni evaluaciones de seguridad.
- No se documentan tipos de cuantizacion ni soporte en frameworks de inferencia estandar, lo que limita su despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes, y los checkpoints antiguos se eliminan periodicamente, por lo que la disponibilidad de revisiones concretas puede cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joey00072/ohara-d28-a1b-mid1
- Repositorio GitHub ohara: https://github.com/joey00072/ohara
- Listado de modelos con tag ohara: https://huggingface.co/models?other=ohara
