# AlmawaveLabs/Velvet2-3B

## Resumen

Velvet2-3B es un modelo de lenguaje de 3.900 millones de parametros desarrollado por AlmawaveLabs, el laboratorio de IA del grupo italiano Almawave. Se presenta como un modelo ajustado por instrucciones (instruction-tuned), orientado a conversacion y a *function calling*, con soporte declarado para seis idiomas europeos: ingles, italiano, portugues, espanol, aleman y frances. La ficha tecnica lo etiqueta como derivado de la familia Mistral, lo que situa su arquitectura en la estirpe de transformers densos decoder-only con atencion de tipo sliding window, aunque no se detalla la configuracion exacta de capas ni el contexto maximo en la informacion disponible.

El modelo llega con licencia Apache 2.0, un peso de repositorio de 7,8 GB en formato safetensors (compatible con pesos en precision completa o bf16/fp16) y acceso restringido en Hugging Face, lo que exige aceptar condiciones antes de descargarlo. Su interes practico para el publico hispanohablante reside en el multilinguismo declarado (incluye castellano) y en la orientacion explicita a *tool calling*, un nicho donde los modelos pequenos de 3-4B suelen flaquear frente a alternativas mas grandes.

La relevancia actual del modelo es doble: por un lado, ofrece una opcion ligera y comercialmente permisiva (Apache 2.0) para despliegues en produccion con presupuesto de GPU contenido; por otro, al estar especializado en function calling y conversacion multilingue, se posiciona como candidato para agentes y asistentes en entornos europeos donde la soberania del dato y el cumplimiento normativo pesan. La informacion publica disponible es, sin embargo, limitada: no hay ficha de modelo con detalles de entrenamiento, benchmarks publicados ni datos de contexto maximo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, derivado de la familia Mistral (detalles de capas y atencion no disponibles) |
| Parametros totales | 3.887.792.640 (~3,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la ficha; al ser safetensors en transformers, compatible con cuantizacion via bitsandbytes, GPTQ, AWQ y GGUF (conversion externa) |
| Idiomas soportados | Ingles (en), italiano (it), portugues (pt), espanol (es), aleman (de), frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); sin GGUF oficial publicado en la informacion disponible |

## Arquitectura y entrenamiento

Velvet2-3B es un transformer denso decoder-only de aproximadamente 3,9 mil millones de parametros. La etiqueta `mistral` en Hugging Face indica que su arquitectura base pertenece a la familia Mistral, lo que implica componentes estandar de esta estirpe (RMSNorm, SwiGLU, RoPE), si bien no se especifican en la informacion disponible el numero de capas, la dimension oculta, el numero de cabezas de atencion ni si emplea sliding window attention. Tampoco se detalla la longitud de contexto nativa, un dato critico para evaluar su idoneidad en tareas de contexto largo.

En cuanto al entrenamiento, la ficha menciona un ajuste por instrucciones (*instruction-tuned*) y un dataset propio llamado `AlmawaveLabs/TriQA`, presumiblemente orientado a calidad de respuesta y conversacion multilingue, aunque no se publican el numero de tokens de preentrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO o preference tuning. La orientacion a *function calling* sugiere un ajuste supervisado especifico con trazas de llamadas a herramientas, pero no hay documentacion tecnica que lo confirme. En resumen, la informacion sobre el proceso de entrenamiento es escasa y no permite reproducir ni auditar el pipeline.

## Capacidades

- Generacion de texto conversacional multilingue en seis idiomas europeos (en, it, pt, es, de, fr).
- Ajuste por instrucciones para seguir ordenes y mantener formato de respuesta.
- Soporte declarado de *function calling* / *tool calling*, lo que permite invocar funciones externas y APIs estructuradas.
- Capacidad para conversaciones multi-turno con mantenimiento de contexto (si bien la longitud de contexto no esta documentada).
- Apropiado para tareas de razonamiento basico y generacion de codigo, aunque sin benchmarks publicados que lo confirmen.
- Compatible con `text-generation-inference` y con `endpoints_compatible`, lo que facilita su despliegue en infraestructura de inferencia estandar.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (*thinking mode*).

## Casos de uso

- **Atencion al cliente multilingue en Europa**: el modelo cubre castellano, italiano, portugues, aleman, frances e ingles, lo que permite desplegar un unico asistente para mercados de la UE sin multiplicar modelos. Su ajuste conversacional encaja en dialogos multi-turno de soporte de nivel 1.
- **Agentes con function calling en back-office**: gracias a su soporte de *tool calling*, puede conectarse a APIs internas (consulta de pedidos, gestion de tickets, extraccion de datos de CRM) y ejecutar flujos multi-paso con validacion de parametros.
- **Generacion de codigo asistida en IDE**: con 3,9B parametros y licencia Apache 2.0, es viable integrarlo en un plugin de autocompletado o generacion de tests dentro de un pipeline de CI/CD, sin coste de licencia y con latencia baja en GPU consumer.
- **Extraccion de informacion estructurada de documentos**: combinado con function calling, puede transformar texto libre (correos, formularios) en JSON validado contra un esquema, util en procesos de digitalizacion de facturas o partes de trabajo en empresas espanolas.
- **Resumen y reescritura de contenido en castellano**: para medios, editoriales o administraciones publicas que necesitan procesar textos en espanol y otras lenguas cooficiales europeas, con la ventaja de una licencia permisiva para uso comercial.
- **Prototipado rapido de asistentes verticales**: al ser un modelo de 3,9B, se puede afinar (*fine-tuning*) sobre dominios concretos (legal, sanitario, turistico) en una sola GPU, lo que abarata la experimentacion frente a modelos de 7B o superiores.
- **Despliegue en entornos con requisitos de soberania del dato**: al poder ejecutarse on-premise y con Apache 2.0, encaja en organismos que no pueden enviar datos a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bf16/fp16, aproximadamente 7,8 GB de pesos mas overhead de activaciones y cache KV (estimacion practica de 10-12 GB para contexto moderado); en cuantizacion de 8 bits, ~4-5 GB; en 4 bits, ~2,5-3,5 GB. Estas cifras son estimaciones basadas en el tamano del modelo, no datos oficiales.
- **GPU recomendadas**: A100 40/80 GB o H100 para despliegues de alta concurrencia con vLLM o TGI; L40S o A10G para produccion de coste medio; RTX 4090 (24 GB) para desarrollo y serving de baja concurrencia en precision completa.
- **GPU consumer**: cabe con holgura en RTX 4090, RTX 4080, RTX 3090 y, en cuantizacion 4 bits, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060. Tambien es viable en CPU con llama.cpp si se convierte a GGUF.
- **Opciones de despliegue**: transformers (nativo), text-generation-inference (declarado en los tags), vLLM, llama.cpp/Ollama (requiere conversion a GGUF, no hay GGUF oficial en la informacion disponible), y endpoints compatibles con la API de Hugging Face.
- **Latencia y throughput**: no disponibles. Como referencia orientativa para un modelo de ~4B en una RTX 4090 con vLLM, se espera un throughput de decenas a centenares de tokens por segundo segun lote y cuantizacion, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Velvet2-3B (AlmawaveLabs) | ~3,9B | No disponible | en, it, pt, es, de, fr | Apache 2.0 | Gated en HF |
| Mistral-7B-Instruct (Mistral AI) | 7,2B | 32K (v0.2/v0.3) | Principalmente en, con multilingue limitado | Apache 2.0 | Abierto |
| Llama 3.2 3B Instruct (Meta) | 3,2B | 128K | Multilingue amplio (8 idiomas oficiales) | Llama 3.2 Community License | Gated en HF |
| Qwen2.5-3B-Instruct (Alibaba) | 3,1B | 32K (hasta 128K en variantes) | Multilingue amplio (29 idiomas) | Apache 2.0 (variantes) | Abierto |

La comparativa es orientativa: no hay benchmarks publicados de Velvet2-3B que permitan contrastar calidad frente a Mistral-7B-Instruct, Llama 3.2 3B o Qwen2.5-3B. La ventaja diferencial de Velvet2-3B es su combinacion de licencia Apache 2.0, tamano contenido y cobertura explicita de las principales lenguas europeas, con enfasis en italiano y portugues. Su principal desventaja frente a los competidores es la falta de documentacion publica sobre contexto, entrenamiento y evaluacion.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo es *gated* en Hugging Face; es necesario aceptar condiciones y disponer de cuenta autenticada para descargarlo, lo que puede complicar pipelines automatizados.
- **Documentacion insuficiente**: no se publican contexto maximo, detalles de arquitectura, composicion del dataset ni resultados de benchmarks, lo que dificulta una evaluacion rigurosa previa a produccion.
- **Riesgo de alucinacion**: como todo modelo generativo de ~4B, es propenso a inventar datos, especialmente en tareas factuales o de razonamiento complejo; requiere validacion externa en produccion.
- **Sesgos**: no hay model card con evaluacion de sesgos; al entrenarse presumiblemente con datos web multilingues, puede reproducir estereotipos y sesgos de genero, raza o nacionalidad.
- **Cobertura limitada a seis idiomas**: fuera de en, it, pt, es, de y fr el rendimiento puede degradarse notablemente; no se declaran lenguas cooficiales espanolas (catalan, gallego, euskera).
- **Function calling no verificado**: la capacidad de *tool calling* esta declarada en los tags, pero sin ejemplos, esquemas ni evaluacion publica que la respalden.
- **Licencia Apache 2.0**: permisiva para uso comercial, pero conviene revisar si los pesos derivados de Mistral arrastran obligaciones adicionales de la licencia original de Mistral AI (la ficha no lo aclara).
- **Sin GGUF oficial**: para despliegue en CPU o GPUs de gama baja sera necesario convertir los pesos, con el riesgo de degradacion en la conversion.

## Enlaces

- Hugging Face: https://huggingface.co/AlmawaveLabs/Velvet2-3B
- Dataset TriQA: https://huggingface.co/datasets/AlmawaveLabs/TriQA
- Perfil del autor en Hugging Face: https://huggingface.co/AlmawaveLabs
- Sitio corporativo de Almawave: https://www.almawave.com (no verificado en la busqueda; enlace de referencia del desarrollador)
