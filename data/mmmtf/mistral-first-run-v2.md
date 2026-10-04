# mmmtf/mistral-first-run-v2

## Resumen

mmmtf/mistral-first-run-v2 es un ajuste fino subido a HuggingFace por el usuario mmmtf sobre unsloth/mistral-7b-instruct-v0.3-bnb-4bit, que a su vez es una version cuantizada a 4 bits del modelo Mistral-7B-Instruct-v0.3 de Mistral AI. Se trata, por tanto, de un derivado de segunda generacion de un transformer decoder-only de 7,25 mil millones de parametros con 32.768 tokens de contexto, entrenado aparentemente con la libreria Unsloth y el stack TRL para acelerar el proceso de fine-tuning.

El repositorio no publica informacion sobre el dataset de entrenamiento, los hiperparametros, el numero de tokens vistos ni evaluaciones de ningun tipo. La model card se limita a indicar el autor, la licencia apache-2.0 y el modelo base, ademas del sello de "entrenado 2x mas rapido con Unsloth". Con 0 descargas y 0 likes en el momento de la consulta, se trata de un checkpoint experimental sin validacion de la comunidad.

Su relevancia es, por tanto, limitada y de caracter practico: sirve como ejemplo de flujo de trabajo QLoRA + Unsloth y como punto de partida para quien quiera inspeccionar como se estructura un fine-tuning ligero sobre Mistral-7B-Instruct-v0.3, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con attention de ventana deslizante y GQA (heredada del modelo base Mistral-7B-Instruct-v0.3); no se documentan modificaciones en el ajuste fino |
| Parametros totales | 7,25 mil millones en el modelo base; no disponible para el checkpoint final de mmmtf (el tamano del repo, 0,2 GB, no corresponde a un modelo de 7B en precision completa) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | 32.768 tokens (modelo base Mistral-7B-Instruct-v0.3); no verificado en el ajuste fino |
| Tipos de cuantizacion | El modelo base se entreno en 4 bits con bitsandbytes; el repositorio no publica artefactos GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (unico idioma declarado en los metadatos y en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tarea declarada | no disponible (el campo pipeline aparece vacio) |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-10-04 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.3: un transformer decoder-only de 32 capas, dimension oculta de 4096, 32 cabezas de atencion con grouped-query attention (8 cabezas de clave/valor) y una ventana de atencion deslizante de 4096 tokens combinada con atencion completa en capas alternas, lo que permite manejar una longitud de contexto nominal de 32.768 tokens. La version v0.3 amplia el vocabulario del tokenizador hasta 32.768 entradas y anade soporte nativo de function calling mediante plantillas de chat con tokens reservados para llamadas a herramientas.

Sobre el proceso de ajuste fino no hay informacion publica: se desconoce el dataset, el numero de tokens de entrenamiento, si se aplico DPO, RLHF o simplemente SFT supervisado, y que hiperparametros se usaron. Los tags del repositorio (unsloth, trl, text-generation-inference) apuntan a un entrenamiento con QLoRA sobre el modelo base ya cuantizado a 4 bits, el flujo habitual de Unsloth para reducir el consumo de VRAM. El tamano del repositorio (0,2 GB) es coherente con un conjunto de adaptadores LoRA en lugar de un modelo fusionado completo, aunque esto no se confirma en la model card. El nombre "first-run-v2" sugiere una prueba inicial o un experimento de validacion del pipeline.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base instruct.
- Razonamiento basico y respuesta a instrucciones conversacionales de un solo turno y multi-turno, limitado por el alcance del ajuste fino, que no esta documentado.
- Generacion de codigo y resolucion de problemas matematicos basicos, en la medida en que lo permite Mistral-7B-Instruct-v0.3; no hay evaluacion especifica sobre este checkpoint.
- Soporte de function calling y tool calling a nivel de plantilla de chat, heredado de Mistral-7B-Instruct-v0.3.
- Capacidad potencial de agentes y razonamiento multi-paso con contexto largo (hasta 32.768 tokens), no verificada en este ajuste.
- Capacidades multilingues: no. El modelo declara unicamente ingles, a pesar de que el modelo base tiene cierto rendimiento en otras lenguas europeas.
- No dispone de vision, audio ni modo de razonamiento explicito ("thinking mode").

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede desplegarse con transformers o TGI para validar plantillas de prompt y flujos multi-turno antes de invertir en un modelo mayor, aprovechando los 32.768 tokens de contexto del modelo base.
- Generacion de codigo en entornos internos: con soporte de plantillas de funcion, puede integrarse en herramientas de autocompletado o revision de codigo, siempre que se valide antes su calidad, no medida en ningun benchmark publicado.
- Extraccion de informacion estructurada: el soporte de function calling del modelo base permite definir esquemas JSON y usarlos para poblar bases de datos a partir de texto libre en ingles.
- Base para fine-tuning continuado: al ser un checkpoint derivado de un modelo 4-bit ajustado con Unsloth, sirve como plantilla reproducible para experimentar con QLoRA en una GPU de consumo.
- Evaluacion de pipelines de entrenamiento: util como caso de prueba para comparar configuraciones de TRL y Unsloth en cuanto a velocidad y estabilidad de entrenamiento.
- Chatbot de documentacion tecnica interna: con contexto de 32.768 tokens puede ingerir manuales y responder preguntas concretas sobre ellos en ingles.
- Demostraciones y docencia: por su licencia permisiva y su tamano manejable, es adecuado para ilustrar el ciclo completo de publicacion de un modelo ajustado en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluacion, y el repositorio no aporta curvas de perdida ni comparaciones con el modelo base.

## Requisitos de hardware

- Los pesos publicados ocupan 0,2 GB, lo que impide dar cifras cerradas de VRAM sin conocer si son adaptadores LoRA o pesos completos. Si se trata de adaptadores, el modelo base debe cargarse aparte.
- Estimaciones para el modelo base de 7,25 mil millones de parametros en precision completa (fp16): aproximadamente 15 GB de VRAM solo para pesos, mas el cache KV.
- Cuantizado a 8 bits: aproximadamente 8 GB de VRAM.
- Cuantizado a 4 bits (bitsandbytes, GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 4-5 GB de VRAM, con cache KV adicional segun la longitud de contexto.
- GPU de consumo: cabe en 4 bits en tarjetas de 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070); en 8 bits requiere 12 GB o mas (RTX 3060 12 GB, RTX 4070); en fp16 necesita 24 GB (RTX 3090, RTX 4090, A10G).
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S permiten fp16 con contexto largo y lotes grandes.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM y PEFT si finalmente son adaptadores. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que el repositorio no ofrece.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mmmtf/mistral-first-run-v2 | no disponible (base de 7,25 mil millones) | 32.768 tokens (heredado) | apache-2.0 | Repositorio HuggingFace, 0 descargas, sin evaluacion |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.768 tokens | apache-2.0 | Modelo oficial, ampliamente validado y con soporte en vLLM, TGI y llama.cpp |
| meta-llama/Llama-3.1-8B-Instruct | 8 mil millones | 128.000 tokens | Llama 3.1 Community License (no apache) | Modelo oficial con ecosistema extenso |
| Qwen/Qwen2.5-7B-Instruct | 7,6 mil millones | 128.000 tokens | apache-2.0 | Modelo oficial con buen soporte multilingue |

Frente a los tres modelos de referencia, este checkpoint no aporta datos objetivos de mejora: carece de evaluaciones, de artefactos cuantizados y de cualquier documentacion sobre su dataset. Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican dataset, numero de tokens, hiperparametros ni metodologia de alineacion. Es imposible reproducir el entrenamiento.
- Sin evaluacion publicada: no hay ningun benchmark que permita estimar la calidad ni compararla con el modelo base.
- Riesgo de degradacion por sobreajuste o catastrofico: al entrenar sobre un modelo base ya cuantizado a 4 bits, es habitual perder capacidades generales si el dataset de ajuste es pequeno o poco diverso.
- Riesgo de alucinacion: inherente a los modelos de 7B de esta generacion, agravado por la falta de validacion. No debe usarse en dominios sensibles (medicina, derecho, finanzas) sin supervision humana.
- Idioma: solo ingles declarado. No hay garantia de comportamiento correcto en castellano ni en otras lenguas.
- Contexto: los 32.768 tokens son una caracteristica del modelo base; no se ha verificado que el ajuste fino preserve el rendimiento en contextos largos.
- Repositorio sin traccion: 0 descargas y 0 likes implican que el checkpoint no ha sido auditado por terceros ni probado en produccion.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar la cadena de licencias del modelo base y del dataset de ajuste, que no se documenta.
- Formato: al no publicarse GGUF ni cuantizaciones de inferencia, su despliegue en entornos de bajos recursos requiere trabajo adicional de conversion.
- Caveat sobre los pesos: el tamano de 0,2 GB sugiere adaptadores y no un modelo fusionado. Cargarlo con transformers directamente podria fallar si se espera un modelo completo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mmmtf/mistral-first-run-v2
- Modelo base del ajuste: https://huggingface.co/unsloth/mistral-7b-instruct-v0.3-bnb-4bit
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de text-generation-inference: https://github.com/huggingface/text-generation-inference
