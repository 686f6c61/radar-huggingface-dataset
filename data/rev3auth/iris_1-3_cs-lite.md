# Rev3auth/iris_1.3_cs-lite

# Rev3auth/iris_1.3_cs-lite

## Resumen
Rev3auth/iris_1.3_cs-lite es un modelo de lenguaje conversacional de pequeno tamano, derivado de Gemma 3 270M instruct y publicado en formato GGUF por el usuario Rev3auth. Con 268 098 176 parametros (unos 268 millones), se situa en la categoria de modelos ultraligeros, pensados para inferencia en hardware modesto: CPU, dispositivos de borde e incluso moviles. El repositorio ocupa aproximadamente 0,3 GB e incluye una unica cuantizacion Q8_0, ademas de un Modelfile para Ollama.

El modelo ha sido ajustado y convertido a GGUF con Unsloth, una herramienta que el propio autor destaca por permitir un entrenamiento "2x mas rapido". Su identificador y el archivo publicado (`gemma-3-270m-it.Q8_0.gguf`) confirman que parte del checkpoint instruct de Gemma 3 270M, lo que lo vincula a la familia de modelos abiertos de Google.

Es relevante ahora por su perfil de despliegue: al tratarse de un ajuste fino de un modelo base muy compacto y ya cuantizado, resulta adecuado para prototipado rapido, pruebas de concepto conversacionales y escenarios donde la latencia y el consumo de memoria son criticos. La model card es muy escueta y no aporta datos sobre licencia, idiomas, dataset de entrenamiento ni evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text, `gemma3_text`) |
| Parametros totales | 268 098 176 (~268 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 270M esta documentado con ventana de hasta 32 000 tokens) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado: `gemma-3-270m-it.Q8_0.gguf`) |
| Idiomas soportados | no disponible (no especificado en la model card) |
| Licencia | no disponible (la model card no la indica) |
| Formato de pesos | GGUF (repositorio); el recuento de parametros procede de metadata safetensors del entrenamiento |

## Arquitectura y entrenamiento
Se trata de un modelo transformer decoder-only perteneciente a la familia Gemma 3 text, segun la etiqueta `gemma3_text`. El recuento de 268 millones de parametros coincide con el checkpoint `gemma-3-270m-it`, del que parte, de modo que la arquitectura base es la de Gemma 3 270M instruct. El ajuste fino se realizo con Unsloth, que el autor emplea tanto para el entrenamiento como para la posterior conversion a GGUF. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Como innovacion practica destacable, la model card indica que el comportamiento del token BOS se ajusto para lograr compatibilidad con GGUF. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal u otros mecanismos, y la informacion disponible no permite confirmar detalles sobre la longitud de contexto efectiva tras el ajuste.

## Capacidades
- Generacion de texto conversacional en un unico turno y en modo multi-turno basico, segun la etiqueta `conversational` del repositorio.
- Al tratarse de un derivado de un modelo instruct, esta orientado a seguir instrucciones sencillas.
- Compatible con `llama.cpp` y con el flag `--jinja` para el uso de plantillas de chat.
- Ejecutable mediante `llama-cli` (texto) y `llama-mtmd-cli` (segun la model card, para modelos multimodales; no se especifica si este ajuste conserva capacidades de vision).
- Despliegue facilitado en Ollama gracias al Modelfile incluido.
- Soporte declarado de `endpoints_compatible` en las etiquetas del repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matematicas avanzadas ni audio en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso
- Prototipado rapido de asistentes conversacionales: al ocupar unos 0,3 GB en cuantizacion Q8_0, permite montar un chatbot funcional en minutos con Ollama o `llama.cpp` antes de escalar a modelos mayores.
- Inferencia en el borde y dispositivos sin GPU dedicada: su tamano permite ejecucion en CPU, Raspberry Pi o telefonos, adecuado para demos offline o entornos con recursos limitados.
- Clasificacion y etiquetado de texto ligero: tareas de categorizacion, deteccion de intenciones o enrutado de consultas donde no se requiere un modelo grande.
- Generacion de respuestas en aplicaciones embebidas: integrable en herramientas de escritorio o plugins donde el presupuesto de memoria es minimo.
- Educacion y experimentacion: util como banco de pruebas para estudiar ajuste fino con Unsloth, conversion a GGUF y comparacion de cuantizaciones.
- Preprocesado o reformulacion de texto en pipelines: resumenes breves o normalizacion de entradas antes de pasar a un modelo mayor.
- Pruebas de integracion de `llama.cpp` y Ollama en CI: sirve como modelo de humo para validar cadenas de despliegue sin consumir recursos importantes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en Q8_0, en torno a 0,3-0,4 GB (el repositorio ocupa 0,3 GB); en F16 rondaria los 0,5 GB; en Q4_K_M podria bajar a unos 0,15-0,2 GB (estas dos ultimas no estan publicadas en el repositorio).
- GPU recomendadas: funciona en practicamente cualquier GPU con algo de memoria libre; no requiere A100, H100 ni tarjetas de gama alta.
- Cabe holgadamente en GPU de consumo: GTX 1050/1650, RTX 3060, RTX 4090 e incluso iGPU recientes. Tambien es viable en CPU pura.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-mtmd-cli`), Ollama (Modelfile incluido) y cualquier runtime compatible con GGUF. La compatibilidad con vLLM o TGI no esta confirmada para este artefacto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rev3auth/iris_1.3_cs-lite | ~268 M | no disponible | no disponible | GGUF (Q8_0) | Ajuste de Gemma 3 270M it; repositorio de 0,3 GB |
| Gemma 3 270M (base) | 268 M | hasta 32 000 tokens (documentado para el base) | Gemma license (no confirmada aqui) | safetensors, GGUF | Modelo de origen del que deriva este ajuste |
| Rev3auth/iris-1.3-lite-lora | ~1 000 M | 32 768 tokens (segun el proveedor) | no disponible | LoRA | Variante mayor de la misma familia Iris, basada en `unsloth/gemma-3-1b-it-unsloth-bnb-4bit` |
| Rev3auth/iris | no disponible | no disponible | Apache 2.0 (segun la pagina del modelo) | safetensors | Modelo relacionado de la misma familia |

Los datos de modelos de la familia Iris distintos de `iris_1.3_cs-lite` proceden de paginas de terceros y no deben atribuirse a este checkpoint concreto.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al derivar de Gemma 3 270M, puede heredar los sesgos del modelo base, no evaluados en la informacion disponible.
- Riesgo de alucinacion: elevado en modelos de este tamano; no se aportan evaluaciones de fidelidad ni de veracidad.
- Limitaciones de contexto e idioma: no se especifican la ventana efectiva ni los idiomas soportados, por lo que no puede garantizarse un rendimiento multilingue.
- Licencia: la model card no indica licencia, lo que impide confirmar si el uso comercial esta permitido; debe verificarse con el autor antes de cualquier despliegue en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, y model card minima; se recomienda validar el comportamiento antes de usarlo en produccion.
- Capacidades no confirmadas: no hay evidencia de tool calling, agentes ni vision, pese a la mencion a `llama-mtmd-cli` en la model card.
- Ajuste del token BOS: el propio autor advierte de un cambio en el comportamiento del BOS para compatibilidad con GGUF; conviene revisar la tokenizacion en integraciones propias.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Rev3auth/iris_1.3_cs-lite
- Modelo relacionado iris-1.3-lite: https://huggingface.co/Rev3auth/iris-1.3-lite
- Modelo relacionado iris: https://huggingface.co/Rev3auth/iris
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Ficha en Featherless (iris-1.3-lite-lora): https://featherless.ai/models/Rev3auth/iris-1.3-lite-lora
- Ficha en FriendliAI (iris-1.3-lite-lora): https://friendli.ai/models/Rev3auth/iris-1.3-lite-lora
- Ficha en Free2AITools (iris-1.3-lite): https://free2aitools.com/model/rev3auth/iris-1.3-lite
