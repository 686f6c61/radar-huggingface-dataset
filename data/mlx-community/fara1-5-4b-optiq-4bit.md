# mlx-community/Fara1.5-4B-OptiQ-4bit

## Resumen

Fara1.5-4B-OptiQ-4bit es una cuantizacion mixta de precision en formato MLX del modelo microsoft/Fara1.5-4B, un modelo de vision-lenguaje orientado a computer-use y agentes web, construido sobre la arquitectura Qwen3.5. Lo publica el colectivo mlx-community y esta pensado para ejecucion local en Apple Silicon sin dependencia de PyTorch ni de servicios en la nube. El modelo resuelve el problema de desplegar un agente visual capaz de interpretar capturas de pantalla y actuar sobre interfaces web en hardware de consumo, manteniendo el pipeline image-text-to-text del modelo original.

La cuantizacion emplea una asignacion de bits mixta de 4 y 8 bits (5,31 bits por peso de media), con un peso total en disco de 3,9 GB y 4.205.751.296 parametros. La torre de vision se conserva en bf16 en un fichero separado, de modo que el mismo repositorio carga en modo solo texto bajo mlx-lm estandar y en modo imagen+texto completo bajo el stack OptiQ. Esto permite reutilizar los pesos tanto en inferencia textual ligera como en tareas de agente visual.

Su relevancia actual radica en que traslada un modelo de agente web a un formato ejecutable en un Mac, con endpoint compatible con OpenAI, lo que facilita prototipado de automatizacion de navegador y agentes de escritorio sin GPU dedicada. La licencia MIT del modelo base simplifica el uso comercial, aunque el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 (vision-lenguaje, image-text-to-text) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta 4/8 bits (OptiQ), 5,31 bits por peso; torre de vision en bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); fichero separado optiq/optiq_vision.safetensors para vision |
| Tamano en disco | 3,9 GB (repo de 4,2 GB) |
| Modelo base | microsoft/Fara1.5-4B |
| Libreria | mlx |

## Arquitectura y entrenamiento

El modelo base Fara1.5-4B es un finetune de Qwen3.5-4B con arquitectura identica, lo que permite transferir directamente la asignacion de bits por capa desde la cuantizacion publicada mlx-community/Qwen3.5-4B-OptiQ-4bit sin realizar un analisis de sensibilidad propio. La cuantizacion OptiQ aplica precision mixta de 4 y 8 bits segun la sensibilidad de cada capa, mientras que la torre de vision se mantiene en bf16 para preservar la calidad en la interpretacion de imagenes.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La model card del quant no detalla innovaciones de decodificacion especulativa ni mecanismos de atencion alternativos; el interes tecnico se concentra en la preservacion de la ruta multimodal (vision en bf16) dentro de un formato cuantizado ejecutable en MLX.

## Capacidades

- Generacion de texto conversacional en ingles.
- Comprension de imagenes (image-text-to-text), orientada a capturas de pantalla e interfaces de usuario.
- Computer-use: interpretacion y accion sobre entornos de escritorio y aplicaciones.
- Agente web: navegacion y automatizacion de tareas en paginas web.
- Razonamiento multi-paso orientado a agentes (segun los tags del modelo: agent, web-agent).
- Carga dual: solo texto bajo mlx-lm estandar, imagen+texto bajo el stack OptiQ.
- Servicio mediante endpoint compatible con OpenAI (parte image_url para la ruta de vision).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de navegador en local: el modelo puede procesar capturas de pantalla de paginas web y decidir la siguiente accion (clic, escritura, scroll) en un flujo de agente, ejecutandose en un Mac sin GPU dedicada gracias a los 3,9 GB de pesos cuantizados.
- Testing de interfaces de usuario: dado que interpreta imagenes de la UI, puede emplearse para validar estados visuales y detectar regresiones en aplicaciones web durante pipelines de QA.
- Asistentes de escritorio: integrado via endpoint compatible con OpenAI, permite construir un asistente que observe la pantalla y guie al usuario paso a paso en tareas de ofimatica.
- Prototipado de agentes web con contexto de imagen: util en entornos de investigacion donde se necesita iterar rapidamente sobre politicas de accion sin coste de API en la nube.
- Extraccion de informacion de capturas: puede describir y estructurar el contenido visible de una imagen de interfaz (formularios, tablas, menus) para alimentar sistemas posteriores.
- Formacion y demos: al ser un quant ligero con licencia MIT, sirve para talleres y demostraciones de computer-use en hardware Apple, sin dependencias de PyTorch.
- Despliegue de chatbot textual ligero: cargado bajo mlx-lm estandar, funciona como modelo conversacional de 4B en ingles para tareas de texto sin la ruta de vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unificated memory estimada: aproximadamente 4 GB para los pesos cuantizados, mas overhead de contexto y de la torre de vision en bf16 (no cuantificada).
- Hardware objetivo: Apple Silicon (MLX). No se indica soporte para CUDA en esta publicacion.
- Cabe en equipos consumer Apple con 8 GB o mas de memoria unificada; se recomienda 16 GB para margen con contexto largo y ruta de vision.
- Despliegue: `optiq serve` (stack OptiQ) para texto+vision; mlx-lm estandar para solo texto.
- Endpoint: compatible con OpenAI en http://localhost:8000/v1.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- vLLM, llama.cpp, Ollama y TGI no estan indicados como soportados para estos pesos MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Fara1.5-4B-OptiQ-4bit (este) | 4,2B | no disponible | MLX safetensors (4/8 bits mixto) | MIT | Computer-use / agente web, vision |
| microsoft/Fara1.5-4B | 4,2B | no disponible | safetensors (bf16) | MIT | Computer-use / agente web, vision |
| mlx-community/Qwen3.5-4B-OptiQ-4bit | ~4B | no disponible | MLX safetensors (4/8 bits mixto) | no disponible | LLM de texto general |
| Qwen3.5-4B (base) | ~4B | no disponible | safetensors | no disponible | LLM de texto general |

La comparativa se limita a las variantes de la misma familia; no se dispone de datos de rendimiento para contrastar con alternativas de otros autores.

## Limitaciones y advertencias

- Idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion: como modelo de agente visual, puede generar acciones incorrectas o interpretar mal elementos de la interfaz; requiere validacion y limites de seguridad en produccion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- La cuantizacion mixta 4/8 bits puede degradar ligeramente la precision respecto al modelo bf16 original, especialmente en tareas de razonamiento visual.
- La torre de vision en bf16 aumenta el consumo de memoria respecto a los pesos de texto.
- Compatibilidad limitada: soporte completo solo bajo OptiQ; bajo mlx-lm estandar se pierde la ruta de vision.
- No se documenta longitud de contexto, por lo que no se puede garantizar el manejo de conversaciones o pantallas de gran extension.
- Licencia MIT del modelo base: permite uso comercial, pero conviene verificar los terminos del modelo original microsoft/Fara1.5-4B y de los datos de entrenamiento subyacentes.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/Fara1.5-4B-OptiQ-4bit
- Modelo base: https://huggingface.co/microsoft/Fara1.5-4B
- Quant de referencia Qwen3.5-4B: https://huggingface.co/mlx-community/Qwen3.5-4B-OptiQ-4bit
- Toolkit OptiQ: https://mlx-optiq.com
- Documentacion OptiQ: https://mlx-optiq.com/docs/
- Laboratorio OptiQ: https://mlx-optiq.com/docs/lab/
- Catalogo de quants OptiQ: https://mlx-optiq.com/models
- mlx-lm: https://github.com/ml-explore/mlx-lm
