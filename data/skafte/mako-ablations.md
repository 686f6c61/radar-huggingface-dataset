# skafte/mako-ablations

## Resumen

Mako-ablations es un repositorio de ficheros de direcciones de rechazo (refusal directions) para la herramienta mako, desarrollado por el usuario skafte. No se trata de un modelo de lenguaje en sentido estricto, sino de un conjunto de artefactos binarios en formato propietario `MAKOABL1` que permiten aplicar abliteration en tiempo de ejecución sobre dos modelos base: GLM-5.3-Flash de zai-org y DeepSeek-V4.1-Flash-1017. La abliteration consiste en eliminar del cálculo las proyecciones de activación asociadas a comportamientos de rechazo, de modo que el modelo deja de negarse a responder a ciertas peticiones sin necesidad de reentrenar ni modificar los pesos originales.

La relevancia de este repositorio es metodológica: separa los vectores de abliteration del modelo en sí, de forma que el mismo fichero GGUF puede servirse con o sin ablación según el flag `--ablate` de `mako_serve`. Esto facilita la experimentación reproducible y evita duplicar checkpoints de gran tamaño. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los ficheros `.abl` son extremadamente pequeños en comparación con los pesos de los modelos a los que se aplican.

No se dispone de información sobre arquitectura, número de parámetros ni longitud de contexto de los modelos base en la documentación proporcionada; esta ficha se limita a describir lo que el repositorio declara explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene vectores de ablación, no un modelo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los ficheros `.abl` son vectores float32, no pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.abl` (formato binario propietario `MAKOABL1`); los modelos base se sirven en GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Contiene direcciones de rechazo extraídas de modelos abliterados de terceros y reempaquetadas en el formato de mako. Para GLM-5.3-Flash se incluyen 3 direcciones por capa en 45 capas, aplicadas en los sitios `ffn_out` y `stream`; el vector procede de `alesha-pro/GLM-5.3-Flash-abliterated-Maya-M-GGUF` y está pensado para los GGUF Maya de peasantsmith. Para DeepSeek-V4.1-Flash-1017 se incluyen 2 direcciones por capa en 40 capas, aplicadas en `attn_out` y `shexp_out`; las direcciones provienen de `mrfakename/DeepSeek-V4.1-Flash-1017-abliterated` y están pensadas para los GGUF Maya y para los GGUF GSQ-RCO de ISTA-DASLab.

La innovación técnica es el mecanismo de aplicación en tiempo de ejecución: mako sustrae la componente proyectada sobre cada dirección de rechazo en las filas seleccionadas del cómputo (`x -= scale (x · v) v` por dirección), sin tocar los ficheros del modelo. El formato `MAKOABL1` consta de un magic de 4 bytes, cuatro enteros uint32 little-endian (ancho de embedding, capas, sitios y número de direcciones k), los nombres de los sitios (16 bytes cada uno, rellenados con ceros) y los vectores float32 con disposición `[layer][site][k][width]`. Solo la herramienta mako puede leerlo.

## Capacidades

- Aplicación de abliteration en tiempo de ejecución sobre modelos GLM-5.3-Flash y DeepSeek-V4.1-Flash-1017 servidos en GGUF.
- Control de intensidad mediante `--ablate-scale`, que multiplica la norma de los vectores (por defecto 1).
- Descarga automática del fichero de ablación correcto junto con el modelo mediante `mako-download <model> --ablate`.
- Separación entre pesos del modelo y vectores de ablación, lo que permite alternar entre comportamiento original y ablacionado sin duplicar checkpoints.
- No proporciona por sí mismo generación de texto, razonamiento, código, visión, tool calling ni capacidades multilingües: esas capacidades dependen exclusivamente del modelo base sobre el que se aplique.
- No se declaran capacidades de agentes, multi-step reasoning ni modos especiales en la documentación disponible.

## Casos de uso

- Investigación en seguridad y alineación: comparar el comportamiento de un mismo GGUF con y sin ablación para estudiar qué direcciones de activación codifican el rechazo, usando `--ablate` y `--ablate-scale` como variables de control.
- Evaluación de robustez de salvaguardas: medir la tasa de rechazo antes y después de aplicar `refusal.abl` en GLM-5.3-Flash o DeepSeek-V4.1-Flash-1017 para caracterizar la fragilidad de los filtros aprendidos.
- Despliegue de modelos sin capa de rechazo en entornos de investigación controlados: servir el GGUF Maya o GSQ-RCO con la ablación activada cuando el caso de uso requiere respuestas sin negativas por defecto.
- Reproducibilidad de experimentos de abliteration: al estar los vectores en un fichero versionado y ligero, se puede fijar la versión exacta de las direcciones usadas en un paper o informe.
- Ahorro de almacenamiento en pipelines de evaluación: en lugar de mantener dos checkpoints (original y abliterado), se mantiene un único GGUF y se alterna el flag de ablación.
- Integración en flujos de mako: usar `mako-download <model> --ablate` para aprovisionar automáticamente modelo y vectores en entornos de CI o servidores de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio en sí ocupa 0.0 GB; los requisitos vienen determinados por el modelo base GGUF que se sirva.
- VRAM estimada para inferencia: no disponible (depende del tamaño y cuantización del GGUF de GLM-5.3-Flash o DeepSeek-V4.1-Flash-1017).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `mako_serve` es el único servidor documentado para aplicar estos ficheros; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la ablación añade una operación de proyección y resta por dirección y capa, pero no se cuantifica su coste.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo, sino un conjunto de vectores de ablación; los elementos comparables serían otros repositorios de direcciones de rechazo o checkpoints abliterados completos (por ejemplo, `alesha-pro/GLM-5.3-Flash-abliterated-Maya-M-GGUF` o `mrfakename/DeepSeek-V4.1-Flash-1017-abliterated`), pero no se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo utilizable por sí solo: sin un GGUF compatible de GLM-5.3-Flash o DeepSeek-V4.1-Flash-1017 y la herramienta mako, los ficheros `.abl` no sirven para nada.
- El formato `MAKOABL1` es propietario y solo lo lee mako; no hay interoperabilidad declarada con otras herramientas de inferencia.
- La ablación elimina direcciones de rechazo, lo que puede degradar salvaguardas de seguridad y aumentar la probabilidad de respuestas dañinas, sesgadas o no alineadas; debe tratarse como material de investigación.
- No se documentan sesgos específicos, tasas de alucinación ni evaluación de calidad tras la ablación.
- Compatibilidad restringida: las direcciones de GLM-5.3-Flash están pensadas para los GGUF Maya, y las de DeepSeek-V4.1-Flash-1017 para los GGUF Maya y GSQ-RCO; aplicarlas a otras cuantizaciones o variantes puede no ser válido.
- Licencia MIT para los ficheros de ablación, pero el uso comercial queda sujeto además a la licencia de los modelos base correspondientes, que no se detalla en la información disponible.
- No se declaran idiomas soportados ni limitaciones de contexto; dependen enteramente del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/skafte/mako-ablations
- Herramienta mako: https://github.com/jhanssen/mako
- GGUF Maya de GLM-5.3-Flash: https://huggingface.co/peasantsmith/GLM-5.3-Flash-Maya-GGUF
- GGUF Maya de DeepSeek-V4.1-Flash-1017: https://huggingface.co/peasantsmith/DeepSeek-V4.1-Flash-1017-Maya-GGUF
- GGUF GSQ-RCO de DeepSeek-V4.1-Flash-1017: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo abliterado de GLM-5.3-Flash (origen de los vectores): https://huggingface.co/alesha-pro/GLM-5.3-Flash-abliterated-Maya-M-GGUF
- Modelo abliterado de DeepSeek-V4.1-Flash-1017 (origen de los vectores): https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated
