# moeshawky/rockandegg-checkpoints-staging

## Resumen

`moeshawky/rockandegg-checkpoints-staging` es un repositorio de Hugging Face que no contiene un modelo publicable, sino un area de staging privada con checkpoints intermedios, modificados y corregidos del modelo RockAndEgg, producidos durante las investigaciones de reparacion (Stage 2) y de la Stage 4. El autor, moeshawky, lo describe explicitamente como un espacio donde "nada se promociona": el modelo publicado y congelado sigue siendo `moeshawky/RockAndEgg-313M-v3` en su rama `main`.

El repositorio alberga diez directorios de checkpoints con distintos alcances: desde el ganador de la Stage 4 (`R_final3`, con 39 tensores y 626.337.154 bytes) hasta reparaciones parciales de la cabeza (`headonly_modified`, en FP32 y 1,25 GB). Todos los pesos, salvo ese ultimo, estan en FP16 y comparten el mismo tamano de fichero `model.safetensors`, lo que sugiere que se trata de variantes de un mismo modelo base de aproximadamente 313M de parametros, tal como indica el nombre del repositorio principal.

Su relevancia es fundamentalmente de trazabilidad e investigacion reproducible: documenta mediante hashes SHA-256 el contenido exacto de cada checkpoint, referencia un snapshot de codigo fuente y un archivo de evidencias, y advierte de que la paridad de servicio (serving parity) no ha sido verificada porque el entrenamiento uso un `forward_batch` parcheado en tiempo de ejecucion. No es un modelo para uso en produccion ni para evaluacion de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del repo principal sugiere RockAndEgg-313M-v3; no se detalla la arquitectura) |
| Parametros totales | no disponible de forma explicita; el nombre del modelo base indica 313M |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en FP16 y FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo (transformer, MoE, SSM o hibrida). Lo que si se documenta es el proceso de entrenamiento por etapas: una Stage 2 de reparacion con dos brazos (A y B, incluyendo una version con datos corregidos), una Stage 3 de curriculum con un estudiante principal y un control, y una Stage 4 con dos brazos (R y P). El ganador de la Stage 4 es `R_final3`, descrito como "Arm R, 2:1 replay + curriculum", es decir, entrenado con una mezcla de repeticion de datos en proporcion 2:1 y curriculum learning. El brazo P anade una penalizacion KL contra el v3 congelado sobre las tareas Choice y Score.

Un detalle tecnico relevante es que el entrenamiento utilizo un `forward_batch` parcheado en tiempo de ejecucion (`gradsafe()`, sin `copy.deepcopy(cache)`), mientras que el codigo de modelado distribuido conserva el deepcopy. Esta discrepancia implica que la paridad entre entrenamiento y servicio no esta verificada. Ademas, `headonly_modified` incluye una version localmente modificada de `modeling_rockandegg_v3.py` que difiere del fichero publicado en v3. La procedencia se garantiza por hashing de contenido, no por un repositorio git.

## Capacidades

- No se documentan capacidades funcionales del modelo en la informacion disponible.
- El repositorio contiene checkpoints de investigacion, no un modelo listo para inferencia con capacidades declaradas.
- No hay evidencia de soporte de tool calling, agentes, vision, audio ni modo de razonamiento extendido.
- El modelo base referenciado (`RockAndEgg-313M-v3`) podria tener capacidades propias, pero no se describen en esta ficha.
- La unica "capacidad" verificable del repositorio es la trazabilidad: manifiesto con hashes por fichero (`CHECKPOINTS_MANIFEST.json`) y referencias a snapshots de codigo y evidencias.

## Casos de uso

- Reproduccion de experimentos de investigacion: el repositorio permite a un investigador descargar exactamente el checkpoint `R_final3` (SHA-256 `bd30d80e546534b8`) y compararlo con las variantes de menor capacidad (`R_layer9`, `P_layer9`) para estudiar el efecto de la profundidad o capacidad en los resultados de la Stage 4.
- Auditoria de procedencia: los hashes SHA-256 por fichero y el manifiesto permiten verificar que un artefacto concreto coincide con el que se uso en un experimento, sin depender de un repositorio git.
- Estudio de estrategias de reparacion de modelos: los pares `repair_armA` / `repair_armA_corrected` y `repair_armB` permiten analizar el impacto de corregir los datos de entrenamiento en la Stage 2.
- Analisis de curriculum learning: los checkpoints `curriculum_v1_main` y `curriculum_v1_control` sirven como punto de partida (init) para la Stage 4 y permiten aislar el efecto del curriculum frente al control.
- Investigacion sobre regularizacion KL: el brazo P, que anade KL contra el v3 congelado en Choice y Score, es util para estudiar el equilibrio entre deriva del modelo y rendimiento en tareas especificas.
- Verificacion de paridad entrenamiento-servicio: dado que el entrenamiento uso un `forward_batch` parcheado, estos checkpoints son un caso de estudio para disenar pruebas de paridad antes de promover pesos a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el tamano de los ficheros (626 MB en FP16 por checkpoint), la inferencia requeriria al menos unos 2-3 GB de VRAM contando pesos, cache de activaciones y overhead del runtime, pero esta cifra no esta confirmada por el autor.
- GPU recomendadas: no disponible. Por tamano, cabria en GPUs de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4090, pero no hay validacion publicada.
- Cabe en GPU de consumo: probablemente si, segun el tamano del fichero, aunque no verificado.
- Opciones de despliegue: no disponible. El codigo de modelado requiere `modeling_rockandegg_v3.py`, por lo que no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin trabajo de adaptacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio es un area de staging privada: ningun checkpoint ha sido promocionado y no debe tratarse como version estable.
- La paridad de servicio no esta verificada: el entrenamiento uso un `forward_batch` parcheado (`gradsafe()`, sin deepcopy de la cache) mientras que el codigo distribuido conserva el deepcopy, lo que puede producir diferencias entre los resultados de entrenamiento y los de inferencia.
- `headonly_modified` incluye un fichero de modelado modificado localmente que difiere del publicado en v3; usarlo requiere revisar el diff.
- La procedencia se basa en hashing de contenido, no en un repositorio git, lo que limita la auditabilidad del historial de cambios.
- No hay licencia declarada, lo que impide determinar si el uso comercial esta permitido.
- No se declaran idiomas soportados ni sesgos conocidos.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- No apto para produccion sin un proceso previo de validacion de paridad y promocion documentado en `STAGE4_MIGRATION_HANDOFF.md`.

## Enlaces

- Repositorio de staging: https://huggingface.co/moeshawky/rockandegg-checkpoints-staging
- Modelo base publicado: https://huggingface.co/moeshawky/RockAndEgg-313M-v3 (rama `main` para v3 congelado; rama `stage4-final3` para `R_final3`)
- Snapshot de codigo fuente: https://huggingface.co/moeshawky/rockandegg-stage4-source
- Archivo de evidencias: https://huggingface.co/moeshawky/rockandegg-stage4-evidence
