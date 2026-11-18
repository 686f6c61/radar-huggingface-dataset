# chaoliangUNSW/Jev-Style-0.8B-Decision-v3-GGUF

## Resumen

Jev-Style-0.8B-Decision-v3-GGUF es la distribucion cuantizada en formato GGUF del modelo Jev-Style-0.8B-Decision-v3, desarrollado por Chaoliang Yan (chaoliangUNSW) y orientado especificamente a tareas de decision: clasificacion de texto, enrutamiento y puntuacion de opciones fijas. No es un modelo generativo de proposito general, sino un modelo de decision de "estilo Jev" (system-one) construido sobre una base Qwen3.5 de 0,8B parametros (752.393.024 parametros reales en safetensors) y afinado para emitir decisiones calibradas en lugar de texto libre.

La relevancia de esta release esta en su eficiencia: el build Q4_K_M ocupa 0,53 GB y cabe en cualquier portatil, manteniendo paridad de decision con la version de precision completa en 240 de 240 filas de evaluacion. Ademas, soporta entradas de hasta 25.600 tokens por llamada, muy por encima de los modelos de clasificacion comparables, y cubre 19 idiomas.

El modelo se distribuye con licencia Apache 2.0 y se integra mediante el paquete `jev-style`, que expone una API compatible con system-one, un Playground, seis skills para agentes, un hook de guardia para Claude Code y herramientas MCP. Es importante subrayar que los botones de "Use this model" de Hugging Face (Ollama, llama.cpp, LM Studio) cargan el GGUF como modelo de chat y no producen decisiones: hay que usar el runtime especifico del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5), afinado para clasificacion/decision |
| Parametros totales | 752.393.024 (0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 25.600 tokens por llamada (segun model card) |
| Tipos de cuantizacion | GGUF; Q4_K_M disponible (0,53 GB); otras variantes no detalladas |
| Idiomas soportados | en, zh, ar, bg, de, el, es, fr, hi, ja, ko, pt, ru, sw, ta, th, tr, ur, vi (19) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 2,9 GB); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5 de 0,8B parametros y se afina como modelo de decision en lugar de como modelo generativo. La model card lo enmarca en la serie "Jev-Style" con el tag `system-one`, lo que sugiere un diseno orientado a decisiones rapidas de un solo paso (frente a razonamiento multi-paso), con enfasis explicito en calibracion. El pipeline declarado en el Hub es `text-classification`, y la API del paquete `jev-style` expone un metodo `decide(texto, opciones)` que devuelve una decision entre un conjunto fijo de etiquetas.

Los datos de entrenamiento concretos (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se detallan en la informacion disponible para esta release de 0,8B. La model card indica que las fuentes de entrenamiento son especificas de cada release y que la version 2B v4 se entreno en parte con etiquetas suaves destiladas de TypeSafe Jev 1.14 via API publica, pero aclara que JevStyle se mantiene de forma independiente, sin afiliacion ni respaldo de TypeSafe. Para la 0,8B v3 no se especifica el origen exacto de las etiquetas. La innovacion tecnica destacable es la cuantizacion GGUF Q4_K_M con paridad de decision demostrada frente a precision completa, y el soporte de contexto largo (25.600 tokens) en un modelo de este tamano.

## Capacidades

- Clasificacion de texto y enrutamiento: asigna una entrada a una de un conjunto fijo de etiquetas definidas por el usuario.
- Puntuacion de opciones fijas (fixed-choice scoring): evalua y puntua alternativas discretas.
- Decisiones calibradas: el modelo esta disenado para que las puntuaciones reflejen confianza, no solo la etiqueta ganadora.
- Contexto largo: hasta 25.600 tokens por llamada, adecuado para documentos extensos o historiales largos.
- Multilingue: 19 idiomas declarados (en, zh, ar, bg, de, el, es, fr, hi, ja, ko, pt, ru, sw, ta, th, tr, ur, vi).
- Integracion con agentes: skills para agentes (`npx skills add lawrence3699/jev-style`), hook de guardia para Claude Code y herramientas MCP.
- API compatible con system-one y Playground incluidos en el paquete `jev-style`.
- Ejecucion on-device: disenado para correr localmente en CPU/CUDA o Apple silicon (MLX).
- Solo texto en esta release: la version 0.8B no procesa imagenes (la 2B v4 si, con build PyTorch).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica cada ticket entrante en categorias como facturacion, envio o cuenta, con contexto suficiente para incluir el historial completo del cliente en una sola llamada gracias a sus 25.600 tokens. La calibracion permite derivar a revision humana los casos de baja confianza.
- Clasificacion de intenciones en asistentes conversacionales: integrado via `jev-style`, decide la intencion del usuario entre un conjunto fijo de acciones antes de invocar la herramienta correspondiente, reduciendo el coste frente a un LLM generativo.
- Moderacion y filtrado de contenido: puntua textos contra politicas definidas como opciones fijas y devuelve una decision calibrada, ejecutable localmente sin enviar datos a terceros.
- Guardia de agentes (Claude Code guard hook): el hook incluido en el paquete usa el modelo para decidir si una accion propuesta por un agente requiere aprobacion, con latencia baja por el tamano de 0,8B y el build de 0,53 GB.
- Procesamiento de documentos largos en local: contratos, informes o correos extensos se clasifican en una sola pasada gracias al contexto de 25.600 tokens, sin trocear el texto.
- Despliegue en dispositivos sin GPU: el GGUF Q4_K_M de 0,53 GB corre en portatiles y equipos de gama baja mediante llama.cpp, util para aplicaciones de escritorio o entornos air-gapped.
- Evaluacion reproducible de enrutamiento: la model card enlaza un benchmark de enrutamiento bancario reproducible, lo que permite comparar decisiones contra alternativas con el mismo conjunto de datos.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados con el mejor checkpoint oficial de Laya re-ejecutado sobre las mismas filas:

| Benchmark | Jev-Style v3 0.8B | Mejor Laya oficial |
|---|---|---|
| Banking77, 77 intenciones (nunca entrenado) | 68,2% | 49,2% |
| MASSIVE intent, 37 idiomas no vistos | 65,5% | 36,1% |
| tweet_topic, zero-shot | 75,5% | 63,2% |
| JevBench v1.4.1 (231 items publicos, zero-shot) | 64,1% | 58,4% |
| Entrada maxima por llamada | 25.600 tokens | 1.024 por defecto |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la informacion disponible; el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,53 GB en Q4_K_M para los pesos; con overhead de contexto, menos de 1,5 GB en la mayoria de configuraciones.
- GPU recomendadas: no requiere GPU; funciona en CPU. En GPU, cualquier tarjeta con 2 GB o mas es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales y en portatiles sin GPU dedicada.
- Opciones de despliegue: paquete `jev-style` con backend GGUF (`jev-style serve --backend gguf --scorer ...`), llama.cpp como runtime subyacente, y builds MLX (Apple silicon) o Torch (CPU/CUDA) para el modelo base. Los botones de Ollama, llama.cpp y LM Studio del Hub no producen decisiones correctas; hay que usar el runtime del repositorio.
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada; el tamano de 0,8B y el build de 0,53 GB implican latencias de milisegundos a decenas de milisegundos por decision en hardware moderno, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Jev-Style-0.8B-Decision-v3 | 0,8B | 25.600 tokens | Apache 2.0 | Decision/clasificacion calibrada, on-device |
| Laya (mejor checkpoint oficial) | no disponible | 1.024 tokens por defecto | no disponible | Clasificacion de intenciones |
| Jev-Style-2B-Decision-v4 | 2B | 8.192 tokens | no disponible en la informacion | Decision, texto e imagenes (build PyTorch) |

La comparativa con Laya se basa en los resultados de la propia model card, re-ejecutados por el autor sobre filas identicas. No se dispone de datos de otros modelos comparables de clasificacion de 0,8B en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de decision, no generativo: no debe usarse para generar texto libre, razonamiento abierto ni codigo; los botones de chat del Hub producen resultados incorrectos.
- Riesgo de alucinacion en el sentido de decisiones erroneas con alta confianza; la calibracion ayuda pero no elimina el problema, y se recomienda umbral de confianza con derivacion a revision humana.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse sobre datos no detallados, pueden heredarse sesgos de esos datos.
- Cobertura idiomatica desigual: aunque declara 19 idiomas, el rendimiento en MASSIVE sobre 37 idiomas no vistos es del 65,5%, lo que indica margen de error apreciable fuera de los idiomas mejor representados.
- La version 0.8B es solo texto; las capacidades de vision requieren la 2B v4 con build PyTorch.
- Requiere el scorer `jev-score` compilado con `build_jev_score.sh` para el flujo GGUF; sin el, el uso no es directo.
- Licencia Apache 2.0 permite uso comercial, pero la model card advierte que las fuentes de entrenamiento son especificas de cada release y que no hay afiliacion con TypeSafe; conviene revisar la procedencia de los datos antes de un despliegue comercial critico.
- El servicio alojado (2B v4) es un camino de ejecucion separado del modelo local y tiene capacidad compartida, con respuestas 429 y cabecera `Retry-After` en momentos de carga.

## Enlaces

- Hugging Face (este repo GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-GGUF
- Modelo base: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Version 2B v4: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4
- Serie v1 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Serie v2 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF
- Coleccion v3: https://huggingface.co/collections/chaoliangUNSW/jev-style-08b-decision-v3-6ab58abb90ae4b7b55578b3e
- GitHub: https://github.com/lawrence3699/jev-style
- Web oficial del modelo: https://jevstyle.com/models/0-8b-v3/
- Guia de instalacion local: https://jevstyle.com/guides/run-locally/
- Clasificacion de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Enrutamiento local y Apple silicon: https://jevstyle.com/guides/local-decision-models/
- Decisiones si/no sobre recibos o capturas: https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de enrutamiento bancario: https://jevstyle.com/benchmarks/banking-routing/
- Demo en vivo (texto e imagen): https://huggingface.co/spaces/chaoliangUNSW/jev-style-2b
- Estado del servicio alojado: https://jevstyle.com/api/#service-status
- Health check de la API: https://api.jevstyle.com/healthz
