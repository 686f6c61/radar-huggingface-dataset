# SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una compilacion GGUF derivada del modelo multimodal multimodal Qwen3.8-Flash-Next, construida a partir de las cuantizaciones oficiales GSQ-RCO publicadas por ISTA-DASLab. El autor no recuantiza el modelo: parte del GGUF ya cuantizado (con los valores y escalas aprendidos por GSQ intactos) y sustituye 144 tensores de proyeccion hacia el flujo residual repartidos por las 48 capas por los tensores equivalentes de una version ya "abliterated". El resultado es un modelo de 176.943.899.520 parametros (unos 177B) con la direccion de rechazo eliminada, manteniendo la asignacion de tipos por tensor del modelo de origen.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de edicion de modelos (tensor transplant sobre pesos ya cuantizados) poco habitual, que permite reutilizar el trabajo de cuantizacion aprendida sin recalcularla. Por otro, describe un artefacto especificamente orientado a red-teaming y a investigacion sobre alineacion: al eliminar la direccion de rechazo, el modelo responde a peticiones que el original declinaria, lo que lo hace util como sujeto de prueba y peligroso como componente de produccion de cara al usuario final.

El modelo esta etiquetado como MoE (mezcla de expertos), soporta 262.144 tokens de contexto, trabaja con entrada de imagen y texto, y se distribuye en cuantizaciones de 2 y 3 bits (Q2_0, IQ2_XS, IQ3_XXS, IQ3_S) con licencia Apache-2.0. Los idiomas declarados son ingles y chino simplificado. El repositorio ocupa 215,7 GB en total y acumulaba 50 descargas y 11 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); numero de expertos y expertos activos no disponibles |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF IQ3_S, IQ3_XXS, IQ2_XS y Q2_0 (herencia GSQ-RCO del modelo base) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Numero de capas | 48 |
| Modalidad | image-text-to-text (entrada de imagen y texto) |
| Tamano del repositorio | 215,7 GB |
| Tamano por cuantizacion | Q2_0: 38,0 GB; IQ3_S: 55,1 GB; IQ3_XXS e IQ2_XS: no disponible |
| Modelo base | ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (relacion: quantized) |
| Tecnica de edicion | tensor transplant (144 tensores en 48 capas) sobre pesos ya cuantizados |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) segun las etiquetas del repositorio, con 48 capas y una ventana de contexto de 262.144 tokens. El pipeline declarado es image-text-to-text, lo que implica un codificador o proyector multimodal que acepta imagenes ademas de texto. No se dispone de informacion sobre el numero de expertos, los parametros activos por token, la dimension oculta ni la configuracion de atencion (por ejemplo, si emplea atencion lineal o hibrida). Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esta informacion corresponderia al modelo original Qwen3.8-Flash-Next y no se incluye en la model card consultada.

La contribucion tecnica de esta publicacion no es el entrenamiento, sino la edicion posterior de pesos cuantizados. Partiendo del GGUF generado por ISTA-DASLab con GSQ (una cuantizacion con escalas y valores aprendidos) y RCO (asignacion de tipos de cuantizacion por tensor sujeta a un presupuesto de tamano), el autor localiza las proyecciones que escriben en el flujo residual, 144 tensores en total, y las sustituye por las de una version abliterated ya existente. Los valores y escalas aprendidos por GSQ en el resto de tensores no se recalculan y la asignacion de tipos por tensor del modelo de origen se restaura de forma exacta. El autor indica que cada nivel de cuantizacion cuesta solo entre 0,25 y 0,44 GB mas que el equivalente de ISTA-DASLab, y que la build IQ3_S se verifico tensor a tensor con hash blake2b por tensor para confirmar que solo cambiaron los pesos previstos.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con pipeline declarado image-text-to-text (acepta imagenes como entrada).
- Razonamiento de varios pasos: las etiquetas del repositorio incluyen reasoning y long-context, orientadas a cadenas de razonamiento sobre contextos extensos.
- Procesamiento de contexto largo de hasta 262.144 tokens, adecuado para documentos muy extensos o historiales completos.
- Inferencia local mediante llama.cpp y runtimes compatibles con GGUF.
- Funcionamiento sin filtros de rechazo: la edicion abliterated elimina la direccion de rechazo, de modo que el modelo responde a solicitudes que el original declinaria.
- Capacidad declarada para red-teaming y analisis de seguridad, segun las etiquetas del autor.
- Soporte de tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Soporte de agentes y planificacion autonoma: no disponible.
- Otras capacidades especiales (modo thinking, audio, vision detallada, decodificacion especulativa): no disponible.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo sirve como sujeto de prueba controlado para medir la eficacia de clasificadores de contenido, filtros de salida y guardarrailes, ya que su falta de rechazo permite comprobar si las defensas externas aguantan peticiones adversarias sin depender de la negativa del propio modelo.
- Investigacion sobre alineacion y refusal directions: permite estudiar de forma empirica que comportamientos cambian al sustituir unicamente las proyecciones residuales de 144 tensores en 48 capas, aislando el efecto de la direccion de rechazo del resto del comportamiento del modelo.
- Analisis de documentacion extensa con entrada multimodal: con 262K tokens de contexto puede procesar expedientes completos, contratos o informes junto con imagenes escaneadas, algo util en auditoria documental si el equipo acepta las implicaciones de usar un modelo sin filtros.
- Procesamiento por lotes en local con requisitos de confidencialidad: al ser GGUF ejecutable con llama.cpp, se puede desplegar en infraestructura propia sin enviar datos a terceros, lo que encaja en entornos con datos sensibles o con restricciones de residencia de datos.
- Localizacion y traduccion ingles-chino sobre documentos largos: el soporte declarado de ambos idiomas y la ventana de 262K permiten traducir o resumir corpus completos manteniendo coherencia entre secciones.
- Generacion creativa sin restricciones editoriales: escritura de ficcion, guiones o dialogos con tematicas que un modelo alineado rechazaria, manteniendo coherencia argumental a lo largo de contextos muy largos.
- Extraccion de informacion estructurada de documentos mixtos (texto e imagen): conversion de facturas, formularios o informes escaneados en JSON u otro formato estructurado dentro de un pipeline batch, siempre que el uso este permitido en el contexto legal aplicable.
- Evaluacion comparativa de cuantizaciones: sirve como banco de pruebas para medir la degradacion de calidad entre Q2_0 (38,0 GB) e IQ3_S (55,1 GB) sobre el mismo modelo, dado que el resto de tensores es identico al del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ningun otro conjunto de evaluacion, ni comparaciones numericas con el modelo base o con otras versiones abliterated. Tampoco se aportan mediciones de perplejidad ni de degradacion por cuantizacion.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: aproximadamente 38 GB para Q2_0 y 55,1 GB para IQ3_S, solo para los pesos; hay que sumar la memoria de la cache KV, que con 262K tokens de contexto puede ser muy elevada y depende de la configuracion de atencion (no disponible).
- GPU recomendadas para Q2_0: una A100 80GB o H100 80GB ejecutan el modelo completo en un solo dispositivo; dos RTX 3090 o dos RTX 4090 (48 GB combinados) permiten repartir los pesos, aunque el contexto util quedara limitado por la VRAM restante.
- GPU recomendadas para IQ3_S: 55,1 GB no caben en una GPU de 48 GB, por lo que se necesita una A100 80GB, una H100 80GB o un reparto entre tres GPU de 24 GB.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB no puede alojar el modelo completo en ninguna de las cuantizaciones publicadas; es viable con offload parcial a RAM mediante llama.cpp, con la penalizacion de velocidad correspondiente.
- Memoria unificada: equipos con 64 GB o 128 GB de memoria unificada (por ejemplo, Apple Silicon de gama alta) pueden ejecutar Q2_0 e IQ3_S con llama.cpp y backend Metal, quedando el contexto disponible supeditado a la memoria restante.
- Opciones de despliegue: llama.cpp y llama-server (API compatible con OpenAI, segun la etiqueta endpoints_compatible), llama-cpp-python, Ollama, LM Studio y interfaces basadas en GGUF. vLLM y TGI no soportan GGUF de forma nativa sin conversion previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | ~177B | 262.144 tokens | GGUF | apache-2.0 | Abliterated sobre cuantizacion GSQ-RCO; Q2_0 e IQ3_S publicados |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | no disponible | no disponible | GGUF | no disponible | Modelo base de esta ficha; cuantizacion GSQ con asignacion RCO, sin abliterar |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF | no disponible | no disponible | GGUF | no disponible | Alternativa abliterated del mismo modelo original, publicada por otro autor |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF | 27B | no disponible | GGUF | no disponible | Variante abliterated de menor tamano, citada en los resultados de busqueda |
| pfeifferj/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 125B (segun listado de HuggingFace) | no disponible | GGUF | no disponible | Otra redistribucion de la cuantizacion GSQ-RCO; el listado indica un total distinto al de esta ficha |

No se dispone de resultados de benchmarks comparativos entre estas alternativas, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de la direccion de rechazo implica que el modelo puede generar contenido dañino, ilegal o gravemente inapropiado sin negarse. No es apto para despliegues de cara al publico sin filtros externos robustos.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; un modelo de 2 a 3 bits por peso tiende ademas a degradar la precision respecto a la version sin cuantizar.
- Degradacion por cuantizacion: las variantes Q2_0, IQ2_XS e IQ3_XXS operan en regimenes de muy baja precision, con perdida de calidad esperable en razonamiento y codigo frente a IQ3_S o al modelo original.
- Idiomas: solo se declaran ingles y chino; no hay soporte documentado de castellano ni de otras lenguas, y el comportamiento multilingue no esta verificado.
- Sesgos conocidos: no disponible. No hay evaluaciones de sesgo publicadas para esta build ni para su modelo base.
- Restricciones de licencia: la build se publica bajo Apache-2.0, pero los terminos aplicables al modelo original Qwen3.8-Flash-Next y a la cuantizacion de ISTA-DASLab deberian verificarse de forma independiente antes de un uso comercial.
- Trazabilidad: la model card no documenta el proceso de abliteracion con detalle suficiente para reproducirlo, ni especifica la procedencia exacta de los tensores abliterated transplantados.
- Verificacion: el autor afirma haber validado tensor a tensor la build IQ3_S mediante blake2b; no se indica si el resto de cuantizaciones (Q2_0, IQ2_XS, IQ3_XXS) recibieron la misma verificacion.
- Adopcion limitada: 50 descargas y 11 likes en el momento de la consulta, sin benchmarks ni informes de terceros que respalden su comportamiento.
- Contexto: aunque se anuncian 262.144 tokens, no se documenta la degradacion de atencion en el extremo de la ventana ni la memoria de cache KV necesaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- README en chino simplificado: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Paper referenciado en las etiquetas (GSQ): https://arxiv.org/abs/2604.18556
- Paper referenciado en las etiquetas (RCO): https://arxiv.org/abs/2605.00649
- Alternativa abliterated del mismo modelo: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- Otra redistribucion de la cuantizacion GSQ-RCO: https://huggingface.co/pfeifferj/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
