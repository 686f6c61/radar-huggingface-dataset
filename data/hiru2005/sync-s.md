# hiru2005/Sync-S

## Resumen

Sync-S es un paquete de expertos re-cuantizados del modelo Qwen3.8-Flash-Next, publicado por el usuario hiru2005 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una re-cuantizacion de los expertos enrutados del modelo base de Qwen, orientada a ejecutarse en una unica GPU de consumo mediante el motor propietario Sync-Strata, un fork del proyecto Strata. El paquete contiene unicamente los pesos densos y los expertos re-cuantizados en formato trellis de la familia Gyro/QTIP; las embeddings, la tabla n-gram/PLE y el resto de componentes residen en un repositorio compartido separado (hiru2005/Sync-shared).

La relevancia de este modelo radica en su enfoque de despliegue: busca ofrecer mayor velocidad que el paquete Gyro de referencia sobre hardware de gama media (el autor cita un PC con 32 GB de RAM y una RTX 3080 de 12 GB), a costa de una fidelidad parcial respecto al modelo original. El autor reporta una divergencia KL de 0,2310 frente al GGUF Q8_0 del modelo base, medida sobre una version anterior de Sync-S. Es un proyecto experimental, con cero descargas y cero likes en el momento de la consulta, y con un ecosistema de ejecucion muy restringido.

El modelo esta marcado como experimental y su uso esta condicionado a la licencia Qwen Community License 1.0. No es compatible con llama.cpp ni con Strata upstream, lo que limita seriamente su adopcion fuera del entorno Sync-Strata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) heredada de Qwen3.8-Flash-Next, con expertos re-cuantizados en formato trellis Gyro/QTIP |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE, pero no se especifica el numero de expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis de la familia Gyro/QTIP con ancho de bits elegido por experto; pesos densos incluidos en el paquete |
| Idiomas soportados | no disponible (la calibracion se hizo con texto en varios idiomas, pero no se detallan) |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | Formato binario propio de Sync-Strata (.bin con tablas de conversion .json/.txt); no es GGUF ni safetensors |

## Arquitectura y entrenamiento

Sync-S no entrena un modelo nuevo: parte de Qwen3.8-Flash-Next, un transformer con arquitectura MoE, y re-cuantiza sus expertos enrutados a un formato trellis de la familia Gyro/QTIP (basado en QTIP, Tseng et al., 2024). El ancho de bits se elige por experto, lo que permite asignar mas precision a los expertos mas sensibles y menos a los demas. El paquete tambien incluye los pesos densos que el motor lee directamente, mientras que las embeddings, la tabla n-gram/PLE y otros componentes se obtienen del repositorio compartido hiru2005/Sync-shared, cortado a partir del GGUF Gyro-S de agentionai.

La calibracion de la cuantizacion se realizo sobre texto publico (codigo, documentacion, articulos enciclopedicos, varios idiomas y trazas de agentes) y sobre parte de los registros de chat del propio autor, que no se distribuyen. No se documenta el numero de tokens de entrenamiento ni si hubo RLHF o DPO, ya que no se entrena el modelo base. La innovacion tecnica principal es el formato de empaquetado y el motor Sync-Strata, que incorpora mecanismos como "tail skip" (R4, R7, R10) para acelerar la decodificacion.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-Flash-Next, aunque degradadas por la cuantizacion (KL de 0,2310 en la version medida).
- Codigo y matematicas: no se documentan evaluaciones especificas para estas tareas en la informacion disponible.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: la calibracion incluyo trazas de agentes, pero no se confirma soporte nativo de agentes.
- Capacidades multilingues: la calibracion uso texto en varios idiomas, pero no se detalla la lista de idiomas soportados.
- Capacidades especiales (thinking mode, vision, audio): no disponible. El repositorio compartido menciona un componente `mmproj` opcional, lo que sugiere posible soporte multimodal, pero no se confirma.

## Casos de uso

- Inferencia local en GPU de consumo: el modelo esta disenado para ejecutarse en un PC con 32 GB de RAM y una GPU NVIDIA RTX 30/40, lo que permite desplegar un MoE de gran tamano en hardware asequible sin depender de la nube.
- Prototipado rapido de aplicaciones de chat: el motor Sync-Strata ofrece una interfaz de chat (`dsh chat`) con velocidades de 80-104 tok/s, adecuada para iterar en el desarrollo de asistentes conversacionales.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores interesados en formatos trellis (Gyro/QTIP) pueden usar Sync-S como referencia para medir el equilibrio entre velocidad y fidelidad (KL) frente a otras cuantizaciones como IQ3_XXS o Gyro-S.
- Generacion de codigo en entornos con requisitos de privacidad: al ejecutarse localmente, evita enviar codigo propietario a servicios externos, siempre que se acepte la degradacion de calidad respecto al modelo original.
- Procesamiento de documentacion tecnica multilingue: la calibracion incluye documentacion y articulos enciclopedicos en varios idiomas, lo que sugiere un rendimiento razonable en tareas de resumen y extraccion sobre textos tecnicos.
- Educacion e investigacion sobre arquitecturas MoE: el paquete permite estudiar el comportamiento de un MoE re-cuantizado por experto y comparar el efecto del ancho de bits en la calidad final.

## Benchmarks y rendimiento

| Metrica | Sync-S |
|---|---|
| KL respecto al modelo original (todas las posiciones, menor es mejor) | 0,2310 |

La metrica KL se midio en Colab con la eval_v4 de produccion (8 dominios, 1.400 ventanas), usando como profesor el GGUF Q8_0 del modelo original. El autor advierte que el valor corresponde a una version anterior de Sync-S (con puntos de table-lookup y la misma parte densa); la forma actual del repositorio (sin table lookup) no se ha medido, aunque para Sync-XS y Sync-M ambas formas estuvieron a la par dentro del ruido de medicion.

Rendimiento de velocidad (medido en un Ryzen 7 7800X3D, 32 GB DDR5, RTX 3080 12 GB, NVMe SSD, Windows 11, Sync-Strata 0.1.0):

| Modelo | Tail skip | jbench decode (tok/s) | dsh chat (tok/s) |
|---|---|---:|---:|
| Sync-S | R4 | 144,0 | 104,1 |
| Sync-S | R7 | 127,5 | 90,7 |
| Sync-S | R10 | 104,6 | 80,1 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el autor indica que el modelo esta recomendado para PCs con 32 GB de RAM y cita una RTX 3080 de 12 GB como hardware de referencia. Los minimos de RAM y VRAM estan "por medir".
- GPU recomendadas: NVIDIA RTX 30/40 series con driver R580 o superior (soporte oficial). RTX 20, GTX 16 y RTX 50 se esperan funcionales pero no verificadas. GTX 10, Radeon RX 6000/7000/9000 y las GPU integradas Radeon de Ryzen AI Max (Strix Halo: 8060S, 8050S, 8040S) son experimentales y no verificadas. Otras GPU integradas e Intel no estan soportadas.
- Cabe en GPU de consumo: si, segun el autor, en RTX 3080 de 12 GB (hardware de referencia). No se confirma en GPU con menos VRAM.
- Opciones de despliegue: exclusivamente el motor Sync-Strata (fork de Strata). No es compatible con llama.cpp, Ollama, vLLM, TGI ni Strata upstream.
- Latencia y throughput: 144,0 tok/s (jbench decode, tail skip R4) y 104,1 tok/s (dsh chat, R4) en el hardware de referencia con Windows 11. Los valores en Linux estan por medir.
- Almacenamiento: se recomienda SSD NVMe; el paquete ocupa 28,14 GB (26,21 GiB) mas las partes compartidas.
- CPU: requiere AVX2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sync-S (este) | no disponible | no disponible | Qwen Community License 1.0 | Binario propio Sync-Strata | KL 0,2310; 144 tok/s (R4) |
| Gyro-S (agentionai) | no disponible | no disponible | no disponible | GGUF (Gyro) | Referencia upstream; el autor afirma que Sync-S es mas rapido |
| Sync-XS | no disponible | no disponible | no disponible | Binario propio Sync-Strata | Version menor de la familia Sync; el autor remite a su pagina para comparativas |
| IQ3_XXS (llama.cpp) | no disponible | no disponible | MIT (llama.cpp) | GGUF | Cuantizacion estandar de 3 bits; citada como referencia en la pagina de Sync-XS |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparables en la informacion proporcionada. La comparativa se limita a lo que el autor menciona en la model card.

## Limitaciones y advertencias

- Proyecto experimental con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion independiente.
- Fidelidad limitada: la divergencia KL de 0,2310 respecto al modelo original indica una degradacion medible en la calidad, y el valor corresponde a una version anterior del paquete.
- Ecosistema cerrado: solo funciona con Sync-Strata; no carga en llama.cpp, Ollama, vLLM ni Strata upstream, lo que limita la portabilidad y el soporte.
- Dependencia de un repositorio compartido adicional (hiru2005/Sync-shared) para embeddings y otros componentes; sin el, el modelo no funciona.
- Requisitos de hardware restrictivos: 32 GB de RAM recomendados, GPU NVIDIA RTX 30/40 verificada, driver R580 o superior, CPU con AVX2 y SSD NVMe recomendado.
- Idiomas soportados no documentados: aunque la calibracion uso varios idiomas, no se especifica cuales ni su calidad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos: no se documentan evaluaciones de sesgo; la calibracion incluyo registros de chat del autor, lo que podria introducir sesgos de dominio.
- Licencia Qwen Community License 1.0: permite uso comercial con restricciones; los productos comerciales con mas de 100 millones de usuarios mensuales requieren condiciones adicionales (el texto de la model card se corta en ese punto).
- Sin benchmarks estandar (MMLU, HumanEval, GSM8K) publicados: no es posible comparar su calidad con otros modelos de forma objetiva.
- Soporte de tool calling, agentes y vision no confirmado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hiru2005/Sync-S
- Repositorio compartido: https://huggingface.co/hiru2005/Sync-shared
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor Sync-Strata: https://github.com/hiruhiru2005/sync-strata
- Strata (upstream): https://github.com/Niko1221/Strata
- Gyro-S GGUF de agentionai: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Pagina de Sync-XS (comparativas): https://huggingface.co/hiru2005/Sync-XS
- llama.cpp / ggml: https://github.com/ggml-org/llama.cpp
- Donaciones (Ko-fi): https://ko-fi.com/hiruhiru2005
- Paper QTIP (Tseng et al., 2024): no disponible como enlace directo en la informacion proporcionada
