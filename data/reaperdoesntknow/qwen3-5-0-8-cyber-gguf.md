# reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF

## Resumen

Qwen3.5-0.8-Cyber-GGUF es una distribucion en formato GGUF del modelo base Qwen/Qwen3.5-0.8B, publicada por el usuario reaperdoesntknow bajo el paraguas de su coleccion "CIx cybersecurity models". No se trata de un modelo entrenado desde cero, sino de una conversion y cuantizacion del checkpoint original de Qwen, orientada a inferencia local en entornos con recursos limitados (CPU, GPUs de gama baja, dispositivos edge). El repositorio incluye una escalera de cuantizaciones que va desde BF16 hasta Q2_K_L, lo que permite ajustar el equilibrio entre huella de memoria y calidad de salida.

El modelo base es un transformer denso de aproximadamente 752 millones de parametros, con licencia Apache-2.0, lo que facilita su uso comercial y su redistribucion. La etiqueta "Cyber" debe interpretarse como el nombre de la variante del repositorio, no como una garantia de capacidades especializadas en ciberseguridad: la propia model card aclara que no se documenta el dataset de fine-tuning ni se publican resultados de evaluacion. Es relevante ahora porque permite probar un modelo Qwen3.5 de ultima generacion en hardware modesto con un esfuerzo de despliegue minimo.

La relevancia practica del repositorio esta en su utilidad como banco de pruebas reproducible de cuantizaciones: al ofrecer seis variantes del mismo checkpoint, permite medir de forma controlada como afecta cada nivel de cuantizacion a la calidad, la latencia y el consumo de memoria. Con 7.039 descargas y un tamano de repo de 4,4 GB, es un artefacto pensado para experimentacion local mas que para despliegues de produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-0.8B); detalles de atencion no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M, Q2_K_L; ademas BF16-mmproj (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (conversion via Unsloth / llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer denso de 752 millones de parametros. La informacion disponible no detalla la configuracion interna (numero de capas, dimensiones de atencion, tipo de positional encoding ni si emplea atencion lineal o hibrida), por lo que esos extremos se consideran no disponibles. El repositorio es una conversion a GGUF del checkpoint original, realizada con las herramientas de Unsloth y llama.cpp, y posteriormente cuantizada en varios niveles.

No se documenta el dataset de fine-tuning, el numero de tokens de entrenamiento, la composicion de los datos ni si hubo etapas de RLHF o DPO. La model card indica explicitamente que la receta de entrenamiento no esta publicada en los ficheros revisados. La unica innovacion tecnica verificable en este repositorio es la propia escalera de cuantizaciones y la presencia de un artefacto `mmproj` (proyector multimodal) en BF16, que sugiere que la configuracion del modelo incluye componentes de vision, aunque el autor advierte que la ruta multimodal de extremo a extremo no ha sido validada para esta release.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y la etiqueta `conversational` sugiere uso en dialogos multi-turno.
- Razonamiento y codigo: capacidades heredadas del modelo base Qwen3.5-0.8B; no se publican evaluaciones especificas en este repositorio.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Vision: el repositorio incluye un fichero `mmproj` en BF16 y la configuracion contiene componentes de vision, pero la ruta multimodal no esta validada segun el autor.
- Modo "thinking": no documentado.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante infraestructura compatible con la API de endpoints.

## Casos de uso

- Prototipado local en CPU: con la variante Q4_K_M (529 MB) o Q2_K_L (484 MB), el modelo puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp u Ollama, lo que permite iterar en el diseno de prompts sin coste de infraestructura.
- Comparacion reproducible de cuantizaciones: al disponer de BF16, Q8_0, Q6_K, Q4_K_M y Q2_K_L del mismo checkpoint, un equipo puede medir la degradacion de calidad y la ganancia de velocidad de cada nivel sobre su propio conjunto de evaluacion.
- Experimentacion en dispositivos edge: la huella de 484-812 MB permite desplegar el modelo en placas con memoria limitada (por ejemplo, SBC con 4-8 GB de RAM) para tareas de clasificacion de texto o generacion corta.
- Generacion de texto asistida en herramientas de escritorio: integracion via API compatible con endpoints para autocompletado, resumen o reformulacion en aplicaciones locales.
- Educacion e investigacion: estudio del impacto de la cuantizacion en modelos pequenos de la familia Qwen3.5, con un artefacto ligero y de licencia permisiva.
- Base para fine-tuning posterior: al ser Apache-2.0 y de tamano reducido, sirve como punto de partida para ajuste en dominios concretos (soporte, documentacion tecnica) en hardware de una sola GPU.
- Pruebas de concepto de vision (con cautela): el `mmproj` incluido permite experimentar con entrada de imagenes, aunque requiere verificacion local previa antes de cualquier uso serio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion ni lineas base de comparacion en el repositorio.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun variante:
  - BF16: ~1,52 GB de pesos; requiere en torno a 2-3 GB de memoria total con overhead de contexto.
  - Q8_0: ~812 MB de pesos; en torno a 1,5-2 GB con contexto moderado.
  - Q6_K: ~630 MB de pesos; en torno a 1,2-1,5 GB.
  - Q4_K_M: ~529 MB de pesos; en torno a 1-1,3 GB (opcion recomendada por el autor).
  - Q2_K_L: ~484 MB de pesos; en torno a 0,9-1,2 GB, con mayor perdida de calidad.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) puede ejecutar las variantes cuantizadas; en A100/H100 el modelo queda sobredimensionado para su capacidad y solo tiene sentido en escenarios de multiplexacion masiva.
- Cabe en GPU consumer: si, en todas las variantes; incluso en iGPU y CPU exclusivamente.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ... --jinja`), Ollama (`ollama run hf.co/...`), y servidores compatibles con endpoints; vLLM y TGI no estan documentados para este artefacto GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8-Cyber-GGUF (este) | 752 M | no disponible | GGUF (multiples cuantizaciones) | Apache-2.0 | Conversion comunitaria del base Qwen3.5-0.8B con escalera de cuantizaciones |
| Qwen/Qwen3.5-0.8B (base) | 752 M | no disponible | safetensors (original) | Apache-2.0 | Checkpoint original; maxima fidelidad, requiere conversion para llama.cpp |
| Otros modelos pequenos de la familia Qwen3.5 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de variantes comparables en la informacion proporcionada |
| Alternativas de ~1B en GGUF de otros fabricantes | no disponible | no disponible | GGUF | variable | No se dispone de datos verificados en la informacion proporcionada |

La comparacion cuantitativa con alternativas de la misma categoria no puede completarse porque no se han publicado benchmarks ni especificaciones de contexto en la informacion disponible.

## Limitaciones y advertencias

- La etiqueta "Cyber" no implica capacidades verificadas en ciberseguridad; es el nombre de la variante del repositorio.
- No se documenta el dataset de fine-tuning ni la receta de entrenamiento, lo que impide auditar sesgos o procedencia de los datos.
- No hay resultados de benchmarks publicados; el rendimiento real debe medirse localmente.
- La cuantizacion reduce el uso de memoria pero puede degradar la calidad de salida, especialmente en Q2_K_L.
- La ruta multimodal (fichero `mmproj`) no esta validada de extremo a extremo segun el autor; verificar la entrada de imagenes antes de depender de ella.
- Riesgo de alucinacion, salidas incorrectas, incompletas, sesgadas o inseguras, segun advierte la propia model card.
- No debe usarse como fuente autoritativa para decisiones de seguridad, legales, medicas u operativas.
- Licencia Apache-2.0: permite uso comercial y redistribucion, pero conviene conservar los avisos de licencia y atribucion al modelo base Qwen.
- Idiomas soportados no documentados; el comportamiento multilingue debe validarse empiricamente.
- Longitud de contexto no disponible; planificar los prompts con margen y verificar el limite real en llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Coleccion CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
