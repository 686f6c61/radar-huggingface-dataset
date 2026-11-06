# aarontmaher/DeepSeek-V4.1-Flash-1017-Q4-GGUF-Mirror

## Resumen

Este repositorio es un espejo ("Lauburu Sovereign Mirror") de una cuantización GGUF del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017`, concretamente la variante abliterated publicada por `huihui-ai` y cuantizada por `unsloth` en formato `UD-Q4_K_XL`. El autor del repo, `aarontmaher`, no entrena ni modifica el modelo: redistribuye los artefactos GGUF junto con sumas de verificación SHA256, un parche de tensores para las capas 11–28 y un inventario completo de los nueve fragmentos en que se divide el archivo principal.

El interés técnico del repositorio está en la trazabilidad: documenta hashes, tamaños exactos y versión de formato (GGUF v3) de cada shard, lo que facilita verificar la integridad de una descarga de 466,30 GiB. La variante "abliterated" implica que se ha aplicado una técnica de ablación de dirección de rechazo sobre los pesos para reducir las negativas del modelo a peticiones que el modelo base rechazaría, algo relevante para quien necesite un modelo sin censura, pero con implicaciones éticas y de seguridad evidentes.

La información disponible sobre arquitectura, contexto, idiomas y entrenamiento del modelo base es muy limitada en esta ficha; los datos de parámetros que aparecen en los metadatos de Hugging Face (754.974.720) no son coherentes con el tamaño del repo (0,8 GB) ni con el inventario de shards (466,30 GiB), por lo que se marcan como no fiables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`; sin detalles en la información proporcionada) |
| Parámetros totales | no disponible (el metadato de safetensors indica 754.974.720, incoherente con el tamaño de los shards; no verificable) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | `UD-Q4_K_XL` (Q4 dinámico de Unsloth); parche auxiliar en `UD-IQ3_S`; shard auxiliar `engram` en `IQ4_NL` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF v3 (compatible con llama.cpp y prima.cpp); 9 shards para `UD-Q4_K_XL` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en los datos proporcionados. El repositorio no incluye model card técnica del modelo original, sino únicamente la documentación del espejo: inventario de shards, hashes SHA256, versión de GGUF y metadatos del parche de tensores. Se sabe que el pipeline de publicación es: modelo base `DeepSeek-V4.1-Flash-1017` → abliteration por `huihui-ai` → cuantización GGUF por `unsloth` → espejo con verificación por `aarontmaher`.

El elemento técnico destacable es el parche de tensores `DeepSeek-V4.1-Flash-1017-UD-IQ3_S-patch.gguf` (765,0 MB, 802.162.112 bytes, SHA256 `ae7226d1...e512fee`), que afecta a las capas 11–28 del modelo `UD-Q4_K_XL` y se aplica mediante el script `unsloth/patch-unsloth-DeepSeek-V4.1-Flash-1017.py`. Este tipo de parche se usa habitualmente para corregir o sustituir tensores tras la cuantización sin redistribuir el modelo completo. El shard `engram/DeepSeek-V4.1-Flash-1017-engram-IQ4_NL.gguf_file` (103,0 GiB) sugiere la existencia de un componente auxiliar o módulo adicional, pero su función no se documenta.

## Capacidades

- Generación de texto: capacidad esperada por ser un modelo de la familia DeepSeek, aunque no se detalla en la información disponible.
- Razonamiento y código: no confirmado explícitamente en la documentación del repo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas aparece vacío en Hugging Face).
- Modo "uncensored": la variante abliterated reduce los rechazos del modelo base ante peticiones sensibles; es la característica diferencial declarada en los tags.
- Compatibilidad de inferencia: llama.cpp y prima.cpp (declarado en la model card).

## Casos de uso

- Despliegue local con llama.cpp: el formato GGUF v3 y la cuantización `UD-Q4_K_XL` permiten ejecutar el modelo en entornos con llama.cpp, aunque el tamaño de 466,30 GiB exige hardware de gama alta o servidor.
- Investigación sobre abliteration: comparar el comportamiento del modelo base frente a la variante abliterated para estudiar cómo la ablación de dirección de rechazo afecta a las respuestas en dominios sensibles.
- Verificación de integridad de artefactos: el repositorio sirve como referencia de hashes SHA256 y tamaños por shard para validar descargas en pipelines de distribución de modelos.
- Pruebas de cuantización: útil para evaluar la calidad de `UD-Q4_K_XL` frente a otras cuantizaciones del mismo modelo base en tareas de generación y razonamiento.
- Entornos con requisitos de licencia permisiva: la licencia MIT facilita la integración en productos comerciales, siempre que se cumplan las obligaciones de atribución.
- Reproducibilidad en investigación: los hashes y el script de parche permiten reconstruir exactamente el mismo artefacto en distintos nodos de un clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para `UD-Q4_K_XL`: el conjunto de shards suma 466,30 GiB, por lo que la inferencia requiere aproximadamente esa cantidad de memoria (o descarga por capas con offloading, con penalización severa de latencia).
- El shard auxiliar `engram` en `IQ4_NL` añade 103,0 GiB adicionales si se utiliza.
- GPU recomendadas: no disponibles en la información proporcionada; por el volumen, un despliegue realista requiere múltiples aceleradores de clase servidor (A100/H100 80 GB en número suficiente) o configuraciones multi-nodo.
- GPU de consumo (RTX 4090, 24 GB): no cabe el modelo completo; solo sería viable con offloading masivo a CPU/RAM, con throughput muy bajo.
- Opciones de despliegue: llama.cpp y prima.cpp (declarados); vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | safetensors (repo original) | Hugging Face |
| Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF | no disponible | no disponible | no disponible | GGUF | Hugging Face |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | no disponible | no disponible | no disponible | GGUF (múltiples cuantizaciones) | Hugging Face |
| Este espejo (`aarontmaher/...-Q4-GGUF-Mirror`) | no disponible | no disponible | MIT | GGUF v3, `UD-Q4_K_XL` | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones técnicas del modelo base para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La variante abliterated elimina parte de los mecanismos de rechazo del modelo base; puede producir contenido dañino, sesgado o inexacto con mayor facilidad. No es recomendable para aplicaciones orientadas al usuario sin filtros adicionales.
- No hay información verificable sobre sesgos del modelo base ni sobre el efecto de la ablación en distintos idiomas y dominios.
- El metadato de parámetros totales (754.974.720) es incoherente con el tamaño del repositorio y de los shards; no debe usarse como referencia.
- El tamaño de descarga (466,30 GiB más 103,0 GiB del shard auxiliar) hace inviable el despliegue en hardware de consumo y complica el almacenamiento y la distribución.
- La licencia MIT se aplica a este repositorio, pero conviene verificar las condiciones del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` antes de uso comercial, ya que podrían imponer restricciones adicionales.
- El repositorio tiene 58 descargas y 0 likes; es un espejo de reciente creación (27–28 de octubre de 2026) sin validación comunitaria amplia.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide garantizar su comportamiento en casos de uso multilingües o de contexto largo.

## Enlaces

- Repositorio del espejo: https://huggingface.co/aarontmaher/DeepSeek-V4.1-Flash-1017-Q4-GGUF-Mirror
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante abliterated: https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Cuantizaciones GGUF de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
