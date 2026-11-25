# ahtx/AH-Mechanic-1-4B-Kindi

## Resumen

AH-Mechanic-1-4B-Kindi (también llamado Mechanic v4) es un adaptador LoRA desarrollado por ahtx para el modelo ternario Bonsai 2 Ternary 4B de Prism ML, que a su vez deriva de Qwen3.5-4B. Está entrenado específicamente como agente de administración de sistemas Linux: ejecuta un comando bash cada vez, lee la salida y decide el siguiente paso. Resuelve el problema de automatizar tareas de sysadmin (diagnosticar qué llena un disco, reparar servicios que no arrancan, corregir tareas cron rotas, leer logs) sobre hardware muy limitado.

La relevancia del modelo está en su eficiencia extrema: el adaptador pesa 259,8 MB y se aplica en tiempo de ejecución sobre un modelo base cuantizado de forma ternaria, con un consumo de aproximadamente 1,9 GB de VRAM más 116 MB del adaptador. Esto permite ejecutarlo en tarjetas NVIDIA desde una Quadro K420 de 2 GB hasta una RTX 3080, mediante el motor de inferencia Kindi (versión 0.7.2 o superior) del mismo autor.

El adaptador es un LoRA de rango 32 (alpha 64) aplicado sobre las 12 tipos de proyección del modelo de lenguaje. No hay pesos fusionados: un modelo ternario no puede contener una actualización LoRA, por lo que Kindi la aplica en tiempo de ejecución. El adaptador encaja únicamente con el archivo `Ternary-Bonsai-2-4B-PTQ1_0.gguf` del repositorio base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B, cuantizada ternaria); adaptador LoRA de rango 32 (alpha 64) sobre 12 tipos de proyección |
| Parametros totales | No disponible (modelo base de 4B; adaptador de 259,8 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 tokens en Quadro K1200 y RTX 3080; 19.968 tokens en Quadro K420 de 2 GB |
| Tipos de cuantizacion | Base ternaria PTQ1_0 (GGUF); el adaptador se aplica en precisión completa en tiempo de ejecución |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors); base en GGUF (Ternary-Bonsai-2-4B-PTQ1_0.gguf) |

## Arquitectura y entrenamiento

El modelo base es Bonsai 2 Ternary 4B de Prism ML, derivado de Qwen3.5-4B y cuantizado de forma ternaria en formato PTQ1_0 (GGUF). Sobre esta base, ahtx entrena un adaptador LoRA de rango 32 con alpha 64 que cubre los 12 tipos de proyección del transformer. El adaptador se entrenó sobre una copia exacta del modelo base ternario, en precisión completa, para que encaje de forma exacta con los pesos cuantizados; no se realizaron cambios en la arquitectura.

Los conjuntos de datos de entrenamiento, tanto de un solo turno como multi-turno, fueron construidos desde cero por el autor. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset. No se menciona el uso de RLHF o DPO. La innovación técnica principal es la aplicación en tiempo de ejecución del adaptador sobre un modelo ternario, ya que este tipo de cuantización no permite fusionar actualizaciones LoRA en los pesos.

## Capacidades

- Generación de texto orientada a la ejecución de comandos bash en un entorno Linux real.
- Agente de un solo paso: ejecuta un comando, lee la salida y decide el siguiente, con un máximo de 12 comandos por tarea en el benchmark del autor.
- Tool calling / function calling mediante un esquema de herramienta bash idéntico al de AH-Mechanic-1-4B.
- Razonamiento multi-paso dentro del bucle agente (leer salida, diagnosticar, actuar).
- Capacidades de administración de sistemas: diagnóstico de disco lleno, reparación de servicios, corrección de tareas cron, lectura e interpretación de logs.
- Modo thinking desactivable (el autor recomienda desactivarlo para uso agente).
- Soporte multilingüe limitado al inglés.

## Casos de uso

- Diagnóstico de disco lleno en servidores: el agente ejecuta comandos como `du`, `df` o `find` de forma iterativa para localizar qué ocupa espacio en `/var`, leyendo la salida entre pasos y proponiendo acciones antes de borrar nada.
- Reparación de servicios que no arrancan: el modelo inspecciona el estado del servicio, lee los logs de systemd y aplica correcciones paso a paso, adecuado por su entrenamiento específico en tareas de sysadmin.
- Corrección de tareas cron rotas: el agente revisa la definición del cron, comprueba permisos y rutas, y valida la sintaxis, ejecutando un comando por turno.
- Lectura y análisis de logs en producción: interpreta la salida de herramientas de logging y decide qué comandos adicionales ejecutar para aislar la causa raíz.
- Automatización en hardware de bajo coste: despliegue en tarjetas desde 2 GB de VRAM (Quadro K420) para tareas de mantenimiento en entornos con recursos limitados, donde modelos de 4B en bf16 no caben o van lentos.
- Integración en un harness con confirmación humana: conectado a la CLI `mechanic` vía API compatible con OpenAI en `http://localhost:8093/v1`, muestra cada comando y pide confirmación antes de ejecutarlo, lo que permite uso supervisado en máquinas reales.
- Ejecución desatendida en contenedores o máquinas virtuales desechables: el autor recomienda este modo solo en entornos aislados, donde el agente puede operar sin supervisión con riesgo acotado.

## Benchmarks y rendimiento

Resultados en el benchmark de sandbox del autor (200 tareas, contenedores Ubuntu 24.04 sin red, máximo 12 comandos, media de 3 ejecuciones con temperature 0.7, top-p 0.8, top-k 20):

| Sandbox, 200 tareas, % de éxito | Run 1 | Run 2 | Run 3 | Media |
|---|---|---|---|---|
| Mechanic v4 (Kindi) | 67,0 | 72,0 | 67,5 | **68,8** |
| Qwen3.5-4B sin entrenar (bf16) | 61,5 | 66,0 | 60,5 | 62,7 |

Con decodificación greedy (una ejecución cada uno): Mechanic v4 obtiene 68,0 y Qwen3.5-4B sin entrenar 73,0. El muestreo reduce la puntuación de Qwen3.5-4B unos 10 puntos, mientras que Mechanic v4 se mantiene estable. Para los mejores resultados en este benchmark, el autor recomienda AH-Mechanic-1-4B (bf16 o GGUF), que alcanza un 82,0 % en greedy.

Velocidad medida por el autor con Kindi y el adaptador (write = tokens generados por segundo; read = tokens de prompt procesados por segundo):

| Tarjeta | Contexto | Write | Read |
|---|---|---|---|
| Quadro K420, 2 GB | 19.968 tokens | 8,7 | 11,6 |
| Quadro K1200, 4 GB | 32.768 tokens | 35,0 | 70 |
| GeForce RTX 3080, 10 GB | 32.768 tokens | 108 | 1.244 |

La velocidad de escritura se mide sobre 64 tokens generados; la de lectura, sobre prompts de 512 y 2.048 tokens.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,9 GB para el modelo base más 116 MB para el adaptador (unos 2,0 GB en total).
- GPU recomendadas: Quadro K420 (2 GB), Quadro K1200 (4 GB), GeForce RTX 3080 (10 GB); cualquier NVIDIA con 2 GB o más.
- No cabe en tarjetas de 1 GB. Cabe en GPU de consumo como la RTX 3080 con amplio margen y contexto de 32.768 tokens.
- Opciones de despliegue: motor Kindi 0.7.2 o superior (las versiones anteriores no cargan adaptadores), con `kindi serve` (API compatible con OpenAI en el puerto 8093) o `kindi chat`. El adaptador se convierte la primera vez que se carga.
- Latencia y throughput: 8,7 tok/s de escritura y 11,6 tok/s de lectura en Quadro K420; 35,0 y 70 en Quadro K1200; 108 y 1.244 en RTX 3080.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark sandbox (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AH-Mechanic-1-4B-Kindi (Mechanic v4) | Base 4B ternario + LoRA r32 | 32.768 (19.968 en 2 GB) | 68,8 % (muestreo) / 68,0 % (greedy) | Apache 2.0 | Hugging Face, requiere Kindi |
| AH-Mechanic-1-4B (bf16 o GGUF) | 4B | No disponible | 82,0 % (greedy) | No disponible | Hugging Face |
| Qwen3.5-4B sin entrenar (bf16) | 4B | No disponible | 62,7 % (muestreo) / 73,0 % (greedy) | No disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo puede cometer errores y un comando incorrecto puede dañar el sistema; el autor exige confirmación humana antes de ejecutar cada comando.
- El uso desatendido solo debe hacerse en contenedores o máquinas virtuales desechables.
- Riesgo con opciones poco frecuentes de comandos y con programas que el modelo puede no conocer; conviene revisar los comandos antes de ejecutarlos.
- Solo soporta inglés, lo que limita su uso en entornos hispanohablantes sin traducción previa.
- El adaptador solo encaja con el archivo `Ternary-Bonsai-2-4B-PTQ1_0.gguf` (sha256 `56711263ec9a9ffeaa74a3a0e58dece8127cf9268404746c721113ca76994d60`); no funciona con los pesos bf16 de Qwen3.5-4B.
- Requiere Kindi 0.7.2 o superior; versiones anteriores no pueden cargar adaptadores.
- El contexto se reduce a 19.968 tokens en tarjetas de 2 GB.
- El benchmark del autor es propio (200 tareas de sandbox) y una sola ejecución puede variar varios puntos; las tareas son retenidas pero similares en tipo a las de entrenamiento, lo que puede inflar los resultados.
- No se han publicado datos sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahtx/AH-Mechanic-1-4B-Kindi
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Versión bf16 del mismo agente: https://huggingface.co/ahtx/AH-Mechanic-1-4B
- Página del proyecto: https://amirhusain.com/mechanic
- Motor de inferencia Kindi: https://amirhusain.com/kindi
- CLI agente mechanic: https://github.com/ahtx/mechanic
