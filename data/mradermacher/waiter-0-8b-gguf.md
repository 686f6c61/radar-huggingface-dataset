# mradermacher/waiter-0.8B-GGUF

## Resumen

waiter-0.8B es un modelo de lenguaje compacto de 752 millones de parametros, desarrollado por adisyonist y cuantizado a formato GGUF por mradermacher. Esta especializado en el dominio de restaurantes y sistemas de punto de venta (POS), con capacidades de enrutamiento de herramientas (tool-routing) y conversacion multilingue. El modelo se basa en la arquitectura Qwen3.5 y fue entrenado mediante QLoRA, lo que lo convierte en una opcion ligera y eficiente para despliegues en entornos de hosteleria.

La relevancia de este modelo radica en su tamano reducido, que permite ejecutarlo en hardware de consumo, y su especializacion en un nicho concreto: la gestion de pedidos, reservas y atencion al cliente en el sector hostelero. Al estar publicado bajo licencia Apache 2.0, puede integrarse libremente en aplicaciones comerciales sin restricciones de uso.

La version GGUF de mradermacher ofrece doce niveles de cuantizacion, desde Q2_K (0,5 GB) hasta f16 (1,6 GB), lo que permite ajustar el equilibrio entre precision y consumo de memoria segun el hardware disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer) |
| Parametros totales | 752.393.024 (752M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (etiqueta oficial "en"; el autor declara "multilingual" en los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base waiter-0.8B de adisyonist se construye sobre la arquitectura Qwen3.5, una familia de transformers autoregresivos desarrollada por Alibaba. Con 752 millones de parametros, se trata de un modelo de tamano reducido orientado a tareas especificas. El entrenamiento se realizo mediante QLoRA (Quantized Low-Rank Adaptation), una tecnica de ajuste fino eficiente que congela los pesos del modelo base y entrena adaptadores de bajo rango, reduciendo significativamente los requisitos de memoria y computo durante el entrenamiento.

El dominio de especializacion es el sector de la restauracion y los sistemas de punto de venta (POS), con un enfasis particular en el enrutamiento de herramientas (tool-routing), es decir, la capacidad de seleccionar y delegar acciones a herramientas externas durante una conversacion. Aunque la etiqueta de idioma principal es ingles, los tags del modelo indican soporte multilingue, aunque no se especifican los idiomas concretos ni la composicion del dataset de entrenamiento.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional orientado al dominio de restaurantes y hosteleria.
- Enrutamiento de herramientas (tool-routing): capacidad de seleccionar y delegar acciones a herramientas externas, util para integrar el modelo con sistemas POS, APIs de reservas o pasarelas de pago.
- Conversacion multi-turno: disenado para mantener dialogos coherentes con clientes en entornos de atencion al publico.
- Soporte multilingue declarado por el autor, aunque la documentacion solo confirma ingles como idioma principal.
- Compatible con el ecosistema transformers de HuggingFace y con motores de inferencia que soporten GGUF (llama.cpp, Ollama, LM Studio, etc.).

## Casos de uso

- Atencion al cliente en restaurantes: el modelo puede gestionar conversaciones con clientes para tomar pedidos, resolver dudas sobre el menu o gestionar quejas, delegando acciones concretas al sistema POS mediante tool-routing.
- Gestion de reservas: integrado con un sistema de reservas, el modelo puede confirmar disponibilidad, modificar reservas existentes o cancelar citas a traves de conversacion natural.
- Asistente de punto de venta (POS): el modelo puede interpretar comandos de voz o texto del personal y ejecutar operaciones en el sistema POS, como abrir mesas, anadir articulos o procesar pagos.
- Enrutamiento de peticiones en sistemas multi-herramienta: gracias a su capacidad de tool-routing, puede actuar como orquestador que decide que herramienta invocar segun la intencion del usuario.
- Chatbot de hosteleria desplegado en local: su tamano reducido permite ejecutarlo en hardware de bajo coste (Raspberry Pi, mini-PCs) sin depender de APIs externas, garantizando privacidad de los datos de clientes.
- Prototipado rapido de asistentes conversacionales: al ser un modelo pequeno con licencia permisiva, es adecuado para validar conceptos de IA conversacional en el sector servicios antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (cuantizacion Q2_K) y 1,6 GB (f16), mas el overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para las cuantizaciones mas bajas; una GPU de 4-6 GB (GTX 1650, RTX 3050, RTX 2060) permite ejecutar todas las variantes con comodidad.
- Compatible con hardware de consumo: si, incluyendo tarjetas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o cualquier motor compatible con GGUF. Tambien puede cargarse con transformers si se convierte a safetensors.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 752M de parametros, se espera una generacion rapida incluso en CPU, pero no hay datos medidos publicados.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones detalladas de modelos comparables en la informacion proporcionada. Como referencia de categoria, otros modelos pequenos de la familia Qwen (como Qwen2.5-0.5B o Qwen2.5-1.5B) ofrecen tamanos similares, pero no se dispone de datos de rendimiento comparables para waiter-0.8B. La especializacion en el dominio de restaurantes y POS es un diferenciador frente a modelos generalistas de tamano equivalente.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeno (752M), es mas propenso a alucinaciones y errores factuales que modelos de mayor tamano. No se han publicado evaluaciones de sesgos.
- Idioma: la documentacion oficial solo confirma ingles como idioma principal. Aunque los tags mencionan "multilingual", no se especifican los idiomas soportados ni la calidad en cada uno.
- Contexto limitado: no se ha publicado la longitud de contexto, lo que dificulta planificar despliegues que requieran conversaciones muy largas o documentos extensos.
- Datos de entrenamiento desconocidos: no se ha publicado informacion sobre la composicion del dataset, el numero de tokens ni las tecnicas de alineacion, lo que limita la evaluacion de riesgos de sesgo o contenido inapropiado.
- Dominio estrecho: el modelo esta especializado en restauracion y POS; su rendimiento fuera de este dominio probablemente sea inferior al de modelos generalistas de tamano similar.
- Cuantizaciones de baja precision: las variantes Q2_K y Q3_K pueden degradar significativamente la calidad de salida; se recomienda usar Q4_K_M o superior para entornos de produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/waiter-0.8B-GGUF
- Modelo base (safetensors): https://huggingface.co/adisyonist/waiter-0.8B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
