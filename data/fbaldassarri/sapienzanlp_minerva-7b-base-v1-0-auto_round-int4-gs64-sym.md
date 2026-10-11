# fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_round-int4-gs64-sym

## Resumen

Esta ficha describe `fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_round-int4-gs64-sym`, una version cuantizada a INT4 del modelo base italiano `sapienzanlp/Minerva-7B-base-v1.0`, publicado por SapienzaNLP. La cuantizacion la ha realizado el usuario fbaldassarri mediante Intel AutoRound (algoritmo SignRound, cuantizacion weights-only), con 4 bits, grupo de 64 y esquema simetrico, y se distribuye en formato `auto_round` sobre safetensors con licencia Apache 2.0.

El modelo es un `causal-lm` de tipo Mistral, orientado a generacion de texto en italiano e ingles, y se presenta explicitamente como modelo **base / de completado**, no como modelo instruido: se le debe dar texto crudo y continuar la generacion, sin plantilla de chat ni capacidades de seguimiento de instrucciones documentadas. Su relevancia practica esta en el despliegue: al estar cuantizado a INT4 reduce el consumo de memoria y, segun el autor, ofrece una aceleracion de 2-3x respecto a la version en precision completa, con una ligera perdida de exactitud en W4G64.

El artefacto esta pensado especificamente para inferencia en hardware Intel: CPU mediante `intel-extension-for-pytorch`, iGPU Intel Arc y NPU Intel (AI Boost en la serie Core Ultra) mediante OpenVINO. Es, por tanto, una pieza de interes para quien necesite ejecutar un LLM italiano de tamano medio en equipos sin GPU dedicada, o quiera reproducir un pipeline de cuantizacion AutoRound documentado paso a paso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion (tipo Mistral, `model_type: mistral`); detalles completos no disponibles |
| Parametros totales | 1.414.795.264 segun el recuento de safetensors del repositorio; el nombre del modelo y el modelo base indican 7B (discrepancia no explicada, ver limitaciones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 (4 bits), group size 64, simetrica, metodo WoQ SignRound (AutoRound); no se documentan otras cuantizaciones en este repositorio |
| Idiomas soportados | Italiano (it) e ingles (en) |
| Licencia | Apache 2.0 (con `license_link` a choosealicense.com) |
| Formato de pesos | `safetensors` en formato `auto_round`; carga en `torch.bfloat16` |

## Arquitectura y entrenamiento

El modelo es una version cuantizada del checkpoint base `sapienzanlp/Minerva-7B-base-v1.0`, cuya arquitectura declarada en los metadatos es `mistral` con `pipeline_tag: text-generation` y clase `causal-lm`. Esto implica un transformer decoder-only con atencion causal y generacion autoregresiva token a token. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base recibio fases de RLHF o DPO; al tratarse de una variante `base`, lo esperable es que no haya alineamiento por instrucciones, pero este punto no esta confirmado en la documentacion disponible.

La innovacion tecnica de este artefacto concreto es el proceso de cuantizacion. Se aplico Intel AutoRound v0.15.1 con el algoritmo SignRound en modalidad weights-only (WoQ), bits=4, group_size=64 y simetria activada, usando `torch.bfloat16` como tipo de carga para el ajuste. La calibracion se ejecuto en CPU con 128 muestras, 200 iteraciones de tuning, longitud de secuencia 512 y batch size 4; el proceso completo tardo 41.878,8 segundos (unas 698 minutos) y finalizo el 4 de octubre de 2026. El entorno registrado incluye transformers 4.55.3 y torch 2.14.0+cpu. El autor documenta una receta de replicacion en tres pasos (bootstrap del pipeline, cuantizacion con `runner.py` y receta Python independiente con `AutoRound.quantize_and_save`).

## Capacidades

- Generacion de texto autoregresiva en italiano e ingles, en modo completado (continuacion de un prompt de texto crudo).
- Capacidad multilingue limitada a los dos idiomas declarados en los metadatos (it, en).
- Base adecuada para *fine-tuning* posterior en tareas de procesamiento del lenguaje natural en italiano, ya que se distribuye como checkpoint base y no como modelo instruido.
- Inferencia de bajo consumo en hardware Intel: CPU con `intel-extension-for-pytorch`, iGPU Arc y NPU Intel (AI Boost de la serie Core Ultra) mediante OpenVINO.
- Aceleracion declarada por el autor de 2-3x frente a la version sin cuantizar, con perdida leve de exactitud en la configuracion W4G64.
- Soporte de tool calling / function calling: no documentado; al ser un modelo base sin alineamiento, no se espera.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision, audio o modo "thinking": no documentadas.

## Casos de uso

- **Completado de texto en italiano**: dado un fragmento de texto, el modelo lo continua. Es el uso directo que documenta la propia model card (prompt "The quick brown fox", `max_new_tokens=64`), valido para asistentes de redaccion o generacion de borradores en italiano.
- **Punto de partida para fine-tuning en dominio italiano**: al ser un checkpoint base cuantizado para inferencia, sirve como referencia para comparar el rendimiento de un modelo ajustado en FP16/BF16 frente a su version INT4, o para medir el impacto de la cuantizacion antes de decidir el despliegue.
- **Despliegue en CPU o NPU Intel sin GPU dedicada**: el artefacto esta explicitamente preparado para `intel-extension-for-pytorch` y OpenVINO, por lo que encaja en estaciones de trabajo, portatiles Core Ultra o servidores de borde donde no hay GPU NVIDIA disponible.
- **Aumento de datos sinteticos en italiano**: generacion de texto adicional para ampliar corpus de entrenamiento en tareas de PLN italianas (clasificacion, extraccion de entidades), siempre con revision humana posterior por el riesgo de alucinacion inherente a un modelo base.
- **Autocompletado en herramientas internas**: integracion en editores, formularios o CMS para sugerir continuaciones de texto en italiano, aprovechando que el modelo funciona con prompts de texto crudo sin plantilla de chat.
- **Investigacion sobre cuantizacion WoQ**: reproduccion del pipeline documentado (AutoRound v0.15.1, 128 muestras de calibracion, 200 iteraciones) para estudiar el compromiso entre memoria, latencia y calidad en W4G64.
- **Prototipado de bajo coste en portatil**: al reducir el peso de los parametros a 4 bits, permite experimentar con un modelo de la familia 7B en equipos de consumo sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para la version cuantizada ni como comparacion con el modelo base sin cuantizar. El unico dato de rendimiento declarado es cualitativo: el autor afirma una aceleracion de 2-3x y una "ligera caida de exactitud" en W4G64, sin cuantificar. No se deben asumir valores concretos.

## Requisitos de hardware

- **VRAM estimada (inferencia)**: para un modelo de 7B en INT4 con group size 64, el peso de los parametros ronda los 3,5-4,5 GB, mas el overhead de activaciones, cache KV y runtime. Cifra exacta no disponible en la informacion proporcionada.
- **GPU recomendadas**: no se especifican en la model card. El artefacto esta orientado a CPU Intel, iGPU Intel Arc (por ejemplo Core Ultra 185H, citado en la receta) y NPU Intel AI Boost via OpenVINO.
- **Compatibilidad con GPU de consumo**: por tamano, una cuantizacion INT4 de un modelo de 7B cabe en GPUs de consumo con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, etc.), aunque el autor no documenta rutas CUDA/ROCm para este artefacto concreto; el pipeline de cuantizacion ofrece flags opcionales `--cuda` y `--rocm`.
- **Opciones de despliegue**: `transformers` con `AutoModelForCausalLM.from_pretrained(..., device_map="auto")`; `intel-extension-for-pytorch` para CPU e iGPU Arc; OpenVINO para NPU Intel; el repositorio incluye la etiqueta `text-generation-inference`, aunque no se documenta una configuracion especifica de TGI, vLLM, llama.cpp u Ollama. No se declaran ficheros GGUF.
- **Latencia y throughput**: solo se declara una mejora relativa de 2-3x frente a la version sin cuantizar. No hay cifras absolutas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos verificados sobre modelos alternativos de la misma categoria (LLM italianos de ~7B cuantizados a INT4) que permitan una comparacion rigurosa de parametros, contexto o rendimiento. La unica comparacion documentable es contra el propio modelo base.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_round-int4-gs64-sym` | Recuento safetensors: 1.414.795.264 (nombre: 7B) | No disponible | INT4, group size 64, simetrica, AutoRound | Apache 2.0 | HuggingFace |
| `sapienzanlp/Minerva-7B-base-v1.0` (modelo base) | 7B (segun denominacion) | No disponible | Sin cuantizar (BF16/FP16) | Apache 2.0 (segun el repositorio cuantizado) | HuggingFace |
| Otros LLM italianos de ~7B cuantizados | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Modelo base, no instruido**: no sigue instrucciones ni mantiene formato de chat; la propia model card indica que se le debe pasar texto crudo. No debe usarse como asistente conversacional sin ajuste previo.
- **Riesgo de alucinacion**: al no haber pasado por fases de alineamiento documentadas (RLHF/DPO), la generacion puede producir contenido factualmente incorrecto o incoherente sin ninguna salvaguarda.
- **Perdida de calidad por cuantizacion**: el autor reconoce una "ligera caida de exactitud" en W4G64 respecto a la version sin cuantizar. No hay medicion cuantitativa de esa perdida.
- **Idiomas limitados**: solo italiano e ingles declarados; el rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- **Discrepancia en el recuento de parametros**: el repositorio declara 1.414.795.264 parametros en safetensors, muy por debajo de los 7B que sugiere el nombre del modelo base. Esto podria indicar un indexado parcial de los shards o un error de metadatos; conviene verificar la integridad del repositorio antes de usarlo en produccion.
- **Longitud de contexto desconocida**: no se documenta la ventana de contexto, lo que impide planificar tareas de contexto largo con garantias.
- **Restricciones de licencia**: la licencia declarada es Apache 2.0, que permite uso comercial, pero la propia model card incluye un descargo que afirma que el modelo "se ha desarrollado solo con fines de investigacion" y se entrega "sin garantia". Esa tension entre la licencia y el aviso debe resolverse antes de un despliegue comercial.
- **Metadatos contradictorios**: el campo `inference: false` aparece en el YAML de la model card pese a que `pipeline_tag` es `text-generation` y el modelo se presenta como listo para inferencia. Conviene tratarlo como una inconsistencia de metadatos, no como una prohibicion funcional.
- **Cero adopcion verificable**: en el momento de la consulta el repositorio registra 0 descargas y 0 "likes", por lo que no existe validacion independiente por parte de la comunidad.
- **Fechas de publicacion atipicas**: los metadatos indican creacion el 10 de octubre de 2026 y calibracion en octubre de 2026; conviene contrastar la procedencia del artefacto.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-base-v1.0
- Repositorio del modelo base referenciado en los metadatos: sapienzanlp/Minerva-7B-base-v1.0
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- Pipeline de cuantizacion auto-round-pipeline: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda realizada; los resultados devueltos correspondian a software de copias de seguridad no relacionado y se han descartado.
