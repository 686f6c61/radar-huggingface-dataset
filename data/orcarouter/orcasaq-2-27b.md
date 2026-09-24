# orcarouter/OrcaSAQ-2-27B

## Resumen

OrcaSAQ-2-27B es un checkpoint cuantizado de Qwen3.8-27B publicado por orcarouter (OrcaRouter), construido con OrcaSAQ2, un sistema propietario de cuantizacion mixta "sensitivity-aware" que reduce el checkpoint BF16 de 54 GB a 12,3 GB con una precision media declarada de 3,21 bits por peso en el decodificador. El objetivo declarado no es solo comprimir, sino preservar el comportamiento util del modelo original dentro de un presupuesto de memoria de GPU practico: la model card reporta +0,02% de perplejidad sobre BF16, 93,2% de acuerdo Top-1 a nivel de token y un KLD medio de 0,031 medidos sobre WikiText-2 con 16.376 tokens predichos.

El modelo se posiciona para cargas de trabajo de agentes de horizonte largo (agentes de codigo, de terminal, de navegador, computer-use y seguridad), razonamiento con modo thinking, function calling y ejecucion con estado. Mantiene la ventana de contexto de 262.000 tokens del modelo base y conserva la decodificacion especulativa MTP. La libreria declarada es vLLM y los pesos se distribuyen en safetensors.

Los resultados publicados por el autor son llamativos en su clase: 70,0 en SWE-bench Verified y 58,4 en Terminal-Bench 2.1 partiendo de un checkpoint de unos 12 GB. Se trata de cifras autoinformadas y dependientes del andamiaje de agente, por lo que el propio autor advierte de que no deben leerse como una comparacion estricta modelo a modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la tabla de arquitectura de la model card aparece truncada). Modelo base: Qwen/Qwen3.8-27B, decodificador transformer cuantizado |
| Parametros totales | 6.770.790.400 (~6,77 mil millones) segun los metadatos reales de safetensors. La model card y el nombre del repositorio indican 27B; discrepancia no resuelta en la informacion disponible |
| Parametros activos | No aplica segun la informacion disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K (262.000 tokens), igual que el modelo base |
| Tipos de cuantizacion | Cuantizacion mixta de precision "sensitivity-aware" (OrcaSAQ2), media declarada de 3,21 bpw (3-bit). Tag de formato: exl3 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (12,3 GB de repositorio) |
| Modelo base | Qwen/Qwen3.8-27B (relacion: quantized) |
| Libreria de inferencia | vLLM |
| Tamano del checkpoint BF16 de referencia | 54 GB |
| Reduccion de almacenamiento declarada | 77,2% (factor 4,4x mas pequeno) |
| Perplejidad (WikiText-2) | BF16: 5,6468 / OrcaSAQ2: 5,6482 (+0,02%) |
| Descargas / likes | 0 descargas / 30 likes |
| Fecha de publicacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una cuantizacion del checkpoint Qwen/Qwen3.8-27B. OrcaSAQ2 se describe como un sistema propietario de cuantizacion mixta de precision sensible a la sensibilidad (sensitivity-aware): en lugar de aplicar una precision uniforme, asigna bits de forma desigual segun el impacto de cada modulo en la salida, logrando una media declarada de 3,21 bpw en el decodificador. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, porque el proceso sobre el modelo base no forma parte de esta publicacion.

Los elementos tecnicos verificables en la model card son: preservacion de la ventana de 262K tokens, conservacion del modo thinking, soporte de tool calling y mantenimiento de la decodificacion especulativa MTP (multi-token prediction). La fidelidad se mide con tres metricas frente al BF16 por la misma ruta de evaluacion: perplejidad en WikiText-2 (5,6482 frente a 5,6468), acuerdo Top-1 a nivel de token (93,2%) y divergencia KLD media (0,031). El autor argumenta que la fidelidad en baja precision importa mas a medida que crece el horizonte de decision del agente, ya que un error de token puede alterar una llamada a herramienta y, con ella, todo el estado posterior de la tarea.

## Capacidades

- Generacion de texto conversacional y razonamiento en modo thinking.
- Razonamiento multi-paso orientado a tareas de horizonte largo.
- Codigo: el autor reporta 70,0 en SWE-bench Verified, lo que implica trabajo sobre repositorios reales con parches funcionales.
- Uso de terminal y ejecucion de comandos: 58,4 declarado en Terminal-Bench 2.1.
- Function calling y tool calling (etiquetado explicitamente en el repositorio).
- Flujos multi-herramienta (multi-tool workflows) y recuperacion ante fallos (failure recovery).
- Ejecucion con estado de larga duracion (long-running stateful execution).
- Agentes de navegador y computer-use, segun los casos de uso enumerados por el autor.
- Contexto largo de hasta 262K tokens, apto para tareas a escala de repositorio.
- Decodificacion especulativa MTP integrada.
- Multilingue limitado a ingles y chino; no se declaran otros idiomas.

## Casos de uso

- Agentes de codigo sobre repositorios completos: con 262K tokens de contexto el modelo puede ingerir arboles de proyecto, ficheros de configuracion y trazas de tests en una sola ventana y emitir parches; el 70,0 reportado en SWE-bench Verified apunta a tareas de resolucion de issues reales, y su tamano de 12,3 GB permite ejecutarlo en servidores modestos.
- Automatizacion de terminal y DevOps: 58,4 en Terminal-Bench 2.1 lo hace adecuado para agentes que leen salidas de comandos, corrigen errores de ejecucion y reintentan, con llamadas a herramientas estructuradas para ejecutar shell.
- Integracion en pipelines de CI/CD: el soporte de function calling permite exponer herramientas de compilacion, linters o despliegue y dejar que el modelo decida que ejecutar; al ser un checkpoint pequeno, puede servirse en la misma infraestructura que el runner.
- Agentes de navegador y computer-use: el bucle planificar-actuar-observar-decidir del que habla la model card encaja con tareas de rellenado de formularios, navegacion multipagina y extraccion de datos, donde el contexto largo evita perder el historial de la sesion.
- Analisis de repositorios a gran escala: auditoria de dependencias, busqueda de patrones inseguros o revision de cambios extensos aprovechando la ventana de 262K y el razonamiento en modo thinking para justificar cada hallazgo.
- Agentes de seguridad y respuesta a incidentes: los casos de uso "security agents" y "failure recovery" que cita el autor encajan con triaje de alertas, correlacion de evidencias y ejecucion de runbooks con herramientas, gracias a la preservacion del estado a lo largo de muchos pasos.
- Despliegue on-premise con requisitos de privacidad: al caber en una GPU de 24 GB y no requerir el BF16 de 54 GB, permite servir razonamiento de clase 27B sin enviar datos a APIs externas.
- Asistentes conversacionales multi-turno en ingles o chino: la ventana de 262K admite historiales muy largos con documentacion adjunta, aunque el soporte de idiomas declarado excluye el castellano.

## Benchmarks y rendimiento

Fidelidad frente a BF16 en WikiText-2 (16.376 tokens predichos, misma ruta de evaluacion, segun el autor):

| Build | Tamano | Bits del decodificador | KLD medio | Acuerdo Top-1 | Perplejidad |
|---|---:|---:|---:|---:|---:|
| Qwen3.8-27B BF16 | 54 GB | 16 | — | 100% | 5,6468 |
| OrcaSAQ-2-27B | 12,3 GB | 3,21 | 0,031 | 93,2% | 5,6482 |

SWE-bench Verified (puntos de referencia publicos citados por el autor; no comparables de forma estricta):

| Modelo | Puntuacion reportada |
|---|---:|
| Claude Sonnet 4.6 | 79,6 |
| Claude Sonnet 4.5 | 77,2 |
| Gemini 3 | 76,2 |
| OrcaSAQ-2-27B | 70,0 |
| Qwen3-Coder-480B-A35B | 69,6 |
| Gemini 2.5 Pro | 63,8 |
| GPT-4.1 | 54,6 |

Terminal-Bench 2.1 (puntos de referencia publicos citados por el autor):

| Modelo / agente | Puntuacion reportada |
|---|---:|
| Gemini 3.1 Pro / Terminus 2 | 70,7 |
| Claude Opus 4.6 / Claude Code | 70,1 |
| Claude Opus 4.6 / Terminus 2 | 63,8 |
| Claude Sonnet 4.6 / Claude Code | 58,5 |
| OrcaSAQ-2-27B | 58,4 |
| Gemini 3 Flash / Gemini CLI | 56,9 |
| GPT-5.4 / Terminus 2 | 54,8 |
| Claude Sonnet 4.6 / Terminus 2 | 51,5 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites de conocimiento general.

## Requisitos de hardware

- VRAM para pesos: unos 12,3 GB en el formato publicado. Es una cifra derivada del tamano del repositorio, no un requisito oficial declarado.
- Overhead de runtime: hay que sumar activaciones, buffers y cache KV. Con 262K tokens de contexto la cache KV puede ser muy grande; no se puede calcular sin el numero de capas y cabezas, dato no disponible.
- GPU de consumo: el checkpoint entra en tarjetas de 24 GB (RTX 3090, RTX 4090) y en la RTX 5090 de 32 GB, siempre que el contexto se mantenga moderado; en tarjetas de 16 GB el margen es muy estrecho o insuficiente con contexto largo.
- GPU profesionales: L40S (48 GB), A6000 (48 GB), A100 (40/80 GB) y H100 (80 GB) tienen margen holgado para contexto extenso o varios usuarios concurrentes.
- Multi-GPU: no se especifica en la informacion disponible, pero el despliegue con vLLM permite paralelismo de tensor si se necesita mas memoria para contexto.
- Opciones de despliegue: vLLM es la libreria declarada en el repositorio y la que el autor cita para servicio en produccion. El tag exl3 sugiere kernels especificos de cuantizacion, por lo que conviene verificar el soporte exacto de la version de vLLM utilizada. No hay confirmacion de soporte en llama.cpp, Ollama, TGI ni de pesos GGUF.
- Decodificacion especulativa MTP: declarada como soportada, orientada a mejorar el throughput; no se publican cifras de latencia ni de tokens por segundo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| OrcaSAQ-2-27B | 6,77 mil millones segun safetensors (27B segun la model card) | 262K | safetensors, 12,3 GB, 3,21 bpw | apache-2.0 | SWE-bench Verified 70,0; Terminal-Bench 2.1 58,4; PPL WikiText-2 5,6482 |
| Qwen/Qwen3.8-27B (base) | No disponible | 262K | BF16, 54 GB | No disponible | PPL WikiText-2 5,6468 (referencia del autor) |
| Qwen3-Coder-480B-A35B | No disponible | No disponible | No disponible | No disponible | SWE-bench Verified 69,6 (citado por el autor) |

La informacion proporcionada solo permite comparar contra el modelo base y contra los puntos de referencia que el autor cita en sus tablas de benchmarks. No hay datos de contexto, licencia ni formato de pesos para las alternativas, por lo que la comparativa completa no esta disponible.

## Limitaciones y advertencias

- Discrepancia de parametros sin resolver: los metadatos de safetensors declaran 6.770.790.400 parametros, mientras que el nombre del repositorio y la model card hablan de 27B. Ademas, 6,77 mil millones de parametros a 3,21 bpw ocuparian aproximadamente 2,7 GB, no 12,3 GB. Conviene verificar la configuracion real del checkpoint antes de planificar el despliegue.
- Cifras autoinformadas: los resultados de SWE-bench Verified y Terminal-Bench 2.1 los publica el autor del modelo, no son evaluaciones independientes, y el propio autor advierte que dependen del andamiaje de agente, del presupuesto de razonamiento y de los timeouts, por lo que no equivalen a una comparacion directa con los modelos de las tablas.
- Degradacion de fidelidad: un 93,2% de acuerdo Top-1 implica que aproximadamente 1 de cada 15 tokens difiere del BF16. En tareas de horizonte largo ese error puede compuestarse a lo largo de la trayectoria de decisiones, justo el escenario que el autor usa como argumento de venta.
- Riesgo en tool calling: pequenas desviaciones en la distribucion de salida pueden producir llamadas a herramientas mal formadas o argumentos incorrectos; se recomienda validacion estricta de esquemas y reintentos en produccion.
- Idiomas: solo ingles y chino declarados. No hay soporte confirmado de castellano ni de otros idiomas, lo que limita su uso en mercados hispanohablantes sin evaluacion previa.
- Licencia: el repositorio declara apache-2.0, pero se trata de una cuantizacion de un modelo de terceros; conviene verificar de forma independiente la licencia y las condiciones del modelo base Qwen/Qwen3.8-27B antes de un uso comercial.
- Dependencia de kernels: el tag exl3 y la cuantizacion mixta de 3 bits pueden requerir versiones concretas de vLLM o kernels especificos, con riesgo de incompatibilidad fuera del stack recomendado por el autor.
- Soporte del ecosistema limitado: no hay confirmacion de pesos GGUF ni de soporte en llama.cpp, Ollama o TGI, lo que reduce las opciones de despliegue en CPU o en entornos ligeros.
- Madurez y adopcion: 0 descargas y 30 likes en el momento de la consulta; es un artefacto muy reciente (24 de septiembre de 2026), sin historial de uso en produccion ni evaluaciones de terceros.
- Alucinacion: no se aportan datos especificos de tasas de alucinacion ni evaluaciones de veracidad, por lo que se aplican los riesgos habituales de un modelo de lenguaje generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orcarouter/OrcaSAQ-2-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- OrcaRouter AI Gateway: https://www.orcarouter.ai
- Catalogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- Perfil en X: https://x.com/OrcaRouter
- Discord: https://discord.gg/yAh6Tex6kx
- GitHub de Continuum AI Corp: https://github.com/Continuum-AI-Corp
