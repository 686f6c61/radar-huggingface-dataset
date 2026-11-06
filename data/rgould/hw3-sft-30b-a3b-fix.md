# rgould/hw3-sft-30b-a3b-fix

## Resumen

hw3-sft-30b-a3b-fix es un ajuste fino supervisado (SFT) del modelo base nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16, publicado por el usuario rgould en Hugging Face. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con aproximadamente 31.580 millones de parametros totales, orientado a generacion de texto, razonamiento y tool calling. El ajuste se ha realizado sobre el checkpoint base de NVIDIA, no sobre una version ya instruida, lo que implica que el autor ha aplicado su propio conjunto de datos SFT para dotar al modelo de capacidades conversacionales y de razonamiento.

El modelo resulta relevante porque parte de una de las familias Nano de NVIDIA, disenadas para ofrecer un equilibrio entre capacidad y coste computacional mediante activacion dispersa de expertos. El sufijo "fix" en el nombre sugiere una correccion o iteracion sobre un ajuste previo, aunque no se documenta en la informacion disponible que problema concreto se corrigio. La ficha del repositorio es muy escasa: no se detallan los datos de entrenamiento, hiperparametros, composicion del dataset ni resultados de evaluacion.

El acceso al repositorio esta restringido (gated), requiere aceptar condiciones en Hugging Face, y la licencia es la NVIDIA Nemotron Open Model License, que impone condiciones especificas para uso comercial. El tamano del repositorio (505,3 GB) sugiere que incluye multiples checkpoints o pesos en precision completa ademas de los safetensors principales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), basada en transformer; detalles de capas y atencion no disponibles |
| Parametros totales | 31.577.937.344 (~31,58 mil millones) |
| Parametros activos | no disponible (el nombre "30B-A3B" sugiere ~3 mil millones activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16. Por el nombre del checkpoint base y el recuento de parametros, se trata de una arquitectura Mixture of Experts con aproximadamente 31,58 mil millones de parametros totales y, presumiblemente, alrededor de 3 mil millones activos por token (la nomenclatura "30B-A3B" asi lo indica, aunque la informacion proporcionada no lo confirma explicitamente). No se dispone de detalles sobre el numero de capas, dimensiones ocultas, numero de expertos, mecanismo de atencion ni estrategia de enrutamiento.

El entrenamiento realizado por rgould es un SFT (supervised fine-tuning) sobre el modelo base, segun indican los tags del repositorio. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF/DPO posteriores, ni los hiperparametros utilizados. Tampoco se especifica que se corrigio con el sufijo "fix". Los tags incluyen "reasoning" y "tool-calling", lo que indica que el dataset SFT estaba orientado a dotar al modelo de capacidades de razonamiento multi-paso y llamada a herramientas.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" y el pipeline text-generation confirman soporte para dialogos multi-turno.
- Razonamiento: el tag "reasoning" indica que el ajuste SFT incluyo datos orientados a tareas de razonamiento.
- Tool calling / function calling: el tag "tool-calling" sugiere que el modelo fue entrenado para emitir llamadas a herramientas, aunque no se documenta el formato exacto ni la fiabilidad.
- Generacion de codigo y matematicas: no confirmado explicitamente en la informacion disponible, aunque es plausible dado el enfasis en razonamiento.
- Capacidades multilingues: no disponible; no se listan idiomas en la ficha.
- Modo thinking explicito, vision o audio: no disponible; no se mencionan en la informacion proporcionada.
- Soporte de agentes multi-paso: inferido del tag "reasoning" y "tool-calling", pero sin documentacion que lo confirme.

## Casos de uso

- Asistentes conversacionales con llamada a herramientas: el modelo puede integrarse en un backend de atencion al cliente donde reciba consultas, decida invocar APIs internas (consulta de pedidos, estado de cuenta) mediante tool calling y componga respuestas en lenguaje natural. El ajuste SFT orientado a tool-calling lo hace adecuado para este patron.
- Automatizacion de flujos de razonamiento multi-paso: para tareas de analisis que requieren descomponer un problema en subtareas, como triaje de incidencias tecnicas o generacion de planes de accion, aprovechando el tag "reasoning".
- Prototipado de agentes autonomos: dado que el modelo parte de un base MoE con activacion dispersa, puede desplegarse en entornos de experimentacion con agentes que encadenan llamadas a herramientas y observaciones, aunque la falta de benchmarks obliga a validar el rendimiento en el dominio concreto.
- Generacion asistida de codigo en pipelines internos: si el ajuste SFT incluyo datos de codigo (no confirmado), podria usarse para autocompletado o generacion de parches en herramientas de desarrollo, siempre con revision humana.
- Extraccion estructurada de informacion: combinado con tool calling, el modelo puede transformar texto no estructurado en llamadas a funciones con parametros tipados, util para ingestas de datos.
- Chat de soporte tecnico especializado: con un contexto de longitud no documentada, su idoneidad para conversaciones largas depende de verificar la ventana real antes de desplegar; en cualquier caso, sirve para sesiones de soporte de alcance medio.
- Investigacion sobre SFT y MoE: al ser un ajuste comunitario de un base de NVIDIA, es util como punto de partida para estudiar el efecto del SFT en modelos MoE de ~30B, comparando con el checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los 31,58 mil millones de parametros requieren aproximadamente 63 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, se necesitan 2x A100 80GB o 1x H100 80GB con margen ajustado.
- Cuantizacion a 8 bits: ~32 GB de pesos, viable en 1x A100 40GB o 1x RTX 6000 Ada 48GB.
- Cuantizacion a 4 bits: ~16-18 GB de pesos, potencialmente viable en una RTX 4090 24GB, aunque la calidad y la velocidad dependerian de la implementacion (no se distribuyen pesos cuantizados en el repo).
- GPU recomendadas: H100 80GB, A100 80GB/40GB, L40S 48GB, RTX 6000 Ada 48GB. En consumer, RTX 4090 24GB solo con cuantizacion agresiva y posible offload.
- Opciones de despliegue: transformers (formato nativo del repo), vLLM y TGI si la arquitectura MoE esta soportada por estas librerias (no confirmado para este checkpoint concreto); llama.cpp/Ollama requeririan conversion a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles; al ser MoE con activacion dispersa, el throughput por token deberia ser inferior al de un denso de 31B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rgould/hw3-sft-30b-a3b-fix | ~31,58 B | no disponible (~3 B por nombre) | no disponible | NVIDIA Nemotron Open Model License | Gated en HF |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16 | ~31,58 B | no disponible | no disponible | NVIDIA Nemotron Open Model License | HF (base de este modelo) |
| Alternativas MoE de tamano similar (p. ej., familia Qwen MoE, Mixtral) | no disponible | no disponible | no disponible | varian | no disponible |

La comparacion cuantitativa con alternativas no es posible con la informacion proporcionada: no hay benchmarks ni datos de contexto del modelo, y no se han identificado en la busqueda modelos directamente comparables con especificaciones verificadas.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se describen datos de entrenamiento, hiperparametros, composicion del dataset ni evaluaciones, lo que impide estimar la calidad real del ajuste.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks ni evaluaciones de fidelidad, no puede acotarse.
- Sesgos: no documentados; al desconocerse la composicion del dataset SFT, no es posible evaluar sesgos de genero, idioma o dominio.
- Idiomas: no se especifican; el rendimiento fuera del ingles (si el SFT fue en ingles) es incierto.
- Contexto: longitud no disponible; no debe asumirse una ventana larga sin verificacion previa.
- Licencia: la NVIDIA Nemotron Open Model License impone condiciones especificas; es obligatorio revisar los terminos antes de cualquier uso comercial, y el acceso gated anade un paso de aceptacion.
- Repositorio de 505,3 GB: el despliegue requiere espacio en disco considerable y la descarga completa puede ser costosa; conviene descargar solo los safetensors necesarios.
- Modelo comunitario con 0 likes y 46 descargas: no hay evidencia de validacion por parte de la comunidad; tratarlo como experimental.
- El sufijo "fix" sugiere que una version previa tenia un defecto, pero no se documenta cual ni si esta resuelto.
- No se distribuyen pesos cuantizados ni GGUF, lo que limita el despliegue en hardware consumer sin trabajo adicional de conversion.

## Enlaces

- Hugging Face: https://huggingface.co/rgould/hw3-sft-30b-a3b-fix
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16
- Licencia NVIDIA Nemotron Open Model License: no disponible en la informacion proporcionada (referenciada en la ficha de Hugging Face del modelo)
