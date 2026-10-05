# gabriel20vieira/llama3.2-3b-mikrotik-full

## Resumen

llama3.2-3b-mikrotik-full es un ajuste fino supervisado (LoRA) del modelo unsloth/Llama-3.2-3B-Instruct, desarrollado por gabriel20vieira, cuyo objetivo es traducir peticiones de gestion de red en lenguaje natural a comandos de la CLI de MikroTik RouterOS 7. Se enmarca dentro de iSDN, una plataforma de gestion de red basada en intenciones y supervisada por un operador humano. El modelo responde con comandos concretos, uno por linea, en lugar de texto explicativo, lo que lo orienta a integracion automatica en flujos de configuracion de dispositivos.

Se trata de un modelo denso de 3.212.749.888 parametros construido sobre la arquitectura Llama 3.2 (transformer decoder-only). El ajuste se realizo con LoRA (r=16, alpha=16) sobre las proyecciones q, k, v, o y las capas MLP, empleando un unico pase con los ocho conjuntos de datos del proyecto para contrastar entrenamiento escalonado frente a entrenamiento indiferenciado. El modelo se publica tanto en safetensors (adapter LoRA) como en GGUF cuantizado a q4_k_m, formato con el que se ejecutaron las evaluaciones.

Su relevancia actual radica en el nicho de la automatizacion de redes: un modelo pequeno y local capaz de generar configuracion RouterOS abre la puerta a despliegues en el borde de la red sin depender de servicios en la nube. No obstante, los resultados publicados por el autor son modestos y el propio autor advierte de que una respuesta ejecutable no garantiza que el estado resultante sea el deseado, por lo que su uso en produccion exige validacion previa y aprobacion operativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama 3.2) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q4_k_m; adapter LoRA en safetensors |
| Idiomas soportados | en |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adapter LoRA) y GGUF (q4_k_m) |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Llama-3.2-3B-Instruct, un transformer decoder-only de 3.212.749.888 parametros. Sobre esa base se aplico un ajuste fino con LoRA de rango 16 y alpha 16, afectando a las proyecciones de atencion q, k, v y o, asi como a las capas MLP. El autor identifica esta receta como "full" porque combina los ocho conjuntos de datos del proyecto en un unico pase de entrenamiento, con el proposito explicito de comparar el entrenamiento escalonado con el entrenamiento indiferenciado.

La tarea de entrenamiento es la conversion de intenciones de gestion de red a comandos RouterOS 7. La salida esperada es unicamente comandos, uno por linea, sin explicacion adicional, con una temperatura de evaluacion de 0.2 y un system prompt especifico incluido en el Modelfile del repositorio. La informacion disponible no detalla el numero de tokens de entrenamiento ni si se emplearon tecnicas adicionales de alineamiento como RLHF o DPO mas alla del ajuste supervisado.

## Capacidades

- Generacion de comandos de la CLI de MikroTik RouterOS 7 a partir de instrucciones en lenguaje natural (por ejemplo, "block telnet on the input chain").
- Salida restringida a comandos ejecutables, uno por linea, sin texto explicativo, lo que facilita su parseo y ejecucion automatica.
- Comprension de intenciones de configuracion de red dentro de un dominio acotado (iSDN).
- Integracion con flujos de validacion en sandbox: el modelo puede operar en ciclos en los que recibe el error del router y reintenta (hasta dos rondas en la evaluacion publicada).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el bucle de realimentacion con el router es parte del protocolo de evaluacion del proyecto.
- Capacidades multilingues: el modelo esta declarado unicamente para ingles (en).
- Capacidad especial: modo "thinking" o vision/audio: no disponible.

## Casos de uso

- Aprovisionamiento asistido de routers MikroTik: un operador describe la intencion ("crea una VLAN 20 en ether2") y el modelo devuelve los comandos RouterOS necesarios, que el operador revisa antes de aplicarlos.
- Automatizacion de politicas de firewall: traduccion de reglas en lenguaje natural ("bloquea telnet en la cadena de entrada") a sentencias de filtrado RouterOS, validables primero en un entorno CHR.
- Documentacion y generacion de plantillas de configuracion: produccion de secuencias de comandos base que luego se parametrizan para distintos dispositivos.
- Laboratorios de formacion y pruebas: uso en sandbox RouterOS CHR para que estudiantes comparen la intencion con la configuracion resultante sin riesgo sobre equipos reales.
- Investigacion en gestion basada en intenciones (intent-based networking): el modelo sirve como referencia reproducible para estudiar tecnicas de ajuste fino en el dominio de redes.
- Integracion en pipelines internos de red: dado que se distribuye en GGUF y con un Modelfile de Ollama, puede desplegarse localmente en el borde y ejecutarse sin conectividad externa.
- Prototipado de interfaces conversacionales de gestion de red: un chatbot interno que traduce peticiones de operadores a borradores de comandos que se validan antes de tocar produccion.

## Benchmarks y rendimiento

El autor publica una evaluacion en la que cada respuesta se ejecuta sobre un RouterOS CHR 7.22 limpio (parseo, preflight y ejecucion) y se lee de vuelta la configuracion resultante. Se tomaron tres muestras por intencion con intervalos de confianza bootstrap del 95%.

| Conjunto | Execution pass (%) | Verified pass (%) | Execution tras feedback del router (%) | Verified, mejor de 3 por sandbox (%) |
|---|---|---|---|---|
| Canonico (42 intenciones) | 27,8 [15,1; 41,3] (n=42) | 33,3 [14,3; 54,0] (n=21) | 40,5 | 38,1 |
| Fuera de distribucion (63) | 23,8 [14,3; 33,9] (n=63) | 20,8 [12,0; 30,6] (n=61) | 42,9 | 27,9 |

Definiciones aportadas por el autor: execution pass indica que todos los comandos parsean, encuentran los objetos a los que se refieren y se ejecutan; verified pass exige ademas que se cumplan las comprobaciones de estado (solo intenciones con checks validos); "tras feedback del router" permite hasta dos rondas en las que el modelo ve el error; y "mejor de 3 por sandbox" conserva la primera respuesta que el router ejecuta. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB con la cuantizacion q4_k_m publicada; en torno a 6-7 GB en precision FP16 (el repositorio ocupa 2,1 GB en total, incluido el adapter LoRA).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo cuantizado; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo con holgura para un modelo de este tamano.
- Cabe en GPU de consumo: si, en la mayoria de GPU de consumo actuales (RTX 3060 12 GB, RTX 4060, RTX 4090, etc.) e incluso en equipos con GPU integrada de gama reciente para la variante cuantizada.
- Opciones de despliegue: Ollama (el repositorio incluye un Modelfile con el system prompt y ajustes de evaluacion), llama.cpp (el autor cita la version b11351) y, en general, cualquier runtime compatible con GGUF. Para el adapter LoRA en safetensors seria necesario cargarlo sobre el modelo base con librerias como transformers + PEFT.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama3.2-3b-mikrotik-full | 3.212.749.888 | no disponible | Execution pass 23,8-27,8% en el dominio RouterOS (datos del autor) | llama3.2 | HuggingFace (safetensors + GGUF) |
| unsloth/Llama-3.2-3B-Instruct | 3.212.749.888 (aproximado) | no disponible | No disponible en esta informacion; es el modelo base sin ajuste de dominio | llama3.2 | HuggingFace |
| Otros modelos ajustados a configuracion de red | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura restringida a RouterOS 7: los menus legacy de wireless y CAPsMAN son en su mayoria incorrectos.
- Una respuesta que se ejecuta no implica que sea la solicitada: segun el autor, aproximadamente una de cada cuatro respuestas con execution pass deja un estado incorrecto. Es obligatorio validar en sandbox y contar con aprobacion de un operador antes de aplicar cambios en un dispositivo real.
- Conjuntos de evaluacion pequenos (42 y 63 intenciones), por lo que los numeros por categoria son meramente indicativos.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no cuantificado mas alla de las tasas de exito publicadas; la generacion de comandos plausibles pero incorrectos es un riesgo inherente a la tarea.
- Limitaciones de idioma: el modelo solo esta declarado para ingles (en); el resto de idiomas no esta soportado de forma oficial.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, Copyright (c) Meta Platforms, Inc., junto con la Llama 3.2 Acceptable Use Policy, lo que condiciona el uso comercial.
- Caveat de produccion: el bucle de realimentacion con el router puede "reparar" respuestas eliminando la parte rechazada, de modo que el estado final debe comprobarse explicitamente y no solo la ejecucion sin errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gabriel20vieira/llama3.2-3b-mikrotik-full
- Repositorio del proyecto (codigo, datos y reproduccion): https://github.com/gabriel20vieira/isdn-public
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Cita del paper (bajo revision): G. Vieira, A. R. Ortigoso, D. Fuentes, L. Frazao, N. Costa, A. Pereira, L. Roda-Sanchez, A. Fernandez-Caballero, "iSDN: Intent-Driven Configuration of Physical Network Devices using Fine-Tuned Local LLMs".
