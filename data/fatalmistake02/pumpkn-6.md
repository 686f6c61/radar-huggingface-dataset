# FatalMistake02/pumpkn-6

## Resumen

pumpkn-6 es un modelo de generación de texto de 124,28 millones de parámetros desarrollado por el usuario FatalMistake02 y publicado en Hugging Face bajo licencia CC BY-SA 4.0. Se trata de un experimento de entrenamiento temprano, entrenado desde cero ("from-scratch"), cuyo propio autor describe en la model card como "absolute garbage" y advierte que deben esperarse respuestas incorrectas y sinsentidos. No es un modelo destinado a producción ni a evaluación comparativa seria, sino un artefacto de investigación sobre el proceso de entrenamiento de modelos pequeños.

El modelo emplea una ventana de contexto de 2.048 tokens y se distribuye en formato GGUF en precisión F16, lo que sugiere que está pensado para ejecutarse con llama.cpp u otras herramientas compatibles con dicho formato. Su tamaño de repositorio es de aproximadamente 0,2 GB, coherente con los 124 millones de parámetros en F16.

Por su escala y su carácter experimental, pumpkn-6 se sitúa en la categoría de modelos pequeños tipo GPT-2 o variantes de menos de 200 millones de parámetros. Su relevancia es limitada fuera del ámbito de la experimentación con entrenamiento desde cero; no hay información pública sobre arquitectura detallada, composición del dataset ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer de generación de texto, inferido del pipeline; detalles no publicados) |
| Parámetros totales | 124.278.528 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | F16 (GGUF); no se documentan otras |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (según tags y model card); repo de 0,2 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Los tags indican que se entrenó desde cero ("from-scratch") y que es un experimento temprano de entrenamiento. El pipeline declarado es text-generation y el tamaño de parámetros (124,28 M) es compatible con un transformer decoder-only de escala pequeña, pero no se confirma la arquitectura exacta, el número de capas, las dimensiones ocultas ni el mecanismo de atención.

Tampoco se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de ajuste (SFT, RLHF, DPO) ni innovaciones técnicas. La model card remite a un archivo ATTRIBUTION.md para los créditos del dataset, pero no se incluye su contenido en la información disponible. El propio autor califica el resultado como basura y advierte de respuestas erróneas, lo que indica que el entrenamiento no alcanzó un estado de convergencia útil.

## Capacidades

- Generación de texto conversacional básica, según el tag "conversational" y el pipeline text-generation.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que permite desplegarlo mediante la infraestructura de inferencia de Hugging Face.
- Soporte únicamente del idioma inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- El propio autor advierte que el modelo produce respuestas incorrectas y sinsentidos, por lo que sus capacidades prácticas son mínimas.

## Casos de uso

- Experimentación educativa sobre entrenamiento desde cero: sirve como ejemplo de un modelo pequeño entrenado por un particular, útil para estudiar el proceso y los resultados de un entrenamiento temprano.
- Pruebas de pipelines de inferencia GGUF: al ser un GGUF F16 de 0,2 GB, permite validar la carga y ejecución en llama.cpp u otras herramientas compatibles con un coste mínimo de recursos.
- Evaluación de infraestructura de despliegue: su compatibilidad con endpoints permite probar integraciones de serving sin consumir GPU de gama alta.
- Reproducción de experimentos de investigación: puede utilizarse como punto de partida o referencia en estudios sobre modelos de ~100 M de parámetros.
- Pruebas de robustez de sistemas de filtrado: dado que genera texto incoherente, resulta útil para comprobar cómo responden los sistemas de moderación ante salidas de baja calidad.
- Docencia sobre limitaciones de modelos pequeños: ejemplifica de forma directa por qué la escala y la calidad del entrenamiento condicionan la utilidad de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,25 GB en F16 (124,28 M de parámetros × 2 bytes), más el overhead del runtime y de la caché KV para 2.048 tokens.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o menos de VRAM, e incluso puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) y en la mayoría de iGPU y CPU.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; también es compatible con endpoints de Hugging Face según el tag correspondiente.
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera una latencia muy baja en hardware consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| pumpkn-6 | 124,28 M | 2.048 | en | CC BY-SA 4.0 | GGUF | Experimental, calidad no garantizada |
| GPT-2 small | 124 M | 1.024 | en | MIT | safetensors, GGUF (comunidad) | Modelo de referencia de escala similar, ampliamente validado |
| GPT-2 medium | 355 M | 1.024 | en | MIT | safetensors, GGUF (comunidad) | Mayor escala, misma familia |
| Modelos de ~100-150 M de la comunidad | variable | variable | variable | variable | variable | Calidad y soporte muy dispares; no disponible una comparación directa fiable |

La comparación con GPT-2 small es la más pertinente por escala y contexto, aunque pumpkn-6 no ofrece datos de rendimiento que permitan una comparación cuantitativa. No se dispone de información sobre otros modelos directamente comparables publicados por el mismo autor.

## Limitaciones y advertencias

- Calidad muy baja: el autor describe el modelo como "absolute garbage" y advierte de respuestas incorrectas y sinsentidos; no debe usarse en producción.
- Riesgo elevado de alucinación y de salidas incoherentes, derivado de un entrenamiento temprano no convergido.
- Contexto limitado a 2.048 tokens, insuficiente para tareas que requieran documentos largos o conversaciones extensas.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia (copyleft), lo que puede condicionar su integración en productos propietarios.
- No hay información sobre sesgos, composición del dataset ni evaluación de seguridad; se desconoce el contenido con el que se entrenó.
- No se documentan procesos de alineación (RLHF, DPO) ni filtrado de seguridad.
- El repositorio tiene 0 descargas y 0 likes, lo que refleja una adopción nula y ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/FatalMistake02/pumpkn-6
- Créditos del dataset: https://huggingface.co/FatalMistake02/pumpkn-6/blob/main/ATTRIBUTION.md (referenciado en la model card; contenido no disponible)
