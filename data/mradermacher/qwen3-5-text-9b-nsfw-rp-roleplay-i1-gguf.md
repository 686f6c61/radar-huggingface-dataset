# mradermacher/Qwen3.5-text-9B-NSFW-RP-RolePlay-i1-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF en formato i1 (con matriz de importancia, imatrix) del modelo `DGDGDG12/Qwen3.5-text-9B-NSFW-RP-RolePlay`, preparadas por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos open source. El modelo base es un ajuste fino orientado a roleplay y contenido NSFW (no apto para todos los públicos), basado en la arquitectura Qwen 3.5 de 9 mil millones de parámetros, aunque no se proporcionan detalles técnicos adicionales sobre su construcción.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 9B en hardware modesto gracias a la cuantización, manteniendo un equilibrio entre tamaño y calidad. El repositorio incluye un archivo de imatrix para generar cuantizaciones personalizadas y al menos una cuantización i1-Q2_K de 3,9 GB, aunque la model card sugiere que hay más variantes disponibles. El modelo está pensado para uso conversacional y generación de texto con temática adulta, y su licencia no está especificada, lo que limita su uso comercial sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, sin especificar variante exacta) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (3,9 GB) y otras cuantizaciones i1 (imatrix) listadas en la model card: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (número de capas, cabezas de atención, etc.). Por el nombre, se infiere que pertenece a la familia Qwen 3.5, pero no se confirma si se trata de un transformer denso convencional o si incorpora innovaciones como atención lineal o mezcla de expertos. El modelo base `DGDGDG12/Qwen3.5-text-9B-NSFW-RP-RolePlay` es un ajuste fino orientado a roleplay y contenido NSFW, pero no se especifican los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La cuantización i1 realizada por mradermacher utiliza matrices de importancia (imatrix) para mejorar la calidad de los pesos cuantizados, un método que optimiza la asignación de bits según la importancia de cada tensor.

## Capacidades

- Generación de texto conversacional para roleplay interactivo, con énfasis en escenarios de temática adulta (NSFW).
- Soporte de diálogos multi-turno, aunque no se especifica la longitud máxima de contexto.
- No se indica soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (según la etiqueta `language: en`).
- No se mencionan capacidades de visión, audio u otras modalidades.

## Casos de uso

- Roleplay textual interactivo: el modelo puede mantener conversaciones con personajes ficticios en escenarios de fantasía o adultos, gracias a su ajuste específico para roleplay. Se usaría con interfaces como SillyTavern o frontends compatibles con GGUF.
- Escritura creativa de ficción adulta: puede asistir en la redacción de relatos eróticos o novelas interactivas, generando descripciones y diálogos coherentes con el tono solicitado.
- Simulación de personajes en juegos de rol: integrable en motores de juego de texto o chatbots para crear personajes con personalidades definidas, aunque su contenido NSFW limita su uso a entornos privados.
- Generación de diálogos para prototipos de entretenimiento: útil para desarrolladores que necesitan un modelo ligero para probar interacciones conversacionales con contenido explícito en entornos de desarrollo.
- Experimentación con cuantización imatrix: el repositorio incluye un archivo de imatrix que permite a los usuarios generar sus propias cuantizaciones, lo que resulta útil para investigar el impacto de diferentes niveles de compresión en la calidad del modelo.
- Despliegue en entornos con recursos limitados: gracias a la cuantización Q2_K de 3,9 GB, puede ejecutarse en GPUs de gama media o incluso en CPU con suficiente RAM, lo que facilita pruebas locales sin infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o su versión base.

## Requisitos de hardware

- La cuantización i1-Q2_K ocupa 3,9 GB, por lo que se puede ejecutar en GPUs con al menos 6 GB de VRAM (considerando overhead de contexto y runtime). Ejemplos: NVIDIA RTX 3060, RTX 4060, GTX 1080 Ti.
- Para cuantizaciones más grandes (Q4, Q5, Q6), se necesitaría entre 5 y 8 GB de VRAM adicionales, recomendándose GPUs como RTX 3090, RTX 4090 o A100 para las variantes de mayor precisión.
- Al ser formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros runners que soporten este formato. También se puede usar con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- La latencia y el throughput dependen del hardware y de la cuantización elegida; no se proporcionan datos específicos. En una GPU moderna, un modelo de 9B cuantizado a Q2_K puede generar entre 20 y 40 tokens por segundo, pero esto es una estimación general y no un dato oficial.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (tamaño 9B, roleplay NSFW). No se han encontrado datos de rendimiento ni especificaciones de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar contenido NSFW y de roleplay adulto, lo que puede resultar inapropiado en entornos profesionales o públicos. No debe utilizarse en aplicaciones dirigidas a menores o sin control de acceso.
- Sesgos y alucinaciones: al ser un ajuste fino sin información sobre su entrenamiento, es probable que presente sesgos de género, raza o cultura, y puede alucinar hechos o detalles en conversaciones largas.
- Licencia no especificada: la ausencia de licencia clara impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con el creador del modelo base antes de cualquier despliegue en producción.
- Calidad de cuantización: las cuantizaciones de baja precisión (como Q2_K) pueden degradar la coherencia y el vocabulario del modelo, especialmente en tareas que requieren matices lingüísticos.
- Contexto limitado: no se conoce la longitud máxima de contexto, lo que puede provocar pérdida de información en conversaciones muy largas.
- Idioma: solo se garantiza soporte en inglés; el uso en otros idiomas puede producir resultados inconsistentes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mradermacher/Qwen3.5-text-9B-NSFW-RP-RolePlay-i1-GGUF
- Modelo base: https://huggingface.co/DGDGDG12/Qwen3.5-text-9B-NSFW-RP-RolePlay
- Versión estática de cuantizaciones: https://huggingface.co/mradermacher/Qwen3.5-text-9B-NSFW-RP-RolePlay-GGUF
- Página de mradermacher para solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
