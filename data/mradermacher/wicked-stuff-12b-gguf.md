# mradermacher/Wicked-Stuff-12B-GGUF

## Resumen

Wicked-Stuff-12B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo ReadyArt/Wicked-Stuff-12B, realizadas por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un LLM de 12B parámetros orientado a roleplay sin filtros (NSFW, terror, violencia y contenido adulto), etiquetado como "unaligned" y "not-for-all-audiences", por lo que su uso está claramente dirigido a un público maduro y a casos de ficción interactiva.

La relevancia de esta ficha no está tanto en el modelo base en sí, sino en la disponibilidad inmediata de cuantizaciones que van desde Q2_K (4,9 GB) hasta Q8_0 (12,8 GB), lo que permite ejecutar el modelo en hardware modesto, incluyendo GPUs de consumo y CPU. Además, el repositorio incluye suplementos multimodales (mmproj) en f16 y Q8_0, lo que sugiere que el modelo base incorpora capacidades de visión compatibles con llama.cpp.

El modelo está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque el contenido que genera puede requerir moderación según la jurisdicción y la plataforma de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, basado en el ecosistema transformers/llama.cpp) |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

No se han publicado detalles de la arquitectura ni del proceso de entrenamiento del modelo base en la información disponible. Lo que sí consta es que se trata de un modelo denso de aproximadamente 11,9 mil millones de parámetros, entrenado en inglés y orientado a conversación e instrucción (tags "conversational" e "instruct"), con especialización en roleplay y contenido adulto sin filtros.

Sobre la versión cuantizada: mradermacher ha convertido el modelo desde el formato HF (safetensors) a GGUF, ofreciendo cuantizaciones estáticas de la familia K-quants e IQ-quants. Existe además una versión con imatrix (matriz de importancia) en un repositorio separado, que suele ofrecer mejor calidad a tamaños de cuantización bajos. La presencia de archivos mmproj (proyector multimodal) indica que el modelo base admite entrada de imágenes mediante el soporte multimodal de llama.cpp.

## Capacidades

- Generación de texto conversacional e instruct en inglés
- Roleplay de largo formato, incluyendo ERP (roleplay erótico), horror y violencia gráfica, sin filtros de alineación
- Posible comprensión de imágenes mediante los suplementos mmproj incluidos (f16 y Q8_0), compatible con llama.cpp
- Ejecución local eficiente gracias a la amplia gama de cuantizaciones GGUF
- No hay evidencia de soporte de tool calling, function calling ni capacidades de agente en la información disponible
- No hay evidencia de modo "thinking" ni razonamiento extendido

## Casos de uso

- Roleplay interactivo y narrativa de ficción adulta: el modelo está especializado en conversaciones de rol sin restricciones de contenido, útil para plataformas de ficción interactiva dirigidas a adultos.
- Escritura creativa de terror y suspense: puede generar prosa con violencia gráfica y temática oscura sin rechazos, útil como asistente de escritura para autores del género.
- Prototipado local de chatbots de ficción: la cuantización Q4_K_M (7,5 GB) permite probar bots conversacionales en una GPU de consumo sin coste de API.
- Multimodalidad local ligera: con los archivos mmproj, se puede describir imágenes dentro de flujos de roleplay usando llama.cpp.
- Pruebas de cuantización y benchmarking personal: la gama completa de quants (Q2_K a Q8_0) es útil para estudiar la degradación de calidad por cuantización en un modelo de 12B.
- Integración en frontends como SillyTavern, KoboldCpp u Ollama para uso personal offline de contenido maduro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (sin contar contexto):
  - Q2_K: ~5 GB (cabe en GPUs de 6 GB)
  - Q4_K_S / Q4_K_M: 7,1-7,5 GB (cabe en RTX 3060 12GB, RTX 4060 Ti 16GB)
  - Q6_K: ~10 GB (RTX 3080/4070 Ti)
  - Q8_0: ~13 GB (RTX 4080/4090, o parcialmente en RAM)
- También es ejecutable en CPU puro con llama.cpp, con velocidades razonables para un modelo de 12B (del orden de 10-20 tokens/s en CPUs modernas de escritorio, estimación).
- GPUs recomendadas: RTX 3060 12GB o superior para Q4; RTX 4090 para Q8_0 con contexto amplio.
- Opciones de despliegue: llama.cpp, KoboldCpp, Ollama, LM Studio, text-generation-webui; los archivos mmproj requieren un runtime con soporte multimodal de llama.cpp.
- Latencia y throughput exactos: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Wicked-Stuff-12B-GGUF | 11,9B | GGUF | Apache 2.0 | Roleplay NSFW sin filtros |
| MythoMax-L2-13B (cuantizado) | 13B | GGUF | Licencia del modelo base (Llama 2) | Roleplay narrativo |
| Nous-Hermes-2-Mistral-7B | 7B | GGUF/safetensors | Apache 2.0 | Conversación general instruct |

Nota: la comparativa es orientativa; no hay datos de rendimiento publicados que permitan comparar calidad de generación de forma objetiva.

## Limitaciones y advertencias

- Contenido adulto explícito: el modelo genera NSFW, violencia y horror sin filtros; su uso puede ser inapropiado o ilegal según la jurisdicción y está etiquetado "not-for-all-audiences".
- Idioma: entrenado en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgo de alineación: al ser "unaligned", carece de salvaguardas habituales; aumenta el riesgo de generar contenido ofensivo o dañino.
- Riesgo de alucinación: típico de LLMs de este tamaño, sin datos que permitan cuantificarlo.
- Longitud de contexto: no especificada; debe verificarse en la ficha del modelo base antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el desplegador.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de la prosa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Wicked-Stuff-12B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-12B
- Cuants imatrix (ponderados): https://huggingface.co/mradermacher/Wicked-Stuff-12B-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Wicked-Stuff-12B-GGUF
- FAQ / solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
