# Aziolla/moe-fusion-sft

## Resumen

`Aziolla/moe-fusion-sft` es un repositorio de checkpoints de investigación publicado por el usuario Aziolla (autor identificado en el README como ZihanShao) el 20 de noviembre de 2026. No se trata de un modelo listo para inferencia con `AutoModel` de Transformers, sino de un archivo de estados nativos de entrenamiento (modelo, optimizador y RNG) sin conversión, orientado a reproducir experimentos de fusión de expertos en arquitecturas MoE y de ajuste supervisado sobre un backbone Qwen.

El contenido principal son los experimentos completados de "Marin MoE", que cruzan variantes de fusión PRE/POST con una y tres ramas pseudo, cada una de 1.592.289.272 parámetros, 11.420 actualizaciones y 47.898.951.680 slots de entrada. En paralelo, el repositorio incluye un estudio separado sobre el backbone de texto `Qwen/Qwen3.5-2B-Base`, con las variantes BASELINE y LOOP_KV_REUSE completadas (5.999.999.774 entradas no padding cada una) y la variante POST todavía en entrenamiento.

Su relevancia es acotada y de carácter investigador: preserva estados nativos y procedencia exacta (commits fijados, hashes SHA256 en catálogos) para auditoría y reanudación de experimentos, pero no distribuye el corpus de entrenamiento, no ofrece pesos convertidos a safetensors ni GGUF, y no documenta licencia, idiomas ni pipeline. El repositorio ocupa 217,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (experimentos Marin MoE) y backbone de texto Qwen3.5-2B-Base con componentes MTP/visión excluidos |
| Parametros totales | 1.592.289.272 (Marin MoE); 1.881.825.088 (Qwen BASELINE/LOOP); 1.905.561.408 (Qwen POST) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (estados nativos sin conversión) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Estados nativos de modelo/optimizador/RNG sin conversión; no cargable con AutoModel; catálogos con SHA256 y rutas de restauración |

## Arquitectura y entrenamiento

Los experimentos Marin MoE se basan en la arquitectura upstream `FFishy-git/Loop-ahead`, con referencias fijadas al commit `xjxyys/loopTF-workspace@94f038c818f205e47cac5af85a8b1caa7fc30743`. Se completaron cruces de fusión PRE/POST con una y tres ramas pseudo, cada configuración con 1.592.289.272 parámetros, 11.420 actualizaciones y 47.898.951.680 slots de entrada. El autor advierte explícitamente que los estados finales en bruto no deben reetiquetarse como EMA.

El estudio Qwen3.5 utiliza el backbone de texto `Qwen/Qwen3.5-2B-Base@b1485b2fa6dfa1287294f269f5fb618e03d52d7c`, con componentes MTP y visión nativos excluidos de forma idéntica en todas las variantes. La receta compartida es NTP de texto nativo en una pasada más SFT de chat enmascarado, no SFT de instrucciones puro. BASELINE y LOOP_KV_REUSE completaron 5.999.999.774 entradas no padding cada uno; POST sigue entrenando y su snapshot de recuperación congelado no constituye un resultado final. Los hitos de 3B/6B y los resultados finales de 23 tareas se añadirán solo cuando se midan. El corpus de entrenamiento es privado y no se distribuye.

## Capacidades

- No se documentan capacidades de inferencia: el repositorio contiene checkpoints de investigación, no un modelo desplegable.
- Los estados nativos no son cargables con `AutoModel` de Transformers ni con las herramientas estándar de inferencia.
- No hay soporte declarado de tool calling, function calling ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay modo thinking, visión ni audio disponibles en los checkpoints publicados (los componentes MTP/visión se excluyen de forma explícita).
- El uso previsto es la reproducción de experimentos, la auditoría de procedencia y la reanudación del entrenamiento desde estados nativos.

## Casos de uso

- Reproducción de experimentos de fusión MoE: los estados nativos de modelo, optimizador y RNG permiten reanudar exactamente los cruces PRE/POST con una y tres ramas pseudo documentados en el catálogo de checkpoints.
- Auditoría de procedencia: los catálogos incluyen tamaños de archivo exactos, SHA256, arquitectura, progreso de entrenamiento y rutas de restauración, lo que permite verificar la integridad de cada estado transferido frente a los recibos de verificación del servidor.
- Investigación sobre reutilización de KV cache: la variante LOOP_KV_REUSE del estudio Qwen3.5, con 5.999.999.774 entradas no padding completadas, sirve como referencia para estudiar el impacto de la reutilización de caché en el ajuste.
- Estudio de recetas mixtas NTP + SFT de chat enmascarado: el repositorio documenta esta receta compartida, útil para comparar con SFT de instrucciones puro en modelos de ~2B parámetros.
- Comparación de escalado en el backbone Qwen3.5-2B: los hitos de 3B/6B previstos (aún no medidos) permitirán analizar el efecto del tamaño del modelo sobre las 23 tareas de evaluación planificadas.
- Reanudación de la variante POST: el snapshot de recuperación congelado permite retomar el entrenamiento en curso sin reiniciar desde cero, aunque no debe tratarse como resultado final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los resultados finales de 23 tareas del estudio Qwen3.5 se añadirán solo cuando se midan realmente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los checkpoints no son cargables con herramientas de inferencia estándar.
- El repositorio ocupa 217,3 GB, por lo que el almacenamiento necesario para clonarlo o descargarlo supera ampliamente la capacidad típica de un disco consumer.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el formato nativo no es compatible con `AutoModel` ni con formatos GGUF/safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Aziolla/moe-fusion-sft | 1,59B (Marin MoE); 1,88-1,91B (Qwen) | no disponible | Estados nativos sin conversión | no disponible | Checkpoints de investigación |
| Qwen/Qwen3.5-2B-Base | ~2B (backbone de referencia) | no disponible | safetensors (formato estándar) | no disponible en la información | Modelo base para inferencia y ajuste |
| FFishy-git/Loop-ahead | no disponible | no disponible | no disponible | no disponible | Arquitectura upstream de referencia |

La comparación directa con alternativas de la misma categoría no está disponible: los checkpoints de `moe-fusion-sft` no son modelos desplegables y no se han publicado métricas que permitan contrastar rendimiento con otros modelos de tamaño similar.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el repositorio de investigación privado del autor (`https://github.com/ZihanShao/moe-fusion-sft`) para el código y la procedencia exacta de las fuentes.
- El formato nativo no es cargable con `AutoModel` ni con herramientas estándar de inferencia; no hay pesos en safetensors ni GGUF.
- El corpus de entrenamiento es privado y no se distribuye; los checkpoints públicos no dan acceso a los datos.
- La variante POST del estudio Qwen3.5 sigue en entrenamiento: su snapshot congelado no es un resultado final y no debe citarse como tal.
- Los estados finales en bruto no deben reetiquetarse como EMA, según la advertencia explícita del autor.
- Un archivo planificado en el catálogo no prueba su transferencia; solo los recibos de verificación del servidor determinan qué estados están presentes.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma porque no hay modelo de inferencia evaluable.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial.
- El tamaño del repositorio (217,3 GB) y la ausencia de pipeline, idiomas y métricas dificultan su evaluación rápida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Aziolla/moe-fusion-sft
- Repositorio de investigación del autor (privado): https://github.com/ZihanShao/moe-fusion-sft
- Arquitectura upstream Loop-ahead: https://github.com/FFishy-git/Loop-ahead
- Workspace de referencia fijado: https://github.com/xjxyys/loopTF-workspace/tree/94f038c818f205e47cac5af85a8b1caa7fc30743
- Backbone Qwen3.5-2B-Base: https://huggingface.co/Qwen/Qwen3.5-2B-Base/tree/b1485b2fa6dfa1287294f269f5fb618e03d52d7c
- Tracking LoopTF-4-CSPs/moe-fusion y SFT en Forge W&B: no disponible (enlace no proporcionado)
