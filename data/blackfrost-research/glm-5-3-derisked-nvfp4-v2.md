# Blackfrost-Research/GLM-5.3-DERISKED-NVFP4-V2

## Resumen

GLM-5.3-DERISKED-NVFP4-V2 es una publicacion de pesos cuantizados a NVFP4 del modelo GLM-5.3-BF16 de zai-org, distribuida por Blackfrost-Research bajo su propio regimen de licencia comercial. Se trata de un modelo de lenguaje de tipo mixture-of-experts (MoE) con 390.942.074.880 parametros totales almacenados en safetensors, orientado a generacion de texto conversacional en ingles y chino. El repositorio ocupa 464,9 GB y emplea la arquitectura identificada en los metadatos como `glm_moe_dsa`.

El modelo no es un entrenamiento desde cero, sino un derivado: parte del checkpoint BF16 de zai-org y aplica cuantizacion de 4 bits en formato NVFP4 mediante ModelOpt, con soporte declarado para SGLang y hardware Blackwell. El sufijo "DERISKED" hace referencia a un proceso de red-teaming y security research que, segun la familia de modelos de Blackfrost, altera el comportamiento del modelo sin necesidad de prompt, adaptador ni filtro en tiempo de ejecucion.

Su relevancia practica es doble: por un lado, reduce el coste de despliegue de un modelo de ~391.000 millones de parametros de ~782 GB en BF16 a ~196 GB en NVFP4; por otro, introduce una capa de licenciamiento comercial propietario sobre pesos derivados de un modelo abierto, lo que condiciona su uso en produccion. El acceso esta restringido (gated) y el modelo no registraba descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), etiqueta `glm_moe_dsa` |
| Parametros totales | 390.942.074.880 (~391B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, ModelOpt); el modelo base esta en BF16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | blackfrost-commercial (`license:other`) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | zai-org/GLM-5.3-BF16 |
| Tamano del repositorio | 464,9 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |
| Fecha de publicacion | 24 de septiembre de 2026 |
| Compatibilidad declarada | SGLang, ModelOpt, NVIDIA Blackwell, endpoints compatibles |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un transformer de tipo mixture-of-experts con la etiqueta de arquitectura `glm_moe_dsa`, integrado en la familia GLM-5.3. No se detalla el numero de expertos, el numero de expertos activos por token, el mecanismo de enrutamiento ni si emplea atencion lineal o alguna variante de atencion dispersa. Tampoco se especifica la longitud de contexto soportada.

El proceso de construccion documentado es una cuantizacion posterior al entrenamiento: se parte de zai-org/GLM-5.3-BF16 y se aplica ModelOpt para generar pesos NVFP4, un formato de 4 bits con escalado en FP8 disenado especificamente para las tensor cores de la generacion Blackwell. No hay evidencia en la informacion disponible de un entrenamiento adicional, de fases de RLHF o DPO, ni de la composicion del dataset original. La unica modificacion de comportamiento declarada es el tratamiento "DERISKED" de red-teaming, que segun la documentacion de la familia Blackfrost se incorpora como comportamiento heredado del maestro BF16, sin requerir prompt, adaptador ni filtro en runtime.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Arquitectura MoE de ~391B parametros, con la capacidad de razonamiento y conocimiento asociada a esa escala.
- Cuantizacion NVFP4 con soporte declarado para SGLang, lo que permite servir el modelo con kernels optimizados en GPUs Blackwell.
- Comportamiento "de-risked" heredado del maestro BF16, orientado a escenarios de red-teaming, security research y pruebas adversariales.
- Orientacion enterprise segun las etiquetas del repositorio.
- Compatibilidad con endpoints declarada en los tags del modelo.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- No se documentan capacidades multilingues mas alla de ingles y chino.

## Casos de uso

- Auditoria de seguridad de modelos: el modelo esta etiquetado como red-teaming y security-research, por lo que se puede emplear como sujeto de pruebas adversariales para evaluar robustez frente a jailbreaks y extraccion de informacion sensible en un entorno controlado.
- Evaluacion comparativa de cuantizacion: al disponer del padre BF16, permite medir la degradacion de calidad introducida por NVFP4 en tareas de generacion y razonamiento, un caso de uso habitual antes de adoptar 4 bits en produccion.
- Despliegue conversacional en ingles y chino: con ~196 GB de pesos en NVFP4, es viable servirlo en un nodo multi-GPU para asistentes internos dirigidos a plantillas bilingues.
- Generacion de documentacion tecnica bilingue: traduccion y redaccion asistida entre ingles y chino en entornos corporativos, aprovechando la cobertura de ambos idiomas.
- Investigacion sobre alineacion y comportamiento inducido: la naturaleza "DERISKED" lo convierte en un objeto de estudio para comparar comportamiento heredado frente a salvaguardas explicitas en runtime.
- Servicio de inferencia de alta concurrencia: el uso de NVFP4 reduce el ancho de banda de memoria necesario, lo que permite aumentar el batch servido en un mismo hardware Blackwell en comparacion con BF16.
- Base para fine-tuning con adaptadores: al ser un checkpoint transformers estandar en safetensors, puede actuar como punto de partida para LoRA o QLoRA en dominios verticales.
- Benchmarking de infraestructura: util para validar stacks de SGLang, ModelOpt y TensorRT-LLM sobre GPUs Blackwell antes de comprometer presupuesto en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones equivalentes, ni tampoco comparaciones con el modelo base BF16 o con la variante Flash. No se deben asumir cifras de rendimiento a partir del tamano de parametros.

## Requisitos de hardware

- VRAM estimada solo para pesos en NVFP4: ~196 GB (391.000 millones de parametros a 0,5 bytes por parametro).
- VRAM estimada solo para pesos en BF16 (modelo base): ~782 GB.
- El repositorio ocupa 464,9 GB, un tamano superior al de los pesos NVFP4 puros, lo que sugiere sharding adicional, metadatos o artefactos complementarios; conviene verificar el contenido antes de planificar el almacenamiento.
- A la cifra de pesos hay que sumar la cache KV y las activaciones, cuyo coste depende de la longitud de contexto configurada, dato no disponible.
- GPU recomendadas: NVIDIA Blackwell (B200, GB200) por el soporte nativo de NVFP4 y el tag explicito de compatibilidad; en generaciones anteriores, H100 80 GB o H200 141 GB en configuraciones multi-GPU.
- Configuraciones minimas orientativas: 3x H100 80 GB (240 GB) para pesos, 4x H100 80 GB para operar con cache KV; 2x H200 141 GB (282 GB); 2x B200 180 GB (360 GB).
- No cabe en GPU de consumo: ni una RTX 4090 (24 GB) ni una RTX 5090 (32 GB) pueden alojar el modelo, ni siquiera en cuantizaciones mas agresivas que las publicadas.
- Opciones de despliegue: SGLang (soporte declarado en los tags), TensorRT-LLM mediante ModelOpt, y transformers para carga directa de los safetensors.
- No se dispone de datos de latencia, throughput ni tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Blackfrost-Research/GLM-5.3-DERISKED-NVFP4-V2 | 391B | NVFP4 | en, zh | blackfrost-commercial | Gated, 464,9 GB |
| Blackfrost-AI/GLM-5.3-Flash-DERISKED-NVFP4 | no disponible | NVFP4 | en, zh | MIT | Publico, multimodal (image-text-to-text) |
| Blackfrost-Research/GLM-5.3-Flash-DERISKED-BF16 | 321,3B | BF16 | no disponible | other | VRAM estimada 237,1 GB |
| zai-org/GLM-5.3-BF16 (modelo base) | no disponible | BF16 | no disponible | no disponible | Publico |

La diferencia mas relevante frente a la variante Flash es la licencia: la version Flash de Blackfrost-AI se publica bajo MIT, mientras que esta version V2 usa la licencia comercial propietaria de Blackfrost. La variante Flash tambien declara capacidades multimodales, ausentes en los tags de este modelo.

## Limitaciones y advertencias

- Licencia comercial propietaria: `blackfrost-commercial` con `license:other`. El sitio del fabricante indica que los pesos se adquieren mediante una licencia comercial de pago unico y que el hosting escalable y el trabajo personalizado se facturan aparte. No es un modelo de uso libre.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de descargar.
- Idiomas limitados a ingles y chino; no hay soporte declarado para castellano ni para otras lenguas.
- Ausencia total de benchmarks publicados: no es posible estimar calidad, degradacion por cuantizacion ni comparacion con el padre BF16.
- Cero descargas y cero valoraciones en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- El tratamiento "DERISKED" implica una modificacion deliberada del comportamiento del modelo. Esto puede traducirse en respuestas mas permisivas en contextos sensibles; no se documentan las salvaguardas exactas ni los criterios aplicados.
- Riesgo de alucinacion inherente a un modelo de lenguaje de gran escala, sin mitigaciones documentadas.
- Longitud de contexto no especificada: limita la planificacion de cargas con documentos largos o conversaciones extensas.
- Numero de parametros activos no disponible: impide estimar con precision el coste computacional por token en inferencia, que en un MoE depende de los expertos activados.
- Formato NVFP4 optimizado para Blackwell: en generaciones anteriores de GPU el rendimiento puede degradarse o requerir rutas de ejecucion alternativas.
- El tamano del repositorio (464,9 GB) es notablemente superior al de los pesos NVFP4 teoricos (~196 GB), lo que exige verificar el contenido real antes de dimensionar almacenamiento y transferencia.
- Al ser un derivado cuantizado, puede heredar limitaciones y sesgos del modelo base zai-org, no documentados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blackfrost-Research/GLM-5.3-DERISKED-NVFP4-V2
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Variante Flash NVFP4 (Blackfrost-AI): https://huggingface.co/Blackfrost-AI/GLM-5.3-Flash-DERISKED-NVFP4
- Ficha de la variante Flash en LLM Explorer: https://llm-explorer.com/model/Blackfrost-AI%2FGLM-5.3-Flash-DERISKED-NVFP4,5naYIdDhwfCVDnspEyZ459
- Ficha de la variante Flash BF16 en LLM Explorer: https://llm-explorer.com/model/Blackfrost-Research%2FGLM-5.3-Flash-DERISKED-BF16,2weJyEKEKlgBDRraDnkoMf
- Pagina de modelos y licencias de Blackfrost: https://blackfrostai.com/models
