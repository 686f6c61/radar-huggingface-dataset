# lugman/LFM2.5-350M-SmolDataEnv-Matched2.8K-Dagger1.7K-adapter

## Resumen

El modelo `lugman/LFM2.5-350M-SmolDataEnv-Matched2.8K-Dagger1.7K-adapter` es un ajuste fino (fine-tuning) del modelo base LiquidAI/LFM2.5-350M, publicado por el usuario lugman en Hugging Face. Se trata de un adaptador derivado de un modelo de lenguaje de 350 millones de parametros desarrollado originalmente por Liquid AI, entrenado con la libreria Unsloth y la pila TRL de Hugging Face. El nombre del repositorio sugiere que el entrenamiento se realizo sobre un conjunto de datos denominado "SmolDataEnv", con un subconjunto "Matched2.8K" y otro "Dagger1.7K", probablemente orientado a tareas de agente o entorno interactivo.

El modelo hereda la arquitectura LFM2 (Liquid Foundation Model 2) del modelo base, aunque la model card no proporciona detalles tecnicos adicionales sobre la misma. La relevancia de esta publicacion es limitada: cuenta con cero descargas y cero likes en el momento de la consulta, el repositorio tiene un tamano de 0.0 GB (lo que sugiere que los pesos no estan efectivamente subidos o son de un adaptador minimo), y la documentacion es practicamente inexistente mas alla de la plantilla autogenerada por Unsloth.

En la practica, esta ficha debe interpretarse como una referencia de un experimento de ajuste fino comunitario de un modelo pequeno, no como un modelo listo para produccion. La informacion disponible es muy escasa y la mayoria de los parametros tecnicos del modelo base no se detallan en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (heredada del modelo base LiquidAI/LFM2.5-350M); detalles no disponibles |
| Parametros totales | 350M (segun el nombre del modelo base); no confirmado en la model card |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tag de la libreria transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base LFM2.5-350M. Por el nombre y la familia LFM2 de Liquid AI, se trata de un transformer de 350 millones de parametros, pero no se confirma en la informacion proporcionada si emplea attention lineal, atencion hibrida u otras innovaciones propias de la familia LFM. No se dispone de datos sobre el numero de tokens de entrenamiento del modelo base ni sobre la composicion del dataset original.

Respecto al ajuste fino, la model card indica que fue entrenado con Unsloth (que afirma un entrenamiento 2x mas rapido) y que utiliza las librerias transformers, TRL y text-generation-inference. El nombre del repositorio sugiere un entrenamiento sobre datos de entorno ("SmolDataEnv") con subconjuntos etiquetados como "Matched2.8K" y "Dagger1.7K", lo que apunta a un posible escenario de aprendizaje por imitacion o agentes (DAgger es un algoritmo de aprendizaje por imitacion interactivo). No se especifica si hubo RLHF, DPO ni el numero de pasos o tokens de entrenamiento del adaptador.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base LFM2.5-350M.
- Posible orientacion a tareas de agente o interaccion con entornos, segun el nombre del dataset ("SmolDataEnv", "Dagger"), aunque no se documenta explicitamente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el nombre del repositorio sugiere entrenamiento para entornos, pero no hay evidencia documentada.
- Capacidades multilingues: solo se declara ingles (`en`).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Experimentacion con ajuste fino de modelos pequenos: el modelo sirve como referencia para reproducir un pipeline de fine-tuning con Unsloth y TRL sobre un modelo de 350M, util para investigadores que quieran validar recetas de entrenamiento.
- Investigacion en aprendizaje por imitacion: el nombre "Dagger" sugiere un uso en experimentos de agentes que aprenden de demostraciones, adecuado para prototipos academicos de entornos simulados.
- Pruebas de integracion con text-generation-inference: al estar etiquetado para TGI, puede emplearse para validar despliegues de modelos pequenos en infraestructura de inferencia.
- Generacion de texto basica en ingles: para tareas de completado o resumen simple en prototipos, dado su tamano reducido y bajo coste de inferencia.
- Base para nuevos ajustes finos: al ser un adaptador sobre LFM2.5-350M con licencia apache-2.0, puede servir como punto de partida para otros experimentos comunitarios.
- Evaluacion comparativa de adaptadores: util para estudiar el efecto de datasets especificos ("Matched2.8K", "Dagger1.7K") sobre el comportamiento de un modelo base pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 350M en fp16 se estiman aproximadamente 0,7 GB de pesos, y en cuantizacion de 4 bits en torno a 0,2-0,3 GB, aunque estos calculos no estan confirmados por el autor.
- GPU recomendadas: no disponible; por tamano, cabria en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- Cabe en consumer GPU: previsiblemente si, dado el tamano de 350M, aunque no hay confirmacion oficial.
- Opciones de despliegue: text-generation-inference (tag), transformers; llama.cpp, Ollama o vLLM no estan confirmados para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lugman/LFM2.5-350M-SmolDataEnv-Matched2.8K-Dagger1.7K-adapter | 350M (base) | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM2.5-350M (modelo base) | 350M | no disponible | no disponible en esta ficha | Hugging Face |
| SmolLM2-360M (Hugging Face) | 360M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Qwen2.5-0.5B | 500M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa fiable. La comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es una plantilla autogenerada por Unsloth sin detalles de entrenamiento, datos o evaluacion.
- Repositorio de 0.0 GB: es posible que los pesos del adaptador no esten subidos o sean incompletos; conviene verificar antes de usarlo.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Solo idioma ingles declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion inherente a modelos de 350M, especialmente en tareas de razonamiento complejo.
- No se documentan sesgos conocidos, pero al derivar de un modelo base no evaluado en esta ficha, no pueden descartarse.
- Licencia apache-2.0 permite uso comercial, pero al ser un adaptador comunitario sin evaluacion, no se recomienda su uso en produccion sin validacion previa.
- El nombre del dataset ("Dagger") sugiere un entrenamiento especifico de agentes; su comportamiento fuera de ese dominio es desconocido.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-SmolDataEnv-Matched2.8K-Dagger1.7K-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
