# OliviaRossi/DAOS-Fusion-Q5_K_M-GGUF

## Resumen

DAOS-Fusion-Q5_K_M-GGUF es una cuantización en formato GGUF del modelo DAOS-Fusion, desarrollado por OliviaRossi. DAOS-Fusion es un modelo de lenguaje de tipo mezcla de expertos (MoE) con aproximadamente 34,66 mil millones de parámetros totales, construido mediante fusión de modelos basados en las arquitecturas Qwen3.5 y Qwen3.6. El modelo está orientado a tareas de generación de texto, código, razonamiento y uso como agente, y soporta inglés, chino y código.

Esta versión GGUF, cuantizada a Q5_K_M, permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con GGUF, sin necesidad de GPUs de gran capacidad. El repositorio pesa 24,7 GB, lo que lo hace viable para tarjetas gráficas con 24 GB de VRAM o incluso menos con offloading parcial. La licencia Apache-2.0 facilita su uso comercial y modificación.

La relevancia de este modelo radica en su naturaleza de fusión (merge) de modelos Qwen recientes, combinando técnicas como DARE, STAR y Delta-Net, lo que podría ofrecer un rendimiento superior en razonamiento y código en comparación con los modelos base individuales, aunque no se dispone de benchmarks publicados para verificarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5/Qwen3.6 (fusion) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (este repositorio) |
| Idiomas soportados | ingles, chino, codigo |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura exacta de DAOS-Fusion no esta documentada en la informacion disponible. Los tags indican que se trata de un modelo de tipo MoE, construido mediante la fusion de modelos basados en Qwen3.5 y Qwen3.6. Se mencionan tecnicas de fusion como DARE (Drop And REscale), STAR y Delta-Net, asi como "model-stock" y "della", lo que sugiere un proceso de mezcla de pesos entre varios modelos base. No se especifican los datos de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. El modelo base (OliviaRossi/DAOS-Fusion) esta disponible en formato safetensors, y esta version GGUF fue convertida mediante llama.cpp usando el espacio GGUF-my-repo.

## Capacidades

- Generacion de texto y razonamiento: el modelo esta etiquetado como "reasoning", lo que sugiere capacidad para tareas de logica y deduccion, aunque no se detallan metodos especificos como thinking mode.
- Generacion de codigo: la etiqueta "code" indica que el modelo esta optimizado para tareas de programacion, incluyendo generacion, completado y explicacion de codigo.
- Uso como agente: la etiqueta "agent" sugiere soporte para interacciones multi-paso y posiblemente tool calling, aunque no se confirma explicitamente.
- Multilingue: soporta ingles y chino, ademas de codigo, lo que lo hace util para entornos bilingues.
- Compatibilidad con vLLM y llama.cpp: el modelo puede ejecutarse en estos motores de inferencia, lo que facilita su integracion en pipelines de produccion.

## Casos de uso

- Asistente de programacion local: un desarrollador puede usar el modelo con llama.cpp en una estacion de trabajo con GPU de 24 GB para obtener sugerencias de codigo, refactorizacion y depuracion sin depender de servicios en la nube.
- Chatbot bilingue ingles-chino: gracias a su soporte para ambos idiomas, puede desplegarse como un asistente conversacional para equipos internacionales, con la ventaja de la licencia Apache-2.0 para uso comercial.
- Agente de automatizacion de tareas: si el modelo soporta tool calling (no confirmado), podria integrarse en frameworks de agentes para ejecutar acciones como busquedas web, envio de correos o gestion de archivos, aprovechando su capacidad de razonamiento.
- Generacion de documentacion tecnica: el modelo puede redactar documentacion, comentarios de codigo y guias de usuario en ingles o chino, reduciendo el trabajo manual de los equipos de desarrollo.
- Prototipado rapido de aplicaciones de IA: al ser un GGUF, se puede cargar con Ollama o llama.cpp en un portatil con suficiente RAM para experimentar con prompts y flujos de razonamiento antes de escalar a modelos mas grandes.
- Analisis de codigo legacy: con su capacidad de entender codigo, puede ayudar a revisar y modernizar codigo antiguo, explicando su funcionamiento y sugiriendo mejoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se puede comparar objetivamente con otros modelos sin datos verificados.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q5_K_M pesa 24,7 GB. Para cargarlo completamente en VRAM se necesitan al menos 24 GB de memoria de GPU, aunque con offloading parcial a RAM puede funcionar con menos.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A5000, A6000, o GPUs profesionales con 24 GB o mas. En Mac con Apple Silicon, puede ejecutarse con suficiente RAM unificada (32 GB recomendados).
- En consumer GPU: cabe en RTX 3090 y RTX 4090 (24 GB). Con cuantizaciones mas bajas (Q4_K_M) podria caber en 16 GB, pero no se ofrecen en este repositorio.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama, vLLM (si se convierte a otro formato), text-generation-inference (TGI) con adaptacion.
- Latencia y throughput: no disponibles. Dependen del hardware y del numero de parametros activos (desconocido). En una RTX 4090, un MoE de 34B con pocos parametros activos podria alcanzar decenas de tokens por segundo, pero es una estimacion sin base solida.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. Modelos comparables en tamano y enfoque serian Qwen3-32B (denso) o Mixtral 8x22B (MoE), pero no se conocen los parametros activos de DAOS-Fusion ni sus resultados en benchmarks. La licencia Apache-2.0 es mas permisiva que la de Mixtral (Apache-2.0 tambien) y similar a Qwen3 (Apache-2.0). Se recomienda consultar la ficha del modelo base para mas detalles.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar contenido falso o sesgado. No se han publicado evaluaciones de sesgo.
- Contexto limitado: se desconoce la longitud de contexto soportada; es posible que sea inferior a la de modelos recientes como Qwen3 (128K). Verificar antes de usar en tareas de contexto largo.
- Idiomas: solo se garantiza ingles, chino y codigo. Otros idiomas pueden tener un rendimiento degradado.
- Licencia: Apache-2.0 permite uso comercial, pero se debe mantener la atribucion y no usar marcas registradas. No hay restricciones de uso militar o de alto riesgo, pero se recomienda revisar la licencia completa.
- Produccion: al ser un modelo de fusion, su comportamiento puede ser menos predecible que un modelo entrenado desde cero. Se recomienda validar exhaustivamente antes de desplegar en entornos criticos.
- Cuantizacion: la cuantizacion Q5_K_M introduce una perdida de precision respecto al modelo original en safetensors. Para tareas que requieran maxima fidelidad, usar el modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OliviaRossi/DAOS-Fusion-Q5_K_M-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/DAOS-Fusion
- Espacio GGUF-my-repo (conversion): https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
