# fairy322/Sulphur-2-base-GGUF

## Resumen

Sulphur-2-base es un modelo de generación de texto a vídeo desarrollado por SulphurAI, del cual este repositorio ofrece una versión cuantizada en formato GGUF creada por fairy322. El modelo original cuenta con aproximadamente 21 000 millones de parámetros y utiliza una arquitectura de tipo `ltxv`, la misma empleada por la familia LTX-Video de Lightricks, especializada en síntesis de vídeo a partir de descripciones textuales.

La relevancia de esta publicación radica en que proporciona el modelo en formato GGUF, lo que permite ejecutarlo en entornos con recursos limitados mediante herramientas como llama.cpp, Ollama o similares, sin necesidad de disponer de la infraestructura de GPU profesional que exigiría el modelo en su formato original de precisión completa. Se ofrecen diez niveles de cuantización, desde BF16 (42 GB) hasta Q3_K_S (10,3 GB), para adaptarse a distintas capacidades de hardware.

La ficha se basa exclusivamente en la información disponible en la model card del repositorio. No se han publicado detalles sobre el entrenamiento, los datos utilizados, la licencia o los idiomas soportados, por lo que estos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ltxv (LTX-Video) |
| Parametros totales | 21 005 004 544 (~21B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_0, Q3_K_M, Q3_K_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura declarada es `ltxv`, que corresponde a la familia de modelos de generación de vídeo LTX-Video. Se trata de un modelo de difusión latente diseñado para sintetizar secuencias de vídeo a partir de prompts de texto, aunque no se dispone de detalles adicionales sobre la implementación concreta (número de capas, mecanismo de atención, etc.) en la información proporcionada.

El repositorio actual es una conversión a GGUF del modelo base `SulphurAI/Sulphur-2-base`. No se ha publicado información sobre el proceso de entrenamiento, el número de tokens de vídeo utilizados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifican innovaciones técnicas particulares más allá de la propia cuantización.

## Capacidades

- Generación de vídeo a partir de descripciones textuales (text-to-video), según el pipeline declarado.
- El formato GGUF permite su ejecución en entornos con recursos reducidos mediante herramientas de inferencia compatibles con este formato.
- No se dispone de información sobre capacidades adicionales como tool calling, razonamiento multi-paso, soporte de agentes o capacidades multilingües.

## Casos de uso

- Prototipado rápido de vídeos conceptuales: un equipo creativo puede generar clips de prueba a partir de guiones o descripciones para evaluar direcciones visuales antes de producir contenido final.
- Generación de material de formación y demostraciones: crear vídeos explicativos o animaciones sencillas a partir de texto para documentación técnica o presentaciones.
- Investigación en generación de vídeo: servir como modelo base para experimentos de fine-tuning o evaluación de técnicas de cuantización y su impacto en la calidad de salida.
- Desarrollo de aplicaciones de vídeo generativo en entornos con GPU limitada: gracias a las cuantizaciones Q4 o Q3, es posible ejecutar el modelo en tarjetas de consumo con 12-16 GB de VRAM.
- Automatización de contenido para redes sociales: generar clips cortos a partir de prompts para campañas o publicaciones, reduciendo costes de producción.
- Evaluación comparativa de cuantizaciones: los diez niveles ofrecidos permiten estudiar la relación entre tamaño del modelo, velocidad de inferencia y calidad visual resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas objetivas como FVD, CLIP score o comparativas con otros modelos de generación de vídeo.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - BF16: ~42 GB (requiere GPU profesional como A100, H100 o similar)
  - Q8_0: ~22,8 GB (GPU de gama alta con 24 GB, p. ej. RTX 4090)
  - Q6_K: ~17,8 GB (GPU con 20-24 GB)
  - Q5_K_M: ~16,1 GB (GPU con 16-20 GB)
  - Q4_K_M: ~14,3 GB (GPU con 16 GB, p. ej. RTX 4080 o RTX 3090)
  - Q3_K_M: ~11,1 GB (GPU con 12-16 GB, p. ej. RTX 3060 o RTX 4070)
- El modelo cabe en GPUs de consumo a partir de la cuantización Q5_K_S (15 GB) o inferiores, siempre que se disponga de al menos 12 GB de VRAM.
- Opciones de despliegue: herramientas compatibles con GGUF como llama.cpp, Ollama, LM Studio o servidores de inferencia que soporten este formato.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de generación de vídeo de tamaño similar (p. ej. LTX-Video, CogVideoX, Mochi 1). Los datos de rendimiento, licencia y capacidades del modelo original no están publicados, por lo que no es posible realizar una comparación objetiva.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, por lo que no se puede garantizar su uso comercial sin riesgo legal.
- Al ser una cuantización, se produce una pérdida de calidad respecto al modelo original, especialmente en los niveles Q3 y Q4_0.
- No se dispone de información sobre sesgos, riesgos de alucinación visual o limitaciones de contexto temporal (número máximo de frames generables).
- El pipeline declarado es text-to-video, pero no se especifican los idiomas soportados para los prompts.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco validada por la comunidad.
- No se han publicado benchmarks ni evaluaciones de calidad, por lo que el rendimiento real del modelo es desconocido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/fairy322/Sulphur-2-base-GGUF
- Modelo base: https://huggingface.co/SulphurAI/Sulphur-2-base
