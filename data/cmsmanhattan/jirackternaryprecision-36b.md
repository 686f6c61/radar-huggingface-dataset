# CMSManhattan/JiRackTernaryPrecision-36B

## Resumen

JiRackTernaryPrecision-36B es un modelo de lenguaje de gran tamano desarrollado por CMSManhattan, derivado del modelo base JiRackUltra_32b mediante un proceso de cuantizacion ternaria (1.58 bits por peso) orientado al paradigma BitNet. El modelo se distribuye en formato GGUF para su uso con llama.cpp y cuenta con 35.783.775.232 parametros totales (aproximadamente 35,8 mil millones), lo que lo situa en la categoria de modelos de ~36B. La propuesta principal es ofrecer un modelo de gran tamano con un footprint de memoria drasticamente reducido gracias a la representacion ternaria de pesos, manteniendo capacidades orientadas a generacion de texto, codigo, function calling y uso en agentes.

El modelo esta etiquetado con capacidades especificas para tool-use, agentes, coding y robotica, lo que sugiere un entrenamiento orientado a tareas de automatizacion e integracion con sistemas externos. El repositorio incluye tanto pesos en safetensors como en GGUF, y esta marcado como compatible con endpoints. La fecha de creacion (2026-10-28) y actualizacion (2026-11-26) indican un lanzamiento reciente.

Es relevante ahora porque la cuantizacion ternaria a 1.58 bits representa una de las lineas de investigacion mas activas para reducir el coste de inferencia de modelos grandes, permitiendo potencialmente ejecutar un modelo de ~36B en hardware consumer. Sin embargo, el acceso es restringido (gated) y la licencia es propietaria (jirack-proprietary), lo que limita su adopcion en produccion sin una evaluacion legal previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (qwen2), pesos ternarios (1.58-bit, paradigma BitNet) |
| Parametros totales | 35.783.775.232 (~35,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (1.58-bit); GGUF disponible |
| Idiomas soportados | no disponible |
| Licencia | jirack-proprietary (licencia propietaria, acceso restringido) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen2 (transformer decoder-only) segun las etiquetas del repositorio, y ha sido sometido a un proceso de cuantizacion ternaria que reduce cada peso a uno de tres valores posibles (-1, 0, +1), lo que corresponde a aproximadamente 1.58 bits por parametro. Esta aproximacion sigue la linea de BitNet, que busca entrenar o convertir modelos para que operen con pesos de baja precision sin degradacion severa del rendimiento. El modelo base es JiRackUltra_32b, del mismo autor, sobre el que se aplico dicha cuantizacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste fino supervisado. Tampoco se detalla si la ternarizacion fue post-entrenamiento (PTQ) o si el modelo base fue entrenado desde el inicio con pesos ternarios (QAT). Las etiquetas mencionan function-calling, tool-use, agents, coding y robotics, lo que sugiere un ajuste orientado a estas capacidades, pero no se aportan detalles tecnicos sobre dichos procesos.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Razonamiento y generacion de codigo (etiqueta coding).
- Function calling y tool use: el modelo esta etiquetado explicitamente para integracion con herramientas externas.
- Soporte para agentes y razonamiento multi-paso (etiqueta agents).
- Capacidades orientadas a robotica (etiqueta robotics), aunque no se detalla el alcance.
- Compatibilidad con endpoints (endpoints_compatible).
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno e integrarse con APIs mediante function calling para consultar estado de pedidos o resolver incidencias, aprovechando su orientacion a tool-use.
- Generacion de codigo en produccion: su etiqueta coding y su soporte de tool calling permiten integrarlo en pipelines de CI/CD para autocompletado, generacion de tests o revision de parches, con la ventaja del bajo footprint de la cuantizacion ternaria.
- Orquestacion de agentes: al estar etiquetado para agents y multi-step reasoning, puede actuar como cerebro de un agente que planifica pasos y llama a herramientas externas en flujos de automatizacion.
- Automatizacion robotica: la etiqueta robotics sugiere su uso en la generacion de comandos o planes de accion para sistemas roboticos, aunque requeriria validacion especifica.
- Despliegue en hardware limitado: gracias a la representacion ternaria (1.58 bits), es candidato para ejecutarse en entornos con VRAM reducida mediante llama.cpp, ampliando el acceso a modelos de ~36B.
- Prototipado rapido de asistentes conversacionales: su formato GGUF y compatibilidad con llama.cpp facilitan pruebas locales sin infraestructura de GPU de datacenter.
- Investigacion en cuantizacion: sirve como referencia para estudiar el impacto de la ternarizacion en modelos de ~36B en tareas de codigo y agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos ternarios a 1.58 bits, el peso teorico del modelo seria de aproximadamente 7 GB (35,8B x 1,58 bits / 8), aunque el repo ocupa 158,4 GB por incluir multiples formatos y posiblemente pesos safetensors en mayor precision. La VRAM real dependera del formato GGUF cargado y del contexto.
- GPU recomendadas: no disponible de forma oficial; por tamano, cabria esperar ejecucion en GPUs consumer de gama alta (RTX 4090, 24 GB) si el GGUF ternario se mantiene cerca del peso teorico, y en A100/H100 para despliegues de mayor throughput.
- Cabe en consumer GPU: probablemente si, en funcion del archivo GGUF ternario seleccionado; requiere verificacion empirica.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF y etiqueta bitnet), y potencialmente otros runners compatibles con GGUF. vLLM, TGI u Ollama no estan confirmados para pesos ternarios.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| JiRackTernaryPrecision-36B | ~35,8B | no disponible | Ternaria 1.58-bit / GGUF | jirack-proprietary | Restringido (gated) |
| JiRackUltra_32b (base) | ~32B (no confirmado) | no disponible | no disponible | no disponible | no disponible |
| BitNet b1.58 (referencia academica) | variable (hasta 3.9B en paper) | no disponible | Ternaria 1.58-bit | investigacion | Abierto |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia propietaria (jirack-proprietary): el uso comercial requiere revision legal y aceptacion explicita de condiciones; no es una licencia open source.
- Acceso restringido (gated): es necesario solicitar acceso en Hugging Face, lo que anade friccion a la adopcion y puede limitar la reproducibilidad.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano u otros idiomas sin evaluacion previa.
- Longitud de contexto no disponible: impide planificar casos de uso con ventanas largas.
- La cuantizacion ternaria puede degradar el rendimiento frente al modelo base en tareas sensibles a la precision, como matematicas o codigo complejo; se requiere evaluacion empirica.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin datos de benchmarks no se puede acotar su magnitud.
- Sesgos conocidos: no documentados.
- Ausencia de benchmarks publicados dificulta la validacion en produccion.
- El gran tamano del repositorio (158,4 GB) complica la descarga y el almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-36B
- Modelo base: https://huggingface.co/CMSManhattan/JiRackUltra_32b
- Paper de referencia BitNet b1.58 (no vinculado oficialmente al modelo): no disponible en la informacion proporcionada.
