# mradermacher/Omega_Sapphira_Joyous-L3.3-70B-v1.1-GGUF

## Resumen

Omega_Sapphira_Joyous-L3.3-70B-v1.1 es un modelo de lenguaje de 70.553 millones de parámetros (70B), desarrollado por cactopus mediante una combinación de modelos con mergekit y la técnica slerp (interpolación lineal esférica). La versión disponible en este repositorio es una cuantización GGUF realizada por mradermacher, pensada para ejecución local con motores como llama.cpp u Ollama. El modelo está orientado a roleplay y escritura de historias, y está etiquetado como unaligned y not-for-all-audiences. Se basa en la arquitectura Llama 3.3, aunque la información disponible no especifica la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.3) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q8_0 (archivos disponibles en el repositorio) |
| Idiomas soportados | Inglés |
| Licencia | llama3.3 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge de pesos mediante la técnica slerp (interpolación lineal esférica), implementada con mergekit. No se dispone de información sobre datos de entrenamiento, ya que no es un modelo entrenado desde cero, sino una fusión de modelos existentes. El repositorio original indica que el modelo base es cactopus/Omega_Sapphira_Joyous-L3.3-70B-v1.1. No se han documentado procesos de RLHF ni DPO. La cuantización GGUF ha sido realizada por mradermacher sobre el modelo base, y los metadatos mencionan que se trata de cuantizaciones estáticas.

## Capacidades

- Generación de texto creativo y narrativo: optimizado para roleplay y storywriting, con estilo conversacional y no alineado.
- Soporte de conversación multi-turno: al ser un modelo de 70B, es capaz de mantener diálogos largos, aunque no se especifica la ventana de contexto.
- No se han documentado capacidades de tool calling, function calling, visión o audio en la información disponible.

## Casos de uso

- Juegos de rol por texto: el modelo puede encarnar personajes con personalidades complejas y mantener coherencia narrativa durante sesiones largas, gracias a su enfoque específico en roleplay.
- Escritura de ficción interactiva: para autores que generan historias ramificadas o colaborativas, donde el modelo propone giros argumentales y diálogos dinámicos.
- Generación de diálogos para guiones: en producción de contenidos audiovisuales, el modelo puede crear diálogos naturales para personajes de series o películas, adaptándose al tono requerido.
- Asistente de escritura creativa: para superar bloqueos, generar ideas, descripciones o escenas complejas, aprovechando su estilo desinhibido y narrativo.
- Simulación de conversaciones de personajes para videojuegos: integrado en motores de juego, puede dar vida a personajes no jugadores con respuestas coherentes en entornos narrativos.
- Creación de contenido para mundos de ficción: generación de lore, historias de fondo y mitologías para campañas de rol o proyectos de worldbuilding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q2_K (26.5 GB): ~35 GB de VRAM para contextos cortos.
  - Q4_K_S (40.4 GB): ~48 GB de VRAM para contextos cortos, recomendado para equilibrio entre calidad y memoria.
  - Q8_0 (75.1 GB): ~85 GB de VRAM, requiere GPU de alto nivel o múltiples tarjetas.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones con múltiples RTX 4090 (24 GB cada una) para offload parcial.
- Ejecución en CPU: posible con llama.cpp, aunque con latencia significativamente mayor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Omega_Sapphira_Joyous-L3.3-70B-v1.1 (base) | 70B | No disponible | llama3.3 | Safetensors |
| Omega_Sapphira_Joyous-L3.3-70B-v1.1-GGUF (este) | 70B | No disponible | llama3.3 | GGUF |
| Omega-Sapphira-L3.3-70B-v1.3-i1-GGUF | 70B | No disponible | llama3.3 | GGUF |
| Omega_Sapphira_Joyous-L3.3-70B-v1.0-i1-GGUF | 70B | No disponible | llama3.3 | GGUF |

Todas las alternativas listadas pertenecen a la misma familia de merges Llama 3.3 de 70B, orientadas a roleplay y escritura. No se disponen de benchmarks comparativos.

## Limitaciones y advertencias

- Modelo no alineado (unaligned) y etiquetado como not-for-all-audiences: puede generar contenido explícito, ofensivo o dañino sin filtros.
- Riesgo de alucinaciones, especialmente en hechos, matemáticas o información técnica, ya que está optimizado para creatividad y narrativa.
- No se han documentado evaluaciones de seguridad ni benchmarks, lo que dificulta su uso en entornos sensibles o de producción sin supervisión.
- Licencia llama3.3: requiere incluir la atribución correspondiente y puede tener restricciones adicionales; se debe revisar antes de un uso comercial.
- El proceso de merge mediante slerp puede degradar el rendimiento en tareas no creativas, como razonamiento estructurado o generación de código.
- Limitado al inglés según la información disponible, lo que reduce su aplicabilidad en proyectos multilingües.

## Enlaces

- Repositorio del modelo GGUF: https://huggingface.co/mradermacher/Omega_Sapphira_Joyous-L3.3-70B-v1.1-GGUF
- Modelo base original: https://huggingface.co/cactopus/Omega_Sapphira_Joyous-L3.3-70B-v1.1
- Versión i1-GGUF v1.0: https://huggingface.co/mradermacher/Omega_Sapphira_Joyous-L3.3-70B-v1.0-i1-GGUF
- Versión i1-GGUF v1.3: https://huggingface.co/mradermacher/Omega-Sapphira-L3.3-70B-v1.3-i1-GGUF
- Página de descargas alternativa: https://hf.tst.eu/model#Omega_Sapphira_Joyous-L3.3-70B-v1.1-GGUF
- FAQ de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
