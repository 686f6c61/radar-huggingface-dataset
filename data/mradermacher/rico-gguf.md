# mradermacher/RICO-GGUF

## Resumen

RICO-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo darkc0de/RICO, generado por el creador mradermacher. Se trata de un modelo de 27.320.697.856 parámetros, entrenado sobre el dataset XORTRON-RESTRICTED-RESEARCH-SFT y etiquetado por su autor como uncensored, harmful, toxic, abliterated y experimental. Este repositorio no incluye el modelo base en formato safetensors, sino únicamente las versiones cuantizadas para su uso con llama.cpp u Ollama.

La relevancia del modelo reside en su carácter de investigación: a juzgar por las etiquetas, se trata de un modelo desprovisto de restricciones de contenido, útil para estudiar comportamientos no alineados o técnicas de abliteración. Sin embargo, la documentación es muy escasa: no se publican especificaciones de arquitectura, longitud de contexto ni benchmarks, por lo que cualquier aplicación práctica debe considerarse experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 27.320.697.856 (27,32B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, darkc0de/RICO, está publicado en Hugging Face y ha sido cuantizado por mradermacher a formato GGUF mediante cuantización estática. Los pesos originales son safetensors y este repositorio ofrece solo GGUF. No hay información pública sobre la arquitectura específica, ni datos de tokens de entrenamiento o composición del dataset. Las etiquetas asociadas (abliterated, uncensored, toxic) sugieren que se ha aplicado una técnica de alineación reducida o eliminación de conductas de rechazo, pero no se documentan detalles técnicos. El dataset mencionado es darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT, de carácter restringido.

## Capacidades

- Generación de texto conversacional en inglés.
- Etiquetado como uncensored y abliterated: potencialmente sin filtros de contenido ni rechazo de peticiones dañinas.
- Incluye archivos mmproj Q8_0 y f16, que apuntan a un posible soporte multimodal (visión), aunque no hay confirmación en la documentación.
- Compatible con text-generation-inference y endpoints_compatible según los metadatos.

## Casos de uso

- Investigación en seguridad de IA: analizar el comportamiento de modelos desalineados y sus respuestas a prompts de riesgo.
- Fine-tuning experimental: partir de un modelo sin censura para explorar técnicas de alineación o desalineación.
- Generación de contenido creativo sin restricciones: escritura de ficción o guiones donde se requiera explorar temas tabú.
- Pruebas de robustez en sistemas de moderación: evaluar si los filtros de contenido detectan respuestas potencialmente dañinas.
- Estudios de interpretabilidad: observar cómo la técnica de abliteración afecta a las capas de rechazo del modelo.
- Experimentación en entornos de despliegue ligero: gracias a las cuantizaciones Q2_K (11 GB) hasta Q8_0 (29 GB), puede ejecutarse en GPUs de consumidor o servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Para la cuantización Q2_K (11,0 GB): VRAM mínima de 12 GB, apta para tarjetas como RTX 3060.
- Para Q4_K_S (15,9 GB) y Q4_K_M (16,9 GB): VRAM recomendada de 20–24 GB, con GPU tipo RTX 3090 o RTX 4090.
- Para Q8_0 (29,1 GB): VRAM necesaria de 32 GB o superior, idealmente A100 o configuraciones de múltiples GPUs (2×24 GB).
- Los archivos mmproj añaden entre 0,7 y 1,0 GB adicionales si se utilizan para multimodalidad.
- Despliegue compatible con llama.cpp, Ollama y, según los metadatos, text-generation-inference.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial no está garantizado ni soportado.
- Modelo experimental con etiquetas de contenido dañino y tóxico: riesgo de generar texto ofensivo o peligroso.
- No se conocen sesgos específicos ni se ha evaluado su alineación.
- Sin información sobre la longitud de contexto, lo que impide estimar la capacidad de memoria a largo plazo.
- Riesgo de alucinaciones al no disponer de evaluaciones publicadas.
- El dataset de entrenamiento es de investigación restringida, lo que puede implicar usos no éticos o legales.

## Enlaces

- HuggingFace: https://huggingface.co/mradermacher/RICO-GGUF
- Modelo base: https://huggingface.co/darkc0de/RICO
- Cuantizaciones i1-GGUF (imatrix): https://huggingface.co/mradermacher/RICO-i1-GGUF
- Perfil del autor: https://huggingface.co/mradermacher
