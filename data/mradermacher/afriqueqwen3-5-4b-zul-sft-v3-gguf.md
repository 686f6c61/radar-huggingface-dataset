# mradermacher/AfriqueQwen3.5-4B-zul-sft-v3-GGUF

## Resumen

AfriquQwen3.5-4B-zul-sft-v3-GGUF es una cuantizacion estatica en formato GGUF del modelo SaarAI/AfriquQwen3.5-4B-zul-sft-v3, publicada por mradermacher, un autor conocido en la comunidad por generar versiones GGUF de modelos de terceros para su uso con llama.cpp y herramientas compatibles. El modelo base parte de la familia Qwen3.5 (segun la nomenclatura del nombre) y ha sido sometido a un ajuste fino supervisado (SFT) orientado al idioma zulu, con un tamano nominal de 4B parametros. El repositorio GGUF, sin embargo, declara 333.514.240 parametros reales en safetensors, lo que sugiere una discrepancia entre el nombre comercial y el contenido efectivo del checkpoint o una particularidad del proceso de conversion.

La relevancia de esta ficha radica en que se trata de un modelo especializado en una lengua africana de bajos recursos, empaquetado en un formato (GGUF) que permite su despliegue en hardware de consumo mediante llama.cpp. No obstante, la informacion publica disponible es extremadamente escasa: no hay licencia declarada, no se especifican idiomas, no hay pipeline definido y el repositorio no registra descargas ni likes en el momento de la consulta.

Se trata, por tanto, de un artefacto de nicho, con muy poca trazabilidad documental, cuya evaluacion rigurosa requeriria consultar la model card del modelo base (SaarAI/AfriquQwen3.5-4B-zul-sft-v3) y validar empiricamente el comportamiento del checkpoint convertido. Esta ficha recoge exclusivamente los datos verificables disponibles y marca explicitamente como "no disponible" todo aquello que no se ha podido confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only derivado de Qwen3.5, no confirmado) |
| Parametros totales | 333.514.240 (segun safetensors del repo); el nombre indica 4B, discrepancia no aclarada |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible (el sufijo "zul" sugiere zulu, sin confirmacion oficial) |
| Licencia | no disponible |
| Formato de pesos | GGUF (multiples cuantizaciones); el modelo base estaria en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Por la nomenclatura (Qwen3.5) y por el ecosistema en el que se publica, cabe inferir una arquitectura transformer decoder-only con atencion causal, pero esta inferencia no esta confirmada por la documentacion disponible. El sufijo "sft-v3" indica que el checkpoint ha pasado por al menos tres iteraciones de ajuste fino supervisado, presumiblemente sobre datos en zulu, si bien no se documenta la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO.

La unica informacion tecnica concreta que aporta la model card es el proceso de cuantizacion: se trata de cuantizaciones estaticas generadas por la herramienta de mradermacher, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que la conversion se realizo desde pesos en formato Hugging Face. No se documenta ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.).

## Capacidades

- Generacion de texto autoregresiva en formato GGUF, ejecutable con llama.cpp y derivados.
- Presunta especializacion en zulu (idioma zul) por el sufijo del nombre, sin confirmacion documental.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multimodal (vision, audio) ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; no se declara cobertura de idiomas.
- No se documentan capacidades de codigo o matematicas de forma especifica.

## Casos de uso

- Procesamiento de texto en zulu en entornos con hardware limitado: al estar cuantizado en GGUF (hasta Q2_K), puede ejecutarse en CPU o GPU de gama baja, lo que permite desplegar procesamiento de lengua zulu en infraestructura modesta, siempre que se valide empiricamente la calidad del modelo.
- Generacion de contenido asistida en lengua zulu: redaccion de borradores, resumenes o respuestas en un idioma con escasa cobertura de modelos grandes, util para medios, ONG o administraciones que trabajen con comunidades zuluhablantes.
- Experimentacion academica en NLP de bajos recursos: investigadores que estudien el rendimiento de modelos ajustados en lenguas africanas pueden usar esta version cuantizada para comparar coste y calidad frente al checkpoint completo en safetensors.
- Integracion en prototipos locales con llama.cpp: al no requerir servidores GPU dedicados, encaja en demos offline, entornos air-gapped o dispositivos de campo donde no hay conectividad.
- Traduccion asistida zulu-espanol o zulu-ingles como componente de un pipeline mayor: el modelo podria servir como generador en un sistema de traduccion, aunque la calidad debe medirse antes de producción.
- Filtrado y clasificacion de texto en zulu: tareas de etiquetado, moderacion o extraccion de informacion sobre corpus en zulu, aprovechando el ajuste SFT especifico al idioma.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes (de Q2_K a f16), lo que permite estudiar el impacto de la cuantizacion en la calidad de salida para este modelo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un checkpoint de ~333 millones de parametros, la inferencia en f16 requiere aproximadamente 0,7 GB solo de pesos; en Q4_K_M en torno a 0,2-0,3 GB; en Q2_K por debajo de 0,2 GB. Estas cifras son estimaciones tecnicas basadas en el numero de parametros declarado, no datos medidos.
- Si el modelo real fuese de 4B parametros (como sugiere el nombre), las necesidades serian aproximadamente 8 GB en f16 y 2,5-3 GB en Q4_K_M; la discrepancia con los 333 millones declarados impide dar una cifra definitiva.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) cubriria holgadamente el escenario de 333 millones de parametros; para un escenario de 4B real, se recomendaria RTX 3060 12 GB, RTX 4070 o superiores. GPUs de datacenter (A100, H100) no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas, incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no son la via natural para GGUF, aunque vLLM tiene soporte experimental para algunos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/AfriquQwen3.5-4B-zul-sft-v3-GGUF | 333.514.240 declarados (nombre indica 4B) | no disponible | no disponible | GGUF | Cuantizacion de terceros, sin benchmarks |
| SaarAI/AfriquQwen3.5-4B-zul-sft-v3 | no disponible | no disponible | no disponible | safetensors (presumible) | Modelo base del que deriva esta cuantizacion |
| Qwen3.5 (familia base) | no disponible en esta ficha | no disponible | no disponible | safetensors / GGUF | Familia de origen segun nomenclatura, sin datos confirmados |

No se dispone de datos suficientes para establecer una comparativa cuantitativa fiable con alternativas de la misma categoria; la tabla anterior recoge unicamente la relacion de dependencia entre el modelo base y esta cuantizacion.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; es imprescindible consultar la licencia del modelo base antes de cualquier despliegue en produccion.
- Discrepancia critica entre el nombre ("4B") y los parametros reales declarados en safetensors (333.514.240): puede tratarse de un error de metadatos, de un modelo podado o de una nomenclatura no literal; debe verificarse antes de dimensionar hardware.
- Sin benchmarks publicados: no hay evidencia empirica de calidad, por lo que cualquier uso en produccion requiere evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay documentacion de mitigaciones especificas.
- Sesgos conocidos: no documentados; los modelos ajustados en lenguas de bajos recursos pueden presentar sesgos derivados de la escasez y calidad del corpus de entrenamiento.
- Cobertura idiomatica no declarada: no se confirma oficialmente que el modelo este especializado en zulu ni que mantenga competencia en otros idiomas.
- Contexto no documentado: no se puede planificar su uso en tareas de contexto largo sin verificar la ventana real.
- Trazabilidad limitada: repositorio sin descargas ni interacciones, creado y actualizado en fechas muy proximas (2026-11-21), lo que sugiere publicacion reciente y sin validacion comunitaria.
- Al ser una cuantizacion de terceros, no hay garantia de que el proceso de conversion preserve fielmente el comportamiento del modelo base en todas las variantes (especialmente Q2_K e IQ4_XS).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AfriquQwen3.5-4B-zul-sft-v3-GGUF
- Modelo base: https://huggingface.co/SaarAI/AfriquQwen3.5-4B-zul-sft-v3
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
