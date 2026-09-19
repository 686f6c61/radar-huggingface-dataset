# nthngdy/fabric-1p7B-sft-tulu3

## Resumen

fabric-1p7B-sft-tulu3 es un modelo de lenguaje de 1.700 millones de parametros publicado por el usuario de HuggingFace nthngdy. Se trata de un decoder-only transformer denso de la familia "Fabric", preentrenado durante 95.000 pasos y posteriormente ajustado con supervisión (SFT) sobre la mezcla Tulu-3 durante 12.138 pasos con una longitud de contexto de 16.000 tokens. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La particularidad del repositorio es que no contiene un unico modelo, sino cuatro variantes de atencion publicadas como ramas (branches) independientes del mismo checkpoint base: ventana deslizante de 256 tokens (`sw256`), un hibrido 3:1 entre ventana deslizante y atencion global con extension de contexto YaRN x4 (`hybrid3to1_sw256`), atencion completa con YaRN x4 (`dense`) y ventana deslizante mas "copy sink" (`sw256_copysink_maskcopy`). Esto lo convierte en un artefacto interesante para experimentacion comparativa sobre mecanismos de atencion eficiente, no tanto como modelo de produccion generalista.

Su relevancia actual es acotada pero especifica: es un banco de pruebas open source para medir como distintas estrategias de atencion (ventana local, hibrida con atencion global, YaRN para extrapolacion de contexto y mecanismos tipo sink) afectan a un mismo modelo tras un SFT identico. El repositorio ocupa 3,1 GB y no registra descargas ni "likes" en el momento de la consulta, por lo que carece de validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con cuatro variantes de atencion (ventana deslizante 256, hibrida 3:1 ventana/global, atencion completa y ventana deslizante con copy sink) |
| Parametros totales | Aproximadamente 1.700 millones (1,7B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 16.000 tokens (16k) en el entrenamiento SFT; las ramas `hybrid3to1_sw256` y `dense` aplican YaRN x4 |
| Tipos de cuantizacion | No disponible: la model card no documenta pesos cuantizados ni versiones GGUF/AWQ/GPTQ |
| Idiomas soportados | No disponible: la model card no lista idiomas y la metadata de HuggingFace no los declara |
| Licencia | Apache 2.0 |
| Formato de pesos | No confirmado explicitamente en la model card; repositorio de 3,1 GB para la libreria transformers, pesos en `bfloat16`: compatible con safetensors |
| Ramas disponibles | `sw256`, `hybrid3to1_sw256`, `dense`, `sw256_copysink_maskcopy` |
| Formato de chat | ChatML (`<|im_start|>role\n...<|im_end|>\n`), con `chat_template` incluido en el tokenizer |
| Tamano del repositorio | 3,1 GB |
| Fecha de creacion / actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

El modelo sigue el esquema clasico de transformer autoregresivo con decodificacion causal, pero el punto diferencial esta en la capa de atencion. Cada rama implementa una politica distinta sobre el mismo backbone: `sw256` restringe cada token a una ventana deslizante de 256 posiciones; `hybrid3to1_sw256` intercala tres capas de ventana local por cada capa de atencion global y aplica YaRN con factor 4 para extrapolar contexto; `dense` usa atencion completa con el mismo YaRN x4; y `sw256_copysink_maskcopy` anade un mecanismo de "copy sink" sobre la ventana deslizante, lo que exige cargar el modelo con `trust_remote_code=True`.

El entrenamiento se divide en dos fases segun la propia model card: un preentrenamiento de 95.000 pasos y un ajuste supervisado (SFT) de 12.138 pasos sobre la mezcla Tulu-3 a 16k de contexto. No se especifican en la informacion disponible el numero total de tokens de preentrenamiento, la composicion exacta de la mezcla Tulu-3 SFT, ni si hubo etapas adicionales de RLHF, DPO o preferencias; tampoco se detalla si se aplicaron tecnicas de decodificacion especulativa. La innovacion tecnica declarada se limita, por tanto, al diseno de atencion y a la extension de contexto mediante YaRN.

## Capacidades

- Generacion de texto autoregresiva en formato instructivo, gracias al SFT sobre Tulu-3.
- Conversacion multi-turno mediante plantilla ChatML incluida en el tokenizer.
- Manejo de contextos de hasta 16.000 tokens en las cuatro variantes, con extrapolacion YaRN x4 en las ramas `hybrid3to1_sw256` y `dense`.
- Razonamiento basico, comprension lectora y generacion de texto generico propia de un modelo de 1,7B; no se publican datos que cuantifiquen el nivel alcanzado.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; la metadata no declara idiomas.
- Capacidades especiales (vision, audio, modo "thinking" explicito): no documentadas.
- Valor experimental: permite comparar cuatro estrategias de atencion sobre el mismo checkpoint y el mismo SFT.

## Casos de uso

- Investigacion en atencion eficiente: cargar las cuatro ramas con la misma semilla y prompt para medir diferencias de perplejidad, velocidad y uso de memoria entre ventana deslizante, hibrido 3:1 y atencion densa sobre un modelo identico en el resto de parametros.
- Prototipado local en portatil: con 1,7B de parametros y pesos en `bfloat16`, el modelo puede ejecutarse en GPU de consumo para validar prompts, plantillas ChatML y flujos de chat antes de escalar a un modelo mayor.
- Generacion sintetica de datos de instrucciones: usar la rama `dense` o `hybrid3to1_sw256` con 16k de contexto para producir pares pregunta-respuesta o reformulaciones destinadas a entrenar modelos mas pequenos en un dominio concreto.
- Resumen de documentos largos de baja criticidad: la ventana de 16k tokens permite condensar informes, actas o hilos de correo completos, siempre que se acepte la perdida de calidad inherente a un modelo de este tamano.
- Extraccion de informacion y clasificacion por lotes: tareas de etiquetado, categorizacion de tickets o extraccion de campos en texto no estructurado, ejecutadas en local para evitar enviar datos a APIs externas.
- Base para fine-tuning de dominio: al estar bajo Apache 2.0, sirve como punto de partida para ajustes especificos (legal, sanitario, industrial) sin coste de licencia, aprovechando que el coste de reentrenamiento de 1,7B es asumible en una sola GPU.
- Experimentos de extrapolacion de contexto con YaRN: comparar el comportamiento de las ramas con YaRN x4 frente a `sw256` sin YaRN en entradas que superan el contexto de entrenamiento.
- Despliegue en entornos de borde o sin conectividad: el peso del modelo permite empaquetarlo en imagenes de contenedor moderadas para demos offline o formacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, IFEval ni ninguna otra evaluacion, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo.

## Requisitos de hardware

- Pesos en `bfloat16`: aproximadamente 3,4-3,5 GB solo para los parametros, coherente con el tamano de repositorio de 3,1 GB.
- VRAM estimada para inferencia: unos 4-6 GB en `bfloat16` con contexto corto (pesos mas cache KV y overhead del runtime); con 16k tokens de contexto hay que sumar la cache KV, cuyo tamano exacto no se puede calcular porque la configuracion de cabezas y capas no se detalla en la informacion disponible.
- GPU de consumo: si, cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en cualquier GPU con 6 GB o mas de VRAM para contexto corto.
- GPU de servidor: A10G, L4, L40S, A100 y H100 para servir varias peticiones concurrentes en lote.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (unico camino documentado, obligatorio para la rama `sw256_copysink_maskcopy` con `trust_remote_code=True`); vLLM y TGI son viables en principio, pero requeririan que el runtime soporte la politica de atencion de cada rama; llama.cpp y Ollama exigen convertir los pesos a GGUF, conversion que no esta publicada oficialmente.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota practica: al fijar `revision=rev` en `from_pretrained` se descarga solo la rama elegida, lo que reduce el consumo de disco frente a clonar el repositorio completo.

## Comparativa con modelos similares

Los datos de la tabla proceden de las fichas oficiales de cada modelo y se ofrecen como referencia de posicionamiento, no como resultado de una evaluacion comun. Para fabric-1p7B-sft-tulu3 no existen puntuaciones publicadas, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Variantes de atencion | Disponibilidad |
|---|---|---|---|---|---|
| fabric-1p7B-sft-tulu3 | 1,7B | 16k | Apache 2.0 | Cuatro ramas (ventana 256, hibrida 3:1, densa, copy sink) | Repositorio HuggingFace, sin descargas registradas |
| SmolLM2-1.7B | 1,7B | 8k | Apache 2.0 | Atencion estandar | Ampliamente distribuido, con cuantizaciones GGUF |
| Qwen2.5-1.5B | 1,5B | 32k | Apache 2.0 | Atencion estandar con GQA | Muy distribuido, con GGUF, AWQ y GPTQ |
| Llama-3.2-1B | 1,2B | 128k | Licencia comunitaria Llama 3.2 | Atencion estandar con GQA | Ampliamente distribuido, con GGUF |
| Gemma-2-2B | 2,6B | 8k | Licencia Gemma | Atencion alternada local/global | Ampliamente distribuido |

Diferencias clave: fabric-1p7B-sft-tulu3 es el unico de la lista que publica varias politicas de atencion sobre el mismo checkpoint, lo que lo hace util para investigacion, pero a diferencia de los demas no ofrece cuantizaciones listas para usar, no declara idiomas y no cuenta con evaluaciones publicadas ni adopcion comunitaria.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks publicados, por lo que no se puede verificar la calidad del SFT ni comparar objetivamente con alternativas.
- Sin validacion comunitaria: cero descargas y cero "likes" en el momento de la consulta; ningun usuario ha reportado comportamiento en produccion.
- Idiomas no declarados: la model card no indica que idiomas cubre. La mezcla Tulu-3 SFT no se detalla, de modo que el rendimiento en castellano es una incognita y deberia validarse antes de cualquier uso real.
- Sesgos: no hay informacion sobre evaluaciones de sesgo, toxicidad o seguridad; se desconoce la composicion del dataset de preentrenamiento y del SFT.
- Riesgo de alucinacion: elevado en terminos relativos por tratarse de un modelo de 1,7B; no apto para generar informacion factual sin verificacion humana.
- Restriccion tecnica relevante: la rama `sw256_copysink_maskcopy` exige `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio al cargar el modelo. Conviene auditar ese codigo antes de usarlo en entornos controlados.
- Compatibilidad de ecosistema limitada: sin pesos GGUF, AWQ o GPTQ publicados, el despliegue en llama.cpp, Ollama o LM Studio requiere conversion propia, y los runtimes de alto rendimiento (vLLM, TGI) pueden no soportar las politicas de atencion hibridas o de copy sink.
- Extrapolacion de contexto no verificada: YaRN x4 se aplica en dos ramas, pero no se documenta hasta que longitud se mantiene la calidad mas alla de los 16k tokens de entrenamiento.
- Licencia permisiva con matices: Apache 2.0 permite uso comercial, pero al derivar de una receta SFT basada en Tulu-3 conviene revisar la licencia de los datos subyacentes de esa mezcla antes de explotar comercialmente el modelo ajustado.
- Adecuacion limitada para produccion critica: sin garantias de soporte, versionado semantico ni mantenimiento del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nthngdy/fabric-1p7B-sft-tulu3
- Rama de ventana deslizante 256: https://huggingface.co/nthngdy/fabric-1p7B-sft-tulu3/tree/sw256
- Rama hibrida 3:1 con YaRN x4: https://huggingface.co/nthngdy/fabric-1p7B-sft-tulu3/tree/hybrid3to1_sw256
- Rama de atencion densa con YaRN x4: https://huggingface.co/nthngdy/fabric-1p7B-sft-tulu3/tree/dense
- Rama con copy sink: https://huggingface.co/nthngdy/fabric-1p7B-sft-tulu3/tree/sw256_copysink_maskcopy
- Perfil del autor: https://huggingface.co/nthngdy

No se han encontrado papers, blogs, repositorios de codigo ni demos asociados al modelo. Los resultados devueltos por la busqueda web no guardaban ninguna relacion con fabric-1p7B-sft-tulu3 ni con la familia Fabric, por lo que se han descartado.
