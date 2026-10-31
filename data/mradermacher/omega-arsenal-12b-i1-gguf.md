# mradermacher/Omega-Arsenal-12B-i1-GGUF

## Resumen

Omega-Arsenal-12B-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo ReadyArt/Omega-Arsenal-12B, publicada por el cuantizador mradermacher. El modelo base es un LLM de 12B parámetros (11.907.350.576 exactos según safetensors) orientado a conversación, roleplay y contenido adulto sin alineación, con etiquetas que indican capacidades para ERP, horror, violencia y material para público maduro. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales.

Esta ficha cubre el repositorio de cuantizaciones, no el modelo original. El valor añadido de esta versión frente a los GGUF estáticos (disponibles en un repositorio hermano) es el uso de imatrix, que mejora la calidad de las cuantizaciones bajas al calcular la importancia de cada peso sobre un corpus de calibración. Se ofrecen más de veinte variantes, desde IQ1_S (3,1 GB) hasta Q6_K (9,9 GB), lo que permite ejecutar el modelo en hardware muy variado, desde portátiles con poca VRAM hasta GPUs de gama alta.

La relevancia de este tipo de repositorios radica en la demanda de modelos sin filtrado de contenido para escritura creativa y roleplay, un nicho donde los modelos comerciales no operan. Cabe señalar que la model card indica que se trata de un modelo de visión, aunque los ficheros mmproj correspondientes se publican en el repositorio de cuantizaciones estáticas, no en este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según librería transformers) |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base ni su proceso de entrenamiento. Por el número de parámetros (~12B) y la disponibilidad de conversión a GGUF, se trata de un transformer denso, pero no se especifica la familia concreta (posibles bases habituales en este rango incluyen Mistral NeMo 12B o Nemo-based merges, aunque esto no está confirmado en la información disponible). Tampoco se conocen los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas de alineación como RLHF o DPO; de hecho, la etiqueta "unaligned" sugiere que se priorizó la ausencia de filtrado de contenido.

La innovación de este repositorio está en la cuantización: mradermacher emplea cuantizaciones ponderadas con imatrix (importance matrix), una técnica popularizada por ikawrakow en llama.cpp que calcula estadísticas de activación sobre un corpus de calibración para asignar mayor precisión a los pesos más relevantes. Esto mejora notablemente la perplejidad de las cuantizaciones agresivas (IQ1-IQ3) frente a cuantizaciones estáticas equivalentes. La model card incluye una nota del propio cuantizador indicando que se trata de un modelo de visión, con los ficheros mmproj publicados en el repositorio estático.

## Capacidades

- Generación de texto conversacional en inglés, con formato instruct.
- Roleplay y escritura creativa sin restricciones de contenido: etiquetas explícitas de nsfw, ERP, Erotic, Horror, Violence y adult-content.
- Modelo sin alineación ("unaligned"): no aplica rechazos por contenido maduro.
- Comprensión visual: la model card del cuantizador lo declara modelo de visión; los ficheros mmproj para usar esta capacidad en llama.cpp están en el repositorio estático (mradermacher/Omega-Arsenal-12B-GGUF).
- Ejecución local eficiente gracias a la amplia gama de cuantizaciones (de 3,1 a 9,9 GB).
- No hay información sobre tool calling, function calling, soporte de agentes ni capacidades matemáticas o de código específicas.

## Casos de uso

- Roleplay interactivo local: el modelo puede sostener conversaciones de rol de largo recorrido en interfaces como SillyTavern o KoboldCpp, ejecutándose con la variante Q4_K_M (7,5 GB) en una GPU de consumo.
- Escritura creativa de ficción adulta: generación de narrativa con contenido maduro, horror o violencia gráfica que los modelos comerciales filtrados rechazan; útil para autores que necesitan explorar temas difíciles con control total sobre el tono.
- ERP (roleplay erótico): caso de uso explícito declarado en las etiquetas del modelo, pensado para uso privado en local donde el usuario controla el contenido.
- Prototipado de chatbots sin filtrado: investigación sobre comportamiento de modelos sin alineación, evaluación de seguridad y red-teaming, aprovechando la licencia Apache 2.0.
- Inferencia en hardware modesto: las variantes IQ2 (4,0-4,5 GB) permiten ejecutar un modelo de 12B en portátiles con 8 GB de RAM o GPUs con VRAM limitada, con degradación de calidad aceptable gracias a imatrix.
- Comprensión de imágenes en local: combinando los GGUF con los ficheros mmproj del repositorio estático, se pueden describir o comentar imágenes en flujos multimodales locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un gráfico comparativo genérico de perplejidad entre tipos de cuantización elaborado por ikawrakow (enlazado en la sección de recursos), sin métricas específicas del modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (tamaño del fichero + contexto y overhead de KV cache):
  - IQ1_S: ~3,1 GB (ejecutable en prácticamente cualquier equipo moderno)
  - IQ3_M: ~5,8 GB
  - Q4_K_M (recomendada): ~7,5 GB
  - Q5_K_M: ~8,6 GB
  - Q6_K: ~9,9 GB
- GPUs recomendadas: cualquier GPU de consumo con 8 GB de VRAM (RTX 3060, RTX 4060) ejecuta la Q4_K_M con holgura; con 12-16 GB (RTX 3060 12GB, RTX 4070 Ti, RTX 4090) se puede usar Q6_K con contextos amplios. No se requieren A100 ni H100.
- Cabe en consumer GPU: sí, todas las variantes caben en GPUs de consumo; incluso la Q6_K funciona en CPUs modernas con 16 GB de RAM a velocidad razonable.
- Despliegue: llama.cpp (formato nativo), Ollama, KoboldCpp, LM Studio, text-generation-webui. vLLM y TGI no soportan GGUF de forma general, por lo que no son opciones habituales para este repositorio.
- Latencia y throughput: no disponible; como referencia orientativa, un modelo 12B en Q4_K_M sobre una RTX 4060 Ti genera típicamente decenas de tokens por segundo con llama.cpp, pero esta cifra no está publicada en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque | Contexto |
|---|---|---|---|---|---|
| Omega-Arsenal-12B (este, cuantizado) | ~12B | GGUF imatrix | apache-2.0 | Roleplay/NSFW sin alineación | no disponible |
| Mistral Nemo Instruct 12B (base habitual en este rango) | 12B | safetensors, GGUF comunitarios | apache-2.0 | Uso general alineado | 128k (según ficha oficial) |
| MythoMax / merges de roleplay 13B (familia Llama) | ~13B | GGUF comunitarios | varia (Llama 2 community) | Roleplay creativo | 4k-8k según variante |

Nota: la comparación con Mistral Nemo y MythoMax es orientativa por rango de tamaño y caso de uso; la model card no confirma el modelo base de Omega-Arsenal-12B.

## Limitaciones y advertencias

- Contenido explícito sin filtro: el modelo genera material NSFW, erótico, violento y de horror sin rechazos. No es apto para todos los públicos (etiqueta not-for-all-audiences) y su uso debe limitarse a contextos legales y responsables.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Sesgos: no hay documentación de auditoría de sesgos; al ser un modelo sin alineación, puede reproducir estereotipos y contenido ofensivo sin atenuación.
- Alucinaciones: riesgo estándar de LLM; no hay datos específicos publicados.
- Cuantizaciones extremas: las variantes IQ1_S/IQ1_M (descritas por el autor como "for the desperate") sufren degradación significativa de calidad; se recomienda Q4_K_M o superior.
- Contexto: la longitud de ventana no está documentada en este repositorio; consultar la ficha del modelo base ReadyArt/Omega-Arsenal-12B antes de planificar conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a la normativa aplicable del servicio donde se despliegue.
- Visión: los ficheros mmproj no están en este repositorio, sino en la versión estática; descargar el conjunto correcto si se necesita multimodalidad.

## Enlaces

- Repositorio cuantizado (imatrix): https://huggingface.co/mradermacher/Omega-Arsenal-12B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Omega-Arsenal-12B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Omega-Arsenal-12B
- Página de descargas resumida: https://hf.tst.eu/model#Omega-Arsenal-12B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
