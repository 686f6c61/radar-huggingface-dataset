# mradermacher/Tiamat-24B-Magistral-PaperWitch-heresy-GGUF

## Resumen

Tiamat-24B-Magistral-PaperWitch-heresy-GGUF es la version cuantizada en formato GGUF del modelo MuXodious/Tiamat-24B-Magistral-PaperWitch-heresy, publicada por el usuario mradermacher, especializado en la conversion de pesos a GGUF para inferencia local. Se trata de un fine-tune orientado a rol conversacional y escritura creativa sin restricciones de contenido, construido sobre una base de la familia Magistral de 24B (23.572.403.200 parametros reales segun safetensors) y ajustado presumiblemente con Axolotl, segun las etiquetas del repositorio.

El modelo resulta relevante para quien necesita ejecutar un modelo de ~24B en hardware de consumo sin depender de APIs externas, ya que el repositorio ofrece 11 niveles de cuantizacion que van de 9,0 GB (Q2_K) a 25,2 GB (Q8_0), ademas de dos ficheros mmproj que apuntan a entrada multimodal. La etiqueta "abliterated" y "heresy" indica que se han aplicado tecnicas de eliminacion de rechazos (abliteration) y fusion de pesos, por lo que el modelo no incorpora alineamiento de seguridad y genera contenido que otros modelos rechazarian.

La licencia es Apache 2.0, lo que permite uso comercial, pero la ausencia total de benchmarks publicados, la falta de documentacion sobre la arquitectura del modelo base y el caracter no censurado del ajuste obligan a evaluar el modelo con cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base no documenta la arquitectura en la informacion proporcionada; el recuento de parametros corresponde a la clase de 24B) |
| Parametros totales | 23.572.403.200 (~23,57 mil millones) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |
| Modelo base | MuXodious/Tiamat-24B-Magistral-PaperWitch-heresy |
| Tamano del repositorio | 162,8 GB |
| Descargas | 603 |
| Likes | 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los indicios indirectos son los siguientes: el recuento de parametros (23,57 mil millones) y el nombre del modelo base (Mistral/Magistral 24B) apuntan a un transformer decoder-only de la familia Magistral, pero no se confirma en la documentacion accesible. El repositorio incluye dos ficheros mmproj (proyector multimodal), lo que sugiere que el modelo base incorpora un codificador visual y admite entrada de imagenes en llama.cpp, si bien la model card no lo declara de forma explicita.

En cuanto al entrenamiento, las etiquetas del repositorio indican: `finetune`, `axolotl`, `roleplay`, `heretic`, `uncensored`, `decensored` y `abliterated`. Esto implica que el modelo original fue ajustado (probablemente con Axolotl) sobre una base Magistral de 24B y posteriormente sometido a tecnicas de abliteration y fusion de pesos ("heresy") para eliminar comportamientos de rechazo. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. El trabajo realizado por mradermacher en este repositorio es exclusivamente de cuantizacion: no hay reentrenamiento, sino conversion de los pesos originales a formatos K-quant e IQ-quant de llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, con orientacion declarada a roleplay e interaccion de personaje.
- Escritura creativa y narrativa extensa, favorecida por el ajuste de rol y por el tamano de 24B.
- Generacion de contenido sin restricciones tematicas: el ajuste abliterated elimina los rechazos tipicos de los modelos alineados, lo que incluye temas adultos, violencia explicita y lenguaje soez.
- Presunta capacidad multimodal de entrada (imagenes) segun la presencia de los ficheros mmproj; no confirmada formalmente en la model card.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado); el nombre del modelo base sugiere herencia de un modelo de razonamiento, pero no hay confirmacion.
- Capacidades multilingues: limitadas al ingles segun la model card; el rendimiento en castellano no esta documentado.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Roleplay y ficcion interactiva local: el modelo esta ajustado especificamente para interpretar personajes y mantener conversaciones largas sin filtros de contenido; se ejecutaria con llama.cpp u Ollama sobre una GPU de 24 GB con cuantizacion Q4_K_M (14,4 GB), lo que permite sesiones privadas sin enviar datos a terceros.
- Escritura creativa asistida para novela, guion o genero adulto: la ausencia de rechazos permite trabajar tramas y dialogos que los modelos alineados bloquean, y el nivel Q6_K (19,4 GB) preserva mejor el estilo que las cuantizaciones bajas, a costa de exigir mas VRAM.
- Generacion de datasets sinteticos de dialogo para fine-tuning: se puede usar el modelo para producir corpus conversacionales en ingles de tematica abierta, con la advertencia de que habra que filtrar el contenido generado antes de reutilizarlo.
- Red teaming y evaluacion de seguridad: util como modelo de referencia para medir hasta que punto un sistema de moderacion detecta contenido problematico, dado que su comportamiento abliterated produce respuestas que los modelos alineados no generan.
- Motor de personajes para videojuegos o aplicaciones de chatbot con personalidad propia: la combinacion de 24B de parametros y ajuste de rol permite mantener coherencia de personaje en conversaciones largas; el despliegue se haria con llama.cpp sobre una sola GPU o con servidor local compatible con la API de OpenAI (el repositorio esta marcado como `endpoints_compatible`).
- Inferencia en hardware de consumo con VRAM limitada: las cuantizaciones Q2_K (9,0 GB) y Q3_K_S (10,5 GB) permiten ejecutar el modelo en GPU de 12 GB (RTX 3060, RTX 4070) con el consiguiente deterioro de calidad.
- Prototipado offline en portatiles con memoria unificada: en equipos Apple Silicon con 32 GB o 64 GB se puede cargar Q5_K_M (16,9 GB) o Q6_K (19,4 GB) y trabajar sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de roleplay, y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo (los resultados obtenidos correspondian a calculadoras y paginas no relacionadas).

## Requisitos de hardware

- VRAM estimada por cuantizacion (solo pesos, sin contar el contexto): Q2_K 9,0 GB; Q3_K_S 10,5 GB; Q3_K_M 11,6 GB; Q3_K_L 12,5 GB; IQ4_XS 13,0 GB; Q4_K_S 13,6 GB; Q4_K_M 14,4 GB; Q5_K_S 16,4 GB; Q5_K_M 16,9 GB; Q6_K 19,4 GB; Q8_0 25,2 GB.
- Ficheros multimodales opcionales: mmproj-Q8_0 0,6 GB y mmproj-f16 1,0 GB adicionales si se usa entrada de imagenes.
- GPU de 24 GB (RTX 3090, RTX 4090, A5000): Q4_K_M y Q5_K_M caben con contexto amplio; Q8_0 (25,2 GB) no cabe y requiere offload parcial a RAM.
- GPU de 12 GB (RTX 3060, RTX 4070): solo Q2_K y Q3_K_S caben completos; el resto necesita descarga parcial de capas a CPU.
- GPU profesionales (A100 40/80 GB, H100): permiten cargar Q8_0 o los pesos f16 originales del modelo base con contexto largo, aunque no hay datos de throughput publicados para este modelo concreto.
- Apple Silicon: con 32 GB de memoria unificada se puede ejecutar hasta Q5_K_M; con 64 GB, Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier servidor compatible con GGUF; el tag `endpoints_compatible` indica compatibilidad con la API de endpoints tipo OpenAI. vLLM y TGI no estan documentados para este repositorio, aunque vLLM soporta GGUF de forma experimental.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| Tiamat-24B-Magistral-PaperWitch-heresy-GGUF (este) | 23,57 B | no disponible | GGUF (11 cuantizaciones + 2 mmproj) | apache-2.0 | Version cuantizada estatica; 603 descargas |
| MuXodious/Tiamat-24B-Magistral-PaperWitch-heresy (original) | 23,57 B | no disponible | safetensors | apache-2.0 | Pesos completos; requiere transformers o conversion propia a GGUF |
| mradermacher/Tiamat-24B-Magistral-PaperWitch-heresy-i1-GGUF | 23,57 B | no disponible | GGUF (cuantizaciones con imatrix) | apache-2.0 | Mismo autor; cuantizaciones ponderadas con importance matrix, habitualmente de mayor calidad que las estaticas |
| Alternativas de terceros de ~24B sin censura | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion fiable |

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: el ajuste abliterated/decensored elimina los mecanismos de rechazo, por lo que el modelo generara contenido ofensivo, violento, sexual explicito o potencialmente ilegal si se le solicita. No es apto para aplicaciones de cara al publico sin una capa de moderacion externa.
- Sesgos conocidos: no hay estudios de sesgo publicados para este modelo; los modelos base de la familia y los corpus web en ingles introducen sesgos de genero, raza y cultura que el proceso de abliteration no corrige y puede incluso amplificar.
- Riesgo de alucinacion: no existe ninguna evaluacion de factualidad publicada. Como en cualquier modelo de 24B sin datos de benchmarks, la tasa de alucinacion es desconocida y debe asumirse elevada en tareas de conocimiento factual.
- Limitacion idiomatica: la model card declara unicamente ingles. El rendimiento en castellano no esta documentado y previsiblemente sera inferior, especialmente en matices culturales y en roleplay.
- Longitud de contexto desconocida: no se especifica la ventana de contexto del modelo base ni si la cuantizacion la preserva integra; planificar despliegues con contexto largo es arriesgado sin pruebas propias.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el contenido generado por un modelo sin alineamiento es responsabilidad del operador; en la UE, el uso de estos modelos debe cumplir el Reglamento de IA en lo relativo a transparencia y a contenidos ilicitos.
- Perdida por cuantizacion: las cuantizaciones Q2_K y Q3_K degradan notablemente la coherencia y la calidad del texto; para roleplay se recomienda Q4_K_M o superior. Las cuantizaciones con imatrix (repositorio i1-GGUF) suelen ofrecer mejor relacion calidad/tamano.
- Naturaleza del ajuste "heresy": las fusiones agresivas de pesos pueden degradar la capacidad de seguir instrucciones complejas, el razonamiento estructurado y la coherencia a largo plazo, aunque no hay evaluaciones que lo cuantifiquen.
- Compatibilidad multimodal no verificada: la presencia de ficheros mmproj no garantiza que el proyector funcione correctamente con este merge concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Tiamat-24B-Magistral-PaperWitch-heresy-GGUF
- Modelo base: https://huggingface.co/MuXodious/Tiamat-24B-Magistral-PaperWitch-heresy
- Cuantizaciones con importance matrix: https://huggingface.co/mradermacher/Tiamat-24B-Magistral-PaperWitch-heresy-i1-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Tiamat-24B-Magistral-PaperWitch-heresy-GGUF
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede la infraestructura al cuantizador: https://www.nethype.de/
- Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos no guardaban relacion con el.
