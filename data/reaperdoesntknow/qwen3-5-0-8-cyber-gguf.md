# reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF

## Resumen

Qwen3.5-0.8-Cyber-GGUF es una distribucion en formato GGUF del modelo base Qwen/Qwen3.5-0.8B, publicada por el usuario reaperdoesntknow dentro de su coleccion de modelos orientados a ciberseguridad (CIx). El repositorio no entrena un modelo nuevo: empaqueta el modelo base en una escalera de cuantizaciones (BF16, Q8_0, Q6_K, Q4_K_M y Q2_K_L) pensada para inferencia local en llama.cpp y Ollama, e incluye ademas un artefacto `mmproj` en BF16 que sugiere una ruta multimodal.

El modelo base pertenece a la familia Qwen3.5 de Alibaba, con 752.393.024 parametros reales segun los safetensors del modelo original, lo que lo situa en la categoria de modelos ultracompactos para edge. La etiqueta "Cyber" debe interpretarse como nombre de variante del repositorio y no como una capacidad verificada: la propia model card advierte que no se documenta el dataset de ajuste fino ni se publican resultados de evaluacion.

Su relevancia actual es practica: ofrece una forma reproducible de comparar niveles de cuantizacion de un modelo Qwen3.5 pequeno en hardware limitado, con licencia Apache-2.0 y compatibilidad con endpoints. No obstante, al no haber benchmarks ni receta de entrenamiento publicados, cualquier afirmacion sobre calidad o especializacion en ciberseguridad carece de respaldo documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5; la model card no detalla la arquitectura interna) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M, Q2_K_L (mas un `mmproj` BF16 de 207 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (conversion via Unsloth / llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen3.5-0.8B: la model card del repositorio se limita a indicar que se trata de un modelo Qwen3.5 de 0,8B y que la conversion a GGUF se realizo con herramientas de Unsloth y llama.cpp. No se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones, ni se detalla la composicion del dataset de preentrenamiento.

Respecto al ajuste fino, la model card es explicita: los ficheros publicos no documentan el dataset ni la receta de entrenamiento, y no se publican resultados de evaluacion. Por tanto, no es posible confirmar si el modelo ha recibido RLHF, DPO, SFT o ninguna de estas etapas, ni si la etiqueta "Cyber" corresponde a un ajuste especifico en dominio de ciberseguridad. El unico dato verificable sobre el proceso es la existencia de la escalera de cuantizaciones y del proyector multimodal en BF16.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` y el pipeline `text-generation`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Inferencia local en llama.cpp y Ollama, con soporte de plantillas Jinja (`--jinja`).
- Ruta multimodal potencial: el repositorio incluye un `mmproj` BF16 y la configuracion incluye componentes de vision, pero la model card advierte que no se ha validado el camino multimodal de extremo a extremo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta cumplimentado).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado en hardware limitado: ejecutar el modelo con la cuantizacion Q4_K_M (529 MB) o Q2_K_L (484 MB) en equipos sin GPU dedicada, usando llama.cpp u Ollama, para validar flujos conversacionales antes de escalar a modelos mayores.
- Comparacion reproducible de cuantizaciones: al incluir BF16, Q8_0, Q6_K, Q4_K_M y Q2_K_L del mismo modelo base, permite medir la degradacion de calidad y el ahorro de memoria entre niveles en un mismo pipeline de evaluacion.
- Asistentes conversacionales ligeros en el borde: desplegar un chatbot de bajo consumo en entornos con restricciones de memoria, aceptando las limitaciones de un modelo de 0,8B.
- Generacion de texto offline: procesamiento por lotes de textos en maquinas aisladas o sin conectividad, aprovechando el formato GGUF y la licencia Apache-2.0.
- Educacion y experimentacion: estudiar el efecto de la cuantizacion en las salidas de un modelo Qwen3.5 pequeno dentro de cursos o talleres de IA local.
- Pruebas de integracion con endpoints compatibles: validar pipelines que consumen APIs compatibles con OpenAI usando un modelo local barato antes de cambiar a un modelo mayor.
- Exploracion multimodal condicionada: probar la entrada de imagenes con el `mmproj` incluido, verificando previamente de forma local que la ruta multimodal funciona, tal como recomienda el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el repositorio no incluye resultados de evaluacion ni lineas base de comparacion.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun variante: BF16 ~1,52 GB; Q8_0 ~812 MB; Q6_K ~630 MB; Q4_K_M ~529 MB; Q2_K_L ~484 MB; `mmproj` BF16 ~207 MB adicional si se usa la ruta multimodal.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU consumer con al menos 2 GB de VRAM libre deberia poder alojar las variantes cuantizadas, pero esto no esta verificado en la documentacion.
- Cabe en GPU consumer: previsiblemente si en la mayoria de GPU consumer modernas con las cuantizaciones Q4_K_M o Q2_K_L; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ... --jinja`) y Ollama (`ollama run hf.co/...:Q4_K_M`). Otros motores (vLLM, TGI) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8-Cyber-GGUF (este) | 752.393.024 | no disponible | GGUF (5 cuantizaciones + mmproj) | Apache-2.0 | Distribucion cuantizada de Qwen3.5-0.8B con etiqueta "Cyber" no verificada |
| Qwen/Qwen3.5-0.8B (base) | 752.393.024 | no disponible | safetensors | Apache-2.0 | Modelo original sin cuantizar; referencia de maxima fidelidad |
| Otras variantes GGUF de Qwen3.5-0.8B | 752.393.024 | no disponible | GGUF | Apache-2.0 (heredada) | No se dispone de datos especificos en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La etiqueta "Cyber" no esta respaldada por documentacion de dataset, receta de entrenamiento ni evaluacion; no debe asumirse una especializacion real en ciberseguridad.
- No se publican benchmarks ni lineas base, por lo que no es posible comparar su calidad con alternativas de forma objetiva.
- La cuantizacion reduce el uso de memoria pero puede alterar la calidad de las salidas; los efectos concretos no estan medidos en el repositorio.
- La ruta multimodal no esta validada de extremo a extremo; el `mmproj` presente no garantiza que la entrada de imagen funcione correctamente.
- El autor advierte que el modelo no debe usarse como fuente autoritativa para decisiones de seguridad, legales, medicas u operativas.
- Riesgo de alucinacion, sesgos y salidas incorrectas, incompletas o inseguras: reconocido explicitamente en la model card.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-0.8B; conviene revisar la licencia del modelo original antes de desplegar en produccion.
- El repositorio tiene muy poca traccion social (2 likes) y no procede de un canal oficial de Qwen, lo que reduce la garantia de mantenimiento y soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Coleccion CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
- llama.cpp: no disponible en la informacion proporcionada (referenciado por el autor, sin URL)
- Ollama: no disponible en la informacion proporcionada (referenciado por el autor, sin URL)
- Unsloth: no disponible en la informacion proporcionada (referenciado por el autor, sin URL)
