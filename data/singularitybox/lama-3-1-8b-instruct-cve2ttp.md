# singularitybox/lama-3.1-8b-instruct-cve2ttp

## Resumen

`singularitybox/lama-3.1-8b-instruct-cve2ttp` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario singularitybox en Hugging Face y distribuido exclusivamente en formato GGUF. El nombre sugiere un ajuste orientado a la conversion de vulnerabilidades (CVE) en tecnicas de adversario (TTP, *tactics, techniques and procedures*), un caso de uso tipico en ciberseguridad defensiva y analisis de amenazas, aunque la model card no documenta el proceso de entrenamiento ni el dataset empleado.

El modelo conserva el tamano de la familia Llama 3.1 8B, con 8.030.261.312 parametros totales, y se distribuye como un unico fichero `Llama-3.1-8B-Instruct.Q4_K_M.gguf` de aproximadamente 4,9 GB. Esta pensado para inferencia local con llama.cpp y herramientas compatibles, no para despliegues en servidores de alto rendimiento.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados. Cualquier evaluacion en produccion debe hacerse con cautela y verificando primero la procedencia de los pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.1 8B Instruct; no confirmado en la model card) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.1 8B soporta 128k tokens, pero no se confirma para este derivado) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors reportados por Hugging Face: 8.030.261.312 parametros) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de lo que se deduce del nombre y del modelo base. El identificador apunta a Llama 3.1 8B Instruct, un transformer denso con atencion por grupos (GQA) y tokenizador BPE de 128k entradas, pero la model card no confirma ni detalla estos aspectos para este derivado concreto.

Respecto al entrenamiento, la unica informacion disponible es que la conversion a GGUF se realizo con Unsloth. No se documenta el dataset de ajuste, el numero de tokens, la composicion de la mezcla, ni si hubo RLHF, DPO o SFT adicional sobre el modelo base. El sufijo `cve2ttp` sugiere un ajuste especifico para la tarea de mapear CVE a TTP de MITRE ATT&CK, pero no hay evidencia publicada en la model card que lo confirme.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredado del modelo base Llama 3.1 8B Instruct.
- Uso previsto (segun el nombre) para transformar descripciones de vulnerabilidades CVE en tecnicas de adversario (TTP), aunque no hay validacion publicada.
- Compatible con `llama-cli` y `llama-mtmd-cli` con la opcion `--jinja`, segun la model card.
- Soporte de plantillas de chat mediante Jinja (necesario para el modo instruct).
- Capacidades multilingues: no disponibles (no declaradas).
- Tool calling, function calling, agentes y modos de razonamiento extendido: no disponibles ni documentados.

## Casos de uso

- Enriquecimiento de bases de datos de vulnerabilidades: dado un CVE con su descripcion, generar una propuesta de tecnicas MITRE ATT&CK asociadas para alimentar un sistema de gestion de amenazas. Adecuado por el ajuste aparente del modelo, aunque requiere validacion humana.
- Analisis de informes de threat intelligence: procesar texto no estructurado sobre campañas y extraer TTP candidatas para correlacionar con alertas de SIEM.
- Asistencia a analistas SOC en triaje: generar un resumen de la tecnica de adversario probable a partir de una alerta y su CVE asociado, como borrador revisable.
- Prototipado local de pipelines de ciberseguridad: al ser un GGUF Q4_K_M de ~4,9 GB, se puede ejecutar en estaciones de trabajo sin GPU dedicada para pruebas de concepto.
- Generacion de contenido educativo: crear ejemplos de mapeo CVE a TTP para formacion en equipos de respuesta a incidentes.
- Etiquetado semiautomatico de datasets de seguridad: usar el modelo como generador de candidatos que luego se filtran por reglas o por un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: en torno a 5-6 GB para el fichero de pesos, mas overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) puede ejecutar el modelo con contexto moderado; en A100/H100 se puede aumentar el contexto y el throughput.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM; tambien en CPU via llama.cpp con rendimiento reducido.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que requeririan reconvertir a safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| singularitybox/lama-3.1-8b-instruct-cve2ttp | 8,03B | no disponible | GGUF Q4_K_M | no disponible | Hugging Face (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k tokens | safetensors, GGUF (comunidad) | Llama 3.1 Community License | Hugging Face, ampliamente adoptado |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32k tokens | safetensors, GGUF | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7,62B | 128k tokens | safetensors, GGUF | Apache 2.0 (mayoria de variantes) | Hugging Face |

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que verificar la licencia del modelo base Llama 3.1 y la del autor del ajuste antes de cualquier despliegue.
- Sin benchmarks ni evaluacion publicada: no hay evidencia de que el ajuste `cve2ttp` mejore al modelo base en la tarea; podria degradar capacidades generales.
- Riesgo de alucinacion: al mapear CVE a TTP, el modelo puede inventar identificadores de tecnicas o relaciones inexistentes; requiere validacion contra ATT&CK.
- Idiomas no declarados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Contexto no confirmado: aunque el modelo base soporta 128k, el GGUF Q4_K_M puede haberse generado con una configuracion distinta; conviene verificar el campo `n_ctx_train` al cargarlo.
- Modelo con cero descargas y cero likes: sin senales de uso comunitario ni validacion externa; tratarlo como experimental.
- Un solo fichero GGUF (Q4_K_M): no hay variantes de mayor o menor cuantizacion para ajustar el equilibrio calidad/VRAM.
- Posible uso dual: un modelo entrenado para convertir CVE en TTP puede emplearse tanto para defensa como para planificacion ofensiva; conviene restringir su acceso en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/singularitybox/lama-3.1-8b-instruct-cve2ttp
- Unsloth (herramienta de conversion citada): https://github.com/unslothai/unsloth
- Modelo base de referencia: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
