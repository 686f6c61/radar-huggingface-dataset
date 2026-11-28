# reaperdoesntknow/Symbiotic-Beta

## Resumen

Symbiotic-Beta (publicado por el autor como SymLM) es un modelo de lenguaje de tipo híbrido simbolico-neural desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division). Se construye sobre el backbone congelado Qwen2ForCausalLM de Qwen2.5-0.5B y anade una serie de modulos cognitivos simbolicos (procesadores de pensamiento, memoria inspirada en ADN, mecanismos multiagente) que el autor presenta como un sistema de razonamiento adaptativo e interpretable. El checkpoint se distribuye en formato transformers/safetensors y esta etiquetado para generacion de texto en ingles.

El modelo se ha ajustado sobre 25.000 ejemplos de MetaMathQA, con el objetivo declarado de reforzar el razonamiento matematico, la logica de ecuaciones y la inferencia estructurada. Es un checkpoint experimental: el autor lo describe como una fase temprana de una linea de investigacion sobre IA neuro-simbolica, no como un modelo listo para produccion. La licencia es AFL-3.0 y el repositorio ocupa 35,9 GB, un tamano desproporcionado respecto a los 3.569.725.840 parametros declarados en safetensors, lo que sugiere la presencia de pesos auxiliares o multiples artefactos en el repo.

Su relevancia ahora es acotada: sirve como banco de pruebas para quienes investigan interfaces neuro-simbolicas, modulacion de atencion y replay de memoria, mas que como alternativa practica a modelos generativos de proposito general. No cuenta con RLHF ni alineamiento, y el propio autor advierte que la fluidez simbolica no implica correccion matematica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM congelado) con modulos simbolicos anadidos (DTE-HDM, M.A.S.R.M, QwenExoCortex, procesadores liquidos/cristalinos, DNAConv, ThoughtMemory) |
| Parametros totales | 3.569.725.840 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (en) |
| Licencia | AFL-3.0 |
| Formato de pesos | safetensors (transformers, PyTorch) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only Qwen2.5-0.5B que el autor mantiene congelado y sobre el que se acoplan varios modulos simbolicos: Dynamic Thought Evolution with Helical Encoding and DNA-Inspired Memory (DTE-HDM), Multi-Agent Symbiotic Response Mechanisms (M.A.S.R.M), un proyector QwenExoCortex que lleva los estados ocultos al espacio de fusion simbolica, y procesadores como ThoughtDynamicsLNN, Liquid/Crystalline Processors, Graph Reasoning con DNAConv y una ThoughtMemory rotatoria. La model card describe esta combinacion como una fusion en tiempo real de pensamiento simbolico, generacion de tokens y modelado del lenguaje consciente del razonamiento. No se detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de MetaMathQA y OpenThoughts2-1M como fuentes declaradas.

El ajuste se realizo con learning rate 3e-5, batch total de 1024 (16 x 64 pasos de acumulacion), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler coseno con 500 pasos de warmup, 3 epocas y precision mixta con Native AMP. El autor indica que se entrenaron 25.000 ejemplos de MetaMathQA. No hubo RLHF ni DPO; el checkpoint es experimental y no esta alineado para seguridad ni para seguir instrucciones de forma robusta. La model card menciona como fundamento teorico el Analytic Foundations Theorem (AFT), una propuesta de sustitucion measure-theoretic del calculo clasico, aunque no se aportan resultados empiricos que la respalden en el repositorio.

## Capacidades

- Generacion de texto autoregresiva en ingles sobre el backbone Qwen2.5-0.5B.
- Razonamiento matematico y generacion de pruebas en formato simbolico, orientado por el ajuste sobre MetaMathQA.
- Respuesta a preguntas simbolicas y logica de ecuaciones con inferencia estructurada.
- Soporte declarado de mecanismos de memoria a largo plazo y codificacion espiral de contexto (DTE-HDM).
- Coordinacion multiagente simbolico-neural mediante atencion con compuertas (M.A.S.R.M).
- Proyeccion de estados ocultos a un espacio de fusion simbolica para razonamiento y replay de memoria (QwenExoCortex).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso en el sentido de frameworks de orquestacion.
- Capacidad multilingue limitada al ingles segun la etiqueta del modelo.
- Sin modo thinking explicito, vision ni audio.

## Casos de uso

- Investigacion en IA neuro-simbolica: el modelo sirve como banco de pruebas para estudiar como interactuan modulos simbolicos acoplados a un transformer congelado, midiendo el efecto de la memoria helicoidal y los procesadores liquidos sobre la generacion.
- Experimentos de razonamiento matematico controlado: util para comparar la calidad de pruebas generadas frente a la base Qwen2.5-0.5B sin ajuste, en entornos academicos donde se pueda verificar cada salida con un comprobador formal.
- Prototipado de agentes reflexivos: los mecanismos M.A.S.R.M permiten explorar arquitecturas donde varios subagentes simbolicos modulan la respuesta, adecuado para demos de investigacion mas que para produccion.
- Generacion de Q&A matematico en dominios acotados: con 25.000 ejemplos de MetaMathQA, puede emplearse para crear borradores de problemas y soluciones que luego se revisan manualmente.
- Estudio de modulacion de atencion y replay de memoria: la ThoughtMemory rotatoria y el QwenExoCortex permiten instrumentar el modelo para analizar que informacion persiste entre turnos.
- Docencia y divulgacion: como ejemplo didactico de hibridacion neuro-simbolica en cursos de arquitecturas de IA, siempre con la advertencia de que es un checkpoint experimental.

## Benchmarks y rendimiento

El model-index del autor declara una entrada llamada "SymLM" con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 7 GB solo para los pesos del transformer base (0,5B), mas el overhead de los modulos simbolicos y del repositorio de 35,9 GB, que puede elevar el consumo real de forma notable; no se dispone de mediciones publicadas.
- En cuantizacion de 8 bits, la base cabria en GPUs consumer con 8 GB; en 4 bits, en GPUs con 6 GB o mas, aunque los modulos auxiliares pueden requerir memoria adicional.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para ejecutar el checkpoint completo sin cuantizar y con margen para los modulos simbolicos.
- Cabe en GPU consumer (RTX 3060 12 GB, RTX 4060 Ti 16 GB) si se limita a la base y se prescinde de los modulos auxiliares, aunque en ese caso se pierde la funcionalidad simbolica declarada.
- Opciones de despliegue: transformers (version 4.51.3 o superior) con PyTorch 2.7.0+cu126; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la presencia de modulos personalizados complica su uso en servidores de inferencia estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Symbiotic-Beta (SymLM) | 3.569.725.840 (safetensors) | no disponible | AFL-3.0 | Hugging Face, transformers | Hibrido neuro-simbolico experimental, solo ingles |
| Qwen2.5-0.5B (base) | 0,5B | 32.768 tokens (segun la familia Qwen2.5) | Apache 2.0 | Hugging Face, amplio ecosistema | Modelo denso estandar, sin modulos simbolicos |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa densa de mayor tamano para razonamiento general |
| Modelos matematicos pequenos tipo MetaMath fine-tunes sobre Qwen2.5 | variable | variable | variable | Hugging Face | Ajustes directos sobre MetaMathQA sin capa simbolica |

La comparacion directa con la base Qwen2.5-0.5B es la mas informativa: Symbiotic-Beta anade capas simbolicas y un ajuste matematico, pero carece de benchmarks publicados que demuestren una mejora medible frente al modelo base. Frente a alternativas densas de la familia Qwen2.5, la licencia AFL-3.0 y el caracter experimental reducen su atractivo para produccion.

## Limitaciones y advertencias

- Entrenamiento limitado: solo 25.000 ejemplos de MetaMathQA, lo que restringe la generalizacion fuera de ese dominio.
- Sin RLHF ni alineamiento: las salidas no estan ajustadas para seguridad ni para seguir instrucciones de forma fiable.
- Riesgo de alucinacion elevado: la fluidez simbolica no garantiza correccion matematica; se recomienda verificacion formal de cada prueba generada.
- No optimizado para generacion abierta: prioriza logica y estructura sobre profundidad conversacional.
- Solo ingles: no hay soporte declarado de castellano ni de otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar su uso en conversaciones multi-turno largas.
- Licencia AFL-3.0: permite uso comercial con obligaciones de divulgacion del codigo fuente de las modificaciones y de la licencia; conviene revisar los terminos antes de integrarlo en productos.
- Repositorio de 35,9 GB frente a los 3,5B parametros declarados: el despliegue requiere gestionar artefactos adicionales y puede complicar la carga en entornos con almacenamiento limitado.
- Checkpoint experimental: el propio autor lo describe como fase temprana, sin garantias de estabilidad ni de soporte a largo plazo.
- Los modulos simbolicos personalizados pueden no ser compatibles con servidores de inferencia estandar, lo que limita el escalado.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
- Dataset OpenThoughts2-1M: https://huggingface.co/datasets/open-thoughts/OpenThoughts2-1M
- Modelos relacionados: https://huggingface.co/reaperdoesntknow/Symbiotic-1B, https://huggingface.co/reaperdoesntknow/Symbiotic-8B, https://huggingface.co/reaperdoesntknow/Symiotic-14B
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
