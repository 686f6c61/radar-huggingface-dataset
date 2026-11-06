# oisee/Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-GGUF es una construcción comunitaria independiente, publicada por el usuario oisee, que parte del modelo ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF (a su vez una versión recortada de Qwen3.8-Flash-Next) y aplica una poda adicional de expertos: de 256 expertos por capa a 192. El objetivo declarado es ejecutar una carga de trabajo de codificación agéntica (Claude Code sobre repositorios ABAP/Go) íntegramente en la VRAM de dos GPU de consumo de 16 GB con llama.cpp.

La relevancia de esta ficha no reside en un modelo de nueva generación, sino en una técnica de optimización muy práctica: la poda de expertos por frecuencia de uso del router, medida sobre una sesión real de codificación agéntica. Los bytes de los expertos conservados se copian sin requantizar, por lo que la calidad de los pesos no cambia; solo se eliminan los expertos menos usados en ese dominio concreto. El resultado pesa 52,1 GB (de los cuales ~28,8 GB son una tabla n-gram/PLE que reside en RAM del sistema), con 101.407 millones de parámetros totales y una ventana de contexto de 192K tokens.

Es importante subrayar que se trata de una versión especializada: el propio autor advierte de que las capacidades generales y la visión se degradan respecto al modelo padre, y recomienda usar la versión de 256 expertos si se necesita versatilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.8-Flash-Next, arquitectura "qwen4exp" en llama.cpp), con MTP head para decodificacion especulativa |
| Parametros totales | 101.407.105.920 (~101,4 B) |
| Parametros activos | no disponible (top-10 de 512 expertos en el modelo original; 192 expertos activos por capa tras la poda) |
| Longitud de contexto | 194.560 tokens (192K, segun el comando recomendado) |
| Tipos de cuantizacion | ~3,5 bpw heredado del modelo padre GSQ-RCO-Coder (cuantizacion imatrix); cache KV configurable (q8_0 para claves, q5_1 para valores en la configuracion recomendada); MTP head en Q4_K |
| Idiomas soportados | no disponible (especializado en codigo; ABAP y Go verificados por el autor) |
| Licencia | qwen-community-1.0 (licencia "other" de la familia Qwen) |
| Formato de pesos | GGUF, en dos shards (52,1 GB de pesos del modelo + tabla n-gram/PLE de ~28,8 GB en el segundo shard) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es un MoE con 512 expertos enrutados (top-10). DASLab lo redujo a 256 expertos por capa mediante su metodo RCO (una busqueda optimizada por KL) y lo cuantizó a ~3,5 bpw con imatrix, seleccionando los expertos para uso en codigo y agentes. Esta version de oisee aplica una segunda poda mucho mas simple: se registro una sesion agéntica de codificacion (Claude Code trabajando sobre repositorios ABAP/Go propios), se midio con un llama.cpp parcheado la suma de pesos del router de cada experto y se eliminaron los 64 expertos con menor peso acumulado, en dos pasos (256 → 224 → 192). Los bytes de los expertos conservados se copian sin cambios; solo se eliminan las filas del router correspondientes y se ajusta `expert_count` a 192. Atencion, experto compartido y la tabla n-gram/PLE no se tocan.

No hay entrenamiento ni fine-tuning en esta version: es una transformacion puramente estructural sobre pesos ya cuantizados. Para inferencia, el autor recomienda decodificacion especulativa combinada: un MTP head (cabecera de multi-token prediction de unsloth, requantizada de Q8_0 a Q4_K, 3,0 GB) mas n-gram speculation simple, con verificacion de cada token borrador por el modelo principal. Durante la seleccion se observo que con 160 expertos el modelo falla la comprobacion de comportamiento agéntico (1/10 aciertos), mientras que con 192 se mantiene (10/10), lo que sugiere que este punto es el limite practico de la poda para este dominio.

## Capacidades

- Generacion de codigo y edicion de repositorios en flujos agénticos, verificado por el autor con Claude Code sobre repositorios ABAP y Go privados.
- Tool calling / function calling: verificado; en la prueba de "does it act?" el modelo emitio una llamada a herramienta en 20 de 20 repeticiones, y en un replay de 21 pasos agénticos actuo correctamente en 18 y eligio la misma herramienta en 17.
- Razonamiento multi-paso agéntico: 2 de 2 tareas agénticas reales completadas con tests ocultos (7,6 y 28,4 minutos de reloj).
- Contexto largo: hasta ~192K tokens de contexto util, con velocidad de decodificacion mantenida (~30 tok/s por encima de 70K).
- Capacidades heredadas del modelo padre que NO se han verificado tras la poda: vision/multimodalidad (la sesion de poda fue solo texto), conocimiento general y tareas no relacionadas con codigo (se espera degradacion adicional).

## Casos de uso

- Codificacion agéntica local con Claude Code: el caso de uso para el que fue construido; el modelo cabe en 2×16 GB de VRAM y mantiene sesiones de herramientas de 20+ pasos con contexto de decenas de miles de tokens.
- Mantenimiento de codigo legado ABAP: el autor lo probo especificamente sobre repositorios ABAP, un lenguaje con escaso soporte en modelos pequeños; util para refactors y analisis de sistemas SAP sin enviar codigo a la nube.
- Desarrollo en Go: segundo lenguaje verificado en la sesion de poda; adecuado para revision y edicion de codigo en pipelines locales.
- Asistentes de codigo con privacidad estricta: al ejecutarse 100% local con llama.cpp, permite trabajar con codigo propietario sin exfiltracion a APIs externas.
- Chatbots de soporte tecnico interno sobre bases de codigo propias: la plantilla de chat modificada permite mensajes de sistema a mitad de conversacion, algo que clientes agénticos como Claude Code necesitan.
- Automatizacion de CI/CD local: puede integrarse como backend OpenAI-compatible (llama-server) para tareas de revision de pull requests o correccion de tests, con tool calling verificado.
- Experimentacion en poda de expertos: el repo documenta el metodo completo (medicion de router, corte en dos fases, umbral de fallo a 160 expertos), util como referencia para podas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (SWE-bench, LiveCodeBench, MMLU, etc.) en la informacion disponible; el autor lo indica explicitamente. Los unicos datos son mediciones propias del autor en una unica maquina (2× RTX 4060 Ti 16 GB, i7-10700K, 128 GB DDR4), una ejecucion por tarea, que deben tomarse como indicaciones:

| Comprobacion | Resultado |
|---|---|
| "Does it act?" (primer paso de tarea agéntica, 20 repeticiones) | 20/20 |
| Replay corto de tarea agéntica (21 pasos) | actuo 18/21, misma herramienta 17/21 |
| Tareas agénticas reales con Claude Code (tests ocultos) | 2/2 resueltas (7,6 y 28,4 min) |
| Velocidad de decodificacion (MTP + n-gram) | ~45 tok/s < 40K contexto; ~35 tok/s a 40–70K; ~30 tok/s > 70K |
| Aceptacion MTP en ejecuciones reales | ~50–65%; ~70% de tokens generados procedentes de borradores |
| KL de cache V q5_1 frente a q8_0 (32K contexto) | 0,012 (suelo ruido 0,0075) |
| Comprobacion con 160 expertos (no publicado) | 1/10 (fallo); 192 expertos: 10/10 |

## Requisitos de hardware

- VRAM estimada: con la configuracion recomendada, los pesos del modelo (excluida la tabla n-gram/PLE) caben en dos GPU de 16 GB con contexto largo; sin MTP head, quedan ~4 GB libres a 192K de contexto. La tabla n-gram/PLE (~28,8 GB) reside en RAM del sistema, por lo que se recomiendan 64 GB o mas de RAM (el equipo de referencia tiene 128 GB).
- GPU recomendadas: 2× RTX 4060 Ti 16 GB (configuracion verificada); en principio cualquier par de GPU de consumo con 16 GB y soporte CUDA deberia servir, ajustando `-ts` y `-otd`.
- Consumer GPU: si, es el objetivo explicito del proyecto; verificado en 2× RTX 4060 Ti 16 GB.
- Despliegue: llama.cpp exclusivamente (requiere un build reciente con arquitectura "qwen4exp", flags `--spec-type draft-mtp`, `-otd`/`-devd` y `--fit-target`; builds antiguos no cargan el modelo). Se distribuye como servidor OpenAI-compatible (`llama-server`) con plantilla Jinja. No hay soporte documentado de vLLM, TGI u Ollama.
- Latencia/throughput: ~45 tok/s por debajo de 40K de contexto, ~35 tok/s entre 40–70K y ~30 tok/s por encima de 70K, con MTP y n-gram speculation activados en el hardware de referencia.
- MTP head adicional: 3,0 GB (mtp-Qwen3.8-Flash-Next-exps-Q4_K.gguf de unsloth), colocada en la segunda GPU.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos/capa | Contexto | Formato | Enfoque | Licencia |
|---|---|---|---|---|---|---|
| oisee/...-192E-GGUF (este) | ~101,4 B | 192 | 192K | GGUF (~3,5 bpw) | Codigo agéntico en 2×16 GB | qwen-community-1.0 |
| ISTA-DASLab/...GSQ-RCO-Coder-GGUF (padre) | ~101,4 B | 256 | 192K | GGUF (~3,5 bpw) | Codigo agéntico, capacidades mas conservadas | qwen-community-1.0 |
| Qwen3.8-Flash-Next (base) | no disponible | 512 (top-10) | no disponible | no disponible | Modelo general multimodal | qwen-community-1.0 |

La eleccion es directa: si solo se necesita codigo agéntico en hardware de consumo, esta version de 192 expertos ahorra VRAM y mantiene el comportamiento agéntico verificado; para uso general, multimodal o dominios fuera de codigo, el padre de 256 expertos es la opcion recomendada por el propio autor.

## Limitaciones y advertencias

- Especializacion extrema: la poda se realizo sobre una unica sesion de codificacion ABAP/Go; el conocimiento general y las tareas no relacionadas con codigo se degradan mas que en el modelo padre, y la vision/multimodalidad no se ha probado tras la poda (se podo sobre una sesion solo-texto).
- Mediciones de baja confianza estadistica: una ejecucion por tarea, una sola maquina, muestras pequenas; el autor pide explicitamente tratarlas como indicaciones, no como benchmarks.
- No hay benchmarks estandar publicados (SWE-bench, LiveCodeBench, etc.), por lo que la calidad relativa frente a otros modelos de codigo es desconocida.
- Umbral de poda fragil: con 160 expertos el comportamiento agéntico colapsa (1/10); 192 es el minimo verificado. Cualquier modificacion adicional requiere revalidar.
- Requisitos de software estrictos: necesita un build muy reciente de llama.cpp con arquitectura "qwen4exp" y flags concretos; builds antiguos no cargan el modelo. La plantilla de chat embebida falla con HTTP 500 ante mensajes de sistema a mitad de conversacion si no se usa la plantilla modificada incluida.
- Requiere mucha RAM del sistema (~28,8 GB solo para la tabla n-gram/PLE, ademas del resto del runtime).
- Licencia qwen-community-1.0: al ser una licencia "other" de la familia Qwen, conviene revisar sus restricciones (limites de usuarios mensuales y de ingresos en usos comerciales tipicos de esta familia) antes de desplegar en produccion comercial.
- Proyecto comunitario independiente, sin afiliacion ni respaldo de ISTA-DASLab ni de Qwen; sin garantia de mantenimiento.
- Riesgo de alucinacion: no evaluado; al ser un modelo de codigo podado y no verificado en benchmarks, se recomienda validacion de tests en todo flujo de produccion.

## Enlaces

- Modelo: https://huggingface.co/oisee/Qwen3.8-Flash-Next-GSQ-RCO-Coder-192E-GGUF
- Modelo padre (ISTA-DASLab, 256 expertos): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Papers citados en los tags: https://arxiv.org/abs/2604.18556 y https://arxiv.org/abs/2605.00649
- MTP head de unsloth referenciada: mtp-Qwen3.8-Flash-Next-exps-Q4_K.gguf (en el perfil de unsloth en Hugging Face)
- Demo o repositorio de codigo adicional: no disponible
