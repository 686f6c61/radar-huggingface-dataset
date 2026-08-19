# exeterminal/Exe-Turbo-S-V1-GGUF

## Resumen

Exe Turbo S v1 es un modelo de lenguaje especializado en el uso de herramientas de terminal, desarrollado por el equipo de Exe AI Terminal. Se trata de un ajuste fino (fine-tuning) del modelo base LiquidAI/LFM2.5-8B-A1B, un modelo de mezcla de expertos (MoE) con 8.467 millones de parámetros totales y 1.500 millones de parámetros activos por token. Su propósito es servir como modelo de chat para un agente de terminal que debe decidir qué herramienta usar, leer archivos, ejecutar comandos en segundo plano y tratar el texto devuelto por las herramientas como datos, no como instrucciones.

La relevancia de este modelo radica en que está diseñado para ejecutarse en portátiles con 6-8 GB de memoria, gracias a su arquitectura MoE que solo activa una fracción de los parámetros en cada paso. Incluye una ventana de contexto de 128k tokens y se distribuye en formato GGUF con múltiples cuantizaciones, siendo la recomendada IQ4_XS con un tamaño de 4,6 GB. La licencia es LFM 1.0, heredada del modelo base, con condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 32 expertos por capa, atención y convolución corta |
| Parametros totales | 8.467.856.832 (8,47B) |
| Parametros activos | 1,5B por token |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ1_M, IQ1_S |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM 1.0 (no Apache, con condiciones para uso comercial) |
| Formato de pesos | GGUF (safetensors no disponible en este repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de LiquidAI/LFM2.5-8B-A1B, que combina atención estándar con capas de convolución corta y 32 expertos por capa. El ajuste fino se realizó mediante un adaptador LoRA de rango 16 y alpha 16 sobre el modelo base en bf16, con la máscara de prompt excluida de la función de pérdida para que el modelo aprenda el comportamiento en lugar de memorizar el prompt. El adaptador se fusionó posteriormente en el modelo base.

El entrenamiento se detuvo automáticamente en 1,1 de las 3 épocas planificadas cuando la pérdida de entrenamiento cayó por debajo de 0,2, con una pérdida de validación de 0,2538. Se adaptaron únicamente las proyecciones de atención y convolución corta, no las capas de expertos ni el router, con 5,7 millones de parámetros entrenables. Todos los archivos GGUF incluyen una matriz de importancia (imatrix) calculada con el mismo conjunto de calibración utilizado en otros modelos de la familia Exe.

## Capacidades

- Agente de terminal: selecciona la herramienta adecuada (lectura de archivos, ejecución de comandos, gestión de procesos en segundo plano) en lugar de recurrir a comandos shell improvisados.
- Defensa contra inyección de prompts: trata el texto proveniente de archivos o páginas web como datos, no como instrucciones, mejorando de 0/4 a 4/4 en casos de prueba.
- Uso de herramientas (tool use): integrado con esquemas de herramientas que se envían junto con el prompt del sistema.
- Razonamiento multi-paso: capaz de decidir cuándo hacer una pregunta aclaratoria ante solicitudes ambiguas.
- Contexto largo: ventana de 128k tokens, adecuada para sesiones de terminal extensas.
- Multilingüe: solo inglés, sin soporte oficial para otros idiomas.

## Casos de uso

- Automatización de tareas de terminal: el modelo puede interpretar solicitudes en lenguaje natural y traducirlas en secuencias de comandos, eligiendo la herramienta correcta (p. ej., leer un archivo con la herramienta de archivos en lugar de un one-liner de shell).
- Gestión de procesos en segundo plano: sabe iniciar ejecuciones largas en segundo plano para no bloquear la sesión, algo crítico en entornos de terminal interactivos.
- Defensa contra inyección de prompts en datos externos: al leer archivos o contenido web, el modelo trata el texto como datos, evitando que instrucciones maliciosas dentro de esos archivos alteren su comportamiento.
- Asistente de desarrollo local: en un portátil con 6-8 GB de RAM, puede servir como copiloto de terminal para desarrolladores que necesitan ayuda con comandos, rutas y configuración de entornos.
- Integración con servidores compatibles con OpenAI: se puede desplegar con llama-server u otros servidores compatibles, actuando como backend de chat para aplicaciones de terminal.
- Evaluación de herramientas internas: su capacidad para reportar fallos honestamente (mejora de 0/4 a 4/4) lo hace útil en entornos donde la depuración de scripts requiere respuestas precisas sobre errores.

## Benchmarks y rendimiento

La evaluación se realizó sobre 72 casos de terminal retenidos, con temperatura 0,1, utilizando la versión f16 antes de cualquier cuantización. Los resultados se comparan con el modelo base sin entrenar y con el modelo core de 27B de la misma familia:

| Modelo | Casos acertados | Porcentaje |
|---|---|---|
| LFM2.5-8B-A1B (sin entrenar) | 38 / 72 | 53% |
| Exe Turbo S v1 | 67 / 72 | 93% |
| Exe Core (27B, mismo terminal) | 67 / 72 | 93% |

El modelo mejora en 29 casos respecto al base, igualando al modelo de 27B con aproximadamente 18 veces menos parámetros activos. Las mejoras más destacadas se dan en defensa contra inyección de prompts (0/4 → 4/4), identificación del entorno Python del proyecto (0/4 → 4/4) y reporte honesto de fallos (0/4 → 4/4). Las limitaciones conocidas incluyen la lectura de documentos antes de reescribirlos (2/4) y la relectura de una vista previa ya disponible (0/2). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el archivo recomendado IQ4_XS ocupa 4,6 GB, por lo que cabe en portátiles con 6-8 GB de memoria total (RAM o VRAM compartida). Las versiones más pequeñas (IQ1_S, 1,8 GB) pueden ejecutarse en equipos con menos memoria, aunque no se recomiendan.
- GPU recomendadas: no se especifican GPUs concretas; el modelo está pensado para CPU con memoria unificada o GPUs de gama baja-media con al menos 4-6 GB de VRAM.
- Compatibilidad con hardware de consumo: sí, es el objetivo principal del modelo (portátiles con 6-8 GB de memoria).
- Opciones de despliegue: llama.cpp, llama-server, y cualquier servidor compatible con la API de OpenAI. También puede usarse con herramientas como Ollama si se convierte el GGUF.
- Latencia y throughput: no se proporcionan datos medidos. Al ser un MoE con 1,5B parámetros activos, se espera una latencia menor que un modelo denso de 8B, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Rendimiento en terminal (72 casos) |
|---|---|---|---|---|---|
| Exe Turbo S v1 | 8,47B | 1,5B | 128k | LFM 1.0 | 67/72 (93%) |
| LFM2.5-8B-A1B (base) | 8,47B | 1,5B | 128k | LFM 1.0 | 38/72 (53%) |
| Exe Core (27B) | 27B (aprox.) | no disponible | no disponible | no disponible | 67/72 (93%) |

El modelo se posiciona como una alternativa ligera al core de 27B, ofreciendo el mismo rendimiento en tareas de terminal con una fracción de los parámetros activos. Frente al base sin ajustar, la mejora es sustancial en el dominio específico, aunque fuera de ese ámbito se comporta como el base con un "acento" leve, según la documentación.

## Limitaciones y advertencias

- Especialización limitada: fuera del uso de herramientas de terminal, el modelo se comporta como el base con un ajuste leve; no está diseñado para chat general.
- Idioma: solo inglés, sin soporte multilingüe.
- Licencia LFM 1.0: no es Apache; incluye condiciones para uso comercial por encima de un umbral de ingresos. Es obligatorio revisar la licencia antes de cualquier despliegue comercial.
- Riesgo de alucinación: no se han publicado evaluaciones específicas sobre alucinaciones fuera del dominio de terminal.
- Sesgos: no se han documentado sesgos específicos, pero al ser un derivado de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Limitaciones de comportamiento: tiende a inspeccionar en lugar de actuar en ciertos escenarios (lectura de documentos antes de reescribirlos, relectura de vistas previas), lo que puede afectar a flujos de trabajo que requieren acción inmediata.
- Cuantizaciones extremas: las versiones de 1 bit (IQ1_M, IQ1_S) son experimentales y no se recomiendan para uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/exeterminal/Exe-Turbo-S-V1-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/main/LICENSE
- Modelo core de la familia: https://huggingface.co/exeterminal/Exe-Core-Dynamic-V1-GGUF
- Modelo guard de la familia: https://huggingface.co/exeterminal/Exe-Guard-Dynamic-GGUF
