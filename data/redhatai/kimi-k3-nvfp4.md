# RedHatAI/Kimi-K3-NVFP4

## Resumen

RedHatAI/Kimi-K3-NVFP4 es una versión cuantizada del modelo MoonshotAI/Kimi-K3, desarrollada por Red Hat AI con el objetivo de acelerar la inferencia de un modelo de clase 3T mediante la cuantización de sus capas de mezcla de expertos (MoE) al formato NVFP4. Kimi-K3 es el primer modelo abierto de 2,8 billones de parámetros, con arquitectura basada en Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), visión nativa y una ventana de contexto de un millón de tokens. Esta cuantización reduce significativamente los requisitos de memoria y mejora el rendimiento en entornos de producción, manteniendo una degradación mínima en tareas de razonamiento complejo.

La relevancia de este modelo radica en que permite desplegar un sistema de frontera con capacidades multimodales y agénticas en infraestructura de GPUs más asequible, sin necesidad de los 5,6 TB de memoria que requeriría la versión en BF16. Está pensado para su uso con vLLM, que soporta el formato NVFP4 de forma nativa, y se distribuye bajo licencia MIT, lo que facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 1.588.733.216.352 (cuantizado, segun safetensors); 2,8 billones en el modelo base |
| Parametros activos | no disponible (el modelo base es MoE, pero no se especifica el numero de activos) |
| Longitud de contexto | 1.000.000 tokens (modelo base) |
| Tipos de cuantizacion | NVFP4 (4-bit floating point) en capas MoE |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con codigo personalizado para vLLM) |

## Arquitectura y entrenamiento

El modelo base Kimi-K3 es un transformer de 2,8 billones de parametros con arquitectura MoE, que incorpora dos innovaciones principales: Kimi Delta Attention (KDA), un mecanismo de atencion que reduce el coste computacional en secuencias largas, y Attention Residuals (AttnRes), que mejora la estabilidad del entrenamiento y la calidad de las representaciones. El modelo tiene capacidades nativas de vision y esta disenado para tareas agénticas de largo horizonte, como generacion de codigo y trabajo de conocimiento.

La version cuantizada RedHatAI/Kimi-K3-NVFP4 se ha obtenido mediante LLM Compressor, una herramienta de compresion de modelos de Red Hat. El proceso convierte los pesos de las capas MoE a NVFP4, un formato de punto flotante de 4 bits optimizado para GPUs NVIDIA Hopper y posteriores. La cuantizacion se ha realizado de forma offline, sin instanciar el modelo completo en memoria, lo que evita la materializacion de los 5,6 TB en BF16. El resultado es un modelo de aproximadamente 1,6 TB en disco, listo para servir con vLLM.

## Capacidades

- Generacion de texto y razonamiento complejo: mantiene un rendimiento cercano al modelo original en tareas de conocimiento cientifico (GPQA 91,0 frente a 93,5).
- Razonamiento multi-paso con modo de pensamiento: el modelo incluye un parser de razonamiento especifico (`--reasoning-parser kimi_k3`) que permite extraer cadenas de pensamiento.
- Capacidades multimodales nativas: el modelo base acepta entradas de imagen y texto, aunque la cuantizacion no altera esta funcionalidad.
- Soporte de tool calling y uso agéntico: disenado para tareas de largo horizonte, como desarrollo de software y automatizacion de flujos de trabajo.
- Ventana de contexto de 1 millon de tokens: permite procesar documentos extensos, repositorios de codigo completos o conversaciones de multiples turnos.
- Multilingue: no se ha confirmado oficialmente, pero el modelo base de Moonshot AI suele soportar multiples idiomas.

## Casos de uso

- Desarrollo de software a gran escala: el modelo puede analizar repositorios completos, generar parches y refactorizar codigo gracias a su contexto de 1M tokens y su capacidad de razonamiento multi-paso. La cuantizacion NVFP4 permite ejecutarlo en clusters de 8 GPUs con memoria moderada.
- Asistente de investigacion cientifica: con un rendimiento de 91,0 en GPQA, puede ayudar a formular hipotesis, resumir articulos y responder preguntas tecnicas avanzadas en fisica, quimica y biologia.
- Atencion al cliente con contexto largo: puede gestionar conversaciones de soporte que abarquen historiales completos de tickets, manuales de producto y documentacion tecnica, manteniendo coherencia durante miles de turnos.
- Analisis de documentos legales y financieros: su ventana de 1M tokens permite procesar contratos extensos, informes anuales o expedientes completos en una sola pasada, extrayendo clausulas relevantes y generando resumenes ejecutivos.
- Agente de automatizacion de tareas: al soportar tool calling, puede integrarse en pipelines de CI/CD para ejecutar pruebas, gestionar incidencias o coordinar despliegues, actuando como un agente autonomo con supervision humana.
- Servicio de inferencia de alto rendimiento: gracias a la cuantizacion NVFP4 y la integracion con vLLM, puede desplegarse como backend de API para aplicaciones que requieren baja latencia y alto throughput, como chatbots o asistentes de codigo en tiempo real.

## Benchmarks y rendimiento

La unica evaluacion publicada en la model card compara el rendimiento en GPQA (Graduate-Level Google-Proof Q&A) entre el modelo base y la version cuantizada:

| Benchmark | moonshotai/Kimi-K3 | RedHatAI/Kimi-K3-NVFP4 |
|---|---|---|
| GPQA (diamond, razonamiento alto) | 93,5 | 91,0 |

La degradacion es de 2,5 puntos porcentuales, lo que indica una perdida minima de precision tras la cuantizacion. No se han publicado resultados adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1646,2 GB en disco, pero al ser NVFP4 (4 bits), la memoria necesaria para cargar los pesos es aproximadamente la mitad de ese tamaño, en torno a 800-900 GB. Con `--tensor-parallel-size 8`, se reparte entre 8 GPUs, requiriendo unas 100-110 GB por GPU.
- GPUs recomendadas: NVIDIA H100 (80 GB) o A100 (80 GB) en configuracion de 8 o mas unidades. No cabe en GPUs de consumo como RTX 4090 (24 GB) ni en una sola GPU profesional.
- Opciones de despliegue: vLLM es la unica opcion soportada oficialmente, con el comando `vllm serve RedHatAI/Kimi-K3-NVFP4 --tensor-parallel-size 8 --trust_remote_code --load-format instanttensor --reasoning-parser kimi_k3`. Se requiere el PR #50500 de vLLM para su funcionamiento.
- Latencia y throughput: no se han publicado cifras concretas, pero la cuantizacion NVFP4 esta disenada para acelerar la inferencia en GPUs Hopper, reduciendo el ancho de banda de memoria necesario y aumentando el numero de tokens generados por segundo en comparacion con BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | GPQA |
|---|---|---|---|---|---|
| moonshotai/Kimi-K3 | 2,8 billones | 1M tokens | MIT | BF16 (original) | 93,5 |
| RedHatAI/Kimi-K3-NVFP4 | 1,59 billones (cuantizado) | 1M tokens | MIT | NVFP4 | 91,0 |
| Otros modelos cuantizados de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre alternativas cuantizadas de otros modelos de tamano similar en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Degradacion de rendimiento: la cuantizacion reduce la precision en tareas de razonamiento complejo (GPQA baja de 93,5 a 91,0). Para aplicaciones donde la exactitud es critica, se recomienda validar el comportamiento en el dominio especifico.
- Dependencia de vLLM: el modelo solo puede servirse con vLLM y requiere un parche no fusionado (PR #50500). No es compatible con otras herramientas como llama.cpp, Ollama o TGI sin adaptaciones adicionales.
- Requisitos de hardware elevados: a pesar de la cuantizacion, sigue necesitando un cluster de GPUs con al menos 800 GB de VRAM total, lo que limita su uso a entornos empresariales o de investigacion con infraestructura dedicada.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos ni de tasas de alucinacion para esta version cuantizada. El modelo base, al ser de gran tamano, puede presentar sesgos presentes en sus datos de entrenamiento, que no se han documentado.
- Idiomas: no se ha confirmado la lista de idiomas soportados, por lo que el rendimiento en lenguas distintas del ingles o el chino no esta garantizado.
- Uso comercial: la licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar los terminos del modelo base y de las herramientas de compresion utilizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Kimi-K3-NVFP4
- Repositorio del modelo base Kimi-K3: https://github.com/MoonshotAI/Kimi-K3
- Repositorio de cuantizacion de patronus-ai: https://github.com/patronus-ai/kimi-k3-nvfp4
- Visualizacion de arquitectura (hfviewer): https://hfviewer.com/RedHatAI/Kimi-K3-NVFP4
