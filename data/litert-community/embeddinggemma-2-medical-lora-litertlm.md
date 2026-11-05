# litert-community/embeddinggemma-2-medical-lora-litertlm

## Resumen

`litert-community/embeddinggemma-2-medical-lora-litertlm` es un artefacto educativo publicado por la comunidad LiteRT en HuggingFace. Consiste en un ajuste fino mediante LoRA del modelo de embeddings EmbeddingGemma 2 sobre un pequeno conjunto de datos sintetico de recuperacion (retrieval) de ambito medico, posteriormente convertido al formato `.litertlm` para su ejecucion con el runtime LiteRT-LM de Google. No se trata de un modelo generativo de proposito general, sino de un modelo de representaciones vectoriales (embeddings) destinado a tareas de busqueda semantica y recuperacion de informacion.

El modelo se publica explicitamente como una demostracion tecnica creada para acompanar un tutorial en Colab sobre ajuste fino con LoRA y conversion a `.litertlm`. El propio autor advierte que se distribuye "tal cual", sin garantia, y que no es un benchmark oficial ni un modelo listo para produccion. Ademas, incluye un aviso no clinico: no debe usarse para diagnostico, toma de decisiones medicas ni atencion a pacientes.

La relevancia de esta ficha es acotada: sirve como referencia para entender el flujo de trabajo de fine-tuning LoRA sobre EmbeddingGemma 2 y su empaquetado en LiteRT-LM para despliegue en dispositivos, pero no debe confundirse con un modelo medico validado. El repositorio ocupa 2.0 GB y acumula 13 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de embeddings; ajuste fino con LoRA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato `.litertlm`; el autor no detalla variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.litertlm` (runtime LiteRT-LM); el repo incluye tambien safetensors segun los tags |

## Arquitectura y entrenamiento

El modelo parte de EmbeddingGemma 2, un modelo de embeddings del que no se detallan en la informacion disponible ni el numero de parametros ni la arquitectura interna. Sobre esa base se aplica un ajuste fino con LoRA (Low-Rank Adaptation), una tecnica que congela los pesos originales e introduce matrices de bajo rango entrenables, reduciendo el coste computacional y de memoria del entrenamiento. El dataset empleado es un conjunto sintetico de recuperacion de ambito medico, de tamano reducido y sin publicacion de su composicion ni numero de pares o tripletas.

Tras el ajuste, el modelo se convierte al formato `.litertlm`, el contenedor de modelos de LiteRT-LM orientado a inferencia en dispositivo (on-device) con el runtime de Google. No se especifican en la informacion disponible detalles sobre el proceso de entrenamiento (epocas, hiperparametros LoRA, funcion de perdida), ni si hubo etapas de RLHF o DPO, algo poco habitual en modelos de embeddings. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion de informacion (retrieval).
- Ajuste orientado a dominio medico mediante LoRA sobre un dataset sintetico de recuperacion.
- Ejecucion en dispositivo mediante el runtime LiteRT-LM (formato `.litertlm`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No se documentan modos especiales (thinking mode, vision, audio).
- Al ser un modelo de embeddings, no genera texto libre; produce representaciones vectoriales.

## Casos de uso

- Demostracion educativa de fine-tuning LoRA: el modelo sirve como ejemplo practico para reproducir el flujo completo de ajuste fino y conversion a `.litertlm` descrito en el tutorial de Colab de LiteRT-LM.
- Prototipado de busqueda semantica en dispositivo: permite experimentar con recuperacion de documentos en local usando el runtime LiteRT-LM, util para validar la viabilidad de embeddings on-device antes de invertir en un modelo de produccion.
- Evaluacion de pipelines de conversion de formato: sirve para comprobar como se comporta un modelo de embeddings ajustado tras la conversion a `.litertlm` y verificar la paridad de resultados frente al modelo original.
- Pruebas de integracion con LiteRT-LM: util para desarrolladores que quieran validar la API del runtime con un artefacto real de embeddings antes de desplegar modelos propios.
- Docencia y talleres: adecuado como material de clase para ilustrar las diferencias entre un modelo base y su version ajustada con LoRA en tareas de recuperacion.
- Investigacion metodologica sobre datasets sinteticos: permite estudiar como afecta un corpus sintetico pequeno al comportamiento de los embeddings, siempre en un contexto controlado y no clinico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano del modelo base EmbeddingGemma 2, no documentado en la informacion proporcionada).
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime LiteRT-LM (formato `.litertlm`), orientado a inferencia en dispositivo; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| embeddinggemma-2-medical-lora-litertlm | no disponible | no disponible | `.litertlm` + safetensors | no disponible | Embeddings medicos (demo) |
| EmbeddingGemma 2 (base) | no disponible | no disponible | no disponible | no disponible | Embeddings de proposito general |
| Alternativas de embeddings on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- El autor declara explicitamente que es un artefacto educativo, distribuido "tal cual" y sin garantia de ningun tipo.
- No es un modelo de produccion ni un benchmark oficial; no debe emplearse como referencia de rendimiento.
- Aviso no clinico: no esta destinado a diagnostico, decision clinica ni atencion a pacientes.
- El ajuste se realizo sobre un dataset sintetico pequeno, por lo que el comportamiento en dominios reales es incierto y potencialmente sesgado hacia los patrones del corpus sintetico.
- Riesgo de alucinacion y de recuperacion irrelevante: al ser un modelo de embeddings, puede devolver vecinos semanticos incorrectos, especialmente fuera del dominio de entrenamiento.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue.
- Licencia no disponible: debe verificarse antes de cualquier uso comercial, ya que la informacion publicada no la especifica.
- Longitud de contexto no documentada: limita la planificacion de pipelines con documentos largos.
- Formato `.litertlm` restringe el despliegue al runtime LiteRT-LM; no hay evidencia de compatibilidad con otros motores de inferencia.
- El repositorio tiene un volumen de descargas muy bajo (13) y ningun "like", lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/embeddinggemma-2-medical-lora-litertlm
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
