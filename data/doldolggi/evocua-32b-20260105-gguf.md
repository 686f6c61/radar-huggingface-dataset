# doldolggi/EvoCUA-32B-20260105-GGUF

## Resumen

EvoCUA-32B-20260105 es un agente de uso de ordenador (computer use agent, CUA) desarrollado por Meituan, construido sobre la base del modelo multimodal Qwen3-VL-32B-Thinking. Está diseñado para interpretar capturas de pantalla y ejecutar acciones como clics, escritura y navegación en interfaces gráficas, con el objetivo de automatizar tareas en sistemas operativos reales. El modelo ha sido evaluado en WindowsAgentArena, donde alcanza un 56,48% de éxito, superando al modelo base Qwen3-VL-32B-Thinking (42,9%) y al agente propietario UI-TARS-2 (50,6%), lo que lo sitúa como el mejor agente de uso de ordenador de código abierto hasta la fecha.

Este repositorio concreto, `doldolggi/EvoCUA-32B-20260105-GGUF`, ofrece conversiones GGUF del modelo original con varias cuantizaciones (Q6_K, UD-Q5_K_XL, Q5_K_M, UD-Q4_K_XL, Q4_K_M), todas verificadas mediante una suite de regresión de coordenadas de clic. La particularidad de esta conversión es que, en lugar de limitarse a medir la perplejidad, se ha comprobado que la cuantización no desplaza sistemáticamente las coordenadas de clic emitidas por el modelo, un aspecto crítico para un agente CUA. Esto permite ejecutar el modelo en hardware con menos VRAM, como tarjetas de 32 GB, manteniendo una fidelidad aceptable respecto al modelo en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal, vision-language) |
| Parametros totales | 32 mil millones (32B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (32K) |
| Tipos de cuantizacion | Q6_K, UD-Q5_K_XL, Q5_K_M, UD-Q4_K_XL, Q4_K_M (GGUF) |
| Idiomas soportados | No disponible (el modelo base Qwen3-VL es multilingue, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con proyector de vision en f16) |

## Arquitectura y entrenamiento

EvoCUA-32B se basa en la arquitectura Qwen3-VL, un transformer multimodal que combina un codificador de vision con un modelo de lenguaje. El modelo original fue fine-tuneado por Meituan a partir de Qwen3-VL-32B-Thinking, especializandolo en tareas de uso de ordenador: interpretacion de capturas de pantalla, razonamiento sobre la interfaz y generacion de acciones (coordenadas de clic, texto a escribir, teclas, etc.). El proceso de entrenamiento incluye un enfoque de "evolucion" con 50 pasos, que segun los autores permite alcanzar resultados competitivos con menos datos que otros agentes.

La conversion GGUF de este repositorio mantiene la arquitectura original, pero cuantiza los pesos a diferentes precisiones. La innovacion principal de este repo es la metodologia de verificacion: se ha medido el error en las coordenadas de clic emitidas por cada cuantizacion frente a una linea base BF16, sobre 16 casos de prueba con capturas sinteticas. Los resultados muestran que todas las cuantizaciones hasta Q4 mantienen un error medio inferior a 2 pixeles, dentro del ruido de medicion del sistema, y que la cuantizacion UD-Q5_K_XL (con asignacion dinamica de bits por tensor) es la que mejor reproduce las decisiones de accion del modelo BF16.

## Capacidades

- Agente de uso de ordenador (CUA): interpreta capturas de pantalla y genera acciones como clics, escritura, atajos de teclado y navegacion.
- Razonamiento multimodal: combina vision (imagenes de pantalla) y lenguaje para decidir el siguiente paso.
- Generalizacion entre sistemas operativos: evaluado en WindowsAgentArena, demuestra capacidad de transferencia desde el entorno de entrenamiento basado en Linux.
- Soporte de tool calling implicito: las acciones generadas (clic, escribir, etc.) funcionan como llamadas a herramientas del sistema.
- Capacidad de espera (wait): el modelo puede decidir esperar antes de actuar, como se observa en el caso de un boton de borrado donde BF16 eligio esperar.
- Multimodalidad: al estar basado en Qwen3-VL, hereda capacidades de comprension de imagenes y texto, aunque el uso principal es la automatizacion de GUI.

## Casos de uso

- Automatizacion de pruebas de software: el modelo puede navegar por una aplicacion, hacer clic en botones, rellenar formularios y verificar resultados, reduciendo el esfuerzo manual en pruebas de regresion.
- Asistencia en helpdesk y soporte remoto: un agente CUA puede ejecutar pasos de resolucion de incidencias en el escritorio del usuario, como abrir ajustes, cambiar configuraciones o instalar actualizaciones.
- Automatizacion de tareas administrativas: procesamiento de documentos, relleno de plantillas, gestion de correo electronico o transferencia de datos entre aplicaciones de escritorio.
- Agentes de navegacion web: aunque el modelo esta orientado a GUI, puede utilizarse para automatizar interacciones con navegadores, como extraer datos, rellenar formularios o realizar compras.
- Testing de accesibilidad: el modelo puede recorrer una interfaz y detectar elementos que no son accesibles, emitiendo clics o navegaciones que un usuario con discapacidad realizaria.
- Investigacion en agentes autonomos: como modelo de referencia de codigo abierto, sirve para estudiar tecnicas de aprendizaje por refuerzo, evolucion de agentes y generalizacion entre plataformas.

## Benchmarks y rendimiento

Segun la informacion publicada por Meituan, EvoCUA-32B fue evaluado en WindowsAgentArena (WAA), una plataforma de benchmarking para agentes de uso de ordenador en Windows. Los resultados son los siguientes:

| Modelo | Puntuacion en WindowsAgentArena |
|---|---|
| EvoCUA-32B-20260105 | 56,48% |
| Qwen3-VL-32B-Thinking (base) | 42,9% |
| UI-TARS-2 (agente propietario) | 50,6% |

Ademas, el modelo se posiciona como el numero 1 entre los agentes de uso de ordenador de codigo abierto, segun la informacion de ModelScope. No se han publicado resultados en otros benchmarks estandar como MMLU o HumanEval en la informacion disponible.

En cuanto a la calidad de la cuantizacion, el repositorio GGUF reporta metricas de fidelidad de clic sobre 16 casos de prueba:

| Cuantizacion | On-target | Error medio (px) | Error maximo (px) | Coincidencia de accion vs BF16 |
|---|---|---|---|---|
| Q6_K | 16/16 | 1,53 | 10,0 | — |
| UD-Q5_K_XL | 16/16 | 1,06 | — | 16/16 |
| Q5_K_M | 16/16 | 1,78 | 6,0 | 15/16 |
| Q4_K_M | 16/16 | 2,03 | 6,0 | — |

Todas las cuantizaciones mantienen un error medio por debajo de 2 pixeles, dentro del ruido de medicion del sistema (~2 px), lo que indica que la cuantizacion no degrada significativamente la precision de los clics.

## Requisitos de hardware

- VRAM estimada para inferencia (medida en una AMD R9700 con 32 GB):
  - Q6_K (25,04 GiB): 31,0 GiB a contexto 8K; no cabe a 32K (34,0 GiB, satura y usa memoria del host).
  - UD-Q5_K_XL / Q5_K_M (~21,6 GiB): 27,8 GiB a 8K; 28,8 GiB a 32K con KV cache en q8_0 (cabe en una GPU de 32 GB).
  - Q4_K_M (18,40 GiB): 24,6 GiB a 8K; cabe a 32K.
- GPU recomendadas: tarjetas con 24-32 GB de VRAM, como NVIDIA RTX 3090/4090, A100, o AMD Radeon RX 7900 XTX / R9700 (compatibilidad ROCm).
- En GPU de consumo (16 GB o menos) solo cabrian cuantizaciones mas agresivas (no disponibles en este repo) o con contexto reducido.
- Opciones de despliegue: llama.cpp (compatible con el formato GGUF), Ollama, LM Studio, o servidores basados en llama.cpp como llama-server. Tambien se puede usar vLLM si se convierte a otro formato, aunque el repo solo ofrece GGUF.
- Latencia y throughput: no se han publicado mediciones especificas. Como referencia, un modelo de 32B en una GPU de 32 GB suele generar entre 10 y 30 tokens por segundo con cuantizacion Q4-Q5, dependiendo del hardware y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | WindowsAgentArena |
|---|---|---|---|---|---|
| EvoCUA-32B-20260105 | 32B | 32K | Apache-2.0 | Agente CUA (fine-tune de Qwen3-VL) | 56,48% |
| Qwen3-VL-32B-Thinking | 32B | 32K | Apache-2.0 | Modelo base multimodal | 42,9% |
| UI-TARS-2 | No publicado (propietario) | No publicado | Propietaria | Agente CUA de ByteDance | 50,6% |
| OSWorld (modelo de referencia) | No aplica | No aplica | No aplica | Benchmark de agentes CUA | No comparable |

EvoCUA supera a su modelo base en 13,6 puntos y al agente propietario UI-TARS-2 en casi 6 puntos, lo que lo convierte en la opcion de codigo abierto mas competitiva para automatizacion de GUI. La licencia Apache-2.0 permite uso comercial sin restricciones, a diferencia de UI-TARS-2.

## Limitaciones y advertencias

- La verificacion de cuantizacion se realizo sobre 16 casos de prueba en ingles, con capturas sinteticas y una sola vuelta (single-turn). No se ha ejecutado el benchmark completo OSWorld, por lo que los resultados de cuantizacion no garantizan el rendimiento en tareas reales multi-paso.
- El error de clic aumenta ligeramente con cuantizaciones mas agresivas: Q4_K_M tiene un error medio de 2,03 px frente a 1,06 px de UD-Q5_K_XL. Para aplicaciones que requieren precision subpixel, se recomienda usar Q5 o superior.
- La cuantizacion UD-Q5_K_XL es la unica que reproduce exactamente las decisiones de accion del modelo BF16 en los 16 casos de prueba. Otras cuantizaciones pueden diferir en comportamientos como "esperar" antes de hacer clic.
- El modelo puede alucinar coordenadas o acciones incorrectas en situaciones ambiguas, especialmente con interfaces complejas o poco comunes. Se recomienda validar las acciones en un entorno de prueba antes de desplegarlo en produccion.
- No se han publicado datos sobre sesgos especificos del modelo, pero al estar basado en Qwen3-VL, puede heredar sesgos de los datos de entrenamiento originales.
- El modelo esta optimizado para tareas de GUI en ingles; su rendimiento en otros idiomas o en interfaces no estandar no ha sido evaluado.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con las leyes de proteccion de datos y privacidad al automatizar interacciones con aplicaciones de terceros.
- El archivo Q6_K no cabe en una GPU de 32 GB con contexto completo de 32K; se necesita una GPU de 40 GB o mas, o reducir el contexto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/doldolggi/EvoCUA-32B-20260105-GGUF
- Modelo base (Meituan): https://huggingface.co/meituan/EvoCUA-32B-20260105
- Repositorio GitHub de EvoCUA: https://github.com/meituan/EvoCUA
- Pagina en ModelScope: https://www.modelscope.cn/models/meituan/EvoCUA-32B-20260105
- Documentacion en DeepWiki: https://deepwiki.com/meituan/EvoCUA/6.1-evocua-model
- Repo GGUF alternativo (spicyneuron): https://huggingface.co/spicyneuron/meituan-EvoCUA-32B-20260105-GGUF
