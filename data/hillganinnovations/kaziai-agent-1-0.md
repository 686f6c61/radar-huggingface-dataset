# hillganinnovations/KaziAI-Agent-1.0

## Resumen

KaziAI-Agent-1.0 es un modelo de lenguaje orientado a agentes autonomos de negocio, desarrollado por Hillgan Innovations (Nairobi, Kenia). Se presenta como un ajuste fino supervisado (SFT) del modelo destilado `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, del que hereda la arquitectura transformer densa de Qwen2 y el razonamiento en cadena de pensamiento inductivo de DeepSeek-R1. El checkpoint publicado es un merge completo de los pesos (1.777 millones de parametros en bfloat16), por lo que no requiere dependencias PEFT para su uso.

El modelo esta especializado en la ejecucion de software empresarial: despacho de mutaciones de API estructuradas, mantenimiento de estado transaccional multi-turno, control de acceso basado en roles (RBAC) con enfoque zero-trust, calculo fiscal localizado y planificacion de grafos aciclicos dirigidos (DAG) para flujos de trabajo. El autor declara un ajuste sobre 8.000 trayectorias empresariales multi-turno y publica soporte bilingue ingles-swahili, con mencion adicional al sheng (argot urbano de Kenia) en las etiquetas del repositorio.

Su relevancia actual radica en la combinacion de un tamano reducido (1,78 B de parametros) con un consumo de memoria declarado inferior a 2 GB en cuantizacion Q8_0, lo que lo situa en el rango de despliegue en hardware de consumo y en entornos de borde, un segmento donde la mayoria de los agentes de negocio open source requieren infraestructura de servidor. La licencia MIT facilita su adopcion comercial, aunque el modelo cuenta con cero descargas y cero likes en el momento de redactar esta ficha, y todos sus resultados de benchmarks estan auto-declarados sin verificacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), ajuste fino del destilado DeepSeek-R1-Distill-Qwen-1.5B |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (safetensors y GGUF), Q8_0 (GGUF); adaptador LoRA en precision original |
| Idiomas soportados | Ingles (en), swahili (sw); etiqueta adicional de sheng |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16, 3,32 GB), GGUF Q8_0 (1,89 GB), GGUF BF16 (3,55 GB), adaptador LoRA PEFT (564 MB) |

## Arquitectura y entrenamiento

El modelo parte de `DeepSeek-R1-Distill-Qwen-1.5B`, un destilado de la familia Qwen2 que incorpora el estilo de razonamiento en cadena de DeepSeek-R1. Sobre esa base, el autor aplica un ajuste fino supervisado (SFT) descrito como una adaptacion de dominio de alta capacidad sobre 8.000 trayectorias empresariales multi-turno. El repositorio incluye tanto el checkpoint fusionado como el adaptador LoRA original (rango 128, alpha 256), lo que permite servir el ajuste como modulo dinamico multi-tenant en vLLM o mediante PEFT. La model card menciona un enfoque «neuro-simbolico» para la planificacion y el cumplimiento de aprobaciones, aunque no se detalla el mecanismo concreto ni la composicion exacta del dataset de entrenamiento.

No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la mezcla de datos (proporcion de codigo, texto empresarial, datos sinteticos o trazas de herramientas), ni si se aplicaron etapas de RLHF o DPO posteriores al SFT. Tampoco se documenta la longitud de contexto nativa del modelo base ni si fue extendida durante el ajuste. La innovacion tecnica destacada por el autor es la especializacion en despacho de herramientas con estado transaccional y en la aplicacion de politicas de aprobacion y seguridad, mas que cambios arquitectonicos sobre el transformer original.

## Capacidades

- Generacion de texto y razonamiento en cadena de pensamiento heredado de DeepSeek-R1.
- Tool calling y function calling estructurado, con seleccion de funcion y construccion de argumentos en formato AST.
- Planificacion de flujos multi-paso mediante DAG (grafos aciclicos dirigidos) para orquestacion de tareas empresariales.
- Mantenimiento de estado transaccional a lo largo de conversaciones multi-turno.
- Aplicacion de control de acceso basado en roles (RBAC) y politicas zero-trust, con rechazo de peticiones no autorizadas segun el autor.
- Calculo fiscal y contable localizado (precision de libros financieros y de impuestos declarada).
- Capacidades bilingues ingles-swahili, con mencion de sheng en las etiquetas.
- Integracion con escenarios de CRM, punto de venta e inventario, y administracion sanitaria segun los benchmarks del autor.
- Despliegue nativo en transformers, vLLM, TensorRT-LLM, Ollama y llama.cpp.

## Casos de uso

- Atencion al cliente automatizada en CRM: el modelo puede gestionar conversaciones multi-turno con estado transaccional, abrir y actualizar tickets y escalar incidencias, aprovechando su entrenamiento declarado sobre trazas de CRM y ticketing (KaziDesk).
- Punto de venta e inventario: integracion en terminales de comercio para consultar stock, registrar ventas y emitir actualizaciones de inventario mediante llamadas a funciones, con un consumo de memoria inferior a 2 GB en Q8_0 que permite ejecucion en hardware de borde.
- Contabilidad y calculo fiscal: generacion de asientos contables y calculo de impuestos localizados, con la precision de libros financieros que el autor declara como metrica especifica.
- Orquestacion de procesos ERP: planificacion de DAG de tareas encadenadas (aprobaciones, validaciones, mutaciones de API) con cumplimiento de politicas de aprobacion, adecuado para pipelines internos donde se requiere trazabilidad del orden de operaciones.
- Administracion clinica y sanitaria: gestion de citas, registros administrativos y flujos de admision en entornos sanitarios, segun el escenario «Kazi Afya» evaluado por el autor.
- Asistente de negocio bilingue para Africa Oriental: atencion en ingles y swahili en comercio y servicios financieros, un nicho poco cubierto por modelos generalistas.
- Agente de backoffice con control de acceso: ejecucion de operaciones sensibles con verificacion de rol y rechazo de peticiones fuera de politica, orientado a entornos que exigen defensa frente a inyeccion de prompts y escalada de privilegios.

## Benchmarks y rendimiento

Resultados auto-declarados por el autor en la model card (todos con `verified: false`, es decir, no verificados de forma independiente).

| Benchmark | Metrica | Valor |
|---|---|---|
| BFCL (Berkeley Function-Calling) | Overall AST Match Rate | 94,11 % |
| BFCL | Simple AST Accuracy | 96,25 % |
| BFCL | Multiple Function Calling | 94,75 % |
| KaziAI Business Operations (Track B) | End-to-End Task Completion (N=2.500) | 98,44 % |
| KaziAI Track B | CRM & Ticketing (KaziDesk) | 98,80 % |
| KaziAI Track B | Point-of-Sale & Inventory (KaziPOS) | 98,40 % |
| KaziAI Track B | Clinical & Health Admin (Kazi Afya) | 97,80 % |
| KaziAI Track B | Financial & Tax Ledger Precision | 99,20 % |
| KaziBench-500 (held-out) | Intent Accuracy | 100 % |
| KaziBench-500 | Tool Selection Accuracy | 100 % |
| KaziBench-500 | Argument Accuracy | 100 % |
| KaziBench-500 | DAG Planning Accuracy | 100 % |
| KaziBench-500 | Safety & Approval Compliance | 100 % |
| KaziAI Red-Team (Track C) | Attack Refusal / Containment (N=1.500) | 100 % |
| KaziAI Red-Team (Track C) | Executed Security Breaches | 0 % |

Advertencia: los conjuntos KaziAI Track B, KaziBench-500 y KaziAI Track C son benchmarks propios del autor, sin publicacion independiente conocida. Los valores del 100 % en KaziBench-500 deben interpretarse con cautela, ya que no se documenta el proceso de construccion del conjunto ni la separacion respecto a los datos de entrenamiento. El unico benchmark externo es BFCL, cuyos resultados tampoco han sido verificados por un tercero.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 3,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 5 y 6 GB para contexto moderado.
- VRAM estimada en Q8_0: alrededor de 2 GB para pesos; el autor declara un footprint de RAM inferior a 2 GB en esta cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 (RTX 3060 Ti, RTX 4060, RTX 4090); A100 y H100 son sobredimensionadas para este tamano y solo se justifican por concurrencia o servicio multi-tenant con LoRA dinamica.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual; tambien en CPU y en Apple Silicon mediante el GGUF BF16 con Metal.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (incluido `--lora-modules` para el adaptador), TensorRT-LLM, llama.cpp (`llama-cli`), Ollama (incluye `Modelfile`) y text-generation-inference segun las etiquetas del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaziAI-Agent-1.0 | 1,78 B | No disponible | Agente de negocio, tool calling, bilingue en/sw | MIT | Hugging Face (safetensors, GGUF, LoRA) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | No disponible | Razonamiento general y matematicas | MIT | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion de Qwen) | Instruccion general, multilingue | Apache 2.0 | Hugging Face |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens (segun documentacion de Meta) | Instruccion general, tool calling | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a parametros, contexto y licencia: no se dispone de resultados de benchmarks independientes de KaziAI-Agent-1.0 que permitan una comparacion de rendimiento homogenea frente a estas alternativas. Los modelos comparados son referencias de la misma clase de tamano; sus cifras de contexto proceden de su documentacion oficial, no de la informacion de este repositorio.

## Limitaciones y advertencias

- Todos los benchmarks son auto-declarados y no verificados; varios se evaluan sobre conjuntos propios del autor, lo que impide descartar contaminacion entre entrenamiento y evaluacion.
- El repositorio registra cero descargas y cero likes en el momento de la ficha: no existe evidencia de uso en produccion por terceros.
- No se documenta la longitud de contexto efectiva, lo que dificulta dimensionar el despliegue en flujos con historiales largos.
- El soporte de sheng aparece solo como etiqueta; la model card no detalla cobertura lexica ni calidad en ese registro.
- El entrenamiento se declara sobre 8.000 trayectorias, un volumen reducido que puede limitar la generalizacion fuera de los dominios cubiertos (CRM, POS, salud, fiscalidad).
- Riesgo de alucinacion en operaciones con consecuencias reales (mutaciones de API, asientos contables, registros clinicos): se recomienda validacion determinista y confirmacion humana en acciones irreversibles.
- Las afirmaciones de seguridad (100 % de rechazo en red-team, 0 brechas) no han sido auditadas de forma independiente y no deben sustituir controles de seguridad en la capa de aplicacion.
- La licencia MIT permite uso comercial sin restricciones de atribucion mas alla de la propia licencia, pero el modelo base y los datos de entrenamiento pueden arrastrar obligaciones no declaradas en el repositorio.
- No se especifican sesgos conocidos ni la composicion del dataset, por lo que no es posible evaluar sesgos de genero, etnicos o linguisticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hillganinnovations/KaziAI-Agent-1.0
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Sitio del desarrollador: https://hillgan.com
- Leaderboard BFCL (referencia del benchmark externo): https://gorilla.cs.berkeley.edu/leaderboard.html
- Licencia MIT: https://opensource.org/licenses/MIT
