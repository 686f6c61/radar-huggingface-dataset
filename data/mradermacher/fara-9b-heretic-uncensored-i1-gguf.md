# mradermacher/fara-9b-heretic-uncensored-i1-GGUF

## Resumen

fara-9b-heretic-uncensored-i1-GGUF es la versión cuantizada en formato GGUF del modelo lmcfarlin/fara-9b-heretic-uncensored, un modelo vision-language de aproximadamente 8.950 millones de parámetros orientado a tareas de computer-use y automatización de navegador. La cuantización la ha realizado mradermacher, un autor habitual en la publicación de versiones GGUF con calibración imatrix para despliegue local.

El modelo deriva de la familia Fara (orientada a agentes web y uso de ordenador) y ha sido sometido a un proceso de "abliteration" o decensurado, lo que elimina parte de las restricciones de rechazo del modelo original. Esto lo hace relevante para entornos de investigación donde se necesita evaluar el comportamiento de agentes sin filtros de seguridad conversacionales, aunque con las advertencias éticas y de producción que se detallan más abajo.

La versión que nos ocupa ofrece un abanico amplio de cuantizaciones (desde IQ1_S de 3,0 GB hasta Q6_K de 7,5 GB), lo que permite desplegarlo en hardware de consumo. El repositorio tiene un tamaño total de 111,7 GB porque incluye todas las variantes. La licencia es MIT y el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer vision-language (detalles no disponibles) |
| Parámetros totales | 8.953.803.264 (≈8,95 B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Por los tags y la naturaleza del modelo base (fara-9b-heretic-uncensored), se trata de un transformer multimodal con capacidad de visión (vision-language), diseñado específicamente para tareas de computer-use y automatización de navegador. El tamaño de 8,95 B de parámetros es coherente con un modelo denso de escala 9B.

El proceso de "heretic/uncensored/abliterated" indica que el modelo base ha sido modificado mediante técnicas de abliteration para reducir los rechazos ante peticiones que el modelo original declinaría. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La cuantización i1 (imatrix) realizada por mradermacher utiliza un fichero imatrix propio para calibrar los pesos durante la cuantización, lo que habitualmente mejora la calidad frente a cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes (vision-language) para interpretar capturas de pantalla e interfaces.
- Computer-use (CUA): interacción con interfaces gráficas mediante acciones.
- Automatización de navegador (browser-automation) y agentes web.
- Soporte declarado de agentes (tag "agent", "magentic").
- Compatible con endpoints (tag "endpoints_compatible").
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones sensibles.
- Capacidades de razonamiento multi-paso para tareas de agente (inferido de los tags, sin datos de benchmark).
- Soporte de tool calling / function calling: no confirmado en la información disponible.

## Casos de uso

- Automatización de navegador: el modelo puede actuar como agente web interpretando el DOM y capturas de pantalla para completar formularios, navegar y extraer datos, gracias a su naturaleza vision-language y a los tags de browser-automation.
- Agentes de computer-use en escritorio: control de aplicaciones mediante interpretación visual de la pantalla, adecuado para tareas de RPA (automatización robótica de procesos) en entornos controlados.
- Investigación en seguridad de agentes: al ser un modelo decensurado, permite estudiar el comportamiento de agentes sin filtros conversacionales, útil para análisis de robustez y alineación.
- Testing de interfaces web: un agente basado en este modelo puede recorrer flujos de usuario de forma autónoma para detectar roturas en entornos de staging.
- Extracción de datos de interfaces: lectura de pantallas y documentos visuales para estructurar información en pipelines de scraping asistido.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones desde 3,0 GB, puede ejecutarse en portátiles con GPU modesta para prototipado de agentes sin depender de la nube.
- Evaluación comparativa de cuantizaciones: el amplio abanico de quants permite medir el impacto de la compresión en tareas de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - IQ1_S (3,0 GB) e IQ1_M (3,1 GB): ~3-4 GB de VRAM.
  - IQ2_XXS a IQ2_M (3,3-3,8 GB): ~4-5 GB.
  - Q3_K_S a Q3_K_L (4,4-5,1 GB): ~5-6 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M (5,4-5,8 GB): ~6-7 GB.
  - Q5_K_S / Q5_K_M (6,4-6,6 GB): ~7-8 GB.
  - Q6_K (7,5 GB): ~8-9 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 para el modelo completo en precisión superior.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB (o incluso GPUs de 8 GB con cuantizaciones IQ2/IQ3) hasta RTX 4090 en Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Los ficheros mmproj (necesarios para la parte de visión) están en el repositorio estático: mradermacher/fara-9b-heretic-uncensored-GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fara-9b-heretic-uncensored (i1-GGUF) | 8,95 B | no disponible | MIT | GGUF | Vision-language, computer-use, decensurado |
| fara-9b-heretic-uncensored (base) | 8,95 B | no disponible | MIT | safetensors | Modelo base sin cuantizar |
| fara-9b-heretic-uncensored (static GGUF) | 8,95 B | no disponible | MIT | GGUF | Cuantizaciones estáticas del mismo autor |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo decensurado/abliterated: la eliminación de rechazos puede producir contenido inapropiado, ofensivo o peligroso; no apto para producción orientada al usuario final sin moderación adicional.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; los modelos de agente web son propensos a acciones erróneas sobre interfaces reales.
- Idioma: declarado únicamente en inglés; el rendimiento en castellano no está garantizado.
- Contexto: no disponible; no se puede confirmar la ventana máxima soportada.
- Visión: requiere los ficheros mmproj del repositorio estático para funcionar como modelo multimodal.
- Licencia MIT: permite uso comercial, pero la responsabilidad sobre el contenido generado y las acciones del agente recae en el desplegador.
- Cuantizaciones muy bajas (IQ1, IQ2) degradan notablemente la calidad; el autor advierte que IQ1_S es "para desesperados" y Q2_K_S es de "muy baja calidad".
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento en tareas estándar (MMLU, HumanEval, etc.).
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: modelo muy reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/fara-9b-heretic-uncensored-i1-GGUF
- Modelo base: https://huggingface.co/lmcfarlin/fara-9b-heretic-uncensored
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/fara-9b-heretic-uncensored-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#fara-9b-heretic-uncensored-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
