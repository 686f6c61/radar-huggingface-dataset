# gesh75/netops-intent2cli-qwen0.5b-lora

## Resumen

netops-intent2cli-qwen0.5b-lora es un adaptador LoRA desarrollado por gesh75 (GESH Lab, Georgi Gaydarov) que se monta sobre el modelo base Qwen2.5-0.5B-Instruct para una tarea muy concreta: traducir una intencion de operador de red expresada en ingles a un comando CLI del fabricante correspondiente (Juniper, Cisco, Arista, Huawei, Linux, Wireshark, etc.). El adaptador no es un modelo autonomo, sino un delta de pesos PEFT que modifica el comportamiento del base para que aprenda la gramatica de sintaxis de 17 familias de dispositivos.

El modelo resuelve un problema acotado de automatizacion de redes: dado un par (fabricante, intencion), generar el comando exacto. La propuesta es experimental y el propio autor lo presenta con metricas modestas: 9,3% de exact match sobre un conjunto de test held-out de 108 pares, frente al 0% del modelo base con el mismo prompt. Es, por tanto, una herramienta de sugerencia de sintaxis, no un oraculo de comandos.

La relevancia del proyecto esta en su honestidad metodologica y en su enfoque de bajo coste: entrenamiento en CPU (8 vCPU, fp32) en 591 segundos, sobre 565 pares de entrenamiento, con evaluacion desglosada por fabricante y advertencias explicitas sobre uso en produccion. Se publica bajo licencia Apache-2.0, en la estela del ecosistema de herramientas NetOps del mismo autor (datasets multivendor-cli-commands de 70.006 comandos, netlog-ai, aegis).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5B en el modelo base; adaptador LoRA r=16, alpha=32 sobre q/k/v/o_proj |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B-Instruct; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones estandar de Qwen2.5) |
| Idiomas soportados | no disponible (los intents de entrenamiento estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base Qwen/Qwen2.5-0.5B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parametros. La LoRA usa rango r=16, alpha=32, dropout=0,05 y se inyecta en las proyecciones q_proj, k_proj, v_proj y o_proj. El entrenamiento emplea AdamW con learning rate 2e-4, batch de 8, 3 epocas y calculo de perdida unicamente sobre los tokens de completion (el comando generado), no sobre el prompt. Se aplica early stopping sobre la perdida de validacion, que pasa de 1,98 a 1,14 y seguia mejorando en la tercera epoca.

Los datos proceden del dataset gesh75/netops-intent2cli: 565 pares de entrenamiento y 102 de validacion, con un test held-out de 108 pares separado por comando (los comandos de test no aparecen en entrenamiento). Los intents son sinteticos, generados con xAI Grok como parafrasis de los comandos; los comandos son reales, copiados literalmente del dataset gesh75/multivendor-cli-commands (70.006 comandos de 17 fabricantes) y de un conjunto de conceptos curado a mano. El entrenamiento se ejecuto en una maquina Linux de 8 vCPU, solo CPU, en fp32, con un tiempo total de 591 segundos. Los scripts (trainlora.py, evalm.py, common.py) estan publicados en el repositorio del autor.

## Capacidades

- Generacion de comandos CLI a partir de una intencion en ingles y un fabricante indicado en el prompt.
- Cobertura de gramaticas de 17 familias: Arista, Aruba, Cisco, Extreme, FRR, FortiOS, Huawei, Juniper, Linux, Microsoft, Mikrotik, NVIDIA, Nokia, PAN-OS, SONiC, VyOS y Wireshark.
- Aprendizaje de estilos sintacticos por fabricante (por ejemplo `nv set ...` para NVIDIA, `set protocols ...` para Juniper, `/routing ...` para RouterOS/Mikrotik).
- Generacion determinista mediante decodificacion greedy (do_sample=False), pensada para reproducibilidad.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking: es una tarea de seq2seq acotada.
- Capacidad multilingue no documentada; el entrenamiento y los ejemplos estan en ingles.

## Casos de uso

- Borrador de comandos para ingenieros de red: el operador describe la intencion en lenguaje natural y el modelo propone una linea CLI que el ingeniero valida contra la documentacion del fabricante antes de ejecutarla.
- Asistente en herramientas de configuracion multivendor: integrado en un configurador tipo cheatsheet (el autor publica multivendor-cli-configurator con 70k comandos), el modelo puede sugerir la sintaxis base y el operador completar los parametros concretos.
- Generacion de snippets para laboratorios: en entornos de practica (FRR, SONiC, VyOS) el modelo ayuda a recordar la forma del comando y el alumno corrige los detalles.
- Preprocesado en pipelines de validacion: la salida se envia a un validador tipo aegis o Batfish antes de cualquier aplicacion, de modo que el modelo solo actua como generador de candidatos en un flujo fail-closed.
- Traduccion entre fabricantes: dado un comando conocido de un vendor, el operador puede pedir el equivalente en otro y usar la sugerencia como punto de partida para la revision manual.
- Soporte a documentacion interna: generar ejemplos de comandos para runbooks y articulos tecnicos, siempre con revision humana y contraste con la documentacion oficial.
- Formacion de operadores noveles: mostrar la estructura sintactica tipica de cada fabricante como material didactico, con la advertencia de que los detalles pueden ser incorrectos.

## Benchmarks y rendimiento

Evaluacion sobre test held-out de 108 pares, separado por comando, decodificacion greedy. Exact match (EM) y match normalizado (case-folded, espacios colapsados, comillas y bloques de codigo eliminados).

| Modelo | Exact match | Match normalizado |
|---|---:|---:|
| Qwen2.5-0.5B-Instruct (base, mismo prompt) | 0/108 (0,0%) | 0/108 (0,0%) |
| + este LoRA | 10/108 (9,3%) | 10/108 (9,3%) |

Desglose por fabricante:

| Fabricante | n | EM base | EM LoRA | Norm LoRA |
|---|---:|---:|---:|---:|
| Arista | 9 | 0/9 | 0/9 | 0/9 |
| Aruba | 6 | 0/6 | 1/6 | 1/6 |
| Cisco | 6 | 0/6 | 1/6 | 1/6 |
| Extreme | 6 | 0/6 | 0/6 | 0/6 |
| FRR | 5 | 0/5 | 0/5 | 0/5 |
| FortiOS | 1 | 0/1 | 0/1 | 0/1 |
| Huawei | 5 | 0/5 | 1/5 | 1/5 |
| Juniper | 9 | 0/9 | 0/9 | 0/9 |
| Linux | 8 | 0/8 | 2/8 | 2/8 |
| Microsoft | 12 | 0/12 | 1/12 | 1/12 |
| Mikrotik | 7 | 0/7 | 0/7 | 0/7 |
| NVIDIA | 6 | 0/6 | 1/6 | 1/6 |
| Nokia | 6 | 0/6 | 0/6 | 0/6 |
| PAN-OS | 2 | 0/2 | 0/2 | 0/2 |
| SONiC | 5 | 0/5 | 0/5 | 0/5 |
| VyOS | 4 | 0/4 | 0/4 | 0/4 |
| Wireshark | 11 | 0/11 | 3/11 | 3/11 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; la unica evaluacion es la tarea especifica anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B ocupa aproximadamente 1 GB en fp16 y alrededor de 0,5 GB en cuantizacion de 4 bits; el adaptador LoRA anade unos pocos MB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060 de 12 GB o superior es mas que suficiente. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, y en CPU sin problemas.
- El entrenamiento del adaptador se realizo en CPU (8 vCPU, fp32) en 591 segundos, lo que confirma que el ajuste es viable sin GPU.
- Opciones de despliegue: transformers + peft (referencia del autor), llama.cpp y Ollama si se fusiona el adaptador con el base y se convierte a GGUF, vLLM y TGI para servir el modelo fusionado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano (0,5B) se espera una latencia de decenas de milisegundos por comando en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada. Cualitativamente:

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| netops-intent2cli-qwen0.5b-lora | 0,5B + LoRA r=16 | Intent a CLI de red (17 fabricantes) | Apache-2.0 | Hugging Face (adaptador) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | Instrucciones generales | Apache-2.0 | Hugging Face |
| Modelos genericos de mayor tamano (p. ej. Qwen2.5-7B-Instruct) | 7B | Instrucciones generales | Apache-2.0 | Hugging Face |

La comparacion cuantitativa con alternativas especificas de NetOps no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Intents sinteticos: el fraseo real de un operador diferira del usado en entrenamiento, lo que reduce la generalizacion.
- Cobertura desigual: FortiOS esta practicamente ausente (6 pares en total); PAN-OS, VyOS y SONiC tienen muy pocos ejemplos en test.
- Dataset diminuto (565 pares) y modelo de 0,5B: se esperan palabras clave incorrectas, opciones inventadas y valores de ejemplo copiados del entrenamiento.
- Sin conciencia de version ni plataforma: no sabe que version de software soporta cada comando.
- No apto para ejecucion autonoma de cambios: debe usarse como generador de borradores con revision humana obligatoria y validacion contra documentacion del fabricante.
- Riesgo alto de alucinacion en opciones y rutas de comandos; el 9,3% de exact match lo confirma.
- Sesgos especificos no documentados; al entrenarse sobre un dataset curado, puede sobrerrepresentar los fabricantes con mas pares (Wireshark, Microsoft, Juniper, Arista).
- Licencia Apache-2.0 en el adaptador; los nombres y sintaxis de comandos son marcas y hechos de sus respectivos fabricantes.
- El modelo base no documenta los idiomas soportados en esta ficha; el adaptador esta entrenado solo con intents en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gesh75/netops-intent2cli-qwen0.5b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/gesh75/netops-intent2cli
- Dataset de comandos multivendor: https://huggingface.co/datasets/gesh75/multivendor-cli-commands
- Herramienta de validacion aegis: https://github.com/gesh75/aegis
- Hub de documentacion GESH Lab: https://gesh75.github.io/
- Repositorio gesh-ai-network-tool: https://github.com/gesh75/gesh-ai-network-tool
- Demo multivendor-cli-configurator: https://huggingface.co/spaces/gesh75/multivendor-cli-configurator
- Demo netlog-ai: https://huggingface.co/spaces/gesh75/netlog-ai
- Coleccion NetOps tools: https://huggingface.co/collections/gesh75/netops-tools-6aef9999054238474f968bcd
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
