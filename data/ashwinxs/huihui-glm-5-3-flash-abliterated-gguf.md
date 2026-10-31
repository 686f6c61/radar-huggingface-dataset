# Ashwinxs/Huihui-GLM-5.3-Flash-abliterated-GGUF

## Resumen

Huihui-GLM-5.3-Flash-abliterated-GGUF es una versión "abliterated" (sin filtros de rechazo) del modelo GLM-5.3-Flash de zai-org, publicada por el usuario Ashwinxs en Hugging Face y basada en los GGUF cuantizados por Unsloth. El proceso de abliteración elimina las capas de comportamiento de rechazo del modelo original, permitiendo respuestas sin las restricciones de seguridad habituales. El modelo conserva la capacidad multimodal del original (pipeline image-text-to-text) y está orientado a ejecución local mediante llama.cpp.

El modelo base, GLM-5.3-Flash, es un modelo de gran escala con 320.759 millones de parámetros totales, perteneciente a la familia GLM de Z.ai. La versión abliterada solo modifica las capas 15 a 35 (índice base 0), dejando intactas el resto de capas y todos los módulos de expertos, lo que minimiza la degradación de capacidades respecto al modelo original. Su licencia MIT permite uso comercial sin restricciones significativas.

Es relevante ahora porque llama.cpp soporta oficialmente la arquitectura GLM-5.3-Flash, lo que facilita su despliegue local en formato GGUF con contextos de hasta 262.144 tokens. No obstante, al tratarse de un modelo con la seguridad reducida deliberadamente, su uso recomendado se limita a investigación, pruebas y entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GLM-5.3-Flash, familia glm5_next); multimodal image-text-to-text |
| Parametros totales | 320.759.404.382 (~320,76 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según ejemplo de ejecución con llama.cpp) |
| Tipos de cuantizacion | GGUF (incluye UD-Q4_K_XL; cuantizaciones completas heredadas de unsloth/GLM-5.3-Flash-GGUF, lista exacta no disponible) |
| Idiomas soportados | Ingles, chino |
| Licencia | MIT |
| Formato de pesos | GGUF (imatrix), cuantizado desde safetensors del modelo base |

## Arquitectura y entrenamiento

El modelo base es GLM-5.3-Flash de zai-org, un transformer de la serie glm5_next con arquitectura de mezcla de expertos (MoE), como indica la model card al mencionar que "todos los módulos de expertos permanecen sin abliterar". Es multimodal, con pipeline image-text-to-text, es decir, acepta tanto imágenes como texto en la entrada. Los detalles concretos sobre el numero de expertos activos, el numero de tokens de entrenamiento o la composición del dataset no están disponibles en la informacion proporcionada.

La abliteración aplicada en esta version es una tecnica que modifica las direcciones de rechazo en las capas del transformer para suprimir los comportamientos de negativa. En este caso se ha aplicado de forma selectiva: solo las capas 15 a 35 (con indexacion base 0) han sido abliteradas, mientras que el resto de capas y los expertos MoE se conservan sin modificar. Se trata de una implementacion descrita por el propio autor como "cruda" y de prueba de concepto. Los GGUF provienen directamente de unsloth/GLM-5.3-Flash-GGUF, con cuantizacion mediante matrices de importancia (imatrix).

## Capacidades

- Generacion de texto conversacional multilingue en ingles y chino.
- Comprension de imagenes y texto (pipeline image-text-to-text), heredada del modelo base.
- Ventana de contexto de hasta 262.144 tokens, adecuada para documentos largos y conversaciones extensas.
- Compatibilidad con llama.cpp para inferencia local en formato GGUF.
- Comportamiento sin rechazos: responde a solicitudes que el modelo original denegaria, sin garantias de seguridad.
- No hay informacion disponible sobre soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la ficha del modelo.

## Casos de uso

- Investigacion en seguridad y alineacion de modelos: la abliteracion selectiva por capas (15-35) permite estudiar como el rechazo se distribuye en las capas intermedias de un MoE de gran escala sin alterar los expertos.
- Pruebas de red teaming: equipos de seguridad pueden evaluar la robustez de sistemas de filtrado externos frente a un modelo sin filtros internos.
- Ejecucion local con privacidad total: al correr en llama.cpp con GGUF, el modelo procesa datos sensibles sin enviarlos a APIs externas, util en entornos con requisitos estrictos de confidencialidad.
- Analisis de documentos largos en ingles y chino: la ventana de 262.144 tokens permite procesar informes, contratos o corpus academicos extensos de una sola vez.
- Investigacion multimodal: la capacidad image-text-to-text permite experimentar con comprension de imagenes combinada con texto en un modelo sin alineacion de seguridad.
- Experimentacion con cuantizacion imatrix: el repositorio sirve como base para evaluar el impacto de distintas cuantizaciones GGUF en un modelo de mas de 300 mil millones de parametros.
- Comparativa de comportamiento pre/post alineacion: al existir el modelo original y la version abliterada, se pueden comparar respuestas lado a lado para investigacion en alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ademas, la abliteracion y la cuantizacion pueden degradar el rendimiento respecto al modelo base zai-org/GLM-5.3-Flash, cuyos resultados tampoco constan en la ficha.

## Requisitos de hardware

- Con 320,76 mil millones de parametros, la cuantizacion UD-Q4_K_XL genera archivos GGUF repartidos en 6 partes; el tamano exacto por cuantizacion no esta disponible, pero un Q4_K_XL de un modelo de este tamano requiere tipicamente del orden de 180-200 GB de memoria (VRAM + RAM combinados).
- No cabe en GPUs de consumo individuales: se requiere configuracion multi-GPU (varias A100 u H100 de 80 GB) o descarga parcial a RAM del sistema (offloading de expertos a CPU/CUDA).
- Configuracion tipica: estaciones multi-GPU con 2-4 RTX 6000 Ada/A6000, o servidores con A100/H100; en su defecto, Mac Studio con memoria unificada elevada (192 GB o mas) mediante llama.cpp.
- Despliegue mediante llama.cpp (rama oficial ya soporta GLM-5.3-Flash; tambien existe el PR de unslothai). No hay mencion de soporte verificado en vLLM, TGI u Ollama para esta version abliterada.
- Comando de ejemplo documentado: `llama-cli -m ...GLM-5.3-Flash-UD-Q4_K_XL-00001-of-00006.gguf -c 262144`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Caracteristica | Huihui-GLM-5.3-Flash-abliterated (GGUF) | zai-org/GLM-5.3-Flash (base) | unsloth/GLM-5.3-Flash-GGUF |
|---|---|---|---|
| Parametros totales | ~320,76 B | ~320,76 B | ~320,76 B |
| Contexto | 262.144 tokens | no disponible | no disponible |
| Multimodal | Si (image-text-to-text) | Si | Si |
| Abliterado | Si (capas 15-35) | No | No |
| Formato | GGUF (imatrix) | safetensors | GGUF |
| Licencia | MIT | no disponible | no disponible |
| Uso recomendado | Investigacion, entornos controlados | Uso general | Inferencia local general |

No hay datos de rendimiento comparativo disponibles entre estas versiones.

## Limitaciones y advertencias

- El filtrado de seguridad ha sido reducido significativamente: puede generar contenido sensible, controvertido o inapropiado. Requiere revision manual rigurosa de las salidas.
- No apto para todos los publicos: las salidas pueden ser inadecuadas para entornos publicos, menores de edad o aplicaciones que exijan alta seguridad.
- Sin garantias de seguridad por defecto: el modelo no ha pasado por optimizacion de seguridad; ni huihui.ai ni el autor asumen responsabilidad por las consecuencias de su uso.
- La abliteracion es una prueba de concepto "cruda" segun el propio autor; puede degradar la calidad y coherencia de las respuestas respecto al modelo base.
- La responsabilidad legal y etica del uso recae exclusivamente en el usuario; el contenido generado puede conllevar riesgos legales.
- Se desaconseja su uso directo en produccion o aplicaciones comerciales de cara al publico; se recomienda restringirlo a investigacion, pruebas y entornos controlados.
- Idiomas limitados a ingles y chino; el rendimiento en otros idiomas no esta documentado.
- Requisitos de hardware muy elevados (modelo de ~320 B de parametros), lo que limita su accesibilidad.
- No hay datos de benchmarks publicados para verificar el rendimiento real tras la abliteracion y la cuantizacion.

## Enlaces

- Modelo abliterado (GGUF): https://huggingface.co/Ashwinxs/Huihui-GLM-5.3-Flash-abliterated-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- GGUF originales de Unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Repositorio de abliteracion (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Rama de llama.cpp de unslothai para GLM-5.3-Flash: https://github.com/unslothai/llama.cpp/tree/glm5next/upstream
- Lanzamientos oficiales de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Soporte/donaciones de huihui.ai: https://ko-fi.com/huihuiai
