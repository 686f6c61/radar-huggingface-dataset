# miloserdev/GLM-5.3-Flash-numallama

## Resumen

GLM-5.3-Flash-numallama es una conversión del modelo GLM-5.3-Flash de Z.AI para numallama, un motor de inferencia en C diseñado específicamente para servidores CPU con ejecución consciente de NUMA (Non-Uniform Memory Access) en máquinas multi-socket. El modelo original es un transformer de mezcla de expertos (MoE) de 320.000 millones de parámetros totales con 18.000 millones activos, que combina atención híbrida (capas lineales Kimi Delta Attention más atención dispersa MLA con el indexador DSA) y conexiones hiperbólicas restringidas a variedades (mHC). Esta conversión elimina el codificador de visión del modelo multimodal original, por lo que es exclusivamente de texto.

La relevancia de esta ficha reside en que demuestra un patrón poco habitual: cuantizar un modelo de 320B para ejecutarlo en CPU en lugar de GPU. El checkpoint resultante ocupa 199,8 GB en disco y requiere unos 210 GB de RAM, con una velocidad de decodificación medida de 17,4 tokens por segundo en un servidor de 2 × Ampere Altra Max M128-30 (256 núcleos Neoverse N1). Los expertos enrutados se cuantizan a 4 bits asimétrico (grupos de 32, escala y mínimo en fp16) y el resto de pesos a int8 con escalas por grupo, partiendo del checkpoint oficial en FP8.

El modelo no usa formato GGUF y solo funciona con numallama; no es compatible con llama.cpp, Ollama, LM Studio ni transformers. La licencia es MIT, igual que el modelo original, y el autor verifica la conversión comparando los logits de las primeras 4 capas contra la implementación de referencia en transformers, con una correlación superior a 0,999 y el mismo token top-1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (Kimi Delta Attention lineal + MLA dispersa con indexador DSA) y manifold-constrained hyper-connections (mHC) |
| Parametros totales | 320B |
| Parametros activos | 18B |
| Longitud de contexto | no disponible (configurable en numallama; el valor máximo no se especifica) |
| Tipos de cuantizacion | Q4 asimétrico para expertos enrutados (grupos de 32, escala y mínimo fp16) + int8 con escalas por grupo para atención, expertos compartidos, capas densas, router, embeddings y cabeza de salida |
| Idiomas soportados | no disponible |
| Licencia | MIT (Copyright (c) 2026 Z.AI Co., Ltd.) |
| Formato de pesos | `.bin` propietario de numallama (no GGUF, no safetensors) |
| Modelo base | zai-org/GLM-5.3-Flash (checkpoint FP8) |
| Tamaño del repositorio | 199,9 GB |
| Motor de inferencia | numallama (C, CPU, NUMA-aware) |
| Plataforma | Linux; optimizado para ARM64 con NEON dot product (Ampere Altra, AWS Graviton, Neoverse); x86-64 ejecuta C portable no optimizado |
| RAM necesaria | ~210 GB |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de mezcla de expertos con 320B parámetros totales y 18B activos por token. Su arquitectura combina dos mecanismos de atención: capas lineales Kimi Delta Attention, que reducen el coste computacional en secuencias largas, y atención dispersa MLA (Multi-head Latent Attention) con el indexador DSA, que selecciona dinámicamente las posiciones relevantes. Además incorpora manifold-constrained hyper-connections (mHC), una variante de conexiones residuales que restringe las transformaciones a una variedad geométrica para mejorar la estabilidad del entrenamiento en modelos de gran profundidad.

El modelo original es multimodal, pero esta conversión descarta el codificador de visión y conserva únicamente la torre de texto. La cuantización parte del checkpoint oficial en FP8: los expertos enrutados pasan a 4 bits asimétrico con grupos de 32 y escala/mínimo en fp16, mientras que el resto de pesos (atención, expertos compartidos, capas densas, router, embeddings y cabeza de salida) se mantienen en int8 con escalas por grupo. No se aplica matriz de importancia ni ninguna otra modificación a los pesos. La verificación contra transformers muestra correlación de logits superior a 0,999 en las primeras 4 capas con coincidencia del token top-1.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo original en la información proporcionada.

## Capacidades

- Generación de texto en modo chat multi-turno mediante el motor numallama.
- Modo de razonamiento (thinking) activable con el flag `-r 1` en el comando de chat.
- Soporte de tool calling y function calling, según se documenta en el README de numallama.
- Decodificación especulativa disponible como opción del motor.
- Servidor compatible con la API de OpenAI en `/v1`, lo que permite integrarlo con clientes existentes.
- Ejecución consciente de NUMA en máquinas multi-socket, distribuyendo el trabajo entre todos los sockets.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no soportada (el codificador de visión no se convirtió).
- Audio: no soportado.

## Casos de uso

- Despliegue de inferencia LLM en servidores CPU sin GPU: el modelo permite servir un MoE de 320B en máquinas ARM64 con gran cantidad de RAM (por ejemplo, instancias AWS Graviton con 256 GB o más), evitando el coste y la disponibilidad limitada de GPUs de gama alta.
- Chat interno con razonamiento en entornos con requisitos de privacidad: al ejecutarse en infraestructura propia y con pesos MIT, encaja en organizaciones que no pueden enviar datos a APIs externas, activando el modo thinking con `-r 1` para consultas complejas.
- Servicio compatible con OpenAI para integración en aplicaciones existentes: el modo servidor expone `/v1` en el puerto configurable, de modo que herramientas que ya hablan el protocolo de OpenAI pueden apuntar al endpoint sin cambios de código.
- Procesamiento por lotes de texto a gran escala en clústeres ARM: con 17,4 tok/s por chat en el hardware de referencia, es adecuado para tareas de generación y resumen en lote donde la latencia no es crítica y el coste por token en CPU resulta competitivo.
- Agentes con tool calling en pipelines de automatización: el soporte de herramientas y decodificación especulativa permite construir flujos de varios pasos que consulten APIs o bases de datos desde un servidor propio.
- Evaluación e investigación de arquitecturas MoE híbridas: la disponibilidad de pesos cuantizados ejecutables en CPU facilita experimentos de reproducibilidad y análisis de la atención lineal Kimi Delta y del indexador DSA sin necesidad de GPUs.
- Sustitución de llama.cpp en entornos NUMA multi-socket: para equipos con varios sockets donde el reparto de memoria entre nodos es determinante, numallama ofrece una alternativa específicamente diseñada para ese escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento medido es la velocidad de decodificación en el hardware de referencia:

| Metrica | Valor | Hardware |
|---|---|---|
| Decodificación (chat único) | 17,4 tok/s | 2 × Ampere Altra Max M128-30 (256 núcleos Neoverse N1), ambos sockets |
| Correlación de logits vs. transformers | > 0,999 (primeras 4 capas, mismo top-1) | no disponible |

## Requisitos de hardware

- RAM: aproximadamente 210 GB para cargar el modelo cuantizado (199,8 GB de pesos más overhead del motor y caché KV).
- CPU: Linux; rendimiento óptimo en ARM64 con NEON dot product (Ampere Altra, AWS Graviton, otros núcleos Neoverse). En x86-64 se ejecuta código C portable sin optimizar, con rendimiento previsiblemente muy inferior.
- GPU: no se usa GPU; el motor es exclusivamente de CPU.
- Cabe en GPU de consumo: no aplica; el modelo no está pensado para GPUs y su tamaño (199,8 GB) excede la VRAM de cualquier GPU de consumo.
- Despliegue: exclusivamente mediante numallama (compilación con `make`, descarga con `hf download`, ejecución con `./runq` en modo chat o servidor). No compatible con vLLM, llama.cpp, Ollama, LM Studio, TGI ni transformers.
- Latencia y throughput: 17,4 tok/s en el hardware de referencia de 256 núcleos; otras máquinas variarán según número de núcleos, ancho de banda de memoria y topología NUMA.
- Almacenamiento: al menos 200 GB libres para los pesos más el tokenizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-numallama | 320B totales / 18B activos | no disponible | `.bin` propietario / numallama (CPU) | MIT | Hugging Face, 0 descargas |
| GLM-5.3-Flash (original) | 320B totales / 18B activos | no disponible | FP8 / transformers y otros | MIT | Hugging Face (zai-org) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo texto: el codificador de visión del modelo original no se ha convertido, por lo que no admite entradas de imagen.
- Formato no estándar: los archivos no son GGUF y no funcionan con llama.cpp, Ollama, LM Studio ni transformers; el ecosistema de herramientas disponible es muy reducido.
- Rendimiento dependiente de la plataforma: solo está optimizado para ARM64 con NEON; en x86-64 el código portable no optimizado degrada notablemente el throughput.
- Requisito de memoria elevado: ~210 GB de RAM limita el despliegue a servidores de gama alta; no cabe en estaciones de trabajo convencionales.
- Contexto máximo no documentado: la información disponible no especifica la longitud de contexto soportada por esta conversión.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe sin evaluación previa.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de esta conversión.
- Sesgos: no se han documentado sesgos conocidos en la información disponible; se recomienda evaluar antes de uso en producción.
- Licencia MIT: permite uso comercial, pero se debe conservar el aviso de copyright de Z.AI Co., Ltd.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (21 de noviembre de 2026); se trata de una conversión reciente sin validación comunitaria amplia.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares para esta conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miloserdev/GLM-5.3-Flash-numallama
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio de numallama: https://github.com/miloserdev/numallama
- README de numallama (opciones y API): https://github.com/miloserdev/numallama#readme
- Informe técnico GLM-5 (arXiv): https://arxiv.org/abs/2602.15763
