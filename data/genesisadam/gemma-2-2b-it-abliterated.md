# GENESISADAM/gemma-2-2b-it-abliterated

## Resumen

`GENESISADAM/gemma-2-2b-it-abliterated` es una versión "abliterated" del modelo instructivo `google/gemma-2-2b-it` de Google DeepMind. La "abliteración" es una técnica de edición de pesos que elimina selectivamente la dirección de activación asociada al rechazo de contenido, de modo que el modelo deja de negarse a responder a peticiones que el modelo original rechazaría. El autor declara aplicar la misma metodología que `IlyaGusev/gemma-2-9b-it-abliterated`, identificando la dirección de rechazo en la capa 15 (`resid_mid`, candidato n.º 19, posición -1).

El modelo conserva la arquitectura y el tamaño del Gemma 2 2B original: 2.614.341.888 parámetros reales según los tensores safetensors publicados, pesos en formato safetensors y una licencia Gemma que restringe el uso comercial. El repositorio ocupa 5,3 GB y solo declara inglés como idioma soportado.

Su relevancia es acotada: se trata de un experimento de investigación sobre alineación y edición de modelos, con 19 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni benchmarks publicados. No es un modelo recomendable para producción, sino un caso de estudio sobre cómo la eliminación de la dirección de rechazo afecta al comportamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), derivada de google/gemma-2-2b-it |
| Parametros totales | 2.614.341.888 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Gemma (licencia de Google con restricciones de uso) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-2b-it`, un transformer decoder-only denso de aproximadamente 2.600 millones de parámetros. La model card no aporta detalles adicionales sobre la arquitectura interna, el número de tokens de entrenamiento ni la composición del dataset; esa información corresponde al modelo base de Google y no se reproduce aquí.

La modificación respecto al original es la abliteración: se localiza una dirección de activación en el espacio residual intermedio (capa 15, `resid_mid`, candidato n.º 19, posición -1) que correlaciona con el comportamiento de rechazo, y se proyectan los pesos para eliminarla. Según el autor, se sigue la misma metodología que en `IlyaGusev/gemma-2-9b-it-abliterated`. No se documentan etapas de RLHF, DPO ni fine-tuning adicional tras la edición. Los ejemplos de la model card se generaron con vLLM, con FlashAttention 2 desactivado y FlashInfer activado.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo original.
- Respuesta a peticiones que el modelo base rechazaría, como consecuencia directa de la abliteración.
- Razonamiento básico y respuesta a instrucciones propias de un modelo de 2B parámetros.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: estudiar cómo la proyección de la dirección de rechazo altera la distribución de respuestas y qué mecanismos internos sostienen el comportamiento de negativa.
- Evaluación de robustez de filtros: comprobar si los clasificadores de contenido de una plataforma detectan las respuestas de un modelo abliterated y calibrar sus umbrales.
- Experimentos académicos de edición de pesos: replicar la metodología de abliteración en modelos pequeños para comparar resultados entre capas y direcciones candidatas.
- Generación de datos adversarios controlados: producir pares pregunta-respuesta para entrenar clasificadores de seguridad en un entorno de laboratorio aislado.
- Pruebas de regresión de pipelines de inferencia: validar el comportamiento de vLLM con FlashInfer y sin FlashAttention 2 en un modelo denso de 2B, como en la configuración usada por el autor.
- Docencia sobre licencias de modelos: analizar las obligaciones de la licencia Gemma en un derivado modificado y las implicaciones de redistribuir pesos editados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 5,2 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, entre 6 y 8 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,6-3 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1,5-2 GB de pesos (requiere convertir los safetensors a GGUF u otro formato, ya que el repo solo publica safetensors).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070) para fp16; A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en fp16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: vLLM (configuración usada por el autor, con FlashInfer y sin FlashAttention 2), llama.cpp u Ollama tras conversión a GGUF, TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| GENESISADAM/gemma-2-2b-it-abliterated | 2.614.341.888 | No disponible | Gemma | 19 descargas, 0 likes |
| google/gemma-2-2b-it | No disponible en la informacion | No disponible en la informacion | Gemma | Modelo base oficial |
| IlyaGusev/gemma-2-9b-it-abliterated | No disponible en la informacion | No disponible en la informacion | Gemma | Metodología de referencia citada por el autor |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo de forma deliberada; el modelo puede generar contenido dañino, ilegal o explícitamente prohibido, como ilustran los ejemplos de la model card.
- Riesgo elevado de alucinación y de respuestas plausibles pero incorrectas, agravado por el tamaño reducido (2B) del modelo base.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- La licencia Gemma impone restricciones de uso, incluida la comercial; es necesario revisar sus términos antes de cualquier despliegue.
- No hay benchmarks, pipeline declarado ni documentación de cuantizaciones publicadas; la reproducibilidad es limitada.
- El modelo no debe usarse en producción ni en aplicaciones orientadas al usuario sin filtros externos de contenido.
- La model card incluye ejemplos de contenido extremadamente sensible; su presencia no constituye una validación técnica del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/GENESISADAM/gemma-2-2b-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Referencia de metodología: https://huggingface.co/IlyaGusev/gemma-2-9b-it-abliterated
- Blog sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- Script de inferencia con vLLM citado por el autor: https://github.com/IlyaGusev/saiga/blob/main/src/infer_vllm.py
