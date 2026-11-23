# quantumaikr/max-0.1b-aimax-router

## Resumen

max-0.1b-aimax-router es un modelo de clasificación de intenciones y enrutamiento de peticiones en coreano, desarrollado por quantumaikr, con 109.531.392 parámetros (aproximadamente 0,1B). Su función no es la generación de texto libre, sino la de actuar como enrutador: recibe una línea de petición de tarea en coreano (con un posible tipo de adjunto) y una lista de funciones definida en el prompt, y devuelve un JSON pequeño que indica qué función de la lista corresponde, junto con el motor necesario, la urgencia y el trabajo de seguimiento.

El modelo deriva del checkpoint base quantumaikr/max-0.1b-v1 mediante ajuste fino supervisado (SFT) de todos los parámetros, con la pérdida aplicada únicamente a los tokens de salida. Se distribuye principalmente en formato GGUF cuantizado Q4_K_M, lo que permite ejecución en CPU, y está pensado como material de decisión para la operación de recursos de un sistema llamado AI MAX, sin tomar la decisión final.

Su relevancia actual radica en que demuestra un patrón de despliegue muy específico: modelos minúsculos especializados en tareas de enrutamiento estructurado con salida restringida por gramática (GBNF), donde el coste de inferencia es mínimo y la salida es consumible por máquina. El autor publica además una variante mayor de 0,6B y recomienda esta última para producción, reservando el 0,1B para escenarios de recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de max-0.1b-v1, ajuste fino completo) |
| Parametros totales | 109.531.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (distribucion principal), bf16 (alta precision); f16 descartado por el autor por degradacion en prompts largos |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint base) |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 0,1B de parámetros, obtenido por ajuste fino completo (full fine-tuning) de un checkpoint SFT de la familia quantumaikr/max-0.1b-v1, con la función de pérdida calculada solo sobre los tokens de salida. La tarea está formulada como generación de texto condicionada por un turno de sistema que contiene una lista de funciones en formato `id|descripción|needs`, con dos líneas fijas al final (`ask` y `none`), y un turno de usuario con la petición más un posible marcador de adjunto.

Los datos de entrenamiento son enteramente sintéticos: frases de petición para aproximadamente 680 tipos de funciones de oficina, escritas con varios estilos, con la lista de funciones variando en cada muestra, más refuerzo específico de los tipos de error de versiones anteriores. No se usaron datos reales de miembros. La salida se restringe mediante gramática GBNF a un objeto JSON con cinco claves (`action`, `needs`, `urgency`, `follow_up`, `batchable`), y el postprocesado (`router_post.py`) aplica reglas para rellenar `units` y `seconds`, fusionar valores numéricos (`v3_merge`) y filtrar casos dudosos con una compuerta (`v4_gate`). El autor reporta que la salida JSON es válida en el 100% de los conjuntos evaluados.

## Capacidades

- Clasificación de intención sobre una lista de funciones proporcionada en el prompt, devolviendo el identificador de la función elegida.
- Salida estructurada garantizada en JSON con cinco claves mediante gramática GBNF.
- Detección de peticiones fuera de la lista, mapeándolas a la categoría `none` o `ask` (con limitaciones importantes, ver más abajo).
- Estimación de urgencia, necesidad de motor, trabajo de seguimiento y posibilidad de procesamiento por lotes.
- Manejo de marcadores de tipo de adjunto en la entrada.
- Capacidad de operar sobre listas de funciones variables en cada petición (no está fijado a un conjunto cerrado).
- No soporta tool calling en el sentido habitual de invocación de APIs, ni razonamiento multi-paso, ni visión, ni audio. Es un clasificador de una sola pasada.
- Multilingüismo: únicamente coreano.

## Casos de uso

- Enrutamiento de peticiones en un asistente interno de oficina: el modelo recibe la petición del empleado y la lista de funciones disponibles del sistema AI MAX, y devuelve qué función debe ejecutarse y con qué motor, permitiendo despachar la tarea sin intervención humana en la mayoría de casos (93,6% de acierto en el conjunto sellado de 298 peticiones).
- Clasificación previa en pipelines de agentes: dado que la salida es JSON validado por gramática, puede insertarse como primer eslabón de un pipeline que decida qué herramienta invocar, con coste de inferencia mínimo al ejecutarse en CPU con Q4_K_M.
- Triaje de urgencia en bandejas de entrada de solicitudes: el campo `urgency` permite priorizar colas de trabajo automáticamente, usando el modelo como clasificador ligero previo a un modelo mayor.
- Detección de peticiones no soportadas: con la compuerta `v4_gate`, el sistema puede marcar como inciertas las peticiones que no encajan en ninguna función disponible (37 de 52 errores desviados a `uncertain` en el conjunto de funciones desconocidas), derivándolas a revisión humana.
- Enrutamiento con adjuntos: el marcador de adjunto en la entrada permite distinguir peticiones que requieren procesamiento de documentos de las que no, útil en sistemas de gestión documental.
- Despliegue en entornos con hardware muy limitado: al ser un modelo de 0,1B en GGUF Q4_K_M, puede ejecutarse en CPU sin GPU, lo que lo hace adecuado para edge computing o servicios con presupuesto de cómputo casi nulo.
- Evaluación comparativa de enrutadores: sirve como línea base de bajo coste frente a la variante de 0,6B del mismo autor, que este recomienda para producción (83,6% frente a 71,2% en solitario sobre el conjunto sellado).

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (GPU, Q4_K_M, restricción GBNF), comparando la versión anterior v2b con la actual v3:

| Conjunto | action (v2b → v3) | units·seconds (v2b → v3) | Compuerta: tasa de adopción / action en adoptados |
|---|---|---|---|
| gold 48 (lista estándar) | 97,9 → 97,9 | 92,3 → 92,3 | 91,7 / 97,7 → 87,5 / 100,0 |
| sellado 298 (lista estándar) | 90,3 → 93,6 | 78,8 → 87,5 | 64,8 / 99,0 → 66,1 / 99,5 |
| sellado 298 (lista mixta) | 82,9 → 88,9 | no disponible | no disponible |
| funciones nuevas incluidas en la lista | 0 → 3 | no disponible | no disponible |
| funciones nuevas excluidas de la lista (none) | 68 → 48 | no disponible | `v4_gate` desvía 37 de 52 errores a `uncertain` |

El autor advierte que el conjunto gold 48 es optimista porque las descripciones de la lista se corrigieron tras observar errores durante el desarrollo, y que el conjunto sellado de 298 es el indicador más justo. La validez del JSON fue del 100% en todos los conjuntos. El autor indica además que la variante de 0,6B en solitario alcanza 83,6% frente al 80,3% de una configuración en dos etapas 0,1B→0,6B y el 71,2% del 0,1B en solitario, sobre un conjunto sellado de otro autor.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para Q4_K_M (el repositorio completo ocupa 1,2 GB e incluye varias versiones); el modelo en sí es de aproximadamente 0,1B parámetros.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no requiere A100 ni H100. Funciona en CPU.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, e incluso iGPU con memoria compartida).
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, servidores basados en llama.cpp). El autor incluye `router_post.py` para el postprocesado y ejemplos de gramática GBNF para motores que la soporten.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en enrutamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| max-0.1b-aimax-router | 109,5M | no disponible | 71,2% en solitario (conjunto sellado de otro autor); 93,6% action en conjunto sellado propio | Apache-2.0 | GGUF en Hugging Face |
| quantumaikr/aimax-router-qwen3-0.6b | 0,6B (aprox.) | no disponible | 83,6% en solitario (mismo conjunto sellado) | no disponible | Hugging Face |
| Configuración en dos etapas 0,1B→0,6B | 0,1B + 0,6B | no disponible | 80,3% | no disponible | composición manual |

El propio autor recomienda la variante de 0,6B en solitario frente a la configuración en dos etapas y frente a este 0,1B. No se dispone de comparaciones con enrutadores de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- Las peticiones que no están en la lista se envían con demasiada frecuencia a una función vecina de la lista: la tasa de acierto en `none` cae del 68% al 48% respecto a la versión anterior, y el problema se agrava cuanto más similares son las funciones de la lista.
- Añadir funciones nuevas solo a la lista no funciona: la tasa de selección de funciones nuevas incluidas en el prompt es del 3%. Para usar una función nueva hay que reentrenar con frases de petición de esa función.
- Los datos de entrenamiento y evaluación son enteramente sintéticos; no se han probado con peticiones reales de usuarios. El autor recomienda validación en modo sombra (shadow deployment) antes de producción.
- El conjunto gold 48 está sesgado al alza porque las descripciones se ajustaron tras ver los errores.
- Solo admite coreano; no hay soporte multilingüe.
- No es un modelo de propósito general: no genera texto libre, no razona en varios pasos y no soporta tool calling convencional.
- El archivo f16 de la carpeta `preview/` está desaconsejado por el propio autor porque la salida se corrompe con prompts de listas largas; debe usarse el archivo principal (v3) o el bf16.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende del checkpoint base quantumaikr/max-0.1b-v1, cuyas condiciones conviene verificar por separado.
- Riesgo de alucinación estructural: el modelo puede producir un JSON válido sintácticamente pero con una acción incorrecta; la compuerta `v4_gate` mitiga parte de este riesgo marcando casos inciertos, pero no lo elimina.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quantumaikr/max-0.1b-aimax-router
- Variante mayor recomendada por el autor: https://huggingface.co/quantumaikr/aimax-router-qwen3-0.6b
- Modelo base: https://huggingface.co/quantumaikr/max-0.1b-v1
