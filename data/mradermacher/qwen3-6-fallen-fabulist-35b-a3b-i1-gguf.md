# mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-i1-GGUF

## Resumen

Qwen3.6-Fallen-Fabulist-35B-A3B-i1-GGUF es una cuantización en formato GGUF del modelo Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B, publicada por el usuario mradermacher, especializado en la generación de cuantizaciones con imatrix. El modelo subyacente es un merge (fusión) de modelos de la familia Qwen3.6, construido con mergekit, con un total de 35.505.251.456 parámetros (aproximadamente 35,5 mil millones) y una designación "A3B" que sugiere una arquitectura de mezcla de expertos (MoE) con unos 3 mil millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible.

La relevancia de esta ficha radica en que el repositorio ofrece una vía práctica para ejecutar en local un modelo de gran tamaño mediante cuantizaciones GGUF de baja precisión, incluyendo la variante i1-Q2_K de 13,3 GB. El modelo está orientado a conversación y etiquetado como "conversational", con licencia Apache 2.0 y soporte declarado únicamente para inglés.

No obstante, la información publicada es muy limitada: no se detallan la arquitectura exacta, el contexto máximo, los datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja fielmente lo disponible y marca como "no disponible" todo aquello que no consta en la documentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base descrito como merge mediante mergekit; designación "A3B" sugiere MoE, no confirmado) |
| Parámetros totales | 35.505.251.456 (≈35,5 B) |
| Parámetros activos | no disponible (la designación "A3B" sugiere ≈3 B activos, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K (13,3 GB); el autor lista además IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (disponibilidad efectiva no verificada en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers, gguf); incluye fichero imatrix de 0,5 GB |

## Arquitectura y entrenamiento

El modelo base Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B es, según las etiquetas del repositorio, el resultado de una fusión de modelos realizada con mergekit. La nomenclatura "Qwen3.6" indica su pertenencia a la familia Qwen3.6, y "Fallen-Fabulist" es el nombre del merge. El sufijo "A3B" es la convención habitual para indicar arquitecturas de mezcla de expertos con parámetros activos reducidos, pero la información proporcionada no confirma la arquitectura interna, el número de expertos, la estrategia de enrutamiento ni si se trata de un transformer denso o MoE.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La cuantización i1 de mradermacher emplea ficheros imatrix (matriz de importancia) para mejorar la calidad de las cuantizaciones de baja precisión, y el autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y orientado a diálogo multi-turno.
- Razonamiento y generación de código: no confirmado explícitamente en la documentación; la familia Qwen suele incluir estas capacidades, pero no consta para este merge concreto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local mediante GGUF: compatible con el ecosistema llama.cpp y derivados.

## Casos de uso

- Despliegue local en estaciones de trabajo: la cuantización i1-Q2_K de 13,3 GB permite ejecutar el modelo en equipos con GPU de consumo de gama alta o incluso en CPU con suficiente RAM, sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales en inglés: el modelo está etiquetado como conversacional y puede emplearse para validar flujos de diálogo antes de pasar a producción.
- Experimentación con fusiones de modelos: útil para investigadores que quieran evaluar el comportamiento de un merge de la familia Qwen3.6 frente al modelo original.
- Evaluación de cuantizaciones imatrix: el repositorio sirve para comparar la calidad de la cuantización i1-Q2_K frente a cuantizaciones estáticas del mismo modelo.
- Generación de texto en pipelines sin conexión: entornos con requisitos de privacidad o air-gapped donde no se permite el envío de datos a APIs externas.
- Investigación sobre eficiencia de inferencia: la designación A3B (si se confirma MoE) permitiría estudiar el equilibrio entre tamaño total y parámetros activos en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización i1-Q2_K ocupa 13,3 GB en disco; con overhead de contexto y caché KV, se recomienda al menos 16 GB de VRAM para GPU o RAM equivalente en CPU.
- GPU recomendadas: no disponible de forma específica; por tamaño, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) permitirían cargar la cuantización Q2_K con margen; GPUs de 16 GB podrían requerir offloading parcial.
- ¿Cabe en GPU de consumo? Sí, la variante i1-Q2_K de 13,3 GB cabe en GPUs de 16 GB o más; cuantizaciones mayores (Q4, Q5, Q6) requerirían más memoria.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el repositorio declara compatibilidad con endpoints.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-Fallen-Fabulist-35B-A3B (este, i1-GGUF) | 35,5 B | no disponible | apache-2.0 | GGUF | Hugging Face (mradermacher) |
| Qwen3.6-Fallen-Fabulist-35B-A3B (base) | 35,5 B | no disponible | apache-2.0 | safetensors (presumible) | Hugging Face (Cyclone-Labs) |
| Qwen3.6-Fallen-Fabulist-35B-A3B-GGUF (cuantizaciones estáticas) | 35,5 B | no disponible | apache-2.0 | GGUF | Hugging Face (mradermacher) |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría; la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- Información muy escasa: no se documentan arquitectura, contexto, entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para producción.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados; al ser un merge de modelos Qwen, podría heredar sesgos de los modelos originales, pero no consta información al respecto.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base es un merge y conviene verificar las licencias de los modelos fusionados.
- Cuantización de baja precisión: la variante i1-Q2_K puede degradar la calidad respecto al modelo original; el autor recomienda IQ3_XXS sobre Q2_K en términos de calidad.
- Fecha de creación futura (2026-11-20): dato atípico que conviene verificar antes de confiar en el repositorio.
- Sin descargas ni likes: repositorio sin validación comunitaria, lo que aumenta el riesgo de problemas no documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.6-Fallen-Fabulist-35B-A3B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
