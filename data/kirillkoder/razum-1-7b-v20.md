# KirillKoder/razum-1.7b-v20

## Resumen

Razum v20 es un ajuste fino de tipo LoRA sobre el modelo base Qwen3-1.7B, desarrollado por el usuario KirillKoder y publicado en HuggingFace. Se trata de una modelo de chat orientada exclusivamente al ruso, cuyo rasgo diferencial es una persona fija ("Razum") codificada en los pesos: el modelo se presenta a si mismo con esa identidad y responde con un caracter definido. El repositorio distribuye tanto el adaptador LoRA como la version fusionada en formato GGUF, lo que permite ejecucion en CPU sin GPU dedicada.

El modelo resuelve un caso de uso muy concreto: asistentes conversacionales en ruso con una personalidad consistente y un coste de despliegue minimo. Con 2.031.739.904 parametros totales (1.7B nominales) y un contexto de 8192 tokens, esta pensado para entornos con recursos limitados, como portatiles o servidores pequenos. La licencia Apache 2.0 y el formato GGUF facilitan su integracion en herramientas como llama.cpp, LM Studio u Ollama.

Su relevancia actual es limitada pero clara: demuestra el patron de especializacion de modelos pequenos mediante LoRA para nichos linguisticos y de personalidad, con un empaquetado que prioriza la facilidad de despliegue sobre el rendimiento bruto. No obstante, al ser una version temprana (v20) y con solo 85 descargas, su madurez y validacion son escasas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B), ajuste mediante LoRA |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); el adaptador LoRA se distribuye en GGUF (~140 MB) |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo fusionado y adaptador LoRA); safetensors para los pesos base segun el repo |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only con atencion causal estandar. Sobre esta base se aplica un adaptador LoRA que incorpora la persona "Razum" y el ajuste conversacional en ruso. El repositorio no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible en la model card.

La innovacion tecnica destacable no reside en la arquitectura, sino en el empaquetado: se ofrece el modelo fusionado en un unico archivo GGUF Q4_K_M (~1.3 GB) y, alternativamente, la base Qwen3-1.7B en Q4_K_M junto con el adaptador LoRA en GGUF (~140 MB), que se aplica en tiempo de inferencia con llama.cpp. Tambien se incluye un archivo `SYSTEM_PROMPT.md` con el prompt de sistema recomendado para reproducir el comportamiento de produccion. No se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ruso con una persona fija ("Razum").
- Respuesta a instrucciones y mantenimiento de conversaciones multi-turno dentro de la ventana de 8192 tokens.
- Ajuste de comportamiento mediante system prompt (se recomienda el incluido en `SYSTEM_PROMPT.md`).
- Ejecucion en CPU mediante llama.cpp, sin necesidad de GPU.
- Compatibilidad con API estilo OpenAI a traves de `llama-server`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Capacidad multilingue limitada al ruso segun la model card.

## Casos de uso

- Asistente conversacional en ruso para aplicaciones de chat: el modelo mantiene una persona consistente y responde en ruso dentro de un contexto de 8192 tokens, adecuado para dialogos de soporte o acompanamiento.
- Despliegue en dispositivos sin GPU: al ejecutarse en CPU con ~2 GB de RAM (probado en un i3), sirve para prototipos, demos o entornos embebidos donde no hay acelerador dedicado.
- Chatbot con identidad de marca: la persona codificada en los pesos permite ofrecer un asistente con caracter definido sin depender exclusivamente del system prompt.
- Integracion via API compatible con OpenAI: usando `llama-server` en el puerto 8080, se puede conectar a clientes existentes que hablen el protocolo OpenAI para pruebas internas.
- Educacion y practica de ruso: como interlocutor conversacional en ruso para ejercicios de idioma, con la advertencia de posibles errores factuales.
- Experimentacion con LoRA: el par base + adaptador en GGUF sirve para estudiar el efecto de un adaptador de personalidad sobre Qwen3-1.7B y comparar con la base sin ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~2 GB de RAM para el modelo fusionado Q4_K_M (~1.3 GB de archivo mas overhead); ejecucion en CPU verificada por el autor en un portatil con i3.
- GPU recomendadas: no se especifican; al ser un modelo de 1.7B en Q4_K_M, cabe en practicamente cualquier GPU consumer con 4 GB o mas de VRAM, aunque el autor lo orienta a CPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos ~2-4 GB de VRAM libre (por ejemplo, GTX 1650, RTX 3050 en adelante), aunque no se documentan pruebas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), LM Studio, Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Razum v20 (este modelo) | 2.03B | 8192 | Ruso | Apache 2.0 | GGUF (fusionado y LoRA) |
| Qwen3-1.7B (base) | 1.7B | no disponible en la informacion | Multilingue | Apache 2.0 | safetensors, GGUF |
| Modelos de chat rusos de tamano similar | no disponible | no disponible | Ruso | no disponible | no disponible |

La comparativa directa con alternativas rusas de tamano similar no esta disponible en la informacion proporcionada. Frente a su base Qwen3-1.7B, la diferencia principal es la persona fija y el ajuste al ruso, a costa de perder la cobertura multilingue del modelo original.

## Limitaciones y advertencias

- Modelo pequeno (1.7B): el propio autor advierte de posibles errores factuales, especialmente en fechas, capitales y hechos poco frecuentes.
- Version temprana (v20): el autor indica que el caracter y los conocimientos mejoraran en futuras versiones, por lo que no es estable para produccion critica.
- Idioma limitado al ruso: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion elevado por el tamano reducido del modelo y la falta de benchmarks que lo cuantifiquen.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3-1.7B y de un ajuste LoRA no auditado, pueden persistir sesgos del base y del dataset de ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Sin datos de benchmarks ni evaluaciones independientes: la calidad real no esta verificada mas alla de las pruebas del autor.
- Madurez baja: 85 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/KirillKoder/razum-1.7b-v20
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- llama.cpp (formato GGUF y ejecucion): https://github.com/ggerganov/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
