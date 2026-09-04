# DreamFoundries/K2-Horizon-MoVA-36B-A4B-MLX-6bit

## Resumen

El modelo `DreamFoundries/K2-Horizon-MoVA-36B-A4B-MLX-6bit` es una conversión MLX (formato específico para Apple Silicon) del modelo original `IFM/K2-Horizon-MoVA-36B-A4B`, desarrollado por el Institute of Foundation Models (IFM). Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con atención Mixture-of-Values (MoVA), que almacena 36 000 millones de parámetros totales pero solo activa 4 000 millones por token. Esto lo convierte en un modelo "escaso" (sparse), eficiente en cómputo y adecuado para tareas de razonamiento y agénticas.

La conversión fue realizada por DreamFoundries para MLXHub, usando su fork de `mlx-lm` en el commit `0f74c0e`. Aplica cuantización affine de 6 bits con grupo de tamaño 64, dejando sin cuantizar los routers K2 (`mlp.gate` y `self_attn.v_router`). Según Benchgen, el modelo original dispone de una ventana de contexto nativa de 512 000 tokens, lo que permite procesar documentos extensos sin truncamiento. La licencia es Apache-2.0 y el modelo está en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) y atención Mixture-of-Values (MoVA) |
| Parametros totales | 36 000 millones (36B) |
| Parametros activos | 4 000 millones (4B) |
| Longitud de contexto | 512 000 tokens (512K) |
| Tipos de cuantizacion | 6-bit affine, group size 64 (MLX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo original es un MoE con atención Mixture-of-Values (MoVA). Según la información disponible, el modelo es el miembro "escaso" de la familia K2-Horizon: almacena 36 000 millones de parámetros, pero solo 4 000 millones se activan por token. La atención MoVA introduce una innovación en el mecanismo de atención, aunque el detalle técnico completo no está disponible en la información proporcionada.

El modelo ha sido cuantizado por DreamFoundries a 6 bits en formato MLX, con un esquema affine y tamaño de grupo 64. Los routers K2 (`mlp.gate` y `self_attn.v_router`) permanecen sin cuantizar, según la implementación del modelo original. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni sobre procesos de ajuste como RLHF o DPO. Tampoco se ha publicado información sobre el procedimiento de entrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, con soporte para diálogos largos gracias a la ventana de contexto de 512 000 tokens.
- Razonamiento y capacidades agénticas destacadas, según Benchgen, que indica que el modelo original supera a modelos densos y MoE de peso abierto hasta 15 veces su tamaño de parámetros activos en benchmarks de razonamiento y agentes.
- Ejecución eficiente en Apple Silicon mediante el framework MLX, con solo 4 000 millones de parámetros activos por token, lo que reduce el coste computacional de inferencia.
- Soporte de carga y generación directa con la API de `mlx_lm` (`load` y `generate`), así como integración con MLXHub.
- Cuantización a 6 bits con routers K2 preservados en alta precisión, lo que puede mantener la calidad en las rutas de decisión del MoE.
- Compatibilidad con el pipeline de `text-generation` de HuggingFace.

## Casos de uso

- Análisis de documentos extensos: la ventana de contexto de 512 000 tokens permite procesar contratos legales, informes técnicos o manuales completos en una sola pasada, sin necesidad de dividir el texto en fragmentos.
- Agentes autónomos en inglés: sus capacidades agénticas, señaladas por Benchgen, lo hacen adecuado para integrarse en frameworks de agentes que requieren razonamiento multi-paso y planificación sobre entornos complejos.
- Asistentes conversacionales en Apple Silicon: al ser una conversión MLX, puede ejecutarse localmente en Mac con memoria unificada, ofreciendo un asistente de chat privado sin dependencia de servicios en la nube.
- Extracción de información y resumen de corpus: el modelo puede resumir y extraer datos de grandes volúmenes de texto (por ejemplo, bases de conocimiento o archivos de soporte) manteniendo el contexto completo.
- Generación de código y análisis de repositorios: aunque no hay benchmarks específicos de código en la información disponible, la combinación de contexto largo y razonamiento permite trabajar con archivos de proyecto completos o documentación técnica extensa.
- Investigación académica y prototipado: al estar publicado bajo Apache-2.0, es adecuado para proyectos de investigación que necesiten un modelo de gran capacidad con licencia permisiva, especialmente en entornos con hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta conversión. La model card del repositorio indica explícitamente que no hay comparativas de calidad y rendimiento disponibles para la conversión MLX. Los datos de rendimiento del modelo original, como los mencionados en Benchgen, corresponden a `IFM/K2-Horizon-MoVA-36B-A4B` y no se aplican directamente a la versión cuantizada en 6 bits.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al tratarse de una cuantización 6-bit de un modelo de 36B con 4B activos, se requeriría memoria unificada suficiente para los pesos y el estado de la atención; se recomienda al menos 32-64 GB de RAM en un Mac para un uso razonable.
- GPU recomendadas: no aplicable a GPU NVIDIA; el modelo está diseñado para ejecutarse en Apple Silicon mediante MLX.
- Compatibilidad con GPU de consumo: no disponible; el formato MLX no es compatible con CUDA o ROCm.
- Opciones de despliegue: `mlx_lm` en Python (carga con `load` y generación con `generate`), y MLXHub para integración en aplicaciones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría. La model card solo indica que la conversión fue creada para MLXHub y que no hay benchmarks comparativos para esta versión cuantizada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no hay datos específicos; se debe aplicar evaluación adicional en entornos de producción.
- Limitaciones de idioma: el modelo está etiquetado exclusivamente en inglés (`en`), por lo que su rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial y redistribución, siempre que se respeten los términos de la licencia y se conserve el aviso de copyright.
- La conversión a 6 bits puede degradar la calidad de las respuestas en comparación con el modelo original sin cuantizar; los benchmarks del modelo base no son válidos para esta versión.
- Los routers K2 no están cuantizados, lo que puede aumentar ligeramente el uso de memoria y cómputo respecto a una cuantización completa, pero también puede preservar la calidad del enrutamiento.
- No se han publicado métricas de rendimiento, latencia ni calidad para esta conversión concreta.

## Enlaces

- Repositorio de HuggingFace de la conversión: https://huggingface.co/DreamFoundries/K2-Horizon-MoVA-36B-A4B-MLX-6bit
- Modelo original en HuggingFace: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- MLXHub: https://mlxhub.app/open-model?repo=DreamFoundries/K2-Horizon-MoVA-36B-A4B-MLX-6bit
- Página de Benchgen con información del modelo original: https://benchgen.com/models/ifm/k2-horizon-mova-36b-a4b
