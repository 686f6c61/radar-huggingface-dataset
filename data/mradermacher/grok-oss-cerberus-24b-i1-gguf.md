# mradermacher/grok-oss-Cerberus-24B-i1-GGUF

## Resumen

grok-oss-Cerberus-24B-i1-GGUF es una colección de cuantizaciones GGUF del modelo Cerberus-24B, publicada por mradermacher. El modelo base fue desarrollado por c4tdr0ut y, según las etiquetas de su model card, se trata de un ajuste fino de Mistral de aproximadamente 23.572 millones de parámetros (23,57B), orientado a conversación y generación de texto en inglés, con un enfoque explícitamente "uncensored". El ajuste se realizó mediante ORPO (Odd Ratio Preference Optimization) sobre adaptadores QLoRA, lo que indica una fase de alineación por preferencias tras el entrenamiento supervisado.

Este repositorio no contiene el modelo original, sino versiones cuantizadas con la herramienta de mradermacher, que combina cuantización por importancia (imatrix) con el formato i1. La colección cubre un rango muy amplio de niveles de compresión, desde IQ1_S (5,4 GB) hasta Q6_K (19,4 GB), lo que permite desplegar el modelo tanto en GPUs de consumo con poca VRAM como en configuraciones de servidor con mayor fidelidad numérica. Es relevante para desarrolladores que quieran ejecutar un modelo conversacional de ~24B en local mediante llama.cpp u Ollama sin depender de servicios en la nube, aceptando las limitaciones de calidad asociadas a las cuantizaciones bajas.

La información pública disponible es escasa: la model card del cuantizador remite al modelo base, y no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. La licencia figura como "other", por lo que la reutilización comercial requiere verificar los términos del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral, según etiquetas del modelo base) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; también se ofrece el fichero imatrix |
| Idiomas soportados | inglés (según la model card del modelo base) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Cerberus-24B se presenta en su model card como un ajuste fino de Mistral con 23,57B de parámetros, entrenado con ORPO (Odd Ratio Preference Optimization) y QLoRA. ORPO es una variante de alineación por preferencias que combina la pérdida de modelado de lenguaje con un término de odds ratio, evitando la necesidad de una fase separada de SFT seguida de RLHF. QLoRA implica que el ajuste se realizó sobre una base cuantizada en 4 bits con adaptadores de bajo rango, lo que reduce los requisitos de memoria durante el entrenamiento. La etiqueta "uncensored" sugiere que el dataset de preferencias no incluyó filtros de rechazo, aunque no se documenta la composición exacta del corpus.

No se dispone de información sobre el número de tokens de entrenamiento, la mezcla de datos, la longitud de contexto nativa ni innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.). Las cuantizaciones de este repositorio aplican el método i1 de mradermacher, que utiliza un fichero imatrix para ponderar la importancia de los tensores durante la cuantización, mejorando la fidelidad respecto a cuantizaciones estáticas del mismo tamaño. El repositorio incluye tanto el fichero imatrix (0,1 GB) como 23 variantes cuantizadas, lo que permite al usuario generar sus propias cuantizaciones si lo necesita.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con un estilo de respuesta orientado a chat.
- Razonamiento general y respuesta a instrucciones, derivado del ajuste ORPO sobre Mistral.
- Generación de código y matemáticas a nivel básico-intermedio, aunque no se documentan evaluaciones específicas.
- Modo "uncensored": el modelo está ajustado para reducir rechazos y respuestas de evasión, lo que puede aumentar la probabilidad de contenido sensible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso estructurado.
- Capacidades multilingües limitadas al inglés según la model card; no hay evidencia de otros idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno en inglés ejecutándose en una GPU de consumo con la cuantización i1-Q4_K_M (14,4 GB), adecuado para prototipos de chatbots sin conexión a servicios externos.
- Generación creativa sin filtros: el ajuste "uncensored" lo hace útil para escritura de ficción, guiones o narrativa que requiera explorar temas sensibles sin rechazos automáticos, siempre con revisión humana.
- Experimentación con alineación por preferencias: investigadores pueden comparar el comportamiento de un modelo ajustado con ORPO frente a variantes SFT/RLHF, usando las distintas cuantizaciones para estudiar el efecto de la compresión en la calidad de las respuestas.
- Despliegue en estaciones de trabajo con llama.cpp: gracias a las cuantizaciones IQ2/IQ3 (6,6-10,8 GB), el modelo cabe en GPUs de 8-12 GB, permitiendo pruebas de concepto en hardware modesto.
- Generación de texto por lotes en pipelines de datos: la variante Q4_K_S (13,6 GB) ofrece un equilibrio tamaño/velocidad razonable para tareas de aumento de datos o etiquetado sintético en inglés.
- Evaluación de robustez ante cuantización: el amplio rango de cuantizaciones (de IQ1_S a Q6_K) permite medir la degradación de perplejidad y calidad conversacional conforme se reduce el tamaño, útil para calibrar qué nivel de compresión es aceptable en producción.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF no es el ideal para entrenamiento, el fichero imatrix y las cuantizaciones altas (Q5_K_M, Q6_K) sirven como referencia para validar adaptadores LoRA entrenados sobre el modelo base en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~5,4 GB (i1-IQ1_S) hasta ~19,4 GB (i1-Q6_K); la variante recomendada i1-Q4_K_M ocupa 14,4 GB y la i1-Q5_K_M, 16,9 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M/Q6_K con contexto moderado; RTX 3090/4080 (16-24 GB) para Q4_K_M; RTX 4070/3060 Ti (8-12 GB) para IQ2/IQ3; A100/H100 solo si se necesita contexto muy largo o throughput alto.
- Cabe en GPU de consumo: sí, desde IQ1_S en GPUs de 6-8 GB hasta Q6_K en GPUs de 24 GB. Las cuantizaciones IQ2 e IQ3 requieren 8-12 GB y las Q4, 14-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio también incluye el fichero imatrix para generar cuantizaciones propias.
- Latencia y throughput: no disponibles; dependen del hardware y del nivel de cuantización. Como referencia cualitativa, la model card señala que Q4_K_M es "fast, recommended" y Q4_0 "fast, low quality", pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| grok-oss-Cerberus-24B-i1-GGUF | 23,57B | no disponible | other | GGUF (i1) | Cuantizaciones de Cerberus-24B, uncensored, inglés |
| c4tdr0ut/Cerberus-24B | 23,57B | no disponible | other | safetensors | Modelo base original, ajuste ORPO/QLoRA sobre Mistral |
| mradermacher/grok-oss-Cerberus-24B-GGUF | 23,57B | no disponible | other | GGUF (estáticas) | Cuantizaciones estáticas del mismo modelo, alternativa a las i1 |
| Mistral Small 24B (referencia de familia) | ~24B | no disponible en esta ficha | Apache 2.0 (según versión) | safetensors, GGUF | Modelo oficial de Mistral; licencia y contexto deben verificarse en su repositorio |

La comparación con Mistral Small es solo orientativa por tamaño y familia; no se dispone de datos de rendimiento comparativos para Cerberus-24B en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Mistral y entrenarse con un corpus no especificado, es probable que herede sesgos del modelo base y del dataset de preferencias.
- Riesgo de alucinación: presente como en cualquier LLM de ~24B; la ausencia de benchmarks impide cuantificarlo. El ajuste "uncensored" puede aumentar la confianza en respuestas incorrectas al reducir los rechazos.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está documentada, por lo que no debe asumirse una ventana larga en producción.
- Restricciones de licencia: la licencia es "other"; es imprescindible revisar los términos del modelo base c4tdr0ut/Cerberus-24B antes de cualquier uso comercial. La licencia de Mistral subyacente también puede imponer condiciones.
- Calidad de las cuantizaciones bajas: las variantes IQ1 e IQ2 (5,4-8,2 GB) degradan notablemente la calidad; la propia model card las describe como "for the desperate" o "mostly desperate". No se recomiendan para producción.
- Formato GGUF: no es adecuado para fine-tuning directo; para entrenamiento adicional debe usarse el modelo base en safetensors.
- Contenido sensible: el ajuste "uncensored" puede generar contenido no apto para todos los públicos; se requiere moderación externa en despliegues abiertos.
- Falta de documentación: no hay información sobre tool calling, agentes, contexto nativo ni evaluación de seguridad, lo que limita su uso en entornos regulados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/grok-oss-Cerberus-24B-i1-GGUF
- Modelo base: https://huggingface.co/c4tdr0ut/Cerberus-24B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/grok-oss-Cerberus-24B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#grok-oss-Cerberus-24B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
