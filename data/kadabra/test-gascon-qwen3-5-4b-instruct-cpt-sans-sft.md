# Kadabra/Test-gascon-Qwen3.5-4b-Instruct-CPT-sans-SFT

## Resumen

Test-gascon-Qwen3.5-4b-Instruct-CPT-sans-SFT es un modelo de lenguaje de aproximadamente 4.330 millones de parametros publicado por el usuario Kadabra en HuggingFace. Se trata de un derivado del modelo base unsloth/Qwen3.5-4B, ajustado por el autor mediante un proceso de preentrenamiento continuado (CPT, continued pre-training) y sin una fase posterior de ajuste supervisado (SFT, de ahi el sufijo "sans-SFT"). El nombre "Test" y el hecho de contar con 0 descargas y 0 likes indican que es una publicacion experimental o de prueba, no un modelo orientado a produccion.

El repositorio contiene pesos en formato GGUF, convertidos con la libreria Unsloth, lo que lo hace desplegable directamente con llama.cpp y compatible con el ecosistema llama-cpp. Incluye un fichero de proyector multimodal (mmproj), ademas de las etiquetas vision-language-model, lo que apunta a que el modelo conserva capacidades de vision-lenguaje heredadas del base. Las cuantizaciones distribuidas son BF16, Q4_K_M y Q6_K.

El modelo es relevante principalmente como ejemplo de flujo de trabajo: muestra como convertir un ajuste CPT de Qwen3.5-4B a GGUF con Unsloth y como mantener el componente multimodal en el empaquetado. Para evaluacion seria en produccion, sin embargo, la ausencia de model card detallada, licencia declarada y benchmarks limita mucho su utilidad practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3.5; el repositorio lo etiqueta como qwen3_5) |
| Parametros totales | 4.326.350.848 (dato de safetensors) |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q4_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible en este repositorio (el modelo hermano Kadabra/Qwen3.5-4b-gas-CPT-SFT figura como apache-2.0) |
| Formato de pesos | GGUF (ficheros Qwen3.5-4B.BF16-mmproj.gguf, Qwen3.5-4B.Q4_K_M.gguf, Qwen3.5-4B.Q6_K.gguf) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El repositorio hereda la etiqueta qwen3_5 y la model card solo indica que el modelo fue convertido a formato GGUF usando Unsloth. Por el nombre y por los resultados de busqueda, se trata de un ajuste sobre unsloth/Qwen3.5-4B realizado por Kadabra con Unsloth y la libreria TRL de HuggingFace, con una metodologia que el autor describe como 2x mas rapida de entrenar. El sufijo "CPT-sans-SFT" sugiere que se aplico preentrenamiento continuado sin una etapa posterior de ajuste supervisado, lo que habitualmente implica un modelo menos alineado para conversacion que un instruct convencional, a pesar de que el nombre incluye la palabra "Instruct".

La presencia del fichero mmproj (proyector multimodal) y de la etiqueta vision-language-model indica que el pipeline conserva el encoder de vision del modelo base, de modo que el GGUF puede ejecutarse en modo multimodal con llama-mtmd-cli. No hay datos disponibles sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni sobre tecnicas de atencion o decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Procesamiento de imagen y texto (vision-language): incluye un proyector multimodal y soporte para llama-mtmd-cli.
- Ejecucion local mediante llama.cpp y llama-cli, con plantilla de chat aplicada mediante --jinja.
- Compatible con endpoints (etiqueta endpoints_compatible), lo que facilita su integracion en servicios de inferencia.
- Capacidades de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Pruebas de conversion de modelos a GGUF: sirve como referencia practica para verificar el flujo Unsloth -> GGUF y validar que el proyector multimodal se conserva correctamente.
- Evaluacion de preentrenamiento continuado: util para investigadores que quieran analizar como afecta un CPT sin SFT al comportamiento conversacional de un modelo base.
- Despliegue local de bajo coste: con cuantizacion Q4_K_M, cabe en GPUs de consumo y permite experimentar con inferencia local en llama.cpp.
- Prototipado multimodal: el fichero mmproj permite probar tareas de imagen-texto con llama-mtmd-cli antes de invertir en modelos mayores.
- Integracion en pipelines de investigacion: al ser compatible con endpoints, puede conectarse a frameworks de evaluacion automatica para medir el efecto del CPT.
- Desarrollo de variantes "gascon" o de dominio especifico: el modelo puede servir de punto de partida (base sin SFT) para aplicar despues un ajuste supervisado propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: BF16 en torno a 8,6 GB de pesos; Q6_K en torno a 3,5-4 GB; Q4_K_M en torno a 2,6-3 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para BF16; GPUs con 4-6 GB son suficientes para Q4_K_M. Modelos de datacenter (A100, H100) no son necesarios.
- Cabe en GPU de consumo: si. Ejemplos plausibles: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090; en Q4_K_M tambien en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp / llama-cli (texto), llama-mtmd-cli (multimodal), y otros runners compatibles con GGUF. Etiquetado como compatible con endpoints.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Test-gascon-Qwen3.5-4b-Instruct-CPT-sans-SFT (este) | ~4,33 B | no disponible | GGUF | no disponible | Publicacion de prueba, 0 descargas, con proyector multimodal |
| Kadabra/Qwen3.5-4b-gas-CPT-SFT | ~4,5 B (segun fuente externa) | no disponible | Safetensors | apache-2.0 (modelo hermano) | Variante con SFT del mismo autor |
| unsloth/Qwen3.5-4B (base) | ~4 B | no disponible | Safetensors | no disponible | Modelo base del que deriva el ajuste |
| Qwen3.5 (familia) | varios tamanos | no disponible | multiples | no disponible | Familia de Alibaba; guia de despliegue local disponible en la web |

Los datos de esta tabla provienen de los resultados de busqueda y de la informacion del repositorio; no se dispone de comparativas de rendimiento (benchmarks) para contrastar calidad entre ellos.

## Limitaciones y advertencias

- Modelo experimental: 0 descargas, 0 likes y nombre con prefijo "Test"; no hay evidencia de validacion en produccion.
- Ausencia de model card detallada: no se documentan datos de entrenamiento, dataset, hiperparametros ni proceso de alineacion.
- Licencia no declarada en este repositorio: existe riesgo legal para uso comercial. El modelo hermano figura como apache-2.0, pero no debe asumirse que este repositorio comparte esa licencia.
- "Sans-SFT" implica posible falta de ajuste supervisado: el comportamiento conversacional puede ser erratico o poco alineado pese a la etiqueta "Instruct".
- Riesgo de alucinacion: no cuantificado; al no haber benchmarks, no puede estimarse su fiabilidad factual.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento correcto en castellano ni en otros idiomas.
- Contexto no disponible: se desconoce la ventana maxima, lo que dificulta planificar usos con entradas largas.
- Capacidades de tool calling y agentes no confirmadas.
- El soporte multimodal depende de usar llama-mtmd-cli con el fichero mmproj; con llama-cli estandar se pierde la parte de vision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kadabra/Test-gascon-Qwen3.5-4b-Instruct-CPT-sans-SFT
- Modelo hermano (con SFT): https://huggingface.co/Kadabra/Qwen3.5-4b-gas-CPT-SFT
- Modelo hermano en Featherless AI: https://featherless.ai/models/Kadabra/Qwen3.5-4b-gas-CPT
- Discusiones del modelo hermano: https://huggingface.co/Kadabra/Qwen3.5-4b-gas-CPT-SFT/discussions
- Endpoint en FriendliAI: https://friendli.ai/models/Kadabra/Qwen3.5-4b-gas-CPT-SFT
- Guia de despliegue local de Qwen 3.5: https://techplanet.today/post/running-qwen-35-locally-complete-guide-to-open-source-llm-deployment-on-consumer-hardware
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
