# aboyes/tamgapay-qwen2.5-1.5b-qlora

## Resumen

TamgaPay QLoRA es un adaptador PEFT entrenado sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario aboyes en HuggingFace. Se trata de un experimento de ajuste fino orientado a un caso de uso muy concreto: atención al cliente en ruso para una empresa ficticia llamada TamgaPay, con salidas estructuradas en JSON estricto y reglas de escalado a agentes humanos. El repositorio contiene únicamente los pesos del adaptador LoRA (0,1 GB), no los pesos completos de la red neuronal base.

El adaptador se entrenó con QLoRA en cuantización NF4 con cómputo en bfloat16 y rango LoRA r=16, sobre un conjunto de 108 ejemplos de entrenamiento, 36 de validación y 36 de prueba, en 4 épocas con semilla 42 y un tiempo total de 599 segundos sobre una única GPU RTX 4060 de 8 GB. Al ser un adaptador sobre un modelo de 1,5 mil millones de parámetros, el interés técnico no está en el rendimiento bruto del modelo, sino en la metodología: cuantización de 4 bits, ajuste con LoRA de bajo rango y evaluación de salidas estructuradas con métricas macro-F1 por categoría.

La relevancia del artefacto es doble. Por un lado, sirve como plantilla reproducible de un pipeline QLoRA completo sobre hardware de consumo, con artefactos de trazabilidad (report.md, run.json, selection_state.json) y un Space público de comparación de respuestas. Por otro, el propio autor lo etiqueta explícitamente como experimental y no apto para atención al cliente automática: el sistema omite 9 de las 17 escalaciones obligatorias y genera alucinaciones sobre tarifas y plazos, lo que lo convierte en un caso de estudio sobre cuándo un ajuste fino pequeño resulta insuficiente en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct; inferencia en NF4 (4 bits) con computo bf16 |
| Parametros totales | Modelo base de 1,5 mil millones de parametros mas adaptador LoRA de rango r=16 (tamano del repositorio: 0,1 GB); numero exacto de parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Qwen2.5-1.5B-Instruct (no confirmada por el autor) |
| Tipos de cuantizacion | Base en NF4 de 4 bits con doble cuantizacion (bnb_4bit_use_double_quant=True) y computo en bfloat16; se desaconseja CPU u otra precision para reproducir la evaluacion publicada |
| Idiomas soportados | Ruso (ru) |
| Licencia | No disponible en la model card; aplica la licencia propia del modelo base Qwen/Qwen2.5-1.5B-Instruct |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; los pesos base se descargan por separado) |

## Arquitectura y entrenamiento

El artefacto no es un modelo completo, sino un adaptador LoRA de rango r=16 acoplado a Qwen2.5-1.5B-Instruct mediante la libreria PEFT. La inferencia se realiza cargando el modelo base en 4 bits con BitsAndBytesConfig (tipo NF4, doble cuantizacion, dtype de computo bfloat16) y superponiendo el adaptador con PeftModel.from_pretrained. Por tanto, la arquitectura subyacente es la del transformer decoder-only de Qwen2.5, y el ajuste solo modifica matrices de bajo rango; el entrenamiento se hizo con QLoRA sobre una RTX 4060 de 8 GB.

Los datos de entrenamiento son completamente sinteticos y de dominio cerrado: una empresa ficticia, conversaciones de soporte generadas y etiquetadas por el propio asistente, sin clientes reales. El reparto es de 108 ejemplos de entrenamiento, 36 de validacion y 36 de prueba. La validacion reutiliza los mismos escenarios que el entrenamiento con otras formulaciones, mientras que el conjunto de prueba no se uso durante el entrenamiento. La configuracion fue de 4 epocas con semilla 42, 599 segundos de tiempo total y QLoRA en NF4 + bf16 con LoRA r=16. No se menciona en la informacion disponible ningun uso de RLHF, DPO u otra fase de alineamiento especifica del adaptador; el modelo base ya es una variante Instruct. Tampoco se detalla la composicion exacta del dataset mas alla del numero de ejemplos y su proposito (soporte al cliente con salida JSON y reglas de escalado).

## Capacidades

- Generacion de respuestas de atencion al cliente en ruso dentro de un dominio acotado (empresa ficticia TamgaPay).
- Emision de salida estructurada en JSON estricto: segun el autor, paso del 0 % al 100 % en esta metrica tras el ajuste.
- Clasificacion de categoria de la consulta del cliente, con mejora de macro-F1 por categoria de 0,290 a 0,802.
- Sigue un system prompt con reglas de empresa e instrucciones de etiquetado, cargado desde el archivo system_prompt.txt del repositorio.
- Capacidad de decidir escalado a agente humano, aunque de forma incompleta: omite 9 de las 17 escalaciones obligatorias del conjunto de evaluacion.
- Inferencia determinista en el ejemplo publicado (do_sample=False, max_new_tokens=400).
- Capacidades generales heredadas del modelo base Qwen2.5-1.5B-Instruct (generacion de texto, codigo, matematicas basicas, multilingue), no evaluadas ni garantizadas en este adaptador.
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible / no documentado en la informacion proporcionada.

## Casos de uso

- Evaluacion y ensenanza de pipelines QLoRA: el repositorio incluye la configuracion exacta (NF4 + bf16, LoRA r=16, semilla 42, 4 epocas, RTX 4060 de 8 GB) y artefactos de trazabilidad, por lo que sirve como referencia reproducible para montar un flujo de ajuste fino sobre GPU de consumo.
- Prototipado de asistentes de soporte con salida estructurada: permite validar rapidamente un esquema JSON de respuestas y reglas de escalado antes de invertir en un modelo mayor o en datos reales.
- Investigacion sobre sobreajuste en datasets sinteticos: con 108 ejemplos generados por el propio asistente, es un caso util para medir hasta que punto un adaptador aprende el formato sin aprender la politica de negocio (evidenciado por las escalaciones omitidas).
- Analisis de alucinacion en dominios con datos factuales sensibles (tarifas, plazos): el autor documenta explicitamente alucinaciones en estos campos, lo que permite estudiar tecnicas de mitigacion (recuperacion documental, validacion de campos obligatorios, restricciones de decodificacion).
- Docencia en tecnicas de cuantizacion: el ejemplo de codigo ilustra el uso combinado de BitsAndBytesConfig con NF4, doble cuantizacion y PeftModel, y la advertencia de que CPU u otra precision no reproducen la configuracion de evaluacion publicada.
- Comparacion cualitativa de respuestas mediante el Space publico tamgapay-review, util para inspeccionar el comportamiento del adaptador frente al modelo base antes de integrarlo en cualquier sistema.
- Base para experimentos de destilacion o prompting en ruso: al ser un adaptador sobre un modelo de 1,5 B, se puede contrastar su comportamiento frente al modelo base sin ajustar para aislar el efecto del ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas reportadas por el autor son internas y corresponden a su propio conjunto de evaluacion:

| Metrica | Antes del ajuste (modelo base) | Despues del ajuste (adaptador) | Conjunto |
|---|---|---|---|
| Macro-F1 por categoria | 0,290 | 0,802 | Validacion/prueba propios (108/36/36) |
| JSON estricto valido | 0 % | 100 % | Validacion/prueba propios |
| Escalaciones obligatorias cubiertas | No disponible | 8 de 17 (9 omitidas) | Validacion/prueba propios |
| Alucinaciones de tarifas y plazos | No disponible | Presentes | Validacion/prueba propios |
| Epocas / semilla / tiempo de entrenamiento | No aplica | 4 / 42 / 599 s en RTX 4060 8 GB | Entrenamiento |

Advertencia: el autor indica que no se realizaron anotacion independiente ni evaluacion con dos jueces via API, y que el pliego tecnico completo no se cerro. Las cifras anteriores proceden de la propia model card y no han sido verificadas por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas del numero de parametros, no publicadas por el autor): en 4 bits NF4, pesos del modelo base del orden de 1,0-1,2 GB mas adaptador, cache KV y activaciones; total tipico de 2-4 GB para contextos cortos. En bfloat16 sin cuantizar, aproximadamente 3,1 GB solo de pesos mas overhead, en torno a 4-6 GB en total.
- GPU recomendadas: el autor entreno en una RTX 4060 de 8 GB, por lo que cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100) es suficiente; el modelo no requiere hardware de centro de datos.
- Cabe en GPU de consumo: si. La configuracion publicada usa una RTX 4060 de 8 GB y requiere una GPU NVIDIA con soporte de bfloat16. El autor advierte que CPU u otra precision no reproducen la configuracion de evaluacion publicada.
- Opciones de despliegue: transformers + peft + bitsandbytes es la ruta documentada (Python 3.11, Linux, requirements.txt del repositorio). Para llama.cpp, Ollama, vLLM o TGI seria necesario fusionar el adaptador en los pesos base y, en su caso, convertir a GGUF; el repositorio solo contiene el adaptador, no pesos fusionados ni GGUF.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el tiempo de entrenamiento (599 segundos para 4 epocas).

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados para este adaptador. La comparacion con alternativas de la misma categoria queda limitada a aspectos estructurales:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aboyes/tamgapay-qwen2.5-1.5b-qlora | 1,5 B (base) + adaptador LoRA r=16 | No especificado (heredado del base) | Macro-F1 0,802 y JSON estricto 100 % en el conjunto propio del autor | No disponible | Adaptador PEFT en HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,5 B | Definido en su propia model card | Macro-F1 0,290 y JSON estricto 0 % en el conjunto del autor | Definida en su model card | Pesos completos publicos |
| Otros adaptadores QLoRA de soporte al cliente en ruso | No disponible | No disponible | No disponible | No disponible | No se han encontrado en la busqueda web |

No se han identificado en la informacion disponible otros modelos comparables de la misma categoria (adaptadores de soporte al cliente en ruso sobre modelos de 1,5 B).

## Limitaciones y advertencias

- Artefacto experimental: el propio autor lo declara no apto para trabajo automatico con clientes y lo etiqueta como experimento didactico.
- Dominio ficticio: la empresa TamgaPay no existe y el entrenamiento usa exclusivamente conversaciones sinteticas, sin clientes reales.
- Fallo funcional grave: se omiten 9 de las 17 escalaciones obligatorias contempladas en el pliego, lo que en un escenario real implicaria casos criticos no derivados a un humano.
- Alucinaciones documentadas en tarifas y plazos, campos con impacto economico directo.
- Cobertura de validacion debil: el conjunto de validacion reutiliza los mismos escenarios que el entrenamiento con otras formululaciones, por lo que la mejora de macro-F1 puede estar sobreestimada.
- Evaluacion incompleta: no se realizaron anotacion independiente ni evaluacion con dos jueces via API, y el pliego tecnico completo no se cerro.
- Tamano de datos muy reducido (108 ejemplos de entrenamiento) y una sola semilla, sin intervalos de confianza ni repeticiones.
- Idioma: soporte declarado unicamente en ruso; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Licencia: no se especifica licencia para el adaptador, lo que impide determinar con claridad las condiciones de uso comercial. Aplica ademas la licencia del modelo base Qwen/Qwen2.5-1.5B-Instruct, que debe consultarse por separado.
- Reproducibilidad condicionada: el autor advierte que CPU u otra precision no reproducen la configuracion de evaluacion publicada, y la inferencia requiere una GPU NVIDIA con bfloat16.
- Estado de adopcion nulo: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Advertencia de despliegue: al ser un adaptador, no puede ejecutarse de forma autonoma; es necesario descargar los pesos base y respetar la revision concreta indicada por el autor (989aa7980e4cf806f80c7fef2b1adb7bc71aa306).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aboyes/tamgapay-qwen2.5-1.5b-qlora
- Space de comparacion de respuestas: https://huggingface.co/spaces/aboyes/tamgapay-review
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a foros de automocion (bmwclub.ro) y no guardan relacion con el artefacto.
