# ashurudra09/alfred-2b-v4

## Resumen

Alfred 2B v4 es un ajuste fino mediante LoRA del modelo base Qwen3.5-2B, desarrollado por ashurudra09. No se trata de un modelo de chat general, sino de un asistente offline para Windows especializado en invocar herramientas locales: gestion de archivos, notas, recordatorios, memoria y busqueda semantica, hasta un total de 26 herramientas expuestas a traves de un servidor MCP. El modelo esta pensado para ejecutarse en la CPU de un portatil, lo que lo convierte en una opcion practica para asistentes de escritorio sin dependencia de la nube.

El modelo resuelve el problema del tool calling fiable en un presupuesto de computo muy reducido. Con 1.942.653.248 parametros (aproximadamente 1,94 mil millones) y un unico adaptador LoRA de rango 16, consigue mejoras notables frente a su predecesor y frente al modelo base en tareas de multiples pasos: un 83,9% de exito en tareas complejas verificadas sobre archivos finales, frente al 62,1% del base, y un 93,6% de robustez ante renombrado aleatorio de herramientas y argumentos.

Su relevancia actual radica en que demuestra que un modelo de menos de 2B parametros, cuantizado a Q8_0 (2,08 GB) y ejecutado en llama.cpp sobre CPU, puede sostener un agente local con llamadas a herramientas y resistencia a inyeccion de prompts (0 de 209 ataques exitosos). La licencia Apache 2.0 y la disponibilidad de pesos en GGUF y safetensors facilitan su integracion y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B) con adaptador LoRA (r = 16, alpha 32) sobre proyecciones de atencion y MLP |
| Parametros totales | 1.942.653.248 (aproximadamente 1,94B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (GGUF publicado, 2,08 GB); el adaptador LoRA se distribuye en safetensors |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA y pesos fusionados) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only, y se ajusta mediante LoRA con rango 16 y alpha 32 aplicado a las proyecciones de atencion y MLP. El entrenamiento se realizo en una unica GPU Kaggle T4 en precision float32. El proceso consta de dos fases: la ejecucion A entrena un adaptador desde cero durante 1.340 pasos; la ejecucion C, que corresponde a este modelo, parte del adaptador de A y realiza una epoca adicional sobre una mezcla corregida de datos durante 1.398 pasos, con tasa de aprendizaje 1e-4, scheduler coseno y tamano de lote efectivo 8, en aproximadamente 10,8 horas. La perdida de validacion descendio de 0,189 a 0,140.

El conjunto de datos comprende unas 11.000 conversaciones en ingles: datos sinteticos generados por gpt-oss-120b y Claude Haiku, validados por el scorer de evaluacion; 865 trayectorias on-policy (ejecuciones reales del propio modelo a traves de las herramientas, con el turno fallido reescrito por un profesor y conservado solo si la comprobacion final sobre los archivos pasa); y los conjuntos publicos NVIDIA When2Call y Salesforce xLAM (CC-BY-4.0). En aproximadamente una quinta parte de los ejemplos se enmascaran los nombres de herramientas y argumentos, lo que explica la robustez ante renombrado aleatorio. El modelo opera en modo no-thinking y espera el system prompt (1.2) y la lista de herramientas (contratos 1.3) especificos de la aplicacion Alfred.

## Capacidades

- Tool calling y function calling sobre un conjunto fijo de 26 herramientas locales (archivos, notas, recordatorios, memoria, informacion del sistema y busqueda por significado) a traves de un servidor MCP.
- Razonamiento multi-paso para completar tareas encadenadas verificadas sobre el estado final de los archivos.
- Robustez ante renombrado de herramientas y argumentos (93,6% de exito con todos los nombres alterados aleatoriamente).
- Resistencia a inyeccion de prompts en el conjunto evaluado (0 de 209 ataques exitosos).
- Generacion de texto conversacional en ingles dentro del dominio del asistente.
- Ejecucion en CPU mediante llama.cpp (compilacion b11804), con modo no-thinking.
- No es un modelo de chat general: su rendimiento fuera del conjunto de herramientas y del prompt de sistema para el que fue entrenado no esta garantizado.

## Casos de uso

- Asistente de escritorio offline en Windows: el modelo se integra con la aplicacion Alfred, que arranca `llama-server` sobre el GGUF y expone terminal y UI web en `http://127.0.0.1:7860`, permitiendo gestionar archivos y notas sin conexion a la nube.
- Gestion de archivos por lenguaje natural: crear, listar, renombrar y organizar archivos en carpetas conocidas mediante llamadas a herramientas, con confirmacion obligatoria antes de cada escritura y diario de deshacer gestionado por el servidor de herramientas.
- Recordatorios y notas: el modelo interpreta peticiones en ingles y las traduce en llamadas a las herramientas de notas y recordatorios, adecuado para uso personal en un portatil.
- Busqueda semantica local: invoca la herramienta de busqueda por significado para recuperar informacion de la memoria del asistente sin salir del equipo.
- Desarrollo de agentes MCP: sirve como referencia y base para experimentar con tool calling en modelos pequenos, con el codigo, pipeline de datos y evaluacion publicados en el repositorio del proyecto.
- Evaluacion de robustez de agentes: los conjuntos de prueba (When2Call, subconjunto de BFCL v4, suite de tareas duras) y los informes permiten reproducir y comparar el comportamiento de agentes locales.
- Despliegue en hardware modesto: al caber en CPU con cuantizacion Q8_0, es util para prototipos de asistentes en entornos sin GPU.

## Benchmarks y rendimiento

Resultados publicados por el autor, con Q8_0, temperatura 0 y cada modelo evaluado con la lista de herramientas con la que fue entrenado:

| Metrica | Qwen3.5-2B base | Alfred v3 | Alfred v4 |
|---|---|---|---|
| Tareas duras multi-paso verificadas sobre archivos finales (124) | 62,1% | 61,3% | 83,9% |
| Suite end-to-end de 50 tareas con herramientas reales | No disponible | 49/50 | 50/50 |
| Peticiones simples en dominio (249) | No disponible | 99,2% | 98,8% |
| Todas las herramientas y argumentos renombrados aleatoriamente (249) | No disponible | 67,1% | 93,6% |
| Ataques de inyeccion de prompts exitosos (209) | 6% propuestos | 0/209 | 0/209 |
| When2Call (3.652, publico) | 41,2% | 69,0% | 71,5% |
| When2Call, alucinacion de herramientas (menor es mejor) | 14,7% | 3,1% | 6,2% |
| Subconjunto BFCL v4 (media de 5 categorias) | 72,1% | 77,8% | 75,9% |

## Requisitos de hardware

- VRAM estimada: no aplica para el despliegue publicado; el modelo esta pensado para CPU. El GGUF Q8_0 ocupa 2,08 GB en disco y en memoria.
- GPU recomendadas: el entrenamiento se realizo en una unica Kaggle T4; para inferencia no se requiere GPU. Cualquier GPU consumer con suficiente memoria (por ejemplo, una RTX 4090 o superior) puede alojar el modelo, aunque no es el escenario objetivo.
- Cabe en CPU de portatil: es el caso de uso declarado por el autor.
- Opciones de despliegue: llama.cpp (compilacion b11804, `llama-server`) y la aplicacion Alfred (`uv run alfred` para terminal, `uv run alfred-ui` para interfaz web). El adaptador LoRA en safetensors puede cargarse con PEFT sobre el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alfred 2B v4 | 1,94B | No disponible | Tool calling especializado en 26 herramientas MCP, CPU | Apache 2.0 | Hugging Face (GGUF Q8_0 y LoRA safetensors) |
| Qwen3.5-2B (base) | 2B | No disponible | Modelo generalista | No disponible en la informacion | Hugging Face (unsloth/Qwen3.5-2B) |
| Alfred v3 | No disponible | No disponible | Version anterior del asistente | No disponible en la informacion | Repositorio del proyecto |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Llama a una herramienta cuando ninguna encaja con mas frecuencia que la version v3: alucinacion en When2Call del 6,2% frente al 3,1%, e irrelevancia en BFCL del 75,0% frente al 90,4%, ambas diferencias significativas.
- Punto debil en tareas excluidas del entrenamiento: actuar sobre los archivos que nombra una lista y renombrados masivos; las notas de version listan los 23 fallos de la suite dura.
- Los conjuntos de prueba fueron redactados por Claude, que tambien escribio parte de los datos de entrenamiento; la suite dura se puntua sobre los archivos reales, lo que reduce esa dependencia. Solo hay una ejecucion de entrenamiento, por lo que los intervalos cubren items de prueba, no semillas.
- La seguridad de la aplicacion (confirmacion antes de cada escritura, diario de deshacer, sin sobrescritura ni borrado permanente, solo carpetas conocidas) la impone el servidor de herramientas, no el modelo.
- Solo soporta ingles.
- No es un modelo de chat general; su uso fuera del prompt de sistema y del conjunto de herramientas para el que fue entrenado no esta garantizado.
- Riesgo de alucinacion en la seleccion de herramientas y argumentos fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento incluyen When2Call y xLAM bajo CC-BY-4.0, cuyas condiciones de atribucion deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashurudra09/alfred-2b-v4
- Repositorio del proyecto (codigo, datos, evaluacion): https://github.com/ashurudra09/alfred
- Resultados completos: https://github.com/ashurudra09/alfred/blob/main/RESULTS.md
- Ficha del conjunto de datos: https://github.com/ashurudra09/alfred/blob/main/data/card.md
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
