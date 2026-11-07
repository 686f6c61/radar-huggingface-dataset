# prabanta-dev/Qwen3-Coder-30B-A3B-Instruct-JNS

## Resumen
Qwen3-Coder-30B-A3B-Instruct-JNS es una conversión de pesos del modelo Qwen3-Coder-30B-A3B-Instruct (desarrollado por el equipo Qwen de Alibaba Cloud) al formato JNS, propietario del motor de inferencia Janas-LLM escrito en C. El trabajo de conversión lo publica el usuario prabanta-dev dentro del proyecto Janas, orientado a ejecutar modelos grandes en ordenadores convencionales, con o sin GPU. No se ha reentrenado ni podado nada: se parte de un GGUF cuantizado en Q4_K_M por Unsloth AI y se reescribe en el orden de lectura que espera Janas-LLM, preservando los metadatos.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con 30 000 millones de parámetros totales y 3000 millones activos por token, especializado en código y entrenado para rellenar huecos (fill-in-the-middle) además de para chat, edición y uso como agente. Su relevancia práctica radica en que, con el formato JNS, cada par (capa, experto) ocupa una ranura independiente, de modo que un token solo lee del disco los expertos que necesita; esto permite que un portátil con 32 GB de memoria mantenga el modelo completo en RAM.

El repositorio ocupa 18,6 GB y contiene un único fichero de pesos de 18,56 GB. La licencia es Apache 2.0, igual que la del modelo original. La fecha de creación del repositorio es el 7 de noviembre de 2026, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) |
| Parametros totales | 30 000 millones (31B segun la model card del modelo base) |
| Parametros activos | 3000 millones por token |
| Longitud de contexto | 32 768 tokens en el ejemplo de arranque de `janas-server` (`--ctx 32768`); no se documenta el máximo del modelo base |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | JNS (formato propietario de Janas-LLM); origen GGUF Q4_K_M |
| Tamano del repositorio | 18,6 GB |
| Fichero de pesos | `qwen3-coder-30b-a3b-q4km.jns` (18,56 GB) |
| SHA-256 del fichero | `bee7d25509e911a195cbf05a157e69bb05a62d2241cca2c4fdcfef269dcb2bdd` |
| Modelo base | Qwen/Qwen3-Coder-30B-A3B-Instruct |
| GGUF de origen | unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF, `Qwen3-Coder-30B-A3B-Instruct-Q4_K_M.gguf` |
| Plataforma del motor | Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores) |

## Arquitectura y entrenamiento
La arquitectura es la del modelo base Qwen3-Coder-30B-A3B-Instruct: un transformer con capas de mezcla de expertos en el que, por cada token, se activan 3000 millones de parámetros de un total de 30 000 millones. El modelo fue entrenado para rellenar huecos mediante los tokens especiales `<|fim_prefix|>`, `<|fim_suffix|>` y `<|fim_middle|>`, lo que le permite funcionar tanto en completado en el cursor como en conversación, edición y flujos de agente. La model card no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La contribución de este repositorio no es de entrenamiento sino de formato. El proceso consiste en tomar el GGUF Q4_K_M cuantizado por Unsloth AI y reescribirlo con la herramienta `gguf2jns` del motor Janas-LLM, en el orden en que este lee los tensores y conservando los metadatos. La modificación estructural relevante es que cada par (capa, experto) se almacena en una ranura propia, lo que habilita la lectura selectiva desde disco de los expertos que requiere cada token. No se aplicó ningún reentrenamiento ni poda.

## Capacidades
- Generación de código y completado en el cursor (fill-in-the-middle) mediante los tokens FIM.
- Conversación multi-turno y edición de código guiada por instrucciones.
- Uso como agente: la model card documenta que leyó un proyecto pequeño de Gambas3 y escribió uno nuevo con su estilo, en 9 peticiones con el agente de línea de comandos de Continue y en 25 con Claude Code.
- Integración con editores mediante llama.vscode y Continue.
- Razonamiento multi-paso en tareas de refactorización y creación de proyectos.
- Ejecución en CPU: el modelo completo cabe en 32 GB de memoria en un Intel Core Ultra 9 185H.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta conversión.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso
- Completado de código en el editor: configurando `janas-server` en el puerto 11434 con nombre `qwen3-coder`, el modelo sirve como backend de llama.vscode o Continue para autocompletar en el cursor, aprovechando su entrenamiento FIM y sus 32 768 tokens de contexto.
- Agente de refactorización en proyectos pequeños: la model card documenta la lectura de un proyecto Gambas3 y la generación de uno nuevo en su estilo; el modelo puede reproducir convenciones de un código base existente en pocas peticiones.
- Asistencia en portátiles sin GPU dedicada: con 3000 millones de parámetros activos y lectura selectiva de expertos desde disco, un equipo con 32 GB de RAM y un Intel Core Ultra 9 185H puede ejecutar el modelo completo sin tarjeta gráfica.
- Edición de código por instrucciones: el modelo admite chat y edición, por lo que puede aplicarse a tareas de modificación de ficheros concretos dentro de un flujo de trabajo con Continue.
- Automatización de tareas de desarrollo en línea de comandos: su uso con el agente de Continue y con Claude Code demuestra su encaje en pipelines de terminal para generar o transformar código.
- Despliegue local con requisitos de privacidad: al ejecutarse íntegramente en la máquina del usuario mediante Janas-LLM, el código y los prompts no salen del equipo, lo que resulta adecuado para entornos con restricciones de confidencialidad.
- Evaluación de motores de inferencia alternativos: sirve para probar Janas-LLM frente a llama.cpp u Ollama sobre el mismo modelo base cuantizado en Q4_K_M.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada: el fichero Q4_K_M ocupa 18,56 GB; con overhead de contexto y estado del motor, se recomienda un mínimo de 24 GB y, según la model card, 32 GB permiten mantener el modelo completo en memoria.
- CPU: la model card valida un Intel Core Ultra 9 185H con 32 GB de RAM.
- GPU: no se documentan GPU concretas compatibles; el motor funciona con o sin GPU, pero no se especifican modelos como A100, H100 o RTX 4090.
- GPU de consumo: no disponible la lista de tarjetas soportadas ni el reparto de capas entre CPU y GPU.
- Sistemas operativos: Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores).
- Despliegue: exclusivamente mediante Janas-LLM (`janas-get` para descarga y `janas-server` para servir). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato JNS solo lo lee Janas-LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Ejecucion |
|---|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct-JNS | 30B | 3B | 32 768 (configurado) | JNS | Apache 2.0 | Janas-LLM en Linux x86-64 |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30B (31B segun model card) | 3B | no disponible en la informacion | safetensors (Transformers) | Apache 2.0 | GPU o CPU via frameworks estandar |
| unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF | 30B | 3B | no disponible | GGUF (Q4_K_M entre otras) | Apache 2.0 | llama.cpp, Ollama y derivados |
| NVFP4/Qwen3-Coder-30B-A3B-Instruct-FP4 | 30B | 3B | no disponible | FP4 (NVFP4) | no disponible | GPU con soporte NVFP4 |

## Limitaciones y advertencias
- El formato JNS es propietario de Janas-LLM: los pesos no se pueden cargar en vLLM, llama.cpp, Ollama, TGI ni Transformers, lo que limita la portabilidad y obliga a usar el motor Janas.
- Solo hay binarios publicados para Linux x86-64; no se documenta soporte para macOS, Windows ni ARM.
- Solo se publica una cuantización Q4_K_M; no hay variantes de mayor precisión ni de menor tamaño para equipos con menos memoria.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales en safetensors; no se han publicado evaluaciones de la degradación.
- Riesgo de alucinación y de generación de código incorrecto o inseguro: inherente a los modelos de lenguaje y no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles; la model card no documenta evaluaciones de sesgo ni de seguridad.
- Idiomas soportados: no disponible; no se puede confirmar el comportamiento fuera del inglés y el chino habituales en la familia Qwen.
- Tool calling: no confirmado para esta conversión, aunque el modelo base lo soporte.
- Uso comercial: permitido por la licencia Apache 2.0, con la obligación de conservar los avisos de atribución a Qwen (Alibaba Cloud), Unsloth AI y el proyecto Janas.
- La licencia GPL-3.0-or-later del motor Janas-LLM no se aplica a los ficheros de pesos, según aclara el autor.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta: conviene verificar el SHA-256 antes de usarlo en producción.
- La fecha de creación del repositorio (noviembre de 2026) y la ausencia de métricas publicadas impiden avalar su rendimiento frente a otras distribuciones del mismo modelo.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/prabanta-dev/Qwen3-Coder-30B-A3B-Instruct-JNS
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Cuantización NVFP4 del mismo modelo base: https://huggingface.co/NVFP4/Qwen3-Coder-30B-A3B-Instruct-FP4
- Motor Janas-LLM (repositorio): https://github.com/prabanta-dev/janas
- Documentación de configuración del editor: https://github.com/prabanta-dev/janas/blob/main/docs/editor.md
- Documentación de completado de código: https://github.com/prabanta-dev/janas/blob/main/docs/code-completion.md
- Binarios de Janas-LLM para Linux x86-64: https://github.com/prabanta-dev/janas/releases/latest/download/janas-linux-x86_64.tar.gz
