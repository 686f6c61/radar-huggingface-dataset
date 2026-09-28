# aifeifei798/DualBigLittle-MoE

## Resumen

DualBigLittle-MoE es una arquitectura de mezcla de expertos (MoE) jerárquica de tres niveles desarrollada por el usuario aifeifei798, publicada en HuggingFace bajo licencia Apache 2.0. El modelo parte de un MLP denso preentrenado de la familia Qwen y lo reorganiza en tres capas de capacidad heterogéneas: un núcleo "Arts & Language" congelado y residente en VRAM que preserva la fluidez en lenguaje natural, un núcleo gemelo especializado en STEM (clonado y ajustado de forma contrastiva) también residente en VRAM, y un tercer nivel de 896 micro-expertos (adaptadores LoRA de rango 16, ~64 KB cada uno) almacenados en RAM del host y transmitidos dinámicamente por PCIe. El objetivo declarado es doble: mitigar la degradación en dominios STEM que el autor atribuye a la interferencia de gradientes en MoE homogéneos, y evitar el muro de VRAM que impide desplegar MoE de gran escala en GPUs de consumo.

La propuesta se inspira en las topologías tri-clúster de CPUs móviles modernas (núcleos Ultra, Performance y Efficiency), trasladando esa separación de roles a la inferencia de un LLM. La relevancia actual reside en su enfoque de sistema: en lugar de escalar parámetros densos, explota almacenamiento DDR5 y streaming asíncrono por CUDA Streams no bloqueantes para mantener el consumo de VRAM adicional en torno a 560 MB, con un throughput declarado de 17 a 22 tokens por segundo en hardware de consumo.

El repositorio ocupa 0.6 GB, no registra descargas ni "likes" en el momento de la consulta, y soporta inglés y chino. Se trata de una contribución de tipo sistemas/investigación más que de un modelo base listo para producción: requiere el código del repositorio de GitHub para funcionar, dado que la arquitectura de enrutado y streaming no es estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE jerarquica de tres niveles (dense Qwen MLP + nucleo STEM clonado + pool de micro-expertos LoRA) |
| Parametros totales | no disponible |
| Parametros activos | 2 nucleos densos residentes en VRAM (Tier 1 y Tier 2) + Top-8 micro-expertos por token de un pool de 896 (Tier 3); numero de parametros no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los micro-expertos son adaptadores LoRA de rango 16, ~64 KB cada uno) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (library_name: pytorch); formato de fichero concreto no especificado |
| Tamano del repositorio | 0.6 GB |
| DOI | 10.57967/hf/10650 |

## Arquitectura y entrenamiento

La topologia se organiza en tres niveles. El Tier 1 ("Arts & Language Anchor Core") es el MLP original preentrenado de Qwen, mantenido congelado al 100 % y fijado en VRAM para garantizar cero regresion en gramatica, sintaxis, razonamiento de sentido comun y prosa. El Tier 2 ("STEM Specialized Twin Core") es un clon del MLP denso, adaptado de forma contrastiva con una tasa de aprendizaje de 2×10⁻⁵ y una temperatura baja, especializado en sintesis de codigo, derivaciones algebraicas y logica dura, tambien residente en VRAM sin latencia PCIe. El Tier 3 es un pool de 896 micro-expertos (adaptadores LoRA de rango 16, ~64 KB cada uno, ~56 MB en total en DDR5) que se almacenan en RAM fijada del host y se transmiten por DMA sobre PCIe segun cada token.

El enrutado se realiza en dos fases. Un controlador macro ("MACRO ROUTING CONTROLLER", descrito como discriminador de dominio por capa) puntua la intencion semantica del token como [w_arts, w_sci] y fusiona las salidas de los Tier 1 y Tier 2 dentro de la VRAM. Despues, un micro-router selecciona los Top-8 micro-expertos por token en cada una de las 28 capas, lo que genera 224 transferencias dinamicas por token (28 × 8). Los expertos estan agrupados por dominio: codigo (#00–#07), matematicas (#08–#15) y escritura (#16–#31). La salida final se calcula como Y = Y_big + 0.3 · Y_little. El autor declara un esquema de streaming asincrono mediante CUDA Streams no bloqueantes; no se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento y sintesis de codigo: el autor reporta que el router activa el nucleo STEM al 98.0 % para algoritmos en Python.
- Matematicas y logica simbolica: gestionadas por el Tier 2 y por los micro-expertos de matematicas (#08–#15).
- Escritura creativa y prosa literaria: el router dirige el 78.8 % de la activacion al nucleo de artes para texto literario.
- Separacion de dominio por token mediante discriminador semantico de dos pesos (arts/sci).
- Ejecucion en hardware de consumo con streaming de expertos desde RAM del host.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Asistencia de programacion en local: al activar el nucleo STEM en el 98.0 % de los casos para algoritmos, el modelo puede emplearse para generar y revisar codigo Python en una estacion de trabajo con GPU de gama de entrada, sin depender de un clúster multi-GPU.
- Prototipado de agentes de razonamiento logico: la separacion entre nucleo de logica y micro-expertos de matematicas permite montar pipelines de resolucion de problemas algebraicos en entornos de investigacion donde la VRAM es limitada.
- Generacion de documentacion tecnica bilingue (en/zh): el nucleo de artes congelado preserva la fluidez, util para redactar manuales o articulos en ingles y chino.
- Redaccion creativa y marketing: el enrutado hacia el nucleo de artes (78.8 %) resulta adecuado para tareas de texto narrativo o publicitario que priorizan estilo sobre rigor formal.
- Investigacion en arquitecturas MoE y enrutado: el modelo sirve como banco de pruebas para estudiar enrutado jerarquico, streaming de expertos por PCIe y tecnicas de fusión ponderada.
- Computacion en el borde (edge): con tan solo ~560 MB de VRAM adicional y el pool de expertos en DDR5, es candidato para despliegues edge donde no cabe un MoE denso completo.
- Experimentos de ajuste con LoRA: dado que los micro-expertos son adaptadores de rango 16, el sistema puede utilizarse para estudiar entrenamiento modular por dominio sin reentrenar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta las siguientes metricas de sistema y de comportamiento del router:

| Metrica | Valor reportado |
|---|---|
| Separacion de dominio (router macro) | 98.0 % nucleo STEM (algoritmos Python) / 78.8 % nucleo Arts (prosa literaria) |
| VRAM adicional por 28 capas STEM + 896 micro-expertos | ~560 MB |
| Throughput en hardware de consumo | 17.0 – 22.0 tokens/s |
| Transferencias dinamicas por token | 224 (28 capas × 8 micro-expertos) |
| Tamano del pool de micro-expertos en DDR5 | ~56 MB (896 adaptadores LoRA de rango 16, ~64 KB cada uno) |

Nota: estas cifras proceden de la model card del autor y no equivalen a una evaluacion estandar de calidad del modelo. No hay comparacion publicada con MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: se declara un incremento de ~560 MB sobre el consumo del modelo base (28 capas STEM + 896 micro-expertos). El consumo total depende del tamano del Qwen base, que no se especifica.
- RAM del host: ~56 MB en DDR5 fijada (pinned memory) para el pool completo de 896 micro-expertos.
- GPU recomendadas: el autor indica compatibilidad con "entry-level GPUs" y "consumer workstations"; no se enumeran modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: si, segun el autor, gracias al bajo incremento de VRAM.
- Opciones de despliegue: PyTorch, con el framework propio del repositorio de GitHub. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y la arquitectura de enrutado personalizada probablemente requiere el codigo especifico del proyecto.
- Latencia y throughput: 17.0 – 22.0 tokens/s en hardware de consumo, con 224 transferencias PCIe dinamicas por token mediante CUDA Streams no bloqueantes.
- Ancho de banda: el rendimiento depende criticamente del ancho de banda PCIe y de la velocidad de la DDR5 del host, al transmitirse los expertos en cada token.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DualBigLittle-MoE | MoE jerarquica de 3 niveles (Qwen denso + LoRA en RAM) | no disponible | no disponible | 17–22 tok/s en GPU de consumo; metricas estandar no disponibles | Apache 2.0 | HuggingFace + GitHub (0 descargas) |
| MoE densos convencionales (p. ej. familia Mixtral / Qwen-MoE) | MoE homogenea | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | variable | ampliamente desplegables |
| Modelos densos de Qwen del mismo base | Transformer denso | no disponible | no disponible | no disponible en esta ficha | variable | HuggingFace |

No se dispone de datos comparativos verificables (parametros, contexto o benchmarks) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas concretas. La diferencia cualitativa principal frente a un MoE estandar es el enrutado jerarquico con dos nucleos densos en VRAM y un pool de micro-expertos en RAM del host, orientado a reducir el consumo de VRAM.

## Limitaciones y advertencias

- No hay resultados de benchmarks estandar publicados, por lo que la calidad real del modelo en tareas de razonamiento, codigo o matematicas no esta verificada de forma independiente.
- Las cifras de separacion de dominio (98.0 % / 78.8 %) proceden del propio autor y no han sido replicadas por terceros.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible; aplica el riesgo habitual de los LLM.
- Sesgos conocidos: no documentados.
- Idiomas limitados a ingles y chino; no se declara soporte para castellano ni otros idiomas.
- Longitud de contexto no especificada, lo que impide valorar su idoneidad para conversaciones o documentos largos.
- Rendimiento fuertemente dependiente del ancho de banda PCIe y de la DDR5 del host; en configuraciones con PCIe lento el throughput de 17–22 tok/s podria no sostenerse.
- Requiere el codigo y framework propios del repositorio; no se indica compatibilidad con servidores de inferencia estandar (vLLM, TGI, llama.cpp, Ollama).
- Estado del repositorio: 0 descargas, 0 "likes" y sin actualizaciones posteriores a la fecha de publicacion indicada, lo que sugiere ausencia de validacion por la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo Qwen base subyacente, que no se detalla en la informacion disponible.
- No se especifican los parametros totales ni el tamano del modelo base, lo que dificulta planificar el despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aifeifei798/DualBigLittle-MoE
- Repositorio GitHub: https://github.com/aifeifei798/DualBigLittle-MoE
- DOI: 10.57967/hf/10650
- PyTorch: https://pytorch.org/
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
