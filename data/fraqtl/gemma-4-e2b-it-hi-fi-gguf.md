# fraQtl/Gemma-4-E2B-it-Hi-Fi-GGUF

## Resumen

Gemma-4-E2B-it-Hi-Fi-GGUF es una familia de cuantizaciones GGUF del modelo google/gemma-4-E2B-it, publicada por el usuario fraQtl. El modelo base es un transformer de 4.647.450.147 parametros de Google, orientado a inferencia en dispositivo (edge), con soporte de tool calling y conversacion. La aportacion principal de este repositorio no es el modelo en si, sino el metodo de cuantizacion "calibration-aware per-tensor" aplicado sobre la maquinaria estandar Q4_K de llama.cpp: las decisiones de precision por tensor se derivan de un analisis de calibracion en lugar de valores por defecto fijos.

El resultado son artefactos con una divergencia KL menor frente al checkpoint original bf16 que la cuantizacion comunitaria de referencia (bartowski Q4_K_M), manteniendo un tamano practicamente identico. El repositorio incluye tres variantes: un Q4_K_M "iso-size" de 3,46 GB, un artefacto "Phone" de 2,86 GB (17,5 % menos bytes) y un IQ3XXS "SmartEdge" de 2,45 GB usado en la demo movil. La relevancia actual reside en la combinacion de fidelidad medida, tamano reducido y ejecucion totalmente offline en hardware de consumo (iPhone), con tool calling determinista y verificacion sha256 del artefacto en carga.

La licencia de los artefactos de cuantizacion es Apache 2.0, pero los pesos derivan de Gemma y quedan sujetos a los terminos de Google. El repositorio declara un unico idioma soportado (ingles) y esta etiquetado como `inference: false`, es decir, no aloja una demo de inferencia en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base google/gemma-4-E2B-it); detalles internos no disponibles |
| Parametros totales | 4.647.450.147 (segun safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (iso-size), Q4_K_M variante Phone, IQ3XXS (SmartEdge) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 para artefactos; pesos sujetos a Gemma Terms of Use |
| Formato de pesos | GGUF (llama.cpp) |

Detalle de artefactos publicados:

| Artefacto | Bytes | bpw reales | KLD code/math | KLD general |
|---|---:|---:|---:|---:|
| `Gemma-4-E2B-it-fraQtl-HiFi-Q4_K_M.gguf` | 3.461.675.328 | 5,93 | 0,05846 | 0,09646 |
| `Gemma-4-E2B-it-fraQtl-HiFi-Phone.gguf` | 2.856.122.688 | 4,89 | 0,06231 | 0,09716 |
| `Gemma-4-E2B-it-fraQtl-SmartEdge-IQ3XXS.gguf` | ~2,45 GB (2.450.000.000 aprox.) | no disponible | no disponible | no disponible |
| bartowski Q4_K_M (baseline fijado) | 3.462.678.272 | 5,93 | 0,09139 | 0,13249 |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-E2B-it, un transformer de 4.647.450.147 parametros. La model card del repositorio de cuantizacion no documenta la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si hubo etapas de RLHF o DPO; esa informacion corresponderia a la model card del modelo base de Google y no esta incluida en la informacion disponible.

La innovacion tecnica documentada en este repositorio es el proceso de cuantizacion: se emplea la maquinaria estandar Q4_K de llama.cpp, pero la asignacion de precision por tensor se decide mediante un analisis de calibracion (calibration-aware per-tensor quantization) en lugar de los valores por defecto. La fidelidad se mide como divergencia KL simetrica top-20 sobre soporte de un profesor Q8 (cuantizacion Q8_0 del checkpoint bf16 original), promediada sobre posiciones. El repositorio tambien menciona el uso de imatrix en las etiquetas. El artefacto SmartEdge IQ3XXS no dispone de escalera KLD publicada; su evidencia actual es el comportamiento en dispositivo y el benchmark de la demo.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Tool calling / function calling, con ejecucion determinista de acciones por una capa de codigo Swift separada del modelo.
- Razonamiento multi-paso encadenado (por ejemplo, instrucciones de dos pasos traducidas en dos escrituras de calendario).
- Generacion de codigo (la demo muestra algoritmo de Dijkstra en C++ generado offline a ~11 tok/s interactivos).
- Conocimiento general y respuesta a preguntas.
- Lectura de documentos y fotografias (segun la demo).
- Entrada de voz y respuestas habladas mediante reconocimiento y sintesis de voz en dispositivo (no son capacidades del modelo en si, sino del pipeline de la demo).
- Etiquetado de contexto por respuesta (context tags) para declarar limites de alcance.
- Capacidades multilingues: no disponibles; el repositorio declara unicamente ingles.

## Casos de uso

- Asistente de calendario offline: el modelo interpreta peticiones habladas o escritas ("encuentra hueco el jueves para reunion VC"), localiza franjas libres y la capa de codigo escribe el evento en Apple Calendar; encaja por su tool calling y su ejecucion en dispositivo sin red.
- Gestion de eventos y recordatorios encadenados: mover o renombrar eventos y crear recordatorios en varios pasos, con titulos enriquecidos por contactos; adecuado por el razonamiento multi-paso y la ventana de contexto suficiente para el estado de la conversacion.
- Generacion de codigo en entornos sin conectividad: producir fragmentos como algoritmos clasicos en C++ directamente en el telefono (~11 tok/s interactivos), util en escenarios de campo, auditoria o privacidad estricta.
- Asistentes con garantia de accion verificable: cualquier escritura genera un "receipt chip" con lo escrito; si la escritura falla, no aparece chip. Apropiado para flujos donde se requiere trazabilidad de acciones.
- Lectura y comprension de documentos y fotos en dispositivo: extraer informacion de material local sin enviar datos a la nube, gracias a la inferencia offline y a la memoria residente contenida (~516 MB en iPhone-16-class).
- Asistentes con limites declarados: responder explicitamente "no tengo acceso a tus correos" cuando se le pregunta por conectores inexistentes; util para productos que deben comunicar su alcance sin ambiguedad.
- Despliegue en edge con restricciones termicas: el panel de receipts reporta tasa de decodificacion, memoria residente y estado termico; adecuado para integrar en apps moviles con presupuesto de memoria y bateria acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad tipo MMLU, HumanEval o GSM8K en la informacion disponible. Los unicos datos medidos son de fidelidad de cuantizacion y de rendimiento en dispositivo.

Fidelidad (KLD simetrica top-20, menor es mejor):

| Modelo | KLD code/math | KLD general | Reduccion vs baseline |
|---|---:|---:|---:|
| fraQtl HiFi Q4_K_M (iso-size) | 0,05846 | 0,09646 | −36,0 % / −27,2 % |
| fraQtl HiFi Phone (−17,5 % bytes) | 0,06231 | 0,09716 | −31,8 % / −26,7 % |
| bartowski Q4_K_M (baseline) | 0,09139 | 0,13249 | referencia |

Rendimiento en dispositivo (iPhone-16-class, llama.cpp b10075, Metal, mmap, modo avion):

| Metrica | Valor |
|---|---|
| Memoria residente | ~516 MB |
| Velocidad interactiva | ~12 tok/s (ultimo turno, incluye prefill) |
| Benchmark greedy 256 tokens | 21,6 tok/s sostenidos (umbral >=15 tok/s: PASS) |
| Generacion de codigo offline | ~11 tok/s interactivos |
| Deriva de medicion KLD | 0,0 (3 ejecuciones) |

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M iso-size ~3,46 GB de pesos; Phone ~2,86 GB; SmartEdge IQ3XXS ~2,45 GB. Sumar overhead de contexto KV cache y buffers de llama.cpp.
- GPU de datacenter: A100 y H100 ampliamente suficientes para servir el modelo completo con contexto largo; no hay datos de throughput publicados para estas GPUs.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y GPUs con 8 GB o mas para Q4_K_M; en 6 GB puede requerir la variante Phone o IQ3XXS.
- Movil: verificado en iPhone-16-class con ~516 MB residentes y 21,6 tok/s sostenidos en benchmark greedy de 256 tokens.
- Despliegue: llama.cpp (verificado en b10075 con backend Metal), llama-cpp-python; Ollama y vLLM no estan confirmados en la informacion disponible.
- Latencia/throughput: ~12 tok/s interactivos y 21,6 tok/s sostenidos en iPhone-16-class; sin datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| fraQtl Gemma-4-E2B-it HiFi Q4_K_M | 4.647.450.147 (base) | no disponible | GGUF Q4_K_M | Apache 2.0 (artefactos) + Gemma Terms | KLD 0,05846 / 0,09646; 3,46 GB |
| bartowski Gemma-4-E2B-it Q4_K_M | 4.647.450.147 (base) | no disponible | GGUF Q4_K_M | Apache 2.0 (artefactos) + Gemma Terms | KLD 0,09139 / 0,13249; 3,46 GB |
| fraQtl Gemma-4-E2B-it HiFi Phone | 4.647.450.147 (base) | no disponible | GGUF Q4_K_M (variante) | Apache 2.0 (artefactos) + Gemma Terms | KLD 0,06231 / 0,09716; 2,86 GB |
| google/gemma-4-E2B-it (bf16 original) | 4.647.450.147 | no disponible | safetensors | Gemma Terms of Use | Referencia de fidelidad |

No se dispone de datos de benchmarks de calidad para comparar con modelos de la misma categoria (por ejemplo, otras familias edge de 2-5B parametros); la comparativa se limita a variantes de cuantizacion del mismo modelo base.

## Limitaciones y advertencias

- Idioma: el repositorio declara unicamente ingles; el rendimiento en castellano no esta verificado.
- Contexto: la longitud de contexto del modelo base no se documenta en la informacion disponible; planificar en consecuencia.
- Alucinacion: no se documentan tasas ni evaluaciones; el diseno de la demo mitiga acciones no verificadas mediante receipts, pero no elimina el riesgo de respuestas incorrectas.
- Sesgos: no se documentan sesgos conocidos en la model card del repositorio.
- Licencia: los artefactos de cuantizacion son Apache 2.0, pero los pesos derivan de google/gemma-4-E2B-it y siguen sujetos a los terminos de Gemma. Revisar las condiciones de uso comercial de Google antes de produccion.
- Fidelidad: el artefacto SmartEdge IQ3XXS no tiene escalera KLD publicada; su evidencia es solo el comportamiento en dispositivo y el benchmark de tokens.
- Alcance funcional: la demo no realiza llamadas de red, no accede a correo ni mensajes; el modelo no anuncia acciones por si mismo, lo hace una capa de codigo determinista.
- Repositorio marcado `inference: false`: no hay endpoint de inferencia alojado en Hugging Face.
- Fecha de creacion indicada: 2026-07-21; fecha de actualizacion: 2026-12-12 (verificar contra la pagina real del repositorio).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/Gemma-4-E2B-it-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Imagen del repositorio: https://huggingface.co/fraQtl/Gemma-4-E2B-it-Hi-Fi-GGUF/resolve/main/Gemma-4-E2B-it-Hi-Fi-GGUF.png
- Grafico de fidelidad KLD: https://huggingface.co/fraQtl/Gemma-4-E2B-it-Hi-Fi-GGUF/resolve/main/kld_chart.png
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada.
