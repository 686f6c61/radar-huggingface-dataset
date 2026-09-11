# CobrIX/CobrIX-1.5-preview-Coder-Full-72B-A18B-GGUF

## Resumen

CobrIX-1.5-preview-Coder-Full-72B-A18B-GGUF es la version cuantizada en formato GGUF del modelo CobrIX-1.5-preview-Coder-Full-72B-A18B, desarrollado por CobrIX, un proyecto de infraestructura abierta de IA y research de modelos personalizados. Se trata de un decoder con arquitectura de mezcla de expertos (MoE) de aproximadamente 72.000 millones de parametros totales y unos 18.000 millones de parametros activos por token, distribuidos en 13 expertos, segun la model card del autor. El modelo esta orientado a generacion de codigo y a tareas de ciberseguridad, y ha sido alineado con DPO y reforzado con SFT sobre esos dominios.

El repositorio publicado contiene unicamente los pesos cuantizados (no los pesos completos en precision original), con dos variantes disponibles: Q5_K_M (47,5 GB) y Q4_K_M (40,7 GB). La plantilla de chat es ChatML (`<|im_start|>` / `<|im_end|>`), lo que facilita su integracion en herramientas como Ollama o llama.cpp. Los idiomas declarados son ingles y portugues.

Se trata de una version de vista previa ("PREVIEW 1.5") cuyo proposito declarado es servir de material de prueba antes de la publicacion final, que segun el autor incluira think-SFT, MTP nativo y cuantizaciones actualizadas. Es relevante ahora porque permite evaluar un MoE de gran tamano especializado en codigo y seguridad en hardware de gama alta sin necesidad de los pesos completos, aunque no se han publicado resultados de benchmarks ni datos detallados de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con mezcla de expertos (MoE), 13 expertos |
| Parametros totales | 71.769.534.976 (~72B) |
| Parametros activos | ~18B por token |
| Longitud de contexto | no disponible (el ejemplo de la model card configura `num_ctx 8192`) |
| Tipos de cuantizacion | GGUF: Q5_K_M y Q4_K_M |
| Idiomas soportados | Ingles (en) y portugues (pt) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un decoder de mezcla de expertos con 13 expertos, aproximadamente 72.000 millones de parametros totales y unos 18.000 millones de parametros activos por token, segun la model card. El tag `qwen3-5` presente en el repositorio sugiere un linaje basado en la familia Qwen3, aunque esta filiacion no se confirma de forma explicita en la informacion disponible. El modelo es conversacional y emplea la plantilla ChatML, con token de parada `<|im_end|>`.

En cuanto al entrenamiento, el autor indica que el modelo esta "DPO-aligned + SFT-reinforced for code and cybersecurity (PT/EN)", es decir, alineado mediante DPO y reforzado con ajuste supervisado especificamente en codigo y ciberseguridad para portugues e ingles. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RL. La nota de la model card adelanta que la version final incorporara think-SFT, MTP (multi-token prediction) nativo y cuantizaciones actualizadas, lo que implica que la presente version no incluye esas caracteristicas.

## Capacidades

- Generacion de codigo en ingles y portugues, con especial enfasis declarado en el dominio de programacion.
- Tareas de ciberseguridad: el autor cita explicitamente contenidos como explicacion y mitigacion de inyeccion SQL en sus ejemplos de uso.
- Generacion de texto general de tipo conversacional (el repositorio esta marcado como "conversational").
- Soporte multilingue limitado a ingles y portugues segun los metadatos de idioma.
- Compatibilidad con la plantilla ChatML, lo que permite uso con system prompt, turnos de usuario y turnos de asistente.
- Inferencia local mediante llama.cpp y Ollama gracias al formato GGUF.
- Modo "thinking": no disponible en esta version; el autor indica que el think-SFT llegara en la version final.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Revision de codigo en pipelines de CI/CD: el modelo puede analizar diffs y proponer correcciones en ingles o portugues, integrándose en un paso de pre-merge siempre que se despliegue con llama.cpp o un servidor compatible con GGUF.
- Deteccion y explicacion de vulnerabilidades: dado su ajuste declarado en ciberseguridad, puede generar explicaciones de fallos como inyeccion SQL, XSS o desbordamientos, y proponer mitigaciones para equipos de AppSec.
- Asistente de desarrollo en local para equipos con hardware de gama alta: con la cuantizacion Q4_K_M (40,7 GB) se puede servir en una estacion de trabajo con 48 GB o mas de VRAM/RAM y mantener el codigo dentro de la organizacion.
- Generacion de pruebas unitarias y documentacion tecnica: el modelo puede producir tests y docstrings a partir de fragmentos de codigo, aprovechando sus ~18B parametros activos para mantener coste de inferencia relativamente bajo respecto a un modelo denso de 72B.
- Soporte tecnico en portugues e ingles: atencion a desarrolladores lusofonos que necesitan respuestas tecnicas en su idioma nativo, con la plantilla ChatML para gestionar el contexto de conversacion.
- Formacion y concienciacion en seguridad: generacion de ejemplos controlados de codigo vulnerable y su version corregida para materiales de entrenamiento interno, siempre con supervision humana.
- Traduccion tecnica EN-PT de documentacion y comentarios de codigo: el modelo cubre ambos idiomas de forma nativa segun los metadatos declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MBPP ni de evaluaciones de ciberseguridad, y la busqueda web realizada no aporto datos adicionales. El autor describe la version como "PREVIEW 1.5 — GGUF quants for testing", sin acompanar metricas.

## Requisitos de hardware

- VRAM/RAM estimada para Q5_K_M: aproximadamente 50 GB (fichero de 47,5 GB).
- VRAM/RAM estimada para Q4_K_M: aproximadamente 43 GB (fichero de 40,7 GB).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para carga completa en una sola GPU; tambien validas configuraciones multi-GPU.
- Configuraciones consumer: no cabe completo en una GPU de 16 GB; el autor indica que con 16 GB de VRAM hay que recurrir a offload parcial a CPU. Una RTX 4090 o RTX 3090 de 24 GB permitiria solo offload parcial; dos o mas GPU consumer de 24 GB podrian acercarse a la carga completa con Q4_K_M.
- Opciones de despliegue documentadas: llama.cpp (`llama-cli` con `--jinja`) y Ollama mediante Modelfile con plantilla ChatML y `num_ctx 8192`.
- Otros servidores compatibles con GGUF (por ejemplo, servidores basados en llama.cpp) son tecnicamente viables, pero no estan documentados por el autor.
- vLLM y TGI: no disponibles en la informacion proporcionada, ya que estos motores trabajan habitualmente con safetensors y no con GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE con ~18B parametros activos, el coste por token sera inferior al de un modelo denso de 72B, pero no hay cifras publicadas.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de modelos comparables, por lo que la comparacion se limita a caracteristicas estructurales verificables. Modelos de categoria similar serian otros MoE abiertos orientados a codigo; no obstante, no se dispone de sus cifras en el material aportado.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CobrIX-1.5-preview-Coder-Full-72B-A18B | ~72B (71.769.534.976) | ~18B | no disponible | MIT | GGUF (Q5_K_M, Q4_K_M) en HuggingFace |
| Alternativas MoE de codigo comparables | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas densas de ~70B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible modelos comparables concretos con datos verificables, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Version de vista previa: el propio autor la etiqueta como "PREVIEW 1.5 — GGUF quants for testing" y anuncia que la version final incluira think-SFT, MTP nativo y cuantizaciones actualizadas. No es recomendable como base estable de produccion sin validacion previa.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento en codigo, matematicas, razonamiento o ciberseguridad.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad. En dominios de ciberseguridad, una respuesta incorrecta puede tener consecuencias graves si se aplica sin revision humana.
- Cobertura idiomatica limitada: solo ingles y portugues declarados; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no especificada: la model card solo muestra `num_ctx 8192` como parametro de ejemplo, no como maximo del modelo. Usar contextos mayores sin confirmacion puede degradar la calidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y publicado el 11 de septiembre de 2026: no existe validacion por parte de la comunidad.
- Trazabilidad limitada: no se detallan tokens de entrenamiento, composicion del dataset ni procedencia exacta de los datos, lo que dificulta auditar sesgos.
- Uso comercial: la licencia MIT lo permite, pero se aplica al artefacto publicado; conviene verificar la licencia del modelo base por si impone condiciones adicionales a los pesos derivados.
- Requisitos de hardware elevados: alrededor de 43-50 GB de VRAM/RAM, fuera del alcance de la mayoria de equipos de consumo sin offload parcial y con la consiguiente penalizacion de latencia.
- Soporte de tool calling y de agentes no confirmado, lo que limita su uso en flujos automatizados que dependan de function calling.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/CobrIX/CobrIX-1.5-preview-Coder-Full-72B-A18B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/CobrIX/CobrIX-1.5-preview-Coder-Full-72B-A18B
- Contacto de feedback indicado en la model card: suporte.cobrix@gmail.com
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
