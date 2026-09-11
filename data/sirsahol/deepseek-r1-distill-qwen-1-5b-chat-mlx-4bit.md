# SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-4bit

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-4bit es una conversion a formato MLX de Apple del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, publicada por el usuario SirSahOl. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es una conversion de pesos con cuantizacion de 4 bits (weight-only) generada con la herramienta mlx-lm 0.31.3, pensada para ejecutar el modelo en Macs con chip Apple Silicon mediante el framework MLX. El repositorio ocupa 1,0 GB y el artefacto convertido pesa 964,5 MB, con 1.777.088.000 parametros almacenados en safetensors.

El modelo hereda la arquitectura y el comportamiento del modelo base, un transformer decoder-only de la familia Qwen2 (etiqueta `qwen2` en HuggingFace) con aproximadamente 1,78 mil millones de parametros, orientado a generacion de texto y uso conversacional. Su interes practico esta en el consumo de memoria: segun la model card, la variante de 4 bits alcanza 52,9 tokens por segundo con un TTFT de 18,91 ms y un pico de memoria de 808 MB en un Apple M1 con 8 GB de memoria unificada, lo que permite ejecutarlo en portatiles modestos junto a otras aplicaciones.

La relevancia de esta ficha es doble. Por un lado, documenta una via de despliegue local en hardware de consumo Apple, un nicho donde el ecosistema MLX compite con llama.cpp y Ollama. Por otro, conviene advertir que se trata de una conversion de la comunidad con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks de calidad publicados, por lo que su evaluacion debe basarse en el modelo base y no en metricas propias del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (etiqueta `qwen2`) |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; el autor advierte de degradacion por encima de 8K tokens |
| Tipos de cuantizacion | 4-bit (cuantizacion weight-only de MLX, `--q-bits 4`); el autor publica tambien una variante de 8 bits |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | MIT (heredada del modelo base segun la model card) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx-lm`) |
| Tamano del repositorio | 1,0 GB (artefacto convertido: 964,5 MB) |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (relacion: quantized) |
| Version de conversion | mlx-lm 0.31.3; tiempo de conversion 11,44 s |

## Arquitectura y entrenamiento

El repositorio no documenta ningun proceso de entrenamiento propio. Se trata de una conversion weight-only: la arquitectura, los pesos y el comportamiento se heredan integramente del modelo base deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, tal y como indica el propio autor en el apartado de limitaciones. La unica transformacion aplicada es la cuantizacion de 4 bits sobre los pesos, ejecutada con `python3 -m mlx_lm.convert --hf-path deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B --q-bits 4`, un proceso que tardo 11,44 segundos y produjo un artefacto de 964,5 MB.

Por la etiqueta `qwen2` y por el nombre del modelo base, la arquitectura subyacente es un transformer decoder-only de la familia Qwen2, previsiblemente con atencion de tipo Grouped Query Attention y normalizacion RMSNorm, aunque la informacion proporcionada no detalla la configuracion exacta de capas, cabezas ni dimension oculta. Del mismo modo, no hay datos disponibles sobre el numero de tokens de entrenamiento, la composicion del dataset del modelo base ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La model card tampoco documenta innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, SSM) mas alla de la propia cuantizacion de MLX.

## Capacidades

- Generacion de texto: es el proposito declarado del pipeline (`text-generation`) y el unico caso de uso documentado explicitamente.
- Uso conversacional: la etiqueta `conversational` indica que el modelo esta preparado para mantener dialogos multi-turno con el formato de plantilla del tokenizador heredado del modelo base.
- Razonamiento tipo cadena de pensamiento: el modelo base procede de la familia DeepSeek-R1-Distill, por lo que se espera que herede patrones de razonamiento explicito, si bien la model card de esta conversion no lo documenta ni lo garantiza.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada; el campo de idiomas no esta definido en el repositorio.
- Vision, audio u otras modalidades: no disponible; el repositorio solo declara generacion de texto.
- Modo de pensamiento explicito: no documentado en esta conversion.

## Casos de uso

- Asistente conversacional local en Mac: gracias a su pico de 808 MB de memoria en 4 bits, el modelo puede ejecutarse en un Apple M1 de 8 GB con `mlx_lm.chat` sin desplazar al resto de aplicaciones del sistema, lo que permite prototipar chatbots completamente offline.
- Generacion de texto por lotes en portatil: con 52,9 tokens/s en M1, resulta viable procesar resumenes, reformulaciones o clasificaciones sobre volumenes moderados de documentos directamente en el equipo, sin coste de API.
- Prototipado rapido de aplicaciones de IA: al instalarse con `pip install mlx-lm` y cargarse con dos lineas de Python (`load` y `generate`), es un candidato adecuado para validar prompts, plantillas y flujos conversacionales antes de pasar a modelos mayores.
- Educacion y demostraciones: su tamano reducido y su bajo requisito de memoria lo hacen util para talleres o asignaturas donde se explique cuantizacion, inferencia local o el ecosistema MLX en hardware Apple.
- Asistente de escritorio integrado en herramientas de desarrollo: puede incorporarse como motor de autocompletado o explicacion de fragmentos de codigo en un plugin local, siempre que se acepte la perdida de calidad propia de un modelo de 1,5 B en 4 bits.
- Filtrado y preprocesado de datos: tareas de etiquetado ligero, extraccion de entidades simples o normalizacion de textos que no requieran alta precision y donde el coste cero de inferencia local sea prioritario.
- Investigacion sobre cuantizacion: el repositorio, junto con su variante de 8 bits, permite comparar experimentalmente la degradacion de calidad y el rendimiento entre niveles de cuantizacion en Apple Silicon.
- Base para ajuste fino ligero en local: al ser un modelo de 1,78 B en formato MLX, puede servir como punto de partida para LoRA o ajustes pequenos en un Mac, aunque esta conversion no documenta dicho flujo.

## Benchmarks y rendimiento

La model card solo publica metricas de rendimiento de inferencia, no resultados de calidad (MMLU, HumanEval, GSM8K u otros). Los datos disponibles, medidos en un Apple M1 con 8 GB de memoria unificada, con un promedio de 5 ejecuciones y 256 tokens maximos, son los siguientes:

| Metrica | 4-bit | 8-bit |
|---|---|---|
| Tokens por segundo | 52,9 | 31,0 |
| TTFT (time to first token) | 18,91 ms | 32,26 ms |
| Pico de memoria | 808,0 MB | 354,3 MB |

No se han publicado resultados de benchmarks de calidad en la informacion disponible. Ademas, el dato de pico de memoria de la variante de 8 bits (354,3 MB) es inferior al de la variante de 4 bits (808,0 MB), lo que resulta contraintuitivo y sugiere que las condiciones de medida de ambas variantes pudieron no ser homogeneas; conviene tratar esa cifra con cautela hasta verificarla.

## Requisitos de hardware

- Plataforma: la model card indica explicitamente que el modelo requiere Apple Silicon (M1 o posterior) para ejecutarse con MLX. No es utilizable en GPUs NVIDIA o AMD sin reconvertir los pesos a otro formato.
- Memoria: pico medido de 808 MB en 4 bits sobre un M1 de 8 GB de memoria unificada, por lo que cabe holgadamente en cualquier Mac con 8 GB o mas.
- Recomendacion por hardware segun el autor: M1/M2 con 8 GB, variante de 4 bits; M1/M2 Pro/Max con 16-32 GB, variante de 8 bits; M2/M3/M4 Ultra con 64 GB o mas, version de 16 bits sin perdida de calidad.
- GPU de datacenter (A100, H100, RTX 4090): no aplicable a este artefacto, ya que esta en formato MLX y no en safetensors estandar de PyTorch ni GGUF.
- Opciones de despliegue: `mlx-lm` mediante CLI (`mlx_lm.chat`, `mlx_lm.generate`) o API de Python (`mlx_lm.load`, `mlx_lm.generate`). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama con estos pesos concretos.
- Latencia y throughput: 52,9 tokens/s y 18,91 ms de TTFT en 4 bits sobre Apple M1; 31,0 tokens/s y 32,26 ms de TTFT en 8 bits, segun los datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizacion | Memoria / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SirSahOl, 4-bit MLX) | 1,78 B | safetensors MLX, 4-bit | 964,5 MB en disco; 808 MB de pico en M1 | MIT | Repositorio con 0 descargas y 0 likes |
| SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-8bit | 1,78 B (mismo base) | safetensors MLX, 8-bit | No disponible el tamano exacto; pico reportado de 354,3 MB | MIT | Variante publicada por el mismo autor |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | Pesos originales del modelo base (precisión completa) | No disponible | No disponible en esta busqueda | Modelo oficial de DeepSeek |

No se dispone de datos de contexto, benchmarks de calidad ni comparativas con alternativas de la misma categoria (por ejemplo, otros modelos de ~1,5 B en formato MLX o GGUF) en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: el propio autor advierte de que la cuantizacion introduce una perdida pequena de calidad respecto al modelo original y que a menor numero de bits, mayor degradacion. La variante de 4 bits es la mas agresiva de las publicadas.
- Degradacion en contextos largos: la model card senala que el rendimiento puede degradarse con contextos muy largos (mas de 8K tokens) en niveles bajos de cuantizacion.
- Dependencia de plataforma: requiere Apple Silicon (M1 o posterior). No puede desplegarse en GPUs NVIDIA, AMD ni en servidores x86 convencionales sin una reconversion de pesos.
- Conversion weight-only: la arquitectura y el comportamiento son los del modelo base; esta publicacion no aporta ajuste, alineamiento ni mitigacion de sesgos propia.
- Ausencia de benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni similares para esta conversion, de modo que no es posible cuantificar la degradacion real frente al modelo original.
- Riesgo de alucinacion: inherente a un modelo de 1,78 B de parametros en 4 bits; no se documentan medidas especificas de mitigacion.
- Idiomas: el repositorio no declara idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion y ultima actualizacion del 10 de septiembre de 2026. Es una conversion de la comunidad sin validacion externa ni proceso de revision.
- Licencia: MIT segun la model card, heredada del modelo base. En principio permite uso comercial, pero conviene verificar la licencia del modelo original antes de utilizarlo en produccion.
- Anomalia en las metricas: la memoria pico publicada para 8 bits es inferior a la de 4 bits, lo que resta fiabilidad a esa comparativa concreta.
- Resultados de busqueda web no pertinentes: las consultas realizadas devolvieron unicamente paginas sobre la vista de butacas del teatro Wycombe Swan, sin ninguna relacion con el modelo. No se ha podido contrastar informacion adicional por esta via.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-4bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Variante de 8 bits: https://huggingface.co/SirSahOl/DeepSeek-R1-Distill-Qwen-1.5B-chat-mlx-8bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Herramienta de conversion mlx-lm: incluida en el paquete `pip install mlx-lm` (version 0.31.3 empleada en la conversion)
- Pipeline de conversion MLX Foundry: https://github.com/SirSahOl/mlx-foundry
- Papers, blogs o demos adicionales: no disponible en la informacion proporcionada
