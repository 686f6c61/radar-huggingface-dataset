# patronus-studio/wolf-defender-prompt-injection-small

## Resumen

Wolf Defender Small es un clasificador binario de prompt injection y jailbreak desarrollado por Patronus Studio. Su funcion es actuar como guardrail previo a un LLM: recibe texto no confiable (entradas de usuario, documentos recuperados en un RAG, correos, paginas web o salidas de herramientas de un agente) y devuelve `BENIGN` o `INJECTION`, de modo que la aplicacion pueda bloquear, aislar o revisar el contenido antes de que llegue al modelo generativo.

El modelo se construye sobre `jhu-clsp/mmBERT-small`, un backbone ModernBERT de aproximadamente 141 millones de parametros, con una ventana de contexto de 2.048 tokens por fragmento. Su interes principal es la relacion entre tamano y rendimiento: con un tercio de los parametros del Wolf Defender completo (308M) mantiene una media del 91,66% en el conjunto de 13 benchmarks Horizon y una recall de validacion del 96,46% con una tasa de falsos positivos del 0,54% sobre 19.762 ejemplos.

La relevancia actual viene de su orientacion a despliegue local y en dispositivo: se distribuye en formato Transformers y ONNX, incluye variantes cuantizadas y puede ejecutarse en CPU, lo que permite incorporar defensa frente a inyeccion de prompts sin depender de APIs externas ni enviar contenido sensible a terceros. La licencia Apache 2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (backbone mmBERT-small), clasificacion de secuencias |
| Parametros totales | 140.642.306 (~141M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens por ventana |
| Tipos de cuantizacion | variantes cuantizadas ONNX incluidas (no se detallan los esquemas exactos) |
| Idiomas soportados | ingles (en), aleman (de); el autor declara caracter multilingue en el entrenamiento |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers), ONNX y joblib |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado desde `jhu-clsp/mmBERT-small` y adaptado como cabecera de clasificacion binaria (`sequence-classification`). La tarea es discriminar entre contenido benigno e instrucciones inyectadas, incluyendo inyeccion directa, inyeccion indirecta (contenido recuperado o salidas de herramientas) y patrones de jailbreak. El procesamiento se realiza por ventanas de 2.048 tokens, lo que implica que documentos mas largos deben fragmentarse y evaluarse por partes.

El entrenamiento combina una veintena de datasets publicos orientados a seguridad y a instrucciones generales, entre ellos `deepset/prompt-injections`, `Lakera/mosscap_prompt_injection`, `allenai/wildjailbreak`, `microsoft/llmail-inject-challenge`, `xTRam1/safe-guard-prompt-injection`, `jackhhao/jailbreak-classification` y varios conjuntos multilingues (malayo, ruso, chino, multilingue). Tambien se incluyen corpus de instrucciones y conversacion (`HuggingFaceH4/ultrachat_200k`, `VMware/open-instruct`, `akoksal/LongForm`, `iamtarun/code_instructions_120k_alpaca`) y datos de llamadas a herramientas (`interstellarninja/tool-calls-multiturn`), presumiblemente para reducir falsos positivos sobre texto legitimo con apariencia de instruccion. La model card no detalla el numero total de tokens de entrenamiento ni si se aplico RLHF o DPO; al tratarse de un clasificador, el ajuste se realiza con aprendizaje supervisado sobre etiquetas binarias.

## Capacidades

- Clasificacion binaria de prompt injection con salida `BENIGN` o `INJECTION`.
- Deteccion de inyeccion directa (instrucciones maliciosas del usuario) e indirecta (instrucciones ocultas en documentos, correos, paginas web o resultados de herramientas).
- Deteccion de patrones de jailbreak y de ingenieria social orientada a agentes.
- Soporte bilingue declarado en ingles y aleman, con entrenamiento que incluye datos multilingues adicionales.
- Integracion como guardrail en pipelines de agentes, RAG y llamadas a herramientas.
- Inferencia local en CPU gracias a las variantes ONNX y cuantizadas, sin dependencia de servicios externos.
- Compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face segun los tags del repositorio.
- No genera texto, no razona de forma generativa y no soporta tool calling propio: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entradas de usuario en un chatbot: cada mensaje se pasa por Wolf Defender Small antes de llegar al LLM; si la etiqueta es `INJECTION`, la aplicacion aplica su politica (bloqueo, cuarentena o revision). La latencia baja en CPU permite hacerlo en linea.
- Proteccion de pipelines RAG: los fragmentos recuperados de un indice vectorial se evaluan por ventanas de 2.048 tokens antes de insertarse en el prompt, lo que mitiga la inyeccion indirecta procedente de documentos envenenados.
- Saneamiento de correo y contenido web en agentes: un agente que lee bandejas de entrada o scrapea paginas puede clasificar cada cuerpo de texto y descartar aquellos con instrucciones ocultas antes de que el modelo generativo las interprete.
- Validacion de salidas de herramientas en agentes multi-paso: las respuestas de APIs, plugins o servidores MCP se clasifican antes de realimentar el bucle del agente, reduciendo el riesgo de secuestro de herramientas.
- Despliegue en dispositivo y edge: al ser un modelo de ~141M con variantes ONNX cuantizadas, puede ejecutarse en portatiles, contenedores sin GPU o entornos de cliente donde no se permite enviar datos a la nube.
- Cumplimiento y auditoria: registro sistematico de intentos de inyeccion detectados en produccion, con una tasa de falsos positivos declarada del 0,54% en validacion, util para construir metricas de seguridad y alertas.
- Integracion en frameworks existentes: ya esta soportado en Apache Camel, TrustyAI (NeMo Guardrails), AI-Parrot, Delphi Security xaIDR, Personaxis, Wanaku y Mygentic Cello, lo que facilita adoptarlo sin desarrollo a medida.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (familia Wolf Defender):

| Modelo | Parametros | Media Horizon (13 benchmarks) | Recall de validacion | FPR de validacion |
|---|---:|---:|---:|---:|
| Wolf Defender | 308M | 92,29% | 95,84% | 0,64% |
| Wolf Defender Small | 141M | 91,66% | 96,46% | 0,54% |
| Wolf Defender Edge | 80M | 91,44% | 95,85% | 0,50% |

La validacion se realiza sobre 19.762 ejemplos. La informacion proporcionada no incluye el desglose por benchmark individual (MMLU, HumanEval u otros no aplican a un clasificador), ni resultados frente a clasificadores de terceros.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en precision fp32 para los ~141M de parametros; las variantes cuantizadas ONNX reducen aun mas el consumo.
- GPU recomendadas: no requiere GPU; funciona en CPU. En caso de usar GPU, cualquier tarjeta con 2 GB o mas es suficiente (RTX 3060, RTX 4090, A100, H100).
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: Transformers, ONNX Runtime, `text-embeddings-inference`, endpoints de Hugging Face; integraciones con Apache Camel, TrustyAI y AI-Parrot.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor enfatiza el diseno para inferencia local en CPU pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Wolf Defender Small | 141M | 2.048 tokens | Clasificador binario de injection y jailbreak | Apache 2.0 | Hugging Face, ONNX, integraciones |
| Wolf Defender | 308M | no disponible | Clasificador binario, misma familia | Apache 2.0 | Hugging Face |
| Wolf Defender Edge | 80M | no disponible | Clasificador binario orientado a edge | Apache 2.0 | Hugging Face |

No se dispone en la informacion proporcionada de datos comparativos con clasificadores de terceros (por ejemplo, modelos de guardrails de otros proveedores); por tanto, la comparativa se limita a las variantes de la propia familia.

## Limitaciones y advertencias

- Ventana de 2.048 tokens: los documentos largos deben fragmentarse; una instruccion inyectada puede quedar diluida si el fragmento se evalua fuera de contexto.
- Cobertura linguistica limitada oficialmente a ingles y aleman; el rendimiento en otros idiomas no esta garantizado aunque se haya entrenado con datos multilingues.
- Riesgo de falsos positivos en contenido legitimo que contiene instrucciones (manuales, documentacion tecnica, prompts de sistema); la FPR declarada del 0,54% es sobre el conjunto de validacion y puede no trasladarse a dominios concretos.
- Riesgo de falsos negativos ante ataques novedosos, ofuscados o codificados que no se parezcan a los datos de entrenamiento.
- Es un clasificador, no un generador: no explica el motivo de la clasificacion ni ofrece reescritura segura del contenido.
- No sustituye a otras capas de defensa (validacion de permisos, aislamiento de herramientas, revision humana); debe combinarse con ellas.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantia de seguridad ni de exactitud por parte del autor.
- La fecha de creacion del repositorio (2026) y la model card indican una version v2.1; conviene verificar cambios entre versiones antes de fijar una dependencia en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Wolf Defender (308M): https://huggingface.co/patronus-studio/wolf-defender-prompt-injection
- Wolf Defender Edge (80M): https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-edge
- Version en Red Hat AI: https://huggingface.co/RedHatAI/wolf-defender-prompt-injection
- Pagina de producto: https://patronus.studio/product/ai-models
- Apache Camel (integracion): https://camel.apache.org/components/next/others/semantic-wolf-defender.html
- TrustyAI (NeMo Guardrails): https://github.com/trustyai-explainability/trustyai-service-operator/blob/main/config/configmaps/nemo-guardrails/default-guardrails-injection.yaml
- AI-Parrot (guardrail ONNX): https://github.com/phenobarbital/ai-parrot/blob/main/docs/security/onnx-injection-guardrail.md
- Delphi Security xaIDR: https://github.com/delphisecurity/xaidr/blob/main/xaidr/scanner/nano.py
- Personaxis: https://github.com/personaxis/personaxis/blob/main/packages/core/src/judge/output-scan.ts
- Wanaku: https://github.com/wanaku-ai/wanaku-barn/blob/main/apps/ui/admin/src/Pages/SemanticRouters/expertCatalog.ts
- Mygentic Cello: https://github.com/Mygentic-AI/cello-client/blob/main/core/gateway/src/detect/screener-model-manifest.ts
- Financiacion del proyecto: https://manifund.org/projects/an-open-weight-cpu-efficient-ai-security-model-for-multi-turn-agent-security
