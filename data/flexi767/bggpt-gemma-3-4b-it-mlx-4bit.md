# flexi767/BgGPT-Gemma-3-4B-IT-MLX-4bit

## Resumen

BgGPT-Gemma-3-4B-IT-MLX-4bit es una conversión no oficial al formato MLX con cuantización de 4 bits del modelo búlgaro BgGPT-Gemma-3-4B-IT, desarrollado por el INSAIT Institute (Sofía, Bulgaria). El modelo original está basado en Gemma-3-4B de Google DeepMind y ha sido adaptado para funcionar eficientemente en hardware Apple Silicon mediante la librería MLX. Esta conversión mantiene la licencia Gemma Terms of Use y está pensada para su uso en Macs con chips M1 o superiores.

La relevancia de este modelo radica en que ofrece una versión ligera y optimizada de un modelo búlgaro de última generación, permitiendo ejecutar inferencia local en dispositivos Apple sin necesidad de GPU dedicada. La conversión fue realizada con la herramienta `mlx_vlm.convert` y verifica el chat de texto, aunque el modo multimodal no ha sido validado en esta versión. Con un tamaño de repositorio de 3,4 GB, es adecuado para entornos con memoria unificada limitada.

El modelo está orientado a desarrolladores que trabajan con el idioma búlgaro y necesitan desplegar asistentes conversacionales o aplicaciones de generación de texto en entornos locales, aprovechando las ventajas de MLX para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma-3-4B) |
| Parametros totales | 1.131.301.232 (segun metadata de HuggingFace; el modelo base Gemma-3-4B tiene aproximadamente 4B parametros) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit (MLX), 5.475 bits por peso |
| Idiomas soportados | bg, en |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base BgGPT-Gemma-3-4B-IT es un modelo de lenguaje basado en la arquitectura Transformer de Gemma-3-4B, desarrollado por Google DeepMind. Gemma 3 utiliza una arquitectura estándar de decoder-only con atención multi-cabeza y normalización RMS, e incorpora capacidades multimodales (visión) en algunas variantes. El checkpoint original de INSAIT fue entrenado o afinado específicamente para el idioma búlgaro, aunque no se dispone de detalles sobre el dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

Esta versión MLX es una conversión del checkpoint original realizada con `mlx_vlm.convert`, que aplica cuantización de 4 bits a los pesos. No se trata de un nuevo fine-tuning, sino de una adaptación de formato para ejecutarse eficientemente en Apple Silicon mediante la librería MLX. El convertidor reportó 5.475 bits por peso, lo que indica una cuantización mixta que optimiza la precisión y el rendimiento.

## Capacidades

- Generación de texto conversacional en búlgaro e inglés.
- Chat multi-turno verificado mediante `mlx-openai-server` con el handler de texto (`lm`).
- Soporte potencial de entrada multimodal (visión) gracias al tag `mlx-vlm`, aunque esta funcionalidad no ha sido validada en la conversión.
- Inferencia local en dispositivos Apple Silicon con memoria unificada.
- Compatible con la librería MLX y el ecosistema de herramientas asociado (MLX LM, MLX OpenAI Server).
- No se ha confirmado soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistentes conversacionales en búlgaro: el modelo puede gestionar diálogos multi-turno en búlgaro, lo que lo hace adecuado para chatbots de atención al cliente, asistentes personales o aplicaciones de mensajería dirigidas a hablantes de este idioma.
- Generación de texto en entornos locales: al ser una conversión MLX, se puede integrar en aplicaciones de escritorio o scripts que requieran generación de texto sin depender de servicios en la nube, aprovechando la privacidad y el bajo coste de ejecución en Mac.
- Traducción y transcripción búlgaro-inglés: aunque no se ha evaluado específicamente, el modelo bilingüe puede utilizarse para tareas de traducción informal o asistencia en la redacción de textos en ambos idiomas.
- Prototipado rápido en investigación: los investigadores que trabajan con procesamiento de lenguaje natural en búlgaro pueden usar este modelo como punto de partida para experimentos de fine-tuning o evaluación, gracias a su formato ligero y su disponibilidad en MLX.
- Despliegue en servidores locales con Apple Silicon: empresas o instituciones que utilicen Mac mini o Mac Studio como servidores pueden servir el modelo mediante `mlx-openai-server`, ofreciendo una API compatible con OpenAI para aplicaciones internas.
- Educación y demostraciones: el modelo puede emplearse en entornos educativos para ilustrar el funcionamiento de modelos de lenguaje cuantizados y su despliegue en hardware de consumo, dado su tamaño reducido y su facilidad de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria unificada estimada: el repositorio ocupa 3,4 GB, por lo que se recomienda un Mac con al menos 8 GB de RAM unificada para cargar el modelo y el overhead de ejecución. Con 16 GB se obtiene un margen más cómodo para aplicaciones concurrentes.
- GPU recomendadas: no aplica GPU dedicada; el modelo está diseñado para Apple Silicon (M1, M2, M3 o superiores) y utiliza la unidad Neural Engine y los núcleos de GPU integrados.
- Compatibilidad con consumer hardware: sí, cabe en cualquier Mac con chip Apple Silicon y suficiente memoria unificada.
- Opciones de despliegue: `mlx-openai-server` (verificado en la model card), MLX LM, y cualquier framework compatible con la librería MLX.
- Latencia y throughput: no se han proporcionado datos concretos; dependerá del modelo de chip y de la memoria disponible. En un M3 con 16 GB se espera un rendimiento fluido para inferencia interactiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BgGPT-Gemma-3-4B-IT-MLX-4bit (este) | 4B (base) / 1.13B (checkpoint cuantizado) | No disponible | MLX 4-bit | Gemma Terms | HuggingFace |
| INSAIT-Institute/BgGPT-Gemma-3-4B-IT (original) | 4B | No disponible | PyTorch | Gemma Terms | HuggingFace |
| Google Gemma-3-4B-IT | 4B | 128K (segun documentacion de Gemma 3) | PyTorch / JAX | Gemma Terms | HuggingFace |

La comparativa se limita a la versión original y al modelo base de Google, ya que no se dispone de información sobre otros modelos búlgaros comparables. La principal diferencia es el formato: esta conversión está optimizada para Apple Silicon, mientras que el original requiere entornos PyTorch tradicionales.

## Limitaciones y advertencias

- La conversión no ha sido validada en modo multimodal; solo se ha probado el chat de texto. El tag `mlx-vlm` sugiere que el modelo base podría soportar visión, pero no hay garantía de que esta funcionalidad funcione correctamente en esta versión.
- No se han publicado resultados de benchmarks ni evaluaciones de calidad en tareas específicas, por lo que el rendimiento real en producción es incierto.
- El modelo puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje, especialmente en dominios especializados o con información factual.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y de redistribución; es necesario revisar los términos completos de Google antes de desplegar el modelo en aplicaciones comerciales.
- Al ser una conversión no oficial, no hay garantía de mantenimiento ni soporte por parte del autor original.
- El número de parámetros reportado en la metadata de HuggingFace (1.131.301.232) difiere del tamaño nominal del modelo base (4B), lo que puede deberse a la cuantización o a un error en la metadata; se recomienda verificar el modelo antes de usarlo en entornos críticos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/flexi767/BgGPT-Gemma-3-4B-IT-MLX-4bit)
- [Modelo base original: INSAIT-Institute/BgGPT-Gemma-3-4B-IT](https://huggingface.co/INSAIT-Institute/BgGPT-Gemma-3-4B-IT)
- [Documentación de Gemma 3 (Google DeepMind)](https://deepmind.google/models/gemma/)
- [Blog sobre fine-tuning de Gemma-3-4B-IT con MLX_LM](https://blog.radi.pro/posts/fine-tuning-gemma-3-model-with-mlx)
