# florianvoss/Qwen3.5-9B-Autoround-a16w4-Modalix

## Resumen

Este repositorio no contiene un checkpoint de Transformers al uso, sino artefactos de ejecucion compilados para el runtime LLiMa sobre el acelerador SiMa.ai Modalix. Se trata de una version cuantizada y compilada del modelo base Qwen/Qwen3.5-9B, preparada por el usuario florianvoss con AutoRound (INT4 simetrico, tamano de grupo 256) y SmoothQuant (alpha 0,5), orientada a inferencia en hardware de borde.

El paquete incluye pesos cuantizados del decodificador, la cabeza de salida y las proyecciones de vision, ademas de 142 programas MLA (Multi-Level Assembly) compilados en formato ELF, los activos del tokenizador y las configuraciones de runtime en el directorio `devkit/`. La capacidad de contexto del artefacto compilado es de 4096 tokens, con un tamano de grupo de prefill de 128 y entrada de vision de 448 x 448 pixeles.

Su relevancia radica en que ejemplifica el flujo de despliegue de modelos generativos de 9B en aceleradores de borde especializados (no GPU), combinando tecnicas de cuantizacion post-entrenamiento con compilacion especifica para un runtime propietario. No obstante, el autor indica explicitamente que la evaluacion en el runtime de Modalix esta pendiente, y el repositorio no registra descargas ni licencia declarada a fecha de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Los artefactos referencian proyecciones DeltaNet (QKV/Z/salida) y programas MLA, lo que apunta a una arquitectura hibrida con atencion lineal, pero no se documenta formalmente |
| Parametros totales | 9B (segun la denominacion del modelo base Qwen/Qwen3.5-9B) |
| Parametros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 4096 tokens (capacidad del runtime compilado; grupo de prefill de 128) |
| Tipos de cuantizacion | INT4 simetrico AutoRound (grupo 256) en capas lineales del decodificador y proyecciones DeltaNet QKV/Z/salida; INT4 simetrico GPTQ (grupo 256) en la cabeza de salida; INT8 RTN por canal de salida en capas lineales de vision y proyector; BF16 en proyecciones A/B de DeltaNet, parametros de convolucion, parametros de normalizacion, `A_log` y `dt_bias` |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Artefactos compilados para LLiMa (142 programas MLA en ELF); no es un checkpoint safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio distribuye artefactos de ejecucion, no pesos entrenables ni un checkpoint convertible. El flujo parte del modelo Qwen/Qwen3.5-9B, sobre el que se aplica cuantizacion post-entrenamiento: AutoRound con granularidad de grupo 256 para las capas lineales del decodificador, GPTQ para la cabeza de salida y RTN INT8 para el codificador de vision y el proyector. Determinados tensores sensibles (proyecciones A/B de DeltaNet, convoluciones, normalizaciones, `A_log` y `dt_bias`) se conservan en BF16, presumiblemente para preservar estabilidad numerica.

La referencia a proyecciones DeltaNet y la presencia de "programas MLA" sugieren que el modelo base combina mecanismos de atencion lineal con atencion estandar, aunque la model card no detalla la composicion de capas ni los datos de entrenamiento. No se aporta informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF o DPO. El autor indica que la compilacion, la validacion del archivo y el despliegue local con `llima-deploy` finalizaron correctamente, pero la evaluacion en el runtime de Modalix queda pendiente.

## Capacidades

- Generacion de texto: el artefacto incluye el decodificador cuantizado, por lo que el uso previsto es la generacion autoregresiva en el dispositivo.
- Procesamiento de vision: hay pesos de codificador de vision y proyector cuantizados, con entrada de 448 x 448 pixeles, empaquetados como ELF por capa. Esto indica capacidad multimodal de entrada de imagen, aunque no se documentan las tareas concretas.
- Contexto de 4096 tokens: suficiente para conversaciones multi-turno cortas o documentos de extension reducida, no para contextos largos.
- Cache KV cuantizada: se activa la cuantizacion de la cache KV, lo que reduce el uso de memoria durante la decodificacion.
- Comparticion de filtros y embeddings cuantizados: optimizaciones de memoria y ancho de banda propias del runtime.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas del modelo base no se declaran en este repositorio).
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Inferencia de vision-lenguaje en el borde: al incluir codificador de vision a 448 x 448, el modelo puede emplearse en tareas de descripcion de imagenes o respuesta a preguntas visuales directamente en el dispositivo Modalix, sin enviar datos a la nube.
- Asistentes locales con requisitos de privacidad: el despliegue sobre hardware de borde permite mantener las entradas del usuario en el propio equipo, util en entornos sanitarios, industriales o de defensa donde no se admite salida de datos.
- Clasificacion y resumen de documentos cortos: con 4096 tokens de contexto, encaja en resumen de informes, actas o correos que no superen ese limite.
- Automatizacion industrial en linea de produccion: el acelerador Modalix esta pensado para vision embebida, de modo que el modelo puede integrarse en inspeccion visual asistida por lenguaje (por ejemplo, generar informes a partir de detecciones).
- Robots y sistemas autonomos: extraccion de instrucciones en lenguaje natural a partir de imagenes de camara en plataformas con presupuesto energetico reducido.
- Generacion de texto en dispositivos sin GPU: cualquier escenario donde no haya GPU disponible pero si un acelerador SiMa.ai y el runtime LLiMa instalado.
- Reproduccion de investigacion en cuantizacion: sirve como caso de estudio de una pipeline AutoRound + SmoothQuant + GPTQ compilada, para comparar perdida de calidad frente al modelo base en BF16. Se advierte de que la evaluacion de runtime esta pendiente, por lo que estos usos son hipoteticos hasta que el autor publique resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion en el runtime de Modalix (Modalix runtime evaluation) esta pendiente, y no se aportan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- El modelo no se ejecuta sobre GPU convencional: esta compilado especificamente para el runtime LLiMa sobre SiMa.ai Modalix.
- VRAM estimada: no aplica / no disponible (el destino es un SoC de borde, no una GPU).
- GPU recomendadas: no aplica. No hay soporte documentado para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el paquete no es un checkpoint safetensors ni GGUF, por lo que no puede cargarse en llama.cpp, Ollama, vLLM o TGI.
- Opciones de despliegue: `llima run /ruta/al/repositorio` sobre Modalix con un runtime LLiMa compatible. Se debe descargar el repositorio completo conservando la estructura de directorios (`devkit/` y `elf_files/`).
- Tamano del repositorio: 13,7 GB.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| florianvoss/Qwen3.5-9B-Autoround-a16w4-Modalix | 9B | 4096 tokens | INT4 AutoRound + INT4 GPTQ + INT8 RTN + BF16 selectivo | ELF compilado para LLiMa | No disponible | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | 9B | No disponible | BF16 (sin cuantizar) | No disponible | No disponible | Referenciado como `base_model` |
| Alternativas cuantizadas para GPU (por ejemplo, variantes GGUF o AWQ de la misma familia) | 9B | No disponible | INT4 / INT8 | GGUF / safetensors | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estas opciones.

## Limitaciones y advertencias

- No es un checkpoint de Transformers: no puede cargarse con `from_pretrained`, ni convertirse directamente a GGUF, ni ejecutarse en vLLM, TGI, Ollama o llama.cpp.
- Dependencia de hardware propietario: requiere un acelerador SiMa.ai Modalix y un runtime LLiMa compatible; sin ese entorno, los artefactos son inutiles.
- Evaluacion pendiente: el propio autor indica que la validacion en el runtime de Modalix no se ha completado, por lo que no hay garantia de que la inferencia funcione correctamente ni de la calidad de las salidas.
- Sin licencia declarada: no se especifican los terminos de uso, lo que impide confirmar si se permite el uso comercial. Debe consultarse al autor y a la licencia del modelo base.
- Contexto limitado a 4096 tokens: restringe tareas de contexto largo, como analisis de repositorios completos o documentos extensos.
- Perdida por cuantizacion: la combinacion de AutoRound INT4, GPTQ INT4 e INT8 RTN puede degradar la precision en tareas sensibles, especialmente en razonamiento aritmetico y generacion de codigo. No se han publicado mediciones de esta perdida.
- Riesgo de alucinacion: no disponible de forma especifica; aplica el riesgo general de los modelos generativos del mismo tamano, agravado por la falta de evaluacion.
- Sesgos: no documentados. No hay informacion sobre la composicion del dataset de entrenamiento del modelo base ni sobre procesos de alineacion.
- Idiomas: no declarados en este repositorio; no se puede asumir soporte multilingue.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su fiabilidad.
- Vision limitada a 448 x 448: resoluciones superiores requeririan reescalado previo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/florianvoss/Qwen3.5-9B-Autoround-a16w4-Modalix
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- SiMa.ai (fabricante del acelerador Modalix): https://sima.ai
- AutoRound (Intel, cuantizacion post-entrenamiento): https://github.com/intel/auto-round
- SmoothQuant (MIT, suavizado de activaciones): https://github.com/mit-han-lab/smoothquant
- GPTQ (cuantizacion post-entrenamiento): https://github.com/IST-DASLab/gptq

Nota: los resultados de la busqueda web proporcionados no guardan relacion con el modelo (tratan sobre fibra de poliamida) y no se han utilizado como fuente.
