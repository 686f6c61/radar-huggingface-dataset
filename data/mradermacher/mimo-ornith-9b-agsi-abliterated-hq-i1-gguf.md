# mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-i1-GGUF

## Resumen

MiMo-Ornith-9B-AGSI-Abliterated-HQ-i1-GGUF es la versión cuantizada en formato GGUF, generada con imatrix, del modelo de la familia MiMo-Ornith en su variante de 9B. El modelo original es un merge de componentes orientados a razonamiento, generación de código y uso agéntico, etiquetado como "abliterated" (es decir, con las capas de rechazo eliminadas mediante técnicas de abliteración) y publicado bajo licencia Apache 2.0. La cuantización la firma mradermacher, autor habitual de conversiones GGUF de la comunidad.

El modelo parte de la base OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ y está pensado para ejecutarse en local con llama.cpp, Ollama o vLLM. Con 8.953.803.264 parámetros totales, es un modelo denso de aproximadamente 9B, lo que lo sitúa en el rango de consumo de GPU de gama alta consumer (24 GB) en cuantizaciones de 4 bits.

Su relevancia actual radica en la combinación de tres factores: un tamaño manejable para despliegue local, capacidades declaradas de razonamiento y uso de terminal (terminal-use), y la ausencia de filtros de rechazo, lo que lo hace atractivo para entornos de investigación donde se necesita analizar el comportamiento del modelo sin restricciones de alineamiento. No obstante, al tratarse de un merge comunitario y no de un modelo oficial de un laboratorio, carece de documentación técnica detallada sobre su entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en la familia Qwen3.5, según las etiquetas del autor) |
| Parámetros totales | 8.953.803.264 (≈8,95B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (y superiores; listado completo en la model card) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del autor, que apuntan a una base de la familia Qwen3.5. Se trata, por tanto, de un transformer denso de aproximadamente 9B parámetros, sin mezcla de expertos (no hay parámetros activos que reportar). El modelo es un merge de componentes etiquetados como "AGSI" y "Abliterated", lo que indica que se han combinado pesos de distintos modelos y se ha aplicado abliteración para eliminar las direcciones de activación asociadas al rechazo de peticiones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. Las cuantizaciones i1 se han generado con imatrix (importance matrix), lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las cuantizaciones estáticas equivalentes, según la práctica habitual del autor.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento explícito (etiqueta "reasoning" en la model card).
- Generación de código (etiqueta "coding").
- Uso agéntico y de terminal (etiquetas "agentic" y "terminal-use"): el modelo está orientado a tareas de ejecución de comandos y flujos multi-paso.
- Comportamiento sin filtros de rechazo (abliterated/uncensored), lo que permite respuestas sin las restricciones habituales de alineamiento.
- Compatibilidad declarada con vLLM y llama.cpp.
- Soporte de tool calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un modelo sin capas de rechazo, comparando respuestas con la versión original para analizar qué direcciones de activación codifican el rechazo.
- Automatización de tareas de terminal: gracias a su orientación "terminal-use", puede emplearse en agentes que interpretan salidas de shell y proponen comandos en pipelines de administración de sistemas, ejecutándose en local con llama.cpp.
- Asistencia a la programación en local: con cuantizaciones Q4_K_M (5,7 GB) o Q5_K_M (6,6 GB) cabe en GPUs consumer de 8-12 GB, lo que permite autocompletado y generación de código sin enviar datos a la nube.
- Despliegue en entornos con requisitos de privacidad: al ser Apache 2.0 y ejecutable offline, encaja en organizaciones que no pueden usar APIs externas para procesar código o documentación sensible.
- Prototipado de agentes multi-paso: su combinación de razonamiento y etiquetas agénticas lo hace adecuado para experimentar con bucles de planificación-ejecución en entornos controlados.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de veinte variantes (desde IQ1_S de 2,8 GB hasta Q6_K y superiores), lo que permite medir la degradación de calidad frente al tamaño en un mismo modelo.
- Procesamiento bilingüe inglés-chino: útil para tareas de traducción o generación de contenido en ambos idiomas, aunque sin garantías fuera de ese par.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): IQ1_S ≈ 2,8 GB; IQ2_M ≈ 3,7 GB; IQ3_M ≈ 4,5 GB; Q4_K_M ≈ 5,7 GB; Q5_K_M ≈ 6,6 GB; Q6_K y superiores por encima de 7 GB, más overhead de contexto KV.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q5 con contexto moderado; RTX 4090 24 GB para Q6_K o cuantizaciones altas con contexto largo; A100/H100 para despliegue con vLLM y concurrencia.
- Cabe en GPU consumer: sí, desde GPUs de 8 GB con cuantizaciones IQ2/IQ3 y de 12-16 GB con Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), vLLM (compatibilidad declarada por el autor), y servidores compatibles con la API de endpoints.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiMo-Ornith-9B-AGSI-Abliterated-HQ-i1-GGUF | ≈8,95B | No disponible | Apache 2.0 | GGUF en HF | Merge comunitario abliterated, cuantizado con imatrix |
| Modelo base OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ | ≈8,95B | No disponible | Apache 2.0 | Safetensors en HF | Pesos originales sin cuantizar |
| Versión estática mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF | ≈8,95B | No disponible | Apache 2.0 | GGUF en HF | Mismas cuantizaciones sin imatrix |
| Alternativas de 9B de la familia Qwen | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Modelo comunitario sin documentación de entrenamiento: no hay información sobre datos, tokens ni proceso de alineamiento, lo que impide evaluar sesgos de forma rigurosa.
- Abliteración: la eliminación de las capas de rechazo puede aumentar la probabilidad de generar contenido dañino, ilegal o inseguro; no es apto para despliegues de cara al público sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de este tamaño y agravado por la falta de benchmarks publicados que permitan acotar su fiabilidad.
- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Contexto: se desconoce la longitud máxima de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- Calidad de cuantizaciones extremas: las variantes IQ1 e IQ2 degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y de las obligaciones de atribución.
- Repositorio de 110,2 GB: aloja todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-i1-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MiMo-Ornith-9B-AGSI-Abliterated-HQ-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
